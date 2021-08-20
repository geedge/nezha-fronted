<template>
  <div class="login" @click="langListShow = false">
    <div class="model"></div>
    <div class="login-main">
      <div class="logo"><img src="../../assets/img/logo-big.png"></div>
      <div class='login-box'>
        <div class="login-label"></div>
        <div class="login-input" v-if="!verifyShow">
          <i class="nz-icon nz-icon-user"></i>
          <input id="usernameInput" v-model="loginData.username" name="userName" autocomplete="on" :placeholder="$t('login.username')" @keydown.enter="login"></input>
        </div>
        <div class="login-label"></div>
        <div class="login-input"  v-if="!verifyShow">
          <i class="nz-icon nz-icon-password"></i>
          <input v-model="loginData.pin" type="password" name="password" autocomplete="on" :placeholder="$t('login.pin')" @keydown.enter="login"></input>
        </div>
        <div class="login-label"  v-if="verifyShow">{{$t('login.verifyTitle')}}</div>
        <div class="login-input"  v-if="verifyShow">
          <i class="nz-icon nz-icon-yanzhengma"></i>
          <input v-model="loginData.authCode"  name="newPassword" autocomplete="off" :placeholder="$t('login.verifyPlaceholder')" @keydown.enter="verify"></input>
        </div>
        <div class="login-label-foot" v-if="verifyShow">
          {{$t('login.verifyContent')}}
        </div>
        <div class="login-foot">
          <button  v-if="!verifyShow" id="login" v-loading="loading" :class="{'nz-btn-disabled': !license.valid}" class="login-btn" @click="login">{{$t("login.login")}}</button>
          <button  v-if="verifyShow" id="verify" v-loading="loading" :class="{'nz-btn-disabled': !license.valid}" class="login-btn" @click="verify">{{$t("login.verify")}}</button>
          <div class="login-foot-lang" @click.stop="langListShow = !langListShow">
            <i v-if="lang == 'en'" class="nz-icon nz-icon-lang-en"></i>
            <i v-else-if="lang == 'cn'" class="nz-icon nz-icon-lang-zh"></i>
            <i class="nz-icon nz-icon-arrow-down"></i>
          </div>
          <div class="login-foot-lang-list" v-show="langListShow">
            <i v-if="lang != 'en'" @click="changeLang('en')" class="nz-icon nz-icon-lang-en"></i>
            <i v-if="lang != 'cn'" @click="changeLang('cn')" class="nz-icon nz-icon-lang-zh"></i>
          </div>
        </div>
        <div class="login-license">
          <div class="license-warn" v-if="license.warnInfo">{{license.warnInfo}}</div>
          <div v-if="!license.valid" class="license-info">INSTALLATION ID:&nbsp;{{license.token}}</div>
          <div class="license-upload" v-if="!license.valid">
            <el-upload
              ref="upload"
              accept=".xml"
              action=""
              :file-list="uploadFileList"
              :auto-upload="false"
              :on-change="handleChange"
            >
              <button type="button" class="login-btn" ><span style="margin-right: 5px"><i class="nz-icon nz-icon-upload"></i></span>{{$t('login.upload')}}</button>
            </el-upload>
          </div>
        </div>
      </div>
    </div>
    <div class="login-foot-buildOn">
      <span><a target="_blank" rel="noopener noreferrer" href='https://prometheus.io'>Build on Prometheus</a></span>
    </div>
    <el-dialog :visible.sync="authBindShow" :title="$t('login.verifyDialogTitle')" :modal-append-to-body='false'
               :show-close="true" width="620px" class="nz-dialog" >

      <div v-loading="dialogLoading">
        <div class="login-dialog-title">
          1 Download your preferred authenticator app to your phone (any will work). If you don't
          have a preferred app, we recommend using <span @click="jumpDlw" class="verify-link">Google Authenticator.</span>
        </div>
        <div class="login-dialog-title">
          2 Use your app to take a photo of the QR code.
        </div>
        <div class="qrCode-box">
          <div id="qrCode" ref="qrCodeDiv" class="qrCode-content"></div>
          <div class="qrCode-text">
            <div>Type this code down if you can't take a photo.</div>
            <div class="qrCode-authKey">{{authKey}}</div>
          </div>
        </div>

        <div class="login-dialog-title">
          3. Enter the 6-digit code provided by your app and then verify.
        </div>
        <div class="enter-code">Enter Code</div>
        <el-input v-model="bindAuthCode" size="small" style="width: 50%" @keydown.enter="bindCode"></el-input>
      </div>
      <div slot="footer" class="footer">
        <button id="asset-edit-cancel" @click="closeDialog" class="footer__btn footer__btn--light">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button id="asset-edit-save" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="bindCode">
          <span style="text-transform:capitalize">{{$t('login.verify')}}</span>
        </button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="fileShow" :title="$t('login.verifyDialogTitle')" :modal-append-to-body='false'
               :show-close="true" width="620px" class="nz-dialog" >

      <div>
        <div class="login-dialog-title">
          Should you ever lose your phone or access to your one time password secret, each of these recovery codes can be used one time each to regain access to your account.
          Please save them in a safe place, or you will lose access to your account.
        </div>
        <div class="login-dialog-title2">
          <div class="login-dialog-recover">
            <div v-for="(item, index) in recoveryCode" :key="index" style="color: #999999;">
              <span class="circle"></span>
              {{item}}
            </div>
          </div>
          <span class="copy-value-content"> <i class="nz-icon nz-icon-override" @click="copyValue"></i></span>
        </div>
      </div>
      <div slot="footer" class="footer">
        <button id="asset-edit-download" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="downloadTxt">
          <span style="text-transform:capitalize">{{$t('overall.download')}}</span>
        </button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import QRCode from 'qrcodejs2'
import bus from '@/libs/bus.js'
export default {
  name: 'login',
  data () {
    return {
      loginData: {
        username: '',
        pin: '',
        remember: false,
        authCode: ''
      },
      license: {
        warnInfo: '',
        token: '',
        valid: false
      },
      uploadFileList: [],
      uploadFile: { file: '', path: '', uuid: '' },
      loading: false,
      lang: localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en', // en/cn
      langListShow: false,
      verifyShow: false,
      authBindShow: false,
      authToken: '',
      QRCode: '',
      bindAuthCode: '',
      authKey: '',
      dialogLoading: false,
      fileShow: false,
      fileContent: '',
      recoveryCode: []
    }
  },
  methods: {
    ...mapActions(['loginSuccess']),
    login () {
      if (this.loading || !this.license.valid) {
        return
      }
      // if (this.license.valid && this.validateLogin() && (this.$route.path == '/' || this.$route.path == '/login')) {
      if (this.validateLogin() && (this.$route.path == '/' || this.$route.path == '/login')) {
        this.loading = true
        this.$post('/sys/login', this.loginData).then(res => {
          if (res.code == 200) {
            // 登录成功，记录用户名、token和lang
            this.authToken = res.data.authToken
            sessionStorage.setItem('nz-token', res.data.authToken)
            this.$get('/sys/user/profile').then(response => {
              if (response.code === 200) {
                const userList = response.user
                console.log(userList)
                // 保存当前用户的 userId
                localStorage.setItem('nz-user-id', userList.id)
                localStorage.setItem('nz-user-name', userList.name)
              }
            })
            if (res.data.authFlag === 1) {
              if (res.data.authBind === 0) {
                this.verifyShow = true
              } else if (res.data.authBind === 1) {
                this.authBindShow = true
                this.dialogLoading = true
                this.$post('/mfa/genkey', { authToken: this.authToken }).then(res => {
                  this.dialogLoading = false
                  if (res.code === 200) {
                    this.$nextTick(() => {
                      this.authToken = res.data.authToken
                      this.authKey = res.data.authKey
                      this.bindQRCode(res.data.otpauth)
                    })
                  } else {
                    this.authBindShow = false
                    this.$message.error(res.message)
                  }
                })
              }
            } else {
              sessionStorage.setItem('nz-username', this.loginData.username)
              localStorage.setItem('nz-username', this.loginData.username)
              localStorage.setItem('nz-prometheus-federation-enabled', res.data.prometheusFederationEnabled)
              localStorage.setItem('nz-language', this.lang)
              this.$i18n.locale = this.lang
              this.loginSuccess(res)
            }
          } else {
            this.$message.error(res.msg)
          }
        }).finally(() => {
          this.loading = false
        })
      }
    },
    verify () {
      const params = {
        authToken: this.authToken,
        authCode: this.loginData.authCode
      }
      this.$post('/mfa/verify', params).then(res => {
        if (res.code === 200) {
          sessionStorage.setItem('nz-username', this.loginData.username)
          localStorage.setItem('nz-username', this.loginData.username)
          localStorage.setItem('nz-prometheus-federation-enabled', res.data.prometheusFederationEnabled)
          localStorage.setItem('nz-language', this.lang)
          this.$i18n.locale = this.lang
          this.loginSuccess(res)
        } else {
          this.authToken = res.data.authToken
          this.$message.error(res.msg)
        }
      })
    },
    changeLang (lang) {
      this.lang = lang
      this.langListShow = false
      this.$i18n.locale = this.lang
      localStorage.setItem('nz-language', this.lang)
    },
    validateLogin () {
      if (!this.loginData.username || !this.loginData.pin) {
        this.$message.error('Empty username or password')
        return false
      } else {
        return true
      }
    },
    licenseStat () {
      /* this.license.valid = false
      this.license.warnInfo = 'hehehe'
      this.license.token = 'dRqrWja/PzI8FrWVJeGqLw==' */
      this.$get('/sys/license/state').then(response => {
        if (response.code && response.code === 200) {
          this.license.warnInfo = ''
          this.license.valid = true
        } else {
          this.license.valid = false
          this.license.warnInfo = response.msg
        }
        this.license.token = response.token
      })
    },
    handleChange (file, fileList) {
      if (fileList.length > 0) {
        this.uploadFileList = [fileList[fileList.length - 1]]
      }
      this.uploadFile.file = this.uploadFileList[0]
      this.upload()
    },
    upload () {
      const form = new FormData()
      form.append('file', this.uploadFile.file.raw)
      this.$post('/sys/license/upload', form, { 'Content-Type': 'multipart/form-data' }).then(res => {
        if (res.code == 200) {
          this.licenseStat()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    bindQRCode: function (text) {
      text = text || 'https://www.baidu.com'
      if (!this.QRCode) {
        this.QRCode = new QRCode(this.$refs.qrCodeDiv, {
          text: text,
          width: 124,
          height: 124,
          colorDark: '#333333', // 二维码颜色
          colorLight: '#ffffff', // 二维码背景色
          correctLevel: QRCode.CorrectLevel.L// 容错率，L/M/H
        })
      } else {
        this.QRCode.makeCode(text)
      }
    },
    closeDialog () {
      this.authBindShow = false
      this.bindAuthCode = ''
    },
    bindCode () {
      this.prevent_opt.save = true
      this.$post('/mfa/bind', { authToken: this.authToken, authCode: this.bindAuthCode }).then(res => {
        this.prevent_opt.save = false
        if (res.code === 200) {
          this.authBindShow = false
          this.bindAuthCode = ''
          this.recoveryCode = res.data.recoveryCode
          this.fileContent = this.recoveryCode.join(' \n ')
          this.fileShow = true
        } else {
          this.authToken = res.data.authToken
          this.$message.error(this.$t('login.bindFail'))
        }
      })
    },
    jumpDlw () {
      window.open('https://google-authenticator.en.softonic.com/android')
    },
    downloadTxt () {
      const element = document.createElement('a')
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.fileContent))
      element.setAttribute('download', 'Nezha recovery codes')
      element.style.display = 'none'
      element.click()
    },
    copyValue () {
      const domUrl = document.createElement('input')
      domUrl.value = this.fileContent
      domUrl.id = 'creatDom'
      document.body.appendChild(domUrl)
      domUrl.select() // 选择对象
      document.execCommand('Copy') // 执行浏览器复制命令
      const creatDom = document.getElementById('creatDom')
      creatDom.parentNode.removeChild(creatDom)
      this.$message.success(this.$t('overall.copySuccess'))
    },
    initEvent () {
      bus.$on('profile-dialog', () => {
        this.authBindShow = true
        console.log(1)
      })
    }
  },
  watch: {
    /* 'loginData.username'(n, o) {
      let lang = localStorage.getItem('nz-language-' + n);
      if (lang) {
        this.lang = lang;
        this.$i18n.locale = this.lang;
      }
    } */
  },
  mounted () {
    const _this = this
    this.$i18n.locale = this.lang
    // document.onkeydown = function (e) {
    //   if (e.key === 'Enter') {
    //     _this.login()
    //   }
    // }
    document.getElementById('usernameInput').focus()
    this.licenseStat()
    this.initEvent()
  }
}
</script>

<style scoped lang="scss">
.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  background-image: url("../../assets/img/login-background.png");
  background-size: cover;
}
.model {
  height: 100%;
  width: 100%;
  background-color: rgba(130, 130, 135, 0.4);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.logo {
  z-index: 2;
  width: 460px;
  img{
    width: 100%;
  }
}
.login-main {
  z-index: 2;
  background: rgba(106,106,106,0.5);
  border-radius: 8px;
  padding: 55px 50px 0px 50px;
}
.login-box {
  z-index: 2;
  width: 460px;
  .login-label{
    font-family: Roboto-Medium;
    font-size: 22px;
    color: #FFFFFF;
    font-weight: 500;
    color: #ffffff;
  }
  .login-label-foot{
    font-family: Roboto-Medium;
    font-size: 14px;
    color: #DEDEDE;
    line-height: 20px;
    font-weight: 500;
    color: #DEDEDE;
    word-break: keep-all;
    width: 90%;
  }
}

.login-box .login-input {
  padding: 12px 0;
  height: 60px;
  position: relative;
}
.login-box .login-input .nz-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  font-size: 20px;
}
.login-box .login-input input {
  height: 100%;
  width: calc(100% - 60px);
  background-color: rgba(0, 0, 0, 0.55);
  padding-left: 60px;
  font-size: 20px;
  border: none;
  outline: none;
  color: white;
  border-radius: 4px;
}

.login-foot {
  padding-top: 15px;
  display: flex;
  justify-content: space-between;
  position: relative;
}

.login-btn {
  color: white;
  border-radius: $--button-border-radius;
  background-color: var(--theme-color-light-20);
  border: none;
  outline: none;
  height: 44px;
  width: 320px;
  cursor: pointer;
  font-size: 14px;
  transition: all linear .2s;
}
.login-btn:not(.nz-btn-disabled):hover {
  background-color: var(--theme-color-light-30);
}

.login-foot-lang {
  position: relative;
  cursor: pointer;
  background: rgba(0,0,0,0.25);
  border-radius: 4px;
  padding: 0 14px;
}
.login-foot-lang .nz-icon:not(.nz-icon-arrow-up):not(.nz-icon-arrow-down) {
  font-size: 30px;
  color: white;
  margin-right: 30px;
  line-height: 45px;
}
.login-foot-lang-list {
  position: absolute;
  height: 25px;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.55);
  top: 70px;
  right: 0;
  border-radius: 4px;
}
.login-foot-lang-list .nz-icon {
  font-size: 25px;
  color: white;
  cursor: pointer;
}
.login-foot .el-loading-spinner {
  width: 36px;
  height: 36px;
}
.login-foot-lang-list::before {
  content: " ";
  width: 0px;
  height: 0px;
  border-width: 10px;
  border-style: solid;
  border-color: transparent transparent rgba(0, 0, 0, 0.55) transparent;
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
}
.login-foot-buildOn{
  position: absolute;
  bottom: 20px;
  z-index: 100;
  left: 50%;
  transform: translateX(-50%);
  a{
    font-size: 14px;
    color: #eee;
    text-shadow: 1px 1px 3px #333;
    text-decoration: none;
  }
}
.nz-icon-arrow-down, .nz-icon-arrow-up {
  position: absolute;
  font-size: 18px;
  color: white;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
}
.login-license{
  margin-top: 40px;
  text-align: center;
  line-height: 30px;
  .license-warn{
    color: #d92926;
    text-shadow: 1px 1px 3px #ddd;
  }
  .license-info {
    margin-bottom: 10px;
    color: white;
    text-shadow: 1px 1px 3px #333;
    white-space: nowrap;
  }
  .login-btn{
    height: 40px;
    width: auto;
    padding: 0 20px;
  }
}
.login-dialog-title{
  background: #F9F9F9;
  font-size: 14px;
  color: #666666;
  letter-spacing: 0;
  line-height: 20px;
  font-weight: 400;
  padding: 10px;
  margin-bottom: 10px;
  word-break: keep-all;
}
.login-dialog-title2{
  background: rgba(246,248,250, 0.9);
  border: 1px solid #E7EAED;
  border-radius: 2px;
  height: 248px;
  padding: 15px;
  position: relative;
  .copy-value-content{
    position: absolute;
    right: 5px;
    top: 5px;
    cursor: pointer;
  }
  .login-dialog-recover{
  height: calc(100% - 30px);overflow-y: auto
}
}
.enter-code{
  ont-size: 14px;
  color: #666666;
  letter-spacing: 0;
  font-weight: 400;
  margin-bottom: 10px;
}
  .qrCode-box{
    display: flex;
    align-items: center;
  }
  .qrCode-content{
    padding: 4px;
    margin-left: 10px;
  }
  .qrCode-text{
    width: 60%;
    margin-left: 10px;
    font-size: 14px;
    color: #666666;
    letter-spacing: 0;
    font-weight: 400;
  }
  .qrCode-authKey{
    background: rgba(246,248,250,09);
    border: 1px solid #E7EAED;
    border-radius: 2px;
    padding: 5px 12px;
    font-size: 14px;
    color: #333333;
    letter-spacing: 0;
    font-weight: 400;
    margin-top: 12px;
  }
  .footer {
    .footer__btn {
      margin: 0 15px;
      height: 30px;
      min-width: 74px;
      padding: 0 15px;
      color: white;
      background-color: var(--theme-color);
      border: none;
      border-radius: 4px;
      outline: none;
      box-sizing: border-box;
      font-size: 14px;
      cursor: pointer;
      transition: background-color linear .2s, color linear .1s;
    }
    .footer__btn:hover:not(.footer__btn--disabled) {
      background-color: var(--theme-color-light-20);
    }
    .footer__btn--light {
      background-color: white;
      border: 1px solid $--primary-border-color;
      color: #333;
    }
    .footer__btn.footer__btn--light:hover:not(.footer__btn--disabled) {
      background-color: white;
      border-color: var(--theme-color-light-50);
      color: var(--theme-color);
    }
    .footer__btn--disabled {
      opacity: .6;
      cursor: default;
    }
  }
  /deep/ .nz-dialog .el-dialog__body{
    padding-bottom: 0;
  }
  .verify-link{
    font-family: Roboto-Black;
    font-size: 14px;
    color: #3C92F1;
    letter-spacing: 0;
    line-height: 20px;
    font-weight: 400;
    cursor: pointer;
  }
  .verify-link:hover{
    border-bottom: 1px solid  #3C92F1;
  }
  .circle{
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #CECECE;
    margin-right: 10px;
  }
</style>
<style>
  .license-upload .el-upload-list{
    display: none;
  }
</style>
