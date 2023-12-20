<template>
  <div
    :class="legendPlacement"
    ref="doughnut-chart-box"
    class="nz-chart__component"
  >
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas" :class="{'chart-cursor-default':!(dataLink.length || chartInfo.datasource === 'metrics' || chartInfo.datasource === 'logs')}" style="overflow: hidden;"></div>

    <chart-legend
      v-if="hasLegend"
      :chart-data="chartData"
      :chart-info="chartInfo"
      :legends="legends"
      :is-fullscreen="isFullscreen"
      @clickLegendD3="clickLegendD3"
      @hoverLegendD3="hoverLegendD3"
    ></chart-legend>
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
      <div class="chart-canvas-tooltip-content">
        <div>percent</div>
        <div>{{tooltip.percent}}%</div>
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
      <div class="chart-canvas-tooltip-content">
        <div>percent</div>
        <div>{{toolbox.percent}}%</div>
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
      isInit: true, // 是否是初始化，初始化时为true，图表初始化结束后设为false
      chartId: '',
      doughnutData: [],
      selectData: [],
      svg: null,
      drawing: false
    }
  },
  methods: {
    initChart (animate) {
      this.setDataLink()
      this.legends = []
      this.initDoughnutData(this.chartInfo, this.chartData)
      this.selectData = this.$lodash.cloneDeep(this.doughnutData)
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
            value: parseFloat(value),
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
            background: ''

          })
          colorIndex++
        })
      })
      this.setColorList(this.doughnutData)
      this.doughnutData.forEach((item, index) => {
        item.background = item.mapping ? item.mapping.color.bac : this.colorList[index]
        this.legends[index].color = item.mapping ? item.mapping.color.bac : this.colorList[index]
      })
      this.$emit('chartIsNoData', this.isNoData)
    },
    drawDoughnutChart (animate) {
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
      let chart
      if (this.svg) {
        chart = this.svg.select('g')
      } else {
        this.svg = d3.select(`#chart-canvas-${this.chartId}`).append('svg').style('display', 'block')
        chart = this.svg.append('g')
      }
      this.svg
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [-width / 2, -height / 2, width, height])

      const outerRadius = (Math.min(width, height) / 2) * 0.9 // outer radius of pie, in pixels
      const innerRadius = outerRadius * (this.chartInfo.type === 'doughnut' ? 0.67 : 0) // inner radius of pie, in pixels (non-zero for donut)
      const padAngle = 0 // angular separation between wedges
      const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius)
      const pie = d3.pie()
        .padAngle(padAngle)
        .sort(null)
        .value(d => d.value)
      const arcs = pie(doughnutData)

      // 计算百分比
      arcs.forEach(function (d) {
        const percentage = (d.data.value / d3.sum(doughnutData, function (d) { return d.value })) * 100
        d.percent = percentage.toFixed(2)
      })

      const self = this
      function doughnutOver (e, d) {
        if (self.drawing) { return }
        chart.select('.path-' + d.index)
          .transition()
          .attr('d', d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius * 1.06)
          )
      }
      function doughnutOut (e, d) {
        if (self.drawing) { return }
        chart.select('.path-' + d.index)
          .transition()
          .attr('d', d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
          )
      }

      this.drawing = true
      // 图形
      chart.selectAll('path')
        .data(arcs)
        .join('path')
        .attr('fill', d => d.data.background)
        .attr('d', arc)
        .attr('class', (d) => 'path-' + d.index)
        .style('cursor', 'pointer')
        .classed('no-events', true)
        .on('mouseover', doughnutOver)
        .on('mouseout', doughnutOut)
        .on('mouseenter', this.doughnutEnter)
        .on('mousemove', this.doughnutMove)
        .on('mouseleave', this.doughnutLeave)
        .on('click', this.chartClick)
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
        .on('mouseover', doughnutOver)
        .on('mouseout', doughnutOut)
        .on('mouseenter', this.doughnutEnter)
        .on('mousemove', this.doughnutMove)
        .on('mouseleave', this.doughnutLeave)
        .on('click', this.chartClick)
        .style('opacity', 0)
        .html((d) => {
          return d.endAngle - d.startAngle > 0.25 ? this.formatterLabel(d) : ''
        })
        .transition('opacity').duration(animate === true ? 600 : 0)
        .delay(200)
        .style('opacity', 1)
        .on('end', function () {
          d3.select(this).classed('no-events', false)
          self.drawing = false
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
    doughnutEnter (e, node) {
      this.tooltip.title = node.data.alias
      this.tooltip.value = node.data.mapping && node.data.mapping.display ? this.handleDisplay(node.data.mapping.display, { ...node.data.labels, value: node.data.showValue }) : node.data.showValue
      this.tooltip.percent = node.percent
      this.tooltip.mapping = node.data.mapping
      this.tooltip.show = true
      this.setPosition(e)
    },
    doughnutMove (e) {
      this.tooltip.show = true
      this.setPosition(e)
    },
    doughnutLeave () {
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
    clickLegendD3 (isGrey) {
      const data = this.doughnutData.filter((item, i) => !isGrey[i])
      this.selectData = this.$lodash.cloneDeep(data)
      this.drawDoughnutChart(true)
    },
    hoverLegendD3 (legendName, index, type) {
      if (this.svg) {
        const data = this.$lodash.cloneDeep(this.selectData)
        const findIndex = data.findIndex(item => item.name === legendName)
        const chart = this.svg.select('g')
        const mouseover = new CustomEvent('mouseover')
        const mouseout = new CustomEvent('mouseout')
        if (type === 'highlight') {
          chart.select('.path-' + findIndex).node().dispatchEvent(mouseover)
        } else {
          chart.select('.path-' + findIndex).node().dispatchEvent(mouseout)
        }
      }
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
        this.svg.selectAll('path').on('click', null)
        this.svg.selectAll('foreignObject').on('mouseover', null)
        this.svg.selectAll('foreignObject').on('mouseout', null)
        this.svg.selectAll('foreignObject').on('mouseenter', null)
        this.svg.selectAll('foreignObject').on('mousemove', null)
        this.svg.selectAll('foreignObject').on('mouseleave', null)
        this.svg.selectAll('foreignObject').on('click', null)
        this.svg.remove()
        this.svg = null
      }
    },
    toolboxPosition (e) {
      const windowWidth = window.innerWidth// 窗口宽度
      const windowHeight = window.innerHeight// 窗口高度
      this.$nextTick(() => {
        const box = document.getElementById(`chart-toolbox-${this.chartId}`)
        const left = e.pageX - this.$refs['doughnut-chart-box'].getBoundingClientRect().left
        const top = e.pageY - this.$refs['doughnut-chart-box'].getBoundingClientRect().top
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

        this.toolbox.title = data.data.alias
        this.toolbox.value = data.data.mapping && data.data.mapping.display ? this.handleDisplay(data.data.mapping.display, { ...data.data.labels, value: data.data.showValue }) : data.data.showValue
        this.toolbox.percent = data.percent
        this.toolbox.mapping = data.data.mapping
        this.toolbox.show = true
        this.toolbox.metric.labels = data.data.labels
        this.toolbox.metric.expressionIndex = data.data.expressionIndex
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
    this.chartInfo.loaded && this.initChart(true)
  },
  beforeDestroy () {
    this.dispose()
  }
}
</script>
