import moment from 'moment-timezone'
import bus from '@/libs/bus'

export default {
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
