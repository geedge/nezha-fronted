<template>
  <div class="log-detail">
    <div :id="`logChart${tabIndex}`" class="log-chart" v-if="showSwitch"></div>
    <div class="log-chart chart-no-data" v-if="showSwitch&&noData" style="top: 150px">No data</div>
    <div class="log-operations" v-if="showSwitch">
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
          :disabled="Boolean(dataJson)"
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
        <span class="operation-label">{{$t('overall.limit')}}:</span>
        <el-select v-model="limit" :disabled="Boolean(dataJson)" size="small" style="width: 100px;" popper-class="right-box-select-top right-public-box-dropdown-top">
          <el-option v-for="option in limitOptions" :key="option" :value="option"></el-option>
        </el-select>
      </div>
      <div class="log-operation">
        <span class="operation-label">Result:</span>
        <span class="operation-length">{{tableData.length}}</span>
      </div>
      <div class="log-operation log-operation--right" v-if="!dataJson">
        <button class="top-tool-btn" style="cursor: pointer;z-index: 2;" type="button" @click="exportLog" :title="$t('overall.download')"><i class="nz-icon nz-icon-download"></i></button>
      </div>
    </div>
    <div class="log-table">
      <el-table
        :cell-class-name="cellClassName"
        :data="tableData"
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
            <div class="log-pre-wrap" :class="'log-border--'+row.level">
              <pre>{{row.labels}}</pre>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="time"
          prop="date"
          width="160"
          class-name="log-date"
        >
          <!-- <template slot-scope="{ row }">{{utcTimeToTimezoneStr(row.date)}}</template> -->
          <template slot-scope="{ row }">{{momentTz(row.secondTime * 1000)}}</template>
        </el-table-column>
        <el-table-column
          v-if="!showSwitch"
          prop="legend"
        >
          <template slot-scope="{ row }">
            <div :title="aliasLegend(row)">{{aliasLegend(row)}}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="message"
        >
          <template slot-scope="{ row }">
            <div style="width: 100%;" class="text-ellipsis" :title="row.message">{{row.message}}</div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!dataJson"
          class-name="context-cell"
          width="24"
        >
          <template slot-scope="{ row }">
            <i class="nz-icon nz-icon-zhankai" :title="$t('explore.showContext')" @click="rowClick(row)"></i>
          </template>
        </el-table-column>
      </el-table>
      <template v-if="exploreItem">
        <div v-if="exploreLogTable && !tableData.length" class="table-no-data">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#nz-icon-no-data-list"></use>
          </svg>
          <div class="table-no-data__title">No results found</div>
        </div>
        <div v-else>&nbsp;</div>
      </template>
      <template v-else>
        <div v-if="loadingBottom && !tableData.length" class="table-no-data">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#nz-icon-no-data-list"></use>
          </svg>
          <div class="table-no-data__title">No results found</div>
        </div>
        <div v-else>&nbsp;</div>
      </template>
    </div>
    <!-- 查看上下文 -->
    <logContext  v-if="contextVisible" :contextVisible.sync="contextVisible" :rowData="currentRow"></logContext>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import chartConfig from '@/components/page/dashboard/overview/chartConfig'
import { dealLegendAlias } from '@/components/common/js/tools'
import bus from '@/libs/bus'
import logContext from '@/components/chart/logContext'
export default {
  name: 'logTab',
  components: {
    logContext
  },
  props: {
    logData: Array,
    tabIndex: Number,
    showSwitch: {
      type: Boolean,
      default: true
    },
    loadingBottom: Boolean,
    exploreLogTable: Boolean,
    exploreItem: Boolean,
    timeRange: {}
  },
  computed: {
    tableTimeFormat () {
      return this.timeFormat
    }
  },
  data () {
    const theme = localStorage.getItem(`nz-user-${localStorage.getItem('nz-user-id')}-theme`) || 'light'
    return {
      theme,
      dataJson: window.dataJson,
      operations: {
        levels: [0, 1, 2, 3, 4, 5, 6],
        descending: true
      },
      time: true, // 换行和时间不需要处理数据
      wrapLines: true,

      limit: 100, // limit改动需要请求接口
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
      noData: false,
      filterData: [],
      contextVisible: false,
      currentRow: {}
    }
  },
  created () {
    if (this.dataJson) {
      this.limit = this.dataJson.limit || 100
      this.operations.descending = this.dataJson.direction === 'backward'
    }
  },
  methods: {
    rowClick (row) {
      this.currentRow = this.$lodash.cloneDeep(row)
      this.currentRow.current = true
      this.contextVisible = true
    },
    resetOperation () {
      this.operations = {
        levels: [0, 1, 2, 3, 4, 5, 6],
        descending: true
      }
      if (this.dataJson) {
        this.operations.descending = this.dataJson.direction === 'backward'
      }
    },
    exportLog () {
      this.$emit('exportLog', { limit: this.limit, ...this.operations })
    },
    cellClassName ({ row, column, rowIndex, columnIndex }) {
      const className = []
      !this.wrapLines && className.push('log-row-wrap--no-wrap')
      if (columnIndex === 0) {
        className.push(`log-border--${row.level}`)
      }
      return className.join(' ')
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
    },
    loadChart () {
      const vm = this
      const selectObj = {}
      const sele = []
      this.filterData.forEach(item => {
        if (sele.indexOf(item.level) == -1) {
          sele.push(item.level)
        }
      })
      this.tableChartData.forEach(item => {
        if (sele.indexOf(item.name) !== -1) {
          selectObj[item.name] = true
        } else {
          selectObj[item.name] = false
        }
      })
      const dom = document.getElementById(`logChart${this.tabIndex}`)
      if (!dom) {
        return
      }
      this.myChart = echarts.init(dom)
      window.addEventListener('resize', this.resizeChart)
      if (this.tableChartData.length > 0) {
        this.noData = false
        let series = this.tableChartData.map(d => ({
          type: 'bar',
          name: d.name,
          stack: 'total',
          barWidth: 6,
          clip: false,
          barMinHeight: 1,
          data: d.data.map(item => [new Date(bus.formateTimeToTime(item[0])).getTime(), item[1]]),
          itemStyle: { color: this.levelOptions.find(l => l.type === d.name) ? this.levelOptions.find(l => l.type === d.name).color : '#dde4ed' }
        }))
        series = series.sort((a, b) => {
          return this.levelOptions.findIndex(l => a.name === l.type) - this.levelOptions.findIndex(l => b.name === l.type)
        })
        const option = {
          title: {
            show: false
          },
          grid: {
            top: 20,
            left: 20,
            right: 10,
            bottom: 80,
            containLabel: true
          },
          legend: {
            bottom: 20,
            left: 10,
            itemGap: 20,
            itemWidth: 16,
            itemHeight: 4,
            borderRadius: 3,
            textStyle: {
              padding: [0, 0, 0, 6],
              color: this.theme == 'light' ? '#666666' : '#BEBEBE'
            },
            selected: selectObj,
            inactiveColor: this.theme == 'light' ? '#BEBEBE' : '#666666' // 字体颜色
          },
          series,
          xAxis: {
            type: 'time',
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
              rotate: 0,
              fontSize: 13 * window.devicePixelRatio,
              formatter (value) {
                return vm.defaultXAxisFormatter(vm.toMillisecondTime(parseInt(value)))
              }
            },
            boundaryGap: [0, '1%']
          },
          tooltip: {
            trigger: 'axis',
            formatter: vm.tooltipFormatter
          },
          yAxis: {
            type: 'value',
            splitLine: {
              show: true
            },
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              fontSize: 13 * window.devicePixelRatio,
              formatter (value, i) {
                let y
                if (value < 1000) {
                  y = value
                } else if (value < 1000000) {
                  y = value / 1000 + ' K'
                } else if (value >= 1000000) {
                  y = value / 1000000 + ' M'
                } else {
                  y = value / 1000000000 + ' G'
                }
                return y
              }
            }
          },
          useUTC: false // 使用本地时间
        }
        this.myChart.clear()
        this.myChart.setOption(option)
        this.$nextTick(() => {
          this.myChart.resize()
        })
        /* 点击legend
          * 1.当前如果是全高亮状态，则全部置灰，只留被点击的legend高亮
          * 2.如果点击的是唯一高亮的legend，则变为全高亮状态
          * 3.否则只改变被点击的legend状态
          * */
        this.myChart.on('legendselectchanged', ({ name, selected }) => {
          if (!this.prevent_opt.refresh) {
            this.prevent_opt.refresh = true
            const selectedLevel = []
            const unselectedLevel = []
            for (const n in selected) {
              selected[n] ? selectedLevel.push(n) : unselectedLevel.push(n)
            }
            try {
              if (selectedLevel.length + unselectedLevel.length > 1) {
                if (unselectedLevel.length === 1 && unselectedLevel[0] === name) { // 1.
                  this.myChart.dispatchAction({
                    type: 'legendInverseSelect'
                  })
                  this.operations.levels = [this.levelOptions.findIndex(l => l.type === unselectedLevel[0])]
                } else if (selectedLevel.length === 0) { // 2.
                  this.myChart.dispatchAction({
                    type: 'legendAllSelect'
                  })
                  this.operations.levels = [0, 1, 2, 3, 4, 5, 6]
                } else { // 3.
                  this.operations.levels = selectedLevel.map(s => this.levelOptions.findIndex(l => l.type === s))
                }
              }
            } finally {
              this.$nextTick(() => {
                this.prevent_opt.refresh = false
              })
            }
          }
        })
      } else {
        this.noData = true
        const option = chartConfig.getOption('noData')
        this.myChart.clear()
        this.myChart.setOption(option)
        this.$nextTick(() => {
          this.myChart.resize()
        })
      }
    },
    getCurrentStepTime (currentTime, currentStepTime, step) {
      currentStepTime -= step
      if (currentTime < currentStepTime - step) {
        return this.getCurrentStepTime(currentTime, currentStepTime, step)
      } else {
        return currentStepTime
      }
    },
    applyFilter (allTableData, filter) {
      if (!allTableData || allTableData.length === 0) {
        return { tableData: [], tableChartData: [] }
      }
      const data = [...allTableData]
      // 过滤level
      let filterLevelData = data.filter(d => {
        const hit = filter.levels.some(l => {
          if (this.levelOptions[l]) {
            return this.levelOptions[l].type === d.level.toLowerCase()
          } else {
            return false
          }
        })
        return hit
      })
      this.filterData = filterLevelData
      // 复制一份升序的数据用于后面处理
      const copyData = [...data]
      // 升降序
      filterLevelData = filterLevelData.sort((a, b) => {
        return filter.descending ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
      })
      // logs内部上方的图表数据。需要整理成时间点[{date: xxx, value: {debug: 1, error: 3}}]，时间点数量控制为100个
      // 然后再将数据转为图表需要的格式
      // 1.计算出step(单位s)
      let step = (copyData[0].secondTime - copyData[copyData.length - 1].secondTime) / 100
      step = step < 1 ? 1 : Math.floor(step) // 最小step为1s
      // 2.组织数据为[{date: xxx, value: {debug: x, error: x}}]
      const points = []
      let currentStepTime = copyData[0].secondTime
      copyData.forEach(d => {
        if (d.secondTime <= currentStepTime - step) {
          currentStepTime = this.getCurrentStepTime(d.secondTime, currentStepTime, step)
        }
        const date = this.timeFormat(currentStepTime)
        let point = points.find(p => date === p.date)
        if (!point) {
          point = { date: date, value: {} }
          point.value[d.level] = 1
          points.push(point)
        } else {
          point.value[d.level] ? point.value[d.level]++ : (point.value[d.level] = 1)
        }
      })
      // 3.组织数据为echarts格式
      const tableChartData = {}
      points.forEach(p => {
        for (const type in p.value) {
          tableChartData[type] || (tableChartData[type] = {})
          tableChartData[type][p.date] ? tableChartData[type][p.date] += p.value[type] : tableChartData[type][p.date] = p.value[type]
        }
      })
      const temp = []
      for (const d in tableChartData) {
        const level = { name: d, data: [] }
        for (const time in tableChartData[d]) {
          level.data.push([time, tableChartData[d][time]])
        }
        temp.push(level)
      }
      return { tableData: filterLevelData, tableChartData: temp }
    },
    filterLogType (data) {
      const logData = data.filter(l => l && (l.resultType === 'streamsFormat'))
      let allTableData = []
      // 合并
      logData.forEach(d => {
        allTableData = [...allTableData, ...d.result]
      })
      // 去重
      const temp = []
      allTableData = allTableData.reduce((cur, next) => {
        if (temp.indexOf(next.uuid) === -1) {
          temp.push(next.uuid)
          cur.push(next)
        }
        return cur
      }, [])
      // 把时间转为秒和字符串
      allTableData = allTableData.map(d => ({
        ...d,
        date: this.timeFormat(d.timestamp),
        secondTime: Math.floor(this.toMillisecondTime(d.timestamp) / 1000)
      }))
      return { logData: allTableData }
    },
    getLimit () {
      return this.limit
    },
    getDescending () {
      return this.operations.descending ? 'backward' : 'forward'
    },
    resizeChart () {
      setTimeout(() => {
        this.myChart.resize()
      })
    },
    aliasLegend (row) {
      let host = ''// up,
      let alias = ''
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
    defaultXAxisFormatter: function (value) {
      value = bus.UTCTimeToConfigTimezone(value)
      const tData = new Date(value)
      const month = tData.getMonth() + 1 > 9 ? tData.getMonth() + 1 : '0' + (tData.getMonth() + 1)
      const day = tData.getDate() > 9 ? tData.getDate() : '0' + tData.getDate()
      const hour = tData.getHours() > 9 ? tData.getHours() : '0' + tData.getHours()
      const minute = tData.getMinutes() > 9 ? tData.getMinutes() : '0' + tData.getMinutes()
      const dateFormatStr = this.timeFormatMain.split(' ')[0]
      const diffSec = (this.momentStrToTimestamp(this.timeRange[1]) - this.momentStrToTimestamp(this.timeRange[0]))
      const secOneDay = 24 * 60 * 60 * 1000// 1天的毫秒数
      let str = ''
      if (dateFormatStr === 'DD/MM/YYYY') {
        str += [day, month].join('/')
      } else if (dateFormatStr === 'MM/DD/YYYY') {
        str += [month, day].join('/')
      } else {
        str += [month, day].join('-')
      }
      if (diffSec <= secOneDay) { // 同一天
        return [hour, minute].join(':')
      } else { // 大于1天，小于30天
        return str + '\n' + [hour, minute].join(':')
      }
    },
    tooltipFormatter (params, a, b) {
      const vm = this
      let str = `
           <div style="margin: 0px 0 0;line-height:1;">
            <div style="margin: 0px 0 0;line-height:1;">
                <div style="font-size:14px;color:#666;font-weight:400;line-height:1;">${vm.utcTimeToTimezoneStr(vm.toMillisecondTime(parseInt(params[0].axisValue)))}</div>
                <div style="margin: 10px 0 0;line-height:1;">
                    <div style="margin: 0px 0 0;line-height:1;">`
      params.forEach(item => {
        str += `<div style="margin: 0 0 5px 0;line-height:1;">
                    ${item.marker}
                    <span style="font-size:14px;color:#666;font-weight:400;margin-left:2px"> ${item.seriesName}</span>
                    <span style="float:right;margin-left:20px;font-size:14px;color:#666;font-weight:900">${item.value[1]}</span>
                    <div style="clear:both"></div>
                </div>`
      })
      str += '</div>'
      str += '</div>'
      str += '</div>'
      str += '</div>'
      return str
    }
  },
  watch: {
    logData: {
      deep: true,
      immediate: false,
      handler (n, o) {
        const { logData } = this.filterLogType(n) // 过滤出不同resultType，合并去重
        const { tableData, tableChartData } = this.applyFilter(logData, this.operations) // 应用operation区域的过滤项
        this.tableData = tableData
        this.tableChartData = tableChartData
        this.$nextTick(() => {
          this.loadChart()
        })
      }
    },
    operations: {
      deep: true,
      handler (n, o) {
        const { logData } = this.filterLogType(this.logData)
        const { tableData, tableChartData } = this.applyFilter(logData, n) // 应用operation区域的过滤项
        this.tableData = tableData
        this.tableChartData = tableChartData
      }
    },
    limit (n) {
      this.$emit('limitChange', n)
    }
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeChart)
  },
  beforeUpdate () {
    this.$nextTick(() => {
      if (this.$refs.logTable) {
        this.$refs.logTable.doLayout()
      }
    })
  }
}
</script>
