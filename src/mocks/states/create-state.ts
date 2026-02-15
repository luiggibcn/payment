
import { deepClone } from '@/utils'
import type { MockOptions } from '@/mocks/src/handlers/options'
import type { IWindow, IStateWindow } from '@/mocks/types'

const LOCAL_STORAGE_KEY = 'mockState'


let _state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? '{}')
declare const window: IWindow & IStateWindow
export type StateOptions<T> = {
  mockOptions: MockOptions
  getter?: (state: T) => T
}

export function createState<T>(identifier: string, state: T, options: StateOptions<T>) {
  // @ts-ignore
  const setState = (value, clear?: boolean) => {
    if (clear) {
      _state[identifier] = undefined
    }
    _state[identifier] = value
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(_state))
  }

  // initialize initial state
  if (options.mockOptions?.staticState) {
    _state = structuredClone(options.mockOptions.staticState)

    // reset state, if requested
    if (!window.__pcaMocks.resetMethods) {
      window.__pcaMocks.resetMethods = {}
    }
    window.__pcaMocks.resetMethods[identifier] = () => {
      _state = structuredClone(options.mockOptions.staticState)
    }
  }
  if (!_state || !_state[identifier] || options.mockOptions.useState !== true) {
    setState(state, true)
  } else if (Object.keys(_state[identifier]).length <= 0) {
    setState(state)
  }

  const get = (): T => {
    if (!!options.getter) {
      return options.getter(deepClone<T>(_state[identifier]))
    }
    return _state[identifier]
  }
  const update = (stateChanges: Partial<T>): T => {
    if (options.mockOptions.useState === true) {
      setState(stateChanges)
    }
    return get()
  }

  return {
    update,
    get
  }
}
