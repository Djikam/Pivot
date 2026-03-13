<template>
  <footer class="pivot-footer">
    <div class="kente-divider"><span v-for="i in 10" :key="i" /></div>
    <div class="footer-inner p-container">
      <div class="footer-brand">
        <span class="footer-logo">PIVOT</span>
        <p class="footer-slogan">"Le Pivot du handball camerounais."</p>
        <p class="footer-desc">Plateforme indépendante de données, de statistiques et de suivi du handball camerounais. Indépendant de la FecaHand.</p>
      </div>
      <div class="footer-col">
        <h4>Modules</h4>
        <RouterLink to="/joueurs">ATLAS — Joueurs</RouterLink>
        <RouterLink to="/competitions">ARENA — Compétitions</RouterLink>
        <RouterLink to="/statistiques">SCOPE — Statistiques</RouterLink>
        <RouterLink to="/transferts">RADAR — Transferts</RouterLink>
        <RouterLink to="/votes">PULSE — Votes</RouterLink>
        <RouterLink to="/actualites">FEED — Actualités</RouterLink>
      </div>
      <div class="footer-col">
        <h4>Découvrir</h4>
        <RouterLink to="/national">🇨🇲 Équipes Nationales</RouterLink>
        <RouterLink to="/education">📚 Espace Éducation</RouterLink>
        <RouterLink to="/arbitres">Arbitres</RouterLink>
        <RouterLink to="/classement">Classements</RouterLink>
        <RouterLink to="/buteurs">Top Buteurs</RouterLink>
        <RouterLink to="/distinctions">Distinctions</RouterLink>
      </div>
      <div class="footer-col">
        <h4>Données & RGPD</h4>
        <RouterLink to="/self-report">Je suis joueur — Corriger mes données</RouterLink>
        <a href="mailto:pivot@handball.cm">Contact</a>
        <span class="footer-legal">Conforme loi camerounaise n°2010/012</span>
        <span class="footer-legal">Données publiques uniquement</span>
      </div>
    </div>
    <div class="footer-bottom p-container">
      <span>© {{ year }} PIVOT — Handball Cameroun. Données à titre indicatif.</span>
      <span class="footer-stack">Vue.js 3 · Supabase · Vercel · PWA</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.pivot-footer {
  background: var(--p-card); border-top: 1px solid var(--p-border);
  margin-top: 80px;
}
.footer-inner {
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px; padding-top: 48px; padding-bottom: 40px;
}
.footer-brand {}
.footer-logo {
  font-family: var(--font-display); font-size: 2rem; font-weight: 700;
  color: var(--p-red); display: block; margin-bottom: 8px;
}
.footer-slogan { color: var(--p-gold); font-style: italic; font-size: 14px; margin-bottom: 10px; }
.footer-desc { color: var(--p-sub); font-size: 13px; line-height: 1.6; }
.footer-col { display: flex; flex-direction: column; gap: 8px; }
.footer-col h4 {
  font-size: 11px; font-weight: 700; color: var(--p-sub);
  letter-spacing: 0.08em; text-transform: uppercase;
  margin-bottom: 4px; padding-bottom: 8px;
  border-bottom: 1px solid var(--p-border);
}
.footer-col a, .footer-col .footer-legal {
  font-size: 13px; color: var(--p-muted);
  transition: color 150ms;
}
.footer-col a:hover { color: var(--p-text); }
.footer-legal { cursor: default; }
.footer-bottom {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 20px; padding-bottom: 20px;
  border-top: 1px solid var(--p-border);
  font-size: 12px; color: var(--p-muted);
}
.footer-stack { color: var(--p-red); font-weight: 500; }
@media (max-width: 900px) {
  .footer-inner { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .footer-inner { grid-template-columns: 1fr; }
  .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
}
</style>
