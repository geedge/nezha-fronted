import lodash from 'lodash'
import * as echarts from 'echarts'
import { getMetricTypeValue } from '@/components/common/js/tools'
import { getChart, getMousePoint, setChart } from '@/components/common/js/common'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import chartDataFormat from '@/components/chart/chartDataFormat'
import {
  chartTimeSeriesLineOption,
  chartTimeSeriesAreaOption,
  chartTimeSeriesScatterOption
} from './chart/options/chartTimeSeries'
export default {
  data () {
    return {
      colorList: [],
      chartDot: 2,
      isInit: true, // 是否是初始化，初始化时为true，图表初始化结束后设为false
      legends: [], // { name, alias, color, statistics: [{type: min, value: xxx}, ...] }
      toolboxIconColor: {
        active: '#53a3cb',
        inactive: '#7e7e7e'
      },
      chartId: '',
      isNoData: true,
      series: []
    }
  },
  props: {
    chartInfo: Object,
    chartData: Array,
    chartOption: Object,
    isFullscreen: Boolean,
    showAllData: {
      type: Boolean,
      default: false
    },
    dialogPadding: {
      type: Number,
      default: 0
    }
  },
  computed: {
    filterTime () {
      return this.$store.getters.getTimeRange
    },
    nowTimeType () {
      return this.$store.getters.getNowTimeType
    },
    chartListId () {
      return this.$store.getters.getChartListId
    }
  },
  methods: {
    // 十六进制转为rgba
    hexToRgb (hex, a = 1) {
      /*
        hex: {String}, "#333", "#AF0382"
      */
      hex = hex.slice(1)
      if (hex.length == 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
      }
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${a})`
    },
    handleTimeSeries (chartInfo, seriesTemplate, originalDatas) {
      const series = []
      let colorIndex = 0
      this.isNoData = true
      originalDatas.forEach((originalData, expressionIndex) => {
        originalData.forEach((data, dataIndex) => {
          if (colorIndex >= 20 && !this.showAllData) {
            colorIndex++
            return
          }
          this.isNoData = false
          let s = lodash.cloneDeep(seriesTemplate)

          // 设置右y轴
          if (chartInfo.param.enable.rightYAxis) {
            s.yAxisIndex = 0
            chartInfo.param.rightYAxis && chartInfo.param.rightYAxis.elementNames.forEach(item => {
              if (data.elements.name == item) {
                s.yAxisIndex = 1
              }
            })
          }

          // 右y轴数据类型
          if (s.yAxisIndex == 1) {
            const style = chartInfo.param.rightYAxis.style
            if (style == 'line') {
              s = lodash.cloneDeep(chartTimeSeriesLineOption.series[0])
            } else if (style == 'area') {
              s = lodash.cloneDeep(chartTimeSeriesAreaOption.series[0])
            } else if (style == 'point') {
              s = lodash.cloneDeep(chartTimeSeriesScatterOption.series[0])
            }
            s.yAxisIndex = 1
          }

          if (s.param && s.param.nullType) {
            s.connectNulls = s.param.nullType !== 'null'
          } else {
            s.connectNulls = false
          }
          if (s) {
            s.data = data.values
            s.name = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex).name
            if (chartInfo.param.stack) { // 堆叠
              s.stack = 'Total' + s.yAxisIndex
            }
            if (chartInfo.param.enable && chartInfo.param.enable.thresholds && !lodash.isEmpty(chartInfo.param.thresholds) && chartInfo.param.thresholds.length) { // 阈值
              s.markLine = {
                silent: true,
                symbol: 'circle',
                symbolSize: 5
              }
              // Thresholds 只对左Y轴有效
              if (s.yAxisIndex != 1) {
                chartInfo.param.thresholds = chartInfo.param.thresholds.reverse()
                s.markLine.data = chartInfo.param.thresholds.map(threshold => {
                  return {
                    yAxis: threshold.value || 0,
                    label: {
                      show: true,
                      formatter () {
                        if (threshold.label) {
                          return threshold.label
                        } else {
                          return threshold.value || 0
                        }
                      }
                    },
                    lineStyle: {
                      color: threshold.color,
                      width: 2,
                      type: 'dotted'
                    }
                  }
                })
              }
            }
            // 判断如果是面积图 颜色设为渐变色
            if (s.areaStyle && this.colorList.length) {
              s.areaStyle = {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: this.hexToRgb(this.colorList[colorIndex], 0.1)
                  },
                  {
                    offset: 1,
                    color: this.hexToRgb(this.colorList[colorIndex], 1)
                  }
                ])
              }
            }
            series.push(s)
            colorIndex++
          }
        })
      })
      this.$emit('chartIsNoData', this.isNoData)
      return series
    },
    // 单个legend
    handleLegend (chartInfo, data, expressionIndexs, dataIndex, colorIndex) {
      let expressionIndex = expressionIndexs
      let legend = '' // up
      let alias = ''
      if (chartInfo.elements && (expressionIndex >= chartInfo.elements.length)) {
        expressionIndex -= chartInfo.elements.length
        // legend += 'Previous '
        alias += 'Previous '
      }
      if (!data.metric) {
        data.metric = data.stream
      }
      if (!data.metric) {
        data.metric = {}
      }
      if (data.metric.__name__) {
        legend += `${data.metric.__name__}{`
      }
      const tagKeysArr = Object.keys(data.metric)
      tagKeysArr.forEach(tagKey => {
        if (tagKey !== '__name__' && tagKey !== 'legend' && tagKey !== 'values' && tagKey !== '$value') {
          legend += `${tagKey}="${data.metric[tagKey]}",`
        }
      })
      if (legend.endsWith(',')) {
        legend = legend.substr(0, legend.length - 1)
      }
      if (data.metric.__name__) {
        legend += '}'
      }
      if (!legend && chartInfo.elements) {
        legend = chartInfo.elements[expressionIndex].expression
        //  legend = ''
      }
      // 处理legend别名
      if (chartInfo.elements) {
        if (chartInfo.elements[expressionIndex]) {
          alias = alias + this.handleLegendAlias(legend, chartInfo.elements[expressionIndex].legend, tagKeysArr)
        }
        if (!alias) {
          alias = chartInfo.elements[expressionIndex].expression || ''
        }
        if (alias == 'Previous ') {
          alias += chartInfo.elements[expressionIndex].expression
        }
      }
      // proj_status_
      const legendIndex = expressionIndex + 'and' + dataIndex
      const name = alias + '-' + legendIndex

      // 若需要统计，处理统计数据
      const statisticsTypes = chartInfo.param.legend ? chartInfo.param.legend.values : ''
      let statistics = []
      if (!lodash.isEmpty(statisticsTypes)) {
        statistics = statisticsTypes.map(type => {
          return { type, value: getMetricTypeValue(data.values, type) }
        })
      }
      if (colorIndex >= 20) {
        const colorRandom = randomcolor()
        this.colorList.push(colorRandom)
      }
      this.legends.push({ name, alias, statistics, color: this.colorList[colorIndex] })
      return {
        name,
        alias
      }
    },
    handleLegendAlias (legend, aliasExpression, params) {
      const self = this
      const myParams = JSON.parse(JSON.stringify(params))
      myParams.$labels = JSON.parse(JSON.stringify(params))
      myParams.$value = myParams.value
      if (/\{\{.+\}\}/.test(aliasExpression)) {
        const labelValue = aliasExpression.replace(/(\{\{.+?\}\})/g, function (i) {
          const label = i.substr(i.indexOf('{{') + 2, i.indexOf('}}') - i.indexOf('{{') - 2)
          if (!legend) {
            return label
          }
          let value = null
          if (params && self.$lodash.get(myParams, label)) {
            value = self.$lodash.get(myParams, label)
          }
          if (label) {
            const reg = new RegExp(label + '=".+?"', 'g')
            if (reg.test(legend)) {
              const ans = legend.match(reg)
              let find = ''
              ans.forEach(item => {
                const index = legend.indexOf(item)
                if (legend[index - 1] !== '_') {
                  find = item
                }
              })
              value = find.substr(find.indexOf('"') + 1, find.lastIndexOf('"') - find.indexOf('"') - 1)
            }
          }
          return value || ''
        })
        return labelValue
      } else {
        if (!aliasExpression) {
          return legend
          // let result =legend.substr(legend.indexOf('"') + 1,legend.lastIndexOf('"') - legend.indexOf('"') - 1);
          // return result
        }
        return aliasExpression
      }
    },
    selectMapping (value, valueMapping, show) {
      let mapping = ''
      if (show && valueMapping) {
        valueMapping.forEach(item => {
          if (item.type === 'value') {
            if (value == item.value) {
              mapping = item
            }
          }
          if (item.type === 'range') {
            if (value >= item.from && value < item.to) {
              mapping = item
            }
          }
          if (item.type === 'regx') {
            const reg = new RegExp(item.regx)
            if (reg.test(value)) {
              mapping = item
            }
          }
        })
      }
      return mapping
    },
    mouseEnterChart () {
      const myChart = getChart(this.chartId)
      if (myChart) {
        setTimeout(() => {
          myChart.setOption({
            toolbox: {
              show: true
            }
          })
        }, 300)
      }
    },
    tooltipPosition (point, params, dom, rect, size) {
      dom.style.transform = 'translateZ(999999)'
      const windowWidth = window.innerWidth// 窗口宽度
      const windowHeight = window.innerHeight// 窗口高度
      const windowMouse = getMousePoint()
      // 提示框位置
      let x = 0
      let y = 0
      // 当前鼠标位置
      const pointX = point[0]
      const pointY = point[1]
      // 外层div大小
      // const viewWidth = size.viewSize[0]
      // const viewHeight = size.viewSize[1]
      // 提示框大小
      const boxWidth = size.contentSize[0]
      const boxHeight = size.contentSize[1]
      if (windowMouse.x < (windowWidth / 2)) { // 说明鼠标在左边放不下提示框
        x = pointX + 15
      } else {
        x = pointX - boxWidth - 15
      }
      if (windowMouse.y + 50 + boxHeight < windowHeight) { // 说明鼠标上面放不下提示框
        y = pointY + 15
      } else {
        y = pointY - boxHeight - 10
      }
      return [x, y]
    },
    mouseLeaveChart () {
      const myChart = getChart(this.chartId)
      if (myChart) {
        setTimeout(() => {
          myChart.setOption({
            toolbox: {
              show: false
            }
          })
        }, 300)
      }
    },
    getMaxValue (dataArg, chartInfo) {
      let maxValue = 0
      let minValue = 0
      if (dataArg.length > 0) {
        maxValue = 0
        minValue = 0
        for (let j = 0; j < dataArg.length; j++) {
          for (let i = 0; i < dataArg[j].data.length; i++) {
            if (!isNaN(dataArg[j].data[i][1])) {
              maxValue = (maxValue < Number(dataArg[j].data[i][1]) ? Number(dataArg[j].data[i][1]) : maxValue)
              minValue = (minValue > Number(dataArg[j].data[i][1]) ? Number(dataArg[j].data[i][1]) : minValue)
            }
          }
        }
      }
      const chartUnit = chartInfo.unit ? chartInfo.unit : 2
      const unit = chartDataFormat.getUnit(chartUnit)
      minValue = minValue > 0 ? 0 : minValue
      if (maxValue < 0) {
        maxValue = Math.abs(maxValue)
      }
      if (Math.abs(minValue) > Math.abs(maxValue)) {
        maxValue = Math.abs(minValue)
      }
      maxValue = maxValue - minValue
      maxValue = chartDataFormat.formatDatas(maxValue, unit.type, 'ceil', unit.ascii)
      let oldValue = maxValue
      if (maxValue < 0) {
        oldValue = Math.abs(maxValue)
      }
      if (minValue < 0) {
        oldValue = Math.abs(maxValue - minValue)
      }
      let dot = 0
      if (maxValue == 1) {
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
      let oldDot = 2
      if (maxValue <= 1) {
        oldDot = dot > 6 ? 6 : dot
      }
      return {
        maxValue,
        dot,
        copies,
        minValue,
        unit,
        oldDot
      }
    },
    resize () {
      setTimeout(() => {
        getChart(this.chartId) && getChart(this.chartId).resize()
      }, 100)
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        if (!this.isInit && this.chartOption.color) {
          this.colorList = this.colorList.slice(0, 20)
          this.chartOption.color = this.chartOption.color.slice(0, 20)
        }
        if (!this.isInit) {
          this.initChart(this.chartOption)
          if (this.resize) {
            setTimeout(() => {
              this.resize()
            }, 200)
          }
        }
      }
    }
    // 'chartInfo.loaded': {
    //   immediate: true,
    //   deep: true,
    //   handler (n) {
    //     if (n) {
    //       this.initChart && this.initChart(this.chartOption)
    //     }
    //   }
    // }
  },
  created () {
    this.chartId = `${this.chartInfo.id}${this.isFullscreen ? '-fullscreen' : ''}`
  },
  beforeDestroy () {
    try {
      getChart(this.chartId) && getChart(this.chartId).getZr().off('mousemove')
    } catch (error) {}
    getChart(this.chartId) && setChart(this.chartId, null)
  }
}
