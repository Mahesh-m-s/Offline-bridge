const fs = require('node:fs/promises');
const path = require('node:path');
const { pool, withTransaction } = require('../db/pool');

async function migrate() {
  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  const files = (await fs.readdir(__dirname)).filter((name) => /^\d+_.*\.sql$/.test(name)).sort();
  for (const filename of files) {
    const alreadyApplied = await pool.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [filename]);
    if (alreadyApplied.rowCount) continue;
    const sql = await fs.readFile(path.join(__dirname, filename), 'utf8');
    await withTransaction(async (client) => {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations(filename) VALUES ($1)', [filename]);
    });
    console.log(`Applied migration ${filename}`);
  }
}

async function main() {
  try {
    await migrate();
    if (process.argv.includes('--seed')) await require('./seed').seed();
  } catch (error) {
    console.error('Database migration failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) main();
module.exports = { migrate };
