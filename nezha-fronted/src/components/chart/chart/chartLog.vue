<template>
  <div class="log-detail chart-log" style="flex-direction: column;display: flex">
    <div class="log-operations">
      <div class="log-operation">
        <span class="operation-label">{{$t('overall.time')}}</span>
        <el-switch
          v-model="time"
        >
        </el-switch>
      </div>
      <div class="log-operation">
        <span class="operation-label">{{$t('dashboard.explore.descending')}}</span>
        <el-switch
          v-model="operations.descending"
        >
        </el-switch>
      </div>
      <div class="log-operation">
        <span class="operation-label">{{$t('dashboard.explore.wrapLines')}}</span>
        <el-switch
          v-model="wrapLines"
        >
        </el-switch>
      </div>
      <div class="log-operation">
        <span class="operation-label">Result:</span>
        <span class="operation-length">{{tableData.length}}</span>
      </div>
      <div class="log-operation log-operation--right">
        <button class="top-tool-btn" style="cursor: pointer" type="button" @click="exportLog" :title="$t('overall.download')"><i class="nz-icon nz-icon-download"></i></button>
      </div>
    </div>
    <div class="log-table" style="flex: 1">
      <el-table
        :cell-class-name="cellClassName"
        :data="tableData"
        style="height: 100%"
        :show-header="false"
        ref="logTable"
        class="nz-table-list"
        size="mini"
        v-if="tableData.length"
      >
        <el-table-column
          type="expand"
        >
          <template slot-scope="{ row }">
            <pre>{{row.labels}}</pre>
          </template>
        </el-table-column>
        <el-table-column
          v-if="time"
          prop="date"
          width="140"
        >
          <template slot-scope="{ row }">{{utcTimeToTimezoneStr(row.date)}}</template>
        </el-table-column>
        <el-table-column
          prop="legend"
          width="140"
        >
          <template slot-scope="{ row }">
            <div style="width: 100%; overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="aliasLegend(row)">{{aliasLegend(row)}}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="message"
          width="auto"
        >
          <template slot-scope="{ row }">
            <div style="width: 100%;" class="text-ellipsis" :title="row.message">{{row.message}}</div>
          </template>
        </el-table-column>
      </el-table>
      <template>
        <div v-if="!tableData.length" class="table-no-data">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#nz-icon-no-data-list"></use>
          </svg>
          <div class="table-no-data__title">No results found</div>
        </div>
        <div v-else style="border: none">&nbsp;</div>
      </template>
    </div>
  </div>
</template>

<script>
import legend from '@/components/chart/chart/legend'
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import { chartLegendPlacement } from '@/components/common/js/constants'
import * as echarts from 'echarts'
import { getChart, setChart } from '@/components/common/js/common'
import { dealLegendAlias, formatScientificNotation, getMetricTypeValue } from '@/components/common/js/tools'
import chartDataFormat from '@/components/chart/chartDataFormat'
import { initColor } from '@/components/chart/chart/tools'
import lodash from 'lodash'
import axios from 'axios'
export default {
  name: 'chart-log', // 日志列表，纯日志，不再包含图形
  mixins: [chartMixin, chartFormat],
  props: {
    chartInfo: Object,
    chartData: Array,
    chartOption: Object,
    isFullscreen: Boolean
  },
  data () {
    return {
      operations: {
        levels: [0, 1, 2, 3, 4, 5, 6],
        descending: true
      },
      time: true, // 换行和时间不需要处理数据
      wrapLines: true,
      limit: 100, // limit改动需要请求接口1639031085033567500
      limitOptions: [100, 200, 500, 1000, 2000],
      levelOptions: [
        {
          type: 'trace',
          keywords: ['trace'],
          color: '#6ed0e0'
        },
        {
          type: 'debug',
          keywords: ['debug', 'dbug'],
          color: '#1f78c1'
        },
        {
          type: 'info',
          keywords: ['info', 'information', 'informational', 'notice'],
          color: '#7eb26d'
        },
        {
          type: 'warn',
          keywords: ['warn', 'warning'],
          color: '#ff851b'
        },
        {
          type: 'error',
          keywords: ['error', 'err'],
          color: '#e24d42'
        },
        {
          type: 'fatal',
          keywords: ['emerg', 'critical', 'fatal', 'crit'],
          color: '#705da0'
        },
        {
          type: 'unknown',
          keywords: [],
          color: '#B4C7DE'
        }
      ],
      tableData: [],
      timeFormatData: [],
      tableChartData: [],
      myChart: null,
      noData: false
    }
  },
  methods: {
    initChart () {
      this.tableData = []
      this.isInit = false
      this.operations.descending = this.chartInfo.descending
      this.chartData.forEach(item => {
        item.forEach(row => {
          this.tableData.push({
            ...row,
            date: this.timeFormat(row.timestamp),
            secondTime: Math.floor(this.toMillisecondTime(row.timestamp) / 1000)
          })
        })
      })
    },
    cellClassName ({ row, column, rowIndex, columnIndex }) {
      const className = []
      !this.wrapLines && className.push('log-row-wrap--no-wrap')
      if (columnIndex === 0) {
        className.push(`log-border--${row.level}`)
      }
      return className.join(' ')
    },
    aliasLegend (row) {
      let host = ''// up,
      let alias = ''
      row.elements.legend = this.globalVariablesReplace(row.elements.legend)
      if (row.labels && Object.keys(row.labels).length > 0) {
        const metric = Object.keys(row.labels)
        if (metric.__name__) {
          host = `${metric.__name__}{`// up,
        }
        metric.forEach((tag, i) => {
          if (tag !== '__name__') {
            host += `${tag}="${row.labels[tag]}",`
          }
        })
        if (host.endsWith(',')) {
          host = host.substr(0, host.length - 1)
        }
        if (metric.__name__) {
          host += '}'
        }
        // 处理legend别名
        alias = dealLegendAlias(host, row.elements.legend)
        if (!alias || alias === '') {
          alias = host
        }
      } else {
        alias = row.elements.legend
      }
      return alias
    },
    exportLog () {
      const limit = this.operations.limit
      const descending = this.operations.descending
      const params = {
        logql: this.chartInfo.elements.map(item => item.expression),
        start: this.$stringTimeParseToUnix(this.filterTime[0]),
        end: this.$stringTimeParseToUnix(this.filterTime[1]),
        direction: descending ? 'backward' : 'forward',
        limit
      }
      axios.get('/logs/loki/export', { responseType: 'blob', params: params }).then(res => {
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject, 'log')
        } else {
          const url = URL.createObjectURL(new Blob([res.data]))
          const a = document.createElement('a')
          document.body.appendChild(a) // 此处增加了将创建的添加到body当中
          a.href = url
          a.download = 'log'
          a.target = '_blank'
          a.click()
          a.remove() // 将a标签移除
        }
      }, error => {
        const $self = this
        const reader = new FileReader()
        reader.onload = function (event) {
          const responseText = reader.result
          const exception = JSON.parse(responseText)
          if (exception.message) {
            $self.$message.error(exception.message)
          } else {
            console.error(error)
          }
        }
        reader.readAsText(error.response.data)
      })
    },
    toMillisecondTime (timestamp) {
      const timeLength = `${timestamp}`.length
      // 判断时间是秒/毫秒/微秒/纳秒
      let step = null
      switch (timeLength) {
        case 10:
          step = 1000
          break
        case 13:
          step = 1
          break
        case 16:
          step = 0.001
          break
        case 19:
          step = 0.000001
          break
        default: break
      }
      return Math.floor(timestamp * step)
    },
    timeFormat (timestamp) {
      return this.timezoneToUtcTimeStr(this.toMillisecondTime(timestamp))
    }
  },
  mounted () {
    this.chartInfo.loaded && this.initChart()
  },
  watch: {
    chartData: {
      immediate: true,
      deep: true,
      handler (n) {
        this.initChart(this.chartOption)
      }
    },
    operations: {
      deep: true,
      handler (n) {
        // this.tableData = this.tableData.reverse()
        this.$nextTick(() => {
          this.$emit('refreshLogs', this.operations)
        })
      }
    }
  }
}
</script>
