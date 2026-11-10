import { env } from '../config/env.js';
import { getPool, checkDbConnection, closePool } from './pool.js';
import { migrateUp, migrateDown } from './migrator.js';

async function run() {
  console.log('[ArivuNet Migration] Checking database availability...');

  if (!env.isDbConfigured()) {
    console.log('[ArivuNet Migration] Notice: PostgreSQL is not configured in .env (placeholders present).');
    console.log('[ArivuNet Migration] Migration skipped safely. Configure DATABASE_URL or DB_* settings when PostgreSQL is installed.');
    return;
  }

  const check = await checkDbConnection();
  if (!check.isConnected) {
    console.warn(`[ArivuNet Migration] Cannot connect to PostgreSQL: ${check.message}`);
    console.warn('[ArivuNet Migration] Migration skipped safely without failing.');
    return;
  }

  const pool = getPool();
  const client = await pool.connect();

  const isRollback = process.argv.includes('--down');

  try {
    if (isRollback) {
      console.log('[ArivuNet Migration] Running rollback (down)...');
      await migrateDown(client);
    } else {
      console.log('[ArivuNet Migration] Applying pending migrations (up)...');
      await migrateUp(client);
    }
  } catch (err) {
    console.error('[ArivuNet Migration] Fatal migration execution error:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await closePool();
  }
}

// Only execute directly when run as script
if (process.argv[1]?.endsWith('migrate.js')) {
  run().catch((err) => {
    console.error('[ArivuNet Migration] Unexpected error:', err);
    process.exit(1);
  });
}

export { run };
