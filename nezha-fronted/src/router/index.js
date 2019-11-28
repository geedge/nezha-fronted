import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: resolve => require(['../components/common/Login.vue'], resolve),
    },
    {
      path: '/',
      name: 'main',
      component: resolve => require(['../components/common/Home.vue'], resolve),
      children: [
      ]
    },
  ]
})
