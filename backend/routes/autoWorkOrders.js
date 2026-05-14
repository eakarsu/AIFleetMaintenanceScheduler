// Automated work orders: generate WOs from maintenance schedules & predictions.
const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);

// POST /api/auto-work-orders/sweep — pull all overdue maintenance + create WOs
router.post('/sweep', async (req, res) => {
  try {
    const overdue = await pool.query(
      `SELECT vehicle_id, next_service_at, service_type FROM maintenance_schedule
       WHERE next_service_at <= NOW() AND completed = false LIMIT 200`
    ).catch(() => ({ rows: [] }));
    const created = [];
    for (const m of overdue.rows) {
      try {
        const r = await pool.query(
          `INSERT INTO workorders (vehicle_id, service_type, status, scheduled_for, source, created_at)
           VALUES ($1,$2,'open',NOW(),'auto_sweep',NOW()) RETURNING id`,
          [m.vehicle_id, m.service_type]
        );
        created.push({ id: r.rows[0].id, vehicle_id: m.vehicle_id, service_type: m.service_type });
      } catch {}
    }
    return res.json({ overdue: overdue.rows.length, created });
  } catch (e) {
    return res.status(500).json({ error: 'sweep failed' });
  }
});

module.exports = router;
