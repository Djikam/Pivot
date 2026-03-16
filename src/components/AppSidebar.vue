<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <span class="sidebar-logo">PIVOT</span>
      <span v-if="!collapsed" class="sidebar-sub">Admin</span>
      <button class="collapse-btn" @click="collapsed = !collapsed">
        <component :is="collapsed ? ChevronRight : ChevronLeft" width="16" height="16" />
      </button>
    </div>

    <nav class="sidebar-nav">
      <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="sidebar-item" :title="collapsed ? item.label : ''">
        <span class="item-icon"><component :is="item.icon" width="18" height="18" /></span>
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
        <component :is="LogOut" width="16" height="16" />
        <span v-if="!collapsed">Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  LayoutDashboard, Users, Home, Trophy, Clock, Activity, MapPin, Heart, Newspaper, BookOpen, Star, Shield, Bell, ChevronRight, ChevronLeft, LogOut, AlertTriangle, UserCog, Gavel
} from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()
const collapsed = ref(false)

interface NavItem {
  to: string
  label: string
  icon: any
  badge?: string
}

const navItems: NavItem[] = [
  { to: '/admin',             label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/admin/joueurs',     label: 'Joueurs',       icon: Users },
  { to: '/admin/clubs',       label: 'Clubs',         icon: Home },
  { to: '/admin/competitions',label: 'Compétitions',  icon: Trophy },
  { to: '/admin/matchs',      label: 'Saisie Matchs', icon: Clock },
  { to: '/admin/transferts',  label: 'RADAR',         icon: Activity },
  { to: '/admin/national',    label: 'National',      icon: MapPin },
  { to: '/admin/staff',       label: 'Staff & Coaches', icon: UserCog },
  { to: '/admin/arbitres',    label: 'Arbitres',      icon: Gavel },
  { to: '/admin/votes',       label: 'PULSE',         icon: Heart },
  { to: '/admin/articles',    label: 'FEED',          icon: Newspaper },
  { to: '/admin/education',   label: 'Éducation',     icon: BookOpen },
  { to: '/admin/distinctions',label: 'Distinctions',  icon: Star },
  { to: '/admin/validation',  label: 'RGPD',          icon: Shield },
  { to: '/admin/alertes',     label: 'Alertes',       icon: Bell },
  { to: '/admin/doublons',    label: 'Doublons',      icon: AlertTriangle },
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
