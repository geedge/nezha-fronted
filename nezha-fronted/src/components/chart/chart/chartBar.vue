<template>
  <div
    ref="bar-chart-box"
    class="nz-chart__component" @mouseenter="mouseEnterChart"
    @mouseleave="mouseLeaveChart"
  >
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas" style="overflow: hidden;" :style="{padding:boxPadding + 'px'}">
      <!-- retro led -->
      <template v-if="chartInfo.param.displayMode==='led'">
        <!-- horizontal -->
        <ul class="bar-retro-horizontal" v-if="chartInfo.param.orientation==='horizontal'">
          <li
            class="bar-item"
            v-for="(item,index) in barData"
            :key="index"
            :style="{
              height:item.height + 'px',
              marginBottom:item.spacing + 'px',
            }"
          >
            <template v-if="item.height!==undefined">
              <!-- legend -->
              <p
                v-if="chartInfo.param.text === 'legend' || chartInfo.param.text === 'all'"
                class="bar-title"
                :title="item.alias"
                :style="{
                  width: item.titleWidth + 'px',
                  fontSize: item.titleFontSize +'px'
                }"
              >
                {{item.alias}}
              </p>
              <div class="bar-rect" :style="{width:item.width + 'px',}">
                <div
                  v-for="(cell) in item.cellCount"
                  :key="cell"
                >
                  <div
                    v-if="item.litCount >= cell"
                    class="bar-cell"
                    :class="{'chart-cursor-pointer':(dataLink.length || chartInfo.datasource === 'metrics' || chartInfo.datasource === 'logs')}"
                    :style="{
                      width:item.cellWidth + 'px',
                      height:item.cellHeight + 'px',
                      marginRight:item.spacing + 'px',
                      backgroundImage:item.cellBackgroundImage,
                    }"
                    @mouseenter="barEnter($event,item)"
                    @mousemove="barMove"
                    @mouseleave="barLeave"
                    @click="chartClick($event,item)"
                  >
                  </div>
                  <div
                    v-else
                    class="bar-cell"
                    :style="{
                      width:item.cellWidth + 'px',
                      height:item.cellHeight + 'px',
                      marginRight:item.spacing + 'px',
                      background:item.cellBackground,
                    }"
                  >
                  </div>
                </div>
              </div>
              <!-- value -->
              <p
                v-if="chartInfo.param.text === 'value' || chartInfo.param.text === 'all'"
                class="bar-value"
                :style="{
                  width:item.valueWidth + 'px',
                  fontSize:item.valueFontSize + 'px',
                  color:item.mapping && item.mapping.color && item.mapping.color.text
                }"
              >
                <i v-if="item.mapping && item.mapping.icon" :class="item.mapping.icon" :style="{color: item.mapping.color.icon,fontSize:'1em'}"></i>
                <span>{{item.mapping ? handleDisplay(item.mapping.display, { ...item.labels, value: item.showValue }) : item.showValue}}</span>
              </p>
            </template>
          </li>
        </ul>
        <!-- vertical -->
        <ul class="bar-retro-vertical" v-else>
          <li
            class="bar-item"
            v-for="(item,index) in barData"
            :key="index"
            :style="{
              width: item.width + 'px',
              marginRight:item.spacing + 'px',
            }"
          >
            <template v-if="item.width!==undefined">
              <!-- legend -->
              <p v-if="chartInfo.param.text === 'legend' || chartInfo.param.text === 'all'" class="bar-title" :title="item.alias">{{item.alias}}</p>
              <div class="bar-rect" :style="{height:item.height + 'px',}">
                <div
                  v-for="(cell) in item.cellCount"
                  :key="cell"
                >
                  <div
                    v-if="item.litCount >= cell"
                    class="bar-cell"
                    :class="{'chart-cursor-pointer':(dataLink.length || chartInfo.datasource === 'metrics' || chartInfo.datasource === 'logs')}"
                    :style="{
                      width:item.cellWidth + 'px',
                      height:item.cellHeight + 'px',
                      marginTop:item.spacing + 'px',
                      backgroundImage:item.cellBackgroundImage,
                    }"
                    @mouseenter="barEnter($event,item)"
                    @mousemove="barMove"
                    @mouseleave="barLeave"
                    @click="chartClick($event,item)"
                  >
                  </div>
                  <div
                    v-else
                    class="bar-cell"
                    :style="{
                      width:item.cellWidth + 'px',
                      height:item.cellHeight + 'px',
                      marginTop:item.spacing + 'px',
                      background:item.cellBackground,
                    }"
                  >
                  </div>
                </div>
              </div>
              <!-- value -->
              <p
                v-if="chartInfo.param.text === 'value' || chartInfo.param.text === 'all'"
                class="bar-value"
                :style="{
                  height:item.valueHeight + 'px',
                  fontSize:item.valueFontSize + 'px',
                  color:item.mapping && item.mapping.color && item.mapping.color.text
                }"
              >
                <i v-if="item.mapping && item.mapping.icon" :class="item.mapping.icon" :style="{color: item.mapping.color.icon,fontSize:'1em'}"></i>
                <span>{{item.mapping ? handleDisplay(item.mapping.display, { ...item.labels, value: item.showValue }) : item.showValue}}</span>
              </p>
            </template>
          </li>
        </ul>
      </template>
      <!-- basic -->
      <template v-else>
        <!-- horizontal -->
        <ul class="bar-basic-horizontal" v-if="chartInfo.param.orientation==='horizontal'">
          <li
            class="bar-item"
            v-for="(item,index) in barData"
            :key="index"
            :style="{
              height:item.height + 'px',
              marginBottom:item.spacing + 'px',
            }"
          >
            <template v-if="item.height!==undefined">
              <!-- legend -->
              <p
                v-if="chartInfo.param.text === 'legend' || chartInfo.param.text === 'all'"
                class="bar-title"
                :title="item.alias"
                :style="{
                  width: item.titleWidth + 'px',
                  fontSize: item.titleFontSize +'px'
                }"
              >
                {{item.alias}}
              </p>
              <div class="bar-rect" :style="{width:item.width + 'px',}">
                <div
                  class="bar-actual"
                  :class="{'chart-cursor-pointer':(dataLink.length || chartInfo.datasource === 'metrics' || chartInfo.datasource === 'logs')}"
                  :style="{ width:item.actualWidth + 'px',height:item.height + 'px',background:item.background,}"
                  @mouseenter="barEnter($event,item)"
                  @mousemove="barMove"
                  @mouseleave="barLeave"
                  @click="chartClick($event,item)"
                >
                </div>
              </div>
              <!-- value -->
              <p
                v-if="chartInfo.param.text === 'value' || chartInfo.param.text === 'all'"
                class="bar-value"
                :style="{
                  width:item.valueWidth + 'px',
                  fontSize:item.valueFontSize + 'px',
                  color:item.mapping && item.mapping.color && item.mapping.color.text
                }"
              >
                <i v-if="item.mapping && item.mapping.icon" :class="item.mapping.icon" :style="{color: item.mapping.color.icon,fontSize:'1em'}"></i>
                <span>{{item.mapping ? handleDisplay(item.mapping.display, { ...item.labels, value: item.showValue }) : item.showValue}}</span>
              </p>
            </template>
          </li>
        </ul>

        <!-- vertical -->
        <ul class="bar-basic-vertical" v-else>
          <li
            class="bar-item"
            v-for="(item,index) in barData"
            :key="index"
            :style="{
              width:item.width + 'px',
              marginRight:item.spacing + 'px'
            }"
          >
            <template v-if="item.width!==undefined">
              <!-- value -->
              <p
                v-if="chartInfo.param.text === 'value' || chartInfo.param.text === 'all'"
                class="bar-value"
                :style="{
                  height:item.valueHeight + 'px',
                  fontSize:item.valueFontSize + 'px',
                  color:item.mapping && item.mapping.color && item.mapping.color.text
                }"
              >
                <i v-if="item.mapping && item.mapping.icon" :class="item.mapping.icon" :style="{color: item.mapping.color.icon,fontSize:'1em'}"></i>
                <span>{{item.mapping ? handleDisplay(item.mapping.display, { ...item.labels, value: item.showValue }) : item.showValue}}</span>
              </p>
              <div class="bar-rect" :style="{height:item.height + 'px',}">
                <div
                  class="bar-actual"
                  :class="{'chart-cursor-pointer':(dataLink.length || chartInfo.datasource === 'metrics' || chartInfo.datasource === 'logs')}"
                  :style="{ height:item.actualHeight + 'px',  background:item.background,}"
                  @mouseenter="barEnter($event,item)"
                  @mousemove="barMove"
                  @mouseleave="barLeave"
                  @click="chartClick($event,item)"
                >
                </div>
              </div>
              <!-- legend -->
              <p v-if="chartInfo.param.text === 'legend' || chartInfo.param.text === 'all'" class="bar-title" :title="item.alias">{{item.alias}}</p>
            </template>
          </li>
        </ul>
      </template>
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
    <span class="temp-dom" ref="temp-dom2"></span>
  </div>
</template>

<script>
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import { formatScientificNotation, getMetricTypeValue } from '@/components/common/js/tools'
import chartDataFormat from '@/components/chart/chartDataFormat'
import { initColor } from '@/components/chart/chart/tools'
import lodash from 'lodash'
import tinycolor from 'tinycolor2'
export default {
  name: 'chart-bar',
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
      chartDot: 2,
      isInit: true, // 是否是初始化，初始化时为true，图表初始化结束后设为false
      legends: [], // { name, alias, color, statistics: [{type: min, value: xxx}, ...] }
      toolboxIconColor: {
        active: '#53a3cb',
        inactive: '#7e7e7e'
      },
      chartId: '',
      barData: [],
      boxWidth: 0,
      boxHeight: 0,
      boxPadding: 10
    }
  },
  methods: {
    initChart () {
      this.setDataLink()
      this.legends = []
      this.initBarData(this.chartInfo, this.chartData)
      if (this.isNoData) {
        return
      }
      /* 使用setTimeout延迟渲染图表，避免样式错乱 */
      setTimeout(() => {
        this.drawBarChart()
        this.isInit = false
      }, 200)
    },
    resize () {
      setTimeout(() => {
        this.drawBarChart()
      }, 50)
    },
    drawBarChart () {
      const wrap = document.getElementById(`chart-canvas-${this.chartId}`)
      this.boxWidth = wrap.offsetWidth - 2 * this.boxPadding
      this.boxHeight = wrap.offsetHeight - 2 * this.boxPadding
      const displayMode = lodash.get(this.chartInfo, 'param.displayMode', 'basic')
      if (displayMode === 'basic') {
        this.renderBasicBars()
      } else {
        this.renderRetroBars()
      }
    },
    renderBasicBars () {
      const orientation = lodash.get(this.chartInfo, 'param.orientation', 'vertical')
      const maxValue = this.calcMax(this.barData)
      const spacing = 10
      const numBars = this.barData.length
      const totalSpacing = (numBars - 1) * spacing
      if (orientation === 'vertical') {
        const width = (this.boxWidth - totalSpacing) / numBars
        const minValueHeight = 18
        const maxValueHeight = 50
        const valueHeight = this.chartInfo.param.text === 'value' || this.chartInfo.param.text === 'all' ? Math.min(Math.max(this.boxHeight * 0.1, minValueHeight), maxValueHeight) : 0
        const titleHeight = this.chartInfo.param.text === 'legend' || this.chartInfo.param.text === 'all' ? 14 * 1.5 : 0
        const height = this.boxHeight - valueHeight - titleHeight

        this.barData.forEach((item) => {
          item.width = width
          item.spacing = spacing
          item.valueHeight = valueHeight
          item.height = height
          const valuePercent = this.getValuePercent(item.value, 0, maxValue)
          item.actualHeight = item.height * valuePercent

          let valueText = ''
          if (item.mapping) {
            valueText = this.handleDisplay(item.mapping.display, { ...item.labels, value: item.showValue })
            if (item.mapping.icon) {
              valueText += 'AA'
            }
          } else {
            valueText = item.showValue
          }
          item.valueFontSize = this.calculateFontSize(valueText, width, valueHeight, 1)
        })
        const valueFontArr = this.barData.map(item => item.valueFontSize)
        const minValueFont = Math.min(...valueFontArr)
        this.barData.forEach(item => {
          item.valueFontSize = minValueFont
        })
        this.$forceUpdate()
      } else {
        const height = (this.boxHeight - totalSpacing) / numBars
        const maxTitleHeightRatio = 0.6
        const titleHeight = Math.max(height * maxTitleHeightRatio, 12)
        const titleFontSize = Math.min(titleHeight, 28)

        const maxValueWidth = 150
        const valueWidth = this.chartInfo.param.text === 'value' || this.chartInfo.param.text === 'all' ? Math.min(this.boxWidth * 0.15, maxValueWidth) : 0

        this.barData.forEach((item) => {
          item.height = height
          item.spacing = spacing

          item.titleFontSize = titleFontSize
          const text = item.alias
          const el = this.$refs['temp-dom2']
          el.innerText = text
          el.style.fontSize = titleFontSize + 'px'
          item.titleWidth = el.offsetWidth

          let valueText = ''
          if (item.mapping) {
            valueText = this.handleDisplay(item.mapping.display, { ...item.labels, value: item.showValue })
            if (item.mapping.icon) {
              valueText += 'AA'
            }
          } else {
            valueText = item.showValue
          }
          item.valueWidth = valueWidth
          item.valueFontSize = Math.max(this.calculateFontSize(valueText, item.valueWidth - 10 * 2, height, 1.2), 12)
        })
        const titleWidthArr = this.barData.map(item => item.titleWidth)
        const maxTitleWidth = Math.max(...titleWidthArr)
        const titleWidth = this.chartInfo.param.text === 'legend' || this.chartInfo.param.text === 'all' ? Math.min(maxTitleWidth + 15, this.boxWidth * 0.4) : 0

        const valueFontArr = this.barData.map(item => item.valueFontSize)
        const minValueFont = Math.min(...valueFontArr)
        this.barData.forEach(item => {
          item.titleWidth = titleWidth
          item.valueFontSize = minValueFont
          item.width = this.boxWidth - item.titleWidth - item.valueWidth
          const valuePercent = this.getValuePercent(item.value, 0, maxValue)
          item.actualWidth = item.width * valuePercent
        })
        this.$forceUpdate()
      }
    },
    renderRetroBars () {
      const orientation = lodash.get(this.chartInfo, 'param.orientation', 'vertical')
      const maxValue = this.calcMax(this.barData)
      const spacing = 2
      const numBars = this.barData.length
      const totalSpacing = (numBars - 1) * spacing
      if (orientation === 'vertical') {
        const width = (this.boxWidth - totalSpacing) / numBars
        const minValueHeight = 18
        const maxValueHeight = 50
        const valueHeight = this.chartInfo.param.text === 'value' || this.chartInfo.param.text === 'all' ? Math.min(Math.max(this.boxHeight * 0.1, minValueHeight), maxValueHeight) : 0
        const titleHeight = this.chartInfo.param.text === 'legend' || this.chartInfo.param.text === 'all' ? 14 * 1.5 : 0
        const height = this.boxHeight - valueHeight - titleHeight

        const cellHeight = 10
        const cellWidth = width
        const cellCount = Math.floor(height / (cellHeight + spacing))

        this.barData.forEach((item, index) => {
          item.width = width
          item.spacing = spacing
          item.valueHeight = valueHeight
          item.height = height

          let valueText = ''
          if (item.mapping) {
            valueText = this.handleDisplay(item.mapping.display, { ...item.labels, value: item.showValue })
            if (item.mapping.icon) {
              valueText += 'AA'
            }
          } else {
            valueText = item.showValue
          }
          item.valueFontSize = this.calculateFontSize(valueText, width * 0.9, valueHeight, 1)

          item.cellWidth = cellWidth
          item.cellHeight = cellHeight
          item.cellCount = cellCount
          item.litCount = Math.ceil(Math.max(item.value / (maxValue / item.cellCount), 1))
          item.cellBackground = tinycolor(item.background).setAlpha(0.18).toRgbString()
          item.cellBackgroundImage = `radial-gradient(${tinycolor(item.background).setAlpha(0.95).toRgbString()} 10%, ${tinycolor(item.background).setAlpha(0.55).toRgbString()})`
        })
        const valueFontArr = this.barData.map(item => item.valueFontSize)
        const minValueFont = Math.min(...valueFontArr)
        this.barData.forEach(item => {
          item.valueFontSize = minValueFont
        })
        this.$forceUpdate()
      } else {
        const height = (this.boxHeight - totalSpacing) / numBars
        const maxTitleHeightRatio = 0.6
        const titleHeight = Math.max(height * maxTitleHeightRatio, 12)
        const titleFontSize = Math.min(titleHeight, 28)
        const maxValueWidth = 150
        const valueWidth = this.chartInfo.param.text === 'value' || this.chartInfo.param.text === 'all' ? Math.min(this.boxWidth * 0.15, maxValueWidth) : 0

        const cellWidth = 10
        const cellHeight = height

        this.barData.forEach((item) => {
          item.height = height
          item.spacing = spacing

          item.titleFontSize = titleFontSize
          const text = item.alias
          const el = this.$refs['temp-dom2']
          el.innerText = text
          el.style.fontSize = titleFontSize + 'px'
          item.titleWidth = el.offsetWidth

          let valueText = ''
          if (item.mapping) {
            valueText = this.handleDisplay(item.mapping.display, { ...item.labels, value: item.showValue })
            if (item.mapping.icon) {
              valueText += 'AA'
            }
          } else {
            valueText = item.showValue
          }
          item.valueWidth = valueWidth
          item.valueFontSize = Math.max(this.calculateFontSize(valueText, item.valueWidth - 10 * 2, height, 1.2), 12)
        })
        const titleWidthArr = this.barData.map(item => item.titleWidth)
        const maxTitleWidth = Math.max(...titleWidthArr)
        const titleWidth = this.chartInfo.param.text === 'legend' || this.chartInfo.param.text === 'all' ? Math.min(maxTitleWidth + 15, this.boxWidth * 0.4) : 0

        const valueFontArr = this.barData.map(item => item.valueFontSize)
        const minValueFont = Math.min(...valueFontArr)
        this.barData.forEach(item => {
          item.titleWidth = titleWidth
          item.valueFontSize = minValueFont
          item.width = this.boxWidth - item.titleWidth - item.valueWidth

          const cellCount = Math.floor(item.width / (cellWidth + spacing))
          item.cellWidth = cellWidth
          item.cellHeight = cellHeight
          item.cellCount = cellCount
          item.litCount = Math.ceil(Math.max(item.value / (maxValue / item.cellCount), 1))
          item.cellBackground = tinycolor(item.background).setAlpha(0.18).toRgbString()
          item.cellBackgroundImage = `radial-gradient(${tinycolor(item.background).setAlpha(0.95).toRgbString()} 10%, ${tinycolor(item.background).setAlpha(0.55).toRgbString()})`
        })
        this.$forceUpdate()
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
    initBarData (chartInfo, originalDatas) {
      this.barData = []
      let colorIndex = 0
      const decimals = this.chartInfo.param.decimals || 2
      originalDatas.forEach((originalData, expressionIndex) => {
        originalData.forEach((data, dataIndex) => {
          this.isNoData = false
          const value = getMetricTypeValue(data.values, chartInfo.param.statistics)
          const showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(value, null, -1, decimals)
          const mapping = this.selectMapping(value, chartInfo.param.valueMapping, chartInfo.param.enable && this.chartInfo.param.enable.valueMapping)
          // eslint-disable-next-line vue/no-mutating-props
          mapping && this.chartOption.color && (this.chartOption.color[colorIndex] = mapping.color.bac)
          const legend = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex)
          this.barData.push({
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
      this.setColorList(this.barData)
      this.barData.forEach((item, index) => {
        item.background = item.mapping ? item.mapping.color.bac : this.colorList[index]
      })
      this.$emit('chartIsNoData', this.isNoData)
    },
    formatterFunc (params, ticket, callback) {
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
    barEnter (e, data) {
      this.tooltip.title = data.alias
      this.tooltip.value = data.mapping && data.mapping.display ? this.handleDisplay(data.mapping.display, { ...data.labels, value: data.showValue }) : data.showValue
      this.tooltip.mapping = data.mapping
      this.tooltip.show = true
      this.setPosition(e)
    },
    barMove (e) {
      this.tooltip.show = true
      this.setPosition(e)
    },
    barLeave () {
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
    toolboxPosition (e) {
      const windowWidth = window.innerWidth// 窗口宽度
      const windowHeight = window.innerHeight// 窗口高度
      this.$nextTick(() => {
        const box = document.getElementById(`chart-toolbox-${this.chartId}`)
        const left = e.pageX - this.$refs['bar-chart-box'].getBoundingClientRect().left
        const top = e.pageY - this.$refs['bar-chart-box'].getBoundingClientRect().top
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
    this.chartInfo.loaded && this.initChart(this.chartOption)
  }
}
</script>
