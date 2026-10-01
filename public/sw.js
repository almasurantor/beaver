const CACHE_NAME = 'beaver-smash-static-v1';
const OFFLINE_ASSETS = [
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.mode !== 'navigate' || request.method !== 'GET') return;

  // Pages and Supabase-backed data always come from the network. The cache is
  // used only for a static offline explanation when navigation truly fails.
  event.respondWith(fetch(request, { cache: 'no-store' }).catch(() => caches.match('/offline.html')));
});
