import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node';
import { auth } from './auth.js';
import db from './db.js';

const app = express();
const PORT = 3001;

app.use(
    cors({
        origin      : 'http://localhost:5173',
        credentials : true
    })
);

// Better Auth handler — must be mounted before express.json()
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

// Check if an email is on the approved list (used by frontend before sending OTP)
app.get('/api/check-approved', (req, res) => {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ approved : false, message : 'Email required.' });

    const row = db.prepare('SELECT 1 FROM approved_emails WHERE email = ?').get(email);
    if (row) {
        return res.json({ approved : true });
    }
    return res.json({ approved : false, message : 'This email is not on the invite list.' });
});

// List approved emails
app.get('/api/approved-emails', (_req, res) => {
    const rows = db.prepare('SELECT email, added_at FROM approved_emails ORDER BY added_at DESC').all();
    return res.json(rows);
});

// Add an email to the approved list
app.post('/api/approved-emails', (req, res) => {
    const { email } = req.body as { email?: string };
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error : 'A valid email is required.' });
    }
    try {
        db.prepare('INSERT INTO approved_emails (email) VALUES (?)').run(email.toLowerCase().trim());
        return res.status(201).json({ email });
    }
    catch {
        return res.status(409).json({ error : 'Email is already on the list.' });
    }
});

// Remove an email from the approved list
app.delete('/api/approved-emails/:email', (req, res) => {
    const email = decodeURIComponent(req.params.email);
    const result = db.prepare('DELETE FROM approved_emails WHERE email = ?').run(email);
    if (result.changes === 0) {
        return res.status(404).json({ error : 'Email not found.' });
    }
    return res.json({ deleted : email });
});

const tasks = [
    // Parent tasks
    { id : 1,  name : 'Planning',     expanded : true },
    { id : 5,  name : 'Development',  expanded : true },
    { id : 9,  name : 'Delivery',     expanded : true },
    // Planning children
    { id : 2,  parentId : 1, name : 'Project Kickoff',     startDate : '2026-11-02', duration : 1, percentDone : 100, assignedTo : 'alice@example.com' },
    { id : 3,  parentId : 1, name : 'Database Schema',     startDate : '2026-11-03', duration : 3, percentDone : 100, assignedTo : 'bob@example.com'   },
    { id : 4,  parentId : 1, name : 'Auth Module',         startDate : '2026-11-03', duration : 5, percentDone : 80,  assignedTo : 'alice@example.com' },
    // Development children
    { id : 6,  parentId : 5, name : 'API Development',     startDate : '2026-11-10', duration : 5, percentDone : 60,  assignedTo : 'bob@example.com'   },
    { id : 7,  parentId : 5, name : 'Frontend Components', startDate : '2026-11-10', duration : 5, percentDone : 40,  assignedTo : 'carol@example.com' },
    { id : 8,  parentId : 5, name : 'Unit Tests',          startDate : '2026-11-17', duration : 3, percentDone : 20,  assignedTo : 'bob@example.com'   },
    // Delivery children
    { id : 10, parentId : 9, name : 'Integration Testing', startDate : '2026-11-20', duration : 3, percentDone : 0,   assignedTo : 'carol@example.com' },
    { id : 11, parentId : 9, name : 'Deployment',          startDate : '2026-11-24', duration : 2, percentDone : 0,   assignedTo : 'alice@example.com' }
];

const dependencies = [
    { id : 1, fromTask : 2,  toTask : 3  },
    { id : 2, fromTask : 2,  toTask : 4  },
    { id : 3, fromTask : 3,  toTask : 6  },
    { id : 4, fromTask : 4,  toTask : 6  },
    { id : 5, fromTask : 6,  toTask : 7  },
    { id : 6, fromTask : 7,  toTask : 8  },
    { id : 7, fromTask : 8,  toTask : 10 },
    { id : 8, fromTask : 10, toTask : 11 }
];

app.get('/api/tasks', async(req, res) => {
    const session = await auth.api.getSession({
        headers : fromNodeHeaders(req.headers)
    });

    if (!session) {
        return res.status(401).json({ error : 'Unauthorized' });
    }

    return res.json({ tasks, dependencies });
});

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
    console.log(`Auth endpoints at http://localhost:${PORT}/api/auth`);
});
