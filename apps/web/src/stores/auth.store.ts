import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { redirectTo } from '@/utils'
import { useCartStore } from './cart.store'
import axiosClient from '@/clients/axios'

export type UserRole = 'admin' | 'editor' | 'waiter' | 'user' | 'superadmin'

export interface AuthUser {
  id: string
  email: string | undefined
  full_name: string | null
  role: UserRole
  tenant_id: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at: number
}

export const useAuthStore = defineStore('auth', () => {
  const cart = useCartStore()
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
      const { data } = await axiosClient.post<{ session: AuthSession; user: AuthUser }>(
        '/api/auth/sign-in',
        { email, password }
      )
      setSession(data.session)
      setUser(data.user)
      cart.userCart = data.user
      localStorage.setItem('session', JSON.stringify(data.session))
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    try {
      await axiosClient.post('/api/auth/sign-out')
    } catch {
      // Si falla el BE igualmente limpiamos local
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
      const data = await axiosClient.post<{
        message: string
        user: { id: string; email: string }
      }>('/api/auth/sign-up', { email, password, fullName }) // ✅ fullName incluido
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

    // ✅ Limpiar si alguno es inválido
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
    // Cualquier otro fallo inesperado → limpiar
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
