<template>
  <div class="panel list-page" v-loading="panelTabLoading">
    <div class="main-list">
      <div>
        <transition name="el-zoom-in-center">
          <div v-if="isLoading" class="panel-loading"></div>
        </transition>
      </div>
      <div class="main-container">
        <div class="top-tools">
          <div v-if="panelData.length === 0" class="top-tool-left" style="margin-left: 10px;">
            <button id="panel-add-panel" class="nz-btn nz-btn-style-light nz-btn-size-small" @click="toAdd"><i class="nz-icon nz-icon-create-square"></i>&nbsp;&nbsp;{{$t("dashboard.panel.createPanelTitleSec")}}</button>
          </div>
          <template v-else>
            <div class="top-tool-left" style="cursor: pointer;">
              <select-panel ref="selectPanel" :filter-panel="filterPanel" :panel-data="panelData" :panel-lock="panelLock" :placement="'bottom-start'"
                            :show-panel="showPanel" style="display: inline-block;padding: 0" @deletePanel="del" @editPanel="edit" @selectPanel="panelChange">
                <template v-slot:header>
                  <div class="panel-select-header">
                    <el-input id="panel-list-search" v-model="filterPanel" :placeholder="$t('overall.search')" clearable size="mini" style="width: 286px;"></el-input>
<!--                    <span id="panel-list-toadd" v-has="'panel_add'" :title='$t("dashboard.panel.createPanelTitleSec")' class="panel-select-add" @click="toAdd"><i class="nz-icon nz-icon-plus"></i></span>-->
                  </div>
                </template>
                <template v-slot:trigger>
                  <i style="color: #BEBEBE" class="el-icon-menu"></i>
                  <span :title="showPanel.name  + ' (' + showPanel.chartNum +' charts）' " class="show-panel-name">{{showPanel.name}}</span>
                  <i style="font-size: 12px;color: #BEBEBE;" class="nz-icon nz-icon-arrow-down"></i>
                </template>
                <template v-slot:tail>
                  <div class="panel-select-tail">
                    <span id="panel-list-toadd" v-has="'panel_add'" :title='$t("dashboard.panel.createPanelTitleSec")' class="panel-select-add" @click="toAdd"><i class="nz-icon nz-icon-create-square"></i>&nbsp;&nbsp;{{ $t('overall.addProject') }}</span>
                  </div>
                </template>
              </select-panel>
            </div>
            <div class="top-tool-right">
              <div class="top-tool-search margin-r-20">
                <el-input id="queryPanel" ref="queryPanel" v-model="filter.searchName" class="query-input-inactive"  clearable size="small" @blur="blurInput" @clear="clearInput" @focus="focusInput">
                  <i slot="suffix" class="el-input__icon nz-icon nz-icon-search" style="float: right" @click="focusInput"></i>
                </el-input>
              </div>

              <pick-time id="panel" ref="pickTime" v-model="searchTime" :refresh-data-func="dateChange" :use-chart-unit="false" class="margin-r-10"></pick-time>

              <button id="panel-add-chart" v-has="'panel_chart_add'" :title="$t('overall.createChart')" class="top-tool-btn margin-r-10"
                      type="button" @click="addChart">
                <i class="nz-icon-create-square nz-icon"></i>
              </button>

             <top-tool-more-options
                :delete-objs="batchDeleteObjs"
                id="panel"
                :params="filter"
                :permissions="{
                  import: 'panel_chart_add',
                  export: 'panel_view'
                }"
                :paramsType="'dashboard'"
                class="top-tool-export"
                export-file-name="chart"
                export-url="/visual/panel/export"
                import-url="/visual/panel/import"
                @afterImport="dateChange"
              >
                <template v-slot:before>
                  <el-dropdown-item>
                    <div id="panel-lock" @click="panelLock=!panelLock"><i :class="{'nz-icon nz-icon-lock':panelLock,'nz-icon nz-icon-unlock':!panelLock}"></i>{{panelLock ? $t('overall.locked') : $t('overall.unlocked')}}</div>
                  </el-dropdown-item>
                </template>
                <template v-slot:after>
                  <el-dropdown-item v-has="'panel_chart_add'">
                    <div id="chart-temp-add" @click="addChartByTemp"><i class="nz-icon nz-icon-add"></i>{{$t('overall.AddByTemplate')}}</div>
                  </el-dropdown-item>
                  <el-dropdown-item v-has="'panel_chart_edit'">
                    <div id="chart-temp-sync" @click="chartBySync"><i class="nz-icon nz-icon-sync"></i>{{ $t('overall.syncChart') }}</div>
                  </el-dropdown-item>
                </template>
              </top-tool-more-options>
            </div>
          </template>
        </div>
        <div id="tableList" class="table-list">
          <div id="dashboardScrollbar" ref="dashboardScrollbar" class="table-list-box">
            <div class="box-content" v-loading="chartListLoading">
              <chart-list
                ref="chartList"
                :class="{'show-top':showTopBtn}"
                :data-list="dataList"
                :nowTimeType="nowTimeType"
                :from="fromRoute.panel"
                :panel-lock="panelLock"
                :time-range="searchTime"
                @edit-chart="editChart"
                @on-refresh-time="refreshTime"
                @on-remove-chart="delChart"
                @on-add-group-item-chart="addGroupItem"
                :loading="chartListLoading"
              ></chart-list>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button :class="{'to-top-is-hover': tableHover}" @click="toTop(scrollbarWrap)" class="to-top" style="bottom: 0;" v-show="showTopBtn"><i class="nz-icon nz-icon-top"></i></button>

    <transition name="right-box">
<!--      <chart-box-->
<!--        v-if="rightBox.chart.show"-->
<!--        ref="addChartModal"-->
<!--        :chart="chart"-->
<!--        :from="fromRoute.panel"-->
<!--        :panel-data="panelData"-->
<!--        :show-panel="showPanel"-->
<!--        @close="closeChartBox"-->
<!--        @reload="panelReload"-->
<!--        @reloadOnlyPanel="panelReloadOnlyPanel"-->
<!--        @delete-chart="delChart"-->
<!--        @on-create-success="createSuccess"-->
<!--        @on-delete-success="delChartOk"-->
<!--      ></chart-box>-->
      <chart-right-box
        v-if="rightBox.chart.show"
        ref="addChartModal"
        :chart="chart"
        :from="fromRoute.panel"
        :panel-data="panelData"
        :show-panel="showPanel"
        @close="closeChartBox"
        @reload="panelReload"
        @reloadOnlyPanel="panelReloadOnlyPanel"
        @delete-chart="delChart"
        @on-create-success="createSuccess"
        @on-delete-success="delChartOk"
      ></chart-right-box>
    </transition>
    <transition name="right-box">
      <chart-temp-box v-if="rightBox.chartTemp.show" :from="fromRoute.panel" :obj="chart" :panel-data="panelData" :show-panel="showPanel" @close="closeChartTempBox" @on-create-success="createSuccess"></chart-temp-box>
    </transition>
    <transition name="right-box">
      <panel-box v-if="rightBox.panel.show" ref="panelBox" :obj="panel" @close="closePanelBox" @reload="panelReload" @reloadForDel="panelReloadForDel" ></panel-box>
    </transition>
  </div>
</template>

<script>
import ChartBox from './chartBox'
import chartRightBox from '@/components/common/rightBox/chart/chartRightBox'
import ChartList from '../../chart/chartList'
import bus from '../../../libs/bus'
import pickTime from '../../common/pickTime'
import selectPanel from '../../common/popBox/selectPanel'
import panelBox from '@/components/common/rightBox/panelBox'
import chartTempBox from '@/components/common/rightBox/chartTempBox'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import { fromRoute } from '@/components/common/js/constants'
import chartData from '@/components/chart/testData'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'

export default {
  name: 'panel',
  data () {
    return {
      fromRoute,
      panelTabLoading: false,
      overScroll10: false,
      isLoading: true,
      panelLock: false,
      showTopBtn: false, // top按钮
      visible: false,
      chartListLoading: true,
      rightBox: { // 面板弹出框相关
        chart: { show: false },
        chartTemp: { show: false },
        panel: { show: false }
      },
      tableHover: false,
      searchTime: bus.getTimezontDateRange(),
      intervalTimer: null,
      interval: 0,
      showPanel: { // panel下拉列表
        id: '',
        name: '',
        type: 'panel'
      },
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
          thresholdShow: true,
          thresholds: [{ value: undefined, color: randomcolor() }]
        },
        elements: [{ expression: '', legend: '', type: 'expert', id: '', name: 'A' }],
        panel: '',
        sync: 0,
        remark: '',
        groupId: ''
      },
      pageObj: {
        pageNo: 1,
        pageSize: -1, // 此处获取所有数据，所以设置一个较大的值
        total: 0
      },
      blankChartTemp: {
        varType: 1,
        pid: '',
        panelId: '',
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
            name: this.$t('dashboard.panel.chartForm.varType'),
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
        panelId: 0,
        start_time: '',
        end_time: '',
        searchName: '',
        id: 4
      },
      panelId: 0,
      filterPanel: '',
      // ---图表相关参数--end
      scrollbarWrap: null,
      batchDeleteObjs: [],
      nowTimeType: {}
    }
  },
  components: {
    'chart-box': ChartBox,
    'chart-list': ChartList,
    'pick-time': pickTime,
    'panel-box': panelBox,
    topToolMoreOptions,
    selectPanel,
    chartTempBox,
    chartRightBox
  },
  methods: {
    // 刷新
    Refresh () {
      const curTime = this.$refs.calendarPanel.getCurrentTime()
      this.filter.start_time = bus.timeFormate(curTime[0], 'yyyy-MM-dd hh:mm:ss')
      this.filter.end_time = bus.timeFormate(curTime[1], 'yyyy-MM-dd hh:mm:ss')
      this.getTableData()
    },
    // 面板相关操作
    panelChange (val) {
      if (!val) {
        return false
      }
      this.filter.searchName = ''
      // this.$refs.searchInput.select();
      this.showPanel = val
      this.showPanel.type = 'dashboard'
      this.filter.panelId = this.showPanel.id
      this.dateChange()
      this.$refs.chartList.cleanData()
    },

    del (u) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('visual/panel?ids=' + u.id).then(response => {
          if (response.code === 200) {
            this.$message({
              duration: 1000,
              type: 'success',
              message: this.$t('tip.deleteSuccess')
            })
            this.getTableData(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    edit (u) {
      this.panel = Object.assign({}, u)
      this.rightBox.panel.show = true
    },
    toAdd () {
      if (!this.hasButton('panel_view')) {
        return
      }
      this.rightBox.panel.show = true
      this.$refs.panelBox.show(true)
      this.panel = {
        id: '',
        name: ''
      }
      this.$refs.panelBox.setTitle(this.$t('dashboard.panel.createPanelTitle'))
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
      this.chart.panelId = this.showPanel.id
      this.chart.panelName = this.showPanel.name
      this.rightBox.chart.show = true
    },
    addChartByTemp () {
      this.chart = Object.assign({}, this.blankChartTemp)
      this.chart.panelId = this.showPanel.id
      this.rightBox.chartTemp.show = true
    },
    chartBySync () {
      this.panelTabLoading = true
      this.$post('visual/panel/chart/syncTmpl', { panelId: this.showPanel.id }).then(res => {
        this.panelTabLoading = false
        if (res.code === 200) {
          this.getData(this.filter)
          this.$message.success(this.$t('tip.syncSuccess'))
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    addGroupItem (groupId) {
      this.chart = this.newChart()
      this.chart.groupId = groupId
      this.chart.panelId = this.showPanel.id
      this.chart.panelName = this.showPanel.name
      this.chart.isGroup = true
      this.rightBox.chart.show = true
    },
    newChart () {
      return JSON.parse(JSON.stringify(this.blankChart))
    },
    // 编辑图表信息,打开编辑弹窗
    editChart (data, copy) {
      if (copy) {
        this.chart = JSON.parse(JSON.stringify(data))
        this.chart.panelId = this.showPanel.id
        this.chart.panelName = this.showPanel.name
        this.rightBox.chart.show = true
      } else {
        this.$get('visual/panel/chart/' + data.id).then(res => {
          if (res.code === 200) {
            const chartData = res.data.data
            this.chart = JSON.parse(JSON.stringify(chartData))
            this.chart.panelId = this.showPanel.id
            this.chart.panelName = this.showPanel.name
            this.chart.param = JSON.parse(this.chart.param)
            this.chart.datasource = 'metrics'
            if (!this.chart.groupId || this.chart.groupId == -1) {
              this.chart.groupId = ''
            }
            this.rightBox.chart.show = true
          } else {
            this.$message.error(res.msg)
          }
        })
      }
    },
    closeChartBox (refresh) {
      this.rightBox.chart.show = false
      /* if (refresh) {
         this.getData(this.filter)
      } */
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
        this.$delete('visual/panel/chart?ids=' + data.id).then(response => {
          if (response.code === 200) {
            this.$message({
              duration: 2000,
              type: 'success',
              message: this.$t('tip.deleteSuccess')
            })
            this.rightBox.chart.show = false
            const chartList = this.$refs.chartList.dataList
            for (let i = 0; i < chartList.length; i++) {
              /* if (chartList[i].id === data.id) {
                chartList.splice(i, 1)
              }
              if (chartList[i].type === 'group') {
                chartList[i].children = chartList[i].children.filter((item) => item.id !== data.id)
              } */
              // if(data.next != -1){
              //   if(chartList[i].id === data.next){
              //     nextChart = chartList[i]
              //   }
              // }
              // if(data.prev != 0){
              //   if(chartList[i].id === data.prev){
              //     prevChart = chartList[i]
              //   }
              // }
            }
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
          }
        })
      })
    },
    delChartOk () {
      this.filter.panelId = this.showPanel.id
      this.getData(this.filter)
    },
    // 图表创建成功，回调panel页面，进行图表的刷新
    createSuccess (msg, data, params, panel) {
      this.filter.panelId = this.showPanel.id
      this.getData(this.filter)
    },
    // 获取数据,用在子页面
    getData (params) {
      if (!this.hasButton('panel_view')) {
        return
      }
      this.chartListLoading = true
      if (params.start_time === '' || params.end_time === '') {
        const now = bus.getTimezontDateRange()
        const endTimeTmp = bus.timeFormate(now[1].getTime(), 'yyyy-MM-dd hh:mm:ss')
        const startTimeTmp = bus.timeFormate(now[0].getTime(), 'yyyy-MM-dd hh:mm:ss')
        params.start_time = startTimeTmp
        params.end_time = endTimeTmp
      }
      this.$get('visual/panel/chart?panelId=' + params.panelId + '&groupId=0' + '&pageSize=-1').then(response => {
        if (response.code === 200) {
          this.chartListLoading = false
          this.dataList = chartData.data.list.map(item => {
            return {
              ...item,
              hide: item.name.indexOf(this.filter.searchName) === -1, // 搜索条件
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
      this.filter.start_time = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss')
      this.filter.end_time = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss')
      this.filter.end_time = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss')
      this.filter.value = this.searchTime[2]
      this.filter.id = this.$refs.pickTime.$refs.timePicker.showTime.id
      this.getTableData()
      this.getData(this.filter)
    },
    setSearchTime (type, val, nowTimeType) { // 设置searchTime
      if (type === 'minute') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - val), 'yyyy-MM-dd hh:mm:ss')
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), 'yyyy-MM-dd hh:mm:ss')
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'm')
      } else if (type === 'hour') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - val), 'yyyy-MM-dd hh:mm:ss')
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), 'yyyy-MM-dd hh:mm:ss')
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'h')
      } else if (type === 'date') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setDate(new Date(bus.computeTimezone(new Date().getTime())).getDate() - val), 'yyyy-MM-dd hh:mm:ss')
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), 'yyyy-MM-dd hh:mm:ss')
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'd')
      }
      this.$refs.pickTime.$refs.timePicker.searchTime = this.searchTime
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
      if (!this.hasButton('panel_view')) {
        return
      }
      this.$get('visual/panel?pageSize=-1').then(response => {
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

      this.$get('visual/panel?type=dashboard&pageSize=-1').then(response => {
        if (response.code === 200) {
          this.panelData = response.data.list
          let isInitData = false
          if (response.data.list.length > 0) {
            if (this.$store.state.showPanel.id > 0 && this.$store.state.showPanel.name) {
              this.showPanel = JSON.parse(JSON.stringify(this.$store.state.showPanel))
            }
            if (clearShowPanel) {
              this.showPanel.id = ''
            }
            if (!this.showPanel.id) {
              this.showPanel = response.data.list[0]
              this.filter.panelId = this.showPanel.id
              this.getData(this.filter)
              isInitData = true
            } else {
              handler(response.data.list)
              this.filter.panelId = this.showPanel.id
            }
            this.$nextTick(() => {
              try {
                this.$refs.selectPanel.$refs.panelTree.setCurrentKey(this.showPanel)
              } catch (e) {}
            })
            this.isLoading = false
          } else {
            this.showPanel.id = ''
            this.filter.panelId = ''
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
    search: function () {
      if (this.$refs.chartList) {
        // this.$refs.chartList.searchCharts(this.filter.searchName)
      }
    },
    // 滚动事件触发下拉加载
    onScroll () {
      const _self = this
      this.scrollbarWrap.addEventListener('scroll', bus.debounce(function () {
        _self.showTopBtn = _self.scrollbarWrap.scrollTop > 50
        _self.overScroll10 = _self.scrollbarWrap.scrollTop > 50
        // _self.$refs.chartList.loadChartData(_self.scrollbarWrap.scrollTop)
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

    }
  },
  created () {
    this.getTableData()
  },
  mounted () {
    this.scrollbarWrap = this.$refs.dashboardScrollbar
    this.onScroll()
    document.querySelector('#tableList').addEventListener('mouseenter', this.tableListEnter)
    document.querySelector('#tableList').addEventListener('mouseleave', this.tableListLeave)
  },
  watch: {
    'filter.searchName': function (n, o) {
      const temp = this
      setTimeout(function () {
        temp.search()
      }, 1000)
    },
    searchTime: {
      immediate: true,
      deep: true,
      handler (n) {
        localStorage.setItem('panelTime', JSON.stringify(n))
      }
    },
    $route: {
      immediate: true,
      handler () {
        // 是否弹出侧滑
        const add = this.$route.query.add
        this.$nextTick(() => {
          if (add) {
            if (add === 'chart') {
              this.addChart()
            }
            if (add === 'panel') {
              this.toAdd()
            }
          }
        })
      }
    }
  },
  beforeDestroy () {
    if (document.querySelector('#tableList')) {
      document.querySelector('#tableList').removeEventListener('mouseenter', this.tableListEnter)
      document.querySelector('#tableList').removeEventListener('mouseleave', this.tableListLeave)
    }
    if (this.scrollbarWrap) {
      this.scrollbarWrap.removeEventListener('scroll', bus.debounce)
    }
    localStorage.removeItem('panelTime')
  }
}
</script>
