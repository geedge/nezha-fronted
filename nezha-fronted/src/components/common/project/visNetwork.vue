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
                <i class="nz-icon nz-icon-edit float-right" @click="editVisNetwork=!editVisNetwork"></i>
                <!--<i class="nz-icon nz-icon-zoomin float-right"></i>-->
                <!--<i class="nz-icon nz-icon-exit-full-screen float-right"></i>-->
              </span>
            </span>
        </div>
        <div class="vis-network-content">
          <topology
            :editVisNetwork="editVisNetwork"
            :nodesArray="nodesArray"
            :edgesArray="edgesArray"
            @setTopologyData="setTopologyData"
            :isFullScreen="false"
            ref="topology"
            :allModuleInfo="allModuleInfo"
            v-loading="topologyLoading"
          >

          </topology>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
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
      allModuleInfo:{}
    },
    watch:{
      allModuleInfo:{
        immediate: true,
        deep: true,
        handler(n){
          this.getNetworkData(n);
        },
      }
    },
    data () {
      return {
        //其他
        isError:false,
        nodesArray:[],
        edgesArray:[],
        dragTitleShow:false,
        dropdownMenuShow:false,
        editVisNetwork:false,
        topologyLoading:false,
      }

    },

    methods:{
      // 设置拓扑图数据
      setTopologyData(nodesArr,edgesArr){
        this.nodesArray=nodesArr;
        this.edgesArray=edgesArr;
      },
      getNetworkData(n){
        this.topologyLoading=true;
        setTimeout(()=>{
          this.edgesArray=[];
          this.nodesArray=[];
          setTimeout(()=>{
            this.topologyLoading=false;
            this.$refs['topology'].setNetworkData( this.edgesArray,this.nodesArray);
          },1000)
        },500)
      }
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
