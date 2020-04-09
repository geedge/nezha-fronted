<style scoped>
  .list {
    height: 100%;
  }
</style>
<template>
  <div class="list">
    <div class="content-left">
      <div class="sidebar-title">{{$t('alert.alert')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top sidebar-info-item-active">{{$t('alert.alertList')}}</div>
        <div class="sidebar-info-item" @click="jumpTo('alertConfig')" id="alert-jump-config">
          {{$t('alert.alertConfig')}}
        </div>
      </div>
    </div>
    <div class="content-right">
      <div class="main-list main-and-sub-transition" :class="{'main-list-with-sub': showSubList}">
        <div class="top-tools" v-show="mainResizeShow">
          <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': showSubList}">
            <div class="top-tool-search">
              <search-input :searchMsg="searchMsg" @search="search" :inTransform="inTransform"></search-input>
            </div>
            <button type="button" @click="showExportDialog" :title="$t('overall.exportExcelLower')"
                    class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" id="alert-list-export">
              <i class="el-icon-download"></i>
            </button>
          </div>
          <div class="pagination-top pagination-top-hide display-none"></div>
        </div>
        <div class="el-popover alert-clean-pop" @click="toDeleteMessage" v-if="deleteBox.ids.length > 0">
          <i style="cursor: pointer" class="el-icon-delete"></i>
        </div>
        <el-table
          class="nz-table"
          :data="tableData"
          border
          v-show="mainResizeShow"
          ref="alertListTable"
          tooltip-effect="light"
          :height="mainTableHeight"
          v-scrollBar:el-table
          :cell-class-name="labelsClassName"
          @selection-change="selectChange"
          style="width: 100%;">
          <el-table-column
            :resizable="false"
            type="selection"
            width="38"
            align="center"
          >
          </el-table-column>
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
                <div class="link too-long-split"
                   @click="viewRule(scope.row[item.prop].id)" :id="'view-rule-'+scope.row[item.prop].id"
                   v-if="scope.row[item.prop].alertName">{{scope.row[item.prop].alertName}}</div>
                <template v-else>-</template>
              </template>
              <!--<div v-else-if="item.prop == 'type'" class="content-right-options">
                <span v-if="scope.row[item.prop] == 1">Project</span>
                <span v-if="scope.row[item.prop] == 2">Module</span>
                <span v-if="scope.row[item.prop] == 3">Device</span>
              </div>-->
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
              <!--<div v-else-if="item.prop == 'linkObject'">
                <span v-if="(scope.row['type'] == 1 || scope.row['type'] == 2) && scope.row[item.prop]" class="link too-long-split"
                      @click="viewAlertType(scope.row['type'],scope.row[item.prop])" style="max-width: 125px;"
                      :id="'link-obj-'+scope.row['type']+'-'+scope.row[item.prop].id">{{scope.row[item.prop].name}}</span>
                <span v-else-if="scope.row['type'] == 3 && scope.row[item.prop]" class="link"
                      @click="viewAlertType(scope.row['type'],scope.row[item.prop].id)"
                      :id="'link-obj-'+scope.row['type']+'-'+scope.row[item.prop].id">{{scope.row[item.prop].host}}</span>
                <span v-else>-</span>
              </div>-->
              <template v-else-if="item.prop == 'labels'">
                <el-tag @click="showTagDetail(scope.row.labels, key)"
                        :key="key"
                        :class="{'link': key == 'asset' || key == 'endpoint' || key == 'project' || key == 'module' || key == 'datacenter'}"
                        v-if="key != 'alertname' && key != 'severity' && key != 'linkId'"
                        :type="tagType(key)"
                        size="mini" v-for="(value, key) in scope.row.labels" class="alert-message-tag">{{tagValue(key, value)}}</el-tag>
              </template>
              <div v-else-if="item.prop == 'state'">
                <span class="">
                  {{scope.row['state'] == 1 ? "Pending" : ""}}
                  {{scope.row['state'] == 2 ? "Expired" : ""}}
                </span>
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
          </el-table-column>
        </el-table>
        <div class="pagination-bottom" v-show="!showSubList">
          <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
        </div>
        <button class="to-top" v-show="showTopBtn" @click="$toTop"><i class="nz-icon nz-icon-top"></i></button>
      </div>
      <bottom-box v-if="showSubList" :show-sub-list="showSubList" :subResizeShow="subResizeShow" :isFullScreen="isFullScreen" :from="'alertMessage'" :targetTab="targetTab" :detailList="tabDetailList"
                  @closeSubList="showSubList = false" @fullScreen="fullScreen" @exitFullScreen="exitFullScreen" @listResize="listResize" :tabList="tabList"></bottom-box>
    </div>
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
    <!--删除确认提示-->
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
  </div>

</template>
<script>
  import bus from '../../../libs/bus';
  import axios from 'axios'
  var vm;
  export default {
    name: "alertList",
    data() {
      vm = this;
      return {
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

        //导出相关
        importBox: {show: false, title:this.$t('overall.exportExcel')},
        deleteBox: {show: false, ids: "", remark: '', state: 2},

        tableId: 'alertListTable', //需要分页的table的id，用于记录每页数量
        showTopBtn: false,
        pageObj: {
          pageNo: 1,
          pageSize: 20,
          total: 0
        },
        tableTitle: [
          {
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
          }, /*{
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true
          }*/
        ],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 2,
            name: this.$t('alert.alertName'),
            type: 'input',
            label: 'alertName',
            disabled: false
          }, {
            id: 3,
            name: this.$t('alert.list.type'),
            type: 'select',
            label: 'alertType',
            disabled: false
          }, {
            id: 4,
            name: this.$t('alert.severity'),
            type: 'selectString',
            label: 'severity',
            disabled: false
          }, {
            id: 11,
            name: this.$t('asset.asset'),
            type: 'asset',
            label: 'asset',
            disabled: true
          }, {
            id: 12,
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
            return "";
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
      getAlertList: function () {
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.$get('alert/message', this.searchLabel).then(response => {
          if (response.code == 200) {
            this.tableData = response.data.list;
            this.tableData.forEach((item) => {
              item.labels = JSON.parse(item.labels);
            });
            this.pageObj.total = response.data.total;
          }
        });
      },
      //asset弹框控制
      tabControl(data) {
        if (data === 'close') {
          this.viewAssetState = false
          this.$refs['assetEditUnit'].tabView = false
        }
      },
      toDeleteMessage() {
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
      exportExcel:function(params){
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
      showTagDetail(labels, key) {
        let open = false;
        if (key == "asset" || key == "project" || key == "module" || key == "endpoint" || key == "datacenter") {
          open = true;
        }
        if (open) {
          let labelList = [];
          let detailList = [];
          for (let item in labels) {
            if (item == "asset" || item == "project" || item == "module" || item == "endpoint" || item == "datacenter") {
              labelList.push(item);
              detailList.push(labels[item]);
            }
          }
          this.showSubList = true;
          this.tabList = labelList;
          this.tabDetailList = detailList;
          this.targetTab = key;
        }
      },
      labelsClassName(row) {
        if (row.columnIndex == 2) {
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
        this.searchLabel = {};
        this.pageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
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
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.alertListTable.$el.querySelector(".el-table__body-wrapper");
        if (el._ps_) {
          el.addEventListener("ps-scroll-y", () => {
            if (el._ps_.scrollbarYTop > 50) {
              this.showTopBtn = true;
            } else {
              this.showTopBtn = false;
            }
          });
        }
      });
      this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
    }
  }
</script>
