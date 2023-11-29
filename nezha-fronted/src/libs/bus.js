import Vue from 'vue'
import moment from 'moment-timezone'
import { get } from '../http'
import store from '../store'
import router from '../router'
import audioUrl from '@/assets/audio/new_alert_message.mp3'
Date.prototype.setStart = function () {
  this.setHours(0)
  this.setMinutes(0)
  this.setSeconds(0)
}
Date.prototype.setEnd = function () {
  this.setHours(23)
  this.setMinutes(59)
  this.setSeconds(59)
}

export default new Vue({
  data () {
    return {
      selectDate: [], // 选中的时间段
      emailReg: /^[a-zA-Z0-9]{1,10}@[a-zA-Z0-9]{1,5}\.[a-zA-Z0-9]{1,5}$/,
      // 创建策略信息
      buildRuleInfo: {
        triggers: [],
        actions: []
      },
      backtoRulelist: '', // 返回策略列表页信息
      // role: md5(1),
      role: 1,
      // 创建图表信息
      chartAddInfo: {
        metricTarget: []
      },
      newAlertTimer: undefined,
      lastId: -1
    }
  },
  methods: {
    // 获取初始化时间，默认最近一周
    getDefaultDate () {
      let start = this.getDays(-7)
      let end = this.getDays(0)
      start.setStart()
      end.setEnd()
      // let start = this.getHoursTime(-1);
      // let end = this.getHoursTime(0);
      start = this.timeFormate(start, localStorage.getItem('nz-default-dateFormat') ? localStorage.getItem('nz-default-dateFormat') : 'YYYY-MM-DD HH:mm:ss')
      end = this.timeFormate(end, localStorage.getItem('nz-default-dateFormat') ? localStorage.getItem('nz-default-dateFormat') : 'YYYY-MM-DD HH:mm:ss')
      this.selectDate = [start, end]
    },
    getHoursTime (hours) {
      const today = new Date().getTime()
      const date = new Date(today + (hours * 60 * 60 * 1000))
      return date
    },
    // 初始化日期
    getDays (days) {
      const today = new Date().getTime()
      const date = new Date(today + (days * 24 * 60 * 60 * 1000))
      return date
    },
    formatDate (date, type) {
      const yy = date.getFullYear()
      const dateM = date.getMonth() + 1
      const mm = dateM > 9 ? dateM : `0${dateM}`
      const dateD = date.getDate()
      const dd = dateD > 9 ? dateD : `0${dateD}`
      if (type) {
        return `${yy}${type}${mm}${type}${dd}`
      }
      return `${yy}${mm}${dd}`
    },
    timeFormate (date, fmt = localStorage.getItem('nz-default-dateFormat') ? localStorage.getItem('nz-default-dateFormat') : 'YYYY-MM-DD HH:mm:ss') {
      let time = ''
      if (!isNaN(date)) {
        time = new Date(date)
      } else {
        time = moment(date, fmt)
      }
      const fm = fmt
      return moment(time).format(fm)
    },
    formateTimeToTime (date, fmt = localStorage.getItem('nz-default-dateFormat') ? localStorage.getItem('nz-default-dateFormat') : 'YYYY-MM-DD HH:mm:ss') {
      if (isNaN(date)) {
        const newDate = moment(date, fmt)
        return newDate
      } else {
        return date
      }
    },
    getStep (startTime, endTime) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      let step = '15s'
      const numInterval = end.getTime() - start.getTime()
      const oneDay = 86400000
      const sevenDay = 604800000
      const thirtyDay = 2592000000
      if (numInterval < oneDay / 2) { // 小于12小时
        step = '15s'
      } else if (numInterval < oneDay) { // 小于1天，step为15s
        step = '30s'
      } else if (numInterval < oneDay * 2) { // 小于2天，step为15s
        step = '1m'
      } else if (numInterval < sevenDay) { // 小于7天，step为5m
        step = '5m'
      } else if (numInterval < thirtyDay) { // 小于30天，step为10m
        step = '30m'
      } else if (numInterval < thirtyDay * 2) {
        step = '45m'
      } else if (numInterval < thirtyDay * 3) {
        step = '1h'
      } else if (numInterval < thirtyDay * 6) {
        step = '3h'
      } else if (numInterval < thirtyDay * 12) {
        step = '5h'
      } else {
        step = '24h'
      }
      return step
    },
    isEmptyObject (obj) {
      if (obj) {
        let name = ''
        // eslint-disable-next-line
        for (name in obj) { return false; }
        return true
      }
      return true
    },
    validateEmail (rule, value, callback) {
      if (value === '') {
        callback(new Error('请输入邮箱'))
      } else if (!this.emailReg.test(value)) {
        callback(new Error('邮箱格式不正确'))
      } else {
        callback()
      }
    },
    getNumStr (num) {
      if (num >= 1000) {
        const kbNum = num / 1000
        if (kbNum >= 1000) {
          const mbNum = kbNum / 1000
          if (mbNum > 1000) {
            const gbNum = mbNum / 1000
            if (gbNum > 1000) {
              const tbNum = gbNum / 1000
              if (tbNum > 1000) {
                const pbNum = tbNum / 1000
                return `${pbNum.toFixed(2)}PB`
              }
              return `${tbNum.toFixed(2)}TB`
            }
            return `${gbNum.toFixed(2)}GB`
          }
          return `${mbNum.toFixed(2)}MB`
        }
        return `${kbNum.toFixed(2)}KB`
      }
      return num.toFixed(2)
    },
    getSingleStatRlt (statistics, result) {
      let dataArray = []
      if (result) {
        result.forEach((item) => {
          dataArray.push(item[1])
        })
      }
      let statisticsRlt = ''
      if (dataArray.length > 0) {
        if (statistics === 'min') { // min：最小值
          statisticsRlt = dataArray.reduce(function (a, b) {
            return b < a ? b : a
          })
        } else if (statistics === 'max') { // max：最大值
          statisticsRlt = dataArray.reduce(function (a, b) {
            return b > a ? b : a
          })
        } else if (statistics === 'avg') { // avg：平均值
          let sum = 0
          dataArray.forEach((item) => {
            sum = Number(sum) + Number(item)
          })
          statisticsRlt = sum / dataArray.length
        } else if (statistics === 'total') { // total：总计
          dataArray.forEach((item) => {
            statisticsRlt = Number(statisticsRlt) + Number(item)
          })
        } else if (statistics === 'first') { // first：第一个值
          statisticsRlt = dataArray[0]
        } else if (statistics === 'last') { // last：最后一个值
          statisticsRlt = dataArray[dataArray.length - 1]
        } else if (statistics === 'range') { // range : max - min
          const min = dataArray.reduce(function (a, b) {
            return b < a ? b : a
          })
          const max = dataArray.reduce(function (a, b) {
            return b > a ? b : a
          })
          statisticsRlt = max - min
        } else if (statistics === 'different') { // different : last - first
          statisticsRlt = dataArray[dataArray.length - 1] - dataArray[0]
        }
      }
      dataArray = null
      return statisticsRlt
    },
    // 将本地时区转为系统配置的时区
    computeTimezone: function (sourceTime) {
      let offset = localStorage.getItem('nz-sys-timezone')
      offset = moment.tz(offset).format('Z')
      if (offset && offset !== 'undefined') {
        offset = Number.parseInt(offset)
        const date = new Date(sourceTime)
        const localOffset = date.getTimezoneOffset() * 60 * 1000 // 默认 一分钟显示时区偏移的结果
        const utcTime = sourceTime + localOffset
        return utcTime + (offset * 60 * 60 * 1000)
      } else {
        return sourceTime
      }
    },
    // 将本地时区转为系统配置的时区
    computeTimezoneTime: function (sourceTime) {
      let offset = localStorage.getItem('nz-sys-timezone')
      offset = moment.tz(offset).format('Z')
      if (offset && offset !== 'undefined') {
        offset = Number.parseInt(offset)
        const date = new Date(sourceTime)
        const localOffset = date.getTimezoneOffset() * 60 * 1000 // 默认 一分钟显示时区偏移的结果
        const utcTime = date.getTime() + localOffset
        return utcTime + (offset * 60 * 60 * 1000)
      } else {
        return sourceTime
      }
    },
    getTimezontDateRange: function (offset = -1) {
      return [
        new Date(new Date(this.computeTimezone(new Date().getTime())).setHours(new Date(this.computeTimezone(new Date().getTime())).getHours() + offset)),
        new Date(this.computeTimezone(new Date().getTime()))
      ]
    },
    getNewTime (time, num, fmt) {
      if (!fmt) {
        fmt = localStorage.getItem('nz-default-dateFormat') || 'YYYY-MM-DD HH:mm:ss'
      }
      const date = new Date(time)
      const newDate = new Date(parseInt(date.getTime(), 10) + num)
      return this.timeFormate(newDate, fmt)
    },
    getOffsetTimezoneData (offset = 0) {
      return new Date(this.computeTimezone(new Date().getTime())).setHours(new Date(this.computeTimezone(new Date().getTime())).getHours() + offset)
    },

    UTCTimeToConfigTimezone (utcTime) {
      let offset = localStorage.getItem('nz-sys-timezone')
      offset = moment.tz(offset).format('Z')
      if (offset && offset !== 'undefined') {
        let time = utcTime
        if (typeof time === 'string' && /(\d+?-){2}\d+?\s(\d+?:)*\d+/.test(time)) {
          time = new Date(time).getTime()
        }
        offset = Number.parseInt(offset)
        time += offset * 60 * 60 * 1000
        return time
      } else {
        return utcTime
      }
    },
    configTimezoneToUTCTime: function (configTime) {
      let offset = localStorage.getItem('nz-sys-timezone')
      offset = moment.tz(offset).format('Z')
      if (offset && offset !== 'undefined') {
        let time = configTime
        if (typeof time === 'string' && /(\d+?-){2}\d+?\s(\d+?:)*\d+/.test(time)) {
          time = new Date(time).getTime()
        }
        offset = Number.parseInt(offset)
        time -= offset * 60 * 60 * 1000
        return time
      } else {
        return configTime
      }
    },
    countDecimals (value) {
      if ((value || value === 0) && Math.floor(value) !== value) {
        const arr = value.toString().split('.')
        if (Math.abs(arr[0] > 0) || arr.length < 2) {
          return 2
        }
        const dot = arr[1].split('0').length + 1
        return dot || 2
      }
      return 2
    },
    debounce (fn, delay, fn1) {
      // 记录上一次的延时器
      let timer = null
      delay = delay || 200
      return function () {
        const args = arguments
        const that = this
        if (fn1) {
          fn1()
        }
        // 清除上一次延时器
        clearTimeout(timer)
        timer = setTimeout(function () {
          fn.apply(that, args)
        }, delay)
      }
    },
    /**
     * @desc 防抖函数
     * @param {需要防抖的函数} func
     * @param {延迟时间} wait
     * @param {是否立即执行} immediate
     */
    debounceFn (func, wait, immediate) {
      let timeout
      return function (...args) {
        const context = this
        if (timeout) clearTimeout(timeout)

        if (immediate) {
          const callNow = !timeout
          timeout = setTimeout(function () {
            timeout = null
          }, wait)
          if (callNow) func.apply(context, args)
        } else {
          timeout = setTimeout(function () {
            func.apply(context, args)
          }, wait)
        }
      }
    },
    // 数组对象扁平化
    flatten (arr) {
      const tempArr = this.$lodash.cloneDeep(arr)
      // 递归调用
      function handler (tempArr) {
        const newArr = []
        tempArr.forEach(element => {
          newArr.push(element)
          if (element.children) {
            newArr.push.apply(newArr, handler(element.children))
            delete element.children
          }
        })
        return newArr
      }
      return handler(tempArr)
    },
    // 开启系统通知
    async openNotification () {
      const userId = localStorage.getItem('nz-user-id')
      const enable = localStorage.getItem(`nz-notification-${userId}`)
      if (enable != 1 || this.newAlertTimer) {
        return
      }
      const queryParams = {
        pageSize: 1,
        orderBy: '-id'
      }
      this.newAlertTimer = true
      const response = await get('/alert/message/query', queryParams, { headers: { notCancel: true } })
      this.lastId = this.$lodash.get(response, 'data.list[0].id', -1)
      const interval = store.state.nzDefaultConfig.interval
      this.getNewAlert(interval || 10)
    },
    // 查询告警消息
    getNewAlert (interval = 10) {
      if (this.newAlertTimer !== true) {
        return
      }
      const ms = parseInt(interval) * 1000
      this.newAlertTimer = setInterval(async () => {
        const queryParams = {
          body: encodeURIComponent(JSON.stringify({
            id: ['>' + this.lastId],
            state: 1
          })),
          orderBy: '-id'
        }
        const response = await get('/alert/message/query', queryParams, { headers: { notCancel: true } })
        // 防止正在请求时关闭 此时不再执行
        if (this.newAlertTimer === null) {
          return
        }
        if (response.code == 200) {
          if (!this.audio) {
            this.audio = new Audio(audioUrl)
          }
          if (response.data.list && response.data.list.length) {
            this.lastId = response.data.list.reduce(function (max, obj) {
              return obj.id > max ? obj.id : max
            }, -1)
            const h = this.$createElement
            const self = this
            response.data.list.forEach((item, index) => {
              setTimeout(() => {
                this.$notify({
                  offset: 90,
                  duration: 5000,
                  iconClass: 'nz-icon nz-icon-Notification',
                  dangerouslyUseHTMLString: true,
                  message: h('div', [
                    h('p',
                      {
                        class: 'notification-summary',
                        attrs: {
                          title: item.summary
                        },
                        on: {
                          click: self.toAlertPage
                        }
                      },
                      item.summary || '-'
                    ),
                    h('p',
                      {
                        class: 'notification-description',
                        attrs: {
                          title: item.description
                        }
                      },
                      item.description || '-'
                    )
                  ]),
                  customClass: 'newAlert-notification'
                })
              }, 10 * index)
            })
            let playCount = 0
            const audioLoop = store.state.nzDefaultConfig.audioLoop || 3
            const maxPlayCount = parseInt(audioLoop) // 设置希望播放的次数
            if (maxPlayCount) {
              this.audio.play()
            }
            this.audio.addEventListener('ended', () => {
              playCount++
              if (playCount < maxPlayCount) {
                this.audio.play()
              }
            })
          }
        }
      }, ms)
    },
    toAlertPage () {
      if (router.currentRoute.path === '/alertMessage') {
        store.commit('setIsRouteLive')
      }
      router.push({ path: '/alertMessage' })
      this.$notify.closeAll()
    },
    closeNotification () {
      clearInterval(this.newAlertTimer)
      this.newAlertTimer = null
    }
  },
  created () {
    this.getDefaultDate()
  },
  computed: {
    /*
    isAdmin() {
      return this.role === Cookies.get('owl_role');
    },
    */
  }
})
