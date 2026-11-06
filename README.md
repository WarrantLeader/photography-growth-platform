# Mr T Captures Studio CRM

React, TypeScript and Tailwind photography CRM with an orange and charcoal interface.

## Run the preview locally

Use Node.js 22.12+ or a compatible newer release.

```sh
npm ci
npm run dev
```

Enter workspace opens `/login` for Apple, Microsoft or email-and-password sign-in and account creation. Without configured authentication, provider buttons show Setup needed and Explore demo opens example records. The demo cannot send invoices or collect money.

```sh
npm run build
npm run preview
```

## Features

- Responsive workspace and mobile drawer with scroll locking and safe-area spacing.
- Leads, campaigns, projects, calculated dashboard figures, tasks, activity and insights.
- Apple/Microsoft OAuth, email/password authentication, and password recovery through Supabase for the standalone deployment.
- Invoice drafts, line items in GBP, previews, search and status filters.
- Python invoice API with server-validated accounts, explicit administrator allowlist, SQLite persistence, Stripe hosted invoices, send confirmation, retry protection and signed payment notifications.
- Settings, light/dark appearance and JSON export of non-invoice CRM records.
- Read-only NAS folder browsing, file search, previews and downloads from a locally mounted share.

## Activate sign-in and invoice payments

Read `INVOICES_AND_LOGIN.md`. It contains the required configuration, Docker deployment steps, account and payment limitations, webhook setup and testing instructions.

No Supabase project or Stripe account is connected in the downloadable source or hosted preview. Account registration, Apple/Microsoft OAuth, email/password login, password recovery, client email delivery and Apple Pay require that setup and live verification. Secrets belong in Supabase or the backend environment. Never put them in frontend `VITE_` variables.

The static hosted preview does not run the Python backend. Deploy that backend to your NAS or another HTTPS host and connect the standalone frontend. Native Sites platform access is separate from standalone authentication.

## Data

Non-invoice CRM records remain browser-local and are separated by account ID. Demo drafts are browser-local. Live invoices are kept in the backend SQLite database and Stripe. The invoice API restricts each administrator to their own records. It does not yet implement shared team billing, multi-device CRM sync, the shared NAS file backend or automatic SD-card backups.

Existing demo records under `mrt-studio-v1` remain untouched. New account-separated records use `mrt-studio-v1:<user-id>`. Settings exports only the current account's non-invoice CRM records. Back up the SQLite Docker volume for invoices. No user data is included in the source ZIP.

## NAS files

Mount your NAS SMB share in Finder or File Explorer over your existing network or Tailscale configuration, then choose the project folder in Project Files. Desktop Chrome and Edge support direct directory browsing on secure origins or localhost. Other browsers use a flat folder import. Folder permissions are session-only and need reconnecting after leaving the file route or reloading. Files are not uploaded by this feature. RAW files download to their native application.

## Validation

The TypeScript/Vite production build passes. Seven mocked backend tests cover totals, validation, owner isolation, auth enforcement, missing configuration, duplicate sending, edit locking and webhook signatures/status handling. Browser checks cover entry-to-login routing and demo invoice creation/preview with sending disabled. Actual provider login, client email delivery, live NAS access and real Apple Pay payment require your accounts and devices.
