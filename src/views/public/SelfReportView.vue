<template>
  <div class="self-report-page">
    <section class="p-hero" style="padding:40px 0 32px">
      <div class="p-container">
        <RouterLink to="/" class="p-btn-ghost p-btn-sm" style="display:inline-flex;margin-bottom:16px"> Accueil</RouterLink>
        <h1 class="font-display" style="font-size:2rem;font-weight:700;margin-bottom:8px">
          Rejoindre / Modifier mes données
        </h1>
        <p class="text-sub">Joueur, coach ou président de club — tu peux soumettre ou corriger tes informations directement sur PIVOT.</p>
      </div>
    </section>

    <div class="p-container" style="padding-top:24px;padding-bottom:60px;max-width:720px">

      <!-- Sélecteur de type -->
      <div class="type-tabs" v-if="!sent">
        <button v-for="t in types" :key="t.value" class="type-tab p-card"
          :class="{active: form.type_profil === t.value}" @click="form.type_profil = t.value">
          <span class="type-icon">{{ t.icon }}</span>
          <span class="type-label">{{ t.label }}</span>
        </button>
      </div>

      <!-- Formulaire principal -->
      <div class="p-card form-card" v-if="!sent">
        <h2 class="font-display form-title">{{ typeLabel }}</h2>

        <!-- Infos personnelles -->
        <div class="section-label">Informations personnelles</div>
        <div class="form-row">
          <div class="field"><label class="p-label">Prénom *</label>
            <input v-model="form.prenom" class="p-input" placeholder="Jean" /></div>
          <div class="field"><label class="p-label">Nom *</label>
            <input v-model="form.nom" class="p-input" placeholder="MBARGA" /></div>
        </div>
        <div class="form-row">
          <div class="field"><label class="p-label">Email *</label>
            <input v-model="form.email" class="p-input" type="email" placeholder="jean@email.com" /></div>
          <div class="field"><label class="p-label">Téléphone (WhatsApp)</label>
            <input v-model="form.telephone" class="p-input" type="tel" placeholder="+237 6XX XXX XXX" /></div>
        </div>

        <!-- Champs spécifiques JOUEUR -->
        <template v-if="form.type_profil === 'JOUEUR'">
          <div class="section-label">Profil sportif</div>
          <div class="form-row">
            <div class="field"><label class="p-label">Poste principal</label>
              <select v-model="details.poste_principal" class="p-input p-select">
                <option value="">— Sélectionner —</option>
                <option v-for="p in postes" :key="p.value" :value="p.value">{{ p.label }}</option>
              </select>
            </div>
            <div class="field"><label class="p-label">Bras fort</label>
              <select v-model="details.bras_fort" class="p-input p-select">
                <option value="droitier">Droitier</option>
                <option value="gaucher">Gaucher</option>
                <option value="ambidextre">Ambidextre</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="field"><label class="p-label">Taille (cm)</label>
              <input v-model.number="details.taille" class="p-input" type="number" min="140" max="230" placeholder="185" /></div>
            <div class="field"><label class="p-label">Poids (kg)</label>
              <input v-model.number="details.poids" class="p-input" type="number" min="50" max="150" placeholder="80" /></div>
          </div>
          <div class="form-row">
            <div class="field"><label class="p-label">Club actuel</label>
              <select v-model="form.club_actuel_id" class="p-input p-select">
                <option value="">— Aucun / Libre —</option>
                <option v-for="c in clubs" :key="c.id" :value="c.id">{{ c.nom }}</option>
              </select>
            </div>
            <div class="field"><label class="p-label">Date de naissance (approx.)</label>
              <input v-model="details.date_naissance" class="p-input" type="date" /></div>
          </div>
          <div class="field" style="margin-bottom:12px">
            <label class="p-label">Diplômes / Certifications sportives</label>
            <input v-model="details.diplomes" class="p-input" placeholder="Ex: Brevet d'État Handball, Licence IHF..." />
          </div>
        </template>

        <!-- Champs spécifiques COACH -->
        <template v-if="form.type_profil === 'COACH'">
          <div class="section-label">Profil coach</div>
          <div class="form-row">
            <div class="field"><label class="p-label">Club / Équipe encadré(e)</label>
              <select v-model="form.club_actuel_id" class="p-input p-select">
                <option value="">— Aucun —</option>
                <option v-for="c in clubs" :key="c.id" :value="c.id">{{ c.nom }}</option>
              </select>
            </div>
            <div class="field"><label class="p-label">Niveau de certification</label>
              <input v-model="details.certification" class="p-input" placeholder="Ex: Brevet Fédéral, IHF Niveau 1..." /></div>
          </div>
          <div class="field" style="margin-bottom:12px">
            <label class="p-label">Expérience (années + équipes encadrées)</label>
            <textarea v-model="details.experience" class="p-input" rows="2" placeholder="5 ans, U18 Force Armée, D1 Douala..."></textarea>
          </div>
        </template>

        <!-- Champs spécifiques PRESIDENT -->
        <template v-if="form.type_profil === 'PRESIDENT'">
          <div class="section-label">Club représenté</div>
          <div class="field" style="margin-bottom:12px">
            <label class="p-label">Club *</label>
            <select v-model="form.club_actuel_id" class="p-input p-select">
              <option value="">— Sélectionner le club —</option>
              <option v-for="c in clubs" :key="c.id" :value="c.id">{{ c.nom }}</option>
            </select>
          </div>
          <div class="field" style="margin-bottom:12px">
            <label class="p-label">Fonction officielle</label>
            <input v-model="details.fonction" class="p-input" placeholder="Président, Directeur sportif, Secrétaire général..." /></div>
        </template>

        <!-- Upload documents -->
        <div class="section-label">Documents (optionnel)</div>
        <div class="uploads-grid">
          <div class="upload-zone" @click="triggerUpload('cv')" :class="{loaded: uploads.cv}">
            <input type="file" ref="cvInput" accept=".pdf,.doc,.docx" style="display:none" @change="handleFile($event,'cv')" />
            <span class="upload-icon"></span>
            <span class="upload-label">{{ uploads.cv ? ' CV joint' : 'Déposer CV' }}</span>
            <span class="upload-hint">PDF, DOC (max 5Mo)</span>
          </div>
          <div class="upload-zone" @click="triggerUpload('licence')" :class="{loaded: uploads.licence}">
            <input type="file" ref="licenceInput" accept=".pdf,.jpg,.jpeg,.png" style="display:none" @change="handleFile($event,'licence')" />
            <span class="upload-icon">🪪</span>
            <span class="upload-label">{{ uploads.licence ? ' Licence jointe' : 'Licence FecaHand' }}</span>
            <span class="upload-hint">PDF, JPG, PNG (max 5Mo)</span>
          </div>
          <div class="upload-zone" @click="triggerUpload('photo')" :class="{loaded: uploads.photo}">
            <input type="file" ref="photoInput" accept=".jpg,.jpeg,.png,.webp" style="display:none" @change="handleFile($event,'photo')" />
            <span class="upload-icon"></span>
            <span class="upload-label">{{ uploads.photo ? ' Photo jointe' : 'Photo identité' }}</span>
            <span class="upload-hint">JPG, PNG (max 3Mo)</span>
          </div>
        </div>
        <div v-if="uploadError" class="save-error">{{ uploadError }}</div>

        <!-- Infos complémentaires -->
        <div class="field" style="margin-bottom:16px">
          <label class="p-label">Message complémentaire</label>
          <textarea v-model="form.message" class="p-input" rows="3"
            placeholder="Infos supplémentaires, corrections à apporter, demandes particulières..."></textarea>
        </div>

        <!-- CGU complet -->
        <div class="cgu-block">
          <div class="cgu-title">Conditions d'utilisation & Protection des données</div>
          <div class="cgu-text">
            <p>En soumettant ce formulaire, vous acceptez que vos données personnelles soient collectées et traitées par PIVOT (plateforme indépendante de données du handball camerounais) aux fins suivantes :</p>
            <ul>
              <li>Constitution d'un annuaire sportif du handball camerounais</li>
              <li>Amélioration de la transparence et du suivi des carrières sportives</li>
              <li>Aucune vente ou transmission à des tiers à des fins commerciales</li>
            </ul>
            <p><strong>Vos droits (Loi camerounaise n°2010/012 relative à la cybersécurité + RGPD) :</strong></p>
            <ul>
              <li>Droit d'accès, de rectification et de suppression de vos données à tout moment</li>
              <li>Droit d'opposition au traitement de vos données</li>
              <li>Droit à la portabilité de vos données</li>
            </ul>
            <p>Pour exercer ces droits : utilisez la page "Modifier mes données" sur ce site ou contactez-nous. Vos données sont stockées sur des serveurs sécurisés (Supabase/AWS) avec chiffrement SSL. Les documents uploadés sont conservés 24 mois maximum puis supprimés.</p>
            <p><em>PIVOT n'est affilié à aucune fédération officielle. Les données publiées sont déclaratives et soumises à vérification.</em></p>
          </div>
          <label class="cgu-check">
            <input type="checkbox" v-model="cguAccepte" />
            <span>J'ai lu et j'accepte les conditions d'utilisation et la politique de confidentialité de PIVOT *</span>
          </label>
          <label class="cgu-check" style="margin-top:8px">
            <input type="checkbox" v-model="majorite" />
            <span>Je certifie avoir au moins 16 ans ou être le représentant légal du joueur concerné *</span>
          </label>
        </div>

        <div v-if="error" class="save-error">{{ error }}</div>

        <button class="p-btn-red submit-btn"
          :disabled="!canSubmit || saving"
          @click="submit">
          <span v-if="saving" class="spinner-sm" />
          {{ saving ? 'Envoi en cours…' : ' Soumettre ma demande' }}
        </button>
      </div>

      <!-- Succès -->
      <div v-if="sent" class="p-card success-card">
        <div class="success-icon"></div>
        <h2 class="font-display">Demande reçue !</h2>
        <p class="text-sub">Notre équipe traitera ta demande sous <strong>7 jours ouvrables</strong>. Tu recevras une réponse par email ou WhatsApp.</p>
        <p class="text-sub" style="font-size:12px;margin-top:12px">
          Référence : <code style="background:var(--p-bg3);padding:2px 6px;border-radius:4px">{{ refId }}</code>
        </p>
        <div style="display:flex;gap:10px;margin-top:20px;justify-content:center;flex-wrap:wrap">
          <RouterLink to="/" class="p-btn-ghost p-btn-sm"> Accueil</RouterLink>
          <RouterLink to="/joueurs" class="p-btn-ghost p-btn-sm">Voir les joueurs</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const route = useRoute()
const sent   = ref(false)
const saving = ref(false)
const error  = ref('')
const uploadError = ref('')
const refId  = ref('')
const cguAccepte = ref(false)
const majorite   = ref(false)

const cvInput      = ref<HTMLInputElement | null>(null)
const licenceInput = ref<HTMLInputElement | null>(null)
const photoInput   = ref<HTMLInputElement | null>(null)

const uploads = ref<{ cv: File | null; licence: File | null; photo: File | null }>({
  cv: null, licence: null, photo: null
})

const types = [
  { value: 'JOUEUR',    label: 'Joueur',    icon: '' },
  { value: 'COACH',     label: 'Coach',     icon: '' },
  { value: 'PRESIDENT', label: 'Président', icon: '' },
]
const postes = [
  {value:'gardien', label:'Gardien'}, {value:'ailier_g', label:'Ailier Gauche'},
  {value:'ailier_d', label:'Ailier Droit'}, {value:'arriere_g', label:'Arrière Gauche'},
  {value:'arriere_d', label:'Arrière Droit'}, {value:'demi_centre', label:'Demi-Centre'},
  {value:'pivot', label:'Pivot'},
]

const form = ref({
  type_profil: (route.query.type as string)?.toUpperCase() ?? 'JOUEUR',
  prenom: '', nom: '', email: '', telephone: '',
  club_actuel_id: route.query.club_id as string ?? '',
  message: ''
})

const details = ref({
  poste_principal: '', bras_fort: 'droitier', taille: null as number|null,
  poids: null as number|null, date_naissance: '', diplomes: '',
  certification: '', experience: '', fonction: ''
})

const clubs = ref<any[]>([])

const typeLabel = computed(() => types.find(t => t.value === form.value.type_profil)?.label ?? 'Profil')

const canSubmit = computed(() =>
  form.value.prenom && form.value.nom && form.value.email && cguAccepte.value && majorite.value
)

function triggerUpload(type: 'cv'|'licence'|'photo') {
  const map = { cv: cvInput, licence: licenceInput, photo: photoInput }
  map[type].value?.click()
}

function handleFile(e: Event, type: 'cv'|'licence'|'photo') {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const maxMo = type === 'photo' ? 3 : 5
  if (file.size > maxMo * 1024 * 1024) {
    uploadError.value = `Fichier trop volumineux (max ${maxMo} Mo)`
    return
  }
  uploadError.value = ''
  uploads.value[type] = file
}

async function uploadFile(file: File, path: string): Promise<string|null> {
  try {
    const { error: err } = await supabase.storage.from('collecte-docs').upload(path, file, { upsert: true })
    if (err) { console.warn('Upload skipped:', err.message); return null }
    const { data } = supabase.storage.from('collecte-docs').getPublicUrl(path)
    return data.publicUrl
  } catch { return null } // Upload toujours optionnel
}

async function submit() {
  if (!canSubmit.value) return
  saving.value = true; error.value = ''
  try {
    const ts = Date.now()
    let cv_url: string|null = null, photo_url: string|null = null

    // Uploads optionnels — ne bloquent jamais la soumission
    if (uploads.value.cv)      cv_url    = await uploadFile(uploads.value.cv,     `${ts}/cv.${uploads.value.cv.name.split('.').pop()}`)
    if (uploads.value.photo)   photo_url = await uploadFile(uploads.value.photo,  `${ts}/photo.${uploads.value.photo.name.split('.').pop()}`)
    if (uploads.value.licence) await uploadFile(uploads.value.licence, `${ts}/licence.${uploads.value.licence.name.split('.').pop()}`)

    const detailsTech: Record<string, any> = {
      ...details.value,
      message:     form.value.message || null,
      cgu_version: '2026-03',
    }
    if (cv_url)    detailsTech.cv_url    = cv_url
    if (photo_url) detailsTech.photo_url = photo_url

    const { data, error: err } = await supabase.from('collecte_profils').insert({
      type_profil:        form.value.type_profil,
      prenom:             form.value.prenom.trim(),
      nom:                form.value.nom.trim(),
      email:              form.value.email.trim(),
      telephone:          form.value.telephone?.trim() || null,
      club_actuel_id:     form.value.club_actuel_id || null,
      photo_url,
      cv_url,
      cgu_accepte:        true,
      cgu_date:           new Date().toISOString(),
      statut:             'A_TRAITER',
      details_techniques: detailsTech,
    }).select('id').single()

    if (err) {
      console.error('Insert error:', err)
      throw new Error(err.message || 'Erreur serveur')
    }
    refId.value = (data as any)?.id?.slice(0,8).toUpperCase() ?? 'PIVOT-OK'
    sent.value = true
  } catch (e: any) {
    error.value = e.message?.includes('row-level security')
      ? 'Permission refusée. Contacte-nous directement sur WhatsApp.'
      : (e.message ?? 'Erreur lors de l\'envoi. Vérifie ta connexion et réessaie.')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const { data } = await supabase.from('clubs').select('id,nom').eq('actif', true).order('nom')
  clubs.value = data ?? []
})
</script>

<style scoped>
.self-report-page {}
.type-tabs { display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap }
.type-tab { display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 20px;cursor:pointer;min-width:120px;transition:border-color 150ms }
.type-tab.active { border-color:var(--p-red);background:rgba(140,21,37,.06) }
.type-icon { font-size:1.8rem }
.type-label { font-weight:700;font-size:13px }
.form-card { padding:28px }
.form-title { font-size:1.3rem;font-weight:700;margin-bottom:20px }
.section-label { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--p-sub);margin:20px 0 10px;padding-bottom:6px;border-bottom:1px solid var(--p-border) }
.form-row { display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px }
.field { display:flex;flex-direction:column;gap:4px }
.uploads-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px }
.upload-zone { display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px;border:1.5px dashed var(--p-border);border-radius:10px;cursor:pointer;text-align:center;transition:border-color 150ms }
.upload-zone:hover { border-color:var(--p-red) }
.upload-zone.loaded { border-color:var(--p-green);background:rgba(59,170,106,.05) }
.upload-icon { font-size:1.6rem }
.upload-label { font-size:12px;font-weight:600 }
.upload-hint { font-size:10px;color:var(--p-sub) }
.cgu-block { background:var(--p-bg2);border-radius:8px;padding:16px;margin-bottom:20px }
.cgu-title { font-weight:700;font-size:13px;margin-bottom:10px }
.cgu-text { font-size:12px;color:var(--p-sub);line-height:1.6;margin-bottom:12px }
.cgu-text p { margin-bottom:8px }
.cgu-text ul { padding-left:16px;margin-bottom:8px }
.cgu-text li { margin-bottom:4px }
.cgu-check { display:flex;align-items:flex-start;gap:8px;font-size:12px;cursor:pointer }
.cgu-check input { flex-shrink:0;margin-top:2px }
.submit-btn { width:100%;justify-content:center;margin-top:4px;height:44px }
.submit-btn:disabled { opacity:.5;cursor:not-allowed }
.save-error { padding:10px;border-radius:8px;background:rgba(140,21,37,.1);color:var(--p-red);font-size:13px;margin-bottom:12px }
.success-card { padding:40px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px }
.success-icon { width:56px;height:56px;border-radius:50%;background:rgba(59,170,106,.15);color:var(--p-green);font-size:1.6rem;display:flex;align-items:center;justify-content:center }
.spinner-sm { display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin 700ms linear infinite;margin-right:8px }
@keyframes spin { to{transform:rotate(360deg)} }
@media(max-width:600px) { .form-row{grid-template-columns:1fr}.uploads-grid{grid-template-columns:1fr 1fr}.type-tab{min-width:90px} }
</style>
