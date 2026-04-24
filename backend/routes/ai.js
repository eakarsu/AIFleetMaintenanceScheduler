const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// Helper function to call OpenRouter API
async function callOpenRouter(prompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Fleet Maintenance Scheduler'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
      messages: [
        {
          role: 'system',
          content: 'You are an expert fleet maintenance analyst. Provide detailed, actionable insights. Format your response with clear sections using markdown headers (##), bullet points, and bold text for key findings. Be specific with numbers and recommendations.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'OpenRouter API error');
  }

  return data.choices[0].message.content;
}

// POST /api/ai/predictive-maintenance
router.post('/predictive-maintenance', async (req, res) => {
  try {
    const { vehicle_id } = req.body;

    if (!vehicle_id) {
      return res.status(400).json({ error: 'vehicle_id is required.' });
    }

    // Fetch vehicle data
    const vehicleResult = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicle_id]);
    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }
    const vehicle = vehicleResult.rows[0];

    // Fetch maintenance history
    const maintenanceResult = await pool.query(
      'SELECT * FROM maintenance_records WHERE vehicle_id = $1 ORDER BY scheduled_date DESC LIMIT 20',
      [vehicle_id]
    );

    // Fetch downtime history
    const downtimeResult = await pool.query(
      'SELECT * FROM downtime_records WHERE vehicle_id = $1 ORDER BY start_date DESC LIMIT 10',
      [vehicle_id]
    );

    // Fetch scheduled maintenance
    const scheduleResult = await pool.query(
      'SELECT * FROM maintenance_schedule WHERE vehicle_id = $1 ORDER BY next_due ASC',
      [vehicle_id]
    );

    const prompt = `Analyze the following vehicle data and provide predictive maintenance recommendations:

## Vehicle Information
- Vehicle ID: ${vehicle.vehicle_id}
- Type: ${vehicle.type}
- Make/Model: ${vehicle.make} ${vehicle.model} (${vehicle.year})
- Current Mileage: ${vehicle.mileage.toLocaleString()} miles
- Status: ${vehicle.status}
- Fuel Type: ${vehicle.fuel_type}
- Last Service: ${vehicle.last_service_date || 'N/A'}
- Next Service Due: ${vehicle.next_service_date || 'N/A'}

## Maintenance History (${maintenanceResult.rows.length} records)
${maintenanceResult.rows.map(r => `- ${r.scheduled_date}: ${r.type} - ${r.description} (Status: ${r.status}, Cost: $${r.cost})`).join('\n')}

## Downtime History (${downtimeResult.rows.length} records)
${downtimeResult.rows.map(r => `- ${r.start_date}: ${r.reason} (Impact: ${r.impact}, Duration: ${r.duration_hours || 'ongoing'} hrs, Preventable: ${r.preventable})`).join('\n')}

## Upcoming Scheduled Maintenance
${scheduleResult.rows.map(r => `- ${r.next_due}: ${r.service_type} (Priority: ${r.priority}, Status: ${r.status}, Est. Cost: $${r.estimated_cost})`).join('\n')}

Based on this data, please provide:
1. Predicted upcoming failures or issues based on patterns
2. Recommended preventive actions with priority levels
3. Estimated costs and timeframes
4. Risk assessment for the next 90 days
5. Optimization suggestions to reduce downtime`;

    const analysis = await callOpenRouter(prompt);

    res.json({
      analysis,
      data: {
        vehicle: {
          id: vehicle.vehicle_id,
          make_model: `${vehicle.make} ${vehicle.model}`,
          mileage: vehicle.mileage,
          status: vehicle.status
        },
        maintenance_count: maintenanceResult.rows.length,
        downtime_count: downtimeResult.rows.length,
        scheduled_items: scheduleResult.rows.length
      }
    });
  } catch (err) {
    console.error('Predictive maintenance AI error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate predictive maintenance analysis.' });
  }
});

// POST /api/ai/fleet-analytics
router.post('/fleet-analytics', async (req, res) => {
  try {
    // Fetch fleet-wide data
    const [vehicleStats, costData, downtimeData, maintenanceData] = await Promise.all([
      pool.query(`
        SELECT type, status, COUNT(*) as count, AVG(mileage) as avg_mileage
        FROM vehicles GROUP BY type, status ORDER BY type
      `),
      pool.query(`
        SELECT category, SUM(amount) as total, COUNT(*) as count
        FROM cost_records
        WHERE date >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY category ORDER BY total DESC
      `),
      pool.query(`
        SELECT category, COUNT(*) as incidents, SUM(duration_hours) as total_hours,
          SUM(cost_impact) as total_cost, COUNT(*) FILTER (WHERE preventable = true) as preventable_count
        FROM downtime_records
        WHERE start_date >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY category ORDER BY total_hours DESC NULLS LAST
      `),
      pool.query(`
        SELECT type, status, COUNT(*) as count, SUM(cost) as total_cost
        FROM maintenance_records
        WHERE scheduled_date >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY type, status ORDER BY count DESC
      `)
    ]);

    const prompt = `Analyze the following fleet-wide data and provide optimization recommendations:

## Fleet Composition & Status
${vehicleStats.rows.map(r => `- ${r.type} (${r.status}): ${r.count} vehicles, Avg Mileage: ${Math.round(r.avg_mileage).toLocaleString()} miles`).join('\n')}

## Cost Breakdown (Last 90 Days)
${costData.rows.map(r => `- ${r.category}: $${parseFloat(r.total).toLocaleString()} (${r.count} transactions)`).join('\n')}

## Downtime Analysis (Last 90 Days)
${downtimeData.rows.map(r => `- ${r.category || 'uncategorized'}: ${r.incidents} incidents, ${r.total_hours || 0} total hours, $${parseFloat(r.total_cost || 0).toLocaleString()} cost, ${r.preventable_count} preventable`).join('\n')}

## Maintenance Summary (Last 90 Days)
${maintenanceData.rows.map(r => `- ${r.type} (${r.status}): ${r.count} records, Total Cost: $${parseFloat(r.total_cost || 0).toLocaleString()}`).join('\n')}

Please provide:
1. Fleet health overview and key performance indicators
2. Cost optimization opportunities
3. Downtime reduction strategies
4. Maintenance schedule optimization recommendations
5. Fleet composition analysis and recommendations
6. 90-day action plan with prioritized items`;

    const analysis = await callOpenRouter(prompt);

    res.json({
      analysis,
      data: {
        vehicle_stats: vehicleStats.rows,
        cost_summary: costData.rows,
        downtime_summary: downtimeData.rows,
        maintenance_summary: maintenanceData.rows
      }
    });
  } catch (err) {
    console.error('Fleet analytics AI error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate fleet analytics.' });
  }
});

// POST /api/ai/route-optimization
router.post('/route-optimization', async (req, res) => {
  try {
    const { vehicle_id, origin, destination, cargo_type } = req.body;

    if (!vehicle_id) {
      return res.status(400).json({ error: 'vehicle_id is required.' });
    }

    const vehicleResult = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicle_id]);
    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }
    const vehicle = vehicleResult.rows[0];

    // Fetch recent fuel records for this vehicle
    const fuelResult = await pool.query(
      'SELECT * FROM fuel_records WHERE vehicle_id = $1 ORDER BY date DESC LIMIT 10',
      [vehicle_id]
    );

    const avgMpg = fuelResult.rows.length > 0
      ? (fuelResult.rows.reduce((sum, r) => sum + parseFloat(r.mpg || 0), 0) / fuelResult.rows.filter(r => r.mpg).length).toFixed(1)
      : 'N/A';

    const prompt = `Provide route optimization suggestions for the following fleet vehicle trip:

## Vehicle
- ID: ${vehicle.vehicle_id}
- Type: ${vehicle.type}
- Make/Model: ${vehicle.make} ${vehicle.model} (${vehicle.year})
- Current Mileage: ${vehicle.mileage.toLocaleString()} miles
- Fuel Type: ${vehicle.fuel_type}
- Average MPG: ${avgMpg}

## Trip Details
- Origin: ${origin || 'Not specified'}
- Destination: ${destination || 'Not specified'}
- Cargo Type: ${cargo_type || 'General freight'}

## Recent Fuel History
${fuelResult.rows.slice(0, 5).map(r => `- ${r.date}: ${r.gallons} gal at ${r.station}, ${r.city} ${r.state} ($${r.cost_per_gallon}/gal, ${r.mpg} MPG)`).join('\n')}

Please provide:
1. Recommended route considerations (major highways, avoid areas)
2. Fuel stop optimization suggestions
3. Estimated fuel cost for the trip
4. Rest stop and HOS compliance recommendations
5. Weather and seasonal considerations
6. Maintenance checks to perform before departure
7. Cost-saving tips for this specific trip`;

    const analysis = await callOpenRouter(prompt);

    res.json({
      analysis,
      data: {
        vehicle: {
          id: vehicle.vehicle_id,
          make_model: `${vehicle.make} ${vehicle.model}`,
          fuel_type: vehicle.fuel_type,
          avg_mpg: avgMpg
        },
        origin,
        destination,
        cargo_type
      }
    });
  } catch (err) {
    console.error('Route optimization AI error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate route optimization.' });
  }
});

// POST /api/ai/compliance-check
router.post('/compliance-check', async (req, res) => {
  try {
    const { vehicle_id } = req.body;

    if (!vehicle_id) {
      return res.status(400).json({ error: 'vehicle_id is required.' });
    }

    const vehicleResult = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicle_id]);
    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }
    const vehicle = vehicleResult.rows[0];

    // Fetch compliance records
    const complianceResult = await pool.query(
      'SELECT * FROM compliance_records WHERE vehicle_id = $1 ORDER BY expiry_date ASC',
      [vehicle_id]
    );

    // Fetch maintenance records
    const maintenanceResult = await pool.query(
      'SELECT * FROM maintenance_records WHERE vehicle_id = $1 ORDER BY scheduled_date DESC LIMIT 10',
      [vehicle_id]
    );

    const prompt = `Perform a comprehensive DOT/FMCSA compliance risk analysis for the following vehicle:

## Vehicle Information
- Vehicle ID: ${vehicle.vehicle_id}
- Type: ${vehicle.type}
- Make/Model: ${vehicle.make} ${vehicle.model} (${vehicle.year})
- VIN: ${vehicle.vin}
- License Plate: ${vehicle.license_plate}
- Current Mileage: ${vehicle.mileage.toLocaleString()} miles
- Status: ${vehicle.status}

## Compliance Records
${complianceResult.rows.map(r => `- ${r.inspection_type} (${r.status}): Inspected ${r.inspection_date}, Expires ${r.expiry_date}
  Inspector: ${r.inspector_name} (${r.inspector_license})
  Findings: ${r.findings || 'None'}
  Corrective Actions: ${r.corrective_actions || 'None'}
  DOT#: ${r.dot_number || 'N/A'}`).join('\n\n')}

## Recent Maintenance
${maintenanceResult.rows.map(r => `- ${r.scheduled_date}: ${r.type} - ${r.description} (${r.status})`).join('\n')}

Please provide:
1. Overall compliance risk score (1-10) with explanation
2. Immediate compliance concerns requiring action
3. Upcoming inspection/certification deadlines
4. FMCSA/DOT regulation compliance gaps
5. Recommended corrective actions with timeline
6. Documentation requirements and record-keeping improvements
7. Estimated penalties/fines risk if issues are not addressed`;

    const analysis = await callOpenRouter(prompt);

    res.json({
      analysis,
      data: {
        vehicle: {
          id: vehicle.vehicle_id,
          make_model: `${vehicle.make} ${vehicle.model}`,
          type: vehicle.type,
          status: vehicle.status
        },
        compliance_records: complianceResult.rows.length,
        expired: complianceResult.rows.filter(r => r.status === 'expired').length,
        expiring_soon: complianceResult.rows.filter(r => r.status === 'expiring_soon').length
      }
    });
  } catch (err) {
    console.error('Compliance check AI error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate compliance analysis.' });
  }
});

// POST /api/ai/cost-analysis
router.post('/cost-analysis', async (req, res) => {
  try {
    // Fetch cost data
    const [costByCategory, costByVehicle, costTrend, topExpenses] = await Promise.all([
      pool.query(`
        SELECT category, SUM(amount) as total, COUNT(*) as count,
          AVG(amount) as avg_amount
        FROM cost_records
        GROUP BY category ORDER BY total DESC
      `),
      pool.query(`
        SELECT v.vehicle_id, v.make, v.model, v.type,
          SUM(cr.amount) as total_cost, COUNT(cr.id) as record_count
        FROM cost_records cr
        JOIN vehicles v ON cr.vehicle_id = v.id
        GROUP BY v.vehicle_id, v.make, v.model, v.type
        ORDER BY total_cost DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT date_trunc('month', date) as month,
          SUM(amount) as monthly_total, COUNT(*) as count
        FROM cost_records
        GROUP BY date_trunc('month', date)
        ORDER BY month DESC
        LIMIT 6
      `),
      pool.query(`
        SELECT cr.*, v.vehicle_id AS vehicle_code, v.make, v.model
        FROM cost_records cr
        LEFT JOIN vehicles v ON cr.vehicle_id = v.id
        ORDER BY cr.amount DESC
        LIMIT 10
      `)
    ]);

    const prompt = `Analyze the following fleet cost data and provide cost optimization recommendations:

## Cost by Category
${costByCategory.rows.map(r => `- ${r.category}: $${parseFloat(r.total).toLocaleString()} total (${r.count} records, $${parseFloat(r.avg_amount).toFixed(2)} avg)`).join('\n')}

## Cost by Vehicle (Top 10)
${costByVehicle.rows.map(r => `- ${r.vehicle_id} (${r.make} ${r.model}, ${r.type}): $${parseFloat(r.total_cost).toLocaleString()} (${r.record_count} records)`).join('\n')}

## Monthly Cost Trend
${costTrend.rows.map(r => `- ${new Date(r.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}: $${parseFloat(r.monthly_total).toLocaleString()} (${r.count} transactions)`).join('\n')}

## Top 10 Individual Expenses
${topExpenses.rows.map(r => `- $${parseFloat(r.amount).toLocaleString()}: ${r.description} (${r.category}) - ${r.vehicle_code || 'Fleet-wide'} on ${r.date}`).join('\n')}

Please provide:
1. Overall cost health assessment
2. Highest cost drivers and root causes
3. Cost reduction opportunities with estimated savings
4. Vehicle-specific cost concerns (any vehicles costing disproportionately more?)
5. Budget recommendations for next quarter
6. Vendor/supplier optimization suggestions
7. Preventive vs. corrective maintenance cost ratio analysis`;

    const analysis = await callOpenRouter(prompt);

    res.json({
      analysis,
      data: {
        cost_by_category: costByCategory.rows,
        cost_by_vehicle: costByVehicle.rows,
        monthly_trend: costTrend.rows,
        top_expenses: topExpenses.rows
      }
    });
  } catch (err) {
    console.error('Cost analysis AI error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate cost analysis.' });
  }
});

// POST /api/ai/driver-performance
router.post('/driver-performance', async (req, res) => {
  try {
    const { driver_id } = req.body;

    if (!driver_id) {
      return res.status(400).json({ error: 'driver_id is required.' });
    }

    const driverResult = await pool.query('SELECT * FROM drivers WHERE id = $1', [driver_id]);
    if (driverResult.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found.' });
    }
    const driver = driverResult.rows[0];

    // Fetch assignments
    const assignmentResult = await pool.query(
      `SELECT da.*, v.vehicle_id AS vehicle_code, v.make, v.model
       FROM driver_assignments da
       LEFT JOIN vehicles v ON da.vehicle_id = v.id
       WHERE da.driver_id = $1
       ORDER BY da.start_date DESC`,
      [driver_id]
    );

    // Fetch fuel records
    const fuelResult = await pool.query(
      'SELECT * FROM fuel_records WHERE driver_id = $1 ORDER BY date DESC LIMIT 20',
      [driver_id]
    );

    const avgMpg = fuelResult.rows.length > 0
      ? (fuelResult.rows.reduce((sum, r) => sum + parseFloat(r.mpg || 0), 0) / fuelResult.rows.filter(r => r.mpg).length).toFixed(1)
      : 'N/A';

    const totalFuelCost = fuelResult.rows.reduce((sum, r) => sum + parseFloat(r.total_cost || 0), 0);

    const prompt = `Analyze the following driver performance data and provide recommendations:

## Driver Information
- Name: ${driver.first_name} ${driver.last_name}
- Employee ID: ${driver.employee_id}
- License: ${driver.license_type} (${driver.license_number}), Expires: ${driver.license_expiry}
- Status: ${driver.status}
- Hire Date: ${driver.hire_date || 'N/A'}
- Medical Card Expiry: ${driver.medical_card_expiry || 'N/A'}
- Violations: ${driver.violations}
- Current Rating: ${driver.rating}/5.00

## Vehicle Assignments (${assignmentResult.rows.length} total)
${assignmentResult.rows.map(r => `- ${r.vehicle_code} (${r.make} ${r.model}): ${r.route || 'No route'} | Shift: ${r.shift} | Status: ${r.status} | ${r.start_date} to ${r.end_date || 'Present'}`).join('\n')}

## Fuel Efficiency (${fuelResult.rows.length} recent records)
- Average MPG: ${avgMpg}
- Total Fuel Cost: $${totalFuelCost.toFixed(2)}
${fuelResult.rows.slice(0, 10).map(r => `- ${r.date}: ${r.gallons} gal, ${r.mpg || 'N/A'} MPG, $${r.total_cost} at ${r.station}`).join('\n')}

Please provide:
1. Overall driver performance score and assessment
2. Fuel efficiency analysis and comparison to fleet averages
3. Safety and compliance status
4. Areas for improvement
5. Training recommendations
6. Recognition/commendation areas
7. License and certification management recommendations`;

    const analysis = await callOpenRouter(prompt);

    res.json({
      analysis,
      data: {
        driver: {
          name: `${driver.first_name} ${driver.last_name}`,
          employee_id: driver.employee_id,
          rating: driver.rating,
          violations: driver.violations,
          status: driver.status
        },
        assignments: assignmentResult.rows.length,
        avg_mpg: avgMpg,
        total_fuel_cost: totalFuelCost.toFixed(2)
      }
    });
  } catch (err) {
    console.error('Driver performance AI error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate driver performance analysis.' });
  }
});

module.exports = router;
