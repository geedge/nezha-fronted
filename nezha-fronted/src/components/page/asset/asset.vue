<template>
    <div class="asset">
        <div class="content-left">
            <div class="sidebar-title">
                <div>Asset</div>
                <div class="sidebar-info">
                    <div class="sidebar-info-header">ALL</div>
                    <div class="sidebar-info-footer">
                        <el-checkbox-group v-model="checkList" size="small" @change="getSingleAsset(checkList)">
                            <el-checkbox v-for="(item,key) in checkListData" :key="key" border :label=item.id>
                                {{item.name}}
                                <el-popover
                                        placement="left"
                                        v-model="item[item.id]"
                                >
                                    <div class="pop-window-assetType-content">
                                        <div class="right-box-top-btns">
                                            <div class="right-box-top-btn right-box-top-btn-full"
                                                 @click="item[item.id] = false">
                                                <div class="right-box-btn-icon">
                                                    <i class="el-icon-close"></i>
                                                </div>
                                                <span>{{$t('overall.esc')}}</span>
                                            </div>
                                        </div>
                                        <div class="pop-window">
                                            <span style="display: block;padding-bottom: 20px">标题</span>
                                            <div style="padding-top: 10px;padding-left: 20px">
                                                <div>
                                                    <label style="font-size: 12px">DN name</label>
                                                    <input class='sidebar-pop-input' v-model="addIdcData.popName"/>
                                                </div>
                                                <div style="padding-top: 40px">
                                                    <label style="font-size: 12px">Loaction</label>
                                                    <input class='sidebar-pop-input' v-model="addIdcData.location"/>
                                                </div>
                                                <div style="padding-top: 40px">
                                                    <label style="font-size: 12px;padding-right: 20px">负责人</label>
                                                    <select class='sidebar-pop-input-select'
                                                            style="margin-left:-40px "
                                                            v-model="addIdcData.principal"
                                                            clearable>
                                                        <option
                                                                v-for="item in idcUserData"
                                                                :key="item.key"
                                                                :label="item.username"
                                                                :value="item.userId"
                                                        >
                                                        </option>
                                                    </select>
                                                </div>
                                                <div style="padding-top: 40px">
                                                    <label style="font-size: 12px">Tel</label>
                                                    <input class='sidebar-pop-input' v-model="addIdcData.tel"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="right-box-bottom-btns">
                                        <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                                             @click.stop="item[item.id]= false">
                                            {{$t('overall.cancel')}}
                                        </div>
                                        <div class="right-box-bottom-btn right-box-bottom-btn-50"
                                             @click="addNewData('IDC')">
                                            {{$t('overall.save')}}
                                        </div>
                                    </div>
                                    <span class="checkbox-edit" slot="reference"
                                          @click.prevent="getSingleIDCData(item.id,'edit')"><i
                                            class="el-icon-edit-outline"></i></span>
                                </el-popover>
                            </el-checkbox>
                        </el-checkbox-group>
                    </div>
                </div>
            </div>
        </div>
        <div class="content-right">
            <div>
                <button style="float: right;margin-top: 10px;width: 100px;height: 32px;margin-left: 10px"
                        @click.stop="tagShow('showAdd')">+ADD
                </button>
                <el-input
                        type="text"
                        :placeholder="$t('overall.search')"
                        size="small"
                        style="width: 200px;float: right;padding-top: 10px"

                >
                </el-input>
            </div>
            <div>
                <el-table
                        :height="tableHeight"
                        :data="this.tableData"
                >
                    <el-table-column
                            v-for="(item, index) in tableTitle"
                            v-if="item.show"
                            min-width="110"
                            :key="`col_${index}`"
                            :label="item.label"
                    >
                        {{item}}
                        <template slot-scope="scope" :column="item">
                            <div v-if="item.prop=='ID'">
                                <p>
                                    <span>{{scope.row.id}}</span>
                                </p>
                            </div>
                            <div v-if="item.prop=='资产类型'">
                                <p>
                                    <span>{{scope.row.model.type.value}}</span>
                                </p>
                            </div>
                            <div v-if="item.prop=='SN'">
                                <p>
                                    <span>{{scope.row.sn}}</span>
                                </p>
                            </div>
                            <div v-if="item.prop=='HOST'">
                                <p>
                                    <span>{{scope.row.host}}</span>
                                </p>
                            </div>
                            <div v-if="item.prop=='资产状态'">
                                <p>
                                    <span>{{scope.row.state==1?'在库':'出库'}}</span>
                                </p>
                            </div>
                            <div v-if="item.prop=='Module'">
                                <p>
                  <span>
                    <div class="tab-input-square">{{scope.row.moduleNum}}</div>
                  </span>
                                </p>
                            </div>
                            <div v-if="item.prop=='Alert'">
                                <p>
                  <span>
                    <div class="tab-input-square">{{scope.row.alertNum}}</div>
                  </span>
                                </p>
                            </div>
                            <div v-if="item.prop=='数据中心'">
                                <p>
                                    <span>{{scope.row.idc.name}}</span>
                                </p>
                            </div>
                            <div v-if="item.prop=='机柜'">
                                <p>
                                    <span>{{returnData(scope.row.cabinet)}}</span>
                                </p>
                            </div>
                            <div v-if="item.prop=='型号'">
                                <p>
                                    <span>{{scope.row.model.name}}</span>
                                </p>
                            </div>
                            <div v-if="item.prop=='厂商'">
                                <p>
                                    <span>{{scope.row.model.vendor.value}}</span>
                                </p>
                            </div>
                            <div v-if="item.prop=='购买日期'">
                                <p>
                                    <span>{{scope.row.purchaseDate}}</span>
                                </p>
                            </div>
                            <div v-if="item.prop=='责任人'">
                                <p>
                                    <span>{{getPrincipalName(scope.row.idc.principal)}}</span>
                                </p>
                            </div>
                            <div v-if="item.prop=='责任人电话'">
                                <p>
                                    <span>{{scope.row.idc.tel}}</span>
                                </p>
                            </div>
                            <div v-if="item.prop == 'option'">
                <span @click="ssss(scope.row.id)" class="account-list-option"><i
                        class="el-icon-monitor"></i></span>
                                <span @click.stop="deleteData('asset',scope.row.id)" class="account-list-option"><i
                                        class="el-icon-delete"></i></span>
                                <span @click.stop="tagShow('showEdit',scope.row.id)" class="account-list-option"><i
                                        class="el-icon-edit-outline"></i></span>
                                <span @click.stop="tagShow('showView',scope.row.id)" class="account-list-option"><i
                                        class="el-icon-view"></i></span>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
                <Pagination :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
                <asset-add-unit :add-unit-show='addUnitShow' @refreshData="flushData" @sendStateData="tabControl"></asset-add-unit>
                <asset-edit-unit :edit-unit-show='editUnitShow'  @refreshData="flushData"  @sendStateData="tabControl" ref="assetEditUnit"></asset-edit-unit>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: "asset",
  data() {
    return {
      vendorModelData: '',
      cabinetModelData: '',
      checkList: [],
      tableTitle: [
        {
          label: this.$t("asset.tableTitle.id"),
          prop: 'ID',
          show: false,
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
        }, {
          label: this.$t("asset.tableTitle.assetState"),
          prop: '资产状态',
          show: true,
        }, {
          label: this.$t("asset.tableTitle.module"),
          prop: 'Module',
          show: true,
        }, {
          label: this.$t("asset.tableTitle.alert"),
          prop: 'Alert',
          show: true,
        }, {
          label: this.$t("asset.tableTitle.dataCenter"),
          prop: '数据中心',
          show: true,
        }, {
          label: this.$t("asset.tableTitle.cabinet"),
          prop: '机柜',
          show: true,
        }, {
          label: this.$t("asset.tableTitle.model"),
          prop: '型号',
          show: true,
        }, {
          label: this.$t("asset.tableTitle.manufacturer"),
          prop: '厂商',
          show: true,
        }, {
          label: this.$t("asset.tableTitle.procurementDate"),
          prop: '购买日期',
          show: true,
        }, {
          label: this.$t("asset.tableTitle.principal"),
          prop: '责任人',
          show: true,
        }, {
          label: this.$t("asset.tableTitle.principalTel"),
          prop: '责任人电话',
          show: true,
        }, {
          label: this.$t('config.account.option'),
          prop: 'option',
          show: true,
        }],
      tableData: [],
      checkListData: [],
      assetTypeOptionData: [],
      vendorTypeData: '',
      vendorTypeOptionData: [],
      vendorUlData: '',
      modelUlData: '',
      vendorCode: '',
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
      form: {
        name: ''
      },
      rightBox: { //弹出框相关
        show: false,
        isEdit: false, //false查看，true编辑
        title: ''
      },
      assetType: '',
      assetTypeData: {
        type: 'assetType',
        value: '',
      },
      addVendorData: {
        type: 'vendor',
        value: '',
      },
      addNewModelData: {
        name: '',
        vendorCode: '',
        typeCode: ''
      },
      accountType: '',
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
      cabinetSelectedData: {
        name: '',
        uSize: 0,
        remark: '',
        idcId: '',
      },
      addCabinetData: {
        name: '',
        popName: '',
        uSize: 0,
        remark: '',
        idcId: '',
      },
      popTypeVisible: false,
      popCompVisible: false,
      popIDCVisible: false,
      popCabinetVisible: false,

      editPopTypeVisible: false,
      editPopVendorVisible: false,
      editPopIDCVisible: false,
      editPopCabinetVisible: false,
      vendorCount: '',
      modelCount: '',
      allModelUlData: '',
      addForm: {
        sn: '',
        host: '',
        state: '',
      },
      tempData: '',
      tempModelData: [],
      isResourceShow: 0,
      unitDisable: '',
      modelClickData: '',
      popState: true,
      obj: null,
      addUnitShow: false,
      editUnitShow: false,
    }
  },
  computed: {
    getData() {
      return this.$store.state.assetData
    }
  },
  watch: {
    getData: {
      handler(oldVal,newVal) {
        console.log(oldVal,newVal)
        this.checkList.splice(0, 1, newVal.selectedData)
        this.pageObj.idcIds = newVal.selectedData
        this.getAssetData()
      },
      deep: true,
    },
    allModelUlData(newVal) {
      if (newVal) {
        this.getConnectData()
        if (this.pageObj.id != '') {
          this.assetData.modelId = [this.obj.model.vendor.code, this.obj.model.id]
        }
      }
    },
    assetType(newVal) {
      if (newVal == '') {
        this.popState = true
      } else {
        this.popState = false
      }
    },
  },
  methods: {
    ssss(data) {
      let routeData = this.$router.resolve({
        name: "terminal",
        query: {id: data}
      });
      window.open(routeData.href);
    },
    getAssetData(data) {
      if (data !== undefined) {
        this.pageObj.id = data
        this.$get('asset', this.pageObj).then(response => {
          if (response.code === 200) {
            this.obj = response.data.list[0];
            this.assetViewData.assetType = response.data.list[0].model.type.value
            this.assetViewData.vendor = response.data.list[0].model.vendor.value
            this.assetViewData.model = response.data.list[0].model.name
            this.assetViewData.idcName = response.data.list[0].idc.name
            this.assetViewData.cabinetName = response.data.list[0].cabinet == null ? '' : response.data.list[0].cabinet.name
            this.assetViewData.moduleNum = response.data.list[0].moduleNum
            this.assetViewData.alertNum = response.data.list[0].alertNum
            this.assetViewData.cabinetName = response.data.list[0].cabinet == null ? '' : response.data.list[0].cabinet.name
            this.getCabinetOptionData(response.data.list[0].idc.id)
            this.assetType = response.data.list[0].model.type.code
            this.assetData.sn = response.data.list[0].sn
            this.assetData.host = response.data.list[0].host
            this.assetData.state = response.data.list[0].state
            this.assetData.idcId = response.data.list[0].idc.id
            this.assetData.cabinetId = response.data.list[0].cabinet == null ? '' : response.data.list[0].cabinet.id
            this.assetData.purchaseDate = response.data.list[0].purchaseDate
            this.idcSelectedData.location = response.data.list[0].idc.location
            this.idcSelectedData.principal = this.getPrincipalName(response.data.list[0].idc.principal)
            this.idcSelectedData.tel = response.data.list[0].idc.tel
            this.cabinetSelectedData.uSize = response.data.list[0].cabinet == null ? '' : response.data.list[0].cabinet.uSize
            this.cabinetSelectedData.remark = response.data.list[0].cabinet == null ? '' : response.data.list[0].cabinet.remark
            this.getAllModelOptionData(this.assetType)
          }
        })
      } else {
        this.pageObj.id = ''
        this.$get('asset', this.pageObj).then(response => {
          if (response.code === 200) {
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total
          }
        })
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
    getCabinetOptionData(data) {
      this.$get('cabinet?idcId=' + data).then(response => {
        if (response.code === 200) {
          this.cabinetOptionData = response.data.list;
          this.markOptionData(this.cabinetOptionData)
        }
      })
    },
    getAssetTypeOptionData() {
      this.$get('sys/dict/all?type=assetType').then(response => {
        if (response.code === 200) {
          this.assetTypeOptionData = response.data
          this.markOptionData(this.assetTypeOptionData)
        }
      })
    },
    getVendorOptionData() {
      this.$get('sys/dict/all?type=vendor').then(response => {
        if (response.code === 200) {
          this.vendorUlData = response.data
          this.markOptionData(this.vendorUlData)
        }
      })
    },
    getModelOptionData(assetType, vendorCode) {
      this.$get('model?typeCode=' + assetType + '&vendorCode=' + vendorCode).then(response => {
        if (response.code === 200) {
          this.modelUlData = response.data.list
          this.markOptionData(this.modelUlData)
        }
      })
    },
    getAllModelOptionData(data) {
      this.$get('model?typeCode=' + this.assetType).then(response => {
        if (response.code === 200) {
          this.allModelUlData = response.data.list
        }
      })
    },
    editData(data, item) {
      let obj = {
        id: '',
        type: '',
        value: '',
        code: ''
      }
      if (data === 'asset') {
        this.assetData.modelId = this.assetData.modelId.join(',').split(',')[1]
        this.$put('asset', this.assetData).then(res => {
          if (res.code === 200) {
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, '修改成功'),
              duration: 2000
            });
            this.pageObj.id = ''
            this.getAssetData();
          }
        })
      } else {
        if (data === 'model') {
          item.vendorCode = this.vendorCode
          item.typeCode = this.assetType
        }
        if (data === 'vendor') {
          obj.id = item.id
          obj.code = item.code
          obj.type = item.type
          obj.value = item.label
          data = 'sys/dict/update'
          item = obj
        }
        if (data === 'cabinet') {
          item.name = this.addCabinetData.popName
        }
        if (data === 'idc') {
          console.log(item)
          item.name = this.addIdcData.popName
        }
        this.$put(data, item).then(res => {
          if (res.code === 200) {
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, '修改成功'),
              duration: 2000
            })
            this.getAssetData();
            this.getAllModelOptionData();
          }
        })
      }
    },
    addNewData(type) {
      if (type === 'IDC') {
        console.log(this.addIdcData)
        this.$post('idc', this.addIdcData).then(res => {
          if (res.code === 200) {
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, '添加成功'),
              duration: 2000
            });
            this.getIDCOptionData()
            this.getAssetData()
          }
        })
      }
      if (type === 'assetType') {
        this.$post('sys/dict/save', this.assetTypeData).then(res => {
          if (res.code === 200) {
            this.getAssetTypeOptionData()
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, '添加成功'),
              duration: 2000
            });
          }
        })
      }
      if (type === 'asset') {
        console.log(this.assetData)
        this.assetData.modelId = this.assetData.modelId.join(',').split(',')[1]
        this.$post('asset', this.assetData).then(res => {
          if (res.code === 200) {
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, '添加成功'),
              duration: 2000
            });
            this.getAssetData();
          }
        })
      }
      if (type === 'vendor') {
        this.$post('sys/dict/save', this.addVendorData).then(res => {
          if (res.code === 200) {
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, '添加成功'),
              duration: 2000
            });
            this.getVendorOptionData()
          }
        })
      }
      if (type === 'model') {
        this.addNewModelData.typeCode = this.assetType
        this.addNewModelData.vendorCode = this.vendorCode
        this.$post('model', this.addNewModelData).then(res => {
          if (res.code === 200) {
            this.getModelOptionData(this.assetType, this.vendorCode)
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, '添加成功'),
              duration: 2000
            });
            this.getAllModelOptionData(this.assetType)
          } else {
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, res.msg),
              duration: 2000
            });
          }
        })
      }
      if (type === 'cabinet') {
        this.addCabinetData.idcId = this.assetData.idcId
        this.$post('cabinet', this.addCabinetData).then(res => {
          const h = this.$createElement;
          if (res.code === 200) {
            this.$notify({
              message: h('i', {style: 'color: teal'}, '添加成功'),
              duration: 2000
            });
            this.getCabinetOptionData(this.addCabinetData.idcId)
            this.popoverClose('cabinet')
          } else {
            this.$notify({
              message: h('i', {style: 'color: teal'}, res.msg),
              duration: 2000
            });
          }
        })
      }
    },
    deleteData(data, item) {
      this.$delete(data + "?ids=" + item).then(response => {
        const h = this.$createElement;
        if (response.code === 200) {
          this.$notify({
            message: h('i', {style: 'color: teal'}, '删除成功'),
            duration: 2000
          });
          this.getAssetData()
          this.getIDCOptionData()
          this.getVendorOptionData()
          this.getCabinetOptionData(this.assetData.idcId)
          this.getAllModelOptionData(this.assetType)
          this.getModelOptionData(this.assetType, this.vendorCode)
        } else {
          this.$notify({
            message: h('i', {style: 'color: teal'}, response.msg),
            duration: 2000
          });
        }
      })
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
    getConnectData() {
      this.isResourceShow += 1
      let resultData = []
      let modelData = this.allModelUlData
      for (let i = 0; i < modelData.length; i++) {
        let obj = {}
        obj.id = modelData[i].vendor.id
        obj.code = modelData[i].vendor.code
        obj.value = modelData[i].vendor.code
        obj.label = modelData[i].vendor.value
        obj.children = []
        resultData.push(obj)
      }
      var result = [];
      var obj1 = {};
      for (let i = 0; i < resultData.length; i++) {
        if (!obj1[resultData[i].id]) {
          result.push(resultData[i]);
          obj1[resultData[i].id] = true;
        }
      }
      for (let x = 0; x < result.length; x++) {
        for (let y = 0; y < modelData.length; y++) {
          if (result[x].code === modelData[y].vendor.code) {
            let obj2 = {}
            obj2.value = modelData[y].id
            obj2.label = modelData[y].name
            result[x].children.push(obj2)
          }
        }
      }
      this.vendorTypeOptionData = result
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
      }
    },
    tagShow(data, id, type) {
      if(data === 'showAdd'){
        this.addUnitShow = true
      }
      if(data === 'showEdit'){
        this.editUnitShow = true
        this.$refs['assetEditUnit'].getAssetData(id)
      }
      if(data === 'showView'){
        this.editUnitShow = true
        this.$refs['assetEditUnit'].tabView=true
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
        this.getCabinetOptionData(this.assetData.idcId);
        this.assetData.cabinetId = ''
        this.cabinetSelectedData.uSize = ''
        this.cabinetSelectedData.remark = null
      } else {
        this.IDCOptionData.forEach(item => {
          if (item.id === data) {
            this.addIdcData.popName = item.name
            this.addIdcData.location = item.location
            this.addIdcData.principal = item.principal
            this.addIdcData.tel = item.tel
          }
        });
      }
    }
    ,
    getSingleAsset(data) {
      console.log(data)
      // let regPos = /^\d+(\.\d+)?$/;
      // if(!regPos.test(data)){
      //   this.pageObj.idcIds = data
      // }else{
      this.pageObj.idcIds = data.join(',')
      // }
      this.getAssetData()
    },
    getLidata(index, item) {
      this.vendorCount = index;
      this.vendorCode = item.code;
      this.getModelOptionData(this.assetType, this.vendorCode)
    }
    ,
    pageNo(val) {
      this.pageObj.pageNo = val;
      this.getAssetData()
    }
    ,
    pageSize(val) {
      this.pageObj.pageSize = val;
      this.getAssetData()
    },
    popoverClose(data) {
      if (data === 'type') {
        this.modelCount = ''
        this.popTypeVisible = false
      }
      if (data === 'vendor') {
        this.popCompVisible = false;
        this.modelUlData = '';
        this.vendorCount = ''
      }
      if (data === 'idc') {
        this.popIDCVisible = false
      }
      if (data === 'cabinet') {
        this.popCabinetVisible = false
      }
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
      this.getAssetData();
      this.getIDCOptionData();
    },
  },
  mounted() {
    this.getCabinetOptionData('')
    this.getUserData()
    this.getAssetData();
    this.getIDCOptionData();
    this.getVendorOptionData();
    this.getAssetTypeOptionData();
    window.onresize = () => {
      this.tableHeight = document.documentElement.clientHeight - 200;
    }
    // let terminalContainer = document.getElementById('terminal-container')
    // let term = new Terminal()
    // term.open(terminalContainer)
  }
}
</script>
<style>
.el-table {
    font-size: 10px;
}

.el-popover {
    padding: 0px;
    border-radius: 10px;
}

.el-form-style .el-form-item {
    margin-bottom: 0px;
}

.el-form-style .el-form-item .el-form-item__content {
    height: 25px;
    font-size: 10px;
}

.el-checkbox.is-bordered + .el-checkbox.is-bordered {
    margin-left: 0px;
    margin-top: 20px;
}

.el-divider--horizontal {
    margin: 15px;
}

.el-checkbox-group {
    padding-top: 10px;
}

.el-checkbox {
    width: 270px;
}

.select-style .el-select .el-input .el-input__inner {
    width: 400px
}

.el-scrollbar .el-input {
    width: 200px
}
</style>
<style scoped>
.sidebar-pop-input {
    position: absolute;
    right: 50px;
    width: 200px;
    height: 26px;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    color: #606266;
    display: inline-block;
    padding: 0px 15px;
}

.sidebar-pop-input-select {
    position: absolute;
    right: 83px;
    width: 200px;
    height: 26px;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    color: #606266;
    display: inline-block;
    padding: 0px 15px;
}

.content-left {
    float: left;
    width: 370px;
    height: 100%;
}

.content-right {
    margin-left: 370px;
}

.sidebar-title {
    padding-left: 30px;
    padding-top: 20px;
}

.sidebar-info {

    margin-top: 20px;
    border: 1px solid #acacac;
    border-radius: 8px;
    height: calc(90vh - 55px);
    width: calc(100% - 8px);
}

.sidebar-info-header {
    background: #acacac;
    text-align: center;
    line-height: 50px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    height: 60px;
    width: 100%;
}

.sidebar-info-footer {
    padding-top: 15px;
    padding-left: 15px;
}

.checkbox-edit {
    position: absolute;
    top: 8px;
    left: 230px;
}

.el-form-style {
    padding-top: 40px;
}

.right-menu {
    position: fixed;
    top: 60px;
    right: 0;
    z-index: 500;
    border-radius: 8px;
    box-shadow: 0 0 15px #ccc;
    background-color: white;
    padding: 0 20px;
    width: 580px;
    height: calc(90% - 60px);
    overflow-y: auto
}

.tab-input-square {
    border: 1px solid #aaaaaa;
    height: 25px;
    width: 65px;
    border-radius: 3px;
    text-align: center;
    margin-top: 6px;
    line-height: 23px;
    color: #aaaaaa;
}

.account-list-option {
    cursor: pointer;
    display: inline-block;
    margin-right: 6px;
}

.right-box-top-btns {
    text-align: center;
}

.right-box-top-btn {
    border-radius: 0 0 9px 9px;
    float: right;
    color: #656565;
    height: 30px;
    font-size: 12px;
    padding: 3px 8px 1px 8px;
    border: 1px solid #aaaaaa;
    border-top: none;
    cursor: pointer;
    margin-left: 20px;
}

.right-box-top-btn-full {
    background-color: #656565;
    border: 1px solid #656565;
    border-top: none;
    color: white;
}

.right-box-title {
    height: 30px;
    line-height: 40px;
}

.el-select-add-btn {
    display: inline-block;
    width: 26px;
    height: 26px;
    float: right;
    margin-top: 7px;
    text-align: center;
    border-radius: 5px;
    border: 1px solid #DCDFE6;
    box-sizing: border-box;
    color: #C7C9CE;
    line-height: 22px;
    transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
}

.el-select-add-btn:hover {
    border: 1px solid #C0C4CC;
    cursor: pointer;
}

.pop-window {
    height: 370px;
    width: 400px;
}

.pop-window-assetType {
    height: 550px;
    width: 400px;
}

.pop-window-assetType-content {
    padding: 1px 15px 15px 20px;
}

.li-list {
    width: 97%;
    height: 300px;
    border: 1px solid #cfcfcf;
    overflow-y: auto;
}

.li-list-part {
    width: 90%;
    height: 130px;
    border: 1px solid #cfcfcf;
    overflow-y: auto;
}

.rm-c-list span:hover {
    background-color: #888;
    color: #fff;
}

.right-box-bottom-btn {
    display: inline-block;
    background-color: #656565;
    color: white;
    line-height: 35px;
    cursor: pointer;
    text-align: center;
}

.right-box-bottom-btns {
    position: absolute;
    bottom: 0px;
    width: 100%;
    text-align: center;
}

.right-box-bottom-btn-cancel {
    background-color: #DADADA;
    color: #656565;
    width: 50%;
    border-bottom-left-radius: 8px;
}

.right-box-bottom-btn-50 {
    width: 50%;
    float: right;
    border-bottom-right-radius: 8px;
}

.activeColor {
    background-color: #409EFF;
}

@keyframes slide-in-from-right {
    from {
        right: -800px
    }
    to {
        right: 0
    }
}

@keyframes slide-out-to-right {
    from {
        right: 0
    }
    to {
        right: -800px
    }
}

.right-box-enter-active {
    animation: slide-in-from-right 0.4s;
}

.right-box-leave-active {
    animation: slide-out-to-right 0.4s;
}
</style>
