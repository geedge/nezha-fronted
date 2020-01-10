<style scoped>
  .chartBox {
    box-sizing: border-box;
    padding-bottom: 10px;
    float:left;
  }
  .noData{
    text-align: center
  }
  .list-width{
    width:98%;
  }
</style>
<template>

  <div class="list-width">
    <div class="chartBox" v-for="(item, index) in dataList" :key="item.id">

      <line-chart-block v-if="item.type === 'line' || item.type === 'bar' || item.type === 4" :key="'inner' + item.id"
      ref="editChart" 
      @on-refresh-data="refreshChart"
      @on-remove-chart-block="removeChart"
      @on-edit-chart-block="editData"
      :panel-id="filter.panelId" 
      :editChartId="'editChartId' + item.id"></line-chart-block>

      <chart-table v-if="item.type === 'table'" ref="editChart" :key="'inner' + item.id"
      @on-refresh-data="refreshChart"
      @on-remove-chart-block="removeChart" 
      @on-edit-chart-block="editData"
      :panel-id="filter.panelId" 
      :editChartId="'editChartId' + item.id"></chart-table>

    </div>
    <el-row v-if="dataList.length === 0"  class="noData"></el-row>
  </div>
</template>
<script>
import axios from 'axios';
import bus from '../../libs/bus';
import lineChartBlock from './line-chart-block';
import chartTable from './chart-table';

export default {
  name: 'chartList',
  props: {
  },
  components: {
    lineChartBlock,
    chartTable,
  },
  data() {
    return {
      filter: {},
      dataList: [], // 看板中所有图表信息
      time: {
        start: '',
        end: '',
      },
      panelId: '',
      timer: null,
    };
  },
  computed: {},
  watch: {},
  methods: {
    initData(filter) {
      this.dataList = [];
      // 内含 panelId,开始时间,结束时间
      this.filter = filter;
      this.getData(this.filter);
    },
    // 获取panel详情数据,获取panel下所有chart列表
    getData(params) {
      //param   目前没有用
      const param = {
        panelId: params.panelId,
        query: params.query,
      };
      if (!param.query) delete param.query;
      //根据panelId获得panel下的所有图表
      let searchTitleStr = '';
      if(this.filter.searchName&&this.filter.searchName!=''){
        searchTitleStr = '?title='+this.filter.searchName;
      }
      this.$get('panel/'+ params.panelId+'/charts'+searchTitleStr).then(response => {
        if (response.code === 200) {
          if(response.data.list){
            this.dataList = response.data.list;
          }else {
            this.dataList = response.data;
          }
          if (this.dataList.length > 0) {
            this.$refs.editChart.forEach((item) => {
              item.showLoad();//之后要实现
            });
          }
          //alert(JSON.stringify(response)); 查着，返回的内容就没有图表表达式了？？
          this.dataSetFirst(this.dataList);
        }
      });
    },
    // arr: 该panel下图表list,生成该看板下所有图表
    dataSetFirst(arr) {
      if (arr.length) {
        arr.forEach((item, index) => {
          this.getChartData(item, index);
        });
      }
    },

    // 获取一个图表具体数据,图表信息，图表位置index
    getChartData(chartInfo, pos, filterType) {
      //alert(JSON.stringify(chartInfo));
      const chartItem = chartInfo;
      const index = pos; // 指标
      const len = chartItem.elements.length;
      this.setSize(chartItem.span, index); // 设置该图表宽度
      // 没有数据的设置提示信息暂无数据-针对每一个图
      if (len === 0) {
        this.$nextTick(() => {
          this.$refs.editChart[index].setData(chartItem, [], this.filter.panelId, this.filter);//????怎么设置的无数据？？
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
        } else {
           startTime = this.filter.start_time;
           endTime = this.filter.end_time;
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
                    // 循环处理每个elements下获取的数据列
                    response.data.result.forEach((queryItem) => {
                      const seriesItem = {
                        theData: {
                          name: '',
                          data: [],
                          type:chartInfo.type,
                          //visible: true,
                          //threshold: null,
                        },
                        metric_name: '',
                      };
                      // 图表中每条线的名字,后半部分
                      let host = `${queryItem.metric.__name__}{`;//up,
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
                        legend.push(host);
                        // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c
                        seriesItem.theData.name = host;
                        seriesItem.metric_name = seriesItem.theData.name;
                        // 将秒改为毫秒
                        //alert('table=='+JSON.stringify(queryItem))
                        seriesItem.theData.data = queryItem.values.map((dpsItem, dpsIndex) => {
                          /*曲线汇总暂不需要
                          if (sumData.data[dpsIndex]) {
                            const sumNum = sumData.data[dpsIndex][1] || 0;
                            sumData.data[dpsIndex][1] = sumNum + dpsItem[1];
                          } else {
                            sumData.data[dpsIndex] = [dpsItem[0] * 1000, dpsItem[1]];
                          }
                          */
                          let t_date = new Date(dpsItem[0] * 1000);
                          let timeTmp = bus.timeFormate(t_date, 'yyyy-MM-dd hh:mm');
                          tableData.push({//表格数据
                            label: host.slice(host.indexOf('{') + 1,host.indexOf('}')),//label
                            metric: queryItem.metric.__name__,//metric列
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
              });
              // chartData, seriesItem, panelsId, filter
              if (chartItem.type === 'table') {//表格
                this.$refs.editChart[index].setData(chartItem, tableData,
                  this.filter.panelId, this.filter);
              } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 4) {
                if (series.length && chartItem.type === 4) {//曲线汇总
                  //series.push(sumData);//后续需要
                }
                this.$refs.editChart[index].setData(chartItem, series,
                  this.filter.panelId, this.filter,legend);
              }
            } else {
              const type = chartItem.type;
              if (type === 'table') {
                this.$refs.editChart[index].setData(chartItem, [], this.filter.panelId,
                  this.filter);
              } else if (type === 'line' || type === 'bar' || chartItem.type === 4) {
                this.$refs.editChart[index].setData(chartItem, [], this.filter.panelId,
                  this.filter);
              }
            }
          }).catch((error) => {
            if (error) {
              this.$message.warning({
                content: this.$t("tip.refreshLater"),//'Please refesh later',//请稍后刷新
                duration: 3,
              });
            }
          });
        });
      }
    },
    // 设置图表的宽度
    setSize(size, index) {
      this.$nextTick(() => {
        const chartBox = document.getElementsByClassName('chartBox');
        chartBox[index].style.width = `${(size / 12) * 100}%`;
        //chartBox[index].style.height = height;
      });
    },

    getNewTime(time, num) {
      const date = new Date(time);
      const newDate = new Date(parseInt(date.getTime(), 10) + num);
      return bus.timeFormate(newDate, 'yyyy-MM-dd hh:mm:ss');
    },
    // 删除图表
    removeChart(chartId) {
      const chart = this.dataList.find(item => item.id === chartId);
      if (chart) {
        this.$emit('on-remove-chart', chart);
      }
    },
    // 编辑图表
    editData(chartId) {
      // 获取该id下chart的相关信息
      const chart = this.dataList.find(item => item.id === chartId);
      if (chart) {
        this.$emit('on-edit-chart', chart);
      }
    },
    // 刷新列表中的一个图表
    refreshChart(chartId) {
      this.dataList.forEach((item, index) => {
        if (item.id === chartId) {
          this.getChartData(item, index, 'refresh');
        }
      });
    },
    /*
    // 刷新数据
    refreshData() {
      this.getData(this.filter);
    },
     */
  },

  mounted() {
  },
  beforeDestroy() {
  },
};

</script>
