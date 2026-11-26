const CACHE_NAME = 'giancani-studio-pwa-v14';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css',
  './js/storage.js',
  './js/gemini_client.js',
  './js/beat_detector.js',
  './js/video_engine.js',
  './js/generator_engine.js',
  './js/crm_venditori_acquirenti.js',
  './js/agenda_fogli_visita.js',
  './js/app_core.js',
  './js/venditori_ui.js',
  './js/acquirenti_ui.js',
  './js/galleria_ui.js',
  './js/video_diretta_ui.js',
  './js/app.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/logo_default.png',
  './data/archivio_colonna_f.json',
  './data/cacciatori_dataset.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== 'GET' ||
    url.hostname.includes('generativelanguage.googleapis.com') ||
    url.hostname.includes('script.google.com') ||
    url.hostname.includes('googleusercontent.com') ||
    url.hostname.includes('api.telegram.org')
  ) {
    return;
  }
  // Network-first per avere sempre l'app web, i database e il logo scontornato aggiornati
  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        if (resp && resp.status === 200 && url.origin === self.location.origin) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return resp;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
