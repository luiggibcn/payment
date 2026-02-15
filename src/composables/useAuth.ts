import { ref, computed } from 'vue'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/clients/supabase'

const user = ref<User | null>(null)
const session = ref<Session | null>(null)

export const useAuth = () => {
  const isAuthenticated = computed(() => !!user.value)

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    
    if (error) throw error
    
    return data
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    if (data.session) {
      session.value = data.session
      user.value = data.user
    }
    
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) throw error
    
    user.value = null
    session.value = null
  }

  const getCurrentUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    user.value = currentUser
    return currentUser
  }


  const getCurrentSession = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    session.value = currentSession
    return currentSession
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    
    if (error) throw error
  }

  return {
    user,
    session,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    getCurrentSession,
    resetPassword
  }
}
