import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppRoute } from '@billsplit/types'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationsStore } from '@/stores/notifications.store'

const mockPush = vi.fn()
let currentRouteName: string = AppRoute.TABLES

vi.mock('vue-router', () => ({
  useRoute: () => ({
    get name() { return currentRouteName },
  }),
  useRouter: () => ({ push: mockPush }),
}))

import { useNavItems } from './useNavItems'

describe('useNavItems', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    currentRouteName = AppRoute.TABLES
    vi.clearAllMocks()
  })

  describe('navItems', () => {
    it('should return 4 nav items', () => {
      const { navItems } = useNavItems()
      expect(navItems.value).toHaveLength(4)
    })

    it('should contain tables, menu, orders and history items', () => {
      const { navItems } = useNavItems()
      const keys = navItems.value.map(i => i.key)
      expect(keys).toContain('tables')
      expect(keys).toContain('menu')
      expect(keys).toContain('orders')
      expect(keys).toContain('history')
    })

    it('each item should have required fields', () => {
      const { navItems } = useNavItems()
      for (const item of navItems.value) {
        expect(item.key).toBeTruthy()
        expect(item.labelKey).toBeTruthy()
        expect(item.routeName).toBeTruthy()
        expect(item.icon).toBeTruthy()
      }
    })

    it('should map to correct AppRoutes', () => {
      const { navItems } = useNavItems()
      const routeMap = Object.fromEntries(navItems.value.map(i => [i.key, i.routeName]))
      expect(routeMap.tables).toBe(AppRoute.TABLES)
      expect(routeMap.menu).toBe(AppRoute.PRODUCTS)
      expect(routeMap.orders).toBe(AppRoute.ORDERS)
      expect(routeMap.history).toBe(AppRoute.QR)
    })

    it('badge should be undefined when there are no unread notifications', () => {
      const { navItems } = useNavItems()
      for (const item of navItems.value) {
        expect(item.badge).toBeUndefined()
      }
    })

    it('orders item should have badge when there are unread notifications', () => {
      const notificationsStore = useNotificationsStore()
      notificationsStore.addNotification({ type: 'order_received', titleKey: 'test.a' })
      notificationsStore.addNotification({ type: 'order_ready', titleKey: 'test.b' })

      const { navItems } = useNavItems()
      const ordersItem = navItems.value.find(i => i.key === 'orders')!
      expect(ordersItem.badge).toBe(2)
    })

    it('non-orders items should not have badge even with unread notifications', () => {
      const notificationsStore = useNotificationsStore()
      notificationsStore.addNotification({ type: 'order_received', titleKey: 'test.a' })

      const { navItems } = useNavItems()
      const nonOrders = navItems.value.filter(i => i.key !== 'orders')
      for (const item of nonOrders) {
        expect(item.badge).toBeUndefined()
      }
    })

    it('badge disappears after marking all notifications as read', () => {
      const notificationsStore = useNotificationsStore()
      notificationsStore.addNotification({ type: 'order_received', titleKey: 'test.a' })
      const { navItems } = useNavItems()

      expect(navItems.value.find(i => i.key === 'orders')!.badge).toBeGreaterThan(0)

      notificationsStore.markAllAsRead()
      expect(navItems.value.find(i => i.key === 'orders')!.badge).toBeUndefined()
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
      navigate(AppRoute.ORDERS)
      expect(mockPush).toHaveBeenCalledWith({ name: AppRoute.ORDERS })
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
