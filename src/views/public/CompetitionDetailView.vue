<template>
  <div v-if="competition">
    <section class="p-hero" style="padding:36px 0 28px">
      <div class="p-container">
        <button class="p-btn-ghost p-btn-sm" style="display:inline-flex;margin-bottom:12px" @click="$router.back()">← Retour</button>
        <div style="display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap">
          <span class="p-badge" :class="statutBadge(competition.statut)">{{ statutLabel(competition.statut) }}</span>
          <span class="p-badge p-badge-muted">{{ competition.saison }}</span>
          <span v-if="competition.region" class="p-badge p-badge-muted">{{ competition.region }}</span>
        </div>
        <h1 class="font-display" style="font-size:2rem;font-weight:700">{{ competition.nom }}</h1>
      </div>
    </section>

    <div class="p-container" style="padding-top:28px;padding-bottom:60px">
      <!-- Phases -->
      <div v-if="phases.length > 1" class="phase-tabs">
        <button v-for="p in phases" :key="p.id" class="phase-tab" :class="{active:selectedPhase?.id===p.id}" @click="selectPhase(p)">{{ p.nom }}</button>
      </div>

      <div v-if="journees.length" class="phase-tabs" style="margin-top:16px">
        <button v-for="j in journees" :key="j" class="phase-tab" :class="{active:selectedJournee===j}" @click="selectedJournee=j">Journée {{ j }}</button>
      </div>

      <div class="comp-layout">
        <!-- Classement -->
        <div class="classement-col">
          <h2 class="font-display" style="font-size:1.2rem;font-weight:700;margin-bottom:14px">Classement</h2>
          <div v-if="loadingClass" class="loading-mini"><div class="spinner" /></div>
          <table v-else class="p-table">
            <thead>
              <tr>
                <th style="width:32px">#</th>
                <th>Club</th>
                <th>MJ</th><th>V</th><th>N</th><th>D</th>
                <th>BP</th><th>BC</th><th>DB</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in classement" :key="c.id"
                :class="{ 'zone-promotion': i < 2, 'zone-relegation': i >= classement.length - 2 && classement.length > 4 }">
                <td class="text-sub text-center">{{ i+1 }}</td>
                <td>
                  <RouterLink :to="'/clubs/'+c.club_id" style="font-weight:600">{{ c.club?.nom }}</RouterLink>
                </td>
                <td>{{ c.mj }}</td><td>{{ c.v }}</td><td>{{ c.n }}</td><td>{{ c.d }}</td>
                <td>{{ c.bp }}</td><td>{{ c.bc }}</td>
                <td :class="c.db >= 0 ? 'text-green':'text-red'">{{ c.db >= 0 ? '+' : '' }}{{ c.db }}</td>
                <td class="font-display" style="font-weight:700;font-size:1rem">{{ c.pts }}</td>
              </tr>
            </tbody>
          </table>
          <div class="classement-legende">
            <span class="leg-item zone-promo">Promotion</span>
            <span class="leg-item zone-relg">Relégation</span>
          </div>
        </div>

        <!-- Derniers matchs -->
        <div class="matchs-col">
          <h2 class="font-display" style="font-size:1.2rem;font-weight:700;margin-bottom:14px">Résultats récents</h2>
          <div v-for="m in matchsByJournee" :key="m.id" class="match-card p-card">
            <div class="match-meta text-sub">J{{ m.journee }} · {{ formatDate(m.date_match) }}</div>
            <div class="match-score-row">
              <span class="match-club">{{ m.club_domicile?.nom }}</span>
              <span class="match-score font-display" v-if="m.statut === 'termine'">
                <span :class="m.score_dom > m.score_ext ? 'score-win':'score-lose'">{{ m.score_dom }}</span>
                <span class="text-sub"> — </span>
                <span :class="m.score_ext > m.score_dom ? 'score-win':'score-lose'">{{ m.score_ext }}</span>
              </span>
              <span v-else class="p-badge p-badge-gold">{{ m.statut === 'en_cours' ? '🔴 LIVE' : formatShortDate(m.date_match) }}</span>
              <span class="match-club text-right">{{ m.club_exterieur?.nom }}</span>
            </div>
            <div v-if="m.mi_temps_dom !== null" class="match-mi text-sub">Mi-temps : {{ m.mi_temps_dom }}–{{ m.mi_temps_ext }}</div>
          </div>
          <div v-if="matchsByJournee.length === 0" class="text-sub" style="padding:20px;text-align:center">Aucun résultat disponible.</div>
          <RouterLink :to="'/matchs?competition='+competition.slug" class="p-btn-ghost p-btn-sm" style="margin-top:12px">Voir tous les matchs →</RouterLink>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading-state p-container" style="padding:80px 0"><div class="spinner" /></div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const route = useRoute()
const competition = ref<any>(null)
const phases = ref<any[]>([])
const selectedPhase = ref<any>(null)
const classement = ref<any[]>([])
const matchs = ref<any[]>([])
const loadingClass = ref(true)
const selectedJournee = ref<number | null>(null)

const statutBadge = (s:string) => ({ en_cours:'p-badge-green',termine:'p-badge-muted',a_venir:'p-badge-gold' }[s]??'p-badge-muted')
const statutLabel = (s:string) => ({ en_cours:'En cours',termine:'Terminé',a_venir:'À venir' }[s]??s)
const formatDate = (d:string) => new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})
const formatShortDate = (d:string) => new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})

const journees = computed(() => {
  const nums = Array.from(new Set(matchs.value.map(m => m.journee))).sort((a,b)=>a-b)
  return nums
})

const matchsByJournee = computed(() => {
  if (!selectedJournee.value) return matchs.value
  return matchs.value.filter(m => m.journee === selectedJournee.value)
})

async function selectPhase(p: any) {
  selectedPhase.value = p
  loadingClass.value = true
  const [{ data: cls }, { data: mx }] = await Promise.all([
    supabase.from('classement_general').select('*').eq('phase_id', p.id),
    supabase.from('matchs').select('*, club_domicile:clubs!matchs_club_domicile_id_fkey(nom), club_exterieur:clubs!matchs_club_exterieur_id_fkey(nom)').eq('phase_id', p.id).order('date_match',{ascending:false}),
  ])
  classement.value = cls ?? []
  matchs.value = mx ?? []
  selectedJournee.value = matchs.value.length ? matchs.value[0].journee : null
  loadingClass.value = false
}

onMounted(async () => {
  const slug = route.params.slug as string
  const { data: comp } = await supabase.from('competitions').select('*').eq('slug', slug).single()
  competition.value = comp
  if (!comp) return
  const { data: phs } = await supabase.from('phases').select('*').eq('competition_id', comp.id).order('ordre')
  phases.value = phs ?? []
  if (phases.value.length) selectPhase(phases.value[0])
})
</script>

<style scoped>
.phase-tabs { display:flex;gap:8px;margin-bottom:24px; }
.phase-tab { padding:8px 16px;border-radius:8px;border:1px solid var(--p-border);cursor:pointer;font-size:13px;background:transparent;color:var(--p-sub);transition:all 150ms; }
.phase-tab.active { border-color:var(--p-red);background:rgba(140,21,37,.1);color:var(--p-red); }
.comp-layout { display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:flex-start; }
.match-card { padding:12px 16px;margin-bottom:8px; }
.match-meta { font-size:11px;margin-bottom:6px; }
.match-score-row { display:flex;align-items:center;gap:10px; }
.match-club { flex:1;font-weight:600;font-size:13px; }
.match-club.text-right { text-align:right; }
.match-score { font-size:1.2rem;font-weight:700;flex-shrink:0; }
.score-win { color:var(--p-green); }
.score-lose { color:var(--p-sub); }
.match-mi { font-size:11px;margin-top:4px;text-align:center; }
.classement-legende { display:flex;gap:12px;margin-top:10px;font-size:11px; }
.leg-item { display:flex;align-items:center;gap:4px; }
.zone-promo::before { content:'';width:8px;height:8px;border-radius:2px;background:var(--p-green);display:inline-block;margin-right:4px; }
.zone-relg::before { content:'';width:8px;height:8px;border-radius:2px;background:var(--p-red);display:inline-block;margin-right:4px; }
.loading-mini,.loading-state { display:flex;justify-content:center;padding:30px 0; }
.spinner { width:28px;height:28px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
@media (max-width:900px) { .comp-layout{grid-template-columns:1fr;} }
</style>
