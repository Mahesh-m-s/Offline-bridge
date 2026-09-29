const express = require('express');
const router = express.Router();
const GrievancesController = require('../controllers/grievances.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

// Grievance offline-sync endpoint
router.post('/', optionalAuth, GrievancesController.create);

// List grievances
router.get('/', optionalAuth, GrievancesController.list);

// Get single grievance
router.get('/:uuid', GrievancesController.getByUuid);

module.exports = router;
