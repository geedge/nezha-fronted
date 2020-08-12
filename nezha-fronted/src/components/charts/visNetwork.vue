<template>
    <div class="nz-chart-resize" v-clickoutside="networkPopClose">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-table" ref="resizeBox">
      <div class="chart-table" :id="'chartTableDiv'+chartIndex" @mouseenter="caretShow=true" @mouseleave="caretShow=false">
        <loading :ref="'localLoading'+chartIndex"></loading>
        <div class="clearfix chartTitle" :class="{'dragTitle':dragTitleShow}" :id="'chartTitle'+chartIndex">
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
          <el-dropdown trigger="click" class="nz-chart-top" :key="'chartDropdown'+chartIndex"  v-clickoutside="clickos">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <span class="el-dropdown-link chart-title" @click="dropdownMenuShow=!dropdownMenuShow">
              <span class="chart-title-text">{{chartData.title}}</span>
              <span class="chart-title-icon"><i class="el-icon-caret-bottom el-icon--right"  :class="{'visible':caretShow,'hidden':!caretShow}"></i></span>
            </span>
            <ul slot="dropdown" v-show="dropdownMenuShow"  :id="'dropdownUl'+chartIndex"  class="el-dropdown-menu nz-chart-dropdown"  style="position: absolute; top: 30px; left: calc(50% - 79px); transform-origin: center top; z-index: 1000;" >
              <li  @click="refreshChart"  class="el-dropdown-menu__item">
                <i class="global-active-color el-icon-refresh-right" style="font-size: 16px;"></i><span>{{$t('dashboard.refresh')}}</span></li>
              <li  @click="editChart"  class="el-dropdown-menu__item">
                <i class="nz-icon nz-icon-edit" style="font-size: 14px; margin-right: 11px; margin-left: 1px;"></i>{{$t('dashboard.edit')}}</li>
              <li  @click="removeChart"  class="el-dropdown-menu__item">
                <i class="el-icon-delete" style="font-size: 16px;"></i>{{$t('dashboard.delete')}}</li>
              <li  @click="showAllScreen"  class="el-dropdown-menu__item">
                <i class="el-icon-full-screen" style="font-size: 16px;"></i>{{$t('dashboard.screen')}}</li>
              <li  @click="duplicate"  class="el-dropdown-menu__item">
                <i class="el-icon-copy-document" style="font-size: 16px;"></i>{{$t('dashboard.duplicate')}}</li>
            </ul>
          </el-dropdown>
        </div>
        <div class="mt-10 table-container">
          <div class="network">
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
        </div>
        <!--全屏-->
        <el-dialog class="nz-dialog table-chart-dialog" :title="$t('dashboard.panel.view')"  :visible.sync="screenModal" width="96%"  @close="screenModal = false" >
          <div slot="title">
            <!--<span class="nz-dialog-title">{{data.title}}</span>-->
            <div class="float-right panel-calendar dialog-tool">
              <time-picker ref="calendarPanel" class="nz-dashboard-picker" style="margin-top: -12px;" @change="dateChange"></time-picker>
            </div>
          </div>
          <div id="network_id2" ref="visNetwork"></div>
          <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
        <span class="vue-resizable-handle" @mousedown="startResize"></span>
      </div>

    </div>
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
  import Vis from 'vis'
  import  png from './a.png'
  import bus from '../../libs/bus';
  import {Loading} from 'element-ui';
  import chartDataFormat from './chartDataFormat'
  import loading from "../common/loading";
  import timePicker from '../common/timePicker'
  import addNode from './addNode'
  import addLine from './addLine'
  export default {
    name: 'home',
    components: {
      'loading': loading,
      'time-picker':timePicker,
      'add-model':addNode,
      'add-line':addLine,
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
    watch:{
      NodeArr(n){
        if(n.length==2){
          this.addLineShow=true;
          this.selectNodeTitle=false;
        }
      }
    },
    data () {
      return {
        //其他
        tableHeight: 0,
        data: {}, // 该图表信息,chartItem
        unit:{},
        isError:false,
        errorContent:'',
        pageSizes:[50,100,200],
        pageObj: {
          pageNo: 1,
          pageSize: 50,
          total: 0
        },
        screenPageObj:{
          pageNo: 1,
          pageSize: 50,
          total: 0
        },
        storedTableData:[],
        storedScreanTableData:[],
        seriesItem: [], // 保存信息
        seriesItemScreen:[],//全屏数据
        images: '',
        loading:Object,
        items: {
          metric_name: [], // 每条数据列名称
          xAxis: [],
          theData: [], // series数据组
        },
        panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
        firstLoad: true, // 是否第一次加载
        chartType: 'table', // 图表类型
        screenModal: false,
        // 查询数据使用
        filter: {
          start_time: '',
          end_time: '',
        },
        stableFilter: {}, // 保存数据使用,初始化起止时间,单图or多图等
        firstShow: false, // 默认不显示操作按钮,
        caretShow:false,
        dragTitleShow:false,
        dropdownMenuShow:false,
        divFirstShow:false,
        selectNodeTitle:false,
        columns: [
          {
            title:'Element',
            key:'element',
            sortable: true
          }
          , {
            title: '采集时间',
            key: 'time',
            width: 160,
            render: (h, params) => h('span', bus.timeFormate(params.row.time, 'yyyy-MM-dd hh:mm:ss')),
          }, {
            title: '数值',
            key: 'value',
            width: 160,
            sortable: true,
            render: (h, params) => h('span', this.getNumStr(params.row.value)),
          }],
        searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],//全屏显示的时间
        oldSearchTime: [],

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
        nodesArray:[
          { id: 1, label: "model",
            image: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=1906469856,4113625838&fm=26&gp=0.jpg',
            shape:'image',shapeProperties:{useImageSize:false},
            x:0,y:0,
          },
          {id: 2, label: "model", x:-254,y:-59, image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 3, label: "model", x:114,y:-36, image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 4, label: "model", x:-126,y:54, image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 5, label: "model", x:125,y:67, image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 6, label: "model", x:-211,y:0, image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 7, label: "model", x:200,y:100, image: png, shape:'image',shapeProperties:{useImageSize:false}},
        ],
        edgesArray:[
          {id: 0,from: 2, to: 1,label:"hahah",arrows:'from;to', color: {color:'red',highlight:'red',hover:'red',opacity:1.0},},
          {id: 1,from: 3, to: 1,label:"hahah",arrows:'from'},
          {id: 2,from: 5, to: 4,label:"hahah",arrows:'to'},
          {id: 3,from: 4, to: 1,label:"hahah",arrows:'from;to'},
          {id: 4,from: 4, to: 6,label:"hahah",arrows:'from;to'},
          {id: 5,from: 1, to: 7,label:"hahah",arrows:'from;to'},
        ],
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
        this_.containermodal = document.getElementById('network_id2');
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
        if(type==='modal'){
          this_.network = new Vis.Network(this_.container, this_.data, this_.options);
          this_.network.moveTo({
            position: this_.viewsCenter,
            scale: 1,
            offset: {x:0, y:0},
          })
        }
        if(type=== 'screenModal'){
          if(!this_.networkScreenModal){
            this_.networkScreenModal= new Vis.Network(this_.containermodal, this_.data, this_.options);
          }else{
            this_.nodes = new Vis.DataSet(this_.nodesArray);
            this_.edges = new Vis.DataSet(this_.edgesArray);
            this_.networkScreenModal.setData({
              nodes:this_.nodes,
              edges: this_.edges
            });
          };
        }
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
        this.nodesArray.push(model);

        this.setNetworkData(this.nodesArray,this.edgesArray);
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
        this.edgesArray.push(edges);
        this.setNetworkData(this.nodesArray,this.edgesArray);
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
        console.log(this.selNodeId)
        this.nodesArray=this.nodesArray.filter((item)=>item.id!==this.selNodeId);
        this.edgesArray=this.edgesArray.filter((item)=>item.from!==this.selNodeId || this.to!==this.selNodeId);
        this.setNetworkData(this.nodesArray, this.edgesArray);
      },
      nodeEdit(){
        console.log('edit')
      },
      lineDel(){
        if(!this.lineData.id){return}
        this.edgesArray=this.edgesArray.filter((item)=>item.id!==this.lineData.id);
        console.log(this.lineData.id);
        this.setNetworkData(this.nodesArray, this.edgesArray);
      },
      // 其他
      filterShowData(source,pageObj){
        return source.slice((pageObj.pageNo-1)*pageObj.pageSize,pageObj.pageNo*pageObj.pageSize)
      },
      startResize(e) {
        let vm = this;
        this.$chartResizeTool.start(vm, this.data, e);
      },
      screenPageNo(val) {
        this.screenPageObj.pageNo = val;
        this.seriesItemScreen=this.filterShowData(this.storedScreanTableData, this.screenPageObj)
      },
      screenPageSize(val) {
        this.screenPageObj.pageSize = val;
        this.seriesItemScreen=this.filterShowData(this.storedScreanTableData, this.screenPageObj)
      },
      startLoading(area){
        if(area==='screen'){
          this.$refs['localLoadingScreen'+this.chartIndex].startLoading();
        }else {
          this.$refs['localLoading'+this.chartIndex].startLoading();
        }
      },
      endLoading(area){
        if(area==='screen'){
          this.$refs['localLoadingScreen'+this.chartIndex].endLoading();
        }else {
          this.$refs['localLoading'+this.chartIndex].endLoading();
        }
      },
      resize(chartItem) {
        let deHeight = this.$chartResizeTool.titleHeight+this.$chartResizeTool.chartTableBlankHeight;
        let container = document.querySelector('#chartTableDiv' + this.chartIndex + " .table-container");
        container.style.height = `calc(100% - ${deHeight*2}px)`;
        this.tableHeight = `calc(100% - ${this.$refs.Pagination.$el.offsetHeight}px)`;
        this.$nextTick(() => {
          container.querySelector(".el-table__body-wrapper")._ps_.update();
        });
      },
      showLoad(chartItem) {
        //设置高度 chart-table
        this.$nextTick(() => {
          this.resize(chartItem);
        });
        this.startLoading();
        this.divFirstShow = true;
      },
      // 重新请求数据 刷新操作-local
      refreshChart() {
        this.dropdownMenuShow=false;
        this.startLoading();
        this.firstShow = false;
        this.$emit('on-refresh-data', this.data.id);
      },
      // 编辑图表
      editChart() {
        this.dropdownMenuShow=false;
        this.$emit('on-edit-chart-block', this.data.id);
      },
      // 删除该图表
      removeChart() {
        this.dropdownMenuShow=false;
        this.$emit('on-remove-chart-block', this.data.id);
      },
      //全屏时间条件查询
      dateChange(time) {
        this.searchTime = [...time];
        this.seriesItemScreen = [];
        for(let i=0;i<8;i++){
          this.seriesItemScreen.push({//表格数据
            element:'',
            time: '',//采集时间
            value: '',//数值
          });
        }
        this.startLoading('screen');
        this.$emit('on-search-data', this.data.id, this.searchTime);
      },
      clickos() {
        this.dropdownMenuShow=false;
      },
      clearChart(){
        this.data = {};
      },
      duplicate(){
        this.dropdownMenuShow=false;
        const param = {id:this.data.id};
        this.$post('panel/'+ this.data.panelId+'/charts/duplicate',(param)).then(response => {
          if (response.code === 200) {
            this.$message({
              duration: 2000,
              type: 'success',
              message: this.$t("tip.duplicateSuccess")
            });
            this.$emit('on-duplicate-chart-block', this.data.id,response.data);
          }else {
            if(response.msg){
              this.$message.error(response.msg);
            }else if(response.error){
              this.$message.error(response.error);
            }else {
              this.$message.error(response);
            }
          }
        });
      },
      // 全屏查看
      showAllScreen() {
        this.dropdownMenuShow=false;
        // 初始化同步时间
        this.searchTime = [];
        this.$set(this.searchTime, 0, this.oldSearchTime[0]);
        this.$set(this.searchTime, 1, this.oldSearchTime[1]);
        this.$refs.calendarPanel.setCustomTime(this.searchTime);

        this.seriesItemScreen = this.seriesItem;
        this.screenModal = true;
        this.$nextTick(()=>{
          this.init('screenModal');
        })
      },
      // 设置数据, filter区分
      setData(chartItem, seriesItem, panelId, filter,area,errorMsg) {
        if(errorMsg && errorMsg!==''){
          this.isError = true;
          this.errorContent = errorMsg;
        }else {
          this.isError = false;
          this.errorContent = '';
        }
        if(area==='showFullScreen'){//全屏按时间查询
          this.data = chartItem;
          this.unit = chartDataFormat.getUnit(this.data.unit);
          this.searchTime[0] = filter.start_time;//将列表的查询时间复制给全屏的查询时间
          this.searchTime[1] = filter.end_time;
          // this.seriesItemScreen = seriesItem;
          this.storedScreanTableData=seriesItem;
          this.storedScreanTableData=Object.assign([],this.storedScreanTableData.reverse());
          this.screenPageObj.total=this.storedScreanTableData.length;
          this.seriesItemScreen=this.filterShowData(this.storedScreanTableData,this.screenPageObj);
          this.endLoading('screen');
        } else{
          //设置高度 chart-table
          this.divFirstShow = true;
          this.$nextTick(() => {
            this.resize(chartItem);
          });
          this.firstShow = true; // 展示操作按键

          this.panelIdInner = panelId;
          this.data = chartItem;
          this.unit = chartDataFormat.getUnit(this.data.unit);
          this.storedTableData =seriesItem;
          this.storedScreanTableData=seriesItem;
          this.storedTableData=Object.assign([],this.storedTableData.reverse());
          this.storedScreanTableData=Object.assign([],this.storedScreanTableData.reverse());
          this.pageObj.total=this.storedTableData.length;
          this.screenPageObj.total=this.storedScreanTableData.length;
          this.seriesItem=this.filterShowData(this.storedTableData,this.pageObj);
          this.seriesItemScreen =this.filterShowData(this.storedScreanTableData,this.screenPageObj)
          if (filter) { // 保存数据,用于同步时间
            this.searchTime[0] = filter.start_time;//将列表的查询时间复制给全屏的查询时间
            this.searchTime[1] = filter.end_time;
            this.oldSearchTime[0] = this.searchTime[0];
            this.oldSearchTime[1] = this.searchTime[1];
          }
          this.endLoading();
        }
      },
      dealLegendAlias:function(legend,expression){
        if(/\{\{.+\}\}/.test(expression)){
          let labelValue=expression.replace(/(\{\{.+?\}\})/g,function(i){
            let label=i.substr(i.indexOf('{{')+2,i.indexOf('}}')-i.indexOf('{{')-2)
            let reg=new RegExp(label+'=".+?"')
            let value=null;
            if(reg.test(legend)){
              let find=legend.match(reg)[0];
              value=find.substr(find.indexOf('"')+1,find.lastIndexOf('"')-find.indexOf('"')-1);
            }
            return value?value:label;
          })
          return labelValue
        }else{
          return expression;
        }
      },
      // 获取格式
      getNumStr(num) {
        if (num) {
          if (num >= 1000) {
            const kbNum = num / 1000;
            if (kbNum >= 1000) {
              const mbNum = kbNum / 1000;
              if (mbNum >= 1000) {
                const gbNum = mbNum / 1000;
                if (gbNum >= 1000) {
                  const tbNum = gbNum / 1000;
                  if (tbNum >= 1000) {
                    const pbNum = tbNum / 1000;
                    return `${pbNum.toFixed(2)}PB`;
                  }
                  return `${tbNum.toFixed(2)}TB`;
                }
                return `${gbNum.toFixed(2)}GB`;
              }
              return `${mbNum.toFixed(2)}MB`;
            }
            return `${kbNum.toFixed(2)}KB`;
          }
          return num.toFixed(2);
        }
        return num;
      },

    },

    mounted(){
      this.firstLoad = false;
      setTimeout(()=>{
        let this_=this;
        this.init('modal');
        this.network.on("click", function (params) {
          // params.event = "[original event]";
          // document.getElementById('eventSpan').innerHTML = '<h2>Click event:</h2>' + JSON.stringify(params, null, 4);
          console.log(params);
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
<style lang="scss">
  @import './chart.scss';
</style>
<style scoped>
  .table-container{
    height: calc(100% - 30px);
  }
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
