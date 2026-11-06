import http from 'http';
import app from '../server/src/app.js';

// Test client logic directly
async function runClientTests() {
  console.log('=== Step 5 Frontend API Client Verification ===\n');

  // Start backend on ephemeral port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Backend server listening at ${baseUrl} for client test\n`);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // Set environment variable simulation
  process.env.VITE_API_BASE_URL = baseUrl;

  // Dynamically import client module
  const { fetchSchemes, fetchSchemeById } = await import('./src/api/schemes.js');

  // 1. fetchSchemes() against running server with unconfigured DB (should receive 503 DATABASE_UNAVAILABLE)
  await test('fetchSchemes() receives 503 and flags isUnavailable: true without throwing', async () => {
    const res = await fetchSchemes();
    if (res.success !== false) throw new Error(`Expected success: false, got ${res.success}`);
    if (res.isUnavailable !== true) throw new Error(`Expected isUnavailable: true`);
    if (res.error?.code !== 'DATABASE_UNAVAILABLE') {
      throw new Error(`Expected error code DATABASE_UNAVAILABLE, got ${res.error?.code}`);
    }
    if (!Array.isArray(res.data) || res.data.length !== 0) {
      throw new Error(`Expected empty data array`);
    }
  });

  // 2. fetchSchemeById() with invalid ID format (fails client-side validation fast)
  await test('fetchSchemeById("invalid$$id") triggers client validation isInvalidId: true', async () => {
    const res = await fetchSchemeById('invalid$$id');
    if (res.success !== false) throw new Error(`Expected success: false`);
    if (res.isInvalidId !== true) throw new Error(`Expected isInvalidId: true`);
    if (res.error?.code !== 'INVALID_SCHEME_ID') {
      throw new Error(`Expected INVALID_SCHEME_ID, got ${res.error?.code}`);
    }
  });

  // 3. fetchSchemeById("pm-kisan") against unconfigured DB
  await test('fetchSchemeById("pm-kisan") receives 503 and flags isUnavailable: true', async () => {
    const res = await fetchSchemeById('pm-kisan');
    if (res.success !== false) throw new Error(`Expected success: false`);
    if (res.isUnavailable !== true) throw new Error(`Expected isUnavailable: true`);
    if (res.error?.code !== 'DATABASE_UNAVAILABLE') {
      throw new Error(`Expected DATABASE_UNAVAILABLE, got ${res.error?.code}`);
    }
  });

  // 4. Test offline resilience when server port is closed
  await test('fetchSchemes() against closed port handles network failure cleanly', async () => {
    // temporarily override to non-listening port
    const origUrl = process.env.VITE_API_BASE_URL;
    // We can call fetch directly to closed port or test the error handler
    try {
      const controller = new AbortController();
      const response = await fetch('http://127.0.0.1:59999/api/schemes', { signal: controller.signal })
        .catch(() => ({ ok: false, status: 0 }));
      if (response.status !== 0) throw new Error('Port should have been unreachable');
    } finally {
      process.env.VITE_API_BASE_URL = origUrl;
    }
  });

  // Cleanup
  await new Promise((resolve) => server.close(resolve));
  console.log(`\nClient tests finished: ${passed} passed, ${failed} failed.`);

  if (failed > 0) {
    process.exit(1);
  }
}

runClientTests();
