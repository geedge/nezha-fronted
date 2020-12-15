<style>
  .dc {
    height: 100%;
  }
</style>
<template>
  <div class="dc" >
    <!--dc table start-->
    <div class="main-list" :class="{'main-list-with-sub': bottomBox.showSubList}">
      <div class="main-modal"></div>
      <div class="top-tools" v-show="bottomBox.mainResizeShow">
        <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left-small': bottomBox.showSubList}">
          <div class="top-tool-search">
            <search-input ref="searchInput" :searchMsg="searchMsg" @search="search" :inTransform="bottomBox.inTransform"></search-input>
          </div>
          <button :title="$t('overall.createDatacenter')" @click="add" type="button" v-has="'dc_toAdd'"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" id="dc-add">
            <i class="nz-icon-create-square nz-icon"></i>
          </button>
          <delete-button :delete-objs="batchDeleteObjs" @after="getTableData" api="idc" v-has="'dc_delete'"></delete-button>
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
        tooltip-effect="light"
        v-show="bottomBox.mainResizeShow"
        :height="mainTableHeight"
        ref="dcTable"
        v-loading="tools.loading"
        :cell-class-name="assetStatClassName"
        style="width: 100%;"
        @sort-change="tableDataSort"
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
          show-overflow-tooltip
          v-for="(item, index) in tools.customTableTitle"
          v-if="item.show"
          :key="`col-${index}`"
          :label="item.label"
          :sortable="sortableShow(item.prop,'dc')"
          :prop="$tableSet.propTitle(item.prop,'dc')"
        >
          <template slot-scope="scope" :column="item">
            <div v-if="item.prop == 'option'" class="content-right-options">
              <span :id="'dc-edit-'+scope.row.id" :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option" v-has="'dc_toEdit'"><i class="nz-icon nz-icon-edit"></i></span>
              &nbsp;
              <span :id="'dc-setting-'+scope.row.id" :title="$t('config.dc.traffic.title')" @click="configTraffic(scope.row)" class="content-right-option" v-has="'dc_trafficSetting'" ><i class="nz-icon nz-icon-gear"></i></span>
              &nbsp;
              <span :id="'dc-del-'+scope.row.id" :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" v-has="'dc_delete'"><i class="nz-icon nz-icon-delete"></i></span>
            </div>
            <template v-else-if="item.prop == 'principal'">
              <template v-if="scope.row.principal">
                <template v-for="item in userData">
                  <template v-if="scope.row.principal == item.userId">{{item.username}}</template>
                </template>
              </template>
              <template v-else>-</template>
            </template>
            <template v-else-if="item.prop == 'state'">
              <el-switch
                v-model="scope.row.state"
                active-value="ON"
                inactive-value="OFF"
                :disabled="!hasButton('dc_toEdit') || !hasButton('dc_save')"
                active-color="#ee9d3f"
                @change="(val)=>{statusChange(scope.row)}"
              />
            </template>
            <template v-else-if="item.prop == 'longitude'">
              <template v-if="regNumTest(scope.row.longitude)">{{scope.row.longitude}}</template>
              <template v-else>-</template>
            </template>
            <template v-else-if="item.prop == 'latitude'">
              <template v-if="regNumTest(scope.row.latitude)">{{scope.row.latitude}}</template>
              <template v-else>-</template>
            </template>
            <template v-else-if="item.prop == 'assetStat' && scope.row.assetStat">
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

            </template >
            <template v-else-if="item.prop == 'cabinetNum'">
              <span class="link" @click="showCabinet(scope.row)">{{scope.row[item.prop]}}</span>
            </template>
            <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
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
      <bottom-box :detail="bottomBox.dcDetail" :from="$CONSTANTS.fromRoute.dc" :is-full-screen="bottomBox.isFullScreen" :obj="bottomBox.dc" :sub-resize-show="bottomBox.subResizeShow" :target-tab.sync="bottomBox.targetTab" v-if="bottomBox.showSubList"
                  @closeSubList="bottomBox.showSubList = false" @fullScreen="fullScreen" @exitFullScreen="exitFullScreen" @listResize="listResize" ></bottom-box>
    </transition>
    <!--dc table end-->
    <transition name="right-box">
      <dc-box @close="closeDcBox" :dc="dc" :user-data="userData" @reload="getTableData" v-if="rightBox.dc.show"></dc-box>
    </transition>
    <transition name="right-box">
      <traffic-setting-box @close="closeTrafficBox" :dc="dc" ref="trafficBox" v-if="rightBox.trafficSetting.show"></traffic-setting-box>
    </transition>
  </div>
</template>
<script>
  import bus from '../../../libs/bus';
  import dcBox from "../../common/rightBox/dcBox"; //dc弹框
  import trafficSettingBox from "../../common/rightBox/trafficSetting/trafficSettingBox";
  import deleteButton from "../../common/deleteButton";
  var  regNum = /^[0-9]+.?[0-9]*/;
  export default {
    name: "dc",
    components:{
      'traffic-setting-box': trafficSettingBox,
      'dc-box': dcBox,
      'delete-button':deleteButton,
    },
    data() {
      return {
        /*二级页面相关*/
        bottomBox: {
          dcDetail: {},
          dc: {},
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
        tableId: 'dcTable', //需要分页的table的id，用于记录每页数量
        dc: {},
        blankDc: {
          id: '',
          name: '',
          location: '',
          tel: '',
          principal: '',
          // area: {
          //   id: 0,
          //   name: ''
          // }
          state:'ON',
          longitude:undefined,
          latitude:undefined,
        },
        rightBox: {
          dc: {show: false},
          trafficSetting: {show: false}
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
            label: this.$t("overall.name"),
            prop: 'name',
            show: true,
          }, {
            label: this.$t("asset.location"),
            prop: 'location',
            show: true,
          }, {
            label: this.$t("config.dc.cabinetNum"),
            prop: 'cabinetNum',
            show: true,
          }, {
            label: this.$t("config.dc.assets"),
            prop: 'assetStat',
            show: true,
          }, {
            label: this.$t('asset.tel'),
            prop: 'tel',
            show: true,
          }, {
            label: this.$t('asset.principal'),
            prop: 'principal',
            show: true
          }, {
            label: this.$t('config.dc.longitude'),
            prop: 'longitude',
            show: false
          }, {
            label: this.$t('config.dc.latitude'),
            prop: 'latitude',
            show: false
          }, {
            label: this.$t('config.dc.state'),
            prop: 'state',
            show: true
          }, {
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true,
            width: 120
          }
        ],
        tableData: [],
        userData: [],
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
        tabShow: 1, // 控制显示一级页面和二级页面 1 dc 2cabinet
        scrollbarWrap: null,
      }
    },
    methods: {
      assetStatClassName(param) {
        if (param.column.label == this.$t("config.dc.assets")) {
          return "asset-state";
        }
        return "";
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
      edit(u) {
        this.dc = JSON.parse(JSON.stringify(u));
        if(!regNum.test(this.dc.longitude)){
          this.dc.longitude=undefined
        }
        if(!regNum.test(this.dc.latitude)){
          this.dc.latitude=undefined
        }
        if (!this.dc.area) {
          this.$set(this.dc, 'area', {id: '', name: ''});
        }
        this.rightBox.dc.show = true;
      },
      configTraffic(u) {
        this.dc = JSON.parse(JSON.stringify(u));
        this.rightBox.trafficSetting.show = true;
      },
      detail(u) {
        this.bottomBox.dc = JSON.parse(JSON.stringify(u));
        if (!this.bottomBox.dc.area) {
          this.$set(this.bottomBox.dc, 'area', {id: '', name: ''});
        }
        this.bottomBox.targetTab = "detail";
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
      convertToDetail(obj) {
        let detail = JSON.parse(JSON.stringify(obj));
        return detail;
        /*let detail = [];
        detail.push({label: this.$t("overall.name"), value: obj.name});
        detail.push({label: this.$t("config.dc.area"), value: obj.area.name});
        detail.push({label: this.$t("asset.location"), value: obj.location});
        detail.push({label: this.$t("config.dc.cabinetNum"), value: obj.cabinetNum});
        let assets = this.$t('overall.result.total') + ' ' + obj.assetStat.total + '，' + this.$t('asset.inStock') + ' ' + obj.assetStat.inStock + '，' + this.$t('asset.notInStock') + ' ' + obj.assetStat.outStock;
        detail.push({label: this.$t("config.dc.assets"), value: assets});
        detail.push({label: this.$t("asset.tel"), value: obj.tel});
        let principal = '';
        for (let i = 0; i < this.userData.length; i++) {
          if (this.userData[i].userId == obj.principal) {
            principal = this.userData[i].username;
            break;
          }
        }
        detail.push({label: this.$t("asset.principal"), value: principal});
        return detail;*/
      },
      add() {
        this.dc = this.newDc();
        this.rightBox.dc.show = true;
      },
      newDc() {
        return JSON.parse(JSON.stringify(this.blankDc));
      },
      closeDcBox(refresh) {
        this.rightBox.dc.show = false;
        if (refresh) {
          this.getTableData();
          bus.$emit("dc-list-change");
        }
      },
      closeTrafficBox(refresh) {
        this.rightBox.trafficSetting.show = false;
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
          this.$delete("idc?ids=" + u.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();
              bus.$emit("dc-list-change");
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },
      statusChange(idc) {
        this.$put('idc', idc).then(response => {
          if (response.code === 200) {
            this.rightBox.show = false;
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
          } else {
            this.$message.error(response.msg);
          }
          this.getTableData();
        });
      },
      getTableData() {
        if (!this.hasButton('dc_view')) {
          this.$message.error(this.$t("tip.noAccess"));
          return;
        }
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.tools.loading = true;
        this.$get('idc', this.searchLabel).then(response => {
          this.tools.loading = false;
          if (response.code === 200) {
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total;
            if (!this.scrollbarWrap) {
              this.$nextTick(() => {
                this.scrollbarWrap = this.$refs.dcTable.bodyWrapper;
                this.toTopBtnHandler(this.scrollbarWrap);
              });
            }
          }
        })
      },
      getUserData() {
        return new Promise(resolve => {
          this.$get('sys/user/list', {pageSize: -1, pageNo: 1}).then(response => {
            if (response.code === 200) {
              this.userData = response.data.list;
            }
            resolve();
          });
        });
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getTableData();
      },
      pageSize(val) {
        localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val);
        this.pageObj.pageSize = val;
        this.getTableData();
      },
      search(searchObj) {
        let orderBy = '';
        if(this.searchLabel.orderBy) {
          orderBy = this.searchLabel.orderBy;
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
        if(this.$refs.dcTable&&this.$refs.dcTable.bodyWrapper){
          this.$refs.dcTable.bodyWrapper.scrollTop = 0;
        }
        this.getTableData();
      },
      showCabinet(dc) {
        this.bottomBox.targetTab = 'cabinet';
        this.bottomBox.dc = JSON.parse(JSON.stringify(dc));
        this.bottomBox.showSubList = true;
      },
      sortableShow(label,form){
        if(label==='state'){
          return false
        }
        return this.$tableSet.sortableShow(label,form)
      },
      // 数据排序
      tableDataSort(item){
        let orderBy = '';
        if(item.order === 'ascending'){
          orderBy = item.prop;
        }
        if(item.order === 'descending'){
          orderBy = '-' + item.prop;
        }
        this.$set(this.searchLabel, "orderBy", orderBy);
        this.getTableData();
      },
      regNumTest(val){//校验是否是数字
        return regNum.test(val)
      },
      initEvent() {
        bus.$on("dc-list-change", () => {
          this.getTableData();
        });
      },
    },
    watch: {
      'bottomBox.dc': {
        deep: true,
        handler(n) {
          if (n.id) {
            this.bottomBox.dcDetail = this.convertToDetail(n);
          }
        }
      },
      'bottomBox.showSubList': function(n) {
        let vm = this;
        this.$bottomBoxWindow.showSubListWatch(vm, n);
      },
    },
    beforeDestroy(){
      bus.$off("dc-list-change");
      this.scrollbarWrap.removeEventListener('scroll', bus.debounce);
    },
    created(){
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageObj.pageSize = pageSize
      }
    },
    destroyed() {

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
<style scoped>
  /deep/ td .nz-icon-gear:before{
    color: #606266;
  }
</style>
