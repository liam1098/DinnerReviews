import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminView from '../views/AdminView.vue'

import header from '@/components/layout/header.vue'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView
  },
  {
    path: '/resultsReveal',
    name: 'resultsReveal',
    component: () => import('../views/ResultsRevealView.vue')
  },
  {
    path: '/storePage',
    name: 'storePage',
    component: () => import('../views/storeView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
