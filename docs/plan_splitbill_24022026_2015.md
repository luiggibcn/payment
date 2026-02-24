# PLAN.md — WebApp Comensales (PWA)
> **Stack:** Vue 3 · TypeScript · Vite · Tailwind 4 · Supabase  
> **Objetivo:** Flujo completo de división y pago de cuenta en restaurante, listo para beta privada en 8 semanas.  
> _Última actualización: 24 Feb 2026 · Schema: drawSQL-pgsql-export-2026-02-17.sql_

---

## Índice

1. [Análisis del monorepo actual](#1-análisis-del-monorepo-actual)
2. [Estructura propuesta tras el refactor](#2-estructura-propuesta-tras-el-refactor)
3. [¿Realtime o polling? Decisión razonada](#3-realtime-o-polling-decisión-razonada)
4. [Stack tecnológico](#4-stack-tecnológico)
5. [Schema real (Supabase)](#5-schema-real-supabase)
6. [Arquitectura de la WebApp](#6-arquitectura-de-la-webapp)
7. [Flujo completo del comensal](#7-flujo-completo-del-comensal)
8. [Funcionalidades core del MVP](#8-funcionalidades-core-del-mvp)
9. [Integración Bizum (Fase 1)](#9-integración-bizum-fase-1)
10. [Casos edge y gestión de errores](#10-casos-edge-y-gestión-de-errores)
11. [Roadmap de desarrollo (4 sprints)](#11-roadmap-de-desarrollo-4-sprints)
12. [Criterios de éxito](#12-criterios-de-éxito)
13. [Próximos pasos y decisiones pendientes](#13-próximos-pasos-y-decisiones-pendientes)

---

## 1. Análisis del monorepo actual

### Lo que hay ahora

```
apps/
├── api/     → Nuxt 3 como API pura (solo sign-in, sign-up, health)
└── web/     → Vue 3 + Vite  (panel + PWA mezclados)
packages/
├── config/
├── types/   → namespace @billsplit ✅ mantener
└── utils/   → namespace @billsplit ✅ mantener
```

### Problemas detectados

**`apps/api` (Nuxt) — eliminar**

Nuxt está siendo usado únicamente como servidor de 3 endpoints de autenticación (`sign-in`, `sign-up`, `health`). Supabase Auth hace exactamente esto de forma nativa y gratuita. Mantener Nuxt solo para esto añade un deploy adicional en Vercel, una dependencia pesada sin valor real, y latencia extra (cliente → Nuxt → Supabase en lugar de cliente → Supabase directamente).

**`apps/web` — demasiado scope mezclado**

Hay código de cosas que no forman parte del MVP mezclado con lo que sí importa:
- `cart.store`, `cart.service.*` → modelo de datos incorrecto para este proyecto
- `tpv.layout.vue` → fuera del scope MVP
- `scss/` → con Tailwind 4 no hace falta, añade fricción
- `axios.ts` → innecesario, el cliente de Supabase ya gestiona las peticiones
- `mocks/` con MSW → infraestructura válida pero costosa de mantener en MVP

**Lo que sí vale y hay que conservar**
- `useAuth.ts`, `useRole.ts` → lógica de autenticación del staff del restaurante
- `locales/` (i18n) → bien tenerlo desde el principio
- `middlewares/auth.middleware.ts` → guards de rutas del panel
- `packages/types` y `packages/utils` → base compartida entre apps

---

## 2. Estructura propuesta tras el refactor

El monorepo sigue siendo el enfoque correcto. Vercel + GitHub es suficiente para el MVP. Solo hay que **reorganizar `apps/web` en dos apps** con responsabilidades claras, y **eliminar `apps/api`**.

```
.
├── apps/
│   ├── web/          → PWA para comensales (público, sin auth)
│   └── dashboard/    → Panel para restaurantes (auth requerida, staff only)
├── packages/
│   ├── config/       → configuración compartida (eslint, tsconfig base...)
│   ├── types/        → interfaces y tipos DB generados desde Supabase
│   └── utils/        → helpers compartidos (formatCurrency, splitAmount, etc.)
├── pnpm-workspace.yaml
└── package.json
```

### Por qué dos apps separadas y no una sola

| | Una sola app | Dos apps separadas ✅ |
|---|---|---|
| Bundle size de la PWA | Carga código del panel que el comensal no necesita | La PWA es mínima, carga en < 2s en 4G |
| Seguridad | El código del panel (RLS admin) está en el mismo bundle | Separación física de responsabilidades |
| Deploy independiente | Un cambio en el panel redeploya la PWA | Se despliegan de forma independiente en Vercel |
| Mantenimiento | Rutas, guards y layouts mezclados | Cada app tiene su propio router y estructura |

### `apps/web` — PWA Comensales

```
apps/web/
├── public/
│   └── manifest.json         # PWA manifest
├── src/
│   ├── components/
│   │   ├── order/
│   │   │   ├── OrderItemCard.vue
│   │   │   ├── GuestAvatar.vue
│   │   │   ├── SplitModal.vue
│   │   │   ├── TipSelector.vue
│   │   │   └── OrderProgress.vue
│   │   └── ui/               # Button, Modal, Toast, Badge (primitivos)
│   ├── composables/
│   │   ├── useQRSession.ts   # Validar QR → crear order_guest → session_token
│   │   ├── useOrder.ts       # Cargar order + items + guests
│   │   ├── useItemAssignment.ts  # Asignar, split, desasignar
│   │   ├── usePayment.ts     # Calcular total, deep link Bizum, confirmar
│   │   └── useSync.ts        # Polling (Sprint 1–2) → Realtime (Sprint 3)
│   ├── stores/
│   │   ├── order.ts          # Pinia: order activa + items + guests
│   │   └── guest.ts          # Pinia: guest actual (alias, session_token, color)
│   ├── views/
│   │   ├── ScanView.vue      # /scan?token=xxx
│   │   ├── WaitingRoomView.vue  # /order/:id/waiting
│   │   ├── OrderView.vue     # /order/:id  (vista principal)
│   │   ├── PaymentView.vue   # /order/:id/pay
│   │   └── ConfirmView.vue   # /order/:id/confirm
│   ├── lib/
│   │   ├── supabase.ts       # createGuestClient(sessionToken)
│   │   └── bizum.ts          # generateBizumLink()
│   └── router/index.ts
├── vite.config.ts
└── package.json
```

### `apps/dashboard` — Panel restaurantes

```
apps/dashboard/
├── src/
│   ├── components/
│   │   ├── tables/           # Vista de mesas con estado
│   │   └── orders/           # Vista de orden activa por mesa
│   ├── composables/
│   │   ├── useAuth.ts        # (migrado desde apps/web)
│   │   └── useRole.ts        # (migrado desde apps/web)
│   ├── views/
│   │   ├── LoginView.vue
│   │   ├── TablesView.vue    # Lista de mesas + estado
│   │   └── OrderDetailView.vue  # Ver items de una order
│   ├── middleware/
│   │   └── auth.ts           # Guard: redirigir si no hay sesión activa
│   └── router/index.ts
├── vite.config.ts
└── package.json
```

### Qué eliminar del árbol actual

| Archivo / carpeta | Motivo |
|---|---|
| `apps/api/` completo | Nuxt como proxy de Supabase Auth no aporta valor |
| `apps/web/src/clients/axios.ts` | Reemplazado por el cliente de Supabase |
| `apps/web/src/services/cart.*` | Modelo de datos incorrecto para este proyecto |
| `apps/web/src/stores/cart.*` | Ídem |
| `apps/web/src/views/tpv.layout.vue` | Fuera del scope MVP |
| `apps/web/src/scss/` | Tailwind 4 lo reemplaza completamente |
| `apps/web/public/products/*.png` | Imágenes de demo, no son assets del producto |
| `apps/web/public/videos/` | Ídem |
| `apps/web/src/mocks/` | Simplificar: en MVP es suficiente con datos reales de Supabase |

---

## 3. ¿Realtime o polling? Decisión razonada

Esta es la decisión de infraestructura más importante del MVP. La respuesta corta: **empieza con polling, activa Realtime en Sprint 3 cuando el flujo base esté estable**.

### Coste de Supabase Realtime

En el plan **gratuito** de Supabase, Realtime incluye 500 conexiones concurrentes y 2 millones de mensajes/mes. Para el MVP con 50–100 restaurantes esto no supone ningún problema económico. El coste real no es monetario, sino de **complejidad de implementación y depuración**.

### Comparativa para el MVP

| Criterio | Polling cada 3s | Supabase Realtime |
|---|---|---|
| Latencia de actualización | ~1.5s de media | < 300ms |
| Complejidad de implementación | Baja — un `setInterval` + fetch | Media — canales, suscripciones, reconexión |
| Comportamiento offline | Fácil: el poll falla silenciosamente | Hay que manejar reconexión del canal |
| Depuración | Muy fácil de trazar | Más complejo |
| Experiencia de usuario | Aceptable con 3s | Fluida e instantánea |

### Recomendación: polling en Sprint 1–2, Realtime en Sprint 3

**La experiencia en la división de items** (ver en tiempo real que alguien acaba de coger la pizza) es el core del producto. Con polling de 3 segundos la experiencia es aceptable para un piloto con restaurantes reales, donde los comensales están en la misma mesa y pueden coordinarse verbalmente.

La clave es **diseñar `useSync.ts` con la interfaz correcta desde el principio**. El interior puede ser polling hoy y Realtime mañana sin tocar ningún componente ni store.

**Implementación con polling (Sprint 1–2):**

```typescript
// composables/useSync.ts
export function useSync(orderId: string) {
  const orderStore = useOrderStore()
  let interval: ReturnType<typeof setInterval>

  async function fetchOrderState() {
    const { data } = await supabase
      .from('order_items')
      .select('*, order_guests(id, guest_name)')
      .eq('order_id', orderId)
    if (data) orderStore.syncItems(data)
  }

  function startPolling() {
    fetchOrderState()
    interval = setInterval(fetchOrderState, 3000)
  }

  function stopPolling() {
    clearInterval(interval)
  }

  onMounted(startPolling)
  onUnmounted(stopPolling)
  // Parar cuando la pestaña no está visible (ahorra requests innecesarios)
  useVisibilityChange((visible) => visible ? startPolling() : stopPolling())
}
```

**Migración a Realtime (Sprint 3) — solo cambia `useSync.ts`:**

```typescript
// composables/useSync.ts (versión Realtime)
export function useSync(orderId: string) {
  const orderStore = useOrderStore()

  const channel = supabase
    .channel(`order:${orderId}`)
    .on('postgres_changes', {
      event: '*', schema: 'orders', table: 'order_items',
      filter: `order_id=eq.${orderId}`
    }, (payload) => orderStore.syncItem(payload))
    .on('postgres_changes', {
      event: '*', schema: 'orders', table: 'order_guests',
      filter: `order_id=eq.${orderId}`
    }, (payload) => orderStore.syncGuest(payload))
    .subscribe()

  onUnmounted(() => supabase.removeChannel(channel))
}
```

Stores, composables y componentes no se tocan. La migración es quirúrgica.

---

## 4. Stack tecnológico

### `apps/web` — PWA Comensales

| Tecnología | Versión | Rol |
|---|---|---|
| Vue 3 | Composition API + `<script setup>` | Framework UI principal |
| TypeScript | strict mode | Tipado completo, generado desde schema Supabase |
| Vite | última | Dev server, HMR, build optimizado |
| Tailwind CSS | v4 (sin config file) | Estilos utilitarios, diseño responsive mobile-first |
| Pinia | v2 | Estado global: order, guest, items |
| Vue Router | v4 | Navegación entre vistas |
| VueUse | última | `useOnline`, `useVisibilityChange`, `useStorage` |
| `vite-plugin-pwa` | última | Service Worker, offline cache, manifest |
| `@supabase/supabase-js` | v2 | Cliente DB + Auth anónima |
| `@billsplit/types` | workspace | Tipos compartidos del schema |
| `@billsplit/utils` | workspace | `splitAmount()`, `formatCurrency()`, etc. |

### `apps/dashboard` — Panel restaurantes

| Tecnología | Versión | Rol |
|---|---|---|
| Vue 3 + TypeScript + Vite | misma base | Consistencia con `apps/web` |
| Tailwind CSS v4 | misma base | Consistencia visual |
| Pinia + Vue Router | misma base | Estado + navegación |
| `@supabase/supabase-js` | v2 | Auth staff (email/password), DB queries |
| `@billsplit/types` | workspace | Tipos compartidos |

### Infraestructura

| Servicio | Uso | Coste MVP |
|---|---|---|
| Vercel | Deploy de `apps/web` y `apps/dashboard` como dos proyectos independientes | Gratis (Hobby) |
| Supabase | DB + Auth + Storage. Sin Realtime en Sprint 1–2 | Gratis (Free tier) |
| GitHub | Control de versiones + CI via integración Vercel–GitHub | Gratis |

---

## 5. Schema real (Supabase)

> ⚠️ No se crea ninguna tabla nueva en el MVP. El schema ya está completo y no debe modificarse salvo lo indicado en las decisiones pendientes.

### Tablas relevantes para la WebApp de comensales

```
public
├── tenants                 → name, slug, phone, plan, timezone, organization_id
├── tenant_settings         → logo_url, primary_color, welcome_message, tax_rate
├── restaurant_tables       → number, zone, status, active_order_id
│                             status: available | occupied | bill | paid
├── qr_codes                → token (UNIQUE), expires_at (+3h por defecto)
│                             is_active, 1 activo por mesa (índice único parcial)
│                             Trigger: deactivate_previous_qr al insertar nuevo
├── dishes                  → name, price, img_small, is_available, category_id
├── categories              → name, parent_id (jerarquía), sort_order
├── allergens               → 14 alérgenos EU pre-cargados (tabla global)
├── dish_allergens          → pivote dishes ↔ allergens
└── ingredients             → ingredientes modificables por comensal

orders (schema separado)
├── orders                  → status: open | partial | closed | cancelled
│                             subtotal, discount_amount, tax_amount, total
│                             amount_paid, amount_remaining (columna GENERATED)
├── order_guests            → guest_name, session_token (UNIQUE), user_id (nullable)
├── order_items             → dish_name (snapshot), dish_price
│                             quantity NUMERIC(6,3)  ← clave para el split
│                             guest_id (FK → order_guests)
│                             payment_status: unassigned | assigned | paid
│                             kitchen_status: pending | cooking | ready | delivered
├── order_item_ingredients  → acción: added | removed sobre un order_item
└── payments                → amount, tip_amount
                              total_charged (columna GENERATED = amount + tip_amount)
                              payment_method: bizum | cash | card
                              status: pending | confirmed | failed
                              bizum_reference (código manual Fase 1)
                              Trigger: handle_payment_confirmed → recalcula order
```

### Claves de diseño que impactan la implementación

**Split con `quantity NUMERIC(6,3)`**

Cada `order_item` tiene un único `guest_id`. Para dividir entre N personas se crean N filas. El ajuste de céntimos va siempre en la primera fila.

```
Pizza Margherita (dish_price: 12.00) dividida entre 3:
├── quantity: 0.334  subtotal: 4.01  guest_id: G1  ← absorbe el céntimo extra
├── quantity: 0.333  subtotal: 4.00  guest_id: G2
└── quantity: 0.333  subtotal: 3.99  guest_id: G3
```

**`amount_remaining` es una columna GENERATED:**
```sql
amount_remaining NUMERIC(10,2) GENERATED ALWAYS AS (total - amount_paid) STORED
```
Solo se lee, nunca se escribe. Usar directamente para la barra de progreso.

**Trigger `handle_payment_confirmed`:**
Al confirmar un pago, el trigger recalcula `amount_paid` y cierra la order automáticamente si `amount_paid >= total`. La app no calcula ni escribe esto, solo escucha el cambio.

**Trigger `deactivate_previous_qr`:**
Al insertar un nuevo QR para una mesa, el anterior se desactiva automáticamente. No hace falta lógica en el cliente.

---

## 6. Arquitectura de la WebApp

### Flujo de datos

```
Supabase DB
    │
    ▼
useSync.ts  ← polling 3s (Sprint 1–2) / Realtime (Sprint 3)
    │
    ▼
orderStore (Pinia)  ← syncItems() / syncGuests() / syncOrder()
    │
    ▼
Computed en componentes  →  UI reactiva
```

Los componentes nunca hacen fetch directamente. Solo leen del store y llaman a composables para las acciones de escritura.

### Router y guards

```typescript
// router/index.ts
const routes = [
  { path: '/scan',                component: ScanView },
  { path: '/order/:id/waiting',   component: WaitingRoomView, meta: { requiresSession: true } },
  { path: '/order/:id',           component: OrderView,       meta: { requiresSession: true } },
  { path: '/order/:id/pay',       component: PaymentView,     meta: { requiresSession: true } },
  { path: '/order/:id/confirm',   component: ConfirmView,     meta: { requiresSession: true } },
]

router.beforeEach((to) => {
  if (to.meta.requiresSession && !guestStore.sessionToken) {
    return '/scan'
  }
})
```

---

## 7. Flujo completo del comensal

```
1. Camarero abre mesa en el dashboard
   → INSERT qr_codes (token único, expires_at = now() + 3h)
   → Trigger deactivate_previous_qr desactiva el QR anterior si existe
   → INSERT orders.orders (status = 'open', table_id, tenant_id)
   → INSERT order_items con los platos de la comanda

2. Comensal escanea QR con el móvil
   → URL: https://web.splitpay.es/scan?token=<qr_token>
   → ScanView llama Edge Function POST /join-session con el token
   → Edge Function valida qr_codes.is_active = true AND expires_at > now()
   → Si válido: INSERT order_guests (guest_name, session_token = crypto.randomUUID())
   → Devuelve { orderId, sessionToken, guestId }
   → Guarda sessionToken en localStorage
   → Redirige a /order/:id/waiting

3. WaitingRoomView
   → Carga order_guests (polling)
   → Muestra avatares con colores únicos por guest
   → Botón "Empezar" cuando hay ≥ 1 guest (o el comensal decide solo)
   → Redirige a /order/:id

4. OrderView — vista principal
   → Carga order_items + order_guests
   → useSync activo: polling cada 3s
   → Tap en item unassigned → assignItem()
     · Optimistic UI: actualiza el store localmente
     · UPDATE order_items SET guest_id, payment_status = 'assigned'
       WHERE id = $itemId AND payment_status = 'unassigned'
     · Si rows_affected = 0: revert + toast "Alguien se adelantó 😅"
   → Long press / botón ÷ → SplitModal → splitItem()
     · DELETE fila original
     · INSERT N filas con quantity = 1/N y guest_id de cada uno
   → Botón "Dividir todo entre todos" → splitRemaining()
   → Barra de progreso: importe asignado / total (usa amount_remaining)
   → Botón "Ver mi cuenta" visible cuando tengo items asignados

5. PaymentView
   → Lista mis order_items (guest_id = myGuestId) con subtotales
   → TipSelector: 0% / 5% / 10% / 15% / personalizado
   → Total: sum(subtotales) + propina
   → Botón "Pagar con Bizum"
     · INSERT orders.payments (status = 'pending', amount, tip_amount)
     · Genera deep link Bizum y redirige a la app de Bizum

6. ConfirmView — al volver de Bizum
   → Input: código de referencia Bizum
   → Edge Function POST /confirm-payment
     · UPDATE payments SET status = 'confirmed', bizum_reference = $ref
     · Trigger handle_payment_confirmed recalcula amount_paid y orders.status
   → El siguiente ciclo de polling detecta el cambio y actualiza la UI
   → Si order.status = 'closed': pantalla de celebración ✓

7. Casos especiales
   → order.status = 'closed' al entrar → "Cuenta cerrada ✓"
   → qr_codes.expires_at < now() → "QR caducado, pide uno nuevo al camarero"
   → session_token en localStorage → recuperar sesión sin pedir alias
```

---

## 8. Funcionalidades core del MVP

### División de items — orden de implementación

**1. Asignación individual** (Sprint 2, día 1–2)

```typescript
// composables/useItemAssignment.ts
async function assignItem(itemId: string) {
  orderStore.setItemGuest(itemId, guestStore.guestId) // optimistic

  const { count } = await supabase
    .from('order_items')
    .update({ guest_id: guestStore.guestId, payment_status: 'assigned' })
    .eq('id', itemId)
    .eq('payment_status', 'unassigned') // bloqueo optimista
    .select()

  if (!count) {
    orderStore.revertItem(itemId) // revert
    toast.show('Alguien se adelantó 😅')
  }
}
```

**2. División proporcional** (Sprint 2, día 3–4)

```typescript
async function splitItem(itemId: string, guestIds: string[]) {
  const item = orderStore.getItem(itemId)
  const n = guestIds.length
  const baseQty = Math.floor((1 / n) * 1000) / 1000       // 0.333
  const firstQty = 1 - baseQty * (n - 1)                  // 0.334
  const baseSubtotal = Math.floor(item.dish_price * baseQty * 100) / 100
  const firstSubtotal = item.dish_price - baseSubtotal * (n - 1)

  await supabase.from('order_items').delete().eq('id', itemId)
  await supabase.from('order_items').insert(
    guestIds.map((guestId, i) => ({
      order_id: item.order_id,
      dish_id: item.dish_id,
      dish_name: item.dish_name,
      dish_price: item.dish_price,
      quantity: i === 0 ? firstQty : baseQty,
      subtotal: i === 0 ? firstSubtotal : baseSubtotal,
      guest_id: guestId,
      payment_status: 'assigned',
      kitchen_status: item.kitchen_status,
    }))
  )
}
```

**3. División equitativa del total** (Sprint 3)
- Aplica `splitItem` a todos los `order_items` con `payment_status = 'unassigned'`
- Reparte entre todos los `order_guests` activos en la sesión

### Estados visuales de `OrderItemCard`

| Estado | Clases Tailwind | Interacción |
|---|---|---|
| `unassigned` | `border-gray-200 bg-white` | Tap para asignar, long press para split |
| `assigned` (mío) | `border-blue-500 bg-blue-50 ring-2 ring-blue-200` | Tap para desasignar |
| `assigned` (otro) | `border-gray-300 bg-gray-50 opacity-60` | Solo lectura + avatar del owner |
| Split | `border-purple-400 bg-purple-50` | Avatares de todos los owners |
| `paid` | `border-green-400 bg-green-50 line-through text-gray-400` | Solo lectura |

### TipSelector

- Opciones: **0%**, **5%**, **10%**, **15%**, **personalizado** (input numérico)
- Calculado sobre el subtotal del guest, no el total de la mesa
- Guardado en `orders.payments.tip_amount`
- Default: 0%, no obligatorio

---

## 9. Integración Bizum (Fase 1)

No existe API oficial de Bizum para comercios en el MVP. El flujo es completamente manual.

```typescript
// lib/bizum.ts
export function generateBizumLink(params: {
  phone: string   // tenants.phone — suficiente para MVP
  amount: number
  concept: string // "SplitPay · Mesa 4"
}): string {
  return `bizum://pay?amount=${params.amount.toFixed(2)}&concept=${encodeURIComponent(params.concept)}&phone=${params.phone}`
}
```

**Flujo completo:**
1. Se crea `payment` con `status = 'pending'` en la DB
2. Se genera el deep link y se redirige a la app de Bizum
3. El usuario paga en Bizum y vuelve manualmente a la PWA
4. Introduce el código de referencia en `ConfirmView`
5. Edge Function `POST /confirm-payment` actualiza `payment.status = 'confirmed'`
6. Trigger de DB cierra la order automáticamente si `amount_paid >= total`

> La fricción del paso 4 es aceptable para el MVP. Se elimina en Fase 2 con la API oficial de Bizum para comercios.

---

## 10. Casos edge y gestión de errores

**Conflicto de asignación simultánea**
El UPDATE incluye `WHERE payment_status = 'unassigned'`. Si `rows_affected = 0`, el item ya fue cogido por otro. Revert del optimistic update + toast. Sin deadlocks, el segundo guest simplemente no obtiene el item.

**Guest que se va sin pagar**
Tras 10 min de inactividad: marcar como inactivo en `order_guests` y devolver sus items a `unassigned`. Alerta visual al grupo. Notificación al restaurante si `amount_remaining > 0` pasados 30 min del primer pago.

**Total no cuadra**
Si hay `order_items` con `payment_status = 'unassigned'` cuando el guest pulsa "Ver mi cuenta": banner de aviso con el importe no cubierto + botón "Dividir el resto entre todos".

**QR expirado**
`qr_codes.expires_at < now()` o `is_active = false` → pantalla de error clara: _"Este QR ha caducado. Pide un QR nuevo al camarero."_

**Sin conexión**
`useOnline` de VueUse detecta la red. Se muestra `OfflineBanner` y se bloquean las acciones de escritura. El Service Worker cachea los assets. Al reconectar: fetch inmediato del estado actual.

**Order cerrada al entrar**
`order.status = 'closed'` → pantalla de celebración. `order.status = 'cancelled'` → pantalla de error con el motivo de `cancel_reasons`.

---

## 11. Roadmap de desarrollo (4 sprints)

### Sprint 1 — Semanas 1–2: Refactor + QR session
**Objetivo:** Estructura limpia y flujo de entrada funcional.

- [ ] Eliminar `apps/api` (Nuxt) del monorepo
- [ ] Crear `apps/dashboard` con estructura base (Vue 3 + Vite + TS + Tailwind 4)
- [ ] Migrar `useAuth.ts`, `useRole.ts`, `auth.middleware.ts` a `apps/dashboard`
- [ ] Limpiar `apps/web`: eliminar cart, TPV, SCSS, axios, mocks innecesarios
- [ ] Añadir `vite-plugin-pwa` a `apps/web`
- [ ] Generar tipos: `supabase gen types typescript > packages/types/database.ts`
- [ ] `lib/supabase.ts`: `createGuestClient(sessionToken)` en `apps/web`
- [ ] Edge Function `POST /join-session`: validar QR → crear `order_guest` → devolver `sessionToken`
- [ ] `useQRSession.ts`: guardar/recuperar `sessionToken` desde localStorage
- [ ] `ScanView` + `WaitingRoomView` funcionales con polling básico

**Entregable:** Escanear QR, introducir alias, ver sala de espera con otros comensales.

---

### Sprint 2 — Semanas 3–4: División de items
**Objetivo:** Vista principal con asignación y split en tiempo real (polling).

- [ ] `OrderView`: cargar `order_items` + `order_guests`
- [ ] `useSync.ts`: polling cada 3s con pausa cuando la pestaña no está visible
- [ ] `OrderItemCard`: todos los estados visuales
- [ ] `useItemAssignment.ts`: `assignItem()` con optimistic UI + gestión de conflicto
- [ ] `SplitModal`: checkboxes de guests + cálculo de fracciones y ajuste de céntimos
- [ ] `GuestAvatar`: colores únicos por guest (hash del guestId → color HSL)
- [ ] `OrderProgress`: barra importe asignado / total (usando `amount_remaining`)
- [ ] Dashboard (paralelo): login + lista de mesas + botón generar QR

**Entregable:** Varios comensales dividen la cuenta en tiempo real desde sus móviles.

---

### Sprint 3 — Semanas 5–6: Pago + Realtime
**Objetivo:** Flujo de pago completo y migración a Realtime.

- [ ] `PaymentView`: mis items + `TipSelector` + total final
- [ ] `usePayment.ts`: `createPayment()`, `generateBizumLink()`
- [ ] `ConfirmView`: input código Bizum + Edge Function `POST /confirm-payment`
- [ ] Pantalla de éxito cuando `order.status = 'closed'`
- [ ] División equitativa del total (botón global en `OrderView`)
- [ ] **Migrar `useSync.ts` de polling a Supabase Realtime** — único archivo que cambia
- [ ] Toast notifications cuando otros guests asignan items o pagan

**Entregable:** Flujo completo QR → división → pago Bizum → cuenta cerrada, con UX en tiempo real.

---

### Sprint 4 — Semanas 7–8: Calidad y beta
**Objetivo:** Beta privada lista para restaurantes piloto en Barcelona.

- [ ] Todos los casos edge de la sección 10
- [ ] PWA completa: `manifest.json`, offline cache, Add to Home Screen prompt
- [ ] Skeleton screens y loading states en todas las vistas
- [ ] Tests E2E con Playwright: flujo feliz + conflicto de asignación + QR expirado
- [ ] Dashboard: ver estado de order activa por mesa + items en tiempo real
- [ ] Configurar dos proyectos en Vercel (`apps/web` + `apps/dashboard`)
- [ ] Variables de entorno configuradas por entorno (staging + production)
- [ ] Prueba con 3–5 restaurantes piloto

**Entregable:** Beta privada funcional, deployada, con restaurantes piloto usando la app.

---

## 12. Criterios de éxito

| Métrica | Objetivo | Cómo medirlo |
|---|---|---|
| Tiempo total de pago grupal | < 3 min | `qr_codes.created_at` → `orders.status = 'closed'` |
| Tasa de completado del flujo | > 80% | Orders `closed` / orders `open` con ≥ 1 guest |
| Latencia de actualización | < 3s (polling) → < 500ms (Realtime) | Tiempo entre UPDATE en DB y render en cliente |
| Cuadre de cuentas | > 95% | `amount_paid >= total` en orders cerradas |
| Tiempo de carga inicial (PWA) | < 2s | Lighthouse Performance Score en móvil 4G |
| Errores de pago | < 2% | `payments.status = 'failed'` / total payments |

---

## 13. Próximos pasos y decisiones pendientes

### Decisiones que bloquean el Sprint 1

**1. Autenticación anónima de comensales**

La RLS de `orders.*` usa `current_setting('app.session_token', true)`. Hay tres formas de enviar ese valor desde el cliente:

- **Opción A — Header custom + middleware:** el cliente envía `x-session-token`, la Edge Function hace `SET LOCAL app.session_token = $token` antes de cualquier query. Requiere que todas las queries pasen por Edge Functions (no acceso directo al DB desde el cliente).
- **Opción B — Supabase `signInAnonymously` + JWT claim:** la Edge Function `join-session` crea una sesión anónima, guarda `session_token` en `user_metadata`, y las RLS policies leen `auth.jwt() ->> 'session_token'`. Requiere ajustar las políticas RLS existentes.
- **Opción C — service_role solo en Edge Functions:** los comensales no hacen queries directas; todo pasa por Edge Functions con `service_role`. Más seguro, más código en Edge Functions.

> **Recomendación MVP:** Opción B. `signInAnonymously` es exactamente la feature diseñada para este caso. Solo hay que ajustar las RLS policies para leer `auth.uid()` desde la sesión anónima en lugar de `current_setting`.

**2. ¿Quién y cómo crea los `order_items`?**

- **Opción manual:** el camarero introduce los items desde el dashboard al generar el QR. El panel MVP necesita un formulario "añadir plato a la cuenta". Impacta el Sprint 2 del dashboard.
- **Opción automática:** los items vienen del flujo de comanda ya existente. No hay que crear nada en el cliente.

Decidir antes de empezar el Sprint 2.

**3. Número de Bizum del restaurante**

`tenants.phone` existe pero es el teléfono general. Para MVP es suficiente usarlo directamente. En Fase 2 se puede añadir `bizum_phone TEXT` a `tenant_settings` sin romper nada.

**4. Alias del comensal entre sesiones**

Guardar `{ alias, color }` en localStorage indexado por `order_id`. Si el comensal recarga o vuelve a la misma mesa, se recupera el alias sin volver a pedirlo. Mejora la UX sin coste técnico.

### Semana 1 — Acciones concretas

- [ ] Resolver las 4 decisiones anteriores (30 min de conversación de equipo)
- [ ] Crear rama `refactor/clean-monorepo` y hacer el PR de limpieza antes de añadir código nuevo
- [ ] Eliminar `apps/api` del monorepo
- [ ] Crear `apps/dashboard` con estructura base
- [ ] Limpiar `apps/web` (eliminar lo listado en sección 2)
- [ ] Ejecutar `supabase gen types typescript --project-id $PROJECT_ID > packages/types/database.ts`
- [ ] Primera historia de usuario completa: `ScanView` + Edge Function `join-session`
