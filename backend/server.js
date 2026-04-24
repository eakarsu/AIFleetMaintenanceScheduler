require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
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
app.use('/api/workorders', require('./routes/workorders'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/fuel', require('./routes/fuel'));
app.use('/api/downtime', require('./routes/downtime'));
app.use('/api/scheduling', require('./routes/scheduling'));
app.use('/api/costs', require('./routes/costs'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/ai', require('./routes/ai'));
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

app.listen(PORT, () => {
  console.log(`Fleet Maintenance API server running on port ${PORT}`);
  console.log(`CORS enabled for http://localhost:3000`);
});

module.exports = app;
