import pool from '../config/db.js';
import { addNotification } from '../models/notificationModel.js';

export const listRepairRequests = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM repair_requests WHERE technician_id IS NULL ORDER BY created_at DESC`
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

export const createRepairRequest = async (req, res) => {
  try {
    const { customer_id, technician_id, device_type, fault_description, photo_url, preferred_date, preferred_time, customer_area } = req.body;

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

    if (customer_id) {
      await addNotification(
        customer_id,
        'Booking received',
        `We received your ${device_type} repair request for ${preferred_date}${preferred_time ? ' at ' + preferred_time : ''}. A technician will confirm shortly.`,
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

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Status must be accepted or declined' });
    }

    const { rows } = await pool.query(
     `UPDATE repair_requests SET status = $1, technician_id = $2 WHERE id = $3 RETURNING *`
[status, req.user.id, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Request not found' });

    const booking = rows[0];
    if (booking.customer_id) {
      const confirmed = status === 'accepted';
      await addNotification(
        booking.customer_id,
        confirmed ? 'Booking confirmed' : 'Booking declined',
        confirmed
          ? `A technician has accepted your ${booking.device_type} repair on ${booking.preferred_date}${booking.preferred_time ? ' at ' + booking.preferred_time : ''}.`
          : `Your ${booking.device_type} repair request was declined. Please try another technician.`,
        confirmed ? 'success' : 'danger'
      );
    }

    res.json({ success: true, ...booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List all bookings that belong to one customer (for cancel / reschedule screens)
export const listMyRepairRequests = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { rows } = await pool.query(
      `SELECT * FROM repair_requests WHERE customer_id = $1 ORDER BY preferred_date DESC, created_at DESC`,
      [customerId]
    );
    res.json({ requests: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Creates reminder notifications for appointments happening tomorrow.
// Idempotent: each booking is only reminded once (reminder_sent flag).
// Reusable by both the scheduled timer and the manual trigger endpoint.
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

// POST /api/repair-requests/run-reminders — manual trigger (also runs on a timer)
export const runAppointmentReminders = async (req, res) => {
  try {
    const sent = await generateDueReminders();
    res.json({ success: true, sent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upcoming bookings used by the Appointment Reminder page
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

// Cancel a booking (Cancel Booking page)
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

// Reschedule a booking (Reschedule Booking page)
export const rescheduleRepairRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { preferred_date, preferred_time } = req.body;

    if (!preferred_date) return res.status(400).json({ error: 'preferred_date is required' });

    const { rows } = await pool.query(
      `UPDATE repair_requests
       SET preferred_date = $1, preferred_time = $2, status = 'rescheduled'
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