<template>
  <div>
    <section class="p-hero" style="padding:36px 0 28px">
      <div class="p-container">
        <h1 class="font-display" style="font-size:2.2rem;font-weight:700;margin-bottom:6px">Matchs</h1>
        <p class="text-sub">Résultats et programme de toutes les rencontres</p>
      </div>
    </section>
    <div class="p-container" style="padding-top:24px;padding-bottom:60px">
      <div class="filters-bar">
        <select v-model="filterStatut" class="p-input p-select" @change="load">
          <option value="">Tous les statuts</option>
          <option value="termine">Terminés</option>
          <option value="programme">Programmés</option>
          <option value="en_cours">En cours</option>
        </select>
        <select v-model="filterComp" class="p-input p-select" @change="load">
          <option value="">Toutes compétitions</option>
          <option v-for="c in competitions" :key="c.id" :value="c.id">{{ c.nom }}</option>
        </select>
        <select v-model="filterGenre" class="p-input p-select" @change="load">
          <option value="">Tous genres</option>
          <option value="masculin">Masculin</option>
          <option value="feminin">Féminin</option>
        </select>
      </div>
      <div v-if="loading" class="loading-state"><div class="spinner" /></div>
      <div v-else>
        <!-- Grouper par journée -->
        <div v-for="group in grouped" :key="group.date" class="match-group">
          <div class="group-header"><span class="group-date">{{ group.date }}</span></div>
          <RouterLink v-for="m in group.matchs" :key="m.id" :to="'/matchs/'+m.id" class="match-row p-card">
            <div class="match-comp text-sub">{{ m.phase?.competition?.nom }} · J{{ m.journee }}</div>
            <div class="match-main">
              <span class="match-club text-right">
                {{ m.type_match === 'international' ? ' Cameroun' : m.club_domicile?.nom }}
              </span>
              <div class="match-score-box">
                <span v-if="m.statut==='termine'" class="font-display score-txt">{{ m.score_dom }} – {{ m.score_ext }}</span>
                <span v-else-if="m.statut==='en_cours'" class="p-badge p-badge-live"> LIVE</span>
                <span v-else class="match-heure text-sub">{{ formatHeure(m.date_match) }}</span>
              </div>
              <span class="match-club">
                {{ m.type_match === 'international' ? m.adversaire_international : m.club_exterieur?.nom }}
              </span>
            </div>
            <div v-if="m.type_match === 'international'" class="match-intl-badge">
              <span class="p-badge p-badge-green" style="font-size:10px"> International</span>
            </div>
          </RouterLink>
        </div>
        <div v-if="grouped.length===0" class="empty-state"><span></span><p>Aucun match trouvé.</p></div>
        <div class="pagination">
          <button class="p-btn-ghost p-btn-sm" :disabled="page===0" @click="page--;load()"> Précédent</button>
          <span class="text-sub">Page {{ page+1 }}</span>
          <button class="p-btn-ghost p-btn-sm" :disabled="matchs.length < limit" @click="page++;load()">Suivant </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const route = useRoute()
const matchs = ref<any[]>([])
const competitions = ref<any[]>([])
const loading = ref(true)
const page = ref(0)
const limit = 20
const filterStatut = ref('')
const filterComp   = ref('')
const filterGenre  = ref('')

const formatHeure     = (d:string) => new Date(d).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
const formatGroupDate = (d:string) => new Date(d).toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})

const grouped = computed(() => {
  const map = new Map<string, any[]>()
  for (const m of matchs.value) {
    const k = formatGroupDate(m.date_match)
    if (!map.has(k)) map.set(k, [])
    map.get(k)!.push(m)
  }
  return Array.from(map.entries()).map(([date, ms]) => ({ date, matchs: ms }))
})

async function load() {
  loading.value = true
  // Si filtre compétition : récupérer d'abord les phase_ids
  let phaseIds: string[] | null = null
  if (filterComp.value) {
    const { data: ph } = await supabase.from('phases').select('id').eq('competition_id', filterComp.value)
    phaseIds = (ph ?? []).map((p: any) => p.id)
    if (!phaseIds.length) { matchs.value = []; loading.value = false; return }
  }

  let q = supabase.from('matchs')
    .select(`
      id, journee, statut, date_match, score_dom, score_ext, type_match, adversaire_international, phase_id,
      phase:phases(nom, competition:competitions(id, nom, genre)),
      club_domicile:clubs!matchs_club_domicile_id_fkey(nom),
      club_exterieur:clubs!matchs_club_exterieur_id_fkey(nom)
    `)
    .order('date_match', { ascending: false })
    .range(page.value * limit, (page.value + 1) * limit - 1)

  if (filterStatut.value) q = q.eq('statut', filterStatut.value)
  if (phaseIds)           q = q.in('phase_id', phaseIds)

  const { data } = await q
  let result = data ?? []

  // Filtre genre côté client
  if (filterGenre.value) {
    result = result.filter((m: any) => {
      const compGenre = (m.phase as any)?.competition?.genre
      return compGenre === filterGenre.value || !compGenre
    })
  }

  matchs.value = result
  loading.value = false
}

onMounted(async () => {
  const slug = route.query.competition as string
  const genre = route.query.genre as string
  const [, { data: comps }] = await Promise.all([
    load(),
    supabase.from('competitions').select('id,nom,genre,slug').order('nom')
  ])
  competitions.value = comps ?? []
  if (slug)  { const c = competitions.value.find((x:any) => x.slug === slug);  if (c) filterComp.value  = c.id }
  if (genre) { filterGenre.value = genre; load() }
})
</script>

<style scoped>
.filters-bar { display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap; }
.match-group { margin-bottom:24px; }
.group-header { padding:8px 0;margin-bottom:8px;border-bottom:1px solid var(--p-border); }
.group-date { font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--p-sub); }
.match-intl-badge { margin-top:4px; }
.match-row { display:flex;flex-direction:column;gap:4px;padding:12px 16px;margin-bottom:6px; }
.match-comp { font-size:11px; }
.match-main { display:flex;align-items:center;gap:12px; }
.match-club { flex:1;font-weight:600;font-size:14px; }
.match-club.text-right { text-align:right; }
.match-score-box { flex-shrink:0;min-width:80px;text-align:center; }
.score-txt { font-size:1.2rem;font-weight:700; }
.match-heure { font-size:12px; }
.pagination { display:flex;justify-content:center;align-items:center;gap:20px;margin-top:24px; }
.loading-state,.empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 0;color:var(--p-sub); }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
