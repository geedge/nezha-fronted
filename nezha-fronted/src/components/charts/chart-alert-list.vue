<style lang="scss">
  @import './chart.scss';
</style>
<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-alert" ref="resizeBox">
      <div class="chart-alert-info" :id="'chartTableDiv'+chartIndex" @mouseenter="caretShow=true" @mouseleave="caretShow=false">
        <loading :ref="'localLoading'+chartIndex"></loading>
        <div class="clearfix chartTitle" :class="{'dragTitle':dragTitleShow}" :id="'chartTitle'+chartIndex" v-show="!isPreview">
          <el-popover
            v-if="isError"
            :close-delay=10
            placement="top-start"
            trigger="hover"
            popper-class="chart-error-popper">
            <div >{{errorContent}}</div>
            <span slot="reference" class="panel-info-corner panel-info-corner--error">
              <i class="nz-icon nz-icon-warning fa"></i>
              <span class="panel-info-corner-inner"></span>
            </span>
          </el-popover>
          <el-dropdown trigger="click" v-show="!isPreview" class="nz-chart-top" :key="'chartDropdown'+chartIndex"  v-clickoutside="clickos">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <span class="el-dropdown-link chart-title" @click="dropdownMenuShow=!dropdownMenuShow">
              <span class="chart-title-text">{{chartInfo.title}}</span>
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
        <div class="mt-10 table-container" v-cloak  v-show="firstShow || isPreview">
          <transition name="el-zoom-in-bottom">
            <div class="el-popover alert-clean-pop" @click="toDeleteMessage(false)" v-if="deleteBox.ids.length > 0" :style="{'top':isPreview?'-30px':'10px'}">
              <i style="cursor: pointer" class="el-icon-delete"></i>
            </div>
          </transition>
          <el-table
            :id="'tableContainer'+chartIndex"
            class="nz-table"
            :data="storedTableData"
            border
            :height="tableHeight"
            ref="alertListTable"
            tooltip-effect="light"
            v-scrollBar:el-table="'normal'"
            :cell-class-name="labelsClassName"
            @selection-change="selectChange"
            style="width: 100%;">
            <el-table-column
              :resizable="false"
              type="selection"
              width="38"
              align="center"
            ></el-table-column>
            <el-table-column
              :resizable="false"
              v-for="(item, index) in tablelable"
              v-if="item.show"
              :width="item.width"
              :key="`col-${index}`"
              :label="item.label"
              :show-overflow-tooltip="item.prop != 'labels'"
              min-width="110px"
            >
              <template slot-scope="scope" :column="item">
                <template v-if="item.prop == 'alertRule'">
                  <div class="too-long-split"
                       @click="" :id="'view-rule-'+scope.row[item.prop].id"
                       v-if="scope.row[item.prop].alertName">{{scope.row[item.prop].alertName}}</div>
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
                <span v-if="scope.row[item.prop] == 'high'"><i class="el-icon-arrow-up"></i>&nbsp;{{severityData[1].value}}</span>
                <span style="padding-left: 18px;" v-if="scope.row[item.prop] == 'medium'">{{severityData[0].value}}</span>
                <span v-if="scope.row[item.prop] == 'low'"><i class="el-icon-arrow-down"></i>&nbsp;{{severityData[2].value}}</span>
              </span>
                <template v-else-if="item.prop == 'labels'">
                  <nz-alert-tag :label="key" :type="tagType(key)" style="margin: 5px;"
                                :cursor-point="tagType(key) == 'info' ? false : true"
                                :key="key"
                                v-if="key != 'alertname' && key != 'severity'"
                                v-for="(value, key) in scope.row.labels">{{value}}</nz-alert-tag>
                </template>
                <div v-else-if="item.prop == 'state'">
                <span class="">
                  {{scope.row['state'] == 1 ? "Pending" : ""}}
                  {{scope.row['state'] == 2 ? "Expired" : ""}}
                </span>
                </div>
                <div v-else-if="item.prop == 'current'" class="too-long-split" >
                  <span v-if="!scope.row.current">-</span>
                  <el-popover v-else placement="right" trigger="hover">
                    <span slot="reference">{{formatThreshold(scope.row.current[1],scope.row.alertRule.unit)}}</span>
                    <div>{{$unixTimeParseToString(scope.row.current[0])}}</div>
                  </el-popover>
                </div>
                <div v-else-if="item.prop == 'option'" class="content-right-options">
                  <span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'alert-list-detail-'+scope.row.id"><i class="nz-icon nz-icon-chart"></i></span>
                  <span :title="$t('overall.delete')" @click="toDeleteMessage(scope.row)" class="content-right-option" :id="'alert-list-delete-'+scope.row.id"><i  class="el-icon-delete"></i></span>
                </div>
                <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
                <template v-else>-</template>
              </template>
            </el-table-column>
            <el-table-column width="28" :resizable="false" v-if="!isPreview">
              <template slot="header" slot-scope="scope">
              <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear" >
                <i class="nz-icon nz-icon-gear"></i>
              </span>
              </template>
              <template v-slot="scope">
                <button v-if="scope.$index == 0" class="to-top" :style="{top: toTopBtnTop}" :class="{'to-top-is-hover': tableHover}" v-show="showTopBtn && mainResizeShow" @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>
              </template>
            </el-table-column>
          </el-table>
          <Pagination :pageObj="pageObj" @pageNo='pageNo'  @pageSize='pageSize' ref="Pagination" :append-to-body="false" pop-class="out-popper-fix"></Pagination>
        </div>
        <!--全屏-->
        <el-dialog class="nz-dialog table-chart-dialog" :title="$t('dashboard.panel.view')"  :visible.sync="screenModal" width="96%"  @close="screenDialogClose" >
          <div slot="title">
            <span class="nz-dialog-title">{{data.title}}</span>
            <div class="float-right panel-calendar dialog-tool">
            </div>
          </div>
          <transition name="el-zoom-in-bottom">
            <div class="el-popover alert-clean-pop" @click="toDeleteMessage(false)" v-if="deleteBox.ids.length > 0">
              <i style="cursor: pointer" class="el-icon-delete"></i>
            </div>
          </transition>
          <el-table
            :id="'tableContainer'+chartIndex"
            class="nz-table"
            :data="storedScreanTableData"
            border
            height="95%"
            ref="alertListScreenTable"
            tooltip-effect="light"
            v-scrollBar:el-table="'large'"
            :cell-class-name="labelsClassName"
            @selection-change="selectChange"
            style="width: 100%;">
            <el-table-column
              :resizable="false"
              type="selection"
              width="38"
              align="center"
            ></el-table-column>
            <el-table-column
              :resizable="false"
              v-for="(item, index) in tablelable"
              v-if="item.show"
              :width="item.width"
              :key="`col-${index}`"
              :label="item.label"
              :show-overflow-tooltip="item.prop != 'labels'"
              min-width="110px"
            >
              <template slot-scope="scope" :column="item">
                <template v-if="item.prop == 'alertRule'">
                  <div class="too-long-split"
                       @click="" :id="'view-rule-'+scope.row[item.prop].id"
                       v-if="scope.row[item.prop].alertName">{{scope.row[item.prop].alertName}}</div>
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
              <span v-if="scope.row[item.prop] == 'high'"><i class="el-icon-arrow-up"></i>&nbsp;{{severityData[1].value}}</span>
              <span style="padding-left: 18px;" v-if="scope.row[item.prop] == 'medium'">{{severityData[0].value}}</span>
              <span v-if="scope.row[item.prop] == 'low'"><i class="el-icon-arrow-down"></i>&nbsp;{{severityData[2].value}}</span>
            </span>
                <template v-else-if="item.prop == 'labels'">
                  <nz-alert-tag :label="key" :type="tagType(key)" style="margin: 5px;"
                                :cursor-point="tagType(key) == 'info' ? false : true"
                                :key="key"
                                v-if="key != 'alertname' && key != 'severity'"
                                v-for="(value, key) in scope.row.labels">{{value}}</nz-alert-tag>
                </template>
                <div v-else-if="item.prop == 'state'">
              <span class="">
                {{scope.row['state'] == 1 ? "Pending" : ""}}
                {{scope.row['state'] == 2 ? "Expired" : ""}}
              </span>
                </div>
                <div v-else-if="item.prop == 'current'" class="too-long-split" >
                  <span v-if="!scope.row.current">-</span>
                  <el-popover v-else placement="right" trigger="hover">
                    <span slot="reference">{{scope.row.current[1]}}</span>
                    <div>{{$unixTimeParseToString(scope.row.current[0])}}</div>
                  </el-popover>
                </div>
                <div v-else-if="item.prop == 'option'" class="content-right-options">
                  <span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'alert-list-detail-'+scope.row.id"><i class="nz-icon nz-icon-chart"></i></span>
                  <span :title="$t('overall.delete')" @click="toDeleteMessage(scope.row)" class="content-right-option" :id="'alert-list-delete-'+scope.row.id"><i  class="el-icon-delete"></i></span>
                </div>
                <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
                <template v-else>-</template>
              </template>
            </el-table-column>
            <el-table-column width="28" :resizable="false">
              <template slot="header" slot-scope="scope">
            <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">
              <i class="nz-icon nz-icon-gear"></i>
            </span>
              </template>
              <template v-slot="scope">
                <button v-if="scope.$index == 0" class="to-top" :style="{top: toTopBtnTop}" :class="{'to-top-is-hover': tableHover}" v-show="showTopBtn && mainResizeShow" @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>
              </template>
            </el-table-column>
          </el-table>
          <Pagination :pageObj="screenPageObj"  @pageNo='screenPageNo' @pageSize='screenPageSize' ref="Pagination" ></Pagination>
          <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
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
                   :append-to-body="true"
                   id="viewGraphDialog"
                   @close="dialogClose">
          <div slot="title">
            {{$t("project.endpoint.dialogTitle")}}
            <div class="float-right panel-calendar dialog-tool" style="display: flex">
              <pick-time :refresh-data-func="queryChartDate" :use-refresh="false" :use-chart-unit="false" v-model="searchTime" style="height: 28px;" @unitChange="chartUnitChange"></pick-time>
            </div>
          </div>
          <chart ref="messageChart" name="alertMessageChart" :unit="chartUnit" ></chart>
        </el-dialog>
        <element-set
          path="/alertList"
          :table-title="tableTitle"
          :dropCol="dropCol"
          @tablelable="tablelabelEmit"
          ref="elementset"
        ></element-set>
      </div>
      <span class="vue-resizable-handle" @mousedown="startResize" v-if="!isPreview"></span>
    </div>
  </div>
</template>

<script>
import bus from '../../libs/bus';
import {Loading} from 'element-ui';
import chartDataFormat from './chartDataFormat'
import loading from "../common/loading";
import timePicker from '../common/timePicker'
import nzAlertTag from "../page/alert/nzAlertTag";
import axios from "axios";
import pickTime from "../common/pickTime";
import chart from "../page/dashboard/overview/chart";
export default {
  name: 'chartTable',
  components: {
    'loading': loading,
    'time-picker':timePicker,
    'nz-alert-tag':nzAlertTag,
    'chart':chart,
    'pick-time':pickTime,
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
    },
    chartInfo:{}
  },
  data() {
    return {
      tableHeight: 0,
        data: {}, // 该图表信息,chartItem
        unit:{},
        isError:false,
        errorContent:'',
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
        images: '',
        //toolbox: false,
        loading:Object,
        panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
        firstLoad: false, // 是否第一次加载
        //showLoading:true,
        //showLoadingScreen:false,
        //showTable:true,
        chartType: 'alertLIst', // 图表类型
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
        minHeight:200,
        chartSpaceHeight:5,//top-border: 1,bottom-border: 1,padding-bottome:3
        titleHeight:38,//title-height:28,magrin-bottom:10
        pageHeight:40,
        divFirstShow:false,
        searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],//全屏显示的时间
        oldSearchTime: [],
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
          }, /*{
          label: this.$t("alert.list.type"),
          prop: 'type',
          show: true,
          width: 100
        }, {
          label: this.$t("alert.list.linked"),
          prop: 'linkObject',
          show: true,
          width: 140
        }, */{
            label: this.$t("alert.list.labels"),
            prop: 'labels',
            show: true,
            width: 200
          }, {
            label: this.$t("alert.severity"),
            prop: 'severity',
            show: true,
            width: 100
          }, {
            label: this.$t('alert.summary'),
            prop: 'summary',
            show: true
          }, {
            label: this.$t('alert.description'),
            prop: 'description',
            show: true
          }, {
            label: this.$t('alert.list.state'),
            prop: 'state',
            show: true,
            width: 100
          }, {
            label: this.$t("alert.startAt"),
            prop: 'startAt',
            show: true,
          }, {
            label: this.$t('alert.endAt'),
            prop: 'endAt',
            show: true,
          }, {
            label: this.$t('alert.list.current'),
            prop: 'current',
            show: true
          }, {
            label: this.$t('overall.option'),
            prop: 'option',
            show: true,
            width: 90
          }
        ],
        tablelable:[],
        dropCol: [],
        toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
        tableHover: false, //控制滚动条和top按钮同时出现
        showTopBtn: false,
        severityData: [
          {
            key: 'medium',
            value: this.$t("alert.config.medium")
          },
          {
            key: 'high',
            value: this.$t("alert.config.high")
          },
          {
            key: 'low',
            value: this.$t("alert.config.low")
          }
        ],
        graphShow: false,
        chartDatas: [],
        chartUnit:5,
        deleteBox: {show: false, ids: "", remark: '', state: 2},
        isPreview:false,
      };
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
    watch: {
      chartInfo:{
        deep:true,
        immediate:true,
        handler(n,o){
          this.data=Object.assign({},n)
        }
      },
      panelId:{
        immediate:true,
        handler(n,o){
          this.panelIdInner=n
        }
      }
    },
    methods: {
      startResize(e) {
        let vm = this;
        this.$chartResizeTool.start(vm, this.data, e);
      },
        labelsClassName(row) {
          if (row.column.label == this.$t("alert.list.labels")) {
            return "alert-message-list-labels";
          } else {
            return "";
          }
        },
      formatThreshold:function(value,unit){
        let unitMethod=chartDataFormat.getUnit(unit)
        if(unitMethod&&value){
          return unitMethod.compute(value,null,2);
        }else{
          return value
        }
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
      closeDialog() {
        this.importBox.show = false;
        this.deleteBox.show = false;
      },
      screenDialogClose:function(){
        this.screenModal = false
        this.deleteBox.ids=[];
        this.$refs.alertListScreenTable.clearSelection();
      },
      toDeleteMessage(obj) {
        if (obj) {
          this.deleteBox.ids = obj.id + "";
        }
        this.deleteBox.show = true;
      },
      selectChange(s) {
        let ids = [];
        this.deleteBox.ids = "";
        s.forEach(item => {
          ids.push(item.id);
        });
        this.deleteBox.ids = ids.join(",");
      },
      deleteMessage() {
        this.$put("alert/message", this.deleteBox).then(res => {
          if (res.code === 200) {
            this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
            this.deleteBox.show = false;
            this.deleteBox.ids="";
            this.getAlertList();
          } else {
            this.$message.error(res.msg);
          }
        })
      },
      chartUnitChange:function(unit){
        this.chartUnit=unit;
        this.$nextTick(()=>{
          this.queryChartDate()
        })
      },
      queryChartDate() {
        let $temp=this;
        let start = this.searchTime[0]?this.searchTime[0]:this.getTime(-1, 'h');
        let end = this.searchTime[1]?this.searchTime[1]:this.getTime(0, 'h')
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
        if(this.$refs.messageChart){
          this.$refs.messageChart.startLoading();
        }
        let axiosArr=[];
        let paramStr = JSON.stringify(this.promQueryParamConvert(this.currentMsg));
        if(paramStr&&paramStr.trim()!='""'){
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
                          data:[
                           this.returnMarkArea()
                          ]
                        }
                      };
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
        }
      },
      getAlertList: function (filterType,isPreview=false,chartInfo) {
        this.resize();
        this.isPreview = isPreview;
        let queryParam={
          pageSize:this.pageObj.pageSize,
          pageNo:this.pageObj.pageNo,
        }
        let chart=null;
        if(chartInfo){
          chart=Object.assign({},chartInfo)
        }else{
          chart=Object.assign({},this.chartInfo)
        }
        if(chart&&chart.param){ //按照粒度，project>module>endpoint  查询只传最细粒度
          let param=chart.param;
          if(param.endpointId&&param.endpointId != ''){
            queryParam.endpointId=param.endpointId;
          }else{
            if(param.moduleId&&param.moduleId!=''){
              queryParam.moduleId=param.moduleId;
            }else{
              if(param.projectId&&param.projectId!=''){
                queryParam.projectId=param.projectId;
              }
            }
          }

          if(param.ruleId&&param.ruleId!=''){
            queryParam.ruleId=param.ruleId;
          }
          if(param.severity&&param.severity!=''){
            queryParam.severity=param.severity;
          }
          if(param.state&&param.state!=''){
            queryParam.state=param.state;
          }
        }

        this.startLoading(filterType);
        this.$get('/alert/message', queryParam).then(response => {
          if (response.code == 200) {
            this.storedTableData = response.data.list;
            this.storedScreanTableData=response.data.list;
            this.storedTableData.forEach((item) => {
              item.labels = JSON.parse(item.labels);
              let paramStr = JSON.stringify(this.promQueryParamConvert(item));
              if(paramStr&& paramStr !='""'){
                this.$get('/prom/api/v1/query?query=' + paramStr.substring(1, paramStr.length-1).replace(/\+/g, "%2B").replace(/ /g, "%20").replace(/\\/g, "")).then(response2 => {
                  let current = [];
                  if (response2.data && response2.data.result && response2.data.result.length > 0) {
                    current = response2.data.result[0].value.map((item, i) => {
                      if (i == 0) {
                        return bus.computeTimezone(item);
                      } else {
                        return parseFloat(item).toFixed(2);
                      }
                    });
                  }
                  this.$set(item, "current", current);
                });
              }
            });
            this.pageObj.total = response.data.total;
            this.isError = false;
            this.errorContent = '';
            this.divFirstShow = true;

            this.firstShow = true; // 展示操作按键
            this.endLoading(filterType);
          }else{
            this.isError = true;
            this.errorContent = response.msg;
          }
        });
      },
      promQueryParamConvert(obj) {
        if(obj){
          return "(" + obj.alertRule.expr + ") and (" + function(){
            let q = "{";
            for (let k in obj.labels) {
              if (k != 'alertname' && k != 'severity') {
                q += k;
                q += "=";
                q += ("'" + obj.labels[k] + "',");
              }
            };
            if (q.length > 1) {
              q = q.substring(0, q.length-1);
            }
            q += "}";
            return q;
          }() + ")";
        }
        return '';
      },
      elementsetShow(s, e) {
        var eventfixed = {
          shezhi: 0,
          screen: 0
        };
        eventfixed[s] = 1;
        e.preventDefault();
        this.$store.commit('setHeaderTable', this.tablelable);
        this.$store.commit('setEventfixed', eventfixed);
        const h = document.documentElement.clientHeight;
        const w = document.documentElement.clientWidth;
        const dw = this.$refs.elementset.$el.offsetWidth;
        const dh = this.$refs.elementset.$el.offsetHeight;
        let positionx =
          e.clientX + dw <= w - 10 ? e.clientX + 14 : e.clientX + 14 - dw;
        let positiony =
          e.clientY + dh <= h - 10
            ? e.clientY + 20
            : e.clientY + 20 - (e.clientY + dh - h);
        this.$store.commit('setPosition', {positionx, positiony});
      },
      elementsetHide() {
        //悬浮点击空白隐藏
        console.log(11112)
        this.$refs.elementset.elementsetHide();
      },
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        this.tablelable = data;
      },
        pageNo(val) {
          this.pageObj.pageNo = val;
          this.getAlertList();
        },
        pageSize(val) {
          this.pageObj.pageSize = val;
          this.getAlertList();
        },

        screenPageNo(val) {
          this.screenPageObj.pageNo = val;
          this.getAlertList();
        },
        screenPageSize(val) {
          this.screenPageObj.pageSize = val;
          this.getAlertList();
        },
        startLoading(area){
          if(area==='showFullScreen'){
            //this.showLoadingScreen = true;
            this.$refs['localLoadingScreen'+this.chartIndex].startLoading();
          }else {
            //this.showLoading = true;
            this.$refs['localLoading'+this.chartIndex].startLoading();
          }
        },
        endLoading(area){
          if(area==='showFullScreen'){
            //this.showLoadingScreen = false;
            this.$refs['localLoadingScreen'+this.chartIndex].endLoading();
          }else {
            //this.showLoading = false;
            this.$refs['localLoading'+this.chartIndex].endLoading();
          }
        },
      resize(chartItem) {
        let deHeight = this.$chartResizeTool.titleHeight+this.$chartResizeTool.chartTableBlankHeight;
        let container = document.querySelector('#chartTableDiv' + this.chartIndex + " .table-container");
        container.style.height = `calc(100% - ${deHeight}px)`;
        this.tableHeight = `calc(100% - 34px)`;
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
        //this.filter.start_time = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss');
        //this.filter.end_time = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss');
        //this.showTable = false;
        this.searchTime = [...time];
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
            this.storedScreanTableData = this.storedTableData
            this.screenModal = true;
            this.deleteBox.ids=[];
            this.$refs.alertListTable.clearSelection();
        },
        // 设置数据, filter区分
        setData(chartItem, seriesItem, panelId, filter,area,errorMsg) {
          console.info(chartItem,title)
        },

    },
    mounted() {
        this.firstLoad = false;
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageObj.pageSize = pageSize
      }
      this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + '/alertList')
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + '/alertList'))
        : this.tableTitle;
      this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + '/alertList')
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + '/alertList'))
        : this.tableTitle;
    },
    beforeDestroy() {
      this.clearChart();
    },
};
</script>
