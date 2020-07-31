<style scoped>
  .prom {
    height: 100%;
  }
</style>
<template>
  <div class="prom">
    <left-menu >
    <div slot="content-left" class="slot-content">
      <div class="sidebar-title">{{$t('overall.config')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('account')" id="prom-jump-account">
          {{$t('config.account.account')}}
        </div>
        <div class="sidebar-info-item sidebar-info-item-active">{{$t('config.promServer.promServerList')}}</div>
        <div class="sidebar-info-item" @click="jumpTo('dc')" id="prom-jump-dc">
          {{$t('config.dc.dc')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('model')" id="prom-jump-model">
          {{$t('config.model.model')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('mib')" id="prom-jump-mib">
          {{$t('config.mib.mib')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('system')" id="prom-jump-system">
          {{$t('config.system.system')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('terminallog')" id="prom-jump-terminallog">
          {{$t('config.terminallog.terminallog')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('operationlog')" id="account-jump-operation">
          {{$t('config.operationlog.operationlog')}}
        </div>
      </div>
    </div>
    <div slot="content-right"class="slot-content">
      <div class="main-list" :class="{'main-list-with-sub': bottomBox.showSubList}">
        <div class="main-modal"></div>
        <div class="top-tools" v-show="bottomBox.mainResizeShow">
          <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': bottomBox.showSubList}">
            <div class="top-tool-search">
              <search-input ref="searchInput" :searchMsg="searchMsg" @search="search" :inTransform="bottomBox.inTransform"></search-input>
            </div>
            <button type="button" @click="add" :title="$t('overall.createPrometheusServer')"
                    class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" id="prom-add">
              <i class="nz-icon-create-square nz-icon"></i>
            </button>
          </div>
          <div class="pagination-top pagination-top-hide display-none"></div>
        </div>
        <el-table :data="tableData" border v-show="bottomBox.mainResizeShow" :height="mainTableHeight" style="width: 100%;"
                  v-loading="tools.loading" ref="promTable" class="nz-table" v-scrollBar:el-table="'large'"
                  @sort-change="tableDataSort">
          <el-table-column :resizable="false" v-for="(item, index) in tools.tablelable"
                           v-if="item.show"
                           :width="item.width"
                           :key="`col-${index}`"
                           :label="item.label"
                           :sortable="sortableShow(item.prop)"
                           :prop="propTitle(item.prop)"
                           :sort-orders="['ascending', 'descending']">
            <template slot-scope="scope" :column="item">
              <span v-if="item.prop == 'idc'" >{{scope.row[item.prop]?scope.row[item.prop].name:'-'}}</span>

              <span v-else-if="item.prop == 'type'">
                  {{scope.row[item.prop] == '1' ? 'Global' : ''}}
                  {{scope.row[item.prop] == '2' ? 'Per-Datacenter' : ''}}
              </span>
              <span v-else-if="item.prop == 'status'">
                <el-popover placement="right" width="200" trigger="hover" :content="$t('asset.assetStatPre')+(scope.row.checkTime?scope.row.checkTime:$t('asset.assetStatDown'))">
                  <div slot="reference" style="width: 20px">
                    <div :class="{'active-icon green':scope.row[item.prop] == '1','active-icon red':scope.row[item.prop] == '0' || scope.row[item.prop] == '-1' || scope.row[item.prop] == '-2'}"></div>
                  </div>
                </el-popover>
              </span>
              <div v-else-if="item.prop == 'option'" class="content-right-options">
                <span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'prom-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>
                &nbsp;
                <span :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option" :id="'prom-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
                &nbsp;
                <span :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" :id="'prom-del-'+scope.row.id"><i class="el-icon-delete"></i></span>
              </div>
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
              <button v-if="scope.$index == 0" class="to-top" :style="{top: tools.toTopBtnTop}" :class="{'to-top-is-hover': tools.tableHover}" v-show="tools.showTopBtn && bottomBox.mainResizeShow" @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-bottom" v-show="!bottomBox.showSubList">
          <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
        </div>
      </div>
      <transition name="el-zoom-in-bottom">
        <bottom-box v-if="bottomBox.showSubList" :sub-resize-show="bottomBox.subResizeShow" :obj="bottomBox.promServer" :is-full-screen="bottomBox.isFullScreen" :from="'promServer'" :target-tab.sync="bottomBox.targetTab" :detail="bottomBox.promDetail"
                    @closeSubList="bottomBox.showSubList = false" @fullScreen="fullScreen" @exitFullScreen="exitFullScreen" @listResize="listResize" ></bottom-box>
      </transition>
    </div>
    </left-menu>
    <transition name="right-box">
      <prom-server-box v-if="rightBox.show" :prom-server="promServer" @close="closeRightBox"></prom-server-box>
    </transition>
    <element-set
      v-if="tools.showElementSet"
      v-clickoutside="elementsetHide"
      :table-title="tableTitle"
      :dropCol="tools.dropCol"
      @tablelable="tablelabelEmit"
      ref="elementset"
    ></element-set>
  </div>

</template>
<script>
  import bus from '../../../libs/bus';
  import promServerBox from '../../common/rightBox/promServerBox';

  export default {
    name: "promServer",
    components: {
      'prom-server-box': promServerBox
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
          showElementSet: false, //自定义列弹框是否显示
          showTopBtn: false, //显示To top按钮
          tablelable: [], //从缓存中加载的table header
          dropCol: [], //自定义列工具的数据
        },

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
            label: 'DC',
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
      elementsetShow(s, e) {
        this.tools.showElementSet = true;
        var eventfixed = {
          shezhi: 0,
          screen: 0
        };
        eventfixed[s] = 1;
        e.preventDefault();
        this.$store.commit('setHeaderTable', this.tools.tablelable);
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
      },
      elementsetHide() {
        //悬浮点击空白隐藏
        this.$refs.elementset.elementsetHide();
      },
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        this.tools.tablelable = data;
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
            this.pageObj.total = response.data.total
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
        this.getTableData();
      },
      //获取dc数据
      getDcData() {
        return new Promise(resolve => {
          this.$get('idc').then(response => {
            if (response.code === 200) {
              this.dcData = response.data.list;
            }
            resolve();
          });
        });
      },
      //是否需要排序
      sortableShow(prop){
        switch(prop){
          case 'id':
          case 'idc':
          case 'host':
          case 'port':
          case 'type':
            return'custom';
          default : return false;
        }
      },
      // prop字段
      propTitle(prop){
        switch(prop){
          case 'id': return'id';
          case 'idc': return'idc_id';
          case 'host': return'host';
          case 'port': return'port';
          case 'type': return'type';
          default : return prop;
        }
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
    mounted: function () {
      //初始化数据
      Promise.all([this.getDcData()]).then(response => {
        this.getTableData();
      });
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageObj.pageSize = pageSize
      }

      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.promTable.$el.querySelector(".el-table__body-wrapper");
        if (el._ps_) {
          el.addEventListener("ps-scroll-y", () => {
            if (el._ps_.scrollbarYTop > 50) {
              this.bottomBox.showTopBtn = true;
            } else {
              this.bottomBox.showTopBtn = false;
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
      this.tools.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.tools.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
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
      }
    }
  }
</script>
