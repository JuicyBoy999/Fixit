import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  try {
    const migrationSql = fs.readFileSync(path.join(__dirname, 'setup_migration.sql'), 'utf8');
    console.log('Running migration...');
    await pool.query(migrationSql);
    console.log('✅ Migration successful');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
