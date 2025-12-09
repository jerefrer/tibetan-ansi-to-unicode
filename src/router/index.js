import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/ConverterView.vue"),
  },
  {
    path: "/tests",
    name: "tests",
    component: () => import("../views/TestsView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
