import pool from '../config/db.js';
import { addNotification } from '../models/notificationModel.js';
import { getSlotsForDate } from '../models/availabilityModel.js';
import { sendBookingStatusEmail } from '../services/notificationService.js';

const CHAT_ENABLED_STATUSES = ['confirmed', 'in_route', 'in_progress', 'completed'];

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
       WHERE r.technician_id = $1
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
      `SELECT r.*,
              u.first_name  AS technician_first_name,
              u.last_name   AS technician_last_name,
              cu.first_name AS customer_first_name,
              cu.last_name  AS customer_last_name
       FROM repair_requests r
       LEFT JOIN users u  ON u.id  = r.technician_id
       LEFT JOIN users cu ON cu.id = r.customer_id
       WHERE r.id = $1`,
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
    const { technician_id, device_type, fault_description, photo_url, preferred_date, preferred_time, customer_area, address } = req.body;
    const customer_id = req.user?.id || req.body.customer_id || null;

    console.log('[CREATE BOOKING] customer_id:', customer_id, '| technician_id:', technician_id, '| device:', device_type, '| req.user:', req.user?.id);

    if (!device_type || !preferred_date || !customer_area) {
      return res.status(400).json({ error: 'device_type, preferred_date and customer_area are required' });
    }

    if (fault_description && fault_description.length > 500) {
      return res.status(400).json({ error: 'fault_description must be 500 characters or fewer' });
    }

    if (technician_id && preferred_time) {
      const slots = await getSlotsForDate(technician_id, preferred_date);
      const slot = slots.find(s => s.time === preferred_time);
      if (!slot || !slot.available) {
        return res.status(409).json({ error: 'That slot is no longer available for this technician. Please choose another time.' });
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO repair_requests
        (customer_id, technician_id, device_type, fault_description, photo_url, preferred_date, preferred_time, customer_area, address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [customer_id, technician_id, device_type, fault_description, photo_url || null, preferred_date, preferred_time || null, customer_area, address || null]
    );

    const booking = rows[0];
    console.log('[CREATE BOOKING] Saved row id:', booking?.id, '| customer_id in DB:', booking?.customer_id, '| technician_id in DB:', booking?.technician_id);

    if (technician_id) {
      await addNotification(
        technician_id,
        'New repair request',
        `A customer in ${customer_area} has requested ${device_type} repair for ${preferred_date}${preferred_time ? ' at ' + preferred_time : ''}. Check your repair requests to accept.`,
        'info'
      );

      try {
        const { rows: techRows } = await pool.query('SELECT email, first_name FROM users WHERE id = $1', [technician_id]);
        const technician = techRows[0];
        if (technician?.email) {
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          sendBookingStatusEmail(
            technician.email,
            technician.first_name,
            'New Repair Request — FixIt',
            'A customer booked you for a repair',
            `a customer in ${customer_area} has requested a ${device_type} repair for ${preferred_date}${preferred_time ? ' at ' + preferred_time : ''}${fault_description ? `. Issue: "${fault_description}"` : ''}. View and accept it from your repair requests: ${frontendUrl}/repair-requests`
          ).catch(() => {});
        }
      } catch { /* email is best-effort */ }
    }

    if (customer_id) {
      await addNotification(
        customer_id,
        'Booking received',
        `We received your ${device_type} repair request for ${preferred_date}${preferred_time ? ' at ' + preferred_time : ''}. Complete payment to confirm your slot.`,
        'info'
      );

      try {
        const { rows: customerRows } = await pool.query('SELECT email, first_name FROM users WHERE id = $1', [customer_id]);
        const customer = customerRows[0];
        let technicianName = 'your technician';
        if (technician_id) {
          const { rows: techRows } = await pool.query('SELECT first_name, last_name FROM users WHERE id = $1', [technician_id]);
          if (techRows[0]) technicianName = `${techRows[0].first_name} ${techRows[0].last_name}`;
        }
        if (customer?.email) {
          sendBookingStatusEmail(
            customer.email,
            customer.first_name,
            'Booking Received — FixIt',
            'We received your repair request',
            `your ${device_type} repair request for ${preferred_date}${preferred_time ? ' at ' + preferred_time : ''} with ${technicianName} has been received${address ? ` at ${address}` : ''}. Complete payment to confirm your slot.`
          ).catch(() => {});
        }
      } catch { /* email is best-effort */ }
    }

    res.status(201).json({ success: true, request: booking });
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

      if (status === 'accepted') {
        try {
          const { rows: customerRows } = await pool.query('SELECT email, first_name FROM users WHERE id = $1', [booking.customer_id]);
          const customer = customerRows[0];
          if (customer?.email) {
            const { rows: techRows } = await pool.query('SELECT first_name, last_name FROM users WHERE id = $1', [req.user.id]);
            const technicianName = techRows[0] ? `${techRows[0].first_name} ${techRows[0].last_name}` : 'Your technician';
            sendBookingStatusEmail(
              customer.email,
              customer.first_name,
              'Booking Confirmed — FixIt',
              'Your repair booking is confirmed',
              `${technicianName} has accepted your ${booking.device_type} repair for ${booking.preferred_date}${booking.preferred_time ? ' at ' + booking.preferred_time : ''}${booking.address ? ` at ${booking.address}` : ''}.`
            ).catch(() => {});
          }
        } catch { /* email is best-effort */ }
      }
    }

    res.json({ success: true, ...booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEarnings = async (req, res) => {
  try {
    const techId = parseInt(req.params.techId, 10);
    if (isNaN(techId)) return res.json({ jobs: [], total: 0, pending: 0, pendingJobs: [] });
    const { rows } = await pool.query(
      `SELECT r.id, r.device_type, r.preferred_date, r.fault_description, r.status,
              r.cost, r.amount, u.first_name AS customer_first_name, u.last_name AS customer_last_name
       FROM repair_requests r
       LEFT JOIN users u ON u.id = r.customer_id
       WHERE r.technician_id = $1 AND r.status IN ('completed', 'accepted', 'confirmed', 'in_route', 'in_progress')
       ORDER BY r.preferred_date DESC`,
      [techId]
    );
    const jobs = rows.filter(j => j.status === 'completed');
    const pendingJobs = rows.filter(j => j.status !== 'completed');
    const total = jobs.reduce((sum, j) => sum + (Number(j.cost || j.amount) || 0), 0);
    const pending = pendingJobs.reduce((sum, j) => sum + (Number(j.cost || j.amount) || 0), 0);
    res.json({ jobs, total, pending, pendingJobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function authorizeChatAccess(req, id) {
  const { rows } = await pool.query(`SELECT * FROM repair_requests WHERE id = $1`, [id]);
  if (!rows.length) return { error: 404, message: 'Request not found' };
  const repair = rows[0];

  const userId = req.user?.id;
  const isAdmin = req.user?.role === 'admin';
  const isParty = repair.customer_id === userId || repair.technician_id === userId;
  if (!isAdmin && !isParty) return { error: 403, message: 'Access denied' };

  if (!isAdmin && !CHAT_ENABLED_STATUSES.includes(repair.status)) {
    return { error: 403, message: 'Chat is only available once the booking is confirmed' };
  }

  return { repair };
}

export const getRepairMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const auth = await authorizeChatAccess(req, id);
    if (auth.error) return res.status(auth.error).json({ error: auth.message });

    await pool.query(
      `UPDATE messages SET read_at = CURRENT_TIMESTAMP
       WHERE repair_id = $1 AND sender_id != $2 AND read_at IS NULL`,
      [id, req.user.id]
    );

    const { rows } = await pool.query(
      `SELECT m.id, m.sender_id, m.content, m.created_at, m.read_at, m.flagged,
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

    const auth = await authorizeChatAccess(req, id);
    if (auth.error) return res.status(auth.error).json({ error: auth.message });

    const { rows } = await pool.query(
      `INSERT INTO messages (repair_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [id, senderId, content.trim()]
    );
    const msg = rows[0];
    const repair = auth.repair;
    const otherId = repair.customer_id === senderId ? repair.technician_id : repair.customer_id;
    if (otherId) {
      await addNotification(otherId, 'New message', `You have a new message about your ${repair.device_type} repair.`, 'info');
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
  const { rows: dayOut } = await pool.query(
    `SELECT * FROM repair_requests
     WHERE preferred_date = CURRENT_DATE + INTERVAL '1 day'
       AND status NOT IN ('cancelled', 'declined')
       AND reminder_sent = FALSE`
  );
  for (const b of dayOut) {
    if (!b.technician_id) continue;
    const dateStr = new Date(b.preferred_date).toISOString().split('T')[0];
    await addNotification(
      b.technician_id,
      'Appointment reminder',
      `Reminder: your ${b.device_type} repair appointment is tomorrow (${dateStr})${b.preferred_time ? ' at ' + b.preferred_time : ''}.`,
      'warning'
    );
    await pool.query(`UPDATE repair_requests SET reminder_sent = TRUE WHERE id = $1`, [b.id]);
  }

  const { rows: hourOut } = await pool.query(
    `SELECT * FROM repair_requests
     WHERE status NOT IN ('cancelled', 'declined')
       AND reminder_sent_1h = FALSE
       AND preferred_time IS NOT NULL
       AND (preferred_date + preferred_time::time) BETWEEN NOW() AND NOW() + INTERVAL '75 minutes'`
  );
  for (const b of hourOut) {
    if (!b.technician_id) continue;
    await addNotification(
      b.technician_id,
      'Appointment starting soon',
      `Reminder: your ${b.device_type} repair appointment is in about an hour, at ${b.preferred_time}.`,
      'warning'
    );
    await pool.query(`UPDATE repair_requests SET reminder_sent_1h = TRUE WHERE id = $1`, [b.id]);
  }

  return dayOut.length + hourOut.length;
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
    if (booking.technician_id) {
      await addNotification(
        booking.technician_id,
        'Booking cancelled',
        `The ${booking.device_type} repair scheduled for ${booking.preferred_date}${booking.preferred_time ? ' at ' + booking.preferred_time : ''} was cancelled by the customer. Reason: ${reason}.`,
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

    const { rows: existingRows } = await pool.query(`SELECT * FROM repair_requests WHERE id = $1`, [id]);
    if (!existingRows.length) return res.status(404).json({ error: 'Request not found' });
    const existing = existingRows[0];

    if (existing.technician_id && preferred_time) {
      const slots = await getSlotsForDate(existing.technician_id, preferred_date);
      const slot = slots.find(s => s.time === preferred_time);
      if (!slot || !slot.available) {
        return res.status(409).json({ error: 'That slot is not available for this technician. Please choose another time.' });
      }
    }

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
    if (booking.technician_id) {
      await addNotification(
        booking.technician_id,
        'Booking rescheduled',
        `The ${booking.device_type} repair has been moved to ${preferred_date}${preferred_time ? ' at ' + preferred_time : ''} by the customer.`,
        'info'
      );
    }

    res.json({ success: true, request: booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};