<template>
  <div class="content">
    <div class="editTopology">
      <span v-show="!selectNodeTitle" class="editTopologyModule">
        Module element :
        <span class="editTopologyAdd" @click="addModelShow">Add</span>
        <span class="editTopologyRemove" @click="nodeDel">Remove</span>
      </span>
      <span v-show="!selectNodeTitle" class="editTopologyLine">
        Line :
        <span class="editTopologyAdd" @click="addLineTitleShow">Add</span>
        <span class="editTopologyRemove" @click="lineDel">Remove</span>
      </span>
      <span class="editTopologyLineCancel" v-show="selectNodeTitle">Please select two nodes  <span class="editTopologyCancel" @click="closeAddLine">Cancel</span></span>
    </div>
    <div class="network"  v-clickoutside="networkPopClose">
        <!--图拓扑图-->
        <div id="network_id" ref="visNetwork" :class="{'cursorMove': cursorMove}"></div>
        <!--拓扑图工具-->
        <div
          id="networkPop"
          class="networkPop"
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
        <div class="selNode" id="nodeArr1" v-show="NodeArr[0]&&NodeArrShow" :style="{transform:'scale('+zoom+')'}">
          <div class="selNodeTop"></div>
          <div class="selNodeRight"></div>
          <div class="selNodeBottom"></div>
          <div class="selNodeLeft"></div>
        </div>
        <div class="selNode" id="nodeArr2" v-show="NodeArr[1]&&NodeArrShow" :style="{transform:'scale('+zoom+')'}">
          <div class="selNodeTop"></div>
          <div class="selNodeRight"></div>
          <div class="selNodeBottom"></div>
          <div class="selNodeLeft"></div>
        </div>
        <!--图谱图右侧-->
        <!--<div class="networkContent">33333</div>-->
        <!--model上的图标-->
        <i class="nz-icon nz-icon-shuidi"
           v-show="item.show"
           v-for="(item,index) in modelTop"
           :style="{top:(item.y- 80 + 5*(10-zoom*10))+'px',left:(item.x-26)+'px',transform:'scale('+zoom+')'}"
           :ref="'modelTopId'+index"
           @mousedown="modelTopMouseDown(item,index)"
           @mouseup="modelTopMouseUp(item,index)"
        >
          <i class="nz-icon nz-icon-model"></i>
        </i>
    </div>
    <transition name="right-box">
      <add-model  v-if="addNodeShow" @addModel="addModel" :nodeData="nodeData" @close="addNodeShow=false" @del="nodeDel" :isAdd="isNodeAdd"></add-model>
    </transition>
    <transition name="right-box">
      <add-line  v-if="addLineShow" @addLine="addLine" @lineDel="lineDel" :selectNode="NodeArr" :lineData="lineData" :isAdd="isLineAdd" @close="closeAddLine" @del="lineDel"></add-line>
    </transition>
  </div>
</template>

<script>
  import Vis from 'vis'
  import addNode from './addNode'
  import addLine from './addLine'
	export default {
		name:"topology",
    components: {
      'add-model':addNode,
      'add-line':addLine,
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
    },
    watch:{
      NodeArr(n){
        if(n.length==2){
          this.lineData={
            arrows:'',
            label:'',
            color:'#1e90ff',
            lineId:'',
            id:'',
          }
          this.addLineShow=true;
          this.selectNodeTitle=false;
          this.isLineAdd=true;
        }
       this.selNodeArrUpdate()
      }
    },
    data(){
		  return {
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
          {top:'-20px', left:'-17px',className:'nz-icon-edit',id:'edit'},
          {top:'-20px', left:'28px',className:'nz-icon-chart',id:'2'},
          {top:'18px',  left:'52px',className:'nz-icon-chart',id:'3'},
          {top:'56px', left:'28px',className:'',id:'4'},
          {top:'56px', left:'-17px',className:'nz-icon-chart',id:'5'},
          {top:'18px', left:'-38px',className:'nz-icon-chart',id:'6'},
        ],
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
    methods:{
      //拓扑图方法
      init(type){
        let this_ = this;
        this_.nodes = new Vis.DataSet(this_.nodesArray);
        this_.edges = new Vis.DataSet(this_.edgesArray);
        this_.container = this.$refs.visNetwork;
        this_.networkPop = document.getElementById('networkPop');
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
          scale: this_.isFullScreen?1.5:1,
          offset: {x:0, y:0},
        });
        if(this_.isFullScreen) {
          console.log(this_.viewsCenter)
        }
        this_.containerCanvas=document.querySelectorAll("#network_id canvas")[0];
        this_.modelTopUpdate();
        this_.zoom=this_.network.canvasToDOM({x:0,y:1}).y-this_.network.canvasToDOM({x:0,y:0}).y;
        console.log(this_.zoom);
      },
      resetAllNodes() {
        this.setNetworkData(this.nodesArray,this.edgesArray);
      },
      resetAllNodesStabilize() {
        let this_ = this;
        this_.resetAllNodes();
        this_.network.stabilize();
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
          scale: this_.isFullScreen?1.5:1,
          offset: {x:0, y:0},
        });
        console.log( this.nodes,this.edges);
        if(this_.isFullScreen) {
          console.log(this_.viewsCenter)
        }
        this.$nextTick(()=>{
          this_.modelTopUpdate();
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
          model={...model,...this.network.DOMtoCanvas({x:40,y:40})};
        }
        nodesArray.push(model);
        this.$emit("setTopologyData",nodesArray,this.edgesArray);
        this.setNetworkData(nodesArray,this.edgesArray);
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
        console.log(edges);
        if(!edges){return}
        let edgesArray =[...this.edgesArray];
       if(!this.isLineAdd){
         console.log(edgesArray.find(item=>item.id ===edges.id));
         edges={...edgesArray.find(item=>item.id===edges.id),...edges};
         edgesArray=edgesArray.filter(item=>item.id!==edges.id);
       }else{
         edges.from=this.NodeArr[0];
         edges.to=this.NodeArr[1];
         edges.dashes=[15,15];
       }
       edgesArray.push(edges);
       console.log(edgesArray,edges);
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
        console.log(this.nodesArray);
        this.$emit("setTopologyData",this.nodesArray,this.edgesArray);
      },
      setPopPosition(selId,params){//设置节点工具栏位置
        console.log(selId);
        if(!selId){return}
        let position=this.network.canvasToDOM(this.network.getPositions([selId])[selId]);
        this.networkPop.style.top = position.y - 85 + 7*(10-this.zoom*10)+'px';
        this.networkPop.style.left = position.x - 32*this.zoom - 5*(1-this.zoom*1) +'px';
        if(!this.isFullScreen&&this.NodeArr.length==0){
          this.networkPopShow=true;
        }
        this.NodeArr=[...this.NodeArr]
      },
      networkPopClose(){//关闭节点工具栏
        this.networkPopShow=false;
        this.selNodeId=''
        this.network.unselectAll();
      },
      //工具栏
      nodeDel(){
        let nodesArray=this.nodesArray.filter((item)=>item.id!==this.selNodeId);
        let edgesArray=this.edgesArray.filter((item)=>item.from!==this.selNodeId || this.to!==this.selNodeId);
        this.$emit('setTopologyData',nodesArray, edgesArray);
        this.setNetworkData(nodesArray, edgesArray);
        this.networkPopClose();
      },
      nodeEdit(){
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
        if(id=='edit'){
          this.nodeEdit()
        }

      },
      modelTopUpdate(){//model上的图标 实时更新
        this.modelTop=[];
        this.nodesArray.forEach((item)=>{
          let position=this.network.canvasToDOM({x:item.x,y:item.y});
          if(item.id===1){console.log(position)};
          this.modelTop.push({
            show:true,
            x:position.x,
            y:position.y,
            id:item.id,
          })
        })
      },
      selNodeArrUpdate(){// 选中狂位置更新
        this.NodeArr.forEach((id,index)=>{
          let selNode = this.nodesArray.find(item=>item.id===id);
          let position=this.network.canvasToDOM({x:selNode.x,y:selNode.y});
          document.getElementById('nodeArr'+(index+1)).style.top=position.y+'px';
          document.getElementById('nodeArr'+(index+1)).style.left=position.x+'px';
        })
      },
      modelTopMouseDown(item,index){
        console.log(this.$refs['modelTopId'+index]);
       this.$refs['modelTopId'+index][0].addEventListener('mousemove',this.modelTopMouseMove)
      },
      modelTopMouseUp(item,index){
        console.log(this.$refs['modelTopId'+index]);
        this.$refs['modelTopId'+index][0].removeEventListener('mousemove',this.modelTopMouseMove);
      },
      modelTopMouseMove(e){
        console.log(e)
      }
    },
    mounted(){
       setTimeout(()=>{
         let this_=this;
         this.init('modal');
         this.network.on("click", function (params) {
           let selId=params.nodes[0];
           this_.networkPopClose();
           if(selId){
             this_.selNodeId=selId;
             this_.cursorMove=true;
             this_.nodeData=this_.nodesArray.find((item)=>item.id==selId);
             console.log(this_.NodeArr.indexOf(selId));
             if(this_.NodeArr.indexOf(selId)!==-1){
                let index = this_.NodeArr.indexOf(selId);
                this_.NodeArr=this_.NodeArr.filter((item,i)=> i != index);
                return
             }
             if(this_.selectNodeTitle){
               this_.NodeArr.push(selId);
               this_.network.selectNodes(this_.NodeArr,true);
               return
             }
             this_.setPopPosition(selId,params);
           }
         });

         this.network.on("selectEdge", function (params) { // 选择边
           this_.lineData=this_.edgesArray.find((item)=>item.id===params.edges[0]);
           this_.lineData.color=this_.lineData.color.color;
           this_.addLineShow=true;
           this_.isLineAdd=false;
           console.log(this_.lineData)
         });

         this.network.on("dragStart", function (params) {//节点移动开始
           this_.networkPopShow=false;
           this_.NodeArrShow=false;
           let selId=params.nodes[0];
           if(selId){
             this_.modelTop.find(item=>item.id===selId).show=false;
           }
           if(!selId){
             this_.modelTop.forEach(item=>{
               item.show=false;
             })
           }
         });

         this.network.on("dragging", function (params,event) {//节点移动中

         });

         this.network.on("dragEnd", function (params) {//节点移动结束
           this_.viewsCenter=this_.network.getViewPosition();
           let selId=params.nodes[0];
           if(selId){
             this_.setPopPosition(selId,params);
             this_.setNodePosition(selId)
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
           // this_.zoom=Math.round(params.scale*100)/100-0.1;
           this_.zoom=params.scale;
           // console.log(this_.nodesArray);
           // console.log(this_.network.getPositions());
           this_.modelTopUpdate();
           this_.selNodeArrUpdate();
           this_.setPopPosition(this_.selNodeId);
           console.log(this_.zoom);
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
  .editTopology{
    width: 100%;
    height: 28px;
  }
  .network{
    display: flex;
    height: calc(100% - 30px);
    position: relative;
    overflow: hidden;
  }
  .networkPop{
    position: absolute;
    z-index: 10;
    /*border: 1px solid #e6e6e6;*/
    border-radius: 5px;
    height: 32px;
    /*background: #fff;*/
    padding: 0 3px;
    line-height: 32px;
  }
  .networkPop .nz-icon-hexagonBorder{
    position: absolute;
    font-size: 48px;
    color: #84d5c2;
  }
  .networkPop  .nz-icon-liubianxing{
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
  .networkPop .nz-icon-hexagonBorder:hover{
    transform: scale(1.2);
  }
  .networkPop .nz-icon-hexagonBorder:hover .nz-icon-liubianxing{
    transform: scale(1.1);
    left: 4px;
    font-size: 41px;
  }
  .networkPop .nz-icon-hexagonBorder:hover .noMove{
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
  #network_id{
    width: 90%;
    height: 100%;
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
  .editTopology{
    color: #1a1a1a;
    font-size: 18px;
    font-weight: bold;
  }
  .editTopologyModule,.editTopologyLineCancel{
    margin-left: 30px;
  }
  .editTopologyLine{
    margin-left: 130px;
  }
  .editTopologyAdd,.editTopologyRemove,.editTopologyCancel{
    color: #1989fa;
    margin-left: 30px;
    cursor: pointer;
  }
  .selNode{
    position: absolute;
    width: 0;
    height: 0;
  }
  .selNodeTop {
    width: 120px;
    height: 0;
    border-top: 4px dashed yellow;
    position: absolute;
    left: -60px;
    top: -60px;
  }
  .selNodeRight {
    width: 0px;
    height: 120px;
    border-right: 4px dashed yellow;
    position: absolute;
    left: 60px;
    top: -60px;
  }
  .selNodeBottom {
    width: 120px;
    height: 0;
    border-bottom: 4px dashed yellow;
    position: absolute;
    left: -60px;
    top: 60px;
  }
  .selNodeLeft {
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
</style>
