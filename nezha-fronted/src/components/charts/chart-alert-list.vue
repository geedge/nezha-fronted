<style lang="scss">
  @import './chart.scss';
</style>
<template>
  <div class="nz-chart-resize" :id="id">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-alert" ref="resizeBox">
      <div class="chart-alert-info table-container" :id="'chartTableDiv'+chartIndex" @mouseenter="caretShow=true" @mouseleave="caretShow=false">
        <loading :ref="'localLoading'+chartIndex"></loading>
        <div v-if="showTitle" class="clearfix chartTitle" :class="{'dragTitle':dragTitleShow, 'drag-disabled': !data.draggable}" :id="'chartTitle'+chartIndex" v-show="!isPreview">
          <el-popover
            v-if="isError"
            :close-delay=10
            placement="top-start"
            trigger="hover"
            popper-class="chart-error-popper">
            <div >{{errorContent}}</div>
            <span slot="reference" class="panel-info-corner panel-info-corner--error">
              <i class="nz-icon nz-icon-warning fa"></i>
              <span class="panel-info-corner-inner"></span>
            </span>
          </el-popover>
          <el-dropdown trigger="click" class="nz-chart-top" :key="'chartDropdown'+chartIndex"  v-clickoutside="clickos" :class="{'move-able':!isLock}">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <span class="el-dropdown-link chart-title">
<!--              <span class="chart-title-text">{{chartData?chartData.name:'-'}}</span>-->
              <span class="chart-title-text" v-on:mouseover="changeActive()" :mouseout="removeActive()">{{chartData?chartData.name:'-'}}</span>
              <transition  name="el-fade-in-linear">
                <span v-show="chartDataList" class="chart-title-pit" >{{chartData.name}}</span>
              </transition>
              <span class="chart-title-icon"  :class="{'visible':caretShow,'hidden':!caretShow}">
                <span v-if="chartData&&chartData.remark">
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
              <li  v-has="'panel_chart_edit'"  v-if="from !== 'chartTemp'&&chartData&&chartData.pid" class="el-dropdown-menu__item" @click="$emit('sync')">
                <i class="nz-icon nz-icon-sync" style="font-size: 16px;"></i>{{$t('overall.syncChart')}}</li>
            </ul>
          </el-dropdown>
        </div>
        <div class="mt-10 table-container nz-table2" v-cloak  v-show="firstShow || isPreview" :style="isPreview?'height:100%':''">
          <alertMessageTable
            :id="'tableContainer'+chartIndex"
            :tableData="storedTableData"
            :loading="loadingTable"
            :height="'calc(100% - 46px)'"
            :customTableTitle="tableTitle"
            :tableId="''"
            :detailList="false"
            :projectAlertId="'tableContainer'+chartIndex"
            @tableDataSort="tableDataSort"
            @del="deleteMessage"
            @showText="showText"
            @addSilence="addSilence"
            @messageDetail="messageDetail"
            ref="alertListTable"
            :form="'chartList'"
            :fromPath="'/alertList'"
            style="height: calc(100% - 50px)"
            :showTopBtn="false"
          ></alertMessageTable>
          <Pagination :pageObj="pageObj" @pageNo='pageNo'  @pageSize='pageSize' ref="Pagination" :append-to-body="false" pop-class="out-popper-fix" style="margin-top: 15px;"></Pagination>
        </div>
        <!--全屏-->
        <el-dialog class="nz-dialog table-chart-dialog" id="dialog-alert-massage" :title="$t('dashboard.panel.view')"  :visible.sync="screenModal" width="96%"  @close="screenDialogClose" :modal-append-to-body="false">
          <div slot="title">
            <span class="nz-dialog-title">{{data.name}}</span>
            <div class="float-right panel-calendar dialog-tool">
              <pick-time :refresh-data-func="dateChange" v-model="searchTime" :show-time-picker="false" :use-chart-unit="false" ref="pickTime" style="height: 28px;" id="alert-chart"></pick-time>
            </div>
<!--            <span class="float-right  dialog-tool" @click="screenRefreshChart"><i class="global-active-color nz-icon nz-icon-refresh"/></span>-->
          </div>
          <alertMessageTable
            :id="'tableContainerScreen'+chartIndex"
            :tableData="storedScreanTableData"
            :detailList="false"
            :loading="loadingTable"
            :height="'calc(100% - 20px)'"
            :customTableTitle="tableTitle"
            :tableId="''"
            :projectAlertId="'tableContainer'+chartIndex"
            @tableDataSort="tableDataSort"
            @del="deleteMessage"
            @messageDetail="messageDetail"
            ref="alertListScreenTable"
            :form="'chartList'"
            :fromPath="'/alertList'"
            style="height: calc(100% - 50px)"
            :showOption="false"
            :chart-alert-list="true"
          ></alertMessageTable>
          <Pagination :pageObj="screenPageObj"  @pageNo='screenPageNo' @pageSize='screenPageSize' ref="screenPagination" ></Pagination>
          <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
        <div class="export-xlsx">
          <el-dialog :visible.sync="deleteBox.show" :title="$t('overall.delete')" :modal-append-to-body='false' :show-close="true" width="300px" @close="closeDialog" class="nz-message">
            <div class="upload-body">
              <el-input type="textarea" :placeholder="$t('overall.remark')" v-model="deleteBox.remark"></el-input>
              <div style="text-align: right; margin-top: 10px;">
                <button @click="closeDialog" class="el-button el-button--default el-button--small" >
                  <span>{{$t('tip.no')}}</span>
                </button>
                <button @click="deleteMessage" class="el-button el-button--default el-button--small el-button--primary">
                  <span>{{$t('tip.yes')}}</span>
                </button>
              </div>
            </div>
          </el-dialog>
        </div>
        <el-dialog class="line-chart-block-modal nz-dialog endpoint-dialog"
                   :title="$t('overall.detail')"
                   :visible.sync="graphShow"
                   width="90%"
                   :append-to-body="true"
                   id="viewGraphDialog"
                   @close="dialogClose" :modal-append-to-body="false">
          <div slot="title">
            {{$t("project.endpoint.dialogTitle")}}
            <div class="float-right panel-calendar dialog-tool" style="display: flex">
              <pick-time :refresh-data-func="queryDate" :use-refresh="true" :use-chart-unit="false" v-model="searchTimeDialog" style="height: 28px;" id="alert-sub-chart"></pick-time>
            </div>
          </div>
          <div style="width: 100%;height: 100%" v-loading="chartLoading">
            <chart v-if="resultType === 'matrix'" ref="messageChart" :unit="chartUnit" name="alertMessageChart"></chart>
            <log-tab v-if="resultType === 'streamsFormat'" ref="logDetailScreen" :log-data="logData" :showSwitch="false" :tab-index="tabIndex" @exportLog="exportLog" @limitChange="queryLogData"></log-tab>
          </div>
        </el-dialog>
        <!--全屏-->
        <el-dialog class="nz-dialog table-chart-dialog" :title="$t('alert.config.trbShot')"
                   :visible.sync="dialogShowText"
                   width="96%"  @close="dialogShowText = false" :modal-append-to-body="false">
          <div slot="title">
            <span class="nz-dialog-title">{{$t('alert.config.trbShot')}}</span>
          </div>
          <div class="rich-text-screen-container"  >
            <div id="chartScreenContainer"  ref="chartScreenContainer" class="text-content" >
              <el-scrollbar style="height: 100%;" class="el-scrollbar-normal">
                <div style="height: 100%;" v-html="dialogText" ></div>
              </el-scrollbar>
            </div>
          </div>
        </el-dialog>
      </div>
      <span class="vue-resizable-handle" @mousedown="startResize" v-if="!isPreview && data.resizable&&!isLock"></span>
    </div>
    <transition name="right-box"><alert-silence-box v-if='silenceBoxShow' :alert-silence="objectSilence" @close="closeSilenceBox"></alert-silence-box></transition>
  </div>
</template>

<script>
import bus from '../../libs/bus'
import chartDataFormat from './chartDataFormat'
import loading from '../common/loading'
import axios from 'axios'
import pickTime from '../common/pickTime'
import chart from '../page/dashboard/overview/chart'
import alertMessageTable from '@/components/common/table/alert/alertMessageTable.vue'
import chartDataList from '@/components/common/mixin/chartDataList'
import alertSilenceBox from '@/components/common/rightBox/alertSilenceBox'
export default {
  name: 'chartTable',
  components: {
    loading: loading,
    chart: chart,
    'pick-time': pickTime,
    alertMessageTable: alertMessageTable,
    alertSilenceBox
  },
  props: {
    // 看板id
    panelId: {
      type: Number,
      default: 0
    },
    showTitle: {
      type: Boolean,
      default: true
    },
    editChartId: {
      type: String,
      default: 'editChartId'
    },
    chartIndex: {
      type: Number,
      default: 0
    },
    chartInfo: {},
    chartData: {},
    id: { type: String },
    from: { type: String },
    isLock: { type: Boolean, default: false }
  },
  mixins: [chartDataList],
  data () {
    return {
      currentMsg: null,
      silenceBoxShow: false,
      tableHeight: 0,
      data: {}, // 该图表信息,chartItem
      unit: {},
      isError: false,
      errorContent: '',
      pageObj: {
        pageNo: 1,
        pageSize: this.$CONSTANTS.defaultPageSize,
        total: 0
      },
      loadingTable: false, // 表格数据加载loading
      screenPageObj: {
        pageNo: 1,
        pageSize: this.$CONSTANTS.defaultPageSize,
        total: 0
      },
      storedTableData: [],
      requestIndex: 0,
      storedScreanTableData: [],
      images: '',
      // toolbox: false,
      loading: Object,
      panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
      firstLoad: false, // 是否第一次加载
      // showLoading:true,
      // showLoadingScreen:false,
      // showTable:true,
      chartType: 'alertLIst', // 图表类型
      screenModal: false,
      // 查询数据使用
      filter: {
        start_time: '',
        end_time: ''
      },
      stableFilter: {}, // 保存数据使用,初始化起止时间,单图or多图等
      firstShow: false, // 默认不显示操作按钮,
      caretShow: false,
      dragTitleShow: false,
      dropdownMenuShow: false,
      minHeight: 200,
      chartSpaceHeight: 5, // top-border: 1,bottom-border: 1,padding-bottome:3
      titleHeight: 38, // title-height:28,magrin-bottom:10
      pageHeight: 40,
      divFirstShow: false,
      searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()], // 全屏显示的时间
      oldSearchTime: [],
      searchLabel: {},
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 160
        }, {
          label: this.$t('alert.alertName'),
          prop: 'alertRule',
          show: true
        }, {
          label: this.$t('alert.list.labels'),
          prop: 'labels',
          show: true,
          NotSet: true,
          minWidth: 250
        }, {
          label: this.$t('alert.severity'),
          prop: 'severityId',
          show: true,
          width: 110
        }, {
          label: this.$t('alert.summary'),
          prop: 'summary',
          show: true,
          minWidth: 200
        }, {
          label: this.$t('overall.remark'),
          prop: 'description',
          show: true,
          minWidth: 200
        }, {
          label: this.$t('alert.list.state'),
          prop: 'state',
          show: true,
          width: 100
        }, {
          label: this.$t('alert.startAt'),
          prop: 'startAt',
          show: true,
          width: 150
        }, {
          label: this.$t('config.terminallog.duration'),
          prop: 'duration',
          show: true,
          width: 150
        }, {
          label: this.$t('alert.endAt'),
          prop: 'endAt',
          show: true,
          width: 160
        }
      ],
      tablelable: [],
      dropCol: [],
      toTopBtnTop: this.$tableHeight.toTopBtnTop, // to-top按钮的top属性
      tableHover: false, // 控制滚动条和top按钮同时出现
      showTopBtn: false,
      graphShow: false,
      chartDatas: [],
      searchTimeDialog: [],
      chartUnit: 5,
      deleteBox: { show: false, ids: '', remark: '', state: 2 },
      isPreview: false,
      ps: null,
      resultType: '',
      logData: [],
      chartLoading: false,
      dialogShowText: false,
      dialogText: '',
      blankSilenceObject: {
        id: '',
        startAt: '',
        endAt: '',
        ruleId: '',
        type: 'asset',
        linkId: '',
        remark: '',
        time: [],
        matchers: [
          { name: '', value: '', regex: 0 }
        ],
        name: ''
      },
      objectSilence: {}
    }
  },
  computed: {
    tagType () {
      return (key) => {
        if (key == 'asset' || key == 'module' || key == 'project' || key == 'datacenter' || key == 'endpoint') {
          return 'normal'
        } else {
          return 'info'
        }
      }
    },
    tagValue () {
      return (key, value) => {
        if (key == 'type') {
          if (value == 1) {
            value = this.$t('project.project.projectName')
          } else if (value == 2) {
            value = this.$t('module.module.module')
          } else if (value == 3) {
            value = this.$t('asset.asset')
          }
        }
        return key + '：' + value
      }
    }
  },
  watch: {
    chartInfo: {
      deep: true,
      immediate: true,
      handler (n, o) {
        if (n.id) {
          if (!n.param.state && n.param.state != Number) {
            n.param.state = '1'
          }
          if (n.param.severity && n.param.severity != Number) {
            n.param.severity = 1
          }
        }
        this.data = Object.assign({}, n)
      }
    },
    panelId: {
      immediate: true,
      handler (n, o) {
        this.panelIdInner = n
      }
    },
    dropdownMenuShow (n) {
      this.$emit('dropmenu-change', n)
    }
  },
  methods: {
    startResize (e) {
      const vm = this
      this.$chartResizeTool.start(vm, this.data, e)
    },
    formatThreshold (value, unit) {
      const unitMethod = chartDataFormat.getUnit(unit)
      if (unitMethod && value) {
        return unitMethod.compute(value, null, 2)
      } else {
        return value
      }
    },
    computeDistance (str) {
      let width = 0
      const html = document.createElement('span')
      html.innerText = str
      html.className = 'getTextWidth'
      document.querySelector('body').appendChild(html)
      width = document.querySelector('.getTextWidth').offsetWidth
      document.querySelector('.getTextWidth').remove()
      return Number('-' + (width + 5))
    },
    returnMarkArea () {
      if (this.currentMsg) {
        if (this.currentMsg.alertRule.operator == '>' || this.currentMsg.alertRule.operator == '>=') {
          return [{ yAxis: this.currentMsg.alertRule.threshold }, {}]
        } else {
          return [{}, { yAxis: this.currentMsg.alertRule.threshold }]
        }
      }
    },
    detail (obj) {
      this.chartDatas = []
      this.legend = []
      this.graphShow = true
      this.currentMsg = obj
      this.chartUnit = obj.alertRule.unit ? obj.alertRule.unit : 5
      this.$nextTick(() => {
        this.queryDate()
      })
    },
    dialogClose () {
      this.graphShow = false
    },
    closeDialog () {
      this.importBox.show = false
      this.deleteBox.show = false
    },
    screenDialogClose () {
      this.screenModal = false
      this.deleteBox.ids = []
      this.$refs.alertListScreenTable.$refs.dataTable.clearSelection()
    },
    selectChange (s) {
      const ids = []
      this.deleteBox.ids = ''
      s.forEach(item => {
        ids.push(item.id)
      })
      this.deleteBox.ids = ids.join(',')
    },
    deleteMessage (row) {
      const self = this
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('alert/message' + '?ids=' + row.id + '&state=3').then(response => {
          if (response.code === 200) {
            self.delFlag = true
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            self.getAlertList()
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    chartUnitChange (unit) {
      this.chartUnit = unit
      this.$nextTick(() => {
        this.queryDate()
      })
    },
    messageDetail (row) {
      if (row.alertRule.type == 3) {
        return
      }
      this.$get('/alert/rule/' + row.alertRule.id).then(res => {
        this.currentMsg = { ...row, alertRule: { ...res.data } }
        this.graphShow = true
        this.$nextTick(() => {
          this.queryDate()
        })
      })
    },
    queryChartDate () {
      const $temp = this
      const start = this.searchTime[0] ? this.searchTime[0] : bus.computeTimezoneTime(new Date().getTime() - 1 * 60 * 60 * 1000)
      const end = this.searchTime[1] ? this.searchTime[1] : bus.computeTimezoneTime(new Date().getTime())
      this.searchTimeDialog = [start, end]
      const timeDiff = (new Date(end).getTime() - new Date(start).getTime()) / 1000 / (24 * 60 * 60)
      let step = '15s'
      if (timeDiff < 1) {
        step = '15s'
      } else if (timeDiff < 7) {
        step = '5m'
      } else if (timeDiff < 30) {
        step = '10m'
      } else {
        step = '30m'
      }
      if (this.$refs.messageChart) {
        this.$refs.messageChart.startLoading()
      }
      const axiosArr = []
      const paramStr = this.currentMsg ? JSON.stringify(this.promQueryParamConvert(this.currentMsg)) : null
      if (paramStr && paramStr.trim() != '""') {
        axiosArr.push(axios.get('/prom/api/v1/query_range?query=' + encodeURIComponent(this.currentMsg.alertRule.expr.replace(/\"/g, '\'').replace(/\r|\n+/g, '')) + '&start=' + this.$stringTimeParseToUnix(start) + '&end=' + this.$stringTimeParseToUnix(end) + '&step=' + step + '&filter=' + encodeURIComponent(decodeURIComponent(this.promQueryParamLabels(this.currentMsg.labels)))))
        this.legend = []
        this.chartDatas = []
        axios.all(axiosArr).then(res => {
          this.chartLoading = false
          try {
            res.forEach((response, promIndex) => {
              if (response.status == 200) {
                if (response.data.status == 'success') {
                  const queryData = response.data.data.result[0]
                  if (queryData) {
                    const chartData = {
                      type: 'line',
                      symbol: 'none', // 去掉点
                      smooth: 0.2, // 曲线变平滑
                      name: '',
                      lineStyle: {
                        width: 1,
                        opacity: 0.9
                      },
                      markLine: {
                        silent: true,
                        symbol: ['circle', 'circle'],
                        label: {
                          distance: this.computeDistance(chartDataFormat.getUnit(this.currentMsg.alertRule.unit ? this.currentMsg.alertRule.unit : 2).compute(this.currentMsg.alertRule.threshold)),
                          formatter (params) {
                            return chartDataFormat.getUnit($temp.currentMsg.alertRule.unit ? $temp.currentMsg.alertRule.unit : 2).compute(params.value)
                          }
                        },
                        lineStyle: {
                          color: '#d64f40',
                          width: 2,
                          type: 'dotted'
                        },
                        data: [{
                          yAxis: Number(this.currentMsg.alertRule.threshold)
                        }]
                      },
                      markArea: {
                        itemStyle: {
                          color: '#d64f40',
                          opacity: 0.1
                        },
                        data: [
                          this.returnMarkArea()
                        ]
                      }
                    }
                    chartData.name += '{'
                    let alias = chartData.name
                    alias += '{'
                    Object.keys(queryData.metric).forEach((item, index) => {
                      const label = item
                      const value = queryData.metric[label]
                      chartData.name += label + "='" + value + "',"
                    })
                    chartData.name = chartData.name.charAt(chartData.name.length - 1) == ',' ? chartData.name.substr(0, chartData.name.length - 1) : chartData.name
                    chartData.name += '}'
                    const legend = {
                      name: chartData.name,
                      alias: alias,
                      isGray: false
                    }
                    this.legend.push(legend)
                    chartData.data = queryData.values.map((dpsItem, dpsIndex) => {
                      return [bus.computeTimezone(dpsItem[0]) * 1000, parseFloat(dpsItem[1]).toFixed(2)]
                    })
                    this.chartDatas.push(chartData)
                  }
                } else {
                  this.$message.error(response.data.error)
                  console.error(response.data)
                }
              }
            })
            this.$nextTick(() => {
              this.$refs.messageChart.setRandomColors(this.chartDatas.length)
              this.$refs.messageChart.setLegend(this.legend)
              this.$refs.messageChart.setSeries(this.chartDatas)
              this.$refs.messageChart.endLoading()
            })
          } catch (err) {
            this.$message.error(err)
            this.$refs.messageChart.endLoading()
          }
        })
      }
    },
    getAlertList (filterType, isPreview = false, chartInfo) {
      this.resize()
      this.loadingTable = true
      this.isPreview = isPreview
      const queryParam = {
        pageSize: this.pageObj.pageSize,
        pageNo: this.pageObj.pageNo
      }
      let chart
      if (chartInfo) {
        chart = Object.assign({}, chartInfo)
      } else {
        chart = Object.assign({}, this.chartInfo)
      }
      if (chart && chart.param) { // 按照粒度，project>module>endpoint  查询只传最细粒度
        const param = chart.param
        if (param.endpointId) {
          queryParam.endpointIds = param.endpointId
        } else {
          if (param.moduleId) {
            queryParam.moduleIds = param.moduleId
          } else {
            if (param.projectId) {
              queryParam.projectIds = param.projectId
            }
          }
        }

        if (param.ruleId) {
          queryParam.ruleIds = param.ruleId
        }
        if (param.severity) {
          queryParam.severityIds = param.severity
        }
        if (param.state) {
          queryParam.state = param.state
        }
      }
      if (this.searchLabel.orderBy) {
        queryParam.orderBy = this.searchLabel.orderBy
      }
      // this.startLoading(filterType);
      this.$get('/alert/message', queryParam).then(response => {
        if (response.code === 200) {
          this.storedTableData = response.data.list
          this.storedScreanTableData = JSON.parse(JSON.stringify(response.data.list))
          this.pageObj.total = response.data.total
          this.isError = false
          this.errorContent = ''
          this.divFirstShow = true

          this.firstShow = true // 展示操作按键
          this.loadingTable = false
          this.endLoading(filterType)
        } else {
          this.isError = true
          this.errorContent = response.msg
        }
      })
    },
    getAlerScreetList (filterType, isPreview = false, chartInfo) {
      this.resize()
      this.loadingTable = true
      this.isPreview = isPreview
      const queryParam = {
        pageSize: this.screenPageObj.pageSize,
        pageNo: this.screenPageObj.pageNo
      }
      let chart
      if (chartInfo) {
        chart = Object.assign({}, chartInfo)
      } else {
        chart = Object.assign({}, this.chartInfo)
      }
      if (chart && chart.param) { // 按照粒度，project>module>endpoint  查询只传最细粒度
        const param = chart.param
        if (param.endpointId && param.endpointId != '') {
          queryParam.endpointIds = param.endpointId
        } else {
          if (param.moduleId && param.moduleId != '') {
            queryParam.moduleIds = param.moduleId
          } else {
            if (param.projectId && param.projectId != '') {
              queryParam.projectIds = param.projectId
            }
          }
        }

        if (param.ruleId && param.ruleId != '') {
          queryParam.ruleIds = param.ruleId
        }
        if (param.severity && param.severity != '') {
          queryParam.severityIds = param.severity
        }
        if (param.state && param.state != '') {
          queryParam.state = param.state
        }
      }
      if (this.searchLabel.orderBy) {
        queryParam.orderBy = this.searchLabel.orderBy
      }
      this.startLoading(filterType)
      this.$get('/alert/message', queryParam).then(response => {
        if (response.code == 200) {
          this.storedTableData = response.data.list
          this.storedScreanTableData = JSON.parse(JSON.stringify(response.data.list))
          const axiosAll = []
          this.$nextTick(() => {
            this.storedScreanTableData.forEach((item) => {
              item.labels = JSON.parse(item.labels)
              if (item.alertRule.buildIn !== 1) {
                const paramStr = JSON.stringify(this.promQueryParamConvert(item))
                axiosAll.push(axios.get('/prom/api/v1/query?query=' + paramStr.substring(1, paramStr.length - 1)))
              } else {
                axiosAll.push('')
              }
            })
            axios.all(axiosAll).then(res => {
              res.forEach((item, index) => {
                let current = []
                const response2 = item.data
                if (response2.data && response2.data.result && response2.data.result.length > 0) {
                  current = response2.data.result[0].value.map((item, i) => {
                    if (i == 0) {
                      return bus.computeTimezone(item)
                    } else {
                      return parseFloat(item).toFixed(2)
                    }
                  })
                } else {
                  current = [null, null]
                }
                this.storedScreanTableData[index].current = current
              })
              this.$set(this.storedScreanTableData, [...this.storedScreanTableData])
            })
          })
          this.screenPageObj.total = response.data.total
          this.isError = false
          this.errorContent = ''
          this.divFirstShow = true

          this.firstShow = true // 展示操作按键
          this.loadingTable = false
          this.endLoading(filterType)
        } else {
          this.isError = true
          this.errorContent = response.msg
        }
      })
    },
    screenRefreshChart () {
      this.getAlerScreetList()
    },
    promQueryParamConvert (obj) {
      let r = '(' + obj.alertRule.expr.replace(/\"/g, '\'').replace(/\r|\n+/g, '') + ')'
      let intoLabels = false
      obj.labels = JSON.parse(obj.labels)
      if (Object.keys(obj.labels).length > 0) {
        r += (function () {
          let group = ' and ' + '(group({'
          let by = ' by ('

          for (const k in obj.labels) {
            if (k != 'alertname' && k != 'severity' && k != 'severity_id' && k != 'rule_type') {
              intoLabels = true
              group += k
              group += '='
              group += ("'" + obj.labels[k] + "',")
              by += k
              by += ','
            }
          }
          if (intoLabels) {
            group = group.substring(0, group.length - 1)
            by = by.substring(0, by.length - 1)
            group += '})'
            by += ')'
            return group + by + ')'
          } else {
            return ''
          }
        }())
      }
      return r
    },
    promQueryParamLabels (labels) {
      const obj = labels.constructor === Object ? labels : JSON.stringify(labels)
      const filterArr = ['alertname', 'severity_id', 'severity', 'rule_type']
      filterArr.forEach(key => {
        delete obj[key]
      })
      return JSON.stringify(obj)
    },
    elementsetShow (s, e) {
      const eventfixed = {
        shezhi: 0,
        screen: 0
      }
      eventfixed[s] = 1
      e.preventDefault()
      this.$store.commit('setHeaderTable', this.tablelable)
      this.$store.commit('setEventfixed', eventfixed)
      const h = document.documentElement.clientHeight
      const w = document.documentElement.clientWidth
      const dw = this.$refs.elementset.$el.offsetWidth
      const dh = this.$refs.elementset.$el.offsetHeight
      const positionx =
          e.clientX + dw <= w - 10 ? e.clientX + 14 : e.clientX + 14 - dw
      const positiony =
          e.clientY + dh <= h - 10
            ? e.clientY + 20
            : e.clientY + 20 - (e.clientY + dh - h)
      this.$store.commit('setPosition', { positionx, positiony })
    },
    elementsetHide () {
      // 悬浮点击空白隐藏
      this.$refs.elementset.elementsetHide()
    },
    tablelabelEmit (data) {
      // 获取子组件传过来的参数
      this.$store.commit('setHeaderTable', data)
      this.tablelable = data
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.getAlertList()
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      this.getAlertList()
    },

    screenPageNo (val) {
      this.screenPageObj.pageNo = val
      this.getAlerScreetList()
    },
    screenPageSize (val) {
      this.screenPageObj.pageSize = val
      this.getAlerScreetList()
    },
    startLoading (area) {
      if (area === 'showFullScreen') {
        // this.showLoadingScreen = true;
        this.$refs['localLoadingScreen' + this.chartIndex].startLoading()
      } else {
        // this.showLoading = true;
        this.$refs['localLoading' + this.chartIndex].startLoading()
      }
    },
    endLoading (area) {
      if (area === 'showFullScreen') {
        // this.showLoadingScreen = false;
        this.$refs['localLoadingScreen' + this.chartIndex].endLoading()
      } else {
        // this.showLoading = false;
        this.$refs['localLoading' + this.chartIndex].endLoading()
      }
    },
    resize (chartItem) {
      const deHeight = this.$chartResizeTool.titleHeight + this.$chartResizeTool.chartTableBlankHeight
      // const container = document.querySelector('#chartTableDiv' + this.chartIndex + ' .table-container')
      // container.style.height = `calc(100% - ${deHeight}px)`
      this.tableHeight = 'calc(100% - 34px)'
    },
    showLoad (chartItem) {
      // 设置高度 chart-table
      this.$nextTick(() => {
        this.resize(chartItem)
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
    // 全屏时间条件查询
    dateChange (time) {
      // this.filter.start_time = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss');
      // this.filter.end_time = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss');
      // this.showTable = false;
      this.seriesItemScreen = []
      for (let i = 0; i < 8; i++) {
        this.seriesItemScreen.push({ // 表格数据
          // label: '',//label
          // metric: '',//metric列
          element: '',
          time: '', // 采集时间
          value: ''// 数值
        })
      }
      // this.startLoading('screen');
      // this.tableLoading = true;
      // this.firstShow = false;
      this.$emit('on-search-data', this.data.id, this.searchTime)
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
      // this.storedScreanTableData = this.storedTableData
      this.storedScreanTableData = JSON.parse(JSON.stringify(this.storedTableData))
      this.screenModal = true
      this.deleteBox.ids = []
      // this.$refs.alertListTable.$refs.alertListTable.clearSelection()
      // this.$refs.alertListScreenTable.$refs.dataTable.clearSelection()
      this.screenPageObj = { ...this.pageObj }
      if (this.$refs.screenPagination && this.$refs.screenPagination.pageSize) {
        this.$refs.screenPagination.pageSize = this.screenPageObj.pageSize
      }
    },
    // 设置数据, filter区分
    setData (chartItem, seriesItem, panelId, filter, area, errorMsg) {
      // console.info(chartItem,title)
    },
    // 数据排序
    tableDataSort (item) {
      let orderBy = ''
      if (item.order === 'ascending') {
        orderBy = item.prop
      }
      if (item.order === 'descending') {
        orderBy = '-' + item.prop
      }
      this.$set(this.searchLabel, 'orderBy', orderBy)
      this.getAlertList()
    },
    queryDate () {
      this.chartLoading = true
      if (this.currentMsg.alertRule.type === 1) {
        this.resultType = 'matrix'
        this.$nextTick(() => {
          this.queryChartDate()
        })
      } else if (this.currentMsg.alertRule.type === 2) {
        this.queryLogData(1000)
      }
    },
    exportLog ({ limit, descending }) {
      const start = this.searchTimeDialog[0] ? this.searchTimeDialog[0] : bus.computeTimezoneTime(new Date().getTime() - 1 * 60 * 60 * 1000)
      const end = this.searchTimeDialog[1] ? this.searchTimeDialog[1] : bus.computeTimezoneTime(new Date().getTime())
      const params = {
        logql: this.expressions,
        start: start,
        end: end,
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
      if (!limit) {
        limit = 1000
      }
      const start = this.searchTimeDialog[0] ? this.searchTimeDialog[0] : bus.computeTimezoneTime(new Date().getTime() - 1 * 60 * 60 * 1000)
      const end = this.searchTimeDialog[1] ? this.searchTimeDialog[1] : bus.computeTimezoneTime(new Date().getTime())
      this.expressions = [this.currentMsg.alertRule.expr]
      this.$get('/logs/loki/api/v1/query_range?format=1&query=' + encodeURIComponent(this.currentMsg.alertRule.expr) + '&start=' + this.$stringTimeParseToUnix(start) + '&end=' + this.$stringTimeParseToUnix(end) + '&limit=' + limit + '&filter=' + encodeURIComponent(decodeURIComponent(this.promQueryParamLabels(this.currentMsg.labels)))).then(res => {
        this.chartLoading = false
        const logData = [res.data]
        this.resultType = res.data.resultType
        this.$nextTick(() => {
          if (this.$refs.logDetail) {
            this.$refs.logDetail.time = this.chartData.param.time
            this.$refs.logDetail.wrapLines = this.chartData.param.wrapLines
            this.$refs.logDetail.operations.descending = this.chartData.param.descending
          }
          // logData.forEach((item, index) => {
          //   item.result.forEach(result => {
          //     result.elements = this.expressions[index]
          //   })
          // })
          this.logData = logData
          this.resultType === 'matrix' && this.loadLogGraph()
        })
      })
    },
    loadLogGraph () {
      const graphData = this.logData.filter(l => l.resultType === 'matrix')
      if (graphData && graphData.length > 0) {
        this.$refs.messageChart.startLoading()
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
                // alias = this.dealLegendAlias(host, this.chartData.elements[index].legend)
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
        this.$refs.messageChart.setLegend(legend)
        this.$refs.messageChart.setRandomColors(series.length)
        if (!series.length) {
          series = ''
        }
        this.$refs.messageChart.setSeries(series)
        this.defaultChartVisible = true
        this.$nextTick(() => {
          this.$refs.messageChart.endLoading()
          this.$refs.messageChart.resize()
        })
      }
    },
    showText (row) {
      this.dialogShowText = true
      this.dialogText = row.alertRule.trbShot
    },
    addSilence (row, type) {
      this.blankSilenceObject.startAt = bus.timeFormate(bus.getOffsetTimezoneData(), 'yyyy-MM-dd hh:mm:ss')
      this.blankSilenceObject.endAt = bus.timeFormate(bus.getOffsetTimezoneData(1), 'yyyy-MM-dd hh:mm:ss')
      this.objectSilence = JSON.parse(JSON.stringify(this.blankSilenceObject))
      this.objectSilence.name = 'Quick silence'
      if (type !== 'alertMessage' && type !== 'alertRule') {
        this.objectSilence.matchers = [
          { name: type, value: row.name, regex: 0 },
          { name: type + '_id', value: row.id, regex: 0 }
        ]
      } else if (type === 'alertMessage') {
        if (typeof row.labels === 'string') row.labels = JSON.parse(row.labels)
        const labels = JSON.parse(JSON.stringify(row.labels))
        this.objectSilence.matchers = []
        const filterArr = ['alertname', 'severity_id', 'severity', 'rule_type']
        Object.keys(labels).forEach((key, i) => {
          if (filterArr.indexOf(key) != -1) {
            return
          }
          this.objectSilence.matchers.push(
            { name: key, value: labels[key], regex: 0 }
          )
        })
      } else if (type === 'alertRule') {
        this.objectSilence.matchers = [
          { name: 'alertName', value: row.name, regex: 0 }
        ]
      }
      this.silenceBoxShow = true
    },
    closeSilenceBox (refresh) {
      this.silenceBoxShow = false
      if (refresh) {
        this.delFlag = true
        this.getAlertList()
      }
    }
  },
  created () {
    // 是否存在分页缓存
    const pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId)
    if (pageSize != 'undefined' && pageSize != null) {
      this.pageObj.pageSize = pageSize
    }
  },
  mounted () {
    this.firstLoad = false
    this.tablelable = localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + '/alertList')
      ? JSON.parse(localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + '/alertList'))
      : this.tableTitle
    this.dropCol = localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + '/alertList')
      ? JSON.parse(localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + '/alertList'))
      : this.tableTitle
  },
  beforeDestroy () {
    this.clearChart()
    if (this.ps) {
      this.ps.destroy()
    }
  }
}
</script>
<style scoped>
.table-container{
  height: calc(100% - 40px);
}
</style>
