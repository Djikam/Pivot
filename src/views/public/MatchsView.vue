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
      </div>
      <div v-if="loading" class="loading-state"><div class="spinner" /></div>
      <div v-else>
        <!-- Grouper par journée -->
        <div v-for="group in grouped" :key="group.date" class="match-group">
          <div class="group-header"><span class="group-date">{{ group.date }}</span></div>
          <RouterLink v-for="m in group.matchs" :key="m.id" :to="'/matchs/'+m.id" class="match-row p-card">
            <div class="match-comp text-sub">{{ m.phase?.competition?.nom }} · J{{ m.journee }}</div>
            <div class="match-main">
              <span class="match-club text-right">{{ m.club_domicile?.nom }}</span>
              <div class="match-score-box">
                <span v-if="m.statut==='termine'" class="font-display score-txt">{{ m.score_dom }} – {{ m.score_ext }}</span>
                <span v-else-if="m.statut==='en_cours'" class="p-badge p-badge-live">🔴 LIVE</span>
                <span v-else class="match-heure text-sub">{{ formatHeure(m.date_match) }}</span>
              </div>
              <span class="match-club">{{ m.club_exterieur?.nom }}</span>
            </div>
          </RouterLink>
        </div>
        <div v-if="grouped.length===0" class="empty-state"><span>📅</span><p>Aucun match trouvé.</p></div>
        <div class="pagination">
          <button class="p-btn-ghost p-btn-sm" :disabled="page===0" @click="page--;load()">← Précédent</button>
          <span class="text-sub">Page {{ page+1 }}</span>
          <button class="p-btn-ghost p-btn-sm" :disabled="matchs.length < limit" @click="page++;load()">Suivant →</button>
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
const filterComp = ref('')

const formatHeure = (d:string) => new Date(d).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
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
  let q = supabase.from('matchs')
    .select('*, phase:phases(nom,competition:competitions(nom)), club_domicile:clubs!matchs_club_domicile_id_fkey(nom), club_exterieur:clubs!matchs_club_exterieur_id_fkey(nom)')
    .order('date_match', { ascending: false })
    .range(page.value * limit, (page.value + 1) * limit - 1)
  if (filterStatut.value) q = q.eq('statut', filterStatut.value)
  const { data } = await q
  matchs.value = data ?? []; loading.value = false
}

onMounted(async () => {
  const slug = route.query.competition as string
  const [, { data: comps }] = await Promise.all([load(), supabase.from('competitions').select('id,nom').order('nom')])
  competitions.value = comps ?? []
  if (slug) { const c = competitions.value.find(x => x.slug === slug); if (c) filterComp.value = c.id }
})
</script>

<style scoped>
.filters-bar { display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap; }
.match-group { margin-bottom:24px; }
.group-header { padding:8px 0;margin-bottom:8px;border-bottom:1px solid var(--p-border); }
.group-date { font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--p-sub); }
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
