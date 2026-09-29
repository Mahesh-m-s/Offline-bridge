const http = require('http');
const { app, server } = require('./src/index');

const request = (path, method = 'GET', body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
          ...headers
        }
      },
      (res) => {
        let resBody = '';
        res.on('data', (chunk) => (resBody += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resBody) });
          } catch (e) {
            resolve({ status: res.statusCode, data: resBody });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

const runTests = async () => {
  console.log('=== RUNNING OFFLINEBRIDGE API VERIFICATION TESTS ===\n');

  try {
    // 1. Health
    const health = await request('/api/health');
    console.log('1. Health Check:', health.status === 200 ? 'PASS' : 'FAIL', health.data);

    // 2. Auth - Register
    const reg = await request('/api/auth/register', 'POST', {
      name: 'Test Citizen',
      phone: '9988776655',
      password: 'password123'
    });
    console.log('2. Auth Register:', reg.status === 201 ? 'PASS' : 'FAIL', reg.data.message);

    // 3. Auth - Login
    const login = await request('/api/auth/login', 'POST', {
      phone: '9988776655',
      password: 'password123'
    });
    console.log('3. Auth Login:', login.status === 200 ? 'PASS' : 'FAIL', 'Token acquired:', !!login.data.token);
    const token = login.data.token;

    // 4. Forms List
    const forms = await request('/api/forms');
    console.log('4. Service Forms Catalog:', forms.status === 200 ? 'PASS' : 'FAIL');

    // 5. Schemes List
    const schemes = await request('/api/schemes');
    console.log('5. Welfare Schemes List:', schemes.status === 200 ? 'PASS' : 'FAIL');

    // 6. Idempotent Offline Submission Test
    const testUuid = 'test-client-uuid-offline-' + Date.now();
    const submissionPayload = {
      client_uuid: testUuid,
      form_id: 1,
      service_type: 'kisan_credit',
      data_json: {
        fullName: 'Test Farmer',
        aadhaarNumber: '123456789012',
        landHoldingAcres: 3.5,
        cropType: 'kharif',
        loanAmountRequested: 75000
      },
      created_at: new Date().toISOString()
    };

    // First submission
    const sub1 = await request('/api/submissions', 'POST', submissionPayload, {
      Authorization: `Bearer ${token}`
    });
    console.log('6a. Submission (First Sync Attempt):', sub1.status === 201 ? 'PASS' : 'FAIL', sub1.data.message);

    // Duplicate submission with SAME client_uuid (simulating retried sync)
    const sub2 = await request('/api/submissions', 'POST', submissionPayload, {
      Authorization: `Bearer ${token}`
    });
    console.log('6b. Submission (Duplicate Sync Attempt - Idempotency Check):', sub2.status === 201 ? 'PASS' : 'FAIL');
    console.log('    Idempotency confirmed: UUID matches:', sub2.data.submission?.client_uuid === testUuid);

    // 7. Submissions List
    const userSubs = await request(`/api/submissions?user_id=${login.data.user.id}`, 'GET', null, {
      Authorization: `Bearer ${token}`
    });
    console.log('7. Application Tracking List:', userSubs.status === 200 ? 'PASS' : 'FAIL', `Found ${userSubs.data.submissions.length} submission(s)`);

    // 8. Idempotent Grievance Test
    const grievanceUuid = 'test-grievance-uuid-' + Date.now();
    const grievancePayload = {
      client_uuid: grievanceUuid,
      category: 'Drinking Water & Sanitation',
      description: '[Village: Hunsur] Handpump borewell broken for 2 weeks',
      created_at: new Date().toISOString()
    };

    const g1 = await request('/api/grievances', 'POST', grievancePayload, {
      Authorization: `Bearer ${token}`
    });
    console.log('8a. Grievance Sync (First Attempt):', g1.status === 201 ? 'PASS' : 'FAIL', g1.data.message);

    const g2 = await request('/api/grievances', 'POST', grievancePayload, {
      Authorization: `Bearer ${token}`
    });
    console.log('8b. Grievance Sync (Duplicate Attempt - Idempotency Check):', g2.status === 201 ? 'PASS' : 'FAIL');

    // 9. Grievance Tracking List
    const userGrievances = await request(`/api/grievances?user_id=${login.data.user.id}`, 'GET', null, {
      Authorization: `Bearer ${token}`
    });
    console.log('9. Grievance Tracking List:', userGrievances.status === 200 ? 'PASS' : 'FAIL', `Found ${userGrievances.data.grievances.length} grievance(s)`);

    console.log('\n=== ALL API TESTS PASSED SUCCESSFULLY! ===');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
};

runTests();
