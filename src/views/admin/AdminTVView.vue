<template>
  <div>
    <div class="admin-toolbar">
      <h2 class="font-display" style="font-size:1.4rem;color:var(--p-gold)">HBall237 TV — Gestion vidéos</h2>
      <button class="p-btn-red" @click="openModal(null)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ajouter une vidéo
      </button>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner"/></div>
    <div v-else class="table-wrap">
      <table class="p-table">
        <thead><tr><th>Miniature</th><th>Titre</th><th>Catégorie</th><th>En direct</th><th>Vues</th><th>Publié</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="v in videos" :key="v.id">
            <td>
              <img :src="`https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`" :alt="v.titre" style="width:80px;height:45px;object-fit:cover;border-radius:4px;" loading="lazy"/>
            </td>
            <td style="font-weight:600;max-width:260px"><p class="truncate-2" style="font-size:13px">{{ v.titre }}</p></td>
            <td><span class="p-badge p-badge-muted" style="font-size:10px">{{ v.categorie }}</span></td>
            <td>
              <span v-if="v.en_direct" class="p-badge p-badge-live" style="font-size:10px">
                <span class="live-dot"/>LIVE
              </span>
              <span v-else class="text-sub" style="font-size:12px">—</span>
            </td>
            <td class="text-sub">{{ v.vues ?? 0 }}</td>
            <td class="text-sub">{{ new Date(v.publie_le).toLocaleDateString('fr-FR') }}</td>
            <td class="actions-cell">
              <a :href="`https://youtu.be/${v.youtube_id}`" target="_blank" class="p-btn-ghost p-btn-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
              <button class="p-btn-ghost p-btn-sm" @click="openModal(v)">Éditer</button>
              <button class="p-btn-ghost p-btn-sm btn-danger" @click="deleteVideo(v)">Suppr.</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="modal" class="modal-backdrop" @click.self="modal=false">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="font-display">{{ editing?.id ? 'Modifier' : 'Ajouter' }} une vidéo</h3>
            <button class="modal-close" @click="modal=false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="field"><label class="p-label">ID YouTube *</label>
              <input v-model="editing.youtube_id" class="p-input" placeholder="Ex: dQw4w9WgXcQ (partie après youtu.be/)" />
              <span class="field-hint">URL: youtube.com/watch?v=<strong>ID</strong> ou youtu.be/<strong>ID</strong></span>
            </div>
            <div v-if="editing.youtube_id" class="thumb-preview">
              <img :src="`https://img.youtube.com/vi/${editing.youtube_id}/mqdefault.jpg`" alt="Miniature"/>
            </div>
            <div class="field"><label class="p-label">Titre *</label><input v-model="editing.titre" class="p-input" /></div>
            <div class="field"><label class="p-label">Description</label><textarea v-model="editing.description" class="p-input" rows="3"/></div>
            <div class="field"><label class="p-label">Catégorie</label>
              <select v-model="editing.categorie" class="p-input p-select">
                <option v-for="c in cats" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="field"><label class="p-label">Date de publication</label><input v-model="editing.publie_le" type="datetime-local" class="p-input"/></div>
            <label class="toggle-label" style="gap:8px">
              <input type="checkbox" v-model="editing.en_direct"/>
              Match/événement en direct
            </label>
            <div v-if="saveError" class="error-msg">{{ saveError }}</div>
          </div>
          <div class="modal-footer">
            <button class="p-btn-ghost" @click="modal=false">Annuler</button>
            <button class="p-btn-red" :disabled="saving || !editing.youtube_id || !editing.titre" @click="save">
              {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const videos = ref<any[]>([])
const loading = ref(true)
const modal = ref(false)
const saving = ref(false)
const saveError = ref('')
const editing = ref<any>({})

const cats = ['Highlight','Match','Replay','Interview','Formation','National','Autre']

async function load() {
  loading.value = true
  const { data } = await supabase.from('tv_videos').select('*').order('publie_le', { ascending: false }).limit(200)
  videos.value = data ?? []
  loading.value = false
}

function openModal(v: any) {
  editing.value = v ? { ...v } : {
    youtube_id:'', titre:'', description:'', categorie:'Highlight',
    publie_le: new Date().toISOString().slice(0,16), en_direct: false, vues: 0
  }
  saveError.value = ''
  modal.value = true
}

async function save() {
  if (!editing.value.youtube_id || !editing.value.titre) return
  saving.value = true; saveError.value = ''
  const { id, ...data } = editing.value
  const { error } = id
    ? await supabase.from('tv_videos').update(data).eq('id', id)
    : await supabase.from('tv_videos').insert(data)
  if (error) { saveError.value = error.message; saving.value = false; return }
  modal.value = false; saving.value = false
  await load()
}

async function deleteVideo(v: any) {
  if (!confirm(`Supprimer "${v.titre}" ?`)) return
  await supabase.from('tv_videos').delete().eq('id', v.id)
  videos.value = videos.value.filter(x => x.id !== v.id)
}

onMounted(load)
</script>

<style scoped>
.admin-toolbar { display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;gap:12px;flex-wrap:wrap; }
.table-wrap { overflow-x:auto; }
.actions-cell { display:flex;gap:6px;align-items:center; }
.btn-danger { color:var(--p-red) !important; }
.live-dot { width:6px;height:6px;border-radius:50%;background:var(--p-green-bright);animation:pulseG 1.6s ease-in-out infinite;display:inline-block; }
@keyframes pulseG { 0%,100%{opacity:1}50%{opacity:.3} }

.modal-backdrop { position:fixed;inset:0;z-index:300;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:20px; }
.modal-box { width:100%;max-width:560px;background:var(--p-card);border-radius:var(--radius-xl);border:1px solid var(--p-border); }
.modal-header { display:flex;align-items:center;justify-content:space-between;padding:20px 24px 16px;border-bottom:1px solid var(--p-border); }
.modal-header h3 { font-size:1.2rem; }
.modal-close { width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:6px;border:1px solid var(--p-border);color:var(--p-sub); }
.modal-body { padding:20px 24px;display:flex;flex-direction:column;gap:14px;max-height:65vh;overflow-y:auto; }
.modal-footer { padding:16px 24px;border-top:1px solid var(--p-border);display:flex;justify-content:flex-end;gap:10px; }
.field { display:flex;flex-direction:column;gap:6px; }
.field-hint { font-size:11px;color:var(--p-muted); }
.error-msg { color:var(--p-red);font-size:13px;padding:8px 12px;background:var(--p-red-soft);border-radius:var(--radius-md); }
.toggle-label { display:flex;align-items:center;gap:8px;font-size:13px;color:var(--p-sub); }
.thumb-preview img { width:100%;max-height:140px;object-fit:cover;border-radius:var(--radius-md);border:1px solid var(--p-border); }

.modal-enter-active,.modal-leave-active { transition:opacity 180ms; }
.modal-enter-from,.modal-leave-to { opacity:0; }
</style>
