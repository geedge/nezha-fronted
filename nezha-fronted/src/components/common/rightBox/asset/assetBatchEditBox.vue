<template>
  <div v-clickoutside="{obj: editData, func: esc}" class="right-box right-box-asset-batch">
    <div class="right-box__header">
      <div class="header__title">{{$t('asset.batchEditAsset')}}</div>
      <div class="header__operation">
        <span @click="esc"><i class="nz-icon nz-icon-close"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <!-- Edit type -->
        <el-form ref="assetEditForm" :model="editData" :rules="rules" label-position="top" label-width="120px">
          <el-form-item :label="$t('overall.editType')" prop="editType">
            <el-select v-model="editData.editType" class="right-box__select" popper-class="right-box-select-dropdown prevent-clickoutside" size="small" value-key="value">
              <el-option v-for="type in assetConstants.editTypeOptions" :key="type.value" :label="type.label" :value="type.value"/>
            </el-select>
          </el-form-item>
          <!-- 第一级：Edit type = account -->
          <template v-if="editData.editType === assetConstants.editTypeData.account">
            <el-form-item :label="$t('asset.authProtocol')" prop="authProtocol">
              <el-select v-model="editData.authProtocol" class="right-box__select" popper-class="right-box-select-dropdown prevent-clickoutside" size="small" value-key="value">
                <el-option v-for="type in assetConstants.authProtocolOptions" :key="type.value" :label="type.label" :value="type.value"/>
              </el-select>
            </el-form-item>
            <!--   第二级：Protocol type = SSH -->
            <template v-if="editData.authProtocol === assetConstants.authProtocolData.ssh">
              <div class="form__sub-title">{{$t('asset.sshAccount')}}</div>
              <el-form-item :label="$t('asset.authType')" prop="authType">
                <el-select v-model="editData.authType" class="right-box__select" popper-class="right-box-select-dropdown prevent-clickoutside" size="small" value-key="value">
                  <el-option v-for="type in assetConstants.authTypeOptions" :key="type.value" :label="type.label" :value="type.value"/>
                </el-select>
              </el-form-item>
              <!--     第三级：Auth type = username | key -->
              <el-form-item :label="$t('asset.username')" prop="authUsername">
                <el-input v-model="editData.authUsername" size="small"/>
              </el-form-item>
              <template v-if="editData.authType === assetConstants.authTypeData.key">
                <!-- Key支持私钥 -->
                <el-form-item :label="$t('asset.privateKey')" prop="authPriKey">
                  <el-input v-model="editData.authPriKey" size="small" type="password" autocomplete="new-password"/>
                </el-form-item>
              </template>
              <el-form-item :label="$t('asset.pin')" prop="authPin">
                <el-input v-model="editData.authPin" size="small"  type="password" autocomplete="new-password"/>
              </el-form-item>
              <el-form-item :label="$t('asset.port')" prop="authProtocolPort">
                <el-input v-model="editData.authProtocolPort" size="small"/>
              </el-form-item>
            </template>

            <!--   第二级：Protocol type = TELNET -->
            <template v-if="editData.authProtocol === assetConstants.authProtocolData.telnet">
              <div class="form__sub-title">TELNET</div>
              <el-form-item :label="$t('asset.username')" prop="authUsername">
                <el-input v-model="editData.authUsername" size="small"/>
              </el-form-item>
              <el-form-item :label="$t('asset.pin')" prop="authPin">
                <el-input v-model="editData.authPin" size="small"/>
              </el-form-item>
              <el-form-item :label="$t('asset.usernamePrompt')" prop="authUserTip">
                <el-input v-model="editData.authUserTip" size="small"/>
              </el-form-item>
              <el-form-item :label="$t('asset.pinPrompt')" prop="authPinTip">
                <el-input v-model="editData.authPinTip" size="small"/>
              </el-form-item>
            </template>
          </template>

          <!-- 第一级：Edit type = label -->
          <template v-if="editData.editType === assetConstants.editTypeData.label">
            <div class="form__sub-title">{{$t('overall.labels')}}</div>
            <div v-for="(label, i) in editData.fields" :key="i" class="form__dotted-item">
              <el-form-item :prop="'fields.' + i + '.value'">
                <template v-slot:label>
                  <div class="form__labels-label">
                    <span>{{label.name}}</span>
                    <div>
                      <el-checkbox v-model="label.action" :false-label="0" :label="$t('overall.delete')" :true-label="1" size="small" style="padding-right: 20px;"></el-checkbox>
                      <span v-if="label.type.toUpperCase() === assetConstants.labelTypeData.MULTITEXT" @click="addMultiTextRow(label)"><i class="nz-icon nz-icon-create-square"></i></span>
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
                      <el-input v-model="label.value[i]" size="small" style="margin-right: 15px;"/>
                      <span :style="{'opacity': label.value.length > 1 ? 1 : 0.5}" @click="label.value.length > 1 ? label.value.splice(i, 1) : ''"><i class="nz-icon nz-icon-minus"></i></span>
                    </div>
                  </template>
                  <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.TEXTAREA">
                    <el-input v-model="label.value[0]" :maxlength="4096" size="small" type="textarea"/>
                  </template>
                  <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.RADIO">
                    <el-radio v-for="item in JSON.parse(label.param).items" :key="item.name" v-model="label.value[0]" :label="item.name">{{item.name}}</el-radio>
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
                :options="fieldGroupData"
                :props="labelCascProp"
                class="hide-input"
                popper-class="prevent-clickoutside right-box-dropdown-top right-public-box-dropdown-width limit-height"
                size="small"
                @change="addLabel"
              ></el-cascader>
            </div>
          </template>

          <!-- 第一级：Edit type = state -->
          <template v-if="editData.editType === assetConstants.editTypeData.state">
            <el-form-item :label="$t('asset.state')" prop="stateId">
              <el-select v-model="editData.stateId" class="right-box__select" popper-class="right-box-select-dropdown prevent-clickoutside" size="small" value-key="id">
                <el-option v-for="state in stateData" :key="state.id" :label="state.name" :value="state.id"></el-option>
              </el-select>
            </el-form-item>
          </template>

          <!-- 第一级：Edit type = snmp credential -->
          <template v-if="editData.editType === assetConstants.editTypeData.snmpCredential">
            <el-form-item :label="$t('asset.snmpCredential')" prop="snmpCredentialId">
              <el-select v-model="editData.snmpCredentialId" class="right-box__select" popper-class="right-box-select-dropdown prevent-clickoutside" size="small" value-key="id">
                <el-option v-for="snmp in snmpCredentialData" :key="snmp.id" :label="snmp.name" :value="snmp.id"></el-option>
              </el-select>
            </el-form-item>
          </template>

          <!-- 选择资产，穿梭框 -->
          <div class="form__sub-title">{{$t('overall.select')}}</div>
          <div style="position: relative">
            <nz-transfer ref="transfer"
                         :showError="showError"
                         style="margin-bottom: 20px;"
                         :page-obj="transfer.pageObj"
                         :search-msg="transfer.searchMsg"
                         :table-data="transfer.tableData"
                         :tableTitle="transfer.tableTitle"
                         @pageNo="pageNoChange"
                         @search="search"
                         @leftToRight="addAsset"
                         @rightToLeft="removeAsset">
              <template v-slot:title>Selected</template>
            </nz-transfer>
            <div v-if="showError" class="el-form-item__error">{{this.$t('validate.required')}}</div>
          </div>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{obj: editData, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="asset-edit-save" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import nzTransfer from '@/components/common/nzTransfer'
import { asset as assetConstants } from '@/components/common/js/constants'
import editRigthBox from '../../mixin/editRigthBox'
export default {
  name: 'assetBatchEditBox',
  components: {
    nzTransfer
  },
  props: {
    fieldGroupData: {
      type: Array
    },
    stateData: {
      type: Array
    },
    snmpCredentialData: {
      type: Array
    }
  },
  mixins: [editRigthBox],
  data () {
    const vm = this
    return {
      assetConstants,
      url: 'asset/asset',
      editData: {
        editType: 1,
        authProtocol: 1,
        authType: 1,
        fields: [],
        port: 22,
        snmpCredentialId: null
      },
      labelCascProp: {
        lazy: true,
        value: 'id',
        label: 'name',
        lazyLoad (node, resolve) {
          const { level } = node
          vm.$get('asset/field/meta', { groupIds: node.data.id }).then(response => {
            if (response.code === 200) {
              const meta = response.data.list.map(item => ({
                ...item,
                leaf: level >= 1,
                disabled: vm.editData.fields.some(a => a.id === item.id)
              }))
              vm.metaData = meta
              resolve(meta)
            }
          })
        }
      },
      labelCascShow: true, // 用来控制label的cascader的重新渲染
      transfer: {
        tableData: [],
        selectedData: [],
        searchLabel: {},
        searchMsg: { // 给搜索框子组件传递的信息
          searchLabelList: [
            {
              id: 1,
              name: 'ID',
              type: 'input',
              label: 'id',
              disabled: false
            }, {
              id: 20,
              name: 'SN',
              type: 'input',
              label: 'sn',
              disabled: false
            }, {
              id: 21,
              name: 'Host',
              type: 'input',
              label: 'manageIp',
              disabled: false
            }, {
              id: 22,
              name: this.$t('asset.state'),
              type: 'select',
              label: 'assetState',
              disabled: false
            }, {
              id: 23,
              name: 'pingStatus',
              type: 'select',
              label: 'pingStatus',
              disabled: false
            }, {
              id: 23,
              name: this.$t('asset.cabinet'),
              type: 'input',
              label: 'cabinetName',
              disabled: false
            }
          ]
        },
        tableTitle: [
          {
            label: this.$t('overall.name'),
            prop: 'name',
            show: true
          },
          {
            label: this.$t('asset.manageIp'),
            prop: 'manageIp',
            show: true
          }
        ],
        pageObj: {
          pageNo: 1,
          pageSize: 10,
          pages: 1,
          total: 0
        }
      },
      rules: {
        editType: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        authProtocol: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        authUsername: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        authPin: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        authUserTip: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        authPinTip: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      metaData: [],
      showError: false
    }
  },
  methods: {
    search (searchLabel, page) {
      this.transfer.searchLabel = JSON.parse(JSON.stringify(searchLabel))
      this.transfer.pageObj = JSON.parse(JSON.stringify(page))
      this.getTableData()
    },
    esc (refresh) {
      this.$emit('close', refresh)
    },
    save () {
      this.editData.ids = this.transfer.selectedData.map(d => d.id)
      if (this.editData.ids.length === 0) {
        this.showError = true
      }
      this.$refs.assetEditForm.validate((valid) => {
        if (valid && !this.showError) {
          this.$put('asset/asset/bulkEdit', this.editData).then(res => {
            if (res.code === 200) {
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
              this.esc(true)
            }
          })
        }
      })
    },
    addLabel ([groupId, metaId]) {
      const label = this.metaData.find(m => m.id === metaId)
      this.editData.fields.push({ ...label, value: this.blankLabelValue(label), action: 0 })
      this.labelCascShow = false
      this.$nextTick(() => {
        this.labelCascShow = true
      })
    },
    addMultiTextRow (label) {
      label.value.push('')
    },
    blankLabelValue (label) {
      if (label.type.toUpperCase() === this.assetConstants.labelTypeData.CHECKBOX) {
        return []
      } else if (label.type.toUpperCase() === this.assetConstants.labelTypeData.MULTITEXT) {
        return ['']
      } else {
        return ''
      }
    },
    removeLabel (label) {
      let index = 0
      this.editData.fields.find((f, i) => {
        if (label.id === f.id) {
          index = i
          return true
        }
        return false
      })
      this.editData.fields.splice(index, 1)
      this.labelCascShow = false
      this.$nextTick(() => {
        this.labelCascShow = true
      })
    },
    pageNoChange (val) {
      this.transfer.pageObj.pageNo = val
      this.getTableData()
    },
    getTableData () {
      this.$refs.transfer.startLoading()
      const searchLabel = { ...this.transfer.searchLabel }
      if (this.editData.editType === assetConstants.editTypeData.account) {
        searchLabel.authProtocol = this.editData.authProtocol
      }
      this.$get(this.url, { ...searchLabel, ...this.transfer.pageObj }).then(response => {
        this.$refs.transfer.endLoading()
        if (response.code === 200) {
          this.transfer.tableData = response.data.list
          this.transfer.pageObj.total = response.data.total
          this.transfer.pageObj.pages = response.data.pages
        }
      })
    },
    addAsset (toAdd) {
      this.transfer.selectedData = toAdd
      this.transfer.tableData.forEach(d => {
        this.$set(d, 'hide', this.transfer.selectedData.some(s => s.id === d.id))
      })
      this.showError = false
    },
    removeAsset (toRemove) {
      this.transfer.selectedData = this.transfer.selectedData.filter(d => !toRemove.find(s => d.id === s.id))
      this.transfer.tableData.forEach(d => {
        this.$set(d, 'hide', this.transfer.selectedData.some(s => s.id === d.id))
      })
      // dc, brand, model, type
    }
  },
  mounted () {
    this.getTableData()
  },
  watch: {
    'editData.authProtocol': {
      immediate: true,
      deep: true,
      handler (n) {
        this.getTableData()
      }
    },
    'editData.editType': {
      immediate: true,
      deep: true,
      handler (n) {
        this.isEdit = true
        if (n !== assetConstants.editTypeData.account) {
          this.editData.authProtocol = 1
        } else {
          this.getTableData()
        }
      }
    }
  }
}
</script>

<style lang="scss">
  @import '@/assets/css/common/rightBoxCommon.scss';
</style>
