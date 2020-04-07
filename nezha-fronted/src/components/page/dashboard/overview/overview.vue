<template>
    <div class="overview">
      <!--左侧菜单栏-->
      <div class="overview-left content-left">
        <div class="sidebar-title">{{$t('dashboard.title')}}</div>
        <div class="sidebar-info">
          <div class="sidebar-info-item sidebar-info-item-active" >{{$t('dashboard.overview.title')}}</div>
          <div class="sidebar-info-item sidebar-info-top " @click="jumpTo('panel')">{{$t('dashboard.panel.title')}}</div>
          <div class="sidebar-info-item" @click="jumpTo('metricPreview')">{{$t('dashboard.metricPreview.title')}}</div>
        </div>
      </div>
      <!--右侧内容-->
      <div class="overview-right content-right" id="mainDisplay">
        <!--标题-->
        <div class="overview-content-header">
          <div class="header-title" :class="{'hide-div':!isFullScreen}">{{$t('dashboard.overview.contentTitle')}}</div>
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
          <el-scrollbar style="height: 100%" ref="overviewScrollbar" class="column-flex">
              <div class="content-row-box" style="flex: 1;height: 100%;">
                <div class="content-col-box  " style="flex:3;" >
                  <table-box :pop-data="assetStatData" ref="assetTab" ></table-box>
                </div>
                <div class="content-col-box  " style="flex: 2" >
                  <table-box :pop-data="projectStatData" ref="projectTab"></table-box>
                </div>
                <div class="content-col-box  " style="flex:1;" >
                  <table-box :pop-data="endpointStatData" ref="endpointTab"></table-box>
                </div>
              </div>
              <div class="content-row-box" style="flex: 1.2;height: 100%;">
                <div class="content-col-box  " style="flex: 1;" >
                  <div class="flex-container">
                    <div style="flex: 2;">
                      <table-box :pop-data="dataCenterStatData" ref="dataCenterTab" ></table-box>
                    </div>
                    <div style="flex: 3;">
                      <chart-box chart-title="" chart-type="map" :map="map" ref="dataCenterMap"></chart-box>
                    </div>
                  </div>
                </div>
              </div>
              <div class="content-row-box" style="flex: 1.3;height: 100%;">
                <div class="content-col-box  "style="flex: 3">
                  <div class="avg-children-space">
                    <!--<el-select v-model="topNFilter.default" placeholder="" size="mini" style="display: inline-block;width: 200px" @change="topNChange">
                      <el-option v-for="(item,index) in topNFilter.options" :label="item.label" :value="item.value" :key="item.value+index"></el-option>
                    </el-select>
                    <el-select v-model="topNFilter.defaultTop" placeholder="" size="mini" style="display: inline-block;width: 100px" @change="topNChange">
                      <el-option v-for="(item,index) in topNFilter.tops" :label="item.label" :value="item.value" :key="item.value+index"></el-option>
                    </el-select>-->
                    <el-dropdown trigger="click">
                      <span class="clickable">{{topNFilter.options.find((item)=>{return item.value==topNFilter.default})['label']}}<i class="el-icon-arrow-down el-icon--right"></i></span>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item v-for="(item,index) in topNFilter.options" :key="item.value+index" @click.native="()=>{topNFilter.default=item.value;topNChange();}">{{item.label}}</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                    <el-dropdown trigger="click">
                      <span class="clickable">{{topNFilter.tops.find((item)=>{return item.value==topNFilter.defaultTop})['label']}}<i class="el-icon-arrow-down el-icon--right"></i></span>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item v-for="(item,index) in topNFilter.tops" :key="item.value+index" @click.native="()=>{topNFilter.defaultTop=item.value;topNChange();}">{{item.label}}</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </div>
                  <table-box :pop-data="topNStatData" ref="topNTab" style="height: 90%;"></table-box>
                </div>
                <div class="content-col-box  "style="flex: 8;" id="alertTrendBox" >
                  <chart-box  ref="chartbox" :chart-title="$t('dashboard.overview.alert.chart.chartTitle')"></chart-box>
                </div>
                <div class="content-col-box  "style="flex: 2;" >
                  <table-box :pop-data="alertRuleStatData" ref="alertRuleTab"></table-box>
                </div>
              </div>
          </el-scrollbar>
        </div>
      </div>
    </div>
</template>

<script>
  import tableBox from "./tableBox";
  import chart from "./chart";
  import axios from 'axios';
  import chartDataFormat from "../../../charts/chartDataFormat";
  import bus from '../../../../libs/bus';
  export default {
    name: "overview",
    components:{
      'table-box':tableBox,
      'chart-box':chart,
    },
    props:[],
    data(){
      return {
        storedAssetStatData:null,
        assetStatData:{},
        typeFilter: 'typeStat',
        projectStatData:{},
        endpointStatData:{},
        dataCenterStatData:{},
        topNStatData:{},
        topNFilter:{
          default:'alertRule',
          defaultTop:10,
          options:[
            {label:this.$t('dashboard.overview.alert.alertRuleTopN'),value:'alertRule'},
            {label:this.$t('dashboard.overview.alert.assetTopN'),value:'asset'},
          ],
          tops:[
            {label:this.$t('dashboard.overview.alert.top')+'10',value:10},
            {label:this.$t('dashboard.overview.alert.top')+'20',value:20},
            {label:this.$t('dashboard.overview.alert.top')+'50',value:50},
          ]
        },
        chartSeries:[],
        alertRuleStatData:{},
        dataCenterMapSeries:[],
        isFullScreen:false,
        sysTime:'',
        sysDate:'',
        sysWeek:'',
        map:null,
      }
    },
    created() {
    },
    methods:{
      /*加载数据 start*/
      initData:function(){
        this.queryAssetData();
        this.queryProjectData();
        this.queryEndpointData();
        this.queryDataCenterData();
        this.topNChange();
        this.queryAlertRuleStatData();
        this.queryAlertTrendData();
        // this.queryDataCenterMapData();
        this.queryMapChartGeoJson();
      },
      queryAssetData:function(){
        this.$refs.assetTab.startLoading();
        if(this.storedAssetStatData){
          let showData=this.storedAssetStatData[this.typeFilter];
          this.assetStatData=this.formatAssetData(showData,this.storedAssetStatData.totalStat);
          this.$refs.assetTab.endLoading();
        }else{
          axios.get('/overview/assetStat').then((res)=>{
            let response=res.data;
            if(response.msg == 'success'){
              this.storedAssetStatData=Object.assign({},response.data)
              let showData=response.data[this.typeFilter];
              this.assetStatData=this.formatAssetData(showData,response.data.totalStat);
              this.$refs.assetTab.endLoading();
            }else{
              this.$message.error(response.msg)
            }
          })
        }
      },
      formatAssetData:function(data,totalData){
        if(data && totalData){
          data=data.map((item)=>{
            item.alertInfo=`<span style="color: #FE6565;">${item.alertHigh}</span>/<span style="color: orange;">${item.alertMedium}</span>/<span style="color: #90ee90">${item.alertLow}</span>`;
            return item;
          })
          let assetStatData={
            screen:{ //左侧概览信息
              show:true,
              direction:'row',
              total:{ //左侧上方大图标及total信息
                show:true,
                direction:'column',
                num:totalData.inStock,
                title:this.$t('dashboard.overview.asset.title'),
                showPopover:true,
                icon:'nz-icon nz-icon-server',
                popover:[
                  {
                    label:this.$t('dashboard.overview.asset.alertTotal'),
                    value:totalData.total
                  },
                  {
                    label:this.$t('dashboard.overview.asset.inStock'),
                    value:totalData.inStock
                  },
                  {
                    label:this.$t('dashboard.overview.asset.outStock'),
                    value:totalData.outStock
                  },
                  {
                    label:this.$t('dashboard.overview.asset.alertLow'),
                    value:totalData.alertLow
                  },
                  {
                    label:this.$t('dashboard.overview.asset.alertMedium'),
                    value:totalData.alertMedium
                  },
                  {
                    label:this.$t('dashboard.overview.asset.alertHigh'),
                    value:totalData.alertHigh
                  },
                ]
              },
              stat:{//左侧下方 小图标，
                show:true,
                up:totalData.pingUp,
                down:totalData.pingDown
              }
            },
            table:{//右侧table
              show:true,
              tableData:data,
              tableLabel:[
                {
                  label:this.getAssetTabTitle(),
                  prop:'name',
                  show:true,
                  renderHeader:this.assetRenderHeader,
                },
                {
                  label:this.$t('dashboard.overview.asset.num'),
                  prop:'total',
                  show:true,
                  showPopover:true,
                  popover:[
                    {
                      label:this.$t('dashboard.overview.asset.inStock'),
                      prop:'inStock'
                    },
                    {
                      label:this.$t('dashboard.overview.asset.outStock'),
                      prop:'outStock'
                    },
                    {
                      label:this.$t('dashboard.overview.asset.pingUp'),
                      prop:'pingUp'
                    },
                    {
                      label:this.$t('dashboard.overview.asset.pingDown'),
                      prop:'pingDown'
                    },
                  ]
                },
                {
                  label:this.$t('dashboard.overview.asset.alert'),
                  prop:'alertInfo',
                  show:true,
                  showPopover:true,
                  popover:[
                    {
                      label:this.$t('dashboard.overview.asset.alertTotal'),
                      prop:'alertTotal'
                    },
                    {
                      label:this.$t('dashboard.overview.asset.alertLow'),
                      prop:'alertLow'
                    },
                    {
                      label:this.$t('dashboard.overview.asset.alertMedium'),
                      prop:'alertMedium'
                    },
                    {
                      label:this.$t('dashboard.overview.asset.alertHigh'),
                      prop:'alertHigh'
                    },
                  ]
                }
              ]
            }
          }
          return assetStatData;
        }else{
          console.error('the param is invalid');
          return {};
        }

      },
      queryProjectData:function(){
        this.$refs.projectTab.startLoading();
        this.$get('/overview/projectStat').then(response=>{
          if(response.msg == 'success'){
            let showData=response.data;
            this.projectStatData=this.formatProjectData(showData);
            this.$refs.projectTab.endLoading();
          }else{
            this.$message.error(response.msg)
          }
        })
      },
      formatProjectData:function(data){
        if(data){
          return {
            screen:{ //左侧概览信息
              show:true,
              direction:'row',
              total:{ //左侧上方大图标及total信息
                show:true,
                direction:'column',
                num:data.total,
                title:this.$t('dashboard.overview.project.project'),
                showPopover:false,
                icon:'nz-icon nz-icon-project',
                popover:[]
              },
              stat:{//左侧下方 小图标，
                show:false,
                up:0,
                down:0
              }
            },
            table:{//右侧table
              show:true,
              tableData:data.projectStat,
              tableLabel:[
                {
                  label:this.$t('dashboard.overview.project.name'),
                  prop:'name',
                  show:true,
                  showPopover:true,
                  showOverflowTooltip:false,
                  popover:[
                    {
                      label:this.$t('dashboard.overview.project.project'),
                      prop:'name'
                    },
                    {
                      label:this.$t('dashboard.overview.project.module'),
                      prop:'moduleNum'
                    },
                    {
                      label:this.$t('dashboard.overview.project.endpoint'),
                      prop:'endpointNum'
                    }
                  ]
                },
                {
                  label:this.$t('dashboard.overview.asset.alert'),
                  prop:'alertNum',
                  show:true,
                  showPopover: false
                }
              ]
            }
          }
        }else{
            console.error('the param is invalid');
            return {}
        }
      },
      queryEndpointData:function(){
        this.$refs.endpointTab.startLoading();
        this.$get('/overview/endpointStat').then(response=>{
          if(response.msg == 'success'){
            let showData=response.data;
            this.endpointStatData=this.formatEndpointData(showData);
            this.$refs.endpointTab.endLoading();
          }else{
            this.$message.error(response.msg)
          }
        })
      },
      formatEndpointData:function(data){
        if(data){
          return {
            screen:{ //左侧概览信息
              show:true,
              direction:'row',
              total:{ //左侧上方大图标及total信息
                show:true,
                direction:'column',
                num:data.total,
                title:this.$t('dashboard.overview.project.endpoint'),
                showPopover:false,
                icon:'nz-icon nz-icon-dataRecv',
                popover:[]
              },
              stat:{//左侧下方 小图标，
                show:true,
                up:data.up,
                down:data.down
              }
            },
            table:{//右侧table
              show:false,
              tableData:[],
              tableLabel:[]
            }
          }
        }else{
          console.error('the param is invalid');
          return {}
        }
      },
      queryDataCenterData:function(){
        this.$refs.dataCenterTab.startLoading();
        this.$get('/overview/datacenterStat').then(response=>{
          if(response.msg == 'success') {
            let showData = response.data;
            this.dataCenterStatData = this.formatDataCenterData(showData);
            this.$refs.dataCenterTab.endLoading();
          }else{
            this.$message.error(response.msg)
          }
        })
      },
      formatDataCenterData:function(data){
        if(data){
          return {
            screen:{ //左侧概览信息
              show:true,
              direction:'row',
              total:{ //左侧上方大图标及total信息
                show:true,
                direction:'column',
                num:data.dcTotal,
                title:this.$t('dashboard.overview.dataCenter.dataCenter'),
                showPopover:true,
                icon:'nz-icon nz-icon-IDCCabinet',
                popover:[
                  {
                    label:this.$t('dashboard.overview.dataCenter.cabinet'),
                    value:data.cabinetTotal
                  }
                ]
              },
              stat:{//左侧下方 小图标，
                show:false,
                up:0,
                down:0
              }
            },
            table:{//右侧table
              show:true,
              tableData:data.dcStat,
              tableLabel:[
                {
                  label:this.$t('dashboard.overview.project.name'),
                  prop:'name',
                  show:true,
                  showPopover:true,
                  showOverflowTooltip:false,
                  popover:[
                    {
                      label:this.$t('dashboard.overview.dataCenter.dataCenter'),
                      prop:'name'
                    },
                    {
                      label:this.$t('dashboard.overview.asset.pingUp'),
                      prop:'endpointUp'
                    },
                    {
                      label:this.$t('dashboard.overview.asset.pingDown'),
                      prop:'endpointDown'
                    },
                  ]
                },
                {
                  label:this.$t('dashboard.overview.dataCenter.promServer'),
                  prop:'promTotal',
                  show:true,
                  showPopover: true,
                  popover: [
                    {
                      label:this.$t('dashboard.overview.asset.pingUp'),
                      prop:'promUp'
                    },
                    {
                      label:this.$t('dashboard.overview.asset.pingDown'),
                      prop:'promDown'
                    },
                  ]
                },
                {
                  label:this.$t('dashboard.overview.asset.title'),
                  prop:'assetTotal',
                  show:true,
                  showPopover: true,
                  popover: [
                    {
                      label:this.$t('dashboard.overview.asset.inStock'),
                      prop:'assetInStock'
                    },
                    {
                      label:this.$t('dashboard.overview.asset.outStock'),
                      prop:'assetOutStock'
                    },
                    {
                      label:this.$t('dashboard.overview.asset.pingUp'),
                      prop:'assetPingUp'
                    },
                    {
                      label:this.$t('dashboard.overview.asset.pingDown'),
                      prop:'assetPingDown'
                    },
                  ]
                },
                {
                  label:this.$t('dashboard.overview.asset.alert'),
                  prop:'alertTotal',
                  show:true,
                  showPopover: true,
                  popover: [
                    {
                      label:this.$t('dashboard.overview.asset.alertLow'),
                      prop:'alertLow'
                    },
                    {
                      label:this.$t('dashboard.overview.asset.alertMedium'),
                      prop:'alertMedium'
                    },
                    {
                      label:this.$t('dashboard.overview.asset.alertHigh'),
                      prop:'alertHigh'
                    },
                  ]
                }
              ]
            }
          }
        }else{
          console.error('the param is invalid');
          return {}
        }
      },
      queryAlertTopNData:function(){
        this.$refs.topNTab.startLoading();
        this.$get('/overview/alertStatByRule?top='+this.topNFilter.defaultTop).then(response=>{
          if(response.msg == 'success') {
            let showData = response.data.list;
            this.topNStatData = this.formatAlertTopNData(showData);
            this.$refs.topNTab.endLoading();
          }else{
            this.$message.error(response.msg)
          }
        })
      },
      formatAlertTopNData:function(data){
        if(data){
          return {
            screen:{ //左侧概览信息
              show:false,
              direction:'row',
              total:{ //左侧上方大图标及total信息
                show:true,
                direction:'row',
                num:0,
                title:'',
                showPopover:false,
                icon:'',
                popover:[]
              },
              stat:{//左侧下方 小图标，
                show:false,
                up:0,
                down:0
              }
            },
            table:{//右侧table
              show:true,
              tableData:data,
              tableLabel:[
                {
                  label:this.$t('dashboard.overview.project.name'),
                  prop:'alertName',
                  show:true,
                  showPopover:false,
                  popover:[]
                },
                {
                  label:this.$t('dashboard.overview.alert.level'),
                  prop:'level',
                  show:true,
                  showPopover:false,
                  popover:[]
                },
                {
                  label:this.$t('dashboard.overview.asset.num'),
                  prop:'nums',
                  show:true,
                  showPopover:false,
                  popover:[]
                },
              ]
            }
          }
        }else{
          console.error('the param is invalid');
          return {}
        }
      },
      queryAssetTopNData:function(){
        this.$refs.topNTab.startLoading();
        this.$get('/overview/alertStatByAsset?top='+this.topNFilter.defaultTop).then(response=>{
          if(response.msg == 'success') {
            let showData=response.data.list;
            this.topNStatData=this.formatAssetTopNData(showData);
            this.$refs.topNTab.endLoading();
          }else{
            this.$message.error(response.msg)
          }
        })
      },
      formatAssetTopNData:function(data){
        if(data){
          return {
            screen:{ //左侧概览信息
              show:false,
              direction:'row',
              total:{ //左侧上方大图标及total信息
                show:true,
                direction:'row',
                num:0,
                title:'',
                showPopover:false,
                icon:'',
                popover:[]
              },
              stat:{//左侧下方 小图标，
                show:false,
                up:0,
                down:0
              }
            },
            table:{//右侧table
              show:true,
              tableData:data,
              tableLabel:[
                {
                  label:this.$t('dashboard.overview.asset.host'),
                  prop:'host',
                  show:true,
                  showPopover:false,
                  popover:[]
                },

                {
                  label:this.$t('dashboard.overview.asset.num'),
                  prop:'nums',
                  show:true,
                  showPopover:false,
                  popover:[]
                },
              ]
            }
          }
        }else{
          console.error('the param is invalid');
          return {}
        }
      },
      queryAlertRuleStatData:function(){
        this.$refs.alertRuleTab.startLoading();
        this.$get('/overview/alertRuleStat').then(response=>{
          if(response.msg == 'success') {
            let showData=response.data;
            this.alertRuleStatData=this.formatAlertRuleData(showData);
            this.$refs.alertRuleTab.endLoading();
          }else{
            this.$message.error(response.msg)
          }
        })
      },
      formatAlertRuleData:function(data){
        if(data){
          return {
            screen:{ //左侧概览信息
              show:true,
              direction:'column',
              total:{ //左侧上方大图标及total信息
                show:true,
                direction:'row',
                num:data.alertRuleTotal,
                title:this.$t('dashboard.overview.alert.alertRule'),
                showPopover:false,
                icon:'nz-icon nz-icon-page',
                popover:[]
              },
              stat:{//左侧下方 小图标，
                show:false,
                up:0,
                down:0
              }
            },
            table:{//右侧table
              show:true,
              tableData:data.alertRule,
              tableLabel:[
                {
                  label:this.$t('dashboard.overview.alert.level'),
                  prop:'level',
                  show:true,
                  showPopover:false,
                  popover:[]
                },
                {
                  label:this.$t('dashboard.overview.alert.ruleNum'),
                  prop:'ruleNum',
                  show:true,
                  showPopover:false,
                  popover:[]
                },
                {
                  label:this.$t('dashboard.overview.alert.alertNum'),
                  prop:'alertNum',
                  show:true,
                  showPopover:false,
                  popover:[]
                },
              ]
            }
          }
        }else{
          console.error('the param is invalid');
          return {}
        }
      },
      queryAlertTrendData:function(){
        this.$refs.chartbox.startLoading();
        let cur=this.dateFormat('yyyy-mm-dd HH:MM:SS',new Date());
        let beforeDate=new Date();
        beforeDate.setHours(new Date().getHours()-1);
        let before=this.dateFormat('yyyy-mm-dd HH:MM:SS',beforeDate);
        let params={
          query:'sum(nz_alert_nums)',
          start:before,
          end:cur,
          step:'15s'
        }
        this.$get('/prom/api/v1/query_range',params).then(response=>{
          if(response.status == 'success'){
            if(response.data.result){
              let series={
                name: 'nz_alert_nums',
                symbol:'none',  //去掉点
                smooth:true,  //曲线变平滑
                data: [],
                type:'line',
                areaStyle:{}
              }
              series.data=response.data.result[0].values.map((item)=>{
                return [item[0]*1000,item[1]];
              })
              this.chartSeries=[series];
              this.$refs.chartbox.modifyOption('tooltip','formatter',this.tooltipFormatter);
              this.$refs.chartbox.modifyOption('tooltip','position',this.tooltipPosition);
              this.$refs.chartbox.modifyOption('yAxis','formatter',this.yAxisFormatter);
              this.$refs.chartbox.setSeries(this.chartSeries);
              this.$refs.chartbox.endLoading();
            }
          }else{
            console.error(response)
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
                  seriesDatas.push({name:areaName,value:[areaInfo.longitude,areaInfo.latitude,dcStat]})
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
      /*加载数据 end*/
      mapTooltipFormatter(params){
        let dcStat=params.data.value[2];
        let tooltip=`
            <div class="tooltip">
                <div>${dcStat.name}</div>
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
      tooltipPosition:function(point,params,dom,rect,size){
        dom.style.transform = "translateZ(0)";
        //提示框位置
        var x=0;
        var y=0;
        //当前鼠标位置
        var pointX = point[0];
        var pointY = point[1];
        //外层div大小
        var viewWidth = size.viewSize[0];
        var viewHeight = size.viewSize[1];
        //提示框大小
        var boxWidth = size.contentSize[0];
        var boxHeight = size.contentSize[1];
        let chartDom = document.getElementById(this.chartId);
        if(chartDom){
          let parTop = chartDom.offsetTop;
          let parLeft = chartDom.offsetLeft;

          let parent = chartDom.parentElement;
          let parClientHeight = parent.clientHeight;//可视高度
          let parClientWidth = parent.clientWidth;//可视宽度
          let parScrollTop = parent.scrollTop;
          if((parClientWidth-pointX-parLeft-20)>=boxWidth){//说明鼠标在左边放不下提示框
            x=pointX+10;
          }else{
            x = pointX - boxWidth;
          }
          if((parClientHeight-pointY-(parTop-parScrollTop)-20)>=boxHeight){//说明鼠标上面放不下提示框
            y = pointY+10;
          }else {
            y = pointY-boxHeight;
          }
          return [x,y];
        }else {
          x = pointX - boxWidth;
          y = pointY+10;
          return [x,y];
        }
      },
      tooltipFormatter:function(params){
        let str = `<div>`;
        params.forEach((item, i) => {
          if(i===0){
            let t_date = new Date(item.data[0]);
            str += [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('-') + " "
              + [t_date.getHours(), t_date.getMinutes(),t_date.getSeconds()].join(':');
            str +=`<br/>`;
          }
          let val = Number(item.data[1]);
          str += `<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
          str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${item.color};}'></span>${item.seriesName}:  </div>`;
          str += `<div style="padding-left: 10px;">`;
          str += chartDataFormat.getUnit(5).compute(val,null,2);
          str += `</div>`;
          str += `</div>`;
        });
        str +=`</div>`;
        return str;
      },
      yAxisFormatter:function(value,index){
        let unit=chartDataFormat.getUnit(5);
        return unit.compute(value,index);
      },
      getAssetTabTitle:function(){
        switch (this.typeFilter) {
          case "typeStat":
            return this.$t('dashboard.overview.asset.assetType');
          case "modelStat":
            return this.$t('dashboard.overview.asset.modelStat');
          case "dcStat":
            return this.$t('dashboard.overview.asset.dcStat');
        }
      },
      assetRenderHeader:function(h, { column, $index }){ //修改header为dropdown
        let filters = [
          {text:this.$t('dashboard.overview.asset.dropDownLabel.type'),value:'typeStat'},
          {text:this.$t('dashboard.overview.asset.dropDownLabel.model'),value:'modelStat'},
          {text:this.$t('dashboard.overview.asset.dropDownLabel.dc'),value:'dcStat'},
        ];
        return h('div',
          {

          },
          [
            h('el-dropdown',
              {
                attrs:{
                  trigger:'click'
                }
              },
              [
                h('span',
                  {
                    domProps: {
                      innerHTML: column.label+'<i class="el-icon-arrow-down el-icon--right"></i>'
                    }
                  }
                ),
                h('el-dropdown-menu',
                  {
                    attrs:{
                      slot:'dropdown'
                    }
                  },
                  [
                    filters.map(item => {
                      return h("el-dropdown-item", {
                        domProps: {
                          innerHTML:item.text
                        },
                        nativeOn:{
                          click:this.assetTabFilterChange.bind(this,item.value)
                        }
                      });
                    })
                  ]
                  )
              ]
              )
          ]
        )

      },
      assetTabFilterChange:function(type){
        this.typeFilter=type;
        this.queryAssetData();
      },
      topNChange:function(item){
        if(this.topNFilter.default == 'alertRule'){
          this.queryAlertTopNData();
        }else if(this.topNFilter.default == 'asset'){
          this.queryAssetTopNData();
        }
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
        //this.$store.state.assetData.moduleData = data
        //this.$store.state.assetData.selectedData = id
        bus.$emit("menu-change", data);
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
    },
    computed:{

    },
    mounted() {
      this.initDate();
      this.initData();
      window.onresize = () => {
        setTimeout(()=>{this.isFullScreen=this.judgeFullScreen();},200)
        //解决flex排版错乱问题
        document.querySelectorAll(".content-row-box").forEach((item,index)=>{
          item.style.display = "none";
          setTimeout(()=>{item.style.display = '';},100)
        })
        //解决table显示原生滚动条问题
        setTimeout(() => {
          document.querySelectorAll('.el-table__body-wrapper').forEach((item,index)=>{
            item.classList.add("ps");
            item.classList.add("ps--active-y");
            item._ps_.update();
          })
        },200)
      }
      // window.addEventListener('keyup',(e)=>{
      //   if(e.key == 'F11'){
      //     this.fullScreen()
      //   }
      // })
    },
    watch:{
      isFullScreen:function(n,o){
        this.$nextTick(()=>{
          let width=this.$refs.chartbox.$el.clientWidth;
          let height=this.$refs.chartbox.$el.clientHeight * .95;
          this.$refs.chartbox.resizeChart(width,height);
          let mapWidth=this.$refs.dataCenterMap.$el.clientWidth;
          let mapHeight=this.$refs.dataCenterMap.$el.clientHeight * .95;
          this.$refs.dataCenterMap.resizeChart(mapWidth,mapHeight);
        });
      }
    }
  }
</script>

<style scoped>
@import "overview.scss";
</style>
<style>
  .overview .el-scrollbar__wrap{
    margin-bottom: 0px !important;
  }
  .overview-table .el-table__body{
    width: 100% !important;
  }
  .overview-content .column-flex .el-scrollbar__view{
    display: flex;
    flex-direction: column;
    height: 100%;
  }
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
