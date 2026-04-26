<template>
  <div class="ticker-wrapper" v-if="items.length">
    <div class="ticker-label">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      EN DIRECT
    </div>
    <div class="ticker-track-wrap">
      <div class="ticker-track" :style="{ animationDuration: speed + 's' }" @mouseenter="paused=true" @mouseleave="paused=false" :class="{ paused }">
        <span v-for="(item, i) in doubled" :key="i" class="ticker-item" :class="item.type">
          <!-- Match score -->
          <template v-if="item.type === 'match'">
            <span class="ticker-teams">{{ item.dom }}</span>
            <span class="ticker-score">{{ item.score }}</span>
            <span class="ticker-teams">{{ item.ext }}</span>
            <span class="ticker-status" :class="item.statut">{{ item.statutLabel }}</span>
          </template>
          <!-- Competition -->
          <template v-else-if="item.type === 'competition'">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
            {{ item.label }}
          </template>
          <!-- Info -->
          <template v-else>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            {{ item.label }}
          </template>
          <span class="ticker-sep">·</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const paused = ref(false)
const rawItems = ref<any[]>([])
const speed = ref(40)

const items = computed(() => rawItems.value)

const doubled = computed(() => {
  // Duplicate for infinite scroll effect
  return [...items.value, ...items.value]
})

function statutLabel(s: string) {
  if (s === 'en_cours') return 'LIVE'
  if (s === 'termine') return 'FIN'
  if (s === 'programme') return 'À VENIR'
  return s
}

async function loadData() {
  // Matchs récents / en cours / à venir
  const { data: matchs } = await supabase
    .from('matchs')
    .select('id,score_dom,score_ext,statut,date_match,type_match,adversaire_international,club_domicile:clubs!matchs_club_domicile_id_fkey(nom,acronyme),club_exterieur:clubs!matchs_club_exterieur_id_fkey(nom,acronyme)')
    .in('statut', ['en_cours', 'termine', 'programme'])
    .order('date_match', { ascending: false })
    .limit(10)

  // Compétitions actives
  const { data: comps } = await supabase
    .from('competitions')
    .select('id,nom,statut,saison')
    .in('statut', ['en_cours', 'a_venir'])
    .order('created_at', { ascending: false })
    .limit(5)

  const result: any[] = []

  for (const m of matchs ?? []) {
    const dom = m.type_match === 'international' ? 'CAMEROUN' : ((m.club_domicile as any)?.acronyme || (m.club_domicile as any)?.nom || '?')
    const ext = m.type_match === 'international' ? m.adversaire_international : ((m.club_exterieur as any)?.acronyme || (m.club_exterieur as any)?.nom || '?')
    const score = m.score_dom !== null ? `${m.score_dom} – ${m.score_ext}` : 'vs'
    result.push({
      type: 'match', dom, ext, score,
      statut: m.statut, statutLabel: statutLabel(m.statut)
    })
  }

  for (const c of comps ?? []) {
    result.push({ type: 'competition', label: `${c.nom} — ${c.saison}` })
  }

  if (result.length === 0) {
    result.push({ type: 'info', label: 'Pivot Hball 237 — Handball Cameroun' })
    result.push({ type: 'info', label: 'Données & statistiques du handball camerounais' })
    result.push({ type: 'info', label: 'Suivi des joueurs, clubs, compétitions' })
  }

  rawItems.value = result
  // Ajuster vitesse selon quantité
  speed.value = Math.max(25, result.length * 6)
}

onMounted(loadData)
</script>

<style scoped>
.ticker-wrapper {
  width: 100%;
  background: linear-gradient(90deg, #0A0A14 0%, #0F0F20 50%, #0A0A14 100%);
  border-top: 1px solid var(--p-border);
  border-bottom: 1px solid var(--p-border);
  display: flex;
  align-items: stretch;
  overflow: hidden;
  height: 36px;
  position: relative;
}

/* Gold accent on left border */
.ticker-wrapper::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--p-red), var(--p-gold), var(--p-green));
}

html.light .ticker-wrapper {
  background: linear-gradient(90deg, #E8E4DC 0%, #F0ECE4 50%, #E8E4DC 100%);
}

.ticker-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px 0 20px;
  background: var(--p-gold);
  color: #08080E;
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.12em;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.ticker-label::after {
  content: '';
  position: absolute;
  right: -10px; top: 0; bottom: 0;
  width: 20px;
  background: linear-gradient(135deg, var(--p-gold) 50%, transparent 50%);
}

.ticker-track-wrap {
  flex: 1;
  overflow: hidden;
  position: relative;
  mask-image: linear-gradient(90deg, transparent 0%, black 3%, black 97%, transparent 100%);
}

.ticker-track {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  animation: tickerScroll linear infinite;
  will-change: transform;
  height: 100%;
}

.ticker-track.paused { animation-play-state: paused; }

@keyframes tickerScroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.ticker-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 4px;
  font-family: var(--font-condensed);
  font-size: 12px;
  font-weight: 600;
  color: var(--p-sub);
  letter-spacing: 0.03em;
}

.ticker-item.match { color: var(--p-text); }
.ticker-item.competition { color: var(--p-gold); }
.ticker-item.info { color: var(--p-sub); }

.ticker-teams {
  font-weight: 700;
  color: var(--p-text);
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.05em;
}

.ticker-score {
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--p-gold);
  padding: 0 4px;
  background: rgba(201,162,39,0.1);
  border-radius: 3px;
}

.ticker-status {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 1px 5px;
  border-radius: 3px;
}
.ticker-status.en_cours {
  background: rgba(0,168,126,0.2);
  color: var(--p-green-bright);
  animation: pulseLive 1.4s ease-in-out infinite;
}
.ticker-status.termine { background: rgba(255,255,255,0.06); color: var(--p-muted); }
.ticker-status.programme { background: rgba(74,144,208,0.15); color: var(--p-blue); }

.ticker-sep {
  color: var(--p-border);
  font-size: 16px;
  margin: 0 8px;
  opacity: 0.6;
}

@keyframes pulseLive {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@media (max-width: 480px) {
  .ticker-label { padding: 0 12px 0 16px; font-size: 10px; }
  .ticker-item { font-size: 11px; }
}
</style>
