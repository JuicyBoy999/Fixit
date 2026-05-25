import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DB_URL,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  port:     process.env.DB_PORT,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
});

export default pool;
