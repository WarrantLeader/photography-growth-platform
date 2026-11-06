"""Standalone CRM invoice API. No provider or payment secret enters the browser."""
import asyncio
import hashlib
import hmac
import json
import os
import sqlite3
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated

import httpx
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, StrictBool

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
STRIPE_KEY = os.getenv("STRIPE_SECRET_KEY", "")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
ALLOWED_USERS = {x.strip() for x in os.getenv("INVOICE_ADMIN_USER_IDS", "").split(",") if x.strip()}
DB_PATH = os.getenv("INVOICE_DB_PATH", "/data/invoices.sqlite3")
API_VERSION = "2026-10-28.endive"
app = FastAPI(title="Mr T Captures Invoice API", docs_url=None, redoc_url=None)
origins = [x.strip() for x in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",") if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET", "POST", "PUT"], allow_headers=["Authorization", "Content-Type"])
send_lock = asyncio.Lock()


def db():
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=20)
    conn.row_factory = sqlite3.Row
    conn.execute("CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY, owner TEXT NOT NULL, payload TEXT NOT NULL, stripe_id TEXT UNIQUE, customer_id TEXT, sent_at TEXT)")
    return conn


def now():
    return datetime.now(timezone.utc).isoformat()


class Line(BaseModel):
    description: str = Field(min_length=1, max_length=200)
    quantity: int = Field(ge=1, le=1000, strict=True)
    unit_amount: int = Field(ge=1, le=10_000_000, strict=True)


class Draft(BaseModel):
    client_name: str = Field(min_length=1, max_length=120)
    client_email: EmailStr
    project: str = Field(default="", max_length=160)
    days_until_due: int = Field(default=14, ge=1, le=90, strict=True)
    notes: str = Field(default="", max_length=1000)
    items: list[Line] = Field(min_length=1, max_length=20)

    def total(self):
        value = sum(line.quantity * line.unit_amount for line in self.items)
        if value > 99_999_999:
            raise HTTPException(422, "Invoice total exceeds the supported limit.")
        return value


class SendConfirmation(BaseModel):
    confirm: StrictBool


async def identity(authorization: Annotated[str | None, Header()] = None):
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(503, "Authentication has not been configured on the invoice server.")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Sign in to continue.")
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(SUPABASE_URL + "/auth/v1/user", headers={"apikey": SUPABASE_KEY, "Authorization": authorization})
    except httpx.HTTPError:
        raise HTTPException(503, "Authentication is temporarily unavailable.")
    if response.status_code != 200:
        raise HTTPException(401, "Your session has expired. Sign in again.")
    user = response.json()
    # Explicit server-side allowlist: provider login alone grants no invoice access.
    if not user.get("id") or user["id"] not in ALLOWED_USERS:
        raise HTTPException(403, "Your account does not have invoice administrator access.")
    return user["id"]


def owned(invoice_id, owner):
    with db() as conn:
        row = conn.execute("SELECT * FROM invoices WHERE id=? AND owner=?", (invoice_id, owner)).fetchone()
    if not row:
        raise HTTPException(404, "Invoice not found.")
    return dict(row)


def store(invoice_id, payload, *, stripe_id=None, customer_id=None, sent_at=None):
    with db() as conn:
        conn.execute("UPDATE invoices SET payload=?, stripe_id=COALESCE(?,stripe_id), customer_id=COALESCE(?,customer_id), sent_at=COALESCE(?,sent_at) WHERE id=?", (json.dumps(payload), stripe_id, customer_id, sent_at, invoice_id))


async def stripe(method, path, data=None, key=None):
    if not STRIPE_KEY:
        raise HTTPException(503, "Stripe has not been connected. No invoice was sent.")
    headers = {"Stripe-Version": API_VERSION}
    if key:
        headers["Idempotency-Key"] = key
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.request(method, "https://api.stripe.com/v1/" + path, data=data, auth=(STRIPE_KEY, ""), headers=headers)
    except httpx.HTTPError:
        raise HTTPException(502, "Stripe is temporarily unavailable. Retry this invoice without creating a new draft.")
    if response.status_code >= 400:
        raise HTTPException(502, "Stripe could not process this request. Check the Stripe dashboard, then retry this invoice.")
    return response.json()


def stripe_state(payload, invoice):
    payload.update(status=invoice["status"], hosted_invoice_url=invoice.get("hosted_invoice_url"), invoice_pdf=invoice.get("invoice_pdf"), livemode=invoice.get("livemode", False))
    return payload


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/invoices")
async def list_invoices(owner=Depends(identity)):
    with db() as conn:
        records = conn.execute("SELECT payload FROM invoices WHERE owner=? ORDER BY rowid DESC", (owner,)).fetchall()
    return [json.loads(r["payload"]) for r in records]


@app.post("/api/invoices", status_code=201)
async def create_invoice(draft: Draft, owner=Depends(identity)):
    invoice_id = str(uuid.uuid4())
    total = draft.total()
    with db() as conn:
        conn.execute("BEGIN IMMEDIATE")
        seq = conn.execute("SELECT COALESCE(MAX(rowid),0)+1 FROM invoices").fetchone()[0]
        number = f"MTC-{datetime.now(timezone.utc).year}-{seq:05d}"
        payload = {**draft.model_dump(mode="json"), "id": invoice_id, "number": number, "status": "draft", "total": total, "created": now()}
        conn.execute("INSERT INTO invoices(id,owner,payload) VALUES(?,?,?)", (invoice_id, owner, json.dumps(payload)))
    return payload


@app.put("/api/invoices/{invoice_id}")
async def edit_invoice(invoice_id: str, draft: Draft, owner=Depends(identity)):
    async with send_lock:
        row = owned(invoice_id, owner)
        old = json.loads(row["payload"])
        if old["status"] != "draft" or row["stripe_id"] or row["customer_id"]:
            raise HTTPException(409, "This invoice has entered Stripe processing and cannot be edited. Retry sending it or manage it in Stripe.")
        payload = {**old, **draft.model_dump(mode="json"), "total": draft.total()}
        store(invoice_id, payload)
    return payload


@app.post("/api/invoices/{invoice_id}/send")
async def send_invoice(invoice_id: str, confirmation: SendConfirmation, owner=Depends(identity)):
    if confirmation.confirm is not True:
        raise HTTPException(422, "Review and confirm the invoice before sending.")
    if not STRIPE_KEY or not WEBHOOK_SECRET:
        raise HTTPException(503, "Connect Stripe and its signed webhook before sending invoices.")
    async with send_lock:
        row = owned(invoice_id, owner)
        payload = json.loads(row["payload"])
        if row["sent_at"] or payload["status"] in {"paid", "void", "uncollectible"}:
            return payload
        # Freeze editing before the first outbound API call, including after a timeout.
        if not row["customer_id"]:
            store(invoice_id, payload, customer_id="pending")
            customer = await stripe("POST", "customers", {"name": payload["client_name"], "email": payload["client_email"], "metadata[crm_invoice_id]": invoice_id}, "crm-customer-" + invoice_id)
            store(invoice_id, payload, customer_id=customer["id"])
            row["customer_id"] = customer["id"]
        elif row["customer_id"] == "pending":
            customer = await stripe("POST", "customers", {"name": payload["client_name"], "email": payload["client_email"], "metadata[crm_invoice_id]": invoice_id}, "crm-customer-" + invoice_id)
            store(invoice_id, payload, customer_id=customer["id"])
            row["customer_id"] = customer["id"]
        if not row["stripe_id"]:
            invoice = await stripe("POST", "invoices", {"customer": row["customer_id"], "collection_method": "send_invoice", "days_until_due": str(payload["days_until_due"]), "auto_advance": "false", "pending_invoice_items_behavior": "exclude", "payment_settings[payment_method_types][0]": "card", "description": payload["project"], "footer": payload["notes"], "metadata[crm_invoice_id]": invoice_id, "metadata[crm_reference]": payload["number"]}, "crm-invoice-" + invoice_id)
            row["stripe_id"] = invoice["id"]
            store(invoice_id, payload, stripe_id=invoice["id"])
        invoice = await stripe("GET", "invoices/" + row["stripe_id"])
        if invoice["status"] == "draft":
            for n, line in enumerate(payload["items"]):
                await stripe("POST", "invoiceitems", {"customer": row["customer_id"], "invoice": row["stripe_id"], "currency": "gbp", "amount": str(line["unit_amount"] * line["quantity"]), "description": f"{line['description']} ({line['quantity']} × GBP {line['unit_amount']/100:.2f})"}, f"crm-item-{invoice_id}-{n}")
            check = await stripe("GET", "invoices/" + row["stripe_id"])
            if check["total"] != payload["total"] or check["currency"] != "gbp":
                raise HTTPException(409, "Stripe total differs from the reviewed draft. Check the invoice in Stripe before sending.")
            invoice = await stripe("POST", "invoices/" + row["stripe_id"] + "/finalize", {"auto_advance": "false"}, "crm-finalize-" + invoice_id)
        stripe_state(payload, invoice)
        store(invoice_id, payload)
        if invoice["status"] == "open":
            invoice = await stripe("POST", "invoices/" + row["stripe_id"] + "/send", key="crm-send-" + invoice_id)
        stripe_state(payload, invoice)
        payload["sent_at"] = now()
        store(invoice_id, payload, sent_at=payload["sent_at"])
        return payload


def verify_signature(raw: bytes, signature: str):
    if not WEBHOOK_SECRET:
        raise HTTPException(503, "Webhook is not configured.")
    try:
        fields = [p.split("=", 1) for p in signature.split(",")]
        timestamp = next(v for k, v in fields if k == "t")
        signatures = [v for k, v in fields if k == "v1"]
        if abs(time.time() - int(timestamp)) > 300:
            raise ValueError()
        expected = hmac.new(WEBHOOK_SECRET.encode(), timestamp.encode() + b"." + raw, hashlib.sha256).hexdigest()
        if not any(hmac.compare_digest(expected, s) for s in signatures):
            raise ValueError()
    except (ValueError, StopIteration):
        raise HTTPException(400, "Invalid webhook signature.")


@app.post("/api/stripe/webhook")
async def webhook(request: Request, stripe_signature: Annotated[str, Header()] = ""):
    raw = await request.body()
    if len(raw) > 1_000_000:
        raise HTTPException(413, "Webhook payload too large.")
    verify_signature(raw, stripe_signature)
    try:
        event = json.loads(raw)
    except ValueError:
        raise HTTPException(400, "Invalid webhook body.")
    if event.get("type") not in {"invoice.paid", "invoice.payment_failed", "invoice.voided", "invoice.marked_uncollectible", "invoice.sent"}:
        return {"received": True}
    stripe_id = event.get("data", {}).get("object", {}).get("id")
    async with send_lock:
        with db() as conn:
            row = conn.execute("SELECT id,payload FROM invoices WHERE stripe_id=?", (stripe_id,)).fetchone()
        if row:
            # Read the current object to avoid applying stale/out-of-order events.
            invoice = await stripe("GET", "invoices/" + stripe_id)
            store(row["id"], stripe_state(json.loads(row["payload"]), invoice))
    return {"received": True}
