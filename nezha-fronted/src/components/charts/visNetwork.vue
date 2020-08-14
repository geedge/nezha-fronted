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
          <el-dropdown trigger="click" class="nz-chart-top" :key="'chartDropdown'+chartIndex"  v-clickoutside="clickos">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <span class="el-dropdown-link chart-title" @click="dropdownMenuShow=!dropdownMenuShow">
              <span></span>
              <span>
                <span class="chart-title-text">{{chartData.title}}</span>
                <span class="chart-title-icon"><i class="el-icon-caret-bottom el-icon--right"  :class="{'visible':caretShow,'hidden':!caretShow}"></i></span>
              </span>
              <span>
                <i class="nz-icon nz-icon-edit float-right"></i>
                <i class="nz-icon nz-icon-zoomin float-right"></i>
                <i class="nz-icon nz-icon-exit-full-screen float-right"></i>
              </span>
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
          <topology :nodesArray="nodesArray" :edgesArray="edgesArray" @setTopologyData="setTopologyData" :isFullScreen="false" ref="topology"></topology>
        </div>
        <!--全屏-->
        <el-dialog class="nz-dialog table-chart-dialog" :title="$t('dashboard.panel.view')"  :visible.sync="screenModal" width="96%"  @close="exitFull">
          <div slot="title">
            <!--<span class="nz-dialog-title">{{data.title}}</span>-->
            <div class="float-right panel-calendar dialog-tool">
              <time-picker ref="calendarPanel" class="nz-dashboard-picker" style="margin-top: -12px;" @change="dateChange"></time-picker>
            </div>
          </div>
          <topology :nodesArray="nodesArray" :edgesArray="edgesArray" @setTopologyData="setTopologyData" :isFullScreen="true" ref="topologyFull"></topology>
          <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
        <span class="vue-resizable-handle" @mousedown="startResize"></span>
      </div>

    </div>
  </div>
</template>

<script>
  import  png from './a.png'
  import bus from '../../libs/bus';
  import {Loading} from 'element-ui';
  import chartDataFormat from './chartDataFormat'
  import loading from "../common/loading";
  import timePicker from '../common/timePicker';
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
        nodesArray:[
          { id: 1, label: "model",
            image: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=1906469856,4113625838&fm=26&gp=0.jpg',
            shape:'image',shapeProperties:{useImageSize:false},
            x:1,y:-63,
          },
          {id: 2, label: "model", x:-236,y:-163, image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 3, label: "model", x:-346,y:-155, image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 4, label: "model", x:-129,y:169, image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 5, label: "model", x:-388,y:35, image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 6, label: "model", x:-345,y:-53, image: png, shape:'image',shapeProperties:{useImageSize:false}},
          {id: 7, label: "model", x:316,y:22, image: png, shape:'image',shapeProperties:{useImageSize:false}},
        ],
        edgesArray:[
          {id: 0,from: 2, to: 1,label:"hahah",arrows:'from;to', color: {color:'#ff4500',highlight:'#ff4500',hover:'#ff4500',opacity:1.0}},
          {id: 1,from: 3, to: 1,label:"hahah",arrows:'from',smooth:true, color: {color:'#1e90ff',highlight:'#1e90ff',hover:'#1e90ff',opacity:1.0}},
          {id: 2,from: 5, to: 4,label:"hahah",arrows:'to',smooth:true, color: {color:'#1e90ff',highlight:'#1e90ff',hover:'#1e90ff',opacity:1.0}},
          {id: 3,from: 4, to: 1,label:"hahah",arrows:'from;to',smooth:true, color: {color:'#1e90ff',highlight:'#1e90ff',hover:'#1e90ff',opacity:1.0}},
          {id: 4,from: 4, to: 6,label:"hahah",arrows:'from;to',smooth:true, color: {color:'#1e90ff',highlight:'#1e90ff',hover:'#1e90ff',opacity:1.0}},
          {id: 5,from: 1, to: 7,label:"hahah",arrows:'from;to',smooth:true, color: {color:'#1e90ff',highlight:'#1e90ff',hover:'#1e90ff',opacity:1.0}},
        ],
      }

    },

    methods:{
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
        if(this.$refs.topologyFull){
          setTimeout(()=>{
            this.$refs.topologyFull.resetAllNodes();
          })
        }
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
      // 设置拓扑图数据
      setTopologyData(nodesArr,edgesArr){
        this.nodesArray=nodesArr;
        this.edgesArray=edgesArr;
      },
      //退出全屏
      exitFull(){
        this.screenModal = false;
        this.$refs.topology.resetAllNodes()
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
</style>
