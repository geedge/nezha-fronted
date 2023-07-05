<template>
  <div class="setup">
    <div class="logo-header">
      <img height="30px" style="vertical-align: bottom; margin-top: 10px" :src="imgUrl"/>
      <span class="logo-header-text">One-stop monitoring system</span>
      <div class="language-select">
      <el-dropdown :hide-on-click="false" >
        <span class="el-dropdown-link">
          <i class="nz-icon nz-icon-language-change" style="color: #e6eaed; font-size: 14px"></i>
        </span>
        <el-dropdown-menu slot="dropdown" >
          <el-dropdown-item>
            <div :style="language == 'en' ? 'color:#f90' : ''" @click="changeLocal('en')" id="header-to-english">
              <i class="nz-icon nz-icon-lang-en"></i>
              English
            </div>
          </el-dropdown-item>
          <el-dropdown-item>
            <div :style="language == 'cn' ? 'color:#f90' : ''" @click="changeLocal('cn')" id="header-to-chinese">
              <i class="nz-icon nz-icon-lang-zh"></i>
              中文
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      </div>
    </div>
    <div style="display: flex" class="flex-box">
      <div class="step-box">
        <div class="step-inner">
          <el-steps direction="vertical" space=0 :active="step" finish-status="success">
            <el-step :title="$t('setup.step0')" ></el-step>
            <el-step :title="$t('setup.step1')" ></el-step>
            <el-step :title="$t('setup.step2')"></el-step>
            <el-step :title="$t('overall.system')" ></el-step>
          </el-steps>
        </div>
      </div>
      <div class="setup-box">
        <div class="setup-inner" >
          <template v-if="activeStep == 0">
            <div class="welcome">
              <div class="wel-header">
                <!--Welcome to Nezha setup wizard!-->
                {{ $t("setup.welcome.header") }}
              </div>
              <div class="content-divider" />
              <div class="wel-wizard">
                <div class="wizard-header">
                  <!--What will the wizard do for you?-->{{
                    $t("setup.welcome.guid")
                  }}
                </div>
                <ul>
                  <li>
                    <!--Create a basic, single site configuration-->{{
                      $t("setup.welcome.guid_1")
                    }}
                  </li>
                  <li>
                    <!--Tries to find problems within your Database and Redis setup-->{{
                      $t("setup.welcome.guid_2")
                    }}
                  </li>
                </ul>
              </div>
              <div class="content-divider" />
              <div class="wel-continue">
                <div class="wizard-header">
                  <!--To continue-->{{ $t("setup.welcome.toContinue") }}:
                </div>
                <div>
                  <!--For security reasons you need to authenticate for the installation by creating the file-->{{
                    $t("setup.welcome.creatFile")
                  }}
                  '/opt/nezha/nz-web/tmp/nezha.auth'.<br /><!--This can be done by executing the following command-->{{
                    $t("setup.welcome.createFileTip")
                  }}:
                </div>
                <pre>echo -n {{ validateCode }} > /opt/nezha/nz-web/tmp/nezha.auth</pre>
                <div>
                  <!--Click the 'Next' button when you've finished.-->{{
                    $t("setup.welcome.next")
                  }}
                </div>
              </div>
            </div>
          </template>
          <template v-if="activeStep == 1">
            <div class="setup-config">
              <div class="form-scroll-wrap">
                <el-form ref="db-form" :model="database" label-width="80px" :rules="dbRules" label-position="top" size="small" style="width: 600px" :validate-on-rule-change="false">
                  <div class="setup-form-title">{{$t('setup.step1')}}</div>
                  <!-- mode -->
                  <el-form-item :label="$t('dashboard.mode')" prop="mode" key="dbMode">
                    <el-select v-model="database.mode" @change="databaseModeChange" :placeholder="$t('el.select.placeholder')" style="width: 100%">
                      <el-option :label="$t('setup.standalone')" value="standalone"></el-option>
                      <el-option :label="$t('setup.masterMaster')" value="Master-Master"></el-option>
                    </el-select>
                  </el-form-item>
                  <!-- url -->
                  <el-form-item label="URL" prop="url" :rules="{ required: true }" class="setup-urlWrap">
                    <el-form-item :prop="'urlItem'+index" :rules="[ { validator: validateUrl }]" class="url-item" v-for="(item,index) in database.url" :key="index">
                      <el-form-item :prop="'url.' + index + '.ip'" :rules="dbRules.ip" class="url-ip" key="dbIp">
                        <el-input v-model="item.ip" :placeholder="$t('setup.ipPlaceholder')" @blur="urlBlur('db-form',index)"></el-input>
                      </el-form-item>
                      <el-form-item :prop="'url.' + index + '.port'" :rules="dbRules.port" class="url-port" key="dbPort">
                        <el-input v-model="item.port" :placeholder="$t('setup.portPlaceholder')" @blur="urlBlur('db-form',index)"></el-input>
                      </el-form-item>
                    </el-form-item>
                  </el-form-item>
                  <!-- name -->
                  <el-form-item :label="$t('setup.name')" prop="name" key="dbName" >
                    <el-input v-model="database.name"></el-input>
                  </el-form-item>
                  <!-- username -->
                  <el-form-item :label="$t('profile.username')" prop="username" key="dbUsername" >
                    <el-input v-model="database.username" :placeholder="$t('setup.usernamePlaceholder')"></el-input>
                  </el-form-item>
                  <!-- pin -->
                  <el-form-item :label="$t('login.pin')" prop="pin" key="dbPin" >
                    <el-input v-model="database.pin" type="password" auto-complete="new-password" show-password :placeholder="$t('setup.passwordPlaceholder')"></el-input>
                  </el-form-item>
                </el-form>
              </div>
              <div class="setup-help">
                <div class="help-header">
                  {{ $t("setup.database.configTitle") }}
                </div>
                <div class="help-body">
                  {{ $t("setup.database.configTip") }}
                </div>
              </div>
            </div>
          </template>
          <template v-if="activeStep == 2">
            <div class="setup-config">
              <div class="form-scroll-wrap">
                <el-form ref="redis-form" :model="redis" label-width="80px" :rules="redisRules" label-position="top" size="small" style="width: 600px" :validate-on-rule-change="false">
                  <div class="setup-form-title">{{$t('setup.step2')}}</div>
                  <!-- mode -->
                  <el-form-item :label="$t('dashboard.mode')" prop="mode" key="rdMode">
                    <el-select v-model="redis.mode" @change="redisModeChange" :placeholder="$t('el.select.placeholder')" style="width: 100%">
                      <el-option :label="$t('setup.standalone')" value="standalone"></el-option>
                      <el-option :label="$t('setup.sentinel')" value="sentinel"></el-option>
                      <el-option :label="$t('setup.dms')" value="dms"></el-option>
                    </el-select>
                  </el-form-item>
                  <!-- url -->
                  <el-form-item label="URL" prop="url" :rules="{ required: true }" class="setup-urlWrap">
                    <el-form-item :prop="'urlItem'+index" :rules="[ { validator: validateUrl }]" class="url-item" v-for="(item,index) in redis.url" :key="index">
                      <el-form-item :prop="'url.' + index + '.ip'" :rules="redisRules.ip" class="url-ip" key="rdIp">
                        <el-input v-model="item.ip" :placeholder="$t('setup.ipPlaceholder')" @blur="urlBlur('redis-form',index)"></el-input>
                      </el-form-item>
                      <el-form-item :prop="'url.' + index + '.port'" :rules="redisRules.port" class="url-port" key="rdPort">
                        <el-input v-model="item.port" :placeholder="$t('setup.portPlaceholder')" @blur="urlBlur('redis-form',index)"></el-input>
                      </el-form-item>
                    </el-form-item >
                  </el-form-item>
                  <!-- masterName -->
                  <el-form-item :label="$t('setup.redis.masterName')" prop="masterName" key="rdMasterName" v-if="redis.mode==='sentinel'">
                    <el-input v-model="redis.masterName"></el-input>
                  </el-form-item>
                  <!-- database -->
                  <el-form-item :label="$t('setup.step1')" prop="database" key="rdDatabase">
                    <el-select v-model="redis.database" :placeholder="$t('el.select.placeholder')" style="width: 100%">
                      <el-option :label="index" :value="index" v-for="(item,index) in 16" :key="index"></el-option>
                    </el-select>
                  </el-form-item>
                  <!-- pin -->
                  <el-form-item :label="$t('login.pin')" prop="pin" key="rdPin" >
                    <el-input v-model="redis.pin" type="password" auto-complete="new-password" show-password :placeholder="$t('setup.passwordPlaceholder')"></el-input>
                  </el-form-item>
                </el-form>
              </div>
              <div class="setup-help">
                <div class="help-header">
                  {{ $t("setup.redis.configTitle") }}
                </div>
                <div class="help-body">
                  {{ $t("setup.redis.configTip") }}
                </div>
              </div>
            </div>
          </template>
          <template v-if="activeStep == 3">
            <div class="setup-config">
              <div class="form-scroll-wrap">
                <el-form ref="sys-form" :model="system" label-width="80px" :rules="sysRules" label-position="top" size="small" style="width: 640px" :validate-on-rule-change="false">
                  <div class="setup-form-title">{{$t('setup.system.adminAccount')}}</div>
                  <!-- username -->
                  <el-form-item :label="$t('profile.username')" prop="username" key="sysUsername">
                    <el-input v-model="system.username" :placeholder="$t('setup.usernamePlaceholder')"></el-input>
                  </el-form-item>
                  <!-- pin -->
                  <el-form-item :label="$t('login.pin')" prop="pin" key="sysPin" >
                    <el-input v-model="system.pin" type="password" auto-complete="new-password" show-password @blur="pinBlur" :placeholder="$t('setup.passwordPlaceholder')"></el-input>
                  </el-form-item>
                  <!-- pinConfirm -->
                  <el-form-item :label="$t('profile.confirmPassword')" prop="pinConfirm" key="sysPinConfirm">
                    <el-input v-model="system.pinConfirm" type="password" auto-complete="new-password" show-password :placeholder="$t('setup.passwordPlaceholder')"></el-input>
                  </el-form-item>
                  <div class="setup-form-title">{{$t('config.system.system')}}</div>
                  <!-- language -->
                  <el-form-item :label="$t('config.system.basic.language')" prop="language" key="sysLanguage">
                    <el-select v-model="system.language" :placeholder="$t('el.select.placeholder')" style="width: 100%" >
                      <el-option v-for="item in languageList" :label="item.label" :value="item.value" :key="item.value"></el-option>
                    </el-select>
                  </el-form-item>
                  <!-- timezone -->
                  <el-form-item :label="$t('setup.system.defaultTimezone')" prop="timezone" key="sysTimezone">
                    <el-select v-model="system.timezone" :placeholder="$t('el.select.placeholder')" filterable style="width: 100%">
                      <el-option v-for="(item,index) in timezoneOption" :key="index" :label="item.name" :value="item.name" >
                        <div style="display: flex;justify-content: space-between;">
                          <div >{{item.name}}</div>
                          <div class="utc-item">{{timezoneOptionHandler(item.offset)}}</div>
                        </div>
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <div class="setup-form-title">{{$t('buttons.system.monitor')}}</div>
                  <!-- federation -->
                  <el-form-item :label="$t('setup.system.federation')" prop="federationEnabled" key="sysFederationEnabled">
                    <el-select v-model="system.federationEnabled" :placeholder="$t('el.select.placeholder')" style="width: 100%" @change="federationChange">
                      <el-option :label="$t('overall.enabled')" value="1"></el-option>
                      <el-option :label="$t('overall.disabled')" value="0"></el-option>
                    </el-select>
                  </el-form-item>
                  <!-- asset_ping_from -->
                  <el-form-item :label="$t('config.system.monitor.asset_ping_from')" prop="asset_ping_from" key="sysPing_from">
                    <el-select v-model="system.asset_ping_from" :placeholder="$t('el.select.placeholder')" style="width: 100%">
                      <el-option label="Global" value="1"></el-option>
                      <el-option label="Per-datacenter" value="2" :disabled="system.federationEnabled==='0'"></el-option>
                    </el-select>
                  </el-form-item>
                  <!-- asset_ping_interval -->
                  <el-form-item :label="$t('config.system.basic.assetPingInterval')" prop="asset_ping_interval" key="sysPing_interval">
                    <el-input v-model.number="system.asset_ping_interval" >
                      <template slot="append"><span >{{$t('alert.config.second')}}</span></template>
                    </el-input>
                  </el-form-item>
                  <!-- default_scrape_interval -->
                  <el-form-item :label="$t('project.endpoint.scrape_interval')" prop="default_scrape_interval" key="sysScrape_interval">
                    <el-input v-model.number="system.default_scrape_interval" >
                      <template slot="append"><span >{{$t('alert.config.second')}}</span></template>
                    </el-input>
                  </el-form-item>
                  <!-- default_scrape_timeout -->
                  <el-form-item :label="$t('config.system.basic.scrapeTimeout')" prop="default_scrape_timeout" key="sysScrape_timeout">
                    <el-input v-model.number="system.default_scrape_timeout" >
                      <template slot="append"><span >{{$t('alert.config.second')}}</span></template>
                    </el-input>
                  </el-form-item>
                  <!-- snmp_trap_listen_port -->
                  <el-form-item :label="$t('config.system.basic.snmpTrapPort')" prop="snmp_trap_listen_port" key="sysSnmp_port">
                    <el-input v-model="system.snmp_trap_listen_port"></el-input>
                  </el-form-item>
                </el-form>
              </div>
              <div class="setup-help">
                <div class="help-header">
                  {{$t('setup.system.configTitle')}}
                </div>
                <div class="help-body">
                  {{$t('setup.system.configTip')}}
                </div>
              </div>
            </div>
          </template>
          <div class="setup-bottom-btn">
            <button v-if="activeStep != 0" class="nz-btn nz-btn-size-normal nz-btn-style-normal" style="background-color:#fff;color:#333;border:1px solid rgba(0,0,0,0.15);" @click="preStep">
              <span>{{$t('overall.back')}}</span>
            </button>
            <button v-if="activeStep != 3"  :class="{'nz-btn-disabled':prevent_next}" :disabled="prevent_next" class="nz-btn nz-btn-size-normal nz-btn-style-normal" @click="nextStep">
              <span>{{$t('setup.next')}}</span>
            </button>
            <button  v-if="activeStep == 3" :class="{'nz-btn-disabled':prevent_finish}" :disabled="prevent_finish" class="nz-btn nz-btn-size-normal nz-btn-style-normal" @click="finishStep">
              <span>{{$t('setup.finish')}}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUUID } from '../../common/js/common'
import { ip, port, positiveInteger } from '../../common/js/validate'
import imgUrl from '@/assets/img/logo1-2.png'
import lodash from 'lodash'
import moment from 'moment-timezone'
export default {
  name: 'setup',
  data () {
    return {
      imgUrl,
      validateCode: '',
      language: 'en',
      step: 0,
      activeStep: 0,
      database: {
        mode: 'standalone',
        url: [{ ip: '', port: 3306 }],
        name: 'nz',
        username: '',
        pin: ''
      },
      dbRules: {
        ip: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: ip, trigger: 'blur' }],
        port: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: port, trigger: 'blur' }],
        name: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        username: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        pin: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]
      },
      redis: {
        mode: 'standalone',
        url: [{ ip: '', port: 6379 }],
        masterName: '',
        pin: '',
        database: ''
      },
      redisRules: {
        masterName: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        ip: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: ip, trigger: 'blur' }],
        port: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: port, trigger: 'blur' }]
      },
      system: {
        username: '',
        pin: '',
        pinConfirm: '',
        timezone: '',
        language: 'en',
        federationEnabled: '1',
        asset_ping_from: '1',
        asset_ping_interval: '300',
        default_scrape_interval: '30',
        default_scrape_timeout: '30',
        snmp_trap_listen_port: '162'
      },
      sysRules: {
        username: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        pin: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        pinConfirm: [{ validator: this.validatePin, trigger: 'blur' }, { required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        timezone: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        language: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        asset_ping_from: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        asset_ping_interval: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        default_scrape_interval: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        default_scrape_timeout: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        snmp_trap_listen_port: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: port, trigger: 'blur' }]
      },
      languageList: [
        { value: 'en', label: 'English' },
        { value: 'zh', label: '简体中文' }
      ],
      timezoneOption: [],
      reloadTime: 5000,
      reloadTimeout: null,
      reloadTimeCount: 0,
      prevent_next: false,
      prevent_finish: false
    }
  },
  created () {
    this.getValidateCode()
    this.system.timezone = moment.tz.guess()
    this.queryTimezone()
  },
  methods: {
    databaseModeChange () {
      if (this.database.mode === 'standalone') {
        this.$set(this.database, 'url', [{ ip: '', port: 3306 }])
      } else if (this.database.mode === 'Master-Master') {
        this.$set(this.database, 'url', [{ ip: '', port: 3306 }, { ip: '', port: 3306 }])
      }
      this.database.url.forEach((item, index) => {
        this.$refs['db-form'].clearValidate('url.' + index + '.ip')
        this.$refs['db-form'].clearValidate('url.' + index + '.port')
      })
    },
    redisModeChange () {
      if (this.redis.mode === 'standalone') {
        this.$set(this.redis, 'url', [{ ip: '', port: 6379 }])
      } else if (this.redis.mode === 'sentinel') {
        this.$set(this.redis, 'url', [{ ip: '', port: 6379 }, { ip: '', port: 6379 }, { ip: '', port: 6379 }])
      } else if (this.redis.mode === 'dms') {
        this.$set(this.redis, 'url', [{ ip: '', port: 6379 }, { ip: '', port: 6379 }])
      }
      this.redis.masterName = ''
      this.redis.url.forEach((item, index) => {
        this.$refs['redis-form'].clearValidate('url.' + index + '.ip')
        this.$refs['redis-form'].clearValidate('url.' + index + '.port')
      })
    },
    // 验证URL是否重复
    validateUrl (rule, value, callback) {
      let formName
      let urlArr
      if (this.activeStep == 1) {
        formName = 'db-form'
        urlArr = lodash.cloneDeep(this.database.url)
      } else if (this.activeStep == 2) {
        formName = 'redis-form'
        urlArr = lodash.cloneDeep(this.redis.url)
      }

      const currentIndex = rule.field.split('urlItem')[1]

      // 格式正确再校验
      let flag = true
      const ipReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
      if (!ipReg.test(urlArr[currentIndex].ip) || isNaN(Number(urlArr[currentIndex].port)) || (urlArr[currentIndex].port < 1 || urlArr[currentIndex].port > 65535)) {
        flag = false
      }

      // 转成字符串数组 判断是否有重复
      urlArr = urlArr.map(item => {
        return item.ip + ':' + item.port
      })
      if (flag && urlArr.some((item, index) => item === urlArr[currentIndex] && index != currentIndex)) {
        callback(new Error('URL ' + this.$t('validate.duplicate')))
      } else {
        const arr = urlArr.filter(item => {
          const ip = item.split(':')[0]
          const port = item.split(':')[1]
          return ipReg.test(ip) && !isNaN(Number(port)) && !(port < 1 || port > 65535)
        })
        // 没有重复的 则清除校验
        if (arr.length == new Set(arr).size) {
          urlArr.forEach((item, index) => {
            this.$refs[formName].clearValidate('urlItem' + index)
          })
        }
        callback()
      }
    },
    // ip、host失去焦点 手动校验URL是否重复
    urlBlur (formName, index) {
      this.$refs[formName].validateField('urlItem' + index)
    },
    // 确认密码的二次校验
    validatePin  (rule, value, callback) {
      if (value === '' && this.system.pin) {
        callback(new Error(this.$t('config.user.reinputPin')))
      } else if (value !== this.system.pin) {
        callback(new Error(this.$t('profile.confirmPasswordError')))
      } else {
        callback()
      }
    },
    /* 密码失去焦点 检验确认密码 */
    pinBlur () {
      if (this.system.pin && this.system.pinConfirm) {
        this.$refs['sys-form'].validateField('pinConfirm')
      }
    },
    federationChange () {
      // 当federationEnabled == 0时，asset_ping_from 不能选择 2
      if (this.system.federationEnabled === '0' && this.system.asset_ping_from === '2') {
        this.system.asset_ping_from = '1'
      }
    },
    changeStep: function (step) {
      // 拼接ip port
      const database = lodash.cloneDeep(this.database)
      database.url = database.url.map(item => {
        return item.ip + ':' + item.port
      })
      delete database.mode

      const redis = lodash.cloneDeep(this.redis)
      redis.url = redis.url.map(item => {
        return item.ip + ':' + item.port
      })
      if (!redis.masterName) {
        delete redis.masterName
      }
      switch (step) {
        case 0:
          this.activeStep = 0
          break
        case 1:
          if (this.prevent_next) { return }
          this.prevent_next = true
          if (this.activeStep > 1) {
            this.activeStep = 1
            this.prevent_next = false
          } else {
            this.getValidateCode()
            this.$get('setup/checkCode?code=' + this.validateCode).then(response => {
              if (response.status == 404) {
                this.$alert(this.$t('setup.hadConfig'), { type: 'warning' })
                const self = this
                setTimeout(() => {
                  self.$router.push({
                    path: '/'
                  })
                }, 2000)
                return
              }
              if (response.code == 200) {
                this.activeStep = 1
                this.step = 1
              } else {
                this.activeStep = 0
                this.step = 0
                if (response.code == 574012) {
                  this.$alert(this.$t('setup.hadConfig'), { type: 'warning' })
                } else {
                  this.$alert(this.$t('setup.invalidCode', { page: '' }), { type: 'warning' })
                }
              }
              this.prevent_next = false
            })
          }
          break
        case 2:
          if (this.prevent_next) { return }
          this.prevent_next = true
          if (this.activeStep > 2) {
            this.activeStep = 2
            this.prevent_next = false
          } else {
            this.$refs['db-form'].validate((valid) => {
              if (valid) {
                this.getValidateCode()
                this.$post('setup/checkDb', { database: database, code: this.validateCode }).then(response => {
                  if (response.code == 200) {
                    this.activeStep = 2
                    this.step = 2
                  } else {
                    this.activeStep = 1
                    this.step = 1
                    if (response.code == 574002) {
                      this.$alert(this.$t('setup.invalidCode', { page: this.$t('setup.welcomePage') }), { type: 'warning' })
                    } else {
                      this.$alert(this.$t('setup.invalidDb'), { type: 'warning' })
                    }
                  }
                  this.prevent_next = false
                })
              } else {
                this.prevent_next = false
              }
            })
          }
          break
        case 3:
          if (this.prevent_next) { return }
          this.prevent_next = true
          if (this.activeStep > 3) {
            this.activeStep = 3
            this.prevent_next = false
          } else {
            this.$refs['redis-form'].validate((valid) => {
              if (valid) {
                this.getValidateCode()
                this.$post('setup/checkRedis', { redis, code: this.validateCode }).then(response => {
                  if (response.code == 200) {
                    this.activeStep = 3
                    this.step = 3
                  } else {
                    this.activeStep = 2
                    this.step = 2
                    if (response.code == 574004) { // 密码无效
                      this.$alert(this.$t('setup.invalidPin'), { type: 'warning' })
                    } else if (response.code == 574005) {
                      this.$alert(this.$t('setup.requirePin'), { type: 'warning' })
                    } else if (response.code == 574002) {
                      this.$alert(this.$t('setup.invalidCode', { page: this.$t('setup.welcomePage') }), { type: 'warning' })
                    } else {
                      this.$alert(this.$t('setup.invalidRedis'), { type: 'warning' })
                    }
                  }
                  this.prevent_next = false
                })
              } else {
                this.prevent_next = false
              }
            })
          }
          break
        case 4:
          if (this.prevent_finish) { return }
          this.prevent_next = true
          this.$refs['sys-form'].validate((valid) => {
            if (valid) {
              this.getValidateCode()
              const system = lodash.cloneDeep(this.system)
              const adminUser = {
                username: system.username,
                pin: system.pin
              }
              delete system.username
              delete system.pin
              delete system.pinConfirm
              const params = {
                database,
                redis,
                adminUser,
                system,
                code: this.validateCode
              }
              this.$post('setup/config', params).then(response => {
                if (response.code == 200) {
                  this.activeStep = 3
                  this.step = 4
                  this.$alert(this.$t('setup.wait'), { type: 'success' })
                  this.reloadTimeout = setTimeout(this.jumpToLogin, this.reloadTime)
                } else {
                  this.activeStep = 3
                  this.step = 3
                  if (response.code == 574002) {
                    this.$alert(this.$t('setup.invalidCode', { page: this.$t('setup.welcomePage') }), { type: 'warning' })
                  }
                }
              })
            } else {
              this.prevent_next = false
            }
          })
          break
      }
    },
    jumpToLogin: function () {
      this.reloadTimeCount += this.reloadTime
      if (this.reloadTimeCount > 5 * 60 * 1000) {
        clearTimeout(this.reloadTimeout)
        this.$alert(this.$t('setup.reloadTimeout'), { type: 'warning' })
        return
      }
      this.$get('healthy').then(response => {
        if (response.code == 200) {
          this.$router.push({
            path: '/'
          })
          clearTimeout(this.reloadTimeout)
        } else {
          this.reloadTimeout = setTimeout(this.jumpToLogin, this.reloadTime)
        }
      })
    },
    nextStep: function () {
      this.changeStep(this.activeStep + 1)
    },
    preStep: function () {
      this.changeStep(this.activeStep - 1)
    },
    finishStep: function () {
      this.changeStep(4)
    },
    getValidateCode: function () {
      const saveValidateCodeFunc = function (validateCode) {
        const saveItem = {
          code: validateCode,
          time: Date.now(),
          expire: 30 * 60 * 1000
        }
        localStorage.setItem('setup-validate-code', JSON.stringify(saveItem))
      }
      const validateCodeJSON = localStorage.getItem('setup-validate-code')
      if (validateCodeJSON != 'undefined' && validateCodeJSON != null) {
        const validateCode = JSON.parse(validateCodeJSON)
        if (Date.now() - validateCode.time > validateCode.expire) {
          this.validateCode = getUUID()
          saveValidateCodeFunc(this.validateCode)
        } else {
          this.validateCode = validateCode.code
        }
      } else {
        this.validateCode = getUUID()
        saveValidateCodeFunc(this.validateCode)
      }
    },
    changeLocal: function (local) {
      this.language = local
      this.$i18n.locale = local
      this.setRules()
    },
    setRules () {
      this.dbRules = {
        ip: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: ip, trigger: 'blur' }],
        port: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: port, trigger: 'blur' }],
        name: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        username: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        pin: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]
      }

      this.redisRules = {
        masterName: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        ip: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: ip, trigger: 'blur' }],
        port: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: port, trigger: 'blur' }]
      }

      this.sysRules = {
        username: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        pin: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        pinConfirm: [{ validator: this.validatePin, trigger: 'blur' }, { required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        timezone: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        language: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        asset_ping_from: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        asset_ping_interval: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        default_scrape_interval: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        default_scrape_timeout: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        snmp_trap_listen_port: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: port, trigger: 'blur' }]
      }
    },
    queryTimezone () {
      this.$get('/sys/timezone').then(response => {
        if (response.code == 200) {
          this.timezoneOption = response.data.list
        }
      })
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
<style>
.language-select .el-submenu__title {
  height: 50px !important;
}
.language-select .el-submenu {
  height: 50px !important;
}
</style>
