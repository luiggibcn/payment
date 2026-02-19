// src/composables/useRole.ts
import { useAuthStore } from '@/stores/auth.store'

/**
 * Wrapper del auth store para acceso a roles
 * Usa directamente useAuthStore para nuevos componentes
 */
export const useRole = () => {
  const authStore = useAuthStore()
  
  return {
    role: authStore.userRole,
    isAdmin: authStore.isAdmin,
    // isModerator: authStore.isModerator,
    // isUser: authStore.isUser
  }
}
