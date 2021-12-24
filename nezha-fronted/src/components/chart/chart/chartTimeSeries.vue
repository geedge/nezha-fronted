<template>
  <div
    :class="legendPlacement"
    class="nz-chart__component nz-chart__component--time-series" @mouseenter="mouseEnterChart"
    @mouseleave="mouseLeaveChart"
  >
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas"></div>
    <chart-legend
      v-if="hasLegend"
      :chart-data="chartData"
      :chart-info="chartInfo"
      :legends="legends"
      :series="series"
      :is-fullscreen="isFullscreen"
    ></chart-legend>
  </div>
</template>

<script>
import legend from './legend'
import chartMixin from '@/components/chart/chartMixin'
import * as echarts from 'echarts'
import moment from 'moment-timezone'
import bus from '@/libs/bus'
import { formatScientificNotation } from '@/components/common/js/tools'
import chartDataFormat from '@/components/charts/chartDataFormat'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import { chartLegendPlacement } from '@/components/common/js/constants'
import { getChart, setChart } from '@/components/common/js/common'
import { initColor } from '@/components/chart/chart/tools'

export default {
  name: 'chart-time-series', // x轴是时间的图，包括折线、柱状、堆叠、散点
  components: {
    chartLegend: legend
  },
  props: {
    multipleTime: {},
    minusTime: {}
  },
  mixins: [chartMixin],
  data () {
    return {
      stackTotalColor: null,
      isStack: false,
      series: []
    }
  },
  computed: {
    hasLegend () {
      try {
        return [chartLegendPlacement.bottom, chartLegendPlacement.left, chartLegendPlacement.right].indexOf(this.chartInfo.param.legend.placement) > -1 && this.chartInfo.param.enable.legend
      } catch (e) {
        return false
      }
    },
    legendPlacement () {
      try {
        switch (this.chartInfo.param.legend.placement) {
          case 'left':
          case 'right':
          case 'bottom': {
            return `nz-chart__component--${this.chartInfo.param.legend.placement}`
          }
          default: return ''
        }
      } catch (e) {
        return ''
      }
    }
  },
  methods: {
    initChart (chartOption = this.chartOption) {
      this.legends = []
      this.series = chartOption.series = this.handleTimeSeries(this.chartInfo, chartOption.series[0], this.chartData) // 生成series和legends
      if (this.isNoData) {
        return
      }
      const { minTime, maxTime, minValue, maxValue, copies, unit, dot } = this.getMinMaxFromData(this.chartData, this.chartInfo.unit) // 此处时间是秒
      chartOption.xAxis.axisLabel.formatter = this.xAxisLabelFormatter(minTime, maxTime)// 需转为毫秒
      chartOption.tooltip.formatter = this.tooltipFormatter(this.chartInfo.param.stack)
      chartOption.tooltip.position = this.tooltipPosition
      chartOption.yAxis.axisLabel.formatter = this.yAxisLabelFormatter(minValue, maxValue, copies, unit, dot)
      chartOption.yAxis.minInterval = chartDataFormat.Interval(maxValue, copies, unit.type, 'min')
      chartOption.yAxis.maxInterval = chartDataFormat.Interval(maxValue, copies, unit.type, 'max') * Math.ceil(chartOption.series.length / 5)
      if (chartOption.toolbox.feature) {
        chartOption.toolbox.feature.myStack.iconStyle.borderColor = this.isStack ? this.toolboxIconColor.active : this.toolboxIconColor.inactive
        chartOption.toolbox.feature.myStack.onclick = this.stackEvent() // 自定义stack事件
      }
      /* 使用setTimeout延迟渲染图表，避免样式错乱 */
      setTimeout(() => {
        const myChart = this.isInit ? echarts.init(document.getElementById(`chart-canvas-${this.chartId}`)) : getChart(this.chartId)
        myChart.setOption(chartOption)
        this.isInit && setChart(this.chartId, myChart) // 缓存；不使用vue的data是为避免整个chart被监听导致卡顿
        this.isInit = false
      }, 200)
    },
    getMinMaxFromData (originalDatas, chartUnit = 2) {
      let minTime = null
      let maxTime = null
      let minValue = null
      let maxValue = null
      // 将数据提为二维数组
      let datas = []
      let seriesIndex = 0
      originalDatas.forEach((originalData, expressionIndex) => {
        originalData.forEach((data, dataIndex) => {
          if (seriesIndex >= this.series.length) {// 只取跟series 一样长度作比较
            return
          }
          seriesIndex++
          datas = [...datas, ...data.values]
        })
      })
      const timeSorted = datas.sort((a, b) => {
        return a[0] - b[0]
      })
      const valueSorted = datas.sort((a, b) => {
        return a[1] - b[1]
      })
      minTime = timeSorted.length ? timeSorted[0][0] : ''
      maxTime = timeSorted.length ? timeSorted[timeSorted.length - 1][0] : ''
      minValue = valueSorted.length ? valueSorted[0][1] : ''
      maxValue = valueSorted.length ? valueSorted[valueSorted.length - 1][1] : ''
      const unit = chartDataFormat.getUnit(chartUnit)
      maxValue = chartDataFormat.formatDatas(maxValue, unit.type, 'ceil', unit.ascii) // 取最大值后 需要对其进行取整
      let oldValue = maxValue
      let dot = 0
      if (oldValue == 1) {
        dot++
      }
      if (oldValue > 10) {
        while (oldValue > 10) {
          oldValue = oldValue / 10
        }
      } else if (oldValue < 1 && maxValue !== 0) {
        while (oldValue < 1 && oldValue > 0) {
          oldValue = oldValue * 10
          dot++
        }
        maxValue = Math.floor(oldValue) / Math.pow(10, dot)
        dot++
      }
      const copies = chartDataFormat.copies(oldValue, unit.type)
      return { minTime, maxTime, minValue, maxValue, copies, unit, dot }
    },
    xAxisLabelFormatter (minTime, maxTime) {
      return function (val, index) {
        const value = val * 1000
        let offset = localStorage.getItem('nz-sys-timezone')
        offset = moment.tz(offset).format('Z')
        offset = Number.parseInt(offset)
        const localOffset = new Date().getTimezoneOffset() * 60 * 1000 * -1 // 默认 一分钟显示时区偏移的结果
        const tData = new Date(value - localOffset + offset * 60 * 60 * 1000)
        let hour = tData.getHours()
        hour = hour > 9 ? hour : '0' + hour // 加0补充为两位数字
        let minute = tData.getMinutes()
        minute = minute > 9 ? minute : '0' + minute // 如果分钟小于10,则在前面加0补充为两位数字
        if (minTime !== null && maxTime !== null) {
          const diffSec = (maxTime - minTime) / 1000
          const secOneDay = 24 * 60 * 60// 1天的秒数
          const secOneMonth = secOneDay * 30// 30天的秒数
          if (diffSec <= secOneDay) { // 同一天
            return [hour, minute].join(':')
          } else if (diffSec < secOneMonth) { // 大于1天，小于30天
            return [tData.getMonth() + 1, tData.getDate()].join('/') + ' ' + [hour, minute].join(':')
          } else { // 大于等于30天
            return [tData.getMonth() + 1, tData.getDate()].join('/')
          }
        } else {
          return [tData.getFullYear(), tData.getMonth() + 1, tData.getDate()].join('/') + '\n' +
            [hour, minute].join(':')
        }
      }
    },
    tooltipFormatter (hasTotal) { // 堆叠图需要total数据
      const self = this
      return function (params) {
        let str = '<div class="nz-chart__tooltip">'
        let sum = 0
        let flag = true
        params.forEach((item, i) => {
          const seriesName = item.seriesName.split('-')[0]
          if (i === 0) {
            const value = bus.computeTimezone(item.data[0] * 1000)
            const tData = new Date(value)
            str += '<div style="margin-bottom: 5px">'
            str += bus.timeFormate(tData)
            str += '</div>'
          }
          if (flag && item.seriesName.indexOf('Previous') !== -1) {
            flag = false
            const value = bus.computeTimezone(item.data[0] * 1000 - self.minusTime)
            const tData = new Date(value)
            str += '<div style="border: 1px solid #EEEEEE"></div>'
            str += '<div style="margin-top: 5px;margin-bottom: 5px">'
            str += bus.timeFormate(tData)
            str += '</div>'
          }
          const color = self.colorList[item.seriesIndex]
          const previousItem = params.find((series) => ('Previous ' + item.seriesName) === series.seriesName)
          let paramsDot = bus.countDecimals(item.data[1])
          if (paramsDot < self.chartDot) {
            paramsDot = self.chartDot
          } else if (paramsDot > 6) {
            paramsDot = 6
          }
          const val = formatScientificNotation(item.data[1], paramsDot)
          sum += isNaN(self.numberWithEConvent(val)) ? 0 : parseFloat(self.numberWithEConvent(val))
          let previousDom = ''
          if (previousItem) {
            const previousVal = formatScientificNotation(previousItem.data[1], paramsDot)
            // console.log(previousVal, item.data[1])
            let minusVal = 0
            let operator
            if (previousVal <= val) {
              minusVal = val - previousVal
              operator = '+'
            } else {
              minusVal = previousVal - val
              operator = '-'
            }
            previousDom = `
              <span>${operator}${chartDataFormat.getUnit(self.chartInfo.unit ? self.chartInfo.unit : 2).compute(minusVal, null, -1, paramsDot)}</span>
            `
          }
          str += `
            <div class="tooltip__row">
              <div class="row__label">
                <span class="row__color-block" style="background-color: ${color}"></span>
                <span>${seriesName}</span>
              </div>
              <div class="row__value">
                <span>${chartDataFormat.getUnit(self.chartInfo.unit ? self.chartInfo.unit : 2).compute(val, null, -1, paramsDot)}</span>
                ${previousDom}
              </div>
            </div>
          `
        })
        if (hasTotal) {
          if (!self.stackTotalColor) {
            self.stackTotalColor = randomcolor()
          }
          sum = parseFloat(Number(sum).toFixed(2))

          str += `
            <div class="tooltip__row">
              <div class="row__label">
                <span class="row__color-block" style="background-color: ${self.stackTotalColor}"></span>
                <span>${self.$t('dashboard.panel.chartTotal')}</span>
              </div>
              <div class="row__value">
                <span>${chartDataFormat.getUnit(self.chartInfo.unit ? self.chartInfo.unit : 2).compute(sum, null, self.chartDot)}</span>
              </div>
            </div>
          `
        }

        str += '</div>'
        return str
      }
    },
    yAxisLabelFormatter (minValue, maxValue, copies, unit, dot) {
      const self = this
      return function (val, index) {
        const value = formatScientificNotation(val, 2)
        let chartUnit = self.chartInfo.unit
        chartUnit = chartUnit || 2
        const unit = chartDataFormat.getUnit(chartUnit)
        // dot是判断最大值是否 小于1 大于1 默认是2 小于1 需要判断最大值是小数点后面几位
        if (chartDataFormat.Interval(maxValue, copies, unit.type, 'min') < 1 && dot < 2) { // 当其小于1 且 dot < 2 默认給2 如 0.9 dot为1
          dot = 2
        }
        if (!dot) { //  默认是2
          dot = 2
        }
        dot = bus.countDecimals(value)
        if (dot < self.chartDot) { // 根据具体值计算
          dot = self.chartDot
        }
        return unit.compute(value, index, -1, dot)
      }
    },
    stackEvent () {
      const self = this
      // 若isStack=true,则将stack取消，并删掉tooltip的total；否则激活stack。
      // stack状态改变后，icon颜色需要改变
      return function () {
        const myChart = getChart(self.chartId)
        const option = myChart.getOption()
        // 改变颜色
        option.toolbox[0].feature.myStack.iconStyle.borderColor = self.isStack ? self.toolboxIconColor.inactive : self.toolboxIconColor.active
        // 切换stack状态
        option.series.forEach((s, i) => {
          self.isStack ? (s.stack = i) : (s.stack = 'Total')
        })
        self.isStack = !self.isStack
        // 改变tooltip
        option.tooltip[0].formatter = self.tooltipFormatter(self.isStack)
        myChart.setOption(option)
      }
    },
    resize () {
      getChart(this.chartId).resize()
    }
  },
  mounted () {
    this.chartOption.color || (this.chartOption.color = initColor(20))
    this.colorList = this.chartOption.color
    try {
      this.isStack = this.chartInfo.param.stack
    } catch (e) {}
    this.chartInfo.loaded && this.initChart(this.chartOption)
  }
}
</script>
