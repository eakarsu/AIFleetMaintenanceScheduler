const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/fuel
router.get('/', async (req, res) => {
  try {
    const { vehicle_id, driver_id } = req.query;
    let query = `
      SELECT fr.*,
        v.vehicle_id AS vehicle_code, v.make, v.model,
        d.first_name || ' ' || d.last_name AS driver_name
      FROM fuel_records fr
      LEFT JOIN vehicles v ON fr.vehicle_id = v.id
      LEFT JOIN drivers d ON fr.driver_id = d.id
    `;
    const params = [];
    const conditions = [];

    if (vehicle_id) {
      params.push(vehicle_id);
      conditions.push(`fr.vehicle_id = $${params.length}`);
    }
    if (driver_id) {
      params.push(driver_id);
      conditions.push(`fr.driver_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY fr.date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List fuel records error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/fuel/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fr.*,
        v.vehicle_id AS vehicle_code, v.make, v.model,
        d.first_name || ' ' || d.last_name AS driver_name
       FROM fuel_records fr
       LEFT JOIN vehicles v ON fr.vehicle_id = v.id
       LEFT JOIN drivers d ON fr.driver_id = d.id
       WHERE fr.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fuel record not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get fuel record error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/fuel
router.post('/', async (req, res) => {
  try {
    const { vehicle_id, driver_id, date, gallons, cost_per_gallon, total_cost, odometer_reading, fuel_type, station, city, state, mpg } = req.body;

    const result = await pool.query(
      `INSERT INTO fuel_records (vehicle_id, driver_id, date, gallons, cost_per_gallon, total_cost, odometer_reading, fuel_type, station, city, state, mpg)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [vehicle_id, driver_id, date, gallons, cost_per_gallon, total_cost, odometer_reading, fuel_type, station, city, state, mpg]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create fuel record error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/fuel/:id
router.put('/:id', async (req, res) => {
  try {
    const { vehicle_id, driver_id, date, gallons, cost_per_gallon, total_cost, odometer_reading, fuel_type, station, city, state, mpg } = req.body;

    const result = await pool.query(
      `UPDATE fuel_records SET
        vehicle_id = COALESCE($1, vehicle_id),
        driver_id = $2,
        date = COALESCE($3, date),
        gallons = COALESCE($4, gallons),
        cost_per_gallon = COALESCE($5, cost_per_gallon),
        total_cost = COALESCE($6, total_cost),
        odometer_reading = COALESCE($7, odometer_reading),
        fuel_type = COALESCE($8, fuel_type),
        station = COALESCE($9, station),
        city = COALESCE($10, city),
        state = COALESCE($11, state),
        mpg = $12
       WHERE id = $13
       RETURNING *`,
      [vehicle_id, driver_id, date, gallons, cost_per_gallon, total_cost, odometer_reading, fuel_type, station, city, state, mpg, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fuel record not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update fuel record error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/fuel/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM fuel_records WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fuel record not found.' });
    }

    res.json({ message: 'Fuel record deleted successfully.', record: result.rows[0] });
  } catch (err) {
    console.error('Delete fuel record error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
