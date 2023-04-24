<template>
  <div
    :class="legendPlacement"
    ref="rose-chart-box"
    class="nz-chart__component"
  >
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas" style="overflow: hidden;"></div>
    <chart-legend
      v-if="hasLegend"
      :chart-data="chartData"
      :chart-info="chartInfo"
      :legends="legends"
      :is-fullscreen="isFullscreen"
      @clickLegendD3="clickLegendD3"
    ></chart-legend>
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
import * as d3 from 'd3'
import lodash from 'lodash'
import chartFormat from '@/components/chart/chartFormat'
import chartMixin from '@/components/chart/chartMixin'
import chartDataFormat from '@/components/chart/chartDataFormat'
import { getMetricTypeValue } from '@/components/common/js/tools'
import { initColor } from '@/components/chart/chart/tools'
import legend from '@/components/chart/chart/legend'
import { chartLegendPlacement } from '@/components/common/js/constants'
export default {
  name: 'chart-rose',
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
      isInit: true, // 是否是初始化，初始化时为true，图表初始化结束后设为false
      chartId: '',
      roseData: [],
      selectData: [],
      tooltip: {
        x: 0,
        y: 0,
        title: 0,
        value: 0,
        mapping: {},
        show: false
      },
      svg: null
    }
  },
  methods: {
    initChart (animate) {
      this.legends = []
      this.initRoseData(this.chartInfo, this.chartData)
      this.selectData = this.$loadsh.cloneDeep(this.roseData)
      if (this.isNoData) {
        return
      }
      /* 使用setTimeout延迟渲染图表，避免样式错乱 */
      setTimeout(() => {
        this.drawRoseChart(animate)
        this.isInit = false
      }, 200)
    },
    initRoseData (chartInfo, originalDatas) {
      this.roseData = []
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
          this.roseData.push({
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
            background: mapping ? mapping.color.bac : this.colorList[colorIndex]

          })
          colorIndex++
        })
      })
      this.$emit('chartIsNoData', this.isNoData)
    },
    drawRoseChart (animate) {
      const svgDom = document.getElementById(`chart-canvas-${this.chartId}`)
      if (!svgDom) {
        return false
      }

      // 如果数据全为0 则设置默认值（否则图表不显示）
      let roseData = lodash.cloneDeep(this.selectData)
      if (roseData.every(item => item.value == 0)) {
        roseData = roseData.map(item => {
          return {
            ...item,
            value: 100
          }
        })
      }

      const width = svgDom.getBoundingClientRect().width
      const height = svgDom.getBoundingClientRect().height
      let chart
      if (this.svg) {
        chart = this.svg.select('g')
      } else {
        this.svg = d3.select(`#chart-canvas-${this.chartId}`).append('svg').style('display', 'block')
        chart = this.svg.append('g')
      }
      this.svg.attr('width', width)
        .attr('height', height)
        .attr('viewBox', [-width / 2, -height / 2, width, height])

      const outerRadius = (Math.min(width, height) / 2) * 0.6 // outer radius of pie, in pixels
      const innerRadius = 20 // inner radius of pie, in pixels (non-zero for donut)
      const padAngle = 0 // angular separation between wedges
      const radius = 4

      const scale = d3.scaleRadial()
        .domain([0, d3.max(roseData, d => d.value)])
        .range([innerRadius, outerRadius])

      const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(d => {
          return scale(d.data.value)
        })
        .cornerRadius(radius)

      const pie = d3.pie()
        .padAngle(padAngle)
        .sort((a, b) => b.value - a.value)
        .value(d => d.value)

      const arcs = pie(roseData)

      function roseOver (e, d) {
        chart.select('.path-' + d.index)
          .transition()
          .attr('d', d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(d => {
              return scale(d.data.value) * 1.06
            })
            .cornerRadius(radius)
          )
      }
      function roseOut (e, d) {
        chart.select('.path-' + d.index)
          .transition()
          .attr('d', d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(d => scale(d.data.value))
            .cornerRadius(radius)
          )
      }
      // 图形
      chart.selectAll('path')
        .data(arcs)
        .join('path')
        .attr('fill', d => d.data.background)
        .attr('d', arc)
        .attr('class', (d) => 'path-' + d.index)
        .style('cursor', 'pointer')
        .classed('no-events', true)
        .on('mouseover', roseOver)
        .on('mouseout', roseOut)
        .on('mouseenter', this.roseEnter)
        .on('mousemove', this.roseMove)
        .on('mouseleave', this.roseLeave)
        .transition().duration(animate === true ? 600 : 0)
        .attrTween('d', function (d) {
          const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
          return function (t) {
            return arc(i(t))
          }
        })
        .on('end', function () {
          d3.select(this).classed('no-events', false)
        })

      // 文本
      chart
        .selectAll('foreignObject')
        .data(arcs)
        .join('foreignObject')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('class', 'foreign')
        .classed('no-events', true)
        .on('mouseover', roseOver)
        .on('mouseout', roseOut)
        .on('mouseenter', this.roseEnter)
        .on('mousemove', this.roseMove)
        .on('mouseleave', this.roseLeave)
        .style('opacity', 0)
        .html((d) => {
          return d.endAngle - d.startAngle > 0.25 ? this.formatterLabel(d) : ''
        })
        .transition('opacity').duration(animate === true ? 600 : 0)
        .delay(200)
        .style('opacity', 1)
        .on('end', function () {
          d3.select(this).classed('no-events', false)
        })
    },

    // 处理label
    formatterLabel ({ data }) {
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
        return `<div class="foreign-label-wrap">
                  <p class="rose-label" style="color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                    <span>${str}</span>
                  </p>
                  <p class="rose-label" style="color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                    <i class="${data.mapping && data.mapping.icon}" style="color: ${data.mapping && data.mapping.color && data.mapping.color.icon};font-size:1em;"></i>
                    <span>${valueStr}</span>
                  </p>
                </div>
              `
      } else if (str) {
        return `<div class="foreign-label-wrap">
                  <p class="rose-label" style="color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                    <i class="${data.mapping && data.mapping.icon}" style="color: ${data.mapping && data.mapping.color && data.mapping.color.icon};font-size:1em;"></i>
                    <span>${str}</span>
                  </p>
                </div>
              `
      } else if (valueStr) {
        return `<div class="foreign-label-wrap">
                  <p class="rose-label" style="color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                    <i class="${data.mapping && data.mapping.icon}" style="color: ${data.mapping && data.mapping.color && data.mapping.color.icon};font-size:1em;"></i>
                    <span>${valueStr}</span>
                  </p>
                </div>
              `
      }
    },
    roseEnter (e, node) { // 移入气泡
      this.tooltip.title = node.data.alias
      this.tooltip.value = node.data.showValue
      this.tooltip.mapping = node.data.mapping
      this.tooltip.show = true
      this.setPosition(e)
    },
    roseMove (e) { // 气泡内移动
      if (this.tooltip.show) {
        this.tooltip.show = true
        this.setPosition(e)
      }
    },
    roseLeave () { // 移出气泡
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
    },
    clickLegendD3 (isGrey) {
      const data = this.roseData.filter((item, i) => !isGrey[i])
      this.selectData = this.$loadsh.cloneDeep(data)
      this.drawRoseChart(true)
    },
    resize () {
      setTimeout(() => {
        this.drawRoseChart(false)
      }, 50)
    },
    dispose () {
      if (this.svg) {
        this.svg.selectAll('path').on('mouseover', null)
        this.svg.selectAll('path').on('mouseout', null)
        this.svg.selectAll('path').on('mouseenter', null)
        this.svg.selectAll('path').on('mousemove', null)
        this.svg.selectAll('path').on('mouseleave', null)
        this.svg.selectAll('foreignObject').on('mouseover', null)
        this.svg.selectAll('foreignObject').on('mouseout', null)
        this.svg.selectAll('foreignObject').on('mouseenter', null)
        this.svg.selectAll('foreignObject').on('mousemove', null)
        this.svg.selectAll('foreignObject').on('mouseleave', null)
        this.svg.remove()
        this.svg = null
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
