<template>
  <div class="asset" ref="asset">
    <left-menu >
      <div slot="content-left" class="slot-content">
        <div class="sidebar-title">{{$t('asset.asset')}}</div>
        <div class="sidebar-info" style="height: 90%">
          <el-scrollbar ref="leftScrollbar" style="height: 100%">
          <el-collapse v-model="activeType" class="left-menu-bg">
            <el-collapse-item name="dataCenter" :title="$t('asset.left.dataCenter')">
              <el-checkbox-group v-model="checkList" size="small" @change="changeCheckBox">
                <el-checkbox class="sidebar-info-item" :class="{'sidebar-info-item-active': indOf(checkList, item.id)}"
                             v-for="(item,key) in checkListData" :key="key" :label=item.id>
                  <div class="sidebar-info-item-txt">
                    <el-popover v-if="item.name.length > 16" trigger="hover" placement="top-start" :content="item.name" >
                      <span slot="reference">{{item.name}}</span>
                    </el-popover>
                    <span v-else>{{item.name}}</span>
                  </div>
                </el-checkbox>
              </el-checkbox-group>
            </el-collapse-item>
            <el-collapse-item name="assetType" :title="$t('asset.left.assetType')">
              <el-checkbox-group v-model="assetTypeCheckList" size="small" @change="changeAssetTypeCheckBox">
                <el-checkbox class="sidebar-info-item" :class="{'sidebar-info-item-active': indOf(assetTypeCheckList, item.id)}" v-for="(item,key) in assetTypeCheckListData" :key="key" :label=item.id>
                  <div class="sidebar-info-item-txt">
                    <el-popover v-if="item.value.length > 16" trigger="hover" placement="top-start" :content="item.value" >
                      <span slot="reference">{{item.value}}</span>
                    </el-popover>
                    <span v-else>{{item.value}}</span>
                  </div>
                </el-checkbox>
              </el-checkbox-group>
            </el-collapse-item>
            <el-collapse-item name="vendor" :title="$t('asset.left.vendor')">
              <el-checkbox-group v-model="vendorCheckList" size="small" @change="changeVendorCheckBox">
                <el-checkbox class="sidebar-info-item" :class="{'sidebar-info-item-active': indOf(vendorCheckList, item.id)}" v-for="(item,key) in vendorCheckListData" :key="key" :label=item.id>
                  <div class="sidebar-info-item-txt">
                    <el-popover v-if="item.value.length > 16" trigger="hover" placement="top-start" :content="item.value" >
                      <span slot="reference">{{item.value}}</span>
                    </el-popover>
                    <span v-else>{{item.value}}</span>
                  </div>
                </el-checkbox>
              </el-checkbox-group>
            </el-collapse-item>
            <el-collapse-item name="ping" :title="$t('asset.left.ping')">
              <el-checkbox-group v-model="pingCheckList" size="small" @change="changePingCheckBox">
                <el-checkbox class="sidebar-info-item" :class="{'sidebar-info-item-active': indOf(pingCheckList, item.value)}" v-for="(item,key) in pingCheckListData" :key="key" :label=item.value>
                  <div class="sidebar-info-item-txt">
                    <el-popover v-if="item.label.length > 16" trigger="hover" placement="top-start" :content="item.label" >
                      <span slot="reference">{{item.label}}</span>
                    </el-popover>
                    <span v-else>{{item.label}}</span>
                  </div>
                </el-checkbox>
              </el-checkbox-group>
            </el-collapse-item>
          </el-collapse>
          </el-scrollbar>
        </div>
    </div>
          <div slot="content-right" class="slot-content">
            <div class="main-list main-and-sub-transition" :class="{'main-list-with-sub': showSubList}">
              <div class="top-tools" v-show="mainResizeShow">
                <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': showSubList}">
                  <div class="top-tool-search margin-r-20"><search-input :searchMsg="searchMsg" @search="search" :inTransform="inTransform"></search-input></div>
                  <export-excel
                    export-file-name="asset"
                    export-url="/asset/export"
                    import-url="/asset/import"
                    :params="searchLabel"
                    @afterImport="getAssetData"
                   >
                    <template slot="optionZone">
                      <button @click.stop="tagShow('showAdd')" :title="$t('overall.createAsset')" class="nz-btn nz-btn-size-normal nz-btn-style-light" id="asset-create-asset">
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
                v-show="mainResizeShow"
                border
                v-loading="loading"
                tooltip-effect="light"
                ref="assetTable"
                :cell-class-name="messageStyle"
              >
                <el-table-column
                  :resizable="false"
                  v-for="(item, index) in tablelable"
                  v-if="item.show"
                  :width="item.width"
                  :key="`col_${index}`"
                  :label="item.label"
                  :fixed="item.fixed"
                  :show-overflow-tooltip="item.prop != 'Alert' || item.prop != 'Module'"
                  min-width="110px"
                  :class-name="item.prop == 'option' ? 'content-right-options' : ''"
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
                      <span>{{scope.row.state==1 ? $t('asset.createAssetTab.inStock') : $t('asset.createAssetTab.notInStock')}}</span>
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
                <span :id="'asset-alerts-'+scope.row.id" @click="jumpToAlertMsg(scope.row)" class="link">{{scope.row.alertNum + ' ' + $t('overall.active')}}</span>
              </template>
              <div v-if="item.prop=='dataCenter'">
                <span  >{{scope.row.idc.name}}</span>
              </div>
              <template v-if="item.prop=='cabinet'">
                <span   v-if="scope.row.cabinet&&scope.row.cabinet!='--'">{{returnData(scope.row.cabinet).name}}</span>
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
                <span :title="$t('overall.view')" @click.stop="tagShow('showView',scope.row)" class="content-right-option" :id="'asset-detail-'+scope.row.id"><i
                  class="el-icon-view"></i>
                </span>
                &nbsp;
                <span :title="$t('overall.edit')" @click.stop="tagShow('showEdit',scope.row)" class="content-right-option" :id="'asset-edit-'+scope.row.id"><i
                  class="nz-icon nz-icon-edit"></i>
                </span>
                &nbsp;
                <span :title="$t('overall.delete')" @click.stop="deleteData('asset',scope.row.id)" class="content-right-option" :id="'asset-del-'+scope.row.id"><i
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
              <button v-if="scope.$index == 0" class="to-top" :style="{top: toTopBtnTop}" :class="{'to-top-is-hover': tableHover}" v-show="showTopBtn && mainResizeShow" @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-bottom" v-show="!showSubList">
          <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
        </div>
      </div>
      <bottom-box v-if="showSubList" :show-sub-list="showSubList" :subResizeShow="subResizeShow" :obj="alertMsgAsset" :isFullScreen="isFullScreen" :from="'asset'" :targetTab.sync="targetTab" :detail="assetDetail"
                  @reload="getAssetData"
                  @closeSubList="showSubList = false"
                  @fullScreen="fullScreen"
                  @exitFullScreen="exitFullScreen"
                  @listResize="listResize" ></bottom-box>
    </div>
    </left-menu>

    <asset-box :edit-unit-show='editUnitShow' @refreshData="flushData" @sendStateData="tabControl" v-if="rightBox.show"
                     ref="assetEditUnit"></asset-box>
    <element-set
      v-if="showElementSet"
      @close="elementsetHide"
      v-clickoutside="elementsetHide"
      :drop-col="dropCol"
      :table-title="tableTitle"
      @tablelable="tablelabelEmit"
      ref="elementset"
    ></element-set>
    <module-box :module="module" @reload="getAssetData" ref="moduleBox"></module-box>
  </div>
</template>

<script>
  import bus from "../../../libs/bus";
  import exportXLSX from "../../common/exportXLSX";
  import endpointStatusPop from "./endpointStatusPop";
  var vm;
  export default {
    name: "asset",
    components:{
      'export-excel':exportXLSX,
      'endpoint-status-pop':endpointStatusPop,
    },
    data() {
      vm = this;
      return {
        loading: false,
        /*二级页面相关*/
        assetDetail: {}, //asset详情
        alertMsgAsset: {}, //告警信息对应的asset对象
        showElementSet: false, //控制自定义列的弹框
        inTransform: false, //搜索框相关，搜索条件下拉框是否在transform里
        mainResizeShow: true, //dom高度改变时部分内容是否展示
        subResizeShow: true,
        isFullScreen: false,
        mainTableHeight: this.$tableHeight.normal, //主列表table高度
        showSubList: false, //是否展示二级列表
        targetTab: '', //展示二级列表中的哪个页签

        toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
        tableHover: false, //控制滚动条和top按钮同时出现
        showElementSet: false, //自定义列弹框是否显示
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
            name: this.$t("asset.createAssetTab.state"),
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
        showTopBtn: false,
        searchLabel: {}, //搜索参数
        activeType:'dataCenter',
        checkList: [],
        assetTypeCheckList:[],
        vendorCheckList:[],
        pingCheckList:[],
        tablelable: [],
        dropCol: [],
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
        checkListData: [],
        assetTypeCheckListData:[],
        vendorCheckListData:[],
        pingCheckListData:[],
        IDCData: '',
        IDCOptionData: [],
        cabinetData: '',
        cabinetOptionData: [],
        input: '',
        pageObj: {
          id: '',
          pageNo: 1,
          pageSize: 20,
          total: 0,
          idcId: '',
          idcIds: ''
        },
        tabShow: false,
        tabView: true,
        tagType: 'add',
        module: {},
        form: {
          name: ''
        },
        rightBox: { //弹出框相关
          show: false,
          isEdit: false, //false查看，true编辑
          title: ''
        },
        assetType: '',
        idcSelectedData: {
          id: '',
          name: '',
          location: '',
          principal: '',
          tel: ''
        },
        addIdcData: {
          id: '',
          name: '',
          popName: '',
          location: '',
          principal: '',
          tel: ''
        },
        idcUserData: [],
        modelCount: '',
        isResourceShow: 0,
        unitDisable: '',
        modelClickData: '',
        obj: null,
        editUnitShow: false,
        flag: false,
        checkAllFlag: false,
        checkAllHandler: false,
        assetClick: false,
        assetPingSwitch:localStorage.getItem('nz-sys-asset-ping-switch'),
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
            this.activeType='dataCenter'
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
            this.getIDCOptionData();
            this.getAssetData()
          }
        }
      },
      checkList(n, o) {
        setTimeout(()=>{
          if (n.length > 0 ) {
            this.pageObj.idcIds = n.join(',');
          } else {
            this.pageObj.idcIds = '';
          }
          if (this.assetClick) {
            this.$store.state.assetData = {selectedData: n, step: this.$store.state.assetData.step+1, type: 0};
          } else {
            this.getSingleAsset();
          }
          this.getAssetData();
        }, 50);
      },
      showSubList(n) {
        this.$bottomBoxWindow.showSubListWatch(vm, n);
      },
      alertMsgAsset: {
        deep: true,
        handler(n) {
          this.assetDetail = this.convertToDetail(n);
        }
      },
    },
    methods: {
      fullScreen() {
        this.$bottomBoxWindow.fullScreen(vm);
      },
      exitFullScreen() {
        this.$bottomBoxWindow.exitFullScreen(vm);
      },
      listResize(e) {
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
          this.checkAllHandler = false;
        }
      },
      openModuleBox(module) {
        if (module.param) {
          try {
            let tempObj = JSON.parse(module.param);
            this.$set(module, 'paramObj', []);
            for (let k in tempObj) {
              module.paramObj.push({key: k, value: tempObj[k]});
            }
          } catch (err) {
            console.info(module, err);
          }
        }
        this.module = module;
        this.$refs.moduleBox.show(true);
      },
      getAssetModuleList(id) {
        this.$refs['moduleListPop' + id][0].getModuleList();
      },
      elementsetShow(s, e) {
        this.showElementSet = true;
        this.$nextTick(() => {
          var eventfixed = {
            shezhi: 0,
            screen: 0
          };
          eventfixed[s] = 1;
          e.preventDefault();
          this.$store.commit('setHeaderTable', this.tablelable);
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
        this.$refs.elementset.elementsetHide();
      },
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        this.tablelable = data;
      },
      cli([id,host,account]){
        const consoleParam = {
          id: id,
          host: host,
          accountId: account.id,
          port: account.port,
        }
        this.$store.commit('addConsole', consoleParam);
        //this.$refs.webSsh.show(id,host,accountId,port);
      },
      jumpToAlertMsg(asset) {
        this.targetTab = 'alertMessage';
        this.alertMsgAsset = JSON.parse(JSON.stringify(asset));
        this.showSubList = true;
        /*this.$nextTick(() => {
          this.$store.commit("assetForAlertListChange", this.$store.state.assetForAlertList+1);
        });*/
      },
      getAssetData(data, flushRightBoxDc) {
        this.searchLabel = Object.assign(this.searchLabel, this.pageObj);
        this.loading = true;
        this.$get('asset', this.searchLabel).then(response => {
          this.loading = false;
          if (response.code === 200) {
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total
          }
        });
        if (flushRightBoxDc) {
          this.$refs.assetAddUnit.getIDCOptionData();
          this.$refs.assetEditUnit.getIDCOptionData();
        }
      },
      getIDCOptionData() {
        this.$get('idc').then(response => {
          if (response.code === 200) {
            this.checkListData = this.IDCOptionData = response.data.list;
            this.markOptionData(this.IDCOptionData)
          }
        })
      },
      getAssetTypeData:function(){
        this.$get('sys/dict/all?type=assetType').then(response => {
          if (response.code === 200) {
            this.assetTypeCheckListData = response.data
          }
        })
      },
      getVendorData:function(){
        this.$get('sys/dict/all?type=vendor').then(response => {
          if (response.code === 200) {
            this.vendorCheckListData = response.data
          }
        })
      },
      getPingData:function(){
        this.pingCheckListData=[
          {label:'up',value:1},
          {label:'down',value:0},
        ]
      },
      getUserData() {
        this.$get('sys/user/list').then(response => {
          if (response.code === 200) {
            this.idcUserData = response.data.list
          }
        })
      },
      messageStyle(e) {
        if (e.column.label == this.$t("asset.tableTitle.alerts")) {
          if (e.row.alertNum > 0) {
            return 'danger';
          } else {
            return 'success';
          }
        }
        return '';
      },
      editData(data, item) {
        if (data === 'idc') {
          item.name = this.addIdcData.popName
        }
        this.$put(data, item).then(res => {
          if (res.code === 200) {
            this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
            this.getAssetData();
          } else {
            this.$message.error(res.msg);
          }
        })
      },
      addNewData(type) {
        if (type === 'IDC') {
          this.$post('idc', this.addIdcData).then(res => {
            if (res.code === 200) {
              const h = this.$createElement;
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
              this.getIDCOptionData()
              this.getAssetData()
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
              this.getAssetData();
              this.getIDCOptionData();
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
        this.alertMsgAsset = Object.assign({}, asset);
        this.targetTab = "endpoint";
        this.showSubList = true;
      },
      tagShow(data, id, type) {
        if (data === 'showAdd') {
          this.rightBox.show = true;
          this.$nextTick(() => {
            this.editUnitShow = true;
            this.$refs['assetEditUnit'].accountSwitch=false;
            this.$refs['assetEditUnit'].getAssetData('');
            this.$refs['assetEditUnit'].resetAsset();
          });
        }
        if (data === 'showEdit') {
          this.rightBox.show = true;
          this.$nextTick(() => {
            this.editUnitShow = true;
            this.$refs['assetEditUnit'].accountSwitch=false;
            this.$refs['assetEditUnit'].getAssetData(id)
          });
        }
        if (data === 'showView') {
          this.alertMsgAsset = Object.assign({}, id);
          this.targetTab = "panel";
          this.showSubList = true;
          /*this.editUnitShow = true
          this.$refs['assetEditUnit'].getAssetData(id)
          this.$refs['assetEditUnit'].tabView = true*/
        }
      },
      editing() {

      },
      getSingleIDCData(data, item) {
        if (item !== 'edit') {
          this.idcSelectedData = '';
          this.IDCOptionData.forEach(item => {
            if (item.id === data) {
              this.idcSelectedData = item
            }
          });
          return
        } else {
          this.IDCOptionData.forEach(item => {
            if (item.id === data) {
              this.addIdcData.id = item.id;
              this.addIdcData.name = item.name;
              this.addIdcData.popName = item.name;
              this.addIdcData.location = item.location;
              this.addIdcData.principal = item.principal;
              this.addIdcData.tel = item.tel;
            }
          });
        }
      },

      changeCheckBox() {
        this.assetClick = true;
        this.getSingleAsset();
      },
      changeAssetTypeCheckBox:function(){
        if(this.assetTypeCheckList && this.assetTypeCheckList.length > 0){
          let assetTypeIds=this.assetTypeCheckList.join(',');
          this.pageObj.typeIds=assetTypeIds;
        }else{
          this.pageObj.typeIds='';
        }
        this.getAssetData();
      },
      changeVendorCheckBox:function(){
        if(this.vendorCheckList && this.vendorCheckList.length > 0){
          let vendorIds=this.vendorCheckList.join(',');
          this.pageObj.vendorIds=vendorIds;

        }else{
          this.pageObj.vendorIds='';
        }
        this.getAssetData();
      },
      changePingCheckBox:function(){
        if(this.pingCheckList && this.pingCheckList.length > 0){
          let pingStates=this.pingCheckList.join(',');
          this.pageObj.pingStates=pingStates;
        }else{
          this.pageObj.pingStates='';
        }
        this.getAssetData();
      },
      getSingleAsset() {
        let checkedCount = this.checkList.length;
        let allCount = this.checkListData.length;
        this.checkAllFlag = ((checkedCount == allCount) && allCount > 0);
        this.checkAllHandler = checkedCount > 0 && checkedCount < allCount;
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getAssetData()
      }
      ,
      pageSize(val) {
        this.pageObj.pageSize = val;
        localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val);
        this.getAssetData();
      },
      getPrincipalName(data) {
        for (let item in this.idcUserData) {
          if (this.idcUserData[item].userId === data) {
            return this.idcUserData[item].username
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
        this.getSingleAsset();
        this.getAssetData();
        this.getIDCOptionData();
        this.getAssetTypeData();
        this.getVendorData();
      },
      closeAllPop:function(){
        this.$refs.idcConfigBox.forEach((item)=>{
          item.show(false)
        })
        this.$refs.cabinetConfigBox.forEach((item)=>{
          item.show(false)
        })
      },
      search(searchObj) {
        this.searchLabel = {};
        this.pageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        this.getAssetData();
      },
      convertToDetail(obj) {
        let detail = JSON.parse(JSON.stringify(obj));
        detail.state = obj.state == 1 ? this.$t('asset.createAssetTab.inStock'): this.$t('asset.createAssetTab.notInStock');
        detail.assetType = obj.model.type.value;
        detail.vendorModel = obj.model.vendor.value + " " + obj.model.name;
        detail.dataCenter = obj.idc ? obj.idc.name : "";
        detail.location = obj.idc ? obj.idc.location : "";
        detail.principal = obj.idc ? this.getPrincipalName(obj.idc.principal) : "";
        detail.tel = obj.idc ? obj.idc.tel : "";
        detail.cabinet = obj.cabinet ? obj.cabinet.name : "";
        detail.uSize = obj.cabinet ? obj.cabinet.uSize : "";
        detail.remark = obj.idc ? obj.idc.remark : "";
        if (obj.accounts.length > 0) {
          let account = obj.accounts[0];
          detail.protocol = account.protocol;
          detail.account = account.user;
          let loginType = "";
          if (account.authType == 1) {
            loginType = this.$t('asset.createAssetTab.password');
          } else if (account.authType == 2) {
            loginType = this.$t('asset.createAssetTab.ssh');
          }
          detail.loginType = loginType;
          detail.port = account.port;
        }

        /*detail.push({label: this.$t("asset.createAssetTab.sn"), value: obj.sn});
        detail.push({label: this.$t("asset.createAssetTab.host"), value: obj.host});
        detail.push({label: this.$t("asset.createAssetTab.state"), value: obj.state == 1 ? this.$t('asset.createAssetTab.inStock'): this.$t('asset.createAssetTab.notInStock')});
        detail.push({label: this.$t("asset.tableTitle.modules"), value: obj.endpointNum});
        detail.push({label: this.$t("asset.tableTitle.alerts"), value: obj.alertNum});
        detail.push({label: this.$t("asset.createAssetTab.assetType"), value: obj.model.type.value});
        detail.push({label: this.$t("asset.createAssetTab.vendorModel"), value: obj.model.vendor.value + " " + obj.model.name});
        detail.push({label: this.$t("asset.createAssetTab.purchaseDate"), value: obj.purchaseDate});
        detail.push({label: this.$t("asset.createAssetTab.dcName"), value: obj.idc ? obj.idc.name : ""});
        detail.push({label: this.$t("asset.createAssetTab.location"), value: obj.idc ? obj.idc.location : ""});
        detail.push({label: this.$t("asset.createAssetTab.principal"), value: obj.idc ? this.getPrincipalName(obj.idc.principal) : ""});
        detail.push({label: this.$t("asset.createAssetTab.tel"), value: obj.idc ? obj.idc.tel : ""});
        detail.push({label: this.$t("asset.createAssetTab.cabinet"), value: obj.cabinet ? obj.cabinet.name : ""});
        detail.push({label: this.$t("asset.editAssetTab.uSize"), value: obj.cabinet ? obj.cabinet.uSize : ""});
        detail.push({label: this.$t("asset.editAssetTab.remark"), value: obj.idc ? obj.idc.remark : ""});
        if (obj.accounts.length > 0) {
          let account = obj.accounts[0];
          if (account.protocol == 'SSH') {
            detail.push({label: this.$t("asset.createAssetTab.protocol"), value: 'SSH'});
            detail.push({label: this.$t("asset.createAssetTab.account"), value: account.user});
            let loginType = "";
            if (account.authType == 1) {
              loginType = this.$t('asset.createAssetTab.password');
            } else if (account.authType == 2) {
              loginType = this.$t('asset.createAssetTab.ssh');
            }
            detail.push({label: this.$t("asset.createAssetTab.loginType"), value: loginType});
          } else if (account.protocol == 'TELNET') {
            detail.push({label: this.$t("asset.createAssetTab.protocol"), value: 'TELNET'});
            detail.push({label: this.$t("asset.createAssetTab.account"), value: account.user});
          }
          detail.push({label: this.$t("asset.createAssetTab.port"), value: account.port});
        }*/
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

      }
    },
    created() {
      this.getUserData();
      this.flushData();
      this.getPingData();
    },
    mounted() {
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
              this.showTopBtn = true;
            } else {
              this.showTopBtn = false;
            }
          });
          el.addEventListener("mouseenter", () => {
            this.tableHover = true;
          });
          el.addEventListener("mouseleave", () => {
            this.tableHover = false;
          });
        }
        //resize时刷新左侧列表滚动条
        let _this = this;
        window.onresize = function () {
          _this.$refs.leftScrollbar.update();
          el._ps_.update();
        };
      });
      let localStorageTitle = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path);
      this.tablelable = localStorageTitle ? JSON.parse(localStorageTitle) : this.tableTitle;
      // this.assetPingSwit

      if (this.assetPingSwitch == 'off') {

        for (let i in this.tablelable) {
          let label = this.tablelable[i];

          if (label.prop == 'pingStatus') {
           this.tablelable.splice(i, 1);
            console.log(this.tablelable)
            break;
          }
        }
      }
      this.dropCol = localStorageTitle ? JSON.parse(localStorageTitle) : this.tableTitle;
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
</style>
