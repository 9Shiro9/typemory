/* Typemory service worker — network-first with full offline fallback.
   Every successful fetch refreshes the cache, so pushes go live on next
   online launch while offline play always works from the last good copy. */
const CACHE = "typemory-v2";
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/icon-180.png",
  "./assets/sprites/bloody_zombie.png",
  "./assets/sprites/boss_0.png",
  "./assets/sprites/boss_12.png",
  "./assets/sprites/boss_4.png",
  "./assets/sprites/boss_8.png",
  "./assets/sprites/fx_circle_01.png",
  "./assets/sprites/fx_circle_05.png",
  "./assets/sprites/fx_flare_01.png",
  "./assets/sprites/fx_muzzle_01.png",
  "./assets/sprites/fx_muzzle_02.png",
  "./assets/sprites/fx_slash_01.png",
  "./assets/sprites/fx_smoke_04.png",
  "./assets/sprites/fx_smoke_05.png",
  "./assets/sprites/fx_spark_02.png",
  "./assets/sprites/fx_spark_04.png",
  "./assets/sprites/graveyard.png",
  "./assets/sprites/headless_zombie.png",
  "./assets/sprites/rotting_zombie.png",
  "./assets/sprites/zombie.png",
  "./assets/fonts/creepster-latin.woff2",
  "./assets/fonts/jetbrains-mono-700-latin-ext.woff2",
  "./assets/fonts/jetbrains-mono-700-latin.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() =>
      caches.match(e.request).then(m => m || caches.match("./index.html"))
    )
  );
});
