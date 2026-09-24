const express = require('express');
const router = express.Router();
const SchemesController = require('../controllers/schemes.controller');

// Schemes endpoints
router.get('/', SchemesController.listSchemes);
router.get('/:id', SchemesController.getSchemeById);

// Service forms schemas endpoint for client caching
router.get('/forms/all', SchemesController.listForms);
router.get('/forms/:type', SchemesController.getFormByType);

module.exports = router;
