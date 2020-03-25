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
          <div class="header-title">{{$t('dashboard.overview.contentTitle')}}</div>
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
          <el-scrollbar style="height: 100%" ref="overviewScrollbar">
            <div class="content-row-box" >
              <div class="content-col-box box-height-200 " style="flex:3;" :class="{'box-height-266':isFullScreen}">
                <table-box :pop-data="assetStatData" ref="assetTab" ></table-box>
              </div>
              <div class="content-col-box box-height-200 " style="flex: 2" :class="{'box-height-266':isFullScreen}">
                <table-box :pop-data="projectStatData" ref="projectTab"></table-box>
              </div>
              <div class="content-col-box box-height-200 " style="flex:1;" :class="{'box-height-266':isFullScreen}">
                <table-box :pop-data="endpointStatData" ref="endpointTab"></table-box>
              </div>
            </div>
            <div class="content-row-box">
              <div class="content-col-box box-height-250 " style="flex: 1;" :class="{'box-height-316':isFullScreen}">
                <div class="flex-container">
                  <div style="flex: 2;">
                    <table-box :pop-data="dataCenterStatData" ref="dataCenterTab" ></table-box>
                  </div>
                  <div style="flex: 3;">
                    <chart-box chart-title="DataCenter" chart-type="map" ref="dataCenterMap"></chart-box>
                  </div>
                </div>
              </div>
            </div>
            <div class="content-row-box">
              <div class="content-col-box box-height-290 "style="flex: 3" :class="{'box-height-356':isFullScreen}">
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
              <div class="content-col-box box-height-290 "style="flex: 8;" id="alertTrendBox" :class="{'box-height-356':isFullScreen}">
                <chart-box  ref="chartbox" :chart-title="$t('dashboard.overview.alert.chart.chartTitle')"></chart-box>
              </div>
              <div class="content-col-box box-height-290 "style="flex: 2;" :class="{'box-height-356':isFullScreen}">
                <table-box :pop-data="alertRuleStatData" ref="alertRuleTab" ></table-box>
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
  import json from './geoJson'
  export default {
    name: "overview",
    components:{
      'table-box':tableBox,
      'chart-box':chart,
    },
    props:[],
    data(){
      return {
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
        this.queryDataCenterMapData();
      },
      queryAssetData:function(){
        this.$refs.assetTab.startLoading();
        axios.get('/overview/assetStat').then((res)=>{
          let response=res.data;
          if(response.msg == 'success'){
            let showData=response.data[this.typeFilter];
            this.assetStatData=this.formatAssetData(showData,response.data.totalStat);
            this.$refs.assetTab.endLoading();
          }else{
            this.$message.error(response.msg)
          }
        })
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
                direction:'row',
                num:totalData.inStock,
                title:this.$t('dashboard.overview.asset.title'),
                showPopover:true,
                icon:'nz-icon nz-icon-asset',
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
                direction:'row',
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
                  popover:[
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
                direction:'row',
                num:data.total,
                title:this.$t('dashboard.overview.project.endpoint'),
                showPopover:false,
                icon:'nz-icon nz-icon-project',
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
                icon:'nz-icon nz-icon-page',
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
                  popover:[
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
              this.$refs.chartbox.setSeries(this.chartSeries);
              this.$refs.chartbox.endLoading();
            }
          }else{
            console.error(response)
          }
        })
      },
      queryDataCenterMapData:function(){
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
            color: 'grey'
          },
          emphasis: {
            label: {
              show: true
            }
          },
          data:[
            {name:'Alabama', value: [-85.058981, 32.13674,40000.34]},
            {name:'xxx', value: [-71.799309, 41.414677,38000]},
            {name:'Arizona', value:[-114.470151, 32.843265,18000]},
          ]
        }]
        this.$refs.dataCenterMap.setSeries(this.dataCenterMapSeries);
      },
      /*加载数据 end*/
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
        console.log(fullScreenFunc)
        fullScreenFunc.call(container)
        // if(container.requestFullscreen){
        //   container.requestFullscreen();
        // } else if(container.mozRequestFullScreen) {
        //   container.mozRequestFullScreen();
        // } else if(container.webkitRequestFullscreen) {
        //   container.webkitRequestFullscreen();
        // } else if(container.msRequestFullscreen) {
        //   container.msRequestFullscreen();
        // }
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
        let enWeeks=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
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
        this.isFullScreen=this.judgeFullScreen();
      }
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
</style>
