const CACHE_NAME = 'frm-idpw-v1-4';
const APP_FILES = ['./', './index.html', './manifest.json', './icon.svg', './mascots-hero.svg'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Always check the network for app navigation/HTML so an installed iPhone PWA
  // does not keep showing an old screen. Fall back to the cached app offline.
  if (request.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const freshRequest = new Request(request, { cache: 'no-store' });
        const response = await fetch(freshRequest);
        if (response && response.ok) {
          await cache.put('./index.html', response.clone());
          return response;
        }
      } catch (error) {
        // Offline: serve the latest cached app shell.
      }
      return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
    })());
    return;
  }

  // Static assets are served from the current versioned cache first.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      return Response.error();
    }
  })());
});
