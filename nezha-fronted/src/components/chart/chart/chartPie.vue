<template>
  <div
    :class="legendPlacement"
    ref="pie-chart-box"
    class="nz-chart__component nz-chart__component--time-series" @mouseenter="mouseEnterChart"
    @mouseleave="mouseLeaveChart"
  >
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas"></div>
    <chart-legend
      v-if="hasLegend"
      :chart-data="chartData"
      :chart-info="chartInfo"
      :legends="legends"
      :is-fullscreen="isFullscreen"
    ></chart-legend>
  </div>
</template>

<script>
import legend from '@/components/chart/chart/legend'
import chartMixin from '@/components/chart/chartMixin'
import { chartLegendPlacement } from '@/components/common/js/constants'
import * as echarts from 'echarts'
import { getChart, setChart } from '@/components/common/js/common'
import moment from 'moment-timezone'
import bus from '@/libs/bus'
import { formatScientificNotation, getMetricTypeValue } from '@/components/common/js/tools'
import chartDataFormat from '@/components/charts/chartDataFormat'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import { initColor } from '@/components/chart/chart/tools'
import lodash from 'lodash'

export default {
  name: 'chart-pie',
  components: {
    chartLegend: legend
  },
  mixins: [chartMixin],
  props: {
    chartInfo: Object,
    chartData: Array,
    chartOption: Object,
    isFullscreen: Boolean
  },
  computed: {
    hasLegend () {
      try {
        return [chartLegendPlacement.bottom, chartLegendPlacement.left, chartLegendPlacement.right].indexOf(this.chartInfo.param.legend.placement) > -1
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
      chartId: ''
    }
  },
  methods: {
    initChart (chartOption) {
      this.legends = []
      chartOption.series = this.initPieData(this.chartInfo, chartOption.series[0], this.chartData) // 生成series和legends
      // chartOption.series.label.formatter = this.pieFormatterLabel
      chartOption.tooltip.formatter = this.formatterFunc
      console.log(chartOption, 'chartOption')
      /* 使用setTimeout延迟渲染图表，避免样式错乱 */
      setTimeout(() => {
        const myChart = this.isInit ? echarts.init(document.getElementById(`chart-canvas-${this.chartId}`)) : getChart(this.chartId)
        myChart.setOption(chartOption)
        this.isInit && setChart(this.chartId, myChart) // 缓存；不使用vue的data是为避免整个chart被监听导致卡顿
        this.isInit = false
      }, 200)
    },
    getMinMaxFromData (originalDatas) {
      let minTime = null
      let maxTime = null
      let minValue = null
      let maxValue = null
      // 将数据提为二维数组
      let datas = []
      originalDatas.forEach((originalData, expressionIndex) => {
        originalData.forEach((data, dataIndex) => {
          datas = [...datas, ...data.values]
        })
      })
      const timeSorted = datas.sort((a, b) => {
        return a[0] - b[0]
      })
      const valueSorted = datas.sort((a, b) => {
        return a[1] - b[1]
      })
      console.log(timeSorted, valueSorted)
      minTime = timeSorted.length ? timeSorted[0][0] : ''
      maxTime = timeSorted.length ? timeSorted[timeSorted.length - 1][0] : ''
      minValue = valueSorted.length ? valueSorted[0][1] : ''
      maxValue = valueSorted.length ? valueSorted[valueSorted.length - 1][1] : ''
      return { minTime, maxTime, minValue, maxValue }
    },
    initPieData (chartInfo, seriesTemplate, originalDatas) {
      let colorIndex = 0
      const s = lodash.cloneDeep(seriesTemplate)
      s.data = []
      originalDatas.forEach((originalData, expressionIndex) => {
        originalData.forEach((data, dataIndex) => {
          if (s) {
            const value = getMetricTypeValue(data.values, chartInfo.param.statistics)
            const mapping = this.selectMapping(value, chartInfo.param.valueMapping)
            console.log(mapping)
            // eslint-disable-next-line vue/no-mutating-props
            mapping && (this.chartOption.color[colorIndex] = mapping.color.bac)
            s.data.push({
              value: chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(value, null, -1, 2),
              realValue: value,
              name: this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex),
              labels: data.metric,
              seriesIndex: expressionIndex,
              dataIndex: dataIndex,
              mapping: mapping,
              label: {
                ...s.label,
                formatter: this.pieFormatterLabel,
                rich: {
                  color: {
                    color: mapping ? mapping.color.text : '#333333'
                  }
                }
              }
            })
            colorIndex++
          }
        })
      })
      return s
    },
    pieFormatterLabel (params) {
      let str = '{color|'
      if (this.chartInfo.param.text === 'all') {
        str += params.data.name
        str += ' : '
        str += params.data.mapping && params.data.mapping.display ? params.data.mapping.display : params.data.value
      }
      if (this.chartInfo.param.text === 'value') {
        str += params.data.mapping && params.data.mapping.display ? params.data.mapping.display : params.data.value
      }
      if (this.chartInfo.param.text === 'legend') {
        str += params.data.name
      }
      if (this.chartInfo.param.text === 'none') {
        str += ''
      }
      str += '}'
      return str
    },
    formatterFunc: function (params, ticket, callback) {
      const chartInfo = this.chartInfo
      return `<div>
                    <div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;  min-width: 150px; max-width: 600px; line-height: 18px; font-size: 14px;">
                        <div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;margin-bottom: 5px">${params.data.name}</div>
                        <div style="font-size:12px;display:flex;justify-content: space-between;">
                            <div>value</div>
                            <div style="display: ${params.data.mapping && params.data.mapping.display ? 'none' : 'inline-block'}">${chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(params.value, null, -1, 2)}</div>
                            <div style="display: ${params.data.mapping && params.data.mapping.display ? 'inline-block' : 'none'}">${params.data.mapping.display}</div>
                        </div>
                        <div style="font-size:12px;display:flex;justify-content: space-between;">
                            <div>percent</div>
                            <div>${params.percent}%</div>
                        </div>
                    </div>
                </div>
               `
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        this.initChart(this.chartOption)
      }
    }
  },
  mounted () {
    // eslint-disable-next-line vue/no-mutating-props
    this.chartOption.color || (this.chartOption.color = initColor(20))
    this.colorList = this.chartOption.color
    try {
      this.isStack = this.chartInfo.param.stack
    } catch (e) {}
    // this.initChart(this.chartOption)
  }
}
</script>

<style scoped>

</style>
