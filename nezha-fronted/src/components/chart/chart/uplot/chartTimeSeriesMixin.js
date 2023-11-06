import { initColor, Incrs } from '@/components/chart/chart/tools'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import chartDataFormat from '@/components/chart/chartDataFormat'
import lodash from 'lodash'
import { formatScientificNotation, getMetricTypeValue } from '@/components/common/js/tools'
import uPlot from 'uplot'
import bus from '@/libs/bus'
export default {
  data () {
    return {
      seriesColor: initColor(),
      incrs: Incrs
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
      this.legends.push({ name, alias, statistics, color: this.seriesColor[chartIndex] })
      return obj
    },
    tooltipPlugin ({ onclick, shiftX = 10, shiftY = 10 }) {
      let tooltipLeftOffset = 0
      let tooltipTopOffset = 0
      const self = this
      const tooltip = document.createElement('div')
      let seriesIdx = null
      let dataIdx = null
      let over
      let tooltipVisible = false
      let isRender = false
      function showTooltip () {
        if (!tooltipVisible) {
          tooltip.style.display = 'block'
          over.style.cursor = 'pointer'
          tooltipVisible = true
        }
      }

      function hideTooltip () {
        if (tooltipVisible) {
          tooltip.style.display = 'none'
          over.style.cursor = null
          tooltipVisible = false
        }
      }

      function setTooltip (u) { // 生成tooltip内容
        showTooltip()
        if (!self.$lodash.get(self.chartInfo, 'param.enable.tooltip', false)) {
          return
        }
        isRender = false
        console.log(self.chartInfo, seriesIdx, dataIdx, u)
        const { left, top } = u.cursor
        const lft = u.valToPos(u.data[0][dataIdx], 'x')
        tooltip.style.top = (tooltipTopOffset + top + shiftX) + 'px'
        tooltip.style.left = (tooltipLeftOffset + lft + shiftY) + 'px'
        let params = []
        const tooltipModel = self.$lodash.get(self.chartInfo, 'param.tooltip.mode', 'single')
        console.log(tooltipModel)
        if (self.chartInfo.param && !(tooltipModel == 'single')) {
          params = self.series.map((s, i) => {
            return {
              seriesIndex: i,
              yAxisIndex: s.yAxisIndex,
              value: [u.data[0][dataIdx], u.data[i + 1][dataIdx]],
              seriesName: s.label
            }
          })
          params = params.filter(item => {
            console.log(item.value[1], typeof (item.value[1]) == 'undefined')
            const flag = typeof (item.value[1]) == 'undefined'
            return !flag
          })
        } else if (seriesIdx) {
          const obj = self.series[seriesIdx - 1]
          params = [{
            seriesIndex: seriesIdx - 1,
            yAxisIndex: obj.yAxisIndex,
            value: [u.data[0][dataIdx], u.data[seriesIdx][dataIdx]],
            seriesName: obj.label
          }]
        }
        isRender = !!params.length
        console.log(isRender, 'isRender')
        if (!isRender) {
          tooltip.style.display = 'none'
          over.style.cursor = null
          return
        } else {
          tooltip.style.display = 'block'
          over.style.cursor = 'pointer'
        }
        tooltip.className = 'chart-time-series-tooltip'
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
          console.log(arr, type)
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
            <div class="${(seriesIdx - 1 == item.seriesIndex) ? 'tooltip__row highlight' : 'tooltip__row'}" title="${seriesName}">
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

              let clientX
              let clientY
              over.addEventListener('mouseleave', () => {
                if (!u.cursor._lock) {
                  hideTooltip()
                }
              })
              over.addEventListener('mousedown', e => {
                clientX = e.clientX
                clientY = e.clientY
              })
              over.addEventListener('mouseup', e => {
                if (e.clientX == clientX && e.clientY == clientY) {
                  if (seriesIdx != null && dataIdx != null) {
                    onclick(u, seriesIdx, dataIdx)
                  }
                }
              })
            }
          ],
          setCursor: [
            u => {
              const c = u.cursor
              if (dataIdx != c.idx) {
                dataIdx = c.idx
                setTooltip(u)
              }
            }
          ],
          setSeries: [
            (u, sidx) => {
              if (seriesIdx != sidx) {
                seriesIdx = sidx
                if (dataIdx != null) { setTooltip(u) }
              }
            }
          ]
        }
      }
    }
  }
}
