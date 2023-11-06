import { initColor, Incrs } from '@/components/chart/chart/tools'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import chartDataFormat from '@/components/chart/chartDataFormat'
import lodash from 'lodash'
import { getMetricTypeValue } from '@/components/common/js/tools'
import uPlot from 'uplot'
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
      const obj = {
        name: series.elements.name + JSON.stringify(series.metric),
        label: series.elements.name + JSON.stringify(series.metric),
        class: series.elements.name + JSON.stringify(series.metric),
        scale: isRight ? 'right' : 'left', // right
        yAxisIndex: isRight ? 1 : 0, // right
        values: (u, v) => series.elements.name + JSON.stringify(series.metric),
        stroke: this.seriesColor[chartIndex],
        width: 1 / devicePixelRatio
      }
      const name = legend.name
      const alias = legend.alias
      const statistics = series.statistics
      this.legends.push({ name, alias, statistics, color: this.seriesColor[chartIndex] })
      return obj
    },
    tooltipPlugin ({ onclick, shiftX = 10, shiftY = 10 }) {
      let tooltipLeftOffset = 0
      let tooltipTopOffset = 0
      const self = this
      const tooltip = document.createElement('div')
      tooltip.className = 'u-tooltip'

      let seriesIdx = null
      let dataIdx = null

      const fmtDate = uPlot.fmtDate('{M}/{D}/{YY} {h}:{mm}:{ss} {AA}')

      let over

      let tooltipVisible = false

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

      function setTooltip (u) {
        showTooltip()

        const top = u.valToPos(u.data[seriesIdx][dataIdx], 'y')
        const lft = u.valToPos(u.data[0][dataIdx], 'x')

        tooltip.style.top = (tooltipTopOffset + top + shiftX) + 'px'
        tooltip.style.left = (tooltipLeftOffset + lft + shiftY) + 'px'

        tooltip.style.borderColor = self.seriesColor[seriesIdx - 1]
        const pctSinceStart = (((u.data[seriesIdx][dataIdx] - u.data[seriesIdx][0]) / u.data[seriesIdx][0]) * 100).toFixed(2)
        tooltip.textContent = (
          fmtDate(new Date(u.data[0][dataIdx] * 1e3)) + ' - ' + '\n' +
      uPlot.fmtNum(u.data[seriesIdx][dataIdx]) + ' (' + pctSinceStart + '% since start)'
        )
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

              over.addEventListener('mousedown', e => {
                clientX = e.clientX
                clientY = e.clientY
              })

              over.addEventListener('mouseup', e => {
                // clicked in-place
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

                if (seriesIdx != null) { setTooltip(u) }
              }
            }
          ],
          setSeries: [
            (u, sidx) => {
              if (seriesIdx != sidx) {
                seriesIdx = sidx

                if (sidx == null) { hideTooltip() } else if (dataIdx != null) { setTooltip(u) }
              }
            }
          ]
        }
      }
    }
  }
}
