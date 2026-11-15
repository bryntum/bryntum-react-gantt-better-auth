# Bryntum React Gantt + Better Auth Demo 3: Email OTP Invite List

A Bryntum React Gantt chart accessible only to a pre-approved list of email addresses. Users sign in by entering their email and a one-time code — no password required — using [Better Auth Email OTP plugin](https://better-auth.com/docs/plugins/email-otp).

## What this demo shows

- Passwordless sign-in via email OTP
- Pre-approved email list stored in SQLite
- Admin UI to add/remove approved emails
- OTP sent using [Nodemailer](https://nodemailer.com/) and [Ethereal](https://ethereal.email/), a free fake SMTP service for testing Nodemailer.
- Gantt route protected by session check

## Prerequisites

- Node.js 20.19+

### Installing the Bryntum Gantt component

The frontend uses the Bryntum Gantt React wrapper, which `npm run setup` installs:

```sh
npm install @bryntum/gantt-react-enterprise
```

Bryntum packages are on the public npm registry, so you don't need to log in. The Enterprise tier runs as a fully functional trial for 14 days without a license key. [Request a free trial key](https://bryntum.com/download/) to extend the trial to 45 days. If you have a Bryntum license, add your license key as described in the [licensing guide](https://bryntum.com/docs/guide/Core/licensing).

## Setup

```bash
# 1. Install all dependencies
npm run setup

# 2. Create database tables (Better Auth tables + approved_emails)
npm run migrate

# 3. Start the backend (port 3001) and frontend (port 5173)
npm run dev
```

## Testing the flow

1. Open [http://localhost:5173/admin](http://localhost:5173/admin) and add an email address to the approved list.
2. Open [http://localhost:5173](http://localhost:5173) and enter that email address.
3. Check the backend terminal for the Ethereal preview URL — click it to view the email and get the OTP.
4. Enter the 6-digit code to access the Gantt.

To send to real emails, configure SMTP in `backend/.env`.

> **Note:** The `/api/approved-emails` endpoints and the `/admin` page are deliberately unauthenticated for this basic demo. In production, guard them with a session check plus an admin role check — see the [Better Auth admin plugin](https://better-auth.com/docs/plugins/admin).

## Project structure

```
demo-3-email-otp/
├── backend/
│   ├── src/
│   │   ├── db.ts           # Shared SQLite database instance
│   │   ├── auth.ts         # Better Auth + emailOTP plugin + Nodemailer
│   │   ├── index.ts        # Express server, approved-email API, tasks API
│   │   └── migrate.ts      # Better Auth migrations + approved_emails table
│   └── .env                # Secrets and optional SMTP config
└── frontend/
    └── src/
        ├── auth-client.ts   # Better Auth client with emailOTPClient plugin
        ├── App.tsx           # Routes: /admin → AdminPage, / → OtpLogin or GanttPage
        └── pages/
            ├── OtpLogin.tsx  # Two-step login: email → OTP code
            ├── AdminPage.tsx  # Add/remove approved emails
            └── GanttPage.tsx  # Gantt with header and logout
```

## Environment variables

| Variable | Description |
|---|---|
| `BETTER_AUTH_SECRET` | Encryption secret — use `openssl rand -base64 32` in production |
| `BETTER_AUTH_URL` | Public URL of the app |
| `SMTP_HOST` | Optional SMTP host (omit to use Ethereal test account) |
| `SMTP_PORT` | SMTP port (default: 587) |
| `SMTP_SECURE` | `true` for port 465, `false` otherwise |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password / app password |
