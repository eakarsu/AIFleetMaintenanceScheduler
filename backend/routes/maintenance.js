const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
}

const maintenanceBodyValidators = [
  body('vehicle_id').notEmpty().withMessage('vehicle_id is required').isInt({ min: 1 }).withMessage('vehicle_id must be a positive integer'),
  body('type').notEmpty().withMessage('type is required').isString().trim(),
  body('description').notEmpty().withMessage('description is required').isString().trim(),
  body('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled']).withMessage('invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('invalid priority'),
  body('scheduled_date').optional().isDate().withMessage('scheduled_date must be a valid date (YYYY-MM-DD)'),
  body('completed_date').optional().isDate().withMessage('completed_date must be a valid date (YYYY-MM-DD)'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('cost must be a non-negative number'),
  body('technician').optional().isString().trim()
];

// GET /api/maintenance
router.get('/', async (req, res) => {
  try {
    const { vehicle_id, status, type } = req.query;
    let query = `
      SELECT mr.*, v.vehicle_id AS vehicle_code, v.make, v.model
      FROM maintenance_records mr
      LEFT JOIN vehicles v ON mr.vehicle_id = v.id
    `;
    const params = [];
    const conditions = [];

    if (vehicle_id) {
      params.push(vehicle_id);
      conditions.push(`mr.vehicle_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`mr.status = $${params.length}`);
    }
    if (type) {
      params.push(type);
      conditions.push(`mr.type = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY mr.scheduled_date DESC NULLS LAST, mr.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List maintenance error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/maintenance/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mr.*, v.vehicle_id AS vehicle_code, v.make, v.model
       FROM maintenance_records mr
       LEFT JOIN vehicles v ON mr.vehicle_id = v.id
       WHERE mr.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get maintenance error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/maintenance
router.post('/', maintenanceBodyValidators, async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const { vehicle_id, type, description, status, priority, scheduled_date, completed_date, cost, technician, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO maintenance_records (vehicle_id, type, description, status, priority, scheduled_date, completed_date, cost, technician, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [vehicle_id, type, description, status || 'scheduled', priority || 'medium', scheduled_date, completed_date, cost || 0, technician, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create maintenance error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/maintenance/:id
router.put('/:id', maintenanceBodyValidators.map(v => v.optional()), async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const { vehicle_id, type, description, status, priority, scheduled_date, completed_date, cost, technician, notes } = req.body;

    const result = await pool.query(
      `UPDATE maintenance_records SET
        vehicle_id = COALESCE($1, vehicle_id),
        type = COALESCE($2, type),
        description = COALESCE($3, description),
        status = COALESCE($4, status),
        priority = COALESCE($5, priority),
        scheduled_date = COALESCE($6, scheduled_date),
        completed_date = $7,
        cost = COALESCE($8, cost),
        technician = COALESCE($9, technician),
        notes = $10
       WHERE id = $11
       RETURNING *`,
      [vehicle_id, type, description, status, priority, scheduled_date, completed_date, cost, technician, notes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update maintenance error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/maintenance/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM maintenance_records WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found.' });
    }

    res.json({ message: 'Maintenance record deleted successfully.', record: result.rows[0] });
  } catch (err) {
    console.error('Delete maintenance error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/maintenance/auto-alerts — auto-create alerts for items due in 7 days
router.post('/auto-alerts', async (req, res) => {
  try {
    const dueItems = await pool.query(`
      SELECT ms.*, v.vehicle_id AS vehicle_code, v.make, v.model
      FROM maintenance_schedule ms
      JOIN vehicles v ON ms.vehicle_id = v.id
      WHERE ms.next_due <= NOW() + INTERVAL '7 days'
        AND ms.status != 'completed'
    `);

    if (dueItems.rows.length === 0) {
      return res.json({ message: 'No upcoming maintenance due within 7 days.', alerts_created: 0 });
    }

    let created = 0;
    for (const item of dueItems.rows) {
      // Check if an alert for this vehicle + service_type is already active
      const existing = await pool.query(
        `SELECT id FROM alerts WHERE vehicle_id = $1 AND type = 'maintenance_due' AND title = $2 AND status = 'active'`,
        [item.vehicle_id, `Maintenance Due: ${item.service_type}`]
      );
      if (existing.rows.length > 0) continue;

      await pool.query(
        `INSERT INTO alerts (type, title, message, severity, vehicle_id, status, due_date, created_at)
         VALUES ('maintenance_due', $1, $2, $3, $4, 'active', $5, NOW())`,
        [
          `Maintenance Due: ${item.service_type}`,
          `${item.vehicle_code} (${item.make} ${item.model}) — ${item.service_type} due ${new Date(item.next_due).toLocaleDateString()}. Priority: ${item.priority}.`,
          item.priority === 'critical' ? 'critical' : item.priority === 'high' ? 'high' : 'medium',
          item.vehicle_id,
          item.next_due
        ]
      );
      created++;
    }

    res.json({
      message: `Auto-alerts completed.`,
      due_items_found: dueItems.rows.length,
      alerts_created: created
    });
  } catch (err) {
    console.error('Auto-alerts error:', err);
    res.status(500).json({ error: err.message || 'Failed to create auto-alerts.' });
  }
});

module.exports = router;
