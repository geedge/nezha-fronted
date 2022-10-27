<template>
  <div class="system">
    <div class="system-config-form basicForm">
      <el-form :model="basic"  label-width="180px" size="small" ref="basicForm" :rules="basicRules" :validate-on-rule-change="false">
        <div class="system-title">{{$t('overall.basicInfo')}}</div>
        <el-form-item :label="$t('config.system.basic.systemName')" prop="system_name">
          <el-input v-model="basic.system_name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.language')" prop="language">
          <el-select id="account-input-language"
                     class="right-box__select"
                     v-model="basic.language"
                     :placeholder="$t('overall.select')"
                     popper-class="right-box-select-top right-public-box-dropdown-top prevent-clickoutside"
                     size="small">
            <template v-for="item in languageList">
              <el-option :key="item.value" :label="item.label" :value="item.value"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.timezone')" prop="timezone">
          <el-select v-model="basic.timezone" id="system-basic-timezone" :placeholder="$t('overall.select')" filterable popper-class="right-box-select-top right-public-box-dropdown-top">
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
                     :placeholder="$t('overall.select')"
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
                     :placeholder="$t('overall.select')"
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
        <div class="system-title system-title-border">{{$t('config.system.basic.pinPolicy')}}</div>
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
        <el-form-item :label="$t('config.system.basic.length')" prop="length" id="system-basic">
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
          <button id="system-basic-save" v-has="'system_basic_edit'" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="nz-btn nz-btn-size-normal nz-btn-style-normal" style="margin-top: 8px;"  type="button" @click="saveSetInfo('basic','basicForm')">{{$t('overall.save')}}</button>
        </el-form-item>
      </el-form>
    </div >
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import latlngPicker from '@/components/common/latlngPicker'
import { latlng, port, positiveInteger, uSize } from '@/components/common/js/validate'
import systemMixin from '@/components/common/mixin/system/systemMixin'
import routerPathParams from '@/components/common/mixin/routerPathParams'

export default {
  name: 'basic',
  mixins: [systemMixin, routerPathParams],
  components: { draggable, latlngPicker },
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
      },
      timezoneOption: [],
      languageList: [
        { value: 'en', label: 'English' },
        { value: 'zh', label: '简体中文' }
      ],
      themeList: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' }
      ],
      dateFormatList: [
        { value: 'DD/MM/YYYY HH:mm:ss', label: 'DD/MM/YYYY HH:mm:ss', time: '' },
        { value: 'MM/DD/YYYY HH:mm:ss', label: 'MM/DD/YYYY HH:mm:ss', time: '' },
        { value: 'YYYY-MM-DD HH:mm:ss', label: 'YYYY-MM-DD HH:mm:ss', time: '' }
      ]
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
    timezoneOptionHandler: function (offset) {
      const offsetHour = Math.floor((offset / 1000 / 60 / 60))

      const offsetMinute = offset % (1000 * 60 * 60) / (1000 * 60)

      const hour = offsetHour > 0 ? (offsetHour < 9 ? '+0' + offsetHour : '+' + offsetHour) : (offsetHour == 0 ? (offsetMinute == 0 ? '' : '+00') : (offsetHour > -10 ? '-0' + Math.abs(offsetHour) : offsetHour))

      const minute = offsetHour == 0 && offsetMinute == 0 ? '' : (offsetMinute == 0 ? ':00' : (Math.abs(offsetMinute) > 9 ? ':' + Math.abs(offsetMinute) : ':0' + Math.abs(offsetMinute)))
      return 'UTC' + hour + minute
    }
  }
}
</script>

<style scoped>

</style>
