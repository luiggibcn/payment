// packages/config/index.ts

export const API_ROUTES = {
  health:          '/api/health',
  orders:          '/api/orders',
  orderItems:      (id: string) => `/api/orders/${id}/items`,
  initiatePayment: (id: string) => `/api/orders/${id}/pay`,
  confirmPayment:  (id: string) => `/api/payments/${id}/confirm`,
  dishes:          '/api/dishes',
  categories:      '/api/categories',
} as const

export const ORDER_STATUS = {
  OPEN:      'open',
  PARTIAL:   'partial',
  CLOSED:    'closed',
  CANCELLED: 'cancelled',
} as const

export const PAYMENT_METHOD = {
  BIZUM: 'bizum',
  CASH:  'cash',
  CARD:  'card',
} as const

export const KITCHEN_STATUS = {
  PENDING:   'pending',
  COOKING:   'cooking',
  READY:     'ready',
  DELIVERED: 'delivered',
} as const

export const TAX_RATES = {
  ES: 10,   // IVA restauración España
  DEFAULT: 21,
} as const

export const QR_EXPIRY_MINUTES = 480  // 8 horas

export const PAYMENT_PENDING_TIMEOUT_MS = 15 * 60 * 1000  // 15 min
