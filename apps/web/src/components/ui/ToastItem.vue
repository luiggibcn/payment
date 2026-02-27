<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Toast, ToastVariant } from '@billsplit/types'

defineProps<{ toast: Toast }>()
defineEmits<{ dismiss: [] }>()

const { t, te } = useI18n()

function resolve(key: string, params?: Record<string, string | number>): string {
  return te(key) ? t(key, params ?? {}) : key
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
}
</script>

<template>
  <div
    :class="[
      'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg',
      variantStyles[toast.variant]
    ]"
    role="alert"
  >
    <!-- Icon -->
    <svg class="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <template v-if="toast.variant === 'success'">
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </template>
      <template v-else-if="toast.variant === 'error'">
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </template>
      <template v-else>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </template>
    </svg>

    <!-- Text -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold">{{ resolve(toast.titleKey, toast.params) }}</p>
      <p v-if="toast.descriptionKey" class="text-xs mt-0.5 opacity-80">
        {{ resolve(toast.descriptionKey, toast.params) }}
      </p>
    </div>

    <!-- Dismiss -->
    <button
      @click="$emit('dismiss')"
      class="shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>
