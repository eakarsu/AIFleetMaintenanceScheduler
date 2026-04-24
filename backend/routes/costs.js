const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/costs
router.get('/', async (req, res) => {
  try {
    const { vehicle_id, category, payment_status } = req.query;
    let query = `
      SELECT cr.*, v.vehicle_id AS vehicle_code, v.make, v.model
      FROM cost_records cr
      LEFT JOIN vehicles v ON cr.vehicle_id = v.id
    `;
    const params = [];
    const conditions = [];

    if (vehicle_id) {
      params.push(vehicle_id);
      conditions.push(`cr.vehicle_id = $${params.length}`);
    }
    if (category) {
      params.push(category);
      conditions.push(`cr.category = $${params.length}`);
    }
    if (payment_status) {
      params.push(payment_status);
      conditions.push(`cr.payment_status = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY cr.date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List costs error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/costs/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cr.*, v.vehicle_id AS vehicle_code, v.make, v.model
       FROM cost_records cr
       LEFT JOIN vehicles v ON cr.vehicle_id = v.id
       WHERE cr.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cost record not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get cost error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/costs
router.post('/', async (req, res) => {
  try {
    const { vehicle_id, category, description, amount, date, vendor, invoice_number, payment_status, recurring, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO cost_records (vehicle_id, category, description, amount, date, vendor, invoice_number, payment_status, recurring, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [vehicle_id, category, description, amount, date, vendor, invoice_number, payment_status || 'paid', recurring || false, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create cost error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/costs/:id
router.put('/:id', async (req, res) => {
  try {
    const { vehicle_id, category, description, amount, date, vendor, invoice_number, payment_status, recurring, notes } = req.body;

    const result = await pool.query(
      `UPDATE cost_records SET
        vehicle_id = COALESCE($1, vehicle_id),
        category = COALESCE($2, category),
        description = COALESCE($3, description),
        amount = COALESCE($4, amount),
        date = COALESCE($5, date),
        vendor = COALESCE($6, vendor),
        invoice_number = COALESCE($7, invoice_number),
        payment_status = COALESCE($8, payment_status),
        recurring = COALESCE($9, recurring),
        notes = $10
       WHERE id = $11
       RETURNING *`,
      [vehicle_id, category, description, amount, date, vendor, invoice_number, payment_status, recurring, notes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cost record not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update cost error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/costs/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM cost_records WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cost record not found.' });
    }

    res.json({ message: 'Cost record deleted successfully.', record: result.rows[0] });
  } catch (err) {
    console.error('Delete cost error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
