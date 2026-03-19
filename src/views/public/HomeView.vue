<template>
  <div class="home">
    <!-- ── Hero ───────────────────────────────────────────────────── -->
    <section class="hero adinkra-watermark">
      <div class="p-container hero-inner">
        <div class="hero-text animate-fade-in-up">
          <div class="hero-eyebrow">
            <span class="kente-chip"><Flag class="inline w-4 h-4 mr-1" /> HANDBALL CAMEROUN</span>
          </div>
          <h1 class="hero-title font-display">
            Le <span class="text-red">Pivot</span><br>du handball camerounais
          </h1>
          <p class="hero-sub">Statistiques · Classements · Transferts · Équipes Nationales<br>La première plateforme data indépendante du handball camerounais.</p>
          <div class="hero-actions">
            <RouterLink to="/joueurs" class="p-btn-red p-btn-lg">Explorer les joueurs</RouterLink>
            <RouterLink to="/national" class="p-btn-ghost p-btn-lg"><Flag class="inline w-4 h-4 mr-1" /> Équipes Nationales</RouterLink>
          </div>
        </div>
        <div class="hero-stats">
          <div v-for="stat in heroStats" :key="stat.label" class="hero-stat p-card">
            <span class="stat-value font-display">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <KenteDivider />

    <!-- ── CAN Rwanda 2026 Spotlight ─────────────────────────────── -->
    <section class="p-section-sm">
      <div class="p-container">
        <div class="can-banner p-card-cam">
          <div class="can-flag"><Flag class="w-6 h-6" /></div>
          <div class="can-info">
            <span class="can-label p-badge p-badge-green">DONNÉES DISPONIBLES</span>
            <h2 class="can-title font-display">CAN Rwanda 2026 — Lions Indomptables</h2>
            <p class="can-sub">Résultats, statistiques individuelles et classement du tournoi maintenant sur PIVOT.</p>
          </div>
          <div class="can-actions">
            <RouterLink to="/national" class="p-btn-gold">Voir les stats CAN →</RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 4 Modules highlights ───────────────────────────────────── -->
    <section class="p-section">
      <div class="p-container">
        <h2 class="section-title font-display">8 modules pour tout suivre</h2>
        <p class="section-sub text-sub">PIVOT couvre l'intégralité de l'écosystème handball camerounais.</p>
        <div class="modules-grid">
          <RouterLink v-for="mod in modules" :key="mod.to" :to="mod.to" class="module-card p-card" :class="mod.class">
            <div class="module-icon"><component :is="mod.icon" class="w-5 h-5" /></div>
            <div class="module-body">
              <span class="module-tag text-red">{{ mod.tag }}</span>
              <h3 class="module-name">{{ mod.name }}</h3>
              <p class="module-desc text-sub">{{ mod.desc }}</p>
            </div>
            <span class="module-arrow">→</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <KenteDivider />

    <!-- ── Top Buteurs Preview ────────────────────────────────────── -->
    <section class="p-section-sm">
      <div class="p-container">
        <div class="section-header">
          <h2 class="section-title font-display">🏆 Top Buteurs PIVOT</h2>
          <RouterLink to="/buteurs" class="p-btn-ghost p-btn-sm">Voir tout →</RouterLink>
        </div>
        <div class="buteurs-preview">
          <div v-for="(j, idx) in topButeurs" :key="j.id" class="buteur-row p-card" :class="'rank-preview-' + (idx+1)">
            <span class="rank font-display">{{ idx + 1 }}</span>
            <div class="buteur-info">
              <span class="buteur-name">{{ j.prenom }} {{ j.nom }}</span>
              <span class="buteur-club text-sub">{{ j.club }}</span>
            </div>
            <div class="buteur-stats">
              <span class="stat-buts font-display">{{ j.buts }}</span>
              <span class="text-sub" style="font-size:11px">buts</span>
            </div>
            <div class="buteur-bar-wrap">
              <div class="buteur-bar" :style="{ width: (j.buts / topButeurs[0].buts * 100) + '%' }" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Derniers Transferts ────────────────────────────────────── -->
    <section class="p-section-sm">
      <div class="p-container">
        <div class="section-header">
          <h2 class="section-title font-display">RADAR — Derniers Mouvements</h2>
          <RouterLink to="/transferts" class="p-btn-ghost p-btn-sm">Voir tout →</RouterLink>
        </div>
        <div class="transferts-grid">
          <div v-for="t in dernierTransferts" :key="t.id" class="transfert-card p-card">
            <div class="transfert-header">
              <span class="p-badge" :class="'p-badge-' + fiabiliteColor(t.fiabilite)">{{ fiabiliteLabel(t.fiabilite) }}</span>
              <span class="transfert-date text-sub">{{ t.date }}</span>
            </div>
            <div class="transfert-joueur">{{ t.joueur }}</div>
            <div class="transfert-clubs">
              <span class="club-depart text-sub">{{ t.depart }}</span>
              <span class="transfert-arrow text-red">→</span>
              <span class="club-arrivee">{{ t.arrivee }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Module Éducation teaser ────────────────────────────────── -->
    <section class="p-section-sm">
      <div class="p-container">
        <div class="education-banner sawa-bg p-card">
          <div class="edu-content">
            <span class="p-badge p-badge-gold" style="margin-bottom:12px"><BookOpen class="inline w-4 h-4 mr-1" /> NOUVEAU</span>
            <h3 class="font-display" style="font-size:1.5rem;margin-bottom:8px">Espace Éducation Handball</h3>
            <p class="text-sub">Règles du jeu, droits des joueurs, guide arbitrage, documents officiels IHF/CAHB/FecaHand — téléchargeables en PDF, XLSX et CSV.</p>
          </div>
          <RouterLink to="/education" class="p-btn-gold" style="flex-shrink:0">Accéder →</RouterLink>
        </div>
      </div>
    </section>

    <KenteDivider :my="0" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import KenteDivider from '@/components/KenteDivider.vue'
import { User, Trophy, BarChart3, Lock, Heart, Newspaper, BookOpen, Flag } from 'lucide-vue-next'
import { supabase } from '@/lib/supabaseClient'

const heroStats = ref([
  { value: '…', label: 'Joueurs' },
  { value: '…', label: 'Clubs' },
  { value: '…', label: 'Compétitions' },
  { value: '2026', label: 'CAN Rwanda' },
])

const modules = [
  { to:'/joueurs',      tag:'M1', name:'ATLAS',      icon: User,      desc:'Annuaire complet des joueurs et clubs camerounais avec score IA.', class:'' },
  { to:'/competitions', tag:'M2', name:'ARENA',      icon: Trophy,    desc:'Classements et résultats de toutes les compétitions.', class:'' },
  { to:'/statistiques', tag:'M3', name:'SCOPE',      icon: BarChart3, desc:'Statistiques individuelles, top buteurs, distinctions.', class:'' },
  { to:'/transferts',   tag:'M4', name:'RADAR',      icon: Lock,      desc:'Transferts et mutations à 4 niveaux de fiabilité.', class:'' },
  { to:'/votes',        tag:'M5', name:'PULSE',      icon: Heart,     desc:'Votes participatifs — MVP, Homme de la Semaine.', class:'' },
  { to:'/actualites',   tag:'M6', name:'FEED',       icon: Newspaper, desc:'Actualités handball avec résumés générés par IA.', class:'' },
  { to:'/education',    tag:'M7', name:'ÉDUCATION',  icon: BookOpen,  desc:'Règles, droits, arbitrage — documents officiels téléchargeables.', class:'' },
  { to:'/national',     tag:'M8', name:'NATIONAL',   icon: Flag,      desc:'Équipes nationales — CAN 2026 et U20 Masculin.', class:'module-national' },
]

const topButeurs = ref<any[]>([])
const dernierTransferts = ref<any[]>([])

const fiabiliteLabel = (n:number) => ['','Suspicion','Rumeur','Officieux','Confirmé'][n]
const fiabiliteColor = (n:number) => ['','red','gold','blue','green'][n]
const formatDate = (d:string) => new Date(d).toLocaleDateString('fr-FR', { month:'short', year:'numeric' })

onMounted(async () => {
  // Stats hero
  const [{ count: nbJoueurs }, { count: nbClubs }, { count: nbComps }] = await Promise.all([
    supabase.from('joueurs').select('*', { count:'exact', head:true }),
    supabase.from('clubs').select('*', { count:'exact', head:true }).eq('actif', true),
    supabase.from('competitions').select('*', { count:'exact', head:true }),
  ])
  heroStats.value = [
    { value: (nbJoueurs ?? 0) + '+', label: 'Joueurs' },
    { value: (nbClubs ?? 0) + '',    label: 'Clubs' },
    { value: (nbComps ?? 0) + '',    label: 'Compétitions' },
    { value: '2026',                  label: 'CAN Rwanda' },
  ]

  // Top buteurs via vue SQL agrégée (performance)
  const { data: topData } = await supabase
    .from('top_buteurs_view')
    .select('joueur_id,prenom,nom,total_buts,matchs_joues,genre,score_ia')
    .limit(5)
  if (topData?.length) {
    const topIds = topData.map(t => t.joueur_id)
    const { data: licences } = await supabase
      .from('licences_saison').select('joueur_id, club:clubs(nom)')
      .in('joueur_id', topIds).eq('actif', true).limit(20)
    topButeurs.value = topData.map(t => ({
      id:    t.joueur_id,
      prenom: t.prenom,
      nom:    t.nom,
      genre:  t.genre,
      club:   (licences?.find(l => l.joueur_id === t.joueur_id)?.club as any)?.nom ?? '—',
      buts:   t.total_buts,
    }))
  }

  // Derniers transferts réels
  const { data: transfertsData } = await supabase
    .from('transferts')
    .select('id, joueur:joueurs(prenom,nom), club_origine:clubs!transferts_club_origine_id_fkey(nom), club_destination:clubs!transferts_club_destination_id_fkey(nom), fiabilite, date_transfert')
    .order('date_transfert', { ascending:false })
    .limit(3)
  dernierTransferts.value = (transfertsData ?? []).map(t => ({
    id: t.id,
    joueur: `${(t.joueur as any)?.prenom ?? ''} ${(t.joueur as any)?.nom ?? ''}`.trim(),
    depart: (t.club_origine as any)?.nom ?? '—',
    arrivee:(t.club_destination as any)?.nom ?? '—',
    fiabilite: t.fiabilite,
    date: t.date_transfert ? formatDate(t.date_transfert) : '—',
  }))
})
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--p-bg) 0%, var(--p-card) 60%, var(--p-bg) 100%);
  border-bottom: 1px solid var(--p-border);
  padding: 80px 0 60px;
}
.hero-inner {
  display: grid; grid-template-columns: 1fr 340px; gap: 60px; align-items: center;
}
.hero-eyebrow { margin-bottom: 16px; }
.kente-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 12px; border-radius: 99px;
  background: rgba(212,168,32,0.1); border: 1px solid rgba(212,168,32,0.3);
  color: var(--kente-or, #D4A820); font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
}
.hero-title {
  font-size: clamp(2.2rem, 5vw, 3.8rem); font-weight: 700; line-height: 1.1;
  margin-bottom: 20px; color: var(--p-text);
}
.hero-sub { font-size: 16px; color: var(--p-sub); line-height: 1.7; margin-bottom: 32px; }
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.hero-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.hero-stat {
  padding: 20px 16px; text-align: center;
  display: flex; flex-direction: column; gap: 4px;
}
.stat-value { font-size: 2rem; font-weight: 700; color: var(--p-red); }
.stat-label { font-size: 12px; color: var(--p-sub); text-transform: uppercase; letter-spacing: 0.06em; }

.can-banner {
  display: flex; align-items: center; gap: 20px;
  padding: 24px; border-radius: var(--radius-md);
  background: linear-gradient(135deg, rgba(0,122,94,0.08) 0%, var(--p-card) 50%, rgba(252,209,22,0.05) 100%);
}
.can-flag { font-size: 3rem; flex-shrink: 0; }
.can-info { flex: 1; }
.can-title { font-size: 1.4rem; font-weight: 700; margin: 6px 0 4px; }
.can-sub { font-size: 14px; color: var(--p-sub); }

.section-title { font-size: 1.8rem; font-weight: 700; margin-bottom: 6px; }
.section-sub { font-size: 15px; margin-bottom: 32px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header .section-title { margin-bottom: 0; }

.modules-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
}
.module-card {
  display: flex; flex-direction: column; gap: 12px; padding: 20px;
  position: relative; overflow: hidden;
}
.module-card.module-national {
  border-color: var(--cam-green, #007A5E);
  background: linear-gradient(135deg, rgba(0,122,94,0.06) 0%, var(--p-card) 100%);
}
.module-icon { font-size: 1.8rem; }
.module-tag { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; }
.module-name { font-size: 15px; font-weight: 700; color: var(--p-text); margin: 2px 0 6px; }
.module-desc { font-size: 12px; line-height: 1.5; flex: 1; }
.module-arrow {
  position: absolute; bottom: 16px; right: 16px;
  color: var(--p-border); font-size: 18px;
  transition: color 150ms, transform 150ms;
}
.module-card:hover .module-arrow { color: var(--p-red); transform: translateX(3px); }

.buteurs-preview { display: flex; flex-direction: column; gap: 8px; }
.buteur-row {
  display: grid; grid-template-columns: 40px 1fr auto 120px;
  align-items: center; gap: 16px; padding: 12px 16px;
}
.rank { font-size: 1.4rem; font-weight: 700; color: var(--p-border); text-align: center; }
.rank-preview-1 .rank { color: var(--p-gold); }
.rank-preview-2 .rank { color: #8A8A9A; }
.rank-preview-3 .rank { color: #8A5A2A; }
.buteur-name { font-weight: 600; display: block; }
.buteur-club { font-size: 12px; }
.buteur-stats { text-align: right; }
.stat-buts { font-size: 1.4rem; font-weight: 700; color: var(--p-red); display: block; }
.buteur-bar-wrap { height: 4px; background: var(--p-bg3); border-radius: 2px; overflow: hidden; }
.buteur-bar { height: 100%; background: var(--p-red); border-radius: 2px; transition: width 600ms ease; }

.transferts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.transfert-card { padding: 16px; }
.transfert-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.transfert-date { font-size: 11px; }
.transfert-joueur { font-weight: 600; margin-bottom: 8px; }
.transfert-clubs { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.transfert-arrow { font-weight: 700; }

.education-banner {
  display: flex; align-items: center; justify-content: space-between;
  gap: 24px; padding: 28px 32px;
}
.edu-content {}

@media (max-width: 1100px) { .modules-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 900px) {
  .hero-inner { grid-template-columns: 1fr; }
  .hero-stats { display: flex; flex-wrap: wrap; }
  .hero-stat { min-width: 120px; }
  .buteur-row { grid-template-columns: 32px 1fr auto; }
  .buteur-bar-wrap { display: none; }
  .transferts-grid { grid-template-columns: 1fr; }
  .can-banner { flex-direction: column; text-align: center; }
  .education-banner { flex-direction: column; }
}
@media (max-width: 600px) {
  .hero { padding: 60px 0 40px; }
  .hero-actions { flex-direction: column; }
  .modules-grid { grid-template-columns: 1fr; }
}
</style>
