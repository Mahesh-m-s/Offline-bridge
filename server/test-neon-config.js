// Configuration Verification Script for Step 6
// Tests configuration parsing, secure SSL defaults, timeout settings, and local DB support.
// DOES NOT make any network connections or connect to databases.
// DOES NOT output any secrets or credentials.

async function runConfigTests() {
  console.log('=== Neon Database Configuration Check ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
      throw new Error(message);
    }
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  }

  // 1. Check default timeout setting
  {
    delete process.env.DATABASE_URL;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_SSL;
    delete process.env.DB_CONNECTION_TIMEOUT_MS;

    const { env } = await import(`./src/config/env.js?test=${Date.now()}`);
    assert(env.db.connectionTimeoutMillis === 10000, 'Default DB_CONNECTION_TIMEOUT_MS is 10000ms');
    assert(env.db.ssl === false, 'Default SSL is false for unconfigured local database');
    assert(env.isDbConfigured() === false, 'isDbConfigured is false when unconfigured');
  }

  // 2. Check Neon connection string auto-enables secure SSL (ssl: true)
  {
    process.env.DATABASE_URL = 'postgresql://dummy_user:dummy_pass@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const { env } = await import(`./src/config/env.js?test=${Date.now() + 1}`);
    assert(env.db.ssl === true, 'Neon URL automatically enables secure SSL (ssl: true)');
    assert(env.db.ssl !== false, 'SSL is not disabled');
    assert(typeof env.db.ssl !== 'object' || env.db.ssl.rejectUnauthorized !== false, 'rejectUnauthorized is NOT set to false');
    assert(env.isDbConfigured() === true, 'isDbConfigured is true for valid Neon URL');
  }

  // 3. Check placeholder DATABASE_URL is not treated as configured
  {
    process.env.DATABASE_URL = 'postgresql://username:your_password@ep-sample.aws.neon.tech/neondb';
    const { env } = await import(`./src/config/env.js?test=${Date.now() + 2}`);
    assert(env.isDbConfigured() === false, 'Placeholder with "your_password" is recognized as unconfigured');
  }

  // 4. Check local Postgres with discrete parameters (Option B) is preserved
  {
    delete process.env.DATABASE_URL;
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'local_db';
    process.env.DB_USER = 'postgres';
    process.env.DB_PASSWORD = 'local_real_password';
    process.env.DB_SSL = 'false';

    const { env } = await import(`./src/config/env.js?test=${Date.now() + 3}`);
    assert(env.db.host === 'localhost', 'Local DB_HOST is preserved');
    assert(env.db.ssl === false, 'Local DB SSL is false when DB_SSL=false');
    assert(env.isDbConfigured() === true, 'isDbConfigured is true when local DB_PASSWORD is provided');
  }

  // 5. Check local Postgres with explicit SSL=true
  {
    process.env.DB_SSL = 'true';
    const { env } = await import(`./src/config/env.js?test=${Date.now() + 4}`);
    assert(env.db.ssl === true, 'Local DB SSL is true when DB_SSL=true');
  }

  // Cleanup test environment variables
  delete process.env.DATABASE_URL;
  delete process.env.DB_HOST;
  delete process.env.DB_PORT;
  delete process.env.DB_NAME;
  delete process.env.DB_USER;
  delete process.env.DB_PASSWORD;
  delete process.env.DB_SSL;

  console.log(`\nConfiguration checks completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runConfigTests();
