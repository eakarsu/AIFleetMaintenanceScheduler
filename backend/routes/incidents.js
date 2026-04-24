const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/incidents
router.get('/', async (req, res) => {
  try {
    const { status, severity, vehicle_id } = req.query;
    let query = `
      SELECT i.*, v.vehicle_id AS vehicle_code, v.make, v.model AS vehicle_model,
        d.first_name AS driver_first_name, d.last_name AS driver_last_name
      FROM incidents i
      LEFT JOIN vehicles v ON i.vehicle_id = v.id
      LEFT JOIN drivers d ON i.driver_id = d.id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`i.status = $${params.length}`);
    }
    if (severity) {
      params.push(severity);
      conditions.push(`i.severity = $${params.length}`);
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
    console.error('List incidents error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/incidents/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, v.vehicle_id AS vehicle_code, v.make, v.model AS vehicle_model,
        d.first_name AS driver_first_name, d.last_name AS driver_last_name
       FROM incidents i
       LEFT JOIN vehicles v ON i.vehicle_id = v.id
       LEFT JOIN drivers d ON i.driver_id = d.id
       WHERE i.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get incident error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/incidents
router.post('/', async (req, res) => {
  try {
    const {
      vehicle_id, driver_id, incident_type, date, time, location, description,
      severity, injuries, injury_details, police_report_number, insurance_claim_number,
      estimated_damage, repair_status, fault, witnesses, photos_count, status
    } = req.body;

    const result = await pool.query(
      `INSERT INTO incidents (vehicle_id, driver_id, incident_type, date, time, location,
        description, severity, injuries, injury_details, police_report_number,
        insurance_claim_number, estimated_damage, repair_status, fault, witnesses,
        photos_count, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [vehicle_id, driver_id, incident_type, date, time, location, description,
        severity || 'minor', injuries || false, injury_details, police_report_number,
        insurance_claim_number, estimated_damage || 0, repair_status || 'pending',
        fault, witnesses, photos_count || 0, status || 'open']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create incident error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/incidents/:id
router.put('/:id', async (req, res) => {
  try {
    const {
      vehicle_id, driver_id, incident_type, date, time, location, description,
      severity, injuries, injury_details, police_report_number, insurance_claim_number,
      estimated_damage, repair_status, fault, witnesses, photos_count, status
    } = req.body;

    const result = await pool.query(
      `UPDATE incidents SET
        vehicle_id = COALESCE($1, vehicle_id),
        driver_id = $2,
        incident_type = COALESCE($3, incident_type),
        date = COALESCE($4, date),
        time = COALESCE($5, time),
        location = $6,
        description = COALESCE($7, description),
        severity = COALESCE($8, severity),
        injuries = COALESCE($9, injuries),
        injury_details = $10,
        police_report_number = $11,
        insurance_claim_number = $12,
        estimated_damage = COALESCE($13, estimated_damage),
        repair_status = COALESCE($14, repair_status),
        fault = $15,
        witnesses = $16,
        photos_count = COALESCE($17, photos_count),
        status = COALESCE($18, status)
       WHERE id = $19
       RETURNING *`,
      [vehicle_id, driver_id, incident_type, date, time, location, description,
        severity, injuries, injury_details, police_report_number, insurance_claim_number,
        estimated_damage, repair_status, fault, witnesses, photos_count, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update incident error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/incidents/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM incidents WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found.' });
    }

    res.json({ message: 'Incident deleted successfully.', incident: result.rows[0] });
  } catch (err) {
    console.error('Delete incident error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
