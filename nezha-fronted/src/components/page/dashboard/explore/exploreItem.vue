<template>
  <div class="explore list-page">
    <div class="main-list">
      <div class="main-container explore-split-box">
        <!-- 关闭按钮 -->
        <div v-if="closable" class="explore-close">
          <span @click="split"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
        </div>
        <!-- 顶部工具栏 -->
        <div class="top-tools" style="z-index: 1">
          <el-row class="block-col-2" style="width: 300px;">
            <el-col>
              <el-dropdown trigger="click">
              <span class="el-dropdown-link explore-dropdown__item">
                <span><i :class="selectIcon"></i></span>
                <span>{{selectValue}}</span>
                <span><i class="el-icon-arrow-down el-icon--right"></i></span>
              </span>
                <el-dropdown-menu style="width: 118px" class="el-dropdown__width right-box-select-top right-public-box-dropdown-top" placement="bottom-end" slot="dropdown">
                  <el-dropdown-item
                    @click.native="selectMetricsLogs(item.label,item.icon, item.value)"
                    v-for="item in searchMetrics"
                    :key="item.value"><i class="nz-icon" :class="item.icon" style="margin-right: 5px"/>{{item.label}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </el-col>
          </el-row>
          <div class="top-tool-right">
            <button v-if="!closable" class="top-tool-btn top-tool-btn--text margin-r-10" style="cursor: pointer;" type="button" @click="split">
              {{$t('overall.split')}}</button>
            <pick-time id="explore" ref="pickTime" v-model="filterTime" :class="{'margin-r-10': showMetrics}" :refresh-data-func="expressionChange" @unitChange="chartUnitChange">
             <!-- <template slot="added-text">{{$t('dashboard.metricPreview.runQuery')}}</template> -->
              <template slot="added-text">{{$t('overall.query')}}</template>
            </pick-time>
            <button v-if="showMetrics"
              id="explore-save-chart"
              v-has="'main_add'"
              :class="{'nz-btn-disabled btn-disabled-cursor-not-allowed' : saveDisabled}"
              :disabled="saveDisabled"
              class="top-tool-btn top-tool-btn--text"
              type="button"
              @click="saveChart">
              {{$t('dashboard.metric.saveChart')}}
            </button>
            <button v-else
              id="explore-save-chart-logs"
              v-has="'main_add'"
              :class="{'nz-btn-disabled btn-disabled-cursor-not-allowed' : saveDisabled}"
              :disabled="saveDisabled"
              class="top-tool-btn top-tool-btn--text"
              type="button"
              @click="saveChartLogs">
              {{$t('dashboard.metric.saveChart')}}
            </button>
          </div>
        </div>
        <div id="explore-promql-box" class="top-tools" style="padding-top: 0; flex-wrap: wrap">
          <template v-if="showMetrics">
            <promql-input
              :from-father-data="true"
              :metricOptionsParent="metricOptions"
              v-for="index of promqlKeys.length"
              :id="promqlKeys[index-1].id"
              :pqid="tabIndex.toString()"
              :key="promqlKeys[index-1].id"
              :ref="'promql-'+(index-1)"
              :expression-list="expressions"
              :state="promqlKeys[index-1].state"
              :index="index-1"
              :plugins="['metric-selector', 'metric-input', 'add', 'remove', 'copy','enable']"
              :styleType="1"
              type="metric"
              @enableExpression="enableExpression"
              @addExpression="addExpression"
              @copyExpression="copyExpression"
              @removeExpression="removeExpression"
              @resetExpression="resetExpression"
            ></promql-input>
          </template>
          <template v-else>
            <promql-input
              v-for="index of promqlKeys.length"
              :id="promqlKeys[index-1].id"
              :pqid="tabIndex.toString()"
              :key="promqlKeys[index-1].id"
              :ref="'promql-'+(index-1)"
              :expression-list="expressions"
              :state="promqlKeys[index-1].state"
              :index="index-1"
              :plugins="['metric-selector', 'metric-input', 'add', 'remove', 'copy','enable']"
              :styleType="1"
              type="log"
              @enableExpression="enableExpression"
              @addExpression="addExpression"
              @copyExpression="copyExpression"
              @removeExpression="removeExpression"
              @resetExpression="resetExpression"
            ></promql-input>
          </template>
        </div>
        <div ref="scrollWrap" style="height: auto; padding: 0 20px 4px;">
          <el-collapse v-show="!showIntroduce" v-model="collapseValue" class="explore-collapse" @change="logsCollapseChange">
            <!--metric-->
            <template v-if="showMetrics">
              <el-collapse-item name="1" :title="$t('explore.graph')" class="el-collapse-item__height">
                <div class="chart-room">
                  <chart ref="exploreChart" :unit="chartUnit" :timeRange="filterTime"></chart>
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
                  ></i>
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
                  <el-table ref="exploreTable"
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
                <pagination ref="Pagination" :page-obj="pageObj" @pageNo='pageNo'
                            @pageSize='pageSize'></pagination>
              </el-collapse-item>
            </template>
            <!--log-->
            <template v-else>
              <el-collapse-item v-if="showTab.indexOf('1') > -1" name="1" :title="$t('explore.graph')" class="el-collapse-item__height">
                <div class="chart-room">
                  <chart ref="logChart" :unit="chartUnit" v-my-loading="chartLoading" :timeRange="filterTime"></chart>
                </div>
              </el-collapse-item>
              <el-collapse-item v-if="showTab.indexOf('2') > -1" name="2" title="Logs">
                <log-tab ref="logDetail" :timeRange="filterTime" :log-data="logData" :explore-log-table="logTabNoData" :explore-item="true" :tab-index="tabIndex" @exportLog="exportLog" @limitChange="queryLogData" v-my-loading="chartLoading"></log-tab>
              </el-collapse-item>
            </template>
          </el-collapse>
          <div v-if="showMetrics" v-show="showIntroduce" class="introduce-view">
            <div class="info-room">
              <div class="col-md-9 doc-content">
                <h1 class="page-header">Query examples<a class="header-anchor" href="https://prometheus.io/docs/prometheus/latest/querying/examples/" rel="noopener noreferrer" target="_blank"><i class="nz-icon nz-icon-link1" style="font-size: 16px;" :title="$t('overall.link')"></i></a></h1>
                <div class="content-divider"></div>
                <h2 >
                  Simple time series selection
                </h2>

                <p>Return all time series with the metric <code>http_requests_total</code>:</p>

                <pre><code>http_requests_total</code></pre>

                <p>Return all time series with the metric <code>http_requests_total</code> and the given<code>job</code> and <code>handler</code> labels:</p>

                <pre><code>http_requests_total{job="apiserver", handler="/api/comments"}</code></pre>

                <p>Return a whole range of time (in this case 5 minutes) for the same vector,
                  making it a range vector:</p>

                <pre><code>http_requests_total{job="apiserver", handler="/api/comments"}[5m]</code></pre>

                <p>Note that an expression resulting in a range vector cannot be graphed directly,
                  but viewed in the tabular ("Console") view of the expression browser.</p>

                <p>Using regular expressions, you could select time series only for jobs whose
                  name match a certain pattern, in this case, all jobs that end with <code>server</code>:</p>

                <pre><code>http_requests_total{job=~".*server"}</code></pre>

                <p>All regular expressions in Prometheus use RE2 syntax.</p>

                <p>To select all HTTP status codes except 4xx ones, you could run:</p>

                <pre><code>http_requests_total{status!~"4.."}</code></pre>

                <h2 >
                  Subquery
                </h2>

                <p>Return the 5-minute rate of the <code>http_requests_total</code> metric for the past 30 minutes, with a resolution of 1 minute.</p>

                <pre><code>rate(http_requests_total[5m])[30m:1m]</code></pre>

                <p>This is an example of a nested subquery. The subquery for the <code>deriv</code> function uses the default resolution. Note that using subqueries unnecessarily is unwise.</p>

                <pre><code>max_over_time(deriv(rate(distance_covered_total[5s])[30s:5s])[10m:])</code></pre>

                <h2 >
                  Using functions, operators, etc.
                </h2>

                <p>Return the per-second rate for all time series with the <code>http_requests_total</code>
                  metric name, as measured over the last 5 minutes:</p>

                <pre><code>rate(http_requests_total[5m])</code></pre>

                <p>Assuming that the <code>http_requests_total</code> time series all have the labels <code>job</code>
                  (fanout by job name) and <code>instance</code> (fanout by instance of the job), we might
                  want to sum over the rate of all instances, so we get fewer output time series,
                  but still preserve the <code>job</code> dimension:</p>

                <pre><code>sum by (job) (rate(http_requests_total[5m]))</code></pre>

                <p>If we have two different metrics with the same dimensional labels, we can apply
                  binary operators to them and elements on both sides with the same label set
                  will get matched and propagated to the output. For example, this expression
                  returns the unused memory in MiB for every instance (on a fictional cluster
                  scheduler exposing these metrics about the instances it runs):</p>

                <pre><code>(instance_memory_limit_bytes - instance_memory_usage_bytes) / 1024 / 1024</code></pre>

                <p>The same expression, but summed by application, could be written like this:</p>

                <pre><code>sum by (app, proc) (instance_memory_limit_bytes - instance_memory_usage_bytes) / 1024 / 1024</code></pre>

                <p>If the same fictional cluster scheduler exposed CPU usage metrics like the following for every instance:</p>

                <pre><code>instance_cpu_time_ns{app="lion", proc="web", rev="34d0f99", env="prod", job="cluster-manager"}
instance_cpu_time_ns{app="elephant", proc="worker", rev="34d0f99", env="prod", job="cluster-manager"}
instance_cpu_time_ns{app="turtle", proc="api", rev="4d3a513", env="prod", job="cluster-manager"}
instance_cpu_time_ns{app="fox", proc="widget", rev="4d3a513", env="prod", job="cluster-manager"}
...
</code></pre>

                <p>...we could get the top 3 CPU users grouped by application (<code>app</code>) and process type (<code>proc</code>) like this:</p>

                <pre><code>topk(3, sum by (app, proc) (rate(instance_cpu_time_ns[5m])))</code></pre>

                <p>Assuming this metric contains one time series per running instance, you could count the number of running instances per application like this:</p>

                <pre><code>count by (app) (instance_cpu_time_ns)</code></pre>

              </div>
            </div>
          </div>
          <div v-else v-show="showIntroduce" class="introduce-view">
            <div class="info-room title-heard">
              <div class="col-md-9 logs-content">
                <h1>Loki Cheat Sheet</h1>
                <div class="title-heard__divider"></div>
                <div class="introduce-view__content">
                  <h2>See your logs</h2>
                  <div class="introduce-view__content-label">
                    <p>Start by selecting a log stream from the Log labels selector</p>
                    <p>Alternatively, you can write a stream selector into query field:</p>
                    <span>{job="default/prometheus"}</span>
                    <p>Here are some example streams from your logs:</p>
                    <span>{job="systemd-journal"}</span>
                  </div>
                </div>
                <div class="introduce-view__content">
                  <h2>Combine Stream selectors</h2>
                  <div class="introduce-view__content-label">
                    <span>{app="cassandra",namespace="prod"}</span>
                    <p>Returns all log lines from streams that both labels.</p>
                  </div>
                </div>
                <div class="introduce-view__content">
                  <h2>Filtering for search terms</h2>
                  <div class="introduce-view__content-label">
                    <span>{app="cassandra"} |~ "(duration|latency)s*[d.]+"</span><br/>
                    <span>{app="cassandra"!= "exact match"}</span><br/>
                    <span>{app="cassandra"!= "do not match"}</span>
                    <p><b style="color: #3C92F1">LogQL </b>supports exact and regular expression filters</p>
                  </div>
                </div>
                <div class="introduce-view__content">
                  <h2>Count over time</h2>
                  <div class="introduce-view__content-label">
                    <span>count_over_time{job="mysql"}[5m]</span>
                    <p>This query counts all the log lines within the last five minutes for the MySQL job.</p>
                  </div>
                </div>
                <div class="introduce-view__content">
                  <h2>Rate</h2>
                  <div class="introduce-view__content-label">
                    <span>rate(({job="mysql"} |= "error" != "timeout")[10s]) </span>
                    <p>This query gets the per-second rate of all non-timeout errors within the last ten seconds for the MySQL job.</p>
                  </div>
                </div>
                <div class="introduce-view__content">
                <h2>Aggregate,count,and group </h2>
                <div class="introduce-view__content-label">
                  <span>sum(count_over_time({job="mysql"}[5m])) by (level)</span>
                  <p>Get the count of logs during the last five minutes, grouping by level.</p>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <transition name="right-box">
      <chartRightBox v-if="rightBox.show" ref="addChartModal" :chart="chartData" :from="$CONSTANTS.fromRoute.explore" :panel-data="panelData" :show-panel="{id: -1, name: '', type: 'explore'}" @close="handleBox(false)" @on-create-success="createSuccess"></chartRightBox>
    </transition>
  </div>
</template>

<script>
import bus from '../../../../libs/bus'
import promqlInput from './promqlInput'
import chart from '../overview/chart'
import axios from 'axios'
import { getUUID } from '../../../common/js/common'
import chartDataFormat from '../../../chart/chartDataFormat'
import logTab from './logTab'
import promqlInputMixin from '@/components/common/mixin/promqlInput'
import chartRightBox from '@/components/common/rightBox/chart/chartRightBox'

export default {
  name: 'exploreItem',
  components: {
    'promql-input': promqlInput,
    chartRightBox,
    chart,
    logTab
  },
  props: {
    tabIndex: Number,
    closable: Boolean
  },
  mixins: [promqlInputMixin],
  data () {
    return {
      chartLoading: false,
      logTabNoData: false,
      rightBox: { // 面板弹出框相关
        show: false
      },
      value: true,
      tabPosition: 'none',
      tableId: 'explore',
      searchMetrics: [
        {
          value: 'Metrics',
          label: this.$t('overall.metric'),
          icon: 'nz-icon nz-icon-Metrics'
        },
        {
          value: 'Logs',
          label: this.$t('dashboard.panel.chartForm.typeVal.log.label'),
          icon: 'nz-icon nz-icon-logs'
        }
      ],
      selectValue: this.$t('overall.metric'),
      selectIcon: 'nz-icon nz-icon-Metrics',
      showMetrics: true,
      promqlCount: 1,
      promqlKeys: [],
      expressions: [''],
      filterTime: [
        bus.timeFormate(bus.getOffsetTimezoneData(-1)),
        bus.timeFormate(bus.getOffsetTimezoneData())
      ],

      /* 工具参数 */
      tools: {
        loading: false, // 是否显示table加载动画
        showCustomTableTitle: false, // 自定义列弹框是否显示
        customTableTitle: [] // 自定义列工具的数据
      },
      tableTitle: [],
      showIntroduce: true,
      defaultChartVisible: true,
      defaultTableVisible: true,
      chartVisible: true,
      tableVisible: true,
      pageObj: {
        pageNo: 1,
        pageSize: this.$CONSTANTS.defaultPageSize,
        total: 0
      },
      tableData: [],
      saveDisabled: true,
      panelData: [],
      chartUnit: 0,
      historyParam: { useHistory: true, key: 'expore-history' },
      chartData: {},
      collapseValue: ['1', '2'],
      showTab: ['1', '2'],
      logData: [],
      letter: [
        'A', 'B', 'C', 'D', 'E', 'F', 'G',
        'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z'
      ]
    }
  },
  created () {
    this.getPanelData()
    this.promqlKeys.push({
      id: getUUID(),
      state: 1
    })
    this.selectMetricsLogs()
  },
  methods: {
    selectMetricsLogs (val, icon, label) {
      if (val) {
        this.selectIcon = icon
        this.selectValue = val
      } else {
        label = 'Metrics'
      }
      this.changeType(label)
    },
    changeType (value) {
      this.showMetrics = value === 'Metrics'
      this.showIntroduce = true
      this.resetExpression()
    },
    split () {
      this.$emit('split', this.tabIndex)
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.tableData = this.filterShowData(this.storedTableData, this.pageObj)
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      this.tableData = this.filterShowData(this.storedTableData, this.pageObj)
    },
    filterShowData (source, pageObj) {
      if (source) return source.slice((pageObj.pageNo - 1) * pageObj.pageSize, pageObj.pageNo * pageObj.pageSize)
    },
    chartUnitChange (unit) {
      this.chartUnit = unit
      this.$nextTick(() => {
        this.expressionChange()
      })
    },
    exportLog ({ limit, descending }) {
      const params = {
        logql: this.expressions,
        start: this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[0])),
        end: this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[1])),
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
    queryLogData (limit) { // log的chart和table是一个请求
      this.chartLoading = true
      if (!limit) {
        limit = this.$refs.logDetail ? this.$refs.logDetail.getLimit() : 100
      }
      this.$refs.logDetail && this.$refs.logDetail.resetOperation()
      if (this.expressions.length > 0) {
        const requestArr = []
        // 过滤掉state为0的元素
        this.expressions.forEach((item, index) => {
          if (item != '' && this.promqlKeys[index].state) {
            requestArr.push(this.$get('/logs/loki/api/v1/query_range?format=1&query=' + encodeURIComponent(item) + '&start=' + this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[0])) + '&end=' + this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[1])) + '&limit=' + limit))
          }
        })
        if (requestArr.length > 0) {
          this.showIntroduce = false
          this.saveDisabled = false
        }
        axios.all(requestArr).then(res => {
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
          if (res.length > 0) {
            const logData = res.map(r => r.data)
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
        }).catch(e => {
          this.chartLoading = false
          this.$message.error(this.$t('terminallog.statusItem.unknownError'))
        })
      }
    },
    loadLogGraph () {
      const graphData = this.logData.filter(l => l.resultType === 'matrix')
      if (graphData && graphData.length > 0) {
        this.$refs.logChart.startLoading()
        const promqlInputIndexs = []
        const queryExpression = []
        let series = []
        const legend = []
        this.expressions.forEach((item, index) => {
          if (item !== '') {
            promqlInputIndexs.push(index)
            queryExpression.push(item)
          }
        })
        this.logData.forEach((response, index) => {
          if (response.resultType === 'matrix') {
            const promqlIndex = promqlInputIndexs[index]
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

            this.$refs['promql-' + promqlIndex][0].setError('')
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
    queryChartData () {
      this.$refs.exploreChart.startLoading()
      if (this.expressions.length > 0) {
        const requestArr = []
        const promqlInputIndexs = []
        const queryExpression = []
        // 过滤掉state为0的元素
        this.expressions.forEach((item, index) => {
          if (item != '' && this.promqlKeys[index].state) {
            const step = bus.getStep(bus.formateTimeToTime(this.filterTime[0]), bus.formateTimeToTime(this.filterTime[1]))
            promqlInputIndexs.push(index)
            queryExpression.push(item)
            requestArr.push(this.$get('/prom/api/v1/query_range?query=' + encodeURIComponent(item) + '&start=' + this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[0])) + '&end=' + this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[1])) + '&step=' + step + '&nullType=null'))
          }
        })
        if (requestArr.length > 0) {
          this.showIntroduce = false
          this.saveDisabled = false
        }
        axios.all(requestArr).then(res => {
          let series = []
          const legend = []
          if (res.length > 0) {
            res.forEach((response, index) => {
              const promqlIndex = promqlInputIndexs[index]
              if (response.data && response.status == 'success') {
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
                    legendName = queryExpression[index]
                  }
                  seriesItem.name = legendName + '-' + index
                  series.push(seriesItem)
                  legend.push({ name: seriesItem.name, alias: legendName, isGray: false })
                })

                this.$refs['promql-' + promqlIndex][0].setError('')
              } else {
                if (response.error) {
                  this.$refs['promql-' + promqlIndex][0].setError(response.error)
                } else {
                  this.$refs['promql-' + promqlIndex][0].setError(response)
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
        })
      }
    },
    queryTableData () {
      this.tools.loading = true
      if (this.expressions.length > 0) {
        const requestArr = []
        this.expressions.forEach((item, index) => {
          // 过滤掉state为0的元素
          if (item !== '' && this.promqlKeys[index].state) {
            requestArr.push(this.$get('/prom/api/v1/query?query=' + encodeURIComponent(item)))
          }
        })
        if (requestArr.length > 0) {
          this.showIntroduce = false
        }
        axios.all(requestArr).then(res => {
          const tData = []
          let tLabels = []
          if (res.length > 0) {
            this.tableData = []
            this.tableTitle = []
            res.forEach((response, index) => {
              if (response.data && response.status === 'success') {
                const data = response.data.result
                if (data) {
                  data.forEach((result, i) => {
                    const metrics = Object.assign({}, result.metric)
                    if (!Array.isArray(result.value)) {
                      const val = result
                      result = {
                        value: ['', val]
                      }
                    }
                    this.$set(metrics, 'value#' + index, chartDataFormat.getUnit(this.chartUnit || 2).compute(result.value[1], null, 2))

                    this.$set(metrics, 'time', bus.timeFormate(bus.computeTimezone(result.value[0] * 1000)))
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
        })
      }
    },
    expressionChange () {
      const nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
      this.pageObj.pageNo = 1
      this.setSearchTime(nowTimeType.type, nowTimeType.value)
      if (this.showMetrics) {
        if (this.expressions && this.expressions.length >= 1) {
          this.queryTableData()
          this.queryChartData()
          this.storeHistory()
        }
      } else {
        if (this.expressions && this.expressions.length >= 1) {
          this.queryLogData()
        }
      }
    },
    setSearchTime (type, val) { // 设置searchTime
      if (type === 'minute') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - val))
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
        this.$set(this.filterTime, 0, startTime)
        this.$set(this.filterTime, 1, endTime)
        this.$set(this.filterTime, 2, val + 'm')
      } else if (type === 'hour') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - val))
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
        this.$set(this.filterTime, 0, startTime)
        this.$set(this.filterTime, 1, endTime)
        this.$set(this.filterTime, 2, val + 'h')
      } else if (type === 'date') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setDate(new Date(bus.computeTimezone(new Date().getTime())).getDate() - val))
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
        this.$set(this.filterTime, 0, startTime)
        this.$set(this.filterTime, 1, endTime)
        this.$set(this.filterTime, 2, val + 'd')
      }
      this.$refs.pickTime.$refs.timePicker.searchTime = this.filterTime
    },
    storeHistory () {
      const expire = 24
      const historyJson = localStorage.getItem(this.historyParam.key)
      // 过滤掉state为0的元素
      const expressions = this.expressions.filter((item, index) => {
        return item && item != '' && this.promqlKeys[index].state
      })
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
    // 禁用启用表达式
    enableExpression (index) {
      this.promqlKeys[index].state = this.promqlKeys[index].state ? 0 : 1
      const temp = this.expressions.some((item, index) => {
        return item != '' && this.promqlKeys[index].state
      })
      if (!temp) {
        this.showIntroduce = true
      }
      this.expressionChange()
    },
    addExpression (index) {
      this.expressions.splice(index + 1, 0, '')
      this.promqlKeys.splice(index + 1, 0, {
        id: getUUID(),
        state: 1
      })
      this.promqlCount++
    },
    copyExpression (index) {
      this.expressions.push(this.expressions[index])
      this.promqlKeys.push({
        id: getUUID(),
        state: 1
      })
      this.promqlCount++
    },
    removeExpression (index) {
      if (this.promqlCount > 1) {
        this.expressions.splice(index, 1)
        this.promqlKeys.splice(index, 1)
        this.promqlCount--
      }
    },
    resetExpression () {
      this.expressions = ['']
      this.promqlKeys = [{
        id: getUUID(),
        state: 1
      }]
      this.promqlCount = 1
    },
    changeChartVisible () {
      this.chartVisible = !this.chartVisible
    },
    changeTableVisible () {
      this.tableVisible = !this.tableVisible
    },
    handleBox (show) {
      this.rightBox.show = show
    },
    saveChart () {
      const chart = {
        id: '',
        name: '',
        panelName: '',
        type: 'line',
        span: 4,
        datasource: 'metrics',
        height: 4,
        unit: 2,
        param: {
          stack: 0,
          nullType: 'null',
          legend: { placement: 'bottom', values: [], show: true },
          thresholdShow: true,
          thresholds: [{ value: undefined, color: '#eeeeeeff' }]
        },
        elements: [],
        panel: '',
        sync: 0,
        remark: '',
        groupId: -1
      }
      this.expressions.forEach((exp, index) => {
        chart.elements.push({ state: this.promqlKeys[index].state, expression: exp, legend: '', type: 'expert', id: '', name: this.transformNumToLetter(index) })
      })
      this.chartData = chart
      this.rightBox.show = true
    },
    saveChartLogs () {
      const chart = {
        id: '',
        name: '',
        panelName: '',
        span: 4,
        height: 4,
        unit: 2,
        groupId: -1,
        updateBy: 1,
        updateAt: '2022-05-18 07:51:45',
        type: 'log',
        weight: 6,
        param: { limit: 100 },
        pid: null,
        buildIn: 0,
        seq: null,
        x: 0,
        y: 1.93,
        elements: [],
        children: null,
        chartNums: null,
        asset: null,
        varType: null,
        varId: null,
        varName: null,
        datasource: 'logs',
        enable: { thresholds: false, legend: true, valueMapping: false },
        sync: 0,
        remark: ''
      }
      this.expressions.forEach((exp, index) => {
        chart.elements.push({ state: this.promqlKeys[index].state, expression: exp, legend: '', type: 'expert', id: '', name: this.transformNumToLetter(index) })
      })
      this.chartData = chart
      this.rightBox.show = true
    },
    createSuccess (panel) { // 添加chart成功
      this.$confirm(this.$t('dashboard.metric.goPanelTip'), this.$t('tip.saveSuccess'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'success'
      }).then(() => {
        bus.$emit('menu-change', 'panel')
        this.$store.commit('panelShowPanelChange', panel)
        this.$router.push({
          path: '/panel',
          query: {
            t: +new Date()
          }
        })
      })
    },
    getPanelData () { // 获取panel数据
      this.$get('visual/panel?pageNo=1&pageSize=-1').then(response => {
        if (response.code === 200) {
          this.panelData = response.data.list
        }
      })
    },
    jumpTo (data, id) {
      bus.$emit('menu-change', data)
      this.$router.push({
        path: '/' + data,
        query: {
          t: +new Date()
        }
      })
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
    updateCustomTableTitle (custom) {
      this.tools.customTableTitle = custom
      this.$refs.exploreTable.doLayout()
    },
    transformNumToLetter (num) { // 相当于26进制 获取idaddExpression
      const self = this
      let letter = ''
      const loopNum = parseInt(num / 26)
      if (loopNum > 0) {
        letter += this.transformNumToLetter(loopNum - 1)
      }
      letter += self.letter[num % 26]
      return letter
    }
  },
  watch: {
    promqlCount (n, o) {
      this.expressionChange()
    },
    showMetrics (n, o) { // 更换type后，将折叠面板都置为展开状态
      if (n !== o) {
        this.collapseValue = ['1', '2']
      }
    },
    expressions: {
      immediate: true,
      handler (n, o) {
        // if (n.length == 1 && (!n[0] || n[0] == '')) {
        //   this.showIntroduce = true
        // } else if (n.length > 1) {
        //   const temp = n.find((item, index) => {
        //     return item != ''
        //   })
        //   if (!temp) {
        //     this.showIntroduce = true
        //   } else {
        //     // this.showIntroduce = false
        //   }
        // } else {
        //   // this.showIntroduce = false
        // }
        const temp = n.some((item, index) => {
          return item != '' && this.promqlKeys[index].state
        })
        if (!temp) {
          this.showIntroduce = true
        }
      }
    }
  }
}
</script>
