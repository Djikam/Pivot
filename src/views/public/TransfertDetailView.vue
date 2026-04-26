<template>
  <div v-if="transfert" class="p-container" style="padding-top:40px;padding-bottom:60px;max-width:700px">
    <RouterLink to="/transferts" class="p-btn-ghost p-btn-sm" style="margin-bottom:24px;display:inline-flex"> RADAR</RouterLink>
    <div class="p-card" style="padding:28px">
      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
        <span class="p-badge" :class="fiabiliteColor(transfert.fiabilite)">{{ fiabiliteLabel(transfert.fiabilite) }}</span>
        <span class="p-badge p-badge-muted">{{ transfert.type }}</span>
      </div>
      <h1 class="font-display" style="font-size:1.8rem;font-weight:700;margin-bottom:12px">
        <RouterLink :to="'/joueurs/'+transfert.joueur_id" style="color:var(--p-text)">{{ transfert.joueur?.prenom }} {{ transfert.joueur?.nom }}</RouterLink>
      </h1>
      <div style="display:flex;align-items:center;gap:14px;font-size:16px;margin-bottom:20px">
        <span class="text-sub">{{ transfert.club_origine?.nom ?? 'Inconnu' }}</span>
        <span style="color:var(--p-red);font-weight:700;font-size:1.4rem"></span>
        <span style="font-weight:700">{{ transfert.club_destination?.nom ?? 'Inconnu' }}</span>
      </div>
      <div v-if="transfert.motif" class="text-sub" style="font-size:14px;font-style:italic;margin-bottom:16px">{{ transfert.motif }}</div>
      <div class="text-sub" style="font-size:12px">Enregistré le {{ formatDate(transfert.created_at) }}</div>
      <div v-if="transfert.source" class="text-sub" style="font-size:12px;margin-top:4px">Source : {{ transfert.source }}</div>
    </div>
  </div>
  <div v-else class="loading-state p-container" style="padding:80px 0"><div class="spinner" /></div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
const route = useRoute()
const transfert = ref<any>(null)
const fiabiliteLabel = (n:number) => ['','Suspicion','Rumeur','Officieux','Confirmé'][n]
const fiabiliteColor = (n:number) => ['','p-badge-red','p-badge-gold','p-badge-blue','p-badge-green'][n]
const formatDate = (d:string) => new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})
onMounted(async () => { const { data } = await supabase.from('transferts').select('*, joueur:joueurs(prenom,nom,poste_principal), club_origine:clubs!transferts_club_origine_id_fkey(nom), club_destination:clubs!transferts_club_destination_id_fkey(nom)').eq('id', route.params.id).single(); transfert.value=data })
</script>
<style scoped>
.loading-state { display:flex;justify-content:center;padding:80px 0; }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
