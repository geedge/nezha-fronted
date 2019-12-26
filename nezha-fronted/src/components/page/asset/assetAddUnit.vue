<template>
    <transition name="right-box">
        <div class="right-menu" v-if="addUnitShow" @click="editQuit">
            <div class="right-box-top-btns">
                <div class="right-box-top-btn right-box-top-btn-full" @click.stop="sendStateData('close')">
                    <div class="right-box-btn-icon">
                        <i class="el-icon-close"></i>
                    </div>
                    <span>{{$t('overall.esc')}}</span>
                </div>
                <div class="right-box-top-btn right-box-top-btn-full" @click.stop="addNewData('asset')">
                    <div class="right-box-btn-icon">
                        <i class="el-icon-edit-outline"></i>
                    </div>
                    <span>{{$t('overall.save')}}</span>
                </div>
            </div>
            <div class="right-box-title">{{$t('asset.createAssetTab.title')}}</div>
            <el-form :model="assetData" label-width="120px">
                <div class="el-form-style">
                    <el-form-item :label="this.$t('asset.createAssetTab.title')" prop="sn">
                        <el-input v-model="assetData.sn"/>
                    </el-form-item>
                    <el-form-item :label="this.$t('asset.createAssetTab.host')" prop="host">
                        <el-input v-model="assetData.host"/>
                    </el-form-item>
                    <el-form-item :label="this.$t('asset.createAssetTab.state')" prop="state">
                        <div class="select-style">
                            <el-select v-model="assetData.state" :placeholder="this.$t('asset.createAssetTab.selectTip')">
                                <el-option
                                        v-for="item in assetStateOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                                </el-option>
                            </el-select>
                        </div>
                    </el-form-item>
                    <div style="font-size: 10px">{{$t('asset.createAssetTab.assetInfo')}}</div>
                    <el-divider></el-divider>
                    <!------------------------------------------资产类型---------------------------------------------->
                    <el-form-item :label="this.$t('asset.createAssetTab.assetType')" prop="assetType">
                        <div class="select-style">
                            <el-select v-model="assetType" clearable @change="getAllModelOptionData" @visible-change="cancelEdit">
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
                                        <i class="el-icon-check" v-if="item.isEdit" @click="editData('sys/dict/update',item)"></i>
                                    </span>
                                    <span class="config-dropdown-btn config-dropdown-btn-delete"><i class="el-icon-delete"></i></span>
                                </el-option>
                            </el-select>
                            <div class="el-select-add-btn">
                                <el-popover
                                        placement="left"
                                        trigger="manual"
                                        v-model="popTypeVisible"
                                >
                                    <div class="pop-window-assetType" @click="editQuit()">
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
                                            <span style="display: block;padding-bottom: 20px">{{$t('asset.createAssetTab.assetTypeTab.assetType')}}</span>
                                            <span style="display: block;padding-bottom: 20px">{{$t('asset.createAssetTab.assetTypeTab.addAssetType')}}</span>
                                            <input v-model="assetTypeData.value"/>
                                            <input type="button" value="+Add" @click="addNewData('assetType')"></input>
                                            <span style="display: block;padding-bottom: 20px">{{$t('asset.createAssetTab.assetTypeTab.existAssetType')}}</span>
                                            <div class="li-list">
                                                <ul style="list-style: none">
                                                    <li style="cursor: pointer;"
                                                        v-for="(item,index) in assetTypeOptionData"
                                                        @click="clickState(index,item,'type')"
                                                        :class="{activeColor:modelCount === index}"
                                                        :key="index">
                                                        <div>
                                                            <span v-if="!item.isEdit">{{ item.value }}</span>
                                                            <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop="editing">
                                                                <input type="text" v-model="item.value" size="mini"/>
                                                            </span>
                                                            <span class="config-dropdown-btn" @click.stop="editOptionData(item,'type',index)">
                                                                <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                                                <i class="el-icon-check" v-if="item.isEdit" @click="editData('sys/dict/update',item)"></i>
                                                            </span>
                                                            <span class="config-dropdown-btn config-dropdown-btn-delete" @click.stop="deleteData('/sys/dict/delete',item.id)">
                                                                <i class="el-icon-delete"></i>
                                                            </span>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="right-box-bottom-btns">
                                        <div class="right-box-bottom-btn right-box-bottom-btn-cancel" @click="popoverClose('type')">
                                            {{$t('overall.cancel')}}
                                        </div>
                                        <div class="right-box-bottom-btn right-box-bottom-btn-50" @click="transferData('type')">
                                            {{$t('overall.save')}}
                                        </div>
                                    </div>
                                    <div slot="reference" style="font-size: 18px">+</div>
                                </el-popover>
                            </div>
                        </div>
                    </el-form-item>
                    <!------------------------------------------厂商/型号---------------------------------------------->
                    <el-form-item :label="this.$t('asset.createAssetTab.vendor')">
                        <div class="select-style">
                            <el-cascader
                                    :options="vendorTypeOptionData"
                                    :key="isResourceShow"
                                    v-model="assetData.modelId"
                                    :disabled="this.assetType!=''?false:true"
                                    clearable
                            >
                            </el-cascader>
                            <div class="el-select-add-btn">
                                <el-popover
                                        placement="left"
                                        trigger="click"
                                        v-model="popCompVisible"
                                        :disabled=popState
                                        v-clickoutside="clickOutSide"
                                >
                                    <div class="pop-window-assetType" @click="editQuit()">
                                        <div class="pop-window-assetType-content">
                                            <div class="right-box-top-btns">
                                                <div class="right-box-top-btn right-box-top-btn-full"
                                                     @click="popoverClose('vendor')">
                                                    <div class="right-box-btn-icon">
                                                        <i class="el-icon-close"></i>
                                                    </div>
                                                    <span>{{$t('overall.esc')}}</span>
                                                </div>
                                            </div>
                                            <div class="pop-window-assetType">
                                                <span style="display: block;padding-bottom: 15px">{{$t('asset.createAssetTab.vendorTab.vendor')}}</span>
                                                <span style="display: block;padding-bottom: 20px">{{$t('asset.createAssetTab.vendorTab.vendorName')}}</span>
                                                <input v-model="addVendorData.value"/>
                                                <input type="button" value="+Add"
                                                       @click="addNewData('vendor')"></input>
                                                <span style="display: block;padding-bottom: 20px">{{$t('asset.createAssetTab.vendorTab.existVendor')}}</span>
                                                <div class="li-list-part">
                                                    <ul style="list-style: none">
                                                        <li style="cursor: pointer;"
                                                            v-for="(item,index) in vendorUlData"
                                                            @click="getLidata(index,item)"
                                                            :class="{activeColor:vendorCount === index}"
                                                            :key="index">
                                                            <div>
                                                                <span v-if="!item.isEdit">{{ item.value }}</span>
                                                                <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop="editing">
                                                                    <input type="text" v-model="item.value" size="mini"/>
                                                                </span>
                                                                <span class="config-dropdown-btn" @click.stop="editVendorOptionData(item,'vendor',index)">
                                                                    <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                                                    <i class="el-icon-check" v-if="item.isEdit" @click="editData('sys/dict/update',item)"></i>
                                                                </span>
                                                                <span class="config-dropdown-btn config-dropdown-btn-delete" @click.stop="deleteData('/sys/dict/delete',item.id)"><i class="el-icon-delete"></i></span>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <span style="display: block;padding-bottom: 15px">{{$t('asset.createAssetTab.vendorTab.modelName')}}</span>
                                                <input v-model="addNewModelData.name"/>
                                                <input type="button" value="+Add"
                                                       @click="addNewData('model')"></input>
                                                <span style="display: block;padding-bottom: 20px">{{$t('asset.createAssetTab.vendorTab.existModel')}}</span>
                                                <div class="li-list-part">
                                                    <ul style="list-style: none">
                                                        <li style="cursor: pointer;"
                                                            v-for="(item,index) in modelUlData"
                                                            @click="clickState(index,item,'model') "
                                                            :class="{activeColor:modelCount === index}"
                                                            :key="index">
                                                            <span v-if="!item.isEdit">{{ item.name }}</span>
                                                            <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop="editing">
                                                                <input type="text" v-model="item.name" size="mini"/>
                                                            </span>
                                                            <span class="config-dropdown-btn" @click.stop="editOptionData(item,'model',index)">
                                                                <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                                                <i class="el-icon-check" v-if="item.isEdit" @click="editData('model',item)"></i>
                                                            </span>
                                                            <span class="config-dropdown-btn config-dropdown-btn-delete" @click.stop="deleteData('model',item.id)"><i
                                                                    class="el-icon-delete"></i>
                                                            </span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="right-box-bottom-btns">
                                        <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                                             @click="popoverClose('vendor')">
                                            {{$t('overall.cancel')}}
                                        </div>
                                        <div class="right-box-bottom-btn right-box-bottom-btn-50"
                                             @click="transferData('model')">
                                            {{$t('overall.save')}}
                                        </div>
                                    </div>
                                    <div slot="reference" style="font-size: 18px">+</div>
                                </el-popover>
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item :label="this.$t('asset.createAssetTab.purchaseDate')" prop="purchaseDate">
                        <div class="select-style">
                            <el-date-picker
                                    v-model="assetData.purchaseDate"
                                    value-format="yyyy-MM-dd"
                                    type="date"
                                    :placeholder="this.$t('asset.createAssetTab.dataSelectTip')">
                            </el-date-picker>
                        </div>
                    </el-form-item>
                    <div style="font-size: 10px">{{$t('asset.createAssetTab.dc')}}</div>
                    <el-divider></el-divider>
                    <!------------------------------------------IDC---------------------------------------------->
                    <el-form-item :label="this.$t('asset.createAssetTab.dcName')" prop="idcSelect">
                        <div class="select-style">
                            <el-select v-model="assetData.idcId" clearable @change="getSingleIDCData">
                                <el-option
                                        v-for="item in IDCOptionData"
                                        :key="item.key"
                                        :label="item.name"
                                        :value="item.id"
                                >
                                    <span>{{ item.name }}</span>
                                    <el-popover
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
                                                <span style="display: block;padding-bottom: 20px">{{vm.$t('asset.createAssetTab.editIdcTab.title')}}</span>
                                                <el-form-item :label="vm.$t('asset.createAssetTab.dcName')">
                                                    <el-input v-model="popIdcData.name"/>
                                                </el-form-item>
                                                <el-form-item :label="vm.$t('asset.createAssetTab.location')">
                                                    <el-input v-model="popIdcData.location"/>
                                                </el-form-item>
                                                <el-form-item :label="vm.$t('asset.createAssetTab.principal')">
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
                                                <el-form-item :label="vm.$t('asset.createAssetTab.editIdcTab.tel')">
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
                                    </el-popover>
                                    <span class="config-dropdown-btn config-dropdown-btn-delete"
                                          @click.stop="deleteData('idc',item.id)"><i
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
                                                 @click="popoverClose('idc')">
                                                <div class="right-box-btn-icon">
                                                    <i class="el-icon-close"></i>
                                                </div>
                                                <span>{{$t('overall.esc')}}</span>
                                            </div>
                                        </div>
                                        <div class="pop-window">
                                            <span style="display: block;padding-bottom: 20px">{{$t('asset.createAssetTab.AddIdcTab.title')}}</span>
                                            <el-form-item :label="this.$t('asset.createAssetTab.AddIdcTab.dcName')">
                                                <el-input v-model="addIdcData.name"/>
                                            </el-form-item>
                                            <el-form-item :label="this.$t('asset.createAssetTab.AddIdcTab.location')">
                                                <el-input v-model="addIdcData.location"/>
                                            </el-form-item>
                                            <el-form-item :label="this.$t('asset.createAssetTab.AddIdcTab.principal')">
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
                                    <div slot="reference" style="font-size: 18px">+</div>
                                </el-popover>
                            </div>
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
                    <el-divider></el-divider>
                    <!------------------------------------------cabinet---------------------------------------------->
                    <el-form-item :label="this.$t('asset.createAssetTab.cabinet')">
                        <div class="select-style">
                            <el-select v-model="assetData.cabinetId" clearable
                                       :disabled="assetData.idcId==''?true:false"
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
                                                <span style="display: block;padding-bottom: 20px">{{vm.$t('asset.createAssetTab.editCabinetTab.title')}}</span>
                                                <el-form-item :label="vm.$t('asset.createAssetTab.editCabinetTab.title')">
                                                    <el-input v-model="popCabinetData.name"/>
                                                </el-form-item>
                                                <el-form-item :label="vm.$t('asset.createAssetTab.editCabinetTab.uSize')">
                                                    <div>{{popCabinetData.uSize}}</div>
                                                    <el-slider v-model="popCabinetData.uSize"
                                                               :max="47"></el-slider>
                                                </el-form-item>
                                                <el-form-item :label="vm.$t('asset.createAssetTab.editCabinetTab.remark')">
                                                    <el-input v-model="popCabinetData.remark"
                                                              type="textarea"
                                                              :rows="2"/>
                                                </el-form-item>
                                                <el-form-item :label="vm.$t('asset.createAssetTab.editCabinetTab.DC')">
                                                    <el-select v-model="popCabinetData.idcId" clearable>
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
                                            </div>
                                        </div>
                                        <div class="right-box-bottom-btns">
                                            <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                                                 @click.stop="item[item.name]= false">
                                                {{$t('overall.cancel')}}
                                            </div>
                                            <div class="right-box-bottom-btn right-box-bottom-btn-50"
                                                 @click="editData('cabinet',item)">
                                                {{$t('overall.save')}}
                                            </div>
                                        </div>
                                        <span class="config-dropdown-btn" slot="reference"
                                              @click.stop="getSingleCabinetData(item.id,'edit',item)">
                                          <i class="el-icon-edit-outline"></i></span>
                                    </el-popover>

                                    <span class="config-dropdown-btn config-dropdown-btn-delete"
                                          @click.stop="deleteData('cabinet',item.id)"><i
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
                                                 @click="popoverClose('cabinet')">
                                                <div class="right-box-btn-icon">
                                                    <i class="el-icon-close"></i>
                                                </div>
                                                <span>{{$t('overall.esc')}}</span>
                                            </div>
                                        </div>
                                        <div class="pop-window">
                                            <span style="display: block;padding-bottom: 20px">{{$t('asset.createAssetTab.AddCabinetTab.title')}}</span>
                                            <el-form-item :label="this.$t('asset.createAssetTab.AddCabinetTab.name')">
                                                <el-input v-model="addCabinetData.name"/>
                                            </el-form-item>
                                            <el-form-item :label="this.$t('asset.createAssetTab.AddCabinetTab.uSize')">
                                                <div>{{addCabinetData.uSize}}</div>
                                                <el-slider v-model="addCabinetData.uSize"
                                                           :max="47"></el-slider>
                                            </el-form-item>
                                            <el-form-item :label="this.$t('asset.createAssetTab.AddCabinetTab.remark')">
                                                <el-input v-model="addCabinetData.remark"
                                                          type="textarea"
                                                          :rows="2"/>
                                            </el-form-item>
                                            <el-form-item :label="this.$t('asset.createAssetTab.AddCabinetTab.DC')">
                                                <el-select v-model="addCabinetData.idcId" clearable>
                                                    <el-option
                                                            v-for="item in IDCOptionData"
                                                            :key="item.key"
                                                            :label="item.name"
                                                            :value="item.id"
                                                    >
                                                        <span>{{ item.name }}</span>
                                                        <el-popover
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
                                                                    <el-form-item label="DC Name">
                                                                        <el-input v-model="addCabIDCData.name"/>
                                                                    </el-form-item>
                                                                    <el-form-item label="Location">
                                                                        <el-input v-model="addCabIDCData.location"/>
                                                                    </el-form-item>
                                                                    <el-form-item label="负责人">
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
                                                                    <el-form-item label="Tel">
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
                                                                class="el-icon-delete"></i></span>
                                                    </el-option>
                                                </el-select>
                                            </el-form-item>
                                        </div>
                                    </div>
                                    <div class="right-box-bottom-btns">
                                        <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                                             @click="popoverClose('cabinet')">
                                            {{$t('overall.cancel')}}
                                        </div>
                                        <div class="right-box-bottom-btn right-box-bottom-btn-50"
                                             @click="addNewData('cabinet')">
                                            {{$t('overall.save')}}
                                        </div>
                                    </div>
                                    <div slot="reference" style="font-size: 18px">+</div>
                                </el-popover>
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item :label="this.$t('asset.createAssetTab.uSize')">
                        <span>{{cabinetSelectedData.uSize}}</span>
                    </el-form-item>
                    <el-form-item :label="this.$t('asset.createAssetTab.remark')">
                        <span>{{cabinetSelectedData.remark}}</span>
                    </el-form-item>
                    <div style="font-size: 10px">{{$t('asset.createAssetTab.cli')}}</div>
                    <el-divider></el-divider>
                    <el-form-item :label="this.$t('asset.createAssetTab.loginType')">
                        <el-radio-group size="mini" v-model="assetData.accounts[0].authType">
                            <el-radio-button label='1'>{{$t('asset.createAssetTab.password')}}</el-radio-button>
                            <el-radio-button label='2'>{{$t('asset.createAssetTab.ssh')}}</el-radio-button>
                        </el-radio-group>
                    </el-form-item >
                        <el-form-item :label="this.$t('asset.createAssetTab.account')" label-position="top">
                            <el-input v-model="assetData.accounts[0].user"/>
                        </el-form-item>
                    <el-form-item :label="this.$t('asset.createAssetTab.password')" v-if="assetData.accounts[0].authType==1">
                        <el-input type="password" v-model="assetData.accounts[0].pwd"/>
                    </el-form-item>
                    <el-form-item :label="this.$t('asset.createAssetTab.port')">
                        <el-input v-model="assetData.accounts[0].port"/>
                    </el-form-item>
                    <el-form-item :label="this.$t('asset.createAssetTab.ssh')" v-if="assetData.accounts[0].authType==2">
                        <el-upload
                                class="upload-demo"
                                ref="upload"
                                action=""
                                :on-change="handleChange"
                                :auto-upload="false"
                        >
                            <el-button size="small" type="primary">{{$t('asset.createAssetTab.clickToUpload')}}</el-button>
                        </el-upload>
                    </el-form-item>
                </div>
            </el-form>
            <div class="">
                <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                     @click.stop="sendStateData('close')">
                    {{$t('overall.cancel')}}
                </div>
                <div class="right-box-bottom-btn right-box-bottom-btn-50"
                     @click="addNewData('asset')">
                    {{$t('overall.save')}}
                </div>
            </div>
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
    const vm = window.vm;
    return {
      vm:vm,
      assetData: {
        id: '',
        sn: '',
        host: '',
        state: '',
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
          label: '在库'
        }, {
          value: 2,
          label: '出库'
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
      if (newVal == '') {
        this.popState = true
      } else {
        this.popState = false
      }
    },
  },
  methods: {
    cancelEdit(data){
      if(data===false){
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
          this.$store.state.assetData.idcData = this.IDCOptionData
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
          this.$notify({
            message: h('i', {style: 'color: teal'}, '修改成功'),
            duration: 2000
          })
          this.getIDCOptionData()
          this.getAllModelOptionData();
          this.getCabinetOptionData('')
          this.$emit('refreshData', 'true')
        } else {
          this.$notify({
            message: h('i', {style: 'color: teal'}, res.msg),
            duration: 2000
          });
        }
      })
    },
    addNewData(type) {
      if (type === 'IDC') {
        this.$post('idc', this.addIdcData).then(res => {
          const h = this.$createElement;
          if (res.code === 200) {
            this.$notify({
              message: h('i', {style: 'color: teal'}, '添加成功'),
              duration: 2000
            });
            this.getIDCOptionData()
            this.getAssetData()
          } else {
            this.$notify({
              message: h('i', {style: 'color: teal'}, res.msg),
              duration: 2000
            });
          }
        })
      }
      if (type === 'assetType') {
        this.$post('sys/dict/save', this.assetTypeData).then(res => {
          const h = this.$createElement;
          if (res.code === 200) {
            this.getAssetTypeOptionData()
            this.$notify({
              message: h('i', {style: 'color: teal'}, '添加成功'),
              duration: 2000
            });
          } else {
            this.$notify({
              message: h('i', {style: 'color: teal'}, res.msg),
              duration: 2000
            });
          }
        })
      }
      if (type === 'asset') {
        let modelId = ''
        let authType = ''
        console.log(this.assetData.modelId)
        if(this.assetData.modelId !== ''){
          modelId = this.assetData.modelId.join(',').split(',')[1]
        }else{
          this.assetData.modelId=''
        }
        if(this.assetData.accounts[0].user === ''){
          authType = ''
        }else{
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
            this.$notify({
              message: h('i', {style: 'color: teal'}, '添加成功'),
              duration: 2000
            });
            this.sendStateData('close')
          }else{
            this.$notify({
              message: h('i', {style: 'color: teal'}, res.msg),
              duration: 2000
            });
          }
        })
        this.$emit('refreshData', 'true')
      }
      if (type === 'vendor') {
        const h = this.$createElement;
        this.$post('sys/dict/save', this.addVendorData).then(res => {
          if (res.code === 200) {
            this.$notify({
              message: h('i', {style: 'color: teal'}, '添加成功'),
              duration: 2000
            });
            this.getVendorOptionData()
          }else{
            this.$notify({
              message: h('i', {style: 'color: teal'}, res.msg),
              duration: 2000
            });
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
        if (this.assetData.idcId != '') {
          this.addCabinetData.idcId = this.assetData.idcId
        }
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
          this.$emit('refreshData', 'true')
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
    editVendorOptionData(item,data,index){
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
      if(data==='vendor') {
        for (let i = 0; i < this.vendorUlData.length; i++) {
          const element = this.vendorUlData[i];
          if (item.id !== element.id) {
            element.isEdit = false
            element.value = element.oldName
          }
        }
      }
    },
    editOptionData(item,data,index) {
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
      if(data==='type') {
        for (let i = 0; i < this.assetTypeOptionData.length; i++) {
          const element = this.assetTypeOptionData[i];
          if (item.id !== element.id) {
            element.isEdit = false
            element.value = element.oldName
          }
        }
      }
      if(data==='model') {
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
      this.assetData.accounts[0].authType =1
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
            this.popIdcData.name = item.name
            this.popIdcData.location = item.location
            this.popIdcData.principal = item.principal
            this.popIdcData.tel = item.tel
            this.addCabIDCData.name = item.name
            this.addCabIDCData.location = item.location
            this.addCabIDCData.principal = item.principal
            this.addCabIDCData.tel = item.tel
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
            console.log(items)
            this.popCabinetData.name = items.name
            this.popCabinetData.uSize = items.uSize
            this.popCabinetData.remark = items.remark
            this.popCabinetData.idcId = items.idcId
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
        this.addIdcData.name= '',
        this.addIdcData.location= '',
        this.addIdcData.principal= '',
        this.addIdcData.tel= ''
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

<style>
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
