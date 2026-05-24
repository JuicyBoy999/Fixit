import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  port:     process.env.DB_PORT,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,

});

export default pool;