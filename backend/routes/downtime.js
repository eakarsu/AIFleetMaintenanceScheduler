const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/downtime
router.get('/', async (req, res) => {
  try {
    const { vehicle_id, category, impact } = req.query;
    let query = `
      SELECT dr.*, v.vehicle_id AS vehicle_code, v.make, v.model
      FROM downtime_records dr
      LEFT JOIN vehicles v ON dr.vehicle_id = v.id
    `;
    const params = [];
    const conditions = [];

    if (vehicle_id) {
      params.push(vehicle_id);
      conditions.push(`dr.vehicle_id = $${params.length}`);
    }
    if (category) {
      params.push(category);
      conditions.push(`dr.category = $${params.length}`);
    }
    if (impact) {
      params.push(impact);
      conditions.push(`dr.impact = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY dr.start_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List downtime error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/downtime/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dr.*, v.vehicle_id AS vehicle_code, v.make, v.model
       FROM downtime_records dr
       LEFT JOIN vehicles v ON dr.vehicle_id = v.id
       WHERE dr.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Downtime record not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get downtime error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/downtime
router.post('/', async (req, res) => {
  try {
    const { vehicle_id, reason, start_date, end_date, duration_hours, impact, cost_impact, resolution, preventable, category } = req.body;

    const result = await pool.query(
      `INSERT INTO downtime_records (vehicle_id, reason, start_date, end_date, duration_hours, impact, cost_impact, resolution, preventable, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [vehicle_id, reason, start_date, end_date, duration_hours, impact || 'medium', cost_impact || 0, resolution, preventable || false, category]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create downtime error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/downtime/:id
router.put('/:id', async (req, res) => {
  try {
    const { vehicle_id, reason, start_date, end_date, duration_hours, impact, cost_impact, resolution, preventable, category } = req.body;

    const result = await pool.query(
      `UPDATE downtime_records SET
        vehicle_id = COALESCE($1, vehicle_id),
        reason = COALESCE($2, reason),
        start_date = COALESCE($3, start_date),
        end_date = $4,
        duration_hours = $5,
        impact = COALESCE($6, impact),
        cost_impact = COALESCE($7, cost_impact),
        resolution = $8,
        preventable = COALESCE($9, preventable),
        category = COALESCE($10, category)
       WHERE id = $11
       RETURNING *`,
      [vehicle_id, reason, start_date, end_date, duration_hours, impact, cost_impact, resolution, preventable, category, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Downtime record not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update downtime error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/downtime/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM downtime_records WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Downtime record not found.' });
    }

    res.json({ message: 'Downtime record deleted successfully.', record: result.rows[0] });
  } catch (err) {
    console.error('Delete downtime error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
