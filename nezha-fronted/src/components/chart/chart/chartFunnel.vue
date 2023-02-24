<template>
  <div
    ref="funnel-chart-box"
    class="nz-chart__component"
  >
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas" style="display:flex;justify-content: center;align-items: center;"></div>
    <div :class="`chart-canvas-tooltip-${chartId}`" :id="`chart-canvas-tooltip-${chartId}`" class="chart-canvas-tooltip" :style="{left:tooltip.x+'px',top:tooltip.y+'px'}" v-if="tooltip.show">
      <div class="chart-canvas-tooltip-title tooltip-title">
        {{tooltip.title}}
      </div>
      <div class="chart-canvas-tooltip-content">
        <div>value</div>
        <div>
          <div v-if="tooltip.mapping && tooltip.mapping.icon" style="display: inline-block">
            <i :class="tooltip.mapping.icon" :style="{color: tooltip.mapping.color.icon}"></i>
          </div>
          <div style="display: inline-block">{{tooltip.value}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import D3Funnel from './d3-funnel/index.js'
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import { getMetricTypeValue } from '@/components/common/js/tools'
import chartDataFormat from '@/components/chart/chartDataFormat'
import { initColor } from '@/components/chart/chart/tools'
import { getChart, setChart } from '@/components/common/js/common'
import lodash from 'lodash'

export default {
  name: 'chart-funnel',
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
      isInit: true, // 是否是初始化，初始化时为true，图表初始化结束后设为false
      chartId: '',
      funnelData: [],
      tooltip: {
        x: 0,
        y: 0,
        title: 0,
        value: 0,
        mapping: {},
        show: false
      }
    }
  },
  methods: {
    initChart (customAnimate) {
      this.legends = []
      this.initData(this.chartInfo, this.chartData)
      if (this.isNoData) {
        return
      }
      /* 使用setTimeout延迟渲染图表，避免样式错乱 */
      setTimeout(() => {
        this.drawChart(customAnimate)
      }, 200)
    },
    initData (chartInfo, originalDatas) {
      this.funnelData = []
      let colorIndex = 0
      const decimals = this.chartInfo.param.decimals || 2
      this.isNoData = true
      originalDatas.forEach((originalData, expressionIndex) => {
        originalData.forEach((data, dataIndex) => {
          this.isNoData = false
          const value = getMetricTypeValue(data.values, chartInfo.param.statistics)
          const showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(value, null, -1, decimals)
          const mapping = this.selectMapping(value, chartInfo.param.valueMapping, chartInfo.param.enable && this.chartInfo.param.enable.valueMapping)
          const legend = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex)
          this.funnelData.push({
            value: Number(value),
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
            backgroundColor: mapping ? mapping.color.bac.substr(0, 7) : this.colorList[colorIndex], // 仅限十六进制
            label: legend.alias
          })
          colorIndex++
        })
      })
      this.funnelData.sort((a, b) => b.value - a.value)
      this.$emit('chartIsNoData', this.isNoData)
    },
    drawChart (customAnimate) {
      let funnelData = lodash.cloneDeep(this.funnelData)
      const everyZeor = funnelData.every(item => item.value == 0)
      // 判断值是否全部为0
      if (everyZeor) {
        funnelData = funnelData.map(item => {
          return {
            ...item,
            value: 100
          }
        })
      } else {
        funnelData = funnelData.filter(item => item.value !== 0)
      }
      this.$nextTick(() => {
        const options = {
          chart: {
            width: '85%',
            height: '85%',
            bottomPinch: funnelData.length > 1 ? 1 : 0,
            customAnimate: customAnimate === true || this.isInit
          },
          block: {
            dynamicHeight: false,
            highlight: true
          },
          label: {
            format: this.formatterLabel
          },
          events: {
            mouseenter: {
              block: this.chartEnter
            },
            mousemove: {
              block: this.chartMove
            },
            mouseleave: {
              block: this.chartLeave
            }
          }
        }

        const myChart = new D3Funnel(document.getElementById(`chart-canvas-${this.chartId}`))
        myChart.draw(funnelData, options)
        setChart(this.chartId, myChart)
        this.isInit = false
      })
    },
    // 处理label
    formatterLabel   (label, value, e, data) {
      let str = ''
      let valueStr = ''
      if (this.chartInfo.param.text === 'all') {
        str += data.alias
        valueStr = data.mapping && data.mapping.display ? this.handleDisplay(data.mapping.display, { ...data.labels, value: data.showValue }) : data.showValue
      }
      if (this.chartInfo.param.text === 'value' || !this.chartInfo.param.text) {
        valueStr = data.mapping && data.mapping.display ? this.handleDisplay(data.mapping.display, { ...data.labels, value: data.showValue }) : data.showValue
      }
      if (this.chartInfo.param.text === 'legend') {
        str += data.alias
      }
      if (this.chartInfo.param.text === 'none') {
        str += ''
      }
      if (str && valueStr) {
        return `<div style="width:100%;height: 100%;display: flex;align-items: center;justify-content: center;flex-direction: column;cursor: pointer;color:#000000">
                  <p class='text-ellipsis' style="width: 80%;text-align:center;color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                    <span>${str}</span>
                  </p>
                  <p class='text-ellipsis' style="width: 80%;text-align:center;color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                    <i class="${data.mapping && data.mapping.icon}" style="color: ${data.mapping && data.mapping.color && data.mapping.color.icon};font-size:1em;"></i>
                    <span>${valueStr}</span>
                  </p>
                </div>
              `
      } else if (str) {
        return `<div style="width:100%;height: 100%;display: flex;align-items: center;justify-content: center;flex-direction: column;cursor: pointer;color:#000000">
                  <p class='text-ellipsis' style="width: 80%;text-align:center;color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                    <i class="${data.mapping && data.mapping.icon}" style="color: ${data.mapping && data.mapping.color && data.mapping.color.icon};font-size:1em;"></i>
                    <span>${str}</span>
                  </p>
                </div>
              `
      } else if (valueStr) {
        return `<div style="width:100%;height: 100%;display: flex;align-items: center;justify-content: center;flex-direction: column;cursor: pointer;color:#000000">
                  <p class='text-ellipsis' style="width: 80%;text-align:center;color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                    <i class="${data.mapping && data.mapping.icon}" style="color: ${data.mapping && data.mapping.color && data.mapping.color.icon};font-size:1em;"></i>
                    <span>${valueStr}</span>
                  </p>
                </div>
              `
      }
    },
    resize () {
      setTimeout(() => {
        this.drawChart()
      }, 50)
    },
    chartEnter (e, node) {
      this.tooltip.title = node.data.alias
      this.tooltip.value = node.data.showValue
      this.tooltip.mapping = node.data.mapping
      this.tooltip.show = true
      this.setPosition(e)
    },
    chartMove (e) {
      this.tooltip.show = true
      this.setPosition(e)
    },
    chartLeave () {
      this.tooltip.show = false
    },
    setPosition (e) {
      const windowWidth = window.innerWidth// 窗口宽度
      const windowHeight = window.innerHeight// 窗口高度
      const box = document.getElementById(`chart-canvas-tooltip-${this.chartId}`)
      if (box) {
        const boxWidth = box.offsetWidth
        const boxHeight = box.offsetHeight
        if (e.pageX < (windowWidth / 2)) { // 说明鼠标在左边放不下提示框
          this.tooltip.x = e.pageX + 15
        } else {
          this.tooltip.x = e.pageX - boxWidth - 15
        }
        if (e.pageY + 50 + boxHeight < windowHeight) { // 说明鼠标上面放不下提示框
          this.tooltip.y = e.pageY + 15
        } else {
          this.tooltip.y = e.pageY - boxHeight - 10
        }
      } else {
        this.tooltip.y = e.pageY + 15
        this.tooltip.x = e.pageX + 15
      }
    }
  },
  mounted () {
    this.colorList = initColor(20)
    this.chartInfo.loaded && this.initChart(true)
  },
  beforeDestroy () {
    getChart(this.chartId) && getChart(this.chartId).destroy()
  }
}
</script>
