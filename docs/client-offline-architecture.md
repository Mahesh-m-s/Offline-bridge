# Client offline architecture

## Local data and drafts

The client opens `OfflineBridgeDB` with a versioned Dexie schema. The current upgrade adds `forms`, `schemes`, `drafts`, `syncQueue` and `meta` stores while retaining the earlier stores so existing browser data can be upgraded in place. Server catalogs refresh after startup and on reconnection; seeded local catalogs remain available when the request fails.

Application and grievance forms save a draft after 500 ms without writing credentials. On submit, the client writes the record and its persistent queue entry in one IndexedDB transaction before starting synchronization. A UUID `client_uuid` stays stable across retries.

## Synchronization

`src/sync/syncEngine.js` handles startup, reconnect, window focus, manual retry and service-worker messages. It submits queued records through the versioned bulk endpoints and applies each item result independently. Items transition through `pending`, `syncing`, `synced` or `failed`; interrupted `syncing` records return to `pending` at startup. The client retains failed rows and queue metadata. It retries automatically up to five times with exponential backoff and jitter capped at 30 seconds; failed rows can be retried manually. A 401 pauses sending and surfaces a sign-in link without clearing queued data.

The service worker includes Workbox Background Sync routes as an additional replay path when a POST loses connectivity. The application queue remains the source of truth and server writes are idempotent by `client_uuid`.

## Service worker and caching

The `injectManifest` worker precaches the app shell, uses stale-while-revalidate for public form and scheme catalogs, cache-first for media and fonts, and a three-second network-first strategy for other API GET requests. Health readiness checks bypass API caching. Navigations fall back to `index.html`. New worker versions wait for the user to choose **Update available**.

Service workers require a secure context: HTTPS in production or `localhost` during development. In-memory network events and the Background Sync API vary by browser; the durable Dexie queue also runs on page startup, focus, reconnect and manual retry.

## Data handling assumptions

- Passwords are never written to IndexedDB or browser storage. JWTs remain in `localStorage` as required by the existing client authentication contract.
- Form values and grievance drafts are stored locally until the user submits or deletes them; users should protect access to shared devices.
- Government portal links are ordinary external links and open in a separate tab. OfflineBridge does not embed third-party branding or content.
- Low-data mode suppresses decorative motion and visual effects. This build uses original inline SVG artwork and CSS rather than remote photography.

## Client containers

The production client image builds the Vite bundle with Node 20 and serves it from Alpine nginx. Nginx enables gzip and Brotli, caches hashed `/assets/` files as immutable, disables caching for the entry point, manifest and worker, falls back to the SPA entry point, and proxies `/api/` to the Compose server service. For Docker Vite hot reload, run `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build`.
