<template>
  <div class="chart-gauge-box" :ref="'chart-gauge-box' + chartInfo.id">
    <div
      v-for="(item,index) in gaugeData" :key="index"
      class="chart-gauge-item"
      :style="{height:item.height+'px',width:item.width + 'px'}"
    >
      <div
        :id="isFullscreen?('chart-gauge-screen-' + chartInfo.id + '-' + index):('chart-gauge-' + chartInfo.id + '-' + index)"
        class="chart-gauge-content"
        :class="{'chart-cursor-default':!(dataLink.length || chartInfo.datasource === 'metrics' || chartInfo.datasource === 'logs')}"
      ></div>
      <div
        v-if="chartInfo.param &&( chartInfo.param.text === 'legend' || chartInfo.param.text === 'all' )"
        class="chart-gauge-legend"
        :title="item.alias"
        :style="{fontSize: item.titleFontSize + 'px'}"
      >
        {{item.alias}}
      </div>
    </div>
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
    <span class="temp-dom" ref="temp-dom" style="fontWeight:600;fontFamily:sans-serif"></span>
  </div>
</template>

<script>
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import { getMetricTypeValue } from '@/components/common/js/tools'
import chartDataFormat from '@/components/chart/chartDataFormat'
import * as echarts from 'echarts'
import lodash from 'lodash'
import { initColor } from '@/components/chart/chart/tools'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'

export default {
  name: 'chart-gauge',
  mixins: [chartMixin, chartFormat],
  data () {
    return {
      gaugeData: [],
      boxWidth: 0,
      boxHeight: 0,
      boxPadding: 5,
      chartInstances: [],
      timer: null,
      maxValue: 0
    }
  },
  methods: {
    initChart () {
      this.setDataLink()
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
      this.timer = setTimeout(() => {
        this.initGaugeData(this.chartInfo, this.chartData).then(() => {
          this.renderGauge().then(() => {
            this.gaugeChartInit()
          })
        })
      }, 200)
    },
    initGaugeData (chartInfo, originalDatas) {
      this.gaugeData = []
      this.isInit = false
      const decimals = this.chartInfo.param.decimals || 2
      this.isNoData = true
      return new Promise(resolve => {
        let colorIndex = 0
        originalDatas.forEach((originalData, expressionIndex) => {
          originalData.forEach((data, dataIndex) => {
            this.isNoData = false
            const gauge = {
              value: '',
              showValue: '',
              label: {},
              width: '',
              height: '',
              legend: '',
              oldValue: '',
              mapping: {}
            }
            const legend = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex)
            gauge.value = getMetricTypeValue(data.values, chartInfo.param.statistics || 'last')
            gauge.label = data.metric
            gauge.legend = legend.alias
            gauge.label.legend = gauge.legend
            gauge.expressionIndex = expressionIndex
            gauge.name = legend.name
            gauge.alias = legend.alias
            gauge.showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(gauge.value, null, -1, decimals)
            // gauge.value = gauge.showValue
            gauge.mapping = this.selectMapping(gauge.value, chartInfo.param.valueMapping, chartInfo.param.enable && this.chartInfo.param.enable.valueMapping)
            this.gaugeData.push(gauge)
            colorIndex++
          })
        })
        this.maxValue = this.calcMax(this.gaugeData)
        this.$emit('chartIsNoData', this.isNoData)
        resolve()
      })
    },
    calcMax (arr) {
      let maxNum = arr.reduce((maxValue, obj) => {
        return Math.max(maxValue, obj.value)
      }, 0)

      if (maxNum <= 1) {
        return 1
      }

      let bite = 1
      while (maxNum >= 10) {
        maxNum /= 10
        if (maxNum > 1) {
          bite += 1
        }
      }

      return Math.pow(10, bite)
    },
    calculateGridDimensions (parentWidth, parentHeight, numberOfChildren) {
      const vertical = this.calculateSizeOfChild(parentWidth, parentHeight, numberOfChildren)
      const horizontal = this.calculateSizeOfChild(parentHeight, parentWidth, numberOfChildren)
      const square = Math.max(vertical, horizontal)
      let xCount = Math.floor(parentWidth / square)
      const yCount = Math.ceil(numberOfChildren / xCount)

      // after yCount update xCount to make split between rows more even
      xCount = Math.ceil(numberOfChildren / yCount)

      const itemsOnLastRow = xCount - (xCount * yCount - numberOfChildren)
      const widthOnLastRow = parentWidth / itemsOnLastRow

      return {
        width: parentWidth / xCount,
        height: parentHeight / yCount,
        widthOnLastRow,
        xCount,
        yCount
      }
    },
    calculateSizeOfChild (parentWidth, parentHeight, numberOfChildren) {
      const parts = Math.ceil(Math.sqrt((numberOfChildren * parentWidth) / parentHeight))
      if (Math.floor((parts * parentHeight) / parentWidth) * parts < numberOfChildren) {
        return parentHeight / Math.ceil((parts * parentHeight) / parentWidth)
      }
      return parentWidth / parts
    },
    renderGauge () {
      return new Promise(resolve => {
        try {
          this.boxWidth = this.$refs['chart-gauge-box' + this.chartInfo.id].offsetWidth - 3 * this.boxPadding
          this.boxHeight = this.$refs['chart-gauge-box' + this.chartInfo.id].offsetHeight - 3 * this.boxPadding
        } catch (error) {}

        const grid = this.calculateGridDimensions(this.boxWidth, this.boxHeight, this.gaugeData.length)
        let xGrid = 0
        let yGrid = 0

        this.gaugeData.forEach((item, index) => {
          const isLastRow = yGrid === grid.yCount - 1
          item.width = isLastRow ? grid.widthOnLastRow : grid.width
          item.height = grid.height
          xGrid++
          if (xGrid === grid.xCount) {
            xGrid = 0
            yGrid++
          }
        })
        resolve()
      })
    },
    // 计算字体大小
    calculateFontSize (text, width, height, lineHeight = 1.2, maxSize) {
      const el = this.$refs['temp-dom']
      if (!el) {
        return 12
      }
      el.innerText = text
      const elWidth = el.offsetWidth
      const fontSizeBasedOnWidth = (width / elWidth) * 14
      const fontSizeBasedOnHeight = height / lineHeight

      const optimalSize = Math.min(fontSizeBasedOnHeight, fontSizeBasedOnWidth)
      return Math.min(optimalSize, maxSize || optimalSize)
    },
    calcGaugeSize (data) {
      const dimension = Math.min(data.width, data.height) * 0.90 // radius

      const titleFontSize = Math.min((dimension * 0.15) / 1.2, 20)
      if (this.chartInfo.param.text === 'legend' || this.chartInfo.param.text === 'all') {
        data.titleFontSize = titleFontSize
        this.$forceUpdate()
      }

      const gaugeWidth = Math.min(dimension / 5.5, 30)
      let showValue = data.showValue
      if (data.mapping) {
        showValue = this.handleDisplay(data.mapping.display, { ...data.label, value: showValue })
      }
      const textWidth = dimension - (gaugeWidth * 4)
      const valueFontSize = this.calculateFontSize(showValue, textWidth, textWidth / 2, 1, gaugeWidth * 2)
      return {
        gaugeWidth,
        valueFontSize
      }
    },
    gaugeChartInit () {
      this.chartInstances.forEach(item => {
        if (item) {
          item.off('click')
          item.dispose()
        }
      })
      this.chartInstances = []
      const self = this
      this.gaugeData.forEach((item, index) => {
        const chartId = this.isFullscreen ? 'chart-gauge-screen-' : 'chart-gauge-'
        const myChart = echarts.init(document.getElementById(chartId + this.chartInfo.id + '-' + index))
        const option = lodash.cloneDeep(this.chartOption)
        // option.tooltip = {}
        option.series[0].data.push(item)
        option.series[0].max = this.chartInfo.param.max || this.maxValue
        option.series[0].min = this.chartInfo.param.min || 0

        option.series[0].radius = '90%'
        const gaugeSize = this.calcGaugeSize(item)
        option.series[0].progress.width = gaugeSize.gaugeWidth
        option.series[0].axisLine.lineStyle.width = gaugeSize.gaugeWidth
        option.series[0].detail = {
          fontSize: gaugeSize.valueFontSize,
          fontWeight: '600',
          offsetCenter: [0, '20%'],
          formatter: (params) => {
            let str = ''
            if (this.chartInfo.param.text === 'all' || this.chartInfo.param.text === 'value' || !this.chartInfo.param.text) {
              let showValue = chartDataFormat.getUnit(self.chartInfo.unit ? self.chartInfo.unit : 2).compute(params, null, -1, 2).trim()
              if (item.mapping) {
                showValue = self.handleDisplay(item.mapping.display, { ...item.label, value: showValue })
              }
              str += showValue
            }
            if (this.chartInfo.param.text === 'none' || this.chartInfo.param.text === 'legend') {
              str += ''
            }
            str += ''
            return str
          },
          color: lodash.get(item, 'mapping.color.text', 'auto')
        }
        if (index < 20) {
          option.series[0].itemStyle = {
            color: lodash.get(item, 'mapping.color.bac', this.colorList[index])
          }
        } else {
          option.series[0].itemStyle = {
            color: lodash.get(item, 'mapping.color.bac', randomcolor())
          }
        }
        option.tooltip.formatter = this.formatterFunc
        option.tooltip.position = this.tooltipPosition
        if (navigator.userAgent.match(/Mobi/i) ||
          navigator.userAgent.match(/Android/i) ||
          navigator.userAgent.match(/iPhone/i)) {
          option.tooltip.confine = true
          option.tooltip.appendToBody = false
          delete option.tooltip.position
        }
        myChart.setOption(option)
        if (this.dataLink.length || this.chartInfo.datasource === 'metrics' || this.chartInfo.datasource === 'logs') {
          myChart.on('click', this.chartClick)
        }
        this.chartInstances.push(myChart)
      })
    },
    gaugeChartResize () {
      this.chartInstances.forEach((item, index) => {
        if (item && item.resize) {
          const option = item.getOption()
          const gaugeSize = this.calcGaugeSize(this.gaugeData[index])
          option.series[0].progress.width = gaugeSize.gaugeWidth
          option.series[0].axisLine.lineStyle.width = gaugeSize.gaugeWidth
          option.series[0].detail.fontSize = gaugeSize.valueFontSize

          item.setOption(option)
          item.resize()
        }
      })
    },
    resize () {
      setTimeout(() => {
        this.renderGauge().then(() => {
          this.gaugeChartResize()
        })
      })
    },
    formatterFunc: function (params, ticket, callback) {
      const self = this
      return `
              <div class="chart-canvas-tooltip-title tooltip-title" title="${params.data.alias}">${params.data.alias}</div>
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
        const left = e.pageX - this.$refs['chart-gauge-box' + this.chartInfo.id].getBoundingClientRect().left
        const top = e.pageY - this.$refs['chart-gauge-box' + this.chartInfo.id].getBoundingClientRect().top
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
      this.chartInstances.forEach(item => {
        item.dispatchAction({
          type: 'hideTip'
        })
      })
      this.toolbox.title = params.data.alias
      this.toolbox.value = params.data.mapping && params.data.mapping.display ? this.handleDisplay(params.data.mapping.display, { ...params.data.labels, value: params.data.showValue }) : params.data.showValue
      this.toolbox.mapping = params.data.mapping
      this.toolbox.show = true
      this.toolbox.metric.labels = params.data.label
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
    this.chartOption.color || (this.chartOption.color = initColor(20))
    this.colorList = this.chartOption.color
    this.chartInfo.loaded && this.initChart()
  },
  beforeDestroy () {
    this.chartInstances.forEach(item => {
      if (item && item.dispose) {
        item.off('click')
        item.dispose()
      }
    })
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}
</script>
