import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ResultsReveal from '../views/ResultsReveal.vue'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import(/* webpackChunkName: "about" */ '../views/AdminView.vue')
  },
  {
    path: '/resultsReveal',
    name: 'resultsReveal',
    component: () => import('../views/ResultsRevealView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
