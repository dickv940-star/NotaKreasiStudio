const CACHE_NAME = "kreasi-studio-v3";

const FILES_TO_CACHE = [
  "index.html",
  "manifest.json",
  "logo.png",
  "icon-192.png",
  "icon-512.png"
];

// INSTALL
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// FETCH (network-first for HTML, cache-first for static assets)
self.addEventListener("fetch", (event) => {
  if(event.request.method !== "GET") return;
  const url=new URL(event.request.url);
  if(url.pathname.endsWith("/index.html") || url.pathname === "/NotaKreasiStudio/"){
    event.respondWith(
      fetch(event.request).then(response=>{
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
        return response;
      }).catch(()=>caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response=>response || fetch(event.request))
  );
});
