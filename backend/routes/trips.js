const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/trips
router.get('/', async (req, res) => {
  try {
    const { status, vehicle_id } = req.query;
    let query = `
      SELECT t.*, v.vehicle_id AS vehicle_code, v.make, v.model AS vehicle_model,
        d.first_name AS driver_first_name, d.last_name AS driver_last_name
      FROM trip_logs t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN drivers d ON t.driver_id = d.id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`t.status = $${params.length}`);
    }
    if (vehicle_id) {
      params.push(vehicle_id);
      conditions.push(`t.vehicle_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY t.departure_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List trips error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/trips/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, v.vehicle_id AS vehicle_code, v.make, v.model AS vehicle_model,
        d.first_name AS driver_first_name, d.last_name AS driver_last_name
       FROM trip_logs t
       LEFT JOIN vehicles v ON t.vehicle_id = v.id
       LEFT JOIN drivers d ON t.driver_id = d.id
       WHERE t.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get trip error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/trips
router.post('/', async (req, res) => {
  try {
    const {
      vehicle_id, driver_id, trip_number, origin, destination, departure_date,
      arrival_date, start_odometer, end_odometer, distance_miles, fuel_used,
      cargo_type, cargo_weight, revenue, tolls, status, notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO trip_logs (vehicle_id, driver_id, trip_number, origin, destination,
        departure_date, arrival_date, start_odometer, end_odometer, distance_miles,
        fuel_used, cargo_type, cargo_weight, revenue, tolls, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [vehicle_id, driver_id, trip_number, origin, destination, departure_date,
        arrival_date, start_odometer, end_odometer, distance_miles, fuel_used,
        cargo_type, cargo_weight, revenue || 0, tolls || 0, status || 'in_progress', notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create trip error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Trip with this number already exists.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/trips/:id
router.put('/:id', async (req, res) => {
  try {
    const {
      vehicle_id, driver_id, trip_number, origin, destination, departure_date,
      arrival_date, start_odometer, end_odometer, distance_miles, fuel_used,
      cargo_type, cargo_weight, revenue, tolls, status, notes
    } = req.body;

    const result = await pool.query(
      `UPDATE trip_logs SET
        vehicle_id = COALESCE($1, vehicle_id),
        driver_id = $2,
        trip_number = COALESCE($3, trip_number),
        origin = COALESCE($4, origin),
        destination = COALESCE($5, destination),
        departure_date = COALESCE($6, departure_date),
        arrival_date = $7,
        start_odometer = COALESCE($8, start_odometer),
        end_odometer = $9,
        distance_miles = $10,
        fuel_used = $11,
        cargo_type = $12,
        cargo_weight = $13,
        revenue = COALESCE($14, revenue),
        tolls = COALESCE($15, tolls),
        status = COALESCE($16, status),
        notes = $17
       WHERE id = $18
       RETURNING *`,
      [vehicle_id, driver_id, trip_number, origin, destination, departure_date,
        arrival_date, start_odometer, end_odometer, distance_miles, fuel_used,
        cargo_type, cargo_weight, revenue, tolls, status, notes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update trip error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Trip with this number already exists.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/trips/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM trip_logs WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    res.json({ message: 'Trip deleted successfully.', trip: result.rows[0] });
  } catch (err) {
    console.error('Delete trip error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
