import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import healthRouter from './routes/health.js';
import schemesRouter from './modules/schemes/schemes.routes.js';
import authRouter from './modules/auth/auth.routes.js';
import usersRouter from './modules/users/users.routes.js';
import applicationsRouter from './modules/applications/applications.routes.js';
import grievancesRouter from './modules/grievances/grievances.routes.js';
import syncRouter from './modules/sync/sync.routes.js';
import ragRouter from './modules/rag/rag.routes.js';
import ingestionRouter from './modules/ingestion/ingestion.routes.js';
import auditRouter from './modules/audit/audit.routes.js';
import { setupSwagger } from './config/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// 1. Configure CORS safely
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, mobile clients, tests) where origin is undefined
    if (!origin) return callback(null, true);

    if (env.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (!env.isProduction && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: Origin ${origin} not permitted.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// 2. Request body parsing with strict size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 3. Mount Swagger UI / OpenAPI documentation at /api-docs and /api-docs.json
setupSwagger(app);

// 4. API Route Modules
app.use('/api', healthRouter);
app.use('/api', authRouter);
app.use('/api', usersRouter);
app.use('/api', schemesRouter);
app.use('/api', applicationsRouter);
app.use('/api', grievancesRouter);
app.use('/api', syncRouter);
app.use('/api', ragRouter);
app.use('/api', ingestionRouter);
app.use('/api', auditRouter);

// 4. Catch-all 404 Handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.originalUrl}`,
      code: 'ROUTE_NOT_FOUND'
    }
  });
});

// 5. Centralized Error Handler
app.use(errorHandler);

export default app;
