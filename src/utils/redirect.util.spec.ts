import { describe, it, expect, beforeEach, vi } from 'vitest'
import { redirectTo } from './redirect.util'

describe('redirect.util', () => {
  describe('redirectTo', () => {
    // Mock window.location
    const mockLocation = {
      href: '',
      replace: vi.fn()
    }

    beforeEach(() => {
      // Reset mocks before each test
      mockLocation.href = ''
      mockLocation.replace.mockClear()
      
      // Override window.location
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true
      })
    })

    it('should redirect using href by default', () => {
      const path = '/shop'
      
      redirectTo(path)
      
      expect(mockLocation.href).toBe(path)
      expect(mockLocation.replace).not.toHaveBeenCalled()
    })

    it('should redirect using href when replaceHistory is false', () => {
      const path = '/login'
      
      redirectTo(path, false)
      
      expect(mockLocation.href).toBe(path)
      expect(mockLocation.replace).not.toHaveBeenCalled()
    })

    it('should redirect using replace when replaceHistory is true', () => {
      const path = '/register'
      
      redirectTo(path, true)
      
      expect(mockLocation.replace).toHaveBeenCalledWith(path)
      expect(mockLocation.replace).toHaveBeenCalledTimes(1)
    })

    it('should handle absolute URLs', () => {
      const path = 'https://example.com'
      
      redirectTo(path)
      
      expect(mockLocation.href).toBe(path)
    })

    it('should handle relative paths', () => {
      const path = '../products'
      
      redirectTo(path)
      
      expect(mockLocation.href).toBe(path)
    })

    it('should handle paths with query parameters', () => {
      const path = '/search?q=test&page=2'
      
      redirectTo(path)
      
      expect(mockLocation.href).toBe(path)
    })

    it('should handle paths with hash', () => {
      const path = '/page#section'
      
      redirectTo(path)
      
      expect(mockLocation.href).toBe(path)
    })

    it('should handle empty string path', () => {
      const path = ''
      
      redirectTo(path)
      
      expect(mockLocation.href).toBe(path)
    })

    it('should replace history when explicitly set to true', () => {
      const path = '/dashboard'
      
      redirectTo(path, true)
      
      expect(mockLocation.replace).toHaveBeenCalledWith(path)
      expect(mockLocation.href).toBe('')
    })
  })
})
