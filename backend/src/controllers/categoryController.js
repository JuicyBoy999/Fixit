








import pool from '../config/db.js';


export const listCategories = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, repair_types FROM device_categories WHERE is_active = TRUE ORDER BY name ASC'
    );
    res.json({ categories: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const listAllCategories = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM device_categories ORDER BY name ASC'
    );
    res.json({ categories: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, repair_types, is_active } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO device_categories (name, repair_types, is_active)
       VALUES ($1, $2, $3) RETURNING *`,
      [name.trim(), repair_types || null, is_active !== false]
    );

    res.status(201).json({ success: true, category: rows[0] });
  } catch (err) {
    
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A category with that name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, repair_types, is_active } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const { rows } = await pool.query(
      `UPDATE device_categories
       SET name = $1, repair_types = $2, is_active = $3
       WHERE id = $4 RETURNING *`,
      [name.trim(), repair_types || null, is_active !== false, id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Category not found' });

    res.json({ success: true, category: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A category with that name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      'DELETE FROM device_categories WHERE id = $1 RETURNING *',
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Category not found' });

    res.json({ success: true, deleted: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
