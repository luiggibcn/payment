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
    path: "/products",
    name: AppRoute.PRODUCTS,
    component: ProductsPage,
    beforeEnter: authGuard // comment this line to allow access without authentication
  },
  {
    path: "/tables",
    name: AppRoute.TABLES,
    component: TablesPage
  },
  {
    path: "/qr",
    component: QR,
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
