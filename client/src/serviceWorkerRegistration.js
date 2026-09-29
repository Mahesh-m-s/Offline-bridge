import { registerSW } from 'virtual:pwa-register';

let updater;
let ready = false;
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  updater = registerSW({ immediate: true,
    onNeedRefresh() { window.dispatchEvent(new CustomEvent('offlinebridge:update-ready')); },
    onOfflineReady() { ready = true; window.dispatchEvent(new CustomEvent('offlinebridge:offline-ready')); },
    onRegisterError(error) { console.warn('[OfflineBridge] Service worker registration failed', error); }
  });
}
export const applyServiceWorkerUpdate = () => updater?.(true);
export const isAppShellReady = () => ready;
