const CACHE_NAME = 'soma-cache-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/index.tsx'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          // Put a copy in cache
          return caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(event.request, response.clone());
            } catch (e) {
              // some requests may be opaque and not cacheable
            }
            return response;
          });
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});
