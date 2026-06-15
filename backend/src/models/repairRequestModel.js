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
};

createRepairRequestsTable();