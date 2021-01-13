<style scoped>
  .config {
    height: 100%;
  }
  .severity .P1{
    background: #F5846A;
    border-radius: 2px;
    font-size: 12px;
    color: #FFFFFF;
    padding: 2px 6px;
  }
  .severity .P2{
    background: #F7A54A;
    border-radius: 2px;
    font-size: 12px;
    color: #FFFFFF;
    padding: 2px 6px;
  }
  .severity .P3{
    background: #F1C13D;
    border-radius: 2px;
    font-size: 12px;
    color: #FFFFFF;
    padding: 2px 6px;
  }
</style>
<template>
  <div class="config">
    <div class="main-list" :class="{'main-list-with-sub': bottomBox.showSubList}">
      <div class="main-modal"></div>
      <div class="top-tools" v-show="bottomBox.mainResizeShow">
        <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': bottomBox.showSubList}">
          <div class="top-tool-search float-right margin-r-20">
            <search-input :searchMsg="searchMsg" @search="search" :inTransform="bottomBox.inTransform"></search-input>
          </div>
          <export-excel
            export-file-name="AlertRule"
            export-url="/alert/rule/export"
            import-url="/alert/rule/import"
            :params="searchLabel"
            :permissions="{import: 'rule_import', export: 'rule_export'}"
            @afterImport="getTableData"
          >
            <template slot="optionZone">
              <button :title="$t('overall.createAlertRule')" @click="add" id="alert-add" v-has="'rule_toAdd'"
                      class="nz-btn nz-btn-size-normal nz-btn-style-light">
                <i class="nz-icon-create-square nz-icon"></i>
              </button>
            </template>
          </export-excel>
          <delete-button :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true" api="alert/rule" v-has="'rule_delete'"></delete-button>
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
        v-loading="tools.loading"
        :cell-class-name="messageStyle"
        style="width: 100%;"
        @sort-change="tableDataSort"
        @row-dblclick="detail"
        @selection-change="(selection)=>{this.batchDeleteObjs=selection}"
      >
        <el-table-column
          :resizable="false"
          type="selection"
          width="40"
          align="center">
        </el-table-column>
        <el-table-column
          :resizable="true"
          v-for="(item, index) in tools.customTableTitle"
          v-if="item.show"
          :key="`col-${index}`"
          :label="item.label"
          show-overflow-tooltip
          :sort-orders="['ascending', 'descending']"
          :sortable="$tableSet.sortableShow(item.prop,'alertRules')"
          :prop="$tableSet.propTitle(item.prop,'alertRules')"
        >
          <template slot-scope="scope" :column="item">
            <div v-if="item.prop == 'option'" class="content-right-options">
              <span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'alert-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>&nbsp;
              <span :id="'alert-edit-'+scope.row.id" :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option" v-has="'rule_toEdit'" v-if="scope.row.buildIn != 1"><i class="nz-icon nz-icon-edit"></i></span>&nbsp;
              <span :id="'alert-del-'+scope.row.id" :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" v-has="'rule_delete'"><i  class="nz-icon nz-icon-delete"></i></span>
            </div>
            <span v-else-if="item.prop == 'severity'" class="severity">
              <span v-if="scope.row[item.prop] == 'P1'" class="P1">P1</span>
                <!--<i class="nz-icon nz-icon-arrow-up"></i> {{returnSeverityLabel(scope.row[item.prop])}}-->
              <span v-if="scope.row[item.prop] == 'P2'" class="P2">P2</span>
                <!--{{returnSeverityLabel(scope.row[item.prop])}}-->
              <span v-if="scope.row[item.prop] == 'P3'" class="P3">P3</span>
                <!--<i class="nz-icon nz-icon-arrow-down"></i>&nbsp;{{returnSeverityLabel(scope.row[item.prop])}}-->
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
        </el-table-column>
      </el-table>
      <button :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}" @click="toTop(scrollbarWrap)" class="to-top" v-show="tools.showTopBtn && bottomBox.mainResizeShow"><i class="nz-icon nz-icon-top"></i></button>
      <div class="pagination-bottom" v-show="!bottomBox.showSubList">
        <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
      </div>
    </div>
    <transition name="el-zoom-in-bottom">
      <bottom-box :detail="bottomBox.ruleDetail" :from="$CONSTANTS.fromRoute.rule" :is-full-screen="bottomBox.isFullScreen" :obj="bottomBox.alertRule" :sub-resize-show="bottomBox.subResizeShow" :target-tab.sync="bottomBox.targetTab" v-if="bottomBox.showSubList"
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
  import deleteButton from "../../common/deleteButton";
  export default {
    name: "alert-config",
    components: {
      'export-excel': exportXLSX,
      'delete-button':deleteButton,
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
        batchDeleteObjs:[],
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
          severity: 'P2',
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
          },  {
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
          pageSize: this.$CONSTANTS.defaultPageSize,
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
        searchTime: bus.getTimezontDateRange(),
        scrollbarWrap: null,
        delFlag:false,
      }
    },
    methods: {
      queryMessage(alertRule) {
        if (!this.hasButton('rule_alerts_view')) {
          return;
        }
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
          this.delFlag=true;
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
              this.delFlag=true;
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
        if (!this.hasButton('rule_view')) {
          this.$message.error(this.$t("tip.noAccess"));
          return;
        }
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
            if (!this.scrollbarWrap) {
              this.$nextTick(() => {
                this.scrollbarWrap = this.$refs.alertRuleTable.bodyWrapper;
                this.toTopBtnHandler(this.scrollbarWrap);
              });
            }
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
        if(this.$refs.alertRuleTable && this.$refs.alertRuleTable.bodyWrapper){
          this.$refs.alertRuleTable.bodyWrapper.scrollTop = 0;
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
        bus.$on('alert-message-change',()=>{
          this.getTableData();
        })
      },
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
      tableData: {
        deep: true,
        handler(n) {
          if (n.length === 0 && this.pageObj.pageNo > 1) {
            this.pageNo(this.pageObj.pageNo-1);
          }
          if(!this.delFlag){ // 不是删除时回到顶部
            this.$refs.alertRuleTable.bodyWrapper.scrollTop = 0
          }else{
            this.delFlag=false;
          }
        }
      }
    },
    beforeDestroy() {
      bus.$off("alert-rule-list-change");
      bus.$off("dc-list-change");
      bus.$off('alert-message-change');
      if(this.scrollbarWrap){
        this.scrollbarWrap.removeEventListener('scroll', bus.debounce);
      };
    },
    created(){
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageObj.pageSize = pageSize
      }
    },
    mounted() {
      //初始化表头
      this.tools.customTableTitle = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.tableTitleReset(this.tableTitle,this.tools.customTableTitle);
      this.initEvent();

      this.getTableData();
    },
  }
</script>
