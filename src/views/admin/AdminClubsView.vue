<template>
  <div class="admin-clubs">
    <!-- Toolbar -->
    <div class="admin-toolbar">
      <input v-model="search" class="p-input filter-input" placeholder="🔍 Rechercher…" @input="debouncedLoad" />
      <select v-model="filterRegion" class="p-input p-select" @change="load">
        <option value="">Toutes régions</option>
        <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
      </select>
      <label class="toggle-label"><input type="checkbox" v-model="onlyActif" @change="load" /> Actifs</label>
      <label class="toggle-label"><input type="checkbox" v-model="onlyUniversitaire" @change="load" /> Universitaires</label>
      <button class="p-btn-red" @click="openModal(null)">+ Ajouter club</button>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>
    <table v-else class="p-table">
      <thead><tr><th>Club</th><th>Région</th><th>Ville</th><th>Universitaire</th><th>Actif</th><th>Actions</th></tr></thead>
      <tbody>
        <tr v-for="c in clubs" :key="c.id">
          <td style="font-weight:600">{{ c.nom }} <span class="text-sub">({{ c.acronyme }})</span></td>
          <td>{{ c.region }}</td>
          <td>{{ c.ville }}</td>
          <td>
            <button class="toggle-btn" :class="{on:c.universitaire}" @click="toggleUniversitaire(c)">{{ c.universitaire ? '✓' : '○' }}</button>
          </td>
          <td>
            <button class="toggle-btn" :class="{on:c.actif}" @click="toggleActif(c)">{{ c.actif ? '✓' : '○' }}</button>
          </td>
          <td class="actions-cell">
            <button class="p-btn-ghost p-btn-sm" @click="openModal(c)">Éditer</button>
            <button class="p-btn-ghost p-btn-sm btn-danger" @click="deleteClub(c)">Suppr.</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal ajout/édition -->
    <Teleport to="body">
      <div v-if="modal" class="modal-backdrop" @click.self="modal=null">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="font-display">{{ editing?.id ? 'Modifier club' : 'Ajouter club' }}</h3>
            <button @click="modal=null">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="field"><label class="p-label">Nom *</label><input v-model="editing.nom" class="p-input" /></div>
              <div class="field"><label class="p-label">Acronyme *</label><input v-model="editing.acronyme" class="p-input" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Région *</label>
                <select v-model="editing.region" class="p-input p-select">
                  <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>
              <div class="field"><label class="p-label">Ville *</label><input v-model="editing.ville" class="p-input" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Gymnase</label><input v-model="editing.gymnase" class="p-input" /></div>
              <div class="field"><label class="p-label">Couleur principale</label><input v-model="editing.couleur_principale" class="p-input" placeholder="Ex: #FF0000" /></div>
            </div>
            <div class="form-row">
              <label class="toggle-label" style="gap:8px"><input type="checkbox" v-model="editing.actif" /> Club actif</label>
              <label class="toggle-label" style="gap:8px"><input type="checkbox" v-model="editing.universitaire" /> Club universitaire</label>
            </div>
            <div v-if="saveError" class="save-error">{{ saveError }}</div>
          </div>
          <div class="modal-footer">
            <button class="p-btn-ghost" @click="modal=null">Annuler</button>
            <button class="p-btn-red" :disabled="saving" @click="saveClub">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const clubs = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const filterRegion = ref('')
const onlyActif = ref(true)
const onlyUniversitaire = ref(false)
const modal = ref(false)
const editing = ref<any>({})
const saving = ref(false)
const saveError = ref('')

const regions = [
  'Centre', 'Littoral', 'Ouest', 'Nord-Ouest', 'Sud-Ouest', 'Nord', 'Extrême-Nord', 'Est', 'Sud', 'Adamaoua'
]

async function load() {
  loading.value = true
  let q = supabase.from('clubs').select('id,nom,acronyme,region,ville,gymnase,couleur_principale,universitaire,actif').order('nom')
  if (search.value) q = q.ilike('nom', `%${search.value}%`)
  if (filterRegion.value) q = q.eq('region', filterRegion.value)
  if (onlyActif.value) q = q.eq('actif', true)
  if (onlyUniversitaire.value) q = q.eq('universitaire', true)
  const { data } = await q.limit(100)
  clubs.value = data??[]; loading.value = false
}

let timer: ReturnType<typeof setTimeout>
function debouncedLoad() { clearTimeout(timer); timer=setTimeout(load,350) }

function openModal(c: any) {
  editing.value = c ? { ...c } : { nom:'',acronyme:'',region:'Centre',ville:'',gymnase:'',couleur_principale:'',actif:true,universitaire:false }
  modal.value = true; saveError.value = ''
}

async function saveClub() {
  if (!editing.value.nom || !editing.value.acronyme || !editing.value.region || !editing.value.ville) { saveError.value='Nom, acronyme, région et ville requis'; return }
  saving.value = true; saveError.value = ''
  const { id, ...data } = editing.value
  if (id) { await supabase.from('clubs').update(data).eq('id', id) }
  else     { await supabase.from('clubs').insert(data) }
  saving.value = false; modal.value = false; load()
}

async function toggleActif(c:any) { await supabase.from('clubs').update({actif:!c.actif}).eq('id',c.id); c.actif=!c.actif }
async function toggleUniversitaire(c:any)  { await supabase.from('clubs').update({universitaire:!c.universitaire}).eq('id',c.id); c.universitaire=!c.universitaire }
async function deleteClub(c:any)   { if(!confirm(`Supprimer ${c.nom} ?`)) return; await supabase.from('clubs').delete().eq('id',c.id); load() }

onMounted(load)
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
.modal-box { background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--radius-lg);width:100%;max-width:560px;max-height:90vh;overflow-y:auto; }
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
