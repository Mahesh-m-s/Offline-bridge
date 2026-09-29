const { Pool } = require('pg');
require('dotenv').config();

const useMock = process.env.NODE_ENV === 'test' || process.env.USE_MOCK_DB === 'true';
const pool = useMock ? { query: async (text) => { if (/^\s*SELECT\s+1/i.test(text)) return { rows: [{ '?column?': 1 }], rowCount: 1 }; throw new Error('Mock database accepts health checks only; repository mock is used for data operations'); }, connect: async () => ({ query: async (text) => pool.query(text), release() {} }), end: async () => {} } : new Pool({ connectionString: process.env.DATABASE_URL });
if (!useMock) pool.on('error', (error) => console.error('Unexpected PostgreSQL pool error', error));

const query = (text, params = []) => pool.query(text, params);
const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { pool, query, withTransaction };
