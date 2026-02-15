import { http, HttpHandler, HttpResponse, } from 'msw'
import type { MockOptions } from './options'
import { cartDtoState } from '@/mocks/states/cart-dto.state'
import { setupResetFunctionality } from '@/mocks/src/utils/reset-states.util'
import type { LuiggiService } from '@/types/src/api'
import { cartItemMock } from '@/mocks/src/fixtures/cart'

setupResetFunctionality()

export const handlers = (options: MockOptions): HttpHandler[] => {
  const { get, update } = cartDtoState(options)

  return [
      http.get(`/message`, () => {
        return HttpResponse.json(get())
    }),
    http.patch(`/message`, async ({ request }) => {
      const body = (await request.json()) as LuiggiService.CartItemDTO
      return HttpResponse.json(update({
          ...get(),
          items: get()?.items?.map((cartItem) => {
            if (cartItem.sku === body.sku) {
              cartItem.quantity = body.quantity
            }
            return cartItem
          }), totalPrice: get()?.items.reduce((total, item, _, arr) => 
            arr.length === 1 ? item.price : total + (item.price * item.quantity), 
            get()?.items.length > 1 ? 0 : 0
          ),
        })
      )
    }),
   http.post(`/message/:id`, async ({ request }) => {
     const body = (await request.json()) as LuiggiService.CartItemDTO
     return HttpResponse.json({
       payload: update({
         items: [
           ...(get()?.items ?? []),
           cartItemMock({
             quantity: body.quantity,
           })
         ]
       })
     })
   }),
  ]

}