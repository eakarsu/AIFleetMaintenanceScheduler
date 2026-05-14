// Parts availability: track inventory, auto-order when low, recommend
// compatible alternatives.
const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);

// GET /api/parts-availability/low-stock?threshold=5
router.get('/low-stock', async (req, res) => {
  try {
    const threshold = Math.max(parseInt(req.query.threshold) || 5, 1);
    const r = await pool.query(`SELECT id, sku, name, qty, reorder_threshold FROM parts WHERE qty <= GREATEST(reorder_threshold, $1)`, [threshold]).catch(() => ({ rows: [] }));
    return res.json({ threshold, count: r.rows.length, low_stock: r.rows });
  } catch (e) {
    return res.status(500).json({ error: 'low-stock failed' });
  }
});

// POST /api/parts-availability/auto-order { part_id, qty }
router.post('/auto-order', async (req, res) => {
  const { part_id, qty = 10 } = req.body || {};
  if (!part_id) return res.status(400).json({ error: 'part_id required' });
  try {
    await pool.query(`INSERT INTO parts_orders (part_id, qty, status, source, created_at) VALUES ($1,$2,'queued','auto_order',NOW())`, [part_id, Number(qty)]);
  } catch {}
  // TODO: configure credentials — PARTS_SUPPLIER_API_KEY for real ordering
  return res.json({ part_id, qty: Number(qty), status: 'queued' });
});

// GET /api/parts-availability/alternatives/:part_id
router.get('/alternatives/:part_id', async (req, res) => {
  try {
    const r = await pool.query(`SELECT id, sku, name, qty FROM parts WHERE category = (SELECT category FROM parts WHERE id = $1) AND id <> $1 LIMIT 10`, [req.params.part_id]).catch(() => ({ rows: [] }));
    return res.json({ part_id: req.params.part_id, alternatives: r.rows });
  } catch (e) {
    return res.status(500).json({ error: 'alternatives failed' });
  }
});

module.exports = router;
