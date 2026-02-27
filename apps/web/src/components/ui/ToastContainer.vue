<script setup lang="ts">
import { useNotificationsStore } from '@/stores/notifications.store'
import { useIsMobile } from '@/composables/isMobile.composable'
import ToastItem from './ToastItem.vue'

const store = useNotificationsStore()
const { isMobile } = useIsMobile()
</script>

<template>
  <Teleport to="body">
    <div
      :class="[
        'fixed z-100 flex flex-col gap-2 pointer-events-none',
        isMobile
          ? 'bottom-4 left-4 right-4'
          : 'top-4 right-4 w-95'
      ]"
    >
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col gap-2"
      >
        <ToastItem
          v-for="toast in store.toasts"
          :key="toast.id"
          :toast="toast"
          @dismiss="store.dismissToast(toast.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
.toast-move {
  transition: transform 0.2s ease;
}

@media (max-width: 768px) {
  .toast-enter-from {
    opacity: 0;
    transform: translateY(100%);
  }
  .toast-leave-to {
    opacity: 0;
    transform: translateY(100%);
  }
}
</style>
