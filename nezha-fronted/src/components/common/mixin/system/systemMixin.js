import moment from 'moment-timezone'
import bus from '@/libs/bus'
import { hostPlus, latlng, port, positiveInteger, uSize } from '@/components/common/js/validate'
import routerPathParams from '@/components/common/mixin/routerPathParams'

export default {
  // mixins: [routerPathParams],
  data () {
    return {
      imageFormatErr: false,
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
      monitor: {
        // alert_api: '',
        asset_ping_from: '',
        asset_ping_interval: '',
        default_scrape_interval: '',
        default_scrape_timeout: '',
        logs_query_range_default_limit: '',
        logs_storage_retention: '',
        logs_storage_s3_access_key: '',
        logs_storage_s3_bucket: '',
        logs_storage_s3_endpoint: '',
        logs_storage_s3_secret_access_key: '',
        logs_storage_type: '',
        metrics_query_max_series: '',
        metrics_storage_retention: '',
        metrics_storage_s3_access_key: '',
        metrics_storage_s3_bucket: '',
        metrics_storage_s3_endpoint: '',
        metrics_storage_s3_secret_access_key: '',
        metrics_storage_type: '',
        prometheus_federation_enabled: ''
      },
      monitorRules: {
        // alert_api: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        asset_ping_from: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        asset_ping_interval: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        default_scrape_interval: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        default_scrape_timeout: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        logs_query_range_default_limit: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        logs_storage_retention: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        logs_storage_type: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        metrics_query_max_series: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        metrics_storage_retention: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        metrics_storage_type: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        prometheus_federation_enabled: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]
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
      },
      terminal: {
        terminal_timeout: 30,
        terminal_telnet_user_tip: 'ogin:',
        terminal_telnet_pin_tip: 'assword:',
        terminal_record_local_retention: 365
      },
      terminalCopy: null,
      terminalRules: {
        terminal_timeout: [{ validator: positiveInteger, trigger: 'blur' }],
        terminal_record_local_retention: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }]
      },
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
      },
      reset: {
        type: [],
        pin: ''
      },
      linkTemp: {
        name: '', url: ''
      },
      link: [],
      linkReserved: [],
      linkRules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { max: 64, message: this.$t('config.system.link.nameMaxLength'), trigger: 'blur' }
        ],
        url: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          // { type: 'url', message: this.$t('config.system.link.uriRequired'), trigger: 'blur' } /*检验网址是否正确*/
        ]
      },
      notificationRules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { max: 64, message: this.$t('config.system.link.nameMaxLength'), trigger: 'blur' }
        ],
        filePath: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { pattern: /^\/(.*\.*.+\/?)+$/, message: this.$t('config.system.notification.filePathReg') }
          // { type: 'url', message: this.$t('config.system.link.uriRequired'), trigger: 'blur' } /*检验网址是否正确*/
        ]
      },
      resetRules: {
        type: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        pin: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]
      },
      resetOptions: [
        {
          label: this.$t('overall.metric'),
          value: 'metric'
        },
        {
          label: this.$t('overall.alert'),
          value: 'alert'
        },
        {
          label: this.$t('config.system.reset.sysConfig'),
          value: 'sysconfig'
        }
      ],
      switchTab: 'basic',
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
      ],
      basicTimer: 0
    }
  },
  methods: {
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
            this.$store.commit('setTimeFormatMain', this.basic.date_format)
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
            localStorage.setItem('nz-prometheus-federation-enabled', this.monitor.prometheus_federation_enabled)
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
                this.$store.commit('setTimeFormatMain', param.date_format)
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
      this.dateFormatList.forEach(e => {
        if (e.label === 'DD/MM/YYYY HH:mm:ss') {
          e.time = bus.timeFormate(bus.computeTimezone(milli), e.label)
        } else if (e.label === 'MM/DD/YYYY HH:mm:ss') {
          e.time = bus.timeFormate(bus.computeTimezone(milli), e.label)
        } else {
          e.time = bus.timeFormate(bus.computeTimezone(milli), e.label)
        }
      })
    },
    testSetInfo: function (type, formName) {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const param = Object.assign({}, this[type])

          param[type + '_test'] = true
          const postParam = Object.assign({}, param)
          this.$put('/sys/config/' + type, postParam).then(response => {
            this.prevent_opt.save = false
            if (response.code == 200) {
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.testSuccess') })
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
    jumpTo (data, id) {
      bus.$emit('menu-change', data)
      this.$router.push({
        path: '/' + data,
        query: {
          t: +new Date()
        }
      })
    },
    switchChange: function (formName) {
      const $temp = this
      $temp.$refs[formName].clearValidate()
      setTimeout(() => {
        $temp.$refs[formName].validate()
      }, 100)
    },
    resetForm (formName, type) {
      this.$refs[formName].resetFields()
      this[type] = Object.assign({}, this[type + 'Copy'])
    },
    selectTab: function (tab) {
      this.querySetInfo(tab.name)
    },
    lnglatChange (lnglat, zoom) {
      const lnglatData = lnglat.split('.')
      this.basic.map_center_config.longitude = lnglatData[0]
      this.basic.map_center_config.latitude = lnglatData[1]
      this.basic.map_center_config.zoom = zoom
      this.basic.lnglat = lnglat
    },
    // link 移动
    change: function (evt) {
      // console.log(evt)
    },
    // start ,end ,add,update, sort, remove 得到的都差不多
    start: function (evt) {
      // console.log(evt)
    },
    notificationEnd: function (evt) {
      const length = this.notification.length
      if (evt.newIndex == evt.oldIndex) { // 如果没有移动返回
        return
      }
      const parmas = {
        id: this.notification[evt.newIndex].id,
        prev: 0,
        next: -1
      }
      if (evt.newIndex == length - 1) {
        parmas.prev = this.notification[evt.newIndex - 1].id
      } else if (evt.newIndex == 0) {
        parmas.next = this.notification[evt.newIndex + 1].id
      } else {
        parmas.prev = this.notification[evt.newIndex - 1].id
        parmas.next = this.notification[evt.newIndex + 1].id
      }
      this.$put('/alert/script/modify', parmas).then((response) => {
        // this.$store.commit('setLinkData',this.link);
      })
    },
    end: function (evt) {
      const length = this.link.length
      if (evt.newIndex == evt.oldIndex) { // 如果没有移动返回
        return
      }
      const parmas = {
        id: this.link[evt.newIndex].id,
        prev: 0,
        next: -1
      }
      if (evt.newIndex == length - 1) {
        parmas.prev = this.link[evt.newIndex - 1].id
      } else if (evt.newIndex == 0) {
        parmas.next = this.link[evt.newIndex + 1].id
      } else {
        parmas.prev = this.link[evt.newIndex - 1].id
        parmas.next = this.link[evt.newIndex + 1].id
      }
      this.$put('/link/modify', parmas).then((response) => {
        this.$store.commit('setLinkData', this.link)
      })
    },
    handleLogoChange (file, fileList) {
      const imageTypes = ['image/jpeg', 'image/jpg', 'image/png']
      const isImage = imageTypes.some(t => file.raw.type === t)
      const isLt2M = file.raw.size / 1024 / 1024 < 2

      this.imageFormatErr = (!isImage || !isLt2M)

      if (isImage && isLt2M) {
        const self = this
        this.fileToBase64(file.raw).then(res => {
          self.basic.system_logo = res
        })
      }
    },
    fileToBase64: function (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)// 转化二进制流，异步方法
        let base64Str = ''
        reader.onload = function () { // 完成后this.result为二进制流;
          base64Str = this.result
          resolve(base64Str)
        }
      })
    },
    timezoneOptionHandler: function (offset) {
      const offsetHour = (offset / 1000 / 60 / 60).toFixed(0)

      const offsetMinute = offset % (1000 * 60 * 60) / (1000 * 60)

      const hour = offsetHour > 0 ? (offsetHour < 9 ? '+0' + offsetHour : '+' + offsetHour) : (offsetHour == 0 ? (offsetMinute == 0 ? '' : '+00') : (offsetHour > -10 ? '-0' + Math.abs(offsetHour) : offsetHour))

      const minute = offsetHour == 0 && offsetMinute == 0 ? '' : (offsetMinute == 0 ? ':00' : (Math.abs(offsetMinute) > 9 ? ':' + Math.abs(offsetMinute) : ':0' + Math.abs(offsetMinute)))
      return 'UTC' + hour + minute
    },
    resetSys () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      const resetParams = {
        type: this.reset.type,
        pin: this.reset.pin
      }
      if (resetParams.type && resetParams.pin) {
        this.$confirm(this.$t('tip.resetPrompt'), {
          confirmButtonText: this.$t('tip.yes'),
          cancelButtonText: this.$t('tip.no'),
          type: 'warning'
        }).then(() => {
          this.$put('/sys/config/reset', resetParams).then(response => {
            if (response.code == 200) {
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.resetSuccess') })
              this.reset.type = ''
              this.reset.pin = ''
            } else {
              this.$message.error(response.msg)
            }
            this.prevent_opt.save = false
          })
        })
      } else {
        this.prevent_opt.save = false
        return false
      }
    }
  }
}
