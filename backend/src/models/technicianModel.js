import pool from '../config/db.js';

export const getTechnicians = async () => {
  const result = await pool.query(
    `SELECT
       tp.id,
       tp.full_name,
       tp.title,
       tp.bio,
       tp.skills,
       tp.location,
       tp.years_experience,
       COALESCE(ROUND(AVG(tr.rating)::numeric, 1), 0) AS average_rating,
       COUNT(tr.id)::int AS review_count,
       COUNT(DISTINCT tc.id)::int AS certification_count
     FROM technician_profiles tp
     LEFT JOIN technician_reviews tr ON tr.technician_id = tp.id
     LEFT JOIN technician_certifications tc ON tc.technician_id = tp.id
     GROUP BY tp.id
     ORDER BY average_rating DESC, review_count DESC, tp.full_name ASC`
  );

  return result.rows;
};

export const getTechnicianById = async (id) => {
  const profileResult = await pool.query(
    `SELECT
       tp.id,
       tp.full_name,
       tp.title,
       tp.bio,
       tp.skills,
       tp.location,
       tp.years_experience,
       COALESCE(ROUND(AVG(tr.rating)::numeric, 1), 0) AS average_rating,
       COUNT(tr.id)::int AS review_count
     FROM technician_profiles tp
     LEFT JOIN technician_reviews tr ON tr.technician_id = tp.id
     WHERE tp.id = $1
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
