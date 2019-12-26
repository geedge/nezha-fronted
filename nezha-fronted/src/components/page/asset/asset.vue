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
                                             @click="editData('idc',item)">
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
                                <span @click="ssss(scope.row.id ,scope.row.host)" class="account-list-option"><i
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
                <asset-add-unit :add-unit-show='addUnitShow' @refreshData="flushData"
                                @sendStateData="tabControl"></asset-add-unit>
                <asset-edit-unit :edit-unit-show='editUnitShow' @refreshData="flushData" @sendStateData="tabControl"
                                 ref="assetEditUnit"></asset-edit-unit>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: "asset",
  data() {
    return {
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
      flag: false
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
      handler(oldVal, newVal) {
        this.checkList.splice(0, 1, newVal.selectedData);
        this.pageObj.idcIds = newVal.selectedData;
        this.getAssetData()
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
  },
  created() {
    this.checkList.push(this.$store.state.assetData.selectedData)
    this.getSingleAsset(this.checkList)

  },
  methods: {
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
    getAssetData(data) {
      this.$get('asset', this.pageObj).then(response => {
        if (response.code === 200) {
          this.tableData = response.data.list;
          this.pageObj.total = response.data.total
        }
      })
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
        const h = this.$createElement;
        if (res.code === 200) {
          this.$notify({
            message: h('i', {style: 'color: teal'}, '修改成功'),
            duration: 2000
          });
          this.getAssetData();
        } else {
          this.$notify({
            message: h('i', {style: 'color: teal'}, res.msg),
            duration: 2000
          })
        }
      })
    },
    addNewData(type) {
      if (type === 'IDC') {
        this.$post('idc', this.addIdcData).then(res => {
          const h = this.$createElement;
          if (res.code === 200) {
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, '添加成功'),
              duration: 2000
            });
            this.getIDCOptionData()
            this.getAssetData()
          } else {
            this.$notify({
              message: h('i', {style: 'color: teal'}, '添加成功'),
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
      let result = []
      if (data[0] === '') {
        result = data.slice(1);
        this.pageObj.idcIds = result.join(',')
      } else {
        this.pageObj.idcIds = data.join(',')
      }
      this.getAssetData()
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
      this.getAssetData();
      this.getIDCOptionData();
    },
  },
  mounted() {
    this.getUserData();
    this.getAssetData();
    this.getIDCOptionData();
  }
}
</script>
<style>

.el-popover {
    padding: 0;
    border-radius: 10px;
}

.el-form-style .el-form-item {
    margin-bottom: 0;
}

.el-form-style .el-form-item .el-form-item__content {
    height: 25px;
    font-size: 10px;
}

.el-checkbox.is-bordered + .el-checkbox.is-bordered {
    margin-left: 0;
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
    padding: 0 15px;
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


.pop-window {
    height: 370px;
    width: 400px;
}

.pop-window-assetType-content {
    padding: 1px 15px 15px 20px;
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
