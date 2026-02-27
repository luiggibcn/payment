import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Toast, ToastInput, AppNotification, AppNotificationInput } from '@billsplit/types'

const NOTIFICATIONS_KEY = 'billsplit:notifications'
let toastCounter = 0

export const useNotificationsStore = defineStore('notifications', () => {
  // ── Toasts (ephemeral, not persisted) ──────────────────────────
  const toasts = ref<Toast[]>([])
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  function addToast(input: ToastInput): string {
    const id = `toast-${Date.now()}-${++toastCounter}`
    const toast: Toast = {
      ...input,
      id,
      duration: input.duration ?? 4000,
      createdAt: Date.now(),
    }
    toasts.value.push(toast)

    if (toast.duration > 0) {
      const timer = setTimeout(() => dismissToast(id), toast.duration)
      timers.set(id, timer)
    }
    return id
  }

  function dismissToast(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
  }

  // ── Notifications (persistent in localStorage) ─────────────────
  const notifications = ref<AppNotification[]>(loadNotifications())

  function loadNotifications(): AppNotification[] {
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  function saveNotifications() {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications.value))
    } catch { /* silent */ }
  }

  function addNotification(input: AppNotificationInput): string {
    const id = `notif-${Date.now()}-${++toastCounter}`
    const notif: AppNotification = {
      ...input,
      id,
      read: false,
      createdAt: Date.now(),
    }
    notifications.value.unshift(notif)
    saveNotifications()

    // Also show a toast for immediate visibility
    addToast({
      variant: 'info',
      titleKey: input.titleKey,
      descriptionKey: input.descriptionKey,
      params: input.params,
    })

    return id
  }

  function markAsRead(id: string) {
    const notif = notifications.value.find(n => n.id === id)
    if (notif) {
      notif.read = true
      saveNotifications()
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => { n.read = true })
    saveNotifications()
  }

  function clearNotifications() {
    notifications.value = []
    saveNotifications()
  }

  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.read).length
  )

  // ── Convenience shorthand methods ──────────────────────────────
  function success(titleKey: string, params?: Record<string, string | number>) {
    return addToast({ variant: 'success', titleKey, params })
  }

  function error(titleKey: string, params?: Record<string, string | number>) {
    return addToast({ variant: 'error', titleKey, params, duration: 6000 })
  }

  function warning(titleKey: string, params?: Record<string, string | number>) {
    return addToast({ variant: 'warning', titleKey, params })
  }

  function info(titleKey: string, params?: Record<string, string | number>) {
    return addToast({ variant: 'info', titleKey, params })
  }

  return {
    // Toast
    toasts,
    addToast,
    dismissToast,
    // Notifications
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    // Shorthand
    success,
    error,
    warning,
    info,
  }
})
