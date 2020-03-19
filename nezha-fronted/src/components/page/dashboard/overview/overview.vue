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
      <div class="overview-right content-right">
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
              <div class="operation"><span ><i class="nz-icon nz-icon-maxview"></i></span></div>
            </div>
          </div>
        </div>

        <!--内容-->
        <div class="overview-content">
          <el-scrollbar style="height: 100%" ref="overviewScrollbar">
            <div class="content-row-box" >
              <div class="content-col-box box-height-200 " style="flex:3;">
                <table-box :pop-data="assetStatData" ref="assetTab">
                  <div :slot="this.$t('dashboard.overview.asset.assetType')+'-header'" class="mini-button" @click="showTypeFilter" >
                    <span class="mini-button-icon"><i class="nz-icon mini-font nz-icon-arrow-down" ></i></span>
                    <div v-show="this.typeFilter.show">
                      <ul>
                        <li>1</li>
                        <li>2</li>
                        <li>3</li>
                      </ul>
                    </div>
                  </div>
                </table-box>
              </div>
              <div class="content-col-box box-height-200 " style="flex: 2">
                <table-box :pop-data="projectStatData" ref="projectTab"></table-box>
              </div>
              <div class="content-col-box box-height-200 " style="flex:1;">
                <table-box :pop-data="endpointStatData" ref="endpointTab"></table-box>
              </div>
            </div>
            <div class="content-row-box">
              <div class="content-col-box box-height-250 " style="flex: 1;">
                <div class="flex-container">
                  <div style="flex: 2;">
                    <table-box :pop-data="dataCenterStatData" ref="dataCenterTab"></table-box>
                  </div>
                  <div style="flex: 3;"></div>
                </div>
              </div>
            </div>
            <div class="content-row-box">
              <div class="content-col-box box-height-300 "style="flex: 3">
                <table-box :pop-data="topNStatData" ref="topNTab"></table-box>
              </div>
              <div class="content-col-box box-height-300 "style="flex: 8;"></div>
              <div class="content-col-box box-height-300 "style="flex: 2;">
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
  import axios from 'axios';
  export default {
    name: "overview",
    components:{
      'table-box':tableBox
    },
    props:[],
    data(){
      return {
        assetStatData:{},
        typeFilter:{
          show:false,
          type:'typeStat'
        },
        projectStatData:{},
        endpointStatData:{},
        dataCenterStatData:{},
        topNStatData:{},
        alertRuleStatData:{},
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
        this.queryAlertTopNData();
        this.queryAlertRuleStatData();
      },
      queryAssetData:function(){
        this.$refs.assetTab.startLoading();
        axios.get('/overview/assetStat').then((res)=>{
          let response=res.data;
          if(response.msg == 'success'){
            let showData=response.data.typeStat;
            this.assetStatData=this.formatAssetData(showData,response.data.totalStat);
            this.$refs.assetTab.endLoading();
          }else{
            this.$message.error(response.msg)
          }
        })
      },
      formatAssetData:function(data,totalData){
        if(data && totalData){
          let assetStatData={
            screen:{ //左侧概览信息
              show:true,
              direction:'row',
              total:{ //左侧上方大图标及total信息
                show:true,
                direction:'row',
                num:totalData.total,
                title:this.$t('dashboard.overview.asset.title'),
                showPopover:true,
                icon:'nz-icon nz-icon-asset',
                popover:[
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
                  label:this.$t('dashboard.overview.asset.assetType'),
                  prop:'name',
                  show:true
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
                  prop:'alertTotal',
                  show:true,
                  showPopover:true,
                  popover:[
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
        this.$get('/overview/alertStatByRule?top=10').then(response=>{
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
        this.$get('/overview/alertStatByAsset?top=10').then(response=>{
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
      /*加载数据 end*/
      showTypeFilter:function(){
        this.typeFilter.show=true;
        console.log(this.typeFilter.show)
      },
      closeTypeFilter:function(){
        // this.typeFilter.show=false;
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
</style>
