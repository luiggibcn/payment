import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppRoute } from '@/interfaces/routes.interfaces'

const mockPush = vi.fn()
let currentRouteName: string = AppRoute.TABLES

vi.mock('vue-router', () => ({
  useRoute: () => ({
    get name() { return currentRouteName },
  }),
  useRouter: () => ({ push: mockPush }),
}))

import { useNavItems, navItems } from './useNavItems'

describe('useNavItems', () => {
  beforeEach(() => {
    currentRouteName = AppRoute.TABLES
    vi.clearAllMocks()
  })

  describe('navItems', () => {
    it('should export 3 nav items', () => {
      expect(navItems).toHaveLength(3)
    })

    it('should contain tables, menu and history items', () => {
      const keys = navItems.map(i => i.key)
      expect(keys).toContain('tables')
      expect(keys).toContain('menu')
      expect(keys).toContain('history')
    })

    it('each item should have required fields', () => {
      for (const item of navItems) {
        expect(item.key).toBeTruthy()
        expect(item.labelKey).toBeTruthy()
        expect(item.routeName).toBeTruthy()
        expect(item.icon).toBeTruthy()
      }
    })

    it('should map to correct AppRoutes', () => {
      const routeMap = Object.fromEntries(navItems.map(i => [i.key, i.routeName]))
      expect(routeMap.tables).toBe(AppRoute.TABLES)
      expect(routeMap.menu).toBe(AppRoute.PRODUCTS)
      expect(routeMap.history).toBe(AppRoute.QR)
    })

    it('badge should be optional and undefined by default', () => {
      for (const item of navItems) {
        expect(item.badge).toBeUndefined()
      }
    })
  })

  describe('isActive', () => {
    it('should return true when route matches', () => {
      currentRouteName = AppRoute.TABLES
      const { isActive } = useNavItems()
      expect(isActive(AppRoute.TABLES)).toBe(true)
    })

    it('should return false when route does not match', () => {
      currentRouteName = AppRoute.TABLES
      const { isActive } = useNavItems()
      expect(isActive(AppRoute.PRODUCTS)).toBe(false)
    })

    it('should react to route changes', () => {
      currentRouteName = AppRoute.PRODUCTS
      const { isActive } = useNavItems()
      expect(isActive(AppRoute.PRODUCTS)).toBe(true)
      expect(isActive(AppRoute.TABLES)).toBe(false)
    })
  })

  describe('navigate', () => {
    it('should call router.push with the given route name', () => {
      const { navigate } = useNavItems()
      navigate(AppRoute.TABLES)
      expect(mockPush).toHaveBeenCalledWith({ name: AppRoute.TABLES })
    })

    it('should call router.push with different routes', () => {
      const { navigate } = useNavItems()
      navigate(AppRoute.PRODUCTS)
      expect(mockPush).toHaveBeenCalledWith({ name: AppRoute.PRODUCTS })
      navigate(AppRoute.QR)
      expect(mockPush).toHaveBeenCalledWith({ name: AppRoute.QR })
    })

    it('should call router.push exactly once per navigate call', () => {
      const { navigate } = useNavItems()
      navigate(AppRoute.TABLES)
      expect(mockPush).toHaveBeenCalledTimes(1)
    })
  })

  describe('activeRoute', () => {
    it('should reflect the current route name', () => {
      currentRouteName = AppRoute.QR
      const { activeRoute } = useNavItems()
      expect(activeRoute.value).toBe(AppRoute.QR)
    })
  })
})
