<template>
  <div v-clickoutside="{obj: editAlertRule, func: clickOutside}" class="right-box right-box-alert-rule">
    <div class="right-box__header">
      <!-- begin--标题-->
      <div class="header__title">{{alertRule.id ? $t("alert.config.editAlertConfig") : $t("alert.config.createAlertConfig")}}</div>
      <!-- end--标题-->
      <div class="header__operation">
        <span v-cancel="{obj: editAlertRule, func: esc}"><i class="nz-icon nz-icon-close"></i></span>
      </div>
    </div>

    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="alertRuleForm" :model="editAlertRule" :rules="rules" label-position = "top" label-width="120px">
          <!--name-->
          <el-form-item :label='$t("alert.config.name")' prop="name">
            <el-input id="alert-box-input-name" v-model="editAlertRule.name" maxlength="64" placeholder="" show-word-limit size="small"></el-input>
          </el-form-item>
          <el-form-item :label='$t("alert.config.expr")' prop="expr" >
            <el-row style="line-height: 32px;">
              <promql-input
                id="alert-box-input-promql"
                ref="promql"
                :expression-list.sync="expressions"
                :index="0"
                :plugins="['metric-selector','metric-input']"
                :required="true"
                :styleType="3"
                @change="metricChange"
              ></promql-input>
            </el-row>
          </el-form-item>
          <!--threshold-->
          <el-form-item :label="$t('alert.config.threshold')" prop="threshold" style="display: inline-block;">
            <el-input id="alert-box-input-threshold" v-model="editAlertRule.threshold" placeholder="" size="small" type="text">
              <el-select id="alert-box-input-operator" slot="prepend" v-model="editAlertRule.operator" class="hide-icon" popper-class="right-box-select-dropdown prevent-clickoutside" size="small">
                <el-option v-for="item in operators" :id="'operator-'+item.key" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-input>
          </el-form-item>
          <!--unit-->
          <el-form-item :label="$t('alert.config.unit')" prop="unit">
            <el-cascader id="alert-box-input-unit" v-model="editAlertRule.unit" :options="unitOptions" :props="{ expandTrigger: 'click',emitPath:false }" :show-all-levels="false" filterable
                         placeholder=""
                         popper-class="no-style-class unit-popper-class"
                         size="small"
                         style="width: 100%"
            >
            </el-cascader>
          </el-form-item>
          <!--last-->
          <el-form-item :label="$t('alert.config.for')" prop="last">
            <el-input id="alert-box-input-last" v-model.number="editAlertRule.last" placeholder="" size="small" type="text">
              <template slot="append">{{$t('alert.config.second')}}</template>
            </el-input>
          </el-form-item>
          <!--severity-->
          <el-form-item :label="$t('alert.severity')" class="severity-box" prop="severityId">
            <el-select id="alert-box-input-severity" v-model="editAlertRule.severityId" class="right-box__select" placeholder="" popper-class="right-box-select-dropdown prevent-clickoutside" size="small">
              <el-option v-for="item in severityData" :id="'alert-severity-'+item.value" :key="item.id" :label="item.name" :value="item.id">
                <span>
                   <i :style="{color:item.color,'font-size':'12px'}" class="nz-icon nz-icon-circle"></i> {{item.name}}
                </span>
              </el-option>
            </el-select>
            <i v-if="editAlertRule.severityId" :style="{color:severityData.length > 0 && severityData.find(severity => severity.id ===  editAlertRule.severityId).color,'font-size':'12px'}" class="nz-icon nz-icon-circle severity-circle"></i>
          </el-form-item>
          <!--receiver-->
          <el-form-item :label="$t('config.user.receiver')" prop="receiver">
            <el-select
              id="alert-box-input-receiver"
              v-model.trim="editAlertRule.receiverShow"
              class="right-box__select"
              filterable
              multiple
              placeholder=""
              popper-class="right-box-select-dropdown prevent-clickoutside"
              size="small"
              value-key="userId"
              @change="receiverShowChange"
            >
              <el-option
                v-for="item in userData"
                :key="item.id"
                :label="item.username"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <!--notify-->
          <el-form-item :label="$t('alert.notify')" :rules="[{ validator: validateNotify, trigger: 'change'},]" class="notify-box" prop="method">
            <el-select id="alert-box-input-notify" v-model="editAlertRule.method" class="right-box__select" multiple placeholder="" popper-class="right-box-select-dropdown prevent-clickoutside" size="small">
              <el-option v-for="item in notifyData" :id="'alert-severity-'+item.value" :key="item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <!--summary-->
          <el-form-item :label="$t('alert.summary')" prop="summary">
            <el-input id="alert-box-input-summary" v-model="editAlertRule.summary" maxlength="512" placeholder="" rows="3" show-word-limit size="small" type="textarea"></el-input>
          </el-form-item>
          <!--description-->
          <el-form-item :label="$t('overall.remark')" prop="description">
            <el-input id="alert-box-input-description" v-model="editAlertRule.description" maxlength="256" placeholder="" rows="4" show-word-limit size="small" type="textarea"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <!-- end--表单-->

    <!--底部按钮-->
    <div class="right-box__footer">
      <button id="alert-box-esc" v-cancel="{obj:editAlertRule,func:esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="alert-box-save" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import chartDataFormat from '../../charts/chartDataFormat'
import promqlInput from '../../page/dashboard/explore/promqlInput'
import { nzNumber } from '../js/validate'
import editRigthBox from '../mixin/editRigthBox'
export default {
  name: 'alertRuleBox',
  props: {
    alertRule: Object
  },
  components: {
    'promql-input': promqlInput
  },
  mixins: [editRigthBox],
  data () {
    return {
      promqlCount: 1,
      promqlKeys: [0],
      expressions: [''],
      legends: [''],

      editAlertRule: {},
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        expr: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        last: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { type: 'number', message: this.$t('validate.number') }
        ],
        severityId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        summary: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        operator: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        unit: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        threshold: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: nzNumber, trigger: 'blur' }
        ]
      },
      operators: [
        {
          label: '==',
          value: '=='
        },
        {
          label: '!=',
          value: '!='
        },
        {
          label: '>',
          value: '>'
        },
        {
          label: '<',
          value: '<'
        },
        {
          label: '>=',
          value: '>='
        },
        {
          label: '<=',
          value: '<='
        }
      ],
      unitOptions: chartDataFormat.unitOptions(),

      userData: [],
      severityData: [],
      notifyData: []
    }
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
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.editAlertRule.expr = this.expressions[0]
      const params = {
        ...this.editAlertRule,
        method: this.editAlertRule.method.join(',')
      }
      this.$refs.alertRuleForm.validate((valid) => {
        if (valid) {
          params.receiver = this.editAlertRule.receiverShow.join(',')
          if (this.editAlertRule.id) {
            this.$put('alert/rule', params).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          } else {
            this.$post('alert/rule', params).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          }
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    },
    del () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('alert/rule?ids=' + this.editAlertRule.id).then(response => {
          this.prevent_opt.save = false
          if (response.code === 200) {
            this.$message({ type: 'success', message: this.$t('tip.deleteSuccess') })
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {
        this.prevent_opt.save = false
      })
    },
    getUserList () {
      this.$get('sys/user', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code == 200) {
          this.userData = response.data.list
        }
      })
    },
    metricChange (val) {
      this.editAlertRule.expr = val
    },
    getSeverityData () {
      this.$get('alert/severity', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code == 200) {
          this.severityData = response.data.list
          if (!this.editAlertRule.id && this.severityData.length > 0) {
            this.editAlertRule.severityId = this.severityData[0].id
          }
        }
      })
    },
    getNotifyData () {
      this.$get('alert/notify/method', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code == 200) {
          this.notifyData = response.data.list
        }
      })
    },
    receiverShowChange (val) {
      if (!val.length) {
        this.$refs.alertRuleForm.validateField('method')
      }
    },
    validateNotify (rule, value, callback) {
      if (this.editAlertRule.receiverShow.length && value.length === 0) {
        callback(new Error(this.$t('validate.required')))
      } else {
        callback()
      }
    }
  },
  mounted () {
    this.getUserList()
    this.getSeverityData()
    this.getNotifyData()
  },
  watch: {
    alertRule: {
      deep: true,
      immediate: true,
      handler (n, o) {
        if (n.id) {
          this.isEdit = true
        }
        this.editAlertRule = JSON.parse(JSON.stringify(n))
        if (this.editAlertRule.id) {
          this.expressions = [this.editAlertRule.expr]
          this.$nextTick(() => {
            this.expressions.forEach((ex, index) => {
              if (ex) {
                this.$refs.promql.metricChange(ex)
              }
            })
          })
        }
      }
    }
  }
}
</script>
<style>
.hide-icon .el-input__suffix {
  display: none;
}
</style>
<style scoped>
  .severity-circle{
    position: absolute;
    left: 10px;
    top: 0;
  }
  .severity-box{
    position: relative;
  }
  .severity-box /deep/ .el-select .el-input__inner{
    padding-left: 25px;
  }
</style>
