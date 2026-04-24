const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/assignments
router.get('/', async (req, res) => {
  try {
    const { status, driver_id, vehicle_id } = req.query;
    let query = `
      SELECT da.*,
        d.first_name || ' ' || d.last_name AS driver_name,
        d.employee_id,
        v.vehicle_id AS vehicle_code,
        v.make || ' ' || v.model AS vehicle_name
      FROM driver_assignments da
      LEFT JOIN drivers d ON da.driver_id = d.id
      LEFT JOIN vehicles v ON da.vehicle_id = v.id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`da.status = $${params.length}`);
    }
    if (driver_id) {
      params.push(driver_id);
      conditions.push(`da.driver_id = $${params.length}`);
    }
    if (vehicle_id) {
      params.push(vehicle_id);
      conditions.push(`da.vehicle_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY da.start_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List assignments error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/assignments/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT da.*,
        d.first_name || ' ' || d.last_name AS driver_name,
        d.employee_id,
        v.vehicle_id AS vehicle_code,
        v.make || ' ' || v.model AS vehicle_name
       FROM driver_assignments da
       LEFT JOIN drivers d ON da.driver_id = d.id
       LEFT JOIN vehicles v ON da.vehicle_id = v.id
       WHERE da.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get assignment error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/assignments
router.post('/', async (req, res) => {
  try {
    const { driver_id, vehicle_id, start_date, end_date, shift, route, status, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO driver_assignments (driver_id, vehicle_id, start_date, end_date, shift, route, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [driver_id, vehicle_id, start_date, end_date, shift || 'day', route, status || 'active', notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create assignment error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/assignments/:id
router.put('/:id', async (req, res) => {
  try {
    const { driver_id, vehicle_id, start_date, end_date, shift, route, status, notes } = req.body;

    const result = await pool.query(
      `UPDATE driver_assignments SET
        driver_id = COALESCE($1, driver_id),
        vehicle_id = COALESCE($2, vehicle_id),
        start_date = COALESCE($3, start_date),
        end_date = $4,
        shift = COALESCE($5, shift),
        route = COALESCE($6, route),
        status = COALESCE($7, status),
        notes = $8
       WHERE id = $9
       RETURNING *`,
      [driver_id, vehicle_id, start_date, end_date, shift, route, status, notes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update assignment error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/assignments/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM driver_assignments WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    res.json({ message: 'Assignment deleted successfully.', assignment: result.rows[0] });
  } catch (err) {
    console.error('Delete assignment error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
