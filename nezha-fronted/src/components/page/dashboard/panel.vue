<template>
  <div class="panel list-page">
    <div class="main-list">
      <div class="main-container">
        <div class="top-tools">
          <div v-if="panelData.length == 0" class="top-tool-left" style="margin-left: 10px;">
            <button id="panel-add-panel" class="nz-btn nz-btn-style-light nz-btn-size-small" @click="toAdd"><i class="nz-icon nz-icon-create-square"></i>&nbsp;&nbsp;{{$t("dashboard.panel.createPanelTitleSec")}}</button>
          </div>
          <template v-else>
            <div class="top-tool-left">
              <select-panel ref="selectPanel" :filter-panel="filterPanel" :panel-data="panelData" :panel-lock="panelLock" :placement="'bottom-start'"
                            :show-panel="showPanel" style="width: 300px;display: inline-block" @deletePanel="del" @editPanel="edit" @selectPanel="panelChange">
                <template v-slot:header>
                  <div class="panel-select-header">
                    <el-input id="panel-list-search" v-model="filterPanel" :placeholder="$t('overall.search')" clearable size="mini" style="width: 340px;"></el-input>
                    <span id="panel-list-toadd" v-has="'panel_add'" :title='$t("dashboard.panel.createPanelTitleSec")' class="panel-select-add" @click="toAdd"><i class="nz-icon nz-icon-plus"></i></span>
                  </div>
                </template>
                <template v-slot:trigger>
                  <el-input v-model="showPanel.name" class="panel-name" placeholder="" readonly="readonly" size="small">
                    <i slot="prefix" class="el-icon-menu"></i>
                  </el-input>
                </template>
              </select-panel>
            </div>
            <div class="top-tool-right">
              <div class="top-tool-search margin-r-20">
                <el-input id="queryPanel" ref="queryPanel" v-model="filter.searchName" class="query-input-inactive"  clearable size="small" @blur="blurInput" @clear="clearInput" @focus="focusInput">
                  <i slot="suffix" class="el-input__icon nz-icon nz-icon-search" style="float: right" @click="focusInput"></i>
                </el-input>
              </div>

              <pick-time id="panel" ref="pickTime" v-model="searchTime" :refresh-data-func="dateChange" :use-chart-unit="false"></pick-time>

              <button id="panel-add-chart" v-has="'panel_chart_add'" :title="$t('overall.createChart')" class="top-tool-btn margin-r-10"
                      type="button" @click="addChart">
                <i class="nz-icon-create-square nz-icon"></i>
              </button>

              <top-tool-more-options
                id="panel"
                :params="filter"
                :permissions="{
                  import: 'panel_chart_import',
                  export: 'panel_chart_export'
                }"
                class="top-tool-export"
                export-file-name="chart"
                export-url="/visual/panel/export"
                import-url="/visual/panel/import"
                @afterImport="dateChange"
              >
                <template v-slot:before>
                  <el-dropdown-item>
                    <div id="panel-lock" @click="panelLock=!panelLock"><i :class="{'nz-icon nz-icon-lock':panelLock,'nz-icon nz-icon-unlock':!panelLock}"></i>{{panelLock ? 'Locked' : 'Unlocked'}}</div>
                  </el-dropdown-item>
                </template>
                <template v-slot:after>
                  <el-dropdown-item v-has="'panel_chart_add'">
                    <div id="chart-temp-add" @click="addChartByTemp"><i class="nz-icon nz-icon-add"></i>Add by template</div>
                  </el-dropdown-item>
                </template>
              </top-tool-more-options>
            </div>
          </template>
        </div>
        <div id="tableList" class="table-list">
          <div ref="dashboardScrollbar" style="height: calc(100% - 1px); overflow: auto;" :class="overScroll10?'border-t-1-de':'border-t-1-tr'">
            <div class="box-content">
              <chart-list ref="chartList" :class="{'show-top':showTopBtn}" :from="$CONSTANTS.fromRoute.panel" :panel-lock="panelLock" @on-edit-chart="editChart" @on-refresh-time="refreshTime"  @on-remove-chart="delChart" @on-add-group-item-chart="addGroupItem"></chart-list>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button :class="{'to-top-is-hover': tableHover}" @click="toTop(scrollbarWrap)" class="to-top" style="bottom: 0;" v-show="showTopBtn"><i class="nz-icon nz-icon-top"></i></button>

    <transition name="right-box">
      <chart-box :chart="chart" :from="$CONSTANTS.fromRoute.panel" :panel-data="panelData" :show-panel="showPanel" @close="closeChartBox" @delete-chart="delChart" @on-create-success="createSuccess" @on-delete-success="delChartOk" @reload="panelReload" @reloadOnlyPanel="panelReloadOnlyPanel" ref="addChartModal" v-if="rightBox.chart.show"></chart-box>
    </transition>
    <transition name="right-box">
      <chart-temp-box :obj="chart" :from="$CONSTANTS.fromRoute.panel" :panel-data="panelData" :show-panel="showPanel" @close="closeChartTempBox" @on-create-success="createSuccess" v-if="rightBox.chartTemp.show"></chart-temp-box>
    </transition>
    <transition name="right-box">
      <panel-box v-if="rightBox.panel.show" ref="panelBox" :panel="panel" @reload="panelReload" @reloadForDel="panelReloadForDel"></panel-box>
    </transition>
  </div>
</template>

<script>
import ChartBox from './chartBox'
import ChartList from '../../charts/chart-list'
import bus from '../../../libs/bus'
import pickTime from '../../common/pickTime'
import selectPanel from '../../common/popBox/selectPanel'
import panelBox from '@/components/common/rightBox/panelBox'
import chartTempBox from '@/components/common/rightBox/chartTempBox'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import Template from '@/components/page/config/template'
export default {
  name: 'panel',
  data () {
    return {
      overScroll10: false,
      panelLock: true,
      showTopBtn: false, // top按钮
      visible: false,
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
        span: 12,
        height: '400',
        unit: 2,
        param: { url: '', threshold: '' },
        elements: [{ expression: '', legend: '', type: 'expert', id: '' }],
        panel: '',
        sync: 0,
        remark: '',
        groupId: -1
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
      chartsData: [], // 中间部分图表相关数据
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
      scrollbarWrap: null
    }
  },
  components: {
    Template,
    'chart-box': ChartBox,
    'chart-list': ChartList,
    'pick-time': pickTime,
    'panel-box': panelBox,
    topToolMoreOptions,
    selectPanel,
    chartTempBox
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
      // let curTime = this.$refs.calendarPanel.getCurrentTime();
      const curTime = this.searchTime
      this.filter.start_time = bus.timeFormate(curTime[0], 'yyyy-MM-dd hh:mm:ss')
      this.filter.end_time = bus.timeFormate(curTime[1], 'yyyy-MM-dd hh:mm:ss')
      // this.$refs.chartList.initCurrentRecordNum();
      this.$refs.chartList.cleanData()
      this.getData(this.filter)
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
      this.$refs.panelBox.setTitle(this.$t('dashboard.panel.editPanelTitle'))
      this.$refs.panelBox.show(true)
    },
    toAdd () {
      if (!this.hasButton('panel_view')) {
        return
      }
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
    editChart (data) {
      if (!data.param) {
        data.param = { url: '', threshold: '' }
      }
      this.chart = JSON.parse(JSON.stringify(data))
      this.chart.panelId = this.showPanel.id
      this.chart.panelName = this.showPanel.name
      this.rightBox.chart.show = true
    },
    closeChartBox (refresh) {
      this.rightBox.chart.show = false
      /* if (refresh) {

      } */
    },
    closeChartTempBox () {
      this.rightBox.chartTemp.show = false
      /* if (refresh) {

      } */
    },
    closePanelBox (refresh) {
      this.rightBox.panel.show = false
      /* if (refresh) {

      } */
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
              if (chartList[i].id === data.id) {
                chartList.splice(i, 1)
              }
              if (chartList[i].type === 'group') {
                chartList[i].children = chartList[i].children.filter((item) => item.id !== data.id)
              }
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
            this.$refs.chartList.loadChartData(this.scrollbarWrap.scrollTop)
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
      if (params.start_time === '' || params.end_time === '') {
        const now = bus.getTimezontDateRange()
        const endTimeTmp = bus.timeFormate(now[1].getTime(), 'yyyy-MM-dd hh:mm:ss')
        const startTimeTmp = bus.timeFormate(now[0].getTime(), 'yyyy-MM-dd hh:mm:ss')
        params.start_time = startTimeTmp
        params.end_time = endTimeTmp
      }
      if (this.$refs.chartList) {
        this.$refs.chartList.initData(params)
      }
      // this.panelReloadOnlyPanel();
    },

    /* 图表相关操作--end */
    /* 时间条件查询--start */
    // 选择日期变化
    dateChange (val) {
      const nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
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
              this.showPanel.name = this.panelData[i].name
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
              this.$refs.selectPanel.$refs.panelTree.setCurrentKey(this.showPanel)
            })
          } else {
            this.showPanel.id = ''
            this.filter.panelId = ''
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
        this.$refs.chartList.searchCharts(this.filter.searchName)
      }
    },
    // 滚动事件触发下拉加载
    onScroll () {
      const _self = this
      this.scrollbarWrap.addEventListener('scroll', bus.debounce(function () {
        _self.showTopBtn = _self.scrollbarWrap.scrollTop > 50
        _self.overScroll10 = _self.scrollbarWrap.scrollTop > 50
        _self.$refs.chartList.loadChartData(_self.scrollbarWrap.scrollTop)
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
    /* start (event) {
        // console.log('start', event, this.panelData);

        event.item.querySelector('.panelContent').style.background = '#d8dce1';
        let projectAndAssetFeatureInfos = event.item.querySelectorAll(".feature-content");
        if (projectAndAssetFeatureInfos && projectAndAssetFeatureInfos.length > 0) {
          projectAndAssetFeatureInfos.forEach(item => {
            item.classList.remove("unfold");
            item.classList.remove("fold");
          });
        }
        this.panelDataDragTmp = [...this.panelData];
        //console.log(this.panelDataDragTmp)
      },
      end (event) {
        // console.info("end event:", event)
        let item = event.item;
        let oldIndex = event.oldIndex;
        let newIndex = event.newIndex;
        let newItem = this.panelData[newIndex];
        //移动前，移动元素前后元素next及prev修改；移动后，移动元素前后元素next及prev修改--start
        let len = this.panelDataDragTmp.length;//移动之前的元素列表
        let endIndex = len-1;
        if(oldIndex===0){//挪动之前为第一个元素
          let oldNextItem = this.panelDataDragTmp[oldIndex+1];
          let nextItem = this.panelData.find(item => item.id === oldNextItem.id);
          nextItem.prev = 0;
        }else if(oldIndex===endIndex){//挪动之前为最后一个元素
          let oldPrevItem = this.panelDataDragTmp[oldIndex-1];
          let prevItem = this.panelData.find(item => item.id === oldPrevItem.id);
          prevItem.next = -1;
        }else{//挪动之前为中间元素
          let oldPrevItem = this.panelDataDragTmp[oldIndex-1];
          let oldNextItem = this.panelDataDragTmp[oldIndex+1];
          let nextItem = this.panelData.find(item => item.id === oldNextItem.id);
          let prevItem = this.panelData.find(item => item.id === oldPrevItem.id);
          prevItem.next = oldNextItem.id;
          nextItem.prev = oldPrevItem.id;
        }

        if(newIndex===0){//挪动之后为第一个元素
          let newNextItem = this.panelData[newIndex+1];
          newNextItem.prev = newItem.id;
        }else if(newIndex===endIndex){//挪动之后为最后一个元素
          let newPrevItem = this.panelData[newIndex-1];
          newPrevItem.next =newItem.id;
        }else{//挪动之后为中间元素
          let newPrevItem = this.panelData[newIndex-1];
          let newNextItem = this.panelData[newIndex+1];
          newPrevItem.next = newItem.id;
          newNextItem.prev = newItem.id;
        }
        //移动前，移动元素前后元素next及prev修改；移动后，移动元素前后元素next及prev修改--end

        //前台总列表中的顺序也得修改（dataTotalList及dataTotalListBak），后台接口也得调用
        if(newIndex<oldIndex){//从后往前移动：
          //console.log('从后往前移动：oldIndex='+oldIndex+',newIndex='+newIndex)
          let newNextItem = this.panelData[newIndex+1];
          newItem.next = newNextItem.id;

          let nextItemIndexInTotal = -1;
          this.dataTotalListBak.forEach((item,index)=>{
            if(item.id===newNextItem.id){
              nextItemIndexInTotal = index;
            }
          })
          // console.log('从后往前移动：next元素在总列表中之前的元素的index='+nextItemIndexInTotal)
          if(nextItemIndexInTotal>0){//总列表中：移动之后的当前元素后面的元素之前有元素
            let prevItem = this.dataTotalListBak[nextItemIndexInTotal-1];
            newItem.prev = prevItem.id;
          }else{//之前无元素
            newItem.prev = 0;
          }
        }else if(newIndex>oldIndex){//从前往后移动
          //console.log('从前往后移动：oldIndex='+oldIndex+',newIndex='+newIndex)
          let newPrevItem = this.panelData[newIndex-1];
          newItem.prev = newPrevItem.id;

          let prevItemIndexInTotal = -1;
          this.dataTotalListBak.forEach((item,index)=>{
            if(item.id===newPrevItem.id){
              prevItemIndexInTotal = index;
            }
          });
          //console.log('从前往后移动：prev元素在总列表中之后的元素的index='+prevItemIndexInTotal)
          if(prevItemIndexInTotal<this.dataTotalListBak.length-1){//总列表中：移动之后的当前元素前面的元素之后有元素
            let nextItem = this.dataTotalListBak[prevItemIndexInTotal+1];
            newItem.next = nextItem.id;
          }else{//之后无元素
            newItem.next = -1;
          }
        }else {//oldIndex = newIndex

        }
        //更新图表prev和next
        const modifyParams = {
          id:newItem.id,
          type:'dashboard',
          prev:newItem.prev,
          next:newItem.next,
        };

        if(this.panelData.length>1 && oldIndex !== newIndex){
          this.$put('panel/modify',modifyParams).then(response => {
            if (response.code === 200) {
              //修改前台列表中元素的顺序
              let curItem = this.dataTotalListBak.find((item,index)=>{return newItem.id===item.id});
              let curIndex = this.dataTotalListBak.indexOf(curItem);
              this.dataTotalListBak.splice(curIndex,1);

              let nextItemTmp = this.dataTotalListBak.find((item)=>{return item.id===newItem.next});
              if(nextItemTmp){
                let nextIndex = this.dataTotalListBak.indexOf(nextItemTmp);
                this.dataTotalListBak.splice(nextIndex,0,newItem);
              }else{//移动到最后一个元素
                this.dataTotalListBak.push(newItem);
              }
              this.panelData = this.dataTotalListBak;
              this.showPanelList = this.panelData.filter(item=> this.showPanelList.find(t=> t.id == item.id))
            }else {
              if(response.msg){
                this.$message.error(response.msg);
              }else if(response.error){
                this.$message.error(response.error);
              }else {
                this.$message.error(response);
              }
            }
          });
        }
        let chartTitle = item.querySelector('.panelContent');
        chartTitle.style.background = '';
      },
      move (event, orgin) {
        // console.log('move', event, orgin);
        let dragClass = document.querySelector('.drag-chart-class');//drag-chart-class:yellow chart-ghost:green  fallback-class choose-class:purple
        // console.log('move---class', dragClass);
        //dragClass.style.opacity = 1;
        //dragClass.style.pointerEvents = 'auto';//设置此属性，end事件里newIndex为 列表长度
        let panelContent = dragClass.querySelector('.panelContent');
        panelContent.style.background = '#d8dce1';

      }, */
    /* filterPanelFocus:function(e){
        e.stopPropagation();
      },
      filterPanelFunc:function(){
        let $self=this;
        if($self.filterPanel&&$self.filterPanel.trim() != ''){
          this.showPanelList=this.panelData.filter(item=>item.name.toLowerCase().indexOf($self.filterPanel.toLowerCase()) != -1)
        }else{
          this.showPanelList = this.panelData;
        }
      }, */
    tableListEnter () {
      this.tableHover = true
    },
    tableListLeave () {
      this.tableHover = false
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

    // 是否弹出侧滑
    const add = this.$route.query.add
    if (add) {
      if (add === 'chart') {
        this.addChart()
      }
    }
  },
  watch: {
    'filter.searchName': function (n, o) {
      const temp = this
      setTimeout(function () {
        temp.search()
      }, 1000)
    }
  },
  beforeDestroy () {
    if (document.querySelector('#tableList')) {
      document.querySelector('#tableList').removeEventListener('mouseenter', this.tableListEnter)
      document.querySelector('#tableList').removeEventListener('mouseleave', this.tableListLeave)
    }
    if (this.scrollbarWrap) {
      this.scrollbarWrap.removeEventListener('scroll', bus.debounce)
    };
  }
}
</script>
<style lang="scss">
  .border-t-1-de{
    border-top: 1px solid #dedede;
  }
  .border-t-1-tr{
    border-top: 1px solid transparent;
  }
  .panel {
    height: 100%;
    display: flex;
    flex-direction:column;
  }

  .panel .el-table {
    border-radius: 5px;
  }

  /* begin-chart list*/
  .table-list {
    margin-top: 0px;
    overflow-y: auto;
    height: calc(100% - 50px);
    flex: 1;
  }

  .box-content {
    position: relative;
    height: 100%;
  }

  .panel-name {
    .el-input__prefix {
      line-height: 32px;
      left: 10px;
    }
  }
  .panel-select-header {
    display: flex;
    justify-content: space-evenly;
    margin-bottom: 15px;
    .panel-select-add {
      line-height: 26px;
      cursor: pointer;
    }
  }
  /* end-chart list*/
</style>
<style lang="scss">
  @import '@/assets/css/common/tableCommon.scss';
</style>
