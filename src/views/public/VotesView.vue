<template>
  <div>
    <section class="p-hero adinkra-watermark" style="padding:40px 0 32px">
      <div class="p-container">
        <h1 class="font-display" style="font-size:2.2rem;font-weight:700;margin-bottom:6px">PULSE — Votes</h1>
        <p class="text-sub">Votez pour les meilleurs joueurs du handball camerounais — <strong style="color:var(--p-gold)">100% gratuit</strong></p>
      </div>
    </section>
    <div class="p-container" style="padding-top:28px;padding-bottom:60px">
      <div v-if="loading" class="loading-state"><div class="spinner" /></div>
      <div v-else>
        <div v-if="sessionsActives.length" class="sessions-section">
          <h2 class="font-display" style="font-size:1.3rem;font-weight:700;margin-bottom:16px">🔥 Votes en cours</h2>
          <div class="sessions-grid">
            <RouterLink v-for="s in sessionsActives" :key="s.id" :to="'/votes/'+s.id" class="session-card p-card">
              <span class="p-badge p-badge-live" style="align-self:flex-start">ACTIF</span>
              <h3 class="session-titre font-display">{{ s.titre }}</h3>
              <div class="session-meta text-sub">Se termine le {{ formatDate(s.date_fin) }}</div>
              <div class="session-gratuit p-badge p-badge-green">Gratuit</div>
            </RouterLink>
          </div>
        </div>
        <div v-if="sessionsTerminees.length" style="margin-top:32px">
          <h2 class="font-display" style="font-size:1.3rem;font-weight:700;margin-bottom:16px">Résultats passés</h2>
          <div class="sessions-grid">
            <RouterLink v-for="s in sessionsTerminees" :key="s.id" :to="'/votes/'+s.id" class="session-card p-card" style="opacity:.7">
              <span class="p-badge p-badge-muted">Terminé</span>
              <h3 class="session-titre font-display">{{ s.titre }}</h3>
              <div class="session-meta text-sub">{{ formatDate(s.date_debut) }} — {{ formatDate(s.date_fin) }}</div>
            </RouterLink>
          </div>
        </div>
        <div v-if="!sessionsActives.length && !sessionsTerminees.length" class="empty-state">
          <span style="font-size:2.5rem">❤️</span>
          <p>Aucun vote en cours. Revenez bientôt !</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const sessions = ref<any[]>([])
const loading = ref(true)
const sessionsActives   = computed(() => sessions.value.filter(s => s.statut === 'actif'))
const sessionsTerminees = computed(() => sessions.value.filter(s => s.statut === 'termine'))
const formatDate = (d:string) => new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})
onMounted(async () => { const { data } = await supabase.from('sessions_vote').select('*').in('statut',['actif','termine']).order('date_debut',{ascending:false}); sessions.value=data??[]; loading.value=false })
</script>

<style scoped>
.sessions-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px; }
.session-card { padding:20px;display:flex;flex-direction:column;gap:10px; }
.session-titre { font-size:1.2rem;font-weight:700; }
.session-meta { font-size:12px; }
.loading-state,.empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 0;color:var(--p-sub); }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
