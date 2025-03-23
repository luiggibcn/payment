import { faker } from '@faker-js/faker'
import type { LuiggiService } from '../../../types/src/api'

export function cartItemMock({
    quantity,
}: {
    quantity: number
}): LuiggiService.CartItemDTO {
    return {
      quantity: quantity,
      price: Number(faker.commerce.price({ min: 8, max: 179, dec: 0 })),
      productName: faker.commerce.productName()
    }
}

export function cartMock({
    country = 'ES',
    message = '',
    items,
  }: {
    message?: string
    country?: string
    items?: LuiggiService.CartItemDTO[]
  } = {}): LuiggiService.CartDTO {
    const cartItems = !!items ? (Array.isArray(items) ? items : [items]) : []

    
      const calulatedTotal = cartItems.reduce((total, item, _, arr) => 
        arr.length === 1 ? item.price : total + (item.price * item.quantity), 
        cartItems.length > 1 ? 0 : 0
      );

    return {
        country: country,
        message: message,
        items: cartItems,
        totalPrice: calulatedTotal
    }
  }
  