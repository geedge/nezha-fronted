<template>
  <div v-clickoutside="{obj: editAsset, func: esc}" class="right-box right-box-asset">
    <div class="right-box__header">
      <div class="header__title">{{editAsset.id ? $t('asset.editAsset') : $t('asset.createAsset')}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editAsset, func: esc}"><i class="nz-icon nz-icon-close"></i></span>
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
          <el-form-item v-if="editAsset.type && editAsset.type.vm === 1" :label="$t('overall.parent')" prop="pid">
            <el-select
              v-model="editAsset.pid"
              class="right-box__select"
              popper-class="right-box-select-dropdown prevent-clickoutside"
              size="small"
              value-key="id">
              <el-option v-for="p in options.parentAssetOptions" :key="p.id" :label="p.name" :value="p.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('asset.state')" prop="stateId">
            <el-select v-model="editAsset.stateId" class="right-box__select" popper-class="right-box-select-dropdown prevent-clickoutside" size="small" value-key="id">
              <el-option v-for="state in options.stateOptions" :key="state.id" :label="state.name" :value="state.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('asset.manageIp')" prop="manageIp">
            <el-input  maxlength="64" show-word-limit v-model="editAsset.manageIp" size="small"/>
          </el-form-item>
          <el-form-item :label="$t('asset.sn')" prop="sn">
            <el-input  maxlength="128" show-word-limit v-model="editAsset.sn" size="small"/>
          </el-form-item>
          <el-form-item :label="$t('asset.number')" prop="number">
            <el-input  maxlength="128" show-word-limit v-model="editAsset.number" size="small"/>
          </el-form-item>
          <el-form-item :label="$t('asset.brandAndModel')" class="placeholder-emphasize" prop="brandAndModel">
            <el-cascader
              v-if="!vmLock"
              v-model="editAsset.brandAndModel"
              :placeholder="lockModelInputValue"
              :options="options.brandAndModelOptions"
              :props="{ label: 'name', value: 'id' }"
              popper-class="prevent-clickoutside limit-height"
              size="small"
              style="width: 100%;"
            ></el-cascader>
            <el-input v-else v-model="lockModelInputValue" disabled size="small"></el-input>
          </el-form-item>
          <el-form-item :label="$t('asset.location')" prop="location">
            <location-cascader v-if="!vmLock" ref="locationCascader" :dc-option="options.dcOptions" :default-model-u-size="1" @change="setLocationData"></location-cascader>
            <el-input v-else v-model="lockLocationInputValue" disabled size="small"></el-input>
          </el-form-item>
          <el-form-item :label="$t('asset.purchaseDate')" prop="purchaseDate">
            <my-date-picker
              id="asset-box-input-parchase-date"
              v-model="editAsset.purchaseDate"
              placeholder=""
              size="small"
              style="width: 100%"
              type="date"
              value-format="yyyy-MM-dd">
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
                    <span @click="removeLabel(label)"><i class="nz-icon nz-icon-minus"></i></span>
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
                    <span @click="addMultiTextRow(label)" style="margin: 0 5px"><i class="nz-icon nz-icon-plus"></i></span>
                    <span @click="removeMultiTextRow(label, i)"><i class="nz-icon nz-icon-minus"></i></span>
                  </div>
                </template>
                <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.TEXTAREA">
                  <el-input v-model="label.value[0]" :maxlength="4096" size="small" type="textarea"/>
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
                  <el-select v-model="label.value[0]" class="right-box__select" popper-class="right-box-select-dropdown prevent-clickoutside" size="small">
                    <el-option v-for="item in JSON.parse(label.param).items" :key="item.name" :label="item.name" :value="item.name"></el-option>
                  </el-select>
                </template>
                <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.INTEGER">
                  <el-input v-model="label.value[0]" oninput="value=value.replace(/[^\d]/g,'')" size="small"></el-input>
                </template>
                <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.DOUBLE">
                  <el-input v-model="label.value[0]" oninput="value=value.replace(/[^0-9.]/g,'')" size="small"></el-input>
                </template>
                <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.DATETIME">
                  <template v-if="JSON.parse(label.param).subType === assetConstants.labelSubTypeData.time">
                    <div v-if="label.interval" style="display: flex; justify-content: space-between">
                      <el-time-select v-model="label.value[0]" size="small"></el-time-select>
                      <el-time-select v-model="label.value[1]" size="small"></el-time-select>
                    </div>
                    <template v-else>
                      <el-time-select v-model="label.value[0]" size="small" style="width: 100%"></el-time-select>
                    </template>
                  </template>
                  <template v-else>
                    <template v-if="label.interval">
                      <my-date-picker
                        id="asset-box-input-purchase-date"
                        v-model="label.value[0]"
                        :type="JSON.parse(label.param).subType === assetConstants.labelSubTypeData.date ? 'dateRange' : 'datetimerange'"
                        placeholder=""
                        size="small"
                        style="width: 100%">
                      </my-date-picker>
                    </template>
                    <template v-else>
                      <my-date-picker
                        id="asset-box-input-parchase-date"
                        v-model="label.value[0]"
                        :type="JSON.parse(label.param).subType"
                        placeholder=""
                        size="small"
                        style="width: 100%"
                        value-format="yyyy-MM-dd">
                      </my-date-picker>
                    </template>
                  </template>
                </template>
                <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.EMAIL">
                  <input v-model="label.value[0]" size="small"></input>
                </template>
              </template>
            </el-form-item>
          </div>
          <!-- label的新增按钮 -->
          <div class="form__flex-container hide-casc-input">
            <button class="form__create-btn" type="button" @click.stop><i class="nz-icon nz-icon-create-square"></i></button>
            <el-cascader
              v-if="labelCascShow"
              :options="options.fieldGroupOptions"
              :props="labelCascProp"
              class="hide-input"
              popper-class="prevent-clickoutside limit-height"
              size="small"
              @change="addLabel"
            ></el-cascader>
          </div>
          <!-- SSH -->
          <template v-if="editAsset.type && editAsset.type.authProtocol === assetConstants.authProtocolData.ssh">
            <div class="form__sub-title">SSH</div>
            <el-form-item :label="$t('asset.authType')" prop="authType">
              <el-select v-model="editAsset.authType" class="right-box__select" popper-class="right-box-select-dropdown prevent-clickoutside" size="small" value-key="value">
                <el-option v-for="type in assetConstants.authTypeOptions" :key="type.value" :label="type.label" :value="type.value"/>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('asset.username')" prop="authUsername">
              <el-input maxlength="64" show-word-limit v-model="editAsset.authUsername" size="small"/>
            </el-form-item>
            <!-- Key支持私钥 -->
            <template v-if="editAsset.authType === assetConstants.authTypeData.key">
              <el-form-item :label="$t('asset.privateKey')" prop="authPriKey">
                <el-input v-model="editAsset.authPriKey" size="small"/>
              </el-form-item>
            </template>
            <el-form-item :label="$t('asset.pin')" prop="authPin">
              <el-input maxlength="256" show-word-limit v-model="editAsset.authPin" size="small" type="password"/>
            </el-form-item>
            <el-form-item :label="$t('asset.port')" prop="authProtocolPort">
              <el-input v-model="editAsset.authProtocolPort" size="small"/>
            </el-form-item>
          </template>
          <!-- TELNET -->
          <template v-if="editAsset.type && editAsset.type.authProtocol === assetConstants.authProtocolData.telnet">
            <div class="form__sub-title">TELNET</div>
            <el-form-item :label="$t('asset.username')" prop="authUsername">
              <el-input maxlength="64" show-word-limit v-model="editAsset.authUsername" size="small"/>
            </el-form-item>
            <el-form-item :label="$t('asset.pin')" prop="authPin">
              <el-input maxlength="256" show-word-limit v-model="editAsset.authPin" size="small"  type="password"/>
            </el-form-item>
            <el-form-item :label="$t('asset.usernamePrompt')" prop="authUserTip">
              <el-input maxlength="64" show-word-limit v-model="editAsset.authUserTip" size="small"/>
            </el-form-item>
            <el-form-item :label="$t('asset.pinPrompt')" prop="authPinTip">
              <el-input maxlength="64" show-word-limit v-model="editAsset.authPinTip" size="small"  type="password"/>
            </el-form-item>
            <el-form-item :label="$t('asset.port')" prop="authProtocolPort">
              <el-input v-model="editAsset.authProtocolPort" size="small"/>
            </el-form-item>
          </template>
          <!-- SNMP -->
          <template v-if="editAsset.type && editAsset.type.snmpEnable === 1">
            <div class="form__sub-title">SNMP</div>
            <el-form-item :label="$t('asset.snmpCredential')" prop="snmpCredentialId">
              <el-select v-model="editAsset.snmpCredentialId" class="right-box__select" popper-class="right-box-select-dropdown prevent-clickoutside" size="small" value-key="id">
                <el-option v-for="snmp in options.snmpCredentialOptions" :key="snmp.id" :label="snmp.name" :value="snmp.id"></el-option>
              </el-select>
            </el-form-item>
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
import { host, port } from '@/components/common/js/validate'
import { asset as assetConstants } from '@/components/common/js/constants'
import selectAssetType from '@/components/common/popBox/selectAssetType'
import locationCascader from '@/components/common/rightBox/locationCascader'
import editRigthBox from '../../mixin/editRigthBox'

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
      editAsset: {},
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
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
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
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        dcId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        authProtocolPort: [
          // { required: true, message: this.$t('validate.required'), trigger: 'change' },
          { validator: port, trigger: 'blur' }
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
            vm.$get('asset/field/meta', { groupIds: node.data.id }).then(response => {
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
      }
    }
  },
  watch: {
    obj: {
      deep: true,
      immediate: true,
      handler (n) {
        if (n.id) {
          this.isEdit = true
        }
        this.editAsset = JSON.parse(JSON.stringify(n))
        this.editAsset.brandAndModel = [this.editAsset.brand.id, this.editAsset.model.id]
        this.editAsset.stateId = n.state ? n.state.id : ''
        this.editAsset.typeId = n.type ? n.type.id : ''
        this.$nextTick(() => {
          if (n.id) {
            this.lockModelInputValue = `${n.brand.name} / ${n.model.name}`
          }
          this.$refs.locationCascader.initComponet({ cabinet: n.cabinet, dc: n.dc, u: [n.cabinetStart, n.cabinetEnd] })
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
        }
      }
    },
    'editAsset.pid': {
      deep: true,
      immediate: true,
      handler (n) {
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
                  this.editAsset.cabinetStart = asset.cabinetStart
                  this.editAsset.cabinetEnd = asset.cabinetEnd
                  if (!asset.cabinet) {
                    asset.cabinet = {}
                  }
                  this.lockModelInputValue = `${asset.brand.name} / ${asset.model.name}`
                  this.lockLocationInputValue = `${asset.dc.name} / ${asset.cabinet.name} / ${asset.cabinetStart}-${asset.cabinetEnd}`
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
                this.editAsset.cabinetStart = asset.cabinetStart
                this.editAsset.cabinetEnd = asset.cabinetEnd
                if (!asset.cabinet) {
                  asset.cabinet = {}
                }
                this.lockModelInputValue = `${asset.brand.name} / ${asset.model.name}`
                this.lockLocationInputValue = `${asset.dc.name} / ${asset.cabinet.name} / ${asset.cabinetStart}-${asset.cabinetEnd}`
              }
            }
          }
        }
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
    clickOutside () {
      this.esc(false)
    },
    setLocationData ({ cabinet, dc, u }) {
      if (cabinet) {
        this.editAsset.cabinetId = cabinet.id
      }
      if (dc) {
        this.editAsset.dcId = dc.id
      }
      if (u) {
        this.editAsset.cabinetStart = u[0]
        this.editAsset.cabinetEnd = u[1]
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
            this.options.parentAssetOptions = response.data.list
          }
          resolve()
        })
      })
    },
    selectType (type) {
      this.editAsset.type = { ...type }
      this.editAsset.typeId = type.id ? type.id : ''
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
      if (this.prevent_opt.save) { return }
      this.prevent_opt.save = true

      if (this.editAsset.brandAndModel.length === 2) {
        this.editAsset.brandId = parseInt(this.editAsset.brandAndModel[0])
        this.editAsset.modelId = parseInt(this.editAsset.brandAndModel[1])
      }

      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.editAsset.id) {
            this.$put(this.url, this.editAsset).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          } else {
            this.$post(this.url, this.editAsset).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
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
        this.$get('asset/model?pageSize=-1').then(response => {
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
          }
          resolve()
        })
      })
    }
  }
}
</script>
<style lang="scss">
  @import '@/assets/css/common/rightBoxCommon.scss';

  .placeholder-emphasize input::-webkit-input-placeholder {
    color: #606266 !important;
  }
</style>
