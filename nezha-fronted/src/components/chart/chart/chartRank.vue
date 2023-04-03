<template>
  <div
    ref="rank-chart-box"
    class="nz-chart__component"
  >
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas" style="overflow-y:auto;">
      <svg :id="`rank-svg-${chartId}`" width="100%" style="vertical-align: top;"></svg>
    </div>
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

      <div class="chart-canvas-tooltip-content">
        <div>rank</div>
        <div>{{tooltip.rank+1}}</div>
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
  name: 'chart-rank',
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
      rankData: [],
      tooltip: {
        x: 0,
        y: 0,
        title: 0,
        value: 0,
        mapping: {},
        rank: 0,
        show: false
      }
    }
  },
  methods: {
    initChart () {
      this.legends = []
      this.initRankData(this.chartInfo, this.chartData)
      this.isNoData = !this.rankData.length
      this.$emit('chartIsNoData', this.isNoData)
      if (this.isNoData) {
        return
      }
      /* 使用setTimeout延迟渲染图表，避免样式错乱 */
      setTimeout(() => {
        this.drawRankChart()
        this.isInit = false
      }, 200)
    },

    initRankData (chartInfo, originalDatas) {
      this.rankData = []
      let colorIndex = 0
      const decimals = this.chartInfo.param.decimals || 2
      this.isNoData = true
      originalDatas.forEach((originalData, expressionIndex) => {
        originalData.forEach((data, dataIndex) => {
          const value = getMetricTypeValue(data.values, chartInfo.param.statistics)
          const showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(value, null, -1, decimals)
          const mapping = this.selectMapping(value, chartInfo.param.valueMapping, chartInfo.param.enable && this.chartInfo.param.enable.valueMapping)
          const legend = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex)
          this.rankData.push({
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
            mapping: mapping
          })
          colorIndex++
        })
      })
    },

    drawRankChart () {
      this.$nextTick(() => {
        d3.select(`#rank-svg-${this.chartId}`).selectAll('g').remove() // 清空作图区域
        // 获取svg宽高 初始化画布
        const svgDom = document.getElementById(`rank-svg-${this.chartId}`)
        if (!svgDom) {
          return false
        }
        const width = svgDom.getBoundingClientRect().width
        // 柱子高度
        const barHeight = 24
        // 柱子间隔
        const margin = 40
        // 计算svg高度
        const height = this.rankData.length * (barHeight + margin) + margin
        const svg = d3.select(`#rank-svg-${this.chartId}`).attr('height', height)
        const bodyX = 50
        const bodyWidth = width - 3 * bodyX

        // 从大到小排序
        let rankData = lodash.cloneDeep(this.rankData)
        rankData.sort((a, b) => b.value - a.value)
        rankData = rankData.map((item, index) => {
          return {
            rank: index,
            background: item.mapping ? item.mapping.color.bac : this.colorList[index],
            ...item
          }
        })

        // 尺度转换
        const scaleX = d3.scaleLinear()
          .domain([0, d3.max(rankData, (d) => parseFloat(d.value))])
          .range([0, bodyWidth])

        // 柱子最小宽度
        const minWidth = 2
        // 渲染柱形
        const bars = svg.append('g')
          .attr('transform', `translate(${bodyX})`)
          .selectAll()
          .data(rankData)
        bars.enter()
          .append('rect')
          .merge(bars)
          .attr('x', 0)
          .attr('y', (d) => {
            return (d.rank * barHeight) + (d.rank + 1) * margin
          })
          .attr('height', barHeight)
          .attr('fill', (d) => d.background)
          .attr('width', (d) => {
            return scaleX(d.value) > minWidth ? scaleX(d.value) : minWidth
          })
          .style('cursor', 'pointer')
          .on('mouseenter', this.rankEnter)
          .on('mousemove', this.rankMove)
          .on('mouseleave', this.rankLeave)
        bars.exit().remove()

        // 文本标签
        svg.append('g')
          .attr('transform', `translate(${bodyX})`)
          .selectAll()
          .data(rankData)
          .enter()
          .append('foreignObject')
          .on('mouseenter', this.rankEnter)
          .on('mousemove', this.rankMove)
          .on('mouseleave', this.rankLeave)
          .html((d) => {
            return this.rankFormatterLabel(d)
          })
          .attr('x', (d) => {
            let x = 0
            if (scaleX(d.value) > minWidth) {
              x = scaleX(d.value) + 10
            } else {
              x = minWidth + 10
            }
            return x
          })
          .attr('y', (d) => {
            return (d.rank * barHeight) + (d.rank + 1) * margin
          })
          .attr('height', barHeight)
          .style('cursor', 'pointer')
          .style('overflow', 'visible')

        // 生成标签和矩形
        svg.append('g')
          .attr('transform', `translate(${bodyX})`)
          .selectAll('text')
          .data(rankData)
          .enter()
          .append('text')
          .attr('class', 'chart-label-text')
          .attr('x', 4)
          .attr('y', d => {
            return (d.rank * barHeight) + (d.rank + 1) * margin - 12
          })
          .text(d => {
            if (this.chartInfo.param.text !== 'all' && this.chartInfo.param.text !== 'legend') {
              return ''
            } else {
              return d.alias
            }
          })
      })
    },

    // 处理label
    rankFormatterLabel (data) {
      let valueStr = ''
      if (this.chartInfo.param.text === 'all') {
        valueStr = data.mapping && data.mapping.display ? this.handleDisplay(data.mapping.display, { ...data.labels, value: data.showValue }) : data.showValue
      }
      if (this.chartInfo.param.text === 'value' || !this.chartInfo.param.text) {
        valueStr = data.mapping && data.mapping.display ? this.handleDisplay(data.mapping.display, { ...data.labels, value: data.showValue }) : data.showValue
      }
      if (valueStr) {
        return `
              <div style="width:auto;height: 100%;display: flex;justify-content: center;flex-direction: column;">
                <p class="chart-label" style="cursor:pointer;white-space: nowrap;color: ${data.mapping && data.mapping.color && data.mapping.color.text}">
                  <i class="${data.mapping && data.mapping.icon}" style="color: ${data.mapping && data.mapping.color && data.mapping.color.icon};font-size:1em;"></i>
                  <span>${valueStr}</span>
                </p>
              </div>
            `
      }
    },

    rankEnter (e, data) { // 移入
      this.tooltip.title = data.alias
      this.tooltip.value = data.showValue
      this.tooltip.mapping = data.mapping
      this.tooltip.rank = data.rank
      this.tooltip.show = true
      this.setPosition(e)
    },
    rankMove (e) { // 移动
      if (this.tooltip.show) {
        this.setPosition(e)
      }
    },
    rankLeave () { // 移出
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

    resize () {
      setTimeout(() => {
        this.drawRankChart()
      }, 50)
    }

  },
  mounted () {
    this.colorList = initColor(20)
    this.chartInfo.loaded && this.initChart()
  },
  beforeDestroy () {
    d3.select(`#rank-svg-${this.chartId}`).selectAll('g').remove() // 清空作图区域
  }
}
</script>
