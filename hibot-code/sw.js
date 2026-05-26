/* Hi Bot Code — Service Worker
   Cache-first strategy for offline support.
   Pre-caches the editor shell, CodeMirror bundle, and all major content pages.

   CACHE_NAME must match the `VERSION` file at the repo root. Bump both
   together on every release so clients evict the old cache on activate.
*/
const CACHE_NAME = 'bws-v2.13.5';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/editor.html',
  '/codemirror-bundle.js',
  '/cli-reference-data.js',
  '/manifest.json',
  '/favicon.svg',
  '/assets/hibot-theme.css',
  '/404.html',
  '/showcase.html',
  '/sw.js',
  '/learn.html',
  '/learn-tier-0.html',
  '/learn-tier-1.html',
  '/learn-tier-2.html',
  '/learn-tier-3.html',
  '/learn-tier-4.html',
  '/learn-tier-5.html',
  '/get-started-coding.html',
  '/glossary.html',
  '/ai-coding-landscape-2026.html',
  '/ai-roi-calculator.html',
  '/pull-requests-github.html',
  '/learn-to-code-age-12.html',
  '/how-backends-work-vercel-railway.html',
  '/ai-build-stack.html',
  '/challenges/',
  '/challenges/index.html',
  '/challenges/colors.html',
  '/challenges/button.html',
  '/challenges/card.html',
  '/challenges/hover.html',
  '/challenges/responsive.html',
  '/why-i-built-this.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only handle same-origin GET requests
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful same-origin responses
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/404.html') || caches.match('/index.html');
        }
      });
    })
  );
});
