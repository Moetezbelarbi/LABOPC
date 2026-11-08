/* LABOPC service worker — update CACHE_VERSION whenever a deployed asset changes. */
const CACHE_VERSION = 'labopc-v6.1.0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_RUNTIME = `${CACHE_VERSION}-runtime`;
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './version.json',
  './icon/icon-192.png',
  './icon/icon-512.png',
  './icon/apple-touch-icon.png',
  './js/app-core.js',
  './js/mod-chimie.js',
  './js/mod-physique.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith('labopc-') && key !== CACHE_STATIC && key !== CACHE_RUNTIME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation: network first, cached application shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_RUNTIME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  // Static assets: cache first, then network and refresh runtime cache.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_RUNTIME).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
