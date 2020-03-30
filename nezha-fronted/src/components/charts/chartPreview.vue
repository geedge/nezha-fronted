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
</style>
<template>
    <el-dialog class="chart-preview-dialog nz-dialog" id="chartPreviewDailog"
               :visible.sync="screenModal"
               :width="dailogWidth"
               :modal-append-to-body='false'
               @close="handleClose"
               @opened="initDialog">
      <div slot="title">
        <span class="nz-dialog-title">{{chart.title}}</span>
        <div class="float-right panel-calendar dialog-tool">
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
          </el-date-picker>
        </div>
      </div>

      <template v-if="chart.type==='line'||chart.type==='bar'||chart.type==='stackArea'">
        <div id="chartEchartPreview">
          <div class="line-area" ref="screenShowArea"  id="screenShowArea"  style="margin-top:10px;"></div>
          <div class="legend-container legend-container-screen" id="screenLegendArea" ref="screenLegendArea" v-show="showLegend" v-scrollBar:legend>
            <div v-for="(item, index) in screenLegendList" :title="item.alias?item.alias:item.name"  @click="clickScreenLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGreyScreen[index]}"  :key="'legend_' + item.name+'_'+index">
              <span class="legend-shape" :style="{background:(isGreyScreen[index]?'#D3D3D3':bgColorList[index])}"></span>{{item.alias?item.alias:item.name}}
              <br/>
            </div>
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
              {{ unit.compute(scope.row.value,null,2)}}
            </template>
          </el-table-column>
        </el-table>
        <Pagination :pageObj="screenPageObj" :post-page-sizes="pageSizes" @pageNo='screenPageNo' @pageSize='screenPageSize' ref="Pagination" ></Pagination>
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

  export default {
    name: 'chartPreview',
    components: {
      'loading': loading,
    },
    props: {
      panelId:Number,
    },
    data() {
      return {
        chart:{},
        //data: {}, // 该图表信息,chartItem
        dailogWidth:'80%',
        //seriesItem: [], // 保存信息
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
        //panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
        //chartName: '',
        //firstLoad: false, // 是否第一次加载
        //divFirstShow:false,
        //highchartStore: null, // 保存图表数据
        //echartStore:null,// 保存图表数据
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
        searchTime:[new Date().setHours(new Date().getHours()-1),new Date()],
        //oldSearchTime:[],
        minHeight:200,
        chartSpaceHeight:0,//top-border: 1,bottom-border: 1,padding-bottome:3
        titleHeight:50,
        legendHeight:80,
        //oldChartBoxCss:'',
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
      };
    },
    computed: {
    },
    watch: {},
    methods: {
      // 全屏查看
      show(chartInfo) {
        this.searchTime = [new Date().setHours(new Date().getHours()-1),new Date()];
        this.chart=chartInfo;
        let chartType= chartInfo.type;
        let chartContainerId = 'chartEchartPreview'
        if(chartType==='table'){
          /*
          for(let i=0;i<8;i++){
            this.seriesItemScreen.push({//表格数据
              // label: '',//label
              // metric: '',//metric列
              element:'',
              time: '',//采集时间
              value: '',//数值
            });
          }*/
          this.tableShow = false;
          chartContainerId = 'chartTablePreview';
        }else if (chartType === 'line' || chartType === 'bar' || chartType === 'stackArea' || chartType === 4) {
          this.isGreyScreen=[];
          this.showLegend = false;
          chartContainerId = 'chartEchartPreview';
        }

        //设置高度 chart-table
        this.$nextTick(() => {
          //const chartBox = document.getElementById('chartPreviewDailog');
          let height = this.chart.height;
          if(height<this.minHeight){
            height = this.minHeight;
          }
          const chartDiv = document.getElementById(chartContainerId);
          chartDiv.style.height = `${height-this.chartSpaceHeight-this.titleHeight}px`;
          const addChartBox = document.querySelector('.right-box-add-chart');
          //this.oldChartBoxCss = addChartBox.style.cssText;
          addChartBox.style.cssText =  'z-index:1500 !important';
          if(chartType==='table'){
            const tableBox = document.getElementById('tableContainer');
            tableBox.style.height = `${height-this.titleHeight-this.pageHeight}px`;//-75-32+25
          }
        });
        this.setSize(chartInfo.span); // 设置该图表宽度

        this.screenModal = true;
      },
      filterShowData(source,pageObj){
        return source.slice((pageObj.pageNo-1)*pageObj.pageSize,pageObj.pageNo*pageObj.pageSize)
      },
      initDialog(){
        //此时初始化，才能获得screenShowArea对象，否则此对象为undefined，无法初始化图表
        let chartType= this.chart.type;
        if(chartType==='table'){

        }else if (chartType === 'line' || chartType === 'bar' || chartType === 'stackArea' || chartType === 4) {
          if(this.echartModalStore){
            this.echartModalStore.clear();
          }
        }
        //后台获得数据
        this.$refs.loadingPreview.startLoading();
        this.getChartData();
      },
      // 设置图表的宽度
      setSize(size) {
        this.$nextTick(() => {
          const listContainer = document.getElementById('listContainer');
          //chartBox.style.width = `${(size / 12) * 100}%`;
          let containerWidth= listContainer.clientWidth;
          this.dailogWidth = `${containerWidth*(size / 12)}px`;
        });
      },
      // 获取一个图表具体数据
      getChartData() {
        const chartItem = this.chart;
        const len = chartItem.elements.length;
        // 没有数据的设置提示信息暂无数据-针对每一个图
        if (len === 0) {
          this.$nextTick(() => {
            if (chartItem.type === 'table') {//表格
              this.setTableData([]);
            } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 'stackArea' || chartItem.type === 4) {
              this.setData(chartItem, []);
            }
          });
        } else {
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
          this.$nextTick(() => {
            const axiosArr = chartItem.elements.map((ele) => {
              const filterItem = ele;
              return  this.$get('/prom/api/v1/query_range?query='+filterItem.expression+"&start="+startTime+"&end="+endTime+'&step='+step);
            });
            // 一个图表的所有element单独获取数据
            axios.all(axiosArr).then((res) => {
              if (res.length > 0) {
                const series = [];
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
                    if (response.data.result) {
                      // console.log(response.data.result)
                      // 循环处理每个elements下获取的数据列
                      response.data.result.forEach((queryItem) => {
                        const seriesItem = {
                          theData: {
                            name: '',
                            symbol:'none',  //去掉点
                            smooth:true,  //曲线变平滑
                            data: [],
                            type:chartItem.type,
                          },
                          metric_name: '',
                        };
                        if(chartItem.type === 'stackArea'){
                          seriesItem.theData.type='line';
                          seriesItem.theData.stack=chartItem.title
                          seriesItem.theData.areaStyle={};
                        }
                        // 图表中每条线的名字,后半部分
                        let host = '';//up,
                        if(queryItem.metric.__name__){
                          host = `${queryItem.metric.__name__}{`;//up,
                        }
                        const tagsArr = Object.keys(queryItem.metric);//["__name__","asset","idc","instance","job","module","project"]
                        // 设置时间-数据格式对
                        const dpsArr = Object.entries(queryItem.values);//[ ["0",[1577959830.781,"0"]], ["1",[1577959845.781,"0"]] ]
                        // 判断是否有数据
                        if (dpsArr.length > 0 && tagsArr.length > 0 ) {
                          tagsArr.forEach((tag, i) => {
                            if (tag !== '__name__') {
                              host += `${tag}="${queryItem.metric[tag]}",`;
                            }
                          });
                          if(host.endsWith(',')){host = host.substr(0,host.length-1);}
                          host +="}";
                          //处理legend别名
                          let alias=this.dealLegendAlias(host,chartItem.elements[innerPos].legend);
                          legend.push({name:host,alias:alias});
                          // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c
                          seriesItem.theData.name = host;
                          seriesItem.metric_name = seriesItem.theData.name;
                          // 将秒改为毫秒
                          //alert('table=='+JSON.stringify(queryItem))
                          seriesItem.theData.data = queryItem.values.map((dpsItem, dpsIndex) => {
                            let t_date = new Date(dpsItem[0] * 1000);
                            let timeTmp = bus.timeFormate(t_date, 'yyyy-MM-dd hh:mm:ss');
                            tableData.push({//表格数据
                              // label: host.slice(host.indexOf('{') + 1,host.indexOf('}')),//label
                              // metric: queryItem.metric.__name__?queryItem.metric.__name__:'',//metric列
                              element:{element:host,alias:alias},
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
                  }else{
                    if(response.msg){
                      this.$message.error(response.msg);
                    }else if(response.error){
                      this.$message.error(response.error);
                    }else {
                      this.$message.error(response);
                    }
                  }
                });
                //if(this.$refs.editChart&&this.$refs.editChart[index]) {
                  if (chartItem.type === 'table') {//表格
                      this.setTableData(tableData);
                  } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 'stackArea' || chartItem.type === 4) {
                    if (series.length && chartItem.type === 4) {//曲线汇总
                    }
                    this.setData(chartItem, series, legend);
                  }
                //}
              } else {
                const type = chartItem.type;
                //if(this.$refs.editChart[index]) {
                  if (type === 'table') {
                      this.setTableData([]);
                  } else if (type === 'line' || type === 'bar' || type === 'stackArea' || type === 4) {
                      this.setData(chartItem, []);
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
          })
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
        var option = {
          title:{
            show:false,
          },
          color: this.bgColorList,
          tooltip: {
            trigger: 'axis',
            confine:false,
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

              //let str = `<div  style='white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;min-width:150px;max-width:600px;display:inline-block;line-height: 18px;font-size:12px;font-family: Roboto,Helvetica Neue,Arial,sans-serif;'>`;
              params.forEach((item, i) => {
                let tip=legend.find((element)=>{
                  return element.name == item.seriesName;
                })
                if(i===0){
                  let t_date = new Date(item.data[0]);
                  str += [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('-') + " "
                    + [t_date.getHours(), t_date.getMinutes(),t_date.getSeconds()].join(':');
                  str +=`<br/>`;
                }
                let val = parseFloat(Number(item.data[1]).toFixed(2));
                if(val===0){
                  val = Number(item.data[1]);
                }
                str += `<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${item.color};}'></span>${tip?(tip.alias?tip.alias:tip.name):item.seriesName}:  </div>`;
                str += `<div style="padding-left: 10px;">`;
                str += chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(val,null,2);
                str += `</div>`;
                str += `</div>`;

              });
              str +=`</div>`;
              return str;
              },
          },
          legend: {
            type:'scroll',
            height:80,
            show:false,
            icon:"roundRect",
            itemHeight:5,
            itemWidth:15,
            formatter:function(name){
              //console.log('==========='+name);
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
            tooltip:{
              show:true,
              formatter:function(params){
                //alert(params.length);
                //alert(JSON.stringify(params));

                return `<div  style='width:100%;display:block;word-break:break-all;word-wrap:break-word;white-space:normal'> ${params.name}</div>`;
              },
            },
            data: legend,
            orient:'vertical',
            x:'center',
            y:'bottom',
            //top:'5%',
            //bottom:0
          },
          grid: {
            top: 13,
            left: 0,
            right: 30,
            containLabel: true,
            bottom:35,//156
          },
          dataZoom: [{
            type: 'slider',
            show:true,
            xAxisIndex: [0],
            start: 0,
            end: 100,
            height:25,
            bottom:10,//96
            left:40,
            right:48,
          }
           ],

          xAxis: {
            type: 'time',
            // boundaryGap: false,//line-false; bar-true;
            //data: ['20190101', '20190102', '周三', '周四', '周五', '周六', '周日']
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
              formatter: function(value,index){
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
            const legend = {
              name:item.name,
              alias:item.alias,
              showText:this.formatLegend(chartWidth,item.alias?item.alias:item.name)
            };
            this.screenLegendList.push(legend);
            this.isGreyScreen.push(false);
          });
        }
        this.$nextTick(() => {
          let divHeight = this.$refs.screenLegendArea.offsetHeight;
          this.echartModalStore.resize({height:(chartInfo.height-this.chartSpaceHeight-divHeight-this.titleHeight)});
          this.echartModalStore.clear();
          this.echartModalStore.setOption(option);//创建图表
          this.$refs.loadingPreview.endLoading();
        });
      },
      // 设置数据
      setData(chartItem, seriesItem,legend) {
          this.legend = legend;
          //this.data = chartItem;
          //this.seriesItem = seriesItem;
          this.seriesItemScreen = seriesItem;

          this.initChart(chartItem, seriesItem, this.$refs.screenShowArea,legend);
      },
      // 设置数据
      setTableData(seriesItem) {
        this.unit = chartDataFormat.getUnit(this.chart.unit);

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
        } else if (chartType === 'line' || chartType === 'bar' || chartType === 'stackArea' || chartType === 4) {
          this.echartModalStore.clear();
          this.showLegend = false;
          this.$refs.loadingPreview.startLoading();
          this.getQueryChart();
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
            return  this.$get('/prom/api/v1/query_range?query='+filterItem.expression+"&start="+startTime+"&end="+endTime+'&step='+step);
          });
          // 一个图表
          axios.all(axiosArr).then((res) => {
            if (res.length > 0) {
              const series = [];
              const legend = [];
              const sumData = {
                name: 'sum',
                data: [],
                visible: true,
                threshold: null,
              };
              if(!this.chart.type){
                this.chart.type='line';
              }
              res.forEach((response,pos) => {
                if (response.status === 'success') {
                  if (response.data.result) {
                    // 循环处理每个elements下获取的数据列
                    response.data.result.forEach((queryItem,innerPos) => {
                      const seriesItem = {
                        theData: {
                          name: '',
                          symbol:'none',  //去掉点
                          smooth:true,  //曲线变平滑
                          data: [],
                          type:this.chart.type,
                          //visible: true,
                          //threshold: null,
                        },
                        metric_name: '',
                      };
                      if(this.chart.type === 'stackArea'){
                        seriesItem.theData.type='line';
                        seriesItem.theData.stack=this.chart.title
                        seriesItem.theData.areaStyle={};
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
                      // 判断是否有数据
                      if (dpsArr.length > 0 && tagsArr.length > 0) {
                        tagsArr.forEach((tag, i) => {
                          if (tag !== '__name__') {
                            host += `${tag}="${queryItem.metric[tag]}",`;
                          }
                        });
                        if(host.endsWith(',')){host = host.substr(0,host.length-1);}
                        host +="}";
                        let alias=this.dealLegendAlias(host,this.chart.elements[pos].legend);
                        legend.push({name:host,alias:alias});
                        // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c
                        seriesItem.theData.name = host;
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
                }
              });
              this.initChart(this.chart,series, this.$refs.screenShowArea,legend);
            }
          }).catch((error) => {
            if (error) {
              this.$message.error(error.toString());
            }
          });
        });
      },
      dealLegendAlias:function(legend,expression){
        if(/\{\{.+\}\}/.test(expression)){
          let labelValue=expression.replace(/(\{\{.+?\}\})/g,function(i){
            let label=i.substr(i.indexOf('{{')+2,i.indexOf('}}')-i.indexOf('{{')-2)
            let reg=new RegExp(label+'=".+?"')
            let value=null;
            if(reg.test(legend)){
              let find=legend.match(reg)[0];
              value=find.substr(find.indexOf('"')+1,find.lastIndexOf('"')-find.indexOf('"')-1);
            }
            return value?value:label;
          })
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
    },
    mounted() {
    },
    beforeDestroy() {
      this.clearChart();
      //const addChartBox = document.querySelector('.right-box-add-chart');
      //addChartBox.style.cssText =   this.oldChartBoxCss;
    },
  };

</script>
