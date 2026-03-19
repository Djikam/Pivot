// PIVOT SW v4 — stratégie ultra-conservative
// RÈGLE: ne mettre en cache QUE la page d'accueil comme fallback offline
// Ne JAMAIS intercepter les assets JS/CSS/fonts (fichiers hachés Vite)

const CACHE = 'pivot-shell-v4'

self.addEventListener('install', () => { self.skipWaiting() })

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const { request } = e
  const url = new URL(request.url)

  // 1. Ignorer tout sauf GET
  if (request.method !== 'GET') return

  // 2. Ignorer les assets hachés Vite — JAMAIS intercepter
  if (url.pathname.startsWith('/assets/')) return

  // 3. Ignorer les API externes
  if (
    url.hostname !== location.hostname ||
    url.pathname.startsWith('/rest/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/storage/') ||
    url.pathname.startsWith('/realtime/')
  ) return

  // 4. Navigation uniquement : network-first, fallback page d'accueil en cache
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then(res => {
          if (res.ok && res.status === 200) {
            const clone = res.clone()
            caches.open(CACHE).then(c => c.put(request, clone))
          }
          return res
        })
        .catch(() =>
          caches.match(request)
            .then(cached => cached || caches.match('/') || fetch('/'))
        )
    )
  }
  // 5. Tout le reste (favicon, manifest, icons): network uniquement, pas de cache
})
