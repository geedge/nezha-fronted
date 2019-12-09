<template>
    <div class="asset">
        <div class="content-left">
            <div class="sidebar-title">
                <div>Project</div>
                <div class="sidebar-info">
                    <div class="sidebar-info-header">ALL</div>
                    <div class="sidebar-info-footer">
                        <el-checkbox-group v-model="checkList" size="small">
                            <el-checkbox v-for="(item,key) in checkListData" :key="key" border :label=item.id
                                         @change="getCheckedData(item)">{{item.name}}
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
                                <span @click.stop="tagShow('showDel')" class="account-list-option"><i
                                        class="el-icon-delete"></i></span>
                                <span @click.stop="tagShow('showAdd')" class="account-list-option"><i
                                        class="el-icon-view"></i></span>
                                <span @click.stop="tagShow('showEdit')" class="account-list-option"><i
                                        class="el-icon-edit-outline"></i></span>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
                <Pagination :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
                <transition name="right-box" @click.stop>
                    <div class="right-menu" v-if="tabShow" v-clickoutside:tagHide="tagShow">
                        <div v-if="this.tagType=='add'">
                            <div class="right-box-top-btns">
                                <div class="right-box-top-btn right-box-top-btn-full">
                                    <div class="right-box-btn-icon">
                                        <i class="el-icon-close"></i>
                                    </div>
                                    <span>{{$t('overall.esc')}}</span>
                                </div>
                                <div class="right-box-top-btn right-box-top-btn-full">
                                    <div class="right-box-btn-icon">
                                        <i class="el-icon-edit-outline"></i>
                                    </div>
                                    <span>{{$t('overall.save')}}</span>
                                </div>
                                <div class="right-box-top-btn">
                                    <div class="right-box-btn-icon">
                                        <i class="el-icon-delete"></i>
                                    </div>
                                    <span>{{$t('overall.delete')}}</span>
                                </div>
                            </div>
                            <div class="right-box-title">111</div>
                            <el-form ref="form" :model="form" label-width="120px">
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
                                        <div class="tab-input-square">342</div>
                                    </el-form-item>
                                    <el-form-item label="IDC">
                                        <div class="tab-input-square">342</div>
                                    </el-form-item>
                                    <div style="font-size: 10px">资产信息</div>
                                    <el-divider></el-divider>
                                    <el-form-item label="资产类型">
                                        <div class="select-style">
                                            <el-select value-key="id" v-model="assetType">
                                                <el-option
                                                        v-for="item in assetOptionData"
                                                        :key="item.key"
                                                        :label="item.name"
                                                        :value="item.name">
                                                    <span v-if="!item.isEdit">{{ item.name }}</span>
                                                    <span class="config-dropdown-label-input" v-if="item.isEdit"
                                                          @click.stop="editing">
                                                    <el-input type="text" v-model="item.name" size="mini"/>
                                                </span>
                                                    <span class="config-dropdown-btn"
                                                          @click.stop="editOptionData(item)">
                                                    <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                                    <i class="el-icon-check" v-if="item.isEdit"></i>
                                                </span>
                                                    <span class="config-dropdown-btn config-dropdown-btn-delete"
                                                          @click.stop="delOptionData(item)"><i
                                                            class="el-icon-delete"></i></span>
                                                </el-option>
                                            </el-select>
                                            <div class="el-select-add-btn">
                                                <el-popover
                                                        placement="bottom"
                                                        trigger="click"
                                                >
                                                    <div class="pop-window-company">
                                                        <span style="display: block;padding-bottom: 20px">资产类型</span>
                                                        <span style="display: block;padding-bottom: 20px">新增资产类型</span>
                                                            <input v-model="form.name"/><div>111</div>
                                                        <span style="display: block;padding-bottom: 20px">已有资产类型</span>
                                                        <div class="rm-c-list">
                                                            <ul>
                                                                <li style="cursor: pointer;">
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <span class="el-icon-plus" slot="reference"></span>
                                                </el-popover>
                                            </div>
                                        </div>
                                    </el-form-item>

                                    <el-form-item label="厂商/型号">
                                        <div class="select-style">
                                            <el-select value-key="id" v-model="assetType">
                                                <el-option
                                                        v-for="item in assetOptionData"
                                                        :key="item.key"
                                                        :label="item.name"
                                                        :value="item.name">
                                                    <span v-if="!item.isEdit">{{ item.name }}</span>
                                                    <span class="config-dropdown-label-input" v-if="item.isEdit"
                                                          @click.stop="editing">
                                                    <el-input type="text" v-model="item.name" size="mini"/>
                                                </span>
                                                    <span class="config-dropdown-btn"
                                                          @click.stop="editOptionData(item)">
                                                    <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                                    <i class="el-icon-check" v-if="item.isEdit"></i>
                                                </span>
                                                    <span class="config-dropdown-btn config-dropdown-btn-delete"
                                                          @click.stop="delOptionData(item)"><i
                                                            class="el-icon-delete"></i></span>
                                                </el-option>
                                            </el-select>
                                            <div class="el-select-add-btn">
                                                <el-popover
                                                        placement="bottom"
                                                        trigger="click"
                                                >
                                                    <div class="pop-window-type">
                                                        <span style="display: block;padding-bottom: 20px">商场/型号</span>
                                                        <span style="display: block;padding-bottom: 20px">新厂商名称</span>
                                                        <input v-model="form.name"/><div>111</div>
                                                        <span style="display: block;padding-bottom: 20px">已有厂商</span>
                                                        <div class="companyList">
                                                            <ul>
                                                                <li style="cursor: pointer;">
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <span style="display: block;padding-bottom: 20px">已有型号</span>
                                                        <input v-model="form.name"/><div>111</div>
                                                        <div class="companyList">
                                                            <ul>
                                                                <li style="cursor: pointer;">
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                    <div>
                                                                        <span> 1111</span>
                                                                        <i class="el-icon-edit-outline"></i>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <span class="el-icon-plus" slot="reference"></span>
                                                </el-popover>
                                            </div>
                                        </div>
                                    </el-form-item>
                                    <el-form-item label="购买日期">
                                        <div class="select-style">
                                            <el-select value-key="id" v-model="assetType">
                                                <el-option
                                                        v-for="item in assetOptionData"
                                                        :key="item.key"
                                                        :label="item.name"
                                                        :value="item.name">
                                                    <span v-if="!item.isEdit">{{ item.name }}</span>
                                                    <span class="config-dropdown-label-input" v-if="item.isEdit"
                                                          @click.stop="editing">
                                                    <el-input type="text" v-model="item.name" size="mini"/>
                                                </span>
                                                    <span class="config-dropdown-btn"
                                                          @click.stop="editOptionData(item)">
                                                    <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                                    <i class="el-icon-check" v-if="item.isEdit"></i>
                                                </span>
                                                    <span class="config-dropdown-btn config-dropdown-btn-delete"
                                                          @click.stop="delOptionData(item)"><i
                                                            class="el-icon-delete"></i></span>
                                                </el-option>
                                            </el-select>
                                        </div>
                                    </el-form-item>
                                    <div style="font-size: 10px">IDC</div>
                                    <el-divider></el-divider>
                                    <el-form-item label="IDC Name">
                                        <div class="select-style">
                                            <el-select value-key="id" v-model="assetType">
                                                <el-option
                                                        v-for="item in assetOptionData"
                                                        :key="item.key"
                                                        :label="item.name"
                                                        :value="item.name">
                                                    <span v-if="!item.isEdit">{{ item.name }}</span>
                                                    <span class="config-dropdown-label-input" v-if="item.isEdit"
                                                          @click.stop="editing">
                                                    <el-input type="text" v-model="item.name" size="mini"/>
                                                </span>
                                                    <span class="config-dropdown-btn"
                                                          @click.stop="editOptionData(item)">
                                                    <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                                    <i class="el-icon-check" v-if="item.isEdit"></i>
                                                </span>
                                                    <span class="config-dropdown-btn config-dropdown-btn-delete"
                                                          @click.stop="delOptionData(item)"><i
                                                            class="el-icon-delete"></i></span>
                                                </el-option>
                                            </el-select>
                                            <div class="el-select-add-btn">
                                                <el-popover
                                                        placement="bottom"
                                                        trigger="click"
                                                >
                                                    <div class="pop-window">
                                                        <span style="display: block;padding-bottom: 20px">标题</span>
                                                        <el-form-item label="IP">
                                                            <el-input v-model="form.name"/>
                                                        </el-form-item>
                                                        <el-form-item label="SN">
                                                            <el-input v-model="form.name"/>
                                                        </el-form-item>
                                                        <el-form-item label="Asset Type">
                                                            <el-input v-model="form.name"/>
                                                        </el-form-item>
                                                    </div>
                                                    <span class="el-icon-plus" slot="reference"></span>
                                                </el-popover>
                                            </div>
                                        </div>
                                    </el-form-item>
                                    <el-form-item label="IP">
                                        <span></span>
                                    </el-form-item>
                                    <el-form-item label="IP">
                                        <span></span>
                                    </el-form-item>
                                    <el-form-item label="IP">
                                        <span></span>
                                    </el-form-item>
                                    <el-divider></el-divider>
                                    <el-form-item label="机柜">
                                        <div class="select-style">
                                            <el-select value-key="id" v-model="assetType">
                                                <el-option
                                                        v-for="item in assetOptionData"
                                                        :key="item.key"
                                                        :label="item.name"
                                                        :value="item.name">
                                                    <span v-if="!item.isEdit">{{ item.name }}</span>
                                                    <span class="config-dropdown-label-input" v-if="item.isEdit"
                                                          @click.stop="editing">
                                                    <el-input type="text" v-model="item.name" size="mini"/>
                                                </span>
                                                    <span class="config-dropdown-btn"
                                                          @click.stop="editOptionData(item)">
                                                    <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                                    <i class="el-icon-check" v-if="item.isEdit"></i>
                                                </span>
                                                    <span class="config-dropdown-btn config-dropdown-btn-delete"
                                                          @click.stop="delOptionData(item)"><i
                                                            class="el-icon-delete"></i></span>
                                                </el-option>
                                            </el-select>
                                            <div class="el-select-add-btn">
                                                <el-popover
                                                        placement="bottom"
                                                        trigger="click"
                                                >
                                                    <div class="pop-window">
                                                        <span style="display: block;padding-bottom: 20px">标题</span>
                                                        <el-form-item label="Name">
                                                            <el-input v-model="form.name"/>
                                                        </el-form-item>
                                                        <el-form-item label="SN">
                                                            <div>{{value1}}</div><el-slider v-model="value1"></el-slider>
                                                        </el-form-item>
                                                        <el-form-item label="Asset Type">
                                                            <el-input v-model="form.name" type="textarea" :rows="2"/>
                                                        </el-form-item>
                                                        <el-form-item label="Asset Type">
                                                            <el-input v-model="form.name"/>
                                                        </el-form-item>
                                                    </div>
                                                    <span class="el-icon-plus" slot="reference"></span>
                                                </el-popover>
                                            </div>
                                        </div>
                                    </el-form-item>
                                    <el-form-item label="IP">
                                        <span></span>
                                    </el-form-item>
                                    <el-form-item label="IP">
                                        <span></span>
                                    </el-form-item>
                                    <div style="font-size: 10px">IDC</div>
                                    <el-divider></el-divider>
                                    <el-form-item label="IP">
                                        <el-radio-group>
                                            <el-radio-button label="Password"></el-radio-button>
                                            <el-radio-button label="SSH私钥"></el-radio-button>
                                        </el-radio-group>
                                    </el-form-item>
                                    <el-form-item label="IP">
                                        <el-input v-model="form.name"/>
                                    </el-form-item>
                                    <el-form-item label="SN">
                                        <el-input v-model="form.name"/>
                                    </el-form-item>
                                    <el-form-item label="IP">
                                        <el-input v-model="form.name"/>
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
      value1:100,
      checkList: [],
      sidebarState: '',
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
      checkListData: [],
      assetOptionData: [
        {
          id: '1',
          name: 'group1',
        }, {
          id: '2',
          name: 'group2',
        }, {
          id: '3',
          name: '小组3',
        }, {
          id: '4',
          name: '小组4',
        }, {
          id: '5',
          name: '小组啊小组5',
        }, {
          id: '6',
          name: '小组6',
        }],
      input: '',
      pageObj: {
        pageNo: 1,
        pageSize: 20,
        total: 0,
        idcId: this.$store.state.assetData.selectedData
      },
      tableHeight: document.documentElement.clientHeight - 200,
      tabShow: false,
      tagType: 'add',
      form: {
        name: ''
      },
      rightBox: { //弹出框相关
        show: false,
        isEdit: false, //false查看，true编辑
        title: ''
      },
      assetType: {},
    }
  },
  computed: {
    getData() {
      return this.$store.state.assetData
    }
  },
  watch: {
    getData: {
      handler(newVal, oldVal) {
        this.checkList.splice(0, 0, newVal.selectedData)
        if (newVal.moduleData == 'asset') {
          this.sidebarState = true
        } else {
          this.sidebarState = false
          this.getAssetData();
          this.checkListData = [0]
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
    markOptionData() {
      for (let i in this.assetOptionData) {
        this.$set(this.assetOptionData[i], 'isEdit', false);
        this.$set(this.assetOptionData[i], 'oldName', this.assetOptionData[i].name);
      }
    },
    editOptionData(item) {
      if (!item.isEdit) {
        item.isEdit = true;
      } else {
        if (item.name != item.oldName) {
          item.isEdit = false;
        } else {
          item.isEdit = false;
        }
      }
    },
    delOptionData(data) {

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
    editing() {

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
    this.markOptionData();
    this.getListData();
    this.getAssetData();
    window.onresize = () => {
      this.tableHeight = document.documentElement.clientHeight - 200;
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

.el-divider--horizontal {
    margin: 12px;
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
    width: 70px;
    border-radius: 3px;
    text-align: center;
    margin-top: 6px;
    line-height: 23px;
    color: #aaaaaa;
}

.account-list-search {
    float: right;
    width: 220px;
    margin: 15px 0;
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
    height: 300px;
    width: 400px;
}
.pop-window-company{
    height: 600px;
    width: 400px;
}

.pop-window-type{
    height: 600px;
    width: 400px;
}

.companyList{
    width: 300px;
    height: 150px;
    border: 1px solid #000000;
}

.rm-c-list li{
    width: 300px;
    height: 400px;
    border: 1px solid #000000;
}

.rm-c-list span:hover{
    background-color:#888;color:#fff;
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