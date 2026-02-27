// ── Toast types (ephemeral, auto-dismiss) ──────────────────────────────────
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  variant: ToastVariant
  /** i18n key or plain text */
  titleKey: string
  /** Optional i18n key or plain text for the description line */
  descriptionKey?: string
  /** i18n interpolation params, e.g. { table: '3' } */
  params?: Record<string, string | number>
  /** Duration in ms before auto-dismiss. 0 = sticky. Default: 4000 */
  duration: number
  /** Timestamp when created (Date.now()) */
  createdAt: number
}

export type ToastInput = Omit<Toast, 'id' | 'createdAt' | 'duration'> & {
  duration?: number
}

// ── In-app notification types (persistent, stored) ─────────────────────────
export type NotificationType = 'order_received' | 'order_ready'

export interface AppNotification {
  id: string
  type: NotificationType
  titleKey: string
  descriptionKey?: string
  params?: Record<string, string | number>
  read: boolean
  createdAt: number
}

export type AppNotificationInput = Omit<AppNotification, 'id' | 'read' | 'createdAt'>
