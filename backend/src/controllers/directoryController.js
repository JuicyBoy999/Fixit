













import pool from '../config/db.js';
import { sendAccountStatusEmail } from '../services/notificationService.js';

const DIRECTORY_QUERY = `
  SELECT
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    u.city,
    u.role,
    COALESCE(u.status, 'active') AS status,
    u.created_at,

    -- Customer activity
    COUNT(DISTINCT booked.id) AS bookings_made,

    -- Technician activity
    COUNT(DISTINCT assigned.id) AS jobs_assigned,
    COUNT(DISTINCT CASE
      WHEN assigned.status = 'completed' THEN assigned.id
    END) AS jobs_completed,

    GREATEST(
      MAX(booked.created_at),
      MAX(assigned.created_at)
    ) AS last_activity

  FROM users u
  LEFT JOIN repair_requests booked   ON booked.customer_id   = u.id
  LEFT JOIN repair_requests assigned ON assigned.technician_id = u.id
  GROUP BY u.id
  ORDER BY u.created_at DESC
`;


export const listDirectory = async (_req, res) => {
  try {
    const { rows } = await pool.query(DIRECTORY_QUERY);

    const users = rows.map(u => ({
      id:         u.id,
      name:       `${u.first_name} ${u.last_name}`.trim(),
      email:      u.email,
      phone:      u.phone,
      city:       u.city,
      role:       u.role,
      status:     u.status,
      joined_at:  u.created_at,
      activity: {
        bookings_made:  Number(u.bookings_made),
        jobs_assigned:  Number(u.jobs_assigned),
        jobs_completed: Number(u.jobs_completed),
        last_activity:  u.last_activity,
      },
    }));

    
    const counts = users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    res.json({ users, counts, total: users.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};






export const setAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'suspended', 'deactivated'].includes(status)) {
      return res.status(400).json({ error: 'status must be active, suspended, or deactivated' });
    }

    
    
    const target = await pool.query(
      'SELECT id, role, email, first_name, last_name FROM users WHERE id = $1',
      [id]
    );
    if (!target.rows.length) return res.status(404).json({ error: 'User not found' });

    if (target.rows[0].role === 'admin' && status !== 'active') {
      const { rows } = await pool.query(
        `SELECT COUNT(*) AS count FROM users
         WHERE role = 'admin' AND COALESCE(status, 'active') = 'active'`
      );
      if (Number(rows[0].count) <= 1) {
        return res.status(400).json({
          error: 'Cannot deactivate the only active admin account.',
        });
      }
    }

    const { rows } = await pool.query(
      `UPDATE users SET status = $1 WHERE id = $2
       RETURNING id, first_name, last_name, email, role, status`,
      [status, id]
    );

    if (target.rows[0].role === 'technician') {
      await pool.query(
        `UPDATE technician_profiles
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [status, id]
      );
    }

    if (status !== 'active' && target.rows[0].email) {
      await sendAccountStatusEmail(
        target.rows[0].email,
        target.rows[0].first_name,
        status,
        reason?.trim() || `A Fixit administrator ${status} your account.`
      );
    }

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const exportDirectoryCsv = async (_req, res) => {
  try {
    const { rows } = await pool.query(DIRECTORY_QUERY);

    const escape = (val) => {
      const s = String(val ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const header = 'Name,Email,Phone,City,Role,Status,Joined,Bookings,Jobs Assigned,Jobs Completed';
    const lines = rows.map(u => [
      `${u.first_name} ${u.last_name}`.trim(),
      u.email,
      u.phone,
      u.city,
      u.role,
      u.status || 'active',
      u.created_at?.toISOString?.().split('T')[0] || u.created_at,
      u.bookings_made,
      u.jobs_assigned,
      u.jobs_completed,
    ].map(escape).join(','));

    const csv = [header, ...lines].join('\n');
    const filename = `user-directory-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
