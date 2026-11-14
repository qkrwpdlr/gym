const CACHE_NAME = 'gym-pwa-6986f42977';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './fonts/BebasNeue-Regular.woff2',
  './fonts/JetBrainsMono-Regular.woff2',
  './fonts/JetBrainsMono-Bold.woff2'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // HTTP 캐시를 건너뛴다. 아니면 배포 직후 이전 index.html 이 새 캐시에 들어간다.
      Promise.all(ASSETS.map((asset) => cache.add(new Request(asset, { cache: 'reload' })).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // 페이지는 네트워크 우선: 새 배포가 바로 보이고, 오프라인이면 캐시로 연다.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' }).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((res) => {
        if (res && res.status === 200 && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
