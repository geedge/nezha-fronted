<template>
  <div class="full-width-height chart-list dashboard-tab asset-detail" v-my-loading="dashboardLoading">
    <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      :tableId="tableId"
      :layout="[]"
      :tabs="tabs"
      :targetTab="targetTab"
      @changeTab="changeTab"
      class="full-width-height"
      :showPagination="false"
    >
      <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
      <template v-slot:top-tool-right>
        <!-- asset -->
        <div v-if="from === fromRoute.asset" style="display: flex">
          <pick-time ref="pickTime" v-model="searchTime" :refresh-data-func="dateChange" :show-locked="true" :use-chart-unit="false" :sign="'dashboard' + obj.id"></pick-time>
          <button id="panel-add-chart" v-has="'main_add'" :title="$t('overall.createChart')" class="top-tool-btn margin-r-10" type="button" @click="addChartBefore">
            <i class="nz-icon-create-square nz-icon"></i>
          </button>
          <top-tool-more-options
            ref="topTool"
            :delete-objs="batchDeleteObjs"
            id="asset-list"
            :params="filter"
            :params-type="paramsType"
            :permissions="{import: 'main_add', export: 'main_edit'}"
            class="top-tool-export margin-r-10"
            export-file-name="asset-charts"
            export-url="/visual/dashboard/export"
            @afterImport="getTableData"
            :link="obj"
            :showLock="from === fromRoute.asset"
            @export="exportType"
            @panelLockChange="panelLockChange"
          >
            <template v-slot:after>
              <el-dropdown-item v-has="'dashboard_view'">
                <div id="chart-export-html" @click="exportType"><i class="nz-icon nz-icon-kuaizhao"></i>{{ $t('overall.snapshoot') }}</div>
              </el-dropdown-item>
            </template>
          </top-tool-more-options>
        </div>
        <!-- endpoint -->
        <div v-else-if="from === fromRoute.endpoint" style="display: flex">
          <pick-time ref="pickTime" v-model="searchTime" :refresh-data-func="dateChange" :show-locked="true" :use-chart-unit="false" :sign="'dashboard' + obj.id"></pick-time>
          <button id="endpoint-create-chart" v-has="'main_add'" :title="$t('overall.createChart')" class="top-tool-btn margin-r-10" @click.stop="addChartBefore">
            <i class="nz-icon nz-icon-create-square"></i>
          </button>
          <top-tool-more-options
            ref="topTool"
            :delete-objs="batchDeleteObjs"
            id="asset-list"
            :link="obj"
            :params="filter"
            :permissions="{import: 'main_add', export: 'main_edit'}"
            :params-type="paramsType"
            :showLock="from === fromRoute.endpoint"
            class="top-tool-export margin-r-10"
            export-file-name="endpoint-charts"
            export-url="/visual/dashboard/export"
            @afterImport="getTableData"
            @export="exportType"
            @panelLockChange="panelLockChange"
          >
            <template v-slot:after>
              <el-dropdown-item v-has="'dashboard_view'">
                <div id="chart-export-html" @click="exportType"><i class="nz-icon nz-icon-kuaizhao"></i>{{ $t('overall.snapshoot') }}</div>
              </el-dropdown-item>
            </template>
          </top-tool-more-options>
        </div>
        <!-- dashboardTemp -->
        <div v-else-if="from === fromRoute.dashboardTemp">
          <button v-has="'main_add'" id="endpoint-create-chart" :title="$t('overall.createChart')" class="top-tool-btn margin-r-10" @click.stop="addChartBefore">
            <i class="nz-icon nz-icon-create-square"></i>
          </button>
          <button v-has="'main_edit'" id="panel-lock" :title='panelLock ? $t("overall.unlocked") : $t("overall.locked")'  class="top-tool-btn margin-r-10" @click="panelLockChange(!panelLock)" type="button">
            <i :class="{'nz-icon nz-icon-lock':!panelLock,'nz-icon nz-icon-unlock':panelLock}"></i>
          </button>
          <button v-has="'main_edit'" @click="chartBySync" id="chart-sync"  :title="$t('overall.syncChart')" class="top-tool-btn margin-r-10" type="button">
            <i class="nz-icon nz-icon-sync"></i>
          </button>
        </div>
      </template>
      <!--图表-->
      <div id="tableList" class="table-list" style="padding-top: 0;overflow: hidden">
        <div id="dashboardScrollbar" class="table-list-box">
          <div class="box-content"  ref="dashboardScrollbar" v-my-loading="chartListLoading" style="overflow-y: scroll;display: flex;flex-direction: column;overflow-x: hidden">
            <panel-variables :labelArrs="variables" :time-range="searchTime" @getPanelData="getPanelData"></panel-variables>
            <chart-list
              ref="chartList"
              name="panel"
              :dashboardId="showPanel.id"
              :class="{'show-top':showTopBtn}"
              :data-list="dataList"
              :nowTimeType="nowTimeType"
              :from="from"
              :time-range="searchTime"
              @edit-chart="editChart"
              @on-refresh-time="refreshTime"
              @on-remove-chart="delChart"
              @on-add-group-item-chart="addGroupItem"
              @refreshPanel="refreshPanel"
              :variablesInit="variablesInit"
              :loading="chartListLoading"
              :chart-detail-info="chartDetailInfo"
            ></chart-list>
          </div>
        </div>
      </div>
    </nz-bottom-data-list>

    <transition name="right-box">
      <chart-right-box
        v-if="chartRightBoxShow"
        v-my-loading="rightBox.loading"
        ref="addChartModal"
        :chart="chart"
        :from="from"
        :panel-data="panelData"
        :show-panel="showPanel"
        @close="closeRightBox"
        @reload="panelReload"
        @reloadOnlyPanel="panelReloadOnlyPanel"
        @on-create-success="createSuccess"
      ></chart-right-box>
    </transition>
    <transition name="right-box">
      <chart-temp-box v-if="rightBox.chartTemp.show" :from="from" :obj="chart" :panel-data="panelData" :show-panel="showPanel" @close="closeRightBox" @on-create-success="createSuccess"></chart-temp-box>
    </transition>
    <!-- 快照进度 -->
    <snapshotProgress v-if="snapshotVisible" :showPanel="showPanel" :searchTime="searchTime" :snapshotVisible.sync="snapshotVisible"></snapshotProgress>
  </div>
</template>

<script>
// import chartBox from '../../../page/dashboard/chartBox'
import * as echarts from 'echarts'
import { chartCache } from '@/components/common/js/common'
import chartRightBox from '@/components/common/rightBox/chart/chartRightBox'
import chartList from '@/components/chart/chartList'
import bus from '../../../../libs/bus'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import { fromRoute } from '@/components/common/js/constants'
import chartTempBox from '@/components/common/rightBox/chartTempBox'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import htmlToPdfMixin from '@/components/common/mixin/htmlToPdfMixin'
import exportHtmlMixin from '@/components/common/mixin/exportHtml'
import panelVariables from '@/components/common/panel/panelVariables'
import snapshotProgress from '@/components/common/snapshotProgress/snapshotProgress.vue'

export default {
  name: 'dashboardTab',
  mixins: [subDataListMixin, detailViewRightMixin, htmlToPdfMixin, exportHtmlMixin],
  props: {
    from: String,
    obj: Object,
    draggable: { type: Boolean, default: true },
    paramsType: {
      type: String,
      default: 'dashboard'
    },
    sign: [Number, String]
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
    },
    timePickerLocked () {
      return this.$store.getters.getTimePickerLocked
    },
    timePickerRange () {
      return this.$store.getters.getTimePickerRange
    }
  },
  data () {
    return {
      fromRoute,
      tableId: 'dashboardTab',
      pdfId: 'pdfDom',
      htmlTitle: 'dashboard',
      dashboardLoading: false,
      showTopBtn: false, // top按钮
      visible: false,
      chartListLoading: true,
      rightBox: { // 面板弹出框相关
        chart: {
          show: false
        },
        chartTemp: {
          show: false
        }
      },
      tableHover: false,
      searchTime: bus.getTimezontDateRange(),
      intervalTimer: null,
      interval: 0,
      panel: { // 新增panel
        id: '',
        name: ''
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
        pageSize: -1, // 此处获取所有数据，所以设置一个较大的值
        total: 0
      },
      chartsData: [], // 中间部分图表相关数据
      panelData: [],
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
        ]
      },
      searchLabel: {}, // 搜索参数
      // ---图表相关参数--start
      dataList: [], // 数据列表
      filter: { // 过滤条件
        // productId: 0,
        dashboardId: 0,
        from: this.from
      },
      showPanel: {
        name: '',
        type: this.from,
        id: null
      },
      blankChartTemp: {
        varType: 1,
        pid: '',
        dashboardId: null,
        varIds: []
      },
      // removeModal: false, // 删除弹出
      // deleteObj: {}, // 删除对象
      // ---图表相关参数--end
      scrollbarWrap: null,
      panelDataList: [],
      batchDeleteObjs: [],
      nowTimeType: {},
      chartDetailInfo: {},
      variables: [],
      variablesInit: false,
      snapshotVisible: false,
      timeData: [
        { id: 1, text: this.$t('dashboard.dashboard.lastFiveMin'), type: 'minute', value: 5 },
        { id: 2, text: this.$t('dashboard.dashboard.lastFifteenMin'), type: 'minute', value: 15 },
        { id: 3, text: this.$t('dashboard.dashboard.lastThirtyMin'), type: 'minute', value: 30 },
        { id: 4, text: this.$t('dashboard.dashboard.lastOneHour'), type: 'hour', value: 1 },
        { id: 5, text: this.$t('dashboard.dashboard.lastThreeHour'), type: 'hour', value: 3 },
        { id: 6, text: this.$t('dashboard.dashboard.lastSixHour'), type: 'hour', value: 6 },
        { id: 7, text: this.$t('dashboard.dashboard.lastTwelveHour'), type: 'hour', value: 12 },
        { id: 8, text: this.$t('dashboard.dashboard.lastTwentyFourHour'), type: 'hour', value: 24 },
        { id: 9, text: this.$t('dashboard.dashboard.lastTwoDay'), type: 'date', value: 2 },
        { id: 10, text: this.$t('dashboard.dashboard.lastSevenDay'), type: 'date', value: 7 },
        { id: 11, text: this.$t('dashboard.dashboard.lastThirtyDay'), type: 'date', value: 30 }
      ],
      intervalList: [
        { value: 0, label: this.$t('dashboard.dashboard.chartForm.lockList.off') },
        { value: 30, label: '30s' },
        { value: 60, label: '1m' },
        { value: 300, label: '5m' },
        { value: 900, label: '15m' },
        { value: 1800, label: '30m' }
      ]
    }
  },
  components: {
    chartRightBox,
    chartList,
    nzBottomDataList,
    topToolMoreOptions,
    chartTempBox,
    panelVariables, // 处理panel变量的组件
    snapshotProgress // 快照进度
  },
  methods: {
    // 刷新
    refresh () {
      this.getTableData(this.obj.id)
    },
    refreshPanel () {
      this.getData(this.filter)
    },
    refreshTime (st, et) {
      const startTime = bus.timeFormate(st)
      const endTime = bus.timeFormate(et)
      this.searchTime = [startTime, endTime]
    },
    panelReloadForDel () {
      this.getTableData(this.obj.id)
    },
    panelReload (clearShowPanel) {
      this.getTableData(clearShowPanel)
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
      if (this.from === fromRoute.endpoint) {
        this.chart.varType = 2
      }
      if (this.from === fromRoute.asset || this.from === fromRoute.endpoint) {
        this.chart.varIds.push(this.obj.id)
      }
      this.rightBox.chartTemp.show = true
    },
    newChart () {
      return JSON.parse(JSON.stringify(this.blankChart))
    },

    // 切换tab
    changeTab (tab) {
      this.$emit('changeTab', tab)
    },
    closeRightBox (refresh) {
      this.rightBox.chart.show = false
      this.rightBox.chartTemp.show = false
      this.$store.dispatch('clearPanel')
      this.chart = {}
      if (refresh) {
        this.refresh()
        if (this.from === fromRoute.chartTemp) {
          this.$get('/visual/dashboard/chart', { ids: this.obj.id }).then(res => {
            res.data.list.forEach(item => {
              if (!item.children) {
                item.children = []
              }
            })
            this.panelDataList = res.data.list
            if (this.panelDataList.length > 0) {
              this.showPanel.id = this.filter.dashboardId = 0
              this.getData(this.filter)
            } else {
              this.chartListLoading = false
              this.dataList = this.panelDataList
              this.$emit('exit')
            }
          })
          this.$emit('getTableData')
        }
      }
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
        if (this.chart.datasource !== 'metrics' && this.chart.datasource !== 'log') {
          delete this.chart.elements
        }
        if (!this.chart.groupId || this.chart.groupId == -1) {
          this.chart.groupId = ''
        }
        if ((this.chart.type === 'line' || this.chart.type === 'area' || this.chart.type === 'point') && !this.chart.param.rightYAxis) {
          this.chart.param.rightYAxis = {
            elementNames: [],
            style: 'line',
            unit: 2,
            label: '',
            min: undefined,
            max: undefined
          }
        }
        if (this.chart.type === 'stat') {
          if (!this.chart.param.sparklineMode) { this.chart.param.sparklineMode = 'none' }
          if (!this.chart.param.comparison) { this.chart.param.comparison = 'none' }
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
            if (!this.chart.groupId || this.chart.groupId == -1) {
              this.chart.groupId = ''
            }
            if ((this.chart.type === 'line' || this.chart.type === 'area' || this.chart.type === 'point') && !this.chart.param.rightYAxis) {
              this.chart.param.rightYAxis = {
                elementNames: [],
                style: 'line',
                unit: 2,
                label: '',
                min: undefined,
                max: undefined
              }
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
            this.$nextTick(() => {
              this.$refs.addChartModal.isStable = 'stable'
            })
          } else {
            this.$message.error(res.msg)
          }
        })
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
            this.closeRightBox(true)
          } else {
            this.$message.error(response.msg)
            this.$store.dispatch('clearPanel')
          }
        })
      }).catch(() => {
        this.$store.dispatch('clearPanel')
      })
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
    // 图表创建成功，回调panel页面，进行图表的刷新
    createSuccess (msg, data, params) {
      this.getData(this.filter)
    },
    // 获取数据,用在子页面
    getData (params) {
      if (!this.hasButton('dashboard_view')) {
        return
      }
      this.chartListLoading = true
      if (this.from !== 'chartTemp') {
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
      } else {
        this.chartListLoading = false
        this.dataList = this.panelDataList
      }
    },

    /* 图表相关操作--end */
    /* 时间条件查询--start */
    // 选择日期变化
    dateChange (val) {
      if (this.$refs.pickTime) {
        const nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
        this.nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
        this.setSearchTime(nowTimeType.type, nowTimeType.value)
        this.filter.dashboardId = this.showPanel.id
        this.getData(this.filter)
        this.$store.dispatch('dispatchPanelTime', {
          time: this.searchTime,
          nowTimeType: this.nowTimeType
        })
        this.$store.dispatch('dispatchTimePickerRange', {
          time: this.searchTime,
          nowTimeType: this.nowTimeType
        })
      }
    },
    /* 时间条件查询--end */
    setSearchTime (type, val) { // 设置searchTime
      if (type === 'minute') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - val))
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'm')
      } else if (type === 'hour') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - val))
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'h')
      } else if (type === 'date') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setDate(new Date(bus.computeTimezone(new Date().getTime())).getDate() - val))
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'd')
      }
      this.$refs.pickTime.$refs.timePicker.searchTime = this.searchTime
      this.$store.dispatch('dispatchPanelTime', {
        time: this.searchTime,
        nowTimeType: this.nowTimeType
      })
    },
    getVarType (from) {
      if (from === this.fromRoute.asset) {
        return 1
      }
    },
    // 公用操作
    async getTableData (linkId) {
      if (this.from === this.fromRoute.alertRule) {
        this.getData(this.filter)
      } else {
        if (this.from === this.fromRoute.dashboardTemp) {
          try {
            const response = await this.$get('visual/dashboard', { type: 'template', ids: this.obj.id })
            if (response.code === 200) {
              this.panelData = response.data.list
              if (this.panelData.length > 0) {
                this.filter.dashboardId = this.panelData[0].id
                this.showPanel = this.$lodash.cloneDeep(this.panelData[0])
                this.variables = this.$lodash.cloneDeep(this.$lodash.get(this, 'showPanel.param.variables', []) || [])
                this.getData(this.filter)
              }
            }
          } catch (error) {
            if (error) {
              console.error(error)
              this.$message.error(error.toString())
            }
          }
        } else {
          try {
            const response = await this.$get('visual/dashboard', { type: this.from, link: linkId || this.obj.id })
            if (response.code === 200) {
              this.panelData = response.data.list
              if (this.panelData.length > 0) {
                this.filter.dashboardId = this.panelData[0].id
                this.showPanel = this.$lodash.cloneDeep(this.panelData[0])
                this.variables = this.$lodash.cloneDeep(this.$lodash.get(this, 'showPanel.param.variables', []) || [])
                this.getData(this.filter)
              } else {
                this.chartListLoading = false
              }
            } else {
              this.chartListLoading = false
              if (response.msg) {
                console.error(response.msg)
                this.$message.error(response.msg)
              } else if (response.error) {
                console.error(response.error)
                this.$message.error(response.error)
              } else {
                console.error(response)
                this.$message.error(response)
              }
            }
          } catch (error) {
            if (error) {
              console.error(error)
              this.$message.error(error.toString())
            }
          }
        }
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
    // 滚动事件触发下拉加载
    onScroll () {
      const _self = this
      this.scrollbarWrap.addEventListener('scroll', bus.debounce(function () {
        _self.showTopBtn = _self.scrollbarWrap.scrollTop > 50
        // _self.$refs.chartList.loadChartData(_self.scrollbarWrap.scrollTop)
        _self.$refs.chartList.onScroll(_self.scrollbarWrap.scrollTop)
      }, 300))
    },
    syncChart () {
      if (this.from == this.fromRoute.asset || this.from == this.fromRoute.model) {
        this.$confirm(this.$t('tip.syncTip'), {
          confirmButtonText: this.$t('tip.yes'),
          cancelButtonText: this.$t('tip.no'),
          type: 'warning'
        }).then(() => {
          const param = {
            modelId: this.from == this.fromRoute.model ? this.obj.id : null,
            assetId: this.from == this.fromRoute.asset ? this.obj.id : null
          }
          this.$put('/model/syncChart', param).then(response => {
            if (response.code == 200) {
              this.$message({ duration: 1000, type: 'success', message: this.$t('tip.syncSuccess') })
              if (this.from == this.fromRoute.asset) {
                this.refresh()
              }
            } else {
              console.error(response.msg)
              this.$message.error(response.msg)
            }
          })
        })
      }
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
    tableListEnter () {
      this.tableHover = true
    },
    tableListLeave () {
      this.tableHover = false
    },
    panelLockChange (boolean) {
      this.$store.dispatch('dispatchPanelLock', { flag: boolean })
    },
    chartBySync () {
      this.$store.dispatch('dispatchHomeLoading', true)
      const params = {}
      params.tmplId = this.showPanel.id
      this.$post('visual/dashboard/syncTmpl', params).then(res => {
        this.$store.dispatch('dispatchHomeLoading', false)
        if (res.code === 200) {
          this.getTableData(this.obj.id)
          this.$message.success(this.$t('tip.syncSuccess'))
        } else {
          this.$message.error(res.msg)
        }
      })
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
    htmlToPdf () {
      const dom = document.getElementsByClassName(this.pdfId)[0]
      this.htmlTitle = this.obj.name || 'pdf'
      if (dom) {
        // dom = dom.getElementsByClassName('vue-grid-layout')[0]
        this.scrollbarWrap.scrollTop = this.scrollbarWrap.scrollHeight
        this.$refs.chartList.onScroll(this.scrollbarWrap.scrollTop)
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
        this.snapshotVisible = true
      }
    },
    getPanelData () {
      this.variablesInit = true
      this.$nextTick(() => {
        this.$refs.chartList.onScroll(this.scrollbarWrap.scrollTop)
      })
    },
    // 时间选择器设置默认时间范围
    setDefaultTimeRange () {
      this.$nextTick(() => {
        let nowTimeType = this.$lodash.cloneDeep(this.timeData[3])
        const defaultTimeRange = this.$lodash.get(this.showPanel, 'param.defaultTimeRange')
        if (defaultTimeRange) {
          nowTimeType = this.timeData.find(item => item.id == defaultTimeRange)
        }
        this.nowTimeType = this.$lodash.cloneDeep(nowTimeType)
        // 刷新时间范围
        this.$refs.pickTime.$refs.timePicker.setTimeRange(this.nowTimeType)
        this.setSearchTime(nowTimeType.type, nowTimeType.value, nowTimeType)
        this.$store.dispatch('dispatchPanelTime', {
          time: this.searchTime,
          nowTimeType: this.nowTimeType
        })
        // this.$store.dispatch('dispatchTimePickerRange', {
        //   time: this.searchTime,
        //   nowTimeType: this.nowTimeType
        // })
      })
    },
    setTimePickerRange () {
      this.$nextTick(() => {
        if (!this.timePickerLocked || !this.timePickerRange.nowTimeType) {
          this.setDefaultTimeRange()
        }
        const nowTimeType = this.nowTimeType = this.timePickerRange.nowTimeType
        this.searchTime = this.timePickerRange.time
        this.$refs.pickTime && this.$refs.pickTime.$refs.timePicker.setTimeRange(this.nowTimeType, this.searchTime)
        this.setSearchTime(nowTimeType.type, nowTimeType.value, nowTimeType)
      })
    },
    // 设置默认刷新
    setDefaultRefresh () {
      this.$nextTick(() => {
        let refresh = this.$lodash.cloneDeep(this.intervalList[0])
        const defaultRefresh = this.$lodash.get(this.showPanel, 'param.refresh')
        if (defaultRefresh) {
          refresh = this.intervalList.find(item => item.value == defaultRefresh)
        }
        this.$refs.pickTime.selectInterval(refresh)
      })
    }
  },
  mounted () {
    bus.$on('refreshPanel', this.refreshPanel)
    this.scrollbarWrap = this.$refs.dashboardScrollbar
    document.querySelector('#tableList').addEventListener('mouseenter', this.tableListEnter)
    document.querySelector('#tableList').addEventListener('mouseleave', this.tableListLeave)
    this.$store.dispatch('dispatchPanelTime', {
      time: this.searchTime,
      nowTimeType: this.nowTimeType
    })
  },
  watch: {
    obj: {
      immediate: true,
      handler (n, o) {
        setTimeout(async () => {
          if (n && n.id) {
            this.searchLabel = {}
            if (this.from === fromRoute.asset) {
              this.searchLabel.assetIds = n.id
            }
            this.getTableData(n.id)
          }
          this.chartDetailInfo = n
        }, 500)
      }
    },
    showPanel: {
      handler () {
        if (this.from !== this.fromRoute.dashboardTemp) {
          if (this.timePickerLocked && this.timePickerRange && this.timePickerRange.nowTimeType) {
            this.setTimePickerRange()
          } else {
            this.setDefaultTimeRange()
          }
          this.setDefaultRefresh()
        }
        this.onScroll()
      }
    },
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
    chartRightBoxShow: {
      immediate: false,
      deep: true,
      handler (n) {
        if (n) {
          this.disposeChart()
        } else {
          this.$refs.addChartModal.isStable = 'instability'
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
    }
  },
  beforeDestroy () {
    bus.$off('refreshPanel')
    document.querySelector('#tableList') && document.querySelector('#tableList').removeEventListener('mouseenter', this.tableListEnter)
    document.querySelector('#tableList') && document.querySelector('#tableList').removeEventListener('mouseleave', this.tableListLeave)
    this.scrollbarWrap && this.scrollbarWrap.removeEventListener('scroll', bus.debounce)
    this.$store.dispatch('dispatchPanelLock', { flag: true })

    // 页面销毁 清除图表联动
    this.$store.commit('setCurrentMousemove', 0)
    this.$store.commit('setConnect', 'none')
    echarts.disconnect('timeSeriesGroup')
  }
}
</script>
