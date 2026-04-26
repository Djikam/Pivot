<template>
  <div class="admin-distinctions">
    <!-- Toolbar -->
    <div class="admin-toolbar">
      <input v-model="search" class="p-input filter-input" placeholder=" Rechercher joueur/club…" @input="debouncedLoad" />
      <select v-model="filterSaison" class="p-input p-select" @change="load">
        <option value="">Toutes saisons</option>
        <option v-for="s in saisons" :key="s" :value="s">{{ s }}</option>
      </select>
      <select v-model="filterType" class="p-input p-select" @change="load">
        <option value="">Tous types</option>
        <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
      </select>
      <button class="p-btn-red" @click="openModal(null)">+ Ajouter distinction</button>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>
    <table v-else class="p-table">
      <thead><tr><th>Distinction</th><th>Joueur/Club</th><th>Type</th><th>Saison</th><th>Période</th><th>Actions</th></tr></thead>
      <tbody>
        <tr v-for="d in distinctions" :key="d.id">
          <td style="font-weight:600">{{ d.type }}</td>
          <td>{{ d.joueur ? `${d.joueur.prenom} ${d.joueur.nom}` : d.club?.nom || '—' }}</td>
          <td>{{ d.type }}</td>
          <td>{{ d.saison }}</td>
          <td>{{ d.periode || '—' }}</td>
          <td class="actions-cell">
            <button class="p-btn-ghost p-btn-sm" @click="openModal(d)">Éditer</button>
            <button class="p-btn-ghost p-btn-sm btn-danger" @click="deleteDistinction(d)">Suppr.</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal ajout/édition -->
    <Teleport to="body">
      <div v-if="modal" class="modal-backdrop" @click.self="modal=null">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="font-display">{{ editing?.id ? 'Modifier distinction' : 'Ajouter distinction' }}</h3>
            <button @click="modal=null"></button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="field"><label class="p-label">Type *</label><input v-model="editing.type" class="p-input" placeholder="ex: MVP, Meilleur buteur" /></div>
              <div class="field"><label class="p-label">Saison *</label><input v-model="editing.saison" class="p-input" placeholder="2025-2026" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Période</label><input v-model="editing.periode" class="p-input" placeholder="ex: Finale, Saison régulière" /></div>
              <div class="field"><label class="p-label">Compétition</label>
                <select v-model="editing.competition_id" class="p-input p-select">
                  <option value="">— Aucune —</option>
                  <option v-for="c in competitions" :key="c.id" :value="c.id">{{ c.nom }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Joueur</label>
                <select v-model="editing.joueur_id" class="p-input p-select">
                  <option value="">— Aucun —</option>
                  <option v-for="j in joueurs" :key="j.id" :value="j.id">{{ j.prenom }} {{ j.nom }}</option>
                </select>
              </div>
              <div class="field"><label class="p-label">Club</label>
                <select v-model="editing.club_id" class="p-input p-select">
                  <option value="">— Aucun —</option>
                  <option v-for="c in clubs" :key="c.id" :value="c.id">{{ c.nom }}</option>
                </select>
              </div>
            </div>
            <div v-if="saveError" class="save-error">{{ saveError }}</div>
          </div>
          <div class="modal-footer">
            <button class="p-btn-ghost" @click="modal=null">Annuler</button>
            <button class="p-btn-red" :disabled="saving" @click="saveDistinction">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const distinctions = ref<any[]>([])
const joueurs = ref<any[]>([])
const clubs = ref<any[]>([])
const competitions = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const filterSaison = ref('')
const filterType = ref('')
const modal = ref(false)
const editing = ref<any>({})
const saving = ref(false)
const saveError = ref('')

const saisons = ['2024-2025', '2025-2026', '2026-2027']
const types = ['MVP', 'Meilleur buteur', 'Meilleur passeur', 'Meilleur gardien', 'Révélation', 'Joueur de l\'année', 'Équipe de l\'année']

async function load() {
  loading.value = true
  try {
    let q = supabase.from('distinctions').select(`
      id,joueur_id,club_id,type,saison,competition_id,periode,
      joueur:joueurs(prenom,nom),
      club:clubs(nom)
    `).order('saison', { ascending: false })
    if (search.value) q = q.or(`joueur.prenom.ilike.%${search.value}%,joueur.nom.ilike.%${search.value}%,club.nom.ilike.%${search.value}%`)
    if (filterSaison.value) q = q.eq('saison', filterSaison.value)
    if (filterType.value) q = q.eq('type', filterType.value)
    const { data } = await q.limit(100)
    distinctions.value = data??[]
  } catch (error) {
    console.error('Erreur lors du chargement des distinctions:', error)
  } finally {
    loading.value = false
  }
}

let timer: ReturnType<typeof setTimeout>
function debouncedLoad() { clearTimeout(timer); timer=setTimeout(load,350) }

async function loadData() {
  const [joueursRes, clubsRes, compRes] = await Promise.all([
    supabase.from('joueurs').select('id,prenom,nom').order('nom').limit(500),
    supabase.from('clubs').select('id,nom').eq('actif', true).order('nom').limit(200),
    supabase.from('competitions').select('id,nom').order('nom').limit(100)
  ])
  joueurs.value = joueursRes.data ?? []
  clubs.value = clubsRes.data ?? []
  competitions.value = compRes.data ?? []
}

function openModal(d: any) {
  editing.value = d ? { ...d } : { type:'',saison:'2025-2026',periode:'' }
  modal.value = true; saveError.value = ''
}

async function saveDistinction() {
  if (!editing.value.type || !editing.value.saison) { saveError.value='Type et saison requis'; return }
  if (!editing.value.joueur_id && !editing.value.club_id) { saveError.value='Joueur ou club requis'; return }
  saving.value = true; saveError.value = ''
  try {
    const { id, joueur, club, ...data } = editing.value
    if (id) { await supabase.from('distinctions').update(data).eq('id', id) }
    else     { await supabase.from('distinctions').insert(data) }
    modal.value = false; load()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    saveError.value = 'Erreur lors de la sauvegarde'
  } finally {
    saving.value = false
  }
}

async function deleteDistinction(d:any) {
  if(!confirm(`Supprimer la distinction "${d.type}" ?`)) return
  try {
    await supabase.from('distinctions').delete().eq('id',d.id)
    load()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

onMounted(async () => {
  await loadData()
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
