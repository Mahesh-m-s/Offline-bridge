import { Router } from 'express';
import { 
  handleGetAllSchemes, 
  handleGetSchemeById, 
  handleGetSchemeStats, 
  handleGetIngestionJobs,
  handleGetAuditHealth,
  handleTriggerIngestion,
  handleCreateOrUpdateScheme 
} from './schemes.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { SCHEME_ID_REGEX } from '../../middleware/validate.js';

const router = Router();

// Validate scheme ID parameter format
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

// 1. Statistics endpoint (must be declared before :id to prevent matching 'stats' as an id)
router.get('/schemes/stats', handleGetSchemeStats);

// 2. Ingestion Jobs History endpoint (for admin dashboard monitoring)
router.get('/schemes/ingestion-jobs', handleGetIngestionJobs);

// 3. Data health & audit metrics endpoint
router.get('/schemes/audit-health', handleGetAuditHealth);

// 4. Trigger incremental ingestion endpoint
router.post('/schemes/trigger-ingestion', authenticate, requireRole('admin'), handleTriggerIngestion);

// 5. Public paginated/filtered schemes endpoint
router.get('/schemes', handleGetAllSchemes);

// 6. Scheme by ID endpoint
router.get('/schemes/:id', validateSchemeIdParam, handleGetSchemeById);

// 7. Administrative upsert endpoint
router.post('/schemes', authenticate, requireRole('admin'), handleCreateOrUpdateScheme);

export default router;
