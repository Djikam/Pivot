<template>
  <nav class="pivot-nav" :class="{ scrolled: isScrolled }">
    <div class="nav-inner p-container">

      <!-- LEFT: Logo -->
      <RouterLink to="/" class="nav-logo">
        <img src="/pivotlogo.jpg" alt="Pivot Hball 237" class="logo-img" />
        <div class="logo-text">
          <span class="logo-main">PIVOT</span>
          <span class="logo-sub">HBALL 237</span>
        </div>
      </RouterLink>

      <!-- CENTER: Desktop links -->
      <div class="nav-links">

        <div class="nav-dd" @mouseenter="openDrop('acteurs')" @mouseleave="closeDrop()">
          <button class="nav-link" :class="{ active: isActive(['/joueurs','/clubs','/coaches','/arbitres']) }">
            Acteurs
            <svg class="caret" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <Transition name="drop">
            <div v-if="activeDrop==='acteurs'" class="drop-menu" @mouseenter="openDrop('acteurs')" @mouseleave="closeDrop()">
              <RouterLink to="/joueurs"  class="drop-item" @click="closeDrop()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Joueurs</RouterLink>
              <RouterLink to="/clubs"    class="drop-item" @click="closeDrop()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Clubs</RouterLink>
              <RouterLink to="/coaches"  class="drop-item" @click="closeDrop()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>Coaches</RouterLink>
              <RouterLink to="/arbitres" class="drop-item" @click="closeDrop()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>Arbitres</RouterLink>
            </div>
          </Transition>
        </div>

        <div class="nav-dd" @mouseenter="openDrop('comps')" @mouseleave="closeDrop()">
          <button class="nav-link" :class="{ active: isActive(['/competitions','/matchs','/classement','/buteurs']) }">
            Compétitions
            <svg class="caret" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <Transition name="drop">
            <div v-if="activeDrop==='comps'" class="drop-menu" @mouseenter="openDrop('comps')" @mouseleave="closeDrop()">
              <RouterLink to="/competitions" class="drop-item" @click="closeDrop()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 0h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>Compétitions</RouterLink>
              <RouterLink to="/matchs"       class="drop-item" @click="closeDrop()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>Matchs & Résultats</RouterLink>
              <RouterLink to="/classement"   class="drop-item" @click="closeDrop()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>Classements</RouterLink>
              <RouterLink to="/buteurs"      class="drop-item" @click="closeDrop()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Top Buteurs</RouterLink>
            </div>
          </Transition>
        </div>

        <RouterLink to="/national" class="nav-link" :class="{ active: isActive(['/national']) }">
          <span class="cam-flag"><span class="f g"/><span class="f r"/><span class="f y"/></span>
          National
        </RouterLink>

        <div class="nav-dd" @mouseenter="openDrop('data')" @mouseleave="closeDrop()">
          <button class="nav-link" :class="{ active: isActive(['/statistiques','/transferts','/distinctions']) }">
            Données
            <svg class="caret" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <Transition name="drop">
            <div v-if="activeDrop==='data'" class="drop-menu" @mouseenter="openDrop('data')" @mouseleave="closeDrop()">
              <RouterLink to="/statistiques" class="drop-item" @click="closeDrop()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Statistiques</RouterLink>
              <RouterLink to="/transferts"   class="drop-item" @click="closeDrop()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>Radar Transferts</RouterLink>
              <RouterLink to="/distinctions" class="drop-item" @click="closeDrop()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>Distinctions</RouterLink>
            </div>
          </Transition>
        </div>

        <RouterLink to="/actualites" class="nav-link" :class="{ active: isActive(['/actualites']) }">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6z"/></svg>
          Actualités
        </RouterLink>

        <div class="nav-dd" @mouseenter="openDrop('plus')" @mouseleave="closeDrop()">
          <button class="nav-link" :class="{ active: isActive(['/votes','/education','/self-report','/tv']) }">
            Plus
            <svg class="caret" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <Transition name="drop">
            <div v-if="activeDrop==='plus'" class="drop-menu" @mouseenter="openDrop('plus')" @mouseleave="closeDrop()">
              <RouterLink to="/tv"         class="drop-item drop-feature" @click="closeDrop()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
                HBall237 TV
                <span class="drop-chip">NOUVEAU</span>
              </RouterLink>
              <div class="drop-divider"/>
              <RouterLink to="/votes"      class="drop-item" @click="closeDrop()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>Votes & Awards</RouterLink>
              <RouterLink to="/education"  class="drop-item" @click="closeDrop()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>Espace Éducation</RouterLink>
              <div class="drop-divider"/>
              <RouterLink to="/self-report" class="drop-item drop-cta" @click="closeDrop()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Je suis joueur — Rejoindre
              </RouterLink>
            </div>
          </Transition>
        </div>

      </div>

      <!-- RIGHT: Actions -->
      <div class="nav-actions">
        <span v-if="hasLiveMatch" class="live-badge">
          <span class="live-dot"/>LIVE
        </span>
        <button class="icon-btn" @click="toggleTheme" :title="isLight ? 'Mode nuit' : 'Mode jour'">
          <svg v-if="isLight" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <svg v-else         width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        </button>
        <RouterLink v-if="auth.isLogged" to="/admin" class="p-btn-ghost p-btn-sm desktop-only">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Admin
        </RouterLink>
        <RouterLink v-else to="/admin/login" class="p-btn-red p-btn-sm desktop-only">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Accès
        </RouterLink>
        <!-- Burger — mobile uniquement -->
        <button class="burger-btn" @click="menuOpen=!menuOpen" :aria-label="menuOpen?'Fermer menu':'Ouvrir menu'">
          <svg v-if="!menuOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <svg v-else           width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <!-- Mobile drawer overlay -->
    <Transition name="overlay">
      <div v-if="menuOpen" class="mobile-overlay" @click="menuOpen=false"/>
    </Transition>

    <!-- Mobile drawer -->
    <Transition name="drawer">
      <div v-if="menuOpen" class="mobile-drawer">
        <!-- Drawer header -->
        <div class="drawer-header">
          <div class="drawer-logo">
            <img src="/pivotlogo.jpg" alt="Pivot Hball 237" class="drawer-logo-img"/>
            <div>
              <span class="drawer-logo-main">PIVOT</span>
              <span class="drawer-logo-sub">HBALL 237</span>
            </div>
          </div>
          <button class="drawer-close" @click="menuOpen=false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Live badge in drawer -->
        <div v-if="hasLiveMatch" class="drawer-live">
          <span class="live-dot"/>
          Match en direct disponible sur HBall237 TV
        </div>

        <nav class="drawer-nav">
          <div class="drawer-group">
            <span class="drawer-group-label">Acteurs</span>
            <RouterLink to="/joueurs"  class="drawer-link" @click="menuOpen=false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Joueurs</RouterLink>
            <RouterLink to="/clubs"    class="drawer-link" @click="menuOpen=false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Clubs</RouterLink>
            <RouterLink to="/coaches"  class="drawer-link" @click="menuOpen=false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>Coaches</RouterLink>
            <RouterLink to="/arbitres" class="drawer-link" @click="menuOpen=false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>Arbitres</RouterLink>
          </div>

          <div class="drawer-group">
            <span class="drawer-group-label">Compétitions</span>
            <RouterLink to="/competitions" class="drawer-link" @click="menuOpen=false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 0h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>Compétitions</RouterLink>
            <RouterLink to="/matchs"       class="drawer-link" @click="menuOpen=false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>Matchs & Résultats</RouterLink>
            <RouterLink to="/classement"   class="drawer-link" @click="menuOpen=false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>Classements</RouterLink>
            <RouterLink to="/buteurs"      class="drawer-link" @click="menuOpen=false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Top Buteurs</RouterLink>
          </div>

          <div class="drawer-group">
            <span class="drawer-group-label">National & Données</span>
            <RouterLink to="/national"     class="drawer-link drawer-national" @click="menuOpen=false"><span class="cam-flag"><span class="f g"/><span class="f r"/><span class="f y"/></span>Équipe Nationale</RouterLink>
            <RouterLink to="/statistiques" class="drawer-link" @click="menuOpen=false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Statistiques</RouterLink>
            <RouterLink to="/transferts"   class="drawer-link" @click="menuOpen=false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>Radar Transferts</RouterLink>
            <RouterLink to="/distinctions" class="drawer-link" @click="menuOpen=false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>Distinctions</RouterLink>
          </div>

          <div class="drawer-group">
            <span class="drawer-group-label">Média & Plus</span>
            <RouterLink to="/actualites" class="drawer-link" @click="menuOpen=false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6z"/></svg>Actualités</RouterLink>
            <RouterLink to="/tv"         class="drawer-link drawer-tv" @click="menuOpen=false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>HBall237 TV <span class="drawer-chip">NEW</span></RouterLink>
            <RouterLink to="/votes"      class="drawer-link" @click="menuOpen=false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>Votes & Awards</RouterLink>
            <RouterLink to="/education"  class="drawer-link" @click="menuOpen=false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>Espace Éducation</RouterLink>
          </div>
        </nav>

        <!-- Drawer footer -->
        <div class="drawer-footer">
          <RouterLink v-if="auth.isLogged" to="/admin" class="p-btn-ghost" style="flex:1;justify-content:center" @click="menuOpen=false">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Admin
          </RouterLink>
          <RouterLink v-else to="/admin/login" class="p-btn-ghost" style="flex:1;justify-content:center" @click="menuOpen=false">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Accès admin
          </RouterLink>
          <RouterLink to="/self-report" class="p-btn-red" style="flex:1;justify-content:center" @click="menuOpen=false">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Je rejoins
          </RouterLink>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabaseClient'

const auth = useAuthStore()
const route = useRoute()
const isScrolled   = ref(false)
const isLight      = ref(false)
const menuOpen     = ref(false)
const hasLiveMatch = ref(false)
const activeDrop   = ref<string|null>(null)
let dropTimer: ReturnType<typeof setTimeout>

function openDrop(name: string) { clearTimeout(dropTimer); activeDrop.value = name }
function closeDrop() { dropTimer = setTimeout(() => { activeDrop.value = null }, 150) }
function isActive(paths: string[]) { return paths.some(p => route.path.startsWith(p)) }

function toggleTheme() {
  isLight.value = !isLight.value
  document.documentElement.classList.toggle('light', isLight.value)
  localStorage.setItem('pivot-theme', isLight.value ? 'light' : 'dark')
}

function onScroll() { isScrolled.value = window.scrollY > 40 }

// Fermer le drawer si redimensionnement vers desktop
function onResize() { if (window.innerWidth > 900) menuOpen.value = false }

// Bloquer le scroll body quand menu ouvert
import { watch } from 'vue'
watch(menuOpen, v => { document.body.style.overflow = v ? 'hidden' : '' })

async function checkLive() {
  const { count } = await supabase.from('matchs').select('id', { count: 'exact', head: true }).eq('statut', 'en_cours')
  hasLiveMatch.value = (count ?? 0) > 0
}

onMounted(() => {
  isLight.value = localStorage.getItem('pivot-theme') === 'light'
  document.documentElement.classList.toggle('light', isLight.value)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  checkLive()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* ═══════════════════════ BASE NAV ═══════════════════════ */
.pivot-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(8,8,14,0.90);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border-bottom: 1px solid var(--p-border);
  transition: background 200ms ease, border-color 200ms ease;
}
html.light .pivot-nav { background: rgba(240,237,232,0.95); }
.pivot-nav.scrolled { background: rgba(8,8,14,0.99); border-bottom-color: rgba(201,162,39,0.25); }
html.light .pivot-nav.scrolled { background: rgba(240,237,232,0.99); box-shadow: 0 2px 20px rgba(0,0,0,0.1); }
/* Bande tricolore Cameroun en haut */
.pivot-nav::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--p-green) 0 33.3%, var(--p-red) 33.3% 66.6%, var(--p-yellow) 66.6% 100%);
}

/* ═══════════════════════ INNER LAYOUT ═══════════════════════ */
/* Logo left + Links center + Actions right via flex */
.nav-inner {
  display: flex;
  align-items: center;
  height: 62px;
}

/* Logo — extrême gauche */
.nav-logo {
  display: flex; align-items: center; gap: 10px;
  flex: 0 0 auto;
}
.logo-img {
  height: 38px; width: 38px; border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--p-gold);
  box-shadow: 0 0 14px rgba(201,162,39,0.35);
  flex-shrink: 0;
}
.logo-text { display: flex; flex-direction: column; line-height: 1; }
.logo-main { font-family: var(--font-display); font-size: 1.25rem; color: var(--p-gold); letter-spacing: 0.12em; }
.logo-sub  { font-size: 9px; font-weight: 700; color: var(--p-sub); letter-spacing: 0.2em; text-transform: uppercase; }

/* Links — centre (poussé par flex) */
.nav-links {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

/* Actions — extrême droite */
.nav-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.desktop-only { display: inline-flex; }

/* ═══════════════════════ NAV LINKS ═══════════════════════ */
.nav-link {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 10px; border-radius: 6px;
  font-size: 13px; font-weight: 600; color: var(--p-sub);
  background: none; border: none; cursor: pointer; font-family: inherit;
  transition: color 130ms, background 130ms;
  white-space: nowrap;
}
.nav-link:hover { color: var(--p-text); background: rgba(201,162,39,0.06); }
.nav-link.active { color: var(--p-gold); }
.caret { transition: transform 180ms ease; }
.nav-dd:hover .caret { transform: rotate(180deg); }

.cam-flag { display: inline-flex; overflow: hidden; border-radius: 2px; width: 16px; height: 11px; flex-shrink: 0; }
.f { flex: 1; height: 100%; }
.f.g { background: #007A5E; } .f.r { background: #CE1126; } .f.y { background: #FCD116; }

/* ═══════════════════════ DROPDOWNS ═══════════════════════ */
.nav-dd { position: relative; }

.drop-menu {
  position: absolute; top: calc(100% + 10px); left: 50%;
  transform: translateX(-50%);
  min-width: 220px;
  background: var(--p-card2);
  border: 1px solid var(--p-border);
  border-radius: var(--radius-lg);
  padding: 6px;
  box-shadow: 0 20px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,162,39,0.06);
  z-index: 300;
}
html.light .drop-menu { box-shadow: 0 8px 24px rgba(0,0,0,0.14); background: #fff; }

.drop-item {
  display: flex; align-items: center; gap: 9px;
  padding: 9px 12px; border-radius: var(--radius-md);
  font-size: 13px; font-weight: 500; color: var(--p-sub);
  transition: color 110ms, background 110ms;
  white-space: nowrap;
}
.drop-item:hover { color: var(--p-text); background: rgba(201,162,39,0.08); }
.drop-feature { color: var(--p-gold); font-weight: 600; }
.drop-feature:hover { background: var(--p-gold-soft); }
.drop-cta { color: var(--p-green-bright); font-weight: 600; }
.drop-cta:hover { background: var(--p-green-soft); }
.drop-divider { height: 1px; background: var(--p-border); margin: 4px 0; }
.drop-chip {
  margin-left: auto; font-size: 9px; font-weight: 800; letter-spacing: 0.08em;
  padding: 2px 6px; border-radius: 4px;
  background: rgba(206,17,38,0.15); border: 1px solid rgba(206,17,38,0.3); color: var(--p-red);
}

.drop-enter-active, .drop-leave-active { transition: opacity 130ms, transform 130ms; }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateX(-50%) translateY(-8px); }
.drop-enter-to, .drop-leave-from { opacity: 1; transform: translateX(-50%) translateY(0); }

/* ═══════════════════════ LIVE & ICONS ═══════════════════════ */
.live-badge {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 99px;
  background: rgba(0,168,126,0.12); border: 1px solid var(--p-green-bright);
  color: var(--p-green-bright); font-size: 11px; font-weight: 700;
  letter-spacing: 0.1em; font-family: var(--font-condensed);
}
.live-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--p-green-bright);
  animation: pulseG 1.6s ease-in-out infinite;
}
@keyframes pulseG { 0%,100%{opacity:1;box-shadow:0 0 5px var(--p-green-bright)}50%{opacity:.35;box-shadow:none} }

.icon-btn {
  width: 34px; height: 34px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: var(--p-sub); border: 1px solid var(--p-border);
  transition: color 130ms, border-color 130ms, background 130ms;
}
.icon-btn:hover { color: var(--p-gold); border-color: var(--p-gold); background: var(--p-gold-soft); }

/* ═══════════════════════ BURGER ═══════════════════════ */
.burger-btn {
  display: none;
  width: 38px; height: 38px; border-radius: 8px;
  align-items: center; justify-content: center;
  border: 1px solid var(--p-border); color: var(--p-text);
  transition: border-color 130ms, background 130ms;
}
.burger-btn:hover { border-color: var(--p-gold); background: var(--p-gold-soft); }

/* ═══════════════════════ MOBILE OVERLAY ═══════════════════════ */
.mobile-overlay {
  position: fixed; inset: 0; z-index: 150;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(2px);
}
.overlay-enter-active, .overlay-leave-active { transition: opacity 220ms ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

/* ═══════════════════════ MOBILE DRAWER ═══════════════════════ */
.mobile-drawer {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: 300px; max-width: 90vw;
  z-index: 200;
  background: var(--p-bg2);
  border-left: 1px solid var(--p-border);
  display: flex; flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
html.light .mobile-drawer { background: #fff; }

.drawer-enter-active, .drawer-leave-active { transition: transform 260ms cubic-bezier(0.4,0,0.2,1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }
.drawer-enter-to, .drawer-leave-from { transform: translateX(0); }

/* Drawer header */
.drawer-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--p-border);
  flex-shrink: 0;
}
.drawer-logo { display: flex; align-items: center; gap: 10px; }
.drawer-logo-img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid var(--p-gold); }
.drawer-logo-main { display: block; font-family: var(--font-display); font-size: 1.1rem; color: var(--p-gold); letter-spacing: 0.1em; }
.drawer-logo-sub  { display: block; font-size: 8px; font-weight: 700; color: var(--p-sub); letter-spacing: 0.18em; text-transform: uppercase; }
.drawer-close {
  width: 32px; height: 32px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  color: var(--p-sub); border: 1px solid var(--p-border);
  transition: color 120ms, background 120ms;
}
.drawer-close:hover { color: var(--p-red); background: var(--p-red-soft); }

/* Live bar in drawer */
.drawer-live {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px;
  background: rgba(0,168,126,0.08);
  border-bottom: 1px solid rgba(0,168,126,0.2);
  font-size: 12px; font-weight: 600; color: var(--p-green-bright);
  flex-shrink: 0;
}

/* Drawer nav */
.drawer-nav { flex: 1; padding: 8px 0; overflow-y: auto; }

.drawer-group { padding: 16px 0 8px; }
.drawer-group + .drawer-group { border-top: 1px solid var(--p-border-s); }

.drawer-group-label {
  display: block;
  font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--p-gold);
  padding: 0 16px 8px; opacity: 0.75;
}

.drawer-link {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 16px; font-size: 14px; font-weight: 500;
  color: var(--p-sub);
  transition: color 110ms, background 110ms;
}
.drawer-link:hover, .drawer-link:active { color: var(--p-text); background: rgba(201,162,39,0.07); }
.drawer-national { color: var(--p-green-bright); font-weight: 600; }
.drawer-tv { color: var(--p-gold); font-weight: 600; }
.drawer-chip {
  margin-left: auto; font-size: 9px; font-weight: 800;
  padding: 2px 6px; border-radius: 4px;
  background: rgba(206,17,38,0.15); border: 1px solid rgba(206,17,38,0.3); color: var(--p-red);
}

/* Drawer footer */
.drawer-footer {
  display: flex; gap: 8px; flex-wrap: wrap;
  padding: 14px 16px;
  border-top: 1px solid var(--p-border);
  flex-shrink: 0;
}

/* ═══════════════════════ RESPONSIVE ═══════════════════════ */
@media (max-width: 1050px) {
  .nav-link { padding: 6px 7px; font-size: 12px; }
}
@media (max-width: 900px) {
  .nav-links    { display: none; }
  .desktop-only { display: none; }
  .burger-btn   { display: flex; }
  .live-badge   { display: none; } /* affiché dans le drawer */
}
@media (max-width: 480px) {
  .logo-text { display: none; }
}
</style>
