import { initColor, Incrs } from '@/components/chart/chart/tools'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import chartDataFormat from '@/components/chart/chartDataFormat'
import lodash from 'lodash'
import { formatScientificNotation, getMetricTypeValue } from '@/components/common/js/tools'
import bus from '@/libs/bus'
import moment from 'moment-timezone'
import { getChart } from '@/components/common/js/common'
import uplot from 'uplot'
import { interpolateRgbBasis } from 'd3-interpolate'
import tinycolor from 'tinycolor2'
export default {
  data () {
    return {
      colorList: [],
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
    lineOption () {
      return this.nzDefaultConfig.option
    },
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
      this.legends = []
      const nullValueMode = this.chartInfo.param.nullType
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
          if (chartIndex >= 20 && !this.showAllData) {
            chartIndex++
            return
          }
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
            let itemValue = value[1]
            if (typeof (itemValue) === 'string') {
              itemValue = Number(itemValue)
            }
            // if (typeof (itemValue) !== 'undefined' && isNaN(itemValue)) {
            //   itemValue = null
            // }
            if (itemValue === null && nullValueMode !== 'null') {
              if (nullValueMode === 'zero') {
                itemValue = 0
              } else {
                itemValue = undefined
              }
            }
            seriesObjTime[value[0]] = itemValue
          })
          // 处理统计数据 statistics
          seriesObjTime = {
            ...ObjTime,
            ...seriesObjTime
          }
          item.expressionIndex = expressionIndex
          seriesData.push(Object.keys(seriesObjTime).map(time => seriesObjTime[time]))
          seriesAll.push(this.renderSeries(item, expressionIndex, seriesIndex, chartIndex, nullValueMode))
          chartIndex++
        })
      })
      this.chartIndex = chartIndex
      seriesData.unshift(time)
      this.setColorList(seriesAll, seriesData)
      this.series = seriesAll
      return {
        seriesData,
        seriesAll
      }
    },
    setColorList (seriesAll, seriesData) {
      let dataArr = lodash.cloneDeep(seriesData)
      dataArr.shift()
      // 取最后一个非空值
      dataArr = dataArr.map(item => {
        let value = 0
        for (let i = item.length - 1; i >= 0; i--) {
          if (item[i]) {
            value = item[i]
            break
          }
        }
        return {
          value
        }
      })
      this.colorList = []
      const initColorArr = initColor(20)
      const mode = lodash.get(this.chartInfo, 'param.color.mode', 'palette')
      seriesAll.forEach((item, index) => {
        let color = ''
        if (mode === 'palette') {
          color = initColorArr[index] || randomcolor()
        } else if (mode === 'fixed') {
          color = lodash.get(this.chartInfo, 'param.color.fixedColor')
        } else if (mode === 'continuous') {
          const continuousType = lodash.get(this.chartInfo, 'param.color.continuousType')
          let min = lodash.get(this.chartInfo, 'param.min') || 0
          let max = lodash.get(this.chartInfo, 'param.max') || this.calcMax(dataArr)
          if (item.yAxisIndex == 1) {
            min = lodash.get(this.chartInfo, 'param.rightYAxis.min') || 0
            max = lodash.get(this.chartInfo, 'param.rightYAxis.max') || this.calcMax(dataArr)
          }
          // 获取颜色数组
          const colorArr = this.$CONSTANTS.colorScheme.find(item => item.value == continuousType).color
          const value = parseFloat(dataArr[index].value)
          const valuePercent = this.getValuePercent(value, min, max)
          // 创建插值函数
          const interpolateColor = interpolateRgbBasis(colorArr)
          color = interpolateColor(valuePercent)
        }
        // 设置图表颜色
        const chartType = item.yAxisIndex == 1 ? lodash.get(this.chartInfo, 'param.rightYAxis.style', 'line') : this.chartInfo.type
        item.stroke = color
        item.spanGaps = this.chartInfo.param.nullType != 'null'
        if (chartType === 'area') {
          // 使用 tinycolor 转换为十六进制
          const hexColor = tinycolor(color).toHexString()
          item.fill = hexColor + '20' // 面积图使用
        }
        if (chartType === 'point') {
          item.points = {
            show: true,
            size: this.lineOption.pointSize * 2,
            width: this.lineOption.pointSize,
            fill: color,
            stroke: color
          }
          item.width = 0
        }
        this.colorList.push(color)
        this.legends[index].color = color
      })
    },
    renderSeries (series, expressionIndex, dataIndex, chartIndex, nullValueMode) {
      const leftUnit = this.chartInfo.unit
      const leftUnitCompute = chartDataFormat.getUnit(leftUnit)
      const decimals = this.chartInfo.param.decimals || 2
      const legend = this.handleLegend(this.chartInfo, series, expressionIndex, dataIndex, chartIndex)
      let isRight
      if (this.chartInfo.param.enable.rightYAxis) {
        const elementNames = this.$lodash.get(this.chartInfo, 'param.rightYAxis.elementNames', [])
        isRight = elementNames.indexOf(series.elements.name) !== -1 ? 1 : 0
      }
      const name = legend.name
      const alias = legend.alias
      const statistics = series.statistics
      console.log(devicePixelRatio, this.lineOption.lineWidth)
      const obj = {
        name: name,
        label: alias,
        scale: isRight ? 'right' : 'left', // right
        yAxisIndex: isRight, // right
        labels: series.metric ? series.metric : {},
        // values: (u, v) => series.elements.name + JSON.stringify(series.metric),
        width: this.lineOption.lineWidth / devicePixelRatio,
        expressionIndex: series.expressionIndex,
        paths (taht, seriesIdx, idx0, idx1, filtIdxs) {
          return uplot.paths.spline(taht)(taht, seriesIdx, idx0, idx1, filtIdxs)
        },
        spanGaps: nullValueMode !== 'null'
      }
      this.legends.push({ name, alias, statistics, color: this.colorList[chartIndex] })
      return obj
    },
    tooltipPlugin ({ onclick, shiftX = 10, shiftY = 10 }) {
      let tooltipLeftOffset = 0
      let tooltipTopOffset = 0
      const self = this
      const totoalStr = this.$t('dashboard.dashboard.chartTotal')
      const tooltip = document.createElement('div')
      tooltip.className = 'nz-uplot-tooltip chart-time-series-tooltip'
      tooltip.style.display = 'none'
      let over
      let isRender = false
      function setTooltip (u, e) { // 生成tooltip内容
        tooltip.style.display = 'none'
        over.style.cursor = null
        isRender = false
        const { top, left } = u.cursor
        const lft = u.valToPos(u.data[0][self.dataIdx], 'x')
        const windowWidth = window.innerWidth// 窗口宽度
        const windowHeight = window.innerHeight// 窗口高度
        let x = 0
        let y = 0
        if (self.chartId != self.currentMousemove) {
          self.mousePosition.left = u.root.getBoundingClientRect().left + left + u._padding[1] + 2 * shiftX
          self.mousePosition.top = u.root.getBoundingClientRect().top + top + 10
        }
        tooltip.style.position = 'fixed'
        if (self.mousePosition.left < (windowWidth / 2)) { // 说明鼠标在左边放不下提示框
          tooltip.style.left = (self.mousePosition.left + shiftX) + 'px'
        } else {
          tooltip.style.left = (self.mousePosition.left - shiftX) + 'px'
          x = '-100%'
        }
        if (self.mousePosition.top + 50 < windowHeight / 2) { // 说明鼠标上面放不下提示框
          tooltip.style.top = (self.mousePosition.top + shiftY) + 'px'
        } else {
          tooltip.style.top = (self.mousePosition.top - shiftY) + 'px'
          y = '-100%'
        }

        tooltip.style.transform = `translate(${x},${y})`

        if (!self.$lodash.get(self.chartInfo, 'param.enable.tooltip', true)) {
          return
        }
        let params = []
        const tooltipModel = self.$lodash.get(self.chartInfo, 'param.tooltip.mode', 'all')
        if (self.chartInfo.param && !(tooltipModel == 'single')) {
          params = u.series.map((s, i) => {
            if (i == 0) return ''
            const value = self.seriesData[i][self.dataIdx]
            return {
              seriesIndex: i - 1,
              yAxisIndex: s.yAxisIndex,
              value: [u.data[0][self.dataIdx], value],
              seriesName: s.label,
              show: s.show
            }
          })
          params = params.filter(item => {
            return item && item.show
          })
        } else if (self.seriesIdx) {
          let obj = self.series[self.seriesIdx - 1]
          let value
          if (!obj) {
            obj = {}
          } else {
            value = self.seriesData[self.seriesIdx][self.dataIdx]
          }
          params = [{
            seriesIndex: self.seriesIdx - 1,
            yAxisIndex: obj.yAxisIndex,
            value: [u.data[0][self.dataIdx], value],
            seriesName: obj.label || ''
          }]
        }
        isRender = !!params.length
        if (!isRender) {
          tooltip.style.display = 'none'
          return
        } else {
          tooltip.style.display = 'block'
        }
        if (self.isConnect == 'crosshair' && self.chartId != self.currentMousemove) {
          tooltip.style.display = 'none'
          return
        }
        if (tooltipModel == 'single' && self.isConnect !== 'none' && self.chartId != self.currentMousemove) {
          tooltip.style.display = 'none'
          return
        }
        if (self.seriesIdx) {
          over.style.cursor = 'pointer'
        }
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
          if (self.$lodash.get(self.chartInfo, 'param.enable.tooltip', true) && self.$lodash.get(self.chartInfo, 'param.tooltip.mode', 'all') !== 'single' && self.$lodash.get(self.chartInfo, 'param.tooltip.sort', 'none') !== 'none') {
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
            const val = typeof (item.value[1]) == 'undefined' ? 0 : formatScientificNotation(item.value[1], paramsDot)
            let showVal = typeof (item.value[1]) == 'undefined' ? '' : chartDataFormat.getUnit(unit).compute(val, null, -1, decimals)
            if ((item.value[1] + '') === 'NaN') {
              showVal = 'NaN'
            }
            sum += isNaN(self.numberWithEConvent(val)) ? 0 : parseFloat(self.numberWithEConvent(val))
            let previousDom = ''
            if (previousItem) {
              const previousVal = typeof (previousItem.value[1]) == 'undefined' ? 0 : formatScientificNotation(previousItem.value[1], paramsDot)
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
                <span>${showVal}</span>
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
              <div class="row__label" title="${totoalStr}">
                <span class="${className}" style="background-color: ${color};color: ${color}"></span>
                <span>${totoalStr}</span>
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
          ],
          drawClear: [
            () => {
              self.renderThresholds()
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
        offset = moment.tz(offset).utcOffset()

        const localOffset = new Date().getTimezoneOffset() * 60 * 1000 * -1 // 默认 一分钟显示时区偏移的结果
        // if (window.dataJson) {
        //   offset = new Date().getTimezoneOffset() * -1 / 60
        // }
        const tData = new Date(value)
        let hour = tData.getHours()
        hour = hour > 9 ? hour : '0' + hour // 加0补充为两位数字
        let minute = tData.getMinutes()
        minute = minute > 9 ? minute : '0' + minute // 如果分钟小于10,则在前面加0补充为两位数字
        if (minTime !== null && maxTime !== null) {
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

          const moment1 = moment((minTime * 1000 - localOffset + offset * 60 * 1000))
          const moment2 = moment((maxTime * 1000 - localOffset + offset * 60 * 1000))
          const isSameDay = moment1.isSame(moment2, 'day')
          const isSameMonth = moment1.isSame(moment2, 'month')

          if (isSameDay) { // 同一天
            return [hour, minute].join(':')
          } else if (isSameMonth) { // 同一月
            return str + '\n' + [hour, minute].join(':')
          } else { // 大于等于30天
            return str
          }
        } else {
          return [tData.getFullYear(), tData.getMonth() + 1, tData.getDate()].join('/') + '\n' + [hour, minute].join(':')
        }
      }
    },
    uplotMouseenter (e) {
      const chart = getChart(this.chartId)
      const over = chart.over
      const root = chart.root.querySelector('.u-wrap')
      let tooltip = root.getElementsByClassName('nz-uplot-tooltip')
      if (tooltip.length) {
        tooltip = tooltip[0]
        // tooltip.style.display = 'block'
      }
      this.mousePosition = {
        left: e.pageX,
        top: e.pageY
      }
      over.addEventListener('mouseleave', this.uplotMouseleave)
      over.addEventListener('mousemove', this.uplotMousemove)
      over.addEventListener('mousedown', this.uplotMousedown)
      over.addEventListener('mouseup', this.uplotMouseup)
      this.$store.commit('setCurrentMousemove', this.chartId)
    },
    uplotMouseleave () {
      const chart = getChart(this.chartId)
      const over = chart.over
      const tooltip = document.getElementsByClassName('nz-uplot-tooltip')
      if (tooltip.length) {
        tooltip.forEach(item => {
          item.style.display = 'none'
        })
      }
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
      if (!params.seriesName) {
        return
      }
      const nameArr = params.seriesName.split('-')
      // if (nameArr.length > 1) {
      //   nameArr.splice(nameArr.length - 1, 1)
      // }
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
      const showValue = chartDataFormat.getUnit(unit).compute(val, null, -1, decimals)
      this.toolbox.tooltipHtml = `
        <div class="nz-chart__tooltip">
          <div class="tooltip-title" style="margin-bottom: 5px">${bus.timeFormate(tData)}</div>
          <div class="tooltip__row">
            <div class="row__label" :title=">${seriesName}">
              <span class="${className}" style="background-color: ${color};color: ${color}"></span>
              <span>${seriesName}</span>
            </div>
            <div class="row__value">
              <span>${showValue}</span>
            </div>
          </div>
        </div>
        `
      this.toolbox.show = true
      this.toolbox.metric.labels = this.series[params.seriesIndex].labels
      this.toolbox.metric.labels.showValue = showValue
      this.toolbox.metric.labels.value = val
      this.toolbox.metric.expressionIndex = this.series[params.seriesIndex].expressionIndex
      this.toolbox.clickIndex = params.seriesIndex
    },
    renderThresholds () { // 画阈值线
      const u = getChart(this.chartId)
      const thresholdsEnable = this.$lodash.get(this.chartInfo, 'param.enable.thresholds', false)
      if (!thresholdsEnable || !u) {
        return
      }
      const leftYaxisMin = u.scales.left.min
      const leftYaxisMax = u.scales.left.max
      const thresholdsArr = this.$lodash.get(this.chartInfo, 'param.thresholds', [])
      const ctx = u.ctx
      ctx.save()
      const xd = u.data[0]
      const i0 = 0
      const i1 = xd.length - 1
      const x0 = u.valToPos(xd[i0], 'x', true)
      const x1 = u.valToPos(xd[i1], 'x', true)
      thresholdsArr.forEach(item => {
        if (item.value > leftYaxisMin && item.value < leftYaxisMax) {
          const y0 = u.valToPos(item.value, 'left', true)
          const y1 = u.valToPos(item.value, 'left', true)
          ctx.beginPath()
          ctx.strokeStyle = item.color
          ctx.setLineDash([5, 5])
          ctx.moveTo(x0, y0)
          ctx.lineTo(x1, y1)
          ctx.stroke()
        }
      })
      ctx.restore()
    }
  }
}
