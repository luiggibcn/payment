import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { AppRoute } from "@/interfaces/routes.interfaces";
import Example from "@/components/Example.vue";
import QR from "@/components/QR.vue";
import SignUp from "@/views/sign-up.vue";
import SignIn from "@/views/sign-in.vue";
import { authGuard, guestGuard } from "@/middlewares";
import ShopLayout from "@/views/shop.layout.vue";
import ProductsPage from "@/pages/products.page.vue";
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
    path: "/shop",
    component: ShopLayout,
    name: AppRoute.SHOP,
    beforeEnter: authGuard,
    // children: [
    //    {
    //      path: "products",
    //      name: AppRoute.PRODUCTS,
    //      component: ProductsPage,
    //    },
    // ],
  },
  {
    path: "/products",
    name: AppRoute.PRODUCTS,
    component: ProductsPage,
    beforeEnter: guestGuard
  },
  {
    path: "/test",
    component: Example,
    name: AppRoute.TEST,
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
