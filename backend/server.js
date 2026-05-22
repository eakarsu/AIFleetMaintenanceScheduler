require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const initializeDb = require('./db/initializeDb');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS — use CORS_ORIGIN env var (comma-separated) so prod origin can be injected
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:3500'];

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));

// Rate limiter for AI endpoints: 20 requests per 15 minutes per IP
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests. Please wait 15 minutes before retrying.' }
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/compliance', require('./routes/compliance'));
app.use('/api/parts', require('./routes/parts'));
app.use('/api/parts-inventory', require('./routes/parts'));
app.use('/api/workorders', require('./routes/workorders'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/fuel', require('./routes/fuel'));
app.use('/api/downtime', require('./routes/downtime'));
app.use('/api/scheduling', require('./routes/scheduling'));
app.use('/api/costs', require('./routes/costs'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/ai', aiRateLimiter, require('./routes/ai'));
app.use('/api/tires', require('./routes/tires'));
app.use('/api/inspections', require('./routes/inspections'));
app.use('/api/warranties', require('./routes/warranties'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/fleet-overview', require('./routes/fleet-overview'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/activity-log', require('./routes/activity-log'));
app.use('/api/integrations', require('./routes/integrations'));
app.use('/api/agentic-maintenance-coordinator', require('./routes/agenticMaintenanceCoordinator'));
app.use('/api/predictive-maintenance', require('./routes/predictiveMaintenance'));
app.use('/api/auto-work-orders', require('./routes/autoWorkOrders'));
app.use('/api/driver-behavior-analytics', require('./routes/driverBehaviorAnalytics'));
app.use('/api/warranty-management', require('./routes/warrantyManagement'));
app.use('/api/parts-availability', require('./routes/partsAvailability'));
app.use('/api/technician-utilization', require('./routes/technicianUtilization'));
app.use('/api/tire-rotation-compliance', require('./routes/tireRotationCompliance'));
app.use('/api/custom-views', require('./routes/customViews'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize DB tables before accepting connections
initializeDb().then(() => {
  
// === Batch 03 Gaps & Frontend Mounts ===
try {
  const _batch03 = require('./routes/batch03Gaps');
  if (typeof authenticateToken === 'function') app.use('/api', authenticateToken, _batch03);
  else app.use('/api', _batch03);
} catch (_e) { /* batch03 gap routes optional */ }

app.listen(PORT, () => {
    console.log(`Fleet Maintenance API server running on port ${PORT}`);
    console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
  });
});

module.exports = app;
