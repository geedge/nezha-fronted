<template>
  <div
    :class="legendPlacement"
    class="nz-chart__component nz-chart__component--time-series" @mouseenter="mouseEnterChart"
    @mouseleave="mouseLeaveChart"
  >
    <div :id="`chart-canvas-${chartInfo.id}`" class="chart__canvas"></div>
    <chart-legend
      v-if="hasLegend"
      :chart-data="chartData"
      :chart-info="chartInfo"
      :legends="legends"
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
  mixins: [chartMixin],
  data () {
    return {
      stackTotalColor: null,
      isStack: false
    }
  },
  computed: {
    hasLegend () {
      try {
        return [chartLegendPlacement.bottom, chartLegendPlacement.left, chartLegendPlacement.right].indexOf(this.chartInfo.param.legend.placement) > -1
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
    initChart (chartOption) {
      this.legends = []
      chartOption.series = this.handleTimeSeries(this.chartInfo, chartOption.series[0], this.chartData) // 生成series和legends

      const { minTime, maxTime, minValue, maxValue } = this.getMinMaxFromData(this.chartData) // 此处时间是秒
      chartOption.xAxis.axisLabel.formatter = this.xAxisLabelFormatter(minTime * 1000, maxTime * 1000) // 需转为毫秒
      chartOption.tooltip.formatter = this.tooltipFormatter(this.chartInfo.param.stack)
      chartOption.yAxis.axisLabel.formatter = this.yAxisLabelFormatter(minValue, maxValue)
      if (chartOption.toolbox.feature) {
        chartOption.toolbox.feature.myStack.iconStyle.borderColor = this.isStack ? this.toolboxIconColor.active : this.toolboxIconColor.inactive
        chartOption.toolbox.feature.myStack.onclick = this.stackEvent() // 自定义stack事件
      }
      /* 使用setTimeout延迟渲染图表，避免样式错乱 */
      setTimeout(() => {
        const myChart = this.isInit ? echarts.init(document.getElementById(`chart-canvas-${this.chartInfo.id}`)) : getChart(this.chartInfo.id)
        myChart.setOption(chartOption)
        setChart(this.chartInfo.id, myChart) // 缓存；不使用vue的data是为避免整个chart被监听导致卡顿
      }, 200)
    },
    getMinMaxFromData (originalDatas) {
      let minTime = null
      let maxTime = null
      let minValue = null
      let maxValue = null
      // 将数据提为二维数组
      let datas = []
      originalDatas.forEach((originalData, expressionIndex) => {
        originalData.forEach((data, dataIndex) => {
          datas = [...datas, ...data.values]
        })
      })
      const timeSorted = datas.sort((a, b) => {
        return a[0] - b[0]
      })
      const valueSorted = datas.sort((a, b) => {
        return a[1] - b[1]
      })
      minTime = timeSorted[0][0]
      maxTime = timeSorted[timeSorted.length - 1][0]
      minValue = valueSorted[0][1]
      maxValue = valueSorted[valueSorted.length - 1][1]
      return { minTime, maxTime, minValue, maxValue }
    },
    xAxisLabelFormatter (minTime, maxTime) {
      return function (value, index) {
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
        params.forEach((item, i) => {
          const color = self.colorList[item.seriesIndex]
          const previousItem = params.find((series) => ('Previous ' + item.seriesName) === series.seriesName)
          let paramsDot = bus.countDecimals(item.data[1])
          if (paramsDot < self.chartDot) {
            paramsDot = self.chartDot
          } else if (paramsDot > 6) {
            paramsDot = 6
          }
          const val = formatScientificNotation(item.data[1], paramsDot)
          sum += self.numberWithEConvent(val)

          let previousDom = ''
          if (previousItem) {
            const previousVal = formatScientificNotation(item.data[1], paramsDot)
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
                <span>${item.seriesName}</span>
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
    yAxisLabelFormatter (minValue, maxValue) {
      const self = this
      return function (val, index) {
        const value = formatScientificNotation(val, 2)
        let chartUnit = self.chartInfo.unit
        chartUnit = chartUnit || 2
        const unit = chartDataFormat.getUnit(chartUnit)
        // TODO 弄清楚dot逻辑
        /* if (chartDataFormat.Interval(maxValue, copies, unit.type, 'min') < 1 && dot < 2) {
          dot = 2
        }
        if (dot == 0) {
          dot = 1
        }
        dot = bus.countDecimals(value)
        if (dot < self.chartDot) {
          dot = self.chartDot
        } */
        return unit.compute(value, index, -1, 2)
      }
    },
    stackEvent () {
      const self = this
      // 若isStack=true,则将stack取消，并删掉tooltip的total；否则激活stack。
      // stack状态改变后，icon颜色需要改变
      return function () {
        const myChart = getChart(self.chartInfo.id)
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
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        if (!this.isInit) {
          this.initChart(this.chartOption)
        }
      }
    }
  },
  mounted () {
    this.chartOption.color || (this.chartOption.color = initColor(20))
    this.colorList = this.chartOption.color
    try {
      this.isStack = this.chartInfo.param.stack
    } catch (e) {}
    this.initChart(this.chartOption)
  }
}
</script>
