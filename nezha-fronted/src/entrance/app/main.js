// import '@/assets/stylus/index.scss'
// import 'element-ui/lib/theme-chalk/index.css'
import 'xterm/dist/xterm.css'
import '@/assets/css/main.scss'
import '@/assets/css/animate.css'
import '@/assets/css/font/iconfont.js'
import 'intro.js/introjs.css'
import Pace from 'pace-js'
import ElementUI from 'element-ui'
import i18n from '@/components/common/i18n'
import VueIntro from 'vue-introjs'
import Vue from 'vue'
import Vuex from 'vuex'
import store from '@/store/index'
import App from './App'
import router from '@/router'
import VueResource from 'vue-resource'
import axios from 'axios'
import { hasPermission, hasButton } from '@/permission'
import loadsh from 'lodash'
import plTable from 'pl-table'
import VueClipboard from 'vue-clipboard2'
import 'pl-table/themes/index.css'
import { post, get, put, del } from '@/http.js'
import { clickoutside, bottomBoxWindow, stringTimeParseToUnix, unixTimeParseToString, chartResizeTool, tableSet, cancelWithChange, myLoading } from '@/components/common/js/tools.js'
import * as tools from '@/components/common/js/tools.js'
import * as constants from '@/components/common/js/constants.js'

import Pagination from '@/components/common/pagination' // 引入全局分页组件
import searchInput from '@/components/common/searchInput' // 搜索框组件
import elementSet from '@/components/common/elementSet' // 自定义表头组件
import MyElSelect from '@/components/common/elSelect/MyElSelect'
import chartList from '@/components/chart/chartList.vue' // 全局引入 chartList 组件 防止 chart-group爆粗

// 二次封装message 显示自动关闭进度条
import Message from '@/components/common/message/index'

import loading from '@/components/common/loading'
import pickTime from '@/components/common/pickTime'
import myDatePicker from '@/components/common/myDatePicker'
import vSelectPage from '@/components/common/v-selectpagenew'
import nzDataList from '@/components/common/table/nzDataList'
import htmlToPdf from '@/components/common/js/htmlToPdf'
import mainMixin from '@/components/common/mixin/mainMixinFun'
import introJS from 'intro.js'

// v-md-editor
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'
// Pace.on("done", function() {
//   $self.isShowAuth = false;
//   Pace.off("done");
// })
// highlightjs
import hljs from 'highlight.js'

// Pace.start();
VMdPreview.use(githubTheme, {
  Hljs: hljs
})
Pace.options = {
  minTime: 0.1,
  ghostTime: 0.1,
  restartOnRequestAfter: 0.1
}
Vue.use(VMdPreview)
Vue.use(Pace)

Vue.use(VueIntro)
Vue.use(htmlToPdf)
Vue.use(vSelectPage, {
  dataLoad: function (vue, url, params) {
    if (params.pageNumber) {
      params.pageNo = params.pageNumber
    }
    return new Promise((resolve, reject) => {
      get(url, params).then(res => {
        resolve(res)
      }, e => reject(e))
    })
  }
})
Vue.use(myDatePicker) // 对element-ui的时间组件进行二次重构
Vue.component('Pagination', Pagination) // 公用分页组件
Vue.component('searchInput', searchInput) // 公用搜索组件
Vue.component('element-set', elementSet) // 公用设置表头
Vue.component('loading', loading)// 公用loading 除特殊情况使用 正常使用自定义指令 v-my-loading
Vue.component('pick-time', pickTime)// 时间组件 包含刷新 单位 同步等
Vue.component('myDatePicker', myDatePicker)
Vue.component('nzDataList', nzDataList) // 公用表格父组件
Vue.component('chartList', chartList)

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(Vuex)
Vue.use(VueResource)
Vue.use(VueClipboard)
Vue.use(plTable)
Vue.component('el-select', MyElSelect)
Vue.use(hasPermission)

Vue.prototype.$message = Message
Vue.prototype.$axios = axios
Vue.prototype.$post = post
Vue.prototype.$get = get
Vue.prototype.$put = put
Vue.prototype.$delete = del
Vue.prototype.$loadsh = loadsh // JavaScript 实用工具库  https://www.lodashjs.com/
Vue.prototype.$CONSTANTS = constants
Vue.prototype.$TOOLS = tools
Vue.prototype.$bottomBoxWindow = bottomBoxWindow // 底部上滑框控制
Vue.prototype.$stringTimeParseToUnix = stringTimeParseToUnix // 处理string类型的时间为时间戳 单位s
Vue.prototype.$unixTimeParseToString = unixTimeParseToString
Vue.prototype.$chartResizeTool = chartResizeTool
Vue.prototype.$tableSet = tableSet
Vue.prototype.$intro = introJS
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
    timeFormatMain () { // 所有组件添加默认时间格式
      return this.$store.getters.getTimeFormatMain
    },
    getMenuList () { // 所有的菜单权限
      return this.$store.state.user.menuList
    },
    getButtonList () { // 所有的按钮权限
      return this.$store.state.buttonList
    },
    $routePath () {
      return this.$route.path
    }
  },
  methods: {
    hasButton (code) { // 同v-has 主要判断button的权限
      return hasButton(this.$store.getters.buttonList, code)
    },
    ...mainMixin.methods
  }
})

/* 指令 */
Vue.directive('cancel', cancelWithChange)
Vue.directive('clickoutside', clickoutside)
Vue.directive('myLoading', myLoading)
window.resizing = false
window.vm = new Vue({
  el: '#app',
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
