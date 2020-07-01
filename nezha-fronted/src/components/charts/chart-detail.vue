<style lang="scss">
  @import './chart.scss';
</style>
<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box" ref="resizeBox">
      <div class="chart-container chart-detail" :id="'chartContainerDiv' + chartIndex" @mouseenter="caretShow = true" @mouseleave="caretShow = false">
        <loading :ref="'localLoading' + chartIndex"></loading>
        <div class="clearfix chart-title" :class="{'drag-disabled': !data.draggable}" :id="'chartTitle' + chartIndex">
          <el-popover
            v-if="isError"
            :close-delay="10"
            placement="top-start"
            trigger="hover"
            popper-class="chart-error-popper">
            <div>{{errorContent}}</div>
            <span slot="reference" class="panel-info-corner panel-info-corner--error">
              <i class="nz-icon nz-icon-warning fa"></i>
              <span class="panel-info-corner-inner"></span>
            </span>
          </el-popover>
          <span class="el-dropdown-link chart-title-text" @click="dropdownMenuShow = !dropdownMenuShow">{{data.title}}</span>
        </div>
        <div ref="chartInfo" class="chart-info" :id="'chartInfoDiv' + chartIndex" v-cloak>
          <el-scrollbar style="height: 100%;width:100%;" ref="scrollbar" class="el-scrollbar-normal">
            <div v-for="(item, index) in detail" :key="index" class="chart-sub">
              <div class="chart-sub-title" @click="hideElement(index)">
                <span><i :class="{'el-icon-caret-right': show.indexOf(index) == -1,'el-icon-caret-bottom': show.indexOf(index) > -1}"></i></span>
                <span>{{item.title}}</span>
              </div>
              <el-collapse-transition>
                <div class="chart-sub-content" v-show="show.indexOf(index) > -1">
                  <template v-for="(value, key, i) in item.data">

                    <!-- endpoint-detail、asset、model的assetInfo的asset详情-->
                    <div class="content-item" v-if="(data.from == 'endpoint' || data.from == 'asset' || data.from == 'model') && data.type == 'assetInfo' && item.type == 'basic' && assetKey[key]">
                      <div class="content-item-key item-tip" :id="`key-${index}-${i}`">
                        <span class="content-text">{{assetKey[key]}}</span>
                        <div class="item-tip-hide item-tip-key el-popover" :class="itemTip(`key-${index}`, key, i, ready)">{{assetKey[key]}}</div>
                      </div>

                      <div class="content-item-value item-tip" :id="`value-${index}-${i}`">
                        <span v-if="key == 'state'">{{value == 1 ? $t('asset.createAssetTab.inStock') : $t('asset.createAssetTab.outStock')}}</span>
                        <span v-else-if="key == 'alert'" class="as-button" :class="{'success': value <= 0, 'danger': value > 0}">{{value + ' ' + $t('overall.active')}}</span>
                        <div v-else-if="key == 'tags'" class="no-overflow" style="padding-bottom: 5px;">
                          <template v-if="value && value.length > 0">
                            <nz-alert-tag :label="tagItem.tag" type="normal" style="margin: 5px 5px 0 0; vertical-align: middle;"
                                          :cursor-point="false"
                                          :key="tagItem.id"
                                          v-for="(tagItem, tagIndex) in value">
                              <div :id="`tag-${index}-${tagIndex}`" class="tag-value">
                                <span class="content-text">{{tagItem.value}}</span>
                              </div>
                            </nz-alert-tag>
                          </template>
                          <template v-else>&nbsp;</template>
                        </div>
                        <template v-else-if="key == 'pingRtt'">
                          <div class="active-icon" :class="{'green': item.data.pingStatus == 1, 'red': item.data.pingStatus == 1 != 1}"></div>
                          <span>{{value ? value + 'ms' : ''}}</span>
                        </template>
                        <template v-else-if="assetKey[key]">
                          <span class="content-text">{{value ? value : "&nbsp;"}}</span>
                          <div class="item-tip-hide item-tip-value el-popover" :class="itemTip(`value-${index}`, key, i, ready)">{{value}}</div>
                        </template>
                      </div>
                    </div>
                    <!-- endpoint-detail、asset、model的assetInfo的feature-->
                    <div class="content-item" v-if="(data.from == 'endpoint' || data.from == 'asset' || data.from == 'model') && data.type == 'assetInfo' && item.type == 'feature'">
                      <div class="content-item-key item-tip" :id="`key-${index}-${i}`">
                        <span class="content-text">{{key}}</span>
                        <div class="item-tip-hide item-tip-key el-popover" :class="itemTip(`key-${index}`, key, i, ready)">{{key}}</div>
                      </div>

                      <div class="content-item-value item-tip" :id="`value-${index}-${i}`" :class="{'content-item-value-muti': Array.isArray(value) && value.length > 0}">
                        <template v-if="Array.isArray(value) && value.length>0">
                          <div v-if="typeof value[0] == 'string'" class="item-value-sub" v-for="(_item, _index) in value" :key="_index">{{_item}}</div>
                          <el-table
                            v-else
                            class="nz-table asset-info-table"
                            :data="value"
                            tooltip-effect="light"
                            height="100%"
                            ref="dataTable"
                            v-scrollBar:el-table="'small'"
                          >
                            <el-table-column
                              :resizable="false"
                              v-for="(_item, _index) in setLabels(value)"
                              v-if="_item.show"
                              :key="`col-${_index}`"
                              :label="_item.label"
                            >
                              <template slot-scope="scope" :column="_item">
                                <template >
                                  <span v-html="scope.row[_item.prop]"></span>
                                </template>
                              </template>
                            </el-table-column>
                          </el-table>
                        </template>
                        <template v-else-if="key">
                          <span class="content-text">{{value ? value : "&nbsp;"}}</span>
                          <div class="item-tip-hide item-tip-value el-popover" :class="itemTip(`value-${index}`, key, i, ready)">{{value}}</div>
                        </template>
                      </div>
                    </div>

                    <!-- project的projectInfo的project详情-->
                    <div class="content-item" v-else-if="data.from == 'project' && data.type == 'projectInfo' && projectKey[key]">
                      <div class="content-item-key item-tip" :id="`key-${index}-${i}`">
                        <span class="content-text">{{projectKey[key]}}</span>
                        <div class="item-tip-hide item-tip-key el-popover" :class="itemTip(`key-${index}`, key, i, ready)">{{projectKey[key]}}</div>
                      </div>
                      <div class="content-item-value item-tip" :id="`value-${index}-${i}`">
                        <template v-if="key == 'alertStat'">
                          <div class="active-icon dark-red"></div>
                          <span>{{value[0]}}</span>&nbsp;&nbsp;
                          <div class="active-icon red"></div>
                          <span>{{value[1]}}</span>&nbsp;&nbsp;
                          <div class="active-icon orange"></div>
                          <span>{{value[2]}}</span>
                        </template>
                        <template v-else-if="projectKey[key]">
                          <span class="content-text">{{value ? value : "&nbsp;"}}</span>
                          <div class="item-tip-hide item-tip-value el-popover" :class="itemTip(`value-${index}`, key, i, ready)">{{value}}</div>
                        </template>
                      </div>
                    </div>
                    <!-- project的projectInfo的module详情-->
                    <div class="content-item" v-else-if="data.from == 'project' && data.type == 'projectInfo' && moduleKey[key]">
                      <div class="content-item-key item-tip" :id="`key-${index}-${i}`">
                        <span class="content-text">{{moduleKey[key]}}</span>
                        <div class="item-tip-hide item-tip-key el-popover" :class="itemTip(`key-${index}`, key, i, ready)">{{moduleKey[key]}}</div>
                      </div>
                      <div class="content-item-value item-tip" :id="`value-${index}-${i}`">
                        <template v-if="key == 'alertStat'">
                          <div class="active-icon dark-red"></div>
                          <span>{{value[0]}}</span>&nbsp;&nbsp;
                          <div class="active-icon red"></div>
                          <span>{{value[1]}}</span>&nbsp;&nbsp;
                          <div class="active-icon orange"></div>
                          <span>{{value[2]}}</span>
                        </template>
                        <template v-else-if="key == 'endpointStat'">
                          <img src='../../assets/img/up.png' width="16" style="vertical-align: middle">
                          <span>{{value[0]}}</span>&nbsp;&nbsp;
                          <img src='../../assets/img/down.png' width="16" style="vertical-align: middle">
                          <span>{{value[1]}}</span>&nbsp;&nbsp;
                        </template>
                        <template v-else-if="moduleKey[key]">
                          <span class="content-text">{{value ? value : "&nbsp;"}}</span>
                          <div class="item-tip-hide item-tip-value el-popover" :class="itemTip(`value-${index}`, key, i, ready)">{{value}}</div>
                        </template>
                      </div>
                    </div>

                    <!-- endpoint-detail的endpointInfo的endpoint详情-->
                    <div class="content-item" v-else-if="data.from == 'endpoint' && data.type == 'endpointInfo' && endpointKey[key]">
                      <div class="content-item-key item-tip" :id="`key-${index}-${i}`">
                        <span class="content-text">{{endpointKey[key]}}</span>
                        <div class="item-tip-hide item-tip-key el-popover" :class="itemTip(`key-${index}`, key, i, ready)">{{endpointKey[key]}}</div>
                      </div>
                      <div class="content-item-value item-tip" :id="`value-${index}-${i}`">
                        <template v-if="key == 'state'"><div id="littleChart" style="cursor: pointer; height: 26px; width: 100px;" @click="preview"></div></template>
                        <template v-else-if="endpointKey[key]">
                          <span class="content-text">{{value ? value : "&nbsp;"}}</span>
                          <div class="item-tip-hide item-tip-value el-popover" :class="itemTip(`value-${index}`, key, i, ready)">{{value}}</div>
                        </template>
                      </div>
                    </div>
                    <!-- endpoint-detail的endpointInfo的alert详情-->
                    <div class="content-item" v-else-if="data.from == 'endpoint' && data.type == 'endpointInfo' && item.title == $t('overall.alert')">
                      <div class="content-item-key item-tip" :id="`key-${index}-${i}`">
                        <span class="content-text">{{key}}</span>
                        <div class="item-tip-hide item-tip-key el-popover" :class="itemTip(`key-${index}`, key, i, ready)">{{key}}</div>
                      </div>
                      <div class="content-item-value item-tip" :id="`value-${index}-${i}`">
                        <span class="content-text">{{value ? value : "&nbsp;"}}</span>
                        <div class="item-tip-hide item-tip-value el-popover" :class="itemTip(`value-${index}`, key, i, ready)">{{value}}</div>
                      </div>
                    </div>

                    <!-- alertRule-detail的详情-->
                    <div class="content-item" v-else-if="data.from == 'alertRule' && data.type == 'alertRuleInfo' && key != '_module_'" @click="showDeep(`deep-${index}-${i}`)">
                      <div class="content-item-key item-tip" :id="`key-${index}-${i}`">
                        <span class="content-text">
                          <span><i v-if="item.data._module_[key]" :class="{'el-icon-caret-right': deepShow.indexOf(`deep-${index}-${i}`) == -1,'el-icon-caret-bottom': deepShow.indexOf(`deep-${index}-${i}`) > -1}"></i></span>
                          <span>{{key}}</span>
                          <!--<span v-if="item.data._module_[key]">{{Object.keys(item.data._module_[key]).length-1}}个module</span>-->
                        </span>
                        <div class="item-tip-hide item-tip-key el-popover" :class="itemTip(`key-${index}`, key, i, ready)">{{key}}</div>
                      </div>
                      <div class="content-item-value item-tip" :id="`value-${index}-${i}`">
                        <span class="content-text">{{value ? value : "&nbsp;"}}</span>
                      </div>
                      <!-- module -->
                      <el-collapse-transition>
                        <div class="chart-third-content" v-show="deepShow.indexOf(`deep-${index}-${i}`) > -1">
                          <template v-for="(module, mProjectName, ti) in item.data._module_" v-if="mProjectName == key">
                            <div class="content-item" @click.stop="showDeep(`deep-${index}-${i}-${ti}-${fi}`)" v-for="(moduleNum, moduleName, fi) in module" v-if="moduleName != '_endpoint_'">
                              <div class="content-item-key item-tip deep" :id="`key-${index}-${i}-${ti}-${fi}`">
                              <span class="content-text">
                                <span><i v-if="module._endpoint_[moduleName]" :class="{'el-icon-caret-right': deepShow.indexOf(`deep-${index}-${i}-${ti}-${fi}`) == -1,'el-icon-caret-bottom': deepShow.indexOf(`deep-${index}-${i}-${ti}-${fi}`) > -1}"></i></span>
                                <span>{{moduleName}}</span>
                                <!--<span v-if="module._endpoint_[moduleName]">{{Object.keys(module._endpoint_[moduleName]).length-1}}个endpoint</span>-->
                              </span>
                                <div class="item-tip-hide item-tip-key el-popover" :class="itemTip(`key-${index}-${i}-${ti}`, moduleName, fi, ready)">{{moduleName}}</div>
                              </div>
                              <div class="content-item-value item-tip deep" :id="`value-${index}-${i}-${ti}-${fi}`">
                                <span class="content-text">{{moduleNum ? moduleNum : "&nbsp;"}}</span>
                              </div>
                              <!-- endpoint -->
                              <el-collapse-transition>
                                <div class="chart-forth-content" v-show="deepShow.indexOf(`deep-${index}-${i}-${ti}-${fi}`) > -1">
                                  <template v-if="eModuleName == moduleName" v-for="(endpoint, eModuleName, si) in module._endpoint_">
                                    <div class="content-item" @click.stop v-for="(endpointNum, endpointName, ei) in endpoint">
                                      <div class="content-item-key item-tip deepp" :id="`key-${index}-${i}-${ti}-${fi}-${si}-${ei}`">
                                        <span class="content-text">
                                          <span>{{endpointName}}</span>
                                        </span>
                                        <div class="item-tip-hide item-tip-key el-popover" :class="itemTip(`key-${index}-${i}-${ti}-${fi}-${si}`, endpointName, ei, ready)">{{endpointName}}</div>
                                      </div>
                                      <div class="content-item-value item-tip deepp" :id="`value-${index}-${i}-${ti}-${fi}-${si}-${ei}`">
                                        <span class="content-text">{{endpointNum ? endpointNum : "&nbsp;"}}</span>
                                      </div>
                                    </div>
                                  </template>
                                </div>
                              </el-collapse-transition>
                            </div>
                          </template>
                        </div>
                      </el-collapse-transition>
                    </div>
                  </template>
                </div>
              </el-collapse-transition>
            </div>
          </el-scrollbar>
        </div>
      </div>
      <span v-if="data.resizable" class="vue-resizable-handle" @mousedown="startResize"></span>
    </div>
    <!--preview -->
    <chart-preview :panelId="panelId" ref="chartsPreview" ></chart-preview>
  </div>
</template>

<script>
  import loading from "../common/loading";
  import timePicker from '../common/timePicker';
  import chartPreview from './chartPreview';
  import echarts from 'echarts';
  import nzAlertTag from '../page/alert/nzAlertTag';
  import bus from '../../libs/bus';

  export default {
    name: 'chartDetail',
    components: {
      'loading': loading,
      'time-picker': timePicker,
      'chart-preview': chartPreview,
      'nz-alert-tag': nzAlertTag
    },
    props: {
      // 看板id
      panelId: {
        type: Number,
        default: 0,
      },
      editChartId: {
        type: String,
        default: 'editChartId',
      },
      chartIndex:{
        type: Number,
        default: 0,
      }
    },
    data() {
      return {
        ready: false,
        data: {}, // 该图表信息,chartItem
        detail: [], //展示的详情
        unit: {},
        show: [0], //控制展开/隐藏
        deepShow: [], //控制二级/三级的展开/隐藏
        isError:false,
        errorContent:'',
        loading:Object,
        panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
        firstLoad: false, // 是否第一次加载
        screenModal: false,
        // 查询数据使用
        filter: {
          start_time: '',
          end_time: '',
        },
        firstShow: false, // 默认不显示操作按钮,
        caretShow:false,
        dropdownMenuShow:false,
        divFirstShow:false,
        searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],//全屏显示的时间
        oldSearchTime: [],

        assetKey: {
          host: this.$t("asset.tableTitle.host"),
          id: "Id",
          assetType: this.$t("asset.tableTitle.assetType"),
          sn: this.$t("asset.tableTitle.device"),
          state: this.$t("asset.tableTitle.assetState"),
          pingRtt: this.$t('asset.tableTitle.assetPing'),
          dataCenter: this.$t("asset.tableTitle.dataCenter"),
          cabinet: this.$t("asset.tableTitle.cabinet"),
          model: this.$t("asset.tableTitle.model"),
          vendor: this.$t("asset.tableTitle.vendor"),
          purchaseDate: this.$t("asset.tableTitle.procurementDate"),
          principal: this.$t("asset.tableTitle.principal"),
          tel: this.$t("asset.tableTitle.principalTel"),
          pingStatus: this.$t('asset.tableTitle.assetPing'),
          pingLastReply: this.$t('asset.tableTitle.lastReply'),
          endpoint: this.$t("asset.tableTitle.modules"),
          alert: this.$t("asset.tableTitle.alerts"),
          tags: this.$t("overall.tag")
        },
        projectKey: {
          id: "ID",
          name: this.$t("overall.name"),
          remark: this.$t("overall.remark"),
          alertStat: this.$t("project.chart.alertStat"),
        },
        moduleKey: {
          id: "ID",
          name: this.$t("overall.name"),
          type: this.$t("overall.type"),
          remark: this.$t("overall.remark"),
          endpointStat: this.$t("project.chart.endpointStat"),
          alertStat: this.$t("project.chart.alertStat"),
        },
        endpointKey: {
          id: "ID",
          host: this.$t("project.endpoint.host"),
          port: this.$t("project.endpoint.port"),
          path: this.$t("project.endpoint.path"),
          param: this.$t("project.endpoint.param"),
          port: this.$t("project.endpoint.port"),
          state: this.$t("alert.list.state"),
          project: this.$t("project.project.project"),
          module: this.$t("project.module.module")
        },
      };
    },
    computed: {
      itemTip() {
        return function(type, content, index, ready) {
          let className = "item-tip-show";
          this.$nextTick(() => {
            if (ready) {
              let cellDom = document.querySelector(`#${type}-${index}`);
              let spanDom = document.querySelector(`#${type}-${index} .content-text`);
              if (cellDom.offsetWidth - 16 <= spanDom.offsetWidth) {
                document.querySelector(`#${type}-${index}>.el-popover`).classList.add(className);
              } else {
                document.querySelector(`#${type}-${index}>.el-popover`).classList.remove(className);
              }
            }
          });
          return "";
        }
      },
    },
    methods: {
      startResize(e) {
        let vm = this;
        this.$chartResizeTool.start(vm, this.data, e);
      },
      setLabels:function(source){
        let labels=[];
        source.forEach(item=>{
          labels=labels.concat(Object.keys(item))
        })
        labels=Array.from(new Set(labels));

        labels=labels.map(item=>{
          return{
            label:this.replaceSplit(item),
            prop:item,
            show:true,
          }
        });
        return labels;
      },
      replaceSplit(key){
        if(key) {
          return key.replace(/\$_\$/g,' ')
        }
      },
      hideElement(index) {
        if (this.show.indexOf(index) > -1) {
          this.show.splice(this.show.indexOf(index), 1);
        } else {
          this.show.push(index);
        }
      },
      showDeep(index) {
        if (this.deepShow.indexOf(index) > -1) {
          this.deepShow.splice(this.deepShow.indexOf(index), 1);
        } else {
          this.deepShow.push(index);
        }
      },
      startLoading(area){
        this.$refs['localLoading'+this.chartIndex].startLoading();
      },
      endLoading(area){
        this.$refs['localLoading'+this.chartIndex].endLoading();
      },
      preview() {
        this.$refs.chartsPreview.show(this.data);
      },
      resize() {
        let container = document.querySelector('#chartInfoDiv' + this.chartIndex);
        container.style.height = `calc(100% - ${this.$chartResizeTool.titleHeight + this.$chartResizeTool.chartTableBlankHeight}px)`;
      },
      showLoad(chartItem) {
        this.$nextTick(() => {
          this.resize();
        });
        this.startLoading();
        this.divFirstShow = true;
      },
      // 重新请求数据 刷新操作-local
      refreshChart() {
        this.dropdownMenuShow = false;
        this.startLoading();
        this.firstShow = false;
        this.$emit('on-refresh-data', this.data.id);
      },
      // 编辑图表
      editChart() {
        this.dropdownMenuShow=false;
        this.$emit('on-edit-chart-block', this.data.id);
      },
      // 删除该图表
      removeChart() {
        this.dropdownMenuShow = false;
        this.$emit('on-remove-chart-block', this.data.id);
      },
      clearChart(){
        this.data = {};
      },

      // 设置数据, filter区分
      setData(chartItem, detail, panelId, filter, area, errorMsg) {
        if(errorMsg && errorMsg !== ''){
          this.isError = true;
          this.errorContent = errorMsg;
        }else {
          this.isError = false;
          this.errorContent = '';
        }
        this.divFirstShow = true;

        this.firstShow = true; // 展示操作按键

        this.panelIdInner = panelId;
        this.data = chartItem;
        this.detail = detail;
        if (this.detail[0] && this.detail[0].type && this.detail[0].type == "endpointInfo") { //endpointInfo的小图表
          this.$nextTick(() => {
            this.initChart(this.detail[0].data.stateSeries);
          });
        }
        this.$nextTick(() => {
          this.$refs.scrollbar.update();
        });
        this.endLoading();
      },
      initChart(series) {
        let option = {
          title: {show: false},
          grid: {top: 20, bottom: 20},
          tooltip: {
            show: true,
            trigger: "axis",
            extraCssText: 'z-index:3100;',
            position: [100, 1],
            textStyle: {
              fontSize: 12,
            },
            padding: 3,
            formatter: function(param) {
              let time = param[0].data[0];
              time = bus.computeTimezone(time);
              let date = new Date(time);
              let hour = date.getHours();
              hour = hour > 9 ? hour : "0" + hour; //加0补充为两位数字
              let minute = date.getMinutes();
              minute = minute > 9 ? minute : "0" + minute; //如果分钟小于10,则在前面加0补充为两位数字

              let value = param[0].data[1];
              if (value == "1") {
                value = "up";
              } else {
                value = "down";
              }
              return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("/") + " " + [hour, minute].join(":") + "\n" + value;
            }
          },
          legend: {show: false},
          xAxis: {
            show: false,
            type: 'time'
          },
          yAxis: {
            type: 'value',
            show: false
          },
          useUTC: false,//使用本地时间
          visualMap: {
            show: false,
            pieces: [{
              gt: -0.5,
              lt: 0.5,
              color: '#d64f40'
            }, {
              gt: 0.6,
              lt: 1.5,
              color: '#50d050'
            }]
          },
          series: series
        };
        let chart = echarts.init(document.querySelector("#littleChart"));
        chart.setOption(option);//创建图表
      }
    },
    mounted() {
      this.firstLoad = false;
      this.$nextTick(() => {
        this.$refs.scrollbar.update();
      });
      setTimeout(() => {
        this.ready = true;
      }, 300);
    },
    beforeDestroy() {
      this.clearChart();
    },
  };
</script>
