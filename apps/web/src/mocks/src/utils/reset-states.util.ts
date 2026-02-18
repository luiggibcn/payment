import type { IStateWindow } from "@/mocks/types/window.types"

declare const window: IStateWindow

export const setupResetFunctionality = () => {
  if (!window.__pcaMocks) {
    window.__pcaMocks = {
      resetMethods: {},
      resetStates() {
        for (const key in window.__pcaMocks.resetMethods) {
          window.__pcaMocks.resetState(key)
        }
      },
      resetState(identifier: string) {
        window.__pcaMocks.resetMethods?.[identifier]()
      }
    }
  }
}
