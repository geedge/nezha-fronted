<template>
  <div class="content">
    <div class="edit-topology" v-if="editVisNetwork">
      <span v-show="!selectNodeTitle&&editVisNetwork" class="edit-topology-module">
        Module element :
        <span class="edit-topology-add" @click="addModelShow">Add</span>
        <span class="edit-topology-remove" @click="nodeDel">Remove</span>
      </span>
      <span v-show="!selectNodeTitle&&editVisNetwork" class="edit-topologyLine">
        Line :
        <span class="edit-topology-add" @click="addLineTitleShow">Add</span>
        <span class="edit-topology-remove" @click="lineDel">Remove</span>
      </span>
      <span v-show="!selectNodeTitle&&editVisNetwork" class="edit-topologyLine">
        <el-button @click="saveTopology" class="saveTopology">save</el-button>
      </span>
      <span class="edit-topology-line-cancel" v-show="selectNodeTitle&&editVisNetwork">Please select two nodes  <span class="edit-topologyCancel" @click="closeAddLine">Cancel</span></span>
    </div>
    <div class="network" ref="network"  v-clickoutside="networkPopClose" @mousedown="(e)=>{modelTopMouseDown(e)}" @mouseup="(e)=>modelTopMouseUp(e)">
      <!--拓扑图-->
      <div id="network_id" ref="visNetwork" :class="{'cursorMove': cursorMove}"></div>
      <!--空拓扑图-->
      <div class="network-null" v-if="nodesArray.length===0">
        <i class="nz-icon nz-icon-add-node" @click="addModelShow"></i>
        <img src="./image/emptyData.png" width="303px" height="184px"/>
      </div>
      <!--拓扑图工具-->
      <div
        id="network-pop"
        class="network-pop"
        :style="{transform:'scale('+zoom+')'}"
        v-show="networkPopShow"
      >
        <i class="nz-icon nz-icon-hexagonBorder"  v-for="item in popData"  :style="{top:item.top,left:item.left}" @click="popClick(item.id)">
          <i class="nz-icon nz-icon-liubianxing"></i>
          <i :class="[item.className,{'nz-icon':item.className},'noMove']"></i>
        </i>
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
      <i class="nz-icon nz-icon-shuidi"
         v-show="item.show"
         v-for="(item,index) in modelTop"
         :style="{top:(item.y- 80 + 5*(10-zoom*10))+'px',left:(item.x-26)+'px',transform:'scale('+zoom+')'}"
         :ref="'modelTopId'+index"
         @mousedown="modelTopClick(item,index)"
      >
        <!--@mousedown="(e)=>modelTopMouseDown(item,index,e)"-->
        <!--@mouseup="modelTopMouseUp(item,index)"-->
        <i class="nz-icon nz-icon-model"></i>
      </i>
      <!--悬浮network部分-->
      <div class="network-info">
        <div  v-if="popDataShow.main">
          <popDataMain :moduleId="this.selNodeId" :projectId="this.allModuleInfo.basic.id"></popDataMain>
        </div>
        <div v-if="popDataShow.total">
          <total-chart :moduleId="this.selNodeId" :projectId="this.allModuleInfo.basic.id" :nodesArray="nodesArray"></total-chart>
        </div>
        <div v-if="popDataShow.info">
          <popDataInfo :moduleId="this.selNodeId" :projectId="this.allModuleInfo.basic.id"></popDataInfo>
        </div>
      </div>

    </div>
    <transition name="right-box">
      <add-model
        v-if="addNodeShow"
        @addModel="addModel"
        :nodeData="nodeData"
        @close="addNodeShow=false"
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
      <div v-if="popDataShow.endpoint">endpoint</div>
    </transition>
    <!--endpoint-->
    <transition name="right-box">
      <div v-if="popDataShow.asset" :moduleId="this.selNodeId" :projectId="this.allModuleInfo.basic.id">asset</div>
    </transition>
    <!--alert-->
    <transition name="right-box">
      <alertTable v-if="popDataShow.alert" :moduleId="this.selNodeId" :projectId="this.allModuleInfo.basic.id" @close="popDataShowUpdate">alert</alertTable>
    </transition>
  </div>
</template>

<script>
  import Vis from 'vis'
  import addNode from './addNode'
  import addLine from './addLine'
  import popDataMain from './popData/Main'
  import popDataInfo from './popData/Info'
  import TotalChart from "./popData/totalChart";
  import alertTable from "./popData/alertTable";
	export default {
		name:"topology",
    components: {
      TotalChart,
      alertTable,
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
            arrows:'',
            label:'',
            color:'#1e90ff',
            lineId:'',
            id:'',
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
        },
      },
      // nodesArray:{
      //   immediate: true,
      //   deep: true,
      //   handler(n){
      //    this.setNetworkData(n,this.edgesArray);
      //   },
      // },
    },
    data(){
		  return {
        allModuleInfos:[],
        relativeModelTop:{},
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
        },
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
          {top:'-20px', left:'-17px',className:'nz-icon-endpoint',id:'endpoint'},
          {top:'-20px', left:'28px',className:'nz-icon-shujuku',id:'asset'},
          {top:'18px',  left:'52px',className:'nz-icon-chart',id:'total'},
          {top:'56px', left:'28px',className:'',id:'other'},
          {top:'56px', left:'-17px',className:'nz-icon-info-normal',id:'info'},
          {top:'18px', left:'-38px',className:'nz-icon-gaojing',id:'alert'},
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
        data:{}
      }
    },
    methods:{// 保存拓扑图数据
      saveTopology(){
        let nodes=this.formatNodes([...this.nodesArray]);
        let edges=this.formatEdges([...this.edgesArray]);
        this.$put('/project/topo',{topo:JSON.stringify({nodes:nodes,lines:edges}),projectId:this.allModuleInfo.basic.id}).then(res=>{
          if(res.code==200){
            this.$message({
              message: this.$t("tip.saveSuccess"),
              type: 'success'
            });
          }
        }).catch(res=>{
          this.$message({
            message: res.msg,
            type: 'error'
          });
        });
        this.$emit('editVisNetworkChange',false);
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
            "name": item.lineName,
            "width": item.width,
            "arrows": item.arrows,
            "color": item.color,
            "source": item.from,
            "target": item.to,
            "smooth": item.smooth,
            "expressions": item.expressions,
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
          clickToUse:true,
          groups:{
            useDefaultGroups: true,
            myGroupId:{
              /*node options*/
            }
          },
          nodes: {
            shape: 'dot',
            size: 40,
            borderWidth: 2,
            font:{
              size:20,
            },
          },

          edges: {
            width: 2,
            smooth:{  //设置两个节点之前的连线的状态
              enabled: true,//默认是true，设置为false之后，两个节点之前的连线始终为直线，不会出现贝塞尔曲线
              roundness:0.5,
              type: "curvedCW",
            },
            selfReferenceSize:40,
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
      setNetworkData(nodes,edges){//动态设置拓扑图数据
        let this_ = this;
        this.nodes = new Vis.DataSet(nodes);
        this.edges = new Vis.DataSet(edges);
        this.network.setData({
          nodes:this_.nodes,
          edges: this_.edges
        });
        this_.network.moveTo({
          position: this_.viewsCenter,
          scale: this_.zoom,
          offset: {x:0, y:0},
        });
        this.$nextTick(()=>{
          this_.modelTopUpdate();
          this_.arrayDiff();
          this_.popDataShowUpdate();
        })
      },
      addModel(model){ // 添加model
        this.addNodeShow=false;
        if(!model){return}
        let nodesArray=[...this.nodesArray];
        if(!this.isNodeAdd){
          model={...nodesArray.find(item=>item.id===model.id),...model};
          nodesArray=nodesArray.filter(item=>item.id!==model.id);
        }else{
          model={...model,...this.network.DOMtoCanvas({x:80,y:100})};
        }
        nodesArray.push(model);
        this.$emit("setTopologyData",nodesArray,this.edgesArray);
        this.setNetworkData(nodesArray,this.edgesArray);
        this.$nextTick(()=>{
          this.arrayDiff();
          this.$emit('editVisNetworkChange',true);
        })
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
         edges.dashes=[15,15];
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
        this.networkPop.style.top = position.y - 85 + 7*(10-this.zoom*10)+'px';
        this.networkPop.style.left = position.x - 32*this.zoom - 5*(1-this.zoom) +'px';
        if(!this.isFullScreen&&this.NodeArr.length===0&&!this.editVisNetwork){
          this.networkPopShow=true;
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
        let edgesArray=this.edgesArray.filter((item)=>item.from!==this.selNodeId || this.to!==this.selNodeId);
        this.$emit('setTopologyData',nodesArray, edgesArray);
        this.setNetworkData(nodesArray, edgesArray);
        this.networkPopClose();
        this.arrayDiff();
      },
      // nodeEdit(){
      //   this.addNodeShow=true;
      //   this.isNodeAdd=false;
      // },
      lineDel(){
        if(!this.lineData.id){return}
        let edgesArray=this.edgesArray.filter((item)=>item.id!==this.lineData.id);
        this.$emit('setTopologyData',this.nodesArray, edgesArray);
        this.setNetworkData(this.nodesArray,edgesArray);
      },

      // 工具的点击 对应的操作
      popClick(id){
        this.popDataShowUpdate(id);
      },
      modelTopUpdate(){//model上的图标 实时更新
        this.modelTop=[];
        this.nodesArray.forEach((item)=>{
          let position=this.network.canvasToDOM({x:item.x,y:item.y});
          this.modelTop.push({
            show:true,
            x:position.x,
            y:position.y,
            id:item.id,
          })
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

      },
      modelTopClick(item,index){
        this.index=index;
        this.selNodeId=item.id;
        if(this.selNodeId){
          this.setPopPosition(this.selNodeId);
          this.popDataShowUpdate('main')
        }
      },
      // 数组取差集
      arrayDiff(){
        // this.moduleDataS=this.allModuleInfos-this.nodesArray
        this.moduleDataS={...this.allModuleInfos};
        this.nodesArray.forEach((item)=>{
          this.moduleDataS.module=this.moduleDataS.module.filter((item1)=> item.id!==item1.id)
        })
      },
      //工具栏点击后显示对应内容
      popDataShowUpdate(key){
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
          this.popDataShow[key]=true;
        }
      },
    },
    mounted(){
       setTimeout(()=>{
         let this_=this;
         this.init('modal');
         this.network.on("click", function () {
           this_.networkPopClose();
         });

         this.network.on("selectNode", function (params) {
           let selId=params.nodes[0];
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
             this_.setPopPosition(selId,params);
             this_.popDataShowUpdate('main');
           }
         });

         this.network.on("selectEdge", function (params) { // 选择边
           this_.lineData=this_.edgesArray.find((item)=>item.id===params.edges[0]);
           // this_.lineData.color=this_.lineData.color.color;
           // this_.addLineShow=true;
           // this_.isLineAdd=false;
         });

         this.network.on("dragStart", function (params) {//节点移动开始
           this_.NodeArrShow=false;
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

         this.network.on("dragging", function (params,event) {//节点移动中
           this_.viewsCenter=this_.network.getViewPosition();
           let selId=params.nodes[0];
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

         this.network.on("dragEnd", function (params) {//节点移动结束
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
           this_.modelTopUpdate();
           this_.selNodeArrUpdate();
         });

         this.network.on("hoverNode", function (params) {//hoverNode
           this_.cursorMove=true;
         });

         this.network.on("blurNode", function (params) {//blurNode
           this_.cursorMove=false;
         });

         this.network.on("zoom", function (params) {//检测缩放
           this_.zoom=params.scale;
           this_.modelTopUpdate();
           this_.selNodeArrUpdate();
           if(this_.networkPopShow){
             this_.setPopPosition(this_.selNodeId);
           }
           return false
         });
         this.network.on("resize", function (params) {//检测resize
           setTimeout(()=>{
             this_.modelTopUpdate();
             this_.selNodeArrUpdate();
             if(this_.networkPopShow){
               this_.setPopPosition(this_.selNodeId);
             }
           })
           return false
         });
       })
    }
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
    z-index: 10;
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
  .network-pop  .nz-icon-liubianxing{
    color:#e2f3ef;
    font-size: 44px;
    position: absolute;
    top: 0;
    left: 2px;
  }
  .nz-icon.noMove{
    position: absolute;
    top: 0px;
    left: 14px;
    font-size: 20px;
    color: #27c09c;
  }
  .network-pop .nz-icon-hexagonBorder:hover{
    transform: scale(1.2);
  }
  .network-pop .nz-icon-hexagonBorder:hover .nz-icon-liubianxing{
    transform: scale(1.1);
    left: 4px;
    font-size: 41px;
  }
  .network-pop .nz-icon-hexagonBorder:hover .noMove{
    transform: scale(1.1);
  }
  .btmTriangle{
    position: absolute;
    width: 0;
    height: 0;
    border-width: 10px;
    border-style: solid;
    border-color:#e6e6e6 transparent transparent transparent;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
  }
  .btmTriangle:after{
    content: '';
    display:block;
    width:0;
    height:0;
    border-width: 10px;
    border-style:solid;
    border-color:#fff transparent  transparent transparent;
    position:absolute;
    bottom: -7px;
    left: -9px;
  }
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
  .network-null .nz-icon-add-node{
    color: #23BF9A;
    font-size: 50px;
    margin-bottom: 24px;
    cursor: pointer;
  }
  .network-null .nz-icon-emptypage{
    color: #23BF9A;
    font-size: 24px;
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
    font-size: 18px;
    font-weight: bold;
    height: 28px;
  }
  .edit-topology-module,.edit-topology-line-cancel{
    margin-left: 30px;
  }
  .edit-topologyLine{
    margin-left: 130px;
  }
  .edit-topology-add,.edit-topology-remove,.edit-topologyCancel{
    color: #1989fa;
    margin-left: 30px;
    cursor: pointer;
  }
  .sel-node{
    position: absolute;
    width: 0;
    height: 0;
  }
  .sel-node-top {
    width: 120px;
    height: 0;
    border-top: 4px dashed yellow;
    position: absolute;
    left: -60px;
    top: -60px;
  }
  .sel-node-right {
    width: 0px;
    height: 120px;
    border-right: 4px dashed yellow;
    position: absolute;
    left: 60px;
    top: -60px;
  }
  .sel-node-bottom {
    width: 120px;
    height: 0;
    border-bottom: 4px dashed yellow;
    position: absolute;
    left: -60px;
    top: 60px;
  }
  .sel-node-left {
    width: 0px;
    height: 120px;
    border-left: 4px dashed yellow;
    position: absolute;
    left: -60px;
    top: -60px;
  }
  .nz-icon-shuidi{
    position: absolute;
    font-size: 48px;
    color: rgba(132,213,194,0.5);
  }
  .nz-icon-model{
    color: #23BF9A;
    position: absolute;
    top: 14px;
    left: 15px;
    font-size: 18px;
  }
  .network-info{
    position: absolute;
    right: 0;
    top: 0;
  }
  .saveTopology{
    background: #FA901C;
    border-radius: 4px;
    font-size: 14px;
    color: #FFFFFF;
    padding: 4px 14px;
  }
</style>
