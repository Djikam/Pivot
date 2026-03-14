-- ─── 002_add_competition_clubs ──────────────────────────────────────────────
-- Table de jonction pour lier des clubs à une compétition (participation)
-- Utilisée côté admin pour gérer les participants d'une compétition.

CREATE TABLE competition_clubs (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  club_id        UUID NOT NULL REFERENCES clubs(id),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, club_id)
);
