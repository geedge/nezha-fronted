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
      :series="series"
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
import chartDataFormat from '@/components/chart/chartDataFormat'
import { initColor } from '@/components/chart/chart/tools'
import lodash from 'lodash'
import bus from '@/libs/bus'

export default {
  name: 'chart-bar',
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
    initChart (chartOption = this.chartOption) {
      const self = this
      this.legends = []
      this.series = chartOption.series = this.initBarData(this.chartInfo, chartOption.series[0], this.chartData) // 生成series和legends
      if (this.isNoData) {
        return
      }
      chartOption.xAxis.data = chartOption.series[0].data.map(item => {
        if (this.chartInfo.param.text == 'all' || this.chartInfo.param.text == 'legend') {
          return item.name
        } else {
          return ''
        }
      })
      chartOption.axisLabel = {
        margin: 8,
        formatter (params) {
          const dataLength = chartOption.series[0].data.length || 1
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
      chartOption.yAxis.axisLabel.formatter = function (val, index) {
        const value = formatScientificNotation(val, 6)
        let chartUnit = self.chartInfo.unit
        chartUnit = chartUnit || 2
        const unit = chartDataFormat.getUnit(chartUnit)
        return unit.compute(value, index, -1, 2)
      }
      chartOption.tooltip.formatter = this.formatterFunc
      chartOption.tooltip.position = this.tooltipPosition
      if (navigator.userAgent.match(/Mobi/i) ||
        navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/iPhone/i)) {
        chartOption.tooltip.confine = true
        chartOption.tooltip.appendToBody = false
        delete chartOption.tooltip.position
      }
      /* 使用setTimeout延迟渲染图表，避免样式错乱 */
      setTimeout(() => {
        const myChart = this.isInit ? echarts.init(document.getElementById(`chart-canvas-${this.chartId}`)) : getChart(this.chartId)
        if (!myChart) {
          return
        }
        myChart.setOption(chartOption)
        this.isInit && setChart(this.chartId, myChart) // 缓存；不使用vue的data是为避免整个chart被监听导致卡顿
        this.isInit = false
      }, 200)
    },
    initBarData (chartInfo, seriesTemplate, originalDatas) {
      let colorIndex = 0
      const self = this
      const decimals = this.chartInfo.param.decimals || 2
      const s = lodash.cloneDeep(seriesTemplate)
      s.data = []
      originalDatas.forEach((originalData, expressionIndex) => {
        originalData.forEach((data, dataIndex) => {
          this.isNoData = false
          if (s) {
            const value = getMetricTypeValue(data.values, chartInfo.param.statistics)
            const showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(value, null, -1, decimals)
            const mapping = this.selectMapping(value, chartInfo.param.valueMapping, chartInfo.param.enable && this.chartInfo.param.enable.valueMapping)
            // eslint-disable-next-line vue/no-mutating-props
            mapping && this.chartOption.color && (this.chartOption.color[colorIndex] = mapping.color.bac)
            const legend = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex)
            s.data.push({
              value: value,
              realValue: value,
              showValue: showValue,
              name: legend.name,
              alias: legend.alias,
              labels: {
                ...data.metric,
                legend: legend.alias
              },
              seriesIndex: expressionIndex,
              dataIndex: dataIndex,
              mapping: mapping,
              label: {
                ...s.label,
                formatter: this.pieFormatterLabel,
                color: mapping ? mapping.color.text : '#000000'
              },
              itemStyle: {
                color: mapping ? mapping.color.bac : this.colorList[colorIndex]
              }
            })
            colorIndex++
          }
        })
      })
      this.$emit('chartIsNoData', this.isNoData)
      return [s]
    },
    formatterFunc (params, ticket, callback) {
      const self = this
      return `
                <div>
                    <div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;  min-width: 150px; max-width: 600px; line-height: 18px; font-size: 14px;">
                        <div class="tooltip-title" style="max-width: 500px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom: 5px">${params.data.alias}</div>
                        <div style="font-size:12px;display:flex;justify-content: space-between;">
                            <div>value</div>
                            <div>
                              <div style="display: ${params.data.mapping && params.data.mapping.icon ? 'inline-block' : 'none'}">
                                <i class="${params.data.mapping && params.data.mapping.icon}" style="color: ${params.data.mapping && params.data.mapping.color && params.data.mapping.color.icon}"></i>
                              </div>
                              <div style="display: ${params.data.mapping && params.data.mapping.display ? 'none' : 'inline-block'}">${params.data.showValue}</div>
                              <div style="display: ${params.data.mapping && params.data.mapping.display ? 'inline-block' : 'none'}">${self.handleDisplay(params.data.mapping.display, { ...params.data.labels, value: params.data.showValue })}</div>
                            </div>
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
    this.chartInfo.loaded && this.initChart(this.chartOption)
  }
}
</script>
