<template>
  <div
    :class="legendPlacement"
    ref="pie-chart-box"
    class="nz-chart__component nz-chart__component--time-series" @mouseenter="mouseEnterChart"
    @mouseleave="mouseLeaveChart"
  >
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas"></div>
    <chart-legend
      v-if="hasLegend"
      :chart-data="chartData"
      :chart-info="chartInfo"
      :legends="legends"
      :is-fullscreen="isFullscreen"
    ></chart-legend>
  </div>
</template>

<script>
import legend from '@/components/chart/chart/legend'
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import { chartLegendPlacement } from '@/components/common/js/constants'
import * as echarts from 'echarts'
import { getChart, setChart } from '@/components/common/js/common'
import { initColor } from '@/components/chart/chart/tools'

export default {
  name: 'chart-clock',
  components: {
    chartLegend: legend
  },
  mixins: [chartMixin, chartFormat],
  props: {
    chartInfo: Object,
    chartData: Array,
    chartOption: Object,
    isFullscreen: Boolean
  },
  computed: {
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
    }
  },
  data () {
    return {
      colorList: [],
      chartDot: 2,
      isInit: true, // 是否是初始化，初始化时为true，图表初始化结束后设为false
      toolboxIconColor: {
        active: '#53a3cb',
        inactive: '#7e7e7e'
      },
      chartId: '',
      chartTime: null,
      localTimer: null,
      serverTimer: null,
      setTimer: null,
      sysTime: ''
    }
  },
  methods: {
    querySystemState () {
      this.$get('/healthy').then(response => {
        if (response.code == 200) {
          if (response.time) {
            this.chartTime = this.utcTimeToTimezone(response.time)
            this.sysTime = this.getTime()
          }
        }
      })
    },
    initChart (chartOption = this.chartOption) {
      const _soft = this
      /* 使用setTimeout延迟渲染图表，避免样式错乱 */
      this.setTimer = setTimeout(() => {
        const myChart = this.isInit ? echarts.init(document.getElementById(`chart-canvas-${this.chartId}`)) : getChart(this.chartId)
        if (this.chartInfo.param && this.chartInfo.param.timeType === 'local') {
          const date = new Date()
          const second = date.getSeconds()
          const minute = date.getMinutes() + second / 60
          const hour = (date.getHours() % 12) + minute / 60
          chartOption.series.map(e => {
            if (e.name === 'hour') {
              e.data[0].value = hour
            } else if (e.name === 'minute') {
              e.data[0].value = minute
            } else {
              e.data[0].value = second
            }
          })
          myChart.setOption(chartOption)
        } else {
          _soft.querySystemState()
          chartOption.series.map(e => {
            if (e.name === 'hour') {
              e.data[0].value = this.sysTime.hour
            } else if (e.name === 'minute') {
              e.data[0].value = this.sysTime.minute
            } else {
              e.data[0].value = this.sysTime.second
            }
          })
          myChart.setOption(chartOption)
        }
        this.isInit && setChart(this.chartId, myChart) // 缓存；不使用vue的data是为避免整个chart被监听导致卡顿
        this.isInit = false
        if (this.chartInfo.param && this.chartInfo.param.timeType === 'local') {
          clearInterval(_soft.localTimer)
          _soft.localTimer = setInterval(function () {
            const date = new Date()
            const second = date.getSeconds()
            const minute = date.getMinutes() + second / 60
            const hour = (date.getHours() % 12) + minute / 60
            chartOption.animationDurationUpdate = 300
            chartOption.series = [{
              name: 'hour',
              animation: hour !== 0,
              data: [{ value: hour }]
            }, {
              name: 'minute',
              animation: minute !== 0,
              data: [{ value: minute }]
            }, {
              name: 'second',
              animation: second !== 0,
              data: [{ value: second }]
            }]
            myChart.setOption(chartOption)
          }, 1000)
        } else {
          clearInterval(_soft.serverTimer)
          _soft.serverTimer = setInterval(function () {
            _soft.querySystemState()
            chartOption.animationDurationUpdate = 300
            chartOption.series = [{
              name: 'hour',
              animation: _soft.sysTime.hour !== 0,
              data: [{ value: _soft.sysTime.hour }]
            }, {
              name: 'minute',
              animation: _soft.sysTime.minute !== 0,
              data: [{ value: _soft.sysTime.minute }]
            }, {
              name: 'second',
              animation: _soft.sysTime.second !== 0,
              data: [{ value: _soft.sysTime.second }]
            }]
            myChart.setOption(chartOption)
          }, 1000)
        }
      }, 200)
    },
    getTime () {
      const date = new Date(this.chartTime)
      const second = date.getSeconds()
      const minute = date.getMinutes() + second / 60
      const hour = (date.getHours() % 12) + minute / 60
      return { hour, minute, second }
    }
  },
  mounted () {
    this.querySystemState()
    // eslint-disable-next-line vue/no-mutating-props
    this.chartOption.color || (this.chartOption.color = initColor(20))
    this.colorList = this.chartOption.color
    this.initChart(this.chartOption)
  },
  destroyed () {
    clearInterval(this.localTimer)
    clearInterval(this.serverTimer)
    clearInterval(this.setTimer)
  }
}
</script>
