// import { http, HttpResponse, } from 'msw'

import { http, HttpResponse } from "msw"
import { CartApiHandler, type MockOptions } from "./src/handlers"

// export default [
//     http.get(`/message`, () => {
//         return HttpResponse.json({
//             message: 'it works'
//         })
//     }),
// ]


// set correct country code for checkout-api mocks
export const handlerOptions: MockOptions = {
    countryCode: 'ES',
    useState: true,
    staticState: undefined
  }
  
  export const handlers = [
    ...CartApiHandler(handlerOptions),
    // ...CheckoutApiHandler(handlerOptions),
    // ...AddressProvisioningApiHandler(handlerOptions),
    // ...DisclaimerApiHandler(handlerOptions),
    // ...AddressServiceHandler(handlerOptions),
    // ...GeneralTermsDigitalServiceHandler(handlerOptions),
    // ...RedemptionDigitalServiceHandler(handlerOptions),
    // http.get('https://h.online-metrix.net/*', () => {
    //   return new HttpResponse()
    // }),
    // https://placehold.co/400
    http.get('https://placehold.co/*', () => {
      return new HttpResponse()
    }),
    // http.get('https://placehold.net/*', () => {
    //   return new HttpResponse()
    // })
  ]
  