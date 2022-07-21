<template>
  <div
    ref="pie-chart-box"
    class="nz-chart__component nz-chart__component--time-series" @mouseenter="mouseEnterChart"
    @mouseleave="mouseLeaveChart"
  >
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas"></div>
  </div>
</template>

<script>
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import * as echarts from 'echarts'
import * as d3 from 'd3'
import { getChart, setChart } from '@/components/common/js/common'
import { getMetricTypeValue } from '@/components/common/js/tools'
import chartDataFormat from '@/components/chart/chartDataFormat'
import { initColor } from '@/components/chart/chart/tools'
import lodash from 'lodash'

export default {
  name: 'chart-bubble',
  components: {
  },
  mixins: [chartMixin, chartFormat],
  props: {
    chartInfo: Object,
    chartData: Array,
    chartOption: Object,
    isFullscreen: Boolean
  },
  computed: {

  },
  data () {
    return {
      colorList: [],
      chartDot: 2,
      isInit: true, // 是否是初始化，初始化时为true，图表初始化结束后设为false
      chartId: ''
    }
  },
  methods: {
    initChart (chartOption = this.chartOption) {
      this.legends = []
      const parentNode = {
        id: 'parentNode',
        name: 'parentNode',
        depth: -1
      }
      chartOption.dataset.source = [parentNode, ...this.initBubbleData(this.chartInfo, [], this.chartData)]
      if (this.isNoData) {
        return
      }
      chartOption.series[0].renderItem = this.renderItem
      chartOption.tooltip.formatter = this.formatterFunc
      chartOption.tooltip.position = this.tooltipPosition
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
    initBubbleData (chartInfo, seriesTemplate, originalDatas) {
      let colorIndex = 0
      const decimals = this.chartInfo.param.decimals || 2
      const s = lodash.cloneDeep(seriesTemplate)
      this.isNoData = true
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
            s.push({
              value: value,
              realValue: value,
              showValue: showValue,
              name: legend.name,
              alias: legend.alias,
              labels: data.metric,
              seriesIndex: expressionIndex,
              dataIndex: dataIndex,
              mapping: mapping,
              id: colorIndex, // 气泡id
              background: mapping ? mapping.color.bac : this.colorList[colorIndex] // 气泡颜色
            })
            colorIndex++
          }
        })
      })
      this.$emit('chartIsNoData', this.isNoData)
      return s
    },
    formatterFunc: function (params, ticket, callback) {
      const self = this
      return `<div>
                    <div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;  min-width: 150px; max-width: 600px; line-height: 18px; font-size: 14px;">
                        <div class="tooltip-title" style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;margin-bottom: 5px">${params.data.alias}</div>
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
    },
    renderItem (params, api) {
      // 如果数据全为0 则设置默认值（否则图表不显示）
      let seriesData = lodash.cloneDeep(this.chartOption.dataset.source)
      if (seriesData.every(item => !item.value || item.value == 0)) {
        seriesData = seriesData.map(item => {
          if (item.id !== 'parentNode') {
            return {
              ...item,
              value: 100
            }
          } else {
            return {
              ...item
            }
          }
        })
      }
      const displayRoot = stratify()
      function stratify () {
        return d3
          .stratify()
          .parentId(function (d) {
          // 判断是否是父节点
            if (d.id !== 'parentNode') {
              return 'parentNode'
            }
          })(seriesData)
          .sum(function (d) {
            return d.value || 0
          })
          .sort(function (a, b) {
            return b.value - a.value
          })
      }
      function overallLayout (params, api) {
        const context = params.context
        d3
          .pack()
          .size([api.getWidth() - 2, api.getHeight() - 2])
          .padding(6)(displayRoot)
        context.nodes = {}
        displayRoot.descendants().forEach(function (node) {
          context.nodes[node.id] = node
        })
      }
      const context = params.context
      // Only do that layout once in each time `setOption` called.
      // 每次调用“setOption”时，只能进行一次布局。
      if (!context.layout) {
        context.layout = true
        overallLayout(params, api)
      }
      const nodePath = api.value('id')
      // const nodeName = nodePath
      //   .slice(nodePath.lastIndexOf('.') + 1)
      //   .split(/(?=[A-Z][^A-Z])/g)
      //   .join('')
      const node = context.nodes[nodePath]
      if (node.id === 'parentNode') {
        node.r = 0
      }
      if (!node) {
        // Reder nothing.
        return
      }
      const z2 = api.value('depth') * 2
      return {
        type: 'circle',
        shape: {
          cx: node.x,
          cy: node.y,
          r: node.r
        },
        transition: ['shape'],
        z2: z2,
        textContent: {
          type: 'text',
          style: {
            // transition: isLeaf ? 'fontSize' : null,
            text: this.pieFormatterLabel(node),
            fill: node.data.mapping ? node.data.mapping.color.text : '#000000',
            width: node.r * 1.3,
            overflow: 'truncate',
            fontSize: node.r / 3,
            lineHeight: node.r / 2.2

          },
          emphasis: {
            style: {
              // overflow: null,
              // fontSize: Math.max(node.r / 3, 12)
            }
          }
        },
        textConfig: {
          position: 'inside'
        },
        style: {
          fill: node.data.background
        },
        emphasis: {
          style: {
            // shadowBlur: 20,
            // shadowOffsetX: 3,
            // shadowOffsetY: 5,
            // shadowColor: 'rgba(0,0,0,0.3)'
          }
        }
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
    this.chartInfo.loaded && this.initChart(this.chartOption)
  }
}
</script>

<style scoped>

</style>
