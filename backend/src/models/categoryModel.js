





import pool from '../config/db.js';

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS device_categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      repair_types TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  
  const { rows } = await pool.query('SELECT COUNT(*) FROM device_categories');
  if (Number(rows[0].count) === 0) {
    const defaults = [
      ['Smartphone', 'Screen replacement, Battery, Charging port'],
      ['Laptop', 'Screen, Keyboard, Battery, Overheating'],
      ['TV', 'Display panel, Power board, Backlight'],
      ['Desktop', 'PSU, Motherboard, Storage'],
      ['Tablet', 'Screen, Battery, Charging port'],
      ['Gaming Console', 'HDMI port, Disc drive, Overheating'],
      ['Home Appliance', 'Motor, Wiring, Control board'],
      ['Other', 'General diagnostics'],
    ];

    for (const [name, repair_types] of defaults) {
      await pool.query(
        'INSERT INTO device_categories (name, repair_types) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [name, repair_types]
      );
    }
    console.log('device_categories seeded with default device types');
  }
};

createTable().catch(err => console.error('device_categories table error:', err.message));

export default pool;