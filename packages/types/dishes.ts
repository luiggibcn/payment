export interface Dish {
  id: string
  tenant_id: string
  category_id: string | null
  name: string
  price: number
  is_featured: boolean
  is_available: boolean
}
