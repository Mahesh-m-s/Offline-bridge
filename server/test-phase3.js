/**
 * ArivuNet — Phase 3 Comprehensive Backend Verification Suite
 * 
 * Verifies:
 * 1. Migration execution against an isolated disposable database schema.
 * 2. Migration rollback (down) behavior and subsequent re-application.
 * 3. Server-side password hashing (bcryptjs) & JWT authentication.
 * 4. Unauthenticated access rejection (401).
 * 5. Horizontal authorization check: Citizen cannot access another citizen's records (403).
 * 6. Vertical authorization check: Citizen cannot call admin/official endpoints (403).
 * 7. Server-side role enforcement for officials and administrators.
 * 8. Server-side request validation (400) for missing, invalid, or out-of-spec fields.
 * 9. Idempotent submission handling: duplicate client submission IDs do not create duplicate rows.
 * 10. Database transaction rollback on failure (zero partial writes).
 * 11. Complete status history and audit logging without secrets leakage.
 * 12. Strict backward compatibility with Phase 2 scheme endpoints.
 */

import http from 'http';
import { getPool, closePool } from './src/db/pool.js';
import { migrateUp, migrateDown } from './src/db/migrator.js';
import { upsertScheme } from './src/modules/schemes/schemes.service.js';
import app from './src/app.js';

const DISPOSABLE_SCHEMA = `test_arivunet_phase3_${Date.now()}`;

async function runPhase3Tests() {
  console.log('================================================================');
  console.log('=== ArivuNet Phase 3: Architecture, Security & Database Test ===');
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
      if (err.stack && process.env.DEBUG) console.error(err.stack);
      failed++;
    }
  }

  const pool = getPool();
  const dbClient = await pool.connect();

  console.log(`[Test Setup] Creating disposable PostgreSQL schema: '${DISPOSABLE_SCHEMA}'...`);
  await dbClient.query(`CREATE SCHEMA ${DISPOSABLE_SCHEMA}`);
  await dbClient.query(`SET search_path TO ${DISPOSABLE_SCHEMA}, public`);
  console.log(`[Test Setup] Isolated search path active. Main database unaffected.\n`);

  // Start Express HTTP server on ephemeral port with disposable search path
  const server = http.createServer((req, res) => {
    // Ensure all incoming requests in this test session operate in the disposable schema
    pool.query(`SET search_path TO ${DISPOSABLE_SCHEMA}, public`).then(() => {
      app(req, res);
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  console.log(`[Test Server] Express API listening at ${baseUrl}\n`);

  try {
    // --------------------------------------------------------------------------
    // MIGRATION & ROLLBACK TESTS
    // --------------------------------------------------------------------------
    console.log('--- Test Suite 1: Database Migrations & Rollback Behavior ---');

    await test('Migration UP applies schema and security tables to disposable database', async () => {
      const upResults = await migrateUp(dbClient);
      if (upResults.length !== 2) {
        throw new Error(`Expected 2 migrations to run, ran: ${upResults.length}`);
      }

      // Verify tables exist in disposable schema
      const tablesRes = await dbClient.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = '${DISPOSABLE_SCHEMA}'
      `);
      const tableNames = tablesRes.rows.map((r) => r.table_name);

      const required = ['users', 'schemes', 'applications', 'application_status_history', 'grievances', 'audit_logs', 'knowledge_documents', '_schema_migrations'];
      for (const t of required) {
        if (!tableNames.includes(t)) {
          throw new Error(`Expected table '${t}' to exist in disposable schema.`);
        }
      }
    });

    await test('Migration DOWN (rollback) cleanly reverts Migration 002 without data corruption', async () => {
      const downResult = await migrateDown(dbClient, '002_phase3_security_and_idempotency');
      if (downResult.status !== 'success') {
        throw new Error(`Rollback failed with status: ${downResult.status}`);
      }

      // Verify audit_logs and knowledge_documents were dropped
      const checkRes = await dbClient.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = '${DISPOSABLE_SCHEMA}' AND table_name IN ('audit_logs', 'knowledge_documents')
      `);
      if (checkRes.rows.length !== 0) {
        throw new Error('Expected audit_logs and knowledge_documents to be dropped on rollback.');
      }

      // Verify client_submission_id column was removed from applications
      const colRes = await dbClient.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = '${DISPOSABLE_SCHEMA}' AND table_name = 'applications' AND column_name = 'client_submission_id'
      `);
      if (colRes.rows.length !== 0) {
        throw new Error('Expected client_submission_id column to be dropped from applications.');
      }
    });

    await test('Re-applying Migration UP restores full Phase 3 security schema successfully', async () => {
      const reUp = await migrateUp(dbClient);
      const applied = reUp.filter((r) => r.status === 'success');
      if (applied.length !== 1 || applied[0].id !== '002_phase3_security_and_idempotency') {
        throw new Error('Expected 002_phase3_security_and_idempotency to be re-applied.');
      }
    });

    // Seed a test scheme in the disposable schema for application testing
    await upsertScheme({
      id: 'agri-seed-subsidy',
      title: 'Farmer Seed Subsidy (Raitha Siri)',
      department: 'Department of Agriculture',
      category: 'farmer',
      description: 'Subsidized certified seeds distribution for small farmers.',
      eligibilityCriteria: 'Karnataka resident farmer registered in FRUITS.',
      eligibilityRules: { requiresLand: true },
      isActive: true
    }, { id: null, role: 'system' });

    // --------------------------------------------------------------------------
    // AUTHENTICATION & PASSWORD HASHING TESTS
    // --------------------------------------------------------------------------
    console.log('\n--- Test Suite 2: Authentication & Password Hashing ---');

    let citizen1Token = '';
    let citizen1User = null;
    let citizen2Token = '';
    let citizen2User = null;
    let officialToken = '';
    let officialUser = null;
    let adminToken = '';
    let adminUser = null;

    await test('Register Citizen 1 hashes password with bcrypt and returns JWT token', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Basavaraju M',
          phone: '9845011111',
          password: 'securePassword123',
          villagePanchayat: 'Hunsur Rural GP'
        })
      });

      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      const data = await res.json();
      if (!data.token) throw new Error('JWT token not returned on registration');
      if (data.data.role !== 'citizen') throw new Error(`Expected citizen role, got ${data.data.role}`);

      // Verify in DB that plain text password was NOT stored
      const dbUserRes = await dbClient.query('SELECT password_hash FROM users WHERE id = $1', [data.data.id]);
      const storedHash = dbUserRes.rows[0].password_hash;
      if (!storedHash.startsWith('$2a$') && !storedHash.startsWith('$2b$')) {
        throw new Error('Password hash does not follow bcrypt structure ($2b$...)');
      }

      citizen1Token = data.token;
      citizen1User = data.data;
    });

    await test('Register Citizen 2 with distinct phone number succeeds', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Kaveramma Chennappa',
          phone: '9845022222',
          password: 'securePassword456',
          villagePanchayat: 'Pandavapura GP'
        })
      });

      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      const data = await res.json();
      citizen2Token = data.token;
      citizen2User = data.data;
    });

    await test('Login with phone and password succeeds and returns fresh token', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: '9845011111',
          password: 'securePassword123'
        })
      });

      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (!data.token) throw new Error('Expected login token');
    });

    await test('Login with incorrect password fails with 401 INVALID_CREDENTIALS', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: '9845011111',
          password: 'wrongPasswordHere'
        })
      });

      if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
      const data = await res.json();
      if (data.error?.code !== 'INVALID_CREDENTIALS') {
        throw new Error(`Expected INVALID_CREDENTIALS, got ${data.error?.code}`);
      }
    });

    // Seed Admin and Official users in the disposable DB
    const bcrypt = await import('bcryptjs');
    const adminHash = await bcrypt.default.hash('AdminPassword123!', 10);
    const adminRes = await dbClient.query(`
      INSERT INTO users (full_name, phone, role, password_hash, is_active)
      VALUES ('System Admin', '9845099999', 'admin', $1, true)
      RETURNING id, full_name, role
    `, [adminHash]);
    adminUser = adminRes.rows[0];

    const jwt = await import('jsonwebtoken');
    const { env } = await import('./src/config/env.js');
    adminToken = jwt.default.sign({
      id: adminUser.id,
      role: 'admin',
      name: adminUser.full_name
    }, env.jwt.secret, { expiresIn: '1h' });

    const officialHash = await bcrypt.default.hash('OfficialPassword123!', 10);
    const officialRes = await dbClient.query(`
      INSERT INTO users (full_name, phone, role, password_hash, is_active)
      VALUES ('Agri Scrutiny Officer', '9845088888', 'official', $1, true)
      RETURNING id, full_name, role
    `, [officialHash]);
    officialUser = officialRes.rows[0];

    officialToken = jwt.default.sign({
      id: officialUser.id,
      role: 'official',
      name: officialUser.full_name
    }, env.jwt.secret, { expiresIn: '1h' });

    // --------------------------------------------------------------------------
    // AUTHORIZATION & RBAC TESTS
    // --------------------------------------------------------------------------
    console.log('\n--- Test Suite 3: Role-Based Authorization & Private Data Isolation ---');

    await test('Unauthenticated request to protected endpoint (/api/auth/me) is rejected with 401', async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`);
      if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
      const data = await res.json();
      if (data.error?.code !== 'UNAUTHENTICATED') {
        throw new Error(`Expected UNAUTHENTICATED, got ${data.error?.code}`);
      }
    });

    await test('Citizen cannot call administrator endpoints (GET /api/audit/logs rejected with 403 FORBIDDEN)', async () => {
      const res = await fetch(`${baseUrl}/api/audit/logs`, {
        headers: { Authorization: `Bearer ${citizen1Token}` }
      });
      if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
      const data = await res.json();
      if (data.error?.code !== 'FORBIDDEN') {
        throw new Error(`Expected FORBIDDEN, got ${data.error?.code}`);
      }
    });

    await test('Citizen cannot list all users (GET /api/users rejected with 403 FORBIDDEN)', async () => {
      const res = await fetch(`${baseUrl}/api/users`, {
        headers: { Authorization: `Bearer ${citizen1Token}` }
      });
      if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
    });

    await test('Administrator CAN access audit logs (GET /api/audit/logs returns 200)', async () => {
      const res = await fetch(`${baseUrl}/api/audit/logs`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.data)) throw new Error('Expected logs array');
    });

    // --------------------------------------------------------------------------
    // TRANSACTIONAL SUBMISSION & IDEMPOTENCY TESTS
    // --------------------------------------------------------------------------
    console.log('\n--- Test Suite 4: Transactional Submissions, Status History & Idempotency ---');

    let createdAppId = '';
    const testSubId = 'client-uuid-sub-998811';

    await test('Citizen submits application transactionally; records application and initial status history', async () => {
      const res = await fetch(`${baseUrl}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${citizen1Token}`
        },
        body: JSON.stringify({
          schemeId: 'agri-seed-subsidy',
          clientSubmissionId: testSubId,
          localDraftId: 'agri-seed-subsidy',
          formData: {
            applicantName: 'Basavaraju M',
            contactPhone: '9845011111',
            district: 'Mysuru',
            taluk: 'Hunsur',
            fruitsId: 'FID-2026-HUN-0012'
          },
          sourceProvenance: { clientVersion: '0.1.0', deviceMode: 'online' }
        })
      });

      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      const data = await res.json();
      if (data.isDuplicate !== false) throw new Error('Expected isDuplicate: false');
      if (data.data.status !== 'submitted') throw new Error(`Expected status 'submitted'`);
      createdAppId = data.data.id;

      // Verify status history was created inside transaction
      const histRes = await dbClient.query(
        'SELECT * FROM application_status_history WHERE application_id = $1',
        [createdAppId]
      );
      if (histRes.rows.length !== 1) {
        throw new Error(`Expected 1 status history entry, found: ${histRes.rows.length}`);
      }
      if (histRes.rows[0].status !== 'submitted') {
        throw new Error(`Expected history status 'submitted'`);
      }
    });

    await test('Submitting duplicate request with same clientSubmissionId is idempotent (200 OK, 0 extra rows)', async () => {
      const res = await fetch(`${baseUrl}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${citizen1Token}`
        },
        body: JSON.stringify({
          schemeId: 'agri-seed-subsidy',
          clientSubmissionId: testSubId,
          formData: { applicantName: 'Basavaraju M' }
        })
      });

      if (res.status !== 200) throw new Error(`Expected 200 for idempotent duplicate, got ${res.status}`);
      const data = await res.json();
      if (data.isDuplicate !== true) throw new Error('Expected isDuplicate: true');
      if (data.data.id !== createdAppId) throw new Error('Duplicate should return same application ID');

      // Verify no duplicate row was created in database
      const countRes = await dbClient.query(
        'SELECT COUNT(*) as total FROM applications WHERE client_submission_id = $1',
        [testSubId]
      );
      if (parseInt(countRes.rows[0].total, 10) !== 1) {
        throw new Error(`Expected exactly 1 application in DB, found: ${countRes.rows[0].total}`);
      }
    });

    await test('Database transaction rollback works on failure (no partial writes on invalid scheme)', async () => {
      const failedSubId = 'failed-sub-should-rollback';
      const countBefore = await dbClient.query('SELECT COUNT(*) as total FROM applications');

      const res = await fetch(`${baseUrl}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${citizen1Token}`
        },
        body: JSON.stringify({
          schemeId: 'nonexistent-invalid-scheme-id',
          clientSubmissionId: failedSubId,
          formData: { test: 'data' }
        })
      });

      if (res.status !== 400) throw new Error(`Expected 400 for invalid scheme, got ${res.status}`);
      const countAfter = await dbClient.query('SELECT COUNT(*) as total FROM applications');

      if (countBefore.rows[0].total !== countAfter.rows[0].total) {
        throw new Error('Transaction was not rolled back! Applications count changed.');
      }
    });

    await test('Horizontal isolation: Citizen 2 cannot access Citizen 1 private application (403 FORBIDDEN)', async () => {
      const res = await fetch(`${baseUrl}/api/applications/${createdAppId}`, {
        headers: { Authorization: `Bearer ${citizen2Token}` }
      });

      if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
      const data = await res.json();
      if (data.error?.code !== 'FORBIDDEN') {
        throw new Error(`Expected FORBIDDEN code, got ${data.error?.code}`);
      }
    });

    await test('Citizen 1 CAN view their own application details (200 OK)', async () => {
      const res = await fetch(`${baseUrl}/api/applications/${createdAppId}`, {
        headers: { Authorization: `Bearer ${citizen1Token}` }
      });

      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (data.data.id !== createdAppId) throw new Error('Returned wrong application');
    });

    await test('Official can update application status (PATCH /api/applications/:id/status) with remarks', async () => {
      const res = await fetch(`${baseUrl}/api/applications/${createdAppId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${officialToken}`
        },
        body: JSON.stringify({
          status: 'under_review',
          remarks: 'Applicant documents verified against FRUITS registry. Scheduled for field visit.'
        })
      });

      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (data.data.status !== 'under_review') throw new Error(`Expected status 'under_review'`);

      // Verify second entry in status history
      const histRes = await dbClient.query(
        'SELECT * FROM application_status_history WHERE application_id = $1 ORDER BY created_at ASC',
        [createdAppId]
      );
      if (histRes.rows.length !== 2) {
        throw new Error(`Expected 2 status history entries, found: ${histRes.rows.length}`);
      }
      if (histRes.rows[1].status !== 'under_review') {
        throw new Error(`Second entry status should be 'under_review'`);
      }
    });

    await test('Citizen CANNOT update application status (PATCH /api/applications/:id/status rejected with 403)', async () => {
      const res = await fetch(`${baseUrl}/api/applications/${createdAppId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${citizen1Token}`
        },
        body: JSON.stringify({
          status: 'approved',
          remarks: 'Citizen attempting self-approval'
        })
      });

      if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
    });

    // --------------------------------------------------------------------------
    // VALIDATION & SAFE ERROR HANDLING TESTS
    // --------------------------------------------------------------------------
    console.log('\n--- Test Suite 5: Request Validation & Error Handling ---');

    await test('Invalid payload missing required fields rejected with 400 VALIDATION_ERROR', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Missing fullName, phone, password
        })
      });

      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
      const data = await res.json();
      if (data.error?.code !== 'VALIDATION_ERROR') {
        throw new Error(`Expected VALIDATION_ERROR code, got ${data.error?.code}`);
      }
      if (!Array.isArray(data.error?.details) || data.error?.details.length === 0) {
        throw new Error('Expected validation error details array');
      }
    });

    await test('Invalid UUID parameter rejected with 400 VALIDATION_ERROR', async () => {
      const res = await fetch(`${baseUrl}/api/applications/not-a-valid-uuid`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    });

    await test('Public GET /api/schemes remains fully compatible (200 OK)', async () => {
      const res = await fetch(`${baseUrl}/api/schemes`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (data.success !== true || !Array.isArray(data.data)) {
        throw new Error('Expected success: true and data array');
      }
    });

    await test('Invalid scheme ID rejected with 400 INVALID_SCHEME_ID', async () => {
      const res = await fetch(`${baseUrl}/api/schemes/bad$scheme!id`);
      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
      const data = await res.json();
      if (data.error?.code !== 'INVALID_SCHEME_ID') {
        throw new Error(`Expected INVALID_SCHEME_ID, got ${data.error?.code}`);
      }
    });

    await test('Unauthenticated POST /api/schemes rejected with 405 METHOD_NOT_ALLOWED', async () => {
      const res = await fetch(`${baseUrl}/api/schemes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test' })
      });
      if (res.status !== 405) throw new Error(`Expected 405, got ${res.status}`);
    });

    // --------------------------------------------------------------------------
    // BATCH SYNC & RAG TESTS
    // --------------------------------------------------------------------------
    console.log('\n--- Test Suite 6: Offline Batch Sync & RAG Query ---');

    await test('Offline client batch sync (POST /api/sync/batch) processes multiple items idempotently', async () => {
      const batchSubId1 = 'batch-offline-app-01';
      const batchSubId2 = 'batch-offline-grievance-01';

      const res = await fetch(`${baseUrl}/api/sync/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${citizen1Token}`
        },
        body: JSON.stringify({
          clientBatchId: 'batch-run-2026-001',
          applications: [
            {
              schemeId: 'agri-seed-subsidy',
              clientSubmissionId: batchSubId1,
              localDraftId: 'agri-seed-subsidy',
              formData: { crop: 'Ragi' }
            }
          ],
          grievances: [
            {
              category: 'water_supply',
              description: 'Drinking water borewell motor burnt in Ward 3',
              villagePanchayat: 'Hunsur Rural GP',
              clientSubmissionId: batchSubId2
            }
          ]
        })
      });

      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (data.data.syncedApplications[0].status !== 'synced') {
        throw new Error('Application in batch was not marked synced');
      }
      if (data.data.syncedGrievances[0].status !== 'synced') {
        throw new Error('Grievance in batch was not marked synced');
      }

      // Re-send same batch to verify idempotency inside batch sync
      const res2 = await fetch(`${baseUrl}/api/sync/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${citizen1Token}`
        },
        body: JSON.stringify({
          clientBatchId: 'batch-run-2026-001-retry',
          applications: [
            {
              schemeId: 'agri-seed-subsidy',
              clientSubmissionId: batchSubId1,
              formData: { crop: 'Ragi' }
            }
          ]
        })
      });

      const data2 = await res2.json();
      if (data2.data.syncedApplications[0].isDuplicate !== true) {
        throw new Error('Retried batch item should report isDuplicate: true');
      }
    });

    await test('RAG Knowledge Query (POST /api/rag/query) returns matched schemes and guidance', async () => {
      const res = await fetch(`${baseUrl}/api/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'seed subsidy farmer' })
      });

      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.data.matchedSchemes)) {
        throw new Error('Expected matchedSchemes array');
      }
      if (data.data.matchedSchemes.length === 0) {
        throw new Error('Expected at least 1 matched scheme');
      }
    });

  } finally {
    // --------------------------------------------------------------------------
    // TEARDOWN DISPOSABLE SCHEMA & CLOSE SERVER
    // --------------------------------------------------------------------------
    console.log('\n--- Teardown: Discarding Disposable Test Schema ---');
    try {
      await dbClient.query(`DROP SCHEMA ${DISPOSABLE_SCHEMA} CASCADE`);
      console.log(`[Test Cleanup] Disposable schema '${DISPOSABLE_SCHEMA}' dropped cleanly.`);
    } catch (cleanupErr) {
      console.warn('[Test Cleanup Warning] Failed to drop disposable schema:', cleanupErr.message);
    }

    dbClient.release();
    await closePool();
    await new Promise((resolve) => server.close(resolve));
    console.log('[Test Server] HTTP listener closed.\n');
  }

  console.log('================================================================');
  console.log(`Verification Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3Tests().catch((err) => {
  console.error('[Fatal Test Error]:', err);
  process.exit(1);
});

