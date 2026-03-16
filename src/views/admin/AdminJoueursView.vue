<template>
  <div class="admin-joueurs">
    <!-- Toolbar -->
    <div class="admin-toolbar">
      <input v-model="search" class="p-input filter-input" placeholder="🔍 Rechercher…" @input="debouncedLoad" />
      <select v-model="filterPoste" class="p-input p-select" @change="applyFilters">
        <option value="">Tous postes</option>
        <option v-for="p in postes" :key="p.value" :value="p.value">{{ p.label }}</option>
      </select>
      <label class="toggle-label"><input type="checkbox" v-model="onlyTalent" @change="applyFilters" /> Talents</label>
      <label class="toggle-label"><input type="checkbox" v-model="onlyVerifie" @change="applyFilters" /> Vérifiés</label>
      <button class="p-btn-red" @click="openModal(null)">+ Ajouter joueur</button>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>
    <table v-else class="p-table">
      <thead><tr><th>Joueur</th><th>Poste</th><th>Score IA</th><th>Vérifié</th><th>Talent</th><th>Actions</th></tr></thead>
      <tbody>
        <tr v-for="j in joueurs" :key="j.id">
          <td style="font-weight:600">{{ j.prenom }} {{ j.nom }}</td>
          <td><span class="poste-badge">{{ posteLabel(j.poste_principal) }}</span></td>
          <td><span class="font-display" style="font-weight:700" :style="{color:scoreColor(j.score_ia)}">{{ j.score_ia }}</span></td>
          <td>
            <button class="toggle-btn" :class="{on:j.verifie}" @click="toggleVerifie(j)">{{ j.verifie ? '✓' : '○' }}</button>
          </td>
          <td>
            <button class="toggle-btn" :class="{gold:j.badge_talent}" @click="toggleTalent(j)">{{ j.badge_talent ? '⭐' : '☆' }}</button>
          </td>
          <td class="actions-cell">
            <button class="p-btn-ghost p-btn-sm" @click="openModal(j)">Éditer</button>
            <button class="p-btn-ghost p-btn-sm btn-danger" @click="deleteJoueur(j)">Suppr.</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination" v-if="!loading && total > limit">
      <button class="p-btn-ghost p-btn-sm" :disabled="page === 0" @click="prevPage">← Précédent</button>
      <span class="text-sub">Page {{ page + 1 }} / {{ Math.ceil(total / limit) }}</span>
      <button class="p-btn-ghost p-btn-sm" :disabled="(page + 1) * limit >= total" @click="nextPage">Suivant →</button>
    </div>

    <!-- Modal ajout/édition -->
    <Teleport to="body">
      <div v-if="modal" class="modal-backdrop" @click.self="modal=null">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="font-display">{{ editing?.id ? 'Modifier joueur' : 'Ajouter joueur' }}</h3>
            <button @click="modal=null">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="field"><label class="p-label">Prénom *</label><input v-model="editing.prenom" class="p-input" /></div>
              <div class="field"><label class="p-label">Nom *</label><input v-model="editing.nom" class="p-input" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Poste principal *</label>
                <select v-model="editing.poste_principal" class="p-input p-select">
                  <option v-for="p in postes" :key="p.value" :value="p.value">{{ p.label }}</option>
                </select>
              </div>
              <div class="field"><label class="p-label">Poste secondaire</label>
                <select v-model="editing.poste_secondaire" class="p-input p-select">
                  <option value="">—</option>
                  <option v-for="p in postes" :key="p.value" :value="p.value">{{ p.label }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Club</label>
                <div class="club-select">
                  <select v-model="editing.club_id" class="p-input p-select">
                    <option value="">— Aucun club —</option>
                    <option v-for="c in clubs" :key="c.id" :value="c.id">{{ c.nom }} ({{ c.ville }})</option>
                  </select>
                  <button type="button" class="p-btn-ghost p-btn-sm" @click="openClubModal" title="Créer nouveau club">+</button>
                </div>
              </div>
              <div class="field"><label class="p-label">Saison</label><input v-model="editing.saison" class="p-input" placeholder="Ex: 2025-2026" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Nationalité</label><input v-model="editing.nationalite" class="p-input" placeholder="Camerounais" /></div>
              <div class="field"><label class="p-label">Genre</label>
                <select v-model="editing.genre" class="p-input p-select">
                  <option value="masculin">Masculin</option>
                  <option value="feminin">Féminin</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Taille (cm)</label><input v-model.number="editing.taille_estimee" type="number" class="p-input" /></div>
              <div class="field"><label class="p-label">Poids (kg)</label><input v-model.number="editing.poids" type="number" class="p-input" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Date naissance (approx.)</label><input v-model="editing.date_naissance_approx" type="date" class="p-input" /></div>
              <div class="field"><label class="p-label">Bras fort</label>
                <select v-model="editing.bras_fort" class="p-input p-select">
                  <option value="droitier">Droitier</option>
                  <option value="gaucher">Gaucher</option>
                  <option value="ambidextre">Ambidextre</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <label class="toggle-label" style="gap:8px"><input type="checkbox" v-model="editing.statut_univ" /> Joueur universitaire</label>
              <label class="toggle-label" style="gap:8px"><input type="checkbox" v-model="editing.verifie" /> Profil vérifié</label>
              <label class="toggle-label" style="gap:8px"><input type="checkbox" v-model="editing.badge_talent" /> Badge Talent</label>
            </div>
            <div v-if="saveError" class="save-error">{{ saveError }}</div>
          </div>
          <div class="modal-footer">
            <button class="p-btn-ghost" @click="modal=null">Annuler</button>
            <button class="p-btn-red" :disabled="saving" @click="saveJoueur">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal création club -->
    <Teleport to="body">
      <div v-if="modalClub" class="modal-backdrop" @click.self="modalClub=null">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="font-display">Créer nouveau club</h3>
            <button @click="modalClub=null">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="field"><label class="p-label">Nom *</label><input v-model="editingClub.nom" class="p-input" /></div>
              <div class="field"><label class="p-label">Ville *</label><input v-model="editingClub.ville" class="p-input" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Région</label><input v-model="editingClub.region" class="p-input" /></div>
              <div class="field"><label class="p-label">Gymnase</label><input v-model="editingClub.gymnase" class="p-input" /></div>
            </div>
            <div class="form-row">
              <label class="toggle-label" style="gap:8px"><input type="checkbox" v-model="editingClub.actif" /> Club actif</label>
              <label class="toggle-label" style="gap:8px"><input type="checkbox" v-model="editingClub.universitaire" /> Club universitaire</label>
            </div>
            <div v-if="saveError" class="save-error">{{ saveError }}</div>
          </div>
          <div class="modal-footer">
            <button class="p-btn-ghost" @click="modalClub=null">Annuler</button>
            <button class="p-btn-red" :disabled="saving" @click="saveClub">{{ saving ? 'Création…' : 'Créer' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const joueurs = ref<any[]>([])
const clubs = ref<any[]>([])
const loading = ref(true)
const total = ref(0)
const page = ref(0)
const limit = 24
const search = ref('')
const filterPoste = ref('')
const onlyTalent = ref(false)
const onlyVerifie = ref(false)
const modal = ref(false)
const modalClub = ref(false)
const editing = ref<any>({})
const editingClub = ref<any>({})
const saving = ref(false)
const saveError = ref('')

const postes = [
  {value:'gardien',label:'Gardien'},{value:'ailier_g',label:'Ailier Gauche'},{value:'ailier_d',label:'Ailier Droit'},
  {value:'arriere_g',label:'Arrière Gauche'},{value:'arriere_d',label:'Arrière Droit'},{value:'demi_centre',label:'Demi-Centre'},{value:'pivot',label:'Pivot'},
]
const posteLabel = (p:string) => postes.find(x=>x.value===p)?.label??p
const scoreColor = (s:number) => s>=80?'#3BAA6A':s>=60?'#C4922A':'#3A80BE'

async function load() {
  loading.value = true
  let q = supabase
    .from('joueurs')
    .select('id,prenom,nom,poste_principal,score_ia,verifie,badge_talent,bras_fort,poste_secondaire,taille_estimee,statut_univ', { count: 'exact' })
    .order('nom')
    .range(page.value * limit, (page.value + 1) * limit - 1)

  if (search.value) q = q.ilike('nom', `%${search.value}%`)
  if (filterPoste.value) q = q.eq('poste_principal', filterPoste.value)
  if (onlyTalent.value) q = q.eq('badge_talent', true)
  if (onlyVerifie.value) q = q.eq('verifie', true)

  const { data, count } = await q
  joueurs.value = data ?? []
  total.value = count ?? 0
  loading.value = false
}

let timer: ReturnType<typeof setTimeout>
function debouncedLoad() { clearTimeout(timer); timer=setTimeout(() => { page.value = 0; load() }, 350) }

function applyFilters() {
  page.value = 0
  load()
}

function resetFilters() {
  search.value = ''
  filterPoste.value = ''
  onlyTalent.value = false
  onlyVerifie.value = false
  page.value = 0
  load()
}

function prevPage() {
  if (page.value > 0) {
    page.value--
    load()
  }
}

function nextPage() {
  if ((page.value + 1) * limit < total.value) {
    page.value++
    load()
  }
}

function openModal(j: any) {
  editing.value = j ? { ...j } : {
    prenom:'', nom:'', poste_principal:'gardien', bras_fort:'droitier',
    verifie:false, badge_talent:false, statut_univ:false,
    nationalite:'Camerounais', genre:'masculin',
    club_id:'', saison:'2025-2026'
  }
  modal.value = true; saveError.value = ''
}

async function saveJoueur() {
  if (!editing.value.prenom || !editing.value.nom) { saveError.value='Prénom et nom requis'; return }
  saving.value = true; saveError.value = ''

  // Séparer les champs joueur des champs licence
  const { id, club_id, saison, ...joueurData } = editing.value
  // Supprimer les champs non-joueur potentiellement copiés depuis la liste
  delete joueurData.licences_saison

  let joueurId = id
  if (id) {
    await supabase.from('joueurs').update(joueurData).eq('id', id)
  } else {
    const { data: newJ } = await supabase.from('joueurs').insert(joueurData).select('id').single()
    joueurId = newJ?.id
  }

  // Créer/mettre à jour la licence si club + saison fournis
  if (joueurId && club_id && saison) {
    await supabase.from('licences_saison').upsert(
      { joueur_id: joueurId, club_id, saison, actif: true },
      { onConflict: 'joueur_id,saison' }
    )
  }

  saving.value = false; modal.value = false; load()
}

async function loadClubs() {
  const { data } = await supabase.from('clubs').select('id,nom,ville').order('nom').limit(1000)
  clubs.value = data ?? []
}

function openClubModal() {
  editingClub.value = { nom:'',ville:'',region:'',gymnase:'',actif:true,universitaire:false }
  modalClub.value = true
}

async function saveClub() {
  if (!editingClub.value.nom || !editingClub.value.ville) { saveError.value='Nom et ville requis'; return }
  saving.value = true; saveError.value = ''
  const { data } = await supabase.from('clubs').insert(editingClub.value).select('id,nom,ville').single()
  clubs.value.push(data)
  editing.value.club_id = data.id
  saving.value = false; modalClub.value = false
}

onMounted(async () => {
  await loadClubs()
  load()
})
</script>

<style scoped>
.admin-toolbar { display:flex;gap:10px;align-items:center;margin-bottom:20px;flex-wrap:wrap; }
.filter-input { flex:1;min-width:180px; }
.toggle-label { display:flex;align-items:center;gap:6px;font-size:13px;color:var(--p-sub);cursor:pointer;white-space:nowrap; }
.toggle-btn { padding:4px 10px;border-radius:6px;border:1px solid var(--p-border);font-size:13px;cursor:pointer;background:transparent;color:var(--p-sub);transition:all 150ms; }
.toggle-btn.on { color:var(--p-green);border-color:var(--p-green);background:rgba(59,170,106,.1); }
.toggle-btn.gold { color:var(--p-gold);border-color:var(--p-gold); }
.actions-cell { display:flex;gap:6px; }
.btn-danger { color:var(--p-red) !important; }
.poste-badge { padding:2px 7px;border-radius:99px;background:rgba(140,21,37,.1);color:var(--p-red);font-size:11px;font-weight:600; }
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
.loading-state { display:flex;justify-content:center;padding:60px 0; }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
.club-select { display:flex;gap:6px; }
.club-select select { flex:1; }
.club-select button { padding:0 8px;border-radius:6px;border:1px solid var(--p-border);background:transparent;color:var(--p-sub);cursor:pointer; }
.pagination { display:flex;justify-content:center;align-items:center;gap:18px;margin-top:20px; }
</style>
