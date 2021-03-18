<style scoped>
  .asset-state {
    height: 100%;
  }
</style>
<template>
  <div class="asset-state">
    <!-- 主页面 -->
    <div :class="{'main-list-with-sub': bottomBox.showSubList}" class="main-list">
      <!-- 顶部工具栏 -->
      <div class="main-modal"></div>
      <div class="top-tools" v-show="bottomBox.mainResizeShow">
        <div :class="{'top-tool-main-right-to-left': bottomBox.showSubList}" class="top-tool-main-right">
          <div class="top-tool-search">
            <search-input :inTransform="bottomBox.inTransform" :searchMsg="searchMsg" @search="search" ref="searchInput"></search-input>
          </div>
          <button :title="$t('overall.createassetState')" @click="add" class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" id="assetState-add"
                  type="button" v-has="'assetState_toAdd'">
            <i class="nz-icon-create-square nz-icon"></i>
          </button>
          <delete-button :delete-objs="batchDeleteObjs" :filter-function="(arr)=>{return '?ids='+arr.map(t=>t.id).join(',')}" @after="getTableData" @before="delFlag=true" api="/asset/stateConf" id="asset-state-list-batch-delete" v-has="'assetState_delete'"></delete-button>
        </div>
        <!-- 顶部分页组件，当打开底部上滑框时出现 -->
        <div class="pagination-top pagination-top-hide display-none"></div>
      </div>
      <!-- 自定义table列 -->
      <transition name="el-zoom-in-top">
        <element-set
          :custom-table-title.sync="tools.customTableTitle"
          :original-table-title="tableTitle"
          @close="tools.showCustomTableTitle = false"
          id="assetStateList"
          ref="customTableTitle"
          v-if="tools.showCustomTableTitle"
        ></element-set>
      </transition>
      <el-table
        :data="tableData"
        :height="mainTableHeight"
        :id="tableId"
        @selection-change="(selection)=>{this.batchDeleteObjs=selection}"
        @sort-change="tableDataSort"
        border
        class="nz-table"
        ref="assetStateTable"
        style="width: 100%;"
        v-loading="tools.loading"
        v-show="bottomBox.mainResizeShow"
      >
        <el-table-column
          :resizable="false"
          align="center"
          type="selection"
          width="40">
        </el-table-column>
        <el-table-column
          :fixed="item.fixed"
          :key="`col-${index}`"
          :label="item.label"
          :prop="item.prop"
          :resizable="true"
          :sort-orders="['ascending', 'descending']"
          v-for="(item, index) in tools.customTableTitle"
          v-if="item.show"
        >
          <template :column="item" slot-scope="scope">
            <el-switch
              :active-value="1"
              :disabled="!hasButton('assetState_toEdit')"
              :inactive-value="0"
              @change="(val)=>{statusChange(scope.row)}"
              active-color="#ee9d3f"
              v-if="item.prop == 'ping'"
              v-model="scope.row.ping">
            </el-switch>
            <el-switch
              :active-value="1"
              :disabled="!hasButton('assetState_toEdit')"
              :inactive-value="0"
              @change="(val)=>{statusChange(scope.row)}"
              active-color="#ee9d3f"
              v-else-if="item.prop == 'monitor'"
              v-model="scope.row.monitor">
            </el-switch>
            <el-switch
              :active-value="1"
              :disabled="!hasButton('assetState_toEdit')"
              :inactive-value="0"
              @change="(val)=>{statusChange(scope.row)}"
              active-color="#ee9d3f"
              v-else-if="item.prop == 'alert'"
              v-model="scope.row.alert">
            </el-switch>
            <div class="content-right-options" v-if="item.prop == 'option'">
              <span :id="'assetState-edit-'+scope.row.id" :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option" v-has="'assetState_toEdit'"><i class="nz-icon nz-icon-edit"></i></span>
              &nbsp;
              <span :id="'assetState-del-'+scope.row.id" :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" v-has="'assetState_delete'"><i class="nz-icon nz-icon-delete"></i></span>
            </div>
            <span v-else>{{scope.row[item.prop]}}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" width="28">
          <template :resizable="false" slot="header" slot-scope="scope">
            <span @mousedown.stop="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)" class="nz-table-gear">
              <i class="nz-icon nz-icon-gear"></i>
            </span>
          </template>
        </el-table-column>
      </el-table>
      <button :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}" @click="toTop(scrollbarWrap)" class="to-top" id="assetState-list-totop" v-show="tools.showTopBtn && bottomBox.mainResizeShow"><i class="nz-icon nz-icon-top"></i></button>
      <div class="pagination-bottom" v-show="!bottomBox.showSubList">
        <Pagination :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
      </div>
    </div>

    <transition name="right-box">
      <asset-state-box :asset-state="assetState" :asset-state-data="assetStateData" @close="closeRightBox" v-if="rightBox.show"></asset-state-box>
    </transition>
  </div>
</template>
<script>
  import deleteButton from "../../common/deleteButton";
  import assetStateBox from "../../common/rightBox/assetStateBox";
  import bus from "../../../libs/bus";

  export default {
    name: "asset-state-list",
    components: {
      'delete-button': deleteButton,
      'asset-state-box': assetStateBox,
    },
    data() {
      return {
        //侧滑
        rightBox: {
          show: false,
        },
        /*二级页面相关*/
        bottomBox: {
          assetStateDetail: {},
          assetState: {},
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
        assetState: {},
        assetStateData: [],

        tableId: 'assetStateTable', //需要分页的table的id，用于记录每页数量
        blankAssetState: { //空白对象
          id: "", name: "", ping: 0, monitor: 0, alert: 0, remark: "",
        },
        pageObj: { //分页对象
          pageNo: 1,
          pageSize: this.$CONSTANTS.defaultPageSize,
          total: 0
        },
        tableTitle: [ //原table列
          {
            label: 'ID',
            prop: 'id',
            show: true,
            width: 80
          }, {
            label: this.$t("overall.name"),
            prop: 'name',
            show: true,
          }, {
            label: "Ping",
            prop: 'ping',
            show: true,
          }, {
            label: this.$t("config.assetState.monitor"),
            prop: 'monitor',
            show: true,
          }, {
            label: this.$t("config.assetState.alert"),
            prop: 'alert',
            show: true,
          }, {
            label: this.$t("config.assetState.assetTotal"),
            prop: 'assetTotal',
            show: true,
          }, {
            label: this.$t('overall.remark'),
            prop: 'remark',
            show: true,
          }, {
            label: this.$t('overall.option'),
            prop: 'option',
            show: true,
            width: 120,
            fixed: "right"
          }
        ],
        tableData: [],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 10,
            name: this.$t('overall.name'),
            type: 'input',
            label: 'name',
            disabled: false
          }],
        },
        searchLabel: {}, //搜索参数
        scrollbarWrap: null,
        delFlag: false,
      }
    },
    methods: {
      // 全屏
      /*fullScreen() {
        let vm = this;
        this.$bottomBoxWindow.fullScreen(vm);
      },*/
      // 退出全屏
      /*exitFullScreen() {
        let vm = this;
        this.$bottomBoxWindow.exitFullScreen(vm);
      },*/
      // 鼠标拖动二级列表
      /*listResize(e) {
        let vm = this;
        this.$bottomBoxWindow.listResize(vm, e);
      },*/
      closeRightBox(refresh) {
        this.rightBox.show = false;
        if (refresh) {
          this.delFlag = true;
          this.getTableData();
        }
      },
      edit(u) {
        this.assetState = JSON.parse(JSON.stringify(u));
        this.rightBox.show = true;
      },
      /*detail(u) {
        this.bottomBox.assetState = JSON.parse(JSON.stringify(u));
        this.bottomBox.targetTab = "detail";
        this.bottomBox.showSubList = true;
      },*/
      del(u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("/asset/stateConf?ids=" + u.id).then(response => {
            if (response.code === 200) {
              this.delFlag=true;
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      statusChange(obj) {
        this.$nextTick(() => {
          this.$put('/asset/stateConf', obj).then(response => {
            if (response.code === 200) {
              this.rightBox.show = false;
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
            } else {
              this.$message.error(response.msg);
            }
            this.getTableData();
          });
        });
      },
      getTableData() {
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        if (!this.scrollbarWrap) {
          this.$nextTick(() => {
            this.scrollbarWrap = this.$refs.assetStateTable.bodyWrapper;
            this.toTopBtnHandler(this.scrollbarWrap);
          });
        }
        this.tools.loading = true;
        this.$get('/asset/stateConf', this.searchLabel).then(response => {
          this.tools.loading = false;
          if (response.code === 200) {
            for (let i = 0; i < response.data.list.length; i++) {
              response.data.list[i].status = response.data.list[i].status + "";
            }
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total;
            if (!this.scrollbarWrap) {
              this.$nextTick(() => {
                this.scrollbarWrap = this.$refs.assetStateTable.bodyWrapper;
                this.toTopBtnHandler(this.scrollbarWrap);
              });
            }
          }
        })
      },
      add() {
        this.assetState = this.newAssetState();
        this.rightBox.show = true;
      },
      esc() {
        this.rightBox.show = false;
      },
      newAssetState() {
        return JSON.parse(JSON.stringify(this.blankAssetState));
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
        this.searchLabel = {};
        this.pageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        if(this.$refs.assetStateTable){
          this.$refs.assetStateTable.bodyWrapper.scrollTop = 0;
        }
        this.getTableData();
      },
      // 数据排序
      tableDataSort(item){
        let orderBy = '';
        if(item.order === 'ascending') {
          orderBy = item.prop;
        }
        if(item.order === 'descending') {
          orderBy = '-' + item.prop;
        }
        this.$set(this.searchLabel, "orderBy", orderBy);
        this.getTableData();
      },
    },
    beforeDestroy() {
      if(this.scrollbarWrap){
        this.scrollbarWrap.removeEventListener('scroll', bus.debounce);
      }
    },
    watch: {
      'bottomBox.showSubList': function(n) {
        let vm = this;
        this.$bottomBoxWindow.showSubListWatch(vm, n);
      },
      tableData: {
        deep: true,
        handler(n) {
          if (n.length === 0 && this.pageObj.pageNo > 1) {
            this.pageNo(this.pageObj.pageNo-1);
          }

          if(!this.delFlag){ // 不是删除时回到顶部
            this.$refs.assetStateTable.bodyWrapper.scrollTop = 0
          }else{
            this.delFlag=false;
          }
        }
      }
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
