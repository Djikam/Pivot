<template>
  <div class="login-page adinkra-watermark">
    <div class="login-box">
      <div class="kente-divider" style="margin-bottom:24px"><span v-for="i in 10" :key="i" /></div>
      <div class="login-logo font-display">PIVOT</div>
      <p class="login-sub text-sub">Administration</p>

      <form @submit.prevent="doLogin" class="login-form">
        <div class="field">
          <label class="p-label">Email</label>
          <input v-model="email" type="email" class="p-input" placeholder="admin@pivot.cm" required autocomplete="email" />
        </div>
        <div class="field">
          <label class="p-label">Mot de passe</label>
          <input v-model="password" type="password" class="p-input" placeholder="••••••••" required autocomplete="current-password" />
        </div>
        <div v-if="error" class="login-error">{{ error }}</div>
        <button type="submit" class="p-btn-red" style="width:100%;justify-content:center" :disabled="loading">
          <span v-if="loading" class="spinner-sm" />
          {{ loading ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>

      <RouterLink to="/" class="back-link text-sub">← Retour au site</RouterLink>
      <div class="kente-divider" style="margin-top:24px"><span v-for="i in 10" :key="i" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth     = useAuthStore()
const router   = useRouter()
const route    = useRoute()
const email    = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref('')

async function doLogin() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    const redirect = (route.query.redirect as string) ?? '/admin'
    router.push(redirect)
  } catch (e: any) {
    error.value = e.message?.includes('Invalid') ? 'Email ou mot de passe incorrect.' : e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height:100vh; display:flex; align-items:center; justify-content:center;
  background:var(--p-bg);
}
.login-box {
  width:100%; max-width:400px; padding:32px;
  background:var(--p-card); border:1px solid var(--p-border); border-radius:var(--radius-lg);
}
.login-logo { font-size:2.4rem;font-weight:700;color:var(--p-red);text-align:center;margin-bottom:4px; }
.login-sub { text-align:center;font-size:13px;margin-bottom:28px; }
.login-form { display:flex;flex-direction:column;gap:16px; }
.field { display:flex;flex-direction:column; }
.login-error { padding:10px 14px;border-radius:8px;background:rgba(140,21,37,.1);color:var(--p-red);font-size:13px; }
.back-link { display:block;text-align:center;margin-top:20px;font-size:13px; }
.spinner-sm { display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin 600ms linear infinite;margin-right:6px; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
