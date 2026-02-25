import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { redirectTo } from '@/utils'
import { supabase } from '@/clients/supabase'
import type { UserRole, AuthUser, AuthSession } from '@billsplit/types'

export type { UserRole, AuthUser, AuthSession }

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const session = ref<AuthSession | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!session.value && !!user.value)
  const userRole = computed(() => user.value?.role ?? 'user')
  const isAdmin = computed(() => userRole.value === 'admin')
  const isEditor = computed(() => userRole.value === 'editor')
  const isWaiter = computed(() => userRole.value === 'waiter')
  const userEmail = computed(() => user.value?.email ?? '')
  const userId = computed(() => user.value?.id ?? '')
  const tenantId = computed(() => user.value?.tenant_id ?? '')

  const setUser = (newUser: AuthUser | null) => { user.value = newUser }
  const setSession = (newSession: AuthSession | null) => { session.value = newSession }

  const signIn = async (email: string, password: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) throw error

      const supaUser = data.user
      const supaSession = data.session

      const authUser: AuthUser = {
        id: supaUser.id,
        email: supaUser.email,
        full_name: supaUser.user_metadata?.full_name ?? null,
        role: (supaUser.user_metadata?.role as UserRole) ?? 'user',
        tenant_id: supaUser.user_metadata?.tenant_id ?? '',
      }

      const authSession: AuthSession = {
        access_token: supaSession.access_token,
        refresh_token: supaSession.refresh_token,
        expires_at: supaSession.expires_at ?? 0,
      }

      setSession(authSession)
      setUser(authUser)
      localStorage.setItem('session', JSON.stringify(authSession))
      localStorage.setItem('user', JSON.stringify(authUser))

      return { session: authSession, user: authUser }
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    try {
      await supabase.auth.signOut()
    } catch {
      // Si falla igualmente limpiamos local
    } finally {
      setUser(null)
      setSession(null)
      localStorage.removeItem('session')
      localStorage.removeItem('user')
      loading.value = false
      redirectTo('/login')
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })

      if (error) throw error

      return data
    } finally {
      loading.value = false
    }
  }

  const initialize = async () => {
    if (initialized.value) return

    try {
      const storedSession = localStorage.getItem('session')
      const storedUser = localStorage.getItem('user')

      const isValid = (val: string | null): boolean => {
        if (!val || val === 'undefined' || val === 'null') return false
        try { JSON.parse(val); return true }
        catch { return false }
      }

      if (!isValid(storedSession) || !isValid(storedUser)) {
        localStorage.removeItem('session')
        localStorage.removeItem('user')
        initialized.value = true
        return
      }

      const parsedSession = JSON.parse(storedSession!) as AuthSession
      const isExpired = parsedSession.expires_at * 1000 < Date.now()

      if (isExpired) {
        localStorage.removeItem('session')
        localStorage.removeItem('user')
        initialized.value = true
        return
      }

      setSession(parsedSession)
      setUser(JSON.parse(storedUser!) as AuthUser)

    } catch {
      localStorage.removeItem('session')
      localStorage.removeItem('user')
    }

    initialized.value = true
  }

  return {
    user, session, loading, initialized,
    isAuthenticated, userRole, isAdmin, isEditor, isWaiter,
    userEmail, userId, tenantId,
    setUser, setSession, signIn, signOut, signUp, initialize,
  }
})
