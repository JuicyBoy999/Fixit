





















import pool from '../config/db.js';

const LEADERBOARD_QUERY = `
  SELECT
    u.id,
    u.first_name,
    u.last_name,
    u.city,
    COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS avg_rating,
    COUNT(DISTINCT r.id)                          AS review_count,
    COUNT(DISTINCT CASE
            WHEN rr.status = 'completed' THEN rr.id
          END)                                    AS completed_jobs
  FROM users u
  JOIN technician_profiles tp ON tp.user_id = u.id
  LEFT JOIN reviews         r  ON r.technician_id  = u.id
  LEFT JOIN repair_requests rr ON rr.technician_id = u.id
  WHERE u.role = 'technician'
    AND COALESCE(u.status, 'active') = 'active'
    AND tp.status = 'active'
    AND tp.verification_status = 'approved'
  GROUP BY u.id, u.first_name, u.last_name, u.city
  ORDER BY avg_rating DESC, completed_jobs DESC, u.first_name ASC
`;


export const getLeaderboard = async (_req, res) => {
  try {
    const { rows } = await pool.query(LEADERBOARD_QUERY);

    const technicians = rows.map((t, i) => ({
      rank:           i + 1,
      id:             t.id,
      name:           `${t.first_name} ${t.last_name}`.trim(),
      city:           t.city,
      avg_rating:     Number(t.avg_rating),
      review_count:   Number(t.review_count),
      completed_jobs: Number(t.completed_jobs),
    }));

    res.json({ technicians });
  } catch (err) {
    
    res.status(500).json({ error: err.message });
  }
};


export const exportLeaderboardCsv = async (_req, res) => {
  try {
    const { rows } = await pool.query(LEADERBOARD_QUERY);

    const header = 'Rank,Name,City,Average Rating,Reviews,Completed Jobs';

    const escape = (val) => {
      const s = String(val ?? '');
      
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const lines = rows.map((t, i) => [
      i + 1,
      `${t.first_name} ${t.last_name}`.trim(),
      t.city,
      t.avg_rating,
      t.review_count,
      t.completed_jobs,
    ].map(escape).join(','));

    const csv = [header, ...lines].join('\n');
    const filename = `technician-leaderboard-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
