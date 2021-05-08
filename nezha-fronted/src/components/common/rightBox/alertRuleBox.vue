<template>
  <div v-clickoutside="{obj: editAlertRule, func: clickOutside}" class="right-box right-box-alert-config">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button v-if="alertRule.id" id="alert-box-del" v-has="'rule_delete'" class="nz-btn nz-btn-size-normal nz-btn-size-alien" type="button" @click="del">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editAlertRule.id ? $t("alert.config.editAlertConfig") + "  ID：" + editAlertRule.id : $t("alert.config.createAlertConfig")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box-form-box">
      <el-form ref="alertRuleForm" :model="editAlertRule" :rules="rules" class="right-box-form right-box-form-left" label-position = "top" label-width="120px" style="width:100%">
        <!--name-->
        <el-form-item :label='$t("alert.config.name")' prop="name">
          <el-input id="alert-box-input-name" v-model="editAlertRule.name" maxlength="64" placeholder="" show-word-limit size="small"></el-input>
        </el-form-item>
        <el-form-item :label='$t("alert.config.expr")' prop="expr" >
          <promql-input
            id="alert-box-input-promql"
            ref="promql"
            :expression-list.sync="expressions"
            :index="0"
            :plugins="['metric-selector','metric-input']"
            :required="true"
            :styleType="2"
            @change="metricChange"
          ></promql-input>
        </el-form-item>
        <!--threshold-->
        <el-form-item :label="$t('alert.config.threshold')" prop="threshold" style="display: inline-block;">
          <el-input id="alert-box-input-threshold" v-model="editAlertRule.threshold" placeholder="" size="small" type="text">
            <el-select id="alert-box-input-operator" slot="prepend" v-model="editAlertRule.operator"  class="input-with-select" placeholder="" popper-class="config-dropdown threshold-dropdown" size="small">
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
        <el-form-item :label="$t('alert.severity')" prop="severity" class="severity-box">
          <el-select id="alert-box-input-severity" v-model="editAlertRule.severityId" placeholder=""  popper-class="config-dropdown severity-box" size="small">
            <el-option v-for="item in severityData" :id="'alert-severity-'+item.value" :key="item.id" :label="item.name" :value="item.id">
              <span>
                 <i class="nz-icon nz-icon-circle" :style="{color:item.color,'font-size':'12px'}"></i> {{item.name}}
              </span>
            </el-option>
          </el-select>
          <i class="nz-icon nz-icon-circle severity-circle" v-if="editAlertRule.severityId" :style="{color:severityData.find(severity => severity.id ===  editAlertRule.severityId).color,'font-size':'12px'}"></i>
        </el-form-item>
        <!--receiver-->
        <el-form-item :label="$t('config.user.receiver')" prop="receiver">
          <el-select
            id="alert-box-input-receiver"
            v-model.trim="editAlertRule.receiverShow"
            filterable
            multiple
            placeholder=""
            popper-class="no-style-class"
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
        <el-form-item :label="$t('alert.notify')" prop="method" class="notify-box" :rules="[{ validator: validateNotify, trigger: 'change'},]">
          <el-select id="alert-box-input-notify" v-model="editAlertRule.method" placeholder=""  popper-class="config-dropdown notify-box" size="small" multiple>
            <el-option v-for="item in notifyData" :id="'alert-severity-'+item.value" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <!--summary-->
        <el-form-item :label="$t('alert.summary')" prop="summary">
          <el-input id="alert-box-input-summary" v-model="editAlertRule.summary" maxlength="512" placeholder="" rows="3" show-word-limit size="small" type="textarea"></el-input>
        </el-form-item>
        <!--description-->
        <el-form-item :label="$t('alert.description')" prop="description">
          <el-input id="alert-box-input-description" v-model="editAlertRule.description" maxlength="512" placeholder="" rows="4" show-word-limit size="small" type="textarea"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <!-- end--表单-->

    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button id="alert-box-esc" v-cancel="{obj:editAlertRule,func:esc}" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="alert-box-save" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import chartDataFormat from '../../charts/chartDataFormat'
import promqlInput from '../../page/dashboard/explore/promqlInput'
import { nzNumber } from '../js/validate'
export default {
  name: 'alertConfigBox',
  props: {
    alertRule: Object
  },
  components: {
    'promql-input': promqlInput
  },
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
          this.editAlertRule.receiver = this.editAlertRule.receiverShow.join(',')
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
      console.log(val)
      if (!val.length) {
        this.$refs.alertRuleForm.validateField('method')
      }
    },
    validateNotify (rule, value, callback) {
      console.log(value)
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
  .unit-popper-class{
    z-index: 2052 !important;
  }
  .input-with-select{
    width: 70px !important;
  }
  .input-with-select #alert-box-input-operator{
    padding: 0;
    text-align: center;
    border-top:1px solid #d0d4dC;
    border-bottom:1px solid #d0d4dC;
    border-radius: 4px 0 0 4px;
  }
  .input-with-select #alert-box-input-operator + .el-input__suffix{
    display: none;
  }
</style>
<style scoped>
  .rule-severity-remark{
    display: inline-flex;
    justify-content: left;
    justify-items: center;
    align-items: center;
    width: calc(100% - 46px);
    padding: 10px 15px;
    background: #F6F6F6;
    color: #999999;
    margin-top: -13px;
    margin-bottom: 18px;
    margin-left: 15px;
    font-size: 14px;
  }
  .rule-severity-remark .nz-icon-info-normal{
    margin-right: 10px;
  }
  /deep/ .metric-selector-title{
    margin-left: 0 !important;
  }
  /* 标题样式 */
  .right-box-title{
    font-size: 16px;
    font-weight: 700;
    height: 60px;
    line-height: 60px;
    padding: 0 0 0 20px;
    border-bottom:1px solid #E7EAED ;
    box-sizing: border-box;
  }
  /* 表单 */
  .el-form-item {
    margin-left: 0  !important;
    width: 100%  !important;
    padding: 0 30px;
    box-sizing: border-box;
  }
  .el-form-item__lable{
    font-family: Roboto-Medium;
    font-weight: 500;
  }
  .rule-severity-remark{
    width: 640px;
    box-sizing: border-box;
    margin: -13px 30px 18px 30px;
  }
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
