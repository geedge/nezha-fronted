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
      component: resolve => require(['../components/common/login.vue'], resolve),
    },
    {
      path: '/',
      component: resolve => require(['../components/common/home.vue'], resolve),
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
          component: resolve => require(['../components/page/asset/asset.vue'], resolve),
        },
        {
          path: '/account',
          component: resolve => require(['../components/page/config/account.vue'], resolve),
        },
        {
          path: '/promServer',
          component: resolve => require(['../components/page/config/promServer.vue'], resolve),
        },
        {
          path: '/alarmList',
          component: resolve => require(['../components/page/alarm/list.vue'], resolve),
        },
        {
          path: '/alarmConfig',
          component: resolve => require(['../components/page/alarm/config.vue'], resolve),
        }
      ]
    },
  ]
})
