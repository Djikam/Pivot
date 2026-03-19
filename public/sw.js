// PIVOT Service Worker — v3
// Stratégie: NE JAMAIS intercepter les assets hachés (/assets/*)
// Seules les pages navigables sont cachées comme fallback offline

const CACHE_NAME = 'pivot-pages-v3'
const OFFLINE_PAGES = ['/', '/joueurs', '/clubs', '/competitions', '/national']

self.addEventListener('install', e => {
  // Précacher uniquement les pages HTML (pas les assets)
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(OFFLINE_PAGES.map(p => new Request(p, { mode: 'navigate' }))))
      .catch(() => {}) // Pas bloquant
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  // Supprimer les anciens caches (évite le problème CSS/JS servi depuis cache périmé)
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)

  // ✅ Ne JAMAIS intercepter:
  // - Les assets hachés (/assets/*.js, /assets/*.css)
  // - Les appels API (supabase, anthropic)
  // - Les méthodes non-GET
  if (
    e.request.method !== 'GET' ||
    url.pathname.startsWith('/assets/') ||
    url.hostname.includes('supabase') ||
    url.hostname.includes('anthropic') ||
    url.hostname.includes('cloudinary') ||
    url.protocol === 'chrome-extension:'
  ) {
    return // Laisser passer sans interception
  }

  // Pour les navigations (pages HTML) : network-first, fallback cache
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          if (r.ok) {
            const clone = r.clone()
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone))
          }
          return r
        })
        .catch(() =>
          caches.match(e.request)
            .then(r => r || caches.match('/'))
        )
    )
  }
  // Tout le reste (fonts, images publiques) : network-first sans cache
})
