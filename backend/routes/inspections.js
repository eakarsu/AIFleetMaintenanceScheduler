const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/inspections
router.get('/', async (req, res) => {
  try {
    const { inspection_type, status, vehicle_id } = req.query;
    let query = `
      SELECT i.*, v.vehicle_id AS vehicle_code, v.make, v.model AS vehicle_model,
        d.first_name AS driver_first_name, d.last_name AS driver_last_name
      FROM inspections i
      LEFT JOIN vehicles v ON i.vehicle_id = v.id
      LEFT JOIN drivers d ON i.driver_id = d.id
    `;
    const params = [];
    const conditions = [];

    if (inspection_type) {
      params.push(inspection_type);
      conditions.push(`i.inspection_type = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`i.status = $${params.length}`);
    }
    if (vehicle_id) {
      params.push(vehicle_id);
      conditions.push(`i.vehicle_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY i.date DESC, i.time DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List inspections error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/inspections/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, v.vehicle_id AS vehicle_code, v.make, v.model AS vehicle_model,
        d.first_name AS driver_first_name, d.last_name AS driver_last_name
       FROM inspections i
       LEFT JOIN vehicles v ON i.vehicle_id = v.id
       LEFT JOIN drivers d ON i.driver_id = d.id
       WHERE i.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get inspection error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/inspections
router.post('/', async (req, res) => {
  try {
    const {
      vehicle_id, driver_id, inspection_type, date, time, odometer,
      overall_status, brakes, tires_check, lights, fluids, engine,
      transmission, steering, exhaust, body_exterior, safety_equipment,
      defects_found, corrective_action, inspector_signature, status
    } = req.body;

    const result = await pool.query(
      `INSERT INTO inspections (vehicle_id, driver_id, inspection_type, date, time, odometer,
        overall_status, brakes, tires_check, lights, fluids, engine, transmission, steering,
        exhaust, body_exterior, safety_equipment, defects_found, corrective_action,
        inspector_signature, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
       RETURNING *`,
      [vehicle_id, driver_id, inspection_type, date, time, odometer,
        overall_status || 'pass', brakes || 'ok', tires_check || 'ok', lights || 'ok',
        fluids || 'ok', engine || 'ok', transmission || 'ok', steering || 'ok',
        exhaust || 'ok', body_exterior || 'ok', safety_equipment || 'ok',
        defects_found, corrective_action, inspector_signature, status || 'completed']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create inspection error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/inspections/:id
router.put('/:id', async (req, res) => {
  try {
    const {
      vehicle_id, driver_id, inspection_type, date, time, odometer,
      overall_status, brakes, tires_check, lights, fluids, engine,
      transmission, steering, exhaust, body_exterior, safety_equipment,
      defects_found, corrective_action, inspector_signature, status
    } = req.body;

    const result = await pool.query(
      `UPDATE inspections SET
        vehicle_id = COALESCE($1, vehicle_id),
        driver_id = $2,
        inspection_type = COALESCE($3, inspection_type),
        date = COALESCE($4, date),
        time = COALESCE($5, time),
        odometer = COALESCE($6, odometer),
        overall_status = COALESCE($7, overall_status),
        brakes = COALESCE($8, brakes),
        tires_check = COALESCE($9, tires_check),
        lights = COALESCE($10, lights),
        fluids = COALESCE($11, fluids),
        engine = COALESCE($12, engine),
        transmission = COALESCE($13, transmission),
        steering = COALESCE($14, steering),
        exhaust = COALESCE($15, exhaust),
        body_exterior = COALESCE($16, body_exterior),
        safety_equipment = COALESCE($17, safety_equipment),
        defects_found = $18,
        corrective_action = $19,
        inspector_signature = COALESCE($20, inspector_signature),
        status = COALESCE($21, status)
       WHERE id = $22
       RETURNING *`,
      [vehicle_id, driver_id, inspection_type, date, time, odometer,
        overall_status, brakes, tires_check, lights, fluids, engine,
        transmission, steering, exhaust, body_exterior, safety_equipment,
        defects_found, corrective_action, inspector_signature, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update inspection error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/inspections/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM inspections WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found.' });
    }

    res.json({ message: 'Inspection deleted successfully.', inspection: result.rows[0] });
  } catch (err) {
    console.error('Delete inspection error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
