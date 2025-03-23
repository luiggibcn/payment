export namespace LuiggiService {
    export type CartItemDTO = {
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
}