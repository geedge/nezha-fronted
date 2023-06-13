<template>
  <div v-clickoutside="{obj: editAsset, func: esc}" class="right-box right-box-asset">
    <div class="right-box__header">
      <div class="header__title">{{editAsset.id ? $t('asset.editAsset') : $t('asset.createAsset')}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editAsset, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="form" :model="editAsset" :rules="rules" label-position="top" label-width="120px">
          <el-form-item :label="$t('overall.name')" prop="name">
            <el-input maxlength="128" show-word-limit v-model="editAsset.name" size="small"/>
          </el-form-item>
          <el-form-item :label="$t('overall.type')" prop="typeId">
            <select-asset-type id="asset-type" :asset-type-data="options.typeOptions" :show-type="editAsset.type" size="small"
                               @selectAssetType="selectType">
              <template v-slot:trigger>
                <el-input v-model="editAsset.type.name" :clearable="true" :readonly="true" placeholder="" size="small"></el-input>
              </template>
            </select-asset-type>
          </el-form-item>
          <el-form-item v-if="editAsset.type && editAsset.type.vm === 1" :label="$t('asset.parent')" prop="pid" key="pid">
            <el-select
              v-model="editAsset.pid"
              class="right-box__select"
              popper-class="right-box-select-top prevent-clickoutside"
              size="small"
              :placeholder="$t('el.select.placeholder')"
              value-key="id">
              <el-option v-for="p in options.parentAssetOptions" :key="p.id" :label="p.name" :value="p.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('overall.state')" prop="stateId">
            <el-select v-model="editAsset.stateId" class="right-box__select" :placeholder="$t('el.select.placeholder')" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="id">
              <el-option v-for="state in options.stateOptions" :key="state.id" :label="state.name" :value="state.id">
                <div style="display: flex;justify-content: space-between;padding: 5px;">
                  <div>{{$t(state.name)}}</div>
                  <div style="width: 450px;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;color: #999999" :title="state.remark">{{$t(state.remark)}}</div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('asset.manageIp')" prop="manageIp">
            <el-input  maxlength="64" show-word-limit v-model="editAsset.manageIp" size="small"/>
          </el-form-item>
          <el-form-item :label="$t('asset.sn')" prop="sn">
            <el-input  maxlength="128" show-word-limit v-model="editAsset.sn" size="small"/>
          </el-form-item>
          <el-form-item :label="$t('config.system.basic.num')" prop="number">
            <el-input  maxlength="128" show-word-limit v-model="editAsset.number" size="small"/>
          </el-form-item>
          <el-form-item :label="$t('asset.brandAndModel')" class="placeholder-emphasize is-required" prop="brandAndModel">
            <div @click="judgeType">
              <el-cascader
              ref="cascader"
              :clearable="true"
              :disabled="judgeTypes"
              v-model="editAsset.brandAndModel"
              :placeholder="lockModelInputValue"
              :options="options.brandAndModelOptions"
              :props="{ label: 'name', value: 'id' }"
              popper-class="prevent-clickoutside right-public-box-dropdown-top right-box-select-top limit-height"
              size="small"
              style="width: 100%;"
            ></el-cascader>
            </div>
          </el-form-item>
          <el-form-item :label="$t('asset.location')" prop="location" class="is-required">
            <location-cascader v-if="!vmLock" ref="locationCascader" :dc-option="options.dcOptions" :default-model-u-size="1" @change="setLocationData"></location-cascader>
            <el-input v-else v-model="lockLocationInputValue" disabled size="small"></el-input>
          </el-form-item>
          <el-form-item :label="$t('asset.purchaseDate')" prop="purchaseDate">
            <my-date-picker
              id="asset-box-input-parchase-date"
              v-model="editAsset.purchaseDate"
              placeholder=""
              size="small"
              popper-class="right-box-select-top"
              style="width: 100%"
              type="date"
              :format="timeFormatStrToDatePickFormat(timeFormatMain, 1)">
            </my-date-picker>
          </el-form-item>
          <!-- labels -->
          <div class="form__sub-title">{{$t('overall.labels')}}</div>
          <div v-for="(label, i) in editAsset.fields" :key="i" class="form__dotted-item">
            <el-form-item :prop="'fields.' + i + '.value'">
              <template v-slot:label>
                <div class="form__labels-label">
                  <span>{{label.name}}</span>
                  <div>
                    <span @click="removeLabel(label)" class="form__labels-label__span" :title="$t('overall.delete')"><i class="nz-icon nz-icon-minus"></i></span>
                  </div>
                </div>
              </template>
              <template v-if="label.action !== 1">
                <template v-if="label.type.toUpperCase() === assetConstants.labelTypeData.TEXT">
                  <el-input v-model="label.value[0]" size="small"/>
                </template>
                <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.MULTITEXT">
                  <div v-for="(value, i) in label.value" :key="i" class="label__multi-text">
                    <el-input v-model="label.value[i]" size="small"/>
                    <span @click="addMultiTextRow(label)" style="margin: 0 5px" :title="$t('tip.add')"><i class="nz-icon nz-icon-plus"></i></span>
                    <span @click="removeMultiTextRow(label, i)" :title="$t('overall.delete')"><i class="nz-icon nz-icon-minus"></i></span>
                  </div>
                </template>
                <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.TEXTAREA">
                  <el-input v-model="label.value[0]" :maxlength="4096" show-word-limit size="small" :rows="2" type="textarea"/>
                </template>
                <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.RADIO">
                  <el-radio-group v-model="label.value[0]">
                    <el-radio v-for="item in JSON.parse(label.param).items" :key="item.name" :label="item.name">{{item.name}}</el-radio>
                  </el-radio-group>
                </template>
                <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.CHECKBOX">
                  <el-checkbox-group v-model="label.value">
                    <el-checkbox v-for="item in JSON.parse(label.param).items" :key="item.name" :label="item.name" :value="item.name"></el-checkbox>
                  </el-checkbox-group>
                </template>
                <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.SELECT">
                  <el-select v-model="label.value[0]" class="right-box__select" :placeholder="$t('el.select.placeholder')" popper-class="right-box-select-top prevent-clickoutside" size="small">
                    <el-option v-for="item in JSON.parse(label.param).items" :key="item.name" :label="item.name" :value="item.name"></el-option>
                  </el-select>
                </template>
                <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.INTEGER">
                  <el-input v-model="label.value[0]" oninput="value=value.replace(/[^\d]/g,'')" size="small"></el-input>
                </template>
                <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.DOUBLE">
                  <el-input-number v-model="label.value[0]" :controls="false" size="small" :precision="JSON.parse(label.param).decimals" style="width: 100%;text-align: left" :max="10000000000000000000" :min="-10000000000000000000"></el-input-number>
                </template>
                <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.DATETIME">
                  <template v-if="JSON.parse(label.param).subType === assetConstants.labelSubTypeData.time">
                    <div v-if="JSON.parse(label.param).interval" style="display: flex; justify-content: space-between">
                      <el-time-select v-model="label.value[0]" size="small"></el-time-select>
                      <el-time-select v-model="label.value[1]" size="small"></el-time-select>
                    </div>
                    <template v-else>
                      <el-time-select v-model="label.value[0]" size="small" style="width: 100%"></el-time-select>
                    </template>
                  </template>
                  <template v-else>
                    <template v-if="JSON.parse(label.param).interval">
                      <my-date-picker
                        id="asset-box-input-purchase-date"
                        v-model="label.value"
                        :type="JSON.parse(label.param).subType === assetConstants.labelSubTypeData.date ? 'daterange' : 'datetimerange'"
                        placeholder=""
                        popper-class="right-box-select-top"
                        size="small"
                        :format="timeFormatStrToDatePickFormat(timeFormatMain,JSON.parse(label.param).subType === assetConstants.labelSubTypeData.date)"
                        style="width: 100%">
                      </my-date-picker>
                    </template>
                    <template v-else>
                      <my-date-picker
                        id="asset-box-input-parchase-date"
                        v-model="label.value[0]"
                        :type="JSON.parse(label.param).subType"
                        placeholder=""
                        popper-class="right-box-select-top"
                        size="small"
                        style="width: 100%"
                        :format="timeFormatStrToDatePickFormat(timeFormatMain, JSON.parse(label.param).subType === assetConstants.labelSubTypeData.date)">
                      </my-date-picker>
                    </template>
                  </template>
                </template>
                <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.EMAIL">
                  <el-input v-model="label.value[0]" size="small"/>
                </template>
              </template>
            </el-form-item>
          </div>
          <!-- label的新增按钮 -->
          <div class="form__flex-container hide-casc-input">
            <button class="form__create-btn" type="button" @click.stop :title="$t('tip.add')"><i class="nz-icon nz-icon-create-square"></i></button>
            <el-cascader
              v-if="labelCascShow"
              :options="options.fieldGroupOptions"
              :props="labelCascProp"
              class="hide-input"
              :title="$t('tip.add')"
              popper-class="prevent-clickoutside right-box-select-top limit-height"
              size="small"
              @change="addLabel"
            ></el-cascader>
          </div>
          <!-- SSH -->
          <template v-if="editAsset.type && editAsset.type.authProtocol === assetConstants.authProtocolData.ssh">
            <div class="form__sub-title">SSH
              <div>
                <el-switch v-model="editAsset.showSSH" :active-value="true" :inactive-value="false" size="small"></el-switch>
              </div>
            </div>
            <div v-if="editAsset.showSSH">
              <el-form-item
                :label="$t('asset.authType')"
                prop="authType"
                :rules="[
                  { required: editAsset.showSSH, message: $t('validate.required'), trigger: 'change' }
                 ]">
                <el-select @change="selectAuthType" v-model="editAsset.authType" class="right-box__select" :placeholder="$t('el.select.placeholder')" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="value" clearable>
                  <el-option v-for="type in assetConstants.authTypeOptions" :key="type.value" :label="$t(type.label)" :value="type.value"/>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('profile.username')" prop="authUsername" :rules="[
                  { required: editAsset.showSSH, message: $t('validate.required'), trigger: 'change' }
                 ]">
                <el-input maxlength="64" show-word-limit v-model="editAsset.authUsername" size="small"/>
              </el-form-item>
              <!-- Key支持私钥 -->
              <template v-if="editAsset.authType === assetConstants.authTypeData.key">
                <el-form-item :label="$t('asset.privateKey')" prop="authPriKey" :key="'authPriKey'"
                              :rules="[{ required: requiredPriKey, message: $t('validate.required'), trigger: 'change' }]"
                >
                  <el-input v-model="editAsset.authPriKey" size="small"/>
                </el-form-item>
              </template>
              <el-form-item :label="$t('login.pin')" prop="authPin" :rules="[
                  { required: editAsset.showSSH && editAsset.authType != assetConstants.authTypeData.key && requiredPin, message: $t('validate.required'), trigger: 'change' }
                 ]">
                <el-input maxlength="256" show-word-limit v-model="editAsset.authPin" size="small" type="password" auto-complete="new-password" />
              </el-form-item>
              <el-form-item :label="$t('asset.port')" prop="authProtocolPort">
                <el-input v-model="editAsset.authProtocolPort" size="small"/>
              </el-form-item>
            </div>
          </template>
          <!-- TELNET -->
          <template v-if="editAsset.type && editAsset.type.authProtocol === assetConstants.authProtocolData.telnet">
            <div class="form__sub-title">TELNET
              <div>
                <el-switch v-model="editAsset.showTelnet" :active-value="true" :inactive-value="false" size="small"></el-switch>
              </div>
            </div>
            <div v-if="editAsset.showTelnet">
              <el-form-item :label="$t('profile.username')" prop="authUsername" :rules=" { required: editAsset.showTelnet, message: $t('validate.required'), trigger: 'change' }">
                <el-input maxlength="64" show-word-limit v-model="editAsset.authUsername" size="small"/>
              </el-form-item>
              <el-form-item :label="$t('login.pin')" prop="authPin" :rules=" { required: requiredPin, message: $t('validate.required'), trigger: 'change' }">
                <el-input maxlength="256" show-word-limit v-model="editAsset.authPin" size="small"  type="password" auto-complete="new-password" />
              </el-form-item>
              <el-form-item :label="$t('asset.usernamePrompt')" prop="authUserTip">
                <el-input maxlength="64" show-word-limit v-model="editAsset.authUserTip" size="small"/>
              </el-form-item>
              <el-form-item :label="$t('asset.pinPrompt')" prop="authPinTip">
                <el-input maxlength="64" show-word-limit v-model="editAsset.authPinTip" size="small"  type="password" auto-complete="new-password" />
              </el-form-item>
              <el-form-item :label="$t('asset.port')" prop="authProtocolPort">
                <el-input v-model="editAsset.authProtocolPort" size="small"/>
              </el-form-item>
            </div>
          </template>
          <!-- SNMP -->
          <template v-if="editAsset.type && editAsset.type.snmpEnable === 1">
            <div class="form__sub-title">SNMP
              <div>
                <el-switch v-model="editAsset.showSnmp" :active-value="true" :inactive-value="false" size="small"></el-switch>
              </div>
            </div>
            <el-form-item :label="$t('asset.snmpCredential')" prop="snmpCredentialId" v-if="editAsset.showSnmp">
              <el-select v-model="editAsset.snmpCredentialId" class="right-box__select" :placeholder="$t('el.select.placeholder')" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="id">
                <el-option v-for="snmp in options.snmpCredentialOptions" :key="snmp.id" :label="snmp.name" :value="snmp.id"></el-option>
              </el-select>
            </el-form-item>
          </template>
          <!-- TALON -->
          <template>
            <div class="el-form__sub-title">
              <div>
                <span class="endpoint-title-content">
                  <i class="nz-icon nz-icon-arrow-down" :class="talonShowTow?'':'is-active'" @click="talonShowTow = !talonShowTow"></i>
                  TALON
                </span>
                <el-popover
                  placement="right"
                  trigger="hover"
                  popper-class="prevent-clickoutside"
                  :content="$t('asset.talonPrompt')">
                  <i slot="reference" class="nz-icon nz-icon-about"></i>
                </el-popover>
              </div>
              <div>
                <el-switch v-model="editAsset.clientEnable" :active-value="1" :inactive-value="0" size="small"></el-switch>
              </div>
            </div>
            <transition name="el-zoom-in-top">
             <!-- <el-form-item :label="$t('profile.username')" prop="clientUser">
              <el-input maxlength="64" show-word-limit v-model="editAsset.clientUser" size="small"/>
              </el-form-item>
              <el-form-item :label="$t('login.pin')" prop="clientPin">
                <el-input type="password" auto-complete="new-password"  show-word-limit v-model="editAsset.clientPin" size="small"/>
              </el-form-item> -->
              <div v-if="editAsset.clientEnable === 1" v-show="talonShowTow">
                <el-form-item :label="$t('asset.talon.token')" prop="clientToken">
                  <el-input v-model="editAsset.clientToken" size="small" maxlength="64"/>
                </el-form-item>
                <el-form-item :label="$t('asset.port')" prop="clientPort">
                  <el-input v-model="editAsset.clientPort" size="small"/>
                </el-form-item>
              </div>
            </transition>
            <!-- <transition name="el-zoom-in-top">
              <div v-show="showAllTalonOption">
                <el-form-item :label="$t('asset.address')" prop="clientAddress">
                  <el-input v-model="editAsset.clientAddress" size="small"/>
                </el-form-item>
              </div>
            </transition>
            <template v-if="showAddressOption">
              <div style="text-align: center;margin-bottom: 40px">
                <span class="nz-btn-size-normal-new nz-btn-style-light" style="border: none" @click="showAddress">
                  {{$t('overall.moreOption')}}<i class="nz-icon nz-icon-arrow-down"></i>
                </span>
              </div>
            </template> -->
          </template>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{obj: editAsset, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="asset-edit-save" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { host, port, noSpecialChar } from '@/components/common/js/validate'
import { asset as assetConstants } from '@/components/common/js/constants'
import selectAssetType from '@/components/common/popBox/selectAssetType'
import locationCascader from '@/components/common/rightBox/locationCascader'
import editRigthBox from '../../mixin/editRigthBox'
import bus from '@/libs/bus'

export default {
  name: 'assetBox',
  components: {
    selectAssetType,
    locationCascader
  },
  props: {
    obj: {
      type: Object
    }
  },
  mixins: [editRigthBox],
  data () {
    const vm = this
    return {
      assetConstants,
      requiredPin: true,
      requiredPriKey: true,
      judgeTypes: true,
      showAllTalonOption: false,
      showAddressOption: true,
      talonShowTow: true,
      editAsset: {},
      minWidth: '',
      url: 'asset/asset',
      rightBox: { model: { show: false } },
      vmLock: false, // 当自己是虚拟机时，锁定品牌型号位置为parent的，无法修改
      lockModelInputValue: '', // model锁定时的显示内容
      lockLocationInputValue: '', // location锁定时显示的内容

      options: { // 下拉选项的option数据
        cabinetOptions: [],
        metaOptions: [],
        dcOptions: [],
        stateOptions: [],
        snmpCredentialOptions: [],
        brandAndModelOptions: [],
        modelOptions: [],
        fieldGroupOptions: [],
        parentAssetOptions: [],
        typeOptions: []
      },
      labelCascShow: true, // 用来控制label的cascader的重新渲染
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: noSpecialChar, trigger: 'blur' }
        ],
        pid: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        manageIp: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: host, trigger: 'blur' }
        ],
        modelId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        typeId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        stateId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        brandAndModel: [
          // { required: true, message: this.$t('validate.required'), trigger: ['blur', 'change'] },
          { validator: this.validCascader, trigger: ['blur', 'change'] }
        ],
        dcId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        authProtocolPort: [
          // { required: true, message: this.$t('validate.required'), trigger: 'change' },
          { validator: port, trigger: 'blur' }
        ],
        sn: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        location: [
          // { required: true, message: this.$t('validate.required'), trigger: 'change' },
          { validator: this.checkLocation, trigger: 'change' }
        ],
        clientToken: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        clientPort: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      cabRules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        uSize: [
          { required: true, type: 'number', min: 1, max: 47, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        dcId: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      },
      labelCascProp: {
        lazy: true,
        value: 'id',
        label: 'name',
        lazyLoad (node, resolve) {
          const { level } = node
          if (node && node.data) {
            vm.$get('asset/field/meta', { groupIds: node.data.id, pageSize: -1 }).then(response => {
              if (response.code === 200) {
                const meta = response.data.list.map(item => ({
                  ...item,
                  leaf: level >= 1,
                  disabled: vm.editAsset.fields.some(a => a.id === item.id)
                }))
                vm.options.metaOptions = meta
                resolve(meta)
              }
            })
          }
        }
      },
      assetId: ''
    }
  },
  watch: {
    obj: {
      deep: true,
      immediate: true,
      handler (n) {
        this.isEdit = true
        const editAsset = JSON.parse(JSON.stringify(n))
        if (editAsset.authType) {
          editAsset.showSSH = true
          this.requiredPin = false
          this.requiredPriKey = false
        } else {
          editAsset.showSSH = false
          this.requiredPin = true
          this.requiredPriKey = true
        }
        if (editAsset.type && editAsset.type.authProtocol == assetConstants.authProtocolData.telnet && editAsset.authType) {
          editAsset.showTelnet = true
        } else {
          editAsset.showTelnet = false
        }
        if (editAsset.type.snmpEnable === 1 && editAsset.snmpCredentialId) {
          editAsset.showSnmp = true
        } else {
          editAsset.showSnmp = false
        }
        this.editAsset = editAsset
        this.editAsset.brandAndModel = [editAsset.brand.id, editAsset.model.id]
        this.editAsset.stateId = n.state ? n.state.id : 2
        this.editAsset.typeId = n.type ? n.type.id : ''
        this.$nextTick(() => {
          if (n.id) {
            this.lockModelInputValue = `${n.brand.name} / ${n.model.name}`
          }
          if (this.$refs.locationCascader) {
            this.$refs.locationCascader.initComponet({ cabinet: n.cabinet, dc: n.dc, u: [n.cabinetStart, n.cabinetEnd] })
          }
        })
      }
    },
    'editAsset.type': {
      deep: true,
      immediate: true,
      handler (n) {
        if (n.id) {
          this.vmLock = n.vm === 1 // vm == 1 时，锁定model和location
          if (this.editAsset.id) { // 有id表示是修改asset，需要注意不要覆盖掉原有的port
            const oldPort = this.obj.authProtocolPort // 原有的port
            const oldAuthProtocol = this.obj.type.authProtocol // 原有的协议
            if (n.authProtocol === oldAuthProtocol) { // 切换后与原有的协议相同，则恢复到原有的port
              this.editAsset.authProtocolPort = oldPort
            } else { // 否则使用默认port
              if (n.authProtocol === this.assetConstants.authProtocolData.ssh) {
                this.editAsset.authProtocolPort = 22
              } else if (n.authProtocol === this.assetConstants.authProtocolData.telnet) {
                this.editAsset.authProtocolPort = 23
              }
            }
          } else {
            if (n.authProtocol === this.assetConstants.authProtocolData.ssh) {
              this.editAsset.authProtocolPort = 22
            } else if (n.authProtocol === this.assetConstants.authProtocolData.telnet) {
              this.editAsset.authProtocolPort = 23
            }
          }
          // this.requiredPin = true
        }
      }
    },
    'editAsset.pid': {
      deep: true,
      immediate: true,
      handler (n) {
        if (this.editAsset.pid === -1) {
          this.editAsset.pid = ''
        }
        if (n && n !== -1) {
          if (this.vmLock) {
            if (this.options.parentAssetOptions.length === 0) {
              this.getParentAsset().then(res => {
                const asset = this.options.parentAssetOptions.find(a => a.id === n)
                if (asset) {
                  this.editAsset.brandId = asset.brand ? asset.brand.id : ''
                  this.editAsset.brand = asset.brand
                  this.editAsset.modelId = asset.model ? asset.model.id : ''
                  this.editAsset.model = asset.model
                  this.editAsset.dcId = asset.dc ? asset.dc.id : ''
                  this.editAsset.cabinetId = asset.cabinet ? asset.cabinet.id : ''
                  this.editAsset.cabinetStart = asset.cabinetStart || ''
                  this.editAsset.cabinetEnd = asset.cabinetEnd || ''
                  if (!asset.cabinet) {
                    asset.cabinet = {}
                  }
                  this.lockModelInputValue = `${asset.brand.name} `
                  if (asset.model.name) {
                    this.lockModelInputValue += `/ ${asset.model.name}`
                  }
                  this.lockLocationInputValue = `${asset.dc.name}  `
                  if (asset.cabinet.name) {
                    this.lockLocationInputValue += `/ ${asset.cabinet.name}`
                  }
                  if (asset.cabinetStart) {
                    this.lockLocationInputValue += `/ ${asset.cabinetStart}-${asset.cabinetEnd}`
                  }
                }
              })
            } else {
              const asset = this.options.parentAssetOptions.find(a => a.id === n)
              if (asset) {
                this.editAsset.brandId = asset.brand ? asset.brand.id : ''
                this.editAsset.brand = asset.brand
                this.editAsset.modelId = asset.model ? asset.model.id : ''
                this.editAsset.model = asset.model
                this.editAsset.dcId = asset.dc ? asset.dc.id : ''
                this.editAsset.cabinetId = asset.cabinet ? asset.cabinet.id : ''
                this.editAsset.cabinetStart = asset.cabinetStart || ''
                this.editAsset.cabinetEnd = asset.cabinetEnd || ''
                if (!asset.cabinet) {
                  asset.cabinet = {}
                }
                this.lockModelInputValue = `${asset.brand.name} `
                if (asset.model.name) {
                  this.lockModelInputValue += `/ ${asset.model.name}`
                }
                this.lockLocationInputValue = `${asset.dc.name}  `
                if (asset.cabinet.name) {
                  this.lockLocationInputValue += `/ ${asset.cabinet.name}`
                }
                if (asset.cabinetStart) {
                  this.lockLocationInputValue += `/ ${asset.cabinetStart}-${asset.cabinetEnd}`
                }
              }
            }
          }
        }
        this.$refs.form && this.$refs.form.clearValidate()
        this.editAsset.brandAndModel = [this.editAsset.brand.id, this.editAsset.model.id]
      }
    }
  },
  mounted () {
    this.getParentAsset()
    this.getModelData()
    this.getStateData()
    this.getDcData()
    this.getTypeTreeData()
    this.getSnmpCredentialData()
    this.getFieldGroupData()
  },
  methods: {
    judgeType () {
      if (!this.editAsset.type.name) {
        this.$message.error(this.$t('asset.assetBox.message.type'))
        return false
      } else {
        this.judgeTypes = false
      }
    },
    clickOutside () {
      this.esc(false)
    },
    showAddress () {
      this.showAddressOption = false
      this.showAllTalonOption = true
    },
    setLocationData ({ cabinet, dc, u }) {
      this.editAsset.cabinetId = cabinet ? cabinet.id : ''
      this.editAsset.dcId = dc ? dc.id : ''
      if (this.editAsset.dcId) {
        this.$refs.form.validateField('location')
      }
      if (u) {
        this.editAsset.cabinetStart = u[0]
        this.editAsset.cabinetEnd = u[1]
      } else {
        this.editAsset.cabinetStart = ''
        this.editAsset.cabinetEnd = ''
      }
    },
    removeLabel (label) {
      let index = 0
      this.editAsset.fields.find((f, i) => {
        if (label.id === f.id) {
          index = i
          return true
        }
        return false
      })
      this.editAsset.fields.splice(index, 1)
      this.labelCascShow = false
      this.$nextTick(() => {
        this.labelCascShow = true
      })
    },
    addMultiTextRow (label) {
      label.value.push('')
    },
    removeMultiTextRow (label, index) {
      if (label.value.length === 1) {
        return
      }
      label.value.splice(index, 1)
    },
    blankLabelValue (label) {
      if (label.type.toUpperCase() === this.assetConstants.labelTypeData.CHECKBOX) {
        const arr = []
        if (label.param && JSON.parse(label.param).items) {
          JSON.parse(label.param).items.forEach(item => {
            if (item.check) {
              arr.push(item.name)
            }
          })
        }
        return arr
      } else if (label.type.toUpperCase() === this.assetConstants.labelTypeData.MULTITEXT || label.type.toUpperCase() === assetConstants.labelTypeData.TEXT || label.type.toUpperCase() === assetConstants.labelTypeData.TEXTAREA) {
        return ['']
      } else if (label.type.toUpperCase() === this.assetConstants.labelTypeData.RADIO || label.type.toUpperCase() === assetConstants.labelTypeData.SELECT) {
        const arr = ['']
        if (label.param && JSON.parse(label.param).items) {
          JSON.parse(label.param).items.forEach(item => {
            if (item.check) {
              arr[0] = item.name
            }
          })
        }
        return arr
      } else {
        return ['']
      }
    },
    getParentAsset () {
      return new Promise(resolve => {
        this.$get(this.url, { pageSize: -1, vmh: 1 }).then(response => {
          if (response.code === 200) {
            this.options.parentAssetOptions = response.data.list.filter(item => item.id !== this.editAsset.id)
          }
          resolve()
        })
      })
    },
    selectType (type) {
      this.$refs.cascader.$refs.panel.clearCheckedNodes()
      this.$refs.cascader.$refs.panel.activePath = []
      this.editAsset.brandAndModel = ''
      this.lockModelInputValue = ''
      this.editAsset.type = { ...type }
      this.editAsset.typeId = type.id ? type.id : ''
      this.editAsset.authType = ''
      this.editAsset.authUsername = ''
      this.editAsset.authPin = ''
      this.editAsset.authUserTip = ''
      this.editAsset.authPinTip = ''
      this.editAsset.snmpCredentialId = ''
      this.editAsset.authProtocolPort = ''
      this.editAsset.pid = ''
      this.$refs.form.clearValidate()
      this.getModelData()
    },
    addLabel ([groupId, metaId]) {
      const label = this.options.metaOptions.find(m => m.id === metaId)
      this.editAsset.fields.push({ ...label, value: this.blankLabelValue(label), action: 0 })
      this.labelCascShow = false
      this.$nextTick(() => {
        this.labelCascShow = true
      })
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    getCabinetData (id) {
      return new Promise(resolve => {
        this.$get('cabinet?dcId=' + id).then(response => {
          if (response.code === 200) {
            this.options.cabinetOptions = response.data.list
            for (let i = 0; i < this.options.cabinetOptions.length; i++) {
              this.$set(this.options.cabinetOptions[i], 'children', this.options.dcOptions)
            }
          }
          resolve(this.options.cabinetOptions)
        })
      })
    },
    save () {
      const self = this
      // console.log(123123132, self, 'params.id')
      if (this.prevent_opt.save) { return }
      this.prevent_opt.save = true

      if (this.editAsset.brandAndModel.length === 2) {
        this.editAsset.brandId = parseInt(this.editAsset.brandAndModel[0])
        this.editAsset.modelId = parseInt(this.editAsset.brandAndModel[1])
      }
      if (this.editAsset.type.authProtocol != assetConstants.authProtocolData.ssh) {
        this.editAsset.authType = ''
      }
      if (this.editAsset.type.authProtocol == assetConstants.authProtocolData.telnet && this.editAsset.showTelnet) {
        this.editAsset.authType = 1
      }
      this.$refs.form.validate((valid) => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.editAsset))
          params.fields.forEach(field => {
            if (field.type === 'DATETIME') {
              const param = JSON.parse(field.param)
              if (param.subType !== 'time') {
                const fmt = param.subType === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
                field.value = field.value.map(time => bus.timeFormate(new Date(time), fmt))
              }
            }
          })
          if (params.purchaseDate) {
            params.purchaseDate = bus.timeFormate(new Date(params.purchaseDate), 'YYYY-MM-DD')
          }
          // 判断是 ssh 还是 telnet
          if (params.type.authProtocol === assetConstants.authProtocolData.telnet && !params.showTelnet) { // telnet
            params.authType = ''
            params.authUsername = ''
            params.authPriKey = ''
            params.authPin = ''
          }
          if (params.type.authProtocol === assetConstants.authProtocolData.ssh && !params.showSSH) { // ssh
            params.authType = ''
            params.authUsername = ''
            params.authPriKey = ''
            params.authPin = ''
          }
          if (!params.showSSH && !params.showTelnet) {
            params.authType = ''
            params.authUsername = ''
            params.authPriKey = ''
            params.authPin = ''
          }
          if (!params.showSnmp) {
            params.snmpCredentialId = ''
          }
          if (params.type.vm !== 1) {
            params.parent = {}
            params.pid = '-1'
          }
          if (params.fields) {
            params.fields.forEach(field => {
              if (field.type.toUpperCase() === assetConstants.labelTypeData.CHECKBOX) { // 控制 check 选择中的顺序 跟 创建的一致
                const arr = []
                const items = JSON.parse(field.param).items
                items.forEach(item => {
                  const findItem = field.value.find(fieldValue => fieldValue == item.name)
                  if (findItem) {
                    arr.push(item.name)
                  }
                })
                field.value = arr
              }
            })
          }
          if (params.id) {
            this.$put(this.url, params).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.messageShow(this.$t('tip.saveSuccess'), '/endpoint', { assetId: res.data.id }, false, 'tip.endpoint')
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          } else {
            this.$post(this.url, params).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.messageShow(this.$t('tip.saveSuccess'), '/endpoint', { assetId: res.data.id }, true, 'tip.endpoint')
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          }
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    },
    getStateData () {
      return new Promise(resolve => {
        this.$get('asset/stateConf?pageSize=-1').then(response => {
          if (response.code === 200) {
            this.options.stateOptions = response.data.list
          }
          resolve()
        })
      })
    },
    getDcData () {
      return new Promise(resolve => {
        this.$get('dc', { pageSize: -1 }).then(response => {
          if (response.code === 200) {
            this.dcData = response.data.list
            this.options.dcOptions = response.data.list.map(d => { return { ...d, value: d.id } })
          }
          resolve()
        })
      })
    },
    getTypeTreeData () {
      return new Promise(resolve => {
        this.$get('asset/typeConf/tree').then(response => {
          if (response.code === 200) {
            this.options.typeOptions = response.data.list
          }
          resolve()
        })
      })
    },
    getSnmpCredentialData () {
      return new Promise(resolve => {
        this.$get('snmp/credential', { pageSize: -1 }).then(response => {
          if (response.code === 200) {
            this.options.snmpCredentialOptions = response.data.list
          }
          resolve()
        })
      })
    },
    getFieldGroupData () {
      return new Promise(resolve => {
        this.$get('asset/field/group', { pageSize: -1 }).then(response => {
          if (response.code === 200) {
            this.options.fieldGroupOptions = response.data.list
          }
          resolve()
        })
      })
    },
    getModelData () {
      return new Promise(resolve => {
        if (this.editAsset.typeId) {
          this.$get('asset/model?pageSize=-1&typeIds=' + this.editAsset.typeId).then(response => {
            if (response.code === 200) {
              this.options.modelOptions = response.data.list
              const titleSearchData = {}
              this.options.modelOptions.forEach(m => {
                if (titleSearchData[m.brand.name]) {
                  titleSearchData[m.brand.name].children.push(m)
                } else {
                  titleSearchData[m.brand.name] = { ...m.brand, children: [m] }
                }
              })
              this.options.brandAndModelOptions = Object.keys(titleSearchData).map(b => titleSearchData[b])
              if (!this.editAsset.type.name) {
                this.judgeTypes = true
              } else {
                this.judgeTypes = false
              }
            }
            resolve()
          })
        }
      })
    },
    checkLocation  (rule, value, callback) {
      setTimeout(() => {
        if (this.editAsset.cabinetId) {
          callback()
        } else if (this.editAsset.dcId) {
          callback()
        } else if (this.editAsset.cabinetStart && this.editAsset.cabinetEnd) {
          callback()
        } else {
          callback(new Error(this.$t('validate.required')))
        }
      }, 100)
    },
    validCascader (rule, value, callback) {
      if (this.editAsset.brandAndModel[0] == '' || this.editAsset.brandAndModel.length == 0) {
        callback(new Error(this.$t('validate.required')))
      } else {
        callback()
      }
    },
    selectAuthType () {
      if (this.editAsset.authType != this.obj.authType) {
        if (this.editAsset.authType == 1) {
          this.requiredPin = true
        } else {
          this.requiredPriKey = true
        }
      }
    }
  }
}
</script>
