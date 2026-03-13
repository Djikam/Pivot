<template>
  <div class="admin-transferts">
    <!-- Toolbar -->
    <div class="admin-toolbar">
      <input v-model="search" class="p-input filter-input" placeholder="🔍 Rechercher joueur…" @input="debouncedLoad" />
      <select v-model="filterFiabilite" class="p-input p-select" @change="load">
        <option value="">Toutes fiabilités</option>
        <option value="4">Confirmé</option>
        <option value="3">Officieux</option>
        <option value="2">Rumeur</option>
        <option value="1">Suspicion</option>
      </select>
      <select v-model="filterType" class="p-input p-select" @change="load">
        <option value="">Tous types</option>
        <option value="transfert">Transfert</option>
        <option value="pret">Prêt</option>
        <option value="fin_contrat">Fin contrat</option>
        <option value="suspension">Suspension</option>
      </select>
      <button class="p-btn-red" @click="openModal(null)">+ Ajouter transfert</button>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>
    <table v-else class="p-table">
      <thead><tr><th>Joueur</th><th>Origine</th><th>Destination</th><th>Type</th><th>Fiabilité</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>
        <tr v-for="t in transferts" :key="t.id">
          <td style="font-weight:600">{{ t.joueur?.prenom }} {{ t.joueur?.nom }}</td>
          <td>{{ t.club_origine?.nom || '—' }}</td>
          <td>{{ t.club_destination?.nom || '—' }}</td>
          <td><span class="poste-badge">{{ typeLabel(t.type) }}</span></td>
          <td><span class="fiabilite-badge" :class="'fiab-' + t.fiabilite">{{ fiabiliteLabel(t.fiabilite) }}</span></td>
          <td class="text-sub">{{ t.date_transfert ? new Date(t.date_transfert).toLocaleDateString('fr-FR') : '—' }}</td>
          <td class="actions-cell">
            <button class="p-btn-ghost p-btn-sm" @click="openModal(t)">Éditer</button>
            <button class="p-btn-ghost p-btn-sm btn-danger" @click="deleteTransfert(t)">Suppr.</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal ajout/édition -->
    <Teleport to="body">
      <div v-if="modal" class="modal-backdrop" @click.self="modal=null">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="font-display">{{ editing?.id ? 'Modifier transfert' : 'Ajouter transfert' }}</h3>
            <button @click="modal=null">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="field"><label class="p-label">Joueur *</label>
                <select v-model="editing.joueur_id" class="p-input p-select">
                  <option value="">— Sélectionner joueur —</option>
                  <option v-for="j in joueurs" :key="j.id" :value="j.id">{{ j.prenom }} {{ j.nom }}</option>
                </select>
              </div>
              <div class="field"><label class="p-label">Type *</label>
                <select v-model="editing.type" class="p-input p-select">
                  <option value="transfert">Transfert</option>
                  <option value="pret">Prêt</option>
                  <option value="fin_contrat">Fin contrat</option>
                  <option value="suspension">Suspension</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Club origine</label>
                <select v-model="editing.club_origine_id" class="p-input p-select">
                  <option value="">— Aucun —</option>
                  <option v-for="c in clubs" :key="c.id" :value="c.id">{{ c.nom }}</option>
                </select>
              </div>
              <div class="field"><label class="p-label">Club destination</label>
                <select v-model="editing.club_destination_id" class="p-input p-select">
                  <option value="">— Aucun —</option>
                  <option v-for="c in clubs" :key="c.id" :value="c.id">{{ c.nom }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Date transfert</label><input v-model="editing.date_transfert" type="date" class="p-input" /></div>
              <div class="field"><label class="p-label">Fiabilité *</label>
                <select v-model.number="editing.fiabilite" class="p-input p-select">
                  <option value="4">Confirmé</option>
                  <option value="3">Officieux</option>
                  <option value="2">Rumeur</option>
                  <option value="1">Suspicion</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Motif</label><input v-model="editing.motif" class="p-input" /></div>
              <div class="field"><label class="p-label">Source</label><input v-model="editing.source" class="p-input" /></div>
            </div>
            <div v-if="saveError" class="save-error">{{ saveError }}</div>
          </div>
          <div class="modal-footer">
            <button class="p-btn-ghost" @click="modal=null">Annuler</button>
            <button class="p-btn-red" :disabled="saving" @click="saveTransfert">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const transferts = ref<any[]>([])
const joueurs = ref<any[]>([])
const clubs = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const filterFiabilite = ref('')
const filterType = ref('')
const modal = ref(false)
const editing = ref<any>({})
const saving = ref(false)
const saveError = ref('')

const typeLabel = (t:string) => ({transfert:'Transfert',pret:'Prêt',fin_contrat:'Fin contrat',suspension:'Suspension'})[t]??t
const fiabiliteLabel = (f:number) => ['','Suspicion','Rumeur','Officieux','Confirmé'][f]??f

async function load() {
  loading.value = true
  let q = supabase.from('transferts').select(`
    id,joueur_id,club_origine_id,club_destination_id,date_transfert,fiabilite,type,motif,source,
    joueur:joueurs(prenom,nom),
    club_origine:clubs!transferts_club_origine_id_fkey(nom),
    club_destination:clubs!transferts_club_destination_id_fkey(nom)
  `).order('created_at', { ascending: false })
  if (search.value) q = q.ilike('joueur.prenom', `%${search.value}%`).or(`joueur.nom.ilike.%${search.value}%`)
  if (filterFiabilite.value) q = q.eq('fiabilite', filterFiabilite.value)
  if (filterType.value) q = q.eq('type', filterType.value)
  const { data } = await q.limit(100)
  transferts.value = data??[]; loading.value = false
}

let timer: ReturnType<typeof setTimeout>
function debouncedLoad() { clearTimeout(timer); timer=setTimeout(load,350) }

async function loadJoueursClubs() {
  const [joueursRes, clubsRes] = await Promise.all([
    supabase.from('joueurs').select('id,prenom,nom').order('nom').limit(500),
    supabase.from('clubs').select('id,nom').eq('actif', true).order('nom').limit(200)
  ])
  joueurs.value = joueursRes.data ?? []
  clubs.value = clubsRes.data ?? []
}

function openModal(t: any) {
  editing.value = t ? { ...t } : { joueur_id:'',type:'transfert',fiabilite:1,motif:'',source:'' }
  modal.value = true; saveError.value = ''
}

async function saveTransfert() {
  if (!editing.value.joueur_id || !editing.value.type || !editing.value.fiabilite) { saveError.value='Joueur, type et fiabilité requis'; return }
  saving.value = true; saveError.value = ''
  const { id, joueur, club_origine, club_destination, ...data } = editing.value
  if (id) { await supabase.from('transferts').update(data).eq('id', id) }
  else     { await supabase.from('transferts').insert(data) }
  saving.value = false; modal.value = false; load()
}

async function deleteTransfert(t:any)   { if(!confirm(`Supprimer le transfert de ${t.joueur?.prenom} ${t.joueur?.nom} ?`)) return; await supabase.from('transferts').delete().eq('id',t.id); load() }

onMounted(async () => {
  await loadJoueursClubs()
  load()
})
</script>

<style scoped>
.admin-toolbar { display:flex;gap:10px;align-items:center;margin-bottom:20px;flex-wrap:wrap; }
.filter-input { flex:1;min-width:180px; }
.toggle-label { display:flex;align-items:center;gap:6px;font-size:13px;color:var(--p-sub);cursor:pointer;white-space:nowrap; }
.toggle-btn { padding:4px 10px;border-radius:6px;border:1px solid var(--p-border);font-size:13px;cursor:pointer;background:transparent;color:var(--p-sub);transition:all 150ms; }
.toggle-btn.on { color:var(--p-green);border-color:var(--p-green);background:rgba(59,170,106,.1); }
.actions-cell { display:flex;gap:6px; }
.btn-danger { color:var(--p-red) !important; }
.poste-badge { padding:2px 7px;border-radius:99px;background:rgba(140,21,37,.1);color:var(--p-red);font-size:11px;font-weight:600; }
.fiabilite-badge { padding:2px 7px;border-radius:99px;font-size:11px;font-weight:600; }
.fiabilite-badge.fiabilite-4 { background:rgba(59,170,106,.1);color:var(--p-green); }
.fiabilite-badge.fiabilite-3 { background:rgba(196,146,42,.1);color:var(--p-gold); }
.fiabilite-badge.fiabilite-2 { background:rgba(58,128,190,.1);color:var(--p-blue); }
.fiabilite-badge.fiabilite-1 { background:rgba(140,21,37,.1);color:var(--p-red); }
.loading-state { display:flex;justify-content:center;padding:60px 0; }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
.modal-backdrop { position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:200;padding:20px; }
.modal-box { background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--radius-lg);width:100%;max-width:700px;max-height:90vh;overflow-y:auto; }
.modal-header { display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--p-border); }
.modal-header h3 { font-size:1.2rem;font-weight:700; }
.modal-header button { color:var(--p-sub);font-size:18px; }
.modal-body { padding:20px 24px;display:flex;flex-direction:column;gap:14px; }
.form-row { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
.field { display:flex;flex-direction:column;gap:6px; }
.modal-footer { display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid var(--p-border); }
.save-error { padding:10px;border-radius:8px;background:rgba(140,21,37,.1);color:var(--p-red);font-size:13px; }
@media (max-width:600px) { .form-row{grid-template-columns:1fr;} }
</style>
