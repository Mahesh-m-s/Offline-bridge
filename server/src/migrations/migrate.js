const fs = require('fs');
const path = require('path');
const { pool, query, testConnection } = require('../db/pool');

const runMigrations = async () => {
  console.log('[OfflineBridge Migration] Running database migrations...');
  const initSqlPath = path.join(__dirname, '001_init.sql');
  const seedSqlPath = path.join(__dirname, 'seed.sql');

  const isConnected = await testConnection();
  if (!isConnected) {
    console.log('[OfflineBridge Migration] Note: PostgreSQL connection is not available right now.');
    console.log('[OfflineBridge Migration] Tables & seeds are ready in SQL scripts (001_init.sql, seed.sql) and embedded in fallback layer.');
    return;
  }

  try {
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    console.log('[OfflineBridge Migration] Applying 001_init.sql...');
    await pool.query(initSql);
    console.log('[OfflineBridge Migration] Tables created successfully.');

    if (process.argv.includes('--seed')) {
      console.log('[OfflineBridge Migration] Seeding initial data from seed.sql...');
      const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
      await pool.query(seedSql);
      console.log('[OfflineBridge Migration] Seed completed successfully.');
    }
  } catch (err) {
    console.error('[OfflineBridge Migration Error]', err.message);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
};

runMigrations();
