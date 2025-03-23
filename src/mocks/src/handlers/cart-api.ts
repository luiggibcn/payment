import { http, HttpHandler, HttpResponse, } from 'msw'
import type { MockOptions } from './options'
import { cartDtoState } from '../../states/cart-dto.state'
import { setupResetFunctionality } from '../utils/reset-states.util'

setupResetFunctionality()

export const handlers = (options: MockOptions): HttpHandler[] => {
  const { get, update } = cartDtoState(options)

  return [http.get(`/message`, () => {
    return HttpResponse.json(get())
  })]

}