const { query } = require('../db/pool');

const UserModel = {
  async findByPhone(phone) {
    const res = await query('SELECT * FROM users WHERE phone = $1', [phone]);
    return res.rows[0] || null;
  },

  async findById(id) {
    const res = await query('SELECT id, name, phone, role, created_at FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async create({ name, phone, passwordHash, role = 'citizen' }) {
    const res = await query(
      `INSERT INTO users (name, phone, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, phone, role, created_at`,
      [name, phone, passwordHash, role]
    );
    return res.rows[0];
  }
};

module.exports = UserModel;
