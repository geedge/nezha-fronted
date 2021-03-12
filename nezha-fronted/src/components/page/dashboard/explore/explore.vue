<template>
  <div class="explore" v-has="'explore_view'">
    <div class="main-list main-and-sub-transition">
        <!-- 顶部工具栏 -->
        <div class="top-tools" style="z-index: 1">
          <div class="top-tool-main-right">
            <pick-time :refresh-data-func="expressionChange" v-model="filterTime" @unitChange="chartUnitChange" ref="pickTime" id="explore">
              <template slot="added-text">{{$t('dashboard.metricPreview.runQuery')}}</template>
            </pick-time>
            <button :disabled="saveDisabled" @click="saveChart" type="button" v-has="'explore_chart_toAdd'" id="explore-save-chart"
                    class="nz-btn nz-btn-size-large nz-btn-style-normal nz-btn-min-width-120"
                    :class="{'nz-btn-disabled btn-disabled-cursor-not-allowed' : saveDisabled}">
              {{$t('dashboard.metric.saveChart')}}
            </button>
          </div>
        </div>
        <div style="height: calc(100% - 50px);width: 100%;" >
          <div ref="scrollWrap" style="height: 100%; overflow: auto;">
            <div class="expression-room right-margin" style="padding-top: 5px" id="explore-promql-box">
              <!--坑，这个index居然是从1开始-->
              <promql-input
                v-for="index of promqlKeys.length"
                :ref="'promql-'+(index-1)"
                :id="promqlKeys[index-1]"
                :key="promqlKeys[index-1]"
                :expression-list="expressions"
                :index="index-1"
                :styleType="1"
                :plugins="['metric-selector', 'metric-input', 'add', 'remove', 'copy']"
                @change="expressionChange"
                @addExpression="addExpression"
                @copyExpression="copyExpression"
                @removeExpression="removeExpression"
              ></promql-input>
<!--
            <promql-input
              v-for="index of promqlKeys.length"
              :ref="'promql-'+(index-1)"
              :id="promqlKeys[index-1]"
              :key="promqlKeys[index-1]"
              :expression-list="expressions"
              :index="index-1"
              :styleType="1"
              :history-param="historyParam"
              :plugins="['metric-selector', 'metric-input', 'add', 'remove']"
              @change="expressionChange"
              @addExpression="addExpression"
              @removeExpression="removeExpression"
            ></promql-input>
-->
          </div>
          <div class="chart-view right-margin" v-show="!showIntroduce"
               :class="{'shrink-view':!chartVisible || !defaultChartVisible}" style="position:relative;">
            <div class="view-title" @click="changeChartVisible" style="position:absolute;z-index: 1000;top:10px;"><i class="nz-icon nz-icon-caret-top" ></i>&nbsp;graph</div>
            <div class="chart-room">
              <chart ref="exploreChart" :unit="chartUnit"></chart>
            </div>
          </div>
          <div class="table-view right-margin" v-show="!showIntroduce"
               :class="{'shrink-view':!tableVisible || !defaultTableVisible}" style="position: relative">
            <div class="view-title" @click="changeTableVisible" style="position:absolute;z-index: 1000;top:10px;"><i class="nz-icon nz-icon-caret-top"></i>&nbsp;table</div>
            <div class="table-room">
              <!-- 自定义table列 -->
              <transition name="el-zoom-in-top">
                <element-set
                  class="pop-custom-explore"
                  v-if="tools.showCustomTableTitle"
                  @close="tools.showCustomTableTitle = false"
                  :custom-table-title.sync="tools.customTableTitle"
                  :original-table-title="tableTitle"
                  ref="customTableTitle"
                ></element-set>
              </transition>
              <el-table class="nz-table explore-table"
                        :data="tableData"
                        border
                        ref="exploreTable"
                        tooltip-effect="light"
                        v-loading="tools.loading"
                        style="width: 100%;">
                <el-table-column
                  :resizable="false"
                  v-for="(item, index) in tools.customTableTitle"
                  v-if="item.show"
                  :key="`col-${index}`"
                  :label="item.label"
                  :prop="item.prop"
                  show-overflow-tooltip
                  min-width="110px"
                ></el-table-column>
                <el-table-column width="28" v-if="tools.customTableTitle.length>0">
                  <template slot="header" slot-scope="scope" :resizable="false">
                  <span @mousedown.stop="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)" class="nz-table-gear">
                    <i class="nz-icon nz-icon-gear"></i>
                  </span>
                  </template>
                </el-table-column>
              </el-table>
              <pagination :page-obj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"
                          :append-to-body="false"></pagination>
            </div>
          </div>
          <div class="introduce-view right-margin" v-show="showIntroduce">
            <div class="info-room">
              <div class="col-md-9 doc-content">
                <h1 class="page-header">Query examples<a class="header-anchor" href="https://prometheus.io/docs/prometheus/latest/querying/examples/" target="_blank" rel="noopener norefferrer"><i style="font-size: 16px;" class="nz-icon nz-icon-link1"></i></a></h1>
                <div class="content-divider"></div>
                <h2 >
                  Simple time series selection
                </h2>

                <p>Return all time series with the metric <code>http_requests_total</code>:</p>

                <pre><code>http_requests_total</code></pre>

                <p>Return all time series with the metric <code>http_requests_total</code> and the given<code>job</code> and <code>handler</code> labels:</p>

                <pre><code>http_requests_total{job="apiserver", handler="/api/comments"}</code></pre>

                <p>Return a whole range of time (in this case 5 minutes) for the same vector,
                  making it a range vector:</p>

                <pre><code>http_requests_total{job="apiserver", handler="/api/comments"}[5m]</code></pre>

                <p>Note that an expression resulting in a range vector cannot be graphed directly,
                  but viewed in the tabular ("Console") view of the expression browser.</p>

                <p>Using regular expressions, you could select time series only for jobs whose
                  name match a certain pattern, in this case, all jobs that end with <code>server</code>:</p>

                <pre><code>http_requests_total{job=~".*server"}</code></pre>

                <p>All regular expressions in Prometheus use RE2 syntax.</p>

                <p>To select all HTTP status codes except 4xx ones, you could run:</p>

                <pre><code>http_requests_total{status!~"4.."}</code></pre>

                <h2 >
                  Subquery
                </h2>

                <p>Return the 5-minute rate of the <code>http_requests_total</code> metric for the past 30 minutes, with a resolution of 1 minute.</p>

                <pre><code>rate(http_requests_total[5m])[30m:1m]</code></pre>

                <p>This is an example of a nested subquery. The subquery for the <code>deriv</code> function uses the default resolution. Note that using subqueries unnecessarily is unwise.</p>

                <pre><code>max_over_time(deriv(rate(distance_covered_total[5s])[30s:5s])[10m:])</code></pre>

                <h2 >
                  Using functions, operators, etc.
                </h2>

                <p>Return the per-second rate for all time series with the <code>http_requests_total</code>
                  metric name, as measured over the last 5 minutes:</p>

                <pre><code>rate(http_requests_total[5m])</code></pre>

                <p>Assuming that the <code>http_requests_total</code> time series all have the labels <code>job</code>
                  (fanout by job name) and <code>instance</code> (fanout by instance of the job), we might
                  want to sum over the rate of all instances, so we get fewer output time series,
                  but still preserve the <code>job</code> dimension:</p>

                <pre><code>sum by (job) (rate(http_requests_total[5m]))</code></pre>

                <p>If we have two different metrics with the same dimensional labels, we can apply
                  binary operators to them and elements on both sides with the same label set
                  will get matched and propagated to the output. For example, this expression
                  returns the unused memory in MiB for every instance (on a fictional cluster
                  scheduler exposing these metrics about the instances it runs):</p>

                <pre><code>(instance_memory_limit_bytes - instance_memory_usage_bytes) / 1024 / 1024</code></pre>

                <p>The same expression, but summed by application, could be written like this:</p>

                <pre><code>sum by (app, proc) (instance_memory_limit_bytes - instance_memory_usage_bytes) / 1024 / 1024</code></pre>

                <p>If the same fictional cluster scheduler exposed CPU usage metrics like the following for every instance:</p>

                <pre><code>instance_cpu_time_ns{app="lion", proc="web", rev="34d0f99", env="prod", job="cluster-manager"}
instance_cpu_time_ns{app="elephant", proc="worker", rev="34d0f99", env="prod", job="cluster-manager"}
instance_cpu_time_ns{app="turtle", proc="api", rev="4d3a513", env="prod", job="cluster-manager"}
instance_cpu_time_ns{app="fox", proc="widget", rev="4d3a513", env="prod", job="cluster-manager"}
...
</code></pre>

                <p>...we could get the top 3 CPU users grouped by application (<code>app</code>) and process type (<code>proc</code>) like this:</p>

                <pre><code>topk(3, sum by (app, proc) (rate(instance_cpu_time_ns[5m])))</code></pre>

                <p>Assuming this metric contains one time series per running instance, you could count the number of running instances per application like this:</p>

                <pre><code>count by (app) (instance_cpu_time_ns)</code></pre>

              </div>
            </div>
          </div>
      </div>
        </div>

    </div>
    <transition name="right-box">
      <chart-box :chart="chart" :from="$CONSTANTS.fromRoute.explore" :panel-data="panelData" :show-panel="{id: -1, name: '', type: 'explore'}" @close="handleBox(false)" @on-create-success="createSuccess" ref="addChartModal" v-if="rightBox.show"></chart-box>
    </transition>
  </div>
</template>

<script>
  import bus from "../../../../libs/bus";
  import promqlInput from "./promqlInput";
  // import promqlInputPlus from "./promqlInputPlus";
  import chart from "../overview/chart";
  import axios from 'axios';
  import chartBox from "../../../page/dashboard/chartBox";
  import {getUUID} from "../../../common/js/common";
  import chartDataFormat from "../../../charts/chartDataFormat";

  export default {
    name: "explore",
    components: {
      'promql-input': promqlInput,
      'chart': chart,
      'chart-box': chartBox,
    },
    data() {
      return {
        rightBox: { //面板弹出框相关
          show: false,
        },
        promqlCount: 1,
        promqlKeys: [],
        expressions: [''],
        filterTime: [
          bus.timeFormate(bus.getOffsetTimezoneData(-1),'yyyy-MM-dd hh:mm:ss'),
          bus.timeFormate(bus.getOffsetTimezoneData(),'yyyy-MM-dd hh:mm:ss')
        ],

        /*工具参数*/
        tools: {
          loading: false, //是否显示table加载动画
          showCustomTableTitle: false, //自定义列弹框是否显示
          customTableTitle: [], //自定义列工具的数据
        },
        tableTitle: [],
        showIntroduce: true,
        defaultChartVisible: true,
        defaultTableVisible: true,
        chartVisible: true,
        tableVisible: true,
        pageObj: {
          pageNo: 1,
          pageSize: this.$CONSTANTS.defaultPageSize,
          total: 0
        },
        tableData: [],
        saveDisabled: true,
        panelData: [],
        chartUnit:0,
        historyParam:{useHistory:true,key:'expore-history'},
        chart: {},
        metricOptions: []
      }
    },
    created() {
      this.getPanelData();
      this.queryMetrics();
      this.promqlKeys.push(getUUID());
    },
    methods: {
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.tableData = this.filterShowData(this.storedTableData, this.pageObj)
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        this.tableData = this.filterShowData(this.storedTableData, this.pageObj)
      },
      filterShowData(source, pageObj) {
        return source.slice((pageObj.pageNo - 1) * pageObj.pageSize, pageObj.pageNo * pageObj.pageSize)
      },
      chartUnitChange:function(unit){
        this.chartUnit=unit;
        this.$nextTick(()=>{
          this.expressionChange()
        })
      },
      queryChartData: function () {
        this.$refs.exploreChart.startLoading();
        setTimeout(() => {
          if (this.expressions.length > 0) {
            let requestArr = [];
            let promqlInputIndexs=[];
            let queryExpression=[];
            this.expressions.forEach((item, index) => {
              if (item != '') {
                let step=bus.getStep(this.filterTime[0],this.filterTime[1]);
                promqlInputIndexs.push(index);
                queryExpression.push(item)
                requestArr.push(this.$get('/prom/api/v1/query_range?query=' + item + '&start=' + this.$stringTimeParseToUnix(this.filterTime[0]) + '&end=' + this.$stringTimeParseToUnix(this.filterTime[1]) + '&step='+step))
              }
            })
            if (requestArr.length > 0) {
              this.showIntroduce = false;
              this.saveDisabled = false;
            }
            axios.all(requestArr).then(res => {
              let series = [];
              let legend = [];
              if (res.length > 0) {
                res.forEach((response, index) => {
                  let promqlIndex=promqlInputIndexs[index];
                  if (response.data&&response.status == 'success') {
                    let data = response.data.result;
                    if((!data||data.length<1)&&response.message){
                      this.$refs['promql-'+promqlIndex][0].setError(response.message)
                      return;
                    }
                    data.forEach((result, i) => {
                      let seriesItem = {
                        name: '',
                        symbol:'emptyCircle',  //去掉点
                        symbolSize:[2,2],
                        showSymbol:false,
                        smooth: 0.2,  //曲线变平滑
                        data: [],
                        lineStyle: {
                          width: 1,
                          opacity: 0.9
                        },
                        type: 'line',
                      }
                      let legendName="";
                      seriesItem.data = result.values.map((item) => {
                        return [item[0] * 1000, item[1]];
                      })
                      if(result.metric&&Object.keys(result.metric).length>0){
                        let metric = Object.assign({}, result.metric);
                        seriesItem.name += metric.__name__?metric.__name__:'';
                        seriesItem.name +='{'
                        delete metric.__name__;
                        for (let key in metric) {
                          seriesItem.name += key + "=" + '"' + metric[key] + '",';
                        }
                        legendName = seriesItem.name.substr(0, seriesItem.name.length - 1);
                        legendName += "}"
                      }else{
                        legendName=queryExpression[index]
                      }
                      seriesItem.name=legendName+"-"+index;
                      series.push(seriesItem);
                      legend.push({name: seriesItem.name, alias: legendName, isGray: false});
                    })

                    this.$refs['promql-'+promqlIndex][0].setError('')
                  }else{
                    //console.log(response)
                    this.$refs['promql-'+promqlIndex][0].setError(response.error)
                  }
                })

                  this.$refs.exploreChart.setLegend(legend);
                  this.$refs.exploreChart.setRandomColors(series.length)
                  this.$refs.exploreChart.setSeries(series)
                  this.defaultChartVisible = true;

              }
              this.$refs.exploreChart.endLoading();
            })
          }
        }, 200)
      },
      queryTableData: function () {
        this.tools.loading = true,
          setTimeout(() => {
            if (this.expressions.length > 0) {
              let requestArr = [];
              this.expressions.forEach((item, index) => {
                if (item != '') {
                  requestArr.push(this.$get('/prom/api/v1/query?query=' + item))
                }
              })
              if (requestArr.length > 0) {
                this.showIntroduce = false;
              }
              axios.all(requestArr).then(res => {
                let tData = [];
                let tLabels = [];
                if (res.length > 0) {
                  this.tableData = [];
                  this.tableTitle = [];
                  //console.log(111111111111111111111,res)
                  res.forEach((response, index) => {
                    if (response.data&&response.status == 'success') {
                      let data = response.data.result;
                      if (data) {
                        data.forEach((result, i) => {
                          let metrics = Object.assign({}, result.metric);
                          this.$set(metrics, 'value#' + index, chartDataFormat.getUnit(this.chartUnit).compute(result.value[1],null,2));
                          for (let key in metrics) {
                            let label = {
                              label: key == '__name__' ? 'metric' : key,
                              prop: key,
                              show: true,
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
                  if(tData.length>0){
                    this.storedTableData = Object.assign([], tData);
                    this.pageObj.total = this.storedTableData.length;
                    this.tableData = this.filterShowData(this.storedTableData, this.pageObj);
                    this.tableTitle = Object.assign([], tLabels);
                    this.tools.customTableTitle = Object.assign([], tLabels);
                    this.defaultTableVisible = true;
                  }else{
                    // this.defaultTableVisible = false;
                  }
                }
                this.tools.loading = false;
              })
            }
          }, 200)
      },
      expressionChange: function () {
        let nowTimeType=this.$refs.pickTime.$refs.timePicker.nowTimeType;
        //console.log(this.filterTime,nowTimeType);
        this.setSearchTime(nowTimeType.type,nowTimeType.value);
        if (this.expressions && this.expressions.length >= 1) {
          this.queryTableData();
          this.queryChartData()
          this.storeHistory();
        }
      },
      setSearchTime(type,val){//设置searchTime
        if(type==='minute'){
          let startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - val),'yyyy-MM-dd hh:mm:ss');
          let endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())),'yyyy-MM-dd hh:mm:ss');
          this.$set(this.filterTime, 0, startTime);
          this.$set(this.filterTime, 1, endTime);
          this.$set(this.filterTime, 2, val + "m");
        }else if(type==='hour'){
          let startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - val),'yyyy-MM-dd hh:mm:ss');
          let endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())),'yyyy-MM-dd hh:mm:ss');
          this.$set(this.filterTime, 0, startTime);
          this.$set(this.filterTime, 1, endTime);
          this.$set(this.filterTime, 2, val + "h");
        }else if(type==='date'){
          let startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setDate(new Date(bus.computeTimezone(new Date().getTime())).getDate() - val),'yyyy-MM-dd hh:mm:ss');
          let endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())),'yyyy-MM-dd hh:mm:ss');
          this.$set(this.filterTime, 0, startTime);
          this.$set(this.filterTime, 1, endTime);
          this.$set(this.filterTime, 2, val + "d");
        }
        this.$refs.pickTime.$refs.timePicker.searchTime=this.filterTime;
      },
      storeHistory:function(){
        let expire=24;
        let historyJson=localStorage.getItem(this.historyParam.key);
        let expressions=this.expressions.filter(item=>{
          return item&&item != '';
        })
        let username=sessionStorage.getItem("nz-username");
        if(historyJson && historyJson != 'undefined' && historyJson != ''){
          let historyObj=JSON.parse(historyJson);
          let history = historyObj[username];
          if(history){
            //过滤过期表达式
            history=history.filter(item=>{
              return item.time + item.expire >= new Date().getTime();
            })
            let repeat=history.filter(item=>{
              return expressions.includes(item.insertText)
            })
            let old=history.filter(item=>{
              return !expressions.includes(item.insertText)
            })

            let freshExpression=expressions.filter(item=>{
              let find=history.find(t=>{return t.insertText == item});
              return !find
            })

            repeat=repeat.map(item=>{
              item.time=new Date().getTime();
              item.num+=1;
              item.documentation=this.$t('dashboard.metricPreview.historyTip',{time:item.num,hour:24});
              return item;
            })

            let fresh=freshExpression.map(item=>{
              return{
                label:item,
                insertText:item,
                documentation:this.$t('dashboard.metricPreview.historyTip',{time:1,hour:24}),
                num:1,
                time:new Date().getTime(),
                expire:expire * 60 * 60 * 1000
              }
            })

            historyObj[username]=fresh.concat(repeat).concat(old);
          }else{
            let history=expressions.map(item=>{
              return {
                label:item,
                insertText:item,
                documentation:this.$t('dashboard.metricPreview.historyTip',{time:1,hour:24}),
                num:1,
                time:new Date().getTime(),
                expire:expire * 60 * 60 * 1000
              }
            })
            historyObj[username]=history;
          }
          localStorage.setItem(this.historyParam.key,JSON.stringify(historyObj))
        }else{
          let history=expressions.map(item=>{
            return {
              label:item,
              insertText:item,
              documentation:this.$t('dashboard.metricPreview.historyTip',{time:1,hour:24}),
              num:1,
              time:new Date().getTime(),
              expire:expire * 60 * 60 * 1000
            }
          })
          if(history&&history.length>0){
            let stored={};
            stored[username]=history;
            localStorage.setItem(this.historyParam.key,JSON.stringify(stored))
          }
        }
      },
      addExpression(index) {
        this.expressions.splice(index + 1, 0, '');
        this.promqlKeys.splice(index + 1, 0, getUUID());
        this.promqlCount++;
      },
      copyExpression(index) {
        this.expressions.push(this.expressions[index]);
        this.promqlKeys.push(getUUID());
        this.promqlCount++;
      },
      removeExpression(index) {
        if (this.promqlCount > 1) {
          this.expressions.splice(index, 1);
          this.promqlKeys.splice(index, 1);
          this.promqlCount--;
        }
      },
      changeChartVisible: function () {
        this.chartVisible = !this.chartVisible;
      },
      changeTableVisible: function () {
        this.tableVisible = !this.tableVisible;
      },
      handleBox(show) {
        this.rightBox.show = show;
      },
      saveChart() {
        let chart = {
          title: '',
          type:'line',
          span:12,
          height:'400',
          unit: this.chartUnit,
          param:{
            url:'',
            threshold:'',
          },
          elements:[],
          panel: '',
          sync: 0
        };
        this.expressions.forEach((exp) => {
          chart.elements.push({expression: exp, legend: "", type: "expert", id: ""});
        });
        this.chart = chart;
        this.rightBox.show = true;
      },
      createSuccess(type, response, param, panel) { //添加chart成功
        this.$confirm(this.$t("dashboard.metric.goPanelTip"), this.$t("tip.saveSuccess"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'success'
        }).then(() => {
          bus.$emit("menu-change", 'panel');
          this.$store.commit("panelShowPanelChange", panel);
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
      queryMetrics() {
        this.metricOptions = [];
        this.$get('prom/api/v1/label/__name__/values').then(response=>{
          if(response.status == 'success'){
            let metrics = response.data.sort();
            let metricMap=new Map();
            metrics.forEach((item)=>{
              let key='';
              if(/^[a-zA-Z]+?_[a-zA-Z]*/.test(item)){
                key=item.split('_')[0];
              }else if(/^_\w*/.test(item)){
                key='      ';
              }else{
                key=item;
              }
              if(metricMap.get(key)){
                let values=metricMap.get(key);
                values.push({label:item,value:item});
              }else{
                let values=[{label:item,value:item}];
                metricMap.set(key,values);
              }
              //this.metricStore.push({label:item,value:item,insertText:item})
            });
            for(let key of metricMap.keys()){
              let option={
                label:key,
                value:key,
              }
              if(metricMap.get(key) && metricMap.get(key).length>1){
                option.children=metricMap.get(key);
              }
              this.metricOptions.push(option);
            }
          }
        })
      },
      getMetricOptions() {
        return this.metricOptions;
      }
    },
    watch: {
      promqlCount: function (n, o) {
        this.expressionChange();
      },
      expressions: {
        immediate: true,
        handler: function (n, o) {
          if (n.length == 1 && (!n[0] || n[0] == '')) {
            this.showIntroduce = true
          } else if (n.length > 1) {
            let temp = n.find((item, index) => {
              return item != ''
            });
            if (!temp) {
              this.showIntroduce = true;
            } else {
              this.showIntroduce = false;
            }
          } else {
            this.showIntroduce = false;
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
    height: 400px
  }

  .explore .chart-view, .table-view {
    padding: 22px 10px 10px 10px;
    border: 1px solid lightgrey;
    box-sizing: inherit;
    margin-bottom: 5px;
    transition: height 1s;
  }
  .explore .chart-view:hover,.explore .table-view:hover {
    cursor: default;
  }
  .shrink-view {
    height: 30px;

    .view-title i {
      transform: rotate(180deg);
    }

    .chart-room, .table-room {
      height: 0px;
      visibility: hidden;
    }

  }
  .table-room {
    position: relative;
    margin-top: 10px;
  }
  .explore .view-title {
    font-weight: 500;
    margin-right: 8px;
    font-size: 14px;
    box-shadow: none;
  }

  .introduce-view .info-room {
    padding: 24px;
    background-color: #e9edf2;
    border-top: 3px solid #3274d9;
    margin-bottom: 16px;
    -webkit-box-shadow: -1px -1px 0 0 hsla(0, 0%, 100%, .1), 1px 1px 0 0 rgba(0, 0, 0, .1);
    box-shadow: -1px -1px 0 0 hsla(0, 0%, 100%, .1), 1px 1px 0 0 rgba(0, 0, 0, .1);
    -webkit-box-flex: 1;
    -webkit-flex-grow: 1;
    -ms-flex-positive: 1;
    flex-grow: 1;
  }

  .info-room .cheat-sheet-item__title {
    font-size: 21px;
  }

  .info-room .cheat-sheet-item__label {
    font-size: 13px;
  }

  .info-room code {
    font-family: Menlo, Monaco, Consolas, Courier New, monospace;
    font-size: 11px;
    background-color: #e9edf2;
    color: #52545c;
    border: 1px solid #c7d0d9;
    border-radius: 4px;
  }
  .right-margin{
    margin-right: 15px;
  }
  /*外部引用 样式start*/
  .doc-content {
    font-size: 16px;
  }

  .doc-content p, .doc-content.ul, .doc-content .alert {
    margin: 15px 0 15px 0;
    line-height: 1.5;
  }

  .doc-content .content-divider{
    height: 1px;
    width:100%;
    border-bottom: 2px solid #C0C4CC;
    margin: 5px 0px;
  }

  .doc-content > h1 {
    color: #e6522c;
    font-size: 30px;
    text-transform: uppercase;
  }

  .doc-content > h1 a {
    color: #000 !important;
  }

  .doc-content.blog > h1 {
    text-transform: none;
  }

  .doc-content.blog .sponsor-logos > a > img {
    width: 250px;
    display: inline-block !important;
    margin: 15px 55px;
  }
  .doc-content > h1 {
    color: #e6522c;
    font-size: 22px;
  }

  .doc-content > h2 {
    color: #e6522c;
    font-size: 18px;
  }

  .doc-content > h2 code {
    color: #e6522c;
    background: none;
  }

  .doc-content > h3 {
    font-size: 20px;
    font-weight: bold;
  }

  .doc-content > h4 {
    font-weight: bold;
    font-size: 18px;
    margin-top: 20px;
  }

  .doc-content a.header-anchor {
    padding-left: 15px;
    color: gray;
    text-decoration: none;
  }


  .doc-content a.header-anchor:link,
  .doc-content a.header-anchor:visited {
    /*visibility: hidden;*/
  }

  .doc-content h1:hover a.header-anchor:hover,
  .doc-content h2:hover a.header-anchor:hover,
  .doc-content h3:hover a.header-anchor:hover,
  .doc-content h4:hover a.header-anchor:hover,
  .doc-content h5:hover a.header-anchor:hover,
  .doc-content h6:hover a.header-anchor:hover {
    /*color: #000;*/
  }

  .doc-content h1:hover a.header-anchor,
  .doc-content h2:hover a.header-anchor,
  .doc-content h3:hover a.header-anchor,
  .doc-content h4:hover a.header-anchor,
  .doc-content h5:hover a.header-anchor,
  .doc-content h6:hover a.header-anchor {
    /*color: #999;*/
    /*visibility: visible;*/
  }

  .doc-content img {
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    display: block;
  }

  .doc-content img.orig-size {
    width: auto;
    margin-left: 0;
  }

  .doc-content .open-source-notice {
    color: #666;
    background-color: #f5f5f5;
    text-align: center;
    padding: 0.8em;
    margin-top: 1.5em;
  }

  .toc {
    padding: 1em;
    background-color: #f5f5f5;
  }

  .toc-right {
    float: right;
    width: 40%;
    margin: 0 0 0.5em 0.5em;
  }

  .toc ul {
    padding: 0 0 0 1.5em;
    margin: 0;
  }

  .toc a code {
    color: #337ab7;
    background-color: transparent;
  }

  pre {
    border: 1px solid #ddd;
    border-left: 4px solid #e6522c;
    border-radius: 0;
    font-family: "Courier New", Monaco, Menlo, Consolas, monospace;
    background-color: #f5f5f5;
    color: #333;
    padding: 15px;
  }

  pre code {
    white-space: pre;
  }

  code {
    color: #333;
  }

  aside {
    color: #888;
    padding-bottom: 8px;
    border-bottom: 1px solid #aaa;
  }

  article {
    margin: 10px 0 60px 0;
  }

  /*外部引用 样式end*/
</style>
<style>
  .explore-table tr td .cell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
