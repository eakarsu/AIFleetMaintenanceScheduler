const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/compliance
router.get('/', async (req, res) => {
  try {
    const { status, vehicle_id } = req.query;
    let query = `
      SELECT cr.*, v.vehicle_id AS vehicle_code, v.make, v.model
      FROM compliance_records cr
      LEFT JOIN vehicles v ON cr.vehicle_id = v.id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`cr.status = $${params.length}`);
    }
    if (vehicle_id) {
      params.push(vehicle_id);
      conditions.push(`cr.vehicle_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY cr.expiry_date ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List compliance error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/compliance/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cr.*, v.vehicle_id AS vehicle_code, v.make, v.model
       FROM compliance_records cr
       LEFT JOIN vehicles v ON cr.vehicle_id = v.id
       WHERE cr.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Compliance record not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get compliance error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/compliance
router.post('/', async (req, res) => {
  try {
    const { vehicle_id, inspection_type, inspection_date, expiry_date, status, inspector_name, inspector_license, findings, corrective_actions, dot_number } = req.body;

    const result = await pool.query(
      `INSERT INTO compliance_records (vehicle_id, inspection_type, inspection_date, expiry_date, status, inspector_name, inspector_license, findings, corrective_actions, dot_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [vehicle_id, inspection_type, inspection_date, expiry_date, status || 'valid', inspector_name, inspector_license, findings, corrective_actions, dot_number]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create compliance error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/compliance/:id
router.put('/:id', async (req, res) => {
  try {
    const { vehicle_id, inspection_type, inspection_date, expiry_date, status, inspector_name, inspector_license, findings, corrective_actions, dot_number } = req.body;

    const result = await pool.query(
      `UPDATE compliance_records SET
        vehicle_id = COALESCE($1, vehicle_id),
        inspection_type = COALESCE($2, inspection_type),
        inspection_date = COALESCE($3, inspection_date),
        expiry_date = COALESCE($4, expiry_date),
        status = COALESCE($5, status),
        inspector_name = COALESCE($6, inspector_name),
        inspector_license = COALESCE($7, inspector_license),
        findings = $8,
        corrective_actions = $9,
        dot_number = COALESCE($10, dot_number)
       WHERE id = $11
       RETURNING *`,
      [vehicle_id, inspection_type, inspection_date, expiry_date, status, inspector_name, inspector_license, findings, corrective_actions, dot_number, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Compliance record not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update compliance error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/compliance/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM compliance_records WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Compliance record not found.' });
    }

    res.json({ message: 'Compliance record deleted successfully.', record: result.rows[0] });
  } catch (err) {
    console.error('Delete compliance error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
