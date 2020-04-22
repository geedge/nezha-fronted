<template>
  <div class="overview">
    <!--左侧菜单栏-->
    <left-menu>
      <div slot="content-left" class="overview-left slot-content">
        <div class="sidebar-title">{{$t('dashboard.title')}}</div>
        <div class="sidebar-info">
          <div class="sidebar-info-item sidebar-info-item-active" >{{$t('dashboard.overview.title')}}</div>
          <div class="sidebar-info-item sidebar-info-top " @click="jumpTo('panel')">{{$t('dashboard.panel.title')}}</div>
          <div class="sidebar-info-item" @click="jumpTo('metricPreview')">{{$t('dashboard.metricPreview.title')}}</div>
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
          <div class="content-row-box">
            <div class="content-col-box">
              <div class="content-col-title">{{$t("dashboard.overview.asset.title")}}</div>
              <div class="content-col-content content-col-content-num" v-loading="assetLoading">
                <span>{{(assetData ? assetData.totalStat.total  : "") | numberFormat}}</span>
              </div>
            </div>
            <div class="content-col-box">
              <div class="content-col-title">{{$t("dashboard.overview.project.project")}}</div>
              <div class="content-col-content content-col-content-num" v-loading="projectLoading">
                <span>{{(projectData ? projectData.projectStat.length : "") | numberFormat}}</span>
              </div>
            </div>
            <div class="content-col-box">
              <div class="content-col-title">{{$t("dashboard.overview.module.module")}}</div>
              <div class="content-col-content content-col-content-num" v-loading="moduleLoading">
                <span>{{(moduleData ? moduleData.moduleStat.length  : "") | numberFormat}}</span>
              </div>
            </div>
            <div class="content-col-box">
              <div class="content-col-title">{{$t("dashboard.overview.endpoint.endpoint")}}</div>
              <div class="content-col-content content-col-content-num" v-loading="endpointLoading">
                <span>{{(endpointData ? endpointData.total : "") | numberFormat}}</span>
              </div>
            </div>
            <div class="content-col-box">
              <div class="content-col-title">{{$t("dashboard.overview.alert.alertMessage")}}</div>
              <div class="content-col-content content-col-content-num" v-loading="alertMessageLoading">
                <span>{{(alertMessageData ? alertMessageData.alertMessageTotal : "") | numberFormat}}</span>
              </div>
            </div>
          </div>
          <div class="content-row-box">
            <div class="content-col-box">
              <div class="content-col-title">{{$t("dashboard.overview.alert.chart.chartTitle")}}</div>
            </div>
            <div class="content-col-box">
              <div class="content-col-title">{{$t("dashboard.overview.dataCenter.dataCenter")}}</div>
              <div class="content-col-content">
                <chart-box chart-title="" chart-type="map" :tooltip-formatter="mapTooltipFormatter" :map="map" ref="dataCenterMap"></chart-box>
              </div>
            </div>
          </div>
          <div class="content-row-box">
            <div class="content-col-box">
              <div class="content-col-title">{{$t("dashboard.overview.asset.assetType")}}</div>
            </div>
            <div class="content-col-box">
              <div class="content-col-title">{{$t("dashboard.overview.alert.alertRuleTopN")}}</div>
            </div>
            <div class="content-col-box">
              <div class="content-col-title">{{$t("dashboard.overview.alert.assetTopN")}}</div>
            </div>
          </div>
        </div>
      </div>
    </left-menu>
  </div>
</template>

<script>
  import chart from "./chart";
  import chartDataFormat from "../../../charts/chartDataFormat";
  import axios from 'axios';

  export default {
    name: "overview2",
    components:{
      'chart-box': chart,
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
        map: null,
        chartSeries:[],
        alertRuleStatData:{},
        dataCenterMapSeries:[],
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
        this.queryDatacenterData();
        this.queryMapChartGeoJson();
      },
      queryAssetData() {
        this.assetLoading = true;
        this.$get('overview/assetStat').then(response => {
          this.assetLoading = false;
          if (response.code === 200) {
            this.assetData = response.data;
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
      queryDatacenterData() {
        this.$get('overview/datacenterStat').then(response => {
          if (response.code === 200) {
            this.alertMessageData = response.data;
          }
        })
      },
      queryMapChartGeoJson:function(){
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
      queryDataCenterMapData:function(){
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

                  console.log(dcStat.name+'-->'+ symbolSize)
                  seriesDatas.push({
                    name:areaName,
                    value:[areaInfo.longitude,areaInfo.latitude,dcStat],
                    symbolSize:symbolSize,
                  })
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

      /*初始化数据 end*/

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

      switchFullScreen:function(){
        this.isFullScreen=this.judgeFullScreen();
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
        fullScreenFunc.call(container)
      },
      exitFullScreen:function(){
        if(this.judgeFullScreen()){
          if(document.exitFullscreen) {
            document.exitFullscreen();
          } else if(document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if(document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
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
