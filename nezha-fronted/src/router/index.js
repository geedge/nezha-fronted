import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)
export default new Router({
  hashbang: false,
  history: true,
  mode: 'history',
  base: '/ui/',
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: resolve => require(['@/components/common/login'], resolve)
    },
    {
      path: '/setup',
      component: resolve => require(['@/components/page/config/setup'], resolve)
    },
    {
      path: '/',
      component: resolve => require(['@/components/layout/home'], resolve),
      children: [
        {
          path: '/dashboard',
          component: resolve => require(['@/components/page/dashboard/dashboard'], resolve)
        },
        {
          path: '/explore',
          component: resolve => require(['@/components/page/dashboard/explore/explore'], resolve)
        },
        // {
        //   path: '/overview',
        //   component: resolve => require(['@/components/page/dashboard/overview/overview'], resolve)
        // },
        {
          path: '/project',
          component: resolve => require(['@/components/page/monitor/project/index'], resolve)
        },
        {
          path: '/module',
          name: '/module',
          component: resolve => require(['@/components/page/monitor/module/moduleList'], resolve)
        },
        {
          path: '/endpoint',
          component: resolve => require(['@/components/page/monitor/endpoint/endpointList'], resolve)
        },
        {
          path: '/asset',
          component: resolve => require(['@/components/page/asset/asset'], resolve)
        },
        {
          path: '/user',
          component: resolve => require(['@/components/page/config/user'], resolve)
        },
        {
          path: '/menu',
          component: resolve => require(['@/components/page/config/menus'], resolve)
        },
        {
          path: '/roles',
          component: resolve => require(['@/components/page/config/roles'], resolve)
        },
        {
          path: '/agent',
          component: resolve => require(['@/components/page/config/agent'], resolve)
        },
        {
          path: '/recordRule',
          component: resolve => require(['@/components/page/config/recordRule'], resolve)
        },
        {
          path: '/issue',
          component: resolve => require(['@/components/page/config/issue'], resolve)
        },
        {
          path: '/assetType',
          component: resolve => require(['@/components/page/config/assetType'], resolve)
        },
        {
          path: '/assetState',
          component: resolve => require(['@/components/page/config/assetState'], resolve)
        },
        {
          path: '/assetLabel',
          component: resolve => require(['@/components/page/config/assetMeta'], resolve)
        },
        {
          path: '/dc',
          component: resolve => require(['@/components/page/config/dc'], resolve)
        },
        {
          path: '/model',
          component: resolve => require(['@/components/page/config/model'], resolve)
        },
        {
          path: '/terminalLog',
          component: resolve => require(['@/components/page/config/terminalLog'], resolve)
        },
        {
          path: '/operationLog',
          component: resolve => require(['@/components/page/config/operationLog'], resolve)
        },
        {
          path: '/about',
          component: resolve => require(['@/components/page/config/about'], resolve)
        },
        {
          path: '/ipam',
          component: resolve => require(['@/components/page/config/ipam'], resolve)
        },
        {
          path: '/license/gen',
          component: resolve => require(['@/components/page/config/licenseGen'], resolve)
        },
        {
          path: '/profile',
          component: resolve => require(['@/components/page/config/profile'], resolve)
        },
        {
          path: '/mib/:tab',
          component: resolve => require(['@/components/page/config/snmp'], resolve)
        },
        // {
        //   path: '/snmp',
        //   component: resolve => require(['../components/page/config/snmp.vue'], resolve)
        // },
        {
          path: '/mib',
          component: resolve => require(['@/components/page/config/mib'], resolve)
        },
        {
          path: '/mibBrowser',
          component: resolve => require(['@/components/page/config/mibBrowser'], resolve)
        },
        {
          path: '/credentials',
          component: resolve => require(['@/components/page/config/credentials'], resolve)
        },
        {
          path: '/system',
          component: resolve => require(['@/components/page/config/basic'], resolve)
        },
        {
          path: '/notification',
          component: resolve => require(['@/components/page/config/system/notifyMethodTab'], resolve)
        },
        {
          path: '/apiKey',
          component: resolve => require(['@/components/page/config/system/apiKeyTab'], resolve)
        },
        {
          path: '/license',
          component: resolve => require(['@/components/page/config/system/license'], resolve)
        },
        {
          path: '/link',
          component: resolve => require(['@/components/page/config/system/linkTab'], resolve)
        },
        {
          path: '/appearance',
          component: resolve => require(['@/components/page/config/basic'], resolve)
        },
        {
          path: '/email',
          component: resolve => require(['@/components/page/config/email'], resolve)
        },
        {
          path: '/ldap',
          component: resolve => require(['@/components/page/config/ldap'], resolve)
        },
        {
          path: '/monitor',
          component: resolve => require(['@/components/page/config/monitor'], resolve)
        },
        {
          path: '/terminalSetting',
          component: resolve => require(['@/components/page/config/terminal'], resolve)
        },
        {
          path: '/i18n',
          component: resolve => require(['@/components/page/config/globalization.vue'], resolve)
        },
        {
          path: '/alertMessage',
          component: resolve => require(['@/components/page/alert/alertMessage'], resolve)
        },
        {
          path: '/alertRule',
          component: resolve => require(['@/components/page/alert/alertRule'], resolve)
        },
        {
          path: '/alertSilence',
          component: resolve => require(['@/components/page/alert/alertSilence'], resolve)
        },
        {
          path: '/exprTemp',
          component: resolve => require(['@/components/page/config/template/exprTemp'], resolve)
        },
        {
          path: '/chartTemp',
          component: resolve => require(['@/components/page/config/template/chartTemp'], resolve)
        },
        {
          path: '/dashboardTemp',
          component: resolve => require(['@/components/page/config/template/dashboardTemp'], resolve)
        },
        {
          path: '/backup',
          component: resolve => require(['@/components/page/config/backups'], resolve)
        },
        {
          path: '/ping',
          component: resolve => require(['@/components/page/tool/ping'], resolve)
        },
        {
          path: '/trace',
          component: resolve => require(['@/components/page/tool/trace'], resolve)
        },
        {
          path: '/integration',
          component: resolve => require(['@/components/page/integration/integration'], resolve)
        }
      ]
    },
    {
      path: '/terminal',
      component: resolve => require(['@/components/cli/terminal'], resolve),
      meta: {
        hideHeader: true,
        hideMenu: true
      }
    }
  ]
})
