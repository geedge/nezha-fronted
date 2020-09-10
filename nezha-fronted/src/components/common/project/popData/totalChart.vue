<template>
  <div
      v-scrollBar
      class="chart-box"
    >
      <div v-for="(item, index) in dataList" :key="item.id" :id="'chart-' + item.id" :name="item.title"  v-show="!item.isHide" class="chart">
        <lineChars
          v-if="item.type === 'line' || item.type === 'bar' ||item.type == 'stackArea' || item.type === 4"
          :key="'inner' + item.id"
          :ref="'editChart'+item.id"
          @on-refresh-data="refreshChart"
          @on-remove-chart-block="removeChart"
          :panel-id="index"
          :chart-index="index"
          :chart-data="item"
          v-loading="item.loading"
          @loadingFalse="loadingFalse"
        >
        </lineChars>
      </div>
    </div>
</template>

<script>
  import axios from 'axios';
  import bus from '@/libs/bus';
  import chartDataFormat from "@/components/charts/chartDataFormat";
  import lineChars from "./lineChart";
	export default {
		name:"totalChart",
    components:{
      lineChars
    },
    props:{
      nodesArray:{},
      moduleId:{},
      projectId:{},
    },
    watch:{

    },
    data(){
		  return{
        dataList:[],
        filter:{
          panelId:'',
          start_time:'',
          end_time:'',
        },
        chartDataCacheGroup:new Map
      }
    },
    mounted(){
      let item = {...this.nodesArray.find((item)=>item.id==this.moduleId)};
      let arr=[];
      item.expressions.forEach((item1,index)=>{
        let obj={...item,elements:[{...item1,expression:item1.metric,}],isHide:false,type:'line',title:item1.name,id:index,loading:true};
        arr.push(obj)
      });
      this.dataList=arr;
      this.$nextTick(()=>{
        arr.forEach(item1=>{
          this.getData(item1, '', '');
        })
      });
      this.$set(this.filter, "panelId", this.projectId);
    },
    methods:{
		  //刷新图表
      refreshChart(chartId,searchTime) {
        this.dataList.forEach((item, index) => {
          if (item.id === chartId) {
            this.getChartData(item, index, 'refresh');
          }
        });
      },
      // 删除图表
      removeChart(chartId) { //from 区分从哪里点击的删除 1.从图表面板 2.从编辑框
        const chart = this.dataList.find(item => item.id === chartId);
        if (chart) {
          this.$emit('on-remove-chart', chart);
        }
      },
      //获取图表数据
		  getData(chartInfo, pos, filterType){
        this.$set(this.filter, "start_time", bus.timeFormate(new Date().getTime()-60*60*1000, "yyyy-MM-dd hh:mm:ss"));
        this.$set(this.filter, "end_time", bus.timeFormate(new Date().getTime(), "yyyy-MM-dd hh:mm:ss"));
        let startTime =  this.filter.start_time;
        let endTime = this.filter.end_time;
        let step = bus.getStep(startTime, endTime);
        chartInfo.loading=true;
        const chartItem = chartInfo;
        this.$nextTick(() => {
          const axiosArr = chartItem.elements.map((ele) => {
            const filterItem = ele;
            let query = encodeURIComponent(filterItem.expression);
            return this.$get('/prom/api/v1/query_range?query=' + query + "&start=" + this.$stringTimeParseToUnix(startTime) + "&end=" + this.$stringTimeParseToUnix(endTime) + '&step=' + step);
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
                        const seriesItem = {
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
                        if (dpsArr.length > 0 && this.$refs['editChart' + chartItem.id] && this.$refs['editChart' + chartItem.id].length > 0) {
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
                          let alias = this.$refs['editChart' + chartItem.id][0].dealLegendAlias(host, chartItem.elements[innerPos].legend);
                          if (!alias || alias === '') {
                            alias = host;
                          }
                          legend.push({name: host + resIndex, alias: alias});
                          // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c
                          seriesItem.theData.name = host + resIndex;
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

              if (this.$refs['editChart' + chartItem.id] && this.$refs['editChart' + chartItem.id].length > 0) {
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
                this.chartDataCacheGroup.set(chartInfo.id, chartData);
                if (chartItem.type === 'table') {//表格
                  if (filterType === 'showFullScreen') {//全屏查询
                    this.$refs['editChart' + chartItem.id][0].setData(chartItem, tableData,
                      this.filter.panelId, this.filter, filterType, errorMsg);
                  } else {
                    this.$refs['editChart' + chartItem.id][0].setData(chartItem, tableData,
                      this.filter.panelId, this.filter, '', errorMsg);
                  }
                } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 'stackArea' || chartItem.type === 4) {
                  if (series.length && chartItem.type === 4) {//曲线汇总
                    //series.push(sumData);//后续需要
                  }
                  if (filterType === 'showFullScreen') {//全屏查询
                    this.$refs['editChart' + chartItem.id][0].setData(chartItem, series,
                      this.filter.panelId, this.filter, legend, filterType, errorMsg);
                  } else {
                    this.$refs['editChart' + chartItem.id][0].setData(chartItem, series,
                      this.filter.panelId, this.filter, legend, '', errorMsg);
                  }
                } else if (chartItem.type === 'singleStat') {
                  if (filterType === 'showFullScreen') {//全屏查询
                    this.$refs['editChart' + chartItem.id][0].setData(chartItem, singleStatRlt,
                      this.filter.panelId, this.filter, filterType, errorMsg);
                  } else {
                    this.$refs['editChart' + chartItem.id][0].setData(chartItem, singleStatRlt,
                      this.filter.panelId, this.filter, '', errorMsg);
                  }
                }
              }
            } else {
              const type = chartItem.type;
              if (this.$refs['editChart' + chartItem.id] && this.$refs['editChart' + chartItem.id].length > 0) {
                if (type === 'table') {
                  if (filterType === 'showFullScreen') {//table的全屏查询
                    this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId,
                      this.filter, filterType);
                  } else {
                    this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId,
                      this.filter);
                  }
                } else if (type === 'line' || type === 'bar' || type === 'stackArea' || chartItem.type === 4) {
                  if (filterType === 'showFullScreen') {//table的全屏查询
                    this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId,
                      this.filter, filterType);
                  } else {
                    this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId,
                      this.filter);
                  }
                } else if (chartItem.type === 'singleStat') {
                  if (filterType === 'showFullScreen') {//全屏查询
                    this.$refs['editChart' + chartItem.id][0].setData(chartItem, '',
                      this.filter.panelId, this.filter, filterType);
                  } else {
                    this.$refs['editChart' + chartItem.id][0].setData(chartItem, '',
                      this.filter.panelId, this.filter);
                  }
                }
              }
            }
          }).catch((error) => {
            if (error) {
              this.$message.error(error.toString());
              console.error(error)
            }
          });
        });
      },

      getChartDataForSearch(chartItem,realIndex){
        let chartData = this.chartDataCacheGroup.get(chartItem.id);
        if(chartData){
          let filterType = chartData.filterType;
          let errorMsg = chartData.errorMsg;
          let tableData = chartData.tableData;
          let panelId = chartData.panelId;
          let filter = chartData.filter;
          let legend = chartData.legend;
          let series = chartData.series;
          let singleStatRlt = chartData.singleStatRlt;
          if(this.$refs['editChart'+chartItem.id] && this.$refs['editChart'+chartItem.id].length>0) {
            if (chartItem.type === 'table') {//表格
              if (filterType === 'showFullScreen') {//全屏查询
                this.$refs['editChart'+chartItem.id][0].setData(chartItem, tableData,
                  panelId, filter, filterType,errorMsg);
              } else {
                this.$refs['editChart'+chartItem.id][0].setData(chartItem, tableData,
                  panelId, filter,'',errorMsg);
              }
            } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 'stackArea' || chartItem.type === 4) {
              if (filterType === 'showFullScreen') {//全屏查询
                this.$refs['editChart'+chartItem.id][0].setData(chartItem, series,
                  panelId, filter, legend, filterType,errorMsg);
              } else {
                this.$refs['editChart'+chartItem.id][0].setData(chartItem, series,
                  panelId, filter, legend,'',errorMsg);
              }
            }else if(chartItem.type ==='singleStat'){
              if (filterType === 'showFullScreen') {//全屏查询
                this.$refs['editChart'+chartItem.id][0].setData(chartItem, singleStatRlt,
                  this.filter.panelId, this.filter, filterType,errorMsg);
              } else {
                this.$refs['editChart'+chartItem.id][0].setData(chartItem, singleStatRlt,
                  this.filter.panelId, this.filter,'',errorMsg);
              }
            }
          }
        }else {
          this.getChartData(chartItem, realIndex);
        }
      },
      // 获取一个图表具体数据,图表信息，图表位置index
      getChartData(chartInfo, pos, filterType) {
        const chartItem = chartInfo;
        const index = pos; // 指标
        if(chartItem.type === 'assetInfo'){
          if (chartItem.from != 'endpoint') {
            this.$set(chartItem, "draggable", true);
            this.$set(chartItem, "resizable", true);
          }
          this.getAssetInfoChartData(chartItem);
          return;
        }
        if(chartItem.type === 'endpointInfo'){
          this.getEndpointInfoChartData(chartItem);
          return;
        }
        if(chartItem.type == 'projectInfo'){
          chartItem.title = this.$t("project.chart.projectInfo");
          this.getProjectInfoChartData(chartItem);
          return;
        }
        if(chartItem.type === 'alertList'){
          this.getAlertListChartData(chartItem,filterType);
          return;
        }
        if(chartItem.type === 'alertRuleInfo'){
          this.getAlertRuleChartData(chartItem);
          return;
        }

        if (this.isModel) {
          this.modelStaticData(chartInfo, filterType);
        } else {
          // 没有数据的设置提示信息暂无数据-针对每一个图
          const len = chartItem.elements.length;
          if (len === 0) {
            this.$nextTick(() => {
              if (this.$refs['editChart' + chartItem.id] && this.$refs['editChart' + chartItem.id].length > 0) {
                this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId, this.filter);//????怎么设置的无数据？？
              }
            });
          } else {
            let startTime = '';
            let endTime = '';
            if (filterType === 'refresh') {//刷新
              const now = new Date();
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
            this.$nextTick(() => {
              const axiosArr = chartItem.elements.map((ele) => {
                const filterItem = ele;
                let query = encodeURIComponent(filterItem.expression);
                return this.$get('/prom/api/v1/query_range?query=' + query + "&start=" + this.$stringTimeParseToUnix(startTime) + "&end=" + this.$stringTimeParseToUnix(endTime) + '&step=' + step);
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
                            const seriesItem = {
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
                            if (dpsArr.length > 0 && this.$refs['editChart' + chartItem.id] && this.$refs['editChart' + chartItem.id].length > 0) {
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
                              let alias = this.$refs['editChart' + chartItem.id][0].dealLegendAlias(host, chartItem.elements[innerPos].legend);
                              if (!alias || alias === '') {
                                alias = host;
                              }
                              legend.push({name: host + resIndex, alias: alias});
                              // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c
                              seriesItem.theData.name = host + resIndex;
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

                  if (this.$refs['editChart' + chartItem.id] && this.$refs['editChart' + chartItem.id].length > 0) {
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
                    this.chartDataCacheGroup.set(chartInfo.id, chartData);
                    if (chartItem.type === 'table') {//表格
                      if (filterType === 'showFullScreen') {//全屏查询
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, tableData,
                          this.filter.panelId, this.filter, filterType, errorMsg);
                      } else {
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, tableData,
                          this.filter.panelId, this.filter, '', errorMsg);
                      }
                    } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 'stackArea' || chartItem.type === 4) {
                      if (series.length && chartItem.type === 4) {//曲线汇总
                        //series.push(sumData);//后续需要
                      }
                      if (filterType === 'showFullScreen') {//全屏查询
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, series,
                          this.filter.panelId, this.filter, legend, filterType, errorMsg);
                      } else {
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, series,
                          this.filter.panelId, this.filter, legend, '', errorMsg);
                      }
                    } else if (chartItem.type === 'singleStat') {
                      if (filterType === 'showFullScreen') {//全屏查询
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, singleStatRlt,
                          this.filter.panelId, this.filter, filterType, errorMsg);
                      } else {
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, singleStatRlt,
                          this.filter.panelId, this.filter, '', errorMsg);
                      }
                    }
                  }
                } else {
                  const type = chartItem.type;
                  if (this.$refs['editChart' + chartItem.id] && this.$refs['editChart' + chartItem.id].length > 0) {
                    if (type === 'table') {
                      if (filterType === 'showFullScreen') {//table的全屏查询
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId,
                          this.filter, filterType);
                      } else {
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId,
                          this.filter);
                      }
                    } else if (type === 'line' || type === 'bar' || type === 'stackArea' || chartItem.type === 4) {
                      if (filterType === 'showFullScreen') {//table的全屏查询
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId,
                          this.filter, filterType);
                      } else {
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId,
                          this.filter);
                      }
                    } else if (chartItem.type === 'singleStat') {
                      if (filterType === 'showFullScreen') {//全屏查询
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, '',
                          this.filter.panelId, this.filter, filterType);
                      } else {
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, '',
                          this.filter.panelId, this.filter);
                      }
                    }
                  }
                }
              }).catch((error) => {
                if (error) {
                  this.$message.error(error.toString());
                  console.error(error)
                }
              });
            });
          }
        }
      },
      getNewTime(time, num) {
        const date = new Date(time);
        const newDate = new Date(parseInt(date.getTime(), 10) + num);
        return bus.timeFormate(newDate, 'yyyy-MM-dd hh:mm:ss');
      },
      // 关闭loading状态
      loadingFalse(item){
        this.$set(this.dataList[item.id],'loading',false);
      },
    },
	}
</script>

<style scoped>
  .chart{
    width: 500px;
    height: 300px;
    border: 1px solid #FFFFFF;
    box-shadow: 1px 2px 4px 0 rgba(0,0,0,0.12), -1px 1px 9px -1px rgba(205,205,205,0.77);
    margin-bottom: 15px;
  }
  .chart-box{
    /*padding-left: 600px;*/
    position: relative;
    height: calc(100vh - 100px);
    padding: 3px 15px 100px 15px;
  }
</style>
