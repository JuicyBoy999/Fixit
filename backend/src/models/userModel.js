import pool from '../config/db.js';
import bcrypt from 'bcrypt';

export const createUser = async (firstName, lastName, email, phone, city, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (first_name, last_name, email, phone, city, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [firstName, lastName, email, phone, city, hashedPassword]
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

export const getUserById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

export const updateUser = async (id, firstName, lastName, email, phone, city) => {
  const result = await pool.query(
    "UPDATE users SET first_name=$1, last_name=$2, email=$3, phone=$4, city=$5 WHERE id=$6 RETURNING *",
    [firstName, lastName, email, phone, city, id]
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
