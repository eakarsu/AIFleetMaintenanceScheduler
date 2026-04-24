const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/vehicles/stats/summary
router.get('/stats/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'active') AS active,
        COUNT(*) FILTER (WHERE status = 'maintenance') AS maintenance,
        COUNT(*) FILTER (WHERE status = 'inactive') AS inactive
      FROM vehicles
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Vehicle stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/vehicles
router.get('/', async (req, res) => {
  try {
    const { status, type } = req.query;
    let query = 'SELECT * FROM vehicles';
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (type) {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY vehicle_id ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List vehicles error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/vehicles/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get vehicle error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/vehicles
router.post('/', async (req, res) => {
  try {
    const {
      vehicle_id, type, make, model, year, vin, license_plate,
      mileage, status, fuel_type, last_service_date, next_service_date, assigned_driver_id
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vehicles (vehicle_id, type, make, model, year, vin, license_plate, mileage, status, fuel_type, last_service_date, next_service_date, assigned_driver_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [vehicle_id, type, make, model, year, vin, license_plate, mileage || 0, status || 'active', fuel_type || 'diesel', last_service_date, next_service_date, assigned_driver_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create vehicle error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Vehicle with this ID or VIN already exists.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/vehicles/:id
router.put('/:id', async (req, res) => {
  try {
    const {
      vehicle_id, type, make, model, year, vin, license_plate,
      mileage, status, fuel_type, last_service_date, next_service_date, assigned_driver_id
    } = req.body;

    const result = await pool.query(
      `UPDATE vehicles SET
        vehicle_id = COALESCE($1, vehicle_id),
        type = COALESCE($2, type),
        make = COALESCE($3, make),
        model = COALESCE($4, model),
        year = COALESCE($5, year),
        vin = COALESCE($6, vin),
        license_plate = COALESCE($7, license_plate),
        mileage = COALESCE($8, mileage),
        status = COALESCE($9, status),
        fuel_type = COALESCE($10, fuel_type),
        last_service_date = COALESCE($11, last_service_date),
        next_service_date = COALESCE($12, next_service_date),
        assigned_driver_id = $13
       WHERE id = $14
       RETURNING *`,
      [vehicle_id, type, make, model, year, vin, license_plate, mileage, status, fuel_type, last_service_date, next_service_date, assigned_driver_id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update vehicle error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Vehicle with this ID or VIN already exists.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/vehicles/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    res.json({ message: 'Vehicle deleted successfully.', vehicle: result.rows[0] });
  } catch (err) {
    console.error('Delete vehicle error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
