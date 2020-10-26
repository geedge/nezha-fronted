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
  /deep/.top-tools{
    z-index: 1;
  }
</style>
<style lang="scss">
  @import '../../charts/chart';
</style>
<template>
  <div class="list">
    <div class="main-list main-and-sub-transition" :class="{'main-list-with-sub': bottomBox.showSubList}">
      <div class="top-tools" v-show="bottomBox.mainResizeShow">
        <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': bottomBox.showSubList}">
          <pick-time :refresh-data-func="getAlertList" v-model="searchTime" :use-chart-unit="false" :use-refresh="false" :default-pick="12" :show-empty="true"></pick-time>
          <div class="top-tool-search">
            <search-input :searchMsg="searchMsg" @search="search" :bottomBox.inTransform="bottomBox.inTransform"></search-input>
          </div>
          <button type="button" @click="showExportDialog" :title="$t('overall.exportExcelLower')"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" id="alert-list-export">
            <i class="nz-icon nz-icon-download1"></i>
          </button>
        </div>
        <div class="pagination-top pagination-top-hide display-none"></div>
      </div>
      <alertMessageTable
        :tableData="tableData"
        :loading="tools.loading"
        :tableHeight="mainTableHeight"
        :tableId="tableId"
        @tableDataSort="tableDataSort"
        @deleteMessage="deleteMessage"
      ></alertMessageTable>
      <div class="pagination-bottom" v-show="!bottomBox.showSubList">
        <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
      </div>
    </div>
    <bottom-box v-if="bottomBox.showSubList" :show-sub-list="bottomBox.showSubList" :sub-resize-show="bottomBox.subResizeShow" :is-full-screen="bottomBox.isFullScreen" :from="'alertMessage'" :target-tab.sync="bottomBox.targetTab" :detailList="tabDetailList"
                @closeSubList="bottomBox.showSubList = false" @fullScreen="fullScreen" @exitFullScreen="exitFullScreen" @listResize="listResize" :tabList="tabList"></bottom-box>
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
    <!--<div class="export-xlsx">-->
      <!--<el-dialog :visible.sync="deleteBox.show" :title="$t('overall.delete')" :modal-append-to-body='false' :show-close="true" width="300px" @close="closeDialog" class="nz-message">-->
        <!--<div class="upload-body">-->
          <!--<el-input type="textarea" :placeholder="$t('alert.description')" v-model="deleteBox.remark"></el-input>-->
          <!--<div style="text-align: right; margin-top: 10px;">-->
            <!--<button @click="closeDialog" class="el-button el-button&#45;&#45;default el-button&#45;&#45;small">-->
              <!--<span>{{$t('tip.no')}}</span>-->
            <!--</button>-->
            <!--<button @click="deleteMessage" class="el-button el-button&#45;&#45;default el-button&#45;&#45;small el-button&#45;&#45;primary">-->
              <!--<span>{{$t('tip.yes')}}</span>-->
            <!--</button>-->
          <!--</div>-->
        <!--</div>-->
      <!--</el-dialog>-->
    <!--</div>-->
    <!--<el-dialog class="line-chart-block-modal nz-dialog endpoint-dialog"-->
               <!--:title="$t('overall.detail')"-->
               <!--:visible.sync="graphShow"-->
               <!--width="90%"-->
               <!--id="viewGraphDialog"-->
               <!--@close="dialogClose">-->
      <!--<div slot="title">-->
        <!--{{$t("project.endpoint.dialogTitle")}}-->
        <!--<div class="float-right panel-calendar dialog-tool" style="display: flex">-->
          <!--<pick-time :refresh-data-func="queryChartDate" :use-refresh="false" :use-chart-unit="false" v-model="searchTime" style="height: 28px;" @unitChange="chartUnitChange"></pick-time>-->
        <!--</div>-->
      <!--</div>-->
      <!--<chart ref="messageChart" name="alertMessageChart" :unit="chartUnit"></chart>-->
    <!--</el-dialog>-->
  </div>

</template>
<script>
  import bus from '../../../libs/bus';
  import axios from 'axios';
  import nzAlertTag from './nzAlertTag';
  import chart from '../../page/dashboard/overview/chart'
  import pickTime from "../../common/pickTime";
  import chartDataFormat from "../../charts/chartDataFormat";
  import alertRuleInfo from '../../common/alert/alertRuleInfo'
  import alertLabel from '../../common/alert/alertLabel'
  import alertMessageTable from '../../common/alert/alertMessageTable.vue'
  export default {
    name: "alertList",
    components: {
      'nz-alert-tag': nzAlertTag,
      'chart': chart,
      'alertRuleInfo':alertRuleInfo,
      'alertLabel':alertLabel,
      'alertMessageTable':alertMessageTable,
      'pick-time':pickTime,
    },
    data() {
      return {
        /*二级列表相关*/
        mainTableHeight: this.$tableHeight.normal, //主列表table高度
        /*二级页面相关*/
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
        searchTime: [],
        currentMsg: {},
        chartUnit: 5,

        tableId: 'alertListTable', //需要分页的table的id，用于记录每页数量
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
        tableData: [],
        requestIndex:0,
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

      getAlertList: function () {
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        if(this.searchTime&& this.searchTime.length>1){
          this.$set(this.searchLabel, "startAt", this.timezoneToUtcTimeStr(this.searchTime[0]));
          this.$set(this.searchLabel, "endAt", this.timezoneToUtcTimeStr(this.searchTime[1]));
        }else{
          delete this.searchLabel.startAt
          delete this.searchLabel.endAt
        }
        this.tools.loading = true;
        this.$get('alert/message', this.searchLabel).then(response => {
          this.tools.loading = false;
          if (response.code == 200) {
            this.tableData = response.data.list;
            this.$nextTick(() => {
              this.tableData.forEach((item) => {
                item.labels = JSON.parse(item.labels);
                if(item.alertRule.buildIn != 1){
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
                    this.requestIndex+=1;
                    item.current=current;
                    if(this.requestIndex===this.tableData.length){
                      this.$set(item, "current", current);
                      this.requestIndex=0;
                    }
                  });
                }
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
      deleteMessage(deleteBox,cb) {
        this.$put("alert/message", deleteBox).then(res => {
          if (res.code === 200) {
            this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
            this.getAlertList();
            cb();
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
        let searchLabel=Object.assign({},this.searchLabel)
        this.$set(searchLabel,'language',localStorage.getItem("nz-language") ? localStorage.getItem("nz-language") : 'en')
        this.exportExcel(searchLabel);
        this.closeDialog();
      },
      exportAll:function(){
        let temp = JSON.parse(JSON.stringify(this.searchLabel));
        temp.pageSize = -1;
        this.$set(temp,'language',localStorage.getItem("nz-language") ? localStorage.getItem("nz-language") : 'en')
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
          /*this.tabDetailList = detailList;
          this.bottomBox.targetTab = key;*/
        }
      },
      labelsClassName(row) {
        if (row.column.label == this.$t("alert.list.labels")) {
          return "alert-message-list-labels";
        } else {
          return "";
        }
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
      search(searchObj) {
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
      // this.$nextTick(() => {
      //   //绑定滚动条事件，控制top按钮
      //   let el = this.$refs.alertListTable.$el.querySelector(".el-table__body-wrapper");
      //   if (el._ps_) {
      //     el.addEventListener("ps-scroll-y", () => {
      //       if (el._ps_.scrollbarYTop > 50) {
      //         this.tools.showTopBtn = true;
      //       } else {
      //         this.tools.showTopBtn = false;
      //       }
      //     });
      //     el.addEventListener("mouseenter", () => {
      //       this.tools.tableHover = true;
      //     });
      //     el.addEventListener("mouseleave", () => {
      //       this.tools.tableHover = false;
      //     });
      //   }
      // });
    }
  }
</script>
