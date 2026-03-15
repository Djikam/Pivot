<template>
  <div class="joueurs-view">
    <!-- Hero -->
    <section class="p-hero" style="padding:40px 0 32px">
      <div class="p-container">
        <h1 class="font-display" style="font-size:2.2rem;font-weight:700;margin-bottom:6px">ATLAS — Joueurs</h1>
        <p class="text-sub">{{ total }} joueurs enregistrés dans la base PIVOT</p>
      </div>
    </section>

    <div class="p-container" style="padding-top:28px">
      <!-- Filtres -->
      <div class="filters-bar">
        <input v-model="search" class="p-input filter-search" placeholder="🔍 Rechercher un joueur…" @input="debouncedLoad" />
        <select v-model="filters.poste" class="p-input p-select" @change="load">
          <option value="">Tous les postes</option>
          <option v-for="p in postes" :key="p.value" :value="p.value">{{ p.label }}</option>
        </select>
        <select v-model="filters.bras" class="p-input p-select" @change="load">
          <option value="">Bras fort</option>
          <option value="droitier">Droitier</option>
          <option value="gaucher">Gaucher</option>
          <option value="ambidextre">Ambidextre</option>
        </select>
        <select v-model="filters.statut" class="p-input p-select" @change="load">
          <option value="">Tous statuts</option>
          <option value="verifie">✓ Vérifiés</option>
          <option value="talent">⭐ Talents</option>
          <option value="univ"><svg class="inline w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg> Universitaires</option>
          <option value="national">🇨🇲 Sélectionnés</option>
        </select>
        <button class="p-btn-ghost p-btn-sm view-toggle" @click="gridMode = !gridMode">
          <svg v-if="gridMode" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="spinner" /><span class="text-sub">Chargement…</span>
      </div>

      <!-- Grille -->
      <div v-else-if="gridMode" class="joueurs-grid">
        <RouterLink v-for="j in joueurs" :key="j.id" :to="'/joueurs/' + j.id" class="joueur-card p-card">
          <div class="card-header">
            <div class="joueur-avatar">
              <img v-if="j.photo_cloudinary_id" :src="cloudinaryUrl(j.photo_cloudinary_id, {w:80,h:80})" :alt="j.prenom" />
              <span v-else class="avatar-initials">{{ j.prenom[0] }}{{ j.nom[0] }}</span>
            </div>
            <div class="card-badges">
              <span v-if="j.verifie" class="p-badge p-badge-green">✓ Vérifié</span>
              <span v-if="j.badge_talent" class="p-badge p-badge-gold">⭐ Talent</span>
            </div>
          </div>
          <div class="joueur-name">{{ j.prenom }} {{ j.nom }}</div>
          <div class="joueur-meta text-sub">
            <span class="poste-badge">{{ posteLabel(j.poste_principal) }}</span>
            <span>{{ j.bras_fort === 'gaucher' ? '✋ Gaucher' : j.bras_fort === 'ambidextre' ? '🤲 Ambidextre' : '' }}</span>
          </div>
          <div class="score-bar">
            <span class="score-label text-sub">Score IA</span>
            <div class="score-track">
              <div class="score-fill" :style="{ width: j.score_ia + '%', background: scoreColor(j.score_ia) }" />
            </div>
            <span class="score-val font-display" :style="{ color: scoreColor(j.score_ia) }">{{ j.score_ia }}</span>
          </div>
        </RouterLink>
      </div>

      <!-- Liste -->
      <div v-else class="joueurs-list">
        <table class="p-table">
          <thead>
            <tr>
              <th>#</th><th>Joueur</th><th>Poste</th><th>Club</th><th>Score IA</th><th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(j, i) in joueurs" :key="j.id" @click="$router.push('/joueurs/' + j.id)" style="cursor:pointer">
              <td class="font-display text-sub" style="font-size:1.1rem">{{ i+1 }}</td>
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="avatar-sm">
                    <img v-if="j.photo_cloudinary_id" :src="cloudinaryUrl(j.photo_cloudinary_id,{w:32,h:32})" :alt="j.prenom" />
                    <span v-else class="avatar-initials-sm">{{ j.prenom[0] }}{{ j.nom[0] }}</span>
                  </div>
                  <span style="font-weight:600">{{ j.prenom }} {{ j.nom }}</span>
                </div>
              </td>
              <td><span class="poste-badge">{{ posteLabel(j.poste_principal) }}</span></td>
              <td class="text-sub">{{ j.club_nom ?? '—' }}</td>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <div class="score-track-sm"><div class="score-fill-sm" :style="{width:j.score_ia+'%',background:scoreColor(j.score_ia)}" /></div>
                  <span class="font-display" :style="{color:scoreColor(j.score_ia),fontSize:'1rem',fontWeight:700}">{{ j.score_ia }}</span>
                </div>
              </td>
              <td>
                <span v-if="j.verifie" class="p-badge p-badge-green">✓</span>
                <span v-if="j.badge_talent" class="p-badge p-badge-gold">⭐</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && joueurs.length > 0" class="pagination">
        <button class="p-btn-ghost p-btn-sm" :disabled="page === 0" @click="prevPage">← Précédent</button>
        <span class="text-sub">Page {{ page+1 }}</span>
        <button class="p-btn-ghost p-btn-sm" :disabled="joueurs.length < limit" @click="nextPage">Suivant →</button>
      </div>

      <!-- Vide -->
      <div v-if="!loading && joueurs.length === 0" class="empty-state">
        <span style="font-size:2rem">🔍</span>
        <p>Aucun joueur trouvé pour ces filtres.</p>
        <button class="p-btn-ghost p-btn-sm" @click="resetFilters">Réinitialiser</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase, cloudinaryUrl } from '@/lib/supabaseClient'
import type { Joueur } from '@/lib/database.types'

const joueurs = ref<any[]>([])
const total   = ref(0)
const loading = ref(true)
const gridMode = ref(true)
const page    = ref(0)
const limit   = 24
const search  = ref('')
const filters = ref({ poste: '', bras: '', statut: '' })

const postes = [
  {value:'gardien',      label:'Gardien'},
  {value:'ailier_g',     label:'Ailier Gauche'},
  {value:'ailier_d',     label:'Ailier Droit'},
  {value:'arriere_g',    label:'Arrière Gauche'},
  {value:'arriere_d',    label:'Arrière Droit'},
  {value:'demi_centre',  label:'Demi-Centre'},
  {value:'pivot',        label:'Pivot'},
]
const posteLabel = (p: string) => postes.find(x => x.value === p)?.label ?? p
const scoreColor = (s: number) => s >= 80 ? '#3BAA6A' : s >= 60 ? '#C4922A' : s >= 40 ? '#3A80BE' : '#A090A8'

async function load() {
  loading.value = true
  let q = supabase
    .from('joueurs')
    .select(`
      id, prenom, nom, poste_principal, bras_fort, score_ia, badge_talent, verifie, photo_cloudinary_id,
      licences_saison!inner(*)
    `, { count: 'exact' })
    .eq('licences_saison.saison', '2025-2026')
    .order('score_ia', { ascending: false })
    .range(page.value * limit, (page.value + 1) * limit - 1)

  if (search.value.trim()) {
    q = q.ilike('nom', `%${search.value}%`)
  }
  if (filters.value.poste)  q = q.eq('poste_principal', filters.value.poste)
  if (filters.value.bras)   q = q.eq('bras_fort', filters.value.bras)
  if (filters.value.statut === 'verifie') q = q.eq('verifie', true)
  if (filters.value.statut === 'talent')  q = q.eq('badge_talent', true)
  if (filters.value.statut === 'univ')    q = q.eq('statut_univ', true)

  const { data, count } = await q
  // Filtrer les doublons : si un joueur a plusieurs licences, prendre la plus récente
  const uniqueJoueurs = data?.reduce((acc, joueur) => {
    if (!acc[joueur.id] || new Date(joueur.licences_saison[0].created_at) > new Date(acc[joueur.id].licences_saison[0].created_at)) {
      acc[joueur.id] = joueur
    }
    return acc
  }, {}) ?? {}
  joueurs.value = Object.values(uniqueJoueurs)
  total.value   = count ?? 0
  loading.value = false
}

let searchTimer: ReturnType<typeof setTimeout>
function debouncedLoad() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(load, 350)
}

function resetFilters() { search.value = ''; filters.value = { poste:'', bras:'', statut:'' }; page.value = 0; load() }
function prevPage() { if(page.value > 0) { page.value--; load() } }
function nextPage() { page.value++; load() }

onMounted(load)
</script>

<style scoped>
.filters-bar { display:flex; gap:10px; margin-bottom:24px; flex-wrap:wrap; }
.filter-search { flex:1; min-width:200px; }
.filters-bar .p-input, .filters-bar .p-select { height:38px; }
.view-toggle { height:38px; }

.joueurs-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px; }
.joueur-card { padding:20px; display:flex; flex-direction:column; gap:10px; }
.card-header { display:flex; justify-content:space-between; align-items:flex-start; }
.joueur-avatar { width:52px; height:52px; border-radius:50%; overflow:hidden; background:var(--p-bg3); display:flex; align-items:center; justify-content:center; border:2px solid var(--p-border); flex-shrink:0; }
.joueur-avatar img { width:100%; height:100%; object-fit:cover; }
.avatar-initials { font-family:var(--font-display); font-size:1.2rem; font-weight:700; color:var(--p-red); }
.card-badges { display:flex; flex-direction:column; gap:4px; align-items:flex-end; }
.joueur-name { font-weight:700; font-size:15px; }
.joueur-meta { display:flex; gap:6px; align-items:center; font-size:12px; flex-wrap:wrap; }
.poste-badge { padding:2px 8px; border-radius:99px; background:rgba(140,21,37,.12); color:var(--p-red); font-size:11px; font-weight:600; }
.score-bar { display:flex; align-items:center; gap:8px; }
.score-label { font-size:10px; white-space:nowrap; }
.score-track { flex:1; height:4px; background:var(--p-bg3); border-radius:2px; overflow:hidden; }
.score-fill { height:100%; border-radius:2px; transition:width 600ms ease; }
.score-val { font-size:1rem; font-weight:700; width:28px; text-align:right; }

.avatar-sm { width:32px; height:32px; border-radius:50%; overflow:hidden; background:var(--p-bg3); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.avatar-sm img { width:100%; height:100%; object-fit:cover; }
.avatar-initials-sm { font-size:12px; font-weight:700; color:var(--p-red); }
.score-track-sm { width:60px; height:4px; background:var(--p-bg3); border-radius:2px; overflow:hidden; }
.score-fill-sm { height:100%; border-radius:2px; }

.pagination { display:flex; justify-content:center; align-items:center; gap:20px; margin-top:32px; }
.loading-state, .empty-state { display:flex; flex-direction:column; align-items:center; gap:12px; padding:60px 0; color:var(--p-sub); }
.spinner { width:32px; height:32px; border:3px solid var(--p-border); border-top-color:var(--p-red); border-radius:50%; animation:spin 700ms linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
</style>
