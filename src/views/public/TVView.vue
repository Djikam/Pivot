<template>
  <div class="tv-view">
    <!-- Hero -->
    <section class="tv-hero">
      <div class="hero-bg"/>
      <div class="p-container tv-hero-inner">
        <div class="hero-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
          HBALL237 TV
        </div>
        <h1 class="font-display tv-hero-title">Handball camerounais<br/>en images.</h1>
        <p class="tv-hero-desc">Matchs en direct, highlights, résumés et archives vidéo du handball camerounais.</p>
      </div>
    </section>

    <!-- Live en cours -->
    <section v-if="liveVideos.length" class="p-container live-section">
      <div class="section-header">
        <h2 class="section-title font-display">
          <span class="live-dot-inline"/><span class="live-dot-inline" style="animation-delay:.3s"/>
          En Direct
        </h2>
      </div>
      <div class="live-grid">
        <div v-for="v in liveVideos" :key="v.id" class="live-card" @click="openVideo(v)">
          <div class="live-thumb">
            <img :src="ytThumb(v.youtube_id,'maxresdefault')" :alt="v.titre" loading="lazy" />
            <div class="live-badge-overlay">
              <span class="live-dot-inline"/>LIVE
            </div>
            <div class="play-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          </div>
          <div class="live-info">
            <h3 class="live-title">{{ v.titre }}</h3>
            <p v-if="v.description" class="live-desc text-sub">{{ v.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="p-container" style="padding-bottom:80px">
      <!-- Filtres -->
      <div class="tv-filters">
        <div class="filter-tabs">
          <button v-for="cat in categories" :key="cat.value"
            class="filter-tab" :class="{ active: activeFilter===cat.value }"
            @click="setFilter(cat.value)">
            {{ cat.label }}
          </button>
        </div>
        <div class="search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" class="search-input" placeholder="Rechercher une vidéo…" @input="debSearch"/>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state"><div class="spinner"/></div>

      <!-- Videos grid -->
      <div v-else-if="videos.length" class="videos-grid">
        <div v-for="v in videos" :key="v.id" class="video-card p-card" @click="openVideo(v)">
          <div class="video-thumb">
            <img :src="ytThumb(v.youtube_id,'mqdefault')" :alt="v.titre" loading="lazy"/>
            <div class="thumb-overlay">
              <div class="play-circle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
            <span class="video-cat-badge p-badge p-badge-muted">{{ v.categorie }}</span>
          </div>
          <div class="video-info">
            <h3 class="video-title truncate-2">{{ v.titre }}</h3>
            <p v-if="v.description" class="video-desc text-sub truncate-2">{{ v.description }}</p>
            <div class="video-meta">
              <span class="text-sub">{{ formatDate(v.publie_le) }}</span>
              <span v-if="v.vues" class="text-sub">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {{ v.vues }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
        <p>Aucune vidéo disponible pour l'instant.</p>
        <span class="text-sub" style="font-size:13px">Les vidéos seront ajoutées prochainement.</span>
      </div>
    </div>

    <!-- Player Modal -->
    <Transition name="modal">
      <div v-if="activeVideo" class="player-overlay" @click.self="closeVideo">
        <div class="player-modal">
          <div class="player-header">
            <div>
              <h3 class="player-title">{{ activeVideo.titre }}</h3>
              <span v-if="activeVideo.en_direct" class="p-badge p-badge-live">
                <span class="live-dot-inline"/>EN DIRECT
              </span>
            </div>
            <button class="player-close" @click="closeVideo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="player-embed">
            <iframe
              :src="`https://www.youtube.com/embed/${activeVideo.youtube_id}?autoplay=1&rel=0&modestbranding=1`"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              frameborder="0"
            />
          </div>
          <div v-if="activeVideo.description" class="player-desc text-sub">
            {{ activeVideo.description }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const videos      = ref<any[]>([])
const loading     = ref(true)
const activeFilter = ref('')
const search       = ref('')
const activeVideo  = ref<any>(null)

const liveVideos = computed(() => videos.value.filter(v => v.en_direct))

const categories = [
  { value: '',           label: 'Tout'       },
  { value: 'Highlight',  label: 'Highlights' },
  { value: 'Match',      label: 'Matchs'     },
  { value: 'Replay',     label: 'Replays'    },
  { value: 'Interview',  label: 'Interviews' },
  { value: 'Formation',  label: 'Formation'  },
  { value: 'National',   label: 'National'   },
]

function ytThumb(id: string, quality = 'mqdefault') {
  return `https://img.youtube.com/vi/${id}/${quality}.jpg`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function setFilter(val: string) {
  activeFilter.value = val
  load()
}

async function load() {
  loading.value = true
  let q = supabase.from('tv_videos')
    .select('*')
    .order('publie_le', { ascending: false })
    .limit(60)
  if (activeFilter.value) q = q.eq('categorie', activeFilter.value)
  if (search.value.trim()) q = q.ilike('titre', `%${search.value}%`)
  const { data } = await q
  videos.value = data ?? []
  loading.value = false
}

async function openVideo(v: any) {
  activeVideo.value = v
  document.body.style.overflow = 'hidden'
  // Incrémenter vues
  await supabase.from('tv_videos').update({ vues: (v.vues ?? 0) + 1 }).eq('id', v.id)
}

function closeVideo() {
  activeVideo.value = null
  document.body.style.overflow = ''
}

let debTimer: ReturnType<typeof setTimeout>
function debSearch() { clearTimeout(debTimer); debTimer = setTimeout(load, 350) }

onMounted(load)
</script>

<style scoped>
/* Hero */
.tv-view { min-height: 100vh; }
.tv-hero {
  position: relative; padding: 60px 0 48px;
  overflow: hidden;
}
.hero-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 80% 70% at 50% 0%, rgba(206,17,38,0.12) 0%, rgba(201,162,39,0.06) 40%, transparent 70%);
}
.tv-hero-inner { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-display); font-size: 13px; letter-spacing: 0.14em;
  color: var(--p-red); padding: 6px 14px; border-radius: 99px;
  background: rgba(206,17,38,0.08); border: 1px solid rgba(206,17,38,0.25);
  width: fit-content;
}
.tv-hero-title { font-size: clamp(2rem, 5vw, 3.4rem); line-height: 1.05; }
.tv-hero-desc { color: var(--p-sub); font-size: 15px; max-width: 500px; }

/* Live section */
.live-section { margin-bottom: 40px; }
.live-dot-inline {
  display: inline-block; width: 8px; height: 8px; border-radius: 50%;
  background: var(--p-red); margin-right: 6px;
  animation: pulseLive 1.4s ease-in-out infinite;
}
.live-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; margin-top: 20px; }
.live-card { cursor: pointer; border-radius: var(--radius-lg); overflow: hidden; background: var(--p-card); border: 1px solid rgba(206,17,38,0.3); transition: transform 200ms, box-shadow 200ms; }
.live-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(206,17,38,0.2); }
.live-thumb { position: relative; aspect-ratio: 16/9; overflow: hidden; }
.live-thumb img { width: 100%; height: 100%; object-fit: cover; }
.live-badge-overlay {
  position: absolute; top: 12px; left: 12px;
  display: flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 99px;
  background: var(--p-red); color: #fff;
  font-size: 11px; font-weight: 800; letter-spacing: 0.1em;
}
.play-btn {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.9); opacity: 0;
  background: rgba(0,0,0,0.3); transition: opacity 200ms;
}
.live-card:hover .play-btn { opacity: 1; }
.play-btn svg { filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5)); width: 48px; height: 48px; }
.live-info { padding: 16px 20px; }
.live-title { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
.live-desc { font-size: 13px; line-height: 1.5; }

/* Filters */
.tv-filters {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  padding: 28px 0; border-bottom: 1px solid var(--p-border-s); margin-bottom: 32px;
}
.filter-tabs { display: flex; gap: 4px; flex-wrap: wrap; flex: 1; }
.filter-tab {
  padding: 6px 14px; border-radius: 99px;
  font-size: 12px; font-weight: 600; font-family: var(--font-condensed); letter-spacing: 0.04em;
  border: 1px solid var(--p-border); color: var(--p-sub); background: transparent;
  transition: all 130ms;
}
.filter-tab:hover { border-color: var(--p-red); color: var(--p-text); }
.filter-tab.active { background: var(--p-red); border-color: var(--p-red); color: #fff; }

.search-wrap { position: relative; }
.search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--p-muted); pointer-events: none; }
.search-input {
  padding: 8px 14px 8px 34px; border-radius: 99px;
  background: var(--p-bg2); border: 1px solid var(--p-border);
  color: var(--p-text); font-size: 13px; width: 200px; outline: none;
  transition: border-color 130ms, width 200ms;
}
.search-input:focus { border-color: var(--p-gold); width: 240px; }

/* Videos grid */
.videos-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.video-card { cursor: pointer; overflow: hidden; transition: transform 200ms, box-shadow 200ms; }
.video-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
.video-thumb { position: relative; aspect-ratio: 16/9; overflow: hidden; background: var(--p-bg3); }
.video-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 300ms; }
.video-card:hover .video-thumb img { transform: scale(1.05); }
.thumb-overlay {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.25); opacity: 0; transition: opacity 200ms;
}
.video-card:hover .thumb-overlay { opacity: 1; }
.play-circle {
  width: 50px; height: 50px; border-radius: 50%;
  background: rgba(201,162,39,0.95); display: flex; align-items: center; justify-content: center;
  color: #08080E;
}
.video-cat-badge { position: absolute; bottom: 8px; left: 8px; font-size: 10px !important; }
.video-info { padding: 12px 14px 16px; display: flex; flex-direction: column; gap: 6px; }
.video-title { font-size: 14px; font-weight: 700; line-height: 1.4; }
.video-desc { font-size: 12px; line-height: 1.45; }
.video-meta { display: flex; align-items: center; gap: 12px; font-size: 11px; }
.video-meta svg { vertical-align: middle; margin-right: 3px; }

/* Player modal */
.player-overlay {
  position: fixed; inset: 0; z-index: 400;
  background: rgba(0,0,0,0.85);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.player-modal {
  width: 100%; max-width: 960px;
  background: var(--p-card); border-radius: var(--radius-xl);
  border: 1px solid var(--p-border);
  overflow: hidden;
}
.player-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--p-border);
  gap: 16px;
}
.player-title { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.player-close {
  width: 32px; height: 32px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--p-border); color: var(--p-sub);
  transition: color 120ms, background 120ms;
}
.player-close:hover { color: var(--p-red); background: var(--p-red-soft); }
.player-embed { position: relative; aspect-ratio: 16/9; background: #000; }
.player-embed iframe { width: 100%; height: 100%; position: absolute; inset: 0; }
.player-desc { padding: 14px 20px; font-size: 13px; line-height: 1.6; border-top: 1px solid var(--p-border); }

.modal-enter-active, .modal-leave-active { transition: opacity 200ms; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

@keyframes pulseLive {
  0%,100%{opacity:1} 50%{opacity:.3}
}

@media (max-width: 1100px) { .videos-grid { grid-template-columns: repeat(3,1fr); } }
@media (max-width: 800px)  { .videos-grid { grid-template-columns: repeat(2,1fr); } .live-grid { grid-template-columns: 1fr; } }
@media (max-width: 500px)  { .videos-grid { grid-template-columns: 1fr; } }
</style>
