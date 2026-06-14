import pool from '../config/db.js';

export const listRepairRequests = async (req, res) => {
  try {
    const technicianId = req.user?.id;
    if (!technicianId) return res.status(401).json({ error: 'Unauthorized' });

    const { rows } = await pool.query(
      `SELECT * FROM repair_requests WHERE technician_id = $1 ORDER BY created_at DESC`,
      [technicianId]
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
    const { customer_id, technician_id, device_type, fault_description, photo_url, preferred_date, customer_area } = req.body;

    if (!device_type || !preferred_date || !customer_area) {
      return res.status(400).json({ error: 'device_type, preferred_date and customer_area are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO repair_requests
        (customer_id, technician_id, device_type, fault_description, photo_url, preferred_date, customer_area)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [customer_id, technician_id, device_type, fault_description, photo_url || null, preferred_date, customer_area]
    );
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
      `UPDATE repair_requests SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Request not found' });
    res.json({ success: true, ...rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};