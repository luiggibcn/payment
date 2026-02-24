import { describe, it, expect } from 'vitest'
import { deepClone, deepMerge } from './object.util'

describe('object.util', () => {
  describe('deepClone', () => {
    it('should clone a simple object', () => {
      const original = { name: 'John', age: 30 }
      const cloned = deepClone(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original) // Diferente referencia
    })

    it('should clone nested objects', () => {
      const original = {
        user: {
          name: 'John',
          address: {
            city: 'Barcelona',
            country: 'Spain'
          }
        }
      }
      const cloned = deepClone<typeof original>(original)

      expect(cloned).toEqual(original)
      expect(cloned.user).not.toBe(original.user)
      expect(cloned.user.address).not.toBe(original.user.address)
    })

    it('should clone arrays', () => {
      const original = [1, 2, { nested: true }]
      const cloned = deepClone<typeof original>(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned[2]).not.toBe(original[2])
    })

    it('should handle null and undefined', () => {
      expect(deepClone(null)).toBeNull()
      expect(deepClone(undefined)).toBeUndefined()
    })

    it('should clone dates', () => {
      const original = new Date('2026-02-15')
      const cloned = deepClone<Date>(original)

      expect(cloned.getTime()).toBe(original.getTime())
      expect(cloned).not.toBe(original)
    })
  })

  describe('deepMerge', () => {
    it('should merge two simple objects', () => {
      const target = { a: 1, b: 2 }
      const source = { b: 3, c: 4 }
      const result = deepMerge(target, source)

      expect(result).toEqual({ a: 1, b: 3, c: 4 })
    })

    it('should merge nested objects', () => {
      const target = {
        user: {
          name: 'John',
          age: 30
        }
      }
      const source = {
        user: {
          age: 31,
          city: 'Barcelona'
        }
      }
      const result = deepMerge(target, source)

      expect(result).toEqual({
        user: {
          name: 'John',
          age: 31,
          city: 'Barcelona'
        }
      })
    })

    it('should replace arrays (source wins)', () => {
      const target = { items: [1, 2] }
      const source = { items: [3, 4] }
      const result = deepMerge(target, source)

      expect(result).toEqual({ items: [3, 4] })
    })

    it('should not mutate original objects', () => {
      const target = { a: 1 }
      const source = { b: 2 }
      const result = deepMerge(target, source)

      expect(target).toEqual({ a: 1 })
      expect(source).toEqual({ b: 2 })
      expect(result).toEqual({ a: 1, b: 2 })
    })

    it('should handle empty objects', () => {
      const target = {}
      const source = { a: 1 }
      const result = deepMerge(target, source)

      expect(result).toEqual({ a: 1 })
    })
  })
})
