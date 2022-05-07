import bus from '@/libs/bus'
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
  }
}
