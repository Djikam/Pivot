<template>
  <div class="clubs-view">
    <section class="p-hero" style="padding:40px 0 32px">
      <div class="p-container">
        <h1 class="font-display" style="font-size:2.2rem;font-weight:700;margin-bottom:6px">ATLAS — Clubs</h1>
        <p class="text-sub">{{ total }} clubs enregistrés au Cameroun</p>
      </div>
    </section>
    <div class="p-container" style="padding-top:24px;padding-bottom:60px">
      <div class="filters-bar">
        <input v-model="search" class="p-input" placeholder=" Rechercher un club…" style="flex:1;max-width:320px" @input="debouncedLoad" />
        <select v-model="filterRegion" class="p-input p-select" @change="load">
          <option value="">Toutes les régions</option>
          <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
        </select>
        <select v-model="filterGenre" class="p-input p-select" @change="load">
          <option value="">Tous genres</option>
          <option value="masculin">Masculin</option>
          <option value="feminin">Féminin</option>
          <option value="mixte">Mixte</option>
        </select>
        <label class="toggle-label">
          <input type="checkbox" v-model="filterUniv" @change="load" /> Universitaires
        </label>
      </div>
      <div v-if="loading" class="loading-state"><div class="spinner" /></div>
      <div v-else class="clubs-grid">
        <RouterLink v-for="c in clubs" :key="c.id" :to="'/clubs/'+c.id" class="club-card p-card">
          <div class="club-logo">
            <img v-if="c.logo_cloudinary_id" :src="cloudinaryUrl(c.logo_cloudinary_id,{w:64,h:64})" :alt="c.nom" />
            <span v-else class="club-initials font-display">{{ c.acronyme || c.nom.slice(0,3).toUpperCase() }}</span>
          </div>
          <div class="club-body">
            <div class="club-nom">{{ c.nom }}</div>
            <div class="club-meta text-sub">
              <span><svg class="inline w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> {{ c.ville }}, {{ c.pays === 'Cameroun' ? c.region : c.pays }}{{ c.pays !== 'Cameroun' ? ' ' : '' }}</span>
              <span v-if="c.universitaire" class="p-badge p-badge-blue" style="font-size:9px"><svg class="inline w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg> Univ.</span>
            </div>
          </div>
          <svg class="club-arrow text-sub" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </RouterLink>
      </div>
      <div v-if="!loading && clubs.length === 0" class="empty-state"><span></span><p>Aucun club trouvé.</p></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase, cloudinaryUrl } from '@/lib/supabaseClient'

const clubs = ref<any[]>([])
const total = ref(0)
const loading = ref(true)
const search = ref('')
const filterRegion = ref('')
const filterUniv = ref(false)
const filterGenre = ref('')

const regions = ['Adamaoua','Centre','Est','Extrême-Nord','Littoral','Nord','Nord-Ouest','Ouest','Sud','Sud-Ouest']

async function load() {
  loading.value = true
  let q = supabase.from('clubs').select('*', { count:'exact' }).eq('actif', true).order('nom')
  if (search.value.trim()) q = q.ilike('nom', `%${search.value}%`)
  if (filterRegion.value) q = q.eq('region', filterRegion.value)
  if (filterUniv.value)   q = q.eq('universitaire', true)
  if (filterGenre.value)  q = q.eq('genre', filterGenre.value)
  const { data, count } = await q
  clubs.value = data ?? []; total.value = count ?? 0; loading.value = false
}

let t: ReturnType<typeof setTimeout>
function debouncedLoad() { clearTimeout(t); t = setTimeout(load, 350) }
onMounted(load)
</script>

<style scoped>
.filters-bar { display:flex;gap:10px;align-items:center;margin-bottom:24px;flex-wrap:wrap; }
.toggle-label { display:flex;align-items:center;gap:6px;font-size:13px;color:var(--p-sub);cursor:pointer;white-space:nowrap; }
.clubs-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px; }
.club-card { display:flex;align-items:center;gap:14px;padding:14px 16px; }
.club-logo { width:52px;height:52px;border-radius:10px;overflow:hidden;background:var(--p-bg3);display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.club-logo img { width:100%;height:100%;object-fit:cover; }
.club-initials { font-size:13px;font-weight:700;color:var(--p-red); }
.club-body { flex:1; }
.club-nom { font-weight:700;font-size:14px;margin-bottom:4px; }
.club-meta { display:flex;align-items:center;gap:8px;font-size:12px; }
.club-arrow { flex-shrink:0; }
.loading-state,.empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 0;color:var(--p-sub); }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
