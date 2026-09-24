const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/auth.routes');
const submissionsRoutes = require('./routes/submissions.routes');
const schemesRoutes = require('./routes/schemes.routes');
const grievancesRoutes = require('./routes/grievances.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-UUID']
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'OfflineBridge API Server',
    time: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/grievances', grievancesRoutes);

// Helper route alias for service forms schemas
app.get('/api/forms', (req, res, next) => {
  req.url = '/forms/all';
  schemesRoutes(req, res, next);
});
app.get('/api/forms/:type', (req, res, next) => {
  req.url = `/forms/${req.params.type}`;
  schemesRoutes(req, res, next);
});

// Centralized Error Handling
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  OfflineBridge API Server running on port ${PORT}`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

module.exports = { app, server };
