<template><div><section class="p-hero" style="padding:36px 0 28px"><div class="p-container"><h1 class="font-display" style="font-size:2.2rem;font-weight:700;margin-bottom:6px">Classements</h1><p class="text-sub">Classements de toutes les phases de compétitions</p></div></section><div class="p-container" style="padding-top:24px;padding-bottom:60px"><div v-if="loading" class="loading-state"><div class="spinner" /></div><div v-else><div v-for="comp in competitions" :key="comp.id" class="comp-block"><div class="comp-title font-display">{{ comp.nom }}</div><RouterLink :to="'/competitions/'+comp.slug" class="p-btn-ghost p-btn-sm" style="margin-bottom:12px;display:inline-flex">Voir détail →</RouterLink></div></div></div></div></template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
const competitions = ref<any[]>([])
const loading = ref(true)
onMounted(async () => { const { data } = await supabase.from('competitions').select('id,nom,slug,statut').in('statut',['en_cours','termine']).order('saison',{ascending:false}); competitions.value = data??[]; loading.value=false })
</script>
<style scoped>
.comp-block { margin-bottom:24px;padding:16px;border:1px solid var(--p-border);border-radius:12px; }
.comp-title { font-size:1.1rem;font-weight:700;margin-bottom:8px; }
.loading-state { display:flex;justify-content:center;padding:60px 0; }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
