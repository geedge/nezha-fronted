<template>
  <div
    :class="legendPlacement"
    class="nz-chart__component nz-chart__component--time-series" @mouseenter="mouseEnterChart"
    @mouseleave="mouseLeaveChart"
  >
    <div class="chart__canvas" style="position:relative">
      <div :id="`chart-canvas-${chartId}`"></div>
      <!-- 右y轴name -->
      <p class="rightYAxis-name" v-if="hasRightYAxis">
        <span>{{chartInfo.param.rightYAxis.label}}</span>
      </p>
    </div>
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
import chartDataFormat from '@/components/chart/chartDataFormat'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import { chartLegendPlacement } from '@/components/common/js/constants'
import { getChart, setChart, chartCache } from '@/components/common/js/common'
import { initColor } from '@/components/chart/chart/tools'
import lodash from 'lodash'

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
      stackTotalColorRight: null,
      isStack: false,
      hasRightYAxis: false
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
  watch: {
  // 监听当前鼠标所在的图表id变化
    '$store.state.panel.currentMousemove': {
      handler (n) {
        // 判断是否是当前鼠标所在的图表
        if (n === this.chartId) {
          let option = {}
          for (const key in chartCache) {
            if (!chartCache[key] || chartCache[key].group !== 'timeSeriesGroup') {
              continue
            }
            if (chartCache[key] === getChart(this.chartId)) {
              option = {
                tooltip: {
                  className: 'chart-time-series'
                }
              }
            } else {
              option = {
                tooltip: {
                  className: 'chart-time-series hide'
                }
              }
            }
            chartCache[key].setOption(option)
          }
        }
      }
    }
  },
  methods: {
    initChart (chartOptions = this.chartOption) {
      try {
        this.isStack = this.chartInfo.param.stack
      } catch (e) {}
      const chartOption = lodash.cloneDeep(chartOptions)
      if (this.chartInfo.isAlertMessage) {
        chartOption.title = {
          show: true,
          text: this.$t('project.endpoint.dialogTitle'),
          top: 20
        }
        chartOption.grid.top = 70
        chartOption.toolbox.top = 20
      }
      this.legends = []
      this.series = chartOption.series = this.handleTimeSeries(this.chartInfo, chartOption.series[0], this.chartData) // 生成series和legends
      chartOption.color = this.colorList
      if (!this.series.length) {
        this.isNoData = true
        this.$emit('chartIsNoData', this.isNoData)
      }
      if (this.isNoData) {
        return
      }
      const decimals = this.chartInfo.param.decimals || 2
      const { minTime, maxTime, minValue, maxValue, copies, unit, dot } = this.getMinMaxFromData(this.chartData, this.chartInfo.unit) //
      chartOption.xAxis.axisLabel.formatter = this.xAxisLabelFormatter(minTime, maxTime)// 需转为毫秒
      chartOption.tooltip.formatter = this.tooltipFormatter(this.chartInfo.param.stack)
      chartOption.tooltip.position = this.tooltipPosition
      if (navigator.userAgent.match(/Mobi/i) ||
        navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/iPhone/i)) {
        chartOption.tooltip.confine = true
        chartOption.tooltip.appendToBody = false
        delete chartOption.tooltip.position
      }
      // 左y轴
      chartOption.yAxis[0].axisLabel.formatter = this.yAxisLabelFormatter(minValue, maxValue, copies, unit, decimals)

      chartOption.yAxis[0].min = this.chartInfo.param.min ? this.chartInfo.param.min : undefined
      chartOption.yAxis[0].max = this.chartInfo.param.max ? this.chartInfo.param.max : undefined

      // 右y轴
      if (this.chartInfo.param.enable.rightYAxis) {
        // 如果全都为右y轴数据 则右y轴显示网格
        const allRight = this.series.every(item => item.yAxisIndex == 1)
        chartOption.yAxis[1].splitLine.show = allRight

        const unit = chartDataFormat.getUnit(lodash.get(this, 'chartInfo.param.rightYAxis.unit', 2))
        chartOption.yAxis[1].axisLabel.formatter = this.yAxisLabelFormatter(undefined, undefined, undefined, unit, decimals)
        chartOption.yAxis[1].min = this.chartInfo.param.rightYAxis.min ? this.chartInfo.param.rightYAxis.min : undefined
        chartOption.yAxis[1].max = this.chartInfo.param.rightYAxis.max ? this.chartInfo.param.rightYAxis.max : undefined

        // 有右y轴数据则显示name
        this.hasRightYAxis = this.series.some(item => item.yAxisIndex == 1)
      }

      if (chartOption.toolbox.feature) {
        chartOption.toolbox.feature.myStack.iconStyle.borderColor = this.isStack ? this.toolboxIconColor.active : this.toolboxIconColor.inactive
        chartOption.toolbox.feature.myStack.onclick = this.stackEvent() // 自定义stack事件
      }
      /* 使用setTimeout延迟渲染图表，避免样式错乱 */
      setTimeout(() => {
        const myChart = this.isInit ? echarts.init(document.getElementById(`chart-canvas-${this.chartId}`)) : getChart(this.chartId)
        if (!myChart) {
          return
        }
        myChart.clear()
        myChart.setOption(chartOption)
        this.isInit && setChart(this.chartId, myChart) // 缓存；不使用vue的data是为避免整个chart被监听导致卡顿
        this.$store.commit('setCurrentMousemove', 0)
        if (this.isInit && !this.isFullscreen) {
          // timeSeries类型图表设置group 用于多表联动
          myChart.group = 'timeSeriesGroup'
          myChart.getZr().on('mousemove', params => {
            if (this.$store.state.panel.isConnect !== 'crosshair') {
              return false
            }
            // crosshair 模式才会执行
            if (this.$store.state.panel.currentMousemove !== this.chartId) {
              this.$store.commit('setCurrentMousemove', this.chartId)
            }
          })
        }
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
          if (seriesIndex >= this.series.length) { // 只取跟series 一样长度作比较
            return
          }
          seriesIndex++
          if (!data.values) {
            data.values = []
          }
          datas = [...datas, ...data.values]
        })
      })
      const timeSorted = this.$loadsh.sortBy(datas, function (o) { return o[0] })
      const valueSorted = datas.sort((a, b) => {
        const a1 = isNaN(a[1]) || !a[1] ? 0 : Number(a[1])
        const b1 = isNaN(b[1]) || !b[1] ? 0 : Number(b[1])
        return a1 - b1
      })
      minTime = timeSorted.length ? timeSorted[0][0] : ''
      maxTime = timeSorted.length ? timeSorted[timeSorted.length - 1][0] : ''
      minValue = valueSorted.length ? valueSorted[0][1] : 0
      maxValue = valueSorted.length ? valueSorted[valueSorted.length - 1][1] : 0
      const unit = chartDataFormat.getUnit(chartUnit)
      minValue = minValue > 0 ? 0 : minValue
      if (!isNaN(maxValue)) {
        maxValue = Number(maxValue)
      } else {
        maxValue = 0
      }
      if (!isNaN(minValue)) {
        minValue = Number(minValue)
      } else {
        minValue = 0
      }
      if (maxValue < 0) {
        maxValue = Math.abs(maxValue)
      }
      if (Math.abs(minValue) > Math.abs(maxValue)) {
        maxValue = Math.abs(minValue)
      }
      maxValue = maxValue - minValue
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
      const copies = chartDataFormat.copies(Number(oldValue), unit.type)
      return { minTime, maxTime, minValue, maxValue, copies, unit, dot }
    },
    xAxisLabelFormatter (minTime, maxTime) {
      const self = this
      return function (val, index) {
        const value = val * 1000
        let offset = localStorage.getItem('nz-sys-timezone')
        offset = moment.tz(offset).format('Z')
        offset = Number.parseInt(offset)
        const localOffset = new Date().getTimezoneOffset() * 60 * 1000 * -1 // 默认 一分钟显示时区偏移的结果
        // if (window.dataJson) {
        //   offset = new Date().getTimezoneOffset() * -1 / 60
        // }
        const tData = new Date(value - localOffset + offset * 60 * 60 * 1000)
        let hour = tData.getHours()
        hour = hour > 9 ? hour : '0' + hour // 加0补充为两位数字
        let minute = tData.getMinutes()
        minute = minute > 9 ? minute : '0' + minute // 如果分钟小于10,则在前面加0补充为两位数字
        if (minTime !== null && maxTime !== null) {
          const diffSec = (maxTime - minTime)
          const secOneDay = 24 * 60 * 60// 1天的秒数
          const secOneMonth = secOneDay * 30// 30天的秒数
          const dateFormatStr = self.timeFormatMain.split(' ')[0]
          let str = ''
          const month = tData.getMonth() + 1
          const day = tData.getDate()
          if (dateFormatStr === 'DD/MM/YYYY') {
            str += [day, month].join('/')
          } else if (dateFormatStr === 'MM/DD/YYYY') {
            str += [month, day].join('/')
          } else {
            str += [month, day].join('-')
          }
          if (diffSec <= secOneDay) { // 同一天
            return [hour, minute].join(':')
          } else if (diffSec < secOneMonth) { // 大于1天，小于30天
            return str + '\n' + [hour, minute].join(':')
          } else { // 大于等于30天
            return str
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
        const decimals = self.chartInfo.param.decimals || 2
        let str = '<div class="nz-chart__tooltip">'
        // 区分左y轴右y轴
        params.forEach(item => {
          if (self.series[item.seriesIndex]) {
            item.yAxisIndex = self.series[item.seriesIndex].yAxisIndex
          }
        })
        // 排序先展示左y轴
        params.sort((a, b) => a.yAxisIndex - b.yAxisIndex)
        // 分割
        const rightYAxisIndex = params.findIndex(item => item.yAxisIndex == 1)
        let leftYAxis = []
        let rightYAxis = []
        if (rightYAxisIndex != -1) {
          leftYAxis = params.slice(0, rightYAxisIndex)
          rightYAxis = params.slice(rightYAxisIndex)
        } else {
          leftYAxis = params
        }
        handler(leftYAxis, 'left')
        handler(rightYAxis, 'right')
        function handler (arr, type) {
          if (!arr.length) {
            return
          }
          let sum = 0
          let flag = true
          arr.forEach((item, i) => {
            let unit = self.chartInfo.unit ? self.chartInfo.unit : 2
            if (type == 'right') {
              unit = lodash.get(self, 'chartInfo.param.rightYAxis.unit', 2)
            }
            const nameArr = item.seriesName.split('-')
            if (nameArr.length > 1) {
              nameArr.splice(nameArr.length - 1, 1)
            }
            const seriesName = nameArr.join('-')
            if (i === 0 && item.seriesName.indexOf('Previous') === -1 && type == 'left') {
              const value = bus.computeTimezone(item.data[0] * 1000)
              const tData = new Date(value)
              str += '<div class="tooltip-title" style="margin-bottom: 5px">'
              str += bus.timeFormate(tData)
              str += '</div>'
            }
            // 两条y轴数据分割线
            if (i == 0 && rightYAxisIndex != 0 && type == 'right') {
              str += '<div style="border: 1px solid #EEEEEE;margin-top: 5px;margin-bottom: 5px"></div>'
            }
            if (item.seriesName.indexOf('Previous') === -1 && type == 'right') {
              if (i == 0 && (rightYAxisIndex == 0 || (arr.some(item => item.seriesName.indexOf('Previous') !== -1)))) {
                const value = bus.computeTimezone(item.data[0] * 1000)
                const tData = new Date(value)
                str += '<div class="tooltip-title" style="margin-bottom: 5px">'
                str += bus.timeFormate(tData)
                str += '</div>'
              }
            }
            // Previous分割线
            if (i !== 0 && flag && item.seriesName.indexOf('Previous') !== -1) {
              str += '<div style="border: 1px solid #EEEEEE;margin-top: 5px;margin-bottom: 5px"></div>'
            }
            if (flag && item.seriesName.indexOf('Previous') !== -1) {
              flag = false
              const value = bus.computeTimezone(item.data[0] * 1000 - self.minusTime)
              const tData = new Date(value)
              str += '<div class="tooltip-title" style="margin-bottom: 5px">'
              str += bus.timeFormate(tData)
              str += '</div>'
            }
            const color = self.colorList[item.seriesIndex]
            const previousItem = arr.find((series) => ('Previous ' + item.seriesName) === series.seriesName)
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
              <span>${operator}${chartDataFormat.getUnit(unit).compute(minusVal, null, -1, decimals)}</span>
            `
            }

            let className = 'row__color-block'
            if (item.yAxisIndex == 0) {
              className = 'yAxis-icon nz-icon nz-icon-zuozongzhou'
            } else if (item.yAxisIndex == 1) {
              className = 'yAxis-icon nz-icon nz-icon-youzongzhou'
            }

            str += `
            <div class="tooltip__row">
              <div class="row__label">
                <span class="${className}" style="background-color: ${color};color: ${color}"></span>
                <span>${seriesName}</span>
              </div>
              <div class="row__value">
                <span>${chartDataFormat.getUnit(unit).compute(val, null, -1, decimals)}</span>
                ${previousDom}
              </div>
            </div>
          `
          })
          // 显示total
          if (hasTotal) {
            sum = parseFloat(Number(sum).toFixed(2))
            let unit = self.chartInfo.unit ? self.chartInfo.unit : 2
            let className = 'row__color-block'
            let color = ''
            if (type == 'left') {
              // 判断是否开启rightYAxis 否则显示普通图标
              if (self.series.some(item => item.yAxisIndex == 0)) {
                className = 'yAxis-icon nz-icon nz-icon-zuozongzhou'
              }
              if (!self.stackTotalColor) {
                self.stackTotalColor = randomcolor()
              }
              color = self.stackTotalColor
            } else {
              unit = lodash.get(self, 'chartInfo.param.rightYAxis.unit', 2)
              className = 'yAxis-icon nz-icon nz-icon-youzongzhou'
              if (!self.stackTotalColorRight) {
                self.stackTotalColorRight = randomcolor()
              }
              color = self.stackTotalColorRight
            }

            str += `
            <div class="tooltip__row">
              <div class="row__label">
                <span class="${className}" style="background-color: ${color};color: ${color}"></span>
                <span>${self.$t('dashboard.panel.chartTotal')}</span>
              </div>
              <div class="row__value">
                <span>${chartDataFormat.getUnit(unit).compute(sum, null, decimals)}</span>
              </div>
            </div>
          `
          }
        }

        str += '</div>'
        return str
      }
    },
    yAxisLabelFormatter (minValue, maxValue, copies, unit, dot) {
      const self = this
      return function (val, index) {
        const value = formatScientificNotation(val, 6)
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
          self.isStack ? (s.stack = i) : (s.stack = 'Total' + s.yAxisIndex)
        })
        self.isStack = !self.isStack
        // 改变tooltip
        option.tooltip[0].formatter = self.tooltipFormatter(self.isStack)
        myChart.setOption(option)
      }
    },
    resize () {
      setTimeout(() => {
        getChart(this.chartId) && getChart(this.chartId).resize()
      }, 100)
    },
    legendChange (isGrey) {
      let flag = false
      // 点击legend 如果右y轴数据有一个不是灰色 则显示右y轴name
      isGrey.forEach((item, index) => {
        if (this.series[index].yAxisIndex == 1 && item == false) {
          flag = true
        }
      })
      this.hasRightYAxis = flag

      const myChart = getChart(this.chartId)
      const option = myChart.getOption()
      if (option.yAxis[1].min && option.yAxis[1].max) {
        this.hasRightYAxis = true
      }
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

<style lang="scss" scoped>
.rightYAxis-name{
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 100%;
  margin-left: calc(50% - 18px);
  font-size: 12px;
  color:#666666;
  pointer-events:none;
  span{
    transform: rotate(90deg);
    font-family: sans-serif;
  }
}
</style>
