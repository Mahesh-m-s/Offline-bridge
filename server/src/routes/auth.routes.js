const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', requireAuth, AuthController.me);

module.exports = router;
