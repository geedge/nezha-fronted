<style lang="scss">
  @import '../../charts/line-chart-block';
  .project-calendar .el-input__inner {
       height: 26px !important;
       border-color: #d8d8d8;
     }
</style>
<style scope>
  .chart-bottom {
    text-align: center;
  }
</style>
<template>
  <div class="project">
    <div class="content-left">
      <div class="sidebar-title too-long-split">{{$t('project.project.project')}}：{{currentProject.name}}</div>
      <div class="sidebar-info">
        <div
          v-for="item in moduleList"
          class="sidebar-info-item"
          :class="{'sidebar-info-item-active': item.id == currentModule.id}"
          @click="changeModule(item)"
          :id="'project-module-'+item.id"
        >
          <div class="sidebar-info-item-txt">
            <el-popover v-if="item.name.length > 16" trigger="hover" placement="top-start" :content="item.name" >
              <span slot="reference">{{item.name}}</span>
            </el-popover>
            <span v-else>{{item.name}}</span>
          </div>
          <div class="side-bar-menu-edit" @click.stop="toEditModule(item)" :id="'project-module-edit-'+item.id"><i class="nz-icon nz-icon-edit"></i></div>
        </div>
      </div>
    </div>

    <!--metrics-->
    <div class="content-right" v-show="tableShow == 2">
      <div class="top-tools">
        <div class="nz-tab">
          <div @click="tableShow = 1" class="nz-tab-item-box">
            <div class="nz-tab-item">{{$t('project.endpoint.endpoint')}}</div>
          </div>
          <div class="nz-tab-item-box">
            <div class="nz-tab-item nz-tab-item-active">{{$t('project.metrics.metrics')}}</div>
          </div>
        </div>
        <div class="top-tool-search"><search-input :searchMsg="metricSearchMsg" @search="metricSearch"></search-input></div>
      </div>
      <el-table
        :data="metricsTableData"
        class="nz-table"
        border
        height="calc(100% - 195px)"
        style="width: 100%;">
        <el-table-column
          :resizable="false"
          v-for="(item, index) in metricsTableTitle"
          v-if="item.show"
          :width="item.width"
          :key="`col-${index}`"
          :label="item.label"
          min-width="110px"
        >
          <template slot-scope="scope" :column="item">
            <span>{{scope.row[item.prop]}}</span>
          </template>
        </el-table-column>
      </el-table>
      <Pagination v-cloak :pageObj="metricPageObj" @pageNo='metricsPageNo' @pageSize='metricsPageSize' ref="metricPagination"></Pagination>
    </div>

    <!--endpoint-->
    <div class="content-right" v-show="tableShow == 1">
      <div class="top-tools">
        <div class="nz-tab">
          <div class="nz-tab-item-box">
            <div class="nz-tab-item nz-tab-item-active">{{$t('project.endpoint.endpoint')}}</div>
          </div>
          <div class="nz-tab-item-box" @click="tableShow = 2">
            <div class="nz-tab-item">{{$t('project.metrics.metrics')}}</div>
          </div>
        </div>
        <div>
          <button @click="toCreateEndpoint" class="nz-btn nz-btn-size-normal nz-btn-style-light float-right nz-btn-min-width-82" id="project-add-ep">
            <span class='top-tool-btn-txt'>
              <i class="nz-icon-create-square nz-icon"></i>
              {{$t('overall.add')}}</span>
          </button>
          <div class="top-tool-search float-right"><search-input :searchMsg="endpointSearchMsg" @search="endpointSearch" ref="projectSearch"></search-input></div>
        </div>
      </div>
      <el-table
        :data="endpointTableData"
        border
        class="nz-table"
        height="calc(100% - 195px)"
        style="width: 100%;">
        <el-table-column
          :resizable="false"
          v-for="(item, index) in tablelable"
          v-if="item.show"
          :width="item.width"
          :key="`col-${index}`"
          :label="item.label"
          min-width="110px"
        >
          <template slot="header" slot-scope="scope">
              <span v-if="index==0">
                <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">
                    <i class="nz-icon nz-icon-gear"></i>
                </span>
                <span class="nz-table-txt">{{item.label}}</span>
              </span>
            <div v-else>
              <span>{{item.label}}</span>
            </div>
          </template>
          <template slot-scope="scope" :column="item">
            <span v-if="item.prop == 'asset' && scope.row[item.prop]" class="link" @click="viewAsset(scope.row[item.prop].id)">{{scope.row[item.prop].host}}</span>
            <span v-else-if="item.prop == 'param'">
              <span v-for="p in scope.row.paramObj">{{p.key}}={{p.value}}，</span>
            </span>
            <div v-else-if="item.prop == 'option'" class="content-right-options">
              <span @click="toEditEndpoint(scope.row)" class="content-right-option" :id="'edp-edit-'+scope.row.id"><i
                class="nz-icon nz-icon-edit"></i>&nbsp;&nbsp;<span>{{$t('overall.edit')}}</span>
              </span>&nbsp;&nbsp;

              <span @click="endpointDetail(scope.row)" class="content-right-option" :id="'edp-detail-'+scope.row.id"><i
                class="nz-icon nz-icon-view"></i>&nbsp;&nbsp;<span>{{$t('overall.view')}}</span>
              </span>

              <span @click="showEndpoint(scope.row)" class="content-right-option" :id="'edp-query-'+scope.row.id">
                <i class="el-icon-search"></i>&nbsp;<span>{{$t('overall.query')}}</span>
              </span>
            </div>
            <span v-else-if="item.prop == 'lastUpdate'">{{dateFormat(scope.row.lastUpdate)}}</span>
            <span v-else-if="item.prop == 'state'" :style="{color: scope.row.state == 0 ? 'red' : (scope.row.state == 0 ? 'green' : '')}">{{scope.row.state == 1 ? 'up' : ''}}{{scope.row.state == 0 ? 'down' : ''}}</span>
            <span v-else>{{scope.row[item.prop]}}</span>
          </template>
        </el-table-column>
      </el-table>
      <Pagination v-cloak :pageObj="endpointPageObj" @pageNo='endpointPageNo' @pageSize='endpointPageSize' ref="endpointPagination"></Pagination>
    </div>

    <!--endpoint query-->
    <div class="content-right" v-show="tableShow == 3">
      <div class="top-tools">
        <div>
          <div @click="backToEdpTab">
            <button  class="nz-btn nz-btn-size-normal nz-btn-style-light float-right nz-btn-min-width-82">
          <span class='top-tool-btn-txt'>
            {{$t('overall.back')}}</span>
            </button>
          </div>
        </div>
        <!--时间选择器-->
        <div>
          <button @click="changeTime(-10)" class="nz-btn nz-btn-size-normal nz-btn-style-light"><i class="el-icon-d-arrow-left"></i></button>
          <el-date-picker
            v-model="formatTime"
            type="datetime"
            size="mini"
            class="project-calendar"
            clearable
            :time-arrow-control="true"
            placeholder="Moment"
            value-format="yyyy-MM-dd HH:mm:ss"
            @change="pickTime"
            >
          </el-date-picker>
          <button @click="changeTime(10)" class="nz-btn nz-btn-size-normal nz-btn-style-light margin-r-20"><i class="el-icon-d-arrow-right"></i></button>
          <button @click="viewGraph" slot="reference" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-120">
            <span class='top-tool-btn-txt'>{{$t('project.endpoint.addGraph')}}</span>
          </button>
        </div>
      </div>
      <el-table
        v-loading="queryEdpLoading"
        :data="endpointQueryTabData"
        border
        class="nz-table"
        :header-cell-class-name="cellClass"
        height="calc(100% - 65px)"
        @select="selectRow"
        style="width: 100%;">
        <el-table-column
          type="selection"
          width="38"
          align="center"
          :selectable="selectable"
        >
        </el-table-column>

        <el-table-column
          prop="element"
          :label="$t('project.endpoint.element')">
        </el-table-column>
        <el-table-column
          prop="value"
          :label="$t('project.endpoint.value')"
          width="180">
        </el-table-column>
      </el-table>
    </div>

    <element-set
      v-clickoutside="elementsetHide"
      :table-title="endpointTableTitle"
      :dropCol="dropCol"
      @tablelable="tablelabelEmit"
      ref="elementset"
    ></element-set>

    <el-dialog class="line-chart-block-modal"
      :title="$t('project.endpoint.dialogTitle')"
      :visible.sync="graphShow"
      width="90%"
      @close="dialogClose"
      @opened="initDialog">
      <div slot="title">
        {{$t("project.endpoint.dialogTitle")}}
        <div class="float-right panel-calendar dialog-tool">
          <el-date-picker ref="calendar" prefix-icon=" " size="mini" class="nz-dashboard-picker"
                          @change="dateChange"
                          v-model="searchTime"
                          type="datetimerange"
                          :picker-options="pickerOptions"
                          :range-separator="$t('dashboard.panel.to')"
                          :start-placeholder="$t('dashboard.panel.startTime')"
                          :end-placeholder="$t('dashboard.panel.endTime')"
                          value-format="yyyy-MM-dd hh:mm:ss"
                          align="right">
          </el-date-picker>
          <!--<button @click="refreshChart" type="button" class="nz-btn nz-btn-size-normal nz-btn-style-light"><i style="font-size: 14px;" class="el-icon-refresh-right"></i></button>-->
        </div>
      </div>
      <div class="line-area " ref="viewGraphChart"  id="viewGraphChart"></div>
      <div class="line-100 margin-t-20 margin-b-30"></div>
      <div class="chart-bottom">
        <button class="nz-btn nz-btn-size-large nz-btn-style-normal nz-btn-min-width-82" @click="saveChart">{{$t('dashboard.metric.saveChart')}}</button>
      </div>
    </el-dialog>

    <module-box :currentProject="currentProject" :module="editModule" @reload="getModuleList" ref="moduleBox"></module-box>
    <edit-endpoint-box :currentProject="currentProject" :currentModule="currentModule" :endpoint="editEndpoint" @reload="getEndpointTableData" ref="editEndpointBox"></edit-endpoint-box>
    <add-endpoint-box :currentProject="currentProject" :currentModule="currentModule" @reload="getEndpointTableData" ref="addEndpointBox"></add-endpoint-box>
    <asset-edit-unit :edit-unit-show='viewAssetState' @refreshData="getEndpointTableData" @sendStateData="tabControl" ref="assetEditUnit"></asset-edit-unit>
    <chart-box ref="addChartModal" :panel-data="panelData" @on-create-success="createSuccess"></chart-box>
  </div>
</template>

<script>
  import echarts from 'echarts';
  import chartBox from "../dashboard/chartBox";
  import bus from "../../../libs/bus";

  export default {
    name: "project2",
    components: {
      'chart-box': chartBox
    },
    data() {
      let temp=this;
      return {
        tableShow: 1, // 1.endpoint; 2.metrics
        editEndpoint: {id: '', host: '', port: '', param: '', path: '', asset: {}, project: {}, module: {}, moduleId: '', assetId: '', paramObj: []},
        endpointTableTitle: [
          {
            label: this.$t("project.endpoint.endpointId"),
            prop: 'id',
            show: true,
            width: 150
          },{
            label: this.$t("project.endpoint.asset"),
            prop: 'asset',
            show: true,
          },{
            label: this.$t("project.endpoint.host"),
            prop: 'host',
            show: true,
          },{
            label: this.$t("project.endpoint.port"),
            prop: 'port',
            show: true,
          },{
            label: this.$t("project.endpoint.param"),
            prop: 'param',
            show: true,
          },{
            label: this.$t("project.endpoint.path"),
            prop: 'path',
            show: true,
          },{
            label: this.$t("alert.list.state"),
            prop: 'state',
            show: true,
          },{
            label: this.$t("project.endpoint.lastUpdate"),
            prop: 'lastUpdate',
            show: true,
          }, {
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true,
            width: 200
          }
        ],
        endpointTableData: [],
        endpointPageObj: {
          pageNo: 1,
          pageSize: 20,
          total:0
        },
        metricsTableTitle: [
          {
            label: this.$t("project.metrics.name"),
            prop: 'metric',
            show: true,
          },
          {
            label: this.$t("project.metrics.type"),
            prop: 'type',
            show: true,
          },
          {
            label: this.$t("project.metrics.description"),
            prop: 'help',
            show: true,
          },
        ],
        metricsTableData: [],
        metricPageObj: {
          pageNo: 1,
          pageSize: 20,
          total: 0
        },
        tablelable: [],
        dropCol: [],
        moduleList: [],
        projectList: [],
        currentProject: {id: '', name: '', remark: ''}, //endpoint弹框、module列表用来回显project
        editModule: {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []}, //编辑的module
        currentModule: {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []}, //endpoint弹框用来回显module
        endpointSearchLabel: {moduleId: ''}, //endpoint搜索参数
        metricSearchLabel: {moduleId: ''}, //metrics搜索参数
        endpointSearchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 1,
            name: "ID",
            type: 'input',
            label: 'id',
            disabled: false
          }, {
            id: 11,
            name: this.$t('asset.asset'),
            type: 'asset',
            label: 'asset',
            disabled: false
          }],
        },
        metricSearchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 12,
            name: 'Metric',
            type: 'input',
            label: 'metric',
            disabled: false
          }],
        },
        viewAssetState:false,
        curEndpoint:null,
        endpointQueryTabData:[],//endpoint 查询列表数据
        queryExpression:'',
        metricList: [], // metric列表
        formatTime:'',//查询endpoint的时间，
        selectedEndpoints:[],//选中的metric{label='value'}
        chartDatas:[],//从query_range查询到的数据
        lenged:[],//echart lenged
        graphChart:null,//图标对象
        graphShow:false,
        searchTime:[],
        queryEdpLoading:false,
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
        chartOptions:{
          title: {
            text: ""
          },
          tooltip: {
            trigger: 'axis',
          },
          legend: {
            type:'scroll',
            height:80,
            show:true,
            icon:"roundRect",
            itemHeight:5,
            itemWidth:15,
            data:[],
            orient:'vertical',
            formatter:function(name){
              if(!name){
                return '';
              }
              //计算宽度
              let chartWidth=temp.$refs.viewGraphChart.clientWidth;
              var span = document.createElement("span");
              var result = {};
              result.width = span.offsetWidth;
              result.height = span.offsetHeight;
              span.style.visibility = "hidden";
              span.style.fontSize = 14;
              span.style.fontFamily = "Arial";
              span.style.display = "inline-block";
              document.body.appendChild(span);
              if(typeof span.textContent != "undefined"){
                span.textContent = name;
              }else{
                span.innerText = name;
              }
              var txtWidth = parseFloat(window.getComputedStyle(span).width) - result.width;
              document.body.removeChild(span);

              if(txtWidth < chartWidth){
                return name;
              }else {
                var charNum = `${(chartWidth-100)/(txtWidth/name.length)}`;
                return name.slice(0,charNum)+'...';
              }
            },
            tooltip:{
              show:true,
              formatter:function(params){
                //console.log("params")
                //console.log(params);
                return `<div  style='width:100%;display:block;word-break:break-all;word-wrap:break-word;white-space:normal'> ${params.name}</div>`;
              },
            },
            orient:'vertical',
            x:'center',
            y:'bottom',
          },
          grid: {
            //height:"50%",
            //top: '13%',
            containLabel: false,
            bottom:156
          },
          dataZoom: [{
            type: 'slider',
            show:true,
            xAxisIndex: [0],
            start: 0,
            end: 100,
            height:25,
            bottom:96
          }],

          xAxis: {
            type: 'time',
            axisLabel: {
              intervale: 0,
              rotate: 0,
              formatter: function (value) {
                var t_date = new Date(value);
                return [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('-') + "\n"
                  + [t_date.getHours(), t_date.getMinutes()].join(':');
              }
            },
            axisPointer: {//y轴上显示指针对应的值
              show: true,
            },
            splitLine:{
              show:false
            }
          },
          yAxis: {
            type: 'value',
            splitLine:{
              show:true
            },
            axisLabel: {
              formatter: function(num,index) {
                if (num >= 1000) {
                  const kbNum = num / 1000;
                  if (kbNum >= 1000) {
                    const mbNum = kbNum / 1000;
                    if (mbNum > 1000) {
                      const gbNum = mbNum / 1000;
                      /*
                      if (gbNum > 1000) {
                        const tbNum = gbNum / 1000;
                        if (tbNum > 1000) {
                          const pbNum = tbNum / 1000;
                          return `${pbNum.toFixed(2)}PB`;
                        }
                        return `${tbNum.toFixed(2)}TB`;
                      }*/
                      return `${parseFloat(gbNum.toFixed(2))}B`;
                    }
                    return `${parseFloat(mbNum.toFixed(2))}M`;
                  }
                  return `${parseFloat(kbNum.toFixed(2))}K`;
                }
                // return parseFloat(num.toFixed(2));
                return num;
              },
            },
          },
          useUTC: false,//使用本地时间
          series: []
        },
        panelData: [], //chart-box的panel下拉框数据
      }
    },
    methods: {
      saveChart() { //新增chart
        this.$refs.addChartModal.setTitle(this.$t("dashboard.panel.createChartTitle"));
        this.$refs.addChartModal.show(true);
        let metricInfo = {};
        metricInfo.elements = [];
        //console.info("aaa", this.selectedEndpoints)
        for(let i = 0; i < this.selectedEndpoints.length; i++) {
          let type = '';
          if (this.selectedEndpoints[i].type == '1') {
            type = 'expert';
          } else if (this.selectedEndpoints[i].type == '2') {
            type = 'normal';
          }
          metricInfo.elements.push({expression: this.selectedEndpoints[i].element, type: type});
        }
        this.$refs.addChartModal.createData(-1, metricInfo);
      },
      createSuccess(type, response, param, panel) {
        this.$confirm(this.$t("dashboard.metric.goPanelTip"),this.$t("tip.saveSuccess"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'success'
        }).then(() => {
          bus.$emit("menu-change", 'panel');
          this.$store.state.showPanel.id = panel.id;
          this.$store.state.showPanel.name = panel.name;
          this.$router.push({
            path: "/panel",
            query: {
              t: +new Date()
            }
          });
        });
      },
      elementsetShow(s, e) {
        var eventfixed = {
          shezhi: 0,
          screen: 0
        };
        eventfixed[s] = 1;
        e.preventDefault();
        this.$store.commit('setHeaderTable', this.tablelable);
        this.$store.commit('setEventfixed', eventfixed);
        const h = document.documentElement.clientHeight;
        const w = document.documentElement.clientWidth;
        const dw = this.$refs.elementset.$el.offsetWidth;
        const dh = this.$refs.elementset.$el.offsetHeight;
        let positionx =
          e.clientX + dw <= w - 10 ? e.clientX - 250 : e.clientX - 250 - dw;
        let positiony =
          e.clientY + dh <= h - 10
            ? e.clientY - 70
            : e.clientY - 70 - (e.clientY + dh - h);
        this.$store.commit('setPosition', { positionx, positiony });
      },
      elementsetHide() {
        //悬浮点击空白隐藏
        this.$refs.elementset.elementsetHide();
      },
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        this.tablelable = data;
      },
      getEndpointTableData() {
        this.endpointSearchLabel.moduleId = this.currentModule.id;
        this.$set(this.endpointSearchLabel, 'pageNo', this.endpointPageObj.pageNo);
        this.$set(this.endpointSearchLabel, 'pageSize', this.endpointPageObj.pageSize);
        this.$get('endpoint', this.endpointSearchLabel).then(response => {
          if (response.code === 200) {
            for (let i = 0; i < response.data.list.length; i++) {
              try {
                let tempObj = JSON.parse(response.data.list[i].param);
                response.data.list[i].paramObj = [];
                for (let k in tempObj) {
                  response.data.list[i].paramObj.push({key: k, value: tempObj[k]})
                }
              } catch (err) {
                console.error(response.data.list[i], err);
              }
            }
            this.endpointTableData = response.data.list;
            this.endpointPageObj.total = response.data.total;
          }
        });
      },
      getMetricsTableData() {
        this.metricSearchLabel.moduleId = this.currentModule.id;
        this.$set(this.metricSearchLabel, 'pageNo', this.metricPageObj.pageNo);
        this.$set(this.metricSearchLabel, 'pageSize', this.metricPageObj.pageSize);
        this.$get('metric', this.metricSearchLabel).then(response => {
          if (response.code === 200) {
            this.metricsTableData = response.data.list;
            this.metricPageObj.total = response.data.total;
          }
        });
      },
      endpointPageNo(val) {
        this.endpointPageObj.pageNo = val;
        this.getEndpointTableData();
      },
      endpointPageSize(val) {
        this.endpointPageObj.pageSize = val;
        this.getEndpointTableData();
      },
      metricsPageNo(val) {
        this.metricPageObj.pageNo = val;
        this.getMetricsTableData();
      },
      metricsPageSize(val) {
        this.metricPageObj.pageSize = val;
        this.getMetricsTableData();
      },

      // 获取左侧module列表数据
      getModuleList() {
        //若currentProject不存在（如页面刷新了），默认取project列表的第一个
        if (this.currentProject && this.currentProject.id) {
          this.$get('module', {projectId: this.currentProject.id, pageSize: 999, pageNo: 1}).then(response => {
            if (response.code === 200) {
              this.moduleList = response.data.list;
              for (let i = 0; i < this.moduleList.length; i++) {
                try {
                  let tempObj = JSON.parse(this.moduleList[i].param);
                  this.$set(this.moduleList[i], 'paramObj', []);
                  for (let k in tempObj) {
                    this.moduleList[i].paramObj.push({key: k, value: tempObj[k]});
                  }
                } catch (err) {
                  console.info(response.data.list[i], err);
                }
              }
              if (this.moduleList.length > 0) {
                this.currentModule = this.moduleList[0];
              } else {
                this.currentModule = {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []};
              }
            }
          });
        } else {
          if (this.projectList && this.projectList.length > 0) {
            this.$store.commit('setProject', this.projectList[0]);
          } else {
            this.$get('project', {pageSize: 999, pageNo: 1}).then(response => {
              if (response.code == 200) {
                this.projectList = response.data.list;
                if (this.projectList.length > 0) {
                  this.getModuleList();
                } else {
                  return;
                }
              }
            });
          }
        }
      },

      //左侧module列表选中切换
      changeModule(module) {
        this.currentModule = module;
        this.endpointSearchLabel = {moduleId: ''};
        this.metricSearchLabel = {moduleId: ''};
        this.$refs.projectSearch.clearSearch();
        this.tableShow=1;
        this.selectedEndpoints=[];
      },

      //弹出endpoint编辑页
      toEditEndpoint(endpoint) {
        this.editEndpoint = JSON.parse(JSON.stringify(endpoint));
        this.rightBoxHandler(3);
        this.$refs.editEndpointBox.toEdit(true);
        if (!this.editEndpoint.paramObj) {
          this.$set(this.editEndpoint, 'paramObj', []);
        }
      },

      toCreateEndpoint() {
        this.$refs.addEndpointBox.show(true);
        this.$refs.addEndpointBox.clearEndpoints();
      },

      //查看endpoint详情
      endpointDetail(endpoint) {
        this.editEndpoint = JSON.parse(JSON.stringify(endpoint));
        if (!this.editEndpoint.paramObj) {
          this.$set(this.editEndpoint, 'paramObj', []);
        }
        this.rightBoxHandler(3);
        this.$refs.editEndpointBox.toEdit(false);
      },

      //弹出module编辑页
      toEditModule(module) {
        this.currentModule = JSON.parse(JSON.stringify(module));
        if (!this.currentModule.paramObj) {
          this.$set(this.currentModule, 'paramObj', []);
        }
        this.editModule = JSON.parse(JSON.stringify(module));
        if (!this.editModule.paramObj) {
          this.$set(this.editModule, 'paramObj', []);
        }
        this.rightBoxHandler(2);
      },

      //asset弹框控制
      tabControl(data) {
        if (data === 'close') {
          this.viewAssetState = false
          this.$refs['assetEditUnit'].tabView = false
        }
      },
      //搜索
      endpointSearch: function(searchObj) {
        this.endpointSearchLabel = {};
        this.endpointPageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.endpointSearchLabel, item, searchObj[item]);
          }
        }
        this.getEndpointTableData();
      },
      //搜索
      metricSearch: function(searchObj) {
        this.metricSearchLabel = {};
        this.metricPageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.metricSearchLabel, item, searchObj[item]);
          }
        }
        this.getMetricsTableData();
      },

      //控制弹框状态 type  1:project; 2:module; 3:editEndponit; 4:addEndpoint;
      rightBoxHandler(type) {
        if (type == 1) {
          this.$refs.projectBox.show(true);

          if (this.$refs.moduleBox) {
            this.$refs.moduleBox.show(false);
          }
          if (this.$refs.editEndpointBox) {
            this.$refs.editEndpointBox.show(false);
          }
          //this.$refs.addEndpointBox.show(false);
        } else if (type == 2) {
          this.$refs.moduleBox.show(true,true);

          if (this.$refs.projectBox) {
            this.$refs.projectBox.show(false);
          }
          if (this.$refs.editEndpointBox) {
            this.$refs.editEndpointBox.show(false);
          }
          //this.$refs.addEndpointBox.show(false);
        } else if (type == 3) {
          this.$refs.editEndpointBox.show(true);
          if (this.$refs.projectBox) {
            this.$refs.projectBox.show(false);
          }
          if (this.$refs.moduleBox) {
            this.$refs.moduleBox.show(false);
          }
          //this.$refs.addEndpointBox.show(false);
        } else if (type == 4) {
        }
      },

      dateFormat(time) {
        if (!time) {
          return;
        }
        let date = new Date(time * 1000);
        let year = date.getFullYear();
        let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        let seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
      },
      viewAsset:function(id){
        this.viewAssetState=true;
        this.$refs.assetEditUnit.getAssetData(id);
        this.$refs.assetEditUnit.tabView=true;
      },
      showEndpoint:function(endpoint){
        this.queryEdpLoading=true;
        if(endpoint){
          this.curEndpoint=endpoint;
          this.formatTime='';
        }
        this.endpointQueryTabData=[];
        this.$get("/prom/api/v1/query?query={job='ed_"+this.curEndpoint.id+"'}&time="+this.formatTime).then(response=>{
            if(response.status==="success"){
              let results=response.data.result;
              for (let result of results){
                // {"metric":{"instance":"192.168.40.126:9100","__name__":"scrape_duration_seconds","module":"node_exporter","project":"kafka","asset":"192.168.40.126","job":"ed_1","dc":"dc5"},"value":[1580782176.522,"0.000560761"]}
                let temp=result.metric.__name__;
                delete result.metric.__name__;
                temp+="{";
                for (let key in result.metric){
                  temp+=key +"='"+result.metric[key]+"',";
                }
                temp=temp.charAt(temp.length-1) == ","?temp.substr(0,temp.length-1):temp;
                temp+="}";
                let edpQueryData={element:temp,value:result.value[1],type:(result.metric.type?result.metric.type:'2')};
                this.endpointQueryTabData.push(edpQueryData);
              }
              this.tableShow=3;
              this.queryEdpLoading=false;
            }
        })
      },
      backToEdpTab:function(){
        this.tableShow=1;
        this.selectedEndpoints=[];
      },
      changeTime:function(size,unit){
        let time=this.getTime(size,unit);
        this.formatTime=time;
        this.showEndpoint();
      },
      pickTime:function(){
        //console.log(this.formatTime)
        this.showEndpoint();
      },
      getTime:function(size,unit){//计算时间
        let now=!this.formatTime? new Date():new Date(this.formatTime);
        if(unit){
          switch (unit) {
            case 'y':
              now.setFullYear(now.getFullYear()+size);
              break;
            case 'M':
              now.setMonth(now.getMonth()+size);
              break;
            case 'd':
              now.setDate(now.getDate()+size);
              break;
            case 'h':
              now.setHours(now.getHours()+size);
              break;
            case 'm':
              now.setMinutes(now.getMinutes()+size);
              break;
            case 's':
              now.setSeconds(now.getSeconds()+size);
              break;
            default:
              console.error('unit error');
          }
        }else{
          now.setSeconds(now.getSeconds()+size);
        }
        let year=now.getFullYear();
        let month=now.getMonth()+1;
        month=month<10?"0"+month:month;
        let day=now.getDate();
        day=day<10?"0"+day:day;
        let hour=now.getHours();
        hour=hour<10?"0"+hour:hour;
        let minute=now.getMinutes();
        minute=minute<10?"0"+minute:minute;
        let second=now.getSeconds();
        second=second<10?"0"+second:second;
        let current=year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;
        return current;
      },
      selectRow:function(selection, row){//selection 选中的row的数组  row 选中的当前行
        this.selectedEndpoints=selection;
      },
      selectable:function(row,index){
        if(this.selectedEndpoints.length>=20 && !this.selectedEndpoints.includes(row)){
          return false;
        }else{
          return true;
        }
      },
      viewGraph:function(){
        if(this.graphChart){
          this.graphChart.clear();
        }

        this.chartDatas=[];
        this.lenged=[];
        this.queryChartDate();
        this.graphShow=true;

      },
      dialogClose:function(){
        this.graphShow=false;
        this.graphChart.clear();
      },
      queryChartDate:function(){
        let start=this.searchTime[0]?this.searchTime[0]:this.getTime(-1,'h');
        let end=this.searchTime[1]?this.searchTime[1]:this.getTime(0,'h')
        this.searchTime=[start,end];
        let timeDiff=(new Date(end).getTime()-new Date(start).getTime())/1000/(24*60*60);
        // end - start < 1 day : 15s
        // end - start < 7 day : 5m
        // end - start < 30 day : 10m
        // end - start > 30 day : 30m
        let step='15s';
        if(timeDiff< 1){
          step='15s';
        }else if(timeDiff < 7){
          step='5m';
        }else if(timeDiff<30){
          step='10m';
        }else{
          step='30m';
        }
        for(let endpoint of this.selectedEndpoints){
          this.$get("/prom/api/v1/query_range?query="+endpoint.element+"&start="+start+"&end="+end+"&step="+step).then(response=> {
            if (response.status === "success") {
              let queryData=response.data.result[0];
              if(queryData){
                let chartData={
                  type:"line",
                  symbol:'none',  //去掉点
                  smooth:true,  //曲线变平滑
                };
                chartData.name=queryData.metric.__name__;
                delete queryData.metric.__name__;
                chartData.name+="{";
                Object.keys(queryData.metric).forEach((item,index)=>{
                  let label=item;
                  let value=queryData.metric[label];
                  chartData.name+=label +"='"+value+"',";
                })
                chartData.name=chartData.name.charAt(chartData.name.length-1) == ","?chartData.name.substr(0,chartData.name.length-1):chartData.name;
                chartData.name+="}";
                this.lenged.push(chartData.name);
                chartData.data=queryData.values.map((dpsItem, dpsIndex) => {
                  return [dpsItem[0] * 1000, Number(dpsItem[1])];
                });
                this.chartDatas.push(chartData);
              }
            }
          })
        }      },
      dateChange:function(){
        if(this.graphChart){
          this.graphChart.clear();
        }
        this.queryChartDate();
        this.chartOptions.legend.data=this.lenged;
        this.chartOptions.series=this.chartDatas;
        this.graphChart.setOption(this.chartOptions);//创建图表
      },
      initDialog:function(){
        this.graphChart = echarts.init(document.getElementById('viewGraphChart'));
        this.chartOptions.legend.data=this.lenged;
        this.chartOptions.series=this.chartDatas;
        console.log("chartOptions")
        console.log(this.chartOptions)
        this.graphChart.setOption(this.chartOptions);//创建图表
      },
      cellClass(row){ //给复选框那一列添加 类名为 ‘disabledCheck’
        if (row.columnIndex === 0) {
          return 'disabledCheck'
        }
      },
      getPanelData() { //获取panel数据
        this.$get('panel?pageNo=1&pageSize=-1').then(response => {
          if (response.code === 200) {
            this.panelData = response.data.list;
          }
        });
      },
    },
    created() {
      this.currentProject = this.$store.state.currentProject;
      this.getModuleList();
      this.getMetricsTableData();
    },
    mounted() {
      this.getPanelData();
      setTimeout(()=>{
        this.getEndpointTableData();
      }, 200);
      this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.endpointTableTitle;
      this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.endpointTableTitle;
    },
    computed: {
      currentProjectChange() {
        return this.$store.state.currentProject;
      },
      moduleListReloadWatch() {
        return this.$store.state.moduleListChange;
      },
    },
    watch: {
      currentProjectChange(n, o) {
        this.currentProject = Object.assign({}, n);
      },
      currentProject(n, o) {
        this.getModuleList();
      },
      currentModule(n, o) {
        this.metricPageObj.pageNo = 1;
        this.endpointPageObj.pageNo = 1;
        if (n && n.id) {
          this.getEndpointTableData();
          this.getMetricsTableData();
        } else {
          this.endpointTableData = [];
          this.metricsTableData = [];
        }
      },
      moduleListReloadWatch(n, o) {
        this.getModuleList(this.currentProject.id);
      },
      curEndpoint:function(n,o){
        // this.chartOptions.title.text=n.host+ " tsg disk"
      }
    }
  }
</script>

<style scoped  lang="scss">
  .project {
    height: 100%;
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
  .top-tools .top-tool-btn-txt .nz-icon{
    display: inline-block;
    font-size: 12px;
    margin-right:6px;
  }
  /* start--param*/
  .param-btn {
    float: right;
    height: 27px;
    margin-top: -3px;
  }
  .param-btn-active {
    background-color: #656565;
    color: white;
    border: 1px solid #656565;
  }
  .param-btn-active:hover, .param-btn-active:focus {
    background-color: #656565;
    color: white;
  }
  .param-btn-clear {
    background-color: #D4D4D4;
    border: 1px solid #D4D4D4;
    color: white;
  }
  .param-btn-clear:hover, .param-btn-clear:focus {
    background-color: #D4D4D4;
    color: white;
  }

  .param-box {
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    padding: 0 10px;
  }
  .param-box-endpoint {
    height: 325px;
  }
  .param-box-module {
    height: 227px;
  }
  .param-box-row {
    padding: 7px 0 0 0;
    position: relative;
  }
  .param-box-row:last-of-type {
    padding-bottom: 7px;
  }
  .param-box-row-key, .param-box-row-value {
    display: inline-block;
    width: 41.5%;
  }
  .param-box-row-eq {
    display: inline-block;
    width: 22px;
    text-align: center;
    height: 32px;
    line-height: 32px;
    color: #c4c7cF;
  }
  .param-box-row-symbol {
    font-size: 12px;
    color: #c4c7cF;
    border: 1px solid #c4c7cF;
    text-align: center;
    height: 12px;
    width: 14px;
    display: inline-block;
    position: absolute;
    top: 17px;
    right: 25px;
    cursor: pointer;
  }
  .param-box-row-symbol>i {
    position: absolute;
    top: 1px;
    right: 1px;
  }
  /* end--param*/

  /* begin--子弹框*/
  .right-sub-box {
    width: 380px;
    height: 520px;
    position: absolute;
    top: 380px;
    right: 100px;
    z-index: 2;
    padding: 0 10px;
  }
  .right-sub-box .el-input-group {
    width: 227px;
    float: right;
    margin: 7px 0 0 0;
  }
  /* begin--搜索框*/
  .endpoint-asset-prepend {
    border-radius: 4px 0 0 4px;
  }
  .endpoint-asset-label {
    line-height: 26px;
    height: 26px;
  }
  .endpoint-asset-dropdown {
    position: absolute;
    top: 27px;
    background-color: #656565;
    border-radius: 4px;
    width: 52px;
    left: 0;
  }
  .endpoint-asset-dropdown-item {
    text-align: center;
    line-height: 22px;
    height: 22px;
    cursor: default;
  }
  .endpoint-asset-label-txt {
    display: inline-block;
    width: 19px;
    text-align: center;
  }
  .endpoint-asset-dropdown-item:first-of-type {
    border-radius: 4px 4px 0 0;
  }
  .endpoint-asset-dropdown-item:last-of-type {
    border-radius: 0 0 4px 4px;
  }
  .endpoint-asset-dropdown-item:hover {
    background-color: #3a8ee6;
  }
  /* end--搜索框*/
  /* begin--table*/
  .endpoint-sub-table {
    margin-top: 25px;
  }
  .line-100 {
    margin-bottom: 3px;
  }
  .endpoint-sub-table-head {
    line-height: 28px;
    height: 30px;
  }
  .endpoint-sub-table-row {
    line-height: 28px;
    height: 30px;
    color: #656565;
  }
  .endpoint-sub-table-row-active {
    background-color: #dadada;
  }
  .endpoint-sub-table-col {
    display: inline-block;
    width: 45%;
    padding-left: 10px;
  }
  .endpoint-sub-table-paginate-all {
    position: absolute;
    left: 10px;
    bottom: 17px;
    color: #5a5a5a;
  }
  .endpoint-sub-table-body {
    font-size: 15px;
  }
  /* end--table*/

  /* end--子弹框*/
</style>
<style>
  /* begin--覆盖分页组件样式*/
  .right-sub-box .el-pagination.is-background .btn-next, .right-sub-box .el-pagination.is-background .btn-prev, .right-sub-box .el-pagination.is-background .el-pager li {
    margin: 0 3px;
    min-width: 25px;
  }
  .right-sub-box .el-pagination button, .right-sub-box .el-pagination span:not([class*=suffix]) {
    margin: 0 3px;
    height: 25px;
    line-height: 25px;
  }
  .right-sub-box .el-pager li {
    height: 25px;
    line-height: 25px;
  }
  .right-sub-box .el-pagination.is-background .el-pager li:not(.disabled).active {
    background-color: #656565;
    border: 1px solid #656565;
  }
  .right-sub-box .el-pagination.is-background .btn-next, .right-sub-box .el-pagination.is-background .btn-prev, .right-sub-box .el-pagination.is-background .el-pager li {
    background-color: white;
  }
  .right-sub-box .el-pagination button, .right-sub-box .el-pager li {
    border: 1px solid #DADADA;
  }
  .right-sub-box .el-pager li.active+li {
    border: 1px solid #DADADA;
  }
  .right-sub-box .el-pagination.is-background .el-pager li:not(.disabled):hover {
    color: black;
  }
  .right-sub-box .el-pagination.is-background .el-pager li.active:hover {
    color: white;
  }
  .endpoint-sub-table-paginate .el-pagination {
    position: absolute;
    right: 10px;
    bottom: 13px;
  }
  .el-input-group__append>i {
    cursor: pointer;
  }
  .el-table .disabledCheck .cell .el-checkbox__inner{
    display: none !important;
  }

  .el-table .disabledCheck .cell::before{
    content: '';
    text-align: center;
    line-height: 37px;
  }
  /* end--覆盖分页组件样式*/
</style>
