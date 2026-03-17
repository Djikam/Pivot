<template>
  <div class="pagination" v-if="totalPages > 1 || page > 0">
    <button class="p-btn-ghost p-btn-sm" :disabled="page === 0" @click="$emit('prev')">← Précédent</button>
    <div class="page-info">
      <span class="text-sub">Page {{ page + 1 }}</span>
      <span v-if="total" class="text-sub total-count">sur {{ Math.ceil(total / limit) }} · {{ total }} résultats</span>
    </div>
    <button class="p-btn-ghost p-btn-sm" :disabled="isLastPage" @click="$emit('next')">Suivant →</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  page: number
  limit: number
  total?: number
  count?: number // items on current page (for hasMore detection)
}>()
defineEmits(['prev', 'next'])
const totalPages = computed(() => props.total ? Math.ceil(props.total / props.limit) : 0)
const isLastPage = computed(() => {
  if (props.total) return (props.page + 1) * props.limit >= props.total
  return (props.count ?? 0) < props.limit
})
</script>

<style scoped>
.pagination { display:flex;justify-content:center;align-items:center;gap:16px;margin-top:32px;flex-wrap:wrap }
.page-info { display:flex;flex-direction:column;align-items:center;gap:2px }
.total-count { font-size:11px }
</style>
