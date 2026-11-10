import http from 'http';
import app from './src/app.js';

async function runTests() {
  console.log('=== Step 5 Scheme API Validation Suite ===\n');

  // Start app on ephemeral test port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`Test server running at ${baseUrl}\n`);

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

  // 1. Health endpoint
  await test('GET /api/health returns 200 with safe unconfigured DB status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(`Expected status: ok, got ${data.status}`);
    if (data.database.configured !== false) throw new Error(`Expected configured: false`);
    if (data.database.connected !== false) throw new Error(`Expected connected: false`);
  });

  // 2. GET /api/schemes when DB is unconfigured
  await test('GET /api/schemes returns 503 DATABASE_UNAVAILABLE when DB is unconfigured', async () => {
    const res = await fetch(`${baseUrl}/api/schemes`);
    if (res.status !== 503) throw new Error(`Expected 503, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error(`Expected success: false`);
    if (data.error?.code !== 'DATABASE_UNAVAILABLE') {
      throw new Error(`Expected code DATABASE_UNAVAILABLE, got ${data.error?.code}`);
    }
    if (!data.error?.message.includes('Database service unavailable')) {
      throw new Error(`Unexpected error message: ${data.error?.message}`);
    }
  });

  // 3. GET /api/schemes/:id with valid ID format when DB is unconfigured
  await test('GET /api/schemes/pm-kisan returns 503 DATABASE_UNAVAILABLE when DB is unconfigured', async () => {
    const res = await fetch(`${baseUrl}/api/schemes/pm-kisan`);
    if (res.status !== 503) throw new Error(`Expected 503, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error(`Expected success: false`);
    if (data.error?.code !== 'DATABASE_UNAVAILABLE') {
      throw new Error(`Expected code DATABASE_UNAVAILABLE, got ${data.error?.code}`);
    }
  });

  // 4. GET /api/schemes/:id with invalid ID format
  await test('GET /api/schemes/bad$scheme!id returns 400 INVALID_SCHEME_ID before DB call', async () => {
    const res = await fetch(`${baseUrl}/api/schemes/bad$scheme!id`);
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error(`Expected success: false`);
    if (data.error?.code !== 'INVALID_SCHEME_ID') {
      throw new Error(`Expected code INVALID_SCHEME_ID, got ${data.error?.code}`);
    }
  });

  // 5. POST /api/schemes rejected with 405 Method Not Allowed
  await test('POST /api/schemes returns 405 METHOD_NOT_ALLOWED (strictly read-only)', async () => {
    const res = await fetch(`${baseUrl}/api/schemes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test Scheme' })
    });
    if (res.status !== 405) throw new Error(`Expected 405, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error(`Expected success: false`);
    if (data.error?.code !== 'METHOD_NOT_ALLOWED') {
      throw new Error(`Expected code METHOD_NOT_ALLOWED, got ${data.error?.code}`);
    }
  });

  // 6. DELETE /api/schemes/:id rejected with 405 Method Not Allowed
  await test('DELETE /api/schemes/pm-kisan returns 405 METHOD_NOT_ALLOWED', async () => {
    const res = await fetch(`${baseUrl}/api/schemes/pm-kisan`, {
      method: 'DELETE'
    });
    if (res.status !== 405) throw new Error(`Expected 405, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error(`Expected success: false`);
    if (data.error?.code !== 'METHOD_NOT_ALLOWED') {
      throw new Error(`Expected code METHOD_NOT_ALLOWED, got ${data.error?.code}`);
    }
  });

  // 7. Undefined route returns 404
  await test('GET /api/nonexistent returns 404 ROUTE_NOT_FOUND', async () => {
    const res = await fetch(`${baseUrl}/api/nonexistent`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error(`Expected success: false`);
    if (data.error?.code !== 'ROUTE_NOT_FOUND') {
      throw new Error(`Expected code ROUTE_NOT_FOUND, got ${data.error?.code}`);
    }
  });

  // Clean shutdown
  await new Promise((resolve) => server.close(resolve));
  console.log(`\nTests finished: ${passed} passed, ${failed} failed.`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
