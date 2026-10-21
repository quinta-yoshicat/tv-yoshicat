const V = "tv-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // só trata a própria app e o leitor hls.js; os vídeos dos canais vão direto à rede
  const own = u.origin === location.origin;
  const player = u.hostname === "cdnjs.cloudflare.com";
  if (!own && !player) return;
  e.respondWith(
    fetch(e.request).then(r => { if (r && r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); } return r; })
      .catch(() => caches.match(e.request))
  );
});
