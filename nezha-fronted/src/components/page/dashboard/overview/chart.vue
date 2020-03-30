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
        this.option=chartConfig.getOption(this.chartType);
        this.$set(this.option,'series',this.series);
        if(this.chartType == 'line'){
          this.$set(this.option.tooltip,'formatter',this.tooltipFormatter);
          this.$set(this.option.tooltip,'position',this.tooltipPosition);
          this.$set(this.option.yAxis,'formatter',this.yAxisFormatter);
        }

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
