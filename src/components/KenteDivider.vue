<template>
  <div class="gold-line" :style="{ margin: `${my}px 0` }" />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ height?: number; my?: number }>(), { height: 1, my: 24 })
</script>

<style scoped>
.gold-line {
  width: 100%; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201,162,39,0.4) 20%, rgba(201,162,39,0.4) 80%, transparent);
}
</style>
