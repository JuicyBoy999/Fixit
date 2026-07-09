import pool from '../config/db.js';

/**
 * Create a new chat message.
 */
export const createMessage = async (repairId, senderId, content) => {
  const result = await pool.query(
    `INSERT INTO messages (repair_id, sender_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [repairId, senderId, content]
  );
  return result.rows[0];
};

/**
 * Retrieve messages for a repair with sender details.
 */
export const getMessagesByRepairId = async (repairId) => {
  const result = await pool.query(
    `SELECT m.id, m.repair_id, m.sender_id, m.content, m.flagged, m.flagged_by, m.created_at,
            (u.first_name || ' ' || u.last_name) AS sender_name, u.role AS sender_role
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.repair_id = $1
     ORDER BY m.created_at ASC`,
    [repairId]
  );
  return result.rows;
};

/**
 * Flag a message as inappropriate.
 */
export const flagMessage = async (messageId, flaggedById) => {
  const result = await pool.query(
    `UPDATE messages
     SET flagged = TRUE, flagged_by = $2
     WHERE id = $1
     RETURNING *`,
    [messageId, flaggedById]
  );
  return result.rows[0];
};

/**
 * Get all flagged messages (for Admin).
 */
export const getFlaggedMessages = async () => {
  const result = await pool.query(
    `SELECT m.id, m.repair_id, m.sender_id, m.content, m.flagged, m.flagged_by, m.created_at,
            (su.first_name || ' ' || su.last_name) AS sender_name, su.email AS sender_email,
            (fu.first_name || ' ' || fu.last_name) AS flagger_name, fu.email AS flagger_email
     FROM messages m
     JOIN users su ON m.sender_id = su.id
     LEFT JOIN users fu ON m.flagged_by = fu.id
     WHERE m.flagged = TRUE
     ORDER BY m.created_at DESC`
  );
  return result.rows;
};

/**
 * Delete a message.
 */
export const deleteMessage = async (messageId) => {
  const result = await pool.query(
    `DELETE FROM messages WHERE id = $1 RETURNING *`,
    [messageId]
  );
  return result.rows[0];
};

/**
 * Record a user warning.
 */
export const createWarning = async (userId, adminId, reason) => {
  const result = await pool.query(
    `INSERT INTO user_warnings (user_id, admin_id, reason)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, adminId, reason]
  );
  return result.rows[0];
};
