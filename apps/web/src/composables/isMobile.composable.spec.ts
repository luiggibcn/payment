import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useIsMobile } from './isMobile.composable'

const originalInnerWidth = window.innerWidth

function setWidth(w: number) {
  Object.defineProperty(window, 'innerWidth', { value: w, writable: true, configurable: true })
}

function triggerResize() {
  window.dispatchEvent(new Event('resize'))
}

/** Wrapper component to test lifecycle-dependent composable */
function mountComposable(breakpoint?: number) {
  let result!: ReturnType<typeof useIsMobile>
  const wrapper = mount(
    defineComponent({
      setup() {
        result = breakpoint !== undefined ? useIsMobile(breakpoint) : useIsMobile()
        return () => null
      },
    }),
  )
  return { result, wrapper }
}

describe('useIsMobile', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    setWidth(originalInnerWidth)
  })

  describe('initial value', () => {
    it('returns true when window width is below default breakpoint (768)', () => {
      setWidth(500)
      const { result, wrapper } = mountComposable()
      expect(result.isMobile.value).toBe(true)
      wrapper.unmount()
    })

    it('returns false when window width is at the default breakpoint (768)', () => {
      setWidth(768)
      const { result, wrapper } = mountComposable()
      expect(result.isMobile.value).toBe(false)
      wrapper.unmount()
    })

    it('returns false when window width is above the default breakpoint', () => {
      setWidth(1024)
      const { result, wrapper } = mountComposable()
      expect(result.isMobile.value).toBe(false)
      wrapper.unmount()
    })
  })

  describe('custom breakpoint', () => {
    it('uses custom breakpoint when provided', () => {
      setWidth(500)
      const { result, wrapper } = mountComposable(480)
      expect(result.isMobile.value).toBe(false)
      wrapper.unmount()
    })

    it('returns true when width is below custom breakpoint', () => {
      setWidth(400)
      const { result, wrapper } = mountComposable(480)
      expect(result.isMobile.value).toBe(true)
      wrapper.unmount()
    })
  })

  describe('resize reactivity', () => {
    it('updates to true when window resizes below breakpoint', async () => {
      setWidth(1024)
      const { result, wrapper } = mountComposable()
      expect(result.isMobile.value).toBe(false)

      setWidth(600)
      triggerResize()
      vi.advanceTimersByTime(200)
      await nextTick()

      expect(result.isMobile.value).toBe(true)
      wrapper.unmount()
    })

    it('updates to false when window resizes above breakpoint', async () => {
      setWidth(500)
      const { result, wrapper } = mountComposable()
      expect(result.isMobile.value).toBe(true)

      setWidth(1024)
      triggerResize()
      vi.advanceTimersByTime(200)
      await nextTick()

      expect(result.isMobile.value).toBe(false)
      wrapper.unmount()
    })

    it('throttles rapid resize events', async () => {
      setWidth(1024)
      const { result, wrapper } = mountComposable()

      // Fire multiple resizes quickly — only the throttled callback should run
      setWidth(500)
      triggerResize()
      setWidth(1024)
      triggerResize()
      setWidth(300)
      triggerResize()

      // Before throttle fires, value should reflect the first throttled call
      vi.advanceTimersByTime(200)
      await nextTick()

      // After throttle, value should reflect the latest window.innerWidth (300)
      expect(result.isMobile.value).toBe(true)
      wrapper.unmount()
    })
  })

  describe('cleanup', () => {
    it('removes resize listener on unmount', async () => {
      setWidth(1024)
      const { result, wrapper } = mountComposable()
      wrapper.unmount()

      // Resize after unmount should not change the value
      setWidth(500)
      triggerResize()
      vi.advanceTimersByTime(200)
      await nextTick()

      expect(result.isMobile.value).toBe(false)
    })
  })

  describe('edge case: sidebar navigation on mobile', () => {
    it('stays reactive so collapsed sidebar can check isMobile after navigation', async () => {
      setWidth(500)
      const { result, wrapper } = mountComposable()
      expect(result.isMobile.value).toBe(true)

      // User rotates to landscape / wider view
      setWidth(1024)
      triggerResize()
      vi.advanceTimersByTime(250)
      await nextTick()
      expect(result.isMobile.value).toBe(false)

      // User rotates back to portrait
      setWidth(500)
      triggerResize()
      vi.advanceTimersByTime(250)
      await nextTick()
      expect(result.isMobile.value).toBe(true)

      wrapper.unmount()
    })
  })
})
