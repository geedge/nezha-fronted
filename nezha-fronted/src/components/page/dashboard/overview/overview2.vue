<template>
  <div class="overview" style="background-color: #f9f9f9;">
    <!--标题-->
    <div class="overview-content-header">
      <div class="header-title" :class="{'hide-div':!isFullScreen}">{{systemName&&systemName != 'undefined'&&systemName != null?systemName: $t('dashboard.overview.contentTitle')}}</div>
      <div class="header-tool">
        <div class="tool-container">
          <div class="time">{{sysTime}}</div>
          <div class="date">
            <div class="week">{{sysWeek}}</div>
            <div class="sys-date">{{sysDate}}</div>
          </div>
          <div class="operation" @click="switchFullScreen" ><span ><i class="nz-icon screen-icon" :class="{'nz-icon-maxview':!isFullScreen,'nz-icon-exit-full-screen':isFullScreen}"></i></span></div>
        </div>
      </div>
    </div>
    <!--内容-->
    <div class="overview-content">
      <!--第一行-->
      <div class="content-row-box">
        <div class="content-col-box">
          <div class="content-col-content" v-loading="assetLoading">
            <div class="content-col-content-icon"><i class="nz-icon nz-icon-overview-asset"></i></div>
            <div class="content-num-box">
              <div class="content-col-content-num">
                <vue-countup :start-value="0" :end-value="(assetData ? assetData.totalStat.total  : '') | numberFormat" :decimals="(assetData ? assetData.totalStat.total  : 0) < 1000 ? 0 : 1"></vue-countup>
                <span class="overview-row-unit">{{(assetData ? assetData.totalStat.total  : '') | unitFormat}}</span>
              </div>
              <div class="content-col-content-title">{{$t("dashboard.overview.asset.title")}}</div>
            </div>
          </div>
        </div>
        <div class="content-col-box">
          <div class="content-col-content" v-loading="projectLoading">
            <div class="content-col-content-icon"><i class="nz-icon nz-icon-overview-project"></i></div>
            <div class="content-num-box">
              <div class="content-col-content-num">
                <vue-countup :start-value="0" :end-value="(projectData ? projectData.projectStat.length : '') | numberFormat" :decimals="(projectData ? projectData.projectStat.length : 0) < 1000 ? 0 : 1"></vue-countup>
                <span class="overview-row-unit">{{(projectData ? projectData.projectStat.length  : '') | unitFormat}}</span>
              </div>
              <div class="content-col-content-title">{{$t("dashboard.overview.project.project")}}</div>
            </div>
          </div>
        </div>
        <div class="content-col-box">
          <div class="content-col-content" v-loading="moduleLoading">
            <div class="content-col-content-icon"><i class="nz-icon nz-icon-overview-module"></i></div>
            <div class="content-num-box">
              <div class="content-col-content-num">
                <vue-countup :start-value="0" :end-value="(moduleData ? moduleData.moduleStat.length : '') | numberFormat" :decimals="(moduleData ? moduleData.moduleStat.length : 0) < 1000 ? 0 : 1"></vue-countup>
                <span class="overview-row-unit">{{(moduleData ? moduleData.moduleStat.length  : '') | unitFormat}}</span>
              </div>
              <div class="content-col-content-title">{{$t("dashboard.overview.module.module")}}</div>
            </div>
          </div>
        </div>
        <div class="content-col-box">
          <div class="content-col-content" v-loading="endpointLoading">
            <div class="content-col-content-icon"><i class="nz-icon nz-icon-overview-endpoint"></i></div>
            <div class="content-num-box">
              <div class="content-col-content-num">
                <vue-countup :start-value="0" :end-value="(endpointData ? endpointData.total : '') | numberFormat" :decimals="(endpointData ? endpointData.total : 0) < 1000 ? 0 : 1"></vue-countup>
                <span class="overview-row-unit">{{(endpointData ? endpointData.total : '') | unitFormat}}</span>
              </div>
              <div class="content-col-content-title">{{$t("dashboard.overview.endpoint.endpoint")}}</div>
            </div>
          </div>
        </div>
        <div class="content-col-box">
          <div class="content-col-content" v-loading="alertMessageLoading">
            <div class="content-col-content-icon"><i class="nz-icon nz-icon-overview-alert"></i></div>
            <div class="content-num-box">
              <div class="content-col-content-num">
                <vue-countup :start-value="0" :end-value="(alertMessageData ? alertMessageData.alertMessageTotal : '') | numberFormat" :decimals="(alertMessageData ? alertMessageData.alertMessageTotal : 0) < 1000 ? 0 : 1"></vue-countup>
                <span class="overview-row-unit">{{(alertMessageData ? alertMessageData.alertMessageTotal : '') | unitFormat}}</span>
              </div>
              <div class="content-col-content-title">{{$t("overall.alert")}}</div>
            </div>
            <div class="content-alert-num">{{$t("dashboard.overview.alert.ruleNum")}}&nbsp;:&nbsp;{{(alertRuleData ? alertRuleData.alertRuleTotal : "") | numberFormat}}</div>
          </div>
        </div>
      </div>
      <!--第二行-->
      <div class="content-row-box">
        <div class="content-col-box">
          <div class="content-col-title">
            <span>{{$t("dashboard.overview.traffic")}}</span>
            <span class="content-col-title-tools">
              <time-picker ref="calendarPanel" class="nz-dashboard-picker" @change="dateChange"></time-picker>
              <span class="content-col-title-tool">
                <div class="diy-content">
                  <span>Data center</span>
                  <i class="el-input__icon nz-icon nz-icon-arrow-down"></i>
                </div>
                <el-cascader
                  :options="trafficData"
                  :props="{multiple: true}"
                  clearable
                  collapse-tags
                  placeholder=""
                  popper-class="trend-cascader"
                  v-model="trendSearchParam.select"
                ></el-cascader>
              </span>
            </span>
          </div>
          <div class="content-col-content">
            <chart-box chart-type="overviewLine" ref="chartbox" :show-toolbox="false" name="trend" :unit="15" @is-loading="(isLoading)=>{this.trendLoading = isLoading}"></chart-box>
            <div class="chart-no-data" v-if="!trendLoading && ((!chartSeries[0] && !chartSeries[1]) || (chartSeries[0].data.length == 0 && chartSeries[1] && chartSeries[1].data.length == 0))">No Data</div>
          </div>
        </div>
        <div class="content-col-box">
          <div class="content-col-title">{{$t("dashboard.overview.dataCenter.dataCenter")}}</div>
          <div class="content-col-content">
            <chart-box chart-type="map" :tooltip-formatter="mapTooltipFormatter" :map="map" ref="dataCenterMap" @is-loading="(isLoading)=>{this.mapLoading = isLoading}"></chart-box>
          </div>
        </div>
      </div>
      <!--第三行-->
      <div class="content-row-box">
        <!--第一个图-->
        <div class="content-col-box">
          <div class="content-col-title">
            <span>{{$t("dashboard.overview.asset.assetType")}}</span>
          </div>
          <div class="content-col-content">
            <chart-box chart-type="pie" ref="assetTypePie" :show-toolbox="false" name="assetTypePie" :tooltip-formatter="assetTypeFormatter" @is-loading="(isLoading)=>{this.assetTypeLoading = isLoading}"></chart-box>
<!--                <div class="no-data-tip" v-if="!assetTypeLoading && assetData.typeStat && assetData.typeStat.length == 0">N/A</div>-->
<!--                <div class="chart-no-data"v-if="!assetTypeLoading && assetData.typeStat && assetData.typeStat.length == 0">No Data</div>-->
          </div>
        </div>

        <!--第二个图-->
        <div class="content-col-box">
          <div class="content-col-title">
            <span>
              <span v-if="alertMessageShow == 'asset'">{{$t("dashboard.overview.alert.assetTopN")}}</span>
              <span v-if="alertMessageShow == 'module'">{{$t("dashboard.overview.alert.moduleTopN")}}</span>
              <!--<span class="dropdown-btn" @mouseenter="alertMessageDropdownHandler(true)" @mouseleave="alertMessageDropdownHandler(false)">
                <i class="nz-icon nz-icon-arrow-down"></i>
                <transition name="el-zoom-in-top">
                  <ul class="el-dropdown-menu el-popper el-dropdown-menu&#45;&#45;mini" v-if="bottom3DropdownShow">
                    <li @click="alertMessageChange('asset')" class="el-dropdown-menu__item dropdown-content" style="padding: 0 15px;">{{$t("dashboard.overview.asset.title")}}</li>
                    <li @click="alertMessageChange('module')" class="el-dropdown-menu__item dropdown-content" style="padding: 0 15px;">{{$t("dashboard.overview.module.module")}}</li>
                  </ul>
                </transition>
              </span>-->
            </span>
          </div>
          <div class="content-col-content">
            <chart-box axis-tooltip="y" v-show="alertMessageShow == 'asset'" :tooltip-formatter="simpleFormatter" chart-type="ruleBar" ref="assetMessage" name="assetMessage" :show-toolbox="false" @is-loading="(isLoading)=>{this.assetMessageLoading = isLoading}"></chart-box>
            <chart-box axis-tooltip="y" v-show="alertMessageShow == 'module'" :tooltip-formatter="simpleFormatter" chart-type="bar" ref="moduleMessage" name="moduleMessage" :show-toolbox="false" @is-loading="(isLoading)=>{this.moduleMessageLoading = isLoading}"></chart-box>
          </div>
        </div>
        <!--第三个图-->
        <div class="content-col-box">
          <div class="content-col-title">
            <span>{{$t("dashboard.overview.alert.alertRuleTopN")}}</span>
            <!--<el-dropdown trigger="hover" :show-timeout="0" size="small">
              <span>Top&nbsp;{{topFilter.rule}}<i class="nz-icon nz-icon-arrow-down el-icon&#45;&#45;right"></i></span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(item,index) in topFilter.optionals" :key="index" @click.native="topNChange('rule', item)">{{item}}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>-->
          </div>
          <div class="content-col-content">
            <chart-box axis-tooltip="y" chart-type="ruleBar" ref="ruleMessage" :tooltip-formatter="simpleFormatter" :show-toolbox="false" name="ruleMessage" @is-loading="(isLoading)=>{this.ruleMessageLoading = isLoading}"></chart-box>
            <!--                <div class="no-data-tip" v-if="!ruleMessageLoading && ((!messageByRuleSeries.data && !messageByRuleSeries.category) || (messageByRuleSeries.data.length == 0 && messageByRuleSeries.category.length == 0))">N/A</div>-->
            <!--                <div class="chart-no-data" v-if="!ruleMessageLoading && ((!messageByRuleSeries.data && !messageByRuleSeries.category) || (messageByRuleSeries.data.length == 0 && messageByRuleSeries.category.length == 0))">No Data</div>-->
          </div>
        </div>
      </div>
    </div>
    <div class="axis-tooltip el-popover"></div>
    <!--用于assetType饼图label-->
    <img src='../../../../assets/img/up.png' id="upPic" style="display: none;">
    <img src='../../../../assets/img/down.png' id="downPic" style="display: none;">
  </div>
</template>

<script>
  import chart from "./chart";
  import chartDataFormat from "../../../charts/chartDataFormat";
  import axios from 'axios';
  import bus from '../../../../libs/bus';
  import timePicker from '../../../common/timePicker';
  import VueCountUp from 'vue-countupjs';
  import * as world from "../../../common/js/world";

  var timeout; //第三行第三个图的dropdown下拉菜单timeout
  export default {
    name: "overview2",
    components:{
      'chart-box': chart,
      'time-picker': timePicker,
      'vue-countup': VueCountUp
    },
    data() {
      return {
        //top tool
        isFullScreen: false,
        sysTime: '',
        sysDate: '',
        sysWeek: '',
        systemName: localStorage.getItem('nz-sys-name'),

        //data
        assetLoading: false,
        assetTypeLoading: false, //第三行第一个图
        assetData: '',
        projectLoading: false,
        projectData: '',
        moduleLoading: false,
        moduleData: '',
        endpointLoading: false,
        endpointData: '',
        alertMessageLoading: false,
        alertMessageData: '',
        alertRuleData: '',
        map: null,
        mapLoading: false,
        chartSeries: [],
        trendLoading: false,
        assetTypeSeries: [],
        messageByRuleSeries: [],
        ruleMessageLoading: false, //第三行第二个图
        messageByAssetSeries: [],
        assetMessageLoading: false, //第三行第三个图
        messageByModuleSeries: [],
        moduleMessageLoading: false, //第三行第三个图
        alertRuleStatData: {},
        dataCenterMapSeries: [],
        trafficDatacenterData: [],
        trafficTagData: [],
        trafficData: [],

        trendSearchParam: {start: '', end: '', dc: [], tag: [], select: [], watch: true},

        alertMessageShow: 'asset', //asset/module
        bottom3DropdownShow: false, //最底部行第三列的下拉选择框

        topFilter:{
          optionals: [10, 20, 50],
          rule: 10,
          asset: 10,
          module: 10
        },
      }
    },
    filters: {
      numberFormat(num) {
        let fixed = 1;
        if (num) {
          try {
            num = parseFloat(num);
            if (num < 1000) {
              return num;
            } else if (num < 1000000) {
              return (num/1000).toFixed(fixed);
            } else if (num < 1000000000) {
              return (num/1000000).toFixed(fixed);
            }
          } catch (err) {
            return 0;
          }
        }
        return 0;
      },
      unitFormat(num) {
        if (num) {
          try {
            num = parseFloat(num);
            if (num < 1000) {
              return "";
            } else if (num < 1000000) {
              return " K";
            } else if (num < 1000000000) {
              return " M";
            }
          } catch (err) {
            return "";
          }
        }
        return "";
      }
    },
    methods: {
      /*初始化数据 start*/
      initData() {
        this.queryAssetData();
        this.queryProjectData();
        this.queryModuleData();
        this.queryEndpointData();
        this.queryAlertMessageData();
        this.queryAlertRuleData();
        this.queryAlertTrendData();
        this.queryMapChartGeoJson();
        this.queryAlertStatByRule();
        this.queryAlertStatByAsset();
        this.getDcTrafficData();
      },
      queryAssetData() {
        this.assetLoading = true;
        this.$refs.assetTypePie.startLoading();
        this.$get('overview/assetStat').then(response => {
          this.assetLoading = false;
          if (response.code === 200) {
            this.assetData = response.data;

            /*饼图*/
            let legendData = [];
            let typeSeriesData = [];

            let vm = this;
            let assetTotalCount = function() {
              let count = 0;
              vm.assetData.typeStat.forEach(item => {
                count += item.total;
              });
              return count;
            }();

            this.assetData.typeStat.forEach(item => {
              legendData.push([item.name, (item.total*100/assetTotalCount).toFixed(2)]);
              typeSeriesData.push({name: item.name, value: item.total, up: item.pingUp, down: item.pingDown});
            });
            let series = [{
              name: 'Type',
              data: typeSeriesData.sort((a, b) => {return a.value > b.value ? -1 : 1}),
              type: 'pie',
              radius: ["58%", "75%"],
              center: ["40%", "50%"],
              minAngle: 15,
              itemStyle: {
                borderColor: "#fff",
                borderWidth: 1,
              },
              label: {show: false},
              tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.66)",
                extraCssText: "box-shadow: 1px 2px 8px 0 rgba(0, 0, 0, 0.24);",
                textStyle: {color: "#333333"},
                renderMode: 'html',
                formatter: function(params) {
                  return `
                  <div class="overview-tooltip-box">
                    <div class="tooltip-item"><div class="item-status red"></div>${params.data.down}</div>
                    <div class="tooltip-item"><div class="item-status green"></div>${params.data.up}</div>
                  </div>`;
                }
              },
              label: {
                normal: {
                  show: false,
                  position: 'center',
                  formatter: function(param){ // 设置圆饼图中间文字排版
                    return ['{name|' + param.name + '}',
                      '{percent|(' + param.percent + '%)}']
                      .join("\n");
                  },
                  rich: {
                    name: {
                      textAlign: 'center',
                      color: "#333",
                      fontSize: 19,
                      padding: 10
                    },
                    percent: {
                      textAlign: 'center',
                      color: "#333",
                      fontSize: 12,
                      padding: 10
                    }
                  }
                },
                emphasis: {
                  show: true, //文字至于中间时，这里需为true
                },
              },
            }];
            let legend = {
              show: true,
              orient: "vertical",
              top: "30%",
              right: 25,
              icon: "circle",
            };
            this.$refs.assetTypePie.setSeries(series, legend, legendData);
            this.$refs.assetTypePie.endLoading();
          }
        })
      },
      queryProjectData() {
        this.projectLoading = true;
        this.$get('overview/projectStat').then(response => {
          this.projectLoading = false;
          if (response.code === 200) {
            this.projectData = response.data;
          }
        })
      },
      queryModuleData() {
        this.moduleLoading = true;
        this.$get('overview/moduleStat').then(response => {
          this.moduleLoading = false;
          if (response.code === 200) {
            this.moduleData = response.data;
          }
        })
      },
      queryEndpointData() {
        this.endpointLoading = true;
        this.$get('overview/endpointStat').then(response => {
          this.endpointLoading = false;
          if (response.code === 200) {
            this.endpointData = response.data;
          }
        })
      },
      queryAlertMessageData() {
        this.alertMessageLoading = true;
        this.$get('overview/alertMessageStat').then(response => {
          this.alertMessageLoading = false;
          if (response.code === 200) {
            this.alertMessageData = response.data;
          }
        })
      },
      queryAlertRuleData() {
        this.$get('overview/alertRuleStat').then(response => {
          if (response.code === 200) {
            this.alertRuleData = response.data;
          }
        })
      },
      queryAlertTrendData() {
        this.$refs.chartbox.startLoading();
        this.chartSeries = [];
        let rxPromise = new Promise((resolve, reject) => {
          this.$get('/prom/api/v1/query_range', this.trendParamHandle('rx')).then(response=>{
            if(response.status == 'success'){
              if(response.data.result){
                let series={
                  name: 'RX',
                  symbol:'none',  //去掉点
                  smooth:0.2,  //曲线变平滑
                  data: [],
                  type:'line',
                  lineStyle: {
                    width: 1,
                    opacity: 0.9
                  },
                };
                if (response.data.result.length > 0) {
                  series.data=response.data.result[0].values.map((item)=>{
                    return [item[0]*1000,item[1]];
                  });
                }
                this.chartSeries.push(series);
                if (this.chartSeries.length == 2) {
                  this.$refs.chartbox.modifyOption("tooltip", "backgroundColor", "rgba(255, 255, 255, 0.66)");
                  this.$refs.chartbox.modifyOption("tooltip", "extraCssText", "box-shadow: 1px 2px 8px 0 rgba(0, 0, 0, 0.24);");
                  this.$refs.chartbox.modifyOption("tooltip", "textStyle", {color: "#000"});
                  this.$refs.chartbox.modifyOption("grid", "top", 40);
                  this.$refs.chartbox.modifyOption("grid", "left", 10);
                  this.$refs.chartbox.modifyOption("grid", "right", 40);
                  this.$refs.chartbox.modifyOption("grid", "bottom", 18);
                  this.$refs.chartbox.modifyOption("grid", "containLabel", true);
                  this.$refs.chartbox.setSeries(this.chartSeries);
                }
              }
              resolve(true);
            }else{
              console.error(response);
              resolve(false);
            }
          });
        });
        let txPromise = new Promise((resolve, reject) => {
          this.$get('/prom/api/v1/query_range', this.trendParamHandle('tx')).then(response=>{
            if(response.status == 'success'){
              if(response.data.result){
                let series={
                  name: 'TX',
                  symbol:'none',  //去掉点
                  smooth:0.2,  //曲线变平滑
                  data: [],
                  type:'line',
                  lineStyle: {
                    width: 1,
                    opacity: 0.9
                  },
                };
                if (response.data.result.length > 0) {
                  series.data=response.data.result[0].values.map((item)=>{
                    return [item[0]*1000,item[1]];
                  });
                }
                this.chartSeries.push(series);
                if (this.chartSeries.length == 2) {
                  this.$refs.chartbox.modifyOption("tooltip", "backgroundColor", "rgba(255, 255, 255, 0.66)");
                  this.$refs.chartbox.modifyOption("tooltip", "extraCssText", "box-shadow: 1px 2px 8px 0 rgba(0, 0, 0, 0.24);");
                  this.$refs.chartbox.modifyOption("tooltip", "textStyle", {color: "#000"});
                  this.$refs.chartbox.modifyOption("grid", "top", 40);
                  this.$refs.chartbox.modifyOption("grid", "left", 10);
                  this.$refs.chartbox.modifyOption("grid", "right", 40);
                  this.$refs.chartbox.modifyOption("grid", "bottom", 18);
                  this.$refs.chartbox.setSeries(this.chartSeries);
                }
              }
              resolve(true);
            }else{
              console.error(response)
              resolve(false);
            }
          });
        });
        Promise.all([rxPromise, txPromise]).then(resolve => {
          this.$refs.chartbox.endLoading();
        }, reject => {
          this.$refs.chartbox.endLoading();
        });
      },
      trendParamHandle(t) {
        let before;
        let end;
        if (this.trendSearchParam.start) {
          before = this.trendSearchParam.start;
        } else {
          before = new Date();
          before.setHours(new Date().getHours()-1);
          before = this.dateFormat('yyyy-mm-dd HH:MM:SS', before);
        }
        if (this.trendSearchParam.end) {
          end = this.trendSearchParam.end;
        } else {
          end = new Date();
          end = this.dateFormat('yyyy-mm-dd HH:MM:SS', end);
        }
        let metric;
        let rule;
        if (t == 'rx') {
          metric = {rx: '"1"'};
          rule = "ifInOctets";
        } else if (t == 'tx') {
          metric = {tx: '"1"'};
          rule = "ifOutOctets";
        }
        if (this.trendSearchParam.select.length > 0) {
          //console.info("select", this.trendSearchParam.select);
          let dc = [];
          let tags = [];
          this.trendSearchParam.select.forEach(select => {
            let item = select[select.length-1];
            let type = item.split("::")[0];
            let value = item.split("::")[1];
            if (type == "$dc$") {
              dc.push(value);
            } else if (type == "$key$") {
              /*let hasDc = dc.some(d => {
                if (d == select[0].split("::")[1]) {
                  return true;
                }
                return false;
              });
              if (!hasDc) {
                dc.push(select[0].split("::")[1]);
              }
              let hasKey = tags.some(tag => {
                if (tag.key == value) {
                  //选择所有这个tag的value
                  first: for (let i = 0; i < this.trafficData.length; i++) {
                    for (let j = 0; j < this.trafficData[i].children.length; j++) {
                      let originalTag = this.trafficData[i].children[j];
                      if (originalTag.label == tag.key) {
                        tag.value = [];
                        for (let k = 0; k < originalTag.children.length; k++) {
                          tag.value.push(originalTag.children[k].label);
                        }
                        break first;
                      }
                    }
                  }
                }
                return false;
              });
              if (!hasKey) {
                //选择所有这个tag的value
                let tag = {key: value, value: []};
                first: for (let i = 0; i < this.trafficData.length; i++) {
                  for (let j = 0; j < this.trafficData[i].children.length; j++) {
                    let originalTag = this.trafficData[i].children[j];
                    if (originalTag.label == tag.key) {
                      for (let k = 0; k < originalTag.children.length; k++) {
                        tag.value.push(originalTag.children[k].label);
                      }
                      break first;
                    }
                  }
                }
                tags.push(tag);
              }*/
            } else {
              let dcIndex = dc.indexOf(select[0].split("::")[1]);
              if (dcIndex == -1) {
                dc.push(select[0].split("::")[1]);
              }
              let key = select[1].split("::")[1];
              let hasKey = tags.some(tag => {
                if (tag.key == key) {
                  let hasValue = tag.value.some(v => {
                    return v == value;
                  });
                  if (!hasValue) {
                    tag.value.push(value);
                  }
                  return true;
                }
                return false;
              });
              if (!hasKey) {
                tags.push({key: key, value: [value]});
              }
            }
          });
          if (dc.length == 1) {
            metric.datacenter = '"' + dc[0] + '"';
          } else if (dc.length > 1) {
            metric.datacenter = '~"' + dc.join("|") + '"';
          }
          tags.forEach(item => {
            if (item.value.length == 1) {
              metric[item.key] = '"' + item.value[0] + '"';
              //eval('metric.' + item.key + '="' + item.value[0] + '"');
            } else if (item.value.length > 1) {
              metric[item.key] = '~"' + item.value.join("|") + '"';
              //eval('metric.' + item.key + '="~' + item.value.join("|") + '"');
            }
          });
        }
        let metricString = "{";
        for (let key in metric) {
          metricString += key + "=" + metric[key] + ",";
        }
        metricString = metricString.substring(0, metricString.length-1);
        metricString += "}";
        let params = {
          start: this.$stringTimeParseToUnix(before),
          end: this.$stringTimeParseToUnix(end),
          step: bus.getStep(before, end),
          query: 'sum(irate(' + rule + metricString + '[' + (this.trendSearchParam.timeRange ? this.trendSearchParam.timeRange : "1h") + ']))'
        };
        //console.info("params", params);
        return params;
      },
      queryMapChartGeoJson() {
        this.$refs.dataCenterMap.startLoading();
        /*this.$get('/sysConfig?paramKey=geoJson').then(response=>{
          this.$refs.dataCenterMap.endLoading();
          if(response.code == 200){
            this.map={
              name:'Kazakhstan',
              geoJson:response.data.paramKey
            }
            console.info(this.map)
            setTimeout(()=>{this.queryDataCenterMapData();},200)
          }else{
            this.$refs.dataCenterMap.endLoading();
            console.error('loading map info faild')
          }
        })*/
        //let m = {
        /*this.map = {
          name: "Kazakhstan",
          geoJson: {geoJson: JSON.stringify({"type":"FeatureCollection","features":[
              {"type":"Feature","id":"KAZ","properties":{"name":"Kazakhstan"},"geometry":{"type":"Polygon","coordinates":[[[70.962315,42.266154],[70.388965,42.081308],[69.070027,41.384244],[68.632483,40.668681],[68.259896,40.662325],[67.985856,41.135991],[66.714047,41.168444],[66.510649,41.987644],[66.023392,41.994646],[66.098012,42.99766],[64.900824,43.728081],[63.185787,43.650075],[62.0133,43.504477],[61.05832,44.405817],[60.239972,44.784037],[58.689989,45.500014],[58.503127,45.586804],[55.928917,44.995858],[55.968191,41.308642],[55.455251,41.259859],[54.755345,42.043971],[54.079418,42.324109],[52.944293,42.116034],[52.50246,41.783316],[52.446339,42.027151],[52.692112,42.443895],[52.501426,42.792298],[51.342427,43.132975],[50.891292,44.031034],[50.339129,44.284016],[50.305643,44.609836],[51.278503,44.514854],[51.316899,45.245998],[52.16739,45.408391],[53.040876,45.259047],[53.220866,46.234646],[53.042737,46.853006],[52.042023,46.804637],[51.191945,47.048705],[50.034083,46.60899],[49.10116,46.39933],[48.593241,46.561034],[48.694734,47.075628],[48.057253,47.743753],[47.315231,47.715847],[46.466446,48.394152],[47.043672,49.152039],[46.751596,49.356006],[47.54948,50.454698],[48.577841,49.87476],[48.702382,50.605128],[50.766648,51.692762],[52.328724,51.718652],[54.532878,51.02624],[55.716941,50.621717],[56.777961,51.043551],[58.363291,51.063653],[59.642282,50.545442],[59.932807,50.842194],[61.337424,50.79907],[61.588003,51.272659],[59.967534,51.96042],[60.927269,52.447548],[60.739993,52.719986],[61.699986,52.979996],[60.978066,53.664993],[61.436591,54.006265],[65.178534,54.354228],[65.666876,54.601267],[68.1691,54.970392],[69.068167,55.38525],[70.865267,55.169734],[71.180131,54.133285],[72.22415,54.376655],[73.508516,54.035617],[73.425679,53.48981],[74.384845,53.546861],[76.8911,54.490524],[76.525179,54.177003],[77.800916,53.404415],[80.03556,50.864751],[80.568447,51.388336],[81.945986,50.812196],[83.383004,51.069183],[83.935115,50.889246],[84.416377,50.3114],[85.11556,50.117303],[85.54127,49.692859],[86.829357,49.826675],[87.35997,49.214981],[86.598776,48.549182],[85.768233,48.455751],[85.720484,47.452969],[85.16429,47.000956],[83.180484,47.330031],[82.458926,45.53965],[81.947071,45.317027],[79.966106,44.917517],[80.866206,43.180362],[80.18015,42.920068],[80.25999,42.349999],[79.643645,42.496683],[79.142177,42.856092],[77.658392,42.960686],[76.000354,42.988022],[75.636965,42.8779],[74.212866,43.298339],[73.645304,43.091272],[73.489758,42.500894],[71.844638,42.845395],[71.186281,42.704293],[70.962315,42.266154]]]}}
            ]})}
        };*/
        this.map = {
          name: "world",
          geoJson: {geoJson: world.worldData}
        };

        setTimeout(()=>{this.queryDataCenterMapData();this.$refs.dataCenterMap.endLoading();},200)
      },
      queryDataCenterMapData() {
        let language=localStorage.getItem("nz-language") ? localStorage.getItem("nz-language") : 'en';
        let requests=[axios.get('/idc?pageSize=-1'),axios.get('/overview/datacenterStat')];
        axios.all(requests).then((result)=>{
          if(result){
            let seriesDatas=[];
            this.$refs.dataCenterMap.setSeries(this.dataCenterMapSeries);
            let idcInfos=null;
            let dcStats=null;
            if(result[0].data && result[0].data.code == 200){
              idcInfos=result[0].data.data.list;
            }
            if(result[1].data && result[1].data.code == 200){
              dcStats=result[1].data.data.dcStat;
            }
            if(idcInfos && dcStats){
              let dcStatsCopy=Object.assign([],dcStats);
              dcStatsCopy.sort((a,b)=>{
                return a.assetTotal - b.assetTotal;
              });
              let bigScatter=25;
              let mediumScatter=20;
              let smallScatter=15;
              let maxAssetTotal=dcStatsCopy[dcStatsCopy.length-1].assetTotal;

              let bigBoundary=Number.parseInt(maxAssetTotal/3*2);
              let mediumBoundary=Number.parseInt(maxAssetTotal/3);
              for(let dcStat of dcStats){
                let dcId=dcStat.id;
                let dcInfo=idcInfos.find((item)=>{
                  return item.id == dcId ;
                })
                let areaInfo=dcInfo.area;
                if(areaInfo){
                  let areaName='';
                  if(areaInfo.i18n){
                    areaName=JSON.parse(areaInfo.i18n)[language];
                  }else{
                    areaName=areaInfo.name;
                  }
                  let symbolSize=mediumScatter;
                  if(dcStat.assetTotal>=bigBoundary){
                    symbolSize=bigScatter;
                  }else if(dcStat.assetTotal<bigBoundary && dcStat.assetTotal>= mediumBoundary){
                    symbolSize=mediumScatter;
                  }else{
                    symbolSize=smallScatter;
                  }

                  seriesDatas.push({
                    name:areaName,
                    value:[areaInfo.longitude,areaInfo.latitude,dcStat],
                    symbolSize:symbolSize,
                  });
                }
              }
            }
            this.$refs.dataCenterMap.modifyOption('tooltip','formatter',this.mapTooltipFormatter)
            this.$refs.dataCenterMap.modifyOption('tooltip','borderColor',"rgba(221,228,237,1)")
            this.dataCenterMapSeries=[{
              name: 'DataCenter',
              type: 'scatter',
              coordinateSystem: 'geo',
              label: {
                formatter: '{b}',
                position: 'right',
                show: false
              },
              itemStyle: {
                color: 'orange'
              },
              emphasis: {
                label: {
                  show: true
                }
              },
              data:seriesDatas
            }]
            this.$refs.dataCenterMap.setSeries(this.dataCenterMapSeries);
          }
        })
      },
      queryAlertStatByRule() {
        this.$refs.ruleMessage.startLoading();
        this.$get('overview/alertStatByRule', {top: this.topFilter.rule}).then(response => {
          if (response.code === 200) {
            let seriesData = [];
            let categoryData = [];
            response.data.list.forEach(item => {
              seriesData.splice(0, 0, item.nums);
              categoryData.splice(0, 0, item.alertName);
            });
            this.messageByRuleSeries = {
              name: 'alertStatByRule',
              data: seriesData,
              type: 'bar',
              barMaxWidth: 15,
              itemStyle: {
                color: function(params) {
                  let colorList = ["#ECCD82", "#99CEB9"];;
                  if(params.dataIndex % 2 == 0){
                    return colorList[0]
                  }else{
                    return colorList[1]
                  }
                },
              },
              category: categoryData, //自定义，用来判断N/A是否显示
            };
            this.$refs.ruleMessage.modifyOption('yAxis', 'data', categoryData);
            this.$refs.ruleMessage.setSeries(this.messageByRuleSeries);
            this.$refs.ruleMessage.endLoading();
          }
        });
      },
      queryAlertStatByAsset() {
        this.$refs.assetMessage.startLoading();
        this.$get('overview/alertStatByAsset', {top: this.topFilter.asset}).then(response => {
          if (response.code === 200) {
            let seriesData = [];
            let categoryData = [];
            response.data.list.forEach(item => {
              seriesData.splice(0, 0, item.nums);
              categoryData.splice(0, 0, item.host);
            });
            this.messageByAssetSeries = {
              name: 'alertStatByAsset',
              data: seriesData,
              type: 'bar',
              barMaxWidth: 15,
              category: categoryData,
              itemStyle: {
                color: function(params) {
                  let colorList = ["#ECCD82", "#99CEB9"];;
                  if(params.dataIndex % 2 == 0){
                    return colorList[0]
                  }else{
                    return colorList[1]
                  }
                },
              },
            };
            this.$refs.assetMessage.modifyOption('yAxis', 'data', categoryData);
            this.$refs.assetMessage.setSeries(this.messageByAssetSeries);
            this.$refs.assetMessage.endLoading();
          }
        });
      },
      queryAlertStatByModule() {
        this.$refs.moduleMessage.startLoading();
        this.$get('overview/alertStatByModule', {top: this.topFilter.module}).then(response => {
          if (response.code === 200) {
            let seriesData = [];
            let categoryData = [];
            response.data.list.forEach(item => {
              seriesData.splice(0, 0, item.nums);
              categoryData.splice(0, 0, item.module);
            });
            this.messageByModuleSeries = {
              name: 'alertStatByModule',
              data: seriesData,
              type: 'bar',
              barMaxWidth: 30,
              category: categoryData
            };
            this.$refs.moduleMessage.modifyOption('xAxis', 'data', categoryData);
            this.$refs.moduleMessage.setSeries(this.messageByModuleSeries);
            this.$refs.moduleMessage.endLoading();
          }
        });
      },
      getDcTrafficData() {
        this.$get('idc/trafficSetting', {pageSize: -1}).then(response => {
          if (response.code === 200) {
            this.trafficData = this.convertTrafficData(response.data.list);
          }
        });
      },
      convertTrafficData(data) {
        let result = [];
        data.forEach(item => {
          let hasDc = result.some(dc => { //dc去重
            if (item.idc && dc.label == item.idc.name) {
              return true;
            }
          });
          if (item.idc && !hasDc) {
            result.push({label: item.idc.name, value: "$dc$::" + item.idc.name, level: 1});
          }
        });
        function handleTag(dc, tagData) { // dc: cascader数据里的第一级；tagData: 原始数据中的tags
          if (tagData) {
            let tags = dc.children;
            for (let key in tagData) {
              let hasKey = tags.some(tag => { //tag-key去重
                if (tag.label == key) {
                  let hasValue = tag.children.some(value => { //tag-value去重
                    return value.label == tagData[key];
                  });
                  if (!hasValue) {
                    tag.children.push({label: tagData[key], value: key + "::" + tagData[key], level: 3});
                  }
                  return true;
                }
                return false;
              });
              if (!hasKey) {
                tags.push({label: key, value: "$key$::" + key, children: [{label: tagData[key], value: key + "::" + tagData[key]}], level: 2});
              }
            }
            dc.children = tags;
          }
        }
        return result;
      },
      /*初始化数据 end*/
      dateChange(val) {
        this.trendSearchParam.start = val[0];
        this.trendSearchParam.end = val[1];
        this.trendSearchParam.timeRange = val[2];
        this.queryAlertTrendData();
      },
      topNChange(type, top) {
        this.topFilter[type] = top;
        if (type == 'asset') {
          this.queryAlertStatByAsset();
        } else if (type == 'module') {
          this.queryAlertStatByModule();
        } else if (type == 'rule') {
          this.queryAlertStatByRule();
        }
      },
      /*selectDatacenter(dc) {
        let index = this.trendSearchParam.dc.indexOf(parseInt(dc.id));
        if (index == -1) {
          this.trendSearchParam.dc.push(parseInt(dc.id));
        } else {
          this.trendSearchParam.dc.splice(index, 1);
        }
        this.queryAlertTrendData();
      },
      selectTag(tag) {
        let index = -1;
        this.trendSearchParam.tag.some((item, i) => {
          if (item.name == tag.name && item.value == tag.value) {
            index = i;
            return true;
          }
          return false;
        });
        if (index == -1) {
          this.trendSearchParam.tag.push(tag);
        } else {
          this.trendSearchParam.tag.splice(index, 1);
        }
        this.queryAlertTrendData();
      },*/
      alertMessageChange(type) {
        this.bottom3DropdownShow = false;
        this.alertMessageShow = type;
        this.$nextTick(() => {
          if (type == 'asset') {
            this.queryAlertStatByAsset();
          } else if (type == 'module') {
            this.queryAlertStatByModule();
          }
        });
      },

      mapTooltipFormatter(params){
        let dcStat = params.data.value[2];
        let tooltip=`
            <div class="tooltip">
                <div style="margin-left: 12px; color: black">${dcStat.name}</div>
                <div class="flex-box">
                   <div style="width: 60%;">
                        <table  style="width: 100%;" class="tooltip-table">
                            <tr ><td colspan="3"><div style="display: flex;justify-content: space-between"><div>${this.$t('dashboard.overview.mapTooltip.asset')}</div><div>${this.$t('dashboard.overview.mapTooltip.total')}: ${dcStat.assetTotal}</div></div></td></tr>
                            <tr>
                                <td rowspan="2">${this.$t('dashboard.overview.mapTooltip.state')}</td>
                                <td >${this.$t('dashboard.overview.mapTooltip.inStock')}</td>
                                <td >${dcStat.assetInStock}</td>
                            </tr>
                            <tr>
                                <td >${this.$t('dashboard.overview.mapTooltip.outStock')}</td>
                                <td >${dcStat.assetOutStock}</td>
                            </tr>
                            <tr>
                                <td rowspan="2">${this.$t('dashboard.overview.mapTooltip.ping')}</td>
                                <td >${this.$t('dashboard.overview.mapTooltip.active')}</td>
                                <td >${dcStat.assetPingUp}</td>
                            </tr>
                            <tr>
                                <td >${this.$t('dashboard.overview.mapTooltip.inactive')}</td>
                                <td >${dcStat.assetPingDown}</td>
                            </tr>
                            <tr>
                                <td rowspan="3">${this.$t('dashboard.overview.mapTooltip.alert')}</td>
                                <td >${this.$t('dashboard.overview.mapTooltip.high')}</td>
                                <td >${dcStat.alertHigh}</td>
                            </tr>
                            <tr>
                                <td >${this.$t('dashboard.overview.mapTooltip.medium')}</td>
                                <td >${dcStat.alertMedium}</td>
                            </tr>
                            <tr>
                                <td >${this.$t('dashboard.overview.mapTooltip.low')}</td>
                                <td >${dcStat.alertLow}</td>
                            </tr>
                        </table>
                   </div>
                   <div style="width: 30%;" class="flex-box column-box">
                      <div  >
                        <table style="width: 100%;" class="tooltip-table">
                            <tr><td colspan="2"><div style="display: flex;justify-content: space-between"><div>${this.$t('dashboard.overview.mapTooltip.endpoint')}</div><div>${this.$t('dashboard.overview.mapTooltip.total')}: ${dcStat.endpointTotal}</div></div></td></tr>
                            <tr>
                                <td>${this.$t('dashboard.overview.mapTooltip.up')}</td>
                                <td>${dcStat.endpointUp}</td>
                            </tr>
                            <tr>
                                <td>${this.$t('dashboard.overview.mapTooltip.down')}</td>
                                <td>${dcStat.endpointDown}</td>
                            </tr>
                        </table>
                      </div>
                       <div >
                           <table style="width: 100%;" class="tooltip-table">
                            <tr><td colspan="2"><div style="display: flex;justify-content: space-between"><div>${this.$t('dashboard.overview.mapTooltip.prometheus')}</div><div>${this.$t('dashboard.overview.mapTooltip.total')}: ${dcStat.promTotal}</div></div></td></tr>
                            <tr>
                                <td>${this.$t('dashboard.overview.mapTooltip.up')}</td>
                                <td>${dcStat.promUp}</td>
                            </tr>
                            <tr>
                                <td>${this.$t('dashboard.overview.mapTooltip.down')}</td>
                                <td>${dcStat.promDown}</td>
                            </tr>
                           </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return tooltip;
      },
      simpleFormatter(params) {
        return `<div class="tooltip" style="min-width: unset;">${params.name}:&nbsp;${params.value}</div>`;
      },
      assetTypeFormatter(params) {
        return `<div class="tooltip" style="min-width: unset;">${params.name}:&nbsp;${params.value}</div>`;
      },
      switchFullScreen:function(){
        this.isFullScreen = this.judgeFullScreen();
        if(this.isFullScreen){
          this.exitFullScreen();
        }else{
          this.fullScreen();
        }
      },
      judgeFullScreen:function(){
        return document.isFullScreen || document.mozIsFullScreen || document.webkitIsFullScreen;
      },
      fullScreen:function(){
        let container = document.querySelector(".overview");
        let fullScreenFunc=container.requestFullscreen||container.mozRequestFullScreen||container.webkitRequestFullscreen||container.msRequestFullscreen;
        fullScreenFunc.call(container);
        this.isFullScreen = true;
      },
      exitFullScreen:function(){
        if(document.exitFullscreen) {
          document.exitFullscreen();
        } else if(document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if(document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
        this.isFullScreen = false;
      },
      alertMessageDropdownHandler(show) {
        if (show) {
          clearTimeout(timeout);
          this.bottom3DropdownShow = true;
        } else {
          timeout = setTimeout(() => {
            this.bottom3DropdownShow = false;
          }, 700);
        }
      },
      /*header 时间处理 start*/
      initDate:function(){
        this.sysTime=this.getTime();
        this.sysDate=this.getDate();
        this.sysWeek=this.getWeek();
        this.freshTime();
      },
      freshTime:function(){
        let $temp=this;
        setInterval(function(){
          $temp.sysTime=$temp.getTime()
          $temp.sysDate=$temp.getDate();
          $temp.sysWeek=$temp.getWeek();
        },1000)
      },
      getTime:function(){
        let date=new Date();
        let hours=date.getHours()>9?date.getHours():'0'+date.getHours();
        let minutes=date.getMinutes()>9?date.getMinutes():'0'+date.getMinutes();
        let seconds=date.getSeconds()>9?date.getSeconds():'0'+date.getSeconds();
        return hours+':'+minutes+':'+seconds;
      },
      getDate:function(){
        let date=new Date();
        let years=date.getFullYear();
        let months=date.getMonth()+1>9?date.getMonth()+1:'0'+(date.getMonth()+1);
        let days=date.getDate()>9?date.getDate():'0'+date.getDate();
        return years+'-'+months+'-'+days;
      },
      getWeek:function(){
        let language=localStorage.getItem("nz-language") ? localStorage.getItem("nz-language") : 'en';
        let enWeeks=['SUN','MON','TUE','WED','THU','FRI','SAT'];
        let cnWeeks=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
        let date=new Date();
        let day=date.getDay();
        if(language == 'en'){
          return enWeeks[day];
        }else if(language == 'cn'){
          return cnWeeks[day];
        }else{
          return enWeeks[day];
        }
      },
      dateFormat:function(fmt, date) {
        let ret;
        const opt = {
          "y+": date.getFullYear().toString(),        // 年
          "m+": (date.getMonth() + 1).toString(),     // 月
          "d+": date.getDate().toString(),            // 日
          "H+": date.getHours().toString(),           // 时
          "M+": date.getMinutes().toString(),         // 分
          "S+": date.getSeconds().toString()          // 秒
          // 有其他格式化字符需求可以继续添加，必须转化成字符串
        };
        for (let k in opt) {
          ret = new RegExp("(" + k + ")").exec(fmt);
          if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
          };
        };
        return fmt;
      },
      /*header 时间处理end*/
      jumpTo(data, id) {
        bus.$emit("menu-change", data);
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
      trendTool(type, param1, param2, param3) {
        if (type == 'difference') { //两个数组的差集
          return trendSelectDifference(param1, param2);
        } else if (type == 'containArray') {
          return containArray(param1, param2, param3);
        } else if (type == 'sameLevelActive') {
          return sameLevelActive(param1, param2, param3);
        } else if (type == 'sameLevel') {
          return sameLevel(param1, param2, param3);
        } else if (type == 'active') {
          return active(param1, param2, param3);
        }
        function trendSelectDifference(short, long) {
          let difference = [];
          first: for (let i = 0; i < long.length; i++) {
            if (i == short.length) {
              difference.push([long[i], i]);
              break;
            }
            if (short[i].length != long[i].length) {
              difference.push([long[i], i]);
              break;
            }
            for (let j = 0; j < long[i].length; j++) {
              if (long[i][j] != short[i][j]) {
                difference.push([long[i], i]);
                break first;
              }
            }
          }
          return difference;
        }
        function containArray(item, arr, level) { //return [index, levelIndex];
          let index = -1, levelIndex = 0;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].length == level) {
              let flag = 0;
              for (let j = 0; j < level; j++) {
                if (arr[i][j] == item[j]) {
                  flag++;
                }
              }
              if (flag == level) {
                index = i;
                break;
              } else {
                levelIndex++;
              }
            }
          }
          return [index, levelIndex];
        }
        function sameLevelActive(item, arr, level) { //已选中的同级项的index
          let indexes = [];
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].length == level) {
              let flag = true;
              for (let j = 0; j < level-1; j++) {
                if (arr[i][j] != item[j]) {
                  flag = false;
                }
              }
              if (flag) {
                indexes.push(i);
              }
            }
          }
          return indexes;
        }
        function sameLevel(item, arr, level) { //所有3级的同级项data（从原始数据trafficData查）
          let result = [];
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].value == item[0] && arr[i].children) {
              for (let j = 0; j < arr[i].children.length; j++) {
                if (arr[i].children[j].value == item[1]) {
                  let temp = arr[i].children[j].children;
                  if (temp) {
                    for (let k = 0; k < temp.length; k++) {
                      result.push([item[0], item[1], temp[k].value]);
                    }
                  }
                  return result;
                }
              }
            }
          }
          return result;
        }
        function active(level, index, isActive) {
          let levels = document.querySelectorAll(".trend-cascader .el-cascader-panel .el-cascader-menu");
          if (levels.length >= level) {
            let items = levels[level-1].querySelectorAll("li");
            if (items.length >= index) {
              if (isActive) {
                items[index].classList.add("is-active");
                items[index].querySelector("label").classList.add("is-checked");
                items[index].querySelector("label>.el-checkbox__input").classList.add("is-checked");
              } else {
                items[index].classList.remove("is-active");
                items[index].querySelector("label").classList.remove("is-checked");
                items[index].querySelector("label>.el-checkbox__input").classList.remove("is-checked");
              }
            }
          }
        }
      }
    },
    watch: {
      "trendSearchParam.select": function(n, o) {
        /*console.info("n", n);
        console.info("o", o);*/
        this.queryAlertTrendData();
        /*let tempN = JSON.parse(JSON.stringify(n));
        if (n.length == o.length || !this.trendSearchParam.watch) {
          this.trendSearchParam.watch = true;
          return false;
        }
        let isAdd = tempN.length > o.length ? true : false; //true是新增，false是减少
        let difference = isAdd ? this.trendTool('difference', o, tempN) : this.trendTool('difference', tempN, o);
        console.info("difference", difference);
        if (difference[0][0].length == 1) {

        } else if (difference[0][0].length == 2) {
          if (isAdd) { //二级选中，三级全取消则全选中
            let level3 = this.trendTool('sameLevel', difference[0][0], this.trafficData, 3);
            if (level3.length > 0) {
              let level2Index = this.trendTool('containArray', difference[0][0], tempN, 2); //二级的index
              if (level2Index[0] != -1) {
                for (let i = level3.length-1; i >= 0; i--) {
                  tempN.splice(difference[0][1]+1, 0, level3[i]);
                }
                this.trendSearchParam.watch = false;
              }
            }
          } else { //二级取消，三级有选中则全取消，无选中不变
            let temp = JSON.parse(JSON.stringify(difference[0][0]));
            temp.push("temp");
            let indexes = this.trendTool('sameLevelActive', temp, tempN, 3);
            //console.info("indexes", indexes);
            if (indexes.length > 0) {
              for (let i = indexes.length-1; i >= 0; i--) {
                tempN.splice(indexes[i], 1);
              }
              this.trendSearchParam.watch = false;
            }
          }
        } else if (difference[0][0].length == 3) {
          if (isAdd) { //三级选中，二级取消则选中
            let index = this.trendTool('containArray', [difference[0][0][0], difference[0][0][1]], tempN, 2); //二级的index
            console.info("index", index);
            if (index[0] == -1) {
              tempN.splice(difference[0][1], 0, [difference[0][0][0], difference[0][0][1]]); //插入二级
              //let afterIndex = this.trendTool('containArray', [difference[0][0][0], difference[0][0][1]], tempN, 2); //插入后的index
              //console.info("afterIndex", afterIndex);
              //this.trendTool('active', 2, index[1], true); //dom处理
              this.trendSearchParam.watch = false;
            }
          } else { //三级取消，若同级全取消则二级取消
            let indexes = this.trendTool('sameLevelActive', difference[0][0], tempN, 3);
            //console.info("indexes", indexes);
            if (indexes.length == 0) {
              let level2Index = this.trendTool('containArray', [difference[0][0][0], difference[0][0][1]], tempN, 2);
              //console.info("level2Index", level2Index);
              if (level2Index[0] > -1) {
                this.trendTool('active', 2, level2Index[1], false);
                tempN.splice(level2Index[0], 1);
                this.trendSearchParam.watch = false;
              }
            }
          }
        }
        this.trendSearchParam.select = JSON.parse(JSON.stringify(tempN));
        this.queryAlertTrendData();*/
      }
    },
    mounted() {
      this.initData();
      this.initDate();
      /*window.onresize = () => {
        setTimeout(() => {
          this.$parent.$parent.update();
        }, 100);
      }*/
    },
    /*destroyed() {
      window.onresize = null;
    }*/
  }
</script>

<style lang="scss">
  @import "./overview2.scss";
  .tooltip{
    padding: 5px;
    min-width: 500px;
    background-color: rgba(255, 255, 255, 0.7);
    box-shadow: 1px 2px 8px 0 rgba(0, 0, 0, 0.24);
  }
  .tooltip-table{
    border-spacing: 0;
    border-collapse: collapse;
  }
  .tooltip-table tr{
    display: table-row;
    vertical-align: inherit;
  }
  .tooltip-table td{
    min-width: 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    text-overflow: ellipsis;
    vertical-align: middle;
    text-align: left;
    border: 1px solid #ccc;
    display: table-cell;
    padding: 0 5px ;
    color: black;
  }
  .flex-box{
    display: flex;
    justify-content: space-around;
  }
  .column-box{
    flex-direction: column;
    justify-content: space-between !important;
  }
</style>
