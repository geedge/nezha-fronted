<template>
  <div class="right-box right-box-record-rule" v-clickoutside="{obj:editRecordRule,func:clickOutside}">
    <!-- begin--标题-->
    <div class="right-box__header">
      <div class="header__title">{{editRecordRule.id ? $t("overall.recordRule.edit") : $t("overall.createRecordRule")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editRecordRule, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="recordRuleForm" :model="editRecordRule"
                 :rules="rules" label-position="top" label-width="120px">
            <!-- name -->
          <el-form-item :label='$t("overall.name")' prop="name">
            <el-input
              v-model="editRecordRule.name" :placeholder="''"
              maxlength="64"
              show-word-limit
              size="small">
            </el-input>
          </el-form-item>
           <!--type-->
          <el-form-item :label="$t('overall.type')" prop="type" >
            <el-select v-model="editRecordRule.type" class="right-box__select" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small">
              <el-option :label="$t('overall.metrics')" value="1">{{$t('overall.metrics')}}</el-option>
              <el-option :label="$t('overall.logs')" value="2">{{$t('overall.logs')}}</el-option>
            </el-select>
          </el-form-item>
           <!--expr-->
          <el-form-item :label='$t("config.exprTemp.expression")' prop="expr">
              <template v-if="showMetrics">
                <el-row style="line-height: 32px;">
                  <promql-input
                    :from-father-data="true"
                    :metricOptionsParent="metricOptions"
                    id="alert-box-input-promql"
                    ref="promql"
                    :expression-list.sync="expressions"
                    :index="0"
                    :plugins="['metric-selector','metric-input']"
                    :required="true"
                    type="metric"
                    :styleType="3"
                    @change="metricChange"
                  ></promql-input>
                </el-row>
              </template>
              <template v-else>
                <el-row style="line-height: 32px;">
                  <promql-input
                    :from-father-data="true"
                    :metricOptionsParent="metricOptions"
                    id="record-box-input-promql"
                    ref="promql"
                    :expression-list.sync="expressions"
                    :index="0"
                    :plugins="['metric-selector','metric-input']"
                    :required="true"
                    type="log"
                    :styleType="3"
                    @change="metricChange"
                  ></promql-input>
                </el-row>
              </template>
            </el-form-item>
          <!-- inr -->
          <el-form-item :label='$t("config.assetLabel.interval")' prop="inr">
            <el-input-number
              v-model="editRecordRule.inr"
              size="small"
              style="width: 100%"
              :placeholder="$t('recordRule.defalutInterval')"
              :max="9999999999"
              :precision="0"
              :min="0"
              :controls="false"
              class="append_unit"
              :data-unit="$t('overall.seconds')"
              @change="changeInr"
            >
            </el-input-number>
          </el-form-item>
          <!--state-->
          <el-form-item :label="$t('overall.state')" prop="state" >
            <el-select v-model="editRecordRule.state" class="right-box__select"  placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small">
              <el-option :label="$t('overall.enabled')" value="1">{{$t('overall.enabled')}}</el-option>
              <el-option :label="$t('overall.disabled')" value="0">{{$t('overall.disabled')}}</el-option>
            </el-select>
          </el-form-item>
          <!-- labels -->
           <el-form-item :label='$t("project.endpoint.labels2")' class="matchers" prop="labels">
            <div v-for="(item, index) in editRecordRule.labels" :key="index" class="param-box-row">
              <el-form-item :prop="'labels.' + index + '.label'" :rules="[{ message: $t('validate.required'), trigger: 'change' },{ pattern: /[a-zA-Z_][a-zA-Z0-9_]*/, message: $t('overall.ASCIIKey'), trigger: 'change' }]" class="param-box-row-key">
                <el-input v-model="item.label" class="silence-matchers-name" placeholder=""  size="mini"></el-input>
              </el-form-item>
              <span class="param-box-row-eq" @click="li(item)">=</span>
              <el-form-item :prop="'labels.' + index + '.value'" class="param-box-row-value" >
                <el-input v-model="item.value" class="silence-matchers-value" placeholder=""  size="mini"></el-input>
              </el-form-item>
              <span :id="'moduel-remove-label-'+index" class="param-box-row-symbol" @click="removeLabels(index)" :title="$t('overall.delete')"><i class="nz-icon nz-icon-shanchu1"></i></span>
            </div>
            <div class="" style="text-align: center;">
               <span id="module-add-label" type="button" @click="addLabels" class="right-box-form-add module-add-label right-box-form-minus-box module-add-label" style=""  :title="$t('tip.add')">
              <span><i style="font-size: 16px;" class="nz-icon nz-icon-create-square"></i></span>
            </span>
            </div>
          </el-form-item>
          <!-- remark -->
          <el-form-item :label='$t("overall.remark")' class="range-time" prop="remark">
            <el-input
              v-model="editRecordRule.remark"
              maxlength="256"
              size="small" :rows="2"
              show-word-limit
              type="textarea">

            </el-input>
          </el-form-item>

        </el-form>
      </div>

    </div>
    <!-- end--表单-->

    <!--底部按钮-->
    <div class="right-box__footer">
      <button v-cancel="{obj:editRecordRule,func:esc}" id="alert-box-esc"
              class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save"
              class="footer__btn" id="alert-box-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import lodash from 'lodash'
import editRigthBox from '../mixin/editRigthBox'
import promqlInput from '../../page/dashboard/explore/promqlInput'
import promqlInputMixin from '@/components/common/mixin/promqlInput'
export default {
  name: 'recordRuleBox',
  components: {
    'promql-input': promqlInput
  },
  mixins: [editRigthBox, promqlInputMixin],
  props: {
    recordRule: Object
  },
  data () {
    return {
      showMetrics: true,
      expressions: [''],
      editRecordRule: {
        id: '',
        name: '',
        type: '1',
        expr: '',
        inr: '',
        labels: [{ label: '', value: '' }],
        remark: '',
        state: '1'
      },
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' },
          { pattern: /^[a-zA-Z_:][a-zA-Z0-9_:]*$/, message: this.$t('overall.ASCIIKey'), trigger: 'change' }
        ],
        type: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        expr: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        state: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      }
    }
  },
  mounted () {
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    save () {
      this.editRecordRule.expr = this.expressions[0]
      this.$refs.recordRuleForm.validate((valid) => {
        // 处理labels数据
        const obj = {}
        this.editRecordRule.labels.forEach(item => {
          obj[item.label] = item.value
        })

        const params = {
          ...this.editRecordRule,
          state: Number(this.editRecordRule.state),
          type: Number(this.editRecordRule.type),
          inr: this.editRecordRule.inr ? Number(this.editRecordRule.inr) : '',
          labels: this.editRecordRule.labels[0].label != '' ? JSON.stringify(obj) : '{}'
        }

        // 处理exp
        if (!this.expressions[0]) {
          this.prevent_opt.save = false
          this.$message.error(this.$t('config.exprTemp.expressionError'))
          return
        }
        if (valid) {
          this.prevent_opt.save = true
          if (this.editRecordRule.id) {
            this.$put('/record/rule', params).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          } else {
            this.$post('record/rule', params).then(response => {
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          }
        } else {
          this.prevent_opt.save = false
        }
      })
    },
    // 新增label
    addLabels () {
      this.editRecordRule.labels.push({ label: '', value: '' })
    },
    // 移除单个Label
    removeLabels (index) {
      if (this.editRecordRule.labels.length === 1) {
        this.editRecordRule.labels = [{ label: '', value: '' }]
        return
      }
      this.editRecordRule.labels.splice(index, 1)
    },
    metricChange (val) {
      this.editRecordRule.expr = val
    },
    labelsSort (obj) {
      if (typeof obj != 'object') {
        const labels = JSON.parse(lodash.cloneDeep(obj))
        const result = []
        if (Object.keys(labels).length === 0) {
          result.push({ label: '', value: '' })
        } else {
          for (const key in labels) {
            result.push({ label: key, value: labels[key] })
          }
        }
        return result
      }
      return obj
    },
    changeInr () {
      if (!this.editRecordRule.inr) {
        setTimeout(() => {
          this.editRecordRule.inr = undefined
        }, 100)
      }
    }
  },
  watch: {
    recordRule: {
      deep: true,
      immediate: true,
      handler (n, o) {
        this.isEdit = true
        const editObj = lodash.cloneDeep(n)
        this.editRecordRule = {
          ...editObj,
          type: editObj.type + '',
          inr: isNaN(editObj.inr) || !editObj.inr ? undefined : editObj.inr,
          labels: typeof editObj.labels != 'object' ? this.labelsSort(editObj.labels) : editObj.labels,
          state: editObj.state + ''
        }
        // expression
        if (this.editRecordRule.id || this.editRecordRule.name) {
          this.expressions = [this.editRecordRule.expr]
          this.$nextTick(() => {
            this.expressions.forEach((ex, index) => {
              if (ex) {
                this.$refs.promql.metricChange(ex)
              }
            })
          })
        }
      }
    },
    'editRecordRule.type': {
      deep: true,
      immediate: true,
      handler (n, o) {
        if (n == 2) { this.showMetrics = false } else { this.showMetrics = true }
      }
    }
  }
}
</script>
