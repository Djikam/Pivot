<template>
  <div class="dashboard">
    <!-- KPIs principaux -->
    <div class="kpi-grid">
      <RouterLink v-for="k in kpis" :key="k.label" :to="k.to" class="kpi-card p-card">
        <div class="kpi-icon-wrap" :style="{background: k.bg}">
          <component :is="k.icon" width="20" height="20" />
        </div>
        <div class="kpi-body">
          <span class="kpi-value font-display">{{ metrics[k.key] ?? '—' }}</span>
          <span class="kpi-label text-sub">{{ k.label }}</span>
        </div>
        <span v-if="k.alert && metrics[k.key] > 0" class="kpi-dot" />
      </RouterLink>
    </div>

    <!-- Alertes prioritaires -->
    <div v-if="metrics.nb_alertes > 0 || metrics.nb_rgpd_attente > 0 || metrics.nb_cartons_bleu > 0" class="alert-banner">
      <span class="alert-icon">️</span>
      <div class="alert-items">
        <RouterLink v-if="metrics.nb_rgpd_attente > 0" to="/admin/validation" class="alert-chip">
           {{ metrics.nb_rgpd_attente }} demande(s) RGPD en attente
        </RouterLink>
        <RouterLink v-if="metrics.nb_alertes > 0" to="/admin/alertes" class="alert-chip">
           {{ metrics.nb_alertes }} alerte(s) non lue(s)
        </RouterLink>
        <RouterLink v-if="metrics.nb_cartons_bleu > 0" to="/admin/alertes" class="alert-chip" style="border-color:#8A7AFF;color:#8A7AFF">
           {{ metrics.nb_cartons_bleu }} rapport(s) disciplinaire(s) à transmettre
        </RouterLink>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Derniers matchs -->
      <div class="widget p-card">
        <div class="widget-header">
          <h3 class="widget-title"> Derniers matchs saisis</h3>
          <RouterLink to="/admin/matchs" class="p-btn-ghost p-btn-sm">+ Saisir</RouterLink>
        </div>
        <div v-if="loadingMatchs" class="loading-mini"><div class="spinner" /></div>
        <div v-else-if="dernierMatchs.length === 0" class="empty-mini text-sub">Aucun match terminé.</div>
        <table v-else class="p-table">
          <tbody>
            <tr v-for="m in dernierMatchs" :key="m.id">
              <td style="font-size:12px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                <span v-if="m.type_match==='international'"> vs {{ m.adversaire_international }}</span>
                <span v-else>{{ m.club_domicile?.nom }} vs {{ m.club_exterieur?.nom }}</span>
              </td>
              <td class="font-display" style="font-weight:700">
                <span :style="{color: m.score_dom>m.score_ext?'var(--p-green)':'var(--p-red)'}">{{ m.score_dom }}</span>
                – {{ m.score_ext }}
              </td>
              <td class="text-sub" style="font-size:11px">{{ fd(m.date_match) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Self-Reports / Demandes RGPD -->
      <div class="widget p-card">
        <div class="widget-header">
          <h3 class="widget-title"> Demandes RGPD / Self-Reports</h3>
          <RouterLink to="/admin/validation" class="p-btn-ghost p-btn-sm">Gérer </RouterLink>
        </div>
        <div v-if="collecteDemandes.length === 0" class="empty-mini text-sub"> Aucune demande en attente</div>
        <div v-else class="alertes-list">
          <div v-for="d in collecteDemandes" :key="d.id" class="alerte-row">
            <span class="p-badge" :class="typeBadge(d.type_profil)">{{ d.type_profil }}</span>
            <span style="font-size:13px;font-weight:600">{{ d.prenom }} {{ d.nom }}</span>
            <span class="text-sub" style="font-size:11px;margin-left:auto">{{ fd(d.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Top buteurs récents -->
      <div class="widget p-card">
        <div class="widget-header">
          <h3 class="widget-title"> Top Buteurs PIVOT</h3>
          <RouterLink to="/statistiques" class="p-btn-ghost p-btn-sm">Voir stats </RouterLink>
        </div>
        <div v-if="topButeurs.length === 0" class="empty-mini text-sub">Aucune donnée buteur.</div>
        <div v-else class="buteurs-list">
          <div v-for="(b, i) in topButeurs" :key="b.joueur_id" class="buteur-mini-row">
            <span class="rank-num font-display">{{ i+1 }}</span>
            <RouterLink :to="'/joueurs/'+b.joueur_id" class="buteur-mini-name">{{ b.prenom }} {{ b.nom }}</RouterLink>
            <span class="p-badge p-badge-muted" style="font-size:10px">{{ b.genre==='feminin'?'F':'M' }}</span>
            <span class="font-display" style="font-weight:700;color:var(--p-red)">{{ b.total_buts }}</span>
            <span class="text-sub" style="font-size:11px">buts</span>
          </div>
        </div>
      </div>

      <!-- Activité récente IA -->
      <div class="widget p-card">
        <div class="widget-header">
          <h3 class="widget-title"> Insights IA</h3>
        </div>
        <div v-if="loadingIA" class="loading-mini"><div class="spinner" /></div>
        <div v-else class="ia-insights">
          <div v-for="insight in iaInsights" :key="insight.id" class="ia-insight-card">
            <span class="ia-icon">{{ insight.icon }}</span>
            <div>
              <div style="font-size:13px;font-weight:600">{{ insight.titre }}</div>
              <div class="text-sub" style="font-size:12px">{{ insight.corps }}</div>
            </div>
          </div>
          <div v-if="iaInsights.length===0" class="empty-mini text-sub">Aucun insight disponible. Saisie plus de données.</div>
        </div>
      </div>

      <!-- Transferts récents -->
      <div class="widget p-card">
        <div class="widget-header">
          <h3 class="widget-title"> RADAR — Transferts</h3>
          <RouterLink to="/admin/transferts" class="p-btn-ghost p-btn-sm">Gérer </RouterLink>
        </div>
        <div v-if="transfertsRecents.length === 0" class="empty-mini text-sub">Aucun transfert récent.</div>
        <div v-else class="alertes-list">
          <div v-for="t in transfertsRecents" :key="t.id" class="alerte-row">
            <span class="p-badge" :class="fiabBadge(t.fiabilite)">{{ fiabLabel(t.fiabilite) }}</span>
            <span style="font-size:13px">{{ t.joueur?.prenom }} {{ t.joueur?.nom }}</span>
            <span class="text-sub" style="font-size:11px"> {{ t.club_destination?.nom ?? '?' }}</span>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="widget p-card">
        <h3 class="widget-title" style="margin-bottom:16px"> Actions rapides</h3>
        <div class="quick-actions">
          <RouterLink v-for="a in quickActions" :key="a.to" :to="a.to" class="quick-action">
            <component :is="a.icon" width="20" height="20" style="color:var(--p-red)" />
            <span class="qa-label">{{ a.label }}</span>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Stat BD santé -->
    <div class="health-bar p-card">
      <div class="health-title font-display"> Santé de la base de données</div>
      <div class="health-grid">
        <div v-for="h in healthStats" :key="h.label" class="health-item">
          <div class="health-val" :style="{color: h.color}">{{ h.val }}</div>
          <div class="health-label text-sub">{{ h.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { callIA, callIAJson } from '@/lib/iaClient'
import {
  Users, Building, Trophy, ArrowRightLeft, BookOpen, Shield,
  Calendar, UserPlus, Upload, Heart, Flag, Gavel
} from 'lucide-vue-next'

const metrics       = ref<Record<string,number>>({})
const dernierMatchs = ref<any[]>([])
const collecteDemandes = ref<any[]>([])
const topButeurs    = ref<any[]>([])
const transfertsRecents = ref<any[]>([])
const iaInsights    = ref<any[]>([])
const loadingMatchs = ref(true)
const loadingIA     = ref(true)

const fd         = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })
const typeBadge  = (t: string) => ({ JOUEUR:'p-badge-blue', COACH:'p-badge-gold', PRESIDENT:'p-badge-muted' }[t ?? ''] ?? 'p-badge-muted')
const fiabLabel  = (n: number) => ['','Suspicion','Rumeur','Officieux','Confirmé'][n] ?? '?'
const fiabBadge  = (n: number) => (['','p-badge-muted','p-badge-muted','p-badge-blue','p-badge-green'])[n] ?? 'p-badge-muted'

const kpis = [
  { key:'nb_joueurs',        label:'Joueurs',          icon:Users,           to:'/admin/joueurs',    bg:'rgba(140,21,37,.1)',   alert:false },
  { key:'nb_clubs',          label:'Clubs actifs',     icon:Building,        to:'/admin/clubs',      bg:'rgba(58,128,190,.1)',  alert:false },
  { key:'nb_matchs_termines',label:'Matchs terminés',  icon:Trophy,          to:'/admin/matchs',     bg:'rgba(196,146,42,.1)', alert:false },
  { key:'nb_buts',           label:'Buts enregistrés', icon:Trophy,          to:'/statistiques',     bg:'rgba(59,170,106,.1)', alert:false },
  { key:'nb_transferts',     label:'Transferts actifs',icon:ArrowRightLeft,  to:'/admin/transferts', bg:'rgba(138,122,255,.1)',alert:false },
  { key:'nb_rgpd_attente',   label:'RGPD en attente',  icon:Shield,          to:'/admin/validation', bg:'rgba(140,21,37,.15)', alert:true  },
]

const quickActions = [
  { to:'/admin/matchs',      icon:Calendar,       label:'Créer / Saisir match' },
  { to:'/admin/joueurs',     icon:UserPlus,       label:'Ajouter joueur' },
  { to:'/admin/transferts',  icon:ArrowRightLeft, label:'Nouveau transfert' },
  { to:'/admin/national',    icon:Flag,           label:'Gérer sélections' },
  { to:'/admin/votes',       icon:Heart,          label:'Créer un vote' },
  { to:'/admin/arbitres',    icon:Gavel,          label:'Gestion arbitres' },
]

const healthStats = computed(() => [
  { label:'Joueurs total', val: metrics.value.nb_joueurs ?? 0,     color:'var(--p-text)' },
  { label:'dont Femmes',   val: metrics.value.nb_joueuses ?? 0,    color:'var(--p-gold)' },
  { label:'Sélectionnés',  val: metrics.value.nb_selections ?? 0,  color:'var(--p-green)' },
  { label:'Buts saisis',   val: metrics.value.nb_buts ?? 0,        color:'var(--p-red)' },
  { label:'Staff',         val: metrics.value.nb_staff ?? 0,       color:'var(--p-blue)' },
  { label:'Compétitions',  val: metrics.value.nb_competitions ?? 0,color:'var(--p-sub)' },
])

async function loadIAInsights() {
  loadingIA.value = true
  try {
    // Construire un contexte rapide depuis la BD
    const ctx = {
      nb_joueurs:    metrics.value.nb_joueurs,
      nb_buts:       metrics.value.nb_buts,
      nb_matchs:     metrics.value.nb_matchs_termines,
      nb_transferts: metrics.value.nb_transferts,
    }
    const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ia-proxy`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages:[{ role:'user', content:
          `Tu es l'assistant admin de PIVOT, plateforme data handball Cameroun.
Données actuelles: ${JSON.stringify(ctx)}
Génère 3 insights courts et actionnables pour l'admin.
Réponds UNIQUEMENT en JSON: [{"icon":"emoji","titre":"...","corps":"..."}]` }]
      })
    })
    const d = await r.json()
    const text = d.content?.[0]?.text ?? '[]'
    try { iaInsights.value = JSON.parse(text.replace(/```json?|```/g,'').trim()) } catch { iaInsights.value = [] }
  } catch { iaInsights.value = [] }
  loadingIA.value = false
}

onMounted(async () => {
  // 1. Métriques globales via la vue
  const { data: m } = await supabase.from('dashboard_metrics').select('*').single()
  metrics.value = m ?? {}

  // 2. Derniers matchs (club + international)
  const { data: mx } = await supabase.from('matchs')
    .select(`id, score_dom, score_ext, date_match, type_match, adversaire_international,
      club_domicile:clubs!matchs_club_domicile_id_fkey(nom),
      club_exterieur:clubs!matchs_club_exterieur_id_fkey(nom)`)
    .eq('statut','termine')
    .order('date_match', { ascending:false })
    .limit(5)
  dernierMatchs.value = mx ?? []
  loadingMatchs.value = false

  // 3. Demandes RGPD en attente
  const { data: rgpd } = await supabase.from('collecte_profils')
    .select('id,type_profil,prenom,nom,created_at')
    .eq('statut','A_TRAITER')
    .order('created_at', { ascending:false })
    .limit(5)
  collecteDemandes.value = rgpd ?? []

  // 4. Top buteurs via vue
  const { data: tb } = await supabase.from('top_buteurs_view')
    .select('joueur_id,prenom,nom,genre,total_buts')
    .order('total_buts', { ascending:false })
    .limit(5)
  topButeurs.value = tb ?? []

  // 5. Transferts récents confirmés
  const { data: tr } = await supabase.from('transferts')
    .select('id,fiabilite,joueur:joueurs(prenom,nom),club_destination:clubs!transferts_club_destination_id_fkey(nom)')
    .gte('fiabilite', 2)
    .order('created_at', { ascending:false })
    .limit(4)
  transfertsRecents.value = tr ?? []

  // 6. Insights IA (après les données)
  await loadIAInsights()
})
</script>

<style scoped>
.kpi-grid { display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:16px }
.kpi-card { padding:14px 16px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:border-color 150ms }
.kpi-card:hover { border-color:var(--p-red) }
.kpi-icon-wrap { width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0 }
.kpi-value { font-size:1.5rem;font-weight:700;display:block;line-height:1.1 }
.kpi-label { font-size:10px;text-transform:uppercase;letter-spacing:.05em }
.kpi-dot { width:8px;height:8px;border-radius:50%;background:var(--p-red);margin-left:auto;flex-shrink:0;animation:pulse 1.5s infinite }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

.alert-banner { display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:10px;background:rgba(140,21,37,.08);border:1px solid rgba(140,21,37,.2);margin-bottom:16px;flex-wrap:wrap }
.alert-icon { font-size:1.3rem;flex-shrink:0 }
.alert-items { display:flex;gap:8px;flex-wrap:wrap }
.alert-chip { padding:4px 10px;border-radius:99px;border:1px solid var(--p-red);color:var(--p-red);font-size:12px;font-weight:600;cursor:pointer }
.alert-chip:hover { background:rgba(140,21,37,.1) }

.dashboard-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px }
.widget { padding:18px }
.widget-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:12px }
.widget-title { font-family:var(--font-display);font-size:.95rem;font-weight:700 }
.loading-mini { display:flex;justify-content:center;padding:20px }
.spinner { width:22px;height:22px;border:2px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin .7s linear infinite }
@keyframes spin { to{transform:rotate(360deg)} }
.empty-mini { padding:10px 0;font-size:13px }
.alertes-list { display:flex;flex-direction:column;gap:6px }
.alerte-row { display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;background:var(--p-bg2);font-size:13px }
.buteurs-list { display:flex;flex-direction:column;gap:6px }
.buteur-mini-row { display:flex;align-items:center;gap:8px;font-size:13px }
.rank-num { font-size:1rem;font-weight:700;color:var(--p-sub);min-width:20px }
.buteur-mini-name { flex:1;font-weight:600;color:var(--p-text) }
.ia-insights { display:flex;flex-direction:column;gap:10px }
.ia-insight-card { display:flex;gap:10px;align-items:flex-start;padding:8px;border-radius:8px;background:var(--p-bg2) }
.ia-icon { font-size:1.3rem;flex-shrink:0;margin-top:2px }
.quick-actions { display:grid;grid-template-columns:repeat(3,1fr);gap:8px }
.quick-action { display:flex;flex-direction:column;align-items:center;gap:5px;padding:12px 6px;border-radius:8px;border:1px solid var(--p-border);transition:all 150ms;text-align:center }
.quick-action:hover { border-color:var(--p-red);background:rgba(140,21,37,.05) }
.qa-label { font-size:10px;color:var(--p-sub);line-height:1.3 }

.health-bar { padding:16px 20px }
.health-title { font-size:1rem;font-weight:700;margin-bottom:12px }
.health-grid { display:grid;grid-template-columns:repeat(6,1fr);gap:16px }
.health-val { font-family:var(--font-display);font-size:1.4rem;font-weight:700 }
.health-label { font-size:10px;text-transform:uppercase;letter-spacing:.05em;margin-top:2px }

@media (max-width:1200px) { .kpi-grid{grid-template-columns:repeat(3,1fr)}.dashboard-grid{grid-template-columns:repeat(2,1fr)}.health-grid{grid-template-columns:repeat(3,1fr)} }
@media (max-width:768px) { .kpi-grid{grid-template-columns:repeat(2,1fr)}.dashboard-grid{grid-template-columns:1fr}.health-grid{grid-template-columns:repeat(2,1fr)} }
</style>
