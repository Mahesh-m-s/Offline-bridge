import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        console.log('[OfflineBridge PWA] New version available, reloading page...');
        updateSW(true);
      },
      onOfflineReady() {
        console.log('[OfflineBridge PWA] App shell cached & offline-ready!');
      },
      onRegistered(r) {
        console.log('[OfflineBridge PWA] Service Worker registered:', r);
      },
      onRegisterError(error) {
        console.warn('[OfflineBridge PWA] Service Worker registration failed:', error);
      }
    });
  }
}
