// Custom Views routes for Fleet Maintenance Scheduler
// VIZ: PM Gantt timeline, Downtime heatmap
// NON-VIZ: PM checklist PDF, Maintenance rules editor (CRUD)
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// In-memory rules store (CRUD with optional persistence)
let RULES = [
  { id: 1, service_type: 'Oil Change', interval_miles: 5000, interval_days: 90, parts: 'Oil Filter, Engine Oil', priority: 'medium', est_cost: 120 },
  { id: 2, service_type: 'Tire Rotation', interval_miles: 7500, interval_days: 180, parts: 'Lug Nuts', priority: 'low', est_cost: 60 },
  { id: 3, service_type: 'Brake Inspection', interval_miles: 15000, interval_days: 365, parts: 'Brake Pads, Brake Fluid', priority: 'high', est_cost: 250 },
  { id: 4, service_type: 'Transmission Fluid', interval_miles: 30000, interval_days: 730, parts: 'ATF Fluid, Filter', priority: 'medium', est_cost: 180 },
  { id: 5, service_type: 'Air Filter Replacement', interval_miles: 15000, interval_days: 365, parts: 'Air Filter', priority: 'low', est_cost: 45 }
];
let NEXT_RULE_ID = 6;

// ============================================================
// 1. VIZ: PM Schedule Gantt Timeline
// GET /api/custom-views/pm-gantt
// ============================================================
router.get('/pm-gantt', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ms.id,
        ms.vehicle_id,
        v.vehicle_id AS vehicle_code,
        v.make,
        v.model,
        ms.service_type,
        ms.next_due,
        ms.last_performed,
        ms.priority,
        ms.status,
        ms.estimated_cost,
        ms.assigned_shop
      FROM maintenance_schedule ms
      LEFT JOIN vehicles v ON v.id = ms.vehicle_id
      ORDER BY ms.next_due ASC NULLS LAST
      LIMIT 80
    `);

    const items = result.rows.map(r => {
      const due = r.next_due ? new Date(r.next_due) : new Date();
      // duration based on priority (days)
      const durationDays = r.priority === 'high' ? 3 : r.priority === 'medium' ? 2 : 1;
      const start = new Date(due);
      const end = new Date(due);
      end.setDate(end.getDate() + durationDays);
      return {
        id: r.id,
        vehicle_id: r.vehicle_id,
        vehicle_label: `${r.vehicle_code || 'V' + r.vehicle_id} ${r.make || ''} ${r.model || ''}`.trim(),
        service_type: r.service_type,
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
        priority: r.priority || 'medium',
        status: r.status || 'upcoming',
        estimated_cost: Number(r.estimated_cost) || 0,
        assigned_shop: r.assigned_shop || ''
      };
    });

    // Build date span
    let minDate = null, maxDate = null;
    items.forEach(i => {
      const s = new Date(i.start);
      const e = new Date(i.end);
      if (!minDate || s < minDate) minDate = s;
      if (!maxDate || e > maxDate) maxDate = e;
    });
    if (!minDate) minDate = new Date();
    if (!maxDate) { maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 30); }

    res.json({
      items,
      span: {
        start: minDate.toISOString().slice(0, 10),
        end: maxDate.toISOString().slice(0, 10)
      },
      total: items.length
    });
  } catch (err) {
    console.error('pm-gantt error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// 2. VIZ: Downtime Heatmap (vehicle x week)
// GET /api/custom-views/downtime-heatmap
// ============================================================
router.get('/downtime-heatmap', async (req, res) => {
  try {
    const weeksBack = 8;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build list of week buckets (most recent first then reversed)
    const weeks = [];
    for (let i = weeksBack - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i * 7);
      // Snap to Monday
      const day = d.getDay();
      const diff = (day === 0 ? -6 : 1 - day);
      d.setDate(d.getDate() + diff);
      weeks.push(d.toISOString().slice(0, 10));
    }

    const rangeStart = weeks[0];
    const rangeEndDate = new Date(weeks[weeks.length - 1]);
    rangeEndDate.setDate(rangeEndDate.getDate() + 7);

    const vehiclesRes = await pool.query(`SELECT id, vehicle_id, make, model FROM vehicles ORDER BY id LIMIT 12`);
    const downtimeRes = await pool.query(`
      SELECT vehicle_id, start_date, COALESCE(duration_hours, 0) AS duration_hours
      FROM downtime_records
      WHERE start_date >= $1 AND start_date < $2
    `, [rangeStart, rangeEndDate.toISOString().slice(0, 10)]);

    // Aggregate to map[vehicle_id][week] = hours
    const cellMap = {};
    downtimeRes.rows.forEach(r => {
      const sd = new Date(r.start_date);
      sd.setHours(0, 0, 0, 0);
      const day = sd.getDay();
      const diff = (day === 0 ? -6 : 1 - day);
      sd.setDate(sd.getDate() + diff);
      const wk = sd.toISOString().slice(0, 10);
      if (!cellMap[r.vehicle_id]) cellMap[r.vehicle_id] = {};
      cellMap[r.vehicle_id][wk] = (cellMap[r.vehicle_id][wk] || 0) + Number(r.duration_hours);
    });

    const grid = vehiclesRes.rows.map(v => ({
      vehicle_id: v.id,
      label: `${v.vehicle_id} (${v.make} ${v.model})`,
      cells: weeks.map(w => ({
        week: w,
        hours: Number((cellMap[v.id] && cellMap[v.id][w]) || 0)
      }))
    }));

    // Max hours for color scaling
    let maxHours = 0;
    grid.forEach(row => row.cells.forEach(c => { if (c.hours > maxHours) maxHours = c.hours; }));
    if (maxHours === 0) maxHours = 1;

    res.json({ weeks, grid, max_hours: maxHours, vehicles_total: vehiclesRes.rows.length });
  } catch (err) {
    console.error('downtime-heatmap error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// 3. NON-VIZ: PM Checklist PDF (text-based PDF, no extra deps)
// GET /api/custom-views/pm-checklist-pdf?vehicle_id=...
// ============================================================
function escapePdfText(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildPdf(lines) {
  // Minimal single-page PDF generation
  const header = '%PDF-1.4\n';
  const objects = [];

  // Build content stream
  let content = 'BT\n/F1 14 Tf\n50 770 Td\n';
  content += `(${escapePdfText(lines[0] || 'PM Checklist')}) Tj\n`;
  content += '0 -22 Td\n/F1 10 Tf\n';
  for (let i = 1; i < lines.length; i++) {
    content += `(${escapePdfText(lines[i])}) Tj\n0 -14 Td\n`;
  }
  content += 'ET\n';

  const streamObj = `<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}endstream\n`;

  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>');
  objects.push(streamObj);
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  let pdf = header;
  const offsets = [];
  objects.forEach((obj, idx) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${idx + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach(off => {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

router.get('/pm-checklist-pdf', async (req, res) => {
  try {
    const vehicleId = req.query.vehicle_id ? parseInt(req.query.vehicle_id, 10) : null;
    let vehicleLabel = 'All Vehicles';
    let vehicleRow = null;

    if (vehicleId) {
      const v = await pool.query('SELECT id, vehicle_id, make, model, year, vin, mileage FROM vehicles WHERE id = $1', [vehicleId]);
      if (v.rows.length) {
        vehicleRow = v.rows[0];
        vehicleLabel = `${vehicleRow.vehicle_id} ${vehicleRow.year} ${vehicleRow.make} ${vehicleRow.model}`;
      }
    }

    const lines = [];
    lines.push('FleetGuard AI - Preventive Maintenance Checklist');
    lines.push(`Generated: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`);
    lines.push(`Vehicle: ${vehicleLabel}`);
    if (vehicleRow) {
      lines.push(`VIN: ${vehicleRow.vin}  Mileage: ${vehicleRow.mileage}`);
    }
    lines.push('');
    lines.push('Inspection Items:');
    RULES.forEach((rule, i) => {
      lines.push(`[ ] ${i + 1}. ${rule.service_type} - every ${rule.interval_miles} mi / ${rule.interval_days} days`);
      lines.push(`     Parts: ${rule.parts}   Est cost: $${rule.est_cost}   Priority: ${rule.priority}`);
    });
    lines.push('');
    lines.push('Technician Signature: ____________________');
    lines.push('Date Completed: __________________________');
    lines.push('Notes:');
    lines.push('________________________________________________');
    lines.push('________________________________________________');

    const pdf = buildPdf(lines);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="pm-checklist-${vehicleId || 'all'}.pdf"`);
    res.send(pdf);
  } catch (err) {
    console.error('pm-checklist-pdf error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// 4. NON-VIZ: Maintenance Rules Editor (CRUD)
// GET/POST/PUT/DELETE /api/custom-views/maintenance-rules
// ============================================================
router.get('/maintenance-rules', (req, res) => {
  res.json({ rules: RULES, total: RULES.length });
});

router.post('/maintenance-rules', (req, res) => {
  const { service_type, interval_miles, interval_days, parts, priority, est_cost } = req.body || {};
  if (!service_type) return res.status(400).json({ error: 'service_type required' });
  const rule = {
    id: NEXT_RULE_ID++,
    service_type,
    interval_miles: Number(interval_miles) || 0,
    interval_days: Number(interval_days) || 0,
    parts: parts || '',
    priority: priority || 'medium',
    est_cost: Number(est_cost) || 0
  };
  RULES.push(rule);
  res.status(201).json(rule);
});

router.put('/maintenance-rules/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = RULES.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
  const cur = RULES[idx];
  const { service_type, interval_miles, interval_days, parts, priority, est_cost } = req.body || {};
  RULES[idx] = {
    ...cur,
    service_type: service_type ?? cur.service_type,
    interval_miles: interval_miles !== undefined ? Number(interval_miles) : cur.interval_miles,
    interval_days: interval_days !== undefined ? Number(interval_days) : cur.interval_days,
    parts: parts ?? cur.parts,
    priority: priority ?? cur.priority,
    est_cost: est_cost !== undefined ? Number(est_cost) : cur.est_cost
  };
  res.json(RULES[idx]);
});

router.delete('/maintenance-rules/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = RULES.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
  const removed = RULES.splice(idx, 1)[0];
  res.json({ deleted: removed });
});

module.exports = router;
