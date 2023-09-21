import lodash from 'lodash'
import chartDataFormat from '@/components/chart/chartDataFormat'
import { formatScientificNotation } from '@/components/common/js/tools'

export default {
  methods: {
    renderYAxis (chartDatas, chartInfo, type) {
      let chartData = lodash.cloneDeep(chartDatas)
      if (type === 'legend') {
        chartData.forEach(item => {
          item.values = item.data
        })
        chartData = chartData.map(item => [item])
      }
      const decimals = chartInfo.param.decimals || 2
      const chartOption = {
        yAxis: [
          {
            axisLabel: {}
          },
          {
            axisLabel: {

            },
            splitLine: {
              show: false
            }
          }
        ]
      }
      // 左y轴
      const leftData = chartData.filter(item => item[0] && !item[0].yAxisIndex)
      const leftInfo = this.getMinMaxFromData(leftData, chartInfo.unit, chartInfo.param) //
      chartOption.yAxis[0].minInterval = chartDataFormat.Interval(leftInfo.maxValue, leftInfo.copies, leftInfo.unit.type, 'min')
      chartOption.yAxis[0].maxInterval = chartDataFormat.Interval(leftInfo.maxValue, leftInfo.copies, leftInfo.unit.type, 'max') * Math.ceil(this.series.length / 5)
      if (chartInfo.param.stack) {
        chartOption.yAxis[0].maxInterval = chartOption.yAxis[0].maxInterval * (Math.ceil(leftData.length / 5) + 1)
      }
      if (leftInfo.unit.type === 'Time' || leftInfo.unit.type === 'Date & Time') {
        delete chartOption.yAxis[0].minInterval
        delete chartOption.yAxis[0].maxInterval
      }
      chartOption.yAxis[0].min = chartInfo.param.min ? chartInfo.param.min : undefined
      chartOption.yAxis[0].max = chartInfo.param.max ? chartInfo.param.max : undefined
      if (!leftInfo.copies) {
        chartOption.yAxis[0].min = 0
        chartOption.yAxis[0].max = 1
      } else if (!chartOption.yAxis[0].max) {
        chartOption.yAxis[0].max = undefined
      }
      if (leftInfo.unit.type == 'Time' || chartOption.yAxis[0].maxInterval === 1) {
        delete chartOption.yAxis[0].maxInterval
      }
      chartOption.yAxis[0].axisLabel.formatter = this.yAxisLabelFormatter(leftInfo.minValue, leftInfo.maxValue, leftInfo.copies, leftInfo.unit, decimals)
      if (!leftData.length) {
        delete chartOption.yAxis[0].min
        delete chartOption.yAxis[0].max
      }
      // 右y轴
      if (this.chartInfo.param.enable.rightYAxis) {
        // 如果全都为右y轴数据 则右y轴显示网格
        const unit = chartDataFormat.getUnit(lodash.get(chartInfo, 'param.rightYAxis.unit', 2))
        const allRight = this.series.every(item => item.yAxisIndex == 1)
        chartOption.yAxis[1].splitLine.show = allRight
        const rightData = chartData.filter(item => item[0] && item[0].yAxisIndex)
        const rightInfo = this.getMinMaxFromData(rightData, lodash.get(chartInfo, 'param.rightYAxis.unit', 2), lodash.get(chartInfo, 'param.rightYAxis', {}))//
        chartOption.yAxis[1].minInterval = chartDataFormat.Interval(rightInfo.maxValue, rightInfo.copies, rightInfo.unit.type, 'min')
        chartOption.yAxis[1].maxInterval = chartDataFormat.Interval(rightInfo.maxValue, rightInfo.copies, rightInfo.unit.type, 'max') * Math.ceil(this.series.length / 5)
        if (chartInfo.param.stack) {
          chartOption.yAxis[1].maxInterval = chartOption.yAxis[1].maxInterval * (Math.ceil(rightData.length / 5) + 1)
        }
        if (unit.type === 'Time' || unit.type === 'Date & Time') {
          delete chartOption.yAxis[1].minInterval
          delete chartOption.yAxis[1].maxInterval
        }
        chartOption.yAxis[1].axisLabel.formatter = this.yAxisLabelFormatter(undefined, undefined, undefined, rightInfo.unit, decimals)
        chartOption.yAxis[1].min = this.chartInfo.param.rightYAxis.min ? this.chartInfo.param.rightYAxis.min : undefined
        chartOption.yAxis[1].max = this.chartInfo.param.rightYAxis.max ? this.chartInfo.param.rightYAxis.max : undefined
        if (!rightInfo.copies) {
          chartOption.yAxis[1].min = 0
          chartOption.yAxis[1].max = 1
        } else if (!chartOption.yAxis[1].max) {
          chartOption.yAxis[1].max = undefined
        }
        if (rightInfo.unit.type == 'Time' || chartOption.yAxis[1].maxInterval === 1) {
          delete chartOption.yAxis[1].maxInterval
        }
        // 有右y轴数据则显示name
        this.hasRightYAxis = this.series.some(item => item.yAxisIndex == 1)
        if (!rightData.length) {
          delete chartOption.yAxis[1].min
          delete chartOption.yAxis[1].max
        }
      }
      return chartOption
    },
    getMinMaxFromData (originalDatas, chartUnit = 2, params) {
      if (params && params.max && params.min) {
        const a = params.max
        if (params.max < params.min) {
          params.max = params.min
          params.min = a
        }
      }
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
      const timeSorted = this.$lodash.sortBy(datas, function (o) { return o[0] })
      const valueSorted = datas.sort((a, b) => {
        const a1 = isNaN(a[1]) || !a[1] ? 0 : Number(a[1])
        const b1 = isNaN(b[1]) || !b[1] ? 0 : Number(b[1])
        return a1 - b1
      })
      minTime = timeSorted.length ? timeSorted[0][0] : ''
      maxTime = timeSorted.length ? timeSorted[timeSorted.length - 1][0] : ''
      minValue = valueSorted.length ? valueSorted[0][1] : 0
      maxValue = valueSorted.length ? valueSorted[valueSorted.length - 1][1] : 0
      if (params) {
        if (params.max) {
          maxValue = params.max
        }
        if (params.min) {
          minValue = params.min
        }
      }
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
    yAxisLabelFormatter (minValue, maxValue, copies, unit, dot) {
      const self = this
      return function (val, index) {
        const value = formatScientificNotation(val, 6)
        return unit.compute(value, index, -1, dot)
      }
    }
  }
}
