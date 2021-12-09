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
import chartFormat from '@/components/chart/chartFormat'
import { chartLegendPlacement } from '@/components/common/js/constants'
import * as echarts from 'echarts'
import { getChart, setChart } from '@/components/common/js/common'
import { formatScientificNotation, getMetricTypeValue } from '@/components/common/js/tools'
import chartDataFormat from '@/components/charts/chartDataFormat'
import { initColor } from '@/components/chart/chart/tools'
import lodash from 'lodash'

export default {
  name: 'chart-treemap',
  components: {
    chartLegend: legend
  },
  mixins: [chartMixin, chartFormat],
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
      const self = this
      this.legends = []
      chartOption.series = this.initTreeMapData(this.chartInfo, chartOption.series[0], this.chartData) // 生成series和legends
      chartOption.xAxis.data = chartOption.series.data.map(item => item.name)
      chartOption.axisLabel = {
        margin: 8,
        formatter (params) {
          const dataLength = chartOption.series.data.length || 1
          const chartWidth = (document.getElementById('chart-canvas-' + self.chartInfo.id).offsetWidth - 80) / dataLength// 容器宽 - padding - 空余
          const length = Math.ceil((chartWidth) / 16)
          let val = ''
          if (params.length > length) {
            val = params.substr(0, length) + '...'
            return val
          } else {
            return params
          }
        }
      }
      chartOption.tooltip.formatter = this.formatterFunc
      /* 使用setTimeout延迟渲染图表，避免样式错乱 */
      setTimeout(() => {
        const myChart = this.isInit ? echarts.init(document.getElementById(`chart-canvas-${this.chartId}`)) : getChart(this.chartId)
        myChart.setOption(chartOption)
        this.isInit && setChart(this.chartId, myChart) // 缓存；不使用vue的data是为避免整个chart被监听导致卡顿
        this.isInit = false
      }, 200)
    },
    initTreeMapData (chartInfo, seriesTemplate, originalDatas) {
      let colorIndex = 0
      const self = this
      const s = lodash.cloneDeep(seriesTemplate)
      s.data = []
      originalDatas.forEach((originalData, expressionIndex) => {
        originalData.forEach((data, dataIndex) => {
          if (s) {
            const value = getMetricTypeValue(data.values, chartInfo.param.statistics)
            const showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(value, null, -1, 2)
            const mapping = this.selectMapping(value, chartInfo.param.valueMapping)
            // eslint-disable-next-line vue/no-mutating-props
            mapping && (this.chartOption.color[colorIndex] = mapping.color.bac)
            s.data.push({
              value: value,
              realValue: value,
              showValue: showValue,
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
                    color: mapping ? mapping.color.text : '#000000'
                  }
                }
              },
              itemStyle: {
                color: mapping ? mapping.color.bac : this.colorList[colorIndex]
              }
            })
            colorIndex++
          }
        })
      })
      return s
    },
    formatterFunc (params, ticket, callback) {
      const self = this
      return `
                <div>
                    <div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;  min-width: 150px; max-width: 600px; line-height: 18px; font-size: 14px;">
                        <div style="max-width: 500px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom: 5px">${params.data.name}</div>
                        <div style="font-size:12px;display:flex;justify-content: space-between;">
                            <div>value</div>
                             <div style="display: ${params.data.mapping && params.data.mapping.display ? 'none' : 'inline-block'}">${params.data.showValue}</div>
                            <div style="display: ${params.data.mapping && params.data.mapping.display ? 'inline-block' : 'none'}">${self.handleDisplay(params.data.mapping.display, { ...params.data.labels, value: params.data.showValue })}</div>
                        </div>
                    </div>
                </div>
               `
    }
  },
  mounted () {
    // eslint-disable-next-line vue/no-mutating-props
    this.chartOption.color || (this.chartOption.color = initColor(20))
    this.colorList = this.chartOption.color
    try {
      this.isStack = this.chartInfo.param.stack
    } catch (e) {}
    this.initChart(this.chartOption)
  }
}
</script>

<style scoped>

</style>
