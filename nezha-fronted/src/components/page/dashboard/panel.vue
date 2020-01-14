<style scoped>
  .panel {
    height: 100%;
  }
  .panel .el-table {
    border-radius: 5px;
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
    margin-top: 10px;
    overflow-y:auto;
    height: 100%;
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
    width:100%;
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
  .panel-select-width{
    width: 150px;
  }
  .panel-refresh-interval{
    margin-right: 5px;
    float: right;
  }
  .panel-refresh-interval-select{
    width: 95px;
  }
  .panel-calendar{
    float: right;
    margin-right: 1px;
  }

</style>
<template>
  <div class="panel">
    <div class="content-left">
      <div class="sidebar-title">{{$t('dashboard.title')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top sidebar-info-item-active">{{$t('dashboard.panel.title')}}</div>
        <div class="sidebar-info-item" @click="jumpTo('metricPreview')">{{$t('dashboard.metricPreview.title')}}</div>
      </div>
    </div>
    <div class="content-right">
      <div class="top-tools">
        <button @click="toAddChart" class="nz-btn nz-btn-size-normal nz-btn-style-normal float-right">
          <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
        </button>
        <div class="top-tool-search float-right"><search-input  ref="searchInput" :searchMsg="searchMsg" @search="search" ></search-input></div>
        <el-select class="panel-select-width" popper-class="" v-model="showPanel.id" placeholder=""  size="small" @change="panelChange">
          <el-option  >
            <span class="panel-dropdown-btn-create" @click.stop="toAdd" >{{$t('dashboard.panel.createPanelTitleSec')}}</span>
          </el-option>
          <el-option
            @click.native=""
            v-for="item in panelData"
            :key="item.id"
            :label="item.name"
            :value="item.id">
            <span class="panel-dropdown-label-txt" >{{item.name}}</span>
            <span class="panel-dropdown-btn" @click.stop="toEdit(item)">
                                        <i class="el-icon-edit-outline" ></i>
                                    </span>
            <span class="panel-dropdown-btn panel-dropdown-btn-delete" @click.stop="del(item)"><i class="el-icon-delete"></i></span>
          </el-option>
        </el-select>
        <div class="panel-refresh-interval" >
          <div class="block">
            <!--
              <button type="button"  class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-style-square">
                <span class="top-tool-btn-txt"><i class="el-icon-refresh-right"></i></span>
              </button>
            -->
            <el-select  class="panel-refresh-interval-select" placeholder="" v-model="interval" @change="selectInterval" size="small">
              <el-option v-for="item in intervalList"
                         :value="item.value"
                         :label="item.name"
                         :key="item.value">{{item.name}}</el-option>
            </el-select>
          </div>
        </div>
        <div class="panel-calendar" >
          <div class="block">
            <el-date-picker size="small" ref="calendar"
                            format="yyyy/MM/dd HH:mm"
              @change="dateChange"
              v-model="searchTime"
              type="datetimerange"
              :picker-options="pickerOptions"
              :range-separator="$t('dashboard.panel.to')"
              :start-placeholder="$t('dashboard.panel.startTime')"
              :end-placeholder="$t('dashboard.panel.endTime')"
              align="right">
            </el-date-picker>
          </div>
        </div>
      </div>
      <div class="table-list"  >
        <div class="box-content">
          <chart-list
            @on-edit-chart="editData"
            @on-remove-chart="removeData" ref="chartList"></chart-list>
        </div>
      </div>
    </div>

    <panel-box :panel="panel"  @reload="panelReload" @reloadForDel="panelReloadForDel" ref="panelBox"></panel-box>
    <chart-box  ref="addChartModal" @on-create-success="createSuccess" @on-delete-success="delChartOk"></chart-box>
  </div>

</template>
<script>
  import ChartBox from "./chartBox";
  import ChartList from '../../charts/chart-list';
  import bus from '../../../libs/bus';

  export default {
    name: "panel",
    data() {
      return {
        rightBox: { //面板弹出框相关
          show: false,
          title: this.$t('dashboard.panel.createPanelTitle')
        },
        pickerOptions: {
          shortcuts: [
            {
              text:  this.$t("dashboard.panel.recOne"),
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setHours(start.getHours() - 1);
                picker.$emit('pick', [start, end]);
              }
            },{
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
            },  {
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
            },{
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
          },{
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
        },
        searchTime: [new Date().setHours(new Date().getHours()-1),new Date()],
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
        showPanel:{//panel下拉列表
          id:'',
          name:''
        },
        panel: {//新增panel
          id:'',
          name: ''
        },
        chart: {
          id:'',
          title: '',
          type:'line',
          span:12,
          height:400,
          elements:{
            id: '',
            expression: '',
            type: ''
          }
        },
        pageObj: {
          pageNo: 1,
          pageSize: -1,//此处获取所有数据，所以设置一个较大的值
          total:0
        },
        chartsData: [],//中间部分图表相关数据
        panelData: [],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [/*
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
          searchName:''
        },
        panelId: 0,
        //removeModal: false, // 删除弹出
        //deleteObj: {}, // 删除对象
        //---图表相关参数--end
      }
    },
    components:{
      'chart-box':ChartBox,
      'chart-list':ChartList
    },
    methods: {
      //面板相关操作
      panelChange(){
        //this.$refs.searchInput.select();
        this.filter.panelId = this.showPanel.id;
        this.getData(this.filter);
      },
      del: function(u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("panel?ids=" + u.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              if(this.showPanel.id===u.id){
                this.showPanel.id ='';
              }
              this.getTableData();
              this.rightBox.show = false;
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      toEdit: function(u) {
        this.panel = Object.assign({}, u);
        this.$refs.panelBox.setTitle(this.$t("dashboard.panel.editPanelTitle"));
        this.$refs.panelBox.show(true);
      },
      toAdd: function() {
        this.$refs.panelBox.show(true);
        this.panel = {id: '', name: ''};
        this.$refs.panelBox.setTitle(this.$t("dashboard.panel.createPanelTitle"));
      },
      panelReload(){
        this.getTableData();
      },
      panelReloadForDel:function(){
        if(this.showPanel.id===this.panel.id){
          this.showPanel.id ='';
        }
        this.getTableData();
      },
      /*图表相关操作--start*/
      toAddChart:function(){
        this.$refs.addChartModal.setTitle(this.$t("dashboard.panel.createChartTitle"));
        this.$refs.addChartModal.show(true);
        this.$refs.addChartModal.createData(this.showPanel.id);//初始化创建图表需要的初始数据
      },

      // 编辑图表信息,打开编辑弹窗
      editData(data) {
        this.$refs.addChartModal.setTitle(this.$t("dashboard.panel.editChartTitle"));
        this.$refs.addChartModal.show(true);
        this.$refs.addChartModal.editData(data, this.showPanel.id);
      },
      // 移除图表:弹出确认框询问
      removeData(data) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("panel/"+data.panelId+"/charts?ids=" + data.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();//删除相关图表后，刷新面板数据
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      delChartOk(){
        this.filter.panelId = this.showPanel.id;
        this.getData(this.filter);
      },
      // 图表创建成功，回调panel页面，进行图表的刷新
      createSuccess(msg, data,params) {
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
        if( params.start_time===''||params.end_time===''){
          let now = new Date();
          let endTimeTmp = bus.timeFormate(now, 'yyyy-MM-dd hh:mm:ss');
          let startTimeTmp = bus.timeFormate(now.setHours(now.getHours()-1), 'yyyy-MM-dd hh:mm:ss');
          params.start_time = startTimeTmp;
          params.end_time = endTimeTmp;
        }
        this.$refs.chartList.initData(params);
      },

      /*图表相关操作--end*/
      /*时间条件查询--start*/
      // 选择日期变化
      dateChange() {
        //this.$refs.searchInput.select();
        this.filter.start_time = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss');
        this.filter.end_time = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss');
        this.filter.panelId = this.showPanel.id;
        this.getData(this.filter);
      },
      /*时间条件查询--end*/
      //公用操作
      jumpTo(data,id) {
        this.$store.state.assetData.moduleData = data
        this.$store.state.assetData.selectedData = id
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
      getTableData: function() {
        this.$get('panel?pageNo=1&pageSize=-1').then(response => {
          if (response.code === 200) {
            this.panelData = response.data.list;
            if( response.data.list.length>0 ){
              if(this.showPanel.id===''){
                this.showPanel.id = response.data.list[0].id;
                this.filter.panelId = this.showPanel.id;
                this.getData(this.filter);
              }
              this.filter.panelId = this.showPanel.id;
            }else {
              this.showPanel.id ='';
              this.filter.panelId='';
            }
            this.pageObj.total = response.data.total
            if(this.panel.id===''||this.panel.id===this.showPanel.id){
              this.getData(this.filter);
            }
          }
        })
      },
      //定期刷新
      selectInterval(val) {
        clearInterval(this.intervalTimer);
        if (val) {
          const start = new Date(this.searchTime[1]);
          const now = new Date();
          const interval = Math.floor((now.getTime() - start.getTime()) / 1000);//计算当前结束时间到现在的间隔（秒）
          if (interval >= 60) {//如果结束时间到现在超过1分钟，则
            this.getIntervalData(interval);
          }
          this.intervalTimer = setInterval(() => {
            this.getIntervalData(this.interval);
          }, val * 1000);
        }
      },
      getIntervalData(interval) {//interval:结束时间到现在的秒数
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
      search: function(searchObj) {
        this.searchLabel = {};
        let containTitle = false;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
            if(item==='name'){
              this.filter.searchName = searchObj[item];//此处就一个条件
              containTitle= true;
            }
          }
        }
        if(!containTitle){
          this.filter.searchName =  '';
        }
        this.filter.panelId = this.showPanel.id;
        this.getData(this.filter);
      }
    },
    created() {
      this.getTableData();
    },
    mounted: function() {
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
      }
    }
  }
</script>
