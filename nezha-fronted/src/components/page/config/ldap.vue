<template>
  <div class="system">
    <div class="system-config-form">
      <div class="system-title">{{$t('overall.basicInfo')}}</div>
      <el-form :model="ldap"  label-width="180px" size="small" ref="ldapForm" :rules="ldap.ldap_enable == 'on'?ldapRules:{}" :validate-on-rule-change="false">
        <el-form-item :label="$t('config.system.ldap.active')" prop="ldap_enable">
          <el-checkbox v-model="ldap.ldap_enable" true-label='on' false-label='off' @change="switchChange('ldapForm')" id="system-ldap-ldap_enable"></el-checkbox>
        </el-form-item>
        <el-form-item :label="$t('config.system.ldap.address')" prop="ldap_address">
          <el-input v-model="ldap.ldap_address" id="system-ldap-ldap_address"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.system.ldap.dn')" prop="ldap_dn">
          <el-input v-model="ldap.ldap_dn" id="system-ldap-ldap_dn"></el-input>
        </el-form-item>
        <el-form-item :label="$t('login.pin')" prop="ldap_password">
          <el-input id="system-ldap-ldap_password" v-model="ldap.ldap_password" type="password"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.system.ldap.ou')" class="has-tip" prop="ldap_ou">
          <el-input v-model="ldap.ldap_ou" id="system-ldap-ldap_ou"></el-input>
          <div class="el-form-item__tip">{{$t("config.system.ldap.ouTip")}}</div>
        </el-form-item>
        <el-form-item :label="$t('config.system.ldap.filter')" class="has-tip" prop="ldap_user_filter">
          <el-input v-model="ldap.ldap_user_filter" id="system-ldap-ldap_user_filter"></el-input>
          <div class="el-form-item__tip">{{$t("config.system.ldap.filterTip")}}</div>
        </el-form-item>
        <el-form-item :label="$t('config.system.ldap.map')" class="has-tip--two-row" prop="ldap_mapping">
          <el-input v-model="ldap.ldap_mapping" id="system-ldap-ldap_mapping"></el-input>
          <!--借用错误提示的样式-->
          <div class="el-form-item__tip el-form-item__tip--two-row">{{$t("config.system.ldap.mapTip")}}</div>
        </el-form-item>
        <el-form-item :label="$t('config.system.ldap.timeout')" prop="ldap_timeout">
          <el-input v-model.number="ldap.ldap_timeout" >
            <template slot="append"><span >{{$t('alert.config.second')}}</span></template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <!--              <button id='system-ldap-reset' @click="resetForm('ldapForm','ldap')" class="nz-btn nz-btn-size-normal-new nz-btn-style-light" type="button">{{$t('overall.reset')}}</button>-->
          <button id='system-ldap-test' :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="nz-btn nz-btn-size-normal nz-btn-style-light" type="button" @click="testSetInfo('ldap','ldapForm')">{{$t('config.system.email.testConnection')}}</button>
          <button id='system-ldap-save' v-has="'system_ldap_edit'" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="nz-btn nz-btn-size-normal nz-btn-style-normal" type="button" @click="saveSetInfo('ldap','ldapForm')">{{$t('overall.save')}}</button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { positiveInteger } from '../../common/js/validate'
import systemMixin from '../../common/mixin/system/systemMixin'
import routerPathParams from '../../common/mixin/routerPathParams'

export default {
  name: 'ldap',
  mixins: [systemMixin, routerPathParams],
  data () {
    return {
      switchTab: 'ldap',
      ldap: {
        ldap_address: '',
        ldap_dn: '',
        ldap_password: '',
        ldap_ou: '',
        ldap_user_filter: '',
        ldap_mapping: '',
        ldap_enable: 'off',
        ldap_timeout: ''
      },
      ldapCopy: null,
      ldapRules: {
        ldap_address: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        ldap_user_filter: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        ldap_mapping: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        ldap_timeout: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }]
      }
    }
  },
  mounted () {
    this.querySetInfo(this.switchTab)
  }
}
</script>
