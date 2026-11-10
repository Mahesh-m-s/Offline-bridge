import { Router } from 'express';
import { handleBatchSync } from './sync.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { syncRateLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

// Batch sync endpoint for mobile and offline clients
router.post('/sync/batch', authenticate, syncRateLimiter, handleBatchSync);

export default router;

