const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET /api/reminders - Get all upcoming service reminders
router.get('/', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Upcoming maintenance schedules
    const maintenance = await pool.query(`
      SELECT ms.id, 'maintenance' AS reminder_type, ms.service_type AS title,
             v.vehicle_id, v.make || ' ' || v.model AS vehicle_name,
             ms.next_due AS due_date, ms.priority, ms.status,
             ms.estimated_cost, ms.assigned_shop,
             CASE
               WHEN ms.next_due < CURRENT_DATE THEN 'overdue'
               WHEN ms.next_due <= CURRENT_DATE + ($1 || ' days')::interval THEN 'upcoming'
               ELSE 'future'
             END AS urgency
      FROM maintenance_schedule ms
      JOIN vehicles v ON ms.vehicle_id = v.id
      WHERE ms.status != 'completed'
      ORDER BY ms.next_due ASC
    `, [days]);

    // Expiring compliance records
    const compliance = await pool.query(`
      SELECT cr.id, 'compliance' AS reminder_type,
             cr.inspection_type AS title,
             v.vehicle_id, v.make || ' ' || v.model AS vehicle_name,
             cr.expiry_date AS due_date, 'high' AS priority, cr.status,
             NULL AS estimated_cost, NULL AS assigned_shop,
             CASE
               WHEN cr.expiry_date < CURRENT_DATE THEN 'overdue'
               WHEN cr.expiry_date <= CURRENT_DATE + ($1 || ' days')::interval THEN 'upcoming'
               ELSE 'future'
             END AS urgency
      FROM compliance_records cr
      JOIN vehicles v ON cr.vehicle_id = v.id
      WHERE cr.expiry_date <= CURRENT_DATE + ($1 || ' days')::interval
      ORDER BY cr.expiry_date ASC
    `, [days]);

    // Expiring driver licenses
    const licenses = await pool.query(`
      SELECT d.id, 'license' AS reminder_type,
             'License Expiry: ' || d.first_name || ' ' || d.last_name AS title,
             d.employee_id AS vehicle_id, d.first_name || ' ' || d.last_name AS vehicle_name,
             d.license_expiry AS due_date, 'critical' AS priority, d.status,
             NULL AS estimated_cost, NULL AS assigned_shop,
             CASE
               WHEN d.license_expiry < CURRENT_DATE THEN 'overdue'
               WHEN d.license_expiry <= CURRENT_DATE + ($1 || ' days')::interval THEN 'upcoming'
               ELSE 'future'
             END AS urgency
      FROM drivers d
      WHERE d.license_expiry <= CURRENT_DATE + ($1 || ' days')::interval
        AND d.status = 'active'
      ORDER BY d.license_expiry ASC
    `, [days]);

    // Expiring warranties
    const warranties = await pool.query(`
      SELECT w.id, 'warranty' AS reminder_type,
             w.warranty_type || ' - ' || w.provider AS title,
             v.vehicle_id, v.make || ' ' || v.model AS vehicle_name,
             w.end_date AS due_date, 'medium' AS priority, w.status,
             NULL AS estimated_cost, NULL AS assigned_shop,
             CASE
               WHEN w.end_date < CURRENT_DATE THEN 'overdue'
               WHEN w.end_date <= CURRENT_DATE + ($1 || ' days')::interval THEN 'upcoming'
               ELSE 'future'
             END AS urgency
      FROM warranties w
      JOIN vehicles v ON w.vehicle_id = v.id
      WHERE w.end_date <= CURRENT_DATE + ($1 || ' days')::interval
        AND w.status = 'active'
      ORDER BY w.end_date ASC
    `, [days]);

    // Low stock parts
    const lowStock = await pool.query(`
      SELECT id, 'parts' AS reminder_type,
             'Low Stock: ' || name AS title,
             part_number AS vehicle_id, name AS vehicle_name,
             CURRENT_DATE AS due_date,
             CASE WHEN quantity = 0 THEN 'critical' ELSE 'high' END AS priority,
             status, unit_cost * (min_quantity - quantity) AS estimated_cost,
             supplier AS assigned_shop,
             CASE WHEN quantity = 0 THEN 'overdue' ELSE 'upcoming' END AS urgency
      FROM parts_inventory
      WHERE quantity <= min_quantity
      ORDER BY quantity ASC
    `);

    const allReminders = [
      ...maintenance.rows,
      ...compliance.rows,
      ...licenses.rows,
      ...warranties.rows,
      ...lowStock.rows
    ].sort((a, b) => {
      const urgencyOrder = { overdue: 0, upcoming: 1, future: 2 };
      return (urgencyOrder[a.urgency] || 2) - (urgencyOrder[b.urgency] || 2)
        || new Date(a.due_date) - new Date(b.due_date);
    });

    const summary = {
      total: allReminders.length,
      overdue: allReminders.filter(r => r.urgency === 'overdue').length,
      upcoming: allReminders.filter(r => r.urgency === 'upcoming').length,
      by_type: {
        maintenance: maintenance.rows.length,
        compliance: compliance.rows.length,
        license: licenses.rows.length,
        warranty: warranties.rows.length,
        parts: lowStock.rows.length
      }
    };

    res.json({ reminders: allReminders, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
