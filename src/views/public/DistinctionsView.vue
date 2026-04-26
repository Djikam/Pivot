<template><div><section class="p-hero" style="padding:36px 0 28px"><div class="p-container"><h1 class="font-display" style="font-size:2.2rem;font-weight:700;margin-bottom:6px">Distinctions</h1><p class="text-sub">Trophées, MVP, meilleurs joueurs par période</p></div></section><div class="p-container" style="padding-top:24px;padding-bottom:60px"><div v-if="loading" class="loading-state"><div class="spinner" /></div><div v-else class="dist-grid"><div v-for="d in distinctions" :key="d.id" class="dist-card p-card"><span class="dist-icon"><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg></span><div class="dist-type">{{ d.type }}</div><div class="text-sub" style="font-size:12px">{{ d.saison }}{{ d.periode ? ' · '+d.periode : '' }}</div><RouterLink v-if="d.joueur" :to="'/joueurs/'+d.joueur_id" class="dist-joueur">{{ d.joueur?.prenom }} {{ d.joueur?.nom }}</RouterLink></div></div></div></div></template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
const distinctions = ref<any[]>([])
const loading = ref(true)
onMounted(async () => { const { data } = await supabase.from('distinctions').select('*, joueur:joueurs(prenom,nom), club:clubs(nom)').order('saison',{ascending:false}).order('created_at',{ascending:false}); distinctions.value=data??[]; loading.value=false })
</script>
<style scoped>
.dist-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px; }
.dist-card { padding:20px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center; }
.dist-icon { font-size:2.2rem; }
.dist-type { font-weight:700;font-size:15px; }
.dist-joueur { color:var(--p-gold);font-weight:600;font-size:13px; }
.loading-state { display:flex;justify-content:center;padding:60px 0; }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
