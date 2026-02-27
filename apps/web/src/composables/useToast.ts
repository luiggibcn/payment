import { useNotificationsStore } from '@/stores/notifications.store'
import type { ToastInput, AppNotificationInput } from '@billsplit/types'

export function useToast() {
  const store = useNotificationsStore()

  return {
    toast: (input: ToastInput) => store.addToast(input),
    success: store.success,
    error: store.error,
    warning: store.warning,
    info: store.info,
    dismiss: store.dismissToast,
    notify: (input: AppNotificationInput) => store.addNotification(input),
  }
}
