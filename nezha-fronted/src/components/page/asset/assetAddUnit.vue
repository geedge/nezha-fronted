<template>
  <transition name="right-box-580">
    <div class="right-box right-box-add-asset" v-if="addUnitShow" @click="editQuit">
      <div class="right-box-top-btns">
        <button type="button" @click.stop="addNewData('asset')" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
          <span class="top-tool-btn-txt">{{$t('overall.save')}}</span>
        </button>
        <button type="button" @click.stop="sendStateData('close')"
                class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-style-square">
          <span class="top-tool-btn-txt"><i class="el-icon-close"></i></span>
        </button>
      </div>

      <div class="right-box-title">{{$t('asset.createAssetTab.title')}}</div>

      <el-scrollbar class="right-box-form-box">
        <el-form :model="assetData" label-width="120px" class="right-box-form right-box-form-left" :rules="rules" ref="addAssetForm">
          <el-form-item :label="this.$t('asset.createAssetTab.sn')" prop="sn">
            <el-input size="mini" v-model="assetData.sn" maxlength="64" show-word-limit/>
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.host')" prop="host">
            <el-input size="mini" v-model="assetData.host"/>
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.state')" prop="state">
            <el-select size="mini" v-model="assetData.state" placeholder="">
              <el-option
                v-for="item in assetStateOption"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <div class="asset-sub-title">{{$t('asset.createAssetTab.assetInfo')}}</div>
          <div class="line-100 asset-line"></div>
          <!------------------------------------------资产类型---------------------------------------------->
          <el-form-item :label="this.$t('asset.createAssetTab.assetType')" class="right-box-form-content" prop="assetType">
            <el-select popper-class="asset-dropdown" size="mini" v-model="assetType" clearable @change="getAllModelOptionData" placeholder=""
                       @visible-change="cancelEdit" class="right-box-row-with-btn">
              <el-option
                v-for="(item) in assetTypeOptionData"
                :key="item.id"
                :value="item.code"
                :label="item.value"
              >
                <span v-if="!item.isEdit">{{ item.value }}</span>
                <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop="editing">
                                        <el-input type="text" v-model="item.value" size="mini"/>
                                    </span>
                <span class="config-dropdown-btn" @click.stop="editOptionData(item,'type')">
                                        <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                        <i class="el-icon-check" v-if="item.isEdit"
                                           @click="editData('sys/dict/update',item)"></i>
                                    </span>
                <span class="config-dropdown-btn config-dropdown-btn-delete"><i class="el-icon-delete"></i></span>
              </el-option>
            </el-select>
            <div class="right-box-row-btn right-box-row-btn-small">
              <el-popover
                placement="left"
                v-model="popTypeVisible"
              >
                <div class="pop-window-assetType" @click="editQuit()">
                  <div class="pop-window-assetType-content">
                    <!--右上角按钮-->
                    <div class="pop-top-btns">
                      <button type="button" @click="popoverClose('type')" class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square">
                        <span class="top-tool-btn-txt"><i class="el-icon-close"></i></span>
                      </button>
                    </div>
                    <!--标题-->
                    <div class="pop-title">{{$t('asset.createAssetTab.assetTypeTab.assetType')}}</div>
                    <!--表单内容-->
                    <div class="pop-item">
                      <div class="pop-label">{{$t('asset.createAssetTab.assetTypeTab.addAssetType')}}</div>
                      <el-input class="input-x-mini" v-model="assetTypeData.value"/>
                      <button type="button" @click="addNewData('assetType')" class="nz-btn nz-btn-size-small nz-btn-style-normal">
                        <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
                      </button>
                    </div>
                    <div class="pop-item">
                      <div class="pop-label">{{$t('asset.createAssetTab.assetTypeTab.existAssetType')}}</div>
                      <div class="pop-box pop-box-asset">
                        <el-scrollbar style="height: 100%;">
                          <ul style="list-style: none">
                            <li style="cursor: pointer;"
                                v-for="(item,index) in assetTypeOptionData"
                                @click="clickState(index,item,'type')"
                                :class="{'pop-box-active': modelCount === index}"
                                :key="index">
                              <div>
                                <span v-if="!item.isEdit">{{ item.value }}</span>
                                <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop="editing">
                                  <el-input class="input-x-mini" v-model="item.value"/>
                                </span>
                                <span class="config-dropdown-btn" @click.stop="editOptionData(item,'type',index)">
                                  <i class="el-icon-edit-outline"v-if="!item.isEdit"></i>
                                  <i class="el-icon-check" v-if="item.isEdit" @click="editData('sys/dict/update',item)"></i>
                                </span>
                                <span class="config-dropdown-btn config-dropdown-btn-delete"
                                      @click.stop="deleteData('/sys/dict/delete',item.id)">
                                  <i class="el-icon-delete"></i>
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
          </el-form-item>
          <!------------------------------------------厂商/型号---------------------------------------------->
          <el-form-item :label="this.$t('asset.createAssetTab.vendor')" class="right-box-form-content" prop="modelId">
            <el-cascader
              :options="vendorTypeOptionData"
              :key="isResourceShow"
              v-model="assetData.modelId"
              :disabled="this.assetType!=''?false:true"
              clearable
              size="mini"
              placeholder=""
              class="right-box-row-with-btn"
            >
            </el-cascader>
            <div class="right-box-row-btn right-box-row-btn-small">
              <el-popover
                placement="left"
                trigger="click"
                width="255"
                v-model="popCompVisible"
                :disabled=popState
                v-clickoutside="clickOutSide"
              >
                <div class="pop-window-assetType" @click="editQuit()">
                  <div class="pop-window-assetType-content">
                    <div class="pop-top-btns">
                      <button type="button" @click="popoverClose('vendor')" class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square">
                        <span class="top-tool-btn-txt"><i class="el-icon-close"></i></span>
                      </button>
                    </div>
                    <!--标题-->
                    <div class="pop-title">{{$t('asset.createAssetTab.vendorTab.vendor')}}</div>
                    <!--表单内容-->
                    <div class="pop-item">
                      <div class="pop-label">{{$t('asset.createAssetTab.vendorTab.vendorName')}}</div>
                      <el-input class="input-x-mini" v-model="addVendorData.value"/>
                      <button type="button" @click="addNewData('vendor')" class="nz-btn nz-btn-size-small nz-btn-style-normal">
                        <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
                      </button>
                    </div>
                    <div class="pop-item">
                      <div class="pop-label">{{$t('asset.createAssetTab.vendorTab.existVendor')}}</div>
                      <div class="pop-box pop-box-asset">
                        <el-scrollbar style="height: 100%;">
                          <ul style="list-style: none">
                            <li style="cursor: pointer;"
                                v-for="(item,index) in vendorUlData"
                                @click="getLidata(index,item)"
                                :class="{'pop-box-active': vendorCount === index}"
                                :key="index">
                              <div>
                                <span v-if="!item.isEdit">{{ item.value }}</span>
                                <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop="editing">
                                  <el-input class="input-x-mini" v-model="item.value"/>
                                </span>
                                <span class="config-dropdown-btn"
                                      @click.stop="editVendorOptionData(item,'vendor',index)">
                                  <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                  <i class="el-icon-check" v-if="item.isEdit" @click="editData('sys/dict/update',item)"></i>
                                </span>
                                <span class="config-dropdown-btn config-dropdown-btn-delete"
                                      @click.stop="deleteData('/sys/dict/delete',item.id)"><i
                                  class="el-icon-delete"></i>
                                </span>
                              </div>
                            </li>
                          </ul>
                        </el-scrollbar>
                      </div>
                    </div>
                    <div class="pop-item">
                      <div class="pop-label">{{$t('asset.createAssetTab.vendorTab.modelName')}}</div>
                      <el-input class="input-x-mini" v-model="addNewModelData.name"/>
                      <button type="button" @click="addNewData('model')" class="nz-btn nz-btn-size-small nz-btn-style-normal">
                        <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
                      </button>
                    </div>
                    <div class="pop-item">
                      <div class="pop-label">{{$t('asset.createAssetTab.vendorTab.existModel')}}</div>
                      <div class="pop-box pop-box-asset">
                        <el-scrollbar style="height: 100%;">
                          <ul style="list-style: none">
                            <li style="cursor: pointer;"
                                v-for="(item,index) in modelUlData"
                                @click="clickState(index,item,'model') "
                                :class="{'pop-box-active': modelCount === index}"
                                :key="index">
                              <div>
                                <span v-if="!item.isEdit">{{item.name}}</span>
                                <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop="editing">
                                  <el-input class="input-x-mini" v-model="item.name"/>
                                </span>
                                <span class="config-dropdown-btn"
                                      @click.stop="editOptionData(item,'model',index)">
                                  <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                  <i class="el-icon-check" v-if="item.isEdit" @click="editData('model',item)"></i>
                                </span>
                                <span class="config-dropdown-btn config-dropdown-btn-delete"
                                      @click.stop="deleteData('model',item.id)"><i
                                  class="el-icon-delete"></i>
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
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.purchaseDate')" class="right-box-form-content">
            <el-date-picker
              size="mini"
              v-model="assetData.purchaseDate"
              value-format="yyyy-MM-dd"
              type="date"
              style="width: 100%"
              placeholder="">
            </el-date-picker>
          </el-form-item>
          <div class="asset-sub-title">{{$t('asset.createAssetTab.dc')}}</div>
          <div class="line-100 asset-line"></div>
          <!------------------------------------------IDC---------------------------------------------->
          <el-form-item :label="this.$t('asset.createAssetTab.dcName')" class="right-box-form-content" prop="idcId">
            <el-select popper-class="asset-dropdown" size="mini" v-model="assetData.idcId" clearable @change="getSingleIDCData" class="right-box-row-with-btn" placeholder="">
              <el-option
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
                      <span style="display: block;padding-bottom: 20px">{{$t('asset.createAssetTab.editIdcTab.title')}}</span>
                      <el-form-item :label="$t('asset.createAssetTab.dcName')">
                        <el-input v-model="popIdcData.name"/>
                      </el-form-item>
                      <el-form-item :label="$t('asset.createAssetTab.location')">
                        <el-input v-model="popIdcData.location"/>
                      </el-form-item>
                      <el-form-item :label="$t('asset.createAssetTab.principal')">
                        <el-select v-model="popIdcData.principal" clearable size="mini">
                          <el-option
                            v-for="item in idcUserData"
                            :key="item.key"
                            :label="item.username"
                            :value="item.userId"
                          >
                          </el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item :label="$t('asset.createAssetTab.editIdcTab.tel')">
                        <el-input size="mini" v-model="popIdcData.tel"/>
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
                      @click.stop="deleteData('idc',item.id)"><i
                  class="el-icon-delete"></i></span>
              </el-option>
            </el-select>
            <div class="right-box-row-btn right-box-row-btn-small">
              <idc-config-box placement="left" @after="getIDCOptionData"></idc-config-box>
              <!--<el-popover
                placement="left"
                trigger="click"
                v-model="popIDCVisible"
              >
                <div class="pop-window-assetType-content">
                  <div class="right-box-top-btns">
                    <div class="right-box-top-btn right-box-top-btn-full"
                         @click="popoverClose('idc')">
                      <div class="right-box-btn-icon">
                        <i class="el-icon-close"></i>
                      </div>
                      <span>{{$t('overall.esc')}}</span>
                    </div>
                  </div>
                  <div class="pop-window">
                      <span
                        style="display: block;padding-bottom: 20px">{{$t('asset.createAssetTab.AddIdcTab.title')}}</span>
                    <el-form-item :label="this.$t('asset.createAssetTab.AddIdcTab.dcName')">
                      <el-input v-model="addIdcData.name"/>
                    </el-form-item>
                    <el-form-item :label="this.$t('asset.createAssetTab.AddIdcTab.location')">
                      <el-input v-model="addIdcData.location"/>
                    </el-form-item>
                    <el-form-item :label="this.$t('asset.createAssetTab.AddIdcTab.principal')">
                      <el-select size="mini" v-model="addIdcData.principal" clearable>
                        <el-option
                          v-for="item in idcUserData"
                          :key="item.key"
                          :label="item.username"
                          :value="item.userId"
                        >
                        </el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item :label="this.$t('asset.createAssetTab.AddIdcTab.tel')">
                      <el-input v-model="addIdcData.tel"/>
                    </el-form-item>
                  </div>
                </div>
                <div class="right-box-bottom-btns">
                  <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                       @click="popoverClose('idc')">
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
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.location')">
            <span>{{idcSelectedData.location}}</span>
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.principal')">
            <span>{{this.getPrincipalName(idcSelectedData.principal)}}</span>
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.tel')">
            <span>{{idcSelectedData.tel}}</span>
          </el-form-item>
          <div class="line-100 asset-line"></div>
          <!------------------------------------------cabinet---------------------------------------------->
          <el-form-item :label="this.$t('asset.createAssetTab.cabinet')" class="right-box-form-content">
            <el-select v-model="assetData.cabinetId" clearable class="right-box-row-with-btn" popper-class="asset-dropdown"
                       :disabled="assetData.idcId==''?true:false" size="mini" placeholder=""
                       @change="getSingleCabinetData">
              <el-option
                v-for="item in cabinetOptionData"
                :key="item.key"
                :label="item.name"
                :value="item.id"
              >
                <span>{{ item.name }}</span>
                <el-popover
                  placement="left"
                  trigger="manual"
                  v-model="item[item.name]"
                  width="400"
                >
                  <div class="pop-window-assetType-content">
                    <div class="pop-top-btns">
                      <button type="button" @click="editData('cabinet',item)" class="nz-btn nz-btn-size-small nz-btn-style-normal">
                        <span class="top-tool-btn-txt">{{$t('overall.save')}}</span>
                      </button>
                      <button type="button" @click="item[item.name] = false" class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square">
                        <span class="top-tool-btn-txt"><i class="el-icon-close"></i></span>
                      </button>
                    </div>
                    <!--标题-->
                    <div class="pop-title">{{$t('asset.createAssetTab.editCabinetTab.title')}}</div>
                    <!--表单内容-->
                    <el-form class="pop-item-wider" :model="popCabinetData" ref="cabEditForm" :rules="cabRules">
                      <el-form-item :label="$t('asset.createAssetTab.editCabinetTab.name')" prop="name">
                        <el-input size="mini" v-model="popCabinetData.name"/>
                      </el-form-item>
                      <el-form-item :label="$t('asset.createAssetTab.editCabinetTab.uSize')" prop="uSize">
                        <div>{{popCabinetData.uSize}}</div>
                        <el-slider v-model.number="popCabinetData.uSize" :max="47"></el-slider>
                      </el-form-item>
                      <el-form-item :label="$t('asset.createAssetTab.editCabinetTab.remark')">
                        <el-input v-model="popCabinetData.remark"
                                  type="textarea"
                                  size="mini"
                                  :rows="2"/>
                      </el-form-item>
                      <el-form-item :label="$t('asset.createAssetTab.editCabinetTab.DC')">
                        <el-select v-model="popCabinetData.idcId" clearable placeholder="" size="mini" style="width: 100%;" prop="idcId">
                          <el-option
                            v-for="item in IDCOptionData"
                            :key="item.key"
                            :label="item.name"
                            :value="item.id"
                          >
                            <span>{{ item.name }}</span>
                            <!--                                                            <el-popover-->
                            <!--                                                                    placement="top"-->
                            <!--                                                                    v-model="item[item.name+item.id]"-->
                            <!--                                                            >-->
                            <!--                                                                <div class="pop-window-assetType-content">-->
                            <!--                                                                    <div class="right-box-top-btns">-->
                            <!--                                                                        <div class="right-box-top-btn right-box-top-btn-full"-->
                            <!--                                                                             @click="item[item.name+item.id] = false">-->
                            <!--                                                                            <div class="right-box-btn-icon">-->
                            <!--                                                                                <i class="el-icon-close"></i>-->
                            <!--                                                                            </div>-->
                            <!--                                                                            <span>{{$t('overall.esc')}}</span>-->
                            <!--                                                                        </div>-->
                            <!--                                                                    </div>-->
                            <!--                                                                    <div class="pop-window">-->
                            <!--                                                                        <span style="display: block;padding-bottom: 20px">标题</span>-->
                            <!--                                                                        <el-form-item label="DC Name">-->
                            <!--                                                                            <el-input v-model="addCabIDCData.name"/>-->
                            <!--                                                                        </el-form-item>-->
                            <!--                                                                        <el-form-item label="Location">-->
                            <!--                                                                            <el-input v-model="addCabIDCData.location"/>-->
                            <!--                                                                        </el-form-item>-->
                            <!--                                                                        <el-form-item label="负责人">-->
                            <!--                                                                            <el-select v-model="addCabIDCData.principal"-->
                            <!--                                                                                       clearable>-->
                            <!--                                                                                <el-option-->
                            <!--                                                                                        v-for="item in idcUserData"-->
                            <!--                                                                                        :key="item.key"-->
                            <!--                                                                                        :label="item.username"-->
                            <!--                                                                                        :value="item.userId"-->
                            <!--                                                                                >-->
                            <!--                                                                                </el-option>-->
                            <!--                                                                            </el-select>-->
                            <!--                                                                        </el-form-item>-->
                            <!--                                                                        <el-form-item label="Tel">-->
                            <!--                                                                            <el-input v-model="addCabIDCData.tel"/>-->
                            <!--                                                                        </el-form-item>-->
                            <!--                                                                    </div>-->
                            <!--                                                                </div>-->
                            <!--                                                                <div class="right-box-bottom-btns">-->
                            <!--                                                                    <div class="right-box-bottom-btn right-box-bottom-btn-cancel"-->
                            <!--                                                                         @click.stop="item[item.name+item.id]= false">-->
                            <!--                                                                        {{$t('overall.cancel')}}-->
                            <!--                                                                    </div>-->
                            <!--                                                                    <div class="right-box-bottom-btn right-box-bottom-btn-50"-->
                            <!--                                                                         @click="editData('idc',item,'CabIDC')">-->
                            <!--                                                                        {{$t('overall.save')}}-->
                            <!--                                                                    </div>-->
                            <!--                                                                </div>-->
                            <!--                                                                <span class="config-dropdown-btn" slot="reference"-->
                            <!--                                                                      @click="getSingleIDCData(item.id,'edit')"><i-->
                            <!--                                                                        class="el-icon-edit-outline"></i></span>-->
                            <!--                                                            </el-popover>-->
                            <!--                                                            <span class="config-dropdown-btn config-dropdown-btn-delete"-->
                            <!--                                                                  @click.stop="deleteData('idc',item.id)"><i-->
                            <!--                                                                    class="el-icon-delete"></i></span>-->
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-form>
                  </div>
                  <span class="config-dropdown-btn" slot="reference"
                      @click.stop="getSingleCabinetData(item.id,'edit',item)">
                    <i class="el-icon-edit-outline"></i>
                  </span>
                </el-popover>

                <span class="config-dropdown-btn config-dropdown-btn-delete"
                      @click.stop="deleteData('cabinet',item.id)">
                  <i class="el-icon-delete"></i>
                </span>
              </el-option>
            </el-select>

            <div class="right-box-row-btn right-box-row-btn-small">
              <el-popover
                placement="left"
                trigger="click"
                v-model="popCabinetVisible"
                width="400"
              >
                <div class="pop-window-assetType-content">
                  <div class="pop-top-btns">
                    <button type="button" @click="addNewData('cabinet')" class="nz-btn nz-btn-size-small nz-btn-style-normal">
                      <span class="top-tool-btn-txt">{{$t('overall.save')}}</span>
                    </button>
                    <button type="button" @click="popoverClose('cabinet')" class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square">
                      <span class="top-tool-btn-txt"><i class="el-icon-close"></i></span>
                    </button>
                  </div>
                  <!--标题-->
                  <div class="pop-title">{{$t('asset.createAssetTab.AddCabinetTab.title')}}</div>
                  <!--表单内容-->
                  <el-form class="pop-item-wider" :model="addCabinetData" ref="cabAddForm" :rules="cabRules">
                    <el-form-item :label="this.$t('asset.createAssetTab.AddCabinetTab.name')" prop="name">
                      <el-input size='mini' v-model="addCabinetData.name"/>
                    </el-form-item>
                    <el-form-item :label="this.$t('asset.createAssetTab.AddCabinetTab.uSize')" prop="uSize">
                      <div>{{addCabinetData.uSize}}</div>
                      <el-slider v-model.number="addCabinetData.uSize" :max="47"></el-slider>
                    </el-form-item>
                    <el-form-item :label="this.$t('asset.createAssetTab.AddCabinetTab.remark')">
                      <el-input size='mini' v-model="addCabinetData.remark" type="textarea" :rows="2"/>
                    </el-form-item>
                    <el-form-item :label="this.$t('asset.createAssetTab.AddCabinetTab.DC')" prop="idcId">
                      <el-select size='mini' v-model="addCabinetData.idcId" clearable style="width: 100%;" placeholder="">
                        <el-option
                          v-for="item in IDCOptionData"
                          :key="item.key"
                          :label="item.name"
                          :value="item.id"
                        >
                          <span>{{ item.name }}</span>
                          <!--<el-popover
                            placement="left"
                            v-model="item[item.id+item.name]"
                          >
                            <div class="pop-window-assetType-content">
                              <div class="right-box-top-btns">
                                <div class="right-box-top-btn right-box-top-btn-full"
                                     @click="item[item.id+item.name] = false">
                                  <div class="right-box-btn-icon">
                                    <i class="el-icon-close"></i>
                                  </div>
                                  <span>{{$t('overall.esc')}}</span>
                                </div>
                              </div>
                              <div class="pop-window">
                                <span style="display: block;padding-bottom: 20px">{{$t('asset.createAssetTab.editIdcTab.title')}}</span>
                                <el-form-item :label="$t('asset.createAssetTab.editIdcTab.dcName')">
                                  <el-input v-model="addCabIDCData.name"/>
                                </el-form-item>
                                <el-form-item :label="$t('asset.createAssetTab.editIdcTab.location')">
                                  <el-input v-model="addCabIDCData.location"/>
                                </el-form-item>
                                <el-form-item :label="$t('asset.createAssetTab.editIdcTab.principal')">
                                  <el-select v-model="addCabIDCData.principal"
                                             clearable>
                                    <el-option
                                      v-for="item in idcUserData"
                                      :key="item.key"
                                      :label="item.username"
                                      :value="item.userId"
                                    >
                                    </el-option>
                                  </el-select>
                                </el-form-item>
                                <el-form-item :label="$t('asset.createAssetTab.editIdcTab.tel')">
                                  <el-input v-model="addCabIDCData.tel"/>
                                </el-form-item>
                              </div>
                            </div>
                            <div class="right-box-bottom-btns">
                              <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                                   @click.stop="item[item.id+item.name]= false">
                                {{$t('overall.cancel')}}
                              </div>
                              <div class="right-box-bottom-btn right-box-bottom-btn-50"
                                   @click="editData('idc',item,'CabIDC')">
                                {{$t('overall.save')}}
                              </div>
                            </div>
                            <span class="config-dropdown-btn" slot="reference"
                                  @click="getSingleIDCData(item.id,'edit',item)"><i
                              class="el-icon-edit-outline"></i></span>
                          </el-popover>
                          <span class="config-dropdown-btn config-dropdown-btn-delete"
                                @click.stop="deleteData('idc',item.id)"><i
                            class="el-icon-delete"></i></span>-->
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-form>
                </div>
                <div slot="reference"><i class="el-icon-plus"></i></div>
              </el-popover>
            </div>
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.uSize')">
            <span>{{cabinetSelectedData.uSize}}</span>
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.remark')">
            <span>{{cabinetSelectedData.remark}}</span>
          </el-form-item>
          <!--CLI-->
          <div class="asset-sub-title">{{$t('asset.createAssetTab.cli')}}</div>
          <div class="line-100 asset-line"></div>
          <el-form-item :label="this.$t('asset.createAssetTab.loginType')">
            <div class="nz-btn-group float-left" style="padding-top: 4px;">
              <button type="button" @click="assetData.accounts[0].authType = 1"
                      class="nz-btn nz-btn-size-small float-left"
                      :class="{'nz-btn-disabled nz-btn-style-normal' : assetData.accounts[0].authType == 1, 'nz-btn-style-light' : assetData.accounts[0].authType == 2}">
                <span>{{$t('asset.createAssetTab.password')}}</span>
              </button>
              <button type="button" @click="assetData.accounts[0].authType = 2"
                      class="nz-btn nz-btn-size-small float-left"
                      :class="{'nz-btn-disabled nz-btn-style-normal' : assetData.accounts[0].authType == 2, 'nz-btn-style-light' : assetData.accounts[0].authType == 1}">
                <span>{{$t('asset.createAssetTab.ssh')}}</span>
              </button>
            </div>
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.account')" label-position="top">
            <el-input size="mini" v-model="assetData.accounts[0].user"/>
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.password')" v-if="assetData.accounts[0].authType==1">
            <el-input size="mini" type="password" v-model="assetData.accounts[0].pwd"/>
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.port')">
            <el-input size="mini" v-model="assetData.accounts[0].port"/>
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.ssh')" v-if="assetData.accounts[0].authType==2">
            <el-upload
              class="upload-demo"
              ref="upload"
              action=""
              :on-change="handleChange"
              :auto-upload="false"
            >
              <button type="button" class="nz-btn nz-btn-size-small nz-btn-style-normal">
                <span class="top-tool-btn-txt">{{$t('asset.createAssetTab.clickToUpload')}}</span>
              </button>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-scrollbar>
    </div>
  </transition>
</template>

<script>
  export default {
    name: "assetAddUnit",
    props: {
      addUnitShow: Boolean
    },
    data() {
      return {
        assetData: {
          id: '',
          sn: '',
          host: '',
          assetType: '',
          state: 1,
          purchaseDate: '',
          idcId: '',
          cabinetId: '',
          modelId: '',
          accounts: [{
            authType: 1,
            user: '',
            pwd: '',
            cert: '',
            port: '',
          }]
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
        editCabIDCData: {
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
        addForm: {
          sn: '',
          host: '',
          state: '',
        },
        tempData: '',
        isResourceShow: 0,
        modelClickData: '',
        popState: true,
        rules: {
          sn: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          host: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
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
        }
      }
    },
    computed: {
      getData() {
        return this.$store.state.assetData
      }
    },
    watch: {
      allModelUlData(newVal) {
        if (newVal) {
          this.getConnectData()
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
          this.getAssetTypeOptionData()
        }
      },
      clickOutSide(data) {
        if (data) {
          this.editQuit()
          this.modelCount = ''
          this.assetTypeData.value = ''
          this.addVendorData.value = ''
          this.addNewModelData.value = ''
          this.vendorCount = ''
          this.modelCount = ''
        }
      },
      editQuit() {
        for (let i of this.assetTypeOptionData) {
          if (i.isEdit === true) {
            i.isEdit = false
            this.getAssetTypeOptionData()
          }
        }
        for (let i of this.vendorUlData) {
          if (i.isEdit === true) {
            i.isEdit = false
            this.getVendorOptionData()
          }
        }
        for (let i of this.modelUlData) {
          if (i.isEdit === true) {
            i.isEdit = false
            this.getModelOptionData(this.assetType, this.vendorCode)
          }
        }
      },
      getIDCOptionData() {
        this.$get('idc').then(response => {
          if (response.code === 200) {
            this.IDCOptionData = response.data.list;
            this.markOptionData(this.IDCOptionData)
            this.$store.state.assetData.idcData = this.IDCOptionData;
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
        this.$get('model?typeCode=' + this.assetType).then(response => {
          if (response.code === 200) {
            this.allModelUlData = response.data.list
          }
        })
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
          item.name = this.popCabinetData.name
          item.uSize = this.popCabinetData.uSize
          item.remark = this.popCabinetData.remark
          item.idcId = this.popCabinetData.idcId
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
          idcData.id = item.id
          idcData.name = this.addCabIDCData.name
          idcData.location = this.addCabIDCData.location
          idcData.principal = this.addCabIDCData.principal
          idcData.tel = this.addCabIDCData.tel
          item = idcData
        }
        this.$put(data, item).then(res => {
          const h = this.$createElement;
          if (res.code === 200) {
            this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
            this.getAssetTypeOptionData();
            this.getIDCOptionData();
            this.getAllModelOptionData();
            if (data === 'cabinet') {
              this.getCabinetOptionData(item.idcId);
            }
            this.$emit('refreshData', 'true');
          } else {
            this.$message.error(res.msg);
          }
        })
      },
      addNewData(type) {
        if (type === 'IDC') {
          this.$post('idc', this.addIdcData).then(res => {
            const h = this.$createElement;
            if (res.code === 200) {
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
        if (type === 'asset') {
          this.$refs.addAssetForm.validate((valid) => {
            if (valid) {
              let modelId = ''
              let authType = ''
              if (this.assetData.modelId !== '') {
                modelId = this.assetData.modelId.join(',').split(',')[1]
              } else {
                this.assetData.modelId = ''
              }
              if (this.assetData.accounts[0].user === '') {
                authType = ''
              } else {
                authType = this.assetData.accounts[0].authType
              }
              let form = new FormData();
              form.append("sn", this.assetData.sn);
              form.append("host", this.assetData.host);
              form.append("state", this.assetData.state);
              form.append("purchaseDate", this.assetData.purchaseDate);
              form.append("idcId", this.assetData.idcId);
              form.append("cabinetId", this.assetData.cabinetId);
              form.append("modelId", modelId);
              form.append("accounts[0].authType", authType);
              form.append("accounts[0].user", this.assetData.accounts[0].user);
              form.append("accounts[0].pwd", this.assetData.accounts[0].pwd);
              form.append("accounts[0].port", this.assetData.accounts[0].port);
              this.$post('asset', form).then(res => {
                const h = this.$createElement;
                if (res.code === 200) {
                  this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.sendStateData('close');
                } else {
                  this.$message.error(res.msg);
                }
              });
              this.$emit('refreshData', 'true');
            }
          });
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
            if (res.code === 200) {
              this.getModelOptionData(this.assetType, this.vendorCode)
              const h = this.$createElement;
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
              this.getAllModelOptionData(this.assetType)
            } else {
              const h = this.$createElement;
              this.$message.error(res.msg);
            }
          })
        }
        if (type === 'cabinet') {
          if (this.assetData.idcId != '') {
            this.addCabinetData.idcId = this.assetData.idcId
          }
          this.$post('cabinet', this.addCabinetData).then(res => {
            const h = this.$createElement;
            if (res.code === 200) {
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
              this.getCabinetOptionData(this.addCabinetData.idcId)
              this.popoverClose('cabinet');
              this.editPopoverClose('cabinet');
            } else {
              this.$message.error(res.msg);
            }
          })
        }
      },
      deleteData(data, item) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete(data + "?ids=" + item).then(response => {
            const h = this.$createElement;
            if (response.code === 200) {
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.$emit('refreshData', 'true')
              this.getIDCOptionData()
              this.getVendorOptionData()
              this.getCabinetOptionData(this.assetData.idcId)
              this.getAllModelOptionData(this.assetType)
              this.getModelOptionData(this.assetType, this.vendorCode)
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
          this.$set(item, item.name, false)
          this.$set(item, item.id, false)
          this.$set(item, item.id + item.name, false)
          this.$set(item, item.name + item.id, false)
        })
      },
      getConnectData() {
        this.isResourceShow += 1
        let resultData = []
        let modelData = this.allModelUlData
        for (let i = 0; i < modelData.length; i++) {
          if (!modelData[i].vendor) {
            continue;
          }
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
            if (!modelData[y].vendor) {
              continue;
            }
            if (result[x].code === modelData[y].vendor.code) {
              let obj2 = {};
              obj2.value = modelData[y].id;
              obj2.label = modelData[y].name;
              result[x].children.push(obj2);
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
            const element = this.assetTypeOptionData[i];
            if (item.id !== element.id) {
              element.isEdit = false
              element.value = element.oldName
            }
          }
        }
        if (data === 'model') {
          for (let i = 0; i < this.modelUlData.length; i++) {
            const element2 = this.modelUlData[i];
            if (item.id !== element2.id) {
              element2.isEdit = false
              element2.name = element2.modelOldName
            }
          }
        }
      },
      handleChange(file) {
        this.assetData.accounts[0].file = file.raw
      },
      delOptionData(data) {
      },
      sendStateData(data) {
        this.$emit('sendStateData', 'close')
        this.initAdd()
      },
      initAdd() {
        this.assetType = ''
        this.assetData.sn = ''
        this.assetData.host = ''
        this.assetData.state = ''
        this.assetData.purchaseDate = ''
        this.assetData.idcId = ''
        this.assetData.cabinetId = ''
        this.assetData.modelId = ''
        this.assetData.accounts[0].authType = 1
        this.assetData.accounts[0].user = ''
        this.assetData.accounts[0].pwd = ''
        this.assetData.accounts[0].port = ''
        this.assetData.accounts[0].file = ''
        this.idcSelectedData.location = ''
        this.idcSelectedData.principal = ''
        this.idcSelectedData.tel = ''
        this.cabinetSelectedData.uSize = 0
        this.cabinetSelectedData.remark = ''
      },
      editing(item) {
        console.log(item)
      },
      getSingleIDCData(data, item, itemData) {
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
          this.clickFlush('idc', itemData)
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
          this.cabinetSelectedData.remark = null;
          this.cabinetOptionData.forEach(items => {
            if (items.id === data) {
              this.cabinetSelectedData.uSize = items.uSize;
              this.cabinetSelectedData.remark = items.remark;
            }
          })
        } else {
          this.clickFlush('cabinet', item)
          item[item.name] = !item[item.name];
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
      getLidata(index, item) {
        this.vendorCount = index;
        this.vendorCode = item.code;
        this.getModelOptionData(this.assetType, this.vendorCode)
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
          this.addIdcData.name = '',
            this.addIdcData.location = '',
            this.addIdcData.principal = '',
            this.addIdcData.tel = ''
        }
        if (data === 'cabinet') {
          this.popCabinetVisible = false
          this.addCabinetData.name = ''
          this.addCabinetData.uSize = 0
          this.addCabinetData.remark = ''
          this.addCabinetData.idcId = ''
        }
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
      this.getCabinetOptionData('')
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
</style>
