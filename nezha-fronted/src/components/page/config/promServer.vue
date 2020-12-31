<style scoped>
  .prom {
    height: 100%;
  }
</style>
<template>
  <div class="prom">
    <div class="main-list" :class="{'main-list-with-sub': bottomBox.showSubList}">
      <div class="main-modal"></div>
      <div class="top-tools" v-show="bottomBox.mainResizeShow">
        <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': bottomBox.showSubList}">
          <div class="top-tool-search">
            <search-input ref="searchInput" :searchMsg="searchMsg" @search="search" :inTransform="bottomBox.inTransform"></search-input>
          </div>
          <button :title="$t('overall.createPrometheusServer')" @click="add" type="button" v-has="'prom_toAdd'"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" id="prom-add">
            <i class="nz-icon-create-square nz-icon"></i>
          </button>
          <delete-button :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true" api="promServer" v-has="'prom_delete'"></delete-button>
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
      <el-table :data="tableData" border v-show="bottomBox.mainResizeShow" :height="mainTableHeight" style="width: 100%;"
                @sort-change="tableDataSort" class="nz-table" ref="promTable" v-loading="tools.loading"
                @selection-change="(selection)=>{this.batchDeleteObjs=selection}"
      >
        <el-table-column
          :resizable="false"
          type="selection"
          width="40"
          align="center">
        </el-table-column>
        <el-table-column :resizable="true" v-for="(item, index) in tools.customTableTitle"
                         v-if="item.show"
                         :key="`col-${index}`"
                         :label="item.label"
                         :sortable="$tableSet.sortableShow(item.prop,'promServer')"
                         :prop="$tableSet.propTitle(item.prop,'promServer')"
                         :sort-orders="['ascending', 'descending']">
          <template slot-scope="scope" :column="item">
            <span v-if="item.prop == 'idc'" >{{scope.row[item.prop]?scope.row[item.prop].name:'-'}}</span>

            <span v-else-if="item.prop == 'type'">
                <!--{{scope.row[item.prop] == '1' ? 'Global' : ''}}
                {{scope.row[item.prop] == '2' ? 'Per-Datacenter' : ''}}-->
              {{findServerType(scope.row[item.prop]).text}}
            </span>
            <span v-else-if="item.prop == 'checkTime'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
            <span v-else-if="item.prop == 'status'">
              <el-popover placement="right" width="200" trigger="hover" :content="$t('asset.assetStatPre')+(scope.row.checkTime?utcTimeToTimezoneStr(scope.row.checkTime):$t('asset.assetStatDown'))">
                <div slot="reference" style="width: 20px">
                  <div :class="{'active-icon green':scope.row[item.prop] == '1','active-icon red':scope.row[item.prop] == '0' || scope.row[item.prop] == '-1' || scope.row[item.prop] == '-2'}"></div>
                </div>
              </el-popover>
            </span>
            <div v-else-if="item.prop == 'option'" class="content-right-options">
              <!--<span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'prom-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>
              &nbsp;-->
              <span :id="'prom-edit-'+scope.row.id" :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option" v-has="'prom_toEdit'"><i class="nz-icon nz-icon-edit"></i></span>
              &nbsp;
              <span :id="'prom-del-'+scope.row.id" :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" v-has="'prom_delete'"><i class="nz-icon nz-icon-delete"></i></span>
            </div>
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
      <bottom-box v-if="bottomBox.showSubList" :sub-resize-show="bottomBox.subResizeShow" :obj="bottomBox.promServer" :is-full-screen="bottomBox.isFullScreen" :from="'promServer'" :target-tab.sync="bottomBox.targetTab" :detail="bottomBox.promDetail"
                  @closeSubList="bottomBox.showSubList = false" @fullScreen="fullScreen" @exitFullScreen="exitFullScreen" @listResize="listResize" ></bottom-box>
    </transition>
    <transition name="right-box">
      <prom-server-box v-if="rightBox.show" :prom-server="promServer" @close="closeRightBox"></prom-server-box>
    </transition>
  </div>

</template>
<script>
  import bus from '../../../libs/bus';
  import promServerBox from '../../common/rightBox/promServerBox';
  import deleteButton from "../../common/deleteButton";
  export default {
    name: "promServer",
    components: {
      'prom-server-box': promServerBox,
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
          promDetail: {},
          promServer: {},
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
        tableId: 'promTable', //需要分页的table的id，用于记录每页数量
        promServer: {},
        blankPromServer: {
          id: '',
          host: '',
          port: 9090,
          idc: {id: '', name: '', location: ''}
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
            label: this.$t("config.dc.dc"),
            prop: 'idc',
            show: true,
          }, {
            label: 'Host',
            prop: 'host',
            show: true,
          }, {
            label: 'Port',
            prop: 'port',
            show: true,
          }, {
            label: this.$t("config.promServer.type"),
            prop: 'type',
            show: true,
          }, {
            label: this.$t('asset.state'),
            prop: 'status',
            show: true
          }, {
            label: this.$t('config.promServer.checkTime'),
            prop: 'checkTime',
            show: false
          }, {
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true,
            width: 120
          }
        ],
        tableData: [],
        dcData: [],
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
            name: 'DC',
            type: 'dc',
            label: 'dc',
            disabled: false
          }, {
            id: 6,
            name: this.$t('config.promServer.type'),
            type: 'select',
            label: 'promType',
            disabled: false
          }, {
            id: 8,
            name: this.$t('project.endpoint.host'),
            type: 'input',
            label: 'host',
            disabled: false
          }, {
            id: 9,
            name: this.$t('project.endpoint.port'),
            type: 'input',
            label: 'port',
            disabled: false
          }],
        },
        searchLabel: {}, //搜索参数
        promServerType:null,
        scrollbarWrap: null,
        delFlag:false,
      }
    },
    methods: {
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
        let detail = [];
        detail.push({label: this.$t("config.dc.dc"), value: obj.idc.name});
        detail.push({label: "Host", value: obj.host});
        detail.push({label: "Port", value: obj.port});
        let type = "";
        for (let i = 0; i < this.$CONSTANTS.promServer.typeData.length; i++) {
          if (obj.value == this.$CONSTANTS.promServer.typeData[i].type) {
            type = this.$CONSTANTS.promServer.typeData[i].label;
            break;
          }
        }
        detail.push({label: this.$t('config.promServer.type'), value: type});
        detail.push({
          label: this.$t('asset.state'),
          value: obj.status,
          type: 'status',
          msg: this.$t('asset.assetStatPre')+(obj.checkTime ? obj.checkTime : this.$t('asset.assetStatDown'))
        });
        return detail;
      },
      edit(u) {
        this.promServer = JSON.parse(JSON.stringify(u));
        this.rightBox.show = true;
      },
      /*删除*/
      del(u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("promServer?ids=" + u.id).then(response => {
            if (response.code === 200) {
              this.delFlag=true;
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },
      detail(u) {
        this.bottomBox.promServer = JSON.parse(JSON.stringify(u));
        this.bottomBox.targetTab = "detail";
        this.bottomBox.showSubList = true;
      },
      add() {
        this.promServer = this.newPromServer();
        this.rightBox.show = true;
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
        if (!this.hasButton('prom_view')) {
          this.$message.error(this.$t("tip.noAccess"));
          return;
        }
        this.tableData = [];
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.loading = true;
        this.$get('promServer', this.searchLabel).then(response => {
          this.loading = false;
          if (response.code === 200) {
            for (let i = 0; i < response.data.list.length; i++) {
              for (let j = 0; j < this.dcData.length; j++) {
                if (response.data.list[i].idcId == this.dcData[j].id) {
                  response.data.list[i].idc = this.dcData[j];
                  break;
                }
              }
            }
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total;
            if (!this.scrollbarWrap) {
              this.$nextTick(() => {
                this.scrollbarWrap = this.$refs.promTable.bodyWrapper;
                this.toTopBtnHandler(this.scrollbarWrap);
              });
            }
          }
        })
      },
      newPromServer() {
        return JSON.parse(JSON.stringify(this.blankPromServer));
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
        this.pageObj.pageNo = 1;
        this.searchLabel = {};
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        if(orderBy){
          this.$set(this.searchLabel, 'orderBy', orderBy);
        }
        if(this.$refs.promTable&&this.$refs.promTable.bodyWrapper){
          this.$refs.promTable.bodyWrapper.scrollTop = 0;
        }
        this.getTableData();
      },
      //获取dc数据
      getDcData() {
        return new Promise(resolve => {
          this.$get('idc', {pageSize: -1}).then(response => {
            if (response.code === 200) {
              this.dcData = response.data.list;
            }
            resolve();
          });
        });
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
      findServerType(type){
        if(!this.promServerType){
          this.promServerType=[];
          this.$CONSTANTS.promServer.theData.forEach(item=>{
            this.promServerType=this.promServerType.concat(item.children)
          })
        }
        return this.promServerType.find(item=>{
          return item.value == type
        })
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
      //初始化数据
      Promise.all([this.getDcData()]).then(response => {
        this.getTableData();
      });
      //初始化表头
      this.tools.customTableTitle = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.tableTitleReset(this.tableTitle,this.tools.customTableTitle);
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageObj.pageSize = pageSize
      }
    },
    beforeDestroy() {
      this.scrollbarWrap.removeEventListener('scroll', bus.debounce);
    },

    watch: {
      'bottomBox.promServer': {
        deep: true,
        handler(n) {
          this.bottomBox.promDetail = this.convertToDetail(n);
        }
      },
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
            this.$refs.promTable.bodyWrapper.scrollTop = 0
          }else{
            this.delFlag=false;
          }
        }
      }
    },
  }
</script>
