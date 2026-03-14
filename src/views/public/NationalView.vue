<template>
  <div class="national-view">
    <!-- Hero bicolore camerounais -->
    <section class="national-hero">
      <div class="cam-stripe" />
      <div class="p-container hero-inner">
        <div class="hero-content">
          <span class="p-badge p-badge-green" style="margin-bottom:14px">🇨🇲 ÉQUIPES NATIONALES</span>
          <h1 class="font-display hero-title">Lions Indomptables<br><span class="text-gold">Handball Cameroun</span></h1>
          <p class="text-sub hero-sub">CAN Rwanda 2026 · U20 Masculin 2026 · Données officielles saisies par l'équipe PIVOT</p>
        </div>
        <div class="cam-emblem">🇨🇲</div>
      </div>
      <div class="cam-stripe" />
    </section>

    <div class="p-container" style="padding-top:40px">
      <!-- Sélecteur équipe -->
      <div class="equipe-tabs">
        <button v-for="eq in equipes" :key="eq.id" class="equipe-tab p-card" :class="{active: selectedId === eq.id}" @click="selectEquipe(eq)">
          <span class="eq-cat p-badge" :class="getCatBadge(eq.categorie)">{{ eq.categorie.toUpperCase() }}</span>
          <span class="eq-nom">{{ eq.nom }}</span>
          <span class="eq-saison text-sub">{{ eq.saison_active }}</span>
        </button>
      </div>

      <!-- Contenu équipe sélectionnée -->
      <div v-if="selected" class="equipe-detail">
        <!-- KPIs matchs internationaux -->
        <div class="kpi-row" v-if="matchsKPI.length">
          <div v-for="k in matchsKPI" :key="k.label" class="kpi-card p-card">
            <span class="kpi-value font-display" :class="k.color">{{ k.value }}</span>
            <span class="kpi-label text-sub">{{ k.label }}</span>
          </div>
        </div>

        <!-- Onglets -->
        <div class="p-tabs" style="margin:28px 0 20px">
          <button class="p-tab" :class="{active:tab==='roster'}" @click="tab='roster'">Effectif ({{ joueurs.length }})</button>
          <button class="p-tab" :class="{active:tab==='matchs'}" @click="tab='matchs'">Matchs</button>
          <button class="p-tab" :class="{active:tab==='stats'}" @click="tab='stats'">Stats individuelles</button>
        </div>

        <!-- Roster -->
        <div v-if="tab === 'roster'">
          <div class="roster-grid">
            <RouterLink v-for="sel in joueurs" :key="sel.id" :to="'/joueurs/'+sel.joueur_id" class="roster-card p-card p-card-cam">
              <div class="roster-avatar">
                <img v-if="sel.joueur?.photo_cloudinary_id" :src="cloudinaryUrl(sel.joueur.photo_cloudinary_id,{w:64,h:64})" />
                <span v-else class="roster-initials">{{ sel.joueur?.prenom[0] }}{{ sel.joueur?.nom[0] }}</span>
              </div>
              <div class="roster-info">
                <span class="p-badge" :class="statutColor(sel.statut)" style="margin-bottom:4px">{{ statutLabel(sel.statut) }}</span>
                <div class="roster-name">{{ sel.joueur?.prenom }} {{ sel.joueur?.nom }}</div>
                <div class="roster-poste text-sub">{{ posteLabel(sel.joueur?.poste_principal ?? '') }}</div>
              </div>
              <div class="roster-score">
                <span class="font-display" style="font-size:1.3rem;font-weight:700;color:var(--p-gold)">{{ sel.joueur?.score_ia }}</span>
                <span class="text-sub" style="font-size:10px">Score IA</span>
              </div>
            </RouterLink>
          </div>
        </div>

        <!-- Matchs -->
        <div v-if="tab === 'matchs'">
          <div v-if="matchsInternationaux.length === 0" class="empty-state">
            <span>📅</span><p>Aucun match enregistré pour cette sélection.</p>
          </div>
          <table v-else class="p-table">
            <thead><tr><th>Date</th><th>Adversaire</th><th>Score</th><th>Type</th><th>Statut</th></tr></thead>
            <tbody>
              <tr v-for="m in matchsInternationaux" :key="m.id">
                <td class="text-sub">{{ formatDate(m.date_match) }}</td>
                <td style="font-weight:600">{{ m.adversaire }}</td>
                <td>
                  <span v-if="m.score_cam !== null" class="font-display" style="font-size:1.1rem;font-weight:700">
                    <span :style="{color: m.score_cam > m.score_adv ? 'var(--p-green)' : 'var(--p-red)'}">{{ m.score_cam }}</span>
                    <span class="text-sub"> — </span>
                    <span>{{ m.score_adv }}</span>
                  </span>
                  <span v-else class="text-sub">À venir</span>
                </td>
                <td><span class="p-badge p-badge-muted">{{ m.type.toUpperCase() }}</span></td>
                <td>
                  <span class="p-badge" :class="m.statut === 'termine' ? 'p-badge-green' : 'p-badge-gold'">
                    {{ m.statut === 'termine' ? 'Terminé' : 'Programmé' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Stats individuelles -->
        <div v-if="tab === 'stats'">
          <div class="stats-note p-card" style="padding:16px;margin-bottom:20px;border-left:3px solid var(--p-gold)">
            <p class="text-sub" style="font-size:13px">Statistiques issues des matchs CAN Rwanda 2026 saisis dans PIVOT. Données déclaratives.</p>
          </div>
          <table class="p-table">
            <thead><tr><th>Joueur</th><th>Poste</th><th>Matchs</th><th>Buts</th><th>Susp. 2min</th><th>Score IA</th></tr></thead>
            <tbody>
              <tr v-for="sel in joueurs.filter(j => j.joueur)" :key="sel.id">
                <td style="font-weight:600">{{ sel.joueur?.prenom }} {{ sel.joueur?.nom }}</td>
                <td><span class="poste-badge">{{ posteLabel(sel.joueur?.poste_principal ?? '') }}</span></td>
                <td class="text-sub">—</td>
                <td class="text-sub">—</td>
                <td class="text-sub">—</td>
                <td>
                  <span class="font-display" style="font-weight:700;font-size:1rem" :style="{color:scoreColor(sel.joueur?.score_ia ?? 50)}">
                    {{ sel.joueur?.score_ia }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="loading-state">
        <div class="spinner" /><span class="text-sub">Chargement…</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase, cloudinaryUrl } from '@/lib/supabaseClient'
import type { EquipeNationale, SelectionJoueur, MatchInternational } from '@/lib/database.types'

const equipes = ref<EquipeNationale[]>([])
const selected = ref<EquipeNationale | null>(null)
const selectedId = ref<string | null>(null)
const joueurs = ref<any[]>([])
const matchsInternationaux = ref<any[]>([])
const tab = ref<'roster' | 'matchs' | 'stats'>('roster')
const matchsKPI = ref<any[]>([])

const postes: Record<string, string> = {
  gardien:'Gardien', ailier_g:'Ailier G', ailier_d:'Ailier D',
  arriere_g:'Arrière G', arriere_d:'Arrière D', demi_centre:'Demi-Centre', pivot:'Pivot'
}
const posteLabel = (p: string) => postes[p] ?? p
const statutLabel = (s: string) => ({ preselectione:'Présélectionné', finaliste:'Finaliste', titulaire:'Titulaire' }[s] ?? s)
const statutColor = (s: string) => ({ preselectione:'p-badge-muted', finaliste:'p-badge-gold', titulaire:'p-badge-green' }[s] ?? 'p-badge-muted')
const getCatBadge = (c: string) => ({ senior:'p-badge-red', u20:'p-badge-gold', u17:'p-badge-blue', beach:'p-badge-green' }[c] ?? 'p-badge-muted')
const scoreColor = (s: number) => s >= 80 ? '#3BAA6A' : s >= 60 ? '#C4922A' : '#3A80BE'
const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })

async function selectEquipe(eq: EquipeNationale) {
  selected.value = eq
  selectedId.value = eq.id
  tab.value = 'roster'

  const [{ data: sels }, { data: matchs }] = await Promise.all([
    supabase.from('selections_joueurs')
      .select('*, joueur:joueurs(id,prenom,nom,poste_principal,score_ia,badge_talent,photo_cloudinary_id)')
      .eq('equipe_nationale_id', eq.id)
      .eq('saison', eq.saison_active)
      .order('statut'),
    supabase.from('matchs_internationaux')
      .select('*')
      .eq('equipe_nationale_id', eq.id)
      .order('date_match', { ascending: false })
  ])

  joueurs.value = sels ?? []
  matchsInternationaux.value = matchs ?? []

  // KPIs
  const termines = (matchs ?? []).filter(m => m.statut === 'termine')
  const victoires = termines.filter(m => (m.score_cam ?? 0) > (m.score_adv ?? 0)).length
  const defaites  = termines.filter(m => (m.score_cam ?? 0) < (m.score_adv ?? 0)).length
  const nuls      = termines.filter(m => (m.score_cam ?? 0) === (m.score_adv ?? 0)).length
  matchsKPI.value = termines.length ? [
    { label:'Victoires',   value: victoires, color:'text-green' },
    { label:'Nuls',        value: nuls,      color:'text-sub' },
    { label:'Défaites',    value: defaites,  color:'text-red' },
    { label:'Matchs joués',value: termines.length, color:'' },
  ] : []
}

onMounted(async () => {
  const { data } = await supabase.from('equipes_nationales').select('*').order('categorie')
  equipes.value = data ?? []
  if (equipes.value.length) selectEquipe(equipes.value[0])
})
</script>

<style scoped>
.national-hero { background:var(--p-card); border-bottom:1px solid var(--p-border); padding:40px 0; }
.cam-stripe { height:5px; background:linear-gradient(to right, var(--cam-green) 33.3%, var(--cam-red) 33.3% 66.6%, var(--cam-yellow) 66.6%); }
.hero-inner { display:flex; justify-content:space-between; align-items:center; padding:16px 0; }
.hero-title { font-size:2.4rem; font-weight:700; margin-bottom:12px; }
.hero-sub { font-size:15px; }
.cam-emblem { font-size:4rem; opacity:0.8; }

.equipe-tabs { display:flex; gap:12px; margin-bottom:32px; flex-wrap:wrap; }
.equipe-tab { padding:16px 20px; cursor:pointer; display:flex; flex-direction:column; gap:6px; min-width:200px; transition:border-color 150ms; }
.equipe-tab.active { border-color:var(--cam-green,#007A5E); }
.eq-nom { font-weight:700; font-size:14px; }
.eq-saison { font-size:12px; }

.kpi-row { display:flex; gap:16px; flex-wrap:wrap; margin-bottom:8px; }
.kpi-card { padding:20px 24px; text-align:center; min-width:120px; flex:1; display:flex; flex-direction:column; gap:4px; }
.kpi-value { font-size:2rem; font-weight:700; }
.kpi-label { font-size:12px; text-transform:uppercase; letter-spacing:.05em; }

.roster-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:12px; }
.roster-card { display:flex; align-items:center; gap:14px; padding:14px 16px; }
.roster-avatar { width:52px;height:52px;border-radius:50%;overflow:hidden;background:var(--p-bg3);display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.roster-avatar img { width:100%;height:100%;object-fit:cover; }
.roster-initials { font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:var(--p-red); }
.roster-info { flex:1; }
.roster-name { font-weight:700;font-size:14px;margin:2px 0; }
.roster-poste { font-size:12px; }
.roster-score { display:flex;flex-direction:column;align-items:center;flex-shrink:0; }
.poste-badge { padding:2px 7px;border-radius:99px;background:rgba(140,21,37,.1);color:var(--p-red);font-size:11px;font-weight:600; }
.loading-state,.empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 0;color:var(--p-sub); }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
