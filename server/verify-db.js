import { env } from './src/config/env.js';
import { getPool, closePool } from './src/db/pool.js';

async function testConnection() {
  console.log('=== Neon PostgreSQL Read-Only Connectivity Test ===\n');

  // 1. Verify DATABASE_URL is configured without revealing any secrets
  const isConfigured = env.isDbConfigured();
  const hasUrl = Boolean(env.db.connectionString);
  console.log(`[Config Check] server/.env loaded: ${isConfigured ? 'Yes' : 'No'}`);
  console.log(`[Config Check] DATABASE_URL configured: ${hasUrl ? 'Yes' : 'No'}`);
  console.log(`[Config Check] SSL Mode: ${env.db.ssl ? 'Enabled (secure TLS verification)' : 'Disabled'}`);
  console.log(`[Config Check] Connection Timeout: ${env.db.connectionTimeoutMillis}ms\n`);

  if (!isConfigured || !hasUrl) {
    console.error('FAIL: Database is not configured. DATABASE_URL is missing or empty.');
    process.exit(1);
  }

  // 2. Execute read-only SELECT 1 query
  console.log('[Connecting] Attempting read-only "SELECT 1" query to Neon...');
  const pool = getPool();

  try {
    const startTime = Date.now();
    const result = await pool.query('SELECT 1 AS alive');
    const elapsed = Date.now() - startTime;

    if (result.rows && result.rows[0]?.alive === 1) {
      console.log(`\nSUCCESS: Connection to Neon PostgreSQL succeeded (${elapsed}ms).`);
      console.log('Read-only query "SELECT 1" returned expected result: 1.');
    } else {
      console.log('\nWARNING: Connection established but query returned unexpected response.');
    }
  } catch (err) {
    // Sanitize any potential sensitive connection details from error message
    const sanitizedMsg = (err.message || 'Unknown error')
      .replace(/:\/\/[^@]+@/, '://[REDACTED_CREDENTIALS]@')
      .replace(/password=[^\s&]+/gi, 'password=[REDACTED]');

    console.error(`\nFAILED: Connection to Neon PostgreSQL failed.`);
    console.error(`Diagnostic Error: ${sanitizedMsg}`);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

testConnection();
