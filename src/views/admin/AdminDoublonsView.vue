<template>
  <div class="admin-doublons">
    <div class="admin-toolbar">
      <div>
        <h3 class="font-display" style="font-size:1.1rem;font-weight:700">Détection de doublons</h3>
        <p class="text-sub" style="font-size:12px">Joueurs avec nom/prénom similaires ou plusieurs licences actives.</p>
      </div>
      <button class="p-btn-red" :disabled="scanLoading" @click="scannerIA">
        <span v-if="scanLoading">⏳ Scan en cours…</span>
        <span v-else> Scanner avec IA</span>
      </button>
    </div>

    <!-- Résultats scan IA -->
    <div v-if="iaClusters.length" class="ia-results">
      <div class="ia-header">
        <span> L'IA a détecté {{ iaClusters.length }} groupe(s) de doublons potentiels</span>
      </div>
      <div v-for="cluster in iaClusters" :key="cluster.id" class="cluster-card p-card">
        <div class="cluster-header">
          <span class="p-badge" :class="cluster.confiance >= 0.9 ? 'p-badge-red' : cluster.confiance >= 0.7 ? 'p-badge-gold' : 'p-badge-muted'">
            {{ Math.round(cluster.confiance*100) }}% similarité
          </span>
          <span class="cluster-raison text-sub">{{ cluster.raison }}</span>
        </div>
        <div class="cluster-joueurs">
          <div v-for="j in cluster.joueurs" :key="j.id" class="cluster-joueur">
            <RouterLink :to="'/joueurs/'+j.id" target="_blank" style="font-weight:700">
              {{ j.prenom }} {{ j.nom }}
            </RouterLink>
            <span class="text-sub" style="font-size:12px">{{ j.poste ?? '—' }} · Score IA: {{ j.score_ia }}</span>
            <span class="text-sub" style="font-size:11px">{{ j.club ?? 'Sans club' }}</span>
          </div>
        </div>
        <div class="cluster-actions">
          <button class="p-btn-red p-btn-sm" @click="fusionnerCluster(cluster)">
             Fusionner (garder le premier)
          </button>
          <button class="p-btn-ghost p-btn-sm" @click="ignorerCluster(cluster.id)">
            Ignorer
          </button>
        </div>
        <div v-if="cluster.merging" class="cluster-merging text-sub">Fusion en cours…</div>
        <div v-if="cluster.merged" class="cluster-merged"> Fusionné !</div>
      </div>
    </div>

    <!-- Doublons licences (plusieurs licences actives) -->
    <div class="section-block">
      <h4 class="section-title font-display"> Doublons de licences actives</h4>
      <div v-if="loading" class="loading-state"><div class="spinner" /></div>
      <div v-else-if="doublons.length === 0" class="empty-state">
        <span></span><p>Aucun doublon de licence détecté.</p>
      </div>
      <table v-else class="p-table">
        <thead><tr><th>Joueur</th><th>Saison</th><th>Nb licences</th><th>Clubs</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="d in doublons" :key="d.joueur_id+d.saison">
            <td><RouterLink :to="'/joueurs/'+d.joueur_id" style="font-weight:700">{{ d.prenom }} {{ d.nom }}</RouterLink></td>
            <td class="text-sub">{{ d.saison }}</td>
            <td class="font-display" style="font-weight:700;color:var(--p-red)">{{ d.count }}</td>
            <td class="text-sub" style="font-size:12px">{{ d.clubs?.join(', ') }}</td>
            <td>
              <button class="p-btn-ghost p-btn-sm" @click="garderSeulementPremier(d)">Garder 1ère licence</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { callIA, callIAJson } from '@/lib/iaClient'

const doublons   = ref<any[]>([])
const iaClusters = ref<any[]>([])
const loading    = ref(true)
const scanLoading = ref(false)

async function loadDoublons() {
  loading.value = true
  // Licences multiples actives pour le même joueur+saison
  const { data } = await supabase.from('licences_saison')
    .select('joueur_id, saison, club:clubs(nom)')
    .eq('actif', true)
  if (!data) { loading.value=false; return }

  const map = new Map<string, any>()
  for (const l of data) {
    const key = `${l.joueur_id}-${l.saison}`
    if (!map.has(key)) map.set(key, { joueur_id: l.joueur_id, saison: l.saison, count: 0, clubs: [] })
    const e = map.get(key)!
    e.count++
    e.clubs.push((l.club as any)?.nom ?? '?')
  }
  const multiples = [...map.values()].filter(e => e.count > 1)
  if (!multiples.length) { doublons.value = []; loading.value=false; return }

  const ids = multiples.map(e => e.joueur_id)
  const { data: joueurs } = await supabase.from('joueurs').select('id,prenom,nom').in('id', ids)
  doublons.value = multiples.map(e => ({
    ...e,
    prenom: joueurs?.find(j=>j.id===e.joueur_id)?.prenom ?? '?',
    nom:    joueurs?.find(j=>j.id===e.joueur_id)?.nom ?? '?',
  }))
  loading.value = false
}

async function scannerIA() {
  scanLoading.value = true
  try {
    // Récupérer tous les joueurs
    const { data: joueurs } = await supabase.from('joueurs')
      .select('id,prenom,nom,poste_principal,score_ia,licences_saison!inner(club:clubs(nom),actif)')
      .eq('licences_saison.actif', true)
      .limit(200)
    if (!joueurs?.length) return

    const payload = joueurs.map(j => ({
      id: j.id, prenom: j.prenom, nom: j.nom,
      poste: j.poste_principal, score_ia: j.score_ia,
      club: (j.licences_saison as any)?.[0]?.club?.nom ?? null
    }))

    const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ia-proxy`, {
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':import.meta.env.VITE_SUPABASE_ANON_KEY??''},
      body: JSON.stringify({
        model:'claude-sonnet-4-20250514', max_tokens:2000,
        messages:[{role:'user', content:
`Tu es un outil de déduplication pour PIVOT handball Cameroun.
Analyse cette liste de ${payload.length} joueurs et identifie les doublons probables.
Un doublon = même personne saisie 2x (noms similaires, inversion prénom/nom, fautes de frappe).

Données: ${JSON.stringify(payload)}

Réponds UNIQUEMENT en JSON valide:
[{"id":"uuid","confiance":0.95,"raison":"Explication","joueurs":[{"id":"...","prenom":"...","nom":"...","poste":"...","score_ia":N,"club":"..."},...]}]
Maximum 10 clusters. Ne retourner que les doublons certains (confiance >= 0.7).`}]
      })
    })
    const d = await r.json()
    const text = d.content?.[0]?.text ?? '[]'
    try {
      const parsed = JSON.parse(text.replace(/```json?|```/g,'').trim())
      iaClusters.value = (Array.isArray(parsed) ? parsed : []).map((c:any, i:number) => ({
        ...c, id: `cluster-${i}`, merged: false, merging: false
      }))
    } catch { iaClusters.value = [] }
  } finally { scanLoading.value = false }
}

async function fusionnerCluster(cluster: any) {
  if (!cluster.joueurs?.length >= 2) return
  if (!confirm(`Fusionner ces ${cluster.joueurs.length} joueurs ? Le premier sera conservé, les autres supprimés.`)) return
  cluster.merging = true
  const [keep, ...toDelete] = cluster.joueurs
  for (const j of toDelete) {
    // Transférer buts, sélections, licences vers le joueur conservé
    await supabase.from('buts').update({ joueur_id: keep.id }).eq('joueur_id', j.id)
    await supabase.from('selections_joueurs').update({ joueur_id: keep.id }).eq('joueur_id', j.id)
    await supabase.from('discipline').update({ joueur_id: keep.id }).eq('joueur_id', j.id)
    await supabase.from('distinctions').update({ joueur_id: keep.id }).eq('joueur_id', j.id)
    await supabase.from('transferts').update({ joueur_id: keep.id }).eq('joueur_id', j.id)
    await supabase.from('licences_saison').delete().eq('joueur_id', j.id)
    await supabase.from('joueurs').delete().eq('id', j.id)
  }
  cluster.merging = false; cluster.merged = true
  loadDoublons()
}

function ignorerCluster(id: string) {
  iaClusters.value = iaClusters.value.filter(c => c.id !== id)
}

async function garderSeulementPremier(d: any) {
  const { data: licences } = await supabase.from('licences_saison')
    .select('id').eq('joueur_id', d.joueur_id).eq('saison', d.saison).eq('actif', true)
    .order('created_at')
  if (!licences || licences.length <= 1) return
  const [, ...toDelete] = licences
  for (const l of toDelete) await supabase.from('licences_saison').delete().eq('id', l.id)
  loadDoublons()
}

onMounted(loadDoublons)
</script>

<style scoped>
.admin-toolbar { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;gap:10px }
.section-block { margin-bottom:24px }
.section-title { font-size:1.05rem;font-weight:700;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid var(--p-border) }
.ia-results { margin-bottom:24px }
.ia-header { padding:10px 14px;background:rgba(58,128,190,.08);border-radius:8px;margin-bottom:12px;font-size:13px;font-weight:600;color:var(--p-blue) }
.cluster-card { padding:16px;margin-bottom:12px }
.cluster-header { display:flex;align-items:center;gap:10px;margin-bottom:10px }
.cluster-raison { font-size:12px }
.cluster-joueurs { display:flex;flex-direction:column;gap:8px;margin-bottom:12px;padding:10px;background:var(--p-bg2);border-radius:8px }
.cluster-joueur { display:flex;align-items:center;gap:10px;font-size:13px;flex-wrap:wrap }
.cluster-actions { display:flex;gap:8px }
.cluster-merging,.cluster-merged { font-size:12px;margin-top:8px;color:var(--p-sub) }
.cluster-merged { color:var(--p-green) }
.loading-state { display:flex;justify-content:center;padding:40px 0 }
.spinner { width:28px;height:28px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin .7s linear infinite }
@keyframes spin { to{transform:rotate(360deg)} }
.empty-state { display:flex;flex-direction:column;align-items:center;gap:10px;padding:40px 0;color:var(--p-sub) }
.empty-state span { font-size:2rem }
</style>
