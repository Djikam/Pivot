<template>
  <div><section class="p-hero" style="padding:36px 0 28px"><div class="p-container"><h1 class="font-display" style="font-size:2.2rem;font-weight:700;margin-bottom:6px">Arbitres</h1><p class="text-sub">Corps arbitral du handball camerounais</p></div></section>
  <div class="p-container" style="padding-top:24px;padding-bottom:60px">
    <div v-if="loading" class="loading-state"><div class="spinner" /></div>
    <table v-else class="p-table"><thead><tr><th>Nom</th><th>Niveau</th><th>Région</th><th>Statut</th></tr></thead>
    <tbody><tr v-for="a in arbitres" :key="a.id"><td style="font-weight:600">{{ a.prenom }} {{ a.nom }}</td><td><span class="p-badge p-badge-muted">{{ a.niveau }}</span></td><td class="text-sub">{{ a.region }}</td><td><span v-if="a.verifie" class="p-badge p-badge-green">✓ Vérifié</span></td></tr></tbody></table>
  </div></div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
const arbitres = ref<any[]>([])
const loading = ref(true)
onMounted(async () => { const { data } = await supabase.from('arbitres').select('*').order('nom'); arbitres.value=data??[]; loading.value=false })
</script>
<style scoped>
.loading-state { display:flex;justify-content:center;padding:60px 0; }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
