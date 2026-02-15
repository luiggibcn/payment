import { computed } from 'vue'
import { useAuth } from './useAuth'
import type { UserRole } from '@/types/src/client'

export const useRole = () => {
  const { user } = useAuth()

  const role = computed<UserRole>(() => {
    return user.value?.user_metadata?.role || 'user'
  })
  
  const isAdmin = computed(() => role.value === 'admin')
  const isModerator = computed(() => role.value === 'moderator')
  const isUser = computed(() => role.value === 'user')

  return {
    role,
    isAdmin,
    isModerator,
    isUser
  }
}
