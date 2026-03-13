-- ═══════════════════════════════════════════════════════════════════════════
-- PIVOT — Migration Supabase PostgreSQL v2.0
-- 22 tables — handball camerounais
-- Exécuter dans : Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ─── Types enum ──────────────────────────────────────────────────────────────
CREATE TYPE discipline_type AS ENUM ('avertissement','carton_jaune','suspension_2min','carton_rouge','carton_bleu');
CREATE TYPE fiabilite_niveau AS ENUM ('1','2','3','4');
CREATE TYPE genre_type AS ENUM ('masculin','feminin','mixte');
CREATE TYPE competition_type AS ENUM ('regional','national','universitaire','coupe','international');
CREATE TYPE statut_match AS ENUM ('programme','en_cours','termine','reporte','annule');
CREATE TYPE role_user AS ENUM ('admin','saisie','viewer');
CREATE TYPE type_licence AS ENUM ('club','universite','les_deux');
CREATE TYPE categorie_nationale AS ENUM ('senior','u20','u17','beach');
CREATE TYPE statut_selection AS ENUM ('preselectione','finaliste','titulaire');
CREATE TYPE type_but AS ENUM ('normal','penalty','7m');
CREATE TYPE categorie_document AS ENUM ('regles','droits_joueur','droits_club','arbitrage','officiel','pedagogue');
CREATE TYPE format_document AS ENUM ('pdf','xlsx','csv','html');

-- ─── 1. universites ──────────────────────────────────────────────────────────
CREATE TABLE universites (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nom        TEXT NOT NULL,
  ville      TEXT NOT NULL,
  abrev      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. clubs ────────────────────────────────────────────────────────────────
CREATE TABLE clubs (
  id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nom                  TEXT NOT NULL,
  acronyme             TEXT,
  region               TEXT NOT NULL,
  ville                TEXT NOT NULL,
  gymnase              TEXT,
  couleur_principale   TEXT,
  universitaire        BOOLEAN DEFAULT FALSE,
  universite_id        UUID REFERENCES universites(id),
  actif                BOOLEAN DEFAULT TRUE,
  logo_cloudinary_id   TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. joueurs ──────────────────────────────────────────────────────────────
CREATE TABLE joueurs (
  id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prenom               TEXT NOT NULL,
  nom                  TEXT NOT NULL,
  poste_principal      TEXT NOT NULL,  -- gardien,ailier_g,ailier_d,arriere_g,arriere_d,demi_centre,pivot
  poste_secondaire     TEXT,
  bras_fort            TEXT DEFAULT 'droitier', -- droitier,gaucher,ambidextre
  taille_estimee       INTEGER, -- en cm
  statut_univ          BOOLEAN DEFAULT FALSE,
  date_naissance_approx DATE,
  verifie              BOOLEAN DEFAULT FALSE,
  score_ia             INTEGER DEFAULT 50 CHECK (score_ia BETWEEN 0 AND 100),
  badge_talent         BOOLEAN DEFAULT FALSE,
  photo_cloudinary_id  TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Index recherche plein texte joueurs
CREATE INDEX idx_joueurs_search ON joueurs USING gin(to_tsvector('french', prenom || ' ' || nom));

-- ─── 4. licences_saison ──────────────────────────────────────────────────────
-- Table pivot centrale : gère la double appartenance club + université
CREATE TABLE licences_saison (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  joueur_id      UUID NOT NULL REFERENCES joueurs(id) ON DELETE CASCADE,
  club_id        UUID NOT NULL REFERENCES clubs(id),
  universite_id  UUID REFERENCES universites(id),
  saison         TEXT NOT NULL,  -- ex: "2025-2026"
  type_licence   type_licence DEFAULT 'club',
  numero_maillot INTEGER,
  actif          BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. arbitres ─────────────────────────────────────────────────────────────
CREATE TABLE arbitres (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prenom              TEXT NOT NULL,
  nom                 TEXT NOT NULL,
  niveau              TEXT DEFAULT 'regional', -- regional,national,international
  region              TEXT,
  verifie             BOOLEAN DEFAULT FALSE,
  photo_cloudinary_id TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. equipes_nationales ───────────────────────────────────────────────────
CREATE TABLE equipes_nationales (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nom             TEXT NOT NULL,
  categorie       categorie_nationale NOT NULL,
  genre           genre_type NOT NULL,
  selectionneur   TEXT,
  saison_active   TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 7. selections_joueurs ───────────────────────────────────────────────────
CREATE TABLE selections_joueurs (
  id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  joueur_id            UUID NOT NULL REFERENCES joueurs(id),
  equipe_nationale_id  UUID NOT NULL REFERENCES equipes_nationales(id),
  statut               statut_selection DEFAULT 'preselectione',
  saison               TEXT NOT NULL,
  appel_date           DATE,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(joueur_id, equipe_nationale_id, saison)
);

-- ─── 8. competitions ─────────────────────────────────────────────────────────
CREATE TABLE competitions (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nom        TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  type       competition_type NOT NULL,
  saison     TEXT NOT NULL,
  region     TEXT,
  genre      genre_type DEFAULT 'masculin',
  statut     TEXT DEFAULT 'a_venir',  -- a_venir,en_cours,termine
  niveau     TEXT DEFAULT 'club',     -- club,national,international
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 9. phases ───────────────────────────────────────────────────────────────
CREATE TABLE phases (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  nom            TEXT NOT NULL,
  ordre          INTEGER NOT NULL DEFAULT 1,
  type           TEXT DEFAULT 'poule',  -- poule,knockout,finale
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 10. matchs ──────────────────────────────────────────────────────────────
CREATE TABLE matchs (
  id                 UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phase_id           UUID NOT NULL REFERENCES phases(id),
  club_domicile_id   UUID NOT NULL REFERENCES clubs(id),
  club_exterieur_id  UUID NOT NULL REFERENCES clubs(id),
  date_match         TIMESTAMPTZ NOT NULL,
  score_dom          INTEGER,
  score_ext          INTEGER,
  mi_temps_dom       INTEGER,
  mi_temps_ext       INTEGER,
  statut             statut_match DEFAULT 'programme',
  journee            INTEGER NOT NULL DEFAULT 1,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT diff_clubs CHECK (club_domicile_id != club_exterieur_id)
);

-- ─── 11. matchs_internationaux ───────────────────────────────────────────────
CREATE TABLE matchs_internationaux (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  equipe_nationale_id UUID NOT NULL REFERENCES equipes_nationales(id),
  adversaire          TEXT NOT NULL,
  date_match          DATE NOT NULL,
  score_cam           INTEGER,
  score_adv           INTEGER,
  competition         TEXT NOT NULL,  -- "CAN 2026", "Qualification U20"
  type                TEXT DEFAULT 'can',  -- can,qualification,amical
  statut              statut_match DEFAULT 'programme',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 12. buts ────────────────────────────────────────────────────────────────
CREATE TABLE buts (
  id        UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id  UUID NOT NULL REFERENCES matchs(id) ON DELETE CASCADE,
  joueur_id UUID NOT NULL REFERENCES joueurs(id),
  minute    INTEGER,
  type      type_but DEFAULT 'normal',
  equipe    TEXT NOT NULL,  -- 'domicile' ou 'exterieur'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 13. discipline ──────────────────────────────────────────────────────────
-- 5 niveaux IHF : avertissement, carton_jaune, suspension_2min, carton_rouge, carton_bleu
CREATE TABLE discipline (
  id                 UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id           UUID NOT NULL REFERENCES matchs(id) ON DELETE CASCADE,
  joueur_id          UUID NOT NULL REFERENCES joueurs(id),
  type               discipline_type NOT NULL,
  minute             INTEGER,
  cumul_suspensions  INTEGER DEFAULT 1,  -- Nb total suspensions 2min dans ce match
  rapport_envoye     BOOLEAN DEFAULT FALSE,  -- TRUE si carton bleu + rapport transmis
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 14. classements ─────────────────────────────────────────────────────────
-- Recalculé automatiquement via Trigger à chaque INSERT dans matchs
CREATE TABLE classements (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phase_id   UUID NOT NULL REFERENCES phases(id),
  club_id    UUID NOT NULL REFERENCES clubs(id),
  mj         INTEGER DEFAULT 0,  -- Matchs joués
  v          INTEGER DEFAULT 0,  -- Victoires (+2 pts handball)
  n          INTEGER DEFAULT 0,  -- Nuls (+1 pt)
  d          INTEGER DEFAULT 0,  -- Défaites (0 pt)
  bp         INTEGER DEFAULT 0,  -- Buts pour
  bc         INTEGER DEFAULT 0,  -- Buts contre
  db         INTEGER DEFAULT 0,  -- Différence de buts
  pts        INTEGER DEFAULT 0,  -- V×2 + N×1
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(phase_id, club_id)
);

-- ─── 15. transferts ──────────────────────────────────────────────────────────
CREATE TABLE transferts (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  joueur_id           UUID NOT NULL REFERENCES joueurs(id),
  club_origine_id     UUID REFERENCES clubs(id),
  club_destination_id UUID REFERENCES clubs(id),
  date_transfert      DATE,
  fiabilite           INTEGER NOT NULL CHECK (fiabilite BETWEEN 1 AND 4),
  -- 4=Confirmé, 3=Officieux, 2=Rumeur, 1=Suspicion auto
  type                TEXT DEFAULT 'transfert',  -- transfert,pret,fin_contrat,suspension
  motif               TEXT,
  source              TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 16. sessions_vote ───────────────────────────────────────────────────────
CREATE TABLE sessions_vote (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titre       TEXT NOT NULL,
  type        TEXT NOT NULL,  -- homme_semaine,mvp_mois,joueur_saison, etc.
  tarif_fcfa  INTEGER DEFAULT 0,  -- 0 = gratuit Phase 1
  date_debut  TIMESTAMPTZ NOT NULL,
  date_fin    TIMESTAMPTZ NOT NULL,
  statut      TEXT DEFAULT 'brouillon',  -- brouillon,actif,termine
  payant      BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessions_vote_candidats (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id  UUID NOT NULL REFERENCES sessions_vote(id),
  joueur_id   UUID NOT NULL REFERENCES joueurs(id),
  nb_votes    INTEGER DEFAULT 0,
  UNIQUE(session_id, joueur_id)
);

-- ─── 17. distinctions ────────────────────────────────────────────────────────
CREATE TABLE distinctions (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  joueur_id      UUID REFERENCES joueurs(id),
  club_id        UUID REFERENCES clubs(id),
  type           TEXT NOT NULL,
  saison         TEXT NOT NULL,
  competition_id UUID REFERENCES competitions(id),
  periode        TEXT,  -- "Semaine 14", "Janvier 2026", etc.
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 18. articles ────────────────────────────────────────────────────────────
CREATE TABLE articles (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titre           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  contenu         TEXT NOT NULL,
  categorie       TEXT DEFAULT 'actualite',
  genere_par_ia   BOOLEAN DEFAULT FALSE,
  fournisseur_ia  TEXT,  -- 'groq' ou 'gemini'
  auteur          TEXT,
  competition_id  UUID REFERENCES competitions(id),
  publie_le       TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index recherche plein texte articles
CREATE INDEX idx_articles_search ON articles USING gin(to_tsvector('french', titre || ' ' || contenu));

-- ─── 19. documents_education ─────────────────────────────────────────────────
CREATE TABLE documents_education (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titre       TEXT NOT NULL,
  description TEXT,
  categorie   categorie_document NOT NULL,
  fichier_url TEXT NOT NULL,  -- URL Supabase Storage ou Cloudinary
  format      format_document NOT NULL,
  version     TEXT DEFAULT 'v1.0',
  publie_le   DATE DEFAULT CURRENT_DATE,
  actif       BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index recherche plein texte documents
CREATE INDEX idx_docs_search ON documents_education USING gin(to_tsvector('french', titre || ' ' || COALESCE(description,'')));

-- ─── 20. crowdsourcing_queue ─────────────────────────────────────────────────
CREATE TABLE crowdsourcing_queue (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  joueur_id         UUID REFERENCES joueurs(id),
  type_demande      TEXT NOT NULL,  -- correction,suppression,ajout,reclamation
  telephone_contact TEXT,
  contenu           TEXT NOT NULL,
  statut            TEXT DEFAULT 'en_attente',  -- en_attente,traite,rejete
  traite_le         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 21. users ───────────────────────────────────────────────────────────────
-- Lié à Supabase Auth — row créée à l'inscription
CREATE TABLE users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       role_user DEFAULT 'viewer',
  nom        TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGER : recalcul classement après saisie match
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION recalculer_classement()
RETURNS TRIGGER AS $$
DECLARE
  v_phase_id UUID;
BEGIN
  v_phase_id := COALESCE(NEW.phase_id, OLD.phase_id);

  -- Recalcul complet de la phase
  DELETE FROM classements WHERE phase_id = v_phase_id;

  INSERT INTO classements (phase_id, club_id, mj, v, n, d, bp, bc, db, pts)
  SELECT
    v_phase_id,
    club_id,
    COUNT(*) AS mj,
    COUNT(*) FILTER (WHERE resultat = 'V') AS v,
    COUNT(*) FILTER (WHERE resultat = 'N') AS n,
    COUNT(*) FILTER (WHERE resultat = 'D') AS d,
    SUM(buts_pour) AS bp,
    SUM(buts_contre) AS bc,
    SUM(buts_pour) - SUM(buts_contre) AS db,
    COUNT(*) FILTER (WHERE resultat = 'V') * 2 +
    COUNT(*) FILTER (WHERE resultat = 'N') * 1 AS pts
  FROM (
    -- Côté domicile
    SELECT
      club_domicile_id AS club_id,
      score_dom AS buts_pour, score_ext AS buts_contre,
      CASE WHEN score_dom > score_ext THEN 'V'
           WHEN score_dom = score_ext THEN 'N'
           ELSE 'D' END AS resultat
    FROM matchs
    WHERE phase_id = v_phase_id AND statut = 'termine'
      AND score_dom IS NOT NULL
    UNION ALL
    -- Côté extérieur
    SELECT
      club_exterieur_id AS club_id,
      score_ext AS buts_pour, score_dom AS buts_contre,
      CASE WHEN score_ext > score_dom THEN 'V'
           WHEN score_ext = score_dom THEN 'N'
           ELSE 'D' END AS resultat
    FROM matchs
    WHERE phase_id = v_phase_id AND statut = 'termine'
      AND score_ext IS NOT NULL
  ) resultats
  GROUP BY club_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_classement
AFTER INSERT OR UPDATE ON matchs
FOR EACH ROW
WHEN (NEW.statut = 'termine')
EXECUTE FUNCTION recalculer_classement();

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE universites         ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE joueurs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE licences_saison     ENABLE ROW LEVEL SECURITY;
ALTER TABLE arbitres            ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipes_nationales  ENABLE ROW LEVEL SECURITY;
ALTER TABLE selections_joueurs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE phases              ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchs_internationaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE buts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipline          ENABLE ROW LEVEL SECURITY;
ALTER TABLE classements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE transferts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions_vote       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions_vote_candidats ENABLE ROW LEVEL SECURITY;
ALTER TABLE distinctions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE crowdsourcing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;

-- Lecture publique (toutes les tables de données)
CREATE POLICY "lecture_publique" ON universites         FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON clubs               FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON joueurs             FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON licences_saison     FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON arbitres            FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON equipes_nationales  FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON selections_joueurs  FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON competitions        FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON phases              FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON matchs              FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON matchs_internationaux FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON buts                FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON discipline          FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON classements         FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON transferts          FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON sessions_vote       FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON sessions_vote_candidats FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON distinctions        FOR SELECT USING (true);
CREATE POLICY "lecture_publique" ON articles            FOR SELECT USING (actif IS DISTINCT FROM FALSE);
CREATE POLICY "lecture_publique" ON documents_education FOR SELECT USING (actif = true);

-- Crowdsourcing : tout le monde peut INSERT (formulaire RGPD public)
CREATE POLICY "insert_public" ON crowdsourcing_queue FOR INSERT WITH CHECK (true);

-- Écriture admin (basée sur le role dans la table users)
CREATE POLICY "admin_write" ON clubs               FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin')));
CREATE POLICY "admin_write" ON joueurs             FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin')));
CREATE POLICY "saisie_write" ON matchs             FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','saisie')));
CREATE POLICY "saisie_write" ON buts               FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','saisie')));
CREATE POLICY "saisie_write" ON discipline         FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','saisie')));
CREATE POLICY "admin_write" ON transferts          FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin')));
CREATE POLICY "admin_write" ON articles            FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin')));
CREATE POLICY "admin_write" ON documents_education FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin')));
CREATE POLICY "admin_write" ON selections_joueurs  FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin')));
CREATE POLICY "admin_write" ON distinctions        FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin')));
CREATE POLICY "admin_write" ON crowdsourcing_queue FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin')));

-- Users : chaque utilisateur ne voit que son propre profil
CREATE POLICY "own_profile" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "own_profile_update" ON users FOR UPDATE USING (id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA — Données de base obligatoires
-- ═══════════════════════════════════════════════════════════════════════════

-- Universités camerounaises
INSERT INTO universites (nom, ville, abrev) VALUES
  ('Université de Yaoundé I',         'Yaoundé',     'UY1'),
  ('Université de Yaoundé II',        'Soa',         'UY2'),
  ('Université de Douala',            'Douala',      'UD'),
  ('Université de Dschang',           'Dschang',     'UDS'),
  ('Université de Ngaoundéré',        'Ngaoundéré',  'UN'),
  ('Université de Buéa',              'Buéa',        'UB'),
  ('Université Catholique d''Afrique Centrale', 'Yaoundé', 'UCAC'),
  ('Institut Catholique de Yaoundé',  'Yaoundé',     'ICY');

-- Équipes Nationales CAN 2026 + U20
INSERT INTO equipes_nationales (nom, categorie, genre, selectionneur, saison_active) VALUES
  ('Lions Indomptables Senior Masculin', 'senior', 'masculin', 'À renseigner', '2025-2026'),
  ('U20 Masculin Cameroun',             'u20',    'masculin', 'À renseigner', '2025-2026'),
  ('Senior Féminin Cameroun',           'senior', 'feminin',  'À renseigner', '2025-2026');

-- Compétition CAN Rwanda 2026 (déjà jouée)
INSERT INTO competitions (nom, slug, type, saison, genre, statut, niveau) VALUES
  ('CAN Rwanda 2026 — Senior Masculin', 'can-rwanda-2026-senior-h', 'international', '2025-2026', 'masculin', 'termine', 'international');
