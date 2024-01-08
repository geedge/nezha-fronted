import lodash from 'lodash'
import * as echarts from 'echarts'
import { getMetricTypeValue, formatScientificNotation } from '@/components/common/js/tools'
import { getChart, getMousePoint, setChart } from '@/components/common/js/common'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import chartDataFormat from '@/components/chart/chartDataFormat'
import {
  chartTimeSeriesLineOption,
  chartTimeSeriesAreaOption,
  chartTimeSeriesScatterOption
} from './chart/options/chartTimeSeries'
import * as CSV from 'csv-string'
import { initColor } from '@/components/chart/chart/tools'
import { interpolateRgbBasis } from 'd3-interpolate'
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
      series: [],
      dataLink: [],
      tooltip: {
        x: 0,
        y: 0,
        title: 0,
        value: 0,
        mapping: {},
        show: false
      },
      toolbox: {
        x: 0,
        y: 0,
        title: 0,
        value: 0,
        mapping: {},
        show: false,
        metric: {}
      }
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
    },
    globalVariables: {}
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
            return
          }
          this.isNoData = false
          let s = lodash.cloneDeep(seriesTemplate)

          // 设置右y轴
          if (chartInfo.param.enable.rightYAxis) {
            if (chartInfo.param.rightYAxis) {
              const findItem = chartInfo.param.rightYAxis.elementNames.find(item => data.elements.name == item)
              console.log(findItem)
              if (findItem) {
                s.yAxisIndex = 1
                data.yAxisIndex = 1
              } else {
                s.yAxisIndex = 0
                data.yAxisIndex = 0
              }
            }
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

          if (chartInfo.param && chartInfo.param.nullType) {
            s.connectNulls = chartInfo.param.nullType !== 'null'
          } else {
            s.connectNulls = false
          }

          if (s) {
            s.data = data.values
            const legend = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex)
            s.name = legend.name
            s.labels = {
              ...data.metric,
              legend: legend.alias
            }
            s.expressionIndex = expressionIndex
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
                opacity: 0.1
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
      if (this.chartInfo.type !== 'line' && this.chartInfo.type !== 'area' && this.chartInfo.type !== 'point') {
        this.legends.push({ name, alias, statistics, color: this.colorList[colorIndex] })
      }
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
      if (this.from !== 'meta2dTooltip') {
        aliasExpression = this.globalVariablesReplace(aliasExpression)
      }
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
    },
    tooltipPosition (point, params, dom, rect, size) {
      if (this.isConnect === 'tooltip' && this.$store.state.panel.currentMousemove != this.chartId) {
        return
      }
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
      maxValue = chartDataFormat.formatDatas(maxValue, unit, 'ceil', unit.ascii)
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
    },
    // 全局变量替换
    globalVariablesReplace (expression) {
      let str = expression
      if (str) {
        this.globalVariables.forEach(item => {
          const reg = new RegExp('{{\\' + item.name + '}}', 'g')
          if (item.value != null) {
            str = str.replace(reg, item.value)
          }
        })
      }
      return str
    },
    // 设置dataLink
    setDataLink () {
      if (this.chartInfo.param.dataLink && this.chartInfo.param.dataLink.length) {
        this.dataLink = this.chartInfo.param.dataLink.map(item => {
          return {
            ...item,
            url: this.globalVariablesReplace(item.url)
          }
        })
      }
    },
    linkClick (data) {
      const url = data.url.replace(/(\{\{.+?\}\})/g, (match) => {
        const label = match.substr(match.indexOf('{{') + 2, match.indexOf('}}') - match.indexOf('{{') - 2)
        if (this.toolbox.metric.labels[label]) {
          return this.toolbox.metric.labels[label]
        } else {
          return this.chartInfo.elements[this.toolbox.metric.expressionIndex].expression || ''
        }
      })
      if (data.openIn === 'newTab') {
        window.open(url)
      } else {
        window.location.href = url
      }
      this.clickout()
    },
    copyExpr () {
      const expr = this.chartInfo.elements[this.toolbox.metric.expressionIndex].expression || ''
      const domUrl = document.createElement('input')
      domUrl.value = expr
      domUrl.id = 'creatDom'
      document.body.appendChild(domUrl)
      // 延迟执行选择和复制操作
      setTimeout(() => {
        domUrl.select() // 选择对象
        document.execCommand('Copy') // 执行浏览器复制命令
        // 延迟执行删除操作
        setTimeout(() => {
          const creatDom = document.getElementById('creatDom')
          creatDom.parentNode.removeChild(creatDom)
        })
      })
      this.$message.success({ message: this.$t('overall.copySuccess') })
      this.clickout()
    },
    beforeDownloadCSV (chart) {
      let csv = ''
      switch (chart.type) {
        case 'line' :
        case 'area' :
        case 'point' :
          csv = this.convertTimeSertesToCSV(chart)
          break
        case 'stat' :
        case 'hexagon':
        case 'bar' :
        case 'pie' :
        case 'doughnut' :
        case 'rose' :
        case 'bubble' :
        case 'funnel' :
        case 'rank' :
        case 'sankey' :
        case 'gauge' :
        case 'treemap' :
        // case 'log' :
        // case 'diagram' :
        // case 'url':
        // case 'clock':
          csv = this.convertOtherToCSV(chart)
          break
        case 'table' :
          csv = this.convertTableToCSV(chart)
          break
        default:
      }
      this.downloadCSV(chart, csv)
    },
    downloadCSV (chart, csv) {
      // 首先处理json格式 再根据不同type 导出
      if (window.navigator.msSaveOrOpenBlob) {
        // 兼容ie11
        const blobObject = new Blob([csv])
        window.navigator.msSaveOrOpenBlob(blobObject, chart.name + '.csv')
        this.$message.success(this.$t('tip.downloadSuccess'))
      } else {
        const blob = new Blob([csv])
        const link = document.createElement('a')
        const href = window.URL.createObjectURL(blob) // 下载链接
        link.href = href
        link.download = chart.name + '.csv' // 下载后文件名
        document.body.appendChild(link)
        link.click() // 点击下载
        document.body.removeChild(link) // 下载完成移除元素
        window.URL.revokeObjectURL(href) // 释放blob对象
        this.$message.success(this.$t('tip.downloadSuccess'))
      }
    },
    convertTimeSertesToCSV (chartInfo) {
      const data = this.series
      let csv = '"time","legend","value"\n'
      data.forEach((item, index) => {
        item.data.forEach(value => {
          let val = formatScientificNotation(value[1], this.$lodash.get(chartInfo, 'param.decimals', 2))
          let unit = ''
          if (item.yAxisIndex) {
            unit = chartDataFormat.getUnit(this.$lodash.get(chartInfo, 'param.rightYAxis.unit', 2))
          } else {
            unit = chartDataFormat.getUnit(this.$lodash.get(chartInfo, 'unit', 2))
          }
          val = unit.compute(val, index, -1, chartInfo.param.decimals || 2)
          let legend = this.yasuo(this.legends[index].alias)
          try {
            val = val.trim()
            legend = legend.trim()
          } catch (e) {
            console.log(e)
          }
          csv += `"${this.momentTz(value[0] * 1000)}","${legend}","${val}"\n`
        })
      })
      return csv
    },
    yasuo (str) {
      return str.replace(/\"/g, '\"\"')
    },
    convertOtherToCSV (chartInfo) {
      let csv = '"legend","value"\n'
      let keyByData = ''
      let legend = 'legend'
      switch (chartInfo.type) {
        case 'stat' :
          keyByData = 'statData'
          break
        case 'hexagon':
          keyByData = 'HexagonData'
          break
        case 'bar' :
          legend = 'alias'
          keyByData = 'series[0].data'
          break
        case 'pie' :
          legend = 'alias'
          keyByData = 'doughnutData'
          break
        case 'doughnut' :
          legend = 'alias'
          keyByData = 'doughnutData'
          break
        case 'rose' :
          legend = 'alias'
          keyByData = 'roseData'
          break
        case 'bubble' :
          legend = 'alias'
          keyByData = 'bubbleData'
          break
        case 'funnel' :
          legend = 'alias'
          keyByData = 'funnelData'
          break
        case 'rank' :
          legend = 'alias'
          keyByData = 'rankData'
          break
        case 'sankey' :
          legend = 'alias'
          keyByData = 'linksData'
          break
        case 'gauge' :
          legend = 'alias'
          keyByData = 'gaugeData'
          break
        case 'treemap' :
          legend = 'alias'
          keyByData = 'series[0].data'
          break
      }
      if (!keyByData) {
        return
      }
      this.$lodash.get(this, keyByData, []).forEach(item => {
        let val = item.showValue
        let legends = this.yasuo(item[legend])
        try {
          val = val.trim()
          legends = legends.trim()
        } catch (e) {
          console.log(e)
        }
        csv += `"${legends}","${val}"\n`
      })
      return csv
    },
    convertTableToCSV (chartInfo) {
      let csv = ''
      csv = this.columns.map(item => '"' + this.yasuo(item.title) + '"').join(',')
      csv += '\n'
      this.oldTableData.forEach(item => {
        let arr = []
        this.columns.forEach(column => {
          let val = this.yasuo(item.display[column.title + 'display'].display)
          try {
            val = val.trim()
          } catch (e) {
            console.log(e)
          }
          arr.push(`"${val}"`)
        })
        arr = arr.join(',')
        csv += arr
        csv += '\n'
      })
      return csv
    },
    // 计算最大值向上取整
    calcMax (arr) {
      let maxNum = arr.reduce((maxValue, obj) => {
        return Math.max(maxValue, obj.value)
      }, 0)

      if (maxNum <= 1) {
        return 1
      }

      let bite = 1
      while (maxNum >= 10) {
        maxNum /= 10
        if (maxNum > 1) {
          bite += 1
        }
      }

      return Math.pow(10, bite)
    },
    // 获取值百分比
    getValuePercent (value, minValue, maxValue) {
      // Need special logic for when minValue === maxValue === value to prevent returning NaN
      const valueRatio = Math.min((value - minValue) / (maxValue - minValue), 1)
      return isNaN(valueRatio) ? 0 : valueRatio
    },
    setColorList (arr) {
      this.colorList = []
      const initColorArr = initColor(20)
      const mode = lodash.get(this.chartInfo, 'param.color.mode', 'palette')
      arr.forEach((item, index) => {
        let color = ''
        if (mode === 'palette') {
          color = initColorArr[index] || randomcolor()
        } else if (mode === 'fixed') {
          color = lodash.get(this.chartInfo, 'param.color.fixedColor')
        } else if (mode === 'continuous') {
          const continuousType = lodash.get(this.chartInfo, 'param.color.continuousType')
          const min = lodash.get(this.chartInfo, 'param.min') || 0
          const max = lodash.get(this.chartInfo, 'param.max') || this.calcMax(arr)
          // 获取颜色数组
          const colorArr = this.$CONSTANTS.colorScheme.find(item => item.value == continuousType).color
          const value = parseFloat(item.value)
          const valuePercent = this.getValuePercent(value, min, max)
          // 创建插值函数
          const interpolateColor = interpolateRgbBasis(colorArr)
          color = interpolateColor(valuePercent)
        }
        this.colorList.push(color)
      })
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
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
    // this.downloadCSV()
  },
  beforeDestroy () {
    try {
      getChart(this.chartId) && getChart(this.chartId).off('click')
      getChart(this.chartId) && getChart(this.chartId).off('mousedown')
      getChart(this.chartId) && getChart(this.chartId).off('mousemove')
      getChart(this.chartId) && getChart(this.chartId).getZr().off('mousemove')
    } catch (error) {}
    getChart(this.chartId) && setChart(this.chartId, null)
  }
}
