<template>
  <div class="asset" ref="asset">
    <div class="content-left">
      <div class="sidebar-title">{{$t('asset.asset')}}</div>
      <div class="sidebar-info">
        <!--<div class="sidebar-info-header">ALL</div>-->
        <el-checkbox :indeterminate="checkAllHandler" class="sidebar-info-item" v-model="checkAllFlag" @change="dcSelectAll" :true-label="1" :false-label="0">
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
      </div>
    </div>

    <div class="content-right">
      <div class="top-tools">
        <div></div>
        <div>
          <export-excel
            export-file-name="asset"
            export-url="/asset/export"
            :params="searchLabel"
            @afterImport="getAssetData"
            class="float-right">
            <template slot="optionZone">
                <i class="nz-icon nz-icon-create-square" @click.stop="tagShow('showAdd')" :title="$t('overall.createAsset')" ></i>
            </template>
          </export-excel>

          <div class="top-tool-search float-left"><search-input :searchMsg="searchMsg" @search="search"></search-input></div>
        </div>
      </div>

      <el-table
        class="nz-table"
        height="calc(100% - 160px)"
        style="width: 100%;"
        :data="tableData"
        border
        tooltip-effect="light"
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
              <template v-if="scope.row.moduleNum > 0" >
                <endpoint-status-pop :asset-id="scope.row.id" :ref="'endpointPop' + scope.row.id">
                  <template v-slot:optionZone>
                  <span class="clickable">{{scope.row.endpointNum}}</span>
                </template>
                </endpoint-status-pop>
                <!--<module-list-pop :asset-id="scope.row.id + ''" @openModuleBox="openModuleBox" placement="left" :ref="'moduleListPop' + scope.row.id">
                  <template v-slot:optionZone>
&lt;!&ndash;                    <button class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-75">{{scope.row.moduleNum}}</button>&ndash;&gt;
                      <span class="clickable">{{scope.row.moduleNum}}</span>
                  </template>
                </module-list-pop>-->
              </template>
<!--              <button type="button" v-else class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-75 nz-btn-disabled">{{scope.row.moduleNum}}</button>-->
              <span v-else class="unclickable">{{scope.row.endpointNum}}</span>
            </template>
            <template v-if="item.prop=='Alert'">
<!--              <button type="button" v-if="scope.row.alertNum > 0" id="'asset-alerts-'+scope.row.id" @click="jumpToAlertMsg(scope.row.id)" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-75">{{scope.row.alertNum}}</button>-->
<!--              <button type="button" v-else class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-75 nz-btn-disabled">{{scope.row.alertNum}}</button>-->
              <span v-if="scope.row.alertNum > 0" id="'asset-alerts-'+scope.row.id" @click="jumpToAlertMsg(scope.row.id)" class="clickable">{{scope.row.alertNum}}</span>
              <span v-else class="unclickable">{{scope.row.alertNum}}</span>
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
              <span :title="$t('overall.view')" @click.stop="tagShow('showView',scope.row.id)" class="content-right-option" :id="'asset-detail-'+scope.row.id"><i
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
              <span title="CLI" @click="ssss(scope.row.id ,scope.row.host)" class="content-right-option" :id="'asset-ssh-'+scope.row.id"><i
                class="nz-icon nz-icon-cli"></i>
              </span>
            </template>
          </template>
        </el-table-column>
        <el-table-column width="28" fixed="right">
          <template slot="header" slot-scope="scope">
            <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">
              <i class="nz-icon nz-icon-gear"></i>
            </span>
          </template>
        </el-table-column>
      </el-table>
      <Pagination :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
    </div>

    <!--<asset-add-unit :add-unit-show='addUnitShow' @refreshData="flushData" ref="assetAddUnit"
                    @sendStateData="tabControl"></asset-add-unit>
    <asset-edit-unit :edit-unit-show='editUnitShow' @refreshData="flushData" @sendStateData="tabControl"
               ref="assetEditUnit"></asset-edit-unit>-->
    <asset-box :edit-unit-show='editUnitShow' @refreshData="flushData" @sendStateData="tabControl"
                     ref="assetEditUnit"></asset-box>
    <element-set
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
  export default {
    name: "asset",
    components:{
      'export-excel':exportXLSX,
      'endpoint-status-pop':endpointStatusPop
    },
    data() {
      return {
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
        searchLabel: {}, //搜索参数
        checkList: [],
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
            width: 105
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
        tableHeight: document.documentElement.clientHeight - 200,
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
      }
    },
    methods: {
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
        console.info(this.module);
        this.$refs.moduleBox.show(true);
      },
      getAssetModuleList(id) {
        this.$refs['moduleListPop' + id][0].getModuleList();
      },
      elementsetShow(s, e) {
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
      ssss(id, sn) {
        let routeData = this.$router.resolve({
          name: "terminal",
          query: {
            id: id,
            host: sn
          }
        });
        window.open(routeData.href);
      },
      jumpToAlertMsg(assetId) {
        this.$store.commit('assetForAlertListChange', assetId);
        bus.$emit("menu-change", 'alertList');
        this.$router.push({
          path: "/alertList",
          query: {
            t: +new Date()
          }
        });
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
      tagShow(data, id, type) {
        if (data === 'showAdd') {
          //this.addUnitShow = true;
          this.editUnitShow = true;
          this.$refs['assetEditUnit'].getAssetData('');
        }
        if (data === 'showEdit') {
          this.editUnitShow = true;
          this.$refs['assetEditUnit'].getAssetData(id)
        }
        if (data === 'showView') {
          this.editUnitShow = true
          this.$refs['assetEditUnit'].getAssetData(id)
          this.$refs['assetEditUnit'].tabView = true
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
        this.getAssetData()
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
      formatPingTime:function(str){
        if(!str || str == ''){
          return 'Last reply:Never';
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

        return 'Last reply:'+year+ds+month+ds+day+' '+hours+ts+minutes+ts+seconds;

      }
    },
    created() {
      this.getUserData();
      this.getIDCOptionData();
    },
    mounted() {
      setTimeout(()=>{
        if (this.$store.state.assetData.selectedData.length > 0) {
          this.checkList = [];
          this.checkList = this.$store.state.assetData.selectedData;
        }
      }, 50);
      let localStorageTitle=localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path);
      this.tablelable = localStorageTitle ? JSON.parse(localStorageTitle) : this.tableTitle;
      this.dropCol = localStorageTitle ? JSON.parse(localStorageTitle) : this.tableTitle;
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
<style lang="scss">

</style>
