<template>
  <div class="panel">
    <!--model和asset的工具栏-->
    <div class="sub-top-tools" v-if="from != $CONSTANTS.fromRoute.project">
      <div class="sub-list-tabs">
        <div class="sub-list-tab-title">
          <template v-if="from == $CONSTANTS.fromRoute.model">{{obj.name}}</template>
          <template v-else-if="from == $CONSTANTS.fromRoute.asset">{{obj.host}}</template>
          <template v-else-if="from == $CONSTANTS.fromRoute.rule">{{obj.alertName}}</template>
          <template v-else-if="from == $CONSTANTS.fromRoute.endpoint">{{$t("project.endpoint.endpointId")}}: {{obj.id}}</template>
        </div><div class="sub-list-tab sub-list-tab-active" v-if="from == $CONSTANTS.fromRoute.model">{{$t("dashboard.panel.title")}}</div><template v-if="from == $CONSTANTS.fromRoute.asset"><div
          class="sub-list-tab sub-list-tab-active">{{$t("overall.detail")}}</div><div
          @click="changeTab('alertMessage')" class="sub-list-tab" v-has="'asset_alerts_view'">{{$t("asset.tableTitle.alerts")}}</div><div
          @click="changeTab('endpoint')" class="sub-list-tab" v-has="'asset_endpoint_view'">{{$t("asset.tableTitle.modules")}}</div>
        </template><template v-if="from == $CONSTANTS.fromRoute.rule"><div
          class="sub-list-tab sub-list-tab-active">{{$t("overall.detail")}}</div><div
          @click="changeTab('alertMessage')" class="sub-list-tab" v-has="'rule_alerts_view'">{{$t("asset.tableTitle.alerts")}}</div>
        </template><template v-if="from == $CONSTANTS.fromRoute.endpoint"><div
          class="sub-list-tab sub-list-tab-active">{{$t("overall.detail")}}</div><div
          @click="changeTab('alertMessage')" class="sub-list-tab " v-has="'project_endpoint_alerts_view'">{{$t("asset.tableTitle.alerts")}}</div><div
          @click="changeTab('endpointQuery')" class="sub-list-tab" v-has="'project_endpoint_query_chart_view'">{{$t("overall.query")}}</div>
        </template>
      </div>
      <div class="top-tool-right">
        <div class="top-tool-search margin-r-20" v-if="from != $CONSTANTS.fromRoute.rule && from != $CONSTANTS.fromRoute.endpoint">
          <el-input ref="queryPanel" @clear="clearInput" id="queryPanel" @focus="focusInput"  @blur="blurInput" v-model="filter.searchName" class="query-input-inactive" size="mini" clearable   >
            <i slot="suffix" class="el-input__icon nz-icon nz-icon-search" @click="focusInput" style="float: right"></i>
          </el-input>
        </div>
        <pick-time :refresh-data-func="dateChange" :use-chart-unit="false" ref="pickTime" v-if="from == $CONSTANTS.fromRoute.asset" v-model="searchTime"></pick-time>
        <export-excel
          export-file-name="chart"
          export-url="/panel/export"
          import-url="/panel/import"
          :params="filter"
          :from="$CONSTANTS.fromRoute.asset"
          :link="obj"
          :permissions="{
            import: `${from}_chart_import`,
            export: `${from}_chart_export`
          }"
          @afterImport="dateChange"
          v-if="$route.path==='/asset' || $route.path==='/model'"
          :showCur="false"
        >
          <template slot="optionZone">
            <button :title="$t('overall.createChart')" @click="addChart" v-has="['model_chart_toAdd', 'asset_chart_toAdd']" v-if="from != $CONSTANTS.fromRoute.rule && from != $CONSTANTS.fromRoute.endpoint"
                    class="nz-btn nz-btn-size-normal nz-btn-style-light ">
              <i class="nz-icon-create-square nz-icon"></i>
            </button>
          </template>
        </export-excel>
        <template v-else>
          <button :title="$t('overall.createChart')" @click="addChart" v-if="from != $CONSTANTS.fromRoute.rule && from != $CONSTANTS.fromRoute.endpoint"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light ">
            <i class="nz-icon-create-square nz-icon"></i>
          </button>
        </template>

        <button @click="panelLock=!panelLock" class="nz-btn nz-btn-size-normal nz-btn-style-light" style="margin-left: 20px;" type="button" v-if="from == $CONSTANTS.fromRoute.asset||from == $CONSTANTS.fromRoute.model"><i :class="{'nz-icon nz-icon-lock':panelLock,'nz-icon nz-icon-unlock':!panelLock}"></i></button>

        <button :title="$t('overall.syncChart')" @click="syncChart" style="margin-left: 20px;" v-has="['model_chart_sync', 'asset_chart_sync']" v-if="from == $CONSTANTS.fromRoute.asset||from == $CONSTANTS.fromRoute.model"
                class="nz-btn nz-btn-size-normal nz-btn-style-light ">
          <i class="nz-icon-sync nz-icon"></i>
        </button>
      </div>
    </div>

    <!--project的工具栏-->
    <!--<div class="top-tools" v-else>
      <div class="top-tool-main-right">
        <div class="top-tool-search relative-position margin-r-20">
          <el-input ref="queryPanel" @clear="clearInput" id="queryPanel2" @focus="focusInput"  @blur="blurInput" v-model="filter.searchName" class="query-input-inactive" size="mini" clearable   >
            <i slot="suffix" class="el-input__icon nz-icon nz-icon-search" @click="focusInput" style="float: right"></i>
          </el-input>
        </div>

        <pick-time :refresh-data-func="dateChange" v-model="searchTime" :use-chart-unit="false" ref="pickTime"></pick-time>
        <button @click="addChart" :title="$t('overall.createChart')"
                class="nz-btn nz-btn-size-normal nz-btn-style-light ">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
      </div>
    </div>-->

    <!--图表-->
    <div class="table-list" id="tableList">
      <div ref="dashboardScrollbar" style="height: 100%; overflow: auto;">
        <div class="box-content">
          <chart-list :additional-info="obj" :detail="detail" :draggable="draggable" :from="from" :is-model="from == $CONSTANTS.fromRoute.model" @on-edit-chart="editChart"
                      @on-refresh-time="refreshTime" @on-remove-chart="delChart" ref="chartList" :panel-lock="panelLock"></chart-list>
        </div>
      </div>
    </div>
    <button :class="{'to-top-is-hover': tableHover}" @click="toTop(scrollbarWrap)" class="to-top" style="bottom: 0;" v-show="showTopBtn"><i class="nz-icon nz-icon-top"></i></button>
    <transition name="right-box">
      <chart-box :chart="chart" :from="from" :panel-data="panelData" :show-panel="showPanel" @close="closeRightBox" @delete-chart="delChart" @on-create-success="createSuccess" @on-delete-success="delChartOk" ref="addChartModal" v-if="rightBox.show"></chart-box>
    </transition>
  </div>
</template>

<script>
  import ChartBox from "../../../page/dashboard/chartBox";
  import ChartList from '../../../charts/chart-list';
  import bus from '../../../../libs/bus';
  import timePicker from '../../../common/timePicker';
  import exportXLSX from "../../../common/exportXLSX";

  export default {
    name: "panel",
    props: {
      from: String,
      obj: Object,
      draggable: {type: Boolean, default: true},
      detail: Object,
    },
    data() {
      return {
        panelLock:true,
        showTopBtn: false, //top按钮
        visible: false,
        rightBox: { //面板弹出框相关
          show: false,
        },
        tableHover: false,
        searchTime: bus.getTimezontDateRange(),
        intervalTimer: null,
        interval: 0,
        panel: { //新增panel
          id: '',
          name: ''
        },
        chart: {},
        blankChart: {
          id:'',
          title: '',
          type:'line',
          span:12,
          height:'400',
          unit:2,
          param:{
            url:'',
            threshold:'',
          },
          elements:[],
          panel: '',
          sync: 0
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
        //removeModal: false, // 删除弹出
        //deleteObj: {}, // 删除对象
        //---图表相关参数--end
        scrollbarWrap: null,
      }
    },
    components: {
      'chart-box': ChartBox,
      'chart-list': ChartList,
      'time-picker':timePicker,
      'export-excel':exportXLSX,
    },
    methods: {
      //刷新
      refresh() {
        this.getTableData(this.obj.id);
      },
      refreshTime(st, et) {
        const startTime = bus.timeFormate(st, 'yyyy-MM-dd hh:mm');
        const endTime = bus.timeFormate(et, 'yyyy-MM-dd hh:mm');
        this.searchTime = [startTime, endTime];
      },
      panelReloadForDel() {
        this.getTableData(this.obj.id);
      },
      /*图表相关操作--start*/
      addChart() {
        this.chart = this.newChart();
        this.rightBox.show = true;
      },
      newChart() {
        return JSON.parse(JSON.stringify(this.blankChart));
      },
      // 切换tab
      changeTab(tab) {
        this.$emit('changeTab', tab);
      },
      closeRightBox(refresh) {
        this.rightBox.show = false;
        if (refresh) {
          this.refresh();
        }
      },
      // 编辑图表信息,打开编辑弹窗
      editChart(data) {
        if (!data.param) {
          data.param = {url: '', threshold: '',};
        }
        this.chart = JSON.parse(JSON.stringify(data));
        this.rightBox.show = true;
      },
      // 移除图表:弹出确认框询问
      delChart(data,from) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("panel/" + this.showPanel.id + "/charts?ids=" + data.id).then(response => {
            if (response.code === 200) {
              this.$message({
                duration: 2000,
                type: 'success',
                message: this.$t("tip.deleteSuccess")
              });
              this.rightBox.show = false;
              let chartList=this.$refs.chartList.dataList;
              let nextChart=null,prevChart=null
              for (let i =0;i< chartList.length;i++){
                if(chartList[i].id === data.id){
                  chartList.splice(i,1);
                }
                if(data.next != -1){
                  if(chartList[i].id === data.next){
                    nextChart = chartList[i]
                  }
                }
                if(data.prev != 0){
                  if(chartList[i].id === data.prev){
                    prevChart = chartList[i]
                  }
                }
              }
              this.$refs.chartList.loadChartData(this.scrollbarWrap.scrollTop);
              if(nextChart&&prevChart){ //删除图表为中间位置
                prevChart.next = nextChart.id;
                nextChart.prev = prevChart.id;
              }else{
                if(!nextChart) prevChart.next = -1;
                if(!prevChart) nextChart.prev = 0;
              }
              // this.getTableData(this.obj.id); //删除相关图表后，刷新面板数据
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
          let now = bus.getTimezontDateRange();
          let endTimeTmp = bus.timeFormate(now[1].getTime(), 'yyyy-MM-dd hh:mm:ss');
          let startTimeTmp = bus.timeFormate(now[0].getTime(), 'yyyy-MM-dd hh:mm:ss');
          params.start_time = startTimeTmp;
          params.end_time = endTimeTmp;
          params.from = this.from;
        }
        if(this.$refs.chartList){
          this.$refs.chartList.initData(params);
        }
      },

      /*图表相关操作--end*/
      /*时间条件查询--start*/
      // 选择日期变化
      dateChange(val) {
        // this.searchTime = [...val];
        let nowTimeType=this.$refs.pickTime.$refs.timePicker.nowTimeType;
        this.setSearchTime(nowTimeType.type,nowTimeType.value);
        this.filter.start_time = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss');
        this.filter.end_time = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss');
        this.filter.panelId = this.showPanel.id;
        this.getData(this.filter);
      },
      /*时间条件查询--end*/
      setSearchTime(type,val){//设置searchTime
        if(type==='minute'){
          let startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - val),'yyyy-MM-dd hh:mm:ss');
          let endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())),'yyyy-MM-dd hh:mm:ss');
          this.$set(this.searchTime, 0, startTime);
          this.$set(this.searchTime, 1, endTime);
          this.$set(this.searchTime, 2, val + "m");
        }else if(type==='hour'){
          let startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - val),'yyyy-MM-dd hh:mm:ss');
          let endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())),'yyyy-MM-dd hh:mm:ss');
          this.$set(this.searchTime, 0, startTime);
          this.$set(this.searchTime, 1, endTime);
          this.$set(this.searchTime, 2, val + "h");
        }else if(type==='date'){
          let startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setDate(new Date(bus.computeTimezone(new Date().getTime())).getDate() - val),'yyyy-MM-dd hh:mm:ss');
          let endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())),'yyyy-MM-dd hh:mm:ss');
          this.$set(this.searchTime, 0, startTime);
          this.$set(this.searchTime, 1, endTime);
          this.$set(this.searchTime, 2, val + "d");
        }
        this.$refs.pickTime.$refs.timePicker.searchTime=this.searchTime;
      },
      //公用操作
      getTableData(linkId) {
        if (this.from == this.$CONSTANTS.fromRoute.rule || this.from == this.$CONSTANTS.fromRoute.endpoint) {
          this.getData(this.filter);
        } else {
          this.$get('panel', {type: this.from, link: linkId}).then(response => {
            if (response.code === 200) {
              this.panelData = response.data.list;
              if (this.panelData.length > 0) {
                this.showPanel.id = this.filter.panelId = this.panelData[0].id;
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
        }
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
        this.scrollbarWrap.addEventListener('scroll', bus.debounce(function() {
          _self.showTopBtn = _self.scrollbarWrap.scrollTop > 50;
          _self.$refs.chartList.loadChartData(_self.scrollbarWrap.scrollTop);
        }, 300));
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
      },
      syncChart:function(){
        if(this.from== this.$CONSTANTS.fromRoute.asset||this.from== this.$CONSTANTS.fromRoute.model){
          this.$confirm(this.$t("tip.syncTip"), {
            confirmButtonText: this.$t("tip.yes"),
            cancelButtonText: this.$t("tip.no"),
            type: 'warning'
          }).then(() => {
            let param={
              modelId:this.from==this.$CONSTANTS.fromRoute.model?this.obj.id:null,
              assetId:this.from==this.$CONSTANTS.fromRoute.asset?this.obj.id:null,
            }
            this.$put('/model/syncChart',param).then(response=>{
              if(response.code == 200){
                this.$message({duration: 1000, type: 'success', message: this.$t("tip.syncSuccess")});
                if(this.from == this.$CONSTANTS.fromRoute.asset){
                  this.refresh();
                }
              }else{
                console.error(response.msg)
                this.$message.error(response.msg)
              }
            })
          })
        }
      },
      tableListEnter(){
        this.tableHover = true;
      },
      tableListLeave(){
        this.tableHover = false;
      },
    },
    mounted: function () {
      this.scrollbarWrap = this.$refs.dashboardScrollbar;
      this.onScroll();
      document.querySelector("#tableList").addEventListener("mouseenter", this.tableListEnter);
      document.querySelector("#tableList").addEventListener("mouseleave", this.tableListLeave);
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
            if (n && n.id) {
              this.getTableData(n.id);
            }
          }, 500);
        }
      }
    },
    beforeDestroy(){
      document.querySelector("#tableList").removeEventListener("mouseenter", this.tableListEnter);
      document.querySelector("#tableList").removeEventListener("mouseleave", this.tableListLeave);
      if(this.scrollbarWrap){
        this.scrollbarWrap.removeEventListener('scroll', bus.debounce);
      };
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

  .content-right-option .nz-icon-delete {
    color: #F98D9A;
  }

  .content-right-option .nz-icon-delete:hover {
    color: #D96D7A;
  }

  .content-right-option .nz-icon-view {
    color: #60BEFF;
  }

  .content-right-option .nz-icon-view:hover {
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
  .nz-dashboard-dropdown {
    z-index: 3001 !important;
  }
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

