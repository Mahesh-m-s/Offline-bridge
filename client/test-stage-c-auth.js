/**
 * ArivuNet — Stage C: Real Authentication Context & JWT Session Restoration Tests
 */

import http from 'http';
import assert from 'node:assert/strict';
import {
  AUTH_TOKEN_KEY,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  getApiBaseUrl
} from './src/api/apiClient.js';
import { normalizeUser } from './src/context/userNormalizer.js';

// Setup Mock sessionStorage for Node test environment
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

async function runStageCTests() {
  console.log('================================================================');
  console.log('=== ArivuNet Stage C: AuthContext & JWT Session Verification ===');
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

  // 1. USER NORMALIZATION TESTS
  console.log('--- Test Suite 1: Backend User Payload Normalization ---');

  await test('normalizeUser maps full_name to name and village_panchayat to villagePanchayat', () => {
    const rawDbUser = {
      id: 'uuid-1234',
      full_name: 'Basavaraju M',
      phone: '9845011111',
      role: 'citizen',
      village_panchayat: 'Hunsur Rural GP',
      created_at: '2026-10-12T10:00:00Z'
    };

    const normalized = normalizeUser(rawDbUser);
    assert.equal(normalized.id, 'uuid-1234');
    assert.equal(normalized.name, 'Basavaraju M');
    assert.equal(normalized.phone, '9845011111');
    assert.equal(normalized.role, 'citizen');
    assert.equal(normalized.villagePanchayat, 'Hunsur Rural GP');
  });

  await test('normalizeUser preserves JWT token format (name, villagePanchayat)', () => {
    const jwtUser = {
      id: 'uuid-5678',
      name: 'Agri Scrutiny Officer',
      phone: '9845088888',
      role: 'official',
      villagePanchayat: ''
    };

    const normalized = normalizeUser(jwtUser);
    assert.equal(normalized.name, 'Agri Scrutiny Officer');
    assert.equal(normalized.role, 'official');
    assert.equal(normalized.villagePanchayat, '');
  });

  await test('normalizeUser defaults role to citizen and handles missing names safely', () => {
    const emptyUser = { id: 'uuid-empty' };
    const normalized = normalizeUser(emptyUser);
    assert.equal(normalized.role, 'citizen');
    assert.equal(normalized.name, 'Citizen User');
  });

  // 2. MOCK BACKEND SERVER FOR AUTH FLOWS
  console.log('\n--- Test Suite 2: Registration, Login & Session Restoration ---');

  let receivedAuthHeader = null;
  let serverMode = 'normal'; // 'normal' | 'expired_token' | 'server_down' | 'error_409' | 'error_401'

  const mockServer = http.createServer(async (req, res) => {
    receivedAuthHeader = req.headers.authorization;

    let chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString();
    const body = rawBody ? JSON.parse(rawBody) : {};

    // 1. POST /api/auth/register
    if (req.url === '/api/auth/register' && req.method === 'POST') {
      if (serverMode === 'error_409') {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: { message: 'A user with this mobile phone number is already registered.', code: 'PHONE_ALREADY_REGISTERED' }
        }));
      }

      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        data: {
          id: 'user-new-citizen-uuid',
          full_name: body.fullName,
          phone: body.phone,
          role: 'citizen',
          village_panchayat: body.villagePanchayat
        },
        token: 'signed_jwt_citizen_registration_token'
      }));
    }

    // 2. POST /api/auth/login
    if (req.url === '/api/auth/login' && req.method === 'POST') {
      if (body.password === 'wrongPassword') {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: { message: 'Invalid mobile number/identifier or password.', code: 'INVALID_CREDENTIALS' }
        }));
      }

      const role = body.identifier.includes('admin') ? 'admin' : body.identifier.includes('official') ? 'official' : 'citizen';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        data: {
          id: `user-${role}-uuid`,
          full_name: `${role.toUpperCase()} User`,
          phone: body.identifier,
          role: role,
          village_panchayat: 'Mysuru Rural'
        },
        token: `signed_jwt_${role}_login_token`
      }));
    }

    // 3. GET /api/auth/me
    if (req.url === '/api/auth/me' && req.method === 'GET') {
      if (serverMode === 'expired_token' || !receivedAuthHeader || receivedAuthHeader === 'Bearer invalid_or_expired_jwt') {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: { message: 'Token has expired.', code: 'TOKEN_EXPIRED' }
        }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        data: {
          id: 'verified-user-uuid',
          name: 'Verified Citizen',
          phone: '9845011111',
          role: 'citizen',
          villagePanchayat: 'Hunsur Rural GP'
        }
      }));
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: { message: 'Not found', code: 'NOT_FOUND' } }));
  });

  await new Promise((resolve) => mockServer.listen(0, '127.0.0.1', resolve));
  const serverPort = mockServer.address().port;
  const mockBaseUrl = `http://127.0.0.1:${serverPort}`;

  // Configure environment variable for apiClient
  process.env.VITE_API_BASE_URL = mockBaseUrl;

  try {
    // Dynamically import apiClient with configured baseUrl
    const { apiClient } = await import('./src/api/apiClient.js');

    await test('Registration stores JWT in sessionStorage and normalizes user', async () => {
      clearAuthToken();
      assert.equal(getAuthToken(), null);

      const regPayload = {
        fullName: 'Shrivathsa N',
        phone: '9845033333',
        password: 'Password123!',
        villagePanchayat: 'Nonavinakere GP'
      };

      const res = await apiClient.post('/api/auth/register', regPayload, { baseUrl: mockBaseUrl, auth: false });
      assert.equal(res.success, true);
      assert.equal(res.status, 201);
      assert.equal(res.raw?.token, 'signed_jwt_citizen_registration_token');

      // Store token using accessor as AuthContext does
      setAuthToken(res.raw.token);
      assert.equal(getAuthToken(), 'signed_jwt_citizen_registration_token');

      const normalized = normalizeUser(res.data);
      assert.equal(normalized.name, 'Shrivathsa N');
      assert.equal(normalized.role, 'citizen');
    });

    await test('Registration with duplicate phone preserves 409 PHONE_ALREADY_REGISTERED error', async () => {
      serverMode = 'error_409';
      const res = await apiClient.post('/api/auth/register', {
        fullName: 'Test',
        phone: '9845033333',
        password: 'Password123!'
      }, { baseUrl: mockBaseUrl, auth: false });

      assert.equal(res.success, false);
      assert.equal(res.status, 409);
      assert.equal(res.error?.code, 'PHONE_ALREADY_REGISTERED');
      serverMode = 'normal';
    });

    await test('Login stores JWT and role determined exclusively by backend', async () => {
      clearAuthToken();

      const res = await apiClient.post('/api/auth/login', {
        identifier: 'official_officer_42',
        password: 'OfficialPassword!'
      }, { baseUrl: mockBaseUrl, auth: false });

      assert.equal(res.success, true);
      assert.equal(res.raw?.token, 'signed_jwt_official_login_token');
      setAuthToken(res.raw.token);

      const normalized = normalizeUser(res.data);
      assert.equal(normalized.role, 'official');
      assert.equal(getAuthToken(), 'signed_jwt_official_login_token');
    });

    await test('Login with incorrect password returns 401 INVALID_CREDENTIALS', async () => {
      const res = await apiClient.post('/api/auth/login', {
        identifier: '9845011111',
        password: 'wrongPassword'
      }, { baseUrl: mockBaseUrl, auth: false });

      assert.equal(res.success, false);
      assert.equal(res.status, 401);
      assert.equal(res.error?.code, 'INVALID_CREDENTIALS');
    });

    await test('Session restoration: GET /api/auth/me succeeds with valid token in sessionStorage', async () => {
      setAuthToken('valid_live_jwt_token');

      const res = await apiClient.get('/api/auth/me', { baseUrl: mockBaseUrl });
      assert.equal(res.success, true);
      assert.equal(res.status, 200);
      assert.equal(receivedAuthHeader, 'Bearer valid_live_jwt_token');

      const user = normalizeUser(res.data);
      assert.equal(user.name, 'Verified Citizen');
      assert.equal(user.role, 'citizen');
    });

    await test('Session restoration on 401 clears invalid token from sessionStorage', async () => {
      setAuthToken('invalid_or_expired_jwt');
      assert.equal(getAuthToken(), 'invalid_or_expired_jwt');

      serverMode = 'expired_token';
      const res = await apiClient.get('/api/auth/me', { baseUrl: mockBaseUrl });

      assert.equal(res.success, false);
      assert.equal(res.isAuthError, true);
      // Confirmed: apiClient automatically purges expired token on 401
      assert.equal(getAuthToken(), null);
      serverMode = 'normal';
    });

    await test('Network failure during session restoration does NOT fabricate authentication', async () => {
      setAuthToken('valid_token_waiting_for_server');

      // Query non-listening closed port to simulate network failure
      const res = await apiClient.get('/api/auth/me', { baseUrl: 'http://127.0.0.1:59997' });

      assert.equal(res.success, false);
      assert.equal(res.isNetworkError, true);

      // Token is preserved for retry when network returns, but user must not be authenticated
      assert.equal(getAuthToken(), 'valid_token_waiting_for_server');
    });

    await test('Logout purges token from sessionStorage', () => {
      setAuthToken('active_token_before_logout');
      assert.equal(getAuthToken(), 'active_token_before_logout');

      clearAuthToken();
      assert.equal(getAuthToken(), null);
    });

  } finally {
    await new Promise((resolve) => mockServer.close(resolve));
  }

  console.log('\n================================================================');
  console.log(`Stage C Verification Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runStageCTests().catch((err) => {
  console.error('[Fatal Stage C Test Error]:', err);
  process.exit(1);
});
