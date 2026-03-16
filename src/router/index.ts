import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    // ─── Layout public ────────────────────────────────────────────────────────
    {
      path: '/',
      component: () => import('@/components/Layout.vue'),
      children: [
        { path: '',                   name: 'home',               component: () => import('@/views/public/HomeView.vue') },
        { path: 'joueurs',            name: 'joueurs',            component: () => import('@/views/public/JoueursView.vue') },
        { path: 'joueurs/:id',        name: 'joueur-detail',      component: () => import('@/views/public/JoueurDetailView.vue') },
        { path: 'clubs',              name: 'clubs',              component: () => import('@/views/public/ClubsView.vue') },
        { path: 'clubs/:id',          name: 'club-detail',        component: () => import('@/views/public/ClubDetailView.vue') },
        { path: 'competitions',       name: 'competitions',       component: () => import('@/views/public/CompetitionsView.vue') },
        { path: 'competitions/:slug', name: 'competition-detail', component: () => import('@/views/public/CompetitionDetailView.vue') },
        { path: 'matchs',             name: 'matchs',             component: () => import('@/views/public/MatchsView.vue') },
        { path: 'matchs/:id',         name: 'match-detail',       component: () => import('@/views/public/MatchDetailView.vue') },
        { path: 'statistiques',       name: 'statistiques',       component: () => import('@/views/public/StatistiquesView.vue') },
        { path: 'buteurs',            name: 'buteurs',            component: () => import('@/views/public/ButeursView.vue') },
        { path: 'classement',         name: 'classement',         component: () => import('@/views/public/ClassementView.vue') },
        { path: 'distinctions',       name: 'distinctions',       component: () => import('@/views/public/DistinctionsView.vue') },
        { path: 'transferts',         name: 'transferts',         component: () => import('@/views/public/TransfertsView.vue') },
        { path: 'transferts/:id',     name: 'transfert-detail',   component: () => import('@/views/public/TransfertDetailView.vue') },
        { path: 'votes',              name: 'votes',              component: () => import('@/views/public/VotesView.vue') },
        { path: 'votes/:id',          name: 'vote-detail',        component: () => import('@/views/public/VoteDetailView.vue') },
        { path: 'actualites',         name: 'actualites',         component: () => import('@/views/public/ActualitesView.vue') },
        { path: 'actualites/:slug',   name: 'article',            component: () => import('@/views/public/ArticleView.vue') },
        { path: 'education',          name: 'education',          component: () => import('@/views/public/EducationView.vue') },
        { path: 'national',           name: 'national',           component: () => import('@/views/public/NationalView.vue') },
        { path: 'national/:id',       name: 'selection-detail',   component: () => import('@/views/public/SelectionDetailView.vue') },
        { path: 'self-report',        name: 'self-report',        component: () => import('@/views/public/SelfReportView.vue') },
        { path: 'arbitres',           name: 'arbitres',           component: () => import('@/views/public/ArbitresView.vue') },
      ]
    },

    // ─── Login admin (sans layout sidebar) ────────────────────────────────────
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/views/admin/AdminLoginView.vue')
    },

    // ─── Layout admin (avec sidebar) ──────────────────────────────────────────
    {
      path: '/admin',
      component: () => import('@/components/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '',           name: 'admin-dashboard',    component: () => import('@/views/admin/AdminDashboardView.vue') },
        { path: 'joueurs',    name: 'admin-joueurs',      component: () => import('@/views/admin/AdminJoueursView.vue') },
        { path: 'clubs',      name: 'admin-clubs',        component: () => import('@/views/admin/AdminClubsView.vue') },
        { path: 'competitions',name:'admin-competitions', component: () => import('@/views/admin/AdminCompetitionsView.vue') },
        { path: 'matchs',     name: 'admin-matchs',       component: () => import('@/views/admin/SaisieMatchView.vue') },
        { path: 'transferts', name: 'admin-transferts',   component: () => import('@/views/admin/AdminTransfertsView.vue') },
        { path: 'votes',      name: 'admin-votes',        component: () => import('@/views/admin/AdminVotesView.vue') },
        { path: 'articles',   name: 'admin-articles',     component: () => import('@/views/admin/AdminArticlesView.vue') },
        { path: 'distinctions',name:'admin-distinctions', component: () => import('@/views/admin/AdminDistinctionsView.vue') },
        { path: 'education',  name: 'admin-education',    component: () => import('@/views/admin/AdminDocumentsView.vue') },
        { path: 'national',   name: 'admin-national',     component: () => import('@/views/admin/AdminNationalView.vue') },
        { path: 'staff',      name: 'admin-staff',       component: () => import('@/views/admin/AdminStaffView.vue') },
        { path: 'arbitres',   name: 'admin-arbitres',    component: () => import('@/views/admin/AdminArbitresView.vue') },
        { path: 'validation', name: 'admin-validation',   component: () => import('@/views/admin/AdminValidationView.vue') },
        { path: 'alertes',    name: 'admin-alertes',      component: () => import('@/views/admin/AdminAlertesView.vue') },
        { path: 'doublons',   name: 'admin-doublons',     component: () => import('@/views/admin/AdminDoublonsView.vue') },
      ]
    },

    // ─── 404 ──────────────────────────────────────────────────────────────────
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/public/NotFoundView.vue') }
  ]
})

// ─── Guard auth ───────────────────────────────────────────────────────────────
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  const auth = useAuthStore()
  // Attendre l'initialisation (session + rôle) pour éviter les redirections intempestives
  await auth.waitForInit()

  if (!auth.isLogged) return { name: 'admin-login', query: { redirect: to.fullPath } }
  
  // Pour le dashboard admin, permettre si loggé (même viewer)
  if (to.name === 'admin-dashboard') return true
  
  // Pour les autres pages admin, vérifier les droits saisis
  if (!auth.isSaisie) return { name: 'home' } // Viewer ne peut pas accéder au backoffice

  return true
})

export default router
