// import '@/assets/stylus/index.scss'
// import 'element-ui/lib/theme-chalk/index.css'
// import 'xterm/dist/xterm.css'
import '@/assets/css/main.scss'
// import '@/assets/css/font/iconfont.js'
import ElementUI from 'element-ui'
import i18n from '@/components/common/i18n'

import Vue from 'vue'
import Vuex from 'vuex'
import store from '@/store/exportHtml'
import App from './App.vue'
import router from '@/router/exportHtmlRouter'
import VueResource from 'vue-resource'
import axios from 'axios'
// import { hasPermission } from '@/permission'
import loadsh from 'lodash'

import { post, get, put, del } from '@/http.js'
import { clickoutside, bottomBoxWindow, stringTimeParseToUnix, unixTimeParseToString, chartResizeTool, tableSet, cancelWithChange, myLoading } from '@/components/common/js/tools.js'
import * as tools from '@/components/common/js/tools.js'
import * as constants from '@/components/common/js/constants.js'

import chartList from '@/components/chart/chartList.vue' // 全局引入 chartList 组件 防止 chart-group爆粗

import pickTime from '@/components/common/pickTime'
import nzDataList from '@/components/common/table/nzDataList'
import mainMixin from '@/components/common/mixin/mainMixinFun'
import Pagination from '@/components/common/pagination'
Vue.component('pick-time', pickTime)
Vue.component('nzDataList', nzDataList)
Vue.component('chartList', chartList)
Vue.component('Pagination', Pagination) // 公用分页组件
Vue.prototype.$axios = axios
Vue.prototype.$post = post
Vue.prototype.$get = get
Vue.prototype.$put = put
Vue.prototype.$delete = del
Vue.prototype.$loadsh = loadsh
Vue.prototype.$CONSTANTS = constants
Vue.prototype.$TOOLS = tools
Vue.prototype.$bottomBoxWindow = bottomBoxWindow // 底部上滑框控制
Vue.prototype.$stringTimeParseToUnix = stringTimeParseToUnix
Vue.prototype.$unixTimeParseToString = unixTimeParseToString
Vue.prototype.$chartResizeTool = chartResizeTool
Vue.prototype.$tableSet = tableSet
Vue.prototype.$tableHeight = { // 列表页表格的高度
  normal: 'calc(100% - 48px)', // 常规高度，特例在下方定义
  assetList: 'calc(100% - 57px)',
  profile: 'calc(100% - 78px)',
  openSubList: { // 打开二级列表后的高度
    mainList: 'calc(100% - 60px)',
    subList: 'calc(100% - 25px)',
    subListFromAsset: 'calc(100% - 45px)',
    toTopBtnTop: 'calc(50% - 11px)'
  },
  toTopBtnTop: 'calc(100% - 73px)',
  noPagination: 'calc(100% - 60px)' // 特例：没有翻页组件
}

Vue.mixin({
  data: function () {
    return {
      prevent_opt: {
        save: false,
        import: false,
        duplicate: false,
        delete: false,
        refresh: false,
        query: false
      }
    }
  },
  computed: {
    timeFormatMain () {
      return this.$store.getters.getTimeFormatMain
    },
    getMenuList () {
      return this.$store.state.user.menuList
    },
    getButtonList () {
      return this.$store.state.buttonList
    },
    $routePath () {
      return this.$route.path
    }
  },
  ...mainMixin
})

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(Vuex)
Vue.use(VueResource)
const hasPermission = {
  install (Vue, options) {
    Vue.directive('has', {
      inserted: (el, binding, vnode) => {}
    })
  }
}
Vue.use(hasPermission)

/* 指令 */
Vue.directive('cancel', cancelWithChange)
Vue.directive('clickoutside', clickoutside)
Vue.directive('myLoading', myLoading)
window.resizing = false
window.vm = new Vue({
  el: '#entrance',
  router,
  i18n,
  store,
  components: { App },
  template: '<App/>',
  mounted () {
    // store.commit()
  }
})

export default window.vm

const orignalSetItem = localStorage.setItem
localStorage.setItem = function (key, value) {
  const setItemEvent = new Event('setItemEvent')
  setItemEvent.key = key
  setItemEvent.value = value
  window.dispatchEvent(setItemEvent)
  orignalSetItem.apply(this, arguments)
}

/* 重写组件内容 */
/* const elUi = require("element-ui");
const pl = require("pl-table");
//去掉el-table表头右侧的滚动条预留空间
elUi.Table.components.TableHeader.computed.hasGutter = () => {return false;};
pl.PlTable.components.ElTable.components.TableHeader.computed.hasGutter = () => {return false;}; */
