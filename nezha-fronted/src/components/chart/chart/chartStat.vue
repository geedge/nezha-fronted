<template>
  <div class="chart-stat" ref="chart-stat-box">
    <div
      class="chart-stat-item"
      v-for="(item,index) in statData"
      :key="index"
      @mouseenter="statMouseEnter(item,$event)"
      @mousemove="statMouseMove"
      @mouseleave="statMouseleave(item)"
      @click="chartClick($event,item)"
      :class="{
        'only-stat':statData.length===1,
        'chart-cursor-pointer':(dataLink.length || chartInfo.datasource === 'metrics' || chartInfo.datasource === 'logs')
      }"
      :style="{
        background:item.backgroundColor,
        height:item.height+'px',
        width:item.width + 'px',
      }"
    >
      <div style="maxWidth:100%;z-index: 10;">
        <!-- all -->
        <template v-if="chartInfo.param.text==='all'">
          <div v-if="item.mapping">
            <p class="stat-text" :style="{fontSize: item.titleFontSize + 'px'}">{{item.alias}}</p>
            <p class="stat-text" :style="{fontSize: item.valueFontSize + 'px',color:item.textColor}">
              <template v-if="item.mapping && item.mapping.icon">
                <i :class="item.mapping.icon" :style="{color: item.mapping.color.icon,fontSize:'1em'}"></i>
              </template>
              <span>{{handleDisplay(item.mapping.display, { ...item.labels, value: item.showValue })}}</span>
            </p>
          </div>
          <div v-else>
            <p class="stat-text" :style="{fontSize: item.titleFontSize + 'px'}">{{item.alias}}</p>
            <p class="stat-text" :style="{fontSize: item.valueFontSize + 'px',color:item.textColor}">{{item.showValue}}</p>
          </div>
        </template>
        <!-- legend -->
        <template v-if="chartInfo.param.text==='legend'">
          <div v-if="item.mapping">
            <p class="stat-text" :style="{fontSize: item.valueFontSize + 'px',color:item.textColor}">
              <template v-if="item.mapping && item.mapping.icon">
                <i :class="item.mapping.icon" :style="{color: item.mapping.color.icon,fontSize:'1em'}"></i>
              </template>
              <span>{{item.alias}}</span>
            </p>
          </div>
          <div v-else>
            <p class="stat-text" :style="{fontSize: item.valueFontSize + 'px',color:item.textColor}">{{item.alias}}</p>
          </div>
        </template>
        <!-- value -->
        <template v-if="chartInfo.param.text==='value'|| !chartInfo.param.text">
          <div v-if="item.mapping" :style="{color:item.mapping.color.text}">
            <p class="stat-text" :style="{fontSize: item.valueFontSize + 'px',color:item.textColor}">
              <template v-if="item.mapping && item.mapping.icon">
                <i :class="item.mapping.icon" :style="{color: item.mapping.color.icon,fontSize:'1em'}"></i>
              </template>
              <span>{{handleDisplay(item.mapping.display, { ...item.labels, value: item.showValue })}}</span>
            </p>
          </div>
          <div v-else>
            <p class="stat-text" :style="{fontSize: item.valueFontSize + 'px',color:item.textColor}">{{item.showValue}}</p>
          </div>
        </template>
        <!-- none -->
        <template v-if="chartInfo.param.text==='none'"></template>

        <!-- comparison -->
        <template v-if="comparisonShow(item)">
          <div :class="{'comparison-text-center':chartInfo.param.text==='none'}" class="comparison-text" :style="{fontSize:item.comparisonFont+'px'}">
            <span v-if="chartInfo.param.comparison==='hour'">{{$t('dashboard.hourComparison')}}</span>
            <span v-if="chartInfo.param.comparison==='day'">{{$t('dashboard.dayComparison')}}</span>
            <span v-if="chartInfo.param.comparison==='week'">{{$t('dashboard.weekComparison')}}</span>
            <span v-if="chartInfo.param.comparison==='month'">{{$t('dashboard.monthComparison')}}</span>
            <span style="white-space: nowrap;">
              <!-- number -->
              <span :class="item.comparison.startsWith('+')?'comparison-increase':'comparison-decrease'">&nbsp;{{item.comparison}}</span>
              <!-- icon -->
              <i v-if="item.comparison.startsWith('+')" class="nz-icon nz-icon-shangsheng comparison-increase"></i>
              <i v-else-if="item.comparison=='-'||item.comparison=='0%'" class="nz-icon nz-icon-xiajiang1"></i>
              <i v-else class="nz-icon nz-icon-xiajiang1 comparison-decrease"></i>
            </span>
          </div>
        </template>
      </div>

      <!-- sparkline -->
      <div class="sparkline" :id="`chart-canvas-${chartId}-${index}`" v-if="chartInfo.param.sparklineMode && chartInfo.param.sparklineMode !== 'none'"></div>
    </div>
    <!-- tooltip -->
    <div :id="`chart-canvas-tooltip-${chartId}`" class="chart-canvas-tooltip no-style-class" :style="{left:tooltip.x+'px',top:tooltip.y+'px'}" v-if="tooltip.show">
      <div class="chart-canvas-tooltip-title tooltip-title" :title="tooltip.title">{{tooltip.title}}</div>
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
    <span class="temp-dom" ref="temp-dom"></span>
  </div>
</template>

<script>
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import { getMetricTypeValue } from '@/components/common/js/tools'
import chartDataFormat from '@/components/chart/chartDataFormat'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
// import fontWidth from '@/components/chart/chart/options/fontWidth'
import * as echarts from 'echarts'
import chartSparklineOption from './options/chartSparkline'
import lodash from 'lodash'
import tinycolor from 'tinycolor2'
export default {
  name: 'chart-stat',
  mixins: [chartMixin, chartFormat],
  data () {
    return {
      statData: [],
      previousData: [],
      boxWidth: 0,
      boxHeight: 0,
      boxPadding: 2,
      statTimer: null,
      fontSize: 12,
      customFontSize: '',
      minFontSzie: 12,
      defaultUnit: 60, // 根据stat的长宽取 需要的字体 = (取最短的边 / defaultUnit) * fontSize 因为 需要的字体/fontSize = 实际宽 / defaultUnit
      sparkline: {},
      maxYAxis: 0
    }
  },
  methods: {
    randomcolor,
    initChart () {
      this.setDataLink()
      this.initStatData(this.chartInfo, this.chartData).then(() => {
        if (this.isNoData) {
          return
        }
        this.renderStat()
        if (this.chartInfo.param.sparklineMode && this.chartInfo.param.sparklineMode !== 'none') {
          this.$nextTick(() => {
            this.drawChart()
          })
        }
      })
    },
    initStatData (chartInfo, originalDatas) {
      this.statData = []
      this.previousData = []
      const decimals = this.chartInfo.param.decimals || 2
      return new Promise(resolve => {
        let colorIndex = 0
        this.isNoData = true
        originalDatas.forEach((originalData, expressionIndex) => {
          originalData.forEach((data, dataIndex) => {
            this.isNoData = false
            const stat = {
              width: '',
              height: '',
              value: '',
              showValue: '',
              name: '',
              alias: '',
              labels: {},
              mapping: {},
              data: {}
            }
            stat.value = getMetricTypeValue(data.values, chartInfo.param.statistics)
            stat.showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(stat.value, null, -1, decimals)
            const legend = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex)
            stat.name = legend.name
            stat.alias = legend.alias
            stat.labels = {
              ...data.metric,
              legend: legend.alias
            }
            stat.expressionIndex = expressionIndex
            stat.mapping = this.selectMapping(stat.value, chartInfo.param.valueMapping, chartInfo.param.enable && this.chartInfo.param.enable.valueMapping)
            stat.data = data.values
            // 判断是否是对比的数据
            if (expressionIndex < chartInfo.elements.length) {
              this.statData.push(stat)
            } else {
              this.previousData.push(stat)
            }
            colorIndex++
          })
        })
        // 计算sparkline最大值
        let maxYAxis = 0
        if (this.statData.length > 0) {
          maxYAxis = 0
          for (let j = 0; j < this.statData.length; j++) {
            for (let i = 0; i < this.statData[j].data.length; i++) {
              if (!isNaN(this.statData[j].data[i][1])) {
                maxYAxis = (maxYAxis < Number(this.statData[j].data[i][1]) ? Number(this.statData[j].data[i][1]) : maxYAxis)
              }
            }
          }
        }
        this.maxYAxis = maxYAxis

        // 计算同比变化量
        if (this.chartInfo.param.comparison && this.chartInfo.param.comparison !== 'none') {
          this.statData.forEach(item => {
            const previousName = 'Previous ' + item.name
            const findItem = this.previousData.find((subItem) => previousName === subItem.name)
            if (!findItem) {
              item.comparison = '-'
              return
            }
            const value = Number(item.value)
            const previousValue = Number(findItem.value)
            let comparison
            if (isNaN(value) || isNaN(previousValue)) {
              comparison = '-'
            } else if (value == 0 && previousValue == 0) {
              comparison = '0%'
            } else if (value == 0 || previousValue == 0) {
              comparison = '-'
            } else {
              comparison = parseFloat(((value - previousValue) / previousValue * 100).toFixed(2))
              if (comparison > 0) {
                comparison = '+' + comparison
              }
              comparison += '%'
            }
            item.comparison = comparison
          })
        }
        this.setColorList(this.statData)
        this.$emit('chartIsNoData', this.isNoData)
        resolve()
      })
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
    renderStat () {
      try {
        this.boxWidth = this.$refs['chart-stat-box'].offsetWidth - 3 * this.boxPadding
        this.boxHeight = this.$refs['chart-stat-box'].offsetHeight - 3 * this.boxPadding
      } catch (error) {}

      const grid = this.calculateGridDimensions(this.boxWidth, this.boxHeight, this.statData.length)
      let xGrid = 0
      let yGrid = 0

      this.statData.forEach((item, index) => {
        const isLastRow = yGrid === grid.yCount - 1
        item.width = isLastRow ? grid.widthOnLastRow : grid.width
        item.height = grid.height
        xGrid++
        if (xGrid === grid.xCount) {
          xGrid = 0
          yGrid++
        }

        let display = ''
        if (item.mapping) {
          display = this.handleDisplay(item.mapping.display, { ...item.labels, value: item.showValue })
        }
        let titleFont = ''
        let valueFont = ''
        let titleFontSize = ''
        let valueFontSize = ''
        const padding = 10
        switch (this.chartInfo.param.text) {
          case 'all':
            titleFont = item.alias
            if (item.mapping) {
              valueFont = display
              if (item.mapping.icon) {
                valueFont += 'AA'
              }
            } else {
              valueFont = item.showValue
            }
            titleFontSize = this.calculateFontSize(titleFont, (item.width - padding * 2), (item.height - padding * 2) * 0.4, 1.2, 30)
            valueFontSize = this.calculateFontSize(valueFont, (item.width - padding * 2), (item.height - padding * 2) * 0.4, 1.2)
            titleFontSize = Math.min(valueFontSize * 0.7, titleFontSize)
            break
          case 'legend':
            titleFont = item.alias
            if (item.mapping) {
              if (item.mapping.icon) {
                titleFont += 'AA'
              }
            }
            valueFontSize = this.calculateFontSize(titleFont, (item.width - padding * 2), (item.height - padding * 2) * 0.4, 1.2)
            break
          case 'none':
            titleFontSize = ''
            valueFontSize = ''
            break
          case 'value':
          default:
            if (item.mapping) {
              valueFont = display
              if (item.mapping.icon) {
                valueFont += 'AA'
              }
            } else {
              valueFont = item.showValue
            }
            valueFontSize = this.calculateFontSize(valueFont, (item.width - padding * 2), (item.height - padding * 2) * 0.4, 1.2)
            break
        }
        item.titleFontSize = titleFontSize
        item.valueFontSize = valueFontSize

        // 设置图表颜色和字体颜色
        this.setColor(item, index)

        if (item.valueFontSize > 36) {
          item.comparisonFont = 16
        } else if (item.valueFontSize > 24) {
          item.comparisonFont = 14
        } else {
          item.comparisonFont = 12
        }
      })
      this.isInit = false
    },
    setColor (data, index) {
      const colorMode = lodash.get(this.chartInfo, 'param.colorMode', 'value')
      if (colorMode == 'value') {
        data.textColor = this.colorList[index]
      } else if (colorMode === 'background') {
        data.backgroundColor = this.colorList[index]
      }
      if (data.mapping) {
        data.textColor = data.mapping.color.text
        data.backgroundColor = data.mapping.color.bac
      }
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

    // 绘制图表
    drawChart () {
      this.statData.forEach((item, index) => {
        const chart = this.sparkline[index] ? this.sparkline[index] : echarts.init(document.getElementById(`chart-canvas-${this.chartId}-${index}`))
        const chartOption = lodash.cloneDeep(chartSparklineOption)

        // sparkline 颜色根据背景色计算
        const color = item.mapping ? item.mapping.color.bac : this.colorList[index]
        const lineColor = tinycolor(color).brighten(40).toRgbString()
        let areaColor = 'rgba(255,255,255,0.4)'
        if (!item.backgroundColor) {
          areaColor = tinycolor(color).setAlpha(0.2).toRgbString()
        }

        chartOption.series = [{
          ...chartOption.series[0],
          data: item.data,
          lineStyle: {
            width: 1,
            color: lineColor
          }
        }]
        if (this.chartInfo.param.sparklineMode === 'area') {
          chartOption.series[0].areaStyle = {
            color: areaColor
          }
        }
        chartOption.yAxis.max = this.maxYAxis
        chart.setOption(chartOption)
        this.sparkline[index] = chart
      })
    },
    resize () {
      if (this.statTimer) {
        clearTimeout(this.statTimer)
        this.statTimer = null
      }
      this.statTimer = setTimeout(() => {
        this.renderStat()
        this.$nextTick(() => {
          for (const key in this.sparkline) {
            this.sparkline[key].resize()
          }
        })
      }, 100)
    },
    statMouseEnter (data, e) {
      this.tooltip.title = data.alias
      this.tooltip.value = data.mapping && data.mapping.display ? this.handleDisplay(data.mapping.display, { ...data.labels, value: data.showValue }) : data.showValue
      this.tooltip.mapping = data.mapping
      this.tooltip.show = true
      this.setPosition(e)
    },
    statMouseMove (e) {
      this.tooltip.show = true
      this.setPosition(e)
    },
    statMouseleave () {
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
    setFontSize (item) {
      let fontSize = ''

      fontSize = item.height > item.width ? (14 * (item.width / 60)) : (14 * (item.height / 60))
      fontSize = fontSize > 12 ? fontSize : this.minFontSzie
      return fontSize + 'px'
    },
    strlen (str) {
      let len = 0
      for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i)
        // 单字节加1
        if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
          len++
        } else {
          len += 2
        }
      }
      return len
    },
    comparisonShow (item) {
      const minWidth = 145
      let minHeight
      switch (this.chartInfo.param.text) {
        case 'all':
          minHeight = 72
          break
        case 'legend':
          minHeight = 56
          break
        case 'value':
          minHeight = 56
          break
        case 'none':
          minHeight = 24
          break
      }
      return (this.chartInfo.param.comparison && this.chartInfo.param.comparison !== 'none') && (item.height > minHeight && item.width > minWidth)
    },
    toolboxPosition (e) {
      const windowWidth = window.innerWidth// 窗口宽度
      const windowHeight = window.innerHeight// 窗口高度
      this.$nextTick(() => {
        const box = document.getElementById(`chart-toolbox-${this.chartId}`)
        const left = e.pageX - this.$refs['chart-stat-box'].getBoundingClientRect().left
        const top = e.pageY - this.$refs['chart-stat-box'].getBoundingClientRect().top
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
    this.chartInfo.loaded && this.initChart()
  },
  beforeDestroy () {
    for (const key in this.sparkline) {
      this.sparkline[key].dispose()
      this.sparkline[key] = null
    }
  }
}
</script>
