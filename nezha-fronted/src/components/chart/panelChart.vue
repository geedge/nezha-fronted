<template>
  <!-- chart外层箱子 -->
  <div :class="{'panel-chart--fullscreen': isFullscreen}" class="panel-chart" :id="isFullscreen ? ('chart-screen-' + chartInfo.id ) : ('chart-local-' + chartInfo.id)"  v-loading="loading">
    <!-- title和工具栏，支持浮动 -->
    <chart-header
      v-if="!isFullscreen"
      :is-group="isGroup(chartInfo.type)"
      :isError="isError"
      :chartData="chartData"
      :chart-info="chartInfo"
      :showAllData.sync="showAllData"
      :allDataLength="allDataLength"
      @unitChange="unitChange"
      @loadMore="loadMore"
      @edit-chart="$emit('edit-chart', chartInfo)"
      @refresh="refresh"
      @groupShow="groupShow"
      @showFullscreen="showFullscreen"
    ></chart-header>
<!--    全屏的header-->
    <chart-screen-header
      v-if="isFullscreen"
      :is-group="isGroup(chartInfo.type)"
      :isError="isError"
      :from="from"
      :chartData="chartData"
      :chart-info="chartInfo"
      :showAllData.sync="showAllData"
      :allDataLength="allDataLength"
      @unitChange="unitChange"
      @saveChart="saveChart"
      @loadMore="loadMore"
      @refresh="refresh"
      @dateChange="dateChange"
      @close="showFullscreen"
    ></chart-screen-header>
    <!-- chart -->
    <!-- 数据查询后传入chart组件，chart组件内不查询，只根据接传递的数据来渲染 -->
    <chart
      ref="chart"
      :chart-data="chartData"
      :chart-info="chartInfo"
      :panelLock="panelLock"
      :filter="filter"
      :from="from"
      :isError="isError"
      :loading="loading"
      :minusTime="minusTime"
      :multipleTime="multipleTime"
      :isFullscreen="isFullscreen"
      :showAllData="showAllData"
      v-if="!isGroup(chartInfo.type) || !chartInfo.param.collapse"
    ></chart>
  </div>
</template>

<script>
import chartHeader from '@/components/chart/chartHeader'
import ChartScreenHeader from '@/components/chart/ChartScreenHeader'
import chart from '@/components/chart/chart'
import { isChartPie, isTimeSeries, getGroupHeight, isGroup } from './chart/tools'
import { chartType, fromRoute } from '@/components/common/js/constants'
import bus from '@/libs/bus'
import axios from 'axios'
import chartTempData from '@/components/charts/chartTempData'
import logsData from '@/components/chart/logsData'
import lodash from 'lodash'

export default {
  name: 'panelChart',
  components: {
    chartHeader,
    chart,
    ChartScreenHeader
  },
  props: {
    chartInfo: Object, // 其中的param json串已转化为对象
    timeRange: Array, // 时间范围
    isFullscreen: Boolean,
    panelLock: Boolean,
    chartDetailInfo: Object,
    from: String,
    filter: {}
  },
  data () {
    return {
      chartData: [],
      loading: true,
      isError: false,
      multipleTime: false,
      minusTime: '',
      showAllData: false,
      allDataLength: 0
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
    dateChange (filter, multipleTime) {
      this.loading = true
      // TODO assetInfo、endpointInfo、echarts等进行不同的处理
      let startTime = filter.start_time
      let endTime = filter.end_time
      const step = bus.getStep(startTime, endTime)
      startTime = this.$stringTimeParseToUnix(startTime)
      endTime = this.$stringTimeParseToUnix(endTime)
      const elements = this.chartInfo.elements || []
      if (multipleTime.length) {
        const minusTime = (new Date(filter.start_time).getTime() - new Date(multipleTime[0]).getTime())
        this.minusTime = minusTime
        this.multipleTime = true
      } else {
        this.minusTime = ''
        this.multipleTime = false
      }
      this.chartInfo.loaded && this.query(elements, startTime, endTime, step)
    },
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
      this.chartInfo.loaded && this.query(elements, startTime, endTime, step)
    },
    query (elements, startTime, endTime, step) {
      this.isError = false
      this.allDataLength = 0
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
            let requests = elements.map((element) => {
              if (this.from === fromRoute.chartTemp) {
                return chartTempData
              }
              let query = `${urlPre}/api/v1/query_range?start=${startTime}&end=${endTime}&step=${step}`
              if (isTimeSeries(this.chartInfo.type)) {
                query += `&nullType=${this.chartInfo.param.nullType || 'null'}`
              }
              if (element.filter) {
                query += `&filter=${element.filter}`
              }
              // if (isChartPie(this.chartInfo.type)) {
              //   query += `&statistics=${this.chartInfo.param.statistics || 'last'}`
              // }
              query += `&query=${element.expression}`
              return this.$get(query)
            })
            if (this.multipleTime) {
              const multipleRequests = elements.map((element) => {
                if (this.from === fromRoute.chartTemp) {
                  return chartTempData
                }
                let query = `${urlPre}/api/v1/query_range?start=${startTime - this.minusTime / 1000}&end=${endTime - this.minusTime / 1000}&step=${step}`
                if (isTimeSeries(this.chartInfo.type)) {
                  query += `&nullType=${this.chartInfo.param.nullType || 'null'}`
                }
                if (element.filter) {
                  query += `&filter=${element.filter}`
                }
                // if (isChartPie(this.chartInfo.type)) {
                //   query += `&statistics=${this.chartInfo.param.statistics || 'last'}`
                // }
                query += `&query=${element.expression}`
                return this.$get(query)
              })
              requests = requests.concat(multipleRequests)
            }
            const chartData = []
            axios.all(requests).then((res) => {
              res.forEach((r, rIndex) => {
                if (rIndex < elements.length) {
                  if (r.status === 'success') {
                    r.data.result.forEach(item => {
                      this.allDataLength++
                    })
                    chartData.push(r.data.result)
                  } else {
                    chartData.push({ error: r.msg || r.error || r })
                    this.isError = true
                  }
                } else {
                  if (r.status === 'success') {
                    r.data.result.forEach(item => {
                      this.allDataLength++
                      item.values.forEach(values => {
                        values[0] = values[0] + this.minusTime / 1000
                      })
                    })
                    chartData.push(r.data.result)
                  } else {
                    chartData.push({ error: r.msg || r.error || r })
                    this.isError = true
                  }
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
                this.loading = false
              })
              break
            }
            if (this.chartInfo.type === 'endpointInfo') {
              this.$get('monitor/endpoint/' + this.chartDetailInfo.id).then(res => {
                this.chartData = res.data
                this.loading = false
              })
              break
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
            this.loading = false
            setTimeout(() => {
              this.loading = false
            })
            if (this.chartInfo.type === 'hexagon') {
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
              this.chartData = lodash.get(this, 'chartInfo.children', [])
              this.groupInit()
            }
            if (this.chartInfo.type === 'topology') {
              this.chartData = ['topology']
            }
            if (this.chartInfo.type === 'map') {
              this.chartData = ['map']
            }
            break
          }
        }
      } catch (e) {
        console.info(e)
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
    },
    showMultiple (type) {
      switch (type) {
        case 'line' :
        case 'area' :
        case 'point' :
          return true
        default: return false
      }
    },
    loadMore () {
      this.showAllData = true
      this.$nextTick(() => {
        this.$refs.chart && this.$refs.chart.$refs['chart' + this.chartInfo.id].initChart()
      })
    },
    unitChange (val) {
      this.$emit('update:chartInfo', 'unit', val)
      this.chartInfo.unit = val
      this.$nextTick(() => {
        this.$refs.chart && this.$refs.chart.$refs['chart' + this.chartInfo.id].initChart()
      })
    },
    saveChart () {
      this.$emit('saveChart', this.chartInfo)
    }
  },
  watch: {
    timeRange: {
      deep: true,
      handler (n) {
        this.refresh()
      }
    },
    loading: {
      immediate: true,
      deep: true,
      handler (n) {
      }
    }
  },
  mounted () {
    this.chartInfo.loaded && this.getChartData()
    this.showAllData = !this.showMultiple(this.chartInfo.type)
  }
}
</script>
