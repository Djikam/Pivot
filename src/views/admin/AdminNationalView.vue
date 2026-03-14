<template>
  <div class="admin-national">
    <!-- Toolbar -->
    <div class="admin-toolbar">
      <input v-model="search" class="p-input filter-input" placeholder="🔍 Rechercher équipe…" @input="debouncedLoad" />
      <select v-model="filterCategorie" class="p-input p-select" @change="load">
        <option value="">Toutes catégories</option>
        <option value="senior">Senior</option>
        <option value="u20">U20</option>
        <option value="u17">U17</option>
        <option value="beach">Beach</option>
      </select>
      <select v-model="filterGenre" class="p-input p-select" @change="load">
        <option value="">Tous genres</option>
        <option value="masculin">Masculin</option>
        <option value="feminin">Féminin</option>
        <option value="mixte">Mixte</option>
      </select>
      <button class="p-btn-red" @click="openModalEquipe(null)">+ Créer équipe</button>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>
    <div v-else class="equipes-grouped">
      <div v-for="saison in saisons" :key="saison" class="saison-section">
        <h2 class="saison-title font-display">{{ saison }}</h2>
        <div v-for="categorie in categories" :key="`${saison}-${categorie}`" class="categorie-section">
          <h3 class="categorie-title">{{ categorieLabel(categorie) }}</h3>
          <div class="equipes-grid">
            <div v-for="e in getEquipesBySaisonCategorie(saison, categorie)" :key="e.id" class="equipe-card p-card">
              <div class="equipe-header">
                <h3 class="equipe-nom font-display">{{ e.nom }}</h3>
                <div class="equipe-badges">
                  <span class="p-badge p-badge-muted">{{ genreLabel(e.genre) }}</span>
                </div>
              </div>
              <div class="equipe-info">
                <p class="text-sub" v-if="e.selectionneur">Sélectionneur: {{ e.selectionneur }}</p>
                <p class="text-sub">Sélection: {{ getSelectionCount(e.id) }} joueurs</p>
              </div>
              <div class="equipe-actions">
                <button class="p-btn-ghost p-btn-sm" @click="openModalEquipe(e)">Éditer</button>
                <button class="p-btn-ghost p-btn-sm" @click="manageSelection(e)">Gérer sélection</button>
                <button class="p-btn-ghost p-btn-sm btn-danger" @click="deleteEquipe(e)">Suppr.</button>
              </div>
            </div>
          </div>
          <div v-if="getEquipesBySaisonCategorie(saison, categorie).length === 0" class="empty-categorie">
            <p class="text-sub">Aucune équipe dans cette catégorie</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal équipe -->
    <Teleport to="body">
      <div v-if="modalEquipe" class="modal-backdrop" @click.self="modalEquipe=null">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="font-display">{{ editingEquipe?.id ? 'Modifier équipe' : 'Créer équipe' }}</h3>
            <button @click="modalEquipe=null">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="field"><label class="p-label">Nom *</label><input v-model="editingEquipe.nom" class="p-input" /></div>
              <div class="field"><label class="p-label">Catégorie *</label>
                <select v-model="editingEquipe.categorie" class="p-input p-select">
                  <option value="senior">Senior</option>
                  <option value="u20">U20</option>
                  <option value="u17">U17</option>
                  <option value="beach">Beach</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Genre *</label>
                <select v-model="editingEquipe.genre" class="p-input p-select">
                  <option value="masculin">Masculin</option>
                  <option value="feminin">Féminin</option>
                  <option value="mixte">Mixte</option>
                </select>
              </div>
              <div class="field"><label class="p-label">Saison active *</label><input v-model="editingEquipe.saison_active" class="p-input" placeholder="2025-2026" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Sélectionneur</label><input v-model="editingEquipe.selectionneur" class="p-input" /></div>
            </div>
            <div v-if="saveError" class="save-error">{{ saveError }}</div>
          </div>
          <div class="modal-footer">
            <button class="p-btn-ghost" @click="modalEquipe=null">Annuler</button>
            <button class="p-btn-red" :disabled="saving" @click="saveEquipe">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal sélection -->
    <Teleport to="body">
      <div v-if="modalSelection" class="modal-backdrop" @click.self="closeModalSelection">
        <div class="modal-box modal-large">
          <div class="modal-header">
            <h3 class="font-display">Gérer sélection — {{ currentEquipe?.nom }}</h3>
            <button @click="closeModalSelection">✕</button>
          </div>
          <div class="modal-body">
            <div class="selection-toolbar">
              <input v-model="searchJoueur" class="p-input" placeholder="Rechercher joueur…" style="flex:1" />
              <select v-model="filterStatut" class="p-input p-select">
                <option value="">Tous statuts</option>
                <option value="preselectione">Pré-sélectionné</option>
                <option value="finaliste">Finaliste</option>
                <option value="titulaire">Titulaire</option>
              </select>
              <button class="p-btn-red p-btn-sm" @click="openModalJoueur(null)">+ Ajouter joueur</button>
            </div>

            <div class="selection-multi-add">
              <label class="p-label" style="margin-bottom:8px">Ajouter plusieurs joueurs</label>
              <div class="multi-add-row">
                <select v-model="newJoueurIds" class="p-input p-select" multiple>
                  <option v-for="j in availableJoueurs" :key="j.id" :value="j.id">{{ j.prenom }} {{ j.nom }}</option>
                </select>
                <button class="p-btn p-btn-sm" :disabled="!newJoueurIds.length || saving" @click="addSelectedJoueurs">Ajouter à la sélection</button>
              </div>
              <p class="text-sub" v-if="availableJoueurs.length === 0" style="margin-top:8px">Tous les joueurs disponibles sont déjà dans cette sélection.</p>
            </div>

            <div class="selection-list">
              <div v-for="s in filteredSelections" :key="s.id" class="selection-item">
                <div class="selection-info">
                  <span class="joueur-name">{{ s.joueur?.prenom }} {{ s.joueur?.nom }}</span>
                  <select v-model="s.statut" class="p-input p-select statut-select" @change="updateSelectionStatut(s)">
                    <option value="preselectione">Pré-sélectionné</option>
                    <option value="finaliste">Finaliste</option>
                    <option value="titulaire">Titulaire</option>
                  </select>
                  <span class="text-sub">{{ s.saison }}</span>
                </div>
                <div class="selection-actions">
                  <button class="p-btn-ghost p-btn-sm" @click="openModalJoueur(s)">Éditer</button>
                  <button class="p-btn-ghost p-btn-sm btn-danger" @click="removeJoueur(s)">Retirer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal joueur sélection -->
    <Teleport to="body">
      <div v-if="modalJoueur" class="modal-backdrop" @click.self="modalJoueur=null">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="font-display">{{ editingSelection?.id ? 'Modifier sélection' : 'Ajouter à la sélection' }}</h3>
            <button @click="modalJoueur=null">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="field"><label class="p-label">Joueur *</label>
                <select v-model="editingSelection.joueur_id" class="p-input p-select">
                  <option value="">— Sélectionner joueur —</option>
                  <option v-for="j in joueurs" :key="j.id" :value="j.id">{{ j.prenom }} {{ j.nom }}</option>
                </select>
              </div>
              <div class="field"><label class="p-label">Statut *</label>
                <select v-model="editingSelection.statut" class="p-input p-select">
                  <option value="preselectione">Pré-sélectionné</option>
                  <option value="finaliste">Finaliste</option>
                  <option value="titulaire">Titulaire</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Saison *</label><input v-model="editingSelection.saison" class="p-input" placeholder="2025-2026" /></div>
              <div class="field"><label class="p-label">Date d'appel</label><input v-model="editingSelection.appel_date" type="date" class="p-input" /></div>
            </div>
            <div v-if="saveError" class="save-error">{{ saveError }}</div>
          </div>
          <div class="modal-footer">
            <button class="p-btn-ghost" @click="modalJoueur=null">Annuler</button>
            <button class="p-btn-red" :disabled="saving" @click="saveSelection">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const equipes = ref<any[]>([])
const selections = ref<any[]>([])
const joueurs = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const filterCategorie = ref('')
const filterGenre = ref('')
const modalEquipe = ref(false)
const modalSelection = ref(false)
const modalJoueur = ref(false)
const editingEquipe = ref<any>({})
const editingSelection = ref<any>({})
const currentEquipe = ref<any>(null)
const saving = ref(false)
const saveError = ref('')
const searchJoueur = ref('')
const filterStatut = ref('')
const newJoueurIds = ref<string[]>([])

const availableJoueurs = computed(() => {
  const alreadySelected = new Set(selections.value
    .filter(s => s.equipe_nationale_id === currentEquipe.value?.id)
    .map(s => s.joueur_id))
  return joueurs.value.filter(j => !alreadySelected.has(j.id))
})

const categorieLabel = (c:string) => ({senior:'Senior',u20:'U20',u17:'U17',beach:'Beach'})[c]??c
const categorieColor = (c:string) => ({senior:'p-badge-green',u20:'p-badge-blue',u17:'p-badge-gold',beach:'p-badge-red'})[c]??'p-badge-muted'
const genreLabel = (g:string) => ({masculin:'M',feminin:'F',mixte:'Mix'})[g]??g
const statutLabel = (s:string) => ({preselectione:'Pré-sélectionné',finaliste:'Finaliste',titulaire:'Titulaire'})[s]??s
const statutColor = (s:string) => ({preselectione:'p-badge-muted',finaliste:'p-badge-gold',titulaire:'p-badge-green'})[s]??'p-badge-muted'

const saisons = computed(() => [...new Set(equipes.value.map(e => e.saison_active))].sort().reverse())
const categories = ['senior', 'u20', 'u17', 'beach']

function getEquipesBySaisonCategorie(saison: string, categorie: string) {
  return equipes.value.filter(e => e.saison_active === saison && e.categorie === categorie)
}


const getSelectionCount = (equipeId: string) => selections.value.filter(s => s.equipe_nationale_id === equipeId).length

const filteredSelections = computed(() => {
  let filtered = selections.value.filter(s => s.equipe_nationale_id === currentEquipe.value?.id)
  if (searchJoueur.value) {
    filtered = filtered.filter(s => 
      `${s.joueur?.prenom} ${s.joueur?.nom}`.toLowerCase().includes(searchJoueur.value.toLowerCase())
    )
  }
  if (filterStatut.value) {
    filtered = filtered.filter(s => s.statut === filterStatut.value)
  }
  return filtered
})

async function load() {
  loading.value = true
  let q = supabase.from('equipes_nationales').select('*').order('nom')
  if (search.value) q = q.ilike('nom', `%${search.value}%`)
  if (filterCategorie.value) q = q.eq('categorie', filterCategorie.value)
  if (filterGenre.value) q = q.eq('genre', filterGenre.value)
  const { data } = await q.limit(50)
  equipes.value = data??[]; loading.value = false
}

async function loadSelections() {
  const { data } = await supabase.from('selections_joueurs').select(`
    *, 
    joueur:joueurs(prenom,nom),
    equipe_nationale:equipes_nationales(nom)
  `).order('created_at', { ascending: false })
  selections.value = data ?? []
}

async function loadJoueurs() {
  const { data } = await supabase.from('joueurs').select('id,prenom,nom').order('nom').limit(1000)
  joueurs.value = data ?? []
}

let timer: ReturnType<typeof setTimeout>
function debouncedLoad() { clearTimeout(timer); timer=setTimeout(load,350) }

function openModalEquipe(e: any) {
  editingEquipe.value = e ? { ...e } : { nom:'',categorie:'senior',genre:'masculin',saison_active:'2025-2026',selectionneur:'' }
  modalEquipe.value = true; saveError.value = ''
}

function manageSelection(e: any) {
  currentEquipe.value = e
  modalSelection.value = true
  searchJoueur.value = ''
  filterStatut.value = ''
  newJoueurIds.value = []
}

function closeModalSelection() {
  modalSelection.value = false
  currentEquipe.value = null
  newJoueurIds.value = []
}

function openModalJoueur(s: any) {
  editingSelection.value = s ? { ...s } : { joueur_id:'',statut:'preselectione',saison:currentEquipe.value?.saison_active || '2025-2026',appel_date:'' }
  modalJoueur.value = true; saveError.value = ''
}

async function saveEquipe() {
  if (!editingEquipe.value.nom || !editingEquipe.value.categorie || !editingEquipe.value.genre || !editingEquipe.value.saison_active) { saveError.value='Nom, catégorie, genre et saison requis'; return }
  saving.value = true; saveError.value = ''
  const { id, ...data } = editingEquipe.value
  if (id) { await supabase.from('equipes_nationales').update(data).eq('id', id) }
  else     { await supabase.from('equipes_nationales').insert(data) }
  saving.value = false; modalEquipe.value = false; load()
}

async function saveSelection() {
  if (!editingSelection.value.joueur_id || !editingSelection.value.statut || !editingSelection.value.saison) { saveError.value='Joueur, statut et saison requis'; return }
  saving.value = true; saveError.value = ''
  const data = { ...editingSelection.value, equipe_nationale_id: currentEquipe.value.id }
  const { id, joueur, equipe_nationale, ...cleanData } = data
  if (id) { await supabase.from('selections_joueurs').update(cleanData).eq('id', id) }
  else     { await supabase.from('selections_joueurs').insert(cleanData) }
  saving.value = false; modalJoueur.value = false; loadSelections()
}

async function addSelectedJoueurs() {
  if (!newJoueurIds.value.length || !currentEquipe.value) return
  saving.value = true; saveError.value = ''
  const inserts = newJoueurIds.value.map(id => ({
    joueur_id: id,
    equipe_nationale_id: currentEquipe.value.id,
    statut: 'preselectione',
    saison: currentEquipe.value.saison_active
  }))
  const { error } = await supabase.from('selections_joueurs').upsert(inserts, { onConflict: ['joueur_id','equipe_nationale_id','saison'] })
  if (error) saveError.value = error.message
  await loadSelections()
  newJoueurIds.value = []
  saving.value = false
}

async function updateSelectionStatut(selection: any) {
  saving.value = true
  await supabase.from('selections_joueurs').update({ statut: selection.statut }).eq('id', selection.id)
  saving.value = false
}

async function deleteEquipe(e:any)   { if(!confirm(`Supprimer ${e.nom} ?`)) return; await supabase.from('equipes_nationales').delete().eq('id',e.id); load() }
async function removeJoueur(s:any)   { if(!confirm(`Retirer ${s.joueur?.prenom} ${s.joueur?.nom} ?`)) return; await supabase.from('selections_joueurs').delete().eq('id',s.id); loadSelections() }

onMounted(async () => {
  await Promise.all([loadJoueurs(), loadSelections()])
  load()
})
</script>

<style scoped>
.equipes-grouped { display:flex;flex-direction:column;gap:32px;margin-top:20px; }
.saison-section { border:1px solid var(--p-border);border-radius:var(--radius-lg);padding:24px;background:var(--p-bg2); }
.saison-title { font-size:1.5rem;font-weight:700;margin-bottom:24px;color:var(--p-red);border-bottom:2px solid var(--p-red);padding-bottom:8px; }
.categorie-section { margin-bottom:24px; }
.categorie-section:last-child { margin-bottom:0; }
.categorie-title { font-size:1.1rem;font-weight:600;margin-bottom:16px;color:var(--p-sub);text-transform:uppercase;letter-spacing:0.5px; }
.equipes-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-bottom:16px; }
.equipe-card { padding:20px; }
.equipe-header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px; }
.equipe-nom { font-size:1.2rem;font-weight:700;margin-bottom:4px; }
.equipe-badges { display:flex;gap:6px;flex-wrap:wrap; }
.equipe-info { margin-bottom:16px; }
.equipe-info p { margin:4px 0; }
.equipe-actions { display:flex;gap:8px;flex-wrap:wrap; }
.empty-categorie { padding:20px;text-align:center;color:var(--p-sub);font-style:italic; }

.selection-toolbar { display:flex;gap:10px;margin-bottom:16px; }
.selection-multi-add { margin-bottom:18px; }
.multi-add-row { display:flex;gap:10px;align-items:flex-start; }
.multi-add-row select { flex:1; min-height:120px; }
.selection-list { display:flex;flex-direction:column;gap:8px;max-height:400px;overflow-y:auto; }
.selection-item { display:flex;justify-content:space-between;align-items:center;padding:12px;border-radius:8px;background:var(--p-bg2); }
.selection-info { display:flex;align-items:center;gap:8px;flex:1; }
.joueur-name { font-weight:600; }
.selection-actions { display:flex;gap:6px; }
.statut-select { min-width:150px; }

.modal-large { max-width:800px; }
.btn-danger { color:var(--p-red) !important; }
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
@media (max-width:600px) { .form-row{grid-template-columns:1fr;} .equipe-header{flex-direction:column;gap:8px;} .selection-item{flex-direction:column;gap:8px;} }
</style>
