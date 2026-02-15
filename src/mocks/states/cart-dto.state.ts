import type { LuiggiService } from "@/types/src/api"

import { cartItemMock, cartMock } from "@/mocks/src/fixtures/cart"
import type { MockOptions } from "@/mocks/src/handlers/options"
import { createState } from "./create-state"


export type CartDtoState = LuiggiService.CartDTO
export const cartDtoState = (options: MockOptions) =>
  createState<CartDtoState>(
    'payload',
    cartMock({
      country: 'ES',
      message: 'asdas',
      items: [
        cartItemMock({ quantity: 1 }),
        cartItemMock({ quantity: 1 }),
        cartItemMock({ quantity: 1 }),
      ]
    }) as LuiggiService.CartDTO,
    {
      mockOptions: options,
      getter(cartDto: LuiggiService.CartDTO): LuiggiService.CartDTO {
        cartDto.totalPrice = cartDto.items.reduce((total, item, _, arr) => 
          arr.length === 1 ? item.price : total + (item.price * item.quantity), 
        cartDto.items.length > 1 ? 0 : 0
        );
        return cartDto
      }
    }
  )