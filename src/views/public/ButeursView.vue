<template>
  <div>
    <section class="p-hero" style="padding:36px 0 28px">
      <div class="p-container">
        <h1 class="font-display" style="font-size:2.2rem;font-weight:700;margin-bottom:6px">Top Buteurs</h1>
        <p class="text-sub">Meilleurs scoreurs toutes compétitions confondues</p>
      </div>
    </section>
    <div class="p-container" style="padding-top:24px;padding-bottom:60px">
      <RouterLink to="/statistiques" class="p-btn-ghost p-btn-sm" style="margin-bottom:20px;display:inline-flex">← Voir toutes les stats</RouterLink>
      <StatistiquesView />
    </div>
  </div>
</template>

<script setup lang="ts">
import StatistiquesView from './StatistiquesView.vue'
</script>
