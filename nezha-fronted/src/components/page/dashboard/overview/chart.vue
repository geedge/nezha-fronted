<template>
  <div class="chart-room" @mouseenter="mouseEnterChart" @mouseleave="mouseLeaveChart" ref="chartRoom">
    <loading  ref="loading"></loading>
    <div class="showMore" v-if="legendAll.length !== legend.length"><i class="nz-icon nz-icon-jinggao"></i>{{$t("dashboard.panel.moreTitle")}} <span class="moreChart" @click="showMore">{{$t("dashboard.panel.showAll")+legendAll.length}}</span></div>
    <div class="chart-header">{{chartTitle}}</div>

    <div class="chart-body" ref="chartBody" :id="chartId" ></div>
    <div class="chart-no-data" v-show="noData">No Data</div>

    <div class="legend-container legend-container-screen" id="legendArea" ref="legendArea" v-show="legend.length>0" v-scrollBar:legend>
      <div v-for="(item, index) in legend" :title="item.alias?item.alias:item.name"  @click="clickLegend(item.name,index)" class="legend-item" :class="{'ft-gr':item.isGray}" :key="'legend_' + item.name+'_'+index">
        <span class="legend-shape" :style="{background:(item.isGray?'#D3D3D3':getBgColor(index))}"></span>{{item.alias?item.alias:item.name}}
      </div>
    </div>

  </div>
</template>

<script>
  import echarts from 'echarts';
  import chartDataFormat from "../../../charts/chartDataFormat";
  import loading from "../../../common/loading";
  import chartConfig from './chartConfig'
  import bus from "../../../../libs/bus";
  import EleResize from "../../../common/js/divResize";
  import {randomcolor} from "../../../common/js/radomcolor/randomcolor";
  //import * as mapGeoJson from "../../../common/js/world";

  export default {
    name: "chart",
    components:{
      'loading':loading,
    },
    props:{
      name: {type: String,default:'chart'},
      unit:{type:Number,default:5},
      chartTitle:{type:String},
      showToolbox:{type:Boolean,default:true},
      chartType:{type:String,default:'line'},
      tooltipFormatter:Function,
      yAxisFormatter:Function,
      map:{},
      axisTooltip: {type: String}, // x/y
    },
    data(){
      return {
        chart:null,
        option:null,
        optionSeriesAll:null,
        chartId: this.name + '-'+this.guid()+'-'+new Date().getTime(),
        legend:[],
        legendAll:[],
        colors:chartConfig.getBgColorList(),
        noData:false,
        dataSize:20,
      }
    },
    created() {
      this.option=chartConfig.getOption(this.chartType);
      if(this.showToolbox == false){
        //this.option.grid.top = 10;
      }
    },
    methods:{
      modifyOption:function(target,name,obj){
        if(!this.option){
          this.option=chartConfig.getOption(this.chartType);
        }
        this.$set(this.option[target],name,obj)
      },
      setLegend:function(legend){
        this.legendAll=legend;
        this.legend=legend.filter((item,index)=>index<this.dataSize);
        this.resize();
      },
      setSeries:function(series, legend, legendData){
        if(!this.chart){
          this.chartInit();
        }
        this.series = series;
        if(this.chartType == 'map'){
          if(this.map){
            echarts.registerMap(this.map.name, this.map.geoJson);
            chartConfig.setMap(this.map.name);
          }else{
            console.error('map chart need map data');
          }

        }
        if(!this.option){
          this.option = chartConfig.getOption(this.chartType);
        }
        if (legend && legendData) {
          legend.formatter = function(name) {
            let type = legendData.find(item => {
              return item[0] == name;
            });
            return `${name} (${type[1]}%)`;
          }
          this.$set(this.option, "legend", legend);
        }

        if(this.chartType == 'map'){
          let geoObj = this.map.geoJson.geoJson;
          geoObj.features.forEach(item=>{
            if(this.option.geo.regions){
              this.option.geo.regions.push({
                name:item.properties.name,
                itemStyle: {
                  normal: {
                    areaColor: "white"
                  }
                }
              })
            }else{
              this.option.geo.regions=[{
                name:item.properties.name,
                itemStyle: {
                  normal: {
                    areaColor: "white"
                  }
                }
              }]
            }
          });
          //let timer = setTimeout(()=>{}, 0);
          //地图拖动、缩放时动态读取地图数据
          /*this.chart.on("georoam", params => {
            //console.info(this.map.geoJson.geoJson.features[0]);
            clearTimeout(timer);
            timer = setTimeout(() => {  //延时触发，0.6秒无操作再更新地图数据
              let dx = params.dx; //拖动x位移
              let dy = params.dy; //拖动y位移
              if (dx || dy) {
                let option = this.chart.getOption();
                let center = option.geo[0].center; //拖动后的中心点
                let newJson = mapGeoJson.getProvinceJson(center);
                this.map.geoJson.geoJson = newJson;
                //console.info(this.map.geoJson.geoJson.features.length);
                //this.clearChart();
                //this.chartInit();
                //echarts.registerMap(this.map.name, this.map.geoJson);
              }

              //this.chart.setOption(option, true);
              //console.info(this.map.geoJson.geoJson.features.length);
            }, 600);
          });*/
          /*this.chart.on("click", params => {
            let option = this.chart.getOption();
            console.info(option.geo[0].center);
          });*/
        }

        this.modifyOption('tooltip','position',this.defaultTooltipPosition)

        if (this.tooltipFormatter) {
          this.modifyOption('tooltip', 'formatter', this.tooltipFormatter)
        } else {
          this.modifyOption('tooltip', 'formatter', this.defaultTooltipFormatter)
        }

        if(this.chartType == 'line'){
          if(this.yAxisFormatter){
            this.option.yAxis.axisLabel.formatter=this.yAxisFormatter;
          }else{
            this.option.yAxis.axisLabel.formatter=this.defaultYAxisFormatter
          }
        }
        // console.log(this.option)
        if(this.series){
          this.$set(this.option,'series',this.series);
          this.noData=false;
          this.chart.clear();
          this.optionSeriesAll=[...this.option.series];
          if(this.option.series instanceof Array){
            this.option.series=this.option.series.filter((item,index)=>index<this.dataSize);
          }
          this.chart.setOption(this.option);
        }else{
          this.noData=true;
          let option=chartConfig.getOption('noData');
          this.chart.clear();
          this.chart.setOption(option);
        }

        //坐标轴label鼠标悬浮提示
        if (this.axisTooltip) {
          let tooltipDom = document.querySelector(".axis-tooltip");
          this.chart.on('mouseover', (params) => {
            if(params.componentType == this.axisTooltip + "Axis") {
              tooltipDom.style.display = "block";
              tooltipDom.innerHTML = params.value;
            }
            this.$refs.chartRoom.addEventListener("mousemove", (event) => {
              tooltipDom.style.top = event.pageY + "px";
              tooltipDom.style.left = event.pageX-15 + "px";
            });
          });
          this.chart.on('mouseout', (params) => {
            if(params.componentType == this.axisTooltip + "Axis") {
              tooltipDom.style.display = "";
            }
          });
        }
        this.resize();
      },
      resizeChart:function(width,height){
        if(this.chart){
          this.chart.resize({width:width,height:height});
        }
      },
      resize:function(){
        this.$nextTick(() => {
          if(this.chart){
            //let height=this.$el.clientHeight;
            //console.info(this.$el.clientHeight)
            let height = this.$el.clientHeight-document.querySelector("#legendArea").offsetHeight;
            //console.info(document.querySelector("#legendArea").offsetHeight)
            /*for (let i in document.querySelector("#legendArea")) {
              console.info(i, document.querySelector("#legendArea")[i])
            }*/
            let width=this.$el.clientWidth;
            /*if(this.chartTitle){
              height = height - 20;
            }
            if(this.legend && this.legend.length>0){
              height = height - 80;
            }*/
            this.chart.resize({width:width,height:height});
          }
        });
      },
      mouseEnterChart(){
        if (this.chart&&this.showToolbox) {
          this.chart.setOption({
            toolbox: {
              show:true,
            }
          })
        }
      },
      mouseLeaveChart(){
        if (this.chart) {
          this.chart.setOption({
            toolbox: {
              show:false,
            }
          })
        }
      },
      getBgColor:function(index){
        let color=this.colors[index];
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
          let alias=this.queryAlias(item.seriesName)
          let val = Number(item.data[1]);
          str += `<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
          str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${item.color};}'></span>${alias?alias:item.seriesName}:  </div>`;
          str += `<div style="padding-left: 10px;">`;
          str += chartDataFormat.getUnit(this.unit).compute(val,null,2);
          str += `</div>`;
          str += `</div>`;
        });
        str +=`</div>`;
        return str;
      },
      queryAlias:function(seriesName){
        let alias=null;
        if(this.legend&&this.legend.length>0){
          let tempLegend=this.legend.find((item)=>{return item.name == seriesName});
          if(tempLegend){
            alias=tempLegend.alias;
          }
        }
        return alias;
      },
      defaultYAxisFormatter:function(value,index){
        let unit=chartDataFormat.getUnit(this.unit);
        return unit.compute(value,index);
      },
      setRandomColors:function(num){//当线条过多，默认颜色数量不够时须使用此方法,num 颜色的数量，通常传递series的length即可
        let colors=[];
        for(let i=0;i<num;i++){
          colors.push(randomcolor())
        }
        this.colors=Object.assign([],colors)
        this.$set(this.option,'color',colors)
      },
      startLoading:function(){
        this.$refs.loading.startLoading();
        this.$emit("is-loading", true);
      },
      endLoading:function(){
        this.$refs.loading.endLoading();
        this.$emit("is-loading", false);
      },
      guid() {
        function S4() {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
      },
      clearChart() {
        if(this.chart) {
          this.chart.clear();
        }
      },
      showMore(){// 显示更多
        this.legend=this.legendAll;
        let option={
          series:this.optionSeriesAll
        };
        this.chart.setOption(option);
        this.chart.resize()
      },
      chartInit() {
        this.chart=echarts.init(document.getElementById(this.chartId));
      }
    },
    mounted() {
      this.chartInit();
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
<!--<style>
 @import "../../../charts/chart.scss";
</style>-->
<style scoped>
  .showMore{
    text-align: center;
    font-size: 12px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
  }
  .nz-icon-jinggao{
    color: rgb(255, 133, 27);
    margin-right: 5px;
    font-size: 14px;
  }
  .moreChart{
    color: rgb(87, 148, 242);
    cursor: pointer;
  }
  .chart-room{
    width: 100%;
    height: 100%;
    position: relative;
  }
  .chart-room .legend-container{
    width: calc(100% - 30px);
    max-height:80px;
    min-height:25px;
    /*height: 80px;*/
    font-size:12px;
    text-align:left;
    left: 10px;
    bottom: 5px;
    line-height: 18px;
    position: absolute;
  }
  .chart-room .legend-container .legend-item{
    text-overflow:ellipsis;
    white-space:nowrap;
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
