import type { LuiggiService } from "../../types/src/api"

import { cartItemMock, cartMock } from "../src/fixtures/cart"
import type { MockOptions } from "../src/handlers/options"
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
        cartItemMock({ quantity: 10 }),
        cartItemMock({ quantity: 9 }),
      ]
    }) as LuiggiService.CartDTO,
    {
      mockOptions: options,
      getter(cartDto: LuiggiService.CartDTO): LuiggiService.CartDTO {
        return cartDto
      }
    }
  )