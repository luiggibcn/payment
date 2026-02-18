import { describe, it, expect } from 'vitest'
import { getRandomUUIDUser } from './uuid.util'

describe('uuid.util', () => {
  describe('getRandomUUIDUser', () => {
    it('should generate a valid UUID v4', () => {
      const uuid = getRandomUUIDUser()
      
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      
      expect(uuid).toMatch(uuidRegex)
    })

    it('should generate unique UUIDs', () => {
      const uuid1 = getRandomUUIDUser()
      const uuid2 = getRandomUUIDUser()
      const uuid3 = getRandomUUIDUser()
      
      expect(uuid1).not.toBe(uuid2)
      expect(uuid2).not.toBe(uuid3)
      expect(uuid1).not.toBe(uuid3)
    })

    it('should always return a string', () => {
      const uuid = getRandomUUIDUser()
      
      expect(typeof uuid).toBe('string')
    })

    it('should generate UUIDs of correct length', () => {
      const uuid = getRandomUUIDUser()
      
      // UUID format has 36 characters (32 hex + 4 hyphens)
      expect(uuid).toHaveLength(36)
    })

    it('should generate multiple unique UUIDs in a loop', () => {
      const uuids = new Set<string>()
      const count = 100
      
      for (let i = 0; i < count; i++) {
        uuids.add(getRandomUUIDUser())
      }
      
      // All UUIDs should be unique
      expect(uuids.size).toBe(count)
    })
  })
})
