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
      component: resolve => require(['../components/common/Home.vue'], resolve),
      children: [
        {
          path: '/dashboard',
          component: resolve => require(['../components/page/dashboard.vue'], resolve),
        },
        {
          path: '/project',
          component: resolve => require(['../components/page/project/project.vue'], resolve),
        },
        {
          path: '/asset',
          component: resolve => require(['../components/page/project/project.vue'], resolve),
        }
      ]
    },
  ]
})
