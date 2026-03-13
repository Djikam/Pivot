<template>
  <div>
    <section class="p-hero" style="padding:36px 0 28px">
      <div class="p-container">
        <h1 class="font-display" style="font-size:2.2rem;font-weight:700;margin-bottom:6px">FEED — Actualités</h1>
        <p class="text-sub">Résumés de matchs, transferts et nouvelles du handball camerounais — certains générés par IA Groq/Gemini</p>
      </div>
    </section>
    <div class="p-container" style="padding-top:24px;padding-bottom:60px">
      <div v-if="loading" class="loading-state"><div class="spinner" /></div>
      <div v-else class="articles-grid">
        <RouterLink v-for="a in articles" :key="a.id" :to="'/actualites/'+a.slug" class="article-card p-card">
          <div class="article-header">
            <span class="p-badge p-badge-muted">{{ a.categorie }}</span>
            <span v-if="a.genere_par_ia" class="p-badge p-badge-blue">✨ IA {{ a.fournisseur_ia?.toUpperCase() }}</span>
          </div>
          <h3 class="article-titre">{{ a.titre }}</h3>
          <p class="article-extrait text-sub truncate-3">{{ a.contenu.slice(0,160) }}…</p>
          <div class="article-meta text-sub">{{ formatDate(a.publie_le) }}</div>
        </RouterLink>
      </div>
      <div v-if="!loading && articles.length===0" class="empty-state"><span>📰</span><p>Aucun article publié.</p></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
const articles = ref<any[]>([])
const loading = ref(true)
const formatDate = (d:string) => new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})
onMounted(async () => { const { data } = await supabase.from('articles').select('id,titre,slug,categorie,contenu,genere_par_ia,fournisseur_ia,publie_le').order('publie_le',{ascending:false}).limit(30); articles.value=data??[]; loading.value=false })
</script>

<style scoped>
.articles-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px; }
.article-card { padding:20px;display:flex;flex-direction:column;gap:10px; }
.article-header { display:flex;gap:6px;flex-wrap:wrap; }
.article-titre { font-weight:700;font-size:15px;line-height:1.4; }
.article-extrait { font-size:13px;line-height:1.6;flex:1; }
.article-meta { font-size:11px;margin-top:auto; }
.loading-state,.empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 0;color:var(--p-sub); }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
