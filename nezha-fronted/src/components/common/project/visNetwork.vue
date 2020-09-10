<template>
    <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-table" ref="resizeBox">
      <div class="vis-network" :id="'chartTableDiv'+chartIndex" @mouseenter="caretShow=true" @mouseleave="caretShow=false">
        <loading :ref="'localLoading'+chartIndex"></loading>
        <div class="clearfix text-right" :class="{'dragTitle':dragTitleShow}" :id="'chartTitle'+chartIndex">
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
                <!--<span class="chart-title-icon"><i class="nz-icon nz-icon-caret-bottom el-icon&#45;&#45;right"  :class="{'visible':caretShow,'hidden':!caretShow}"></i></span>-->
              </span>
              <div style="height: 34px">
                <i class="nz-icon nz-icon-edit float-right "  @click="editVisNetworkChange(true)" v-show="!editVisNetwork" :title="$t('project.topology.edit')"></i>
                <i class="nz-icon nz-icon-refresh float-right"  @click="reload" v-show="!editVisNetwork" :title="$t('project.topology.refresh')"></i>
                <!--<i class="nz-icon nz-icon-zoomin float-right"></i>-->
                <!--<i class="nz-icon nz-icon-exit-full-screen float-right"></i>-->
              </div>
            </span>
        </div>
        <div class="vis-network-content">
          <!--project主要信息-->
          <div class="facade-top" v-if="!editVisNetwork">
            <div class="facade-top-left" v-loading="projectInfo.loading">
              <div class="facade-top-title">
                Project information
              </div>
              <div>
                <!--<span><span class="label">Id :</span>{{projectInfo.id}}</span>-->
                <span><span class="label">Name :</span>{{projectInfo.name}}</span>
              </div>
              <div>
                <span><span class="label">Description :</span>{{projectInfo.remark?projectInfo.remark:'--'}}</span>
              </div>
              <!--<div>-->
                <!--<span>-->
                  <!--<span class="label">Alert state :</span>-->
                  <!--<div class="active-icon" style="background: #B7464A 100%;"></div>{{projectInfo.alertStat[0]}}-->
                  <!--<div class="active-icon" style="background: #E64E4E 100%;"></div>{{projectInfo.alertStat[1]}}-->
                  <!--<div class="active-icon" style="background: #F7B500 100%;"></div>{{projectInfo.alertStat[2]}}-->
                <!--</span>-->
              <!--</div>-->
              <div>
                <span><span class="label">Module Mum :</span>{{projectInfo.moduleMum}}</span>
              </div>
            </div>
            <div class="facade-top-right" v-loading="projectInfo.loading" style="padding: 20px 20px 0 20px;height: calc(100% - 20px);">
              <div class="facade-top-title">
                <span class="label" style="padding-left: 0;">Alert :</span>
                {{total}}
              </div>
              <div class="facade-top-right-content">
                <div>
                  <div class="content-high-title">
                    {{returnSeverityLabel('high')}}
                  </div>
                  <div>
                    {{projectInfo.alertStat[0] || 0}}
                  </div>
                </div>
                <div>
                  <div class="content-medium-title">
                    {{returnSeverityLabel('medium')}}
                  </div>
                  <div>
                    {{projectInfo.alertStat[1] || 0}}
                  </div>
                </div>
                <div style="margin-bottom: 20px;">
                  <div class="content-low-title">
                    {{returnSeverityLabel('low')}}
                  </div>
                  <div>
                    {{projectInfo.alertStat[2] || 0}}
                  </div>
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
            @reload="reload"
          >
          </topology>
          <!--<other />-->
        </div>
      </div>

    </div>
  </div>
</template>

<script>
  import loading from "@/components/common/loading";
  import timePicker from '@/components/common/timePicker';
  import topology from './topology'
  // import other from './other'
  export default {
    name: 'visNetwork',
    components: {
      'loading': loading,
      'time-picker':timePicker,
      'topology':topology,
      // other
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
          this.total=this.projectInfo.alertStat[0]+this.projectInfo.alertStat[1]+this.projectInfo.alertStat[2];
          if(!this.total){
            this.total=0;
          }
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
        nodesArrayOther:[],
        edgesArray:[],
        edgesArrayOther:[],
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
        this.editVisNetwork=false;
        this.$get('/project/topo',{projectId:n.id}).then(res=>{
          if(res.data.topo&&res.data.topo.nodes&&res.data.topo.nodes.length>0){
            this.nodesArray=[];
            this.edgesArray=[];
            this.nodesArrayOther=this.formatNodesArr(res.data.topo.nodes);
            this.edgesArrayOther=this.formatEdgesArr(res.data.topo.lines);
          }else{
            this.nodesArray=[];
            this.edgesArray=[];
            setTimeout(()=>{
              this.topologyLoading=false;
              this.$refs['topology'].setData();
            },500)
          }
          this.$refs['topology'].viewsCenter=res.data.topo.viewsCenter?res.data.topo.viewsCenter:{x:0,y:0};
          this.$refs['topology'].zoom=res.data.topo.zoom?res.data.topo.zoom:1;
          this.$refs['topology'].selNodeId='';
        })
      },
      reload(){
        this.topologyLoading=true;
        this.editVisNetwork=false;
        this.$get('/project/topo',{projectId:this.projectInfo.id}).then(res=>{
          if(res.data.topo&&res.data.topo.nodes&&res.data.topo.nodes.length>0){
            this.nodesArray=[];
            this.edgesArray=[];
            this.nodesArrayOther=this.formatNodesArr(res.data.topo.nodes);
            this.edgesArrayOther=this.formatEdgesArr(res.data.topo.lines);
          }else{
            this.nodesArray=[];
            this.edgesArray=[];
            setTimeout(()=>{
              this.topologyLoading=false;
              this.$refs['topology'].setData();
            },500)
          }
          this.$refs['topology'].viewsCenter=res.data.topo.viewsCenter?res.data.topo.viewsCenter:{x:0,y:0};
          this.$refs['topology'].zoom=res.data.topo.zoom?res.data.topo.zoom:1;
          this.$refs['topology'].selNodeId='';
        })
      },
      formatNodesArr(arr){
        let arr1=[];
        if(!arr || arr.length==0){
          this.topologyLoading=false;
          return arr1
        }
        arr.forEach((item,index)=>{
          item.shape='image';
          item.id=item.moduleId;
          if(this.allModuleInfo.module){
            item.label=this.allModuleInfo.module.find(item1=>item1.id===item.id).name;
          }
          this.dealImg(`/project/topo/icon/${item.iconId}`).then((data)=>{
            item.image=data;
            if(index===arr.length-1){
              setTimeout(()=>{
                this.nodesArray=[...this.nodesArrayOther];
                this.edgesArray=[...this.edgesArrayOther];
                setTimeout(()=>{
                  this.topologyLoading=false;
                  this.$refs['topology'].setData();
                },500)
              })
            }
          })
        });
        return arr
      },
      formatEdgesArr(arr){
        let arr1=[];
        if(!arr){return arr1}
        arr.forEach((item,index)=>{
          item.from=item.source;
          item.to=item.target;
          item.label=item.name;
          // item.dashes=(item.dashes?(new Array(100).fill(item.dashes[0])):item.dashes);
          // if(index%2==0&&item.dashes){
          //   item.dataFlow='left';
          //   item.dashes[0]=0;
          //   item.dashes[1]=0;
          // } else if(index%2==1&&item.dashes){
          //   item.dataFlow='right'
          // }
        });
        return arr
      },
      dealImg(url) {
        // 处理后端传过来的图片流乱码问题
        if (url) {
          return new Promise((resolve,reject)=>{
            this.$axios
              .get(url, {
                responseType: "arraybuffer"
              })
              .then(res => {
                return ("data:image/jpeg;base64," +btoa(new Uint8Array(res.data).reduce((data, byte) => data + String.fromCharCode(byte), "")));
              })
              .then(data => {
                resolve(data)
              })
              .catch(err => {
              });
          })
        }
      },
      // Severity Label
      returnSeverityLabel(key){
        return this.$CONSTANTS.alertMessage.severityData.find(s => {return s.value == key}).label
      },
      editVisNetworkChange(flag){
        this.editVisNetwork=flag;
        if(flag){
          this.$refs.topology.popDataShowUpdate('',true);
        }
        if(!flag){
          // this.reload();
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
    margin-right: 12px;
    margin-top: 10px;
  }
  .vis-network .nz-icon-refresh{
    margin-right: 12px;
    margin-top: 10px;
    color: #ee9d3f;
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
    width: 5%;
    min-width: 100px;
  }
  .facade-top-right-content{
    display: flex;
    justify-content: space-around;
    justify-items: center;
    flex-direction: column;
    height: calc(100% - 30px);
    align-items:flex-start;
  }
  .facade-top-right-content > div{
    width: 80px;
    height: 22px;
    display: flex;
    justify-content: space-between;
    color: #fff;
    text-align: center;
    margin-bottom: 5px;
  }
  .facade-top-right-content > div > div:last-child{
    text-align: center;
    border-radius: 0 4px 4px 0;
    flex: 1;
    height: calc(100% - 2px);
  }
  .content-high-title{
    background: #F2866E;
    border-radius: 4px 0 0 4px;
    width: 44px;
    height: 100%;
  }
  .content-high-title + div{
    border: 1px solid #F4907A;
    font-size: 12px;
    color: #F4907A;
  }

  .content-medium-title{
    background: #F89984;
    border-radius: 4px 0 0 4px;
    width: 54px;
    height: 100%;
  }
  .content-medium-title + div{
    border: 1px solid #F9A28F;
    font-size: 12px;
    color: #F9A28F;
  }

  .content-low-title{
    background: #F7BA78;
    border-radius: 4px 0 0 4px;
    width: 44px;
    height: 100%;
  }
  .content-low-title + div{
    border: 1px solid #F7BA78;
    font-size: 12px;
    color: #F7BA78;
  }


  .right-content-high{
    border: 1px solid ;
  }
  .align--center{
    text-align: center;
  }
  .label{
    padding: 0 15px;
  }

</style>
