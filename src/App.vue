<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

// Restaurer le thème sauvegardé
onMounted(() => {
  const saved = localStorage.getItem('pivot-theme')
  if (saved === 'light') document.documentElement.classList.add('light')
})
</script>
