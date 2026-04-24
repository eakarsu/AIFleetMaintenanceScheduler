const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/tires
router.get('/', async (req, res) => {
  try {
    const { vehicle_id, condition, status } = req.query;
    let query = `
      SELECT t.*, v.vehicle_id AS vehicle_code, v.make, v.model AS vehicle_model, v.year
      FROM tires t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
    `;
    const params = [];
    const conditions = [];

    if (vehicle_id) {
      params.push(vehicle_id);
      conditions.push(`t.vehicle_id = $${params.length}`);
    }
    if (condition) {
      params.push(condition);
      conditions.push(`t.condition = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`t.status = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY t.vehicle_id ASC, t.position ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List tires error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/tires/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, v.vehicle_id AS vehicle_code, v.make, v.model AS vehicle_model, v.year
       FROM tires t
       LEFT JOIN vehicles v ON t.vehicle_id = v.id
       WHERE t.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tire not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get tire error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/tires
router.post('/', async (req, res) => {
  try {
    const {
      vehicle_id, position, brand, model, size, dot_code, install_date,
      mileage_at_install, tread_depth, max_tread_depth, pressure_psi,
      recommended_psi, condition, status, notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO tires (vehicle_id, position, brand, model, size, dot_code, install_date,
        mileage_at_install, tread_depth, max_tread_depth, pressure_psi, recommended_psi,
        condition, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [vehicle_id, position, brand, model, size, dot_code, install_date,
        mileage_at_install || 0, tread_depth, max_tread_depth || 11.0, pressure_psi,
        recommended_psi, condition || 'good', status || 'active', notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create tire error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/tires/:id
router.put('/:id', async (req, res) => {
  try {
    const {
      vehicle_id, position, brand, model, size, dot_code, install_date,
      mileage_at_install, tread_depth, max_tread_depth, pressure_psi,
      recommended_psi, condition, status, notes
    } = req.body;

    const result = await pool.query(
      `UPDATE tires SET
        vehicle_id = COALESCE($1, vehicle_id),
        position = COALESCE($2, position),
        brand = COALESCE($3, brand),
        model = COALESCE($4, model),
        size = COALESCE($5, size),
        dot_code = COALESCE($6, dot_code),
        install_date = COALESCE($7, install_date),
        mileage_at_install = COALESCE($8, mileage_at_install),
        tread_depth = COALESCE($9, tread_depth),
        max_tread_depth = COALESCE($10, max_tread_depth),
        pressure_psi = COALESCE($11, pressure_psi),
        recommended_psi = COALESCE($12, recommended_psi),
        condition = COALESCE($13, condition),
        status = COALESCE($14, status),
        notes = $15
       WHERE id = $16
       RETURNING *`,
      [vehicle_id, position, brand, model, size, dot_code, install_date,
        mileage_at_install, tread_depth, max_tread_depth, pressure_psi,
        recommended_psi, condition, status, notes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tire not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update tire error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/tires/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tires WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tire not found.' });
    }

    res.json({ message: 'Tire deleted successfully.', tire: result.rows[0] });
  } catch (err) {
    console.error('Delete tire error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
