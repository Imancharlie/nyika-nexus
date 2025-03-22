
// This is the service worker with the Cache-first network strategy

const CACHE = "nyika-nexus-v1";

// Add list of files to cache here.
const precacheResources = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
];

// Install stage sets up the cache-array to configure pre-cache content
self.addEventListener('install', (event: any) => {
  console.log('Service worker: Install');
  
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => {
        console.log('Service worker: Caching all content');
        return cache.addAll(precacheResources);
      })
  );
});

// Activate event fires when the service worker starts up
self.addEventListener('activate', (event: any) => {
  console.log('Service worker: Activate');
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE) {
          console.log('Service worker: Removing old cache', key);
          return caches.delete(key);
        }
        return Promise.resolve();
      }));
    })
  );
  
  return self.clients.claim();
});

// Fetch event happens for every request
self.addEventListener('fetch', (event: any) => {
  console.log('Service worker: Fetch event for ', event.request.url);
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          console.log('Service worker: Found in cache ', event.request.url);
          return response;
        }
        
        // Not in cache - fetch and cache
        return fetch(event.request)
          .then((res) => {
            // Check if we received a valid response
            if (!res || res.status !== 200 || res.type !== 'basic') {
              return res;
            }
            
            // Clone the response - one to cache, one to return
            const responseToCache = res.clone();
            
            caches.open(CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return res;
          });
      })
  );
});

// This allows the service worker to be properly typed
declare const self: ServiceWorkerGlobalScope;
export {};
