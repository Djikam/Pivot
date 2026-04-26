<template>
  <footer class="pivot-footer">
    <div class="footer-top-line"/>
    <div class="footer-inner p-container">

      <!-- Brand -->
      <div class="footer-brand">
        <RouterLink to="/" class="footer-logo-wrap">
          <img src="/pivotlogo.jpg" alt="Pivot Hball 237" class="footer-logo-img"/>
          <div>
            <span class="footer-logo-main">PIVOT</span>
            <span class="footer-logo-sub">HBALL 237</span>
          </div>
        </RouterLink>
        <p class="footer-slogan">Le référentiel du handball camerounais.</p>
        <p class="footer-desc">Plateforme indépendante de données, statistiques et suivi du handball au Cameroun.</p>
        <div class="footer-socials">
          <a href="https://www.tiktok.com/@pivot.hball.237" target="_blank" class="social-btn" title="TikTok">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.98a8.25 8.25 0 0 0 4.83 1.54V7.07a4.85 4.85 0 0 1-1.06-.38z"/></svg>
          </a>
          <a href="https://www.facebook.com/pivot.hball.237" target="_blank" class="social-btn" title="Facebook">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <a href="https://www.instagram.com/pivot.hball.237" target="_blank" class="social-btn" title="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
        </div>
      </div>

      <!-- Modules -->
      <div class="footer-col">
        <h4>Modules</h4>
        <RouterLink to="/joueurs">Joueurs — ATLAS</RouterLink>
        <RouterLink to="/competitions">Compétitions — ARENA</RouterLink>
        <RouterLink to="/statistiques">Statistiques — SCOPE</RouterLink>
        <RouterLink to="/transferts">Transferts — RADAR</RouterLink>
        <RouterLink to="/votes">Votes — AWARDS</RouterLink>
        <RouterLink to="/actualites">Actualités — FEED</RouterLink>
        <RouterLink to="/tv">HBall237 TV</RouterLink>
      </div>

      <!-- Découvrir -->
      <div class="footer-col">
        <h4>Découvrir</h4>
        <RouterLink to="/national">Équipe Nationale</RouterLink>
        <RouterLink to="/clubs">Clubs</RouterLink>
        <RouterLink to="/coaches">Coaches</RouterLink>
        <RouterLink to="/arbitres">Arbitres</RouterLink>
        <RouterLink to="/education">Espace Éducation</RouterLink>
        <RouterLink to="/classement">Classements</RouterLink>
        <RouterLink to="/buteurs">Top Buteurs</RouterLink>
        <RouterLink to="/distinctions">Distinctions</RouterLink>
      </div>

      <!-- Données & Contact -->
      <div class="footer-col">
        <h4>Données & Contact</h4>
        <RouterLink to="/self-report">Corriger mes données</RouterLink>
        <a href="mailto:contact@pivothball237.cm">Nous contacter</a>
        <div class="footer-legal-block">
          <span class="footer-legal">Données publiques uniquement</span>
          <span class="footer-legal">Conforme loi n°2010/012</span>
          <span class="footer-legal">Indépendant de la FecaHand</span>
        </div>
      </div>

    </div>

    <div class="footer-bottom p-container">
      <span>© {{ year }} Pivot Hball 237 — Handball Cameroun. Données à titre indicatif.</span>
      <RouterLink to="/self-report" class="footer-cta-link">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Je suis joueur — Rejoindre
      </RouterLink>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.pivot-footer {
  background: var(--p-card);
  border-top: 1px solid var(--p-border);
  margin-top: 80px;
}
.footer-top-line {
  height: 2px;
  background: linear-gradient(90deg, var(--p-green) 0 33.3%, var(--p-red) 33.3% 66.6%, var(--p-yellow) 66.6% 100%);
}
.footer-inner {
  display: grid;
  grid-template-columns: 1.8fr 1fr 1fr 1fr;
  gap: 40px;
  padding-top: 48px;
  padding-bottom: 40px;
}

/* Brand */
.footer-logo-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.footer-logo-img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--p-gold); box-shadow: 0 0 12px rgba(201,162,39,0.3); }
.footer-logo-main { display: block; font-family: var(--font-display); font-size: 1.4rem; color: var(--p-gold); letter-spacing: 0.12em; line-height: 1; }
.footer-logo-sub  { display: block; font-size: 9px; font-weight: 700; color: var(--p-sub); letter-spacing: 0.2em; text-transform: uppercase; }
.footer-slogan { color: var(--p-gold); font-style: italic; font-size: 14px; margin-bottom: 8px; }
.footer-desc { color: var(--p-sub); font-size: 13px; line-height: 1.65; margin-bottom: 18px; }

.footer-socials { display: flex; gap: 8px; }
.social-btn {
  width: 34px; height: 34px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--p-border); color: var(--p-sub);
  transition: color 130ms, border-color 130ms, background 130ms;
}
.social-btn:hover { color: var(--p-gold); border-color: var(--p-gold); background: var(--p-gold-soft); }

/* Cols */
.footer-col { display: flex; flex-direction: column; gap: 6px; }
.footer-col h4 {
  font-size: 11px; font-weight: 700; color: var(--p-sub);
  letter-spacing: 0.1em; text-transform: uppercase;
  margin-bottom: 6px; padding-bottom: 8px;
  border-bottom: 1px solid var(--p-border);
}
.footer-col a {
  font-size: 13px; color: var(--p-muted);
  transition: color 130ms; padding: 2px 0;
}
.footer-col a:hover { color: var(--p-text); }

.footer-legal-block { display: flex; flex-direction: column; gap: 4px; margin-top: 10px; border-top: 1px solid var(--p-border-s); padding-top: 10px; }
.footer-legal { font-size: 11px; color: var(--p-muted); cursor: default; }

/* Bottom */
.footer-bottom {
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;
  padding-top: 18px; padding-bottom: 18px;
  border-top: 1px solid var(--p-border);
  font-size: 12px; color: var(--p-muted);
}
.footer-cta-link {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 600; color: var(--p-gold);
  transition: opacity 130ms;
}
.footer-cta-link:hover { opacity: 0.75; }

@media (max-width: 1000px) { .footer-inner { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px)  { .footer-inner { grid-template-columns: 1fr; } .footer-bottom { flex-direction: column; text-align: center; } }
</style>
