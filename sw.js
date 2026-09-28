var CACHE = 'talmut-v2';
var ASSETS = [
  '/Talmut/',
  '/Talmut/index.html',
  '/Talmut/manifest.json',
  '/Talmut/Logo_Talmut.png',
  '/Talmut/Talmut.png',
  '/Talmut/Blue_Lagoon.png',
  '/Talmut/Histórico.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var req = e.request;
  var isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1;

  if (isHTML) {
    // El HTML de la app: red primero, para que cualquier actualización
    // se vea en cuanto la subas. Si no hay conexión, se usa la última
    // copia guardada como respaldo.
    e.respondWith(
      fetch(req).then(function(res) {
        var copy = res.clone();
        caches.open(CACHE).then(function(cache) { cache.put(req, copy); });
        return res;
      }).catch(function() {
        return caches.match(req).then(function(cached) {
          return cached || caches.match('/Talmut/index.html');
        });
      })
    );
    return;
  }

  // Resto de archivos (imágenes, manifest...): caché primero, y si no
  // están guardados, se piden a la red.
  e.respondWith(
    caches.match(req).then(function(cached) {
      return cached || fetch(req);
    })
  );
});
