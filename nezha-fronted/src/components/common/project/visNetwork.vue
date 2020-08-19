<template>
    <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-table" ref="resizeBox">
      <div class="vis-network" :id="'chartTableDiv'+chartIndex" @mouseenter="caretShow=true" @mouseleave="caretShow=false">
        <loading :ref="'localLoading'+chartIndex"></loading>
        <div class="clearfix chartTitle text-right" :class="{'dragTitle':dragTitleShow}" :id="'chartTitle'+chartIndex">
          <el-popover
            v-if="isError"
            :close-delay=10
            placement="top-start"
            trigger="hover"
            popper-class="chart-error-popper">
            <div >{{errorContent}}</div>
            <span slot="reference" style="" class="panel-info-corner panel-info-corner--error">
                <i class="nz-icon nz-icon-warning fa"></i>
                <span class="panel-info-corner-inner"></span>
            </span>
          </el-popover>
          <span class="el-dropdown-link chart-title" @click="dropdownMenuShow=!dropdownMenuShow">
              <span></span>
              <span>
                <span class="chart-title-text">{{chartData.title}}</span>
                <!--<span class="chart-title-icon"><i class="el-icon-caret-bottom el-icon&#45;&#45;right"  :class="{'visible':caretShow,'hidden':!caretShow}"></i></span>-->
              </span>
              <span>
                <i class="nz-icon nz-icon-edit float-right"></i>
                <i class="nz-icon nz-icon-zoomin float-right"></i>
                <i class="nz-icon nz-icon-exit-full-screen float-right"></i>
              </span>
            </span>
        </div>
        <div class="vis-network-content">
          <topology :nodesArray="nodesArray" :edgesArray="edgesArray" @setTopologyData="setTopologyData" :isFullScreen="false" ref="topology"></topology>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
  import  a from './a.png'
  import  b from './b.png'
  import  c from './c.png'
  import  d from './d.png'
  import  e from './e.png'
  import  f from './f.png'
  import bus from '@/libs/bus';
  import {Loading} from 'element-ui';
  import chartDataFormat from '@/components/charts/chartDataFormat'
  import loading from "@/components/common/loading";
  import timePicker from '@/components/common/timePicker';
  import topology from './topology'
  export default {
    name: 'visNetwork',
    components: {
      'loading': loading,
      'time-picker':timePicker,
      'topology':topology,
    },
    props:{
      chartIndex:{
        type: Number,
        default: 0,
      },
      chartData: {
        type: Object
      },
    },
    data () {
      return {
        //其他
        isError:false,
        nodesArray:[
          { id: 1, label: "model",
            image: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=1906469856,4113625838&fm=26&gp=0.jpg',
            shape:'image',shapeProperties:{useImageSize:false},
            x:1,y:-63,
            imgId:0,
            scaling:{min:0.5,max:10,}
          },
          {id: 2, imgId:1, scaling:{min:0.5,max:10,}, label: "model", x:-236,y:-163, image: a, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 3, imgId:2, scaling:{min:0.5,max:10,}, label: "model", x:-346,y:-155, image: b, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 4, imgId:3, scaling:{min:0.5,max:10,}, label: "model", x:-129,y:169, image: c, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 5, imgId:4, scaling:{min:0.5,max:10,}, label: "model", x:-388,y:35, image: d, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 6, imgId:5, scaling:{min:0.5,max:10,}, label: "model", x:-345,y:-53, image: e, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 7, imgId:6, scaling:{min:0.5,max:10,}, label: "model", x:316,y:22, image: f, shape:'image',shapeProperties:{useImageSize:false}},
        ],
        edgesArray:[
          {id: 0,from: 2, to: 1, dashes:[15,15],label:"hahah",arrows:'from;to', color: {color:'#ff4500',highlight:'#ff4500',hover:'#ff4500',opacity:1.0}},
          {id: 1,from: 3, to: 1, dashes:[15,15],label:"hahah",arrows:'from',smooth:true, color: {color:'#1e90ff',highlight:'#1e90ff',hover:'#1e90ff',opacity:1.0}},
          {id: 2,from: 5, to: 4, dashes:[15,15],label:"hahah",arrows:'to',smooth:true, color: {color:'#1e90ff',highlight:'#1e90ff',hover:'#1e90ff',opacity:1.0}},
          {id: 3,from: 4, to: 1, dashes:[15,15],label:"hahah",arrows:'from;to',smooth:true, color: {color:'#1e90ff',highlight:'#1e90ff',hover:'#1e90ff',opacity:1.0}},
          {id: 4,from: 4, to: 6, dashes:[15,15],label:"hahah",arrows:'from;to',smooth:true, color: {color:'#1e90ff',highlight:'#1e90ff',hover:'#1e90ff',opacity:1.0}},
          {id: 5,from: 1, to: 7, dashes:[15,15],label:"hahah",arrows:'from;to',smooth:true, color: {color:'#1e90ff',highlight:'#1e90ff',hover:'#1e90ff',opacity:1.0}},
        ],
        dragTitleShow:false,
      }

    },

    methods:{
      // 设置拓扑图数据
      setTopologyData(nodesArr,edgesArr){
        this.nodesArray=nodesArr;
        this.edgesArray=edgesArr;
      },
    },

    mounted(){
      this.firstLoad = false;
    }

  }

</script>
<style lang="scss">
  @import './chart.scss';
</style>
<style scoped>
  .table-container{
    height: calc(100% - 30px);
  }
  .nz-icon{
    cursor: pointer;
  }
  .resize-box .vis-network .text-right{
    text-align: right;
  }
  .resize-box .vis-network .chartTitle .chart-title{
    justify-content: space-between;
    align-items: stretch;
  }
  .vis-network-content{
    height: 100%;
  }
</style>
