const cacheVersion = 1;
const staticCacheName = `cache-static-v${cacheVersion}`;
const assets = [
    './icons/android-chrome-192x192.png',
    './icons/android-chrome-512x512.png',
    './icons/apple-touch-icon.png',
    './bundle.css',
    './bundle.js',
    './favicon.ico',
    './index.html',
    './manifest.json'
];

// install event
self.addEventListener('install', evt => {
    console.log('ServiceWorker installed');
});

// activate event
self.addEventListener('activate', evt => evt.waitUntil(caches.open(staticCacheName).then(cache => cache.addAll(assets))));

// fetch event
self.addEventListener('fetch', evt => evt.respondWith(fetch(evt.request).catch(() => caches.match(evt.request))));
