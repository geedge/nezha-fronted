<template>
  <div  class="explore list-page" style="background: #fffffe;padding: 10px 15px;">
    <div style="display: flex;justify-content: space-between;align-items: center;margin-bottom: 10px;">
      <span>{{dataJson.type == 1 ? 'Metric expression' : 'Log expression'}}</span>
      <span>
       <chart-unit v-if="showMetrics" v-model="chartUnitType" ref="chartUnit" class="margin-r-10"></chart-unit>
      </span>
    </div>
    <div v-for="(item, index) in dataJson.data" :key = 'index' style="display: flex;margin-bottom: 10px">
      <div style="flex: 1;margin-right: 10px;border: 1px solid #ddd;border-radius: 2px;padding: 0 8px;line-height: 30px;width: calc(100% - 30px);word-break: break-word;">{{item.expression}}</div>
      <button
        class="top-tool-btn"
        :title="item.state?$t('overall.enabled'):$t('profile.close')"
        @click="stateChange(index)"
      >
        <i  v-if="item.state" class="nz-icon nz-icon-mimakejian"></i>
        <i v-else class="nz-icon nz-icon-mimabukejian" style="fontSize:16px"></i>
      </button>
    </div>
    <el-collapse v-model="collapseValue" class="explore-collapse" @change="logsCollapseChange">
      <!--metric-->
      <template v-if="showMetrics">
        <el-collapse-item name="1" :title="$t('explore.graph')" class="el-collapse-item__height">
          <div class="chart-room">
            <chart ref="exploreChart" :unit="chartUnitType" :timeRange="filterTime"></chart>
          </div>
        </el-collapse-item>
        <el-collapse-item class="el-collapse-item__height" name="2" title="Table">
          <div slot="title" class="explore-table-title">
            {{$t('dashboard.panel.chartForm.typeVal.table.label')}}
            <i
              class="nz-icon-gear nz-icon"
              style="position: absolute;right: 10px;top: 8px"
              @click.stop="tools.showCustomTableTitle = true"
              :title="$t('overall.selectColumns')"
            >
            </i>
            <!-- 自定义table列 -->
            <transition name="el-zoom-in-top">
              <element-set
                @click.stop
                v-if="tools.showCustomTableTitle"
                :tableId="tableId"
                ref="customTableTitle"
                :custom-table-title="tools.customTableTitle"
                :original-table-title="tableTitle"
                :operation-true="true"
                @close="tools.showCustomTableTitle = false"
                @update="updateCustomTableTitle"
              ></element-set>
            </transition>
          </div>
          <!-- 自定义table列 -->
          <div class="nz-table-list explore-table">
            <el-table
              ref="exploreTable"
              v-my-loading="tools.loading"
              class="metric-table"
              :data="tableData"
              border
              :header-cell-class-name="({ column }) => column.property === 'gear' ? 'explore-table-gear' : ''"
              tooltip-effect="light">
              <el-table-column
                v-for="(item, index) in tools.customTableTitle"
                v-if="item.show"
                :key="`col-${index}`"
                :label="item.label"
                :prop="item.prop"
                :resizable="false"
                min-width="110px"
                show-overflow-tooltip
              >
                <template slot-scope="scope" :column="item">
                  <template v-if="item.prop === 'time'">{{timeFormate(scope.row.time)}}</template>
                  <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
                  <template v-else>-</template>
                </template>
              </el-table-column>
              <template slot="empty">
                <div v-if="!tools.loading" class="table-no-data">
                  <svg class="icon" aria-hidden="true">
                    <use xlink:href="#nz-icon-no-data-list"></use>
                  </svg>
                  <div class="table-no-data__title">No results found</div>
                </div>
                <div v-else>&nbsp;</div>
              </template>
            </el-table>
          </div>
          <pagination ref="Pagination" :page-obj="pageObj" @pageNo='pageNo' @pageSize='pageSize'></pagination>
        </el-collapse-item>
      </template>
      <!--log-->
      <template v-else>
        <el-collapse-item v-if="showTab.indexOf('1') > -1" name="1" :title="$t('explore.graph')" class="el-collapse-item__height">
          <div class="chart-room">
            <chart ref="logChart" :unit="chartUnitType" v-my-loading="chartLoading" :timeRange="filterTime"></chart>
          </div>
        </el-collapse-item>
        <el-collapse-item v-if="showTab.indexOf('2') > -1" name="2" title="Logs">
          <log-tab ref="logDetail" :timeRange="filterTime" :log-data="logData" :explore-log-table="logTabNoData" :explore-item="true" :tab-index="0" v-my-loading="chartLoading"></log-tab>
        </el-collapse-item>
      </template>
    </el-collapse>
  </div>
</template>

<script>
import chartDataFormat from '@/components/chart/chartDataFormat'
import bus from '@/libs/bus'
import chart from '@/components/page/dashboard/overview/chart'
import logTab from '@/components/page/dashboard/explore/logTab'
import chartUnit from '@/components/common/chartUnit'

const dataJson = window.dataJson || {}
export default {
  name: 'exploreItemHtml',
  props: {
    triggerButtonClass: { // 触发下拉事件的按钮的class
      type: String,
      default: 'top-tool-btn'
    }
  },
  components: {
    chart,
    logTab,
    'chart-unit': chartUnit
  },
  data () {
    return {
      dataJson,
      showMetrics: true,
      collapseValue: ['1', '2'],
      pageObj: {
        pageNo: 1,
        pageSize: 20,
        total: 0
      },
      chartUnitType: 1,
      filterTime: [],
      tools: {
        loading: false, // 是否显示table加载动画
        showCustomTableTitle: false, // 自定义列弹框是否显示
        customTableTitle: [] // 自定义列工具的数据
      },
      tableId: 'explore',
      tableTitle: [],
      tableData: [],
      historyParam: { useHistory: true, key: 'expore-history' },
      showTab: ['1', '2'],
      chartLoading: false,
      logData: [],
      logTabNoData: []
    }
  },
  mounted () {
    dataJson.data.forEach(item => {
      item.state = true
    })
    if (this.dataJson.type == 1) {
      this.showMetrics = true
    } else {
      this.showMetrics = false
    }
    this.chartUnitType = this.dataJson.unit || 1
    this.$refs.chartUnit.unit = this.dataJson.unit || 1
    this.expressionChange()
  },
  methods: {
    logsCollapseChange (activeNames, a, b) {
      this.$nextTick(() => {
        if (this.$refs.exploreChart) {
          this.$refs.exploreChart.resize()
        }
        if (this.$refs.logChart) {
          this.$refs.logChart.resize()
        }
        if (this.$refs.logDetail) {
          this.$refs.logDetail.myChart.resize()
        }
      })
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.tableData = this.filterShowData(this.storedTableData, this.pageObj)
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      this.tableData = this.filterShowData(this.storedTableData, this.pageObj)
    },
    stateChange (index) {
      this.dataJson.data[index].state = !this.dataJson.data[index].state
      this.expressionChange()
    },
    expressionChange () {
      this.filterTime = [dataJson.start, dataJson.end]
      this.pageObj.pageNo = 1
      if (this.showMetrics) {
        if (this.dataJson.data && this.dataJson.data.length >= 1) {
          this.queryTableData()
          this.queryChartData()
          this.storeHistory()
        }
      } else {
        if (this.dataJson.data && this.dataJson.data.length >= 1) {
          this.queryLogData()
        }
      }
    },
    queryTableData () {
      this.tools.loading = true
      const res = this.dataJson.data
      const tData = []
      let tLabels = []
      if (res.length > 0) {
        this.tableData = []
        this.tableTitle = []
        res.forEach((response, index) => {
          if (!response.state) {
            return
          }
          if (response.data) {
            const data = response.data.result
            if (data) {
              data.forEach((result, i) => {
                const metrics = Object.assign({}, result.metric)
                if (!Array.isArray(result.values)) {
                  const val = result
                  result = {
                    values: ['', val]
                  }
                }
                this.$set(metrics, 'value#' + index, chartDataFormat.getUnit(this.chartUnitType || 2).compute(result.values[0][1], null, 2))

                this.$set(metrics, 'time', bus.timeFormate(bus.computeTimezone(result.values[0][0] * 1000)))
                for (const key in metrics) {
                  const label = {
                    label: key,
                    prop: key,
                    show: true
                  }
                  const temp = tLabels.find((item, index) => {
                    return item.prop == label.prop
                  })
                  if (!temp) {
                    tLabels.push(label)
                  }
                }
                tData.push(metrics)
              })
            }
          }
          tLabels.sort((a, b) => {
            return a.prop.charCodeAt(0) - b.prop.charCodeAt(0)
          })
          tLabels = tLabels.filter(label => label.prop !== 'time')
          tLabels.unshift({
            label: this.$t('overall.time'),
            prop: 'time',
            show: true
          })
          const filterArr = ['alertname', 'severity_id', 'severity', 'rule_type', 'asset_id', 'endpoint_id', 'project_id', 'datacenter_id', 'module_id', 'nz_agent_id', 'parent_asset_id']
          tLabels.forEach(tLabel => {
            if (filterArr.indexOf(tLabel.prop) !== -1) {
              tLabel.show = false
            }
          })
        })
        if (tData.length > 0) {
          this.storedTableData = Object.assign([], tData)
          this.pageObj.total = this.storedTableData.length
          this.tableData = this.filterShowData(this.storedTableData, this.pageObj)
          this.tableTitle = Object.assign([], tLabels)
          this.tools.customTableTitle = Object.assign([], tLabels)
          this.defaultTableVisible = true
        } else {
          // this.defaultTableVisible = false;
          this.pageObj.total = 0
          this.pageObj.pageNo = 1
        }
      }
      this.tools.loading = false
    },
    queryChartData () {
      this.$refs.exploreChart.startLoading()
      const res = this.dataJson.data
      let series = []
      const promqlInputIndexs = []
      const legend = []
      if (res.length > 0) {
        res.forEach((response, index) => {
          if (!response.state) {
            return
          }
          const promqlIndex = promqlInputIndexs[index]
          if (response.data) {
            const data = response.data.result
            if ((!data || data.length < 1) && response.message) {
              this.$refs['promql-' + promqlIndex][0].setError(response.message)
              return
            }
            data.forEach((result, i) => {
              const seriesItem = {
                name: '',
                symbol: 'emptyCircle', // 去掉点
                symbolSize: [2, 2],
                showSymbol: false,
                smooth: 0.2, // 曲线变平滑
                data: [],
                lineStyle: {
                  width: 1,
                  opacity: 0.9
                },
                type: 'line'
              }
              let legendName = ''
              seriesItem.data = result.values.map((item) => {
                return [item[0] * 1000, item[1]]
              })
              if (result.metric && Object.keys(result.metric).length > 0) {
                const metric = Object.assign({}, result.metric)
                seriesItem.name += metric.__name__ ? metric.__name__ : ''
                seriesItem.name += '{'
                delete metric.__name__
                for (const key in metric) {
                  seriesItem.name += key + '=' + '"' + metric[key] + '",'
                }
                legendName = seriesItem.name.substr(0, seriesItem.name.length - 1)
                legendName += '}'
              } else {
                legendName = this.dataJson.data[index].expression
              }
              seriesItem.name = legendName + '-' + index
              series.push(seriesItem)
              legend.push({ name: seriesItem.name, alias: legendName, isGray: false })
            })

            // this.$refs['promql-' + promqlIndex][0].setError('')
          } else {
            if (response.error) {
              // this.$refs['promql-' + promqlIndex][0].setError(response.error)
            } else {
              // this.$refs['promql-' + promqlIndex][0].setError(response)
            }
          }
        })

        this.$refs.exploreChart.setLegend(legend)
        this.$refs.exploreChart.setRandomColors(series.length)
        if (!series.length) {
          series = ''
        }
        this.$refs.exploreChart.setSeries(series)
        this.defaultChartVisible = true
      }
      this.$refs.exploreChart.endLoading()
    },
    storeHistory () {
      const expire = 24
      const historyJson = localStorage.getItem(this.historyParam.key)
      // 过滤掉state为0的元素
      const expressions = this.dataJson.data.filter((item, index) => {
        return item && item != ''
      }).map(item => item.expression)
      const username = localStorage.getItem('nz-username')
      if (historyJson && historyJson != 'undefined' && historyJson != '') {
        const historyObj = JSON.parse(historyJson)
        let history = historyObj[username]
        if (history) {
          // 过滤过期表达式
          history = history.filter(item => {
            return item.time + item.expire >= new Date().getTime()
          })
          let repeat = history.filter(item => {
            return expressions.includes(item.insertText)
          })
          const old = history.filter(item => {
            return !expressions.includes(item.insertText)
          })

          const freshExpression = expressions.filter(item => {
            const find = history.find(t => { return t.insertText == item })
            return !find
          })

          repeat = repeat.map(item => {
            item.time = new Date().getTime()
            item.num += 1
            item.documentation = this.$t('dashboard.metricPreview.historyTip', { time: item.num, hour: 24 })
            return item
          })

          const fresh = freshExpression.map(item => {
            return {
              label: item,
              insertText: item,
              documentation: this.$t('dashboard.metricPreview.historyTip', { time: 1, hour: 24 }),
              num: 1,
              time: new Date().getTime(),
              expire: expire * 60 * 60 * 1000
            }
          })

          historyObj[username] = fresh.concat(repeat).concat(old)
        } else {
          const history = expressions.map(item => {
            return {
              label: item,
              insertText: item,
              documentation: this.$t('dashboard.metricPreview.historyTip', { time: 1, hour: 24 }),
              num: 1,
              time: new Date().getTime(),
              expire: expire * 60 * 60 * 1000
            }
          })
          historyObj[username] = history
        }
        localStorage.setItem(this.historyParam.key, JSON.stringify(historyObj))
      } else {
        const history = expressions.map(item => {
          return {
            label: item,
            insertText: item,
            documentation: this.$t('dashboard.metricPreview.historyTip', { time: 1, hour: 24 }),
            num: 1,
            time: new Date().getTime(),
            expire: expire * 60 * 60 * 1000
          }
        })
        if (history && history.length > 0) {
          const stored = {}
          stored[username] = history
          localStorage.setItem(this.historyParam.key, JSON.stringify(stored))
        }
      }
    },
    filterShowData (source, pageObj) {
      if (source) return source.slice((pageObj.pageNo - 1) * pageObj.pageSize, pageObj.pageNo * pageObj.pageSize)
    },
    queryLogData (limit) { // log的chart和table是一个请求
      this.chartLoading = true
      this.$refs.logDetail && this.$refs.logDetail.resetOperation()
      let res = this.dataJson.data
      if (res.length > 0) {
        this.chartLoading = false
        const errorRowIndex = []
        res.forEach((r, i) => {
          if (typeof r === 'string') {
            errorRowIndex.push(i)
          }
        })
        if (errorRowIndex.length > 0) {
          this.$message.error(this.$t('tip.errorInRow') + ': ' + errorRowIndex.map(e => e + 1).join(' ,'))
          res = res.filter((r, i) => errorRowIndex.indexOf(i) === -1)
        }
        res = res.filter((r, i) => r.state)
        const logData = res.map(r => r.data)
        if (res.length > 0) {
          if (logData[0].result.length > 0) {
            this.logTabNoData = false
          } else {
            this.logTabNoData = true
          }
          const hasGraph = logData.some(d => d.resultType === 'matrix')
          const hasLog = logData.some(d => d.resultType === 'streamsFormat')
          const graphTabIndex = this.showTab.indexOf('1')
          if (hasGraph) {
            if (graphTabIndex === -1) {
              this.showTab.push('1')
            }
          } else {
            if (graphTabIndex > -1) {
              this.showTab.splice(graphTabIndex, 1)
            }
          }
          const logTabIndex = this.showTab.indexOf('2')
          if (hasLog) {
            if (logTabIndex === -1) {
              this.showTab.push('2')
            }
          } else {
            if (logTabIndex > -1) {
              this.showTab.splice(logTabIndex, 1)
            }
          }
          this.$nextTick(() => {
            this.logData = logData
            hasGraph && this.loadLogGraph()
          })
        }
      }
    },
    loadLogGraph () {
      const graphData = this.logData.filter(l => l.resultType === 'matrix')
      if (graphData && graphData.length > 0) {
        this.$refs.logChart.startLoading()
        const queryExpression = []
        let series = []
        const legend = []
        this.logData.forEach((response, index) => {
          if (response.resultType === 'matrix') {
            const data = response.result
            if (!data || data.length < 1) {
              return
            }
            data.forEach((result, i) => {
              const seriesItem = {
                name: '',
                symbol: 'emptyCircle', // 去掉点
                symbolSize: [2, 2],
                showSymbol: false,
                smooth: 0.2, // 曲线变平滑
                data: [],
                lineStyle: {
                  width: 1,
                  opacity: 0.9
                },
                type: 'line'
              }
              let legendName = ''
              seriesItem.data = result.values.map((item) => {
                return [item[0] * 1000, item[1]]
              })
              if (result.metric && Object.keys(result.metric).length > 0) {
                const metric = Object.assign({}, result.metric)
                seriesItem.name += metric.__name__ ? metric.__name__ : ''
                seriesItem.name += '{'
                delete metric.__name__
                for (const key in metric) {
                  seriesItem.name += key + '=' + '"' + metric[key] + '",'
                }
                legendName = seriesItem.name.substr(0, seriesItem.name.length - 1)
                legendName += '}'
              } else {
                legendName = queryExpression[index]
              }
              seriesItem.name = legendName + '-' + index
              series.push(seriesItem)
              legend.push({ name: seriesItem.name, alias: legendName, isGray: false })
            })
          }
        })
        this.defaultChartVisible = true
        this.$nextTick(() => {
          this.$refs.logChart.setLegend(legend)
          this.$refs.logChart.setRandomColors(series.length)
          if (!series.length) {
            series = ''
          }
          this.$refs.logChart.setSeries(series)
          this.$refs.logChart.endLoading()
        })
      }
    },
    updateCustomTableTitle (custom) {
      this.tools.customTableTitle = custom
      this.$refs.exploreTable.doLayout()
    }
  },
  watch: {
    chartUnitType: {
      handler (n, o) {
        this.expressionChange()
      }
    }
  }
}
</script>

<style scoped>

</style>
