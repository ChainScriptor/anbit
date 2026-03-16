
const CACHE_NAME = 'anbit-warrior-v1';
const ASSETS = [
  '/',
  '/index.html'
  // Αφαιρέσαμε εξωτερικά URLs (cdn.tailwindcss, fonts) γιατί cache.addAll() προκαλεί CORS στο install
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
