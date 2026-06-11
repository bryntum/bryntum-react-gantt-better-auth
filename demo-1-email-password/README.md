# Bryntum React Gantt + Better Auth Demo 1: Email/Password Gate

A Bryntum React Gantt chart protected by using [Better Auth email and password authentication](https://better-auth.com/docs/authentication/email-password).

## What this demo shows

- Registering and signing in with email and password
- Protecting a Gantt chart behind a login page
- Serving Gantt data from an authenticated Express API endpoint
- Signing out and redirecting back to the login form

## Prerequisites

- Node.js 20.19+

### Installing the Bryntum Gantt component

If you're using the free trial, install the public Bryntum Gantt trial package and the React wrapper:

```sh
npm install @bryntum/gantt@npm:@bryntum/gantt-trial @bryntum/gantt-react
```

If you have a Bryntum license, refer to our [npm Repository Guide](https://bryntum.com/products/gantt/docs/guide/Gantt/npm/repository/private-repository-access) and install the licensed packages:

```sh
npm install @bryntum/gantt @bryntum/gantt-react
```

## Setup

```bash
# 1. Install all dependencies
npm run setup

# 2. Create the SQLite auth tables
npm run migrate

# 3. Start the backend (port 3001) and frontend (port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and register an account to access the Gantt.

## Project structure

```
demo-1-email-password/
├── backend/
│   ├── src/
│   │   ├── auth.ts         # Better Auth config (SQLite + email/password)
│   │   └── index.ts        # Express server + protected /api/tasks endpoint
│   └── .env                # BETTER_AUTH_SECRET and BETTER_AUTH_URL
└── frontend/
    └── src/
        ├── auth-client.ts  # Better Auth React client
        ├── App.tsx          # Session check — renders Login or GanttPage
        └── pages/
            ├── Login.tsx    # Sign in / register form
            └── GanttPage.tsx # Gantt with header and logout button
```

## Environment variables

The backend reads from `backend/.env`:

| Variable | Description |
|---|---|
| `BETTER_AUTH_SECRET` | Encryption secret — use `openssl rand -base64 32` in production |
| `BETTER_AUTH_URL` | Public URL of the app (`http://localhost:5173` for local dev) |
