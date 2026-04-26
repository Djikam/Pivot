<template>
  <div class="admin-articles">

    <!-- Onglets -->
    <div class="admin-tabs">
      <button class="admin-tab" :class="{ active: activeTab==='articles' }" @click="activeTab='articles'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
        Articles <span class="tab-count">{{ articles.length }}</span>
      </button>
      <button class="admin-tab" :class="{ active: activeTab==='comments' }" @click="switchToComments">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Commentaires <span class="tab-count" :class="{ 'tab-count-warn': allComments.length > 0 }">{{ allComments.length }}</span>
      </button>
    </div>

    <!-- ══ TAB ARTICLES ══ -->
    <template v-if="activeTab==='articles'">
    <!-- Toolbar -->
    <div class="admin-toolbar">
      <div class="search-wrap-admin">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="s-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" class="p-input" style="padding-left:34px" placeholder="Rechercher un article…" @input="debouncedLoad" />
      </div>
      <select v-model="filterCategorie" class="p-input p-select" @change="load" style="max-width:180px">
        <option value="">Toutes catégories</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <label class="toggle-label"><input type="checkbox" v-model="onlyIA" @change="load" /> IA uniquement</label>
      <button class="p-btn-red" @click="openModal(null)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nouvel article
      </button>
      <button class="p-btn-ghost" @click="showGenModal=true" style="display:flex;align-items:center;gap:6px">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        Générer via IA
      </button>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>
    <div v-else class="table-wrap">
      <table class="p-table">
        <thead><tr><th>Titre</th><th>Catégorie</th><th>Auteur</th><th>IA</th><th>Vues</th><th>Publié</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="a in articles" :key="a.id">
            <td style="font-weight:600;max-width:280px"><p class="truncate-2">{{ a.titre }}</p></td>
            <td><span class="p-badge p-badge-muted" style="font-size:10px">{{ a.categorie }}</span></td>
            <td class="text-sub">{{ a.auteur || "—" }}</td>
            <td><span v-if="a.genere_par_ia" class="p-badge p-badge-blue" style="font-size:10px">{{ (a.fournisseur_ia||"IA").toUpperCase() }}</span><span v-else class="text-sub" style="font-size:12px">—</span></td>
            <td class="text-sub">{{ a.vues ?? 0 }}</td>
            <td class="text-sub">{{ new Date(a.publie_le).toLocaleDateString("fr-FR") }}</td>
            <td class="actions-cell">
              <RouterLink :to="'/actualites/'+a.slug" target="_blank" class="p-btn-ghost p-btn-sm"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></RouterLink>
              <button class="p-btn-ghost p-btn-sm" @click="openModal(a)">Éditer</button>
              <button class="p-btn-ghost p-btn-sm btn-danger" @click="deleteArticle(a)">Suppr.</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </template>

    <!-- ══ TAB COMMENTAIRES ══ -->
    <template v-if="activeTab==='comments'">
      <div v-if="loadingComments" class="loading-state"><div class="spinner"/></div>
      <div v-else-if="!allComments.length" class="empty-state"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><p>Aucun commentaire.</p></div>
      <div v-else class="table-wrap">
        <table class="p-table">
          <thead><tr><th>Pseudo</th><th>Commentaire</th><th>Article</th><th>Type</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            <tr v-for="c in allComments" :key="c.id">
              <td style="font-weight:600;white-space:nowrap">{{ c.pseudo || "Anonyme" }}</td>
              <td style="max-width:340px"><p class="truncate-2" style="font-size:13px">{{ c.contenu }}</p></td>
              <td class="text-sub" style="font-size:12px">{{ articleTitle(c.article_id) }}</td>
              <td><span v-if="c.parent_id" class="p-badge p-badge-muted" style="font-size:10px">Réponse</span><span v-else class="p-badge p-badge-gold" style="font-size:10px">Principal</span></td>
              <td class="text-sub" style="white-space:nowrap">{{ new Date(c.created_at).toLocaleDateString("fr-FR") }}</td>
              <td><button class="p-btn-ghost p-btn-sm btn-danger" @click="deleteCommentAdmin(c)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg> Suppr.</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Modal génération IA depuis match -->
    <Teleport to="body">
      <div v-if="showGenModal" class="modal-backdrop" @click.self="showGenModal=false">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="font-display">Générer un article via IA depuis un match</h3>
            <button @click="showGenModal=false"></button>
          </div>
          <div class="modal-body">
            <div class="field"><label class="p-label">Choisir un match *</label>
              <select v-model="genMatchId" class="p-input p-select">
                <option value="">— Sélectionner un match terminé —</option>
                <option v-for="m in matchsTermines" :key="m.id" :value="m.id">
                  {{ m.type_match==='international' ? ' Cameroun vs '+m.adversaire_international : (m.club_domicile?.nom+' vs '+m.club_exterieur?.nom) }}
                  — {{ m.score_dom }}-{{ m.score_ext }} ({{ new Date(m.date_match).toLocaleDateString('fr-FR') }})
                </option>
              </select>
            </div>
            <div class="field"><label class="p-label">Ton de l'article</label>
              <select v-model="genTon" class="p-input p-select">
                <option value="journalistique">Journalistique</option>
                <option value="enthousiaste">Enthousiaste / Supporters</option>
                <option value="analytique">Analytique / Technique</option>
                <option value="concis">Flash Info (court)</option>
              </select>
            </div>
            <div v-if="genLoading" class="ia-loading">
              <div class="spinner" /><span>Claude rédige l'article…</span>
            </div>
            <div v-if="genError" class="save-error">{{ genError }}</div>
          </div>
          <div class="modal-footer">
            <button class="p-btn-ghost" @click="showGenModal=false">Annuler</button>
            <button class="p-btn-red" :disabled="!genMatchId || genLoading" @click="genererArticle">
              {{ genLoading ? 'Génération…' : 'Générer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    <Teleport to="body">
      <div v-if="modal" class="modal-backdrop" @click.self="modal=null">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="font-display">{{ editing?.id ? "Modifier article" : "Nouvel article" }}</h3>
            <button @click="modal=null"></button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="field"><label class="p-label">Titre *</label><input v-model="editing.titre" class="p-input" /></div>
              <div class="field"><label class="p-label">Slug *</label><input v-model="editing.slug" class="p-input" placeholder="url-friendly-slug" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Catégorie *</label><input v-model="editing.categorie" class="p-input" placeholder="ex: Actualité, Résumé match" /></div>
              <div class="field"><label class="p-label">Auteur</label><input v-model="editing.auteur" class="p-input" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label class="p-label">Date publication *</label><input v-model="editing.publie_le" type="datetime-local" class="p-input" /></div>
              <div class="field"><label class="p-label">Compétition</label>
                <select v-model="editing.competition_id" class="p-input p-select">
                  <option value="">— Aucune —</option>
                  <option v-for="c in competitions" :key="c.id" :value="c.id">{{ c.nom }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <label class="toggle-label" style="gap:8px"><input type="checkbox" v-model="editing.genere_par_ia" /> Généré par IA</label>
              <div v-if="editing.genere_par_ia" class="field" style="flex:1"><label class="p-label">Fournisseur IA</label>
                <select v-model="editing.fournisseur_ia" class="p-input p-select">
                  <option value="groq">Groq</option>
                  <option value="gemini">Gemini</option>
                </select>
              </div>
            </div>
            <div class="field"><label class="p-label">URL Image (optionnel)</label><input v-model="editing.image_url" class="p-input" placeholder="https://… (Cloudinary, etc.)" /></div>
            <div class="field"><label class="p-label">Tags (séparés par virgule)</label><input v-model="tagsInput" class="p-input" placeholder="handball, cameroun, can2026" /></div>
            <div class="field"><label class="p-label">Contenu *</label><textarea v-model="editing.contenu" class="p-input" rows="10" placeholder="Contenu de l'article..."></textarea></div>
            <div v-if="saveError" class="save-error">{{ saveError }}</div>
          </div>
          <div class="modal-footer">
            <button class="p-btn-ghost" @click="modal=null">Annuler</button>
            <button class="p-btn-red" :disabled="saving" @click="saveArticle">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { callIA, callIAJson } from '@/lib/iaClient'

const articles = ref<any[]>([])
const showGenModal  = ref(false)
const genMatchId    = ref('')
const genTon        = ref('journalistique')
const genLoading    = ref(false)
const genError      = ref('')
const matchsTermines = ref<any[]>([])

async function genererArticle() {
  if (!genMatchId.value) return
  genLoading.value = true; genError.value = ''
  try {
    const match = matchsTermines.value.find(m => m.id === genMatchId.value)
    if (!match) throw new Error('Match non trouvé')

    // Récupérer les top buteurs du match
    const { data: butsMatch } = await supabase.from('buts')
      .select('joueur_id, type, joueur:joueurs(prenom, nom, poste_principal)')
      .eq('match_id', genMatchId.value)
    
    const butMap = new Map<string, {nom:string; buts:number}>()
    for (const b of (butsMatch ?? [])) {
      const j = b.joueur as any
      const key = b.joueur_id
      if (!butMap.has(key)) butMap.set(key, { nom: `${j?.prenom} ${j?.nom}`, buts: 0 })
      butMap.get(key)!.buts++
    }
    const topButeurs = [...butMap.values()].sort((a,b)=>b.buts-a.buts).slice(0,3)

    const isIntl = match.type_match === 'international'
    const domNom = isIntl ? 'Cameroun' : match.club_domicile?.nom
    const extNom = isIntl ? match.adversaire_international : match.club_exterieur?.nom
    const result = match.score_dom > match.score_ext ? `${domNom} gagne` : match.score_dom < match.score_ext ? `${extNom} gagne` : 'Match nul'
    const date = new Date(match.date_match).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })
    
    const prompt = `Tu es journaliste sportif spécialisé handball camerounais pour PIVOT.
Écris un article ${genTon} sur ce match:
- ${domNom} ${match.score_dom} - ${match.score_ext} ${extNom}
- Date: ${date}
${match.lieu ? `- Lieu: ${match.lieu}` : ''}
${match.mi_temps_dom !== null ? `- Mi-temps: ${match.score_dom > match.score_ext ? match.mi_temps_dom : match.mi_temps_ext} - ${match.score_dom > match.score_ext ? match.mi_temps_ext : match.mi_temps_dom}` : ''}
- Résultat: ${result}
- Top marqueurs: ${topButeurs.map(b=>`${b.nom} (${b.buts} buts)`).join(', ') || 'Non disponibles'}

Écris en français, ton ${genTon}, environ 200-300 mots.
Structure: titre accrocheur + 2-3 paragraphes.
Format: JSON {"titre":"...","contenu":"..."}`

    const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ia-proxy`, {
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':import.meta.env.VITE_SUPABASE_ANON_KEY??''},
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:800, messages:[{role:'user',content:prompt}] })
    })
    const d = await r.json()
    const text = d.content?.[0]?.text ?? ''
    let parsed: any = {}
    try { parsed = JSON.parse(text.replace(/```json?|```/g,'').trim()) } catch { parsed = { titre: `Résumé: ${domNom} ${match.score_dom}-${match.score_ext} ${extNom}`, contenu: text } }

    const slug = parsed.titre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + Date.now()
    
    // Sauvegarder directement l'article
    await supabase.from('articles').insert({
      titre: parsed.titre,
      slug,
      contenu: parsed.contenu,
      categorie: isIntl ? 'International' : 'Résumé match',
      auteur: 'PIVOT IA',
      genere_par_ia: true,
      fournisseur_ia: 'claude',
      publie_le: new Date().toISOString(),
      competition_id: match.phase?.competition_id ?? null,
    })
    showGenModal.value = false; genMatchId.value = ''; load()
  } catch(e:any) { genError.value = e.message ?? 'Erreur IA' }
  finally { genLoading.value = false }
}
const loading = ref(true)
const search = ref('')
const filterCategorie = ref('')
const onlyIA = ref(false)
const modal = ref(false)
const activeTab = ref<'articles'|'comments'>('articles')
const allComments = ref<any[]>([])
const loadingComments = ref(false)
const editing = ref<any>({})
const saving = ref(false)
const saveError = ref('')
const tagsInput = ref('')

const categories = ['Actualité', 'Résumé match', 'Interview', 'Analyse', 'Transfert', 'National']

async function load() {
  loading.value = true
  let q = supabase.from('articles').select('id,titre,slug,contenu,categorie,genere_par_ia,fournisseur_ia,auteur,competition_id,publie_le').order('publie_le', { ascending: false })
  if (search.value) q = q.ilike('titre', `%${search.value}%`)
  if (filterCategorie.value) q = q.eq('categorie', filterCategorie.value)
  if (onlyIA.value) q = q.eq('genere_par_ia', true)
  const { data } = await q.limit(100)
  articles.value = data??[]; loading.value = false
}

let timer: ReturnType<typeof setTimeout>
function debouncedLoad() { clearTimeout(timer); timer=setTimeout(load,350) }

async function loadCompetitions() {
  const { data } = await supabase.from('competitions').select('id,nom').order('nom').limit(100)
  competitions.value = data ?? []
  const { data: mx } = await supabase.from('matchs')
    .select('id,score_dom,score_ext,date_match,type_match,adversaire_international,lieu,mi_temps_dom,mi_temps_ext,phase_id,phase:phases(competition_id),club_domicile:clubs!matchs_club_domicile_id_fkey(nom),club_exterieur:clubs!matchs_club_exterieur_id_fkey(nom)')
    .eq('statut','termine').order('date_match',{ascending:false}).limit(30)
  matchsTermines.value = mx ?? []
}

function openModal(a: any) {
  editing.value = a ? { ...a } : { titre:'',slug:'',contenu:'',categorie:'',genere_par_ia:false,auteur:'',publie_le:new Date().toISOString().slice(0,16),image_url:'' }
  tagsInput.value = a?.tags?.join(', ') || ''
  modal.value = true; saveError.value = ''
}

async function saveArticle() {
  if (!editing.value.titre || !editing.value.slug || !editing.value.contenu || !editing.value.categorie || !editing.value.publie_le) { saveError.value='Titre, slug, contenu, catégorie et date requis'; return }
  saving.value = true; saveError.value = ''
  if (tagsInput.value.trim()) {
    editing.value.tags = tagsInput.value.split(',').map((t:string) => t.trim()).filter(Boolean)
  }
  const { id, ...data } = editing.value
  if (id) { await supabase.from('articles').update(data).eq('id', id) }
  else     { await supabase.from('articles').insert(data) }
  saving.value = false; modal.value = false; load()
}

async function deleteArticle(a:any)   { if(!confirm(`Supprimer "${a.titre}" ?`)) return; await supabase.from('articles').delete().eq('id',a.id); load() }

async function switchToComments() {
  activeTab.value = 'comments'
  if (allComments.value.length === 0) {
    loadingComments.value = true
    const { data } = await supabase.from('article_commentaires')
      .select('id,article_id,parent_id,pseudo,contenu,created_at')
      .order('created_at', { ascending: false })
      .limit(200)
    allComments.value = data ?? []
    loadingComments.value = false
  }
}

function articleTitle(articleId: string) {
  const a = articles.value.find(x => x.id === articleId)
  return a ? a.titre.slice(0, 40) + (a.titre.length > 40 ? '…' : '') : articleId.slice(0,8)+'…'
}

async function deleteCommentAdmin(c: any) {
  if (!confirm('Supprimer ce commentaire ?')) return
  await supabase.from('article_commentaires').delete().eq('id', c.id)
  allComments.value = allComments.value.filter(x => x.id !== c.id)
}

onMounted(async () => {
  await loadCompetitions()
  load()
})
</script>

<style scoped>
.admin-tabs { display:flex;gap:4px;margin-bottom:24px;border-bottom:1px solid var(--p-border);padding-bottom:0; }
.admin-tab { display:inline-flex;align-items:center;gap:7px;padding:10px 18px;border-radius:var(--radius-md) var(--radius-md) 0 0;font-size:13px;font-weight:600;color:var(--p-sub);border:1px solid transparent;border-bottom:none;cursor:pointer;font-family:inherit;transition:color 130ms,background 130ms;position:relative;top:1px; }
.admin-tab:hover { color:var(--p-text); }
.admin-tab.active { color:var(--p-gold);background:var(--p-card);border-color:var(--p-border); }
.tab-count { padding:1px 7px;border-radius:99px;background:var(--p-bg3);border:1px solid var(--p-border);font-size:11px;font-weight:700;color:var(--p-muted); }
.tab-count-warn { background:rgba(206,17,38,0.1);border-color:rgba(206,17,38,0.3);color:var(--p-red); }
.table-wrap { overflow-x:auto; }
.search-wrap-admin { position:relative;flex:1;min-width:180px; }
.s-icon { position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--p-muted);pointer-events:none; }
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
.modal-box { background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--radius-lg);width:100%;max-width:800px;max-height:90vh;overflow-y:auto; }
.modal-header { display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--p-border); }
.modal-header h3 { font-size:1.2rem;font-weight:700; }
.modal-header button { color:var(--p-sub);font-size:18px; }
.modal-body { padding:20px 24px;display:flex;flex-direction:column;gap:14px; }
.form-row { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
.field { display:flex;flex-direction:column;gap:6px; }
.field textarea { resize:vertical; }
.modal-footer { display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid var(--p-border); }
.ia-loading { display:flex;align-items:center;gap:10px;padding:16px;background:rgba(58,128,190,.07);border-radius:8px;font-size:13px;color:var(--p-sub) }
.save-error { padding:10px;border-radius:8px;background:rgba(140,21,37,.1);color:var(--p-red);font-size:13px; }
@media (max-width:600px) { .form-row{grid-template-columns:1fr;} }
</style>
