import { Router } from 'express';
import { handleRegister, handleLogin, handleGetMe, handleCreatePrivilegedUser } from './auth.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';
import { validate, PHONE_REGEX } from '../../middleware/validate.js';

const router = Router();

// Validation Schemas
const registerSchema = {
  body: {
    fullName: { required: true, type: 'string', minLength: 2, maxLength: 120 },
    phone: { required: true, type: 'string', pattern: PHONE_REGEX, patternMessage: 'Invalid mobile phone format.' },
    password: { required: true, type: 'string', minLength: 6, maxLength: 100 },
    villagePanchayat: { required: false, type: 'string', maxLength: 150 }
  }
};

const loginSchema = {
  body: {
    identifier: { required: true, type: 'string', minLength: 1 },
    password: { required: true, type: 'string', minLength: 1 }
  }
};

const privilegedUserSchema = {
  body: {
    fullName: { required: true, type: 'string', minLength: 2, maxLength: 120 },
    phone: { required: false, type: 'string' },
    role: { required: true, type: 'string', enum: ['official', 'admin'] },
    password: { required: true, type: 'string', minLength: 6 },
    villagePanchayat: { required: false, type: 'string' }
  }
};

// Routes
router.post('/auth/register', authRateLimiter, validate(registerSchema), handleRegister);
router.post('/auth/login', authRateLimiter, validate(loginSchema), handleLogin);
router.get('/auth/me', authenticate, handleGetMe);
router.post('/auth/privileged-user', authenticate, requireRole('admin'), validate(privilegedUserSchema), handleCreatePrivilegedUser);

export default router;

