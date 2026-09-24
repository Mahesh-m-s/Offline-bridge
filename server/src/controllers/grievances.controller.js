const GrievanceModel = require('../models/grievance.model');

const GrievancesController = {
  /**
   * POST /api/grievances
   * Sync endpoint for offline-created grievances.
   */
  async create(req, res, next) {
    try {
      const { category, description, client_uuid, created_at } = req.body;

      if (!client_uuid) {
        return res.status(400).json({ success: false, message: 'client_uuid is required for sync idempotency.' });
      }

      if (!description || description.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Grievance description is required.' });
      }

      const userId = req.user ? req.user.id : (req.body.user_id || null);

      const grievance = await GrievanceModel.createOrUpdate({
        userId,
        category: category || 'General',
        description: description.trim(),
        clientUuid: client_uuid,
        createdAt: created_at
      });

      res.status(201).json({
        success: true,
        message: 'Grievance recorded and synced successfully.',
        grievance
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/grievances?user_id=
   */
  async list(req, res, next) {
    try {
      const userId = req.query.user_id || (req.user ? req.user.id : null);

      if (userId) {
        const grievances = await GrievanceModel.findByUserId(userId);
        return res.json({ success: true, count: grievances.length, grievances });
      }

      const grievances = await GrievanceModel.findAll();
      res.json({ success: true, count: grievances.length, grievances });
    } catch (err) {
      next(err);
    }
  },

  async getByUuid(req, res, next) {
    try {
      const { uuid } = req.params;
      const grievance = await GrievanceModel.findByClientUuid(uuid);
      if (!grievance) {
        return res.status(404).json({ success: false, message: 'Grievance not found.' });
      }
      res.json({ success: true, grievance });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = GrievancesController;
