<template>
  <div class="chart-room">
    <loading  ref="loading"></loading>

    <div class="chart-header">{{chartTitle}}</div>

    <div class="chart-body" ref="chartBody" :id="chartId" style="height: 95%"></div>


  </div>
</template>

<script>
  import echarts from 'echarts';
  import chartDataFormat from "../../../charts/chartDataFormat";
  import loading from "../../../common/loading";
  import uuidv1 from "uuid/v1";
  import chartConfig from './chartConfig'
  export default {
    name: "chart",
    components:{
      'loading':loading,
    },
    props:{
      chartTitle:{type:String},
      chartType:{type:String,default:'line'},
      map:{}
    },
    data(){
      return {
        chart:null,
        option:{},
        chartId:new uuidv1()+'-'+new Date().getTime(),
      }
    },
    created() {

    },
    methods:{

      modifyOption:function(target,name,obj){
        if(this.option){
          this.option=chartConfig.getOption(this.chartType);
        }
        this.$set(this.option[target],name,obj)
      },
      setSeries:function(series){
        if(!this.chart){
          this.chart=echarts.init(document.getElementById(this.chartId));
        }
        this.series=series;
        if(this.chartType == 'map'){
          if(this.map){
            echarts.registerMap(this.map.name,this.map.geoJson);
            chartConfig.setMap(this.map.name);
          }else{
            console.error('map chart need map data');
          }

        }
        if(this.option){
          this.option=chartConfig.getOption(this.chartType);
        }
        this.$set(this.option,'series',this.series);
        /*if(this.chartType == 'line'){
          this.$set(this.option.tooltip,'formatter',this.tooltipFormatter);
          this.$set(this.option.tooltip,'position',this.tooltipPosition);
          this.$set(this.option.yAxis,'formatter',this.yAxisFormatter);
        }*/

        this.chart.clear();
        this.chart.setOption(this.option)
      },
      resizeChart:function(width,height){
        if(this.chart){
          this.chart.resize({width:width,height:height});
        }
      },
      startLoading:function(){
        this.$refs.loading.startLoading();
      },
      endLoading:function(){
        this.$refs.loading.endLoading();
      }
    },
    mounted() {
      this.chart=echarts.init(document.getElementById(this.chartId));
    },
    watch:{

    },
    destroyed() {
      if(this.chart){
        this.chart.clear();
      }
    }
  }
</script>

<style scoped>
.chart-room{
  width: 95%;
  height: 100%;
  position: relative;
}
</style>
