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
const routes: RouteRecordRaw[] = [
  {
    path: "/register",
    component: SignUp,
    name: AppRoute.SIGNUP,
  },
  {
    path: "/login",
    component: SignIn,
    name: AppRoute.SIGNIN,
  },
  // {
  //   path: "/shop",
  //   component: ShopLayout,
  //   name: AppRoute.SHOP,
  //   children: [
  //      {
  //        path: "products",
  //        name: AppRoute.PRODUCTS,
  //        component: ProductsPage,
  //      },
  //   ],
  // },
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
