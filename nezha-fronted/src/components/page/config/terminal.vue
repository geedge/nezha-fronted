<template>
  <div class="system">
    <div class="system-config-form terminal">
      <div class="system-title">{{$t('overall.basicInfo')}}</div>
      <el-form :model="terminal"  label-width="180px" size="small" ref="terminalForm" :rules="terminalRules">
        <!--            <el-form-item :label="$t('config.system.ldap.timeout')" prop="terminal_timeout">-->
        <!--              <el-input v-model="terminal.terminal_timeout" controls-position="right" :min="1"  id="system-terminal-max_terminal_num">-->
        <!--                <template slot="append"><span >{{$t('alert.config.second')}}</span></template>-->
        <!--              </el-input>-->
        <!--            </el-form-item>-->
        <el-form-item :label="$t('config.system.terminal.userTip')" prop="terminal_telnet_user_tip">
          <el-input id="system-terminal-user-tip" v-model="terminal.terminal_telnet_user_tip"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.system.terminal.pinTip')" prop="terminal_telnet_pin_tip">
          <el-input id="system-terminal_telnet_pin_tip" v-model="terminal.terminal_telnet_pin_tip"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.system.terminal.localRetention')" prop="terminal_record_local_retention">
          <el-input v-model="terminal.terminal_record_local_retention" controls-position="right" :min="1"  id="system-terminal_record_local_retention">
            <template slot="append"><span >{{$t('config.system.basic.day')}}</span></template>
          </el-input>
        </el-form-item>
         <el-form-item :label="$t('config.system.monitor.metrics_storage_type')" prop="terminal_storage_type">
          <el-select v-model="terminal.terminal_storage_type" popper-class="right-box-select-top right-public-box-dropdown-top">
            <el-option :label="$t('config.system.monitor.local')" value="1"></el-option>
            <el-option :label="$t('config.system.monitor.s3')" value="2"></el-option>
          </el-select>
        </el-form-item>
        <transition name="el-zoom-in-top">
          <div v-show="terminal.terminal_storage_type == 2">
            <el-form-item :label="$t('asset.endpoint')" prop="terminal_storage_s3_endpoint" :rules=" [ { required: terminal.terminal_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]">
              <el-input v-model="terminal.terminal_storage_s3_endpoint" id="terminal-terminal_storage_s3_endpoint">
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.monitor.metrics_storage_s3_bucket')" prop="terminal_storage_s3_bucket" :rules=" [ { required: terminal.terminal_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]">
              <el-input v-model="terminal.terminal_storage_s3_bucket" id="terminal-terminal_storage_s3_bucket">
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.monitor.metrics_storage_s3_access_key')" prop="terminal_storage_s3_access_key" :rules=" [ { required: terminal.terminal_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]">
              <el-input v-model="terminal.terminal_storage_s3_access_key" id="terminal-terminal_storage_s3_access_key">
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.terminallog.key')" prop="terminal_storage_s3_secret_access_key" :rules=" [ { required: terminal.terminal_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]" class="monitorLastEle">
              <el-input v-model="terminal.terminal_storage_s3_secret_access_key" id="terminal-terminal_storage_s3_secret_access_key" type="password">
              </el-input>
            </el-form-item>
          </div>
        </transition>
         <el-form-item>
          <button v-has="'system_terminal_edit'" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="nz-btn nz-btn-size-normal nz-btn-style-normal" type="button" @click="saveSetInfo('terminal','terminalForm')">{{$t('overall.save')}}</button>
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
  name: 'terminal',
  mixins: [systemMixin, routerPathParams],
  data () {
    return {
      switchTab: 'terminal',
      terminal: {
        terminal_timeout: 30,
        terminal_telnet_user_tip: 'ogin:',
        terminal_telnet_pin_tip: 'assword:',
        terminal_record_local_retention: 365,
        terminal_storage_type: '',
        terminal_storage_s3_endpoint: '',
        terminal_storage_s3_bucket: '',
        terminal_storage_s3_access_key: '',
        terminal_storage_s3_secret_access_key: ''
      },
      terminalCopy: null,
      terminalRules: {
        terminal_timeout: [{ validator: positiveInteger, trigger: 'blur' }],
        terminal_record_local_retention: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        terminal_storage_type: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]
      }
    }
  },
  mounted () {
    this.querySetInfo(this.switchTab)
  }
}
</script>
