const { query } = require('../db/pool');

const GrievanceModel = {
  /**
   * Idempotent insert: updates synced_at if client_uuid already exists.
   */
  async createOrUpdate({ userId, category, description, clientUuid, createdAt }) {
    const insertSql = `
      INSERT INTO grievances (user_id, category, description, status, client_uuid, created_at, synced_at)
      VALUES ($1, $2, $3, 'submitted', $4, COALESCE($5::timestamptz, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP)
      ON CONFLICT (client_uuid)
      DO UPDATE SET synced_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const res = await query(insertSql, [
      userId || null,
      category || 'General',
      description,
      clientUuid,
      createdAt || new Date().toISOString()
    ]);

    return res.rows[0];
  },

  async findByClientUuid(clientUuid) {
    const res = await query('SELECT * FROM grievances WHERE client_uuid = $1', [clientUuid]);
    return res.rows[0] || null;
  },

  async findByUserId(userId) {
    const res = await query('SELECT * FROM grievances WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return res.rows;
  },

  async findAll() {
    const res = await query('SELECT * FROM grievances ORDER BY created_at DESC');
    return res.rows;
  }
};

module.exports = GrievanceModel;
