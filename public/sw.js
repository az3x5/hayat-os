const CACHE_NAME = 'hayatos-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip caching for API calls or browser-sync/HMR
    if (url.pathname.startsWith('/api') || url.pathname.includes('hot')) {
        return;
    }

    // Network First, Cache Fallback Strategy
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return fetch(event.request)
                .then((response) => {
                    // Cache successful responses (including CDN/CORS)
                    // response.type 'cors' is for CDN
                    if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
                        return response;
                    }
                    // Cache it
                    cache.put(event.request, response.clone());
                    return response;
                })
                .catch(() => {
                    // Fallback to cache
                    return cache.match(event.request);
                });
        })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
