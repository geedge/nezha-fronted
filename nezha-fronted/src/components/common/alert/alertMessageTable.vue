<style lang="scss">
  @import '../../charts/chart';
</style>
<template>
  <div :class="{'contentTable':!projectAlertId,'relative-position':true,'contentProject':projectAlertId}">
    <transition name="el-zoom-in-bottom">
      <div class="el-popover alert-clean-pop" @click="toDeleteMessage(false)" v-if="deleteBox.ids.length > 0">
        <i style="cursor: pointer" class="el-icon-delete"></i>
      </div>
    </transition>
    <!-- 自定义table列 -->
    <transition name="el-zoom-in-top">
      <element-set
        v-if="tools.showCustomTableTitle"
        @close="tools.showCustomTableTitle = false"
        :custom-table-title.sync="tools.customTableTitle"
        :original-table-title="tableTitle"
        ref="customTableTitle"
        :path="'/alertList'"
      ></element-set>
    </transition>
    <!--表格-->
    <el-table
      class="nz-table tabelH100"
      :data="tableData"
      border
      v-show="bottomBox.mainResizeShow"
      ref="alertListTable"
      tooltip-effect="light"
      :height="tableHeight"
      v-scrollBar:el-table="'large'"
      v-loading="tools.loading"
      :cell-class-name="labelsClassName"
      @selection-change="selectChange"
      style="width: 100%;height: 100%"
      @sort-change="tableDataSort"
      :id="projectAlertId"
    >
      <el-table-column
        :resizable="false"
        type="selection"
        width="38"
        align="center"
      >
      </el-table-column>
      <el-table-column
        :resizable="false"
        v-for="(item, index) in tools.customTableTitle"
        v-if="item.show"
        :width="item.width"
        :minWidth="item.minWidth"
        :key="`col-${index}`"
        :label="item.label"
        :show-overflow-tooltip="item.prop != 'labels'"
        min-width="110px"
        :sortable="sortableShow(item.prop)"
        :prop="propTitle(item.prop)"
        :sort-orders="['ascending', 'descending']"
      >
        <template slot-scope="scope" :column="item">
          <template v-if="item.prop == 'alertRule'">
            <span class="too-long-split pointer" v-if="scope.row[item.prop].alertName" @mouseover="alertMessagehover(scope.row,scope.$index)">
                    <el-tooltip
                      :placement="scope.$index==0?'right-start':(scope.$index==tableData.length-1?'right-end':'right')"
                      effect="light">
                      <alertRuleInfo slot="content" :id="scope.row.alertRule.id" :messageLoad="scope.row.loading"></alertRuleInfo>
                      <span>{{scope.row[item.prop].alertName}}</span>
                    </el-tooltip>
                  </span>
            <template v-else>-</template>
          </template>
          <template v-else-if="item.prop == 'summary'">
            <template v-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
            <template v-else>-</template>
          </template>
          <template v-else-if="item.prop == 'description'">
            <template v-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
            <span v-else>-</span>
          </template>
          <span v-else-if="item.prop == 'severity'">
                <span v-if="scope.row[item.prop] == 'high'"><i class="el-icon-arrow-up"></i>&nbsp;{{returnSeverityLabel(scope.row[item.prop])}}</span>
                <span style="padding-left: 18px;" v-if="scope.row[item.prop] == 'medium'">{{returnSeverityLabel(scope.row[item.prop])}}</span>
                <span v-if="scope.row[item.prop] == 'low'"><i class="el-icon-arrow-down"></i>&nbsp;{{returnSeverityLabel(scope.row[item.prop])}}</span>
              </span>
          <template v-else-if="item.prop == 'labels'" class="labels">
            <el-tooltip
              v-for="item in labelsSort(scope.row.labels)"
              :placement="scope.$index==0?'right-start':(scope.$index==tableData.length-1?'right-end':'right')"
              effect="light"
              :disabled="!(item.label === 'asset' ||item.label === 'module' || item.label === 'project')"
              :key="item.label"
            >
              <alertLabel
                v-if="item.label === 'asset' ||item.label === 'module' || item.label === 'project'"
                slot="content"
                :id="scope.row[item.label].id"
                :type="item.label"
                :labelLoading="scope.row[item.label].loading"
              ></alertLabel>
              <span @mouseover="labelHover(scope.row,scope.$index,item.label)">
                     <nz-alert-tag
                       :label="item.label" :type="tagType(item.label)" style="margin: 5px 0 5px 5px;"
                       :cursor-point="tagType(item.label) == 'info' ? false : true"
                       :key="item.label"
                       v-if="item.label != 'alertname' && item.label != 'severity'"
                     >
                       {{item.value}}
                     </nz-alert-tag>
                   </span>
            </el-tooltip>
          </template>
          <div v-else-if="item.prop == 'state'">
                <span class="">
                  {{scope.row['state'] == 1 ? "Pending" : ""}}
                  {{scope.row['state'] == 2 ? "Expired" : ""}}
                </span>
          </div>
          <div v-else-if="item.prop == 'current'" class="too-long-split pointer" @click="detail(scope.row)">
            <span v-if="!scope.row.current">-</span>
            <el-popover v-else placement="right" trigger="hover">
              <div slot="reference">
                <span class="content-right-option" :id="'alert-list-detail-'+scope.row.id"><i class="nz-icon nz-icon-chart"></i></span>
                <span>{{formatThreshold(scope.row.current[1],scope.row.alertRule.unit)}}</span>
              </div>
              <div>{{$unixTimeParseToString(scope.row.current[0])}}</div>
            </el-popover>
          </div>
          <div v-else-if="item.prop == 'option'" class="content-right-options">
            <span :title="$t('overall.delete')" @click="toDeleteMessage(scope.row)" class="content-right-option" :id="'alert-list-delete-'+scope.row.id"><i  class="el-icon-delete"></i></span>
          </div>
          <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
          <template v-else>-</template>
        </template>
      </el-table-column>

      <el-table-column width="28" :resizable="false">
        <template slot="header" slot-scope="scope">
          <span @mousedown.stop="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)" class="nz-table-gear">
            <i class="nz-icon nz-icon-gear"></i>
          </span>
        </template>
        <template v-slot="scope">
          <button v-if="scope.$index == 0" class="to-top" :style="{top: tools.toTopBtnTop}" :class="{'to-top-is-hover': tools.tableHover}" v-show="tools.showTopBtn && tools.mainResizeShow" @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>
        </template>
      </el-table-column>
    </el-table>
    <!--<弹窗>-->
    <!--删除弹窗-->
    <!--导出-->
    <div class="export-xlsx">
      <el-dialog :visible.sync="importBox.show" :title="importBox.title" :modal-append-to-body='false' :show-close="true" width="300px" @close="closeDialog" class="nz-dialog">
        <div class="upload-body">
          <button @click="exportCur" class="el-button el-button--default el-button--small">
            <span>{{$t('overall.exportCur')}}</span>
          </button>
          <button @click="exportAll" class="el-button el-button--default el-button--small">
            <span>{{$t('overall.exportAll')}}</span>
          </button>
        </div>
      </el-dialog>
    </div>
    <!--export-->
    <div class="export-xlsx">
      <el-dialog :visible.sync="deleteBox.show" :title="$t('overall.delete')" :modal-append-to-body='false' :show-close="true" width="300px" @close="closeDialog" class="nz-message">
        <div class="upload-body">
          <el-input type="textarea" :placeholder="$t('alert.description')" v-model="deleteBox.remark"></el-input>
          <div style="text-align: right; margin-top: 10px;">
            <button @click="closeDialog" class="el-button el-button--default el-button--small">
              <span>{{$t('tip.no')}}</span>
            </button>
            <button @click="deleteMessage" class="el-button el-button--default el-button--small el-button--primary">
              <span>{{$t('tip.yes')}}</span>
            </button>
          </div>
        </div>
      </el-dialog>
    </div>
    <el-dialog class="line-chart-block-modal nz-dialog endpoint-dialog"
               :title="$t('overall.detail')"
               :visible.sync="graphShow"
               width="90%"
               id="viewGraphDialog"
               @close="dialogClose"
               :modal-append-to-body='false'>
      <div slot="title">
        {{$t("project.endpoint.dialogTitle")}}
        <div class="float-right panel-calendar dialog-tool" style="display: flex">
          <pick-time :refresh-data-func="queryChartDate" :use-refresh="false" :use-chart-unit="false" v-model="searchTime" style="height: 28px;" @unitChange="chartUnitChange"></pick-time>
        </div>
      </div>
      <chart ref="messageChart" name="alertMessageChart" :unit="chartUnit"></chart>
    </el-dialog>
  </div>
</template>

<script>
  import bus from '../../../libs/bus';
  import axios from 'axios';
  import nzAlertTag from '../../page/alert/nzAlertTag';
  import chart from '../../page/dashboard/overview/chart'
  import chartDataFormat from "../../charts/chartDataFormat";
  import alertRuleInfo from '../../common/alert/alertRuleInfo'
  import alertLabel from '../../common/alert/alertLabel'
  export default {
    name:"alertMessageTable",
    components: {
      'nz-alert-tag': nzAlertTag,
      'chart': chart,
      'alertRuleInfo':alertRuleInfo,
      'alertLabel':alertLabel,
    },
    props:{
      tableData:{},
      loading:{},
      tableHeight:{},
      tableId:{},
      projectAlertId:{},
    },
    data() {
      vm = this;
      return {
        /*二级列表相关*/
        tabList: [], //二级列表的标签
        tabDetailList: [], //多个详情
        bottomBox: {
          tabList: [], //二级列表的标签
          tabDetailList: [], //多个详情
          mainResizeShow: true, //dom高度改变时是否展示|隐藏
          subResizeShow: true,
          isFullScreen: false, //全屏状态
          showSubList: false, //是否显示二级列表
          targetTab: '', //显示二级列表中的哪个页签
          inTransform: false, //搜索框相关，搜索条件下拉框是否在transform里
        },
        /*工具参数*/
        tools: {
          loading: false, //是否显示table加载动画
          toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
          tableHover: false, //控制滚动条和top按钮同时出现
          showTopBtn: false, //显示To top按钮
          showCustomTableTitle: false, //自定义列弹框是否显示
          customTableTitle: [], //自定义列工具的数据
        },

        //导出相关
        importBox: {show: false, title:this.$t('overall.exportExcel')},
        deleteBox: {show: false, ids: "", remark: '', state: 2},

        //详情相关
        graphShow: false,
        chartDatas: [],
        sameLabels: ['instance','module','project','asset','endpoint','datacenter'],
        legend: [],
        searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],
        currentMsg: {},
        chartUnit: 5,
        pageObj: {
          pageNo: 1,
          pageSize: 50,
          total: 0
        },
        tableTitle: [
          {
            label: 'ID',
            prop: 'id',
            show: true,
            width: 80
          }, {
            label: this.$t("alert.alertName"),
            prop: 'alertRule',
            show: true,
            width: 180
          }, {
            label: this.$t("alert.list.labels"),
            prop: 'labels',
            show: true,
            width:350,
          }, {
            label: this.$t("alert.severity"),
            prop: 'severity',
            show: true,
            width: 100,
          }, {
            label: this.$t('alert.summary'),
            prop: 'summary',
            show: true,
          }, {
            label: this.$t('alert.description'),
            prop: 'description',
            show: true,
          }, {
            label: this.$t('alert.list.state'),
            prop: 'state',
            show: true,
            width: 100
          }, {
            label: this.$t("alert.startAt"),
            prop: 'startAt',
            show: true,
            width: 150
          }, {
            label: this.$t('alert.endAt'),
            prop: 'endAt',
            show: true,
            width: 150
          }, {
            label: this.$t('overall.value'),
            prop: 'current',
            show: true,
            width: 100
          }, {
            label: this.$t('overall.option'),
            prop: 'option',
            show: true,
            width: 90
          }
        ],
        viewRuleData: {
          id: '',
          alertName: '',
          type: '',
          linkObject: {id: '', name: ''},
          linkId: '',
          expr: '',
          last: '',
          severity: '',
          summary: '',
          description: '',
          receiver: '',
        },
        viewProjectData: {id: '', name: '', remark: ''},
        viewModuleData: {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []},
        viewAssetState: false,
      }
    },
    computed: {
      tagType() {
        return (key) => {
          if (key == 'asset' || key == 'module' || key == 'project' || key == 'datacenter' || key == 'endpoint') {
            return "normal";
          } else {
            return "info";
          }
        }
      },
      tagValue() {
        return (key, value) => {
          if (key == 'type') {
            if (value ==  1) {
              value = this.$t("project.project.project");
            } else if (value == 2) {
              value = this.$t("module.module.module");
            } else if (value == 3) {
              value = this.$t("asset.asset");
            }
          }
          return key + "：" + value;
        }
      }
    },
    methods: {
      labelsSort:function(obj){
        let buildIn=['asset','endpoint','module','project','datacenter']
        let labels=JSON.parse(JSON.stringify(obj));
        let result=[];
        for(let key of buildIn){
          if(key in labels){
            result.push({label:key,value:labels[key]})
            delete labels[key]
          }
        }
        Object.keys(labels).sort().forEach(key=>{
          result.push({label:key,value:labels[key]})
        })
        return result;
      },
      chartUnitChange:function(unit){
        this.chartUnit=unit;
        this.$nextTick(()=>{
          this.queryChartDate()
        })
      },
      formatThreshold:function(value,unit){
        let unitMethod=chartDataFormat.getUnit(unit)
        if(unitMethod&&value){
          return unitMethod.compute(value,null,2);
        }else{
          return value
        }
      },
      queryChartDate() {
        let $temp = this;
        let start = this.searchTime[0]?this.searchTime[0]:this.getTime(-1, 'h');
        let end = this.searchTime[1]?this.searchTime[1]:this.getTime(0, 'h');
        this.searchTime = [start, end];
        let timeDiff = (new Date(end).getTime()-new Date(start).getTime())/1000/(24*60*60);
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
        this.$refs.messageChart.startLoading();
        let axiosArr=[];
        let paramStr = JSON.stringify(this.promQueryParamConvert(this.currentMsg));
        axiosArr.push(axios.get("/prom/api/v1/query_range?query="+paramStr.substring(1, paramStr.length-1).replace(/\+/g, "%2B").replace(/ /g, "%20").replace(/\\/g, "")+"&start="+this.$stringTimeParseToUnix(start)+"&end="+this.$stringTimeParseToUnix(end)+"&step="+step));
        this.legend = [];
        this.chartDatas = [];
        axios.all(axiosArr).then(res =>{
          try {
            res.forEach((response, promIndex) => {
              if (response.status == 200) {
                if (response.data.status == 'success') {
                  let queryData = response.data.data.result[0];
                  if (queryData) {
                    let chartData = {
                      type: "line",
                      symbol: 'none',  //去掉点
                      smooth: 0.2,  //曲线变平滑
                      name: '',
                      lineStyle: {
                        width: 1,
                        opacity: 0.9
                      },
                      markLine: {
                        silent: true,
                        symbol: ['circle', 'circle'],
                        label: {
                          distance: this.computeDistance(chartDataFormat.getUnit(this.currentMsg.alertRule.unit ? this.currentMsg.alertRule.unit : 2).compute(this.currentMsg.alertRule.threshold)),
                          formatter: function (params) {
                            return chartDataFormat.getUnit($temp.currentMsg.alertRule.unit ? $temp.currentMsg.alertRule.unit : 2).compute(params.value)
                          }
                        },
                        lineStyle: {
                          color:'#d64f40',
                          width:2,
                          type:'dotted'
                        },
                        data: [{
                          yAxis: Number(this.currentMsg.alertRule.threshold)
                        }, ]
                      },
                      markArea:{
                        itemStyle:{
                          color:'#d64f40',
                          opacity:0.1
                        },
                        data:[this.returnMarkArea()]
                      }
                    };
                    if(this.currentMsg.alertRule.operator=='=='||this.currentMsg.alertRule.operator=='!='){
                      delete chartData.markArea;
                    }
                    chartData.name += "{";
                    alias += "{";
                    Object.keys(queryData.metric).forEach((item, index) => {
                      let label = item;
                      let value = queryData.metric[label];
                      chartData.name += label + "='" + value + "',";
                    });
                    chartData.name = chartData.name.charAt(chartData.name.length - 1) == "," ? chartData.name.substr(0, chartData.name.length - 1) : chartData.name;
                    chartData.name += "}";
                    let alias = chartData.name;
                    let legend = {
                      name: chartData.name,
                      alias: alias,
                      isGray: false
                    }
                    this.legend.push(legend);
                    chartData.data = queryData.values.map((dpsItem, dpsIndex) => {
                      return [bus.computeTimezone(dpsItem[0]) * 1000, parseFloat(dpsItem[1]).toFixed(2)];
                    });
                    this.chartDatas.push(chartData);
                  }
                } else {
                  this.$message.error(response.data.error)
                  console.error(response.data)
                }
              }
            });
            this.$nextTick(() => {
              this.$refs.messageChart.setRandomColors(this.chartDatas.length);
              this.$refs.messageChart.setLegend(this.legend);
              this.$refs.messageChart.setSeries(this.chartDatas);
              this.$refs.messageChart.endLoading();
            });
          } catch(err) {
            this.$message.error(err);
            this.$refs.messageChart.endLoading();
          }
        })
      },
      computeDistance:function(str){
        var width = 0;
        var html = document.createElement('span');
        html.innerText = str;
        html.className = 'getTextWidth';
        document.querySelector('body').appendChild(html);
        width = document.querySelector('.getTextWidth').offsetWidth;
        document.querySelector('.getTextWidth').remove();
        return Number('-'+(width+5));
      },
      returnMarkArea:function(){
        if(this.currentMsg){
          if(this.currentMsg.alertRule.operator=='>'||this.currentMsg.alertRule.operator=='>='){
            return[{yAxis:this.currentMsg.alertRule.threshold},{}]
          }else{
            return[{},{yAxis:this.currentMsg.alertRule.threshold}]
          }
        }
      },
      detail(obj) {
        if(!obj.current){return}
        this.chartDatas = [];
        this.legend = [];
        this.graphShow = true;
        this.currentMsg = obj;
        this.chartUnit=obj.alertRule.unit?obj.alertRule.unit:5;
        this.$nextTick(() => {
          this.queryChartDate();
        });
      },
      dialogClose() {
        this.graphShow = false;
      },
      getAlertList: function () {

      },
      promQueryParamConvert(obj){
        let result="(" + obj.alertRule.expr + ")";
        if(obj.labels){
          if(obj.labels.alertname){
            delete obj.labels.alertname;
          }
          if(obj.labels.severity){
            delete obj.labels.severity;
          }
        }
        if(Object.keys(obj.labels).length>0){
          result+=" and ("+function(){
            let q = "{";
            for (let k in obj.labels) {
              q += k;
              q += "=";
              q += ("'" + obj.labels[k] + "',");
            };
            if (q.length > 1) {
              q = q.substring(0, q.length-1);
            }
            q += "}";
            return q;
          }() + ")";
        }
        return result;
      },
      //asset弹框控制
      tabControl(data) {
        if (data === 'close') {
          this.viewAssetState = false
          this.$refs['assetEditUnit'].tabView = false
        }
      },
      toDeleteMessage(obj) {
        if (obj) {
          this.deleteBox.ids = obj.id + "";
        }
        this.deleteBox.show = true;
      },
      deleteMessage() {
        this.$emit('deleteMessage',this.deleteBox);
        //console.log(this.deleteBox);
        this.deleteBox.show = false;
        this.deleteBox.ids=[];
      },
      selectChange(s) {
        let ids = [];
        this.deleteBox.ids = "";
        s.forEach(item => {
          ids.push(item.id);
        });
        this.deleteBox.ids = ids.join(",");
      },
      showExportDialog() {
        this.importBox.show = true;
      },
      closeDialog() {
        this.importBox.show = false;
        this.deleteBox.show = false;
      },
      exportCur:function(){
        this.exportExcel(this.searchLabel);
        this.closeDialog();
      },
      exportAll:function(){
        let temp = JSON.parse(JSON.stringify(this.searchLabel));
        temp.pageSize = -1;
        this.exportExcel(temp);
        this.closeDialog();
      },
      getTimeString:function(){
        let split='-';
        let date=new Date();
        let year=date.getFullYear();
        let month=this.formatNum(date.getMonth()+1);
        let day=this.formatNum(date.getDate());
        let hours=this.formatNum(date.getHours());
        let minutes=this.formatNum(date.getMinutes());
        let seconds=this.formatNum(date.getSeconds());
        return year + split + month + split + day + ' ' + hours + split + minutes + split + seconds;
      },
      formatNum:function(num){
        return num>9?num:'0'+num;
      },
      exportExcel:function(params){
        for (let item in params) {
          if (params[item]) {
            if (item == "alertMessageState") {
              this.$set(params, "state", params[item]);
            } else{
              this.$set(params, item, params[item]);
            }
          }
        }
        let temp=this;
        if(!params){
          params=temp.params;
        }
        axios.get("alert/message/export", {responseType:'blob', params: params}).then(res=>{
          let fileName = 'alert-message-'+temp.getTimeString()+'.xlsx';
          if(window.navigator.msSaveOrOpenBlob){
            // 兼容ie11
            let blobObject = new Blob([res.data]);
            window.navigator.msSaveOrOpenBlob(blobObject, fileName);
          }else{
            let url = URL.createObjectURL(new Blob([res.data]));
            let a = document.createElement('a');
            document.body.appendChild(a); //此处增加了将创建的添加到body当中
            a.href = url;
            a.download = fileName;
            a.target = '_blank';
            a.click();
            a.remove(); //将a标签移除
          }
        })
      },
      // 全屏
      fullScreen() {
        let vm = this;
        this.$bottomBoxWindow.fullScreen(vm);
      },
      // 退出全屏
      exitFullScreen() {
        let vm = this;
        this.$bottomBoxWindow.exitFullScreen(vm);
      },
      // 鼠标拖动二级列表
      listResize(e) {
        let vm = this;
        this.$bottomBoxWindow.listResize(vm, e);
      },
      showTagDetail(data, key) {
        let open = false;
        if (key == "asset" || key == "project" || key == "module" || key == "endpoint" || key == "datacenter") {
          open = true;
        }
        if (open) {
          let labelList = [];
          let detailList = [];
          for (let item in data) {
            if (item == "asset" || item == "project" || item == "module" || item == "endpoint" || item == "dc") {
              labelList.push(item);
              detailList.push(data[item]);
            }
          }
          this.bottomBox.showSubList = true;
          this.tabList = labelList;
        }
      },
      labelsClassName(row) {
        if (row.column.label == this.$t("alert.list.labels")) {
          return "alert-message-list-labels";
        } else {
          return "";
        }
      },
      viewRule(id) {
        this.closeViews();
        this.$get('alert/rule', {"id": id}).then(response => {
          if (response.code == 200) {
            this.viewRuleData = response.data.list[0];
            this.$refs.alertConfigBox.show(true);
          }
        })
      },
      viewAlertType: function (type, typeObj) {
        this.closeViews();
        switch (type) {
          case 1:
            this.viewProjectData = JSON.parse(JSON.stringify(typeObj));
            this.$refs.projectBox.show(true);
            break;
          case 2:
            // this.fillProject(typeObj);
            let tempObj = JSON.parse(typeObj.param)
            this.$set(typeObj, 'paramObj', []);
            for (let k in tempObj) {
              typeObj.paramObj.push({key: k, value: tempObj[k]});
            }
            this.viewModuleData = JSON.parse(JSON.stringify(typeObj));

            this.$refs.moduleBox.show(true);
            break;
          case 3:
            this.viewAssetState = true;
            this.$refs.assetEditUnit.getAssetData(typeObj);
            this.$refs.assetEditUnit.tabView = true;
            break;
        }
      },
      fillProject: function (module) {
        this.$get('project', {"id": module.projectId}).then(response => {
          if (response.code == 200) {
            module.project = response.data.list[0];
          }
        })
      },
      closeViews: function () {
        this.$refs.alertConfigBox.show(false, false);
        this.$refs.projectBox.show(false, false);
        this.$refs.moduleBox.show(false, false);
        this.viewAssetState = false;
      },
      //是否需要排序
      sortableShow(prop){
        switch(prop){
          case 'id':
          case 'state':
          case 'alertRule':
          case 'severity':
          case 'startAt':
          case 'endAt':
            return'custom';
          default : return false;
        }
      },
      // prop字段
      propTitle(prop){
        switch(prop){
          case 'id': return'am.id';
          case 'state': return'am.state';
          case 'alertRule': return'ar.alert_name';
          case 'severity': return'am.severity';
          case 'startAt': return'am.start_at';
          case 'endAt': return'am.end_at';
          default : return prop;
        }
      },
      // 数据排序
      tableDataSort(item){
        this.$emit('tableDataSort',item);
      },
      // label tooltip是否显示
      labelToolTipDis(labelType){
        switch(labelType){
          case 'asset':
          case 'module':
          case 'project':
            return false;
          default: return true;
        }
      },
      // alertNmae鼠标划入
      alertMessagehover(item,index){
        item.loading=true;
        this.$set(this.tableData,index,item);// 调用父组件
      },
      // label 鼠标划入
      labelHover(item,index,type){
        if(this.labelToolTipDis(type)){
          return
        }
        item[type].loading=true;
        this.$set(this.tableData,index,item);// 调用父组件
      },
      // Severity Label
      returnSeverityLabel(key){
        return this.$CONSTANTS.alertMessage.severityData.find(s => {return s.value == key}).label
      }
    },
    watch: {
      showSubList(n) {
        this.$bottomBoxWindow.showSubListWatch(vm, n);
      },
    },
    mounted() {
      //初始化表头
      this.tools.customTableTitle = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageObj.pageSize = pageSize
      }

      this.getAlertList();
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.alertListTable.$el.querySelector(".el-table__body-wrapper");
        if (el._ps_) {
          el.addEventListener("ps-scroll-y", () => {
            if (el._ps_.scrollbarYTop > 50) {
              this.tools.showTopBtn = true;
            } else {
              this.tools.showTopBtn = false;
            }
          });
          el.addEventListener("mouseenter", () => {
            this.tools.tableHover = true;
          });
          el.addEventListener("mouseleave", () => {
            this.tools.tableHover = false;
          });
        }
      });
      /*if(this.from=='alertMessage'){
        this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
          ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
          : this.tableTitle;
        this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
          ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
          : this.tableTitle;
        console.log(1);
      }
      if(this.from=='alertMessageTab'  || this.from=='chartList'){
        this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/alertList")
          ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/alertList"))
          : this.tableTitle;
        this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/alertList")
          ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/alertList"))
          : this.tableTitle;
        console.log(2);
      }
      console.log( this.tableTitle,this.fromPath,this.form,this.tablelable);*/
    }
  }

</script>

<style scoped>
  .alertLabelInfo{
    border: 1px solid #ebeef5;
    border-bottom: none;
    font-size: 13px;
    line-height: 26px;
  }
  .alertLabelBox{
    display: flex;
    justify-content:space-between;
    border-bottom: 1px solid #ebeef5;
  }
  .alertLabelTitle{
    text-align: left;
    width: 90px;
    border-right: 1px solid #ebeef5;
    color: #666;
    padding: 0 3px 0 13px;
  }
  .alertLabelValue{
    text-align: left;
    width: 150px;
    color: #1a1a1a;
    padding: 0 3px 0 13px;
  }
  .danger{
    background-color: #d64f40;
    color: white;
    padding: 2px 5px;
    border-radius: 4px;
  }
  .success{
    background-color: #50d050;
    color: white;
    padding: 2px 5px;
    border-radius: 4px;
  }
  /deep/.active-icon{
    margin-top: 0;
  }
  .contentTable{
    height: calc(100% - 105px)
  }
  .contentProject{
    height: calc(100% - 60px);
    margin-bottom: 15px;
  }
  .tabelH100{
    height: 100% !important;
  }
  /deep/.too-long-split{
    vertical-align: bottom;
  }
  /deep/.el-tooltip{
    display: inline-block;
  }
  /deep/.alert-clean-pop.el-popover{
    top: -30px;
  }
  .pointer{
    cursor: pointer;
  }
</style>
