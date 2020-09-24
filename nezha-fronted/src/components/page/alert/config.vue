<style scoped>
  .config {
    height: 100%;
  }
</style>
<template>
  <div class="config">
    <div class="main-list" :class="{'main-list-with-sub': bottomBox.showSubList}">
      <div class="main-modal"></div>
      <div class="top-tools" v-show="bottomBox.mainResizeShow">
        <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': bottomBox.showSubList}">
          <div class="top-tool-search float-right">
            <search-input :searchMsg="searchMsg" @search="search" :inTransform="bottomBox.inTransform"></search-input>
          </div>
          <export-excel
            export-file-name="AlertRule"
            export-url="/alert/rule/export"
            import-url="/alert/rule/import"
            :params="searchLabel"
            @afterImport="getTableData"
            class="margin-l-20"
          >
            <template slot="optionZone">
              <button id="alert-add" @click="add"  :title="$t('overall.createAlertRule')"
                      class="nz-btn nz-btn-size-normal nz-btn-style-light">
                <i class="nz-icon-create-square nz-icon"></i>
              </button>
            </template>
          </export-excel>
        </div>
        <div class="pagination-top pagination-top-hide display-none"></div>
      </div>
      <!-- 自定义table列 -->
      <transition name="el-zoom-in-top">
        <element-set
          v-if="tools.showCustomTableTitle"
          @close="tools.showCustomTableTitle = false"
          :custom-table-title.sync="tools.customTableTitle"
          :original-table-title="tableTitle"
          ref="customTableTitle"
        ></element-set>
      </transition>
      <el-table
        class="nz-table"
        :data="tableData"
        border
        v-show="bottomBox.mainResizeShow"
        ref="alertRuleTable"
        tooltip-effect="light"
        :height="mainTableHeight"
        v-scrollBar:el-table="'large'"
        v-loading="tools.loading"
        :cell-class-name="messageStyle"
        style="width: 100%;"
        @sort-change="tableDataSort"
        @row-dblclick="detail"
      >
        <el-table-column
          :resizable="false"
          v-for="(item, index) in tools.customTableTitle"
          v-if="item.show"
          :width="item.width"
          :key="`col-${index}`"
          :label="item.label"
          show-overflow-tooltip
          min-width="110px"
          :sort-orders="['ascending', 'descending']"
          :sortable="$tableSet.sortableShow(item.prop,'alertRules')"
          :prop="$tableSet.propTitle(item.prop,'alertRules')"
        >
          <template slot-scope="scope" :column="item">
            <div v-if="item.prop == 'option'" class="content-right-options">
              <span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'alert-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>&nbsp;
              <span v-if="scope.row.buildIn != 1" :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option" :id="'alert-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>&nbsp;
              <span :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" :id="'alert-del-'+scope.row.id"><i  class="nz-icon nz-icon-delete"></i></span>
            </div>
            <span v-else-if="item.prop == 'severity'">
            <span v-if="scope.row[item.prop] == 'high'"><i class="nz-icon nz-icon-arrow-up"></i>&nbsp;{{$CONSTANTS.alertMessage.severityData.find(s => {return s.value == 'high'}).label}}</span>
            <span style="padding-left: 18px;" v-if="scope.row[item.prop] == 'medium'">{{$CONSTANTS.alertMessage.severityData.find(s => {return s.value == 'medium'}).label}}</span>
            <span v-if="scope.row[item.prop] == 'low'"><i class="nz-icon nz-icon-arrow-down"></i>&nbsp;{{$CONSTANTS.alertMessage.severityData.find(s => {return s.value == 'low'}).label}}</span>
          </span>
            <template v-else-if="item.prop == 'alertNum'">
              <span class="link" @click="queryMessage(scope.row)">{{scope.row.alertNum + ' ' + $t('overall.active')}}</span>
            </template>
            <template v-else-if="item.prop == 'threshold'">
              <span  >{{formatThreshold(scope.row[item.prop],scope.row.unit)}}</span>
            </template>
            <template v-else-if="item.prop == 'receivers'">
              <el-tag effect="dark" v-if="user.userName" :key="index" size="mini" v-for="(user, index) in scope.row[item.prop]" class="alert-rule-tag">{{user.userName}}&nbsp;</el-tag>
            </template>
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
            <button v-if="scope.$index == 0" class="to-top" :style="{top: tools.toTopBtnTop}" :class="{'to-top-is-hover': tools.tableHover}" v-show="tools.showTopBtn && bottomBox.mainResizeShow" @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-bottom" v-show="!bottomBox.showSubList">
        <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
      </div>
    </div>
    <transition name="el-zoom-in-bottom">
      <bottom-box v-if="bottomBox.showSubList" :sub-resize-show="bottomBox.subResizeShow" :obj="bottomBox.alertRule" :is-full-screen="bottomBox.isFullScreen" :from="'alertRule'" :target-tab.sync="bottomBox.targetTab" :detail="bottomBox.ruleDetail"
                  @closeSubList="bottomBox.showSubList = false" @fullScreen="fullScreen" @exitFullScreen="exitFullScreen" @listResize="listResize" ></bottom-box>
    </transition>
    <transition name="right-box">
      <alert-config-box v-if="rightBox.show" :alert-rule="alertRule" @close="closeRightBox" ref="alertConfigBox"></alert-config-box>
    </transition>
  </div>

</template>
<script>
  import bus from '../../../libs/bus';
  import exportXLSX from "../../common/exportXLSX";
  import chartDataFormat from "../../charts/chartDataFormat";
  export default {
    name: "alert-config",
    components: {
      'export-excel': exportXLSX,
    },
    data() {
      return {
        //侧滑
        rightBox: {
          show: false,
        },
        /*二级页面相关*/
        bottomBox: {
          ruleDetail: {},
          alertRule: {},
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
        mainTableHeight: this.$tableHeight.normal, //主列表table高度

        tableId: 'alertRuleTable', //需要分页的table的id，用于记录每页数量
        alertRule: {},
        blankAlertRule: {
          id: '',
          alertName: '',
          linkObject: {id: '', name: ''},
          expr: '',
          unit:2,
          operator: '>',
          last: 60,
          severity: 'medium',
          summary: '',
          description: '',
        },
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
            prop: 'alertName',
            show: true,
            // width: 120
          }, {
            label: this.$t("alert.config.expr"),
            prop: 'expr',
            show: true,
          }, {
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
        this.bottomBox.alertRule = alertRule;
        this.bottomBox.showSubList = true;
        this.bottomBox.targetTab = 'alertMessage';
      },
      edit(u) {
        this.alertRule = JSON.parse(JSON.stringify(u));
        this.rightBox.show = true;
      },
      closeRightBox(refresh) {
        this.rightBox.show = false;
        if (refresh) {
          this.getTableData();
        }
      },
      del(u) {
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
      formatThreshold(value,unit) {
        let unitMethod = chartDataFormat.getUnit(unit);
        if (unitMethod&&value) {
          return unitMethod.compute(value, null, 2);
        } else {
          return value
        }
      },
      add() {
        this.alertRule = this.newAlertRule();
        this.rightBox.show = true;
      },
      newAlertRule() {
        return JSON.parse(JSON.stringify(this.blankAlertRule));
      },
      detail(u) {
        this.bottomBox.alertRule = JSON.parse(JSON.stringify(u));
        this.bottomBox.targetTab = "panel";
        this.bottomBox.showSubList = true;
      },
      messageStyle(e) {
        if (e.column.label == 'Message' || e.column.label == this.$t('alert.message')) {
          if (e.row.alertNum > 0) {
            return 'danger';
          } else {
            return 'success';
          }
        }
        return '';
      },
      getTableData() {
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.tools.loading = true;
        this.$get('alert/rule', this.searchLabel).then(response => {
          this.tools.loading = false;
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
      search(searchObj) {
        let orderBy='';
        if(this.searchLabel.orderBy){
          orderBy=this.searchLabel.orderBy
        }
        this.searchLabel = {};
        this.pageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        if(orderBy){
          this.$set(this.searchLabel, 'orderBy', orderBy);
        }
        this.getTableData();
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
      viewAlertType(type, typeObj) {
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
        let detail = {
          id: obj.id,
          alertName: obj.alertName,
          expr: obj.expr
        };
        let type = "";
        for (let i = 0; i < this.$CONSTANTS.alertMessage.typeData.length; i++) {
          if (obj.type == this.$CONSTANTS.alertMessage.typeData[i].value) {
            type = this.$CONSTANTS.alertMessage.typeData[i].label;
            break;
          }
        }
        detail.type = type;
        let link = "";
        if (obj.type == 1 || obj.type == 2) {
          link = obj.linkObject.name;
        } else if (obj.type == 3) {
          link = obj.linkObject.host;
        }
        detail.link = link;
        detail.last = obj.last;
        let severity = this.$CONSTANTS.alertMessage.severityData.find(s => {return s.value == obj.severity});
        detail.severity = severity;
        detail.alertNum = obj.alertNum;
        detail.description = obj.description;
        return detail;
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
        this.$set(this.searchLabel, "orderBy", orderBy);
        this.getTableData();
      },
      initEvent() {
        bus.$on("alert-rule-list-change", () => {
          this.getTableData();
        });
        bus.$on("dc-list-change", () => {
          this.getTableData();
        });
      }
    },
    watch: {
      'bottomBox.showSubList': function(n) {
        let vm = this;
        this.$bottomBoxWindow.showSubListWatch(vm, n);
      },
      'bottomBox.alertRule': {
        deep: true,
        handler(n) {
          this.bottomBox.ruleDetail = this.convertToDetail(n);
        }
      },
    },
    destroyed() {
      window.onresize = null;
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
      this.initEvent();

      this.getTableData();
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.alertRuleTable.$el.querySelector(".el-table__body-wrapper");
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
    }
  }
</script>
