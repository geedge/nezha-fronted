<template>
  <div class="panel list-page" v-my-loading="dashboardLoading">
    <div class="main-list">
      <div>
        <transition name="el-zoom-in-center">
          <div v-if="isLoading" class="panel-loading"></div>
        </transition>
      </div>
      <div class="main-container">
        <div class="top-tools panel-top-tools" :class="showTopLine? 'panel-top-tools-bottom' : ''">
          <div v-if="panelData.length === 0" class="top-tool-left" style="margin-left: 10px;">
            <button id="dashboard-add-panel" class="nz-btn nz-btn-style-light nz-btn-size-small" v-has="'main_add'" @click="toAdd"><i class="nz-icon nz-icon-create-square"></i>&nbsp;&nbsp;{{$t("overall.addDashboard")}}</button>
          </div>
          <template v-else>
            <div class="top-tool-left" style="cursor: pointer;">
              <select-dashboard
                ref="selectDashboard"
                :panel-data="panelData"
                :panel-lock="panelLock"
                :placement="'bottom-start'"
                :show-panel="showPanel"
                style="display: inline-block;padding: 0"
                @deletePanel="del"
                @editPanel="edit"
                @selectDashboard="panelChange">
                <template v-slot:trigger>
                  <i style="color: #BEBEBE" class="el-icon-menu"></i>
                  <span :title="showPanel.name  + ' (' + showPanel.chartNum +' charts)' " class="show-panel-name">{{showPanel.name}}</span>
                  <i @click.stop="delStarred(showPanel)" v-if="showPanel.starred===1" class="nz-icon nz-icon-a-xingzhuang2" :title ="$t('overall.starred')"></i>
                  <i @click.stop="addStarred(showPanel)" v-else class="nz-icon nz-icon-xingzhuang" :title ="$t('overall.unstarred')"></i>
                </template>
                <!-- 按钮插槽 -->
                <template slot="button">
                  <span class="dashboard-select-add" v-has="'main_add'" :title='$t("overall.addDashboard")' @click="toAdd">
                    <i class="nz-icon nz-icon-create-square"></i>&nbsp;{{$t('overall.addDashboard')}}
                  </span>
                  <!-- 通过dashboard模板创建 -->
                  <span v-has="'main_add'" @click="addByTemplate" :title='$t("dashboard.dashboard.addByTemplate")' class="dashboard-addBy-template">
                    <i class="nz-icon nz-icon-template1"></i>
                  </span>
                </template>
              </select-dashboard>
            </div>

            <div class="top-tool-right">

              <pick-time id="panel" ref="pickTime" v-model="searchTime" :refresh-data-func="dateChange" :use-chart-unit="false" class="margin-r-10" :sign="showPanel.id"></pick-time>

              <!-- 切换查看模式 -->
              <button class="top-tool-btn view-mode" :title="$t('overall.viewMode')" @click="cycle">
                <i class="nz-icon nz-icon-moshiqiehuan"></i>
              </button>

              <!-- 新增图表 -->
              <button id="panel-add-chart" v-has="'main_add'" :title="$t('overall.createChart')" class="top-tool-btn margin-r-10" type="button" @click="addChartBefore">
                <i class="nz-icon-create-square nz-icon"></i>
              </button>

             <top-tool-more-options
                :delete-objs="batchDeleteObjs"
                ref="topTool"
                id="panel"
                :params="filter"
                :permissions="{
                  import: 'main_add',
                  export: 'main_edit'
                }"
                :paramsType="'dashboard'"
                class="top-tool-export"
                export-file-name="chart"
                export-url="/visual/dashboard/export"
                import-url="/visual/dashboard/import"
                @export="exportType"
                @afterImport="afterImport"
              >
                <template v-slot:before>
                  <el-dropdown-item v-has="'main_edit'">
                    <div id="panel-lock" @click="$store.dispatch('dispatchPanelLock',{flag:!panelLock})"><i :class="{'nz-icon nz-icon-lock':!panelLock,'nz-icon nz-icon-unlock':panelLock}"></i>{{!panelLock ? $t('overall.locked') : $t('overall.unlocked')}}</div>
                  </el-dropdown-item>
                </template>
                <template v-slot:after>
                  <!-- <el-dropdown-item v-has="'main_add'">
                    <div id="chart-temp-add" @click="addChartByTemp"><i class="nz-icon nz-icon-add"></i>{{$t('overall.AddByTemplate')}}</div>
                  </el-dropdown-item>
                  <el-dropdown-item v-has="'main_edit'">
                    <div id="chart-temp-sync" @click="chartBySync"><i class="nz-icon nz-icon-sync"></i>{{ $t('overall.syncChart') }}</div>
                  </el-dropdown-item> -->
                  <el-dropdown-item v-has="'dashboard_view'">
                    <div id="chart-export-html" @click="exportType"><i class="nz-icon nz-icon-kuaizhao"></i>{{ $t('overall.snapshoot') }}</div>
                  </el-dropdown-item>
                </template>
              </top-tool-more-options>
            </div>
          </template>
        </div>
        <div id="tableList" class="table-list" style='overflow-y: unset'>
          <div class="table-list-box">
            <div  id="dashboardScrollbar" class="box-content" v-my-loading="chartListLoading"  ref="dashboardScrollbar" style='overflow-y: auto;display: flex;flex-direction: column;overflow-x: hidden'>
              <panel-variables :labelArrs="variables" :time-range="searchTime" @getPanelData="getPanelData"></panel-variables>
              <chart-list
                ref="chartList"
                :variablesInit="variablesInit"
                name="dashboard"
                :dashboardId="showPanel.id"
                :class="{'show-top':showTopBtn, 'is-dashboard': true}"
                :data-list="dataList"
                :is-export-html="false"
                :nowTimeType="nowTimeType"
                :from="fromRoute.dashboard"
                :time-range="searchTime"
                @edit-chart="editChart"
                @on-refresh-time="refreshTime"
                @on-remove-chart="delChart"
                @on-add-group-item-chart="addGroupItem"
                @refreshPanel="refreshPanel"
                :loading="chartListLoading"
              ></chart-list>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button :class="{'to-top-is-hover': tableHover}" @click="toTop(scrollbarWrap)" class="to-top" style="bottom: -10px;" v-show="showTopBtn" :title="$t('overall.backToTop')"><i class="nz-icon nz-icon-top"></i></button>

    <transition name="right-box">
      <chart-right-box
        v-if="chartRightBoxShow"
        v-my-loading="rightBox.loading"
        ref="addChartModal"
        :chart="chart"
        :from="fromRoute.dashboard"
        :panel-data="panelData"
        :show-panel="showPanel"
        @close="closeChartBox"
        @reload="panelReload"
        @reloadOnlyPanel="panelReloadOnlyPanel"
        @on-create-success="createSuccess"
      ></chart-right-box>
    </transition>
    <transition name="right-box">
      <chart-temp-box v-if="rightBox.chartTemp.show" :from="fromRoute.dashboard" :obj="chart" :panel-data="panelData" :show-panel="showPanel" @close="closeChartTempBox" @on-create-success="createSuccess"></chart-temp-box>
    </transition>
    <transition name="right-box">
      <panel-box v-if="rightBox.panel.show" :from="fromRoute.dashboard" ref="panelBox" :obj="panel" @close="closePanelBox" @reload="panelReload" @reloadForDel="panelReloadForDel" ></panel-box>
    </transition>
    <!-- dashboard模板 -->
    <transition name="right-box">
      <dashboardTempBox v-if="rightBox.dashboardTemp.show" :from="fromRoute.dashboard" @close="closeDashboardTempBox"></dashboardTempBox>
    </transition>
    <!-- 快照进度 -->
    <snapshotProgress v-if="snapshotVisible" :showPanel="showPanel" :searchTime="searchTime" :snapshotVisible.sync="snapshotVisible"></snapshotProgress>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { chartCache } from '@/components/common/js/common'
import { data as le5leData, observers as le5leObservers } from 'le5le-store/store/data.js'
import chartRightBox from '@/components/common/rightBox/chart/chartRightBox'
import bus from '../../../libs/bus'
import pickTime from '../../common/pickTime'
import selectDashboard from '../../common/popBox/selectDashboard'
import panelBox from '@/components/common/rightBox/panelBox'
import chartTempBox from '@/components/common/rightBox/chartTempBox'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import { fromRoute } from '@/components/common/js/constants'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import routerPathParams from '@/components/common/mixin/routerPathParams'
import htmlToPdfMixin from '@/components/common/mixin/htmlToPdfMixin'
import exportHtmlMixin from '@/components/common/mixin/exportHtml'
import panelVariables from '@/components/common/panel/panelVariables'
import snapshotProgress from '@/components/common/snapshotProgress/snapshotProgress.vue'
import dashboardTempBox from '@/components/common/rightBox/dashboardTempBox'
// import FileSaver from 'file-saver'
// import chartData from './testData'
export default {
  name: 'dashboard',
  mixins: [routerPathParams, htmlToPdfMixin, exportHtmlMixin],
  data () {
    return {
      fromRoute,
      pdfId: 'pdfDom',
      htmlTitle: 'dashboard',
      dashboardLoading: false,
      overScroll10: false,
      isLoading: true,
      showTopBtn: false, // top按钮
      visible: false,
      chartListLoading: true,
      rightBox: { // 面板弹出框相关
        chart: { show: false },
        chartTemp: { show: false },
        dashboardTemp: { show: false },
        panel: { show: false },
        loading: false
      },
      tableHover: false,
      searchTime: bus.getTimezontDateRange(),
      intervalTimer: null,
      interval: 0,
      showPanel: { // panel下拉列表
        id: '',
        name: '',
        type: 'dashboard'
      },
      panel: { // 新增panel
        id: '',
        name: '',
        remark: '',
        param: {
          report: {
            enable: false,
            receivers: [],
            range: {
              unit: ''
            },
            schedule: {
              repeat: 0,
              nums: [],
              type: 0
            }
          }
        }
      },
      chart: {},
      blankChart: {
        id: '',
        name: '',
        type: 'line',
        span: 4,
        datasource: 'metrics',
        height: 4,
        unit: 2,
        param: {
          stack: 0,
          nullType: 'null',
          legend: { placement: 'bottom', values: [], show: true },
          enable: {
            legend: true,
            valueMapping: false,
            thresholds: false,
            visibility: false,
            rightYAxis: false
          },
          thresholdShow: true,
          thresholds: [{ value: undefined, color: randomcolor() }],
          showHeader: 1,
          visibility: {
            varName: '',
            operator: 'equal',
            varValue: '',
            result: 'show'
          },
          rightYAxis: {
            elementNames: [],
            style: 'line',
            unit: 2,
            label: '',
            min: undefined,
            max: undefined
          }
        },
        elements: [{ expression: '', legend: '', type: 'expert', id: '', name: 'A', state: 1, orderNum: 0 }],
        panel: '',
        sync: 0,
        remark: '',
        groupId: '',
        varType: ''
      },
      pageObj: {
        pageNo: 1,
        pageSize: -1, // 此处获取所有数据
        total: 0
      },
      blankChartTemp: {
        varType: 1,
        pid: '',
        dashboardId: '',
        varIds: []
      },
      panelData: [],
      panelDataDragTmp: [],
      searchMsg: { // 给搜索框子组件传递的信息
        searchLabelList: [
          {
            name: 'ID',
            type: 'input',
            label: 'ids',
            disabled: false
          },
          {
            name: this.$t('overall.name'),
            type: 'input',
            label: 'name',
            disabled: false
          },
          {
            name: this.$t('overall.type'),
            type: 'selectString',
            label: 'chartType',
            disabled: false
          },
          {
            name: this.$t('dashboard.dashboard.chartForm.varType'),
            type: 'select',
            label: 'varType',
            disabled: false
          }
        ]
      },
      searchLabel: {}, // 搜索参数
      // ---图表相关参数--start
      dataList: [], // 数据列表
      filter: { // 过滤条件
        dashboardId: 0,
        start_time: '',
        end_time: '',
        id: 4
      },
      dashboardId: 0,
      // ---图表相关参数--end
      scrollbarWrap: null,
      batchDeleteObjs: [],
      nowTimeType: {},
      showTopLine: false,
      // 查看模式
      mode: '',
      variables: [],
      variablesInit: false, // 判断variables 是否加载完成
      snapshotVisible: false,
      stableTime: null
    }
  },
  components: {
    'pick-time': pickTime,
    'panel-box': panelBox,
    topToolMoreOptions,
    selectDashboard,
    chartTempBox,
    chartRightBox,
    panelVariables, // 处理panel变量的组件
    snapshotProgress, // 快照进度
    dashboardTempBox // dashboard模板
  },
  computed: {
    chartRightBoxShow () {
      return this.$store.getters.getShowRightBox
    },
    delChartFlag () {
      return this.$store.getters.getDelChart
    },
    panelLock () {
      return this.$store.getters.getPanelLock
    }
  },
  methods: {
    closeDashboardTempBox (refresh) {
      this.rightBox.dashboardTemp.show = false
      if (refresh) {
        this.getTableData()
      }
    },
    // 通过dashboard模板创建
    addByTemplate () {
      this.rightBox.dashboardTemp.show = true
      // 关闭selectDashboard弹框
      this.$refs.selectDashboard && this.$refs.selectDashboard.esc()
    },
    // 新增收藏
    addStarred (data) {
      this.$refs.selectDashboard.addStarred(data)
    },
    // 删除收藏
    delStarred (data) {
      this.$refs.selectDashboard.delStarred(data)
    },
    // 刷新
    refreshPanel () {
      this.getData(this.filter)
    },
    // 面板相关操作
    panelChange (val) {
      if (!val) {
        return false
      }
      this.variablesInit = false
      this.showPanel = val
      this.variables = this.$loadsh.cloneDeep(this.$loadsh.get(this, 'showPanel.param.variables', []) || [])
      this.showPanel.type = 'dashboard'
      this.filter.dashboardId = this.showPanel.id
      this.dashboardId = this.showPanel.id
      const param = {
        dashboardId: this.dashboardId,
        nowTimeType: JSON.stringify(this.nowTimeType),
        searchTime: JSON.stringify(this.searchTime),
        mode: this.mode
      }
      // this.getTableData()
      // this.getData(this.filter)
      const path = this.fromRoute.dashboard
      this.updatePath(param, path)
      this.dateChange()
      this.$refs.chartList.cleanData()
    },

    del (u) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('visual/dashboard?ids=' + u.id).then(response => {
          if (response.code === 200) {
            this.$message({
              duration: 1000,
              type: 'success',
              message: this.$t('tip.deleteSuccess')
            })
            const param = {
              dashboardId: 0,
              nowTimeType: JSON.stringify(this.nowTimeType),
              searchTime: JSON.stringify(this.searchTime),
              mode: this.mode
            }
            const path = this.fromRoute.dashboard
            this.updatePath(param, path)
            this.getTableData(true)
          } else {
            this.$message.error(response.msg)
            this.$store.dispatch('clearPanel')
          }
        })
      }).catch(() => {
        this.$store.dispatch('clearPanel')
      })
    },
    edit (u) {
      this.$get('visual/dashboard/' + u.id).then(res => {
        if (res.code === 200) {
          this.panel = res.data
          if (!this.$loadsh.get(this.panel, 'param.report', '')) {
            this.panel = {
              ...this.panel,
              param: {
                report: {
                  enable: false,
                  range: {
                    unit: 'day'
                  },
                  schedule: {
                    type: '2',
                    repeat: 1,
                    nums: [],
                    stime: '',
                    etime: ''
                  },
                  receivers: []
                },
                chartShare: 'none'
              }
            }
          }
          this.panel.param.report.schedule.type = this.panel.param.report.schedule.type + ''
          const startTime = this.$loadsh.get(this.panel, 'param.report.schedule.stime', '')
          if (startTime !== '') {
            this.panel.param.report.schedule.stime = this.utcTimeToTimezoneStr(this.panel.param.report.schedule.stime, 'YYYY-MM-DD HH:mm:ss')
          } else {
            this.panel.param.report.schedule.stime = ''
          }
          const endTime = this.$loadsh.get(this.panel, 'param.report.schedule.etime', '')
          if (endTime !== '') {
            this.panel.param.report.schedule.etime = this.utcTimeToTimezoneStr(this.panel.param.report.schedule.etime, 'YYYY-MM-DD HH:mm:ss')
          } else {
            this.panel.param.report.schedule.etime = ''
          }
          this.rightBox.panel.show = true
        }
      })
      // this.panel = Object.assign({}, u)
    },
    toAdd () {
      if (!this.hasButton('dashboard_view')) {
        return
      }
      this.rightBox.panel.show = true
      // 关闭selectDashboard弹框
      this.$refs.selectDashboard && this.$refs.selectDashboard.esc()
      this.panel = {
        id: '',
        name: '',
        remark: '',
        param: {
          report: {
            enable: false,
            receivers: [],
            range: {
              unit: 'day'
            },
            schedule: {
              stime: '',
              etime: '',
              nums: [],
              type: 2 + '',
              repeat: 1
            }
          },
          chartShare: 'none'
        }
      }
    },
    panelReload (clearShowPanel) {
      this.getTableData(clearShowPanel)
    },
    refreshTime (st, et) {
      const startTime = bus.timeFormate(st, 'yyyy-MM-dd hh:mm')
      const endTime = bus.timeFormate(et, 'yyyy-MM-dd hh:mm')
      this.searchTime = [startTime, endTime, '']
    },
    panelReloadForDel: function () {
      if (this.showPanel.id === this.panel.id) {
        this.showPanel.id = ''
      }
      this.getTableData()
    },
    /* 图表相关操作--start */
    addChart () {
      this.chart = this.newChart()
      this.chart.param.thresholds = [{ value: undefined, color: randomcolor() }]
      this.chart.dashboardId = this.showPanel.id
      this.chart.panelName = this.showPanel.name
      this.$nextTick(() => {
        this.$refs.addChartModal.isStable = 'stable'
      })
    },
    addChartByTemp () {
      this.chart = JSON.parse(JSON.stringify(this.blankChartTemp))
      this.chart.dashboardId = this.showPanel.id
      this.rightBox.chartTemp.show = true
    },
    addGroupItem (groupId) {
      this.chart = this.newChart()
      this.chart.groupId = groupId
      this.chart.dashboardId = this.showPanel.id
      this.chart.panelName = this.showPanel.name
      this.chart.isGroup = true
      this.$nextTick(() => {
        this.$refs.addChartModal.isStable = 'stable'
      })
    },
    newChart () {
      return JSON.parse(JSON.stringify(this.blankChart))
    },
    // 编辑图表信息,打开编辑弹窗
    editChart (data, copy) {
      if (copy) {
        this.chart = JSON.parse(JSON.stringify(data))
        this.chart.x = 0
        this.chart.y = 0
        this.chart.dashboardId = this.showPanel.id
        this.chart.panelName = this.showPanel.name
        this.chart.id = ''
        this.chart.elements.forEach((item) => {
          item.id = ''
          item.chartId = ''
          delete item.seq
        })
        if (this.chart.datasource !== 'metrics' && this.chart.datasource !== 'logs') {
          delete this.chart.elements
        }
        if (!this.chart.groupId || this.chart.groupId == -1) {
          this.chart.groupId = ''
        }
      } else {
        this.rightBox.loading = true
        this.$get('visual/dashboard/chart/' + data.id).then(res => {
          this.rightBox.loading = false
          if (res.code === 200) {
            const chartData = res.data
            this.chart = JSON.parse(JSON.stringify(chartData))
            this.chart.dashboardId = this.showPanel.id
            this.chart.panelName = this.showPanel.name
            if (this.chart.param) {
              this.chart.param = JSON.parse(this.chart.param)
            } else {
              this.chart.param = {}
            }
            if (!this.chart.param.rightYAxis) {
              this.chart.param.rightYAxis = {
                elementNames: [],
                style: 'line',
                unit: 2,
                label: '',
                min: undefined,
                max: undefined
              }
            }
            if (!this.chart.groupId || this.chart.groupId == -1) {
              this.chart.groupId = ''
            }
            if (this.chart.type === 'stat') {
              if (!this.chart.param.sparklineMode) { this.chart.param.sparklineMode = 'none' }
              if (!this.chart.param.comparison) { this.chart.param.comparison = 'none' }
            }
            if (this.chart.type == 'table') {
              const arr = this.chart.param.indexs ? this.chart.param.indexs.split(',') : []
              this.chart.param.tags = arr.map((item) => {
                return {
                  text: item,
                  tiClasses: ['ti-valid']
                }
              })
            }
            setTimeout(() => {
              this.$refs.addChartModal.isStable = 'stable'
            })
          } else {
            this.$message.error(res.msg)
          }
        })
      }
    },
    closeChartBox (refresh) {
      this.chart = {}
      this.$store.dispatch('clearPanel')
    },
    closeChartTempBox (refresh) {
      this.rightBox.chartTemp.show = false
      if (refresh) {
        this.getData(this.filter)
      }
    },
    closePanelBox (refresh) {
      this.rightBox.panel.show = false
      if (refresh) {
        this.getTableData()
      }
    },
    // 移除图表:弹出确认框询问
    delChart (data, from) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('visual/dashboard/chart?ids=' + data.id).then(response => {
          if (response.code === 200) {
            this.$message({
              duration: 2000,
              type: 'success',
              message: this.$t('tip.deleteSuccess')
            })
            this.getData(this.filter)
            this.chart = {}
            this.$store.dispatch('clearPanel')
            // this.$refs.chartList.loadChartData(this.scrollbarWrap.scrollTop)
            // if(nextChart&&prevChart){ //删除图表为中间位置
            //   prevChart.next = nextChart.id;
            //   nextChart.prev = prevChart.id;
            // }else{
            //   if(!nextChart) prevChart.next = -1;
            //   if(!prevChart) nextChart.prev = 0;
            // }
            // this.getTableData(); //删除相关图表后，刷新面板数据
          } else {
            this.$message.error(response.msg)
            this.$store.dispatch('clearPanel')
          }
        })
      }).catch(() => {
        this.chart = {}
        this.$store.dispatch('clearPanel')
      })
    },
    // 图表创建成功，回调panel页面，进行图表的刷新
    createSuccess (msg, data, params, panel) {
      this.filter.dashboardId = this.showPanel.id
      this.getData(this.filter)
      this.$store.dispatch('clearPanel')
    },
    // 获取数据,用在子页面
    getData (params) {
      if (!this.hasButton('dashboard_view')) {
        return
      }
      this.dataList = []
      this.chartListLoading = true
      if (params.start_time === '' || params.end_time === '') {
        const now = bus.getTimezontDateRange()
        const endTimeTmp = bus.timeFormate(now[1].getTime(), this.panelDateFormatTime)
        const startTimeTmp = bus.timeFormate(now[0].getTime(), this.panelDateFormatTime)
        params.start_time = startTimeTmp
        params.end_time = endTimeTmp
      }
      if (le5leData) {
        Object.keys(le5leData).forEach(key => {
          le5leData[key] = null
          delete le5leData[key]
        })
      }
      if (le5leObservers) {
        Object.keys(le5leObservers).forEach(key => {
          le5leObservers[key] = null
          delete le5leObservers[key]
        })
      }
      this.$get('visual/dashboard/chart?dashboardId=' + params.dashboardId + '&groupId=0' + '&pageSize=-1').then(response => {
        if (response.code === 200) {
          this.chartListLoading = false
          this.dataList = response.data.list.map(item => {
            return {
              ...item,
              loaded: false
            }
          })
        }
      })
    },

    /* 图表相关操作--end */
    /* 时间条件查询--start */
    // 选择日期变化
    dateChange (val) {
      const nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
      this.nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
      this.setSearchTime(nowTimeType.type, nowTimeType.value, nowTimeType)
      this.filter.start_time = bus.timeFormate(this.searchTime[0], this.panelDateFormatTime)
      this.filter.end_time = bus.timeFormate(this.searchTime[1], this.panelDateFormatTime)
      this.filter.end_time = bus.timeFormate(this.searchTime[1], this.panelDateFormatTime)
      this.filter.value = this.searchTime[2]
      this.filter.id = this.$refs.pickTime.$refs.timePicker.showTime.id
      // this.getTableData()
      this.getData(this.filter)
      const param = {
        dashboardId: this.dashboardId,
        nowTimeType: JSON.stringify(this.nowTimeType),
        searchTime: JSON.stringify(this.searchTime),
        mode: this.mode
      }
      const path = this.fromRoute.dashboard
      this.updatePath(param, path)
      this.$store.dispatch('dispatchPanelTime', {
        time: this.searchTime,
        nowTimeType: this.nowTimeType
      })
    },
    setSearchTime (type, val, nowTimeType) { // 设置searchTime
      if (type === 'minute') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - val), this.panelDateFormatTime)
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), this.panelDateFormatTime)
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'm')
      } else if (type === 'hour') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - val), this.panelDateFormatTime)
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), this.panelDateFormatTime)
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'h')
      } else if (type === 'date') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setDate(new Date(bus.computeTimezone(new Date().getTime())).getDate() - val), this.panelDateFormatTime)
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), this.panelDateFormatTime)
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'd')
      }
      this.$refs.pickTime && (this.$refs.pickTime.$refs.timePicker.searchTime = this.searchTime)
    },
    /* 时间条件查询--end */
    // 公用操作
    jumpTo (data, id) {
      bus.$emit('menu-change', data)
      this.$router.push({
        path: '/' + data,
        query: {
          t: +new Date()
        }
      })
    },
    panelReloadOnlyPanel () { // 仅刷新panel数据
      if (!this.hasButton('dashboard_view')) {
        return
      }
      this.$get('visual/dashboard?pageSize=-1').then(response => {
        if (response.code === 200) {
          this.panelData = response.data.list
          for (let i = 0; i < this.panelData.length; i++) {
            if (this.panelData[i].id == this.showPanel.id) {
              this.showPanel = this.panelData[i]
              break
            }
          }
        }
      })
    },

    getTableData (clearShowPanel) {
      const vm = this
      this.$get('visual/dashboard?type=dashboard&pageSize=-1').then(response => {
        if (response.code === 200) {
          let isInitData = false
          this.panelData = JSON.parse(JSON.stringify(response.data.list))
          if (response.data.list.length > 0) {
            if (this.$store.state.showPanel.id > 0 && this.$store.state.showPanel.name) {
              this.showPanel = JSON.parse(JSON.stringify(this.$store.state.showPanel))
            }
            if (clearShowPanel) {
              this.showPanel.id = ''
            }
            if (!this.showPanel.id) {
              this.showPanel = response.data.list[0]
              this.filter.dashboardId = this.showPanel.id
              this.getData(this.filter)
              isInitData = true
            } else {
              handler(response.data.list)
              this.filter.dashboardId = this.showPanel.id
            }
            this.isLoading = false
          } else {
            this.showPanel.id = ''
            this.filter.dashboardId = ''
            this.isLoading = !response.data.list.length === 0
          }
          this.pageObj.total = response.data.total
          if (!isInitData && (this.panel.id === '' || this.panel.id === this.showPanel.id)) {
            this.getData(this.filter)
          }
          this.$store.state.showPanel.id = 0
          this.$store.state.showPanel.name = ''
          this.$store.state.showPanel.type = 'dashboard'
        } else {
          if (response.msg) {
            this.$message.error(response.msg)
          } else if (response.error) {
            this.$message.error(response.error)
          } else {
            this.$message.error(response)
          }
        }
        this.variables = this.$loadsh.get(this, 'showPanel.param.variables', []) || []
      }).catch((error) => {
        // console.log('error................'+JSON.stringify(error));
        if (error) {
          console.error(error)
          this.$message.error(error.toString())
        }
      })

      function handler (panelData) {
        panelData.forEach(panel => {
          if (panel.id == vm.showPanel.id) {
            vm.showPanel = panel
          } else {
            if (panel.children && panel.children.length > 0) {
              handler(panel.children)
            }
          }
        })
      }
    },
    // 定期刷新
    selectInterval (val) {
      this.visible = false
      clearInterval(this.intervalTimer)
      if (val) {
        this.interval = val
        const start = new Date(this.searchTime[1])
        const now = new Date()
        const interval = Math.floor((now.getTime() - start.getTime()) / 1000) // 计算当前结束时间到现在的间隔（秒）
        if (interval >= 60) { // 如果结束时间到现在超过1分钟，则
          this.getIntervalData(interval)
        }
        this.intervalTimer = setInterval(() => {
          this.getIntervalData(this.interval)
        }, val * 1000)
      }
    },
    getIntervalData (interval) { // interval:结束时间到现在的秒数
      const start = new Date(this.searchTime[0])
      const end = new Date(this.searchTime[1])
      start.setSeconds(start.getSeconds() + interval)
      end.setSeconds(end.getSeconds() + interval)
      const startTime = bus.timeFormate(start, 'yyyy-MM-dd hh:mm')
      const endTime = bus.timeFormate(end, 'yyyy-MM-dd hh:mm')
      this.searchTime = [startTime, endTime]
      // 刷新数据
      this.dateChange()
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.getTableData()
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      this.getTableData()
    },
    // 滚动事件触发下拉加载
    onScroll () {
      const _self = this
      this.scrollbarWrap.addEventListener('scroll', bus.debounce(function () {
        _self.showTopBtn = _self.scrollbarWrap.scrollTop > 50
        _self.overScroll10 = _self.scrollbarWrap.scrollTop > 50
        _self.$refs.chartList.onScroll(_self.scrollbarWrap.scrollTop)
      }, 300, function () {
        _self.showTopLine = _self.scrollbarWrap.scrollTop > 10
      }))
    },
    tableListEnter () {
      this.tableHover = true
    },
    tableListLeave () {
      this.tableHover = false
    },
    toTop (wrap) {
      let currentTop = wrap.scrollTop
      const interval = currentTop / 10
      const intervalFunc = setInterval(function () { // 花200ms分10次回到顶部，模拟动画效果
        if (currentTop === 0) {
          clearInterval(intervalFunc)
        } else {
          currentTop = (currentTop - interval) < interval * 0.5 ? 0 : currentTop - interval
          wrap.scrollTop = currentTop
        }
      }, 20)
    },
    load () {

    },
    addChartBefore () {
      this.$store.dispatch('dispatchEditChart', {
        chart: '',
        type: 'add'
      })
    },
    disposeChart () {
      const chartInfo = this.$store.getters.getChart
      const groupId = this.$store.getters.getGroupId
      const type = this.$store.getters.getType
      if (type === 'add') {
        this.addChart()
      }
      if (type === 'edit') {
        this.editChart(chartInfo)
      }
      if (type === 'addGroupItem') {
        this.addGroupItem(groupId)
      }
      if (type === 'delete') {
        this.delChart(chartInfo)
      }
      if (type === 'duplicate') {
        this.editChart(chartInfo, true)
      }
    },
    afterImport () {
      this.dateChange()
      this.panelReloadOnlyPanel()
    },
    htmlToPdf () {
      const dom = document.getElementsByClassName(this.pdfId)[0]
      if (dom) {
        // dom = dom.getElementsByClassName('vue-grid-layout')[0]
        this.htmlTitle = this.showPanel.name
        this.scrollbarWrap.scrollTop = this.scrollbarWrap.scrollHeight
        this.$refs.chartList.onScroll(this.scrollbarWrap.scrollTop)
        // const div = document.createElement('div')
        // div.setAttribute('class', 'el-loading-spinner')
        // div.innerText = '12321312312312321'
        // dom.insertBefore(div,)
        let flag = true
        this.showScreenLoading(true)
        let timer = setInterval(() => {
          flag = true
          this.$refs.chartList.copyDataList.forEach(chart => {
            if (chart.type !== 'group') {
              flag = flag && chart.loaded
            } else if (chart.collapse) {
              chart.children.forEach(groupChart => {
                flag = flag && groupChart.loaded
              })
            }
          })
          if (flag) {
            clearInterval(timer)
            timer = null
            setTimeout(() => {
              document.body.style.height = 'auto'
              document.getElementsByClassName('left-menu')[0].style.height = '100vh'
              // document.getElementsByTagName('html')[0].style.overflow = 'visible'
              const position = dom.getBoundingClientRect()
              this.getPdf(dom, -1 * position.left, -1 * position.top, this.searchTime)
              // this.getPdf(dom, 0, 0)
            }, 2000)
          }
        }, 200)
      } else {
        this.showScreenLoading(false)
      }
      this.$refs.topTool.closeDialog()
    },
    exportType (type) {
      if (type === 'PDF') {
        this.htmlToPdf()
      } else {
        // this.exportToHtml(this.showPanel.name)
        this.snapshotVisible = true
      }
    },
    // 切换查看模式
    cycle () {
      if (!this.mode) {
        // TV模式（隐藏 menu，header）
        this.mode = 'tv'
      } else if (this.mode === 'tv') {
        // 简易模式（隐藏 menu，header 和 操作栏）
        this.mode = 'se'
        this.$message({
          type: 'success',
          message: this.$t('overall.toExit')
        })
      } else if (this.mode === 'se') {
        // 默认模式
        this.mode = ''
      }
      this.$store.commit('setMode', this.mode)
      const param = {
        dashboardId: this.dashboardId,
        nowTimeType: JSON.stringify(this.nowTimeType),
        searchTime: JSON.stringify(this.searchTime),
        mode: this.mode
      }
      const path = this.fromRoute.dashboard
      this.updatePath(param, path)
      this.$store.dispatch('dispatchPanelTime', {
        time: this.searchTime,
        nowTimeType: this.nowTimeType
      })
    },
    // 按ESC键退出查看模式
    escExit (e) {
      const message = document.querySelectorAll('.el-message-box__wrapper')
      const showMessage = message.length && Array.from(message).some(item => {
        return item.style.display !== 'none'
      })
      const showFullscreen = document.querySelector('.chart-fullscreen')
      // 防止ESC键冲突
      if (showMessage || showFullscreen) {
        return false
      }
      if (e.keyCode === 27 && this.mode) {
        // 默认模式
        this.mode = ''
        this.$store.commit('setMode', this.mode)
        const param = {
          dashboardId: this.dashboardId,
          nowTimeType: JSON.stringify(this.nowTimeType),
          searchTime: JSON.stringify(this.searchTime),
          mode: this.mode
        }
        const path = this.fromRoute.dashboard
        this.updatePath(param, path)
      }
    },
    getPanelData () {
      this.variablesInit = true
      this.$nextTick(() => {
        this.$refs.chartList.onScroll(this.scrollbarWrap.scrollTop)
      })
    }
  },
  created () {
    const searchKeys = {
      // key: path 键
      // value: vue set 参数
      dashboardId: { target: this, propertyName: 'dashboardId', type: 'number' },
      searchTime: { target: this, propertyName: 'searchTime', type: 'jsonParse' },
      nowTimeType: { target: this, propertyName: 'nowTimeType', type: 'jsonParse' },
      mode: { target: this, propertyName: 'mode', type: 'string' }
    }
    this.initQueryFromPath(searchKeys)
    setTimeout(() => {
      this.showPanel.id = this.dashboardId
      this.filter.dashboardId = this.dashboardId
    })
    // 设置查看模式
    this.$store.commit('setMode', this.mode)
    if (this.nowTimeType.type) {
      this.setSearchTime(this.nowTimeType.type, this.nowTimeType.value, this.nowTimeType)
      this.filter.start_time = bus.timeFormate(this.searchTime[0], this.panelDateFormatTime)
      this.filter.end_time = bus.timeFormate(this.searchTime[1], this.panelDateFormatTime)
      this.filter.end_time = bus.timeFormate(this.searchTime[1], this.panelDateFormatTime)
      this.filter.value = this.searchTime[2]
    }
    this.getTableData()
    this.$store.dispatch('dispatchPanelTime', {
      time: this.searchTime,
      nowTimeType: this.nowTimeType
    })
  },
  mounted () {
    // 监听键盘ESC事件
    document.addEventListener('keydown', this.escExit)
    bus.$on('refreshPanel', this.refreshPanel)
    this.scrollbarWrap = this.$refs.dashboardScrollbar
    this.onScroll()
    document.querySelector('#tableList').addEventListener('mouseenter', this.tableListEnter)
    document.querySelector('#tableList').addEventListener('mouseleave', this.tableListLeave)
    if (this.nowTimeType) {
      this.nowTimeType.start_time = this.searchTime[0]
      this.nowTimeType.end_time = this.searchTime[1]
      setTimeout(() => {
        if (this.$refs.pickTime && this.$refs.pickTime.$refs.timePicker) {
          this.$refs.pickTime.$refs.timePicker.setCustomTime(this.nowTimeType)
        }
      }, 100)
    }
  },
  watch: {
    // 监听图表联动配置
    'showPanel.param.chartShare': {
      handler (value) {
        // 每次切换联动模式 tooltip设置显示
        const option = {
          tooltip: {
            className: 'chart-time-series'
          }
        }
        for (const key in chartCache) {
          if (!chartCache[key] || chartCache[key].group !== 'timeSeriesGroup') {
            continue
          }
          chartCache[key].setOption(option)
        }
        this.$store.commit('setCurrentMousemove', 0)
        if (value && value !== 'none') {
          this.$store.commit('setConnect', value)
          echarts.connect('timeSeriesGroup')
        } else {
          this.$store.commit('setConnect', value)
          echarts.disconnect('timeSeriesGroup')
        }
      }
    },
    searchTime: {
      immediate: true,
      deep: true,
      handler (n) {
        localStorage.setItem('dashboardTime', JSON.stringify(n))
      }
    },
    chartRightBoxShow: {
      immediate: false,
      deep: true,
      handler (n) {
        if (n) {
          this.disposeChart()
        } else {
          this.$refs.addChartModal.isStable = 'instability'
          if (this.stableTime) {
            clearTimeout(this.stableTime)
            this.stableTime = null
          }
        }
      }
    },
    delChartFlag: {
      immediate: false,
      deep: true,
      handler (n) {
        if (n) {
          this.disposeChart()
        }
      }
    },
    $route: {
      immediate: true,
      handler () {
        // 是否弹出侧滑
        const add = this.$route.query.add
        this.$nextTick(() => {
          if (add) {
            console.log(add)
            if (add === 'chart') {
              this.addChartBefore()
            }
            if (add === 'dashboard') {
              this.toAdd()
            }
            const newQuery = JSON.parse(JSON.stringify(this.$route.query)) // 深拷贝
            delete newQuery.add
            this.$router.replace({ query: newQuery })
          }
        })
      }
    }
  },
  beforeDestroy () {
    // 移除键盘ESC事件
    document.removeEventListener('keydown', this.escExit)
    this.$store.dispatch('dispatchPanelLock', { flag: true })
    if (document.querySelector('#tableList')) {
      document.querySelector('#tableList').removeEventListener('mouseenter', this.tableListEnter)
      document.querySelector('#tableList').removeEventListener('mouseleave', this.tableListLeave)
    }
    if (this.scrollbarWrap) {
      this.scrollbarWrap.removeEventListener('scroll', bus.debounce)
    }
    localStorage.removeItem('dashboardTime')
    if (!document.onmousemove) { // 添加鼠标移动事件监听
      document.onmousemove = null
    }

    // 页面销毁 清除图表联动
    this.$store.commit('setCurrentMousemove', 0)
    this.$store.commit('setConnect', 'none')
    echarts.disconnect('timeSeriesGroup')

    this.$store.commit('setMode', '')
  }
}
</script>
<style scoped>
.view-mode{
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.view-mode .el-icon-monitor{
  display: flex;
  align-items: center;
  font-size: 20px;
}
</style>
