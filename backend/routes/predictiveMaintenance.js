// Predictive maintenance: ML model predicts failures from engine data.
const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);

// POST /api/predictive-maintenance/ingest { vehicle_id, signals:{rpm, coolant_c, oil_pressure_psi, dtc_codes:[]} }
router.post('/ingest', async (req, res) => {
  try {
    const { vehicle_id, signals = {} } = req.body || {};
    if (!vehicle_id) return res.status(400).json({ error: 'vehicle_id required' });
    try {
      await pool.query(`INSERT INTO obd_samples (vehicle_id, signals, ts) VALUES ($1,$2,NOW())`, [vehicle_id, JSON.stringify(signals)]);
    } catch {}
    // Simple rule-based prediction
    const predictions = [];
    if (Number(signals.coolant_c) > 110) predictions.push({ component: 'cooling_system', probability: 0.7, recommendation: 'inspect immediately' });
    if (Number(signals.oil_pressure_psi) < 15) predictions.push({ component: 'oil_system', probability: 0.8, recommendation: 'stop driving — risk of engine damage' });
    if (Array.isArray(signals.dtc_codes) && signals.dtc_codes.length > 3) predictions.push({ component: 'engine_management', probability: 0.5, recommendation: 'diagnostic scan' });
    return res.json({ vehicle_id, predictions });
  } catch (e) {
    return res.status(500).json({ error: 'ingest failed' });
  }
});

module.exports = router;
