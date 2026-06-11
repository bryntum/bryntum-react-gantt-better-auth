# Bryntum React Gantt + Better Auth Demos

Three small apps that each protect a [Bryntum React Gantt](https://bryntum.com/products/react-gantt-chart/) chart with [Better Auth](https://better-auth.com/) in a different way. All three use a React frontend built with Vite, an Express backend, and SQLite.

## The demos

| Demo | Auth method |
|---|---|
| [`demo-1-email-password`](demo-1-email-password/) | Email and password login |
| [`demo-2-domain-restriction`](demo-2-domain-restriction/) | Email and password, with signups restricted to one email domain |
| [`demo-3-email-otp`](demo-3-email-otp/) | Passwordless email OTP, limited to an invite list of email addresses |

## Prerequisites

- Node.js 20.19+

## Running a demo

Each demo is self-contained. From its folder:

```bash
# 1. Install all dependencies
npm run setup

# 2. Create the SQLite auth tables
npm run migrate

# 3. Start the backend (port 3001) and frontend (port 5173)
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173). See each demo's README for details.
