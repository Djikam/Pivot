<template>
  <div>
    <div class="alerts-header">
      <h3 class="font-display" style="font-size:1.2rem;font-weight:700">Alertes système</h3>
      <div class="alerts-counts">
        <span v-if="selfReports.length" class="p-badge p-badge-live">{{ selfReports.length }} Self-Reports</span>
        <span v-if="cartonsBleu.length" class="p-badge" style="background:rgba(138,122,255,.15);color:#8A7AFF">{{ cartonsBleu.length }} Cartons bleus</span>
        <span v-if="suspicions.length" class="p-badge p-badge-red">{{ suspicions.length }} Suspicions</span>
      </div>
    </div>

    <!-- SELF-REPORTS avec analyse IA -->
    <div class="p-card alerte-block" v-if="selfReports.length">
      <h4 class="alerte-title">🆕 Demandes Self-Report en attente ({{ selfReports.length }})</h4>
      <div v-for="a in selfReports" :key="a.id" class="self-report-card">
        <div class="sr-header">
          <span class="p-badge" :class="typeBadge(a.source?.type_profil)">{{ a.source?.type_profil ?? '—' }}</span>
          <span class="font-display" style="font-weight:700;font-size:1rem">{{ a.titre }}</span>
          <span class="text-sub" style="font-size:11px">{{ fd(a.created_at) }}</span>
        </div>
        <div class="sr-body">
          <div class="sr-contact text-sub">{{ a.contenu }}</div>
          <!-- Analyse IA similarité -->
          <div v-if="a.ia_analyse" class="ia-analysis">
            <div class="ia-badge" :class="a.ia_score >= 0.8 ? 'ia-high' : a.ia_score >= 0.5 ? 'ia-medium' : 'ia-low'">
              🤖 IA: {{ a.ia_analyse.verdict }}
            </div>
            <div v-if="a.ia_analyse.doublon" class="ia-doublon">
              ⚠️ Doublon potentiel: 
              <RouterLink :to="'/joueurs/'+a.ia_analyse.doublon_id" class="text-red" style="font-weight:700">
                {{ a.ia_analyse.doublon_nom }}
              </RouterLink>
              ({{ Math.round((a.ia_score??0)*100) }}% de similarité)
            </div>
            <div v-if="a.ia_analyse.suggestion" class="text-sub" style="font-size:12px;margin-top:4px">
              💡 {{ a.ia_analyse.suggestion }}
            </div>
          </div>
          <div v-else class="ia-pending text-sub">
            <span v-if="analysing===a.id">⏳ Analyse IA en cours…</span>
            <button v-else class="p-btn-ghost p-btn-sm" @click="analyserIA(a)">🤖 Analyser avec IA</button>
          </div>
        </div>
        <div class="sr-actions">
          <RouterLink :to="'/admin/validation'" class="p-btn-ghost p-btn-sm">Voir détail →</RouterLink>
          <button class="p-btn-ghost p-btn-sm" style="color:var(--p-green)" @click="traiterAlerte(a.id,'traite')">✓ Traité</button>
          <button class="p-btn-ghost p-btn-sm btn-danger" @click="traiterAlerte(a.id,'rejete')">✕ Rejeter</button>
        </div>
      </div>
    </div>

    <!-- CARTONS BLEUS -->
    <div class="p-card alerte-block" v-if="cartonsBleu.length">
      <h4 class="alerte-title" style="color:#8A7AFF">🔵 Cartons bleus — Rapports en attente ({{ cartonsBleu.length }})</h4>
      <table class="p-table">
        <thead><tr><th>Joueur</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>
          <tr v-for="d in cartonsBleu" :key="d.id">
            <td style="font-weight:600"><RouterLink :to="'/joueurs/'+d.joueur_id">{{ d.joueur?.prenom }} {{ d.joueur?.nom }}</RouterLink></td>
            <td class="text-sub" style="font-size:12px">{{ fd(d.created_at) }}</td>
            <td><button class="p-btn-ghost p-btn-sm" @click="marquer(d.id)">Marquer envoyé</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- SUSPICIONS TRANSFERTS -->
    <div class="p-card alerte-block" v-if="suspicions.length">
      <h4 class="alerte-title" style="color:var(--p-red)">🎯 Suspicions RADAR ({{ suspicions.length }})</h4>
      <table class="p-table">
        <thead><tr><th>Joueur</th><th>Origine</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="t in suspicions" :key="t.id">
            <td style="font-weight:600">{{ t.joueur?.prenom }} {{ t.joueur?.nom }}</td>
            <td class="text-sub">{{ (t.club_origine as any)?.nom ?? '—' }}</td>
            <td class="text-sub" style="font-size:12px">{{ fd(t.created_at) }}</td>
            <td style="display:flex;gap:6px;flex-wrap:wrap">
              <button class="p-btn-red p-btn-sm" @click="upgradeTransfert(t.id,2)">→ Rumeur</button>
              <button class="p-btn-ghost p-btn-sm btn-danger" @click="supprimerTransfert(t.id)">Suppr.</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Rien à traiter -->
    <div v-if="!selfReports.length && !cartonsBleu.length && !suspicions.length" class="empty-state">
      <span>✅</span><p>Aucune alerte en attente.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { callIA, callIAJson } from '@/lib/iaClient'

const selfReports = ref<any[]>([])
const cartonsBleu = ref<any[]>([])
const suspicions  = ref<any[]>([])
const analysing   = ref<string|null>(null)

const fd = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })
const typeBadge = (t: string) => ({ JOUEUR:'p-badge-blue', COACH:'p-badge-gold', PRESIDENT:'p-badge-muted' }[t ?? ''] ?? 'p-badge-muted')

async function analyserIA(alerte: any) {
  analysing.value = alerte.id
  try {
    // Récupérer le profil source
    const { data: profil } = await supabase.from('collecte_profils').select('*').eq('id', alerte.source_id).single()
    if (!profil) return

    // Chercher des doublons potentiels dans la BD
    const { data: similaires } = await supabase.from('joueurs')
      .select('id, prenom, nom, poste_principal')
      .ilike('nom', `%${profil.nom.split(' ')[0]}%`)
      .limit(5)

    // Appel IA pour analyse
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ia-proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY??'' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Tu es un assistant pour PIVOT, plateforme handball Cameroun.
Analyse cette demande self-report:
- Nom: ${profil.prenom} ${profil.nom}
- Type: ${profil.type_profil}
- Email: ${profil.email}
- Détails: ${JSON.stringify(profil.details_techniques)}

Joueurs similaires en BD: ${JSON.stringify(similaires)}

Réponds UNIQUEMENT en JSON valide:
{"verdict":"NOUVEAU|DOUBLON_PROBABLE|DOUBLON_CERTAIN","doublon":false,"doublon_id":null,"doublon_nom":null,"suggestion":"...","score":0.0}`
        }]
      })
    })
    const data = await response.json()
    const text = data.content?.[0]?.text ?? '{}'
    let analyse: any = {}
    try { analyse = JSON.parse(text.replace(/```json?|```/g, '').trim()) } catch { analyse = { verdict: 'ANALYSE_ÉCHOUÉE', suggestion: text.slice(0, 200) } }

    // Mettre à jour l'alerte avec l'analyse IA
    await supabase.from('alertes').update({
      ia_analyse: analyse,
      ia_score: analyse.score ?? 0
    }).eq('id', alerte.id)

    // Rafraîchir
    load()
  } finally {
    analysing.value = null
  }
}

async function traiterAlerte(id: string, statut: string) {
  await supabase.from('alertes').update({ statut }).eq('id', id)
  // Mettre à jour collecte_profils aussi
  const a = selfReports.value.find(x => x.id === id)
  if (a?.source_id) {
    await supabase.from('collecte_profils').update({ statut: statut === 'traite' ? 'VALIDE' : 'REJETE' }).eq('id', a.source_id)
  }
  load()
}

async function marquer(id: string) {
  await supabase.from('discipline').update({ rapport_envoye: true }).eq('id', id)
  cartonsBleu.value = cartonsBleu.value.filter(d => d.id !== id)
}

async function upgradeTransfert(id: string, fiabilite: number) {
  await supabase.from('transferts').update({ fiabilite }).eq('id', id)
  load()
}

async function supprimerTransfert(id: string) {
  if (!confirm('Supprimer cette suspicion ?')) return
  await supabase.from('transferts').delete().eq('id', id)
  load()
}

async function load() {
  const [{ data: al }, { data: cb }, { data: sp }] = await Promise.all([
    supabase.from('alertes')
      .select('*')
      .eq('statut', 'non_lu')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('discipline')
      .select('*, joueur:joueurs(prenom,nom)')
      .eq('type', 'carton_bleu')
      .eq('rapport_envoye', false)
      .limit(10),
    supabase.from('transferts')
      .select('*, joueur:joueurs(prenom,nom), club_origine:clubs!transferts_club_origine_id_fkey(nom)')
      .eq('fiabilite', 1)
      .limit(10),
  ])

  // Enrichir les alertes avec le profil source
  const alertesEnrichies = []
  for (const a of (al ?? [])) {
    let source = null
    if (a.source_table === 'collecte_profils' && a.source_id) {
      const { data: p } = await supabase.from('collecte_profils').select('type_profil,prenom,nom,email').eq('id', a.source_id).single()
      source = p
    }
    alertesEnrichies.push({ ...a, source })
  }

  selfReports.value = alertesEnrichies
  cartonsBleu.value = cb ?? []
  suspicions.value  = sp ?? []
}

onMounted(load)
</script>

<style scoped>
.alerts-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px }
.alerts-counts { display:flex;gap:8px;flex-wrap:wrap }
.alerte-block { margin-bottom:20px;padding:16px 20px }
.alerte-title { font-weight:700;margin-bottom:14px;font-family:var(--font-display) }
.self-report-card { border:1px solid var(--p-border);border-radius:10px;padding:14px;margin-bottom:12px }
.sr-header { display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap }
.sr-body { margin-bottom:10px }
.sr-contact { font-size:13px;margin-bottom:8px }
.sr-actions { display:flex;gap:8px;flex-wrap:wrap }
.ia-analysis { padding:8px 12px;border-radius:8px;background:rgba(59,130,246,.07);margin-bottom:8px }
.ia-badge { font-size:12px;font-weight:600;margin-bottom:4px }
.ia-high { color:#22c55e } .ia-medium { color:var(--p-gold) } .ia-low { color:var(--p-sub) }
.ia-doublon { font-size:13px;color:var(--p-red);margin-top:4px }
.ia-pending { font-size:12px }
.btn-danger { color:var(--p-red) }
.empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 0;color:var(--p-sub) }
.empty-state span { font-size:2.5rem }
</style>
