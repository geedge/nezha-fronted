<template>
  <div
    :class="legendPlacement"
    ref="doughnut-chart-box"
    class="nz-chart__component nz-chart__component--time-series"
  >
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas"></div>
    <chart-legend
      v-if="hasLegend"
      :chart-data="chartData"
      :chart-info="chartInfo"
      :legends="legends"
      :is-fullscreen="isFullscreen"
      @clickLegendDoughnut="clickLegendDoughnut"
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
  name: 'chart-doughnut',
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
      doughnutData: [],
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
      this.initDoughnutData(this.chartInfo, this.chartData)
      this.selectData = this.$loadsh.cloneDeep(this.doughnutData)
      if (this.isNoData) {
        return
      }
      /* 使用setTimeout延迟渲染图表，避免样式错乱 */
      setTimeout(() => {
        this.drawDoughnutChart(animate)
        this.isInit = false
      }, 200)
    },
    initDoughnutData (chartInfo, originalDatas) {
      this.doughnutData = []
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
          this.doughnutData.push({
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
            background: mapping ? mapping.color.bac : this.colorList[colorIndex]

          })
          colorIndex++
        })
      })
      this.$emit('chartIsNoData', this.isNoData)
    },
    drawDoughnutChart (animate) {
      this.dispose()
      const svgDom = document.getElementById(`chart-canvas-${this.chartId}`)
      if (!svgDom) {
        return false
      }

      // 如果数据全为0 则设置默认值（否则图表不显示）
      let doughnutData = lodash.cloneDeep(this.selectData)
      if (doughnutData.every(item => item.value == 0)) {
        doughnutData = doughnutData.map(item => {
          return {
            ...item,
            value: 100
          }
        })
      }

      const width = svgDom.getBoundingClientRect().width
      const height = svgDom.getBoundingClientRect().height
      this.svg = d3.select(`#chart-canvas-${this.chartId}`).append('svg').attr('height', height).attr('width', width).attr('viewBox', [-width / 2, -height / 2, width, height]).style('display', 'block')
      const chart = this.svg.append('g')

      const outerRadius = (Math.min(width, height) / 2) * 0.6 // outer radius of pie, in pixels
      const innerRadius = outerRadius * 0.67 // inner radius of pie, in pixels (non-zero for donut)
      const padAngle = 0 // angular separation between wedges
      const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius)
      const pie = d3.pie()
        .padAngle(padAngle)
        .sort(null)
        .value(d => d.value)
      const arcs = pie(doughnutData)

      function doughnutOver (e, d) {
        d3.select(chart.selectAll('path').nodes()[d.index])
          .transition()
          .attr('d', d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius * 1.05)
          )
      }
      function doughnutOut (e, d) {
        d3.select(chart.selectAll('path').nodes()[d.index])
          .transition()
          .attr('d', d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
          )
      }

      const that = this
      // 图形
      chart.selectAll('path')
        .data(arcs)
        .join('path')
        .attr('fill', d => d.data.background)
        .attr('d', arc)
        .style('cursor', 'pointer')
        .classed('no-events', true)
        .on('mouseover', doughnutOver)
        .on('mouseout', doughnutOut)
        .on('mouseenter', that.doughnutEnter)
        .on('mousemove', that.doughnutMove)
        .on('mouseleave', that.doughnutLeave)
        .transition().duration(animate === true ? 600 : 0)
        .attrTween('d', (d) => {
          let currentArc = this._current
          if (!currentArc) {
            currentArc = { startAngle: 0, endAngle: 0 }
          }
          const i = d3.interpolate(currentArc, d)
          this._current = i(0) // 当饼图更新时，从当前角度过渡到新角度
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
        .on('mouseover', doughnutOver)
        .on('mouseout', doughnutOut)
        .on('mouseenter', this.doughnutEnter)
        .on('mousemove', this.doughnutMove)
        .on('mouseleave', this.doughnutLeave)
        .style('opacity', 0)
        .html((d) => {
          return d.endAngle - d.startAngle > 0.25 ? this.formatterLabel(d) : ''
        })
        .transition('opacity').duration(animate === true ? 600 : 0)
        .style('opacity', 1)
        .on('end', function () {
          d3.select(this).classed('no-events', false)
        })
    },
    // 处理label
    formatterLabel   ({ data }) {
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
                  <p class="doughnut-label" style="color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                    <span>${str}</span>
                  </p>
                  <p class="doughnut-label" style="color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                    <i class="${data.mapping && data.mapping.icon}" style="color: ${data.mapping && data.mapping.color && data.mapping.color.icon};font-size:1em;"></i>
                    <span>${valueStr}</span>
                  </p>
                </div>
              `
      } else if (str) {
        return `<div class="foreign-label-wrap">
                  <p class="doughnut-label" style="color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                    <i class="${data.mapping && data.mapping.icon}" style="color: ${data.mapping && data.mapping.color && data.mapping.color.icon};font-size:1em;"></i>
                    <span>${str}</span>
                  </p>
                </div>
              `
      } else if (valueStr) {
        return `<div class="foreign-label-wrap">
                  <p class="doughnut-label" style="color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                    <i class="${data.mapping && data.mapping.icon}" style="color: ${data.mapping && data.mapping.color && data.mapping.color.icon};font-size:1em;"></i>
                    <span>${valueStr}</span>
                  </p>
                </div>
              `
      }
    },
    doughnutEnter (e, node) { // 移入气泡
      this.tooltip.title = node.data.alias
      this.tooltip.value = node.data.showValue
      this.tooltip.mapping = node.data.mapping
      this.tooltip.show = true
      this.setPosition(e)
    },
    doughnutMove (e) { // 气泡内移动
      if (this.tooltip.show) {
        this.tooltip.show = true
        this.setPosition(e)
      }
    },
    doughnutLeave () { // 移出气泡
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
    clickLegendDoughnut (isGrey) {
      const data = this.doughnutData.filter((item, i) => !isGrey[i])
      this.selectData = this.$loadsh.cloneDeep(data)
      this.drawDoughnutChart(true)
    },
    resize () {
      setTimeout(() => {
        this.drawDoughnutChart(false)
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
