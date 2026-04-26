<template>
  <div class="admin-docs">
    <div class="admin-toolbar">
      <input v-model="search" class="p-input filter-input" placeholder=" Rechercher…" @input="debouncedLoad" />
      <select v-model="filterCat" class="p-input p-select" @change="load">
        <option value="">Toutes catégories</option>
        <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.icon }} {{ c.label }}</option>
      </select>
      <button class="p-btn-red" @click="openModal(null)">+ Ajouter document</button>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner"></div></div>
    <table v-else class="p-table">
      <thead><tr><th>Titre</th><th>Catégorie</th><th>Format</th><th>Version</th><th>Date</th><th>Actif</th><th>Actions</th></tr></thead>
      <tbody>
        <tr v-for="d in docs" :key="d.id">
          <td style="font-weight:600;max-width:250px">{{ d.titre }}</td>
          <td>{{ catLabel(d.categorie) }}</td>
          <td><span class="p-badge" :class="formatBadge(d.format)">{{ formatIcon(d.format) }} {{ d.format.toUpperCase() }}</span></td>
          <td class="text-sub">{{ d.version }}</td>
          <td class="text-sub" style="font-size:12px">{{ formatDate(d.publie_le) }}</td>
          <td>
            <button class="toggle-btn" :class="{on:d.actif}" @click="toggleActif(d)">{{ d.actif?'':'○' }}</button>
          </td>
          <td class="actions-cell">
            <a :href="d.fichier_url" target="_blank" class="p-btn-ghost p-btn-sm"> Voir</a>
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
            <button @click="modal=false"></button>
          </div>
          <div class="modal-body">
            <div class="field"><label class="p-label">Titre *</label><input v-model="editing.titre" class="p-input" /></div>
            <div class="field"><label class="p-label">Description</label><textarea v-model="editing.description" class="p-input" rows="2"></textarea></div>
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
            <div class="field">
              <label class="p-label">Fichier *</label>
              <div
                class="file-dropzone"
                :class="{ 'drag-over': isDragOver }"
                @dragover.prevent="isDragOver = true"
                @dragleave.prevent="isDragOver = false"
                @drop.prevent="onDrop"
                @click="fileInputRef?.click()"
              >
                <input
                  ref="fileInputRef"
                  type="file"
                  class="file-input"
                  @change="onFileSelected"
                  accept=".pdf,.docx,.xlsx,.csv,.jpg,.jpeg,.png,.html"
                />

                <div v-if="selectedFileName" class="file-info">
                  <span class="file-icon">{{ formatIcon(editing.format) }}</span>
                  <span class="file-name">{{ selectedFileName }}</span>
                  <span class="file-format">({{ editing.format?.toUpperCase() }})</span>
                </div>

                <div v-else class="file-prompt">
                  Glissez-déposez un fichier ici, ou cliquez pour sélectionner
                </div>
              </div>

              <div v-if="uploading" class="text-sub" style="font-size:12px">Téléchargement en cours…</div>
              <div v-if="uploadError" class="text-error" style="font-size:12px">{{ uploadError }}</div>
            </div>
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
  { value:'regles',       label:'Règles du jeu',    icon:'' },
  { value:'droits_joueur',label:'Droits joueur',    icon:'️' },
  { value:'droits_club',  label:'Droits club',      icon:'' },
  { value:'arbitrage',    label:'Arbitrage',        icon:'' },
  { value:'officiel',     label:'Officiel',         icon:'' },
  { value:'pedagogue',    label:'Pédagogie',        icon:'' },
]

const catLabel    = (v:string) => categories.find(c => c.value === v)?.label ?? v
const formatIcon  = (f:string) => ({ pdf:'', xlsx:'', csv:'', html:'', docx:'' }[f] ?? '')
const formatBadge = (f:string) => ({ pdf:'p-badge-red', xlsx:'p-badge-green', csv:'p-badge-blue', html:'p-badge-gold' }[f] ?? 'p-badge-muted')
const formatDate  = (d:string) => d ? new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }) : '—'

const bucketName = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? 'documents'
const uploading = ref(false)
const uploadError = ref('')
const selectedFileName = ref('')
const isDragOver = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const allowedExtensions = ['pdf','docx','xlsx','csv','jpg','jpeg','png','html']
const maxFileSize = 15 * 1024 * 1024 // 15 Mo

const detectFormat = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return allowedExtensions.includes(ext) ? (ext === 'jpeg' ? 'jpg' : ext) : 'pdf'
}

function storagePathFromUrl(url?: string) {
  if (!url) return null
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/').filter(Boolean)
    const publicIndex = parts.indexOf('public')
    if (publicIndex >= 0 && parts.length > publicIndex + 2) {
      return parts.slice(publicIndex + 2).join('/')
    }
    return null
  } catch {
    return null
  }
}

async function uploadFile(file: File) {
  if (!file) return
  uploadError.value = ''
  if (file.size > maxFileSize) {
    uploadError.value = `Fichier trop volumineux (max ${Math.round(maxFileSize / 1024 / 1024)} Mo)`
    return
  }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!allowedExtensions.includes(ext)) {
    uploadError.value = `Format non supporté (${ext}).`
    return
  }

  uploading.value = true
  try {
    const path = `documents/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage.from(bucketName).upload(path, file, { upsert: true })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from(bucketName).getPublicUrl(path)
    editing.value.fichier_url = data.publicUrl
    editing.value.format = detectFormat(file.name)
    selectedFileName.value = file.name
  } catch (err: any) {
    uploadError.value = err.message ?? 'Échec du téléchargement'
  } finally {
    uploading.value = false
  }
}

function openModal(d:any) {
  uploadError.value = ''
  isDragOver.value = false
  if (fileInputRef.value) fileInputRef.value.value = ''
  editing.value = d ? { ...d } : { titre:'',categorie:'regles',format:'pdf',version:'v1.0',fichier_url:'',actif:true,publie_le:new Date().toISOString().slice(0,10) }
  selectedFileName.value = d?.fichier_url ? d.fichier_url.split('/').pop() ?? '' : ''
  modal.value = true
}

async function saveDoc() {
  if (!editing.value.titre || !editing.value.fichier_url) {
    uploadError.value = 'Le titre et le fichier sont requis.'
    return
  }

  saving.value = true
  try {
    const { id, ...data } = editing.value
    const payload = {
      ...data,
      format: data.format ?? detectFormat(data.fichier_url ?? ''),
      updated_at: new Date().toISOString(),
    }

    if (id) {
      await supabase.from('documents_education').update(payload).eq('id', id)
    } else {
      await supabase.from('documents_education').insert(payload)
    }

    modal.value = false
    load()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    uploadError.value = 'Erreur lors de la sauvegarde. Veuillez réessayer.'
  } finally {
    saving.value = false
  }
}

async function toggleActif(d:any) { 
  try {
    await supabase.from('documents_education').update({actif:!d.actif,updated_at:new Date().toISOString()}).eq('id',d.id)
    d.actif = !d.actif
  } catch (error) {
    console.error('Erreur lors du toggle actif:', error)
  }
}

async function deleteDoc(d:any) {
  if (!confirm(`Supprimer "${d.titre}" ?`)) return
  try {
    const path = storagePathFromUrl(d.fichier_url)
    if (path) {
      await supabase.storage.from(bucketName).remove([path])
    }
    await supabase.from('documents_education').delete().eq('id',d.id)
    load()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

function onDrop(event: DragEvent) {
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  uploadFile(file)
}

function onFileSelected(event: Event) {
  isDragOver.value = false
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploadFile(file)
}

let timer: ReturnType<typeof setTimeout>
function debouncedLoad() { clearTimeout(timer); timer=setTimeout(load,350) }

async function load() {
  loading.value = true
  try {
    let q = supabase.from('documents_education').select('*').order('publie_le', { ascending: false })
    if (search.value) q = q.ilike('titre', `%${search.value}%`)
    if (filterCat.value) q = q.eq('categorie', filterCat.value)
    const { data } = await q
    docs.value = data ?? []
  } catch (error) {
    console.error('Erreur lors du chargement des documents:', error)
  } finally {
    loading.value = false
  }
}

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
  .file-dropzone { border:2px dashed var(--p-border);border-radius:12px;padding:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;min-height:90px;transition:background 150ms,border-color 150ms;background:var(--p-surface); }
  .file-dropzone.drag-over { background:rgba(0,0,0,.06);border-color:var(--p-blue); }
  .file-input { display:none; }
  .file-prompt { color:var(--p-sub);font-size:13px;text-align:center; }
  .file-info { display:flex;gap:8px;align-items:center; }
  .file-name { font-weight:600; }
</style>
