import pool from '../config/db.js';
import { addNotification } from '../models/notificationModel.js';

export const listRepairRequests = async (req, res) => {
  try {
    const techId = req.user?.id;
    console.log('[LIST REQUESTS] techId from token:', techId);
    const { rows } = await pool.query(
      `SELECT r.*,
              u.first_name AS technician_first_name,
              u.last_name  AS technician_last_name,
              cu.first_name AS customer_first_name,
              cu.last_name  AS customer_last_name
       FROM repair_requests r
       LEFT JOIN users u  ON u.id  = r.technician_id
       LEFT JOIN users cu ON cu.id = r.customer_id
       WHERE r.status = 'pending'
          OR r.technician_id = $1
       ORDER BY r.created_at DESC`,
      [techId || 0]
    );
    res.json({ requests: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRepairRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT * FROM repair_requests WHERE id = $1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Request not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const notifyTechniciansOfNewRequest = async (booking) => {
  const { device_type, customer_area, preferred_date } = booking;
  try {
    const { rows: techs } = await pool.query(
      `SELECT id FROM users WHERE role = 'technician' AND LOWER(city) = LOWER($1)`,
      [customer_area]
    );
    const notifyList = techs.length > 0 ? techs : (
      await pool.query(`SELECT id FROM users WHERE role = 'technician'`)
    ).rows;
    for (const tech of notifyList) {
      await addNotification(
        tech.id,
        'New repair request nearby',
        `A customer in ${customer_area} has requested ${device_type} repair for ${preferred_date}. Check your repair requests to accept.`,
        'info'
      );
    }
  } catch (err) {
    console.error('[NOTIFY TECHNICIANS] failed:', err.message);
  }
};

export const createRepairRequest = async (req, res) => {
  try {
    const { technician_id, device_type, fault_description, photo_url, preferred_date, preferred_time, customer_area } = req.body;
    const customer_id = req.user?.id || req.body.customer_id || null;

    console.log('[CREATE BOOKING] customer_id:', customer_id, '| technician_id:', technician_id, '| device:', device_type, '| req.user:', req.user?.id);

    if (!device_type || !preferred_date || !customer_area) {
      return res.status(400).json({ error: 'device_type, preferred_date and customer_area are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO repair_requests
        (customer_id, technician_id, device_type, fault_description, photo_url, preferred_date, preferred_time, customer_area)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [customer_id, technician_id, device_type, fault_description, photo_url || null, preferred_date, preferred_time || null, customer_area]
    );

    console.log('[CREATE BOOKING] Saved row id:', rows[0]?.id, '| customer_id in DB:', rows[0]?.customer_id, '| technician_id in DB:', rows[0]?.technician_id);

    if (customer_id) {
      await addNotification(
        customer_id,
        'Booking received',
        `We received your ${device_type} repair request for ${preferred_date}${preferred_time ? ' at ' + preferred_time : ''}. Complete payment to confirm your slot.`,
        'info'
      );
    }

    res.status(201).json({ success: true, request: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateRepairRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['accepted', 'confirmed', 'in_route', 'in_progress', 'completed', 'declined'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
    }

    const setTech = !['declined'].includes(status);
    const { rows } = await pool.query(
      setTech
        ? `UPDATE repair_requests SET status = $1, technician_id = $2 WHERE id = $3 RETURNING *`
        : `UPDATE repair_requests SET status = $1 WHERE id = $2 RETURNING *`,
      setTech ? [status, req.user.id, id] : [status, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Request not found' });

    const booking = rows[0];
    if (booking.customer_id) {
      const eta = req.body.eta || null;
      const notifMap = {
        accepted:    { title: 'Booking confirmed',       msg: `Your ${booking.device_type} repair has been accepted for ${booking.preferred_date}${booking.preferred_time ? ' at ' + booking.preferred_time : ''}.`, type: 'success' },
        confirmed:   { title: 'Repair confirmed',        msg: `Your ${booking.device_type} repair appointment is confirmed for ${booking.preferred_date}${booking.preferred_time ? ' at ' + booking.preferred_time : ''}.`, type: 'success' },
        in_route:    { title: 'Technician on the way!',  msg: `Your technician is heading to you now${eta ? ' — estimated arrival in ' + eta : ''}. Please be ready at home.`, type: 'info' },
        in_progress: { title: 'Repair in progress',      msg: `Your technician has started working on your ${booking.device_type}. You will be notified when it is done.`, type: 'info' },
        completed:   { title: 'Repair completed',        msg: `Your ${booking.device_type} repair is complete. Payment of the agreed amount is now due. Thank you for choosing Fixit!`, type: 'success' },
        declined:    { title: 'Booking declined',        msg: `Your ${booking.device_type} repair request was declined. Please try another technician.`, type: 'danger' },
      };
      const n = notifMap[status];
      if (n) await addNotification(booking.customer_id, n.title, n.msg, n.type);
    }

    res.json({ success: true, ...booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEarnings = async (req, res) => {
  try {
    const techId = parseInt(req.params.techId, 10);
    if (isNaN(techId)) return res.json({ jobs: [], total: 0 });
    const { rows } = await pool.query(
      `SELECT r.id, r.device_type, r.preferred_date, r.fault_description,
              r.cost, u.first_name AS customer_first_name, u.last_name AS customer_last_name
       FROM repair_requests r
       LEFT JOIN users u ON u.id = r.customer_id
       WHERE r.technician_id = $1 AND r.status = 'completed'
       ORDER BY r.preferred_date DESC`,
      [techId]
    );
    const total = rows.reduce((sum, j) => sum + (Number(j.cost) || 0), 0);
    res.json({ jobs: rows, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRepairMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT m.id, m.sender_id, m.content, m.created_at,
              (u.first_name || ' ' || u.last_name) AS sender_name, u.role AS sender_role
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.repair_id = $1
       ORDER BY m.created_at ASC`,
      [id]
    );
    res.json({ messages: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const postRepairMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const senderId = req.user?.id;
    if (!content?.trim() || !senderId) return res.status(400).json({ error: 'Content required' });
    const { rows } = await pool.query(
      `INSERT INTO messages (repair_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [id, senderId, content.trim()]
    );
    const msg = rows[0];
    const { rows: repairRows } = await pool.query(`SELECT * FROM repair_requests WHERE id = $1`, [id]);
    if (repairRows.length) {
      const repair = repairRows[0];
      const otherId = repair.customer_id === senderId ? repair.technician_id : repair.customer_id;
      if (otherId) {
        await addNotification(otherId, 'New message', `You have a new message about your ${repair.device_type} repair.`, 'info');
      }
    }
    res.status(201).json({ message: msg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const claimOrphanedBookings = async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId, 10);
    if (!isNaN(customerId)) {
      await pool.query(
        `UPDATE repair_requests SET customer_id = $1::integer WHERE customer_id IS NULL`,
        [customerId]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listMyBookings = async (req, res) => {
  try {
    const customerId = req.user?.id;
    console.log('[LIST MY BOOKINGS] customerId from token:', customerId);
    if (!customerId) return res.status(401).json({ error: 'Not authenticated' });
    const { rows } = await pool.query(
      `SELECT r.*,
              u.first_name AS technician_first_name,
              u.last_name  AS technician_last_name,
              rv.id         AS review_id,
              rv.rating     AS review_rating,
              rv.body       AS review_body,
              rv.created_at AS review_created_at,
              rv.edited_at  AS review_edited_at,
              rv.original_body AS review_original_body
       FROM repair_requests r
       LEFT JOIN users u   ON u.id = r.technician_id
       LEFT JOIN reviews rv ON rv.booking_id = r.id
       WHERE r.customer_id = $1
       ORDER BY r.created_at DESC`,
      [customerId]
    );
    res.json({ requests: rows });
  } catch (err) {
    console.error('listMyBookings error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

export const listMyRepairRequests = async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId, 10);
    if (isNaN(customerId)) return res.json({ requests: [] });
    const { rows } = await pool.query(
      `SELECT r.*,
              u.first_name AS technician_first_name,
              u.last_name  AS technician_last_name
       FROM repair_requests r
       LEFT JOIN users u ON u.id = r.technician_id
       WHERE r.customer_id = $1::integer
       ORDER BY r.created_at DESC`,
      [customerId]
    );
    res.json({ requests: rows });
  } catch (err) {
    console.error('listMyRepairRequests error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

export const generateDueReminders = async () => {
  const { rows } = await pool.query(
    `SELECT * FROM repair_requests
     WHERE preferred_date = CURRENT_DATE + INTERVAL '1 day'
       AND status NOT IN ('cancelled', 'declined')
       AND reminder_sent = FALSE`
  );
  for (const b of rows) {
    if (!b.customer_id) continue;
    const dateStr = new Date(b.preferred_date).toISOString().split('T')[0];
    await addNotification(
      b.customer_id,
      'Appointment reminder',
      `Reminder: your ${b.device_type} repair is tomorrow (${dateStr})${b.preferred_time ? ' at ' + b.preferred_time : ''}.`,
      'warning'
    );
    await pool.query(`UPDATE repair_requests SET reminder_sent = TRUE WHERE id = $1`, [b.id]);
  }
  return rows.length;
};

export const runAppointmentReminders = async (req, res) => {
  try {
    const sent = await generateDueReminders();
    res.json({ success: true, sent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUpcomingReminders = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { rows } = await pool.query(
      `SELECT * FROM repair_requests
       WHERE customer_id = $1
         AND preferred_date >= CURRENT_DATE
         AND status NOT IN ('cancelled', 'declined')
       ORDER BY preferred_date ASC`,
      [customerId]
    );
    res.json({ reminders: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const cancelRepairRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) return res.status(400).json({ error: 'A cancellation reason is required' });

    const { rows } = await pool.query(
      `UPDATE repair_requests
       SET status = 'cancelled', cancel_reason = $1
       WHERE id = $2 RETURNING *`,
      [reason, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Request not found' });

    const booking = rows[0];
    if (booking.customer_id) {
      await addNotification(
        booking.customer_id,
        'Booking cancelled',
        `Your ${booking.device_type} repair booking has been cancelled. Reason: ${reason}.`,
        'cancelled'
      );
    }

    res.json({ success: true, request: booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const rescheduleRepairRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { preferred_date, preferred_time } = req.body;

    if (!preferred_date) return res.status(400).json({ error: 'preferred_date is required' });

    const { rows } = await pool.query(
      `UPDATE repair_requests
       SET preferred_date = $1, preferred_time = $2
       WHERE id = $3 RETURNING *`,
      [preferred_date, preferred_time || null, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Request not found' });

    const booking = rows[0];
    if (booking.customer_id) {
      await addNotification(
        booking.customer_id,
        'Booking rescheduled',
        `Your ${booking.device_type} repair has been moved to ${preferred_date}${preferred_time ? ' at ' + preferred_time : ''}.`,
        'info'
      );
    }

    res.json({ success: true, request: booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};