import { Client } from "@/clients/client"
import type { CartServiceClientException, ClientException, ClientOptions  } from "@/types/src/client"
import { ClientMiddleware } from "@/middlewares"

import type { LuiggiService } from "@/types/src/api"


class CartServiceExceptionMiddleware extends ClientMiddleware {
  public async afterFailedRequest<ResponseType>(
    _config: ClientOptions,
    error: ClientException
  ): Promise<ResponseType> {
    const expection: CartServiceClientException = {
      ...error,
      messages: error?.data?.messages,
      flowHint: error?.data?.flowHint
    }
    throw expection
  }
}

export class CartService extends Client {
  constructor(middlewares?: ClientMiddleware[]) {
    const clientOptions: ClientOptions = {
      baseUrl: '/'
    }
    super(clientOptions)
    this.useAcceptJSON()
    this.useMiddleware(new CartServiceExceptionMiddleware())
    middlewares?.forEach((middleware) => this.useMiddleware(middleware))
  }

  public async getCart(cartId?: string) {
    const queryParams: {
      [k: string]: string
    } = {}
    if (cartId) {
      queryParams['cartId'] = cartId
    }
    return await this.get<LuiggiService.CartDTO>({
      path: '/message',
      queryParams
    })
  }

  public async updateCartItem(body: Partial<LuiggiService.CartItemDTO>) {
    return await this.patch<LuiggiService.CartDTO>({
      path: '/message',
      body
    })
  }

//   public async addCartItem(
//     body: CartServiceType.CartRequestDto,
//     country: string,
//     language: string
//   ) {
//     return await this.post<CartServiceType.CartResponseDto>({
//       path: `/cart/{country}`,
//       pathParams: { country },
//       body,
//       queryParams: { language }
//     })
//   }

//   public async removeCartItem(erpNumber: string, requestOptions?: ClientRequestOptions) {
//     return await this.delete<CartServiceType.CartResponseDto>({
//       path: '/cart',
//       queryParams: { erpNumber },
//       requestOptions
//     })
//   }

//   public async applyCoupon(
//     couponCode: string,
//     couponCheckbox: boolean,
//     captchaResponse: string,
//     requestOptions?: ClientRequestOptions
//   ) {
//     return await this.post<CartServiceType.CartResponseDto>({
//       path: '/coupon',
//       body: {
//         couponCode,
//         couponCheckbox,
//         captchaResponse
//       },
//       requestOptions
//     })
//   }

//   public async removeCoupon(cartId: string, requestOptions?: ClientRequestOptions) {
//     return await this.delete<CartServiceType.CartResponseDto>({
//       path: '/coupon',
//       queryParams: { cartId },
//       requestOptions
//     })
//   }
}
