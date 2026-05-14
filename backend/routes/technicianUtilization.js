// Technician utilization: analyse skill levels, assign complex jobs.
const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);

// GET /api/technician-utilization/load
router.get('/load', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT t.id, t.name, t.skill_level, COUNT(w.id) AS open_workorders, COALESCE(SUM(w.est_minutes),0) AS minutes_queued
       FROM technicians t
       LEFT JOIN workorders w ON w.assigned_to = t.id AND w.status IN ('open','in_progress')
       GROUP BY t.id, t.name, t.skill_level
       ORDER BY minutes_queued DESC LIMIT 200`
    ).catch(() => ({ rows: [] }));
    return res.json({ count: r.rows.length, technicians: r.rows });
  } catch (e) {
    return res.status(500).json({ error: 'load failed' });
  }
});

// POST /api/technician-utilization/auto-assign { workorder_id }
router.post('/auto-assign', async (req, res) => {
  try {
    const { workorder_id } = req.body || {};
    if (!workorder_id) return res.status(400).json({ error: 'workorder_id required' });
    const wo = await pool.query(`SELECT required_skill, est_minutes FROM workorders WHERE id = $1`, [workorder_id]);
    if (!wo.rows[0]) return res.status(404).json({ error: 'workorder not found' });
    const required = wo.rows[0].required_skill || 'general';
    const tech = await pool.query(
      `SELECT t.id, t.name FROM technicians t
       LEFT JOIN workorders w ON w.assigned_to = t.id AND w.status IN ('open','in_progress')
       WHERE t.skills::text ILIKE $1
       GROUP BY t.id, t.name
       ORDER BY COUNT(w.id) ASC LIMIT 1`,
      [`%${required}%`]
    ).catch(() => ({ rows: [] }));
    if (!tech.rows[0]) return res.status(404).json({ error: 'no available technician' });
    await pool.query(`UPDATE workorders SET assigned_to = $1, status = 'in_progress' WHERE id = $2`, [tech.rows[0].id, workorder_id]).catch(() => null);
    return res.json({ workorder_id, assigned_to: tech.rows[0] });
  } catch (e) {
    return res.status(500).json({ error: 'auto-assign failed' });
  }
});

module.exports = router;
