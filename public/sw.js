// ==============================================================================
// MARKETPULSE SERVICE WORKER (v1.0.0)
// Offline persistence, image caching, and low-connectivity resilience
// ==============================================================================

const STATIC_CACHE_NAME = 'marketpulse-static-v1';
const DATA_CACHE_NAME = 'marketpulse-data-v1';
const IMAGE_CACHE_NAME = 'marketpulse-images-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx',
];

// Install Event: Pre-cache critical application shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Some pre-cache assets could not be loaded directly:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Cleanup stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name.startsWith('marketpulse-') &&
              name !== STATIC_CACHE_NAME &&
              name !== DATA_CACHE_NAME &&
              name !== IMAGE_CACHE_NAME
            );
          })
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Optimized strategies for images, data, and static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Image Caching Strategy (Cache-First with Network fallback)
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif)$/) ||
    url.hostname.includes('googleusercontent.com') ||
    url.hostname.includes('images.unsplash.com')
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // Return placeholder or cached fallback if offline
          return cachedResponse || new Response('<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#dee9fc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="#6e7a70">Offline</text></svg>', {
            headers: { 'Content-Type': 'image/svg+xml' }
          });
        }
      })
    );
    return;
  }

  // 2. API / Supabase Data Requests (Network-First with Cache fallback)
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(async (cache) => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          throw err;
        }
      })
    );
    return;
  }

  // 3. Navigation and App Shell (Stale-While-Revalidate)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to index.html for SPA routes when completely offline
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Background Sync Listener
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-price-reports') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'TRIGGER_OFFLINE_SYNC' });
        });
      })
    );
  }
});

// ==============================================================================
// FIELD AGENT NOTIFICATION HANDLERS (Push, Message & Interaction)
// Alerts agents when price observations are Approved, Rejected, or Flagged
// ==============================================================================

// 1. Message Event Listener: Client-triggered local notifications via Service Worker
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(title || 'MarketPulse Field Alert', {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        ...options,
      })
    );
  }
});

// 2. Push Event Listener: Incoming Cloud/Server Push notifications
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'MarketPulse Field Update',
    body: 'A price submission status was updated by an admin.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: { url: '/' },
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      notificationData = { ...notificationData, ...parsed };
    } catch (e) {
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  const { title, ...options } = notificationData;

  event.waitUntil(
    self.registration.showNotification(title, {
      vibrate: [200, 100, 200],
      ...options,
    })
  );
});

// 3. Notification Click Listener: Focus application & deep-link to submission
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const clickedData = event.notification.data || {};
  const targetUrl = clickedData.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Find existing open MarketPulse window
        for (const client of clientList) {
          if (client.url && 'focus' in client) {
            client.focus();
            client.postMessage({
              type: 'NOTIFICATION_ACTION_CLICKED',
              data: clickedData,
              action: event.action,
            });
            return client;
          }
        }
        // If no open tab, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl).then((newClient) => {
            if (newClient) {
              setTimeout(() => {
                newClient.postMessage({
                  type: 'NOTIFICATION_ACTION_CLICKED',
                  data: clickedData,
                  action: event.action,
                });
              }, 1000);
            }
          });
        }
      })
  );
});

// 4. Notification Close Listener
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification was dismissed:', event.notification.tag);
});

