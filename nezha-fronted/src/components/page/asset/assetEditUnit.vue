<template>
  <transition name="right-box-580">
    <div class="right-box right-box-add-asset" v-if="editUnitShow" @click="editQuit" id="asset-edit-quit">
      <!--顶部按钮-->
      <div class="right-box-top-btns">
        <button v-if="!tabView" type="button" @click="deleteData('asset', pageObj.id)" id="asset-edit-del" class="nz-btn nz-btn-size-normal nz-btn-style-light">
          <span class="top-tool-btn-txt" >{{$t('overall.delete')}}</span>
        </button>
        <button v-if="tabView" id="asset-edit-edit" type="button" @click="tabView=false" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
          <span class="top-tool-btn-txt" >{{$t('overall.edit')}}</span>
        </button>
        <button v-if="!tabView" id="asset-edit-save" type="button" @click.stop="editData('asset')" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
          <span class="top-tool-btn-txt">{{$t('overall.save')}}</span>
        </button>
        <button type="button" id="asset-edit-esc" @click.stop="sendStateData('close')"
                class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-style-square">
          <span class="top-tool-btn-txt"><i class="el-icon-close"></i></span>
        </button>
      </div>

      <div class="right-box-title">{{this.tabView == true ? $t('asset.asset') : $t('asset.EditAsset')}}</div>

      <el-scrollbar class="right-box-form-box">
        <el-form ref="assetEditForm" :model="assetData" label-width="120px" class="right-box-form right-box-form-left" :rules="rules">
          <el-form-item :label="$t('asset.createAssetTab.sn')" prop="sn">
            <el-input size="mini" v-if="!tabView" v-model="assetData.sn"/>
            <el-popover trigger="hover" placement="bottom-start" :content="assetData.sn" >
              <span slot="reference" class="sidebar-info-item-txt" v-if="tabView">{{assetData.sn}}</span>
            </el-popover>
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.host')" prop="host">
            <el-input size="mini" v-if="!tabView" v-model="assetData.host"/>
            <span v-if="tabView">{{assetData.host}}</span>
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.state')">
            <div v-if="!tabView" class="select-style">
              <el-select size="mini" v-model="assetData.state" placeholder="">
                <el-option
                  :id="'asset-edit-state-op-'+item.value"
                  v-for="item in assetStateOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
            <span v-if="tabView">{{assetData.state==1 ? $t('asset.createAssetTab.inStock'): $t('asset.createAssetTab.notInStock')}}</span>
          </el-form-item>
          <el-form-item :label="$t('asset.editAssetTab.modelId')" v-if="tabView">
            <div class="tab-input-square">{{assetViewData.moduleNum}}</div>
          </el-form-item>
          <el-form-item :label="$t('asset.editAssetTab.alert')" v-if="tabView">
            <div class="tab-input-square">{{assetViewData.alertNum}}</div>
          </el-form-item>
          <div class="asset-sub-title">{{$t('asset.createAssetTab.assetInfo')}}</div>
          <div class="line-100 asset-line"></div>
          <!------------------------------------------资产类型---------------------------------------------->
          <el-form-item :label="$t('asset.createAssetTab.assetType')" class="right-box-form-content" prop="assetType">
            <el-select popper-class="asset-dropdown" size="mini" v-if="!tabView" v-model="assetType" clearable @visible-change="cancelEdit"
                       @change="getAllModelOptionData()" class="right-box-row-with-btn">
              <el-option
                :id="'asset-edit-type-op-'+item.id"
                v-for="item in assetTypeOptionData"
                :key="item.id"
                :value="item.code"
                :label="item.value"
              >
                <span v-if="!item.isEdit">{{ item.value }}</span>
                <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop="editing(item)">
                  <el-input type="text" v-model="item.value" size="mini"/>
                </span>
                <span class="config-dropdown-btn" @click.stop="editOptionData(item,'type')" :id="'asset-edit-type-op-edit-'+item.id">
                  <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                  <i class="el-icon-check" v-if="item.isEdit"
                     @click="editData('sys/dict/update',item)"></i>
                </span>
                <span class="config-dropdown-btn config-dropdown-btn-delete" @click.stop="delOptionData(item)" :id="'asset-edit-type-op-del-'+item.id">
                  <i class="el-icon-delete"></i>
                </span>
              </el-option>
            </el-select>
            <div class="right-box-row-btn right-box-row-btn-small" v-if="!tabView">
              <el-popover
                placement="left"
                trigger="click"
                v-model="editPopTypeVisible"
                v-clickoutside="clickOutSide"
              >
                <div class="pop-window-assetType" @click="editQuit()" id="asset-edit-sub-type-quit">
                  <div class="pop-window-assetType-content">
                    <!--右上角按钮-->
                    <div class="pop-top-btns">
                      <button type="button" @click="editPopoverClose('type')" id="asset-edit-sub-type-esc"  class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square">
                        <span class="top-tool-btn-txt"><i class="el-icon-close"></i></span>
                      </button>
                    </div>
                    <!--标题-->
                    <div class="pop-title">{{$t('asset.createAssetTab.assetTypeTab.assetType')}}</div>
                    <!--表单内容-->
                    <div class="pop-item">
                      <div class="pop-label">{{$t('asset.createAssetTab.assetTypeTab.addAssetType')}}</div>
                      <el-input class="input-x-mini" v-model="assetTypeData.value"/>
                      <button type="button" @click="addNewData('assetType')" class="nz-btn nz-btn-size-small nz-btn-style-normal" id="asset-edit-sub-type-add">
                        <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
                      </button>
                    </div>
                    <div class="pop-item">
                      <div class="pop-label">{{$t('asset.createAssetTab.assetTypeTab.existAssetType')}}</div>
                      <div class="pop-box pop-box-asset">
                        <el-scrollbar style="height: 100%;">
                          <ul style="list-style: none">
                            <li style="cursor: pointer;"
                                :id="'asset-edit-sub-type-op-'+index"
                                v-for="(item,index) in assetTypeOptionData"
                                @click="clickState(index,item,'type')"
                                :class="{'pop-box-active': modelCount === index}"
                                :key="index">
                              <div>
                                <span v-if="!item.isEdit">{{ item.value }}</span>
                                <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop="editing">
                                  <el-input class="input-x-mini" v-model="item.value"/>
                                </span>
                                <span v-if="!item.isEdit" class="config-dropdown-btn" @click.stop="editOptionData(item,'type',index)" :id="'asset-edit-sub-type-op-edit-'+index">
                                  <i class="el-icon-edit-outline"></i>
                                </span>
                                <span v-if="item.isEdit"  class="config-dropdown-btn" @click.stop="editData('sys/dict/update',item, 'assetType')" :id="'asset-edit-sub-type-op-save-'+index">
                                  <i class="el-icon-check"></i>
                                </span>
                                <span class="config-dropdown-btn config-dropdown-btn-delete" :id="'asset-edit-sub-type-op-del-'+index"
                                      @click.stop="deleteData('/sys/dict/delete',item.id)"><i class="el-icon-delete"></i>
                                                          </span>
                              </div>
                            </li>
                          </ul>
                        </el-scrollbar>
                      </div>
                    </div>
                  </div>
                </div>
                <div slot="reference"><i class="el-icon-plus"></i></div>
              </el-popover>
            </div>
            <span v-if="tabView">{{assetViewData.assetType}}</span>
          </el-form-item>
          <!------------------------------------------厂商/型号---------------------------------------------->
          <el-form-item :label="this.$t('asset.createAssetTab.vendor')" class="right-box-form-content" prop="modelId">
            <template v-if="!tabView">
              <el-cascader
                :options="vendorTypeOptionData"
                :key="isResourceShow"
                :disabled="this.assetType!=''?false:true"
                v-model="assetData.modelId"
                clearable
                size="mini"
                placeholder=""
                class="right-box-row-with-btn"
              >
              </el-cascader>
              <div class="right-box-row-btn right-box-row-btn-small" v-if="!tabView">
                <el-popover
                  placement="left"
                  trigger="click"
                  width="255"
                  v-model="editPopVendorVisible"
                  v-clickoutside="clickOutSide"
                  @hide="resetVendor"
                >
                  <div class="pop-window-assetType" @click="editQuit()" id="asset-edit-sub-vendor-quit">
                    <div class="pop-window-assetType-content">
                      <div class="pop-top-btns">
                        <button type="button" @click="editPopoverClose('vendor')" id="asset-edit-sub-vendor-close"> class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square">
                          <span class="top-tool-btn-txt"><i class="el-icon-close"></i></span>
                        </button>
                      </div>
                      <!--标题-->
                      <div class="pop-title">{{$t('asset.createAssetTab.vendorTab.vendor')}}</div>
                      <!--表单内容-->
                      <div class="pop-item">
                        <div class="pop-label">{{$t('asset.createAssetTab.vendorTab.vendorName')}}</div>
                        <el-input class="input-x-mini" v-model="addVendorData.value"/>
                        <button type="button" @click="addNewData('vendor')" class="nz-btn nz-btn-size-small nz-btn-style-normal" id="asset-edit-sub-vendor-add">>
                          <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
                        </button>
                      </div>
                      <div class="pop-item">
                        <div class="pop-label">{{$t('asset.createAssetTab.vendorTab.existVendor')}}</div>
                        <div class="pop-box pop-box-asset">
                          <el-scrollbar style="height: 100%;">
                            <ul style="list-style: none">
                              <li style="cursor: pointer;"
                                  :id="'asset-edit-sub-vendor-op-'+index"
                                  v-for="(item,index) in vendorUlData"
                                  @click="getLidata(index,item)"
                                  :class="{'pop-box-active': vendorCount === index}"
                                  :key="index">
                                <span v-if="!item.isEdit">{{ item.value }}</span>
                                <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop="editing">
                                  <el-input class="input-x-mini" v-model="item.value"/>
                                </span>
                                <span class="config-dropdown-btn" @click.stop="editVendorOptionData(item,'vendor',index)" :id="'asset-edit-sub-vendor-op-edit-'+index">
                                  <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                  <i class="el-icon-check" v-if="item.isEdit" @click="editData('sys/dict/update',item)" :id="'asset-edit-sub-vendor-op-save-'+index"></i>
                                </span>
                                <span class="config-dropdown-btn config-dropdown-btn-delete" @click.stop="deleteData('/sys/dict/delete',item.id)" :id="'asset-edit-sub-vendor-op-del-'+index">
                                  <i class="el-icon-delete"></i>
                                </span>
                              </li>
                            </ul>
                          </el-scrollbar>
                        </div>
                      </div>
                      <div class="pop-item">
                        <div class="pop-label">{{$t('asset.createAssetTab.vendorTab.modelName')}}</div>
                        <el-input class="input-x-mini" v-model="addNewModelData.name"/>
                        <button type="button" @click="addNewData('model')" id="asset-edit-sub-model-add" class="nz-btn nz-btn-size-small nz-btn-style-normal">
                          <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
                        </button>
                      </div>
                      <div class="pop-item">
                        <div class="pop-label">{{$t('asset.createAssetTab.vendorTab.existModel')}}</div>
                        <div class="pop-box pop-box-asset">
                          <el-scrollbar style="height: 100%;">
                            <ul style="list-style: none">
                              <li style="cursor: pointer;"
                                  :id="'asset-edit-sub-model-op-'+index"
                                  v-for="(item,index) in modelUlData"
                                  @click=" clickState(index,item,'model') "
                                  :class="{'pop-box-active': modelCount === index}"
                                  :key="index">
                                <span v-if="!item.isEdit">{{ item.name }}</span>
                                <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop="editing">
                                  <el-input class="input-x-mini" v-model="item.name"/>
                                </span>
                                <span class="config-dropdown-btn" @click.stop="editOptionData(item,'model',index)" :id="'asset-edit-sub-model-op-edit-'+index">
                                  <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                  <i class="el-icon-check" v-if="item.isEdit"
                                       @click="editData('model',item)" :id="'asset-edit-sub-model-op-save-'+index"></i>
                                </span>
                                <span class="config-dropdown-btn config-dropdown-btn-delete"
                                    @click.stop="deleteData('model',item.id)" :id="'asset-edit-sub-model-op-del-'+index">
                                  <i class="el-icon-delete"></i>
                                </span>
                              </li>
                            </ul>
                          </el-scrollbar>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div slot="reference"><i class="el-icon-plus"></i></div>
                </el-popover>
              </div>
            </template>
            <span v-if="tabView">{{assetViewData.vendor}}   {{assetViewData.model}}</span>
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.purchaseDate')">
            <div class="select-style" v-if="!tabView">
              <el-date-picker
                size="mini"
                v-model="assetData.purchaseDate"
                value-format="yyyy-MM-dd"
                type="date"
                style="width: 100%"
                placeholder="">
              </el-date-picker>
            </div>
            <span v-if="tabView">{{assetData.purchaseDate}}</span>
          </el-form-item>
          <div class="asset-sub-title">{{$t('asset.createAssetTab.dc')}}</div>
          <div class="line-100 asset-line"></div>
          <!------------------------------------------IDC---------------------------------------------->
          <el-form-item :label="this.$t('asset.createAssetTab.dcName')" class="right-box-form-content" prop="idcId">
            <template v-if="!tabView">
              <el-select popper-class="asset-dropdown" size="mini" v-model="assetData.idcId" clearable @change="getSingleIDCData" class="right-box-row-with-btn" placeholder="">
                <el-option
                  :id="'asset-edit-idc-op-'+item.id"
                  v-for="item in IDCOptionData"
                  :key="item.key"
                  :label="item.name"
                  :value="item.id"
                >
                  <span>{{ item.name }}</span>
                  <idc-config-box :post-idc="popIdcData" placement="left" @after="getIDCOptionData" :button-class="'config-dropdown-btn'">
                    <template v-slot:optionZone>
                      <i class="el-icon-edit-outline" @click="getSingleIDCData(item.id,'edit', item)"></i>
                    </template>
                  </idc-config-box>
                  <!--<el-popover
                    placement="left"
                    v-model="item[item.name]"
                    trigger="manual"
                  >
                    <div class="pop-window-assetType-content">
                      <div class="right-box-top-btns">
                        <div class="right-box-top-btn right-box-top-btn-full"
                             @click="item[item.name] = false">
                          <div class="right-box-btn-icon">
                            <i class="el-icon-close"></i>
                          </div>
                          <span>{{$t('overall.esc')}}</span>
                        </div>
                      </div>
                      <div class="pop-window">
                        <span style="display: block;padding-bottom: 20px">{{$t('asset.editAssetTab.editIdcTab.title')}}</span>
                        <el-form-item :label="$t('asset.editAssetTab.dcName')">
                          <el-input v-model="popIdcData.name"/>
                        </el-form-item>
                        <el-form-item :label="$t('asset.editAssetTab.location')">
                          <el-input v-model="popIdcData.location"/>
                        </el-form-item>
                        <el-form-item :label="$t('asset.editAssetTab.principal')">
                          <el-select v-model="popIdcData.principal" clearable>
                            <el-option
                              v-for="item in idcUserData"
                              :key="item.key"
                              :label="item.username"
                              :value="item.userId"
                            >
                            </el-option>
                          </el-select>
                        </el-form-item>
                        <el-form-item :label="$t('asset.editAssetTab.editIdcTab.tel')">
                          <el-input v-model="popIdcData.tel"/>
                        </el-form-item>
                      </div>
                    </div>
                    <div class="right-box-bottom-btns">
                      <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                           @click.stop="item[item.name]= false">
                        {{$t('overall.cancel')}}
                      </div>
                      <div class="right-box-bottom-btn right-box-bottom-btn-50"
                           @click="editData('idc',item)">
                        {{$t('overall.save')}}
                      </div>
                    </div>
                    <span class="config-dropdown-btn" slot="reference"
                          @click.stop="getSingleIDCData(item.id,'edit',item)"><i
                      class="el-icon-edit-outline"></i></span>
                  </el-popover>-->
                  <span class="config-dropdown-btn config-dropdown-btn-delete"
                        @click.stop="deleteData('idc',item.id)" :id="'asset-edit-idc-op-del-'+item.id"><i
                    class="el-icon-delete"></i></span>
                </el-option>
              </el-select>
              <div class="right-box-row-btn right-box-row-btn-small">
                <idc-config-box placement="left" @after="getIDCOptionData"></idc-config-box>
                <!--<el-popover
                  placement="left"
                  v-model="editPopIDCVisible"
                >
                  <div class="pop-window-assetType-content">
                    <div class="right-box-top-btns">
                      <div class="right-box-top-btn right-box-top-btn-full"
                           @click="editPopoverClose('idc')">
                        <div class="right-box-btn-icon">
                          <i class="el-icon-close"></i>
                        </div>
                        <span>{{$t('overall.esc')}}</span>
                      </div>
                    </div>
                    <div class="pop-window">
                      <span
                        style="display: block;padding-bottom: 20px">{{$t('asset.editAssetTab.AddIdcTab.title')}}</span>
                      <el-form-item :label="this.$t('asset.editAssetTab.AddIdcTab.dcName')">
                        <el-input v-model="addIdcData.name"/>
                      </el-form-item>
                      <el-form-item :label="this.$t('asset.editAssetTab.AddIdcTab.location')">
                        <el-input v-model="addIdcData.location"/>
                      </el-form-item>
                      <el-form-item :label="$t('asset.editAssetTab.AddIdcTab.principal')">
                        <el-select v-model="addIdcData.principal" clearable>
                          <el-option
                            v-for="item in idcUserData"
                            :key="item.key"
                            :label="item.username"
                            :value="item.userId"
                          >
                          </el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item :label="this.$t('asset.editAssetTab.AddIdcTab.tel')">
                        <el-input v-model="addIdcData.tel"/>
                      </el-form-item>
                    </div>
                  </div>
                  <div class="right-box-bottom-btns">
                    <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                         @click="editPopoverClose('idc')">
                      {{$t('overall.cancel')}}
                    </div>
                    <div class="right-box-bottom-btn right-box-bottom-btn-50"
                         @click="addNewData('IDC')">
                      {{$t('overall.save')}}
                    </div>
                  </div>
                  <div slot="reference"><i class="el-icon-plus"></i></div>
                </el-popover>-->
              </div>
            </template>
            <span v-if="tabView">{{assetViewData.idcName}}</span>
          </el-form-item>
          <el-form-item :label="$t('asset.createAssetTab.location')">
            <span>{{idcSelectedData.location}}</span>
          </el-form-item>
          <el-form-item :label="$t('asset.createAssetTab.principal')">
            <span>{{this.getPrincipalName(idcSelectedData.principal)}}</span>
          </el-form-item>
          <el-form-item :label="$t('asset.createAssetTab.tel')">
            <span>{{idcSelectedData.tel}}</span>
          </el-form-item>
          <el-divider></el-divider>


          <!------------------------------------------cabinet---------------------------------------------->
          <el-form-item :label="$t('asset.createAssetTab.cabinet')" class="right-box-form-content">
            <template v-if="!tabView">
              <el-select clearable v-model="assetData.cabinetId" clearable class="right-box-row-with-btn" popper-class="asset-dropdown"
                         :disabled="assetData.idcId==''?true:false" size="mini" placeholder=""
                         @change="getSingleCabinetData">
                <el-option
                  :id="'asset-edit-cabinet-op-'+item.id"
                  v-for="item in cabinetOptionData"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                  <span>{{ item.name }}</span>
                  <cabinet-config-box placement="left" :post-cabinet="item" button-class="config-dropdown-btn" @after="getCabinetOptionData">
                    <i slot="optionZone" class="el-icon-edit-outline"></i>
                  </cabinet-config-box>

                  <span class="config-dropdown-btn config-dropdown-btn-delete"
                        @click.stop="deleteData('cabinet',item.id)" :id="'asset-edit-cabinet-op-del-'+item.id">
                    <i class="el-icon-delete"></i>
                  </span>
                </el-option>
              </el-select>

              <div class="right-box-row-btn right-box-row-btn-small">
                <cabinet-config-box placement="left" :post-cabinet="addCabinetData"  @after="getCabinetOptionData"></cabinet-config-box>
              </div>
            </template>
            <span v-if="tabView">{{assetViewData.cabinetName}}</span>
          </el-form-item>
          <el-form-item :label="$t('asset.editAssetTab.uSize')">
            <span>{{cabinetSelectedData.uSize}}</span>
          </el-form-item>
          <el-form-item :label="$t('asset.editAssetTab.remark')">
            <span>{{cabinetSelectedData.remark}}</span>
          </el-form-item>
          <!--cli-->
          <div class="asset-sub-title">{{$t('asset.createAssetTab.cli')}}</div>
          <div class="line-100 asset-line"></div>
          <account-config-box v-for="(item,index) in assetData.accounts" :is-edit="!tabView" :account="item" :key="index" ref="accountConfigBox"></account-config-box>
        </el-form>
      </el-scrollbar>
    </div>
  </transition>
</template>

<script>
  import accountConfig from './accountConfig';
  import {host} from '../../common/js/validate';
  export default {
    name: "assetEditUnit",
    props: ["editUnitShow", "editUnitId"],
    components:{
      'account-config-box': accountConfig,
    },
    data() {
      return {
        visible: '',
        vendorModelData: '',
        assetData: {
          id: '',
          sn: '',
          host: '',
          state: '',
          purchaseDate: '',
          idcId: '',
          cabinetId: '',
          modelId: '',
          assetType: '',
          accounts: [{
            id: '',
            authType: 1,
            user: '',
            pwd: '',
            port: '',
            uploadFile: null
          }]
        },
        accountData: '',
        assetViewData: {
          assetType: '',
          vendor: '',
          model: '',
          moduleNum: '',
          alertNum: '',
          idcName: '',
          cabinetName: ''
        },
        assetStateOption: [
          {
            value: 1,
            label: this.$t('asset.createAssetTab.inStock')
          }, {
            value: 2,
            label: this.$t('asset.createAssetTab.notInStock')
          }],
        cabinetModelData: '',
        checkList: [],
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
        tabView: false,
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
          location: '',
          principal: '',
          tel: ''
        },
        popIdcData: {
          id: '',
          name: '',
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
        popCabinetData: {
          name: '',
          uSize: 0,
          remark: '',
          idcId: '',
        },
        addCabIDCData: {
          id: '',
          name: '',
          location: '',
          principal: '',
          tel: ''
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
        tempData: '',
        tempModelData: [],
        isResourceShow: 0,
        unitDisable: '',
        modelClickData: '',
        popState: true,
        obj: null,
        addUnitShow: false,
        rules: {
          sn: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          host: [
            {required: true, validator:host, trigger: 'blur'}
          ],
          modelId: [
            {required: true, message: this.$t('validate.required'), trigger: 'change'}
          ],
          assetType: [
            {required: true, message: this.$t('validate.required'), trigger: 'change'}
          ],
          idcId: [
            {required: true, message: this.$t('validate.required'), trigger: 'change'}
          ],
        },
        cabRules: {
          name: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          uSize: [
            {required: true, type: 'number', min: 1, max: 47, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          idcId: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ]
        },
        uploadFileList:[],
        formData:null
      }
    },
    /*computed: {
      getData() {
        return this.$store.state.assetData
      }
    },*/
    watch: {
      allModelUlData(newVal) {
        if (newVal) {
          this.getConnectData();
          if (this.pageObj.id != '') {
            this.assetData.modelId = [this.obj.model.vendor.code, this.obj.model.id]
          }
        }
      },
      assetType(newVal) {
        this.assetData.assetType = newVal;
        if (newVal == '') {
          this.popState = true
        } else {
          this.popState = false
        }
      },
      'assetData.idcId': function(n, o) {
        this.addCabinetData.idcId = n;
      }
    },
    methods: {
      cancelEdit(data) {
        if (data === false) {
          this.getAssetTypeOptionData();
        }
      },
      clickOutSide(data) {
        if (data) {
          this.editQuit();
          this.modelCount = '';
        }
      },
      editQuit() {
        for (let i of this.assetTypeOptionData) {
          if (i.isEdit === true) {
            i.isEdit = false;
            this.getAssetTypeOptionData();
          }
        }
        for (let i of this.vendorUlData) {
          if (i.isEdit === true) {
            i.isEdit = false;
            this.getVendorOptionData();
          }
        }
        for (let i of this.modelUlData) {
          if (i.isEdit === true) {
            i.isEdit = false;
            this.getModelOptionData(this.assetType, this.vendorCode);
          }
        }
      },
      getAssetData(data) {
        if (data !== undefined) {
          this.pageObj.id = data;
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
              // this.assetData.accounts[0].id = response.data.list[0].accounts[0].id
              // this.assetData.accounts[0].authType = response.data.list[0].accounts[0].authType
              // this.assetData.accounts[0].user = response.data.list[0].accounts[0].user
              // this.assetData.accounts[0].pwd = response.data.list[0].accounts[0].pwd
              // this.assetData.accounts[0].port = response.data.list[0].accounts[0].port
              // this.assetData.accounts[0].cert = response.data.list[0].accounts[0].privateKey
              this.assetData.accounts[0]=response.data.list[0].accounts[0]?response.data.list[0].accounts[0]:this.assetData.accounts[0];
              this.idcSelectedData.location = response.data.list[0].idc.location
              this.idcSelectedData.principal = response.data.list[0].idc.principal
              this.idcSelectedData.tel = response.data.list[0].idc.tel
              this.cabinetSelectedData.uSize = response.data.list[0].cabinet == null ? '' : response.data.list[0].cabinet.uSize
              this.cabinetSelectedData.remark = response.data.list[0].cabinet == null ? '' : response.data.list[0].cabinet.remark
              this.getAllModelOptionData(this.assetType)
            }
          })
        }
      },
      getIDCOptionData() {
        this.$get('idc').then(response => {
          if (response.code === 200) {
            this.IDCOptionData = response.data.list;
            this.markOptionData(this.IDCOptionData);
            this.$store.commit('assetDcListChange');
            this.$emit('refreshData');
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
            for (let i = 0; i < this.cabinetOptionData.length; i++) {
              this.$set(this.cabinetOptionData[i], 'children', this.IDCOptionData)
            }
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
        this.assetData.assetType = this.assetType;
        this.$get('model?typeCode=' + this.assetType + '&pageNo=1&pageSize=999').then(response => {
          if (response.code === 200) {
            this.allModelUlData = response.data.list
          }
        })
      },
      changeLoginType:function(loginType){
        this.assetData.accounts[0].authType = loginType;
        if(loginType == 1){//密码登录
          this.clearFile();
        }
        if(loginType == 2){//公钥登录
          this.assetData.accounts[0].pwd='';
        }
      },
      editData(data, item, mark) {
        let obj = {
          id: '',
          type: '',
          value: '',
          code: ''
        }
        let idcData = {
          id: '',
          name: '',
          location: '',
          principal: '',
          tel: ''
        }
        if (data === 'asset') {
          //this.assetData.modelId = this.assetData.modelId.join(',').split(',')[1];
          let modelId = this.assetData.modelId.join(',').split(',')[1];
          let form = new FormData();
          form.append("id", this.pageObj.id);
          form.append("sn", this.assetData.sn);
          form.append("host", this.assetData.host);
          form.append("state", this.assetData.state);
          form.append("purchaseDate", !this.assetData.purchaseDate?'':this.assetData.purchaseDate);
          form.append("idcId", this.assetData.idcId);
          form.append("cabinetId", this.assetData.cabinetId);
          form.append("modelId", modelId);
          for(let i in this.assetData.accounts){
            let account=this.assetData.accounts[i];
            if(account.user){
              form.append("accounts["+i+"].id", account.id);
              form.append("accounts["+i+"].authType",account.authType);
              form.append("accounts["+i+"].user", account.user);
              form.append("accounts["+i+"].port", account.port);
              form.append("accounts["+i+"].pwd", account.pwd);
              if(account.authType==2){
                form.append('cert',account.uploadFile?account.uploadFile.raw:null);
              }
            }
          }
          this.$refs.accountConfigBox[0].validateAccount();
          let accountValideResult=this.$refs.accountConfigBox[0].validateResult;
          this.$refs.assetEditForm.validate((valid) => {
            if (valid&&accountValideResult) {
              this.$put('asset', form,{'Content-Type': 'multipart/form-data'}).then(res => {
                const h = this.$createElement;
                if (res.code === 200) {
                  this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.clearFile();
                  this.pageObj.id = '';
                  this.$emit('refreshData', 'true');
                  this.sendStateData('close');
                } else {
                  this.$message.error(res.msg);
                }
              });
            } else {
              return false;
            }
          });

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
            let v = true;
            this.$refs.cabEditForm[0].validate((valid) => {
              if (valid) {
                item.name = this.popCabinetData.name;
                item.uSize = this.popCabinetData.uSize;
                item.remark = this.popCabinetData.remark;
                item.idcId = this.popCabinetData.idcId;
              } else {
                v = false;
              }
            });
            if (!v) {
              return false;
            }
          }
          if (data === 'idc') {
            idcData.id = item.id
            idcData.name = this.popIdcData.name
            idcData.location = this.popIdcData.location
            idcData.principal = this.popIdcData.principal
            idcData.tel = this.popIdcData.tel
            item = idcData
          }
          if (mark === 'CabIDC') {
            idcData.id = item.id;
            idcData.name = this.addCabIDCData.name;
            idcData.location = this.addCabIDCData.location;
            idcData.principal = this.addCabIDCData.principal;
            idcData.tel = this.addCabIDCData.tel;
            item = idcData;
          }
          this.$put(data, item).then(res => {
            if (res.code === 200) {
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
              this.getIDCOptionData();
              if (data === 'cabinet') {
                this.getCabinetOptionData(item.idcId);
              }
              this.getAllModelOptionData();
              this.getAssetTypeOptionData();
              this.$emit('refreshData', 'true')
            } else {
              this.$message.error(res.msg);
            }
          })
        }
      },
      //新增型号弹框关闭后重置弹框内容
      resetVendor() {
        this.addVendorData.value = '';
        this.vendorCode = '';
        this.vendorCount = '';
        this.modelUlData = [];
        this.addNewModelData = {
          name: '',
          vendorCode: '',
          typeCode: ''
        }
      },
      addNewData(type) {
        if (type === 'IDC') {
          const h = this.$createElement;
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
        if (type === 'assetType') {
          this.$post('sys/dict/save', this.assetTypeData).then(res => {
            const h = this.$createElement;
            if (res.code === 200) {
              this.getAssetTypeOptionData()
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
            } else {
              this.$message.error(res.msg);
            }
          })
        }
        if (type === 'vendor') {
          const h = this.$createElement;
          this.$post('sys/dict/save', this.addVendorData).then(res => {
            if (res.code === 200) {
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
              this.getVendorOptionData()
            } else {
              this.$message.error(res.msg);
            }
          })
        }
        if (type === 'model') {
          this.addNewModelData.typeCode = this.assetType
          this.addNewModelData.vendorCode = this.vendorCode
          this.$post('model', this.addNewModelData).then(res => {
            const h = this.$createElement;
            if (res.code === 200) {
              this.getModelOptionData(this.assetType, this.vendorCode)
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
              this.getAllModelOptionData(this.assetType)
            } else {
              this.$message.error(res.msg);
            }
          })
        }
        if (type === 'cabinet') {
          this.$refs.cabAddForm.validate((valid) => {
            if (valid) {
              this.addCabinetData.idcId = this.assetData.idcId
              this.$post('cabinet', this.addCabinetData).then(res => {
                const h = this.$createElement;
                if (res.code === 200) {
                  this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.getCabinetOptionData(this.addCabinetData.idcId);
                  this.editPopoverClose('cabinet');
                } else {
                  this.$message.error(res.msg);
                }
              });
            } else {
              return false;
            }
          });

        }
      },
      clearFile:function(){
        if(this.$refs.upload){
          this.$refs.upload.clearFiles();
        }
        this.uploadFileList=[];
        this.assetData.accounts[0].privateKey='';
      },
      deleteData(data, item) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete(data + "?ids=" + item).then(response => {
            if (response.code === 200) {
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getAssetData();
              this.getIDCOptionData();
              this.getVendorOptionData();
              this.getCabinetOptionData(this.assetData.idcId);
              this.getAllModelOptionData(this.assetType);
              this.getModelOptionData(this.assetType, this.vendorCode);
              if (data == 'asset') {
                this.sendStateData('close');
              }
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
          this.$set(item, 'modelOldName', item.name);
          this.$set(item, item.name, false);
          this.$set(item, item.id, false);
          this.$set(item, item.id + item.name, false);
          this.$set(item, item.name + item.id, false);
        })
      },
      getConnectData() {
        this.isResourceShow += 1;
        let resultData = [];
        let modelData = this.allModelUlData;
        for (let i = 0; i < modelData.length; i++) {

          if (!modelData[i].vendor) {
            continue;
          }
          let obj = {};
          obj.id = modelData[i].vendor.id;
          obj.code = modelData[i].vendor.code;
          obj.value = modelData[i].vendor.code;
          obj.label = modelData[i].vendor.value;
          obj.children = [];
          resultData.push(obj);
        }
        let result = [];
        let obj1 = {};
        for (let i = 0; i < resultData.length; i++) {
          if (!obj1[resultData[i].id]) {
            result.push(resultData[i]);
            obj1[resultData[i].id] = true;
          }
        }
        for (let x = 0; x < result.length; x++) {
          for (let y = 0; y < modelData.length; y++) {
            if (!modelData[y].vendor) {
              continue;
            }
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
      editVendorOptionData(item, data, index) {
        this.vendorCount = index
        if (!item.isEdit) {
          item.isEdit = true;
        } else {
          if (item.name !== item.oldName) {
            item.isEdit = false;
          } else {
            item.isEdit = false;
          }
        }
        if (data === 'vendor') {
          for (let i = 0; i < this.vendorUlData.length; i++) {
            const element = this.vendorUlData[i];
            if (item.id !== element.id) {
              element.isEdit = false
              element.value = element.oldName
            }
          }
        }
      },
      editOptionData(item, data, index) {
        this.modelCount = index;
        if (!item.isEdit) {
          item.isEdit = true;
        } else {
          if (item.name !== item.oldName) {
            item.isEdit = false;
          } else {
            item.isEdit = false;
          }
        }
        if (data === 'type') {
          for (let i = 0; i < this.assetTypeOptionData.length; i++) {
            let element = this.assetTypeOptionData[i];
            if (item.id !== element.id) {
              element.isEdit = false
              element.value = element.oldName
            }
          }
        }
        if (data === 'model') {
          for (let i = 0; i < this.modelUlData.length; i++) {
            let element = this.modelUlData[i];
            if (item.id !== element.id) {
              element.isEdit = false
              element.value = element.modelOldName
            }
          }
        }
      },
      delOptionData(data) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("/sys/dict/delete?ids=" + data.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getAssetData();
              this.getAssetTypeOptionData();
              this.getVendorOptionData();
              this.getAllModelOptionData(this.assetType);
              this.getModelOptionData(this.assetType, this.vendorCode);
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      tabControl(data) {
        if (data === 'close') {
          this.addUnitShow = false
        }
      },
      editing() {
      },
      getSingleIDCData(data, item, itemData) {
        if (item !== 'edit') {
          this.idcSelectedData = '';
          this.IDCOptionData.forEach(item => {
            if (item.id === data) {
              this.idcSelectedData = item;
            }
          });
          this.getCabinetOptionData(this.assetData.idcId);
          this.assetData.cabinetId = '';
          this.cabinetSelectedData.uSize = '';
          this.cabinetSelectedData.remark = null
        } else {
          this.clickFlush('idc', itemData);
          this.IDCOptionData.forEach(item => {
            if (item.id === data) {
              this.popIdcData.id = item.id;
              this.popIdcData.name = item.name;
              this.popIdcData.location = item.location;
              this.popIdcData.principal = item.principal;
              this.popIdcData.tel = item.tel;
              this.addCabIDCData.name = item.name;
              this.addCabIDCData.location = item.location;
              this.addCabIDCData.principal = item.principal;
              this.addCabIDCData.tel = item.tel;
            }
          });
        }
      },
      getSingleCabinetData(data, type, item) {
        if (type !== 'edit') {
          this.cabinetSelectedData.uSize = 0;
          this.cabinetSelectedData.remark = null
          this.cabinetOptionData.forEach(items => {
            if (items.id === data) {
              this.cabinetSelectedData.uSize = items.uSize
              this.cabinetSelectedData.remark = items.remark
            }
          })
        } else {
          this.clickFlush('cabinet', item)
          item[item.name] = !item[item.name]
          this.cabinetOptionData.forEach(items => {
            if (items.id === data) {
              this.popCabinetData.name = items.name;
              this.popCabinetData.uSize = items.uSize;
              this.popCabinetData.remark = items.remark;
              this.popCabinetData.idcId = items.idcId;
            }
          })
        }
      },
      getSingleAsset(data) {
        this.pageObj.idcIds = data.join(',')
        this.getAssetData()
      },
      getLidata(index, item) {
        this.vendorCount = index;
        this.vendorCode = item.code;
        this.getModelOptionData(this.assetType, this.vendorCode)
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getAssetData()
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        this.getAssetData()
      },
      clickState(index, item, data) {
        if (data === 'type') {
          this.modelCount = index;
          this.tempData = item;
        }
        if (data === 'model') {
          this.modelCount = index;
          this.modelClickData = item.id
        }
      },
      transferData(data) {
        if (data === 'type') {
          this.assetType = this.tempData.code
          this.popTypeVisible = false
          this.tempData = ''
        }
        if (data === 'model') {
          this.assetData.modelId = [this.vendorCode, this.modelClickData]
          this.popCompVisible = false
          this.tempData = ''
        }
      },
      handleChange(file,fileList) {
        if (fileList.length > 0) {
          this.uploadFileList = [fileList[fileList.length - 1]]
        }
        this.assetData.accounts[0].file = this.uploadFileList[0];
      },
      editPopoverClose(data) {
        if (data === 'type') {
          this.modelCount = ''
          this.editPopTypeVisible = !this.editPopTypeVisible
        }
        if (data === 'vendor') {
          this.vendorCount = ''
          this.modelCount = ''
          this.editPopVendorVisible = !this.editPopVendorVisible
        }
        if (data === 'idc') {
          this.editPopIDCVisible = !this.editPopIDCVisible
        }
        if (data === 'cabinet') {
          this.editPopCabinetVisible = !this.editPopCabinetVisible
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
      sendStateData(data) {
        this.$emit('sendStateData', 'close')
      },
      flushData() {
        this.getAssetData();
      },
      clickFlush(type, itemData) {
        if (type === 'idc') {
          for (let i = 0; i < this.IDCOptionData.length; i++) {
            const element = this.IDCOptionData[i];
            if (element.id === itemData.id) {
              setTimeout(() => {
                element[element.name] = true;
              }, 100)
            } else {
              element[element.name] = false
            }
          }
        }
        if (type === 'cabinet') {
          for (let i = 0; i < this.cabinetOptionData.length; i++) {
            const element = this.cabinetOptionData[i];
            if (element.id === itemData.id) {
              setTimeout(() => {
                element[element.name] = true;
              }, 100)
            } else {
              element[element.name] = false
            }
          }
        }
      },
    },
    mounted() {
      this.getUserData()
      this.getIDCOptionData();
      this.getVendorOptionData();
      this.getAssetTypeOptionData();
      window.onresize = () => {
        this.tableHeight = document.documentElement.clientHeight - 200;
      }
    }
  }
</script>

<style scoped>
.asset-sub-title {
  padding: 8px 0;
}
.asset-line {
  margin-bottom: 18px;
  background-color: #DCDFE6;
}
/*去除上传文件动画start*/
/*.upload-demo {*/
/*  display: flex;*/
/*}*/
/deep/ .el-list-enter-active,
/deep/ .el-list-leave-active {
  transition: none;
}

/deep/ .el-list-enter,
/deep/ .el-list-leave-active {
  opacity: 0;
}
/deep/ .el-upload-list {
  height: 40px;
}
/*去除上传文件动画end*/
</style>
