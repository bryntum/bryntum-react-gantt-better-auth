import 'dotenv/config';
import { getMigrations } from 'better-auth/db/migration';
import { auth } from './auth.js';

const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options);

if (toBeCreated.length === 0 && toBeAdded.length === 0) {
    console.log('Database is already up to date.');
    process.exit(0);
}

if (toBeCreated.length > 0) {
    console.log('Tables to create:', toBeCreated.map((t) => t.table).join(', '));
}
if (toBeAdded.length > 0) {
    console.log('Columns to add:', toBeAdded.map((t) => t.table).join(', '));
}

await runMigrations();
console.log('Migration complete.');
