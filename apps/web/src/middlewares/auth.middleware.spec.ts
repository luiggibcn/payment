import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authGuard, adminGuard, guestGuard } from './auth.middleware'
import { useAuthStore } from '@/stores/auth.store'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import type { User, Session } from '@supabase/supabase-js'

// Mock del store
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn()
}))

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

describe('auth.middleware', () => {
  let mockAuthStore: any
  let mockNext: NavigationGuardNext
  let mockTo: RouteLocationNormalized
  let mockFrom: RouteLocationNormalized

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

  const mockSession: Session = {
    access_token: 'mock-token',
    user: mockUser
  } as Session

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Mock next function
    mockNext = vi.fn()

    // Mock route objects
    mockTo = {
      path: '/dashboard',
      fullPath: '/dashboard',
      name: 'Dashboard',
      params: {},
      query: {},
      hash: '',
      meta: {},
      matched: [],
      redirectedFrom: undefined
    } as RouteLocationNormalized

    mockFrom = {
      path: '/',
      fullPath: '/',
      name: 'Home',
      params: {},
      query: {},
      hash: '',
      meta: {},
      matched: [],
      redirectedFrom: undefined
    } as RouteLocationNormalized

    // Mock auth store
    mockAuthStore = {
      user: null,
      session: null,
      initialized: true,
      isAuthenticated: false,
      isAdmin: false,
      isModerator: false,
      isUser: false,
      initialize: vi.fn()
    }

    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)
  })

  describe('authGuard', () => {
    it('should call next() when user is authenticated', async () => {
      mockAuthStore.isAuthenticated = true
      mockAuthStore.user = mockUser
      mockAuthStore.session = mockSession

      await authGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should redirect to login when user is not authenticated', async () => {
      mockAuthStore.isAuthenticated = false

      await authGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/dashboard' }
      })
    })

    it('should initialize store if not initialized', async () => {
      mockAuthStore.initialized = false
      mockAuthStore.isAuthenticated = true

      await authGuard(mockTo, mockFrom, mockNext)

      expect(mockAuthStore.initialize).toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should preserve full path in redirect query', async () => {
      mockAuthStore.isAuthenticated = false
      mockTo.fullPath = '/dashboard?tab=settings'

      await authGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/dashboard?tab=settings' }
      })
    })
  })

  describe('adminGuard', () => {
    it('should call next() when user is authenticated and is admin', async () => {
      mockAuthStore.isAuthenticated = true
      mockAuthStore.isAdmin = true
      mockAuthStore.user = mockAdminUser
      mockAuthStore.session = mockSession

      await adminGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should redirect to login when user is not authenticated', async () => {
      mockAuthStore.isAuthenticated = false
      mockAuthStore.isAdmin = false

      await adminGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/dashboard' }
      })
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should redirect to /dashboard when user is authenticated but not admin', async () => {
      mockAuthStore.isAuthenticated = true
      mockAuthStore.isAdmin = false
      mockAuthStore.user = mockUser
      mockAuthStore.session = mockSession

      await adminGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith({
        path: '/dashboard'
      })
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should initialize store if not initialized', async () => {
      mockAuthStore.initialized = false
      mockAuthStore.isAuthenticated = true
      mockAuthStore.isAdmin = true

      await adminGuard(mockTo, mockFrom, mockNext)

      expect(mockAuthStore.initialize).toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should preserve full path in redirect query when not authenticated', async () => {
      mockAuthStore.isAuthenticated = false
      mockTo.fullPath = '/admin/users?page=2'

      await adminGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/admin/users?page=2' }
      })
    })
  })

  describe('guestGuard', () => {
    it('should call next() when user is not authenticated', async () => {
      mockAuthStore.isAuthenticated = false

      await guestGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should redirect to /dashboard when user is authenticated', async () => {
      mockAuthStore.isAuthenticated = true
      mockAuthStore.user = mockUser
      mockAuthStore.session = mockSession

      await guestGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith({
        path: '/dashboard'
      })
    })

    it('should initialize store if not initialized', async () => {
      mockAuthStore.initialized = false
      mockAuthStore.isAuthenticated = false

      await guestGuard(mockTo, mockFrom, mockNext)

      expect(mockAuthStore.initialize).toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should redirect authenticated users even if they are admin', async () => {
      mockAuthStore.isAuthenticated = true
      mockAuthStore.isAdmin = true
      mockAuthStore.user = mockAdminUser
      mockAuthStore.session = mockSession

      await guestGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith({
        path: '/dashboard'
      })
    })
  })

  describe('Edge Cases', () => {
    it('authGuard should handle initialize error gracefully', async () => {
      mockAuthStore.initialized = false
      mockAuthStore.initialize.mockRejectedValueOnce(new Error('Init failed'))

      await expect(authGuard(mockTo, mockFrom, mockNext)).rejects.toThrow('Init failed')
    })

    it('adminGuard should not call next twice', async () => {
      mockAuthStore.isAuthenticated = false

      await adminGuard(mockTo, mockFrom, mockNext)

      // Solo debe llamarse una vez (en el early return)
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should work with complex fullPath in authGuard', async () => {
      mockAuthStore.isAuthenticated = false
      mockTo.fullPath = '/products/123?color=red&size=M#reviews'

      await authGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/products/123?color=red&size=M#reviews' }
      })
    })
  })
})
