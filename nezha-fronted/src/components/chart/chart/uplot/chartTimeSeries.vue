<template>
  <div
    :class="legendPlacement"
    ref="timeSeries-chart-box"
    class="nz-chart__component nz-chart__component--time-series" @mouseenter="mouseEnterChart"
    @mouseleave="mouseLeaveChart"
    v-my-loading="chartLoading"
  >
    <div class="chart__canvas" style="position:relative" :class="{'chart-cursor-default':cursorDefault}">
      <div :id="`chart-canvas-${chartId}`"></div>
    </div>
    <chart-legend
      ref="legend"
      style="flex-shrink: 0"
      v-if="hasLegend"
      :chart-data="chartData"
      :chart-info="chartInfo"
      :legends="legends"
      :series="series"
      :is-fullscreen="isFullscreen"
      @legendChange="legendChange"
    ></chart-legend>
    <!-- toolbox -->
    <div :id="`chart-toolbox-${chartId}`" class="chart-canvas-tooltip no-style-class chart-toolbox" :style="{left:toolbox.x+'px',top:toolbox.y+'px'}" v-if="toolbox.show" v-clickoutside="clickout">
      <div v-html="toolbox.tooltipHtml"></div>
      <!-- dataLink -->
      <div class="chart-dataLink-list">
        <!-- 复制表达式 -->
        <div class="chart-dataLink-item select-series" v-if="chartInfo.datasource==='metrics'||chartInfo.datasource==='logs'" @click="copyExpr">
          <i class="nz-icon nz-icon-override"></i>
          <span v-if="chartInfo.datasource==='metrics'">{{$t('overall.copy')}} PromQL</span>
          <span v-else>{{$t('overall.copy')}} LogQL</span>
        </div>
        <!-- 只有一条数据时显示 -->
        <div class="chart-dataLink-item select-series" v-if="isGrey.filter(value => value === false).length==1" @click="showAllSeries">
          <i class="nz-icon nz-icon-a-Showallseries"></i>
          <span>{{$t('dashboard.showAllSeries')}}</span>
        </div>
        <!-- 有多条数据时显示 -->
        <div class="chart-dataLink-item select-series" v-else @click="showSelectedSeries">
          <i class="nz-icon nz-icon-a-Showseletedseries"></i>
          <span>{{$t('dashboard.showSelectedSeries')}}</span>
        </div>
        <div class="chart-dataLink-item" v-for="(item,index) in dataLink" :title='item.title' :key="index" @click="linkClick(item)">
          <i class="nz-icon nz-icon-link"></i>
          <span>{{item.title}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import legend from '../legend'
import chartMixin from '@/components/chart/chartMixin'
import renderChart from '@/components/chart/renderChart'
import { chartLegendPlacement } from '@/components/common/js/constants'
import { getChart, setChart, chartCache } from '@/components/common/js/common'
import { initColor } from '@/components/chart/chart/tools'
import UPlot from 'uplot'
import chartTimeSeriesMixin from '@/components/chart/chart/uplot/chartTimeSeriesMixin'
import chartDataFormat from '@/components/chart/chartDataFormat'
import getStackedOpts from './stack'

export default {
  name: 'chartTimeSeries',
  components: {
    chartLegend: legend
  },
  props: {
    from: String,
    multipleTime: {},
    minusTime: {}
  },
  mixins: [chartMixin, renderChart, chartTimeSeriesMixin],
  data () {
    return {
      stackTotalColor: null,
      stackTotalColorRight: null,
      isStack: false,
      hasRightYAxis: false,
      chartLoading: false,
      cursorDefault: false,
      toolbox: {
        x: 0,
        y: 0,
        title: 0,
        value: 0,
        mapping: {},
        show: false,
        metric: {},
        activeIndex: undefined,
        clickIndex: undefined
      },
      isGrey: [],
      seriesData: []
    }
  },
  computed: {
    lineOption () {
      return this.nzDefaultConfig.option
    },
    hasLegend () {
      try {
        return [chartLegendPlacement.bottom, chartLegendPlacement.left, chartLegendPlacement.right].indexOf(this.chartInfo.param.legend.placement) > -1 && this.chartInfo.param.enable.legend
      } catch (e) {
        return false
      }
    },
    legendPlacement () {
      try {
        switch (this.chartInfo.param.legend.placement) {
          case 'left':
          case 'right':
          case 'bottom': {
            return `nz-chart__component--${this.chartInfo.param.legend.placement}`
          }
          default: return ''
        }
      } catch (e) {
        return ''
      }
    },
    // timeSeries类型图表联动
    isConnect () {
      return this.$store.state.panel.isConnect
    }
  },
  watch: {
    // 监听当前鼠标所在的图表id变化
    '$store.state.panel.currentMousemove': {
      handler (n) {
        if (this.isConnect !== 'crosshair') {
          return
        }
        // 判断是否是当前鼠标所在的图表
        if (n === this.chartId) {
          let option = {}
          for (const key in chartCache) {
            if (!chartCache[key] || chartCache[key].group !== 'timeSeriesGroup') {
              continue
            }
            if (chartCache[key] === getChart(this.chartId)) {
              option = {
                tooltip: {
                  className: 'chart-time-series'
                }
              }
            } else {
              option = {
                tooltip: {
                  className: 'chart-time-series hide'
                }
              }
            }
            chartCache[key].setOption(option)
          }
        }
      }
    }
  },
  methods: {
    initChart (chartOptions = this.chartOption) {
      this.setDataLink()
      try {
        this.isStack = !!this.chartInfo.param.stack
      } catch (e) {}
      const self = this
      const leftUnit = this.chartInfo.unit
      const leftUnitCompute = chartDataFormat.getUnit(leftUnit)
      const rightUnit = this.$lodash.get(this.chartInfo, 'param.rightYAxis.unit', 2)
      const rightUnitCompute = chartDataFormat.getUnit(rightUnit)
      const incrs = leftUnitCompute.ascii == 1024 ? this.incrs : undefined
      const rightIncrs = rightUnitCompute.ascii == 1024 ? this.incrs : undefined
      const decimals = this.chartInfo.param.decimals || 2
      const cursLeft = -10
      const cursTop = -10
      const { seriesData, seriesAll } = this.initSeriesData(this.chartData)
      this.isNoData = false
      if (!seriesData.length || seriesData.length == 1) {
        this.isNoData = true
        this.$emit('chartIsNoData', this.isNoData)
      }
      if (this.isNoData) {
        return
      }
      // .compute(minusVal, null, -1, decimals)
      let opts = {
        id: `chart-canvas-${this.chartId}-uplot`,
        mode: 1,
        width: 100,
        height: 100,
        cursor: {
          focus: {
            prox: 5
          },
          drag: {
            x: true
          },
          dataIdx: (self, seriesIdx, hoveredIdx, cursorXVal) => {
            const seriesData = self.data[seriesIdx]
            const hoverProximityPx = (self.valToPos(self.data[0][1], 'x') - self.valToPos(self.data[0][0], 'x')) / 2
            if (seriesData[hoveredIdx] == null) {
              let nonNullLft = null
              let nonNullRgt = null
              let i

              i = hoveredIdx
              while (nonNullLft == null && i-- > 0) {
                if (seriesData[i] != null) { nonNullLft = i }
              }

              i = hoveredIdx
              while (nonNullRgt == null && i++ < seriesData.length) {
                if (seriesData[i] != null) { nonNullRgt = i }
              }

              const xVals = self.data[0]

              const curPos = self.valToPos(cursorXVal, 'x')
              const rgtPos = nonNullRgt == null ? Infinity : self.valToPos(xVals[nonNullRgt], 'x')
              const lftPos = nonNullLft == null ? -Infinity : self.valToPos(xVals[nonNullLft], 'x')

              const lftDelta = curPos - lftPos
              const rgtDelta = rgtPos - curPos

              if (lftDelta <= rgtDelta) {
                if (lftDelta <= hoverProximityPx) { hoveredIdx = nonNullLft }
              } else {
                if (rgtDelta <= hoverProximityPx) { hoveredIdx = nonNullRgt }
              }
            }
            return hoveredIdx
          },
          points: {
            size: 10,
            width: 5
          }
        },
        plugins: [
          this.tooltipPlugin({
            onclick (u, seriesIdx, dataIdx) {
              console.log(u, seriesIdx, dataIdx, 'nz-tooltipClick')
            }
          })
        ],
        padding: [15, this.autoPadRight, 15, 15],
        legend: {
          show: false
        },
        series: [
          {
            scale: 'x'
          }
        ],
        tzDate: ts => UPlot.tzDate(new Date(ts * 1e3), localStorage.getItem('nz-sys-timezone')),
        fmtDate: () => {
          return self.xAxisLabelFormatter(seriesData[0][0], seriesData[0][seriesData[0].length - 1])
        },
        axes: [
          {
            scale: 'x',
            gap: 5,
            grid: {
              show: true,
              stroke: 'rgba(0, 10, 23, 0.09)',
              width: 1
            }
          },
          {
            scale: 'left',
            values: (u, vals, space) => vals.map(v => leftUnitCompute.compute(v, null, -1, decimals)),
            incrs: incrs,
            gap: 5,
            grid: {
              show: true,
              stroke: 'rgba(0, 10, 23, 0.09)',
              width: 1
            },
            // space: (self) => {
            //   console.log(self)
            //   return 50
            // },
            size (self, values, axisIdx, cycleNum) {
              const axis = self.axes[axisIdx]

              // bail out, force convergence
              if (cycleNum > 1) { return axis._size }

              let axisSize = axis.ticks.size + axis.gap

              // find longest value
              const longestVal = (values ?? []).reduce((acc, val) => (
                val.length > acc.length ? val : acc
              ), '')

              if (longestVal != '') {
                self.ctx.font = axis.font[0]
                axisSize += self.ctx.measureText(longestVal).width / devicePixelRatio
              }

              return Math.ceil(axisSize)
            }
          },
          {
            show: true,
            side: 1,
            grid: {
              show: false,
              stroke: 'rgba(0, 10, 23, 0.09)',
              width: 1
            },
            scale: 'right',
            gap: 5,
            // space: (self) => {
            //   console.log(self)
            //   return 50
            // },
            values: (u, vals, space) => vals.map(v => rightUnitCompute.compute(v, null, -1, decimals)),
            incrs: rightIncrs,
            ticks: {
              show: false // true
            },
            size (self, values, axisIdx, cycleNum) {
              const axis = self.axes[axisIdx]

              // bail out, force convergence
              if (cycleNum > 1) { return axis._size }

              let axisSize = axis.ticks.size + axis.gap

              // find longest value
              const longestVal = (values ?? []).reduce((acc, val) => (
                val.length > acc.length ? val : acc
              ), '')

              if (longestVal != '') {
                self.ctx.font = axis.font[0]
                axisSize += self.ctx.measureText(longestVal).width / devicePixelRatio
              }

              return Math.ceil(axisSize)
            }
          }
        ],
        scales: {
          x: {
            key: 'x',
            auto: true,
            ori: 0,
            dir: 1,
            time: true
          },
          left: {
            key: 'left',
            time: false,
            auto: true,
            ori: 1,
            dir: 1,
            distr: 1
          },
          right: {
            key: 'right',
            time: false,
            auto: true,
            ori: 1,
            dir: 1,
            distr: 1
          }
        }
      }
      if (this.isConnect !== 'none') { // 是否同步光标
        opts.cursor.sync = {
          key: 'nz' + this.isFullscreen,
          setSeries: true,
          scales: [null, null]
        }
      }
      let data = this.seriesData = seriesData
      opts.series.push(...seriesAll)
      if (this.isStack) {
        const obj = getStackedOpts('', opts, data)
        opts = obj.opts
        data = obj.data
      }
      this.renderMinMax(opts)
      if (getChart(this.chartId)) {
        getChart(this.chartId).destroy()
      }
      setTimeout(() => { // 延迟加载 保证legend的高度正常
        const dom = document.getElementById(`chart-canvas-${this.chartId}`)
        if (!dom) {
          return
        }
        const width = dom.offsetWidth
        const height = dom.offsetHeight
        opts.width = width
        opts.height = height
        let chartUplot = ''
        chartUplot = new UPlot(opts, data, document.getElementById(`chart-canvas-${this.chartId}`))
        setChart(this.chartId, chartUplot)
      }, 100)
    },
    renderMinMax (opts) {
      let leftMin = this.$lodash.get(this.chartInfo, 'param.min', undefined)
      let leftMax = this.$lodash.get(this.chartInfo, 'param.max', undefined)
      if (leftMin || leftMax) {
        if (leftMin > leftMax) {
          const temp = leftMin
          leftMin = leftMax
          leftMax = temp
        }
        opts.scales.left.range = (self, initMin, initMax, scaleKey) => {
          if (typeof (leftMin) === 'undefined') {
            if (initMin > 0) {
              leftMin = initMin / 2
            } else {
              leftMin = initMin * 2
            }
          }
          if (typeof (leftMax) === 'undefined') {
            if (initMax > 0) {
              leftMax = initMax * 2
            } else {
              leftMax = initMax / 2
            }
          }
          return [leftMin, leftMax]
        }
      }
      const rightYAxisEnable = this.$lodash.get(this.chartInfo, 'param.enable.rightYAxis', false)
      if (rightYAxisEnable) {
        let rightMin = this.$lodash.get(this.chartInfo, 'param.rightYAxis.min', undefined)
        let rightMax = this.$lodash.get(this.chartInfo, 'param.rightYAxis.max', undefined)
        if (rightMin || rightMax) {
          if (rightMin > leftMax) {
            const temp = rightMin
            rightMin = rightMax
            rightMax = temp
          }
          opts.scales.right.range = (self, initMin, initMax, scaleKey) => {
            if (typeof (rightMin) === 'undefined') {
              if (initMin > 0) {
                rightMin = initMin / 2
              } else {
                rightMin = initMin * 2
              }
            }
            if (typeof (rightMax) === 'undefined') {
              if (initMax > 0) {
                rightMax = initMax * 2
              } else {
                rightMax = initMax / 2
              }
            }
            return [rightMin, rightMax]
          }
        }
      }
    },
    size (self, values, axisIdx, cycleNum) {
      const axis = self.axes[axisIdx]

      // bail out, force convergence
      if (cycleNum > 1) { return axis._size }

      let axisSize = axis.ticks.size + axis.gap

      // find longest value
      const longestVal = (values ?? []).reduce((acc, val) => (
        val.length > acc.length ? val : acc
      ), '')

      if (longestVal != '') {
        self.ctx.font = axis.font[0]
        axisSize += self.ctx.measureText(longestVal).width / devicePixelRatio
      }

      return Math.ceil(axisSize)
    },
    autoPadRight (self, side, sidesWithAxes, cycleNum) {
      const xAxis = self.axes[0]

      const xVals = xAxis._values

      if (xVals != null) {
        // bail out, force convergence
        if (cycleNum > 2) { return self._padding[1] }

        const xSplits = xAxis._splits
        const rightSplit = xSplits[xSplits.length - 1]
        const rightSplitCoord = self.valToPos(rightSplit, 'x')
        const leftPlotEdge = (self.bbox.left / devicePixelRatio)
        const rightPlotEdge = leftPlotEdge + (self.bbox.width / devicePixelRatio)
        const rightChartEdge = rightPlotEdge + self._padding[1]

        const pxPerChar = 15
        const rightVal = xVals[xVals.length - 1] + ''
        const valHalfWidth = pxPerChar * (rightVal.length / 2)

        const rightValEdge = leftPlotEdge + rightSplitCoord + valHalfWidth

        if (rightValEdge >= rightChartEdge) {
          return rightValEdge - rightPlotEdge
        }
      }

      // default size
      return 15
    },
    clickout () {
      if (this.toolbox.show) {
        this.toolbox.show = false
      }
    },
    showAllSeries () {
      const echarts = getChart(this.chartId)
      const arr = []
      if (echarts) {
        echarts.series.forEach((seriesItem, sindex) => {
          if (sindex > 0) {
            echarts.setSeries(sindex, { show: true, focus: false })
            arr.push(false)
          }
        })
        this.isGrey = arr
        if (this.$refs.legend) {
          this.$refs.legend.isGrey = arr
        }
        if (this.$refs.legend) {
          this.$refs.legend.isGrey = this.isGrey = arr
        }
      }
      this.renderYaxis()
      this.clickout()
    },
    showSelectedSeries () {
      const index = this.toolbox.clickIndex
      const echarts = getChart(this.chartId)
      const arr = []
      if (echarts) {
        echarts.series.forEach((seriesItem, sindex) => {
          if (sindex > 0) {
            echarts.setSeries(sindex, { show: false, focus: false })
            arr.push(true)
          }
        })
        echarts.setSeries(index + 1, { show: true, focus: false })
        arr[index] = false
        this.isGrey = arr
        if (this.$refs.legend) {
          this.$refs.legend.isGrey = arr
        }
      }
      this.renderYaxis()
      this.clickout()
    },
    legendChange (isGrey) {
      this.isGrey = isGrey
      this.renderYaxis()
    },
    resize () {
      setTimeout(() => {
        const dom = this.$refs['timeSeries-chart-box']
        const width = dom.offsetWidth
        const legendHeight = this.$lodash.get(this.$refs, 'legend.$el.offsetHeight', 40)
        const height = dom.offsetHeight - legendHeight
        const u = getChart(this.chartId)
        if (u) {
          u.setSize({ width, height })
        }
      }, 100)
    },
    renderYaxis () {
      const u = getChart(this.chartId)
      let leftShow = false
      let rightShow = false
      u.series.forEach(item => {
        if (item.show && item.scale == 'left') {
          leftShow = true
        }
        if (item.show && item.scale == 'right') {
          rightShow = true
        }
      })
      u.axes[1].show = leftShow
      u.axes[2].show = rightShow
      if (!leftShow) {
        u.axes[2].grid.show = true
      } else {
        u.axes[2].grid.show = false
      }
      u.redraw(false, true)
    }
  },
  mounted () {
    this.chartOption.color || (this.chartOption.color = initColor(20))
    this.colorList = this.chartOption.color
    try {
      this.isStack = !!this.chartInfo.param.stack
    } catch (e) {}
    this.chartInfo.loaded && this.initChart(this.chartOption)
  },
  beforeDestroy () {
    const chart = getChart(this.chartId)
    if (chart) {
      const over = chart.over
      over.removeEventListener()
      chart.destroy()
    }
  }
}
</script>

<style scoped>

</style>
