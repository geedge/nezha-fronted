import Vue from 'vue'
import moment from 'moment-timezone'
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
      }
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
      start = this.timeFormate(start, localStorage.getItem('nz-default-dateFormat') ? localStorage.getItem('nz-default-dateFormat') : 'yyyy-MM-dd hh:mm:ss')
      end = this.timeFormate(end, localStorage.getItem('nz-default-dateFormat') ? localStorage.getItem('nz-default-dateFormat') : 'yyyy-MM-dd hh:mm:ss')
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
    timeFormate (date, fmt = localStorage.getItem('nz-default-dateFormat') ? localStorage.getItem('nz-default-dateFormat') : 'yyyy-MM-dd hh:mm:ss') {
      const time = new Date(date)
      let fm = fmt
      // fmt 自定义格式,如：yy-MM-dd
      let week = ''
      switch (time.getDay()) {
        case 0:
          week = '周日'
          break
        case 1:
          week = '周一'
          break
        case 2:
          week = '周二'
          break
        case 3:
          week = '周三'
          break
        case 4:
          week = '周四'
          break
        case 5:
          week = '周五'
          break
        case 6:
          week = '周六'
          break
        default:
          week = ''
          break
      }
      const o = {
        'M+': time.getMonth() + 1, // 月份
        'd+': time.getDate(), // 日
        hh: time.getHours(), // 小时
        HH: time.getHours(), // 小时
        'm+': time.getMinutes(), // 分
        's+': time.getSeconds(), // 秒
        'q+': Math.floor((time.getMonth() + 3) / 3), // 季度
        S: time.getMilliseconds(), // 毫秒
        w: week
      }
      if (/(y+)/.test(fm)) {
        fm = fm.replace(RegExp.$1, (time.getFullYear().toString()).substr(4 - RegExp.$1.length))
      }
      Object.keys(o).forEach((k) => {
        if (new RegExp(`(${k})`).test(fm)) {
          fm = fm.replace(RegExp.$1, (RegExp.$1.length === 1)
            ? (o[k])
            : ((`00${o[k]}`).substr((`${o[k]}`).length)))
        }
      })
      return fm
    },
    // 格式化tag为字符串表达式
    tagsToString (metric, arr) {
      let str = metric
      let sepStr = ''
      arr.forEach((item, index) => {
        if (index === 0) {
          str += '{'
          if (item.value.length === 1) {
            str += `${item.name}='${item.value.join('|')}'`
            sepStr = ','
          } else if (item.value.length > 1) {
            str += `${item.name}=~'${item.value.join('|')}'`
            sepStr = ','
          }
        } else {
          if (item.value.length === 1) {
            str += sepStr + `${item.name}='${item.value.join('|')}'`
            sepStr = ','
          } else if (item.value.length > 1) {
            str += sepStr + `${item.name}=~'${item.value.join('|')}'`
            sepStr = ','
          }
        }
      })
      if (str.indexOf('{') > -1) {
        str += '}'
      }
      if (str.endsWith('{}')) {
        str = str.substring(0, str.indexOf('{'))
      }
      return str
    },
    getStep (startTime, endTime) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      let step = '15s'
      const numInterval = end.getTime() - start.getTime()
      const oneDay = 86400000
      const sevenDay = 604800000
      const thirtyDay = 2592000000
      if (numInterval < oneDay) { // 小于1天，step为15s
        step = '15s'
      } else if (numInterval < sevenDay) {
        step = '5m'
      } else if (numInterval < thirtyDay) {
        step = '10m'
      } else {
        step = '30m'
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
        } else if (statistics === 'average') { // average：平均值
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
    getNewTime (time, num) {
      const date = new Date(time)
      const newDate = new Date(parseInt(date.getTime(), 10) + num)
      return this.timeFormate(newDate, 'yyyy-MM-dd hh:mm:ss')
    },
    getOffsetTimezoneData (offset = 0) {
      return new Date(this.computeTimezone(new Date().getTime())).setHours(new Date(this.computeTimezone(new Date().getTime())).getHours() + offset)
    },
    debounce (fn, delay) {
      // 记录上一次的延时器
      let timer = null
      delay = delay || 200
      return function () {
        const args = arguments
        const that = this
        // 清除上一次延时器
        clearTimeout(timer)
        timer = setTimeout(function () {
          fn.apply(that, args)
        }, delay)
      }
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
