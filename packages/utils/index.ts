// packages/utils/index.ts
import type { OrderItem } from '@billsplit/types'

// Formateo de precios
export function formatPrice(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Cálculo de totales
export function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0)
}

export function calculateTax(subtotal: number, taxRate: number): number {
  return Math.round((subtotal * taxRate / 100) * 100) / 100
}

export function calculateTotal(subtotal: number, taxAmount: number): number {
  return Math.round((subtotal + taxAmount) * 100) / 100
}

// Generación de session token para guests anónimos
export function generateSessionToken(): string {
  return crypto.randomUUID()
}

// Validación de QR token
export function isQrExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}
