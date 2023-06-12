<template>
  <div
    ref="bubble-chart-box"
    class="nz-chart__component"
  >
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas" :class="{'chart-cursor-default':!dataLink.length}">
      <svg :id="`bubble-svg-${chartId}`" width="100%" height="100%"></svg>
    </div>
    <div :id="`chart-canvas-tooltip-${chartId}`" class="chart-canvas-tooltip no-style-class" :class="{'chart-dataLink-tooltip':tooltip.dataLinkShow}" :style="{left:tooltip.x+'px',top:tooltip.y+'px'}" v-if="tooltip.show" v-clickoutside="clickout">
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
      <!-- dataLink -->
      <div class="chart-dataLink-list" v-if="tooltip.dataLinkShow">
        <div class="chart-dataLink-item" v-for="(item,index) in dataLink" :key="index" @click="linkClick(item)">
          <i class="nz-icon nz-icon-link"></i>
          <span>{{item.title}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import * as d3 from 'd3'
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
      isInit: true, // 是否是初始化，初始化时为true，图表初始化结束后设为false
      chartId: '',
      bubbleData: [],
      svg: null
    }
  },
  methods: {
    initChart () {
      this.setDataLink()
      this.legends = []
      this.initBubbleData(this.chartInfo, this.chartData)
      if (this.isNoData) {
        return
      }
      /* 使用setTimeout延迟渲染图表，避免样式错乱 */
      setTimeout(() => {
        this.drawBubbleChart()
        this.isInit = false
      }, 200)
    },
    initBubbleData (chartInfo, originalDatas) {
      this.bubbleData = []
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
          this.bubbleData.push({
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
            background: mapping ? mapping.color.bac : this.colorList[colorIndex] // 气泡颜色
          })
          colorIndex++
        })
      })
      this.$emit('chartIsNoData', this.isNoData)
    },
    drawBubbleChart () {
      this.dispose()
      this.svg = d3.select(`#bubble-svg-${this.chartId}`)
      const svgDom = document.getElementById(`bubble-svg-${this.chartId}`)
      if (!svgDom) {
        return false
      }
      const width = svgDom.getBoundingClientRect().width
      const height = svgDom.getBoundingClientRect().height
      // 定义布局方式
      const pack = d3.pack()
        .size([width, height])
        .padding(6)
        // 如果数据全为0 则设置默认值（否则图表不显示）
      let bubbleData = lodash.cloneDeep(this.bubbleData)
      if (bubbleData.every(item => item.value == 0)) {
        bubbleData = bubbleData.map(item => {
          return {
            ...item,
            value: 100 // 目的是显示气泡 与值大小无关
          }
        })
      }
      const data = d3.hierarchy({ children: bubbleData })
        .sum(function (d) {
          return d.value || 0
        })
        .sort(function (a, b) {
          return b.value - a.value
        })
      const nodes = pack(data).descendants()
      const bubbles = this.svg.selectAll('.bubble')
        .data(nodes)
        .enter()
        .filter(function (d) {
          return !d.children
        })
        .append('g')
        .attr('class', 'bubble')

      bubbles.append('circle')
        .style('fill', function (d) {
          return d.data.background
        })
        .attr('cx', function (d) {
          return d.x
        })
        .attr('cy', function (d) {
          return d.y
        })
        .attr('r', function (d) {
          return d.r
        })
      bubbles.append('foreignObject')
        .attr('width', function (d) {
          return d.r * 2
        })
        .attr('height', function (d) {
          return d.r * 2
        })
        .attr('x', function (d) {
          return d.x - d.r
        })
        .attr('y', function (d) {
          return d.y - d.r
        })
        .style('font-size', function (d) {
          let fontSize
          fontSize = d.r / 3 > 10 ? d.r / 3 : 0
          fontSize = fontSize > 30 ? 30 : fontSize
          return fontSize
        })
        .style('border-radius', '50%')
        .style('cursor', 'pointer')
        .html((d) => {
          return this.bubbleFormatterLabel(d)
        })
      bubbles.on('mouseenter', this.bubbleEnter)
      bubbles.on('mousemove', this.bubbleMove)
      bubbles.on('mouseleave', this.bubbleLeave)
      bubbles.on('click', this.chartClick)
      bubbles.on('mousedown', this.chartMousedown)
    },
    // 处理label
    bubbleFormatterLabel (node) {
      let str = ''
      let valueStr = ''
      if (this.chartInfo.param.text === 'all') {
        str += node.data.alias
        valueStr = node.data.mapping && node.data.mapping.display ? this.handleDisplay(node.data.mapping.display, { ...node.data.labels, value: node.data.showValue }) : node.data.showValue
      }
      if (this.chartInfo.param.text === 'value' || !this.chartInfo.param.text) {
        valueStr = node.data.mapping && node.data.mapping.display ? this.handleDisplay(node.data.mapping.display, { ...node.data.labels, value: node.data.showValue }) : node.data.showValue
      }
      if (this.chartInfo.param.text === 'legend') {
        str += node.data.alias
      }
      if (this.chartInfo.param.text === 'none') {
        str += ''
      }
      if (str && valueStr) {
        return `
              <div style="width:100%;height: 100%;display: flex;align-items: center;justify-content: center;flex-direction: column;color:#000000">
                <p style="width: 80%;text-overflow: ellipsis;white-space: nowrap;overflow:hidden;text-align:center;color: ${node.data.mapping && node.data.mapping.color && node.data.mapping.color.text};">
                  <span>${str}</span>
                </p>
                <p style="width: 80%;text-overflow: ellipsis;white-space: nowrap;overflow:hidden;text-align:center;color: ${node.data.mapping && node.data.mapping.color && node.data.mapping.color.text};">
                  <i class="${node.data.mapping && node.data.mapping.icon}" style="color: ${node.data.mapping && node.data.mapping.color && node.data.mapping.color.icon};font-size:1em;"></i>
                  <span>${valueStr}</span>
                </p>
              </div>
            `
      } else if (str) {
        return `
              <div style="width:100%;height: 100%;display: flex;align-items: center;justify-content: center;flex-direction: column;color:#000000">
                <p style="width: 80%;text-overflow: ellipsis;white-space: nowrap;overflow:hidden;text-align:center;color: ${node.data.mapping && node.data.mapping.color && node.data.mapping.color.text};">
                  <i class="${node.data.mapping && node.data.mapping.icon}" style="color: ${node.data.mapping && node.data.mapping.color && node.data.mapping.color.icon};font-size:1em;"></i>
                  <span>${str}</span>
                </p>
              </div>
            `
      } else if (valueStr) {
        return `
              <div style="width:100%;height: 100%;display: flex;align-items: center;justify-content: center;flex-direction: column;color:#000000">
                <p style="width: 80%;text-overflow: ellipsis;white-space: nowrap;overflow:hidden;text-align:center;color: ${node.data.mapping && node.data.mapping.color && node.data.mapping.color.text};">
                  <i class="${node.data.mapping && node.data.mapping.icon}" style="color: ${node.data.mapping && node.data.mapping.color && node.data.mapping.color.icon};font-size:1em;"></i>
                  <span>${valueStr}</span>
                </p>
              </div>
            `
      }
    },
    bubbleEnter (e, node) { // 移入气泡
      if (this.tooltip.dataLinkShow) { return }
      this.tooltip.title = node.data.alias
      this.tooltip.value = node.data.mapping && node.data.mapping.display ? this.handleDisplay(node.data.mapping.display, { ...node.data.labels, value: node.data.showValue }) : node.data.showValue
      this.tooltip.mapping = node.data.mapping
      this.tooltip.show = true
      this.setPosition(e)
    },
    bubbleMove (e) { // 气泡内移动
      if (this.tooltip.dataLinkShow) { return }
      this.tooltip.show = true
      this.setPosition(e)
    },
    bubbleLeave () { // 移出气泡
      if (this.tooltip.dataLinkShow) { return }
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
    resize () {
      setTimeout(() => {
        this.drawBubbleChart()
      }, 50)
    },
    dispose () {
      if (this.svg) {
        this.svg.selectAll('.bubble').on('mouseenter', null)
        this.svg.selectAll('.bubble').on('mousemove', null)
        this.svg.selectAll('.bubble').on('mouseleave', null)
        this.svg.selectAll('.bubble').on('click', null)
        this.svg.selectAll('.bubble').on('mousedown', null)
        this.svg.selectAll('g').remove()
        this.svg = null
      }
    },
    datalinkPosition (e) {
      const windowWidth = window.innerWidth// 窗口宽度
      const windowHeight = window.innerHeight// 窗口高度
      this.$nextTick(() => {
        const box = document.getElementById(`chart-canvas-tooltip-${this.chartId}`)
        const left = e.pageX - this.$refs['bubble-chart-box'].getBoundingClientRect().left
        const top = e.pageY - this.$refs['bubble-chart-box'].getBoundingClientRect().top
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
    chartClick (e, data) {
      if (this.dataLink.length) {
        this.tooltip.title = data.data.alias
        this.tooltip.value = data.data.mapping && data.data.mapping.display ? this.handleDisplay(data.data.mapping.display, { ...data.data.labels, value: data.data.showValue }) : data.data.showValue
        this.tooltip.mapping = data.data.mapping
        this.tooltip.show = true
        this.tooltip.dataLinkShow = true
        this.tooltip.metric.labels = data.data.labels
        this.tooltip.metric.expressionIndex = data.data.seriesIndex
        this.datalinkPosition(e)
      }
    },
    chartMousedown (e) {
      if (this.dataLink.length && this.tooltip.dataLinkShow) {
        e.stopPropagation()
      }
    },
    clickout () {
      if (this.dataLink.length && this.tooltip.dataLinkShow) {
        this.tooltip.show = false
        this.tooltip.dataLinkShow = false
      }
    }
  },
  mounted () {
    this.colorList = initColor(20)
    this.chartInfo.loaded && this.initChart()
  },
  beforeDestroy () {
    this.dispose()
  }
}
</script>
