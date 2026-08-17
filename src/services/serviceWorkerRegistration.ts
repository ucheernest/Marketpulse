/**
 * Service Worker Registration & Lifecycle Management
 */

export function registerServiceWorker(onSuccess?: () => void, onUpdate?: () => void) {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] ServiceWorker registered with scope:', registration.scope);

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('[SW] New content is available; please refresh.');
                  if (onUpdate) onUpdate();
                } else {
                  console.log('[SW] Content is cached for offline use.');
                  if (onSuccess) onSuccess();
                }
              }
            };
          };
        })
        .catch((error) => {
          console.warn('[SW] ServiceWorker registration failed:', error);
        });
    });
  }
}

export function requestBackgroundSync(tag: string = 'sync-price-reports') {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then((reg: any) => {
        if (reg.sync) {
          return reg.sync.register(tag);
        }
      })
      .catch((err) => {
        console.warn('[SW] Background sync could not be registered:', err);
      });
  }
}
