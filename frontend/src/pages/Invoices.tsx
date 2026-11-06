import { useEffect, useState } from "react";
import { PageTitle, Metric, Badge, Icon, Modal, Empty } from "../components/UI";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../auth/client";
import { uid } from "../state/StudioContext";
type Line = { description: string; quantity: number; unit_amount: number };
type Invoice = {
  id: string;
  number: string;
  client_name: string;
  client_email: string;
  project: string;
  days_until_due: number;
  notes: string;
  items: Line[];
  status: string;
  total: number;
  created: string;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  livemode?: boolean;
  sent_at?: string;
};
const amount = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    n / 100,
  );
const total = (items: Line[]) =>
  items.reduce((s, x) => s + x.quantity * x.unit_amount, 0);
export default function Invoices() {
  const auth = useAuth();
  const demo = !!auth?.demo;
  const key = "mrt-demo-invoices-v1";
  const [rows, R] = useState<Invoice[]>([]),
    [loading, L] = useState(false),
    [error, E] = useState(""),
    [note, N] = useState(""),
    [filter, F] = useState("All"),
    [query, Q] = useState(""),
    [editor, A] = useState<Invoice | null | undefined>(undefined),
    [view, V] = useState<Invoice | null>(null),
    [review, S] = useState<Invoice | null>(null),
    [busy, B] = useState(false);
  async function load() {
    L(true);
    E("");
    try {
      if (demo) {
        const saved = JSON.parse(localStorage.getItem(key) || "[]");
        R(Array.isArray(saved) ? saved : []);
      } else R(await apiRequest("/api/invoices"));
    } catch (e) {
      E(e instanceof Error ? e.message : "Invoices could not be loaded.");
    } finally {
      L(false);
    }
  }
  useEffect(() => {
    load();
  }, [demo]);
  function update(i: Invoice) {
    R((s) => {
      const next = s.some((x) => x.id === i.id)
        ? s.map((x) => (x.id === i.id ? i : x))
        : [i, ...s];
      if (demo) localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }
  async function save(
    payload: Omit<Invoice, "id" | "number" | "status" | "total" | "created">,
  ) {
    E("");
    B(true);
    try {
      if (demo) {
        const invoice: Invoice = {
          ...payload,
          id: editor?.id || uid(),
          number:
            editor?.number ||
            "DEMO-" + String(rows.length + 1).padStart(3, "0"),
          status: "draft",
          total: total(payload.items),
          created: editor?.created || new Date().toISOString(),
        };
        update(invoice);
      } else
        update(
          await apiRequest(
            editor ? "/api/invoices/" + editor.id : "/api/invoices",
            { method: editor ? "PUT" : "POST", body: JSON.stringify(payload) },
          ),
        );
      A(undefined);
      N("Invoice draft saved. Review it before sending.");
    } catch (e) {
      E(e instanceof Error ? e.message : "Invoice could not be saved.");
    } finally {
      B(false);
    }
  }
  async function send() {
    if (!review || demo) return;
    B(true);
    E("");
    try {
      const result = await apiRequest("/api/invoices/" + review.id + "/send", {
        method: "POST",
        body: JSON.stringify({ confirm: true }),
      });
      update(result);
      V(result);
      S(null);
      N(
        result.livemode
          ? "Stripe accepted the send request. Delivery is handled by Stripe."
          : "Test invoice created. Stripe test mode does not email clients.",
      );
    } catch (e) {
      E(e instanceof Error ? e.message : "Invoice could not be sent.");
    } finally {
      B(false);
    }
  }
  const shown = rows.filter(
    (i) =>
      (filter === "All" || i.status === filter.toLowerCase()) &&
      (i.number + " " + i.client_name + " " + i.project)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title="Invoices"
        description="From a great shoot to a paid invoice."
        action={
          <button
            className="primary"
            onClick={() => {
              E("");
              A(null);
            }}
          >
            <Icon name="plus" size={16} />
            Create invoice
          </button>
        }
      />
      <div className="metrics three">
        <Metric
          title="Draft value"
          value={amount(
            rows
              .filter((i) => i.status === "draft")
              .reduce((s, i) => s + i.total, 0),
          )}
          detail="Ready for your review"
          icon="file"
        />
        <Metric
          title="Outstanding"
          value={amount(
            rows
              .filter((i) => i.status === "open")
              .reduce((s, i) => s + i.total, 0),
          )}
          detail="Open invoices awaiting payment"
        />
        <Metric
          title="Paid"
          value={amount(
            rows
              .filter((i) => i.status === "paid")
              .reduce((s, i) => s + i.total, 0),
          )}
          detail="Confirmed by Stripe"
          icon="check"
        />
      </div>
      <div className="invoice-payment-banner">
        <div className="payment-mark">
          <Icon name="file" size={26} />
        </div>
        <div>
          <h2>One invoice. An easier way to pay.</h2>
          <p>
            Stripe sends your client a hosted invoice with card payments and
            Apple Pay on eligible devices.
          </p>
        </div>
        <span className="wallet-label">Apple Pay</span>
      </div>
      {demo && (
        <div className="notice">
          Demo mode: create and preview invoice drafts. Sending, payment links
          and payment status need your connected Stripe account and backend. No
          money is collected here.
        </div>
      )}
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      {note && (
        <div className="file-message" role="status">
          {note}
        </div>
      )}
      <div className="invoice-toolbar">
        <div className="tabs">
          {["All", "Draft", "Open", "Paid"].map((s) => (
            <button
              className={filter === s ? "selected" : ""}
              key={s}
              onClick={() => F(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="search">
          <Icon name="search" size={16} />
          <input
            value={query}
            onChange={(e) => Q(e.target.value)}
            placeholder="Find an invoice..."
            aria-label="Search invoices"
          />
        </div>
        <button
          className="icon-button outlined"
          onClick={load}
          aria-label="Refresh invoices"
        >
          <Icon name="refresh" size={16} />
        </button>
      </div>
      <section className="panel no-pad">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>INVOICE</th>
                <th>CLIENT</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((i) => (
                <tr key={i.id}>
                  <td>
                    <b>{i.number}</b>
                    <small className="invoice-project">
                      {i.project || "Photography services"}
                    </small>
                  </td>
                  <td>
                    {i.client_name}
                    <small className="invoice-project">{i.client_email}</small>
                  </td>
                  <td>{amount(i.total)}</td>
                  <td>
                    <Badge status={i.status} />
                  </td>
                  <td>
                    <button className="text-link" onClick={() => V(i)}>
                      View
                      <Icon name="chevron" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading ? (
          <div className="empty">
            <p>Loading invoices…</p>
          </div>
        ) : (
          !shown.length && (
            <Empty
              title="Your next invoice starts here"
              description="Add your client, line items and payment terms. Preview everything before sending."
            />
          )
        )}
      </section>
      {editor !== undefined && (
        <InvoiceEditor
          invoice={editor}
          onClose={() => A(undefined)}
          onSave={save}
          busy={busy}
          error={error}
        />
      )}{" "}
      {view && (
        <Modal title={view.number} onClose={() => V(null)}>
          <div className="invoice-preview">
            <div className="invoice-brand">
              <b>mr t captures</b>
              <span>INVOICE</span>
            </div>
            <div className="invoice-client">
              <div>
                <small>BILL TO</small>
                <h3>{view.client_name}</h3>
                <p>{view.client_email}</p>
              </div>
              <Badge status={view.status} />
            </div>
            <p>{view.project}</p>
            <div className="invoice-lines">
              {view.items.map((l, i) => (
                <div key={i}>
                  <span>
                    {l.description}
                    <small>
                      {l.quantity} × {amount(l.unit_amount)}
                    </small>
                  </span>
                  <b>{amount(l.quantity * l.unit_amount)}</b>
                </div>
              ))}
            </div>
            <div className="invoice-total">
              <span>Total · GBP</span>
              <b>{amount(view.total)}</b>
            </div>
            <p className="small-note">
              Payment terms: {view.days_until_due} days from issue. {view.notes}
            </p>
            {view.status === "draft" && (
              <div className="form-actions">
                <button
                  className="secondary"
                  onClick={() => {
                    A(view);
                    V(null);
                  }}
                >
                  Edit draft
                </button>
                <button
                  className="primary"
                  disabled={demo}
                  onClick={() => {
                    S(view);
                    V(null);
                  }}
                >
                  <Icon name="arrow" size={15} />
                  Review & send
                </button>
              </div>
            )}
            {demo && (
              <p className="small-note">
                Demo draft. No payment link has been generated and no email has
                been sent.
              </p>
            )}
            {view.hosted_invoice_url && (
              <div className="form-actions">
                <a
                  className="primary"
                  href={view.hosted_invoice_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open payment page
                  <Icon name="arrow" size={15} />
                </a>
                {view.invoice_pdf && (
                  <a
                    className="secondary"
                    href={view.invoice_pdf}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Invoice PDF
                  </a>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
      {review && (
        <Modal title="Review before sending" onClose={() => !busy && S(null)}>
          <p>Send {review.number} to:</p>
          <div className="invoice-send-summary">
            <b>{review.client_name}</b>
            <p>{review.client_email}</p>
            <strong>{amount(review.total)}</strong>
            <small>Due {review.days_until_due} days after issue</small>
          </div>
          <p>
            Stripe will finalise this invoice and request email delivery. Test
            mode creates a test invoice without sending an email.
          </p>
          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}
          <div className="form-actions">
            <button
              className="secondary"
              disabled={busy}
              onClick={() => S(null)}
            >
              Cancel
            </button>
            <button className="primary" disabled={busy} onClick={send}>
              {busy ? "Sending…" : "Confirm & send invoice"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function InvoiceEditor({
  invoice,
  onClose,
  onSave,
  busy,
  error,
}: {
  invoice: Invoice | null;
  onClose: () => void;
  onSave: (
    p: Omit<Invoice, "id" | "number" | "status" | "total" | "created">,
  ) => void;
  busy: boolean;
  error: string;
}) {
  const [lines, S] = useState<Line[]>(
    invoice?.items || [
      { description: "Event photography", quantity: 1, unit_amount: 25000 },
    ],
  );
  function set(i: number, field: keyof Line, value: string) {
    S((s) =>
      s.map((l, n) =>
        n === i
          ? {
              ...l,
              [field]:
                field === "description"
                  ? value
                  : field === "unit_amount"
                    ? Math.round(Number(value) * 100)
                    : Number(value),
            }
          : l,
      ),
    );
  }
  return (
    <Modal
      title={invoice ? "Edit invoice draft" : "Create an invoice"}
      onClose={() => !busy && onClose()}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          onSave({
            client_name: String(f.get("client_name")).trim(),
            client_email: String(f.get("client_email")).trim(),
            project: String(f.get("project")).trim(),
            days_until_due: Number(f.get("days")),
            notes: String(f.get("notes")).trim(),
            items: lines,
          });
        }}
      >
        <div className="form-grid">
          <label>
            Client name
            <input
              name="client_name"
              required
              maxLength={120}
              defaultValue={invoice?.client_name}
            />
          </label>
          <label>
            Client email
            <input
              type="email"
              name="client_email"
              required
              defaultValue={invoice?.client_email}
            />
          </label>
          <label>
            Project or event
            <input
              name="project"
              maxLength={160}
              defaultValue={invoice?.project}
            />
          </label>
          <label>
            Payment terms
            <select name="days" defaultValue={invoice?.days_until_due || 14}>
              {[7, 14, 30].map((n) => (
                <option value={n} key={n}>
                  {n} days
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="invoice-editor-lines">
          <div className="panel-heading">
            <h3>Line items</h3>
            <button
              type="button"
              className="text-link"
              disabled={lines.length >= 20}
              onClick={() =>
                S((s) => [
                  ...s,
                  { description: "", quantity: 1, unit_amount: 0 },
                ])
              }
            >
              <Icon name="plus" size={14} />
              Add item
            </button>
          </div>
          {lines.map((l, i) => (
            <div className="invoice-editor-line" key={i}>
              <label>
                Service
                <input
                  required
                  aria-label={"Item " + (i + 1) + " description"}
                  value={l.description}
                  maxLength={200}
                  onChange={(e) => set(i, "description", e.target.value)}
                />
              </label>
              <label>
                Qty
                <input
                  type="number"
                  min="1"
                  max="1000"
                  step="1"
                  required
                  value={l.quantity}
                  onChange={(e) => set(i, "quantity", e.target.value)}
                />
              </label>
              <label>
                Price (£)
                <input
                  type="number"
                  min="0.01"
                  max="100000"
                  step="0.01"
                  required
                  defaultValue={(l.unit_amount / 100).toFixed(2)}
                  onChange={(e) => set(i, "unit_amount", e.target.value)}
                />
              </label>
              <button
                className="icon-button"
                type="button"
                disabled={lines.length === 1}
                aria-label={"Remove item " + (i + 1)}
                onClick={() => S((s) => s.filter((_, n) => n !== i))}
              >
                <Icon name="close" size={14} />
              </button>
            </div>
          ))}
        </div>
        <label>
          Client notes
          <textarea
            name="notes"
            rows={2}
            maxLength={1000}
            defaultValue={invoice?.notes}
          />
        </label>
        <div className="invoice-total">
          <span>Total · GBP</span>
          <b>{amount(total(lines))}</b>
        </div>
        <p className="small-note">
          This draft does not add tax. Configure tax and business details in
          Stripe before invoicing clients.
        </p>
        {error && (
          <div className="notice error" role="alert">
            {error}
          </div>
        )}
        <div className="form-actions">
          <button
            type="button"
            disabled={busy}
            className="secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="primary" disabled={busy}>
            {busy ? "Saving…" : "Save draft"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
