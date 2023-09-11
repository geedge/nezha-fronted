<template>
  <div style="height:100%;position:relative;">
    <div class="explore list-page" style="background: #fffffe;padding: 10px 15px;overflow-x: hidden;overflow-y: auto;">
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
          <el-collapse-item v-if="!allMatrix" name="1" :title="$t('explore.graph')" class="el-collapse-item__height">
            <div class="chart-room">
              <chart ref="exploreChart" :unit="chartUnitType" :timeRange="filterTime"></chart>
            </div>
          </el-collapse-item>
          <el-collapse-item class="el-collapse-item__height" name="2" title="Table">
            <div slot="title" class="explore-table-title">
              <span>{{tableMode==='table'?$t('dashboard.dashboard.chartForm.typeVal.table.label'):$t('explore.row')}}</span>
              <!-- 判断是否折叠 -->
              <div class="tableMode" v-show="collapseValue.some(item=>item==2)">
                <div class="tableMode-item" :class="{'active':tableMode==='table'}" @click.stop="tableMode='table'" tabindex="0">{{$t('dashboard.dashboard.chartForm.typeVal.table.label')}}</div>
                <div class="tableMode-item" :class="{'active':tableMode==='row'}" @click.stop="tableMode='row'" tabindex="0">{{$t('explore.row')}}</div>
              </div>
              <i
                v-if="tableMode==='table'"
                class="nz-icon-gear nz-icon"
                style="position: absolute;right: 0px;top: 0px"
                @click.stop="tools.showCustomTableTitle = true"
                :title="$t('overall.selectColumns')"
                tabindex="0"
              ></i>
              <!-- 自定义table列 -->
              <transition name="el-zoom-in-top">
                <element-set
                  @click.stop="()=>{}"
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
            <!-- table模式 -->
            <template v-if="tableMode==='table'">
              <div class="nz-table-list explore-table">
                <el-table
                  ref="exploreTable"
                  v-my-loading="tools.loading"
                  class="metric-table"
                  :data="tableData"
                  :border="false"
                  :header-cell-class-name="({ column }) => column.property === 'gear' ? 'explore-table-gear' : ''"
                  tooltip-effect="light">
                  <el-table-column
                    v-for="(item, index) in tools.customTableTitle"
                    v-if="item.show"
                    :key="`col-${index}-${item.prop}`"
                    :label="item.label"
                    :prop="item.prop"
                    :resizable="false"
                    :min-width="110"
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
            </template>
            <!-- row模式 -->
            <template v-else>
              <div class="expand-results">
                <div>
                  <span>{{$t('explore.expandResults')}}</span>
                  <el-switch v-model="expandResults" @click.native.stop tabindex="0"></el-switch>
                </div>
                <span>{{$t('explore.resultSeries')}}：{{rowData.length}}</span>
              </div>
              <div class="nz-table-list explore-table">
                <ul v-my-loading="tools.loading" class="row-table" :class="{'expand-results-table':expandResults}">
                    <li class="row-table-row" v-for="(row,index) in rowData" :key="index">
                      <div class="table-row-left">
                        <copy :copyData='row.element' :showInfo='row.element'>
                          <template slot="copy-text">
                            <span v-if="expandResults" v-html="row.expandElement"></span>
                            <span v-else v-html="row.colorElement"></span>
                          </template>
                        </copy>
                      </div>
                      <div class="table-row-right">
                        <h2 class="expand-value" v-if="expandResults">{{$t('overall.value')}}</h2>
                        <ul v-if="row.valueList" class="valueList">
                          <li v-for="item in row.valueList" :key="item.timestamp">
                            <span>{{item.value}}</span>
                            <span>{{item.timestamp}}</span>
                            <span>{{item.time}}</span>
                            <span>{{item.interval}}</span>
                          </li>
                        </ul>
                        <ul v-else class="valueList">
                          <li>
                            <span>{{row.value}}</span>
                            <span>{{row.timestamp}}</span>
                            <span>{{row.time}}</span>
                            <span style="opacity:0">+30</span>
                          </li>
                        </ul>
                      </div>
                    </li>
                    <div v-if="!tools.loading&&!storedTableData.length" class="table-no-data">
                      <svg class="icon" aria-hidden="true">
                        <use xlink:href="#nz-icon-no-data-list"></use>
                      </svg>
                      <div class="table-no-data__title">No results found</div>
                    </div>
                  </ul>
              </div>
            </template>
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
  </div>
</template>

<script>
import chartDataFormat from '@/components/chart/chartDataFormat'
import bus from '@/libs/bus'
import chart from '@/components/page/dashboard/overview/chart'
import logTab from '@/components/page/dashboard/explore/logTab'
import chartUnit from '@/components/common/chartUnit'
import copy from '@/components/common/copy'
const dataJson = window.dataJson || {}
export default {
  name: 'exploreItemHtml',
  props: {
    triggerButtonClass: { // 触发下拉事件的按钮的class
      type: String,
      default: 'top-tool-btn'
    },
    tabIndex: Number
  },
  components: {
    chart,
    logTab,
    'chart-unit': chartUnit,
    copy
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
      logTabNoData: [],
      storedTableData: [],
      tableMode: 'table',
      expandResults: false,
      allMatrix: false, // metric是否全部为matrix类型
      rowData: []
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
    window.addEventListener('resize', this.logsCollapseChange)
  },
  methods: {
    handlerRowData (data) {
      const metric = this.$lodash.cloneDeep(data)
      const metricName = metric.__name__ || ''
      let temp = metricName
      const labelColor = '#588874'// #66d9ef
      const valueColor = '#A21615'// #74e680
      let colorTemp = `<span>${metricName}</span>`
      delete metric.__name__
      temp += '{'
      colorTemp += '<span>{</span>'
      let expandTemp = colorTemp
      const keys = Object.keys(metric)
      for (const index in keys) {
        const key = keys[index]
        temp += key + '="' + metric[key] + '",'
        colorTemp += `<span style="color: ${labelColor}">${key}</span>=<span style="color: ${valueColor}">"${metric[key]}"</span>`
        expandTemp += `<span style="display:block;text-indent:1em"><span style="color: ${labelColor}">${key}</span>=<span style="color: ${valueColor}">"${metric[key]}"</span>`
        if (index < keys.length - 1) {
          colorTemp += ','
          expandTemp += ','
        }
        expandTemp += '</span>'
      }
      if (temp.endsWith(',')) {
        temp = temp.substr(0, temp.length - 1)
      }
      temp += '}'
      colorTemp += '<span>}</span>'
      expandTemp += '<span>}</span>'
      const rowData = { element: temp, colorElement: colorTemp, expandElement: expandTemp }
      return rowData
    },
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
          this.$refs.exploreChart && this.$refs.exploreChart.startLoading()
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
        this.storedTableData = []
        this.rowData = []
        this.tableData = []
        this.tableTitle = []
        this.tools.customTableTitle = []

        this.allMatrix = res.filter((r, i) => r.state).every(d => d.data.resultType === 'matrix' && d.api === 'query')

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
                if (response.api === 'query') {
                  result.values.forEach(item => {
                    tData.push({
                      ...metrics,
                      ['value#' + index]: chartDataFormat.getUnit(this.chartUnit || 2).compute(item[1], null, 2),
                      time: bus.timeFormate(bus.computeTimezone(result.values[0][0] * 1000))
                    })
                  })
                } else {
                  tData.push(metrics)
                }

                // 处理row模式数据
                const rowData = this.handlerRowData(result.metric)
                rowData.value = metrics['value#' + index]
                // matrix 类型数据
                if (response.data.resultType === 'matrix' && response.api === 'query') {
                  rowData.valueList = result.values.map((item, index) => {
                    const obj = {}
                    obj.value = chartDataFormat.getUnit(this.chartUnitType || 2).compute(item[1], null, 2)
                    obj.timestamp = '@' + item[0]
                    obj.time = bus.timeFormate(bus.computeTimezone(item[0] * 1000))
                    if (index) { // 与前一个数据间隔
                      obj.interval = '+' + parseInt(item[0] - result.values[index - 1][0]).toString()
                    }
                    return obj
                  })
                } else {
                  rowData.time = bus.timeFormate(bus.computeTimezone(result.values[0][0] * 1000))
                  rowData.timestamp = '@' + result.values[0][0]
                }
                this.rowData.push(rowData)
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
      this.$refs.exploreChart && this.$refs.exploreChart.startLoading()
      let res = this.dataJson.data
      let series = []
      const promqlInputIndexs = []
      const legend = []
      res = res.filter((r, i) => r.state && r.api === 'query_range')
      if (res.length > 0) {
        res.forEach((response, index) => {
          const promqlIndex = promqlInputIndexs[index]
          if (response.data) {
            const data = response.data.result
            if ((!data || data.length < 1) && response.message) {
              this.$refs['promql-' + promqlIndex][0].setError(response.message)
              return
            }
            data.forEach((result, i) => {
              const seriesItem = {
                type: 'line',
                name: '',
                symbol: 'emptyCircle', // 去掉点
                symbolSize: 8,
                showSymbol: false,
                smooth: 0.2, // 曲线变平滑
                data: [],
                lineStyle: {
                  width: 2,
                  opacity: 0.9
                },
                emphasis: {
                  focus: 'none'
                },
                blur: {
                  lineStyle: {
                    opacity: 0.3
                  },
                  itemStyle: {
                    opacity: 1
                  }
                }
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

        this.$nextTick(() => {
          this.$refs.exploreChart.setLegend(legend)
          this.$refs.exploreChart.setRandomColors(series.length)
          if (!series.length) {
            series = ''
          }
          this.$refs.exploreChart.setSeries(series)
          this.defaultChartVisible = true
        })
      }
      this.$refs.exploreChart && this.$refs.exploreChart.endLoading()
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
                type: 'line',
                name: '',
                symbol: 'emptyCircle', // 去掉点
                symbolSize: 8,
                showSymbol: false,
                smooth: 0.2, // 曲线变平滑
                data: [],
                lineStyle: {
                  width: 2,
                  opacity: 0.9
                },
                emphasis: {
                  focus: 'none'
                },
                blur: {
                  lineStyle: {
                    opacity: 0.3
                  },
                  itemStyle: {
                    opacity: 1
                  }
                }
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
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.logsCollapseChange)
  }
}
</script>
