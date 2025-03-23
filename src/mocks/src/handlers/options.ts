
export type MockOptions = {
    countryCode: string
    /**
     * Indicator if the mock responses should use a runtime state that persists responses & requests during runtime
     */
    useState?: boolean
    /**
     * If staticState is set, the initial state will always start with the static state (eg. for testing)
     */
    staticState?: Record<string, object>
  }