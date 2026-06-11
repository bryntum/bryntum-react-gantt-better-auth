import 'dotenv/config';
import { getMigrations } from 'better-auth/db/migration';
import { auth } from './auth.js';
import db from './db.js';

const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options);

if (toBeCreated.length > 0 || toBeAdded.length > 0) {
    if (toBeCreated.length > 0) {
        console.log('Tables to create:', toBeCreated.map((t) => t.table).join(', '));
    }
    if (toBeAdded.length > 0) {
        console.log('Columns to add:', toBeAdded.map((t) => t.table).join(', '));
    }
    await runMigrations();
    console.log('Better Auth migration complete.');
}
else {
    console.log('Better Auth tables already up to date.');
}

db.exec(`
  CREATE TABLE IF NOT EXISTS approved_emails (
    email    TEXT PRIMARY KEY,
    added_at TEXT DEFAULT (datetime('now'))
  )
`);
console.log('approved_emails table ready.');
