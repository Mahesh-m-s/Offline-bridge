const express = require('express');
const router = express.Router();
const SubmissionsController = require('../controllers/submissions.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

// Background sync endpoint: accepts submissions from offline queue
router.post('/', optionalAuth, SubmissionsController.create);

// Fetch user's submissions
router.get('/', optionalAuth, SubmissionsController.list);

// Get single submission by client UUID
router.get('/:uuid', SubmissionsController.getByUuid);

module.exports = router;
