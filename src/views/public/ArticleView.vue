<template>
  <div v-if="!article && loading" class="loading-state" style="padding:120px 0"><div class="spinner"/></div>
  <div v-else-if="!article" class="empty-state" style="padding:120px 0">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p>Article introuvable.</p>
    <RouterLink to="/actualites" class="p-btn-ghost p-btn-sm" style="margin-top:8px">Retour aux actualités</RouterLink>
  </div>

  <div v-else>
    <!-- Cover image -->
    <div class="article-cover" :style="getCoverStyle()">
      <div class="cover-overlay"/>
      <div class="cover-content p-container">
        <RouterLink to="/actualites" class="back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Actualités
        </RouterLink>
        <div class="cover-badges">
          <span class="p-badge p-badge-gold">{{ article.categorie }}</span>
          <span v-if="article.genere_par_ia" class="p-badge p-badge-blue">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Généré par IA — {{ (article.fournisseur_ia||'').toUpperCase() }}
          </span>
        </div>
        <h1 class="cover-title font-display">{{ article.titre }}</h1>
        <div class="cover-meta">
          <span>{{ formatDate(article.publie_le) }}</span>
          <span v-if="article.auteur" class="meta-sep">·</span>
          <span v-if="article.auteur">{{ article.auteur }}</span>
          <span class="meta-sep">·</span>
          <span>{{ readTime }} min de lecture</span>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-container article-layout">

      <div class="article-main">

        <!-- Corps de l'article -->
        <article class="article-body">
          {{ article.contenu }}
        </article>

        <!-- Tags -->
        <div v-if="article.tags?.length" class="tags-row">
          <span v-for="tag in article.tags" :key="tag" class="tag-chip">#{{ tag }}</span>
        </div>

        <!-- Barre likes -->
        <div class="likes-bar">
          <button class="like-btn" :class="{ liked: hasLiked }" @click="toggleLike">
            <svg width="20" height="20" viewBox="0 0 24 24" :fill="hasLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {{ likeCount }} {{ likeCount === 1 ? 'J\'aime' : 'J\'aime' }}
          </button>
          <button class="share-btn" @click="copyLink">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            {{ copied ? 'Lien copié !' : 'Partager' }}
          </button>
        </div>

        <div class="gold-line"/>

        <!-- Section commentaires -->
        <section class="comments-section">
          <h2 class="comments-title font-display">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Discussion
            <span class="comments-count">{{ totalComments }}</span>
          </h2>

          <!-- Formulaire nouveau commentaire -->
          <div class="comment-form root-form">
            <div class="form-row-inline">
              <input v-model="newPseudo" class="p-input pseudo-input" placeholder="Pseudo (optionnel)" maxlength="60" />
            </div>
            <textarea v-model="newContenu" class="p-input comment-textarea" placeholder="Partagez votre avis sur cet article…" rows="3" maxlength="1000"/>
            <div class="form-actions">
              <span class="char-count" :class="{ warn: newContenu.length > 900 }">{{ newContenu.length }}/1000</span>
              <button class="p-btn-gold p-btn-sm" :disabled="newContenu.trim().length < 2 || sendingComment" @click="submitComment(null)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                {{ sendingComment ? 'Envoi…' : 'Commenter' }}
              </button>
            </div>
          </div>

          <!-- Liste commentaires -->
          <div v-if="loadingComments" class="loading-state" style="padding:32px 0"><div class="spinner"/></div>
          <div v-else-if="!comments.length" class="no-comments">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <p>Aucun commentaire encore. Soyez le premier !</p>
          </div>
          <div v-else class="comments-list">
            <div v-for="c in topComments" :key="c.id" class="comment-thread">
              <CommentItem :comment="c" :article-id="article.id" @reply="onReply" @refresh="loadComments" />
              <!-- Replies -->
              <div v-if="getReplies(c.id).length" class="replies">
                <CommentItem v-for="r in getReplies(c.id)" :key="r.id" :comment="r" :article-id="article.id" :is-reply="true" @reply="onReply" @refresh="loadComments" />
              </div>
              <!-- Form reply inline si actif -->
              <div v-if="replyTo === c.id" class="reply-form">
                <div class="reply-indicator">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
                  Répondre à <strong>{{ c.pseudo || 'Anonyme' }}</strong>
                  <button class="cancel-reply" @click="replyTo=null">Annuler</button>
                </div>
                <input v-model="replyPseudo" class="p-input pseudo-input" placeholder="Pseudo (optionnel)" maxlength="60" />
                <textarea v-model="replyContenu" class="p-input comment-textarea" rows="2" placeholder="Votre réponse…" maxlength="500"/>
                <div class="form-actions">
                  <button class="p-btn-gold p-btn-sm" :disabled="replyContenu.trim().length < 2 || sendingReply" @click="submitComment(c.id)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    {{ sendingReply ? 'Envoi…' : 'Répondre' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Sidebar -->
      <aside class="article-sidebar">
        <div class="sidebar-card p-card">
          <h4 class="sidebar-title">À propos</h4>
          <div class="sidebar-stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {{ formatDate(article.publie_le) }}
          </div>
          <div v-if="article.auteur" class="sidebar-stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {{ article.auteur }}
          </div>
          <div class="sidebar-stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {{ readTime }} min de lecture
          </div>
          <div class="sidebar-stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {{ likeCount }} j'aime
          </div>
          <div class="sidebar-stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {{ totalComments }} commentaire{{ totalComments !== 1 ? 's' : '' }}
          </div>
        </div>

        <div v-if="related.length" class="sidebar-card p-card">
          <h4 class="sidebar-title">À lire aussi</h4>
          <RouterLink v-for="r in related" :key="r.id" :to="'/actualites/'+r.slug" class="related-item">
            <span class="p-badge p-badge-muted" style="font-size:9px">{{ r.categorie }}</span>
            <p class="related-title truncate-2">{{ r.titre }}</p>
          </RouterLink>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import CommentItem from '@/components/CommentItem.vue'

const route = useRoute()
const article = ref<any>(null)
const loading = ref(true)
const comments = ref<any[]>([])
const loadingComments = ref(true)
const related = ref<any[]>([])

// Likes
const likeCount = ref(0)
const hasLiked = ref(false)
const fingerprint = ref('')

// Commentaires
const newPseudo = ref('')
const newContenu = ref('')
const replyPseudo = ref('')
const replyContenu = ref('')
const replyTo = ref<string|null>(null)
const sendingComment = ref(false)
const sendingReply = ref(false)

// Share
const copied = ref(false)

// ── Computed ──────────────────────────────────────────────────
const readTime = computed(() => {
  if (!article.value) return 0
  const words = article.value.contenu.split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
})

const totalComments = computed(() => comments.value.length)
const topComments = computed(() => comments.value.filter(c => !c.parent_id))
function getReplies(parentId: string) { return comments.value.filter(c => c.parent_id === parentId) }

// ── Fingerprint ───────────────────────────────────────────────
async function getFingerprint() {
  const stored = localStorage.getItem('pivot-fp')
  if (stored) { fingerprint.value = stored; return }
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  const fp = Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('')
  localStorage.setItem('pivot-fp', fp)
  fingerprint.value = fp
}

// ── Likes ─────────────────────────────────────────────────────
async function loadLikes() {
  if (!article.value) return
  const { count } = await supabase.from('article_likes').select('id', { count: 'exact', head: true }).eq('article_id', article.value.id)
  likeCount.value = count ?? 0
  const { data } = await supabase.from('article_likes').select('id').eq('article_id', article.value.id).eq('fingerprint', fingerprint.value).maybeSingle()
  hasLiked.value = !!data
}

async function toggleLike() {
  if (!article.value) return
  if (hasLiked.value) {
    await supabase.from('article_likes').delete().eq('article_id', article.value.id).eq('fingerprint', fingerprint.value)
    likeCount.value = Math.max(0, likeCount.value - 1)
    hasLiked.value = false
  } else {
    const { error } = await supabase.from('article_likes').insert({ article_id: article.value.id, fingerprint: fingerprint.value })
    if (!error) { likeCount.value++; hasLiked.value = true }
  }
}

// ── Commentaires ──────────────────────────────────────────────
async function loadComments() {
  if (!article.value) return
  loadingComments.value = true
  const { data } = await supabase
    .from('article_commentaires')
    .select('id,parent_id,pseudo,contenu,created_at')
    .eq('article_id', article.value.id)
    .order('created_at', { ascending: true })
  comments.value = data ?? []
  loadingComments.value = false
}

async function submitComment(parentId: string | null) {
  if (!article.value) return
  const isReply = parentId !== null
  const contenu = isReply ? replyContenu.value.trim() : newContenu.value.trim()
  const pseudo = (isReply ? replyPseudo.value.trim() : newPseudo.value.trim()) || 'Anonyme'
  if (contenu.length < 2) return

  if (isReply) sendingReply.value = true
  else sendingComment.value = true

  const { error } = await supabase.from('article_commentaires').insert({
    article_id: article.value.id,
    parent_id: parentId,
    pseudo,
    contenu
  })
  if (!error) {
    if (isReply) { replyContenu.value = ''; replyPseudo.value = ''; replyTo.value = null }
    else { newContenu.value = ''; newPseudo.value = '' }
    await loadComments()
  }
  if (isReply) sendingReply.value = false
  else sendingComment.value = false
}

function onReply(commentId: string) {
  replyTo.value = commentId === replyTo.value ? null : commentId
}

// ── Share ─────────────────────────────────────────────────────
function copyLink() {
  navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2200)
}

// ── Styles ────────────────────────────────────────────────────
const catGrad: Record<string,string> = {
  'Actualité':    'linear-gradient(135deg, #1C1428, #2A1E38)',
  'Résumé match': 'linear-gradient(135deg, #0A1520, #0E2030)',
  'Analyse':      'linear-gradient(135deg, #0A1410, #0E2018)',
  'Transfert':    'linear-gradient(135deg, #18100A, #241408)',
  'National':     'linear-gradient(135deg, #0C1C0C, #0E2010)',
}
function getCoverStyle() {
  if (article.value?.image_url) return { backgroundImage: `url(${article.value.image_url})` }
  return { background: catGrad[article.value?.categorie] || 'linear-gradient(135deg, #0F0F1E, #1A1A2E)' }
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

// ── Init ──────────────────────────────────────────────────────
onMounted(async () => {
  await getFingerprint()
  const { data } = await supabase.from('articles').select('*').eq('slug', route.params.slug as string).single()
  article.value = data
  loading.value = false
  if (data) {
    await Promise.all([loadLikes(), loadComments()])
    // Articles liés
    const { data: rel } = await supabase.from('articles')
      .select('id,titre,slug,categorie')
      .eq('categorie', data.categorie)
      .neq('id', data.id)
      .order('publie_le', { ascending: false })
      .limit(4)
    related.value = rel ?? []
    // Incrémenter vues
    await supabase.from('articles').update({ vues: (data.vues ?? 0) + 1 }).eq('id', data.id)
  }
})
</script>

<style scoped>
/* Cover */
.article-cover {
  width: 100%; min-height: 420px;
  background-size: cover; background-position: center;
  position: relative; display: flex; align-items: flex-end;
}
.cover-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(8,8,14,0.97) 0%, rgba(8,8,14,0.5) 50%, rgba(8,8,14,0.2) 100%);
}
.cover-content { position: relative; z-index: 1; padding-bottom: 48px; display: flex; flex-direction: column; gap: 12px; }
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 500; color: var(--p-sub);
  margin-bottom: 8px;
  transition: color 130ms;
}
.back-btn:hover { color: var(--p-gold); }
.cover-badges { display: flex; gap: 8px; flex-wrap: wrap; }
.cover-title { font-size: clamp(1.8rem, 4vw, 3rem); line-height: 1.08; max-width: 720px; }
.cover-meta { font-size: 13px; color: rgba(242,237,228,0.55); display: flex; gap: 8px; flex-wrap: wrap; }
.meta-sep { opacity: 0.4; }

/* Layout */
.article-layout {
  display: grid; grid-template-columns: 1fr 300px;
  gap: 40px; padding-top: 48px; padding-bottom: 80px;
  align-items: start;
}
.article-main { min-width: 0; }

/* Article body */
.article-body {
  font-size: 17px; line-height: 1.85; color: var(--p-text);
  white-space: pre-line; margin-bottom: 28px;
}

/* Tags */
.tags-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; }
.tag-chip {
  padding: 4px 10px; border-radius: 99px;
  background: var(--p-gold-soft); border: 1px solid rgba(201,162,39,0.2);
  color: var(--p-gold); font-size: 12px; font-weight: 600;
}

/* Likes bar */
.likes-bar { display: flex; gap: 12px; align-items: center; margin: 24px 0; }
.like-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 99px;
  border: 1.5px solid var(--p-border);
  font-size: 14px; font-weight: 600; color: var(--p-sub);
  transition: all 150ms; font-family: inherit;
}
.like-btn:hover { border-color: #e53e6e; color: #e53e6e; }
.like-btn.liked { background: rgba(229,62,110,0.12); border-color: #e53e6e; color: #e53e6e; }
.share-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 18px; border-radius: 99px;
  border: 1.5px solid var(--p-border); color: var(--p-sub);
  font-size: 14px; font-weight: 500; transition: all 150ms; font-family: inherit;
}
.share-btn:hover { border-color: var(--p-gold); color: var(--p-gold); }

/* Comments section */
.comments-section { margin-top: 36px; }
.comments-title {
  font-size: 1.5rem; display: flex; align-items: center; gap: 10px;
  margin-bottom: 24px; color: var(--p-text);
}
.comments-count {
  font-family: var(--font-body); font-size: 14px; font-weight: 400;
  color: var(--p-sub); padding: 2px 8px; border-radius: 99px;
  background: var(--p-bg3); border: 1px solid var(--p-border);
}

/* Comment form */
.comment-form {
  background: var(--p-card); border: 1px solid var(--p-border);
  border-radius: var(--radius-lg); padding: 20px;
  display: flex; flex-direction: column; gap: 12px;
  margin-bottom: 32px;
}
.pseudo-input { font-size: 13px; }
.comment-textarea { resize: vertical; min-height: 88px; font-size: 14px; line-height: 1.6; }
.form-actions { display: flex; justify-content: flex-end; align-items: center; gap: 12px; }
.char-count { font-size: 11px; color: var(--p-muted); }
.char-count.warn { color: var(--p-red); }

/* Comments list */
.no-comments { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 48px 0; color: var(--p-muted); font-size: 14px; }
.comments-list { display: flex; flex-direction: column; gap: 0; }
.comment-thread { border-bottom: 1px solid var(--p-border-s); padding-bottom: 0; }
.comment-thread:last-child { border-bottom: none; }
.replies { padding-left: 40px; border-left: 2px solid var(--p-border-s); margin: 0 0 0 20px; }

.reply-form {
  margin: 4px 0 16px 60px;
  background: var(--p-bg3); border: 1px solid var(--p-border);
  border-radius: var(--radius-md); padding: 16px;
  display: flex; flex-direction: column; gap: 10px;
}
.reply-indicator {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; color: var(--p-sub);
}
.cancel-reply {
  margin-left: auto; font-size: 11px; color: var(--p-muted);
  transition: color 120ms;
}
.cancel-reply:hover { color: var(--p-red); }

/* Sidebar */
.article-sidebar { position: sticky; top: 108px; display: flex; flex-direction: column; gap: 16px; }
.sidebar-card { padding: 20px; }
.sidebar-title { font-family: var(--font-condensed); font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--p-gold); margin-bottom: 16px; }
.sidebar-stat { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--p-sub); padding: 6px 0; border-bottom: 1px solid var(--p-border-s); }
.sidebar-stat:last-child { border-bottom: none; }
.related-item { display: flex; flex-direction: column; gap: 6px; padding: 12px 0; border-bottom: 1px solid var(--p-border-s); transition: opacity 130ms; }
.related-item:hover { opacity: 0.8; }
.related-item:last-child { border-bottom: none; }
.related-title { font-size: 13px; font-weight: 600; line-height: 1.4; margin-top: 4px; }

@media (max-width: 900px) {
  .article-layout { grid-template-columns: 1fr; }
  .article-sidebar { position: static; }
}
</style>
