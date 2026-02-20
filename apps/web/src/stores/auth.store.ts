import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { redirectTo } from '@/utils'
import { useCartStore } from './cart.store'
import axiosClient from '@/clients/axios'

export type UserRole = 'admin' | 'editor' | 'waiter' | 'user'

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
    const storedSession = localStorage.getItem('session')
    const storedUser = localStorage.getItem('user')

    if (storedSession && storedUser) {
      const parsedSession: AuthSession = JSON.parse(storedSession)
      const isExpired = parsedSession.expires_at * 1000 < Date.now()

      if (!isExpired) {
        setSession(parsedSession)
        setUser(JSON.parse(storedUser))
      } else {
        // ✅ Intentar refresh antes de limpiar
        try {
          const { data } = await axiosClient.post<{ session: AuthSession; user: AuthUser }>(
            '/api/auth/refresh',
            { refresh_token: parsedSession.refresh_token }
          )
          setSession(data.session)
          setUser(data.user)
          localStorage.setItem('session', JSON.stringify(data.session))
          localStorage.setItem('user', JSON.stringify(data.user))
        } catch {
          localStorage.removeItem('session')
          localStorage.removeItem('user')
        }
      }
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
