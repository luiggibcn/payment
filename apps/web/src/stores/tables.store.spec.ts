import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTablesStore, type RestaurantTable } from './tables.store'

const STORAGE_KEY = 'billsplit:tables'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeTable(overrides: Partial<RestaurantTable> = {}): Omit<RestaurantTable, 'id'> {
  return {
    number:    99,
    zone:      'saloon',
    status:    'available' as const,
    seats:     4,
    occupants: 0,
    size:      'small' as const,
    gridCol:   5,
    gridRow:   5,
    colSpan:   1,
    rowSpan:   1,
    rotation:  0 as const,
    ...overrides,
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('tables.store', () => {
  let store: ReturnType<typeof useTablesStore>

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    store = useTablesStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // ── Estado inicial ─────────────────────────────────────────────────────────
  describe('initial state', () => {
    it('loads default tables when localStorage is empty', () => {
      expect(store.tables.length).toBeGreaterThan(0)
    })

    it('activeZone defaults to saloon', () => {
      expect(store.activeZone).toBe('saloon')
    })

    it('editMode is false', () => {
      expect(store.editMode).toBe(false)
    })

    it('selectedIds is empty', () => {
      expect(store.selectedIds).toHaveLength(0)
    })

    it('loads persisted data from localStorage', () => {
      const persisted = [makeTable({ number: 77, id: 'persisted-1' })]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))

      setActivePinia(createPinia())
      const freshStore = useTablesStore()

      expect(freshStore.tables).toHaveLength(1)
      expect(freshStore.tables[0].number).toBe(77)
    })

    it('falls back to defaults when localStorage has invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not-valid-json')

      setActivePinia(createPinia())
      const freshStore = useTablesStore()

      expect(freshStore.tables.length).toBeGreaterThan(0)
    })

    it('falls back to defaults when localStorage has an empty array', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]))

      setActivePinia(createPinia())
      const freshStore = useTablesStore()

      expect(freshStore.tables.length).toBeGreaterThan(0)
    })
  })

  // ── Computed ───────────────────────────────────────────────────────────────
  describe('filteredTables', () => {
    it('returns only tables from activeZone', () => {
      store.activeZone = 'terrace'
      expect(store.filteredTables.every(t => t.zone === 'terrace')).toBe(true)
    })

    it('updates reactively when activeZone changes', () => {
      store.activeZone = 'saloon'
      const saloonCount = store.filteredTables.length
      store.activeZone = 'outdoor'
      expect(store.filteredTables.length).not.toBe(saloonCount)
    })
  })

  describe('tablesByZone', () => {
    it('contains saloon, terrace and outdoor keys', () => {
      expect(store.tablesByZone).toHaveProperty('saloon')
      expect(store.tablesByZone).toHaveProperty('terrace')
      expect(store.tablesByZone).toHaveProperty('outdoor')
    })
  })

  describe('stats', () => {
    it('total equals tables.length', () => {
      expect(store.stats.total).toBe(store.tables.length)
    })

    it('counts each status correctly', () => {
      const available = store.tables.filter(t => t.status === 'available').length
      const reserved  = store.tables.filter(t => t.status === 'reserved').length
      const onDine    = store.tables.filter(t => t.status === 'on-dine').length

      expect(store.stats.available).toBe(available)
      expect(store.stats.reserved).toBe(reserved)
      expect(store.stats.onDine).toBe(onDine)
    })
  })

  // ── CRUD ───────────────────────────────────────────────────────────────────
  describe('addTable', () => {
    it('adds a new table to the list', () => {
      const before = store.tables.length
      store.addTable(makeTable({ number: 50 }))
      expect(store.tables.length).toBe(before + 1)
    })

    it('assigns a unique id prefixed with t-', () => {
      store.addTable(makeTable({ number: 50 }))
      const added = store.tables.find(t => t.number === 50)
      expect(added?.id).toMatch(/^t-\d+$/)
    })

    it('persists to localStorage', () => {
      store.addTable(makeTable({ number: 50 }))
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      expect(stored.some((t: { number: number }) => t.number === 50)).toBe(true)
    })
  })

  describe('updateTable', () => {
    it('updates the specified table', () => {
      const target = store.tables[0]
      store.updateTable(target.id, { seats: 99 })
      expect(store.tables.find(t => t.id === target.id)!.seats).toBe(99)
    })

    it('does nothing for an unknown id', () => {
      const before = JSON.stringify(store.tables)
      store.updateTable('non-existent', { seats: 99 })
      expect(JSON.stringify(store.tables)).toBe(before)
    })

    it('persists to localStorage', () => {
      const target = store.tables[0]
      store.updateTable(target.id, { seats: 99 })
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      expect(stored.find((t: { id: string }) => t.id === target.id).seats).toBe(99)
    })
  })

  describe('removeTable', () => {
    it('removes the table from the list', () => {
      const target = store.tables[0]
      store.removeTable(target.id)
      expect(store.tables.find(t => t.id === target.id)).toBeUndefined()
    })

    it('persists to localStorage', () => {
      const target = store.tables[0]
      store.removeTable(target.id)
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      expect(stored.some((t: { id: string }) => t.id === target.id)).toBe(false)
    })
  })

  // ── Layout ─────────────────────────────────────────────────────────────────
  describe('moveTable', () => {
    it('updates gridCol and gridRow', () => {
      const target = store.tables[0]
      store.moveTable(target.id, 3, 4)
      const moved = store.tables.find(t => t.id === target.id)!
      expect(moved.gridCol).toBe(3)
      expect(moved.gridRow).toBe(4)
    })
  })

  describe('rotateTable', () => {
    it('swaps colSpan and rowSpan', () => {
      store.addTable(makeTable({ number: 50, colSpan: 2, rowSpan: 1 }))
      const t = store.tables.find(t => t.number === 50)!
      store.rotateTable(t.id)
      const rotated = store.tables.find(t => t.number === 50)!
      expect(rotated.colSpan).toBe(1)
      expect(rotated.rowSpan).toBe(2)
    })

    it('increments rotation by 90 each call', () => {
      const target = store.tables[0]
      store.rotateTable(target.id)
      expect(store.tables.find(t => t.id === target.id)!.rotation).toBe(90)
      store.rotateTable(target.id)
      expect(store.tables.find(t => t.id === target.id)!.rotation).toBe(180)
      store.rotateTable(target.id)
      expect(store.tables.find(t => t.id === target.id)!.rotation).toBe(270)
      store.rotateTable(target.id)
      expect(store.tables.find(t => t.id === target.id)!.rotation).toBe(0)
    })
  })

  describe('toggleSize', () => {
    it('expands a small table to large (colSpan 2)', () => {
      store.addTable(makeTable({ number: 50 }))
      const t = store.tables.find(t => t.number === 50)!
      store.toggleSize(t.id)
      expect(store.tables.find(t => t.number === 50)!.colSpan).toBe(2)
      expect(store.tables.find(t => t.number === 50)!.size).toBe('large')
    })

    it('shrinks a large table back to small', () => {
      store.addTable(makeTable({ number: 50, colSpan: 2, rowSpan: 1, size: 'large' }))
      const t = store.tables.find(t => t.number === 50)!
      store.toggleSize(t.id)
      expect(store.tables.find(t => t.number === 50)!.colSpan).toBe(1)
      expect(store.tables.find(t => t.number === 50)!.size).toBe('small')
    })
  })

  // ── Merge ──────────────────────────────────────────────────────────────────
  describe('mergeTables', () => {
    it('replaces selected tables with a single merged table', () => {
      store.addTable(makeTable({ number: 10, id: 'm1', seats: 4, occupants: 2, status: 'available' }))
      store.addTable(makeTable({ number: 11, id: 'm2', seats: 4, occupants: 1, status: 'available' }))

      const t1 = store.tables.find(t => t.number === 10)!
      const t2 = store.tables.find(t => t.number === 11)!
      const before = store.tables.length

      store.mergeTables([t1.id, t2.id])

      expect(store.tables.length).toBe(before - 1)
      expect(store.tables.find(t => t.id === t1.id)).toBeUndefined()
      expect(store.tables.find(t => t.id === t2.id)).toBeUndefined()
    })

    it('sums seats and occupants', () => {
      store.addTable(makeTable({ number: 10, seats: 4, occupants: 2, status: 'available' }))
      store.addTable(makeTable({ number: 11, seats: 6, occupants: 3, status: 'available' }))

      const [t1, t2] = store.tables.slice(-2)
      store.mergeTables([t1.id, t2.id])

      const merged = store.tables.find(t => t.mergedFrom !== undefined)!
      expect(merged.seats).toBe(10)
      expect(merged.occupants).toBe(5)
    })

    it('status is on-dine if any table was on-dine', () => {
      store.addTable(makeTable({ number: 10, status: 'available' }))
      store.addTable(makeTable({ number: 11, status: 'on-dine' }))

      const [t1, t2] = store.tables.slice(-2)
      store.mergeTables([t1.id, t2.id])

      const merged = store.tables.find(t => t.mergedFrom !== undefined)!
      expect(merged.status).toBe('on-dine')
    })

    it('status is reserved if any table was reserved (and none on-dine)', () => {
      store.addTable(makeTable({ number: 10, status: 'available' }))
      store.addTable(makeTable({ number: 11, status: 'reserved' }))

      const [t1, t2] = store.tables.slice(-2)
      store.mergeTables([t1.id, t2.id])

      const merged = store.tables.find(t => t.mergedFrom !== undefined)!
      expect(merged.status).toBe('reserved')
    })

    it('status is available when all tables are available', () => {
      store.addTable(makeTable({ number: 10, status: 'available' }))
      store.addTable(makeTable({ number: 11, status: 'available' }))

      const [t1, t2] = store.tables.slice(-2)
      store.mergeTables([t1.id, t2.id])

      const merged = store.tables.find(t => t.mergedFrom !== undefined)!
      expect(merged.status).toBe('available')
    })

    it('does nothing when fewer than 2 ids are provided', () => {
      const before = store.tables.length
      store.mergeTables([store.tables[0].id])
      expect(store.tables.length).toBe(before)
    })
  })

  // ── Split ──────────────────────────────────────────────────────────────────
  describe('splitTable', () => {
    it('replaces the source table with the requested number of tables', () => {
      store.addTable(makeTable({ number: 20, seats: 6 }))
      const source = store.tables.find(t => t.number === 20)!
      const before = store.tables.length

      store.splitTable(source.id, 3)

      expect(store.tables.length).toBe(before + 2) // -1 source + 3 new = +2
      expect(store.tables.find(t => t.id === source.id)).toBeUndefined()
    })

    it('distributes seats evenly', () => {
      store.addTable(makeTable({ number: 20, seats: 6 }))
      const source = store.tables.find(t => t.number === 20)!
      store.splitTable(source.id, 3)

      const splits = store.tables.filter(t => t.id.startsWith(`split-${source.id}`))
      expect(splits.every(t => t.seats === 2)).toBe(true)
    })

    it('first tables get the extra seat when seats do not divide evenly', () => {
      store.addTable(makeTable({ number: 20, seats: 7 }))
      const source = store.tables.find(t => t.number === 20)!
      store.splitTable(source.id, 3)

      const splits = store.tables
        .filter(t => t.id.startsWith(`split-${source.id}`))
        .sort((a, b) => a.number - b.number)

      // 7 / 3 → 2 remainder 1 → first table gets 3, rest get 2
      expect(splits[0].seats).toBe(3)
      expect(splits[1].seats).toBe(2)
      expect(splits[2].seats).toBe(2)
    })

    it('all split tables are available with 0 occupants', () => {
      store.addTable(makeTable({ number: 20, seats: 4, status: 'on-dine', occupants: 3 }))
      const source = store.tables.find(t => t.number === 20)!
      store.splitTable(source.id, 2)

      const splits = store.tables.filter(t => t.id.startsWith(`split-${source.id}`))
      expect(splits.every(t => t.status === 'available')).toBe(true)
      expect(splits.every(t => t.occupants === 0)).toBe(true)
    })

    it('does not generate duplicate table numbers in the same zone', () => {
      // saloon already has tables 1-9; split table 8 (seats:4) into 2
      // → should not collide with existing table 9
      const source = store.tables.find(t => t.id === 't8')!
      store.splitTable(source.id, 2)

      const numbers = store.tables
        .filter(t => t.zone === 'saloon')
        .map(t => t.number)

      expect(new Set(numbers).size).toBe(numbers.length)
    })

    it('does not generate duplicate numbers after a merge+split cycle', () => {
      // Merge tables 8 and 9, then split the result into 2
      store.mergeTables(['t8', 't9'])
      const merged = store.tables.find(t => t.mergedFrom !== undefined)!

      store.splitTable(merged.id, 2)

      const numbers = store.tables
        .filter(t => t.zone === 'saloon')
        .map(t => t.number)

      expect(new Set(numbers).size).toBe(numbers.length)
    })

    it('does nothing when into < 2', () => {
      const before = store.tables.length
      store.splitTable(store.tables[0].id, 1)
      expect(store.tables.length).toBe(before)
    })
  })

  // ── Selección ──────────────────────────────────────────────────────────────
  describe('toggleSelect', () => {
    it('adds an id on first call', () => {
      store.toggleSelect('t1')
      expect(store.selectedIds).toContain('t1')
    })

    it('removes an already-selected id on second call', () => {
      store.toggleSelect('t1')
      store.toggleSelect('t1')
      expect(store.selectedIds).not.toContain('t1')
    })

    it('can select multiple tables', () => {
      store.toggleSelect('t1')
      store.toggleSelect('t2')
      expect(store.selectedIds).toHaveLength(2)
    })
  })

  describe('clearSelection', () => {
    it('empties selectedIds', () => {
      store.toggleSelect('t1')
      store.toggleSelect('t2')
      store.clearSelection()
      expect(store.selectedIds).toHaveLength(0)
    })
  })

  // ── Edit mode ──────────────────────────────────────────────────────────────
  describe('toggleEditMode', () => {
    it('toggles editMode', () => {
      expect(store.editMode).toBe(false)
      store.toggleEditMode()
      expect(store.editMode).toBe(true)
      store.toggleEditMode()
      expect(store.editMode).toBe(false)
    })

    it('clears selection when toggled', () => {
      store.toggleSelect('t1')
      store.toggleEditMode()
      expect(store.selectedIds).toHaveLength(0)
    })

    it('persists layout when leaving edit mode', () => {
      store.toggleEditMode()       // enter
      store.moveTable('t1', 3, 3)
      store.toggleEditMode()       // exit → saveLayout

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      const t1 = stored.find((t: { id: string }) => t.id === 't1')
      expect(t1.gridCol).toBe(3)
      expect(t1.gridRow).toBe(3)
    })
  })

  // ── saveToStorage error (line 73) ─────────────────────────────────────────
  describe('saveToStorage error handling', () => {
    it('logs a warning when localStorage.setItem throws', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = vi.fn(() => { throw new Error('QuotaExceeded') })

      // addTable calls saveToStorage internally
      store.addTable(makeTable({ number: 50 }))

      expect(warnSpy).toHaveBeenCalledWith(
        '[tables.store] Error saving to localStorage',
        expect.any(Error),
      )

      Storage.prototype.setItem = originalSetItem
      warnSpy.mockRestore()
    })
  })

  // ── storage event: invalid JSON (line 97) ────────────────────────────────
  describe('storage event with invalid JSON', () => {
    it('resets to defaults when another tab writes invalid JSON', () => {
      window.dispatchEvent(new StorageEvent('storage', {
        key:      'billsplit:tables',
        newValue: 'not-valid-json',
        oldValue: null,
      }))

      expect(store.tables.length).toBeGreaterThan(0)
    })
  })

  // ── syncWithBackend (lines 117-128) ──────────────────────────────────────
  describe('syncWithBackend', () => {
    it('posts tables to /api/tables/layout and updates lastSaved', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true })
      vi.stubGlobal('fetch', mockFetch)

      await store.syncWithBackend()

      expect(mockFetch).toHaveBeenCalledWith('/api/tables/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(store.tables),
      })
      expect(store.lastSaved).toBeInstanceOf(Date)
      expect(store.isSaving).toBe(false)

      vi.unstubAllGlobals()
    })

    it('sets isSaving to true during the request', async () => {
      let capturedIsSaving = false
      const mockFetch = vi.fn().mockImplementation(() => {
        capturedIsSaving = store.isSaving
        return Promise.resolve({ ok: true })
      })
      vi.stubGlobal('fetch', mockFetch)

      await store.syncWithBackend()

      expect(capturedIsSaving).toBe(true)
      expect(store.isSaving).toBe(false)

      vi.unstubAllGlobals()
    })

    it('handles fetch failure gracefully', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

      await store.syncWithBackend()

      expect(store.isSaving).toBe(false)
      expect(warnSpy).toHaveBeenCalledWith(
        '[tables.store] Error syncing with backend',
        expect.any(Error),
      )

      vi.unstubAllGlobals()
      warnSpy.mockRestore()
    })
  })

  // ── resetToDefaults ────────────────────────────────────────────────────────
  describe('resetToDefaults', () => {
    it('restores the default tables', () => {
      store.removeTable(store.tables[0].id)
      store.resetToDefaults()
      expect(store.tables.length).toBeGreaterThan(0)
    })

    it('persists defaults to localStorage', () => {
      store.resetToDefaults()
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      expect(stored.length).toBeGreaterThan(0)
    })
  })

  // ── Listeners de localStorage ──────────────────────────────────────────────
  describe('storage event listener', () => {
    it('resets to defaults when the key is removed from another tab', () => {
      // Simulate external key removal via StorageEvent
      window.dispatchEvent(new StorageEvent('storage', {
        key:      'billsplit:tables',
        newValue: null,
        oldValue: JSON.stringify(store.tables),
      }))

      expect(store.tables.length).toBeGreaterThan(0)
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    })

    it('resets to defaults on localStorage.clear() from another tab (key === null)', () => {
      window.dispatchEvent(new StorageEvent('storage', {
        key:      null,
        newValue: null,
        oldValue: null,
      }))

      expect(store.tables.length).toBeGreaterThan(0)
    })

    it('updates tables when another tab writes valid data', () => {
      const externalData = [makeTable({ number: 42, id: 'ext-1' })]
      window.dispatchEvent(new StorageEvent('storage', {
        key:      'billsplit:tables',
        newValue: JSON.stringify(externalData),
        oldValue: null,
      }))

      expect(store.tables).toHaveLength(1)
      expect(store.tables[0].number).toBe(42)
    })

    it('ignores storage events for unrelated keys', () => {
      const before = store.tables.length
      window.dispatchEvent(new StorageEvent('storage', {
        key:      'some-other-key',
        newValue: null,
        oldValue: 'something',
      }))
      expect(store.tables.length).toBe(before)
    })
  })

  describe('visibilitychange listener', () => {
    it('resets to defaults when returning to tab with missing key', () => {
      localStorage.removeItem(STORAGE_KEY)

      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'visible',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      expect(store.tables.length).toBeGreaterThan(0)
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    })

    it('does nothing when returning to tab with existing key', () => {
      const before = store.tables.length

      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'visible',
      })
      document.dispatchEvent(new Event('visibilitychange'))

      expect(store.tables.length).toBe(before)
    })
  })
})
