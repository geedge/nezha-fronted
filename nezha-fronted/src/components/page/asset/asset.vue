<template>
    <div class="asset">
        <div class="content-left">
            <div class="sidebar-title">
                <div>Project</div>
                <div class="sidebar-info">
                    <div class="sidebar-info-header">ALL</div>
                    <div class="sidebar-info-footer">
                        <el-checkbox-group v-model="checkList" size="small">
                            <el-checkbox v-for="(item,key) in checkListData" :key="key" border :label=item.id>
                                {{item.name}}
                                <div class="checkbox-edit" @click.prevent="edit(item.id)">编辑</div>
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
                            <div v-if="item.prop == 'option'">
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
                                <div class="right-box-top-btn right-box-top-btn-full" @click.stop="tagShow()">
                                    <div class="right-box-btn-icon">
                                        <i class="el-icon-close"></i>
                                    </div>
                                    <span>{{$t('overall.esc')}}</span>
                                </div>
                                <div class="right-box-top-btn right-box-top-btn-full" @click.stop="show1()">
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
                            <div class="right-box-title">Create Asset</div>
                            <el-form ref="form" :model="assetData" label-width="120px">
                                <div class="el-form-style">
                                    <el-form-item label="SN">
                                        <el-input v-model="assetData.sn"/>
                                    </el-form-item>
                                    <el-form-item label="Host">
                                        <el-input v-model="assetData.host"/>
                                    </el-form-item>
                                    <el-form-item label="State">
                                        <div class="select-style">
                                            <el-select v-model="assetData.state" placeholder="请选择">
                                                <el-option
                                                        v-for="item in assetStateOption"
                                                        :key="item.value"
                                                        :label="item.label"
                                                        :value="item.value">
                                                </el-option>
                                            </el-select>
                                        </div>
                                    </el-form-item>
                                    <el-form-item label="ModelId">
                                        <div class="tab-input-square">342</div>
                                    </el-form-item>
                                    <el-form-item label="IDC">
                                        <div class="tab-input-square">342</div>
                                    </el-form-item>
                                    <div style="font-size: 10px">资产信息</div>
                                    <el-divider></el-divider>
                                    <!------------------------------------------资产类型---------------------------------------------->
                                    <el-form-item label="资产类型">
                                        <div class="select-style">
                                            <el-select v-model="assetType">
                                                <el-option
                                                        v-for="item in assetTypeOptionData"
                                                        :key="item.id"
                                                        :value="item.code"
                                                        :label="item.value"
                                                >
                                                    <span v-if="!item.isEdit">{{ item.value }}</span>
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
                                                            class="el-icon-delete"></i>
                                                    </span>
                                                </el-option>
                                            </el-select>
                                            <div class="el-select-add-btn">
                                                <el-popover
                                                        placement="left"
                                                        trigger="click"
                                                        v-model="popTypeVisible"
                                                >
                                                    <div class="pop-window-assetType">
                                                        <div class="pop-window-assetType-content">
                                                            <div class="right-box-top-btns">
                                                                <div class="right-box-top-btn right-box-top-btn-full"
                                                                     @click="popoverClose('type')">
                                                                    <div class="right-box-btn-icon">
                                                                        <i class="el-icon-close"></i>
                                                                    </div>
                                                                    <span>{{$t('overall.esc')}}</span>
                                                                </div>
                                                            </div>
                                                            <span style="display: block;padding-bottom: 20px">资产类型</span>
                                                            <span style="display: block;padding-bottom: 20px">新增资产类型</span>
                                                            <input v-model="assetTypeData.value"/>
                                                            <input type="button" value="+Add"
                                                                   @click="addNewData('assetType')"></input>
                                                            <span style="display: block;padding-bottom: 20px">已有资产类型</span>
                                                            <div class="li-list">
                                                                <ul style="list-style: none">
                                                                    <li style="cursor: pointer;"
                                                                        v-for="(item,index) in assetTypeOptionData"
                                                                        :key="index">
                                                                        <div>
                                                                            <span>{{item.value}}</span>
                                                                            <i class="el-icon-edit-outline"></i>
                                                                        </div>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="right-box-bottom-btns">
                                                        <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                                                             @click="popoverClose('type')">
                                                            {{$t('overall.cancel')}}
                                                        </div>
                                                        <div class="right-box-bottom-btn right-box-bottom-btn-50">
                                                            {{$t('overall.save')}}
                                                        </div>
                                                    </div>
                                                    <span class="el-icon-plus" slot="reference"></span>
                                                </el-popover>
                                            </div>
                                        </div>
                                    </el-form-item>
                                    <!------------------------------------------厂商/型号---------------------------------------------->
                                    <el-form-item label="厂商/型号">
                                        <div class="select-style">
                                            <el-cascader
                                                    :options="companyTypeOptionData"
                                            >
                                            </el-cascader>
                                            <div class="el-select-add-btn">
                                                <el-popover
                                                        placement="left"
                                                        trigger="click"
                                                        v-model="popCompVisible"
                                                >
                                                    <div class="pop-window-assetType">
                                                        <div class="pop-window-assetType-content">
                                                            <div class="right-box-top-btns">
                                                                <div class="right-box-top-btn right-box-top-btn-full"
                                                                     @click="popoverClose('comp')">
                                                                    <div class="right-box-btn-icon">
                                                                        <i class="el-icon-close"></i>
                                                                    </div>
                                                                    <span>{{$t('overall.esc')}}</span>
                                                                </div>
                                                            </div>
                                                            <div class="pop-window-assetType">
                                                                <span style="display: block;padding-bottom: 15px">商场/型号</span>
                                                                <span style="display: block;padding-bottom: 20px">新厂商名称</span>
                                                                <input v-model="assetTypeData.value"/>
                                                                <input type="button" value="+Add"
                                                                       @click="addNewData('assetType')"></input>
                                                                <span style="display: block;padding-bottom: 20px">已有厂商</span>
                                                                <div class="li-list-part">
                                                                    <ul style="list-style: none">
                                                                        <li style="cursor: pointer;"
                                                                            v-for="(item,index) in vendorUlData"
                                                                            @click="getLidata(index,item)"
                                                                            :class="{activeColor:vendorCount === index}"
                                                                            :key="index">
                                                                            <div>
                                                                                <span>{{item.value}}</span>
                                                                                <i class="el-icon-edit-outline"></i>
                                                                            </div>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                                <span style="display: block;padding-bottom: 15px">新型号名称</span>
                                                                <input v-model="assetTypeData.value"/>
                                                                <input type="button" value="+Add"
                                                                       @click="addNewData('assetType')"></input>
                                                                <span style="display: block;padding-bottom: 20px">已有型号</span>
                                                                <div class="li-list-part">
                                                                    <ul style="list-style: none">
                                                                        <li style="cursor: pointer;"
                                                                            v-for="(item,index) in modelUlData"
                                                                            :key="index">
                                                                            <div>
                                                                                <span>{{item.name}}</span>
                                                                                <i class="el-icon-edit-outline"></i>
                                                                            </div>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="right-box-bottom-btns">
                                                        <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                                                             @click="popoverClose('comp')">
                                                            {{$t('overall.cancel')}}
                                                        </div>
                                                        <div class="right-box-bottom-btn right-box-bottom-btn-50">
                                                            {{$t('overall.save')}}
                                                        </div>
                                                    </div>
                                                    <span class="el-icon-plus" slot="reference"></span>
                                                </el-popover>
                                            </div>
                                        </div>
                                    </el-form-item>
                                    <el-form-item label="购买日期">
                                        <div class="select-style">
                                            <el-date-picker
                                                    v-model="assetData.purchaseDate"
                                                    value-format="yyyy-MM-dd"
                                                    type="date"
                                                    placeholder="选择日期">
                                            </el-date-picker>
                                        </div>
                                    </el-form-item>
                                    <div style="font-size: 10px">IDC</div>
                                    <el-divider></el-divider>
                                    <!------------------------------------------IDC---------------------------------------------->
                                    <el-form-item label="IDC Name">
                                        <div class="select-style">
                                            <el-select v-model="assetData.idcId" clearable @change="getSingleIDCData">
                                                <el-option
                                                        v-for="item in IDCOptionData"
                                                        :key="item.key"
                                                        :label="item.name"
                                                        :value="item.id"
                                                >
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
                                                        placement="left"
                                                        trigger="click"
                                                        v-model="popIDCVisible"
                                                >
                                                    <div class="pop-window-assetType-content">
                                                        <div class="right-box-top-btns">
                                                            <div class="right-box-top-btn right-box-top-btn-full"
                                                                 @click="popoverClose('IDC')">
                                                                <div class="right-box-btn-icon">
                                                                    <i class="el-icon-close"></i>
                                                                </div>
                                                                <span>{{$t('overall.esc')}}</span>
                                                            </div>
                                                        </div>
                                                        <div class="pop-window">
                                                            <span style="display: block;padding-bottom: 20px">标题</span>
                                                            <el-form-item label="IDC Name">
                                                                <el-input v-model="addIdcData.name"/>
                                                            </el-form-item>
                                                            <el-form-item label="Location">
                                                                <el-input v-model="addIdcData.location"/>
                                                            </el-form-item>
                                                            <el-form-item label="负责人">
                                                                <el-input v-model="addIdcData.principal"/>
                                                            </el-form-item>
                                                            <el-form-item label="Tel">
                                                                <el-input v-model="addIdcData.tel"/>
                                                            </el-form-item>
                                                        </div>
                                                    </div>
                                                    <div class="right-box-bottom-btns">
                                                        <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                                                             @click="popoverClose('IDC')">
                                                            {{$t('overall.cancel')}}
                                                        </div>
                                                        <div class="right-box-bottom-btn right-box-bottom-btn-50"
                                                             @click="addNewData('IDC')">
                                                            {{$t('overall.save')}}
                                                        </div>
                                                    </div>
                                                    <span class="el-icon-plus" slot="reference"></span>
                                                </el-popover>
                                            </div>
                                        </div>
                                    </el-form-item>
                                    <el-form-item label="Location">
                                        <span>{{idcSelectedData.location}}</span>
                                    </el-form-item>
                                    <el-form-item label="负责人">
                                        <span>{{idcSelectedData.principal}}</span>
                                    </el-form-item>
                                    <el-form-item label="Tel">
                                        <span>{{idcSelectedData.tel}}</span>
                                    </el-form-item>
                                    <el-divider></el-divider>
                                    <!------------------------------------------cabinet---------------------------------------------->
                                    <el-form-item label="机柜">
                                        <div class="select-style">
                                            <el-select clearable v-model="assetData.cabinetId"
                                                       @change="getSingleCabinetData">
                                                <el-option
                                                        v-for="item in cabinetOptionData"
                                                        :key="item.key"
                                                        :label="item.name"
                                                        :value="item.id"
                                                >
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
                                                        placement="left"
                                                        trigger="click"
                                                        v-model="popCabinetVisible"
                                                >
                                                    <div class="pop-window-assetType-content">
                                                        <div class="right-box-top-btns">
                                                            <div class="right-box-top-btn right-box-top-btn-full"
                                                                 @click="popoverClose('equip')">
                                                                <div class="right-box-btn-icon">
                                                                    <i class="el-icon-close"></i>
                                                                </div>
                                                                <span>{{$t('overall.esc')}}</span>
                                                            </div>
                                                        </div>
                                                        <div class="pop-window">
                                                            <span style="display: block;padding-bottom: 20px">标题</span>
                                                            <el-form-item label="Name">
                                                                <el-input v-model="form.name"/>
                                                            </el-form-item>
                                                            <el-form-item label="U Size">
                                                                <div>{{value1}}</div>
                                                                <el-slider v-model="value1"></el-slider>
                                                            </el-form-item>
                                                            <el-form-item label="Desc">
                                                                <el-input v-model="form.name" type="textarea"
                                                                          :rows="2"/>
                                                            </el-form-item>
                                                            <el-form-item label="IDC">
                                                                <el-input v-model="form.name"/>
                                                            </el-form-item>
                                                        </div>
                                                    </div>
                                                    <div class="right-box-bottom-btns">
                                                        <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                                                             @click="popoverClose('equip')">
                                                            {{$t('overall.cancel')}}
                                                        </div>
                                                        <div class="right-box-bottom-btn right-box-bottom-btn-50">
                                                            {{$t('overall.save')}}
                                                        </div>
                                                    </div>
                                                    <span class="el-icon-plus" slot="reference"></span>
                                                </el-popover>
                                            </div>
                                        </div>
                                    </el-form-item>
                                    <el-form-item label="U Size">
                                        <span>{{cabinetSelectedData.uSize}}</span>
                                    </el-form-item>
                                    <el-form-item label="Desc">
                                        <span>{{cabinetSelectedData.desc}}</span>
                                    </el-form-item>
                                    <div style="font-size: 10px">CLI Account</div>
                                    <el-divider></el-divider>
                                    <el-form-item label="IP">
                                        <el-radio-group size="mini" v-model="accountType">
                                            <el-radio-button label="Password"></el-radio-button>
                                            <el-radio-button label="SSH私钥"></el-radio-button>
                                        </el-radio-group>
                                    </el-form-item>
                                    <el-form-item label="Account">
                                        <el-input v-model="form.name"/>
                                    </el-form-item>
                                    <el-form-item label="Password">
                                        <el-input v-model="form.name"/>
                                    </el-form-item>
                                    <el-form-item label="Port">
                                        <el-input v-model="form.name"/>
                                    </el-form-item>
                                </div>
                            </el-form>
                        </div>
                        <div class="">
                            <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                                 @click.stop="tagShow()">
                                {{$t('overall.cancel')}}
                            </div>
                            <div class="right-box-bottom-btn right-box-bottom-btn-50"
                                 @click="addNewData('asset')">
                                {{$t('overall.save')}}
                            </div>
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
      assetData:{
        sn:'',
        host:'',
        state:'',
        purchaseDate:'',
        idcId:'',
        cabinetId:'',
        modelId:1
      },
      assetStateOption: [{
        value: 1,
        label: '在库'
      }, {
        value: 2,
        label: '出库'
      }],
      cabinetModelData: '',
      value1: 100,
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
          label: this.$t("asset.tableTitle.alert"),
          prop: 'alert',
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
      tableData: [],
      checkListData: [],
      assetTypeData11111: '',
      assetTypeOptionData: [],
      companyTypeData: '',
      companyTypeOptionData: [
        {
          value: 'zhinan',
          label: '指南',
          children: [
            {
              value: 'shejiyuanze',
              label: '设计原则',
            }, {
              value: 'daohang',
              label: '导航',
            }
          ]
        }, {
          value: 'zujian',
          label: '组件',
          children: [
            {
              value: '11',
              label: '设计原22则',
            }, {
              value: '33',
              label: '导44航',
            }
          ]
        }, {
          value: 'ziyuan',
          label: '资源',
          children: [
            {
              value: 'shejiyuanze',
              label: '设计原则',
            }, {
              value: 'daohang',
              label: '导航',
            }
          ]
        }],
      vendorUlData:'',
      modelUlData:'',
      vendorCode:'',
      IDCData: '',
      IDCOptionData: [],
      cabinetData: '',
      cabinetOptionData: [],
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
      assetType: '',
      assetTypeData: {
        type: 'assetType',
        value: '',
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
        location: '',
        principal: '',
        tel: ''
      },
      cabinetSelectedData: {
        name: '',
        uSize: '',
        desc: '',
        idc: ''
      },
      popTypeVisible: false,
      popCompVisible: false,
      popIDCVisible: false,
      popCabinetVisible: false,
      vendorCount:''
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
        if (newVal.moduleData === 'asset') {
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
        }
      })
    },
    getCabinetOptionData(data) {
      this.$get('cabinet?idcId='+data).then(response => {
        if (response.code === 200) {
          this.cabinetOptionData = response.data.list;
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
    getModelOptionData(assetType,vendorCode) {
      this.$get('model?typeCode='+assetType+'&vendorCode='+vendorCode).then(response => {
        if (response.code === 200) {
          this.modelUlData = response.data.list
          console.log(this.modelUlData.i)
        }
      })
    },
    addNewData(type) {
      if (type === 'IDC') {
        this.$post('idc', this.addIdcData).then(res => {
        })
      }
      if (type === 'assetType') {
        this.$post('sys/dict/save', this.assetTypeData).then(res => {
        })
      }
      if (type === 'asset') {
        this.$post('asset', this.assetData).then(res => {
        })
      }
    },
    markOptionData(data) {
      data.forEach(item => {
        console.log(item)
        this.$set(item, 'isEdit', false);
        this.$set(item, 'oldName', item.value);
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
    delOptionData(data) {},
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
    getSingleIDCData(data) {
      this.idcSelectedData = '';
      this.IDCOptionData.forEach(item => {
        if (item.id === data) {
          this.idcSelectedData = item
        }
      });
      this.getCabinetOptionData(this.assetData.idcId);
      this.assetData.cabinetId=''
    },
    getSingleCabinetData(data) {
      this.cabinetOptionData.forEach(item => {
        if (item.id === data) {
          this.cabinetSelectedData = item
        }
      })
    },
    getLidata(index,item){
      this.vendorCount=index;
      this.vendorCode = item.code;
      this.getModelOptionData(this.assetType,this.vendorCode)
    },
    pageNo(val) {
      this.pageObj.pageNo = val;
      this.getAssetData()
    },
    pageSize(val) {
      this.pageObj.pageSize = val;
      this.getAssetData()
    },
    popoverClose(data) {
      if (data === 'type') {
        this.popTypeVisible = false
      }
      if (data === 'comp') {
        this.popCompVisible = false;
        this.modelUlData = '';
        this.vendorCount = ''
      }
      if (data === 'IDC') {
        this.popIDCVisible = false
      }
      if (data === 'equip') {
        this.popCabinetVisible = false
      }
    },
    show1(){
      console.log(this.assetData.idcId)
    }
  },
  mounted() {
    this.getAssetData();
    this.getIDCOptionData();
    this.getVendorOptionData();
    this.getAssetTypeOptionData();
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
    height: 300px;
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
}

.li-list-part {
    width: 90%;
    height: 130px;
    border: 1px solid #cfcfcf;
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
.activeColor{
    background-color:#409EFF;
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