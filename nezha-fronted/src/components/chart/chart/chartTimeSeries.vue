<template>
  <div
    :class="legendPlacement"
    ref="timeSeries-chart-box"
    class="nz-chart__component nz-chart__component--time-series" @mouseenter="mouseEnterChart"
    @mouseleave="mouseLeaveChart"
    v-my-loading="chartLoading"
  >
    <div class="chart__canvas" style="position:relative" :class="{'chart-cursor-default':cursorDefault}">
      <div :id="`chart-canvas-${chartId}`"></div>
      <!-- 右y轴name -->
      <p class="rightYAxis-name" v-if="hasRightYAxis">
        <span>{{chartInfo.param.rightYAxis.label}}</span>
      </p>
    </div>
    <chart-legend
      ref="legend"
      v-if="hasLegend"
      :chart-data="chartData"
      :chart-info="chartInfo"
      :legends="legends"
      :series="series"
      :is-fullscreen="isFullscreen"
    ></chart-legend>
    <div :id="`chart-canvas-tooltip-${chartId}`" class="chart-canvas-tooltip no-style-class" :class="{'chart-dataLink-tooltip':tooltip.dataLinkShow}" :style="{left:tooltip.x+'px',top:tooltip.y+'px'}" v-if="tooltip.show" v-clickoutside="clickout">
      <div v-html="tooltip.tooltipHtml"></div>
      <!-- dataLink -->
      <div class="chart-dataLink-list" v-if="tooltip.dataLinkShow">
        <template v-if="series.length > 1">
          <!-- 只有一条数据时显示 -->
          <div class="chart-dataLink-item select-series" v-if="isGrey.filter(value => value === false).length==1" @click="showAllSeries">
            <i class="nz-icon nz-icon-a-Showallseries"></i>
            <span>{{$t('dashboard.showAllSeries')}}</span>
          </div>
          <!-- 有多条数据时显示 -->
          <div class="chart-dataLink-item select-series" v-else @click="showSelectedSeries">
            <i class="nz-icon nz-icon-a-Showseletedseries"></i>
            <span>{{$t('dashboard.showSelectedSeries')}}</span>
          </div>
        </template>
        <div class="chart-dataLink-item" v-for="(item,index) in dataLink" :title='item.title' :key="index" @click="linkClick(item)">
          <i class="nz-icon nz-icon-link"></i>
          <span>{{item.title}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import legend from './legend'
import chartMixin from '@/components/chart/chartMixin'
import renderChart from '@/components/chart/renderChart'
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
    from: String,
    multipleTime: {},
    minusTime: {}
  },
  mixins: [chartMixin, renderChart],
  data () {
    return {
      stackTotalColor: null,
      stackTotalColorRight: null,
      isStack: false,
      hasRightYAxis: false,
      chartLoading: false,
      cursorDefault: false,
      tooltip: {
        x: 0,
        y: 0,
        title: 0,
        value: 0,
        mapping: {},
        show: false,
        dataLinkShow: '',
        metric: {},
        activeIndex: undefined,
        clickIndex: undefined
      },
      isGrey: []
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
    },
    // timeSeries类型图表联动
    isConnect () {
      return this.$store.state.panel.isConnect
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
      this.setDataLink()
      try {
        this.isStack = this.chartInfo.param.stack
      } catch (e) {}
      const chartOption = lodash.cloneDeep(chartOptions)
      // 防止tootip超出内容区域
      if (this.from === 'integration' || this.from === 'dashboardTemp') {
        chartOption.tooltip.appendToBody = false
      }
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

      const styleOption = this.$lodash.get(this.chartInfo, 'param.option')
      if (styleOption) {
        chartOption.series.forEach(item => {
          if (item.lineStyle && styleOption.lineWidth != undefined) {
            item.lineStyle.width = styleOption.lineWidth
          }
          if (styleOption.pointSize != undefined) {
            item.symbolSize = styleOption.pointSize
          }
        })
      }

      this.isGrey = this.legends.map(() => false)
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
      const option = this.renderYAxis(this.chartData, this.chartInfo)
      chartOption.yAxis[0] = { ...chartOption.yAxis[0], ...option.yAxis[0] }
      chartOption.yAxis[1] = { ...chartOption.yAxis[1], ...option.yAxis[1] }
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
        // timeSeries类型图表设置group 用于多表联动
        if (this.isInit && !this.isFullscreen) {
          myChart.group = 'timeSeriesGroup'
          if (this.isConnect === 'crosshair') {
            myChart.getZr().on('mousemove', params => {
              // crosshair 模式才会执行
              if (this.$store.state.panel.currentMousemove !== this.chartId) {
                this.$store.commit('setCurrentMousemove', this.chartId)
              }
            })
          }
        }

        // 点击图表显示dataLink
        if (this.isInit) {
          // 未设置dataLink的图表 鼠标样式为default
          myChart.getZr().on('mousemove', (params) => {
          // 获取鼠标在图表中的坐标
            const pointInPixel = [params.offsetX, params.offsetY]
            const option = myChart.getOption()
            const zoomState = this.$lodash.get(option, 'toolbox[0].feature.dataZoom.iconStatus.zoom', 'normal')
            // 判断鼠标在坐标轴中且zoom未被激活
            if (myChart.containPixel('grid', pointInPixel) && zoomState === 'normal') {
              this.cursorDefault = true
            } else {
              this.cursorDefault = false
            }
          })
          // 设置dataLink的图表 或存在多条数据时 划过节点时鼠标样式为pointer（可点击）
          if (this.dataLink.length || this.series.length > 1) {
            myChart.on('mousemove', () => {
              this.cursorDefault = false
            })
            myChart.on('click', this.chartClick)
            myChart.on('mousedown', (params) => {
              if (this.tooltip.dataLinkShow) {
                const e = params.event.event
                e.stopPropagation()
              }
            })
          }

          myChart.on('mouseover', (params) => {
            if (this.chartInfo.type !== 'point') {
              if (this.tooltip.activeIndex != params.seriesIndex) {
                const option = myChart.getOption()
                option.series[params.seriesIndex].symbol = 'circle'
                option.series[params.seriesIndex].itemStyle = {
                  borderColor: this.hexToRgb(params.color, 0.4),
                  borderWidth: 5
                }
                myChart.setOption(option)
              }
            }
            this.tooltip.activeIndex = params.seriesIndex
          })
          myChart.on('mouseout', (params) => {
            if (this.chartInfo.type !== 'point') {
              const option = myChart.getOption()
              option.series.forEach(item => {
                item.symbol = 'emptyCircle'
              })
              myChart.setOption(option)
            }
            this.tooltip.activeIndex = undefined
          })

          // 修复echarts bug(dataZoom设置为inside 未按住shift 页面无法滚动)
          // 监听按键按下事件
          document.addEventListener('keydown', this.keydown)
          // 监听按键松开事件
          document.addEventListener('keyup', this.keyup)
        }
        this.chartLoading = false
        this.isInit = false
      }, 200)
    },
    keydown (event) {
      // 监听按键按下事件
      // 判断是否按下了shift键
      if (event.shiftKey) {
        // 如果按下了shift键，则启用Echarts的dataZoom功能
        getChart(this.chartId).setOption({
          dataZoom: [{
            disabled: false
          }]
        })
      }
    },
    keyup (event) {
      // 监听按键松开事件
      // 判断是否释放了shift键
      if (!event.shiftKey) {
        // 如果释放了shift键，则禁用Echarts的dataZoom功能
        getChart(this.chartId).setOption({
          dataZoom: [{
            disabled: true
          }]
        })
      }
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
          if (diffSec <= secOneDay - 100) { // 同一天
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
            if (paramsDot < decimals) {
              paramsDot = decimals
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

            // 根据左右轴设置图标
            let className = 'row__color-block'
            if (item.yAxisIndex == 0) {
              className = 'yAxis-icon nz-icon nz-icon-zuozongzhou'
            } else if (item.yAxisIndex == 1) {
              className = 'yAxis-icon nz-icon nz-icon-youzongzhou'
            }

            // 鼠标悬浮 series data symbol 时，tooltip 中相应的legend 高亮显示
            str += `
            <div class="${(self.tooltip.activeIndex == item.seriesIndex) ? 'tooltip__row highlight' : 'tooltip__row'}" title="${seriesName}">
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
              <div class="row__label" title="${self.$t('dashboard.dashboard.chartTotal')}">
                <span class="${className}" style="background-color: ${color};color: ${color}"></span>
                <span>${self.$t('dashboard.dashboard.chartTotal')}</span>
              </div>
              <div class="row__value">
                <span>${chartDataFormat.getUnit(unit).compute(sum, null, -1, decimals)}</span>
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
      this.isGrey = isGrey
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
    },
    datalinkPosition (e) {
      const windowWidth = window.innerWidth// 窗口宽度
      const windowHeight = window.innerHeight// 窗口高度
      this.$nextTick(() => {
        const box = document.getElementById(`chart-canvas-tooltip-${this.chartId}`)
        const left = e.pageX - this.$refs['timeSeries-chart-box'].getBoundingClientRect().left
        const top = e.pageY - this.$refs['timeSeries-chart-box'].getBoundingClientRect().top
        if (box) {
          const boxWidth = box.offsetWidth
          const boxHeight = box.offsetHeight
          if (e.pageX < (windowWidth / 2)) { // 说明鼠标在左边放不下提示框
            this.tooltip.x = left + 15
          } else {
            this.tooltip.x = left - boxWidth - 15
          }
          if (e.pageY + 50 + boxHeight < windowHeight) { // 说明鼠标上面放不下提示框
            this.tooltip.y = top + 15
          } else {
            this.tooltip.y = top - boxHeight - 10
          }
        }
      })
    },
    chartClick (params) {
      // 先取消多表联动 防止其它图表setOption
      if (this.isConnect !== 'none') {
        echarts.disconnect('timeSeriesGroup')
      }
      const option = {
        tooltip: {
          extraCssText: 'z-index:99999999;visibility:hidden;transition:none;',
          hideDelay: 0
        }
      }
      getChart(this.chartId).setOption(option)
      getChart(this.chartId).dispatchAction({
        type: 'hideTip'
      })
      // 生成dataLink tooltip
      const nameArr = params.seriesName.split('-')
      if (nameArr.length > 1) {
        nameArr.splice(nameArr.length - 1, 1)
      }
      const seriesName = nameArr.join('-')
      if (this.series[params.seriesIndex]) {
        params.yAxisIndex = this.series[params.seriesIndex].yAxisIndex
      }
      const decimals = this.chartInfo.param.decimals || 2
      let unit = this.chartInfo.unit ? this.chartInfo.unit : 2
      if (params.yAxisIndex == 1) {
        unit = lodash.get(this, 'chartInfo.param.rightYAxis.unit', 2)
      }
      // title
      const value = bus.computeTimezone(params.data[0] * 1000)
      const tData = new Date(value)
      // value
      let paramsDot = bus.countDecimals(params.data[1])
      if (paramsDot < this.chartDot) {
        paramsDot = this.chartDot
      } else if (paramsDot > 6) {
        paramsDot = 6
      }
      const val = formatScientificNotation(params.data[1], paramsDot)
      // 根据左右轴设置图标
      let className = 'row__color-block'
      if (params.yAxisIndex == 0) {
        className = 'yAxis-icon nz-icon nz-icon-zuozongzhou'
      } else if (params.yAxisIndex == 1) {
        className = 'yAxis-icon nz-icon nz-icon-youzongzhou'
      }
      const color = this.colorList[params.seriesIndex]
      this.tooltip.tooltipHtml = `
        <div class="nz-chart__tooltip">
          <div class="tooltip-title" style="margin-bottom: 5px">${bus.timeFormate(tData)}</div>
          <div class="tooltip__row">
            <div class="row__label" :title=">${seriesName}">
              <span class="${className}" style="background-color: ${color};color: ${color}"></span>
              <span>${seriesName}</span>
            </div>
            <div class="row__value">
              <span>${chartDataFormat.getUnit(unit).compute(val, null, -1, decimals)}</span>
            </div>
          </div>
        </div>
        `
      this.tooltip.show = true
      this.tooltip.dataLinkShow = true
      this.tooltip.metric.labels = this.series[params.seriesIndex].labels
      this.tooltip.metric.expressionIndex = this.series[params.seriesIndex].expressionIndex
      this.tooltip.clickIndex = params.seriesIndex
      const e = params.event.event
      this.datalinkPosition(e)
      if (this.isConnect !== 'none') {
        echarts.connect('timeSeriesGroup')
      }
    },
    clickout () {
      if (this.dataLink.length || this.series.length > 1) {
        this.tooltip.show = false
        this.tooltip.dataLinkShow = false
        const option = {
          tooltip: {
            extraCssText: 'z-index:99999999;visibility:visible;'
          }
        }
        getChart(this.chartId).setOption(option)
      }
    },
    showSelectedSeries () {
      if (this.isConnect !== 'none') {
        echarts.disconnect('timeSeriesGroup')
      }
      this.legends.forEach((item, index) => {
        if (index == this.tooltip.clickIndex) {
          getChart(this.chartId).dispatchAction({
            type: 'legendSelect',
            name: item.name
          })
        } else {
          getChart(this.chartId).dispatchAction({
            type: 'legendUnSelect',
            name: item.name
          })
        }
      })
      this.isGrey = this.isGrey.map((g, i) => i !== this.tooltip.clickIndex)
      this.$refs.legend.isGrey = this.isGrey

      // 点击后 处理Y轴的刻度边的
      const chartInfo = this.chartInfo
      const series = this.$lodash.cloneDeep(this.series)
      const dataArg = series.filter((seriesItem, seriesIndex) => !this.isGrey[seriesIndex])
      const option = this.renderYAxis(dataArg, chartInfo, 'legend')
      getChart(this.chartId) && getChart(this.chartId).setOption({
        yAxis: [
          ...option.yAxis
        ]
      })

      if (this.isConnect !== 'none') {
        echarts.disconnect('timeSeriesGroup')
      }
      this.clickout()
    },
    showAllSeries () {
      if (this.isConnect !== 'none') {
        echarts.disconnect('timeSeriesGroup')
      }
      getChart(this.chartId).dispatchAction({
        type: 'legendAllSelect'
      })
      this.isGrey = this.isGrey.map(() => false)
      this.$refs.legend.isGrey = this.isGrey

      // 点击后 处理Y轴的刻度边的
      const chartInfo = this.chartInfo
      const series = this.$lodash.cloneDeep(this.series)
      const dataArg = series.filter((seriesItem, seriesIndex) => !this.isGrey[seriesIndex])
      const option = this.renderYAxis(dataArg, chartInfo, 'legend')
      getChart(this.chartId) && getChart(this.chartId).setOption({
        yAxis: [
          ...option.yAxis
        ]
      })

      if (this.isConnect !== 'none') {
        echarts.disconnect('timeSeriesGroup')
      }
      this.clickout()
    }
  },
  mounted () {
    this.chartOption.color || (this.chartOption.color = initColor(20))
    this.colorList = this.chartOption.color
    try {
      this.isStack = this.chartInfo.param.stack
    } catch (e) {}
    this.chartInfo.loaded && this.initChart(this.chartOption)
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.keydown)
    document.removeEventListener('keyup', this.keyup)
  }
}
</script>
