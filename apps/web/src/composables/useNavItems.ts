import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AppRoute } from '@billsplit/types'
import type { NavItem } from '@billsplit/types'

export type { NavItem }

export const navItems: NavItem[] = [
  {
    key: 'tables',
    labelKey: 'sidebar.table',
    routeName: AppRoute.TABLES,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>`,
  },
  {
    key: 'menu',
    labelKey: 'sidebar.menu',
    routeName: AppRoute.PRODUCTS,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
  },
  {
    key: 'orders',
    labelKey: 'sidebar.orders',
    routeName: AppRoute.ORDERS,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>`,
  },
  {
    key: 'history',
    labelKey: 'sidebar.history',
    routeName: AppRoute.QR,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/></svg>`,
  },
]

export function useNavItems() {
  const route = useRoute()
  const router = useRouter()

  const activeRoute = computed(() => route.name as AppRoute)
  const isActive = (routeName: AppRoute) => activeRoute.value === routeName
  const navigate = (routeName: AppRoute) => router.push({ name: routeName })

  return { navItems, activeRoute, isActive, navigate }
}
