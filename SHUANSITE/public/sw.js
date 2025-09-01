const CACHE_NAME = 'shuan-cache-v1';
const urlsToCache = [
  '/',
  '/static/js/main.bundle.js',
  '/static/css/main.css',
  '/looped.mp4',
  '/5555-optimized.png',
  '/lock-loop.mp4',
  '/innerlining.mp4',
  '/backpack-animation1.mp4',
  '/backpack23-animation-loop.mp4'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
}); 