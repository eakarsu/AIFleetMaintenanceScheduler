const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/scheduling
router.get('/', async (req, res) => {
  try {
    const { vehicle_id, status, priority } = req.query;
    let query = `
      SELECT ms.*, v.vehicle_id AS vehicle_code, v.make, v.model
      FROM maintenance_schedule ms
      LEFT JOIN vehicles v ON ms.vehicle_id = v.id
    `;
    const params = [];
    const conditions = [];

    if (vehicle_id) {
      params.push(vehicle_id);
      conditions.push(`ms.vehicle_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`ms.status = $${params.length}`);
    }
    if (priority) {
      params.push(priority);
      conditions.push(`ms.priority = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY ms.next_due ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List scheduling error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/scheduling/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ms.*, v.vehicle_id AS vehicle_code, v.make, v.model
       FROM maintenance_schedule ms
       LEFT JOIN vehicles v ON ms.vehicle_id = v.id
       WHERE ms.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule entry not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get schedule error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/scheduling
router.post('/', async (req, res) => {
  try {
    const { vehicle_id, service_type, frequency_miles, frequency_days, last_performed, next_due, estimated_cost, priority, status, assigned_shop, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO maintenance_schedule (vehicle_id, service_type, frequency_miles, frequency_days, last_performed, next_due, estimated_cost, priority, status, assigned_shop, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [vehicle_id, service_type, frequency_miles, frequency_days, last_performed, next_due, estimated_cost, priority || 'medium', status || 'upcoming', assigned_shop, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create schedule error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/scheduling/:id
router.put('/:id', async (req, res) => {
  try {
    const { vehicle_id, service_type, frequency_miles, frequency_days, last_performed, next_due, estimated_cost, priority, status, assigned_shop, notes } = req.body;

    const result = await pool.query(
      `UPDATE maintenance_schedule SET
        vehicle_id = COALESCE($1, vehicle_id),
        service_type = COALESCE($2, service_type),
        frequency_miles = $3,
        frequency_days = $4,
        last_performed = $5,
        next_due = COALESCE($6, next_due),
        estimated_cost = COALESCE($7, estimated_cost),
        priority = COALESCE($8, priority),
        status = COALESCE($9, status),
        assigned_shop = COALESCE($10, assigned_shop),
        notes = $11
       WHERE id = $12
       RETURNING *`,
      [vehicle_id, service_type, frequency_miles, frequency_days, last_performed, next_due, estimated_cost, priority, status, assigned_shop, notes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule entry not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update schedule error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/scheduling/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM maintenance_schedule WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule entry not found.' });
    }

    res.json({ message: 'Schedule entry deleted successfully.', schedule: result.rows[0] });
  } catch (err) {
    console.error('Delete schedule error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
