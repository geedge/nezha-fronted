<style scoped>
  .model {
    height: 100%;
  }
</style>
<template>
  <div class="model">
    <div class="main-list" :class="{'main-list-with-sub': bottomBox.showSubList}">
      <div class="main-modal"></div>
      <div class="top-tools" v-show="bottomBox.mainResizeShow">
        <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left-small': bottomBox.showSubList}">
          <div class="top-tool-search">
            <search-input :searchMsg="searchMsg" @search="search" :bottomBox.inTransform="bottomBox.inTransform"></search-input>
          </div>
          <button :title="$t('overall.createModel')" @click="add" class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" id="model-add" v-has="'model_toAdd'">
            <i class="nz-icon-create-square nz-icon"></i>
          </button>
          <delete-button :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true" api="model" v-has="'model_delete'" id="model-list-batch-delete"></delete-button>
        </div>
        <div class="pagination-top pagination-top-hide display-none"></div>
      </div>
      <!-- 自定义table列 -->
      <transition name="el-zoom-in-top">
        <element-set
          id="model-list"
          v-if="tools.showCustomTableTitle"
          @close="tools.showCustomTableTitle = false"
          :custom-table-title.sync="tools.customTableTitle"
          :original-table-title="tableTitle"
          ref="customTableTitle"
        ></element-set>
      </transition>
      <el-table :data="tableData"
                id="model-list-table"
                border style="width: 100%;"
                ref="modelTable"
                class="nz-table"
                v-loading="tools.loading"
                :cell-class-name="assetStatClassName"
                v-show="bottomBox.mainResizeShow"
                :height="mainTableHeight"
                @sort-change="tableDataSort"
                @row-dblclick="panel"
                @selection-change="(selection)=>{this.batchDeleteObjs=selection}"
      >
        <el-table-column
          :resizable="false"
          type="selection"
          width="40"
          align="center">
        </el-table-column>
        <el-table-column :resizable="true"
                         v-for="(item, index) in tools.customTableTitle"
                         v-if="item.show"
                         :key="`col-${index}`"
                         :label="item.label"
                         :sortable="$tableSet.sortableShow(item.prop,'model')"
                         :prop="$tableSet.propTitle(item.prop,'model')"
                         :sort-orders="['ascending', 'descending']">
          <template slot-scope="scope" :column="item">
            <template v-if="item.prop == 'vendor'" >{{scope.row[item.prop].value}}</template>
            <template v-else-if="item.prop == 'type'" >{{scope.row[item.prop].value}}</template>
            <template v-else-if="item.prop == 'assetStat' && scope.row.assetStat" >
              <el-popover
                placement="top"
                trigger="hover"
                :content="$t('overall.result.total') + '：' + scope.row.assetStat.total + '，' + $t('asset.inStock') + '：' + scope.row.assetStat.inStock + '，' + $t('asset.notInStock') + '：' + scope.row.assetStat.outStock + '，' + $t('asset.suspended') + '：' + scope.row.assetStat.suspended">
                  <div slot="reference" class="dc-asset-states">
                    <span class="dc-asset-state dc-asset-state-total">{{scope.row.assetStat.total}}</span>
                    <span class="dc-asset-state dc-asset-state-in">{{scope.row.assetStat.inStock}}</span>
                    <span class="dc-asset-state dc-asset-state-out">{{scope.row.assetStat.outStock}}</span>
                    <span class="dc-asset-state dc-asset-state-suspended">{{scope.row.assetStat.suspended}}</span>
                  </div>
                </el-popover>
            </template>
            <div v-else-if="item.prop == 'option'" class="content-right-options">
              <span :id="'model-panel-'+scope.row.id" :title="$t('dashboard.panel.title')" @click="panel(scope.row)" class="content-right-option" v-has="'model_chart_view'"><i class="nz-icon nz-icon-template"></i></span>
              <span :id="'model-edit-'+scope.row.id" :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option" v-has="'model_toEdit'"><i class="nz-icon nz-icon-edit"></i></span>
              <span :id="'model-del-'+scope.row.id" :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" v-has="'model_delete'"><i class="nz-icon nz-icon-delete"></i></span>
            </div>
            <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
            <template v-else>-</template>
          </template>
        </el-table-column>
        <el-table-column :resizable="false" width="28">
          <template slot="header" slot-scope="scope">
            <span @mousedown.stop="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)" class="nz-table-gear">
              <i class="nz-icon nz-icon-gear"></i>
            </span>
          </template>
        </el-table-column>
      </el-table>
      <button :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}" @click="toTop(scrollbarWrap)" class="to-top" v-show="tools.showTopBtn" id="model-list-totop"><i class="nz-icon nz-icon-top"></i></button>
      <div class="pagination-bottom" v-show="!bottomBox.showSubList">
        <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
      </div>
    </div>
    <transition name="el-zoom-in-bottom">
      <bottom-box :from="$CONSTANTS.fromRoute.model" :is-fullscreen="bottomBox.isFullScreen" :obj="bottomBox.model" :sub-resize-show="bottomBox.subResizeShow" :target-tab.sync="bottomBox.targetTab" v-if="bottomBox.showSubList"
                  @closeSubList="bottomBox.showSubList = false" @fullScreen="fullScreen" @exitFullScreen="exitFullScreen" @listResize="listResize" ref="panelBox"></bottom-box>
    </transition>
    <transition name="right-box">
      <model-box v-if="rightBox.show" ref="modelBox" :model="model" @close="closeRightBox" @reload="getTableData"></model-box>
    </transition>
  </div>

</template>
<script>
  import bus from '../../../libs/bus';
  import deleteButton from "../../common/deleteButton";
  export default {
    name: "model",
    components: {
      'delete-button':deleteButton,
    },
    data() {
      return {
        /*二级页面相关*/
        bottomBox: {
          modelDetail: {}, //asset详情
          model: {}, //告警信息对应的asset对象
          mainResizeShow: true, //dom高度改变时是否展示|隐藏
          subResizeShow: true,
          isFullScreen: false, //全屏状态
          showSubList: false, //是否显示二级列表
          targetTab: '', //显示二级列表中的哪个页签
          inTransform: false, //搜索框相关，搜索条件下拉框是否在transform里
        },
        mainTableHeight: this.$tableHeight.normal, //主列表table高度
        /*工具参数*/
        tools: {
          loading: false, //是否显示table加载动画
          toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
          tableHover: false, //控制滚动条和top按钮同时出现
          showTopBtn: false, //显示To top按钮
          showCustomTableTitle: false, //自定义列弹框是否显示
          customTableTitle: [], //自定义列工具的数据
        },
        batchDeleteObjs:[],
        tableId: 'modelTable', //需要分页的table的id，用于记录每页数量

        rightBox: {show: false},

        model: {},
        blankModel: {
          id: '',
          name: '',
          vendor: {id: '', value: '', code: '', type: ''},
          type: {id: '', value: '', code: '', type: ''},
          assetStat: {total: '', inStock: '', outStock: ''},
          remark: '',
          vendorCode: '',
          typeCode: '',
          uSize:1,
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
            label: this.$t('overall.name'),
            prop: 'name',
            show: true,
          }, {
            label: this.$t('overall.type'),
            prop: 'type',
            show: true,
          }, {
            label: this.$t('config.model.vendor'),
            prop: 'vendor',
            show: true,
          }, {
            label: this.$t("config.model.assets"),
            prop: 'assetStat',
            show: true,
          }, {
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true,
            width: 120
          }
        ],
        tableData: [],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 1,
            name: 'ID',
            type: 'input',
            label: 'id',
            disabled: false
          }, {
            id: 5,
            name: this.$t('config.promServer.dataCenter'),
            type: 'dc',
            label: 'dc',
            disabled: false
          }],
        },
        searchLabel: {}, //搜索参数
        scrollbarWrap: null,
        delFlag:false,
      }
    },
    methods: {
      assetStatClassName(param) {
        if (param.column.label == this.$t("config.model.assets")) {
          return "asset-state";
        }
        return "";
      },
      panel(obj) {
        if (!this.hasButton('model_chart_view')) {
          return;
        }
        this.bottomBox.showSubList = true;
        this.bottomBox.model = obj;
        this.bottomBox.targetTab = "panel";
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
      edit(u) {
        this.model = Object.assign({}, u);
        this.rightBox.show = true;
      },
      del(u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("model?ids=" + u.id).then(response => {
            if (response.code === 200) {
              this.delFlag=true;
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      add() {
        this.model = this.newModel();
        this.rightBox.show = true;
      },
      newModel() {
        return JSON.parse(JSON.stringify(this.blankModel));
      },
      closeRightBox(refresh) {
        this.rightBox.show = false;
        if (refresh) {
          this.delFlag=true;
          this.getTableData();
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
      getTableData() {
        if (!this.hasButton('model_view')) {
          this.$message.error(this.$t("tip.noAccess"));
          return;
        }
        this.tableData = [];
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.$set(this.searchLabel, "stat", 1);
        this.tools.loading = true;
        this.$get('model', this.searchLabel).then(response => {
          this.tools.loading = false;
          if (response.code === 200) {
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total;
            if (!this.scrollbarWrap) {
              this.$nextTick(() => {
                this.scrollbarWrap = this.$refs.modelTable.bodyWrapper;
                this.toTopBtnHandler(this.scrollbarWrap);
              });
            }
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
      search(searchObj) {
        let orderBy = '';
        if(this.searchLabel.orderBy) {
          orderBy = this.searchLabel.orderBy
        }
        this.pageObj.pageNo = 1;
        this.searchLabel = {};
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        if(orderBy) {
          this.$set(this.searchLabel, 'orderBy', orderBy);
        }
        if(this.$refs.modelTable&&this.$refs.modelTable.bodyWrapper){
          this.$refs.modelTable.bodyWrapper.scrollTop = 0;
        }
        this.getTableData();
      },
      // 数据排序
      tableDataSort(item) {
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
            this.$refs.modelTable.bodyWrapper.scrollTop = 0
          }else{
            this.delFlag=false;
          }
        }
      }
    },
    beforeDestroy() {
      if(this.scrollbarWrap){
        this.scrollbarWrap.removeEventListener('scroll', bus.debounce);
      };
    }
  }
</script>
`
