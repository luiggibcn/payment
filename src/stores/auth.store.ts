import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/clients/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { redirectTo } from '@/utils'

export type UserRole = 'admin' | 'user' | 'moderator'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!session.value && !!user.value)
  
  const userRole = computed<UserRole>(() => {
    return user.value?.user_metadata?.role || 'user'
  })
  
  const isAdmin = computed(() => userRole.value === 'admin')
  const isModerator = computed(() => userRole.value === 'moderator')
  const isUser = computed(() => userRole.value === 'user')
  
  const userEmail = computed(() => user.value?.email || '')
  const userId = computed(() => user.value?.id || '')

  const setUser = (newUser: User | null) => {
    user.value = newUser
  }

  const setSession = (newSession: Session | null) => {
    session.value = newSession
  }

  const signUp = async (email: string, password: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (error) {
        if (error.message.includes('already registered') || 
            error.message.includes('User already registered')) {
          throw new Error('This email is already registered. Please sign in instead.')
        }
        throw error
      }
      
      if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
        throw new Error('This email is already registered. Please sign in instead.')
      }
      
      if (data.user && data.session) {
        throw new Error('This email is already registered. Please sign in instead.')
      }
      
      return data
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email: string, password: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.session && data.user) {
        setSession(data.session)
        setUser(data.user)
      }
      
      return data
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      setUser(null)
      setSession(null)
    } finally {
      loading.value = false
      redirectTo('/login')
    }
  }

  const fetchUser = async () => {
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser()
      
      if (error) throw error
      
      setUser(currentUser)
      return currentUser
    } catch (error) {
      setUser(null)
      return null
    }
  }

  const fetchSession = async () => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession()
      
      if (error) throw error
      
      setSession(currentSession)
      return currentSession
    } catch (error) {
      setSession(null)
      return null
    }
  }

  const resetPassword = async (email: string) => {
    loading.value = true
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) throw error
    } finally {
      loading.value = false
    }
  }

  const updateUserRole = async (role: UserRole) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { role }
      })
      
      if (error) throw error
      
      if (data.user) {
        setUser(data.user)
      }
      
      return data
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (updates: Record<string, any>) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      })
      
      if (error) throw error
      
      if (data.user) {
        setUser(data.user)
      }
      
      return data
    } finally {
      loading.value = false
    }
  }

  const initialize = async () => {
    if (initialized.value) return

    // Obtener sesión y usuario actual
    await fetchSession()
    await fetchUser()

    // Escuchar cambios de autenticación
    supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event)
      
      setSession(newSession)
      
      if (newSession) {
        await fetchUser()
      } else {
        setUser(null)
      }
    })

    initialized.value = true
  }

  return {
    user,
    session,
    loading,
    initialized,
    
    isAuthenticated,
    userRole,
    isAdmin,
    isModerator,
    isUser,
    userEmail,
    userId,
    
    signUp,
    signIn,
    signOut,
    fetchUser,
    fetchSession,
    resetPassword,
    updateUserRole,
    updateProfile,
    initialize
  }
})
