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

export const updateRepairStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE repairs SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
    [status, id]
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
    `SELECT
       r.id,
       r.device_name,
       r.issue_description,
       r.city,
       r.preferred_date,
       r.technician_name,
       tp.id AS technician_id,
       r.status,
       r.cost,
       r.created_at,
       rv.id AS review_id,
       rv.rating AS review_rating,
       rv.body AS review_body,
       rv.created_at AS review_created_at,
       rv.edited_at AS review_edited_at,
       rv.original_body AS review_original_body
     FROM repairs r
     LEFT JOIN technician_profiles tp ON tp.full_name = r.technician_name
     LEFT JOIN reviews rv ON rv.booking_id = r.id
     WHERE r.user_id = $1
     ORDER BY COALESCE(r.preferred_date, r.created_at::date) DESC, r.created_at DESC`,
    [userId]
  );
  return result.rows;
};
