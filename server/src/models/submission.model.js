const { query } = require('../db/pool');

const SubmissionModel = {
  /**
   * Idempotent insert: if client_uuid already exists, updates synced_at
   * and returns existing record without generating a duplicate row.
   */
  async createOrUpdate({ userId, formId, dataJson, clientUuid, createdAt }) {
    const insertSql = `
      INSERT INTO submissions (user_id, form_id, data_json, status, client_uuid, created_at, synced_at)
      VALUES ($1, $2, $3, 'submitted', $4, COALESCE($5::timestamptz, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP)
      ON CONFLICT (client_uuid) 
      DO UPDATE SET synced_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const res = await query(insertSql, [
      userId || null,
      formId,
      typeof dataJson === 'string' ? dataJson : JSON.stringify(dataJson),
      clientUuid,
      createdAt || new Date().toISOString()
    ]);

    return res.rows[0];
  },

  async findByClientUuid(clientUuid) {
    const res = await query('SELECT * FROM submissions WHERE client_uuid = $1', [clientUuid]);
    return res.rows[0] || null;
  },

  async findByUserId(userId) {
    const res = await query(
      `SELECT s.*, f.title as form_title, f.service_type
       FROM submissions s
       LEFT JOIN service_forms f ON s.form_id = f.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [userId]
    );
    return res.rows;
  },

  async findAll() {
    const res = await query(
      `SELECT s.*, f.title as form_title, f.service_type
       FROM submissions s
       LEFT JOIN service_forms f ON s.form_id = f.id
       ORDER BY s.created_at DESC`
    );
    return res.rows;
  }
};

module.exports = SubmissionModel;
