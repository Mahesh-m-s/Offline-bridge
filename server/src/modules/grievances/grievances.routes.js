import { Router } from 'express';
import {
  handleSubmitGrievance,
  handleGetMyGrievances,
  handleListGrievances,
  handleUpdateGrievanceStatus,
  handleGetGrievanceById
} from './grievances.controller.js';
import { authenticate, optionalAuthenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

const grvIdParamSchema = {
  params: {
    id: { required: true, type: 'string', minLength: 1, maxLength: 100 }
  }
};

const submitGrievanceSchema = {
  body: {
    category: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    description: { required: true, type: 'string', minLength: 10, maxLength: 2000 },
    villagePanchayat: { required: true, type: 'string', minLength: 2, maxLength: 150 },
    contactPhone: { required: false, type: 'string' },
    clientSubmissionId: { required: false, type: 'string' }
  }
};

const updateGrievanceSchema = {
  params: {
    id: { required: true, isUuid: true }
  },
  body: {
    status: { required: true, type: 'string', enum: ['under_review', 'resolved', 'rejected'] },
    remarks: { required: false, type: 'string' }
  }
};

// 1. Submit grievance (Public or Authenticated)
router.post('/grievances', optionalAuthenticate, validate(submitGrievanceSchema), handleSubmitGrievance);

// 2. Citizen get own grievances
router.get('/grievances/my', authenticate, handleGetMyGrievances);

// 3. Official & Admin get all grievances queue
router.get('/grievances', authenticate, requireRole(['official', 'admin']), handleListGrievances);

// 4. View grievance by ID or reference (Public tracking or citizen detail)
router.get('/grievances/:id', optionalAuthenticate, validate(grvIdParamSchema), handleGetGrievanceById);

// 5. Official & Admin update grievance status
router.patch('/grievances/:id/status', authenticate, requireRole(['official', 'admin']), validate(updateGrievanceSchema), handleUpdateGrievanceStatus);

export default router;

