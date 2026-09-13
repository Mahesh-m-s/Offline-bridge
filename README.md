# OfflineBridge — Rural Digital Government Services

> **An Offline-First Progressive Web App (PWA) enabling rural citizens to access, complete, and track government welfare schemes and lodge grievances with zero internet connectivity.**

[![PWA Ready](https://img.shields.io/badge/PWA-Installable-emerald.svg)](#)
[![Workbox](https://img.shields.io/badge/Caching-Workbox%20%26%20Service%20Worker-teal.svg)](#)
[![Dexie.js](https://img.shields.io/badge/Storage-IndexedDB%20(Dexie.js)-blue.svg)](#)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20(JSONB)-336791.svg)](#)

---

## 1. Project Overview

Rural citizens often face patchy or non-existent cellular coverage when trying to apply for critical agricultural, educational, or welfare services (e.g. Kisan Credit Card, PM-Kisan, scholarships, pensions). Conventional web apps discard entered data during network drops.

**OfflineBridge** solves this with an offline-first architecture:
- All service forms and welfare rule catalogs are cached locally via **Service Worker (Workbox)** and **IndexedDB (Dexie.js)**.
- Citizens can fill applications and file grievances completely offline.
- Data is saved instantly with an RFC 4122 v4 `client_uuid` idempotency key.
- Once connectivity is restored, the **Background Sync Engine** auto-transmits pending items to the PostgreSQL backend with exponential backoff and duplicate prevention.

---

## 2. Key Features

- **PWA Installability:** Full Web App Manifest (`manifest.json`) and Workbox service worker allowing installation to home screen on mobile and desktop.
- **Offline Form Access & Filling:** Dynamic schema-driven forms for agricultural credit, scholarships, and revenue certificates that render without network.
- **Zero Data Loss Local Storage:** All drafts and submissions are saved instantly to IndexedDB before any network dispatch.
- **Fault-Tolerant Background Sync:**
  - Automatic trigger on `window.addEventListener('online')` and app launch.
  - Manual on-demand "Sync Now" button.
  - Exponential backoff retry logic ($2^n$ up to 30s) capped at 5 retries.
  - Idempotent PostgreSQL inserts via `client_uuid` to ensure retries never create duplicate rows.
- **Rule-Based Scheme Eligibility Assistant:** Evaluates 6 welfare schemes client-side against `schemes.json` with zero network access.
- **Unified Application & Grievance Tracker:** Displays locally saved offline drafts and server-synced submissions with status badges.
- **Citizen Authentication:** Lightweight JWT-based login/register with 1-click test mode for rapid evaluation.

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend UI** | React.js (Vite), React Router | Fast, responsive single-page PWA |
| **Offline Storage** | IndexedDB via Dexie.js | In-browser structured client storage |
| **PWA / Caching** | Workbox, `vite-plugin-pwa` | Shell precaching & runtime caching |
| **Backend API** | Node.js, Express.js | RESTful endpoints for sync & auth |
| **Database** | PostgreSQL (`pg` connection pool) | Relational tables with `JSONB` for variable schemas |
| **Security / Auth** | JWT, `bcryptjs` | Token authentication and password hashing |
| **Icons & Style** | Lucide React, Modern CSS System | Accessible, high-contrast rural UX |

---

## 4. Folder Structure

```
Offline-bridge/
├── client/
│   ├── public/
│   │   ├── manifest.json
│   │   └── icons/
│   │       ├── icon-192x192.png
│   │       └── icon-512x512.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConnectivityBadge.jsx
│   │   │   ├── SyncStatusBadge.jsx
│   │   │   ├── FormRenderer.jsx
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── ServiceList.jsx
│   │   │   ├── ServiceForm.jsx
│   │   │   ├── EligibilityAssistant.jsx
│   │   │   ├── ApplicationTracker.jsx
│   │   │   ├── GrievanceForm.jsx
│   │   │   ├── GrievanceTracker.jsx
│   │   │   └── Login.jsx
│   │   ├── db/
│   │   │   └── db.js               # Dexie schema & fallback seeds
│   │   ├── sync/
│   │   │   └── syncEngine.js       # Background sync with backoff & idempotency
│   │   ├── api/
│   │   │   └── apiClient.js        # Axios wrapper with JWT headers
│   │   ├── data/
│   │   │   └── schemes.json        # Static rule-based schemes dataset
│   │   ├── serviceWorkerRegistration.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── submissions.routes.js
│   │   │   ├── schemes.routes.js
│   │   │   └── grievances.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── submissions.controller.js
│   │   │   ├── schemes.controller.js
│   │   │   └── grievances.controller.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── form.model.js
│   │   │   ├── submission.model.js
│   │   │   ├── scheme.model.js
│   │   │   └── grievance.model.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── errorHandler.js
│   │   ├── db/
│   │   │   └── pool.js             # pg connection pool with resilient fallback
│   │   ├── migrations/
│   │   │   ├── 001_init.sql        # Table definitions & client_uuid constraints
│   │   │   ├── seed.sql            # Seed forms & schemes dataset
│   │   │   └── migrate.js          # Migration runner
│   │   └── index.js                # Express app entry
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── PRD.md                      # Product Requirements Document
│   ├── development-guide.md        # Architecture & testing guide
│   └── assumptions.md              # Engineering decisions log
├── .gitignore
└── README.md
```

---

## 5. Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher, or default fallback)
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/Mahesh-m-s/Offline-bridge.git
cd Offline-bridge
```

### Step 2: Configure Environment Variables
In `server/.env` (copy from `server/.env.example`):
```env
PORT=5000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/offlinebridge
JWT_SECRET=offlinebridge_super_secure_jwt_secret_key_rural_services_2026
NODE_ENV=development
```

### Step 3: Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 4: Run Migrations & Seed Data
```bash
cd ../server
npm run migrate
npm run seed
```

### Step 5: Start the Development Servers
In Terminal 1 (Backend Server):
```bash
cd server
npm run dev
```
> Server runs on `http://localhost:5000`

In Terminal 2 (Frontend Client PWA):
```bash
cd client
npm run dev
```
> Client runs on `http://localhost:5173`

---

## 6. How to Test Offline Capabilities

1. Open `http://localhost:5173` in Google Chrome or Microsoft Edge.
2. Open DevTools (`F12`) -> **Network** tab -> change "No Throttling" to **Offline**.
3. Notice the header badge immediately switches to **Offline Mode** (amber).
4. Navigate to **Services** -> select **Kisan Credit Card (KCC)**.
5. Fill out the application form and click **Submit Application**.
6. The application completes immediately, stored in IndexedDB, and the badge displays `1 Pending Sync`.
7. Go to **My Applications** tracker to see the offline submission recorded with a local pending badge.
8. Switch DevTools Network back to **Online**.
9. The sync engine triggers immediately, syncs the record to the backend, and turns the badge to **All Synced** (green).
10. Verify that repeated sync attempts never duplicate the database row due to `client_uuid` idempotency.

---

