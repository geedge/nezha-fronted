import bus from '@/libs/bus'
import moment from 'moment-timezone'
import i18n from '@/components/common/i18n'
export default {
  methods: {
    utcTimeToTimezone: function (time) { // 将utc时间 转为系统设者的时间  返回时间戳
      if (time) {
        return bus.UTCTimeToConfigTimezone(time)
      }
    },
    utcTimeToTimezoneStr: function (time, fmt) { // 将utc时间 转为系统设者的时间  返回String
      if (!fmt) {
        fmt = localStorage.getItem('nz-default-dateFormat') || 'YYYY-MM-DD HH:mm:ss'
      }
      if (time) {
        return bus.timeFormate(bus.UTCTimeToConfigTimezone(time), fmt)
      } else {
        return '-'
      }
    },
    timezoneToUtcTime: function (time) { // 将系统设者的时间 转为utc时间 返回时间戳
      if (time) {
        return bus.configTimezoneToUTCTime(time)
      }
    },
    timezoneToUtcTimeStr: function (time, fmt) { // 将系统设者的时间 转为utc时间 返回String
      if (!fmt) {
        fmt = localStorage.getItem('nz-default-dateFormat') || 'YYYY-MM-DD HH:mm:ss'
      }
      if (time) {
        return bus.timeFormate(this.timezoneToUtcTime(time), fmt)
      }
    },
    timeFormate (time) {
      return bus.timeFormate(time)
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
    timeFormatStrToDatePickFormat (str = localStorage.getItem('nz-default-dateFormat') ? localStorage.getItem('nz-default-dateFormat') : 'YYYY-MM-DD HH:mm:ss', flag) {
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
    momentTz (timestamp, fmt) { // moment 转化时间戳为str
      const offset = localStorage.getItem('nz-sys-timezone')
      const format = fmt || localStorage.getItem('nz-default-dateFormat')
      return moment.tz(timestamp, offset).format(format)
    },
    momentStrToTimestamp (str, fmt) {
      const offset = localStorage.getItem('nz-sys-timezone')
      const format = fmt || localStorage.getItem('nz-default-dateFormat')
      const date = moment.tz(str, format, offset).valueOf()
      return date
    },
    momentDays (timestamp) { // 只接受时间戳
      const offset = localStorage.getItem('nz-sys-timezone')
      return moment.tz(timestamp, offset).day()
    },
    momentSetDay (timestamp, day, fmt) { // 只接受时间戳
      const offset = localStorage.getItem('nz-sys-timezone')
      const format = fmt || localStorage.getItem('nz-default-dateFormat')
      return moment.tz(timestamp, offset).day(day).format(format)
    },
    momentSetMonthDate (timestamp, date = 1, fmt) { // 只接受时间戳
      const offset = localStorage.getItem('nz-sys-timezone')
      const format = fmt || localStorage.getItem('nz-default-dateFormat')
      const month = moment.tz(timestamp, offset).month()
      const year = moment.tz(timestamp, offset).year()
      const day = date > 28 ? this.formatDate(year, month, date) : date
      return moment.tz(timestamp, offset).date(day).format(format)
    },
    formatDate (year, month, date) {
      if (date < 28) {
        return date
      } else {
        const isRunYear = ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0)
        let day = 0
        const myMonth = month + 1
        switch (myMonth) {
          case 1:
          case 3:
          case 5:
          case 7:
          case 8:
          case 10:
          case 12:
            if (date > 31) {
              day = 31
            } else {
              day = date
            }
            break
          case 4:
          case 6:
          case 9:
          case 11:
            if (date > 30) {
              day = 30
            } else {
              day = date
            }
            break
          case 2:
            if (date > 28) {
              if (!isRunYear) {
                day = 28
              } else {
                day = date > 29 ? 29 : date
              }
            } else {
              day = date
            }
            break
        }
        return day
      }
    },
    onCopy (txt) {
      this.$copyText(txt).then(() => {
        this.$message.success({ message: this.$t('overall.copySuccess') })
      })
    },
    animateCSS (node, animation, prefix = 'animate__') {
      // We create a Promise and return it
      return new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`
        node.classList.add(`${prefix}animated`, animationName)

        // When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd (event) {
          event.stopPropagation()
          node.classList.remove(`${prefix}animated`, animationName)
          resolve('Animation ended')
        }

        node.addEventListener('animationend', handleAnimationEnd, { once: true })
      })
    },
    handleLegendAlias (legend, aliasExpression, params) {
      const self = this
      const myParams = JSON.parse(JSON.stringify(params))
      myParams.$labels = JSON.parse(JSON.stringify(params))
      myParams.$value = myParams.value
      if (/\{\{.+\}\}/.test(aliasExpression)) {
        const labelValue = aliasExpression.replace(/(\{\{.+?\}\})/g, function (i) {
          const label = i.substr(i.indexOf('{{') + 2, i.indexOf('}}') - i.indexOf('{{') - 2)
          if (!legend) {
            return label
          }
          let value = null
          if (params && self.$lodash.get(myParams, label)) {
            value = self.$lodash.get(myParams, label)
          }
          if (label) {
            const reg = new RegExp(label + '=".+?"', 'g')
            if (reg.test(legend)) {
              const ans = legend.match(reg)
              let find = ''
              ans.forEach(item => {
                const index = legend.indexOf(item)
                if (legend[index - 1] !== '_') {
                  find = item
                }
              })
              value = find.substr(find.indexOf('"') + 1, find.lastIndexOf('"') - find.indexOf('"') - 1)
            }
          }
          return value || ''
        })
        return labelValue
      } else {
        if (!aliasExpression) {
          return legend
          // let result =legend.substr(legend.indexOf('"') + 1,legend.lastIndexOf('"') - legend.indexOf('"') - 1);
          // return result
        }
        return aliasExpression
      }
    },
    /* 时间条件查询--end */
    setSearchTime (key, nowType, cb) { // 设置searchTime
      if (this.$refs.pickTime) {
        const nowTimeType = nowType || this.$refs.pickTime.$refs.timePicker.nowTimeType
        this.nowTimeType = nowType || this.$refs.pickTime.$refs.timePicker.nowTimeType
        const type = nowTimeType.type
        const val = nowTimeType.value
        const oneDTimestamp = 24 * 60 * 60 * 1000
        if (type === 'relative') {
          const now = new Date(bus.computeTimezone(new Date().getTime()))
          let start = bus.timeFormate(now, 'YYYY-MM-DD') // 使用固定时间格式 方便添加  00:00:00 23:59:59
          let end = bus.timeFormate(now, 'YYYY-MM-DD HH:mm:ss')
          let unit = ''
          if (nowTimeType.id === 13) { // today
            unit = 't'
            end = start + ' 23:59:59'
            start += ' 00:00:00'
            start = this.momentTz(this.momentStrToTimestamp(start, 'YYYY-MM-DD HH:mm:ss'))
            end = this.momentTz(this.momentStrToTimestamp(end, 'YYYY-MM-DD HH:mm:ss'))
          }
          if (nowTimeType.id === 14) { // Yesterday
            unit = 't'
            end = start + ' 23:59:59'
            start += ' 00:00:00'
            start = this.momentTz(this.momentStrToTimestamp(start, 'YYYY-MM-DD HH:mm:ss') - oneDTimestamp)
            end = this.momentTz(this.momentStrToTimestamp(end, 'YYYY-MM-DD HH:mm:ss') - oneDTimestamp)
          }
          if (nowTimeType.id === 15) { // The day before yesterday
            unit = 't'
            end = start + ' 23:59:59'
            start += ' 00:00:00'
            start = this.momentTz(this.momentStrToTimestamp(start, 'YYYY-MM-DD HH:mm:ss') - 2 * oneDTimestamp)
            end = this.momentTz(this.momentStrToTimestamp(end, 'YYYY-MM-DD HH:mm:ss') - 2 * oneDTimestamp)
          }
          if (nowTimeType.id === 16) { // This day last week
            unit = 't'
            end = start + ' 23:59:59'
            start += ' 00:00:00'
            start = this.momentTz(this.momentStrToTimestamp(start, 'YYYY-MM-DD HH:mm:ss') - 7 * oneDTimestamp)
            end = this.momentTz(this.momentStrToTimestamp(end, 'YYYY-MM-DD HH:mm:ss') - 7 * oneDTimestamp)
          }
          if (nowTimeType.id === 17) { // This week
            unit = 'w'
            const noTime = this.momentStrToTimestamp(start + ' 00:00:00', 'YYYY-MM-DD HH:mm:ss')
            const nowDay = this.momentDays(noTime)
            end = start + ' 23:59:59'
            if (nowDay == 0) {
              start = this.momentSetDay(noTime, -6, 'YYYY-MM-DD')
              end = this.momentSetDay(noTime, 0, 'YYYY-MM-DD')
            } else {
              start = this.momentSetDay(noTime, 1, 'YYYY-MM-DD')
              end = this.momentSetDay(noTime, 7, 'YYYY-MM-DD')
            }
            start += ' 00:00:00'
            start = this.momentTz(this.momentStrToTimestamp(start, 'YYYY-MM-DD HH:mm:ss'))
            end = this.momentTz(this.momentStrToTimestamp(end, 'YYYY-MM-DD HH:mm:ss'))
          }
          if (nowTimeType.id === 18) { // Previous week
            unit = 'w'
            let noTime = this.momentStrToTimestamp(start + ' 00:00:00', 'YYYY-MM-DD HH:mm:ss')
            noTime = noTime - 7 * oneDTimestamp
            const nowDay = this.momentDays(noTime)
            if (nowDay == 0) { // 判断当前是否是周天 周天则为 -6 - 0 非周天 则是 1 - 7
              start = this.momentSetDay(noTime, -6, 'YYYY-MM-DD')
              end = this.momentSetDay(noTime, 0, 'YYYY-MM-DD')
            } else {
              start = this.momentSetDay(noTime, 1, 'YYYY-MM-DD')
              end = this.momentSetDay(noTime, 7, 'YYYY-MM-DD')
            }
            start += ' 00:00:00'
            end += ' 23:59:59'
            start = this.momentTz(this.momentStrToTimestamp(start, 'YYYY-MM-DD HH:mm:ss'))
            end = this.momentTz(this.momentStrToTimestamp(end, 'YYYY-MM-DD HH:mm:ss'))
          }
          if (nowTimeType.id === 19) { // this month
            unit = 'm'
            const noTime = this.momentStrToTimestamp(start + ' 00:00:00', 'YYYY-MM-DD HH:mm:ss')
            const endTime = this.momentStrToTimestamp(start + ' 23:59:59', 'YYYY-MM-DD HH:mm:ss')
            start = this.momentSetMonthDate(noTime, 1)
            end = this.momentSetMonthDate(endTime, 31)
          }
          if (nowTimeType.id === 20) { // Previous month 需要判断当前是否是 1号
            unit = 'm'
            const noTime = this.momentStrToTimestamp(start + ' 00:00:00', 'YYYY-MM-DD HH:mm:ss')
            end = this.momentStrToTimestamp(this.momentSetMonthDate(noTime, 1)) - 1000 // 当月1号 00:00:00 减1s 则是上月最后一天 23:59:59
            console.log(end, '1')
            start = this.momentSetMonthDate(end, 1, 'YYYY-MM-DD') + ' 00:00:00'
            console.log(start, '1')
            start = this.momentTz(this.momentStrToTimestamp(start, 'YYYY-MM-DD HH:mm:ss'))
            end = this.momentTz(end)
          }
          this.$set(this[key], 0, start)
          this.$set(this[key], 1, end)
          this.$set(this[key], 2, val + unit)
        } else if (type === 'minute') {
          const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - val))
          const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
          this.$set(this[key], 0, startTime)
          this.$set(this[key], 1, endTime)
          this.$set(this[key], 2, val + 'm')
        } else if (type === 'hour') {
          const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - val))
          const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
          this.$set(this[key], 0, startTime)
          this.$set(this[key], 1, endTime)
          this.$set(this[key], 2, val + 'h')
        } else if (type === 'date') {
          const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setDate(new Date(bus.computeTimezone(new Date().getTime())).getDate() - val))
          const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
          this.$set(this[key], 0, startTime)
          this.$set(this[key], 1, endTime)
          this.$set(this[key], 2, val + 'd')
        }
        console.log(this[key], 'mainMixin')
        this.$refs.pickTime.$refs.timePicker.searchTime = this[key]
      }
      if (cb) {
        this.cb()
      }
    }
  }
}
