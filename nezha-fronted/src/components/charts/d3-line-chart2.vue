<template>
  <div style="position: relative;">
    <div id="chart"></div>
    <div class="legend-container legend-container-screen" id="legendArea" ref="legendArea" v-show="legends.length>0" v-scrollBar:legend >
      <div v-for="(item, index) in legends" :title="item.name"  @click="clickLegend(item.name,index)" class="legend-item" :class="{'ft-gr':item.isGray}" :key="'legend_' + item.name+'_'+index">
        <span class="legend-shape" :style="{background:(item.isGray?'#D3D3D3':getBgColor(index))}"></span>{{item.name}}
      </div>
    </div>
  </div>

</template>

<script>
  import {D3LineChart} from "./d3-line";

  export default {
    name: "d3-line-chart2",
    data:function(){
      return{
        option:{
          width:1000,
          height:400,
          datas:[],
          timeFormat:'%H:%M:%S',
          legends: [],
          title:'',
          subTitle:'',
          colors:["red", "blue", "green", 'black'],
        },
        chart:null,
        legends:[],
      }
    },
    methods:{
      init:function(){
        let chartData=this.getData();
        this.option.datas=chartData.data;
        this.option.legends=chartData.legends;
        this.chart=D3LineChart('#chart',this.option)
        this.chart.init()
        console.log(this.chart)

      },
      clickLegend:function(legendName,index){
        let curIsGrey=this.legends[index].isGray;
        if(this.chart){
          this.legends.forEach((item,i)=>{
            let isGrey = item.isGray;
            if(index != i){ //不是当前点击的
              if(!curIsGrey && !isGrey){
                this.chart.dispatchAction('line-single-show',legendName)
                item.isGray=true;
              }else if(!curIsGrey && isGrey){
                item.isGray=false;
                this.chart.dispatchAction('line-all-show',legendName)
              }else{
                item.isGray=true
                this.chart.dispatchAction('line-single-show',legendName)
              }

            }else {//当前点击的
              if(item.isGray === true){
                item.isGray = false;
              }
              this.chart.dispatchAction('line-single-show',legendName)
            }
          });
        }
      },
      getData() {
        let legends=[];
        let datas=[];
        let startTime=new Date()
        startTime.setHours(new Date().getHours() - 1);
        let start=Math.round(startTime.getTime()/1000);
        let end=Math.round(new Date().getTime()/1000)
        this.$get('/prom/api/v1/query_range?query=node_cpu_frequency_hertz{asset="192.168.40.126"}&start='+start+'&end='+end+'&step=15s').then(response=>{
          if(response.status == 'success'){
            let result=response.data.result;
            result.forEach(item=>{
              let metric=item.metric;
              let metricName=metric.__name__;
              delete metric.__name__;
              let legend=metricName+"{"
              for(let key in metric){
                legend+=key + '="'+metric[key]+'",';
              }
              legend.substring(0,legend.length-1);
              legend+='}'

              legends.push(legend)

              let values=item.values.map(item=>{
                return [item[0]*1000,Number(item[1])]
              })

              datas.push(values);
            })

            this.option.datas=datas;

            this.legends=legends.map(item=>{
              return{name:item,isGray:false}
            });
            this.option.legends=JSON.parse(JSON.stringify(this.legends))

            this.chart=D3LineChart('#chart',this.option)
            this.chart.init()
          }
        })
      },
      getBgColor:function(index){
        let color=this.chart.colors[index];
        return color;
      },
    },
    mounted() {
      this.getData();
      // this.init()
    }
  }
</script>

<style scoped>
@import "chart.scss";
  .legend-container{
    bottom: unset !important;

  }
</style>
