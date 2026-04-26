<template>
  <div class="admin-competitions">
    <!-- Toolbar -->
    <div class="admin-toolbar">
      <input v-model="search" class="p-input filter-input" placeholder=" Rechercher…" @input="debouncedLoad" />
      <select v-model="filterType" class="p-input p-select" @change="load">
        <option value="">Tous types</option>
        <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
      </select>
      <select v-model="filterStatut" class="p-input p-select" @change="load">
        <option value="">Tous statuts</option>
        <option value="a_venir">À venir</option>
        <option value="en_cours">En cours</option>
        <option value="termine">Terminée</option>
      </select>
      <button class="p-btn-red" @click="openModal(null)">+ Ajouter compétition</button>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>
    <table v-else class="p-table">
      <thead><tr><th>Compétition</th><th>Type</th><th>Saison</th><th>Genre</th><th>Statut</th><th>Actions</th></tr></thead>
      <tbody>
        <tr v-for="c in competitions" :key="c.id">
          <td style="font-weight:600">{{ c.nom }} <span class="text-sub">({{ c.slug }})</span></td>
          <td><span class="poste-badge">{{ typeLabel(c.type) }}</span></td>
          <td>{{ c.saison }}</td>
          <td>{{ genreLabel(c.genre) }}</td>
          <td><span class="statut-badge" :class="'statut-' + c.statut">{{ statutLabel(c.statut) }}</span></td>
          <td class="actions-cell">
            <button class="p-btn-ghost p-btn-sm" @click="openModal(c)">Éditer</button>
            <button class="p-btn-ghost p-btn-sm" @click="manageCompetition(c)">Gérer</button>
            <button class="p-btn-ghost p-btn-sm btn-danger" @click="deleteCompetition(c)">Suppr.</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal ajout/édition -->
    <Teleport to="body">
      <div v-if="modal" class="modal-backdrop" @click.self="modal=null">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="font-display">{{ editing?.id ? 'Modifier compétition' : 'Ajouter compétition' }}</h3>
            <button @click="modal=null"></button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="field"><label class="p-label">Nom *</label><input v-model="editing.nom" class="p-input" /></div>
              <div class="field"><label class="p-label">Slug *</label><input v-model="editing.slug" class="p-input" placeholder="ex: d1-douala-2026" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Type *</label>
                <select v-model="editing.type" class="p-input p-select">
                  <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
              </div>
              <div class="field"><label class="p-label">Saison *</label><input v-model="editing.saison" class="p-input" placeholder="2026" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Genre *</label>
                <select v-model="editing.genre" class="p-input p-select">
                  <option value="masculin">Masculin</option>
                  <option value="feminin">Féminin</option>
                  <option value="mixte">Mixte</option>
                </select>
              </div>
              <div class="field"><label class="p-label">Région</label><input v-model="editing.region" class="p-input" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Statut *</label>
                <select v-model="editing.statut" class="p-input p-select">
                  <option value="a_venir">À venir</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminée</option>
                </select>
              </div>
              <div class="field"><label class="p-label">Niveau *</label>
                <select v-model="editing.niveau" class="p-input p-select">
                  <option value="club">Club</option>
                  <option value="national">National</option>
                  <option value="international">International</option>
                </select>
              </div>
            </div>
            <div v-if="saveError" class="save-error">{{ saveError }}</div>
          </div>
          <div class="modal-footer">
            <button class="p-btn-ghost" @click="modal=null">Annuler</button>
            <button class="p-btn-red" :disabled="saving" @click="saveCompetition">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal gestion compétition (phases / matches) -->
    <Teleport to="body">
      <div v-if="manageModal" class="modal-backdrop" @click.self="manageModal=false">
        <div class="modal-box modal-large">
          <div class="modal-header">
            <h3 class="font-display">Gérer compétition — {{ selectedCompetition?.nom }}</h3>
            <button @click="manageModal=false"></button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="field" style="flex:1">
                <label class="p-label">Phase</label>
                <select v-model="selectedPhase" class="p-input p-select" @change="loadMatches">
                  <option v-for="p in phases" :key="p.id" :value="p">{{ p.nom }}</option>
                </select>
              </div>
              <div class="field" style="flex:1">
                <label class="p-label">Journée</label>
                <input v-model.number="newMatch.journee" type="number" min="1" class="p-input" />
              </div>
            </div>

            <div class="section">
              <h4 class="section-title">Participants</h4>
              <div class="form-row" style="align-items:flex-end;">
                <div class="field" style="flex:1">
                  <label class="p-label">Ajouter un club</label>
                  <select v-model="participantClubId" class="p-input p-select">
                    <option value="">— Sélectionner un club —</option>
                    <option v-for="c in allClubs" :key="c.id" :value="c.id">{{ c.nom }}</option>
                  </select>
                </div>
                <button class="p-btn p-btn-sm" @click="addParticipant" :disabled="!participantClubId">Ajouter</button>
              </div>
              <div class="participants-list">
                <div v-for="p in participants" :key="p.id" class="participant-item">
                  <span>{{ p.club?.nom }}</span>
                  <button class="p-btn-ghost p-btn-sm btn-danger" @click="removeParticipant(p)">Retirer</button>
                </div>
                <div v-if="participants.length === 0" class="text-sub" style="padding:10px 0">Aucun club ajouté à cette compétition.</div>
              </div>
            </div>

            <div class="section">
              <h4 class="section-title">Calendrier</h4>
              <div class="section-actions">
                <button class="p-btn p-btn-sm" @click="generateCalendar" :disabled="!selectedPhase || participants.length < 2">Générer le calendrier</button>
              </div>
              <div class="match-table">
                <table class="p-table">
                  <thead>
                    <tr><th>J</th><th>Dom.</th><th>Ext.</th><th>Date</th><th>Score</th><th>Statut</th><th></th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="m in matches" :key="m.id">
                      <td>{{ m.journee }}</td>
                      <td>{{ m.club_domicile?.nom }}</td>
                      <td>{{ m.club_exterieur?.nom }}</td>
                      <td><input type="datetime-local" v-model="m.date_match" class="p-input" @change="saveMatch(m)" /></td>
                      <td>
                        <input type="number" v-model.number="m.score_dom" class="p-input" style="width:70px;display:inline-block;" @change="saveMatch(m)" />
                        —
                        <input type="number" v-model.number="m.score_ext" class="p-input" style="width:70px;display:inline-block;" @change="saveMatch(m)" />
                      </td>
                      <td>
                        <select v-model="m.statut" class="p-input p-select" @change="saveMatch(m)">
                          <option value="programme">Programmé</option>
                          <option value="en_cours">En cours</option>
                          <option value="termine">Terminé</option>
                          <option value="reporte">Reporté</option>
                        </select>
                      </td>
                      <td>
                        <button class="p-btn-ghost p-btn-sm" @click="closeMatch(m)">Clôturer</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="matches.length === 0" class="text-sub" style="padding:12px">Aucun match enregistré pour cette phase.</div>
              </div>

              <div class="match-create" style="margin-top:16px">
                <h4 class="section-title">Ajouter un match</h4>
                <div class="form-row">
                  <div class="field"><label class="p-label">Domicile</label>
                    <select v-model="newMatch.club_domicile_id" class="p-input p-select">
                      <option value="">— Club domicile —</option>
                      <option v-for="c in participants" :key="c.club.id" :value="c.club.id">{{ c.club.nom }}</option>
                    </select>
                  </div>
                  <div class="field"><label class="p-label">Extérieur</label>
                    <select v-model="newMatch.club_exterieur_id" class="p-input p-select">
                      <option value="">— Club extérieur —</option>
                      <option v-for="c in participants" :key="c.club.id" :value="c.club.id">{{ c.club.nom }}</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="field"><label class="p-label">Date</label><input v-model="newMatch.date_match" type="datetime-local" class="p-input" /></div>
                  <div class="field"><label class="p-label">Journée</label><input v-model.number="newMatch.journee" type="number" min="1" class="p-input" /></div>
                </div>
                <button class="p-btn p-btn-sm" @click="createMatch" :disabled="!selectedPhase || !newMatch.club_domicile_id || !newMatch.club_exterieur_id">Créer match</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const competitions = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const filterType = ref('')
const filterStatut = ref('')
const modal = ref(false)
const editing = ref<any>({})
const saving = ref(false)
const saveError = ref('')

// Gestion compétition (phases / matches)
const manageModal = ref(false)
const selectedCompetition = ref<any>(null)
const phases = ref<any[]>([])
const selectedPhase = ref<any>(null)
const matches = ref<any[]>([])
const allClubs = ref<any[]>([])
const participants = ref<any[]>([])
const participantClubId = ref<string>('')
const newMatch = ref<any>({ club_domicile_id:'', club_exterieur_id:'', date_match:'', journee:1, statut:'programme' })

const types = [
  {value:'regional',label:'Régional'},{value:'national',label:'National'},{value:'universitaire',label:'Universitaire'},
  {value:'coupe',label:'Coupe'},{value:'international',label:'International'},
  {value:'tournament',label:'Tournoi'},{value:'friendly',label:'Amical'},
]

const typeLabel = (t:string) => types.find(x=>x.value===t)?.label??t
const genreLabel = (g:string) => ({masculin:'M',feminin:'F',mixte:'Mix'})[g]??g
const statutLabel = (s:string) => ({a_venir:'À venir',en_cours:'En cours',termine:'Terminée'})[s]??s

async function load() {
  loading.value = true
  let q = supabase.from('competitions').select('id,nom,slug,type,saison,region,genre,statut,niveau').order('nom')
  if (search.value) q = q.ilike('nom', `%${search.value}%`)
  if (filterType.value) q = q.eq('type', filterType.value)
  if (filterStatut.value) q = q.eq('statut', filterStatut.value)
  const { data } = await q.limit(100)
  competitions.value = data??[]; loading.value = false
}

let timer: ReturnType<typeof setTimeout>
function debouncedLoad() { clearTimeout(timer); timer=setTimeout(load,350) }

function openModal(c: any) {
  editing.value = c ? { ...c } : { nom:'',slug:'',type:'regional',saison:'2026',region:'',genre:'masculin',statut:'a_venir',niveau:'club' }
  modal.value = true; saveError.value = ''
}

async function saveCompetition() {
  if (!editing.value.nom || !editing.value.slug || !editing.value.type || !editing.value.saison || !editing.value.genre || !editing.value.statut || !editing.value.niveau) { saveError.value='Tous les champs marqués * sont requis'; return }
  saving.value = true; saveError.value = ''
  const { id, ...data } = editing.value
  if (id) { await supabase.from('competitions').update(data).eq('id', id) }
  else     { await supabase.from('competitions').insert(data) }
  saving.value = false; modal.value = false; load()
}

async function deleteCompetition(c:any)   { if(!confirm(`Supprimer ${c.nom} ?`)) return; await supabase.from('competitions').delete().eq('id',c.id); load() }

async function loadAllClubs() {
  const { data } = await supabase.from('clubs').select('id,nom').order('nom')
  allClubs.value = data ?? []
}

async function loadParticipants() {
  if (!selectedCompetition.value) return
  const { data } = await supabase.from('competition_clubs')
    .select('id,club:clubs(id,nom)')
    .eq('competition_id', selectedCompetition.value.id)
    .order('created_at')
  participants.value = (data ?? []).map((r:any) => ({ id: r.id, club: r.club }))
}

async function addParticipant() {
  if (!participantClubId.value || !selectedCompetition.value) return
  await supabase.from('competition_clubs').insert({ competition_id: selectedCompetition.value.id, club_id: participantClubId.value })
  participantClubId.value = ''
  await loadParticipants()
}

async function removeParticipant(p: any) {
  if (!confirm(`Retirer ${p.club?.nom} ?`)) return
  await supabase.from('competition_clubs').delete().eq('id', p.id)
  await loadParticipants()
}

async function loadPhases() {
  if (!selectedCompetition.value) return
  const { data } = await supabase.from('phases').select('*').eq('competition_id', selectedCompetition.value.id).order('ordre')
  phases.value = data ?? []
  if (phases.value.length && !selectedPhase.value) selectPhase(phases.value[0])
}

async function selectPhase(p: any) {
  selectedPhase.value = p
  await loadMatches()
}

async function loadMatches() {
  if (!selectedPhase.value) return
  const { data } = await supabase.from('matchs')
    .select('*, club_domicile:clubs!matchs_club_domicile_id_fkey(id,nom), club_exterieur:clubs!matchs_club_exterieur_id_fkey(id,nom)')
    .eq('phase_id', selectedPhase.value.id)
    .order('journee', { ascending: true })
    .order('date_match', { ascending: true })
  matches.value = data ?? []
}

async function manageCompetition(c:any) {
  selectedCompetition.value = c
  manageModal.value = true
  selectedPhase.value = null
  await Promise.all([loadAllClubs(), loadParticipants(), loadPhases()])
}

async function saveMatch(match: any) {
  const { id, club_domicile, club_exterieur, ...rest } = match
  const data = {
    ...rest,
    club_domicile_id: match.club_domicile_id,
    club_exterieur_id: match.club_exterieur_id,
  }
  if (id) {
    await supabase.from('matchs').update(data).eq('id', id)
  } else {
    await supabase.from('matchs').insert(data)
  }
  await loadMatches()
}

async function closeMatch(match: any) {
  if (!match.id) return
  await supabase.from('matchs').update({ statut: 'termine' }).eq('id', match.id)
  await loadMatches()
}

function resetNewMatch() {
  newMatch.value = { club_domicile_id:'', club_exterieur_id:'', date_match:'', journee:1, statut:'programme' }
}

async function createMatch() {
  if (!selectedPhase.value) return
  const m = { ...newMatch.value, phase_id: selectedPhase.value.id }
  await supabase.from('matchs').insert(m)
  resetNewMatch()
  await loadMatches()
}

// Simple round-robin scheduler (gens des journées) - ignore if odd
async function generateCalendar() {
  if (!selectedPhase.value) return
  const clubs = participants.value.map((p:any) => p.club)
  if (clubs.length < 2) return
  const teamIds = clubs.map((c:any) => c.id)
  const even = teamIds.length % 2 === 0
  const teams = [...teamIds]
  if (!even) teams.push(null)
  const rounds = teams.length - 1
  const half = teams.length / 2
  const fixtures: any[] = []
  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < half; i++) {
      const home = teams[i]
      const away = teams[teams.length - 1 - i]
      if (home && away) {
        fixtures.push({
          phase_id: selectedPhase.value.id,
          club_domicile_id: home,
          club_exterieur_id: away,
          date_match: new Date(Date.now() + round * 7 * 24 * 60 * 60 * 1000).toISOString(),
          journee: round + 1,
          statut: 'programme'
        })
      }
    }
    teams.splice(1, 0, teams.pop())
  }
  await supabase.from('matchs').insert(fixtures)
  await loadMatches()
}

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
.poste-badge { padding:2px 7px;border-radius:99px;background:rgba(140,21,37,.1);color:var(--p-red);font-size:11px;font-weight:600; }
.statut-badge { padding:2px 7px;border-radius:99px;font-size:11px;font-weight:600; }
.statut-a_venir { background:rgba(196,146,42,.1);color:var(--p-gold); }
.statut-en_cours { background:rgba(59,170,106,.1);color:var(--p-green); }
.statut-termine { background:rgba(160,144,168,.1);color:var(--p-sub); }
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
