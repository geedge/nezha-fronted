<template>
  <div class="main-content">
    <div class="main-box">
      <div class="main-box-title">{{$t("asset.asset")}}</div>
      <div class="main-box-content">
        <div class="tooltip--row">
          <div class="legend-value">
            <div>{{moduleInfo.assetStat.up}}</div>
            <div>{{moduleInfo.assetStat.down}}</div>
          </div>
          <div class="tooltip-chart" id="chart--asset"></div>
        </div>
      </div>
    </div>

    <div class="main-box">
      <div class="main-box-title">{{$t("project.endpoint.endpoint")}}</div>
      <div class="main-box-content">
        <div class="tooltip--row">
          <div class="legend-value">
            <div>{{moduleInfo.endpointStat.up}}</div>
            <div>{{moduleInfo.endpointStat.down}}</div>
            <div>{{moduleInfo.endpointStat.suspended}}</div>
          </div>
          <div class="tooltip-chart" id="chart--endpoint"></div>
        </div>
        <!--<div class="content-box">
          <span class="content-title"><i class="nz-icon nz-icon-arrow-up2 colorFFF bg23BF9A"></i>up</span>
          <span class="float-right">{{moduleInfo.endpointStat.up}}</span>
        </div>
        <div class="content-box">
          <span class="content-title"><i class="nz-icon nz-icon-arrow-down1 colorFFF bgEC7F66"></i>down</span>
          <span class="float-right">{{moduleInfo.endpointStat.down}}</span>
        </div>-->
      </div>
    </div>

    <div class="main-box">
      <div class="main-box-title">Alert messages</div>
      <div class="main-box-content">
        <div class="tooltip-alert--row">
          <div class="row--label row--label__p1">P1</div><div class="row--value row--value__p1">{{moduleInfo.alertStat.P1}}</div>
        </div>
        <div class="tooltip-alert--row">
          <div class="row--label row--label__p2">P2</div><div class="row--value row--value__p2">{{moduleInfo.alertStat.P2}}</div>
        </div>
        <div class="tooltip-alert--row">
          <div class="row--label row--label__p3">P3</div><div class="row--value row--value__p3">{{moduleInfo.alertStat.P3}}</div>
        </div>
        <!--<div class="content-box">
          <span class="content-title"><i class="nz-icon nz-icon-jiantou-top colorFFF bg23BF9A"></i>P1</span>
          <span class="float-right">{{moduleInfo.alertStat.P1}}</span>
        </div>
        <div class="content-box">
          <span class="content-title"><i class="nz-icon nz-icon-jiantou-right colorFFF bg3C92F1"></i>P2</span>
          <span class="float-right">{{moduleInfo.alertStat.P2}}</span>
        </div>
        <div class="content-box">
          <span class="content-title"><i class="nz-icon nz-icon-jiantou-down colorFFF bgEC7F66"></i>P3</span>
          <span class="float-right">{{moduleInfo.alertStat.P3}}</span>
        </div>-->
      </div>
    </div>
  </div>
</template>

<script>
  import chartConfig from '../../../page/dashboard/overview/chartConfig';
  import echarts from "echarts";
  
  var endpointChart;
  var assetChart;
	export default {
		name:"popDataMain",
    props:{
		  moduleId:{},
      projectId:{},
    },
    watch:{
      moduleId(n){
        if(n){
          this.init();
        }
      }
    },
    data(){
		  return{
        moduleInfo:{
          alertStat:{
            P1:0,
            P3:0,
            P2:0,
          },
          assetStat:{
            down:0,
            up:0,
          },
          endpointStat:{
            down:0,
            up:0,
          },
        }
      }
    },
    mounted(){
		  this.init()
    },
    methods:{
		  init(){
        this.$get('/module/stat',{id:this.moduleId}).then(res=>{
          this.moduleInfo = res.data;
          //console.info(this.moduleInfo);
          endpointChart = echarts.init(document.querySelector("#chart--endpoint"));
          assetChart = echarts.init(document.querySelector("#chart--asset"));
          let endpointOption = chartConfig.getOption("topoPie"),
            assetOption = chartConfig.getOption("topoPie");
          endpointOption.series[0].label.formatter = this.moduleInfo.endpointStat.down+this.moduleInfo.endpointStat.up + "";
          endpointOption.series[0].data = [
            {name: this.$t("dashboard.overview.asset.pingUp"), value: this.moduleInfo.endpointStat.up ? this.moduleInfo.endpointStat.up : 0},
            {name: this.$t("dashboard.overview.asset.pingDown"), value: this.moduleInfo.endpointStat.down ? this.moduleInfo.endpointStat.down : 0},
            {name: this.$t("asset.suspended"), value: this.moduleInfo.endpointStat.suspended ? this.moduleInfo.endpointStat.suspended : 0}
          ];
          endpointOption.title.show = false;
          endpointOption.legend.data = [this.$t("dashboard.overview.asset.pingUp"), this.$t("dashboard.overview.asset.pingDown"), this.$t("asset.suspended")];
          assetOption.series[0].label.formatter = this.moduleInfo.assetStat.up+this.moduleInfo.assetStat.down + "";
          assetOption.series[0].data = [
            {name: this.$t("dashboard.overview.asset.pingUp"), value: this.moduleInfo.assetStat.up ? this.moduleInfo.assetStat.up : 0},
            {name: this.$t("dashboard.overview.asset.pingDown"), value: this.moduleInfo.assetStat.down ? this.moduleInfo.assetStat.down : 0}
          ];
          assetOption.title.show = false;
          assetOption.legend.data = [this.$t("dashboard.overview.asset.pingUp"), this.$t("dashboard.overview.asset.pingDown")];
          endpointChart.setOption(endpointOption, true);
          assetChart.setOption(assetOption, true);
        })
      }
    },
  }
</script>

<style lang="scss" scoped>
  .main-content{
    display: flex;
    margin-right: 15px;
    flex-direction: column;
    justify-content: space-between;

    .tooltip--row {
      position: relative;
      height: 70px;
      
      .legend-value {
        font-size: 12px;
        color: #333333;
        position: absolute;
        left: 150px;
        top: 6px;
      }

      .tooltip-chart {
        height: 100%;
        width: 100%;
      }
    }

    .tooltip-alert--title span:first-of-type {
      font-weight: 600;
    }

    .tooltip-alert--title span:last-of-type {
      padding-left: 10px;
    }

    .tooltip-alert--row:last-of-type {
      margin-bottom: unset;
    }
    .tooltip-alert--row {
      padding: 0 10px;
      margin-bottom: 10px;
      height: 20px;
      font-size: 12px;
      display: flex;

      .row--label {
        width: 40px;
        border-radius: 4px 0 0 4px;
        color: white;
        text-align: center;
      }

      .row--label__p1 {
        background-color: #F2866E;
        border-color: #F2866E;
      }

      .row--label__p2 {
        background-color: #F89984;
        border-color: #F89984;
      }

      .row--label__p3 {
        background-color: #F7BA78;
        border-color: #F7BA78;
      }

      .row--value {
        padding: 0 8px;
        min-width: 40px;
        border: 1px solid;
        border-radius: 0 4px 4px 0;
        text-align: center;
      }

      .row--value__p1 {
        color: #F2866E;
        border-color: #F2866E;
      }

      .row--value__p2 {
        color: #F89984;
        border-color: #F89984;
      }

      .row--value__p3 {
        color: #F7BA78;
        border-color: #F7BA78;
      }
    }
  }
  .main-box{
    background: #FFFFFF;
    border: 1px solid #E7EAED;
    width: 190px;
    margin-bottom: 15px;
  }
  .main-box-title{
    background: #EFEFEF;
    font-size: 14px;
    color: #333333;
    height: 26px;
    line-height: 26px;
    padding-left: 12px;
  }
  .main-box-content{
    font-size: 12px;
    color: #333333;
    padding: 12px;
  }
 .main-box-content .content-box:not(:last-child){
    margin-bottom: 5px;
  }
  .content-title{
    color: #666666;
  }
  .colorFFF{
    color: #FFFFFF;
    vertical-align: middle;
    display: inline-block;
    padding: 1px;
    font-size: 10px;
    margin-right: 5px;
    line-height: 1;
  }
/*  .bg23BF9A{
    background: #23BF9A;
  }
  .bgEC7F66{
    background: #EC7F66;
  }
  .bg3C92F1{
    background: #3C92F1;
  }*/

</style>
