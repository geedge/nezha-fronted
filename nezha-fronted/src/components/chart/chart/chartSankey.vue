<template>
  <div
    ref="sankey-chart-box"
    class="nz-chart__component nz-chart__component--time-series" @mouseenter="mouseEnterChart"
    @mouseleave="mouseLeaveChart"
    index="300"
  >
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas">
      <svg :id="`sankey-svg-${chartId}`" width="100%" height="100%"></svg>
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
    </div>
  </div>
</template>

<script>
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import * as d3 from 'd3'
import * as d3Sankey from 'd3-sankey'
import { getMetricTypeValue } from '@/components/common/js/tools'
import chartDataFormat from '@/components/chart/chartDataFormat'
import { initColor } from '@/components/chart/chart/tools'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import lodash from 'lodash'

export default {
  name: 'chart-sankey',
  mixins: [chartMixin, chartFormat],
  props: {
    chartInfo: Object,
    chartData: Array,
    chartOption: Object,
    isFullscreen: Boolean
  },
  data () {
    return {
      colorList: [],
      isInit: true, // 是否是初始化，初始化时为true，图表初始化结束后设为false
      chartId: '',
      linksData: [],
      nodesData: [],
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
    initChart () {
      this.linksData = this.initsankeyData(this.chartInfo, this.chartData) // 生成links
      this.isNoData = !this.linksData.length
      this.$emit('chartIsNoData', this.isNoData)
      if (this.isNoData) {
        return
      }
      // 根据link获取node
      this.linksData.forEach(item => {
        this.nodesData.push({ node: item.source })
        this.nodesData.push({ node: item.target })
      })
      // 去重相同的node
      for (let i = 0; i < this.nodesData.length; i++) {
        for (let j = i + 1; j < this.nodesData.length; j++) {
          if (this.nodesData[i].node === this.nodesData[j].node) {
            this.nodesData.splice(j, 1)
            j = j - 1
          }
        }
      }
      /* 使用setTimeout延迟渲染图表，避免样式错乱 */
      setTimeout(() => {
        this.drawSankeyChart()
        this.isInit = false
      }, 200)
    },
    initsankeyData (chartInfo, originalDatas) {
      this.linksData = []
      this.nodesData = []
      const sankeyData = []
      const decimals = this.chartInfo.param.decimals || 2
      this.isNoData = true
      originalDatas.forEach((originalData) => {
        originalData.forEach((data, dataIndex) => {
          const value = getMetricTypeValue(data.values, chartInfo.param.statistics)
          const obj = {
            value: value,
            realValue: value,
            labels: data.metric,
            dataIndex: dataIndex
          }
          if (data.metric[chartInfo.param.sourceLabel] && data.metric[chartInfo.param.targetLabel]) {
            obj.source = data.metric[chartInfo.param.sourceLabel]
            obj.target = data.metric[chartInfo.param.targetLabel]
            sankeyData.push(obj)
          }
        })
      })

      // 汇总 source，target 相同的数据
      const links = []
      const tempObj = {}
      sankeyData.forEach((item) => {
        const key = item.source + '-' + item.target
        if (!Object.prototype.hasOwnProperty.call(tempObj, key)) {
          tempObj[key] = item
          tempObj[key].showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(tempObj[key].value, null, -1, decimals)
        } else {
          const num1 = parseFloat(tempObj[key].value)
          const num2 = parseFloat(item.value)
          tempObj[key].value = num1 + num2
          tempObj[key].showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(tempObj[key].value, null, -1, decimals)
        }
      })
      for (const key in tempObj) {
        links.push(tempObj[key])
      }
      return links
    },

    drawSankeyChart () {
      this.$nextTick(() => {
        // 清空作图区域
        d3.select(`#sankey-svg-${this.chartId}`).selectAll('g').remove()

        // 获取svg宽高 初始化画布
        const svgDom = document.getElementById(`sankey-svg-${this.chartId}`)
        if (!svgDom) {
          return false
        }
        const width = svgDom.getBoundingClientRect().width
        const height = svgDom.getBoundingClientRect().height
        const margin1 = 100
        const margin2 = 50
        const svg = d3.select(`#sankey-svg-${this.chartId}`)
        const chart = svg.append('g').attr('transform', `translate(${margin2}, ${margin2})`)

        // 创建桑基图生成器
        const sankey = d3Sankey
          .sankey()
          .nodeWidth(20)
          .nodePadding(20)
          .size([width - 2 * margin1, height - 2 * margin2])
          .nodeId((d) => d.node)
        const nodesData = lodash.cloneDeep(this.nodesData)
        const linksData = lodash.cloneDeep(this.linksData)
        const { nodes, links } = sankey({
          nodes: nodesData,
          links: linksData
        })

        // 设置节点颜色
        nodes.forEach((item, index) => {
          if (index >= 20) {
            const colorRandom = randomcolor()
            this.colorList.push(colorRandom)
          }
          const mapping = this.selectMapping(item.value, this.chartInfo.param.valueMapping, this.chartInfo.param.enable && this.chartInfo.param.enable.valueMapping)
          item.mapping = mapping
          item.background = mapping ? mapping.color.bac : this.colorList[index]
          const decimals = this.chartInfo.param.decimals || 2
          item.showValue = chartDataFormat.getUnit(this.chartInfo.unit ? this.chartInfo.unit : 2).compute(item.value, null, -1, decimals)
        })

        // 创建一个连线绘制组，绑定连线数据(links)
        chart
          .append('g')
          .attr('fill', 'none')
          .selectAll()
          .data(links)
          .join('path')
          .attr('linkNodes', (d) => { // 设置与当前连线相连的节点(必须以字母开头)
            return 'i-' + d.source.index + ' ' + 'i-' + d.target.index
          })
          .attr('d', d3Sankey.sankeyLinkHorizontal())
          .attr('stroke', (d, i) => {
            return d.source.background
          })
          .attr('stroke-width', (d) => d.width)
          .style('stroke-opacity', '0.5')
          .attr('cursor', 'pointer')
          .style('transition', 'all 0.3s')

        // 创建一个节点绘制组，绑定节点数据(nodes)。
        chart
          .append('g')
          .selectAll()
          .data(nodes)
          .join('g')
          .attr('class', 'node')
          .attr('linkNodes', (d) => { // 设置与当前节点相连的节点(必须以字母开头)
            let nodeStr = ''
            d.targetLinks.forEach(link => {
              nodeStr += 'i-' + link.source.index + ' '
            })
            nodeStr += 'i-' + d.index
            d.sourceLinks.forEach(link => {
              nodeStr += ' ' + 'i-' + link.target.index
            })

            return nodeStr
          })
          .attr('index', (d) => { // 设置标识(必须以字母开头)
            return 'i-' + d.index
          })
          .append('rect')
          .attr('fill', (d, i) => {
            return d.background
          })
          .attr('x', (d) => d.x0)
          .attr('y', (d) => d.y0)
          .attr('height', (d) => d.y1 - d.y0)
          .attr('width', (d) => d.x1 - d.x0)
          .attr('cursor', 'pointer')
          .style('transition', 'all 0.3s')

        // 节点添加文字
        chart
          .selectAll('.node')
          .append('foreignObject')
          // .attr('width', 20)
          .attr('height', function (d) { return d.y1 - d.y0 })
          .attr('x', function (d) { return d.x0 + 30 })
          .attr('y', function (d) { return d.y0 })
          .style('overflow', 'visible')
          .style('cursor', 'pointer')
          .style('transition', 'all 0.3s')
          .html((d) => {
            return this.sankeyFormatterLabel(d)
          })

        // 划过连线
        chart.selectAll('path')
          .on('mouseover', (e, d) => {
            chart.selectAll('.node, path').style('fill-opacity', '0.1').style('stroke-opacity', '0.1')
            chart.selectAll('.node').selectAll('foreignObject').style('opacity', '0.1')
            const hoverNodes = d3.select(e.target).style('stroke-opacity', '0.8').attr('linkNodes').split(' ')
            hoverNodes.forEach((index) => {
              chart.selectAll('[index=' + index + ']').style('fill-opacity', '1').selectAll('foreignObject').style('opacity', '1')
            })
            // 显示悬浮框
            this.tooltip.title = d.source.node + '  ——>  ' + d.target.node
            this.tooltip.value = d.showValue
            this.tooltip.mapping = ''
            this.tooltip.show = true
            this.setPosition(e)
          })
          .on('mousemove', (e) => {
            if (this.tooltip.show) {
              this.setPosition(e)
            }
          })
          .on('mouseleave', () => {
            chart.selectAll('.node, path').style('fill-opacity', '1').style('stroke-opacity', '0.5')
            chart.selectAll('.node').selectAll('foreignObject').style('opacity', '1')
            // 隐藏悬浮框
            this.tooltip.show = false
          })

        // 划过节点
        chart.selectAll('.node')
          .on('mouseover', (e, d) => {
            chart.selectAll('.node, path').style('fill-opacity', '0.1').style('stroke-opacity', '0.1')
            chart.selectAll('.node').selectAll('foreignObject').style('opacity', '0.1')
            chart.selectAll('[linkNodes~=' + 'i-' + d.index + ']')
              .style('fill-opacity', '1')
              .style('stroke-opacity', '0.8')
              .selectAll('foreignObject')
              .style('opacity', '1')
            // 显示悬浮框
            this.tooltip.title = d.node
            this.tooltip.value = d.showValue
            this.tooltip.mapping = d.mapping
            this.tooltip.show = true
            this.setPosition(e)
          })
          .on('mousemove', (e) => {
            if (this.tooltip.show) {
              this.setPosition(e)
            }
          })
          .on('mouseleave', () => {
            chart.selectAll('.node, path').style('fill-opacity', '1').style('stroke-opacity', '0.5')
            chart.selectAll('.node').selectAll('foreignObject').style('opacity', '1')
            // 隐藏悬浮框
            this.tooltip.show = false
          })
      })
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

    // 处理label
    sankeyFormatterLabel (data) {
      let str = ''
      let valueStr = ''
      if (this.chartInfo.param.text === 'all') {
        str += data.node
        valueStr = data.mapping && data.mapping.display ? this.handleDisplay(data.mapping.display, { value: data.showValue }) : data.showValue
      }
      if (this.chartInfo.param.text === 'value' || !this.chartInfo.param.text) {
        valueStr = data.mapping && data.mapping.display ? this.handleDisplay(data.mapping.display, { value: data.showValue }) : data.showValue
      }
      if (this.chartInfo.param.text === 'legend') {
        str += data.node
      }
      if (this.chartInfo.param.text === 'none') {
        str += ''
      }
      if (str && valueStr) {
        return `
              <div style="width:auto;height: 100%;display: flex;justify-content: center;flex-direction: column;">
                <p class="chart-label" style="cursor:pointer;white-space: nowrap;color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                  <span>${str}</span>
                </p>
                <p class="chart-label" style="cursor:pointer;white-space: nowrap;color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                  <i class="${data.mapping && data.mapping.icon}" style="color: ${data.mapping && data.mapping.color && data.mapping.color.icon};font-size:1em;"></i>
                  <span>${valueStr}</span>
                </p>
              </div>
            `
      } else if (str) {
        return `
              <div style="width:auto;height: 100%;display: flex;justify-content: center;flex-direction: column;">
                <p class="chart-label" style="cursor:pointer;white-space: nowrap;color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                  <i class="${data.mapping && data.mapping.icon}" style="color: ${data.mapping && data.mapping.color && data.mapping.color.icon};font-size:1em;"></i>
                  <span>${str}</span>
                </p>
              </div>
            `
      } else if (valueStr) {
        return `
              <div style="width:auto;height: 100%;display: flex;justify-content: center;flex-direction: column;">
                <p class="chart-label" style="cursor:pointer;white-space: nowrap;color: ${data.mapping && data.mapping.color && data.mapping.color.text};">
                  <i class="${data.mapping && data.mapping.icon}" style="color: ${data.mapping && data.mapping.color && data.mapping.color.icon};font-size:1em;"></i>
                  <span>${valueStr}</span>
                </p>
              </div>
            `
      }
    },
    resize () {
      setTimeout(() => {
        this.drawSankeyChart()
      }, 50)
    }
  },
  mounted () {
    this.colorList = initColor(20)
    this.chartInfo.loaded && this.initChart()
  }
}
</script>
