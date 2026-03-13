<template>
  <div>
    <section class="p-hero" style="padding:36px 0 28px">
      <div class="p-container">
        <h1 class="font-display" style="font-size:2.2rem;font-weight:700;margin-bottom:6px">RADAR — Transferts</h1>
        <p class="text-sub">Mouvements, mutations et rumeurs — 4 niveaux de fiabilité</p>
        <div class="fiabilite-legend">
          <span v-for="f in fiabilites" :key="f.n" class="p-badge" :class="f.badge">{{ f.label }}</span>
        </div>
      </div>
    </section>
    <div class="p-container" style="padding-top:24px;padding-bottom:60px">
      <div class="filters-bar">
        <select v-model="filterFiabilite" class="p-input p-select" @change="load">
          <option value="">Tous niveaux</option>
          <option v-for="f in fiabilites" :key="f.n" :value="f.n">{{ f.label }}</option>
        </select>
        <select v-model="filterType" class="p-input p-select" @change="load">
          <option value="">Tous types</option>
          <option value="transfert">Transfert</option>
          <option value="pret">Prêt</option>
          <option value="fin_contrat">Fin contrat</option>
        </select>
      </div>
      <div v-if="loading" class="loading-state"><div class="spinner" /></div>
      <div v-else class="transferts-list">
        <RouterLink v-for="t in transferts" :key="t.id" :to="'/transferts/'+t.id" class="transfert-card p-card">
          <div class="t-header">
            <span class="p-badge" :class="fiabiliteColor(t.fiabilite)">{{ fiabiliteLabel(t.fiabilite) }}</span>
            <span class="p-badge p-badge-muted">{{ t.type }}</span>
            <span class="text-sub t-date">{{ formatDate(t.created_at) }}</span>
          </div>
          <div class="t-body">
            <RouterLink :to="'/joueurs/'+t.joueur_id" class="t-joueur" @click.stop>{{ t.joueur?.prenom }} {{ t.joueur?.nom }}</RouterLink>
            <span class="t-poste text-sub">{{ t.joueur?.poste_principal }}</span>
          </div>
          <div class="t-clubs">
            <span class="t-club text-sub">{{ t.club_origine?.nom ?? 'Inconnu' }}</span>
            <span class="t-arrow" :class="fiabiliteArrowColor(t.fiabilite)">→</span>
            <span class="t-club" style="font-weight:700">{{ t.club_destination?.nom ?? 'Inconnu' }}</span>
          </div>
          <div v-if="t.motif" class="t-motif text-sub">{{ t.motif }}</div>
        </RouterLink>
      </div>
      <div v-if="!loading && transferts.length===0" class="empty-state"><Target class="w-8 h-8" /><p>Aucun mouvement enregistré.</p></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { Target } from 'lucide-vue-next'

const transferts = ref<any[]>([])
const loading = ref(true)
const filterFiabilite = ref<number|''>('')
const filterType = ref('')

const fiabilites = [
  { n:4, label:'Confirmé',  badge:'p-badge-green' },
  { n:3, label:'Officieux', badge:'p-badge-blue' },
  { n:2, label:'Rumeur',    badge:'p-badge-gold' },
  { n:1, label:'Suspicion', badge:'p-badge-red' },
]
const fiabiliteLabel = (n:number) => fiabilites.find(f=>f.n===n)?.label ?? '—'
const fiabiliteColor = (n:number) => fiabilites.find(f=>f.n===n)?.badge ?? 'p-badge-muted'
const fiabiliteArrowColor = (n:number) => ({ 4:'text-green', 3:'text-blue', 2:'text-gold', 1:'text-red' }[n] ?? '')
const formatDate = (d:string) => new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})

async function load() {
  loading.value = true
  let q = supabase.from('transferts')
    .select('*, joueur:joueurs(prenom,nom,poste_principal), club_origine:clubs!transferts_club_origine_id_fkey(nom), club_destination:clubs!transferts_club_destination_id_fkey(nom)')
    .order('fiabilite',{ascending:false}).order('created_at',{ascending:false}).limit(50)
  if (filterFiabilite.value !== '') q = q.eq('fiabilite', filterFiabilite.value)
  if (filterType.value) q = q.eq('type', filterType.value)
  const { data } = await q
  transferts.value = data ?? []; loading.value = false
}
onMounted(load)
</script>

<style scoped>
.fiabilite-legend { display:flex;gap:8px;margin-top:12px;flex-wrap:wrap; }
.filters-bar { display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap; }
.transferts-list { display:flex;flex-direction:column;gap:10px; }
.transfert-card { padding:16px;display:flex;flex-direction:column;gap:8px; }
.t-header { display:flex;align-items:center;gap:8px;flex-wrap:wrap; }
.t-date { font-size:11px;margin-left:auto; }
.t-body { display:flex;align-items:center;gap:10px; }
.t-joueur { font-weight:700;font-size:15px;color:var(--p-text); }
.t-poste { font-size:12px;text-transform:capitalize; }
.t-clubs { display:flex;align-items:center;gap:10px;font-size:13px; }
.t-club { flex:1; }
.t-arrow { font-size:1.1rem;font-weight:700;flex-shrink:0; }
.t-motif { font-size:12px;font-style:italic;padding:6px 8px;border-radius:6px;background:var(--p-bg2); }
.loading-state,.empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 0;color:var(--p-sub); }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
