<style lang="scss">
  @import './metricPreview.scss';
</style>
<template>
    <div class="main-container metric-dashboard">
      <left-menu >
        <div slot="content-left" class="slot-content">
            <div class="sidebar-title">{{$t('dashboard.title')}}</div>
            <div class="sidebar-info">
                <div class="sidebar-info-item " @click="jumpTo('overview')">{{$t('dashboard.overview.title')}}</div>
                <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('panel')">{{$t('dashboard.panel.title')}}</div>
                <div class="sidebar-info-item sidebar-info-item-active">{{$t('dashboard.metricPreview.title')}}</div>
<!--                <div class="sidebar-info-item "@click="jumpTo('explore')">{{$t('dashboard.metricPreview.title')}}</div>-->
            </div>
        </div>
        <div slot="content-right" class="slot-content">


          <!--<div class="top-tools">
              <div class="float-right mr-10">
                <el-date-picker size="mini" ref="calendar"
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
            </div>-->
            <div class="table-list" >
              <div class="box-content" >
                <el-row :gutter="20"  class="row-width" style="height: calc(100% - 65px);">
                  <el-col :span="10" >
                      <metric-set  :panelData="panelData" ref="metricSet" @on-view-chart="getChartParam"  @reloadPanel="getPanelData" ></metric-set>
                  </el-col>
                  <el-col :span="0.5" ><div>&nbsp;</div></el-col>
                  <el-col :span="13" class="chart-preview-area" >
                    <el-date-picker size="mini" ref="calendar"
                                    format="yyyy/MM/dd HH:mm"
                                    @change="dateChange"
                                    v-model="searchTime"
                                    type="datetimerange"
                                    :picker-options="pickerOptions"
                                    :range-separator="$t('dashboard.panel.to')"
                                    :start-placeholder="$t('dashboard.panel.startTime')"
                                    :end-placeholder="$t('dashboard.panel.endTime')"
                                    style="position:absolute; right: 10px"
                                    align="right">
                    </el-date-picker>
                    <el-row class="border-area" v-show="chartCount === 'single'" style="margin-top: 40px;">
                      <div class="chartBox">
                        <line-chart-block
                          :show-setting="false"
                          :isExplore="true"
                          ref="editChartSingle"
                          @on-refresh-data="refreshChart"
                          @on-remove-chart-block="removeChart"
                          @on-edit-chart-block="editData"
                        ></line-chart-block>
                      </div>
                    </el-row>

                    <el-row class="border-area" v-show="chartCount === 'multiple'">
                      <el-scrollbar style="height: 100%">
                        <div class="chartBoxMul" v-for="(item, index) in lineList">
                          <line-chart-block
                            :show-setting="false"
                            ref="editChartMultiple"
                            @on-refresh-data="refreshChart"
                            @on-remove-chart-block="removeChart"
                            @on-edit-chart-block="editData"
                          ></line-chart-block>
                        </div>
                      </el-scrollbar>
                    </el-row>

                  </el-col>
                </el-row>
              </div>
            </div>
        </div>
      </left-menu>
    </div>
</template>
<script>
  import bus from '../../../libs/bus';
  import metricSet from './metricSet';
  import lineChartBlock from '../../charts/line-chart-block';

export default {
  name: "metricPreview",
  components: {
    lineChartBlock,
    metricSet
  },
  data() {
    return {
      filter: {
        start_time: '',
        end_time: '',
      },
      total: 0, // 总数
      selectedData: null, // 选中数据
      searchName: '', // 搜索名称
      showTagModal: false,
      tagSet: null, // 根据你metric获取的tags信息
      metricInfo: {}, // 保存参数信息
      chartCount: 'single', // multiple
      lineList: [], // 线列表
      panelData: [], //panel列表
      searchTime:[new Date().setHours(new Date().getHours()-1),new Date()],
      //searchTime:[new Date().setMinutes(new Date().getMinutes()-1),new Date()],
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
    }
  },
  methods: {
    jumpTo(data,id) {
      //this.$store.state.assetData.moduleData = data;
      //this.$store.state.assetData.selectedData = id;
      bus.$emit("menu-change", data);
      this.$store.state.showPanel.id = 0;
      this.$store.state.showPanel.name = '';
      this.$router.push({
        path: "/" + data,
        query: {
          t: +new Date()
        }
      });
    },
    // 获取默认时间
    getInit() {
      const end = new Date();
      const start = new Date();
      start.setHours(start.getHours() - 1);
      start.setSeconds(0);
      end.setSeconds(59);
      this.filter.start_time = bus.timeFormate(start, 'yyyy-MM-dd hh:mm:ss');
      this.filter.end_time = bus.timeFormate(end, 'yyyy-MM-dd hh:mm:ss');
      this.$refs.editChartSingle.setDivFirstShow(true);
    },
    dateChange(time) {
      this.filter.start_time = `${time[0]}:00`;
      this.filter.end_time = `${time[1]}:59`;
      this.getChartParam(this.metricInfo, this.chartCount);
      if (this.chartCount === 'single') {
        this.$refs.editChartSingle.changeDate(this.searchTime);
      } else if (this.chartCount === 'multiple') {
        if (this.lineList.length > 0) {
          this.$refs.editChartMultiple.forEach((item) => {
            item.changeDate(this.searchTime);
          });
        }
      }
    },
    getPanelData() { //获取panel数据
      this.$get('panel?pageNo=1&pageSize=-1').then(response => {
        if (response.code === 200) {
          this.panelData = response.data.list;
        }
      });
    },
    // 获取图表信息
    getChartParam(params, chartCount) {
      this.chartCount = chartCount;
      this.metricInfo = params;
      if (this.chartCount === 'single') {
        this.$refs.editChartSingle.showLoad();
      } else if (this.chartCount === 'multiple') {
        if (this.lineList.length > 0) {
          this.$refs.editChartMultiple.forEach((item) => {
            item.showLoad();
          });
        }
      }
      const startTime = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss');
      const endTime = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss');
      this.filter.start_time = startTime;
      this.filter.end_time = endTime;
      let step = bus.getStep(startTime,endTime);
      let query = encodeURIComponent(params.elements[0].expression);
      this.$get('/prom/api/v1/query_range?query='+query+"&start="+this.$stringTimeParseToUnix(startTime)+"&end="+this.$stringTimeParseToUnix(endTime)+'&step='+step).then(response => {
        this.$refs.metricSet.loading = false;
        if (response.status === 'success') {
          if (response.data.result) {
            this.lineList = response.data.result;
            // 如果只有一组数据，强制显示一条
            if (response.data.result.length === 1) {
              this.chartCount = 'single';
            }
            if (response.data.result.length === 0) {
              this.$refs.editChartSingle.setData(params, [], 0, this.filter,[]);
            }
          }
          this.getChartData(response, params);
        }else {
          this.chartCount = 'single';
          // 图表不可保存
          this.$refs.metricSet.saveDisabled = true;
          this.$refs.metricSet.isSave = false;
          this.chartCount = 'single';
          if(response.msg){
            this.$message.error(response.msg);
          }else if(response.error){
            this.$message.error(response.error);
          }else {
            this.$message.error(response);
          }
          this.$nextTick(() => {
            this.$refs.editChartSingle.setData(params, [], 0, this.filter);
          });
        }
      });
    },

    // 获取一个图表具体数据
    getChartData(response, params) {
      const chartItem = Object.assign({}, params);
      chartItem.title = params.metric;
      const series = [];
      const legend = [];
      // 一个图表
      response.data.result.forEach((queryItem) => {
        const seriesItem = {
          theData: {
            name: '',
            symbol:'none',  //去掉点
            smooth:true,  //曲线变平滑
            data: [],
            type:chartItem.type ? chartItem.type : 'line',
            //visible: true,
            //threshold: null,
            chartTitle:''
          },
          metric_name: '',
        };
        // 图表中每条线的名字,后半部分
        //let host = `${queryItem.metric.__name__}`;//up,
        let host = '';//up,
        let charName='';
        if(queryItem.metric.__name__){
          host = `${queryItem.metric.__name__}`;//up,
          charName = `${queryItem.metric.__name__}`;
        }
        //let charName = `${queryItem.metric.__name__}`;
        const tagsArr = Object.keys(queryItem.metric);//["__name__","asset","idc","instance","job","module","project"]
        // 设置时间-数据格式对
        const dpsArr = Object.entries(queryItem.values);//[ ["0",[1577959830.781,"0"]], ["1",[1577959845.781,"0"]] ]
        // 判断是否有数据, && tagsArr.length > 0
        if (dpsArr.length > 0) {
            if(queryItem.metric.__name__){
              host +="{";
            }
            tagsArr.forEach((tag, i) => {
              if (tag !== '__name__') {
                host += `${tag}="${queryItem.metric[tag]}",`;
              }

              if (tag === 'asset') {
                let labVal= `${queryItem.metric[tag]}`;
                if(labVal!==''){
                  charName += `(${queryItem.metric[tag]})`;
                }
              }
            });
          if(host.endsWith(',')){host = host.substr(0,host.length-1);}
          if(queryItem.metric.__name__){
            host +="}";
          }
          if(!host || host===''){
            host = params.metric;
          }
          let alias = params.metric;
          legend.push({name:host,alias:alias});

          // 图表中每条线的名字,去掉最后的逗号与空格
          seriesItem.theData.name = host;
          seriesItem.theData.chartTitle =charName;
          seriesItem.metric_name = seriesItem.theData.name;
          // 将秒改为毫秒
          seriesItem.theData.data = queryItem.values.map(dpsItem =>
            [dpsItem[0] * 1000, dpsItem[1]]);
          series.push(seriesItem.theData);
        } else {/*
          const errorMsg = `metric： ${params.metric} 和tags ${params.tags} 组合下无数据`;
          this.$message.error({
            duration: 15,
            content: errorMsg,
            closable: true,
          });
          */
        }
      });
      // 将获取的数据运用于创建多个图表备用
      this.$refs.metricSet.setSeries(response.data.result,series);
      if (this.chartCount === 'single') {
        //this.setSize(chartItem.span, 0);
        const filterParams = Object.assign({}, this.filter);
        filterParams.chartCount = 'single';
        this.$nextTick(() => {
          this.$refs.editChartSingle.setData(chartItem, series, 0, filterParams,legend);
        });
      } else if (this.chartCount === 'multiple') {
        const filterParams = Object.assign({}, this.filter);
        filterParams.chartCount = 'multiple';
        this.setSize(chartItem.span, 'all');
        this.$nextTick(() => {
          series.forEach((serieData, index) => {
            // 设置每个图表名称
            const chartInfoParams = Object.assign({}, chartItem);
            chartInfoParams.title = serieData.chartTitle;
            this.$refs.editChartMultiple[index]
              .setData(chartInfoParams, [serieData], 0, filterParams,[legend[index]]);
          });
        });
      }
    },
    // 设置图表的宽度
    setSize(size, index) {
      this.$nextTick(() => {
        const chartBox = document.getElementsByClassName('chartBox');
        if (index === 0) {
          chartBox[index].style.width = `${(size / 12) * 100}%`;
        } else {
          const chartBoxMul = document.getElementsByClassName('chartBoxMul');
          Array.prototype.slice.call(chartBoxMul).forEach((item) => {
            const obj = item;
            obj.style.width = `${(size / 12) * 100}%`;
          });
        }
      });
    },
    refreshChart() {},
    removeChart() {},
    editData() {},
    /*


// 查看指标确认
viewConfirm() {
  this.showTagModal = false;
},
// 取消查看
viewCancel() {
  this.showTagModal = false;
  this.selectedData = {};
},
// 查看详情
viewDetail(item) {
  this.selectedData = item;
},
// eslint-disable-next-line
search: _.debounce(function() { // 输入框筛选
}, 300),
// 刷新
reload() {
  this.getChartParam(this.metricInfo, this.chartCount);
},
// 滚动条复位
refresh_scroll() {
  window.scrollTo(0, 0);
},

 */
  },
  mounted: function() {
    this.getInit();
    this.getPanelData();
  },
  watch: {

  }
}
</script>
