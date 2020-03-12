<style lang="scss">
  @import './line-chart-block.scss';
</style>
<template>
  <div class="line-chart-block"   :id="'lineChartDiv'+chartIndex" v-show="divFirstShow">
    <loading  :ref="'localLoading'+chartIndex"></loading>
    <!--<div class="edit">

      <div class="list-icon" v-if="firstShow">
        <span @click="refreshChart" :title="$t('dashboard.refresh')" class="set-icon" v-if="showSetting">
          <i class="el-icon-refresh-right"></i>
        </span>
        <span @click="editChart" :title="$t('dashboard.edit')" class="set-icon" v-if="showSetting">
          <i class="el-icon-edit-outline"></i>
        </span>
        <span @click="removeChart" :title="$t('dashboard.delete')" class="set-icon" v-if="showSetting">
          <i class="el-icon-delete"></i>
        </span>
        <span @click="showAllScreen" :title="$t('dashboard.screen')" class="set-icon">
          <i class="el-icon-full-screen"></i>
        </span>
      </div>
    </div>-->
    <div class="clearfix">
      <div class="chart-title" v-show="firstShow">
        {{data.title}}
      </div>
      <div class="nz-btn-group nz-btn-group-light edit button-panel-height" v-show="firstShow">
        <button type="button" @click="refreshChart" style="padding: 6px 14px 5px 14px;" class="nz-btn nz-btn-size-large nz-btn-style-light" v-if="showSetting"><i style="font-size: 16px;" class="global-active-color el-icon-refresh-right"></i></button><button
        @click="editChart" type="button" class="nz-btn nz-btn-size-large nz-btn-style-light" v-if="showSetting"><i class="nz-icon nz-icon-edit"></i></button><button
        @click="removeChart" type="button" class="nz-btn nz-btn-size-large nz-btn-style-light" v-if="showSetting"><i class="el-icon-delete"></i></button><button
        @click="showAllScreen" type="button" class="nz-btn nz-btn-size-large nz-btn-style-light"><i class="el-icon-full-screen"></i></button>
      </div>
    </div>

    <div class="line-area"  ref="lineChartArea"  id="lineChartArea" v-show="firstShow"></div>

    <div class="legend-container"   id="legendArea" ref="legendArea" v-show="firstShow">
      <el-scrollbar style="height: 100%;">
        <div v-for="(item, index) in legendList" :title="item.alias?item.alias:item.name"  @click="clickLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGrey[index]}" :key="'legend_' + item.name+'_'+index">
          <span class="legend-shape" :style="{background:(isGrey[index]?'#D3D3D3':bgColorList[index])}"></span>{{item.alias?item.alias:item.name}}
          <br/><!--bgColorList[index]-->
        </div>
      </el-scrollbar>
    </div>
    <!--
    <Modal title="查看" v-model="screenModal" width="96%" class="line-chart-block-modal">-->
    <el-dialog class="line-chart-block-modal nz-dialog"
               :title="$t('dashboard.panel.view')"
               :visible.sync="screenModal"
               width="90%"
               @close="screenModal = false"
               @opened="initDialog">
      <div slot="title">
        <span class="nz-dialog-title">{{data.title}}</span>
        <div class="float-right panel-calendar dialog-tool">
          <el-date-picker ref="calendar" prefix-icon=" " size="mini" class="nz-dashboard-picker"
                          format="yyyy/MM/dd HH:mm"
                          @change="dateChange"
                          v-model="searchTime"
                          type="datetimerange"
                          :picker-options="pickerOptions"
                          :range-separator="$t('dashboard.panel.to')"
                          :start-placeholder="$t('dashboard.panel.startTime')"
                          :end-placeholder="$t('dashboard.panel.endTime')"
                          align="right">
          </el-date-picker>
          <!--<button @click="refreshChart" type="button" class="nz-btn nz-btn-size-normal nz-btn-style-light"><i style="font-size: 14px;" class="el-icon-refresh-right"></i></button>-->
        </div>
      </div>
      <div class="line-area" ref="screenShowArea"  id="screenShowArea"  style="margin-top:10px;"></div>

      <div class="legend-container legend-container-screen"  id="screenLegendArea" ref="screenLegendArea"  v-show="showLegend">
        <el-scrollbar style="height: 100%;" ref="screenLegendScrollbar">
          <div v-for="(item, index) in screenLegendList" :title="item.alias?item.alias:item.name"  @click="clickScreenLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGreyScreen[index]}"  :key="'legend_' + item.name+'_'+index">
            <span class="legend-shape" :style="{background:(isGreyScreen[index]?'#D3D3D3':bgColorList[index])}"></span>{{item.alias?item.alias:item.name}}
            <br/><!--bgColorList[index]-->
          </div>
        </el-scrollbar>
      </div>

      <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
    </el-dialog>
    <!--</Modal>-->
  </div>
</template>
<script>
  import axios from 'axios';
  import echarts from 'echarts';
  import bus from '../../libs/bus';
  import loading from "../common/loading";
  import chartDataFormat from './chartDataFormat'

  export default {
    name: 'lineChartBlock',
    components: {
      'loading': loading,
    },
    props: {
      editChartId: {
        type: String,
        default: 'editChartId',
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
    },
    data() {
      return {
        data: {}, // 该图表信息,chartItem
        seriesItem: [], // 保存信息
        seriesItemScreen:[],
        images: '',
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
        firstShow: false, // 默认不显示操作按钮,
        showLegend:true,
        searchTime:[new Date().setHours(new Date().getHours()-1),new Date()],
        oldSearchTime:[],
        pickerOptions: {
          shortcuts: [
            {
              text:  this.$t("dashboard.panel.recOne"),
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setHours(start.getHours() - 1);
                picker.$emit('pick', [start, end]);
              }
            },{
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
            },  {
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
            },{
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
            },{
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
    computed: {
      /*
      typeVisible() {
        if (this.data.type === 'line' || this.data.type === 'bar' || this.data.type === 4) {
          return true;
        }
         return false;
      },
  */
    },
    watch: {},
    methods: {
      setDivFirstShow(showDiv){
        this.divFirstShow = showDiv;
      },
      clickLegend(legendName,index){
        // if (this.echartStore) {
        //   this.echartStore.dispatchAction({
        //     type: 'legendToggleSelect',
        //     name: legendName
        //   });
          // let isGreyTmp = this.isGrey[index];
          // this.$set(this.isGrey, index, !isGreyTmp);
        // }

        //点击图表某一个legend，图表只显示当前点击的曲线或柱状图，其它隐藏，再次点击已选中的legend ，显示全部
        let curIsGrey=this.isGrey[index];
        if(this.echartStore){
          this.legendList.forEach((item,i)=>{
            let isGrey = this.isGrey[i];
            if(index != i){
              if(!curIsGrey && !isGrey){
                this.echartStore.dispatchAction({
                  type: 'legendUnSelect',
                  name: item.name
                });
              }else if(!curIsGrey && isGrey){
                this.echartStore.dispatchAction({
                  type: 'legendSelect',
                  name: item.name
                });
              }else{
                this.echartStore.dispatchAction({
                  type: 'legendUnSelect',
                  name: item.name
                });
              }
            }else {
              this.echartStore.dispatchAction({
                type: 'legendSelect',
                name: item.name
              });
            }
          })
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
        // if (this.echartModalStore) {
        //   this.echartModalStore.dispatchAction({
        //     type: 'legendToggleSelect',
        //     name: legendName
        //   });
        //   let isGreyTmp = this.isGreyScreen[index];
        //   this.$set(this.isGreyScreen, index, !isGreyTmp);
        // }
        //点击图表某一个legend，图表只显示当前点击的曲线或柱状图，其它隐藏，再次点击已选中的legend ，显示全部
        let curIsGrey=this.isGreyScreen[index];
        if(this.echartModalStore){
          this.screenLegendList.forEach((item,i)=>{
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
          })
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
        if(this.echartStore){
          this.echartStore.clear();
        }
      },
      formatLegend(chartWidth,name){
        if(!name){
          return '';
        }
        //计算宽度
        var span = document.createElement("span");
        var result = {};
        result.width = span.offsetWidth;
        result.height = span.offsetHeight;
        span.style.visibility = "hidden";
        span.style.fontSize = 14;
        span.style.fontFamily = "Arial";
        span.style.display = "inline-block";
        document.body.appendChild(span);
        if(typeof span.textContent != "undefined"){
          span.textContent = name;
        }else{
          span.innerText = name;
        }
        var txtWidth = parseFloat(window.getComputedStyle(span).width) - result.width;
        document.body.removeChild(span);

        if(txtWidth < chartWidth){
          return name;
        }else {
          var charNum = `${(chartWidth-100)/(txtWidth/name.length)}`;
          return name.slice(0,charNum)+'...';
        }
      },
      // chartSite用于区分是全屏显示还是局部显示
      initChart(chartInfo, dataArg, ele, chartSite,legend) {
        const self = this;
        this.chartType = ''; // 图表类型
        if ( chartInfo.type === 4) {//line,bar
          this.chartType = 'line';
        }
        let chartId = '';

        if (chartSite === 'local') {
          this.echartStore = echarts.init(ele);
          chartId='lineChartArea';
        }else if (chartSite === 'screen') {
          this.echartModalStore = echarts.init(ele);
          chartId='screenShowArea';
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
        var option = {
          title:{
            show:false,
          },
          color: this.bgColorList,
          tooltip: {
            trigger: 'axis',
            confine:false,
            extraCssText:'z-index:1000;',
            /*enterable:true, 导致tooltip不消失，显示多个tooltip*/
            position:function(point,params,dom,rect,size){
              dom.style.transform = "translateZ(0)";
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
                  if((parClientHeight-pointY-(parTop-parScrollTop)-20)>=boxHeight){//说明鼠标上面放不下提示框
                    y = pointY+10;
                  }else {
                    y = pointY-boxHeight;
                  }
                  return [x,y];
                }else {//preview page
                  x = pointX - boxWidth;
                  y = pointY+10;
                  return [x,y];
                }
              }else {
                if(pointX<(viewWidth/2)){//说明鼠标在左边放不下提示框
                  x=pointX+10;
                }else{
                  x = pointX - boxWidth;
                }
                if(pointY<(viewHeight/2)){//说明鼠标上面放不下提示框
                  y = pointY+10;
                }else {
                  y = pointY-boxHeight;
                }
                return [x,y];
              }
            },
            formatter:function(params){
              //display:inline-block;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;
              let str = `<div>`;

              //let str = `<div  style='white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;min-width:150px;max-width:600px;display:inline-block;line-height: 18px;font-size:12px;font-family: Roboto,Helvetica Neue,Arial,sans-serif;'>`;
              params.forEach((item, i) => {
                let tip=legend.find((element)=>{
                  return element.name == item.seriesName;
                })
                if(i===0){
                  let t_date = new Date(item.data[0]);
                  str += [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('-') + " "
                    + [t_date.getHours(), t_date.getMinutes(),t_date.getSeconds()].join(':');
                  str +=`<br/>`;
                }
                let val = parseFloat(Number(item.data[1]).toFixed(2));
                if(val===0){
                  val = Number(item.data[1]);
                }
                str += `<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${item.color};}'></span>${tip?(tip.alias?tip.alias:tip.name):item.seriesName}:  </div>`;
                str += `<div style="padding-left: 10px;">`;
                str += chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(val,null,2);
                str += `</div>`;
                str += `</div>`;
                /*str += `<div style='max-width:500px;display:inline-block;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;line-height: 18px;font-size:12px;font-family: Roboto,Helvetica Neue,Arial,sans-serif;'>`;
                str +=`<span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${item.color};}'></span>${tip?(tip.alias?tip.alias:tip.name):item.seriesName}:  `;
                str +=`</div>`;*/
                // str +=`<div style="display: inline-block;max-width: 10px; min-width: 5px;line-height: 18px;"></div>`;
                /*str += `<div style='max-width:90px;min-width:20px;display:inline-block;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;line-height: 18px;font-size:12px;font-family: Roboto,Helvetica Neue,Arial,sans-serif;'>`;
                str +=chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(val,null,2);
                str +=`</div>`;*/
              });
              str +=`</div>`;
              console.info(str)
              return str;
              // return `<div  style='width:100%;display:block;word-break:break-all;word-wrap:break-word;white-space:normal'><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${params[0].color};}'></span> ${params[0].seriesName}:${params[0].data[1]}</div>`;
            },
          },
          legend: {
            type:'scroll',
            height:80,
            show:false,
            icon:"roundRect",
            itemHeight:5,
            itemWidth:15,
            formatter:function(name){
              //console.log('==========='+name);
              if(!name){
                return '';
              }
              //计算宽度
              var span = document.createElement("span");
              var result = {};
              result.width = span.offsetWidth;
              result.height = span.offsetHeight;
              span.style.visibility = "hidden";
              span.style.fontSize = 14;
              span.style.fontFamily = "Arial";
              span.style.display = "inline-block";
              document.body.appendChild(span);
              if(typeof span.textContent != "undefined"){
                span.textContent = name;
              }else{
                span.innerText = name;
              }
              var txtWidth = parseFloat(window.getComputedStyle(span).width) - result.width;
              document.body.removeChild(span);

              if(txtWidth < chartWidth){
                return name;
              }else {
                var charNum = `${(chartWidth-100)/(txtWidth/name.length)}`;
                return name.slice(0,charNum)+'...';
              }
            },
            tooltip:{
              show:true,
              formatter:function(params){
                //alert(params.length);
                //alert(JSON.stringify(params));

                return `<div  style='width:100%;display:block;word-break:break-all;word-wrap:break-word;white-space:normal'> ${params.name}</div>`;
              },
            },
            data: legend,
            orient:'vertical',
            x:'center',
            y:'bottom',
            //top:'5%',
            //bottom:0
          },
          grid: {
            top: 13,
            left: 0,
            right: 30,
            containLabel: true,
            bottom:35,//156
          },
          dataZoom: [{
            type: 'slider',
            show:true,
            xAxisIndex: [0],
            start: 0,
            end: 100,
            height:25,
            bottom:10,//96
            left:40,
            right:48,
          }
            /*
            , {
              start: 0,
              end: 100,
              handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
              handleSize: '80%',
              handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2
              }


            }
            */],

          xAxis: {
            type: 'time',
            //boundaryGap: false,//line-false; bar-true;
            //data: ['20190101', '20190102', '周三', '周四', '周五', '周六', '周日']
            axisLabel: {
              intervale: 0,
              rotate: 0,
              formatter: function (value) {
                var t_date = new Date(value);
                return [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('-') + "\n"
                  + [t_date.getHours(), t_date.getMinutes()].join(':');
              }
            },
            axisPointer: {//y轴上显示指针对应的值
              show: true,
            },
            splitLine:{
              show:false
            }
          },
          yAxis: {
            type: 'value',
            splitLine:{
              show:true
            },
            axisLabel: {
              formatter: function(value,index){
                let chartUnit=chartInfo.unit;
                chartUnit=chartUnit?chartUnit:2;
                let unit=chartDataFormat.getUnit(chartUnit);
                return unit.compute(value,index);
              },
            },
            //boundaryGap:[0,0.2]
          },
          useUTC: false,//使用本地时间
          series: dataArg
        };
        // params.series = dataArg;
        if (chartSite === 'local') { // 本地显示
          /*
          option.series = dataArg.map((item) => {// params.series = dataArg.map((item) => {
            const obj = Object.assign(item);
            /*
            obj.events = {
              // eslint-disable-next-line
              legendItemClick: function(event) {//点击metric的事件，可以用默认的先
                event.preventDefault();
                let visibleAll = true; // 全部显示
                let visibleThis = true; // 点击是否是当前显示的那个条目
                self.highchartStore.series.forEach((serie, i) => {
                  // 最后一个为导航,排除。
                  if (i !== self.highchartStore.series.length - 1) {
                    // 查看是否为显示一条状态数据,如果有非显示状态的,表示当前只显示一条数据
                    if (!serie.visible) {
                      visibleAll = false;
                      // 点击前显示单个,判断是否点击为正在显示那个,该种情况表示点击了其他隐藏状态数据
                      if (event.target.index === i) { // one to another
                        visibleThis = false;
                      }
                    }
                  }
                });
                // 根据visibleAll和visibleThis判断是要显示一个还是全显示
                // 当visibleAll为true(表示all => one)
                // visibleAll为false: visibleThis为false(one => another one)。
                // visibleAll为false: visibleThis为true(one => all)。
                if (visibleAll || !visibleThis) { // 隐藏显示其中一个
                  self.highchartStore.series.forEach((serie, i) => {
                    const operateObj = serie;
                    // 除显示条目以外,还有一条serie是导航栏
                    if (i !== self.highchartStore.series.length - 1) {
                      if (event.target.index === i) {
                        operateObj.setVisible(true, false);
                      } else {
                        operateObj.setVisible(false, false);
                      }
                    } else {
                      operateObj.setVisible(true, false);
                    }
                  });
                  self.highchartStore.redraw();
                } else { // 全部显示
                  self.highchartStore.series.forEach((serie) => {
                    const operateObj = serie;
                    operateObj.setVisible(true, false);
                  });
                  self.highchartStore.redraw();
                }
              },
            };

            return obj;
          });
          */
          if(legend){
            this.legendList = [];
            legend.forEach((item, i) => {
              const legend = {
                name:item.name,
                alias:item.alias,
                showText:this.formatLegend(chartWidth,item.name)
              };
              this.legendList.push(legend);
              this.isGrey.push(false);
            });
          }
          this.$nextTick(() => {
            let divHeight = this.$refs.legendArea.offsetHeight;
            if(!chartInfo.height){
              this.echartStore.resize({height:(400-divHeight-35)});
            }else {
              this.echartStore.resize({height:(chartInfo.height-divHeight-25-35)});
            }

            this.echartStore.clear();
            //option.title = title;
            this.echartStore.setOption(option);//创建图表
            console.log('图表参数')
            console.log(option)
            this.$refs['localLoading'+this.chartIndex].endLoading();
            this.firstShow = true; // 展示操作按键
          });

        } else if (chartSite === 'screen') { // 全屏显示
          /*
          option.series = dataArg.map((item) => {// params.series = dataArg.map((item) => {
            const obj = Object.assign(item);
            obj.events = {
              // eslint-disable-next-line
              legendItemClick: function(event) {
                event.preventDefault();
                let visibleAll = true; // 全部显示
                let visibleThis = true; // 点击是否是当前显示的那个条目
                self.highchartModalStore.series.forEach((serie, i) => {
                  if (i !== self.highchartModalStore.series.length - 1) {
                    if (!serie.visible) {
                      visibleAll = false;
                      if (event.target.index === i) {
                        visibleThis = false;
                      }
                    }
                  }
                });
                if (visibleAll || !visibleThis) {
                  self.highchartModalStore.series.forEach((serie, i) => {
                    const operateObj = serie;
                    if (i !== self.highchartModalStore.series.length - 1) {
                      if (event.target.index === i) {
                        operateObj.setVisible(true, false);
                      } else {
                        operateObj.setVisible(false, false);
                      }
                    } else {
                      operateObj.setVisible(true, false);
                    }
                  });
                  self.highchartModalStore.redraw();
                } else {
                  self.highchartModalStore.series.forEach((serie) => {
                    const operateObj = serie;
                    operateObj.setVisible(true, false);
                  });
                  self.highchartModalStore.redraw();
                }
              },
            };
            return obj;
          });
          */
          // eslint-disable-next-line
          if(this.echartModalStore){
            this.echartModalStore.clear();
          }
          option.title = {};
          this.echartModalStore.setOption(option);//显示全屏界面
          this.showLegend = true;
          this.$refs['localLoadingScreen'+this.chartIndex].endLoading();
          if(legend){
            this.screenLegendList = [];
            legend.forEach((item, i) => {
              const legend = {
                name:item.name,
                alias:item.alias,
                showText:this.formatLegend(chartWidth,item.alias?item.alias:item.name)
              };
              this.screenLegendList.push(legend);
              this.isGreyScreen.push(false);
            });
          }
          this.$nextTick(() => {
            this.$refs.screenLegendScrollbar.update();
            /*let divHeight = this.$refs.screenLegendArea.offsetHeight;
            this.echartModalStore.resize({height: '100%'});*/
          });
        }
      },
      handleLineFeed(str,chartWidth){
        let rlt='';
        if(!str){
          return '';
        }
        //计算宽度
        var span = document.createElement("span");
        var result = {};
        result.width = span.offsetWidth;
        result.height = span.offsetHeight;
        span.style.visibility = "hidden";
        span.style.fontSize = 14;
        span.style.fontFamily = "Arial";
        span.style.display = "inline-block";
        document.body.appendChild(span);
        if(typeof span.textContent != "undefined"){
          span.textContent = str;
        }else{
          span.innerText = str;
        }
        var txtWidth = parseFloat(window.getComputedStyle(span).width) - result.width;
        document.body.removeChild(span);

        if(txtWidth < chartWidth){
          return str;
        }else {
          var charNum = `${(chartWidth-100)/(txtWidth/str.length)}`;
          return str.slice(0,charNum)+'...';
        }
        /*
        if(txtWidth < (chartWidth-30)){
          return str;
        }else {
          var charNum = `${(chartWidth-200)/(txtWidth/str.length)}`;//一行的字符数
          charNum = parseInt(charNum);
          if(str.length>charNum){
            let num = `${str.length/charNum}`;
            num = parseInt(num)+1;
            for(let i=0;i<num;i++){
              rlt += str.substring(charNum*i,charNum*(i+1))+'\n';
            }
          }else {
            return str;
          }
        }
        */
        //return rlt;
      },
      // 设置数据, filter区分
      setData(chartItem, seriesItem, panelId, filter,legend,area) {
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
          //设置高度 chart-table
          this.$nextTick(() => {
            const chartBox = document.getElementById('lineChartDiv'+this.chartIndex);
            let height = chartItem.height;
            if(height<200){
              height = 200;
            }
            chartBox.style.height = `${height-25}px`;
          });
          this.$refs['localLoading'+this.chartIndex].startLoading();
          this.divFirstShow = true;
          this.firstShow = true; // 展示操作按键
          this.panelIdInner = panelId;
          this.data = chartItem;
          this.seriesItem = seriesItem;
          this.seriesItemScreen = seriesItem;

          if (filter) { // 保存数据,用于同步时间
            this.stableFilter = filter;
            this.searchTime[0] = filter.start_time;
            this.searchTime[1] = filter.end_time;
            this.oldSearchTime[0] = this.searchTime[0];
            this.oldSearchTime[1] = this.searchTime[1];
          }
          //this.$refs['localLoading'+this.chartIndex].endLoading();
          this.initChart(chartItem, seriesItem, this.$refs.lineChartArea, 'local',legend);
        }

      },
      clearChart(){
        if(this.echartStore){
          this.echartStore.clear();
        }
        if(this.echartModalStore){
          this.echartModalStore.clear();
        }
      },
      // 删除该图表
      removeChart() {
        this.$emit('on-remove-chart-block', this.data.id);
      },
      // 编辑图表
      editChart() {
        this.$emit('on-edit-chart-block', this.data.id);
      },
      // 重新请求数据 刷新操作
      refreshChart() {
        this.clearChart();
        this.$refs['localLoading'+this.chartIndex].startLoading();
        this.firstShow = false;
        this.$emit('on-refresh-data', this.data.id);
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
        // 初始化同步时间
        this.filter.start_time = this.stableFilter.start_time;
        this.filter.end_time = this.stableFilter.end_time;
        this.searchTime = this.oldSearchTime;
        this.screenModal = true;
        this.isGreyScreen=[];

        this.seriesItemScreen = this.seriesItem;
/*
        this.searchTime = [];
        this.searchTime[0] = this.oldSearchTime[0];//将列表的查询时间复制给全屏的查询时间
        this.searchTime[1] = this.oldSearchTime[1];
        this.seriesItemScreen = this.seriesItem;
        this.screenModal = true;
        */
        //this.dateChange();
      },
      dateChange(time) {
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
              return  this.$get('/prom/api/v1/query_range?query='+filterItem.expression+"&start="+startTime+"&end="+endTime+'&step='+step);
            });
          } else if (type === 'dashboard') { // 概览模式,指标概览中使用
            // 概览模式,需要区分单独一个和多个
            if (this.stableFilter.chartCount === 'multiple') {
              axiosArr = [this.$get('/prom/api/v1/query_range?query='+this.data.title+"&start="+startTime+"&end="+endTime+'&step='+step)];
            } else {
              axiosArr = [this.$get('/prom/api/v1/query_range?query='+this.data.elements[0].expression+"&start="+startTime+"&end="+endTime+'&step='+step)];
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
                  if (response.data.result) {
                    // 循环处理每个elements下获取的数据列
                    response.data.result.forEach((queryItem,innerPos) => {
                      const seriesItem = {
                        theData: {
                          name: '',
                          symbol:'none',  //去掉点
                          smooth:true,  //曲线变平滑
                          data: [],
                          type:this.data.type,
                          //visible: true,
                          //threshold: null,
                        },
                        metric_name: '',
                      };
                      // if(chartInfo.type === 'stackArea'){
                      //   seriesItem.theData.type='line';
                      //   // seriesItem.theData.stack=chartInfo.title
                      //   seriesItem.theData.areaStyle={};
                      // }
                      // 图表中每条线的名字,后半部分
                      // let host = `${queryItem.metric.__name__}{`;//up,
                      let host = '';//up,
                      if(queryItem.metric.__name__){
                        host = `${queryItem.metric.__name__}{`;//up,
                      }
                      const tagsArr = Object.keys(queryItem.metric);//["__name__","asset","idc","instance","job","module","project"]
                      // 设置时间-数据格式对
                      const dpsArr = Object.entries(queryItem.values);//[ ["0",[1577959830.781,"0"]], ["1",[1577959845.781,"0"]] ]
                      // 判断是否有数据
                      if (dpsArr.length > 0 && tagsArr.length > 0) {
                        tagsArr.forEach((tag, i) => {
                          if (tag !== '__name__') {
                            host += `${tag}="${queryItem.metric[tag]}",`;
                          }
                        });
                        if(host.endsWith(',')){host = host.substr(0,host.length-1);}
                        host +="}";
                        let alias=this.dealLegendAlias(host,this.data.elements[pos].legend);
                        legend.push({name:host,alias:alias});
                        // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c
                        seriesItem.theData.name = host;
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
                }
              });
              /*
              if (series.length && this.data.type === 4) {
                series.push(sumData);
              }
              */
              this.initChart(this.data, series, this.$refs.screenShowArea, 'screen',legend);
            }
          }).catch((error) => {
            if (error) {
              this.$message.error(error.toString());
            }
          });
        });
      },
      showLoad(chartItem) {
        //设置高度
        this.$nextTick(() => {
          const chartBox = document.getElementById('lineChartDiv'+this.chartIndex);
          let height = chartItem.height;
          if(height<200){
            height = 200;
          }
          chartBox.style.height = `${height-25}px`;
          //const tableBox = document.getElementById('tableContainer');
         // const chartBox = document.getElementById('lineChartDiv'+this.chartIndex);
          //tableBox.style.height = `${height-75}px`;
        });
        this.clearData();
        this.firstShow = false;
        this.$refs['localLoading'+this.chartIndex].startLoading();
        this.divFirstShow = true;

        /*
        if (this.echartStore) {
          this.echartStore.showLoading();
        }
        */
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
        if (num >= 1000) {
          const kbNum = num / 1000;
          if (kbNum >= 1000) {
            const mbNum = kbNum / 1000;
            if (mbNum > 1000) {
              const gbNum = mbNum / 1000;
              /*
              if (gbNum > 1000) {
                const tbNum = gbNum / 1000;
                if (tbNum > 1000) {
                  const pbNum = tbNum / 1000;
                  return `${pbNum.toFixed(2)}PB`;
                }
                return `${tbNum.toFixed(2)}TB`;
              }*/
              return `${gbNum.toFixed(2)}B`;
            }
            return `${mbNum.toFixed(2)}M`;
          }
          return `${kbNum.toFixed(2)}K`;
        }
        return num.toFixed(2);
      },
      handleClose(){},
      /*
      handleClose(done) {
        /*
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});

      },*/
      /*
        // 展示图表编辑区
        showTool() {
          this.toolbox = !this.toolbox;
        },
        // 修改图表类型
        changeChart(type) {
          this.chartType = type;
          this.highchartStore.update({
            chart: {
              type: this.chartType,
            },
          });
        },

        dateChange(time) {
          this.filter.start_time = `${time[0]}:00`;
          this.filter.end_time = `${time[1]}:59`;
          if (this.showSetting) {
            this.getQueryChart('list');
          } else {
            this.getQueryChart('dashboard');
          }
        },
        // 查询数据,修改日期查询全屏数据
        getQueryChart(type) {
          if (this.highchartModalStore) {
            this.highchartModalStore.showLoading();
          }
          let axiosArr = [];
          if (type === 'list') { // 普通模式,主控台使用
            axiosArr = this.data.elements.map((ele) => {
              const filterItem = ele;
              return getQueryChart({
                product_id: this.productId,
                metric: filterItem.metric,
                tags: filterItem.tags,
                start: this.filter.start_time,
                end: this.filter.end_time,
              });
            });
          } else if (type === 'dashboard') { // 概览模式,指标概览中使用
            // 概览模式,需要区分单独一个和多个
            if (this.stableFilter.chartCount === 'multiple') {
              // 所有tag标签
              const tagAllArr = this.proTags(this.data.tags);
              // 根据title格式化的标签
              const titles = this.data.title.split(',');
              const titleArr = titles.map(item => item.trim());
              // 获取所需标签
              const tagArr = this.getCompilation(tagAllArr, titleArr);
              axiosArr = [getQueryChart({
                product_id: this.productId,
                metric: this.data.metric,
                tags: tagArr.toString(),
                start: this.filter.start_time,
                end: this.filter.end_time,
              })];
            } else {
              axiosArr = [getQueryChart({
                product_id: this.productId,
                metric: this.data.metric,
                tags: this.data.tags,
                start: this.filter.start_time,
                end: this.filter.end_time,
              })];
            }
          }
          // 一个图表
          axios.all(axiosArr).then((res) => {
            if (res.length > 0) {
              const series = [];
              const sumData = {
                name: 'sum',
                data: [],
                visible: true,
                threshold: null,
              };
              res.forEach((response) => {
                if (response.data.code === 200) {
                  if (response.data.data) {
                    // 循环处理每个elements下获取的数据列
                    response.data.data.forEach((queryItem) => {
                      const seriesItem = {
                        theData: {
                          name: '',
                          data: [],
                          visible: true,
                          threshold: null,
                        },
                        metric_name: '',
                      };
                      // 图表中每条线的名字,后半部分
                      let host = `${queryItem.metric}, `;
                      const tagsArr = Object.keys(queryItem.tags);
                      // 设置时间-数据格式对
                      const dpsArr = Object.entries(queryItem.dps);
                      if (tagsArr.length > 0 && dpsArr.length > 0) {
                        tagsArr.forEach((tag, i) => {
                          if (tag !== 'uuid') {
                            host += i === 0 ? `${tag}=${queryItem.tags[tag]}` : `, ${tag}=${queryItem.tags[tag]}`;
                          }
                        });
                        // 图表中每条线的名字,去掉最后的逗号与空格
                        seriesItem.theData.name = host;
                        seriesItem.metric_name = seriesItem.theData.name;
                        // 将秒改为毫秒
                        seriesItem.theData.data = dpsArr.map((dpsItem, dpsIndex) => {
                          if (sumData.data[dpsIndex]) {
                            const sumNum = sumData.data[dpsIndex][1] || 0;
                            sumData.data[dpsIndex][1] = sumNum + dpsItem[1];
                          } else {
                            sumData.data[dpsIndex] = [dpsItem[0] * 1000, dpsItem[1]];
                          }
                          return [dpsItem[0] * 1000, dpsItem[1]];
                        });
                        series.push(seriesItem.theData);
                      }
                    });
                  }
                }
              });
              if (series.length && this.data.type === 4) {
                series.push(sumData);
              }
              this.initChart(this.data, series, this.$refs.screenShowArea, 'screen');
            }
          }).catch((error) => {
            if (error) {
              this.$Message.warning({
                content: '请稍后刷新',
                duration: 3,
              });
            }
          });
        },


        // 获取tag数组
        proTags(data) {
          const dou = data.indexOf(',');
          const tmp = [];
          if (dou === -1) {
            const set = data.split('=');
            if (set[1].indexOf('|') > -1) {
              const valueArr = set[1].split('|');
              valueArr.forEach((keyV) => {
                tmp.push(`${set[0]}=${keyV}`);
              });
            } else {
              tmp.push(`${set[0]}=${set[1]}`);
            }
          } else {
            const mid = data.split(','); // ['key=v1','key=v2',....]
            mid.forEach((item) => {
              const setInner = item.split('=');
              if (setInner[1].indexOf('|') > -1) {
                const valueArr = setInner[1].split('|');
                valueArr.forEach((keyV) => {
                  tmp.push(`${setInner[0]}=${keyV}`);
                });
              } else {
                tmp.push(`${setInner[0]}=${setInner[1]}`);
              }
            });
          }
          return tmp;
        },
        // 获取交集,取得所需tags进行查询,k1=v1,k2=v2
        getCompilation(arr1, arr2) {
          const arr = [];
          if (arr1.length && arr2.length) {
            arr1.forEach((item) => {
              if (arr2.indexOf(item) > -1) {
                arr.push(item);
              }
            });
            return arr;
          }
          return [];
        },
        */
    },
    mounted() {
      this.firstLoad = false;
      /*
      let Myecharts2 = echarts.init(document.getElementById('lineChartArea'));
      console.log(Myecharts2);

      setTimeout(function () {
        Myecharts2.resize()
      }, 500)
*/
    },
    beforeDestroy() {
      this.clearChart();
    },
  };

</script>
