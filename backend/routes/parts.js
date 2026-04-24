const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/parts
router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    let query = 'SELECT * FROM parts_inventory';
    const params = [];
    const conditions = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List parts error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/parts/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM parts_inventory WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Part not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get part error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/parts
router.post('/', async (req, res) => {
  try {
    const { part_number, name, category, quantity, min_quantity, unit_cost, supplier, location, compatible_vehicles, last_ordered, status } = req.body;

    const result = await pool.query(
      `INSERT INTO parts_inventory (part_number, name, category, quantity, min_quantity, unit_cost, supplier, location, compatible_vehicles, last_ordered, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [part_number, name, category, quantity || 0, min_quantity || 5, unit_cost || 0, supplier, location, compatible_vehicles, last_ordered, status || 'in_stock']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create part error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Part with this part number already exists.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/parts/:id
router.put('/:id', async (req, res) => {
  try {
    const { part_number, name, category, quantity, min_quantity, unit_cost, supplier, location, compatible_vehicles, last_ordered, status } = req.body;

    const result = await pool.query(
      `UPDATE parts_inventory SET
        part_number = COALESCE($1, part_number),
        name = COALESCE($2, name),
        category = COALESCE($3, category),
        quantity = COALESCE($4, quantity),
        min_quantity = COALESCE($5, min_quantity),
        unit_cost = COALESCE($6, unit_cost),
        supplier = COALESCE($7, supplier),
        location = COALESCE($8, location),
        compatible_vehicles = $9,
        last_ordered = COALESCE($10, last_ordered),
        status = COALESCE($11, status)
       WHERE id = $12
       RETURNING *`,
      [part_number, name, category, quantity, min_quantity, unit_cost, supplier, location, compatible_vehicles, last_ordered, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Part not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update part error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Part with this part number already exists.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/parts/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM parts_inventory WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Part not found.' });
    }

    res.json({ message: 'Part deleted successfully.', part: result.rows[0] });
  } catch (err) {
    console.error('Delete part error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
