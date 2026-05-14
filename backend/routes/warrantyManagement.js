// Warranty management: track claims, identify recurring failures, push back.
const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);

// GET /api/warranty-management/recurring?since_months=12
router.get('/recurring', async (req, res) => {
  try {
    const sinceMonths = Math.min(parseInt(req.query.since_months) || 12, 36);
    const r = await pool.query(
      `SELECT v.make, v.model, w.failure_type, COUNT(*) AS occurrences
       FROM warranties w INNER JOIN vehicles v ON v.id = w.vehicle_id
       WHERE w.claim_date > NOW() - INTERVAL '1 month' * $1
       GROUP BY 1,2,3
       HAVING COUNT(*) > 2
       ORDER BY 4 DESC LIMIT 100`,
      [sinceMonths]
    ).catch(() => ({ rows: [] }));
    return res.json({ since_months: sinceMonths, count: r.rows.length, recurring_failures: r.rows });
  } catch (e) {
    return res.status(500).json({ error: 'recurring failed' });
  }
});

// POST /api/warranty-management/escalate { warranty_id, oem_contact, evidence }
router.post('/escalate', async (req, res) => {
  const { warranty_id, oem_contact, evidence } = req.body || {};
  if (!warranty_id || !oem_contact) return res.status(400).json({ error: 'warranty_id + oem_contact required' });
  try {
    await pool.query(`UPDATE warranties SET status = 'escalated', escalation_payload = $1, escalated_at = NOW() WHERE id = $2`, [JSON.stringify({ oem_contact, evidence }), warranty_id]);
  } catch {}
  return res.json({ warranty_id, status: 'escalated', oem_contact });
});

module.exports = router;
