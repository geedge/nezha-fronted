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
      path: '/terminal',
      name: "terminal",
      component: resolve => require(['../components/page/asset/WebSSH.vue'], resolve),
    },
    {
      path: '/cloneChat',
      name: "cloneChat",
      component: resolve => require(['../components/page/asset/cloneChat.vue'], resolve),
    },
    {
      path: '/newChat',
      name: "newChat",
      component: resolve => require(['../components/page/asset/newChat.vue'], resolve),
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
          component: resolve => require(['../components/page/project/project2.vue'], resolve),
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
          path: '/alertList',
          component: resolve => require(['../components/page/alert/list.vue'], resolve),
        },
        {
          path: '/alertConfig',
          component: resolve => require(['../components/page/alert/config.vue'], resolve),
        }
      ]
    },
  ]
})
