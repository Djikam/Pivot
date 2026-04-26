<template>
  <div class="joueur-detail" v-if="joueur">
    <!-- Hero -->
    <section class="detail-hero adinkra-watermark">
      <div class="p-container" style="padding-bottom:8px">
        <button class="p-btn-ghost p-btn-sm back-btn" @click="$router.back()"> Retour</button>
      </div>
      <div class="p-container hero-inner">
        <div class="avatar-wrap">
          <img v-if="joueur.photo_cloudinary_id" :src="cloudinaryUrl(joueur.photo_cloudinary_id,{w:120,h:120})" class="avatar-img" />
          <div v-else class="avatar-placeholder font-display">{{ joueur.prenom[0] }}{{ joueur.nom[0] }}</div>
          <span v-if="joueur.verifie" class="verified-badge" title="Profil vérifié"></span>
        </div>
        <div class="hero-info">
          <div class="hero-badges">
            <span v-if="joueur.badge_talent" class="p-badge p-badge-gold"> Talent à surveiller</span>
            <span v-if="joueur.statut_univ" class="p-badge p-badge-blue"><svg class="inline w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg> Universitaire</span>
            <span v-if="isNational" class="p-badge p-badge-green"> Sélectionné</span>
          </div>
          <h1 class="font-display" style="font-size:2.4rem;font-weight:700;margin:8px 0 4px">{{ joueur.prenom }} {{ joueur.nom }}</h1>
          <div class="hero-meta">
            <span class="poste-chip">{{ posteLabel(joueur.poste_principal) }}</span>
            <span v-if="joueur.poste_secondaire" class="poste-chip secondary">{{ posteLabel(joueur.poste_secondaire) }}</span>
            <span class="text-sub" v-if="joueur.bras_fort !== 'droitier'">{{ joueur.bras_fort === 'gaucher' ? ' Gaucher' : ' Ambidextre' }}</span>
            <span class="text-sub" v-if="joueur.taille_estimee">{{ joueur.taille_estimee }} cm</span>
          </div>
          <div class="hero-club" v-if="licenceActive">
            <span class="text-sub">Club actuel :</span>
            <RouterLink :to="'/clubs/' + licenceActive.club_id" class="club-link">{{ licenceActive.club?.nom }}</RouterLink>
            <span v-if="licenceActive.numero_maillot" class="text-sub">· #{{ licenceActive.numero_maillot }}</span>
          </div>
        </div>
        <!-- Score IA -->
        <div class="score-ring-wrap">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--p-border)" stroke-width="8" />
            <circle cx="50" cy="50" r="42" fill="none" :stroke="scoreColor(joueur.score_ia)" stroke-width="8"
              stroke-dasharray="263.9" :stroke-dashoffset="263.9 * (1 - joueur.score_ia/100)"
              stroke-linecap="round" transform="rotate(-90 50 50)" style="transition:stroke-dashoffset .8s ease" />
          </svg>
          <div class="score-center">
            <span class="font-display" style="font-size:1.6rem;font-weight:700" :style="{color:scoreColor(joueur.score_ia)}">{{ joueur.score_ia }}</span>
            <span style="font-size:9px;color:var(--p-sub);letter-spacing:.06em">SCORE IA</span>
            <span class="score-ia-tooltip">Indice de performance calculé par PIVOT (0-100) basé sur les stats IHF : buts, %, assists, arrêts gardiens.</span>
          </div>
        </div>
      </div>
    </section>

    <KenteDivider />

    <div class="p-container" style="padding-top:32px;padding-bottom:60px">
      <div class="detail-layout">
        <!-- Stats + onglets -->
        <div class="detail-main">
          <!-- Onglets -->
          <div class="p-tabs">
            <button class="p-tab" :class="{active:tab==='stats'}" @click="tab='stats'">Statistiques</button>
            <button class="p-tab" :class="{active:tab==='discipline'}" @click="tab='discipline'">Discipline</button>
            <button class="p-tab" :class="{active:tab==='historique'}" @click="tab='historique'">Historique clubs</button>
            <button class="p-tab" :class="{active:tab==='distinctions'}" @click="tab='distinctions'">Distinctions</button>
          </div>

          <!-- Stats saison -->
          <div v-if="tab==='stats'" style="padding-top:20px">
            <div class="stats-kpi">
              <div class="stat-kpi p-card" v-for="s in statsKPI" :key="s.label">
                <span class="kpi-v font-display" :style="{color:s.color||'var(--p-text)'}">{{ s.value }}</span>
                <span class="kpi-l text-sub">{{ s.label }}</span>
              </div>
            </div>
            <div v-if="butsParComp.length" style="margin-top:24px">
              <h3 style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;margin-bottom:12px">Buts par compétition</h3>
              <table class="p-table">
                <thead><tr><th>Compétition</th><th>Matchs</th><th>Buts</th><th>Pén.</th><th>7m</th><th>Moy.</th></tr></thead>
                <tbody>
                  <tr v-for="c in butsParComp" :key="c.nom">
                    <td>{{ c.nom }}</td>
                    <td class="text-sub">{{ c.matchs }}</td>
                    <td class="font-display" style="font-weight:700;color:var(--p-red)">{{ c.buts }}</td>
                    <td class="text-sub">{{ c.buts_penalty ?? 0 }}</td>
                    <td class="text-sub">{{ c.buts_7m ?? 0 }}</td>
                    <td class="text-sub">{{ c.matchs ? (c.buts/c.matchs).toFixed(1) : '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else-if="!loading" class="text-sub" style="padding:20px 0;font-size:13px">
              Aucun but enregistré pour ce joueur dans la base PIVOT.
            </div>
          </div>

          <!-- Discipline -->
          <div v-if="tab==='discipline'" style="padding-top:20px">
            <div class="disc-summary">
              <div v-for="d in disciplineSummary" :key="d.type" class="disc-item p-card">
                <DisciplineBadge :type="d.type" :count="d.count" />
                <span class="font-display" style="font-size:1.4rem;font-weight:700">{{ d.count }}</span>
              </div>
            </div>
            <div style="margin-top:16px" v-if="disciplineEvents.length">
              <table class="p-table">
                <thead><tr><th>Type</th><th>Minute</th><th>Match</th></tr></thead>
                <tbody>
                  <tr v-for="d in disciplineEvents" :key="d.id">
                    <td><DisciplineBadge :type="d.type" /></td>
                    <td class="text-sub">{{ d.minute ? d.minute + "'" : '—' }}</td>
                    <td class="text-sub" style="font-size:12px">{{ d.match_info ?? '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-sub" style="padding:20px;text-align:center">Aucune sanction enregistrée </div>
          </div>

          <!-- Historique clubs -->
          <div v-if="tab==='historique'" style="padding-top:20px">
            <div class="timeline">
              <div v-for="l in licences" :key="l.id" class="timeline-item p-card">
                <div class="timeline-saison p-badge p-badge-muted">{{ l.saison }}</div>
                <div class="timeline-info">
                  <RouterLink :to="'/clubs/'+l.club_id" class="timeline-club">{{ l.club?.nom }}</RouterLink>
                  <span class="text-sub" v-if="l.numero_maillot">#{{ l.numero_maillot }}</span>
                  <span class="p-badge p-badge-blue" v-if="l.type_licence === 'universite' || l.type_licence === 'les_deux'"><svg class="inline w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg> Universitaire</span>
                </div>
                <span v-if="l.actif" class="p-badge p-badge-green">Actuel</span>
              </div>
            </div>
          </div>

          <!-- Distinctions -->
          <div v-if="tab==='distinctions'" style="padding-top:20px">
            <div v-if="distinctions.length === 0" class="text-sub" style="padding:20px;text-align:center">Aucune distinction enregistrée.</div>
            <div class="distinctions-list" v-else>
              <div v-for="d in distinctions" :key="d.id" class="distinction-card p-card">
                <span class="dist-icon"><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg></span>
                <div><div style="font-weight:700">{{ d.type }}</div><div class="text-sub" style="font-size:12px">{{ d.saison }} · {{ d.periode ?? '' }}</div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar droite -->
        <div class="detail-sidebar">
          <!-- Infos joueur -->
          <div class="p-card sidebar-card">
            <h4 class="sidebar-title">Informations</h4>
            <div class="info-row"><span class="text-sub">Poste principal</span><span>{{ posteLabel(joueur.poste_principal) }}</span></div>
            <div class="info-row" v-if="joueur.poste_secondaire"><span class="text-sub">Poste secondaire</span><span>{{ posteLabel(joueur.poste_secondaire) }}</span></div>
            <div class="info-row"><span class="text-sub">Bras fort</span><span class="capitalize">{{ joueur.bras_fort }}</span></div>
            <div class="info-row" v-if="joueur.taille_estimee"><span class="text-sub">Taille estimée</span><span>{{ joueur.taille_estimee }} cm</span></div>
            <div class="info-row"><span class="text-sub">Profil</span><span :class="joueur.verifie ? 'text-green':'text-sub'">{{ joueur.verifie ? ' Vérifié' : 'Non vérifié' }}</span></div>
          </div>

          <!-- Sélection nationale -->
          <div class="p-card sidebar-card p-card-cam" v-if="selections.length">
            <h4 class="sidebar-title" style="color:var(--cam-green)"> Sélection nationale</h4>
            <div v-for="s in selections" :key="s.id" style="margin-bottom:8px">
              <div style="font-weight:700;font-size:13px">{{ s.equipe_nationale?.nom }}</div>
              <div class="text-sub" style="font-size:12px">{{ s.saison }} · {{ s.statut }}</div>
            </div>
          </div>

          <!-- Joueurs similaires IA -->
          <div class="p-card sidebar-card">
            <h4 class="sidebar-title"> Joueurs similaires</h4>
            <div v-if="loadingSimilaires" class="text-sub" style="font-size:12px;padding:8px 0">
              Analyse en cours…
            </div>
            <div v-else-if="similaires.length === 0" class="text-sub" style="font-size:12px">
              Aucun profil similaire détecté.
            </div>
            <div v-else>
              <RouterLink v-for="s in similaires" :key="s.id" :to="'/joueurs/'+s.id" class="similaire-row">
                <div class="similaire-info">
                  <span style="font-weight:600;font-size:13px">{{ s.prenom }} {{ s.nom }}</span>
                  <span class="text-sub" style="font-size:11px">{{ posteLabel(s.poste_principal) }}</span>
                </div>
                <span class="font-display" style="font-size:.9rem;font-weight:700" :style="{color:scoreColor(s.score_ia)}">{{ s.score_ia }}</span>
              </RouterLink>
            </div>
          </div>

          <!-- Lien self-report RGPD -->
          <div class="p-card sidebar-card" style="border-left:3px solid var(--p-gold)">
            <p style="font-size:12px;color:var(--p-sub);margin-bottom:10px">Tu es ce joueur ? Tu peux demander la modification ou suppression de tes données.</p>
            <RouterLink :to="'/self-report?joueur_id=' + joueur.id" class="p-btn-ghost p-btn-sm" style="width:100%;justify-content:center">️ Modifier / Supprimer mes données</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="!loading" class="p-container" style="padding:80px 0;text-align:center">
    <p class="text-sub">Joueur introuvable.</p>
    <RouterLink to="/joueurs" class="p-btn-ghost p-btn-sm" style="margin-top:12px;display:inline-flex"> Retour</RouterLink>
  </div>
  <div v-else class="loading-state"><div class="spinner" /></div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase, cloudinaryUrl } from '@/lib/supabaseClient'
import { callIA, callIAJson } from '@/lib/iaClient'
import KenteDivider from '@/components/KenteDivider.vue'
import DisciplineBadge from '@/components/DisciplineBadge.vue'
import type { DisciplineType } from '@/lib/database.types'

const route = useRoute()
const joueur = ref<any>(null)
const licences = ref<any[]>([])
const licenceActive = computed(() => licences.value.find(l => l.actif))
const similaires       = ref<any[]>([])
const loadingSimilaires = ref(false)

async function loadSimilaires(j: any) {
  if (!j) return
  loadingSimilaires.value = true
  try {
    // Chercher joueurs même poste, même genre, score proche
    const { data: candidats } = await supabase.from('joueurs')
      .select('id,prenom,nom,poste_principal,score_ia,genre,taille_estimee')
      .eq('poste_principal', j.poste_principal)
      .eq('genre', j.genre ?? 'masculin')
      .neq('id', j.id)
      .order('score_ia', { ascending: false })
      .limit(20)
    if (!candidats?.length) { similaires.value = []; loadingSimilaires.value = false; return }

    // Appel IA pour trouver les 3 plus similaires
    const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ia-proxy`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:300,
        messages:[{ role:'user', content:
`Joueur de référence: ${j.prenom} ${j.nom}, ${j.poste_principal}, ${j.taille_estimee}cm, score_ia=${j.score_ia}, bras=${j.bras_fort}, IG=${j.ig_ihf}
Candidats: ${JSON.stringify(candidats.map(c=>({id:c.id,prenom:c.prenom,nom:c.nom,poste:c.poste_principal,score:c.score_ia,taille:c.taille_estimee})))}
Retourne les 3 IDs les plus similaires en profil. JSON uniquement: ["id1","id2","id3"]`}]})
    })
    const d = await r.json()
    const text = d.content?.[0]?.text ?? '[]'
    let ids: string[] = []
    try { ids = JSON.parse(text.replace(/```json?|```/g,'').trim()) } catch { ids = candidats.slice(0,3).map((c:any)=>c.id) }
    similaires.value = ids.map(id => candidats.find((c:any)=>c.id===id)).filter(Boolean).slice(0,3)
  } catch { similaires.value = [] }
  finally { loadingSimilaires.value = false }
}
const disciplineEvents = ref<any[]>([])
const distinctions = ref<any[]>([])
const butsParComp = ref<any[]>([])
const loading = ref(true)
const tab = ref<'stats'|'discipline'|'historique'|'distinctions'>('stats')

const postes: Record<string,string> = { gardien:'Gardien', ailier_g:'Ailier G', ailier_d:'Ailier D', arriere_g:'Arrière G', arriere_d:'Arrière D', demi_centre:'Demi-Centre', pivot:'Pivot' }
const posteLabel = (p: string) => postes[p] ?? p
const scoreColor = (s: number) => s >= 80 ? '#3BAA6A' : s >= 60 ? '#C4922A' : '#3A80BE'

const statsKPI = computed(() => {
  const j = joueur.value
  if (!j) return []
  const totalButs   = butsParComp.value.reduce((a,c) => a+c.buts, 0)
  const totalMatchs = butsParComp.value.reduce((a,c) => a+c.matchs, 0)
  const isGardien   = j.poste_principal === 'gardien'
  const hasIhf      = (j.ig_ihf ?? 0) > 0 || (j.arrets_ihf ?? 0) > 0

  const base = [
    { label: isGardien ? 'Arrêts (IHF)' : 'Buts PIVOT', value: isGardien ? (j.arrets_ihf || '—') : (totalButs || (hasIhf ? j.ig_ihf : '—')), color:'var(--p-red)' },
    { label: 'Matchs IHF', value: j.im_ihf || totalMatchs || '—' },
    { label: isGardien ? '% Arrêts' : 'Moy./match', value: isGardien
        ? (j.arrets_ihf && j.tirs_recus_ihf ? Math.round(j.arrets_ihf/j.tirs_recus_ihf*100)+'%' : '—')
        : (totalMatchs ? (totalButs/totalMatchs).toFixed(1) : (j.im_ihf && j.ig_ihf ? (j.ig_ihf/j.im_ihf).toFixed(1) : '—')),
      color:'var(--p-gold)' },
    { label:'Distinctions', value: distinctions.value.length, color: distinctions.value.length ? 'var(--p-gold)' : undefined },
  ]
  // Joueurs avec stats IHF — afficher assists/turnovers
  if (!isGardien && (j.assists_ihf || j.turnovers_ihf)) {
    return [
      ...base,
      { label:'Assists (IHF)', value: j.assists_ihf || '—', color:'var(--p-blue)' },
      { label:'Turnovers (IHF)', value: j.turnovers_ihf || '—' },
      { label:'Steals (IHF)', value: j.steals_ihf || '—' },
      { label:'2min IHF', value: j.susp_2min_ihf || '0' },
    ]
  }
  return base
})

const disciplineSummary = computed(() => {
  const types: DisciplineType[] = ['carton_jaune','suspension_2min','carton_rouge','carton_bleu']
  return types.map(t => ({ type: t, count: disciplineEvents.value.filter(d => d.type === t).length })).filter(d => d.count > 0)
})

onMounted(async () => {
  const id = route.params.id as string
  const [{ data: j }, { data: lic }, { data: sel }, { data: disc }, { data: dist }, { data: butsRaw }] = await Promise.all([
    supabase.from('joueurs').select('*').eq('id', id).single(),
    supabase.from('licences_saison').select('*, club:clubs(id,nom)').eq('joueur_id', id).order('saison', { ascending: false }),
    supabase.from('selections_joueurs').select('*, equipe_nationale:equipes_nationales(nom)').eq('joueur_id', id),
    supabase.from('discipline').select('*, match:matchs(phase:phases(competition:competitions(nom)), club_domicile:clubs!matchs_club_domicile_id_fkey(nom), club_exterieur:clubs!matchs_club_exterieur_id_fkey(nom))').eq('joueur_id', id).order('created_at', { ascending: false }),
    supabase.from('distinctions').select('*').eq('joueur_id', id).order('saison', { ascending: false }),
    supabase.from('buts').select(`
      match_id, type,
      match:matchs(
        type_match, adversaire_international,
        phase:phases(competition:competitions(nom)),
        club_domicile:clubs!matchs_club_domicile_id_fkey(nom),
        club_exterieur:clubs!matchs_club_exterieur_id_fkey(nom)
      )
    `).eq('joueur_id', id).order('created_at', { ascending: false }),
  ])
  joueur.value = j
  licences.value = lic ?? []
  selections.value = sel ?? []
  // Enrichir discipline avec info match
  disciplineEvents.value = (disc ?? []).map(d => ({
    ...d,
    match_info: d.match ? `${d.match.club_domicile?.nom ?? 'Cameroun'} vs ${d.match.club_exterieur?.nom ?? d.match.adversaire_international ?? '?'}` : null
  }))
  distinctions.value = dist ?? []

  // Agréger buts par compétition (club + international)
  const compMap = new Map<string, { nom: string; buts: number; penalty: number; sept: number; matchs: Set<string> }>()
  for (const b of (butsRaw ?? [])) {
    const m = b.match as any
    const compNom = m?.phase?.competition?.nom
      ?? (m?.type_match === 'international' ? (m?.adversaire_international ? 'International' : 'International') : null)
      ?? 'Inconnue'
    if (!compMap.has(compNom)) compMap.set(compNom, { nom: compNom, buts: 0, penalty: 0, sept: 0, matchs: new Set() })
    const e = compMap.get(compNom)!
    e.buts++
    if ((b as any).type === 'penalty') e.penalty++
    if ((b as any).type === '7m')      e.sept++
    e.matchs.add(b.match_id)
  }
  butsParComp.value = [...compMap.values()]
    .map(e => ({ nom: e.nom, buts: e.buts, buts_penalty: e.penalty, buts_7m: e.sept, matchs: e.matchs.size }))
    .sort((a, b) => b.buts - a.buts)

  loading.value = false
  loadSimilaires(j) // IA async — ne bloque pas le rendu
})
</script>

<style scoped>
.detail-hero { background:var(--p-card);border-bottom:1px solid var(--p-border);padding:40px 0 32px; }
.back-btn { margin-bottom:12px; display:inline-flex; }
.score-ia-tooltip { display:none;position:absolute;bottom:105%;left:50%;transform:translateX(-50%);background:var(--p-bg3);border:1px solid var(--p-border);border-radius:8px;padding:8px 12px;font-size:11px;width:200px;text-align:center;color:var(--p-sub);z-index:10;line-height:1.5 }
.score-ring:hover .score-ia-tooltip { display:block }
.similaire-row { display:flex;align-items:center;justify-content:space-between;padding:7px 10px;border-radius:7px;background:var(--p-bg2);margin-bottom:6px;cursor:pointer;transition:background 150ms }
.similaire-row:hover { background:var(--p-bg3) }
.similaire-info { display:flex;flex-direction:column;gap:2px }
.hero-inner { display:flex;align-items:center;gap:24px; }
.avatar-wrap { position:relative;flex-shrink:0; }
.avatar-img { width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid var(--p-border); }
.avatar-placeholder { width:100px;height:100px;border-radius:50%;background:var(--p-bg3);display:flex;align-items:center;justify-content:center;font-size:2.4rem;font-weight:700;color:var(--p-red);border:3px solid var(--p-border); }
.verified-badge { position:absolute;bottom:4px;right:4px;width:22px;height:22px;border-radius:50%;background:var(--p-green);display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;border:2px solid var(--p-bg); }
.hero-info { flex:1; }
.hero-badges { display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px; }
.hero-meta { display:flex;align-items:center;gap:10px;margin:8px 0;flex-wrap:wrap; }
.poste-chip { padding:4px 12px;border-radius:99px;background:rgba(140,21,37,.12);color:var(--p-red);font-size:12px;font-weight:700; }
.poste-chip.secondary { background:rgba(58,128,190,.1);color:var(--p-blue); }
.hero-club { display:flex;align-items:center;gap:6px;font-size:14px;margin-top:4px; }
.club-link { color:var(--p-gold);font-weight:600; }
.score-ring-wrap { position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.score-center { position:absolute;display:flex;flex-direction:column;align-items:center;line-height:1; }

.detail-layout { display:grid;grid-template-columns:1fr 280px;gap:24px;align-items:flex-start; }
.stats-kpi { display:grid;grid-template-columns:repeat(4,1fr);gap:12px; }
.stat-kpi { padding:16px;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center; }
.kpi-v { font-size:1.8rem;font-weight:700; }
.kpi-l { font-size:11px;text-transform:uppercase;letter-spacing:.05em; }
.disc-summary { display:flex;gap:10px;flex-wrap:wrap; }
.disc-item { padding:14px 20px;display:flex;align-items:center;gap:12px; }
.timeline { display:flex;flex-direction:column;gap:8px; }
.timeline-item { display:flex;align-items:center;gap:12px;padding:12px 16px; }
.timeline-saison { flex-shrink:0; }
.timeline-info { flex:1;display:flex;align-items:center;gap:8px; }
.timeline-club { font-weight:700;color:var(--p-text); }
.distinctions-list { display:flex;flex-direction:column;gap:8px; }
.distinction-card { display:flex;align-items:center;gap:12px;padding:12px 16px; }
.dist-icon { font-size:1.4rem; }
.sidebar-card { padding:16px;margin-bottom:12px; }
.sidebar-title { font-family:var(--font-display);font-size:1rem;font-weight:700;margin-bottom:12px; }
.info-row { display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--p-border);font-size:13px; }
.info-row:last-child { border:none; }
.capitalize { text-transform:capitalize; }
.loading-state { display:flex;justify-content:center;align-items:center;height:200px; }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
@media (max-width:900px) { .detail-layout{grid-template-columns:1fr;}.stats-kpi{grid-template-columns:repeat(2,1fr);}.hero-inner{flex-wrap:wrap;} }
</style>
