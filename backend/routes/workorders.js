const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/workorders
router.get('/', async (req, res) => {
  try {
    const { status, vehicle_id, priority } = req.query;
    let query = `
      SELECT wo.*, v.vehicle_id AS vehicle_code, v.make, v.model
      FROM work_orders wo
      LEFT JOIN vehicles v ON wo.vehicle_id = v.id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`wo.status = $${params.length}`);
    }
    if (vehicle_id) {
      params.push(vehicle_id);
      conditions.push(`wo.vehicle_id = $${params.length}`);
    }
    if (priority) {
      params.push(priority);
      conditions.push(`wo.priority = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY wo.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List work orders error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/workorders/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT wo.*, v.vehicle_id AS vehicle_code, v.make, v.model
       FROM work_orders wo
       LEFT JOIN vehicles v ON wo.vehicle_id = v.id
       WHERE wo.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Work order not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get work order error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/workorders
router.post('/', async (req, res) => {
  try {
    const { order_number, vehicle_id, type, description, status, priority, assigned_to, estimated_hours, actual_hours, parts_used, cost, due_date, completed_date } = req.body;

    const result = await pool.query(
      `INSERT INTO work_orders (order_number, vehicle_id, type, description, status, priority, assigned_to, estimated_hours, actual_hours, parts_used, cost, due_date, completed_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [order_number, vehicle_id, type, description, status || 'open', priority || 'medium', assigned_to, estimated_hours, actual_hours, parts_used, cost || 0, due_date, completed_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create work order error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Work order with this number already exists.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/workorders/:id
router.put('/:id', async (req, res) => {
  try {
    const { order_number, vehicle_id, type, description, status, priority, assigned_to, estimated_hours, actual_hours, parts_used, cost, due_date, completed_date } = req.body;

    const result = await pool.query(
      `UPDATE work_orders SET
        order_number = COALESCE($1, order_number),
        vehicle_id = COALESCE($2, vehicle_id),
        type = COALESCE($3, type),
        description = COALESCE($4, description),
        status = COALESCE($5, status),
        priority = COALESCE($6, priority),
        assigned_to = COALESCE($7, assigned_to),
        estimated_hours = COALESCE($8, estimated_hours),
        actual_hours = $9,
        parts_used = $10,
        cost = COALESCE($11, cost),
        due_date = COALESCE($12, due_date),
        completed_date = $13
       WHERE id = $14
       RETURNING *`,
      [order_number, vehicle_id, type, description, status, priority, assigned_to, estimated_hours, actual_hours, parts_used, cost, due_date, completed_date, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Work order not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update work order error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Work order with this number already exists.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/workorders/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM work_orders WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Work order not found.' });
    }

    res.json({ message: 'Work order deleted successfully.', workOrder: result.rows[0] });
  } catch (err) {
    console.error('Delete work order error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
