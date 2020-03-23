<style lang="scss" scoped>
@import './chart-table.scss';
</style>
<style>
  .max-width-90{
    max-width: 90px;
  }
</style>
<template>
    <div class="chart-table" :id="'chartTableDiv'+chartIndex" v-show="divFirstShow" @mouseenter="caretShow=true" @mouseleave="caretShow=false">
        <loading  :ref="'localLoading'+chartIndex"></loading>
      <!--
        <div v-show="showLoading" class="el-loading-mask" style="background-color: rgba(0, 0, 0, 0);">
          <div class="el-loading-spinner">
            <img width="42px" height="42px"  src="../../assets/img/loading.gif"/>
            <p class="el-loading-text loading-font">loading</p>
          </div>
        </div>
        -->
        <div class="clearfix chartTitle" :id="'chartTitle'+chartIndex">

          <el-dropdown trigger="click" v-show="firstShow"   class="nz-chart-top" :key="'chartDropdown'+chartIndex"  v-clickoutside="clickos">
            <span class="el-dropdown-link chart-title" @click="dropdownMenuShow=!dropdownMenuShow">
              <span class="chart-title-text">{{data.title}}</span>
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
            </ul>
          </el-dropdown>

        </div>
        <div class="mt-10" v-cloak  v-show="firstShow">
            <el-table class="nz-table" :id="'tableContainer'+chartIndex" ref="tableContainer" :height="290" :data="seriesItem" border  tooltip-effect="light" v-cloak v-scrollBar:el-table>
<!--                <el-table-column sortable :show-overflow-tooltip="true" prop="metric" :label="$t('dashboard.panel.chartTableColumn.metric')" ></el-table-column>-->
<!--                <el-table-column sortable :show-overflow-tooltip="true" prop="label" :label="$t('dashboard.panel.chartTableColumn.label')" ></el-table-column>-->
              <el-table-column sortable prop="time" :label="$t('dashboard.panel.chartTableColumn.time')" width="145" ></el-table-column>
                <el-table-column sortable prop="element" :show-overflow-tooltip="true" :label="$t('dashboard.panel.chartTableColumn.element')" >
                  <template slot-scope="scope">
                    {{ scope.row.element.alias?scope.row.element.alias:scope.row.element.element}}
                  </template>
                </el-table-column>
                <el-table-column sortable prop="value" :label="$t('dashboard.panel.chartTableColumn.value')" width="90">
                  <template slot-scope="scope">
                    {{ unit.compute(scope.row.value,null,2)}}
                  </template>
                </el-table-column>
            </el-table>
          <Pagination :pageObj="pageObj" @pageNo='pageNo' :post-page-sizes="pageSizes" @pageSize='pageSize' ref="Pagination"></Pagination>
        </div>
        <!--全屏-->
          <el-dialog class="nz-dialog table-chart-dialog" :title="$t('dashboard.panel.view')"  :visible.sync="screenModal" width="96%"  @close="screenModal = false" >
            <div slot="title">
              <span class="nz-dialog-title">{{data.title}}</span>
              <div class="float-right panel-calendar dialog-tool">
                <el-date-picker prefix-icon=" " size="mini" class="nz-dashboard-picker" ref="calendar" format="yyyy/MM/dd HH:mm" @change="dateChange" v-model="searchTime" type="datetimerange" :picker-options="pickerOptions" :range-separator="$t('dashboard.panel.to')" :start-placeholder="$t('dashboard.panel.startTime')" :end-placeholder="$t('dashboard.panel.endTime')" align="right">
                </el-date-picker>
                <!--<button @click="refreshChart" type="button" class="nz-btn nz-btn-size-normal nz-btn-style-light"><i style="font-size: 14px;" class="el-icon-refresh-right"></i></button>-->
              </div>
            </div>
                <el-table style="margin-top: 10px;" class="nz-table" height="95%" :data="seriesItemScreen" border  tooltip-effect="light" v-scrollBar:el-table>
<!--                    <el-table-column sortable :show-overflow-tooltip="true" prop="metric" :label="$t('dashboard.panel.chartTableColumn.metric')" ></el-table-column>-->
<!--                    <el-table-column sortable :show-overflow-tooltip="true" prop="label" :label="$t('dashboard.panel.chartTableColumn.label')" ></el-table-column>-->
                  <el-table-column sortable prop="time" :label="$t('dashboard.panel.chartTableColumn.time')" width="145" ></el-table-column>
                  <el-table-column sortable prop="element" :show-overflow-tooltip="true" :label="$t('dashboard.panel.chartTableColumn.element')" >
                    <template slot-scope="scope">
                      {{ scope.row.element.alias?scope.row.element.alias:scope.row.element.element}}
                    </template>
                  </el-table-column>
                    <el-table-column sortable prop="value" :label="$t('dashboard.panel.chartTableColumn.value')" width="90">
                      <template slot-scope="scope">
                        {{ unit.compute(scope.row.value,null,2)}}
                      </template>
                    </el-table-column>
                </el-table>
            <Pagination :pageObj="screenPageObj" :post-page-sizes="pageSizes" @pageNo='screenPageNo' @pageSize='screenPageSize' ref="Pagination"></Pagination>
            <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
            <!--
                <div v-show="showLoadingScreen" class="el-loading-mask" style="background-color: rgba(0, 0, 0, 0);">
                  <div class="el-loading-spinner">
                    <img width="42px" height="42px"  src="../../assets/img/loading.gif"/>
                    <p class="el-loading-text loading-font">loading</p>
                  </div>
                </div>
                -->
        </el-dialog>
      <span class="vue-resizable-handle" @mousedown="dragResize"></span>
    </div>
</template>

<script>
import bus from '../../libs/bus';
import {Loading} from 'element-ui';
import chartDataFormat from './chartDataFormat'
import loading from "../common/loading";

export default {
    name: 'chartTable',
  components: {
    'loading': loading,
  },
    props: {
        // 看板id
        panelId: {
            type: Number,
            default: 0,
        },
        editChartId: {
          type: String,
          default: 'editChartId',
        },
        chartIndex:{
          type: Number,
          default: 0,
        }
    },
    data() {
        return {
            data: {}, // 该图表信息,chartItem
            unit:{},
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
            //toolbox: false,
            loading:Object,
            items: {
                metric_name: [], // 每条数据列名称
                xAxis: [],
                theData: [], // series数据组
            },
            panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
            firstLoad: false, // 是否第一次加载
            //showLoading:true,
            //showLoadingScreen:false,
            //showTable:true,
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
            dropdownMenuShow:false,
            divFirstShow:false,
            //tableLoading: false,
            columns: [
            //   {
            //     title: 'metric',
            //     key: 'metric',
            //     width: 200,
            //     sortable: true,
            // }, {
            //     title: 'Label', //tag
            //     key: 'name',
            //     minWidth: 200,
            //     sortable: true,
            // }
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
            pickerOptions: {
                shortcuts: [{
                    text: this.$t("dashboard.panel.recOne"),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setHours(start.getHours() - 1);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: this.$t("dashboard.panel.recFour"),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setHours(start.getHours() - 4);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: this.$t("dashboard.panel.recOneDay"),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(start.getDate() - 1);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: this.$t("dashboard.panel.yesterday"),
                    onClick(picker) {
                        const start = new Date();
                        const end = new Date();
                        start.setDate(start.getDate() - 1);
                        start.setHours(0);
                        start.setMinutes(0);
                        start.setSeconds(0);
                        end.setDate(end.getDate() - 1);
                        end.setHours(23);
                        end.setMinutes(59);
                        end.setSeconds(59);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: this.$t("dashboard.panel.recSevenDay"),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(start.getDate() - 7);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: this.$t("dashboard.panel.recOneMonth"),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(start.getDate() - 30);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: this.$t("dashboard.panel.curMonth"),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(1);
                        start.setHours(0);
                        start.setMinutes(0);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: this.$t("dashboard.panel.lastMonth"),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(1);
                        start.setMonth(start.getMonth() - 1);
                        end.setDate(0);
                        start.setStart();
                        end.setEnd();
                        picker.$emit('pick', [start, end]);
                    }
                }]
            },
        };
    },
    created() {
      this.pageObj.pageSize=this.pageSizes[0];
      this.screenPageObj.pageSize=this.pageSizes[0];
    },
  computed: {},
    watch: {},
    methods: {
        pageNo(val) {
          this.pageObj.pageNo = val;
          this.seriesItem=this.filterShowData(this.storedTableData,this.pageObj)
        },
        pageSize(val) {
          this.pageObj.pageSize = val;
          this.seriesItem=this.filterShowData(this.storedTableData,this.pageObj)
        },
        filterShowData(source,pageObj){
          return source.slice((pageObj.pageNo-1)*pageObj.pageSize,pageObj.pageNo*pageObj.pageSize)
        },
        screenPageNo(val) {
          this.screenPageObj.pageNo = val;
          this.seriesItemScreen=this.filterShowData(this.storedScreanTableData,this.screenPageObj)
        },
        screenPageSize(val) {
          this.screenPageObj.pageSize = val;
          this.seriesItemScreen=this.filterShowData(this.storedScreanTableData,this.screenPageObj)
        },
      dragResize:function(e){
        var diffWidth =38; //界面的宽度空白的地方的宽度
        var targetDiv= document.getElementById('chartTableDiv'+this.chartIndex); //e.target.parentNode.parentNode;.children[0]
        var targetDivContainer= document.getElementById('listContainer'); //e.target.parentNode.parentNode;.children[0]
        var maxWidth = targetDivContainer.offsetWidth-diffWidth;
        var minWidth = maxWidth/12;
        var stepWidth = maxWidth/12;
        var stepHeight = 10;

        //得到点击时该容器的宽高：
        var targetDivHeight=targetDiv.offsetHeight;
        var targetDivWidth=targetDiv.offsetWidth;
        var startY=e.clientY;
        var startX=e.clientX;
        var _this=this;

        document.onmousemove=function(e){
          e.preventDefault();
          //得到鼠标拖动的宽高距离：取绝对值
          var distY=Math.abs(e.clientY-startY);
          var distX=Math.abs(e.clientX-startX);

          //往上方拖动：
          if( e.clientY < startY){
            targetDiv.style.height=targetDivHeight-distY+'px';
            //heightTmp = targetDivHeight-distY;
          }
          if( e.clientX < startX){
            targetDiv.style.width=targetDivWidth-distX+'px';
            //widthTmp = targetDivWidth-distX;
          }
          //往下方拖动：
          if (e.clientY > startY) {
            targetDiv.style.height=(targetDivHeight+distY)+'px';
            //heightTmp = targetDivHeight+distY;
          }
          if (e.clientX > startX) {
            targetDiv.style.width=(targetDivWidth+distX)+'px';
            //widthTmp = targetDivWidth+distX;
          }

          if(parseInt(targetDiv.style.height)<=_this.minHeight){
            targetDiv.style.height=_this.minHeight+'px';
            //heightTmp = _this.minHeight;
          }

          if(parseInt(targetDiv.style.width)>=maxWidth){
            targetDiv.style.width=maxWidth+'px';
            //widthTmp = maxWidth;
          }
          if(parseInt(targetDiv.style.width)<=minWidth){
            targetDiv.style.width=minWidth+'px';
            //widthTmp = minWidth;
          }
          //调整表格大小
            let containerHeight = parseInt(targetDiv.style.height);
            let containerWidth = parseInt(targetDiv.style.width);
            const chartBox = document.getElementsByClassName('chartBox');
            chartBox[_this.chartIndex].style.width = (containerWidth+diffWidth)+'px';
            //chartBox[_this.chartIndex].style.height = `${containerHeight}px`;
            //表格的高度
            const tableBox = document.getElementById('tableContainer'+_this.chartIndex);
            tableBox.style.height = `${containerHeight-75-32+25}px`;
        }

        document.onmouseup=function(){
          let targetDivHeightNew = parseInt(targetDiv.style.height);
          //let targetDivHeightNew = heightTmp
          let targetDivWidthNew = parseInt(targetDiv.style.width);
          //let targetDivWidthNew = widthTmp;

          let diffHeight =  Math.abs(targetDivHeight-targetDivHeightNew);
          if(targetDivHeight>targetDivHeightNew){
            let finalDiffHeight = Math.floor(diffHeight/stepHeight)*stepHeight;
            //alert('oldWidth='+targetDivHeight+"===diffHeight+"+diffHeight+"==finalDiffHeight="+finalDiffHeight);
            targetDiv.style.height = (targetDivHeight-finalDiffHeight)+'px';
          }
          if(targetDivHeight<targetDivHeightNew){
            let finalDiffHeight = Math.ceil(diffHeight/stepHeight)*stepHeight;
            targetDiv.style.height = (targetDivHeight+finalDiffHeight)+'px';
          }

          var span = _this.data.span;
          if(targetDivWidth>targetDivWidthNew){
            span =  Math.floor((targetDivWidthNew*12)/maxWidth);
            let finalWidth = Math.floor((targetDivWidthNew*12)/maxWidth)*stepWidth;
            if((finalWidth)<minWidth){
              targetDiv.style.width=minWidth+'px';
              span = 1;
            }else {
              targetDiv.style.width = finalWidth+'px';
            }
          }
          if(targetDivWidth<targetDivWidthNew){
            span =  Math.ceil((targetDivWidthNew*12)/maxWidth);
            let spanUnit = Math.ceil((targetDivWidthNew*12)/maxWidth);
            let finalWidth = spanUnit*stepWidth;
            if(finalWidth>maxWidth || spanUnit===12){
              targetDiv.style.width=maxWidth+'px';
              span = 12;
            }else {
              targetDiv.style.width = finalWidth+'px';
            }
          }
          //调整表格大小
          let containerHeight = parseInt(targetDiv.style.height);
          let containerWidth = parseInt(targetDiv.style.width);

          const chartBox = document.getElementsByClassName('chartBox');
          chartBox[_this.chartIndex].style.width = (containerWidth+diffWidth)+'px';
          //chartBox[_this.chartIndex].style.height = `${containerHeight}px`;
          //表格的高度
          const tableBox = document.getElementById('tableContainer'+_this.chartIndex);
          tableBox.style.height = `${containerHeight-75-32+25}px`;

          const modifyParams = {
            id:_this.data.id,
            span:span,
            height:(containerHeight+25),
            prev:parseInt(_this.data.prev),
            next:parseInt(_this.data.next),
          }
          _this.$put('panel/'+  _this.panelIdInner+'/charts/modify',modifyParams).then(response => {
            if (response.code === 200) {
              //更新当前图表数据
              _this.data.span= span;
              _this.data.height= containerHeight+25;
              _this.$emit('on-drag-chart', _this.data);
            }else {
              if(response.msg){
                _this.$message.error(response.msg);
              }else if(response.error){
                _this.$message.error(response.error);
              }else {
                _this.$message.error(response);
              }
            }
          });
          document.onmousemove=null;
          document.onmouseup = null;
        }
      },
        startLoading(area){
          if(area==='screen'){
            //this.showLoadingScreen = true;
            this.$refs['localLoadingScreen'+this.chartIndex].startLoading();
          }else {
            //this.showLoading = true;
            this.$refs['localLoading'+this.chartIndex].startLoading();
          }
/*
          //this.loading = this.$loading({
          this.loading = Loading.service({
            lock:true,
            text:'loading',
            background:'rgba(0,0,0,0)',
            customClass:'loading-font',
            //fullscreen: false,
            target:document.getElementById('chartTableDiv')
          })
*/
        },
        endLoading(area){
          if(area==='screen'){
            //this.showLoadingScreen = false;
            this.$refs['localLoadingScreen'+this.chartIndex].endLoading();
          }else {
            //this.showLoading = false;
            this.$refs['localLoading'+this.chartIndex].endLoading();
          }
        },
        clearData(){
        },
        showLoad(chartItem) {
          //设置高度 chart-table
          this.$nextTick(() => {
            const chartBox = document.getElementById('chartTableDiv'+this.chartIndex);
            let height = chartItem.height;
            if(height<200){
              height = 200;
            }
            chartBox.style.height = `${height-25}px`;
            const tableBox = document.getElementById('tableContainer'+this.chartIndex);
            tableBox.style.height = `${height-75-32}px`;
          });
          this.startLoading();
          this.divFirstShow = true;
          //this.tableLoading = true;
        },
        // 展示图表编辑区
      /*
        showTool() {
            this.toolbox = !this.toolbox;
        },
        */
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
            //this.filter.start_time = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss');
            //this.filter.end_time = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss');
            //this.showTable = false;
            this.seriesItemScreen = [];
            for(let i=0;i<8;i++){
              this.seriesItemScreen.push({//表格数据
                // label: '',//label
                // metric: '',//metric列
                element:'',
                time: '',//采集时间
                value: '',//数值
              });
            }
            this.startLoading('screen');
            //this.tableLoading = true;
            //this.firstShow = false;
            this.$emit('on-search-data', this.data.id, this.searchTime);
        },
        clickos() {
          this.dropdownMenuShow=false;
        },
        // 全屏查看
        showAllScreen() {
            this.dropdownMenuShow=false;
            // 初始化同步时间
            //this.searchTime = this.oldSearchTime;
          //alert(JSON.stringify(this.oldSearchTime));
            this.searchTime = [];
            this.searchTime[0] = this.oldSearchTime[0];//将列表的查询时间复制给全屏的查询时间
            this.searchTime[1] = this.oldSearchTime[1];
            this.seriesItemScreen = this.seriesItem;
            this.screenModal = true;
            //this.startLoading('screen');
            //this.endLoading('screen');
        },
        // 设置数据, filter区分
        setData(chartItem, seriesItem, panelId, filter,area) {
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
            }else{
              //设置高度 chart-table
              this.$nextTick(() => {
                const chartBox = document.getElementById('chartTableDiv'+this.chartIndex);
                let height = chartItem.height;
                if(height<200){
                  height = 200;
                }
                chartBox.style.height = `${height-25}px`;
                const tableBox = document.getElementById('tableContainer'+this.chartIndex);
                tableBox.style.height = `${height-75-32}px`;
              });
              this.divFirstShow = true;

              this.firstShow = true; // 展示操作按键

              this.panelIdInner = panelId;
              this.data = chartItem;
              this.unit = chartDataFormat.getUnit(this.data.unit);
              // this.seriesItem = seriesItem;
              // this.seriesItemScreen = seriesItem;
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
              //this.showTable = true;
              //this.tableLoading = false;
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
    mounted() {
        this.firstLoad = false;
    },
    beforeDestroy() {},
};
</script>
