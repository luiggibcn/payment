import type { User } from '@supabase/supabase-js'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { AuthUser } from './auth.store'

export interface CartProduct {
  id: number | string
  name: string
  category: string
  price: number
  image: string
  video?: string
  badge?: string | null
  width?: 1 | 2
}

export interface CartItem extends CartProduct {
  quantity: number
}

const STORAGE_KEY = 'cart_items'
const CHANNEL_NAME = 'cart_sync'

export const useCartStore = defineStore('cart', () => {
  // STATE
  const userCart = ref<AuthUser | null>(null)
  const items = ref<CartItem[]>([])
  const taxRate = ref(5)

  let isUpdatingFromBroadcast = false
  // Broadcast Channel para sincronización entre pestañas

  let broadcastChannel: BroadcastChannel | null = null

  // Inicializar BroadcastChannel (solo en el cliente)
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME)

    // Escuchar mensajes de otras pestañas
    broadcastChannel.onmessage = (event) => {
      if (event.data.type === 'CART_UPDATE') {
        isUpdatingFromBroadcast = true
        items.value = event.data.items
        taxRate.value = event.data.taxRate
        setTimeout(() => {
          isUpdatingFromBroadcast = false
        }, 0)
      }
    }
  }

  // Cargar carrito desde localStorage al inicializar
  const loadFromStorage = () => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        items.value = parsed.items || []
        taxRate.value = parsed.taxRate || 5
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error)
    }
  }

  // Guardar en localStorage y notificar a otras pestañas
const saveToStorage = () => {
  if (typeof window === 'undefined') return
  if (isUpdatingFromBroadcast) return

  try {
    // Convertir a plain objects
    const plainItems = items.value.map(item => ({ ...item }))
    
    const cartData = {
      items: plainItems,
      taxRate: taxRate.value,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartData))

    // Notificar a otras pestañas
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'CART_UPDATE',
        items: plainItems,
        taxRate: taxRate.value,
      })
    }
  } catch (error) {
    console.error('Error saving cart to storage:', error)
  }
}

  // Watch para guardar automáticamente cuando cambie el carrito
  watch(
    () => [items.value, taxRate.value],
    () => {
      saveToStorage()
    },
    { deep: true }
  )

  // Cargar al inicializar
  loadFromStorage()

  // GETTERS
  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const subtotal = computed(() => {
    const sum = items.value.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
    return parseFloat(sum.toFixed(2))
  })

  const totalTax = computed(() => {
    const tax = subtotal.value * (taxRate.value / 100)
    return parseFloat(tax.toFixed(2))
  })

  const total = computed(() => {
    const totalWithTax = subtotal.value + totalTax.value
    return parseFloat(totalWithTax.toFixed(2))
  })

  // HELPERS
  const findItemIndex = (productId: CartProduct['id']) =>
    items.value.findIndex(item => item.id === productId)

  const findItem = (productId: CartProduct['id']) =>
    items.value.find(item => item.id === productId)

  // ACTIONS
  const addProduct = (product: CartProduct, quantity = 1) => {
    if (quantity <= 0) return

    const index = findItemIndex(product.id)

    if (index === -1) {
      items.value.unshift({
        ...product,
        quantity,
      })
    } else {
      items.value[index].quantity += quantity
    }
    saveToStorage()
  }

  const removeProduct = (productId: CartProduct['id']) => {
    items.value = items.value.filter(item => item.id !== productId)
    saveToStorage()
  }

  const setQuantity = (productId: CartProduct['id'], quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId)
      return
    }

    const item = findItem(productId)
    if (!item) return

    item.quantity = quantity
    saveToStorage()
  }

  const increment = (product: CartProduct) => {
    addProduct(product, 1)
  }

  const decrement = (productId: CartProduct['id']) => {
    const item = findItem(productId)
    if (!item) return

    if (item.quantity <= 1) {
      removeProduct(productId)
    } else {
      item.quantity -= 1
      saveToStorage()
    }
  }

  const clearCart = () => {
    items.value = []
    saveToStorage()
  }

  const setTaxRate = (rate: number) => {
    if (rate < 0) rate = 0
    taxRate.value = rate
    saveToStorage()
  }

  return {
    // state
    items,
    taxRate,
    userCart,
    // getters
    itemCount,
    subtotal,
    totalTax,
    total,
    // actions
    addProduct,
    removeProduct,
    setQuantity,
    increment,
    decrement,
    clearCart,
    setTaxRate,
    // helpers opcionales si quieres usarlos fuera
    findItem,
  }
})
