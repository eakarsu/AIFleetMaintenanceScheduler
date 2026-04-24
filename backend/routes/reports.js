const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET /api/reports/vehicles - Vehicle fleet report
router.get('/vehicles', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.vehicle_id, v.type, v.make, v.model, v.year, v.vin, v.license_plate,
             v.mileage, v.status, v.fuel_type, v.last_service_date, v.next_service_date,
             d.first_name || ' ' || d.last_name AS assigned_driver
      FROM vehicles v
      LEFT JOIN drivers d ON v.assigned_driver_id = d.id
      ORDER BY v.vehicle_id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/maintenance - Maintenance summary report
router.get('/maintenance', auth, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = `
      SELECT mr.id, v.vehicle_id, v.make || ' ' || v.model AS vehicle_name,
             mr.type, mr.description, mr.status, mr.priority,
             mr.scheduled_date, mr.completed_date, mr.cost, mr.technician
      FROM maintenance_records mr
      JOIN vehicles v ON mr.vehicle_id = v.id
    `;
    const params = [];
    if (start_date && end_date) {
      query += ' WHERE mr.scheduled_date BETWEEN $1 AND $2';
      params.push(start_date, end_date);
    }
    query += ' ORDER BY mr.scheduled_date DESC';
    const result = await pool.query(query, params);

    const summary = await pool.query(`
      SELECT
        COUNT(*) AS total_records,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed,
        COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress,
        COUNT(*) FILTER (WHERE status = 'scheduled') AS scheduled,
        COALESCE(SUM(cost), 0) AS total_cost,
        COALESCE(AVG(cost), 0) AS avg_cost
      FROM maintenance_records
      ${start_date && end_date ? 'WHERE scheduled_date BETWEEN $1 AND $2' : ''}
    `, params);

    res.json({ records: result.rows, summary: summary.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/costs - Cost breakdown report
router.get('/costs', auth, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const params = [];
    let dateFilter = '';
    if (start_date && end_date) {
      dateFilter = 'WHERE cr.date BETWEEN $1 AND $2';
      params.push(start_date, end_date);
    }

    const byCategory = await pool.query(`
      SELECT category, COUNT(*) AS count, SUM(amount) AS total,
             AVG(amount) AS average, MIN(amount) AS min_cost, MAX(amount) AS max_cost
      FROM cost_records cr ${dateFilter}
      GROUP BY category ORDER BY total DESC
    `, params);

    const byVehicle = await pool.query(`
      SELECT v.vehicle_id, v.make || ' ' || v.model AS vehicle_name,
             COUNT(*) AS record_count, SUM(cr.amount) AS total_cost
      FROM cost_records cr
      JOIN vehicles v ON cr.vehicle_id = v.id
      ${dateFilter}
      GROUP BY v.vehicle_id, v.make, v.model ORDER BY total_cost DESC
    `, params);

    const monthly = await pool.query(`
      SELECT TO_CHAR(date, 'YYYY-MM') AS month, SUM(amount) AS total,
             COUNT(*) AS count
      FROM cost_records cr ${dateFilter}
      GROUP BY TO_CHAR(date, 'YYYY-MM') ORDER BY month DESC
      LIMIT 12
    `, params);

    res.json({
      by_category: byCategory.rows,
      by_vehicle: byVehicle.rows,
      monthly: monthly.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/fuel - Fuel consumption report
router.get('/fuel', auth, async (req, res) => {
  try {
    const byVehicle = await pool.query(`
      SELECT v.vehicle_id, v.make || ' ' || v.model AS vehicle_name,
             COUNT(*) AS fill_ups, SUM(fr.gallons) AS total_gallons,
             SUM(fr.total_cost) AS total_fuel_cost,
             AVG(fr.mpg) FILTER (WHERE fr.mpg > 0) AS avg_mpg,
             AVG(fr.cost_per_gallon) AS avg_price_per_gallon
      FROM fuel_records fr
      JOIN vehicles v ON fr.vehicle_id = v.id
      GROUP BY v.vehicle_id, v.make, v.model ORDER BY total_fuel_cost DESC
    `);

    const monthly = await pool.query(`
      SELECT TO_CHAR(date, 'YYYY-MM') AS month,
             SUM(gallons) AS total_gallons, SUM(total_cost) AS total_cost,
             AVG(mpg) FILTER (WHERE mpg > 0) AS avg_mpg, COUNT(*) AS fill_ups
      FROM fuel_records
      GROUP BY TO_CHAR(date, 'YYYY-MM') ORDER BY month DESC LIMIT 12
    `);

    res.json({ by_vehicle: byVehicle.rows, monthly: monthly.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/drivers - Driver performance report
router.get('/drivers', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.employee_id, d.first_name || ' ' || d.last_name AS driver_name,
             d.license_type, d.status, d.rating, d.violations,
             COUNT(DISTINCT da.id) AS total_assignments,
             COUNT(DISTINCT tl.id) AS total_trips,
             COALESCE(SUM(tl.distance_miles), 0) AS total_miles,
             COUNT(DISTINCT i.id) AS total_incidents
      FROM drivers d
      LEFT JOIN driver_assignments da ON d.id = da.driver_id
      LEFT JOIN trip_logs tl ON d.id = tl.driver_id
      LEFT JOIN incidents i ON d.id = i.driver_id
      GROUP BY d.id, d.employee_id, d.first_name, d.last_name, d.license_type, d.status, d.rating, d.violations
      ORDER BY d.rating DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
