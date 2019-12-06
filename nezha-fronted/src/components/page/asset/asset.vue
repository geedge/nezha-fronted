<template>
    <div class="asset">
        <div class="content-left">
            <div class="sidebar-title">
                <div>Project</div>
                <div class="sidebar-info">
                    <div class="sidebar-info-header">ALL</div>
                    <div class="sidebar-info-footer">
                        <el-checkbox-group v-model="checkList" size="small">
                            <el-checkbox v-for="(item,key) in checkListData" :key="key" border :label=item.id>{{item.name}}
                                <div class="checkbox-edit" @click.prevent="edit(item.id)">编辑</div>
                            </el-checkbox>
                        </el-checkbox-group>
                    </div>
                </div>
            </div>
        </div>
        <div class="content-right">
            <el-input
                    class="account-list-search"
                    type="text"
                    :placeholder="$t('overall.search')"
                    size="small"
            ></el-input>
            <div>
                <el-table
                        :height="tableHeight"
                        :data="this.tableData"
                >
                    <el-table-column
                            v-for="(item, index) in tableTitle"
                            v-if="item.show"
                            min-width="120"
                            :key="`col_${index}`"
                            :label="item.label"
                    >
                        {{item}}
                        <template slot-scope="scope" :column="item">
                            <div v-if="item.prop=='ID'">
                                <p>
                                    <span>{{scope.row['id']}}</span>
                                </p>
                            </div>
                            <div v-if="item.prop=='IP'">
                                <p>
                                    <span>{{scope.row['host']}}</span>
                                </p>
                            </div>
                            <div v-if="item.prop == 'option'" class="account-list-options">
                                <span @click.stop="tagShow('showDel')" class="account-list-option"><i class="el-icon-delete"></i></span>
                                <span @click.stop="tagShow('showEdit')" class="account-list-option"><i class="el-icon-view"></i></span>
                                <span @click.stop="tagShow('showView')" class="account-list-option"><i class="el-icon-edit-outline"></i></span>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
                <Pagination :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
                <transition name="right-box" @click.stop>
                    <div class="right-menu" v-if="tabShow" v-clickoutside:tagHide="tagShow">
                        <div v-if="this.tagType=='add'">
                            <el-form ref="form" :model="form" label-width="120px">
                                <div class="right-box__top-btns">
                                    <div class="right-box__top-btn right-box__top-btn_full" @click="tagShow()">
                                        <div class="right-box__btn-icon">
                                            <i class="el-icon-close"></i>
                                        </div>
                                        <span>Esc</span>
                                    </div>
                                    <div class="right-box__top-btn right-box__top-btn_full">
                                        <div class="right-box__btn-icon">
                                            <i class="el-icon-edit-outline"></i>
                                        </div>
                                        <span>Save</span>
                                    </div>
                                    <div class="right-box__top-btn">
                                        <div class="right-box__btn-icon">
                                            <i class="el-icon-delete"></i>
                                        </div>
                                        <span>Delete</span>
                                    </div>
                                </div>
                                <div class="el-form-style">
                                    <el-form-item label="IP">
                                        <el-input v-model="form.name"/>
                                    </el-form-item>
                                    <el-form-item label="SN">
                                        <el-input v-model="form.name"/>
                                    </el-form-item>
                                    <el-form-item label="Asset Type">
                                        <el-input v-model="form.name"/>
                                    </el-form-item>
                                    <el-form-item label="ModelId">
                                        <el-input v-model="form.name"/>
                                    </el-form-item>
                                    <el-form-item label="IDC">
                                        <el-input v-model="form.name"/>
                                    </el-form-item>
                                    <el-form-item label="Cabinet">
                                        <el-input v-model="form.name"/>
                                    </el-form-item>
                                    <el-form-item label="Host">
                                        <el-input v-model="form.name"/>
                                    </el-form-item>
                                    <el-form-item label="State">
                                        <el-input v-model="form.name"/>
                                    </el-form-item>
                                    <el-form-item>
                                        <el-button>取消</el-button>
                                    </el-form-item>
                                </div>
                            </el-form>
                        </div>
                        <div v-if="this.tagType=='edit'">
                            <el-form ref="form" :model="form" label-width="120px" size="small" >
                                <div class="right-box__top-btns">
                                    <div class="right-box__top-btn right-box__top-btn_full" @click="tagShow()">
                                        <div class="right-box__btn-icon">
                                            <i class="el-icon-close"></i>
                                        </div>
                                        <span>Esc</span>
                                    </div>
                                    <div class="right-box__top-btn right-box__top-btn_full">
                                        <div class="right-box__btn-icon">
                                            <i class="el-icon-edit-outline"></i>
                                        </div>
                                        <span>Save</span>
                                    </div>
                                    <div class="right-box__top-btn">
                                        <div class="right-box__btn-icon">
                                            <i class="el-icon-delete"></i>
                                        </div>
                                        <span>Delete</span>
                                    </div>
                                </div>
                                <div class="el-form-style">
                                    <el-form-item label="IP">
                                        <span>192.168.100.255</span>
                                    </el-form-item>
                                    <el-form-item label="SN">
                                        <span>AAQWEROIUOWENKOIZLNWEROFPIAN</span>
                                    </el-form-item>
                                    <el-form-item label="Asset Type">
                                        <span>服务器</span>
                                    </el-form-item>
                                    <el-form-item label="ModelId">
                                        <span>No1</span>
                                    </el-form-item>
                                    <el-form-item label="IDC">
                                        <span>国内地区/北京市/1号</span>
                                    </el-form-item>
                                    <el-form-item label="Cabinet">
                                        <span>13排223机柜</span>
                                    </el-form-item>
                                    <el-form-item label="Host">
                                        <span>192.158.22.22</span>
                                    </el-form-item>
                                    <el-form-item label="State">
                                        <span>在库</span>
                                    </el-form-item>
                                    <el-form-item label="Alarm">
                                        <div>111</div>
                                    </el-form-item>
                                </div>
                                <div style="padding-top: 10px">
                                    <span>endPoint:</span>
                                </div>
                                <div class="tag-table">
                                    <el-table
                                            :data="tagTableData"
                                            :row-style="{height:'20px'}"
                                            :cell-style="{padding:'2px'}"
                                    >
                                        <el-table-column
                                                v-for="(item, index) in tagTableTitle"
                                                v-if="item.show"
                                                :key="`col_${index}`"
                                                :label="item.label"

                                        >
                                            <template slot-scope="scope" :column="item">
                                                <div v-if="item.prop=='projectName'">
                                                    <p>
                                                        <span>{{scope.row['projectName']}}</span>
                                                    </p>
                                                </div>
                                                <div v-if="item.prop=='moduleName'">
                                                    <p>
                                                        <span>{{scope.row['moduleName']}}</span>
                                                    </p>
                                                </div>
                                                <div v-if="item.prop=='endPoint'">
                                                    <div class="tableSquare">342</div>
                                                </div>
                                                <div v-if="item.prop=='alarm'">
                                                    <div class="tableSquare">{{11}}/{{111}}</div>
                                                </div>
                                            </template>

                                        </el-table-column>
                                        <el-table-column
                                                fixed="right"
                                                label=""
                                                width="100">
                                            <template slot-scope="scope">
                                                <el-button type="text" size="small" @click.stop="tagShow('showAdd')">查看
                                                </el-button>
                                                <el-button type="text" size="small" @click.stop="tagShow('showEdit')">编辑
                                                </el-button>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                    <!--                            <Pagination :pageobj="pageObj" ref="Pagination"></Pagination>-->
                                    <el-divider></el-divider>
                                    <span>默认CLI账户</span>
                                    <div style="padding-top: 10px">
                                        <el-select v-model="form.region" placeholder="请选择活动区域" style="width: 90%">
                                            <el-option label="区域一" value="shanghai">111111111111111111111</el-option>
                                            <el-option label="区域二" value="beijing">111111111111111111111</el-option>
                                            <el-option label="区域二" value="beijing">111111111111111111111</el-option>
                                            <el-option label="区域二" value="beijing">111111111111111111111</el-option>
                                        </el-select>
                                    </div>
                                </div>
                                <div class="el-form-style">
                                    <el-form-item label="IP">
                                        <span>192.168.100.255</span>
                                    </el-form-item>
                                    <el-form-item label="SN">
                                        <span>AAQWEROIUOWENKOIZLNWEROFPIAN</span>
                                    </el-form-item>
                                    <el-form-item label="Asset Type">
                                        <span>服务器</span>
                                    </el-form-item>
                                    <el-form-item label="ModelId">
                                        <span>No1</span>
                                    </el-form-item>
                                    <el-form-item label="IDC">
                                        <span>国内地区/北京市/1号</span>
                                    </el-form-item>
                                </div>
                            </el-form>
                        </div>
                    </div>
                </transition>
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
      checkListData: [],
      sidebarState:'',
      tableTitle: [
        {
          label: this.$t("asset.tableTitle.id"),
          prop: 'ID',
          show: true,
        }, {
          label: this.$t("asset.tableTitle.assetType"),
          prop: '资产类型',
          show: true,
        }, {
          label: this.$t("asset.tableTitle.device"),
          prop: 'Device SN',
          show: true,
        }, {
          label: this.$t("asset.tableTitle.ip"),
          prop: 'IP',
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
          label: this.$t("asset.tableTitle.alarm"),
          prop: 'Alarm',
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
          prop: '采购日期',
          show: true,
        }, {
          label: this.$t("asset.tableTitle.warrantyDate"),
          prop: '保修截止期',
          show: true,
        }, {
          label: this.$t("asset.tableTitle.deviceDuty"),
          prop: '设备责任人',
          show: true,
        }, {
          label: this.$t('config.account.option'),
          prop: 'option',
          show: true,
        }],
      tagTableTitle: [
        {
          label: this.$t("asset.tagTableTitle.projectName"),
          prop: 'projectName',
          show: true,
        }, {
          label: this.$t("asset.tagTableTitle.moduleName"),
          prop: 'moduleName',
          show: true,
        }, {
          label: this.$t("asset.tagTableTitle.endPoint"),
          prop: 'endPoint',
          show: true,
        }, {
          label: this.$t("asset.tagTableTitle.alarm"),
          prop: 'alarm',
          show: true,
        },
      ],
      tableData: [],
      tagTableData: [
        {
          projectName: '2016-05-02',
          moduleName: '王小虎',
          endPoint: '上海市普陀区金沙江路 1518 弄'
        }, {
          projectName: '2016-05-04',
          moduleName: '王小虎',
          endPoint: '上海市普陀区金沙江路 1517 弄'
        }, {
          projectName: '2016-05-01',
          moduleName: '王小虎',
          endPoint: '上海市普陀区金沙江路 1519 弄'
        }, {
          projectName: '2016-05-03',
          moduleName: '王小虎',
          endPoint: '上海市普陀区金沙江路 1516 弄'
        }, {
          projectName: '2016-05-02',
          moduleName: '王小虎',
          endPoint: '上海市普陀区金沙江路 1518 弄'
        }
      ],
      input: '',
      pageObj: {
        pageNo: 1,
        pageSize: 20,
        total: 0,
      },
      tableHeight:document.documentElement.clientHeight-200,
      tabShow: false,
      tagType: 'add',
      form: {
        name: ''
      },
      searchObj: {
        idcId: 7
      }
    }
  },
  computed:{
    getData(){
      return this.$store.state.assetData
    }
  },
  watch:{
    getData:{
      handler(newVal,oldVal){
        this.checkList.splice(1,1,newVal.selectedData)
        if(newVal.moduleData=='asset'){
          this.sidebarState=true
        }else{
          this.sidebarState=false
          this.getAssetData();
          this.checkListData=[0]
        }
      },
      deep: true,
    },
  },
  methods: {
    getAssetData() {
      this.$get('idc', this.pageObj).then(response => {
        if (response.code == 200) {
          this.checkListData = response.data.list
        }
      })
    },
    getListData() {
      this.$get('asset', this.pageObj).then(response => {
        if (response.code === 200) {
          this.tableData = response.data.list;
          this.pageObj.total = response.data.total
        }
      })
    },
    tagShow(t) {
      this.tabShow = false;
      if (t === 'showAdd') {
        this.tabShow = true;
        this.tagType = 'add'
      }
      if (t === 'showEdit') {
        this.tabShow = true;
        this.tagType = 'edit'
      }
    },
    pageNo(val) {
      this.pageObj.pageNo = val;
      this.getListData()
    },
    pageSize(val) {
      this.pageObj.pageSize = val;
      this.getListData()
    }
  },

  mounted() {
    this.getListData();
    this.getAssetData();
    window.onresize = () => {
      this.tableHeight = document.documentElement.clientHeight-200;
    }
  }
}
</script>
<style>
.el-table {
    font-size: 10px;
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

.el-checkbox-group {
    padding-top: 10px;
}

.el-checkbox {
    width: 270px;
}
</style>
<style scoped>
.content-left {
    float: left;
    width: 370px;
    height: 100%;
}
.content-right {
    margin-left:370px;
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
    width: calc(100% - 30px);
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

.right-box__top-btn {
    border-radius: 0 0 9px 9px;
    float: right;
    color: #656565;
    height: 35px;
    font-size: 12px;
    padding: 3px 8px 1px 8px;
    border: 1px solid #aaaaaa;
    border-top: none;
    cursor: pointer;
    margin-left: 20px;
}

.right-box__top-btn_full {
    background-color: #656565;
    border: 1px solid #656565;
    border-top: none;
    color: white;
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
    overflow-y:auto
}

.tableSquare {
    border: 1px solid #000;
    height: 25px;
    width: 90px;
    border-radius: 8px;
    text-align: center;
}

.account-list-search {
    float: right;
    width: 220px;
    margin: 15px 0;
}

@keyframes slide-in-from-right {
    from {right: -800px}
    to {right: 0}
}
@keyframes slide-out-to-right {
    from {right: 0}
    to {right: -800px}
}
.right-box-enter-active {
    animation: slide-in-from-right 0.4s;
}
.right-box-leave-active {
    animation: slide-out-to-right 0.4s;
}
</style>