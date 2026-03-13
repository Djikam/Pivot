<template>
  <div class="admin-docs">
    <div class="admin-toolbar">
      <input v-model="search" class="p-input filter-input" placeholder="🔍 Rechercher…" @input="debouncedLoad" />
      <select v-model="filterCat" class="p-input p-select" @change="load">
        <option value="">Toutes catégories</option>
        <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.icon }} {{ c.label }}</option>
      </select>
      <button class="p-btn-red" @click="openModal(null)">+ Ajouter document</button>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>
    <table v-else class="p-table">
      <thead><tr><th>Titre</th><th>Catégorie</th><th>Format</th><th>Version</th><th>Date</th><th>Actif</th><th>Actions</th></tr></thead>
      <tbody>
        <tr v-for="d in docs" :key="d.id">
          <td style="font-weight:600;max-width:250px">{{ d.titre }}</td>
          <td>{{ catLabel(d.categorie) }}</td>
          <td><span class="p-badge" :class="formatBadge(d.format)">{{ d.format.toUpperCase() }}</span></td>
          <td class="text-sub">{{ d.version }}</td>
          <td class="text-sub" style="font-size:12px">{{ formatDate(d.publie_le) }}</td>
          <td>
            <button class="toggle-btn" :class="{on:d.actif}" @click="toggleActif(d)">{{ d.actif?'✓':'○' }}</button>
          </td>
          <td class="actions-cell">
            <a :href="d.fichier_url" target="_blank" class="p-btn-ghost p-btn-sm">↓ Voir</a>
            <button class="p-btn-ghost p-btn-sm" @click="openModal(d)">Éditer</button>
            <button class="p-btn-ghost p-btn-sm btn-danger" @click="deleteDoc(d)">Suppr.</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="modal" class="modal-backdrop" @click.self="modal=false">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="font-display">{{ editing?.id ? 'Modifier document' : 'Ajouter document' }}</h3>
            <button @click="modal=false">✕</button>
          </div>
          <div class="modal-body">
            <div class="field"><label class="p-label">Titre *</label><input v-model="editing.titre" class="p-input" /></div>
            <div class="field"><label class="p-label">Description</label><textarea v-model="editing.description" class="p-input" rows="2" /></div>
            <div class="form-row">
              <div class="field"><label class="p-label">Catégorie *</label>
                <select v-model="editing.categorie" class="p-input p-select">
                  <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.icon }} {{ c.label }}</option>
                </select>
              </div>
              <div class="field"><label class="p-label">Format *</label>
                <select v-model="editing.format" class="p-input p-select">
                  <option value="pdf">PDF</option><option value="xlsx">XLSX</option><option value="csv">CSV</option><option value="html">HTML</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Version</label><input v-model="editing.version" class="p-input" placeholder="v1.0" /></div>
              <div class="field"><label class="p-label">Date de publication</label><input v-model="editing.publie_le" type="date" class="p-input" /></div>
            </div>
            <div class="field"><label class="p-label">URL du fichier *</label><input v-model="editing.fichier_url" class="p-input" placeholder="https://… ou chemin Supabase Storage" /></div>
            <p class="text-sub" style="font-size:12px">💡 Utilise Supabase Storage ou un lien Cloudinary pour héberger le fichier, puis colle l'URL ici.</p>
          </div>
          <div class="modal-footer">
            <button class="p-btn-ghost" @click="modal=false">Annuler</button>
            <button class="p-btn-red" :disabled="saving" @click="saveDoc">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const docs = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const filterCat = ref('')
const modal = ref(false)
const editing = ref<any>({})
const saving = ref(false)

const categories = [
  { value:'regles',       label:'Règles du jeu',  icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>' },
  { value:'droits_joueur',label:'Droits joueurs',  icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>' },
  { value:'droits_club',  label:'Droits clubs',    icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>' },
  { value:'arbitrage',    label:'Arbitrage',       icon:'<svg class="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/></svg>' },
  { value:'officiel',     label:'Docs officiels',  icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>' },
  { value:'pedagogue',    label:'Pédagogie',       icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>' },
]
const catLabel = (c:string) => categories.find(x=>x.value===c)?.label??c
const formatBadge = (f:string) => ({ pdf:'p-badge-red', xlsx:'p-badge-green', csv:'p-badge-blue', html:'p-badge-gold' }[f]??'p-badge-muted')
const formatDate = (d:string) => new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})

async function load() {
  loading.value = true
  let q = supabase.from('documents_education').select('*').order('publie_le',{ascending:false})
  if (search.value) q = q.ilike('titre', `%${search.value}%`)
  if (filterCat.value) q = q.eq('categorie', filterCat.value)
  const { data } = await q; docs.value=data??[]; loading.value=false
}

let timer: ReturnType<typeof setTimeout>
function debouncedLoad() { clearTimeout(timer); timer=setTimeout(load,350) }

function openModal(d:any) {
  editing.value = d ? { ...d } : { titre:'',categorie:'regles',format:'pdf',version:'v1.0',fichier_url:'',actif:true,publie_le:new Date().toISOString().slice(0,10) }
  modal.value = true
}

async function saveDoc() {
  if (!editing.value.titre || !editing.value.fichier_url) return
  saving.value = true
  const { id, ...data } = editing.value
  if (id) { await supabase.from('documents_education').update({...data,updated_at:new Date().toISOString()}).eq('id',id) }
  else     { await supabase.from('documents_education').insert(data) }
  saving.value=false; modal.value=false; load()
}

async function toggleActif(d:any) { await supabase.from('documents_education').update({actif:!d.actif,updated_at:new Date().toISOString()}).eq('id',d.id); d.actif=!d.actif }
async function deleteDoc(d:any)   { if(!confirm(`Supprimer "${d.titre}" ?`)) return; await supabase.from('documents_education').delete().eq('id',d.id); load() }

onMounted(load)
</script>

<style scoped>
.admin-toolbar { display:flex;gap:10px;align-items:center;margin-bottom:20px;flex-wrap:wrap; }
.filter-input { flex:1;min-width:200px; }
.toggle-btn { padding:4px 10px;border-radius:6px;border:1px solid var(--p-border);font-size:13px;cursor:pointer;background:transparent;color:var(--p-sub);transition:all 150ms; }
.toggle-btn.on { color:var(--p-green);border-color:var(--p-green); }
.actions-cell { display:flex;gap:6px; }
.btn-danger { color:var(--p-red) !important; }
.modal-backdrop { position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:200;padding:20px; }
.modal-box { background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--radius-lg);width:100%;max-width:540px;max-height:90vh;overflow-y:auto; }
.modal-header { display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--p-border); }
.modal-body { padding:20px 24px;display:flex;flex-direction:column;gap:14px; }
.form-row { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
.field { display:flex;flex-direction:column;gap:6px; }
.modal-footer { display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid var(--p-border); }
.loading-state { display:flex;justify-content:center;padding:60px 0; }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
