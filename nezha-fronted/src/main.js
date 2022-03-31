// import '@/assets/stylus/index.scss'
// import 'element-ui/lib/theme-chalk/index.css'
import 'xterm/dist/xterm.css'
import '@/assets/css/main.scss'
import '@/assets/css/font/iconfont.js'
import ElementUI from 'element-ui'
import i18n from './components/common/i18n'

import Vue from 'vue'
import Vuex from 'vuex'
import store from './store/index'
import App from './App'
import router from './router'
import VueResource from 'vue-resource'
import axios from 'axios'
import { hasPermission, hasButton } from './permission'

import plTable from 'pl-table'
import 'pl-table/themes/index.css'

import { post, get, put, del } from './http.js'
import { clickoutside, bottomBoxWindow, stringTimeParseToUnix, unixTimeParseToString, chartResizeTool, tableSet, cancelWithChange, myLoading } from './components/common/js/tools.js'
import * as tools from './components/common/js/tools.js'
import * as constants from './components/common/js/constants.js'

import Pagination from './components/common/pagination' // 引入全局分页组件
import searchInput from './components/common/searchInput' // 搜索框组件
import elementSet from './components/common/elementSet' // 自定义表头组件
import MyElSelect from './components/common/elSelect/MyElSelect'
import chartList from '@/components/chart/chartList.vue' // 全局引入 chartList 组件 防止 chart-group爆粗

import loading from '@/components/common/loading'
import pickTime from '@/components/common/pickTime'
import bus from '@/libs/bus'
import myDatePicker from '@/components/common/myDatePicker'
import vSelectPage from '@/components/common/v-selectpagenew'
import nzDataList from '@/components/common/table/nzDataList'
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
Vue.use(myDatePicker)
Vue.component('Pagination', Pagination)
Vue.component('searchInput', searchInput)
Vue.component('element-set', elementSet)
Vue.component('loading', loading)
Vue.component('pick-time', pickTime)
Vue.component('myDatePicker', myDatePicker)
Vue.component('nzDataList', nzDataList)
Vue.component('chartList', chartList)

Vue.prototype.$axios = axios
Vue.prototype.$post = post
Vue.prototype.$get = get
Vue.prototype.$put = put
Vue.prototype.$delete = del
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
  methods: {
    utcTimeToTimezone: function (time) {
      if (time) {
        return bus.UTCTimeToConfigTimezone(time)
      }
    },
    utcTimeToTimezoneStr: function (time) {
      if (time) {
        return bus.timeFormate(bus.UTCTimeToConfigTimezone(time), localStorage.getItem('nz-default-dateFormat') || 'YYYY-MM-DD HH:mm:ss')
      } else {
        return '-'
      }
    },
    timezoneToUtcTime: function (time) {
      if (time) {
        return bus.configTimezoneToUTCTime(time)
      }
    },
    timezoneToUtcTimeStr: function (time, fmt) {
      if (!fmt) {
        fmt = localStorage.getItem('nz-default-dateFormat') || 'YYYY-MM-DD HH:mm:ss'
      }
      if (time) {
        return bus.timeFormate(this.timezoneToUtcTime(time), fmt)
      }
    },
    timestampStr: function (time, fmt) {
      const date = new Date(time)
      const localOffset = date.getTimezoneOffset() * 60 * 1000 // 默认 一分钟显示时区偏移的结果
      const dateStr = new Date(time).getTime() + localOffset
      if (!fmt) {
        fmt = localStorage.getItem('nz-default-dateFormat') || 'YYYY-MM-DD HH:mm:ss'
      }
      if (time) {
        return bus.timeFormate(bus.UTCTimeToConfigTimezone(dateStr), fmt)
      } else {
        return '-'
      }
    },
    timeFormate (time) {
      return bus.timeFormate(time)
    },
    hasButton (code) {
      return hasButton(this.$store.getters.buttonList, code)
    },
    numberWithEConvent (num) {
      if (num) {
        if ((('' + num).indexOf('E') !== -1) || (('' + num).indexOf('e') !== -1)) {
          const regExp = /'^((\\d+.?\\d+)[Ee]{1}(\\d+))$', 'ig'/
          let result = regExp.exec(num)
          let resultValue = ''
          let power
          if (result != null) {
            resultValue = result[2]
            power = result[3]
            result = regExp.exec(num)
          }

          if (resultValue) {
            if (power) {
              const powVer = Math.pow(10, power)
              resultValue = resultValue * powVer
              return resultValue
            }
          }
        } else {
          return num
        }
      }
      return 0
    },
    translation (key) {
      return i18n.t(key)
    },
    timeFormatStrToDatePickFormat (str, flag) {
      if (flag) {
        const reg = /Y/g
        str = str.replace(reg, 'y')
        const reg1 = /D/g
        str = str.replace(reg1, 'd')
        const reg2 = /[H,m,s,:]/g
        str = str.replace(reg2, '')
        return str
      } else {
        const reg = /Y/g
        str = str.replace(reg, 'y')
        const reg1 = /D/g
        str = str.replace(reg1, 'd')
        return str
      }
    },
    copyRow (row, rightBoxValKey, idKey = 'id', show = false, format, callback) {
      /*
      row 表格当前行
      rightBoxValKey 右侧弹窗绑定的 data
      idKey 当前数据的唯一标识
      show 打开对应的弹窗 函数
      format 是否需要对当前行进行处理
      callBack 回调
      */
      let rowCopy = { ...row }
      if (rowCopy.name) {
        rowCopy.name = 'Copy from ' + rowCopy.name
      }
      if (format) {
        rowCopy = format(rowCopy)
      }
      delete rowCopy[idKey]
      this[rightBoxValKey] = rowCopy
      if (typeof show === 'function') {
        show()
      } else if (typeof show === 'string') {
        this[show] = true
      } else {
        this.rightBox.show = true
      }
      if (callback) {
        callback()
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

/* 重写组件内容 */
/* const elUi = require("element-ui");
const pl = require("pl-table");
//去掉el-table表头右侧的滚动条预留空间
elUi.Table.components.TableHeader.computed.hasGutter = () => {return false;};
pl.PlTable.components.ElTable.components.TableHeader.computed.hasGutter = () => {return false;}; */
