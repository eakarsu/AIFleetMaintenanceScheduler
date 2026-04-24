const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/vendors
router.get('/', async (req, res) => {
  try {
    const { type, status } = req.query;
    let query = 'SELECT * FROM vendors';
    const params = [];
    const conditions = [];

    if (type) {
      params.push(type);
      conditions.push(`type = $${params.length}`);
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
    console.error('List vendors error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/vendors/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vendors WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get vendor error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/vendors
router.post('/', async (req, res) => {
  try {
    const {
      name, type, contact_person, email, phone, address, city, state, zip,
      services_offered, rating, payment_terms, contract_start, contract_end,
      status, notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vendors (name, type, contact_person, email, phone, address, city, state, zip,
        services_offered, rating, payment_terms, contract_start, contract_end, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [name, type, contact_person, email, phone, address, city, state, zip,
        services_offered, rating || 5.00, payment_terms, contract_start, contract_end,
        status || 'active', notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create vendor error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/vendors/:id
router.put('/:id', async (req, res) => {
  try {
    const {
      name, type, contact_person, email, phone, address, city, state, zip,
      services_offered, rating, payment_terms, contract_start, contract_end,
      status, notes
    } = req.body;

    const result = await pool.query(
      `UPDATE vendors SET
        name = COALESCE($1, name),
        type = COALESCE($2, type),
        contact_person = COALESCE($3, contact_person),
        email = COALESCE($4, email),
        phone = COALESCE($5, phone),
        address = $6,
        city = COALESCE($7, city),
        state = COALESCE($8, state),
        zip = COALESCE($9, zip),
        services_offered = $10,
        rating = COALESCE($11, rating),
        payment_terms = COALESCE($12, payment_terms),
        contract_start = $13,
        contract_end = $14,
        status = COALESCE($15, status),
        notes = $16
       WHERE id = $17
       RETURNING *`,
      [name, type, contact_person, email, phone, address, city, state, zip,
        services_offered, rating, payment_terms, contract_start, contract_end,
        status, notes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update vendor error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/vendors/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vendors WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }

    res.json({ message: 'Vendor deleted successfully.', vendor: result.rows[0] });
  } catch (err) {
    console.error('Delete vendor error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
