<style scoped>
  .config {
    height: 100%;
  }
</style>
<template>
  <div class="config">
    <left-menu >
      <div slot="content-left" class="slot-content">
      <div class="sidebar-title">{{$t('alert.alert')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('alertList')" id="alert-jump-alertlist">
          {{$t('alert.alertList')}}
        </div>
        <div class="sidebar-info-item sidebar-info-item-active">{{$t('alert.alertConfig')}}</div>
      </div>
    </div>
    <div slot="content-right" class="slot-content">
      <div class="main-list main-and-sub-transition" :class="{'main-list-with-sub': showSubList}">
        <div class="top-tools" v-show="mainResizeShow">
          <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': showSubList}">
            <div class="top-tool-search float-right">
              <search-input :searchMsg="searchMsg" @search="search" :inTransform="inTransform"></search-input>
            </div>
            <button id="alert-add" @click="toAdd"  :title="$t('overall.createAlertRule')"
                    class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20">
                        <i class="nz-icon-create-square nz-icon"></i>
            </button>
          </div>
          <div class="pagination-top pagination-top-hide display-none"></div>
        </div>
        <el-table
          class="nz-table"
          :data="tableData"
          border
          v-show="mainResizeShow"
          ref="alertRuleTable"
          tooltip-effect="light"
          :height="mainTableHeight"
          v-scrollBar:el-table="'large'"
          v-loading="loading"
          :cell-class-name="messageStyle"
          style="width: 100%;">
          <el-table-column
            :resizable="false"
            v-for="(item, index) in tablelable"
            v-if="item.show"
            :width="item.width"
            :key="`col-${index}`"
            :label="item.label"
            show-overflow-tooltip
            min-width="110px"

          >
            <template slot-scope="scope" :column="item">
              <div v-if="item.prop == 'option'" class="content-right-options">
                <span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'alert-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>
                <span v-if="scope.row.buildIn != 1" :title="$t('overall.edit')" @click="toEdit(scope.row)" class="content-right-option" :id="'alert-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
                <span :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" :id="'alert-del-'+scope.row.id"><i  class="el-icon-delete"></i></span>
              </div>
              <span v-else-if="item.prop == 'severity'">
                <span v-if="scope.row[item.prop] == 'high'"><i class="el-icon-arrow-up"></i>&nbsp;{{severityData[1].value}}</span>
                <span style="padding-left: 18px;" v-if="scope.row[item.prop] == 'medium'">{{severityData[0].value}}</span>
                <span v-if="scope.row[item.prop] == 'low'"><i class="el-icon-arrow-down"></i>&nbsp;{{severityData[2].value}}</span>
              </span>
              <template v-else-if="item.prop == 'alertNum'">
                <span class="link" @click="queryMessage(scope.row)">{{scope.row.alertNum + ' ' + $t('overall.active')}}</span>
              </template>
              <template v-else-if="item.prop == 'threshold'">
                <span  >{{formatThreshold(scope.row[item.prop],scope.row.unit)}}</span>
              </template>
              <template v-else-if="item.prop == 'receivers'">
                <el-tag effect="dark" v-if="user.userName" :key="index" size="mini" v-for="(user, index) in scope.row[item.prop]" class="alert-rule-tag">{{user.userName}}</el-tag>
              </template>
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
        <div class="pagination-bottom" v-show="!showSubList">
          <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
        </div>
      </div>
      <bottom-box v-if="showSubList" :show-sub-list="showSubList" :subResizeShow="subResizeShow" :obj="alertRuleForMessage" :isFullScreen="isFullScreen" :from="'alertRule'" :targetTab.sync="targetTab" :detail="ruleDetail"
                  @closeSubList="showSubList = false" @fullScreen="fullScreen" @exitFullScreen="exitFullScreen" @listResize="listResize" ></bottom-box>
    </div>
    </left-menu>
    <alert-config-box :parentAlertRule="alertRule" @reload="getTableData" ref="alertConfigBox"></alert-config-box>
    <project-box :project="viewProjectData" ref="projectBox" @reload="getTableData"></project-box>
    <module-box :module="viewModuleData" @reload="getTableData" ref="moduleBox"></module-box>
    <asset-box :edit-unit-show='viewAsset' @refreshData="getTableData" @sendStateData="tabControl"
               ref="assetEditUnit"></asset-box>
    <element-set
      v-if="showElementSet"
      @close="elementsetHide"
      v-clickoutside="elementsetHide"
      :table-title="tableTitle"
      :dropCol="dropCol"
      @tablelable="tablelabelEmit"
      ref="elementset"
    ></element-set>
  </div>

</template>
<script>
  var vm;
  import bus from '../../../libs/bus';
  import chartDataFormat from "../../charts/chartDataFormat";
  export default {
    name: "alert-config",
    data() {
      vm = this;
      return {
        loading: false,
        /*二级列表相关*/
        ruleDetail: {},
        targetTab: '', //展示二级列表中的哪个页签
        showElementSet: false, //控制自定义列的弹框
        inTransform: false, //搜索框相关，搜索条件下拉框是否在transform里
        mainResizeShow: true, //dom高度改变时部分内容是否展示
        subResizeShow: true,
        isFullScreen: false,
        showSubList: false, //是否展示二级列表
        alertRuleForMessage: {}, //传给alertMessage上滑框的对象

        toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
        tableHover: false, //控制滚动条和top按钮同时出现

        tableId: 'alertRuleTable', //需要分页的table的id，用于记录每页数量
        showTopBtn: false,
        mainTableHeight: this.$tableHeight.normal, //主列表table高度
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 1,
            name: 'ID',
            type: 'input',
            label: 'id',
            disabled: false
          }, {
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
          }],
        },
        searchLabel: { //搜索参数

        },

        alertRule: {
          id: '',
          alertName: '',
          type: '',
          linkObject: {id: '', name: ''},
          linkId: '',
          operator:'',
          threshold:'',
          unit:2,
          expr: '',
          last: '',
          severity: '',
          summary: '',
          description: '',
          receivers: '',
        },
        tablelable: [],
        dropCol: [],
        pageObj: {
          pageNo: 1,
          pageSize: 20,
          total: 0
        },
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
        typeData: [
          {
            key: 1,
            value: this.$t('alert.config.typeOption.project')
          },
          {
            key: 2,
            value: this.$t('alert.config.typeOption.module')
          },
          {
            key: 3,
            value: this.$t('alert.config.typeOption.asset')
          }
        ],
        tableTitle: [
          {
            label: 'ID',
            prop: 'id',
            show: true,
            width: 80
          }, {
            label: this.$t("alert.alertName"),
            prop: 'alertName',
            show: true,
            width: 120
          }, {
            label: this.$t("alert.config.expr"),
            prop: 'expr',
            show: true,
          }, /*{
            label: this.$t("alert.list.type"),
            prop: 'type',
            show: true,
          }, {
            label: this.$t("alert.config.link"),
            prop: 'linkObject',
            show: true,
            width: 140
          }, */{
            label: this.$t("alert.config.operator"),
            prop: 'operator',
            show: true,
          }, {
            label: this.$t("alert.config.threshold"),
            prop: 'threshold',
            show: true,
          }, {
            label: this.$t("alert.config.for"),
            prop: 'last',
            show: true,
          }, {
            label: this.$t('alert.severity'),
            prop: 'severity',
            show: true,
          },{
            label: this.$t('alert.summary'),
            prop: 'summary',
            show: true,
          }, {
            label: this.$t('alert.description'),
            prop: 'description',
            show: true,
          }, {
            label: this.$t("alert.message"),
            prop: 'alertNum',
            show: true,
            width: 90
          }, {
            label: this.$t('alert.config.receiver'),
            prop: 'receivers',
            show: true,
          }, {
            label: this.$t('alert.config.option'),
            prop: 'option',
            show: true,
            width: 120
          }
        ],
        tableData: [],
        viewProjectData: {},
        viewModuleData: {},
        viewAsset: false,
      }
    },
    methods: {
      queryMessage(alertRule) {
        this.alertRuleForMessage = alertRule;
        this.showSubList = true;
        this.targetTab = 'alertMessage';
      },
      elementsetShow(s, e) {
        this.showElementSet = true;
        this.$nextTick(() => {
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
        });
      },
      elementsetHide() {
        //悬浮点击空白隐藏
        //this.$refs.elementset.elementsetHide();
        this.showElementSet = false;
      },
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        this.tablelable = data;
        this.dropCol = data;
      },
      toEdit: function (u) {
        this.alertRule = Object.assign({}, u);
        this.$refs.alertConfigBox.show(true, true);
      },
      del: function (u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("alert/rule?ids=" + u.id).then(response => {
            if (response.code === 200) {
              this.$message({type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      formatThreshold:function(value,unit){
        let unitMethod=chartDataFormat.getUnit(unit)
        if(unitMethod&&unit.compute){
          return unitMethod.compute(value,null,2);
        }else{
          return value
        }
      },
      //asset弹框控制
      tabControl(data) {
        if (data === 'close') {
          this.viewAsset = false
          this.$refs['assetEditUnit'].tabView = false
        }
      },
      toAdd: function () {
        this.cleanAlertRule();
        this.$refs.alertConfigBox.show(true, true);
      },
      detail: function (u) {
        this.alertRuleForMessage = Object.assign({}, u);
        this.targetTab = "detail";
        this.showSubList = true;
      },
      messageStyle(e) {
        if (e.column.label == this.$t("alert.message")) {
          if (e.row.alertNum > 0) {
            return 'danger';
          } else {
            return 'success';
          }
        }
        return '';
      },
      getTableData: function () {
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.loading = true;
        this.$get('alert/rule', this.searchLabel).then(response => {
          this.loading = false;
          if (response.code == 200) {
            response.data.list.forEach(item => {
              let temp = [];
              if (item.receiver) {
                temp = item.receiver.split(",").map(t => {
                  return parseInt(t);
                });
              }
              item.receiverShow = temp;
            });
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total;
          }
        })
      },
      cleanAlertRule: function () {
        this.alertRule = {
          id: '',
          alertName: '',
          linkObject: {id: '', name: ''},
          expr: '',
          last: '',
          severity: '',
          summary: '',
          description: '',
        }
      },
      jumpTo(data, id) {
        bus.$emit("menu-change", data);
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getTableData();
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val);
        this.getTableData();
      },
      search: function (searchObj) {
        this.searchLabel = {};
        this.pageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        this.getTableData();
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
      viewAlertType: function (type, typeObj) {
        this.closeViews();
        switch (type) {
          case 1:
            this.viewProjectData = JSON.parse(JSON.stringify(typeObj));
            this.$refs.projectBox.show(true);
            break;
          case 2:
            // this.fillProject(typeObj);
            if (typeObj.param) {
              let tempObj = JSON.parse(typeObj.param);
              this.$set(typeObj, 'paramObj', []);
              for (let k in tempObj) {
                typeObj.paramObj.push({key: k, value: tempObj[k]});
              }
            }
            this.viewModuleData = JSON.parse(JSON.stringify(typeObj));
            this.$refs.moduleBox.show(true);
            break;
          case 3:
            this.viewAsset = true;
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
        this.viewAsset = false;
      },
      convertToDetail(obj) {
        let detail = [];
        detail.push({label: this.$t("alert.alertName"), value: obj.alertName});
        detail.push({label: this.$t("alert.config.expr"), value: obj.expr});
        let type = "";
        for (let i = 0; i < this.typeData.length; i++) {
          if (obj.type == this.typeData[i].key) {
            type = this.typeData[i].value;
            break;
          }
        }
        detail.push({label: this.$t("alert.list.type"), value: type});
        let link = "";
        if (obj.type == 1 || obj.type == 2) {
          link = obj.linkObject.name;
        } else if (obj.type == 3) {
          link = obj.linkObject.host;
        }
        detail.push({label: this.$t("alert.config.link"), value: link});
        detail.push({label: this.$t("alert.config.for"), value: obj.last});
        let severity = this.severityData.filter((item, index) => {
          return obj.severity == item.key;
        })[0].value;
        detail.push({label: this.$t("alert.severity"), value: severity});
        detail.push({label: this.$t("alert.description"), value: obj.description});
        detail.push({label: this.$t("alert.message"), value: obj.alertNum});
        return detail;
      },
    },
    watch: {
      showSubList(n) {
        this.$bottomBoxWindow.showSubListWatch(vm, n);
      },
      alertRuleForMessage: {
        deep: true,
        handler(n) {
          this.ruleDetail = this.convertToDetail(n);
        }
      },
    },
    destroyed() {
      window.onresize = null;
    },
    mounted() {
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageObj.pageSize = pageSize
      }

      this.getTableData();
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.alertRuleTable.$el.querySelector(".el-table__body-wrapper");
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
      this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
    }
  }
</script>
