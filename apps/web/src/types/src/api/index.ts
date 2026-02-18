export namespace LuiggiService {
    export type CartItemDTO = {
        sku: string
        quantity: number
        price: number
        productName: string
    }
    export type CartDTO = {
        country: string
        message: string
        items: CartItemDTO[]
        totalPrice: number
    }

    export type UpdateCartItemDTO = Pick<CartItemDTO, 'sku' | 'quantity'>

}