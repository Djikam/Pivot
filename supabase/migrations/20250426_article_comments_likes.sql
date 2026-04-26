-- ── Commentaires articles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS article_commentaires (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id  uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  parent_id   uuid REFERENCES article_commentaires(id) ON DELETE CASCADE,
  pseudo      varchar(80) NOT NULL DEFAULT 'Anonyme',
  contenu     text NOT NULL CHECK (char_length(contenu) BETWEEN 2 AND 1000),
  created_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_commentaires_article ON article_commentaires(article_id);
CREATE INDEX IF NOT EXISTS idx_commentaires_parent  ON article_commentaires(parent_id);
ALTER TABLE article_commentaires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_comments"   ON article_commentaires FOR SELECT USING (true);
CREATE POLICY "public_insert_comments" ON article_commentaires FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_delete_comments"  ON article_commentaires FOR DELETE USING (auth.role() = 'authenticated');

-- ── Likes articles ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS article_likes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id  uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  fingerprint varchar(128) NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(article_id, fingerprint)
);
CREATE INDEX IF NOT EXISTS idx_likes_article ON article_likes(article_id);
ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_likes"   ON article_likes FOR SELECT USING (true);
CREATE POLICY "public_insert_likes" ON article_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "public_delete_likes" ON article_likes FOR DELETE USING (true);

-- ── Colonnes supplémentaires articles ────────────────────────────────────
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_cloudinary_id text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS vues integer DEFAULT 0;
