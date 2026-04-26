<template>
  <div class="layout-wrapper">
    <AppNavbar />
    <SportsTicker />
    <main class="layout-main">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppNavbar from './AppNavbar.vue'
import AppFooter from './AppFooter.vue'
import SportsTicker from './SportsTicker.vue'
</script>

<style scoped>
.layout-wrapper { display: flex; flex-direction: column; min-height: 100vh; }
.layout-main { flex: 1; padding-top: 98px; /* 62px nav + 36px ticker */ }
</style>
