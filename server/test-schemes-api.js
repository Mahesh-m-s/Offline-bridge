/**
 * OfflineBridge Schemes API & 1,000+ Ingestion Integration Test Suite
 * Validates:
 * 1. Health & Database connectivity
 * 2. 1,000+ records server-side pagination (limit, page, totalRecords, totalPages)
 * 3. Page navigation and distinct record slicing
 * 4. Upper bound limit capping (<= 100)
 * 5. Parameterized text search across titles, descriptions, and service codes
 * 6. Category filtering
 * 7. 4-way Service Type filtering (scheme, service, certificate, welfare_benefit)
 * 8. Safe sorting and SQL injection defense
 * 9. Live Database Statistics Endpoint (totalSchemes >= 1000, byCategory, byServiceType)
 * 10. Ingestion Jobs History Endpoint (/api/schemes/ingestion-jobs)
 * 11. Data Health & Verification Status Endpoint (/api/schemes/audit-health)
 */

import http from 'http';

const BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:5000';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    }).on('error', reject);
  });
}

console.log('================================================================');
console.log('=== OfflineBridge: 1,000+ Schemes API & Governance Suite     ===');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Test Suite 1: Health & Database Connectivity
// -----------------------------------------------------------------------------
console.log('--- Test Suite 1: Backend Health & Database Connection ---');
const health = await get('/api/health');
assert(health.status === 200, 'Health endpoint responds with HTTP 200');
assert(health.data.database?.connected === true, 'Database is connected and healthy');

// -----------------------------------------------------------------------------
// Test Suite 2: Default Pagination & Metadata Contract (1,000+ Scale)
// -----------------------------------------------------------------------------
console.log('\n--- Test Suite 2: Default Pagination & Response Contract ---');
const resAll = await get('/api/schemes');
assert(resAll.status === 200, 'GET /api/schemes responds with HTTP 200');
assert(resAll.data.success === true, 'Response contract contains success: true');
assert(Array.isArray(resAll.data.data), 'Response data is an array');
assert(resAll.data.pagination !== undefined, 'Pagination object is present');
assert(resAll.data.pagination.totalRecords >= 1000, `Total records in database reaches 1,000+ target (${resAll.data.pagination.totalRecords})`);
assert(resAll.data.pagination.page === 1, 'Default page is 1');
assert(resAll.data.pagination.limit === 20, 'Default limit is 20');
assert(resAll.data.pagination.totalPages >= 50, `Total pages calculated correctly (>= 50 pages, actual: ${resAll.data.pagination.totalPages})`);

// -----------------------------------------------------------------------------
// Test Suite 3: Page Navigation & Distinct Slicing
// -----------------------------------------------------------------------------
console.log('\n--- Test Suite 3: Page Navigation & Distinct Record Slices ---');
const page1 = await get('/api/schemes?page=1&limit=5');
const page2 = await get('/api/schemes?page=2&limit=5');
assert(page1.data.data.length === 5, 'Page 1 returns exactly 5 records');
assert(page2.data.data.length === 5, 'Page 2 returns exactly 5 records');
assert(page1.data.pagination.hasNextPage === true, 'Page 1 reports hasNextPage: true');
assert(page1.data.pagination.hasPreviousPage === false, 'Page 1 reports hasPreviousPage: false');
assert(page2.data.pagination.hasNextPage === true, 'Page 2 reports hasNextPage: true');
assert(page2.data.pagination.hasPreviousPage === true, 'Page 2 reports hasPreviousPage: true');

const p1Ids = new Set(page1.data.data.map(s => s.id));
const p2Ids = new Set(page2.data.data.map(s => s.id));
const intersection = [...p1Ids].filter(id => p2Ids.has(id));
assert(intersection.length === 0, 'Page 1 and Page 2 contain completely distinct records (no duplicates)');

// -----------------------------------------------------------------------------
// Test Suite 4: Limit Capping & Safety
// -----------------------------------------------------------------------------
console.log('\n--- Test Suite 4: Limit Validation & Upper Bound Capping ---');
const capped = await get('/api/schemes?limit=150');
assert(capped.data.pagination.limit === 100, 'Limit above 100 is capped safely to 100');

// -----------------------------------------------------------------------------
// Test Suite 5: Text Search Filter
// -----------------------------------------------------------------------------
console.log('\n--- Test Suite 5: Parameterized Text Search ---');
const searchRes = await get('/api/schemes?search=fertilizer');
assert(searchRes.data.data.length >= 1, 'Search for "fertilizer" returns matching agricultural records');
assert(searchRes.data.data.some(s => s.title.includes('Fertilizer') || s.description.includes('fertilizer')), 'Matched records contain search term');

// -----------------------------------------------------------------------------
// Test Suite 6: Category Filter
// -----------------------------------------------------------------------------
console.log('\n--- Test Suite 6: Category Filtering ---');
const farmerRes = await get('/api/schemes?category=farmer&limit=20');
assert(farmerRes.data.data.length > 0, 'Category "farmer" returns records');
assert(farmerRes.data.data.every(s => s.category === 'farmer'), 'All returned records have category: "farmer"');

// -----------------------------------------------------------------------------
// Test Suite 7: 4-Way Service Type Filtering
// -----------------------------------------------------------------------------
console.log('\n--- Test Suite 7: 4-Way Service Type Filtering ---');
const certRes = await get('/api/schemes?service_type=certificate&limit=10');
assert(certRes.data.data.length > 0, 'Filter service_type=certificate returns statutory certificates');
assert(certRes.data.data.every(s => s.service_type === 'certificate'), 'All returned records have service_type: "certificate"');
assert(certRes.data.pagination.totalRecords >= 30, `Total certificates available: ${certRes.data.pagination.totalRecords}`);

const svcRes = await get('/api/schemes?service_type=service&limit=10');
assert(svcRes.data.data.length > 0, 'Filter service_type=service returns citizen services');
assert(svcRes.data.data.every(s => s.service_type === 'service'), 'All returned records have service_type: "service"');

const schRes = await get('/api/schemes?service_type=scheme&limit=10');
assert(schRes.data.data.length > 0, 'Filter service_type=scheme returns welfare schemes');
assert(schRes.data.data.every(s => s.service_type === 'scheme'), 'All returned records have service_type: "scheme"');

const wlfRes = await get('/api/schemes?service_type=welfare_benefit&limit=10');
assert(wlfRes.data.data.length > 0, 'Filter service_type=welfare_benefit returns entitlements');
assert(wlfRes.data.data.every(s => s.service_type === 'welfare_benefit'), 'All returned records have service_type: "welfare_benefit"');

// -----------------------------------------------------------------------------
// Test Suite 8: Sorting Allowlist & SQL Injection Defense
// -----------------------------------------------------------------------------
console.log('\n--- Test Suite 8: Safe Sorting & SQL Injection Defense ---');
const sortDesc = await get('/api/schemes?sort=title&order=desc&limit=5');
assert(sortDesc.data.data.length === 5, 'Sorting by title descending returns top records');

const injection = await get("/api/schemes?sort=title;DROP+TABLE+users;--");
assert(injection.status === 200, 'Malicious sort parameter handled safely (falls back to allowlist column)');

// -----------------------------------------------------------------------------
// Test Suite 9: Live Statistics Endpoint with Service Taxonomy
// -----------------------------------------------------------------------------
console.log('\n--- Test Suite 9: Live Database Statistics Endpoint ---');
const statsRes = await get('/api/schemes/stats');
assert(statsRes.status === 200, 'GET /api/schemes/stats responds with HTTP 200');
assert(statsRes.data.data.totalSchemes >= 1000, `Stats reports totalSchemes >= 1,000 (${statsRes.data.data.totalSchemes})`);
assert(statsRes.data.data.activeSchemes >= 1000, `Stats reports activeSchemes >= 1,000 (${statsRes.data.data.activeSchemes})`);
assert(statsRes.data.data.byServiceType !== undefined, 'Stats reports byServiceType taxonomy breakdown');
assert(statsRes.data.data.byServiceType.scheme >= 300, `Schemes count: ${statsRes.data.data.byServiceType.scheme}`);
assert(statsRes.data.data.byServiceType.service >= 500, `Citizen services count: ${statsRes.data.data.byServiceType.service}`);
assert(statsRes.data.data.byServiceType.certificate >= 30, `Statutory certificates count: ${statsRes.data.data.byServiceType.certificate}`);
assert(statsRes.data.data.byServiceType.welfare_benefit >= 5, `Welfare benefits count: ${statsRes.data.data.byServiceType.welfare_benefit}`);

// -----------------------------------------------------------------------------
// Test Suite 10: Ingestion Jobs History Endpoint
// -----------------------------------------------------------------------------
console.log('\n--- Test Suite 10: Ingestion Jobs Monitoring Endpoint ---');
const jobsRes = await get('/api/schemes/ingestion-jobs');
assert(jobsRes.status === 200, 'GET /api/schemes/ingestion-jobs responds with HTTP 200');
assert(jobsRes.data.success === true, 'Response contract contains success: true');
assert(Array.isArray(jobsRes.data.data), 'Ingestion jobs data is an array');
assert(jobsRes.data.data.length > 0, 'At least 1 completed ingestion job is recorded');
assert(jobsRes.data.data[0].status === 'completed', `Latest ingestion job status is completed (${jobsRes.data.data[0].status})`);
assert(jobsRes.data.data[0].imported_count >= 1000, `Latest job recorded >= 1,000 imports (${jobsRes.data.data[0].imported_count})`);

// -----------------------------------------------------------------------------
// Test Suite 11: Data Health & Verification Status Endpoint
// -----------------------------------------------------------------------------
console.log('\n--- Test Suite 11: Data Health & Audit Metrics Endpoint ---');
const healthRes = await get('/api/schemes/audit-health');
assert(healthRes.status === 200, 'GET /api/schemes/audit-health responds with HTTP 200');
assert(healthRes.data.success === true, 'Response contract contains success: true');
assert(healthRes.data.data.verificationStatus !== undefined, 'Verification status distribution is present');
assert(healthRes.data.data.outdatedSchemes === 0, `Outdated schemes count is 0 (${healthRes.data.data.outdatedSchemes})`);
assert(healthRes.data.data.failedJobsCount === 0, `Failed jobs count is 0 (${healthRes.data.data.failedJobsCount})`);
assert(Object.keys(healthRes.data.data.sourcePortals).length >= 10, `At least 10 official source portals recorded (${Object.keys(healthRes.data.data.sourcePortals).length})`);

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`Verification Summary: ${passed} Passed, ${failed} Failed`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
}
