
import pool from '../config/db.js';

export const getWorkingHours = async (technicianId) => {
  const result = await pool.query(
    `SELECT id, day_of_week, start_time, end_time, is_active
     FROM technician_working_hours
     WHERE technician_id = $1
     ORDER BY day_of_week`,
    [technicianId]
  );
  return result.rows;
};


export const upsertWorkingHours = async (technicianId, dayOfWeek, startTime, endTime, isActive) => {
  const result = await pool.query(
    `INSERT INTO technician_working_hours
       (technician_id, day_of_week, start_time, end_time, is_active, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (technician_id, day_of_week)
     DO UPDATE SET
       start_time = EXCLUDED.start_time,
       end_time   = EXCLUDED.end_time,
       is_active  = EXCLUDED.is_active,
       updated_at = NOW()
     RETURNING *`,
    [technicianId, dayOfWeek, startTime, endTime, isActive]
  );
  return result.rows[0];
};


export const getUnavailableDates = async (technicianId) => {
  const result = await pool.query(
    `SELECT id, unavailable_date, reason
     FROM technician_unavailability
     WHERE technician_id = $1
     ORDER BY unavailable_date`,
    [technicianId]
  );
  return result.rows;
};


export const addUnavailableDate = async (technicianId, date, reason = null) => {
  const result = await pool.query(
    `INSERT INTO technician_unavailability (technician_id, unavailable_date, reason)
     VALUES ($1, $2, $3)
     ON CONFLICT (technician_id, unavailable_date) DO NOTHING
     RETURNING *`,
    [technicianId, date, reason]
  );
  return result.rows[0];
};


export const removeUnavailableDate = async (technicianId, date) => {
  const result = await pool.query(
    `DELETE FROM technician_unavailability
     WHERE technician_id = $1 AND unavailable_date = $2
     RETURNING *`,
    [technicianId, date]
  );
  return result.rows[0];
};

export const getSlotsForDate = async (technicianId, dateStr) => {
  const blockRes = await pool.query(
    `SELECT 1 FROM technician_unavailability
     WHERE technician_id = $1 AND unavailable_date = $2`,
    [technicianId, dateStr]
  );
  if (blockRes.rowCount > 0) return buildSlots(null, null); // all greyed

  const date = new Date(dateStr);
  const dayOfWeek = date.getUTCDay();

  const hoursRes = await pool.query(
    `SELECT start_time, end_time FROM technician_working_hours
     WHERE technician_id = $1 AND day_of_week = $2 AND is_active = TRUE`,
    [technicianId, dayOfWeek]
  );
  if (hoursRes.rowCount === 0) return buildSlots(null, null); // no hours set → all greyed

  const { start_time, end_time } = hoursRes.rows[0];
  return buildSlots(start_time, end_time);
};

function buildSlots(startTime, endTime) {
  const slots = [];
  for (let h = 8; h < 18; h++) {
    const label = `${String(h).padStart(2, '0')}:00`;
    let available = false;
    if (startTime && endTime) {
      const slotH  = h;
      const startH = parseInt(startTime.split(':')[0], 10);
      const endH   = parseInt(endTime.split(':')[0],   10);
      available = slotH >= startH && slotH < endH;
    }
    slots.push({ time: label, available });
  }
  return slots;
}