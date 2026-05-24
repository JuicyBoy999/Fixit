import pool from '../database/db.js';

const createTechnicianTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS technicians (
      id SERIAL PRIMARY KEY,
      user_id TEXT UNIQUE,
      bio TEXT,
      skills TEXT,
      devices TEXT,
      certifications TEXT,
      experience TEXT,
      radius INTEGER,
      base_location TEXT,
      custom_address TEXT,
      availability TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

createTechnicianTable();

export default pool;