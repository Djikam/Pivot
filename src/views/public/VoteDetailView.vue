<template>
  <div v-if="session" class="p-container" style="padding-top:40px;padding-bottom:60px;max-width:700px">
    <RouterLink to="/votes" class="p-btn-ghost p-btn-sm" style="margin-bottom:24px;display:inline-flex"> PULSE</RouterLink>
    <div class="p-card" style="padding:28px">
      <span class="p-badge" :class="session.statut==='actif'?'p-badge-live':'p-badge-muted'" style="margin-bottom:12px">{{ session.statut==='actif'?'ACTIF':'TERMINÉ' }}</span>
      <h1 class="font-display" style="font-size:1.8rem;font-weight:700;margin:10px 0 6px">{{ session.titre }}</h1>
      <div class="text-sub" style="font-size:13px;margin-bottom:24px">{{ formatDate(session.date_debut) }}  {{ formatDate(session.date_fin) }}</div>
      <KenteDivider :my="0" />
      <div style="margin-top:20px">
        <div v-for="c in candidats" :key="c.id" class="candidat-row p-card" style="padding:14px;margin-bottom:8px;display:flex;align-items:center;gap:14px">
          <RouterLink :to="'/joueurs/'+c.joueur_id" style="flex:1;font-weight:700">{{ c.joueur?.prenom }} {{ c.joueur?.nom }}</RouterLink>
          <div class="vote-bar-wrap" style="flex:1;height:8px;background:var(--p-bg3);border-radius:4px;overflow:hidden">
            <div :style="{width:pct(c.nb_votes)+'%',height:'100%',background:'var(--p-red)',borderRadius:'4px',transition:'width .6s ease'}" />
          </div>
          <span class="font-display" style="font-weight:700;color:var(--p-red);min-width:30px;text-align:right">{{ c.nb_votes }}</span>
          <button v-if="session.statut==='actif'" class="p-btn-red p-btn-sm" @click="voter(c.id)" :disabled="voted===c.id">{{ voted===c.id?' Voté':'Voter' }}</button>
        </div>
        <div v-if="candidats.length===0" class="text-sub" style="padding:20px;text-align:center">Aucun candidat encore ajouté.</div>
      </div>
    </div>
  </div>
  <div v-else class="loading-state p-container" style="padding:80px 0"><div class="spinner" /></div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import KenteDivider from '@/components/KenteDivider.vue'
const route = useRoute()
const session = ref<any>(null)
const candidats = ref<any[]>([])
const voted = ref<string|null>(null)
const maxVotes = ref(1)
const formatDate = (d:string) => new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})
const pct = (n:number) => maxVotes.value ? Math.round(n/maxVotes.value*100) : 0

async function voter(candidatId:string) {
  voted.value = candidatId
  await supabase.rpc('incrementer_vote', { p_candidat_id: candidatId }).catch(() => {})
  // Optimistic
  const c = candidats.value.find(x=>x.id===candidatId)
  if (c) { c.nb_votes++; maxVotes.value = Math.max(...candidats.value.map(x=>x.nb_votes)) }
}

onMounted(async () => {
  const id = route.params.id as string
  const [{ data: s }, { data: c }] = await Promise.all([
    supabase.from('sessions_vote').select('*').eq('id', id).single(),
    supabase.from('sessions_vote_candidats').select('*, joueur:joueurs(prenom,nom)').eq('session_id', id).order('nb_votes',{ascending:false}),
  ])
  session.value=s; candidats.value=c??[]
  maxVotes.value = c?.length ? Math.max(...(c.map((x:any)=>x.nb_votes))) : 1
})
</script>
<style scoped>
.loading-state { display:flex;justify-content:center;padding:80px 0; }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
