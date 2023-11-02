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
<!--      &lt;!&ndash; 右y轴name &ndash;&gt;-->
<!--      <p class="rightYAxis-name" v-if="hasRightYAxis">-->
<!--        <span>{{chartInfo.param.rightYAxis.label}}</span>-->
<!--      </p>-->
    </div>
    <chart-legend
      ref="legend"
      v-if="hasLegend"
      :chart-data="chartData"
      :chart-info="chartInfo"
      :legends="legends"
      :series="series"
      :is-fullscreen="isFullscreen"
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
import { chartCache, getChart } from '@/components/common/js/common'
import { initColor } from '@/components/chart/chart/tools'
import UPlot from 'uplot/dist/uPlot.esm'
import chartTimeSeriesMixin from '@/components/chart/chart/uplot/chartTimeSeriesMixin'
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
      isGrey: []
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
      console.log(this.chartData, this.chartInfo)
      const opts = {
        id: `chart-canvas-${this.chartId}-uplot`,
        width: 400,
        height: 400,
        legend: {
          show: false,
          live: false,
          isolate: true
        },
        series: [
          {},
          {
            name: this.chartData[0][0].elements.name,
            label: this.chartData[0][0].elements.name,
            scale: 'mb',
            value: (u, v) => v == null ? null : v.toFixed(2) + ' MB',
            stroke: 'green',
            width: 1 / devicePixelRatio
          }

        ],
        axes: [
          {},
          {
            scale: 'mb',
            values: (u, vals, space) => vals.map(v => +v.toFixed(2) + ' MB')
          }
        ]
      }
      const seriesData = this.initSeriesData(this.chartData)
      const data = [
        this.chartData[0][0].values.map(item => item[0]),
        this.chartData[0][0].values.map(item => Number(item[1]) / 1000000).splice(0, 20)
      ]
      console.log(data)
      this.chart = new UPlot(opts, data, document.getElementById(`chart-canvas-${this.chartId}`))
    },
    clickout () {
      if (this.toolbox.show) {
        this.toolbox.show = false
      }
    },
    showAllSeries () {
      if (this.isConnect !== 'none') {
      }
      getChart(this.chartId).dispatchAction({
        type: 'legendAllSelect'
      })
      this.isGrey = this.isGrey.map(() => false)
      this.$refs.legend.isGrey = this.isGrey

      // 点击后 处理Y轴的刻度边的
      const chartInfo = this.chartInfo
      const series = this.$lodash.cloneDeep(this.series)
      const dataArg = series.filter((seriesItem, seriesIndex) => !this.isGrey[seriesIndex])
      const option = this.renderYAxis(dataArg, chartInfo, 'legend')
      getChart(this.chartId) && getChart(this.chartId).setOption({
        yAxis: [
          ...option.yAxis
        ]
      })

      if (this.isConnect !== 'none') {
      }
      this.clickout()
    },
    showSelectedSeries () {
      if (this.isConnect !== 'none') {

      }
      this.legends.forEach((item, index) => {
        if (index == this.toolbox.clickIndex) {
          getChart(this.chartId).dispatchAction({
            type: 'legendSelect',
            name: item.name
          })
        } else {
          getChart(this.chartId).dispatchAction({
            type: 'legendUnSelect',
            name: item.name
          })
        }
      })
      this.isGrey = this.isGrey.map((g, i) => i !== this.toolbox.clickIndex)
      this.$refs.legend.isGrey = this.isGrey

      // 点击后 处理Y轴的刻度边的
      const chartInfo = this.chartInfo
      const series = this.$lodash.cloneDeep(this.series)
      const dataArg = series.filter((seriesItem, seriesIndex) => !this.isGrey[seriesIndex])
      const option = this.renderYAxis(dataArg, chartInfo, 'legend')
      getChart(this.chartId) && getChart(this.chartId).setOption({
        yAxis: [
          ...option.yAxis
        ]
      })

      if (this.isConnect !== 'none') {
      }
      this.clickout()
    }
  },
  mounted () {
    this.chartOption.color || (this.chartOption.color = initColor(20))
    this.colorList = this.chartOption.color
    try {
      this.isStack = this.chartInfo.param.stack
    } catch (e) {}
    this.chartInfo.loaded && this.initChart(this.chartOption)
  }
}
</script>

<style scoped>

</style>
