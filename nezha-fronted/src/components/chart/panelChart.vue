<template>
  <!-- chart外层箱子 -->
  <div :class="{'panel-chart--fullscreen': isFullscreen}" class="panel-chart" :id="isFullscreen ? ('chart-screen-' + chartInfo.id ) : ('chart-local-' + chartInfo.id)"  v-loading="loading">
    <!-- title和工具栏，支持浮动 -->
    <chart-header
      v-if="!isFullscreen&&showHeader"
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
      @sync="chartSync"
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
      @refreshLogs="refreshLogs"
      :show-header="showHeader"
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
import chartTempData from '@/components/chart/chartTempData'
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
    filter: {},
    showHeader: {
      type: Boolean,
      default: true
    }
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
      let startTime = bus.formateTimeToTime(filter.start_time)
      let endTime = bus.formateTimeToTime(filter.end_time)
      const step = bus.getStep(startTime, endTime)
      startTime = this.$stringTimeParseToUnix(startTime)
      endTime = this.$stringTimeParseToUnix(endTime)
      const elements = this.chartInfo.elements || []
      if (multipleTime.length) {
        const minusTime = (new Date(bus.formateTimeToTime(filter.start_time)).getTime() - new Date(bus.formateTimeToTime(multipleTime[0])).getTime())
        this.minusTime = minusTime
        this.multipleTime = true
      } else {
        this.minusTime = ''
        this.multipleTime = false
      }
      this.chartInfo.loaded && this.query(elements, startTime, endTime, step)
    },
    // 参数 isRefresh 标识是否是刷新操作
    getChartData (isRefresh, params) {
      this.loading = true
      // TODO assetInfo、endpointInfo、echarts等进行不同的处理
      let startTime = ''
      let endTime = ''
      if (isRefresh) { // 刷新则视情况更新时间范围
        const now = new Date(bus.computeTimezone(new Date().getTime()))
        const origin = new Date(this.timeRange[1])
        const numInterval = now.getTime() - origin.getTime()
        if (numInterval >= 60000) { // 大于1分钟，则start、end均往后移numInterval，否则时间不变
          startTime = bus.getNewTime(bus.formateTimeToTime(this.timeRange[0]), numInterval)
          endTime = bus.timeFormate(now, 'YYYY-MM-DD HH:mm:ss')
        } else {
          startTime = bus.formateTimeToTime(this.timeRange[0])
          endTime = bus.formateTimeToTime(this.timeRange[1])
        }
      } else {
        startTime = bus.formateTimeToTime(this.timeRange[0])
        endTime = bus.formateTimeToTime(this.timeRange[1])
      }
      const step = bus.getStep(startTime, endTime)
      startTime = this.$stringTimeParseToUnix(startTime)
      endTime = this.$stringTimeParseToUnix(endTime)
      const elements = this.chartInfo.elements || []
      this.chartInfo.loaded && this.query(elements, startTime, endTime, step, params)
    },
    query (elements, startTime, endTime, step, params) {
      this.isError = false
      this.allDataLength = 0
      try {
        switch (this.chartInfo.datasource) {
          case 'metrics':
          case 'logs': {
            if (this.from === fromRoute.chartTemp) {
              setTimeout(() => {
                this.chartData = [chartTempData.data.result]
                this.chartData.forEach(item => {
                  item.forEach(children => {
                    children.elements = elements[0]
                  })
                })
                this.loading = false
              }, 100)
              return
            }
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
              if (this.chartInfo.datasource === 'logs') {
                query += '&format=1'
                if (!params || params.descending) {
                  this.chartInfo.descending = true
                  query += '&direction=backward'
                } else {
                  this.chartInfo.descending = false
                  query += '&direction=forward'
                }
              }
              // if (isChartPie(this.chartInfo.type)) {
              //   query += `&statistics=${this.chartInfo.param.statistics || 'last'}`
              // }
              query += `&query=${encodeURIComponent(element.expression)}`
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
                if (this.chartInfo.datasource === 'logs') {
                  query += '&format=1'
                }
                // if (isChartPie(this.chartInfo.type)) {
                //   query += `&statistics=${this.chartInfo.param.statistics || 'last'}`
                // }
                query += `&query=${encodeURIComponent(element.expression)}`
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
                      item.elements = elements[rIndex]
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
              console.info(res)
            }).finally(() => {
              this.loading = false
            })
            break
          }
          case 'system': {
            this.chartInfo.elements = this.chartInfo.param.datasource
            if (this.from === fromRoute.chartTemp) {
              setTimeout(() => {
                this.chartData = [chartTempData.data.result]
                this.loading = false
              }, 100)
              return
            }
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
              sort: this.chartInfo.param.datasource[0].sort,
              filter: this.chartInfo.param.datasource[0].filter ? this.chartInfo.param.datasource[0].filter.filter(item => item.value) : []
            }
            const chartData = []
            const params = {
              t: this.chartInfo.id,
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
                this.isError = true
              }
              this.chartData = chartData
              this.loading = false
            })
            // this.sendAjax('/stat', params).then(res => {
            //   if (res.code === 200) {
            //     chartData.push(res.data.result)
            //   } else {
            //     chartData.push({ error: res.msg || res.error || res })
            //     this.isError = true
            //   }
            //   this.chartData = chartData
            //   this.loading = false
            // })
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
              this.loading = false
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
      this.$refs.chart && this.$refs.chart.resize()
    },
    refresh () {
      this.getChartData(true)
    },
    refreshLogs (params) {
      this.getChartData(true, params)
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
        this.chartInfo.height = height
        this.chartInfo.h = height
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
    },
    chartSync () {
      this.loading = true
      this.$post('visual/panel/chart/syncTmpl', { ids: [this.chartInfo.id] }).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('tip.syncSuccess'))
          this.$emit('refreshPanel')
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    sendAjax (url, params) {
      // 构造表单数据
      return new Promise(resolve => {
        let nowUrl = url
        Object.keys(params).forEach((key, index) => {
          if (index == 0) {
            nowUrl += '?' + key + '=' + params[key]
          } else {
            nowUrl += '&' + key + '=' + params[key]
          }
        })
        const formData = new FormData()
        formData.append('username', 'johndoe')
        formData.append('id', 123456)
        // 创建xhr对象
        const xhr = new XMLHttpRequest()
        // 设置xhr请求的超时时间
        xhr.timeout = 3000
        // 设置响应返回的数据格式
        xhr.responseType = ''
        // 创建一个 post 请求，采用异步
        xhr.open('get', 'http://192.168.44.100/' + nowUrl, true)
        xhr.setRequestHeader('Authorization', localStorage.getItem('nz-token'))
        // 注册相关事件回调处理函数
        xhr.onload = function (e) {
          if (this.status == 200 || this.status == 304) {
            // alert(this.responseText)
            resolve(JSON.parse(this.responseText))
          }
        }
        xhr.onerror = function (e) { console.log(e) }
        // 发送数据
        xhr.send()
      })
    }
  },
  watch: {
    timeRange: {
      deep: true,
      handler (n) {
        // this.refresh()
      }
    },
    loading: {
      immediate: true,
      deep: true,
      handler (n) {
        // console.log(n)
      }
    }
  },
  mounted () {
    this.chartInfo.loaded && this.getChartData()
    this.showAllData = !this.showMultiple(this.chartInfo.type)
  }
}
</script>
