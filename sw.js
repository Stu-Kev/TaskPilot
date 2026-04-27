// Service Worker for TaskPilot PWA
const CACHE_NAME = 'taskpilot-v2';
const SCOPE_URL = new URL(self.registration.scope);
const ASSETS_TO_CACHE = [
  '',
  'index.html',
  'css/styles.css',
  'js/app.js',
  'js/db.js',
  'js/calendar.js',
  'js/events.js',
  'js/notes.js',
  'js/tasks.js',
  'js/bookings.js',
  'js/submissions.js',
  'js/forms.js',
  'js/admin.js',
  'manifest.json'
].map((path) => new URL(path, SCOPE_URL).href);

// Install event - cache same-origin app assets.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames
        .filter((name) => name !== CACHE_NAME)
        .map((name) => caches.delete(name))
    )).then(() => self.clients.claim())
  );
});

// Fetch event - network first for HTML/JS/CSS, cache first for everything else.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  const isAppShellAsset = ['document', 'script', 'style'].includes(event.request.destination);

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      if (isAppShellAsset) {
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          throw error;
        }
      }

      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;

      const networkResponse = await fetch(event.request);
      if (networkResponse && networkResponse.ok) {
        cache.put(event.request, networkResponse.clone());
      }
      return networkResponse;
    })()
  );
});
