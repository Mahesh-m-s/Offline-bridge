import { Router } from 'express';
import { handleGetAllSchemes, handleGetSchemeById, handleCreateOrUpdateScheme } from './schemes.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { SCHEME_ID_REGEX } from '../../middleware/validate.js';

const router = Router();

// Validate scheme ID parameter format exactly matching Phase 2 specification
function validateSchemeIdParam(req, res, next) {
  const { id } = req.params;
  if (!id || !SCHEME_ID_REGEX.test(id)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid scheme ID format. Scheme ID must be 1 to 64 alphanumeric characters, hyphens, or underscores.',
        code: 'INVALID_SCHEME_ID'
      }
    });
  }
  next();
}

// Strictly enforce read-only access for unauthenticated calls and unsupported HTTP methods
router.all(['/schemes', '/schemes/:id'], (req, res, next) => {
  // Allow authenticated admin POST to create/update schemes
  if (req.method === 'POST' && req.headers.authorization) {
    return next();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        message: `Method ${req.method} is not allowed on ${req.baseUrl}${req.path}. This endpoint is strictly read-only.`,
        code: 'METHOD_NOT_ALLOWED'
      }
    });
  }
  next();
});

// Public read-only endpoints
router.get('/schemes', handleGetAllSchemes);
router.get('/schemes/:id', validateSchemeIdParam, handleGetSchemeById);

// Admin-only creation/update endpoint
router.post('/schemes', authenticate, requireRole('admin'), handleCreateOrUpdateScheme);

export default router;
