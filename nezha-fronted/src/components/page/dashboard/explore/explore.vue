<template>
  <div class="explore">
    <left-menu>
      <div slot="content-left" class="slot-content">
        <div class="sidebar-title">{{$t('dashboard.title')}}</div>
        <div class="sidebar-info">
          <div class="sidebar-info-item " @click="jumpTo('overview')">{{$t('dashboard.overview.title')}}</div>
          <div class="sidebar-info-item" @click="jumpTo('panel')">{{$t('dashboard.panel.title')}}</div>
          <div class="sidebar-info-item sidebar-info-item-active" >{{$t('dashboard.metricPreview.title')}}</div>
        </div>
      </div>
      <div slot="content-right" class="slot-content">
        <div class="main-list main-and-sub-transition">
          <el-scrollbar style="height: 100%">
            <!-- 顶部工具栏 -->
            <div class="top-tools" style="z-index: 1">
              <button :disabled="saveDisabled" type="button" @click="saveChart" class="nz-btn nz-btn-size-large nz-btn-style-normal nz-btn-min-width-120" :class="{'nz-btn-disabled btn-disabled-cursor-not-allowed' : saveDisabled}">
                {{$t('dashboard.metric.saveChart')}}
              </button>
              <div class="nz-btn-group nz-btn-group-size-normal nz-btn-group-light margin-r-20">
                <button style="border-right: 1px solid rgba(162,162,162,0.50);" type="button"
                        class="nz-btn nz-btn-size-normal nz-btn-style-light" @click="expressionChange">
                  <i style="font-size: 12px" class="global-active-color nz-icon nz-icon-refresh"></i>
                </button>
                <el-popover
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

              <el-date-picker size="mini" ref="calendar"
                              format="yyyy/MM/dd HH:mm"
                              @change="dateChange"
                              v-model="searchTime"
                              type="datetimerange"
                              :picker-options="pickerOptions"
                              :range-separator="$t('dashboard.panel.to')"
                              :start-placeholder="$t('dashboard.panel.startTime')"
                              :end-placeholder="$t('dashboard.panel.endTime')"
                              style="margin-right: 20px"
                              align="right">
              </el-date-picker>
            </div>
            <div class="expression-room">
              <promql-input
                v-for="index of promqlCount"
                :key="expressions[index]"
                :expression-list="expressions"
                :index="index"
                @change="expressionChange"
                @addExpression="addExpression"
                @removeExpression="removeExpression"
              ></promql-input>
            </div>
            <div class="chart-view " v-show="!showIntroduce" :class="{'shrink-view':!chartVisible || !defaultChartVisible}">
              <div class="view-title" @click="changeChartVisible"><i class="el-icon-caret-top"></i>&nbsp;graph</div>
              <div class="chart-room">
                <chart ref="exploreChart"></chart>
              </div>
            </div>
            <div class="table-view " v-show="!showIntroduce" :class="{'shrink-view':!tableVisible || !defaultTableVisible}">
              <div class="view-title" @click="changeTableVisible"><i class="el-icon-caret-top"></i>&nbsp;table</div>
              <div class="table-room">
                <el-table class="nz-table explore-table"
                          :data="tableData"
                          border
                          ref="exploreTable"
                          tooltip-effect="light"
                          v-scrollBar:el-table="'large'"
                          v-loading="tableLoading"
                          style="width: 100%;">
                  <el-table-column
                    :resizable="false"
                    v-for="(item, index) in tableLabels"
                    :key="`col-${index}`"
                    :label="item.label"
                    :prop="item.prop"
                    show-overflow-tooltip
                    min-width="110px"
                  ></el-table-column>
                </el-table>
                <pagination :page-obj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination" :append-to-body="false"></pagination>
              </div>
            </div>
            <div class="introduce-view" v-show="showIntroduce">
              <div class="info-room">
                <div><h2>PromQL Cheat Sheet</h2>
                  <div class="cheat-sheet-item">
                    <div class="cheat-sheet-item__title">Request Rate</div>
                    <div class="cheat-sheet-item__example"><code>rate(http_request_total[5m])</code></div>
                    <div class="cheat-sheet-item__label">Given an HTTP request counter, this query calculates the
                      per-second average request rate over the last 5 minutes.
                    </div>
                  </div>
                  <div class="cheat-sheet-item">
                    <div class="cheat-sheet-item__title">95th Percentile of Request Latencies</div>
                    <div class="cheat-sheet-item__example"><code>histogram_quantile(0.95,
                      sum(rate(prometheus_http_request_duration_seconds_bucket[5m])) by (le))</code></div>
                    <div class="cheat-sheet-item__label">Calculates the 95th percentile of HTTP request rate over 5
                      minute windows.
                    </div>
                  </div>
                  <div class="cheat-sheet-item">
                    <div class="cheat-sheet-item__title">Alerts Firing</div>
                    <div class="cheat-sheet-item__example"><code>sort_desc(sum(sum_over_time(ALERTS{alertstate="firing"}[24h]))
                      by (alertname))</code></div>
                    <div class="cheat-sheet-item__label">Sums up the alerts that have been firing over the last 24
                      hours.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
        <chart-box ref="addChartModal" :panel-data="panelData" @on-create-success="createSuccess" ></chart-box>
      </div>
    </left-menu>
  </div>
</template>

<script>
  import bus from "../../../../libs/bus";
  import promqlInput from "./promqlInput";
  import chart from "../overview/chart";
  import axios from 'axios';
  import chartBox from "../../../page/dashboard/chartBox";
  export default {
    name: "explore",
    components: {
      'promql-input': promqlInput,
      'chart': chart,
      'chart-box':chartBox,
    },
    data() {
      return {
        promqlCount: 1,
        expressions: [''],
        searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],
        filterTime: {},
        visible: false,
        showIntroduce:true,
        defaultChartVisible:true,
        defaultTableVisible:true,
        chartVisible: true,
        tableVisible: true,
        pageObj: {
          pageNo: 1,
          pageSize: 20,
          total: 0
        },
        tableData: [],
        tableLabels: [],
        tableLoading: false,
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
        saveDisabled:true,
        panelData:[],
        pickerOptions: {
          shortcuts: [
            {
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
            }],
        },
      }
    },
    created() {
      this.filterTime.startTime = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss');
      this.filterTime.endTime = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss');
      this.getPanelData();
    },
    methods: {
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.tableData=this.filterShowData(this.storedTableData,this.pageObj)
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        this.tableData=this.filterShowData(this.storedTableData,this.pageObj)
      },
      filterShowData(source,pageObj){
        return source.slice((pageObj.pageNo-1)*pageObj.pageSize,pageObj.pageNo*pageObj.pageSize)
      },
      queryChartData: function () {
        this.$refs.exploreChart.startLoading();
        setTimeout(() => {
          if (this.expressions.length > 0) {
            let requestArr = [];
            this.expressions.forEach((item, index) => {
              if (item != '') {
                requestArr.push(axios.get('/prom/api/v1/query_range?query=' + item + '&start=' + this.filterTime.startTime + '&end=' + this.filterTime.endTime + '&step=15'))
              }
            })
            if(requestArr.length>0){
              this.showIntroduce=false;
              this.saveDisabled=false;
            }
            axios.all(requestArr).then(res => {
              let series = [];
              let legend = [];
              if (res.length > 0) {
                res.forEach((response, index) => {
                  if (response.data.status == 'success') {
                    let data = response.data.data.result;
                    data.forEach((result, index) => {
                      let seriesItem = {
                        name: '',
                        symbol: 'none',  //去掉点
                        smooth: true,  //曲线变平滑
                        data: [],
                        type: 'line',
                      }
                      seriesItem.data = result.values.map((item) => {
                        return [item[0] * 1000, item[1]];
                      })
                      // console.log(seriesItem);
                      let metric = Object.assign({}, result.metric);
                      seriesItem.name += metric.__name__ + '{';
                      delete metric.__name__;
                      for (let key in metric) {
                        seriesItem.name += key + "=" + '"' + metric[key] + '",';
                      }
                      seriesItem.name = seriesItem.name.substr(0, seriesItem.name.length - 1);
                      seriesItem.name += "}";
                      series.push(seriesItem);
                      legend.push({name: seriesItem.name, alias: null, isGray: false});
                    })
                  }
                })
                this.$refs.exploreChart.setLegend(legend);
                this.$refs.exploreChart.setSeries(series)
              }
              this.defaultChartVisible=true;
              this.$refs.exploreChart.endLoading();
            })
          }
        }, 200)
      },
      queryTableData: function () {
        this.tableLoading = true,
          setTimeout(() => {
            if (this.expressions.length > 0) {
              console.log(this.expressions)
              let requestArr = [];
              this.expressions.forEach((item, index) => {
                if (item != '') {
                  requestArr.push(axios.get('/prom/api/v1/query?query=' + item))
                }
              })
              if(requestArr.length>0){
                this.showIntroduce=false;
              }
              axios.all(requestArr).then(res => {
                let tData = [];
                let tLabels = [];
                if (res.length > 0) {
                  this.tableData = [];
                  this.tableLabels = [];
                  res.forEach((response, index) => {
                    if (response.data.status == 'success') {
                      let data = response.data.data.result;
                      if (data) {
                        data.forEach((result, i) => {
                          let metrics = Object.assign({}, result.metric);
                          this.$set(metrics, 'value#' + index, result.value[1]);
                          for (let key in metrics) {
                            let label = {
                              label: key,
                              prop: key
                            }
                            let temp = tLabels.find((item, index) => {
                              return item.prop == label.prop
                            });
                            if (!temp) {
                              tLabels.push(label)
                            }
                          }
                          tData.push(metrics);
                        })
                      }
                    }
                    tLabels.sort((a, b) => {
                      return a.prop.charCodeAt(0) - b.prop.charCodeAt(0);
                    })
                  })
                  this.storedTableData=Object.assign([],tData);
                  this.pageObj.total=this.storedTableData.length;
                  this.tableData = this.filterShowData(this.storedTableData,this.pageObj);
                  this.tableLabels = tLabels;
                }
                this.defaultTableVisible=true;
                this.tableLoading = false;
              })
            }
          }, 200)
      },
      expressionChange: function () {
        if (this.expressions && this.expressions.length >= 1) {
          this.queryTableData();
          this.queryChartData()
        }
      },
      addExpression: function (index) {
        this.expressions.splice(index + 1, 0, '');
        this.promqlCount++;
      },
      removeExpression: function (index) {
        if (this.promqlCount > 1) {
          this.expressions.splice(index, 1);
          this.promqlCount--;
        }
      },
      dateChange(time) {
        this.filterTime.startTime = bus.timeFormate(time[0], 'yyyy-MM-dd hh:mm:ss');
        this.filterTime.endTime = bus.timeFormate(time[1], 'yyyy-MM-dd hh:mm:ss');
        this.expressionChange();
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
        this.filterTime.startTime = startTime;
        this.filterTime.endTime = endTime;
        //刷新数据
        this.expressionChange();
      },
      changeChartVisible:function(){
        this.chartVisible=!this.chartVisible;
      },
      changeTableVisible:function(){
        this.tableVisible=!this.tableVisible;
      },
      saveChart:function(){
        this.$refs.addChartModal.setTitle(this.$t("dashboard.panel.createChartTitle"));
        this.$refs.addChartModal.show(true);
        let metricInfo = {};
        metricInfo.elements = [];
        // {"metric":"ALERTS_FOR_STATE","elements":[{"expression":"ALERTS_FOR_STATE{project='kafka',module='node_exporter'}","type":"normal"}]}
        for(let i = 0; i < this.expressions.length; i++) {
          if(this.expressions[i] != ''){
            let type = 'expert';
            metricInfo.metric=this.expressions[i];
            metricInfo.elements.push({expression: this.expressions[i], type: type});
          }
        }
        console.log(metricInfo)
        this.$refs.addChartModal.createData(-1, metricInfo);
      },
      createSuccess(type, response, param, panel) { //添加chart成功
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
      getPanelData() { //获取panel数据
        this.$get('panel?pageNo=1&pageSize=-1').then(response => {
          if (response.code === 200) {
            this.panelData = response.data.list;
          }
        });
      },
      jumpTo(data, id) {
        bus.$emit("menu-change", data);
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
    },
    watch: {
      promqlCount: function (n, o) {
        this.expressionChange();
      },
      expressions:{
        immediate:true,
        handler:function(n,o){
          if(this.promqlCount == 1 && (!n[0]|| n[0] =='')){
            this.showIntroduce=true
          }else if(this.promqlCount>1){
            let temp=n.find((item,index)=>{item != ''});
            if(typeof temp != undefined){
              this.showIntroduce=false;
            }else{
              this.showIntroduce=true;
            }
          }else{
            this.showIntroduce=false;
          }
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  .explore {
    height: 100%;
  }

  .explore .chart-room {
    width: 100%;
    height: 500px
  }

  .explore .chart-view, .table-view{
    padding: 10px;
    border: 1px solid lightgrey;
    box-sizing: inherit;
    margin-bottom: 5px;
    transition: height 1s;
  }
  .shrink-view{
    height: 30px;
    .view-title i{
      transform: rotate(180deg);
    }
    .chart-room,.table-room{
      height: 0px;
      visibility: hidden;
    }

  }
  .explore .view-title {
    font-weight: 500;
    margin-right: 8px;
    font-size: 14px;
    box-shadow: none;
  }
  .introduce-view .info-room{
    padding: 24px;
    background-color: #e9edf2;
    border-top: 3px solid #3274d9;
    margin-bottom: 16px;
    margin-right: 4px;
    -webkit-box-shadow: -1px -1px 0 0 hsla(0,0%,100%,.1), 1px 1px 0 0 rgba(0,0,0,.1);
    box-shadow: -1px -1px 0 0 hsla(0,0%,100%,.1), 1px 1px 0 0 rgba(0,0,0,.1);
    -webkit-box-flex: 1;
    -webkit-flex-grow: 1;
    -ms-flex-positive: 1;
    flex-grow: 1;
  }
  .info-room .cheat-sheet-item__title {
    font-size: 21px;
  }
  .info-room .cheat-sheet-item__label{
    font-size: 13px;
  }
  .info-room code{
    font-family: Menlo,Monaco,Consolas,Courier New,monospace;
    font-size: 11px;
    background-color: #e9edf2;
    color: #52545c;
    border: 1px solid #c7d0d9;
    border-radius: 4px;
  }
  .popover_ul li {
    padding: 10px 3px;
    cursor: pointer;
  }

  .popover_ul li:hover {
    background: $dropdown-hover-background-color !important;
    color: $global-text-color-active !important;
  }
</style>
<style>
  .explore-table tr td .cell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
