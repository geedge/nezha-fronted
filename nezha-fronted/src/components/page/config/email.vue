<template>
  <div class="system">
    <div class="system-config-form">
    <div class="system-title">{{$t('overall.basicInfo')}}</div>
    <el-form :model="email"  label-width="180px" size="small" ref="emailForm" :rules="email.email_enable=='on'?emailRules:{}" :validate-on-rule-change="false">
      <el-form-item :label="$t('config.system.email.enable')" prop="email_enable">
        <el-checkbox v-model="email.email_enable" true-label="on" false-label="off"  @change="switchChange('emailForm')" id="system-email-email_enable"></el-checkbox>
      </el-form-item>
      <el-form-item :label="$t('config.system.email.smtpHost')" prop="email_host">
        <el-input v-model="email.email_host" :disabled="email.email_enable == 'off'" id="system-email-email_smtp_host"></el-input>
      </el-form-item>
      <el-form-item :label="$t('config.system.email.smtpPort')" prop="email_port">
        <el-input v-model.number="email.email_port" :disabled="email.email_enable == 'off'" id="system-email-email_smtp_port"></el-input>
      </el-form-item>
      <el-form-item :label="$t('config.system.ldap.timeout')" prop="email_timeout">
        <el-input v-model.number="email.email_timeout" >
          <template slot="append"><span >{{$t('alert.config.second')}}</span></template>
        </el-input>
      </el-form-item>
      <el-form-item :label="$t('config.system.email.smtpAccount')" prop="email_auth_account">
        <el-input  v-model="email.email_auth_account" :disabled="email.email_enable == 'off'" id="system-email-email_smtp_account"> autocomplete="off"</el-input>
      </el-form-item>
      <el-form-item :label="$t('config.system.email.smtpPin')" class="has-tip" prop="email_auth_password">
        <el-input v-model="email.email_auth_password" type="password" auto-complete="new-password"  :show-password="false" :disabled="email.email_enable == 'off'"  autocomplete="off" id="system-email-email_smtp_password"></el-input>
        <div class="el-form-item__tip">{{$t("config.system.email.pinTip")}}</div>
      </el-form-item>
      <el-form-item :label="$t('config.system.email.sendAccount')" class="has-tip" prop="email_send_account">
        <el-input v-model="email.email_send_account" :disabled="email.email_enable == 'off'" id="system-email-email_send_account"></el-input>
        <div class="el-form-item__tip">{{$t("config.system.email.sendAccountTip")}}</div>
      </el-form-item>
      <el-form-item :label="$t('config.system.email.testAccount')" class="has-tip" prop="email_test_reciver">
        <el-input v-model="email.email_test_account" :disabled="email.email_enable == 'off'" id="system-email-email_test_reciver"></el-input>
        <div class="el-form-item__tip">{{$t("config.system.email.testAccountTip")}}</div>
      </el-form-item>
      <el-form-item :label="$t('config.system.email.securityType')" prop="email_security_type">
        <el-select v-model="email.email_security_type" :disabled="email.email_enable == 'off'" popper-class="right-box-select-top right-public-box-dropdown-top">
          <el-option label="None" value="NONE"></el-option>
          <el-option label="SSL" value="SSL"></el-option>
          <el-option label="TLS" value="TLS"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item style="padding-top: 20px;">
        <!--              <button id="system-email-reset" @click="resetForm('emailForm','email')" class="nz-btn nz-btn-size-normal-new nz-btn-style-light" type="button">{{$t('overall.reset')}}</button>-->
        <button id="system-email-test" :class="{'nz-btn-disabled':email.email_enable == 'off','nz-btn-disabled':prevent_opt.save}" :disabled="email.email_enable == 'off' || prevent_opt.save" @click="testSetInfo('email','emailForm')" class="nz-btn nz-btn-size-normal nz-btn-style-light" type="button">{{$t('config.system.email.testConnection')}}</button>
        <button id="system-email-save" v-has="'system_email_edit'" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="nz-btn nz-btn-size-normal nz-btn-style-normal" type="button" @click="saveSetInfo('email','emailForm')">{{$t('overall.save')}}</button>
      </el-form-item>
    </el-form>
  </div>
  </div>
</template>

<script>
import systemMixin from '../../common/mixin/system/systemMixin'
import routerPathParams from '../../common/mixin/routerPathParams'
import { hostPlus, port } from '../../common/js/validate'

export default {
  name: 'email',
  mixins: [systemMixin, routerPathParams],
  data () {
    return {
      switchTab: 'email',
      email: {
        email_enable: 'on',
        email_host: '',
        email_port: 25,
        email_timeout: 10,
        email_auth_account: '',
        email_auth_password: '',
        email_send_account: '',
        email_test_account: '',
        email_security_type: 'NONE'
      },
      emailCopy: null,
      emailRules: {
        email_host: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: hostPlus, trigger: 'blur' }
        ],
        email_port: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: port, trigger: 'blur' }
        ],
        email_auth_account: [
          // { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { type: 'email', message: this.$t('validate.email'), trigger: 'blur' }
        ],
        email_send_account: [{ type: 'email', message: this.$t('validate.email'), trigger: 'blur' }],
        email_test_account: [{ type: 'email', message: this.$t('validate.email'), trigger: 'blur' }]
      }
    }
  },
  mounted () {
    this.querySetInfo(this.switchTab)
  },
  methods: {
    switchChange: function (formName) {
      const $temp = this
      $temp.$refs[formName].clearValidate()
      setTimeout(() => {
        $temp.$refs[formName].validate()
      }, 100)
    }
  }
}
</script>
