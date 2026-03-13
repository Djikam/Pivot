<template>
  <div>
    <RouterLink to="/national" class="p-btn-ghost p-btn-sm p-container" style="margin:24px 0;display:inline-flex">← Équipes nationales</RouterLink>
    <NationalView />
  </div>
</template>

<script setup lang="ts">
import NationalView from './NationalView.vue'
</script>
