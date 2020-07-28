<style scoped>
  .list {
    height: 100%;
  }
  /deep/ .too-long-split{
    cursor: pointer;
    vertical-align: bottom;
  }
  span.el-tooltip {
    display: inline-block;
  }
</style>
<style lang="scss">
  @import '../../charts/chart';
</style>
<template>
  <div class="list">
    <left-menu >
      <div slot="content-left" class="slot-content">
      <div class="sidebar-title">{{$t('alert.alert')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top sidebar-info-item-active">{{$t('alert.alertList')}}</div>
        <div class="sidebar-info-item" @click="jumpTo('alertConfig')" id="alert-jump-config">
          {{$t('alert.alertConfig')}}
        </div>
      </div>
    </div>
    <div slot="content-right" class="slot-content">
      <!--<div class="main-list main-and-sub-transition" :class="{'main-list-with-sub': showSubList}">-->
        <!--<div class="top-tools" v-show="mainResizeShow">-->
          <!--<div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': showSubList}">-->
            <!--<div class="top-tool-search">-->
              <!--<search-input :searchMsg="searchMsg" @search="search" :inTransform="inTransform"></search-input>-->
            <!--</div>-->
            <!--<button type="button" @click="showExportDialog" :title="$t('overall.exportExcelLower')"-->
                    <!--class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" id="alert-list-export">-->
              <!--<i class="el-icon-download"></i>-->
            <!--</button>-->
          <!--</div>-->
          <!--<div class="pagination-top pagination-top-hide display-none"></div>-->
        <!--</div>-->
        <!--<transition name="el-zoom-in-bottom">-->
          <!--<div class="el-popover alert-clean-pop" @click="toDeleteMessage(false)" v-if="deleteBox.ids.length > 0">-->
            <!--<i style="cursor: pointer" class="el-icon-delete"></i>-->
          <!--</div>-->
        <!--</transition>-->
        <!--<el-table-->
          <!--class="nz-table"-->
          <!--:data="tableData"-->
          <!--border-->
          <!--v-show="mainResizeShow"-->
          <!--ref="alertListTable"-->
          <!--tooltip-effect="light"-->
          <!--:height="mainTableHeight"-->
          <!--v-scrollBar:el-table="'large'"-->
          <!--v-loading="loading"-->
          <!--:cell-class-name="labelsClassName"-->
          <!--@selection-change="selectChange"-->
          <!--style="width: 100%;"-->
          <!--@sort-change="tableDataSort"-->
        <!--&gt;-->
          <!--<el-table-column-->
            <!--:resizable="false"-->
            <!--type="selection"-->
            <!--width="38"-->
            <!--align="center"-->
          <!--&gt;-->
          <!--</el-table-column>-->
          <!--<el-table-column-->
            <!--:resizable="false"-->
            <!--v-for="(item, index) in tablelable"-->
            <!--v-if="item.show"-->
            <!--:width="item.width"-->
            <!--:minWidth="item.minWidth"-->
            <!--:key="`col-${index}`"-->
            <!--:label="item.label"-->
            <!--:show-overflow-tooltip="item.prop != 'labels'"-->
            <!--min-width="110px"-->
            <!--:sortable="sortableShow(item.prop)"-->
            <!--:prop="propTitle(item.prop)"-->
            <!--:sort-orders="['ascending', 'descending']"-->
          <!--&gt;-->
            <!--<template slot-scope="scope" :column="item">-->
              <!--<template v-if="item.prop == 'alertRule'">-->
                <!--&lt;!&ndash;<div class="link too-long-split"-->
                   <!--@click="viewRule(scope.row[item.prop].id)" :id="'view-rule-'+scope.row[item.prop].id"-->
                   <!--v-if="scope.row[item.prop].alertName">{{scope.row[item.prop].alertName}}</div>&ndash;&gt;-->
                  <!--<span class="too-long-split" v-if="scope.row[item.prop].alertName" @mouseover="alertMessagehover(scope.row,scope.$index)">-->
                    <!--<el-tooltip placement="right" effect="light">-->
                      <!--<alertRuleInfo slot="content" :id="scope.row.alertRule.id" :severityData="severityData" :messageLoad="scope.row.loading"></alertRuleInfo>-->
                      <!--<span>{{scope.row[item.prop].alertName}}</span>-->
                    <!--</el-tooltip>-->
                  <!--</span>-->
                <!--<template v-else>-</template>-->
              <!--</template>-->
              <!--&lt;!&ndash;<div v-else-if="item.prop == 'type'" class="content-right-options">-->
                <!--<span v-if="scope.row[item.prop] == 1">Project</span>-->
                <!--<span v-if="scope.row[item.prop] == 2">Module</span>-->
                <!--<span v-if="scope.row[item.prop] == 3">Device</span>-->
              <!--</div>&ndash;&gt;-->
              <!--<template v-else-if="item.prop == 'summary'">-->
                <!--<template v-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>-->
                <!--<template v-else>-</template>-->
              <!--</template>-->
              <!--<template v-else-if="item.prop == 'description'">-->
                <!--<template v-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>-->
                <!--<span v-else>-</span>-->
              <!--</template>-->
              <!--<span v-else-if="item.prop == 'severity'">-->
                <!--<span v-if="scope.row[item.prop] == 'high'"><i class="el-icon-arrow-up"></i>&nbsp;{{severityData[1].value}}</span>-->
                <!--<span style="padding-left: 18px;" v-if="scope.row[item.prop] == 'medium'">{{severityData[0].value}}</span>-->
                <!--<span v-if="scope.row[item.prop] == 'low'"><i class="el-icon-arrow-down"></i>&nbsp;{{severityData[2].value}}</span>-->
              <!--</span>-->
              <!--&lt;!&ndash;<div v-else-if="item.prop == 'linkObject'">-->
                <!--<span v-if="(scope.row['type'] == 1 || scope.row['type'] == 2) && scope.row[item.prop]" class="link too-long-split"-->
                      <!--@click="viewAlertType(scope.row['type'],scope.row[item.prop])" style="max-width: 125px;"-->
                      <!--:id="'link-obj-'+scope.row['type']+'-'+scope.row[item.prop].id">{{scope.row[item.prop].name}}</span>-->
                <!--<span v-else-if="scope.row['type'] == 3 && scope.row[item.prop]" class="link"-->
                      <!--@click="viewAlertType(scope.row['type'],scope.row[item.prop].id)"-->
                      <!--:id="'link-obj-'+scope.row['type']+'-'+scope.row[item.prop].id">{{scope.row[item.prop].host}}</span>-->
                <!--<span v-else>-</span>-->
              <!--</div>&ndash;&gt;-->
              <!--<template v-else-if="item.prop == 'labels'" class="labels">-->
<!--&lt;!&ndash;                <nz-alert-tag :label="key" :type="tagType(key)" style="margin: 5px;" @click="showTagDetail(scope.row, key)"&ndash;&gt;-->
                  <!--<el-tooltip-->
                    <!--v-for="item in labelsSort(scope.row.labels)"-->
                    <!--placement="right"-->
                    <!--effect="light"-->
                    <!--:disabled="labelToolTipDis(item.label)"-->
                    <!--:key="item.label"-->
                  <!--&gt;-->
                  <!--<alertLabel-->
                    <!--v-if="!labelToolTipDis(item.label)"-->
                    <!--slot="content"-->
                    <!--:id="scope.row[item.label].id"-->
                    <!--:type="item.label"-->
                    <!--:labelLoading="scope.row[item.label].loading"-->
                  <!--&gt;</alertLabel>-->
                   <!--<span @mouseover="labelHover(scope.row,scope.$index,item.label)">-->
                     <!--<nz-alert-tag-->
                       <!--:label="item.label" :type="tagType(item.label)" style="margin: 5px 0 5px 5px;"-->
                       <!--:cursor-point="tagType(item.label) == 'info' ? false : true"-->
                       <!--:key="item.label"-->
                       <!--v-if="item.label != 'alertname' && item.label != 'severity'"-->
                     <!--&gt;-->
                       <!--{{item.value}}-->
                     <!--</nz-alert-tag>-->
                   <!--</span>-->
                <!--</el-tooltip>-->
                <!--&lt;!&ndash;<el-tag @click="showTagDetail(scope.row, key)"-->
                        <!--:key="key"-->
                        <!--:class="{'link': key == 'asset' || key == 'endpoint' || key == 'project' || key == 'module' || key == 'datacenter'}"-->
                        <!--v-if="key != 'alertname' && key != 'severity'"-->
                        <!--:type="tagType(key)"-->
                        <!--size="mini" v-for="(value, key) in scope.row.labels" class="alert-message-tag">{{tagValue(key, value)}}</el-tag>&ndash;&gt;-->
              <!--</template>-->
              <!--<div v-else-if="item.prop == 'state'">-->
                <!--<span class="">-->
                  <!--{{scope.row['state'] == 1 ? "Pending" : ""}}-->
                  <!--{{scope.row['state'] == 2 ? "Expired" : ""}}-->
                <!--</span>-->
              <!--</div>-->
              <!--<div v-else-if="item.prop == 'current'" class="too-long-split" >-->
                <!--<span v-if="!scope.row.current">-</span>-->
                <!--<el-popover v-else placement="right" trigger="hover">-->
                  <!--<div slot="reference">-->
                    <!--<span @click="detail(scope.row)" class="content-right-option" :id="'alert-list-detail-'+scope.row.id"><i class="nz-icon nz-icon-chart"></i></span>-->
                    <!--<span>{{formatThreshold(scope.row.current[1],scope.row.alertRule.unit)}}</span>-->
                  <!--</div>-->
                  <!--<div>{{$unixTimeParseToString(scope.row.current[0])}}</div>-->
                <!--</el-popover>-->
              <!--</div>-->
              <!--<div v-else-if="item.prop == 'option'" class="content-right-options">-->
                <!--<span :title="$t('overall.delete')" @click="toDeleteMessage(scope.row)" class="content-right-option" :id="'alert-list-delete-'+scope.row.id"><i  class="el-icon-delete"></i></span>-->
              <!--</div>-->
              <!--<span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>-->
              <!--<template v-else>-</template>-->
            <!--</template>-->
          <!--</el-table-column>-->

          <!--<el-table-column width="28" :resizable="false">-->
            <!--<template slot="header" slot-scope="scope">-->
              <!--<span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">-->
                <!--<i class="nz-icon nz-icon-gear"></i>-->
              <!--</span>-->
            <!--</template>-->
            <!--<template v-slot="scope">-->
              <!--<button v-if="scope.$index == 0" class="to-top" :style="{top: toTopBtnTop}" :class="{'to-top-is-hover': tableHover}" v-show="showTopBtn && mainResizeShow" @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>-->
            <!--</template>-->
          <!--</el-table-column>-->
        <!--</el-table>-->
        <!--<div class="pagination-bottom" v-show="!showSubList">-->
          <!--<Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>-->
        <!--</div>-->
      <!--</div>-->
      <!--<bottom-box v-if="showSubList" :show-sub-list="showSubList" :subResizeShow="subResizeShow" :isFullScreen="isFullScreen" :from="'alertMessage'" :targetTab.sync="targetTab" :detailList="tabDetailList"-->
                  <!--@closeSubList="showSubList = false" @fullScreen="fullScreen" @exitFullScreen="exitFullScreen" @listResize="listResize" :tabList="tabList"></bottom-box>-->
      <alertMessage></alertMessage>
    </div>
    </left-menu>
    <!--<alert-config-box :parentAlertRule="viewRuleData" @reload="getAlertList" ref="alertConfigBox"></alert-config-box>
    <project-box :project="viewProjectData" ref="projectBox" @reload="getAlertList"></project-box>
    <module-box :module="viewModuleData" @reload="getAlertList" ref="moduleBox"></module-box>-->
    <!--<asset-edit-unit :edit-unit-show='viewAssetState' @refreshData="getAlertList" @sendStateData="tabControl"
                     ref="assetEditUnit"></asset-edit-unit>-->
    <!--<asset-box :edit-unit-show='viewAssetState' @refreshData="getAlertList" @sendStateData="tabControl"
               ref="assetEditUnit"></asset-box>-->
    <element-set
      v-clickoutside="elementsetHide"
      :table-title="tableTitle"
      :dropCol="dropCol"
      @tablelable="tablelabelEmit"
      ref="elementset"
    ></element-set>
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
               @close="dialogClose">
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
  import nzAlertTag from './nzAlertTag';
  import chart from '../../page/dashboard/overview/chart'
  import chartDataFormat from "../../charts/chartDataFormat";
  import alertRuleInfo from '../../common/alert/alertRuleInfo'
  import alertLabel from '../../common/alert/alertLabel'
  import alertMessage from './alertMessage'
  var vm;
  export default {
    name: "alertList",
    components: {
      'nz-alert-tag': nzAlertTag,
      'chart': chart,
      'alertRuleInfo':alertRuleInfo,
      'alertLabel':alertLabel,
      'alertMessage':alertMessage,
    },
    data() {
      vm = this;
      return {
        loading: false,
        /*二级列表相关*/
        tabList: [], //二级列表的标签
        tabDetailList: [], //多个详情
        targetTab: '', //展示二级列表中的哪个页签
        inTransform: false, //搜索框相关，搜索条件下拉框是否在transform里
        mainResizeShow: true, //dom高度改变时部分内容是否展示
        subResizeShow: true,
        isFullScreen: false,
        showSubList: false, //是否展示二级列表
        mainTableHeight: this.$tableHeight.normal, //主列表table高度

        toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
        tableHover: false, //控制滚动条和top按钮同时出现

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

        tableId: 'alertListTable', //需要分页的table的id，用于记录每页数量
        showTopBtn: false,
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
            width:250,
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
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 1,
            name: this.$t('alert.alertName'),
            type: 'input',
            label: 'alertName',
            disabled: false
          }, /*{
            id: 3,
            name: this.$t('alert.list.type'),
            type: 'select',
            label: 'alertType',
            disabled: false
          }, */{
            id: 20,
            name: this.$t('alert.severity'),
            type: 'selectString',
            label: 'severity',
            disabled: false
          }, {
            id: 21,
            name: this.$t('asset.asset'),
            type: 'asset',
            label: 'asset',
            disabled: false
          }, {
            id:22,
            name: this.$t('project.project.project'),
            type: 'project',
            label: 'project',
            disabled: false
          }, {
            id:23,
            name: this.$t('project.module.module'),
            type: 'module',
            label: 'module',
            disabled: false
          }, {
            id:24,
            name: this.$t('project.endpoint.endpoint'),
            type: 'input',
            label: 'endpointId',
            disabled: false
          }, {
            id:25,
            name: this.$t('alert.list.state'),
            type: 'select',
            label: 'alertMessageState',
            disabled: false
          }],
        },
        searchLabel: { //搜索参数

        },
        tablelable: [],
        dropCol: [],
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
        tableData: [],
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
        this.$refs.elementset.elementsetHide();
      },
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        this.tablelable = data;
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
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.loading = true;
        this.$get('alert/message', this.searchLabel).then(response => {
          this.loading = false;
          if (response.code == 200) {
            this.tableData = response.data.list;
            this.tableData.forEach((item) => {
              item.labels = JSON.parse(item.labels);
              let paramStr = JSON.stringify(this.promQueryParamConvert(item));
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
                }else{
                  current=[null,null]
                }
                this.$set(item, "current", current);
              });
            });
            this.deleteBox.ids='';
            this.pageObj.total = response.data.total;
          }
        });
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
        this.$put("alert/message", this.deleteBox).then(res => {
          if (res.code === 200) {
            this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
            this.deleteBox.show = false;
            this.getAlertList();
          } else {
            this.$message.error(res.msg);
          }
        })
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
        this.$bottomBoxWindow.fullScreen(vm);
      },
      // 退出全屏
      exitFullScreen() {
        this.$bottomBoxWindow.exitFullScreen(vm);
      },
      // 鼠标拖动二级列表
      listResize(e) {
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
          this.showSubList = true;
          this.tabList = labelList;
          /*this.tabDetailList = detailList;
          this.targetTab = key;*/
        }
      },
      labelsClassName(row) {
        if (row.column.label == this.$t("alert.list.labels")) {
          return "alert-message-list-labels";
        } else {
          return "";
        }
      },
      jumpTo(data, id) {
        bus.$emit("menu-change", data);
        this.$store.state.assetData.moduleData = data
        this.$store.state.assetData.selectedData = id
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getAlertList();
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val);
        this.getAlertList();
      },
      search: function (searchObj) {
        let orderBy='';
        if(this.searchLabel.orderBy){
          orderBy=this.searchLabel.orderBy
        }
        this.searchLabel = {};
        this.pageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            if (item == "alertMessageState") {
              this.$set(this.searchLabel, "state", searchObj[item]);
            } else{
              this.$set(this.searchLabel, item, searchObj[item]);
            }
          }
        }
        if(orderBy){
          this.$set(this.searchLabel, 'orderBy', orderBy);
        }
        this.getAlertList();
      },
      viewRule: function (id) {
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
        let orderBy='';
        if(item.order==='ascending'){
          orderBy=item.prop;
        }
        if(item.order==='descending'){
          orderBy='-'+item.prop;
        }
        this.pageObj.orderBy=orderBy;
        this.$set(this.searchLabel, "orderBy", orderBy);
        this.getAlertList();
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
        this.$set(this.tableData,index,item);
      },
      // label 鼠标划入
      labelHover(item,index,type){
        if(this.labelToolTipDis(type)){
          return
        }
        item[type].loading=true;
        this.$set(this.tableData,index,item);
      }
    },
    watch: {
      showSubList(n) {
        this.$bottomBoxWindow.showSubListWatch(vm, n);
      },
    },
    mounted() {
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageObj.pageSize = pageSize
      }

      this.getAlertList();
      // this.$nextTick(() => {
      //   //绑定滚动条事件，控制top按钮
      //   let el = this.$refs.alertListTable.$el.querySelector(".el-table__body-wrapper");
      //   if (el._ps_) {
      //     el.addEventListener("ps-scroll-y", () => {
      //       if (el._ps_.scrollbarYTop > 50) {
      //         this.showTopBtn = true;
      //       } else {
      //         this.showTopBtn = false;
      //       }
      //     });
      //     el.addEventListener("mouseenter", () => {
      //       this.tableHover = true;
      //     });
      //     el.addEventListener("mouseleave", () => {
      //       this.tableHover = false;
      //     });
      //   }
      // });
      this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
    }
  }
</script>
