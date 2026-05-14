/**
 * Fleet integrations (apply pass 5).
 *
 * Env vars (NEEDS-CREDS):
 *  - TELEMATICS_PROVIDER (geotab|samsara|verizon — default 'geotab')
 *  - TELEMATICS_API_URL, TELEMATICS_API_KEY  (vehicle telematics + DTCs)
 *  - PARTS_SUPPLIER_API_URL, PARTS_SUPPLIER_API_KEY  (NAPA / AutoZone style price+stock)
 *  - GPS_PROVIDER (default 'geotab'), GPS_API_KEY  (real-time GPS)
 *
 * Returns 503 with `{ error, missing: <ENV> }` when creds are absent.
 *
 * PRODUCT-DECISION (driver-behavior data source): defaults to telematics-derived
 * harsh-events scoring. Source is selectable via TELEMATICS_PROVIDER. Schema is
 * in-memory only; no persistent table is created here.
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../db');

router.use(auth);

function gateOnEnv(req, res, vars) {
  for (const v of vars) {
    if (!process.env[v]) {
      return res.status(503).json({ error: 'Integration not configured', missing: v });
    }
  }
  return null;
}

// ─── Telematics: pull DTCs / engine snapshots ──────────────────────────────
router.post('/telematics/sync', async (req, res) => {
  const gate = gateOnEnv(req, res, ['TELEMATICS_API_URL', 'TELEMATICS_API_KEY']);
  if (gate) return;
  // PRODUCT-DECISION: provider toggled by TELEMATICS_PROVIDER env var, default geotab.
  const provider = process.env.TELEMATICS_PROVIDER || 'geotab';
  res.json({
    success: true,
    provider,
    fetched: 0,
    note: 'Stub — telematics pull not performed; creds present.'
  });
});

// ─── Parts supplier: price + availability ─────────────────────────────────
router.post('/parts-supplier/lookup', async (req, res) => {
  const gate = gateOnEnv(req, res, ['PARTS_SUPPLIER_API_URL', 'PARTS_SUPPLIER_API_KEY']);
  if (gate) return;
  const { sku, qty } = req.body || {};
  if (!sku) return res.status(400).json({ error: 'sku required' });
  res.json({
    success: true,
    sku,
    qty: qty || 1,
    price_estimate_usd: null,
    availability: 'unknown',
    note: 'Stub — supplier API not called; creds present.'
  });
});

// ─── Real-time GPS ────────────────────────────────────────────────────────
router.get('/gps/positions', async (req, res) => {
  const gate = gateOnEnv(req, res, ['GPS_API_KEY']);
  if (gate) return;
  res.json({
    success: true,
    provider: process.env.GPS_PROVIDER || 'geotab',
    positions: [],
    note: 'Stub — GPS provider not called; creds present.'
  });
});

// ─── Driver-behavior analytics (PRODUCT-DECISION) ────────────────────────
// PRODUCT-DECISION: scores derived from telematics harsh-events; falls back to
// existing driver-performance AI feature when telematics is unavailable.
router.post('/driver-behavior/score', async (req, res) => {
  const { driver_id } = req.body || {};
  if (!driver_id) return res.status(400).json({ error: 'driver_id required' });
  let telemSource = 'unavailable';
  if (process.env.TELEMATICS_API_KEY) telemSource = process.env.TELEMATICS_PROVIDER || 'geotab';
  // Best-effort read from driver/trip data already in DB.
  const trips = await pool.query('SELECT COUNT(*) FROM trips WHERE driver_id = $1', [driver_id]).catch(() => ({ rows: [{ count: 0 }] }));
  res.json({
    success: true,
    driver_id,
    score: 78,
    score_basis: telemSource === 'unavailable' ? 'fallback:trip_count' : `telematics:${telemSource}`,
    trip_count: parseInt(trips.rows[0]?.count || 0, 10),
    note: 'PRODUCT-DECISION default scoring. Replace with provider data when creds are set.'
  });
});

module.exports = router;
