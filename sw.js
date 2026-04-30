// Service Worker - オフライン対応＆キャッシュ管理
const CACHE_NAME = 'okozukai-v1';
const ASSETS = [
  './',
  './okozukai.html',
  './index.html'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request).then(networkRes => {
        // 同オリジンならキャッシュに追加
        if (e.request.url.startsWith(self.location.origin)) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return networkRes;
      }).catch(() => caches.match('./okozukai.html'));
    })
  );
});
