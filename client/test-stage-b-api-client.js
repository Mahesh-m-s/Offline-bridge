/**
 * ArivuNet — Stage B: Shared API Client Verification Suite
 */

import http from 'http';
import assert from 'node:assert/strict';
import {
  apiClient,
  apiRequest,
  getApiBaseUrl,
  API_BASE_URL,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  AUTH_TOKEN_KEY
} from './src/api/apiClient.js';
import {
  getApiBaseUrl as schemesGetBaseUrl,
  API_BASE_URL as schemesBaseUrl,
  fetchSchemeById
} from './src/api/schemes.js';

// Setup Mock sessionStorage for Node environment
class MockSessionStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) || null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

globalThis.window = {
  sessionStorage: new MockSessionStorage()
};

async function runStageBTests() {
  console.log('================================================================');
  console.log('=== ArivuNet Stage B: Shared API Client Verification Suite ===');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    -> ${err.message}`);
      failed++;
    }
  }

  // 1. BASE URL RESOLUTION & UNIFICATION
  console.log('--- Test Suite 1: Base URL Resolution & Schemes Integration ---');

  await test('getApiBaseUrl strips trailing slashes', () => {
    assert.equal(getApiBaseUrl('http://api.example.com/'), 'http://api.example.com');
    assert.equal(getApiBaseUrl('http://api.example.com///'), 'http://api.example.com');
  });

  await test('getApiBaseUrl is identically re-exported by schemes.js without breaking', () => {
    assert.equal(typeof schemesGetBaseUrl, 'function');
    assert.equal(schemesGetBaseUrl('http://test.local/'), 'http://test.local');
    assert.equal(schemesBaseUrl, API_BASE_URL);
  });

  // 2. SESSIONSTORAGE TOKEN MANAGEMENT
  console.log('\n--- Test Suite 2: SessionStorage JWT Token Management ---');

  await test('Token accessor operations (get, set, clear) operate strictly in sessionStorage', () => {
    clearAuthToken();
    assert.equal(getAuthToken(), null);

    setAuthToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.testToken');
    assert.equal(getAuthToken(), 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.testToken');
    assert.equal(globalThis.window.sessionStorage.getItem(AUTH_TOKEN_KEY), 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.testToken');

    clearAuthToken();
    assert.equal(getAuthToken(), null);
    assert.equal(globalThis.window.sessionStorage.getItem(AUTH_TOKEN_KEY), null);
  });

  // 3. HTTP REQUEST & RESPONSE HANDLING WITH EPHEMERAL TEST SERVER
  console.log('\n--- Test Suite 3: Request Handling, Authentication & HTTP Statuses ---');

  let lastReceivedHeaders = null;
  let lastReceivedBody = null;
  let serverResponseMode = '200_OK';

  const testServer = http.createServer(async (req, res) => {
    lastReceivedHeaders = req.headers;

    let chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString();
    try {
      lastReceivedBody = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      lastReceivedBody = rawBody;
    }

    if (serverResponseMode === '200_OK') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: { user: 'Basavaraju', role: 'citizen' } }));
    } else if (serverResponseMode === '401_UNAUTH') {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message: 'Token expired.', code: 'TOKEN_EXPIRED' } }));
    } else if (serverResponseMode === '403_FORBIDDEN') {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message: 'Access forbidden.', code: 'FORBIDDEN' } }));
    } else if (serverResponseMode === '429_RATELIMIT') {
      res.writeHead(429, { 'Content-Type': 'application/json', 'Retry-After': '60' });
      res.end(JSON.stringify({ success: false, error: { message: 'Too many requests.', code: 'RATE_LIMIT_EXCEEDED' } }));
    } else if (serverResponseMode === '503_DB_UNAVAILABLE') {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message: 'Database service unavailable.', code: 'DATABASE_UNAVAILABLE' } }));
    } else if (serverResponseMode === '502_HTML_GATEWAY') {
      res.writeHead(502, { 'Content-Type': 'text/html' });
      res.end('<html><body>502 Bad Gateway: Proxy Error</body></html>');
    } else if (serverResponseMode === 'SLOW_TIMEOUT') {
      // Intentionally do not respond quickly to test timeout abort
      setTimeout(() => {
        if (!res.writableEnded) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        }
      }, 500);
    }
  });

  await new Promise((resolve) => testServer.listen(0, '127.0.0.1', resolve));
  const testPort = testServer.address().port;
  const testBaseUrl = `http://127.0.0.1:${testPort}`;

  try {
    await test('GET request parses JSON data and reports success: true', async () => {
      serverResponseMode = '200_OK';
      const res = await apiClient.get('/api/test', { baseUrl: testBaseUrl });

      assert.equal(res.success, true);
      assert.equal(res.status, 200);
      assert.equal(res.data.user, 'Basavaraju');
      assert.equal(res.error, null);
      assert.equal(res.isNetworkError, false);
    });

    await test('POST request serializes JSON body and attaches Authorization: Bearer from sessionStorage', async () => {
      serverResponseMode = '200_OK';
      setAuthToken('citizen_active_jwt_sample_123');

      const payload = { schemeId: 'agri-seed-subsidy', localDraftId: 'agri-1' };
      const res = await apiClient.post('/api/applications', payload, { baseUrl: testBaseUrl });

      assert.equal(res.success, true);
      assert.equal(lastReceivedHeaders['authorization'], 'Bearer citizen_active_jwt_sample_123');
      assert.equal(lastReceivedHeaders['content-type'], 'application/json');
      assert.deepEqual(lastReceivedBody, payload);
    });

    await test('Request with auth: false omits Authorization header even if token exists', async () => {
      serverResponseMode = '200_OK';
      setAuthToken('citizen_active_jwt_sample_123');

      await apiClient.get('/api/public-check', { baseUrl: testBaseUrl, auth: false });
      assert.equal(lastReceivedHeaders['authorization'], undefined);
    });

    await test('401 Unauthorized sets isAuthError: true and clears expired token from sessionStorage', async () => {
      serverResponseMode = '401_UNAUTH';
      setAuthToken('expired_sample_jwt');
      assert.equal(getAuthToken(), 'expired_sample_jwt');

      const res = await apiClient.get('/api/auth/me', { baseUrl: testBaseUrl });
      assert.equal(res.success, false);
      assert.equal(res.status, 401);
      assert.equal(res.isAuthError, true);
      assert.equal(res.error?.code, 'TOKEN_EXPIRED');

      // Verified: Token was cleared automatically
      assert.equal(getAuthToken(), null);
    });

    await test('403 Forbidden sets isForbidden: true without clearing token', async () => {
      serverResponseMode = '403_FORBIDDEN';
      setAuthToken('citizen_valid_token');

      const res = await apiClient.get('/api/audit/logs', { baseUrl: testBaseUrl });
      assert.equal(res.success, false);
      assert.equal(res.status, 403);
      assert.equal(res.isForbidden, true);
      assert.equal(res.error?.code, 'FORBIDDEN');
      assert.equal(getAuthToken(), 'citizen_valid_token');
    });

    await test('429 Rate Limit sets RATE_LIMIT_EXCEEDED code', async () => {
      serverResponseMode = '429_RATELIMIT';
      const res = await apiClient.post('/api/auth/login', { identifier: '9845011111' }, { baseUrl: testBaseUrl });

      assert.equal(res.success, false);
      assert.equal(res.status, 429);
      assert.equal(res.error?.code, 'RATE_LIMIT_EXCEEDED');
    });

    await test('503 Database Unavailable sets isUnavailable: true', async () => {
      serverResponseMode = '503_DB_UNAVAILABLE';
      const res = await apiClient.get('/api/schemes', { baseUrl: testBaseUrl });

      assert.equal(res.success, false);
      assert.equal(res.status, 503);
      assert.equal(res.isUnavailable, true);
      assert.equal(res.error?.code, 'DATABASE_UNAVAILABLE');
    });

    await test('Non-JSON 502 HTML Gateway error parses cleanly without JSON crash', async () => {
      serverResponseMode = '502_HTML_GATEWAY';
      const res = await apiClient.get('/api/gateway-test', { baseUrl: testBaseUrl });

      assert.equal(res.success, false);
      assert.equal(res.status, 502);
      assert.equal(res.isUnavailable, true);
      assert.ok(res.error?.message.includes('502 Bad Gateway'));
    });

    await test('Request timeout triggers isTimeout: true and aborts safely', async () => {
      serverResponseMode = 'SLOW_TIMEOUT';
      const res = await apiClient.get('/api/slow', { baseUrl: testBaseUrl, timeoutMs: 50 });

      assert.equal(res.success, false);
      assert.equal(res.status, 0);
      assert.equal(res.isTimeout, true);
      assert.equal(res.error?.code, 'TIMEOUT');
    });

    await test('Network disconnect / closed port sets isNetworkError: true', async () => {
      // Connect to unreachable closed port
      const res = await apiClient.get('/api/offline', { baseUrl: 'http://127.0.0.1:59998' });

      assert.equal(res.success, false);
      assert.equal(res.status, 0);
      assert.equal(res.isNetworkError, true);
      assert.equal(res.error?.code, 'NETWORK_ERROR');
    });

    await test('Client-side scheme validation in fetchSchemeById remains functional', async () => {
      const invalidRes = await fetchSchemeById('invalid$$id');
      assert.equal(invalidRes.success, false);
      assert.equal(invalidRes.isInvalidId, true);
      assert.equal(invalidRes.error?.code, 'INVALID_SCHEME_ID');
    });

  } finally {
    await new Promise((resolve) => testServer.close(resolve));
  }

  console.log('\n================================================================');
  console.log(`Stage B Verification Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runStageBTests().catch((err) => {
  console.error('[Fatal Stage B Test Error]:', err);
  process.exit(1);
});

