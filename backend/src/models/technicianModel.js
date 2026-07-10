import pool from '../config/db.js';

const RATINGS_CTE = `
  SELECT technician_id AS tp_id, rating FROM technician_reviews
  UNION ALL
  SELECT tp2.id AS tp_id, r.rating FROM reviews r JOIN technician_profiles tp2 ON tp2.user_id = r.technician_id
`;

export const createTechnicianProfileForUser = async (user) => {
  const result = await pool.query(
    `INSERT INTO technician_profiles (user_id, full_name, title, bio, location, years_experience, verification_status)
     VALUES ($1, $2, 'Repair Technician', 'Fixit-certified technician ready to help with your repair.', $3, 0, 'approved')
     RETURNING *`,
    [user.id, `${user.firstName} ${user.lastName}`.trim(), user.city]
  );
  return result.rows[0];
};

export const getTechnicians = async () => {
  const result = await pool.query(
    `SELECT
       tp.id,
       tp.user_id,
       tp.full_name,
       tp.title,
       tp.bio,
       tp.skills,
       tp.location,
       tp.years_experience,
       tp.hourly_rate,
       tp.status,
       tp.verification_status,
       COALESCE(ROUND(AVG(combined.rating)::numeric, 1), 0) AS average_rating,
       COUNT(combined.rating)::int AS review_count,
       COUNT(DISTINCT tc.id)::int AS certification_count
     FROM technician_profiles tp
     LEFT JOIN (${RATINGS_CTE}) combined ON combined.tp_id = tp.id
     LEFT JOIN technician_certifications tc ON tc.technician_id = tp.id
     WHERE tp.status != 'suspended'
     GROUP BY tp.id
     ORDER BY average_rating DESC, review_count DESC, tp.full_name ASC`
  );

  return result.rows;
};

export const getTechnicianById = async (id) => {
  const profileResult = await pool.query(
    `SELECT
       tp.id,
       tp.user_id,
       tp.full_name,
       tp.title,
       tp.bio,
       tp.skills,
       tp.location,
       tp.years_experience,
       tp.status,
       tp.verification_status,
       COALESCE(ROUND(AVG(combined.rating)::numeric, 1), 0) AS average_rating,
       COUNT(combined.rating)::int AS review_count
     FROM technician_profiles tp
     LEFT JOIN (${RATINGS_CTE}) combined ON combined.tp_id = tp.id
     WHERE tp.id = $1 AND tp.status != 'suspended'
     GROUP BY tp.id`,
    [id]
  );

  if (!profileResult.rows[0]) return null;

  const certificationsResult = await pool.query(
    `SELECT id, name, issuer, issued_on
     FROM technician_certifications
     WHERE technician_id = $1
     ORDER BY issued_on DESC NULLS LAST, name ASC`,
    [id]
  );

  const reviewsResult = await pool.query(
    `SELECT id, reviewer_name, rating, comment, created_at
     FROM technician_reviews
     WHERE technician_id = $1
     ORDER BY created_at DESC`,
    [id]
  );

  return {
    ...profileResult.rows[0],
    certifications: certificationsResult.rows,
    reviews: reviewsResult.rows,
  };
};

export const getManageableTechnicians = async () => {
  const result = await pool.query(
    `SELECT
       tp.id,
       tp.user_id,
       tp.full_name,
       tp.title,
       tp.location,
       tp.years_experience,
       tp.status,
       tp.verification_status,
       tp.created_at,
       u.email,
       u.first_name,
       u.last_name
     FROM technician_profiles tp
     LEFT JOIN users u ON tp.user_id = u.id
     ORDER BY tp.created_at DESC`
  );
  return result.rows;
};

export const getTechnicianAccountById = async (id) => {
  const result = await pool.query(
    `SELECT
       tp.id,
       tp.user_id,
       tp.full_name,
       tp.title,
       tp.location,
       tp.status,
       tp.verification_status,
       tp.credential_documents,
       u.email,
       u.first_name,
       u.last_name
     FROM technician_profiles tp
     LEFT JOIN users u ON tp.user_id = u.id
     WHERE tp.id = $1`,
    [id]
  );
  return result.rows[0];
};

export const updateTechnicianStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE technician_profiles
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, user_id, full_name, title, location, status, created_at`,
    [status, id]
  );
  return result.rows[0];
};

export const getPendingTechnicianVerifications = async () => {
  const result = await pool.query(
    `SELECT
       tp.id,
       tp.user_id,
       tp.full_name,
       tp.title,
       tp.location,
       tp.years_experience,
       tp.status,
       tp.verification_status,
       tp.credential_documents,
       tp.created_at,
       u.email,
       u.first_name,
       u.last_name
     FROM technician_profiles tp
     LEFT JOIN users u ON tp.user_id = u.id
     WHERE tp.verification_status = 'pending'
     ORDER BY tp.created_at ASC`
  );
  return result.rows;
};

export const updateTechnicianVerificationStatus = async (id, verificationStatus) => {
  const result = await pool.query(
    `UPDATE technician_profiles
     SET verification_status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, user_id, full_name, title, location, status, verification_status, credential_documents, created_at`,
    [verificationStatus, id]
  );
  return result.rows[0];
};
