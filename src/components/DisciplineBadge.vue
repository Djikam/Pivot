<template>
  <span class="p-badge" :class="badgeClass" :title="tooltip">
    <span class="badge-dot" :class="dotClass" />
    {{ label }}
    <span v-if="count && count > 1" class="badge-count">×{{ count }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DisciplineType } from '@/lib/database.types'

const props = defineProps<{
  type: DisciplineType
  count?: number
}>()

const config: Record<DisciplineType, { label: string; badge: string; tooltip: string }> = {
  avertissement: {
    label: 'Avert.',
    badge: 'p-badge-avertissement',
    tooltip: 'Avertissement verbal — pas de carte physique'
  },
  carton_jaune: {
    label: 'Jaune',
    badge: 'p-badge-jaune',
    tooltip: 'Carton jaune — avertissement officiel. 1 seul par joueur par match.'
  },
  suspension_2min: {
    label: '2 min',
    badge: 'p-badge-suspension',
    tooltip: 'Suspension 2 minutes — exclusion temporaire. 3 cumuls = exclusion définitive.'
  },
  carton_rouge: {
    label: 'Rouge',
    badge: 'p-badge-rouge',
    tooltip: 'Carton rouge — exclusion définitive du match. Équipe joue à 5 pendant 2 min.'
  },
  carton_bleu: {
    label: 'Bleu',
    badge: 'p-badge-bleu',
    tooltip: 'Carton bleu — infraction grave. Rapport disciplinaire transmis à la commission.'
  },
}

const badgeClass = computed(() => config[props.type]?.badge ?? 'p-badge-muted')
const label      = computed(() => config[props.type]?.label ?? props.type)
const tooltip    = computed(() => config[props.type]?.tooltip ?? '')
const dotClass   = computed(() => badgeClass.value.replace('p-badge-', 'dot-'))
</script>

<style scoped>
.badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  display: inline-block;
}
.dot-avertissement { background: #A0A0A0; }
.dot-jaune         { background: var(--kente-or, #D4A820); }
.dot-suspension    { background: #D4721A; }
.dot-rouge         { background: var(--p-red, #8C1525); }
.dot-bleu          { background: var(--p-blue-disc, #3A2A8A); }

.badge-count {
  font-size: 10px; opacity: 0.85; margin-left: 2px;
}
</style>
