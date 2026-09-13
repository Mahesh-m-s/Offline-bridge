# Product Requirements Document (PRD)
## OfflineBridge — A Progressive Web App for Rural Digital Services

**Institution:** The National Institute of Engineering, Mysuru | Dept. of ISE
**Batch:** D4 | Academic Year 2026–27
**Team:** Abhishek G.P, Mahesh M.S, Rajesh N, S M Shrivathsa Nonavinakere
**Guide:** Dr. S Kuzhalvaimozhi

---

## 1. Problem Statement

Rural citizens rely on digital platforms for government services — agriculture support, scholarships, certificates, pensions, welfare schemes, and grievance registration. These users commonly face:

- Unstable or intermittent internet connectivity
- Limited digital literacy
- Loss of entered data when a network drop interrupts a form submission
- Difficulty tracking application status or filing grievances without repeat visits

Conventional web apps assume a constant connection. When that assumption breaks, users lose time, data, and trust in the system.

## 2. Product Vision

OfflineBridge is a Progressive Web App (PWA) that lets rural users fill and submit government-service forms **regardless of connectivity**. Data entered offline is stored locally and automatically synced once a connection is available — so a dropped signal never means lost work.

## 3. Goals

| # | Goal | Success Signal |
|---|------|----------------|
| 1 | Offline access to core services | Users can open the app and fill forms with zero network |
| 2 | Zero data loss on disconnect | 0% form data loss during simulated network drop tests |
| 3 | Reliable background sync | Queued submissions sync automatically within seconds of reconnection |
| 4 | Usable on weak networks | App remains responsive on throttled 2G/3G simulation |
| 5 | Self-service eligibility check | Users can check scheme eligibility without contacting an office |
| 6 | Transparent tracking | Users can see application/grievance status at any time |

## 4. Non-Goals (Out of Scope for this project)

- Payment processing / financial transactions
- Real government API integrations (will use mock/simulated backend endpoints unless a real API is provided by the guide/institution)
- Multi-language voice interfaces (may be a stretch goal, not core scope)
- Native mobile app (Android/iOS) — PWA only

## 5. Target Users

**Primary persona: Rural citizen applicant**
- Basic smartphone, patchy mobile data
- Low-to-moderate digital literacy
- Needs: simple forms, clear status updates, no lost progress

**Secondary persona: Field/kiosk operator (optional, if scope allows)**
- Assists citizens at common service centers
- Needs: quick form entry, bulk status view

## 6. Core Features (MVP)

### 6.1 Offline Form Access & Filling
- Users can browse available services and open forms without internet
- Forms render from a locally cached schema (cached via Service Worker)

### 6.2 Offline Data Storage
- Form entries saved to **IndexedDB** as the user types/submits, even with no connection
- Draft-saving so partially filled forms aren't lost either

### 6.3 Background Sync
- On reconnect, queued submissions automatically POST to the backend
- Retry logic with exponential backoff for failed sync attempts
- Visual sync status indicator (pending / syncing / synced / failed)

### 6.4 Low-Data Mode
- Minimal asset payloads, compressed responses, lazy-loaded non-critical UI
- Works acceptably on throttled/slow connections

### 6.5 Scheme Eligibility Assistant
- Simple rule-based questionnaire (age, income, land ownership, category, etc.)
- Returns likely-eligible schemes from a static/seed dataset

### 6.6 Application Tracking
- Users can view status of past submissions (Pending / Under Review / Approved / Rejected)

### 6.7 Grievance Registration & Tracking
- Submit a grievance (works offline, syncs later)
- Track grievance status similarly to applications

### 6.8 Simple, Accessible UI
- Large tap targets, minimal text-per-screen, iconography, works well at small viewport sizes

## 7. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR1 | System shall detect online/offline state and reflect it in the UI |
| FR2 | System shall cache app shell and static assets via Service Worker |
| FR3 | System shall persist form drafts and completed-but-unsynced submissions in IndexedDB |
| FR4 | System shall automatically attempt sync when connectivity is restored |
| FR5 | System shall queue and retry failed sync attempts without duplicating submissions |
| FR6 | System shall provide a rule-based eligibility check against a schemes dataset |
| FR7 | System shall let users view the status of their own applications and grievances |
| FR8 | System shall support installing the app to a home screen (PWA installability) |

## 8. Non-Functional Requirements

- **Reliability:** No data loss across network interruptions during form fill/submit
- **Performance:** First meaningful paint under ~3s on simulated 3G
- **Accessibility:** Legible fonts, sufficient contrast, minimal reliance on text-heavy instructions
- **Security:** Basic auth for users; sanitized inputs; no sensitive data stored unencrypted in IndexedDB if avoidable
- **Compatibility:** Works on latest Chrome and Edge (per stated requirements)

## 9. Proposed Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React.js | Component-driven UI |
| Offline support | Service Worker (Workbox recommended) | Caching + background sync |
| Local storage | IndexedDB (via Dexie.js recommended) | Simplifies IndexedDB API |
| Backend | Node.js + Express.js | REST API |
| Database | PostgreSQL (recommended) or MySQL | See note below |
| Auth | JWT-based simple auth | Lightweight, stateless |
| Version control | Git & GitHub | |

**Database note:** PostgreSQL is recommended over MySQL for this project due to native JSONB support (useful for variable-schema form data from different services) and stronger concurrency handling during sync bursts. MySQL remains an acceptable substitute if the team is more comfortable with it or the guide expects it per the approved synopsis — this is a swappable implementation detail, not a core design decision.

## 10. High-Level Data Model

- **User** (id, name, contact, role)
- **ServiceForm** (id, service_type, schema_json, version)
- **Submission** (id, user_id, form_id, data_json, status, created_at, synced_at, sync_status)
- **Scheme** (id, name, eligibility_rules_json, description)
- **Grievance** (id, user_id, description, status, created_at, synced_at)

Using a JSON/JSONB column for form data avoids needing a rigid schema per service type — important since each government service form differs.

## 11. Key User Flows

1. **Offline form submission:** Open app (offline) → select service → fill form → submit → stored locally with "pending sync" status → reconnect → auto-sync → status updates to "submitted."
2. **Eligibility check:** Open eligibility assistant → answer questions → see matched schemes (works fully offline if scheme rules are cached).
3. **Track status:** Open "My Applications" → view list with live/cached status.
4. **File grievance:** Open grievance form → describe issue → submit (offline-safe) → track later.

## 12. Success Metrics (for demo/evaluation)

- Successful form submission and sync after simulated offline period (core demo scenario)
- Zero data loss demonstrated across at least 3 network-drop test cases
- Lighthouse PWA score (installability, offline capability) as a quantifiable proof point
- Working eligibility assistant returning correct results against test cases

## 13. Milestones (suggested, ~14–16 week academic timeline)

| Phase | Weeks | Deliverable |
|-------|-------|-------------|
| Phase 1: Setup & Design | 1–2 | Repo setup, wireframes, DB schema, API contract |
| Phase 2: Core PWA shell | 3–5 | Service worker, offline shell, install prompt |
| Phase 3: Offline forms + IndexedDB | 6–8 | Form fill/save/draft flow working offline |
| Phase 4: Backend + Sync | 9–11 | Express API, sync engine, conflict handling |
| Phase 5: Eligibility + Tracking + Grievance | 12–13 | Feature completion |
| Phase 6: Testing, polish, docs | 14–16 | Offline testing, UI polish, report/demo prep |

## 14. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Sync conflicts (edited both offline/online) | Use "last-write-wins" with timestamps for MVP; document as a known limitation |
| Service Worker caching bugs | Use Workbox to reduce hand-rolled caching logic |
| Scope creep (grievance + tracking + eligibility + offline = a lot) | Treat eligibility assistant as rule-based only, not ML-based |
| Demo reliability (showing "offline" live) | Use Chrome DevTools network throttling/offline mode for consistent demos |
