import { defineStore } from 'pinia'
import type { LuiggiService } from '../types/src/api'
import { ref } from 'vue'
import { cartService } from '../services/cart.service.client'


export const useCartStore = defineStore('cart-store', () => {
  const cart = ref<LuiggiService.CartDTO | null>(null)
  const fetchData = async () => {
      const response = await cartService.getCart()

      cart.value = response?.data
  }
  

  return {
    cart,
    fetchData
  }
})
