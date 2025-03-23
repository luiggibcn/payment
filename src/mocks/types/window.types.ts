export type IStateWindow = Window & {
    __pcaMocks: {
      resetMethods: Record<string, () => void>
      resetStates: () => void
      resetState: (identifier: string) => void
    }
  }