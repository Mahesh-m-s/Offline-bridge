# Implementation Plan: OfflineBridge PWA

OfflineBridge is an offline-first Progressive Web App (PWA) designed for rural digital services (government welfare schemes, form submissions, and grievance tracking) under low or intermittent internet connectivity.

## Current Repository Analysis

- **Workspace Root:** `c:\Users\AKASH\Documents\Offline-bridge`
- **Existing Files:**
  - `README.md`: Basic 3-line project description.
  - `docs/OfflineBridge_PRD.md`: Comprehensive Product Requirements Document outlining goals, user personas, MVP features, data model, and tech stack.
  - `docs/synopsis_d4_final.pdf`: Approved academic project synopsis (NIE Dept of ISE).
- **Current State:** Greenfield / initialization stage. Git repository is initialized with 2 initial commits, but no application code, package configurations, client, or server directories exist yet.

---

## User Review Required

> [!IMPORTANT]
> **Database Selection**: The PRD recommends PostgreSQL for native `JSONB` support (flexible form schemas and payloads), but permits MySQL if preferred. We recommend **PostgreSQL** (using `pg` driver) for maximum schema flexibility, with MySQL as an alternative.
> **PWA Strategy**: We will use `vite-plugin-pwa` (powered by Workbox) for declarative Service Worker management, asset precaching, and runtime caching.

---

## Recommended Project Structure

```text
Offline-bridge/
├── client/                      # Frontend PWA (React + Vite + Dexie + Workbox)
│   ├── public/                  # Static icons, manifest.webmanifest
│   ├── src/
│   │   ├── api/                 # Axios / fetch clients & API endpoints
│   │   ├── components/          # Reusable UI (Navbar, NetworkBadge, FormRenderer, etc.)
│   │   ├── context/             # AuthContext, NetworkContext, SyncContext
│   │   ├── data/                # Seed schemas (services, government schemes)
│   │   ├── db/                  # Dexie.js IndexedDB schema & repository helpers
│   │   ├── hooks/               # useNetworkStatus, useAutoDraft, useSync
│   │   ├── pages/               # Home, Services, FormView, Eligibility, Tracking, Grievance, Login
│   │   ├── services/            # Background sync engine, eligibility evaluator
│   │   ├── styles/              # Global styles, high-contrast, accessible CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js           # Vite + PWA configuration
│   └── package.json
├── server/                      # Backend REST API (Node.js + Express + DB)
│   ├── src/
│   │   ├── config/              # Database connection & env variables
│   │   ├── controllers/         # Auth, forms, submissions, schemes, grievances
│   │   ├── middleware/          # JWT verification, error handling, validation
│   │   ├── models/              # DB queries & schema definition (schema.sql)
│   │   ├── routes/              # Express route definitions
│   │   └── app.js               # Express application configuration
│   ├── .env.example
│   ├── server.js                # Server entry point
│   └── package.json
├── docs/                        # PRD and project documentation (preserved)
├── .gitignore                   # Root ignore (node_modules, .env, dist)
└── README.md                    # Project overview and setup instructions
```

---

## Detailed Development Milestones

### Milestone 1: Project Architecture Setup & Root Configuration
- **What we will build**:
  - Root `.gitignore` configured for Node.js, Vite, build artifacts (`dist/`), environment files (`.env`), and OS files.
  - Setup directory placeholders for `client/` and `server/`.
- **Files/Folders created/modified**:
  - `[NEW] .gitignore`
  - `[NEW] client/`
  - `[NEW] server/`
- **How we will test it**:
  - Run git status to verify untracked files are correctly matched by `.gitignore` (e.g., node_modules or temp files are ignored).
- **Git Commit**:
  - `chore: initialize client and server project structure and gitignore`

---

### Milestone 2: Frontend Foundation with React + Vite
- **What we will build**:
  - Scaffold the React client using Vite.
  - Set up accessible, mobile-first design tokens with large touch targets, legible fonts, and clear navigation (Navbar, Footer, placeholder pages for Home, Services, Eligibility, Tracking, Grievances).
  - Configure client-side routing with `react-router-dom`.
- **Files/Folders created/modified**:
  - `[NEW] client/package.json`
  - `[NEW] client/vite.config.js`
  - `[NEW] client/index.html`
  - `[NEW] client/src/main.jsx`
  - `[NEW] client/src/App.jsx`
  - `[NEW] client/src/styles/index.css`
  - `[NEW] client/src/components/Navbar.jsx`
  - `[NEW] client/src/pages/HomePage.jsx`
  - `[NEW] client/src/pages/ServicesPage.jsx`
- **How we will test it**:
  - Run `npm run dev` inside `client/`.
  - Open `http://localhost:5173` in the browser, verify layout is responsive on mobile viewport emulation, and navigation links switch views without page reloads.
- **Git Commit**:
  - `feat(client): scaffold React Vite client with accessible navigation and routing`

---

### Milestone 3: Progressive Web App (PWA) & Service Worker Offline Shell
- **What we will build**:
  - Configure `vite-plugin-pwa` with Workbox to handle service worker registration.
  - Create the Web App Manifest (`manifest.webmanifest`) with app name, theme color, display mode `standalone`, and app icons.
  - Configure precaching for the App Shell (HTML, CSS, JS, static icons) so the entire application shell boots without an internet connection.
  - Implement an install prompt banner for mobile/desktop home screen installation.
- **Files/Folders created/modified**:
  - `[MODIFY] client/vite.config.js`
  - `[NEW] client/public/manifest.webmanifest`
  - `[NEW] client/public/icons/` (app icons)
  - `[NEW] client/src/components/InstallPrompt.jsx`
  - `[NEW] client/src/registerServiceWorker.js`
- **How we will test it**:
  - Build the production client (`npm run build`) and preview (`npm run preview`).
  - In Chrome/Edge DevTools:
    1. Inspect **Application > Service Workers** — ensure service worker is active and running.
    2. Inspect **Application > Manifest** — verify all manifest metadata is valid.
    3. Check **Application > Service Workers > Offline** checkbox (or disconnect network), reload the page: the entire app shell must load cleanly with 0 network requests.
- **Git Commit**:
  - `feat(pwa): configure service worker caching, offline shell, and manifest`

---

### Milestone 4: Offline Data Layer with Dexie.js (IndexedDB)
- **What we will build**:
  - Configure Dexie.js to manage client-side IndexedDB (`OfflineBridgeDB`).
  - Define stores:
    - `services`: cached government services and form schemas.
    - `drafts`: in-progress form inputs keyed by form ID.
    - `submissions`: completed form submissions with sync status flags (`pending_sync`, `syncing`, `synced`, `failed`).
    - `schemes`: cached welfare schemes for offline eligibility evaluation.
    - `grievances`: local grievance logs.
  - Implement seed data loader to preload initial service form schemas.
- **Files/Folders created/modified**:
  - `[NEW] client/src/db/db.js`
  - `[NEW] client/src/db/formsRepo.js`
  - `[NEW] client/src/db/submissionsRepo.js`
  - `[NEW] client/src/data/seedServices.js`
- **How we will test it**:
  - Run the application, open browser DevTools **Application > Storage > IndexedDB > OfflineBridgeDB**.
  - Verify tables are created with appropriate indexes and default service schemas are populated.
- **Git Commit**:
  - `feat(client): initialize Dexie IndexedDB stores for offline data and schemas`

---

### Milestone 5: Dynamic Offline Form Engine & Real-Time Auto-Drafting
- **What we will build**:
  - Dynamic Form Component (`FormRenderer.jsx`) that renders fields (text, number, select, date, radio) based on JSON form definitions.
  - Real-time auto-save hook (`useAutoDraft.js`) that persists field values to Dexie `drafts` table on change.
  - Form submission handler that packages entries with client-generated UUID, timestamp, and stores it in Dexie `submissions` with `pending_sync` status, then clears the draft.
- **Files/Folders created/modified**:
  - `[NEW] client/src/components/FormRenderer.jsx`
  - `[NEW] client/src/hooks/useAutoDraft.js`
  - `[NEW] client/src/pages/ServiceFormPage.jsx`
- **How we will test it**:
  - Navigate to a service form (e.g., "Farmer Seed Subsidy Application").
  - Fill half the inputs, refresh the page: inputs should immediately restore from IndexedDB drafts.
  - Disconnect internet, click "Submit": form should submit successfully, save to `submissions` with `pending_sync`, show a success toast ("Saved locally! Will sync when online"), and clear the draft.
- **Git Commit**:
  - `feat(client): build dynamic form renderer with offline draft auto-save and submission queue`

---

### Milestone 6: Network Status Detection & Visual Sync Tray
- **What we will build**:
  - Network status context (`NetworkContext.jsx`) observing `navigator.onLine` and `online`/`offline` window events.
  - Visual status banner:
    - High-visibility banner informing the user: *"You are currently offline. All forms and drafts are safely saved locally."*
  - Sync status indicator badge displaying number of pending offline items waiting for sync.
- **Files/Folders created/modified**:
  - `[NEW] client/src/context/NetworkContext.jsx`
  - `[NEW] client/src/components/NetworkStatusBanner.jsx`
  - `[NEW] client/src/components/SyncStatusBadge.jsx`
  - `[MODIFY] client/src/App.jsx`
- **How we will test it**:
  - Toggle DevTools Network setting between "Online" and "Offline".
  - Verify the banner appears instantly without lag, colors change according to state (green online, amber/red offline), and pending count reflects queued submissions.
- **Git Commit**:
  - `feat(client): implement real-time network detection and offline notification banner`

---

### Milestone 7: Backend Server & Database Schema (Express + PostgreSQL/MySQL)
- **What we will build**:
  - Scaffold Express backend application in `server/`.
  - Configure database connection pool (`pg` or `mysql2`) reading from environment variables (`.env`).
  - Create SQL initialization script for core tables:
    - `users` (id, name, phone, role, password_hash, created_at)
    - `service_forms` (id, service_name, category, schema_json, version)
    - `submissions` (id, client_uuid, user_id, form_id, data_json, status, created_at, synced_at)
    - `schemes` (id, name, rules_json, description)
    - `grievances` (id, client_uuid, user_id, category, description, status, created_at, synced_at)
  - Implement health check endpoint `GET /api/health`.
- **Files/Folders created/modified**:
  - `[NEW] server/package.json`
  - `[NEW] server/server.js`
  - `[NEW] server/src/app.js`
  - `[NEW] server/src/config/db.js`
  - `[NEW] server/src/models/schema.sql`
  - `[NEW] server/.env.example`
- **How we will test it**:
  - Run database migration script; verify tables exist.
  - Start server (`npm run dev` in `server/`) and execute `curl http://localhost:5000/api/health` — ensure it returns `{ status: "ok", db: "connected" }`.
- **Git Commit**:
  - `feat(server): setup Express server, database connection, and relational schema`

---

### Milestone 8: User Authentication API & JWT Authorization
- **What we will build**:
  - User registration and login endpoints with password hashing (`bcryptjs`) and JWT token generation.
  - Support roles: Citizen applicant and Field/Kiosk operator.
  - Express JWT authentication middleware (`authMiddleware.js`) to protect sensitive routes.
  - Client-side `AuthContext.jsx` and simple accessible `LoginPage.jsx`.
- **Files/Folders created/modified**:
  - `[NEW] server/src/controllers/authController.js`
  - `[NEW] server/src/routes/authRoutes.js`
  - `[NEW] server/src/middleware/authMiddleware.js`
  - `[NEW] client/src/context/AuthContext.jsx`
  - `[NEW] client/src/pages/LoginPage.jsx`
- **How we will test it**:
  - Send `POST /api/auth/register` with test user details via curl / Postman.
  - Send `POST /api/auth/login` to receive JWT token.
  - Attempt to request protected endpoint without token (verify 401 Unauthorized), then with Bearer token (verify 200 OK).
  - Test login form in the browser client and verify token persistence.
- **Git Commit**:
  - `feat(auth): implement JWT authentication for citizens and kiosk operators`

---

### Milestone 9: Backend Form & Submission APIs with Idempotent Sync
- **What we will build**:
  - `GET /api/forms`: returns active service forms and their schema definitions.
  - `POST /api/submissions/sync`: batch sync endpoint accepting an array of queued submissions.
    - Uses `client_uuid` for idempotent deduplication (if a submission was already inserted due to network drop during prior ACK, it updates or ignores without duplicating).
  - `GET /api/submissions/my`: returns past submissions for the authenticated user.
- **Files/Folders created/modified**:
  - `[NEW] server/src/controllers/formController.js`
  - `[NEW] server/src/controllers/submissionController.js`
  - `[NEW] server/src/routes/formRoutes.js`
  - `[NEW] server/src/routes/submissionRoutes.js`
  - `[MODIFY] server/src/app.js`
- **How we will test it**:
  - Submit batch JSON to `POST /api/submissions/sync` using curl.
  - Post the same batch payload a second time; verify server returns 200 with no duplicate rows inserted in `submissions` table.
- **Git Commit**:
  - `feat(server): add form schema APIs and idempotent batch sync submission endpoint`

---

### Milestone 10: Client-Side Background Sync Engine & Conflict Handling
- **What we will build**:
  - Client background sync coordinator (`syncEngine.js`).
  - Listens to reconnection events (`window.addEventListener('online')`) or manual "Sync Now" button.
  - Reads all items in Dexie with `pending_sync`, sends them to `POST /api/submissions/sync`, marks them as `synced` in Dexie upon 200 response, and updates UI status badges.
  - Implements retry mechanism with exponential backoff on transient server errors.
- **Files/Folders created/modified**:
  - `[NEW] client/src/services/syncEngine.js`
  - `[NEW] client/src/context/SyncContext.jsx`
  - `[NEW] client/src/components/SyncManager.jsx`
  - `[MODIFY] client/src/components/SyncStatusBadge.jsx`
- **How we will test it**:
  1. Go offline in browser DevTools.
  2. Fill and submit 2 different government service forms. Observe they are queued with `pending_sync`.
  3. Turn network back online.
  4. Observe the sync badge transition from "Pending (2)" -> "Syncing..." -> "All synced!".
  5. Check database to verify submissions arrived with exact data.
- **Git Commit**:
  - `feat(sync): implement automated client sync engine with retry logic and visual feedback`

---

### Milestone 11: Scheme Eligibility Assistant (Fully Offline)
- **What we will build**:
  - Rule-based eligibility questionnaire evaluating citizen parameters (age, annual household income, landholding area in acres/hectares, category, occupation).
  - Client-side evaluation engine (`eligibilityEngine.js`) running against cached scheme rules in IndexedDB (zero network needed).
  - Results view displaying matched schemes, benefits, and direct links to start the relevant application form.
- **Files/Folders created/modified**:
  - `[NEW] client/src/data/seedSchemes.js`
  - `[NEW] client/src/services/eligibilityEngine.js`
  - `[NEW] client/src/pages/EligibilityPage.jsx`
  - `[NEW] client/src/components/EligibilityQuiz.jsx`
  - `[NEW] server/src/routes/schemeRoutes.js`
- **How we will test it**:
  - Disconnect network completely.
  - Enter demographic profile: Age 65, Income < ₹50,000. Verify pension schemes are returned.
  - Enter: Small farmer with 1.5 acres land. Verify PM-Kisan / Seed Subsidy schemes are returned.
- **Git Commit**:
  - `feat(schemes): implement offline rule-based welfare scheme eligibility assistant`

---

### Milestone 12: Application & Grievance Tracking with Offline Cache
- **What we will build**:
  - "My Applications" tracking view: shows past submissions and current review status (`Pending`, `Under Review`, `Approved`, `Rejected`).
  - Grievance registration form: allows citizens to file grievances with offline auto-save and queued background sync.
  - Grievance tracking view: monitors grievance resolution state.
  - Local caching so users can review previously fetched statuses even when disconnected.
- **Files/Folders created/modified**:
  - `[NEW] client/src/pages/TrackingPage.jsx`
  - `[NEW] client/src/pages/GrievancePage.jsx`
  - `[NEW] server/src/controllers/grievanceController.js`
  - `[NEW] server/src/routes/grievanceRoutes.js`
- **How we will test it**:
  - File grievance while offline; verify it saves locally. Reconnect; verify it syncs to server.
  - View application status online, then disconnect network and reload: previous status remains viewable from IndexedDB cache.
- **Git Commit**:
  - `feat(tracking): implement application status tracking and offline grievance filing`

---

### Milestone 13: Low-Data Optimization, Accessibility & PWA Audit
- **What we will build**:
  - Low-bandwidth optimization: dynamic route imports (`React.lazy`), compressed SVG icons, zero bloated external UI libraries.
  - Accessibility improvements: high-contrast text, minimum 48px touch targets for mobile usability, clear iconography for low-literacy users.
  - Dedicated offline fallback page (`OfflineFallback.jsx`) for any un-cached dynamic resources.
- **Files/Folders created/modified**:
  - `[NEW] client/src/pages/OfflineFallback.jsx`
  - `[MODIFY] client/src/styles/index.css`
  - `[MODIFY] client/src/App.jsx`
- **How we will test it**:
  - Run Google Chrome **Lighthouse Audit** (Category: Progressive Web App, Accessibility, Performance).
  - Verify PWA badge passes all criteria (Installable, Service Worker registered, Offline capable, Manifest valid).
  - Test on simulated throttled "Slow 3G" network to verify First Meaningful Paint under 3 seconds.
- **Git Commit**:
  - `perf(pwa): optimize bundle size, enhance accessibility, and pass Lighthouse PWA audit`

---

### Milestone 14: Comprehensive Verification, Documentation & Demo Prep
- **What we will build**:
  - Update root `README.md` with complete architecture diagram, setup instructions (client + server), and offline testing instructions.
  - Create `docs/DEMO_GUIDE.md` containing exact steps for academic examiners/evaluators to test offline form filling, network disconnect, and auto-sync.
  - Add API documentation `docs/API_SPECIFICATION.md`.
- **Files/Folders created/modified**:
  - `[MODIFY] README.md`
  - `[NEW] docs/DEMO_GUIDE.md`
  - `[NEW] docs/API_SPECIFICATION.md`
- **How we will test it**:
  - Follow the `README.md` setup instructions from a clean state to verify installation commands, database setup, and dev server startups execute smoothly without omissions.
- **Git Commit**:
  - `docs: add comprehensive setup guide, API specs, and offline demo walkthrough`

---

## Verification Plan

### Automated Checks
- Client build validation: `npm run build` (inside `client/`)
- Backend syntax and test checks: `node --check server.js`
- PWA manifest and service worker generation verification.

### Core Manual Offline Demo Tests
1. **Offline Form Fill & Draft Recovery**:
   - Start typing in a form -> close tab / refresh tab -> verify data remains intact.
2. **Offline Form Submission**:
   - Turn off Wi-Fi (or DevTools Offline) -> Submit form -> confirm local confirmation and queue badge increment.
3. **Background Auto-Sync**:
   - Re-enable Wi-Fi -> observe automatic sync firing -> confirm database row creation on backend and status updated to "Synced" on client.
4. **Offline Eligibility Assistant**:
   - Run questionnaire with zero network -> verify instantaneous accurate recommendations.
