const SubmissionModel = require('../models/submission.model');
const FormModel = require('../models/form.model');

const SubmissionsController = {
  /**
   * POST /api/submissions
   * Sync endpoint for offline submissions.
   * Uses client_uuid for idempotency to eliminate duplicate submissions.
   */
  async create(req, res, next) {
    try {
      const { form_id, service_type, data_json, client_uuid, created_at } = req.body;

      // Validation
      if (!client_uuid) {
        return res.status(400).json({ success: false, message: 'client_uuid is required for sync idempotency.' });
      }

      if (!data_json || typeof data_json !== 'object') {
        return res.status(400).json({ success: false, message: 'Valid data_json object is required.' });
      }

      let targetFormId = form_id;
      if (!targetFormId && service_type) {
        const form = await FormModel.findByType(service_type);
        if (form) {
          targetFormId = form.id;
        }
      }

      if (!targetFormId) {
        return res.status(400).json({ success: false, message: 'Valid form_id or recognized service_type is required.' });
      }

      // Check if user is authenticated or passed in body
      const userId = req.user ? req.user.id : (req.body.user_id || null);

      const submission = await SubmissionModel.createOrUpdate({
        userId,
        formId: targetFormId,
        dataJson: data_json,
        clientUuid: client_uuid,
        createdAt: created_at
      });

      res.status(201).json({
        success: true,
        message: 'Submission recorded and synced successfully.',
        submission
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/submissions?user_id=
   */
  async list(req, res, next) {
    try {
      const userId = req.query.user_id || (req.user ? req.user.id : null);

      if (userId) {
        const submissions = await SubmissionModel.findByUserId(userId);
        return res.json({ success: true, count: submissions.length, submissions });
      }

      // If admin or open list
      const submissions = await SubmissionModel.findAll();
      res.json({ success: true, count: submissions.length, submissions });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/submissions/:uuid
   */
  async getByUuid(req, res, next) {
    try {
      const { uuid } = req.params;
      const submission = await SubmissionModel.findByClientUuid(uuid);
      if (!submission) {
        return res.status(404).json({ success: false, message: 'Submission not found.' });
      }
      res.json({ success: true, submission });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = SubmissionsController;
