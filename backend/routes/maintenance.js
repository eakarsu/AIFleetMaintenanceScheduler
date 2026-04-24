const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/maintenance
router.get('/', async (req, res) => {
  try {
    const { vehicle_id, status, type } = req.query;
    let query = `
      SELECT mr.*, v.vehicle_id AS vehicle_code, v.make, v.model
      FROM maintenance_records mr
      LEFT JOIN vehicles v ON mr.vehicle_id = v.id
    `;
    const params = [];
    const conditions = [];

    if (vehicle_id) {
      params.push(vehicle_id);
      conditions.push(`mr.vehicle_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`mr.status = $${params.length}`);
    }
    if (type) {
      params.push(type);
      conditions.push(`mr.type = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY mr.scheduled_date DESC NULLS LAST, mr.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List maintenance error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/maintenance/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mr.*, v.vehicle_id AS vehicle_code, v.make, v.model
       FROM maintenance_records mr
       LEFT JOIN vehicles v ON mr.vehicle_id = v.id
       WHERE mr.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get maintenance error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/maintenance
router.post('/', async (req, res) => {
  try {
    const { vehicle_id, type, description, status, priority, scheduled_date, completed_date, cost, technician, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO maintenance_records (vehicle_id, type, description, status, priority, scheduled_date, completed_date, cost, technician, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [vehicle_id, type, description, status || 'scheduled', priority || 'medium', scheduled_date, completed_date, cost || 0, technician, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create maintenance error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/maintenance/:id
router.put('/:id', async (req, res) => {
  try {
    const { vehicle_id, type, description, status, priority, scheduled_date, completed_date, cost, technician, notes } = req.body;

    const result = await pool.query(
      `UPDATE maintenance_records SET
        vehicle_id = COALESCE($1, vehicle_id),
        type = COALESCE($2, type),
        description = COALESCE($3, description),
        status = COALESCE($4, status),
        priority = COALESCE($5, priority),
        scheduled_date = COALESCE($6, scheduled_date),
        completed_date = $7,
        cost = COALESCE($8, cost),
        technician = COALESCE($9, technician),
        notes = $10
       WHERE id = $11
       RETURNING *`,
      [vehicle_id, type, description, status, priority, scheduled_date, completed_date, cost, technician, notes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update maintenance error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/maintenance/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM maintenance_records WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found.' });
    }

    res.json({ message: 'Maintenance record deleted successfully.', record: result.rows[0] });
  } catch (err) {
    console.error('Delete maintenance error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
