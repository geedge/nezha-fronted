import { initColor, Incrs } from '@/components/chart/chart/tools'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import chartDataFormat from '@/components/chart/chartDataFormat'
import lodash from 'lodash'
import { formatScientificNotation, getMetricTypeValue } from '@/components/common/js/tools'
import uPlot, { Points } from 'uplot'
import bus from '@/libs/bus'
import moment from 'moment-timezone'
import { getChart } from '@/components/common/js/common'
export default {
  data () {
    return {
      seriesColor: initColor(),
      incrs: Incrs,
      dataIdx: null,
      seriesIdx: null,
      mousePosition: {
        top: 0,
        left: 0
      }
    }
  },
  computed: {
    // timeSeries类型图表联动
    isConnect () {
      return this.$store.state.panel.isConnect
    },
    // timeSeries类型图表联动
    currentMousemove () {
      return this.$store.state.panel.currentMousemove
    }
  },
  methods: {
    initSeriesData (chartData) { // 处理数据 以及 series
      let time = []
      const seriesData = [] // 返回的数据
      const seriesAll = [ // 返回的 series

      ]
      let chartIndex = 0
      chartData.forEach(series => { // 首先处理时间 对应点没有值（不包括null 则添加undefind）
        series.forEach(item => {
          time.push(...item.values.map(value => value[0]))
        })
      })
      const timeSet = new Set(time)
      time = [...timeSet]
      time = this.$lodash.sortBy(time, function (o) { return o })
      const ObjTime = {}
      time.forEach(item => {
        ObjTime[item] = undefined
      })
      chartData.forEach((series, expressionIndex) => { // 首先处理时间 对应点没有值（不包括null 则添加undefind）
        series.forEach((item, seriesIndex) => {
          let seriesObjTime = {}
          // 若需要统计，处理统计数据
          const statisticsTypes = this.chartInfo.param.legend ? this.chartInfo.param.legend.values : ''
          let statistics = []
          if (!lodash.isEmpty(statisticsTypes)) {
            statistics = statisticsTypes.map(type => {
              return { type, value: getMetricTypeValue(item.values, type) }
            })
          }
          item.statistics = statistics
          item.values.forEach(value => {
            seriesObjTime[value[0]] = value[1]
          })
          // 处理统计数据 statistics
          seriesObjTime = {
            ...ObjTime,
            ...seriesObjTime
          }
          seriesData.push(Object.keys(seriesObjTime).map(time => seriesObjTime[time]))
          seriesAll.push(this.renderSeries(item, expressionIndex, seriesIndex, chartIndex))
          chartIndex++
        })
      })
      seriesData.unshift(time)
      this.series = seriesAll
      return {
        seriesData,
        seriesAll
      }
    },
    renderSeries (series, expressionIndex, dataIndex, chartIndex) {
      const leftUnit = this.chartInfo.unit
      const leftUnitCompute = chartDataFormat.getUnit(leftUnit)
      const decimals = this.chartInfo.param.decimals || 2
      if (chartIndex > 19) {
        this.seriesColor.push(randomcolor())
      }
      const legend = this.handleLegend(this.chartInfo, series, expressionIndex, dataIndex, chartIndex)
      let isRight = false
      if (this.chartInfo.param.enable.rightYAxis) {
        const elementNames = this.$lodash.get(this.chartInfo, 'param.rightYAxis.elementNames', [])
        isRight = elementNames.indexOf(series.elements.name) !== -1
      }
      const name = legend.name
      const alias = legend.alias
      const statistics = series.statistics
      const chartType = this.chartInfo.type
      const obj = {
        name: name,
        label: alias,
        class: series.elements.name + JSON.stringify(series.metric),
        scale: isRight ? 'right' : 'left', // right
        yAxisIndex: isRight ? 1 : 0, // right
        values: (u, v) => series.elements.name + JSON.stringify(series.metric),
        stroke: this.seriesColor[chartIndex],
        width: 1 / devicePixelRatio
      }
      if (chartType === 'area') {
        obj.fill = this.seriesColor[chartIndex] + '20' // 面积图使用
      }
      if (chartType === 'point') {
        obj.points = {
          show: true,
          width: 2
        }
        obj.width = 0
      }
      this.legends.push({ name, alias, statistics, color: this.seriesColor[chartIndex] })
      return obj
    },
    tooltipPlugin ({ onclick, shiftX = 10, shiftY = 10 }) {
      let tooltipLeftOffset = 0
      let tooltipTopOffset = 0
      const self = this
      const tooltip = document.createElement('div')
      tooltip.className = 'nz-uplot-tooltip'
      let over
      let isRender = false
      function setTooltip (u, e) { // 生成tooltip内容
        tooltip.style.display = 'none'
        over.style.cursor = null
        isRender = false
        const { top } = u.cursor
        const lft = u.valToPos(u.data[0][self.dataIdx], 'x')
        const windowWidth = window.innerWidth// 窗口宽度
        const windowHeight = window.innerHeight// 窗口高度
        const boxWidth = tooltip.offsetWidth
        const boxHeight = tooltip.offsetHeight
        let x = 0
        let y = 0
        if (self.mousePosition.left < (windowWidth / 2)) { // 说明鼠标在左边放不下提示框
          tooltip.style.left = (tooltipLeftOffset + lft + shiftX) + 'px'
        } else {
          tooltip.style.left = (tooltipLeftOffset + lft - shiftX) + 'px'
          x = '-100%'
        }
        if (self.mousePosition.top + 50 < windowHeight / 2) { // 说明鼠标上面放不下提示框
          tooltip.style.top = (tooltipTopOffset + top + shiftY) + 'px'
        } else {
          tooltip.style.top = (tooltipTopOffset + top - shiftY) + 'px'
          y = '-100%'
        }
        tooltip.style.transform = `translate(${x},${y})`
        if (!self.$lodash.get(self.chartInfo, 'param.enable.tooltip', false)) {
          return
        }
        let params = []
        const tooltipModel = self.$lodash.get(self.chartInfo, 'param.tooltip.mode', 'single')
        if (self.chartInfo.param && !(tooltipModel == 'single')) {
          params = u.series.map((s, i) => {
            return {
              seriesIndex: i - 1,
              yAxisIndex: s.yAxisIndex,
              value: [u.data[0][self.dataIdx], u.data[i][self.dataIdx]],
              seriesName: s.label,
              show: s.show
            }
          })
          params = params.filter(item => {
            if (!item || !item.seriesIndex || !item.show) {
              return false
            }
            const flag = typeof (item.value[1]) == 'undefined'
            return !flag
          })
        } else if (self.seriesIdx) {
          const obj = self.series[self.seriesIdx - 1]
          params = [{
            seriesIndex: self.seriesIdx - 1,
            yAxisIndex: obj.yAxisIndex,
            value: [u.data[0][self.dataIdx], u.data[self.seriesIdx][self.dataIdx]],
            seriesName: obj.label
          }]
        }
        isRender = !!params.length
        if (!isRender) {
          tooltip.style.display = 'none'
          return
        } else {
          tooltip.style.display = 'block'
        }
        if (self.isConnect == 'crosshair' && self.chartId !== self.currentMousemove) {
          return
        }
        if (self.seriesIdx) {
          over.style.cursor = 'pointer'
        }
        tooltip.className += ' chart-time-series-tooltip'
        let str = '<div class="nz-tooltip nz-chart__tooltip">'
        const hasTotal = self.isStack
        const decimals = self.chartInfo.param.decimals || 2
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

          // tooltip排序
          let sortBy
          if (self.$lodash.get(self.chartInfo, 'param.enable.tooltip') && self.$lodash.get(self.chartInfo, 'param.tooltip.mode') !== 'single' && self.$lodash.get(self.chartInfo, 'param.tooltip.sort') !== 'none') {
            sortBy = self.$lodash.get(self.chartInfo, 'param.tooltip.sort')
          }
          const previousIndex = arr.findIndex(item => item.seriesName.indexOf('Previous') !== -1)
          if (previousIndex != -1) { // 对比状态
            const arrNow = arr.slice(0, previousIndex)
            const arrPrevious = arr.slice(previousIndex)
            if (sortBy === 'asc') {
              arrNow.sort((a, b) => a.value[1] - b.value[1])
              arrPrevious.sort((a, b) => a.value[1] - b.value[1])
            } else if (sortBy === 'desc') {
              arrNow.sort((a, b) => b.value[1] - a.value[1])
              arrPrevious.sort((a, b) => b.value[1] - a.value[1])
            }
            arr = [...arrNow, ...arrPrevious]
          } else {
            if (sortBy === 'asc') {
              arr.sort((a, b) => a.value[1] - b.value[1])
            } else if (sortBy === 'desc') {
              arr.sort((a, b) => b.value[1] - a.value[1])
            }
          }

          let sum = 0
          let flag = true
          arr.forEach((item, i) => {
            let unit = self.chartInfo.unit ? self.chartInfo.unit : 2
            if (type == 'right') {
              unit = lodash.get(self, 'chartInfo.param.rightYAxis.unit', 2)
            }
            const nameArr = item.seriesName.split('-')
            // if (nameArr.length > 1) {
            //   nameArr.splice(nameArr.length - 1, 1)
            // }
            const seriesName = nameArr.join('-')
            if (i === 0 && item.seriesName.indexOf('Previous') === -1 && type == 'left') {
              const value = bus.computeTimezone(item.value[0] * 1000)
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
                const value = bus.computeTimezone(item.value[0] * 1000)
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
              const value = bus.computeTimezone(item.value[0] * 1000 - self.minusTime)
              const tData = new Date(value)
              str += '<div class="tooltip-title" style="margin-bottom: 5px">'
              str += bus.timeFormate(tData)
              str += '</div>'
            }
            const color = self.colorList[item.seriesIndex]
            const previousItem = arr.find((series) => ('Previous ' + item.seriesName) === series.seriesName)
            let paramsDot = bus.countDecimals(item.value[1])
            if (paramsDot < decimals) {
              paramsDot = decimals
            } else if (paramsDot > 6) {
              paramsDot = 6
            }
            const val = formatScientificNotation(item.value[1], paramsDot)
            sum += isNaN(self.numberWithEConvent(val)) ? 0 : parseFloat(self.numberWithEConvent(val))
            let previousDom = ''
            if (previousItem) {
              const previousVal = formatScientificNotation(previousItem.value[1], paramsDot)
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
            <div class="${(self.seriesIdx - 1 == item.seriesIndex) ? 'tooltip__row highlight' : 'tooltip__row'}" title="${seriesName}">
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
        tooltip.innerHTML = str
      }
      return {
        hooks: {
          ready: [
            u => {
              over = u.over
              tooltipLeftOffset = parseFloat(over.style.left)
              tooltipTopOffset = parseFloat(over.style.top)
              u.root.querySelector('.u-wrap').appendChild(tooltip)
              over.addEventListener('mouseenter', self.uplotMouseenter)
              // over.addEventListener('mouseleave', self.uplotMouseleave.bind(self, hideTooltip, over)) 放入mouseenter 减少绑定事件数量
              // over.addEventListener('mousemove', self.uplotMousemove)
              // over.addEventListener('mousedown', self.uplotMousedown)
              // over.addEventListener('mouseup', self.uplotMouseup.bind(self, nodeInfo))
            }
          ],
          setCursor: [
            u => {
              const c = u.cursor
              if (self.dataIdx != c.idx) {
                self.dataIdx = c.idx
                setTooltip(u)
              }
            }
          ],
          setSeries: [
            (u, sidx) => {
              if (self.seriesIdx != sidx) {
                this.seriesIdx = sidx
                if (self.dataIdx != null) { setTooltip(u) }
              }
            }
          ]
        }
      }
    },
    xAxisLabelFormatter (minTime, maxTime) {
      const self = this
      return function (val, index) {
        const value = self.momentStrToTimestamp(self.momentTz(val))
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
          const secOneDay = 12 * 60 * 60// 0.5天的秒数
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
          return [tData.getFullYear(), tData.getMonth() + 1, tData.getDate()].join('/') + '\n' + [hour, minute].join(':')
        }
      }
    },
    uplotMouseenter () {
      const chart = getChart(this.chartId)
      const over = chart.over
      over.addEventListener('mouseleave', this.uplotMouseleave)
      over.addEventListener('mousemove', this.uplotMousemove)
      over.addEventListener('mousedown', this.uplotMousedown)
      over.addEventListener('mouseup', this.uplotMouseup)
      this.$store.commit('setCurrentMousemove', this.chartId)
    },
    uplotMouseleave () {
      const chart = getChart(this.chartId)
      const over = chart.over
      over.removeEventListener('mouseleave', this.uplotMouseleave)
      over.removeEventListener('mousemove', this.uplotMousemove)
      over.removeEventListener('mousedown', this.uplotMousedown)
      over.removeEventListener('mouseup', this.uplotMouseup)
    },
    uplotMousemove (e) {
      this.mousePosition = {
        left: e.pageX,
        top: e.pageY
      }
    },
    uplotMousedown (e) {
      this.toolbox.x = e.clientX
      this.toolbox.y = e.clientY
    },
    uplotMouseup (e) {
      if (e.clientX == this.toolbox.x && e.clientY == this.toolbox.y) {
        if (this.seriesIdx) {
          this.toolbox.show = true
          this.datalinkClick(this.seriesIdx, this.dataIdx)
          const windowWidth = window.innerWidth// 窗口宽度
          const windowHeight = window.innerHeight// 窗口高度
          this.$nextTick(() => {
            const box = document.getElementById(`chart-toolbox-${this.chartId}`)
            const left = e.pageX - this.$refs['timeSeries-chart-box'].getBoundingClientRect().left
            const top = e.pageY - this.$refs['timeSeries-chart-box'].getBoundingClientRect().top
            if (box) {
              const boxWidth = box.offsetWidth
              const boxHeight = box.offsetHeight
              if (e.pageX < (windowWidth / 2)) { // 说明鼠标在左边放不下提示框
                this.toolbox.x = left + 15
              } else {
                this.toolbox.x = left - boxWidth - 15
              }
              if (e.pageY + 50 + boxHeight < windowHeight) { // 说明鼠标上面放不下提示框
                this.toolbox.y = top + 15
              } else {
                this.toolbox.y = top - boxHeight - 10
              }
            }
          })
        } else {
          this.toolbox.show = false
        }
      }
    },
    datalinkClick (seriesIdx, dataIdx, e) { // 处理datalink数据
      const obj = this.series[seriesIdx - 1]
      const chart = getChart(this.chartId)
      const params = {
        seriesIndex: seriesIdx - 1,
        yAxisIndex: obj.yAxisIndex,
        value: [chart.data[0][dataIdx], chart.data[seriesIdx][dataIdx]],
        seriesName: obj.label
      }
      console.log(params)
      if (!params.seriesName) {
         return
      }
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
      const value = bus.computeTimezone(params.value[0] * 1000)
      const tData = new Date(value)
      // value
      let paramsDot = bus.countDecimals(params.value[1])
      if (paramsDot < this.chartDot) {
        paramsDot = this.chartDot
      } else if (paramsDot > 6) {
        paramsDot = 6
      }
      const val = formatScientificNotation(params.value[1], paramsDot)
      // 根据左右轴设置图标
      let className = 'row__color-block'
      if (params.yAxisIndex == 0) {
        className = 'yAxis-icon nz-icon nz-icon-zuozongzhou'
      } else if (params.yAxisIndex == 1) {
        className = 'yAxis-icon nz-icon nz-icon-youzongzhou'
      }
      const color = this.colorList[params.seriesIndex]
      this.toolbox.tooltipHtml = `
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
      this.toolbox.show = true
      this.toolbox.metric.labels = this.series[params.seriesIndex].labels
      this.toolbox.metric.expressionIndex = this.series[params.seriesIndex].expressionIndex
      this.toolbox.clickIndex = params.seriesIndex
    }
  }
}
