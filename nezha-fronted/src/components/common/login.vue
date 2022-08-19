<template>
  <div class="login"  id="login-bgimg">
    <div class="model"></div>
    <div class="stars-wrapper" id="stars-wrapper" v-if="!this.bgImg">
      <img src="../../assets/img/starCloud1.svg">
    </div>
    <div class="login-main">
      <div class="logo"><img src="../../assets/img/logo-big.png"></div>
      <div class='login-box'>
        <div class="login-label"></div>
        <div class="login-input" v-if="!verifyShow">
          <i class="nz-icon nz-icon-user"></i>
          <input id="usernameInput" v-model="loginData.username" autocomplete="on" name="userName" placeholder="Username" @keydown.enter="login"></input>
        </div>
        <div class="login-label"></div>
        <div class="login-input"  v-if="!verifyShow">
          <i class="nz-icon nz-icon-password"></i>
          <input v-model="loginData.pin" autocomplete="on" name="password" placeholder="Password" type="password" @keydown.enter="login"></input>
        </div>
        <div class="login-label"  v-if="verifyShow">{{$t('profile.twoFactorAuthentication')}}</div>
        <div class="login-input"  v-if="verifyShow">
          <i class="nz-icon nz-icon-yanzhengma"></i>
          <input v-model="loginData.authCode"  name="newPassword" autocomplete="off" :placeholder="$t('login.verifyPlaceholder')" @keydown.enter="verify"></input>
        </div>
        <div class="login-label-foot" v-if="verifyShow">
          {{$t('login.verifyContent')}}
        </div>
        <div class="login-foot">
          <button  v-if="!verifyShow" id="login" v-my-loading="loading" :class="{'nz-btn-disabled': !license.valid}" class="login-btn" @click="login">{{$t("login.login")}}</button>
          <button  v-if="verifyShow" id="verify" v-my-loading="loading" :class="{'nz-btn-disabled': !license.valid}" class="login-btn" @click="verify">{{$t("login.verify")}}</button>
        </div>
        <div class="license-warn" v-if="license.warnInfo">{{license.warnInfo}}</div>
        <div class="login-license">
<!--          <div v-if="!license.valid" class="license-info">INSTALLATION ID:&nbsp;{{license.token}}</div>-->
          <div v-if="!license.valid" class="license-upload">
<!--            <button type="button" class="login-btn" @click="downloadMib"><span style="margin-right: 5px"><i class="nz-icon nz-icon-download1"></i></span>{{$t('license.dowLicense')}}</button>-->
            <button type="button" class="login-btn download-btn" @click="downloadLogin"><span style="margin-right: 5px"><i class="nz-icon nz-icon-download1"></i></span>{{$t('license.downloadID')}}</button>
          </div>
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

      <div v-my-loading="dialogLoading">
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
          <span class="copy-value-content" :title="$t('overall.duplicate')"> <i class="nz-icon nz-icon-override" @click="copyValue"></i></span>
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
import { SVG } from '@svgdotjs/svg.js'
import svgCloud1 from '@/assets/img/starCloud1.svg'
import { get } from '@/http'
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
        valid: true
      },
      lang: this.$store.getters.getLanguage || 'en',
      uploadFileList: [],
      uploadFile: { file: '', path: '', uuid: '' },
      loading: false,
      verifyShow: false,
      theme: 1,
      authBindShow: false,
      authToken: '',
      QRCode: '',
      bindAuthCode: '',
      authKey: '',
      dialogLoading: false,
      fileShow: false,
      fileContent: '',
      recoveryCode: [],
      userInfo: {},
      bgImg: '' // 背景图
    }
  },
  methods: {
    ...mapActions(['loginSuccess']),
    login () {
      if (this.loading || !this.license.valid) {
        return
      }
      if (this.validateLogin() && (this.$route.path == '/' || this.$route.path == '/login')) {
        this.loading = true
        this.$post('/sys/login', this.loginData).then(res => {
          if (res.code == 200) {
            // 登录成功，记录用户名、token和lang
            this.authToken = res.data.authToken
            this.lang = res.data.user.lang || localStorage.getItem('nz-language')
            this.$i18n.locale = this.lang
            this.theme = res.data.user.theme
            this.userInfo = res.data.user
            localStorage.setItem('nz-token', res.data.authToken)
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
              localStorage.setItem('nz-username', this.loginData.username)
              localStorage.setItem('nz-username', this.loginData.username)
              localStorage.setItem('nz-prometheus-federation-enabled', res.data.prometheusFederationEnabled)
              localStorage.setItem('nz-language', this.lang)
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
          localStorage.setItem('nz-username', this.loginData.username)
          localStorage.setItem('nz-username', this.loginData.username)
          localStorage.setItem('nz-prometheus-federation-enabled', res.data.prometheusFederationEnabled)
          localStorage.setItem('nz-language', this.lang)
          res.data.user = {
            ...this.userInfo
          }
          this.loginSuccess(res)
        } else {
          this.authToken = res.data.authToken
          this.$message.error(res.msg)
        }
      })
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
      this.$get('/sys/license/status').then(response => {
        if (response.code && response.code === 200) {
          this.license.warnInfo = ''
          this.license.valid = true
        } else {
          this.license.valid = false
          this.license.warnInfo = response.msg
        }
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
      this.$post('/sys/license/upload', form).then(res => {
        if (res.code == 200) {
          this.licenseStat()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    downloadLogin () {
      this.$get('/sys/license/token').then(res => {
        let fileName = ''
        const resFileName = res.headers['content-disposition'].split('=')[1]
        if (resFileName) {
          fileName = resFileName
        }
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject, fileName)
        } else {
          const url = URL.createObjectURL(new Blob([res.data]))
          const a = document.createElement('a')
          document.body.appendChild(a) // 此处增加了将创建的添加到body当中
          a.href = url
          a.download = fileName
          a.target = '_blank'
          a.click()
          a.remove() // 将a标签移除
        }
      }, error => {
        const $self = this
        const reader = new FileReader()
        reader.onload = function (event) {
          const responseText = reader.result
          const exception = JSON.parse(responseText)
          if (exception.message) {
            $self.$message.error(exception.message)
          } else {
            console.error(error)
          }
        }
        reader.readAsText(error.response.data)
      })
    },
    getTimeString () {
      const split = '-'
      const date = new Date()
      const year = date.getFullYear()
      const month = this.formatNum(date.getMonth() + 1)
      const day = this.formatNum(date.getDate())
      const hours = this.formatNum(date.getHours())
      const minutes = this.formatNum(date.getMinutes())
      const seconds = this.formatNum(date.getSeconds())
      return year + split + month + split + day + ' ' + hours + split + minutes + split + seconds
    },
    formatNum (num) {
      return num > 9 ? num : '0' + num
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
      })
    },
    initStar () {
      document.getElementById('login-bgimg').style['background-image'] = 'url()'
      const box = document.getElementById('stars-wrapper')
      for (let i = 0; i < 3; i++) {
        const svg = SVG().addTo(box).size('100%', '100%')
        svg.attr('class', 'stars' + i)
        svg.attr('width', '100%')
        svg.attr('height', '100%')
        svg.attr('preserveAspectRatio', 'none')
        for (let j = 0; j < 100; j++) {
          const circle = svg.circle(r(0.5, 3))
          circle.attr('class', 'star')
          circle.attr('cx', r(0, 100) + '%')
          circle.attr('cy', r(0, 100) + '%')
        }
      }
      function r (m, n) {
        return (Math.random() * (n - m) + m).toFixed(2)
      }
    }
  },
  watch: {
    lang (n) {
      this.$i18n.locale = this.lang
    }
  },
  mounted () {
    this.$i18n.locale = this.lang
    document.getElementById('usernameInput').focus()
    this.licenseStat()
    this.initEvent()
    this.bgImg = localStorage.getItem('nz-sys-bgImg')
    if (this.bgImg) {
      document.getElementById('login-bgimg').style['background-image'] = `url(${this.bgImg})`
    } else {
      this.initStar()
    }
  }
}
</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  background-image: url("../../assets/img/login-background.png");
  background-size: cover;
}
</style>
<style>
  .license-upload .el-upload-list{
    display: none;
  }
  :root {
    --twinkle-duration: 4s;
  }
  .stars-wrapper {
    position: absolute;
    pointer-events: none;
    width: 100vw;
    height: 100vh;
    background: -webkit-gradient(linear, left top, left bottom, from(#16161d), color-stop(#080430), to(#0D0635));
    background: linear-gradient(#16161d, #080430, #0D0635);
    overflow: hidden;
    z-index: 1;
  }
  .stars0,
  .stars1,
  .stars2 {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    -webkit-animation: twinkle var(--twinkle-duration) ease-in-out infinite;
    animation: twinkle var(--twinkle-duration) ease-in-out infinite;
  }
  .stars0 {
    -webkit-animation-delay: calc(var(--twinkle-duration) * -0.22);
    animation-delay: calc(var(--twinkle-duration) * -0.22);
  }
  .stars1 {
    -webkit-animation-delay: calc(var(--twinkle-duration) * -0.44);
    animation-delay: calc(var(--twinkle-duration) * -0.44);
  }
  .stars2 {
    -webkit-animation-delay: calc(var(--twinkle-duration) * -0.66);
    animation-delay: calc(var(--twinkle-duration) * -0.66);
  }
  @-webkit-keyframes twinkle {
    25% {
      opacity: 0;
    }
  }
  @keyframes twinkle {
    25% {
      opacity: 0;
    }
  }
  .star {
    fill: white;
  }
  .star:nth-child(3n) {
    opacity: 0.8;
  }
  .star:nth-child(7n) {
    opacity: 0.6;
  }
  .star:nth-child(13n) {
    opacity: 0.4;
  }
  .star:nth-child(19n) {
    opacity: 0.2;
  }
</style>
