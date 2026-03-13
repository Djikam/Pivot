<template>
  <div class="dashboard">
    <!-- KPIs -->
    <div class="kpi-grid">
      <div v-for="k in kpis" :key="k.label" class="kpi-card p-card">
        <div class="kpi-icon">{{ k.icon }}</div>
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
            <span class="qa-icon">{{ a.icon }}</span>
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

const kpis = ref([
  { icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>', label:'Joueurs en base',   value:'—', trend: null },
  { icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>', label:'Clubs actifs',       value:'—', trend: null },
  { icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg>', label:'Matchs ce mois',     value:'—', trend: null },
  { icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>', label:'Transferts actifs',  value:'—', trend: null },
  { icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>', label:'Docs éducation',     value:'—', trend: null },
  { icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>', label:'Demandes RGPD',     value:'—', trend: null },
])

const dernierMatchs = ref<any[]>([])
const alertes = ref<any[]>([])
const suspicions = ref<any[]>([])
const cartonsBleu = ref<any[]>([])
const loadingMatchs = ref(true)

const quickActions = [
  { to:'/admin/matchs',  icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg>', label:'Saisir un match' },
  { to:'/admin/joueurs', icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>', label:'Ajouter un joueur' },
  { to:'/admin/transferts', icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>', label:'Ajouter un transfert' },
  { to:'/admin/education', icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>', label:'Uploader un document' },
  { to:'/admin/votes',   icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>', label:'Créer un vote' },
  { to:'/admin/national',icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4a4 4 0 014-4h.582m-2.564-4A4 4 0 017 7.582M21 3H3a2 2 0 00-2 2v6a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2z"></path></svg>', label:'Gérer les sélections' },
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
