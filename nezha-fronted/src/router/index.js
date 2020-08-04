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
          path: '/panel',
          component: resolve => require(['../components/page/dashboard/panel.vue'], resolve),
        },
        {
          path: '/metricPreview',
          component: resolve => require(['../components/page/dashboard/metricPreview.vue'], resolve),
        },
        {
          path: '/explore',
          component: resolve => require(['../components/page/dashboard/explore/explore.vue'], resolve),
        },
        {
          path: '/overview',
          component: resolve => require(['../components/page/dashboard/overview/overview2.vue'],resolve)
        },
        {
          path: '/test',
          component: resolve => require(['../components/charts/d3-line-chart2'],resolve)
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
          path: '/dc',
          component: resolve => require(['../components/page/config/dc.vue'], resolve),
        },
        {
          path: '/model',
          component: resolve => require(['../components/page/config/model.vue'], resolve),
        },
        {
          path: '/terminallog',
          component: resolve => require(['../components/page/config/terminallog.vue'], resolve),
        },
        {
          path: '/operationlog',
          component: resolve => require(['../components/page/config/operationlog.vue'], resolve),
        },
        {
          path: '/mib',
          component: resolve => require(['../components/page/config/mib.vue'], resolve),
        },
        {
          path: '/system',
          component: resolve => require(['../components/page/config/system.vue'], resolve),
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
