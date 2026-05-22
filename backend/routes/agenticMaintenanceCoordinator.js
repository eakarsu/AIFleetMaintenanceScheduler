// Agentic maintenance coordinator: NL → maintenance strategy + budget.
const express = require('express');
const fetch = require('node-fetch');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);

// POST /api/agentic-maintenance-coordinator/strategy { fleet_age_avg, downtime_pct, vehicle_count, budget_usd }
router.post('/strategy', async (req, res) => {
  try {
    const body = req.body || {};
    // TODO: configure credentials — OPENROUTER_API_KEY
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) return res.status(503).json({ error: 'OPENROUTER_API_KEY missing' });
    const failures = await pool.query(`SELECT vehicle_id, failure_type, COUNT(*) FROM incidents GROUP BY 1,2 ORDER BY 3 DESC LIMIT 20`).catch(() => ({ rows: [] }));
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
        messages: [
          { role: 'system', content: 'You are a fleet maintenance director. Output JSON {"strategy":"...","pm_schedule_changes":["..."],"budget_estimate":num,"top_failure_modes":[{"type":"...","priority":"..."}]}.' },
          { role: 'user', content: JSON.stringify({ ...body, top_failures: failures.rows }) },
        ],
      }),
    });
    const j = await r.json();
    const out = j.choices?.[0]?.message?.content;
    let parsed; try { parsed = JSON.parse(out.match(/\{[\s\S]*\}/)?.[0] || out); } catch { parsed = { raw: out }; }
    return res.json({ inputs: body, strategy: parsed });
  } catch (e) {
    return res.status(500).json({ error: 'strategy failed' });
  }
});

module.exports = router;
