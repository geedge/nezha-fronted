<template>
  <div class="setup">
    <div class="logo-header">
      <img height="30px" style="vertical-align: bottom; margin-top: 10px" src="../../../assets/img/logo1-2.png"/>
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
            <el-step :title="$t('setup.step3')" ></el-step>
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
              <el-form ref="db-form" :model="database" label-width="80px" :rules="dbRules" label-position="top" size="small" style="width: 600px" :validate-on-rule-change="false" >
                <el-form-item :label="$t('setup.host')" prop="host" key="dbhost" >
                  <el-input v-model="database.host"></el-input>
                </el-form-item>
                <el-form-item :label="$t('setup.port')" prop="port" key="dbport" >
                  <el-input v-model="database.port"></el-input>
                </el-form-item>
                <el-form-item :label="$t('setup.name')" prop="name" key="dbname" >
                  <el-input v-model="database.name"></el-input>
                </el-form-item>
                <el-form-item :label="$t('setup.username')" prop="username" key="dbusername" >
                  <el-input v-model="database.username"></el-input>
                </el-form-item>
                <el-form-item :label="$t('setup.pin')" prop="pin" key="dbpassword" >
                  <el-input v-model="database.pin" type="password" show-password ></el-input>
                </el-form-item>
              </el-form>
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
              <el-form ref="redis-form" :model="redis" label-width="80px" :rules="redisRules" label-position="top" size="small" style="width: 600px" :validate-on-rule-change="false" >
                <el-form-item :label="$t('setup.host')" prop="host" key="rdhost" >
                  <el-input v-model="redis.host"></el-input>
                </el-form-item>
                <el-form-item :label="$t('setup.port')" prop="port" key="rdport" >
                  <el-input v-model="redis.port"></el-input>
                </el-form-item>
                <el-form-item :label="$t('setup.pin')" prop="pin" key="rdpassword" >
                  <el-input v-model="redis.pin" type="password" show-password ></el-input>
                </el-form-item>
              </el-form>
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
              <el-form ref="sys-form" :model="system" label-width="80px" :rules="sysRules" label-position="top" size="small" style="width: 640px" :validate-on-rule-change="false" >
                <el-form-item :label="$t('setup.username')" prop="host" key="syshost" >
                  <el-input v-model="system.username"></el-input>
                </el-form-item>
                <el-form-item :label="$t('setup.pin')" prop="pin" key="syspassword" >
                  <el-input v-model="system.pin" type="password" show-password ></el-input>
                </el-form-item>
                <el-form-item :label="$t('setup.alertPath')" prop="alertPath" key="sysalertPath" >
                  <el-input v-model="system.alertPath"></el-input>
                </el-form-item>
                <el-form-item :label="$t('setup.system.federation')" prop="prometheusFederationEnabled" key="sysprometheusFederationEnabled" >
                  <el-select v-model="system.prometheusFederationEnabled"  style="width: 100%" >
                    <el-option :label="$t('setup.system.federationEnable')" :value="1"></el-option>
                    <el-option :label="$t('setup.system.federationDisable')"  :value="0"></el-option>
                  </el-select>
                </el-form-item>
               <!-- <el-form-item :label="$t('setup.alertPrefix')"  prop="alertPrefix" key="sysalertPrefix">
                  <el-input v-model="system.alertPrefix" ></el-input>
                </el-form-item>
                <el-form-item :label="$t('setup.haMode')"  prop="haMode" key="syshaMode">
                  <el-radio v-model="system.haMode" :label="1" >HA deploy</el-radio>
                  <el-radio v-model="system.haMode" :label="2" >Simple deploy</el-radio>
                </el-form-item>
                <el-form-item :label="$t('setup.haVip')"  prop="haVip" v-if="system.haMode == 2" key="sysHavip">
                  <el-input v-model="system.haVip" ></el-input>
                </el-form-item>-->
              </el-form>
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

            <button @click="preStep" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" v-if="activeStep != 0" style="background-color:#fff;color:#333;border:1px solid rgba(0,0,0,0.15);">
              <span>{{$t('setup.back')}}</span>
            </button>
            <button @click="nextStep"  class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" :disabled="prevent_next" v-if="activeStep != 3" :class="{'nz-btn-disabled':prevent_next}">
              <span>{{$t('setup.next')}}</span>
            </button>
            <button  @click="finishStep" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" :disabled="prevent_finish" v-if="activeStep == 3" :class="{'nz-btn-disabled':prevent_finish}">
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
import { host, port } from '../../common/js/validate'

export default {
  name: 'setup',
  data () {
    return {
      validateCode: '',
      language: 'en',
      step: 0,
      activeStep: 0,
      database: {
        host: "",
        port: 3306,
        name: "nz",
        username: "",
        pin: "",
      },
      dbRules: {
        host: [
          {
            required: true,
            message: this.$t("validate.required"),
            trigger: "blur",
          },
          { validator: host, trigger: "blur" },
        ],
        port: [{ validator: port, trigger: 'blur' }],
        name: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        username: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        pin: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]
      },
      redis: {
        host: "",
        port: 6379,
        pin: "",
      },
      redisRules: {
        host: [
          {
            required: true,
            message: this.$t("validate.required"),
            trigger: "blur",
          },
          { validator: host, trigger: "blur" },
        ],
        port: [{ validator: port, trigger: 'blur' }]
      },
      system: {
        username: '',
        pin: '',
        alertPath: '',
        alertPrefix: '',
        haMode: 1,
        haVip: '',
        prometheusFederationEnabled:1,
      },
      sysRules: {
        username: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        pin: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        alertPath: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        haVip: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
      },
      reloadTime: 5000,
      reloadTimeout: null,
      reloadTimeCount: 0,
      prevent_next: false,
      prevent_finish: false
    }
  },
  created () {
    this.getValidateCode()
  },
  methods: {
    changeStep: function (step) {
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
                this.$post('setup/checkDb', { database: this.database, code: this.validateCode }).then(response => {
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
                this.$post('setup/checkRedis', { redis: this.redis, code: this.validateCode }).then(response => {
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
              const params = {
                database: this.database,
                redis: this.redis,
                system: this.system,
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
    }
  }
}
</script>

<style scoped>
.setup {
  /*display: flex;*/
  width: 100%;
  height: 100%;
  margin: 0 auto;
}
.logo-header {
  padding-left: 20px;
  width: 100%;
  height: 50px;
  background-color: #202f3f;
  position: relative;
}
.logo-header-text {
  font-family: Verdand;
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 0;
  color: #dedede;
}
.language-select {
  position: absolute;
  top: 0;
  right: 20px;
  z-index: 2;
  margin-top: 15px;
  margin-right: 20px;
}
.flex-box{
  height: calc(100% - 50px);
}
.setup .step-box {
  width: 240px;
  height: 100%;
}
.setup .setup-box {
  width: calc(100% - 240px);
  height: 100%;
}
.step-box .step-inner {
  height: 100%;
  padding: 20px;
  padding-left: 0;
  box-sizing: border-box;
}

.setup-box .setup-inner {
  position: relative;
  height: 100%;
  padding: 40px 30px 0 30px;
  border: 10px solid #eeeeee;
  box-sizing: border-box;
}
.setup-inner .setup-config {
  position: relative;
  height: 100%;
}
.setup-inner .setup-help {
  width: calc(100% - 710px);;
  height:calc(100% - 50px);
  position: absolute;
  top: 20px;
  right: 0px;
  border-left: 1px solid #E7EAED;
  padding-left: 30px;
}
.setup .setup-help .help-header {
  font-family: Roboto-Medium;
  font-size: 22px;
  color: #333333;
  font-weight: 500;
  margin-bottom: 20px;
}
.setup .setup-help .help-body {
  font-family: Roboto-Regular;
  font-size: 16px;
  color: #333333;
  line-height: 28px;
  font-weight: 400;
}
.welcome {
  line-height: 35px;
  font-size: 16px;
}
.welcome .wel-header {
  font-family: Roboto-Medium;
  font-size: 26px;
  color: #333333;
  font-weight: 500;
}
.wizard-header {
  font-family: Roboto-Bold;
  font-size: 14px;
  color: #333333;
  font-weight: 700;
}
.welcome ul li {
  list-style: inside !important;
  font-family: Roboto-Regular;
  font-size: 14px;
  color: #333333;
  font-weight: 400;
}
.welcome pre {
  border: 1px solid #eae7ed;
  border-left: 4px solid #fa901c;
  border-radius: 0;
  font-family: "Courier New", Monaco, Menlo, Consolas, monospace;
  font-size: 14px;
  background-color: #f9f9f9;
  color: #333;
  padding: 15px;
  height: 48px;
  line-height: 16px;
  box-sizing: border-box;
}
.welcome .content-divider {
  height: 1px;
  width: 100%;
  border-bottom: 1px solid #eae7ed;
  margin: 5px 0px;
}
.setup-bottom-btn {
  width: 100%;
  height: 49px;
  position: absolute;
  bottom: 0;
  right: 20px;
  padding-top: 20px;
  text-align: right;
}
/* 步骤条样式 */
/deep/ .el-step{
  height: 46px ;
  /* height: 46px !important; */
}
/deep/ .el-step .el-step__head{
  /* display: none !important; */
  display: none ;
}
 /deep/ .el-step .el-step__main{
  padding-left: 20px ;
  height: 46px ;
  line-height: 46px;
  /* padding-left: 20px !important;
  height: 46px !important; */
}
/deep/ .el-step .el-step__main .el-step__title{
  padding: 0 0 0 20px  ;
  font-family: Roboto-Medium;
  font-size: 16px;
  color: #999;
  letter-spacing: 0;
  font-weight: 400;
  padding-left: 20px;
  margin-top: 11px;
  /* padding: 0 0 0 20px  !important; */
}
/deep/ .el-step .el-step__main .el-step__title.is-process{
  border-left:2px solid #fa901c ;
  color: #333333;
  font-weight: 500;
  padding-left: 18px;
  /* border-left:2px solid #fa901c !important; */
  /* padding-left: 18px !important; */
}
/deep/ .el-step .el-step__main .el-step__title.is-success{
  color: #333333;
  font-weight: 500;
}
/deep/ .el-step .el-step__main .el-step__description{
  /* display: none !important; */
  display: none ;
}
.el-select-dropdown__item.selected{
  font-weight: 400;
}
/* .el-select-dropdown__item.hover{
  font-weight: 700;
} */
</style>
<style>
.setup .el-menu--horizontal > .el-submenu.is-active .el-submenu__title {
  border-bottom: unset !important;
  color: #303133;
  background-color: transparent;
}
.language-select .el-submenu__title {
  height: 50px !important;
}
.language-select .el-submenu {
  height: 50px !important;
}
</style>
