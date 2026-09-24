const SchemeModel = require('../models/scheme.model');
const FormModel = require('../models/form.model');

const SchemesController = {
  async listSchemes(req, res, next) {
    try {
      const schemes = await SchemeModel.findAll();
      res.json({ success: true, count: schemes.length, schemes });
    } catch (err) {
      next(err);
    }
  },

  async getSchemeById(req, res, next) {
    try {
      const { id } = req.params;
      const scheme = await SchemeModel.findById(id);
      if (!scheme) {
        return res.status(404).json({ success: false, message: 'Scheme not found.' });
      }
      res.json({ success: true, scheme });
    } catch (err) {
      next(err);
    }
  },

  async listForms(req, res, next) {
    try {
      const forms = await FormModel.findAll();
      res.json({ success: true, count: forms.length, forms });
    } catch (err) {
      next(err);
    }
  },

  async getFormByType(req, res, next) {
    try {
      const { type } = req.params;
      const form = await FormModel.findByType(type);
      if (!form) {
        return res.status(404).json({ success: false, message: 'Service form not found.' });
      }
      res.json({ success: true, form });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = SchemesController;
