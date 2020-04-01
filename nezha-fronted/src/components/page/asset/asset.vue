<template>
  <div class="asset" ref="asset">
    <div class="content-left">
      <el-scrollbar ref="leftScrollbar" style="height: 100%">
        <div class="sidebar-title">{{$t('asset.asset')}}</div>
        <div class="sidebar-info">
          <!--<div class="sidebar-info-header">ALL</div>-->
          <!--<el-checkbox :indeterminate="checkAllHandler" class="sidebar-info-item" v-model="checkAllFlag" @change="dcSelectAll" :true-label="1" :false-label="0">
            <div class="sidebar-info-item-txt" style="font-weight: bold;">All</div>
          </el-checkbox>
          <el-checkbox-group v-model="checkList" size="small" @change="changeCheckBox">
            <el-checkbox class="sidebar-info-item" :class="{'sidebar-info-item-active': indOf(checkList, item.id)}"
                         v-for="(item,key) in checkListData" :key="key" :label=item.id>
              <div class="sidebar-info-item-txt">
                <el-popover v-if="item.name.length > 16" trigger="hover" placement="top-start" :content="item.name" >
                  <span slot="reference">{{item.name}}</span>
                </el-popover>
                <span v-else>{{item.name}}</span>
              </div>-->

  <!--            <idc-config-box ref="idcConfigBox" :post-idc="item" placement="left" @after="getIDCOptionData" :button-class="'checkbox-edit'" :user-data="idcUserData">-->
  <!--              <template v-slot:optionZone>-->
  <!--                <span @click="closeAllPop">-->
  <!--                  <i class="nz-icon nz-icon-edit" @click="getSingleIDCData(item.id,'edit')"></i>-->
  <!--                </span>-->
  <!--              </template>-->
  <!--            </idc-config-box>-->
            <!--</el-checkbox>
          </el-checkbox-group>-->
          <el-collapse v-model="activeType">
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
                  <!--            <idc-config-box ref="idcConfigBox" :post-idc="item" placement="left" @after="getIDCOptionData" :button-class="'checkbox-edit'" :user-data="idcUserData">-->
                  <!--              <template v-slot:optionZone>-->
                  <!--                <span @click="closeAllPop">-->
                  <!--                  <i class="nz-icon nz-icon-edit" @click="getSingleIDCData(item.id,'edit')"></i>-->
                  <!--                </span>-->
                  <!--              </template>-->
                  <!--            </idc-config-box>-->
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
        </div>
      </el-scrollbar>
    </div>

          <div class="content-right">
            <div class="main-list main-and-sub-transition" :class="{'main-list-with-sub': showSubList}">
              <div class="top-tools" v-show="mainResizeShow">
                <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': showSubList}">
                  <div class="top-tool-search margin-r-20"><search-input :searchMsg="searchMsg" @search="search" :inTransform="inTransform"></search-input></div>
                  <export-excel
                    export-file-name="asset"
                    export-url="/asset/export"
                    :params="searchLabel"
                    @afterImport="getAssetData"
                    style="width: 59px;"
                    class="float-right">
                    <template slot="optionZone">
                        <i class="nz-icon nz-icon-create-square" @click.stop="tagShow('showAdd')" :title="$t('overall.createAsset')" ></i>
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
                v-scrollBar:el-table
                v-show="mainResizeShow"
                border
                tooltip-effect="light"
                ref="assetTable"
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
        <!--            :content="scope.row.pingRtt ? (scope.row.pingLastUpdate&&scope.row.pingLastUpdate!=''?(new Date(scope.row.pingLastUpdate).getHours()+':'+new Date(scope.row.pingLastUpdate).getMinutes()):'&#45;&#45;')+'['+ scope.row.pingRtt+'ms'+']':(scope.row.pingLastUpdate&&scope.row.pingLastUpdate!=''?(new Date(scope.row.pingLastUpdate).getHours()+':'+new Date(scope.row.pingLastUpdate).getMinutes()):'&#45;&#45;')+'[unreachable]'"-->
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
                <!--<template v-if="scope.row.moduleNum > 0" >
                  <endpoint-status-pop :asset-id="scope.row.id" :ref="'endpointPop' + scope.row.id">
                    <template v-slot:optionZone>
                    <span class="clickable">{{scope.row.endpointNum}}</span>
                  </template>
                  </endpoint-status-pop>
                  <module-list-pop :asset-id="scope.row.id + ''" @openModuleBox="openModuleBox" placement="left" :ref="'moduleListPop' + scope.row.id">
                    <template v-slot:optionZone>
  &lt;!&ndash;                    <button class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-75">{{scope.row.moduleNum}}</button>&ndash;&gt;
                        <span class="clickable">{{scope.row.moduleNum}}</span>
                    </template>
                  </module-list-pop>
                </template>
  &lt;!&ndash;              <button type="button" v-else class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-75 nz-btn-disabled">{{scope.row.moduleNum}}</button>&ndash;&gt;
                <span v-else class="unclickable">{{scope.row.endpointNum}}</span>-->
              </template>
              <template v-if="item.prop=='Alert'">
                <span :id="'asset-alerts-'+scope.row.id" @click="jumpToAlertMsg(scope.row)" class="link">{{scope.row.alertNum + ' ' + $t('overall.active')}}</span>
              </template>
              <div v-if="item.prop=='dataCenter'">
  <!--              <idc-config-box :post-idc="JSON.parse(JSON.stringify(scope.row.idc))" ref="idcConfigBox" :is-edit="false" placement="left"  @after="getAssetData(null, true)" :button-class="'checkbox-edit'" :user-data="idcUserData">-->
  <!--                <template v-slot:optionZone>-->
  <!--&lt;!&ndash;                  <span class="link" @click="closeAllPop">{{scope.row.idc.name}}</span>&ndash;&gt;-->
  <!--                  <span class="clickable" @click="closeAllPop">{{scope.row.idc.name}}</span>-->
  <!--                </template>-->
  <!--              </idc-config-box>-->
                <span  >{{scope.row.idc.name}}</span>
              </div>
              <template v-if="item.prop=='cabinet'">
  <!--              <cabinet-config-box v-if="scope.row.cabinet&&scope.row.cabinet!='&#45;&#45;'" ref="cabinetConfigBox"  placement="left" :is-edit="false" :post-cabinet="JSON.parse(JSON.stringify(scope.row.cabinet))"  @after="getAssetData(null, true)" :post-idc-datas="IDCOptionData">-->
  <!--&lt;!&ndash;                <span slot="optionZone" @click="closeAllPop" class="link">{{returnData(scope.row.cabinet)}}</span>&ndash;&gt;-->
  <!--                <span class="clickable" slot="optionZone" @click="closeAllPop" >{{returnData(scope.row.cabinet).name}}</span>-->
  <!--              </cabinet-config-box>-->
                <span   v-if="scope.row.cabinet&&scope.row.cabinet!='--'">{{returnData(scope.row.cabinet).name}}</span>
  <!--              <span v-else class="unclickable">{{returnData(scope.row.cabinet)}}</span>-->
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
                <span :title="$t('overall.edit')" @click.stop="tagShow('showEdit',scope.row.id)" class="content-right-option" :id="'asset-edit-'+scope.row.id"><i
                  class="nz-icon nz-icon-edit"></i>
                </span>&nbsp;
                &nbsp;
                <span :title="$t('overall.delete')" @click.stop="deleteData('asset',scope.row.id)" class="content-right-option" :id="'asset-del-'+scope.row.id"><i
                  class="el-icon-delete"></i>
                </span>&nbsp;&nbsp;&nbsp;
                &nbsp;
                <span title="CLI" @click="cli(scope.row.id ,scope.row.host,scope.row.accounts)" class="content-right-option" :id="'asset-ssh-'+scope.row.id"><i
                  class="nz-icon nz-icon-cli"></i>
                </span>
              </template>
            </template>
          </el-table-column>
          <el-table-column width="28" fixed="right" :resizable="false">
            <template slot="header" slot-scope="scope">
              <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">
                <i class="nz-icon nz-icon-gear"></i>
              </span>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-bottom" v-show="!showSubList">
          <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
        </div>
        <button class="to-top" v-show="showTopBtn" @click="$toTop"><i class="nz-icon nz-icon-top"></i></button>
      </div>
      <bottom-box v-if="showSubList" :show-sub-list="showSubList" :subResizeShow="subResizeShow" :obj="alertMsgAsset" :isFullScreen="isFullScreen" :from="'asset'" :targetTab="targetTab" :detail="assetDetail"
                  @reload="getAssetData"
                  @closeSubList="showSubList = false"
                  @fullScreen="fullScreen"
                  @exitFullScreen="exitFullScreen"
                  @listResize="listResize" ></bottom-box>
    </div>

    <asset-box :edit-unit-show='editUnitShow' @refreshData="flushData" @sendStateData="tabControl"
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
        /*二级页面相关*/
        assetDetail: [], //asset详情
        alertMsgAsset: {}, //告警信息对应的asset对象
        showElementSet: false, //控制自定义列的弹框
        inTransform: false, //搜索框相关，搜索条件下拉框是否在transform里
        mainResizeShow: true, //dom高度改变时部分内容是否展示
        subResizeShow: true,
        isFullScreen: false,
        mainTableHeight: this.$tableHeight.normal, //主列表table高度
        showSubList: false, //是否展示二级列表
        targetTab: '', //展示二级列表中的哪个页签

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
            id: 22,
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
            label: this.$t("asset.tableTitle.manufacturer"),
            prop: 'vendor',
            show: true,
          }, {
            label: this.$t("asset.tableTitle.procurementDate"),
            prop: 'purchaseDate',
            show: true,
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
        addUnitShow: false,
        editUnitShow: false,
        flag: false,
        checkAllFlag: false,
        checkAllHandler: false,
        assetClick: false,
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
      cli(id,host,accounts){
        let port = '';
        let accountId = '';
        if(accounts && accounts.length>0 && accounts[0].port){
          port = accounts[0].port;
          accountId = accounts[0].id;
        }
        const consoleParam = {
          id:id,
          host:host,
          accountId:accountId,
          port:port,
        }
        this.$store.commit('addConsole',consoleParam);
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
        this.$get('asset', this.searchLabel).then(response => {
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
          {label:'down',value:2},
        ]
      },
      getUserData() {
        this.$get('sys/user/list').then(response => {
          if (response.code === 200) {
            this.idcUserData = response.data.list
          }
        })
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
          this.addUnitShow = false
          this.editUnitShow = false
          this.$refs['assetEditUnit'].tabView = false
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
          //this.addUnitShow = true;
          this.editUnitShow = true;
          this.$refs['assetEditUnit'].show();
          this.$refs['assetEditUnit'].accountSwitch=false;
          this.$refs['assetEditUnit'].getAssetData('');
          this.$refs['assetEditUnit'].resetAsset();
        }
        if (data === 'showEdit') {
          this.editUnitShow = true;
          this.$refs['assetEditUnit'].show();
          this.$refs['assetEditUnit'].getAssetData(id)
        }
        if (data === 'showView') {
          this.alertMsgAsset = Object.assign({}, id);
          this.targetTab = "detail";
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
          this.getAssetData();
        }else{
          this.pageObj.typeIds='';
        }
      },
      changeVendorCheckBox:function(){
        if(this.vendorCheckList && this.vendorCheckList.length > 0){
          let vendorIds=this.vendorCheckList.join(',');
          this.pageObj.vendorIds=vendorIds;
          this.getAssetData();
        }else{
          this.pageObj.vendorIds='';
        }
      },
      changePingCheckBox:function(){
        if(this.pingCheckList && this.pingCheckList.length > 0){
          let pingStates=this.pingCheckList.join(',');
          this.pageObj.pingStates=pingStates;
          this.getAssetData();
        }else{
          this.pageObj.pingStates='';
        }
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
        let detail = [];
        detail.push({label: this.$t("asset.createAssetTab.sn"), value: obj.sn});
        detail.push({label: this.$t("asset.createAssetTab.host"), value: obj.host});
        detail.push({label: this.$t("asset.createAssetTab.state"), value: obj.state == 1 ? this.$t('asset.createAssetTab.inStock'): this.$t('asset.createAssetTab.notInStock')});
        detail.push({label: this.$t("asset.tableTitle.modules"), value: obj.endpointNum});
        detail.push({label: this.$t("asset.tableTitle.alerts"), value: obj.alertNum});
        detail.push({label: this.$t("asset.createAssetTab.assetType"), value: obj.model.type.value});
        detail.push({label: this.$t("asset.createAssetTab.vendorModel"), value: obj.model.vendor.value + " " + obj.model.name});
        detail.push({label: this.$t("asset.createAssetTab.assetType"), value: obj.model.type.value});
        detail.push({label: this.$t("asset.createAssetTab.purchaseDate"), value: obj.purchaseDate});
        detail.push({label: this.$t("asset.createAssetTab.dcName"), value: obj.idc ? obj.idc.name : ""});
        detail.push({label: this.$t("asset.createAssetTab.location"), value: obj.idc ? obj.idc.location : ""});
        detail.push({label: this.$t("asset.createAssetTab.principal"), value: obj.idc ? this.getPrincipalName(obj.idc.principal) : ""});
        detail.push({label: this.$t("asset.createAssetTab.location"), value: obj.idc ? obj.idc.location : ""});
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
        let day=time.getDay() > 9 ? time.getDay():('0'+time.getDay());
        let hours=time.getHours() > 9? time.getHours():('0'+time.getHours());
        let minutes=time.getMinutes() > 9 ?time.getMinutes():('0'+time.getMinutes());
        let seconds=time.getSeconds() > 9 ? time.getSeconds():('0'+time.getSeconds());

        return this.$t('asset.assetStatPre')+year+ds+month+ds+day+' '+hours+ts+minutes+ts+seconds;

      }
    },
    created() {
      this.getUserData();
      this.getIDCOptionData();
      this.getAssetTypeData();
      this.getVendorData();
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
        }
        //resize时刷新左侧列表滚动条
        let _this = this;
        window.onresize = function() {
          _this.$refs.leftScrollbar.update();
        }
      });
      let localStorageTitle=localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path);
      this.tablelable = localStorageTitle ? JSON.parse(localStorageTitle) : this.tableTitle;
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
