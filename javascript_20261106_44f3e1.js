/* ============================================================
   LABOPC — Service Worker
   © M.Belarbi — Tous droits réservés.
   Cache-first avec mise à jour automatique
   ============================================================ */

const CACHE_VERSION = 'labopc-v1.0.0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_RUNTIME = `${CACHE_VERSION}-runtime`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './version.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

// ============================================================
// INSTALLATION
// ============================================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installation', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(PRECACHE_URLS).catch(err => {
        console.warn('[SW] Certains fichiers non mis en cache:', err);
      }))
      .then(() => self.skipWaiting())
  );
});

// ============================================================
// ACTIVATION
// ============================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_STATIC && key !== CACHE_RUNTIME)
          .map(key => {
            console.log('[SW] Suppression ancien cache:', key);
            return caches.delete(key);
          })
    )).then(() => self.clients.claim())
  );
});

// ============================================================
// FETCH — cache-first
// ============================================================
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // version.json → réseau en priorité (pour la vérif MAJ)
  if (url.pathname.endsWith('/version.json')) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // Navigation → réseau en priorité, cache en fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_RUNTIME).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Autres → cache-first
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        fetch(req).then(res => {
          if (res && res.status === 200) {
            caches.open(CACHE_RUNTIME).then(c => c.put(req, res));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_RUNTIME).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

// ============================================================
// MESSAGE — forcer l'activation
// ============================================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});