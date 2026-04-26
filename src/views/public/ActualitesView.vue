<template>
  <div>
    <!-- Hero -->
    <section class="feed-hero">
      <div class="p-container">
        <div class="hero-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6z"/></svg>
          FEED — ACTUALITÉS
        </div>
        <h1 class="hero-title font-display">Le handball camerounais<br/>en temps réel.</h1>
        <p class="hero-desc">Résumés de matchs, transferts, analyses et actualités du handball camerounais.</p>
      </div>
    </section>

    <div class="p-container" style="padding-bottom:80px">

      <!-- Filtres -->
      <div class="filters-bar">
        <div class="filter-tabs">
          <button v-for="cat in categories" :key="cat.value"
            class="filter-tab"
            :class="{ active: activeCategorie === cat.value }"
            @click="setCategorie(cat.value)">
            {{ cat.label }}
          </button>
        </div>
        <div class="search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" class="search-input" placeholder="Rechercher…" @input="debouncedLoad" />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state"><div class="spinner"/></div>

      <!-- Grid articles -->
      <div v-else-if="articles.length" class="articles-grid">
        <!-- Featured article (premier) -->
        <RouterLink v-if="articles[0]" :to="'/actualites/'+articles[0].slug" class="featured-card p-card">
          <div class="featured-img" :style="getImgStyle(articles[0])">
            <div class="featured-overlay"/>
            <div class="featured-content">
              <div class="card-badges">
                <span class="p-badge p-badge-gold">{{ articles[0].categorie }}</span>
                <span v-if="articles[0].genere_par_ia" class="p-badge p-badge-blue">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  IA
                </span>
              </div>
              <h2 class="featured-title font-display">{{ articles[0].titre }}</h2>
              <p class="featured-excerpt">{{ articles[0].contenu.slice(0,180) }}…</p>
              <div class="card-meta">
                <span>{{ formatDate(articles[0].publie_le) }}</span>
                <span v-if="articles[0].auteur">· {{ articles[0].auteur }}</span>
              </div>
            </div>
          </div>
        </RouterLink>

        <!-- Autres articles -->
        <RouterLink v-for="a in articles.slice(1)" :key="a.id" :to="'/actualites/'+a.slug" class="article-card p-card">
          <div class="card-img-wrap">
            <div class="card-img" :style="getImgStyle(a)"/>
            <span class="card-cat p-badge p-badge-muted">{{ a.categorie }}</span>
            <span v-if="a.genere_par_ia" class="card-ia">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              IA
            </span>
          </div>
          <div class="card-body">
            <h3 class="card-title truncate-2">{{ a.titre }}</h3>
            <p class="card-excerpt text-sub truncate-2">{{ a.contenu.slice(0,120) }}</p>
            <div class="card-footer">
              <span class="card-date text-sub">{{ formatDateShort(a.publie_le) }}</span>
              <span class="read-more">Lire
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </div>
          </div>
        </RouterLink>
      </div>

      <!-- Empty -->
      <div v-else class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
        <p>Aucun article trouvé.</p>
      </div>

      <!-- Load more -->
      <div v-if="!loading && hasMore" class="load-more">
        <button class="p-btn-ghost" @click="loadMore" :disabled="loadingMore">
          <div v-if="loadingMore" class="spinner" style="width:16px;height:16px;border-width:2px"/>
          <span v-else>Voir plus d'articles</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const LIMIT = 13
const articles = ref<any[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(false)
const search = ref('')
const activeCategorie = ref('')

const categories = [
  { value: '', label: 'Tout' },
  { value: 'Actualité', label: 'Actualité' },
  { value: 'Résumé match', label: 'Résumés' },
  { value: 'Interview', label: 'Interviews' },
  { value: 'Analyse', label: 'Analyses' },
  { value: 'Transfert', label: 'Transferts' },
  { value: 'National', label: 'National' },
]

// Placeholder gradient by category
const catColors: Record<string, string> = {
  'Actualité':    'linear-gradient(135deg, #1C1428 0%, #2A1E38 100%)',
  'Résumé match': 'linear-gradient(135deg, #0A1520 0%, #0E2030 100%)',
  'Interview':    'linear-gradient(135deg, #14100A 0%, #1E180E 100%)',
  'Analyse':      'linear-gradient(135deg, #0A1410 0%, #0E2018 100%)',
  'Transfert':    'linear-gradient(135deg, #18100A 0%, #241408 100%)',
  'National':     'linear-gradient(135deg, #0C1C0C 0%, #0E2010 100%)',
}

function getImgStyle(a: any) {
  if (a.image_url) return { backgroundImage: `url(${a.image_url})` }
  const grad = catColors[a.categorie] || 'linear-gradient(135deg, #0F0F1E 0%, #1A1A2E 100%)'
  return { background: grad }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}
function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function setCategorie(val: string) {
  activeCategorie.value = val
  load()
}

async function load() {
  loading.value = true
  let q = supabase.from('articles')
    .select('id,titre,slug,categorie,contenu,genere_par_ia,fournisseur_ia,auteur,publie_le,image_url,image_cloudinary_id', { count: 'exact' })
    .order('publie_le', { ascending: false })
    .limit(LIMIT)
  if (search.value) q = q.ilike('titre', `%${search.value}%`)
  if (activeCategorie.value) q = q.eq('categorie', activeCategorie.value)
  const { data, count } = await q
  articles.value = data ?? []
  hasMore.value = (count ?? 0) > LIMIT
  loading.value = false
}

async function loadMore() {
  loadingMore.value = true
  let q = supabase.from('articles')
    .select('id,titre,slug,categorie,contenu,genere_par_ia,fournisseur_ia,auteur,publie_le,image_url,image_cloudinary_id')
    .order('publie_le', { ascending: false })
    .range(articles.value.length, articles.value.length + LIMIT - 1)
  if (search.value) q = q.ilike('titre', `%${search.value}%`)
  if (activeCategorie.value) q = q.eq('categorie', activeCategorie.value)
  const { data } = await q
  if (data) {
    articles.value.push(...data)
    hasMore.value = data.length === LIMIT
  }
  loadingMore.value = false
}

let debTimer: ReturnType<typeof setTimeout>
function debouncedLoad() { clearTimeout(debTimer); debTimer = setTimeout(load, 340) }

onMounted(load)
</script>

<style scoped>
.feed-hero {
  padding: 56px 0 40px;
  background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,162,39,0.08) 0%, transparent 70%);
  border-bottom: 1px solid var(--p-border-s);
}
.hero-label {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-condensed); font-size: 11px; font-weight: 700;
  letter-spacing: 0.14em; color: var(--p-gold); margin-bottom: 16px;
}
.hero-title { font-size: clamp(2rem, 5vw, 3.2rem); line-height: 1.05; margin-bottom: 12px; }
.hero-desc { color: var(--p-sub); font-size: 15px; max-width: 480px; }

/* Filtres */
.filters-bar {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  padding: 24px 0 28px;
  border-bottom: 1px solid var(--p-border-s); margin-bottom: 32px;
}
.filter-tabs { display: flex; gap: 4px; flex-wrap: wrap; flex: 1; }
.filter-tab {
  padding: 6px 14px; border-radius: 99px;
  font-size: 12px; font-weight: 600; font-family: var(--font-condensed);
  letter-spacing: 0.04em;
  border: 1px solid var(--p-border); color: var(--p-sub); background: transparent;
  transition: all 130ms;
}
.filter-tab:hover { border-color: var(--p-gold); color: var(--p-text); }
.filter-tab.active { background: var(--p-gold); border-color: var(--p-gold); color: #08080E; }

.search-wrap { position: relative; }
.search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--p-muted); pointer-events: none; }
.search-input {
  padding: 8px 14px 8px 34px; border-radius: 99px;
  background: var(--p-bg2); border: 1px solid var(--p-border);
  color: var(--p-text); font-size: 13px; width: 200px;
  transition: border-color 130ms, width 200ms;
}
.search-input:focus { border-color: var(--p-gold); outline: none; width: 240px; }

/* Grid */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto;
  gap: 16px;
}

/* Featured article spans 2 cols x 2 rows */
.featured-card {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
  display: block;
  overflow: hidden;
  min-height: 400px;
}
.featured-img {
  width: 100%; height: 100%; min-height: 400px;
  background-size: cover; background-position: center;
  position: relative; display: flex; align-items: flex-end;
  border-radius: var(--radius-lg);
  transition: transform 300ms;
}
.featured-card:hover .featured-img { transform: scale(1.01); }
.featured-overlay {
  position: absolute; inset: 0; border-radius: var(--radius-lg);
  background: linear-gradient(to top, rgba(8,8,14,0.95) 0%, rgba(8,8,14,0.4) 50%, transparent 100%);
}
.featured-content {
  position: relative; z-index: 1;
  padding: 28px; display: flex; flex-direction: column; gap: 10px;
}
.featured-title { font-size: clamp(1.4rem, 2.5vw, 2rem); line-height: 1.1; color: #fff; }
.featured-excerpt { font-size: 14px; color: rgba(242,237,228,0.7); line-height: 1.6; }

/* Regular cards */
.article-card { display: flex; flex-direction: column; overflow: hidden; }
.card-img-wrap { position: relative; height: 160px; flex-shrink: 0; }
.card-img {
  width: 100%; height: 100%;
  background-size: cover; background-position: center;
  transition: transform 300ms;
}
.article-card:hover .card-img { transform: scale(1.04); }
.card-cat {
  position: absolute; top: 10px; left: 10px;
  font-size: 10px !important;
}
.card-ia {
  position: absolute; top: 10px; right: 10px;
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 7px; border-radius: 99px;
  background: rgba(74,144,208,0.2); border: 1px solid rgba(74,144,208,0.3);
  color: var(--p-blue); font-size: 9px; font-weight: 700;
}
.card-body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.card-title { font-size: 14px; font-weight: 700; line-height: 1.4; }
.card-excerpt { font-size: 12px; line-height: 1.5; }
.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
.card-date { font-size: 11px; }
.read-more { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: var(--p-gold); }

.card-badges { display: flex; gap: 6px; flex-wrap: wrap; }
.card-meta { font-size: 12px; color: rgba(242,237,228,0.5); display: flex; gap: 4px; }

.load-more { display: flex; justify-content: center; padding: 40px 0 0; }

@media (max-width: 1100px) { .articles-grid { grid-template-columns: repeat(3,1fr); } }
@media (max-width: 800px) {
  .articles-grid { grid-template-columns: repeat(2,1fr); }
  .featured-card { grid-column: 1 / 3; }
}
@media (max-width: 540px) {
  .articles-grid { grid-template-columns: 1fr; }
  .featured-card { grid-column: 1; grid-row: auto; }
  .featured-img { min-height: 280px; }
}
</style>
