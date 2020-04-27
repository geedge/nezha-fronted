<template>
  <div class="panel">
    <left-menu >
      <div slot="content-left" class="slot-content">
      <div class="sidebar-title">{{$t('dashboard.title')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item " @click="jumpTo('overview')">{{$t('dashboard.overview.title')}}</div>
        <div class="sidebar-info-item sidebar-info-top sidebar-info-item-active">{{$t('dashboard.panel.title')}}</div>
        <div class="sidebar-info-item" @click="jumpTo('explore')">{{$t('dashboard.metricPreview.title')}}</div>
      </div>
    </div>
    <div slot="content-right" class="slot-content">
      <div class="top-tools">
        <div class="top-tool-main-left">
          <el-dropdown @command="panelChange" class="panel-dropdown-title" trigger="click" placement="bottom-start" v-scrollBar:el-dropdown>
            <el-row @click.native="scrollbarHeightHandler" :gutter="10" class="el-dropdown-link" style="">
              <el-col :span="21" class="panel-list-title" :title="showPanel.name">{{showPanel.name}}</el-col>
              <el-col :span="3" style="padding-left:0px !important;"><i class="el-icon-arrow-down el-icon--right"></i></el-col>
            </el-row>
            <el-dropdown-menu class="nz-dashboard-dropdown" slot="dropdown">
              <el-dropdown-item>{{$t('dashboard.panel.createPanelTitleSec')}}</el-dropdown-item>
              <el-dropdown-item v-for="item in panelData" :key="item.id+1"
                                :class="showPanel.id==item.id?'nz-dashboard-dropdown-bg':''" :command="item">
                <!--{{item.name}}-->
                <el-row  :gutter="10" class="panel-list-width" >
                  <el-col :span="19" class="panel-list-item" :title="item.name">{{item.name}}</el-col>
                  <el-col :span="2"><span class="panel-dropdown-btn panel-dropdown-btn-delete" @click.stop="del(item)"><i class="el-icon-delete"></i></span></el-col>
                  <el-col :span="1">&nbsp;</el-col>
                  <el-col :span="2"><span class="panel-dropdown-btn" @click.stop="toEdit(item)"><i class="nz-icon nz-icon-edit"></i></span></el-col>
                </el-row>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="top-tool-main-right">
          <div class="top-tool-search relative-position margin-r-20">
            <el-input ref="queryPanel" @clear="clearInput" id="queryPanel" @focus="focusInput"  @blur="blurInput" v-model="filter.searchName" class="query-input-inactive" size="mini" clearable   >
              <i slot="suffix" class="el-input__icon el-icon-search" @click="focusInput" style="float: right"></i>
            </el-input>
          </div>

          <div class="panel-calendar margin-r-20">
            <div class="block">
              <time-picker ref="calendarPanel" class="nz-dashboard-picker" @change="dateChange"></time-picker>
              <!--
<el-date-picker prefix-icon=" " class="nz-dashboard-picker" size="mini" ref="calendar"
                              format="yyyy/MM/dd HH:mm" @change="dateChange" v-model="searchTime" type="datetimerange"
                              :picker-options="pickerOptions" :range-separator="$t('dashboard.panel.to')"
                              :start-placeholder="$t('dashboard.panel.startTime')"
                              :end-placeholder="$t('dashboard.panel.endTime')" align="right">
              </el-date-picker>
              -->
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
          <!-- 2020-02-14 使用普通搜索框-->
          <!--          <div class="top-tool-search">-->
          <!--            <search-input ref="searchInput" :searchMsg="searchMsg" @search="search"></search-input>-->
          <!--          </div>-->

          <button @click="toAddChart" :title="$t('overall.createChart')"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light ">
            <i class="nz-icon-create-square nz-icon"></i>
          </button>
        </div>
      </div>
      <div class="table-list" id="tableList">
        <el-scrollbar class="el-scrollbar-large" style="height: 100%" ref="dashboardScrollbar">
          <div class="box-content">
            <chart-list @on-edit-chart="editData" @on-refresh-time="refreshTime" @on-remove-chart="removeData"
                        ref="chartList"></chart-list>
          </div>
        </el-scrollbar>
      </div>
      <button class="to-top" v-show="showTopBtn" @click="$toTop('el', $refs.dashboardScrollbar.wrap)"><i class="nz-icon nz-icon-top"></i></button>
    </div>
    </left-menu>

    <panel-box :panel="panel" @reload="panelReload" @reloadForDel="panelReloadForDel" ref="panelBox"></panel-box>
    <chart-box ref="addChartModal" :showPanel="showPanel" :panel-data="panelData" @reload="panelReload" @on-create-success="createSuccess" @on-delete-success="delChartOk" @reloadOnlyPanel="panelReloadOnlyPanel"></chart-box>
  </div>
</template>

<script>
  import ChartBox from "./chartBox";
  import ChartList from '../../charts/chart-list';
  import bus from '../../../libs/bus';
  import timePicker from '../../common/timePicker'

  export default {
    name: "panel",
    data() {
      return {
        showTopBtn: false, //top按钮
        visible: false,
        rightBox: { //面板弹出框相关
          show: false,
          title: this.$t('dashboard.panel.createPanelTitle')
        },
        /*
        pickerOptions: {
          shortcuts: [{
            text: this.$t("dashboard.panel.recOne"),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setHours(start.getHours() - 1);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: this.$t("dashboard.panel.recFour"),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setHours(start.getHours() - 4);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: this.$t("dashboard.panel.recOneDay"),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - 1);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: this.$t("dashboard.panel.yesterday"),
            onClick(picker) {
              const start = new Date();
              const end = new Date();
              start.setDate(start.getDate() - 1);
              start.setHours(0);
              start.setMinutes(0);
              start.setSeconds(0);
              end.setDate(end.getDate() - 1);
              end.setHours(23);
              end.setMinutes(59);
              end.setSeconds(59);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: this.$t("dashboard.panel.recSevenDay"),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: this.$t("dashboard.panel.recOneMonth"),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: this.$t("dashboard.panel.curMonth"),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setDate(1);
              start.setHours(0);
              start.setMinutes(0);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: this.$t("dashboard.panel.lastMonth"),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setDate(1);
              start.setMonth(start.getMonth() - 1);
              end.setDate(0);
              start.setStart();
              end.setEnd();
              picker.$emit('pick', [start, end]);
            }
          }]
        },*/
        searchTime: [
          new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - 5),
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
        showPanel: { //panel下拉列表
          id: '',
          name: ''
        },
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
            /*
                        {
                        id: 1,
                        name: this.$t("dashboard.panel.searchItem.name"),
                        type: 'input',
                        label: 'name',
                        disabled: false
                      }*/
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
        this.getTableData();
      },
      //面板相关操作
      panelChange(val) {
        if (!val) {
          this.toAdd();
          return false;
        }
        //this.$refs.searchInput.select();
        this.showPanel = val
        this.filter.panelId = this.showPanel.id;
        this.$refs.chartList.initCurrentRecordNum();
        this.$refs.chartList.cleanData();
        this.getData(this.filter);

      },
      del: function (u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("panel?ids=" + u.id).then(response => {
            if (response.code === 200) {
              this.$message({
                duration: 1000,
                type: 'success',
                message: this.$t("tip.deleteSuccess")
              });
              if (this.showPanel.id === u.id) {
                this.showPanel.id = '';
              }
              this.getTableData();
              this.rightBox.show = false;
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      toEdit: function (u) {
        this.panel = Object.assign({}, u);
        this.$refs.panelBox.setTitle(this.$t("dashboard.panel.editPanelTitle"));
        this.$refs.panelBox.show(true);
      },
      toAdd: function () {
        this.$refs.panelBox.show(true);
        this.panel = {
          id: '',
          name: ''
        };
        this.$refs.panelBox.setTitle(this.$t("dashboard.panel.createPanelTitle"));
      },
      panelReload(clearShowPanel) {
        this.getTableData(clearShowPanel);
      },
      refreshTime(st, et) {
        const startTime = bus.timeFormate(st, 'yyyy-MM-dd hh:mm');
        const endTime = bus.timeFormate(et, 'yyyy-MM-dd hh:mm');
        this.searchTime = [startTime, endTime];
      },
      panelReloadForDel: function () {
        if (this.showPanel.id === this.panel.id) {
          this.showPanel.id = '';
        }
        this.getTableData();
      },
      /*图表相关操作--start*/
      toAddChart: function () {
        this.$refs.addChartModal.setTitle(this.$t("dashboard.panel.createChartTitle"));
        this.$refs.addChartModal.show(true);
        this.$refs.addChartModal.createData(this.showPanel.id); //初始化创建图表需要的初始数据
      },
      scrollbarHeightHandler() {
        console.info(1)
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
        this.$refs.addChartModal.editData(data, this.showPanel.id);
      },
      // 移除图表:弹出确认框询问
      removeData(data,from) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("panel/" + data.panelId + "/charts?ids=" + data.id).then(response => {
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
              // this.getTableData(); //删除相关图表后，刷新面板数据
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      delChartOk() {
        this.filter.panelId = this.showPanel.id;
        this.getData(this.filter);
      },
      // 图表创建成功，回调panel页面，进行图表的刷新
      createSuccess(msg, data, params) {
        /*
   if (data && data.code === 200) {

     if (msg === 'create') {
       //this.$message.success('添加成功');
     } else {
       //this.$message.success('编辑成功');
     }
    }
     */
        this.filter.panelId = this.showPanel.id;
        this.getData(this.filter);
      },
      // 获取数据,用在子页面
      getData(params) {
        if (params.start_time === '' || params.end_time === '') {
          let now = new Date();
          let endTimeTmp = bus.timeFormate(now, 'yyyy-MM-dd hh:mm:ss');
          let startTimeTmp = bus.timeFormate(now.setMinutes(now.getMinutes() - 5), 'yyyy-MM-dd hh:mm:ss');
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
        this.filter.panelId = this.showPanel.id;
        this.getData(this.filter);
      },
      /*时间条件查询--end*/
      //公用操作
      jumpTo(data, id) {
        //this.$store.state.assetData.moduleData = data
        //this.$store.state.assetData.selectedData = id
        bus.$emit("menu-change", data);
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
      panelReloadOnlyPanel() { //仅刷新panel数据
        this.$get('panel?pageNo=1&pageSize=-1').then(response => {
          if (response.code === 200) {
            this.panelData = response.data.list;
            for (let i = 0; i < this.panelData.length; i++) {
              if (this.panelData[i].id == this.showPanel.id) {
                this.showPanel.name = this.panelData[i].name;
                break;
              }
            }
          }
        });
      },
      getTableData: function (clearShowPanel) {
        this.$get('panel?pageNo=1&pageSize=-1').then(response => {
          if (response.code === 200) {
            this.panelData = response.data.list;
            let isInitData = false;
            if (response.data.list.length > 0) {
              if (this.$store.state.showPanel.id !== 0 && this.$store.state.showPanel.name !== '') {
                this.showPanel.name = this.$store.state.showPanel.name;
                this.showPanel.id = this.$store.state.showPanel.id;
              }
              if (clearShowPanel) {
                this.showPanel.id = '';
              }
              if (this.showPanel.id === '') {
                this.showPanel.id = response.data.list[0].id;
                this.showPanel.name = response.data.list[0].name;
                this.filter.panelId = this.showPanel.id;
                this.getData(this.filter);
                isInitData = true;
              }
              this.filter.panelId = this.showPanel.id;
            } else {
              this.showPanel.id = '';
              this.filter.panelId = '';
            }
            this.pageObj.total = response.data.total;
            if (!isInitData &&(this.panel.id === '' || this.panel.id === this.showPanel.id)) {
              this.getData(this.filter);
            }
            this.$store.state.showPanel.id = 0;
            this.$store.state.showPanel.name = '';

          }else {
            if(response.msg){
              this.$message.error(response.msg);
            }else if(response.error){
              this.$message.error(response.error);
            }else {
              this.$message.error(response);
            }
          }
        }).catch((error) => {
          //console.log('error................'+JSON.stringify(error));
          if (error) {
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
        this.getTableData();
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        this.getTableData();
      },
      // search: function (searchObj) {
      //   this.searchLabel = {};
      //   let containTitle = false;
      //   for (let item in searchObj) {
      //     if (searchObj[item]) {
      //       this.$set(this.searchLabel, item, searchObj[item]);
      //       if (item === 'name') {
      //         this.filter.searchName = searchObj[item]; //此处就一个条件
      //         containTitle = true;
      //       }
      //     }
      //   }
      //   if (!containTitle) {
      //     this.filter.searchName = '';
      //   }
      //   this.filter.panelId = this.showPanel.id;
      //   this.getData(this.filter);
      // },
      search:function(){
        this.filter.panelId=this.showPanel.id;
        this.getData(this.filter);
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
          if (scrollbarWrap.scrollHeight - scrollbarWrap.scrollTop - scrollbarWrap.offsetHeight < 20) {
            _self.$refs.chartList.pageDataList(true, _self.showPanel.id);
          }
        }
        /*let dom = document.getElementById('tableList');
        let scrollHeight = dom.scrollHeight;//整个可滑动区域高度
        let clientHeight = dom.clientHeight;//可视高度
        let scrollTop = dom.scrollTop;//滚动条顶部与整个scrollHeight顶部的距离
        if (scrollHeight - clientHeight - scrollTop <= 20) {//滚动到底部，才加载新数据
          this.$refs.chartList.pageDataList(true, this.showPanel.id);
        }*/
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
    created() {
      this.getTableData();
    },
    mounted: function () {
      this.onScroll();
    },
    computed: {
      refreshPanel() {
        return this.$store.state.panelListReload;
      }
    },
    watch: {
      refreshPanel(n, o) {
        if (n) {
          this.getTableData();
          this.$store.commit('panelListChange', false);
        }
      },
      'filter.searchName':function(n,o){
        let temp=this;
        setTimeout(function(){
          temp.search();
        },1000)
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
    height: calc(100% - 92px);
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

