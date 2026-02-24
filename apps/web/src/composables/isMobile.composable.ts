import { useThrottleFn } from '@vueuse/core'
import { onBeforeUnmount, onMounted, ref } from 'vue'

export const useIsMobile = (breakpoint: number = 768) => {
  const isMobile = ref<boolean>(window.innerWidth < breakpoint)
  const handleResize = useThrottleFn(() => {
    isMobile.value = window.innerWidth < breakpoint
  }, 200)

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
  })
  return { isMobile }
}
