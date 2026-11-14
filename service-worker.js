const CACHE_NAME = 'gym-pwa-2a3da655cf';
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
  // lab HTML·JS·CSS·근육 지도 모두 네트워크 우선. 실패하면 같은 버전의 캐시로 연다.
  // 쿼리를 무시하면 새 HTML에 예전 엔진이 섞이므로 스크립트 버전은 정확히 일치해야 한다.
  if (new URL(e.request.url).pathname.includes('/lab/') && e.request.method === 'GET') {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const url = new URL(e.request.url);
      // HTML의 embed/t는 같은 문서다. 오프라인 첫 시트 열기도 방문했던 HTML을 쓴다.
      const key = url.pathname.endsWith('.html') ? new Request(url.origin + url.pathname) : e.request;
      try {
        const response = await fetch(e.request, { cache: 'no-cache' });
        if (!response.ok) throw new Error('lab request failed');
        await cache.put(key, response.clone());
        return response;
      } catch {
        return (await cache.match(key)) || new Response('시범을 먼저 온라인에서 열어 주세요.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
    })());
    return;
  }
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
