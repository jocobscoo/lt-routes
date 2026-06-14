const CACHE = 'lt-routes-v2';
const SHELL = ['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(SHELL);
    try {
      const man = await fetch('./data/manifest.json').then(r => r.json());
      const files = ['./data/gates.json','./data/station.json','./data/manifest.json'].concat(man.map(f => './data/routes/' + f));
      await Promise.all(files.map(f => fetch(f).then(r => { if (r.ok) return c.put(f, r.clone()); }).catch(() => {})));
    } catch (e) {}
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; const url = new URL(req.url);
  if (url.origin !== location.origin) return;           // Apple Maps vb. -> network
  e.respondWith(
    fetch(req).then(resp => {                            // network-first: guncel kalsin
      if (req.method === 'GET' && resp && resp.status === 200) {
        const copy = resp.clone(); caches.open(CACHE).then(c => c.put(req, copy));
      }
      return resp;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
