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
      :class="{'only-stat':statData.length===1,'chart-cursor-pointer':dataLink.length}"
      :style="{
        background:item.mapping ? item.mapping.color.bac : (statData.length===1 ? '' : colorList[index]),
        height:item.height+'px',
        width:item.width + 'px',
        fontSize: item.fontSize + 'px',
      }"
    >
      <div style="maxWidth:100%;z-index: 10;">
        <!-- all -->
        <template v-if="chartInfo.param.text==='all'">
          <div v-if="item.mapping" :style="{color:item.mapping.color.text}">
            <p style="white-space: nowrap;">{{item.legend}}</p>
            <template v-if="item.mapping && item.mapping.icon">
              <i :class="item.mapping.icon" :style="{color: item.mapping.color.icon,fontSize:'1em'}"></i>
            </template>
            <span style="white-space: nowrap;">{{handleDisplay(item.mapping.display, { ...item.label, value: item.showValue })}}</span>
          </div>
          <div v-else>
            <p style="white-space: nowrap;">{{item.legend}}</p>
            <span style="white-space: nowrap;">{{item.showValue}}</span>
          </div>
        </template>
        <!-- legend -->
        <template v-if="chartInfo.param.text==='legend'">
          <div v-if="item.mapping" :style="{color:item.mapping.color.text}">
            <template v-if="item.mapping && item.mapping.icon">
              <i :class="item.mapping.icon" :style="{color: item.mapping.color.icon,fontSize:'1em'}"></i>
            </template>
            <span style="white-space: nowrap;">{{item.legend}}</span>
          </div>
          <div v-else style="white-space: nowrap;">{{item.legend}}</div>
        </template>
        <!-- value -->
        <template v-if="chartInfo.param.text==='value'|| !chartInfo.param.text">
          <div v-if="item.mapping" :style="{color:item.mapping.color.text}">
            <template v-if="item.mapping && item.mapping.icon">
              <i :class="item.mapping.icon" :style="{color: item.mapping.color.icon,fontSize:'1em'}"></i>
            </template>
            <span style="white-space: nowrap;">{{handleDisplay(item.mapping.display, { ...item.label, value: item.showValue })}}</span>
          </div>
          <div v-else style="white-space: nowrap;">{{item.showValue}}</div>
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
    <div :id="`chart-canvas-tooltip-${chartId}`" class="chart-canvas-tooltip no-style-class" :class="{'chart-dataLink-tooltip':tooltip.dataLinkShow}" :style="{left:tooltip.x+'px',top:tooltip.y+'px'}" v-if="tooltip.show" v-clickoutside="clickout">
      <div class="chart-canvas-tooltip-title tooltip-title">{{tooltip.title}}</div>
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
    <span class="temp-dom--12" ref="temp-dom"></span>
  </div>
</template>

<script>
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import { getMetricTypeValue } from '@/components/common/js/tools'
import chartDataFormat from '@/components/chart/chartDataFormat'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import { initColor } from '@/components/chart/chart/tools'
// import fontWidth from '@/components/chart/chart/options/fontWidth'
import * as echarts from 'echarts'
import chartSparklineOption from './options/chartSparkline'
import lodash from 'lodash'
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
      tooltip: {
        x: 0,
        y: 0,
        title: 0,
        value: 0,
        mapping: {},
        show: false,
        dataLinkShow: ''
      },
      fontSize: 12,
      customFontSize: '',
      minFontSzie: 12,
      defaultUnit: 60, // 根据stat的长宽取 需要的字体 = (取最短的边 / defaultUnit) * fontSize 因为 需要的字体/fontSize = 实际宽 / defaultUnit
      sparkline: {},
      maxValue: 0
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
        this.getLayout().then(layout => {
          this.renderStat(layout)
          if (this.chartInfo.param.sparklineMode && this.chartInfo.param.sparklineMode !== 'none') {
            this.$nextTick(() => {
              this.drawChart()
            })
          }
        })
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
              value: '',
              showValue: '',
              label: {},
              width: '',
              height: '',
              legend: '',
              name: '',
              mapping: {},
              data: {}
            }
            stat.value = getMetricTypeValue(data.values, chartInfo.param.statistics)
            stat.label = data.metric
            stat.legend = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex).alias
            stat.label.legend = stat.legend
            stat.name = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex).name
            stat.showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(stat.value, null, -1, decimals)
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
        // 计算最大值
        let maxValue = 0
        if (this.statData.length > 0) {
          maxValue = 0
          for (let j = 0; j < this.statData.length; j++) {
            for (let i = 0; i < this.statData[j].data.length; i++) {
              if (!isNaN(this.statData[j].data[i][1])) {
                maxValue = (maxValue < Number(this.statData[j].data[i][1]) ? Number(this.statData[j].data[i][1]) : maxValue)
              }
            }
          }
        }
        this.maxValue = maxValue

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

        this.$emit('chartIsNoData', this.isNoData)
        resolve()
      })
    },
    getLayout () {
      try {
        this.boxWidth = this.$refs['chart-stat-box'].offsetWidth - 3 * this.boxPadding
        this.boxHeight = this.$refs['chart-stat-box'].offsetHeight - 3 * this.boxPadding
      } catch (error) {}
      return new Promise(resolve => {
        let rateMax = 0
        let col = 0
        let row = 0
        for (let i = 1; i <= this.statData.length; i++) {
          const cols = Math.ceil(this.statData.length / i)
          const w = this.boxWidth / i
          const h = this.boxHeight / cols
          const rate = w > h ? h / w : w / h
          if (rate > rateMax) {
            rateMax = rate
            col = cols
            row = i
          }
        }
        if (this.statData.length) {
          while (col * row >= this.statData.length) { // 避免出现空白
            row--
          }
        }
        row++
        if (col === 1 || row === 1) { // 行 或 列有一个为1时 需要调换位置
          const temp = col
          col = row
          row = temp
        }
        resolve({ col, row })
      })
    },
    renderStat (layout) {
      let isDouble = false
      const width = this.boxWidth / layout.col
      const height = this.boxHeight / layout.row
      const integer = Math.floor(this.statData.length / layout.col)
      const remainder = this.statData.length % layout.col
      const specialIndex = integer * layout.col
      const specialWidth = this.boxWidth / remainder
      this.statData.forEach((item, index) => {
        item.height = height
        if (remainder && index >= specialIndex) {
          item.width = specialWidth
        } else {
          item.width = width
        }
        let font = '' // 获取显示的字体
        let display = ''
        if (item.mapping) {
          display = this.handleDisplay(item.mapping.display, { ...item.label, value: item.showValue })
        }
        switch (this.chartInfo.param.text) {
          case 'all':
            if (item.mapping) {
              isDouble = true
              if (item.legend.length > item.showValue.length + 2) {
                font = item.legend
              } else {
                font = display
                if (item.mapping.icon) {
                  font += 'AA'
                }
              }
            } else {
              isDouble = true
              if (item.legend.length > item.showValue.length) {
                font = item.legend
              } else {
                font = item.showValue
              }
            }
            break
          case 'legend':
            if (item.mapping) {
              isDouble = true
              if (item.legend.length > item.showValue.length + 2) {
                font = item.legend
              } else {
                font = display
                if (item.mapping.icon) {
                  font += 'AA'
                }
              }
            } else {
              font = item.legend
            }
            break

          case 'none':
            font = ''
            break
          case 'value':
          default:
            if (item.mapping) {
              font = display
              if (item.mapping.icon) {
                font += 'AA'
              }
            } else {
              font = item.showValue
            }
            break
        }
        const el = this.$refs['temp-dom']
        el.innerText = font
        const elWidth = el.offsetWidth
        const elHeight = el.offsetHeight
        const dimension = Math.min(item.width, item.height * 1.3)
        const fontScale = parseInt('70%', 10) / 100
        let fontSize = Math.min(dimension / 5, 100) * fontScale
        let scale = item.width / elWidth
        if (scale * elHeight > item.height) {
          scale = item.height / elHeight
        }
        if (isDouble) {
          if (scale * elHeight * 2.5 > item.height) {
            scale = item.height / elHeight * 2.5
          }
        }
        item.scale = scale < 1 ? 1 : parseFloat(scale)
        fontSize = fontSize > 12 ? fontSize : this.minFontSzie
        item.fontSize = fontSize

        if (fontSize > 36) {
          item.comparisonFont = 16
        } else if (fontSize > 24) {
          item.comparisonFont = 14
        } else {
          item.comparisonFont = 12
        }
      })
      this.isInit = false
    },
    // 绘制图表
    drawChart () {
      this.statData.forEach((item, index) => {
        const chart = this.sparkline[index] ? this.sparkline[index] : echarts.init(document.getElementById(`chart-canvas-${this.chartId}-${index}`))
        const chartOption = lodash.cloneDeep(chartSparklineOption)
        // sparkline 颜色和 字体颜色 保持一致
        const theme = localStorage.getItem(`nz-user-${localStorage.getItem('nz-user-id')}-theme`) || 'light'
        let color = theme === 'light' ? '#666666' : '#BEBEBE'
        if (item.mapping) {
          color = item.mapping.color.text
        }
        chartOption.series = [{
          ...chartOption.series[0],
          data: item.data,
          lineStyle: {
            color
          }
        }]
        if (this.chartInfo.param.sparklineMode === 'area') {
          chartOption.series[0].areaStyle = {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: this.hexToRgb(color, 0.1)
              },
              {
                offset: 1,
                color: this.hexToRgb(color, 1)
              }
            ])
          }
        }
        chartOption.yAxis.max = this.maxValue
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
        this.getLayout().then(layout => {
          this.renderStat(layout)

          this.$nextTick(() => {
            for (const key in this.sparkline) {
              this.sparkline[key].resize()
            }
          })
        })
      }, 100)
    },
    statMouseEnter (data, e) {
      if (this.tooltip.dataLinkShow) { return }
      this.tooltip.title = data.legend
      this.tooltip.value = data.mapping && data.mapping.display ? this.handleDisplay(data.mapping.display, { ...data.label, value: data.showValue }) : data.showValue
      this.tooltip.mapping = data.mapping
      this.tooltip.show = true
      this.setPosition(e)
    },
    statMouseMove (e) {
      if (this.tooltip.dataLinkShow) { return }
      this.tooltip.show = true
      this.setPosition(e)
    },
    statMouseleave () {
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
          this.tooltip.y = e.pageY + 15
          this.tooltip.x = e.pageX + 15
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
      return this.chartInfo.param.comparison && this.chartInfo.param.comparison !== 'none' && item.height > minHeight && item.width > minWidth
    },
    chartClick (e, data) {
      if (this.dataLink.length) {
        this.tooltip.title = data.legend
        this.tooltip.value = data.mapping && data.mapping.display ? this.handleDisplay(data.mapping.display, { ...data.label, value: data.showValue }) : data.showValue
        this.tooltip.mapping = data.mapping
        this.tooltip.show = true
        this.tooltip.dataLinkShow = true
        this.setPosition(e)
      }
    },
    clickout () {
      if (this.dataLink.length) {
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
    for (const key in this.sparkline) {
      this.sparkline[key].dispose()
      this.sparkline[key] = null
    }
  }
}
</script>
