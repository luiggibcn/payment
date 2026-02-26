import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface CartItem {
  menuItemId: number
  name: string
  price: number
  quantity: number
  image: string
}

const STORAGE_KEY  = 'billsplit:cart'
const KITCHEN_KEY  = 'billsplit:kitchen'
const SNAPSHOT_KEY = 'billsplit:kitchen-snapshot'

export const useOrdersStore = defineStore('orders', () => {
  const tableOrders       = ref<Record<string, CartItem[]>>(loadCartFromStorage())
  const kitchenTableIds   = ref<string[]>(loadKitchenFromStorage())
  const kitchenSnapshots  = ref<Record<string, CartItem[]>>(loadSnapshotsFromStorage())

  function loadCartFromStorage(): Record<string, CartItem[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }

  function loadKitchenFromStorage(): string[] {
    try {
      const raw = localStorage.getItem(KITCHEN_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  function loadSnapshotsFromStorage(): Record<string, CartItem[]> {
    try {
      const raw = localStorage.getItem(SNAPSHOT_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tableOrders.value))
    } catch {}
  }

  function saveKitchen() {
    try {
      localStorage.setItem(KITCHEN_KEY, JSON.stringify(kitchenTableIds.value))
    } catch {}
  }

  function saveSnapshots() {
    try {
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(kitchenSnapshots.value))
    } catch {}
  }

  function getCart(tableId: string): CartItem[] {
    return tableOrders.value[tableId] ?? []
  }

  function addItem(tableId: string, item: Omit<CartItem, 'quantity'>) {
    if (!tableOrders.value[tableId]) {
      tableOrders.value[tableId] = []
    }
    const existing = tableOrders.value[tableId].find(i => i.menuItemId === item.menuItemId)
    if (existing) {
      existing.quantity++
    } else {
      tableOrders.value[tableId].push({ ...item, quantity: 1 })
    }
    save()
  }

  function updateQuantity(tableId: string, menuItemId: number, delta: number) {
    const cart = tableOrders.value[tableId]
    if (!cart) return
    const item = cart.find(i => i.menuItemId === menuItemId)
    if (!item) return
    item.quantity = Math.max(0, item.quantity + delta)
    if (item.quantity === 0) {
      tableOrders.value[tableId] = cart.filter(i => i.menuItemId !== menuItemId)
    }
    save()
  }

  function removeItem(tableId: string, menuItemId: number) {
    if (!tableOrders.value[tableId]) return
    tableOrders.value[tableId] = tableOrders.value[tableId].filter(i => i.menuItemId !== menuItemId)
    save()
  }

  function sendToKitchen(tableId: string) {
    if (!kitchenTableIds.value.includes(tableId)) {
      kitchenTableIds.value.push(tableId)
      saveKitchen()
    }
    // Always update the snapshot to reflect the current cart state
    kitchenSnapshots.value[tableId] = JSON.parse(JSON.stringify(getCart(tableId)))
    saveSnapshots()
  }

  function removeFromKitchen(tableId: string) {
    kitchenTableIds.value = kitchenTableIds.value.filter(id => id !== tableId)
    const { [tableId]: _, ...rest } = kitchenSnapshots.value
    kitchenSnapshots.value = rest
    saveKitchen()
    saveSnapshots()
  }

  function clearTable(tableId: string) {
    const { [tableId]: _cart, ...restCart } = tableOrders.value
    const { [tableId]: _snap, ...restSnap } = kitchenSnapshots.value
    tableOrders.value      = restCart
    kitchenSnapshots.value = restSnap
    kitchenTableIds.value  = kitchenTableIds.value.filter(id => id !== tableId)
    save()
    saveKitchen()
    saveSnapshots()
  }

  function getTotal(tableId: string): number {
    return (tableOrders.value[tableId] ?? []).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
  }

  function getItemCount(tableId: string): number {
    return (tableOrders.value[tableId] ?? []).reduce(
      (sum, item) => sum + item.quantity,
      0
    )
  }

  function isInKitchen(tableId: string): boolean {
    return kitchenTableIds.value.includes(tableId)
  }

  // Returns true if the current cart differs from the last snapshot sent to kitchen.
  // Used to decide whether the "Send to kitchen" button should be enabled.
  function hasChangesFromKitchen(tableId: string): boolean {
    const snapshot = kitchenSnapshots.value[tableId]
    if (!snapshot) return true
    const current = getCart(tableId)
    if (current.length !== snapshot.length) return true
    return current.some(item => {
      const snap = snapshot.find(s => s.menuItemId === item.menuItemId)
      return !snap || snap.quantity !== item.quantity
    })
  }

  return {
    tableOrders,
    kitchenTableIds,
    kitchenSnapshots,
    getCart,
    addItem,
    updateQuantity,
    removeItem,
    sendToKitchen,
    clearTable,
    getTotal,
    getItemCount,
    isInKitchen,
    hasChangesFromKitchen,
    removeFromKitchen,
  }
})
