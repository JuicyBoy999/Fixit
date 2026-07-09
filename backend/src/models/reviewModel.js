import pool from '../config/db.js';

export const createReview = async ({ bookingId, customerId, rating, body }) => {
  const result = await pool.query(
    `WITH booking AS (
       SELECT rr.id, rr.customer_id, rr.technician_id
       FROM repair_requests rr
       WHERE rr.id = $1
         AND rr.customer_id = $2
         AND rr.status = 'completed'
     )
     INSERT INTO reviews (booking_id, customer_id, technician_id, rating, body)
     SELECT id, customer_id, technician_id, $3, $4
     FROM booking
     RETURNING id, booking_id, customer_id, technician_id, rating, body, created_at, edited_at, original_body`,
    [bookingId, customerId, rating, body]
  );

  return result.rows[0];
};

export const getReviewById = async (id) => {
  const result = await pool.query(
    `SELECT id, booking_id, customer_id, technician_id, rating, body, created_at, edited_at, original_body
     FROM reviews
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

export const getReviewByBookingId = async (bookingId) => {
  const result = await pool.query(
    `SELECT id, booking_id, customer_id, technician_id, rating, body, created_at, edited_at, original_body
     FROM reviews
     WHERE booking_id = $1`,
    [bookingId]
  );
  return result.rows[0];
};

export const updateReviewWithinWindow = async ({ id, customerId, rating, body }) => {
  const result = await pool.query(
    `UPDATE reviews
     SET rating = $1,
         original_body = COALESCE(original_body, reviews.body),
         body = $2,
         edited_at = CURRENT_TIMESTAMP
     WHERE id = $3
       AND customer_id = $4
       AND CURRENT_TIMESTAMP <= created_at + INTERVAL '24 hours'
     RETURNING id, booking_id, customer_id, technician_id, rating, body, created_at, edited_at, original_body`,
    [rating, body, id, customerId]
  );

  return result.rows[0];
};

export const getReviewsByTechnicianId = async (technicianId) => {
  const result = await pool.query(
    `SELECT
       r.id,
       r.booking_id,
       r.customer_id,
       r.technician_id,
       r.rating,
       r.body,
       r.created_at,
       r.edited_at,
       u.first_name,
       u.last_name
     FROM reviews r
     JOIN users u ON u.id = r.customer_id
     WHERE r.technician_id = $1
     ORDER BY r.created_at DESC`,
    [technicianId]
  );

  return result.rows;
};
