<template>
  <div class="chart-stat" ref="chart-stat-box" @mousemove="statMouseMove">
    <div
      class="chart-stat-item"
      v-for="(item,index) in statData"
      :key="index"
      @mouseenter="statMouseEnter(item)"
      @mouseleave="statMouseleave(item)"
      :class="statData.length===1 ?'only-stat' : ''"
      :style="{
        background:item.mapping ? item.mapping.color.bac : (statData.length===1 ? '' : colorList[index]),
        height:item.height+'px',
        width:item.width + 'px',
        fontSize: item.height > item.width ? (14 * (item.width/60)+ 'px') : (14 * (item.height/60)+ 'px')
      }"
    >
      <span v-if="chartInfo.param.text==='all'">
        <span v-if="item.mapping" :style="{color:item.mapping.color.text}">
          {{item.legend}}<br/><span>{{handleDisplay(item.mapping.display, { ...item.label, value: item.showValue })}}</span>
        </span>
        <span v-else>{{item.legend}}<br/><span>{{item.showValue}}</span></span>
      </span>
      <span v-if="chartInfo.param.text==='legend'">
        <span v-if="item.mapping" :style="{color:item.mapping.color.text}">
           {{item.legend}}<br/><span>{{handleDisplay(item.mapping.display, { ...item.label, value: item.showValue })}}</span>
        </span>
        <span v-else>{{item.legend}}</span>
      </span>
      <span v-if="chartInfo.param.text==='value'|| !chartInfo.param.text">
        <span v-if="item.mapping" :style="{color:item.mapping.color.text}">
          {{handleDisplay(item.mapping.display, { ...item.label, value: item.showValue })}}
        </span>
        <span v-else>{{item.showValue}}</span>
      </span>
      <span v-if="chartInfo.param.text==='none'"></span>
    </div>
    <div :class="`chart-canvas-tooltip-${chartId}`" :id="`chart-canvas-tooltip-${chartId}`" class="chart-canvas-tooltip" :style="{left:tooltip.x+'px',top:tooltip.y+'px'}" v-if="tooltip.show">
      <div class="chart-canvas-tooltip-title tooltip-title">
        {{tooltip.title}}
      </div>
      <div class="chart-canvas-tooltip-content">
        <div>value</div>
        <div>{{tooltip.value}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import { getMetricTypeValue } from '@/components/common/js/tools'
import chartDataFormat from '@/components/charts/chartDataFormat'
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
      boxPadding: 5,
      statTimer: null,
      tooltip: {
        x: 0,
        y: 0,
        title: 0,
        value: 0,
        show: false
      },
      fontSize: 12,
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
      return new Promise(resolve => {
        let colorIndex = 0
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
            stat.name = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex).name
            stat.showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(stat.value, null, -1, 2)
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
    statMouseEnter (that) {
      this.tooltip.title = that.legend
      this.tooltip.value = that.showValue
      this.tooltip.show = true
    },
    statMouseleave (taht) {
      this.tooltip.show = false
    },
    getLayout () {
      this.boxWidth = this.$refs['chart-stat-box'].offsetWidth - 3 * this.boxPadding
      this.boxHeight = this.$refs['chart-stat-box'].offsetHeight - 3 * this.boxPadding
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
        if (col === 1 || row === 1) { // 行 或 列有一个为1时 需要调换位置 显示才会好看
          const temp = col
          col = row
          row = temp
        }
        resolve({ col, row })
      })
    },
    renderStat (layout) {
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
      }, 50)
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
