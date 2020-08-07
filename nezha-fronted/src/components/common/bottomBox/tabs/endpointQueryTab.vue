<style scope>
  .chart-bottom {
    text-align: center;
    margin-top: 16px;
  }
</style>
<style>
  .endpoint-dialog .el-dialog__body{
    height: calc(100% - 48px) !important;
    padding-bottom: 0 !important;
  }
</style>
<template>
  <span>
    <div class="sub-top-tools">
      <div class="sub-list-tabs">
        <div class="sub-list-tab-title">{{$t("project.endpoint.endpointId")}}: {{currentEndpoint ? currentEndpoint.id : ''}}</div><div
        class="sub-list-tab" @click="changeTab('panel')">{{$t("overall.detail")}}</div><div
        class="sub-list-tab sub-list-tab-active">{{$t("overall.query")}}</div>
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
        <div class="nz-btn-group nz-btn-group-size-normal nz-btn-group-light" style="height: 24px;">
          <button class="nz-btn nz-btn-size-normal nz-btn-style-light" @click="viewGraph">
            <i class="nz-icon nz-icon-chart"  :class="{'control-icon-unchecked':selectedEndpoints.length<1,'control-icon-checked':selectedEndpoints.length>0}"></i>
          </button><button @mouseenter="dropdownHandler(true)" @mouseleave="dropdownHandler(false)" class="nz-btn nz-btn-size-normal nz-btn-style-light export-dropdown-btn" id="browser-go">
            <i class="el-icon-arrow-down"></i>
            <transition name="el-zoom-in-top">
              <div v-if="dropdownShow" class="endpoint-query-dropdown el-popover">
                <span style="padding-top: 2px">{{$t('project.endpoint.hideSameLabels')}}</span>
                <el-switch v-model="hideSameLabels" active-color="#ee9d3f" size="small"></el-switch>
              </div>
            </transition>
          </button>
        </div>
      </div>
    </div>
    <div class="table-header-inner" @click="clearSelectedMetrics"><span><i style="font-size: 12px;margin-left: 2px;" class="nz-icon nz-icon-close " :class="{'control-icon-unchecked':selectedEndpoints.length<1,'control-icon-checked':selectedEndpoints.length>0}"></i></span></div>
    <pl-table :row-height="28" use-virtual :datas="tableData" border :empty-text="$t('config.mib.noData')" :header-cell-class-name="cellClass" :style="{height: $tableHeight.noPagination}"
              class="nz-table endpoint-query-table" style="width: 100%;" v-loading="loading" v-scrollBar:el-table="'large'" :pagination-show="false" ref="endpointQueryTable"
              @selection-change="selectChange" v-if="tableShow" :border="true">
      <pl-table-column
        type="selection"
        width="39"
        align="center"
        :selectable="selectable">
      </pl-table-column>
      <pl-table-column
        prop="element"
        :resizable="true"
        min-width="1800"
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
        min-width="180">
      </pl-table-column>
    </pl-table>
    <button class="to-top" v-show="showTopBtn" :class="{'to-top-is-hover': tableHover}" @click="$toTop('ps', 1)"><i class="nz-icon nz-icon-top"></i></button>

    <el-dialog class="line-chart-block-modal nz-dialog endpoint-dialog"
               :title="$t('project.endpoint.dialogTitle')"
               :visible.sync="graphShow"
               width="90%"
               :modal-append-to-body="false"
               id="viewGraphDialog"
               @close="dialogClose">
      <div slot="title">
        {{$t("project.endpoint.dialogTitle")}}
        <div class="float-right panel-calendar dialog-tool" style="display: flex">
          <pick-time :refresh-data-func="queryChartDate" :use-refresh="false" v-model="searchTime" style="height: 28px;" @unitChange="chartUnitChange"></pick-time>
          <button class="nz-btn nz-btn-size-large nz-btn-style-normal nz-btn-min-width-82" @click="saveChart">{{$t('dashboard.metric.saveChart')}}</button>
        </div>
      </div>
      <chart ref="endpointChart" :unit="chartUnit"></chart>
    </el-dialog>
    <transition name="right-box">
      <chart-box v-if="rightBox.show" @close="rightBox.show = false" :chart="chart" ref="addChartModal" :panel-data="panelData" @on-create-success="createSuccess" @reloadOnlyPanel="getPanelData" @reload="getPanelData" :show-panel="{}"></chart-box>
    </transition>
  </span>
</template>

<script>
  import echarts from 'echarts';
  import chartBox from "../../../page/dashboard/chartBox";
  import axios from 'axios';
  import loading from "../../loading";
  import bus from "../../../../libs/bus";
  import chartDataFormat from "../../../charts/chartDataFormat";
  import chart from '../../../page/dashboard/overview/chart'
  var timeout;
  var internal;
  export default {
    name: "endpointQueryTab",
    components: {
      'chart-box': chartBox,
      'loading': loading,
      'chart':chart
    },
    props: {
      obj: Object, //关联的实体对象
      from: String,
    },
    data() {
      let temp = this;
      return {
        chart: {},
        tableShow: true,
        tableHover: false,
        dropdownShow: false,
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
        graphShow:false,
        searchTime:[new Date().setHours(new Date().getHours() - 1), new Date()],
        panelData: [], //chart-box的panel下拉框数据,
        hideSameLabels: true,
        sameLabels:['instance','module','project','asset','endpoint','datacenter'],
        chartUnit:5,
        rightBox: {show: false}
      }
    },
    methods: {
      changeTab(tab) {
        this.$emit('changeTab', tab);
      },
      saveChart() { //新增chart
        let chart = {
          title: '',
          type:'line',
          span:12,
          height:'400',
          unit: this.chartUnit,
          param: {
            url:'',
            threshold: '',
          },
          elements:[],
          panel: '',
          sync: 0
        };
        for (let i = 0; i < this.selectedEndpoints.length; i++) {
          if (this.selectedEndpoints[i] && this.selectedEndpoints[i].element !=  '') {
            chart.elements.push({chartId: "", expression: this.selectedEndpoints[i].element, type: 'expert'});
          }
        }
        this.chart = chart;
        this.rightBox.show = true;
      },
      dropdownHandler(show) {
        if (show) {
          clearTimeout(timeout);
          this.dropdownShow = true;
        } else {
          timeout = setTimeout(() => {
            this.dropdownShow = false;
          }, 700);
        }
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
          this.$router.push({
            path: "/panel",
            query: {
              t: +new Date()
            }
          });
        });
      },
      tableReload() {
        let table = this.$refs.endpointQueryTable;
        internal = setInterval(() => {
          if (!window.resizing) {
            table.setHeight();
            clearInterval(internal);
          }
        }, 200);
      },
      queryEndpoint() {
        this.loading = true;
        this.queryElementTips();
        this.queryData = [];
        this.tableData = [];
        this.tableDataCopy = '';
        setTimeout(() => {
          this.$get("/prom/api/v1/query?query={endpoint='" + this.currentEndpoint.id + "'}&time=" + this.formatTime).then(response=>{
            this.loading = false;
            if(response.status==="success"){
              let results = response.data.result;
              this.queryData=JSON.parse(JSON.stringify(results));
              this.tableData = this.handlerTableData(results);
              this.tableDataCopy = JSON.stringify(this.tableData);
              this.$nextTick(this.$refs.endpointQueryTable.doLayout());
            }
          });
        }, 450);
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
      handlerTableData(results) {
        let tableData = [];
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
          //this.tableData.push(edpQueryData);
          tableData.push(edpQueryData);
        }
        return tableData;
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
          this.$refs.endpointChart.startLoading();
          this.queryChartDate();
        });
      },
      dialogClose:function(){
        this.graphShow=false;
      },
      chartUnitChange:function(unit){
        this.chartUnit=unit;
        this.$nextTick(()=>{
          this.queryChartDate()
        })
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
          axiosArr.push(axios.get("/prom/api/v1/query_range?query="+endpoint.element+"&start="+this.$stringTimeParseToUnix(start)+"&end="+this.$stringTimeParseToUnix(end)+"&step="+step));
        }
        this.legend=[];
        this.chartDatas = [];
        axios.all(axiosArr).then(res =>{
          res.forEach((response,promIndex)=>{
            if (response.status == 200) {
              if(response.data.status == 'success'){
                let queryData=response.data.data.result[0];
                if(queryData){
                  let chartData={
                    type:"line",
                    symbol:'none',  //去掉点
                    smooth:0.2,
                    lineStyle: {
                      width: 1,
                      opacity: 0.9
                    },
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
                    // showText:this.formatLegend(chartData.name),
                    isGray:false
                  };
                  this.legend.push(legend);
                  chartData.data=queryData.values.map((dpsItem, dpsIndex) => {
                    return [dpsItem[0] * 1000, Number(dpsItem[1])];
                  });
                  this.chartDatas.push(chartData);
                }
              }else{
                this.$message.error(response.data.error);
                console.error(response.data);
              }
            }
          });
          this.$nextTick(()=>{
            this.$refs.endpointChart.setRandomColors(this.chartDatas.length)
            this.$refs.endpointChart.setLegend(this.legend)
            this.$refs.endpointChart.modifyOption("tooltip", "backgroundColor", "rgba(221,228,237,1)");
            this.$refs.endpointChart.modifyOption("tooltip", "textStyle", {color: "#000"});
            this.$refs.endpointChart.modifyOption("grid", "top", 30);
            this.$refs.endpointChart.modifyOption("grid", "left", 0);
            this.$refs.endpointChart.modifyOption("grid", "right", 30);
            this.$refs.endpointChart.modifyOption("grid", "bottom", 8);
            this.$refs.endpointChart.modifyOption("grid", "containLabel", true);
            this.$refs.endpointChart.setSeries(this.chartDatas);
            this.$refs.endpointChart.endLoading();
          });

        })
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
      //this.$nextTick(() => {
      setTimeout(() => {this.$refs.endpointQueryTable.setHeight();}, 700);
      setTimeout(() => {
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
      }, 300);

      //});
    }
  }
</script>
