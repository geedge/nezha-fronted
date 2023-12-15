<template>
  <div
    :class="legendPlacement"
    ref="treemap-chart-box"
    class="nz-chart__component nz-chart__component--time-series" @mouseenter="mouseEnterChart"
    @mouseleave="mouseLeaveChart"
  >
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas" :class="{'chart-cursor-default':!(dataLink.length || chartInfo.datasource === 'metrics' || chartInfo.datasource === 'logs')}"></div>
    <chart-legend
      v-if="hasLegend"
      :chart-data="chartData"
      :chart-info="chartInfo"
      :legends="legends"
      :series="series"
      :is-fullscreen="isFullscreen"
    ></chart-legend>
    <!-- toolbox -->
    <div :id="`chart-toolbox-${chartId}`" class="chart-canvas-tooltip no-style-class chart-toolbox" :style="{left:toolbox.x+'px',top:toolbox.y+'px'}" v-if="toolbox.show" v-clickoutside="clickout">
      <div class="chart-canvas-tooltip-title tooltip-title" :title="toolbox.title">{{toolbox.title}}</div>
      <div class="chart-canvas-tooltip-content">
        <div>value</div>
        <div>
          <div v-if="toolbox.mapping && toolbox.mapping.icon" style="display: inline-block">
            <i :class="toolbox.mapping.icon" :style="{color: toolbox.mapping.color.icon}"></i>
          </div>
          <div style="display: inline-block">{{toolbox.value}}</div>
        </div>
      </div>
      <!-- dataLink -->
      <div class="chart-dataLink-list">
        <!-- 复制表达式 -->
        <div class="chart-dataLink-item select-series" v-if="chartInfo.datasource==='metrics'||chartInfo.datasource==='logs'" @click="copyExpr">
          <i class="nz-icon nz-icon-override"></i>
          <span v-if="chartInfo.datasource==='metrics'">{{$t('overall.copy')}} PromQL</span>
          <span v-else>{{$t('overall.copy')}} LogQL</span>
        </div>
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
      this.setColorList(this.series[0].data)
      this.series[0].data.forEach((item, index) => {
        item.itemStyle = {
          color: item.mapping ? item.mapping.color.bac : this.colorList[index]
        }
        this.legends[index].color = item.mapping ? item.mapping.color.bac : this.colorList[index]
      })
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
        const dom = document.getElementById(`chart-canvas-${this.chartId}`)
        if (!dom) {
          return
        }
        const myChart = this.isInit ? echarts.init(dom) : getChart(this.chartId)
        if (!myChart) {
          return
        }
        myChart.setOption(chartOption)
        this.isInit && setChart(this.chartId, myChart) // 缓存；不使用vue的data是为避免整个chart被监听导致卡顿
        if (this.isInit && (this.dataLink.length || this.chartInfo.datasource === 'metrics' || this.chartInfo.datasource === 'logs')) {
          myChart.on('click', this.chartClick)
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
            const legend = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex)
            s.data.push({
              value: parseFloat(value),
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
    toolboxPosition (e) {
      const windowWidth = window.innerWidth// 窗口宽度
      const windowHeight = window.innerHeight// 窗口高度
      this.$nextTick(() => {
        const box = document.getElementById(`chart-toolbox-${this.chartId}`)
        const left = e.pageX - this.$refs['treemap-chart-box'].getBoundingClientRect().left
        const top = e.pageY - this.$refs['treemap-chart-box'].getBoundingClientRect().top
        if (box) {
          const boxWidth = box.offsetWidth
          const boxHeight = box.offsetHeight
          if (e.pageX < (windowWidth / 2)) { // 说明鼠标在左边放不下提示框
            this.toolbox.x = left + 15
          } else {
            this.toolbox.x = left - boxWidth - 15
          }
          if (e.pageY + 50 + boxHeight < windowHeight) { // 说明鼠标上面放不下提示框
            this.toolbox.y = top + 15
          } else {
            this.toolbox.y = top - boxHeight - 10
          }
        }
      })
    },
    chartClick (params) {
      if (!params.dataIndex) { return } // 点击父节点(空白间隙)
      getChart(this.chartId).dispatchAction({
        type: 'hideTip'
      })
      this.toolbox.title = params.data.alias
      this.toolbox.value = params.data.mapping && params.data.mapping.display ? this.handleDisplay(params.data.mapping.display, { ...params.data.labels, value: params.data.showValue }) : params.data.showValue
      this.toolbox.mapping = params.data.mapping
      this.toolbox.show = true
      this.toolbox.metric.labels = params.data.labels
      this.toolbox.metric.expressionIndex = params.data.expressionIndex
      const e = params.event.event
      this.toolboxPosition(e)
    },
    clickout () {
      if ((this.dataLink.length || this.chartInfo.datasource === 'metrics' || this.chartInfo.datasource === 'logs') && this.toolbox.show) {
        this.toolbox.show = false
      }
    }
  },
  mounted () {
    // eslint-disable-next-line vue/no-mutating-props
    this.chartInfo.loaded && this.initChart(this.chartOption)
  }
}
</script>
