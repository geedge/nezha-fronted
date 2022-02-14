<template>
  <div class="system">
    <div class="system-config-form basicForm">
      <el-form :model="basic"  label-width="180px" size="small" ref="basicForm" :rules="basicRules" :validate-on-rule-change="false">
        <div class="system-title">{{$t('config.system.basic.title')}}</div>
        <el-form-item :label="$t('config.system.basic.language')" prop="language">
          <el-select id="account-input-language"
                     class="right-box__select"
                     v-model="basic.language"
                     popper-class="right-box-select-top right-public-box-dropdown-top prevent-clickoutside"
                     size="small">
            <template v-for="item in languageList">f
              <el-option :key="item.value" :label="item.label" :value="item.value"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.timezone')" prop="timezone">
          <el-select v-model="basic.timezone" id="system-basic-timezone" filterable popper-class="right-box-select-top right-public-box-dropdown-top">
            <el-option v-for="(item,index) in timezoneOption" :key="index" :label="item.name" :value="item.name" >
              <div style="display: flex;justify-content: space-between;">
                <div >{{item.name}}</div>
                <div class="utc-item">{{timezoneOptionHandler(item.offset)}}</div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.defTheme')" prop="defTheme">
          <el-select id="account-input-language"
                     class="right-box__select"
                     v-model="basic.theme"
                     popper-class="right-box-select-top right-public-box-dropdown-top prevent-clickoutside"
                     size="small">
            <template v-for="item in themeList">
              <el-option :key="item.value" :label="item.label" :value="item.value"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.dataFormat')" prop="dataFormat">
          <el-select id="account-input-language"
                     class="right-box__select"
                     v-model="basic.date_format"
                     popper-class="right-box-select-top right-public-box-dropdown-top prevent-clickoutside"
                     size="small">
            <template v-for="item in dateFormatList">
              <el-option :key="item.value" :label="item.label" :value="item.value">
                <div style="display: flex;justify-content: space-between;">
                  <div >{{item.value}}</div>
                  <div class="utc-item">{{item.time}}</div>
                </div>
              </el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.mapConfig')" class="basic-lnglat" prop="lnglat">
          <div style="display: flex">
            <el-input v-model="basic.lnglat" maxlength="256" placeholder="" style="width: calc(100% - 50px); padding-right: 50px;">
              <template slot="prepend">{{$t('config.system.basic.lnglat')}}</template>
            </el-input>
            <latlng-picker ref="latlngPicker" :init-data="basic.lnglat" :show-zoom="true" @lnglatChange="lnglatChange"></latlng-picker>
          </div>
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.sessionTimeout')" prop="session_timeout">
          <el-input v-model.number="basic.session_timeout" >
            <template slot="append"><span >{{$t('config.system.basic.minute')}}</span></template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.snmpTrapPort')" prop="snmp_trap_listen_port">
          <el-input v-model="basic.snmp_trap_listen_port"   id="system-baisc-snmp_trap_listen_port"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.defaultCabinetUsize')" prop="default_cabinet_usize">
          <el-input v-model.number="basic.default_cabinet_usize" id="system-baisc-default_cabinet_usize"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.unsaved')" prop="unsaved_change">
          <el-switch v-model="basic.unsaved_change" active-value='on' inactive-value='off' id="system-baisc-unsaved_change">
          </el-switch>
        </el-form-item>
        <div class="system-title">{{$t('config.system.basic.pinPolicy')}}</div>
        <el-form-item :label="$t('config.system.basic.gloEnable')" prop="mfa_auth_enable">
          <el-switch v-model="basic.mfa_auth_enable" :active-value='"1"' :inactive-value='"0"' id="system-basic-mfs_change">
          </el-switch>
          <!--              <div class="el-form-item__tip">{{$t('config.system.basic.TwoFactorAuthentication')}}</div>-->
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.enable')" prop="enable">
          <el-switch v-model="basic.pin_policy.enable" :active-value='1' :inactive-value='0' id="system-basic-enable">
          </el-switch>
          <div class="el-form-item__tip" style="margin: 0">{{$t('config.system.basic.pinPolicyValue')}}</div>
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.length')" prop="length">
          <el-input v-model.number="basic.pin_policy.length" id="system-basic-length"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.passContain')" prop="">
          <el-checkbox v-model="basic.pin_policy.num" :true-label="1" :false-label="0" checked>{{$t('config.system.basic.num')}}</el-checkbox>
          <el-checkbox v-model="basic.pin_policy.lower" :true-label="1" :false-label="0" checked>{{$t('config.system.basic.lower')}}</el-checkbox>
          <el-checkbox v-model="basic.pin_policy.upper" :true-label="1" :false-label="0" checked>{{$t('config.system.basic.upper')}}</el-checkbox>
          <el-checkbox v-model="basic.pin_policy.spec" :true-label="1" :false-label="0" checked>{{$t('config.system.basic.spec')}}</el-checkbox>
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.passPeriod')" prop="valid" style="padding-bottom: 15px">
          <el-input v-model.number="basic.pin_policy.valid" id="system-basic-pass">
            <template slot="append"><span >{{$t('config.system.basic.day')}}</span></template>
          </el-input>
          <div class="el-form-item__tip">{{$t('config.system.basic.passPeriodValue')}}</div>
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.retry')" class="half-form-witch" prop="retry" style="padding-bottom: 15px">
          <el-input v-model.number="basic.pin_policy.retry" id="system-basic-retry"></el-input>
          <div class="el-form-item__tip" style="width: 512px;">{{$t('config.system.basic.retryValue')}}</div>
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.lockTime')" class="half-form-left" prop="lockTime">
          <el-input v-model.number="basic.pin_policy.lockTime" id="system-basic-lock-time">
            <template slot="append"><span >{{$t('config.system.basic.minute')}}</span></template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <button id="system-basic-save" v-has="'system_basic_edit'" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="nz-btn nz-btn-size-normal nz-btn-style-normal" style="margin-top: 8px;"  type="button" @click="saveSetInfo('basic','basicForm')">{{$t('overall.submit')}}</button>
        </el-form-item>
      </el-form>
    </div >
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import latlngPicker from '@/components/common/latlngPicker'
import notifyMethod from '@/components/page/config/system/notifyMethodTab'
import linkTab from '@/components/page/config/system/linkTab'
import apiKeyTab from '@/components/page/config/system/apiKeyTab'
import License from '@/components/page/config/system/license'
import { latlng, port, positiveInteger, uSize } from '@/components/common/js/validate'
import moment from 'moment-timezone'
import bus from "@/libs/bus";

export default {
  name: 'basic',
  components: { draggable, latlngPicker, notifyMethod, linkTab, apiKeyTab, License },
  data () {
    return {
      switchTab: 'basic',
      basic: {
        // alert_api: '',
        asset_ping_interval: '300', // 检查周期，单位：s
        language: 'en',
        session_timeout: '30',
        storage_local_retention: 15 * 24,
        system_name: '',
        system_logo: '',
        current_site_url: '',
        timezone: '',
        date_format: 'YYYY-MM-DD HH:mm:ss',
        theme: 'Light',
        default_cabinet_usize: '',
        query_max_series: '',
        unsaved_change: 'on',
        default_scrape_interval: '60',
        default_scrape_timeout: '30',
        snmp_trap_listen_port: 162,
        lnglat: '',
        map_center_config: { longitude: 116.39, latitude: 39.9, zoom: 4, minZoom: 1, maxZoom: 10 },
        pin_policy: {}
      },
      basicCopy: null,
      basicRules: {
        system_name: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        language: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        // alert_api: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: host, trigger: 'blur' }],
        asset_ping_interval: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        default_scrape_interval: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        session_timeout: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        default_scrape_timeout: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        storage_local_retention: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        snmp_trap_listen_port: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: port, trigger: 'blur' }],
        timezone: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        default_cabinet_usize: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }, { validator: uSize, trigger: 'blur' }],
        query_max_series: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        lnglat: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: latlng, trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    this.querySetInfo(this.switchTab)
    this.queryTimezone()
    this.dateFormatTimer()
  },
  methods: {
    lnglatChange (lnglat, zoom) {
      const lnglatData = lnglat.split('.')
      this.basic.map_center_config.longitude = lnglatData[0]
      this.basic.map_center_config.latitude = lnglatData[1]
      this.basic.map_center_config.zoom = zoom
      this.basic.lnglat = lnglat
    },
    queryTimezone: function () {
      this.$get('/sys/timezone').then(response => {
        if (response.code == 200) {
          this.timezoneOption = response.data.list
        }
      })
    },
    querySetInfo: function (type) { // 切换tab
      if (!type) {
        console.error('type is required')
        return
      }
      if (type !== 'link' && type !== 'notification' && type !== 'apiKey') {
        const t = +new Date()
        this.updatePath({ t })
      }
      if (type == 'reset' || type == 'link' || type == 'notification' || type == 'apiKey' || type == 'license') {
        return
      }
      this.$get('/sys/config/' + type).then(response => {
        if (response.code == 200) {
          for (const key in response.data) {
            this[type][key] = response.data[key]
          }
          if (type == 'basic') {
            localStorage.setItem('nz-sys-name', this.basic.system_name)
            localStorage.setItem('nz-sys-timezone', this.basic.timezone)
            localStorage.setItem('nz-sys-logo', this.basic.system_logo)
            localStorage.setItem('nz-sys-default-cabinet-usize', this.basic.default_cabinet_usize)
            localStorage.setItem('nz-unsaved-change', this.basic.unsaved_change)
            this.basic.map_center_config = JSON.parse(this.basic.map_center_config)
            this.basic.pin_policy = JSON.parse(this.basic.pin_policy)
            this.basic.lnglat = `${this.basic.map_center_config.longitude},${this.basic.map_center_config.latitude}`
          } else if (type == 'terminal') {
            localStorage.setItem('nz-sys-terminal-timeout', this.terminal.terminal_timeout)
            localStorage.setItem('nz-sys-terminal-telnet-user-tip', this.terminal.terminal_telnet_user_tip)
            localStorage.setItem('nz-sys-terminal-telnet-pin-tip', this.terminal.terminal_telnet_pin_tip)
            localStorage.setItem('nz-sys-terminal-record-local-retention', this.terminal.terminal_record_local_retention)
          }
          if (type == 'email') {
            this.email.email_auth_password = ''
            this.$refs.emailForm.clearValidate()
          }
          if (type == 'monitor') {

          }
          this[type + 'Copy'] = Object.assign({}, this[type])
        }
      })
    },
    saveSetInfo: function (type, formName) {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const param = Object.assign({}, this[type])
          if (type == 'basic') {
            const mapConfig = this.$refs.latlngPicker.getAttribute()
            param.map_center_config = JSON.stringify(mapConfig)
            param.pin_policy = JSON.stringify(this.basic.pin_policy)
          }
          const postParam = Object.assign({}, param)
          for (const key in postParam[type]) {
            postParam[type][key] = postParam[type][key] + ''
          }
          this.$put('/sys/config/' + type, postParam).then(response => {
            this.prevent_opt.save = false
            if (response.code == 200) {
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
              // this.resetForm(formName);
              if (type == 'basic') {
                localStorage.setItem('nz-sys-timezone', param.timezone)
                localStorage.setItem('timezoneOffset', moment.tz(param.timezone).format('Z'))
                localStorage.setItem('nz-default-dateFormat', param.date_format)
              }
              this.dateFormatTimer()
              setTimeout(() => {
                this.querySetInfo(type)
              }, 200)
            } else {
              this.$message.error(response.msg)
            }
          })
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    },
    dateFormatTimer () {
      const date = new Date()
      const milli = date.getTime()
      this.dateFormatList.map(e => {
        if (e.label === 'DD/MM/YYYY HH:mm:ss') {
          e.time = bus.timeFormate(bus.computeTimezone(milli), e.label)
        } else if (e.label === 'MM/DD/YYYY HH:mm:ss') {
          e.time = bus.timeFormate(bus.computeTimezone(milli), e.label)
        } else {
          e.time = bus.timeFormate(bus.computeTimezone(milli), e.label)
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
