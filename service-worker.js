const CACHE_NAME = 'sayad-pro-cache-v1';
const assetsToCache = [
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;900&display=swap'
];

// تثبيت ملف الخدمة وتخزين الملفات الأساسية
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('تخزين ملفات التطبيق مؤقتاً...');
      return cache.addAll(assetsToCache);
    })
  );
});

// تفعيل ملف الخدمة وحذف التخزين القديم إذا وجد
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// التعامل مع طلبات الشبكة (للسماح بالعمل في حالة ضعف الإنترنت)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});
