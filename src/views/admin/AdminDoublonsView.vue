<template>
  <div class="admin-doublons">
    <!-- Toolbar -->
    <div class="admin-toolbar">
      <h2>Doublons potentiels</h2>
      <p class="text-sub">Joueurs avec plusieurs licences pour la même saison</p>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>
    <table v-else class="p-table">
      <thead><tr><th>Joueur</th><th>Saison</th><th>Nombre de licences</th><th>Licences</th><th>Actions</th></tr></thead>
      <tbody>
        <tr v-for="d in doublons" :key="`${d.joueur_id}-${d.saison}`">
          <td style="font-weight:600">{{ d.prenom }} {{ d.nom }}</td>
          <td>{{ d.saison }}</td>
          <td>{{ d.count }}</td>
          <td>
            <div v-for="l in d.licences" :key="l.id" class="text-sub">
              {{ l.club?.nom }} ({{ l.type_licence }})
            </div>
          </td>
          <td class="actions-cell">
            <button class="p-btn-ghost p-btn-sm" @click="viewDetails(d)">Détails</button>
            <button class="p-btn-red p-btn-sm" @click="fusionner(d)">Fusionner</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal détails -->
    <Teleport to="body">
      <div v-if="modalDetails" class="modal-backdrop" @click.self="modalDetails=null">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="font-display">Détails doublons — {{ selectedDoublon?.prenom }} {{ selectedDoublon?.nom }}</h3>
            <button @click="modalDetails=null">✕</button>
          </div>
          <div class="modal-body">
            <div v-for="l in selectedDoublon?.licences" :key="l.id" class="licence-detail">
              <strong>{{ l.club?.nom }}</strong> - {{ l.type_licence }} - Créée le {{ formatDate(l.created_at) }}
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const doublons = ref<any[]>([])
const loading = ref(true)
const modalDetails = ref(false)
const selectedDoublon = ref<any>(null)

const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR')

async function load() {
  loading.value = true
  // Charger toutes les licences avec joueurs et clubs
  const { data } = await supabase
    .from('licences_saison')
    .select(`
      id, joueur_id, saison, type_licence, created_at,
      joueur:joueur_id(prenom, nom),
      club:club_id(nom)
    `)
    .order('joueur_id', { ascending: false })
    .order('saison', { ascending: false })

  // Grouper par joueur_id et saison
  const grouped: Record<string, any[]> = {}
  data?.forEach((l: any) => {
    const key = `${l.joueur_id}-${l.saison}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(l)
  })

  // Filtrer ceux avec count > 1
  const processed = Object.values(grouped)
    .filter((licences: any[]) => licences.length > 1)
    .map((licences: any[]) => ({
      joueur_id: licences[0].joueur_id,
      saison: licences[0].saison,
      count: licences.length,
      prenom: licences[0].joueur?.prenom,
      nom: licences[0].joueur?.nom,
      licences
    }))
  
  doublons.value = processed
  loading.value = false
}

function viewDetails(d: any) {
  selectedDoublon.value = d
  modalDetails.value = true
}

async function fusionner(d: any) {
  if (confirm(`Fusionner les licences de ${d.prenom} ${d.nom} pour la saison ${d.saison} ? Cela gardera la licence la plus récente.`)) {
    // Trier par created_at desc, garder la première, supprimer les autres
    const sorted = d.licences.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const toKeep = sorted[0]
    const toDelete = sorted.slice(1)
    
    for (const l of toDelete) {
      await supabase.from('licences_saison').delete().eq('id', l.id)
    }
    
    load()
  }
}

onMounted(load)
</script>

<style scoped>
.admin-toolbar { margin-bottom:20px; }
.admin-toolbar h2 { margin:0; font-size:1.5rem; }
.admin-toolbar p { margin:4px 0 0; }
.licence-detail { padding:8px; border:1px solid var(--p-border); border-radius:6px; margin-bottom:8px; }
</style>