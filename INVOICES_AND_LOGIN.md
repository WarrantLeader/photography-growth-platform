# Login and invoice setup

## What works in the preview

Enter workspace opens a dedicated sign-in page with Apple, Microsoft and email/password options. Users can create an account and request a password reset. The separate Explore demo button is available only while authentication is unconfigured. Demo invoice drafts are local and cannot generate payment links, claim payment or send emails.

This is not a completed account or payment connection. No Supabase or Stripe credentials are bundled. The Sites hosting identity boundary remains platform-managed. Supabase email/password and OAuth authentication are supplied for the standalone app you deploy on your NAS or another web host. The existing hosted preview remains an unconnected UI until an appropriate external auth configuration and backend deployment are made.

## Standalone authentication

1. Create a Supabase project and enable email/password authentication and whichever OAuth providers you want to offer (Apple and Azure for Microsoft). Configure the confirmation and password-reset email templates and delivery settings in Supabase. Complete Apple's developer setup or Microsoft's Entra app registration and keep provider secrets in Supabase.
2. In Supabase Auth URL configuration, set the Site URL to your actual app origin and add the exact production `/login` and `/reset-password` URLs to allowed redirects. Add `http://localhost:5173/login` and `http://localhost:5173/reset-password` for local development. Use HTTPS for your production app.
3. Copy `.env.example` to `.env`. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_AUTH_PROVIDERS=apple,azure` (only providers configured in Supabase). These are public settings. Do not put Supabase secret or Stripe secret keys in any `VITE_` variable.
4. Set `VITE_API_BASE_URL` to your HTTPS invoice API origin, or leave blank when routing `/api` to the backend on the same origin. Run `npm ci` and rebuild with `npm run build` after configuration changes.
5. Supabase securely handles password authentication, OAuth and reset emails; the CRM does not store passwords. Confirm email delivery and reset links on your deployment. Do not use the local demo as an authentication mechanism.

The invoice server independently validates the Supabase token and checks `INVOICE_ADMIN_USER_IDS`. An empty allowlist denies all invoice access. Sign in, obtain your Supabase user UUID from the Supabase dashboard, and add the approved administrator UUIDs to that variable. Each administrator sees and sends only their own invoices. A friend being able to sign in does not give them access to your invoices. Shared team billing needs a later explicit team/role model.

Non-invoice CRM records remain browser-local and are now separated by account ID. They are not cloud-synced. Legacy demo CRM data remains under `mrt-studio-v1`; the new demo uses `mrt-studio-v1:demo` rather than migrating private data into another account. This change does not yet implement the shared NAS file backend discussed earlier.

## Stripe invoicing

1. Create or use your Stripe business account. Configure your business name, address, branding, tax details, supported payment methods and invoice numbering in Stripe. The draft editor does not add tax. Before issuing tax invoices, implement appropriate Stripe tax rates or automatic tax and review the totals.
2. Start with a Stripe TEST secret key. Copy `backend/.env.example` to `backend/.env`. Set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `INVOICE_ADMIN_USER_IDS`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the exact `FRONTEND_ORIGINS` allowlist.
3. Run `docker compose up --build -d`. It binds the API to `127.0.0.1:8000`; publish it through an HTTPS reverse proxy on your NAS or host. The database is stored in the named Docker volume. Keep that volume backed up. Do not expose a raw unprotected NAS service or send secret keys to the browser.
4. Register an HTTPS Stripe webhook endpoint at `/api/stripe/webhook` for `invoice.paid`, `invoice.payment_failed`, `invoice.voided`, `invoice.marked_uncollectible` and `invoice.sent`. Copy its signing secret into the backend environment. Restart the container after backend environment changes.
5. Create a draft, review the recipient and amount, and choose Confirm & send invoice. The API creates the customer and invoice, explicitly attaches its line items, verifies the final GBP total, finalises it and asks Stripe to send it. Stripe test mode does not email the client. It returns a test hosted invoice page for payment testing.
6. Test the payment flow and webhook using Stripe test data. After testing, replace the backend key and webhook secret with live credentials and restart the backend. Keep this step deliberate. No live send or payment has been performed during implementation.

Clients pay on Stripe's hosted invoice page without signing in to the CRM. Apple Pay appears only when supported by the account, device, browser and wallet. Card payment remains an alternative. The app never collects card or Apple Pay payment data. Stripe generates the official invoice number/PDF; the CRM's MTC reference is included as Stripe metadata.

Sending is protected by server authorisation, an explicit review confirmation, saved Stripe IDs and stable idempotency keys. A single API worker serialises invoice edits and sending. Do not run multiple workers or replicas against this implementation without a distributed job/locking design. Stripe idempotency keys have a limited retention period: check the Stripe dashboard before retrying an unresolved processing attempt after a day. The backend freezes editing when processing begins. A partially prepared invoice should be retried as the same invoice, or handled in Stripe, rather than recreated blindly.

Only verified Stripe webhook notifications update paid status. The handler reads the latest Stripe invoice object, so an older failure event cannot overwrite a newer paid status. Until a webhook is received, the CRM may show an older status. No client-side control can mark a real invoice paid.

## Development and tests

```sh
python -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
.venv/bin/pytest backend/tests -q
```

For local API development, supply the backend environment and a writable `INVOICE_DB_PATH`, then run `uvicorn app:app --app-dir backend --host 127.0.0.1 --port 8000 --workers 1`. Set the frontend API origin and auth public settings before starting Vite.

Tests mock Stripe. They cover integer-pence totals, validation, owner separation, auth enforcement, missing configuration, duplicate-send prevention, edit locking and webhook signatures/status handling. They do not prove a live provider login, client email delivery or real Apple Pay payment.

## Official setup references

- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/auth/social-login/auth-apple
- https://supabase.com/docs/guides/auth/social-login/auth-azure
- https://supabase.com/docs/guides/auth/redirect-urls
- https://docs.stripe.com/api/invoices/send
- https://support.stripe.com/questions/paying-a-hosted-invoice-with-apple-pay
