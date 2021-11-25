<style lang="scss">
  @import './chart.scss';
</style>
<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-single" ref="resizeBox">
      <div class="chart-text"  :id="'logsDiv'+chartIndex" @mouseenter="caretShow=true" @mouseleave="caretShow=false">
        <loading  :ref="'localLoading'+chartIndex"></loading>
        <div class="clearfix chartTitle" :class="{'dragTitle':dragTitleShow}" :id="'chartTitle'+chartIndex">
          <el-popover
            v-if="isError"
            placement="top-start"
            :close-delay=10
            trigger="hover"
            popper-class="chart-error-popper">
            <div >{{errorContent}}</div>
            <span slot="reference" class="panel-info-corner panel-info-corner--error">
              <i class="nz-icon nz-icon-warning fa"></i>
              <span class="panel-info-corner-inner"></span>
           </span>
          </el-popover>
<!--          <span class="moreTitle">-->
<!--            <el-popover-->
<!--              v-if="seriesItem.length!==seriesItemArr.length"-->
<!--              placement="top-start"-->
<!--              :close-delay=10-->
<!--              trigger="click"-->
<!--              popper-class="chart-warring-popper">-->
<!--            <div class="moreTitle">{{$t('dashboard.panel.moreTitle')}}{{$t('dashboard.panel.showAll')}}{{seriesItem.length}}</div>-->
<!--            <span slot="reference" class="panel-info-corner panel-info-corner&#45;&#45;error"  @click="loadMore">-->
<!--              <i class="nz-icon nz-icon-warning fa"></i>-->
<!--              <span class="panel-info-corner-inner"></span>-->
<!--           </span>-->
<!--          </el-popover>-->
<!--          </span>-->
          <el-dropdown trigger="click" class="nz-chart-top" :key="'chartDropdown'+chartIndex"  v-clickoutside="clickos" :class="{'move-able':!isLock}">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <span class="el-dropdown-link chart-title">
              <span class="chart-title-text">{{chartData.name}}</span>
              <span class="chart-title-icon"  :class="{'visible':caretShow,'hidden':!caretShow}">
                <span v-if="chartData.remark">
                  <el-tooltip :content="chartData.remark" placement="top" effect="light">
                     <i class="nz-icon nz-icon-info-normal"></i>
                  </el-tooltip>
                </span>
                <span  v-has="'panel_chart_edit'" :title="$t('dashboard.refresh')" class="" @click="refreshChart">
                  <i class="nz-icon nz-icon-replay"></i>
                </span>
                 <span  @click="showAllScreen"  v-if="from !== 'chartTemp'" class="" :title="$t('dashboard.screen')">
                  <i class="nz-icon nz-icon-maxview"></i>
                 </span>
                <span><i class="el-icon-more" @click.stop="dropdownMenuShow=!dropdownMenuShow"></i></span>
              </span>
            </span>
            <ul slot="dropdown" v-show="dropdownMenuShow"  :id="'dropdownUl'+chartIndex"  class="el-dropdown-menu nz-chart-dropdown"  style="" >
              <li  @click="editChart" class="el-dropdown-menu__item">
                <i class="nz-icon nz-icon-edit" style="font-size: 16px;"></i><span>{{$t('dashboard.edit')}}</span></li>
              <li  v-has="'panel_chart_delete'" class="el-dropdown-menu__item" @click="removeChart">
                <i class="nz-icon nz-icon-delete" style="font-size: 16px;"></i>{{$t('dashboard.delete')}}</li>
              <li  v-has="'panel_chart_add'" class="el-dropdown-menu__item" @click="duplicate">
                <i class="el-icon-copy-document" style="font-size: 16px;"></i>{{$t('dashboard.duplicate')}}</li>
              <li  v-has="'panel_chart_edit'"  v-if="from !== 'chartTemp'&&chartData.pid" class="el-dropdown-menu__item" @click="$emit('sync')">
                <i class="nz-icon nz-icon-sync" style="font-size: 16px;"></i>{{$t('overall.syncChart')}}</li>
            </ul>
          </el-dropdown>
        </div>
        <div class="mt-10 rich-text-container" v-cloak  v-show="firstShow" >
          <div :id="'chartContainer'+chartIndex"  ref="chartContainer" class="logs-content" >
            <div v-if="showTab.length==2" class="show-tab-icon">
              <i class="nz-icon nz-icon-link-chart" :class="showTabActive == '1'?'is-active-icon':''" @click="showTabActive = '1'"/>
              <i class="nz-icon nz-icon-logs" :class="showTabActive == '2'?'is-active-icon':''" @click="showTabActive = '2'"/>
            </div>
            <div v-show="showTab.indexOf('1') > -1 && showTabActive == '1'" name="1" title="Graph" style="height: 100%">
              <div class="chart-room" style="height: 100%">
                <chart ref="logChart" :unit="chartUnit"></chart>
              </div>
            </div>
            <div v-show="showTab.indexOf('2') > -1 && showTabActive == '2'" name="2" title="Logs" class="logs-box">
              <log-tab ref="logDetail" v-show="!noData" :log-data="logData" :showSwitch="false" :tab-index="tabIndex" @exportLog="exportLog" @limitChange="queryLogData"></log-tab>
              <div class="chart-no-data" v-show="noData">No Data</div>
            </div>
          </div>
        </div>
        <!--全屏-->
        <el-dialog class="nz-dialog table-chart-dialog"
                   :title="$t('dashboard.panel.view')"
                   :visible.sync="screenModal"
                   width="90%"
                   @close="screenModal = false;screenLegendListMore=[]"
                   style="margin-top: 1vh !important;"
                   @opened="initDialog"
                   @closed="closeDialog"
                   :modal-append-to-body="false"
        >
          <el-popover
            v-if="isError"
            placement="top-start"
            :close-delay=10
            trigger="hover"
            popper-class="chart-error-popper">
            <div >{{errorContent}}</div>
            <span slot="reference"  class="panel-info-corner panel-info-corner--error">
                <i class="nz-icon nz-icon-warning fa-model" ></i>
                <span class="panel-info-corner-inner"></span>
            </span>
          </el-popover>
          <div slot="title" >
            <span class="nz-dialog-title">{{chartData.name}}</span>
            <div class="float-right panel-calendar dialog-tool">

              <!--              <time-picker ref="calendarPanel" class="nz-dashboard-picker" style="margin-top: -12px;"  @change="dateChange"></time-picker>-->
              <pick-time :refresh-data-func="dateChange" v-model="searchTime" :use-chart-unit="false" ref="pickTime" style="height: 28px;" id="line-chart"></pick-time>
            </div>
            <!--            <span class="float-right  dialog-tool" @click="screenRefreshChart" style="margin-right: 15px"><i class="global-active-color nz-icon nz-icon-refresh"/></span>-->
          </div>
          <div :id="'chartContainer'+chartIndex"  ref="chartContainer" class="logs-content"  >
            <div v-if="showTabScreen.length==2" class="show-tab-icon">
              <i class="nz-icon nz-icon-link-chart" :class="showTabScreenActive == '1'?'is-active-icon':''" @click="showTabScreenActive = '1'"/>
              <i class="nz-icon nz-icon-logs" :class="showTabScreenActive == '2'?'is-active-icon':''" @click="showTabScreenActive = '2'"/>
            </div>
            <div v-show="showTabScreen.indexOf('1') > -1 && showTabScreenActive == '1'" name="1" title="Graph" style="height: 100%">
              <div class="chart-room" style="height: 100%">
                <chart ref="logChartScreen" :unit="chartUnit"></chart>
              </div>
            </div>
            <div v-show="showTabScreen.indexOf('2') > -1 && showTabScreenActive == '2'" name="2" title="Logs" class="logs-box">
              <log-tab ref="logDetailScreen" v-show="!noDataScreen" :log-data="logDataScreen" :showSwitch="false" :tab-index="tabIndex" @exportLog="exportLog" @limitChange="queryLogData"></log-tab>
              <div class="chart-no-data" v-show="noDataScreen">No Data</div>
            </div>
          </div>
          <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
      </div>
      <span class="vue-resizable-handle" @mousedown="startResize" v-if="!isLock"></span>
    </div>
  </div>
</template>

<script>
import loading from '../common/loading'
import 'quill/dist/quill.snow.css'
import axios from 'axios'
import chart from '@/components/page/dashboard/overview/chart'
import logTab from '@/components/page/dashboard/explore/logTab'
import bus from '@/libs/bus'
import logsTempData from '@/components/charts/logsTempData'
import { fromRoute } from '@/components/common/js/constants'
import { dealLegendAlias } from '@/components/common/js/tools'
export default {
  name: 'logs',
  components: {
    loading: loading,
    chart,
    logTab
  },
  props: {
    chartData: {
      type: Object
    },
    // 看板id
    panelId: {
      type: Number,
      default: 0
    },
    editChartId: {
      type: String,
      default: 'editChartId'
    },
    chartIndex: {
      type: Number,
      default: 0
    },
    from: { type: String },
    startTime: {},
    endTime: {},
    isLock: { type: Boolean, default: false }
  },
  data () {
    return {
      data: {}, // 该图表信息,chartItem
      noData: false,
      noDataScreen: false,
      unit: {},
      text: '', // 保存信息
      screenText: '', // 全屏数据
      loading: Object,
      panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
      firstLoad: false, // 是否第一次加载
      screenModal: false,
      firstShow: false, // 默认不显示操作按钮,
      caretShow: false,
      dragTitleShow: false,
      dropdownMenuShow: false,
      divFirstShow: false,
      showTab: ['1', '2'],
      showTabActive: '1',
      showTabScreen: ['1', '2'],
      showTabScreenActive: '1',
      chartUnit: 2,
      logData: [],
      logDataScreen: [],
      tabIndex: 1,
      isError: false,
      errorContent: '',
      seriesItem: '',
      searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],
      oldSearchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],
      filter: {},
      stableFilter: {}
    }
  },
  created () {
  },
  computed: {},
  watch: {
    dropdownMenuShow (n) {
      this.$emit('dropmenu-change', n)
    }
  },
  methods: {
    startResize (e) {
      const vm = this
      this.$chartResizeTool.start(vm, this.data, e)
    },
    startLoading (area) {
      if (area === 'screen') {
        this.$refs['localLoadingScreen' + this.chartIndex].startLoading()
      } else {
        // this.showLoading = true;
        this.$refs['localLoading' + this.chartIndex].startLoading()
      }
    },
    endLoading (area) {
      if (area === 'screen') {
        // this.showLoadingScreen = false;
        this.$refs['localLoadingScreen' + this.chartIndex].endLoading()
      } else {
        // this.showLoading = false;
        this.$refs['localLoading' + this.chartIndex].endLoading()
      }
    },
    showLoad (chartItem) {
      this.$nextTick(() => {
        const chartBox = document.getElementById('logsDiv' + this.chartIndex)
        let height = Math.floor(chartItem.height / 10) * 10// 图表高度四舍五入
        if (height < this.minHeight) {
          height = this.minHeight
        }
        chartBox.style.height = `${height - this.chartSpaceHeight}px`
        const singleStatBox = document.getElementById('chartContainer' + this.chartIndex)
        singleStatBox.style.height = `${height - this.chartSpaceHeight - this.titleHeight}px`// -75-32
      })
      this.startLoading()
      this.divFirstShow = true
    },
    // 重新请求数据 刷新操作-local
    refreshChart () {
      this.dropdownMenuShow = false
      this.startLoading()
      this.firstShow = false
      this.$emit('on-refresh-data', this.data.id)
    },
    // 编辑图表
    editChart () {
      this.dropdownMenuShow = false
      this.$emit('on-edit-chart-block', this.data.id)
    },
    // 删除该图表
    removeChart () {
      this.dropdownMenuShow = false
      this.$emit('on-remove-chart-block', this.data.id)
    },
    clickos () {
      this.dropdownMenuShow = false
    },
    clearChart () {
      this.data = {}
    },
    duplicate () {
      this.dropdownMenuShow = false
      this.$emit('on-duplicate-chart-block', this.data.id)
    },
    // 全屏查看
    showAllScreen () {
      this.dropdownMenuShow = false
      // 初始化同步时间
      this.filter.start_time = this.stableFilter.start_time
      this.filter.end_time = this.stableFilter.end_time
      // this.searchTime = this.oldSearchTime;
      this.$set(this.searchTime, 0, this.oldSearchTime[0])
      this.$set(this.searchTime, 1, this.oldSearchTime[1])
      this.screenModal = true
      this.isGreyScreen = []
      this.$refs.pickTime.$refs.timePicker.setCustomTime(this.stableFilter)
      this.seriesItemScreen = this.seriesItem
      this.showTabScreenActive = '1'
      this.screenModal = true
    },
    resize (chartItem) {
      document.querySelector('#logsDiv' + this.chartIndex + ' .rich-text-container').style.height = `calc(100% - ${this.$chartResizeTool.titleHeight}px)`
    },
    // 设置数据, filter区分
    setData (chartItem, seriesItem, panelId, filter, area) {
      if (filter) { // 保存数据,用于同步时间
        this.stableFilter = filter
        this.searchTime[0] = filter.start_time
        this.searchTime[1] = filter.end_time
        this.oldSearchTime[0] = this.searchTime[0]
        this.oldSearchTime[1] = this.searchTime[1]
      }
      this.$nextTick(() => {
        this.resize(chartItem)
      })
      this.divFirstShow = true

      this.firstShow = true // 展示操作按键

      this.panelIdInner = panelId
      this.data = chartItem
      this.text = chartItem.param.text
      this.screenText = chartItem.param.text
      this.chartUnit = chartItem.unit
      this.endLoading()
      this.queryLogData(this.data.param.limit)
    },
    queryLogData (limit) { // log的chart和table是一个请求
      if (!limit) {
        limit = this.data.param.limit || 1000
      }
      this.expressions = this.chartData.elements.map(elements => elements.expression)
      if (this.expressions.length > 0) {
        const requestArr = []
        this.expressions.forEach((item, index) => {
          if (item != '' && this.from.trim() != fromRoute.chartTemp) {
            requestArr.push(this.$get('/logs/loki/api/v1/query_range?format=1&query=' + encodeURIComponent(item) + '&start=' + this.$stringTimeParseToUnix(this.startTime) + '&end=' + this.$stringTimeParseToUnix(this.endTime) + '&limit=' + limit))
          } else if (item != '' && this.from.trim() == fromRoute.chartTemp) {
            requestArr.push(logsTempData[index % 2])
          }
        })
        if (requestArr.length > 0) {
          this.showIntroduce = false
          this.saveDisabled = false
        }
        axios.all(requestArr).then(res => {
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
              this.noData = true
              logData.forEach(item => {
                if (item.resultType === 'streamsFormat' && item.result.length > 0) {
                  this.noData = false
                }
              })
            } else {
              if (logTabIndex > -1) {
                this.showTab.splice(logTabIndex, 1)
              }
            }
            this.showTabActive = this.showTab[0]
            this.$nextTick(() => {
              if (this.$refs.logDetail) {
                this.$refs.logDetail.time = this.chartData.param.time
                this.$refs.logDetail.wrapLines = this.chartData.param.wrapLines
                this.$refs.logDetail.operations.descending = this.chartData.param.descending
              }
              logData.forEach((item, index) => {
                item.result.forEach(result => {
                  result.elements = this.chartData.elements[index]
                })
              })
              this.logData = logData
              this.logDataScreen = logData
              hasGraph && this.loadLogGraph()
            })
          }
        }).catch(e => {
          this.isError = true
          this.errorContent = this.$t('terminallog.statusItem.unknownError')
          this.$message.error(this.$t('terminallog.statusItem.unknownError'))
        })
      }
    },
    queryLogDataScreen (limit) { // log的chart和table是一个请求
      if (!limit) {
        limit = this.data.param.limit || 1000
      }
      this.expressions = this.chartData.elements.map(elements => elements.expression)
      if (this.expressions.length > 0) {
        const requestArr = []
        this.expressions.forEach((item, index) => {
          if (item != '' && this.from.trim() != fromRoute.chartTemp) {
            requestArr.push(this.$get('/logs/loki/api/v1/query_range?format=1&query=' + encodeURIComponent(item) + '&start=' + this.$stringTimeParseToUnix(this.searchTime[0]) + '&end=' + this.$stringTimeParseToUnix(this.searchTime[1]) + '&limit=' + limit))
          } else if (item != '' && this.from.trim() == fromRoute.chartTemp) {
            requestArr.push(logsTempData[index % 2])
          }
        })
        if (requestArr.length > 0) {
          this.showIntroduce = false
          this.saveDisabled = false
        }
        axios.all(requestArr).then(res => {
          this.$refs['localLoadingScreen' + this.chartIndex].endLoading()
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
            const hasGraph = logData.some(d => d.resultType === 'matrix')
            const hasLog = logData.some(d => d.resultType === 'streamsFormat')
            const graphTabIndex = this.showTabScreen.indexOf('1')
            if (hasGraph) {
              if (graphTabIndex === -1) {
                this.showTabScreen.push('1')
              }
            } else {
              if (graphTabIndex > -1) {
                this.showTabScreen.splice(graphTabIndex, 1)
              }
            }
            const logTabIndex = this.showTabScreen.indexOf('2')
            if (hasLog) {
              if (logTabIndex === -1) {
                this.showTabScreen.push('2')
              }
              this.noDataScreen = true
              logData.forEach(item => {
                if (item.resultType === 'streamsFormat' && item.result.length > 0) {
                  this.noDataScreen = false
                }
              })
            } else {
              if (logTabIndex > -1) {
                this.showTabScreen.splice(logTabIndex, 1)
              }
            }
            this.showTabScreenActive = this.showTabScreen[0]
            this.$nextTick(() => {
              if (this.$refs.logDetail) {
                this.$refs.logDetail.time = this.chartData.param.time
                this.$refs.logDetail.wrapLines = this.chartData.param.wrapLines
                this.$refs.logDetail.operations.descending = this.chartData.param.descending
              }
              logData.forEach((item, index) => {
                item.result.forEach(result => {
                  result.elements = this.chartData.elements[index]
                })
              })
              this.logDataScreen = logData
              hasGraph && this.loadLogGraphScreen()
            })
          }
        }).catch(e => {
          this.isError = true
          this.errorContent = this.$t('terminallog.statusItem.unknownError')
          // this.$message.error(this.$t('terminallog.statusItem.unknownError'))
        })
      }
    },
    loadLogGraph () {
      const graphData = this.logData.filter(l => l.resultType === 'matrix')
      if (graphData && graphData.length > 0) {
        this.$refs.logChart.startLoading()
        const queryExpression = []
        let series = []
        const legend = []
        this.expressions.forEach((item, index) => {
          if (item !== '') {
            queryExpression.push(item)
          }
        })
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
              seriesItem.data = result.values.map((item) => {
                return [item[0] * 1000, item[1]]
              })
              let host = ''// up,
              let alias = ''
              if (result.metric && Object.keys(result.metric).length > 0) {
                const metric = Object.keys(result.metric)
                if (metric.__name__) {
                  host = `${metric.__name__}{`// up,
                }
                metric.forEach((tag, i) => {
                  if (tag !== '__name__') {
                    host += `${tag}="${result.metric[tag]}",`
                  }
                })
                if (host.endsWith(',')) {
                  host = host.substr(0, host.length - 1)
                }
                if (metric.__name__) {
                  host += '}'
                }
                // 处理legend别名
                alias = dealLegendAlias(host, this.chartData.elements[index].legend)
                if (!alias || alias === '') {
                  alias = host
                }
              } else {
                alias = queryExpression[index]
              }
              seriesItem.name = alias + '-' + index
              series.push(seriesItem)
              legend.push({ name: seriesItem.name, alias: alias, isGray: false })
            })
          }
        })
        this.$refs.logChart.setLegend(legend)
        this.$refs.logChart.setRandomColors(series.length)
        if (!series.length) {
          series = ''
        }
        this.$refs.logChart.setSeries(series)
        this.defaultChartVisible = true
        this.$nextTick(() => {
          this.$refs.logChart.endLoading()
        })
      }
    },
    loadLogGraphScreen () {
      const graphData = this.logDataScreen.filter(l => l.resultType === 'matrix')
      if (graphData && graphData.length > 0) {
        this.$refs.logChartScreen.startLoading()
        const queryExpression = []
        let series = []
        const legend = []
        this.expressions.forEach((item, index) => {
          if (item !== '') {
            queryExpression.push(item)
          }
        })
        this.logDataScreen.forEach((response, index) => {
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
              seriesItem.data = result.values.map((item) => {
                return [item[0] * 1000, item[1]]
              })
              let host = ''// up,
              let alias = ''
              if (result.metric && Object.keys(result.metric).length > 0) {
                const metric = Object.keys(result.metric)
                if (metric.__name__) {
                  host = `${metric.__name__}{`// up,
                }
                metric.forEach((tag, i) => {
                  if (tag !== '__name__') {
                    host += `${tag}="${result.metric[tag]}",`
                  }
                })
                if (host.endsWith(',')) {
                  host = host.substr(0, host.length - 1)
                }
                if (metric.__name__) {
                  host += '}'
                }
                // 处理legend别名
                alias = dealLegendAlias(host, this.chartData.elements[index].legend)
                if (!alias || alias === '') {
                  alias = host
                }
              } else {
                alias = queryExpression[index]
              }
              seriesItem.name = alias + '-' + index
              series.push(seriesItem)
              legend.push({ name: seriesItem.name, alias: alias, isGray: false })
            })
          }
        })
        this.$refs.logChartScreen.setLegend(legend)
        this.$refs.logChartScreen.setRandomColors(series.length)
        if (!series.length) {
          series = ''
        }
        this.$refs.logChartScreen.setSeries(series)
        this.defaultChartVisible = true
        this.$nextTick(() => {
          this.$refs.logChartScreen.endLoading()
          this.$refs.logChartScreen.resize()
        })
      }
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
    dateChange (time) {
      this.filter.start_time = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss')
      this.filter.end_time = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss')
      // this.echartModalStore.clear()
      this.showLegend = false
      this.$refs['localLoadingScreen' + this.chartIndex].startLoading()
      this.queryLogDataScreen()
    },
    initDialog () {
      this.queryLogDataScreen(this.data.param.limit)
    },
    closeDialog () {}
  },
  mounted () {
    this.firstLoad = false
  },
  beforeDestroy () {
    this.clearChart()
  }
}
</script>
<style scoped>
  .chartTitle{
    position: relative;
    z-index: 1;
  }
  .logs-content{
    width: calc(100% - 20px);
    height: calc(100% - 20px);
    padding: 10px;
    position: relative;
  }
  .show-tab-icon{
    position: absolute;
    top: 0;
    left: 10px;
    display: block;
    z-index: 10;
  }
  .show-tab-icon .nz-icon{
    cursor: pointer;
    padding: 0 5px;
  }
  .show-tab-icon .nz-icon.is-active-icon{
    /*color: #FA901C;*/
    color: #BDE3FD;
  }
  .logs-content:hover .show-tab-icon{

  }
  /deep/ .chart-no-data{
    width: calc(100% - 30px);
  }
  /deep/ .log-detail .log-table .nz-table2 {
    padding: 0;
  }
  .logs-box{
    overflow-y: auto;height: calc(100% - 15px);margin-top: 10px
  }
</style>
