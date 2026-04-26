<template>
  <div class="admin-staff">
    <div class="admin-toolbar">
      <input v-model="search" class="p-input filter-input" placeholder=" Rechercher staff…" @input="debouncedLoad" />
      <select v-model="filterClub" class="p-input p-select" @change="load">
        <option value="">Tous les clubs</option>
        <option v-for="c in clubs" :key="c.id" :value="c.id">{{ c.nom }}</option>
      </select>
      <select v-model="filterType" class="p-input p-select" @change="load">
        <option value="">Tous types</option>
        <option value="COACH">Coach</option>
        <option value="PRESIDENT">Président</option>
      </select>
      <button class="p-btn-red" @click="openModal(null)">+ Ajouter staff</button>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>
    <table v-else class="p-table">
      <thead>
        <tr><th>Nom</th><th>Rôle</th><th>Club / Équipe</th><th>Contact</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr v-for="s in staff" :key="s.id">
          <td style="font-weight:600">{{ s.prenom }} {{ s.nom }}</td>
          <td>
            <span class="p-badge" :class="s.type_staff === 'COACH' ? 'p-badge-blue' : 'p-badge-gold'">
              {{ s.type_staff === 'COACH' ? 'Coach' : 'Président' }}
            </span>
          </td>
          <td class="text-sub">
            {{ s.equipe_nationale?.nom ?? s.club?.nom ?? '—' }}
            <span v-if="s.saison" class="p-badge p-badge-muted" style="font-size:10px;margin-left:4px">{{ s.saison }}</span>
          </td>
          <td class="text-sub" style="font-size:12px">{{ s.email ?? s.telephone ?? '—' }}</td>
          <td class="actions-cell">
            <button class="p-btn-ghost p-btn-sm" @click="openModal(s)">Éditer</button>
            <button class="p-btn-ghost p-btn-sm btn-danger" @click="deleteStaff(s)">Suppr.</button>
          </td>
        </tr>
        <tr v-if="!loading && staff.length === 0">
          <td colspan="5" class="text-sub" style="text-align:center;padding:32px">Aucun staff trouvé.</td>
        </tr>
      </tbody>
    </table>

    <Teleport to="body">
      <div v-if="modal" class="modal-backdrop" @click.self="modal=false">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="font-display">{{ editing.id ? 'Modifier' : 'Ajouter' }} staff</h3>
            <button @click="modal=false"></button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="field"><label class="p-label">Prénom *</label><input v-model="editing.prenom" class="p-input" /></div>
              <div class="field"><label class="p-label">Nom *</label><input v-model="editing.nom" class="p-input" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Rôle *</label>
                <select v-model="editing.type_staff" class="p-input p-select">
                  <option value="COACH">Coach</option>
                  <option value="PRESIDENT">Président</option>
                </select>
              </div>
              <div class="field"><label class="p-label">Saison</label>
                <input v-model="editing.saison" class="p-input" placeholder="2025-2026" />
              </div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Club</label>
                <select v-model="editing.club_id" class="p-input p-select">
                  <option value="">— Aucun club —</option>
                  <option v-for="c in clubs" :key="c.id" :value="c.id">{{ c.nom }}</option>
                </select>
              </div>
              <div class="field"><label class="p-label">Équipe nationale</label>
                <select v-model="editing.equipe_nationale_id" class="p-input p-select">
                  <option value="">— Aucune —</option>
                  <option v-for="e in equipes" :key="e.id" :value="e.id">{{ e.nom }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Email</label><input v-model="editing.email" class="p-input" type="email" /></div>
              <div class="field"><label class="p-label">Téléphone</label><input v-model="editing.telephone" class="p-input" /></div>
            </div>
            <div class="field" style="margin-bottom:12px">
              <label class="p-label">Détails (diplômes, expériences…)</label>
              <textarea v-model="editingDetailsText" class="p-input" rows="2" style="resize:vertical" placeholder='{"diplome":"Licence IHF","experience":"5 ans D1"}'></textarea>
            </div>
            <div v-if="saveError" class="save-error">{{ saveError }}</div>
          </div>
          <div class="modal-footer">
            <button class="p-btn-ghost" @click="modal=false">Annuler</button>
            <button class="p-btn-red" :disabled="saving" @click="saveStaff">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const route = useRoute()
const staff   = ref<any[]>([])
const clubs   = ref<any[]>([])
const equipes = ref<any[]>([])
const loading = ref(true)
const modal   = ref(false)
const saving  = ref(false)
const saveError = ref('')
const search  = ref('')
const filterClub = ref('')
const filterType = ref('')
const editing = ref<any>({})
const editingDetailsText = ref('')

async function load() {
  loading.value = true
  let q = supabase.from('staff_club')
    .select('*, club:clubs(id,nom), equipe_nationale:equipes_nationales(id,nom)')
    .order('nom')
  if (search.value) q = q.or(`nom.ilike.%${search.value}%,prenom.ilike.%${search.value}%`)
  if (filterClub.value) q = q.eq('club_id', filterClub.value)
  if (filterType.value) q = q.eq('type_staff', filterType.value)
  // Filtrer par équipe nationale si paramètre URL
  const equipeParam = route.query.equipe as string
  if (equipeParam) q = q.eq('equipe_nationale_id', equipeParam)
  const { data } = await q
  staff.value = data ?? []
  loading.value = false
}

let timer: ReturnType<typeof setTimeout>
function debouncedLoad() { clearTimeout(timer); timer = setTimeout(() => { load() }, 350) }

function openModal(s: any) {
  editing.value = s ? { ...s } : {
    prenom:'', nom:'', type_staff:'COACH', club_id:'', equipe_nationale_id:'',
    email:'', telephone:'', saison:'2025-2026', details_techniques: null
  }
  editingDetailsText.value = s?.details_techniques ? JSON.stringify(s.details_techniques, null, 2) : ''
  saveError.value = ''
  modal.value = true
}

async function saveStaff() {
  if (!editing.value.prenom || !editing.value.nom) { saveError.value = 'Prénom et nom requis'; return }
  saving.value = true; saveError.value = ''

  let details = null
  if (editingDetailsText.value.trim()) {
    try { details = JSON.parse(editingDetailsText.value) } catch { details = { note: editingDetailsText.value } }
  }

  const { id, club, equipe_nationale, ...data } = editing.value
  data.details_techniques = details
  if (!data.club_id) data.club_id = null
  if (!data.equipe_nationale_id) data.equipe_nationale_id = null

  if (id) { await supabase.from('staff_club').update(data).eq('id', id) }
  else    { await supabase.from('staff_club').insert(data) }

  saving.value = false; modal.value = false; load()
}

async function deleteStaff(s: any) {
  if (!confirm(`Supprimer ${s.prenom} ${s.nom} ?`)) return
  await supabase.from('staff_club').delete().eq('id', s.id)
  load()
}

onMounted(async () => {
  const [{ data: c }, { data: e }] = await Promise.all([
    supabase.from('clubs').select('id,nom').eq('actif', true).order('nom'),
    supabase.from('equipes_nationales').select('id,nom').order('nom'),
  ])
  clubs.value = c ?? []
  equipes.value = e ?? []
  load()
})
</script>

<style scoped>
.admin-toolbar { display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap }
.filter-input { flex:1;min-width:160px }
.actions-cell { display:flex;gap:6px }
.btn-danger { color:var(--p-red) }
.loading-state { display:flex;justify-content:center;padding:60px 0 }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite }
@keyframes spin { to{transform:rotate(360deg)} }
.modal-backdrop { position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:1000 }
.modal-box { background:var(--p-card);border:1px solid var(--p-border);border-radius:12px;width:min(580px,95vw);max-height:90vh;overflow-y:auto }
.modal-header { display:flex;justify-content:space-between;align-items:center;padding:16px 24px;border-bottom:1px solid var(--p-border) }
.modal-body { padding:20px 24px;display:flex;flex-direction:column;gap:12px }
.modal-footer { display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid var(--p-border) }
.form-row { display:grid;grid-template-columns:1fr 1fr;gap:12px }
.field { display:flex;flex-direction:column;gap:4px }
.save-error { padding:10px;border-radius:8px;background:rgba(140,21,37,.1);color:var(--p-red);font-size:13px }
</style>
