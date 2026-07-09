import pool from '../config/db.js';

export const createNotificationTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL,
      title       TEXT,
      message     TEXT,
      type        TEXT DEFAULT 'info',
      is_read     BOOLEAN DEFAULT FALSE,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

createNotificationTable();

export const getNotifications = async (userId) => {
  const { rows } = await pool.query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

export const addNotification = async (userId, title, message, type = 'info') => {
  const { rows } = await pool.query(
    `INSERT INTO notifications (user_id, title, message, type)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, title, message, type]
  );
  return rows[0];
};

export const markNotificationRead = async (id) => {
  const { rows } = await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0];
};

export const markAllNotificationsRead = async (userId) => {
  const { rows } = await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 RETURNING *`,
    [userId]
  );
  return rows;
};

export const deleteNotification = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM notifications WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0];
};
