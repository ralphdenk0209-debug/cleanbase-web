/* Root Index Service-Worker – App-Shell-Cache + Offline-Fallback.
   NUR same-origin wird gecacht. Supabase/API laufen immer übers Netz.

   2026-07-13: Cache-Version an den Build gekoppelt.
   Vorher hiess der Cache dauerhaft 'cleanbase-v1' und wurde bei einem Deploy
   nie verworfen. Zusammen mit einer offen gelassenen App fuehrte das dazu,
   dass Nutzer weiter mit altem Code arbeiteten.
   BEI JEDEM DEPLOY DIESE ZAHL HOCHZAEHLEN – dann wirft activate den alten Cache weg. */
const CACHE = 'rootindex-2026-07-14c';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // externe (Supabase) nie abfangen

  // index.html IMMER frisch aus dem Netz – sonst sieht der Nutzer nie ein Update.
  // Nur wenn das Netz weg ist, kommt die Kopie aus dem Cache.
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    e.respondWith(
      fetch(req, { cache: 'no-store' })
        .then((r) => {
          const cp = r.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', cp));
          return r;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Sonstige same-origin Assets (Icons, Bilder): Cache-first, das ist unkritisch.
  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req)
        .then((r) => {
          if (r && r.ok) {
            const cp = r.clone();
            caches.open(CACHE).then((c) => c.put(req, cp));
          }
          return r;
        })
        .catch(() => hit)
    )
  );
});
