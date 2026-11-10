import { Router } from 'express';
import { handleGetUser, handleListUsers, handleUpdateUser } from './users.controller.js';
import { authenticate, requireRole, requireOwnershipOrRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

const userIdParamSchema = {
  params: {
    id: { required: true, isUuid: true }
  }
};

router.get('/users', authenticate, requireRole('admin'), handleListUsers);
router.get('/users/:id', authenticate, validate(userIdParamSchema), requireOwnershipOrRole('id'), handleGetUser);
router.put('/users/:id', authenticate, validate(userIdParamSchema), requireOwnershipOrRole('id'), handleUpdateUser);

export default router;

