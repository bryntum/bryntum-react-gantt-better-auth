# Bryntum React Gantt + Better Auth Demo 2: Domain-Restricted Signup

A Bryntum React Gantt chart protected by email/password authentication, restricted to a specific email domain using [Better Auth hooks](https://better-auth.com/docs/concepts/hooks#example-enforce-email-domain-restriction).

## What this demo shows

- Rejecting signups from email addresses outside a specific domain (`@gmail.com`)
- Using `databaseHooks.user.create.before` to validate emails server-side

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

# 2. Create the SQLite auth tables
npm run migrate

# 3. Start the backend (port 3001) and frontend (port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Try registering with a non-Gmail address to see the domain rejection error.

## Project structure

```
demo-2-domain-restriction/
├── backend/
│   ├── src/
│   │   ├── auth.ts         # Better Auth config with databaseHooks domain check
│   │   └── index.ts        # Express server + protected /api/tasks endpoint
│   └── .env                # BETTER_AUTH_SECRET and BETTER_AUTH_URL
└── frontend/
    └── src/
        ├── auth-client.ts  # Better Auth React client
        ├── App.tsx          # Session check — renders Login or GanttPage
        └── pages/
            ├── Login.tsx    # Sign in / register form with domain note
            └── GanttPage.tsx # Gantt with header and logout button
```

## Environment variables

| Variable | Description |
|---|---|
| `BETTER_AUTH_SECRET` | Encryption secret — use `openssl rand -base64 32` in production |
| `BETTER_AUTH_URL` | Public URL of the app (`http://localhost:5173` for local dev) |

## Adapting for your domain

In `backend/src/auth.ts`, change `@gmail.com` to your company domain:

```ts
const allowedDomain = "@yourcompany.com";
```
