import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore, type CartProduct } from './cart.store'

describe('cart.store', () => {
  let store: ReturnType<typeof useCartStore>

  // Mock products
  const mockProduct1: CartProduct = {
    id: 1,
    name: 'Beef Wellington',
    category: 'Main Course',
    price: 22.50,
    image: 'https://via.placeholder.com/300x200',
    badge: 'Best seller',
  }

  const mockProduct2: CartProduct = {
    id: 2,
    name: 'Quinoa Salad',
    category: 'Salads',
    price: 4.90,
    image: 'https://via.placeholder.com/300x200',
    badge: null,
  }

  const mockProduct3: CartProduct = {
    id: 3,
    name: 'Chicken Tofu Soup',
    category: 'Soup',
    price: 12.90,
    image: 'https://via.placeholder.com/300x200',
    badge: 'Best seller',
  }

  beforeEach(() => {
    // Crear Pinia nueva para cada test
    setActivePinia(createPinia())
    store = useCartStore()
  })

  describe('Initial State', () => {
    it('should have empty cart initially', () => {
      expect(store.items).toEqual([])
      expect(store.itemCount).toBe(0)
    })

    it('should have default tax rate of 5%', () => {
      expect(store.taxRate).toBe(5)
    })

    it('should have zero subtotal initially', () => {
      expect(store.subtotal).toBe(0)
    })

    it('should have zero total initially', () => {
      expect(store.total).toBe(0)
    })

    it('should have zero tax initially', () => {
      expect(store.totalTax).toBe(0)
    })
  })

  describe('addProduct', () => {
    it('should add a new product to cart', () => {
      store.addProduct(mockProduct1, 2)

      expect(store.items).toHaveLength(1)
      expect(store.items[0]).toMatchObject({
        ...mockProduct1,
        quantity: 2,
      })
    })

    it('should add product with default quantity of 1', () => {
      store.addProduct(mockProduct1)

      expect(store.items[0].quantity).toBe(1)
    })

    it('should increment quantity if product already exists', () => {
      store.addProduct(mockProduct1, 2)
      store.addProduct(mockProduct1, 3)

      expect(store.items).toHaveLength(1)
      expect(store.items[0].quantity).toBe(5)
    })

    it('should not add product with zero or negative quantity', () => {
      store.addProduct(mockProduct1, 0)
      expect(store.items).toHaveLength(0)

      store.addProduct(mockProduct1, -5)
      expect(store.items).toHaveLength(0)
    })

    it('should add multiple different products', () => {
      store.addProduct(mockProduct1, 2)
      store.addProduct(mockProduct2, 1)
      store.addProduct(mockProduct3, 3)

      expect(store.items).toHaveLength(3)
    })

    it('should add new products to the beginning (unshift)', () => {
      store.addProduct(mockProduct1)
      store.addProduct(mockProduct2)

      expect(store.items[0].id).toBe(mockProduct2.id)
      expect(store.items[1].id).toBe(mockProduct1.id)
    })
  })

  describe('increment', () => {
    it('should add product with quantity 1 if not in cart', () => {
      store.increment(mockProduct1)

      expect(store.items).toHaveLength(1)
      expect(store.items[0].quantity).toBe(1)
    })

    it('should increment quantity by 1 if product exists', () => {
      store.addProduct(mockProduct1, 3)
      store.increment(mockProduct1)

      expect(store.items[0].quantity).toBe(4)
    })

    it('should increment correctly for multiple products', () => {
      store.addProduct(mockProduct1, 2)
      store.addProduct(mockProduct2, 1)
      
      store.increment(mockProduct1)
      store.increment(mockProduct2)

      expect(store.items.find(i => i.id === 1)?.quantity).toBe(3)
      expect(store.items.find(i => i.id === 2)?.quantity).toBe(2)
    })
  })

  describe('decrement', () => {
    it('should decrease quantity by 1', () => {
      store.addProduct(mockProduct1, 3)
      store.decrement(mockProduct1.id)

      expect(store.items[0].quantity).toBe(2)
    })

    it('should remove product if quantity becomes 1 and decrement is called', () => {
      store.addProduct(mockProduct1, 1)
      store.decrement(mockProduct1.id)

      expect(store.items).toHaveLength(0)
    })

    it('should do nothing if product does not exist', () => {
      store.addProduct(mockProduct1, 2)
      store.decrement(999) // non-existent id

      expect(store.items).toHaveLength(1)
      expect(store.items[0].quantity).toBe(2)
    })

    it('should handle multiple decrements', () => {
      store.addProduct(mockProduct1, 5)
      store.decrement(mockProduct1.id)
      store.decrement(mockProduct1.id)
      store.decrement(mockProduct1.id)

      expect(store.items[0].quantity).toBe(2)
    })
  })

  describe('setQuantity', () => {
    it('should set product quantity to specific value', () => {
      store.addProduct(mockProduct1, 2)
      store.setQuantity(mockProduct1.id, 10)

      expect(store.items[0].quantity).toBe(10)
    })

    it('should remove product if quantity is set to 0', () => {
      store.addProduct(mockProduct1, 5)
      store.setQuantity(mockProduct1.id, 0)

      expect(store.items).toHaveLength(0)
    })

    it('should remove product if quantity is negative', () => {
      store.addProduct(mockProduct1, 5)
      store.setQuantity(mockProduct1.id, -3)

      expect(store.items).toHaveLength(0)
    })

    it('should do nothing if product does not exist', () => {
      store.addProduct(mockProduct1, 2)
      store.setQuantity(999, 5)

      expect(store.items).toHaveLength(1)
      expect(store.items[0].quantity).toBe(2)
    })
  })

  describe('removeProduct', () => {
    it('should remove product from cart', () => {
      store.addProduct(mockProduct1, 2)
      store.addProduct(mockProduct2, 1)
      
      store.removeProduct(mockProduct1.id)

      expect(store.items).toHaveLength(1)
      expect(store.items[0].id).toBe(mockProduct2.id)
    })

    it('should do nothing if product does not exist', () => {
      store.addProduct(mockProduct1, 2)
      store.removeProduct(999)

      expect(store.items).toHaveLength(1)
    })

    it('should handle removing all products', () => {
      store.addProduct(mockProduct1, 2)
      store.addProduct(mockProduct2, 1)
      
      store.removeProduct(mockProduct1.id)
      store.removeProduct(mockProduct2.id)

      expect(store.items).toHaveLength(0)
    })
  })

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      store.addProduct(mockProduct1, 2)
      store.addProduct(mockProduct2, 1)
      store.addProduct(mockProduct3, 3)

      store.clearCart()

      expect(store.items).toHaveLength(0)
      expect(store.itemCount).toBe(0)
    })

    it('should work on empty cart', () => {
      store.clearCart()
      expect(store.items).toHaveLength(0)
    })
  })

  describe('setTaxRate', () => {
    it('should set tax rate to specific value', () => {
      store.setTaxRate(10)
      expect(store.taxRate).toBe(10)
    })

    it('should set tax rate to 0 if negative value provided', () => {
      store.setTaxRate(-5)
      expect(store.taxRate).toBe(0)
    })

    it('should accept decimal tax rates', () => {
      store.setTaxRate(7.5)
      expect(store.taxRate).toBe(7.5)
    })
  })

  describe('findItem', () => {
    it('should find item by id', () => {
      store.addProduct(mockProduct1, 2)
      store.addProduct(mockProduct2, 1)

      const item = store.findItem(mockProduct1.id)

      expect(item).toBeDefined()
      expect(item?.id).toBe(mockProduct1.id)
      expect(item?.quantity).toBe(2)
    })

    it('should return undefined if item does not exist', () => {
      store.addProduct(mockProduct1, 2)
      const item = store.findItem(999)

      expect(item).toBeUndefined()
    })
  })

  describe('Computed Properties', () => {
    describe('itemCount', () => {
      it('should return total quantity of all items', () => {
        store.addProduct(mockProduct1, 4)
        store.addProduct(mockProduct2, 6)
        store.addProduct(mockProduct3, 8)

        expect(store.itemCount).toBe(18)
      })

      it('should return 0 for empty cart', () => {
        expect(store.itemCount).toBe(0)
      })

      it('should update reactively when items change', () => {
        store.addProduct(mockProduct1, 2)
        expect(store.itemCount).toBe(2)

        store.increment(mockProduct1)
        expect(store.itemCount).toBe(3)

        store.decrement(mockProduct1.id)
        expect(store.itemCount).toBe(2)
      })
    })

    describe('subtotal', () => {
      it('should calculate subtotal correctly', () => {
        store.addProduct(mockProduct1, 4) // 22.50 * 4 = 90.00
        store.addProduct(mockProduct2, 6) // 4.90 * 6 = 29.40

        expect(store.subtotal).toBe(119.40)
      })

      it('should return 0 for empty cart', () => {
        expect(store.subtotal).toBe(0)
      })

      it('should have 2 decimal places', () => {
        store.addProduct(mockProduct2, 3) // 4.90 * 3 = 14.70
        
        expect(store.subtotal).toBe(14.70)
          expect(store.subtotal * 100 % 1).toBe(0)
      })

      it('should update reactively', () => {
        store.addProduct(mockProduct1, 2)
        const initialSubtotal = store.subtotal

        store.increment(mockProduct1)
        expect(store.subtotal).toBeGreaterThan(initialSubtotal)
      })
    })

    describe('totalTax', () => {
      it('should calculate tax correctly with default 5% rate', () => {
        store.addProduct(mockProduct1, 4) // subtotal 90.00
        
        expect(store.totalTax).toBe(4.50) // 90 * 0.05 = 4.50
      })

      it('should calculate tax with custom rate', () => {
        store.setTaxRate(10)
        store.addProduct(mockProduct1, 4) // subtotal 90.00

        expect(store.totalTax).toBe(9.00) // 90 * 0.10 = 9.00
      })

      it('should return 0 for empty cart', () => {
        expect(store.totalTax).toBe(0)
      })

        it('should have 2 decimal places', () => {
        store.addProduct(mockProduct2, 3) // 14.70
        // tax = 14.70 * 0.05 = 0.735 -> 0.73 (banker's rounding)
        
        expect(store.totalTax).toBe(0.73)
        // Verificar que tiene máximo 2 decimales
        expect(store.totalTax * 100 % 1).toBe(0)
        })

    })

    describe('total', () => {
      it('should calculate total with tax', () => {
        store.addProduct(mockProduct1, 4) // 90.00
        // subtotal: 90.00
        // tax (5%): 4.50
        // total: 94.50

        expect(store.total).toBe(94.50)
      })

      it('should calculate correctly with custom tax rate', () => {
        store.setTaxRate(10)
        store.addProduct(mockProduct1, 2) // 45.00
        // subtotal: 45.00
        // tax (10%): 4.50
        // total: 49.50

        expect(store.total).toBe(49.50)
      })

      it('should return 0 for empty cart', () => {
        expect(store.total).toBe(0)
      })

      it('should have 2 decimal places', () => {
        store.addProduct(mockProduct2, 7)
          expect(store.total).toBe(36.01)
          expect(store.total * 100 % 1).toBe(0)
      })

      it('should update reactively', () => {
        store.addProduct(mockProduct1, 1)
        const initialTotal = store.total

        store.increment(mockProduct1)
        expect(store.total).toBeGreaterThan(initialTotal)
      })
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle full cart workflow', () => {
      // Add products
      store.addProduct(mockProduct1, 4)
      store.addProduct(mockProduct2, 6)
      
      expect(store.itemCount).toBe(10)

      // Increment
      store.increment(mockProduct1)
      expect(store.items.find(i => i.id === 1)?.quantity).toBe(5)

      // Decrement
      store.decrement(mockProduct2.id)
      expect(store.items.find(i => i.id === 2)?.quantity).toBe(5)

      // Remove
      store.removeProduct(mockProduct1.id)
      expect(store.items).toHaveLength(1)

      // Clear
      store.clearCart()
      expect(store.items).toHaveLength(0)
    })

    it('should maintain data integrity with rapid changes', () => {
      store.addProduct(mockProduct1, 1)
      
      for (let i = 0; i < 10; i++) {
        store.increment(mockProduct1)
      }
      
      expect(store.items[0].quantity).toBe(11)

      for (let i = 0; i < 5; i++) {
        store.decrement(mockProduct1.id)
      }

      expect(store.items[0].quantity).toBe(6)
    })

    it('should calculate correct totals with multiple products and custom tax', () => {
      store.setTaxRate(8)
      
      store.addProduct(mockProduct1, 2) // 45.00
      store.addProduct(mockProduct2, 3) // 14.70
      store.addProduct(mockProduct3, 1) // 12.90
      
      // Subtotal: 72.60
      expect(store.subtotal).toBe(72.60)
      
      // Tax: 72.60 * 0.08 = 5.808 -> 5.81
      expect(store.totalTax).toBe(5.81)
      
      // Total: 72.60 + 5.81 = 78.41
      expect(store.total).toBe(78.41)
    })
  })
})
