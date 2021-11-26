<template>
  <div :class="legendPlacement" class="nz-chart__component nz-chart__component--time-series">
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
import lodash from 'lodash'
import moment from 'moment-timezone'
import bus from '@/libs/bus'
import { formatScientificNotation } from '@/components/common/js/tools'
import chartDataFormat from '@/components/charts/chartDataFormat'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import { chartType, chartLegendPlacement } from '@/components/common/js/constants'
import { setChart } from '@/components/common/js/common'
import { initColor } from '@/components/chart/chart/tools'

let myChart = null
export default {
  name: 'chart-time-series', // x轴是时间的图，包括折线、柱状、堆叠、散点
  components: {
    chartLegend: legend
  },
  mixins: [chartMixin],
  data () {
    return {
      stackTotalColor: null
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

      const { minTime, maxTime, minValue, maxValue } = this.getMinMaxFromData(this.chartData[0])
      chartOption.xAxis.axisLabel.formatter = this.xAxisLabelFormatter(minTime, maxTime)
      chartOption.tooltip.formatter = this.tooltipFormatter()
      chartOption.yAxis.axisLabel.formatter = this.yAxisLabelFormatter(minValue, maxValue)
      setTimeout(() => {
        myChart = echarts.init(document.getElementById(`chart-canvas-${this.chartInfo.id}`))
        setChart(this.chartInfo.id, myChart) // 缓存；不使用vue的data是为避免整个chart被监听导致卡顿
        myChart.setOption(chartOption)
      })
    },
    getMinMaxFromData (originalData) {
      let minTime = null
      let maxTime = null
      let minValue = null
      let maxValue = null
      if (!lodash.isEmpty(originalData)) {
        minTime = originalData[0][0]
        maxTime = originalData[originalData.length - 1][0]
        const sorted = originalData.sort((a, b) => {
          return a[1] - b[1]
        })
        minValue = sorted[0][1]
        maxValue = sorted[sorted.length - 1][1]
      }
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
    tooltipFormatter () {
      const self = this
      return function (params) {
        let str = '<div>'
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
          // TODO 改成class
          str += '<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">'
          str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${color};}'></span>${item.seriesName}  </div>`
          str += '<div style="padding-left: 10px;min-width: 75px;text-align: right">'
          str += chartDataFormat.getUnit(self.chartInfo.unit ? self.chartInfo.unit : 2).compute(val, null, -1, paramsDot)
          if (previousItem) {
            str += '<span style="padding-left: 10px; display: inline-block;width: 65px;text-align: right">'
            const previousval = formatScientificNotation(item.data[1], paramsDot)
            let minusVal = 0
            if (previousval <= val) {
              minusVal = val - previousval
              str += '+'
            } else {
              minusVal = previousval - val
              str += '-'
            }

            str += chartDataFormat.getUnit(self.chartInfo.unit ? self.chartInfo.unit : 2).compute(minusVal, null, -1, paramsDot)
            str += '</span>'
          }
          str += '</div>'
          str += '</div>'
        })
        if (self.chartInfo.type === chartType.stackArea) {
          if (!self.stackTotalColor || self.stackTotalColor == '') {
            self.stackTotalColor = randomcolor()
          }
          sum = parseFloat(Number(sum).toFixed(2))
          // TODO 改成class
          str += '<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">'
          str += '<div style="line-height: 18px; font-size: 12px;padding-left:0px;">'
          str += `<span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${self.stackTotalColor};}'></span>`
          str += self.$t('dashboard.panel.chartTotal')
          str += '</div>'
          str += '<div style="padding-left: 10px;">'
          str += chartDataFormat.getUnit(self.chartInfo.unit ? self.chartInfo.unit : 2).compute(sum, null, self.chartDot)
          str += '</div>'
          str += '</div>'
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
    }
  },
  mounted () {
    this.chartOption.color || (this.chartOption.color = initColor(20))
    this.colorList = this.chartOption.color
    this.initChart(this.chartOption)
  }
}
</script>
