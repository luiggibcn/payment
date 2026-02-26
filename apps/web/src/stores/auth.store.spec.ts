import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth.store'

vi.mock('@/clients/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
    },
  },
}))

vi.mock('@/utils', () => ({
  redirectTo: vi.fn(),
}))

import { supabase } from '@/clients/supabase'
import { redirectTo } from '@/utils'

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'user' as const,
  tenant_id: 'tenant-123',
}

const mockSession = {
  access_token: 'token-abc',
  refresh_token: 'refresh-abc',
  expires_at: Math.floor(Date.now() / 1000) + 3600,
}

const expiredSession = {
  ...mockSession,
  expires_at: Math.floor(Date.now() / 1000) - 3600,
}

describe('auth.store', () => {
  let store: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAuthStore()
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should have initial state', () => {
      expect(store.user).toBeNull()
      expect(store.session).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.initialized).toBe(false)
    })

    it('should not be authenticated initially', () => {
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('Computed getters', () => {
    it('should return default role user when no user', () => {
      expect(store.userRole).toBe('user')
    })

    it('should compute isAdmin correctly', () => {
      store.setUser({ ...mockUser, role: 'superadmin' })
      expect(store.isAdmin).toBe(true)
      expect(store.isEditor).toBe(false)
      expect(store.isWaiter).toBe(false)
    })

    it('should compute isEditor correctly', () => {
      store.setUser({ ...mockUser, role: 'editor' })
      expect(store.isEditor).toBe(true)
    })

    it('should compute isWaiter correctly', () => {
      store.setUser({ ...mockUser, role: 'waiter' })
      expect(store.isWaiter).toBe(true)
    })

    it('should return empty strings for userEmail, userId, tenantId when no user', () => {
      expect(store.userEmail).toBe('')
      expect(store.userId).toBe('')
      expect(store.tenantId).toBe('')
    })

    it('should return correct userEmail, userId, tenantId when user is set', () => {
      store.setUser(mockUser)
      expect(store.userEmail).toBe('test@example.com')
      expect(store.userId).toBe('user-123')
      expect(store.tenantId).toBe('tenant-123')
    })
  })

  describe('initialize', () => {
    it('should do nothing if already initialized', async () => {
      store.initialized = true
      localStorage.setItem('session', JSON.stringify(mockSession))
      localStorage.setItem('user', JSON.stringify(mockUser))
      await store.initialize()
      expect(store.user).toBeNull()
    })

    it('should load session and user from localStorage if valid', async () => {
      localStorage.setItem('session', JSON.stringify(mockSession))
      localStorage.setItem('user', JSON.stringify(mockUser))
      await store.initialize()
      expect(store.session).toEqual(mockSession)
      expect(store.user).toEqual(mockUser)
      expect(store.initialized).toBe(true)
    })

    it('should clear localStorage if session is missing', async () => {
      localStorage.setItem('user', JSON.stringify(mockUser))
      await store.initialize()
      expect(store.session).toBeNull()
      expect(store.user).toBeNull()
      expect(localStorage.getItem('session')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })

    it('should clear localStorage if user is missing', async () => {
      localStorage.setItem('session', JSON.stringify(mockSession))
      await store.initialize()
      expect(store.session).toBeNull()
      expect(store.user).toBeNull()
    })

    it('should clear localStorage if session is the string "undefined"', async () => {
      localStorage.setItem('session', 'undefined')
      localStorage.setItem('user', JSON.stringify(mockUser))
      await store.initialize()
      expect(store.session).toBeNull()
      expect(localStorage.getItem('session')).toBeNull()
    })

    it('should clear localStorage if session is the string "null"', async () => {
      localStorage.setItem('session', 'null')
      localStorage.setItem('user', JSON.stringify(mockUser))
      await store.initialize()
      expect(store.session).toBeNull()
    })

    it('should clear localStorage if session JSON is malformed', async () => {
      localStorage.setItem('session', '{invalid json}')
      localStorage.setItem('user', JSON.stringify(mockUser))
      await store.initialize()
      expect(store.session).toBeNull()
      expect(localStorage.getItem('session')).toBeNull()
    })

    it('should clear localStorage if session is expired', async () => {
      localStorage.setItem('session', JSON.stringify(expiredSession))
      localStorage.setItem('user', JSON.stringify(mockUser))
      await store.initialize()
      expect(store.session).toBeNull()
      expect(store.user).toBeNull()
      expect(localStorage.getItem('session')).toBeNull()
    })

    it('should set initialized to true after running', async () => {
      await store.initialize()
      expect(store.initialized).toBe(true)
    })
  })

  describe('signIn', () => {
    it('should sign in via Supabase and persist to localStorage', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            user_metadata: {
              full_name: mockUser.full_name,
              role: mockUser.role,
              tenant_id: mockUser.tenant_id,
            },
          },
          session: mockSession,
        },
        error: null,
      } as any)

      await store.signIn('test@example.com', 'password123')
      expect(store.user).toEqual(mockUser)
      expect(store.session).toEqual(mockSession)
      expect(JSON.parse(localStorage.getItem('session')!)).toEqual(mockSession)
      expect(JSON.parse(localStorage.getItem('user')!)).toEqual(mockUser)
    })

    it('should set loading to false after signIn', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            user_metadata: {
              full_name: mockUser.full_name,
              role: mockUser.role,
              tenant_id: mockUser.tenant_id,
            },
          },
          session: mockSession,
        },
        error: null,
      } as any)

      await store.signIn('test@example.com', 'password123')
      expect(store.loading).toBe(false)
    })

    it('should set loading to false even if signIn fails', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      } as any)

      await expect(store.signIn('test@example.com', 'wrong')).rejects.toThrow()
      expect(store.loading).toBe(false)
    })
  })

  describe('signOut', () => {
    it('should clear state and localStorage on signOut', async () => {
      store.setUser(mockUser)
      store.setSession(mockSession)
      localStorage.setItem('session', JSON.stringify(mockSession))
      localStorage.setItem('user', JSON.stringify(mockUser))
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null })

      await store.signOut()

      expect(store.user).toBeNull()
      expect(store.session).toBeNull()
      expect(localStorage.getItem('session')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
      expect(redirectTo).toHaveBeenCalledWith('/login')
    })

    it('should clear state even if Supabase signOut fails', async () => {
      store.setUser(mockUser)
      store.setSession(mockSession)
      vi.mocked(supabase.auth.signOut).mockRejectedValueOnce(new Error('BE error'))

      await store.signOut()

      expect(store.user).toBeNull()
      expect(store.session).toBeNull()
      expect(redirectTo).toHaveBeenCalledWith('/login')
    })
  })

  describe('signUp', () => {
    it('should call Supabase signUp and return response', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: {
          user: { id: 'u1', email: 'test@example.com' },
          session: null,
        },
        error: null,
      } as any)

      const result = await store.signUp('test@example.com', 'password123', 'Test User')

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: { data: { full_name: 'Test User' } },
      })
      expect(result.user?.id).toBe('u1')
    })

    it('should set loading to false after signUp', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: null,
      } as any)

      await store.signUp('test@example.com', 'password123')
      expect(store.loading).toBe(false)
    })
  })
})
