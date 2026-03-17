<template>
  <div class="admin-layout" :class="{'sidebar-open': sidebarOpen}">
    <div class="sidebar-overlay" v-if="sidebarOpen" @click="sidebarOpen=false" />
    <AppSidebar :force-collapsed="!sidebarOpen && isMobile" />
    <div class="admin-main">
      <header class="admin-topbar">
        <div class="topbar-left">
          <button class="menu-btn" @click="sidebarOpen=!sidebarOpen">
            <component :is="Menu" width="20" height="20" />
          </button>
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="topbar-right">
          <RouterLink to="/" target="_blank" class="p-btn-ghost p-btn-sm">
            <component :is="ExternalLink" width="13" height="13" />
            <span class="hide-mobile">Voir le site</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import { ExternalLink, Menu } from 'lucide-vue-next'

const route = useRoute()
const sidebarOpen = ref(false)
const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) sidebarOpen.value = false
}
onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile) })
onUnmounted(() => window.removeEventListener('resize', checkMobile))

const titles: Record<string, string> = {
  'admin-dashboard':   'Dashboard',
  'admin-joueurs':     'Gestion Joueurs',
  'admin-clubs':       'Gestion Clubs',
  'admin-competitions':'Compétitions',
  'admin-matchs':      'Saisie Matchs',
  'admin-transferts':  'RADAR — Transferts',
  'admin-national':    'Équipes Nationales',
  'admin-staff':       'Staff & Coaches',
  'admin-arbitres':    'Arbitres',
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
.admin-layout { display:flex; min-height:100vh; background:var(--p-bg); }
.admin-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
.admin-topbar {
  height:60px; display:flex; align-items:center; justify-content:space-between;
  padding:0 24px; background:var(--p-card); border-bottom:1px solid var(--p-border); flex-shrink:0;
}
.topbar-left { display:flex; align-items:center; gap:12px; }
.menu-btn { display:none; background:none; border:none; cursor:pointer; color:var(--p-text); padding:6px; border-radius:6px; }
.menu-btn:hover { background:var(--p-bg3); }
.page-title { font-family:var(--font-display); font-size:1.3rem; font-weight:600; color:var(--p-text); }
.topbar-right { display:flex; gap:10px; align-items:center; }
.admin-content { flex:1; overflow-y:auto; padding:24px; }
.sidebar-overlay { display:none; }

@media (max-width: 768px) {
  .menu-btn { display:flex; }
  .hide-mobile { display:none; }
  .sidebar-overlay {
    display:block; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:99;
  }
  .admin-content { padding:16px; }
  .page-title { font-size:1.1rem; }
}
</style>
