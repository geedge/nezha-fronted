<template>
  <div
    ref="funnel-chart-box"
    class="nz-chart__component"
  >
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas" :class="{'chart-cursor-default':!(dataLink.length || chartInfo.datasource === 'metrics' || chartInfo.datasource === 'logs')}">
      <svg :id="`funnel-svg-${chartId}`" width="100%" height="100%"></svg>
    </div>
    <!-- tooltip -->
    <div :id="`chart-canvas-tooltip-${chartId}`" class="chart-canvas-tooltip no-style-class" :style="{left:tooltip.x+'px',top:tooltip.y+'px'}" v-if="tooltip.show">
      <div class="chart-canvas-tooltip-title tooltip-title" :title="tooltip.title">
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
    <!-- toolbox -->
    <div :id="`chart-toolbox-${chartId}`" class="chart-canvas-tooltip no-style-class chart-toolbox" :style="{left:toolbox.x+'px',top:toolbox.y+'px'}" v-if="toolbox.show" v-clickoutside="clickout">
      <div class="chart-canvas-tooltip-title tooltip-title" :title="toolbox.title">
        {{toolbox.title}}
      </div>
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
import * as d3 from 'd3'
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import { getMetricTypeValue } from '@/components/common/js/tools'
import chartDataFormat from '@/components/chart/chartDataFormat'
import { initColor } from '@/components/chart/chart/tools'
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
      svg: null
    }
  },
  methods: {
    initChart (animate) {
      this.setDataLink()
      this.legends = []
      this.initData(this.chartInfo, this.chartData)
      if (this.isNoData) {
        return
      }
      /* 使用setTimeout延迟渲染图表，避免样式错乱 */
      setTimeout(() => {
        this.drawChart(animate)
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
            expressionIndex: expressionIndex,
            dataIndex: dataIndex,
            mapping: mapping,
            background: mapping ? mapping.color.bac.substr(0, 7) : this.colorList[colorIndex], // 仅限十六进制
            label: legend.alias
          })
          colorIndex++
        })
      })
      this.funnelData.sort((a, b) => b.value - a.value)
      this.$emit('chartIsNoData', this.isNoData)
    },
    drawChart (animate) {
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
      this.dispose()
      // 获取svg宽高 初始化画布
      const svgDom = document.getElementById(`funnel-svg-${this.chartId}`)
      if (!svgDom) {
        return false
      }
      const width = svgDom.getBoundingClientRect().width
      const height = svgDom.getBoundingClientRect().height
      const margin = 20
      const chartWidth = width - margin * 2
      const chartHeight = height - margin * 2

      // 每个块的高度
      const trapezoidPadding = 2
      const trapezoidsHeight = (chartHeight - trapezoidPadding * (funnelData.length - 1)) / funnelData.length

      const scale = d3.scaleLinear()
        .domain([0, d3.max(funnelData, (d) => d.value)])
        .range([0, chartWidth * 0.8])

      // 数据处理
      funnelData = funnelData.map((d, i, array) => {
        d.index = i
        if (i !== array.length - 1) {
          d.nextValue = array[i + 1].value
        } else {
          d.nextValue = 0
        }
        return d
      }
      )
      this.svg = d3.select(`#funnel-svg-${this.chartId}`)
      const chart = this.svg.append('g').attr('width', chartWidth).attr('height', chartHeight).attr('transform', `translate(${margin}, ${margin})`)

      // 渲染梯形
      const trapezoids = chart
        .append('g')
        .attr('class', 'traps')
        .attr('transform', 'translate(' + chartWidth / 2 + ',0)')
        .selectAll('.trap')
        .data(funnelData)
      trapezoids.enter()
        .append('polygon')
        .attr('class', (d) => 'trap  trap-' + d.index)
        .merge(trapezoids)
        .attr('points', (d) => getPoints(scale(d.value), scale(d.nextValue), trapezoidsHeight))
        .attr('transform', (d, i) => 'translate(0,' + i * (trapezoidPadding + trapezoidsHeight) + ')')
        .attr('fill', (d) => d.background)
        .style('opacity', 0)
        .transition('opacity').duration(animate === true ? 600 : 0)
        .style('opacity', 1)
        .style('cursor', 'pointer')
      trapezoids.exit()
        .remove()

      // 绑定交互事件
      chart.selectAll('.trap')
        .on('mouseover', (e, d) => {
          // 划过变色
          d3.select(e.target).transition('fill').attr('fill', this.shade(d.background, 0.2))
          this.chartEnter(e, d)
        })
        .on('mousemove', this.chartMove)
        .on('mouseleave', (e, d) => {
          d3.select(e.target).transition('fill').attr('fill', d.background)
          this.chartLeave()
        })
        .on('click', this.chartClick)

      function getPoints (topWidth, bottomWidth, height) {
        const points = []
        points.push(-topWidth / 2 + ',' + 0)
        points.push(topWidth / 2 + ',' + 0)
        if (bottomWidth === 0) {
          points.push(0 + ',' + height)
        } else {
          points.push(bottomWidth / 2 + ',' + height)
          points.push(-bottomWidth / 2 + ',' + height)
        }
        return points.join(' ')
      }

      // 渲染文本标签
      const texts = chart.select('.traps')
        .selectAll('.foreign')
        .data(funnelData)
      texts.enter()
        .append('foreignObject')
        .attr('class', 'foreign')
        .merge(texts)
        .html((d) => this.formatterLabel(d, trapezoidsHeight))
        .attr('x', 0)
        .attr('y', (d, i) => i * (trapezoidPadding + trapezoidsHeight) + trapezoidsHeight / 2)
      // 绑定交互事件
        .on('mouseover', (e, d) => {
          chart.select('.trap-' + d.index).transition('fill').attr('fill', this.shade(d.background, 0.2))
          this.chartEnter(e, d)
        })
        .on('mousemove', this.chartMove)
        .on('mouseleave', (e, d) => {
          chart.select('.trap-' + d.index).transition('fill').attr('fill', d.background)
          this.chartLeave()
        })
        .on('click', this.chartClick)
        .style('opacity', 0)
        .transition('opacity').duration(animate === true ? 600 : 0)
        .style('opacity', 1)
      texts.exit()
        .remove()

      this.isInit = false
    },
    // 处理label
    formatterLabel   (data, height) {
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
        if (height < 32) {
          return ''
        }
        return `<div class="foreign-label-wrap">
                  <p class="funnel-label" style="color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                    <span>${str}</span>
                  </p>
                  <p class="funnel-label" style="color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                    <i class="${data.mapping && data.mapping.icon}" style="color: ${data.mapping && data.mapping.color && data.mapping.color.icon};font-size:1em;"></i>
                    <span>${valueStr}</span>
                  </p>
                </div>
              `
      } else if (str) {
        if (height < 16) {
          return ''
        }
        return `<div class="foreign-label-wrap">
                  <p class="funnel-label" style="color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                    <i class="${data.mapping && data.mapping.icon}" style="color: ${data.mapping && data.mapping.color && data.mapping.color.icon};font-size:1em;"></i>
                    <span>${str}</span>
                  </p>
                </div>
              `
      } else if (valueStr) {
        if (height < 16) {
          return ''
        }
        return `<div class="foreign-label-wrap">
                  <p class="funnel-label" style="color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                    <i class="${data.mapping && data.mapping.icon}" style="color: ${data.mapping && data.mapping.color && data.mapping.color.icon};font-size:1em;"></i>
                    <span>${valueStr}</span>
                  </p>
                </div>
              `
      }
    },
    chartEnter (e, data) {
      this.tooltip.title = data.alias
      this.tooltip.value = data.mapping && data.mapping.display ? this.handleDisplay(data.mapping.display, { ...data.labels, value: data.showValue }) : data.showValue
      this.tooltip.mapping = data.mapping
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
      this.$nextTick(() => {
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
          this.tooltip.x = e.pageX + 15
          this.tooltip.y = e.pageY + 15
        }
      })
    },
    /**
     * Convert a hex color to an RGB object.
     *
     * @param {string} color
     *
     * @returns {{R: Number, G: number, B: number}}
     */
    hexToRgb (color) {
      let hex = color.slice(1)
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
      }
      const f = parseInt(hex, 16)
      const R = f >> 16
      const G = (f >> 8) & 0x00FF
      const B = f & 0x0000FF
      return { R, G, B }
    },
    /**
     * Shade a color to the given percentage.
     *
     * @param {string} color A hex color.
     * @param {number} shade The shade adjustment. Can be positive or negative.
     *
     * @return {string}
     */
    shade (color, shade) {
      const { R, G, B } = this.hexToRgb(color)
      const t = shade < 0 ? 0 : 255
      const p = shade < 0 ? shade * -1 : shade

      const converted = 0x1000000 +
            ((Math.round((t - R) * p) + R) * 0x10000) +
            ((Math.round((t - G) * p) + G) * 0x100) +
            (Math.round((t - B) * p) + B)

      return `#${converted.toString(16).slice(1)}`
    },
    resize () {
      setTimeout(() => {
        this.drawChart()
      }, 50)
    },
    dispose () {
      if (this.svg) {
        this.svg.selectAll('.trap').on('mouseover', null)
        this.svg.selectAll('.trap').on('mousemove', null)
        this.svg.selectAll('.trap').on('mouseleave', null)
        this.svg.selectAll('.trap').on('click', null)
        this.svg.selectAll('foreignObject').on('mouseover', null)
        this.svg.selectAll('foreignObject').on('mousemove', null)
        this.svg.selectAll('foreignObject').on('mouseleave', null)
        this.svg.selectAll('foreignObject').on('click', null)
        this.svg.selectAll('g').remove()
        this.svg = null
      }
    },
    toolboxPosition (e) {
      const windowWidth = window.innerWidth// 窗口宽度
      const windowHeight = window.innerHeight// 窗口高度
      this.$nextTick(() => {
        const box = document.getElementById(`chart-toolbox-${this.chartId}`)
        const left = e.pageX - this.$refs['funnel-chart-box'].getBoundingClientRect().left
        const top = e.pageY - this.$refs['funnel-chart-box'].getBoundingClientRect().top
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
    chartClick (e, data) {
      if (this.dataLink.length || this.chartInfo.datasource === 'metrics' || this.chartInfo.datasource === 'logs') {
        this.tooltip.show = false

        this.toolbox.title = data.alias
        this.toolbox.value = data.mapping && data.mapping.display ? this.handleDisplay(data.mapping.display, { ...data.labels, value: data.showValue }) : data.showValue
        this.toolbox.mapping = data.mapping
        this.toolbox.show = true
        this.toolbox.metric.labels = data.labels
        this.toolbox.metric.expressionIndex = data.expressionIndex
        this.toolboxPosition(e)
      }
    },
    clickout () {
      if ((this.dataLink.length || this.chartInfo.datasource === 'metrics' || this.chartInfo.datasource === 'logs') && this.toolbox.show) {
        this.toolbox.show = false
      }
    }
  },
  mounted () {
    this.colorList = initColor(20)
    this.chartInfo.loaded && this.initChart(true)
  },
  beforeDestroy () {
    this.dispose()
  }
}
</script>
