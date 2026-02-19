// src/composables/useAuth.ts
import { useAuthStore } from '@/stores/auth.store'

/**
 * Wrapper del auth store para mantener compatibilidad con código existente
 * Usa directamente useAuthStore para nuevos componentes
 */
export const useAuth = () => {
  const authStore = useAuthStore()
  
  return {
    user: authStore.user,
    session: authStore.session,
    loading: authStore.loading,
    
    isAuthenticated: authStore.isAuthenticated,
    
    // signUp: authStore.signUp,
    signIn: authStore.signIn,
    signOut: authStore.signOut,
    // getCurrentUser: authStore.fetchUser,
    // getCurrentSession: authStore.fetchSession,
    // resetPassword: authStore.resetPassword,
    // updateUserRole: authStore.updateUserRole
  }
}
