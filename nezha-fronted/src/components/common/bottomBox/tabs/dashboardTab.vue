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
          <pick-time ref="pickTime" v-model="searchTime" :refresh-data-func="dateChange" :use-chart-unit="false" :sign="'dashboard' + obj.id"></pick-time>
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
            import-url="/visual/dashboard/import"
            @afterImport="getTableData"
            :link="obj"
            :showLock="from === fromRoute.asset"
            :exportBoxShow="true"
            @export="exportType"
            @panelLockChange="panelLockChange"
          >
            <template v-slot:after>
              <!-- <el-dropdown-item v-has="'main_add'">
                <div id="chart-temp-add" @click="addChartByTemp"><i class="nz-icon nz-icon-add"></i>{{ $t('overall.AddByTemplate') }}</div>
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
        <!-- endpoint -->
        <div v-else-if="from === fromRoute.endpoint" style="display: flex">
          <pick-time ref="pickTime" v-model="searchTime" :refresh-data-func="dateChange" :use-chart-unit="false" :sign="'dashboard' + obj.id"></pick-time>
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
            import-url="/visual/dashboard/import"
            @afterImport="getTableData"
            :exportBoxShow="true"
            @export="exportType"
            @panelLockChange="panelLockChange"
          >
            <template v-slot:after>
              <!-- <el-dropdown-item v-has="'main_add'">
                <div id="chart-temp-add" @click="addChartByTemp"><i class="nz-icon nz-icon-add"></i>{{ $t('overall.AddByTemplate') }}</div>
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
        <!-- chartTemp -->
        <!-- <div v-else-if="from === fromRoute.chartTemp">
          <button id="panel-lock" :title='panelLock ? $t("overall.unlocked") : $t("overall.locked")'  class="top-tool-btn margin-r-10" @click="panelLockChange(!panelLock)" type="button">
            <i :class="{'nz-icon nz-icon-lock':!panelLock,'nz-icon nz-icon-unlock':panelLock}"></i>
          </button>
          <button @click="chartBySync" id="chart-sync"  :title="$t('overall.syncChart')" class="top-tool-btn margin-r-10" type="button">
            <i class="nz-icon nz-icon-sync"></i>
          </button>
        </div> -->
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
          <div class="box-content"  ref="dashboardScrollbar" v-my-loading="chartListLoading" style="overflow-y: auto;display: flex;flex-direction: column;overflow-x: hidden">
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
     <!-- <chart-box v-if="rightBox.chart.show" ref="addChartModal" :chart="chart" :from="from" :panel-data="panelData" :show-panel="showPanel" @close="closeRightBox" @delete-chart="delChart" @on-create-success="createSuccess" @on-delete-success="delChartOk"></chart-box> -->
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
        @delete-chart="delChart"
        @on-create-success="createSuccess"
        @on-delete-success="delChartOk"
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
            visibility: false
          },
          thresholdShow: true,
          thresholds: [{ value: undefined, color: randomcolor() }],
          showHeader: 1,
          visibility: {
            varName: '',
            operator: 'equal',
            varValue: '',
            result: 'show'
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
      // searchName: '', //  搜索名称
      filter: { // 过滤条件
        // productId: 0,
        dashboardId: 0,
        start_time: '',
        end_time: '',
        searchName: ''
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
      snapshotVisible: false
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
      } else {
        this.rightBox.loading = true
        this.$get('visual/dashboard/chart/' + data.id).then(res => {
          this.rightBox.loading = false
          if (res.code === 200) {
            const chartData = res.data
            this.chart = JSON.parse(JSON.stringify(chartData))
            this.chart.dashboardId = this.showPanel.id
            this.chart.panelName = this.showPanel.name
            this.chart.param = JSON.parse(this.chart.param)
            if (!this.chart.groupId || this.chart.groupId == -1) {
              this.chart.groupId = ''
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
      this.rightBox.chart.show = true
    },
    delChartOk () {
      this.getData(this.filter)
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
      if (params.start_time === '' || params.end_time === '') {
        const now = bus.getTimezontDateRange()
        const endTimeTmp = bus.timeFormate(now[1].getTime(), 'YYYY-MM-DD HH:mm:ss')
        const startTimeTmp = bus.timeFormate(now[0].getTime(), 'YYYY-MM-DD HH:mm:ss')
        params.start_time = startTimeTmp
        params.end_time = endTimeTmp
        params.from = this.from
      }
      if (this.from !== 'chartTemp') {
        this.$get('visual/dashboard/chart?dashboardId=' + params.dashboardId + '&groupId=0' + '&pageSize=-1').then(response => {
          if (response.code === 200) {
            this.chartListLoading = false
            this.dataList = response.data.list.map(item => {
              return {
                ...item,
                hide: item.name.indexOf(this.filter.searchName) === -1, // 搜索条件
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
      // this.searchTime = [...val];
      if (this.$refs.pickTime) {
        const nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
        this.nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
        this.setSearchTime(nowTimeType.type, nowTimeType.value)
        this.filter.start_time = bus.timeFormate(this.searchTime[0])
        this.filter.end_time = bus.timeFormate(this.searchTime[1])
        this.filter.dashboardId = this.showPanel.id
        this.getData(this.filter)
        this.$store.dispatch('dispatchPanelTime', {
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
    },
    getVarType (from) {
      if (from === this.fromRoute.asset) {
        return 1
      }
    },
    // 公用操作
    getTableData (linkId) {
      this.variablesInit = false
      if (this.from === this.fromRoute.alertRule) {
        this.variablesInit = true
        this.getData(this.filter)
      } else {
        if (this.from === this.fromRoute.chartTemp) {
          this.variablesInit = true
          if (this.obj.type === 'group') {
            this.$get('/visual/dashboard/chart', { ids: this.obj.id }).then(res => {
              this.panelDataList = res.data.list
              if (this.panelDataList.length > 0) {
                this.showPanel.id = this.filter.dashboardId = 0
                this.getData(this.filter)
              }
            })
            return
          }
          this.panelDataList = [this.obj]
          if (this.panelDataList.length > 0) {
            this.showPanel.id = this.filter.dashboardId = 0
            this.getData(this.filter)
          }
        } else if (this.from === this.fromRoute.dashboardTemp) {
          this.$get('visual/dashboard', { type: 'template', ids: this.obj.id }).then(response => {
            if (response.code === 200) {
              this.panelData = response.data.list
              if (this.panelData.length > 0) {
                this.filter.dashboardId = this.panelData[0].id
                this.showPanel = this.$loadsh.cloneDeep(this.panelData[0])
                this.variables = this.$loadsh.get(this.panelData, '[0].param.variables')
                this.getData(this.filter)
              }
            }
          }).catch((error) => {
            if (error) {
              console.error(error)
              this.$message.error(error.toString())
            }
          })
        } else {
          this.$get('visual/dashboard', { type: this.from, link: linkId || this.obj.id }).then(response => {
            if (response.code === 200) {
              this.panelData = response.data.list
              if (this.panelData.length > 0) {
                // this.showPanel.id = this.filter.dashboardId = this.panelData[0].id
                this.filter.dashboardId = this.panelData[0].id
                this.showPanel = this.$loadsh.cloneDeep(this.panelData[0])
                this.variables = this.$loadsh.get(this.panelData, '[0].param.variables')
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
          }).catch((error) => {
            if (error) {
              console.error(error)
              this.$message.error(error.toString())
            }
          })
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
    pageNo (val) {
      this.pageObj.pageNo = val
      this.getTableData(this.obj.id)
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      this.getTableData(this.obj.id)
    },
    search () {
      if (this.$refs.chartList) {
        this.$refs.chartList.searchCharts(this.filter.searchName)
      }
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
    focusInput () {
      let classVal = document.getElementById('queryPanel').parentElement.getAttribute('class')
      classVal = classVal.replace('query-input-inactive', 'query-input-active')
      document.getElementById('queryPanel').parentElement.setAttribute('class', classVal)
      this.$refs.queryPanel.focus()
    },
    blurInput () {
      if (!this.filter.searchName || this.filter.searchName == '') {
        setTimeout(function () {
          let classVal = document.getElementById('queryPanel').parentElement.getAttribute('class')
          classVal = classVal.replace('query-input-active', 'query-input-inactive')
          document.getElementById('queryPanel').parentElement.setAttribute('class', classVal)
        }, 100)
      }
    },
    clearInput () {
      this.$refs.queryPanel.focus()
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
      this.$refs.chartList.onScroll(this.scrollbarWrap.scrollTop)
    }
  },
  mounted () {
    bus.$on('refreshPanel', this.refreshPanel)
    this.scrollbarWrap = this.$refs.dashboardScrollbar
    this.onScroll()
    document.querySelector('#tableList').addEventListener('mouseenter', this.tableListEnter)
    document.querySelector('#tableList').addEventListener('mouseleave', this.tableListLeave)
    this.$store.dispatch('dispatchPanelTime', {
      time: this.searchTime,
      nowTimeType: this.nowTimeType
    })
  },
  watch: {
    'filter.searchName' (n, o) {
      const temp = this
      setTimeout(function () {
        temp.search()
      }, 1000)
    },
    obj: {
      immediate: true,
      handler (n, o) {
        setTimeout(() => {
          if (n && n.id) {
            this.searchLabel = {}
            this.getTableData(n.id)
            if (this.from === fromRoute.asset) {
              this.searchLabel.assetIds = n.id
            }
          }
          this.chartDetailInfo = n
        }, 500)
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
    }
  },
  beforeDestroy () {
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
