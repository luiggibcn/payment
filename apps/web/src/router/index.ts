import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { AppRoute } from "@/interfaces/routes.interfaces";
import QR from "@/components/QR.vue";
import SignUp from "@/views/sign-up.vue";
import SignIn from "@/views/sign-in.vue";
import { authGuard, guestGuard } from "@/middlewares";
import ProductsPage from "@/pages/products.page.vue";
import TablesPage from "@/pages/tables.page.vue";
import ManageTables from "@/components/tables/ManageTables.vue";
import DashboardLayout from "@/views/dashboard.layout.vue";


const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: '/login'
  },
  {
    path: "/register",
    component: SignUp,
    name: AppRoute.SIGNUP,
    beforeEnter: guestGuard
  },
  {
    path: "/login",
    component: SignIn,
    name: AppRoute.SIGNIN,
    beforeEnter: guestGuard
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    beforeEnter: authGuard,
    children: [
      {
        path: '',
        name: AppRoute.TABLES,
        component: ManageTables
      },
      {
        path: 'products',
        name: AppRoute.PRODUCTS,
        component: ProductsPage
      }
    ]
  },
  {
    path: "/tables",
    name: 'tables-legacy',
    component: TablesPage,
    beforeEnter: guestGuard
  },
  {
    path: "/qr",
    component: QR,
    name: AppRoute.QR,
  },
  // Legacy TPV redirects
  { path: '/tpv', redirect: '/dashboard' },
  { path: '/tpv/products', redirect: '/dashboard/products' },
  { path: '/products', redirect: '/dashboard/products' },
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
