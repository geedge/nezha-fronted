<template>
    <div class="nz-chart-resize">
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
          <div id="network_id" class="network"></div>
          <button @click="addModel">add model</button>
          <button @click="addLine">add line</button>
        </div>
        <!--全屏-->
        <el-dialog class="nz-dialog table-chart-dialog" :title="$t('dashboard.panel.view')"  :visible.sync="screenModal" width="96%"  @close="screenModal = false" >
          <div slot="title">
            <!--<span class="nz-dialog-title">{{data.title}}</span>-->
            <div class="float-right panel-calendar dialog-tool">
              <time-picker ref="calendarPanel" class="nz-dashboard-picker" style="margin-top: -12px;" @change="dateChange"></time-picker>
            </div>
          </div>
          1111111111
          <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
        <span class="vue-resizable-handle" @mousedown="startResize"></span>
      </div>
    </div>
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
  export default {
    name: 'home',
    components: {
      'loading': loading,
      'time-picker':timePicker
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


        // 拓扑图数据

        nodes:[],
        edges:[],
        // network:null,
        container:null,
        nodesArray:[
          { id: 0, label: "model",
            image: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=1906469856,4113625838&fm=26&gp=0.jpg', shape:'image',shapeProperties:{useImageSize:false},
            chosen:{
              node:(values, id, selected, hovering)=>{
                console.log(values, id, selected, hovering);
              }
            },
            physics:false,
            x:0,y:0
          },
          {id: 1, label: "model", x:0,y:10, physics:false,image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 2, label: "model", x:10,y:20, physics:false,image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 3, label: "model", x:10,y:30, physics:false,image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 4, label: "model", x:0,y:40, physics:false,image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 5, label: "model", x:0,y:50, physics:false,image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 6, label: "model", x:10,y:50, physics:false,image: png, shape:'image',shapeProperties:{useImageSize:false}},
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

      //拓扑图方法
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
            dragView: false, //是否能拖动画布
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
      },
      addModel(){ // 添加model
        console.log(this.network);
        let model={
          id: 7,
          label: "model",
          group: 0,
          image: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=1906469856,4113625838&fm=26&gp=0.jpg',
          shape:'image',
          shapeProperties:{useImageSize:false},
          chosen:{
              node:(values, id, selected, hovering)=>{
                console.log(values, id, selected, hovering);
              }
          },
          x:-100,
          y:-100,
          physics:false,
        };
        this.nodesArray.push(model);
        // this.resetAllNodes();
        this.setNetworkData(this.nodesArray,this.edgesArray);
      },
      addLine(){ // 添加line
        let edges= {id: 7,from: 7, to: 0,label:"hahah",arrows:'from;to'};
        this.edgesArray.push(edges);
        this.setNetworkData(this.nodesArray,this.edgesArray);
      },

      setNodePosition(selId){ // 移动节点后 设置节点坐标
        let position = this.network.getPositions([selId]);
        let selItem = this.nodesArray.find((item)=>item.id===selId);
        console.log(selItem);
        selItem.x=position[selId].x;
        selItem.y=position[selId].y;
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
        let this_=this
        this.init();
        this.network.on("click", function (params) {
          // params.event = "[original event]";
          // document.getElementById('eventSpan').innerHTML = '<h2>Click event:</h2>' + JSON.stringify(params, null, 4);
          console.log('click event, getNodeAt returns: ' + this.getNodeAt(params.pointer.DOM),params);
        });
        this.network.on("dragEnd", function (params) {
          // params.event = "[original event]";
          // document.getElementById('eventSpan').innerHTML = '<h2>Click event:</h2>' + JSON.stringify(params, null, 4);
          console.log('click event, getNodeAt returns: ' + this.getNodeAt(params.pointer.DOM),params);
          console.log( this_.network.getPositions());
          let selId=params.nodes[0];
          this_.setNodePosition(selId)
        });
      })
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
    height: calc(100% - 30px);
  }
</style>
