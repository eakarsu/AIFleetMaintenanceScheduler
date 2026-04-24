const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/warranties
router.get('/', async (req, res) => {
  try {
    const { status, vehicle_id } = req.query;
    let query = `
      SELECT w.*, v.vehicle_id AS vehicle_code, v.make, v.model AS vehicle_model, v.year
      FROM warranties w
      LEFT JOIN vehicles v ON w.vehicle_id = v.id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`w.status = $${params.length}`);
    }
    if (vehicle_id) {
      params.push(vehicle_id);
      conditions.push(`w.vehicle_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY w.end_date ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List warranties error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/warranties/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.*, v.vehicle_id AS vehicle_code, v.make, v.model AS vehicle_model, v.year
       FROM warranties w
       LEFT JOIN vehicles v ON w.vehicle_id = v.id
       WHERE w.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Warranty not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get warranty error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/warranties
router.post('/', async (req, res) => {
  try {
    const {
      vehicle_id, warranty_type, provider, policy_number, start_date, end_date,
      mileage_limit, coverage_description, deductible, contact_phone, contact_email,
      status, claims_filed, notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO warranties (vehicle_id, warranty_type, provider, policy_number, start_date,
        end_date, mileage_limit, coverage_description, deductible, contact_phone, contact_email,
        status, claims_filed, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [vehicle_id, warranty_type, provider, policy_number, start_date, end_date,
        mileage_limit, coverage_description, deductible || 0, contact_phone, contact_email,
        status || 'active', claims_filed || 0, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create warranty error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/warranties/:id
router.put('/:id', async (req, res) => {
  try {
    const {
      vehicle_id, warranty_type, provider, policy_number, start_date, end_date,
      mileage_limit, coverage_description, deductible, contact_phone, contact_email,
      status, claims_filed, notes
    } = req.body;

    const result = await pool.query(
      `UPDATE warranties SET
        vehicle_id = COALESCE($1, vehicle_id),
        warranty_type = COALESCE($2, warranty_type),
        provider = COALESCE($3, provider),
        policy_number = COALESCE($4, policy_number),
        start_date = COALESCE($5, start_date),
        end_date = COALESCE($6, end_date),
        mileage_limit = COALESCE($7, mileage_limit),
        coverage_description = $8,
        deductible = COALESCE($9, deductible),
        contact_phone = COALESCE($10, contact_phone),
        contact_email = COALESCE($11, contact_email),
        status = COALESCE($12, status),
        claims_filed = COALESCE($13, claims_filed),
        notes = $14
       WHERE id = $15
       RETURNING *`,
      [vehicle_id, warranty_type, provider, policy_number, start_date, end_date,
        mileage_limit, coverage_description, deductible, contact_phone, contact_email,
        status, claims_filed, notes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Warranty not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update warranty error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/warranties/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM warranties WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Warranty not found.' });
    }

    res.json({ message: 'Warranty deleted successfully.', warranty: result.rows[0] });
  } catch (err) {
    console.error('Delete warranty error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
