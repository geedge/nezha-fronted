<template>
    <div id="network_id" class="network" style="height:800px"></div>
</template>

<script>
  import Vis from 'vis'

  import  png from './a.png'

  export default {
    name: 'home',
    data () {
      return {
        nodes:[],
        edges:[],
        // network:null,
        container:null,
        nodesArray:[
          { id: 0, label: "model", group: 0,
            image: png, shape:'image',shapeProperties:{useImageSize:false},
            chosen:{
              node:(values, id, selected, hovering)=>{
                console.log(values, id, selected, hovering);
              }
            }},
          {id: 1, label: "model", group: 0, image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 2, label: "model", group: 0, image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 3, label: "model", group: 1, image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 4, label: "model", group: 1, image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 5, label: "model", group: 1, image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 6, label: "model", group: 2, image: png, shape:'image',shapeProperties:{useImageSize:false}},
        ],

        edgesArray:[
          {id: 0,from: 1, to: 0,label:"hahah",arrows:'from;to'},
          {id: 1,from: 2, to: 0},
          {id: 2,from: 4, to: 3},
          {id: 3,from: 3, to: 0},
          {id: 4,from: 3, to: 5},
          {id: 5,from: 0, to: 6},
        ],
        options:{},
        data:{}
      }

    },

    methods:{
      init(){
        let this_ = this;
        this_.nodes = new Vis.DataSet(this_.nodesArray);
        this_.edges = new Vis.DataSet(this_.edgesArray);
        this_.container = document.getElementById('network_id');
        this_.data = {
          nodes: this_.nodes,
          edges: this_.edges
        };
        this_.options = {
          autoResize: true,
          groups:{
            useDefaultGroups: true,
            myGroupId:{
              /*node options*/
            }
          },
          nodes: {
            shape: 'dot',
            size: 30,
            font: {
              size: 32,
            },
            borderWidth: 2
          },

          edges: {
            width: 2,
            smooth:{  //设置两个节点之前的连线的状态
              enabled: false  //默认是true，设置为false之后，两个节点之前的连线始终为直线，不会出现贝塞尔曲线
            }
          },
          physics: { //计算节点之前斥力，进行自动排列的属性
            enabled: true, //默认是true，设置为false后，节点将不会自动改变，拖动谁谁动。不影响其他的节点
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
            dragView: false, //是否能拖动画布
            hover: true, //鼠标移过后加粗该节点和连接线
            multiselect: true, //按 ctrl 多选
            selectable: true, //是否可以点击选择
            selectConnectedEdges: false, //选择节点后是否显示连接线
            hoverConnectedEdges: true, //鼠标滑动节点后是否显示连接线
            zoomView: false //是否能缩放画布
          },

          manipulation: {  //该属性表示可以编辑，出现编辑操作按钮
            enabled: true,
            addNode: function(nodeData,callback) {
              nodeData.label = 'hello world';
              callback(nodeData);
            }
          },
        };
        this_.network = new Vis.Network(this_.container, this_.data, this_.options);
        this_.network.on('click',function(properties){
          console.log(properties);
        })
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
      }

    },

    mounted(){
      this.init();
      this.network.on("click", function (params) {
        params.event = "[original event]";
        document.getElementById('eventSpan').innerHTML = '<h2>Click event:</h2>' + JSON.stringify(params, null, 4);
        console.log('click event, getNodeAt returns: ' + this.getNodeAt(params.pointer.DOM));
      });

    }

  }

</script>

<style scoped>

</style>
