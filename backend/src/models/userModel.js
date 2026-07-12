import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

export const createUser = async (firstName, lastName, email, phone, city, password, role = 'user', address = null) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (first_name, last_name, email, phone, city, password, role, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
    [firstName, lastName, email, phone, city, hashedPassword, role, address]
  );
  return result.rows[0];
};

export const getUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

export const findOrCreateOAuthUser = async ({ firstName, lastName, email, role = 'user' }) => {
  const existing = await getUserByEmail(email);
  if (existing) return { ...existing, isNew: false };

  const randomPassword = randomBytes(24).toString('hex');
  const hashedPassword = await bcrypt.hash(randomPassword, 10);
  const result = await pool.query(
    "INSERT INTO users (first_name, last_name, email, phone, city, password, role) VALUES ($1, $2, $3, NULL, NULL, $4, $5) RETURNING *",
    [firstName, lastName, email, hashedPassword, role]
  );
  return { ...result.rows[0], isNew: true };
};

export const getUserById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

export const getManageableUsers = async () => {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, phone, city, role, status, created_at
     FROM users
     WHERE role <> 'admin'
     ORDER BY created_at DESC`
  );
  return result.rows;
};

export const updateUser = async (id, firstName, lastName, email, phone, city, address = null) => {
  const result = await pool.query(
    "UPDATE users SET first_name=$1, last_name=$2, email=$3, phone=$4, city=$5, address=$6 WHERE id=$7 RETURNING *",
    [firstName, lastName, email, phone, city, address, id]
  );
  return result.rows[0];
};

export const updatePassword = async (id, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "UPDATE users SET password=$1 WHERE id=$2 RETURNING *",
    [hashedPassword, id]
  );
  return result.rows[0];
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const updateUserStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE users
     SET status = $1
     WHERE id = $2
     RETURNING id, first_name, last_name, email, phone, city, role, status, created_at`,
    [status, id]
  );
  return result.rows[0];
};
