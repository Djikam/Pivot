<template>
  <div class="education-view">
    <section class="edu-hero adinkra-watermark">
      <div class="p-container" style="padding:40px 0 32px">
        <div class="kente-chip-row">
          <span class="kente-chip-badge"> ESPACE ÉDUCATION</span>
        </div>
        <h1 class="font-display" style="font-size:2.2rem;font-weight:700;margin:12px 0 8px">Handball — Formation & Droits</h1>
        <p class="text-sub" style="font-size:15px;max-width:600px">Documents officiels IHF · CAHB · FecaHand. Règles du jeu, droits des joueurs, guide arbitrage. Téléchargeables en PDF, XLSX et CSV.</p>
        <input v-model="search" class="p-input" style="max-width:400px;margin-top:20px" placeholder=" Rechercher un document…" @input="debouncedFilter" />
      </div>
    </section>

    <div class="p-container" style="padding-top:32px;padding-bottom:60px">
      <!-- Catégories -->
      <div class="cat-tabs">
        <button v-for="cat in categories" :key="cat.value" class="cat-tab" :class="{active: activeCat === cat.value}" @click="activeCat = cat.value">
          <span>{{ cat.icon }}</span>
          <span>{{ cat.label }}</span>
        </button>
      </div>

      <KenteDivider :my="24" />

      <!-- Section "Comprendre le handball" -->
      <div v-if="activeCat === 'all' || activeCat === 'pedagogue'" class="handball-intro">
        <h2 class="font-display" style="font-size:1.6rem;font-weight:700;margin-bottom:20px">Les 10 règles essentielles du handball</h2>
        <div class="rules-grid">
          <div v-for="rule in reglesBase" :key="rule.num" class="rule-card p-card">
            <span class="rule-num font-display text-red">{{ rule.num }}</span>
            <div>
              <div class="rule-title">{{ rule.titre }}</div>
              <p class="text-sub rule-desc">{{ rule.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Discipline handball spéciale -->
        <div class="discipline-guide p-card" style="padding:24px;margin-top:24px">
          <h3 class="font-display" style="font-size:1.3rem;margin-bottom:16px"> Système de sanctions IHF</h3>
          <p class="text-sub" style="font-size:13px;margin-bottom:16px">Au handball, il n'y a pas de carton vert. Le système de sanctions comporte 5 niveaux officiels.</p>
          <div class="sanctions-list">
            <div v-for="s in sanctions" :key="s.type" class="sanction-row">
              <DisciplineBadge :type="s.type" />
              <div class="sanction-info">
                <span class="sanction-name">{{ s.nom }}</span>
                <span class="text-sub sanction-desc">{{ s.desc }}</span>
              </div>
            </div>
          </div>
        </div>
        <KenteDivider :my="32" />
      </div>

      <!-- Documents -->
      <div v-if="loading" class="loading-state"><div class="spinner" /><span class="text-sub">Chargement…</span></div>
      <div v-else>
        <div v-if="filteredDocs.length === 0" class="empty-state">
          <span style="font-size:2rem"></span>
          <p>Aucun document disponible pour cette catégorie.</p>
        </div>
        <div v-else class="docs-grid">
          <div v-for="doc in filteredDocs" :key="doc.id" class="doc-card p-card">
            <div class="doc-header">
              <span class="doc-format-badge" :class="'format-' + doc.format">{{ doc.format.toUpperCase() }}</span>
              <span class="doc-version text-sub">{{ doc.version }}</span>
            </div>
            <div class="doc-cat-icon">{{ catIcon(doc.categorie) }}</div>
            <h3 class="doc-titre">{{ doc.titre }}</h3>
            <p v-if="doc.description" class="doc-desc text-sub">{{ doc.description }}</p>
            <div class="doc-meta text-sub">
              <span>{{ formatDate(doc.publie_le) }}</span>
              <span class="p-badge p-badge-muted">{{ catLabel(doc.categorie) }}</span>
            </div>
            <div class="doc-actions">
              <a :href="doc.fichier_url" target="_blank" download class="p-btn-red p-btn-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Télécharger {{ doc.format.toUpperCase() }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import KenteDivider from '@/components/KenteDivider.vue'
import DisciplineBadge from '@/components/DisciplineBadge.vue'
import type { DocumentEducation, DisciplineType } from '@/lib/database.types'

const docs      = ref<DocumentEducation[]>([])
const loading   = ref(true)
const search    = ref('')
const activeCat = ref('all')

const categories = [
  { value:'all',          label:'Tous',           icon:'' },
  { value:'regles',       label:'Règles du jeu',  icon:'' },
  { value:'droits_joueur',label:'Droits joueurs',  icon:'' },
  { value:'droits_club',  label:'Droits clubs',    icon:'' },
  { value:'arbitrage',    label:'Arbitrage',       icon:'' },
  { value:'officiel',     label:'Docs officiels',  icon:'' },
  { value:'pedagogue',    label:'Pédagogie',       icon:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>' },
]

const catLabel = (c: string) => categories.find(x => x.value === c)?.label ?? c
const catIcon  = (c: string) => categories.find(x => x.value === c)?.icon ?? ''
const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })

const filteredDocs = computed(() => {
  let list = docs.value
  if (activeCat.value !== 'all') list = list.filter(d => d.categorie === activeCat.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(d => d.titre.toLowerCase().includes(q) || (d.description ?? '').toLowerCase().includes(q))
  }
  return list
})

let timer: ReturnType<typeof setTimeout>
function debouncedFilter() { clearTimeout(timer); timer = setTimeout(() => {}, 300) }

const reglesBase = [
  { num:'01', titre:'Le terrain', desc:'40m × 20m. Surface de jeu rectangulaire avec deux zones de but semi-circulaires de 6m.' },
  { num:'02', titre:'La balle', desc:'Taille officielle : 58-60cm (seniors H), 54-56cm (seniors F). Certifiée IHF.' },
  { num:'03', titre:'Nombre de joueurs', desc:'7 joueurs sur le terrain dont 1 gardien. 7 remplaçants maximum. Remplacement libre.' },
  { num:'04', titre:'La durée', desc:'2 × 30 minutes avec 10-15 minutes de pause. En cas d\'égalité : prolongations 2 × 5 min puis tirs au but.' },
  { num:'05', titre:'Zone de but (6m)', desc:'Zone réservée au gardien. Un joueur de champ peut entrer EN L\'AIR pour tirer.' },
  { num:'06', titre:'La règle des 3 pas', desc:'3 pas maximum sans dribbler. Dribble illimité mais interdit de reprendre après un arrêt.' },
  { num:'07', titre:'Les tirs au but (7m)', desc:'Accordé en cas de faute sur un tireur en situation de but manifeste.' },
  { num:'08', titre:'Gardien de but', desc:'Peut toucher le ballon avec toutes les parties du corps. Ne peut sortir avec la balle au-delà de la ligne de 9m.' },
  { num:'09', titre:'Fautes et sanctions', desc:'Contact illicite = jet franc. 5 niveaux de sanctions : avertissement  carton jaune  suspension 2min  rouge  bleu.' },
  { num:'10', titre:'Cumul suspensions', desc:'3 suspensions de 2min = exclusion définitive (sans carton rouge supplémentaire). Équipe joue à 5 pendant 2 min.' },
]

const sanctions: { type: DisciplineType; nom: string; desc: string }[] = [
  { type:'avertissement',  nom:'Avertissement', desc:'Remarque verbale. Pas de carte. Aucune conséquence immédiate.' },
  { type:'carton_jaune',   nom:'Carton jaune',  desc:'Avertissement officiel. 1 seul par joueur par match.' },
  { type:'suspension_2min',nom:'Suspension 2 min', desc:'Exclusion temporaire. 3 cumuls = exclusion définitive.' },
  { type:'carton_rouge',   nom:'Carton rouge',  desc:'Exclusion définitive du match. Équipe à 5 pendant 2 min.' },
  { type:'carton_bleu',    nom:'Carton bleu',   desc:'Infraction grave. Rapport disciplinaire  commission. Suspension potentielle.' },
]

onMounted(async () => {
  const { data } = await supabase.from('documents_education').select('*').eq('actif', true).order('categorie').order('publie_le', { ascending: false })
  docs.value = data ?? []
  loading.value = false
})
</script>

<style scoped>
.edu-hero { background:var(--p-card); border-bottom:1px solid var(--p-border); }
.kente-chip-badge { display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:99px;background:rgba(212,168,32,0.1);border:1px solid rgba(212,168,32,.3);color:var(--kente-or,#D4A820);font-size:11px;font-weight:700;letter-spacing:.06em; }

.cat-tabs { display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px; }
.cat-tab { display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:1px solid var(--p-border);font-size:13px;font-weight:500;color:var(--p-sub);background:transparent;cursor:pointer;transition:all 150ms; }
.cat-tab:hover { border-color:var(--p-red);color:var(--p-text); }
.cat-tab.active { border-color:var(--p-red);background:rgba(140,21,37,.1);color:var(--p-red); }

.rules-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px; }
.rule-card { padding:16px;display:flex;gap:14px;align-items:flex-start; }
.rule-num { font-size:1.6rem;font-weight:700;min-width:40px;line-height:1; }
.rule-title { font-weight:700;font-size:14px;margin-bottom:4px; }
.rule-desc { font-size:13px;line-height:1.5; }

.sanctions-list { display:flex;flex-direction:column;gap:10px; }
.sanction-row { display:flex;align-items:flex-start;gap:14px; }
.sanction-info { display:flex;flex-direction:column;gap:2px; }
.sanction-name { font-weight:600;font-size:14px; }
.sanction-desc { font-size:12px;line-height:1.4; }

.docs-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px; }
.doc-card { padding:20px;display:flex;flex-direction:column;gap:10px; }
.doc-header { display:flex;justify-content:space-between;align-items:center; }
.doc-format-badge { padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;text-transform:uppercase; }
.format-pdf  { background:rgba(140,21,37,.15);color:var(--p-red);border:1px solid rgba(140,21,37,.3); }
.format-xlsx { background:rgba(44,122,44,.15);color:#2C7A2C;border:1px solid rgba(44,122,44,.3); }
.format-csv  { background:rgba(58,128,190,.15);color:var(--p-blue);border:1px solid rgba(58,128,190,.3); }
.format-html { background:rgba(196,146,42,.15);color:var(--p-gold);border:1px solid rgba(196,146,42,.3); }
.doc-version { font-size:11px; }
.doc-cat-icon { font-size:2rem; }
.doc-titre { font-weight:700;font-size:15px; }
.doc-desc { font-size:13px;line-height:1.5;flex:1; }
.doc-meta { display:flex;justify-content:space-between;align-items:center;font-size:12px; }
.doc-actions { margin-top:4px; }

.loading-state,.empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 0;color:var(--p-sub); }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
