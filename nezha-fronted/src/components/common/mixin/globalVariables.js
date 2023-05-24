import bus from '@/libs/bus'
import { stringTimeParseToUnixMs } from '@/components/common/js/tools.js'
export default {
  data () {
    return {
      globalVariables: [
        { name: '$G.dashboard.name', value: null }, // dashboard名称
        { name: '$G.from.ms', value: null }, // 选定时间开始时间，单位ms
        { name: '$G.from.s', value: null }, // 选定时间开始时间，单位s
        { name: '$G.to.ms', value: null }, // 选定时间结束时间，单位ms
        { name: '$G.to.s', value: null }, // 选定时间结束时间，单位s
        { name: '$G.from.date', value: null }, // 选定时间开始时间，根据系统设定时间格式显示
        { name: '$G.to.date', value: null }, // 选定时间结束时间，根据系统设定时间格式显示
        { name: '$G.range.ms', value: null }, // to - from ，单位ms
        { name: '$G.range.s', value: null }, // to - from，单位s
        { name: '$G.range.text', value: null }, // to - from ,文字显示，如：1h24min
        { name: '$G.chart.name', value: null }, // chart 名称
        { name: '$G.interval.ms', value: null }, // 计算的step参数值，单位ms
        { name: '$G.interval.s', value: null } // 计算的step参数值，单位s
      ]
    }
  },
  mounted () {
    this.setGlobalVariablesValue()
  },
  methods: {
    setGlobalVariablesValue (searchTime) {
      const timeRange = searchTime || this.timeRange
      if (!timeRange) {
        return
      }
      this.globalVariables.forEach(item => {
        switch (item.name) {
          case '$G.dashboard.name': {
            item.value = this.chartInfo.dashboard ? this.chartInfo.dashboard.name : ''
            break
          }
          case '$G.from.ms': {
            item.value = stringTimeParseToUnixMs(bus.formateTimeToTime(timeRange[0]))
            break
          }
          case '$G.from.s': {
            item.value = this.$stringTimeParseToUnix(bus.formateTimeToTime(timeRange[0]))
            break
          }
          case '$G.to.ms': {
            item.value = stringTimeParseToUnixMs(bus.formateTimeToTime(timeRange[1]))
            break
          }
          case '$G.to.s': {
            item.value = this.$stringTimeParseToUnix(bus.formateTimeToTime(timeRange[1]))
            break
          }
          case '$G.from.date': {
            item.value = bus.timeFormate(timeRange[0])
            break
          }
          case '$G.to.date': {
            item.value = bus.timeFormate(timeRange[1])
            break
          }
          case '$G.range.ms': {
            item.value = stringTimeParseToUnixMs(bus.formateTimeToTime(timeRange[1])) - stringTimeParseToUnixMs(bus.formateTimeToTime(timeRange[0]))
            break
          }
          case '$G.range.s': {
            item.value = this.$stringTimeParseToUnix(bus.formateTimeToTime(timeRange[1])) - this.$stringTimeParseToUnix(bus.formateTimeToTime(timeRange[0]))
            break
          }
          case '$G.range.text': {
            item.value = this.rangeText(bus.formateTimeToTime(timeRange[0]), bus.formateTimeToTime(timeRange[1]))
            break
          }
          case '$G.chart.name': {
            item.value = this.chartInfo.varName
            break
          }
          case '$G.interval.ms': {
            const step = bus.getStep(bus.formateTimeToTime(timeRange[0]), bus.formateTimeToTime(timeRange[1]))
            const unit = step[step.length - 1]
            let value
            if (unit === 's') {
              value = parseInt(step) * 1000
            } else if (unit === 'm') {
              value = parseInt(step) * 1000 * 60
            }
            item.value = value
            break
          }
          case '$G.interval.s': {
            const step = bus.getStep(bus.formateTimeToTime(timeRange[0]), bus.formateTimeToTime(timeRange[1]))
            const unit = step[step.length - 1]
            let value
            if (unit === 's') {
              value = parseInt(step)
            } else if (unit === 'm') {
              value = parseInt(step) * 60
            }
            item.value = value
            break
          }
        }
      })
    },
    globalVariablesReplace (expression) {
      let str = expression
      if (str) {
        this.globalVariables.forEach(item => {
          const reg = new RegExp('{{\\' + item.name + '}}', 'g')
          if (item.value != null) {
            str = str.replace(reg, item.value)
          }
        })
      }
      return str
    },
    rangeText (startTime, endTime) {
      const range = this.$stringTimeParseToUnix(endTime) - this.$stringTimeParseToUnix(startTime)
      let time = parseInt(range) + 's'
      if (parseInt(range) > 60) {
        const second = parseInt(range) % 60
        let min = parseInt(range / 60)
        time = min + 'min' + second + 's'

        if (min > 60) {
          min = parseInt(range / 60) % 60
          let hour = parseInt(parseInt(range / 60) / 60)
          time = hour + 'h' + min + 'min'

          if (hour > 24) {
            hour = parseInt(parseInt(range / 60) / 60) % 24
            const day = parseInt(parseInt(parseInt(range / 60) / 60) / 24)
            time = day + 'd' + hour + 'h'
          }
        }
      }
      return time
    }
  }
}
