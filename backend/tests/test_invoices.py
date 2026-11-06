import hashlib
import hmac
import json
import sys
import time
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import app as api


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(api, 'DB_PATH', str(tmp_path / 'invoices.db'))
    monkeypatch.setattr(api, 'STRIPE_KEY', 'sk_test_fixture_only')
    monkeypatch.setattr(api, 'WEBHOOK_SECRET', 'whsec_fixture_only')
    api.app.dependency_overrides[api.identity] = lambda: 'owner-a'
    with TestClient(api.app) as client:
        yield client
    api.app.dependency_overrides.clear()


def draft():
    return {'client_name': 'Test Client', 'client_email': 'client@example.com', 'project': 'Test shoot', 'days_until_due': 14, 'notes': '', 'items': [{'description': 'Photography', 'quantity': 2, 'unit_amount': 12550}, {'description': 'Travel', 'quantity': 1, 'unit_amount': 2000}]}


def test_totals_and_owner_isolation(client):
    response = client.post('/api/invoices', json=draft())
    assert response.status_code == 201
    invoice = response.json()
    assert invoice['total'] == 27100
    assert invoice['status'] == 'draft'
    api.app.dependency_overrides[api.identity] = lambda: 'owner-b'
    assert client.get('/api/invoices').json() == []
    assert client.put('/api/invoices/' + invoice['id'], json=draft()).status_code == 404
    assert client.post('/api/invoices/' + invoice['id'] + '/send', json={'confirm': True}).status_code == 404


def test_invalid_amounts_and_confirmation(client):
    payload = draft()
    payload['items'][0]['unit_amount'] = -10
    assert client.post('/api/invoices', json=payload).status_code == 422
    payload['items'][0]['unit_amount'] = 12.5
    assert client.post('/api/invoices', json=payload).status_code == 422
    invoice = client.post('/api/invoices', json=draft()).json()
    assert client.post('/api/invoices/' + invoice['id'] + '/send', json={'confirm': 'true'}).status_code == 422
    assert client.post('/api/invoices/' + invoice['id'] + '/send', json={'confirm': False}).status_code == 422


def test_missing_configuration_never_sends(client, monkeypatch):
    invoice = client.post('/api/invoices', json=draft()).json()
    monkeypatch.setattr(api, 'STRIPE_KEY', '')
    assert client.post('/api/invoices/' + invoice['id'] + '/send', json={'confirm': True}).status_code == 503
    assert client.get('/api/invoices').json()[0]['status'] == 'draft'


def test_send_is_idempotent_and_locks_editing(client, monkeypatch):
    invoice = client.post('/api/invoices', json=draft()).json()
    state = {'id': 'in_fixture', 'status': 'draft', 'total': 0, 'currency': 'gbp', 'livemode': False}
    keys = set()
    sends = []

    async def fake_stripe(method, path, data=None, key=None):
        if path == 'customers':
            return {'id': 'cus_fixture'}
        if path == 'invoices':
            assert data['collection_method'] == 'send_invoice'
            assert data['auto_advance'] == 'false'
            return dict(state)
        if path == 'invoiceitems':
            assert data['invoice'] == 'in_fixture'
            if key not in keys:
                state['total'] += int(data['amount'])
                keys.add(key)
            return {'id': 'ii_fixture'}
        if path.endswith('/finalize'):
            state.update(status='open', hosted_invoice_url='https://invoice.stripe.com/test_fixture')
        if path.endswith('/send'):
            sends.append(key)
        return dict(state)

    monkeypatch.setattr(api, 'stripe', fake_stripe)
    url = '/api/invoices/' + invoice['id']
    response = client.post(url + '/send', json={'confirm': True})
    assert response.status_code == 200
    assert response.json()['status'] == 'open'
    assert response.json()['total'] == state['total'] == 27100
    assert len(sends) == 1
    assert client.post(url + '/send', json={'confirm': True}).status_code == 200
    assert len(sends) == 1
    assert client.put(url, json=draft()).status_code == 409


def test_bad_webhook_signature_is_rejected(client):
    assert client.post('/api/stripe/webhook', content='{}', headers={'Stripe-Signature': 't=0,v1=bad'}).status_code == 400


def test_verified_webhook_uses_current_stripe_status(client, monkeypatch):
    invoice = client.post('/api/invoices', json=draft()).json()
    api.store(invoice['id'], invoice, stripe_id='in_fixture')
    event = {'type': 'invoice.payment_failed', 'data': {'object': {'id': 'in_fixture', 'status': 'open'}}}
    raw = json.dumps(event).encode()
    timestamp = str(int(time.time()))
    signature = hmac.new(api.WEBHOOK_SECRET.encode(), timestamp.encode() + b'.' + raw, hashlib.sha256).hexdigest()

    async def current_invoice(*args, **kwargs):
        return {'status': 'paid', 'livemode': False, 'hosted_invoice_url': 'https://invoice.stripe.com/test_fixture'}

    monkeypatch.setattr(api, 'stripe', current_invoice)
    response = client.post('/api/stripe/webhook', content=raw, headers={'Stripe-Signature': f't={timestamp},v1={signature}'})
    assert response.status_code == 200
    assert client.get('/api/invoices').json()[0]['status'] == 'paid'


def test_server_auth_required_when_not_overridden(client, monkeypatch):
    api.app.dependency_overrides.clear()
    monkeypatch.setattr(api, 'SUPABASE_URL', 'https://example.supabase.co')
    monkeypatch.setattr(api, 'SUPABASE_KEY', 'public_test_value')
    assert client.get('/api/invoices').status_code == 401
