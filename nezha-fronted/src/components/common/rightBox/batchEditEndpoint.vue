<template>
  <div v-clickoutside="{obj: editData, func: esc}" class="right-box right-box-endpoint-batch">
    <div class="right-box__header">
      <div class="header__title">{{$t('endpoint.batchEditendpoint')}}</div>
      <div class="header__operation">
        <span @click="esc"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <!-- Edit type -->
        <el-form ref="endpointEditForm" :model="editData" :rules="rules" label-position="top" label-width="120px">
          <el-form-item :label="$t('overall.type')" prop="editType">
            <el-select v-model="editData.editType" @change="endpointBatch" class="right-box__select" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="value">
              <el-option v-for="type in endpointConfig.editTypeOptions" :key="type.value" :label="$t(type.label)" :value="type.value"/>
            </el-select>
          </el-form-item>
          <div class="form__sub-title" style="margin-top: 20px">{{$t(endpointConfig.editTypeOptions.find(title=>title.value === editData.editType).label)}}</div>
          <!-- Edit type === 1  metric label-->
          <template v-if="editData.editType === 1">
<!--            <div class="form__sub-title">{{$t('overall.labels')}}</div>-->
            <div v-for="(item, index) in editData.labels" :key="index" class="form__dotted-item">
              <el-form-item :prop="'labels.' + index + '.value'">
                <template v-slot:label>
                  <div class="form__labels-label">
                    <span>{{$t('endpoint.labelKey')}}</span>
                    <div>
                      <el-checkbox v-model="item.action" :false-label="0" :label="$t('overall.delete')" :true-label="1" size="small" style="padding-right: 20px;"></el-checkbox>
                      <span @click="removeLabels(index)" :title="$t('overall.delete')"><i class="nz-icon nz-icon-minus"></i></span>
                    </div>
                  </div>
                  <el-form-item :prop="'labels.' + index + '.key'" :rules="[{ required: true,message: $t('validate.required'),trigger: 'blur'},{ pattern: /[a-zA-Z_][a-zA-Z0-9_]*/, message: $t('overall.ASCIIKey') ,trigger: 'blur'}]">
                    <el-input v-model="item.key" placeholder="key" size="mini" ></el-input>
                  </el-form-item>
                  <div class="form__labels-label" style="margin-top: 10px" v-if="!item.action">
                    <span>{{$t('endpoint.labelValue')}}</span>
                  </div>
                  <el-form-item :prop="'labels.' + index + '.value'" :rules="[{ required: !item.action,message: $t('validate.required'),trigger: 'blur'}]" v-if="!item.action">
                    <el-input v-model="item.value" placeholder="value" size="mini"></el-input>
                  </el-form-item>
                </template>

              </el-form-item>
            </div>
            <!-- label的新增按钮 -->
            <div class="form__flex-container hide-casc-input">
              <div style="text-align: center">
                 <span id="module-add-param" class="right-box-form-add module-add-label" type="button" @click="addLabels">
                <span :title="$t('tip.add')"><i class="nz-icon nz-icon-plus" style="font-size: 16px;"></i></span>
              </span>
              </div>
            </div>
          </template>
          <!-- Edit type === 2 || 3 metric enable-->
          <el-form-item :label="$t('overall.state')" prop="enable" v-if="editData.editType!==1">
            <el-select v-model="editData.enable" class="right-box__select" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="value">
              <el-option :value="1" :label="$t('overall.enabled')">{{$t('overall.enabled')}}</el-option>
              <el-option :value="0" :label="$t('overall.disabled')">{{$t('overall.disabled')}}</el-option>
            </el-select>
          </el-form-item>
          <!-- 选择Endpoint，穿梭框 -->
          <div class="form__sub-title" style="margin-top: 20px">{{$t('overall.select')}}</div>
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
                         @leftToRight="addEndpoint"
                         @rightToLeft="removeEndpoint">
              <template v-slot:title>{{$t('overall.selected')}}</template>
            </nz-transfer>
            <div v-if="showError" class="el-form-item__error">{{$t('validate.required')}}</div>
          </div>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="endpoint-edit-cancel" v-cancel="{obj: editData, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="endpoint-edit-save" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import nzTransfer from '@/components/common/nzTransfer'
import { endpoint as endpointConfig } from '@/components/common/js/constants'
import editRigthBox from '@/components/common/mixin/editRigthBox'
export default {
  name: 'endpointBatchEditBox',
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
      endpointConfig,
      url: 'monitor/endpoint',
      editData: {
        editType: 1,
        labels: [{
          action: 0,
          key: '',
          value: ''
        }],
        enable: 1
      },
      transfer: {
        tableData: [],
        selectedData: [],
        searchLabel: {},
        searchMsg: { // 给搜索框子组件传递的信息
          searchLabelList: [
            {
              id: 13,
              name: 'ID',
              type: 'input',
              label: 'ids',
              disabled: false
            }, {
              name: this.$t('overall.name'),
              type: 'input',
              label: 'name',
              disabled: false
            },
            {
              name: this.$t('overall.asset'),
              type: 'input',
              label: 'assetName',
              disabled: false
            },
            {
              name: this.$t('overall.projectName'),
              type: 'project',
              label: 'projectIds',
              id: 11,
              readonly: true,
              disabled: false
            }, {
              name: this.$t('overall.module'),
              type: 'module',
              label: 'moduleIds',
              id: 11,
              readonly: true,
              disabled: false
            }
          ]
        },
        tableTitle: [
          {
            label: this.$t('overall.name'),
            prop: 'name',
            show: true,
            slot: false
          }, {
            label: this.$t('project.module.module'),
            prop: 'module',
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
    endpointBatch () {
      // this.getTableData()
      this.editData.enable = 1
      this.editData.labels = [{
        action: 0,
        key: '',
        value: ''
      }]
    },
    esc (refresh) {
      this.$emit('close', refresh)
    },
    save () {
      this.editData.ids = this.transfer.selectedData.map(d => d.id)
      if (this.editData.ids.length === 0) {
        this.showError = true
      }
      this.$refs.endpointEditForm.validate((valid) => {
        if (valid && !this.showError) {
          const params = this.$lodash.cloneDeep(this.editData)
          if (params.editType === 1) {
            delete params.enable
          } else {
            delete params.labels
          }
          this.$put('monitor/endpoint/bulk', params).then(res => {
            if (res.code === 200) {
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
              this.esc(true)
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
    },
    pageNoChange (val) {
      this.transfer.pageObj.pageNo = val
      this.getTableData()
    },
    getTableData () {
      this.$refs.transfer && this.$refs.transfer.startLoading()
      const searchLabel = { ...this.transfer.searchLabel }
      this.$get(this.url, { ...searchLabel, ...this.transfer.pageObj }).then(response => {
        this.$refs.transfer.endLoading()
        if (response.code === 200) {
          this.transfer.tableData = response.data.list
          this.transfer.pageObj.total = response.data.total
          this.transfer.pageObj.pages = response.data.pages
        }
      })
    },
    addEndpoint (toAdd) {
      this.transfer.selectedData = toAdd
      this.transfer.tableData.forEach(d => {
        this.$set(d, 'hide', this.transfer.selectedData.some(s => s.id === d.id))
      })
      this.showError = false
    },
    removeEndpoint (toRemove) {
      this.transfer.selectedData = this.transfer.selectedData.filter(d => !toRemove.find(s => d.id === s.id))
      this.transfer.tableData.forEach(d => {
        this.$set(d, 'hide', this.transfer.selectedData.some(s => s.id === d.id))
      })
      // dc, brand, model, type
    },
    addLabels () {
      this.editData.labels.push({
        action: 0,
        key: '',
        value: ''
      })
    },
    removeLabels (i) {
      this.editData.labels.splice(i, 1)
    }
  },
  mounted () {
    this.getTableData()
  },
  watch: {

  }
}
</script>
