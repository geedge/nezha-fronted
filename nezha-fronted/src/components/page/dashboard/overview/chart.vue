<template>
  <div class="chart-room">
    <loading  ref="loading"></loading>

    <div class="chart-header">{{chartTitle}}</div>

    <div class="chart-body" ref="chartBody" :id="chartId" ></div>

    <div class="legend-container" id="legendArea" ref="legendArea" v-show="legend.length>0" v-scrollBar:legend>
      <div v-for="(item, index) in legend" :title="item.alias?item.alias:item.name"  @click="clickLegend(item.name,index)" class="legend-item" :class="{'ft-gr':item.isGray}" :key="'legend_' + item.name+'_'+index">
        <span class="legend-shape" :style="{background:(item.isGray?'#D3D3D3':getBgColor(index))}"></span>{{item.alias?item.alias:item.name}}
        <br/>
      </div>
    </div>

  </div>
</template>

<script>
  import echarts from 'echarts';
  import chartDataFormat from "../../../charts/chartDataFormat";
  import loading from "../../../common/loading";
  import uuidv1 from "uuid/v1";
  import chartConfig from './chartConfig'
  import bus from "../../../../libs/bus";
  import EleResize from "../../../common/js/divResize";
  export default {
    name: "chart",
    components:{
      'loading':loading,
    },
    props:{
      chartTitle:{type:String},
      chartType:{type:String,default:'line'},
      tooltipFormatter:Function,
      yAxisFormatter:Function,
      map:{}
    },
    data(){
      return {
        chart:null,
        option:{},
        chartId:new uuidv1()+'-'+new Date().getTime(),
        legend:[],
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
      setLegend:function(legend){
        this.legend=legend;
        this.resize();
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

        this.modifyOption('tooltip','position',this.defaultTooltipPosition)

        if (this.tooltipFormatter) {
          this.modifyOption('tooltip', 'formatter', this.tooltipFormatter)
        } else {
          this.modifyOption('tooltip', 'formatter', this.defaultTooltipFormatter)
        }

        if(this.chartType == 'line'){
          if(this.yAxisFormatter){
            this.modifyOption('yAxis','formatter',this.yAxisFormatter)
          }else{
            this.modifyOption('yAxis','formatter',this.defaultYAxisFormatter)
          }
        }

        this.$set(this.option,'series',this.series);

        this.chart.clear();
        this.chart.setOption(this.option)
        this.resize();
      },
      resizeChart:function(width,height){
        if(this.chart){
          this.chart.resize({width:width,height:height});
        }
      },
      resize:function(){
        if(this.chart){
          let height=this.$el.clientHeight ;
          let width=this.$el.clientWidth;
          if(this.chartTitle){
            height = height - 20;
          }
          if(this.legend && this.legend.length>0){
            height = height - 80;
          }
          this.chart.resize({width:width,height:height});
        }
      },
      getBgColor:function(index){
        let color=chartConfig.getBgColorList()[index];
        return color;
      },
      clickLegend(legendName,index){
        let curIsGrey=this.legend[index].isGray;
        if(this.chart){
          this.legend.forEach((item,i)=>{
            let isGrey = item.isGray;
            if(index != i){ //不是当前点击的
              if(!curIsGrey && !isGrey){
                this.chart.dispatchAction({
                  type: 'legendUnSelect',
                  name: item.name
                });
                item.isGray=true;
              }else if(!curIsGrey && isGrey){
                this.chart.dispatchAction({
                  type: 'legendSelect',
                  name: item.name
                });
                item.isGray=false;
              }else{
                this.chart.dispatchAction({
                  type: 'legendUnSelect',
                  name: item.name
                });
                item.isGray=true
              }
            }else {//当前点击的
              this.chart.dispatchAction({
                type: 'legendSelect',
                name: item.name
              });
              if(item.isGray === true){
                item.isGray = false;
              }
            }
          });
        }
      },
      defaultTooltipPosition:function(point,params,dom,rect,size){
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
      defaultTooltipFormatter:function(params){
        let str = `<div>`;
        params.forEach((item, i) => {
          if(i===0){
            let value=bus.computeTimezone(item.data[0])
            let t_date = new Date(value);
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
      defaultYAxisFormatter:function(value,index){
        let unit=chartDataFormat.getUnit(5);
        return unit.compute(value,index);
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
      EleResize.on(this.$el,this.resize);
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
  .chart-room .legend-container{
    width: calc(100% - 30px);
    /*max-height:80px;*/
    /*min-height:40px;*/
    height: 80px;
    font-size:12px;
    text-align:left;
    margin:0 auto;
    line-height: 18px;
    position: relative;
  }
  .chart-room .legend-container .legend-item{
    text-overflow:ellipsis;
    white-space:nowrap;
    width:100%;
    overflow-x:hidden;
    cursor:pointer;
    display:inline-block;
    float:left;
    line-height: 20px;
  }
  .chart-room .ft-gr{
    color:lightgray;
  }
  .chart-room .legend-shape{
    display:inline-block;
    margin-right:5px;
    border-radius:10px;
    width:15px;
    height:5px;
    vertical-align: middle;
  }
</style>
