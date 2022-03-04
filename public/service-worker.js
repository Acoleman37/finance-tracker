const CACHE_NAME = "finance-tracker-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/assets/css/styles.css",
  "/assets/js/index.js",
  "/assets/js/idb.js",
  "/assets/images/icons/icon-192x192.png",
  "/assets/images/icons/icon-512x512.png",
  "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
  "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
];

// Install the service worker
self.addEventListener('install', function(evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Your files were pre-cached successfully!');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate the service worker and remove old data from the cache
self.addEventListener('activate', function(evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Removing old cache data', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    )
});

// Intercept fetch requests
self.addEventListener('fetch', function(evt) {

    // /api/
    if (evt.request.url.includes('/api/')) {
        evt.respondWith(
            caches
            .open(DATA_CACHE_NAME)
            .then(cache => {
                return fetch(evt.request)
                .then(response => {
                    // If the response was good, clone it and store it in the cache.
                    if (response.status === 200) {
                    cache.put(evt.request.url, response.clone());
                    }

                    return response;
                })
                .catch(err => {
                    // Network request failed, try to get it from the cache.
                    return cache.match(evt.request);
                });
            })
            .catch(err => console.log(err))
        );

        return;
    }

    evt.respondWith(
        fetch(evt.request).catch(function() {
            return caches.match(evt.request).then(function(response) {
            if (response) {
                return response;
            } else if (evt.request.headers.get('accept').includes('text/html')) {
                // return the cached home page for all requests for html pages
                return caches.match('/');
            }
            });
        })
    );
});