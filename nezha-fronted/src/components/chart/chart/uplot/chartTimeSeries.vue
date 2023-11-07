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
import UPlot from 'uplot/dist/uPlot.cjs'
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
      console.log(this.chartInfo.param)
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
      // .compute(minusVal, null, -1, decimals)
      const opts = {
        id: `chart-canvas-${this.chartId}-uplot`,
        width: 100,
        height: 100,
        cursor: {
          focus: {
            prox: 5
          },
          drag: {
            x: true
          },
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
          {}
        ],
        tzDate: ts => UPlot.tzDate(new Date(ts * 1e3), localStorage.getItem('nz-sys-timezone')),
        fmtDate: () => {
          return self.xAxisLabelFormatter(seriesData[0][0], seriesData[0][seriesData[0].length - 1])
        },
        axes: [
          {},
          {
            scale: 'left',
            values: (u, vals, space) => vals.map(v => leftUnitCompute.compute(v, null, -1, decimals)),
            incrs: incrs,
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
            grid: { show: false },
            scale: 'right',
            // space: (self) => {
            //   console.log(self)
            //   return 50
            // },
            values: (u, vals, space) => vals.map(v => rightUnitCompute.compute(v, null, -1, decimals)),
            incrs: rightIncrs
          }
        ]
      }
      if (this.isConnect !== 'none') {
        opts.cursor.sync = {
          key: 'nz' + this.isFullscreen,
          setSeries: true,
          scales: [null, null]
        }
      }
      const data = this.seriesData = seriesData
      opts.series.push(...seriesAll)
      if (this.isStack) {
        getStackedOpts('', opts, data)
      }
      setTimeout(() => { // 延迟加载 保证legend的高度正常
        const dom = document.getElementById(`chart-canvas-${this.chartId}`)
        const width = dom.offsetWidth
        const height = dom.offsetHeight
        opts.width = width
        opts.height = height
        this.chart = new UPlot(opts, data, document.getElementById(`chart-canvas-${this.chartId}`))
        setChart(this.chartId, this.chart)
      }, 100)
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
      this.clickout()
    },
    legendChange (isGrey) {
      this.isGrey = isGrey
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
