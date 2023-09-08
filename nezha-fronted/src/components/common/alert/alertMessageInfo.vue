<template>
  <!-- chart外层箱子 -->
  <div :class="{'panel-chart--fullscreen': isFullscreen}" class="panel-chart" :id="isFullscreen ? ('chart-screen-' + chartInfo.id ) : ('chart-local-' + chartInfo.id)">
    <!--    全屏的header-->
    <chart-screen-header
      v-if="isFullscreen"
      :is-group="isGroup(chartInfo.type)"
      :isError="isError && chartInfo.alertRule.type !== 3"
      :from="from"
      :chartData="chartData"
      :chart-info="chartInfo"
      :showAllData.sync="showAllData"
      :allDataLength="allDataLength"
      @loadMore="loadMore"
      @refresh="refresh"
      @dateChange="dateChange"
      @close="showFullscreen"
      class="alert-message-info-header"
    >
      <span slot="title-icon" v-if="infoData['state']" style="margin-left: 5px" class="alert-message-state" :class="{'gray-bg': infoData['state'] == 3, 'red-bg': infoData['state'] == 1,'yellow-bg': infoData['state'] == 2}">{{$t(stateOptions.find(state=>state.value == infoData['state']).label)}}</span>
    </chart-screen-header>
    <!-- chart -->
    <!-- 数据查询后传入chart组件，chart组件内不查询，只根据接传递的数据来渲染 -->
    <div class="alert-message-info-box">
      <div class="info-box-left">
        <div class="info-box-left-top">
          <chart
            ref="chart"
            :globalVariables="globalVariables"
            v-if="chartInfo.alertRule && chartInfo.alertRule.type !== 3"
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
          ></chart>
        </div>
        <alertMessageInfoTab
          class="alert-message-info-tab"
          :time="time"
          :noData="tabNoData"
          :infoData="infoData" />
      </div>
      <div class="info-box-right">
        <alertMessageInfoTimeLine :info-data="chartInfo" :time="time"/>
      </div>
    </div>
  </div>
</template>

<script>
import ChartScreenHeader from '@/components/chart/ChartScreenHeader'
import chart from '@/components/chart/chart'
import { isTimeSeries, getGroupHeight, isGroup } from '@/components/chart/chart/tools'
import { alertMessage as alertMessageConstant, chartType, fromRoute } from '@/components/common/js/constants'
import bus from '@/libs/bus'
import axios from 'axios'
import chartTempData from '@/components/chart/chartTempData'
import logsData from '@/components/chart/logsData'
import lodash from 'lodash'
import alertMessageInfoTab from '@/components/common/alert/alertMessageInfoTab'
import alertMessageInfoTimeLine from '@/components/common/alert/alertMessageInfoTimeLine'
import globalVariablesMixin from '@/components/common/mixin/globalVariables'
import { lineChartMove } from '@/components/common/js/common'
export default {
  name: 'alertMessageInfo',
  mixins: [globalVariablesMixin],
  components: {
    alertMessageInfoTab,
    chart,
    ChartScreenHeader,
    alertMessageInfoTimeLine
  },
  props: {
    chartInfo: Object, // 其中的param json串已转化为对象
    timeRange: Array, // 时间范围
    isFullscreen: Boolean,
    panelLock: Boolean,
    chartDetailInfo: Object,
    from: String,
    filter: {},
    currentMsg: Object,
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
      allDataLength: 0,
      severityData: this.$store.getters.severityData,
      severityDataWeight: this.$store.getters.severityDataWeight,
      infoData: {},
      timeLineData: [],
      tabNoData: false,
      timeLineNoData: false,
      time: [],
      stateOptions: alertMessageConstant.states
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
      this.setGlobalVariablesValue([filter.start_time, filter.end_time])
      const elements = this.chartInfo.elements || []
      if (multipleTime.length) {
        const minusTime = (new Date(bus.formateTimeToTime(filter.start_time)).getTime() - new Date(bus.formateTimeToTime(multipleTime[0])).getTime())
        this.minusTime = minusTime
        this.multipleTime = true
      } else {
        this.minusTime = ''
        this.multipleTime = false
      }
      this.time = [startTime, endTime]
      this.chartInfo.loaded && this.chartInfo.alertRule && this.chartInfo.alertRule.type !== 3 && this.query(elements, startTime, endTime, step)
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
      this.time = [startTime, endTime]
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
        }
      } catch (e) {
        this.loading = false
      }
    },
    resize () {
      this.$refs.chart.resize()
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
    showFullscreen (show) {
      this.$emit('showFullscreen', show, this.chartInfo)
    },
    getAlertMessageInfo () {
      this.tabNoData = false
      this.$get('/alert/message/' + this.chartInfo.id).then(res => {
        if (res.code === 200) {
          this.infoData = res.data
          this.infoData.alertRule = this.currentMsg.alertRule
          this.tabNoData = false
        } else {
          this.tabNoData = true
        }
      })
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
        // console.log(n)
      }
    }
  },
  mounted () {
    this.chartInfo.loaded && this.getChartData()
    this.showAllData = !this.showMultiple(this.chartInfo.type)
    this.getAlertMessageInfo()
    window.addEventListener('resize', this.resize)
    if (!document.onmousemove) { // 添加鼠标移动事件监听
      document.onmousemove = lineChartMove
    }
  },
  destroyed () {
    window.removeEventListener('resize', this.resize)
    document.onmousemove = null
  }
}
</script>
