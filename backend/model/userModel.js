const pool = require("../database/db");

const createUser = async (firstName, lastName, email, phone, city, password) => {
  const result = await pool.query(
    "INSERT INTO users (first_name, last_name, email, phone, city, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [firstName, lastName, email, phone, city, password]
  );
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

const updateUser = async (id, firstName, lastName, email, phone, city) => {
  const result = await pool.query(
    "UPDATE users SET first_name=$1, last_name=$2, email=$3, phone=$4, city=$5 WHERE id=$6 RETURNING *",
    [firstName, lastName, email, phone, city, id]
  );
  return result.rows[0];
};

const updatePassword = async (id, password) => {
  const result = await pool.query(
    "UPDATE users SET password=$1 WHERE id=$2 RETURNING *",
    [password, id]
  );
  return result.rows[0];
};

module.exports = { createUser, getUserByEmail, updateUser, updatePassword };
