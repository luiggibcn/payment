import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useOrdersStore, type CartItem } from './orders.store'

const CART_KEY     = 'billsplit:cart'
const KITCHEN_KEY  = 'billsplit:kitchen'
const SNAPSHOT_KEY = 'billsplit:kitchen-snapshot'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeItem(overrides: Partial<Omit<CartItem, 'quantity'>> = {}): Omit<CartItem, 'quantity'> {
  return {
    menuItemId: 1,
    name:       'Espagueti Carbonara',
    price:      22.90,
    image:      '/products/1.png',
    ...overrides,
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('orders.store', () => {
  let store: ReturnType<typeof useOrdersStore>

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    store = useOrdersStore()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // ── Estado inicial ──────────────────────────────────────────────────────────
  describe('initial state', () => {
    it('starts with an empty cart', () => {
      expect(store.tableOrders).toEqual({})
    })

    it('starts with no kitchen table ids', () => {
      expect(store.kitchenTableIds).toHaveLength(0)
    })

    it('loads a persisted cart from localStorage', () => {
      const persisted: Record<string, CartItem[]> = {
        t1: [{ ...makeItem(), quantity: 2 }],
      }
      localStorage.setItem(CART_KEY, JSON.stringify(persisted))

      setActivePinia(createPinia())
      const freshStore = useOrdersStore()

      expect(freshStore.getCart('t1')).toHaveLength(1)
      expect(freshStore.getCart('t1')[0].quantity).toBe(2)
    })

    it('loads persisted kitchen ids from localStorage', () => {
      localStorage.setItem(KITCHEN_KEY, JSON.stringify(['t1', 't2']))

      setActivePinia(createPinia())
      const freshStore = useOrdersStore()

      expect(freshStore.kitchenTableIds).toEqual(['t1', 't2'])
    })

    it('falls back to empty cart on invalid JSON in localStorage', () => {
      localStorage.setItem(CART_KEY, 'not-valid-json')

      setActivePinia(createPinia())
      const freshStore = useOrdersStore()

      expect(freshStore.tableOrders).toEqual({})
    })

    it('falls back to empty kitchen ids on invalid JSON in localStorage', () => {
      localStorage.setItem(KITCHEN_KEY, 'not-valid-json')

      setActivePinia(createPinia())
      const freshStore = useOrdersStore()

      expect(freshStore.kitchenTableIds).toHaveLength(0)
    })
  })

  // ── getCart ─────────────────────────────────────────────────────────────────
  describe('getCart', () => {
    it('returns an empty array for an unknown table', () => {
      expect(store.getCart('unknown')).toEqual([])
    })

    it('returns the items for a known table', () => {
      store.addItem('t1', makeItem())
      expect(store.getCart('t1')).toHaveLength(1)
    })
  })

  // ── addItem ─────────────────────────────────────────────────────────────────
  describe('addItem', () => {
    it('adds a new item with quantity 1', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      expect(store.getCart('t1')[0].quantity).toBe(1)
    })

    it('increments quantity when the same item is added again', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      expect(store.getCart('t1')[0].quantity).toBe(2)
    })

    it('keeps separate entries for different menu items', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.addItem('t1', makeItem({ menuItemId: 2, name: 'Quinoa Salad', price: 4.90 }))
      expect(store.getCart('t1')).toHaveLength(2)
    })

    it('keeps separate carts per table', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.addItem('t2', makeItem({ menuItemId: 1 }))
      expect(store.getCart('t1')).toHaveLength(1)
      expect(store.getCart('t2')).toHaveLength(1)
    })

    it('persists the cart to localStorage', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      const stored = JSON.parse(localStorage.getItem(CART_KEY)!)
      expect(stored.t1).toHaveLength(1)
    })
  })

  // ── updateQuantity ──────────────────────────────────────────────────────────
  describe('updateQuantity', () => {
    it('increases quantity with a positive delta', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.updateQuantity('t1', 1, 2)
      expect(store.getCart('t1')[0].quantity).toBe(3)
    })

    it('decreases quantity with a negative delta', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.updateQuantity('t1', 1, -1)
      expect(store.getCart('t1')[0].quantity).toBe(1)
    })

    it('removes the item when quantity reaches 0', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.updateQuantity('t1', 1, -1)
      expect(store.getCart('t1')).toHaveLength(0)
    })

    it('never sets quantity below 0', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.updateQuantity('t1', 1, -99)
      expect(store.getCart('t1')).toHaveLength(0)
    })

    it('does nothing for an unknown table', () => {
      store.updateQuantity('unknown', 1, 1)
      expect(store.getCart('unknown')).toHaveLength(0)
    })

    it('does nothing for an unknown item', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.updateQuantity('t1', 999, 1)
      expect(store.getCart('t1')).toHaveLength(1)
    })

    it('persists the updated cart to localStorage', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.updateQuantity('t1', 1, 1)
      const stored = JSON.parse(localStorage.getItem(CART_KEY)!)
      expect(stored.t1[0].quantity).toBe(2)
    })
  })

  // ── removeItem ──────────────────────────────────────────────────────────────
  describe('removeItem', () => {
    it('removes the specified item', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.addItem('t1', makeItem({ menuItemId: 2, name: 'Quinoa Salad', price: 4.90 }))
      store.removeItem('t1', 1)
      expect(store.getCart('t1').find(i => i.menuItemId === 1)).toBeUndefined()
      expect(store.getCart('t1')).toHaveLength(1)
    })

    it('does nothing for an unknown table', () => {
      store.removeItem('unknown', 1)
      expect(store.getCart('unknown')).toHaveLength(0)
    })

    it('persists the updated cart to localStorage', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.removeItem('t1', 1)
      const stored = JSON.parse(localStorage.getItem(CART_KEY)!)
      expect(stored.t1).toHaveLength(0)
    })
  })

  // ── sendToKitchen ───────────────────────────────────────────────────────────
  describe('sendToKitchen', () => {
    it('adds the table id to kitchenTableIds', () => {
      store.sendToKitchen('t1')
      expect(store.kitchenTableIds).toContain('t1')
    })

    it('does not duplicate the table id', () => {
      store.sendToKitchen('t1')
      store.sendToKitchen('t1')
      expect(store.kitchenTableIds.filter(id => id === 't1')).toHaveLength(1)
    })

    it('can mark multiple tables', () => {
      store.sendToKitchen('t1')
      store.sendToKitchen('t2')
      expect(store.kitchenTableIds).toContain('t1')
      expect(store.kitchenTableIds).toContain('t2')
    })

    it('persists kitchen ids to localStorage', () => {
      store.sendToKitchen('t1')
      const stored = JSON.parse(localStorage.getItem(KITCHEN_KEY)!)
      expect(stored).toContain('t1')
    })

    it('saves a snapshot of the cart at send time', () => {
      store.addItem('t1', makeItem({ menuItemId: 1, price: 10 }))
      store.addItem('t1', makeItem({ menuItemId: 1, price: 10 })) // qty 2
      store.sendToKitchen('t1')
      const snapshot = store.kitchenSnapshots['t1']
      expect(snapshot).toHaveLength(1)
      expect(snapshot[0].quantity).toBe(2)
    })

    it('updates the snapshot on a second send (re-send after modifications)', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.sendToKitchen('t1')
      store.addItem('t1', makeItem({ menuItemId: 2, name: 'Quinoa Salad', price: 4.90 }))
      store.sendToKitchen('t1')
      expect(store.kitchenSnapshots['t1']).toHaveLength(2)
    })

    it('persists the snapshot to localStorage', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.sendToKitchen('t1')
      const stored = JSON.parse(localStorage.getItem(SNAPSHOT_KEY)!)
      expect(stored.t1).toHaveLength(1)
    })
  })

  // ── isInKitchen ─────────────────────────────────────────────────────────────
  describe('isInKitchen', () => {
    it('returns false for a table not sent to kitchen', () => {
      expect(store.isInKitchen('t1')).toBe(false)
    })

    it('returns true after sendToKitchen', () => {
      store.sendToKitchen('t1')
      expect(store.isInKitchen('t1')).toBe(true)
    })
  })

  // ── clearTable ──────────────────────────────────────────────────────────────
  describe('clearTable', () => {
    it('removes the cart for the table', () => {
      store.addItem('t1', makeItem())
      store.clearTable('t1')
      expect(store.getCart('t1')).toHaveLength(0)
    })

    it('removes the table from kitchenTableIds', () => {
      store.sendToKitchen('t1')
      store.clearTable('t1')
      expect(store.isInKitchen('t1')).toBe(false)
    })

    it('does not affect other tables', () => {
      store.addItem('t1', makeItem())
      store.addItem('t2', makeItem())
      store.sendToKitchen('t2')
      store.clearTable('t1')
      expect(store.getCart('t2')).toHaveLength(1)
      expect(store.isInKitchen('t2')).toBe(true)
    })

    it('persists the cleared cart to localStorage', () => {
      store.addItem('t1', makeItem())
      store.clearTable('t1')
      const stored = JSON.parse(localStorage.getItem(CART_KEY)!)
      expect(stored.t1).toBeUndefined()
    })

    it('persists the updated kitchen ids to localStorage', () => {
      store.sendToKitchen('t1')
      store.clearTable('t1')
      const stored = JSON.parse(localStorage.getItem(KITCHEN_KEY)!)
      expect(stored).not.toContain('t1')
    })

    it('removes the kitchen snapshot for the table', () => {
      store.addItem('t1', makeItem())
      store.sendToKitchen('t1')
      store.clearTable('t1')
      expect(store.kitchenSnapshots['t1']).toBeUndefined()
    })

    it('persists the removed snapshot to localStorage', () => {
      store.addItem('t1', makeItem())
      store.sendToKitchen('t1')
      store.clearTable('t1')
      const stored = JSON.parse(localStorage.getItem(SNAPSHOT_KEY)!)
      expect(stored.t1).toBeUndefined()
    })
  })

  // ── removeFromKitchen ───────────────────────────────────────────────────────
  describe('removeFromKitchen', () => {
    it('removes the table from kitchenTableIds', () => {
      store.sendToKitchen('t1')
      store.removeFromKitchen('t1')
      expect(store.isInKitchen('t1')).toBe(false)
    })

    it('removes the kitchen snapshot for the table', () => {
      store.addItem('t1', makeItem())
      store.sendToKitchen('t1')
      store.removeFromKitchen('t1')
      expect(store.kitchenSnapshots['t1']).toBeUndefined()
    })

    it('does not affect other tables in kitchenTableIds', () => {
      store.sendToKitchen('t1')
      store.sendToKitchen('t2')
      store.removeFromKitchen('t1')
      expect(store.isInKitchen('t1')).toBe(false)
      expect(store.isInKitchen('t2')).toBe(true)
    })

    it('persists the updated kitchen ids to localStorage', () => {
      store.sendToKitchen('t1')
      store.removeFromKitchen('t1')
      const stored = JSON.parse(localStorage.getItem(KITCHEN_KEY)!)
      expect(stored).not.toContain('t1')
    })

    it('persists the removed snapshot to localStorage', () => {
      store.addItem('t1', makeItem())
      store.sendToKitchen('t1')
      store.removeFromKitchen('t1')
      const stored = JSON.parse(localStorage.getItem(SNAPSHOT_KEY)!)
      expect(stored.t1).toBeUndefined()
    })

    it('is a no-op for a table not in kitchen', () => {
      store.removeFromKitchen('t1')
      expect(store.isInKitchen('t1')).toBe(false)
      expect(store.kitchenSnapshots['t1']).toBeUndefined()
    })

    it('preserves the cart when called (unlike clearTable)', () => {
      store.addItem('t1', makeItem())
      store.sendToKitchen('t1')
      store.removeFromKitchen('t1')
      expect(store.getCart('t1')).toHaveLength(1)
    })
  })

  // ── hasChangesFromKitchen ───────────────────────────────────────────────────
  describe('hasChangesFromKitchen', () => {
    it('returns true when there is no snapshot (table never sent to kitchen)', () => {
      store.addItem('t1', makeItem())
      expect(store.hasChangesFromKitchen('t1')).toBe(true)
    })

    it('returns false immediately after sendToKitchen (cart matches snapshot)', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.sendToKitchen('t1')
      expect(store.hasChangesFromKitchen('t1')).toBe(false)
    })

    it('returns true when a new item is added after the last send', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.sendToKitchen('t1')
      store.addItem('t1', makeItem({ menuItemId: 2, name: 'Quinoa Salad', price: 4.90 }))
      expect(store.hasChangesFromKitchen('t1')).toBe(true)
    })

    it('returns true when an item quantity changes after the last send', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.sendToKitchen('t1')
      store.updateQuantity('t1', 1, 1)
      expect(store.hasChangesFromKitchen('t1')).toBe(true)
    })

    it('returns true when an item is removed after the last send', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.addItem('t1', makeItem({ menuItemId: 2, name: 'Quinoa Salad', price: 4.90 }))
      store.sendToKitchen('t1')
      store.removeItem('t1', 2)
      expect(store.hasChangesFromKitchen('t1')).toBe(true)
    })

    it('returns false again after a second send with the updated cart', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.sendToKitchen('t1')
      store.addItem('t1', makeItem({ menuItemId: 2, name: 'Quinoa Salad', price: 4.90 }))
      store.sendToKitchen('t1') // second send updates the snapshot
      expect(store.hasChangesFromKitchen('t1')).toBe(false)
    })

    it('does not affect other tables', () => {
      store.addItem('t1', makeItem({ menuItemId: 1 }))
      store.addItem('t2', makeItem({ menuItemId: 1 }))
      store.sendToKitchen('t1')
      store.sendToKitchen('t2')
      store.addItem('t1', makeItem({ menuItemId: 2, name: 'Quinoa Salad', price: 4.90 }))
      expect(store.hasChangesFromKitchen('t1')).toBe(true)
      expect(store.hasChangesFromKitchen('t2')).toBe(false)
    })
  })

  // ── getTotal ────────────────────────────────────────────────────────────────
  describe('getTotal', () => {
    it('returns 0 for an unknown table', () => {
      expect(store.getTotal('unknown')).toBe(0)
    })

    it('returns 0 for an empty cart', () => {
      store.addItem('t1', makeItem())
      store.removeItem('t1', 1)
      expect(store.getTotal('t1')).toBe(0)
    })

    it('calculates price × quantity for each item and sums them', () => {
      store.addItem('t1', makeItem({ menuItemId: 1, price: 10 }))
      store.addItem('t1', makeItem({ menuItemId: 1, price: 10 }))  // qty 2 → 20
      store.addItem('t1', makeItem({ menuItemId: 2, name: 'Quinoa Salad', price: 5 }))  // qty 1 → 5
      expect(store.getTotal('t1')).toBe(25)
    })
  })

  // ── getItemCount ────────────────────────────────────────────────────────────
  describe('getItemCount', () => {
    it('returns 0 for an unknown table', () => {
      expect(store.getItemCount('unknown')).toBe(0)
    })

    it('counts total units across all items', () => {
      store.addItem('t1', makeItem({ menuItemId: 1, price: 10 }))
      store.addItem('t1', makeItem({ menuItemId: 1, price: 10 }))  // qty 2
      store.addItem('t1', makeItem({ menuItemId: 2, name: 'Quinoa Salad', price: 5 }))  // qty 1
      expect(store.getItemCount('t1')).toBe(3)
    })
  })
})
