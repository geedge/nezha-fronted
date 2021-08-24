<template>
  <div class="log-detail">
    <div :id="`logChart${tabIndex}`" class="log-chart"></div>
    <div class="log-operations">
      <div class="log-operation">
        <span class="operation-label">{{$t('overall.time')}}</span>
        <el-switch
          v-model="time"
          :active-color="theme.themeColor"
        >
        </el-switch>
      </div>
      <div class="log-operation">
        <span class="operation-label">{{$t('dashboard.explore.descending')}}</span>
        <el-switch
          v-model="operations.descending"
          :active-color="theme.themeColor"
        >
        </el-switch>
      </div>
      <div class="log-operation">
        <span class="operation-label">{{$t('dashboard.explore.wrapLines')}}</span>
        <el-switch
          v-model="wrapLines"
          :active-color="theme.themeColor"
        >
        </el-switch>
      </div>
      <div class="log-operation">
        <span class="operation-label">{{$t('overall.limit')}}:</span>
        <el-select v-model="limit" size="small" style="width: 100px;">
          <el-option v-for="option in limitOptions" :key="option" :value="option"></el-option>
        </el-select>
      </div>
      <div class="log-operation">
        <span class="operation-label">Result:</span>
        <span>{{tableData.length}}</span>
      </div>
      <div class="log-operation log-operation--right">
        <button class="top-tool-btn" type="button" @click="exportLog"><i class="nz-icon nz-icon-download"></i></button>
      </div>
    </div>
    <div class="log-table">
      <el-table
        :cell-class-name="cellClassName"
        :data="tableData"
        :show-header="false"
        ref="logTable"
        class="nz-table2"
        size="mini"
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
          prop="message"
        >
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'logTab',
  props: {
    logData: Array,
    tabIndex: Number
  },
  computed: {
    tableTimeFormat () {
      return this.timeFormat
    }
  },
  data () {
    return {
      operations: {
        levels: [0, 1, 2, 3, 4, 5, 6],
        descending: true
      },
      time: true, // 换行和时间不需要处理数据
      wrapLines: true,

      limit: 1000, // limit改动需要请求接口
      limitOptions: [300, 1000, 3000, 5000],
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
          color: '#dde4ed'
        }
      ],
      tableData: [],
      timeFormatData: [],
      tableChartData: [],
      myChart: null
    }
  },
  methods: {
    exportLog () {
      this.$emit('exportLog', this.operations)
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
      const dom = document.getElementById(`logChart${this.tabIndex}`)
      if (!dom) {
        return
      }
      this.myChart = echarts.init(dom)
      if (this.tableChartData.length > 0) {
        let series = this.tableChartData.map(d => ({
          type: 'bar',
          name: d.name,
          stack: 'total',
          barWidth: 6,
          clip: false,
          barMinHeight: 1,
          data: d.data.map(item => [item[0], item[1]]),
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
            left: 30,
            right: 10,
            bottom: 80
          },
          legend: {
            bottom: 20,
            left: 10,
            itemGap: 20,
            itemWidth: 16,
            itemHeight: 4,
            borderRadius: 3,
            textStyle: {
              padding: [0, 0, 0, 6]
            }
          },
          series,
          xAxis: {
            type: 'time',
            axisTick: { show: false },
            axisLabel: {
              rotate: 0,
              fontSize: 13 * window.devicePixelRatio,
              formatter (value) {
                return vm.utcTimeToTimezoneStr(vm.$unixTimeParseToString(vm.toMillisecondTime(value) / 1000), 'hh:mm')
              }
            },
            boundaryGap: [0, '1%']
          },
          tooltip: {
            trigger: 'axis'
          },
          yAxis: {
            type: 'value',
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
        this.$nextTick(() => {
          this.myChart.setOption(option)
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
      const logData = data.filter(l => l.resultType === 'streamsFormat')
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
    resizeChart () {
      this.myChart.resize()
    }
  },
  watch: {
    logData: {
      deep: true,
      immediate: true,
      handler (n, o) {
        const { logData } = this.filterLogType(n) // 过滤出不同resultType，合并去重
        const { tableData, tableChartData } = this.applyFilter(logData, this.operations) // 应用operation区域的过滤项
        this.tableData = tableData
        this.tableChartData = tableChartData
        this.loadChart()
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
  beforeUpdate () {
    this.$nextTick(() => {
      this.$refs.logTable.doLayout()
    })
  }
}
</script>

<style lang="scss">
.log-detail {
  * {
    box-sizing: border-box;
  }
  .log-table .nz-table2 {
    padding: 10px 0 0 0;

    .el-table__body {
      border-collapse: separate;
      border-spacing: 0 6px;

      td {
        vertical-align: top;
        padding: 1px 0;
        border: none;
      }
      td.el-table__expanded-cell {
        padding: 0 0 0 60px;
        background-color: #fafafa;
      }
      // 左侧边框
      td:first-child {
        border-left: 3px solid;
      }
      td.log-border--debug {
        border-left-color: #1f78c1;
      }
      td.log-border--info {
        border-left-color: #7eb26d;
      }
      td.log-border--warn {
        border-left-color: #ff851b;
      }
      td.log-border--error {
        border-left-color: #e24d42;
      }
      td.log-border--fatel {
        border-left-color: #705da0;
      }
      td.log-border--trace {
        border-left-color: #6ed0e0;
      }
      td.log-border--unknown {
        border-left-color: #dde4ed;
      }
      td.el-table__expanded-cell:first-child {
        border-left: none;
      }
      // 不换行
      .log-row-wrap--no-wrap .cell {
        white-space: nowrap;
        overflow: visible;
      }

    }
  }

  .log-chart {
    height: 300px;
    width: 100%;
  }
  .log-operations {
    display: flex;
    align-items: center;
    height: 50px;
    width: 100%;
    padding: 0 10px 0 20px;
    border: 1px solid #E4E8EB;
    border-radius: 2px;

    .log-operation {
      display: flex;
      align-items: center;

      &.log-operation--right {
        margin-left: auto;
      }
      &:not(:last-of-type) {
        margin-right: 30px;
      }

      .operation-label {
        padding-right: 10px;
        color: #666666;
      }
    }
  }
}
</style>
