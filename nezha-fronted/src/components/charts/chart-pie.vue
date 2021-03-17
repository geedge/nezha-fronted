<style lang="scss">
@import './chart.scss';
</style>
<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-echarts" ref="resizeBox">
      <div class="chart-single-stat"  :id="'chartPieChart'+chartIndex" @mouseenter="caretShow=true" @mouseleave="caretShow=false">
        <loading  :ref="'localLoading'+chartIndex"></loading>
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
          <el-dropdown trigger="click" class="nz-chart-top" :key="'chartDropdown'+chartIndex"  v-clickoutside="clickos" :class="{'move-able':!isLock}">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <span class="el-dropdown-link chart-title" @click.stop="dropdownMenuShow=!dropdownMenuShow">
              <span class="chart-title-text">{{chartData.title}}</span>
              <span class="chart-title-icon"><i class="nz-icon nz-icon-xialaxuanze  "  :class="{'visible':caretShow,'hidden':!caretShow}"></i></span>
            </span>
            <ul slot="dropdown" v-show="dropdownMenuShow"  :id="'dropdownUl'+chartIndex"  class="el-dropdown-menu nz-chart-dropdown"  style="position: absolute; top: 30px; left: calc(50% - 79px); transform-origin: center top; z-index: 1000;" >
              <li  @click="refreshChart"  class="el-dropdown-menu__item">
                <i class="global-active-color el-icon-refresh-right" style="font-size: 16px;"></i><span>{{$t('dashboard.refresh')}}</span></li>
              <li  @click="editChart" class="el-dropdown-menu__item" v-has="`${from}_chart_toEdit`">
                <i class="nz-icon nz-icon-edit" style="font-size: 14px; margin-right: 11px; margin-left: 1px;"></i>{{$t('dashboard.edit')}}</li>
              <li  @click="removeChart" class="el-dropdown-menu__item" v-has="`${from}_chart_delete`">
                <i class="nz-icon nz-icon-delete" style="font-size: 16px;"></i>{{$t('dashboard.delete')}}</li>
              <li  @click="showAllScreen"  class="el-dropdown-menu__item">
                <i class="el-icon-full-screen" style="font-size: 16px;"></i>{{$t('dashboard.screen')}}</li>
              <li  @click="duplicate" class="el-dropdown-menu__item" v-has="`${from}_chart_duplicate`">
                <i class="el-icon-copy-document" style="font-size: 16px;"></i>{{$t('dashboard.duplicate')}}</li>
            </ul>
          </el-dropdown>
        </div>
        <div :id="'pie-chart-local-'+chartIndex" ref="pieChartLocal" style="display: flex;justify-content: center"></div>
        <div class="chart-no-data" v-show="noData">No Data</div>
        <div class='legend-container' ref="legendArea" v-show="firstShow">
          <div v-for="(item, index) in legend" :title="item.alias?item.alias:item.name"  @click="clickLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGrey[index]}" :key="'legend_' + item.name+'_'+index">
            <span class="legend-shape" :style="{background:(isGrey[index]?'#D3D3D3':item.color)}"></span>{{item.alias?item.alias:item.name}}
          </div>
        </div>
        <!--全屏-->
        <el-dialog class="nz-dialog table-chart-dialog" :title="$t('dashboard.panel.view')" @opened="initChart('screen')"
                   :visible.sync="screenModal"
                   width="96%"  @close="screenModal = false" :modal-append-to-body="false">
          <div slot="title">
            <span class="nz-dialog-title">{{data.title}}</span>
            <div class="float-right panel-calendar dialog-tool">
<!--              <time-picker ref="calendarPanel" class="nz-dashboard-picker" style="margin-top: -12px;" @change="dateChange"></time-picker>-->
              <pick-time :refresh-data-func="dateChange" v-model="searchTime" :use-chart-unit="false" ref="pickTime" style="height: 28px;" id="single-chart"></pick-time>
            </div>
<!--            <span class="float-right  dialog-tool" @click="screenRefreshChart" style="margin-right: 15px"><i class="global-active-color nz-icon nz-icon-refresh"/></span>-->
          </div>
          <div class="single-stat-screen-container"  >
            <div :id="'pie-chart-screen-'+chartIndex" ref="pieChartScreen" style="width: 100%;height: 100%;"></div>
            <div :id="'screenLegendArea'+chartIndex"   class="legend-container legend-container-screen">
              <div v-for="(item, index) in legendScreen" :title="item.alias?item.alias:item.name"  @click="clickScreenLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGreyScreen[index]}"  :key="'legend_' + item.name+'_'+index">
                <span class="legend-shape" :style="{background:(isGreyScreen[index]?'#D3D3D3':item.color)}"></span>{{item.alias?item.alias:item.name}}
                <br/><!--bgColorList[index]-->
              </div>
            </div>
          </div>
          <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
      </div>
      <span class="vue-resizable-handle" @mousedown="startResize" v-if="!isLock"></span>
    </div>
  </div>
</template>

<script>
import chartDataFormat from './chartDataFormat'
import loading from "../common/loading";
import timePicker from '../common/timePicker'
import * as echarts from 'echarts'
import {getChart, setChart, lineChartMove,getMousePoint} from "../common/js/common";
import chart from '../page/dashboard/overview/chart'
import chartConfig from "../page/dashboard/overview/chartConfig";
import {randomcolor} from "../common/js/radomcolor/randomcolor";
export default {
  name: 'pieChart',
  components: {
    'loading': loading,
    'time-picker':timePicker,
    chart,
  },
  props: {
    tempDom:Object,
    chartData: {
      type: Object
    },
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
    },
    from: {type: String},
    isLock:{type:Boolean,default:false}
  },
  data() {
    return {
      data: {}, // 该图表信息,chartItem
      noData:false,
      unit:{},
      isError:false,
      errorContent:'',
      seriesItem: [], // 保存信息
      seriesItemScreen:[],//全屏数据
      pieData:[],
      mapping:'',//满足valueMapping时 mapping的值
      images: '',
      loading:Object,
      items: {
        metric_name: [], // 每条数据列名称
        xAxis: [],
        theData: [], // series数据组
      },
      panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
      firstLoad: false, // 是否第一次加载
      screenModal: false,
      // 查询数据使用
      filter: {
          start_time: '',
          end_time: '',
      },
      firstShow: false, // 默认不显示操作按钮,
      caretShow:false,
      dragTitleShow:false,
      dropdownMenuShow:false,
      divFirstShow:false,
      searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],//全屏显示的时间
      oldSearchTime: [],
      legend:[],
      legendScreen:[],
      isGrey:[],
      isGreyScreen:[],
      echart:null,
      echartScreen:null,
      bgColorList:[],
      option:{
        title: {
          show: false,
        },
        legend:{
          show:false,
        },
        grid: {
          left:'center',
          top:'middle',
        },
        tooltip:{
          trigger:'item',
          backgroundColor:'rgba(221,228,237,1)',
          borderColor :'rgba(255,255,255,0)',
          textStyle:{
            color:'#000'
          },
          axisPointer:{
            snap:false,
            animation:false,
          },
          extraCssText:'z-index:1000;',
        },
        series:null,
      }
    };
  },
  created() {
  },
  computed: {},
    watch: {
      dropdownMenuShow(n) {
        this.$emit("dropmenu-change", n);
      }
    },
    methods: {
      startResize(e) {
        let vm = this;
        this.$chartResizeTool.start(vm, this.data, e,this.chartIndex);
      },
      startLoading(area){
        if(area==='screen'){
          this.$refs['localLoadingScreen'+this.chartIndex].startLoading();
        }else {
          //this.showLoading = true;
          this.$refs['localLoading'+this.chartIndex].startLoading();
        }
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
      showLoad(chartItem) {
        this.$nextTick(() => {
          const chartBox = document.getElementById('chartPieChart'+this.chartIndex);
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
      clearData(){
        if(getChart(this.chartIndex)){
          getChart(this.chartIndex).clear();
          // getChart(this.chartIndex).dispose();//关闭销毁实例 不再占用内存
        }
      },
      screenRefreshChart(){
        this.$refs['calendarPanel'].timeChange(this.$refs['calendarPanel'].nowTimeType,'chart')
      },
      // 重新请求数据 刷新操作-local
      refreshChart() {
        this.dropdownMenuShow=false;
        let id = this.data.id;
        this.clearChart();
        this.$refs['localLoading'+this.chartIndex].startLoading();
        this.firstShow = false;
        this.$emit('on-refresh-data', id);
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
        this.seriesItemScreen = [];
        this.seriePieChart = "";
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
        this.$confirm(this.$t("tip.confirmDuplicate"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'info'
        }).then(() => {
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
        });
      },
      // 全屏查看
      showAllScreen() {
          this.dropdownMenuShow=false;
          this.searchTime = [];
          this.$set(this.searchTime, 0, this.oldSearchTime[0]);
          this.$set(this.searchTime, 1, this.oldSearchTime[1]);
          // this.$refs.calendarPanel.setCustomTime(this.searchTime);
          this.screenModal = true;
      },
      resize(chartItem) {
        getChart(this.chartIndex).resize()
      },
      // 设置数据, filter区分
      setData(chartItem, seriesItem, panelId, filter,legend,area,errorMsg) {
        if(errorMsg && errorMsg!==''){
          this.isError = true;
          this.errorContent = errorMsg;
        }else {
          this.isError = false;
          this.errorContent = '';
        }
        if(seriesItem||seriesItem.data.length<1){ //0 为false
          this.noData=false;
        }else{
          this.noData=true;
        }
        this.legend = legend;
        this.legendScreen=legend
        legend && this.setColor(legend.length);
        legend && legend.forEach((t,i)=>{t.color = this.bgColorList[i]});

        this.$set(this.option,'color',this.bgColorList)
        this.pieData = seriesItem;
        if(area==='showFullScreen'){//全屏按时间查询
          this.data = chartItem;
          this.unit = chartDataFormat.getUnit(this.data.unit);
          this.initChart('screen')
          this.searchTime[0] = filter.start_time;//将列表的查询时间复制给全屏的查询时间
          this.searchTime[1] = filter.end_time;
          this.endLoading('screen');
        }else{
          this.divFirstShow = true;

          this.firstShow = true; // 展示操作按键

          this.panelIdInner = panelId;
          this.data = chartItem;
          this.unit = chartDataFormat.getUnit(this.data.unit);
          this.initChart('local')
          if (filter) { // 保存数据,用于同步时间
            this.searchTime[0] = filter.start_time;//将列表的查询时间复制给全屏的查询时间
            this.searchTime[1] = filter.end_time;
            this.oldSearchTime[0] = this.searchTime[0];
            this.oldSearchTime[1] = this.searchTime[1];
          }
          this.endLoading();
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
      initChart:function(type){
        this.option.series = this.pieData;
        if(type == 'local'){
          this.initLocal();
        }else{
          this.initScreen()
        }
      },
      initLocal:function(){
        let self=this;
        let dom = document.getElementById('pie-chart-local-'+this.chartIndex)
        if(!this.echart){
          this.echart= echarts.init(dom);
          setChart(this.chartIndex, this.echart);
        }
        if(this.legend){
          this.isGrey=[];
          this.legend.map((item, i) => {
            const legend = {
              name:item.name,
              alias:item.alias,
              color:item.color,
              showText:this.formatLegend(dom.clientWidth,item.name)
            };
            self.isGrey.push(false);
            return legend
          });
        }

        this.$nextTick(() => {
          setTimeout(function () {
            let divHeight = self.$refs.legendArea.offsetHeight;
            if(!self.chartData.height){
              getChart(self.chartIndex).resize({height:(400-divHeight-self.$chartResizeTool.titleHeight-self.$chartResizeTool.chartBlankHeight)});
            }else {
              getChart(self.chartIndex).resize({height:(self.chartData.height-divHeight-self.$chartResizeTool.titleHeight-self.$chartResizeTool.chartBlankHeight)});
            }
            self.$set(self.option.tooltip,'formatter',self.formatterFunc)
            self.$set(self.option.tooltip,'position', function(point,params,dom,rect,size){
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
              if (!self.screenModal) { // 本地显示
                let chartDom = document.getElementById(self.chartData.title+"_"+self.chartData.id);
                if(chartDom){
                  let parTop = document.getElementById(self.chartData.title+"_"+self.chartData.id).offsetTop;
                  let parleft = document.getElementById(self.chartData.title+"_"+self.chartData.id).offsetLeft;

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
            },)
            if(self.pieData[0].data.length>0){
              getChart(self.chartIndex).clear();
              getChart(self.chartIndex).setOption(self.option);//创建图表
              self.noData=false;
            }else{
              self.noData=true;
              self.option=chartConfig.getOption('noData')
              getChart(self.chartIndex).clear();
              getChart(self.chartIndex).setOption(self.option);//创建图表
            }

            self.$refs['localLoading'+self.chartIndex].endLoading();
            self.firstShow = true; // 展示操作按键
          }, 100);
        })
      },
      initScreen:function(){
        let self=this;
        let  dom = document.getElementById('pie-chart-screen-'+this.chartIndex)
        if(!this.echartScreen){
          this.echartScreen = echarts.init(dom)
        }
        if(this.legendScreen){
          this.isGreyScreen=[];
          this.legendScreen=this.legendScreen.map((item, i) => {
            const legend = {
              name:item.name,
              alias:item.alias,
              color:item.color,
              showText:this.formatLegend(dom.clientWidth,item.name)
            };
            self.isGreyScreen.push(false);
            return legend
          });
        }
        if(self.echartScreen){
          self.echartScreen.clear();
          self.showLegend = true;
          self.$refs['localLoadingScreen'+self.chartIndex].endLoading();
        }
        this.$nextTick(() => {
            let legendDiv = document.getElementById('screenLegendArea'+self.chartIndex);
            let divHeight = legendDiv.offsetHeight;
            let screenHeight = document.documentElement.clientHeight || document.body.clientHeight;
            let sumHeight = Math.floor(screenHeight*0.99*0.8);//margin-top:1vh; dailog:80%
            self.$refs.pieChartScreen.style.height = `${sumHeight - divHeight - 58}px`;
            self.echartScreen.resize({height: (sumHeight - divHeight - 58)});//图表的高度
            setTimeout(function () {
              if(self.pieData[0].data.length>0){
                self.echartScreen.setOption(self.option);//显示全屏界面
                self.noData=false;
              }else{
                self.noData=true;
                self.option=chartConfig.getOption('noData')
                self.echartScreen.setOption(self.option);//显示全屏界面
              }
              self.echartScreen.on('finished', function () {
                let legendDiv = document.getElementById('screenLegendArea'+self.chartIndex);
                let divHeight = legendDiv.offsetHeight;
                let screenHeight = document.documentElement.clientHeight || document.body.clientHeight;
                let sumHeight = Math.floor(screenHeight*0.99*0.8);//margin-top:1vh; dailog:80%
                self.$refs.pieChartScreen.style.height = `${sumHeight - divHeight - 58}px`;
                self.echartScreen.resize({height: (sumHeight - divHeight - 58)});//图表的高度
                self.echartScreen.off('finished');
              })
            }, 100);

          })
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
      clickLegend(legendName, index){
        /*点击legend
        * 1.当前如果是全高亮状态，则全部置灰，只留被点击的legend高亮
        * 2.如果点击的是唯一高亮的legend，则变为全高亮状态
        * 3.否则只改变被点击的legend状态
        * */
        let highlightNum = 0; //高亮数量
        this.isGrey.forEach(g => {
          if (!g) {
            highlightNum++;
          }
        });
        let hasGrey = highlightNum < this.isGrey.length; //是否有置灰的
        let curIsGrey = this.isGrey[index]; //当前legend的状态
        let currentIsTheOnlyOneHighlight = !curIsGrey && highlightNum === 1; //当前legend是否是目前唯一高亮的

        let echart = getChart(this.chartIndex)
        if (echart) {
          if (!hasGrey) { //1.除当前legend外全置灰
            echart.dispatchAction({
              type: 'legendInverseSelect'
            });
            echart.dispatchAction({
              type: 'legendSelect',
              name: legendName
            });
            this.isGrey = this.isGrey.map((g, i) => i !== index);
          } else if (currentIsTheOnlyOneHighlight) { //2.全高亮
            echart.dispatchAction({
              type: 'legendAllSelect'
            });
            this.isGrey = this.isGrey.map(() => false);
          } else {
            let type = curIsGrey ? "legendSelect" : "legendUnSelect";
            echart.dispatchAction({
              type: type,
              name: legendName
            });
            this.$set(this.isGrey, index, !this.isGrey[index]);
          }
        }
      },
      clickScreenLegend(legendName,index){
        /*点击legend
        * 1.当前如果是全高亮状态，则全部置灰，只留被点击的legend高亮
        * 2.如果点击的是唯一高亮的legend，则变为全高亮状态
        * 3.否则只改变被点击的legend状态
        * */
        let highlightNum = 0; //高亮数量
        this.isGreyScreen.forEach(g => {
          if (!g) {
            highlightNum++;
          }
        });
        let hasGrey = highlightNum < this.isGreyScreen.length; //是否有置灰的
        let curIsGrey = this.isGreyScreen[index]; //当前legend的状态
        let currentIsTheOnlyOneHighlight = !curIsGrey && highlightNum === 1; //当前legend是否是目前唯一高亮的

        let echart = this.echartScreen;
        if (echart) {
          if (!hasGrey) { //1.除当前legend外全置灰
            echart.dispatchAction({
              type: 'legendInverseSelect'
            });
            echart.dispatchAction({
              type: 'legendSelect',
              name: legendName
            });
            this.isGreyScreen = this.isGreyScreen.map((g, i) => i !== index);
          } else if (currentIsTheOnlyOneHighlight) { //2.全高亮
            echart.dispatchAction({
              type: 'legendAllSelect'
            });
            this.isGreyScreen = this.isGreyScreen.map(() => false);
          } else {
            let type = curIsGrey ? "legendSelect" : "legendUnSelect";
            echart.dispatchAction({
              type: type,
              name: legendName
            });
            this.$set(this.isGreyScreen, index, !this.isGreyScreen[index]);
          }
        }
      },
      setColor(colorNum){
        this.bgColorList = [
          '#FF5200','#3685FF','#FF8D00','#00DCA2',
          '#954Eff','#FFCB01','#f65A96','#00BFD0',
          '#FF8BEA','#4D7693','#72577C','#99D750',
          '#DD8270','#C475EE','#7E83FB','#7EB090',
          '#FF9094','#00CCF5','#CF6684','#4E55FF'
        ];
        for(let i=0;i<colorNum-19;i++) {
          this.bgColorList.push(randomcolor())
        }
      },
      formatterFunc:function(params, ticket, callback){
        let chartInfo=this.chartData;
        return `
                <div>
                    <div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;  min-width: 150px; max-width: 600px; line-height: 18px; font-size: 14px;">
                        <div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;margin-bottom: 5px">${this.legend[params.dataIndex].alias}</div>
                        <div style="font-size:12px;display:flex;justify-content: space-between;">
                            <div>value</div>
                            <div>${chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(params.value,null,-1,2)}</div>
                        </div>
                        <div style="font-size:12px;display:flex;justify-content: space-between;">
                            <div>percent</div>
                            <div>${params.percent}%</div>
                        </div>
                    </div>
                </div>
               `
      }
    },
    mounted() {
      this.firstLoad = false;
    },
    beforeDestroy() {
      this.clearChart();
    },
};
</script>
