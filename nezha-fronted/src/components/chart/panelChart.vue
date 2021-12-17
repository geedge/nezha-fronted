<template>
  <!-- chart外层箱子 -->
  <div :class="{'panel-chart--fullscreen': isFullscreen}" class="panel-chart">
    <!-- title和工具栏，支持浮动 -->
    <chart-header
      v-if="!isFullscreen"
      :is-group="isGroup(chartInfo.type)"
      :chart-info="chartInfo"
      @edit-chart="$emit('edit-chart', chartInfo)"
      @refresh="refresh"
      @groupShow="groupShow"
      @showFullscreen="showFullscreen"
    ></chart-header>
    <!-- chart -->
    <!-- 数据查询后传入chart组件，chart组件内不查询，只根据接传递的数据来渲染 -->
    <chart
      ref="chart"
      :chart-data="chartData"
      :chart-info="chartInfo"
      :panelLock="panelLock"
      :is-fullscreen="isFullscreen"
      :loading="loading"
      v-if="!isGroup(chartInfo.type) || !chartInfo.param.collapse"
    ></chart>
  </div>
</template>

<script>
import chartHeader from '@/components/chart/chartHeader'
import chart from '@/components/chart/chart'
import { isChartPie, isTimeSeries, getGroupHeight, isGroup } from './chart/tools'
import { chartType, fromRoute } from '@/components/common/js/constants'
import bus from '@/libs/bus'
import axios from 'axios'
import chartTempData from '@/components/charts/chartTempData'
import logsData from '@/components/chart/logsData'

export default {
  name: 'panelChart',
  components: {
    chartHeader,
    chart
  },
  props: {
    chartInfo: Object, // 其中的param json串已转化为对象
    timeRange: Array, // 时间范围
    isFullscreen: Boolean,
    panelLock: Boolean,
    chartDetailInfo: Object
  },
  data () {
    return {
      chartData: [],
      loading: true
    }
  },
  computed: {
    headerH () {
      return this.$store.getters.getHeaderH
    },
    headerHPadding () {
      return this.$store.getters.getHeaderHPadding
    }
  },
  methods: {
    isGroup,
    // 参数 isRefresh 标识是否是刷新操作
    getChartData (isRefresh) {
      this.loading = true
      // TODO assetInfo、endpointInfo、echarts等进行不同的处理
      let startTime = ''
      let endTime = ''
      if (isRefresh) { // 刷新则视情况更新时间范围
        const now = new Date(bus.computeTimezone(new Date().getTime()))
        const origin = new Date(this.timeRange[1])
        const numInterval = now.getTime() - origin.getTime()
        if (numInterval >= 60000) { // 大于1分钟，则start、end均往后移numInterval，否则时间不变
          startTime = bus.getNewTime(this.timeRange[0], numInterval)
          endTime = bus.timeFormate(now, 'yyyy-MM-dd hh:mm:ss')
        } else {
          startTime = this.timeRange[0]
          endTime = this.timeRange[1]
        }
      } else {
        startTime = this.timeRange[0]
        endTime = this.timeRange[1]
      }
      const step = bus.getStep(startTime, endTime)
      startTime = this.$stringTimeParseToUnix(startTime)
      endTime = this.$stringTimeParseToUnix(endTime)

      const elements = this.chartInfo.elements || []
      this.query(elements, startTime, endTime, step)
    },
    query (elements, startTime, endTime, step) {
      try {
        switch (this.chartInfo.datasource) {
          case 'metrics':
          case 'logs': {
            let urlPre = ''
            if (this.chartInfo.datasource === 'metrics') {
              urlPre += '/prom'
            } else if (this.chartInfo.datasource === 'logs') {
              urlPre += '/logs/loki'
            }
            const requests = elements.map((element) => {
              if (this.from === fromRoute.chartTemp) {
                return chartTempData
              }
              let query = `${urlPre}/api/v1/query_range?start=${startTime}&end=${endTime}&step=${step}`
              if (isTimeSeries(this.chartInfo.type)) {
                query += `&nullType=${this.chartInfo.param.nullType || 'null'}`
              }
              // if (isChartPie(this.chartInfo.type)) {
              //   query += `&statistics=${this.chartInfo.param.statistics || 'last'}`
              // }
              query += `&query=${element.expression}`
              return this.$get(query)
            })

            const chartData = []
            axios.all(requests).then(res => {
              res.forEach(r => {
                if (this.chartInfo.type === 'log') {
                  r = logsData
                }
                if (r.status === 'success') {
                  chartData.push(r.data.result)
                } else {
                  chartData.push({ error: r.msg || r.error || r })
                }
              })
              this.chartData = chartData
              if (this.chartInfo.type === 'log') {
                this.logChartDataFormat()
              }
            }).catch(res => {
              console.log(res)
            }).finally(() => {
              this.loading = false
            })
            break
          }
          case 'system': {
            if (this.chartInfo.type === 'assetInfo') {
              this.$get('asset/asset/' + this.chartDetailInfo.id).then(res => {
                this.chartData = res.data
              })
            }
            if (this.chartInfo.type === 'endpointInfo') {
              this.$get('monitor/endpoint/' + this.chartDetailInfo.id).then(res => {
                this.chartData = res.data
              })
            }
            const q = {
              type: this.chartInfo.param.datasource[0].type,
              group: this.chartInfo.param.datasource[0].group,
              select: [this.chartInfo.param.datasource[0].select],
              limit: this.chartInfo.param.datasource[0].limit,
              sort: this.chartInfo.param.datasource[0].sort
            }
            const chartData = []
            const params = {
              q: encodeURIComponent(JSON.stringify(q)),
              stat: startTime,
              end: endTime,
              resultType: 'matrix'
            }
            this.$get('/stat', params).then(res => {
              if (res.code === 200) {
                chartData.push(res.data.result)
              } else {
                chartData.push({ error: res.msg || res.error || res })
              }
              this.chartData = chartData
              this.loading = false
            })
            break
          }
          case 'misc': {
            if (this.chartInfo.type === 'hexagonFigure') {
              this.getHexagonFigureData().then(res => {
                this.chartData = res
              }).finally(() => {
                this.loading = false
              })
            }
            if (this.chartInfo.type === 'diagram') {
              this.chartData = [this.chartInfo.param.topo]
              if (!this.chartInfo.param.topo || !this.chartInfo.param.topo.pens.length) {
                this.chartData = []
              } else {
                this.chartData = [this.chartInfo.param.topo]
              }
            }
            if (this.chartInfo.type === 'group') {
              console.log(this.chartInfo.children)
              this.chartData = [...this.chartInfo.children]
              this.groupInit()
            }
            if (this.chartInfo.type === 'carousel') {
              this.chartData = ['carousel']
            }
            if (this.chartInfo.type === 'map') {
              this.chartData = ['map']
            }
            break
          }
        }
      } catch (e) {
        this.loading = false
      }
    },
    getHexagonFigureData () {
      return new Promise(resolve => {
        this.$get('stat/alertMessage/topN', { size: 48, dimension: 'module' }).then(response => {
          if (response.code === 200) {
            const moduleData = response.data.list
            moduleData.sort((a, b) => b.alertNum - a.alertNum)
            const alertTopModules = moduleData.slice(0, 48)
            const requests = alertTopModules.map(a => axios.get(`stat/alertMessage/severity?moduleId=${a.id}`))
            const moduleStateData = []
            axios.all(requests).then(result => {
              result.forEach((alert, i) => {
                const severityData = {}
                alert.data.data.list && alert.data.data.list.forEach(a => {
                  severityData[a.name] = a.num
                })
                !severityData.P1 && (severityData.P1 = 0)
                !severityData.P2 && (severityData.P2 = 0)
                !severityData.P3 && (severityData.P3 = 0)
                moduleStateData.push({ ...alertTopModules[i], alert: [severityData] })
              })
              resolve(moduleStateData)
            })
          }
        })
      })
    },
    resize () {
      this.$refs.chart.resize()
    },
    refresh () {
      this.getChartData(true)
    },
    logChartDataFormat () {
      this.chartData.forEach((item, index) => {
        const elements = this.chartInfo.elements[index]
        item.forEach(row => {
          row.elements = elements
        })
      })
    },
    groupInit () {
      const height = getGroupHeight(this.chartInfo.children || [])
      if (this.chartInfo.param.collapse) {
        this.chartInfo.height = this.headerH
        this.chartInfo.h = this.headerH
        bus.$emit('groupMove', '', '', true)
        return
      }
      if (this.chartInfo.children && this.chartInfo.children.length) {
        this.chartInfo.height = height + this.headerHPadding
        this.chartInfo.h = height + this.headerHPadding
      } else {
        console.log(this.headerH)
        this.chartInfo.height = this.headerH + height
        this.chartInfo.h = this.headerH + height
      }
    },
    showFullscreen (show) {
      this.$emit('showFullscreen', show, this.chartInfo)
    },
    groupShow (flag) {
      this.chartInfo.param.collapse = flag
      this.groupInit()
      bus.$emit('groupMove', '', '', true)
      this.$emit('groupShow', this.chartInfo)
    }
  },
  watch: {
    timeRange: {
      deep: true,
      handler (n) {
        this.refresh()
      }
    }
  },
  mounted () {
    this.getChartData()
  }
}
</script>
