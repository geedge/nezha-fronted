<template>
  <div class="log-detail">
    <div id="logChart" class="log-chart">
<!--      <chart ref="logChart" :unit="unit" chart-type="logBar" :show-toolbox="false"></chart>-->
    </div>
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
        <el-select v-model="operations.limit" size="small" style="width: 100px;">
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
        :cell-class-name="wrapLines ? '': 'log-row-wrap--no-wrap'"
        :data="tableData"
        :show-header="false"
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
          prop="timestamp"
          width="140"
        >
          <template slot-scope="{ row }">{{row.timestamp}}</template>
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
import axios from 'axios'
export default {
  name: 'logTab',
  props: {
    unit: Number,
    logData: Array
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
        limit: 1000,
        descending: true
      },
      time: true, // 换行和时间不需要处理数据
      wrapLines: true,

      limitOptions: [300, 1000, 3000, 10000],
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
    timeFormat (timestamp) {
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
      return this.utcTimeToTimezoneStr(timestamp * step)
    },
    loadChart () {
      this.myChart = echarts.init(document.getElementById('logChart'))
      if (this.tableChartData.length > 0) {
        let series = this.tableChartData.map(d => ({
          type: 'bar',
          name: d.name,
          stack: 'total',
          barWidth: 6,
          data: d.data.map(item => [item[0], item[1]]),
          itemStyle: { color: this.levelOptions.find(l => l.type === d.name).color }
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
            left: 10,
            right: 10,
            bottom: 60,
            containLabel: true
          },
          legend: {
            bottom: 20,
            left: 10
          },
          series,
          xAxis: {
            type: 'time',
            axisTick: { show: false },
            axisLabel: {
              rotate: 0,
              fontSize: 13 * window.devicePixelRatio,
              formatter: '{HH}:{mm}:{ss}'
            }
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
        this.myChart.setOption(option)
        /* 点击legend
          * 1.当前如果是全高亮状态，则全部置灰，只留被点击的legend高亮
          * 2.如果点击的是唯一高亮的legend，则变为全高亮状态
          * 3.否则只改变被点击的legend状态
          * */
        this.myChart.on('legendselectchanged', ({ name, selected }) => {
          const selectedLevel = []
          const unselectedLevel = []
          for (const n in selected) {
            selected[n] ? selectedLevel.push(n) : unselectedLevel.push(n)
          }
          // 1.
          if (selectedLevel.length + unselectedLevel.length > 1) {
            if (unselectedLevel.length === 1 && unselectedLevel[0] === name) {
              selectedLevel.forEach(l => {
                this.myChart.dispatchAction({
                  type: 'legendInverseSelect'
                })
              })
            } else if (selectedLevel.length === 0) { // 2.
              this.myChart.dispatchAction({
                type: 'legendAllSelect'
              })
            }
          }
        })
      }
    },
    applyFilter (allTableData, filter) {
      let data = [...allTableData]
      // 过滤level
      data = data.filter(d => {
        const hit = filter.levels.some(l => {
          return this.levelOptions[l].type === d.level.toLowerCase()
        })
        return hit
      })
      // limit
      data = data.slice(0, filter.limit)
      // 升降序
      data = data.sort((a, b) => {
        return filter.descending ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
      })
      // logs内部上方的图表数据
      const tableChartData = {}
      data.forEach(d => {
        tableChartData[d.level] || (tableChartData[d.level] = {})
        tableChartData[d.level][`${d.timestamp}`] ? tableChartData[d.level][`${d.timestamp}`]++ : tableChartData[d.level][`${d.timestamp}`] = 1
      })
      const temp = []
      for (const d in tableChartData) {
        const level = { name: d, data: [] }
        for (const time in tableChartData[d]) {
          level.data.push([time, tableChartData[d][time]])
        }
        temp.push(level)
      }
      return { tableData: data, tableChartData: temp }
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
      // 把时间调整为毫秒，并合并同毫秒的数据
      allTableData = allTableData.map(d => ({
        ...d,
        timestamp: this.timeFormat(d.timestamp)
      }))
      return { logData: allTableData }
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
        const { tableData, tableChartData } = this.applyFilter(logData, this.operations) // 应用operation区域的过滤项
        this.tableData = tableData
        this.tableChartData = tableChartData
        this.loadChart()
      }
    }
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
        border-left: 3px solid $--right-box-border-color;
      }
      td.el-table__expanded-cell:first-child {
        border-left: none;
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
