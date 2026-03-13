<template>
  <div class="admin-votes">
    <!-- Toolbar -->
    <div class="admin-toolbar">
      <input v-model="search" class="p-input filter-input" placeholder="🔍 Rechercher…" @input="debouncedLoad" />
      <select v-model="filterStatut" class="p-input p-select" @change="load">
        <option value="">Tous statuts</option>
        <option value="brouillon">Brouillon</option>
        <option value="actif">Actif</option>
        <option value="termine">Terminé</option>
      </select>
      <label class="toggle-label"><input type="checkbox" v-model="onlyPayant" @change="load" /> Payants</label>
      <button class="p-btn-red" @click="openModal(null)">+ Créer vote</button>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>
    <table v-else class="p-table">
      <thead><tr><th>Titre</th><th>Type</th><th>Statut</th><th>Prix</th><th>Dates</th><th>Actions</th></tr></thead>
      <tbody>
        <tr v-for="v in votes" :key="v.id">
          <td style="font-weight:600">{{ v.titre }}</td>
          <td>{{ v.type }}</td>
          <td><span class="statut-badge" :class="'statut-' + v.statut">{{ statutLabel(v.statut) }}</span></td>
          <td>{{ v.payant ? `${v.tarif_fcfa} FCFA` : 'Gratuit' }}</td>
          <td class="text-sub" style="font-size:12px">{{ formatDate(v.date_debut) }} → {{ formatDate(v.date_fin) }}</td>
          <td class="actions-cell">
            <button class="p-btn-ghost p-btn-sm" @click="openModal(v)">Éditer</button>
            <button class="p-btn-ghost p-btn-sm btn-danger" @click="deleteVote(v)">Suppr.</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal ajout/édition -->
    <Teleport to="body">
      <div v-if="modal" class="modal-backdrop" @click.self="modal=null">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="font-display">{{ editing?.id ? 'Modifier vote' : 'Créer vote' }}</h3>
            <button @click="modal=null">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="field"><label class="p-label">Titre *</label><input v-model="editing.titre" class="p-input" /></div>
              <div class="field"><label class="p-label">Type *</label><input v-model="editing.type" class="p-input" placeholder="ex: MVP, Homme du match" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Date début *</label><input v-model="editing.date_debut" type="datetime-local" class="p-input" /></div>
              <div class="field"><label class="p-label">Date fin *</label><input v-model="editing.date_fin" type="datetime-local" class="p-input" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Statut *</label>
                <select v-model="editing.statut" class="p-input p-select">
                  <option value="brouillon">Brouillon</option>
                  <option value="actif">Actif</option>
                  <option value="termine">Terminé</option>
                </select>
              </div>
              <div class="field"><label class="p-label">Prix (FCFA)</label><input v-model.number="editing.tarif_fcfa" type="number" class="p-input" placeholder="0 pour gratuit" /></div>
            </div>
            <div class="form-row">
              <label class="toggle-label" style="gap:8px"><input type="checkbox" v-model="editing.payant" /> Vote payant</label>
            </div>
            <div v-if="saveError" class="save-error">{{ saveError }}</div>
          </div>
          <div class="modal-footer">
            <button class="p-btn-ghost" @click="modal=null">Annuler</button>
            <button class="p-btn-red" :disabled="saving" @click="saveVote">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const votes = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const filterStatut = ref('')
const onlyPayant = ref(false)
const modal = ref(false)
const editing = ref<any>({})
const saving = ref(false)
const saveError = ref('')

const statutLabel = (s:string) => ({brouillon:'Brouillon',actif:'Actif',termine:'Terminé'})[s]??s
const formatDate = (d:string) => new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })

async function load() {
  loading.value = true
  let q = supabase.from('session_vote').select('id,titre,type,tarif_fcfa,date_debut,date_fin,statut,payant').order('created_at', { ascending: false })
  if (search.value) q = q.ilike('titre', `%${search.value}%`)
  if (filterStatut.value) q = q.eq('statut', filterStatut.value)
  if (onlyPayant.value) q = q.eq('payant', true)
  const { data } = await q.limit(100)
  votes.value = data??[]; loading.value = false
}

let timer: ReturnType<typeof setTimeout>
function debouncedLoad() { clearTimeout(timer); timer=setTimeout(load,350) }

function openModal(v: any) {
  editing.value = v ? { ...v } : { titre:'',type:'',date_debut:'',date_fin:'',statut:'brouillon',payant:false,tarif_fcfa:0 }
  modal.value = true; saveError.value = ''
}

async function saveVote() {
  if (!editing.value.titre || !editing.value.type || !editing.value.date_debut || !editing.value.date_fin || !editing.value.statut) { saveError.value='Titre, type, dates et statut requis'; return }
  saving.value = true; saveError.value = ''
  const { id, ...data } = editing.value
  if (id) { await supabase.from('session_vote').update(data).eq('id', id) }
  else     { await supabase.from('session_vote').insert(data) }
  saving.value = false; modal.value = false; load()
}

async function deleteVote(v:any)   { if(!confirm(`Supprimer "${v.titre}" ?`)) return; await supabase.from('session_vote').delete().eq('id',v.id); load() }

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
.statut-badge { padding:2px 7px;border-radius:99px;font-size:11px;font-weight:600; }
.statut-brouillon { background:rgba(160,144,168,.1);color:var(--p-sub); }
.statut-actif { background:rgba(59,170,106,.1);color:var(--p-green); }
.statut-termine { background:rgba(196,146,42,.1);color:var(--p-gold); }
.loading-state { display:flex;justify-content:center;padding:60px 0; }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
.modal-backdrop { position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:200;padding:20px; }
.modal-box { background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--radius-lg);width:100%;max-width:600px;max-height:90vh;overflow-y:auto; }
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
