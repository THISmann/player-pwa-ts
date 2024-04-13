import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    //path: '/:current_radio_id/:url_server_radio/:url_flux_radio/:server_type',
    path: '/:route_current_radio_id/:route_access_token/:route_url_flux_radio/:route_server_type/:route_url_api_radio/:route_url_api_radio_history',
    name: 'home',
    component: HomeView
  },
  {
    //path: '/:current_radio_id/:url_server_radio/:url_flux_radio/:server_type',
    path: '/:radio_name',
    name: 'home',
    component: HomeView
  },
  {
    path: '/',
    name: 'home',
    component: HomeView
  }  
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
