<template>
  <div>
    <div class="network"  v-clickoutside="networkPopClose">
      <!--图拓扑图-->
      <div id="network_id" ref="visNetwork" :class="{'cursorMove': cursorMove}"></div>
      <!--拓扑图工具-->
      <div
        id="networkPop"
        class="networkPop"
        :style="{'top':networkPopTop,'left':networkPopLeft}"
        v-show="networkPopShow"
      >
        <i class="nz-icon nz-icon-edit" @click.stop="nodeEdit"></i>
        <i class="nz-icon nz-icon-delete" @click="nodeDel"></i>
        <div class="btmTriangle"></div>
      </div>
      <!--图谱图右侧-->
      <div class="networkContent">33333</div>
    </div>
    <button @click="addModelShow" v-show="!selectNodeTitle">add model</button>
    <button @click="addLineTitleShow" v-show="!selectNodeTitle">add line</button>
    <button @click="lineDel" v-show="!selectNodeTitle">remove line</button>
    <span v-show="selectNodeTitle">请选择两个节点 <button @click="closeAddLine">取消</button></span>
    <el-dialog
      :visible.sync="addNodeShow">
      <add-model @addModel="addModel" :nodeData="nodeData"></add-model>
    </el-dialog>
    <el-dialog
      :visible.sync="addLineShow">
      <add-line @addLine="addLine" @lineDel="lineDel" :selectNode="NodeArr" :lineData="lineData"></add-line>
    </el-dialog>
  </div>
</template>

<script>
  import  png from './a.png'
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
    },
    watch:{
      NodeArr(n){
        if(n.length==2){
          this.addLineShow=true;
          this.selectNodeTitle=false;
        }
      }
    },
    data(){
		  return {
        selectNodeTitle:false,
        // 拓扑图工具
        networkPopTop:0,
        networkPopLeft:0,
        networkPopShow:false,
        addNodeShow:false,
        addLineShow:false,
        cursorMove:false,
        NodeArr:[],
        selNodeId:'',
        lineData:{},
        nodeData:{},
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
        this_.container = document.getElementById('network_id');
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
            font: {
              size: 16,
            },
            borderWidth: 2,
            // chosen:{
            //   node:(values, id, selected, hovering)=>{
            //     console.log(values, id, selected, hovering);
            //    if(hovering){
            //      this_.cursorMove=true;
            //    }
            //   }
            // }
          },

          edges: {
            width: 2,
            smooth:{  //设置两个节点之前的连线的状态
              enabled: false  //默认是true，设置为false之后，两个节点之前的连线始终为直线，不会出现贝塞尔曲线
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
            zoomView: false, //是否能缩放画布
            navigationButtons:true,
          },

          manipulation: {  //该属性表示可以编辑，出现编辑操作按钮
            enabled: false,
          },
        };
        this_.network = new Vis.Network(this_.container, this_.data, this_.options);
        this_.network.moveTo({
          position: this_.viewsCenter,
          scale: 1,
          offset: {x:0, y:0},
        })
        this_.containerCanvas=document.querySelectorAll("#network_id canvas")[0];
      },
      resetAllNodes() {
        let this_ = this;
        this_.nodes.clear();
        this_.edges.clear();
        this_.nodes.add(this_.nodesArray);
        this_.edges.add(this_.edgesArray);
        this_.data = {
          nodes: this_.nodes,
          edges: this_.edges
        };
        this_.network = new Vis.Network(this_.container, this_.data, this_.options);
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
          scale: 1,
          offset: {x:0, y:0},
        })
      },
      addModel(model){ // 添加model
        this.addNodeShow=false;
        if(!model){return}
        model={...model,...this.network.DOMtoCanvas({x:model.x,y:model.y})};
        if(!model.image){
          model.image=png
        }
        let nodesArray=[...this.nodesArray];
        nodesArray.push(model);
        this.$emit("setTopologyData",nodesArray,this.edgesArray,this.setNetworkData);
      },
      addModelShow(){ // 显示添加节点弹窗
        this.addNodeShow=true;
      },
      addLine(edges){ // 添加line
        this.addLineShow=false;
        console.log(edges);
        if(!edges){return}
        edges.from=this.NodeArr[0];
        edges.to=this.NodeArr[1];
        let edgesArray =[...this.edgesArray].push(edges);
        this.$emit("setTopologyData",this.nodesArray,edgesArray,this.setNetworkData);
        this.NodeArr=[];
      },
      addLineTitleShow(){ // 显示添加线弹窗
        // this.addLineShow=true;
        this.selectNodeTitle=true;
      },
      closeAddLine(){
        this.selectNodeTitle=false;
        this.NodeArr=[];
      },
      setNodePosition(selId){ // 移动节点后 设置节点坐标
        let position = this.network.getPositions([selId]);
        let selItem = this.nodesArray.find((item)=>item.id===selId);
        this.nodeData = selItem;
        selItem.x=position[selId].x;
        selItem.y=position[selId].y;
        this.$emit("setTopologyData",this.nodesArray,this.edgesArray);
      },
      setPopPosition(selId,params){//设置节点工具栏位置
        let position=this.network.canvasToDOM(this.network.getPositions(params.nodes)[selId]);
        this.networkPop.style.top = position.y - 70 +'px';
        this.networkPop.style.left = position.x - 30 +'px';
        this.networkPopShow=true;
      },
      networkPopClose(){//关闭节点工具栏
        this.networkPopShow=false;
      },
      //工具栏
      nodeDel(){
        let nodesArray=this.nodesArray.filter((item)=>item.id!==this.selNodeId);
        let edgesArray=this.edgesArray.filter((item)=>item.from!==this.selNodeId || this.to!==this.selNodeId);
        this.$emit('setTopologyData',nodesArray, edgesArray,this.setNetworkData);
        this.networkPopClose();
      },
      nodeEdit(){
        console.log('edit')
      },
      lineDel(){
        if(!this.lineData.id){return}
        let edgesArray=this.edgesArray.filter((item)=>item.id!==this.lineData.id);
        this.$emit('setTopologyData',this.nodesArray, edgesArray,this.setNetworkData);
      },
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
            this_.setPopPosition(selId,params);
            if(this_.selectNodeTitle){
              this_.NodeArr.push(selId);
              this_.network.selectNodes(this_.NodeArr,true)
            }
          }
        });

        this.network.on("selectEdge", function (params) {
          this_.lineData.id=params.edges[0];
          console.log(this_.lineData.id);
        });

        this.network.on("dragStart", function (params) {//节点移动开始
          // params.event = "[original event]";
          // document.getElementById('eventSpan').innerHTML = '<h2>Click event:</h2>' + JSON.stringify(params, null, 4);
          // console.log('click event, getNodeAt returns: ' + this.getNodeAt(params.pointer.DOM),params);
          // console.log( this_.network.getPositions());
          this_.networkPopShow=false;
        });

        this.network.on("dragging", function (params,event) {//节点移动中

        });

        this.network.on("dragEnd", function (params) {//节点移动结束
          this_.viewsCenter=this_.network.getViewPosition();
          let selId=params.nodes[0];
          if(selId){
            this_.setPopPosition(selId,params)
            this_.setNodePosition(selId)
          }
        });
        this.network.on("hoverNode", function (params) {//hoverNode
          this_.cursorMove=true;
          console.log(params);
        });
        this.network.on("blurNode", function (params) {//blurNode
          this_.cursorMove=false;
          // console.log(params);
        });
      });

    }
	}
</script>

<style scoped>
  .network{
    display: flex;
    height: calc(100% - 30px);
    position: relative;
  }
  .networkPop{
    position: absolute;
    z-index: 10;
    border: 1px solid #e6e6e6;
    border-radius: 5px;
    height: 32px;
    background: #fff;
    padding: 0 3px;
    line-height: 32px;
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
    width: 60%;
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
</style>
