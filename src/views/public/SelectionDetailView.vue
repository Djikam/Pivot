<template>
  <div class="selection-detail">
    <div v-if="loading" class="loading-state p-container" style="padding:80px 0"><div class="spinner" /></div>

    <div v-else-if="equipe">
      <section class="selection-hero">
        <div class="cam-stripe" />
        <div class="p-container hero-inner">
          <div>
            <RouterLink to="/national" class="p-btn-ghost p-btn-sm back-link">← Équipes nationales</RouterLink>
            <div style="display:flex;align-items:center;gap:10px;margin:14px 0 10px;flex-wrap:wrap">
              <span class="p-badge" :class="getCatBadge(equipe.categorie)">{{ equipe.categorie.toUpperCase() }}</span>
              <span class="p-badge p-badge-muted">{{ equipe.genre }}</span>
              <span class="p-badge p-badge-blue">{{ equipe.saison_active }}</span>
            </div>
            <h1 class="font-display hero-title">{{ equipe.nom }}</h1>
            <p class="text-sub" v-if="equipe.selectionneur && equipe.selectionneur !== 'À renseigner'">
              Sélectionneur : <strong>{{ equipe.selectionneur }}</strong>
            </p>
          </div>
          <div class="cam-emblem">🇨🇲</div>
        </div>
        <div class="cam-stripe" />
      </section>

      <div class="p-container kpi-row" v-if="kpis.length">
        <div v-for="k in kpis" :key="k.label" class="kpi-card p-card">
          <span class="kpi-value font-display" :class="k.color">{{ k.value }}</span>
          <span class="kpi-label text-sub">{{ k.label }}</span>
        </div>
      </div>

      <div class="p-container" style="padding-top:28px;padding-bottom:60px">
        <div class="p-tabs" style="margin-bottom:24px">
          <button class="p-tab" :class="{active:tab==='roster'}" @click="tab='roster'">Effectif ({{ joueurs.length }})</button>
          <button class="p-tab" :class="{active:tab==='matchs'}" @click="tab='matchs'">Matchs ({{ matchs.length }})</button>
          <button class="p-tab" :class="{active:tab==='stats'}" @click="tab='stats'">Stats individuelles</button>
          <button class="p-tab" :class="{active:tab==='ia'}" @click="tab='ia'; genererRecommandation()">🤖 Recommandations IA</button>
        </div>

        <!-- Roster par poste -->
        <div v-if="tab==='roster'">
          <div v-if="joueurs.length === 0" class="empty-state"><span>👥</span><p>Aucun joueur sélectionné.</p></div>
          <div v-else>
            <div v-for="groupe in rosterParPoste" :key="groupe.poste" class="poste-group">
              <h3 class="poste-group-title">{{ groupe.poste }} <span class="text-sub">({{ groupe.joueurs.length }})</span></h3>
              <div class="roster-grid">
                <RouterLink v-for="sel in groupe.joueurs" :key="sel.id" :to="'/joueurs/'+sel.joueur_id" class="roster-card p-card p-card-cam">
                  <div class="roster-avatar">
                    <img v-if="sel.joueur?.photo_cloudinary_id" :src="cloudinaryUrl(sel.joueur.photo_cloudinary_id,{w:56,h:56})" />
                    <span v-else class="roster-initials">{{ sel.joueur?.prenom?.[0] }}{{ sel.joueur?.nom?.[0] }}</span>
                  </div>
                  <div class="roster-info">
                    <span class="p-badge" :class="statutColor(sel.statut)" style="margin-bottom:4px;font-size:10px">{{ statutLabel(sel.statut) }}</span>
                    <div class="roster-name">{{ sel.joueur?.prenom }} {{ sel.joueur?.nom }}</div>
                    <div class="text-sub" style="font-size:11px">{{ sel.saison }}</div>
                  </div>
                  <div class="roster-score">
                    <span class="font-display" style="font-size:1.2rem;font-weight:700;color:var(--p-gold)">{{ sel.joueur?.score_ia }}</span>
                    <span class="text-sub" style="font-size:9px">Score IA</span>
                  </div>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Matchs groupés par phase -->
        <div v-if="tab==='matchs'">
          <div v-if="matchs.length === 0" class="empty-state"><span>📅</span><p>Aucun match enregistré.</p></div>
          <div v-else>
            <div v-for="groupe in matchsParPhase" :key="groupe.phase" class="match-phase-group">
              <h3 class="match-phase-title">{{ groupe.phase }}</h3>
              <div class="matchs-list">
                <div v-for="m in groupe.matchs" :key="m.id" class="match-intl-card p-card">
                  <div class="match-header">
                    <span class="text-sub" style="font-size:11px">{{ formatDate(m.date_match) }}</span>
                    <span v-if="m.lieu" class="text-sub" style="font-size:11px">📍 {{ m.lieu }}</span>
                  </div>
                  <div class="match-body">
                    <span class="match-team">🇨🇲 Cameroun</span>
                    <div class="match-score-block" :class="getResultClass(m)">
                      <span v-if="m.statut === 'termine'" class="font-display score-big">{{ m.score_dom }} – {{ m.score_ext }}</span>
                      <span v-else class="text-sub" style="font-size:13px">À venir</span>
                      <span class="result-label">{{ getResultLabel(m) }}</span>
                    </div>
                    <span class="match-team match-team-right">{{ m.adversaire_international }}</span>
                  </div>
                  <div v-if="m.mi_temps_dom !== null && m.mi_temps_dom !== undefined" class="match-footer">
                    <span class="text-sub" style="font-size:11px">Mi-temps : {{ m.mi_temps_dom }}–{{ m.mi_temps_ext }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats buteurs -->
        <div v-if="tab==='stats'">
          <div class="stats-note p-card" style="padding:14px 16px;margin-bottom:20px;border-left:3px solid var(--p-gold)">
            <p class="text-sub" style="font-size:12px">Statistiques issues des matchs saisis dans PIVOT.</p>
          </div>
          <div v-if="statsJoueurs.length === 0" class="empty-state"><span>📊</span><p>Aucune statistique disponible.</p></div>
          <table v-else class="p-table">
            <thead><tr><th>#</th><th>Joueur</th><th>Poste</th><th>Buts</th><th>Pén.</th><th>7m</th><th>Susp. 2'</th><th>Score IA</th></tr></thead>
            <tbody>
              <tr v-for="(s, i) in statsJoueurs" :key="s.joueur_id">
                <td class="text-sub">{{ i+1 }}</td>
                <td><RouterLink :to="'/joueurs/'+s.joueur_id" style="font-weight:700">{{ s.prenom }} {{ s.nom }}</RouterLink></td>
                <td><span class="poste-badge">{{ posteLabel(s.poste) }}</span></td>
                <td class="font-display" style="font-weight:700;color:var(--p-red)">{{ s.buts_total }}</td>
                <td class="text-sub">{{ s.buts_penalty }}</td>
                <td class="text-sub">{{ s.buts_7m }}</td>
                <td class="text-sub">{{ s.suspensions }}</td>
                <td><span class="font-display" style="font-weight:700" :style="{color:scoreColor(s.score_ia)}">{{ s.score_ia }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Recommandations IA -->
        <div v-if="tab==='ia'" style="padding-top:20px">
          <div v-if="iaLoading" class="empty-state"><span>⏳</span><p>L'IA analyse la composition…</p></div>
          <div v-else-if="!iaAnalyse" class="empty-state"><span>🤖</span><p>Clique sur l'onglet pour générer une analyse.</p></div>
          <div v-else class="ia-rapport p-card">
            <div class="ia-rapport-header">
              <span class="ia-badge">🤖 Analyse PIVOT IA</span>
              <span class="text-sub" style="font-size:11px">{{ equipe?.nom }}</span>
            </div>
            <div class="ia-rapport-body" v-html="iaAnalyseHtml" />
            <button class="p-btn-ghost p-btn-sm" style="margin-top:12px" @click="genererRecommandation">🔄 Régénérer</button>
          </div>
        </div>

      </div>
    </div>

    <div v-else class="p-container" style="padding:80px 0;text-align:center">
      <p class="text-sub">Équipe introuvable.</p>
      <RouterLink to="/national" class="p-btn-ghost p-btn-sm" style="margin-top:12px;display:inline-flex">← Retour</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase, cloudinaryUrl } from '@/lib/supabaseClient'

const route  = useRoute()
const equipe = ref<any>(null)
const joueurs = ref<any[]>([])
const matchs  = ref<any[]>([])
const statsJoueurs = ref<any[]>([])
const loading = ref(true)
const tab = ref<'roster'|'matchs'|'stats'|'ia'>('roster')
const iaAnalyse     = ref('')
const iaAnalyseHtml = ref('')
const iaLoading     = ref(false)

async function genererRecommandation() {
  if (!equipe.value || iaLoading.value) return
  iaLoading.value = true
  try {
    const titulaires = joueurs.value.filter(j => j.statut === 'titulaire')
    const stats = statsJoueurs.value.slice(0,10)
    const matchsData = matchs.value.map(m => ({
      adv: m.adversaire_international ?? `${m.club_domicile?.nom} vs ${m.club_exterieur?.nom}`,
      score: `${m.score_cam ?? m.score_dom}-${m.score_adv ?? m.score_ext}`,
      result: (m.score_cam ?? m.score_dom) > (m.score_adv ?? m.score_ext) ? 'V' : 'D'
    }))

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:600,
        messages:[{role:'user', content:
`Tu es un analyste handball expert pour PIVOT Cameroun.
Analyse cette sélection nationale et fournis des recommandations concrètes.

Équipe: ${equipe.value.nom} (${equipe.value.categorie})
Effectif titulaires (${titulaires.length}): ${titulaires.map((j:any) => `${j.joueur?.prenom} ${j.joueur?.nom} (${j.joueur?.poste_principal}, score=${j.joueur?.score_ia})`).join(', ')}
Résultats: ${JSON.stringify(matchsData)}
Top performers: ${JSON.stringify(stats.map(s=>({nom:s.nom, buts:s.buts_total, poste:s.poste})))}

Fournis:
1. **Forces** de cette équipe (2-3 points)
2. **Points d'amélioration** (2-3 points)
3. **Joueurs à surveiller** (1-2 noms avec justification)
4. **Recommandation tactique** (1 recommandation concrète)

Format HTML avec <strong> pour les titres. En français. Concis et percutant.`}]
      })
    })
    const d = await r.json()
    iaAnalyse.value = d.content?.[0]?.text ?? ''
    // Formater le texte en HTML basique
    iaAnalyseHtml.value = iaAnalyse.value
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')
  } catch(e) { iaAnalyse.value = 'Erreur lors de la génération. Réessaie.' }
  finally { iaLoading.value = false }
}

const postes: Record<string,string> = { gardien:'Gardien',ailier_g:'Ailier G',ailier_d:'Ailier D',arriere_g:'Arrière G',arriere_d:'Arrière D',demi_centre:'Demi-Centre',pivot:'Pivot' }
const posteLabel  = (p:string) => postes[p] ?? p
const scoreColor  = (s:number) => s >= 80 ? '#3BAA6A' : s >= 60 ? '#C4922A' : '#3A80BE'
const statutLabel = (s:string) => ({ preselectione:'Présélectionné', finaliste:'Finaliste', titulaire:'Titulaire' }[s] ?? s)
const statutColor = (s:string) => ({ preselectione:'p-badge-muted', finaliste:'p-badge-gold', titulaire:'p-badge-green' }[s] ?? 'p-badge-muted')
const getCatBadge = (c:string) => ({ senior:'p-badge-red', u20:'p-badge-gold', u17:'p-badge-blue', beach:'p-badge-green' }[c] ?? 'p-badge-muted')
const formatDate  = (d:string) => new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})

function getResultClass(m:any) {
  if (m.statut !== 'termine' || m.score_dom === null) return ''
  return m.score_dom > m.score_ext ? 'result-win' : m.score_dom < m.score_ext ? 'result-loss' : 'result-draw'
}
function getResultLabel(m:any) {
  if (m.statut !== 'termine' || m.score_dom === null) return ''
  return m.score_dom > m.score_ext ? 'V' : m.score_dom < m.score_ext ? 'D' : 'N'
}

const rosterParPoste = computed(() => {
  const ordre = ['gardien','ailier_g','ailier_d','arriere_g','arriere_d','demi_centre','pivot']
  const map = new Map<string,any[]>()
  for (const j of joueurs.value) {
    const p = j.joueur?.poste_principal ?? 'autre'
    if (!map.has(p)) map.set(p,[])
    map.get(p)!.push(j)
  }
  return ordre.filter(p => map.has(p)).map(p => ({ poste: posteLabel(p), joueurs: map.get(p)! }))
})

const matchsParPhase = computed(() => {
  const map = new Map<string,any[]>()
  for (const m of matchs.value) {
    const phase = m.phase_nom ?? 'Matchs'
    if (!map.has(phase)) map.set(phase,[])
    map.get(phase)!.push(m)
  }
  return [...map.entries()].map(([phase,ms]) => ({ phase, matchs: ms }))
})

const kpis = computed(() => {
  const t = matchs.value.filter(m => m.statut === 'termine')
  if (!t.length) return []
  const v = t.filter(m => m.score_dom > m.score_ext).length
  const d = t.filter(m => m.score_dom < m.score_ext).length
  const n = t.filter(m => m.score_dom === m.score_ext && m.score_dom !== null).length
  const bp = t.reduce((a,m) => a + (m.score_dom ?? 0), 0)
  const bc = t.reduce((a,m) => a + (m.score_ext ?? 0), 0)
  return [
    { label:'Victoires', value:v, color:'text-green' },
    { label:'Nuls', value:n, color:'text-sub' },
    { label:'Défaites', value:d, color:'text-red' },
    { label:'Matchs', value:t.length, color:'' },
    { label:'Buts pour', value:bp, color:'text-gold' },
    { label:'Buts contre', value:bc, color:'text-sub' },
  ]
})

onMounted(async () => {
  const id = route.params.id as string
  const [{ data: eq }, { data: sels }, { data: ms }] = await Promise.all([
    supabase.from('equipes_nationales').select('*').eq('id', id).single(),
    supabase.from('selections_joueurs')
      .select('*, joueur:joueurs(id,prenom,nom,poste_principal,score_ia,photo_cloudinary_id)')
      .eq('equipe_nationale_id', id).order('statut'),
    supabase.from('matchs')
      .select('*, phase:phases(nom)')
      .eq('type_match','international').eq('equipe_nationale_id', id)
      .order('date_match', { ascending: false })
  ])
  equipe.value = eq
  joueurs.value = sels ?? []
  matchs.value = (ms ?? []).map(m => ({ ...m, phase_nom: m.phase?.nom ?? 'Matchs' }))

  // Stats buts/discipline pour cette équipe
  const matchIds = (ms ?? []).map(m => m.id)
  if (matchIds.length && (sels ?? []).length) {
    const [{ data: butsData }, { data: discData }] = await Promise.all([
      supabase.from('buts').select('joueur_id,type').in('match_id', matchIds),
      supabase.from('discipline').select('joueur_id').eq('type','suspension_2min').in('match_id', matchIds),
    ])
    const statsMap = new Map<string,any>()
    for (const s of (sels ?? [])) {
      statsMap.set(s.joueur_id, {
        joueur_id:s.joueur_id, prenom:s.joueur?.prenom??'', nom:s.joueur?.nom??'',
        poste:s.joueur?.poste_principal??'', score_ia:s.joueur?.score_ia??50,
        buts_total:0, buts_penalty:0, buts_7m:0, suspensions:0
      })
    }
    for (const b of (butsData ?? [])) {
      if (!statsMap.has(b.joueur_id)) continue
      const e = statsMap.get(b.joueur_id)!
      e.buts_total++
      if (b.type==='penalty') e.buts_penalty++
      if (b.type==='7m') e.buts_7m++
    }
    for (const d of (discData ?? [])) {
      if (statsMap.has(d.joueur_id)) statsMap.get(d.joueur_id)!.suspensions++
    }
    statsJoueurs.value = [...statsMap.values()].sort((a,b) => b.buts_total - a.buts_total)
  }
  loading.value = false
})
</script>

<style scoped>
.selection-hero{background:var(--p-card);border-bottom:1px solid var(--p-border)}
.cam-stripe{height:5px;background:linear-gradient(to right,var(--cam-green,#007A5E) 33.3%,var(--cam-red,#8C1525) 33.3% 66.6%,var(--cam-yellow,#FCD116) 66.6%)}
.hero-inner{display:flex;justify-content:space-between;align-items:center;padding:20px 0}
.hero-title{font-size:2rem;font-weight:700;margin:8px 0 6px}
.cam-emblem{font-size:3.5rem;opacity:.8}
.kpi-row{display:flex;gap:12px;flex-wrap:wrap;padding-top:24px;padding-bottom:0}
.kpi-card{padding:16px 20px;text-align:center;min-width:90px;flex:1;display:flex;flex-direction:column;gap:4px}
.kpi-value{font-size:1.8rem;font-weight:700}
.kpi-label{font-size:11px;text-transform:uppercase;letter-spacing:.05em}
.text-green{color:var(--p-green,#3BAA6A)}.text-red{color:var(--p-red)}.text-gold{color:var(--p-gold)}
.poste-group{margin-bottom:28px}
.poste-group-title{font-family:var(--font-display);font-size:1rem;font-weight:700;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid var(--p-border)}
.roster-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
.roster-card{display:flex;align-items:center;gap:12px;padding:12px 14px}
.roster-avatar{width:48px;height:48px;border-radius:50%;overflow:hidden;background:var(--p-bg3);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.roster-avatar img{width:100%;height:100%;object-fit:cover}
.roster-initials{font-family:var(--font-display);font-size:1rem;font-weight:700;color:var(--p-red)}
.roster-info{flex:1}
.roster-name{font-weight:700;font-size:13px;margin:2px 0}
.roster-score{display:flex;flex-direction:column;align-items:center;flex-shrink:0}
.match-phase-group{margin-bottom:28px}
.match-phase-title{font-family:var(--font-display);font-size:1rem;font-weight:700;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid var(--p-border)}
.matchs-list{display:flex;flex-direction:column;gap:8px}
.match-intl-card{padding:14px 16px}
.match-header{display:flex;justify-content:space-between;margin-bottom:10px}
.match-body{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px}
.match-team{font-weight:700;font-size:14px}
.match-team-right{text-align:right}
.match-score-block{text-align:center;padding:6px 16px;border-radius:8px;background:var(--p-bg3)}
.match-score-block.result-win{background:rgba(59,170,106,.1);border:1px solid rgba(59,170,106,.3)}
.match-score-block.result-loss{background:rgba(140,21,37,.08);border:1px solid rgba(140,21,37,.2)}
.score-big{font-size:1.4rem;font-weight:700;display:block}
.result-label{font-size:10px;color:var(--p-sub);letter-spacing:.05em;text-transform:uppercase}
.match-footer{margin-top:8px;padding-top:8px;border-top:1px solid var(--p-border)}
.poste-badge{padding:2px 7px;border-radius:99px;background:rgba(140,21,37,.1);color:var(--p-red);font-size:11px;font-weight:600}
.empty-state{display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 0;color:var(--p-sub)}
.empty-state span{font-size:2rem}
.ia-rapport{padding:20px}
.ia-rapport-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--p-border)}
.ia-badge{font-size:12px;font-weight:700;color:var(--p-blue);background:rgba(58,128,190,.1);padding:4px 10px;border-radius:99px}
.ia-rapport-body{font-size:14px;line-height:1.7;color:var(--p-text)}
.loading-state{display:flex;justify-content:center;align-items:center}
.spinner{width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:700px){.hero-inner{flex-direction:column;text-align:center}.match-body{grid-template-columns:1fr}.match-team-right{text-align:left}}
</style>

