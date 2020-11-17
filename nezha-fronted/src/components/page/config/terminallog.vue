<style scoped>
  .terminallog {
    height: 100%;
  }
</style>
<template>
  <div class="terminallog">
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
      ref="terminalLogTable"
      :height="$tableHeight.normal"
      v-scrollBar:el-table="'large'"
      v-loading="tools.loading"
      :cell-class-name="messageStyle"
      style="width: 100%;"
      @sort-change="tableDataSort">
      <el-table-column
        :resizable="true"
        v-for="(item, index) in tools.customTableTitle"
        v-if="item.show"
        :key="`col-${index}`"
        :label="item.label"
        :sortable="$tableSet.sortableShow(item.prop,'temrminallog')"
        :prop="$tableSet.propTitle(item.prop,'temrminallog')"
        :sort-orders="['ascending', 'descending']"
      >
        <template slot-scope="scope" :column="item">
          <span v-if="item.prop == 'lang'">
                          {{scope.row[item.prop] == 'en' ? 'English' : ''}}
                          {{scope.row[item.prop] == 'zh' ? '中文' : ''}}
                          {{scope.row[item.prop] == 'ru' ? 'русский' : ''}}
                      </span>
          <span v-else-if="item.prop == 'time'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
          <template v-else-if="item.prop == 'status'">
            <span>{{scope.row.status==='1' ? $t("config.terminallog.success") : $t("config.terminallog.fail")}}</span>
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
    name: "terminallog",
    data() {
      return {
        tableId: 'terminalLogTable', //需要分页的table的id，用于记录每页数量

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
        terminallog: {
          id: '',
          host: '',
          status: '1',
          time: '',
          protocol: '',
          port: '',
          user: '',
          cmd: '',
          authType: '',
          userName: ''
        },
        pageObj: {
          pageNo: 1,
          pageSize: 50,
          total: 0
        },
        tableTitle: [
          {
            label: this.$t("config.terminallog.id"),
            prop: 'id',
            show: true,
            width: 80
          }, {
            label: this.$t('config.terminallog.host'),
            prop: 'host',
            show: true,
          }, {
            label: this.$t('config.terminallog.port'),
            prop: 'port',
            show: true,
          },
          {
            label: this.$t('config.terminallog.protocol'),
            prop: 'protocol',
            show: true,
          },
          {
            label: this.$t('config.terminallog.user'),
            prop: 'user',
            show: true,
          },
          {
            label: 'AuthType',
            prop: 'authType',
            show: false
          },
          {
            label: this.$t('config.terminallog.cmd'),
            prop: 'cmd',
            show: true,
          },
          {
            label: 'UserName',
            prop: 'userName',
            show: false,
          },
          {
            label: this.$t('config.terminallog.time'),
            prop: 'time',
            show: true
          },
          {
            label: this.$t('config.terminallog.status'),
            prop: 'status',
            show: true,
            width: 100
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
            id: 13,
            name: this.$t('config.terminallog.cmd'),
            type: 'input',
            label: 'cmd',
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
      }
    },
    methods: {
      getTableData: function () {
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.tools.loading = true;
        this.$get('terminal/log', this.searchLabel).then(response => {
          this.tools.loading = false;
          if (response.code === 200) {
            for (let i = 0; i < response.data.list.length; i++) {
              response.data.list[i].status = response.data.list[i].status + "";
            }
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total
          }
        })
      },
      messageStyle(e) {
        if (e.column.label == this.$t('config.terminallog.status')) {
          if (e.row.status == '1') {
            return 'success';
          } else {
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
    watch:{
    },
    mounted() {
      //初始化表头
      this.tools.customTableTitle = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.tableTitleReset(this.tableTitle,this.tools.customTableTitle);
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize && pageSize != 'undefined') {
        this.pageObj.pageSize = pageSize
      }

      this.getTableData();
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.terminalLogTable.$el.querySelector(".el-table__body-wrapper");
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
