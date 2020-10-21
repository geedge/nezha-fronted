<template>
  <div class="overview" style="background-color: #f9f9f9;">
    <!--自定义地图鼠标悬浮提示dom，避免被overflow：hidden裁剪-->
    <div class="my-pane" :style="{'left': `${tooltip.x}px`, 'top': `${tooltip.y}px`}"></div>
    <!--标题-->
    <div class="overview-content-header">
      <div class="header-title" :class="{'hide-div':!isFullScreen}">{{systemName&&systemName != 'undefined'&&systemName != null?systemName: $t('dashboard.overview.contentTitle')}}</div>
      <div class="overview-loading"><loading ref="overviewLoading" ></loading></div>
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
          <div class="content-col-content clickable" v-loading="assetLoading" @click="jumpTo('asset')">
            <div class="content-col-content-icon"><i class="nz-icon nz-icon-overview-project"></i></div>
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
            <div class="content-col-content-icon"><i class="nz-icon nz-icon-project"></i></div>
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
          <div class="content-col-content clickable" v-loading="alertMessageLoading" @click="jumpTo('alertList')">
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
            <!--<chart-box chart-type="map" :tooltip-formatter="mapTooltipFormatter" :map="map" ref="dataCenterMap" @is-loading="(isLoading)=>{this.mapLoading = isLoading}"></chart-box>-->
            <div id="map" style="height: 100%; width: 100%"></div>

            <!--<div class="right-bottom-zoom">
              <div class="zoom-option" style="border-bottom: 1px solid #c5c8cb;" @click="zoomMap(1)"><span><i class="nz-icon nz-icon-enlarge"></i></span></div>
              <div class="zoom-option" @click="zoomMap(-1)"><span><i class="nz-icon nz-icon-narrow"></i></span></div>
              <div></div>
            </div>-->
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
            <div class="chart-no-data"v-if="!assetTypeLoading && (!assetData.typeStat || assetData.typeStat.length == 0)">No Data</div>
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
            <div class="chart-no-data" v-if="!alertMessageLoading && ((!messageByAssetSeries.data && !messageByAssetSeries.category) || (messageByAssetSeries.data.length == 0 && messageByAssetSeries.category.length == 0))">No Data</div>
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
            <div class="chart-no-data" v-if="!ruleMessageLoading && ((!messageByRuleSeries.data && !messageByRuleSeries.category) || (messageByRuleSeries.data.length == 0 && messageByRuleSeries.category.length == 0))">No Data</div>
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
  import i18n from '../../../../components/common/i18n'
  import axios from 'axios';
  import bus from '../../../../libs/bus';
  import timePicker from '../../../common/timePicker';
  import VueCountUp from 'vue-countupjs';
  import * as world from "../../../common/js/world";
  import 'leaflet/dist/leaflet.css'
  // 引入Leaflet对象 挂载到Vue上，便于全局使用，也可以单独页面中单独引用
  import * as L from 'leaflet'
  import icon from 'leaflet/dist/images/marker-icon.png';
  import iconShadow from 'leaflet/dist/images/marker-shadow.png';
  import echarts from "echarts";
  import chartConfig from './chartConfig'

  var timeout; //第三行第三个图的dropdown下拉菜单timeout

  var tooltipEndpointChart;
  var tooltipPrometheusChart;

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
        system_server_time:null,
        freshDateTimer:null,
        freshDataTimer:null,

        tooltip: {
          x: 0,
          y: 0
        }
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
        return [
          this.querySystemState(),
          this.queryAssetData(),
          this.queryProjectData(),
          this.queryModuleData(),
          this.queryEndpointData(),
          this.queryAlertMessageData(),
          this.queryAlertRuleData(),
          this.queryAlertTrendData(),
          this.initMap(),
          this.queryAlertStatByRule(),
          this.queryAlertStatByAsset(),
          this.getDcTrafficData()
        ]
      },
      setFreshDataTimer:function(){
        this.freshDataTimer=setInterval(()=>{
          if(this.$refs.overviewLoading){
            this.$refs.overviewLoading.startLoading();
          }
          Promise.all(this.initData()).then(()=>{
            if(this.$refs.overviewLoading){
              this.$refs.overviewLoading.endLoading();
            }
          })
        },5*60*1000)
      },
      querySystemState:function(){
        return new Promise(resolve => {
          this.$get('/healthy').then(response=>{
            if(response.code==200){
              if(response.time){
                this.system_server_time=this.utcTimeToTimezone(response.time)
              }else{
                this.system_server_time=bus.computeTimezone(new Date().getTime())
              }
            }else{
              this.system_server_time=bus.computeTimezone(new Date().getTime())
            }
            resolve();
          })
        })
      },
      queryAssetData() {
        return new Promise(resolve => {
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
                vm.assetData.typeStat && vm.assetData.typeStat.forEach(item => {
                  count += item.total;
                });
                return count;
              }();

              vm.assetData.typeStat && this.assetData.typeStat.forEach(item => {
                legendData.push([item.name, (item.total*100/assetTotalCount).toFixed(2)]);
                typeSeriesData.push({name: item.name, value: item.total, up: item.pingUp, down: item.pingDown});
              });
              let series = [{
                name: 'Type',
                data: typeSeriesData.sort((a, b) => {return a.value > b.value ? -1 : 1}),
                type: 'pie',
                radius: ["43%", "55%"],
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
              this.assetData.typeStat && this.$refs.assetTypePie.setSeries(series, legend, legendData);
              this.$refs.assetTypePie.endLoading();
            }
            resolve()
          })
        })
      },
      queryProjectData() {
        return new Promise(resolve => {
          this.projectLoading = true;
          this.$get('overview/projectStat').then(response => {
            this.projectLoading = false;
            if (response.code === 200) {
              this.projectData = response.data;
            }
            resolve();
          })
        })
      },
      queryModuleData() {
        return new Promise(resolve => {
          this.moduleLoading = true;
          this.$get('overview/moduleStat').then(response => {
            this.moduleLoading = false;
            if (response.code === 200) {
              this.moduleData = response.data;
            }
            resolve();
          })
        })
      },
      queryEndpointData() {
        return new Promise(resolve => {
          this.endpointLoading = true;
          this.$get('overview/endpointStat').then(response => {
            this.endpointLoading = false;
            if (response.code === 200) {
              this.endpointData = response.data;
            }
            resolve();
          })
        })
      },
      queryAlertMessageData() {
        return new Promise(resolve => {
          this.alertMessageLoading = true;
          this.$get('overview/alertMessageStat').then(response => {
            this.alertMessageLoading = false;
            if (response.code === 200) {
              this.alertMessageData = response.data;
            }
            resolve();
          })
        })
      },
      queryAlertRuleData() {
        return new Promise(resolve => {
          this.$get('overview/alertRuleStat').then(response => {
            if (response.code === 200) {
              this.alertRuleData = response.data;
            }
            resolve();
          })
        })
      },
      queryAlertTrendData() {
        return new Promise(res => {

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
            res()
          }, reject => {
            this.$refs.chartbox.endLoading();
            res()
          });
        })
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
      initMap() {
        let loadPromise;
        this.loadMapConfig().then((mapConfig)=>{
          if(mapConfig&&this.map){
            loadPromise=this.loadDataCenterMapData()
          }
        });
        return loadPromise;
      },
      initTooltipChart(param) {
        let data = param.tooltip.options.data;
        //console.info(tooltipEndpointChart);
        tooltipEndpointChart = echarts.init(document.querySelector("#tooltip-chart--endpoint"));
        tooltipPrometheusChart = echarts.init(document.querySelector("#tooltip-chart--prometheus"));
        let endpointOption = chartConfig.getOption("tooltipPie"),
            prometheusOption = chartConfig.getOption("tooltipPie");
        endpointOption.series[0].label.formatter = data.endpointTotal + "";
        endpointOption.series[0].data = [
          {name: this.$t("dashboard.overview.asset.pingUp"), value: data.endpointUp ? data.endpointUp : 0},
          {name: this.$t("dashboard.overview.asset.pingDown"), value: data.endpointDown ? data.endpointDown : 0}
        ];
        endpointOption.title.text = this.$t("project.endpoint.endpoint");
        endpointOption.legend.data = [this.$t("dashboard.overview.asset.pingUp"), this.$t("dashboard.overview.asset.pingDown")];
        prometheusOption.series[0].label.formatter = data.promTotal + "";
        prometheusOption.series[0].data = [
          {name: this.$t("dashboard.overview.asset.pingUp"), value: data.promUp ? data.promUp : 0},
          {name: this.$t("dashboard.overview.asset.pingDown"), value: data.promDown ? data.promDown : 0}
        ];
        prometheusOption.title.text = "Prometheus";
        prometheusOption.legend.data = [this.$t("dashboard.overview.asset.pingUp"), this.$t("dashboard.overview.asset.pingDown")];
        tooltipEndpointChart.setOption(endpointOption, true);
        tooltipPrometheusChart.setOption(prometheusOption, true);
        /*setTimeout(function() {
          tooltipEndpointChart.setOption(endpointOption);
          tooltipPrometheusChart.setOption(prometheusOption);
        }, 100);*/
      },
      loadMapConfig:function(){
        let vm = this;
        return new Promise(resolve => {
          let DefaultIcon = L.icon({
            iconUrl: icon,
            shadowUrl: iconShadow
          });
          L.Marker.prototype.options.icon = DefaultIcon;
          let param={paramKey:'map_center_config'}
          this.$get('sysConfig',param).then(response=>{
            if(response.code == 200){
              let mapConfig=JSON.parse(response.data.paramKey.map_center_config);
              let map = L.map("map",{
                minZoom:mapConfig.minZoom,
                maxZoom:mapConfig.maxZoom,
                attributionControl:false,
                zoomControl:false,
              }).setView([mapConfig.longitude,mapConfig.latitude],mapConfig.zoom);
              map.createPane("myPane", document.querySelector(".my-pane"));
              map.on("tooltipopen", function(param) {
                vm.initTooltipChart(param);
              });
              map.on("tooltipclose", function(param) {
                tooltipEndpointChart && tooltipEndpointChart.clear();
                tooltipPrometheusChart && tooltipPrometheusChart.clear();
              });
              this.map = map;

              L.tileLayer(
                "/static/Tiles/{z}/{x}/{y}.png"
              ).addTo(map);

              let attribution=L.control.attribution({position:'bottomright',prefix:''})
              attribution.addAttribution(' © OpenStreetMap contributors')
              attribution.addTo(map)

              L.control.zoom({
                position:'bottomright',
                zoomInText:`<i class="nz-icon nz-icon-enlarge"></i>`,
                zoomOutText:`<i class="nz-icon nz-icon-narrow"></i>`,
                zoomInTitle:'',
                zoomOutTitle:'',
              }).addTo(map)

              resolve(mapConfig);
            }
          })
        })
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

        setTimeout(()=>{this.queryDataCenterMapData();},1500)
      },
      loadDataCenterMapData:function(){
        return new Promise(res=>{

          let language=localStorage.getItem("nz-language") ? localStorage.getItem("nz-language") : 'en';
          let requests=[axios.get('/idc?pageSize=-1'),axios.get('/overview/datacenterStat')];
          axios.all(requests).then((result)=>{
            if(result) {
              let idcInfos = null;
              let dcStats = null;
              if (result[0].data && result[0].data.code == 200) {
                idcInfos = result[0].data.data.list;
              }
              if (result[1].data && result[1].data.code == 200) {
                dcStats = result[1].data.data.dcStat;
              }
              if (idcInfos && dcStats) {
                let dcStatsCopy=Object.assign([],dcStats);
                dcStatsCopy.sort((a,b)=>{
                  return a.assetTotal - b.assetTotal;
                });
                let bigScatter=10;
                let mediumScatter=8;
                let smallScatter=6;
                let maxAssetTotal=dcStatsCopy[dcStatsCopy.length-1].assetTotal;

                let bigBoundary=Number.parseInt(maxAssetTotal/3*2);
                let mediumBoundary=Number.parseInt(maxAssetTotal/3);
                for (let dcStat of dcStats) {
                  let dcId = dcStat.id;
                  let dcInfo = idcInfos.find((item) => {
                    return item.id == dcId;
                  })
                  let areaInfo = dcInfo.area;
                  if (areaInfo) {
                    let areaName = '';
                    if (areaInfo.i18n) {
                      areaName = JSON.parse(areaInfo.i18n)[language];
                    } else {
                      areaName = areaInfo.name;
                    }

                    let symbolSize=mediumScatter;
                    if(dcStat.assetTotal>=bigBoundary){
                      symbolSize=bigScatter;
                    }else if(dcStat.assetTotal<bigBoundary && dcStat.assetTotal>= mediumBoundary){
                      symbolSize=mediumScatter;
                    }else{
                      symbolSize=smallScatter;
                    }

                    let hasAlert=dcStat.alertP1!=0||dcStat.alertP2!=0||dcStat.alertP3!=0||dcStat.assetPingDown!=0||dcStat.endpointDown!=0||dcStat.promDown!=0;

                    let marker=L.circleMarker([areaInfo.latitude,areaInfo.longitude], {color: hasAlert?'#DE5D3F':'#23BF9A',opacity:0.42,fillColor: hasAlert?'#DE5D3F':'#23BF9A',fillOpacity: 0.5, radius: symbolSize,className:hasAlert?'error-item':''})
                    marker.bindTooltip(this.mapTooltipFormatter(dcStat), {sticky: false, pane: "myPane", direction: "left", data: dcStat});
                    marker.on("mouseover", (param) => {
                      //console.info(param);
                      let pane = document.querySelector(".leaflet-pane.leaflet-my-pane");
                      let point = param.containerPoint;
                      let event = param.originalEvent;
                      this.tooltip.x = event.clientX+point.x-event.layerX;
                      this.tooltip.y = event.clientY+point.y-event.layerY;
                    });
                    marker.addTo(this.map);
                  }
                }
              }
            }
            res();
          });
        })
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
            this.$refs.dataCenterMap.endLoading();
          }
        })
      },
      queryAlertStatByRule() {
        return new Promise(resolve=>{

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
                    let colorList =  ["#FAd4ab", "#d0e8d0"];
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
            resolve()
          });
        })
      },
      queryAlertStatByAsset() {
        return new Promise(resolve => {

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
                    let colorList = ["#FAd4ab", "#d0e8d0"];;
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
            resolve();
          });
        })
      },
      queryAlertStatByModule() {
        return new Promise(resolve => {

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
            resolve();
          });
        })
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

      mapTooltipFormatter(dcStat){
        return `<div class="tooltip">
          <div class="tooltip--title">${dcStat.name}</div>
          <div class="tooltip--row">
            <div class="tooltip-asset">
              <div class="tooltip-asset--title"><span>${this.$t('asset.asset')}</span><span>Total：${dcStat.assetTotal}</span></div>
              <div class="tooltip-asset--row">
                <div>${this.$t('asset.state')}</div>
                <div class="tooltip-asset--sub-rows">
                  <div class="tooltip-asset--sub-row">
                    <div class="sub-row--label">${this.$t("asset.inStock")}</div>
                    <div class="sub-row--value"><div class="sign green-sign"></div><span>${dcStat.assetInStock}</span></div>
                  </div>
                  <div class="tooltip-asset--sub-row">
                    <div class="sub-row--label">${this.$t("asset.notInStock")}</div>
                    <div class="sub-row--value"><div class="sign red-sign"></div><span>${dcStat.assetOutStock}</span></div>
                  </div>
                </div>
              </div>
              <div class="tooltip-asset--row">
                <div>${this.$t('asset.left.ping')}</div>
                <div class="tooltip-asset--sub-rows">
                  <div class="tooltip-asset--sub-row">
                    <div class="sub-row--label">${this.$t("dashboard.overview.asset.pingUp")}</div>
                    <div class="sub-row--value"><div class="sign green-sign"></div><span>${dcStat.assetPingUp}</span></div>
                  </div>
                  <div class="tooltip-asset--sub-row">
                    <div class="sub-row--label">${this.$t("dashboard.overview.asset.pingDown")}</div>
                    <div class="sub-row--value"><div class="sign red-sign"></div><span>${dcStat.assetPingDown}</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="tooltip-alert">
              <div class="tooltip-alert--title"><span>${this.$t("dashboard.overview.asset.alert")}</span><span>${dcStat.alertTotal}</span></div>
              <div class="tooltip-alert--row">
                <div class="row--label row--label__p1">P1</div><div class="row--value row--value__p1">${dcStat.alertP1}</div>
              </div>
              <div class="tooltip-alert--row">
                <div class="row--label row--label__p2">P2</div><div class="row--value row--value__p2">${dcStat.alertP2}</div>
              </div>
              <div class="tooltip-alert--row">
                <div class="row--label row--label__p3">P3</div><div class="row--value row--value__p3">${dcStat.alertP3}</div>
              </div>
            </div>
          </div>
          <div class="tooltip--row">
            <div class="legend-value">
              <div>${dcStat.endpointUp}</div>
              <div>${dcStat.endpointDown}</div>
            </div>
            <div class="legend-value">
              <div>${dcStat.promUp}</div>
              <div>${dcStat.promDown}</div>
            </div>
            <div class="tooltip-chart" id="tooltip-chart--endpoint"></div>
            <div class="tooltip-chart" id="tooltip-chart--prometheus"></div>
          </div>
        </div>`;

        //return tooltip;
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
        this.sysTime=this.getTime(0);
        this.sysDate=this.getDate(0);
        this.sysWeek=this.getWeek(0);
        this.freshTime();
      },
      freshTime:function(){
        let $temp=this;
        let counter=0;
        this.freshDateTimer=setInterval(function(){
          counter ++;
          $temp.sysTime=$temp.getTime(counter)
          $temp.sysDate=$temp.getDate(counter);
          $temp.sysWeek=$temp.getWeek(counter);
        },1000)
      },
      getTime:function(counter){
        let date=new Date(this.system_server_time);
        date.setSeconds(date.getSeconds()+counter)
        let hours=date.getHours()>9?date.getHours():'0'+date.getHours();
        let minutes=date.getMinutes()>9?date.getMinutes():'0'+date.getMinutes();
        let seconds=date.getSeconds()>9?date.getSeconds():'0'+date.getSeconds();
        return hours+':'+minutes+':'+seconds;
      },
      getDate:function(counter){
        let date=new Date(this.system_server_time);
        date.setSeconds(date.getSeconds()+counter)
        let years=date.getFullYear();
        let months=date.getMonth()+1>9?date.getMonth()+1:'0'+(date.getMonth()+1);
        let days=date.getDate()>9?date.getDate():'0'+date.getDate();
        return years+'-'+months+'-'+days;
      },
      getWeek:function(counter){
        let weeks=[i18n.t('date.week.seven'),i18n.t('date.week.one'),i18n.t('date.week.two'),i18n.t('date.week.three'),i18n.t('date.week.four'),i18n.t('date.week.five'),i18n.t('date.week.six')]
        let date=new Date(this.system_server_time);
        date.setSeconds(date.getSeconds()+counter)
        let day=date.getDay();
        return weeks[day]
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
        if(data=='asset'){
          bus.$emit("clear-asset-filter"); //清除leftMenu左侧菜单过滤条件
        }
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
      zoomMap:function(val){
        let geo=this.$refs.dataCenterMap.getOption().geo;
        if(geo&&geo.length>0){
          let zoom=geo[0].zoom
          let limit=geo[0].scaleLimit;
          let value=zoom+val;
          if(value<=limit.max && value>=limit.min ){
            this.$refs.dataCenterMap.setOption({geo:{zoom:value}})
          }
        }
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
      },
    },
    watch: {
      "trendSearchParam.select": function(n, o) {
        this.queryAlertTrendData();
      }
    },
    mounted() {
      this.initData();
      this.querySystemState().then(()=>{
        this.initDate();
        this.setFreshDataTimer();
      })

      window.onresize = () => {
        let vm = this;
        setTimeout(() => {
          //vm.map.
        }, 500);
      };
    },
    destroyed() {
      clearInterval(this.freshDataTimer);
      clearInterval(this.freshDateTimer);
    }
  }
</script>

<style lang="scss">
  @import "./overview2.scss";

  .leaflet-control-zoom{
    border: 1px solid #E7EAED !important;
    box-shadow: -1px 1px 9px -1px rgba(205,205,205,0.77) !important;
    .leaflet-control-zoom-out,.leaflet-control-zoom-in{
      opacity: .7;
      background: #FFF;
    }
  }
  .leaflet-control-attribution{
    background-color: unset !important;
    color: rgba(178, 178, 178, 0.77);
  }
  @keyframes error-animation{
    0% {fill-opacity:.5}
    50% {fill-opacity:0.75}
    100% {fill-opacity:1}
  }
  .error-item{
    color: #FADED7 ;
    animation: error-animation 1s infinite ease-in-out;
    animation-direction:normal;
  }
  .error-color{

  }
  .my-pane {
    position: fixed;
    width: 1px;
    z-index: 99999;
    height: 1px;
    background-color: transparent;
  }
</style>
