<style>
  .dc {
    height: 100%;
  }
</style>
<template>
  <div class="dc" >
    <left-menu >
      <div slot="content-left" class="slot-content">
      <div class="sidebar-title">{{$t('overall.config')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('account')" id="prom-jump-account">
          {{$t('config.account.account')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('promServer')" id="account-jump-promserver">
          {{$t('config.promServer.promServerList')}}
        </div>
        <div class="sidebar-info-item sidebar-info-item-active"  id="dc-jump-dc">
          {{$t('config.dc.dc')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('model')" id="dc-jump-model">
          {{$t('config.model.model')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('mib')" id="dc-jump-mib">
          {{$t('config.mib.mib')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('system')" id="dc-jump-system">
          {{$t('config.system.system')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('terminallog')" id="dc-jump-terminallog">
          {{$t('config.terminallog.terminallog')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('operationlog')" id="account-jump-operation">
          {{$t('config.operationlog.operationlog')}}
        </div>
      </div>
    </div>
    <!--dc table start-->
    <div slot="content-right" class="slot-content">
      <div class="main-list" :class="{'main-list-with-sub': bottomBox.showSubList}">
        <div class="main-modal"></div>
        <div class="top-tools" v-show="bottomBox.mainResizeShow">
          <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': bottomBox.showSubList}">
            <div class="top-tool-search">
              <search-input ref="searchInput" :searchMsg="searchMsg" @search="search" :inTransform="bottomBox.inTransform"></search-input>
            </div>
            <button type="button" @click="add" :title="$t('overall.createDatacenter')"
                    class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" id="dc-add">
              <i class="nz-icon-create-square nz-icon"></i>
            </button>
          </div>
          <div class="pagination-top pagination-top-hide display-none"></div>
        </div>
        <el-table
          class="nz-table"
          :data="tableData"
          border
          tooltip-effect="light"
          v-show="bottomBox.mainResizeShow"
          v-scrollBar:el-table="'large'"
          :height="mainTableHeight"
          ref="dcTable"
          v-loading="tools.loading"
          :cell-class-name="assetStatClassName"
          style="width: 100%;"
          @sort-change="tableDataSort">
          <el-table-column
            :resizable="false"
            show-overflow-tooltip
            v-for="(item, index) in tools.tablelable"
            v-if="item.show"
            :width="item.width"
            :key="`col-${index}`"
            :label="item.label"
            :sortable="sortableShow(item.prop)"
            :prop="propTitle(item.prop)"
          >
            <template slot-scope="scope" :column="item">
              <div v-if="item.prop == 'option'" class="content-right-options">
                <!--<span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'dc-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>
                &nbsp;-->
                <span :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option" :id="'dc-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
                &nbsp;
                <span :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" :id="'dc-del-'+scope.row.id"><i class="el-icon-delete"></i></span>
                &nbsp;
                <span :title="$t('config.dc.traffic.title')" @click="configTraffic(scope.row)" class="content-right-option" :id="'dc-setting-'+scope.row.id" ><i class="el-icon-setting"></i></span>
              </div>
              <template v-else-if="item.prop == 'principal'">
                <template v-if="scope.row.principal">
                  <template v-for="item in userData">
                    <template v-if="scope.row.principal == item.userId">{{item.username}}</template>
                  </template>
                </template>
                <template v-else>-</template>
              </template>
              <template v-else-if="item.prop == 'area'">
                <template v-if="scope.row.area">{{scope.row.area.name}}</template>
                <template v-else>-</template>
              </template>
              <template v-else-if="item.prop == 'assetStat' && scope.row.assetStat">
                <el-popover
                  placement="top"
                  trigger="hover"
                  :content="$t('overall.result.total') + '：' + scope.row.assetStat.total + '，' + $t('asset.inStock') + '：' + scope.row.assetStat.inStock + '，' + $t('asset.notInStock') + '：' + scope.row.assetStat.outStock">
                  <div slot="reference" class="dc-asset-states">
                    <span class="dc-asset-state dc-asset-state-total">{{scope.row.assetStat.total}}</span>
                    <span class="dc-asset-state dc-asset-state-in">{{scope.row.assetStat.inStock}}</span>
                    <span class="dc-asset-state dc-asset-state-out">{{scope.row.assetStat.outStock}}</span>
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
        <bottom-box v-if="bottomBox.showSubList" :sub-resize-show="bottomBox.subResizeShow" :obj="bottomBox.dc" :is-full-screen="bottomBox.isFullScreen" :from="'dc'" :target-bab.sync="bottomBox.targetTab" :detail="bottomBox.dcDetail"
                     @closeSubList="bottomBox.showSubList = false" @fullScreen="fullScreen" @exitFullScreen="exitFullScreen" @listResize="listResize" ></bottom-box>
      </transition>
    </div>
    </left-menu>
    <!--dc table end-->
    <element-set
      v-if="tools.showElementSet"
      v-clickoutside="elementsetHide"
      :dropCol="tools.dropCol"
      @tablelable="tablelabelEmit"
      :table-title="tableTitle"
      ref="elementset"
    ></element-set>

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
  export default {
    name: "dc",
    components:{
      'traffic-setting-box': trafficSettingBox,
      'dc-box': dcBox
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
          showElementSet: false, //自定义列弹框是否显示
          showTopBtn: false, //显示To top按钮
          tablelable: [], //从缓存中加载的table header
          dropCol: [], //自定义列工具的数据
        },
        tableId: 'dcTable', //需要分页的table的id，用于记录每页数量
        dc: {},
        blankDc: {
          id: '',
          name: '',
          location: '',
          tel: '',
          principal: '',
          area: {
            id: 0,
            name: ''
          }
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
            label: this.$t('config.dc.area'),
            prop: 'area',
            show: true
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
      }
    },
    methods: {
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
      assetStatClassName(param) {
        if (param.column.label == this.$t("config.dc.assets")) {
          return "asset-state";
        }
        return "";
      },
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        this.tools.tablelable = data;
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
        let detail = [];
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
        return detail;
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
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },
      getTableData() {
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.tools.loading = true;
        this.$get('idc', this.searchLabel).then(response => {
          this.tools.loading = false;
          if (response.code === 200) {
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total
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
        this.getTableData();
      },
      showCabinet(dc) {
        this.bottomBox.targetTab = 'cabinet';
        this.bottomBox.dc = JSON.parse(JSON.stringify(dc));
        this.bottomBox.showSubList = true;
      },
      //是否需要排序
      sortableShow(prop) {
        switch(prop) {
          case 'id':
          case 'name':
          case 'area':
            return'custom';
          default : return false;
        }
      },
      // prop字段
      propTitle(prop){
        switch(prop){
          case 'id': return'i.id';
          case 'name': return'i.name';
          case 'area': return'sa.name';
          default : return prop;
        }
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
      }
    },
    destroyed() {
      window.onresize = null;
    },
    mounted() {
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageObj.pageSize = pageSize;
      }
      this.getTableData();
      this.$nextTick(function(){
        this.getUserData();//绑定滚动条事件，控制top按钮
        let el = this.$refs.dcTable.$el.querySelector(".el-table__body-wrapper");
        if (el._ps_) {
          el.addEventListener("ps-scroll-y", () => {
            if (el._ps_.scrollbarYTop > 100) {
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
          window.onresize = function() {
            el._ps_.update();
          };
        }
      });

      this.tools.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.tools.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
    }
  }
</script>
