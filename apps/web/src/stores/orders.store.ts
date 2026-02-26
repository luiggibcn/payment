import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface CartItem {
  menuItemId: number
  name: string
  price: number
  quantity: number
  image: string
}

const STORAGE_KEY = 'billsplit:cart'

export const useOrdersStore = defineStore('orders', () => {
  const tableOrders = ref<Record<string, CartItem[]>>(loadFromStorage())
  const kitchenTableIds = ref<string[]>([])

  function loadFromStorage(): Record<string, CartItem[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
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
    }
  }

  function clearTable(tableId: string) {
    const { [tableId]: _, ...rest } = tableOrders.value
    tableOrders.value = rest
    kitchenTableIds.value = kitchenTableIds.value.filter(id => id !== tableId)
    save()
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

  return {
    tableOrders,
    kitchenTableIds,
    getCart,
    addItem,
    updateQuantity,
    removeItem,
    sendToKitchen,
    clearTable,
    getTotal,
    getItemCount,
    isInKitchen,
  }
})
