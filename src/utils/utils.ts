import { cloneDeep } from 'lodash-es'
import merge from 'deepmerge'

export const deepClone = <T>(source: any): T => {
  return cloneDeep<T>(source)
}

export const deepMerge = <T>(target: any, source: any): T => {
  return merge(target, source)
}

export const getRandomUUIDUser = (): string => {
  return globalThis.crypto.randomUUID()
}