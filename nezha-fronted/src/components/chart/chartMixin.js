import lodash from 'lodash'
import { getMetricTypeValue } from '@/components/common/js/tools'
export default {
  data () {
    return {
      colorList: [],
      chartDot: 2,
      legends: [] // { name, alias, color, statistics: [{type: min, value: xxx}, ...] }
    }
  },
  props: {
    chartInfo: Object,
    chartData: Array,
    chartOption: Object
  },
  methods: {
    handleTimeSeries (chartInfo, seriesTemplate, originalDatas) {
      const series = []
      let colorIndex = 0
      originalDatas.forEach((originalData, expressionIndex) => {
        originalData.forEach((data, dataIndex) => {
          const s = lodash.cloneDeep(seriesTemplate)
          s.data = data.values
          s.name = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex)
          if (chartInfo.param.stack) { // 堆叠
            s.stack = 'Total'
          }
          if (!lodash.isEmpty(chartInfo.param.thresholds)) { // 阈值
            s.markLine = {
              symbol: 'circle',
              symbolSize: 5
            }
            s.markLine.data = chartInfo.param.thresholds.map(threshold => {
              return {
                yAxis: threshold.val,
                lineStyle: {
                  color: threshold.color,
                  width: 2,
                  type: 'dotted'
                }
              }
            })
          }
          series.push(s)
          colorIndex++
        })
      })
      return series
    },
    // 单个legend
    handleLegend (chartInfo, data, expressionIndex, dataIndex, colorIndex) {
      let legend = '' // up
      if (data.metric.__name__) {
        legend += `${data.metric.__name__}{`
      }
      const tagKeysArr = Object.keys(data.metric)
      tagKeysArr.forEach(tagKey => {
        if (tagKey !== '__name__') {
          legend += `${tagKey}="${data.metric[tagKey]}",`
        }
        if (legend.endsWith(',')) {
          legend = legend.substr(0, legend.length - 1)
        }
        if (data.metric.__name__) {
          legend += '}'
        }
      })
      if (!legend) {
        legend = chartInfo.elements[expressionIndex].expression
      }
      // 处理legend别名
      let alias = this.handleLegendAlias(legend, chartInfo.elements[expressionIndex].legend)
      if (!alias) {
        alias = legend
      }
      const name = legend + '-' + chartInfo.elements[expressionIndex].id + '-' + dataIndex

      // 若需要统计，处理统计数据
      const statisticsTypes = chartInfo.param.legend.values
      let statistics = []
      if (!lodash.isEmpty(statisticsTypes)) {
        statistics = statisticsTypes.map(type => {
          return { type, value: getMetricTypeValue(data.values, type) }
        })
      }
      this.legends.push({ name, alias, statistics, color: this.colorList[colorIndex] })
      return name
    },
    handleLegendAlias (legend, aliasExpression) {
      if (/\{\{.+\}\}/.test(aliasExpression)) {
        const labelValue = aliasExpression.replace(/(\{\{.+?\}\})/g, function (i) {
          const label = i.substr(i.indexOf('{{') + 2, i.indexOf('}}') - i.indexOf('{{') - 2)
          const reg = new RegExp(label + '=".+?"')
          let value = null
          if (reg.test(legend)) {
            const find = legend.match(reg)[0]
            value = find.substr(find.indexOf('"') + 1, find.lastIndexOf('"') - find.indexOf('"') - 1)
          }
          return value || label
        })
        return labelValue
      } else {
        return aliasExpression
      }
    }
  }
}
