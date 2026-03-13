<template>
  <div class="dashboard">
    <!-- KPIs -->
    <div class="kpi-grid">
      <div v-for="k in kpis" :key="k.label" class="kpi-card p-card">
        <div class="kpi-icon"><component :is="k.icon" class="w-5 h-5" /></div>
        <div class="kpi-body">
          <span class="kpi-value font-display">{{ k.value }}</span>
          <span class="kpi-label text-sub">{{ k.label }}</span>
        </div>
        <div class="kpi-trend" v-if="k.trend" :class="k.trend > 0 ? 'trend-up' : 'trend-down'">
          {{ k.trend > 0 ? '↑' : '↓' }} {{ Math.abs(k.trend) }}
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Matchs récents -->
      <div class="widget p-card">
        <div class="widget-header">
          <h3 class="widget-title">Derniers matchs saisis</h3>
          <RouterLink to="/admin/matchs" class="p-btn-ghost p-btn-sm">+ Saisir</RouterLink>
        </div>
        <div v-if="loadingMatchs" class="loading-mini"><div class="spinner" /></div>
        <table v-else class="p-table">
          <thead><tr><th>Match</th><th>Score</th><th>J.</th><th>Date</th></tr></thead>
          <tbody>
            <tr v-for="m in dernierMatchs" :key="m.id">
              <td style="font-size:12px">{{ m.club_domicile?.nom }} vs {{ m.club_exterieur?.nom }}</td>
              <td class="font-display" style="font-weight:700;font-size:1rem">{{ m.score_dom }} – {{ m.score_ext }}</td>
              <td class="text-sub">J{{ m.journee }}</td>
              <td class="text-sub" style="font-size:11px">{{ formatDate(m.date_match) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Alertes crowdsourcing -->
      <div class="widget p-card">
        <div class="widget-header">
          <h3 class="widget-title">Demandes RGPD en attente</h3>
          <RouterLink to="/admin/validation" class="p-btn-ghost p-btn-sm">Voir tout</RouterLink>
        </div>
        <div v-if="alertes.length === 0" class="empty-mini text-sub">Aucune demande en attente ✓</div>
        <div v-else class="alertes-list">
          <div v-for="a in alertes" :key="a.id" class="alerte-row">
            <span class="p-badge" :class="typeDemandeColor(a.type_demande)">{{ a.type_demande }}</span>
            <span style="font-size:13px">{{ a.contenu.slice(0,60) }}…</span>
            <span class="text-sub" style="font-size:11px">{{ formatDate(a.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Transferts suspicion -->
      <div class="widget p-card">
        <div class="widget-header">
          <h3 class="widget-title">RADAR — Suspicions auto</h3>
          <RouterLink to="/admin/alertes" class="p-btn-ghost p-btn-sm">Alertes</RouterLink>
        </div>
        <div v-if="suspicions.length === 0" class="empty-mini text-sub">Aucune suspicion détectée</div>
        <div v-else class="alertes-list">
          <div v-for="t in suspicions" :key="t.id" class="alerte-row">
            <span class="p-badge p-badge-red">Suspicion</span>
            <span style="font-size:13px">{{ t.joueur?.prenom }} {{ t.joueur?.nom }}</span>
            <span class="text-sub" style="font-size:11px">{{ t.club_origine?.nom }} → ?</span>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="widget p-card">
        <h3 class="widget-title" style="margin-bottom:16px">Actions rapides</h3>
        <div class="quick-actions">
          <RouterLink v-for="a in quickActions" :key="a.to" :to="a.to" class="quick-action">
            <span class="qa-icon"><component :is="a.icon" class="w-5 h-5" /></span>
            <span class="qa-label">{{ a.label }}</span>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Cartons bleus non traités -->
    <div v-if="cartonsBleu.length" class="cartons-bleu-alert p-card">
      <h3 class="font-display" style="margin-bottom:12px">⚠️ Cartons bleus — Rapports disciplinaires à transmettre</h3>
      <table class="p-table">
        <thead><tr><th>Joueur</th><th>Match</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>
          <tr v-for="d in cartonsBleu" :key="d.id">
            <td style="font-weight:600">{{ d.joueur?.prenom }} {{ d.joueur?.nom }}</td>
            <td class="text-sub" style="font-size:12px">{{ d.match_info }}</td>
            <td class="text-sub" style="font-size:11px">{{ formatDate(d.created_at) }}</td>
            <td>
              <button class="p-btn-ghost p-btn-sm" @click="marquerRapportEnvoye(d.id)">Marquer envoyé</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { Users, Building, Trophy, ArrowRightLeft, BookOpen, Shield, Calendar, UserPlus, Upload, Heart, Flag } from 'lucide-vue-next'

const kpis = ref([
  { icon: Users, label:'Joueurs en base',   value:'—', trend: null },
  { icon: Building, label:'Clubs actifs',       value:'—', trend: null },
  { icon: Trophy, label:'Matchs ce mois',     value:'—', trend: null },
  { icon: ArrowRightLeft, label:'Transferts actifs',  value:'—', trend: null },
  { icon: BookOpen, label:'Docs éducation',     value:'—', trend: null },
  { icon: Shield, label:'Demandes RGPD',     value:'—', trend: null },
])

const dernierMatchs = ref<any[]>([])
const alertes = ref<any[]>([])
const suspicions = ref<any[]>([])
const cartonsBleu = ref<any[]>([])
const loadingMatchs = ref(true)

const quickActions = [
  { to:'/admin/matchs',  icon: Calendar, label:'Saisir un match' },
  { to:'/admin/joueurs', icon: UserPlus, label:'Ajouter un joueur' },
  { to:'/admin/transferts', icon: ArrowRightLeft, label:'Ajouter un transfert' },
  { to:'/admin/education', icon: Upload, label:'Uploader un document' },
  { to:'/admin/votes',   icon: Heart, label:'Créer un vote' },
  { to:'/admin/national',icon: Flag, label:'Gérer les sélections' },
]

const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })
const typeDemandeColor = (t: string) => ({ correction:'p-badge-blue', suppression:'p-badge-red', ajout:'p-badge-green', reclamation:'p-badge-gold' }[t] ?? 'p-badge-muted')

async function marquerRapportEnvoye(id: string) {
  await supabase.from('discipline').update({ rapport_envoye: true }).eq('id', id)
  cartonsBleu.value = cartonsBleu.value.filter(d => d.id !== id)
}

onMounted(async () => {
  const [
    { count: nbJoueurs },
    { count: nbClubs },
    { data: matchs },
    { count: nbTransferts },
    { count: nbDocs },
    { data: crowd },
    { data: susp },
    { data: bleus },
  ] = await Promise.all([
    supabase.from('joueurs').select('id', { count: 'exact', head: true }),
    supabase.from('clubs').select('id', { count: 'exact', head: true }).eq('actif', true),
    supabase.from('matchs').select('*, club_domicile:clubs!matchs_club_domicile_id_fkey(nom), club_exterieur:clubs!matchs_club_exterieur_id_fkey(nom)').eq('statut','termine').order('date_match', { ascending:false }).limit(5),
    supabase.from('transferts').select('id', { count:'exact', head:true }).gte('fiabilite', 2),
    supabase.from('documents_education').select('id', { count:'exact', head:true }).eq('actif', true),
    supabase.from('crowdsourcing_queue').select('*').eq('statut','en_attente').order('created_at', { ascending:false }).limit(5),
    supabase.from('transferts').select('*, joueur:joueurs(prenom,nom), club_origine:clubs!transferts_club_origine_id_fkey(nom)').eq('fiabilite', 1).limit(4),
    supabase.from('discipline').select('*, joueur:joueurs(prenom,nom)').eq('type','carton_bleu').eq('rapport_envoye', false).limit(5),
  ])

  kpis.value[0].value = String(nbJoueurs ?? 0)
  kpis.value[1].value = String(nbClubs ?? 0)
  kpis.value[2].value = String((matchs ?? []).length)
  kpis.value[3].value = String(nbTransferts ?? 0)
  kpis.value[4].value = String(nbDocs ?? 0)
  kpis.value[5].value = String((crowd ?? []).length)

  dernierMatchs.value = matchs ?? []
  alertes.value = crowd ?? []
  suspicions.value = susp ?? []
  cartonsBleu.value = (bleus ?? []).map(b => ({ ...b, match_info: 'Match en cours' }))
  loadingMatchs.value = false
})
</script>

<style scoped>
.kpi-grid { display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:24px; }
.kpi-card { padding:16px;display:flex;align-items:center;gap:12px; }
.kpi-icon { font-size:1.6rem;flex-shrink:0; }
.kpi-value { font-size:1.6rem;font-weight:700;display:block; }
.kpi-label { font-size:11px;text-transform:uppercase;letter-spacing:.05em; }
.kpi-trend { margin-left:auto;font-size:12px;font-weight:700;flex-shrink:0; }
.trend-up { color:var(--p-green); }
.trend-down { color:var(--p-red); }

.dashboard-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-bottom:24px; }
.widget { padding:20px; }
.widget-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:14px; }
.widget-title { font-family:var(--font-display);font-size:1rem;font-weight:700; }
.loading-mini { display:flex;justify-content:center;padding:20px; }
.spinner { width:24px;height:24px;border:2px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
.empty-mini { padding:12px 0;font-size:13px; }

.alertes-list { display:flex;flex-direction:column;gap:8px; }
.alerte-row { display:flex;align-items:center;gap:8px;padding:8px;border-radius:6px;background:var(--p-bg2); }

.quick-actions { display:grid;grid-template-columns:repeat(3,1fr);gap:8px; }
.quick-action { display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 8px;border-radius:8px;border:1px solid var(--p-border);transition:all 150ms;text-align:center; }
.quick-action:hover { border-color:var(--p-red);background:rgba(140,21,37,.05); }
.qa-icon { font-size:1.4rem; }
.qa-label { font-size:11px;color:var(--p-sub); }

.cartons-bleu-alert { padding:20px;border-left:4px solid #3A2A8A;background:rgba(58,42,138,.06); }

@media (max-width:1200px) { .kpi-grid { grid-template-columns:repeat(3,1fr); } }
@media (max-width:900px) { .dashboard-grid { grid-template-columns:1fr; }.kpi-grid { grid-template-columns:repeat(2,1fr); } }
</style>
