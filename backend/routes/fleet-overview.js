const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET /api/fleet-overview - Get comprehensive fleet status
router.get('/', auth, async (req, res) => {
  try {
    const vehicles = await pool.query(`
      SELECT v.id, v.vehicle_id, v.type, v.make, v.model, v.year,
             v.mileage, v.status, v.fuel_type, v.last_service_date, v.next_service_date,
             d.first_name || ' ' || d.last_name AS assigned_driver,
             d.phone AS driver_phone,
             (SELECT COUNT(*) FROM maintenance_records mr WHERE mr.vehicle_id = v.id AND mr.status = 'in_progress') AS active_maintenance,
             (SELECT COUNT(*) FROM work_orders wo WHERE wo.vehicle_id = v.id AND wo.status IN ('open', 'in_progress')) AS open_work_orders,
             (SELECT COUNT(*) FROM alerts a WHERE a.vehicle_id = v.id AND a.status = 'active') AS active_alerts,
             (SELECT MAX(date) FROM fuel_records fr WHERE fr.vehicle_id = v.id) AS last_fuel_date,
             (SELECT AVG(mpg) FROM fuel_records fr WHERE fr.vehicle_id = v.id AND fr.mpg > 0) AS avg_mpg,
             (SELECT SUM(total_cost) FROM fuel_records fr WHERE fr.vehicle_id = v.id AND fr.date >= CURRENT_DATE - INTERVAL '30 days') AS fuel_cost_30d,
             (SELECT SUM(cost) FROM maintenance_records mr WHERE mr.vehicle_id = v.id AND mr.scheduled_date >= CURRENT_DATE - INTERVAL '30 days') AS maintenance_cost_30d
      FROM vehicles v
      LEFT JOIN drivers d ON v.assigned_driver_id = d.id
      ORDER BY v.vehicle_id
    `);

    const statusSummary = await pool.query(`
      SELECT status, COUNT(*) AS count FROM vehicles GROUP BY status
    `);

    const typeSummary = await pool.query(`
      SELECT type, COUNT(*) AS count,
             COUNT(*) FILTER (WHERE status = 'active') AS active,
             COUNT(*) FILTER (WHERE status = 'maintenance') AS in_maintenance
      FROM vehicles GROUP BY type
    `);

    res.json({
      vehicles: vehicles.rows,
      status_summary: statusSummary.rows,
      type_summary: typeSummary.rows,
      total_vehicles: vehicles.rows.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
