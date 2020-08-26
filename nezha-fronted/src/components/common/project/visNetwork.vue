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
                <!--<span class="chart-title-text">{{chartData.title}}</span>-->
                <!--<span class="chart-title-icon"><i class="el-icon-caret-bottom el-icon&#45;&#45;right"  :class="{'visible':caretShow,'hidden':!caretShow}"></i></span>-->
              </span>
              <span>
                <i class="nz-icon nz-icon-edit float-right" @click="editVisNetworkChange(!editVisNetwork)"></i>
                <!--<i class="nz-icon nz-icon-zoomin float-right"></i>-->
                <!--<i class="nz-icon nz-icon-exit-full-screen float-right"></i>-->
              </span>
            </span>
        </div>
        <div class="vis-network-content">
          <!--project主要信息-->
          <div class="facade-top" v-if="!editVisNetwork">
            <div class="facade-top-left" v-loading="projectInfo.loading">
              <div class="facade-top-title">
                {{projectInfo.title}}
              </div>
              <div>
                <span><span class="label">Id :</span>{{projectInfo.id}}</span>
                <span><span class="label special">Name :</span>{{projectInfo.name}}</span>
              </div>
              <div>
                <span><span class="label">Description :</span>{{projectInfo.remark?projectInfo.remark:'--'}}</span>
              </div>
              <div>
            <!--<span>-->
              <!--<span class="label">Alert state :</span>-->
              <!--<div class="active-icon" style="background: #B7464A 100%;"></div>{{projectInfo.alertStat[0]}}-->
              <!--<div class="active-icon" style="background: #E64E4E 100%;"></div>{{projectInfo.alertStat[1]}}-->
              <!--<div class="active-icon" style="background: #F7B500 100%;"></div>{{projectInfo.alertStat[2]}}-->
            <!--</span>-->
              </div>
              <div>
                <span><span class="label">Module Mum :</span>{{projectInfo.moduleMum}}</span>
              </div>
            </div>
            <div class="facade-top-right" v-loading="projectInfo.loading">
              <div class="facade-top-title">
                <span class="label">Alert :</span>
                {{total}}
              </div>
              <div class="facade-top-right-content">
                <div>
                  <el-progress
                    type="circle"
                    :percentage="(projectInfo.alertStat[0]/total)*100"
                    :show-text="false"
                    :width="40"
                    color="#F5A390"
                  ></el-progress>
                  <div class="align--center">{{projectInfo.alertStat[0]}}</div>
                </div>
                <div>
                  <el-progress
                    type="circle"
                    :percentage="(projectInfo.alertStat[1]/total)*100"
                    :show-text="false"
                    :width="40"
                    color="#F6B977"
                  ></el-progress>
                  <div class="align--center">{{projectInfo.alertStat[1]}}</div>
                </div>
                <div>
                  <el-progress
                    type="circle"
                    :percentage="(projectInfo.alertStat[2]/total)*100"
                    :show-text="false"
                    :width="40"
                    color="#EBD066"
                  ></el-progress>
                  <div class="align--center">{{projectInfo.alertStat[2]}}</div>
                </div>
              </div>
            </div>
          </div>
          <!--拓扑图-->
          <topology
            :editVisNetwork="editVisNetwork"
            :nodesArray="nodesArray"
            :edgesArray="edgesArray"
            @setTopologyData="setTopologyData"
            :isFullScreen="false"
            ref="topology"
            :allModuleInfo="allModuleInfo"
            v-loading="topologyLoading"
            @editVisNetworkChange="editVisNetworkChange"
          >
          </topology>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
  import  a from './image/a.png'
  import  b from './image/b.png'
  import  c from './image/c.png'
  import  d from './image/d.png'
  import  e from './image/e.png'
  import  f from './image/f.png'
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
      allModuleInfo:{},
      projectInfo:{},
    },
    watch:{
      // allModuleInfo:{
      //   immediate: true,
      //   deep: true,
      //   handler(n){
      //     this.getNetworkData(n);
      //   },
      // },
      projectInfo:{
        immediate: true,
        handler(n){
          this.getNetworkData(n);
          this.total=this.projectInfo.alertStat[0]+this.projectInfo.alertStat[1]+this.projectInfo.alertStat[2]
        },
      },
      // alertData:{
      //   immediate: true,
      //   deep: true,
      //   handler(n){
      //     this.getNetworkData(n);
      //   },
      // },
    },
    data () {
      return {
        firstLoad:false,
        //其他
        isError:false,
        nodesArray:[],
        edgesArray:[],
        dragTitleShow:false,
        dropdownMenuShow:false,
        editVisNetwork:false,
        topologyLoading:false,
        total:1,
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
        console.log(n);
        this.$get('/project/topo',{projectId:n.id}).then(res=>{
          console.log(res);
          if(res.data.topo){
            this.nodesArray=this.formatNodesArr(res.data.topo.nodes);
            this.edgesArray=this.formatEdgesArr(res.data.topo.lines);
            console.log(this.nodesArray,this.edgesArray)
          }else{
            this.nodesArray=[];
            this.edgesArray=[];
          }
          setTimeout(()=>{
            this.topologyLoading=false;
            this.$refs['topology'].setData();
          },500)
        })
      },
      formatNodesArr(arr){
        let arr1=[];
        if(!arr){return arr1}
        arr.forEach((item)=>{
          item.shape='image';
          item.id=item.moduleId;
          switch(item.iconId){
            case 1: item.image=a;break;
            case 2: item.image=b;break;
            case 3: item.image=c;break;
            case 4: item.image=d;break;
            case 5: item.image=e;break;
            case 6: item.image=f;break;
            default: item.image=a;
          }
        });
        return arr
      },
      formatEdgesArr(arr){
        let arr1=[];
        if(!arr){return arr1}
        arr.forEach((item)=>{
          item.dashes=[15,15];
          item.from=item.source;
          item.to=item.target;

        });
        return arr
      },
      editVisNetworkChange(flag){
        this.editVisNetwork=flag;
        if(flag){
          this.$refs.topology.popDataShowUpdate();
        }
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
  .facade-top /deep/.active-icon{
    margin-top: 0;
  }
  .nz-icon-edit{
    margin-right: 5px;
  }
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
  .facade-top{
    min-height: 138px;
    display: flex;
    margin: 12px 0;
    height: calc(16% - 40px);
    font-size: 12px;
    position: absolute;
    top: 15px;
    left: 15px;
    z-index: 10;
  }
  .facade-top > div{
    height: calc(100% - 40px);
    width: 18%;
    min-width: 315px;
    background: #FFFFFF;
    margin-right: 9px;
    padding: 20px;
    border: 1px solid #FFFFFF;
    box-shadow: 1px 2px 4px 0 rgba(0,0,0,0.12), -1px 1px 9px -1px rgba(205,205,205,0.77);
  }
  .facade-top-title{
    font-size: 16px;
    color: #333333;
    font-weight: bold;
    padding: 5px 0;
  }
  .facade-top-left{
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  .special.label{
    margin-left: 30px;
  }
  .facade-top .facade-top-right{
    width: 12%;
    min-width: 280px;
  }
  .facade-top-right-content{
    display: flex;
    justify-content: space-around;
    justify-items: center;
    height: calc(100% - 30px);
    align-items:center;
  }
  .align--center{
    text-align: center;
  }
  .label{
    padding: 0 15px;
  }

</style>
