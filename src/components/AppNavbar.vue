<template>
  <nav class="pivot-nav" :class="{ scrolled: isScrolled }">
    <div class="nav-inner p-container">

      <RouterLink to="/" class="nav-logo">
        <img src="/pivotlogo.jpg" alt="Pivot Hball 237" class="logo-img" />
        <div class="logo-text">
          <span class="logo-main">PIVOT</span>
          <span class="logo-sub">HBALL 237</span>
        </div>
      </RouterLink>

      <div class="nav-links">

        <div class="nav-dropdown" @mouseenter="openDrop('acteurs')" @mouseleave="closeDrop">
          <button class="nav-link" :class="{ active: isActive(['/joueurs','/clubs','/coaches','/arbitres']) }">
            Acteurs
            <svg class="caret" width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
          </button>
          <Transition name="drop">
            <div v-if="activeDrop==='acteurs'" class="drop-menu">
              <RouterLink to="/joueurs" class="drop-item" @click="closeDrop">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Joueurs
              </RouterLink>
              <RouterLink to="/clubs" class="drop-item" @click="closeDrop">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Clubs
              </RouterLink>
              <RouterLink to="/coaches" class="drop-item" @click="closeDrop">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                Coaches
              </RouterLink>
              <RouterLink to="/arbitres" class="drop-item" @click="closeDrop">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
                Arbitres
              </RouterLink>
            </div>
          </Transition>
        </div>

        <div class="nav-dropdown" @mouseenter="openDrop('comps')" @mouseleave="closeDrop">
          <button class="nav-link" :class="{ active: isActive(['/competitions','/matchs','/classement','/buteurs']) }">
            Compétitions
            <svg class="caret" width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
          </button>
          <Transition name="drop">
            <div v-if="activeDrop==='comps'" class="drop-menu">
              <RouterLink to="/competitions" class="drop-item" @click="closeDrop">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 0h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
                Compétitions
              </RouterLink>
              <RouterLink to="/matchs" class="drop-item" @click="closeDrop">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                Matchs & Résultats
              </RouterLink>
              <RouterLink to="/classement" class="drop-item" @click="closeDrop">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                Classements
              </RouterLink>
              <RouterLink to="/buteurs" class="drop-item" @click="closeDrop">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Top Buteurs
              </RouterLink>
            </div>
          </Transition>
        </div>

        <RouterLink to="/national" class="nav-link" :class="{ active: isActive(['/national']) }">
          <span class="cam-flag"><span class="f g"></span><span class="f r"></span><span class="f y"></span></span>
          National
        </RouterLink>

        <div class="nav-dropdown" @mouseenter="openDrop('data')" @mouseleave="closeDrop">
          <button class="nav-link" :class="{ active: isActive(['/statistiques','/transferts','/distinctions']) }">
            Données
            <svg class="caret" width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
          </button>
          <Transition name="drop">
            <div v-if="activeDrop==='data'" class="drop-menu">
              <RouterLink to="/statistiques" class="drop-item" @click="closeDrop">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Statistiques
              </RouterLink>
              <RouterLink to="/transferts" class="drop-item" @click="closeDrop">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                Radar Transferts
              </RouterLink>
              <RouterLink to="/distinctions" class="drop-item" @click="closeDrop">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                Distinctions
              </RouterLink>
            </div>
          </Transition>
        </div>

        <RouterLink to="/actualites" class="nav-link" :class="{ active: isActive(['/actualites']) }">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6z"/></svg>
          Actualités
        </RouterLink>

        <div class="nav-dropdown" @mouseenter="openDrop('plus')" @mouseleave="closeDrop">
          <button class="nav-link" :class="{ active: isActive(['/votes','/education','/self-report']) }">
            Plus
            <svg class="caret" width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
          </button>
          <Transition name="drop">
            <div v-if="activeDrop==='plus'" class="drop-menu">
              <RouterLink to="/votes" class="drop-item" @click="closeDrop">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                Votes & Awards
              </RouterLink>
              <RouterLink to="/education" class="drop-item" @click="closeDrop">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                Espace Éducation
              </RouterLink>
              <div class="drop-divider"/>
              <RouterLink to="/self-report" class="drop-item drop-cta" @click="closeDrop">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Je suis joueur — Rejoindre
              </RouterLink>
            </div>
          </Transition>
        </div>

      </div>

      <div class="nav-actions">
        <span v-if="hasLiveMatch" class="live-badge"><span class="live-dot"/>LIVE</span>
        <button class="theme-btn" @click="toggleTheme">
          <svg v-if="isLight" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        </button>
        <RouterLink v-if="auth.isLogged" to="/admin" class="p-btn-ghost p-btn-sm">Admin</RouterLink>
        <RouterLink v-else to="/admin/login" class="p-btn-red p-btn-sm">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Accès
        </RouterLink>
        <button class="burger-btn" @click="menuOpen=!menuOpen">
          <span :class="{open:menuOpen}"/><span :class="{open:menuOpen}"/><span :class="{open:menuOpen}"/>
        </button>
      </div>
    </div>

    <Transition name="menu">
      <div v-if="menuOpen" class="mobile-menu">
        <div class="mobile-section">
          <div class="mobile-sec-title">Acteurs</div>
          <RouterLink to="/joueurs" class="mobile-link" @click="menuOpen=false">Joueurs</RouterLink>
          <RouterLink to="/clubs" class="mobile-link" @click="menuOpen=false">Clubs</RouterLink>
          <RouterLink to="/coaches" class="mobile-link" @click="menuOpen=false">Coaches</RouterLink>
          <RouterLink to="/arbitres" class="mobile-link" @click="menuOpen=false">Arbitres</RouterLink>
        </div>
        <div class="mobile-section">
          <div class="mobile-sec-title">Compétitions</div>
          <RouterLink to="/competitions" class="mobile-link" @click="menuOpen=false">Compétitions</RouterLink>
          <RouterLink to="/matchs" class="mobile-link" @click="menuOpen=false">Matchs</RouterLink>
          <RouterLink to="/classement" class="mobile-link" @click="menuOpen=false">Classements</RouterLink>
          <RouterLink to="/buteurs" class="mobile-link" @click="menuOpen=false">Top Buteurs</RouterLink>
        </div>
        <div class="mobile-section">
          <div class="mobile-sec-title">National & Données</div>
          <RouterLink to="/national" class="mobile-link mobile-national" @click="menuOpen=false">Équipe Nationale</RouterLink>
          <RouterLink to="/statistiques" class="mobile-link" @click="menuOpen=false">Statistiques</RouterLink>
          <RouterLink to="/transferts" class="mobile-link" @click="menuOpen=false">Radar Transferts</RouterLink>
          <RouterLink to="/distinctions" class="mobile-link" @click="menuOpen=false">Distinctions</RouterLink>
        </div>
        <div class="mobile-section">
          <div class="mobile-sec-title">Média & Plus</div>
          <RouterLink to="/actualites" class="mobile-link" @click="menuOpen=false">Actualités</RouterLink>
          <RouterLink to="/votes" class="mobile-link" @click="menuOpen=false">Votes & Awards</RouterLink>
          <RouterLink to="/education" class="mobile-link" @click="menuOpen=false">Espace Éducation</RouterLink>
          <RouterLink to="/self-report" class="mobile-link mobile-cta" @click="menuOpen=false">+ Je rejoins Pivot</RouterLink>
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
const isScrolled = ref(false)
const isLight = ref(false)
const menuOpen = ref(false)
const hasLiveMatch = ref(false)
const activeDrop = ref<string|null>(null)
let dropTimer: ReturnType<typeof setTimeout>

function openDrop(name: string) { clearTimeout(dropTimer); activeDrop.value = name }
function closeDrop() { dropTimer = setTimeout(() => { activeDrop.value = null }, 130) }
function isActive(paths: string[]) { return paths.some(p => route.path.startsWith(p)) }
function toggleTheme() {
  isLight.value = !isLight.value
  document.documentElement.classList.toggle('light', isLight.value)
  localStorage.setItem('pivot-theme', isLight.value ? 'light' : 'dark')
}
function onScroll() { isScrolled.value = window.scrollY > 40 }

async function checkLive() {
  const { count } = await supabase.from('matchs').select('id', { count: 'exact', head: true }).eq('statut', 'en_cours')
  hasLiveMatch.value = (count ?? 0) > 0
}

onMounted(() => {
  isLight.value = localStorage.getItem('pivot-theme') === 'light'
  document.documentElement.classList.toggle('light', isLight.value)
  window.addEventListener('scroll', onScroll, { passive: true })
  checkLive()
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.pivot-nav {
  position:fixed; top:0; left:0; right:0; z-index:100;
  background:rgba(8,8,14,0.90);
  backdrop-filter:blur(20px) saturate(1.4); -webkit-backdrop-filter:blur(20px);
  border-bottom:1px solid var(--p-border);
  transition:all 200ms ease;
}
.pivot-nav::before {
  content:''; position:absolute; top:0; left:0; right:0; height:2px;
  background:linear-gradient(90deg, var(--p-green) 0%, var(--p-gold) 33%, var(--p-red) 66%, var(--p-gold) 100%);
  opacity:0.85;
}
html.light .pivot-nav { background:rgba(240,237,232,0.95); }
.pivot-nav.scrolled { background:rgba(8,8,14,0.99); border-bottom-color:rgba(201,162,39,0.3); }
html.light .pivot-nav.scrolled { background:rgba(240,237,232,0.99); box-shadow:0 2px 20px rgba(0,0,0,0.1); }

.nav-inner { display:flex; align-items:center; gap:16px; height:62px; }

.nav-logo { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.logo-img { height:38px; width:38px; border-radius:50%; object-fit:cover; border:2px solid var(--p-gold); box-shadow:0 0 14px rgba(201,162,39,0.35); }
.logo-text { display:flex; flex-direction:column; line-height:1; }
.logo-main { font-family:var(--font-display); font-size:1.25rem; color:var(--p-gold); letter-spacing:0.12em; }
.logo-sub { font-family:var(--font-condensed); font-size:9px; font-weight:700; color:var(--p-sub); letter-spacing:0.2em; text-transform:uppercase; }

.nav-links { display:flex; gap:2px; flex:1; align-items:center; }
.nav-link {
  display:inline-flex; align-items:center; gap:5px; padding:6px 10px; border-radius:6px;
  font-size:13px; font-weight:600; color:var(--p-sub);
  transition:color 130ms, background 130ms;
  background:none; border:none; cursor:pointer; font-family:inherit;
}
.nav-link:hover { color:var(--p-text); background:rgba(201,162,39,0.06); }
.nav-link.active { color:var(--p-gold); }
.caret { transition:transform 180ms; }
.nav-dropdown:hover .caret { transform:rotate(180deg); }

.cam-flag { display:inline-flex; overflow:hidden; border-radius:2px; width:16px; height:11px; flex-shrink:0; }
.f { flex:1; height:100%; }
.f.g { background:#007A5E; } .f.r { background:#CE1126; } .f.y { background:#FCD116; }

.nav-dropdown { position:relative; }
.drop-menu {
  position:absolute; top:calc(100% + 8px); left:50%; transform:translateX(-50%);
  min-width:210px; background:var(--p-card2);
  border:1px solid var(--p-border); border-radius:var(--radius-lg);
  padding:6px; box-shadow:0 20px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,162,39,0.06);
  z-index:200;
}
html.light .drop-menu { box-shadow:0 8px 24px rgba(0,0,0,0.14); }
.drop-item {
  display:flex; align-items:center; gap:9px; padding:9px 12px; border-radius:var(--radius-md);
  font-size:13px; font-weight:500; color:var(--p-sub);
  transition:color 110ms, background 110ms;
}
.drop-item:hover { color:var(--p-text); background:rgba(201,162,39,0.08); }
.drop-cta { color:var(--p-gold); font-weight:600; }
.drop-cta:hover { background:var(--p-gold-soft); }
.drop-divider { height:1px; background:var(--p-border); margin:4px 0; }

.drop-enter-active, .drop-leave-active { transition:opacity 130ms, transform 130ms; }
.drop-enter-from, .drop-leave-to { opacity:0; transform:translateX(-50%) translateY(-6px); }

.nav-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.live-badge {
  display:flex; align-items:center; gap:5px; padding:4px 10px; border-radius:99px;
  background:rgba(0,168,126,0.12); border:1px solid var(--p-green-bright);
  color:var(--p-green-bright); font-size:11px; font-weight:700; letter-spacing:0.1em; font-family:var(--font-condensed);
}
.live-dot { width:6px; height:6px; border-radius:50%; background:var(--p-green-bright); animation:pulseG 1.6s ease-in-out infinite; }
@keyframes pulseG { 0%,100%{opacity:1;box-shadow:0 0 5px var(--p-green-bright)} 50%{opacity:.4;box-shadow:none} }

.theme-btn { width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--p-sub); border:1px solid var(--p-border); transition:color 130ms, border-color 130ms, background 130ms; }
.theme-btn:hover { color:var(--p-gold); border-color:var(--p-gold); background:var(--p-gold-soft); }

.burger-btn { display:none; flex-direction:column; gap:5px; width:34px; height:34px; align-items:center; justify-content:center; border-radius:8px; border:1px solid var(--p-border); }
.burger-btn span { width:18px; height:2px; background:var(--p-text); border-radius:2px; transition:all 220ms ease; display:block; }
.burger-btn span.open:nth-child(1) { transform:translateY(7px) rotate(45deg); }
.burger-btn span.open:nth-child(2) { opacity:0; transform:scaleX(0); }
.burger-btn span.open:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }

.mobile-menu { border-top:1px solid var(--p-border); padding:12px 20px 24px; background:var(--p-bg2); display:flex; flex-direction:column; gap:18px; }
.mobile-section { display:flex; flex-direction:column; gap:2px; }
.mobile-sec-title { font-size:10px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:var(--p-gold); padding:4px 0 8px; opacity:0.7; }
.mobile-link { display:block; padding:9px 12px; border-radius:var(--radius-md); font-size:14px; font-weight:500; color:var(--p-sub); transition:color 110ms, background 110ms; }
.mobile-link:hover { color:var(--p-text); background:rgba(201,162,39,0.07); }
.mobile-national { color:var(--p-green-bright); font-weight:600; }
.mobile-cta { color:var(--p-gold); font-weight:700; }

.menu-enter-active, .menu-leave-active { transition:all 200ms ease; overflow:hidden; }
.menu-enter-from, .menu-leave-to { opacity:0; max-height:0; }
.menu-enter-to, .menu-leave-from { max-height:700px; opacity:1; }

@media (max-width:900px) { .nav-links { display:none; } .burger-btn { display:flex; } }
@media (max-width:480px) { .logo-text { display:none; } }
</style>
