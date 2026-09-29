import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL, cleanupOutdatedCaches } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')));

const publicGet = ({ url, request }) => request.method === 'GET' && url.origin === self.location.origin;
registerRoute(({ url, request }) => publicGet({ url, request }) && /\/api\/v1\/(forms|schemes)(\/|\?|$)/.test(url.pathname),
  new StaleWhileRevalidate({ cacheName: 'catalog-v1', plugins: [new ExpirationPlugin({ maxEntries: 40, maxAgeSeconds: 7 * 86400 })] }));
registerRoute(({ request }) => request.destination === 'image' || request.destination === 'font',
  new CacheFirst({ cacheName: 'media-v1', plugins: [new CacheableResponsePlugin({ statuses: [0, 200] }), new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 30 * 86400 })] }));
registerRoute(({ url, request }) => publicGet({ url, request }) && url.pathname.startsWith('/api/v1/') &&
  !url.pathname.startsWith('/api/v1/health') && !request.headers.has('authorization'),
  new NetworkFirst({ cacheName: 'api-get-v1', networkTimeoutSeconds: 3, plugins: [new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 86400 })] }));
registerRoute(({ url }) => /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url.href),
  new CacheFirst({ cacheName: 'web-fonts-v1', plugins: [new CacheableResponsePlugin({ statuses: [0, 200] }), new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 86400 })] }));

for (const path of ['/api/v1/submissions', '/api/v1/submissions/bulk-sync', '/api/v1/grievances', '/api/v1/grievances/bulk-sync']) {
  const plugin = new BackgroundSyncPlugin(`offlinebridge-${path.split('/')[3]}-queue`, { maxRetentionTime: 24 * 60 });
  registerRoute(({ url, request }) => url.origin === self.location.origin && url.pathname === path && request.method === 'POST',
    new NetworkFirst({ plugins: [plugin] }), 'POST');
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'SYNC_REQUEST') event.waitUntil(notifyClients());
});
self.addEventListener('sync', (event) => { if (event.tag.startsWith('workbox-background-sync:')) event.waitUntil(notifyClients()); });
async function notifyClients() {
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of windows) client.postMessage({ type: 'SYNC_REQUEST' });
}
