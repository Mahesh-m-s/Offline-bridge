const { query } = require('../db/pool');

const FormModel = {
  async findAll() {
    const res = await query('SELECT id, service_type, title, version, schema_json, created_at FROM service_forms ORDER BY id ASC');
    return res.rows;
  },

  async findByType(serviceType) {
    const res = await query('SELECT id, service_type, title, version, schema_json, created_at FROM service_forms WHERE service_type = $1', [serviceType]);
    return res.rows[0] || null;
  },

  async findById(id) {
    const res = await query('SELECT id, service_type, title, version, schema_json, created_at FROM service_forms WHERE id = $1', [id]);
    return res.rows[0] || null;
  }
};

module.exports = FormModel;
