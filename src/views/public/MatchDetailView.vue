<template>
  <div v-if="match">
    <section class="match-hero">
      <div class="p-container">
        <div class="match-header-meta">
          <span class="p-badge" :class="statutBadge(match.statut)">{{ statutLabel(match.statut) }}</span>
          <span class="text-sub">{{ match.phase?.competition?.nom }} · J{{ match.journee }} · {{ formatDate(match.date_match) }}</span>
        </div>
        <div class="match-scoreboard">
          <RouterLink :to="'/clubs/'+match.club_domicile_id" class="team-block">
            <div class="team-logo"><span class="font-display">{{ match.club_domicile?.nom?.slice(0,2).toUpperCase() }}</span></div>
            <div class="team-name">{{ match.club_domicile?.nom }}</div>
          </RouterLink>
          <div class="score-center-block">
            <div class="big-score font-display" v-if="match.statut === 'termine'">{{ match.score_dom }} – {{ match.score_ext }}</div>
            <div v-else class="big-score font-display text-sub">vs</div>
            <div v-if="match.mi_temps_dom !== null" class="mi-temps text-sub">Mi-temps : {{ match.mi_temps_dom }}–{{ match.mi_temps_ext }}</div>
          </div>
          <RouterLink :to="'/clubs/'+match.club_exterieur_id" class="team-block team-right">
            <div class="team-logo"><span class="font-display">{{ match.club_exterieur?.nom?.slice(0,2).toUpperCase() }}</span></div>
            <div class="team-name">{{ match.club_exterieur?.nom }}</div>
          </RouterLink>
        </div>
      </div>
    </section>
    <KenteDivider />
    <div class="p-container" style="padding-top:28px;padding-bottom:60px">
      <div class="events-layout">
        <!-- Buteurs -->
        <div class="events-col">
          <h3 class="font-display" style="font-size:1.1rem;font-weight:700;margin-bottom:14px"><svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg> Buts</h3>
          <div v-if="buts.length === 0" class="text-sub" style="font-size:13px">Non renseigné.</div>
          <div v-else class="events-list">
            <div v-for="b in buts" :key="b.id" class="event-item" :class="b.equipe">
              <span class="event-min text-sub">{{ b.minute }}'</span>
              <span class="event-icon"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg></span>
              <RouterLink :to="'/joueurs/'+b.joueur_id" class="event-name">{{ b.joueur?.prenom }} {{ b.joueur?.nom }}</RouterLink>
              <span v-if="b.type !== 'normal'" class="p-badge p-badge-muted">{{ b.type === '7m' ? '7m' : 'Pén.' }}</span>
              <span class="event-equipe text-sub">{{ b.equipe === 'dom' ? 'DOM' : 'EXT' }}</span>
            </div>
          </div>
        </div>
        <!-- Discipline -->
        <div class="events-col">
          <h3 class="font-display" style="font-size:1.1rem;font-weight:700;margin-bottom:14px">🟡 Discipline</h3>
          <div v-if="discipline.length === 0" class="text-sub" style="font-size:13px">Aucune sanction enregistrée.</div>
          <div v-else class="events-list">
            <div v-for="d in discipline" :key="d.id" class="event-item">
              <span class="event-min text-sub">{{ d.minute }}'</span>
              <DisciplineBadge :type="d.type" />
              <RouterLink :to="'/joueurs/'+d.joueur_id" class="event-name">{{ d.joueur?.prenom }} {{ d.joueur?.nom }}</RouterLink>
              <span v-if="d.type === 'suspension_2min' && d.cumul_suspensions > 1" class="text-sub" style="font-size:11px">({{ d.cumul_suspensions }}e)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading-state p-container" style="padding:80px 0"><div class="spinner" /></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import KenteDivider from '@/components/KenteDivider.vue'
import DisciplineBadge from '@/components/DisciplineBadge.vue'

const route = useRoute()
const match = ref<any>(null)
const buts = ref<any[]>([])
const discipline = ref<any[]>([])
const statutBadge = (s:string) => ({ en_cours:'p-badge-live',termine:'p-badge-muted',programme:'p-badge-gold' }[s]??'p-badge-muted')
const statutLabel = (s:string) => ({ en_cours:'🔴 En cours',termine:'Terminé',programme:'Programmé' }[s]??s)
const formatDate = (d:string) => new Date(d).toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})

onMounted(async () => {
  const id = route.params.id as string
  const [{ data: m }, { data: b }, { data: d }] = await Promise.all([
    supabase.from('matchs').select('*, phase:phases(nom,competition:competitions(nom)), club_domicile:clubs!matchs_club_domicile_id_fkey(id,nom), club_exterieur:clubs!matchs_club_exterieur_id_fkey(id,nom)').eq('id', id).single(),
    supabase.from('buts').select('*, joueur:joueurs(prenom,nom)').eq('match_id', id).order('minute'),
    supabase.from('discipline').select('*, joueur:joueurs(prenom,nom)').eq('match_id', id).order('minute'),
  ])
  match.value = m; buts.value = b ?? []; discipline.value = d ?? []
})
</script>

<style scoped>
.match-hero { background:var(--p-card);border-bottom:1px solid var(--p-border);padding:32px 0; }
.match-header-meta { display:flex;align-items:center;gap:10px;margin-bottom:24px;flex-wrap:wrap; }
.match-scoreboard { display:grid;grid-template-columns:1fr auto 1fr;gap:24px;align-items:center; }
.team-block { display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center; }
.team-block.team-right { }
.team-logo { width:64px;height:64px;border-radius:12px;background:var(--p-bg3);display:flex;align-items:center;justify-content:center;border:2px solid var(--p-border); }
.team-name { font-weight:700;font-size:15px; }
.score-center-block { text-align:center; }
.big-score { font-size:3rem;font-weight:700;line-height:1; }
.mi-temps { font-size:12px;margin-top:8px; }
.events-layout { display:grid;grid-template-columns:1fr 1fr;gap:32px; }
.events-list { display:flex;flex-direction:column;gap:6px; }
.event-item { display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;background:var(--p-bg2);font-size:13px; }
.event-item.dom { border-left:3px solid var(--p-red); }
.event-item.ext { border-left:3px solid var(--p-blue); }
.event-min { font-size:11px;min-width:24px;flex-shrink:0; }
.event-name { flex:1;font-weight:600;color:var(--p-text); }
.event-equipe { font-size:11px;color:var(--p-sub); }
.loading-state { display:flex;justify-content:center;align-items:center; }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
@media (max-width:700px) { .events-layout{grid-template-columns:1fr;}.match-scoreboard{grid-template-columns:1fr auto 1fr;} }
</style>
