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
          <td>{{ c.pays === 'Cameroun' ? c.region : c.pays }}</td>
          <td>{{ c.ville }}</td>
          <td>
            <button class="toggle-btn" :class="{on:c.universitaire}" @click="toggleUniversitaire(c)">{{ c.universitaire ? '✓' : '○' }}</button>
          </td>
          <td>
            <button class="toggle-btn" :class="{on:c.actif}" @click="toggleActif(c)">{{ c.actif ? '✓' : '○' }}</button>
          </td>
          <td class="actions-cell">
            <button class="p-btn-ghost p-btn-sm" @click="viewDetails(c)">Détails</button>
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
              <div class="field club-field">
                <label class="p-label">Nom *</label>
                <input v-model="editing.nom" class="p-input" @input="onClubInput" @focus="onClubInput" @blur="hideSuggestions" />
                <div v-if="showSuggestions" class="suggestions-list">
                  <div v-for="suggestion in clubSuggestions" :key="suggestion.id" class="suggestion-item" @click="selectClubSuggestion(suggestion)">
                    {{ suggestion.nom }} ({{ suggestion.ville }}, {{ suggestion.pays }})
                  </div>
                </div>
              </div>
              <div class="field"><label class="p-label">Acronyme *</label><input v-model="editing.acronyme" class="p-input" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Ville *</label><input v-model="editing.ville" class="p-input" /></div>
              <div class="field"><label class="p-label">Pays *</label>
                <select v-model="editing.pays" class="p-input p-select">
                  <option value="Cameroun">Cameroun</option>
                  <option value="France">France</option>
                  <option value="Espagne">Espagne</option>
                  <option value="Allemagne">Allemagne</option>
                  <option value="Italie">Italie</option>
                  <option value="Angleterre">Angleterre</option>
                  <option value="Brésil">Brésil</option>
                  <option value="Argentine">Argentine</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div v-if="isInternational()" class="field">
                <label class="p-label">Province/État</label>
                <input v-model="editing.region" class="p-input" placeholder="Ex: Île-de-France, Catalogne..." />
              </div>
              <div v-else class="field">
                <label class="p-label">Région *</label>
                <select v-model="editing.region" class="p-input p-select">
                  <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>
              <div class="field"><label class="p-label">Gymnase</label><input v-model="editing.gymnase" class="p-input" /></div>
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

    <!-- Modal détails club -->
    <Teleport to="body">
      <div v-if="modalDetails" class="modal-backdrop" @click.self="modalDetails=null">
        <div class="modal-box modal-large">
          <div class="modal-header">
            <h3 class="font-display">Détails — {{ selectedClub?.nom }}</h3>
            <button @click="modalDetails=null">✕</button>
          </div>
          <div class="modal-body">
            <div class="club-info">
              <div class="info-section">
                <h4>Staff ({{ staff.length }})</h4>
                <div v-if="staff.length" class="info-list">
                  <div v-for="s in staff" :key="s.id" class="info-item">
                    <span class="p-badge" :class="s.type_staff === 'COACH' ? 'p-badge-blue' : 'p-badge-gold'" style="font-size:10px;margin-right:6px">{{ s.type_staff }}</span>
                    {{ s.prenom }} {{ s.nom }}
                    <span v-if="s.email" class="text-sub" style="font-size:11px;margin-left:4px">· {{ s.email }}</span>
                  </div>
                </div>
                <p v-else class="text-sub">Aucun staff enregistré</p>
              </div>

              <div class="info-section">
                <h4>Joueurs ({{ joueurs.length }})</h4>
                <div v-if="joueurs.length" class="info-list">
                  <div v-for="j in joueurs" :key="j.id" class="info-item clickable" @click="viewJoueurDetails(j)">
                    {{ j.prenom }} {{ j.nom }} <span class="text-sub">({{ posteLabel(j.poste_principal) }})</span>
                  </div>
                </div>
                <p v-else class="text-sub">Aucun joueur</p>
              </div>
              
              <div class="info-section">
                <h4>Compétitions ({{ competitions.length }})</h4>
                <div v-if="competitions.length" class="info-list">
                  <div v-for="comp in competitions" :key="comp.id" class="info-item">
                    {{ comp.nom }} <span class="text-sub">({{ comp.type }}, {{ comp.saison }})</span>
                  </div>
                </div>
                <p v-else class="text-sub">Aucune compétition</p>
              </div>
              
              <div class="info-section">
                <h4>Transferts récents ({{ transferts.length }})</h4>
                <div v-if="transferts.length" class="info-list">
                  <div v-for="t in transferts" :key="t.id" class="info-item">
                    {{ t.type }} <span class="text-sub">({{ formatDate(t.date_transfert) }})</span>
                  </div>
                </div>
                <p v-else class="text-sub">Aucun transfert</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal détails joueur -->
    <Teleport to="body">
      <div v-if="modalJoueur" class="modal-backdrop" @click.self="modalJoueur=null">
        <div class="modal-box modal-large">
          <div class="modal-header">
            <h3 class="font-display">Détails — {{ selectedJoueur?.prenom }} {{ selectedJoueur?.nom }}</h3>
            <button @click="modalJoueur=null">✕</button>
          </div>
          <div class="modal-body" v-if="selectedJoueur">
            <div class="joueur-info">
              <div class="info-section">
                <h4>Informations générales</h4>
                <div class="info-grid">
                  <div><strong>Poste principal:</strong> {{ posteLabel(selectedJoueur.poste_principal) }}</div>
                  <div v-if="selectedJoueur.poste_secondaire"><strong>Poste secondaire:</strong> {{ posteLabel(selectedJoueur.poste_secondaire) }}</div>
                  <div><strong>Bras fort:</strong> {{ selectedJoueur.bras_fort }}</div>
                  <div v-if="selectedJoueur.taille_estimee"><strong>Taille estimée:</strong> {{ selectedJoueur.taille_estimee }} cm</div>
                  <div v-if="selectedJoueur.date_naissance_approx"><strong>Date naissance approx:</strong> {{ formatDate(selectedJoueur.date_naissance_approx) }}</div>
                  <div><strong>Statut universitaire:</strong> {{ selectedJoueur.statut_univ ? 'Oui' : 'Non' }}</div>
                  <div><strong>Vérifié:</strong> {{ selectedJoueur.verifie ? 'Oui' : 'Non' }}</div>
                  <div><strong>Badge Talent:</strong> {{ selectedJoueur.badge_talent ? 'Oui' : 'Non' }}</div>
                  <div><strong>Score IA:</strong> {{ selectedJoueur.score_ia }}</div>
                </div>
              </div>
              
              <div class="info-section">
                <h4>Licences saisonnières</h4>
                <div v-if="licencesJoueur.length" class="info-list">
                  <div v-for="l in licencesJoueur" :key="l.id" class="info-item">
                    Saison {{ l.saison }} - {{ l.club?.nom }} ({{ l.type_licence }})
                    <span v-if="l.numero_maillot" class="text-sub">Maillot #{{ l.numero_maillot }}</span>
                  </div>
                </div>
                <p v-else class="text-sub">Aucune licence</p>
              </div>
              
              <div class="info-section">
                <h4>Distinctions</h4>
                <div v-if="distinctionsJoueur.length" class="info-list">
                  <div v-for="d in distinctionsJoueur" :key="d.id" class="info-item">
                    {{ d.type }} ({{ d.saison }})
                  </div>
                </div>
                <p v-else class="text-sub">Aucune distinction</p>
              </div>
            </div>
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
const allClubs = ref<any[]>([]) // Pour l'autocomplete
const joueurs     = ref<any[]>([])
const staff       = ref<any[]>([])
const competitions = ref<any[]>([])
const transferts  = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const filterRegion = ref('')
const onlyActif = ref(true)
const onlyUniversitaire = ref(false)
const modal = ref<boolean | null>(null)
const modalDetails = ref<boolean | null>(null)
const modalJoueur = ref<boolean | null>(null)
const selectedClub = ref<any>(null)
const selectedJoueur = ref<any>(null)
const licencesJoueur = ref<any[]>([])
const distinctionsJoueur = ref<any[]>([])
const editing = ref<any>({})
const saving = ref(false)
const saveError = ref('')
const clubSuggestions = ref<any[]>([])
const showSuggestions = ref(false)

const regions = [
  'Centre', 'Littoral', 'Ouest', 'Nord-Ouest', 'Sud-Ouest', 'Nord', 'Extrême-Nord', 'Est', 'Sud', 'Adamaoua'
]

const postes = [
  {value:'gardien',label:'Gardien'},{value:'ailier_g',label:'Ailier G'},{value:'ailier_d',label:'Ailier D'},
  {value:'arriere_g',label:'Arrière G'},{value:'arriere_d',label:'Arrière D'},{value:'demi_centre',label:'Demi-Centre'},{value:'pivot',label:'Pivot'},
]
const posteLabel = (p:string) => postes.find(x=>x.value===p)?.label??p
const formatDate = (d:string) => new Date(d).toLocaleDateString('fr-FR')

async function load() {
  loading.value = true
  let q = supabase.from('clubs').select('id,nom,acronyme,region,ville,gymnase,couleur_principale,universitaire,actif,pays').order('nom')
  if (search.value) q = q.ilike('nom', `%${search.value}%`)
  if (filterRegion.value) q = q.eq('region', filterRegion.value)
  if (onlyActif.value) q = q.eq('actif', true)
  if (onlyUniversitaire.value) q = q.eq('universitaire', true)
  const { data } = await q.limit(100)
  clubs.value = data??[]; loading.value = false
}

let timer: ReturnType<typeof setTimeout>
function debouncedLoad() { clearTimeout(timer); timer=setTimeout(load,350) }

async function viewDetails(c: any) {
  selectedClub.value = c
  modalDetails.value = true

  const [joueursRes, compsRes, transfertsRes, staffRes] = await Promise.all([
    supabase.from('licences_saison')
      .select('joueur:joueurs(id,prenom,nom,poste_principal,poste_secondaire,bras_fort,taille_estimee,statut_univ,verifie,badge_talent,score_ia)')
      .eq('club_id', c.id).eq('saison', '2025-2026').eq('actif', true),
    supabase.from('participation_competitions')
      .select('competition:competitions(id,nom,type,saison)')
      .eq('club_id', c.id),
    supabase.from('transferts')
      .select('id,type,date_transfert')
      .or(`club_origine_id.eq.${c.id},club_destination_id.eq.${c.id}`)
      .order('date_transfert', { ascending: false }).limit(10),
    supabase.from('staff_club')
      .select('id,prenom,nom,type_staff,email,telephone')
      .eq('club_id', c.id)
      .order('type_staff'),
  ])

  const joueursMap = new Map()
  joueursRes.data?.forEach((l: any) => {
    if (l.joueur && !joueursMap.has(l.joueur.id)) joueursMap.set(l.joueur.id, l.joueur)
  })
  joueurs.value      = Array.from(joueursMap.values())
  competitions.value = compsRes.data?.map((cc: any) => cc.competition).filter(Boolean) ?? []
  transferts.value   = transfertsRes.data ?? []
  staff.value        = staffRes.data ?? []
}

async function viewJoueurDetails(j: any) {
  selectedJoueur.value = j
  modalJoueur.value = true
  
  // Charger licences et distinctions
  const [licencesRes, distinctionsRes] = await Promise.all([
    supabase.from('licences_saison').select('id,saison,type_licence,numero_maillot,club:club_id(nom)').eq('joueur_id', j.id).order('saison', { ascending: false }),
    supabase.from('distinctions').select('id,titre,annee').eq('joueur_id', j.id).order('annee', { ascending: false })
  ])
  
  licencesJoueur.value = licencesRes.data ?? []
  distinctionsJoueur.value = distinctionsRes.data ?? []
}

function openModal(c: any) {
  editing.value = c ? { ...c } : { nom:'',acronyme:'',region:'Centre',ville:'',gymnase:'',couleur_principale:'',actif:true,universitaire:false,pays:'Cameroun' }
  modal.value = true; saveError.value = ''
}

async function saveClub() {
  if (!editing.value.nom || !editing.value.acronyme || !editing.value.ville || !editing.value.pays) {
    saveError.value = 'Nom, acronyme, ville et pays requis'
    return
  }

  // Région obligatoire seulement pour le Cameroun
  if (editing.value.pays === 'Cameroun' && !editing.value.region) {
    saveError.value = 'Région requise pour les clubs camerounais'
    return
  }

  // Normalisation : nom en MAJUSCULES
  editing.value.nom = editing.value.nom.toUpperCase()

  // Vérification anti-doublon
  if (!editing.value.id) { // Seulement pour les nouveaux clubs
    const { data: similar } = await supabase
      .from('clubs')
      .select('id,nom,ville,pays')
      .ilike('nom', `%${editing.value.nom}%`)
      .limit(5)

    if (similar && similar.length > 0) {
      const confirmMsg = `Club(s) similaire(s) trouvé(s) :\n${similar.map((c: any) => `- ${c.nom} (${c.ville}, ${c.pays})`).join('\n')}\n\nVoulez-vous quand même créer ce club ?`
      if (!confirm(confirmMsg)) return
    }
  }

  saving.value = true; saveError.value = ''
  const { id, ...data } = editing.value
  if (id) { await supabase.from('clubs').update(data).eq('id', id) }
  else     { await supabase.from('clubs').insert(data) }
  saving.value = false; modal.value = false; load()
}

async function loadAllClubs() {
  const { data } = await supabase.from('clubs').select('id,nom,ville,pays').order('nom')
  allClubs.value = data ?? []
}

function onClubInput() {
  const query = editing.value.nom?.trim() || ''
  if (query.length >= 3) {
    clubSuggestions.value = allClubs.value
      .filter((c: any) => c.nom.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
    showSuggestions.value = clubSuggestions.value.length > 0
  } else {
    showSuggestions.value = false
  }
}

function selectClubSuggestion(suggestion: any) {
  editing.value.nom = suggestion.nom
  editing.value.ville = suggestion.ville
  editing.value.pays = suggestion.pays
  showSuggestions.value = false
}

function hideSuggestions() {
  showSuggestions.value = false
}

async function toggleUniversitaire(c: any) {
  await supabase.from('clubs').update({ universitaire: !c.universitaire }).eq('id', c.id)
  load()
}

async function toggleActif(c: any) {
  await supabase.from('clubs').update({ actif: !c.actif }).eq('id', c.id)
  load()
}

async function deleteClub(c: any) {
  if (confirm(`Supprimer le club "${c.nom}" ? Cette action est irréversible.`)) {
    await supabase.from('clubs').delete().eq('id', c.id)
    load()
  }
}

onMounted(() => {
  load()
  loadAllClubs()
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
.modal-box { background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--radius-lg);width:100%;max-width:560px;max-height:90vh;overflow-y:auto; }
.modal-header { display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--p-border); }
.modal-header h3 { font-size:1.2rem;font-weight:700; }
.modal-header button { color:var(--p-sub);font-size:18px; }
.modal-body { padding:20px 24px;display:flex;flex-direction:column;gap:14px; }
.form-row { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
.field { display:flex;flex-direction:column;gap:6px; }
.modal-footer { display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid var(--p-border); }
.save-error { padding:10px;border-radius:8px;background:rgba(140,21,37,.1);color:var(--p-red);font-size:13px; }
.modal-large { max-width:800px; }
.club-info { display:flex;flex-direction:column;gap:24px; }
.info-section h4 { font-size:1.1rem;font-weight:700;margin-bottom:12px;color:var(--p-red); }
.info-list { display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto; }
.info-item { padding:8px 12px;border-radius:6px;background:var(--p-bg2);font-size:14px; }
.clickable { cursor: pointer; transition: background 150ms; }
.clickable:hover { background: rgba(255,255,255,.05); }
.joueur-info { display:flex;flex-direction:column;gap:24px; }
.info-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:14px; }
.info-grid div { padding:8px 0; }
.btn-danger { color:var(--p-red) !important; }
.club-field { position:relative; }
.suggestions-list { position:absolute;top:100%;left:0;right:0;background:white;border:1px solid var(--p-border);border-radius:6px;max-height:200px;overflow-y:auto;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,.1); }
.suggestion-item { padding:8px 12px;cursor:pointer;border-bottom:1px solid var(--p-border); }
.suggestion-item:hover { background:var(--p-bg2); }
.suggestion-item:last-child { border-bottom:none; }
</style>
