<style>
  @import "./L5/css/iconfont.css";
  @import "./L5/css/props.css";
</style>
<template>
  <div class="project-box" v-loading="topologyLoading">
    <div class="project-title" v-if="showTopTools&&!fromOverView">
      <div v-show="editTopologyFlag" class="edit-topologyLine">
        <!--工具栏-->
        <span class="project-topology-tool">
          <el-dropdown trigger="click" size="small" placement="bottom-start">
            <span class="el-dropdown-title"><i class="iconfont icon-cube"></i> <i
              class="nz-icon nz-icon-arrow-down"></i></span>
            <el-dropdown-menu slot="dropdown" @click="dropdownClick">
              <div style="height: 450px">
                <el-card shadow="hover" style="height:420px;width:284px;overflow-y: auto"
                         class="project-topology-add-node">
                <!--<div class="drag-header">——</div>-->
                <el-collapse v-model="activeNames" v-for="(item, index) in tools" :key="index">
                  <el-collapse-item :title="item.group" :name="item.group">
                    <div v-for="(btn, i) in item.children" :key="'info2'+'-'+index+'-'+i" class="buttons">
                      <a
                        :key="i"
                        :title="btn.data.text"
                        :draggable="btn.data"
                        @dragstart.stop="onDrag($event, btn)"
                        @mousedown="dragFlag=false"
                        @mouseup="dragFlagChange(btn)"
                        class="btn"
                      >
                        <img :src="btn.data.image" v-if="btn.data.image">
                        <i v-else :class="`iconfont ${btn.icon}`"></i>
                      </a>
                      <span v-if="item.group==='自定义图片'" class="delIcon" @click="delImg(btn)">x</span>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </el-card>
                <el-upload
                  class="avatar-uploader"
                  action=" "
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload"
                  :auto-upload="true"
                  list-type="picture-card"
                  style="width: 284px;height: 30px"
                >
                  <i class="el-icon-plus"></i>
                  <span>
                     Upload custom picture
                  </span>
                </el-upload>
              </div>
            </el-dropdown-menu>
          </el-dropdown>

          <div class="flex middle special-select mb10"
               style="width: 75px;height: 28px;display: inline-block;margin: 0 40px 0 20px;background: #fff">
            <div class="full pr10">
              <el-select v-model="lineName" placeholder="请选择" size="small"
                         :popper-append-to-body="false"
                         @change="changeTopologyOpt(lineName,'lineName')">
               <div slot="prefix">
                <div class="icon-item">
                  <svg>
                    <g fill="none" stroke="black" stroke-width="1">
                      <path
                        :d="penLineType.find((item,i)=>item.name==lineName).d"
                      >
                      </path>
                    </g>
                  </svg>
                </div>
              </div>
                <el-option v-for="(item,index) in penLineType" :value="item.name" :key="index">
                  <div class="icon-item">
                    <svg>
                    <g fill="none" :stroke="(lineName==item.name)?'#ee9d3f':'black'" stroke-width="1">
                    <path :d="item.d" :stroke-dasharray="item['stroke-dasharray']"></path>
                    </g>
                    </svg>
                  </div>
                </el-option>
              </el-select>
            </div>
          </div>


          <topology-top-tool
            v-if="editTopologyFlag"
            :selection.sync="props"
            @del="delPen"
            :index="topologyIndex"
            ref="topTool"
            @toolShowChange="toolShowChange"
            :cachesIndex="cachesIndex"
            :toolShow="toolShow">
          </topology-top-tool>

        </span>
        <span class="float-right">
          <button @click="previewTopology" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new"
                  v-has="'project_topo_save'" :disabled="prevent_opt.save"
                  :class="{'nz-btn-disabled':prevent_opt.save}">
             {{$t('project.topology.preview')}}
           </button>
           <button @click="saveTopology" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new"
                   v-has="'project_topo_save'" :disabled="prevent_opt.save"
                   :class="{'nz-btn-disabled':prevent_opt.save}">
             {{$t('project.topology.save')}}
           </button>
           <button @click="cancelTopology" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new">
             {{$t('project.topology.cancel')}}
           </button>
         </span>
      </div>
      <span class="edit-topologyLine float-right" style="padding-top: 5px" v-show="!editTopologyFlag">
        <button @click="editTopology" class="nz-btn nz-btn-size-normal nz-btn-style-light float-right pickTime"
                style="border-right: 1px solid rgba(162,162,162,0.50);margin-right: 12px" type="button"
        >
                  <i class="nz-icon nz-icon-edit" :title="$t('project.topology.edit')"></i>
        </button>
                <pick-time v-show="!editTopologyFlag" :showTimePicker="false" class="float-right pickTime"
                           :refresh-data-func="refreshTopology" v-model="searchTime" :use-chart-unit="false"
                           ref="pickTime"></pick-time>
      </span>
    </div>
    <div class="page">
      <!--画布部分-->
      <div :id="'topology-canvas' + topologyIndexF" class="full" :ref="'topology-canvas'+ topologyIndexF"></div>
      <!--设置属性-->
      <div class="props" v-if="editTopologyFlag&&toolShow.attr">
        <CanvasProps :selection.sync="props"
                     @change="onUpdateProps"
                     @animate="animateCanvas"
                     :index="topologyIndex"
                     @del="delPen"
                     :modules="modules"
                     ref="CanvasProps">
        </CanvasProps>
      </div>
      <!--所有节点上的小图标-->
      <div v-for="(item,index) in nodesArr"
           :style="{position: 'absolute',top:item.rect.y - 48+'px',left:item.rect.center.x - 24 +'px'}"
           v-if="!editTopologyFlag"
           class="network-pop"
      >

        <i
          :class="{'nz-icon':true, 'nz-icon-shuidi':true,'model-error':item.data.error&&!item.data.show,'model-error-active':item.data.error&&item.data.show}"
          :ref="'modelTopId'+index"
          @click="showNodeTools(index)"
        >
          <i class="nz-icon nz-icon-model"></i>
        </i>
        <!--'selpop':selpopIs(item),'no-selPop':!selpopIs(item),'error-model-stat':modelPopError(item)  @click="popClick(item.id)"-->
        <div v-for="item1 in popData">
          <transition name="scaleTool">
            <i v-if="item.data.show"
               :class="{'nz-icon':true,'nz-icon-hexagonBorder':true}"
               :style="{top:item1.top,left:item1.left}"
               :title="item1.title"
               @click="nodeTools(item,item1)"
            >
              <i class="nz-icon nz-icon-liubianxing"></i>
              <i :class="[item1.className,{'nz-icon':item1.className},'noMove']"></i>
            </i>
          </transition>
        </div>
      </div>
      <!--节点连线相关的 tooltip-->
      <div :style="{position:'absolute',top:tooltipPosition.top+'px',left:tooltipPosition.left+'px'}"
           v-if="tooltipPosition.show&&!editTopologyFlag"
           @mouseover="tooltipOver"
           @mouseout="tooltipOut">
        <topoTooltip :chartDataParent="chartData" :filterTime="filterTime"/>
      </div>
    </div>
    <!--<div class="left-bottom" v-if="editTopologyFlag">-->
    <!--<div class="title">小提示</div>-->
    <!--<ul class="group">-->
    <!--<li>编辑时：</li>-->
    <!--<li>1.Ctrl + 鼠标移动：移动整个画布</li>-->
    <!--<li>2.Ctrl + 鼠标滚轮：缩放</li>-->
    <!--<li>3.选中元素 按下Delete键或者Backspace可以删除元素</li>-->
    <!--</ul>-->
    <!--</div>-->
    <!--悬浮network部分-->
    <div class="network-info">
      <div v-if="popDataShow.main">
        <popDataMain :moduleId="moduleId" :projectId="projectInfo.id"></popDataMain>
      </div>
      <div v-if="popDataShow.total">
        <total-chart :moduleId="moduleId" :projectId="projectInfo.id" :nodesArray="totalArray"></total-chart>
      </div>
      <div v-if="popDataShow.info">
        <popDataInfo :moduleId="moduleId" :projectId="projectInfo.id"></popDataInfo>
      </div>
    </div>
    <!--endpoint-->
    <transition name="right-box">
      <endpointTable v-if="popDataShow.endpoint" :moduleId="moduleId" :projectId="projectInfo.id"
                     @close="popDataShowUpdate('',true)">endpoint
      </endpointTable>
    </transition>
    <!--asset-->
    <transition name="right-box">
      <assetTable v-if="popDataShow.asset" :moduleId="moduleId" :projectId="projectInfo.id"
                  @close="popDataShowUpdate('',true)">alert
      </assetTable>
    </transition>
    <!--alert-->
    <transition name="right-box">
      <alertTable v-if="popDataShow.alert" :moduleId="moduleId" :projectId="projectInfo.id"
                  @close="popDataShowUpdate('',true)">alert
      </alertTable>
    </transition>
  </div>
</template>

<script>
  import {Topology,Node,Line,registerNode} from '@topology/core';
  import * as FileSaver from 'file-saver';
  import {
    Tools,
    canvasRegister,
    imageTemp,
    myShape,
    myAnchors,
    myIconRect,
    myTextRect,
    onChangeAnimate,
    onChangeAnimateLine,
    changeImage,
    myCubec,
    myCubeAnchors
  } from './L5/services/canvas.js';
  // 注册到画布
  registerNode('rectangleImg',myShape,myAnchors,myIconRect,myTextRect);
  registerNode('myCube',myCubec,myCubeAnchors,null,null);
  import {getTopology,setTopology} from "../js/common";
  import CanvasProps from './L5/CanvasProps';
  import CanvasContextMenu from './L5//CanvasContextMenu';
  import topologyTopTool from './L5//topologyTopTool';
  import VueDraggableResizable from 'vue-draggable-resizable';//api https://github.com/mauricius/vue-draggable-resizable
  import 'vue-draggable-resizable/dist/VueDraggableResizable.css'
  import popDataMain from './popData/Main'
  import popDataInfo from './popData/Info'
  import TotalChart from "./popData/totalChart";
  import alertTable from "./popData/alertTable";
  import assetTable from "./popData/assetTable";
  import endpointTable from "./popData/endpointTable";
  import ExpressionInfo from "./popData/expressionInfo";
  import topoTooltip from "./L5/topoTooltip";
  import {getMetricTypeValue} from '../js/tools'
  import bus from "../../../libs/bus";
  import axios from 'axios';

  const canvasOptions={
    rotateCursor:'/img/rotate.cur',
    translateKey:'None',
    disableEmptyLine:true,
    autoExpandDistance:0,
  };
  let canvas;
  export default {
    data(){
      return {
        imgInit:false,//判断图片是否加载完成
        toolGroup:'基本形状',
        editFlag:true,
        tools:Tools,
        props:{},
        topologyLoading:false,
        contextmenu:{
          left:null,
          top:null,
          bottom:null
        },
        filterTime:[
          bus.timeFormate(bus.getOffsetTimezoneData(-1),'yyyy-MM-dd hh:mm:ss'),
          bus.timeFormate(bus.getOffsetTimezoneData(),'yyyy-MM-dd hh:mm:ss')
        ],
        saveData:{},
        dataLength:0,
        editTopologyFlag:false,
        searchTime:{},
        activeNames:[],
        topologyIndex:0,
        iconArray:[],
        imgageLoading:false,
        toolShow:{
          node:true,
          attr:true,
          nodeCord:[0,0],
          attrCord:[0,0],
          height:500,
        },
        dragFlag:true,
        modules:[],
        allModules:[],
        projectInfo:{
          title:'',
          id:'',
          remark:'',
          alertStat:[1,2,3],
          moduleMum:6,
          loading:true,
        },
        timer:null,//处理project短时间呢频繁变更的定时器
        timer2:null,//处理平移画布显示iconState的定时器
        timer3:null,//处理tooltip的显示定时器
        nodesArr:[],
        popData:[
          {
            top:'-40px',
            left:'-21px',
            className:'nz-icon-endpoint',
            id:'endpoint',
            title:this.$t('project.topology.endpoint')
          },
          {top:'-40px',left:'19px',className:'nz-icon-asset',id:'asset',title:this.$t('project.topology.asset')},
          {top:'-4px',left:'40px',className:'nz-icon-chart',id:'total',title:this.$t('project.topology.total')},
          {top:'30px',left:'19px',className:'',id:'other',title:''},
          {top:'30px',left:'-21px',className:'nz-icon-info-normal',id:'info',title:this.$t('project.topology.info')},
          {top:'-4px',left:'-40px',className:'nz-icon-gaojing',id:'alert',title:this.$t('project.topology.alert')},
        ],
        popDataShow:{
          endpoint:false,
          asset:false,
          total:false,
          other:false,
          info:false,
          alert:false,
          main:false,
        },
        moduleId:'',
        tooltipPosition:{
          top:0,
          left:0,
          show:false,
        },
        chartData:{},
        chartGetData:[],
        penLineType:[
          {d:'M5 19 a50,100 0 0,1 40,0',"stroke-dasharray":"",name:'curve'},
          {d:'M5 8 l20 0 l0 12 l20 0',"stroke-dasharray":"",name:'polyline'},
          {d:'M5 14 l40 0',"stroke-dasharray":"",name:'line'},
          // {d:'M5 20 C0,8 50,0 85,0',"stroke-dasharray":"",name:'mind'},
        ],
        lineName:'curve',
        cachesIndex:0,
      };
    },
    components:{
      CanvasProps,
      CanvasContextMenu,
      topologyTopTool,
      VueDraggableResizable,
      popDataMain,
      popDataInfo,
      TotalChart,
      alertTable,
      assetTable,
      endpointTable,
      ExpressionInfo,
      topoTooltip,
    },
    computed:{},
    props:{
      topologyIndexF:{
        type:Number,
        default:0,
      },
      obj:{},
      showTopTools:{
        type:Boolean,
        default:true,
      },
      fromOverView:{
        type:Boolean,
        default:false,
      }
    },
    watch:{
      topologyIndexF:{
        immediate:true,
        deep:true,
        handler(n){
          this.topologyIndex=n
        }
      },
      obj:{
        deep:true,
        immediate:true,
        handler(n){
          if(n){
            this.editTopologyFlag=false;
            this.topologyLoading=true;
            if(!this.timer){
              this.timer=setTimeout(()=>{
                this.topologyLoading=true;
                this.init();
                this.timer=null
              },300)
            }else{
              clearTimeout(this.timer);
              this.timer=setTimeout(()=>{
                this.topologyLoading=true;
                this.init();
                this.timer=null
              },300)
            }
          }
        }
      }
    },
    computed:{},
    created(){
      canvasRegister();
      if(process.client){
        document.onclick=event=>{
          this.contextmenu={
            left:null,
            top:null,
            bottom:null
          };
        };
      }
    },
    created(){
      this.addNodeInit();
    },
    mounted(){
      document.getElementById('topology-canvas'+this.topologyIndexF).addEventListener('mousemove',this.canvasMove);
      window.addEventListener('resize',this.winResize)
    },
    methods:{
      init(){
        canvasOptions.on=this.onMessage;
        this.getTopologyData().then((data)=>{
          this.openTopologyData(data).then(()=>{
            //获取对应的值 给节点 连线添加对应动画
            this.lineName=data.lineName?data.lineName:this.lineName;
            this.chartGetData=[];
            let axiosArr=[];
            let promiseArr=[];
            let self=this;
            let pensPromise=(pen, arr,index)=>{
              return new Promise(function(resolve, reject) {
                Promise.all(arr).then((res)=>{
                  self.chartGetData[index].res=self.computeData(res,pen.data.aggregation,pen);
                  self.setAnimation(pen,self.chartGetData[index].res);
                  resolve()
                });
              });
            };
            let endTime=this.filterTime[1];
            let startTime=this.filterTime[0];
            let step=bus.getStep(startTime,endTime);
            console.log(data);
            data.pens&&data.pens.forEach((item,index)=>{
              this.chartGetData.push({id:item.id,res:[]});
              let arr=item.data.expressArr.map((ele)=>{
                let query=encodeURIComponent(ele);
                if(!query){
                  return new Promise(resolve=>{
                    resolve({data:"",status:'no query'});
                  })
                }
                query+='&nullType='+'connected';
                return this.$get('/prom/api/v1/query_range?query='+query+"&start="+this.$stringTimeParseToUnix(startTime)+"&end="+this.$stringTimeParseToUnix(endTime)+'&step='+step);
              });
              axiosArr.push({item,arr});
              promiseArr.push(pensPromise(item,arr,index))
            });
            Promise.all(promiseArr).then((res)=>{
              getTopology(this.topologyIndex).open(data);
              getTopology(this.topologyIndex).lock(1);
              if(this.fromOverView){
                let flag=false;

                let position={
                  x:this.$refs['topology-canvas'+this.topologyIndexF].offsetWidth,
                  y:this.$refs['topology-canvas'+this.topologyIndexF].offsetHeight,
                }
                getTopology(this.topologyIndex).centerView(50);
                getTopology(this.topologyIndex).data.pens.forEach(item=>{
                  if(flag){
                    return
                  }
                  if(item.rect.x>position.x || item.rect.y>position.y){
                    getTopology(this.topologyIndex).fitView(50);
                    flag=true
                  }
                });
                // getTopology(this.topologyIndex).fitView();
                this.getNodesArr();
              }
            });
          })
        });
      },

      reload(){
        this.getTopologyData().then((data)=>{
          this.openTopologyData(data).then(()=>{
            //获取对应的值 给节点 连线添加对应动画
            this.lineName=data.lineName?data.lineName:this.lineName;
            this.chartGetData=[];
            let axiosArr=[];
            let promiseArr=[];
            let self=this;
            let pensPromise=(pen, arr,index)=>{
              return new Promise(function(resolve, reject) {
                Promise.all(arr).then((res)=>{
                  self.chartGetData[index].res=self.computeData(res,pen.data.aggregation,pen);
                  self.setAnimation(pen,self.chartGetData[index].res);
                  resolve()
                });
              });
            };
            let endTime=this.filterTime[1];
            let startTime=this.filterTime[0];
            let step=bus.getStep(startTime,endTime);
            console.log(data);
            data.pens&&data.pens.forEach((item,index)=>{
              this.chartGetData.push({id:item.id,res:[]});
              let arr=item.data.expressArr.map((ele)=>{
                let query=encodeURIComponent(ele);
                if(!query){
                  return new Promise(resolve=>{
                    resolve({data:"",status:'no query'});
                  })
                }
                query+='&nullType='+'connected';
                return this.$get('/prom/api/v1/query_range?query='+query+"&start="+this.$stringTimeParseToUnix(startTime)+"&end="+this.$stringTimeParseToUnix(endTime)+'&step='+step);
              });
              axiosArr.push({item,arr});
              promiseArr.push(pensPromise(item,arr,index))
            });
            Promise.all(promiseArr).then((res)=>{
              getTopology(this.topologyIndex).open(data);
              getTopology(this.topologyIndex).lock(1);
            });
          })
        });
      },
      openTopologyData(data){
        return new Promise(resolve=>{
          let canvas=new Topology('topology-canvas'+this.topologyIndexF,canvasOptions);
          canvas.open(data);
          this.topologyLoading=false;
          setTopology(this.topologyIndex,canvas);
          if(!getTopology(this.topologyIndex).data.name){
            getTopology(this.topologyIndex).data.name=this.obj.name;
          }
          getTopology(this.topologyIndex).data.projectId=this.obj.id;
          getTopology(this.topologyIndex).lock(1);

          this.getModule()//获取module
          resolve()
        })
      },
      //获取topology数据
      getTopologyData(){
        return new Promise(resolve=>{
          this.$get('/project/topo',{projectId:this.obj.id}).then(res=>{
            let data=res.data.topo;
            if(!res.data.topo || !data.pens){
              data={
                bkColor:'#FFFFFF',
                gridSize:10,
                gridColor:'#ededed',
                lineWidth:1,
                ruleColor:"#4e4e4e"
              };
              this.saveData={...data};
              resolve(data);
            }else{
              let timer=setInterval(()=>{
                if(!this.imgInit){
                  return
                }
                clearInterval(timer);
                data.pens.forEach((item=>{
                  console.log(item,this.iconArray.find(item1=>item1.id==item.imageId))
                  if(item.type===0&&item.data.imageId){
                    item.image=this.iconArray.find(item1=>item1.id==item.data.imageId).image
                  }
                }))
                this.saveData={...data};
                resolve(data);
              },100)
            }
          })
        });
      },
      //赋值动画
      setAnimation(pen,res){// 根据所有res的状态 赋值动画
        let maxLevel=0;
        if(res.length>0){
          res.forEach((response,innerPos)=>{
            if(response.status!=='success'){
             return
            }
            if (response.data.result) {
              response.data.result.forEach((queryItem, resIndex) => {
                pen.data.valueMapping.forEach((item,index)=>{
                  if(item.value==='base'){return}
                  if( queryItem.showValue >item.value){
                    queryItem.level=item.level;
                    if(maxLevel<item.level){
                      maxLevel=item.level
                    }
                  }
                })
              })
            }
          })
        }
        
        console.log(maxLevel)
        
        if(maxLevel!==0){
          if(pen.type===0){// 判断valueMapping 给相应的状态
            let selLevel=pen.data.valueMapping.find(item=>item.level===maxLevel);
            pen.font.color=selLevel.color.text;
            pen.fillStyle=selLevel.color.fill;
            pen.strokeStyle=selLevel.color.line;
            onChangeAnimate(pen,selLevel.animateType,selLevel.color.fill,selLevel.color.line);
          }else if(pen.type===1){// 判断valueMapping 给相应的状态
            let selLevel=pen.data.valueMapping.find(item=>item.level===maxLevel);

            pen.animateColor=selLevel.color.fill;
            pen.strokeStyle=selLevel.color.line;
            pen.animateType=selLevel.animateType;
            pen.font.color=selLevel.color.text;
            onChangeAnimateLine(pen,pen.animateType);
          }
        } else {
          if(pen.type===0&&pen.animatePlay){// 判断valueMapping 给相应的状态
            onChangeAnimate(pen,pen.animateType);
          }else if(pen.type===1&&pen.animatePlay){// 判断valueMapping 给相应的状态
            console.log(123123123);
            onChangeAnimateLine(pen,pen.animateType);
          }
        }
      },
      computeData(res,type,pen){//处理别名 以及 根据type显示对应的值
        if(res.length>0){
          res.forEach((response,innerPos)=>{
            if(response.status!=='success'){
              return
            }

            if (response.data.result) {
              response.data.result.forEach((queryItem, resIndex) => {
                // 图表中每条线的名字,后半部分
                let host = '';//up,
                if (queryItem.metric.__name__) {
                  host = `${queryItem.metric.__name__}{`;//up,
                }
                const tagsArr = Object.keys(queryItem.metric);//["__name__","asset","idc","instance","job","module","project"]
                // 设置时间-数据格式对
                let tempArr = [];
                let dpsArr = [];
                tempArr = queryItem.values;
                dpsArr = Object.entries(queryItem.values);//[ ["0",[1577959830.781,"0"]], ["1",[1577959845.781,"0"]] ]
                dpsArr = dpsArr.map(item => {
                  return [item[0], [item[1][0], Number(item[1][1])]]
                });
                // 判断是否有数据, && tagsArr.length > 0
                if (dpsArr.length) {
                  tagsArr.forEach((tag, i) => {
                    if (tag !== '__name__') {
                      host += `${tag}="${queryItem.metric[tag]}",`;
                    }
                  });
                  if (host.endsWith(',')) {
                    host = host.substr(0, host.length - 1);
                  }
                  if (queryItem.metric.__name__) {
                    host += "}";
                  }
                  if (!host || host === '') {
                    host = pen.data.expressArr[innerPos];
                  }
                  //处理legend别名
                  let alias = this.dealLegendAlias(host, pen.data.legends[innerPos]);
                  if (!alias || alias === '') {
                    alias = host;
                  }
                  queryItem.legend={name: host+"-"+pen.data.legends[innerPos]+"-" + resIndex, alias: alias};
                  queryItem.showValue= getMetricTypeValue(queryItem.values,type);
                  // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c
                }
              });
            }

          })
        }
        return res
      },
      dealLegendAlias:function(legend,expression){
        if(/\{\{.+\}\}/.test(expression)){
          let labelValue=expression.replace(/(\{\{.+?\}\})/g,function(i){
            let label=i.substr(i.indexOf('{{')+2,i.indexOf('}}')-i.indexOf('{{')-2);
            let reg=new RegExp(label+'=".+?"');
            let value=null;
            if(reg.test(legend)){
              let find=legend.match(reg)[0];
              value=find.substr(find.indexOf('"')+1,find.lastIndexOf('"')-find.indexOf('"')-1);
            }
            return value?value:label;
          });
          return labelValue
        }else{
          return expression;
        }
      },
      //获取module
      getModule(){
        this.projectInfo.loading=true;
        this.$get('project/info',{id:this.obj.id}).then(response=>{
          if(response.code===200){
            this.projectInfo.loading=false;
            this.projectInfo={...this.projectInfo,...response.data.basic,moduleMum:response.data.module.length};
            this.allModules=response.data.module;
            this.modulesDiff()
          }
        });
      },

      getNodesArr(){
        this.nodesArr=getTopology(this.topologyIndex).data.pens.filter(item=>{
          if(!item.data){
            item.data={
              moduleId:'',
              moduleName:'',
              show:false,
              error:false,
              expressArr:[],
            }
          }
          return item.type===0
        });
        // this.nodesArr=this.nodesArr.map(item=>{
        //   if(!item.data){
        //     item.data={
        //       moduleId:'',
        //       moduleName:'',
        //       show:false,
        //       error:false,
        //       expressArr:[],
        //     }
        //   }
        //   return {
        //     rect:item.rect,
        //     data:item.data
        //   }
        // });
        //打开动画 是否更新顶部图标
        this.nodesArr=JSON.parse(JSON.stringify(this.nodesArr));
      },

      modelTopClick(item,index){

      },
      //摘除已选择的module
      modulesDiff(data){
        this.modules=this.allModules;
        if(getTopology(this.topologyIndex).data.pens){
          getTopology(this.topologyIndex).data.pens.forEach(item=>{
            if(item.type==0){
              this.modules=this.modules.filter(item1=>item.data.moduleId!==item1.id)
            }
          })
        }
        if(data&&data.data&&data.data.moduleId){
          this.modules.unshift({id:data.data.moduleId,name:data.data.moduleName});
        }
      },

      //显示module的工具
      showNodeTools(index){
        this.nodesArr.forEach((item,i)=>{
          item.data.show=i===index;
        })
      },

      //具体内容点击
      nodeTools(node,tool){
        this.moduleId=node.data.moduleId;
        setTimeout(()=>{
          this.popDataShowUpdate(tool.id)
        },100)
      },

      popDataShowUpdate(key,flag){//key 显示对应的弹窗 flag是否不显示工具栏
        this.popDataShow={
          endpoint:false,
          asset:false,
          total:false,
          other:false,
          info:false,
          alert:false,
          main:false,
        };
        this.$nextTick(()=>{
          this.popDataShow[key]=true;
        });
        if(flag){ // 处理关闭后 缩放后显示工具按钮的问题
          this.moduleId='';
          this.showNodeTools('');
        }
        if(key==='asset'||key==='alert'||key==='endpoint'){
          this.showNodeTools('');
        }
      },

      /*topology 方法*/
      onDrag(event,node){
        this.dragFlag=false;
        setTimeout(()=>{
          this.dragFlag=true;
        },100);
        event.dataTransfer.setData('Text',JSON.stringify({...node.data,data:{imageId:node.data.imageId}}));
      },
      dragFlagChange(node){
        getTopology(this.topologyIndex).addNode(
          {
            ...node.data,
            rect:{
              ...node.data.rect,
              x:this.$refs['topology-canvas'+this.topologyIndexF].offsetWidth/2-50,
              y:this.$refs['topology-canvas'+this.topologyIndexF].offsetHeight/2-50
            },
            data:{imageId:node.data.imageId}
          });
        setTimeout(()=>{
          this.dragFlag=true;
        },100);
      },

      onMessage(event,data,e){
        console.log('onMessage',event,data);
        // console.log(getTopology(this.topologyIndex))
        if(getTopology(this.topologyIndex)){
          this.cachesIndex=getTopology(this.topologyIndex).caches.index;
          if(this.$refs.topTool){
            this.$refs.topTool.redoFlag=false
          }
          ;
        }
        if(!Array.isArray(data)&&data){//判断不是数组 提前个data配置好节点属性
          if(data.type===0&& !data.data.moduleId){
            data.data={
              ...data.data,
              moduleId:'',
              moduleName:'',
              show:false,
              error:false,
              animatePlay:data.animatePlay,
              fillStyle:data.fillStyle,
              strokeStyle:data.strokeStyle,
              lineWidth:this.nodeDefaultWidth(data.name),
              iconToolState:true,
              //chart 配置项
              valueMapping:[{
                color:{
                  line:'#000000',
                  fill:'#ffffff',
                  text:'#000000',
                },
                value:'base',
                animateType:'base',
                level:0,
                base:true,
              }],
              expressArr:[],
              legends:[],
              tooltipShow:true,
              panelName:'topologyName',
              unit:2,
              type:'line',
              displayChart:true,
              aggregation:'last',
              title:'',
              url:'',
            }
          }else if(data.type==1&& !data.data){
            //连线是否自动计算锚点
            // data.manualCps=true;
            data.data={
              animatePlay:data.animatePlay,
              strokeStyle:data.strokeStyle,
              animateColor:data.animateColor,
              arrowColor:data.arrowColor,
              fromArrowColor:data.fromArrowColor,
              toArrowColor:data.toArrowColor,
              lineWidth:1,
              //chart 配置项
              valueMapping:[{
                color:{
                  border:'#000000',
                  bac:'#ffffff',
                  text:'#000000',
                },
                value:'base',
                animateType:'base',
                level:0,
                base:true,
              }],
              expressArr:[],
              legends:[],
              tooltipShow:true,
              panelName:'topologyName',
              unit:2,
              type:'line',
              displayChart:true,
              aggregation:'last',
              title:'',
              moduleName:'',
              url:'',
            }
          }
          if(data.type===0||data.type===1){
            data.lineWidth=data.data.lineWidth;
          }
        }
        switch(event){
          case 'moveInNode':
          case 'moveInLine':
            if(this.timer3){
              clearTimeout(this.timer3);
              this.timer3=null
            }
            this.chartData={...data.data,...this.chartGetData.find(item=>item.id===data.id)};
            this.tooltipPosition.show=false;
            setTimeout(()=>{
              this.tooltipPosition.show=true;
            },50);
            break;
          case 'moveOutNode':
          case 'moveOutLine':
            // this.tooltipPosition.show=false;
            // return
            if(!this.timer3){
              this.timer3=setTimeout(()=>{
                this.tooltipPosition.show=false;
                this.timer3=null
              },150)
            }else{
              clearTimeout(this.timer3);
              this.timer3=setTimeout(()=>{
                this.tooltipPosition.show=false;
                this.timer3=null
              },150)
            }
            break;
        }
        // 右侧输入框编辑状态时点击编辑区域其他元素，onMessage执行后才执行onUpdateProps方法，通过setTimeout让onUpdateProps先执行
        setTimeout(()=>{
          switch(event){
            case 'node':
            case 'addNode':
              this.modulesDiff(data);
              if(data.data.expressArr.length===0){
                data.data.expressArr.push('');
                data.data.legends.push('');
              }
              this.props={
                node:data,
                line:null,
                multi:false,
                expand:this.props.expand,
                nodes:null,
                locked:data.locked,
                pen:data,
                pens:null,
              };
              this.$nextTick(()=>{
                if(this.$refs.CanvasProps){
                  this.$refs.CanvasProps.tab='1';
                }
              });
              break;
            case 'line':
            case 'addLine':
              this.props={
                node:null,
                line:data,
                multi:false,
                nodes:null,
                locked:data.locked,
                pen:data,
                pens:null,
              };
              if(data.data.expressArr.length===0){
                data.data.expressArr.push('');
                data.data.legends.push('');
              }
              this.$nextTick(()=>{
                if(this.$refs.CanvasProps){
                  this.$refs.CanvasProps.tab='1';
                }
              });
              break;
            case 'multi':
              this.props={
                node:null,
                line:null,
                multi:true,
                nodes:data.length>1?data:null,
                locked:this.getLocked({nodes:data}),
                pen:null,
                pens:data.length>1?data:null,
              };
              break;
            case 'space':
              this.props={
                node:null,
                line:null,
                multi:false,
                nodes:null,
                locked:false,
                pen:null,
                pens:null,
              };
              break;
            case 'moveOut':
              break;
            case 'moveNodes':
            case 'resizeNodes':
              if(data.length>1){
                this.props={
                  node:null,
                  line:null,
                  multi:true,
                  nodes:data,
                  locked:this.getLocked({nodes:data}),
                  pen:null,
                  pens:null,
                };
              }else{
                this.props={
                  node:data[0],
                  line:null,
                  multi:false,
                  nodes:null,
                  locked:false,
                  pen:data[0],
                  pens:null,
                };
              }
              break;
            case 'resize':
              let domRect=document.getElementById('topology-canvas'+this.topologyIndexF).getBoundingClientRect();
              this.toolShow.attrCord=[domRect.width-350,0];
              this.toolShow.height=domRect.height;
              getTopology(this.topologyIndex).canvasPos=domRect;
              break;
            case 'scale':
              if(this.$refs.topTool){
                this.$refs.topTool.option.scale=data;
              }
              break;
            case 'locked':
              this.props={
                node:null,
                line:null,
                multi:false,
                nodes:null,
                locked:false,
                pen:null,
                pens:null,
              };
              break;
            case "delete":
              this.props={
                node:null,
                line:null,
                multi:false,
                nodes:null,
                locked:false,
                pen:null,
                pens:null,
              };
              break
          }
          switch(event){
            case 'node':
            case 'line':
            case 'space':
            case 'scale':
              this.moduleId='';
              this.showNodeTools('');
              break;
          }
          switch(event){
            case 'space':
            case 'scale':
            case 'translate':
              if(!this.timer2){
                this.timer2=setTimeout(()=>{
                  this.getNodesArr();
                  this.timer2=null
                },300)
              }else{
                clearTimeout(this.timer2);
                this.timer2=setTimeout(()=>{
                  this.getNodesArr();
                  this.timer2=null
                },300)
              }
              break;
          }
        },0);
      },

      getLocked(data){
        let locked=true;
        if(data.nodes&&data.nodes.length){
          for(const item of data.nodes){
            if(!item.locked){
              locked=false;
              break;
            }
          }
        }
        if(locked&&data.lines){
          for(const item of data.lines){
            if(!item.locked){
              locked=false;
              break;
            }
          }
        }

        return locked;
      },

      onUpdateProps(node){
        // 如果是node属性改变，需要传入node，重新计算node相关属性值
        // 如果是line属性改变，无需传参
        getTopology(this.topologyIndex).updateProps(node);
      },

      handleAvatarSuccess(){

      },
      beforeAvatarUpload(file){
        let this_=this
        let isJPG=(file.type==='image/jpeg'||file.type==='image/png');

        const isLt2M=file.size/1024/1024<2;

        if(!isJPG){
          this.$message.error(this_.$t('project.topology.imgFormat'));
          return false;
        }
        // if (!isLt2M) {
        //   this.$message.error( this_.$t('project.topology.imgSize'));
        //   return false;
        // }
        const isSize=new Promise(function(resolve,reject){
          let width=100;
          let height=100;
          let _URL=window.URL||window.webkitURL;
          let img=new Image();
          img.onload=function(){
            let valid=img.width>width&&img.height>height;
            valid?resolve():reject();
          }
          img.src=_URL.createObjectURL(file);
        }).then(()=>{
          if(isJPG){
            this.file=file;
            this.upload();
          }
          return file;
        },()=>{
          this.$message.error(this_.$t('project.topology.imgMeasure'));
          return Promise.reject();
        });
        return false;
      },

      toolShowChange(attr){
        this.toolShow[attr]= !this.toolShow[attr]
      },
      /*topology 方法*/
      end(v){
        console.log(v);
      },
      /*tools 方法*/
      upload(){
        let form=new FormData();
        form.append("file",this.file);
        let fileName=this.file.name;
        form.append("name",fileName.substring(0,fileName.lastIndexOf(".")));
        this.$post('/project/topo/icon',form,{'Content-Type':'multipart/form-data'}).then(res=>{
          if(res.code==200){
            this.$message({duration:2000,type:'success',message:this.$t("tip.saveSuccess")});
            this.dealImg(`/project/topo/icon/${res.data.id}`).then((data)=>{
              this.tools[1].children.push({
                ...imageTemp,
                data:{
                  ...imageTemp.data,
                  text:res.data.imageName,
                  image:data,
                  imageId:res.data.id,
                }
              })
            })
          }else{
            this.$message.error(res.msg);
          }
        })
      },

      delImg(item){
        this.$delete('/project/topo/icon?ids='+item.data.imageId).then(res=>{
          if(res.code==200){
            this.$message({duration:2000,type:'success',message:this.$t("tip.deleteSuccess")});
            this.addNodeInit();
          }else{
            this.$message.error(res.msg);
          }
        })
      },

      addNodeInit(){
        this.$get('/project/topo/icon').then(res=>{
          this.imgageLoading=true;
          this.tools[1].children=[];
          let promiseArr=[];
          res.data.list.forEach((item,index)=>{
            item.imageName=item.name;
            delete item.name;
            promiseArr.push( this.dealImg(`/project/topo/icon/${item.id}`));
          });
          Promise.all(promiseArr).then(res2=>{
            this.iconArray=[...res.data.list];
            this.iconArray.forEach((item,index)=>{
              this.tools[1].children.push({
                ...imageTemp,
                data:{
                  ...imageTemp.data,
                  text:item.imageName,
                  image:res2[index],
                  imageId:item.id,
                }
              })
              item.image=res2[index];
            });
            console.log(this.iconArray);
            this.imgInit=true;
          })


        })
      },

      dealImg(url){
        // 处理后端传过来的图片流乱码问题
        if(url){
          return new Promise((resolve,reject)=>{
            this.$axios
              .get(url,{
                responseType:"arraybuffer"
              })
              .then(res=>{
                return ("data:image/jpeg;base64,"+btoa(new Uint8Array(res.data).reduce((data,byte)=>data+String.fromCharCode(byte),"")));
              })
              .then(data=>{
                resolve(data);
                // changeImage(data,(img)=>{
                //   resolve(img)
                // })
              })
              .catch(err=>{
              });
          })
        }
      },

      delPen(obj){//删除元素
        getTopology(this.topologyIndex).delete(obj);
        this.props={
          node:null,
          line:null,
          multi:false,
          nodes:null,
          locked:false,
          pen:null,
          pens:null,
        };
      },

      editTopology(val){
        this.editTopologyFlag=true;
        setTimeout(()=>{
          getTopology(this.topologyIndex).lock(0);
          getTopology(this.topologyIndex).data.pens.forEach((item)=>{//停止动画 以及赋值默认data
            item.stopAnimate();
            if(item.type===0){
              item.fillStyle=item.data.fillStyle;
              item.strokeStyle=item.data.strokeStyle;
              item.animatePlay=item.data.animatePlay;
              item.font.color="#000000";
            }else if(item.type===1){
              item.animateColor=item.data.animateColor;
              item.strokeStyle=item.data.strokeStyle;
              item.arrowColor=item.data.arrowColor;
              item.fromArrowColor=item.data.fromArrowColor;
              item.toArrowColor=item.data.toArrowColor;
              item.animatePlay=item.data.animatePlay;
              item.font.color="#000000";
            }
          })
          let domRect=document.getElementById('topology-canvas'+this.topologyIndexF).getBoundingClientRect();
          this.toolShow.attrCord=[domRect.width-350,0];
          this.toolShow.height=domRect.height;
          getTopology(this.topologyIndex).canvasPos=domRect;
        })
      },

      animateCanvas(){
        getTopology(this.topologyIndex).render();
        getTopology(this.topologyIndex).animate()
      },

      refreshTopology(){
        // canvas.open()
      },

      dropdownClick(){

      },

      changeTopologyOpt(val,key){
        // this.topologyData.data[key]=this.colorRGBtoHex(val);
        // getTopology(this.index).data[key]=val;
        // getTopology(this.index).render();
        let dataOption=getTopology(this.topologyIndex).data;
        dataOption[key]=this.lineName;
        getTopology(this.topologyIndex).render();
      },
      //保存
      saveTopology(){
        let topologyData=getTopology(this.topologyIndex).pureData();
        let flag=true;
        topologyData.pens.forEach(item=>{
          if(item.type===0&&((flag&& !item.data)||(flag&&item.data&& !item.data.moduleId))){
            flag=false;
          }
        });
        if(flag){
          this.editTopologyFlag=false;
          topologyData.pens.forEach(item=>{
            if(item.type===0&&JSON.stringify(item.data.imageId)){
              item.image="";
              item.animateFrames=[];
              item.animateReady=null;
              delete  item.img;
              delete  item.lastImage;
            }
          });
          this.$put('/project/topo',{topo:JSON.stringify(topologyData),projectId:this.projectInfo.id}).then(res=>{
            this.prevent_opt.save=false;
            if(res.code===200){
              this.$message({
                message: this.$t("tip.saveSuccess"),
                type: 'success'
              });
              this.$nextTick(()=>{
                getTopology(this.topologyIndex).lock(1);
                let domRect=document.getElementById('topology-canvas'+this.topologyIndexF).getBoundingClientRect();
                this.toolShow.attrCord=[domRect.width-350,0];
                this.toolShow.height=domRect.height;
                getTopology(this.topologyIndex).canvasPos=domRect;
                this.reload();
              })
            }
          }).catch(res=>{
            this.prevent_opt.save=false;
            this.$message({
              message: res.msg,
              type: 'error'
            });
          });


        }else{
          this.$message({
            showClose:true,
            message:'请个所有节点绑定module',
            type:'warning'
          })
        }
      },
      //取消
      cancelTopology(){
        this.editTopologyFlag=false;
        this.$nextTick(()=>{
          getTopology(this.topologyIndex).lock(1);
          let domRect=document.getElementById('topology-canvas'+this.topologyIndexF).getBoundingClientRect();
          this.toolShow.attrCord=[domRect.width-350,0];
          this.toolShow.height=domRect.height;
          getTopology(this.topologyIndex).canvasPos=domRect;
        });
        this.reload();
      },
      //预览
      previewTopology(){

      },
      /*tools 方法*/

      winResize(){
        let domRect=document.getElementById('topology-canvas'+this.topologyIndexF).getBoundingClientRect();
        this.toolShow.attrCord=[domRect.width-350,0];
        this.toolShow.height=domRect.height;
        getTopology(this.topologyIndex).canvasPos=domRect;
        getTopology(this.topologyIndex).centerView();
      },
      canvasMove(e){// 画布上的移动 确定tooltip的位置
        if(this.tooltipPosition.show){
          return
        }
        this.tooltipPosition.top=e.offsetY;
        this.tooltipPosition.left=e.offsetX+20;
      },
      tooltipOver(){
        clearTimeout(this.timer3);
        this.timer3=null
      },
      tooltipOut(){
        this.timer3=setTimeout(()=>{
          this.tooltipPosition.show=false;
          this.timer3=null
        },150)
      },
      nodeDefaultWidth(nodeName){
        switch(nodeName){
          case 'myCube':
          case "rectangleImg":
            return 0;
          default:
            return 1;
        }
      }
    },
    destroyed(){
      getTopology(this.topologyIndex).destroy();
      setTopology(this.topologyIndex,null);
      if(document.getElementById('topology-canvas'+this.topologyIndexF)){
       document.getElementById('topology-canvas'+this.topologyIndexF).removeEventListener('mousemove',this.canvasMove);
      }
      window.removeEventListener('resize',this.winResize)
    }
  }
</script>
<style lang="scss">
  .el-dropdown-menu {
    .project-topology-add-node {
      .el-collapse-item__header {
        padding: 0 10px;
        background-color: #ffffff;
        height: 32px;
      }

      .el-collapse-item__header.is-active {
        background: #F6F6F6;
        ont-family: Roboto-Bold;
        font-size: 14px;
        color: #FA901C;
        font-weight: 700;

        el-collapse-item__arrow {
          color: #666;
        }
      }

      .el-collapse-item__wrap {
        padding: 0 10px;
        background-color: #ffffff;
      }

      .el-collapse-item__content {
        padding: 12px 0px;
        display: flex;
        flex-wrap: wrap;
        /*justify-content: space-around;*/
      }

      .el-card__body {
        padding: 0;
        height: 100%;
      }

      .handle {
        position: absolute;
        z-index: 2;
      }

      .buttons {
        padding: 12px;
        display: inline-block;
        position: relative;
        vertical-align: middle;
        width: 26px;

        .delIcon {
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 10px;
          font-size: 12px;
          line-height: 16px;
          text-align: center;
          background: red;
          right: -8px;
          top: -8px;
          color: #fff;
          display: none;
          cursor: pointer;
        }

        a {
          display: inline-block;
          color: #314659;
          width: 26px;
          height: 26px;
          text-align: center;
          text-decoration: none !important;
          cursor: pointer;
          line-height: 26px;

          .iconfont {
            font-size: 24px;
          }

          img {
            max-width: 26px;
            max-height: 26px;
          }

          &:hover {
            color: #1890ff;
          }
        }

        .upload-icon-box {
          .el-icon-plus {
            font-size: 14px;
            margin-bottom: 10px;
          }

          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          width: 100%;
          height: 100%;
        }
      }

      .buttons:hover {
        .delIcon {
          /*display: inline-block;*/
        }
      }
    }

    .avatar-uploader {
      line-height: 30px;

      .el-icon-plus {
        font-size: 12px;
        color: #FA901C;
        margin: 0 8px 0 15px;
      }

      .el-upload--picture-card {
        width: 100%;
        height: 100%;
        border: none;
        color: #666;
        font-size: 14px;
        line-height: 30px;
        text-align: left;
      }

      .el-upload--picture-card:hover, .el-upload:focus {
        color: #666;
      }
    }

    .avatar-uploader:active el-upload--picture-card {
      color: #DB8B8B;
    }

    .avatar-uploader:active .el-upload--picture-card:hover, .avatar-uploader:active .el-upload:focus {
      color: #DB8B8B;
    }
  }
</style>
<style scoped>
  @keyframes model-error-animation {
    0% {
      transform: scale(0.7);
    }
    50% {
      transform: scale(1);
    }
    100% {
      transform: scale(0.7);
    }
  }

  @keyframes model-icon-animation {
    0% {
      transform: scale(1.2) translateX(1px);
    }
    50% {
      transform: scale(0.9) translateX(0px);
    }
    100% {
      transform: scale(1.2) translateX(1px);
    }
  }

  .nz-icon-shuidi {
    position: absolute;
    font-size: 48px;
    color: rgba(190, 233, 222, 0.45);
    border-radius: 50%;
    height: 48px;
    width: 48px;
    line-height: 48px;
  }

  .model-error.nz-icon-shuidi {
    color: #FADED7;
    animation: model-error-animation .6s infinite ease-in-out;
    animation-direction: normal;
  }

  .model-error-active.nz-icon-shuidi {
    color: #FADED7;
  }

  .nz-icon-model {
    color: #23BF9A;
    position: absolute;
    top: -4px;
    left: 15px;
    font-size: 18px;
    line-height: 48px;
  }

  .model-error .nz-icon-model {
    color: #EC7F66;
    animation: model-icon-animation .6s infinite ease-in-out;
    animation-direction: normal;
  }

  .model-error-active .nz-icon-model {
    color: #EC7F66;
  }

  .scaleTool-enter-active {
    animation: scaleTool-in .15s;
  }

  .scaleTool-leave-active {
    animation: scaleTool-in .15s reverse;
  }

  @keyframes scaleTool-in {
    from {
      top: 0px;
      left: 0px;
      transform: scale(0.5);
    }
  }

  .network-pop .nz-icon-hexagonBorder {
    position: absolute;
    font-size: 48px;
    color: #84d5c2;
    height: 48px;
    width: 48px;
    line-height: 48px;
  }

  .network-pop .nz-icon-hexagonBorder:hover {
    transform: scale(1.1);
    color: #4BB49B;
  }

  .network-pop .nz-icon-hexagonBorder.error-model-stat {
    color: #F5BAAC;
  }

  .network-pop .nz-icon-hexagonBorder.error-model-stat:hover {
    color: #EC7F66;
  }

  .network-pop .nz-icon-liubianxing {
    color: #e2f3ef;
    font-size: 44px;
    position: absolute;
    top: 1px;
    left: 2px;
    transform: scale(0.9);
    z-index: 0;
  }

  .network-pop .error-model-stat .nz-icon-liubianxing {
    color: #FADED7;
  }

  .network-pop .nz-icon.noMove {
    position: absolute;
    left: 14px;
    font-size: 20px;
    color: #27c09c;
  }

  .network-pop .error-model-stat .nz-icon.noMove {
    color: #EC7F66;
  }

  .network-pop .no-selPop {
    color: #999;
  }

  .network-pop .no-selPop .nz-icon-liubianxing {
    color: rgb(218, 218, 218);
  }

  .network-pop .no-selPop .nz-icon-chart {
    color: #999;
  }

  .network-info {
    position: absolute;
    right: 0;
    top: 50px;
  }
</style>
<style lang="scss" scoped>
  .project-topology-tool {
    display: inline-flex;
    height: 30px;
  }

  .el-dropdown-title {
    background: #FFFFFF;
    border: 1px solid #DEDEDE;
    border-radius: 2px;
    width: 66px;
    height: 28px;
    display: inline-block;
    line-height: 28px;

    .icon-cube {
      margin-left: 15px;
    }
  }

  .project-box {
    width: 100%;
    height: 100%;
    position: relative;

    .project-title {
      height: 50px;
      padding-top: 15px;
    }

    .drag-header {
      cursor: move;
      background: #1a1a1a;
      color: #fff;
    }

    .left-bottom {
      position: absolute;
      left: 10px;
      bottom: 10px;
    }
  }

  .page {
    display: flex;
    height: calc(100% - 80px);
    width: 100%;
    position: relative;

    .tools {
      width: 300px;
      height: 100%;
      border: none;
      position: absolute;
      z-index: 1 !important;
      left: 20px;
      background-color: #f9f9f9;

      .title {
        float: left;
      }
    }

    .full {
      flex: 1;
      overflow: unset !important;
    }

    .props {
      width: 500px;
      height: 100%;
      border: none;
      position: absolute;
      z-index: 1 !important;
      right: 0;
      top: 0;
      background: #FFFFFF;
      box-shadow: inset 1px 0 0 0 rgba(0, 0, 0, 0.09);
      border-radius: 10px;
    }
  }

  .special-select svg {
    width: 75px;
    height: 30px;
  }

  .special-select .el-select.el-select--small {
    width: 100%;
  }

  .special-select /deep/ .el-select-dropdown {
    width: 75px !important;

    .el-select-dropdown__item {
      padding: 0 0 0 10px;
    }
  }

  .special-select /deep/ .el-input.el-input--prefix.el-input--suffix, .line-width /deep/ .el-input.el-input--prefix.el-input--suffix {
    border: 1px solid #DCDFE6;
    height: 28px;
  }

  .special-select /deep/ .el-input__inner, .line-width /deep/ .el-input__inner {
    display: none;
  }

  .special-select /deep/ .el-input__prefix, .line-width /deep/ .el-input__prefix {
    height: 28px;
    line-height: 28px;
    color: #899FB7;
    width: 100%;
  }

  .special-select /deep/ .el-input__prefix > div {
    width: 100%;
    height: 100%;
  }
</style>
