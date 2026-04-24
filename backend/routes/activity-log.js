const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET /api/activity-log - Get recent activity across the system
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 50, type } = req.query;

    const activities = [];

    // Recent maintenance records
    if (!type || type === 'maintenance') {
      const maintenance = await pool.query(`
        SELECT 'maintenance' AS activity_type, mr.id,
               'Maintenance: ' || mr.type AS title,
               mr.description, mr.status, mr.created_at,
               v.vehicle_id, v.make || ' ' || v.model AS vehicle_name
        FROM maintenance_records mr
        JOIN vehicles v ON mr.vehicle_id = v.id
        ORDER BY mr.created_at DESC LIMIT $1
      `, [limit]);
      activities.push(...maintenance.rows);
    }

    // Recent work orders
    if (!type || type === 'workorders') {
      const workOrders = await pool.query(`
        SELECT 'work_order' AS activity_type, wo.id,
               'Work Order: ' || wo.order_number AS title,
               wo.description, wo.status, wo.created_at,
               v.vehicle_id, v.make || ' ' || v.model AS vehicle_name
        FROM work_orders wo
        JOIN vehicles v ON wo.vehicle_id = v.id
        ORDER BY wo.created_at DESC LIMIT $1
      `, [limit]);
      activities.push(...workOrders.rows);
    }

    // Recent alerts
    if (!type || type === 'alerts') {
      const alerts = await pool.query(`
        SELECT 'alert' AS activity_type, a.id,
               'Alert: ' || a.title AS title,
               a.message AS description, a.status, a.created_at,
               v.vehicle_id, v.make || ' ' || v.model AS vehicle_name
        FROM alerts a
        JOIN vehicles v ON a.vehicle_id = v.id
        ORDER BY a.created_at DESC LIMIT $1
      `, [limit]);
      activities.push(...alerts.rows);
    }

    // Recent incidents
    if (!type || type === 'incidents') {
      const incidents = await pool.query(`
        SELECT 'incident' AS activity_type, i.id,
               'Incident: ' || i.incident_type AS title,
               i.description, i.status, i.created_at,
               v.vehicle_id, v.make || ' ' || v.model AS vehicle_name
        FROM incidents i
        JOIN vehicles v ON i.vehicle_id = v.id
        ORDER BY i.created_at DESC LIMIT $1
      `, [limit]);
      activities.push(...incidents.rows);
    }

    // Recent inspections
    if (!type || type === 'inspections') {
      const inspections = await pool.query(`
        SELECT 'inspection' AS activity_type, ins.id,
               'Inspection: ' || ins.inspection_type AS title,
               'Overall: ' || ins.overall_status AS description, ins.status, ins.created_at,
               v.vehicle_id, v.make || ' ' || v.model AS vehicle_name
        FROM inspections ins
        JOIN vehicles v ON ins.vehicle_id = v.id
        ORDER BY ins.created_at DESC LIMIT $1
      `, [limit]);
      activities.push(...inspections.rows);
    }

    // Recent fuel records
    if (!type || type === 'fuel') {
      const fuel = await pool.query(`
        SELECT 'fuel' AS activity_type, fr.id,
               'Fuel Fill-up' AS title,
               fr.gallons || ' gal @ $' || fr.cost_per_gallon || '/gal - ' || COALESCE(fr.station, 'Unknown') AS description,
               'completed' AS status, fr.created_at,
               v.vehicle_id, v.make || ' ' || v.model AS vehicle_name
        FROM fuel_records fr
        JOIN vehicles v ON fr.vehicle_id = v.id
        ORDER BY fr.created_at DESC LIMIT $1
      `, [limit]);
      activities.push(...fuel.rows);
    }

    // Sort all activities by created_at descending
    activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Summary counts
    const summary = {
      total: activities.length,
      by_type: {}
    };
    activities.forEach(a => {
      summary.by_type[a.activity_type] = (summary.by_type[a.activity_type] || 0) + 1;
    });

    res.json({ activities: activities.slice(0, parseInt(limit)), summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
