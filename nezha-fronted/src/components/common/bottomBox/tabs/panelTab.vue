<template>
  <div class="panel" :class="{'sub-list': from != 'project'}">
    <!--model和asset的工具栏-->
    <div class="sub-top-tools" v-if="from != 'project'">
      <div class="sub-list-tabs">
        <div class="sub-list-tab-title">
          <template v-if="from == 'model'">{{obj.name}}</template>
          <template v-else-if="from == 'asset'">{{obj.host}}</template>
        </div><div class="sub-list-tab sub-list-tab-active" v-if="from == 'model'">{{$t("dashboard.panel.title")}}</div><template v-if="from == 'asset'"><div
          class="sub-list-tab sub-list-tab-active">{{$t("overall.detail")}}</div><div
          class="sub-list-tab" @click="changeTab('alertMessage')">{{$t("asset.tableTitle.alerts")}}</div><div
          class="sub-list-tab" @click="changeTab('endpoint')">{{$t("asset.tableTitle.modules")}}</div>
        </template>
      </div>
      <div class="top-tool-right">
        <div class="top-tool-search margin-r-20">
          <el-input ref="queryPanel" @clear="clearInput" id="queryPanel" @focus="focusInput"  @blur="blurInput" v-model="filter.searchName" class="query-input-inactive" size="mini" clearable   >
            <i slot="suffix" class="el-input__icon el-icon-search" @click="focusInput" style="float: right"></i>
          </el-input>
        </div>
        <div class="panel-calendar margin-r-20" v-if="from != 'model'">
          <time-picker ref="calendarPanel" class="nz-dashboard-picker" @change="dateChange" style="height: 26px; margin-top: -1px;"></time-picker>
        </div>
        <div class="nz-btn-group nz-btn-group-size-small nz-btn-group-light margin-r-20" style="height: 24px;" v-if="from != 'model'">
          <button style="border-right: 1px solid rgba(162,162,162,0.50);" type="button"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light" @click="Refresh()">
            <i style="font-size: 12px" class="global-active-color nz-icon nz-icon-refresh"></i>
          </button><el-popover
            v-model="visible" placement="bottom-start" width="200" trigger="click">
            <ul class="popover_ul">
              <li v-for="i in intervalList" :style="{color:interval==i.value?'#31749C':''}" :key="i.value+i.name"
                  @click="selectInterval(i.value)">
                {{i.name}}
              </li>
            </ul>
            <button type="button" style="border-radius: 0 4px 4px 0"
                    class="nz-btn nz-btn-size-normal nz-btn-style-light" slot="reference">
              <i style="font-size: 12px" class="nz-icon nz-icon-arrow-down"></i>
            </button>
          </el-popover>
        </div>
        <button @click="toAddChart" :title="$t('overall.createChart')"
                class="nz-btn nz-btn-size-normal nz-btn-style-light ">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
      </div>
    </div>

    <!--project的工具栏-->
    <div class="top-tools" v-else>
      <div class="top-tool-main-right">
        <div class="top-tool-search relative-position margin-r-20">
          <el-input ref="queryPanel" @clear="clearInput" id="queryPanel2" @focus="focusInput"  @blur="blurInput" v-model="filter.searchName" class="query-input-inactive" size="mini" clearable   >
            <i slot="suffix" class="el-input__icon el-icon-search" @click="focusInput" style="float: right"></i>
          </el-input>
        </div>

        <div class="panel-calendar margin-r-20">
          <div class="block">
            <time-picker ref="calendarPanel" class="nz-dashboard-picker" @change="dateChange"></time-picker>
          </div>
        </div>

        <div class="nz-btn-group nz-btn-group-size-normal nz-btn-group-light margin-r-20">
          <button style="border-right: 1px solid rgba(162,162,162,0.50);" type="button"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light" @click="Refresh()">
            <i style="font-size: 12px" class="global-active-color nz-icon nz-icon-refresh"></i>
          </button><el-popover
          v-model="visible" placement="bottom-start" width="200" trigger="click">
          <ul class="popover_ul">
            <li v-for="i in intervalList" :style="{color:interval==i.value?'#31749C':''}" :key="i.value+i.name"
                @click="selectInterval(i.value)">
              {{i.name}}
            </li>
          </ul>
          <button type="button" style="border-radius: 0 4px 4px 0"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light" slot="reference">
            <i style="font-size: 12px" class="nz-icon nz-icon-arrow-down"></i>
          </button>
        </el-popover>
        </div>
        <button @click="toAddChart" :title="$t('overall.createChart')"
                class="nz-btn nz-btn-size-normal nz-btn-style-light ">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
      </div>
    </div>

    <!--图表-->
    <div class="table-list" id="tableList">
      <el-scrollbar class="el-scrollbar-large" style="height: 100%" ref="dashboardScrollbar">
        <div class="box-content">
          <chart-list @on-edit-chart="editData" @on-refresh-time="refreshTime" @on-remove-chart="removeData"
                      ref="chartList" :is-model="from == 'model'" :additional-info="obj"></chart-list>
        </div>
      </el-scrollbar>
    </div>
    <button class="to-top" :class="{'to-top-is-hover': tableHover}" v-show="showTopBtn" @click="$toTop('el', $refs.dashboardScrollbar.wrap)" style="bottom: 0;"><i class="nz-icon nz-icon-top"></i></button>

    <chart-box ref="addChartModal" :showPanel="showPanel" :panel-data="panelData" @on-create-success="createSuccess" @on-delete-success="delChartOk"></chart-box>
  </div>
</template>

<script>
  import ChartBox from "../../../page/dashboard/chartBox";
  import ChartList from '../../../charts/chart-list';
  import bus from '../../../../libs/bus';
  import timePicker from '../../../common/timePicker'

  export default {
    name: "panel",
    props: {
      from: String,
      obj: Object
    },
    data() {
      return {
        showTopBtn: false, //top按钮
        visible: false,
        rightBox: { //面板弹出框相关
          show: false,
          title: this.$t('dashboard.panel.createPanelTitle')
        },
        tableHover: false,
        searchTime: [
          new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - 1),
          new Date(bus.computeTimezone(new Date().getTime()))
        ],
        intervalTimer: null,
        intervalList: [{
          value: 0,
          name: this.$t("dashboard.panel.refreshInterval.never"),
        }, {
          value: 60,
          name: this.$t("dashboard.panel.refreshInterval.oneMinute"),
        }, {
          value: 180,
          name: this.$t("dashboard.panel.refreshInterval.threeMinutes"),
        }, {
          value: 300,
          name: this.$t("dashboard.panel.refreshInterval.fiveMinutes"),
        }, {
          value: 600,
          name: this.$t("dashboard.panel.refreshInterval.tenMinutes"),
        }],
        interval: 0,
        panel: { //新增panel
          id: '',
          name: ''
        },
        chart: {
          id: '',
          title: '',
          type: 'line',
          span: 12,
          height: 400,
          elements: {
            id: '',
            expression: '',
            type: ''
          }
        },
        pageObj: {
          pageNo: 1,
          pageSize: -1, //此处获取所有数据，所以设置一个较大的值
          total: 0
        },
        chartsData: [], //中间部分图表相关数据
        panelData: [],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [
          ],
        },
        searchLabel: {}, //搜索参数
        //---图表相关参数--start
        dataList: [], // 数据列表
        //searchName: '', //  搜索名称
        filter: { // 过滤条件
          //productId: 0,
          panelId: 0,
          start_time: '',
          end_time: '',
          searchName: ''
        },
        showPanel: {
          name: '',
          type: this.from,
          id: ''
        },
        panelId: 0,
        //removeModal: false, // 删除弹出
        //deleteObj: {}, // 删除对象
        //---图表相关参数--end
      }
    },
    components: {
      'chart-box': ChartBox,
      'chart-list': ChartList,
      'time-picker':timePicker
    },
    methods: {
      //刷新
      Refresh() {
        this.getTableData(this.obj.id);
      },
      refreshTime(st, et) {
        const startTime = bus.timeFormate(st, 'yyyy-MM-dd hh:mm');
        const endTime = bus.timeFormate(et, 'yyyy-MM-dd hh:mm');
        this.searchTime = [startTime, endTime];
      },
      panelReloadForDel: function () {
        this.getTableData(this.obj.id);
      },
      /*图表相关操作--start*/
      toAddChart: function () {
        this.$refs.addChartModal.setTitle(this.$t("dashboard.panel.createChartTitle"));
        this.$refs.addChartModal.show(true);
        this.$refs.addChartModal.createData(this.panelId); //初始化创建图表需要的初始数据
      },
      // 切换tab
      changeTab(tab) {
        this.$emit('changeTab', tab);
      },
      scrollbarHeightHandler() {
        setTimeout(() => {
          let top = '';
          let top2 = '';
          document.querySelector("body>.el-dropdown-menu").addEventListener("ps-y-reach-end", () => {
            let yDom = document.querySelector("body>.el-dropdown-menu>.ps__rail-y");
            let yDom2 = document.querySelector("body>.el-dropdown-menu>.ps__rail-y>.ps__thumb-y");
            if (top) {
              yDom.style.top = top;
            } else {
              top = yDom.style.top;
            }
            if (top2) {
              yDom2.style.top = top2;
            } else {
              top2 = yDom2.style.top;
            }
          });
        }, 100);
      },
      // 编辑图表信息,打开编辑弹窗
      editData(data) {
        this.$refs.addChartModal.setTitle(this.$t("dashboard.panel.editChartTitle"));
        this.$refs.addChartModal.show(true);
        this.$refs.addChartModal.editData(data, this.panelId);
      },
      // 移除图表:弹出确认框询问
      removeData(data,from) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("panel/" + this.panelId + "/charts?ids=" + data.id).then(response => {
            if (response.code === 200) {
              this.$message({
                duration: 2000,
                type: 'success',
                message: this.$t("tip.deleteSuccess")
              });
              let chartList=this.$refs.chartList.dataList;
              for (let i =0;i< chartList.length;i++){
                if(chartList[i].id === data.id){
                  chartList.splice(i,1);
                  break;
                }
              }
              this.getTableData(this.obj.id); //删除相关图表后，刷新面板数据
            } else {
              console.error(response.msg);
              this.$message.error(response.msg);
            }
          })
        });
      },
      delChartOk() {
        this.getData(this.filter);
      },
      // 图表创建成功，回调panel页面，进行图表的刷新
      createSuccess(msg, data, params) {
        this.getData(this.filter);
      },
      // 获取数据,用在子页面
      getData(params) {
        if (params.start_time === '' || params.end_time === '') {
          let now = new Date();
          let endTimeTmp = bus.timeFormate(now, 'yyyy-MM-dd hh:mm:ss');
          let startTimeTmp = bus.timeFormate(now.setHours(now.getHours() - 1), 'yyyy-MM-dd hh:mm:ss');
          params.start_time = startTimeTmp;
          params.end_time = endTimeTmp;
        }
        if(this.$refs.chartList){
          this.$refs.chartList.initData(params);
        }
      },

      /*图表相关操作--end*/
      /*时间条件查询--start*/
      // 选择日期变化
      dateChange(val) {
        this.searchTime = [...val];
        this.filter.start_time = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss');
        this.filter.end_time = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss');
        this.filter.panelId = this.panelId;
        this.getData(this.filter);
      },
      /*时间条件查询--end*/
      //公用操作
      getTableData(linkId) {
        this.$get('panel', {type: this.from, link: linkId}).then(response => {
          if (response.code === 200) {
            this.panelData = response.data.list;
            if (this.panelData.length > 0) {
              this.panelId = this.filter.panelId = this.panelData[0].id;
              this.getData(this.filter);
            }
          }else {
            if(response.msg){
              console.error(response.msg);
              this.$message.error(response.msg);
            }else if(response.error){
              console.error(response.error);
              this.$message.error(response.error);
            }else {
              console.error(response);
              this.$message.error(response);
            }
          }
        }).catch((error) => {
          if (error) {
            console.error(error);
            this.$message.error(error.toString());
          }
        });
      },
      //定期刷新
      selectInterval(val) {
        this.visible = false;
        clearInterval(this.intervalTimer);
        if (val) {
          this.interval = val;
          const start = new Date(this.searchTime[1]);
          const now = new Date();
          const interval = Math.floor((now.getTime() - start.getTime()) / 1000); //计算当前结束时间到现在的间隔（秒）
          if (interval >= 60) { //如果结束时间到现在超过1分钟，则
            this.getIntervalData(interval);
          }
          this.intervalTimer = setInterval(() => {
            this.getIntervalData(this.interval);
          }, val * 1000);
        }
      },
      getIntervalData(interval) { //interval:结束时间到现在的秒数
        const start = new Date(this.searchTime[0]);
        const end = new Date(this.searchTime[1]);
        start.setSeconds(start.getSeconds() + interval);
        end.setSeconds(end.getSeconds() + interval);
        const startTime = bus.timeFormate(start, 'yyyy-MM-dd hh:mm');
        const endTime = bus.timeFormate(end, 'yyyy-MM-dd hh:mm');
        this.searchTime = [startTime, endTime];
        //刷新数据
        this.dateChange();
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getTableData(this.obj.id);
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        this.getTableData(this.obj.id);
      },
      search:function(){
        if(this.$refs.chartList){
          this.$refs.chartList.searchCharts(this.filter.searchName);
        }
      },
      // 滚动事件触发下拉加载
      onScroll() {
        let _self = this;
        let scrollbarWrap = this.$refs.dashboardScrollbar.wrap;
        scrollbarWrap.onscroll = function() {
          if (scrollbarWrap.scrollTop > 50) {
            _self.showTopBtn = true;
          } else {
            _self.showTopBtn = false;
          }
          /*if (scrollbarWrap.scrollHeight - scrollbarWrap.scrollTop - scrollbarWrap.offsetHeight < 20) {
            _self.$refs.chartList.pageDataList(true, _self.panelId);
          }*/
        }
      },
      focusInput:function(){
        let classVal=document.getElementById('queryPanel').parentElement.getAttribute("class");
        classVal=classVal.replace('query-input-inactive','query-input-active');
        document.getElementById('queryPanel').parentElement.setAttribute("class",classVal );
        this.$refs.queryPanel.focus();
      },
      blurInput:function(){
        if(!this.filter.searchName || this.filter.searchName == ''){
          setTimeout(function(){
            let classVal=document.getElementById('queryPanel').parentElement.getAttribute("class");
            classVal=classVal.replace('query-input-active','query-input-inactive');
            document.getElementById('queryPanel').parentElement.setAttribute("class",classVal );
          },100)
        }
      },
      clearInput:function(){
        this.$refs.queryPanel.focus();
      }
    },
    mounted: function () {
      this.onScroll();
      document.querySelector("#tableList").addEventListener("mouseenter", () => {
        this.tableHover = true;
      });
      document.querySelector("#tableList").addEventListener("mouseleave", () => {
        this.tableHover = false;
      });
    },
    watch: {
      'filter.searchName':function(n,o){
        let temp=this;
        setTimeout(function(){
          temp.search();
        },1000)
      },
      obj: {
        immediate: true,
        handler(n, o) {
          setTimeout(() => {
            if (n && !o || n.id != o.id) {
              this.getTableData(n.id);
            }
          }, 500);
        }
      }
    }
  }
</script>
<style scoped lang="scss">
  .panel {
    height: 100%;
  }

  .panel .el-table {
    border-radius: 5px;
  }

  .panel-list-width {
    width:240px;
  }

  .panel-dropdown-title {
    line-height:24px;
    padding-left:5px;
    margin-left:10px;
    margin-top: 3px;
    text-align:left;
    border-radius:4px;
    width:120px;
    height:24px;
    border:solid 1px  #d8dce1;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
  .panel-list-title {
    min-height:24px;
    width:100px;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }

  .panel-list-item {
    width:190px;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }

  .content-right-option {
    cursor: pointer;
    display: inline-block;
    margin-right: 6px;
  }

  .content-right-option .el-icon-delete {
    color: #F98D9A;
  }

  .content-right-option .el-icon-delete:hover {
    color: #D96D7A;
  }

  .content-right-option .el-icon-view {
    color: #60BEFF;
  }

  .content-right-option .el-icon-view:hover {
    color: #409EFF;
  }

  /* begin-chart list*/
  .table-list {
    margin-top: 6px;
    overflow-y: auto;
    height: calc(100% - 56px);
  }

  .box-content {
    position: relative;
  }

  /* end-chart list*/
  /* begin--Panel-自定义可编辑的el-select下拉框样式*/
  .panel-dropdown-btn {
    display: inline-block;
    margin-left: 7px;
    float: right;
    color: #60BEFF;
    font-size: 13px
  }

  .panel-dropdown-btn:hover {
    color: #409EFF;
  }

  .panel-dropdown-btn-create {
    display: inline-block;
    float: left;
    font-size: 13px;
    color: #F98D9A;
    width: 100%;
  }

  .panel-dropdown-btn-create:hover {
    color: #D96D7A;
  }

  .panel-dropdown-btn-delete {
    color: #F98D9A;
    font-size: 13px
  }

  .panel-dropdown-btn-delete:hover {
    color: #D96D7A;
  }

  .panel-dropdown-error-message {
    color: #F98D9A;
  }

  /* end--Panel-自定义可编辑的el-select下拉框样式*/
  .panel-select-width {
    width: 150px;
  }

  .panel-refresh-interval {
    margin-right: 5px;
    float: right;
  }

  .panel-refresh-interval-select {
    width: 95px;
  }

  .panel-calendar {
    float: right;
    margin-right: 1px;
  }

  .top-tools {
    button {
      background: $btn-light-background-color;
      outline: none;
      border: 1px solid #ccc;
    }

    button:hover {
      background: $btn-light-background-color-hover;
    }
  }

  .nz-dashboard-dropdown {
    height: 300px;
    overflow-y: auto;
    li {
      /*padding: 0 20px !important;*/
      padding-left:20px !important;
      padding-right:0px !important;
      width:240px;
      white-space:nowrap;
      overflow-x:hidden;
      text-overflow:ellipsis;
    }
  }

  .nz-dashboard-dropdown-bg {
    background: $global-text-color-active;
    color: #fff;
  }

  .el-dropdown-link {
    cursor: pointer;
    font-weight: bold;
  }

  .refresh {
    display: flex;
    background: #fff;
    border-radius: 4px;
    align-items: center;
    justify-content: center;
    margin: 0 10px;
    border: 1px solid #ccc;
    background: $btn-light-background-color;

    span {
      display: inline-block;
      padding: 1px 8px;
    }
  }

  .popover_ul li {
    padding: 10px 3px;
    cursor: pointer;
  }

  .popover_ul li:hover {
    background: $dropdown-hover-background-color !important;
    color: $global-text-color-active !important;
  }

  .nz-dashboard-refresh {
    border-right: 1px solid #ccc;
    color: #F0BF84;
  }

  .nz-dashboard-picker {
  }

</style>
<style lang="scss">
  .panel .top-tools input {
    background-color: $content-right-background-color;
  }
  .panel .top-tools  .el-input__inner {
    background-color: $content-right-background-color;
  }
  .panel-calendar .el-range-editor--mini.el-input__inner {
    height: 25px !important;
    border-color: #d8d8d8;
  }

  .panel-calendar .el-range-editor--mini .el-range__close-icon {
    line-height: 18px;
  }

  .panel-calendar .el-range-editor--mini .el-range__icon {
    display: none;
  }

  .panel-calendar .el-range-editor--mini .el-range-separator {
    line-height: 17px;
  }

  .panel-calendar .el-date-editor--datetimerange.el-input, .panel-calendar .el-date-editor--datetimerange.el-input__inner {
    padding-right: 0;
    vertical-align: top;
  }

  .nz-dashboard-dropdown .nz-icon-edit {
    font-size: 12px;
  }
</style>

