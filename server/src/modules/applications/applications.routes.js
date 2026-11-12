import { Router } from 'express';
import {
  handleSubmitApplication,
  handleUpdateStatus,
  handleGetMyApplications,
  handleGetApplicationById,
  handleListApplications
} from './applications.controller.js';
import { authenticate, optionalAuthenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { trackingRateLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

// Validation Schemas
const submitApplicationSchema = {
  body: {
    schemeId: { required: true, type: 'string', minLength: 1 },
    formData: { required: true },
    clientSubmissionId: { required: false, type: 'string', maxLength: 100 }
  }
};

const updateStatusSchema = {
  params: {
    id: { required: true, isUuid: true }
  },
  body: {
    status: { required: true, type: 'string', enum: ['under_review', 'approved', 'rejected'] },
    remarks: { required: true, type: 'string', minLength: 5, maxLength: 1000 }
  }
};

const appIdParamSchema = {
  params: {
    id: { required: true, type: 'string', minLength: 1, maxLength: 100 }
  }
};

// 1. Citizen submits application (must be authenticated)
router.post('/applications', authenticate, validate(submitApplicationSchema), handleSubmitApplication);

// 2. Citizen views own applications list
router.get('/applications/my', authenticate, handleGetMyApplications);

// 3. Official & Admin view all applications queue
router.get('/applications', authenticate, requireRole(['official', 'admin']), handleListApplications);

// 4. View application by ID or reference (Public tracking or authenticated detail)
router.get('/applications/:id', trackingRateLimiter, optionalAuthenticate, validate(appIdParamSchema), handleGetApplicationById);

// 5. Official & Admin update application status
router.patch('/applications/:id/status', authenticate, requireRole(['official', 'admin']), validate(updateStatusSchema), handleUpdateStatus);

export default router;

