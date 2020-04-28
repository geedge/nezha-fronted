<template>
  <div class="overview">
    <!--左侧菜单栏-->
    <left-menu>
      <div slot="content-left" class="overview-left slot-content">
        <div class="sidebar-title">{{$t('dashboard.title')}}</div>
        <div class="sidebar-info">
          <div class="sidebar-info-item sidebar-info-item-active" >{{$t('dashboard.overview.title')}}</div>
          <div class="sidebar-info-item sidebar-info-top " @click="jumpTo('panel')">{{$t('dashboard.panel.title')}}</div>
          <div class="sidebar-info-item" @click="jumpTo('explore')">{{$t('dashboard.metricPreview.title')}}</div>
        </div>
      </div>
      <!--右侧内容-->
      <div class="overview-right slot-content" id="mainDisplay" slot="content-right">
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
              <div class="content-col-title">{{$t("dashboard.overview.asset.title")}}</div>
              <div class="content-col-content" v-loading="assetLoading">
                <div class="content-col-content-num">{{(assetData ? assetData.totalStat.total  : "") | numberFormat}}</div>
              </div>
            </div>
            <div class="content-col-box">
              <div class="content-col-title">{{$t("dashboard.overview.project.project")}}</div>
              <div class="content-col-content" v-loading="projectLoading">
                <div class="content-col-content-num">{{(projectData ? projectData.projectStat.length  : "") | numberFormat}}</div>
              </div>
            </div>
            <div class="content-col-box">
              <div class="content-col-title">{{$t("dashboard.overview.module.module")}}</div>
              <div class="content-col-content" v-loading="moduleLoading">
                <div class="content-col-content-num">{{(moduleData ? moduleData.moduleStat.length  : "") | numberFormat}}</div>
              </div>
            </div>
            <div class="content-col-box">
              <div class="content-col-title">{{$t("dashboard.overview.endpoint.endpoint")}}</div>
              <div class="content-col-content" v-loading="endpointLoading">
                <div class="content-col-content-num">{{(endpointData ? endpointData.total : "") | numberFormat}}</div>
              </div>
            </div>
            <div class="content-col-box">
              <div class="content-col-title">{{$t("dashboard.overview.alert.alertMessage")}}</div>
              <div class="content-col-content" v-loading="alertMessageLoading">
                <div class="content-col-content-num">{{(alertMessageData ? alertMessageData.alertMessageTotal : "") | numberFormat}}</div>
                <span>{{$t("dashboard.overview.alert.ruleNum")}}&nbsp;:&nbsp;{{(alertRuleData ? alertRuleData.alertRuleTotal : "") | numberFormat}}</span>
              </div>
            </div>
          </div>
          <!--第二行-->
          <div class="content-row-box">
            <div class="content-col-box">
              <div class="content-col-title">
                <span>{{$t("dashboard.overview.alert.chart.chartTitle")}}</span>
                <time-picker ref="calendarPanel" class="nz-dashboard-picker" @change="dateChange"></time-picker>
              </div>
              <div class="content-col-content">
                <chart-box chart-type="overviewLine" ref="chartbox" :show-toolbox="false" name="trend"></chart-box>
              </div>
            </div>
            <div class="content-col-box">
              <div class="content-col-title">{{$t("dashboard.overview.dataCenter.dataCenter")}}</div>
              <div class="content-col-content">
                <chart-box chart-type="map" :tooltip-formatter="mapTooltipFormatter" :map="map" ref="dataCenterMap"></chart-box>
              </div>
            </div>
          </div>
          <!--第三行-->
          <div class="content-row-box">
            <div class="content-col-box">
              <div class="content-col-title">
                <span>{{$t("dashboard.overview.asset.assetType")}}</span>
              </div>
              <div class="content-col-content">
                <chart-box chart-type="pie" ref="assetTypePie" :show-toolbox="false" name="assetTypePie" :tooltip-formatter="assetTypeFormatter" ></chart-box>
              </div>
            </div>
            <div class="content-col-box">
              <div class="content-col-title">
                <span>{{$t("dashboard.overview.alert.alertRuleTopN")}}</span>
                <el-dropdown trigger="hover" :show-timeout="0" size="small">
                  <span>Top&nbsp;{{topFilter.rule}}<i class="el-icon-arrow-down el-icon--right"></i></span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="(item,index) in topFilter.optionals" :key="index" @click.native="topNChange('rule', item)">{{item}}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
              <div class="content-col-content">
                <chart-box axis-tooltip="y" chart-type="bar" ref="ruleMessage" :tooltip-formatter="simpleFormatter" :show-toolbox="false" name="ruleMessage"></chart-box>
              </div>
            </div>
            <div class="content-col-box">
              <div class="content-col-title">
                <span>
                  <span v-if="alertMessageShow == 'asset'">{{$t("dashboard.overview.alert.assetTopN")}}</span>
                  <span v-if="alertMessageShow == 'module'">{{$t("dashboard.overview.alert.moduleTopN")}}</span>
                  <span class="dropdown-btn" @mouseenter="alertMessageDropdownHandler(true)" @mouseleave="alertMessageDropdownHandler(false)">
                    <i class="el-icon-arrow-down"></i>
                    <transition name="el-zoom-in-top">
                      <ul class="el-dropdown-menu el-popper el-dropdown-menu--mini" v-if="bottom3DropdownShow">
                        <li @click="alertMessageChange('asset')" class="el-dropdown-menu__item dropdown-content" style="padding: 0 15px;">{{$t("dashboard.overview.asset.title")}}</li>
                        <li @click="alertMessageChange('module')" class="el-dropdown-menu__item dropdown-content" style="padding: 0 15px;">{{$t("dashboard.overview.module.module")}}</li>
                      </ul>
                    </transition>
                  </span>
                </span>
                <el-dropdown trigger="hover" v-if="alertMessageShow == 'asset'" :show-timeout="0" size="small">
                  <span>Top&nbsp;{{topFilter.asset}}<i class="el-icon-arrow-down el-icon--right"></i></span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="(item,index) in topFilter.optionals" :key="index" @click.native="topNChange('asset', item)">{{item}}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <el-dropdown trigger="hover" v-if="alertMessageShow == 'module'" :show-timeout="0" size="small">
                  <span>Top&nbsp;{{topFilter.module}}<i class="el-icon-arrow-down el-icon--right"></i></span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="(item,index) in topFilter.optionals" :key="index" @click.native="topNChange('module', item)">{{item}}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
              <div class="content-col-content">
                <chart-box axis-tooltip="y" v-show="alertMessageShow == 'asset'" :tooltip-formatter="simpleFormatter" chart-type="bar" ref="assetMessage" name="assetMessage" :show-toolbox="false"></chart-box>
                <chart-box axis-tooltip="y" v-show="alertMessageShow == 'module'" :tooltip-formatter="simpleFormatter" chart-type="bar" ref="moduleMessage" name="moduleMessage" :show-toolbox="false"></chart-box>
              </div>
            </div>
          </div>
        </div>
      </div>
    </left-menu>
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
  import timePicker from '../../../common/timePicker'
  var timeout;

  export default {
    name: "overview2",
    components:{
      'chart-box': chart,
      'time-picker': timePicker
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
        chartSeries: [],
        assetTypeSeries: [],
        messageByRuleSeries: [],
        messageByAssetSeries: [],
        messageByModuleSeries: [],
        alertRuleStatData: {},
        dataCenterMapSeries: [],

        trendSearchTime: {start: '', end: ''},

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
              return (num/1000).toFixed(fixed) + "K";
            } else if (num < 1000000000) {
              return (num/1000000).toFixed(fixed) + "M";
            }
          } catch (err) {
            return 0;
          }
        }
        return 0;
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
      },
      queryAssetData() {
        this.assetLoading = true;
        this.$get('overview/assetStat').then(response => {
          this.assetLoading = false;
          if (response.code === 200) {
            this.assetData = response.data;

            /*饼图*/
            this.$refs.assetTypePie.startLoading();
            let legendData = [];
            let typeSeriesData = [];
            //let modelSeriesData = [];
            this.assetData.typeStat.forEach(item => {
              legendData.push(item.name);
              typeSeriesData.push({name: item.name, value: item.total, up: item.pingUp, down: item.pingDown});
            });
            /*for (let i = 0; i < 4; i++) {
              legendData.push("type" + i);
              typeSeriesData.push({name: "type" + i, value: (i+1)*10, up: (i+1)*5, down: (i+1)*5});
            }*/
            /*this.assetData.modelStat.forEach(item => {
              legendData.push(item.name);
              modelSeriesData.push({name: item.name, value: item.total});
            });*/
            let series = [{
              name: 'Type',
              data: typeSeriesData.sort((a, b) => {return a.value > b.value ? -1 : 1}),
              type: 'pie',
              minAngle: 15,
              itemStyle: {
                borderColor: "#fff",
                borderWidth: 1,
              },
              label: {
                borderWidth: 1,
                borderColor: "#cfcfcf",
                borderRadius: 4,
                formatter: function(param) {
                  return ['{title|' + param.name + ' (' + param.percent + '%)}',
                          '{hr|}',
                          '{block5|}{upPic|}{block3|}{upNum|' + param.data.up + '}{block15|}{downPic|}{block3|}{downNum|' + param.data.down + '}{block15|}']
                    .join("\n");
                },
                rich: {
                  title: {
                    align: 'center',
                    color: "#333",
                    height: 20*window.devicePixelRatio,
                    padding: [0, 8, 0, 8]
                  },
                  hr: {
                    width: '100%',
                    borderWidth: 0.5,
                    height: 0,
                    borderColor: "#cfcfcf"
                  },
                  block3: {
                    width: 3*window.devicePixelRatio,
                    align: 'left'
                  },
                  block5: {
                    width: 5*window.devicePixelRatio,
                    align: 'left'
                  },
                  block15: {
                    width: 15*window.devicePixelRatio,
                    align: 'left'
                  },
                  upPic: {
                    backgroundColor: {
                      image: document.getElementById("upPic")
                    },
                    height: 15*window.devicePixelRatio,
                    align: 'left',
                    width: 15*window.devicePixelRatio,
                  },
                  upNum: {
                    color: "#333",
                    height: 20*window.devicePixelRatio,
                    align: 'left',
                    //width: 35*window.devicePixelRatio,
                    lineHeight: 18*window.devicePixelRatio,
                  },
                  downPic: {
                    backgroundColor: {
                      image: document.getElementById("downPic")
                    },
                    height: 15*window.devicePixelRatio,
                    align: 'left',
                    width: 15*window.devicePixelRatio
                  },
                  downNum: {
                    color: "#333",
                    height: 20*window.devicePixelRatio,
                    align: 'left',
                    //width: 43*window.devicePixelRatio,
                    lineHeight: 18*window.devicePixelRatio,
                  }
                }
              },
              labelLine: {
                show: true
              },
              //left: '25%'
            }, /*{
              name: 'Model',
              radius: ['65%', '80%'],
              data: modelSeriesData,
              type: 'pie',
              left: '25%',
              label: {
                formatter: function(params) {
                  if (params.name.length > 12) {
                    return params.name.substring(0, 9) + "...";
                  }
                  return params.name;
                }
              }
            }*/];
            /*this.$refs.assetTypePie.modifyOption('legend','show', true);
            this.$refs.assetTypePie.modifyOption('legend','orient', "vertical");
            this.$refs.assetTypePie.modifyOption('legend','data', legendData);
            this.$refs.assetTypePie.modifyOption('legend','left', 40);
            this.$refs.assetTypePie.modifyOption('legend','top', 40);
            this.$refs.assetTypePie.modifyOption('legend','formatter', function(name) {
              if (name.length > 12) {
                return name.substring(0, 9) + "...";
              }
              return name;
            });*/
            this.$refs.assetTypePie.setSeries(series);
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
        let before;
        let end;
        if (this.trendSearchTime.start) {
          before = this.trendSearchTime.start;
        } else {
          before = new Date();
          before.setMinutes(new Date().getMinutes()-5);
          before = this.dateFormat('yyyy-mm-dd HH:MM:SS', before);
        }
        if (this.trendSearchTime.end) {
          end = this.trendSearchTime.end;
        } else {
          end = new Date();
          end = this.dateFormat('yyyy-mm-dd HH:MM:SS', end);
        }
        let params = {
          query: 'sum(nz_alert_nums)',
          start: before,
          end: end,
          step: '15s'
        };
        this.$get('/prom/api/v1/query_range',params).then(response=>{
          if(response.status == 'success'){
            if(response.data.result){
              let series={
                name: 'nz_alert_nums',
                symbol:'none',  //去掉点
                smooth:true,  //曲线变平滑
                data: [],
                type:'line',
              };
              series.data=response.data.result[0].values.map((item)=>{
                return [item[0]*1000,item[1]];
              });
              this.chartSeries = [series];
              this.$refs.chartbox.setSeries(this.chartSeries);
              this.$refs.chartbox.endLoading();
            }
          }else{
            console.error(response)
          }
        })
      },
      queryMapChartGeoJson() {
        this.$get('/sysConfig?paramKey=geoJson').then(response=>{
          if(response.code == 200){
            this.map={
              name:'Kazakhstan',
              geoJson:response.data.paramKey
            }
            setTimeout(()=>{this.queryDataCenterMapData();},200)
          }else{
            console.error('loading map info faild')
          }
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
        this.$get('overview/alertStatByRule', {top: this.topFilter.rule}).then(response => {
          if (response.code === 200) {
            this.$refs.ruleMessage.startLoading();
            let seriesData = [];
            let categoryData = [];
            response.data.list.forEach(item => {
              seriesData.push(item.nums);
              categoryData.push(item.alertName);
            });
            this.messageByRuleSeries = {
              name: 'alertStatByRule',
              data: seriesData,
              type: 'bar'
            };
            this.$refs.ruleMessage.modifyOption('yAxis', 'data', categoryData);
            this.$refs.ruleMessage.setSeries(this.messageByRuleSeries);
            this.$refs.ruleMessage.endLoading();
          }
        });
      },
      queryAlertStatByAsset() {
        this.$get('overview/alertStatByAsset', {top: this.topFilter.asset}).then(response => {
          if (response.code === 200) {
            this.$refs.assetMessage.startLoading();
            let seriesData = [];
            let categoryData = [];
            response.data.list.forEach(item => {
              seriesData.push(item.nums);
              categoryData.push(item.host);
            });
            this.messageByAssetSeries = {
              name: 'alertStatByAsset',
              data: seriesData,
              type: 'bar'
            };
            this.$refs.assetMessage.modifyOption('yAxis', 'data', categoryData);
            this.$refs.assetMessage.setSeries(this.messageByAssetSeries);
            this.$refs.assetMessage.endLoading();
          }
        });
      },
      queryAlertStatByModule() {
        this.$get('overview/alertStatByModule', {top: this.topFilter.module}).then(response => {
          if (response.code === 200) {
            this.$refs.moduleMessage.startLoading();
            let seriesData = [];
            let categoryData = [];
            response.data.list.forEach(item => {
              seriesData.push(item.nums);
              categoryData.push(item.module);
            });
            this.messageByModuleSeries = {
              name: 'alertStatByModule',
              data: seriesData,
              type: 'bar'
            };
            this.$refs.moduleMessage.modifyOption('yAxis', 'data', categoryData);
            this.$refs.moduleMessage.setSeries(this.messageByModuleSeries);
            this.$refs.moduleMessage.endLoading();
          }
        });
      },
      /*初始化数据 end*/
      dateChange(val) {
        this.trendSearchTime.start = val[0];
        this.trendSearchTime.end = val[1];
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

      mapTooltipFormatter(params){
        let dcStat = params.data.value[2];
        let tooltip=`
            <div class="tooltip">
                <div style="margin-left: 12px">${dcStat.name}</div>
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
        let container=document.getElementById('mainDisplay');
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
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
    },
    mounted() {
      this.initDate();
      this.initData();
      window.onresize = () => {
        setTimeout(() => {
          this.$parent.$parent.update();
        }, 100);
      }
    },
    destroyed() {
      window.onresize = null;
    }
  }
</script>

<style lang="scss">
  @import "./overview2.scss";
  .tooltip{
    padding:5px;
    min-width: 500px;
  }
  .tooltip-table{
    border-spacing: 0px;
    border-collapse:collapse;
  }
  .tooltip-table tr{
    display: table-row;
    vertical-align: inherit;
    border-color: inherit;
  }
  .tooltip-table td{
    min-width: 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    text-overflow: ellipsis;
    vertical-align: middle;
    text-align: left;
    border: 1px solid #EBEEF5;
    display: table-cell;
    padding:0px 5px ;
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
