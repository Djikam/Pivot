<template>
  <div>
    <section class="p-hero" style="padding:36px 0 28px">
      <div class="p-container">
        <h1 class="font-display" style="font-size:2.2rem;font-weight:700;margin-bottom:6px">SCOPE — Statistiques</h1>
        <p class="text-sub">Performances individuelles — Score IA, tops, distinctions</p>
      </div>
    </section>
    <div class="p-container" style="padding-top:24px;padding-bottom:60px">
      <div class="stats-tabs">
        <button v-for="t in tabs" :key="t.value" class="stats-tab" :class="{active:tab===t.value}" @click="tab=t.value">{{ t.label }}</button>
      </div>
      <KenteDivider :my="20" />
      <!-- Top Buteurs -->
      <div v-if="tab==='buteurs'">
        <div v-if="loading" class="loading-state"><div class="spinner" /></div>
        <div v-else>
          <!-- Podium top 3 -->
          <div class="podium" v-if="buteurs.length >= 3">
            <div v-for="(b, i) in buteurs.slice(0,3)" :key="b.id" class="podium-step" :class="'rank-'+(i+1)">
              <RouterLink :to="'/joueurs/'+b.joueur_id" class="podium-avatar">{{ b.joueur?.prenom?.[0] }}{{ b.joueur?.nom?.[0] }}</RouterLink>
              <div class="podium-name">{{ b.joueur?.prenom }} {{ b.joueur?.nom }}</div>
              <div class="podium-buts font-display">{{ b.total_buts }} <span style="font-size:12px">buts</span></div>
              <div class="podium-bar" />
              <div class="podium-rank">{{ i+1 === 1 ? '<svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z\"></path></svg>' : i+1 === 2 ? '<svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z\"></path></svg>' : '<svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z\"></path></svg>' }}</div>
            </div>
          </div>
          <table class="p-table" style="margin-top:20px">
            <thead><tr><th>#</th><th>Joueur</th><th>Club</th><th>Poste</th><th>Buts</th><th>Matchs</th><th>Moy.</th><th>Score IA</th></tr></thead>
            <tbody>
              <tr v-for="(b, i) in buteurs" :key="b.id" :class="i < 3 ? 'rank-'+(i+1) : ''">
                <td class="font-display text-sub" style="font-size:1.1rem">{{ i+1 }}</td>
                <td><RouterLink :to="'/joueurs/'+b.joueur_id" style="font-weight:700">{{ b.joueur?.prenom }} {{ b.joueur?.nom }}</RouterLink></td>
                <td class="text-sub" style="font-size:12px">{{ b.club_nom ?? '—' }}</td>
                <td><span class="poste-badge">{{ posteLabel(b.joueur?.poste_principal) }}</span></td>
                <td class="font-display" style="font-weight:700;color:var(--p-red);font-size:1.1rem">{{ b.total_buts }}</td>
                <td class="text-sub">{{ b.matchs_joues }}</td>
                <td class="text-sub">{{ b.matchs_joues ? (b.total_buts/b.matchs_joues).toFixed(1) : '—' }}</td>
                <td><span class="font-display" style="font-weight:700" :style="{color:scoreColor(b.joueur?.score_ia)}">{{ b.joueur?.score_ia }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- Top Gardiens -->
      <div v-if="tab==='gardiens'" class="text-sub" style="padding:40px;text-align:center">Statistiques gardiens à venir (après saisie des données matchs).</div>
      <!-- Fair-Play -->
      <div v-if="tab==='fairplay'">
        <p class="text-sub" style="margin-bottom:16px;font-size:13px">Score Fair-Play : plus bas = meilleur. Calculé sur avert.×0.5 + jaune×1 + susp.×2 + rouge×5 + bleu×10</p>
        <table class="p-table">
          <thead><tr><th>#</th><th>Joueur</th><th>Avert.</th><th>Jaune</th><th>2 min</th><th>Rouge</th><th>Bleu</th><th>Score FP</th></tr></thead>
          <tbody>
            <tr v-for="(j, i) in fairplay" :key="j.id">
              <td class="text-sub">{{ i+1 }}</td>
              <td><RouterLink :to="'/joueurs/'+j.joueur_id" style="font-weight:600">{{ j.joueur?.prenom }} {{ j.joueur?.nom }}</RouterLink></td>
              <td>{{ j.nb_avert }}</td><td>{{ j.nb_jaune }}</td><td>{{ j.nb_susp }}</td><td>{{ j.nb_rouge }}</td><td>{{ j.nb_bleu }}</td>
              <td class="font-display" style="font-weight:700" :style="{color: j.score_fp < 5 ? 'var(--p-green)' : j.score_fp < 15 ? 'var(--p-gold)' : 'var(--p-red)'}">{{ j.score_fp.toFixed(1) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import KenteDivider from '@/components/KenteDivider.vue'

const tab = ref('buteurs')
const tabs = [
  { value:'buteurs', label:'Top Buteurs' },
  { value:'gardiens', label:'Top Gardiens' },
  { value:'fairplay', label:'Fair-Play' },
]
const buteurs = ref<any[]>([])
const fairplay = ref<any[]>([])
const loading = ref(false)
const postes: Record<string,string> = { gardien:'Gardien', ailier_g:'Ailier G', ailier_d:'Ailier D', arriere_g:'Arrière G', arriere_d:'Arrière D', demi_centre:'D-C', pivot:'Pivot' }
const posteLabel = (p:string) => postes[p] ?? p
const scoreColor = (s:number) => s >= 80 ? '#3BAA6A' : s >= 60 ? '#C4922A' : '#3A80BE'

async function loadButeurs() {
  loading.value = true
  // Agréger buts par joueur
  const { data: b } = await supabase.from('buts').select('joueur_id, match_id').order('joueur_id')
  const map = new Map<string, {total:number; matchs:Set<string>}>()
  for (const row of (b ?? [])) {
    if (!map.has(row.joueur_id)) map.set(row.joueur_id, { total:0, matchs:new Set() })
    const e = map.get(row.joueur_id)!; e.total++; e.matchs.add(row.match_id)
  }
  const sorted = [...map.entries()].sort((a,b) => b[1].total - a[1].total).slice(0, 30)
  if (!sorted.length) { buteurs.value = []; loading.value = false; return }
  const ids = sorted.map(([id]) => id)
  const { data: joueurs } = await supabase.from('joueurs').select('id,prenom,nom,poste_principal,score_ia').in('id', ids)
  buteurs.value = sorted.map(([joueur_id, stats]) => ({
    joueur_id, total_buts: stats.total, matchs_joues: stats.matchs.size,
    joueur: joueurs?.find(j => j.id === joueur_id)
  }))
  loading.value = false
}

async function loadFairplay() {
  const { data } = await supabase.from('discipline').select('joueur_id, type')
  const map = new Map<string,any>()
  for (const d of (data ?? [])) {
    if (!map.has(d.joueur_id)) map.set(d.joueur_id, { joueur_id:d.joueur_id, nb_avert:0,nb_jaune:0,nb_susp:0,nb_rouge:0,nb_bleu:0 })
    const e = map.get(d.joueur_id)!
    if (d.type==='avertissement') e.nb_avert++
    if (d.type==='carton_jaune') e.nb_jaune++
    if (d.type==='suspension_2min') e.nb_susp++
    if (d.type==='carton_rouge') e.nb_rouge++
    if (d.type==='carton_bleu') e.nb_bleu++
  }
  const sorted = [...map.values()].map(e => ({ ...e, score_fp: e.nb_avert*.5+e.nb_jaune*1+e.nb_susp*2+e.nb_rouge*5+e.nb_bleu*10 })).sort((a,b)=>a.score_fp-b.score_fp).slice(0,30)
  if (!sorted.length) { fairplay.value=[]; return }
  const { data: joueurs } = await supabase.from('joueurs').select('id,prenom,nom').in('id', sorted.map(x=>x.joueur_id))
  fairplay.value = sorted.map(e => ({ ...e, joueur: joueurs?.find(j=>j.id===e.joueur_id) }))
}

watch(tab, (v) => { if(v==='buteurs') loadButeurs(); if(v==='fairplay') loadFairplay() })
onMounted(loadButeurs)
</script>

<style scoped>
.stats-tabs { display:flex;gap:8px; }
.stats-tab { padding:8px 16px;border-radius:8px;border:1px solid var(--p-border);cursor:pointer;font-size:13px;background:transparent;color:var(--p-sub);transition:all 150ms; }
.stats-tab.active { border-color:var(--p-red);background:rgba(140,21,37,.1);color:var(--p-red); }
.podium { display:flex;align-items:flex-end;justify-content:center;gap:20px;padding:20px 0 0; }
.podium-step { display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center; }
.podium-avatar { width:52px;height:52px;border-radius:50%;background:var(--p-bg3);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:var(--p-red); }
.podium-name { font-size:12px;font-weight:600;max-width:80px; }
.podium-buts { color:var(--p-red);font-size:1.2rem;font-weight:700; }
.podium-bar { width:60px;border-radius:4px 4px 0 0; }
.rank-1 .podium-bar { height:80px;background:var(--p-gold); }
.rank-2 .podium-bar { height:55px;background:#8A8A9A; }
.rank-3 .podium-bar { height:38px;background:#8A5A2A; }
.podium-rank { font-size:1.4rem; }
.poste-badge { padding:2px 7px;border-radius:99px;background:rgba(140,21,37,.1);color:var(--p-red);font-size:11px;font-weight:600; }
.loading-state { display:flex;justify-content:center;padding:60px 0; }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
