<template>
  <div class="explore">
    <left-menu>
      <div slot="content-left" class="slot-content">
        <div class="sidebar-title">{{$t('dashboard.title')}}</div>
        <div class="sidebar-info">
          <div class="sidebar-info-item " @click="jumpTo('overview')">{{$t('dashboard.overview.title')}}</div>
          <div class="sidebar-info-item" @click="jumpTo('panel')">{{$t('dashboard.panel.title')}}</div>
          <div class="sidebar-info-item sidebar-info-item-active">{{$t('dashboard.metricPreview.title')}}</div>
        </div>
      </div>
      <div slot="content-right" class="slot-content">
        <div class="main-list main-and-sub-transition">
            <!-- 顶部工具栏 -->
            <div class="top-tools" style="z-index: 1">
              <button :disabled="saveDisabled" type="button" @click="saveChart"
                      class="nz-btn nz-btn-size-large nz-btn-style-normal nz-btn-min-width-120"
                      :class="{'nz-btn-disabled btn-disabled-cursor-not-allowed' : saveDisabled}">
                {{$t('dashboard.metric.saveChart')}}
              </button>
              <interval-refresh :refresh-data-func="expressionChange" v-model="filterTime">
                <template slot="added-text">{{$t('dashboard.metricPreview.runQuery')}}</template>
              </interval-refresh>
            </div>
            <div style="height: 100%;width: 100%;" >
              <el-scrollbar style="height: 100%" class="el-scrollbar-large">
              <div class="expression-room right-margin" style="padding-top: 5px">
                <!--坑，这个index居然是从1开始-->
                <promql-input
                  v-for="index of promqlKeys.length"
                  :id="promqlKeys[index-1]"
                  :key="promqlKeys[index-1]"
                  :expression-list="expressions"
                  :index="index-1"
                  @change="expressionChange"
                  @addExpression="addExpression"
                  @removeExpression="removeExpression"
                ></promql-input>
              </div>
              <div class="chart-view right-margin" v-show="!showIntroduce"
                   :class="{'shrink-view':!chartVisible || !defaultChartVisible}">
                <div class="view-title" @click="changeChartVisible"><i class="el-icon-caret-top"></i>&nbsp;graph</div>
                <div class="chart-room">
                  <chart ref="exploreChart"></chart>
                </div>
              </div>
              <div class="table-view right-margin" v-show="!showIntroduce"
                   :class="{'shrink-view':!tableVisible || !defaultTableVisible}">
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
                      v-for="(item, index) in showTableLabels"
                      v-if="item.show"
                      :key="`col-${index}`"
                      :label="item.label"
                      :prop="item.prop"
                      show-overflow-tooltip
                      min-width="110px"
                    ></el-table-column>
                    <el-table-column width="28" v-if="showTableLabels.length>0">
                      <template slot="header" slot-scope="scope" :resizable="false">
                      <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">
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
          </el-scrollbar>
            </div>

        </div>
        <chart-box ref="addChartModal" :panel-data="panelData" @on-create-success="createSuccess"></chart-box>
        <element-set
          :allowed-all="true"
          v-clickoutside="elementsetHide"
          :dropCol="dropCol"
          @tablelable="tablelabelEmit"
          :table-title="tableLabels"
          ref="elementset"
        ></element-set>
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
      'chart-box': chartBox,
    },
    data() {
      return {
        promqlCount: 1,
        promqlKeys: [],
        expressions: [''],
        filterTime: [new Date().setHours(new Date().getHours() - 1), new Date()],
        showIntroduce: true,
        defaultChartVisible: true,
        defaultTableVisible: true,
        chartVisible: true,
        tableVisible: true,
        pageObj: {
          pageNo: 1,
          pageSize: 20,
          total: 0
        },
        dropCol: [],
        tableData: [],
        tableLabels: [],
        showTableLabels: [],
        tableLoading: false,
        saveDisabled: true,
        panelData: [],
      }
    },
    created() {
      this.getPanelData();
      this.promqlKeys.push(this.guid());
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
      queryChartData: function () {
        this.$refs.exploreChart.startLoading();
        setTimeout(() => {
          if (this.expressions.length > 0) {
            let requestArr = [];
            this.expressions.forEach((item, index) => {
              if (item != '') {
                let step=bus.getStep(this.filterTime[0],this.filterTime[1]);
                requestArr.push(axios.get('/prom/api/v1/query_range?query=' + item + '&start=' + this.filterTime[0] + '&end=' + this.filterTime[1] + '&step='+step))
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
              this.defaultChartVisible = true;
              this.$refs.exploreChart.endLoading();
            })
          }
        }, 200)
      },
      queryTableData: function () {
        this.tableLoading = true,
          setTimeout(() => {
            if (this.expressions.length > 0) {
              let requestArr = [];
              this.expressions.forEach((item, index) => {
                if (item != '') {
                  requestArr.push(axios.get('/prom/api/v1/query?query=' + item))
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
                  this.storedTableData = Object.assign([], tData);
                  this.pageObj.total = this.storedTableData.length;
                  this.tableData = this.filterShowData(this.storedTableData, this.pageObj);
                  this.tableLabels = Object.assign([], tLabels);
                  this.showTableLabels = Object.assign([], tLabels);
                  this.dropCol = Object.assign([], tLabels);
                }
                this.defaultTableVisible = true;
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
        this.promqlKeys.splice(index + 1, 0, this.guid());
        this.promqlCount++;
      },
      removeExpression: function (index) {
        console.log(this.expressions)
        console.log(this.promqlKeys)
        console.log(this.promqlCount)
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
      saveChart: function () {
        this.$refs.addChartModal.setTitle(this.$t("dashboard.panel.createChartTitle"));
        this.$refs.addChartModal.show(true);
        let metricInfo = {};
        metricInfo.elements = [];
        // {"metric":"ALERTS_FOR_STATE","elements":[{"expression":"ALERTS_FOR_STATE{project='kafka',module='node_exporter'}","type":"normal"}]}
        for (let i = 0; i < this.expressions.length; i++) {
          if (this.expressions[i] != '') {
            let type = 'expert';
            metricInfo.metric = this.expressions[i];
            metricInfo.elements.push({expression: this.expressions[i], type: type});
          }
        }
        this.$refs.addChartModal.createData(-1, metricInfo);
      },
      createSuccess(type, response, param, panel) { //添加chart成功
        this.$confirm(this.$t("dashboard.metric.goPanelTip"), this.$t("tip.saveSuccess"), {
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
      guid() {
        function S4() {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
      },
      elementsetShow(s, e) {
        var eventfixed = {
          shezhi: 0,
          screen: 0
        };
        eventfixed[s] = 1;
        e.preventDefault();
        this.$store.commit('setEventfixed', eventfixed);
        const h = document.documentElement.clientHeight;
        const w = document.documentElement.clientWidth;
        const dw = this.$refs.elementset.$el.offsetWidth;
        const dh = this.$refs.elementset.$el.offsetHeight;
        let positionx =
          e.clientX + dw <= w - 10 ? e.clientX + 14 : e.clientX + 14 - dw;
        console.log(e.clientY + dh)
        console.log(h)
        let positiony =
          e.clientY + dh <= h - 10
            ? e.clientY + 20
            : e.clientY + 20 - (e.clientY + dh - h + 30);
        this.$store.commit('setPosition', {positionx, positiony});
      },
      elementsetHide() {
        //悬浮点击空白隐藏
        this.$refs.elementset.elementsetHide();
      },
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        console.log(data)
        this.showTableLabels = data;
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
    mounted() {
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
    height: 500px
  }

  .explore .chart-view, .table-view {
    padding: 10px;
    border: 1px solid lightgrey;
    box-sizing: inherit;
    margin-bottom: 5px;
    transition: height 1s;
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

  .doc-content > h1 {
    color: #e6522c;
    font-size: 30px;
    text-transform: uppercase;
    margin: 40px 0 10px 0;
  }

  .doc-content > h1 a {
    color: #e6522c;
  }

  .doc-content.blog > h1 {
    text-transform: none;
  }

  .doc-content.blog .sponsor-logos > a > img {
    width: 250px;
    display: inline-block !important;
    margin: 15px 55px;
  }

  .doc-content > h2 {
    color: #e6522c;
    font-size: 22px;
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
  }

  .doc-content a.header-anchor:after {
    content: "\F0C1";
    font-family: FontAwesome;
    font-weight: normal;
    font-size: .8em;
  }

  .doc-content a.header-anchor:link,
  .doc-content a.header-anchor:visited {
    visibility: hidden;
  }

  .doc-content h1:hover a.header-anchor:hover,
  .doc-content h2:hover a.header-anchor:hover,
  .doc-content h3:hover a.header-anchor:hover,
  .doc-content h4:hover a.header-anchor:hover,
  .doc-content h5:hover a.header-anchor:hover,
  .doc-content h6:hover a.header-anchor:hover {
    color: #000;
  }

  .doc-content h1:hover a.header-anchor,
  .doc-content h2:hover a.header-anchor,
  .doc-content h3:hover a.header-anchor,
  .doc-content h4:hover a.header-anchor,
  .doc-content h5:hover a.header-anchor,
  .doc-content h6:hover a.header-anchor {
    color: #999;
    visibility: visible;
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
