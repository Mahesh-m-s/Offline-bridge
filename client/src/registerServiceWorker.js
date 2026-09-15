/**
 * Service Worker registration and lifecycle manager for OfflineBridge.
 * Uses Workbox / virtual:pwa-register when available, with fallback to navigator.serviceWorker.
 */

export function registerServiceWorker(callbacks = {}) {
  const {
    onNeedRefresh = () => {},
    onOfflineReady = () => {},
    onRegistered = () => {},
    onRegisterError = () => {}
  } = callbacks;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        // Dynamically import virtual:pwa-register if supported by Vite PWA plugin
        // Fallback to standard service worker registration
        if (import.meta.env.PROD) {
          const { registerSW } = await import('virtual:pwa-register');
          const updateSW = registerSW({
            immediate: true,
            onNeedRefresh() {
              console.log('[OfflineBridge SW] New content available, refresh needed.');
              onNeedRefresh(updateSW);
            },
            onOfflineReady() {
              console.log('[OfflineBridge SW] App ready to work offline.');
              onOfflineReady();
            },
            onRegistered(registration) {
              console.log('[OfflineBridge SW] Service Worker successfully registered:', registration);
              onRegistered(registration);
            },
            onRegisterError(error) {
              console.error('[OfflineBridge SW] Registration error:', error);
              onRegisterError(error);
            }
          });
          return updateSW;
        } else {
          // Development mode registration fallback
          const registration = await navigator.serviceWorker.register('/dev-sw.js?dev-sw', {
            type: 'module',
            scope: '/'
          }).catch(() => {
            // If dev-sw is not enabled or fails, silent fallback
            return null;
          });
          if (registration) {
            console.log('[OfflineBridge SW (dev)] Registered:', registration);
            onRegistered(registration);
          }
        }
      } catch (err) {
        console.warn('[OfflineBridge SW] Registration exception (expected in initial dev if sw not yet built):', err);
        onRegisterError(err);
      }
    });
  } else {
    console.warn('[OfflineBridge SW] Service Worker is not supported in this browser.');
  }
}

/**
 * Utility to check if the browser is currently online
 */
export function isOnline() {
  return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
    ? navigator.onLine
    : true;
}

/**
 * Hook network event listeners for UI updates
 */
export function setupNetworkListeners(onStatusChange) {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => onStatusChange(true);
  const handleOffline = () => onStatusChange(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
