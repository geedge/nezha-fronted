<template>
  <div class="login"  id="login-bgimg" style="background: none">
    <div class="video-box">
      <video class="video-background" preload="auto" loop="" playsinline="" autoplay="" src="/static/video/netsec-bg-video.mp4" tabindex="-1" muted="muted"></video>
    </div>
<!--    <div class="model"></div>-->
    <div class="login-main">
      <div class="logo"><img :src="imageUrl"></div>
      <div class='login-box'>
        <div class="login-label"></div>
        <div class="login-input" v-if="!verifyShow">
          <i class="nz-icon nz-icon-user"></i>
          <input id="usernameInput" v-model="loginData.username" autocomplete="on" name="userName" placeholder="Username" @keydown.enter="login"></input>
        </div>
        <div class="login-label"></div>
        <div class="login-input"  v-if="!verifyShow">
          <i class="nz-icon nz-icon-password"></i>
          <input v-model="loginData.pin" autocomplete="on" name="password" placeholder="Password" type="password" auto-complete="new-password"  @keydown.enter="login"></input>
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
<!--          <div v-if="!license.valid" class="license-upload">-->
          <div class="license-upload" v-if="!license.valid">
<!--            <button type="button" class="login-btn" @click="downloadMib"><span style="margin-right: 5px"><i class="nz-icon nz-icon-download1"></i></span>{{$t('license.dowLicense')}}</button>-->
            <button type="button" class="login-btn download-btn" @click="checkVisible = true"><span style="margin-right: 5px"><i class="nz-icon nz-icon-download1"></i></span>{{$t('license.downloadID')}}
            </button>
            <button class="license-left-footer-download login-btn download-btn" @click.stop="openQrcode" style="margin-left: -4px;display: inline-block">
              <i class="nz-icon nz-icon-erweima"></i>
            </button>
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
        <div class="login-dialog-title" v-if="lang=== 'en'">
          1. Download your preferred authenticator app to your phone (any will work). If you don't
          have a preferred app, we recommend using <span @click="jumpDlw" class="verify-link">Google Authenticator.</span>
        </div>
        <div class="login-dialog-title" v-else-if="lang=== 'zh'">
          1. 将您喜欢的验证器应用程序下载到您的手机上（任何应用程序都可以）。
          如果您没有首选应用程序，我们建议您使用 <span @click="jumpDlw" class="verify-link">Google Authenticator.</span>
        </div>
        <div class="login-dialog-title" v-if="lang=== 'en'">
          2. Use your app to take a photo of the QR code.
        </div>
        <div class="login-dialog-title" v-else-if="lang=== 'zh'">
          2. 使用您的应用程序为二维码拍照。
        </div>
        <div class="qrCode-box">
          <div id="qrCode" ref="qrCodeDiv" class="qrCode-content"></div>
          <div class="qrCode-text">
            <div v-if="lang=== 'en'">Type this code down if you can't take a photo.</div>
            <div v-else-if="lang=== 'zh'">如果你不能拍照，请键入此代码。</div>
            <div class="qrCode-authKey">{{authKey}}</div>
          </div>
        </div>

        <div class="login-dialog-title" v-if="lang=== 'en'">
          3. Enter the 6-digit code provided by your app and then verify.
        </div>
        <div class="login-dialog-title" v-else-if="lang=== 'zh'">
          3. 输入应用程序提供的6位数代码，然后进行验证。
        </div>
        <div class="enter-code" v-if="lang=== 'en'">Enter Code</div>
        <div class="enter-code" v-else-if="lang=== 'zh'">输入代码</div>
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
        <div class="login-dialog-title"  v-if="lang=== 'en'">
          Should you ever lose your phone or access to your one time password secret, each of these recovery codes can be used one time each to regain access to your account.
          Please save them in a safe place, or you will lose access to your account.
        </div>
        <div class="login-dialog-title"  v-else-if="lang=== 'zh'">
          如果您丢失了您的手机或一次性密码密码，每个恢复代码都可以使用一次，以重新访问您的帐户。
          请将它们保存在安全的地方，否则您将无法访问您的帐户。
        </div>
        <div class="login-dialog-title2" >
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
    <el-dialog :modal-append-to-body='false' :fullscreen="dialogQrType === 'all'" :show-close="true" :visible.sync="qrCodeShow" @close="closeQrCode" :title="'QR code'" class="nz-dialog overview" width="650px">
      <div slot="title">
        <span class="el-dialog__header-title"  v-if="lang=== 'en'">
           QR code
        </span>
        <span class="el-dialog__header-title" v-else-if="lang=== 'zh'">
           二维码
        </span>
        <div style="float: right; margin-right: 25px">
          <el-button-group>
            <el-button class="top-tool-btn" :class="{active: dialogQrType == 'item' }" size="small" @click="dialogQrType = 'item'"><i class="nz-icon nz-icon-dangemoshi"/></el-button>
            <el-button class="top-tool-btn" :class="{active: dialogQrType == 'all' }" size="small" @click="dialogQrType = 'all'"><i class="nz-icon nz-icon-duogemoshi"/></el-button>
          </el-button-group>
        </div>
      </div>
      <div v-show="dialogQrType === 'item'">
        <el-carousel arrow="never" :autoplay="false" :height="'500px'" ref="carousel" v-my-loading="qrloading">
          <el-carousel-item v-for="(item, index) in qrCodeNum" :key="index" :name="'qr-' + index"  style="width: 100%;height: 100%">
            <!--            :logo-src="getSrc(index)"-->
            <div  v-my-loading="item">
              <vueQr
                style="width: 500px;height: 500px"
                :text="qrCodeArr[index] || String(index)"
                :size="2000"
                :margin="50"
              />
            </div>
          </el-carousel-item>
        </el-carousel>
        <div class="nz-license-footer">
          <el-pagination
            @current-change="setActiveItem"
            small
            :page-size="1"
            :current-page.sync="currentPage"
            layout="prev, pager, next"
            :total="qrCodeNum.length">
          </el-pagination>
        </div>
      </div>
      <div v-show="dialogQrType === 'all'" :style="{
        'padding-left': paddingLeft + 'px'
      }" v-my-loading="qrloading">
        <div v-for="(item, index) in qrCodeNum"
             :key="index"
             :name="'qr-' + index"
             :style="{
               width: qrWidth + 'px',
               height: qrWidth + 'px',
               'text-align': 'center',
               display: 'inline-block'
             }"
             v-my-loading="item"
        >
          <!--            :logo-src="getSrc(index)"-->
          <vueQr
            :style="{
              width: qrWidth - 32 + 'px',
              height: qrWidth - 32 + 'px'
            }"
            :text="qrCodeArr[index] || String(index)"
            :size="2000"
            :margin="10"
          />
          <div style="text-align:center;margin-right:32px;"> {{index+1}} / {{qrCodeNum.length}}</div>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      class="nz-dialog c2vDialog"
      :title="$t('license.downloadID')"
      :show-close="true"
      :visible.sync="checkVisible"
      width="480px"
      @close="closeCheckDialog"
      >
      <p class="check-tip">{{$t('license.check')}}</p>
      <p class="check-tip">{{$t('license.check1')}}</p>
      <p class="check-tip">{{$t('license.check2')}}</p>
      <p class="check-tip">{{$t('license.check3')}}</p>
      <p class="check-tip">{{$t('license.check4')}}</p>
      <p class="check-tip isCheck">
        <el-checkbox v-model="checkCompleted">{{$t('license.checkCompleted')}}</el-checkbox>
      </p>
      <div slot="footer">
        <button @click="checkVisible = false" class="nz-btn nz-btn-size-normal nz-btn-style-light margin-r-10">{{$t("overall.close")}}</button>
        <button @click="downloadLicense" class="nz-btn nz-btn-size-normal nz-btn-style-normal" :class="{'nz-btn-disabled': (downLoading || !checkCompleted)}" :disabled="(downLoading || !checkCompleted)">{{$t('overall.download')}}</button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import QRCode from 'qrcodejs2'
import bus from '@/libs/bus.js'
import { SVG } from '@svgdotjs/svg.js'
import { coordinatePoint } from '@/components/common/js/common'
import imageUrl from '@/assets/img/logo-big.png'
import VueQr from '@/components/common/vueQR/packages/vue-qr'
import { get } from '@/http'
import SparkMD5 from 'spark-md5'
export default {
  name: 'login',
  components: {
    VueQr
  },
  data () {
    return {
      imageUrl,
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
      zoom: 0.75,
      circleStar: [],
      starTimer: '',
      starTimerIndex: 0,
      bgImg: '', // 背景图
      constellation: [],
      requestAnimationFrame: '',
      speed: [-1.3, -1, -0.6, -0.3, 0.3, 0.6, 1, 1.3],
      stateItem: '',
      endItem: '',
      qrCodeShow: false,
      qrCodeArr: [],
      qrCodeNum: [], // 逐个加载 qr
      totalQrCode: 10,
      currentPage: 1,
      qrloading: false,
      dialogQrType: 'item',
      boxWidth: '',
      boxHeight: '',
      qrWidth: 10,
      paddingLeft: 0,
      checkVisible: false,
      downLoading: false,
      checkCompleted: false
    }
  },
  methods: {
    ...mapActions(['loginSuccess']),
    closeCheckDialog () {
      this.checkCompleted = false
    },
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
            localStorage.setItem('nz-userInfo', JSON.stringify(this.userInfo))
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
              this.$store.commit('setLanguage', this.lang)
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
          this.$store.commit('setLanguage', this.lang)
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
    downloadLicense () {
      this.downLoading = true
      this.$get('/sys/license/token').then(res => {
        this.downLoading = false
        this.checkVisible = false
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
        this.downLoading = false
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
      this.$copyText(this.fileContent).then(() => {
        this.$message.success({ message: this.$t('overall.copySuccess') })
      })
    },
    initEvent () {
      bus.$on('profile-dialog', () => {
        this.authBindShow = true
      })
    },
    initStar () {
      const self = this
      this.circleStar = [[], [], [], []]
      document.getElementById('login-bgimg').style['background-image'] = 'url()'
      const box = document.getElementById('stars-wrapper')
      for (let i = 0; i < 3; i++) {
        const svg = SVG().addTo(box).size('100%', '100%')
        svg.attr('class', 'stars' + (i + 1))
        svg.attr('width', '100%')
        svg.attr('height', '100%')
        svg.attr('preserveAspectRatio', 'none')
        for (let j = 0; j < 50; j++) {
          const circle = svg.circle(self.r(0.5, 2))
          circle.attr('class', 'star')
          circle.attr('cx', self.r(0, 100) + '%')
          circle.attr('cy', self.r(0, 100) + '%')
          this.circleStar[i].push(circle)
        }
      }
      Object.keys(coordinatePoint).forEach((key, index) => {
        const group = SVG().addTo(box).attr('id', key).size('255', '305')
        group.attr('width', '265')
        group.attr('height', '305')
        group.attr('style', `left: ${coordinatePoint[key].offsetX};top:${coordinatePoint[key].offsetY};transform:scale(${this.zoom});`)
        group.attr('class', `constellation constellation${Math.round(self.r(0, 4))}`)
        group.data({
          id: key,
          speedX: self.r(-1, 1, 0.3),
          speedY: self.r(-1, 1, 0.3)
        })
        const polyline = group.polyline(coordinatePoint[key].point.map(item => [item.x, item.y])) // 先将所有点 用直线链接
        polyline.fill('none')
        polyline.stroke({ color: '#868096', width: 4, linecap: 'round', linejoin: 'round' })
        if (coordinatePoint[key].dot && coordinatePoint[key].dot.length) { // 再用虚线 覆盖原本直线
          coordinatePoint[key].dot.forEach(point => {
            group.line(point).fill('none').stroke({ color: '#07011D', width: 4, linecap: 'round', linejoin: 'round', dasharray: coordinatePoint[key].dasharray || '10 15' })
          })
          // const polyline1 = group.polyline([[165, 210], [250, 240]])
          // polyline1.fill('none')
          // polyline1.stroke({ color: '#07011D', width: 3, linecap: 'round', linejoin: 'round', dasharray: '8 8' })
        }
        coordinatePoint[key].point.forEach(item => { // 最后添加所有点
          const width = group.data('width') || item.x
          const height = group.data('height') || item.y
          group.data('width', (width >= item.x ? width : item.x))
          group.data('height', (height >= item.y ? height : item.y))
          if (item.disabled) return
          group.circle(14)
            .fill('#868096')
            .attr('cx', item.x)
            .attr('cy', item.y)
        })
        group.data('width', group.data('width') - 50)
        group.data('height', group.data('height') - 50)
        this.constellation.push(group)
      })
      this.starTimer = setInterval(() => {
        this.starTimerIndex++
        let index = 0
        if (this.starTimerIndex === 1) return
        if (this.starTimerIndex === 2) index = 2
        if (this.starTimerIndex === 3) {
          index = 1
          clearInterval(this.starTimer)
        }
        if (this.starTimerIndex === 0) index = 0
        this.starTimerIndex = this.starTimerIndex === 3 ? -1 : this.starTimerIndex
        this.circleStar[index] && this.circleStar[index].forEach(circle => {
          circle.radius(self.r(0.5, 2))
          circle.attr('cx', self.r(0, 100) + '%')
          circle.attr('cy', self.r(0, 100) + '%')
        })
      }, 1000)
      this.requestAnimationFrame = requestAnimationFrame(this.constellationAnimation)
    },
    r (m, n, minSpeed) {
      if (!minSpeed) {
        return (Math.random() * (n - m) + m).toFixed(2)
      } else {
        let random = (Math.random() * (n - m) + m)
        if (random > 0) {
          random += minSpeed * 1
        } else if (random < 0) {
          random += minSpeed * -1
        }
        return random.toFixed(2)
      }
    },
    constellationAnimation () {
      for (let i = 0; i < this.constellation.length; i++) { // 循环遍历 判断碰撞
        for (let j = i + 1; j < this.constellation.length; j++) {
          if (this.impact(this.constellation[i], this.constellation[j])) {
            const iSpeedX = this.constellation[i].data('speedX')
            const iSpeedY = this.constellation[i].data('speedY')
            const jSpeedX = this.constellation[j].data('speedX')
            const jSpeedY = this.constellation[j].data('speedY')
            this.constellation[i].data('speedX', jSpeedX)
            this.constellation[i].data('speedY', jSpeedY)
            this.constellation[j].data('speedX', iSpeedX)
            this.constellation[j].data('speedY', iSpeedY)
          }
        }
      }
      this.constellation.forEach(item => {
        const position = item.node.getBoundingClientRect()
        if (item.data('speedX') === 0) {
          item.data('speedX', this.r(-1, 1, 0.3))
        }
        if (item.data('speedY') === 0) {
          item.data('speedY', this.r(-1, 1, 0.3))
        }
        // 变速运动
        // item.data('speedX', item.data('speedX') > 0 ? this.r(0, 1) : this.r(-1, 0))
        // item.data('speedY', item.data('speedY') > 0 ? this.r(0, 1) : this.r(-1, 0))
        // 处理边界问题
        if (position.left + item.data('width') >= window.innerWidth) { // 向右移動 改为向左
          item.data('speedX', this.r(-1, 0, 0.3))
        }
        if (position.left + item.data('speedX') < 0) { // 向左移動 改为向右
          item.data('speedX', this.r(0, 1, 0.3))
        }

        if (position.top + item.data('height') >= window.innerHeight) { // 向下移動 改为向上
          item.data('speedY', this.r(-1, 0, 0.3))
        }
        if (position.top + item.data('speedY') < 0) { // 向上移動 改为向下
          item.data('speedY', this.r(0, 1, 0.3))
        }
        const left = position.left + item.data('speedX')
        const top = position.top + item.data('speedY')
        item.attr('style', `left: ${left}px;top:${top}px;transform:scale(${this.zoom});`)
      })
      this.requestAnimationFrame = requestAnimationFrame(this.constellationAnimation)
    },
    impact (obj, dobj) {
      const position = obj.node.getBoundingClientRect()
      const o = {
        x: position.left - 10,
        y: position.top - 10,
        w: obj.data('width'),
        h: obj.data('height')
      }
      const position2 = dobj.node.getBoundingClientRect()
      const d = {
        x: position2.left - 10,
        y: position2.top - 10,
        w: dobj.data('width'),
        h: dobj.data('height')
      }

      const px = o.x <= d.x ? d.x : o.x
      const py = o.y <= d.y ? d.y : o.y

      // 判断点是否都在两个对象中
      if (px >= o.x && px <= o.x + o.w && py >= o.y && py <= o.y + o.h && px >= d.x && px <= d.x + d.w && py >= d.y && py <= d.y + d.h) {
        return true
      } else {
        return false
      }
    },
    closeQrCode () {
      this.qrCodeShow = false
    },
    openQrcode () {
      this.qrCodeArr = []
      this.qrCodeNum = []
      this.qrCodeShow = true
      this.qrloading = true
      setTimeout(() => {
        this.$get('/sys/license/token').then(res => {
          this.totalQrCode = Math.ceil(res.data.length / (1024 + 512))
          if (this.totalQrCode < 1) {
            this.totalQrCode = 1
          }
          const total = this.totalQrCode < 10 ? ('0' + this.totalQrCode) : this.totalQrCode
          const totalMD5 = SparkMD5.hashBinary(res.data).slice(0, 8)
          const arr = []
          for (let i = 0; i < this.totalQrCode; i++) {
            const num = (1024 + 512)
            let str1 = res.data.slice(num * i, num * (i + 1))
            const index = i < 10 ? ('0' + (i + 1)) : (i + 1)
            const md5 = SparkMD5.hashBinary(str1).slice(0, 8)
            str1 = total + '' + index + totalMD5 + md5 + '' + str1
            arr.push(str1)
          }
          this.qrCodeArr = []
          this.qrCodeNum = arr.map(() => {
            return true
          })
          arr.forEach((item, index) => {
            setTimeout(() => {
              this.qrCodeArr.push(item)
              this.qrCodeNum[index] = false
            }, index * 100)
          })
          this.getLayout(arr)
          this.qrloading = false
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
      }, 100)
    },
    getSrc (index) {
      const cas = document.createElement('canvas')
      const ctx = cas.getContext('2d')

      cas.width = 100
      cas.height = 100
      ctx.font = 'normal bold 40px Roboto-Regular'
      let text = index + 1 + ''
      if (text.length < 2) {
        text = '0' + text
      }
      ctx.fillText(text, 25, 65)
      // 把画布的内容转换为base64编码格式的图片
      const data = cas.toDataURL('image/png', 1)
      return data
    },
    setActiveItem (currentPage) {
      this.$refs.carousel.setActiveItem('qr-' + (currentPage - 1))
    },
    getLayout () {
      try {
        this.boxWidth = document.body.offsetWidth - 30 - 40
        this.boxHeight = document.body.offsetHeight - 104 - 50
      } catch (error) {}
      return new Promise(resolve => {
        let rateMax = 0
        let col = 0
        let row = 0
        for (let i = 1; i <= this.qrCodeNum.length; i++) {
          const cols = Math.ceil(this.qrCodeNum.length / i)
          const w = this.boxWidth / i
          const h = this.boxHeight / cols
          const rate = w > h ? h / w : w / h
          if (rate > rateMax) {
            rateMax = rate
            col = cols
            row = i
          }
        }
        if (this.qrCodeNum.length) {
          while (col * row >= this.qrCodeNum.length) { // 避免出现空白
            row--
          }
        }
        row++
        if (col === 1 || row === 1) { // 行 或 列有一个为1时 需要调换位置
          const temp = col
          col = row
          row = temp
        }
        this.qrWidth = 10
        if (this.boxHeight / col < this.boxWidth / row) {
          this.qrWidth = this.boxHeight / col
        } else {
          this.qrWidth = this.boxWidth / row
        }
        this.paddingLeft = (this.boxWidth - row * this.qrWidth) / 2
        resolve({ col, row })
      })
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
      // document.getElementById('login-bgimg').style['background-image'] = `url(${this.bgImg})`
    } else {
      // this.initStar()
    }

    if (sessionStorage.getItem('nz-is-logout')) {
      sessionStorage.removeItem('nz-previous-page')
      sessionStorage.removeItem('nz-is-logout')
    }
  },
  beforeDestroy () {
    cancelAnimationFrame(this.constellationAnimation)
    clearInterval(this.starTimer)
    this.starTimer = null
  }
}
</script>
