<template>
  <div class="asset">
    <div class="content-left">
      <div class="sidebar-title">Asset</div>
      <div class="sidebar-info">
        <!--<div class="sidebar-info-header">ALL</div>-->
        <el-checkbox-group v-model="checkList" size="small" @change="getSingleAsset()">
          <el-checkbox class="sidebar-info-item" :class="{'sidebar-info-item-active': checkList.indexOf(item.id) != -1}"
                       v-for="(item,key) in checkListData" :key="key" :label=item.id>
            <span>{{item.name}}</span>
            <idc-config-box :post-idc="addIdcData" placement="left" @after="getIDCOptionData" :button-class="'checkbox-edit'">
              <template v-slot:optionZone>
                <i class="el-icon-edit-outline" @click="getSingleIDCData(item.id,'edit')"></i>
              </template>
            </idc-config-box>
            <!--<el-popover
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
            </el-popover>-->
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>

    <div class="content-right">
      <div class="top-tools">
        <button @click.stop="tagShow('showAdd')" class="nz-btn nz-btn-size-normal nz-btn-style-normal float-right">
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
                <span @click.stop="elementsetShow('shezhi',$event)">
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
              <div class="tab-input-square link">{{scope.row.moduleNum}}</div>
            </div>
            <div v-if="item.prop=='Alert'">
              <div class="tab-input-square link">{{scope.row.alertNum}}</div>
            </div>
            <div v-if="item.prop=='dataCenter'">
              <idc-config-box :post-idc="JSON.parse(JSON.stringify(scope.row.idc))" placement="left" @after="getAssetData(null, true)" :button-class="'checkbox-edit'">
                <template v-slot:optionZone>
                  <span class="link">{{scope.row.idc.name}}</span>
                </template>
              </idc-config-box>
              <!--<span class="link">{{scope.row.idc.name}}</span>-->
            </div>
            <div v-if="item.prop=='cabinet'">
              <span class="link">{{returnData(scope.row.cabinet)}}</span>
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
              <span @click.stop="deleteData('asset',scope.row.id)" class="content-right-option"><i
                class="el-icon-delete"></i>
              </span>
              <span @click.stop="tagShow('showView',scope.row.id)" class="content-right-option"><i
                class="el-icon-view"></i>
              </span>
              <span @click.stop="tagShow('showEdit',scope.row.id)" class="content-right-option"><i
                class="el-icon-edit-outline"></i>
              </span>
              <span @click="ssss(scope.row.id ,scope.row.host)" class="content-right-option"><i
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
            label: this.$t("asset.tableTitle.endpoints"),
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
    },
    created() {
      this.checkList.push(this.$store.state.assetData.selectedData)
      this.getSingleAsset()

    },
    methods: {
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
        if (this.checkList.length > 0 ) {
          if (this.checkList[0] === '') {
            this.checkList.splice(0, 1);
            this.getSingleAsset();
          } else {
            this.pageObj.idcIds = this.checkList.join(',');
          }
        } else {
          this.pageObj.idcIds = '';
        }
        this.getAssetData();
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
        this.addUnitShow=false;
        this.editUnitShow=false;
        this.getSingleAsset();
        this.getAssetData();
        this.getIDCOptionData();
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

<style scoped>
  .asset {
    height: 100%;
  }
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

  .tab-input-square {
    border: 1px solid #1166bb;
    height: 25px;
    width: 65px;
    border-radius: 3px;
    text-align: center;
    line-height: 23px;
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
<style>
  .asset .content-left .el-checkbox__input.is-focus .el-checkbox__inner,
  .asset .content-left .el-checkbox__input .el-checkbox__inner:hover,
  .asset .content-left .el-checkbox__input.is-checked .el-checkbox__inner,
  .asset .content-left .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    border-color: #e07700;
  }

  .asset .content-left .el-checkbox__input.is-checked + .el-checkbox__label {
    color: #444;
  }

  .asset .content-left .el-checkbox__input.is-checked .el-checkbox__inner, .asset .content-left .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: #e07700;
  }


  .checkbox-edit {
    position: absolute;
    right: 10px;
    font-size: 16px;
  }
  .cell .checkbox-edit {
    position: static;
    font-size: 14px;
  }
</style>
