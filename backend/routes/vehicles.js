const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
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

// Reusable vehicle body validators
const vehicleBodyValidators = [
  body('vehicle_id').notEmpty().withMessage('vehicle_id is required').isString().trim(),
  body('type').notEmpty().withMessage('type is required').isString().trim(),
  body('make').notEmpty().withMessage('make is required').isString().trim(),
  body('model').notEmpty().withMessage('model is required').isString().trim(),
  body('year').notEmpty().withMessage('year is required').isInt({ min: 1900, max: 2100 }).withMessage('year must be a valid integer'),
  body('vin').notEmpty().withMessage('vin is required').isLength({ min: 17, max: 17 }).withMessage('VIN must be exactly 17 characters'),
  body('license_plate').notEmpty().withMessage('license_plate is required').isString().trim(),
  body('mileage').optional().isInt({ min: 0 }).withMessage('mileage must be a non-negative integer'),
  body('status').optional().isIn(['active', 'maintenance', 'inactive', 'retired']).withMessage('status must be one of: active, maintenance, inactive, retired'),
  body('fuel_type').optional().isIn(['diesel', 'gasoline', 'electric', 'hybrid', 'cng', 'lpg']).withMessage('invalid fuel_type')
];

// GET /api/vehicles/stats/summary
router.get('/stats/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'active') AS active,
        COUNT(*) FILTER (WHERE status = 'maintenance') AS maintenance,
        COUNT(*) FILTER (WHERE status = 'inactive') AS inactive
      FROM vehicles
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Vehicle stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/vehicles
router.get('/', async (req, res) => {
  try {
    const { status, type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (type) {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM vehicles${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const dataParams = [...params, limit, offset];
    const result = await pool.query(
      `SELECT * FROM vehicles${whereClause} ORDER BY vehicle_id ASC LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams
    );

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('List vehicles error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/vehicles/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get vehicle error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/vehicles/:id/maintenance-history
// Returns all past AI predictions (from ai_predictions) and actual maintenance records
// for a given vehicle, sorted newest first.
router.get('/:id/maintenance-history', async (req, res) => {
  try {
    const vehicleId = req.params.id;

    // Verify vehicle exists
    const vehicleResult = await pool.query('SELECT id, vehicle_id, make, model, year FROM vehicles WHERE id = $1', [vehicleId]);
    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }
    const vehicle = vehicleResult.rows[0];

    // Fetch actual maintenance records
    const maintenanceResult = await pool.query(
      `SELECT id, type, description, status, priority, scheduled_date, completed_date,
              cost, technician, notes, created_at
       FROM maintenance_records
       WHERE vehicle_id = $1
       ORDER BY COALESCE(scheduled_date, created_at::date) DESC, created_at DESC`,
      [vehicleId]
    );

    // Fetch AI predictions linked to this vehicle
    const predictionsResult = await pool.query(
      `SELECT id, prediction_type, input_snapshot, analysis, created_at
       FROM ai_predictions
       WHERE vehicle_id = $1
       ORDER BY created_at DESC`,
      [vehicleId]
    );

    res.json({
      vehicle: {
        id: vehicle.id,
        vehicle_id: vehicle.vehicle_id,
        make_model: `${vehicle.make} ${vehicle.model} (${vehicle.year})`
      },
      maintenance_records: {
        total: maintenanceResult.rows.length,
        records: maintenanceResult.rows
      },
      ai_predictions: {
        total: predictionsResult.rows.length,
        records: predictionsResult.rows.map(r => ({
          id: r.id,
          prediction_type: r.prediction_type,
          input_snapshot: r.input_snapshot,
          analysis: r.analysis,
          created_at: r.created_at
        }))
      }
    });
  } catch (err) {
    console.error('Maintenance history error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/vehicles
router.post('/', vehicleBodyValidators, async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const {
      vehicle_id, type, make, model, year, vin, license_plate,
      mileage, status, fuel_type, last_service_date, next_service_date, assigned_driver_id
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vehicles (vehicle_id, type, make, model, year, vin, license_plate, mileage, status, fuel_type, last_service_date, next_service_date, assigned_driver_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [vehicle_id, type, make, model, year, vin, license_plate, mileage || 0, status || 'active', fuel_type || 'diesel', last_service_date, next_service_date, assigned_driver_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create vehicle error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Vehicle with this ID or VIN already exists.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/vehicles/:id
router.put('/:id', vehicleBodyValidators.map(v => v.optional()), async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const {
      vehicle_id, type, make, model, year, vin, license_plate,
      mileage, status, fuel_type, last_service_date, next_service_date, assigned_driver_id
    } = req.body;

    const result = await pool.query(
      `UPDATE vehicles SET
        vehicle_id = COALESCE($1, vehicle_id),
        type = COALESCE($2, type),
        make = COALESCE($3, make),
        model = COALESCE($4, model),
        year = COALESCE($5, year),
        vin = COALESCE($6, vin),
        license_plate = COALESCE($7, license_plate),
        mileage = COALESCE($8, mileage),
        status = COALESCE($9, status),
        fuel_type = COALESCE($10, fuel_type),
        last_service_date = COALESCE($11, last_service_date),
        next_service_date = COALESCE($12, next_service_date),
        assigned_driver_id = $13
       WHERE id = $14
       RETURNING *`,
      [vehicle_id, type, make, model, year, vin, license_plate, mileage, status, fuel_type, last_service_date, next_service_date, assigned_driver_id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update vehicle error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Vehicle with this ID or VIN already exists.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/vehicles/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    res.json({ message: 'Vehicle deleted successfully.', vehicle: result.rows[0] });
  } catch (err) {
    console.error('Delete vehicle error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
