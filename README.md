# OfflineBridge (ArivuNet — ಅರಿವುನೆಟ್)

> **Offline-first Progressive Web Application (PWA) for rural digital services** — form access, local IndexedDB persistence, transactional background sync, and grievance tracking for low-connectivity users.

---

## Architecture Overview

OfflineBridge is composed of three containerized services running in an isolated Docker bridge network:

```
                          ┌──────────────────────────┐
                          │   Client Web Browser     │
                          └─────────────┬────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 │                                             │
         Port 5173 (HTTP)                              Port 5000 (HTTP)
                 │                                             │
                 ▼                                             │
  ┌──────────────────────────────┐                             │
  │ frontend (Nginx 1.27 Alpine) │                             │
  │ - Static PWA assets          │                             │
  │ - Service Worker & Manifest  │                             │
  │ - SPA routing (/index.html)  │                             │
  │ - Reverse proxy /api/ ───────┼─────────┐                   │
  └──────────────────────────────┘         │                   │
                                           ▼                   ▼
                            ┌─────────────────────────────────────┐
                            │ backend (Node.js 20 Alpine)         │
                            │ - Express REST API                  │
                            │ - JWT Authentication & RBAC         │
                            │ - Auto-migrations & Seeder          │
                            │ - Non-root execution (user node)    │
                            └──────────────────┬──────────────────┘
                                               │
                                       Port 5432 (Internal)
                                               │
                                               ▼
                            ┌─────────────────────────────────────┐
                            │ postgres (PostgreSQL 16 Alpine)     │
                            │ - Relational schema & JSONB storage │
                            │ - Persistent volume (postgres_data) │
                            │ - Healthcheck with pg_isready       │
                            └─────────────────────────────────────┘
```

1. **Frontend (`frontend`)**: Vite + React 18 PWA built via multi-stage Docker build and served by a lightweight Nginx web server on port `5173`. Configured with optimal PWA cache policies (no-cache for `sw.js` and `index.html`, immutable cache for content-hashed assets, and reverse proxy for `/api/`).
2. **Backend (`backend`)**: Node.js Express API listening on port `5000`. Runs under a secure non-root user (`node`), applies database migrations on startup, seeds verified government schemes if the database is fresh, and exposes `/api/health`.
3. **Database (`postgres`)**: Official PostgreSQL 16 Alpine container with healthchecks and persistent Docker named volume storage (`offlinebridge_postgres_data`).

---

## Prerequisites

Before starting, ensure you have the following installed on your machine:

- **Docker**: Engine version 20.10+ (recommended 24.0+)
- **Docker Compose**: v2.20+ (included with modern Docker Desktop / Docker Engine)

Verify your installation:
```bash
docker --version
docker compose version
```

---

## Quick Start (Start in Seconds)

### 1. Clone & Configure Environment

Copy the unified environment template:
```bash
cp .env.example .env
```

*(Optional)* Customize credentials or ports in `.env` if desired. The default settings work out-of-the-box.

### 2. Build & Launch Containers

Start the complete application in detached mode with build:
```bash
docker compose up -d --build
```

Docker will:
1. Compile the React PWA and assemble the Nginx web server.
2. Build the Node.js production backend image.
3. Start PostgreSQL and wait for it to become healthy.
4. Run pending database migrations automatically (`001_initial_schema`, `002_phase3_security_and_idempotency`).
5. Seed the 10 verified Karnataka government schemes into the database.
6. Launch the backend API and frontend Nginx server.

### 3. Access the Application

| Service | Access URL | Description |
| :--- | :--- | :--- |
| **Frontend PWA** | [http://localhost:5173](http://localhost:5173) | Main user interface (Schemes, Finder, Draft Forms, Offline Tracking) |
| **Backend API** | [http://localhost:5000](http://localhost:5000) | Express REST API |
| **API Health Check** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | System health, uptime & DB status |
| **Schemes Catalog** | [http://localhost:5000/api/schemes](http://localhost:5000/api/schemes) | Active schemes from PostgreSQL |
| **PostgreSQL Database** | `localhost:5432` | Exposed for local inspection / pgAdmin / psql |

---

## Stopping the Application

To stop all running containers without losing database data:
```bash
docker compose stop
```

To stop and remove containers and networks (database volume is preserved):
```bash
docker compose down
```

To stop containers and completely remove persistent database volumes (reset data):
```bash
docker compose down -v
```

---

## Inspecting Logs

Follow live logs from all services:
```bash
docker compose logs -f
```

Follow logs for a specific service:
```bash
# Backend logs
docker compose logs -f backend

# Frontend Nginx logs
docker compose logs -f frontend

# PostgreSQL logs
docker compose logs -f postgres
```

Check running container status and health:
```bash
docker compose ps
```

---

## Environment Variables Reference

All configuration is centralized in the root `.env` file (copied from `.env.example`):

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `COMPOSE_PROJECT_NAME` | `offlinebridge` | Docker Compose project prefix |
| `FRONTEND_PORT` | `5173` | Host port mapped to frontend Nginx container (port 80) |
| `BACKEND_PORT` | `5000` | Host port mapped to backend Node.js container (port 5000) |
| `DB_PORT` | `5432` | Host port mapped to PostgreSQL container (port 5432) |
| `POSTGRES_DB` | `offlinebridge` | PostgreSQL database name |
| `POSTGRES_USER` | `postgres` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `postgres` | PostgreSQL password |
| `NODE_ENV` | `production` | Node.js runtime environment |
| `JWT_SECRET` | *(secure 32+ char key)* | Secret key for signing and verifying JWT tokens |
| `JWT_EXPIRES_IN` | `24h` | JWT token validity lifespan |
| `CLIENT_ORIGIN` | `http://localhost:5173,http://localhost:80,http://localhost` | Allowed CORS origins (comma-separated) |
| `DATABASE_URL` | `postgresql://postgres:postgres@postgres:5432/offlinebridge` | Container-to-container database connection URL |
| `VITE_API_BASE_URL` | `http://localhost:5000` | API base URL compiled into client during build |
| `GEMINI_API_KEY` | *(optional)* | Google Gemini API key for AI RAG assistant |

---

## Offline-First PWA Functionality

OfflineBridge is built with offline resilience as a core guarantee:

- **IndexedDB Drafts**: Forms and grievances are saved locally in the browser's IndexedDB (`ArivuNet_DraftDB`) even when disconnected.
- **Service Worker Lifecycle**: The Nginx configuration strictly delivers `sw.js` with `Cache-Control: no-cache, no-store, must-revalidate`, allowing Workbox to detect and update the PWA immediately without stale service worker locks.
- **Static Asset Caching**: Pre-cached shell assets and immutable content hashes (`/assets/*`) provide sub-second load times regardless of network speed.
- **Batch Synchronization**: Queued offline submissions are synchronized transactionally via `POST /api/sync/batch` once the network connection is restored, enforcing client idempotency via `clientSubmissionId`.

---

## Rebuilding After Code Changes

When you make changes to frontend or backend source code, rebuild and restart the containers:

```bash
# Rebuild all modified services
docker compose up -d --build

# Or rebuild only the frontend
docker compose up -d --build frontend

# Or rebuild only the backend
docker compose up -d --build backend
```

---

## Database Management & Persistence

### 1. Data Persistence
Database data is stored in the Docker named volume `offlinebridge_postgres_data` located in Docker's managed storage directory. Data persists across container restarts, stops, and rebuilds.

### 2. Manual Migrations & Seeding
Migrations and seeding run automatically on container startup. To trigger them manually inside the running backend container:
```bash
# Run database migrations
docker compose exec backend npm run migrate

# Run database seeder (re-seeds schemes if empty)
docker compose exec backend npm run seed
```

### 3. Database Backup (Export)
Create a compressed SQL dump of the database:
```bash
docker compose exec -T postgres pg_dump -U postgres offlinebridge > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 4. Database Restore
Restore an existing SQL dump into the container:
```bash
cat backup_file.sql | docker compose exec -T postgres psql -U postgres -d offlinebridge
```

### 5. Interactive Database Shell
Open a `psql` console directly inside the database container:
```bash
docker compose exec postgres psql -U postgres -d offlinebridge
```

---

## Running Test Suites

You can run the existing automated test suites inside the running containers or locally:

```bash
# Client unit and interface tests (run on host or in container)
cd client && npm test

# Server ingestion test suite
cd server && node test-stage-c-ingestion.js

# Execute tests directly inside the backend container
docker compose exec backend node test-stage-c-ingestion.js
```

---

## Troubleshooting

### Port Conflicts (e.g. `port 5432 or 5000 is already in use`)
If your host machine already runs PostgreSQL or another service on port 5432, 5000, or 5173:
1. Open `.env` in the project root.
2. Change the host port mapping, for example:
   ```env
   DB_PORT=5433
   BACKEND_PORT=5001
   FRONTEND_PORT=8080
   ```
3. Restart: `docker compose up -d`

### Inspecting Container Exit Codes & Errors
If a service fails to become healthy:
```bash
docker compose ps -a
docker compose logs backend
```

### Resetting to a Clean State
To wipe all containers, images, and stored database volumes:
```bash
docker compose down -v
docker compose up -d --build
```
