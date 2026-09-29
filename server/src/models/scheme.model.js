const { query } = require('../db/pool');

const SchemeModel = {
  async findAll() {
    const res = await query('SELECT id, name, description, eligibility_rules_json, created_at FROM schemes ORDER BY id ASC');
    return res.rows;
  },

  async findById(id) {
    const res = await query('SELECT id, name, description, eligibility_rules_json, created_at FROM schemes WHERE id = $1', [id]);
    return res.rows[0] || null;
  }
};

module.exports = SchemeModel;
