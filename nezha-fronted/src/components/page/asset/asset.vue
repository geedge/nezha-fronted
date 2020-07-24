<template>
  <div class="asset" ref="asset">
    <left-menu >
      <div slot="content-left" class="slot-content">
        <div class="sidebar-title">{{$t('asset.asset')}}</div>
        <div class="sidebar-info" style="height: 90%">
          <el-scrollbar ref="leftScrollbar" style="height: 100%">
            <el-collapse v-model="activeType" class="left-menu-bg">
              <el-collapse-item name="dataCenter" :title="$t('asset.left.dataCenter')">
                <el-checkbox-group v-model="dcCheckList" size="small" @change="changeCheckBox">
                  <el-checkbox class="sidebar-info-item" :class="{'sidebar-info-item-active': indOf(dcCheckList, item.id)}"
                               v-for="(item,key) in dcData" :key="key" :label=item.id>
                    <div class="sidebar-info-item-txt">
                      <el-popover v-if="item.name.length > 14" trigger="hover" placement="top-start" :content="item.name" >
                        <span slot="reference">{{item.name}}</span>
                      </el-popover>
                      <span v-else>{{item.name}}</span>
                    </div>
                    <el-tooltip :content="''+item.total" placement="top" effect="light" :disabled="item.total<99">
                      <el-badge class="mark" :value="item.total" :max="99"/>
                    </el-tooltip>
                  </el-checkbox>
                </el-checkbox-group>
              </el-collapse-item>
              <el-collapse-item name="assetType" :title="$t('asset.assetType')">
                <el-checkbox-group v-model="assetTypeCheckList" size="small" @change="changeAssetTypeCheckBox">
                  <el-checkbox class="sidebar-info-item" :class="{'sidebar-info-item-active': indOf(assetTypeCheckList, item.id)}" v-for="(item, key) in assetTypeData" :key="key" :label=item.id>
                    <div class="sidebar-info-item-txt">
                      <el-popover v-if="item.name.length > 14" trigger="hover" placement="top-start" :content="item.name" >
                        <span slot="reference">{{item.name}}</span>
                      </el-popover>
                      <span v-else>{{item.name}}</span>
                    </div>
                    <el-tooltip :content="''+item.total" placement="top" effect="light" :disabled="item.total<99">
                      <el-badge class="mark" :value="item.total" :max="99"/>
                    </el-tooltip>
                  </el-checkbox>
                </el-checkbox-group>
              </el-collapse-item>
              <el-collapse-item name="vendor" :title="$t('asset.left.vendor')">
                <el-checkbox-group v-model="vendorCheckList" size="small" @change="changeVendorCheckBox">
                  <el-checkbox class="sidebar-info-item" :class="{'sidebar-info-item-active': indOf(vendorCheckList, item.id)}" v-for="(item, key) in vendorData" :key="key" :label=item.id>
                    <div class="sidebar-info-item-txt">
                      <el-popover v-if="item.name.length > 14" trigger="hover" placement="top-start" :content="item.name" >
                        <span slot="reference">{{item.name}}</span>
                      </el-popover>
                      <span v-else>{{item.name}}</span>
                    </div>
                    <el-tooltip :content="''+item.total" placement="top" effect="light" :disabled="item.total<99">
                      <el-badge class="mark" :value="item.total" :max="99"/>
                    </el-tooltip>
                  </el-checkbox>
                </el-checkbox-group>
              </el-collapse-item>
              <el-collapse-item name="ping" :title="$t('asset.left.ping')">
                <el-checkbox-group v-model="pingCheckList" size="small" @change="changePingCheckBox">
                  <el-checkbox class="sidebar-info-item" :class="{'sidebar-info-item-active': indOf(pingCheckList, item.key)}" v-for="(item, index) in pingData" :key="index" :label="item.value">
                    <div class="sidebar-info-item-txt">
                      <el-popover v-if="item.value.length > 16" trigger="hover" placement="top-start" :content="item.value" >
                        <span slot="reference">{{item.value}}</span>
                      </el-popover>
                      <span v-else>{{item.value}}</span>
                    </div>
                    <el-tooltip :content="''+item.total" placement="top" effect="light" :disabled="item.total<99">
                      <el-badge class="mark" :value="item.total" :max="99"/>
                    </el-tooltip>
                  </el-checkbox>
                </el-checkbox-group>
              </el-collapse-item>
            </el-collapse>
          </el-scrollbar>
        </div>
      </div>
      <div slot="content-right" class="slot-content">
        <div class="main-list" :class="{'main-list-with-sub': bottomBox.showSubList}">
          <div class="main-modal"></div>
          <div class="top-tools" v-show="bottomBox.mainResizeShow">
            <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': bottomBox.showSubList}">
              <div class="top-tool-search margin-r-20"><search-input :searchMsg="searchMsg" @search="search" :inTransform="bottomBox.inTransform"></search-input></div>
              <export-excel
                export-file-name="asset"
                export-url="/asset/export"
                import-url="/asset/import"
                :params="searchLabel"
                @afterImport="getTableData"
              >
                <template slot="optionZone">
                  <button @click.stop="add" :title="$t('overall.createAsset')" class="nz-btn nz-btn-size-normal nz-btn-style-light" id="asset-create-asset">
                    <i class="nz-icon nz-icon-create-square"></i></button>
                </template>
              </export-excel>
            </div>
            <div class="pagination-top pagination-top-hide display-none"></div>
          </div>

              <el-table
                class="nz-table"
                :height="mainTableHeight"
                style="width: 100%;"
                :data="tableData"
                v-scrollBar:el-table="'large'"
                v-show="bottomBox.mainResizeShow"
                border
                v-loading="tools.loading"
                tooltip-effect="light"
                ref="assetTable"
                :cell-class-name="messageStyle"
                @sort-change="tableDataSort"
              >
                <el-table-column
                  :resizable="false"
                  v-for="(item, index) in tools.tablelable"
                  v-if="item.show"
                  :width="item.width"
                  :key="`col_${index}`"
                  :label="item.label"
                  :fixed="item.fixed"
                  :show-overflow-tooltip="item.prop != 'Alert' || item.prop != 'Module'"
                  min-width="110px"
                  :class-name="item.prop == 'option' ? 'content-right-options' : ''"
                  :sortable="sortableShow(item.prop)"
                  :prop="propTitle(item.prop)"
                >
                  <template slot-scope="scope" :column="item">
                    <div v-if="item.prop=='ID'">
                      <span>{{scope.row.id}}</span>
                    </div>
                    <div v-if="item.prop=='assetType'">
                      <span>{{scope.row.model.type.value}}</span>
                    </div>
                    <template v-if="item.prop=='SN'">{{scope.row.sn}}</template>
                    <div v-if="item.prop=='HOST'">
                      <span>{{scope.row.host}}</span>
                    </div>
                    <div v-if="item.prop=='state'">
                      <span>{{scope.row.state==1 ? $t('asset.inStock') : $t('asset.notInStock')}}</span>
                    </div>
              <div v-if="item.prop == 'pingStatus'">
                <el-popover
                  placement="right"
                  width="200"
                  trigger="hover"
                  :content="formatPingTime(scope.row.pingLastUpdate)">
                  <div slot="reference" style="width: 20px">
                    <div :class="{'active-icon green':scope.row.pingState == 1,'active-icon red':scope.row.pingState == 0}"></div><span>{{scope.row.pingRtt?scope.row.pingRtt+'ms':''}}</span>
                  </div>
                </el-popover>
              </div>
              <template v-if="item.prop=='Module'">
                <span class="link" @click="showEndpoint(scope.row)">{{scope.row.endpointNum}}</span>
              </template>
              <template v-if="item.prop=='Alert'">
                <el-tooltip :content="scope.row.alertNum+' '+$t('overall.active')" placement="top" effect="light" :disabled=" scope.row.alertNum < 99">
                  <span :id="'asset-alerts-'+scope.row.id" @click="jumpToAlertMsg(scope.row)" class="link">
                    {{(scope.row.alertNum < 99 ? scope.row.alertNum : 99)}}
                      <sup class="linkSup" v-if="scope.row.alertNum > 99">+</sup>
                    {{' ' + $t('overall.active')}}
                  </span>
                </el-tooltip>
              </template>
              <div v-if="item.prop=='dataCenter'">
                <span  >{{scope.row.idc.name}}</span>
              </div>
              <template v-if="item.prop=='cabinet'">
                <span v-if="scope.row.cabinet && scope.row.cabinet != '--'">{{returnData(scope.row.cabinet).name}}</span>
                <span v-else >{{returnData(scope.row.cabinet)}}</span>
              </template>
              <div v-if="item.prop=='model'">
                <span>{{scope.row.model.name}}</span>
              </div>
              <div v-if="item.prop=='vendor'">
                <span>{{scope.row.model.vendor.value}}</span>
              </div>
              <div v-if="item.prop=='purchaseDate'">
                <span>{{returnData(scope.row.purchaseDate)}}</span>
              </div>
              <div v-if="item.prop=='principal'">
                <span>{{getPrincipalName(scope.row.idc.principal)}}</span>
              </div>
              <div v-if="item.prop=='tel'">
                <span>{{scope.row.idc.tel}}</span>
              </div>
              <template v-if="item.prop == 'option'">
                <span :title="$t('overall.view')" @click.stop="detail(scope.row)" class="content-right-option" :id="'asset-detail-'+scope.row.id"><i
                  class="el-icon-view"></i>
                </span>
                  &nbsp;
                  <span :title="$t('overall.edit')" @click.stop="edit(scope.row)" class="content-right-option" :id="'asset-edit-'+scope.row.id"><i
                    class="nz-icon nz-icon-edit"></i>
                </span>
                  &nbsp;
                  <span :title="$t('overall.delete')" @click.stop="del(scope.row)" class="content-right-option" :id="'asset-del-'+scope.row.id"><i
                    class="el-icon-delete"></i>
                </span>
                  &nbsp;
                  <el-dropdown trigger="hover" @command="cli">
                  <span title="CLI" class="content-right-option" :id="'asset-ssh-'+scope.row.id"><i
                    class="nz-icon nz-icon-cli" :class="{'gray-filter': !scope.row.accounts || scope.row.accounts.length == 0}"></i>
                  </span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item v-for="(account, index) in scope.row.accounts" v-if="account && account.protocol != 'SNMP'" :key="index" :command="[scope.row.id ,scope.row.host, account]">{{account.protocol}}</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>

                </template>
              </template>
            </el-table-column>
            <el-table-column width="28" fixed="right" :resizable="false">
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
          <bottom-box v-if="bottomBox.showSubList" :sub-resize-show="bottomBox.subResizeShow" :obj="bottomBox.asset" :isFullScreen="bottomBox.isFullScreen" :from="'asset'" :targetTab.sync="bottomBox.targetTab" :detail="bottomBox.assetDetail"
                      @reload="getTableData"
                      @closeSubList="bottomBox.showSubList = false"
                      @fullScreen="fullScreen"
                      @exitFullScreen="exitFullScreen"
                      @listResize="listResize" ></bottom-box>
        </transition>
      </div>
    </left-menu>
    <transition name="right-box">
      <asset-box v-if="rightBox.show" :asset="asset" @refresh="flushData" ref="assetBox" @close="closeRightBox"></asset-box>
    </transition>
    <element-set
      v-if="tools.showElementSet"
      @close="elementsetHide"
      v-clickoutside="elementsetHide"
      :drop-col="tools.dropCol"
      :table-title="tableTitle"
      @tablelable="tablelabelEmit"
      ref="elementset"
    ></element-set>

  </div>
</template>

<script>
  import bus from "../../../libs/bus";
  import exportXLSX from "../../common/exportXLSX";
  import endpointStatusPop from "./endpointStatusPop";
  export default {
    name: "asset",
    components:{
      'export-excel':exportXLSX,
      'endpoint-status-pop':endpointStatusPop,
    },
    data() {
      return {
        //侧滑
        rightBox: {
          show: false,
        },
        /*二级页面相关*/
        bottomBox: {
          assetDetail: {}, //asset详情
          asset: {}, //告警信息对应的asset对象
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
        asset: {},
        blankAsset: {
          id: '',
          sn: '',
          host: '',
          state: '',
          purchaseDate: '',
          idcId: '',
          cabinetId: '',
          modelId: '',
          model: {type: {code: ""}},
          assetType: '',
          impi:{
            host:'',
            port:'',
          },
          tags: [],
          accounts: [],
        },
        tableId: 'assetTable', //需要分页的table的id，用于记录每页数量
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 1,
            name: 'ID',
            type: 'input',
            label: 'id',
            disabled: false
          },{
            id: 20,
            name: 'SN',
            type: 'input',
            label: 'sn',
            disabled: false
          },{
            id: 21,
            name: 'Host',
            type: 'input',
            label: 'host',
            disabled: false
          },{
            id: 22,
            name: this.$t("asset.state"),
            type: 'select',
            label: 'assetState',
            disabled: false
          },{
            id: 23,
            name: "pingStatus",
            type: 'select',
            label: 'pingStatus',
            disabled: false
          }],
        },

        searchLabel: {}, //搜索参数
        activeType: 'dataCenter',

        tableTitle: [
          {
            label: this.$t("asset.tableTitle.host"),
            prop: 'HOST',
            show: true,
            width: 130,
            fixed:'left'
          },
          {
            label: this.$t("asset.tableTitle.id"),
            prop: 'ID',
            show: true,
            width: 110
          }, {
            label: this.$t("asset.tableTitle.assetType"),
            prop: 'assetType',
            show: true,
          }, {
            label: this.$t("asset.tableTitle.device"),
            prop: 'SN',
            show: true,
            width: 130
          },  {
            label: this.$t("asset.tableTitle.assetState"),
            prop: 'state',
            show: true,
          }, {
            label:this.$t('asset.tableTitle.assetPing'),
            prop:'pingStatus',
            show:true,
          },{
            label: this.$t("asset.tableTitle.modules"),
            prop: 'Module',
            show: true,
            width: 105
          }, {
            label: this.$t("asset.tableTitle.alerts"),
            prop: 'Alert',
            show: true,
            width: 80
          }, {
            label: this.$t("asset.tableTitle.dataCenter"),
            prop: 'dataCenter',
            show: true,
          }, {
            label: this.$t("asset.tableTitle.cabinet"),
            prop: 'cabinet',
            show: true,
          }, {
            label: this.$t("asset.tableTitle.model"),
            prop: 'model',
            show: true,
          }, {
            label: this.$t("asset.tableTitle.vendor"),
            prop: 'vendor',
            show: true,
          }, {
            label: this.$t("asset.tableTitle.procurementDate"),
            prop: 'purchaseDate',
            show: false,
          }, {
            label: this.$t("asset.tableTitle.principal"),
            prop: 'principal',
            show: false,
          }, {
            label: this.$t("asset.tableTitle.principalTel"),
            prop: 'tel',
            show: false,
            width: 115
          }, {
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true,
            width: 150,
            fixed:'right'
          }],
        tableData: [],

        dcData: [],
        dcCheckList: [],
        assetTypeData: [],
        assetTypeCheckList: [],
        vendorData: [],
        vendorCheckList: [],
        pingData: this.$CONSTANTS.asset.pingData,
        pingCheckList: [],

        pageObj: {
          id: '',
          pageNo: 1,
          pageSize: 50,
          total: 0,
          idcId: '',
          idcIds: ''
        },

        assetClick: false,
        assetPingSwitch: localStorage.getItem('nz-sys-asset-ping-switch'),
      }
    },
    computed: {
      getData() {
        return this.$store.state.assetData
      },
      getFlushData() {
        return this.$store.state.flushDataSign
      }
    },
    watch: {
      getData: {
        handler(newVal) {
          if (newVal.type == 1) {
            this.activeType = 'dataCenter';
            this.checkList = newVal.selectedData;
            this.assetClick = false;
          }
        },
        immediate: true,
        deep: true,
      },
      getFlushData: {
        handler(newVal, oldVal) {
          if (newVal === true) {
            this.getDcData();
            this.getTableData()
            /*this.getLeftMenuList();
            this.getAssetData()*/
          }
        }
      },
      dcCheckList(n, o) {
        setTimeout(()=>{
          if (n.length > 0 ) {
            this.pageObj.idcIds = n.join(',');
          } else {
            this.pageObj.idcIds = '';
          }
          if (this.assetClick) {
            this.$store.state.assetData = {selectedData: n, step: this.$store.state.assetData.step+1, type: 0};
          }
          this.getTableData();
        }, 50);
      },
      'bottomBox.showSubList': function(n) {
        let vm = this;
        this.$bottomBoxWindow.showSubListWatch(vm, n);
      },
      'bottomBox.asset': {
        deep: true,
        handler(n) {
          if (n.id) {
            this.bottomBox.assetDetail = this.convertToDetail(n);
            if (n.model.id) {
              n.modelId = n.model.id;
            }
          }
        }
      },
    },
    methods: {
      fullScreen() {
        let vm = this;
        this.$bottomBoxWindow.fullScreen(vm);
      },
      exitFullScreen() {
        let vm = this;
        this.$bottomBoxWindow.exitFullScreen(vm);
      },
      listResize(e) {
        let vm = this;
        this.$bottomBoxWindow.listResize(vm, e);
      },
      dcSelectAll(val) { //DC全选
        if (this.checkListData.length > 0) {
          this.checkList = [];
          if (val) {
            for (let i = 0; i < this.checkListData.length; i++) {
              this.checkList.push(this.checkListData[i].id);
              this.$store.commit('assetItemIdChange',this.checkListData[i].id)
            }
            this.$store.commit('assetAllIdChange',this.checkListData)
          }
        }
      },
      elementsetShow(s, e) {
        this.tools.showElementSet = true;
        this.$nextTick(() => {
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
          this.$store.commit('setPosition', { positionx, positiony });
        });
      },
      elementsetHide() {
        //悬浮点击空白隐藏
        this.tools.showElementSet = false;
      },
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        this.tools.tablelable = data;
      },
      cli([id,host,account]){
        const consoleParam = {
          id: id,
          host: host,
          accountId: account.id,
          port: account.port,
        };
        this.$store.commit('addConsole', consoleParam);
      },
      jumpToAlertMsg(asset) {
        this.bottomBox.targetTab = 'alertMessage';
        this.bottomBox.asset = JSON.parse(JSON.stringify(asset));
        this.bottomBox.showSubList = true;
      },
      getTableData() {
        this.searchLabel = Object.assign(this.searchLabel, this.pageObj);
        this.tools.loading = true;
        this.$get('asset', this.searchLabel).then(response => {
          this.tools.loading = false;
          if (response.code === 200) {
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total
          }
        });
      },
      getDcData() {
        return new Promise(resolve => {
          this.$get('idc').then(response => {
            if (response.code === 200) {
              this.dcData = response.data.list;
            }
            resolve(this.dcData);
          });
        });
      },
      getAssetTypeData() {
        return new Promise(resolve => {
          this.$get('sys/dict/all?type=assetType').then(response => {
            if (response.code === 200) {
              this.assetTypeData = response.data;
            }
            resolve(this.assetTypeData);
          });
        });
      },
      getVendorData() {
        return new Promise(resolve => {
          this.$get('sys/dict/all?type=vendor').then(response => {
            if (response.code === 200) {
              this.vendorData = response.data;
            }
            resolve(this.vendorData);
          });
        });
      },
      getUserData() {
        return new Promise(resolve => {
          this.$get('sys/user/list').then(response => {
            if (response.code === 200) {
              this.userData = response.data.list;
            }
            resolve(this.userData);
          });
        });
      },
      messageStyle(e) {
        if (e.column.label == 'Alerts' || e.column.label == this.$t("asset.tableTitle.alerts")) {
          if (e.row.alertNum > 0) {
            return 'danger';
          } else {
            return 'success';
          }
        }
        return '';
      },
      edit(asset) {
        this.asset = JSON.parse(JSON.stringify(asset));
        this.rightBox.show = true;
      },
      detail(asset) {
        this.bottomBox.asset = JSON.parse(JSON.stringify(asset));
        this.bottomBox.targetTab = "panel";
        this.bottomBox.showSubList = true;
      },
      del(asset) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("asset?ids=" + asset.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      addNewData(type) {
        if (type === 'IDC') {
          this.$post('idc', this.addIdcData).then(res => {
            if (res.code === 200) {
              const h = this.$createElement;
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
              this.getDcData()
              this.getTableData()
              /*this.getLeftMenuList()
              this.getAssetData()*/
            } else {
              this.$message.error(res.msg);
            }
          })
        }
      },
      deleteData(data, item) {
        this.$confirm(this.$t("tip.assetConfirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete(data + "?ids=" + item).then(response => {
            if (response.code === 200) {
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();
              this.getDcData();
              /*this.getAssetData();
              this.getLeftMenuList();*/
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      markOptionData(data) {
        data.forEach(item => {
          this.$set(item, 'isEdit', false);
          this.$set(item, 'oldName', item.value);
          this.$set(item, item.name, false)
          this.$set(item, item.id, false)
          this.$set(item, item.id + item.name, false)
        })
      },
      editOptionData(item) {
        if (!item.isEdit) {
          item.isEdit = true;
        } else {
          if (item.name !== item.oldName) {
            item.isEdit = false;
          } else {
            item.isEdit = false;
          }
        }
      },
      delOptionData(data) {
      },
      tabControl(data) {
        if (data === 'close') {
          this.editUnitShow = false;
          this.$refs['assetEditUnit'].tabView = false;
          this.rightBox.show = false;
        }
      },
      indOf(a, b) {
        let c = [];
        for (let i = 0; i < a.length; i++) {
          c.push(a[i]);
        }
        if (c.indexOf(b) > -1) {
          return true;
        } else {
          return false;
        }
      },
      showEndpoint(asset) {
        this.bottomBox.asset = Object.assign({}, asset);
        this.bottomBox.targetTab = "endpoint";
        this.bottomBox.showSubList = true;
      },
      add() {
        this.asset = this.newAsset();
        this.rightBox.show = true;
      },
      newAsset() {
        return JSON.parse(JSON.stringify(this.blankAsset));
      },
      closeRightBox(refresh) {
        this.rightBox.show = false;
        if (refresh) {
          this.getTableData();
        }
      },
      changeCheckBox() {
        this.assetClick = true;
      },
      changeAssetTypeCheckBox() {
        if(this.assetTypeCheckList && this.assetTypeCheckList.length > 0){
          let assetTypeIds = this.assetTypeCheckList.join(',');
          this.pageObj.typeIds=assetTypeIds;
        }else{
          this.pageObj.typeIds='';
        }
        this.getTableData();
      },
      changeVendorCheckBox() {
        if(this.vendorCheckList && this.vendorCheckList.length > 0){
          let vendorIds = this.vendorCheckList.join(',');
          this.pageObj.vendorIds = vendorIds;

        }else{
          this.pageObj.vendorIds = '';
        }
        this.getTableData();
      },
      changePingCheckBox() {
        if(this.pingCheckList && this.pingCheckList.length > 0){
          let pingStates = this.pingCheckList.join(',');
          this.pageObj.pingStates = pingStates;
        }else{
          this.pageObj.pingStates = '';
        }
        this.getTableData();
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getTableData()
      }
      ,
      pageSize(val) {
        this.pageObj.pageSize = val;
        localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val);
        this.getTableData();
      },
      getPrincipalName(data) {
        for (let item in this.userData) {
          if (this.userData[item].userId === data) {
            return this.userData[item].username
          }
        }
      },
      returnData(data) {
        if (data && data !== '--') {
          return data;
        } else if (data === '--') {
          return '--';
        } else {
          return "--";
        }
      },
      flushData() {
        Promise.all([this.getVendorData(), this.getAssetTypeData(), this.getDcData()]).then(response => {
          this.getTableData();
        });
      },
      closeAllPop:function(){
        this.$refs.idcConfigBox.forEach((item) => {
          item.show(false);
        });
        this.$refs.cabinetConfigBox.forEach((item) => {
          item.show(false);
        });
      },
      search(searchObj) {
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
      convertToDetail(obj) {
        let detail = JSON.parse(JSON.stringify(obj));
        detail.state = obj.state == 1 ? this.$t('asset.inStock'): this.$t('asset.notInStock');
        detail.assetType = obj.model.type.value;
        detail.vendorModel = obj.model.vendor.value + " " + obj.model.name;
        detail.dataCenter = obj.idc ? obj.idc.name : "";
        detail.location = obj.idc ? obj.idc.location : "";
        detail.principal = obj.idc ? this.getPrincipalName(obj.idc.principal) : "";
        detail.tel = obj.idc ? obj.idc.tel : "";
        detail.cabinet = obj.cabinet ? obj.cabinet.name : "";
        detail.uSize = obj.cabinet ? obj.cabinet.uSize : "";
        detail.remark = obj.idc ? obj.idc.remark : "";
        if (obj.accounts && obj.accounts.length > 0) {
          let account = obj.accounts[0];
          detail.protocol = account.protocol;
          detail.account = account.user;
          let loginType = "";
          if (account.authType == 1) {
            loginType = this.$t('asset.password');
          } else if (account.authType == 2) {
            loginType = this.$t('asset.ssh');
          }
          detail.loginType = loginType;
          detail.port = account.port;
        }

        return detail;
      },
      formatPingTime:function(str){
        if(!str || str == ''){
          return this.$t('asset.assetStatPre')+this.$t('asset.assetStatDown');
        }
        let ds='-';
        let ts=':';
        let time=new Date(str);
        let year=time.getFullYear();
        let month=time.getMonth()+1 > 9 ? time.getMonth()+1 : ('0'+(time.getMonth()+1));
        let day=time.getDate() > 9 ? time.getDate():('0'+time.getDate());
        let hours=time.getHours() > 9? time.getHours():('0'+time.getHours());
        let minutes=time.getMinutes() > 9 ?time.getMinutes():('0'+time.getMinutes());
        let seconds=time.getSeconds() > 9 ? time.getSeconds():('0'+time.getSeconds());
        return this.$t('asset.assetStatPre')+year+ds+month+ds+day+' '+hours+ts+minutes+ts+seconds;

      },
      //是否需要排序
      sortableShow(prop){
        switch(prop){
          case 'ID':
          case 'HOST':
          case 'SN':
          case 'purchaseDate':
            return'custom';
          default : return false;
        }
      },
      // prop字段
      propTitle(prop){
        switch(prop){
          case 'ID': return'ass.id';
          case 'HOST': return'ass.host';
          case 'SN': return'ass.sn';
          case 'purchaseDate': return'ass.purchase_date';
          default : return prop;
        }
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
      /*}
        this.getAssetData();*/
      },
      /*// 获取左侧菜单数据
      getLeftMenuList(){
        this.$get('asset/filter').then(response => {
          if (response.code === 200) {
            //dc
            this.checkListData = this.IDCOptionData = response.data.dc;
            this.markOptionData(this.IDCOptionData);
            // AssetType
            this.assetTypeCheckListData = response.data.assetType;
            // vendor
            this.vendorCheckListData = response.data.vendor;
            // ping
            this.pingCheckListData= response.data.ping.map(item=>{
              item.label=item.name;
              item.value=item.status;
              return item
            })
          }
        })
      },*/
    },
    created() {
      this.getUserData();
      this.flushData();
      this.getPingData();
    },
    mounted() {
      //初始化数据
      Promise.all([this.getVendorData(), this.getAssetTypeData(), this.getUserData(), this.getDcData()]).then(response => {
        this.getTableData();
      });
      // this.getLeftMenuList()//获取左侧菜单列表
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageObj.pageSize = pageSize
      }
      this.$nextTick(() => {
        //左侧dc列表初始选中状态
        if (this.$store.state.assetData.selectedData.length > 0) {
          this.checkList = [];
          this.checkList = this.$store.state.assetData.selectedData;
        }
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.assetTable.$el.querySelector(".el-table__body-wrapper");
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
        //resize时刷新左侧列表滚动条
        let vm = this;
        window.onresize = function () {
          vm.$refs.leftScrollbar.update();
          el._ps_.update();
        };
      });
      let localStorageTitle = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path);
      this.tools.tablelable = localStorageTitle ? JSON.parse(localStorageTitle) : this.tableTitle;

      if (this.assetPingSwitch == 'off') {

        for (let i in this.tools.tablelable) {
          let label = this.tools.tablelable[i];

          if (label.prop == 'pingStatus') {
            this.tools.tablelable.splice(i, 1);
            //console.log(this.tools.tablelable)
            break;
          }
        }
      }
      this.tools.dropCol = localStorageTitle ? JSON.parse(localStorageTitle) : this.tableTitle;
    },
    destroyed() {
      window.onresize = null;
    }
  }
</script>

<style scoped lang="scss">
  .asset {
    height: 100%;
  }
  .tab-input-square {
    border: 1px solid #606266;
    height: 22px;
    width: 50px;
    border-radius: 3px;
    text-align: center;
    line-height: 20px;
  }
  .tab-input-square-high {
    border: 1px solid #1166bb;
  }
  /deep/ .el-table .cell.el-tooltip{
    min-width: 88px;
  }
  .linkSup{
    position: absolute;
    top: -15px;
    left: 17px;
  }
  .link{
    position: relative;
  }
  /deep/ .el-badge__content{
    width: 15px;
  }
  .mark{
    vertical-align: middle;
    display: inline-flex;
  }
  /*/deep/ .sidebar-info-item .el-checkbox__label{*/
    /*padding-right: 15px;*/
    /*width: calc(100% - 32px);*/
  /*}*/
</style>
