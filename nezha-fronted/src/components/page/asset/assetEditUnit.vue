<template>
    <transition name="right-box">
        <div class="right-menu" v-if="editUnitShow">
            <div class="right-box-top-btns">
                <div class="right-box-top-btn right-box-top-btn-full" @click.stop="sendStateData('close')">
                    <div class="right-box-btn-icon">
                        <i class="el-icon-close"></i>
                    </div>
                    <span>{{$t('overall.esc')}}</span>
                </div>
                <div class="right-box-top-btn right-box-top-btn-full" @click="editData('asset')"
                     v-if="!tabView">
                    <div class="right-box-btn-icon">
                        <i class="el-icon-edit-outline"></i>
                    </div>
                    <span v-if="!tabView">{{$t('overall.save')}}</span>
                </div>
                <div class="right-box-top-btn right-box-top-btn-full" @click="tabView=false"
                     v-if="tabView">
                    <div class="right-box-btn-icon">
                        <i class="el-icon-edit-outline"></i>
                    </div>
                    <span v-if="tabView">{{$t('overall.edit')}}</span>
                </div>
                <div class="right-box-top-btn" v-if="!tabView">
                    <div class="right-box-btn-icon">
                        <i class="el-icon-delete"></i>
                    </div>
                    <span>{{$t('overall.delete')}}</span>
                </div>
            </div>
            <div class="right-box-title">{{this.tabView==true? 'Asset':'Edit Asset'}}</div>
            <el-form ref="form" :model="assetData" label-width="120px">
                <div class="el-form-style">
                    <el-form-item label="SN">
                        <el-input v-if="!tabView" v-model="assetData.sn"/>
                        <span v-if="tabView">{{assetData.sn}}</span>
                    </el-form-item>
                    <el-form-item label="Host">
                        <el-input v-if="!tabView" v-model="assetData.host"/>
                        <span v-if="tabView">{{assetData.host}}</span>
                    </el-form-item>
                    <el-form-item label="State">
                        <div v-if="!tabView" class="select-style">
                            <el-select v-model="assetData.state" placeholder="请选择">
                                <el-option
                                        v-for="item in assetStateOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                                </el-option>
                            </el-select>
                        </div>
                        <span v-if="tabView">{{assetData.state==1?'在库':'出库'}}</span>
                    </el-form-item>
                    <el-form-item label="ModelId" v-if="tabView">
                        <div class="tab-input-square">{{assetViewData.moduleNum}}</div>
                    </el-form-item>
                    <el-form-item label="IDC" v-if="tabView">
                        <div class="tab-input-square">{{assetViewData.alertNum}}</div>
                    </el-form-item>
                    <div style="font-size: 10px">资产信息</div>
                    <el-divider></el-divider>
                    <!------------------------------------------资产类型---------------------------------------------->
                    <el-form-item label="资产类型">
                        <div class="select-style">
                            <el-select v-if="!tabView" v-model="assetType" clearable
                                       @change="getAllModelOptionData()">
                                <el-option
                                        v-for="item in assetTypeOptionData"
                                        :key="item.id"
                                        :value="item.code"
                                        :label="item.value"
                                >
                                    <span v-if="!item.isEdit">{{ item.value }}</span>
                                    <span class="config-dropdown-label-input" v-if="item.isEdit"
                                          @click.stop="editing(item)">
                    <el-input type="text" v-model="item.value" size="mini"/>
                  </span>
                                    <span class="config-dropdown-btn"
                                          @click.stop="editOptionData(item)">
                    <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                    <i class="el-icon-check" v-if="item.isEdit"
                       @click="editData('sys/dict/update',item)"></i>
                  </span>
                                    <span class="config-dropdown-btn config-dropdown-btn-delete"
                                          @click.stop="delOptionData(item)"><i
                                            class="el-icon-delete"></i>
                  </span>
                                </el-option>
                            </el-select>
                            <div class="el-select-add-btn" v-if="!tabView">
                                <el-popover
                                        placement="left"
                                        trigger="click"
                                        v-model="editPopTypeVisible"
                                        v-clickoutside="clickOutSide"
                                >
                                    <div class="pop-window-assetType" @click="editQuit()">
                                        <div class="pop-window-assetType-content">
                                            <div class="right-box-top-btns">
                                                <div class="right-box-top-btn right-box-top-btn-full"
                                                     @click="editPopoverClose('type')">
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
                                                        @click="clickState(index,item,'type')"
                                                        :class="{activeColor:modelCount === index}"
                                                        :key="index">
                                                        <div>
                                                            <span v-if="!item.isEdit">{{ item.value }}</span>
                                                            <span class="config-dropdown-label-input"
                                                                  v-if="item.isEdit"
                                                                  @click.stop="editing">
                                <input type="text" v-model="item.value" size="mini"/>
                              </span>
                                                            <span class="config-dropdown-btn"
                                                                  @click.stop="editOptionData(item,index)">
                                <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                <i class="el-icon-check" v-if="item.isEdit"
                                   @click="editData('sys/dict/update',item)"></i>
                              </span>
                                                            <span class="config-dropdown-btn config-dropdown-btn-delete"
                                                                  @click.stop="deleteData('/sys/dict/delete',item.id)"><i
                                                                    class="el-icon-delete"></i>
                              </span>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="right-box-bottom-btns">
                                        <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                                             @click="editPopoverClose('type')">
                                            {{$t('overall.cancel')}}
                                        </div>
                                        <div class="right-box-bottom-btn right-box-bottom-btn-50"
                                             @click="transferData('type')">
                                            {{$t('overall.save')}}
                                        </div>
                                    </div>
                                    <div slot="reference" style="font-size: 18px">+</div>
                                </el-popover>
                            </div>
                        </div>
                        <span v-if="tabView">{{assetViewData.assetType}}</span>
                    </el-form-item>
                    <!------------------------------------------厂商/型号---------------------------------------------->
                    <el-form-item label="厂商/型号">
                        <div class="select-style" v-if="!tabView">
                            <el-cascader
                                    :options="vendorTypeOptionData"
                                    :key="isResourceShow"
                                    :disabled="this.assetType!=''?false:true"
                                    v-model="assetData.modelId"
                                    clearable
                            >
                            </el-cascader>
                            <div class="el-select-add-btn" v-if="!tabView">
                                <el-popover
                                        placement="left"
                                        trigger="click"
                                        v-model="editPopVendorVisible"
                                        v-clickoutside="clickOutSide"
                                >
                                    <div class="pop-window-assetType" @click="editQuit()">
                                        <div class="pop-window-assetType-content">
                                            <div class="right-box-top-btns">
                                                <div class="right-box-top-btn right-box-top-btn-full"
                                                     @click="editPopoverClose('vendor')">
                                                    <div class="right-box-btn-icon">
                                                        <i class="el-icon-close"></i>
                                                    </div>
                                                    <span>{{$t('overall.esc')}}</span>
                                                </div>
                                            </div>
                                            <div class="pop-window-assetType">
                                                <span style="display: block;padding-bottom: 15px">商场/型号</span>
                                                <span style="display: block;padding-bottom: 20px">新厂商名称</span>
                                                <input v-model="addVendorData.value"/>
                                                <input type="button" value="+Add"
                                                       @click="addNewData('vendor')"></input>
                                                <span style="display: block;padding-bottom: 20px">已有厂商</span>
                                                <div class="li-list-part">
                                                    <ul style="list-style: none">
                                                        <li style="cursor: pointer;"
                                                            v-for="(item,index) in vendorUlData"
                                                            @click="getLidata(index,item)"
                                                            :class="{activeColor:vendorCount === index}"
                                                            :key="index">
                                                            <div>
                                                                <span v-if="!item.isEdit">{{ item.value }}</span>
                                                                <span class="config-dropdown-label-input"
                                                                      v-if="item.isEdit"
                                                                      @click.stop="editing">
                                                            <input type="text" v-model="item.value" size="mini"/>
                                                        </span>
                                                                <span class="config-dropdown-btn"
                                                                      @click.stop="editOptionData(item)">
                                                            <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                                            <i class="el-icon-check" v-if="item.isEdit"
                                                               @click="editData('sys/dict/update',item)"></i>
                                                        </span>
                                                                <span class="config-dropdown-btn config-dropdown-btn-delete"
                                                                      @click.stop="deleteData('/sys/dict/delete',item.id)"><i
                                                                        class="el-icon-delete"></i>
                                                            </span>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <span style="display: block;padding-bottom: 15px">新型号名称</span>
                                                <input v-model="addNewModelData.name"/>
                                                <input type="button" value="+Add"
                                                       @click="addNewData('model')"></input>
                                                <span style="display: block;padding-bottom: 20px">已有型号</span>
                                                <div class="li-list-part">
                                                    <ul style="list-style: none">
                                                        <li style="cursor: pointer;"
                                                            v-for="(item,index) in modelUlData"
                                                            @click=" clickState(index,item,'model') "
                                                            :class="{activeColor:modelCount === index}"
                                                            :key="index">
                                                            <div>
                                                                <span v-if="!item.isEdit">{{ item.name }}</span>
                                                                <span class="config-dropdown-label-input"
                                                                      v-if="item.isEdit"
                                                                      @click.stop="editing">
                                  <input type="text" v-model="item.name" size="mini"/>
                                </span>
                                                                <span class="config-dropdown-btn"
                                                                      @click.stop="editOptionData(item)">
                                  <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                  <i class="el-icon-check" v-if="item.isEdit"
                                     @click="editData('model',item)"></i>
                                </span>
                                                                <span class="config-dropdown-btn config-dropdown-btn-delete"
                                                                      @click.stop="deleteData('model',item.id)"><i
                                                                        class="el-icon-delete"></i>
                                                            </span>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="right-box-bottom-btns">
                                        <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                                             @click="editPopoverClose('vendor')">
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
                        <span v-if="tabView">{{assetViewData.vendor}}   {{assetViewData.model}}</span>
                    </el-form-item>
                    <el-form-item label="购买日期">
                        <div class="select-style" v-if="!tabView">
                            <el-date-picker
                                    v-model="assetData.purchaseDate"
                                    value-format="yyyy-MM-dd"
                                    type="date"
                                    placeholder="选择日期">
                            </el-date-picker>
                        </div>
                        <span v-if="tabView">{{assetData.purchaseDate}}</span>
                    </el-form-item>
                    <div style="font-size: 10px">IDC</div>
                    <el-divider></el-divider>
                    <!------------------------------------------IDC---------------------------------------------->
                    <el-form-item label="DC Name">
                        <div class="select-style" v-if="!tabView">
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
                                                <span style="display: block;padding-bottom: 20px">标题</span>
                                                <el-form-item label="DC Name">
                                                    <el-input v-model="popIdcData.name"/>
                                                </el-form-item>
                                                <el-form-item label="Location">
                                                    <el-input v-model="popIdcData.location"/>
                                                </el-form-item>
                                                <el-form-item label="负责人">
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
                                                <el-form-item label="Tel">
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
                                              @click.stop="getSingleIDCData(item.id,'edit')"><i
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
                                            <span style="display: block;padding-bottom: 20px">标题</span>
                                            <el-form-item label="DC Name">
                                                <el-input v-model="addIdcData.name"/>
                                            </el-form-item>
                                            <el-form-item label="Location">
                                                <el-input v-model="addIdcData.location"/>
                                            </el-form-item>
                                            <el-form-item label="负责人">
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
                                            <el-form-item label="Tel">
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
                                    <div slot="reference" style="font-size: 18px">+</div>
                                </el-popover>
                            </div>
                        </div>
                        <span v-if="tabView">{{assetViewData.idcName}}</span>
                    </el-form-item>
                    <el-form-item label="Location">
                        <span>{{idcSelectedData.location}}</span>
                    </el-form-item>
                    <el-form-item label="负责人">
                        <span>{{this.getPrincipalName(idcSelectedData.principal)}}</span>
                    </el-form-item>
                    <el-form-item label="Tel">
                        <span>{{idcSelectedData.tel}}</span>
                    </el-form-item>
                    <el-divider></el-divider>


                    <!------------------------------------------cabinet---------------------------------------------->
                    <el-form-item label="机柜">
                        <div class="select-style" v-if="!tabView">
                            <el-select clearable v-model="assetData.cabinetId" clearable
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
                                                <span style="display: block;padding-bottom: 20px">标题</span>
                                                <el-form-item label="Name">
                                                    <el-input v-model="popCabinetData.name"/>
                                                </el-form-item>
                                                <el-form-item label="U Size">
                                                    <div>{{addCabinetData.uSize}}</div>
                                                    <el-slider v-model="popCabinetData.uSize"
                                                               :max="47"></el-slider>
                                                </el-form-item>
                                                <el-form-item label="Desc">
                                                    <el-input v-model="popCabinetData.remark"
                                                              type="textarea"
                                                              :rows="2"/>
                                                </el-form-item>
                                                <el-form-item label="IDC">
                                                    <el-select v-model="popCabinetData.idcId" clearable>
                                                        <el-option
                                                                v-for="item in IDCOptionData"
                                                                :key="item.key"
                                                                :label="item.name"
                                                                :value="item.id"
                                                        >
                                                            <span>{{ item.name }}</span>
                                                            <el-popover
                                                                    placement="top"
                                                                    v-model="item[item.name+item.id]"
                                                            >
                                                                <div class="pop-window-assetType-content">
                                                                    <div class="right-box-top-btns">
                                                                        <div class="right-box-top-btn right-box-top-btn-full"
                                                                             @click="item[item.name+item.id] = false">
                                                                            <div class="right-box-btn-icon">
                                                                                <i class="el-icon-close"></i>
                                                                            </div>
                                                                            <span>{{$t('overall.esc')}}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div class="pop-window">
                                                                        <span style="display: block;padding-bottom: 20px">标题</span>
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
                                                                         @click.stop="item[item.name+item.id]= false">
                                                                        {{$t('overall.cancel')}}
                                                                    </div>
                                                                    <div class="right-box-bottom-btn right-box-bottom-btn-50"
                                                                         @click="editData('idc',item,'CabIDC')">
                                                                        {{$t('overall.save')}}
                                                                    </div>
                                                                </div>
                                                                <span class="config-dropdown-btn" slot="reference"
                                                                      @click="getSingleIDCData(item.id,'edit')"><i
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
                                                 @click.stop="item[item.name]= false">
                                                {{$t('overall.cancel')}}
                                            </div>
                                            <div class="right-box-bottom-btn right-box-bottom-btn-50"
                                                 @click="editData('cabinet',item)">
                                                {{$t('overall.save')}}
                                            </div>
                                        </div>
                                        <span class="config-dropdown-btn" slot="reference"
                                              @click.stop=" getSingleCabinetData(item.id,'edit',item)">
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
                                        v-model="editPopCabinetVisible"
                                >
                                    <div class="pop-window-assetType-content">
                                        <div class="right-box-top-btns">
                                            <div class="right-box-top-btn right-box-top-btn-full"
                                                 @click="editPopoverClose('cabinet')">
                                                <div class="right-box-btn-icon">
                                                    <i class="el-icon-close"></i>
                                                </div>
                                                <span>{{$t('overall.esc')}}</span>
                                            </div>
                                        </div>
                                        <div class="pop-window">
                                            <span style="display: block;padding-bottom: 20px">标题</span>
                                            <el-form-item label="Name">
                                                <el-input v-model="addCabinetData.name"/>
                                            </el-form-item>
                                            <el-form-item label="U Size">
                                                <div>{{addCabinetData.uSize}}</div>
                                                <el-slider v-model="addCabinetData.uSize"></el-slider>
                                            </el-form-item>
                                            <el-form-item label="Desc">
                                                <el-input v-model="addCabinetData.remark"
                                                          type="textarea"
                                                          :rows="1"/>
                                            </el-form-item>
                                            <el-form-item label="IDC">
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
                                                                    <span style="display: block;padding-bottom: 20px">标题</span>
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
                                                                  @click="getSingleIDCData(item.id,'edit')"><i
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
                                             @click="editPopoverClose('cabinet')">
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
                        <span v-if="tabView">{{assetViewData.cabinetName}}</span>
                    </el-form-item>
                    <el-form-item label="U Size">
                        <span>{{cabinetSelectedData.uSize}}</span>
                    </el-form-item>
                    <el-form-item label="Desc">
                        <span>{{cabinetSelectedData.remark}}</span>
                    </el-form-item>
                    <div style="font-size: 10px">CLI Account</div>
                    <el-divider></el-divider>
                    <el-form-item label="登录方式">
                        <el-radio-group size="mini" v-model="assetData.accounts[0].authType">
                            <el-radio-button label='1'>Password</el-radio-button>
                            <el-radio-button label='2'>SSH私钥</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="Account">
                        <el-input v-model="assetData.accounts[0].user"/>
                    </el-form-item>
                    <el-form-item label="Password">
                        <el-input v-model="assetData.accounts[0].pwd"/>
                    </el-form-item>
                    <el-form-item label="Port">
                        <el-input v-model="assetData.accounts[0].port"/>
                    </el-form-item>
                </div>
            </el-form>
            <div class="">
                <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                     @click.stop="sendStateData('close')">
                    {{$t('overall.cancel')}}
                </div>
                <div class="right-box-bottom-btn right-box-bottom-btn-50"
                     @click="editData('asset')">
                    {{$t('overall.save')}}
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
  name: "assetEditUnit",
  props: ["editUnitShow", "editUnitId"],
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
        accounts: [{
          authType: '',
          user: '',
          pwd: '',
          cert: '',
          port: '',
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
          label: '在库'
        }, {
          value: 2,
          label: '出库'
        }],
      cabinetModelData: '',
      checkList: [],
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
    clickOutSide(data) {
      if (data) {
        this.editQuit()
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
            this.idcSelectedData.principal = response.data.list[0].idc.principal
            this.idcSelectedData.tel = response.data.list[0].idc.tel
            this.cabinetSelectedData.uSize = response.data.list[0].cabinet == null ? '' : response.data.list[0].cabinet.uSize
            this.cabinetSelectedData.remark = response.data.list[0].cabinet == null ? '' : response.data.list[0].cabinet.remark
            this.getAllModelOptionData(this.assetType)
            console.log(this.pageObj.id)
            this.getAccountData(this.pageObj.id)
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
    getAccountData(data) {
      this.$get('account?assetId=' + data).then(response => {
        if (response.code === 200) {
          this.accountData = response.data.list
          console.log(this.accountData)
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
      if (data === 'asset') {
        this.assetData.modelId = this.assetData.modelId.join(',').split(',')[1]
        let form = new FormData();
        form.append("id", this.pageObj.id);
        form.append("sn", this.assetData.sn);
        form.append("host", this.assetData.host);
        form.append("state", this.assetData.state);
        form.append("purchaseDate", this.assetData.purchaseDate);
        form.append("idcId", this.assetData.idcId);
        form.append("cabinetId", this.assetData.cabinetId);
        form.append("modelId", this.assetData.modelId);
        form.append("accounts[0].authType", this.assetData.accounts[0].authType);
        form.append("accounts[0].user", this.assetData.accounts[0].user);
        form.append("accounts[0].pwd", this.assetData.accounts[0].pwd);
        form.append("accounts[0].port", this.assetData.accounts[0].port);
        this.$put('asset', form).then(res => {
          if (res.code === 200) {
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, '修改成功'),
              duration: 2000
            });
            this.pageObj.id = ''
            this.$emit('refreshData', 'true')
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
          item.name = this.popCabinetData.name
          item.uSize = this.popCabinetData.uSize
          item.remark = this.popCabinetData.remark
          console.log(this.popCabinetData.idcId)
          item.idcId = this.popCabinetData.idcId
          console.log(item)
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
          if (res.code === 200) {
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, '修改成功'),
              duration: 2000
            })
            this.getIDCOptionData();
            this.getCabinetOptionData('')
            this.getAllModelOptionData();
            this.$emit('refreshData', 'true')
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
    editOptionData(item, index) {
      console.log(index)
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
    },
    delOptionData(data) {
    },
    tabControl(data) {
      if (data === 'close') {
        this.addUnitShow = false
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
        item[item.name] = !item[item.name]
        this.cabinetOptionData.forEach(items => {
          if (items.id === data) {
            this.popCabinetData.name = items.name
            this.popCabinetData.uSize = items.uSize
            this.popCabinetData.remark = items.remark
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
    clickState(index, item, data) {
      console.log(index, item)
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
      }
      if (data === 'cabinet') {
        this.popCabinetVisible = false
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
    sendStateData(data) {
      this.$emit('sendStateData', 'close')
    },
    flushData() {
      this.getAssetData();
    },
  },
  mounted() {
    this.getCabinetOptionData('')
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
