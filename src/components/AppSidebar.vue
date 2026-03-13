<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <span class="sidebar-logo">PIVOT</span>
      <span v-if="!collapsed" class="sidebar-sub">Admin</span>
      <button class="collapse-btn" @click="collapsed = !collapsed">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline :points="collapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'" />
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="sidebar-item" :title="collapsed ? item.label : ''">
        <span class="item-icon" v-html="item.icon" />
        <span v-if="!collapsed" class="item-label">{{ item.label }}</span>
        <span v-if="!collapsed && item.badge" class="item-badge">{{ item.badge }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <div v-if="!collapsed" class="user-info">
        <span class="user-role" :class="'role-' + auth.role">{{ auth.role }}</span>
        <span class="user-email">{{ auth.user?.email }}</span>
      </div>
      <button class="logout-btn" @click="logout" :title="collapsed ? 'Déconnexion' : ''">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        <span v-if="!collapsed">Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const collapsed = ref(false)

interface NavItem {
  to: string
  label: string
  icon: string
  badge?: string
}

const navItems: NavItem[] = [
  { to: '/admin',             label: 'Dashboard',     icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
  { to: '/admin/joueurs',     label: 'Joueurs',       icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
  { to: '/admin/clubs',       label: 'Clubs',         icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>' },
  { to: '/admin/competitions',label: 'Compétitions',  icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>' },
  { to: '/admin/matchs',      label: 'Saisie Matchs', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' },
  { to: '/admin/transferts',  label: 'RADAR',         icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
  { to: '/admin/national',    label: 'National',      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' },
  { to: '/admin/votes',       label: 'PULSE',         icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' },
  { to: '/admin/articles',    label: 'FEED',          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2zm0 0H4a2 2 0 0 1-2-2v-5"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
  { to: '/admin/education',   label: 'Éducation',     icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>' },
  { to: '/admin/distinctions',label: 'Distinctions',  icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
  { to: '/admin/validation',  label: 'RGPD',          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
  { to: '/admin/alertes',     label: 'Alertes',       icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>' },
]

async function logout() {
  await auth.logout()
  router.push('/admin/login')
}
</script>

<style scoped>
.sidebar {
  width: 220px; min-height: 100vh;
  background: var(--p-card); border-right: 1px solid var(--p-border);
  display: flex; flex-direction: column;
  transition: width 200ms ease; flex-shrink: 0;
}
.sidebar.collapsed { width: 56px; }
.sidebar-header {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 16px 12px; border-bottom: 1px solid var(--p-border);
  min-height: 60px;
}
.sidebar-logo {
  font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; color: var(--p-red);
  white-space: nowrap;
}
.sidebar-sub { font-size: 11px; color: var(--p-sub); flex: 1; }
.collapse-btn {
  margin-left: auto; width: 26px; height: 26px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  color: var(--p-sub); border: 1px solid var(--p-border);
  transition: color 150ms, border-color 150ms;
}
.collapse-btn:hover { color: var(--p-red); border-color: var(--p-red); }
.sidebar-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
.sidebar-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 8px;
  color: var(--p-sub); font-size: 13px; font-weight: 500;
  transition: background 150ms, color 150ms;
  white-space: nowrap; overflow: hidden;
}
.sidebar-item:hover { background: rgba(255,255,255,0.05); color: var(--p-text); }
.sidebar-item.router-link-active { background: rgba(140,21,37,0.12); color: var(--p-red); }
.item-icon { flex-shrink: 0; display: flex; }
.item-label { flex: 1; }
.item-badge {
  background: var(--p-red); color: #fff; border-radius: 99px;
  font-size: 10px; font-weight: 700; padding: 1px 6px;
}
.sidebar-footer {
  padding: 12px 8px; border-top: 1px solid var(--p-border);
  display: flex; flex-direction: column; gap: 8px;
}
.user-info { padding: 0 4px; }
.user-role {
  display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px;
  border-radius: 99px; text-transform: uppercase; letter-spacing: 0.06em;
  margin-bottom: 4px;
}
.role-admin   { background: rgba(140,21,37,.2); color: var(--p-red); }
.role-saisie  { background: rgba(196,146,42,.2); color: var(--p-gold); }
.role-viewer  { background: rgba(160,144,168,.1); color: var(--p-sub); }
.user-email { display: block; font-size: 11px; color: var(--p-muted); overflow: hidden; text-overflow: ellipsis; }
.logout-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 8px; width: 100%;
  color: var(--p-sub); font-size: 13px;
  transition: background 150ms, color 150ms;
}
.logout-btn:hover { background: rgba(255,255,255,0.05); color: var(--p-red); }
</style>
