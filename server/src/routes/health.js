import { Router } from 'express';
import { env } from '../config/env.js';
import { checkDbConnection } from '../db/pool.js';

const router = Router();
const serverStartTime = Date.now();

/**
 * GET /api/health
 * Public health check reporting server runtime, uptime, and database status
 */
router.get('/health', async (req, res, next) => {
  try {
    const isConfigured = env.isDbConfigured();
    let dbStatus = {
      configured: false,
      connected: false,
      message: 'PostgreSQL database not configured in .env'
    };

    if (isConfigured) {
      const check = await checkDbConnection();
      dbStatus = {
        configured: true,
        connected: check.isConnected,
        message: check.message,
        timestamp: check.timestamp || null
      };
    }

    return res.status(200).json({
      status: 'ok',
      service: 'arivunet-server',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
      environment: env.nodeEnv,
      database: dbStatus
    });
  } catch (err) {
    next(err);
  }
});

export default router;
