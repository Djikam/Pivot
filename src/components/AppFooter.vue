<template>
  <footer class="pivot-footer">
    <div class="footer-gold-line"/>
    <div class="footer-inner p-container">
      <div class="footer-brand">
        <div class="footer-brand-logo"><img src="/pivotlogo.jpg" alt="Pivot Hball 237" class="footer-logo-img" /><div><span class="footer-logo-main">PIVOT</span><span class="footer-logo-sub">HBALL 237</span></div></div>
        <p class="footer-slogan">"Le référentiel du handball camerounais."</p>
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
        <RouterLink to="/national"> Équipes Nationales</RouterLink>
        <RouterLink to="/education"> Espace Éducation</RouterLink>
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
.footer-gold-line { height:1px; background:linear-gradient(90deg, transparent, rgba(201,162,39,0.5) 30%, rgba(201,162,39,0.5) 70%, transparent); }
.footer-brand-logo { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
.footer-logo-img { width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid var(--p-gold); }
.footer-logo-main { display:block; font-family:var(--font-display); font-size:1.3rem; color:var(--p-gold); letter-spacing:0.12em; }
.footer-logo-sub { display:block; font-size:9px; font-weight:700; color:var(--p-sub); letter-spacing:0.2em; text-transform:uppercase; }
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
