import pool from '../config/db.js';

export const createRepairRequestsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS repair_requests (
      id                SERIAL PRIMARY KEY,
      customer_id       INTEGER,
      technician_id     INTEGER,
      device_type       TEXT,
      fault_description TEXT,
      photo_url         TEXT,
      preferred_date    DATE,
      customer_area     TEXT,
      status            TEXT DEFAULT 'pending',
      created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`ALTER TABLE repair_requests ADD COLUMN IF NOT EXISTS preferred_time TEXT`);
  await pool.query(`ALTER TABLE repair_requests ADD COLUMN IF NOT EXISTS cancel_reason  TEXT`);
  await pool.query(`ALTER TABLE repair_requests ADD COLUMN IF NOT EXISTS reminder_sent  BOOLEAN DEFAULT FALSE`);
  await pool.query(`ALTER TABLE repair_requests ADD COLUMN IF NOT EXISTS amount           NUMERIC`);
  await pool.query(`ALTER TABLE repair_requests ADD COLUMN IF NOT EXISTS payment_status   TEXT DEFAULT 'unpaid'`);
  await pool.query(`ALTER TABLE repair_requests ADD COLUMN IF NOT EXISTS transaction_uuid TEXT`);
};

createRepairRequestsTable();