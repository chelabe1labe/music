const CACHE_NAME = 'music-with-vibe-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  // Add other assets like logos
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if(url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then(cachedRes => {
        return cachedRes || fetch(event.request);
      })
    );
  } else {
    // For external API requests, fetch live
    event.respondWith(fetch(event.request));
  }
});
