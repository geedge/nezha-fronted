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
      component: resolve => require(['../components/common/login.vue'], resolve)
    },
    {
      path: '/setup',
      component: resolve => require(['../components/page/config/setup.vue'], resolve)
    },
    {
      path: '/',
      component: resolve => require(['../components/layout/home.vue'], resolve),
      children: [
        {
          path: '/panel',
          component: resolve => require(['../components/page/dashboard/panel.vue'], resolve)
        },
        {
          path: '/explore',
          component: resolve => require(['../components/page/dashboard/explore/explore.vue'], resolve)
        },
        {
          path: 'overview',
          component: resolve => require(['../components/page/dashboard/overview/overview2.vue'], resolve)
        },
        {
          path: '/monitor/project',
          component: resolve => require(['../components/page/monitor/project/index.vue'], resolve)
        },
        {
          path: '/monitor/module',
          component: resolve => require(['../components/page/monitor/module/moduleList.vue'], resolve)
        },
        {
          path: '/monitor/endpoint',
          component: resolve => require(['../components/page/monitor/endpoint/endpointList.vue'], resolve)
        },
        {
          path: '/asset',
          component: resolve => require(['../components/page/asset/asset.vue'], resolve)
        },
        {
          path: '/user',
          component: resolve => require(['../components/page/config/user.vue'], resolve)
        },
        {
          path: '/menu',
          component: resolve => require(['../components/page/config/menus.vue'], resolve)
        },
        {
          path: '/roles',
          component: resolve => require(['../components/page/config/roles.vue'], resolve)
        },
        {
          path: '/agent',
          component: resolve => require(['../components/page/config/agent.vue'], resolve)
        },
        {
          path: '/assetType',
          component: resolve => require(['../components/page/config/assetType.vue'], resolve)
        },
        {
          path: '/assetState',
          component: resolve => require(['../components/page/config/assetState.vue'], resolve)
        },
        {
          path: '/assetLabel',
          component: resolve => require(['../components/page/config/assetMeta.vue'], resolve)
        },
        {
          path: '/dc',
          component: resolve => require(['../components/page/config/dc.vue'], resolve)
        },
        {
          path: '/model',
          component: resolve => require(['../components/page/config/model.vue'], resolve)
        },
        {
          path: '/terminalLog',
          component: resolve => require(['../components/page/config/terminalLog.vue'], resolve)
        },
        {
          path: '/operationLog',
          component: resolve => require(['../components/page/config/operationLog.vue'], resolve)
        },
        {
          path: '/about',
          component: resolve => require(['../components/page/config/about.vue'], resolve)
        },
        {
          path: '/mib',
          component: resolve => require(['../components/page/config/mib.vue'], resolve)
        },
        {
          path: '/system',
          component: resolve => require(['../components/page/config/system.vue'], resolve)
        },
        {
          path: '/alertMessage',
          component: resolve => require(['../components/page/alert/alertMessage.vue'], resolve)
        },
        {
          path: '/alertRule',
          component: resolve => require(['../components/page/alert/alertRule.vue'], resolve)
        },
        {
          path: '/alertSilence',
          component: resolve => require(['../components/page/alert/alertSilence.vue'], resolve)
        },
        {
          path: '/exprtemp',
          component: resolve => require(['../components/page/config/exprTemp.vue'], resolve)
        }
      ]
    }
  ]
})
