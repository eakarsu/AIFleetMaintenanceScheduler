const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const fetch = require('node-fetch');
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// Helper: send 400 if express-validator found errors
function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
}

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

// Helper: parse JSON from AI response (strips markdown fences, finds JSON object)
function parseAIJson(text) {
  try { return JSON.parse(text); } catch (e) {}
  const stripped = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  try { return JSON.parse(stripped); } catch (e) {}
  const start = text.indexOf('{'); const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) { try { return JSON.parse(text.slice(start, end + 1)); } catch (e) {} }
  return null;
}

// Helper: persist result to ai_results table
async function persistAIResult({ userId, vehicleId, driverId, endpoint, inputData, result }) {
  try {
    await pool.query(
      `INSERT INTO ai_results (user_id, vehicle_id, driver_id, endpoint, input_data, result, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [userId || null, vehicleId || null, driverId || null, endpoint, JSON.stringify(inputData), result]
    );
  } catch (err) {
    console.error('[AI] Failed to persist ai_result:', err.message);
  }
}

// Helper: persist AI prediction result to DB
async function persistPrediction({ type, vehicleId, driverId, inputSnapshot, analysis, userId }) {
  try {
    const result = await pool.query(
      `INSERT INTO ai_predictions (prediction_type, vehicle_id, driver_id, input_snapshot, analysis, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id`,
      [type, vehicleId || null, driverId || null, JSON.stringify(inputSnapshot), analysis, userId || null]
    );
    return result.rows[0].id;
  } catch (err) {
    console.error('[AI] Failed to persist prediction:', err.message);
    return null;
  }
}

// POST /api/ai/predictive-maintenance
router.post(
  '/predictive-maintenance',
  [body('vehicle_id').notEmpty().withMessage('vehicle_id is required').isInt({ min: 1 }).withMessage('vehicle_id must be a positive integer')],
  async (req, res) => {
    if (handleValidation(req, res)) return;
    try {
      const { vehicle_id } = req.body;

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

      // Persist prediction to DB
      const predictionId = await persistPrediction({
        type: 'predictive-maintenance',
        vehicleId: vehicle_id,
        inputSnapshot: {
          vehicle_id: vehicle.vehicle_id,
          mileage: vehicle.mileage,
          maintenance_records: maintenanceResult.rows.length,
          downtime_records: downtimeResult.rows.length
        },
        analysis,
        userId: req.user?.id
      });

      await persistAIResult({
        userId: req.user?.id, vehicleId: vehicle_id, endpoint: 'predictive-maintenance',
        inputData: { vehicle_id: vehicle.vehicle_id, mileage: vehicle.mileage }, result: analysis
      });

      res.json({
        analysis,
        prediction_id: predictionId,
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
  }
);

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

    // Persist fleet-wide prediction (no specific vehicle)
    await persistPrediction({
      type: 'fleet-analytics',
      inputSnapshot: {
        vehicle_count: vehicleStats.rows.reduce((s, r) => s + parseInt(r.count), 0),
        cost_categories: costData.rows.length,
        downtime_categories: downtimeData.rows.length
      },
      analysis,
      userId: req.user?.id
    });

    await persistAIResult({
      userId: req.user?.id, endpoint: 'fleet-analytics',
      inputData: { vehicle_count: vehicleStats.rows.reduce((s, r) => s + parseInt(r.count), 0) }, result: analysis
    });

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
router.post(
  '/route-optimization',
  [
    body('vehicle_id').notEmpty().withMessage('vehicle_id is required').isInt({ min: 1 }),
    body('origin').optional().isString().trim(),
    body('destination').optional().isString().trim(),
    body('cargo_type').optional().isString().trim()
  ],
  async (req, res) => {
    if (handleValidation(req, res)) return;
    try {
      const { vehicle_id, origin, destination, cargo_type } = req.body;

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

      await persistPrediction({
        type: 'route-optimization',
        vehicleId: vehicle_id,
        inputSnapshot: { vehicle_id: vehicle.vehicle_id, origin, destination, cargo_type, avg_mpg: avgMpg },
        analysis,
        userId: req.user?.id
      });

      await persistAIResult({
        userId: req.user?.id, vehicleId: vehicle_id, endpoint: 'route-optimization',
        inputData: { vehicle_id: vehicle.vehicle_id, origin, destination, cargo_type }, result: analysis
      });

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
  }
);

// POST /api/ai/compliance-check
router.post(
  '/compliance-check',
  [body('vehicle_id').notEmpty().withMessage('vehicle_id is required').isInt({ min: 1 })],
  async (req, res) => {
    if (handleValidation(req, res)) return;
    try {
      const { vehicle_id } = req.body;

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

      await persistPrediction({
        type: 'compliance-check',
        vehicleId: vehicle_id,
        inputSnapshot: {
          vehicle_id: vehicle.vehicle_id,
          compliance_records: complianceResult.rows.length,
          expired: complianceResult.rows.filter(r => r.status === 'expired').length
        },
        analysis,
        userId: req.user?.id
      });

      await persistAIResult({
        userId: req.user?.id, vehicleId: vehicle_id, endpoint: 'compliance-check',
        inputData: { vehicle_id: vehicle.vehicle_id, compliance_records: complianceResult.rows.length }, result: analysis
      });

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
  }
);

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

    await persistPrediction({
      type: 'cost-analysis',
      inputSnapshot: {
        categories: costByCategory.rows.length,
        vehicles_with_costs: costByVehicle.rows.length
      },
      analysis,
      userId: req.user?.id
    });

    await persistAIResult({
      userId: req.user?.id, endpoint: 'cost-analysis',
      inputData: { categories: costByCategory.rows.length, vehicles_with_costs: costByVehicle.rows.length }, result: analysis
    });

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
router.post(
  '/driver-performance',
  [body('driver_id').notEmpty().withMessage('driver_id is required').isInt({ min: 1 })],
  async (req, res) => {
    if (handleValidation(req, res)) return;
    try {
      const { driver_id } = req.body;

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

      await persistPrediction({
        type: 'driver-performance',
        driverId: driver_id,
        inputSnapshot: {
          driver_id: driver.employee_id,
          violations: driver.violations,
          rating: driver.rating,
          avg_mpg: avgMpg
        },
        analysis,
        userId: req.user?.id
      });

      await persistAIResult({
        userId: req.user?.id, driverId: driver_id, endpoint: 'driver-performance',
        inputData: { driver_id: driver.employee_id, violations: driver.violations, rating: driver.rating }, result: analysis
      });

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
  }
);

// POST /api/ai/fleet-replacement-score
router.post(
  '/fleet-replacement-score',
  [body('vehicle_id').notEmpty().withMessage('vehicle_id is required').isInt({ min: 1 })],
  async (req, res) => {
    if (handleValidation(req, res)) return;
    try {
      const { vehicle_id } = req.body;

      const vehicleResult = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicle_id]);
      if (vehicleResult.rows.length === 0) {
        return res.status(404).json({ error: 'Vehicle not found.' });
      }
      const vehicle = vehicleResult.rows[0];

      // Maintenance cost last 12 months
      const maintenanceCostResult = await pool.query(
        `SELECT COALESCE(SUM(cost), 0) AS total_cost, COUNT(*) AS record_count
         FROM maintenance_records
         WHERE vehicle_id = $1 AND scheduled_date >= CURRENT_DATE - INTERVAL '12 months'`,
        [vehicle_id]
      );

      // Downtime records
      const downtimeResult = await pool.query(
        `SELECT COUNT(*) AS incident_count, COALESCE(SUM(duration_hours), 0) AS total_hours
         FROM downtime_records
         WHERE vehicle_id = $1 AND start_date >= CURRENT_DATE - INTERVAL '12 months'`,
        [vehicle_id]
      );

      // Fuel records for avg MPG
      const fuelResult = await pool.query(
        `SELECT AVG(mpg) AS avg_mpg
         FROM fuel_records
         WHERE vehicle_id = $1 AND mpg IS NOT NULL AND date >= CURRENT_DATE - INTERVAL '12 months'`,
        [vehicle_id]
      );

      const maintenanceCost = maintenanceCostResult.rows[0];
      const downtime = downtimeResult.rows[0];
      const avgMpg = fuelResult.rows[0]?.avg_mpg ? parseFloat(fuelResult.rows[0].avg_mpg).toFixed(1) : 'N/A';

      const prompt = `You are a fleet operations expert. Analyze the following vehicle data and provide a fleet replacement assessment:

## Vehicle Information
- Make/Model: ${vehicle.make} ${vehicle.model} (${vehicle.year})
- Current Mileage: ${vehicle.mileage.toLocaleString()} miles
- Status: ${vehicle.status}
- Fuel Type: ${vehicle.fuel_type}

## Last 12 Months Performance
- Total Maintenance Cost: $${parseFloat(maintenanceCost.total_cost).toLocaleString()}
- Maintenance Incidents: ${maintenanceCost.record_count}
- Downtime Incidents: ${downtime.incident_count}
- Total Downtime Hours: ${parseFloat(downtime.total_hours).toFixed(1)}
- Average Fuel Economy: ${avgMpg} MPG

Given this vehicle's history, provide:
1. Replacement priority score (1-100, where 100 = replace immediately)
2. Cost-benefit analysis of repair vs replace
3. Recommended replacement timeline
4. Suggested replacement vehicle specs`;

      const analysis = await callOpenRouter(prompt);

      await persistPrediction({
        type: 'fleet-replacement-score',
        vehicleId: vehicle_id,
        inputSnapshot: {
          vehicle_id: vehicle.vehicle_id,
          mileage: vehicle.mileage,
          year: vehicle.year,
          maintenance_cost_12m: maintenanceCost.total_cost,
          downtime_incidents: downtime.incident_count,
          avg_mpg: avgMpg
        },
        analysis,
        userId: req.user?.id
      });

      await persistAIResult({
        userId: req.user?.id, vehicleId: vehicle_id, endpoint: 'fleet-replacement-score',
        inputData: { vehicle_id: vehicle.vehicle_id, mileage: vehicle.mileage, year: vehicle.year }, result: analysis
      });

      res.json({
        analysis,
        data: {
          vehicle: {
            id: vehicle.vehicle_id,
            make_model: `${vehicle.make} ${vehicle.model}`,
            year: vehicle.year,
            mileage: vehicle.mileage,
            status: vehicle.status
          },
          maintenance_cost_12m: parseFloat(maintenanceCost.total_cost),
          maintenance_incidents: parseInt(maintenanceCost.record_count),
          downtime_incidents: parseInt(downtime.incident_count),
          downtime_hours: parseFloat(downtime.total_hours),
          avg_mpg: avgMpg
        }
      });
    } catch (err) {
      console.error('Fleet replacement score AI error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate fleet replacement score.' });
    }
  }
);

// POST /api/ai/parts-order-predict — forecast parts demand and recommend orders
router.post('/parts-order-predict', async (req, res) => {
  try {
    const { lookback_days = 90, top_n = 20 } = req.body || {};

    const partsUsage = await pool.query(
      `SELECT p.id, p.name, p.sku, p.stock_qty, p.reorder_point, p.unit_cost,
              COUNT(wo.id) AS work_orders_used,
              COALESCE(SUM(wop.quantity), 0) AS qty_used
       FROM parts p
       LEFT JOIN work_order_parts wop ON wop.part_id = p.id
       LEFT JOIN workorders wo ON wo.id = wop.work_order_id AND wo.completed_at >= CURRENT_DATE - ($1::int * INTERVAL '1 day')
       GROUP BY p.id
       ORDER BY qty_used DESC
       LIMIT $2`,
      [lookback_days, top_n]
    ).catch(() => ({ rows: [] }));

    const upcomingMaintenance = await pool.query(
      `SELECT COUNT(*) AS cnt
       FROM maintenance_schedule
       WHERE next_due BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'`
    ).catch(() => ({ rows: [{ cnt: 0 }] }));

    const prompt = `You are a fleet parts inventory planner. Predict parts demand and recommend purchase orders.

Lookback window: ${lookback_days} days
Upcoming maintenance jobs (next 60 days): ${upcomingMaintenance.rows[0]?.cnt || 0}
Top parts usage:
${partsUsage.rows.map(r => `- ${r.name} [${r.sku}]: stock ${r.stock_qty}, reorder point ${r.reorder_point}, used ${r.qty_used} in lookback`).join('\n') || '(none)'}

Return STRICT JSON only:
{
  "summary": "...",
  "recommended_orders": [
    { "sku": "string", "name": "string", "qty_to_order": 0, "estimated_cost_usd": 0, "rationale": "...", "lead_time_days": 0 }
  ],
  "stockout_risks": [
    { "sku": "string", "name": "string", "expected_stockout_in_days": 0 }
  ],
  "annual_savings_estimate_usd": 0,
  "disclaimer": "string"
}`;

    const analysis = await callOpenRouter(prompt);
    await persistAIResult({
      userId: req.user?.id,
      endpoint: 'parts-order-predict',
      inputData: { lookback_days, top_n },
      result: analysis,
    });

    res.json({
      analysis,
      data: { parts_evaluated: partsUsage.rows.length, lookback_days },
    });
  } catch (err) {
    console.error('Parts-order-predict AI error:', err);
    res.status(500).json({ error: err.message || 'Failed to predict parts orders.' });
  }
});

// POST /api/ai/technician-assign-optimize — optimal technician/job matching
router.post('/technician-assign-optimize', async (req, res) => {
  try {
    const { workorder_ids = [] } = req.body || {};

    let workorders = { rows: [] };
    if (workorder_ids.length > 0) {
      workorders = await pool.query(
        `SELECT * FROM workorders WHERE id = ANY($1::int[])`,
        [workorder_ids]
      ).catch(() => ({ rows: [] }));
    } else {
      workorders = await pool.query(
        `SELECT * FROM workorders
         WHERE status IN ('open','assigned','in_progress')
         ORDER BY priority DESC, scheduled_for ASC
         LIMIT 50`
      ).catch(() => ({ rows: [] }));
    }

    const techs = await pool.query(
      `SELECT id, first_name, last_name, skills, hourly_rate, availability_status
       FROM technicians
       WHERE active = true
       LIMIT 100`
    ).catch(() => ({ rows: [] }));

    const prompt = `Match technicians to open work orders. Maximize completion speed, balance workload, prefer specialists for complex jobs.

WORK ORDERS (${workorders.rows.length}):
${workorders.rows.map(w => `- WO#${w.id} priority=${w.priority} type=${w.type} estimated_hours=${w.estimated_hours || 'N/A'}`).join('\n') || '(none)'}

TECHNICIANS (${techs.rows.length}):
${techs.rows.map(t => `- T#${t.id} ${t.first_name} ${t.last_name}: skills=${JSON.stringify(t.skills || [])}, rate=$${t.hourly_rate || 'N/A'}, available=${t.availability_status}`).join('\n') || '(none)'}

Return STRICT JSON only:
{
  "summary": "...",
  "assignments": [
    { "workorder_id": 0, "technician_id": 0, "rationale": "...", "estimated_completion_hours": 0 }
  ],
  "unassigned_workorders": [{"workorder_id":0, "reason":"..."}],
  "workload_balance_warnings": ["..."],
  "disclaimer": "string"
}`;

    const analysis = await callOpenRouter(prompt);
    await persistAIResult({
      userId: req.user?.id,
      endpoint: 'technician-assign-optimize',
      inputData: { workorder_count: workorders.rows.length, tech_count: techs.rows.length },
      result: analysis,
    });

    res.json({
      analysis,
      data: { workorders: workorders.rows.length, technicians: techs.rows.length },
    });
  } catch (err) {
    console.error('Technician-assign-optimize AI error:', err);
    res.status(500).json({ error: err.message || 'Failed to optimize technician assignments.' });
  }
});

// POST /api/ai/warranty-claim-assist — analyze warranty + draft claim
router.post('/warranty-claim-assist', async (req, res) => {
  try {
    const { vehicle_id, issue_description, repair_estimate_usd } = req.body || {};
    if (!vehicle_id || !issue_description) {
      return res.status(400).json({ error: 'vehicle_id and issue_description are required' });
    }

    const vehicle = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicle_id]);
    if (vehicle.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });

    const warranty = await pool.query(
      'SELECT * FROM warranties WHERE vehicle_id = $1',
      [vehicle_id]
    ).catch(() => ({ rows: [] }));

    const recentMaintenance = await pool.query(
      `SELECT * FROM maintenance_records WHERE vehicle_id = $1 ORDER BY scheduled_date DESC LIMIT 10`,
      [vehicle_id]
    ).catch(() => ({ rows: [] }));

    const v = vehicle.rows[0];
    const prompt = `You are a warranty claims specialist. Determine if the issue is likely covered, draft a claim narrative, and list supporting documentation.

VEHICLE: ${v.make} ${v.model} ${v.year}, mileage ${v.mileage}, VIN ${v.vin || 'N/A'}
WARRANTIES: ${JSON.stringify(warranty.rows, null, 2)}
ISSUE: ${issue_description}
REPAIR ESTIMATE: $${repair_estimate_usd ?? 'N/A'}
RECENT MAINTENANCE: ${recentMaintenance.rows.map(r => `${r.scheduled_date}: ${r.type} - ${r.description}`).join('; ') || '(none)'}

Return STRICT JSON only:
{
  "coverage_assessment": "covered|partial|likely_denied|unclear",
  "rationale": "...",
  "claim_narrative_draft": "string suitable for submission",
  "supporting_documents": ["..."],
  "expected_recovery_usd": 0,
  "next_steps": ["..."],
  "disclaimer": "string"
}`;

    const analysis = await callOpenRouter(prompt);
    await persistAIResult({
      userId: req.user?.id,
      vehicleId: vehicle_id,
      endpoint: 'warranty-claim-assist',
      inputData: { vehicle_id, repair_estimate_usd },
      result: analysis,
    });

    res.json({
      analysis,
      data: {
        vehicle: { id: v.id, make_model: `${v.make} ${v.model}`, year: v.year, mileage: v.mileage },
        warranty_count: warranty.rows.length,
      },
    });
  } catch (err) {
    console.error('Warranty-claim-assist AI error:', err);
    res.status(500).json({ error: err.message || 'Failed to assist with warranty claim.' });
  }
});

// GET /api/ai/results — paginated AI result history for the current user
router.get('/results', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const userId = req.user?.id || req.user?.userId;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM ai_results WHERE user_id = $1 OR $1 IS NULL',
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT ar.*, v.vehicle_id AS vehicle_code, v.make, v.model,
              d.first_name || ' ' || d.last_name AS driver_name
       FROM ai_results ar
       LEFT JOIN vehicles v ON ar.vehicle_id = v.id
       LEFT JOIN drivers d ON ar.driver_id = d.id
       WHERE ar.user_id = $1 OR $1 IS NULL
       ORDER BY ar.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('AI results error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch AI results.' });
  }
});

// ─── Apply pass 5 ─────────────────────────────────────────────────────────
// PRODUCT-DECISION: Structured JSON variant of /predictive-maintenance.
// Returns canonical JSON instead of free-form markdown so the FE can render
// dashboard widgets directly. Falls back to { raw_response: ... } when the
// model fails to emit JSON.
router.post('/predictive-maintenance-structured', async (req, res) => {
  try {
    const { vehicle_id } = req.body || {};
    if (!vehicle_id) return res.status(400).json({ error: 'vehicle_id required' });
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.includes('your-')) {
      return res.status(503).json({ error: 'AI not configured', missing: 'OPENROUTER_API_KEY' });
    }

    const v = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicle_id]).catch(() => ({ rows: [] }));
    if (v.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    const vehicle = v.rows[0];
    const m = await pool.query('SELECT * FROM maintenance_records WHERE vehicle_id = $1 ORDER BY scheduled_date DESC LIMIT 20', [vehicle_id]).catch(() => ({ rows: [] }));

    const prompt = `Vehicle ${vehicle.make} ${vehicle.model} ${vehicle.year}, mileage ${vehicle.mileage}.
Maintenance records: ${m.rows.length}.
Return strictly JSON with keys:
{ "predicted_failures": [{ "component": "...", "risk": "low|medium|high", "eta_days": <int>, "rationale": "..." }],
  "preventive_actions": [{ "action": "...", "priority": "low|medium|high", "est_cost_usd": <number> }],
  "summary": "..." }`;

    const raw = await callOpenRouter(prompt);
    const parsed = parseAIJson(raw) || { raw_response: raw };

    await persistAIResult({
      userId: req.user?.id, vehicleId: vehicle_id, endpoint: 'predictive-maintenance-structured',
      inputData: { vehicle_id: vehicle.vehicle_id, mileage: vehicle.mileage }, result: JSON.stringify(parsed)
    });

    res.json({ vehicle_id, structured: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Structured prediction failed' });
  }
});

module.exports = router;
