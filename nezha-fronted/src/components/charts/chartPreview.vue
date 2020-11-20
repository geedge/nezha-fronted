<style scoped>
    .chart-preview-dialog{
    }
    .nz-preview-picker{
    }
    .v-modal{
    }
    .hidden{
      visibility: hidden;
    }
    .visible{
      visibility: visible;
    }
    .chart-title {
      display: flex;
      justify-content: space-between;
    }
    .chart-title-text{
      max-width:calc(100% - 20px);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
</style>
<style>
  .char-url-preview html{

  }
  #chartPreviewDailog .el-dialog__body {
    padding-bottom:20px !important;
  }

  #chartPreviewDailog .el-dialog__header{
    padding: 20px 20px 0px !important;
  }


</style>
<template>
    <el-dialog class="chart-preview-dialog nz-dialog" id="chartPreviewDailog"
               :visible.sync="screenModal"
               :width="dailogWidth"
               :modal-append-to-body='false'
               @close="handleClose"
               @opened="initDialog">
      <el-popover
        v-if="isError"
        placement="top-start"
        :close-delay=10
        trigger="hover"
        popper-class="chart-error-popper">
        <div >{{errorContent}}</div>
        <span slot="reference"  class="panel-info-corner panel-info-corner--error">
              <i class="nz-icon nz-icon-warning fa-model" ></i>
              <span class="panel-info-corner-inner"></span>
          </span>
      </el-popover>
      <div slot="title" class="chart-title">
        <span class="nz-dialog-title chart-title-text">{{chart.title}}</span>
        <div class="float-right panel-calendar dialog-tool"  v-if="chart.type!=='url' && chart.type !=='alertList'">

          <time-picker ref="calendarPanel" class="nz-dashboard-picker" style="margin-top: -12px;" @change="dateChange" v-if="chart.type !='text'"></time-picker>
          <!--
          <el-date-picker ref="calendar" prefix-icon=" " size="mini" class="nz-preview-picker"
                          format="yyyy/MM/dd HH:mm"
                          @change="dateChange"
                          v-model="searchTime"
                          type="datetimerange"
                          :picker-options="pickerOptions"
                          :range-separator="$t('dashboard.panel.to')"
                          :start-placeholder="$t('dashboard.panel.startTime')"
                          :end-placeholder="$t('dashboard.panel.endTime')"
                          align="right">
          </el-date-picker>-->
        </div>
      </div>

      <template v-if="chart.type==='line'||chart.type==='bar'||chart.type==='stackArea' || chart.type == 'endpointInfo'">
        <div id="chartEchartPreview" @mouseenter="mouseEnterFullChart" @mouseleave="mouseLeaveFullChart">
          <div class="line-area" ref="screenShowArea"  id="screenShowArea" style="margin-top:0px;"></div>
          <div class="chart-no-data" v-show="noData">No Data</div>

          <template v-if="!hasLegendOptions">
            <div class="legend-container legend-container-screen" ref="screenLegendArea"  @mouseenter="mouseEnterFullChart" @mouseleave="mouseLeaveFullChart" v-show="showLegend" v-scrollBar:legend>
              <div v-for="(item, index) in screenLegendList" :title="item.alias?item.alias:item.name"  @click="clickScreenLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGreyScreen[index]}"  :key="'legend_' + item.name+'_'+index">
                <span class="legend-shape" :style="{background:(isGreyScreen[index]?'#D3D3D3':item.color)}"></span>{{item.alias?item.alias:item.name}}
                <br/><!--bgColorList[index]-->
              </div>
            </div>
          </template>
          <template v-else>
            <div class="legend-container legend-container-screen" ref="screenLegendArea" @mouseenter="mouseEnterFullChart" @mouseleave="mouseLeaveFullChart" v-show="showLegend" v-scrollBar:legend>
              <table style="width: 100%" border="0" cellpadding="0" cellspacing="0">
                <th style="width: 100%"></th>
                <template v-for="legendOption in screenLegendOptions">
                  <th v-if="legendOption.value == 'on'" class="option-th legend-option-cell" >
                    <span @click="legendValueSort(legendOption,screenLegendList,screenLegendOptions)">{{legendOption.option}}</span>
                    <span ><i style="font-size: 12px !important;" :class="{'nz-icon nz-icon-arrow-down':legendOption.sort =='asc','nz-icon nz-icon-arrow-up':legendOption.sort=='desc'}" ></i></span>
                  </th>
                </template>
                <tbody>
                <tr  v-for="(item, index) in screenLegendList" :key="'legend_' + item.name+'_'+index">
                  <td>
                    <div :title="item.alias?item.alias:item.name"  @click="clickScreenLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGreyScreen[index]}" >
                      <span class="legend-shape" :style="{background:(isGreyScreen[index]?'#D3D3D3':item.color)}"></span>{{item.alias?item.alias:item.name}}
                    </div>
                  </td>
                  <template v-for="legendOption in screenLegendOptions">
                    <td v-if="legendOption.value == 'on'" class="legend-option-cell">{{formatLegendData(item[legendOption.option])}}</td>
                  </template>
                </tr>
                </tbody>
              </table>
            </div>
          </template>

        </div>
      </template>

      <template v-if="chart.type==='singleStat'">
        <div id="chartSingleStatPreview" @mouseenter="mouseEnterFullChart" @mouseleave="mouseLeaveFullChart"
         style=" height:100%;display:table;text-align:center;width:calc(100% - 16px);color:#000;" >
          <div class="line-area" ref="singleStatArea"  id="singleStatArea"  style="margin-top:0px; text-align:center;
      vertical-align: middle;
      display:table-cell;
      font-size:30px;">
            {{serieSingleStat}}
            <div class="chart-no-data" v-show="noData">No Data</div>
          </div>
        </div>
      </template>

      <template  v-if="chart.type==='table'">
        <div id="chartTablePreview" :class="{'visible':tableShow,'hidden':!tableShow}" >
        <el-table id="tableContainer" style="margin-top: 10px;" class="nz-table" height="95%" :data="seriesItemScreen" border  tooltip-effect="light" v-scrollBar:el-table >
          <!--                    <el-table-column sortable :show-overflow-tooltip="true" prop="metric" :label="$t('dashboard.panel.chartTableColumn.metric')" ></el-table-column>-->
          <!--                    <el-table-column sortable :show-overflow-tooltip="true" prop="label" :label="$t('dashboard.panel.chartTableColumn.label')" ></el-table-column>-->
          <el-table-column sortable prop="time" :label="$t('dashboard.panel.chartTableColumn.time')" width="145" ></el-table-column>
          <el-table-column sortable prop="element" :show-overflow-tooltip="true" :label="$t('dashboard.panel.chartTableColumn.element')" >
            <template slot-scope="scope">
              {{ scope.row.element.alias?scope.row.element.alias:scope.row.element.element}}
            </template>
          </el-table-column>
          <el-table-column sortable prop="value" :label="$t('dashboard.panel.chartTableColumn.value')" width="90">
            <template slot-scope="scope">
              {{scope.row.value}}
            </template>
          </el-table-column>
        </el-table>
        <Pagination :pageObj="screenPageObj" :post-page-sizes="pageSizes" @pageNo='screenPageNo' @pageSize='screenPageSize' ref="Pagination" ></Pagination>
        </div>
      </template>

      <template  v-if="chart.type==='url'">
        <div id="chartUrlPreview" :class="{'visible':urlShow,'hidden':!urlShow}" class="char-url-preview">
          <iframe id="chartUrlFrame" frameborder="0" width="100%" height="100%" name="showHere" scrolling=auto
                  style="z-index:5000;"
          ></iframe><!--  style=" position: absolute; width: 100%; height: 100%; top: 0;left:0;"  :src="chart.url" v-scrollBar:char-url-preview-->
        </div>
      </template>

      <chart-alert-list v-if="chart.type === 'alertList'" ref="alertListChart" id="chartAlertListPreview" :chart-info="chart"></chart-alert-list>

      <template v-if="chart.type==='text'">
          <div  id="chartTextPreview" class="chart-text-preview">
            <el-scrollbar style="height: 100%;" class="el-scrollbar-normal">
              <div style="height: 100%;" v-html="chart.param.text" ></div>
            </el-scrollbar>
          </div>
      </template>

      <loading  ref="loadingPreview"></loading>
    </el-dialog>
</template>
<script>
  import axios from 'axios';
  import echarts from 'echarts';
  import bus from '../../libs/bus';
  import loading from "../common/loading";
  import chartDataFormat from './chartDataFormat'
  import {randomcolor} from  '../common/js/radomcolor/randomcolor.js'
  import timePicker from '../common/timePicker'
  import chartAlertList from './chart-alert-list'
  import chartConfig from "../page/dashboard/overview/chartConfig";
  import textChart from './text-chart'
  export default {
    name: 'chartPreview',
    components: {
      'loading': loading,
      'time-picker':timePicker,
      'chart-alert-list':chartAlertList,
      'text-chart':textChart
    },
    props: {
      panelId:Number,
    },
    data() {
      return {
        chart:{},
        noData:false,
        //data: {}, // 该图表信息,chartItem
        dailogWidth:'80%',
        //seriesItem: [], // 保存信息
        isError:false,
        errorContent:'',
        serieSingleStat:'',
        seriesItemScreen:[],
        pageSizes:[50,100,200],
        screenPageObj:{
          pageNo: 1,
          pageSize: 50,
          total: 0
        },
        unit:{},
        //images: '',
        //toolbox: false,
        items: {
          metric_name: [], // 每条数据列名称
          xAxis: [],
          theData: [], // series数据组
        },
        isStackArea:false,
        echartModalStore: null, // 全屏查看时数据
        chartType: 'line', // 图表类型
        screenModal: false,
        // 查询数据使用
        stableFilter: {}, // 保存数据使用,初始化起止时间,单图or多图等
        legend:[],
        legendList:[],
        screenLegendList:[],
        isGrey:[],
        isGreyScreen:[],
        bgColorList: ['#7bbfea', '#b3424a', '#f05b72', '#596032', '#bd6758',
          '#cd9a5b', '#918597', '#70a19f', '#005344', '#FF00FF',
          '#f7acbc', '#5f5d46', '#66ffff', '#ccFF66', '#f47920',
          '#769149', '#1d953f', '#abc88b', '#7f7522', '#9b95c9',
          '#f3715c', '#ea66a6', '#d1c7b7', '#9d9087', '#77787b',
          '#f58220', '#c37e00', '#00ae9d', '#f26522', '#76becc',
          '#76624c', '#d71345', '#2468a2', '#ca8687', '#1b315e',
        ],
        //firstShow: false, // 默认不显示操作按钮,
        //dropdownMenuShow:false,
        showLegend:true,
        tableShow:true,
        urlShow:true,
        searchTime: bus.getTimezontDateRange(),
        //oldSearchTime:[],
        minHeight:200,
        chartSpaceHeight:5,//top-border: 1,bottom-border: 1,padding-bottome:3
        titleHeight:58,
        legendHeight:80,
        pageHeight:40,
        hasLegendOptions:false,
        screenLegendOptions:[],
      };
    },
    computed: {
    },
    watch: {},
    methods: {
      // 全屏查看
      show(chartInfo) {
        this.isError = false;
        this.searchTime = bus.getTimezontDateRange();
        this.chart = JSON.parse(JSON.stringify(chartInfo));

        let chartType= chartInfo.type;
        let chartContainerId = 'chartEchartPreview';
        if(chartType==='table'){
          this.tableShow = false;
          chartContainerId = 'chartTablePreview';
        }else if (chartType === 'line' || chartType === 'bar' || chartType === 'stackArea' || chartType === 4) {
          this.isGreyScreen=[];
          this.showLegend = false;
          chartContainerId = 'chartEchartPreview';
        }else if(chartType==='url'){
          this.urlShow = false;
          chartContainerId = 'chartUrlPreview';
        }else if (chartType === 'singleStat') {
          chartContainerId = 'chartSingleStatPreview';
        }else if(chartType === 'alertList'){
          chartContainerId = 'chartAlertListPreview';
        }else if(chartType == 'text'){
          chartContainerId = 'chartTextPreview'
        }

        //设置高度 chart-table
        this.$nextTick(() => {
          //const chartBox = document.getElementById('chartPreviewDailog');
          //let height = this.chart.height;
          let height = Math.round(this.chart.height/10)*10
          if(height<this.minHeight){
            height = this.minHeight;
          }

          let dailogBox = document.querySelector("#chartPreviewDailog  .el-dialog");
          dailogBox.style.height = `${height}px`;

          const addChartBox = document.querySelector('.right-box-add-chart');
          //addChartBox.style.cssText =  'z-index:1500 !important';
          if(chartType==='table'){
            const chartDiv = document.getElementById(chartContainerId);
            chartDiv.style.height = `${height-this.chartSpaceHeight-this.titleHeight-25}px`;
            const tableBox = document.getElementById('tableContainer');
            tableBox.style.height = `${height-this.titleHeight-this.pageHeight-25}px`;//-75-32+25
          }else{
            const chartDiv = document.getElementById(chartContainerId);
            chartDiv.style.height = `${height-this.chartSpaceHeight-this.titleHeight-15}px`;
          }
        });

        this.screenModal = true;

      },
      setLoadFrame(){
        if(this.chart.type==='url'){
          let that = this;
          this.$nextTick(() => {
            let iframeBox = document.querySelector('#chartUrlPreview');
            let iframe = document.querySelector('#chartUrlFrame');

            // 处理兼容行问题
            if (iframe.attachEvent) {
              iframe.attachEvent('onload', function () {
                // iframe加载完毕以后执行操作
                that.$refs.loadingPreview.endLoading();
              })
            } else {
              iframe.onload = function () {
                // iframe加载完毕以后执行操作
                that.$refs.loadingPreview.endLoading();
              }
            }
            iframe.src = this.chart.param.url;
          });
        }
      },
      filterShowData(source,pageObj){
        return source.slice((pageObj.pageNo-1)*pageObj.pageSize,pageObj.pageNo*pageObj.pageSize)
      },
      initDialog(){
        //此时初始化，才能获得screenShowArea对象，否则此对象为undefined，无法初始化图表
        let chartType= this.chart.type;
        if(chartType==='table'){

        }else if (chartType === 'line' || chartType === 'bar' || chartType === 'stackArea' || chartType === 4 || chartType == "endpointInfo") {
          if(this.echartModalStore){
            this.echartModalStore.clear();
          }
        }else if(chartType==='url'){

        }
        //后台获得数据
        if(this.chart.type!=='url'&&this.chart.type !=='text'){
          this.$refs.loadingPreview.startLoading();
          this.getChartData();
        }else if(this.chart.type == 'url'){
          this.$refs.loadingPreview.startLoading();
          this.urlShow = true;
          this.setLoadFrame();
        }
      },
      getAlertListChartData:function(chartInfo,filterType){
        this.$refs.alertListChart.getAlertList(filterType,true,this.chart);
        this.$refs.loadingPreview.endLoading();
      },
      // 获取一个图表具体数据
      getChartData() {
        const chartItem = this.chart;
        if(chartItem.type === 'alertList'){
          this.getAlertListChartData(chartItem,null);
          return;
        }
        const len = chartItem.elements.length;
        // 没有数据的设置提示信息暂无数据-针对每一个图
        if (len === 0) {
          this.noData=true;
          this.$nextTick(() => {
            if (chartItem.type === 'table') {//表格
              this.setTableData([]);
            } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 'stackArea' || chartItem.type === 4 || chartItem.type === "endpointInfo") {
              this.setData(chartItem, [], []);
            }else if(chartItem.type ==='singleStat'){
              this.serieSingleStat = "";
              this.$refs.loadingPreview.endLoading();
            }
          });
        } else {
          let startTime = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss');
          let endTime = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss');
          if(!startTime || !endTime){//如果时间为空，则默认取最近1小时
            let now = new Date(bus.computeTimezone(new Date().getTime()));
            startTime = bus.timeFormate(now, 'yyyy-MM-dd hh:mm:ss');
            endTime = bus.timeFormate(now.setHours(now.getHours()-1), 'yyyy-MM-dd hh:mm:ss');
            this.searchTime[0] = startTime;
            this.searchTime[1] = endTime;
          }
          let step = bus.getStep(startTime,endTime);
          this.$nextTick(() => {
            const axiosArr = chartItem.elements.map((ele) => {
              const filterItem = ele;
              let query = encodeURIComponent(filterItem.expression);
              return  this.$get('/prom/api/v1/query_range?query='+query+"&start="+this.$stringTimeParseToUnix(startTime)+"&end="+this.$stringTimeParseToUnix(endTime)+'&step='+step);
            });
            // 一个图表的所有element单独获取数据
            axios.all(axiosArr).then((res) => {
              if (res.length > 0) {
                const series = [];
                let singleStatRlt = '';
                const legend = [];
                const tableData = [];
                const sumData = {
                  name: 'sum',
                  data: [],
                  visible: true,
                  threshold: null,
                };
                res.forEach((response, innerPos) => {
                  if (response.status === 'success') {
                    this.isError = false;
                    this.errorContent = "";
                    if (response.data.result) {
                      if(chartItem.type==='singleStat'){
                        if(response.data.result.length===1){
                          let statistics = chartItem.param.statistics;
                          if(response.data.result[0].values){
                            singleStatRlt  = bus.getSingleStatRlt(statistics,response.data.result[0].values);
                            this.noData=false
                          }else{
                            this.noData=true;
                          }
                        }else if(response.data.result.length > 1){
                          this.noData=true;
                          singleStatRlt = this.$t("dashboard.panel.singleStatErrorTip");
                        }
                      }else {
                        // 循环处理每个elements下获取的数据列
                        response.data.result.forEach((queryItem, resInnerPos) => {
                          const seriesItem = {
                            theData: {
                              name: '',
                              symbol: 'emptyCircle',  //去掉点
                              symbolSize: [2, 2],
                              smooth: 0.2,  //曲线变平滑
                              showSymbol: false,
                              data: [],
                              type: chartItem.type,
                              lineStyle: {
                                width: 1,
                                opacity: 0.9
                              },
                            },
                            metric_name: '',
                          };
                          if (chartItem.type === 'stackArea') {
                            seriesItem.theData.type = 'line';
                            seriesItem.theData.stack = chartItem.title;
                            seriesItem.theData.areaStyle = {"opacity": 0.3};
                          }
                          if (chartItem.type === "endpointInfo") {
                            seriesItem.theData.type = 'line';
                          }
                          // 图表中每条线的名字,后半部分
                          let host = '';//up,
                          if (queryItem.metric.__name__) {
                            host = `${queryItem.metric.__name__}{`;//up,
                          }
                          const tagsArr = Object.keys(queryItem.metric);//["__name__","asset","idc","instance","job","module","project"]
                          // 设置时间-数据格式对
                          const dpsArr = Object.entries(queryItem.values);//[ ["0",[1577959830.781,"0"]], ["1",[1577959845.781,"0"]] ]
                          // 判断是否有数据, && tagsArr.length > 0
                          if (dpsArr.length > 0) {
                            tagsArr.forEach((tag, i) => {
                              if (tag !== '__name__') {
                                host += `${tag}="${queryItem.metric[tag]}",`;
                              }
                            });
                            if (host.endsWith(',')) {
                              host = host.substr(0, host.length - 1);
                            }
                            if (queryItem.metric.__name__) {
                              host += "}";
                            }
                            if (!host || host === '') {
                              host = chartItem.elements[innerPos].expression;
                            }
                            //处理legend别名
                            let alias = this.dealLegendAlias(host, chartItem.elements[innerPos].legend);
                            if (!alias || alias === '') {
                              alias = host;
                            }
                            legend.push({name: host + resInnerPos, alias: alias});
                            // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c
                            seriesItem.theData.name = host + resInnerPos;
                            seriesItem.metric_name = seriesItem.theData.name;
                            // 将秒改为毫秒
                            //alert('table=='+JSON.stringify(queryItem))
                            seriesItem.theData.data = queryItem.values.map((dpsItem, dpsIndex) => {
                              let t_date = new Date(dpsItem[0] * 1000);
                              let timeTmp = bus.timeFormate(t_date, 'yyyy-MM-dd hh:mm:ss');
                              tableData.push({//表格数据
                                // label: host.slice(host.indexOf('{') + 1,host.indexOf('}')),//label
                                // metric: queryItem.metric.__name__?queryItem.metric.__name__:'',//metric列
                                element: {element: host, alias: alias},
                                time: timeTmp,//采集时间
                                value: dpsItem[1],//数值
                              });
                              return [dpsItem[0] * 1000, dpsItem[1]];
                            });
                            series.push(seriesItem.theData);

                          } else if (chartItem.elements && chartItem.elements[innerPos]) {
                            // 无数据提示
                            /*
                            const currentInfo = chartItem.elements[innerPos];
                            const errorMsg = `图表 ${chartItem.title} 中 ${currentInfo.metric},${currentInfo.tags} 无数据`;
                            this.$message.warning({
                              duration: 15,
                              content: errorMsg,
                              closable: true,
                            });
                            */
                          }
                        });
                    }
                    }
                  }else{
                    this.isError = true;
                    if(response.msg){
                      this.errorContent = response.msg;
                    }else if(response.error){
                      this.errorContent = response.error;
                    }else {
                      this.errorContent = response;
                    }
                  }
                });
                //if(this.$refs.editChart&&this.$refs.editChart[index]) {
                  if (chartItem.type === 'table') {//表格
                      this.setTableData(tableData);
                  } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 'stackArea' || chartItem.type === 4 || chartItem.from == "endpoint") {
                    if (series.length && chartItem.type === 4) {//曲线汇总
                    }
                    if(series.length<1){
                      this.noData=true;
                    }else{
                      this.noData=false;
                    }
                    let _chartItem = JSON.parse(JSON.stringify(chartItem));
                    if (chartItem.from == "endpoint") {
                      _chartItem.type = "line";
                    }
                    this.setData(_chartItem, series, legend);
                  }else if(chartItem.type ==='singleStat'){
                    if(Number(singleStatRlt)){
                      let singleStatTmp =parseFloat(Number(singleStatRlt).toFixed(2));
                      if(chartItem.param.valueMapping && chartItem.param.valueMapping.type){
                        let type=chartItem.param.valueMapping.type;
                        let mappings=chartItem.param.valueMapping.mapping?chartItem.param.valueMapping.mapping:[];
                        let mapping;
                        if(type == 'value'){
                          mapping=mappings.find(item=>{return item.value == singleStatTmp})
                        }else{
                          mapping=mappings.find(item=>{return item.from <= singleStatTmp&& item.to >= singleStatTmp});
                        }
                        this.serieSingleStat = mapping?mapping.text:chartDataFormat.getUnit(chartItem.unit?chartItem.unit:2).compute(singleStatTmp,null,2);
                      }else{
                        this.serieSingleStat = chartDataFormat.getUnit(chartItem.unit?chartItem.unit:2).compute(singleStatTmp,null,2);
                      }
                    }else {
                      this.serieSingleStat =singleStatRlt;
                    }
                    this.$refs.loadingPreview.endLoading();
                  }
                //}
              } else {
                const type = chartItem.type;
                //if(this.$refs.editChart[index]) {
                  if (type === 'table') {
                      this.setTableData([]);
                  } else if (type === 'line' || type === 'bar' || type === 'stackArea' || type === 4) {
                      this.setData(chartItem, []);
                  }else if(chartItem.type ==='singleStat'){
                    this.serieSingleStat = "";
                    this.$refs.loadingPreview.endLoading();
                  }
                //}
              }
            }).catch((error) => {
              if (error) {
                this.$message.error(error.toString());
                console.error(error)
              }
            });
          });
        }
      },
      clickScreenLegend(legendName,index){
        //点击图表某一个legend，图表只显示当前点击的曲线或柱状图，其它隐藏，再次点击已选中的legend ，显示全部
        let curIsGrey=this.isGreyScreen[index];
        if(this.echartModalStore){
          this.screenLegendList.forEach((item,i)=>{
            let isGrey = this.isGreyScreen[i];
            if(index != i){
              if(!curIsGrey && !isGrey){
                this.echartModalStore.dispatchAction({
                  type: 'legendUnSelect',
                  name: item.name
                });
              }else if(!curIsGrey && isGrey){
                this.echartModalStore.dispatchAction({
                  type: 'legendSelect',
                  name: item.name
                });
              }else{
                this.echartModalStore.dispatchAction({
                  type: 'legendUnSelect',
                  name: item.name
                });
              }
            }else {
              this.echartModalStore.dispatchAction({
                type: 'legendSelect',
                name: item.name
              });
            }
          });
          this.isGreyScreen.forEach((item,i)=>{
            if(index != i){
              if(!curIsGrey && !item){
                this.$set(this.isGreyScreen, i, true);
              }else if(!curIsGrey && item){
                this.$set(this.isGreyScreen, i, false);
              }else{
                this.$set(this.isGreyScreen, i, true);
              }
            }else{
              if(item === true){
                this.$set(this.isGreyScreen, i, false);
              }
            }
          })
        }
      },
      formatLegend(chartWidth,name){
        if(!name){
          return '';
        }
        //计算宽度
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
      // chartSite用于区分是全屏显示还是局部显示
      initChart(chartInfo, dataArg, ele,legend) {
        const self = this;
        let minTime = null;
        let maxTime = null
        if(dataArg.length>0 && dataArg[0].data
          && dataArg[0].data.length>0 && dataArg[0].data[0].length>0){
          let len = dataArg[0].data.length-1;
          minTime = dataArg[0].data[0][0];
          maxTime = dataArg[0].data[len][0];
          //console.log('time==========',minTime,maxTime)
        }
        this.chartType = ''; // 图表类型
        if ( chartInfo.type === 4) {//line,bar
          this.chartType = 'line';
        }
        this.echartModalStore = echarts.init(ele);

        var chartWidth = ele.clientWidth;
        var title = {
          show:false,
          text: chartInfo.title || null,
          textAlign: 'left',
          useHTML: true,
          textStyle: {
            width: '60%',
            fontStyle:'normal',
            fontWeight:'bold',
            color: "#333",

          }
        };
        let stackIconBorderColor = (chartInfo.type==='stackArea'?'#53a3cb':'#7e7e7e');
        let stackIconChooseBorderColor = (chartInfo.type==='stackArea'?'#7e7e7e':'#53a3cb');
        var option = {
          title:{
            show:false,
          },
          color: this.bgColorList,
          toolbox:{
            show:false,
            top:'0',
            showTitle:false,
            feature:{
              dataZoom:{
                yAxisIndex:false
              },
              magicType:{
                type:['stack'],
                iconStyle:{
                  borderColor:stackIconBorderColor,
                },
                emphasis:{
                  borderColor:stackIconChooseBorderColor,
                }
              }
            }
          },
          tooltip: {
            trigger: 'axis',
            confine:false,
            backgroundColor:'rgba(221,228,237,1)',
            textStyle:{
              color:'#000'
            },
            extraCssText:'z-index:1000;',
            /*enterable:true, 导致tooltip不消失，显示多个tooltip*/
            position:function(point,params,dom,rect,size){
              dom.style.transform = "translateZ(0)";
              //提示框位置
              var x=0;
              var y=0;
              //当前鼠标位置
              var pointX = point[0];
              var pointY = point[1];
              //外层div大小
              var viewWidth = size.viewSize[0];
              var viewHeight = size.viewSize[1];
              //提示框大小
              var boxWidth = size.contentSize[0];
              var boxHeight = size.contentSize[1];
              if(pointX<(viewWidth/2)){//说明鼠标在左边放不下提示框
                x=pointX+10;
              }else{
                x = pointX - boxWidth;
              }
              if(pointY<(viewHeight/2)){//说明鼠标上面放不下提示框
                y = pointY+10;
              }else {
                y = pointY-boxHeight;
              }
              return [x,y];
            },
            formatter:function(params){
              //display:inline-block;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;
              let str = `<div>`;
              let sum = 0;
              //let str = `<div  style='white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;min-width:150px;max-width:600px;display:inline-block;line-height: 18px;font-size:12px;font-family: Roboto,Helvetica Neue,Arial,sans-serif;'>`;
              params.forEach((item, i) => {
                //let tip=legend.find((element)=>{
                  //return element.name == item.seriesName;
                //});
                let tip=legend[item.seriesIndex];
                let color = self.bgColorList[item.seriesIndex];
                if(i===0){
                  let t_date = new Date(item.data[0]);
                  str += [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('-') + " "
                    + [t_date.getHours(), t_date.getMinutes(),t_date.getSeconds()].join(':');
                  str +=`<br/>`;
                }
                let val = parseFloat(Number(item.data[1]).toFixed(2));
                if(val===0){
                  val = Number(item.data[1]).toExponential(2);
                }
                sum +=val;
                str += `<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${color};}'></span>${tip?(tip.alias?tip.alias:tip.name):item.seriesName}  </div>`;
                str += `<div style="padding-left: 10px;">`;
                str += function(){
                  if (chartInfo.from == 'endpoint') {
                    return val == 1 ? "up" : "down";
                  }
                  return chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(val,null,2);
                }();
                str += `</div>`;
                str += `</div>`;

              });
              if(chartInfo.type==='stackArea' || self.isStackArea){
                sum = parseFloat(Number(sum).toFixed(2));
                str +=`<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                str +=`<div style="line-height: 18px; font-size: 12px;padding-left:20px;">`
                str +=self.$t("dashboard.panel.chartTotal");
                str +=`</div>`;
                str +=`<div style="padding-left: 10px;">`;
                str +=chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(sum,null,2);
                str +=`</div>`;
                str += `</div>`;
              }
              str +=`</div>`;
              return str;
              },
          },
          legend: {
            show:false,
          },
          grid: {
            top: 30,
            left: 0,
            right: 30,
            containLabel: true,
            bottom: 8,//156
          },
          xAxis: {
            type: 'time',
            // boundaryGap: false,//line-false; bar-true;
            //data: ['20190101', '20190102', '周三', '周四', '周五', '周六', '周日']
            axisLabel: {
              interval: 0,
              rotate: 0,
              formatter: function (value) {
                value = bus.computeTimezone(value);
                let t_date = new Date(value);
                let hour = t_date.getHours();
                hour=hour>9?hour:"0"+hour; //加0补充为两位数字
                let minute = t_date.getMinutes();
                minute=minute>9?minute:"0"+minute; //如果分钟小于10,则在前面加0补充为两位数字
                if(minTime!==null && maxTime!==null){
                  let diffSec = (maxTime-minTime)/1000;
                  let secOneDay = 24*60*60;//1天的秒数
                  let secOneMonth = secOneDay*30;//30天的秒数
                  if(diffSec<=secOneDay) {//同一天
                    return [hour,minute ].join(':');
                  }else if(diffSec<secOneMonth){//大于1天，小于30天
                    return [t_date.getMonth() + 1, t_date.getDate()].join('/') +" "+  [hour, minute].join(':');
                  }else {//大于等于30天
                    return [t_date.getMonth() + 1, t_date.getDate()].join('/');
                  }
                }else {
                  return [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('/') + "\n"
                    + [hour, minute].join(':');
                }
              }
            },
            axisPointer: {//y轴上显示指针对应的值
              show: true,
            },
            splitLine:{
              show:true
            }
          },
          yAxis: {
            type: 'value',
            minInterval: 1,
            splitLine:{
              show:true
            },
            //去掉y轴--start
            axisLine:{
              show:false
            },
            axisTick: {
              show: false,
            },
            //去掉y轴--end
            axisLabel: {
              formatter: function(value,index){
                if (self.chart.from == 'endpoint') {
                  if (value == 1) {
                    return "up";
                  } else {
                    return "down";
                  }
                }
                let chartUnit=chartInfo.unit;
                chartUnit=chartUnit?chartUnit:2;
                let unit=chartDataFormat.getUnit(chartUnit);
                return unit.compute(value,index);
              },
            },
            //boundaryGap:[0,0.2]
          },
          useUTC: false,//使用本地时间
          series: dataArg
        };
        if(this.echartModalStore){
          this.echartModalStore.clear();
        }
        option.title = {};
        //this.echartModalStore.setOption(option);//显示全屏界面
        this.showLegend = true;
        if(legend){
          this.screenLegendList = [];
          legend.forEach((item, i) => {
            let _legend = {
              name:item.name,
              alias:item.alias,
              color:item.color,
              showText:this.formatLegend(chartWidth,item.alias?item.alias:item.name)
            };
            this.screenLegendList.push(_legend);
            this.isGreyScreen.push(false);
          });
        }
        if(this.hasLegendOptions){
          this.computeLegendData(this.screenLegendList,dataArg,'screen');
        }
        this.$nextTick(() => {
          let divHeight = this.$refs.screenLegendArea.offsetHeight;
          this.echartModalStore.resize({height:(chartInfo.height-this.chartSpaceHeight-divHeight-this.titleHeight)});
          this.echartModalStore.clear();
          if(dataArg.length<1){
            this.echartModalStore.setOption(chartConfig.getOption('noData'))
          }else{
            this.echartModalStore.setOption(option);//创建图表
          }

          this.$refs.loadingPreview.endLoading();
        });
        this.echartModalStore.on('magictypechanged', function (params) {
          self.isStackArea = !self.isStackArea;
          if(self.isStackArea){
            this.setOption({
              toolbox:{
                feature:{
                  magicType:{
                    iconStyle:{
                      borderColor:'#7e7e7e',
                    },
                  },
                }
              },
              tooltip: {
                formatter:function(params){
                  let str = `<div>`;let sum = 0;
                  params.forEach((item, i) => {let tip=legend[item.seriesIndex];
                    let color = self.bgColorList[item.seriesIndex];
                    if(i===0){
                      let value=bus.computeTimezone(item.data[0]);
                      let t_date = new Date(value);
                      str += [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('-') + " "
                        + [t_date.getHours(), t_date.getMinutes(),t_date.getSeconds()].join(':');
                      str +=`<br/>`;
                    }
                    let val = parseFloat(Number(item.data[1]).toFixed(2));
                    if(val===0){
                      val = Number(item.data[1]).toExponential(2);
                    }
                    sum +=val;
                    str += `<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                    str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${color};}'></span>${tip?(tip.alias?tip.alias:tip.name):item.seriesName}  </div>`;
                    str += `<div style="padding-left: 10px;">`;
                    str += chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(val,null,2);
                    str += `</div>`;
                    str += `</div>`;
                  });
                  if(chartInfo.type==='stackArea' || self.isStackArea){
                    sum = parseFloat(Number(sum).toFixed(2));
                    str +=`<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                    str +=`<div style="line-height: 18px; font-size: 12px;padding-left:20px;">`
                    str +=self.$t("dashboard.panel.chartTotal");
                    str +=`</div>`;
                    str +=`<div style="padding-left: 10px;">`;
                    str +=chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(sum,null,2);
                    str +=`</div>`;
                    str += `</div>`;
                  }

                  str +=`</div>`;
                  return str;
                },
              }
            });
          }
        });
      },
      mouseEnterFullChart(){
        if (this.echartModalStore) {
          this.echartModalStore.setOption({
            toolbox: {
              show:true,
            }
          })
        }
      },
      mouseLeaveFullChart(){
        if (this.echartModalStore) {
          this.echartModalStore.setOption({
            toolbox: {
              show:false,
            }
          })
        }
      },
      setColor(colorNum){
        this.bgColorList = [];
        for(let i=0;i<colorNum;i++) {
          this.bgColorList.push(randomcolor())
        }
      },
      // 设置数据
      setData(chartItem, seriesItem,legend) {
          this.setColor(legend.length);
          legend.forEach((t,i)=>{t.color = this.bgColorList[i]})
          this.legend = legend;
          //this.data = chartItem;
          //this.seriesItem = seriesItem;
          this.seriesItemScreen = seriesItem;
          this.hasLegendOptions=this.findLegendOptions()
          if(this.hasLegendOptions){
            let sortedOptionKeys=['min','max','avg','last','total']
            this.screenLegendOptions=sortedOptionKeys.map(item=>{ return {option:item,sort:'',value:chartItem.param.legendValue[item]}})
          }
          this.initChart(chartItem, seriesItem, this.$refs.screenShowArea,legend);
      },
      // 设置数据
      setTableData(seriesItem) {
        console.log('set table data',this.chart)
        this.unit = chartDataFormat.getUnit(this.chart.unit);
        seriesItem=seriesItem.map(item=>{
          if(this.chart.param.valueMapping && this.chart.param.valueMapping.type){
            let type=this.chart.param.valueMapping.type;
            let mappings=this.chart.param.valueMapping.mapping?this.chart.param.valueMapping.mapping:[];
            let value = item.value;

            let mapping;
            if(type == 'value'){
              mapping=mappings.find(t=>{return t.value == value})
            }else{
              mapping=mappings.find(t=>{return t.from <= value&& t.to >= value});
            }
            item.value = mapping?mapping.text:this.unit.compute(value,null,2);
            console.log('value',value,'mapping',mapping)
          }
          return item;
        })
        this.storedScreanTableData=seriesItem;
        this.storedScreanTableData=Object.assign([],this.storedScreanTableData.reverse());
        this.screenPageObj.total=this.storedScreanTableData.length;
        this.seriesItemScreen=this.filterShowData(this.storedScreanTableData,this.screenPageObj);

        this.tableShow = true;
        this.$refs.loadingPreview.endLoading();
      },
      clearChart(){
        if(this.echartModalStore){
          this.echartModalStore.clear();
        }
        this.chart = {};
        //this.seriesItem = [];
        this.seriesItemScreen = [];
        this.searchTime[0] = new Date().setHours(new Date().getHours()-1);
        this.searchTime[1] =new Date();

        let iframe = document.querySelector('#chartUrlFrame');
        if(iframe){
          iframe.src="";
        }
        this.isStackArea = false;
        this.serieSingleStat = '';
      },
      // 重新请求数据 刷新操作
      /*
      refreshChart() {
        //this.dropdownMenuShow=false;
        this.clearChart();
        this.$refs['localLoading'+this.chartIndex].startLoading();
        //this.firstShow = false;
        this.$emit('on-refresh-data', this.data.id);
      },
      */
      dateChange(time) {
        this.searchTime = [...time];
        let chartType = this.chart.type;
        if (chartType === 'table') {
          this.seriesItemScreen = [];
          for(let i=0;i<8;i++){
            this.seriesItemScreen.push({//表格数据
              // label: '',//label
              // metric: '',//metric列
              element:'',
              time: '',//采集时间
              value: '',//数值
            });
          }
          this.tableShow = false;
          this.$refs.loadingPreview.startLoading();
          this.getChartData();
        } else if (chartType === 'line' || chartType === 'bar' || chartType === 'stackArea' || chartType === 4 || this.chart.from == 'endpoint') {
          this.echartModalStore.clear();
          if (this.chart.from != 'endpoint') {
            this.showLegend = false;
          }
          this.$refs.loadingPreview.startLoading();
          this.getQueryChart();
        }else if (chartType === 'singleStat') {
          this.serieSingleStat = "";
          this.$refs.loadingPreview.startLoading();
          this.getChartData();
        }
      },
      // 查询数据,修改日期查询全屏数据
      getQueryChart(type) {
        let axiosArr = [];
        this.$nextTick(() => {
          let startTime = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss');
          let endTime = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss');
          if(!startTime || !endTime){//如果时间为空，则默认取最近1小时
            let now = new Date();
            startTime = bus.timeFormate(now, 'yyyy-MM-dd hh:mm:ss');
            endTime = bus.timeFormate(now.setHours(now.getHours()-1), 'yyyy-MM-dd hh:mm:ss');
            this.searchTime[0] = startTime;
            this.searchTime[1] = endTime;
          }
          let step = bus.getStep(startTime,endTime);
          axiosArr = this.chart.elements.map((ele) => {
            const filterItem = ele;
            let query = encodeURIComponent(filterItem.expression);
            return  this.$get('/prom/api/v1/query_range?query='+query+"&start="+this.$stringTimeParseToUnix(startTime)+"&end="+this.$stringTimeParseToUnix(endTime)+'&step='+step);
          });
          // 一个图表
          axios.all(axiosArr).then(res => {
            if (res.length > 0) {
              const series = [];
              const legend = [];
              const sumData = {
                name: 'sum',
                data: [],
                visible: true,
                threshold: null,
              };
              if(!this.chart.type || this.chart.from == 'endpoint'){
                this.chart.type='line';
              }
              res.forEach((response,pos) => {
                if (response.status === 'success') {
                  this.isError = false;
                  this.errorContent = "";
                  if (response.data.result) {
                    // 循环处理每个elements下获取的数据列
                    response.data.result.forEach((queryItem,innerPos) => {
                      const seriesItem = {
                        theData: {
                          name: '',
                          symbol:'emptyCircle',  //去掉点
                          symbolSize:[2,2],
                          smooth:0.2,  //曲线变平滑
                          showSymbol:false,
                          data: [],
                          type:this.chart.type,
                          lineStyle: {
                            width: 1,
                            opacity: 0.9
                          },
                          //visible: true,
                          //threshold: null,
                        },
                        metric_name: '',
                      };
                      if(this.chart.type === 'stackArea'){
                        seriesItem.theData.type='line';
                        seriesItem.theData.stack=this.chart.title;
                        seriesItem.theData.areaStyle={"opacity": 0.3};
                      }
                      // 图表中每条线的名字,后半部分
                      // let host = `${queryItem.metric.__name__}{`;//up,
                      let host = '';//up,
                      if(queryItem.metric.__name__){
                        host = `${queryItem.metric.__name__}{`;//up,
                      }
                      const tagsArr = Object.keys(queryItem.metric);//["__name__","asset","idc","instance","job","module","project"]
                      // 设置时间-数据格式对
                      const dpsArr = Object.entries(queryItem.values);//[ ["0",[1577959830.781,"0"]], ["1",[1577959845.781,"0"]] ]
                      // 判断是否有数据,&& tagsArr.length > 0
                      if (dpsArr.length > 0 ) {
                        tagsArr.forEach((tag, i) => {
                          if (tag !== '__name__') {
                            host += `${tag}="${queryItem.metric[tag]}",`;
                          }
                        });
                        if(host.endsWith(',')){host = host.substr(0,host.length-1);}
                        if(queryItem.metric.__name__){
                          host +="}";
                        }
                        if(!host || host===''){
                          host = this.chart.elements[pos].expression;
                        }
                        let alias=this.dealLegendAlias(host,this.chart.elements[pos].legend);
                        if(!alias || alias===''){
                          alias = host;
                        }
                        legend.push({name:host+innerPos,alias:alias});
                        // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c
                        seriesItem.theData.name = host+innerPos;
                        seriesItem.metric_name = seriesItem.theData.name;
                        // 将秒改为毫秒
                        //alert('table=='+JSON.stringify(queryItem))
                        seriesItem.theData.data = queryItem.values.map((dpsItem, dpsIndex) => {
                          return [dpsItem[0] * 1000, dpsItem[1]];
                        });
                        series.push(seriesItem.theData);

                      } else if (this.chart.elements && this.chart.elements[innerPos]) {
                        // 无数据提示
                      }
                    });
                  }
                }else{
                  this.isError = true;
                  if(response.msg){
                    this.errorContent = response.msg;
                  }else if(response.error){
                    this.errorContent = response.error;
                  }else {
                    this.errorContent = response;
                  }
                }
              });
              this.setColor(legend.length);
              this.initChart(this.chart,series, this.$refs.screenShowArea,legend);
            }
          }).catch(error => {
            if (error) {
              this.$message.error(error.toString());
            }
          });
        });
      },
      dealLegendAlias:function(legend,expression){
        if(/\{\{.+\}\}/.test(expression)){
          let labelValue=expression.replace(/(\{\{.+?\}\})/g,function(i){
            let label=i.substr(i.indexOf('{{')+2,i.indexOf('}}')-i.indexOf('{{')-2);
            let reg=new RegExp(label+'=".+?"');
            let value=null;
            if(reg.test(legend)){
              let find=legend.match(reg)[0];
              value=find.substr(find.indexOf('"')+1,find.lastIndexOf('"')-find.indexOf('"')-1);
            }
            return value?value:label;
          });
          return labelValue
        }else{
          return expression;
        }

      },
      screenPageNo(val) {
        this.screenPageObj.pageNo = val;
        this.seriesItemScreen=this.filterShowData(this.storedScreanTableData,this.screenPageObj)
      },
      screenPageSize(val) {
        this.screenPageObj.pageSize = val;
        this.seriesItemScreen=this.filterShowData(this.storedScreanTableData,this.screenPageObj)
      },
      handleClose(){
        this.screenModal = false;
        this.clearChart();
      },
      findLegendOptions:function(){
        if((!this.chart.param) || (!this.chart.param.legendValue) || Object.keys(this.chart.param.legendValue)<1) return false;
        let legendOptions= this.chart.param.legendValue;
        let onVal=Object.keys(legendOptions).find(item=>{return legendOptions[item] == 'on'});

        return onVal;
      },
      computeLegendData:function(legend,dataArr){
        let options=this.screenLegendOptions;
        let keys=options.filter(item=>{return item.value == 'on'}).map(item=>{return item.option});
        let $self=this;
        keys.forEach(item=>{
          switch (item) {
            case 'min':
              $self.legendMinValue(legend,dataArr);
              break;
            case 'max':
              $self.legendMaxValue(legend,dataArr);
              break;
            case 'avg':
              $self.legendAvgValue(legend,dataArr);
              break;
            case 'last':
              $self.legendLastValue(legend,dataArr);
              break;
            case 'total':
              $self.legendTotalValue(legend,dataArr);
              break;
          }
        })
      },
      legendMinValue:function(legend,dataArr){
        return new Promise(resolve => {
          legend.forEach(item=>{
            let data=dataArr.find(t=>t.name == item.name)
            if(data&&data.data){
              let copy=JSON.parse(JSON.stringify(data.data));
              let min =copy.sort((x,y)=>{return parseFloat(x[1]) - parseFloat(y[1])})[0][1]
              item['min']=parseFloat(min)
            }
          })

          resolve();
        })
      },
      legendMaxValue:function(legend,dataArr){
        return new Promise(resolve => {
          legend.forEach(item=>{
            let data=dataArr.find(t=>t.name == item.name)
            if(data&&data.data){
              let copy=JSON.parse(JSON.stringify(data.data));
              let max =copy.sort((x,y)=>{return parseFloat(y[1]) - parseFloat(x[1])})[0][1]
              item['max']=parseFloat(max)
            }
          })
          resolve();
        })
      },
      legendAvgValue:function(legend,dataArr){
        return new Promise(resolve => {
          legend.forEach(item=>{
            let data=dataArr.find(t=>t.name == item.name)
            if(data&&data.data){
              let copy=JSON.parse(JSON.stringify(data.data));
              copy = copy.map(t=>parseFloat(t[1]))
              let sum = eval(copy.join('+'));
              let avg = sum / copy.length;

              item['avg'] = avg;
            }
          })
          resolve();
        })
      },
      legendLastValue:function(legend,dataArr){
        return new Promise(resolve => {
          legend.forEach(item=>{
            let data=dataArr.find(t=>t.name == item.name)
            if(data&&data.data){
              let copy=JSON.parse(JSON.stringify(data.data));
              let last =copy.sort((x,y)=>{return parseFloat(y[0]) - parseFloat(x[0])})[0][1]
              item['last']=parseFloat(last)
            }
          })
          resolve();
        })
      },
      legendTotalValue:function(legend,dataArr){
        return new Promise(resolve => {
          legend.forEach(item=>{
            let data=dataArr.find(t=>t.name == item.name)
            if(data&&data.data){
              let copy=JSON.parse(JSON.stringify(data.data));
              copy = copy.map(t=>parseFloat(t[1]))
              let sum = eval(copy.join('+'));

              item['total'] = sum;
            }
          })
          resolve();
        })
      },
      formatLegendData:function(data){
        return chartDataFormat.getUnit(this.chart.unit).compute(data,null,2)
      },
      legendValueSort:function(option,legend,options){
        options.forEach(item=>{
          if(item.option != option.option){
            item.sort='';
          }
        })
        if(!option.sort || option.sort == 'asc'){
          legend.sort((x,y)=>x[option.option] - y[option.option])
          option.sort = 'desc'
        }else{
          legend.sort((x,y)=>y[option.option] - x[option.option])
          option.sort = 'asc'
        }
      }
    },
    mounted() {

    },
    beforeDestroy() {
      this.clearChart();
      //const addChartBox = document.querySelector('.right-box-add-chart');
      //addChartBox.style.cssText =   this.oldChartBoxCss;
      try {
        this.echartModalStore.off('magictypechanged');
      } finally {}
      this.$refs.screenLegendArea._ps_ && this.$refs.screenLegendArea._ps_.destroy();
    },
  };

</script>
