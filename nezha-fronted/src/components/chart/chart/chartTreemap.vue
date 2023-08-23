<template>
  <div
    :class="legendPlacement"
    ref="treemap-chart-box"
    class="nz-chart__component nz-chart__component--time-series" @mouseenter="mouseEnterChart"
    @mouseleave="mouseLeaveChart"
  >
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas" :class="{'chart-cursor-default':!dataLink.length}"></div>
    <chart-legend
      v-if="hasLegend"
      :chart-data="chartData"
      :chart-info="chartInfo"
      :legends="legends"
      :series="series"
      :is-fullscreen="isFullscreen"
    ></chart-legend>

    <div :id="`chart-canvas-tooltip-${chartId}`" class="chart-canvas-tooltip no-style-class" :class="{'chart-dataLink-tooltip':tooltip.dataLinkShow}" :style="{left:tooltip.x+'px',top:tooltip.y+'px'}" v-if="tooltip.show" v-clickoutside="clickout">
      <div class="chart-canvas-tooltip-title tooltip-title" :title="tooltip.title">{{tooltip.title}}</div>
      <div class="chart-canvas-tooltip-content">
        <div>value</div>
        <div>
          <div v-if="tooltip.mapping && tooltip.mapping.icon" style="display: inline-block">
            <i :class="tooltip.mapping.icon" :style="{color: tooltip.mapping.color.icon}"></i>
          </div>
          <div style="display: inline-block">{{tooltip.value}}</div>
        </div>
      </div>
      <!-- dataLink -->
      <div class="chart-dataLink-list" v-if="tooltip.dataLinkShow">
        <div class="chart-dataLink-item" v-for="(item,index) in dataLink" :title='item.title' :key="index" @click="linkClick(item)">
          <i class="nz-icon nz-icon-link"></i>
          <span>{{item.title}}</span>
        </div>
      </div>
    </div>
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
        return [chartLegendPlacement.bottom, chartLegendPlacement.left, chartLegendPlacement.right].indexOf(this.chartInfo.param.legend.placement) > -1 && this.chartInfo.param.enable.legend
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
      this.setDataLink()
      this.legends = []
      this.series = chartOption.series = this.initTreeMapData(this.chartInfo, chartOption.series[0], this.chartData) // 生成series和legends
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
        if (this.isInit && this.dataLink.length) {
          myChart.on('click', this.chartClick)
          myChart.on('mousedown', (params) => {
            if (this.tooltip.dataLinkShow && params.dataIndex) {
              const e = params.event.event
              e.stopPropagation()
            }
          })
        }
        this.isInit = false
      }, 200)
    },
    initTreeMapData (chartInfo, seriesTemplate, originalDatas) {
      let colorIndex = 0
      const self = this
      const decimals = this.chartInfo.param.decimals || 2
      const s = lodash.cloneDeep(seriesTemplate)
      s.data = []
      this.isNoData = true
      originalDatas.forEach((originalData, expressionIndex) => {
        originalData.forEach((data, dataIndex) => {
          this.isNoData = false
          if (s) {
            const value = getMetricTypeValue(data.values, chartInfo.param.statistics)
            const showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(value, null, -1, decimals)
            const mapping = this.selectMapping(value, chartInfo.param.valueMapping, chartInfo.param.enable && this.chartInfo.param.enable.valueMapping)
            // eslint-disable-next-line vue/no-mutating-props
            this.chartOption.color && mapping && (this.chartOption.color[colorIndex] = mapping.color.bac)
            const legend = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex)
            s.data.push({
              value: value,
              realValue: value,
              showValue: showValue,
              name: legend.name,
              alias: legend.alias,
              labels: data.metric,
              expressionIndex: expressionIndex,
              dataIndex: dataIndex,
              mapping: mapping,
              label: {
                ...s.label,
                formatter: this.pieFormatterLabel,
                verticalAlign: 'middle',
                align: 'center',
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
      if (!params.data || !params.dataIndex) {
        return ''
      }
      return `
              <div class="chart-canvas-tooltip-title tooltip-title" titlr="${params.data.alias}">${params.data.alias}</div>
              <div class="chart-canvas-tooltip-content">
                <div>value</div>
                <div>
                  <div style="display: ${params.data.mapping && params.data.mapping.icon ? 'inline-block' : 'none'}">
                    <i class="${params.data.mapping && params.data.mapping.icon}" style="color: ${params.data.mapping && params.data.mapping.color && params.data.mapping.color.icon}"></i>
                  </div>
                  <div style="display: ${params.data.mapping && params.data.mapping.display ? 'none' : 'inline-block'}">${params.data.showValue}</div>
                  <div style="display: ${params.data.mapping && params.data.mapping.display ? 'inline-block' : 'none'}">${self.handleDisplay(params.data.mapping.display, { ...params.data.labels, value: params.data.showValue })}</div>
                </div>
              </div>
               `
    },
    datalinkPosition (e) {
      const windowWidth = window.innerWidth// 窗口宽度
      const windowHeight = window.innerHeight// 窗口高度
      this.$nextTick(() => {
        const box = document.getElementById(`chart-canvas-tooltip-${this.chartId}`)
        const left = e.pageX - this.$refs['treemap-chart-box'].getBoundingClientRect().left
        const top = e.pageY - this.$refs['treemap-chart-box'].getBoundingClientRect().top
        if (box) {
          const boxWidth = box.offsetWidth
          const boxHeight = box.offsetHeight
          if (e.pageX < (windowWidth / 2)) { // 说明鼠标在左边放不下提示框
            this.tooltip.x = left + 15
          } else {
            this.tooltip.x = left - boxWidth - 15
          }
          if (e.pageY + 50 + boxHeight < windowHeight) { // 说明鼠标上面放不下提示框
            this.tooltip.y = top + 15
          } else {
            this.tooltip.y = top - boxHeight - 10
          }
        }
      })
    },
    chartClick (params) {
      if (!params.dataIndex) { return } // 点击父节点(空白间隙)
      const option = {
        tooltip: {
          extraCssText: 'z-index:99999999;visibility:hidden;transition:none;'
        }
      }
      getChart(this.chartId).setOption(option)
      this.tooltip.title = params.data.alias
      this.tooltip.value = params.data.mapping && params.data.mapping.display ? this.handleDisplay(params.data.mapping.display, { ...params.data.labels, value: params.data.showValue }) : params.data.showValue
      this.tooltip.mapping = params.data.mapping
      this.tooltip.show = true
      this.tooltip.dataLinkShow = true
      this.tooltip.metric.labels = params.data.labels
      this.tooltip.metric.expressionIndex = params.data.expressionIndex
      const e = params.event.event
      this.datalinkPosition(e)
    },
    clickout () {
      if (this.dataLink.length) {
        this.tooltip.show = false
        this.tooltip.dataLinkShow = false
        const option = {
          tooltip: {
            extraCssText: 'z-index:99999999;visibility:visible;'
          }
        }
        getChart(this.chartId).setOption(option)
      }
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
