<style lang="scss">
  @import './chart.scss';
</style>
<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-echarts" ref="resizeBox">
      <div class="line-chart-block" :id="'lineChartDiv'+chartIndex" @mouseenter="mouseEnterChart" @mouseleave="mouseLeaveChart">
        <loading :ref="'localLoading'+chartIndex"></loading>
        <div class="clearfix chartTitle" :class="{'drag-disabled': this.filter.from == 'alertRule'}" :id="'chartTitle'+chartIndex" >
          <el-popover
            v-if="isError"
            placement="top-start"
            :close-delay=10
            trigger="hover"
            popper-class="chart-error-popper">
            <div >{{errorContent}}</div>
            <span slot="reference" class="panel-info-corner panel-info-corner--error">
              <i class="nz-icon nz-icon-warning fa"></i>
              <span class="panel-info-corner-inner"></span>
           </span>
          </el-popover>
          <span class="moreTitle">
            <el-popover
              v-if="seriesItem.length!==seriesItemArr.length"
              placement="top-start"
              :close-delay=10
              trigger="hover"
              popper-class="chart-warring-popper">
            <div class="moreTitle">{{$t('dashboard.panel.moreTitle')}}{{$t('dashboard.panel.showAll')}}{{seriesItem.length}}</div>
            <span slot="reference" class="panel-info-corner panel-info-corner--error"  @click="loadMore">
              <i class="nz-icon nz-icon-warning fa"></i>
              <span class="panel-info-corner-inner"></span>
           </span>
          </el-popover>
          </span>
          <el-dropdown trigger="click" class="nz-chart-top" :key="'chartDropdown'+chartIndex"  v-clickoutside="clickos">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <span class="el-dropdown-link chart-title" @click.stop="dropdownMenuShow=!dropdownMenuShow">
              <span class="chart-title-text">{{chartData.title}}</span>
              <span class="chart-title-icon" v-if="filter.from != 'alertRule'"><i class="nz-icon nz-icon-caret-bottom  " :class="{'visible':caretShow,'hidden':!caretShow}"></i></span>
            </span>
            <ul v-if="filter.from != 'alertRule'" slot="dropdown" v-show="dropdownMenuShow"  :id="'dropdownUl'+chartIndex" :class="{'el-dropdown-menu nz-chart-dropdown':!isExplore,'el-dropdown-menu nz-chart-dropdown-one':isExplore}"    style="position: absolute; top: 30px; left: calc(50% - 79px); transform-origin: center top; z-index: 1000;" >
              <li v-show="!isExplore"  @click="refreshChart"  class="el-dropdown-menu__item">
                <i class="global-active-color el-icon-refresh-right" style="font-size: 16px;"></i><span>{{$t('dashboard.refresh')}}</span></li>
              <li v-show="!isExplore" @click="editChart"  class="el-dropdown-menu__item">
                <i class="nz-icon nz-icon-edit" style="font-size: 14px; margin-right: 11px; margin-left: 1px;"></i>{{$t('dashboard.edit')}}</li>
              <li v-show="!isExplore" @click="removeChart"  class="el-dropdown-menu__item">
                <i class="nz-icon nz-icon-delete" style="font-size: 16px;"></i>{{$t('dashboard.delete')}}</li>
              <li  @click="showAllScreen"  class="el-dropdown-menu__item">
                <i class="el-icon-full-screen" style="font-size: 16px;"></i>{{$t('dashboard.screen')}}</li>
              <li  v-show="!isExplore" @click="duplicate"  class="el-dropdown-menu__item">
                <i class="el-icon-copy-document" style="font-size: 16px;"></i>{{$t('dashboard.duplicate')}}</li>
            </ul>
          </el-dropdown>
        </div>
        <!--<div  v-if="seriesItem.length!==seriesItemArr.length" class="more"><i class="el-icon-warning"></i> {{$t('dashboard.panel.moreFirstTitle')}} {{seriesLength}}{{$t('dashboard.panel.moreSecondTitle')}}<span @click="loadMore" class="moreClick">{{$t('dashboard.panel.moreThirdTitle')}}{{seriesItem.length}}</span></div>-->
        <div class="line-area"  ref="lineChartArea"  :id="'lineChartArea'+chartIndex" v-show="firstShow" style="width:100%;"></div>
        <div class="chart-no-data" v-show="noData">No Data</div>
        <template v-if="!hasLegendOptions">
          <div class='legend-container'  ref="legendArea" v-show="firstShow" v-scrollBar:legend>
            <div v-for="(item, index) in legendListMore" :title="item.alias?item.alias:item.name"  @click="clickLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGrey[index]}" :key="'legend_' + item.name+'_'+index">
              <span class="legend-shape" :style="{background:(isGrey[index]?'#D3D3D3':item.color)}"></span>{{item.alias?item.alias:item.name}}
            </div>
          </div>
        </template>
        <template v-else>
          <div class='legend-container'  ref="legendArea" v-show="firstShow" v-scrollBar:legend>
            <table style="width: 100%">
              <th style="width: 100%"></th>
              <template v-for="legendOption in legendOptions">
                <th v-if="legendOption.value == 'on'" class="option-th legend-option-cell" >
                  <span @click="legendValueSort(legendOption,legendListMore,legendOptions)">{{legendOption.option}}</span>
                  <span ><i style="font-size: 12px !important;" :class="{'nz-icon nz-icon-arrow-down':legendOption.sort =='asc','nz-icon nz-icon-arrow-up':legendOption.sort=='desc'}" ></i></span>
                </th>
              </template>
              <tbody>
                <tr  v-for="(item, index) in legendListMore" :key="'legend_' + item.name+'_'+index">
                  <td>
                    <div :title="item.alias?item.alias:item.name"  @click="clickLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGrey[index]}" >
                      <span class="legend-shape" :style="{background:(isGrey[index]?'#D3D3D3':item.color)}"></span>{{item.alias?item.alias:item.name}}
                    </div>
                  </td>
                  <template v-for="legendOption in legendOptions">
                    <td v-if="legendOption.value == 'on'" class="legend-option-cell">{{formatLegendData(item[legendOption.option])}}</td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <!--
        <Modal title="查看" v-model="screenModal" width="96%" class="line-chart-block-modal">-->
        <el-dialog class="line-chart-block-modal nz-dialog"
                   :title="$t('dashboard.panel.view')"
                   :visible.sync="screenModal"
                   width="90%"
                   @close="screenModal = false;screenLegendListMore=[]"
                   style="margin-top: 1vh !important;"
                   @opened="initDialog"
                   :modal-append-to-body="false"
        >
          <el-popover
            v-if="isError"
            placement="top-start"
            :close-delay=10
            trigger="hover"
            popper-class="chart-error-popper">
            <div >{{errorContent}}</div>
            <span slot="reference"  class="panel-info-corner panel-info-corner--error">
                <i class="nz-icon nz-icon-warning fa-model" ></i>
                <span class="panel-info-corner-inner"></span>
            </span>
          </el-popover>
          <span class="moreTitle">
            <el-popover
              v-if="seriesItemScreen.length!==seriesItemArrScreen.length"
              placement="top-start"
              :close-delay=10
              trigger="hover"
              popper-class="chart-warring-popper">
            <div class="moreTitle">{{$t('dashboard.panel.moreTitle')}}{{$t('dashboard.panel.showAll')}}{{seriesItemScreen.length}}</div>
            <span slot="reference" class="panel-info-corner panel-info-corner--error"  @click="loadScreenMore">
              <i class="nz-icon nz-icon-warning fa-model"></i>
              <span class="panel-info-corner-inner"></span>
           </span>
          </el-popover>
          </span>
          <div slot="title" >
            <span class="nz-dialog-title" v-show="!isExplore">{{data.title}}</span>
            <span class="nz-dialog-title" v-show="isExplore">&nbsp;</span>
            <div class="float-right panel-calendar dialog-tool">

              <time-picker ref="calendarPanel" class="nz-dashboard-picker" style="margin-top: -12px;"  @change="dateChange"></time-picker>
            </div>
          </div>
          <div class="line-area" ref="screenShowArea"  id="screenShowArea"  style="margin-top:0px;" @mouseenter="mouseEnterFullChart" @mouseleave="mouseLeaveFullChart"></div>
          <div class="chart-no-data" v-show="noData">No Data</div>
          <template v-if="!hasLegendOptions">
            <div class="legend-container legend-container-screen"  :id="'screenLegendArea'+chartIndex" @mouseenter="mouseEnterFullChart" @mouseleave="mouseLeaveFullChart" v-show="showLegend" v-scrollBar:legend>
              <div v-for="(item, index) in screenLegendListMore" :title="item.alias?item.alias:item.name"  @click="clickScreenLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGreyScreen[index]}"  :key="'legend_' + item.name+'_'+index">
                <span class="legend-shape" :style="{background:(isGreyScreen[index]?'#D3D3D3':item.color)}"></span>{{item.alias?item.alias:item.name}}
                <br/><!--bgColorList[index]-->
              </div>
            </div>
          </template>
          <template v-else>
            <div class="legend-container legend-container-screen"  :id="'screenLegendArea'+chartIndex" @mouseenter="mouseEnterFullChart" @mouseleave="mouseLeaveFullChart" v-show="showLegend" v-scrollBar:legend>
              <table style="width: 100%">
                <th style="width: 100%"></th>
                <template v-for="legendOption in screenLegendOptions">
                  <th v-if="legendOption.value == 'on'" class="option-th legend-option-cell" >
                    <span @click="legendValueSort(legendOption,screenLegendListMore,screenLegendOptions)">{{legendOption.option}}</span>
                    <span ><i style="font-size: 12px !important;" :class="{'nz-icon nz-icon-arrow-down':legendOption.sort =='asc','nz-icon nz-icon-arrow-up':legendOption.sort=='desc'}" ></i></span>
                  </th>
                </template>
                <tbody>
                <tr  v-for="(item, index) in screenLegendListMore" :key="'legend_' + item.name+'_'+index">
                  <td>
                    <div :title="item.alias?item.alias:item.name"  @click="clickScreenLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGreyScreen[index]}" >
                      <span class="legend-shape" :style="{background:(isGreyScreen[index]?'#D3D3D3':item.color)}"></span>{{item.alias?item.alias:item.name}}
                    </div>
                  </td>
                  <template v-for="legendOption in screenLegendOptions">
                    <td v-if="legendOption.value == 'on'" class="legend-option-cell">{{formatLegendData(item[legendOption.option])}}</td>
                  </template>
                </tr>
                </tbody>
              </table>
            </div>
          </template>

          <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
      </div>
      <span class="vue-resizable-handle" @mousedown="startResize" v-if="filter.from != 'alertRule'"></span>
    </div>
  </div>
</template>
<script>
  import axios from 'axios';
  import echarts from 'echarts';
  import bus from '../../libs/bus';
  import loading from "../common/loading";
  import chartDataFormat from './chartDataFormat';
  import {randomcolor} from  '../common/js/radomcolor/randomcolor.js';
  import timePicker from '../common/timePicker';
  import chartConfig from "../page/dashboard/overview/chartConfig";
  import {getChart, setChart,lineChartMove,getMousePoint} from "../common/js/common";

  export default {
    name: 'lineChartBlock',
    components: {
      'loading': loading,
      'time-picker':timePicker
    },
    props: {
      chartData: {
        type: Object
      },
      // 看板id
      panelId: {
        type: Number,
        default: 0,
      },
      chartIndex:{
        type: Number,
        default: 0,
      },
      // 展示设置内容
      showSetting: {
        type: Boolean,
        default: true,
      },
      isExplore:{
        type:Boolean,
        default:false,
      },
      tempDom: Object
    },
    data() {
      return {
        data: {}, // 该图表信息,chartItem
        noData:false,
        seriesItem: [], // 保存信息
        seriesItemArr:[],// 初次加载的数据
        seriesLength:20,
        seriesItemScreen:[],
        seriesItemArrScreen:[],
        legendListMore:[],
        screenLegendListMore:[],
        chartInfo:{},
        images: '',
        isStackArea:false,
        isError:false,
        errorContent:'',
        toolbox: false,
        items: {
          metric_name: [], // 每条数据列名称
          xAxis: [],
          theData: [], // series数据组
        },
        panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
        chartName: '',
        firstLoad: false, // 是否第一次加载
        divFirstShow:false,
        highchartStore: null, // 保存图表数据
        echartStore:null,// 保存图表数据
        echartModalStore: null, // 全屏查看时数据
        chartType: 'line', // 图表类型
        screenModal: false,
        // 查询数据使用
        filter: {
          start_time: '',
          end_time: '',
          from: ""
        },
        stableFilter: {}, // 保存数据使用,初始化起止时间,单图or多图等
        legend:[],
        legendList:[],
        screenLegendList:[],
        isGrey:[],
        isGreyScreen:[],
        bgColorList: ['#7bbfea', '#b3424a', '#f05b72', '#596032', '#bd6758',
          '#cd9a5b', '#918597', '#70a19f', '#005344', '#FF00FF',
          '#f7acbc', '#5f5d46', '#66ffff', '#ccFF66', '#f47920',
          '#769149', '#1d953f', '#abc88b', '#7f7522', '#9b95c9',
          '#f3715c', '#ea66a6', '#d1c7b7', '#9d9087', '#77787b',
          '#f58220', '#c37e00', '#00ae9d', '#f26522', '#76becc',
          '#76624c', '#d71345', '#2468a2', '#ca8687', '#1b315e',
        ],
        stackTotalColor:null,
        firstShow: false, // 默认不显示操作按钮,
        caretShow:false,
        dropdownMenuShow:false,
        showLegend:true,
        searchTime:[new Date().setHours(new Date().getHours()-1),new Date()],
        oldSearchTime:[],
        screenTitleHeight:58,
        hasLegendOptions:false,
        legendOptions:[],
        screenLegendOptions:[],
      };
    },
    watch: {},
    methods: {
      startResize(e) {
        let vm = this;
        this.$chartResizeTool.start(vm, this.chartData, e,this.chartIndex);
      },
      setDivFirstShow(showDiv){
        this.divFirstShow = showDiv;
      },
      mouseEnterChart(){
        this.caretShow=true;
        if (getChart(this.chartIndex)) {
          getChart(this.chartIndex).setOption({
            toolbox: {
              show:true,
            }
          })
        }
      },
      mouseLeaveChart(){
        this.caretShow=false;
        if (getChart(this.chartIndex)) {
          getChart(this.chartIndex).setOption({
            toolbox: {
              show:false,
            }
          })
        }
      },
      mouseEnterFullChart(){
        if (this.echartModalStore) {
          this.echartModalStore.setOption({
            toolbox: {
              show:true,
            }
          })
        }
      },
      mouseLeaveFullChart(){
        if (this.echartModalStore) {
          this.echartModalStore.setOption({
            toolbox: {
              show:false,
            }
          })
        }
      },
      clickLegend(legendName,index){
        //点击图表某一个legend，图表只显示当前点击的曲线或柱状图，其它隐藏，再次点击已选中的legend ，显示全部
        let curIsGrey=this.isGrey[index];
        if(getChart(this.chartIndex)){
          this.legendListMore.forEach((item,i)=>{
            let isGrey = this.isGrey[i];
            if(index != i){
              if(!curIsGrey && !isGrey){
                getChart(this.chartIndex).dispatchAction({
                  type: 'legendUnSelect',
                  name: item.name
                });
              }else if(!curIsGrey && isGrey){
                getChart(this.chartIndex).dispatchAction({
                  type: 'legendSelect',
                  name: item.name
                });
              }else{
                getChart(this.chartIndex).dispatchAction({
                  type: 'legendUnSelect',
                  name: item.name
                });
              }
            }else {
              getChart(this.chartIndex).dispatchAction({
                type: 'legendSelect',
                name: item.name
              });
            }
          });
          this.isGrey.forEach((item,i)=>{
            if(index != i){
              if(!curIsGrey && !item){
                this.$set(this.isGrey, i, true);
              }else if(!curIsGrey && item){
                this.$set(this.isGrey, i, false);
              }else{
                this.$set(this.isGrey, i, true);
              }
            }else{
              if(item === true){
                this.$set(this.isGrey, i, false);
              }
            }
          })
        }
      },
      clickScreenLegend(legendName,index){
        //点击图表某一个legend，图表只显示当前点击的曲线或柱状图，其它隐藏，再次点击已选中的legend ，显示全部
        let curIsGrey=this.isGreyScreen[index];
        if(this.echartModalStore){
          this.screenLegendListMore.forEach((item,i)=>{
            let isGrey = this.isGreyScreen[i];
            if(index != i){
              if(!curIsGrey && !isGrey){
                this.echartModalStore.dispatchAction({
                  type: 'legendUnSelect',
                  name: item.name
                });
              }else if(!curIsGrey && isGrey){
                this.echartModalStore.dispatchAction({
                  type: 'legendSelect',
                  name: item.name
                });
              }else{
                this.echartModalStore.dispatchAction({
                  type: 'legendUnSelect',
                  name: item.name
                });
              }
            }else {
              this.echartModalStore.dispatchAction({
                type: 'legendSelect',
                name: item.name
              });
            }
          });
          this.isGreyScreen.forEach((item,i)=>{
            if(index != i){
              if(!curIsGrey && !item){
                this.$set(this.isGreyScreen, i, true);
              }else if(!curIsGrey && item){
                this.$set(this.isGreyScreen, i, false);
              }else{
                this.$set(this.isGreyScreen, i, true);
              }
            }else{
              if(item === true){
                this.$set(this.isGreyScreen, i, false);
              }
            }
          })
        }
      },
      clearData(){
        if(getChart(this.chartIndex)){
          getChart(this.chartIndex).clear();
          // getChart(this.chartIndex).dispose();//关闭销毁实例 不再占用内存
        }
      },
      formatLegend(chartWidth,name){
        if(!name){
          return '';
        }
        //计算宽度
        let span = document.querySelector(".temp-dom");
        span.textContent = name;
        let txtWidth = parseFloat(window.getComputedStyle(span).width) - this.tempDom.width;
        if(txtWidth < chartWidth){
          return name;
        }else {
          let charNum = `${(chartWidth-100)/(txtWidth/name.length)}`;
          return name.slice(0,charNum)+'...';
        }
      },
      // chartSite用于区分是全屏显示还是局部显示
      initChart(chartInfo, dataArg, ele, chartSite,legend) {
        this.chartInfo=chartInfo;
        const self = this;
        this.chartType = ''; // 图表类型
        if ( chartInfo.type === 4) {//line,bar
          this.chartType = 'line';
        }
        let minTime = null;
        let maxTime = null;
        if(dataArg.length>0 && dataArg[0].data
          && dataArg[0].data.length>0 && dataArg[0].data[0].length>0){
          let len = dataArg[0].data.length-1;
          minTime = dataArg[0].data[0][0];
          maxTime = dataArg[0].data[len][0];
        }
        if (chartSite === 'local') {
          setChart(this.chartIndex, echarts.init(ele));
          //getChart(this.chartIndex) = echarts.init(ele);
          //chartId='lineChartArea';
        }else if (chartSite === 'screen') {
          this.echartModalStore = echarts.init(ele);
          //chartId='screenShowArea';
        }
        var chartWidth = ele.clientWidth;
        var title = {
          show:false,
          text: chartInfo.title || null,
          textAlign: 'left',
          useHTML: true,
          textStyle: {
            //display: 'inline-block',//无此属性
            width: '60%',
            fontStyle:'normal',
            fontWeight:'bold',
            color: "#333",

          }
        };

        let stackIconBorderColor = (chartInfo.type==='stackArea'?'#53a3cb':'#7e7e7e');
        let stackIconChooseBorderColor = (chartInfo.type==='stackArea'?'#7e7e7e':'#53a3cb');
        if(chartInfo.unit &&dataArg.length>0){
          maxValue=dataArg[0].data[0][1];
          minValue=dataArg[0].data[0][1];
          for(let j = 0; j < dataArg.length ; j++){
            dataArg[j].showAllSymbol=false;
          }
        }
        let maxValueCopies = this.getMaxValue(dataArg,chartInfo);
        let maxValue=maxValueCopies.maxValue;
        let minValue=maxValueCopies.minValue;
        let dot=maxValueCopies.dot;
        let copies=maxValueCopies.copies;
        let unit=maxValueCopies.unit;
        let oldDot=maxValueCopies.oldDot;
        var option = {
          title:{
            show:false,
          },
          color: this.bgColorList,
          toolbox:{
            show:false,
            top:'0',
            showTitle:true,
            feature:{
              dataZoom:{
                yAxisIndex:false,
                title:{
                  zoom:self.$t('overall.toolBox.zoom'),
                  back:self.$t('overall.toolBox.back'),
                }
              },
              magicType:{
                type:['stack'],
                title:{
                  stack:self.$t('overall.toolBox.stack')
                },
                iconStyle:{
                  borderColor:stackIconBorderColor,
                },
                emphasis:{
                  borderColor:stackIconChooseBorderColor,
                }
              },
            }
          },
          tooltip: {
            trigger: 'axis',
            confine:false,
            backgroundColor:'rgba(221,228,237,1)',
            textStyle:{
              color:'#000'
            },
            extraCssText:'z-index:1000;',
            /*enterable:true, 导致tooltip不消失，显示多个tooltip*/
            position:function(point,params,dom,rect,size){
              dom.style.transform = "translateZ(0)";
              var windowWidth=window.innerWidth;//窗口宽度
              var windowHeight=window.innerHeight;//窗口高度
              var windowMouse=getMousePoint();
              //提示框位置
              var x=0;
              var y=0;
              //当前鼠标位置
              var pointX = point[0];
              var pointY = point[1];
              //外层div大小
              var viewWidth = size.viewSize[0];
              var viewHeight = size.viewSize[1];
              //提示框大小
              var boxWidth = size.contentSize[0];
              var boxHeight = size.contentSize[1];
              if (chartSite === 'local') { // 本地显示
                let chartDom = document.getElementById(chartInfo.title+"_"+chartInfo.id);
                if(chartDom){
                  let parTop = document.getElementById(chartInfo.title+"_"+chartInfo.id).offsetTop;
                  let parleft = document.getElementById(chartInfo.title+"_"+chartInfo.id).offsetLeft;

                  let parent = document.getElementById('tableList');
                  let parClientHeight = parent.clientHeight;//可视高度
                  let parClientWidth = parent.clientWidth;//可视宽度
                  let parScrollTop = parent.scrollTop;
                  if((parClientWidth-pointX-parleft-20)>=boxWidth){//说明鼠标在左边放不下提示框
                    x=pointX+10;
                  }else{
                    x = pointX - boxWidth;
                  }
                  if(windowMouse.y + 50 +boxHeight<windowHeight){//说明鼠标上面放不下提示框
                    y = pointY + 15;
                  }else {
                    y = pointY - boxHeight - 10;
                  }
                  return [x,y];
                }else {//preview page

                  if(windowMouse.x<(windowWidth/2)){//说明鼠标在左边放不下提示框
                    x=pointX + 15;
                  }else{
                    x = pointX - boxWidth - 15;
                  }
                  if(windowMouse.y + 50 +boxHeight<windowHeight){//说明鼠标上面放不下提示框
                    y = pointY + 15;
                  }else {
                    y = pointY - boxHeight - 10;
                  }
                  return [x,y];
                }
              }else {
                if(pointX<(viewWidth/2)){//说明鼠标在左边放不下提示框
                  x=pointX+10;
                }else{
                  x = pointX - boxWidth;
                }
                if(windowMouse.y + 50 +boxHeight<windowHeight){//说明鼠标上面放不下提示框
                  y = pointY + 15;
                }else {
                  y = pointY - boxHeight - 10;
                }
                return [x,y];
              }
            },
            formatter:function(params){
              let str = `<div>`;
              let sum = 0;
              params.forEach((item, i) => {
                let tip=legend[item.seriesIndex];
                let color = self.bgColorList[item.seriesIndex];
                if(i===0){
                  let value=item.data[0];
                  let t_date = new Date(value);
                  str += [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('-') + " "
                    + [t_date.getHours(), t_date.getMinutes(),t_date.getSeconds()].join(':');
                  str +=`<br/>`;
                }
                let val =item.data[1]?parseFloat(Number(item.data[1]).toFixed(2)):'';
                if(val===0){
                  val = Number(item.data[1]);
                }
                sum +=val;
                str += `<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${color};}'></span>${tip?(tip.alias?tip.alias:tip.name):item.seriesName}  </div>`;
                str += `<div style="padding-left: 10px;">`;
                str += chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(val,null,-1,oldDot);
                str += `</div>`;
                str += `</div>`;
              });
              if(self.data.type==='stackArea' || self.isStackArea){
                if(!self.stackTotalColor||self.stackTotalColor==''){
                  self.stackTotalColor=randomcolor();
                }
                sum = parseFloat(Number(sum).toFixed(2));
                str +=`<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                str +=`<div style="line-height: 18px; font-size: 12px;padding-left:0px;">`
                str +=`<span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${self.stackTotalColor};}'></span>`;
                str +=self.$t("dashboard.panel.chartTotal");
                str +=`</div>`;
                str +=`<div style="padding-left: 10px;">`;
                str +=chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(sum,null,2);
                str +=`</div>`;
                str += `</div>`;
              }

              str +=`</div>`;
              return str;
            },
          },
          legend: {
            show:false,
          },
          grid: {
            top: 30,
            left: 0,
            right: 30,
            containLabel: true,
            bottom:8,//156
          },
          xAxis: {
            type: 'time',
            animation:false,
            showAllSymbol:false,
            axisLabel: {
              interval: '0',
              showMaxLabel:false,
              rotate: 0,
              show:true,
              fontSize: 10,
              formatter: function (value) {
                value = value;
                let t_date = new Date(value);
                let hour = t_date.getHours();
                hour=hour>9?hour:"0"+hour; //加0补充为两位数字
                let minute = t_date.getMinutes();
                minute=minute>9?minute:"0"+minute; //如果分钟小于10,则在前面加0补充为两位数字
                if(minTime!==null && maxTime!==null){
                  let diffSec = (maxTime-minTime)/1000;
                  let secOneDay = 24*60*60;//1天的秒数
                  let secOneMonth = secOneDay*30;//30天的秒数
                  if(diffSec<=secOneDay) {//同一天
                    return [hour,minute ].join(':');
                  }else if(diffSec<secOneMonth){//大于1天，小于30天
                    return [t_date.getMonth() + 1, t_date.getDate()].join('/') +" "+  [hour, minute].join(':');
                  }else {//大于等于30天
                    return [t_date.getMonth() + 1, t_date.getDate()].join('/');
                  }
                }else {
                  return [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('/') + "\n"
                    + [hour, minute].join(':');
                }

              }
            },
            axisPointer: {//y轴上显示指针对应的值
              show: true,
            },
            splitLine:{
              show:true,
              lineStyle: {
                color: "#d9d9d9",
                opacity: 0.8,
                width: 1
              }
            },
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            //boundaryGap:['20%', '0'],
          },
          yAxis: {
            type: 'value',
            splitLine:{
              show:true,
              lineStyle: {
                color: "#d9d9d9",
                opacity: 0.8,
                width: 1
              }
            },
            // maxInterval:{},
            //去掉y轴--start
            axisLine:{
              show:false
            },
            minInterval: chartDataFormat.Interval(maxValue,copies,unit.type,'min'),
            // maxInterval: chartDataFormat.Interval(maxValue,copies,unit.type,'max'),
            axisTick: {
              show: false,
            },
            //去掉y轴--end
            axisLabel: {
              show:true,
              fontSize: 10,
              formatter: function(value,index){
                let chartUnit=chartInfo.unit;
                chartUnit=chartUnit?chartUnit:2;
                let unit=chartDataFormat.getUnit(chartUnit);
                let flag=JSON.stringify(value).length>JSON.stringify(chartDataFormat.Interval(maxValue,copies,unit.type)).length;
                if(chartDataFormat.Interval(maxValue,copies,unit.type,'min')<1&&dot<2){
                  dot=2;
                }
                if(dot===0&&flag){
                  dot=1;
                }
                return unit.compute(value,index,-1,dot);
              },
            },
            //boundaryGap:[0,0.2]
          },
          useUTC: false,//使用本地时间
          series: dataArg
        };

        // params.series = dataArg;
        if (chartSite === 'local') { // 本地显示
          if(legend){
            this.legendList = [];
            this.isGrey=[];
            legend.forEach((item, i) => {
              const legend = {
                name:item.name,
                alias:item.alias,
                color:item.color,
                showText:this.formatLegend(chartWidth,item.name)
              };
              this.legendList.push(legend);
              this.isGrey.push(false);
            });
          }
          this.legendListMore=this.legendList.filter((item,index)=>index<this.seriesLength);
          if(this.hasLegendOptions){
            this.computeLegendData(this.legendListMore,dataArg,'local');
          }
          this.$nextTick(() => {
            setTimeout(function () {
              let divHeight = self.$refs.legendArea.offsetHeight;
              if(!chartInfo.height){
                getChart(self.chartIndex).resize({height:(400-divHeight-self.$chartResizeTool.titleHeight-self.$chartResizeTool.chartBlankHeight)});
              }else {
                getChart(self.chartIndex).resize({height:(chartInfo.height-divHeight-self.$chartResizeTool.titleHeight-self.$chartResizeTool.chartBlankHeight)});
              }
              if(dataArg&&dataArg.length>0){
                getChart(self.chartIndex).clear();
                getChart(self.chartIndex).setOption(option);//创建图表
                self.noData=false;
              }else{
                self.noData=true;
                option=chartConfig.getOption('noData')
                getChart(self.chartIndex).clear();
                getChart(self.chartIndex).setOption(option);//创建图表
              }

              self.$refs['localLoading'+self.chartIndex].endLoading();
              self.firstShow = true; // 展示操作按键
            }, 100);

            window.addEventListener('resize', function () {
              getChart(self.chartIndex).resize();
            });
            getChart(this.chartIndex).on('magictypechanged', function (params) {
                self.isStackArea = !self.isStackArea;
                if(self.isStackArea){
                  this.setOption({
                    toolbox:{
                      feature:{
                        dataZoom:{
                          yAxisIndex:false,
                          title:{
                            zoom:self.$t('overall.toolBox.zoom'),
                            back:self.$t('overall.toolBox.back'),
                          }
                        },
                        magicType:{
                          type:['stack'],
                          title:{
                            stack:self.$t('overall.toolBox.stack')
                          },
                          iconStyle:{
                            borderColor:'#7e7e7e',
                          },
                          emphasis:{
                            borderColor:stackIconChooseBorderColor,
                          }
                        },
                      }
                    },
                    tooltip: {
                      formatter:function(params){
                        let str = `<div>`;
                        let sum = 0;
                        params.forEach((item, i) => {let tip=legend[item.seriesIndex];
                          let color = self.bgColorList[item.seriesIndex];
                          if(i===0){
                            let value=item.data[0];
                            let t_date = new Date(value);
                            str += [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('-') + " "
                              + [t_date.getHours(), t_date.getMinutes(),t_date.getSeconds()].join(':');
                            str +=`<br/>`;
                          }
                          let val = parseFloat(Number(item.data[1]).toFixed(2));
                          if(val===0){
                            val = Number(item.data[1]);
                          }
                          sum +=val;
                          str += `<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                          str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${color};}'></span>${tip?(tip.alias?tip.alias:tip.name):item.seriesName}  </div>`;
                          str += `<div style="padding-left: 10px;">`;
                          str += chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(val,null,2);
                          str += `</div>`;
                          str += `</div>`;
                        });
                        if(self.data.type==='stackArea' || self.isStackArea){
                          sum = parseFloat(Number(sum).toFixed(2));
                          str +=`<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                          str +=`<div style="line-height: 18px; font-size: 12px;padding-left:20px;">`
                          str +=self.$t("dashboard.panel.chartTotal");
                          str +=`</div>`;
                          str +=`<div style="padding-left: 10px;">`;
                          str +=chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(sum,null,2);
                          str +=`</div>`;
                          str += `</div>`;
                        }

                        str +=`</div>`;
                        return str;
                        },
                    }
                  });
                }
            });
          });
        } else if (chartSite === 'screen') { // 全屏显示
          // eslint-disable-next-line
          if(legend){
            this.screenLegendList = [];
            this.isGreyScreen=[]
            legend.forEach((item, i) => {
              const legend = {
                name:item.name,
                alias:item.alias,
                color:item.color,
                showText:this.formatLegend(chartWidth,item.name)
              };
              this.screenLegendList.push(legend);
              this.isGreyScreen.push(false);
            });
          }
          if(this.screenLegendListMore.length!==this.screenLegendList.length){
            this.screenLegendListMore=this.screenLegendList.filter((item,index)=>index<this.seriesLength);
          }
          if(this.hasLegendOptions){
            this.computeLegendData(this.screenLegendListMore,dataArg,'screen');
          }
          if(self.echartModalStore){
            self.echartModalStore.clear();
            option.title = {};
            self.showLegend = true;
            self.$refs['localLoadingScreen'+self.chartIndex].endLoading();
          }
          this.$nextTick(() => {
            let legendDiv = document.getElementById('screenLegendArea'+self.chartIndex);
            let divHeight = legendDiv.offsetHeight;
            let screenHeight = document.documentElement.clientHeight || document.body.clientHeight;
            let sumHeight = Math.floor(screenHeight*0.99*0.8);//margin-top:1vh; dailog:80%
            self.$refs.screenShowArea.style.height = `${sumHeight - divHeight - self.screenTitleHeight}px`;
            self.echartModalStore.resize({height: (sumHeight - divHeight - self.screenTitleHeight)});//图表的高度
            setTimeout(function () {
              if(self.screenLegendListMore.length!==self.screenLegendList.length){
                self.seriesItemArrScreen=self.seriesItemScreen.filter((item,index)=>index<self.seriesLength);

              }else{
                self.seriesItemArrScreen=self.seriesItemScreen
              }
              option.series=self.seriesItemArrScreen;
              if(dataArg&&dataArg.length>0){
                self.echartModalStore.setOption(option);//显示全屏界面
                self.noData=false;
              }else{
                self.noData=true;
                option=chartConfig.getOption('noData')
                self.echartModalStore.setOption(option);//显示全屏界面
              }
              self.echartModalStore.on('finished', function () {
                let legendDiv = document.getElementById('screenLegendArea'+self.chartIndex);
                let divHeight = legendDiv.offsetHeight;
                let screenHeight = document.documentElement.clientHeight || document.body.clientHeight;
                let sumHeight = Math.floor(screenHeight*0.99*0.8);//margin-top:1vh; dailog:80%
                self.$refs.screenShowArea.style.height = `${sumHeight - divHeight - self.screenTitleHeight}px`;
                self.echartModalStore.resize({height: (sumHeight - divHeight - self.screenTitleHeight)});//图表的高度
                self.echartModalStore.off('finished');
              })
            }, 100);

            this.echartModalStore.on('magictypechanged', function (params) {
              self.isStackArea = !self.isStackArea;
              if(self.isStackArea){
                this.setOption({
                  toolbox:{
                    feature:{
                      dataZoom:{
                        yAxisIndex:false,
                        title:{
                          zoom:self.$t('overall.toolBox.zoom'),
                          back:self.$t('overall.toolBox.back'),
                        }
                      },
                      magicType:{
                        type:['stack'],
                        title:{
                          stack:self.$t('overall.toolBox.stack')
                        },
                        iconStyle:{
                          borderColor:'#7e7e7e',
                        },
                        emphasis:{
                          borderColor:stackIconChooseBorderColor,
                        }
                      },
                    }

                  },
                  tooltip: {
                    formatter:function(params){
                      let str = `<div>`;
                      let sum = 0;
                      params.forEach((item, i) => {let tip=legend[item.seriesIndex];
                        let color = self.bgColorList[item.seriesIndex];
                        if(i===0){
                          let value=item.data[0];
                          let t_date = new Date(value);
                          str += [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('-') + " "
                            + [t_date.getHours(), t_date.getMinutes(),t_date.getSeconds()].join(':');
                          str +=`<br/>`;
                        }
                        let val = parseFloat(Number(item.data[1]).toFixed(2));
                        if(val===0){
                          val = Number(item.data[1]);
                        }
                        sum +=val;
                        str += `<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                        str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${color};}'></span>${tip?(tip.alias?tip.alias:tip.name):item.seriesName}  </div>`;
                        str += `<div style="padding-left: 10px;">`;
                        str += chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(val,null,2);
                        str += `</div>`;
                        str += `</div>`;
                      });
                      if(self.data.type==='stackArea' || self.isStackArea){
                        sum = parseFloat(Number(sum).toFixed(2));
                        str +=`<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                        str +=`<div style="line-height: 18px; font-size: 12px;padding-left:20px;">`
                        str +=self.$t("dashboard.panel.chartTotal");
                        str +=`</div>`;
                        str +=`<div style="padding-left: 10px;">`;
                        str +=chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(sum,null,2);
                        str +=`</div>`;
                        str += `</div>`;
                      }

                      str +=`</div>`;
                      return str;
                    },
                  }
                });
              }
            });
          });
        }
      },
      handleLineFeed(str,chartWidth){
        let rlt='';
        if(!str){
          return '';
        }
        //计算宽度
        let span = document.querySelector(".temp-dom");
        span.textContent = name;
        let txtWidth = parseFloat(window.getComputedStyle(span).width) - this.tempDom.width;
        if(txtWidth < chartWidth){
          return str;
        }else {
          var charNum = `${(chartWidth-100)/(txtWidth/str.length)}`;
          return str.slice(0,charNum)+'...';
        }
      },
      setColor(colorNum){
        this.bgColorList = [];
        for(let i=0;i<colorNum;i++) {
          this.bgColorList.push(randomcolor())
        }
      },
      // 设置数据, filter区分
      setData(chartItem, seriesItem, panelId, filter,legend,area,errorMsg) {
        this.setColor(legend.length);
        legend.forEach((t,i)=>{t.color = this.bgColorList[i]});
        this.filter.from = filter.from;
        if(errorMsg && errorMsg!==''){
          this.isError = true;
          this.errorContent = errorMsg;
        }else {
          this.isError = false;
          this.errorContent = '';
        }
        if(area==='showFullScreen'){//全屏按时间查询
          /*
          this.legend = legend;
          this.data = chartItem;
          this.searchTime[0] = filter.start_time;//将列表的查询时间复制给全屏的查询时间
          this.searchTime[1] = filter.end_time;
          this.seriesItemScreen = seriesItem;
          //this.$refs['localLoadingScreen'+this.chartIndex].endLoading();
          this.initChart(chartItem, seriesItem, this.$refs.lineChartArea, 'screen',legend);
          */
        }else{
          this.legend = legend;
          this.$refs['localLoading'+this.chartIndex].startLoading();
          this.divFirstShow = true;
          this.firstShow = true; // 展示操作按键
          this.panelIdInner = panelId;
          this.data = chartItem;
          this.seriesItem = seriesItem;
          this.seriesItemScreen = seriesItem;

          this.hasLegendOptions=this.findLegendOptions()
          if(this.hasLegendOptions){
            let sortedOptionKeys=['min','max','avg','last','total']
            this.legendOptions=sortedOptionKeys.map(item=>{ return {option:item,sort:'',value:chartItem.param.legendValue[item]}})
            this.screenLegendOptions=sortedOptionKeys.map(item=>{ return {option:item,sort:'',value:chartItem.param.legendValue[item]}})
          }

          if (filter) { // 保存数据,用于同步时间
            this.stableFilter = filter;
            this.searchTime[0] = filter.start_time;
            this.searchTime[1] = filter.end_time;
            this.oldSearchTime[0] = this.searchTime[0];
            this.oldSearchTime[1] = this.searchTime[1];
          }
          this.seriesItem=seriesItem;
          let seriesItemArr=seriesItem;
          if(seriesItem.length>this.seriesLength){
            seriesItemArr=seriesItem.filter((item,index)=>index<this.seriesLength); // 只查看前seriesLength条
            this.seriesItemArr=seriesItemArr;
            this.seriesItemArrScreen=seriesItemArr;

          }else{
            this.seriesItemArr=seriesItem
          }

          this.initChart(chartItem, seriesItemArr, this.$refs.lineChartArea, 'local',legend);
        }

      },
      resize(chartItem) {
        let chartBox = document.getElementById('lineChartDiv'+this.chartIndex);
        chartBox.style.height = `${this.$chartResizeTool.calculateHeight(chartItem.height)}px`;
      },
      clearChart(){
        if(getChart(this.chartIndex)){
          getChart(this.chartIndex).clear();
        }
        if(this.echartModalStore){
          this.echartModalStore.clear();
        }
        this.data = {};
      },
      clickos() {
        this.dropdownMenuShow=false;
      },
      // 删除该图表
      removeChart() {
        this.dropdownMenuShow=false;
        this.$emit('on-remove-chart-block', this.data.id);
      },
      // 编辑图表
      editChart() {
        this.dropdownMenuShow=false;
        this.$emit('on-edit-chart-block', this.data.id);
      },
      // 重新请求数据 刷新操作
      refreshChart() {
        this.dropdownMenuShow=false;
        let id = this.data.id;
        this.clearChart();
        this.$refs['localLoading'+this.chartIndex].startLoading();
        this.firstShow = false;
        this.$emit('on-refresh-data', id);
      },
      initDialog(){
        //此时初始化，才能获得screenShowArea对象，否则此对象为undefined，无法初始化图表
        this.initChart(this.data, this.seriesItem, this.$refs.screenShowArea, 'screen',this.legend);
        // 日期组件同步时间
        /*
        this.$refs.calendar.initTime({
          start: this.stableFilter.start_time,
          end: this.stableFilter.end_time,
        });
        */
      },
      changeDate(st){
        this.oldSearchTime=st;
        this.searchTime = st;
        this.filter.start_time = st[0];
        this.filter.end_time = st[1];
      },
      // 全屏查看
      showAllScreen() {
        this.dropdownMenuShow=false;
        // 初始化同步时间
        this.filter.start_time = this.stableFilter.start_time;
        this.filter.end_time = this.stableFilter.end_time;
        //this.searchTime = this.oldSearchTime;
        this.$set(this.searchTime, 0, this.oldSearchTime[0]);
        this.$set(this.searchTime, 1, this.oldSearchTime[1]);
        this.$refs.calendarPanel.setCustomTime(this.searchTime);
        this.screenModal = true;
        this.isGreyScreen=[];

        this.seriesItemScreen = this.seriesItem;
        // this.seriesItemScreen = this.seriesItem;
        /*
                this.searchTime = [];
                this.searchTime[0] = this.oldSearchTime[0];//将列表的查询时间复制给全屏的查询时间
                this.searchTime[1] = this.oldSearchTime[1];
                this.seriesItemScreen = this.seriesItem;
                this.screenModal = true;
                */
        //this.dateChange();
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
      dateChange(time) {
        this.searchTime = [...time];
        this.filter.start_time = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss');
        this.filter.end_time = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss');
        this.echartModalStore.clear();
        this.showLegend = false;
        this.$refs['localLoadingScreen'+this.chartIndex].startLoading();
        if (this.showSetting) {
          this.getQueryChart('list');
        } else {
          this.getQueryChart('dashboard');
        }
      },
      // 查询数据,修改日期查询全屏数据
      getQueryChart(type) {
        /*
        if (this.echartModalStore) {
          this.echartModalStore.showLoading();
        }
        */
        let axiosArr = [];
        this.$nextTick(() => {
          let startTime = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss');
          let endTime = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss');
          if(!startTime || !endTime){//如果时间为空，则默认取最近1小时
            let now = new Date();
            startTime = bus.timeFormate(now, 'yyyy-MM-dd hh:mm:ss');
            endTime = bus.timeFormate(now.setHours(now.getHours()-1), 'yyyy-MM-dd hh:mm:ss');
            this.searchTime[0] = startTime;
            this.searchTime[1] = endTime;
          }
          let step = bus.getStep(startTime,endTime);
          if (type === 'list') { // 普通模式,主控台使用
            axiosArr = this.data.elements.map((ele) => {
              const filterItem = ele;
              let query = encodeURIComponent(filterItem.expression);
              if(this.chartInfo.type==='line'||this.chartInfo.type==='bar'||this.chartInfo.type==='stackArea'){//如果是这三个 默认给connected
                this.chartInfo.param.nullType=this.chartInfo.param.nullType||'connected';
                query+='&nullType='+this.chartInfo.param.nullType;
              }
              return  this.$get('/prom/api/v1/query_range?query='+query+"&start="+this.$stringTimeParseToUnix(startTime)+"&end="+this.$stringTimeParseToUnix(endTime)+'&step='+step);
            });
          } else if (type === 'dashboard') { // 概览模式,指标概览中使用
            // 概览模式,需要区分单独一个和多个
            if (this.stableFilter.chartCount === 'multiple') {
              let query = encodeURIComponent(this.data.title);
              if(this.chartInfo.type==='line'||this.chartInfo.type==='bar'||this.chartInfo.type==='stackArea'){//如果是这三个 默认给connected
                this.chartInfo.param.nullType=this.chartInfo.param.nullType||'connected';
                query+='&nullType='+this.chartInfo.param.nullType;
              }
              axiosArr = [this.$get('/prom/api/v1/query_range?query='+query+"&start="+this.$stringTimeParseToUnix(startTime)+"&end="+this.$stringTimeParseToUnix(endTime)+'&step='+step)];
            } else {
              let query = encodeURIComponent(this.data.elements[0].expression);
              if(this.chartInfo.type==='line'||this.chartInfo.type==='bar'||this.chartInfo.type==='stackArea'){//如果是这三个 默认给connected
                this.chartInfo.param.nullType=this.chartInfo.param.nullType||'connected';
                query+='&nullType='+this.chartInfo.param.nullType;
              }
              axiosArr = [this.$get('/prom/api/v1/query_range?query='+query+"&start="+this.$stringTimeParseToUnix(startTime)+"&end="+this.$stringTimeParseToUnix(endTime)+'&step='+step)];
            }
          }
          // 一个图表
          axios.all(axiosArr).then((res) => {
            if (res.length > 0) {
              const series = [];
              const legend = [];
              const sumData = {
                name: 'sum',
                data: [],
                visible: true,
                threshold: null,
              };
              if(!this.data.type){
                this.data.type='line';
              }
              res.forEach((response,pos) => {
                if (response.status === 'success') {
                  this.isError = false;
                  this.errorContent = "";
                  if (response.data.result) {
                    // 循环处理每个elements下获取的数据列
                    response.data.result.forEach((queryItem,innerPos) => {
                      const seriesItem = {
                        theData: {
                          name: '',
                          symbol:'emptyCircle',  //去掉点
                          symbolSize:[2,2],
                          smooth:0.2,  //曲线变平滑
                          showSymbol:false,
                          data: [],
                          type:this.data.type,
                          lineStyle: {
                            width: 1,
                            opacity: 0.9
                          },
                          //visible: true,
                          //threshold: null,
                        },
                        metric_name: '',
                      };
                      if(this.data.type === 'stackArea'){
                        seriesItem.theData.type='line';
                        seriesItem.theData.stack=this.data.title;
                        seriesItem.theData.areaStyle={"opacity": 0.3};
                      }

                      if((this.data.type === 'line'||this.data.type === 'stackArea'||this.data.type === 'bar')&& this.data.param && this.data.param.threshold){
                        seriesItem.theData.markLine={
                          silent: true,
                          symbol:['circle','circle'],
                          label:{
                            distance:this.computeDistance(chartDataFormat.getUnit(this.data.unit?this.data.unit:2).compute(this.data.param.threshold)),
                            formatter:function(params){
                              return chartDataFormat.getUnit(this.data.unit?this.data.unit:2).compute(params.value)
                            }
                          },
                          lineStyle:{
                            color:'#d64f40',
                            width:2,
                            type:'dotted'
                          },
                          data: [{
                            yAxis: Number(this.data.param.threshold)
                          }, ]
                        }
                      }

                      // 图表中每条线的名字,后半部分
                      // let host = `${queryItem.metric.__name__}{`;//up,
                      let host = '';//up,
                      if(queryItem.metric.__name__){
                        host = `${queryItem.metric.__name__}{`;//up,
                      }
                      const tagsArr = Object.keys(queryItem.metric);//["__name__","asset","idc","instance","job","module","project"]
                      // 设置时间-数据格式对
                      const dpsArr = Object.entries(queryItem.values);//[ ["0",[1577959830.781,"0"]], ["1",[1577959845.781,"0"]] ]
                      // 判断是否有数据,&& tagsArr.length > 0
                      if (dpsArr.length > 0 ) {
                        tagsArr.forEach((tag, i) => {
                          if (tag !== '__name__') {
                            host += `${tag}="${queryItem.metric[tag]}",`;
                          }
                        });
                        if(host.endsWith(',')){host = host.substr(0,host.length-1);}
                        if(queryItem.metric.__name__){
                          host +="}";
                        }
                        if(!host || host===''){
                          host = this.data.elements[pos].expression;
                        }
                        let alias=this.dealLegendAlias(host,this.data.elements[pos].legend);
                        if(!alias || alias===''){
                          alias = host;
                        }
                        legend.push({name:host+innerPos,alias:alias});
                        // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c
                        seriesItem.theData.name = host+innerPos;
                        seriesItem.metric_name = seriesItem.theData.name;
                        // 将秒改为毫秒
                        //alert('table=='+JSON.stringify(queryItem))
                        seriesItem.theData.data = queryItem.values.map((dpsItem, dpsIndex) => {
                          /*曲线汇总暂不需要
                          if (sumData.data[dpsIndex]) {
                            const sumNum = sumData.data[dpsIndex][1] || 0;
                            sumData.data[dpsIndex][1] = sumNum + dpsItem[1];
                          } else {
                            sumData.data[dpsIndex] = [dpsItem[0] * 1000, dpsItem[1]];
                          }
                          */
                          return [dpsItem[0] * 1000, dpsItem[1]];
                        });
                        series.push(seriesItem.theData);

                      } else if (this.data.elements && this.data.elements[innerPos]) {
                        // 无数据提示
                        /*
                        const currentInfo = chartItem.elements[innerPos];
                        const errorMsg = `图表 ${chartItem.title} 中 ${currentInfo.metric},${currentInfo.tags} 无数据`;
                        this.$message.warning({
                          duration: 15,
                          content: errorMsg,
                          closable: true,
                        });
                        */
                      }
                    });
                  }
                }else{
                  this.isError = true;
                  if(response.msg){
                    this.errorContent = response.msg;
                  }else if(response.error){
                    this.errorContent = response.error;
                  }else {
                    this.errorContent = response;
                  }
                }
              });
              this.setColor(legend.length);
              this.seriesItemScreen=series;
              // this.seriesItemArrScreen=series.filter((item,index)=>index<this.seriesLength);
              this.initChart(this.data,series, this.$refs.screenShowArea, 'screen',legend);
            }
          }).catch((error) => {
            if (error) {
              this.$message.error(error.toString());
            }
          });
        });
      },
      computeDistance:function(str){
        let span = document.querySelector(".temp-dom");
        span.textContent = str;
        let txtWidth = parseFloat(window.getComputedStyle(span).width);
        return Number('-'+(txtWidth+5));
      },
      showLoad(chartItem) {
        //设置高度
        this.$nextTick(() => {
          const chartBox = document.getElementById('lineChartDiv'+this.chartIndex);
          let height = Math.floor(chartItem.height/this.$chartResizeTool.stepHeight)*this.$chartResizeTool.stepHeight;//图表高度四舍五入
          if(height<this.$chartResizeTool.minHeight){
            height = this.$chartResizeTool.minHeight;
          }
          chartBox.style.height = `${height-this.$chartResizeTool.chartBlankHeight}px`;
        });
        this.clearData();
        this.firstShow = false;
        this.$refs['localLoading'+this.chartIndex].startLoading();
        this.divFirstShow = true;
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
      // 获取格式
      getNumStr(num) {
        if (num >= 1000) {
          const kbNum = num / 1000;
          if (kbNum >= 1000) {
            const mbNum = kbNum / 1000;
            if (mbNum > 1000) {
              const gbNum = mbNum / 1000;
              return `${gbNum.toFixed(2)}B`;
            }
            return `${mbNum.toFixed(2)}M`;
          }
          return `${kbNum.toFixed(2)}K`;
        }
        return num.toFixed(2);
      },
      handleClose(){},
      // 加载更多
      loadMore(){
        this.seriesItemArr=this.seriesItem;
        this.legendListMore=this.legendList;
        let chartInfo=this.data;
        let dataArg=this.seriesItem;
        let maxValueCopies = this.getMaxValue(dataArg,chartInfo);
        let maxValue=maxValueCopies.maxValue;
        let minValue=maxValueCopies.minValue;
        let dot=maxValueCopies.dot;
        let copies=maxValueCopies.copies;
        let unit=maxValueCopies.unit;
        let oldDot=maxValueCopies.oldDot;
        getChart(this.chartIndex).setOption({
          series:this.seriesItem,
          yAxis:{
            minInterval: chartDataFormat.Interval(maxValue,copies,unit.type,'min'),
            maxInterval: chartDataFormat.Interval(maxValue,copies,unit.type,'max'),
          }
        });
        if(this.hasLegendOptions){
          this.computeLegendData(this.legendListMore,this.seriesItemArr,'local')
        }
        this.$nextTick(()=>{
          let divHeight = this.$refs.legendArea.offsetHeight;
          if(!this.chartInfo.height){
            getChart(this.chartIndex).resize({height:(400-divHeight-this.$chartResizeTool.titleHeight-this.$chartResizeTool.chartBlankHeight)});
          }else {
            getChart(this.chartIndex).resize({height:(this.chartInfo.height-divHeight-this.$chartResizeTool.titleHeight-this.$chartResizeTool.chartBlankHeight)});
          }
        })
      },
      // 加载更多
      loadScreenMore(){
        this.seriesItemArrScreen=this.seriesItemScreen;
        this.screenLegendListMore=this.screenLegendList;
        let chartInfo=this.data;
        let dataArg=this.seriesItem;

        let maxValueCopies = this.getMaxValue(dataArg,chartInfo);
        let maxValue=maxValueCopies.maxValue;
        let minValue=maxValueCopies.minValue;
        let dot=maxValueCopies.dot;
        let copies=maxValueCopies.copies;
        let unit=maxValueCopies.unit;
        let oldDot=maxValueCopies.oldDot;
        this.echartModalStore.setOption({
          series:this.seriesItemScreen,
          yAxis:{
            minInterval: chartDataFormat.Interval(maxValue,copies,unit.type,'min'),
            maxInterval: chartDataFormat.Interval(maxValue,copies,unit.type,'max'),
          }
        });
        if(this.hasLegendOptions){
          this.computeLegendData(this.screenLegendListMore,this.seriesItemArrScreen,'screen')
        }
        this.$nextTick(()=>{
          let legendDiv = document.getElementById('screenLegendArea'+this.chartIndex);
          let divHeight = legendDiv.offsetHeight;
          let screenHeight = document.documentElement.clientHeight || document.body.clientHeight;
          let sumHeight = Math.floor(screenHeight*0.99*0.8);//margin-top:1vh; dailog:80%
          this.$refs.screenShowArea.style.height = `${sumHeight - divHeight - this.screenTitleHeight}px`;
          this.echartModalStore.resize({height: (sumHeight - divHeight - this.screenTitleHeight)});//图表的高度
        })
      },
      findLegendOptions:function(){
        if(!this.data.param||!this.data.param.legendValue || Object.keys(this.data.param.legendValue)<1) return false;
        let legendOptions= this.data.param.legendValue;
        let onVal=Object.keys(legendOptions).find(item=>{return legendOptions[item] == 'on'});

        return onVal;
      },
      computeLegendData:function(legend,dataArr,where){
        let options=where =='local'?this.legendOptions:this.screenLegendOptions;
        let keys=options.filter(item=>{return item.value == 'on'}).map(item=>{return item.option});
        let $self=this;
        keys.forEach(item=>{
          switch (item) {
            case 'min':
              $self.legendMinValue(legend,dataArr);
              break;
            case 'max':
              $self.legendMaxValue(legend,dataArr);
              break;
            case 'avg':
              $self.legendAvgValue(legend,dataArr);
              break;
            case 'last':
              $self.legendLastValue(legend,dataArr);
              break;
            case 'total':
              $self.legendTotalValue(legend,dataArr);
              break;
          }
        })
      },
      legendMinValue:function(legend,dataArr){
        return new Promise(resolve => {
          legend.forEach(item=>{
            let data=dataArr.find(t=>t.name == item.name)
            if(data&&data.data){
              let copy=JSON.parse(JSON.stringify(data.data));
              let min =copy.sort((x,y)=>{return parseFloat(x[1]) - parseFloat(y[1])})[0][1]
              item['min']=parseFloat(min)
            }
          })

          resolve();
        })
      },
      legendMaxValue:function(legend,dataArr){
        return new Promise(resolve => {
          legend.forEach(item=>{
            let data=dataArr.find(t=>t.name == item.name)
            if(data&&data.data){
              let copy=JSON.parse(JSON.stringify(data.data));
              let max =copy.sort((x,y)=>{return parseFloat(y[1]) - parseFloat(x[1])})[0][1]
              item['max']=parseFloat(max)
            }
          })
          resolve();
        })
      },
      legendAvgValue:function(legend,dataArr){
        return new Promise(resolve => {
          legend.forEach(item=>{
            let data=dataArr.find(t=>t.name == item.name)
            if(data&&data.data){
              let copy=JSON.parse(JSON.stringify(data.data));
              copy = copy.map(t=>parseFloat(t[1]))
              let sum = eval(copy.join('+'));
              let avg = sum / copy.length;

              item['avg'] = avg;
            }
          })
          resolve();
        })
      },
      legendLastValue:function(legend,dataArr){
        return new Promise(resolve => {
          legend.forEach(item=>{
            let data=dataArr.find(t=>t.name == item.name)
            if(data&&data.data){
              let copy=JSON.parse(JSON.stringify(data.data));
              let last =copy.sort((x,y)=>{return parseFloat(y[0]) - parseFloat(x[0])})[0][1]
              item['last']=parseFloat(last)
            }
          })
          resolve();
        })
      },
      legendTotalValue:function(legend,dataArr){
        return new Promise(resolve => {
          legend.forEach(item=>{
            let data=dataArr.find(t=>t.name == item.name)
            if(data&&data.data){
              let copy=JSON.parse(JSON.stringify(data.data));
              copy = copy.map(t=>parseFloat(t[1]))
              let sum = eval(copy.join('+'));

              item['total'] = sum;
            }
          })
          resolve();
        })
      },
      formatLegendData:function(data){
        return chartDataFormat.getUnit(this.chartInfo.unit).compute(data,null,2)
      },
      legendValueSort:function(option,legend,options){
        options.forEach(item=>{
          if(item.option != option.option){
            item.sort='';
          }
        })
        if(!option.sort || option.sort == 'asc'){
          legend.sort((x,y)=>x[option.option] - y[option.option])
          option.sort = 'desc'
        }else{
          legend.sort((x,y)=>y[option.option] - x[option.option])
          option.sort = 'asc'
        }
      },
      getMaxValue(dataArg,chartInfo){
        let maxValue=0;
        let minValue=0;
        if(chartInfo.unit &&dataArg.length>0){
          maxValue=0;
          minValue=0;
          for(let j = 0; j < dataArg.length ; j++){
            for (let i = 0; i < dataArg[j].data.length - 1; i++) {
             if(dataArg[j].data[i+1][1]!=='NaN'){
               maxValue = (maxValue < Number(dataArg[j].data[i+1][1]) ? Number(dataArg[j].data[i+1][1]) : maxValue);
               minValue = (minValue > Number(dataArg[j].data[i+1][1]) ? Number(dataArg[j].data[i+1][1]) : minValue);
             }
            }
          }
        }
        let chartUnit=chartInfo.unit?chartInfo.unit:2;
        let unit=chartDataFormat.getUnit(chartUnit);
        minValue=minValue>0?0:minValue;
        maxValue=maxValue-minValue;
        maxValue=chartDataFormat.formatDatas(maxValue,unit.type,'ceil',unit.ascii);
        let oldValue=maxValue;
        let dot=0;
        if(maxValue==1){
          dot++;
        }
        if(oldValue>10){
          while(oldValue>10){
            oldValue=oldValue/10;
          }
        }else if(oldValue<1&&maxValue!==0){
          while(oldValue<1&&oldValue>0){
            oldValue=oldValue*10;
            dot++;
          }
          maxValue=Math.floor(oldValue)/Math.pow(10,dot);
          dot++;
        }
        let copies=chartDataFormat.copies(oldValue,unit.type);
        let oldDot=2;
        if(maxValue<=1){
          oldDot=dot>6?6:dot;
        }
        return {
          maxValue,
          dot,
          copies,
          minValue,
          unit,
          oldDot
        }
      },
    },
    mounted() {
      this.firstLoad = false;
      if(!document.onmousemove){// 添加鼠标移动事件监听
        document.onmousemove=lineChartMove
      }
    },
    beforeDestroy() {
      this.clearChart();
      if(getChart(this.chartIndex)){
        getChart(this.chartIndex).dispose();
      }
      if(!document.onmousemove){// 移除鼠标移动事件监听
        document.onmousemove=null;
      }
    },
  };

</script>
