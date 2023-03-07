<template>
  <div class="chart-stat" ref="chart-stat-box" @mousemove="statMouseMove">
    <div
      class="chart-stat-item"
      v-for="(item,index) in statData"
      :key="index"
      @mouseenter="statMouseEnter(item,$event)"
      @mouseleave="statMouseleave(item)"
      :class="statData.length===1 ?'only-stat' : ''"
      :style="{
        background:item.mapping ? item.mapping.color.bac : (statData.length===1 ? '' : colorList[index]),
        height:item.height+'px',
        width:item.width + 'px',
        fontSize: item.fontSize,
      }"
    >
      <div>
        <span v-if="chartInfo.param.text==='all'">
        <span v-if="item.mapping" :style="{color:item.mapping.color.text}">
          {{item.legend}}<br/>
          <template v-if="item.mapping && item.mapping.icon">
            <i :class="item.mapping.icon" :style="{color: item.mapping.color.icon,fontSize:'1em'}"></i>
          </template>
          <span>{{handleDisplay(item.mapping.display, { ...item.label, value: item.showValue })}}</span>
        </span>
        <span v-else>{{item.legend}}<br/><span>{{item.showValue}}</span></span>
      </span>
        <span v-if="chartInfo.param.text==='legend'">
        <span v-if="item.mapping" :style="{color:item.mapping.color.text}">
          {{item.legend}}<br/>
          <template v-if="item.mapping && item.mapping.icon">
            <i :class="item.mapping.icon" :style="{color: item.mapping.color.icon,fontSize:'1em'}"></i>
          </template>
          <span>{{handleDisplay(item.mapping.display, { ...item.label, value: item.showValue })}}</span>
        </span>
        <span v-else>{{item.legend}}</span>
      </span>
        <span v-if="chartInfo.param.text==='value'|| !chartInfo.param.text">
        <span v-if="item.mapping" :style="{color:item.mapping.color.text}">
          <template v-if="item.mapping && item.mapping.icon">
            <i :class="item.mapping.icon" :style="{color: item.mapping.color.icon,fontSize:'1em'}"></i>
          </template>
          {{handleDisplay(item.mapping.display, { ...item.label, value: item.showValue })}}
        </span>
        <span v-else>{{item.showValue}}</span>
      </span>
        <span v-if="chartInfo.param.text==='none'"></span>
      </div>
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

export default {
  name: 'chart-stat',
  mixins: [chartMixin, chartFormat],
  data () {
    return {
      statData: [],
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
        show: false
      },
      fontSize: 12,
      customFontSize: '',
      minFontSzie: 12,
      defaultUnit: 60 // 根据stat的长宽取 需要的字体 = (取最短的边 / defaultUnit) * fontSize 因为 需要的字体/fontSize = 实际宽 / defaultUnit
    }
  },
  methods: {
    randomcolor,
    initChart () {
      this.initStatData(this.chartInfo, this.chartData).then(() => {
        if (this.isNoData) {
          return
        }
        this.getLayout().then(layout => {
          this.renderStat(layout)
        })
      })
    },
    initStatData (chartInfo, originalDatas) {
      this.statData = []
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
              mapping: {

              }
            }
            stat.value = getMetricTypeValue(data.values, chartInfo.param.statistics)
            stat.label = data.metric
            stat.legend = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex).alias
            stat.label.legend = stat.legend
            stat.name = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex).name
            stat.showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(stat.value, null, -1, decimals)
            stat.mapping = this.selectMapping(stat.value, chartInfo.param.valueMapping, chartInfo.param.enable && this.chartInfo.param.enable.valueMapping)
            this.statData.push(stat)
            colorIndex++
          })
        })
        this.$emit('chartIsNoData', this.isNoData)
        resolve()
      })
    },
    statMouseMove (e) {
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
    statMouseEnter (that, e) {
      this.tooltip.title = this.$loadsh.cloneDeep(that.legend)
      this.tooltip.value = this.$loadsh.cloneDeep(that.showValue)
      this.tooltip.mapping = this.$loadsh.cloneDeep(that.mapping)
      this.tooltip.show = true
      this.$nextTick(() => {
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
      })
    },
    statMouseleave (taht) {
      this.tooltip.show = false
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
        item.fontSize = fontSize + 'px'
      })
      this.isInit = false
    },
    resize () {
      if (this.statTimer) {
        clearTimeout(this.statTimer)
        this.statTimer = null
      }
      this.statTimer = setTimeout(() => {
        this.getLayout().then(layout => {
          this.renderStat(layout)
        })
      }, 100)
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
    }
  },
  mounted () {
    this.colorList = initColor(20)
    this.chartInfo.loaded && this.initChart()
  }
}
</script>

<style scoped>

</style>
