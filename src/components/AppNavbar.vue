<template>
  <nav class="pivot-nav" :class="{ scrolled: isScrolled }">
    <div class="nav-inner p-container">
      <!-- Logo -->
      <RouterLink to="/" class="nav-logo">
        <span class="logo-text">PIVOT</span>
        <span class="logo-sub">handball cameroun</span>
      </RouterLink>

      <!-- Nav links desktop -->
      <div class="nav-links">
        <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="nav-link" :class="{ active: isActive(link.to) }">
          {{ link.label }}
        </RouterLink>
      </div>

      <!-- Actions droite -->
      <div class="nav-actions">
        <!-- Badge LIVE -->
        <span v-if="hasLiveMatch" class="live-badge">
          <span class="live-dot" />LIVE
        </span>

        <!-- Toggle thème -->
        <button class="theme-btn" @click="toggleTheme" :title="isLight ? 'Mode nuit' : 'Mode jour'">
          <svg v-if="isLight" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        </button>

        <!-- Bouton admin -->
        <RouterLink v-if="auth.isLogged" to="/admin" class="p-btn-ghost p-btn-sm">Admin</RouterLink>
        <RouterLink v-else to="/admin/login" class="p-btn-red p-btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Accès
        </RouterLink>

        <!-- Menu burger mobile -->
        <button class="burger-btn" @click="menuOpen = !menuOpen">
          <span :class="{ open: menuOpen }" />
          <span :class="{ open: menuOpen }" />
          <span :class="{ open: menuOpen }" />
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="menu">
      <div v-if="menuOpen" class="mobile-menu">
        <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="mobile-link" @click="menuOpen = false">
          {{ link.label }}
        </RouterLink>
        <div class="mobile-divider" />
        <RouterLink to="/national" class="mobile-link mobile-national" @click="menuOpen = false">🇨🇲 Équipes Nationales</RouterLink>
        <RouterLink to="/education" class="mobile-link" @click="menuOpen = false">📚 Espace Éducation</RouterLink>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const isScrolled = ref(false)
const isLight = ref(false)
const menuOpen = ref(false)
const hasLiveMatch = ref(false)

const navLinks = [
  { to: '/joueurs',      label: 'Joueurs' },
  { to: '/clubs',        label: 'Clubs' },
  { to: '/competitions', label: 'Compétitions' },
  { to: '/matchs',       label: 'Matchs' },
  { to: '/statistiques', label: 'Stats' },
  { to: '/transferts',   label: 'Radar' },
  { to: '/votes',        label: 'Pulse' },
  { to: '/actualites',   label: 'Feed' },
]

const isActive = (path: string) => route.path.startsWith(path)

function toggleTheme() {
  isLight.value = !isLight.value
  document.documentElement.classList.toggle('light', isLight.value)
  localStorage.setItem('pivot-theme', isLight.value ? 'light' : 'dark')
}

function onScroll() { isScrolled.value = window.scrollY > 40 }

onMounted(() => {
  isLight.value = localStorage.getItem('pivot-theme') === 'light'
  document.documentElement.classList.toggle('light', isLight.value)
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.pivot-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(7,4,9,0.85);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--p-border);
  transition: all 180ms ease;
}
html.light .pivot-nav {
  background: rgba(255,255,255,0.92);
  border-bottom-color: rgba(0,0,0,0.12);
}
html.light .pivot-nav.scrolled {
  background: rgba(255,255,255,0.96);
  box-shadow: 0 2px 20px rgba(0,0,0,0.14);
}
.pivot-nav.scrolled {
  background: rgba(7,4,9,0.97);
  box-shadow: 0 2px 20px rgba(0,0,0,0.4);
}
.nav-inner {
  display: flex; align-items: center; gap: 24px;
  height: 60px;
}
.nav-logo {
  display: flex; flex-direction: column; line-height: 1;
  flex-shrink: 0;
}
.logo-text {
  font-family: var(--font-display); font-size: 1.6rem; font-weight: 700;
  color: var(--p-red); letter-spacing: -0.02em;
}
.logo-sub {
  font-size: 9px; font-weight: 500; color: var(--p-sub);
  letter-spacing: 0.12em; text-transform: uppercase; margin-top: 2px;
}
.nav-links {
  display: flex; gap: 2px; flex: 1;
}
.nav-link {
  padding: 6px 12px; border-radius: 6px;
  font-size: 13px; font-weight: 500; color: var(--p-sub);
  transition: color 150ms, background 150ms;
}
.nav-link:hover, .nav-link.active {
  color: var(--p-text); background: rgba(255,255,255,0.05);
}
.nav-link.active { color: var(--p-red); }
.nav-actions {
  display: flex; align-items: center; gap: 10px; flex-shrink: 0;
}
.live-badge {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 99px;
  background: rgba(59,170,106,0.15); border: 1px solid var(--p-green);
  color: var(--p-green); font-size: 11px; font-weight: 700;
  letter-spacing: 0.08em;
}
.live-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--p-green); animation: pulseGreen 1.6s ease-in-out infinite;
}
.theme-btn {
  width: 34px; height: 34px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: var(--p-sub); background: transparent;
  border: 1px solid var(--p-border);
  transition: color 150ms, border-color 150ms;
}
.theme-btn:hover { color: var(--p-gold); border-color: var(--p-gold); }

.burger-btn {
  display: none; flex-direction: column; gap: 5px;
  width: 34px; height: 34px; align-items: center; justify-content: center;
}
.burger-btn span {
  width: 20px; height: 2px; background: var(--p-text);
  border-radius: 2px; transition: all 200ms ease;
}

.mobile-menu {
  border-top: 1px solid var(--p-border);
  padding: 12px 20px 20px;
  background: var(--p-bg);
}
.mobile-link {
  display: block; padding: 10px 0;
  font-size: 15px; font-weight: 500; color: var(--p-sub);
  border-bottom: 1px solid var(--p-border);
  transition: color 150ms;
}
.mobile-link:hover { color: var(--p-text); }
.mobile-link:last-child { border-bottom: none; }
.mobile-national { color: var(--cam-green, #007A5E); font-weight: 600; }
.mobile-divider { height: 8px; }

.menu-enter-active, .menu-leave-active { transition: all 200ms ease; }
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 900px) {
  .nav-links { display: none; }
  .burger-btn { display: flex; }
}
@media (max-width: 600px) {
  .theme-btn { display: none; }
}
</style>
