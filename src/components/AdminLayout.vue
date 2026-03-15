<template>
  <div class="admin-layout">
    <AppSidebar />
    <div class="admin-main">
      <header class="admin-topbar">
        <div class="topbar-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="topbar-right">
          <RouterLink to="/" target="_blank" class="p-btn-ghost p-btn-sm">
            <component :is="ExternalLink" width="13" height="13" />
            Voir le site
          </RouterLink>
        </div>
      </header>
      <div class="admin-content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import { ExternalLink } from 'lucide-vue-next'

const route = useRoute()
const titles: Record<string, string> = {
  'admin-dashboard':   'Dashboard',
  'admin-joueurs':     'Gestion Joueurs',
  'admin-clubs':       'Gestion Clubs',
  'admin-competitions':'Compétitions',
  'admin-matchs':      'Saisie Matchs',
  'admin-transferts':  'RADAR — Transferts',
  'admin-national':    'Équipes Nationales',
  'admin-votes':       'PULSE — Votes',
  'admin-articles':    'FEED — Articles',
  'admin-education':   'Espace Éducation',
  'admin-distinctions':'Distinctions',
  'admin-validation':  'Validation RGPD',
  'admin-alertes':     'Alertes',
  'admin-doublons':    'Doublons',
}
const pageTitle = computed(() => titles[route.name as string] ?? 'Administration')
</script>

<style scoped>
.admin-layout { display: flex; min-height: 100vh; background: var(--p-bg); }
.admin-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.admin-topbar {
  height: 60px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; background: var(--p-card); border-bottom: 1px solid var(--p-border);
  flex-shrink: 0;
}
.page-title { font-family: var(--font-display); font-size: 1.3rem; font-weight: 600; color: var(--p-text); }
.topbar-right { display: flex; gap: 10px; align-items: center; }
.admin-content { flex: 1; overflow-y: auto; padding: 24px; }
</style>
