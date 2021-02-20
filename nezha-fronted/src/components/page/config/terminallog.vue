<style scoped>
  .terminallog {
    height: 100%;
  }
</style>
<template>
  <div class="terminallog">
    <div :class="{'main-list-with-sub': bottomBox.showSubList}" class="main-list">
      <!-- 顶部工具栏 -->
      <div class="main-modal"></div>
      <div class="top-tools" v-show="bottomBox.mainResizeShow">
        <div :class="{'top-tool-main-right-to-left': bottomBox.showSubList}" class="top-tool-main-right">
          <div class="top-tool-search margin-r-5">
            <search-input :searchMsg="searchMsg" @search="search"></search-input>
          </div>
        </div>
        <div class="pagination-top pagination-top-hide display-none"></div>
      </div>
      <!-- 自定义table列 -->
      <transition name="el-zoom-in-top">
        <element-set
          :custom-table-title.sync="tools.customTableTitle"
          :original-table-title="tableTitle"
          @close="tools.showCustomTableTitle = false"
          ref="customTableTitle"
          v-if="tools.showCustomTableTitle"
        ></element-set>
      </transition>
      <el-table
        :cell-class-name="messageStyle"
        :data="tableData"
        :height="$tableHeight.normal"
        @sort-change="tableDataSort"
        border
        class="nz-table"
        ref="terminalLogTable"
        style="width: 100%;"
        v-loading="tools.loading">
        <el-table-column
          :key="`col-${index}`"
          :label="item.label"
          :prop="$tableSet.propTitle(item.prop,'temrminallog')"
          :resizable="true"
          :sort-orders="['ascending', 'descending']"
          :sortable="$tableSet.sortableShow(item.prop,'temrminallog')"
          v-for="(item, index) in tools.customTableTitle"
          v-if="item.show"
        >
          <template :column="item" slot-scope="scope">
            <span v-if="item.prop == 'time'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
            <template v-else-if="item.prop == 'status'">
              <span>{{getStatusText(scope.row.status)}}</span>
            </template>
            <template v-else-if="item.prop == 'remote'">
              <span>{{getRemoteText(scope.row)}}</span>
            </template>
            <template v-else-if="item.prop == 'duration'">
              <span>{{getDuration(scope.row)}}</span>
            </template>
            <template v-else-if="item.prop == 'option'">
              <span :id="'terminalLog-replay-'+scope.row.id" :title="$t('config.terminallog.record.record')" @click="showRecord(scope.row)" class="content-right-option"><i class="nz-icon nz-icon-replay2"></i></span>
              &nbsp;
              <span :id="'terminalLog-log-'+scope.row.id" :title="$t('config.terminallog.log')" @click="showHistoryCMD(scope.row)" class="content-right-option"><i class="nz-icon nz-icon-terminal-log"></i></span>

            </template>
            <span v-else>{{scope.row[item.prop]}}</span>
          </template>
        </el-table-column>
        <el-table-column width="28">
          <template slot="header" slot-scope="scope">
          <span @mousedown.stop="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)" class="nz-table-gear">
            <i class="nz-icon nz-icon-gear"></i>
          </span>
          </template>
        </el-table-column>
      </el-table>
      <button :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}" @click="toTop(scrollbarWrap)" class="to-top" v-show="tools.showTopBtn"><i class="nz-icon nz-icon-top"></i></button>
      <div class="pagination-bottom" v-show="!bottomBox.showSubList">
        <Pagination :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
      </div>
    </div>

    <!-- 底部上滑框 -->
    <transition name="el-zoom-in-bottom">
      <bottom-box :detail="bottomBox.terminalLog" :is-full-screen="bottomBox.isFullScreen" :obj="bottomBox.terminalLog" :sub-resize-show="bottomBox.subResizeShow" :target-tab.sync="bottomBox.targetTab" @closeSubList="bottomBox.showSubList = false" @exitFullScreen="exitFullScreen"
                  @fullScreen="fullScreen" @listResize="listResize" from="terminal" v-if="bottomBox.showSubList" ></bottom-box>
    </transition>
  </div>
</template>
<script>
  import bus from "../../../libs/bus";
  import {terminalLog} from "../../common/js/constants";
  import {calcDurationByStringTime} from "../../common/js/tools";

  export default {
    name: "terminallog",
    data() {
      return {
        tableId: 'terminalLogTable', //需要分页的table的id，用于记录每页数量

        /*二级页面相关*/
        bottomBox: {
          terminalLog: {},
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
        rightBox: { //弹出框相关
          show: false,
          isEdit: false, //false查看，true编辑
          title: ''

        },
        rightBoxResize: { //resize弹出框相关
          show: false,
          isAdd: false, //false，true：resize
          title: ''
        },
        rightBoxDownload: { //下载弹出框相关
          show: false,
          isAdd: false, //false，true：resize
          title: ''
        },
        rightBoxUpload: { //上传弹出框相关
          show: false,
          isAdd: false, //false，true：resize
          title: ''
        },
        pageObj: {
          pageNo: 1,
          pageSize: this.$CONSTANTS.defaultPageSize,
          total: 0
        },
        tableTitle: [
          {
            label: this.$t("config.terminallog.id"),
            prop: 'id',
            show: true,
            width: 80
          }, {
            label: "Session ID",
            prop: 'uuid',
            show: true,
          }, {
            label: "Username",
            prop: 'username',
            show: true,
          },
          {
            label: this.$t('config.terminallog.source'),
            prop: 'remoteAddr',
            show: true,
          },
          {
            label: this.$t('config.terminallog.remote'),
            prop: 'remote',
            show: true,
          },
          {
            label: this.$t('config.terminallog.protocol'),
            prop: 'protocol',
            show: true,
          },
          {
            label: this.$t('config.terminallog.startTime'),
            prop: 'startTime',
            show: true,
          },
          {
            label: this.$t('config.terminallog.duration'),
            prop: 'duration',
            show: true,
          },
          {
            label: 'AuthType',
            prop: 'authType',
            show: false
          },
          {
            label: this.$t('config.terminallog.status'), // killusername鼠标悬停形式
            prop: 'status',
            show: true,
            width: 100
          },
          {
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true,
            width: 120,
            fixed: "right"
          }
        ],
        tableData: [],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [
          //   {
          //   id: 10,
          //   name: this.$t('config.terminallog.protocol'),
          //   type: 'selectType',
          //   label: 'protocol',
          //   disabled: false
          // },
            {
            id: 11,
            name: this.$t('config.terminallog.host'),
            type: 'input',
            label: 'host',
            disabled: false
          },{
            id: 12,
            name: this.$t('config.terminallog.user'),
            type: 'input',
            label: 'user',
            disabled: false
          },{
            id: 14,
            name: this.$t('config.terminallog.userId'),
            type: 'input',
            label: 'userId',
            disabled: false
          }
          ],
        },
        searchLabel: {}, //搜索参数
        scrollbarWrap: null,

      }
    },
    computed: {
      getStatusText() {
        return function(status) {
          return terminalLog.status[status];
        }
      },
      getRemoteText() {
        return function(record) {
          return `${record.loginUser}@${record.host}:${record.port}`;
        }
      },
      getDuration() {
        return function(record) {
          if (record.endTime) {
            return calcDurationByStringTime(record.startTime, record.endTime);
          }
          return "";
        }
      },
    },
    watch: {
      'bottomBox.showSubList': function (n) {
        let vm = this;
        this.$bottomBoxWindow.showSubListWatch(vm, n);
      },
    },
    methods: {
      getTableData() {
        this.$get('terminal/session', this.searchLabel).then(response => {
          this.tools.loading = false;
          if (response.code === 200) {
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total;
            if (!this.scrollbarWrap) {
              this.$nextTick(() => {
                this.scrollbarWrap = this.$refs.terminalLogTable.bodyWrapper;
                this.toTopBtnHandler(this.scrollbarWrap);
              });
            }
          }
        })
      },

      showRecord(record) {
        this.bottomBox.targetTab = 'record';
        this.bottomBox.terminalLog = JSON.parse(JSON.stringify(record));
        this.bottomBox.showSubList = true;
      },
      showHistoryCMD(record) {
        this.bottomBox.targetTab = 'cmd';
        this.bottomBox.terminalLog = JSON.parse(JSON.stringify(record));
        this.bottomBox.showSubList = true;
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
      messageStyle(e) {
        if (e.column.label == this.$t('config.terminallog.status')) {
          if (e.row.status == '0') {
            return 'success';
          } else if (e.row.status == '1') {
            return 'warning';
          } else if (e.row.status == '2') {
            return 'suspended';
          } else if (e.row.status == '3') {
            return 'danger';
          } else if (e.row.status == '4') {
            return 'danger';
          }
        }
        return '';
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
    },
    beforeDestroy() {
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

      this.getTableData();
    },
  }
</script>
