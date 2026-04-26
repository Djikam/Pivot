<template>
  <div class="admin-arbitres">
    <div class="admin-toolbar">
      <input v-model="search" class="p-input filter-input" placeholder=" Rechercher arbitre…" @input="debouncedLoad" />
      <select v-model="filterNiveau" class="p-input p-select" @change="load">
        <option value="">Tous niveaux</option>
        <option value="regional">Régional</option>
        <option value="national">National</option>
        <option value="international">International</option>
      </select>
      <select v-model="filterRegion" class="p-input p-select" @change="load">
        <option value="">Toutes régions</option>
        <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
      </select>
      <button class="p-btn-red" @click="openModal(null)">+ Ajouter arbitre</button>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>
    <table v-else class="p-table">
      <thead>
        <tr><th>Arbitre</th><th>Niveau</th><th>Région</th><th>Vérifié</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr v-for="a in arbitres" :key="a.id">
          <td style="font-weight:600">{{ a.prenom }} {{ a.nom }}</td>
          <td>
            <span class="p-badge" :class="niveauBadge(a.niveau)">{{ a.niveau }}</span>
          </td>
          <td class="text-sub">{{ a.region ?? '—' }}</td>
          <td>
            <button class="toggle-btn" :class="{on:a.verifie}" @click="toggleVerifie(a)">
              {{ a.verifie ? '' : '○' }}
            </button>
          </td>
          <td class="actions-cell">
            <button class="p-btn-ghost p-btn-sm" @click="openModal(a)">Éditer</button>
            <button class="p-btn-ghost p-btn-sm btn-danger" @click="deleteArbitre(a)">Suppr.</button>
          </td>
        </tr>
        <tr v-if="!loading && arbitres.length === 0">
          <td colspan="5" class="text-sub" style="text-align:center;padding:32px">Aucun arbitre. Commencez par en ajouter un.</td>
        </tr>
      </tbody>
    </table>

    <Teleport to="body">
      <div v-if="modal" class="modal-backdrop" @click.self="modal=false">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="font-display">{{ editing.id ? 'Modifier' : 'Ajouter' }} arbitre</h3>
            <button @click="modal=false"></button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="field"><label class="p-label">Prénom *</label><input v-model="editing.prenom" class="p-input" /></div>
              <div class="field"><label class="p-label">Nom *</label><input v-model="editing.nom" class="p-input" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Niveau</label>
                <select v-model="editing.niveau" class="p-input p-select">
                  <option value="regional">Régional</option>
                  <option value="national">National</option>
                  <option value="international">International</option>
                </select>
              </div>
              <div class="field"><label class="p-label">Région</label>
                <select v-model="editing.region" class="p-input p-select">
                  <option value="">—</option>
                  <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <label class="toggle-label" style="gap:8px"><input type="checkbox" v-model="editing.verifie" /> Arbitre vérifié</label>
            </div>
            <div v-if="saveError" class="save-error">{{ saveError }}</div>
          </div>
          <div class="modal-footer">
            <button class="p-btn-ghost" @click="modal=false">Annuler</button>
            <button class="p-btn-red" :disabled="saving" @click="saveArbitre">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const arbitres    = ref<any[]>([])
const loading     = ref(true)
const modal       = ref(false)
const saving      = ref(false)
const saveError   = ref('')
const search      = ref('')
const filterNiveau = ref('')
const filterRegion = ref('')
const editing     = ref<any>({})

const regions = ['Adamaoua','Centre','Est','Extrême-Nord','Littoral','Nord','Nord-Ouest','Ouest','Sud','Sud-Ouest']
const niveauBadge = (n:string) => ({ regional:'p-badge-muted', national:'p-badge-blue', international:'p-badge-gold' }[n] ?? 'p-badge-muted')

async function load() {
  loading.value = true
  let q = supabase.from('arbitres').select('*').order('nom')
  if (search.value) q = q.or(`nom.ilike.%${search.value}%,prenom.ilike.%${search.value}%`)
  if (filterNiveau.value) q = q.eq('niveau', filterNiveau.value)
  if (filterRegion.value) q = q.eq('region', filterRegion.value)
  const { data } = await q
  arbitres.value = data ?? []
  loading.value = false
}

let timer: ReturnType<typeof setTimeout>
function debouncedLoad() { clearTimeout(timer); timer = setTimeout(load, 350) }

function openModal(a: any) {
  editing.value = a ? { ...a } : { prenom:'', nom:'', niveau:'regional', region:'', verifie:false }
  saveError.value = ''
  modal.value = true
}

async function toggleVerifie(a: any) {
  await supabase.from('arbitres').update({ verifie: !a.verifie }).eq('id', a.id)
  a.verifie = !a.verifie
}

async function saveArbitre() {
  if (!editing.value.prenom || !editing.value.nom) { saveError.value = 'Prénom et nom requis'; return }
  saving.value = true; saveError.value = ''
  const { id, ...data } = editing.value
  if (!data.region) data.region = null
  if (id) { await supabase.from('arbitres').update(data).eq('id', id) }
  else    { await supabase.from('arbitres').insert(data) }
  saving.value = false; modal.value = false; load()
}

async function deleteArbitre(a: any) {
  if (!confirm(`Supprimer l'arbitre ${a.prenom} ${a.nom} ?`)) return
  await supabase.from('arbitres').delete().eq('id', a.id)
  load()
}

onMounted(load)
</script>

<style scoped>
.admin-toolbar { display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap }
.filter-input { flex:1;min-width:160px }
.actions-cell { display:flex;gap:6px }
.btn-danger { color:var(--p-red) }
.toggle-btn { padding:2px 10px;border-radius:99px;border:1px solid var(--p-border);background:transparent;cursor:pointer;font-size:13px;color:var(--p-sub) }
.toggle-btn.on { border-color:var(--p-green);color:var(--p-green);background:rgba(59,170,106,.1) }
.loading-state { display:flex;justify-content:center;padding:60px 0 }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite }
@keyframes spin { to{transform:rotate(360deg)} }
.modal-backdrop { position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:1000 }
.modal-box { background:var(--p-card);border:1px solid var(--p-border);border-radius:12px;width:min(480px,95vw);max-height:90vh;overflow-y:auto }
.modal-header { display:flex;justify-content:space-between;align-items:center;padding:16px 24px;border-bottom:1px solid var(--p-border) }
.modal-body { padding:20px 24px;display:flex;flex-direction:column;gap:12px }
.modal-footer { display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid var(--p-border) }
.form-row { display:grid;grid-template-columns:1fr 1fr;gap:12px }
.field { display:flex;flex-direction:column;gap:4px }
.toggle-label { display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer }
.save-error { padding:10px;border-radius:8px;background:rgba(140,21,37,.1);color:var(--p-red);font-size:13px }
</style>
