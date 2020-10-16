<style scoped>
  .operationlog {
    height: 100%;
  }
</style>
<template>
  <div class="operationlog">
    <div class="top-tools">
      <div></div>
      <div>
        <div class="top-tool-search float-right">
          <search-input :searchMsg="searchMsg" @search="search"></search-input>
        </div>
      </div>
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
      ref="operationLogTable"
      :height="$tableHeight.normal"
      v-loading="tools.loading"
      v-scrollBar:el-table="'large'"
      :cell-class-name="messageStyle"
      style="width: 100%;"
      @sort-change="tableDataSort"
    >
      <el-table-column
        :resizable="false"
        v-for="(item, index) in tools.customTableTitle"
        v-if="item.show"
        :width="item.width"
        :key="`col-${index}`"
        :label="item.label"
        :sortable="$tableSet.sortableShow(item.prop,'operationlog')"
        :prop="$tableSet.propTitle(item.prop,'operationlog')"
        :sort-orders="['ascending', 'descending']"
      >
        <template slot-scope="scope" :column="item">
          <span v-if="item.prop == 'time'">
            {{scope.row[item.prop]}} ms
          </span>
          <span v-else-if="item.prop == 'createDate'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
          <span v-else>{{scope.row[item.prop]}}</span>
        </template>
      </el-table-column>
      <el-table-column width="28">
        <template slot="header" slot-scope="scope">
          <span @mousedown.stop="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)" class="nz-table-gear">
            <i class="nz-icon nz-icon-gear"></i>
          </span>
        </template>
        <template v-slot="scope">
          <button v-if="scope.$index == 0" class="to-top" :style="{top: tools.toTopBtnTop}" :class="{'to-top-is-hover': tools.tableHover}" v-show="tools.showTopBtn" @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
  </div>
</template>
<script>
  import bus from '../../../libs/bus';
  export default {
    name: "oparetionlog",
    data() {
      return {
        tableId: 'operationLogTable', //需要分页的table的id，用于记录每页数量

        rightBox: { //弹出框相关
          show: false,
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
        /*工具参数*/
        tools: {
          loading: false, //是否显示table加载动画
          toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
          tableHover: false, //控制滚动条和top按钮同时出现
          showTopBtn: false, //显示To top按钮
          showCustomTableTitle: false, //自定义列弹框是否显示
          customTableTitle: [], //自定义列工具的数据
        },
        pageObj: {
          pageNo: 1,
          pageSize: 50,
          total: 0
        },
        tableTitle: [
          {
            label: this.$t("config.operationlog.id"),
            prop: 'id',
            show: true,
            width: 80
          }, {
            label: this.$t('config.operationlog.username'),
            prop: 'username',
            show: true,
          },
          {
            label: this.$t('config.operationlog.ip'),
            prop: 'ip',
            show: true,
          },
          {
            label: this.$t('config.operationlog.operation'),
            prop: 'operation',
            show: true,
          },
          {
            label: this.$t('config.operationlog.type'),
            prop: 'type',
            show: true,
          },
          {
            label: this.$t('config.operationlog.state'),
            prop: 'state',
            show: true,
          },
          // {
          //   label: this.$t('config.operationlog.userId'),
          //   prop: 'userId',
          //   show: false,
          // },
          {
            label: this.$t('config.operationlog.operaId'),
            prop: 'operaId',
            show: false,
          },
          {
            label: this.$t('config.operationlog.createDate'),
            prop: 'createDate',
            show: true,
          },
          {
            label: this.$t('config.operationlog.time'),
            prop: 'time',
            show: false,
          },
          {
            label: this.$t('config.operationlog.params'),
            prop: 'params',
            show: false,
          },
          {
            label: this.$t('config.operationlog.response'),
            prop: 'response',
            show: false,
          },
        ],
        tableData: [],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [
            {
            id: 11,
            name: this.$t('config.operationlog.type'),
            type: 'input',
            label: 'type',
            disabled: false
          },{
            id: 12,
            name: this.$t('config.operationlog.username'),
            type: 'input',
            label: 'username',
            disabled: false
          },{
            id: 13,
            name: this.$t('config.operationlog.operation'),
            type: 'selectString',
            label: 'operation',
            disabled: false
          }
          ],
        },
        searchLabel: {}, //搜索参数
      }
    },
    methods: {
      messageStyle(e) {
        if (e.column.label == this.$t('config.operationlog.state')) {
          if (e.row.state == 'success') {
            return 'success';
          } else {
            return 'danger';
          }
        }
        return '';
      },
      getTableData: function () {
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.tools.loading = true;
        this.$get('sys/log/list', this.searchLabel).then(response => {
          this.tools.loading = false;
          if (response.code === 200) {
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total
          }
        })
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
        let orderBy = '';
        if(this.searchLabel.orderBy){
          orderBy = this.searchLabel.orderBy
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
    computed: {
      isCurrentUser() {
        return function(username) {
          return localStorage.getItem('nz-username') == username;
        }
      }
    },
    mounted() {
      //初始化表头
      this.tools.customTableTitle = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize && pageSize != 'undefined') {
        this.pageObj.pageSize = pageSize
      }

      this.getTableData();
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.operationLogTable.$el.querySelector(".el-table__body-wrapper");
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
