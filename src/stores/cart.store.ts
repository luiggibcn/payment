import type { User } from '@supabase/supabase-js'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface CartProduct {
  id: number | string
  name: string
  category: string
  price: number        // precio unitario
  image: string
  badge?: string | null
}

export interface CartItem extends CartProduct {
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  // STATE
  const userCart = ref<User | null>(null)
  const items = ref<CartItem[]>([])
  const taxRate = ref(5) // %

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
  }

  const removeProduct = (productId: CartProduct['id']) => {
    items.value = items.value.filter(item => item.id !== productId)
  }

  const setQuantity = (productId: CartProduct['id'], quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId)
      return
    }

    const item = findItem(productId)
    if (!item) return

    item.quantity = quantity
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
    }
  }

  const clearCart = () => {
    items.value = []
  }

  const setTaxRate = (rate: number) => {
    if (rate < 0) rate = 0
    taxRate.value = rate
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
