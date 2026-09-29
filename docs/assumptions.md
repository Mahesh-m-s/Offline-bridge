# OfflineBridge — Engineering Assumptions & Design Decisions

This document logs all architectural, data modeling, and engineering assumptions made during the design and implementation of OfflineBridge.

---

### 1. Database Architecture & Local Environment Resilience
- **PostgreSQL JSONB:** PostgreSQL was chosen as specified in the PRD and prompt for its native `JSONB` support. All variable form submissions and eligibility rules are stored as structured JSONB documents.
- **Connection Policy:** PostgreSQL is required for normal development and production. A seeded in-memory repository implementation is selected only with `NODE_ENV=test` or `USE_MOCK_DB=true`; connection failures otherwise stop startup rather than hiding data loss behind a fallback.
- **Idempotency via `client_uuid`:** Every submission and grievance includes a standard UUID (`client_uuid`), enforced as `UNIQUE NOT NULL`. Repeated sync uses `ON CONFLICT (client_uuid) DO UPDATE SET synced_at = NOW() RETURNING *`, preserving one record while acknowledging a retry.

---

### 2. Sample Government Services & Schema Fields
Four representative rural government service forms are seeded by `server/src/migrations/seed.js` and mirrored in client defaults:

1. **Kisan Credit Card (KCC) Application (`kisan_credit`)**:
   - Applicant Full Name (`text`, required)
   - Aadhaar Number (`text`, 12 digits, required)
   - Land Holding in Acres (`number`, min: 0.1, required)
   - Crop Type (`select`: Kharif, Rabi, Both, Horticulture)
   - Credit Amount Requested (`number`, min: 10000, required)
   - Bank Account Number (`text`, required)
   - IFSC Code (`text`, required)

2. **PM-Kisan Samman Nidhi Enrollment (`pm_kisan`)**:
   - Farmer Name (`text`, required)
   - Mobile Number (`tel`, 10 digits, required)
   - Survey / Khatoni Number (`text`, required)
   - Land Category (`select`: Marginal < 1ha, Small 1-2ha, Medium > 2ha)
   - Village / Panchayat (`text`, required)
   - District (`text`, required)

3. **Post-Matric Rural Scholarship (`post_matric_scholarship`)**:
   - Student Name (`text`, required)
   - Institute / College Name (`text`, required)
   - Course & Year (`select`: PUC/12th, Diploma, Undergraduate, Postgraduate)
   - Annual Household Income (`number`, max: 250000, required)
   - Category (`select`: SC, ST, OBC, EWS, General)
   - Previous Year Percentage (`number`, min: 35, max: 100, required)

4. **Caste & Income Certificate Registration (`caste_income_certificate`)**:
   - Citizen Full Name (`text`, required)
   - Father / Guardian Name (`text`, required)
   - Sub-Caste (`text`, required)
   - Total Family Annual Income (INR) (`number`, required)
   - Residential Address (`textarea`, required)
   - Delivery Mode (`select`: Digital Copy, Panchayat Office Pickup)

---

### 3. Scheme Eligibility Rules Dataset (`schemes.json`)
The client-side eligibility engine evaluates against 6 schemes with deterministic numerical & categorical rules:

1. **PM-Kisan Samman Nidhi**:
   - Max Land Ownership: 5 acres
   - Allowed Categories: All
   - Max Annual Income: ₹200,000
   - Benefit: ₹6,000 / year direct benefit transfer.
2. **Post-Matric Rural Scholarship**:
   - Min Age: 16, Max Age: 28
   - Student Status: True
   - Max Annual Income: ₹250,000
   - Allowed Categories: SC, ST, OBC, EWS
   - Benefit: 100% tuition reimbursement + monthly stipend.
3. **Pradhan Mantri Awas Yojana (Gramin)**:
   - Max Annual Income: ₹150,000
   - Land Ownership: Landless or Marginal
   - Benefit: ₹120,000 financial assistance for pucca house construction.
4. **National Old Age Pension Scheme**:
   - Min Age: 60
   - Max Annual Income: ₹100,000
   - Benefit: ₹1,500 monthly pension.
5. **Agricultural Equipment Modernization Subsidy**:
   - Occupation: Farmer
   - Land Ownership: Marginal or Small (<= 2 acres)
   - Benefit: 50% subsidy on solar water pumps, drip irrigation, and tillers.
6. **Rural Girl Child Higher Education Grant**:
   - Gender: Female (or family with girl child studying)
   - Max Annual Income: ₹300,000
   - Benefit: ₹50,000 one-time higher education incentive.

---

### 4. Background Sync Engine Protocol
- **Trigger Events:**
  - Automatic on `window.addEventListener('online')`
  - Automatic on app initialization / page reload if network is detected
  - Manual on demand when user clicks the "Sync Now" button in the navigation bar
- **Exponential Backoff:**
  - Base delay: 1,000 ms (1s)
  - Multiplier: $2^{\text{retryCount}}$
  - Maximum jitter / backoff cap: 30,000 ms (30s)
  - Max Retries: 5 attempts. If 5 consecutive attempts fail, the submission moves to `status: 'failed'` and prompts the user with an explicit "Tap to retry" action.
- **Atomic State Updates:**
  - An item is marked `'syncing'` in Dexie before network dispatch to prevent race conditions during rapid reconnect spikes.
  - Upon 200/201 response, `syncStatus` becomes `'synced'`, and `synced_at` is updated locally.

---

### 5. Authentication & Storage Scope
- Auth tokens (JWT) are stored in `localStorage` under `offlinebridge_token` alongside user metadata in `offlinebridge_user`.
- Forms and sync queues reside strictly in IndexedDB via Dexie (`OfflineBridgeDB`) to keep sensitive credential lifecycle decoupled from offline form persistence.
- A default demo citizen profile is seeded (`phone: 9876543210`, `password: rural123`) with a 1-click test button so evaluators can inspect authenticated flows without manual registration.

## Client offline implementation (2026-09-29)

- Browser form values and grievance drafts are persisted in IndexedDB so that a tab refresh or network interruption does not discard in-progress work. The app never stores passwords there; the existing JWT storage remains in `localStorage`.
- Form/catalog refreshes are best-effort. Seeded local catalogs keep the main service and eligibility flows available when the API cannot be reached.
- Queued submissions require an authenticated user when synchronization reaches the API. A 401 leaves the records queued and asks the user to sign in again.
- Background Sync is supplemental because browser support and service-worker lifetimes vary. The app also drains the durable queue at startup, on focus, reconnect, and manual retry.
- Application images use original vector artwork and CSS illustration; external government portals are shown as plain links without third-party visual assets.
- Low-data mode disables decorative animation and effects; it does not alter submitted data or service behavior.

### 6. Database and API Implementation Notes
- Migrations are plain SQL, applied in filename order within individual transactions and recorded in `schema_migrations`.
- Container startup waits for PostgreSQL health, then applies migrations and idempotent seeds before serving `/api/v1`.
- Seeded submission examples cover pending, under-review, approved, and rejected; grievance examples cover open, in-progress, resolved, and rejected.
- API documentation is served at `/api-docs`; its machine-readable OpenAPI document is available at `/api-docs.json`.
