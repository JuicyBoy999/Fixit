import pool from '../config/db.js';

export const createServiceAreaTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS service_areas (
      id             SERIAL PRIMARY KEY,
      technician_id  INTEGER UNIQUE,
      base_location  TEXT,
      radius         TEXT,
      created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

createServiceAreaTable();

export const upsertServiceArea = async (technicianId, baseLocation, radius) => {
  const { rows } = await pool.query(
    `INSERT INTO service_areas (technician_id, base_location, radius)
     VALUES ($1, $2, $3)
     ON CONFLICT (technician_id)
     DO UPDATE SET base_location = $2, radius = $3
     RETURNING *`,
    [technicianId, baseLocation, radius]
  );
  return rows[0];
};

export const getServiceArea = async (technicianId) => {
  const { rows } = await pool.query(
    `SELECT * FROM service_areas WHERE technician_id = $1`,
    [technicianId]
  );
  return rows[0] || null;
};