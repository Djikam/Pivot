<template>
  <div v-if="article" class="p-container" style="padding-top:40px;padding-bottom:60px;max-width:800px">
    <RouterLink to="/actualites" class="p-btn-ghost p-btn-sm" style="margin-bottom:24px;display:inline-flex">← Retour</RouterLink>
    <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
      <span class="p-badge p-badge-muted">{{ article.categorie }}</span>
      <span v-if="article.genere_par_ia" class="p-badge p-badge-blue">✨ IA {{ article.fournisseur_ia?.toUpperCase() }}</span>
    </div>
    <h1 class="font-display" style="font-size:2rem;font-weight:700;margin-bottom:10px">{{ article.titre }}</h1>
    <div class="text-sub" style="font-size:12px;margin-bottom:28px">{{ formatDate(article.publie_le) }}</div>
    <KenteDivider :my="0" />
    <div class="article-body" style="margin-top:24px;font-size:16px;line-height:1.8;white-space:pre-line">{{ article.contenu }}</div>
  </div>
  <div v-else class="loading-state p-container" style="padding:80px 0"><div class="spinner" /></div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import KenteDivider from '@/components/KenteDivider.vue'
const route = useRoute()
const article = ref<any>(null)
const formatDate = (d:string) => new Date(d).toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})
onMounted(async () => { const { data } = await supabase.from('articles').select('*').eq('slug', route.params.slug).single(); article.value = data })
</script>
<style scoped>
.loading-state { display:flex;justify-content:center;padding:80px 0; }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
