import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { getAuditLogs } from './audit.service.js';

const router = Router();

/**
 * GET /api/audit/logs
 * Read-only access for Administrator to review privileged events and security actions
 */
router.get('/audit/logs', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { limit, offset, action, actorId } = req.query;
    const result = await getAuditLogs({ limit, offset, action, actorId });

    res.status(200).json({
      success: true,
      data: result.logs,
      total: result.total
    });
  } catch (err) {
    next(err);
  }
});

export default router;

