import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { supabase } from '@/clients/supabase'

export const authGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    })
  } else {
    next()
  }
}

export const adminGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const { data: { session } } = await supabase.auth.getSession()
    console.log({session})
  if (!session) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role

  if (role !== 'admin') {
    // Not admin, redirect to homepage
    next({ path: '/shop/products' })
  } else {
    next()
  }
}

export const guestGuard = async (
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    // Already authenticated
    next({ path: '/shop/products' })
  } else {
    next()
  }
}
