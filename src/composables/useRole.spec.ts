import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRole } from './useRole'
import { useAuthStore } from '@/stores/auth.store'
import type { User, Session } from '@supabase/supabase-js'

// Mock de Supabase
vi.mock('@/clients/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    }
  }
}))

describe('useRole', () => {
  let authStore: ReturnType<typeof useAuthStore>

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: { role: 'user' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2026-02-15T00:00:00Z'
  } as User

  const mockAdminUser: User = {
    ...mockUser,
    user_metadata: { role: 'admin' }
  } as User

  const mockModeratorUser: User = {
    ...mockUser,
    user_metadata: { role: 'moderator' }
  } as User

  const mockSession: Session = {
    access_token: 'mock-token',
    user: mockUser
  } as Session

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    vi.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should return role properties from auth store', () => {
      const roleData = useRole()

      expect(roleData.role).toBeDefined()
      expect(roleData.isAdmin).toBeDefined()
      expect(roleData.isModerator).toBeDefined()
      expect(roleData.isUser).toBeDefined()
    })

    it('should return default user role when no user is authenticated', () => {
      const roleData = useRole()

      expect(roleData.role).toBe('user')
      expect(roleData.isAdmin).toBe(false)
      expect(roleData.isModerator).toBe(false)
      expect(roleData.isUser).toBe(true)
    })
  })

  describe('User Roles', () => {
    it('should return correct role for regular user', () => {
      authStore.user = mockUser
      authStore.session = mockSession

      const roleData = useRole()

      expect(roleData.role).toBe('user')
      expect(roleData.isUser).toBe(true)
      expect(roleData.isAdmin).toBe(false)
      expect(roleData.isModerator).toBe(false)
    })

    it('should return correct role for admin user', () => {
      authStore.user = mockAdminUser
      authStore.session = { ...mockSession, user: mockAdminUser }

      const roleData = useRole()

      expect(roleData.role).toBe('admin')
      expect(roleData.isAdmin).toBe(true)
      expect(roleData.isUser).toBe(false)
      expect(roleData.isModerator).toBe(false)
    })

    it('should return correct role for moderator user', () => {
      authStore.user = mockModeratorUser
      authStore.session = { ...mockSession, user: mockModeratorUser }

      const roleData = useRole()

      expect(roleData.role).toBe('moderator')
      expect(roleData.isModerator).toBe(true)
      expect(roleData.isAdmin).toBe(false)
      expect(roleData.isUser).toBe(false)
    })
  })

  describe('Reactivity', () => {
    it('should return updated values when called again after role change', () => {
      // Primera llamada - usuario normal
      authStore.user = mockUser
      authStore.session = mockSession

      const roleData1 = useRole()
      expect(roleData1.role).toBe('user')
      expect(roleData1.isAdmin).toBe(false)

      // Cambiar a admin
      authStore.user = mockAdminUser

      // Segunda llamada - debe reflejar el cambio
      const roleData2 = useRole()
      expect(roleData2.role).toBe('admin')
      expect(roleData2.isAdmin).toBe(true)
    })

    it('should return updated values when called again after logout', () => {
      // Usuario logueado
      authStore.user = mockAdminUser
      authStore.session = mockSession

      const roleData1 = useRole()
      expect(roleData1.role).toBe('admin')
      expect(roleData1.isAdmin).toBe(true)

      // Logout
      authStore.user = null
      authStore.session = null

      // Nueva llamada debe reflejar el cambio
      const roleData2 = useRole()
      expect(roleData2.role).toBe('user')
      expect(roleData2.isAdmin).toBe(false)
      expect(roleData2.isUser).toBe(true)
    })

    it('should reflect store changes when useRole is called again', () => {
      // User
      authStore.user = mockUser
      const role1 = useRole()
      expect(role1.role).toBe('user')
      expect(role1.isUser).toBe(true)

      // Admin
      authStore.user = mockAdminUser
      const role2 = useRole()
      expect(role2.role).toBe('admin')
      expect(role2.isAdmin).toBe(true)

      // Moderator
      authStore.user = mockModeratorUser
      const role3 = useRole()
      expect(role3.role).toBe('moderator')
      expect(role3.isModerator).toBe(true)
    })
  })

  describe('Integration with Auth Store', () => {
    it('should reflect auth store changes when called again', () => {
      const directStoreAccess = useAuthStore()

      // Estado inicial
      const role1 = useRole()
      expect(role1.role).toBe('user')

      // Modificar directamente el store
      directStoreAccess.user = mockAdminUser

      // Nueva llamada debe reflejar el cambio
      const role2 = useRole()
      expect(role2.role).toBe('admin')
    })

    it('should work with multiple calls to useRole at same time', () => {
      authStore.user = mockModeratorUser

      const role1 = useRole()
      const role2 = useRole()

      // Ambos deben tener los mismos valores
      expect(role1.role).toBe('moderator')
      expect(role2.role).toBe('moderator')
      expect(role1.isModerator).toBe(true)
      expect(role2.isModerator).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle user without role in metadata', () => {
      authStore.user = {
        ...mockUser,
        user_metadata: {}
      } as User

      const roleData = useRole()

      expect(roleData.role).toBe('user')
      expect(roleData.isUser).toBe(true)
    })

    it('should handle user with null user_metadata', () => {
      authStore.user = {
        ...mockUser,
        user_metadata: null as any
      } as User

      const roleData = useRole()

      expect(roleData.role).toBe('user')
    })

    it('should return all boolean flags correctly for unauthenticated user', () => {
      authStore.user = null

      const roleData = useRole()

      expect(roleData.isUser).toBe(true)
      expect(roleData.isAdmin).toBe(false)
      expect(roleData.isModerator).toBe(false)
    })

    it('should consistently return same values for same store state', () => {
      authStore.user = mockAdminUser

      const role1 = useRole()
      const role2 = useRole()
      const role3 = useRole()

      expect(role1.role).toBe(role2.role)
      expect(role2.role).toBe(role3.role)
      expect(role1.isAdmin).toBe(role2.isAdmin)
      expect(role2.isAdmin).toBe(role3.isAdmin)
    })
  })
})
