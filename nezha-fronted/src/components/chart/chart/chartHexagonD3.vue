<template>
  <div :ref="`chart-canvas-${chartId}`" style="height: 100%;width: 100%">
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas chart-svg"></div>
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
import hexbin from '@/components/chart/chart/options/chartHexagonD3'
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import { initColor } from '@/components/chart/chart/tools'
import '@svgdotjs/svg.panzoom.js'
import { getMetricTypeValue } from '@/components/common/js/tools'
import chartDataFormat from '@/components/chart/chartDataFormat'
export default {
  name: 'chartHexagonD3',
  mixins: [chartMixin, chartFormat],
  data () {
    return {
      timer: null,
      HexagonData: [],
      boxWidth: 0,
      boxHeight: 0,
      boxPadding: 5,
      tooltip: {
        x: 0,
        y: 0,
        title: 0,
        value: 0,
        mapping: {},
        show: false
      },
      svg: null,
      spaceBetweenHexa: 3,
      hexagonTimer: null
    }
  },
  methods: {
    hexbin,
    initChart () {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
      this.timer = setTimeout(() => {
        this.initHexagonData(this.chartInfo, this.chartData).then(() => {
          this.getLayout().then(layout => {
            this.initHexagon(layout)
          }).catch(() => {

          })
        })
      }, 200)
    },
    initHexagonData (chartInfo, originalDatas) {
      this.HexagonData = []
      this.isInit = false
      const decimals = this.chartInfo.param.decimals || 2
      this.isNoData = true
      return new Promise(resolve => {
        let colorIndex = 0
        originalDatas.forEach((originalData, expressionIndex) => {
          originalData.forEach((data, dataIndex) => {
            this.isNoData = false
            const Hexagon = {
              value: '',
              showValue: '',
              label: {},
              width: '',
              height: '',
              legend: '',
              oldValue: '',
              mapping: {

              }
            }
            const legend = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex)
            Hexagon.value = getMetricTypeValue(data.values, chartInfo.param.statistics || 'last')
            Hexagon.max = chartInfo.param.max || 100
            Hexagon.min = chartInfo.param.min || 0
            if (Hexagon.min === Hexagon.max) {
              Hexagon.min = Hexagon.max / 2
            }
            Hexagon.label = data.metric
            Hexagon.legend = legend.alias
            Hexagon.label.legend = Hexagon.legend
            Hexagon.name = legend.name
            Hexagon.alias = legend.alias
            Hexagon.showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(Hexagon.value, null, -1, decimals)
            // Hexagon.value = Hexagon.showValue
            Hexagon.mapping = this.selectMapping(Hexagon.value, chartInfo.param.valueMapping, chartInfo.param.enable && this.chartInfo.param.enable.valueMapping)
            this.HexagonData.push(Hexagon)
            colorIndex++
          })
        })
        this.$emit('chartIsNoData', this.isNoData)
        resolve()
      })
    },
    initHexagon (layout) {
      this.isInit = false
      let rowIndex = 0
      let colIndex = -1
      const data = this.HexagonData.map(item => {
        colIndex++
        if (colIndex > layout.col) {
          rowIndex++
          colIndex = 0
        }
        return {
          ...item,
          x: colIndex,
          y: rowIndex,
          metrics: item.label,
          label: item.legend
        }
      })
      const dom = document.getElementById(`chart-canvas-${this.chartId}`)
      const child = document.getElementById('svgHex' + this.chartId)
      if (dom && child) {
        this.clearCache()
        // dom.removeChild(child)
      }
      if (dom) {
        const hexaRadius = layout.radius
        dom.append(this.showHexagons(data, hexaRadius, layout.col, layout.row))
        setTimeout(() => {
          const svg = document.getElementById('svgHex' + this.chartId)
          const bbox = svg.getBBox()
          svg.setAttribute('viewBox', (bbox.x - 10) + ' ' + (bbox.y - 10) + ' ' + (bbox.width + 20) + ' ' + (bbox.height + 20))
          svg.setAttribute('width', (bbox.width + 20) + 'px')
          svg.setAttribute('height', (bbox.height + 20) + 'px')
        }, 100)
      }
    },
    showHexagons (data, hexaRadiu = 60, row, col) {
      // 清除资源 释放缓存
      // Initial Geometrical Calculations
      const self = this
      const hexaRadius = hexaRadiu
      const spaceBetweenHexa = this.spaceBetweenHexa // Number of pixels of space between consecutive hexagons
      const hexaWidth = hexaRadius * 2 // Calculates Width of the Hexagons with specified radius
      const hexaHeight = hexaRadius * Math.sqrt(3) // Calculates Width of the Hexagons ...
      const rows = row // Number of desired Rows
      const cols = col // Number of desired Columns
      const height = (rows + 1 / 3) * 3 / 2 * hexaRadius // Calculates height of the window with given rows and radius
      const width = (cols + 1 / 2) * Math.sqrt(3) * hexaRadius // Calculates width of ...
      const hexbin = this.hexbin()
        .radius(hexaRadius)
        .extent([[0, 0], [width, height]])
      this.svg = d3.create('svg')
        .attr('id', 'svgHex' + this.chartId)
        .attr('width', width)
        .attr('height', height)
        .on('mousemove', this.hexagonMove)
      for (let i = 0; i < data.length; i++) {
        const point = data[i]
        const col = point.x
        const row = point.y
        const color = point.mapping ? point.mapping.color.bac : this.colorList[i]
        const vals = self.getCenter(hexaRadius, row, col) // Gets the Center coordinates with given row and column
        const x = vals[0]
        const y = vals[1]
        const g = this.svg.append('g')
        const hexa = self.drawHexagon(g, hexaRadius, spaceBetweenHexa, x, y, hexbin) // Draws hexagon
        hexa.attr('fill', color) // Paints hexagon
        g.on('mouseenter', self.hexagonOver.bind(self, point))
        g.on('mouseleave', self.hexagonOut.bind(self, point))
        self.drawText(this.svg, vals, point, color, hexaRadius, g) // 文本
        data[i].fcolor = color
      }
      return this.svg.node()
    },
    hexagonOver (that, e) { // 移入六边形
      this.tooltip.title = that.alias
      this.tooltip.value = that.showValue
      this.tooltip.mapping = that.mapping
      this.tooltip.show = true
      this.setPosition(e)
    },
    hexagonMove (e) { // 六边形内移动
      if (this.tooltip.show) {
        this.setPosition(e)
      }
    },
    hexagonOut (that) {
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
    formatStr (d) {
      const self = this
      let str = ''

      str += ''
      return str
    },
    drawHexagon (svg, radius, space, x, y, hexbin) {
      const hexagon = svg.append('path')
        .attr('d', hexbin.hexagon(radius - space))
        .attr('stroke', '#000')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', 1)
        .attr('transform', 'translate(' + x + ',' + y + ')')
      return hexagon
    },
    drawText (svg, vals, point, color, hexbinRadius, group) {
      let str = ''
      let valueStr = ''
      const self = this
      const hexWidth = hexbinRadius * Math.sqrt(3)
      let fontSize = 24
      const textColor = point.mapping ? point.mapping.color.text : this.invertColor(color)
      if (this.chartInfo.param.text === 'all') {
        str += point.alias
        valueStr = point.mapping && point.mapping.display ? self.handleDisplay(point.mapping.display, { ...point.metrics, legend: point.alias, value: point.showValue }) : point.showValue
      }
      if (this.chartInfo.param.text === 'value' || !this.chartInfo.param.text) {
        valueStr = point.mapping && point.mapping.display ? self.handleDisplay(point.mapping.display, { ...point.metrics, legend: point.alias, value: point.showValue }) : point.showValue
      }
      if (this.chartInfo.param.text === 'legend') {
        str += point.alias
      }
      if (this.chartInfo.param.text === 'none') {
        str += ''
      }
      fontSize = Math.floor(16 * (hexWidth / 60))
      if (str && valueStr) {
        const fObj = group.append('foreignObject')
          .attr('width', hexWidth || 60)
          .attr('height', 24)
        fObj
          .attr('x', vals[0] - hexWidth / 2)
          .attr('y', vals[1] - 24)
          // .text(str)
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'central')
          .style('font-size', fontSize)
          .style('fill', textColor)
        const scrollDiv = fObj.append('xhtml:div')
        scrollDiv
          .html(`<div style="color:${textColor};width:${hexWidth}px;overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 16px;box-sizing: border-box;padding: 0 10px;text-align: center">${str}</div>`)
        // group.append('text')
        //   .attr('x', vals[0])
        //   .attr('y', vals[1] + 16)
        //   .text(valueStr)
        //   .attr('text-anchor', 'middle')
        //   .attr('alignment-baseline', 'central')
        //   .style('font-size', fontSize)
        //   .style('fill', textColor)
        const fObj2 = group.append('foreignObject')
          .attr('width', hexWidth || 60)
          .attr('height', 24)
        fObj2
          .attr('x', vals[0] - hexWidth / 2)
          .attr('y', vals[1])
          // .text(str)
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'central')
          .style('font-size', fontSize)
          .style('fill', textColor)
        const scrollDiv2 = fObj2.append('xhtml:div')
        scrollDiv2
          .html(
            `<div style="color:${textColor};width:${hexWidth}px;overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 16px;box-sizing: border-box;padding: 0 10px;text-align: center">
              <i class="${point.mapping && point.mapping.icon}" style="color: ${point.mapping && point.mapping.color && point.mapping.color.icon}"></i> ${valueStr}
            </div>`)
        return
      }
      if (str) {
        const fObj = group.append('foreignObject')
          .attr('width', hexWidth || 60)
          .attr('height', 24)
        fObj
          .attr('x', vals[0] - hexWidth / 2)
          .attr('y', vals[1] - 10)
          // .text(str)
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'central')
          .style('font-size', fontSize)
          .style('fill', textColor)
        const scrollDiv = fObj.append('xhtml:div')
        scrollDiv
          .html(
            `<div style="color:${textColor};width:${hexWidth}px;overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 16px;box-sizing: border-box;padding: 0 10px;text-align: center">
              <i class="${point.mapping && point.mapping.icon}" style="color: ${point.mapping && point.mapping.color && point.mapping.color.icon}"></i> ${str}
            </div>`)
        return
      }
      if (valueStr) {
        // group.append('text')
        //   .attr('x', vals[0])
        //   .attr('y', vals[1])
        //   .text(valueStr)
        //   .attr('text-anchor', 'middle')
        //   .attr('alignment-baseline', 'central')
        //   .style('font-size', fontSize)
        //   .style('fill', textColor)
        const fObj = group.append('foreignObject')
          .attr('width', hexWidth || 60)
          .attr('height', 24)
        fObj
          .attr('x', vals[0] - hexWidth / 2)
          .attr('y', vals[1] - 10)
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'central')
          .style('font-size', fontSize)
          .style('fill', textColor)
        const scrollDiv = fObj.append('xhtml:div')
        scrollDiv
          .html(
            `<div style="color:${textColor};width:${hexWidth}px;overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 16px;box-sizing: border-box;padding: 0 10px;text-align: center">
              <i class="${point.mapping && point.mapping.icon}" style="color: ${point.mapping && point.mapping.color && point.mapping.color.icon}"></i> ${valueStr}
            </div>`)
      }
    },
    getCenter (hexaRadius, row, col) {
      let x = hexaRadius * col * Math.sqrt(3)
      // Offset each uneven row by half of a "hex-width" to the right
      if (row % 2 === 1) x += (hexaRadius * Math.sqrt(3)) / 2
      const y = hexaRadius * row * 1.5
      return [x + hexaRadius, y + hexaRadius]
    },
    invertColor (hex) {
      if (hex.indexOf('#') === 0) {
        hex = hex.slice(1)
      }
      // convert 3-digit hex to 6-digits.
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
      }
      if (hex.length !== 6) {
        // throw new Error('Invalid HEX color.');
      }
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return (r * 0.299 + g * 0.587 + b * 0.114) > 186
        ? '#000000'
        : '#FFFFFF'
    },
    getLayout () {
      return new Promise((resolve, reject) => {
        if (!this.$refs[`chart-canvas-${this.chartId}`]) {
          reject()
        }
        this.boxWidth = this.$refs[`chart-canvas-${this.chartId}`].offsetWidth - 2 * this.boxPadding
        this.boxHeight = this.$refs[`chart-canvas-${this.chartId}`].offsetHeight - 2 * this.boxPadding
        let radius = 0
        let col = 0
        let row = 0
        for (let i = 1; i <= this.HexagonData.length; i++) {
          const cols = Math.ceil(this.HexagonData.length / i)
          const hexaRadiusY = Math.ceil((this.boxHeight * 2) / (3 * i + 1))
          let hexaRadiusX = ''
          if (i === 1) {
            hexaRadiusX = Math.ceil(this.boxWidth / (Math.sqrt(3) * cols))
          } else {
            hexaRadiusX = Math.ceil(this.boxWidth / (Math.sqrt(3) * cols + Math.sqrt(3) / 2))
          }
          const rateMax = hexaRadiusX > hexaRadiusY ? hexaRadiusY : hexaRadiusX
          if (rateMax > radius) {
            radius = rateMax
            col = cols
            row = i
          }
        }
        if (this.HexagonData.length) {
          while (col * row >= this.HexagonData.length) { // 避免出现空白
            row--
          }
        }
        row++
        resolve({ col, row, radius: radius - this.spaceBetweenHexa })
      })
    },
    clearCache () {
      if (this.svg) {
        this.svg.on('mousemove', null)
        this.svg.selectAll('g').on('mouseenter', null)
        this.svg.selectAll('g').on('mouseleave', null)
        this.svg.remove()
        this.svg = null
      }
    },
    resize () {
      if (this.hexagonTimer) {
        clearTimeout(this.hexagonTimer)
        this.hexagonTimer = null
      }
      this.hexagonTimer = setTimeout(() => {
        this.getLayout().then(layout => {
          this.initHexagon(layout)
        }).catch(() => {

        })
      }, 50)
    }
  },
  mounted () {
    // eslint-disable-next-line vue/no-mutating-props
    this.chartOption.color || (this.chartOption.color = initColor(20))
    this.colorList = this.chartOption.color
    this.chartInfo.loaded && this.initChart(this.chartOption)
  },
  beforeDestroy () {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (this.hexagonTimer) {
      clearTimeout(this.hexagonTimer)
      this.hexagonTimer = null
    }
    this.clearCache()
  }
}
</script>
