import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { AppRoute } from "@/interfaces/routes.interfaces";
import { authGuard, guestGuard } from "@/middlewares";


const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: '/login'
  },
  {
    path: "/register",
    component: () => import("@/views/sign-up.vue"),
    name: AppRoute.SIGNUP,
    beforeEnter: guestGuard
  },
  {
    path: "/login",
    component: () => import("@/views/sign-in.vue"),
    name: AppRoute.SIGNIN,
    beforeEnter: guestGuard
  },
  {
    path: '/dashboard',
    component: () => import("@/views/dashboard.layout.vue"),
    beforeEnter: authGuard,
    children: [
      {
        path: '',
        name: AppRoute.TABLES,
        component: () => import("@/components/tables/ManageTables.vue")
      },
      {
        path: 'products',
        name: AppRoute.PRODUCTS,
        component: () => import("@/pages/products.page.vue")
      },
      {
        path: 'orders',
        name: AppRoute.ORDERS,
        component: () => import("@/pages/orders.page.vue")
      }
    ]
  },
  {
    path: "/qr",
    component: () => import("@/components/QR.vue"),
    name: AppRoute.QR,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "error",
    component: async () => await import("../views/error.layout.vue"),
  },
];

const router = createRouter({
  routes,
  history: createWebHistory("/"),
});

export default router;
