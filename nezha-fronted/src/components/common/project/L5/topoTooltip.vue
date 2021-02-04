<template>
  <div style="width: 400px;height: 400px;">
    <span class="temp-dom"></span>
    <line-chart-block v-if="chartData.type !== 'table'"
                      :key="'inner' + chartData.id"
                      :from="'project'"
                      :ref="'editChart' + 0"
                      :temp-dom="tempDom"
                      :panel-id="-1"
                      :is-lock="true"
                      :chart-index="0"
                      :chartTitleShow="false"
                      :chart-data="chartData">

    </line-chart-block>
    <!--<chart-table  v-if="chartData.type === 'table'"-->
                  <!--:ref="'editChart'+0"-->
                  <!--:key="'inner' + 0"-->
                  <!--:from="'project'"-->
                  <!--:ref="'editChart' + 0"-->
                  <!--:is-lock="true"-->
                  <!--:panel-id="-1"-->
                  <!--:chart-data="chartData"-->
                  <!--:chart-index="0"></chart-table>-->
    <>
  </div>
</template>

<script>
  import chart from '../../../page/dashboard/overview/chart';
  import lineChartBlock from '../../../charts/line-chart-block';
  import bus from "../../../../libs/bus";
  import axios from 'axios';
	export default {
		name:"topoTooltip",
    components:{
      lineChartBlock,
    },
    props:{
      chartDataParent:{
        type:Object,
      },
    },
    watch:{
      chartDataParent:{
        immediate: true,
        handler(n){
          this.process(n)
        },

      }
    },
    data(){
		  return{
        tempDom: {height: 400, width: ""},
        filterTime: [
          bus.timeFormate(bus.getOffsetTimezoneData(-1),'yyyy-MM-dd hh:mm:ss'),
          bus.timeFormate(bus.getOffsetTimezoneData(),'yyyy-MM-dd hh:mm:ss')
        ],
        chartDataTemp:{"id":8832,"prev":null,"next":null,"panelId":0,"title":"123","span":12,"height":400,"createAt":"2021-01-27 07:36:19","type":"line","unit":2,"weight":0,"pid":null,"buildIn":null,"seq":null,"param":{"last":0,"legendValue":{"total":"off","min":"off","avg":"off","last":"off","max":"off"},"threshold":"","valueMapping":{"mapping":[{"color":{"bac":"#fff","text":"#000"},"text":"","value":""}],"type":"text"},"url":"","nullType":"connected"},"elements":[{"id":14926,"chartId":null,"expression":"cache_evictions_total","type":"expert","legend":"","buildIn":null,"seq":null},{"id":14927,"chartId":null,"expression":"appDevice","type":"expert","legend":"","buildIn":null,"seq":null}],"sync":null,"asset":null,"isLoaded":true,"from":"__vue_devtool_undefined__","draggable":true,"resizable":true,"editable":true},
        chartData:{},
        filter:{
          end_time:bus.timeFormate(bus.getOffsetTimezoneData(),'yyyy-MM-dd hh:mm:ss'),
          panelId:0,
          searchName:"",
          start_time:bus.timeFormate(bus.getOffsetTimezoneData(-1),'yyyy-MM-dd hh:mm:ss'),
        }
      }
    },
    mounted(){
		  this.tempDomInit();
    },
    methods:{
      tempDomInit() {
        let span = document.querySelector(".temp-dom");
        this.tempDom.width = 400;
      },
      process(item){
        let chartData={...this.chartDataTemp,...item};
        chartData.elements=[]
        chartData.expressArr.forEach((item1,index)=>{
          chartData.elements.push({
            expression:item1,
            legend: chartData.legends[index],
            type:"expert",
            id:index,
            buildIn:null,
            seq:null,
          })
        });
        chartData.id=0;
        chartData.param={
          legendValue:{"total":"off","min":"off","avg":"off","last":"off","max":"off"},
          last:0,
          nullType:"connected",
          threshold:'',
          url:'',
          valueMapping:{"mapping":[{"color":{"bac":"#fff","text":"#000"},"text":"","value":""}],"type":"text"},
        };
        chartData.span=12;
        this.chartData=chartData;
        console.log(chartData);
        setTimeout(()=>{
          this.getChartData(chartData,0);
        });

      },
      // 获取一个图表具体数据,图表信息，图表位置index
      getChartData(chartInfo, pos, filterType) {
        console.log(chartInfo,'chartInfo')
        const chartItem = chartInfo;
        const index = pos; // 指标
          // 没有数据的设置提示信息暂无数据-针对每一个图
          const len = chartItem.elements.length;
          if (len === 0) {
            this.$nextTick(() => {
              if (this.$refs['editChart' + chartItem.id]) {
                this.$refs['editChart' + chartItem.id].setData(chartItem, [], this.filter.panelId, this.filter, []);
              }
            });
          } else {
            let startTime = '';
            let endTime = '';
            if (filterType === 'refresh') {//刷新
              const now = new Date(bus.computeTimezone(new Date().getTime()));
              const origin = new Date(this.filter.end_time);
              const numInterval = now.getTime() - origin.getTime();
              if (numInterval >= 60000) {//大于1分钟，则start、end均往后移numInterval，否则时间不变
                startTime = this.getNewTime(this.filter.start_time, numInterval);
                endTime = bus.timeFormate(now, 'yyyy-MM-dd hh:mm:ss');
              } else {
                startTime = this.filter.start_time;
                endTime = this.filter.end_time;
              }
            } else if (filterType === 'showFullScreen') {//全屏时间查询
              startTime = this.filter.start_time;
              endTime = this.filter.end_time;
              //this.$parent.refreshTime(startTime,endTime);全屏查询，不更新panel列表的时间条件
            } else {
              startTime = this.filter.start_time;
              endTime = this.filter.end_time;
            }

            let step = bus.getStep(startTime, endTime);
            setTimeout(()=>{
              this.$nextTick(() => {
                let res=chartItem.res;
                console.log(res);
                if (res.length > 0) {
                  let series = [];
                  let singleStatRlt = '';
                  let legend = [];
                  let tableData = [];
                  /*let sumData = {
                    name: 'sum',
                    data: [],
                    visible: true,
                    threshold: null,
                  };*/
                  let errorMsg = "";
                  res.forEach((response, innerPos) => {
                    if (response.status === 'success') {
                      errorMsg = "";
                      if (response.data.result) {
                        // 循环处理每个elements下获取的数据列
                        if (chartItem.type === 'singleStat') {
                          if (response.data.result.length === 1) {
                            let statistics = chartItem.param.statistics;
                            if (response.data.result[0].values) {
                              singleStatRlt = bus.getSingleStatRlt(statistics, response.data.result[0].values);
                            }
                          } else if (response.data.result.length > 1) {
                            singleStatRlt = this.$t("dashboard.panel.singleStatErrorTip");
                          }
                        } else {
                          response.data.result.forEach((queryItem, resIndex) => {
                            console.log(queryItem, resIndex);
                            let seriesItem = {
                              theData: {
                                name: '',
                                symbol: 'emptyCircle',  //去掉点
                                symbolSize: [2, 2],
                                smooth: 0.2,  //曲线变平滑
                                showSymbol: false,
                                data: [],
                                lineStyle: {
                                  width: 1,
                                  opacity: 0.9
                                },
                                animation: false,
                                type: chartInfo.type,
                              },
                              metric_name: '',
                            };

                            if (chartInfo.type === 'stackArea') {
                              seriesItem.theData.type = 'line';
                              seriesItem.theData.stack = chartInfo.title;
                              seriesItem.theData.areaStyle = {"opacity": 0.3};
                            }
                            if((chartInfo.type === 'line'||chartInfo.type === 'stackArea'||chartInfo.type === 'bar')&& chartInfo.param && chartInfo.param.threshold){
                              seriesItem.theData.markLine={
                                silent: true,
                                symbol:['circle','circle'],
                                label:{
                                  distance:this.computeDistance(chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(chartInfo.param.threshold)),
                                  formatter:function(params){
                                    return chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(params.value)
                                  }
                                },
                                lineStyle:{
                                  color:'#d64f40',
                                  width:2,
                                  type:'dotted'
                                },
                                data: [{
                                  yAxis: Number(chartInfo.param.threshold)
                                }, ]
                              }
                            }
                            // 图表中每条线的名字,后半部分
                            let host = '';//up,
                            if (queryItem.metric.__name__) {
                              host = `${queryItem.metric.__name__}{`;//up,
                            }
                            const tagsArr = Object.keys(queryItem.metric);//["__name__","asset","idc","instance","job","module","project"]
                            // 设置时间-数据格式对
                            let tempArr = [];
                            let dpsArr = [];
                            tempArr = queryItem.values;
                            dpsArr = Object.entries(queryItem.values);//[ ["0",[1577959830.781,"0"]], ["1",[1577959845.781,"0"]] ]
                            dpsArr = dpsArr.map(item => {
                              return [item[0], [item[1][0], Number(item[1][1])]]
                            });
                            // 判断是否有数据, && tagsArr.length > 0
                            if (dpsArr.length > 0 && this.$refs['editChart' + chartItem.id]) {
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
                              let alias = this.$refs['editChart' + chartItem.id].dealLegendAlias(host, chartItem.elements[innerPos].legend);
                              if (!alias || alias === '') {
                                alias = host;
                              }
                              legend.push({name: host+"-"+chartItem.elements[innerPos].id+"-" + resIndex, alias: alias});
                              // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c

                              seriesItem.theData.name = host +"-"+chartItem.elements[innerPos].id+"-"+ resIndex;
                              //alert(seriesItem.theData.name);
                              seriesItem.metric_name = seriesItem.theData.name;
                              // 将秒改为毫秒
                              //alert('table=='+JSON.stringify(queryItem))
                              seriesItem.theData.data = tempArr.map((dpsItem, dpsIndex) => {
                                /*曲线汇总暂不需要
                                if (sumData.data[dpsIndex]) {
                                  const sumNum = sumData.data[dpsIndex][1] || 0;
                                  sumData.data[dpsIndex][1] = sumNum + dpsItem[1];
                                } else {
                                  sumData.data[dpsIndex] = [dpsItem[0] * 1000, dpsItem[1]];
                                }
                                */
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
                              seriesItem = null;
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
                    } else {
                      if (response.msg) {
                        //this.$message.error(response.msg);
                        errorMsg = response.msg;
                      } else if (response.error) {
                        //this.$message.error(response.error);
                        errorMsg = response.error;
                      } else {
                        //this.$message.error(response);
                        errorMsg = response;
                      }
                    }
                  });
                  console.log(this.$refs['editChart' + chartItem.id],chartItem.id);
                  if (this.$refs['editChart' + chartItem.id]) {
                    let chartData = {
                      chartItem: chartItem,
                      series: series,
                      singleStatRlt: singleStatRlt,
                      legend: legend,
                      tableData: tableData,
                      panelId: this.filter.panelId,
                      filter: this.filter,
                      filterType: filterType,
                      errorMsg: errorMsg,
                    }
                    if (chartItem.type === 'table') {//表格
                      if (filterType === 'showFullScreen') {//全屏查询
                        this.$refs['editChart' + chartItem.id].setData(chartItem, tableData,
                          this.filter.panelId, this.filter, filterType, errorMsg);
                      } else {
                        this.$refs['editChart' + chartItem.id].setData(chartItem, tableData,
                          this.filter.panelId, this.filter, '', errorMsg);
                      }
                    } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 'stackArea' || chartItem.type === 4) {
                      if (series.length && chartItem.type === 4) {//曲线汇总
                        //series.push(sumData);//后续需要
                      }
                      if (filterType === 'showFullScreen') {//全屏查询
                        this.$refs['editChart' + chartItem.id].setData(chartItem, series,
                          this.filter.panelId, this.filter, legend, filterType, errorMsg);
                      } else {
                        console.log(123123123123123123,chartItem, series,
                          this.filter.panelId, this.filter, legend, '', errorMsg);
                        this.$refs['editChart' + chartItem.id].setData(chartItem, series,
                          this.filter.panelId, this.filter, legend, '', errorMsg);
                      }
                    } else if (chartItem.type === 'singleStat') {
                      if (filterType === 'showFullScreen') {//全屏查询
                        this.$refs['editChart' + chartItem.id].setData(chartItem, singleStatRlt,
                          this.filter.panelId, this.filter, filterType, errorMsg);
                      } else {
                        this.$refs['editChart' + chartItem.id].setData(chartItem, singleStatRlt,
                          this.filter.panelId, this.filter, '', errorMsg);
                      }
                    }
                  }
                } else {
                  const type = chartItem.type;
                  if (this.$refs['editChart' + chartItem.id] ) {
                    if (type === 'table') {
                      if (filterType === 'showFullScreen') {//table的全屏查询
                        this.$refs['editChart' + chartItem.id].setData(chartItem, [], this.filter.panelId,
                          this.filter, filterType);
                      } else {
                        this.$refs['editChart' + chartItem.id].setData(chartItem, [], this.filter.panelId,
                          this.filter);
                      }
                    } else if (type === 'line' || type === 'bar' || type === 'stackArea' || chartItem.type === 4) {
                      if (filterType === 'showFullScreen') {//table的全屏查询
                        this.$refs['editChart' + chartItem.id].setData(chartItem, [], this.filter.panelId,
                          this.filter, filterType);
                      } else {
                        this.$refs['editChart' + chartItem.id].setData(chartItem, [], this.filter.panelId,
                          this.filter);
                      }
                    } else if (chartItem.type === 'singleStat') {
                      if (filterType === 'showFullScreen') {//全屏查询
                        this.$refs['editChart' + chartItem.id].setData(chartItem, '',
                          this.filter.panelId, this.filter, filterType);
                      } else {
                        this.$refs['editChart' + chartItem.id].setData(chartItem, '',
                          this.filter.panelId, this.filter);
                      }
                    }
                  }
                }
              });
            },100)
          }
      },
    },
	}
</script>

<style scoped>
  .temp-dom {
    visibility: hidden;
    font-size: 14px;
    position: fixed;
  }
</style>
