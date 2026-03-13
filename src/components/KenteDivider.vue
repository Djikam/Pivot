<template>
  <div class="kente-divider" :style="{ height: height + 'px', margin: `${my}px 0` }">
    <span v-for="i in 10" :key="i" />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ height?: number; my?: number }>(), {
  height: 8,
  my: 32
})
</script>
