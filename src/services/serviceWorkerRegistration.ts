/** Service worker registration for the MarketPulse PWA shell. */
export function registerServiceWorker(onSuccess?: () => void, onUpdate?: () => void) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || import.meta.env.MODE === 'test') return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.onupdatefound = () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.onstatechange = () => {
            if (worker.state !== 'installed') return;
            if (navigator.serviceWorker.controller) onUpdate?.();
            else onSuccess?.();
          };
        };
      })
      .catch((error) => console.warn('[MarketPulse SW] registration failed:', error));
  });
}

export function requestBackgroundSync(tag = 'sync-price-reports') {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready
    .then((registration: any) => registration.sync?.register?.(tag))
    .catch((error) => console.warn('[MarketPulse SW] background sync unavailable:', error));
}
