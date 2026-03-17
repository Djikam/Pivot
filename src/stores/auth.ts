import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import type { Session, User } from '@supabase/supabase-js'
import type { RoleUser } from '@/lib/database.types'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const user    = ref<User | null>(null)
  const role    = ref<RoleUser | null>(null)
  const loading = ref(true)
  const initialized = ref(false)

  const isAdmin   = computed(() => role.value === 'admin')
  const isSaisie  = computed(() => role.value === 'admin' || role.value === 'saisie')
  const isLogged  = computed(() => !!session.value)

  // Initialiser — appelé dans main.ts
  async function init() {
    loading.value = true
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    user.value    = data.session?.user ?? null

    if (user.value) await fetchRole()

    // Écouter les changements de session
    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      session.value = newSession
      user.value    = newSession?.user ?? null
      role.value    = null
      if (user.value) await fetchRole()
    })

    loading.value = false
    initialized.value = true
  }

  async function fetchRole() {
    if (!user.value) return
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.value.id)
      .single()
    role.value = (data as { role: RoleUser } | null)?.role ?? 'viewer'
  }

  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    session.value = null
    user.value    = null
    role.value    = null
  }

  function waitForInit() {
    if (initialized.value) return Promise.resolve()
    return new Promise<void>(resolve => {
      const stop = watch(initialized, (v) => {
        if (v) { stop(); resolve() }
      })
    })
  }

  async function tryRefresh() {
    const result = await supabase.auth.refreshSession()
    if (result.data?.session) {
      session.value = result.data.session
      user.value    = result.data.session.user
      await fetchRole()
    }
    return result
  }

  return { session, user, role, loading, isAdmin, isSaisie, isLogged, init, waitForInit, login, logout, tryRefresh }
})
