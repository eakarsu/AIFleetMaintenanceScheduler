const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    // Run all queries in parallel
    const [
      vehicleStats,
      driverStats,
      workOrderStats,
      maintenanceStats,
      alertStats,
      monthlyCosts,
      complianceIssues,
      lowStockParts,
      recentActivities
    ] = await Promise.all([
      // Vehicle stats
      pool.query(`
        SELECT
          COUNT(*) AS total_vehicles,
          COUNT(*) FILTER (WHERE status = 'active') AS active_vehicles,
          COUNT(*) FILTER (WHERE status = 'maintenance') AS in_maintenance,
          COUNT(*) FILTER (WHERE status = 'inactive') AS inactive_vehicles
        FROM vehicles
      `),
      // Driver stats
      pool.query(`
        SELECT
          COUNT(*) AS total_drivers,
          COUNT(*) FILTER (WHERE status = 'active') AS active_drivers
        FROM drivers
      `),
      // Work order stats
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status IN ('open', 'in_progress')) AS open_work_orders
        FROM work_orders
      `),
      // Overdue maintenance
      pool.query(`
        SELECT
          COUNT(*) AS overdue_maintenance
        FROM maintenance_schedule
        WHERE status = 'overdue'
      `),
      // Alert stats
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'active') AS total_alerts,
          COUNT(*) FILTER (WHERE status = 'active' AND severity = 'critical') AS critical_alerts
        FROM alerts
      `),
      // Monthly costs (current month)
      pool.query(`
        SELECT COALESCE(SUM(amount), 0) AS monthly_costs
        FROM cost_records
        WHERE date >= date_trunc('month', CURRENT_DATE)
          AND date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
      `),
      // Compliance issues
      pool.query(`
        SELECT COUNT(*) AS compliance_issues
        FROM compliance_records
        WHERE status IN ('expired', 'expiring_soon')
      `),
      // Low stock parts
      pool.query(`
        SELECT COUNT(*) AS low_stock_parts
        FROM parts_inventory
        WHERE status IN ('low_stock', 'out_of_stock')
      `),
      // Recent activities (last 10 work orders)
      pool.query(`
        SELECT wo.id, wo.order_number, wo.type, wo.description, wo.status, wo.priority,
          wo.created_at, v.vehicle_id AS vehicle_code, v.make, v.model
        FROM work_orders wo
        LEFT JOIN vehicles v ON wo.vehicle_id = v.id
        ORDER BY wo.created_at DESC
        LIMIT 10
      `)
    ]);

    res.json({
      total_vehicles: parseInt(vehicleStats.rows[0].total_vehicles),
      active_vehicles: parseInt(vehicleStats.rows[0].active_vehicles),
      in_maintenance: parseInt(vehicleStats.rows[0].in_maintenance),
      inactive_vehicles: parseInt(vehicleStats.rows[0].inactive_vehicles),
      total_drivers: parseInt(driverStats.rows[0].total_drivers),
      active_drivers: parseInt(driverStats.rows[0].active_drivers),
      open_work_orders: parseInt(workOrderStats.rows[0].open_work_orders),
      overdue_maintenance: parseInt(maintenanceStats.rows[0].overdue_maintenance),
      total_alerts: parseInt(alertStats.rows[0].total_alerts),
      critical_alerts: parseInt(alertStats.rows[0].critical_alerts),
      monthly_costs: parseFloat(monthlyCosts.rows[0].monthly_costs),
      compliance_issues: parseInt(complianceIssues.rows[0].compliance_issues),
      low_stock_parts: parseInt(lowStockParts.rows[0].low_stock_parts),
      recent_activities: recentActivities.rows
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
