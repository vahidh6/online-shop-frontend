const CACHE_NAME = 'online-shop-v1';
const urlsToCache = [
  '/',
  '/products',
  '/cart',
  '/offline.html'
];

// نصب سرویس ورکر
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// فعال‌سازی سرویس ورکر
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// اینترسپت درخواست‌ها
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // اگر در کش بود، از کش برگردان
        if (response) {
          return response;
        }
        // اگر در کش نبود، از شبکه بگیر
        return fetch(event.request).catch(() => {
          // اگر آفلاین بود، صفحه آفلاین را نشان بده
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});