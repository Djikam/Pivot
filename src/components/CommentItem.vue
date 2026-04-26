<template>
  <div class="comment-item" :class="{ 'is-reply': isReply }">
    <div class="comment-avatar">
      <span class="avatar-letter">{{ (comment.pseudo || 'A')[0].toUpperCase() }}</span>
    </div>
    <div class="comment-content">
      <div class="comment-header">
        <span class="comment-pseudo">{{ comment.pseudo || 'Anonyme' }}</span>
        <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
      </div>
      <p class="comment-text">{{ comment.contenu }}</p>
      <div class="comment-actions">
        <button v-if="!isReply" class="action-btn" @click="$emit('reply', comment.id)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
          Répondre
        </button>
        <button v-if="auth.isLogged" class="action-btn action-delete" @click="deleteComment">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Supprimer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabaseClient'

const auth = useAuthStore()

const props = defineProps<{
  comment: { id: string; pseudo?: string; contenu: string; created_at: string; parent_id?: string }
  articleId: string
  isReply?: boolean
}>()

const emit = defineEmits<{
  (e: 'reply', id: string): void
  (e: 'refresh'): void
}>()

function formatDate(d: string) {
  const date = new Date(d)
  const now = new Date()
  const diff = (now.getTime() - date.getTime()) / 1000
  if (diff < 60) return 'à l\'instant'
  if (diff < 3600) return `il y a ${Math.floor(diff/60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff/3600)} h`
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

async function deleteComment() {
  if (!confirm('Supprimer ce commentaire ?')) return
  await supabase.from('article_commentaires').delete().eq('id', props.comment.id)
  emit('refresh')
}
</script>

<style scoped>
.comment-item {
  display: flex; gap: 12px;
  padding: 16px 0;
}
.comment-item.is-reply { padding: 12px 0; }

.comment-avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, var(--p-gold-dk), var(--p-red-dk));
  display: flex; align-items: center; justify-content: center;
}
.is-reply .comment-avatar { width: 28px; height: 28px; }

.avatar-letter { font-family: var(--font-display); font-size: 16px; color: var(--p-gold); }
.is-reply .avatar-letter { font-size: 13px; }

.comment-content { flex: 1; min-width: 0; }

.comment-header {
  display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px;
}
.comment-pseudo {
  font-size: 13px; font-weight: 700; color: var(--p-text);
}
.comment-date { font-size: 11px; color: var(--p-muted); }

.comment-text {
  font-size: 14px; line-height: 1.65; color: var(--p-text);
  white-space: pre-wrap; word-break: break-word;
}

.comment-actions {
  display: flex; gap: 12px; margin-top: 8px;
}
.action-btn {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600; color: var(--p-muted);
  letter-spacing: 0.02em; font-family: inherit;
  transition: color 120ms;
}
.action-btn:hover { color: var(--p-gold); }
.action-delete:hover { color: var(--p-red) !important; }
</style>
