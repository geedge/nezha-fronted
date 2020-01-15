<template>
  <div class="asset">
    <div class="content-left">
      <div class="sidebar-title">Asset</div>
      <div class="sidebar-info">
        <!--<div class="sidebar-info-header">ALL</div>-->
        <el-checkbox :indeterminate="checkAllHandler" class="sidebar-info-item" :model="checkAllFlag" @change="dcSelectAll" :true-label="1" :false-label="0">
          <div class="sidebar-info-item-txt" style="font-weight: bold;">All</div>
        </el-checkbox>
        <el-checkbox-group v-model="checkList" size="small" @change="getSingleAsset()">
          <el-checkbox class="sidebar-info-item" :class="{'sidebar-info-item-active': checkList.indexOf(item.id) != -1}"
                       v-for="(item,key) in checkListData" :key="key" :label=item.id>
            <div class="sidebar-info-item-txt">{{item.name}}</div>
            <idc-config-box ref="idcConfigBox" :post-idc="item" placement="left" @after="getIDCOptionData" :button-class="'checkbox-edit'">
              <template v-slot:optionZone>
                <span @click="closeAllPop">
                  <i class="el-icon-edit-outline" @click="getSingleIDCData(item.id,'edit')"></i>
                </span>
              </template>
            </idc-config-box>
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>

    <div class="content-right">
      <div class="top-tools">
        <button @click.stop="tagShow('showAdd')" class="nz-btn nz-btn-size-normal nz-btn-style-normal float-right" id="asset-add">
          <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
        </button>
        <div class="top-tool-search float-right"><search-input :searchMsg="searchMsg" @search="search"></search-input></div>
      </div>

      <el-table
        height="calc(100% - 65px)"
        style="width: 100%;"
        :data="tableData"
        border
      >
        <el-table-column
          v-for="(item, index) in tablelable"
          v-if="item.show"
          min-width="110"
          :width="item.width"
          :key="`col_${index}`"
          :label="item.label"
        >
          <template slot="header" slot-scope="scope">
            <span v-if="index==0">
                <span @click.stop="elementsetShow('shezhi',$event)" id="asset-tab-set">
                    <i class="el-icon-setting"></i>
                </span>
                <span>{{item.label}}</span>
            </span>
            <div v-else>
              <span>{{item.label}}</span>
            </div>
          </template>
          <template slot-scope="scope" :column="item">
            <div v-if="item.prop=='ID'">
              <span>{{scope.row.id}}</span>
            </div>
            <div v-if="item.prop=='资产类型'">
              <span>{{scope.row.model.type.value}}</span>
            </div>
            <div v-if="item.prop=='SN'">
              <span>{{scope.row.sn}}</span>
            </div>
            <div v-if="item.prop=='HOST'">
              <span>{{scope.row.host}}</span>
            </div>
            <div v-if="item.prop=='state'">
              <span>{{scope.row.state==1 ? $t('asset.createAssetTab.inStock') : $t('asset.createAssetTab.notInStock')}}</span>
            </div>
            <div v-if="item.prop=='Module'">
              <div v-if="scope.row.moduleNum > 0" @click="getAssetModuleList(scope.row.id)" :id="'asset-module-'+scope.row.id">
                <module-list-pop :assetId="scope.row.id + ''" @openModuleBox="openModuleBox" placement="left" :ref="'moduleListPop' + scope.row.id">
                  <template v-slot:optionZone>
                    <div class="tab-input-square tab-input-square-high link" >{{scope.row.moduleNum}}</div>
                  </template>
                </module-list-pop>
              </div>
              <div v-else class="tab-input-square">{{scope.row.moduleNum}}</div>
            </div>
            <div v-if="item.prop=='Alert'">
              <div v-if="scope.row.alertNum > 0" class="tab-input-square tab-input-square-high link" @click="jumpToAlertMsg(scope.row.id)" :id="'asset-alerts-'+scope.row.id">{{scope.row.alertNum}}</div>
              <div class="tab-input-square" v-else>{{scope.row.alertNum}}</div>
            </div>
            <div v-if="item.prop=='dataCenter'">
              <idc-config-box :post-idc="JSON.parse(JSON.stringify(scope.row.idc))" ref="idcConfigBox" :is-edit="false" placement="left"  @after="getAssetData(null, true)" :button-class="'checkbox-edit'">
                <template v-slot:optionZone>
                  <span class="link" @click="closeAllPop">{{scope.row.idc.name}}</span>
                </template>
              </idc-config-box>
              <!--<span class="link">{{scope.row.idc.name}}</span>-->
            </div>
            <div v-if="item.prop=='cabinet'">
              <cabinet-config-box v-if="scope.row.cabinet&&scope.row.cabinet!='--'" ref="cabinetConfigBox"  placement="left" :is-edit="false" :post-cabinet="JSON.parse(JSON.stringify(scope.row.cabinet))"  @after="getAssetData(null, true)">
                <span slot="optionZone" @click="closeAllPop" class="link">{{returnData(scope.row.cabinet)}}</span>
              </cabinet-config-box>
              <span v-else>{{returnData(scope.row.cabinet)}}</span>

            </div>
            <div v-if="item.prop=='model'">
              <span>{{scope.row.model.name}}</span>
            </div>
            <div v-if="item.prop=='vendor'">
              <span>{{scope.row.model.vendor.value}}</span>
            </div>
            <div v-if="item.prop=='购买日期'">
              <span>{{scope.row.purchaseDate}}</span>
            </div>
            <div v-if="item.prop=='principal'">
              <span>{{getPrincipalName(scope.row.idc.principal)}}</span>
            </div>
            <div v-if="item.prop=='tel'">
              <span>{{scope.row.idc.tel}}</span>
            </div>
            <div v-if="item.prop == 'option'" class="content-right-options">
              <span @click.stop="deleteData('asset',scope.row.id)" class="content-right-option" :id="'asset-del-'+scope.row.id"><i
                class="el-icon-delete"></i>
              </span>
              <span @click.stop="tagShow('showView',scope.row.id)" class="content-right-option" :id="'asset-detail-'+scope.row.id"><i
                class="el-icon-view"></i>
              </span>
              <span @click.stop="tagShow('showEdit',scope.row.id)" class="content-right-option" :id="'asset-edit-'+scope.row.id"><i
                class="el-icon-edit-outline"></i>
              </span>
              <span @click="ssss(scope.row.id ,scope.row.host)" class="content-right-option" :id="'asset-ssh-'+scope.row.id"><i
                class="el-icon-monitor"></i>
              </span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <Pagination :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
    </div>

    <asset-add-unit :add-unit-show='addUnitShow' @refreshData="flushData" ref="assetAddUnit"
                    @sendStateData="tabControl"></asset-add-unit>
    <asset-edit-unit :edit-unit-show='editUnitShow' @refreshData="flushData" @sendStateData="tabControl"
                     ref="assetEditUnit"></asset-edit-unit>
    <element-set
      v-clickoutside="elementsetHide"
      :dropCol="dropCol"
      @tablelable="tablelabelEmit"
      ref="elementset"
    ></element-set>
    <module-box :module="module" @reload="getAssetData" ref="moduleBox"></module-box>
  </div>
</template>

<script>
  export default {
    name: "asset",
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
          }],
        },
        searchLabel: {}, //搜索参数
        checkList: [],
        tablelable: [],
        dropCol: [],
        tableTitle: [
          {
            label: this.$t("asset.tableTitle.id"),
            prop: 'ID',
            show: true,
            width: 60
          }, {
            label: this.$t("asset.tableTitle.assetType"),
            prop: '资产类型',
            show: true,
          }, {
            label: this.$t("asset.tableTitle.device"),
            prop: 'SN',
            show: true,
          }, {
            label: this.$t("asset.tableTitle.host"),
            prop: 'HOST',
            show: true,
            width: 130
          }, {
            label: this.$t("asset.tableTitle.assetState"),
            prop: 'state',
            show: true,
          }, {
            label: this.$t("asset.tableTitle.modules"),
            prop: 'Module',
            show: true,
          }, {
            label: this.$t("asset.tableTitle.alerts"),
            prop: 'Alert',
            show: true,
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
            prop: '购买日期',
            show: true,
          }, {
            label: this.$t("asset.tableTitle.principal"),
            prop: 'principal',
            show: true,
          }, {
            label: this.$t("asset.tableTitle.principalTel"),
            prop: 'tel',
            show: true,
            width: 115
          }, {
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true,
            width: 115
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
        idcUserData: '',
        modelCount: '',
        isResourceShow: 0,
        unitDisable: '',
        modelClickData: '',
        obj: null,
        addUnitShow: false,
        editUnitShow: false,
        flag: false,
        checkAllFlag: false,
        checkAllHandler: false
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
          if (this.checkList.indexOf(newVal.selectedData) >= 0) {
            this.checkList.splice(this.checkList.indexOf(newVal.selectedData), 1);
          } else {
            this.checkList.push(newVal.selectedData);
          }
          this.getSingleAsset();
          this.getAssetData();
        },
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
      checkList(n) {
        if (n.length > 0 ) {
          this.pageObj.idcIds = n.join(',');
        } else {
          this.pageObj.idcIds = '';
        }
        this.getAssetData();
      }
    },
    created() {
      this.checkList.push(this.$store.state.assetData.selectedData)
      this.getSingleAsset()
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
        this.module = module;
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
          e.clientX + dw <= w - 10 ? e.clientX - 250 : e.clientX - 250 - dw;
        let positiony =
          e.clientY + dh <= h - 10
            ? e.clientY - 70
            : e.clientY - 70 - (e.clientY + dh - h);
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
      tagShow(data, id, type) {
        if (data === 'showAdd') {
          this.addUnitShow = true
        }
        if (data === 'showEdit') {
          this.editUnitShow = true
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
      }
      ,
      getSingleAsset() {
        let checkedCount = this.checkList.length;
        this.checkAllFlag = checkedCount === this.checkListData.length;
        this.checkAllHandler = checkedCount > 0 && checkedCount < this.checkListData.length;

        /*if (this.checkList.length > 0 ) {
          this.pageObj.idcIds = this.checkList.join(',');
        } else {
          this.pageObj.idcIds = '';
        }
        this.getAssetData();*/
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
          return data.name;
        } else if (data === '--') {
          return '-';
        } else {
          return "-";
        }
      },
      flushData() {
        // this.addUnitShow=false;
        // this.editUnitShow=false;
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
      }
    },
    mounted() {
      this.getUserData();
      this.getAssetData();
      this.getIDCOptionData();
      this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
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
  .asset .content-left .el-checkbox__input.is-focus .el-checkbox__inner,
  .asset .content-left .el-checkbox__input .el-checkbox__inner:hover,
  .asset .content-left .el-checkbox__input.is-checked .el-checkbox__inner,
  .asset .content-left .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    border-color: $global-text-color-active;
  }

  .asset .content-left .el-checkbox__input.is-checked + .el-checkbox__label {
    color: $global-text-color-active;
  }

  .asset .content-left .el-checkbox__input.is-checked .el-checkbox__inner, .asset .content-left .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: $global-text-color-active;
  }

</style>
