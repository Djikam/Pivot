<template>
  <div class="saisie-view">
    <!-- Onglets -->
    <div class="saisie-tabs" style="margin-bottom:16px">
      <button class="saisie-tab" :class="{active:activeTab==='saisie'}" @click="activeTab='saisie'"> Saisie de match</button>
      <button class="saisie-tab" :class="{active:activeTab==='creer'}" @click="activeTab='creer'"> Créer compétition / match</button>
    </div>

    <!-- TAB: SAISIE -->
    <div v-if="activeTab==='saisie'" class="saisie-grid">
      <!-- Colonne gauche : choix du match -->
      <div class="col-left">
        <div class="panel p-card">
          <h3 class="panel-title">Sélectionner un match</h3>
          <select v-model="selectedCompetition" class="p-input p-select" @change="loadMatchs" style="margin-bottom:10px">
            <option value="">— Choisir une compétition —</option>
            <option v-for="c in competitions" :key="c.id" :value="c.id">{{ c.nom }}</option>
          </select>
          <div v-if="matchsAVenir.length === 0 && selectedCompetition" class="text-sub" style="padding:12px;text-align:center">Aucun match programmé.</div>
          <div v-for="m in matchsAVenir" :key="m.id" class="match-row" :class="{selected: selectedMatch?.id === m.id}" @click="selectMatch(m)">
            <span class="match-j text-sub">J{{ m.journee }}</span>
            <span class="match-clubs">
              {{ m.type_match === 'international' ? ' Cameroun' : m.club_domicile?.nom }}
              <span class="text-red">vs</span>
              {{ m.type_match === 'international' ? m.adversaire_international : m.club_exterieur?.nom }}
            </span>
            <span class="match-date text-sub">{{ formatDate(m.date_match) }}</span>
          </div>
        </div>
      </div>

      <!-- Colonne droite : saisie -->
      <div class="col-right" v-if="selectedMatch">
        <div class="panel p-card">
          <h3 class="panel-title">
            <span v-if="selectedMatch.type_match==='international'">
               Cameroun <span class="text-red">–</span> {{ selectedMatch.adversaire_international }}
            </span>
            <span v-else>
              {{ selectedMatch.club_domicile?.nom }} <span class="text-red">–</span> {{ selectedMatch.club_exterieur?.nom }}
            </span>
            <span class="p-badge p-badge-muted" style="margin-left:8px">J{{ selectedMatch.journee }}</span>
          </h3>

          <!-- Scores -->
          <div class="scores-section">
            <div class="score-group">
              <label class="p-label">Mi-temps DOM</label>
              <input v-model.number="form.mi_temps_dom" type="number" min="0" class="p-input score-input" />
            </div>
            <span class="score-sep font-display text-sub">—</span>
            <div class="score-group">
              <label class="p-label">Mi-temps EXT</label>
              <input v-model.number="form.mi_temps_ext" type="number" min="0" class="p-input score-input" />
            </div>
          </div>
          <div class="scores-section">
            <div class="score-group">
              <label class="p-label">Score final DOM</label>
              <input v-model.number="form.score_dom" type="number" min="0" class="p-input score-input" />
            </div>
            <span class="score-sep font-display text-red" style="font-size:1.4rem">vs</span>
            <div class="score-group">
              <label class="p-label">Score final EXT</label>
              <input v-model.number="form.score_ext" type="number" min="0" class="p-input score-input" />
            </div>
          </div>

          <!-- Buteurs -->
          <div class="section-block">
            <div class="section-block-header">
              <h4 class="block-title"><svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg> Buteurs</h4>
              <div class="equipe-toggle">
                <button class="p-btn-ghost p-btn-sm" :class="{active: buteurEquipe==='dom'}" @click="buteurEquipe='dom'">DOM</button>
                <button class="p-btn-ghost p-btn-sm" :class="{active: buteurEquipe==='ext'}" @click="buteurEquipe='ext'">EXT</button>
              </div>
            </div>

            <div class="add-row">
              <select v-model="newBut.joueur_id" class="p-input p-select" style="flex:1">
                <option value="">Joueur…</option>
                <option v-for="j in joueursEquipe(buteurEquipe)" :key="j.joueur_id" :value="j.joueur_id">
                  {{ j.joueur?.prenom }} {{ j.joueur?.nom }}
                </option>
              </select>
              <input v-model.number="newBut.minute" type="number" min="1" max="60" placeholder="Min." class="p-input" style="width:70px" />
              <select v-model="newBut.type" class="p-input p-select" style="width:110px">
                <option value="normal">Normal</option>
                <option value="penalty">Pénalty</option>
                <option value="7m">7 mètres</option>
              </select>
              <button class="p-btn-red p-btn-sm" @click="addBut">+</button>
            </div>

            <div class="events-list">
              <div v-for="(b, i) in form.buts" :key="i" class="event-row">
                <span class="event-min text-sub">{{ b.minute }}'</span>
                <span class="event-icon"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg></span>
                <span class="event-name">{{ joueurNom(b.joueur_id) }}</span>
                <span class="p-badge p-badge-muted" v-if="b.type !== 'normal'">{{ b.type === '7m' ? '7m' : 'Pén.' }}</span>
                <span class="event-equipe text-sub">{{ b.equipe === 'dom' ? 'DOM' : 'EXT' }}</span>
                <button class="del-btn" @click="form.buts.splice(i,1)"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
              </div>
            </div>
          </div>

          <!-- Discipline IHF -->
          <div class="section-block">
            <h4 class="block-title"> Discipline (IHF)</h4>
            <div class="add-row">
              <select v-model="newDisc.joueur_id" class="p-input p-select" style="flex:1">
                <option value="">Joueur…</option>
                <option v-for="j in tousJoueurs" :key="j.joueur_id" :value="j.joueur_id">
                  {{ j.joueur?.prenom }} {{ j.joueur?.nom }}
                </option>
              </select>
              <select v-model="newDisc.type" class="p-input p-select" style="width:160px">
                <option value="avertissement">Avertissement</option>
                <option value="carton_jaune">Carton jaune</option>
                <option value="suspension_2min">Suspension 2 min</option>
                <option value="carton_rouge">Carton rouge</option>
                <option value="carton_bleu">Carton bleu ️</option>
              </select>
              <input v-model.number="newDisc.minute" type="number" min="1" max="60" placeholder="Min." class="p-input" style="width:70px" />
              <button class="p-btn-red p-btn-sm" @click="addDisc">+</button>
            </div>

            <!-- Alerte carton bleu -->
            <div v-if="hasCartonBleu" class="carton-bleu-alerte p-card" style="padding:12px;margin-top:10px;border-left:3px solid #3A2A8A;background:rgba(58,42,138,.08)">
              <span style="font-size:13px;color:#8A7AFF;font-weight:600">️ Carton bleu enregistré — Un rapport disciplinaire doit être transmis à la commission compétente.</span>
            </div>

            <div class="events-list">
              <div v-for="(d, i) in form.discipline" :key="i" class="event-row">
                <span class="event-min text-sub">{{ d.minute }}'</span>
                <DisciplineBadge :type="d.type" />
                <span class="event-name">{{ joueurNom(d.joueur_id) }}</span>
                <button class="del-btn" @click="form.discipline.splice(i,1)"></button>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button class="p-btn-ghost" @click="selectedMatch = null">Annuler</button>
            <button class="p-btn-red" :disabled="saving" @click="sauvegarder">
              <span v-if="saving" class="spinner-sm" />
              {{ saving ? 'Enregistrement…' : ' Enregistrer le match' }}
            </button>
          </div>

          <div v-if="saveError" class="save-error">{{ saveError }}</div>
          <div v-if="saveSuccess" class="save-success"> Match enregistré avec succès !</div>
        </div>
      </div>

      <div v-else class="col-right col-empty">
        <div class="empty-hint p-card">
          <span style="font-size:2.5rem"></span>
          <p>Sélectionnez un match programmé pour commencer la saisie.</p>
        </div>
      </div>
    </div><!-- fin saisie tab -->

    <!-- TAB: CRÉER -->
    <div v-if="activeTab==='creer'" class="creer-section">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;flex-wrap:wrap">
        <!-- Créer une compétition -->
        <div class="p-card" style="padding:20px">
          <h3 class="panel-title">Nouvelle compétition</h3>
          <div class="field"><label class="p-label">Nom *</label>
            <input v-model="newComp.nom" class="p-input" placeholder="Ex: D1 Littoral 2025-2026" /></div>
          <div class="field"><label class="p-label">Type</label>
            <select v-model="newComp.type" class="p-input p-select">
              <option value="regional">Régional</option><option value="national">National</option>
              <option value="universitaire">Universitaire</option><option value="coupe">Coupe</option>
              <option value="international">International</option>
            </select></div>
          <div class="field"><label class="p-label">Genre</label>
            <select v-model="newComp.genre" class="p-input p-select">
              <option value="masculin">Masculin</option><option value="feminin">Féminin</option>
            </select></div>
          <div class="field"><label class="p-label">Saison</label>
            <input v-model="newComp.saison" class="p-input" placeholder="2025-2026" /></div>
          <div class="field"><label class="p-label">Région</label>
            <input v-model="newComp.region" class="p-input" placeholder="Littoral, Centre…" /></div>
          <div v-if="compError" class="save-error">{{ compError }}</div>
          <button class="p-btn-red" :disabled="!newComp.nom || compSaving" @click="creerComp" style="margin-top:12px;width:100%">
            {{ compSaving ? 'Création…' : '+ Créer la compétition' }}
          </button>
          <div v-if="compSuccess" class="save-success"> Compétition créée ! Sélectionnez-la dans l'onglet Saisie pour y ajouter des matchs.</div>
        </div>

        <!-- Créer un match -->
        <div class="p-card" style="padding:20px">
          <h3 class="panel-title">Nouveau match</h3>
          <div class="field"><label class="p-label">Compétition *</label>
            <select v-model="newMatch.competition_id" class="p-input p-select" @change="loadPhasesForNew">
              <option value="">— Choisir —</option>
              <option v-for="c in competitions" :key="c.id" :value="c.id">{{ c.nom }}</option>
            </select></div>
          <div class="field"><label class="p-label">Phase *</label>
            <select v-model="newMatch.phase_id" class="p-input p-select">
              <option value="">— Choisir une phase —</option>
              <option v-for="p in phasesNew" :key="p.id" :value="p.id">{{ p.nom }}</option>
            </select>
            <button class="p-btn-ghost p-btn-sm" style="margin-top:6px" @click="creerPhase">+ Nouvelle phase</button>
          </div>
          <div class="field"><label class="p-label">Type de match</label>
            <select v-model="newMatch.type_match" class="p-input p-select">
              <option value="club">Club vs Club</option>
              <option value="international">Cameroun vs Adversaire</option>
            </select></div>
          <template v-if="newMatch.type_match === 'club'">
            <div class="field"><label class="p-label">Club Domicile</label>
              <select v-model="newMatch.club_dom_id" class="p-input p-select">
                <option value="">— Sélectionner —</option>
                <option v-for="c in clubs" :key="c.id" :value="c.id">{{ c.nom }}</option>
              </select></div>
            <div class="field"><label class="p-label">Club Extérieur</label>
              <select v-model="newMatch.club_ext_id" class="p-input p-select">
                <option value="">— Sélectionner —</option>
                <option v-for="c in clubs" :key="c.id" :value="c.id">{{ c.nom }}</option>
              </select></div>
          </template>
          <template v-else>
            <div class="field"><label class="p-label">Équipe nationale</label>
              <select v-model="newMatch.equipe_nationale_id" class="p-input p-select">
                <option v-for="e in equipes" :key="e.id" :value="e.id">{{ e.nom }}</option>
              </select></div>
            <div class="field"><label class="p-label">Adversaire</label>
              <input v-model="newMatch.adversaire" class="p-input" placeholder="Ex: Maroc" /></div>
          </template>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div class="field"><label class="p-label">Journée</label>
              <input v-model.number="newMatch.journee" type="number" min="1" class="p-input" /></div>
            <div class="field"><label class="p-label">Date</label>
              <input v-model="newMatch.date" type="datetime-local" class="p-input" /></div>
          </div>
          <div class="field"><label class="p-label">Lieu</label>
            <input v-model="newMatch.lieu" class="p-input" placeholder="Salle Omnisports, Yaoundé" /></div>
          <div v-if="matchError" class="save-error">{{ matchError }}</div>
          <button class="p-btn-red" :disabled="!newMatch.phase_id || matchSaving" @click="creerMatch" style="margin-top:12px;width:100%">
            {{ matchSaving ? 'Création…' : '+ Créer le match' }}
          </button>
          <div v-if="matchSuccess" class="save-success"> Match créé ! Allez dans Saisie pour entrer le score.</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import DisciplineBadge from '@/components/DisciplineBadge.vue'
import type { DisciplineType, TypeBut } from '@/lib/database.types'

const activeTab = ref<'saisie'|'creer'>('saisie')
const clubs     = ref<any[]>([])
const equipes   = ref<any[]>([])
const phasesNew = ref<any[]>([])

// Créer compétition
const newComp    = ref({ nom:'', type:'regional', genre:'masculin', saison:'2025-2026', region:'' })
const compSaving = ref(false)
const compError  = ref('')
const compSuccess = ref(false)

// Créer match
const newMatch    = ref({ competition_id:'', phase_id:'', type_match:'club', club_dom_id:'', club_ext_id:'', equipe_nationale_id:'', adversaire:'', journee:1, date:'', lieu:'' })
const matchSaving = ref(false)
const matchError  = ref('')
const matchSuccess = ref(false)

async function creerComp() {
  if (!newComp.value.nom.trim()) return
  compSaving.value = true; compError.value = ''; compSuccess.value = false
  const slug = newComp.value.nom.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()
  const { error } = await supabase.from('competitions').insert({
    nom:    newComp.value.nom.trim(),
    slug,
    type:   newComp.value.type,
    genre:  newComp.value.genre,
    saison: newComp.value.saison,
    region: newComp.value.region || null,
    statut: 'a_venir',
    niveau: newComp.value.type === 'international' ? 'international' : newComp.value.type === 'national' ? 'national' : newComp.value.type === 'universitaire' ? 'universitaire' : 'club',
  })
  if (error) { compError.value = error.message }
  else { compSuccess.value = true; newComp.value = { nom:'', type:'regional', genre:'masculin', saison:'2025-2026', region:'' }; loadCompetitions() }
  compSaving.value = false
}

async function loadPhasesForNew() {
  if (!newMatch.value.competition_id) return
  const { data } = await supabase.from('phases').select('id,nom').eq('competition_id', newMatch.value.competition_id).order('ordre')
  phasesNew.value = data ?? []
  if (phasesNew.value.length) newMatch.value.phase_id = phasesNew.value[0].id
}

async function creerPhase() {
  const nom = prompt('Nom de la phase (ex: Phase de groupes, Finale…)')
  if (!nom || !newMatch.value.competition_id) return
  const { data } = await supabase.from('phases').insert({
    competition_id: newMatch.value.competition_id,
    nom, ordre: phasesNew.value.length + 1
  }).select('id,nom').single()
  if (data) { phasesNew.value.push(data); newMatch.value.phase_id = data.id }
}

async function creerMatch() {
  if (!newMatch.value.phase_id) { matchError.value = 'Phase requise'; return }
  matchSaving.value = true; matchError.value = ''; matchSuccess.value = false
  const payload: any = {
    phase_id:    newMatch.value.phase_id,
    type_match:  newMatch.value.type_match,
    journee:     newMatch.value.journee,
    date_match:  newMatch.value.date || null,
    lieu:        newMatch.value.lieu || null,
    statut:      'programme',
  }
  if (newMatch.value.type_match === 'club') {
    payload.club_domicile_id  = newMatch.value.club_dom_id || null
    payload.club_exterieur_id = newMatch.value.club_ext_id || null
  } else {
    payload.equipe_nationale_id       = newMatch.value.equipe_nationale_id || null
    payload.adversaire_international  = newMatch.value.adversaire || null
  }
  const { error } = await supabase.from('matchs').insert(payload)
  if (error) { matchError.value = error.message }
  else { matchSuccess.value = true; newMatch.value.journee++; loadCompetitions() }
  matchSaving.value = false
}

async function loadCompetitions() {
  const { data } = await supabase.from('competitions').select('id,nom,genre').order('nom')
  competitions.value = data ?? []
}
const competitions     = ref<any[]>([])
const selectedCompetition = ref('')
const matchsAVenir = ref<any[]>([])
const selectedMatch = ref<any | null>(null)
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const buteurEquipe = ref<'dom'|'ext'>('dom')

const form = ref({
  score_dom: 0, score_ext: 0,
  mi_temps_dom: 0, mi_temps_ext: 0,
  buts: [] as any[],
  discipline: [] as any[],
})

const newBut  = ref({ joueur_id:'', minute: null as number|null, type:'normal' as TypeBut, equipe:'dom' as 'dom'|'ext' })
const newDisc = ref({ joueur_id:'', type:'carton_jaune' as DisciplineType, minute: null as number|null })

const licences = ref<any[]>([])
const tousJoueurs = computed(() => licences.value)
const joueursEquipe = (eq: 'dom'|'ext') => {
  if (!selectedMatch.value) return []
  const clubId = eq === 'dom' ? selectedMatch.value.club_domicile_id : selectedMatch.value.club_exterieur_id
  return licences.value.filter(l => l.club_id === clubId)
}

const hasCartonBleu = computed(() => form.value.discipline.some(d => d.type === 'carton_bleu'))

function joueurNom(id: string) {
  const l = licences.value.find(x => x.joueur_id === id)
  return l ? `${l.joueur?.prenom} ${l.joueur?.nom}` : id
}

function addBut() {
  if (!newBut.value.joueur_id) return
  form.value.buts.push({ ...newBut.value, equipe: buteurEquipe.value })
  newBut.value = { joueur_id:'', minute:null, type:'normal', equipe:'domicile' }
}

function addDisc() {
  if (!newDisc.value.joueur_id) return
  form.value.discipline.push({ ...newDisc.value })
  newDisc.value = { joueur_id:'', type:'carton_jaune', minute:null }
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })

async function loadMatchs() {
  if (!selectedCompetition.value) return
  const { data: phases } = await supabase.from('phases').select('id').eq('competition_id', selectedCompetition.value)
  const phaseIds = (phases ?? []).map((p: any) => p.id)
  if (!phaseIds.length) { matchsAVenir.value = []; return }
  const { data } = await supabase.from('matchs')
    .select(`*, 
      type_match, adversaire_international, equipe_nationale_id,
      club_domicile:clubs!matchs_club_domicile_id_fkey(id,nom),
      club_exterieur:clubs!matchs_club_exterieur_id_fkey(id,nom)
    `)
    .in('phase_id', phaseIds)
    .in('statut', ['programme','en_cours'])
    .order('date_match')
  matchsAVenir.value = data ?? []
}

async function selectMatch(m: any) {
  selectedMatch.value = m
  form.value = { score_dom:m.score_dom??0, score_ext:m.score_ext??0, mi_temps_dom:m.mi_temps_dom??0, mi_temps_ext:m.mi_temps_ext??0, buts:[], discipline:[] }
  saveError.value = ''; saveSuccess.value = false

  if (m.type_match === 'international' && m.equipe_nationale_id) {
    // Pour les matchs internationaux: charger les joueurs depuis la sélection nationale
    const { data } = await supabase.from('selections_joueurs')
      .select('joueur_id, joueur:joueurs(id,prenom,nom,poste_principal)')
      .eq('equipe_nationale_id', m.equipe_nationale_id)
      .in('statut', ['titulaire', 'finaliste'])
    // Formater comme des licences pour réutiliser la même interface
    licences.value = (data ?? []).map((s: any) => ({
      joueur_id: s.joueur_id,
      club_id: null,
      joueur: s.joueur
    }))
  } else {
    const clubIds = [m.club_domicile_id, m.club_exterieur_id].filter(Boolean)
    const saison = '2025-2026'
    const { data } = await supabase.from('licences_saison')
      .select('joueur_id, club_id, joueur:joueurs(id,prenom,nom,poste_principal)')
      .in('club_id', clubIds)
      .eq('saison', saison)
      .eq('actif', true)
    licences.value = data ?? []
  }
}

async function sauvegarder() {
  if (!selectedMatch.value) return
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false

  try {
    // Maj match
    await supabase.from('matchs').update({
      score_dom: form.value.score_dom,
      score_ext: form.value.score_ext,
      mi_temps_dom: form.value.mi_temps_dom,
      mi_temps_ext: form.value.mi_temps_ext,
      statut: 'termine',
    }).eq('id', selectedMatch.value.id)

    // Supprimer anciens buts/discipline
    await supabase.from('buts').delete().eq('match_id', selectedMatch.value.id)
    await supabase.from('discipline').delete().eq('match_id', selectedMatch.value.id)

    // Insérer buts
    if (form.value.buts.length) {
      await supabase.from('buts').insert(form.value.buts.map(b => ({ match_id: selectedMatch.value.id, ...b })))
    }

    // Insérer discipline
    if (form.value.discipline.length) {
      await supabase.from('discipline').insert(form.value.discipline.map(d => ({
        match_id: selectedMatch.value.id, ...d,
        rapport_envoye: d.type === 'carton_bleu' ? false : false
      })))
    }

    saveSuccess.value = true
    loadMatchs()
    setTimeout(() => { selectedMatch.value = null; saveSuccess.value = false }, 2000)
  } catch (e: any) {
    saveError.value = e.message ?? 'Erreur lors de la sauvegarde'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const [{ data: comps }, { data: cl }, { data: eq }] = await Promise.all([
    supabase.from('competitions').select('id,nom,genre').order('nom'),
    supabase.from('clubs').select('id,nom').eq('actif', true).order('nom'),
    supabase.from('equipes_nationales').select('id,nom').order('nom'),
  ])
  competitions.value = comps ?? []
  clubs.value = cl ?? []
  equipes.value = eq ?? []
})
</script>

<style scoped>
.saisie-tabs { display:flex;gap:8px;flex-wrap:wrap }
.saisie-tab { padding:8px 16px;border-radius:8px;border:1px solid var(--p-border);cursor:pointer;font-size:13px;background:transparent;color:var(--p-sub);transition:all 150ms }
.saisie-tab.active { border-color:var(--p-red);background:rgba(140,21,37,.1);color:var(--p-red);font-weight:600 }
.field { display:flex;flex-direction:column;gap:4px;margin-bottom:10px }
.save-success { margin-top:10px;padding:10px;border-radius:8px;background:rgba(59,170,106,.1);color:var(--p-green);font-size:13px }
.saisie-grid { display:grid;grid-template-columns:340px 1fr;gap:20px;align-items:flex-start; }
.panel { padding:20px; }
.panel-title { font-family:var(--font-display);font-size:1.1rem;font-weight:700;margin-bottom:16px; }

.match-row { padding:10px 12px;border-radius:8px;cursor:pointer;border:1px solid var(--p-border);margin-bottom:6px;transition:all 150ms; }
.match-row:hover { border-color:var(--p-red); }
.match-row.selected { border-color:var(--p-red);background:rgba(140,21,37,.06); }
.match-j { font-size:11px;font-weight:600;display:block; }
.match-clubs { font-weight:600;font-size:14px;display:block;margin:2px 0; }
.match-date { font-size:12px; }

.scores-section { display:flex;align-items:flex-end;gap:16px;margin-bottom:16px; }
.score-group { display:flex;flex-direction:column;gap:4px;flex:1; }
.score-input { font-size:1.6rem;font-family:var(--font-display);text-align:center;font-weight:700; }
.score-sep { font-size:1.2rem;padding-bottom:8px;flex-shrink:0; }

.section-block { margin-top:20px;padding-top:20px;border-top:1px solid var(--p-border); }
.section-block-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:12px; }
.block-title { font-weight:700;font-size:14px; }
.equipe-toggle { display:flex;gap:4px; }
.equipe-toggle .active { background:rgba(140,21,37,.1);border-color:var(--p-red);color:var(--p-red); }
.add-row { display:flex;gap:8px;margin-bottom:10px; }

.events-list { display:flex;flex-direction:column;gap:4px; }
.event-row { display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:6px;background:var(--p-bg2);font-size:13px; }
.event-min { font-size:11px;min-width:24px; }
.event-icon { flex-shrink:0; }
.event-name { flex:1;font-weight:600; }
.event-equipe { font-size:11px; }
.del-btn { color:var(--p-sub);font-size:11px;margin-left:auto;padding:2px 6px;border-radius:4px;transition:color 150ms; }
.del-btn:hover { color:var(--p-red); }

.form-actions { display:flex;justify-content:flex-end;gap:12px;margin-top:24px; }
.save-error { margin-top:10px;padding:10px;border-radius:6px;background:rgba(140,21,37,.1);color:var(--p-red);font-size:13px; }
.save-success { margin-top:10px;padding:10px;border-radius:6px;background:rgba(59,170,106,.1);color:var(--p-green);font-size:13px; }

.col-empty { display:flex; }
.empty-hint { flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:60px 20px;color:var(--p-sub);text-align:center; }
.spinner-sm { display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin 600ms linear infinite;margin-right:6px; }
@keyframes spin { to{transform:rotate(360deg)} }
@media (max-width:900px) { .saisie-grid { grid-template-columns:1fr; } }
</style>
