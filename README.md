# PIVOT — Plateforme Handball Cameroun

> "Le Pivot du handball camerounais."

Stack : Vue.js 3 + Vite + Tailwind + Supabase + Vercel + Cloudinary + PWA

---

## 🚀 Démarrage en 5 étapes

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer les variables d'environnement
```bash
cp .env.example .env
# Remplir les valeurs dans .env
```

Variables requises :
- `VITE_SUPABASE_URL` — depuis Supabase > Settings > API
- `VITE_SUPABASE_ANON_KEY` — depuis Supabase > Settings > API
- `VITE_CLOUDINARY_CLOUD_NAME` — depuis Cloudinary Dashboard
- `VITE_CLOUDINARY_UPLOAD_PRESET` — créer un Upload Preset "Unsigned"
- `VITE_GROQ_API_KEY` — depuis console.groq.com
- `VITE_GEMINI_API_KEY` — depuis aistudio.google.com

### 3. Initialiser la base de données Supabase
1. Créer un projet sur supabase.com
2. Aller dans SQL Editor
3. Copier/coller le contenu de `supabase/migrations/001_init.sql`
4. Exécuter

### 4. Lancer en développement
```bash
npm run dev
# → http://localhost:5173
```

### 5. Build production
```bash
npm run build
# Déployer le dossier /dist sur Vercel
```

---

## 📁 Structure du projet

```
src/
├── assets/
│   ├── pivot.css        # Design system PIVOT (bordeaux/or + motifs africains)
│   └── tailwind.css     # Import Tailwind
├── lib/
│   ├── supabaseClient.ts  # Client Supabase + helper Cloudinary
│   ├── aiClient.ts        # Groq + Gemini fallback automatique
│   └── database.types.ts  # Types TypeScript des 22 tables
├── stores/
│   └── auth.ts           # Pinia — authentification admin
├── router/
│   └── index.ts          # Vue Router — routes publiques + admin
├── components/
│   ├── Layout.vue         # Layout public (navbar + footer)
│   ├── AdminLayout.vue    # Layout admin (sidebar)
│   ├── AppNavbar.vue      # Navbar sticky
│   ├── AppSidebar.vue     # Sidebar backoffice
│   ├── AppFooter.vue      # Footer public
│   ├── KenteDivider.vue   # Motif Kente africain (séparateur)
│   ├── DisciplineBadge.vue # Badge discipline handball IHF 5 niveaux
│   ├── JoueurCard.vue     # Card joueur réutilisable
│   ├── ClubCard.vue       # Card club
│   └── CompetitionCard.vue # Card compétition
├── views/
│   ├── public/            # 22 vues publiques
│   └── admin/             # 13 vues backoffice
└── App.vue
```

---

## 🎨 Design System

Importer dans les composants : **aucun import nécessaire** — `pivot.css` est global.

### Couleurs principales
- `--p-red: #8C1525` — bordeaux PIVOT
- `--p-gold: #C4922A` — or PIVOT
- `--p-bg: #070409` — fond sombre

### Motifs africains
- `.kente-divider` — séparateur tissu Kente (Kente, or/vert/rouge/bleu)
- `.adinkra-watermark` — watermark Adinkra sur sections hero
- `.sawa-bg` — géométrie Sawa (Littoral Cameroun) en background

### Discipline handball (5 niveaux IHF)
```html
<DisciplineBadge type="avertissement" />
<DisciplineBadge type="carton_jaune" />
<DisciplineBadge type="suspension_2min" :count="2" />
<DisciplineBadge type="carton_rouge" />
<DisciplineBadge type="carton_bleu" />
```

---

## 🤖 IA — Groq + Gemini Fallback

```typescript
import { callAI, calculerScoreIA, resumeMatch } from '@/lib/aiClient'

// Bascule automatique Groq → Gemini si quota épuisé
const result = await callAI('Votre prompt', { maxTokens: 200 })
console.log(result.provider) // 'groq' ou 'gemini'
```

---

## 📱 PWA

L'app est installable sur mobile via Chrome/Safari.
Le Service Worker cache les données Supabase (5 min) et les images Cloudinary (24h).

---

## 🗄️ Base de données (22 tables)

| Domaine | Tables |
|---------|--------|
| Entités | universites, clubs, joueurs, licences_saison, arbitres |
| National | equipes_nationales, selections_joueurs |
| Compétitions | competitions, phases, matchs, matchs_internationaux |
| Événements | buts, discipline (5 niveaux IHF) |
| Résultats | classements (trigger auto) |
| Méta | transferts, sessions_vote, distinctions, articles |
| Éducation | documents_education |
| RGPD | crowdsourcing_queue |
| Auth | users |

---

## 🚀 Déploiement Vercel

```bash
# Connecter le repo GitHub à Vercel
# Variables d'environnement à définir dans Vercel Dashboard
npm run build && vercel --prod
```
