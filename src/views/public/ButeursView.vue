<template>
  <div>
    <section class="p-hero" style="padding:36px 0 28px">
      <div class="p-container">
        <h1 class="font-display" style="font-size:2.2rem;font-weight:700;margin-bottom:6px">Top Buteurs</h1>
        <p class="text-sub">Classement des meilleurs scoreurs par compétition</p>
      </div>
    </section>
    <div class="p-container" style="padding-top:24px;padding-bottom:60px">
      <RouterLink to="/statistiques" class="p-btn-ghost p-btn-sm" style="margin-bottom:20px;display:inline-flex">← Statistiques</RouterLink>
      <!-- Réutilise le composant stats avec onglet buteurs actif -->
    </div>
  </div>
</template>
<script setup lang="ts" />
