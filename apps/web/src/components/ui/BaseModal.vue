<script setup lang="ts">
interface Props {
  open: boolean
}

defineProps<Props>()
const emit = defineEmits<{ dismiss: [] }>()

defineSlots<{
  default(): any
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      @click.self="emit('dismiss')"
    >
      <div class="bg-white rounded-2xl w-full max-w-sm flex flex-col gap-5 shadow-xl p-6">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
