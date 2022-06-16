// import '@/assets/stylus/index.scss'
// import 'element-ui/lib/theme-chalk/index.css'
import 'xterm/dist/xterm.css'
import '@/assets/css/main.scss'
import '@/assets/css/font/iconfont.js'
import 'intro.js/introjs.css'
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

import loading from '@/components/common/loading'
import pickTime from '@/components/common/pickTime'
import myDatePicker from '@/components/common/myDatePicker'
import vSelectPage from '@/components/common/v-selectpagenew'
import nzDataList from '@/components/common/table/nzDataList'
import htmlToPdf from '@/components/common/js/htmlToPdf'
import mainMixin from '@/components/common/mixin/mainMixinFun'
import introJS from 'intro.js'
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

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(Vuex)
Vue.use(VueResource)
Vue.use(plTable)
Vue.component('el-select', MyElSelect)
Vue.use(hasPermission)

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
const str = 'alert.list.id\n' +
  'alert.alertRule\n' +
  'asset.dc\n' +
  'overall.project\n' +
  'overall.module\n' +
  'overall.endpoint\n' +
  'overall.asset\n' +
  'alert.list.labels\n' +
  'alert.severity\n' +
  'alert.summary\n' +
  'alert.description\n' +
  'alert.startAt\n' +
  'alert.endAt\n' +
  'config.terminallog.duration\n' +
  'alert.state\n' +
  'asset.name\n' +
  'asset.name.comment\n' +
  'asset.sn\n' +
  'asset.sn.comment\n' +
  'asset.parent\n' +
  'asset.parent.comment\n' +
  'asset.manageIp\n' +
  'asset.manageIp.comment\n' +
  'asset.brand\n' +
  'asset.brand.comment\n' +
  'asset.model\n' +
  'asset.model.comment\n' +
  'asset.dc.comment\n' +
  'asset.cabinet\n' +
  'asset.cabinet.comment\n' +
  'asset.startU\n' +
  'asset.startU.comment\n' +
  'asset.endU\n' +
  'asset.endU.comment\n' +
  'asset.assetState\n' +
  'asset.assetState.comment\n' +
  'asset.assetType\n' +
  'asset.assetType.comment\n' +
  'asset.purchaseDate\n' +
  'asset.purchaseDate.comment\n' +
  'overall.tag\n' +
  'overall.tag.comment\n' +
  'asset.port\n' +
  'asset.port.comment\n' +
  'asset.authType\n' +
  'asset.authType.comment\n' +
  'asset.userName\n' +
  'asset.userName.comment\n' +
  'asset.pin\n' +
  'asset.pin.comment\n' +
  'asset.privateKey\n' +
  'asset.privateKey.comment\n' +
  'asset.usernamePrompt\n' +
  'asset.usernamePrompt.comment\n' +
  'asset.pinPrompt\n' +
  'asset.pinPrompt.comment\n' +
  'asset.snmpCredential\n' +
  'asset.snmpCredential.comment\n' +
  'asset.talon.username\n' +
  'asset.talon.username.comment\n' +
  'asset.talon.pin\n' +
  'asset.talon.pin.comment\n' +
  'asset.talon.token\n' +
  'asset.talon.token.comment\n' +
  'asset.talon.port\n' +
  'asset.talon.port.comment\n' +
  'asset.talon.enable\n' +
  'asset.talon.enable.comment\n' +
  'dashboard.panel.chartForm.group\n' +
  'dashboard.panel.chartForm.group.comment\n' +
  'overall.name\n' +
  'overall.name.comment\n' +
  'dashboard.panel.chartForm.type\n' +
  'dashboard.panel.chartForm.type.comment\n' +
  'dashboard.panel.chartForm.varType\n' +
  'dashboard.panel.chartForm.varType.comment\n' +
  'dashboard.panel.chartForm.width\n' +
  'dashboard.panel.chartForm.width.comment\n' +
  'dashboard.panel.chartForm.high\n' +
  'dashboard.panel.chartForm.high.comment\n' +
  'dashboard.panel.chartForm.unit\n' +
  'dashboard.panel.chartForm.unit.comment\n' +
  'dashboard.panel.chartForm.legendValue\n' +
  'dashboard.panel.chartForm.legendValue.comment\n' +
  'dashboard.panel.chartForm.element\n' +
  'dashboard.panel.chartForm.element.comment\n' +
  'dashboard.panel.chartForm.remark\n' +
  'dashboard.panel.chartForm.remark.comment\n' +
  'dashboard.panel.chartForm.datasource\n' +
  'dashboard.panel.chartForm.datasource.comment\n' +
  'dashboard.panel.chartForm.x\n' +
  'dashboard.panel.chartForm.x.comment\n' +
  'dashboard.panel.chartForm.y\n' +
  'dashboard.panel.chartForm.y.comment\n' +
  'config.cab.name\n' +
  'config.cab.name.comment\n' +
  'config.dc.dc\n' +
  'config.dc.name.comment\n' +
  'config.cab.uSize\n' +
  'config.cab.uSize.comment\n' +
  'config.cab.y\n' +
  'config.cab.y.comment\n' +
  'config.cab.x\n' +
  'config.cab.x.comment\n' +
  'config.dc.remark\n' +
  'dashboard.panel.panelForm.panelName\n' +
  'dashboard.panel.panelForm.panelName.comment\n' +
  'config.dc.name\n' +
  'config.dc.location\n' +
  'config.dc.location.comment\n' +
  'config.dc.tel\n' +
  'config.dc.tel.comment\n' +
  'config.dc.principal\n' +
  'config.dc.principal.comment\n' +
  'config.dc.longitude\n' +
  'config.dc.longitude.comment\n' +
  'config.dc.latitude\n' +
  'config.dc.latitude.comment\n' +
  'config.dc.state\n' +
  'config.dc.state.comment\n' +
  'overall.name\n' +
  'overall.name.comment\n' +
  'config.exprTemp.gname\n' +
  'config.exprTemp.gname.comment\n' +
  'config.exprTemp.expression\n' +
  'config.exprTemp.expression.comment\n' +
  'config.exprTemp.remark\n' +
  'config.exprTemp.remark.comment\n' +
  'config.ipamip.name\n' +
  'config.ipamip.name.comment\n' +
  'config.ipamip.ipamsubnet\n' +
  'config.ipamip.ipamsubnet.comment\n' +
  'config.ipamip.addr\n' +
  'config.ipamip.addr.comment\n' +
  'config.ipamip.mac\n' +
  'config.ipamip.mac.comment\n' +
  'config.ipamip.asset\n' +
  'config.ipamip.asset.comment\n' +
  'config.ipamip.state\n' +
  'config.ipamip.state.comment\n' +
  'config.ipamip.remark\n' +
  'config.ipamip.remark.comment\n' +
  'config.ipamip.uts\n' +
  'config.ipamip.uts.comment\n' +
  'config.ipamsubnet.name\n' +
  'config.ipamsubnet.name.comment\n' +
  'config.ipamsubnet.type\n' +
  'config.ipamsubnet.type.comment\n' +
  'config.ipamsubnet.addr\n' +
  'config.ipamsubnet.addr.comment\n' +
  'config.ipamsubnet.mask\n' +
  'config.ipamsubnet.mask.comment\n' +
  'config.ipamsubnet.vlan\n' +
  'config.ipamsubnet.vlan.comment\n' +
  'config.ipamsubnet.dc\n' +
  'config.ipamsubnet.dc.comment\n' +
  'config.ipamsubnet.remark\n' +
  'config.ipamsubnet.remark.comment\n' +
  'config.ipamsubnet.cap\n' +
  'config.ipamsubnet.cap.comment\n' +
  'config.ipamsubnet.used\n' +
  'config.ipamsubnet.used.comment\n' +
  'config.model.name\n' +
  'config.model.name.comment\n' +
  'config.model.brand\n' +
  'config.model.brand.comment\n' +
  'config.model.ChartTemplate\n' +
  'config.model.ChartTemplate.comment\n' +
  'config.model.remark\n' +
  'config.model.remark.comment\n' +
  'config.model.sysObjectId\n' +
  'config.model.sysObjectId.comment\n' +
  'overall.name\n' +
  'overall.name.comment\n' +
  'project.project.projectName\n' +
  'project.project.projectName.comment\n' +
  'project.module.endpointTemplate\n' +
  'project.module.endpointTemplate.comment\n' +
  'project.module.configs\n' +
  'project.module.configs.comment\n' +
  'project.module.ChartTemplate\n' +
  'project.module.ChartTemplate.comment\n' +
  'project.module.description\n' +
  'project.module.description.comment\n' +
  'project.endpoint.moduleName\n' +
  'project.endpoint.moduleName.comment\n' +
  'overall.name\n' +
  'overall.name.comment\n' +
  'project.endpoint.asset\n' +
  'project.endpoint.asset.comment\n' +
  'project.endpoint.configs\n' +
  'project.endpoint.configs.comment\n' +
  'overall.name\n' +
  'overall.name.comment\n' +
  'overall.type\n' +
  'overall.type.comment\n' +
  'alert.config.inr\n' +
  'alert.config.inr.comment\n' +
  'alert.config.timeout\n' +
  'alert.config.timeout.comment\n' +
  'alert.config.expr\n' +
  'alert.config.expr.comment\n' +
  'alert.config.operator\n' +
  'alert.config.operator.comment\n' +
  'alert.config.threshold\n' +
  'alert.config.threshold.comment\n' +
  'alert.config.unit\n' +
  'alert.config.unit.comment\n' +
  'alert.config.for\n' +
  'alert.config.for.comment\n' +
  'alert.severity.comment\n' +
  'alert.summary.comment\n' +
  'alert.description.comment\n' +
  'alert.receiver\n' +
  'alert.receiver.comment\n' +
  'alert.notify\n' +
  'alert.notify.comment\n' +
  'alert.state.comment\n' +
  'alert.config.autoExpired\n' +
  'alert.config.autoExpired.comment\n' +
  'alert.config.schedEnable\n' +
  'alert.config.schedEnable.comment\n' +
  'alert.config.schedDays\n' +
  'alert.config.schedDays.comment\n' +
  'alert.startAt.comment\n' +
  'alert.endAt.comment\n' +
  'alert.config.notifyActive\n' +
  'alert.config.notifyActive.comment\n' +
  'alert.config.notifyExpired\n' +
  'alert.config.notifyExpired.comment\n' +
  'alert.config.trbShot\n' +
  'alert.config.trbShot.comment\n'
/* 重写组件内容 */
/* const elUi = require("element-ui");
const pl = require("pl-table");
//去掉el-table表头右侧的滚动条预留空间
elUi.Table.components.TableHeader.computed.hasGutter = () => {return false;};
pl.PlTable.components.ElTable.components.TableHeader.computed.hasGutter = () => {return false;}; */
