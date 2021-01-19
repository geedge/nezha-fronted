<template>
  <div class="content">
    <div class="edit-topology" v-if="editVisNetwork">
      <span v-show="!selectNodeTitle&&editVisNetwork" class="edit-topology-module">
        {{$t('project.topology.module')}} :
        <span class="edit-topology-add" @click="addModelShow">{{$t('project.topology.add')}}</span>
        <!--<span class="edit-topology-remove" @click="nodeDel">Remove</span>-->
      </span>
      <span v-show="!selectNodeTitle&&editVisNetwork" class="edit-topologyLine">
        {{$t('project.topology.line')}} :
        <span class="edit-topology-add" @click="addLineTitleShow">{{$t('project.topology.add')}}</span>
        <!--<span class="edit-topology-remove" @click="lineDel">Remove</span>-->
      </span>
      <span v-show="!selectNodeTitle&&editVisNetwork" class="edit-topologyLine">
        <button @click="saveTopology" class="nz-btn nz-btn-size-small-new nz-btn-style-normal-new" v-has="'project_topo_save'" :disabled="prevent_opt.save" :class="{'nz-btn-disabled':prevent_opt.save}">{{$t('project.topology.save')}}</button>
        <button @click="cancelTopology" class="nz-btn nz-btn-size-small-new nz-btn-style-light-new">{{$t('project.topology.cancel')}}</button>
      </span>
      <span class="edit-topology-line-cancel" v-show="selectNodeTitle&&editVisNetwork"> {{$t('project.topology.selTwoNode')}} <span class="edit-topologyCancel" @click="closeAddLine">{{$t('project.topology.cancel')}}</span></span>
    </div>
    <div class="edit-topology" v-else></div>
    <div class="network" ref="network"  v-clickoutside="networkPopClose" @mousedown="(e)=>{modelTopMouseDown(e)}" @mouseup="(e)=>modelTopMouseUp(e)">
      <!--拓扑图-->
      <div id="network_id" ref="visNetwork" :class="{'cursorMove': cursorMove}"></div>
      <!--空拓扑图-->
      <div class="network-null" v-if="nodesArray.length===0">
        <i class="nz-icon nz-icon-create-square" @click="addModelShow"></i>
        <img src="./image/emptyData.png" width="303px" height="184px"/>
      </div>
      <!--拓扑图工具-->
      <div
        id="network-pop"
        class="network-pop"
        :style="{transform:'scale('+zoom+')',width:'0',height:'0'}"
        ref="network-pop"
      >
        <div v-for="item in popData">
          <transition name="scaleTool">
            <i v-if="networkPopShow"
               :class="{'nz-icon':true,'nz-icon-hexagonBorder':true,'selpop':selpopIs(item),'no-selPop':!selpopIs(item),'error-model-stat':modelPopError(item)}"
               :style="{top:item.top,left:item.left}"
               @click="popClick(item.id)"
               :title="item.title"
            >
              <i class="nz-icon nz-icon-liubianxing"></i>
              <i :class="[item.className,{'nz-icon':item.className},'noMove']"></i>
            </i>
          </transition>
        </div>
        <!--<i class="nz-icon nz-icon-delete" @click="nodeDel"></i>-->
      </div>
      <!--拓扑图选中-->
      <div class="sel-node" id="nodeArr1" v-show="NodeArr[0]&&NodeArrShow" :style="{transform:'scale('+zoom+')'}">
        <div class="sel-node-top"></div>
        <div class="sel-node-right"></div>
        <div class="sel-node-bottom"></div>
        <div class="sel-node-left"></div>
      </div>
      <div class="sel-node" id="nodeArr2" v-show="NodeArr[1]&&NodeArrShow" :style="{transform:'scale('+zoom+')'}">
        <div class="sel-node-top"></div>
        <div class="sel-node-right"></div>
        <div class="sel-node-bottom"></div>
        <div class="sel-node-left"></div>
      </div>
      <!--图谱图右侧-->
      <!--<div class="networkContent">33333</div>-->
      <!--model上的图标-->
      <div :style="{top:(item.y- 80 + 80*(1-zoom))+'px',left:(item.x- 26 + 26*(1-zoom))+'px',transform:'scale('+zoom+')',position:'absolute'}"
           v-for="(item,indexj) in modelTop"
      >
        <i :class="{'nz-icon':true, 'nz-icon-shuidi':true,'model-error':item.error&&(indexj!==activeIndex),'model-error-active':item.error&&indexj===activeIndex}"
           v-show="item.show"
           :ref="'modelTopId'+indexj"
           @click="modelTopClick(item,indexj)"
        >
          <!--@mousedown="(e)=>modelTopMouseDown(item,index,e)"-->
          <!--@mouseup="modelTopMouseUp(item,index)"-->
          <i class="nz-icon nz-icon-model"></i>
        </i>
      </div>
      <!--悬浮network部分-->
      <div class="network-info">
        <div  v-if="popDataShow.main">
          <popDataMain :moduleId="this.selNodeId" :projectId="this.allModuleInfo.basic.id"></popDataMain>
        </div>
        <div v-if="popDataShow.total">
          <total-chart :moduleId="this.totalId" :projectId="this.allModuleInfo.basic.id" :nodesArray="totalArray"></total-chart>
        </div>
        <div v-if="popDataShow.info">
          <popDataInfo :moduleId="this.selNodeId" :projectId="this.allModuleInfo.basic.id"></popDataInfo>
        </div>
      </div>
      <!--拓扑图的放大缩小-->
      <div class="right-bottom-zoom">
        <div class="zoom-option" style="border-bottom: 1px solid #c5c8cb;" @click="zoomChange(0.1)"><span><i class="nz-icon nz-icon-enlarge"></i></span></div>
        <div class="zoom-option" @click="zoomChange(-0.1)"><span><i class="nz-icon nz-icon-narrow"></i></span></div>
        <div></div>
      </div>
      <expression-info
        v-if="expressionsInfoShow&&!editVisNetwork"
        :lineId="lineId"
        :edgesArray="edgesArray"
        :expressionsInfoPosition="expressionsInfoPosition"
      ></expression-info>
    </div>
    <transition name="right-box">
      <add-model
        v-if="addNodeShow"
        @addModel="addModel"
        :nodeData="nodeData"
        @close="closeAddNode"
        @del="nodeDel"
        :isAdd="isNodeAdd"
        :moduleDataS="moduleDataS"
        :projectName="allModuleInfo.basic"
      ></add-model>
    </transition>
    <transition name="right-box">
      <add-line
        v-if="addLineShow"
        @addLine="addLine"
        @lineDel="lineDel"
        :selectNode="NodeArr"
        :lineData="lineData"
        :isAdd="isLineAdd"
        @close="closeAddLine"
        @del="lineDel"
      ></add-line>
    </transition>
    <!--endpoint-->
    <transition name="right-box">
      <endpointTable v-if="popDataShow.endpoint"  :moduleId="this.selNodeId" :projectId="this.allModuleInfo.basic.id" @close="popDataShowUpdate('',true)">endpoint</endpointTable>
    </transition>
    <!--asset-->
    <transition name="right-box">
      <assetTable v-if="popDataShow.asset" :moduleId="this.selNodeId" :projectId="this.allModuleInfo.basic.id" @close="popDataShowUpdate('',true)">alert</assetTable>
    </transition>
    <!--alert-->
    <transition name="right-box">
      <alertTable v-if="popDataShow.alert" :moduleId="this.selNodeId" :projectId="this.allModuleInfo.basic.id" @close="popDataShowUpdate('',true)">alert</alertTable>
    </transition>
  </div>
</template>

<script>
  import Vis from 'vis-network/dist/vis-network.js'
  import addNode from './addNode'
  import addLine from './addLine'
  import popDataMain from './popData/Main'
  import popDataInfo from './popData/Info'
  import TotalChart from "./popData/totalChart";
  import alertTable from "./popData/alertTable";
  import assetTable from "./popData/assetTable";
  import endpointTable from "./popData/endpointTable";
  import ExpressionInfo from "./popData/expressionInfo";
	export default {
		name:"topology",
    components: {
      ExpressionInfo,
      TotalChart,
      alertTable,
      assetTable,
      endpointTable,
      'add-model':addNode,
      'add-line':addLine,
      'popDataMain':popDataMain,
      'popDataInfo':popDataInfo,
    },
    props:{
      nodesArray:{
        type:Array
      },
      edgesArray:{
        type:Array
      },
      isFullScreen:{
        type:Boolean,
      },
      editVisNetwork:{
        type:Boolean,
      },
      allModuleInfo:{}
    },
    watch:{
      NodeArr(n){
        if(n.length===2){
          this.lineData={
            arrows:'0',
            label:'',
            color:'#1e90ff',
            lineId:'',
            width:'1',
            dashes:false,
            id:'',
            smooth:{},
          };
          this.addLineShow=true;
          this.selectNodeTitle=false;
          this.isLineAdd=true;
        }
       this.selNodeArrUpdate()
      },
      editVisNetwork(n){
        if(!n){
          this.NodeArr=[];
          this.selNodeId='';
          this.selectNodeTitle=false;
        }
      },
      allModuleInfo:{
        immediate: true,
        deep: true,
        handler(n){
          this.allModuleInfos={...n};
          this.arrayDiff();
          this.topologyReset();
        },
      },
    },
    data(){
		  return {
        screenX:window.screen.width,
        lineId:'',
		    canvas:'',
        totalId:'',
        totalArray:[],
        allModuleInfos:[],
        relativeModelTop:{},
        expressionsInfoPosition:{
          x:0,
          y:0,
        },
        moduleDataS:[],
        index:'',
        zoom:1,
        domScale:1,
        selectNodeTitle:false,
        // 拓扑图工具
        networkPopTop:0,
        networkPopLeft:0,
        networkPopShow:false,
        addNodeShow:false,
        addLineShow:false,
        NodeArrShow:false,
        cursorMove:false,
        NodeArr:[],
        selNodeId:'',
        lineData:{
          arrows:'',
          label:'',
          color:'#1e90ff',
          lineId:'',
          id:'',
          dashes:[],
          smooth:{},
        },
        hoverEdge:false,
        isLineAdd:true,
        isNodeAdd:true,
        nodeData:{
          modelId:'',
          label:'',
          x:'',
          y:'',
          image:'',
        },
        popData:[
          {top:'-14px', left:'-14px',className:'nz-icon-endpoint',id:'endpoint',title:this.$t('project.topology.endpoint')},
          {top:'-14px', left:'26px',className:'nz-icon-asset',id:'asset',title:this.$t('project.topology.asset')},
          {top:'22px',  left:'47px',className:'nz-icon-chart',id:'total',title:this.$t('project.topology.total')},
          {top:'56px', left:'26px',className:'',id:'other',title:''},
          {top:'56px', left:'-14px',className:'nz-icon-info-normal',id:'info',title:this.$t('project.topology.info')},
          {top:'22px', left:'-33px',className:'nz-icon-gaojing',id:'alert',title:this.$t('project.topology.alert')},
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
        modelTop:[],
        activeIndex:'',
        activeModelItem:{},
        //viewsCenter
        viewsCenter:{
          x:0,y:0
        },
        // 拓扑图数据
        nodes:[],
        edges:[],
        // network:null,
        container:null,
        options:{},
        data:{},
        timeInterval:'',
        expressionsInfoShow:false,
      }
    },
    methods:{// 保存拓扑图数据
      saveTopology(){
        if(this.prevent_opt.save){ return } ;
        this.prevent_opt.save=true;
        this.$emit('topologyLoad');
        let nodes=this.formatNodes([...this.nodesArray]);
        let edges=this.formatEdges([...this.edgesArray]);
        this.$put('/project/topo',{topo:JSON.stringify({nodes:nodes,lines:edges,viewsCenter:this.viewsCenter,zoom:(this.zoom*1920/this.screenX)}),projectId:this.allModuleInfo.basic.id}).then(res=>{
          this.prevent_opt.save=false;
          if(res.code===200){
            this.$message({
              message: this.$t("tip.saveSuccess"),
              type: 'success'
            });
            this.$emit('reload');
          }
        }).catch(res=>{
          this.prevent_opt.save=false;
          this.$message({
            message: res.msg,
            type: 'error'
          });
        });
        // this.$put('/project/topo',{topo:'{}',projectId:this.allModuleInfo.basic.id});
        this.$emit('editVisNetworkChange',false);
      },
      cancelTopology(){
        this.$emit('reload');
      },
      formatNodes(arr){
        let arr1=[];
        arr.forEach(item=>{
          let obj={
            "x": item.x,
            "y": item.y,
            "moduleId": item.moduleId,
            "label":item.label,
            "iconId": item.iconId,
            "expressions": item.expressions
          };
          arr1.push(obj)
        });
        return arr1
      },
      formatEdges(arr){
        let arr1=[];
        arr.forEach(item=>{
          let obj={
            "name": item.name,
            "width": item.width,
            "arrows": item.arrows,
            "color": item.color,
            "source": item.from,
            "target": item.to,
            "smooth": item.smooth,
            "expressions": item.expressions.map((item)=>{
              delete item.value;
              return item
            }),
            "dashes":item.dashes,
          };
          arr1.push(obj)
        });
        return arr1
      },
      //拓扑图方法
      init(){
        let this_ = this;
        this_.nodes = new Vis.DataSet(this_.nodesArray);
        this_.edges = new Vis.DataSet(this_.edgesArray);
        this_.container = this.$refs.visNetwork;
        this_.networkPop = document.getElementById('network-pop');
        this_.data = {
          nodes: this_.nodes,
          edges: this_.edges
        };
        this_.options = {
          autoResize: true,
          clickToUse:false,
          groups:{
            useDefaultGroups: true,
            myGroupId:{
              /*node options*/
            }
          },
          nodes: {
            shape: 'dot',
            size: 30,
            borderWidth: 2,
            font:{
              size:16,
            },
            // chosen:{
            //   node:(values, id, selected, hovering)=>{
            //     console.log(values);
            //   }
            // },
          },

          edges: {
            width: 2,
            smooth:{  //设置两个节点之前的连线的状态
              enabled: true,//默认是true，设置为false之后，两个节点之前的连线始终为直线，不会出现贝塞尔曲线
              roundness:1,
              type: "dynamic",
            },
            font:{
              align:'bottom',
              vadjust:10,
            },
            selfReference:{size:30, angle:Math.PI / 4},
            arrowStrikethrough:false,
            chosen:{
              edge:(values, id, selected, hovering)=>{
                if(this_.hoverEdge){
                  values.middleArrow=true;
                  values.middleArrowScale=1;
                  values.middleArrowType='circle';
                  this_.expressionsInfoShow=true;
                }
              },
            },
          },
          layout:{
            randomSeed: 666,
          },
          physics: { //计算节点之前斥力，进行自动排列的属性
            enabled: false, //默认是true，设置为false后，节点将不会自动改变，拖动谁谁动。不影响其他的节点
            barnesHut: {
              gravitationalConstant: -4000,
              centralGravity: 0.3,
              springLength: 120,
              springConstant: 0.04,
              damping: 0.09,
              avoidOverlap: 0
            }
          },

          interaction:{
            dragNodes: true, //是否能拖动节点
            dragView: true, //是否能拖动画布
            hover: true, //鼠标移过后加粗该节点和连接线
            multiselect: false, //按 ctrl 多选
            selectable: true, //是否可以点击选择
            selectConnectedEdges: false, //选择节点后是否显示连接线
            hoverConnectedEdges: true, //鼠标滑动节点后是否显示连接线
            zoomView: true, //是否能缩放画布
            navigationButtons:true,
          },

          manipulation: {  //该属性表示可以编辑，出现编辑操作按钮
            enabled: false,
          },
        };
        this_.network = new Vis.Network(this_.container, this_.data, this_.options);
        this_.network.moveTo({
          position: this_.viewsCenter,
          scale: this_.zoom,
          offset: {x:0, y:0},
        });
        this_.containerCanvas=document.querySelectorAll("#network_id canvas")[0];
        this_.modelTopUpdate();
        this_.canvas=document.getElementsByTagName('canvas')[0];
      },
      resetAllNodes() {
        this.setNetworkData(this.nodesArray,this.edgesArray);
      },
      resetAllNodesStabilize() {
        let this_ = this;
        this_.resetAllNodes();
        this_.network.stabilize();
      },
      setData(){
        this.setNetworkData(this.nodesArray,this.edgesArray);
      },
      setNetworkData(nodes,edges,flag){//动态设置拓扑图数据
        let this_ = this;
        this.nodes = new Vis.DataSet(nodes);
        this.edges = new Vis.DataSet(edges);
        this.network.setData({
          nodes: this_.nodes,
          edges: this_.edges
        });
        this_.network.moveTo({
          position: this_.viewsCenter,
          scale: this_.zoom,
          offset: {x:0, y:0},
        });
        if(!flag){
          this.$nextTick(()=>{
            this_.modelTopUpdate();
            this_.arrayDiff();
            this_.popDataShowUpdate();
          })
        }else{
          this.$nextTick(()=>{
            this.modelTopUpdate();
          })
        }
      },
      addModel(model){ // 添加model
        this.addNodeShow=false;
        if(!model){return}
        let nodesArray=[...this.nodesArray];
        if(!this.isNodeAdd){
          model={...nodesArray.find(item=>item.id===this.selNodeId),...model};
          nodesArray=nodesArray.filter(item=>item.id!==this.selNodeId);
        }else{
          model={...model,...this.network.DOMtoCanvas({x:80,y:100})};
        }
        this.edgesArray.forEach(item=>{
          if(item.from===this.selNodeId){
            item.from=model.id;
          }
          if(item.to===this.selNodeId){
            item.to=model.id;
          }
        })
        this.$get('/module/stat',{id:model.id}).then(res=>{
          model.state=res.data;
          nodesArray.push(model);
          this.$emit("setTopologyData",nodesArray,this.edgesArray);
          this.setNetworkData(nodesArray,this.edgesArray);
          this.$nextTick(()=>{
            this.arrayDiff();
            this.$emit('editVisNetworkChange',true);
          })
        });
      },
      addModelShow(){ // 显示添加节点弹窗
        this.addNodeShow=true;
        this.isNodeAdd=true;
        this.nodeData={
          modelId:'',
          label:'',
          x:'',
          y:'',
          image:'',
          id:'',
        }
      },
      addLine(edges){ // 添加或者編輯line
        this.addLineShow=false;
        if(!edges){return}
        let edgesArray =[...this.edgesArray];
       if(!this.isLineAdd){
         edges={...edgesArray.find(item=>item.id===edges.id),...edges};
         edgesArray=edgesArray.filter(item=>item.id!==edges.id);
       }else{
         edges.from=this.NodeArr[0];
         edges.to=this.NodeArr[1];
       }
       edgesArray.push(edges);
        this.$emit("setTopologyData",this.nodesArray,edgesArray);
        this.setNetworkData(this.nodesArray,edgesArray);
        this.NodeArr=[];
        this.NodeArrShow=false;
      },
      addLineTitleShow(){ // 显示添加线弹窗
        // this.addLineShow=true;
        this.selectNodeTitle=true;
        this.NodeArrShow=true;
      },
      closeAddLine(){
        this.selectNodeTitle=false;
        this.addLineShow=false;
        this.NodeArr=[];
        this.NodeArrShow=false;
        this.network.unselectAll();
      },
      closeAddNode(){
        this.addNodeShow=false;
        this.arrayDiff();
      },
      setNodePosition(selId){ // 移动节点后 设置节点坐标
        let position = this.network.getPositions([selId]);
        let selItem = this.nodesArray.find((item)=>item.id===selId);
        this.nodeData = selItem;
        selItem.x=position[selId].x;
        selItem.y=position[selId].y;
        this.$emit("setTopologyData",this.nodesArray,this.edgesArray);
      },
      setPopPosition(selId){//设置节点工具栏位置以及是否显示
        if(!selId){return}
        let position=this.network.canvasToDOM(this.network.getPositions([selId])[selId]);
        this.networkPopShow=false;
        setTimeout(()=>{
          this.networkPop.style.top = position.y - 85 + 85*(1-this.zoom)+'px';
          this.networkPop.style.left = position.x - 32*this.zoom - 4.8*(1-this.zoom) +'px';
        },150)
        if(this.NodeArr.length===0&&!this.editVisNetwork){
          setTimeout(()=>{
            this.networkPopShow=true;
            let index=this.modelTop.findIndex((item)=>item.id===selId);
            this.activeIndex=index;
            this.activeModelItem=this.modelTop.find((item)=>item.id===selId);
            this.index=index;
          },100)
        }
        this.NodeArr=[...this.NodeArr]
      },
      networkPopClose(){//关闭节点工具栏
        this.networkPopShow=false;
        // this.selNodeId=''
        if(this.network){
          this.network.unselectAll();
        }
      },
      //工具栏
      nodeDel(){
        let nodesArray=this.nodesArray.filter((item)=>item.id!==this.selNodeId);
        let edgesArray=this.edgesArray.filter((item)=>!(item.from===this.selNodeId || item.to===this.selNodeId));
        this.selNodeId='';
        this.$emit('setTopologyData',nodesArray, edgesArray);
        this.setNetworkData(nodesArray, edgesArray);
        this.networkPopClose();
        this.arrayDiff();
      },
      nodeEdit(){
        this.moduleDataS.module.push(this.allModuleInfos.module.find(item=>item.id===this.selNodeId));
        this.addNodeShow=true;
        this.isNodeAdd=false;
      },
      lineDel(){
        if(!this.lineData.id){return}
        let edgesArray=this.edgesArray.filter((item)=>item.id!==this.lineData.id);
        this.$emit('setTopologyData',this.nodesArray, edgesArray);
        this.setNetworkData(this.nodesArray,edgesArray);
      },

      // 工具的点击 对应的操作
      popClick(id){
        this.lineData='';
        this.popDataShowUpdate(id);
      },
      modelTopUpdate(){//model上的图标 实时更新
        this.modelTop=[];
        this.nodesArray.forEach((item)=>{
          let position=this.network.canvasToDOM({x:item.x,y:item.y});
          let obj={
            show:true,
            x:position.x,
            y:position.y,
            id:item.id,
            error:false,
            assetError:false,
            alertError:false,
            endpointError:false,
            state:item.state,
          };
          if(item.state){
            if(item.state.assetStat.down>0){
              obj.error=true;
              obj.assetError=true;
            }
            if(item.state.endpointStat.down>0){
              obj.error=true;
              obj.endpointError=true;
            }
            if(item.state.alertStat.P1> 0 || item.state.alertStat.P3>0 || item.state.alertStat.P2>0){
              obj.error=true;
              obj.alertError=true;
            }
          }
          this.modelTop.push(obj);
        })
      },
      selNodeArrUpdate(){// 选中框位置更新
        this.NodeArr.forEach((id,index)=>{
          let selNode = this.nodesArray.find(item=>item.id===id);
          let position=this.network.canvasToDOM({x:selNode.x,y:selNode.y});
          document.getElementById('nodeArr'+(index+1)).style.top=position.y+'px';
          document.getElementById('nodeArr'+(index+1)).style.left=position.x+'px';
        })
      },
      modelTopMouseDown(e){
        if(!this.index&&this.index!==0){return}
        this.relativeModelTop={
          x:e.clientX-(parseFloat(this.$refs['modelTopId'+this.index][0].style.left)),
          y:e.clientY-(parseFloat(this.$refs['modelTopId'+this.index][0].style.top)),
        };
        this.$refs['network'].addEventListener('mousemove',this.modelTopMouseMove);
      },
      modelTopMouseUp(){
        this.index='';
        this.relativeModelTop={};
        this.$refs['network'].removeEventListener('mousemove',this.modelTopMouseMove);
      },
      modelTopMouseMove(e){
        let position={
          x:e.clientX-this.relativeModelTop.x,
          y:e.clientY-this.relativeModelTop.y
        };
        // this.$refs['modelTopId'+this.index][0].style.top=position.y+'px';
        // this.$refs['modelTopId'+this.index][0].style.left=position.x+'px';
        // // {top:(item.y- 80 + 5*(10-zoom*10))+'px',left:(item.x-26)+'px'
        // let cancvs=this.network.DOMtoCanvas({
        //   x:position.x+26-5*(1-this.zoom),
        //   y:position.y+80-(50*(1-this.zoom)),
        // });
        // this.network.moveNode(this.selNodeId,cancvs.x,cancvs.y);
        // let selItem = this.nodesArray.find((item)=>item.id===this.selNodeId);
        // selItem.x=cancvs.x;
        // selItem.y=cancvs.y;
        // this.$emit("setTopologyData",this.nodesArray,this.edgesArray);
        // if(this.networkPopShow){
        //   this.setPopPosition(this.selNodeId);
        // }
      },
      modelTopMouseMoveEdge(e){
        e = e || window.event;
        let position={
          x:e.layerX,
          y:e.layerY,
        };
        let nodeName=e.path?e.path[0].nodeName:e.target.tagName;
        if(nodeName!=='CANVAS'){
          this.expressionsInfoShow=false;
          this.$refs['network'].removeEventListener('mousemove',this.modelTopMouseMoveEdge);
          return
        }
        this.expressionsInfoPosition={...position};
      },
      modelTopClick(item,index){
        this.activeIndex=index;
        this.activeModelItem=item;
        this.index=index;
        this.selNodeId=item.id;
        if(this.selNodeId){
          this.setPopPosition(this.selNodeId);
          this.popDataShowUpdate('main');
          this.network.selectNodes([this.selNodeId]);
        }
      },
      // 数组取差集
      arrayDiff(){
        // this.moduleDataS=this.allModuleInfos-this.nodesArray
        this.moduleDataS={...this.allModuleInfos};
        this.nodesArray.forEach((item)=>{
          if(this.moduleDataS.module){
            this.moduleDataS.module=this.moduleDataS.module.filter((item1)=> item.id!==item1.id)
          }
        })
      },
      //工具栏点击后显示对应内容
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
        if(key&&!this.editVisNetwork){
          if(key==='total'&&this.selNodeId){
            this.totalId=this.selNodeId;
            this.totalArray=this.nodesArray;
          }
          if(key==='total'&&this.lineData){
            this.totalId=this.lineData.id;
            this.totalArray=this.edgesArray;
          }
          this.$nextTick(()=>{
            this.popDataShow[key]=true;
          })
        }
        if(flag){ // 处理关闭后 缩放后显示工具按钮的问题
          this.selNodeId='';
        }
        if(key==='asset' || key==='alert' || key==='endpoint'){
          this.networkPopShow=false;
          // this.selNodeId='';
          // this.setPopPosition(this.selNodeId);
        }
      },
      topologyZoom(scale){
        if(scale<0.1){//每次缩小0.1 保证缩放大于0
          scale=0.1;
        }
        if(scale>3){
          scale=3;
        }
        this.zoom=scale;
        this.network.moveTo({
          position: this.viewsCenter,
          scale: this.zoom,
          offset: {x:0, y:0},
        });
        this.$nextTick(()=>{
          this.modelTopUpdate();
          if(this.networkPopShow){
            this.setPopPosition(this.selNodeId);
          }
          this.popDataShowUpdate();
        })
      },
      //拓扑图放大缩小
      zoomChange(num){
        this.zoom+=num;
        if(this.zoom<0.1){//每次缩小0.1 保证缩放大于0
          this.zoom=0.1;
        }
        if(this.zoom>3){
          this.zoom=3;
        }
        this.network.moveTo({
          position: this.viewsCenter,
          scale: this.zoom,
          offset: {x:0, y:0},
        });
        this.$nextTick(()=>{
          this.modelTopUpdate();
          this.setPopPosition(this.selNodeId);
          this.popDataShowUpdate();
        })
      },
      selpopIs(item){//判断是否有图表
        let flag=true;
        if(item.id==='other'){
          flag=false;
        }
        this.nodeData=this.nodesArray.find((item)=>item.id===this.selNodeId);
        if(item.id==='total'&&(!this.nodeData.expressions || this.nodeData.expressions.length===0)){
          flag=false;
        }
        return flag
      },
      modelPopError(item){
        if(item.id==='asset'&&this.activeModelItem.assetError){
          return true;
        }
        if(item.id==='alert'&&this.activeModelItem.alertError){
          return true;
        }
        if(item.id==='endpoint'&&this.activeModelItem.endpointError){
          return true;
        }
        return false;
      },
      topologyReset(){//重置topology默认数据
        this.index='';
        this.activeIndex='';
        this.selNodeId='';
        this.NodeArr=[];
      },
      qqq(){
        let nodesArray=[...this.nodesArray];
        let edgesArray=[...this.edgesArray];
        this.edgesArray.forEach((item)=>{
         if(item.dataFlow==='right'&&item.dashes){
           if(item.dashes[0]!==0){
             item.dashes[0]--;
           }else if(item.dashes[1]!==0){
             item.dashes[1]--;
           }else{
             item.dashes[0]=item.dashes[2];
             item.dashes[1]=item.dashes[2];
           }
         }else if(item.dataFlow==='left'&&item.dashes){
           if(item.dashes[1]!==item.dashes[2]){
             item.dashes[1]++;
           }else if(item.dashes[0]!==item.dashes[2]){
             item.dashes[0]++;
           }else{
             item.dashes[0]=0;
             item.dashes[1]=0;
           }
         }
        });
        this.selNodeId='';
        this.$emit('setTopologyData',nodesArray, edgesArray);
        this.setNetworkData(nodesArray, edgesArray,true);
      },
    },
    mounted(){
      // this.timeInterval=setInterval(()=>{
      //   this.qqq();
      // },300);
       setTimeout(()=>{
         let this_=this;
         this.init('modal');
         this.network.on("click", function (params) {
           this_.activeIndex='';
           this_.networkPopClose();
           this_.network.selectNodes([]);
           if(!params.edges.length&&!params.nodes.length){
             this_.popDataShowUpdate('');
           }
           let selId=params.nodes[0];
           // if(this_.selNodeId&& this_.selNodeId===selId){return;}
           if(selId){
             this_.selNodeId=selId;
           }else{
             this_.selNodeId='';
           }
         });

         this.network.on("selectNode", function (params) { //选择节点
           let selId=params.nodes[0];
           if(this_.selNodeId&& this_.selNodeId===selId){
             if(selId){
               this_.cursorMove=true;
               if(this_.NodeArr.indexOf(selId)!==-1){
                 let index = this_.NodeArr.indexOf(selId);
                 this_.NodeArr=this_.NodeArr.filter((item,i)=> i !== index);
                 return
               }
               if(this_.selectNodeTitle&&this_.NodeArrShow){
                 this_.NodeArr.push(selId);
                 this_.network.selectNodes(this_.NodeArr,true);
                 return
               }
               if(this_.NodeArr.length===0&&this_.editVisNetwork){
                 this_.nodeEdit();
               }
               this_.setPopPosition(selId,params);
             }
           }else{
             if(selId){
               this_.selNodeId=selId;
               this_.cursorMove=true;
               this_.nodeData=this_.nodesArray.find((item)=>item.id===selId);
               if(this_.NodeArr.indexOf(selId)!==-1){
                 let index = this_.NodeArr.indexOf(selId);
                 this_.NodeArr=this_.NodeArr.filter((item,i)=> i !== index);
                 return
               }
               if(this_.selectNodeTitle&&this_.NodeArrShow){
                 this_.NodeArr.push(selId);
                 this_.network.selectNodes(this_.NodeArr,true);
                 return
               }
               if(this_.NodeArr.length===0&&this_.editVisNetwork){
                 this_.nodeEdit();
               }
               this_.setPopPosition(selId,params);
               this_.popDataShowUpdate('main');
             }
           }
         });

         this.network.on("selectEdge", function (params) { // 选择边
           this_.selNodeId='';
           this_.lineData=this_.edgesArray.find((item)=>item.id===params.edges[0]);
          if(this_.editVisNetwork){
            this_.lineData.color=this_.lineData.color.color?this_.lineData.color.color:this_.lineData.color;
            this_.addLineShow=true;
            this_.isLineAdd=false;
          }
          if(!this_.editVisNetwork){
            if(this_.lineData.expressions&&this_.lineData.expressions.length){
              this_.expressionsInfoShow=false;
              this_.popDataShowUpdate('total')
            }else{
              this_.popDataShowUpdate()
            }
          }
           // this_.lineData.color=this_.lineData.color.color;
           // this_.addLineShow=true;
         });

         this.network.on("hoverEdge", function (params) { // 悬停边
           this_.hoverEdge=true;
           this_.cursorMove=true;
           this_.lineId=params.edge;
           this_.$refs['network'].addEventListener('mousemove',this_.modelTopMouseMoveEdge);
         });

         this.network.on("blurEdge", function (params) { // 边失去焦点
           this_.hoverEdge=false;
           this_.cursorMove=false;
           this_.expressionsInfoShow=false;
           this_.lineId='';
           this_.$refs['network'].removeEventListener('mousemove',this_.modelTopMouseMoveEdge);

         });

         this.network.on("dragStart", function (params) {//节点移动开始
           this_.NodeArrShow=false;
           this_.networkPopShow=false;
           this_.index='';
           this_.activeIndex='';
           let selId=params.nodes[0];
           if(selId){
             this_.selNodeId=selId
           }
           // if(!selId){
           //   this_.modelTop.forEach(item=>{
           //     item.show=false;
           //   })
           // }
         });

         this.network.on("dragging", function () {//节点移动中
           this_.viewsCenter=this_.network.getViewPosition();
           // let selId=params.nodes[0];
           if(this_.selNodeId){
             this_.setNodePosition(this_.selNodeId)
           }
           if(this_.selNodeId&&this_.networkPopShow){
             this_.setPopPosition(this_.selNodeId);
           }
           if(this_.NodeArr.length>0){
             this_.NodeArrShow=true;
           }
           this_.modelTopUpdate();
           this_.selNodeArrUpdate();
         });

         this.network.on("dragEnd", function () {//节点移动结束
           this_.viewsCenter=this_.network.getViewPosition();
           if(this_.selNodeId){
             this_.setNodePosition(this_.selNodeId)
           }
           if(this_.selNodeId&&this_.networkPopShow){
             this_.setPopPosition(this_.selNodeId);
           }
           if(this_.NodeArr.length>0){
             this_.NodeArrShow=true;
           }
           if(!this_.networkPopShow){
             this_.selNodeId=''
           }
           this_.modelTopUpdate();
           this_.selNodeArrUpdate();
         });

         this.network.on("hoverNode", function () {//hoverNode
           this_.cursorMove=true;
         });

         this.network.on("blurNode", function () {//blurNode
           this_.cursorMove=false;
         });

         this.network.on("zoom", function (params) {//检测缩放
           this_.zoom=params.scale;
           this_.modelTopUpdate();
           this_.selNodeArrUpdate();
           this_.networkPopShow=false;
           this_.topologyZoom(params.scale);
           return false
         });

         this.network.on("resize", function (params) {//检测resize
           setTimeout(()=>{
             this_.zoom=this_.network.canvasToDOM({x:0,y:1}).y-this_.network.canvasToDOM({x:0,y:0}).y;
             this_.modelTopUpdate();
             this_.selNodeArrUpdate();
             this_.networkPopShow=false;
           });
           return false
         });
       })
    },
    beforeDestroy() {
		  this.network.off('click');
		  this.network.off('selectNode');
		  this.network.off('selectEdge');
		  this.network.off('hoverEdge');
		  this.network.off('blurEdge');
		  this.network.off('dragStart');
		  this.network.off('dragging');
		  this.network.off('dragEnd');
		  this.network.off('blurNode');
		  this.network.off('zoom');
		  this.network.off('resize');
      this.network=null;
    },
	}
</script>

<style scoped>
  .content{
    height: 100%;
  }
  .edit-topology{
    width: 100%;
    height: 28px;
  }
  .network{
    display: flex;
    height: calc(100% - 30px);
    position: relative;
    overflow: hidden;
  }
  .network-pop{
    position: absolute;
    z-index: 0;
    /*border: 1px solid #e6e6e6;*/
    border-radius: 5px;
    height: 32px;
    /*background: #fff;*/
    padding: 0 3px;
    line-height: 32px;

  }
  .network-pop .nz-icon-hexagonBorder{
    position: absolute;
    font-size: 48px;
    color: #84d5c2;
  }
  .network-pop .nz-icon-hexagonBorder.error-model-stat{
    color: #F5BAAC;
  }
  .network-pop .nz-icon-hexagonBorder.error-model-stat:hover{
    color: #EC7F66;
  }
  .network-pop  .nz-icon-liubianxing{
    color:#e2f3ef;
    font-size: 44px;
    position: absolute;
    top: 1px;
    left: 2px;
    transform: scale(1.02);
    z-index: -1;
  }
  .network-pop .error-model-stat .nz-icon-liubianxing{
    color: #FADED7 ;
  }
  .network-pop .nz-icon.noMove{
    position: absolute;
    top: 0;
    left: 14px;
    font-size: 20px;
    color: #27c09c;
  }
  .network-pop .error-model-stat .nz-icon.noMove{
    color: #EC7F66;
  }
  .network-pop .selpop.nz-icon-hexagonBorder:hover{
    transform: scale(1.1);
    color: #4BB49B;
  }
  .network-pop .selpop:hover .nz-icon-liubianxing{
    transform: scale(1.1);
    left: 4px;
    font-size: 41px;
    top: 0;
    color:  #D7FAF1;
  }
  .network-pop .selpop:hover .noMove{
    transform: scale(1.1);
    color: #4BB49B;
  }
  .network-pop .selpop.nz-icon-hexagonBorder.error-model-stat:hover{
    transform: scale(1.1);
    color: #EC7F66;
  }
  .network-pop .selpop.error-model-stat:hover .nz-icon-liubianxing{
    transform: scale(1.1);
    left: 4px;
    font-size: 41px;
    top: 0;
    color: #FBE7E3;
  }
  .network-pop .selpop.error-model-stat:hover .noMove{
    transform: scale(1.1);
    color: #EC7F66;
  }
  .network-pop .no-selPop{
    color: #999;
  }
  .network-pop .no-selPop .nz-icon-liubianxing{
    color: rgb(218,218,218);
  }
  .network-pop .no-selPop .nz-icon-chart{
    color: #999;
  }
  /*.network-pop .nz-icon-hexagonBorder.error-model-stat:hover{*/
    /*color: #EC7F66;*/
  /*}*/
  /*.btmTriangle{*/
    /*position: absolute;*/
    /*width: 0;*/
    /*height: 0;*/
    /*border-width: 10px;*/
    /*border-style: solid;*/
    /*border-color:#e6e6e6 transparent transparent transparent;*/
    /*bottom: -20px;*/
    /*left: 50%;*/
    /*transform: translateX(-50%);*/
  /*}*/
  /*.btmTriangle:after{*/
    /*content: '';*/
    /*display:block;*/
    /*width:0;*/
    /*height:0;*/
    /*border-width: 10px;*/
    /*border-style:solid;*/
    /*border-color:#fff transparent  transparent transparent;*/
    /*position:absolute;*/
    /*bottom: -7px;*/
    /*left: -9px;*/
  /*}*/
  #network_id,.network-null{
    width: 100%;
    height: 100%;
  }
  .network-null{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
  }
  .network-null .nz-icon-create-square{
    color: #23BF9A;
    font-size: 50px;
    margin-bottom: 24px;
    cursor: pointer;
  }
  .cursorMove{
    cursor: move;
  }
  #network_id2{
    height: 100%;
  }
  .networkContent{
    width: 40%;
  }
  .nz-icon-delete{
    cursor: pointer;
    color: #ee6723;
    margin-left: 10px;
  }
  .nz-icon-edit{
    font-size: 14px;
    cursor: pointer;
  }
  .edit-topology{
    color: #1a1a1a;
    font-size: 14px;
    /*font-weight: bold;*/
    height: 28px;
    position: absolute;
    top: 15px;
    width: calc(100% - 160px);
    z-index: 10;
  }
  .edit-topology-module,.edit-topology-line-cancel{
    margin-left: 30px;
  }
  .edit-topologyLine{
    margin-left: 60px;
  }
  .edit-topology-add,.edit-topology-remove,.edit-topologyCancel{
    color: #1989fa;
    margin-left: 30px;
    cursor: pointer;
  }
  .edit-topology-add{
    display: inline-block;
    width: 36px;
  }
  .edit-topology-add:hover,.edit-topology-remove:active,.edit-topologyCancel:hover{
    font-weight: bold;
  }
  .sel-node{
    position: absolute;
    width: 0;
    height: 0;
  }
  .sel-node-top {
    width: 120px;
    height: 0;
    border-top: 4px dashed #FF8C0A;
    position: absolute;
    left: -60px;
    top: -60px;
  }
  .sel-node-right {
    width: 0;
    height: 120px;
    border-right: 4px dashed #FF8C0A;
    position: absolute;
    left: 60px;
    top: -60px;
  }
  .sel-node-bottom {
    width: 120px;
    height: 0;
    border-bottom: 4px dashed #FF8C0A;
    position: absolute;
    left: -60px;
    top: 60px;
  }
  .sel-node-left {
    width: 0;
    height: 120px;
    border-left: 4px dashed #FF8C0A;
    position: absolute;
    left: -60px;
    top: -60px;
  }
  @keyframes model-error-animation{
    0%   {
      transform: scale(0.7);
    }
    50%   {
      transform: scale(1);
    }
    100% {
      transform: scale(0.7);
    }
  }
  @keyframes model-icon-animation{
    0%   {
      transform: scale(1.2) translateX(1px);
    }
    50%   {
      transform: scale(0.9) translateX(0px);
    }
    100% {
      transform: scale(1.2) translateX(1px);
    }
  }
  .nz-icon-shuidi{
    position: absolute;
    font-size: 48px;
    color: rgba(190,233,222,0.45);
    border-radius: 50%;
    height: 60px;
    width: 38px;
  }
  .model-error.nz-icon-shuidi{
    color: #FADED7 ;
    animation: model-error-animation .6s infinite ease-in-out;
    animation-direction:normal;
  }
  .model-error-active.nz-icon-shuidi{
    color: #FADED7 ;
  }
  .nz-icon-model{
    color: #23BF9A;
    position: absolute;
    top: 17px;
    left: 15px;
    font-size: 18px;
  }
  .model-error .nz-icon-model{
    color: #EC7F66;
    animation: model-icon-animation .6s infinite ease-in-out;
    animation-direction:normal;
  }
  .model-error-active .nz-icon-model{
    color: #EC7F66;
  }
  .network-info{
    position: absolute;
    right: 0;
    top: 50px;
  }
  .saveTopology{
    background-image: linear-gradient(180deg, #F5B93E 0%, #EE9D3F 100%);
    border-radius: 4px;
    font-size: 14px;
    color: #FFFFFF;
    padding: 4px 14px;
  }
  .cancelTopology{
    background-image: linear-gradient(180deg, #F0F0F0 0%, #D8D8D8 99%);
    border-radius: 4px;
    font-size: 14px;
    color: #333333;
    padding: 4px 14px;
  }
  .network-zoom{
    position: absolute;
    bottom: 15px;
    right: 15px;
    opacity: 0.42;
    background: #FFFFFF;
    border: 1px solid #E7EAED;
    box-shadow: -1px 1px 9px -1px rgba(205,205,205,0.77);
  }
  .zoom-icon{
    font-size: 24px;
    color: #999999;
  }
  .network-zoom .zoom-box:first-child{
    border-bottom: 1px solid rgba(0,0,0,0.7);
    border-radius: 4px 4px 0 0;
    padding: 5px;
  }
  .network-zoom .zoom-box:last-child{
    border-radius:  0 0 4px 4px;
    padding: 5px;
  }
  #network_id /deep/ .vis-network{
    outline: none;
  }
  .scaleTool-enter-active {
    animation: scaleTool-in .15s;
  }
  .scaleTool-leave-active {
    animation: scaleTool-in .15s reverse;
  }
  @keyframes scaleTool-in {
    from{
      top:18px;
      left: 10px;
      transform: scale(0.5);
    }
  }
</style>
