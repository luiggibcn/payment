# PLAN.md — WebApp Comensales (PWA)
> **Stack:** Vue 3 · TypeScript · Vite · Tailwind 4 · Supabase  
> **Objetivo:** Flujo completo de división y pago de cuenta en restaurante, listo para beta privada en 8 semanas.

---

## Índice

1. [Contexto y objetivo del refactor](#1-contexto-y-objetivo-del-refactor)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Schema real (Supabase)](#3-schema-real-supabase)
4. [Arquitectura de la WebApp](#4-arquitectura-de-la-webapp)
5. [Flujo completo del comensal](#5-flujo-completo-del-comensal)
6. [Funcionalidades core del MVP](#6-funcionalidades-core-del-mvp)
7. [Integración Bizum (Fase 1)](#7-integración-bizum-fase-1)
8. [Casos edge y gestión de errores](#8-casos-edge-y-gestión-de-errores)
9. [Roadmap de desarrollo (4 sprints)](#9-roadmap-de-desarrollo-4-sprints)
10. [Criterios de éxito](#10-criterios-de-éxito)
11. [Próximos pasos inmediatos](#11-próximos-pasos-inmediatos)

---

## 1. Contexto y objetivo del refactor

El proyecto ya tiene un schema de base de datos avanzado y funcionalidades parcialmente desarrolladas. El refactor consiste en **enfocar 100% el desarrollo en la WebApp que usan los comensales** — el núcleo de valor de la plataforma — eliminando todo scope adicional hasta que este flujo esté pulido y en manos de restaurantes piloto.

### ✅ Dentro del scope (ahora)

- PWA para comensales: flujo completo desde QR hasta pago confirmado
- División inteligente de `order_items` (individual, proporcional, equitativa)
- Tiempo real con Supabase Realtime (subscripciones a `orders.*`)
- Integración Bizum manual (deep link + confirmación por código)
- Panel mínimo de restaurantes: login, generar QR, ver estado de la order activa

### ❌ Fuera del scope (ahora)

- App móvil nativa (iOS / Android)
- Programa de fidelización
- Analíticas avanzadas
- Integración automática con TPV
- Sistema de valoraciones y reseñas
- Expansión internacional

---

## 2. Stack tecnológico

### Frontend — WebApp Comensales (PWA)

| Tecnología | Versión | Rol |
|---|---|---|
| Vue 3 | Composition API + `<script setup>` | Framework UI principal |
| TypeScript | strict mode | Tipado completo, generado desde schema Supabase |
| Vite | última | Dev server, HMR, build optimizado |
| Tailwind CSS | v4 (sin config file) | Estilos utilitarios, diseño responsive mobile-first |
| Pinia | v2 | Estado global: order, guest, items asignados |
| Vue Router | v4 | Navegación entre vistas de la PWA |
| VueUse | última | Composables: `useWebSocket`, `useStorage`, `useOnline` |
| `vite-plugin-pwa` | última | Service Worker, offline cache, Add to Home Screen |
| `@supabase/supabase-js` | v2 | Cliente DB + Realtime + Auth + Edge Functions |

### Backend — Supabase (BaaS)

No hay servidor custom en el MVP. Supabase cubre todo:

| Módulo | Uso en el proyecto |
|---|---|
| **PostgreSQL** | Schema ya existente con RLS por tenant y por `session_token` para comensales anónimos |
| **Realtime** | Subscripciones a `orders.order_items`, `orders.order_guests` y `orders.payments`. Reemplaza cualquier WebSocket custom. |
| **Auth** | Autenticación de staff del restaurante (roles: `admin`, `waiter`, `editor`). Los comensales son **anónimos** — se identifican solo por `session_token`. |
| **Edge Functions** | Validar QR, crear `order_guest`, calcular totales, generar deep link Bizum, notificar cierre de cuenta. |
| **Storage** | Logos de restaurantes, imágenes de `dishes`. |

---

## 3. Schema real (Supabase)

> ⚠️ El plan anterior proponía tablas propias (`bills`, `bill_items`, `bill_users`) que **no existen**. El schema real ya está definido y hay que adaptarse a él. No se crea ninguna tabla nueva en el MVP.

### Tablas relevantes para la WebApp de comensales

```
public
├── tenants                 → Restaurante (tenant)
├── tenant_settings         → Logo, colores, welcome_message, tax_rate
├── restaurant_tables       → Mesas (number, zone, status, active_order_id)
├── qr_codes                → token único por sesión, expires_at 3h, 1 activo por mesa
├── dishes                  → Carta del restaurante (name, price, img, is_available)
├── categories              → Categorías de platos (con jerarquía parent_id)
├── allergens               → Global, 14 alérgenos EU pre-cargados
├── dish_allergens          → Pivote dishes ↔ allergens
└── ingredients             → Ingredientes modificables por comensal

orders (schema separado)
├── orders                  → La cuenta de una mesa (status: open|partial|closed|cancelled)
├── order_guests            → Cada comensal en la sesión (alias + session_token anónimo)
├── order_items             → Líneas de la cuenta (con dish_name snapshot, quantity NUMERIC para splits)
├── order_item_ingredients  → Modificaciones por item (added/removed)
└── payments                → Pago por guest (amount, tip_amount, bizum_reference, status)
```

### Claves de diseño que impactan la implementación

**Acceso anónimo de comensales vía `session_token`:**
```sql
-- La RLS usa un setting de sesión, no auth.uid()
current_setting('app.session_token', true)

-- Los guests ven su order si su session_token está en order_guests
CREATE POLICY "orders_select_guest" ON orders.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders.order_guests og
      WHERE og.order_id = orders.id
        AND og.session_token = current_setting('app.session_token', true)
    )
  );
```

Esto significa que **el cliente Supabase debe enviar el `session_token` como header custom** en cada request. Se hace con el cliente configurado así:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export function createGuestClient(sessionToken: string) {
  return createClient(url, anonKey, {
    global: {
      headers: { 'x-session-token': sessionToken }
    }
  })
}
```

> ⚠️ Alternativamente, la Edge Function que crea el `order_guest` puede devolver un JWT firmado con el `session_token` como claim, y usarlo como token de acceso. **Decidir este approach antes de codificar.**

**Split de items con `quantity NUMERIC(6,3)`:**

El split no usa un array de `guest_ids`. Cada `order_item` tiene **un único `guest_id`**. Para dividir un plato entre N personas se crean **N filas** de `order_item` con `quantity = 1/N` (ej: pizza entre 3 = tres filas con `quantity = 0.333`). El ajuste de céntimos va en la última fila.

```
order_items (order_id = X, dish_name = "Pizza Margherita", dish_price = 12.00)
├── id: A  guest_id: G1  quantity: 0.334  subtotal: 4.01
├── id: B  guest_id: G2  quantity: 0.333  subtotal: 4.00
└── id: C  guest_id: G3  quantity: 0.333  subtotal: 3.99
```

**Estados de `order_items.payment_status`:**
```
unassigned → assigned → paid
```

**Estados de `orders.orders.status`:**
```
open → partial → closed
              ↘ cancelled
```

**Trigger automático `handle_payment_confirmed`:** cuando un `payment` pasa a `confirmed`, el trigger recalcula `amount_paid` en la order y cambia el status a `partial` o `closed` automáticamente. La WebApp solo necesita escuchar el cambio vía Realtime.

---

## 4. Arquitectura de la WebApp

### Estructura de carpetas

```
src/
├── components/
│   ├── bill/
│   │   ├── OrderItemCard.vue      # Item con estados visuales + tap/long-press
│   │   ├── GuestAvatar.vue        # Avatar circular con color + alias
│   │   ├── SplitModal.vue         # Modal para dividir item entre N guests
│   │   ├── TipSelector.vue        # 0% / 5% / 10% / personalizado
│   │   ├── PaymentSummary.vue     # Resumen: items + subtotal + propina + total
│   │   └── OrderProgress.vue      # Barra de progreso: importe asignado / total
│   ├── layout/
│   │   ├── AppShell.vue           # Layout base con header
│   │   ├── LoadingScreen.vue
│   │   └── OfflineBanner.vue      # Banner cuando no hay red
│   └── ui/
│       ├── BaseButton.vue
│       ├── BaseModal.vue
│       ├── BaseToast.vue
│       └── BaseBadge.vue
│
├── composables/
│   ├── useQRSession.ts            # Validar token QR → crear/recuperar order_guest
│   ├── useOrder.ts                # Cargar order + order_items + order_guests
│   ├── useRealtime.ts             # Subscripciones Supabase Realtime (items, guests, payments)
│   ├── useItemAssignment.ts       # Asignar item, split, desasignar (escribe en order_items)
│   ├── usePayment.ts              # Cálculo total, deep link Bizum, confirmar pago
│   └── useOffline.ts              # Detectar red, cache local, sync on reconnect
│
├── stores/
│   ├── order.ts                   # Pinia: order activa + items + guests
│   ├── guest.ts                   # Pinia: guest actual (id, alias, session_token, color)
│   └── ui.ts                      # Pinia: toasts, loading states, modals
│
├── views/
│   ├── ScanView.vue               # /scan — Landing: input de código o redirect desde QR
│   ├── WaitingRoomView.vue        # /order/:id/waiting — Sala de espera colaborativa
│   ├── OrderView.vue              # /order/:id — Lista de items (vista principal)
│   ├── PaymentView.vue            # /order/:id/pay — Resumen personal + propina
│   └── ConfirmView.vue            # /order/:id/confirm — Introducir código Bizum
│
├── router/
│   └── index.ts                   # Rutas + guards (validar session_token activo)
│
├── lib/
│   ├── supabase.ts                # Cliente Supabase singleton + createGuestClient()
│   └── bizum.ts                   # Generador de deep link bizum://
│
└── types/
    └── index.ts                   # Tipos generados con `supabase gen types typescript`
```

### Gestión de estado y Realtime

```
Supabase Realtime (postgres_changes)
    │
    ▼
useRealtime.ts  ──────────────────────────────────┐
    │  INSERT/UPDATE en:                           │
    │  · orders.order_items                        │
    │  · orders.order_guests                       │  
    │  · orders.payments                           │
    ▼                                              │
Pinia store (order.ts)  ←─── sincroniza ──────────┘
    │
    ▼
Computed properties en componentes  →  UI reactiva
```

No hay polling. No hay WebSocket manual. Latencia objetivo: < 500ms.

### Subscripciones Realtime concretas

```typescript
// composables/useRealtime.ts
const channel = supabase
  .channel(`order:${orderId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'orders',
    table: 'order_items',
    filter: `order_id=eq.${orderId}`
  }, (payload) => orderStore.syncItem(payload))
  .on('postgres_changes', {
    event: '*',
    schema: 'orders',
    table: 'order_guests',
    filter: `order_id=eq.${orderId}`
  }, (payload) => orderStore.syncGuest(payload))
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'orders',
    table: 'orders',
    filter: `id=eq.${orderId}`
  }, (payload) => orderStore.syncOrder(payload))
  .subscribe()
```

---

## 5. Flujo completo del comensal

```
1. Camarero abre mesa en el panel
   → Crea QR en public.qr_codes (token único, expires_at +3h)
   → Crea orders.orders con status = 'open'
   → Los order_items ya están creados desde la comanda (kitchen_status varies)

2. Comensal escanea QR con el móvil
   → URL: https://app.splitpay.es/scan?token=<qr_token>
   → ScanView valida el token via Edge Function
   → Si válido: crea order_guest (alias input + color aleatorio) → devuelve session_token
   → Guarda session_token en localStorage
   → Redirige a /order/:id/waiting

3. WaitingRoomView
   → Muestra avatares de todos los order_guests en tiempo real
   → Cuando hay ≥ 2 guests O el primero decide empezar: botón "Empezar a dividir"
   → Redirige a /order/:id

4. OrderView (vista principal)
   → Carga todos los order_items con payment_status = 'unassigned' | 'assigned' | 'paid'
   → Realtime activo: cualquier cambio de otro guest actualiza la vista al instante
   → Acciones disponibles:
      · Tap en item libre → assignItem(itemId, guestId) → UPDATE order_items SET guest_id, payment_status = 'assigned'
      · Long press / botón split → SplitModal → splitItem(itemId, [guestIds]) → DELETE + INSERT N rows
      · Botón "Dividir resto entre todos" → splitRemaining(orderId, [allGuestIds])
   → Barra de progreso muestra: importe asignado / total de la order
   → Cuando mi importe > 0: botón "Ver mi cuenta" → PaymentView

5. PaymentView
   → Lista mis order_items asignados con subtotales
   → TipSelector: 0% / 5% / 10% / importe libre
   → Total final: sum(mis subtotales) + propina
   → Botón "Pagar con Bizum" → genera deep link → abre app Bizum
   → Crea payments record con status = 'pending'

6. ConfirmView (al volver de Bizum)
   → Input: código de transacción Bizum (10 dígitos)
   → Edge Function valida formato + actualiza payment status = 'confirmed'
   → Trigger DB actualiza order.amount_paid y status (partial → closed si todos pagaron)
   → Notificación Realtime a todos los guests: "X ha pagado ✓"
   → Si order.status = 'closed': pantalla de celebración + opción de recibo por email

7. Casos especiales
   → Si order.status = 'closed' al entrar: mostrar pantalla "Cuenta cerrada"
   → Si qr_code expirado: pantalla de error con instrucción
   → Si guest vuelve con session_token en localStorage: recuperar sesión sin pedir alias
```

---

## 6. Funcionalidades core del MVP

### División de items

Se implementan en este orden de prioridad:

**1. Asignación individual** (Sprint 2, día 1)
- Tap en `OrderItemCard` con `payment_status = 'unassigned'`
- Optimistic UI: cambia el estado visual en local inmediatamente
- `UPDATE orders.order_items SET guest_id = $myGuestId, payment_status = 'assigned' WHERE id = $itemId`
- Si falla (conflicto de concurrencia): revert + toast "Alguien se adelantó 😅"

**2. División proporcional** (Sprint 2, día 3)
- Long press o icono "÷" en cualquier item
- `SplitModal`: lista de guests con checkboxes
- Al confirmar con N guests seleccionados:
  - `DELETE` la fila original
  - `INSERT` N filas nuevas con `quantity = 1/N` y `guest_id` de cada uno
  - Ajuste de céntimos: la primera fila absorbe el redondeo
  - `subtotal = ROUND(dish_price * quantity, 2)`

**3. División equitativa del total** (Sprint 3)
- Botón global "Dividir el resto entre todos"
- Aplica split proporcional a todos los `order_items` con `payment_status = 'unassigned'`
- Reparte entre todos los `order_guests` activos de la sesión

### Estados visuales de `OrderItemCard`

| Estado | Clases Tailwind | Interacción |
|---|---|---|
| `unassigned` | `border-gray-200 bg-white` | Tap para asignar, long press para split |
| `assigned` (mío) | `border-blue-500 bg-blue-50 ring-2 ring-blue-200` | Tap para desasignar |
| `assigned` (otro) | `border-gray-300 bg-gray-50 opacity-60` | Solo lectura. Muestra avatar del owner |
| split (múltiples) | `border-purple-400 bg-purple-50` | Muestra avatares de todos los owners |
| `paid` | `border-green-400 bg-green-50 line-through text-gray-400` | Solo lectura |

### Gestión de propina (TipSelector)

- Opciones: **0%**, **5%**, **10%**, **15%**, **personalizado** (input numérico)
- La propina se calcula sobre el subtotal del guest (no el total de la mesa)
- Se guarda en `orders.payments.tip_amount` al crear el payment record
- No es obligatoria. Default: 0%

---

## 7. Integración Bizum (Fase 1)

En el MVP no existe API oficial de Bizum para comercios. El flujo es completamente manual.

### Generación del deep link

```typescript
// lib/bizum.ts
export function generateBizumLink(params: {
  phone: string      // Número Bizum del restaurante (desde tenant_settings o tenants.phone)
  amount: number     // En euros, 2 decimales
  concept: string    // Ej: "SplitPay · Mesa 4"
}): string {
  const amountStr = params.amount.toFixed(2)
  const concept = encodeURIComponent(params.concept)
  // Deep link oficial Bizum (pendiente confirmar formato exacto con Bizum)
  return `bizum://pay?amount=${amountStr}&concept=${concept}&phone=${params.phone}`
}
```

### Flujo de confirmación manual

```
PaymentView
  → Crear payment (status: pending) en orders.payments
  → Abrir deep link Bizum
  → Usuario paga en app Bizum
  → Usuario vuelve a la PWA (manual o con App Switch)

ConfirmView
  → Input: referencia de transacción Bizum (texto libre, validación de formato básica)
  → Edge Function: UPDATE orders.payments SET status = 'confirmed', bizum_reference = $ref WHERE id = $paymentId
  → Trigger DB: recalcula order.amount_paid y status automáticamente
  → Realtime: todos los guests reciben el evento de payment confirmado
```

> Esta fricción es aceptable en el MVP. Se elimina en Fase 2 con la API oficial de Bizum para comercios.

---

## 8. Casos edge y gestión de errores

### Conflicto de asignación simultánea

Dos guests intentan asignar el mismo item a la vez:
- Se usa **optimistic locking**: el UPDATE incluye `WHERE payment_status = 'unassigned'`
- Si afecta 0 filas → el item ya fue asignado → revert local + toast "Alguien se adelantó 😅"
- No hay deadlock: el segundo guest simplemente no obtiene el item

### Guest inactivo / se va sin pagar

- Tras **10 minutos** sin actividad del guest (sin requests): se marca como inactivo en `order_guests`
- Los demás guests ven su avatar en gris con icono "ausente"
- Sus `order_items` con `payment_status = 'assigned'` vuelven a `unassigned` automáticamente (Edge Function o trigger)
- El restaurante recibe notificación si `order.amount_remaining > 0` pasados 30 minutos del primer pago

### Total no cuadra

- Si `SUM(mis order_items.subtotal)` ≠ `order.total / n_guests`, la barra de progreso lo muestra
- Alerta visual si hay items `unassigned` cuando el guest intenta ir a PaymentView
- Sugerencia automática: "Quedan €X.XX sin asignar · ¿Dividirlo entre todos?"

### QR expirado o inválido

- `qr_codes.expires_at` se comprueba en la Edge Function de validación
- `qr_codes.is_active = false` si ya se generó uno nuevo para la misma mesa
- Pantalla de error con mensaje claro: "Este QR ha caducado. Pide un QR nuevo al camarero."

### Sin conexión (offline)

- `useOnline` de VueUse detecta el estado de red
- `OfflineBanner` visible en todas las vistas
- Se bloquean acciones de escritura (asignación, split, pago) mientras offline
- La vista actual es visible gracias al Service Worker (cache-first para assets, stale-while-revalidate para datos)
- Al recuperar la red: re-subscribe al canal Realtime + re-fetch del estado actual

### Order ya cerrada al entrar

- Si `order.status = 'closed'` cuando el guest carga la OrderView: redirigir a pantalla "Cuenta cerrada ✓"
- Si `order.status = 'cancelled'`: pantalla de error con motivo

---

## 9. Roadmap de desarrollo (4 sprints)

### Sprint 1 — Semanas 1–2: Fundamentos y QR session
**Objetivo:** Escanear QR, unirse a la sesión y ver la sala de espera en tiempo real.

- [ ] Configurar proyecto: Vue 3 + TS + Vite + Tailwind 4 + `vite-plugin-pwa`
- [ ] Generar tipos TypeScript desde el schema Supabase: `supabase gen types typescript`
- [ ] Definir `createGuestClient(sessionToken)` y decidir approach de auth anónima
- [ ] Edge Function `POST /join-session`: validar QR token → crear `order_guest` → devolver `session_token`
- [ ] `useQRSession.ts`: guardar `session_token` en localStorage, recuperar sesión existente
- [ ] `ScanView`: input de código manual + redirect desde URL con `?token=`
- [ ] `WaitingRoomView`: lista de guests en tiempo real (Realtime subscription a `order_guests`)
- [ ] Pinia store `guest.ts` y `order.ts` con estado inicial

**Entregable:** Un comensal puede escanear un QR, introducir su alias y ver quién más está en la mesa en tiempo real.

---

### Sprint 2 — Semanas 3–4: División de items
**Objetivo:** Vista principal con asignación individual y split en tiempo real.

- [ ] `OrderView`: cargar todos los `order_items` de la order activa
- [ ] `OrderItemCard`: estados visuales según `payment_status` y `guest_id`
- [ ] `useRealtime.ts`: subscripciones a `order_items`, `order_guests`, `orders`
- [ ] `useItemAssignment.ts`: `assignItem()` con optimistic UI + manejo de conflicto
- [ ] `SplitModal`: selección de guests + lógica de creación de N filas
- [ ] `OrderProgress`: barra de progreso del importe asignado / total
- [ ] `GuestAvatar`: color único por guest, nombre visible en tooltip
- [ ] Tests: conflicto de asignación simultánea (dos tabs del mismo navegador)

**Entregable:** Varios comensales pueden dividir la cuenta en tiempo real desde sus móviles.

---

### Sprint 3 — Semanas 5–6: Pago
**Objetivo:** Flujo de pago completo end-to-end con Bizum.

- [ ] `PaymentView`: lista de mis items, `TipSelector`, total final
- [ ] `usePayment.ts`: calcular total, crear `payment` (pending), generar deep link Bizum
- [ ] `lib/bizum.ts`: generador de deep link (confirmar formato con Bizum)
- [ ] `ConfirmView`: input de referencia Bizum + llamada a Edge Function de confirmación
- [ ] Edge Function `POST /confirm-payment`: validar + `UPDATE payments SET status = 'confirmed'`
- [ ] Pantalla de éxito cuando `order.status = 'closed'`
- [ ] División equitativa del total: botón global en `OrderView`
- [ ] Notificaciones visuales (toast) cuando otros guests pagan

**Entregable:** Flujo completo: QR → división → pago Bizum → cuenta cerrada.

---

### Sprint 4 — Semanas 7–8: Calidad y panel mínimo
**Objetivo:** Beta lista para restaurantes piloto.

- [ ] Panel mínimo de restaurantes (Vue + Auth Supabase):
  - Login con email/password (rol `admin` o `waiter`)
  - Vista de mesas: estado (`available`, `occupied`, `bill`, `paid`)
  - Generar QR para una mesa (crea `qr_code` + `order`)
  - Ver estado de la order activa de cada mesa
- [ ] Todos los casos edge implementados (sección 8)
- [ ] PWA completa: `manifest.json`, offline cache, Add to Home Screen prompt
- [ ] Loading states en todas las vistas (skeleton screens)
- [ ] Tests E2E con Playwright: flujo feliz completo + casos edge principales
- [ ] Deploy: Vercel (frontend PWA) + Supabase cloud (ya existe)
- [ ] Prueba con 3–5 restaurantes piloto en Barcelona

**Entregable:** Beta privada funcional, deployada, con restaurantes piloto usando la app.

---

## 10. Criterios de éxito

La WebApp estará lista para salir de beta privada cuando cumpla:

| Métrica | Objetivo | Cómo medirlo |
|---|---|---|
| Tiempo total de pago grupal | < 3 minutos | Desde `qr_codes.created_at` hasta `orders.status = 'closed'` |
| Tasa de completado del flujo | > 80% | Orders `closed` / Orders `open` con ≥ 1 guest |
| Latencia Realtime | < 500ms | Tiempo entre UPDATE en DB y render en cliente |
| Cuadre de cuentas | > 95% | Orders donde `amount_paid ≥ total` al cerrar |
| Tiempo de carga inicial (PWA) | < 2s | Lighthouse Performance Score en móvil 4G |
| Tasa de error en pagos | < 2% | Payments `failed` / total payments |

---

## 11. Próximos pasos inmediatos

### Antes de codificar — Decisiones pendientes

Estas decisiones afectan la arquitectura y deben resolverse antes del Sprint 1:

**1. Autenticación anónima de comensales**
¿Cómo envía el cliente el `session_token` para que la RLS lo lea con `current_setting('app.session_token', true)`?
- **Opción A:** Header custom `x-session-token` interceptado por un proxy o middleware de Edge Function que hace `SET LOCAL app.session_token = $token`
- **Opción B:** La Edge Function `join-session` devuelve un **JWT custom** (Supabase `signInWithPassword` o JWT manual) con el `session_token` como claim, y se usa como Bearer token → Supabase lo procesa en RLS
- **Opción C (recomendada para MVP):** Acceso anónimo de Supabase (`signInAnonymously`) + almacenar `session_token` en `user_metadata` → las RLS policies usan `auth.jwt() ->> 'session_token'`

**2. ¿Quién crea los `order_items`?**
Los `order_items` tienen `kitchen_status` y `dish_id` → están pensados para flujo de comanda (pedido → cocina → entregado). En el MVP, ¿el restaurante los crea manualmente desde el panel introduciendo los platos de la cuenta, o vienen del TPV?
- Si es manual: el panel MVP necesita un formulario de "añadir items a la cuenta"
- Si viene del TPV: fuera del scope MVP, los items ya están en la DB al generar el QR

**3. Número de Bizum del restaurante**
¿Dónde se almacena? El campo `tenants.phone` existe pero es genérico. Se recomienda añadir `bizum_phone TEXT` a `tenant_settings`.

**4. Persistencia de alias entre sesiones**
¿El alias del comensal se guarda en `localStorage` y se reutiliza automáticamente en la misma mesa, o se pide siempre? → Impacta UX de `ScanView`.

### Semana 1 — Acciones concretas

- [ ] **Hacer el refactor:** eliminar código fuera del scope, limpiar dependencias no usadas
- [ ] **Resolver las 4 decisiones pendientes** antes de escribir una línea de código nuevo
- [ ] Configurar proyecto Vue 3 + TS + Tailwind 4 + `vite-plugin-pwa` desde cero (o adaptar el existente)
- [ ] Ejecutar `supabase gen types typescript --project-id $PROJECT_ID > src/types/database.ts`
- [ ] Crear rama `feature/pwa-comensales` en Git
- [ ] Implementar `ScanView` + Edge Function `join-session` como primera historia de usuario completa

---

*Última actualización: 24 Feb 2026 19:30h by Christian · Schema: drawSQL-pgsql-export-2026-02-17.sql*
