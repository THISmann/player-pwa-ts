import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import TestView from "../views/TestView.vue";
const routes: Array<RouteRecordRaw> = [
  // {
  //   //path: '/:current_radio_id/:url_server_radio/:url_flux_radio/:server_type',
  //   path: "/:radio_name",
  //   name: "home",
  //   component: HomeView,
  // },
  {
    path: "/:radio_name?",
    name: "test",
    component: TestView,
  },
  {
    path: "/player/:radio_name?",
    name: "home",
    component: HomeView,
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
