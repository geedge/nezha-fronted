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
    }
  }
}
