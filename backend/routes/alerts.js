const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/alerts
router.get('/', async (req, res) => {
  try {
    const { status, severity, type, vehicle_id } = req.query;
    let query = `
      SELECT a.*, v.vehicle_id AS vehicle_code, v.make, v.model
      FROM alerts a
      LEFT JOIN vehicles v ON a.vehicle_id = v.id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`a.status = $${params.length}`);
    }
    if (severity) {
      params.push(severity);
      conditions.push(`a.severity = $${params.length}`);
    }
    if (type) {
      params.push(type);
      conditions.push(`a.type = $${params.length}`);
    }
    if (vehicle_id) {
      params.push(vehicle_id);
      conditions.push(`a.vehicle_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY CASE a.severity WHEN \'critical\' THEN 1 WHEN \'high\' THEN 2 WHEN \'medium\' THEN 3 WHEN \'low\' THEN 4 END, a.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List alerts error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/alerts/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, v.vehicle_id AS vehicle_code, v.make, v.model
       FROM alerts a
       LEFT JOIN vehicles v ON a.vehicle_id = v.id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get alert error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/alerts
router.post('/', async (req, res) => {
  try {
    const { vehicle_id, type, severity, title, message, status, due_date } = req.body;

    const result = await pool.query(
      `INSERT INTO alerts (vehicle_id, type, severity, title, message, status, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [vehicle_id, type, severity || 'medium', title, message, status || 'active', due_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create alert error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/alerts/:id
router.put('/:id', async (req, res) => {
  try {
    const { vehicle_id, type, severity, title, message, status, due_date, resolved_date } = req.body;

    const result = await pool.query(
      `UPDATE alerts SET
        vehicle_id = $1,
        type = COALESCE($2, type),
        severity = COALESCE($3, severity),
        title = COALESCE($4, title),
        message = COALESCE($5, message),
        status = COALESCE($6, status),
        due_date = $7,
        resolved_date = $8
       WHERE id = $9
       RETURNING *`,
      [vehicle_id, type, severity, title, message, status, due_date, resolved_date, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update alert error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/alerts/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM alerts WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found.' });
    }

    res.json({ message: 'Alert deleted successfully.', alert: result.rows[0] });
  } catch (err) {
    console.error('Delete alert error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
