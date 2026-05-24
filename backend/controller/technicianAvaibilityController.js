import pool from '../database/db.js';

export const saveAvailability = async (req, res) => {
  const { hours } = req.body;
  try {
    await pool.query(
      `INSERT INTO technicians (user_id, availability)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET availability=$2`,
      ['tech_1', JSON.stringify(hours)]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAvailability = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT availability FROM technicians WHERE user_id = $1`,
      ['tech_1']
    );
    if (result.rows.length === 0 || !result.rows[0].availability) return res.json({});
    res.json({ hours: JSON.parse(result.rows[0].availability) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};