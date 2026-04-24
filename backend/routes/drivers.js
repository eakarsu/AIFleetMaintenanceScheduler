const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/drivers
router.get('/', async (req, res) => {
  try {
    const { status, license_type } = req.query;
    let query = 'SELECT * FROM drivers';
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (license_type) {
      params.push(license_type);
      conditions.push(`license_type = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY last_name ASC, first_name ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List drivers error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/drivers/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drivers WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get driver error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/drivers
router.post('/', async (req, res) => {
  try {
    const { employee_id, first_name, last_name, email, phone, license_number, license_type, license_expiry, status, hire_date, medical_card_expiry, violations, rating } = req.body;

    const result = await pool.query(
      `INSERT INTO drivers (employee_id, first_name, last_name, email, phone, license_number, license_type, license_expiry, status, hire_date, medical_card_expiry, violations, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [employee_id, first_name, last_name, email, phone, license_number, license_type, license_expiry, status || 'active', hire_date, medical_card_expiry, violations || 0, rating || 5.00]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create driver error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Driver with this employee ID already exists.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/drivers/:id
router.put('/:id', async (req, res) => {
  try {
    const { employee_id, first_name, last_name, email, phone, license_number, license_type, license_expiry, status, hire_date, medical_card_expiry, violations, rating } = req.body;

    const result = await pool.query(
      `UPDATE drivers SET
        employee_id = COALESCE($1, employee_id),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        email = COALESCE($4, email),
        phone = COALESCE($5, phone),
        license_number = COALESCE($6, license_number),
        license_type = COALESCE($7, license_type),
        license_expiry = COALESCE($8, license_expiry),
        status = COALESCE($9, status),
        hire_date = COALESCE($10, hire_date),
        medical_card_expiry = COALESCE($11, medical_card_expiry),
        violations = COALESCE($12, violations),
        rating = COALESCE($13, rating)
       WHERE id = $14
       RETURNING *`,
      [employee_id, first_name, last_name, email, phone, license_number, license_type, license_expiry, status, hire_date, medical_card_expiry, violations, rating, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update driver error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Driver with this employee ID already exists.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/drivers/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM drivers WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    res.json({ message: 'Driver deleted successfully.', driver: result.rows[0] });
  } catch (err) {
    console.error('Delete driver error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
