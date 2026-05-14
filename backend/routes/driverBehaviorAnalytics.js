// Driver behavior analytics: correlate driving behavior with maintenance.
const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);

// GET /api/driver-behavior-analytics/:driver_id/correlation
router.get('/:driver_id/correlation', async (req, res) => {
  try {
    const { driver_id } = req.params;
    const driving = await pool.query(`SELECT COUNT(*) FILTER (WHERE hard_brake = true) AS hard_brakes, COUNT(*) FILTER (WHERE idle_minutes > 30) AS long_idles FROM trips WHERE driver_id = $1`, [driver_id]).catch(() => ({ rows: [{}] }));
    const repairs = await pool.query(`SELECT COUNT(*) FROM workorders w INNER JOIN trips t ON t.vehicle_id = w.vehicle_id WHERE t.driver_id = $1 AND w.created_at > NOW() - INTERVAL '180 days'`, [driver_id]).catch(() => ({ rows: [{ count: 0 }] }));
    const score = 100 - Math.min(40, Number(driving.rows[0].hard_brakes || 0) * 2) - Math.min(30, Number(driving.rows[0].long_idles || 0));
    return res.json({
      driver_id,
      driving_signals: driving.rows[0],
      maintenance_workorders_180d: Number(repairs.rows[0].count),
      behavior_score: Math.max(0, score),
    });
  } catch (e) {
    return res.status(500).json({ error: 'correlation failed' });
  }
});

module.exports = router;
