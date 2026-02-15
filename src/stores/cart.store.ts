import { defineStore } from 'pinia'
import type { LuiggiService } from '../types/src/api'
import { ref } from 'vue'
import { cartService } from '../services/cart.service.client'

export const useCartStore = defineStore('cart-store', () => {
  const cart = ref<LuiggiService.CartDTO>()
  const fetchData = async () => {
      const response = await cartService.getCart()
      cart.value = response?.data
  }
  const updateCartItem = async (cartRequestDto: LuiggiService.CartItemDTO) => {
    const itemValor = cart.value?.items.find(item => item.sku === cartRequestDto.sku)
    if (!itemValor) return 
    const total = itemValor.quantity + cartRequestDto.quantity

    const response = await cartService.updateCartItem({
      sku: cartRequestDto.sku,
      quantity: total
    })

    cart.value = response?.data
  }
  

  return {
    cart,
    fetchData,
    updateCartItem
  }
})
