import pool from '../config/db.js';

export const getRepairById = async (id) => {
  const result = await pool.query(
    `SELECT id, user_id, device_name, issue_description, city, preferred_date, contact_name, contact_phone, contact_email, address, technician_name, status, cost, created_at
     FROM repairs 
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

export const createRepair = async ({
  userId,
  deviceName,
  issueDescription,
  city,
  preferredDate,
  contactName,
  contactPhone,
  contactEmail,
  address,
}) => {
  const result = await pool.query(
    `INSERT INTO repairs (user_id,device_name,issue_description,city,preferred_date,contact_name,contact_phone,contact_email,address)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, device_name, issue_description, city, preferred_date, technician_name, status, cost, created_at`,
    [userId, deviceName, issueDescription, city, preferredDate, contactName, contactPhone, contactEmail, address]
  );

  return result.rows[0];
};

export const getRepairsByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT id, device_name, issue_description, city, preferred_date, technician_name, status, cost, created_at
     FROM repairs 
     WHERE user_id = $1 
     ORDER BY COALESCE(preferred_date, created_at::date) DESC, created_at DESC`,
    [userId]
  );
  return result.rows;
};
