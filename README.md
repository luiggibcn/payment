# BillSplit

Restaurant bill-splitting PWA. Customers scan a QR code, claim their items, and pay their share — individually or as a group.

Built as a pnpm monorepo with Vue 3, TypeScript, Vite, Tailwind CSS v4, and Supabase.

## Architecture

```
billsplit/
├── apps/
│   └── web/               # Vue 3 SPA — restaurant staff dashboard (auth required)
├── packages/
│   ├── types/             # Shared TypeScript types  (@billsplit/types)
│   ├── config/            # Shared constants & routes (@billsplit/config)
│   └── utils/             # Shared helpers            (@billsplit/utils)
├── package.json
└── pnpm-workspace.yaml
```

## Quick Start

**Prerequisites:** Node.js v22, pnpm v9

```bash
# Install dependencies
pnpm install

# Environment
cp apps/web/.env.example apps/web/.env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Dev server
pnpm dev              # → http://localhost:5173
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start `apps/web` dev server |
| `pnpm build` | Production build |
| `pnpm test` | Run unit tests (vitest, watch mode) |

## Environment Variables (`apps/web/.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key | ✅ |

> Auth is handled directly by `@supabase/supabase-js` — no backend proxy needed.

## Packages

### `@billsplit/types`

All shared TypeScript `type`, `interface`, and `enum` declarations. Organised by domain:

| File | Contents |
|------|----------|
| `auth.ts` | `UserRole`, `AuthUser`, `AuthSession` |
| `tables.ts` | `TableStatus`, `TableSize`, `Rotation`, `RestaurantTable` |
| `orders.ts` | `Order`, `OrderGuest`, `OrderItem`, `Payment` |
| `dishes.ts` | `Dish` |
| `tenants.ts` | `Tenant` |
| `routes.ts` | `AppRoute` |
| `navigation.ts` | `NavItem` |
| `i18n.ts` | `Locale`, `Language` |
| `api.ts` | `ApiResponse`, `IBillsplitWindow` |

Import with: `import type { ... } from '@billsplit/types'`

### `@billsplit/config`

Shared runtime constants: `API_ROUTES`, `ORDER_STATUS`, `PAYMENT_METHOD`, `KITCHEN_STATUS`, `TAX_RATES`.

### `@billsplit/utils`

Shared helper functions.

## Tech Stack

- **Frontend:** Vue 3 (Composition API, `<script setup>`) + Vite 6
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **State:** Pinia
- **Auth & DB:** Supabase (Auth + PostgreSQL + Realtime)
- **i18n:** vue-i18n (en, es, ca)
- **Testing:** Vitest + Vue Test Utils
- **Package manager:** pnpm workspaces
