<template>
  <div>
    <section class="p-hero" style="padding:36px 0 28px">
      <div class="p-container">
        <h1 class="font-display" style="font-size:2.2rem;font-weight:700;margin-bottom:6px">SCOPE — Statistiques</h1>
        <p class="text-sub">Performances par compétition — Buteurs, gardiens, fair-play</p>
      </div>
    </section>

    <div class="p-container" style="padding-top:24px;padding-bottom:60px">
      <!-- Filtre compétition + genre -->
      <div class="filter-bar">
        <select v-model="selectedCompId" class="p-input p-select comp-select" @change="onCompChange">
          <option value="">Toutes compétitions confondues</option>
          <optgroup v-for="g in competitionsGrouped" :key="g.type" :label="typeLabel(g.type)">
            <option v-for="c in g.items" :key="c.id" :value="c.id">
              {{ c.nom }} — {{ c.saison }}
            </option>
          </optgroup>
        </select>
        <select v-model="filterGenre" class="p-input p-select" @change="loadTab" style="max-width:160px">
          <option value="">Tous genres</option>
          <option value="masculin">👨 Masculin</option>
          <option value="feminin">👩 Féminin</option>
        </select>
        <div v-if="selectedComp" class="comp-info">
          <span class="p-badge" :class="statutBadge(selectedComp.statut)">{{ statutLabel(selectedComp.statut) }}</span>
          <span class="text-sub" style="font-size:12px">{{ selectedComp.saison }}</span>
        </div>
      </div>

      <!-- Onglets -->
      <div class="stats-tabs">
        <button v-for="t in tabs" :key="t.value" class="stats-tab" :class="{active:tab===t.value}" @click="tab=t.value; loadTab()">
          {{ t.label }}
        </button>
      </div>
      <KenteDivider :my="20" />

      <!-- TOP BUTEURS -->
      <div v-if="tab==='buteurs'">
        <div v-if="loading" class="loading-state"><div class="spinner" /></div>
        <div v-else-if="buteurs.length === 0" class="empty-state">
          <span>⚽</span>
          <p>Aucun buteur enregistré{{ selectedComp ? ' pour ' + selectedComp.nom : '' }}.</p>
          <p class="text-sub" style="font-size:12px">Les données sont saisies match par match via l'admin.</p>
        </div>
        <div v-else>
          <!-- Commentaire IA -->
          <div v-if="iaComment" class="ia-comment-block">
            <span class="ia-comment-icon">🤖</span>
            <div>
              <div style="font-size:11px;font-weight:700;color:var(--p-blue);margin-bottom:4px;text-transform:uppercase;letter-spacing:.06em">Analyse IA · PIVOT</div>
              <div style="font-size:13px;line-height:1.6">{{ iaComment }}</div>
            </div>
          </div>
          <div v-else-if="iaLoading" class="ia-comment-block" style="opacity:.6">
            <span class="ia-comment-icon">⏳</span>
            <div style="font-size:13px">Analyse des performances en cours…</div>
          </div>
          <!-- Podium top 3 -->
          <div class="podium" v-if="buteurs.length >= 3">
            <div v-for="(b, i) in [buteurs[1], buteurs[0], buteurs[2]]" :key="b.joueur_id"
              class="podium-step" :class="'rank-'+(i===1?1:i===0?2:3)">
              <RouterLink :to="'/joueurs/'+b.joueur_id" class="podium-avatar">
                {{ b.joueur?.prenom?.[0] }}{{ b.joueur?.nom?.[0] }}
              </RouterLink>
              <div class="podium-name">{{ b.joueur?.prenom }} {{ b.joueur?.nom }}</div>
              <div class="podium-buts font-display">{{ b.total_buts }} <span style="font-size:12px">buts</span></div>
              <div class="podium-bar" />
              <div class="podium-rank">{{ i===1?'🥇':i===0?'🥈':'🥉' }}</div>
            </div>
          </div>

          <!-- Tableau complet -->
          <table class="p-table" style="margin-top:20px">
            <thead>
              <tr>
                <th>#</th><th>Joueur</th><th>Club</th><th>Poste</th>
                <th>Buts</th><th>Pén.</th><th>7m</th><th>Matchs</th><th>Moy.</th><th>Score IA</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, i) in buteurs" :key="b.joueur_id" :class="i<3?'rank-'+(i+1):''">
                <td class="font-display text-sub" style="font-size:1.1rem">{{ i+1 }}</td>
                <td>
                  <RouterLink :to="'/joueurs/'+b.joueur_id" style="font-weight:700">
                    {{ b.joueur?.prenom }} {{ b.joueur?.nom }}
                  </RouterLink>
                </td>
                <td class="text-sub" style="font-size:12px">{{ b.club_nom ?? '—' }}</td>
                <td><span class="poste-badge">{{ posteLabel(b.joueur?.poste_principal) }}</span></td>
                <td class="font-display" style="font-weight:700;color:var(--p-red);font-size:1.1rem">{{ b.total_buts }}</td>
                <td class="text-sub">{{ b.buts_penalty }}</td>
                <td class="text-sub">{{ b.buts_7m }}</td>
                <td class="text-sub">{{ b.matchs_joues }}</td>
                <td class="text-sub">{{ b.matchs_joues ? (b.total_buts/b.matchs_joues).toFixed(1) : '—' }}</td>
                <td><span class="font-display" style="font-weight:700" :style="{color:scoreColor(b.joueur?.score_ia)}">{{ b.joueur?.score_ia }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TOP GARDIENS -->
      <div v-if="tab==='gardiens'">
        <div v-if="loading" class="loading-state"><div class="spinner" /></div>
        <div v-else-if="gardiens.length === 0" class="empty-state">
          <span>🧤</span><p>Aucune statistique gardien disponible.</p>
        </div>
        <table v-else class="p-table">
          <thead>
            <tr><th>#</th><th>Gardien</th><th>Club</th><th>Matchs</th><th>Arrêts</th><th>Tirs reçus</th><th>% arrêts</th></tr>
          </thead>
          <tbody>
            <tr v-for="(g, i) in gardiens" :key="g.joueur_id">
              <td class="text-sub">{{ i+1 }}</td>
              <td><RouterLink :to="'/joueurs/'+g.joueur_id" style="font-weight:700">{{ g.prenom }} {{ g.nom }}</RouterLink></td>
              <td class="text-sub" style="font-size:12px">{{ g.club_nom ?? '—' }}</td>
              <td class="text-sub">{{ g.matchs }}</td>
              <td class="font-display" style="font-weight:700;color:var(--p-green)">{{ g.arrets }}</td>
              <td class="text-sub">{{ g.tirs_recus || '—' }}</td>
              <td>
                <span class="font-display" style="font-weight:700"
                  :style="{color: g.pct >= 35 ? 'var(--p-green)' : g.pct >= 28 ? 'var(--p-gold)' : 'var(--p-red)'}">
                  {{ g.tirs_recus ? g.pct+'%' : '—' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- FAIR-PLAY -->
      <div v-if="tab==='fairplay'">
        <div v-if="loading" class="loading-state"><div class="spinner" /></div>
        <div v-else-if="fairplay.length === 0" class="empty-state">
          <span>🟡</span><p>Aucune donnée disciplinaire enregistrée.</p>
        </div>
        <div v-else>
          <p class="text-sub" style="margin-bottom:16px;font-size:13px">
            Score Fair-Play : plus bas = meilleur.<br>
            Calcul : avert.×0.5 + jaune×1 + susp.×2 + rouge×5 + bleu×10
          </p>
          <table class="p-table">
            <thead>
              <tr><th>#</th><th>Joueur</th><th>Avert.</th><th>Jaune</th><th>2 min</th><th>Rouge</th><th>Bleu</th><th>Score FP</th></tr>
            </thead>
            <tbody>
              <tr v-for="(j, i) in fairplay" :key="j.joueur_id">
                <td class="text-sub">{{ i+1 }}</td>
                <td><RouterLink :to="'/joueurs/'+j.joueur_id" style="font-weight:600">{{ j.joueur?.prenom }} {{ j.joueur?.nom }}</RouterLink></td>
                <td>{{ j.nb_avert }}</td><td>{{ j.nb_jaune }}</td><td>{{ j.nb_susp }}</td><td>{{ j.nb_rouge }}</td><td>{{ j.nb_bleu }}</td>
                <td class="font-display" style="font-weight:700"
                  :style="{color: j.score_fp < 5 ? 'var(--p-green)' : j.score_fp < 15 ? 'var(--p-gold)' : 'var(--p-red)'}">
                  {{ j.score_fp.toFixed(1) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CLASSEMENT BUTEURS PAR COMPÉTITION (vue synthèse) -->
      <div v-if="tab==='competitions'">
        <div v-if="loading" class="loading-state"><div class="spinner" /></div>
        <div v-else>
          <div v-for="comp in statsParComp" :key="comp.id" class="comp-block p-card">
            <div class="comp-block-header">
              <div>
                <h3 class="font-display" style="font-size:1.1rem;font-weight:700">{{ comp.nom }}</h3>
                <span class="text-sub" style="font-size:12px">{{ comp.saison }} · {{ comp.nb_matchs }} matchs · {{ comp.total_buts }} buts</span>
              </div>
              <RouterLink :to="'/competitions/'+comp.slug" class="p-btn-ghost p-btn-sm">Voir →</RouterLink>
            </div>
            <div class="comp-top-scorers">
              <div v-for="(s, i) in comp.top3" :key="s.joueur_id" class="scorer-row">
                <span class="scorer-rank font-display">{{ i+1 }}</span>
                <RouterLink :to="'/joueurs/'+s.joueur_id" class="scorer-name">{{ s.prenom }} {{ s.nom }}</RouterLink>
                <span class="font-display scorer-buts" style="color:var(--p-red);font-weight:700">{{ s.buts }}</span>
                <span class="text-sub" style="font-size:11px">buts</span>
              </div>
              <div v-if="comp.top3.length===0" class="text-sub" style="font-size:12px;padding:8px 0">Aucun but saisi</div>
            </div>
          </div>
          <div v-if="statsParComp.length===0" class="empty-state">
            <span>📊</span><p>Aucune compétition avec des buts enregistrés.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { callIA, callIAJson } from '@/lib/iaClient'
import KenteDivider from '@/components/KenteDivider.vue'

const tab = ref('buteurs')
const tabs = [
  { value:'buteurs',      label:'Top Buteurs' },
  { value:'gardiens',     label:'Top Gardiens' },
  { value:'fairplay',     label:'Fair-Play' },
  { value:'competitions', label:'Par compétition' },
]

const selectedCompId = ref('')
const filterGenre    = ref('')
const competitions   = ref<any[]>([])
const buteurs        = ref<any[]>([])
const gardiens       = ref<any[]>([])
const fairplay       = ref<any[]>([])
const statsParComp   = ref<any[]>([])
const loading        = ref(false)
const iaComment      = ref('')
const iaLoading      = ref(false)

const postes: Record<string,string> = { gardien:'Gardien', ailier_g:'Ailier G', ailier_d:'Ailier D', arriere_g:'Arrière G', arriere_d:'Arrière D', demi_centre:'D-C', pivot:'Pivot' }
const posteLabel  = (p:string) => postes[p] ?? (p ?? '—')
const scoreColor  = (s:number) => s >= 80 ? '#3BAA6A' : s >= 60 ? '#C4922A' : '#3A80BE'
const typeLabel   = (t:string) => ({ regional:'Régional', national:'National', universitaire:'Universitaire', coupe:'Coupe', international:'International' }[t] ?? t)
const statutLabel = (s:string) => ({ a_venir:'À venir', en_cours:'En cours', termine:'Terminé' }[s] ?? s)
const statutBadge = (s:string) => ({ a_venir:'p-badge-muted', en_cours:'p-badge-live', termine:'p-badge-green' }[s] ?? 'p-badge-muted')

const selectedComp = computed(() => competitions.value.find(c => c.id === selectedCompId.value) ?? null)

const competitionsGrouped = computed(() => {
  const types = ['national','regional','universitaire','international','coupe']
  return types.map(t => ({
    type: t,
    items: competitions.value.filter(c => c.type === t)
  })).filter(g => g.items.length > 0)
})

async function genererCommentaireIA(top: any[]) {
  iaLoading.value = true; iaComment.value = ''
  try {
    const context = top.slice(0,5).map((b,i) => ({
      rang: i+1, joueur: `${b.joueur?.prenom} ${b.joueur?.nom}`,
      poste: b.joueur?.poste_principal, buts: b.total_buts,
      matchs: b.matchs_joues, moy: b.matchs_joues ? (b.total_buts/b.matchs_joues).toFixed(1) : '?',
      pct_7m: b.buts_7m, genre: b.joueur?.genre
    }))
    const comp = selectedComp.value?.nom ?? 'toutes compétitions'
    const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ia-proxy`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:200,
        messages:[{role:'user', content:
`Tu es analyste handball pour PIVOT Cameroun. Fais un commentaire court (2-3 phrases max) et percutant sur ce classement des buteurs pour "${comp}":
${JSON.stringify(context)}
Note les performances remarquables, les tendances et les dominants. Ton journalistique enthousiaste. En français uniquement. Pas de markdown.`}]
      })
    })
    const d = await r.json()
    iaComment.value = d.content?.[0]?.text?.trim() ?? ''
  } catch { iaComment.value = '' }
  finally { iaLoading.value = false }
}

function onCompChange() { page.value = 0; iaComment.value = ''; loadTab() }

const page = ref(0)

async function loadTab() {
  if (tab.value === 'buteurs')      await loadButeurs()
  else if (tab.value === 'gardiens')     await loadGardiens()
  else if (tab.value === 'fairplay')     await loadFairplay()
  else if (tab.value === 'competitions') await loadParComp()
}

async function loadButeurs() {
  loading.value = true
  // Récupérer les buts avec filtre compétition optionnel
  let q = supabase.from('buts').select('joueur_id, type, match_id, match:matchs(phase:phases(competition_id))')

  if (selectedCompId.value) {
    // Via jointure phases → competition
    const { data: phaseIds } = await supabase.from('phases').select('id').eq('competition_id', selectedCompId.value)
    const { data: matchIds } = await supabase.from('matchs').select('id').in('phase_id', (phaseIds??[]).map((p:any)=>p.id))
    if (!matchIds?.length) { buteurs.value = []; loading.value = false; return }
    q = supabase.from('buts').select('joueur_id, type, match_id').in('match_id', matchIds.map((m:any)=>m.id))
  }

  const { data: b } = await q
  if (!b?.length) { buteurs.value = []; loading.value = false; return }

  // Agréger par joueur
  const map = new Map<string, { total:number; penalty:number; sept:number; matchs:Set<string> }>()
  for (const row of b) {
    if (!map.has(row.joueur_id)) map.set(row.joueur_id, { total:0, penalty:0, sept:0, matchs:new Set() })
    const e = map.get(row.joueur_id)!
    e.total++
    if (row.type === 'penalty') e.penalty++
    if (row.type === '7m')      e.sept++
    e.matchs.add(row.match_id)
  }
  const sorted = [...map.entries()].sort((a,b) => b[1].total - a[1].total).slice(0,30)
  if (!sorted.length) { buteurs.value = []; loading.value = false; return }

  const ids = sorted.map(([id]) => id)
  const [{ data: joueurs }, { data: licences }] = await Promise.all([
    supabase.from('joueurs').select('id,prenom,nom,poste_principal,score_ia,genre').in('id', ids),
    supabase.from('licences_saison').select('joueur_id,club:clubs(nom)').in('joueur_id', ids).eq('actif',true).limit(500)
  ])

  let result = sorted.map(([joueur_id, stats]) => ({
    joueur_id,
    total_buts:   stats.total,
    buts_penalty: stats.penalty,
    buts_7m:      stats.sept,
    matchs_joues: stats.matchs.size,
    joueur:  joueurs?.find(j => j.id === joueur_id),
    club_nom: (licences?.find(l => l.joueur_id === joueur_id)?.club as any)?.nom ?? null,
  }))

  // Filtre genre
  if (filterGenre.value) {
    result = result.filter(r => r.joueur?.genre === filterGenre.value)
  }

  buteurs.value = result
  loading.value = false
  // Générer commentaire IA async
  if (result.length >= 3) genererCommentaireIA(result)
}

async function loadGardiens() {
  loading.value = true
  let q = supabase.from('joueurs')
    .select(`
      id, prenom, nom, im_ihf, arrets_ihf, tirs_recus_ihf, score_ia, genre,
      licences_saison!inner(club:clubs(nom), actif)
    `)
    .eq('poste_principal', 'gardien')
    .eq('licences_saison.actif', true)
    .gt('arrets_ihf', 0)
    .order('arrets_ihf', { ascending: false })
    .limit(20)

  if (selectedCompId.value) {
    const comp = competitions.value.find(c => c.id === selectedCompId.value)
    if (comp?.genre) q = q.eq('genre', comp.genre)
  }

  const { data } = await q
  gardiens.value = (data ?? []).map(g => {
    const arrets     = (g as any).arrets_ihf     ?? 0
    const tirs_recus = (g as any).tirs_recus_ihf ?? 0
    const matchs     = (g as any).im_ihf         ?? '—'
    return {
      joueur_id:  g.id,
      prenom:     g.prenom,
      nom:        g.nom,
      score_ia:   (g as any).score_ia,
      club_nom:   ((g as any).licences_saison?.[0]?.club as any)?.nom ?? '—',
      arrets,
      tirs_recus,
      matchs,
      pct: tirs_recus > 0 ? Math.round(arrets / tirs_recus * 100) : 0,
    }
  })
  loading.value = false
}

async function loadFairplay() {
  loading.value = true
  let q = supabase.from('discipline').select('joueur_id, type')

  if (selectedCompId.value) {
    const { data: ph } = await supabase.from('phases').select('id').eq('competition_id', selectedCompId.value)
    const { data: mx } = await supabase.from('matchs').select('id').in('phase_id', (ph??[]).map((p:any)=>p.id))
    const mIds = (mx??[]).map((m:any)=>m.id)
    if (!mIds.length) { fairplay.value=[]; loading.value=false; return }
    q = supabase.from('discipline').select('joueur_id, type').in('match_id', mIds)
  }

  const { data } = await q
  if (!data?.length) { fairplay.value=[]; loading.value=false; return }

  const map = new Map<string,any>()
  for (const d of data) {
    if (!map.has(d.joueur_id)) map.set(d.joueur_id, { joueur_id:d.joueur_id, nb_avert:0, nb_jaune:0, nb_susp:0, nb_rouge:0, nb_bleu:0 })
    const e = map.get(d.joueur_id)!
    if (d.type==='avertissement')   e.nb_avert++
    if (d.type==='carton_jaune')    e.nb_jaune++
    if (d.type==='suspension_2min') e.nb_susp++
    if (d.type==='carton_rouge')    e.nb_rouge++
    if (d.type==='carton_bleu')     e.nb_bleu++
  }
  const sorted = [...map.values()]
    .map(e => ({ ...e, score_fp: e.nb_avert*.5+e.nb_jaune*1+e.nb_susp*2+e.nb_rouge*5+e.nb_bleu*10 }))
    .sort((a,b) => a.score_fp - b.score_fp).slice(0,30)
  if (!sorted.length) { fairplay.value=[]; loading.value=false; return }
  const { data: joueurs } = await supabase.from('joueurs').select('id,prenom,nom').in('id', sorted.map(x=>x.joueur_id))
  fairplay.value = sorted.map(e => ({ ...e, joueur: joueurs?.find(j=>j.id===e.joueur_id) }))
  loading.value = false
}

async function loadParComp() {
  loading.value = true
  // Charger toutes les compétitions avec leurs buts
  const { data: comps } = await supabase.from('competitions')
    .select('id,nom,slug,saison,type,statut').order('saison', { ascending: false })

  const result = []
  for (const comp of (comps ?? [])) {
    const { data: ph } = await supabase.from('phases').select('id').eq('competition_id', comp.id)
    const phIds = (ph??[]).map((p:any)=>p.id)
    if (!phIds.length) continue

    const { data: mx } = await supabase.from('matchs').select('id').in('phase_id', phIds)
    const mIds = (mx??[]).map((m:any)=>m.id)
    if (!mIds.length) continue

    const { data: butsData, count: nb_buts } = await supabase.from('buts')
      .select('joueur_id, type', { count:'exact' }).in('match_id', mIds)
    if (!nb_buts) continue

    // Top 3 buteurs
    const butMap = new Map<string,number>()
    for (const b of (butsData??[])) {
      butMap.set(b.joueur_id, (butMap.get(b.joueur_id)??0)+1)
    }
    const top3ids = [...butMap.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id])=>id)
    const { data: top3j } = await supabase.from('joueurs').select('id,prenom,nom').in('id', top3ids)
    const top3 = top3ids.map(id => ({
      joueur_id: id,
      prenom: top3j?.find(j=>j.id===id)?.prenom ?? '',
      nom:    top3j?.find(j=>j.id===id)?.nom ?? '',
      buts:   butMap.get(id)??0
    }))

    result.push({ ...comp, nb_matchs: mIds.length, total_buts: nb_buts, top3 })
  }
  statsParComp.value = result
  loading.value = false
}

onMounted(async () => {
  const { data } = await supabase.from('competitions').select('id,nom,slug,saison,type,statut').order('saison', { ascending: false })
  competitions.value = data ?? []
  loadTab()
})
</script>

<style scoped>
.filter-bar { display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap }
.ia-comment-block { display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:10px;background:rgba(58,128,190,.07);border:1px solid rgba(58,128,190,.15);margin-bottom:20px }
.ia-comment-icon { font-size:1.4rem;flex-shrink:0;margin-top:2px }
.comp-select { min-width:280px;flex:1;max-width:480px }
.comp-info { display:flex;align-items:center;gap:8px }
.stats-tabs { display:flex;gap:8px;flex-wrap:wrap }
.stats-tab { padding:8px 16px;border-radius:8px;border:1px solid var(--p-border);cursor:pointer;font-size:13px;background:transparent;color:var(--p-sub);transition:all 150ms }
.stats-tab.active { border-color:var(--p-red);background:rgba(140,21,37,.1);color:var(--p-red) }
.podium { display:flex;align-items:flex-end;justify-content:center;gap:20px;padding:20px 0 0 }
.podium-step { display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center }
.podium-avatar { width:52px;height:52px;border-radius:50%;background:var(--p-bg3);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:var(--p-red) }
.podium-name { font-size:12px;font-weight:600;max-width:80px }
.podium-buts { color:var(--p-red);font-size:1.2rem;font-weight:700 }
.podium-bar { width:60px;border-radius:4px 4px 0 0 }
.rank-1 .podium-bar { height:80px;background:var(--p-gold) }
.rank-2 .podium-bar { height:55px;background:#8A8A9A }
.rank-3 .podium-bar { height:38px;background:#8A5A2A }
.poste-badge { padding:2px 7px;border-radius:99px;background:rgba(140,21,37,.1);color:var(--p-red);font-size:11px;font-weight:600 }
.comp-block { margin-bottom:16px;padding:16px 20px }
.comp-block-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--p-border) }
.comp-top-scorers { display:flex;flex-direction:column;gap:6px }
.scorer-row { display:flex;align-items:center;gap:10px;font-size:13px }
.scorer-rank { font-size:1rem;font-weight:700;color:var(--p-sub);min-width:20px }
.scorer-name { flex:1;font-weight:600;color:var(--p-text) }
.scorer-buts { font-size:1rem }
.empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 0;color:var(--p-sub) }
.empty-state span { font-size:2.5rem }
.loading-state { display:flex;justify-content:center;padding:60px 0 }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
