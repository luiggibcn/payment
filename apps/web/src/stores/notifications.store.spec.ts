import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationsStore } from './notifications.store'

const NOTIFICATIONS_KEY = 'billsplit:notifications'

describe('notifications.store', () => {
  let store: ReturnType<typeof useNotificationsStore>

  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    setActivePinia(createPinia())
    store = useNotificationsStore()
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  // ── Toasts ────────────────────────────────────────────────────────────────
  describe('addToast', () => {
    it('adds a toast to the list and returns an id', () => {
      const id = store.addToast({ variant: 'success', titleKey: 'test.title' })
      expect(id).toMatch(/^toast-/)
      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0].titleKey).toBe('test.title')
    })

    it('uses default duration of 4000ms', () => {
      store.addToast({ variant: 'info', titleKey: 'test' })
      expect(store.toasts[0].duration).toBe(4000)
    })

    it('allows custom duration', () => {
      store.addToast({ variant: 'info', titleKey: 'test', duration: 1000 })
      expect(store.toasts[0].duration).toBe(1000)
    })

    it('auto-dismisses after duration', () => {
      store.addToast({ variant: 'info', titleKey: 'test', duration: 2000 })
      expect(store.toasts).toHaveLength(1)

      vi.advanceTimersByTime(2000)
      expect(store.toasts).toHaveLength(0)
    })

    it('does not auto-dismiss when duration is 0 (sticky)', () => {
      store.addToast({ variant: 'info', titleKey: 'test', duration: 0 })
      vi.advanceTimersByTime(10000)
      expect(store.toasts).toHaveLength(1)
    })

    it('passes optional params and descriptionKey', () => {
      store.addToast({
        variant: 'warning',
        titleKey: 'test.title',
        descriptionKey: 'test.desc',
        params: { table: '3' },
      })
      expect(store.toasts[0].descriptionKey).toBe('test.desc')
      expect(store.toasts[0].params).toEqual({ table: '3' })
    })
  })

  describe('dismissToast', () => {
    it('removes the specified toast', () => {
      const id = store.addToast({ variant: 'success', titleKey: 'test' })
      expect(store.toasts).toHaveLength(1)
      store.dismissToast(id)
      expect(store.toasts).toHaveLength(0)
    })

    it('clears the auto-dismiss timer', () => {
      const id = store.addToast({ variant: 'success', titleKey: 'test', duration: 5000 })
      store.dismissToast(id)
      // No error should occur when the timer fires on an already-dismissed toast
      vi.advanceTimersByTime(5000)
      expect(store.toasts).toHaveLength(0)
    })

    it('does nothing when id does not exist', () => {
      store.addToast({ variant: 'success', titleKey: 'test' })
      store.dismissToast('non-existent')
      expect(store.toasts).toHaveLength(1)
    })
  })

  // ── Notifications (persistent) ────────────────────────────────────────────
  describe('addNotification', () => {
    it('adds a notification and returns an id', () => {
      const id = store.addNotification({
        type: 'order_received',
        titleKey: 'notif.title',
      })
      expect(id).toMatch(/^notif-/)
      expect(store.notifications).toHaveLength(1)
      expect(store.notifications[0].read).toBe(false)
    })

    it('persists to localStorage', () => {
      store.addNotification({ type: 'order_received', titleKey: 'notif.title' })
      const stored = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY)!)
      expect(stored).toHaveLength(1)
    })

    it('also creates a toast for immediate visibility', () => {
      store.addNotification({ type: 'order_received', titleKey: 'notif.title' })
      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0].variant).toBe('info')
    })

    it('newest notification is first (unshift)', () => {
      store.addNotification({ type: 'order_received', titleKey: 'first' })
      store.addNotification({ type: 'order_ready', titleKey: 'second' })
      expect(store.notifications[0].titleKey).toBe('second')
    })

    it('passes descriptionKey and params to the notification', () => {
      store.addNotification({
        type: 'order_received',
        titleKey: 'notif.title',
        descriptionKey: 'notif.desc',
        params: { table: '5' },
      })
      expect(store.notifications[0].descriptionKey).toBe('notif.desc')
      expect(store.notifications[0].params).toEqual({ table: '5' })
    })
  })

  describe('markAsRead', () => {
    it('marks a specific notification as read', () => {
      const id = store.addNotification({ type: 'order_received', titleKey: 'test' })
      expect(store.notifications[0].read).toBe(false)
      store.markAsRead(id)
      expect(store.notifications[0].read).toBe(true)
    })

    it('persists the change to localStorage', () => {
      const id = store.addNotification({ type: 'order_received', titleKey: 'test' })
      store.markAsRead(id)
      const stored = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY)!)
      expect(stored[0].read).toBe(true)
    })

    it('does nothing when id does not exist', () => {
      store.addNotification({ type: 'order_received', titleKey: 'test' })
      store.markAsRead('non-existent')
      expect(store.notifications[0].read).toBe(false)
    })
  })

  describe('markAllAsRead', () => {
    it('marks all notifications as read', () => {
      store.addNotification({ type: 'order_received', titleKey: 'a' })
      store.addNotification({ type: 'order_ready', titleKey: 'b' })
      store.markAllAsRead()
      expect(store.notifications.every(n => n.read)).toBe(true)
    })

    it('persists to localStorage', () => {
      store.addNotification({ type: 'order_received', titleKey: 'a' })
      store.markAllAsRead()
      const stored = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY)!)
      expect(stored[0].read).toBe(true)
    })
  })

  describe('clearNotifications', () => {
    it('removes all notifications', () => {
      store.addNotification({ type: 'order_received', titleKey: 'a' })
      store.addNotification({ type: 'order_ready', titleKey: 'b' })
      store.clearNotifications()
      expect(store.notifications).toHaveLength(0)
    })

    it('persists empty array to localStorage', () => {
      store.addNotification({ type: 'order_received', titleKey: 'a' })
      store.clearNotifications()
      const stored = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY)!)
      expect(stored).toHaveLength(0)
    })
  })

  describe('unreadCount', () => {
    it('returns 0 when there are no notifications', () => {
      expect(store.unreadCount).toBe(0)
    })

    it('counts unread notifications', () => {
      store.addNotification({ type: 'order_received', titleKey: 'a' })
      store.addNotification({ type: 'order_ready', titleKey: 'b' })
      expect(store.unreadCount).toBe(2)
    })

    it('decreases when a notification is marked as read', () => {
      const id = store.addNotification({ type: 'order_received', titleKey: 'a' })
      store.addNotification({ type: 'order_ready', titleKey: 'b' })
      store.markAsRead(id)
      expect(store.unreadCount).toBe(1)
    })

    it('is 0 after markAllAsRead', () => {
      store.addNotification({ type: 'order_received', titleKey: 'a' })
      store.addNotification({ type: 'order_ready', titleKey: 'b' })
      store.markAllAsRead()
      expect(store.unreadCount).toBe(0)
    })
  })

  // ── Shorthand methods ─────────────────────────────────────────────────────
  describe('shorthand methods', () => {
    it('success() creates a success toast', () => {
      const id = store.success('msg.ok')
      expect(id).toMatch(/^toast-/)
      expect(store.toasts[0].variant).toBe('success')
    })

    it('error() creates an error toast with 6000ms duration', () => {
      store.error('msg.fail')
      expect(store.toasts[0].variant).toBe('error')
      expect(store.toasts[0].duration).toBe(6000)
    })

    it('warning() creates a warning toast', () => {
      store.warning('msg.warn')
      expect(store.toasts[0].variant).toBe('warning')
    })

    it('info() creates an info toast', () => {
      store.info('msg.info')
      expect(store.toasts[0].variant).toBe('info')
    })

    it('shorthand methods pass params', () => {
      store.success('msg.ok', { count: 3 })
      expect(store.toasts[0].params).toEqual({ count: 3 })
    })
  })

  // ── localStorage edge cases ───────────────────────────────────────────────
  describe('localStorage persistence', () => {
    it('loads existing notifications from localStorage on init', () => {
      const existing = [{
        id: 'notif-existing',
        type: 'order_received',
        titleKey: 'existing',
        read: false,
        createdAt: Date.now(),
      }]
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(existing))

      setActivePinia(createPinia())
      const freshStore = useNotificationsStore()
      expect(freshStore.notifications).toHaveLength(1)
      expect(freshStore.notifications[0].titleKey).toBe('existing')
    })

    it('returns empty array when localStorage has invalid JSON', () => {
      localStorage.setItem(NOTIFICATIONS_KEY, 'not-valid-json')

      setActivePinia(createPinia())
      const freshStore = useNotificationsStore()
      expect(freshStore.notifications).toHaveLength(0)
    })

    it('returns empty array when localStorage key does not exist', () => {
      setActivePinia(createPinia())
      const freshStore = useNotificationsStore()
      expect(freshStore.notifications).toHaveLength(0)
    })

    it('handles localStorage.setItem failure silently', () => {
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = vi.fn(() => { throw new Error('QuotaExceeded') })

      // Should not throw
      expect(() => store.addNotification({ type: 'order_received', titleKey: 'test' })).not.toThrow()

      Storage.prototype.setItem = originalSetItem
    })
  })
})
