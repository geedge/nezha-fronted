<style scope>
  .chart-bottom {
    text-align: center;
    margin-top: 16px;
  }
</style>
<template>
  <span>
    <div class="sub-top-tools">
      <div class="sub-list-tabs">
        <div class="sub-list-tab-title">{{$t("project.endpoint.endpointId")}}: {{currentEndpoint ? currentEndpoint.id : ''}}</div><div
        class="sub-list-tab" @click="changeTab('detail')">{{$t("overall.detail")}}</div><div
        class="sub-list-tab sub-list-tab-active">{{$t("overall.query")}}</div><div
        class="sub-list-tab" v-if="from == 'endpoint'" @click="changeTab('assetDetail')">{{$t("project.endpoint.asset")}}</div>
      </div>
      <div class="top-tool-right">
        <div class="top-tool-search margin-r-20">
          <el-input ref="elementQuery" @clear="clearInput" id="elementQuery" @focus="focusInput"  @blur="blurInput" v-model="queryExpression" class="query-input-inactive" size="mini" clearable  :placeholder="$t('project.endpoint.promExpr')" >
            <i slot="suffix" class="el-input__icon el-icon-search" style="float:right" @click="focusInput"></i>
          </el-input>
        </div>
        <div class="margin-r-20 nz-btn-group nz-btn-group-size-small nz-btn-group-light">
          <button @click="changeTime(-10)" class="nz-btn nz-btn-size-normal nz-btn-style-light change-time-height nz-input-group-prepend"><i class="el-icon-d-arrow-left"></i></button><el-date-picker
          v-model="formatTime"
          type="datetime"
          size="mini"
          class="project-calendar nz-input-group-middle"
          clearable
          :time-arrow-control="true"
          placeholder="Moment"
          value-format="yyyy-MM-dd HH:mm:ss"
          @change="pickTime"
        >
          </el-date-picker><button @click="changeTime(10)" class="nz-btn nz-btn-size-normal nz-btn-style-light change-time-height nz-input-group-append"><i class="el-icon-d-arrow-right"></i></button>
        </div>
        <el-dropdown split-button type="primary"  size="mini" class="dropdownBtn" @click="viewGraph">
          <i class="nz-icon nz-icon-chart"  :class="{'control-icon-unchecked':selectedEndpoints.length<1,'control-icon-checked':selectedEndpoints.length>0}"></i>
          <el-dropdown-menu slot="dropdown" style="padding:10px 4px 10px 10px;">
            <el-row>
              <el-col :span="16" style="padding-top: 4px;padding-left: 1px"><span style="padding-top: 2px">{{$t('project.endpoint.hideSameLabels')}}</span></el-col>
              <el-col :span="8">
                <el-dropdown-item class="dropdown-content" >
                  <el-switch v-model="hideSameLabels" active-color="#ee9d3f" size="small"></el-switch>
                </el-dropdown-item>
              </el-col>
            </el-row>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="table-header-inner" @click="clearSelectedMetrics"><span><i style="font-size: 12px;margin-left: 2px;" class="nz-icon nz-icon-close " :class="{'control-icon-unchecked':selectedEndpoints.length<1,'control-icon-checked':selectedEndpoints.length>0}"></i></span></div>
    <pl-table :row-height="28" use-virtual :datas="tableData" border :empty-text="$t('config.mib.noData')" :header-cell-class-name="cellClass" :style="{height: $tableHeight.noPagination}"
              class="nz-table endpoint-query-table" style="width: 100%;" v-loading="loading" v-scrollBar:el-table="'large'" :pagination-show="false" ref="endpointQueryTable"
              @selection-change="selectChange">
      <pl-table-column
        :resizable="false"
        type="selection"
        width="39"
        align="center"
        :selectable="selectable">
      </pl-table-column>
      <pl-table-column
        prop="element"
        :label="$t('project.endpoint.element')">
        <template v-slot="scope">
          <el-popover trigger="click" placement="right" v-if="typeof scope.row.metricTip != 'undefined' && scope.row.metricTip != null">
            <div>
              <ul>
                <li><span class="metirc-tip-list">metric&nbsp;:&nbsp;</span><span>{{scope.row.metricTip.metric?scope.row.metricTip.metric:'&#45;&#45;'}}</span></li>
                <li><span class="metirc-tip-list">type&nbsp;:&nbsp;</span><span>{{scope.row.metricTip.type?scope.row.metricTip.type:'unknown'}}</span></li>
                <li><span class="metirc-tip-list">help&nbsp;:&nbsp;</span><span>{{scope.row.metricTip.help?scope.row.metricTip.help:'&#45;&#45;'}}</span></li>
                <li><span class="metirc-tip-list">unit&nbsp;:&nbsp;</span><span>{{scope.row.metricTip.unit?scope.row.metricTip.unit:'&#45;&#45;'}}</span></li>
              </ul>
            </div>
            <span slot="reference"><i class="nz-icon nz-icon-info-normal metric-tip-icon"></i></span>
          </el-popover>
          <span v-html="hideSameLabels?scope.row.colorSimpleElement: scope.row.colorElement"></span>
        </template>
      </pl-table-column>
      <pl-table-column
        :resizable="false"
        prop="value"
        :label="$t('project.endpoint.value')"
        width="180">
      </pl-table-column>
    </pl-table>
    <!--<el-table
      :data="tableData"
      border
      v-scrollBar:el-table="'normal'"
      class="nz-table endpoint-query-table"
      v-loading="loading"
      :header-cell-class-name="cellClass"
      :height="$tableHeight.noPagination"
      @selection-change="selectChange"
      ref="endpointQueryTable"
      style="width: 100%;">
      <el-table-column
        :resizable="false"
        type="selection"
        width="38"
        align="center"
        :selectable="selectable"
      >
      </el-table-column>

      <el-table-column
        prop="element"
        :label="$t('project.endpoint.element')">
        <template slot-scope="scope">
          <el-popover trigger="click" placement="right" v-if="typeof scope.row.metricTip != 'undefined' && scope.row.metricTip != null">
            <div>
              <ul>
                <li><span class="metirc-tip-list">metric&nbsp;:&nbsp;</span><span>{{scope.row.metricTip.metric?scope.row.metricTip.metric:'&#45;&#45;'}}</span></li>
                <li><span class="metirc-tip-list">type&nbsp;:&nbsp;</span><span>{{scope.row.metricTip.type?scope.row.metricTip.type:'unknown'}}</span></li>
                <li><span class="metirc-tip-list">help&nbsp;:&nbsp;</span><span>{{scope.row.metricTip.help?scope.row.metricTip.help:'&#45;&#45;'}}</span></li>
                <li><span class="metirc-tip-list">unit&nbsp;:&nbsp;</span><span>{{scope.row.metricTip.unit?scope.row.metricTip.unit:'&#45;&#45;'}}</span></li>
              </ul>
            </div>
            <span slot="reference"><i class="nz-icon nz-icon-info-normal metric-tip-icon"></i></span>
          </el-popover>
          <span v-html="hideSameLabels?scope.row.colorSimpleElement: scope.row.colorElement"></span>
          &lt;!&ndash;            <span>{{hideSameLabels?scope.row.simpleElement: scope.row.element}}</span>&ndash;&gt;
        </template>
      </el-table-column>
      <el-table-column
        :resizable="false"
        prop="value"
        :label="$t('project.endpoint.value')"
        width="180">
      </el-table-column>
    </el-table>-->
    <button class="to-top" v-show="showTopBtn" :class="{'to-top-is-hover': tableHover}" @click="$('ps', 1)"><i class="nz-icon nz-icon-top"></i></button>

    <el-dialog class="line-chart-block-modal nz-dialog"
               :title="$t('project.endpoint.dialogTitle')"
               :visible.sync="graphShow"
               width="90%"
               id="viewGraphDialog"
               @close="dialogClose">
      <div slot="title">
        {{$t("project.endpoint.dialogTitle")}}
        <div class="float-right panel-calendar dialog-tool">
          <el-date-picker ref="calendar" prefix-icon=" " size="mini" class="nz-dashboard-picker"
                          @change="dateChange"
                          v-model="searchTime"
                          type="datetimerange"
                          :picker-options="pickerOptions"
                          :range-separator="$t('dashboard.panel.to')"
                          :start-placeholder="$t('dashboard.panel.startTime')"
                          :end-placeholder="$t('dashboard.panel.endTime')"
                          value-format="yyyy-MM-dd hh:mm:ss"
                          align="right">
          </el-date-picker>
          <!--<button @click="refreshChart" type="button" class="nz-btn nz-btn-size-normal nz-btn-style-light"><i style="font-size: 14px;" class="el-icon-refresh-right"></i></button>-->
        </div>
      </div>
      <div class="line-area" ref="viewGraphChart" id="viewGraphChart"></div>
      <div class="legend-container" id="legendArea" ref="legendArea">
        <el-scrollbar style="height: 100%" ref="chartScrollbar">
          <div v-for="(item, index) in legend" :title="hideSameLabels&&item.alias?item.alias:item.name"  @click="clickLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGrey[index]}" :key="'legend_' + item.name+'_'+index">
            <span class="legend-shape" :style="{background:(isGrey[index]?'#D3D3D3':bgColorList[index])}"></span>{{hideSameLabels&&item.alias?item.alias:item.name}}
            <br/>
          </div>
        </el-scrollbar>
      </div>
      <div class="line-100 margin-t-10"></div>
      <div class="chart-bottom">
        <button class="nz-btn nz-btn-size-large nz-btn-style-normal nz-btn-min-width-82" @click="saveChart">{{$t('dashboard.metric.saveChart')}}</button>
      </div>
      <loading  ref="graphLoading"></loading>
    </el-dialog>

    <chart-box ref="addChartModal" :panel-data="panelData" @on-create-success="createSuccess" @reloadOnlyPanel="getPanelData" @reload="getPanelData"></chart-box>
  </span>
</template>

<script>
  import echarts from 'echarts';
  import chartBox from "../../../page/dashboard/chartBox";
  import axios from 'axios';
  import loading from "../../loading";
  import bus from "../../../../libs/bus";
  import chartDataFormat from "../../../charts/chartDataFormat";

  export default {
    name: "endpointQueryTab",
    components: {
      'chart-box': chartBox,
      'loading': loading
    },
    props: {
      obj: Object, //关联的实体对象
      from: String,
    },
    data() {
      let temp = this;
      return {
        tableHover: false,
        loading: false,
        showTopBtn: false, //主列表top按钮
        currentEndpoint: {},
        queryData: [],//endpoint 查询列表数据
        tableData:[],
        tableDataCopy: '',
        queryExpression: '',
        elementMetricDatas:[],//element 列提示信息列表
        formatTime: '',//查询endpoint的时间，
        selectedEndpoints:[],//选中的metric{label='value'}
        chartDatas:[],//从query_range查询到的数据
        legend:[],//echart legend
        graphChart:null,//图标对象
        graphShow:false,
        searchTime:[],
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
        chartOptions:{
          color: temp.bgColorList,
          title: {
            text: ""
          },
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
            },
            formatter:function(params){
              //display:inline-block;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;
              let str = `<div >`;
              params.forEach((item, i) => {
                let tip=temp.legend.find((element)=>{
                  return element.name == item.seriesName;
                })
                if(i===0){
                  let value=bus.computeTimezone(item.data[0]);
                  let t_date = new Date(value);
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
                str += chartDataFormat.short(val,null,2);
                str += `</div>`;
                str += `</div>`;
              });
              str +=`</div>`;
              return str;
            },
          },
          legend: {
            show:false,
            type:'scroll',
            height:80,
            icon:"roundRect",
            itemHeight:5,
            itemWidth:15,
            data:[],
            orient:'vertical',
            formatter:function(name){
              if(!name){
                return '';
              }
              //计算宽度
              let chartWidth=temp.$refs.viewGraphChart.clientWidth;
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
                //console.log("params")
                //console.log(params);
                return `<div  style='width:100%;display:block;word-break:break-all;word-wrap:break-word;white-space:normal'> ${params.name}</div>`;
              },
            },
            orient:'vertical',
            x:'center',
            y:'bottom',
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
            bottom:10//96
          }],

          xAxis: {
            type: 'time',
            axisLabel: {
              intervale: 0,
              rotate: 0,
              formatter: function (value) {
                value = bus.computeTimezone(value);
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
              formatter: function(num,index) {
                return chartDataFormat.short(num,index)
              },
            },
          },
          useUTC: false,//使用本地时间
          series: []
        },
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
        panelData: [], //chart-box的panel下拉框数据,
        hideSameLabels: true,
        sameLabels:['instance','module','project','asset','endpoint','datacenter'],
      }
    },
    methods: {
      changeTab(tab) {
        this.$emit('changeTab', tab);
      },
      clickLegend(legendName,index){
        //点击图表某一个legend，图表只显示当前点击的曲线或柱状图，其它隐藏，再次点击已选中的legend ，显示全部
        let curIsGrey=this.isGrey[index];
        if(this.graphChart){
          this.legend.forEach((item,i)=>{
            let isGrey = this.isGrey[i];
            if(index != i){
              if(!curIsGrey && !isGrey){
                this.graphChart.dispatchAction({
                  type: 'legendUnSelect',
                  name: item.name
                });
              }else if(!curIsGrey && isGrey){
                this.graphChart.dispatchAction({
                  type: 'legendSelect',
                  name: item.name
                });
              }else{
                this.graphChart.dispatchAction({
                  type: 'legendUnSelect',
                  name: item.name
                });
              }
            }else {
              this.graphChart.dispatchAction({
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
      formatLegend(name,chartWidth){
        if(!name){
          return '';
        }
        if(!chartWidth){
          this.$refs.viewGraphChart.clientWidth;
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
      saveChart() { //新增chart
        this.$refs.addChartModal.setTitle(this.$t("dashboard.panel.createChartTitle"));
        this.$refs.addChartModal.show(true);
        let metricInfo = {};
        metricInfo.elements = [];
        //console.info("aaa", this.selectedEndpoints)
        for(let i = 0; i < this.selectedEndpoints.length; i++) {
          let type = '';
          if (this.selectedEndpoints[i].type == '1') {
            type = 'expert';
          } else if (this.selectedEndpoints[i].type == '2') {
            type = 'normal';
          }
          metricInfo.elements.push({expression: this.selectedEndpoints[i].element, type: type});
        }
        this.$refs.addChartModal.createData(-1, metricInfo);
      },
      createSuccess(type, response, param, panel) {
        this.$confirm(this.$t("dashboard.metric.goPanelTip"),this.$t("tip.saveSuccess"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'success'
        }).then(() => {
          bus.$emit("menu-change", 'panel');
          this.$store.state.showPanel.id = panel.id;
          this.$store.state.showPanel.name = panel.name;
          console.info(this.$router)
          this.$router.push({
            path: "/panel",
            query: {
              t: +new Date()
            }
          });
        });
      },
      queryEndpoint() {
        this.loading = true;
        this.queryElementTips();
        this.queryData = [];
        this.tableData = [];
        this.tableDataCopy = '';
        this.$get("/prom/api/v1/query?query={endpoint='" + this.currentEndpoint.id + "'}&time=" + this.formatTime).then(response=>{
          setTimeout(() => {
            this.loading = false;
            if(response.status==="success"){
              let results = response.data.result;
              this.queryData=JSON.parse(JSON.stringify(results));
              for(let result of results) {
                let metricName = result.metric.__name__;
                let temp = metricName;
                let simpleTemp = metricName;//显示简略信息：隐藏same labels后的结果
                let metricColor = "";
                let bracketsColor = "#eb7b18";//#eb7b18
                let labelColor = "#65bbd1";//#66d9ef
                let valueColor = "#61c261";//#74e680
                let colorTemp = `<span style="${metricColor}">${metricName}</span>`;
                let colorSimpleTemp = `<span>${metricName}</span>`;
                let metricTip = {};
                let queryInfos = (this.elementMetricDatas.filter((item)=> {
                  return item.metric === temp;
                }));
                if(queryInfos && queryInfos.length > 0) {
                  metricTip = queryInfos[0];
                } else {
                  metricTip.metric=temp;
                }
                delete result.metric.__name__;
                temp += "{";
                simpleTemp += "{";
                colorTemp += `<span style="color: ${bracketsColor}">{</span>`;
                colorSimpleTemp += `<span style="color: ${bracketsColor}">{</span>`;
                let keys = Object.keys(result.metric);
                for (let index in keys){
                  let key = keys[index];
                  temp += key + "='" + result.metric[key] + "',";
                  colorTemp += `<span style="color: ${labelColor}">${key}</span>=<span style="color: ${valueColor}">'${result.metric[key]}'</span>,`;
                  if(!this.sameLabels.some((i)=> {return i == key})) {
                    simpleTemp += key + "='" + result.metric[key] + "',";
                    colorSimpleTemp += `<span style="color: ${labelColor}">${key}</span>=<span style="color: ${valueColor}">'${result.metric[key]}'</span>,`;
                  }
                }
                if(temp.indexOf(',') != -1){
                  temp = temp.substr(0,temp.length-1);
                }
                if(simpleTemp.indexOf(',') != -1){
                  simpleTemp = simpleTemp.substr(0,simpleTemp.length-1);
                }
                if(colorTemp.indexOf(',') != -1){
                  colorTemp = colorTemp.substr(0,colorTemp.length-1);
                }
                if(colorSimpleTemp.indexOf(',') != -1){
                  colorSimpleTemp = colorSimpleTemp.substr(0,colorSimpleTemp.length-1);
                }


                temp += "}";
                simpleTemp += "}";
                colorTemp += `<span style="color: ${bracketsColor}">}</span>`;
                colorSimpleTemp += `<span style="color: ${bracketsColor}">}</span>`;
                if(!/.+\{.+\}/.test(simpleTemp)) {
                  simpleTemp = simpleTemp.substr(0,simpleTemp.length-2);
                }

                if(!/.+\{<\/span><span.+?>.+?\}/.test(colorSimpleTemp)){
                  let metricReg=new RegExp("<span.*?>"+metricName+"<\/span>")
                  colorSimpleTemp=metricReg.exec(colorSimpleTemp)[0];
                }

                let edpQueryData={element:temp,simpleElement:simpleTemp,colorElement:colorTemp,colorSimpleElement:colorSimpleTemp, value:result.value[1],type:(result.metric.type?result.metric.type:'2'),metricTip:metricTip};
                this.tableData.push(edpQueryData);
              }
              this.tableDataCopy = JSON.stringify(this.tableData);
            }
          }, 300);
        });
      },
      clearSelectedMetrics() {
        this.$refs.endpointQueryTable.clearSelection();
      },
      changeTime:function(size,unit){
        let time=this.getTime(size,unit);
        this.formatTime=time;
        this.showEndpoint();
      },
      pickTime:function(){
        this.showEndpoint();
      },
      getTime:function(size,unit){//计算时间
        let now=!this.formatTime? new Date(bus.computeTimezone(new Date().getTime())):new Date(this.formatTime);
        if(unit){
          switch (unit) {
            case 'y':
              now.setFullYear(now.getFullYear()+size);
              break;
            case 'M':
              now.setMonth(now.getMonth()+size);
              break;
            case 'd':
              now.setDate(now.getDate()+size);
              break;
            case 'h':
              now.setHours(now.getHours()+size);
              break;
            case 'm':
              now.setMinutes(now.getMinutes()+size);
              break;
            case 's':
              now.setSeconds(now.getSeconds()+size);
              break;
            default:
              console.error('unit error');
          }
        }else{
          now.setSeconds(now.getSeconds()+size);
        }
        let year=now.getFullYear();
        let month=now.getMonth()+1;
        month=month<10?"0"+month:month;
        let day=now.getDate();
        day=day<10?"0"+day:day;
        let hour=now.getHours();
        hour=hour<10?"0"+hour:hour;
        let minute=now.getMinutes();
        minute=minute<10?"0"+minute:minute;
        let second=now.getSeconds();
        second=second<10?"0"+second:second;
        let current=year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;
        return current;
      },
      selectChange:function(selection){//selection 选中的row的数组
        this.selectedEndpoints=selection;
      },
      selectable:function(row,index){
        if(this.selectedEndpoints.length>=20 && !this.selectedEndpoints.includes(row)){
          return false;
        }else{
          return true;
        }
      },
      viewGraph:function(){
        if(this.selectedEndpoints.length < 1) {
          return;
        }

        this.chartDatas = [];
        this.legend = [];
        this.graphShow = true;
        this.$nextTick(() => {
          this.graphChart = echarts.init(document.getElementById('viewGraphChart'));
          this.$refs.graphLoading.startLoading();
          this.queryChartDate();
        });
        /*setTimeout(()=> {
          this.$refs.graphLoading.startLoading();
          this.queryChartDate();
        }, 200);*/
      },
      dialogClose:function(){
        this.graphShow=false;
        this.graphChart.clear();
      },
      queryChartDate:function(){
        let start = this.searchTime[0]?this.searchTime[0]:this.getTime(-1, 'h');
        let end = this.searchTime[1]?this.searchTime[1]:this.getTime(0, 'h')
        this.searchTime = [start, end];
        let timeDiff = (new Date(end).getTime()-new Date(start).getTime())/1000/(24*60*60);
        // end - start < 1 day : 15s
        // end - start < 7 day : 5m
        // end - start < 30 day : 10m
        // end - start > 30 day : 30m
        let step = '15s';
        if(timeDiff< 1){
          step='15s';
        }else if(timeDiff < 7){
          step='5m';
        }else if(timeDiff<30){
          step='10m';
        }else{
          step='30m';
        }
        let axiosArr=[];
        for(let endpoint of this.selectedEndpoints){
          axiosArr.push(axios.get("/prom/api/v1/query_range?query="+endpoint.element+"&start="+start+"&end="+end+"&step="+step));
        }
        this.legend=[];
        this.isGrey=[];
        axios.all(axiosArr).then(res =>{
          res.forEach((response,promIndex)=>{
            if (response.status == 200) {
              if(response.data.status == 'success'){
                let queryData=response.data.data.result[0];
                if(queryData){
                  let chartData={
                    type:"line",
                    symbol:'none',  //去掉点
                    smooth:true,  //曲线变平滑
                  };
                  chartData.name=queryData.metric.__name__;
                  let alias=queryData.metric.__name__;
                  delete queryData.metric.__name__;
                  chartData.name+="{";
                  alias+="{";
                  Object.keys(queryData.metric).forEach((item,index)=>{
                    let label=item;
                    let value=queryData.metric[label];
                    chartData.name+=label +"='"+value+"',";
                    if(!this.sameLabels.some((i)=>{return i == label})){
                      alias+=label +"='"+value+"',";
                    }
                  })
                  chartData.name=chartData.name.charAt(chartData.name.length-1) == ","?chartData.name.substr(0,chartData.name.length-1):chartData.name;
                  alias=alias.charAt(alias.length-1) == ","?alias.substr(0,alias.length-1):alias;
                  chartData.name+="}";
                  alias+="}";
                  if(!/.+\{.+\}/.test(alias)){
                    alias=alias.substr(0,alias.length-2);
                  }
                  let legend={
                    name:chartData.name,
                    alias:alias,
                    showText:this.formatLegend(chartData.name)
                  }
                  this.legend.push(legend);
                  this.isGrey.push(false);
                  chartData.data=queryData.values.map((dpsItem, dpsIndex) => {
                    return [dpsItem[0] * 1000, Number(dpsItem[1])];
                  });
                  this.chartDatas.push(chartData);
                }
              }else{
                this.$message.error(response.data.error)
                console.error(response.data)
              }
            }
          });
          this.$nextTick(()=>{
            if(this.graphChart){
              this.graphChart.clear();
              this.chartOptions.color=this.bgColorList;
              this.chartOptions.series=this.chartDatas;
              this.graphChart.setOption(this.chartOptions);//创建图表
            }
            this.$refs.chartScrollbar.update();
            this.$refs.graphLoading.endLoading();
          });

        })
      },
      dateChange:function(){
        if(this.graphChart){
          this.graphChart.clear();
          this.queryChartDate();
        }

      },
      cellClass(row){ //给复选框那一列添加 类名为 ‘disabledCheck’
        if (row.columnIndex === 0) {
          return 'disabledCheck'
        }
      },
      getPanelData() { //获取panel数据
        this.$get('panel?pageNo=1&pageSize=-1').then(response => {
          if (response.code === 200) {
            this.panelData = response.data.list;
          }
        });
      },
      tableFilter() {
        let temp = this;
        let tableDatas = JSON.parse(this.tableDataCopy);
        this.tableData = tableDatas.filter((item)=>{
          let element = temp.hideSameLabels ? item.simpleElement: item.element;
          return element.indexOf(this.queryExpression) != -1;
        })
      },
      tableFilterHistory:function(expression){
        let metric='';
        let labels=[];
        if(/\w*\{.*\}.*/i.test(expression)){
          metric=expression.substr(0,expression.indexOf('{'));
          let labelStr=expression.substr(expression.indexOf('{')+1,expression.indexOf('}')-expression.indexOf('{')-1);
          let labelArr=labelStr.split(',');

          if(labelArr.length>0){
            labels=labelArr.map((item,index)=>{
              let temp=item.split('=');
              let label=temp[0]&&temp[0]!=''?temp[0]:null;
              let value=temp[1]&&temp[1]!=''?temp[1]:null;
              return label?{label:label,value:value}:null;
            })
          }

        }else{
          metric=expression;
        }
        this.tableData=[];
        let sourceData=JSON.parse(JSON.stringify(this.queryData))
        sourceData=sourceData.filter((item)=>{
          let metricName=item.metric.__name__;
          if(metricName.indexOf(metric)==-1){
            return false;
          }

          if(labels.length>0){
            for(let i in labels){
              let label=labels[i];
              if(label&&label.label){
                let value=item.metric[label.label];
                let queryVal=label.value;
                debugger
                if(/^'.+'$/.test(queryVal)){
                  queryVal=queryVal.substr(1,queryVal.length-2);
                }
                if(!value || value != queryVal){
                  return false;
                }
              }else{
                return true;
              }
            }
          }

          return true;
        })
        for(let i in sourceData){
          let item=sourceData[i];
          // {"metric":{"instance":"192.168.40.126:9100","__name__":"scrape_duration_seconds","module":"node_exporter","project":"kafka","asset":"192.168.40.126","job":"ed_1","dc":"dc5"},"value":[1580782176.522,"0.000560761"]}
          let metricName=item.metric.__name__;
          let temp=metricName;
          delete item.metric.__name__;
          temp+="{";
          let hasLabel=true;
          for (let key in item.metric){
            let label=key;
            let value=item.metric[label];
            temp+=label +"='"+value+"',";
          }
          temp=temp.charAt(temp.length-1) == ","?temp.substr(0,temp.length-1):temp;
          temp+="}";
          if(hasLabel){
            let edpQueryData={element:temp,value:item.value[1],type:(item.metric.type?item.metric.type:'2')};
            this.tableData.push(edpQueryData);
          }
        }
      },
      focusInput:function(){
        let classVal=document.getElementById('elementQuery').parentElement.getAttribute("class");
        classVal=classVal.replace('query-input-inactive','query-input-active');
        document.getElementById('elementQuery').parentElement.setAttribute("class",classVal );
        this.$refs.elementQuery.focus();
      },
      blurInput:function(){
        if(!this.queryExpression || this.queryExpression == ''){
          setTimeout(function(){
            let classVal=document.getElementById('elementQuery').parentElement.getAttribute("class");
            classVal=classVal.replace('query-input-active','query-input-inactive');
            document.getElementById('elementQuery').parentElement.setAttribute("class",classVal );
          },100)
        }
      },
      clearInput:function(){
        this.$refs.elementQuery.focus();
      },
      queryElementTips:async function(){
        this.elementMetricDatas = [];
        let response = await axios.get("/metric/metadata?endpointId="+this.currentEndpoint.id);
        if(response && response.status === 200){
          if(response.data.msg === 'success'){
            this.elementMetricDatas = response.data.data.list;
          }
        }
      },
      getStateContent:function(row){
        if(row){
          if(row.state == 1){

            return 'up'+'['+this.formatUpdateTime(row.lastUpdate)+']';
          }else{
            return 'down'+'['+this.getStateErrorMsg(row)+']';
          }
        }
      },
      formatUpdateTime:function(date){
        let time=new Date(date);
        let hours=time.getHours()>9?time.getHours():'0'+time.getHours();
        let minutes=time.getMinutes()>9?time.getMinutes():'0'+time.getMinutes();

        return hours+':'+minutes;
      },
      getStateErrorMsg:function(row){
        let errCodes=[230009,230010,230011];
        if(row){
          if(row.state == 0){
            if(errCodes.find((item)=>{return row.stateInfo.code == item})){
              return this.$t('project.endpoint.stateInfo_'+row.stateInfo.code)
            }else{
              return row.stateInfo.msg;
              this.$message.error('state code error');
            }
          }
        }
      }
    },
    watch: {
      obj: {
        immediate: true,
        deep: true,
        handler(n) {
          if (n) {
            this.currentEndpoint = JSON.parse(JSON.stringify(n));
            this.queryEndpoint();
          }
        }
      },
      queryExpression(n,o) {
        let temp = this;
        setTimeout(function() {
          temp.tableFilter();
        }, 500)
      },
    },
    mounted() {
      this.getPanelData();
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.endpointQueryTable.$el.querySelector(".el-table__body-wrapper");
        if (el._ps_) {
          el.addEventListener("ps-scroll-y", () => {
            if (el._ps_.scrollbarYTop > 50) {
              this.showTopBtn = true;
            } else {
              this.showTopBtn = false;
            }
          });
          el.addEventListener("mouseenter", () => {
            this.tableHover = true;
          });
          el.addEventListener("mouseleave", () => {
            this.tableHover = false;
          });
        }
      });
    }
  }
</script>
