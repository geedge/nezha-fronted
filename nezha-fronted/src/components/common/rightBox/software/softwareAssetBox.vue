<template>
  <div v-clickoutside="{obj: editSoftwareAsset,oldData:oldData, func: esc}" class="right-box right-box-editSoftwareAsset right-box-edit-endpoint ">
    <div class="right-box__header">
      <div class="header__title">{{editSoftwareAsset.id ? $t('softwareAsset.edit') : $t('softwareAsset.create')}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editSoftwareAsset, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="modelForm" :model="editSoftwareAsset" :rules="rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label="$t('overall.name')" prop="name">
            <el-input maxlength="128" show-word-limit v-model="editSoftwareAsset.name" size="small" type="text"></el-input>
          </el-form-item>
          <!--type-->
          <el-form-item :label="$t('softwareType.text')" prop="typeId" class="select-warp">
            <!-- <el-input maxlength="128" show-word-limit v-model="editSoftwareAsset.type" size="small" type="text"></el-input> -->
            <el-select v-model="editSoftwareAsset.typeId" size="small" class="right-box__select" popper-class="right-box-select-top prevent-clickoutside" @change="renderParams">
              <el-option v-for="item in softwareTypeArr" :key="item.id" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </el-form-item>
          <!-- asset -->
          <el-form-item :label='$t("asset.asset")' label-width="125px" prop="assetId" v-if="!disabled">
            <v-selectpage
              :data="assetList"
              :tb-columns="columns"
              :params="{
                varType: 2, dashboardId: 0,
                returnChildren:0,groupId:0,
              }"
              :multiple="false"
              :language="language"
              title="ChartSearch"
              key-field="id"
              show-field="name"
              :width="626"
              v-model="editSoftwareAsset.assetId"
              class="form-control"
              ref="sp"
              :result-format="resultFormat"
            ></v-selectpage>
          </el-form-item>
          <!--remark-->
          <el-form-item :label="$t('overall.remark')" prop="remark">
            <el-input maxlength="256" show-word-limit v-model="editSoftwareAsset.remark" size="small" :rows="2" type="textarea"></el-input>
          </el-form-item>
          <!--params-->
          <div class="form__sub-title" >
            <span>{{$t('softwareAsset.Connector')}}</span>
          </div>
<!--          <el-form-item v-for="(value, key) in editSoftwareAsset.params" :label="key" :key="key">-->
<!--            <el-input maxlength="128" show-word-limit v-model="editSoftwareAsset.params[key]" size="small" type="text" @input="$forceUpdate()"></el-input>-->
<!--          </el-form-item>-->
          <el-form-item prop="paramObj" v-my-loading="loading">
            <div v-for="(label, i) in editSoftwareAsset.paramObj" :key="i" class="form__dotted-item form__dotted-item-required">
              <el-form-item :prop="'paramObj.' + i + '.value.0'" :rules="[ { required: JSON.parse(label.param).required === '1', message: $t('validate.required'), trigger: 'blur' }]">
                <template v-slot:label>
                  <div class="form__labels-label">
                    <span>{{label.name}}</span>
                  </div>
                </template>
                <template v-if="label.action !== 1">
                  <template v-if="label.type.toUpperCase() === assetConstants.labelTypeData.TEXT">
                    <el-input v-model="label.value[0]" size="small"/>
                  </template>
                  <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.PASSWORD">
                    <el-input v-model="label.value[0]" type="password" size="small"/>
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
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{obj: editSoftwareAsset, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="asset-edit-save" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
// import { host, port } from '@/components/common/js/validate'
import editRigthBox from '../../mixin/editRigthBox'
import { sysObjectIdInput } from '@/components/common/js/validate'
import iconList from '@/components/common/js/iconList'
import { asset as assetConstants } from '@/components/common/js/constants'
import axios from 'axios'
export default {
  name: 'softwareAssetBox',
  components: {
  },
  props: {
    obj: {
      type: Object
    }
  },
  computed: {
    isCurrentUser () {
      return function (username) {
        return localStorage.getItem('nz-username') == username
      }
    },
    language () { return this.$store.getters.getLanguage }
  },
  mixins: [editRigthBox],
  data () {
    const vm = this
    return {
      assetConstants,
      disabled: false,
      oldData: {},
      editSoftwareAsset: {
        id: '',
        name: '',
        typeId: '',
        assetId: '',
        params: {},
        remark: ''
      },
      DashboardSearchShowparamObj: [ // DashboardSearch 下拉搜索表头
        { title: 'ID', data: 'id' },
        { title: this.$t('overall.name'), data: 'name', key: 'name' },
        { title: this.$t('overall.remark'), data: 'remark', key: 'remark' }
      ],
      url: '/asset/software',
      roles: [],
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        typeId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      softwareTypeArr: [],
      assetList: [],
      columns: [
        { title: 'ID', data: 'id' },
        {
          title: this.$t('overall.name'),
          data: function (row) {
            if (row.name.length > 15) {
              return row.name.substring(0, 12) + '...'
            }
            return row.name
          },
          tip: function (row) {
            return row.name
          }
        },
        { title: this.$t('asset.manageIp'), data: 'manageIp', tip: 'manageIp' },
        {
          title: this.$t('overall.type'),
          data: (row) => {
            return row.type ? row.type.name : ''
          },
          tip: (row) => {
            return row.type ? row.type.name : ''
          }
        },
        {
          title: this.$t('asset.model'),
          data: (row) => {
            return row.model ? row.model.name : ''
          },
          tip: (row) => {
            return row.model ? row.model.name : ''
          }
        },
        {
          title: this.$t('overall.dc'),
          data: (row) => {
            return row.dc ? row.dc.name : ''
          },
          tip: (row) => {
            return row.dc ? row.dc.name : ''
          }
        }
      ],
      loading: false
    }
  },
  watch: {
    obj: {
      deep: true,
      immediate: true,
      handler (n) {
        this.isEdit = true
        const editSoftwareAsset = JSON.parse(JSON.stringify(n))
        editSoftwareAsset.assetId = ''
        this.editSoftwareAsset = editSoftwareAsset
        this.oldData = this.$lodash.cloneDeep(this.editSoftwareAsset)
      }
    }
  },
  created () {
    this.getAsset()
    this.getSoftwareTypeList()
  },
  mounted () {
    setTimeout(() => {
      if (this.obj.assetId && this.obj.assetId !== -1) {
        this.editSoftwareAsset.assetId = this.obj.assetId + ''
        this.oldData = this.$lodash.cloneDeep(this.editSoftwareAsset)
      }
    }, 500)
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },
    iconActive (subItem) {
      if (this.editSoftwareAsset.icon === subItem.value) {
        this.editSoftwareAsset.icon = undefined
        this.$set(this.editSoftwareAsset, 'icon', '')
      } else {
        this.editSoftwareAsset.icon = subItem.value
        this.$set(this.editSoftwareAsset, 'icon', subItem.value)
      }
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    save () {
      this.$refs.modelForm.validate((valid) => {
        if (valid) {
          const params = {
            ...this.editSoftwareAsset
          }
          params.params = {
            connectorAttributeKeys: []
          }
          params.paramObj.forEach(item => {
            params.params.connectorAttributeKeys.push({
              key: item.metaKey,
              value: item.value
            })
          })
          params.icon = this.imageUrl
          if (this.editSoftwareAsset.id) {
            this.$put(this.url, params).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          } else {
            this.$post(this.url, params).then(res => {
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
    /* 获取asset列表 */
    getAsset () {
      this.$get('asset/asset', { pageSize: -1 }).then(res => {
        this.assetList = res.data.list
      })
    },
    /* 获取softwareType列表 */
    getSoftwareTypeList () {
      this.$get('asset/software/type', { pageSize: -1, pageNo: 1 }).then(response => {
        if (response.code === 200) {
          this.softwareTypeArr = response.data.list
          if (this.editSoftwareAsset.typeId) {
            this.renderParams()
          }
        }
      })
    },
    resultFormat (resp) {
      if (resp && resp.data) {
        const assetData = {}
        assetData.list = resp.data.list
        assetData.totalRow = resp.data.total
        return assetData
      }
    },
    async renderParams () {
      // 获取当前type的attributes key
      this.loading = true
      const findItem = this.softwareTypeArr.find(item => item.id == this.editSoftwareAsset.typeId)
      const connectorAttributeKeys = this.$lodash.get(findItem, 'params.connectorAttributeKeys', [])
      const requests = connectorAttributeKeys.map(key => {
        return this.$get('asset/field/meta', { key: key })
      })
      const paramObj = []
      const res = await axios.all(requests)
      res.forEach(response => {
        const data = this.$lodash.get(response, 'data.list.0')
        if (data) {
          paramObj.push({ ...data, value: this.blankLabelValue(data), action: 0 })
        }
      })
      // 设置填写过的值
      const keyValue = this.$lodash.get(this.editSoftwareAsset, 'params.connectorAttributeKeys', [])
      paramObj.forEach(item => {
        const findValue = keyValue.find(subItem => subItem.key == item.metaKey)?.value
        findValue && (item.value = findValue)
      })
      this.$set(this.editSoftwareAsset, 'paramObj', paramObj)
      this.oldData = this.$lodash.cloneDeep(this.editSoftwareAsset)
      this.loading = false
    },
    blankLabelValue (label) {
      const defaultValue = JSON.parse(label.param).default || ''
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
        return [defaultValue]
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
        return [defaultValue]
      }
    }
  }
}
</script>
