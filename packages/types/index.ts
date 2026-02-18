// packages/types/index.ts

export interface Tenant {
  id: string
  name: string
  country: string
  currency: string
}

export interface Dish {
  id: string
  tenant_id: string
  category_id: string | null
  name: string
  price: number
  is_featured: boolean
  is_available: boolean
}

export interface Order {
  id: string
  tenant_id: string
  table_id: string
  status: 'open' | 'partial' | 'closed' | 'cancelled'
  tax_rate: number
  subtotal: number
  tax_amount: number
  total: number
  amount_paid: number
  amount_remaining: number
}

export interface OrderGuest {
  id: string
  order_id: string
  user_id: string | null
  guest_name: string
  session_token: string
}

export interface OrderItem {
  id: string
  order_id: string
  dish_id: string | null
  guest_id: string | null
  dish_name: string
  dish_price: number
  quantity: number
  kitchen_status: 'pending' | 'cooking' | 'ready' | 'delivered'
  payment_status: 'unassigned' | 'assigned' | 'paid'
  notes: string | null
}

export interface Payment {
  id: string
  order_id: string
  guest_id: string | null
  amount: number
  tip_amount: number
  total_charged: number
  payment_method: 'bizum' | 'cash' | 'card'
  status: 'pending' | 'confirmed' | 'failed'
  bizum_reference: string | null
}

// API response wrapper
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}
