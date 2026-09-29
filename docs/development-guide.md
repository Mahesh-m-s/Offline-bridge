# OfflineBridge — Development & Operation Guide

This guide details the system architecture, setup instructions, background sync engine operation, database migrations, and testing workflows for **OfflineBridge**.

---

## 1. System Architecture

OfflineBridge adopts a decoupled offline-first architecture:

```
+-------------------------------------------------------------------------+
|                        OfflineBridge Client (PWA)                      |
|                                                                         |
|  +-------------------+      +------------------+      +---------------+ |
|  |   React UI Views  | ---> | Dexie (IndexedDB)| <--- | ServiceWorker | |
|  | (Forms/Tracker/...) |      | - submissions    |      | (Workbox Shell| |
|  +-------------------+      | - grievances     |      |  Precaching)  | |
|            |                | - cachedForms    |      +---------------+ |
|            v                +------------------+                        |
|  +-------------------+               |                                  |
|  |  Sync Engine      | <-------------+ (Read pending records)           |
|  |  (Exponential     |                                                  |
|  |   Backoff & Retry)| ------------------------------------+            |
+-------------------------------------------------------------|-----------+
                                                              | POST /api/...
                                                              v
+-------------------------------------------------------------------------+
|                        Node.js / Express Server                         |
|                                                                         |
|  +-------------------+      +------------------+      +---------------+ |
|  | API Controllers   | ---> | Database Layer   | ---> | PostgreSQL DB | |
|  | (Auth, Forms,     |      | (pg.Pool /       |      | (Tables with  | |
|  |  Submissions, ...) |      |  ON CONFLICT)    |      |  JSONB cols)  | |
|  +-------------------+      +------------------+      +---------------+ |
+-------------------------------------------------------------------------+
```

---

## 2. Prerequisites & Environment Setup

- **Node.js**: v18+ (tested on v24)
- **PostgreSQL**: v13+ (or default connection fallback)
- **NPM**: v9+

### Backend Environment Configuration
In `server/.env` (copy from `server/.env.example`):
```env
PORT=5000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/offlinebridge
JWT_SECRET=supersecret_offlinebridge_jwt_token_key_2026
NODE_ENV=development
```

---

## 3. Installation & Startup

### Step 1: Install Dependencies
```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### Step 2: Database Setup & Seeding
```bash
# From server/
npm run migrate
npm run seed
```
This applies `server/src/migrations/001_init.sql` (creating tables with `client_uuid` constraints and `JSONB` columns) and seeds 4 sample government service forms, 6 schemes, and demo user accounts.

### Step 3: Run the Application
In terminal 1 (Backend Server):
```bash
cd server
npm run dev
```
Server starts on `http://localhost:5000`.

In terminal 2 (Frontend Client PWA):
```bash
cd client
npm run dev
```
Client starts on `http://localhost:5173` with reverse proxy to `http://localhost:5000/api`.

---

## 4. Background Sync Protocol & Engine Mechanics

The background sync engine is implemented in `client/src/sync/syncEngine.js`. Here is the lifecycle of an offline submission:

1. **Submission Generation:**
   - When the user clicks "Submit" on a service form or grievance, the client generates a unique `client_uuid` using RFC 4122 v4.
   - The payload is written to Dexie IndexedDB with `syncStatus: 'pending'` and `retryCount: 0`.
   - The user immediately receives a success notification: *"Form saved offline! Will auto-sync when connected."*

2. **Sync Triggers:**
   - **Auto-Sync:** Registered via `window.addEventListener('online', triggerSync)`.
   - **App Boot Sync:** Executed on initial React tree mount if `navigator.onLine === true`.
   - **Manual Trigger:** Activated whenever the user clicks the "Sync Now" button on the UI header.

3. **Transmission & Idempotency:**
   - The engine queries Dexie: `submissions.where('syncStatus').equals('pending')`.
   - Each item's status is atomically switched to `'syncing'`.
   - The payload is dispatched to `POST /api/submissions`.
   - On the backend, PostgreSQL handles the query with:
     ```sql
     INSERT INTO submissions (user_id, form_id, data_json, status, client_uuid, created_at, synced_at)
     VALUES ($1, $2, $3, 'submitted', $4, $5, NOW())
     ON CONFLICT (client_uuid) DO UPDATE SET synced_at = NOW()
     RETURNING *;
     ```
   - If a network failure occurs midway through response transmission and the client retries, PostgreSQL recognizes the existing `client_uuid` and prevents duplicate rows.

4. **Exponential Backoff & Failure Handling:**
   - If an error occurs (e.g. server timeout or network drop during transmission), the engine catches the exception:
     $$\text{delay} = \min(1000 \times 2^{\text{retryCount}}, 30000)$$
   - The item's `retryCount` is incremented.
   - If `retryCount >= 5`, the item is marked `syncStatus: 'failed'` and an alert appears in the UI offering a manual retry button.

---

## 5. Offline Demonstration & Verification Steps

To test and verify the full offline capabilities:

1. **Open DevTools:** Open Google Chrome or Microsoft Edge DevTools on `http://localhost:5173`.
2. **Inspect PWA:** Open the **Application** tab -> **Manifest** & **Service Workers**. Verify the manifest is registered and the service worker is active.
3. **Simulate Offline:** In DevTools, go to **Network** -> change "No throttling" to **Offline**.
4. **Fill & Save Form:**
   - Navigate to "Available Services" -> "Kisan Credit Card (KCC)".
   - Fill out the form fields and click "Submit Application".
   - Notice the form completes instantly, showing the offline badge, and the header badge displays `1 Pending Sync`.
5. **Inspect IndexedDB:** In DevTools -> **Application** -> **IndexedDB** -> `OfflineBridgeDB` -> `submissions`. Observe the record with `syncStatus: "pending"`.
6. **Simulate Reconnect:** Switch DevTools Network back to **Online** (or "Fast 3G").
7. **Verify Auto-Sync:** The sync engine triggers immediately. The header badge switches to "All Synced" (green), and in the database, the record is inserted with its `client_uuid`.
8. **Verify Idempotency:** Click "Sync Now" repeatedly or trigger duplicate syncs. Verify that only 1 record exists in the database for that `client_uuid`.
