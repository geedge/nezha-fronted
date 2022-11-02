<template>
  <div class="profile">
    <div class="profile-left">
      <div class="profile-left__header">
        <div class="profile-left__header-avatar">
          <span>{{profileName}}</span>
        </div>
        <div class="profile-left__header-username">
          <el-popover
            placement="right-start"
            style="line-height: .1;"
            trigger="hover"
            :content="userList.name">
            <div slot="reference">
              <span :class="(mfaEnable == '1' || mfaLevel > 0)?'MfaName':'name'">
                {{userList.name}}
              </span>
              <span class="profile-left__header-username-span" v-show="mfaEnable == '1' || mfaLevel > 0">2FA</span>
            </div>
          </el-popover>
          <el-popover
            placement="right-start"
            trigger="hover"
            :content="'@' + userList.username">
            <div slot="reference">
              <span :class="(mfaEnable == '1' || mfaLevel > 0)?'MfaName':'name'">
                @{{userList.username}}
              </span>
            </div>
          </el-popover>
        </div>
      </div>
      <button id="asset-edit-cancel" class="profile-left__btn" @click="profileBox">
        <span><i class="nz-icon nz-icon-edit"></i></span>
        <span>{{$t('profile.editProfile')}}</span>
      </button>
      <div v-for="item in tableProfile" :key="item.id" class="profile-left__center">
        <span style="margin:0 18px 0 0"><i :class="item.icon"></i></span>
        <div class="profile-left__center-title">
          <div>{{item.label}}</div>
          <div v-if="item.prop">{{item.prop}}</div>
          <div v-if="!item.prop">-</div>
        </div>
      </div>
      <div class="profile-left__center">
       <span style="margin:0 18px 10px 0"><i class="nz-icon nz-icon-zhongzhi2FA1" style="color: orange;"></i></span>
       <div class="profile-left__center-title">
         <div>{{$t('profile.twoFactorAuthentication')}}</div>
       </div>
     </div>
      <div class="profile-left__button table-operation-items">
        <button @click="profileEnable" class="footer__btn"  v-if="mfaEnable != '1' && mfaLevel == 0">
          <span>{{$t('overall.enabled')}}</span>
        </button>
        <button @click="profileDisable" class="footer__btn footer__btn--light"  :class="{'footer__btn--disabled': mfaEnable == 1 ||  mfaLevel == 2}" v-if="mfaEnable == '1' || mfaLevel > 0" :disabled="mfaEnable == 1 ||  mfaLevel == 2 ">
          <span>{{$t('profile.close')}}</span>
        </button>
        <button @click="profileMfaLevel" class="footer__btn" v-if="mfaEnable == '1' || mfaLevel > 0" >
          <span>{{$t('profile.update')}}</span>
        </button>
      </div>
      <div class="profile-hr" style=""></div>
      <div class="profile-left__bottom">
        <div class="profile-left__bottom-title">
          <div>{{$t('profile.lastLoginIp')}}</div>
          <div>{{userList.lastLoginIp}}</div>
        </div>
        <div class="profile-left__bottom-title">
          <div>{{$t('profile.lastLoginTime')}}</div>
          <div>{{utcTimeToTimezoneStr(userList.lastLoginTime)}}</div>
        </div>
      </div>
    </div>
    <operation-record class="profile-right"/>
    <el-dialog :visible.sync="authBindShow" :title="$t('login.verifyDialogTitle')" :modal-append-to-body='false'
               :show-close="true" width="620px" class="nz-dialog" @closed="closeDialog">

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
    <el-dialog :visible.sync="fileShow" :title="$t('login.verifyDialogTitle')" :modal-append-to-body='false' :show-close="true" width="620px" class="nz-dialog" @closed="fileClosed">
      <div>
        <div class="login-dialog-title">
          Should you ever lose your phone or access to your one time password secret, each of these recovery codes can be used one time each to regain access to your account.
          Please save them in a safe place, or you will lose access to your account.
        </div>
        <div class="login-dialog-title2">
          <div class="login-dialog-recover">
            <div v-for="(item, index) in recoveryCode" :key="index">
              <span class="circle"></span>
              {{item}}
            </div>
          </div>
          <span class="copy-value-content"> <i class="nz-icon nz-icon-override" @click="copyValue" :title="$t('overall.duplicate')"></i></span>
        </div>
      </div>
      <div slot="footer" class="footer">
        <button id="asset-edit-download" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="downloadTxt">
          <span style="text-transform:capitalize">{{$t('overall.download')}}</span>
        </button>
      </div>
    </el-dialog>
    <transition name="right-box">
      <profile-box v-if="rightBox.show" :obj="object" @clickProfile="clickProfile" @close="closeRightBox"></profile-box>
    </transition>
    <transition name="right-box">
      <api-key-box v-if="apiRightBox" :obj="object"  @close="closeRightBox"></api-key-box>
    </transition>
  </div>
</template>

<script>
import operationRecord from './operationRecord'
import QRCode from 'qrcodejs2'
import MessageBox from 'element-ui/packages/message-box/src/main'
import i18n from '@/components/common/i18n'
import profileBox from '@/components/common/rightBox/profileBox'
import apiKeyBox from '@/components/common/rightBox/apiKeyBox'
import bus from '@/libs/bus'

export default {
  name: 'profile',
  components: {
    operationRecord,
    profileBox,
    apiKeyBox
  },
  data () {
    return {
      username: localStorage.getItem('nz-username'),
      mfaEnable: localStorage.getItem('nz-mfa-enable'),
      authBindShow: false,
      fileShow: false,
      dialogLoading: false,
      recoveryCode: '',
      bindAuthCode: '',
      mfaLevel: 0,
      authKey: '',
      authToken: '',
      url: 'sys/user/profile',
      object: {},
      // 侧滑
      rightBox: {
        show: false
      },
      apiRightBox: false,
      blankObject: { // 空白对象
        id: '',
        name: '',
        username: '',
        role: '',
        email: '',
        mobile: '',
        language: 'en',
        source: '',
        theme: 1
      },
      // 右侧列表
      tableProfile: [
        {
          id: 1,
          label: this.$t('profile.role'),
          prop: '',
          icon: 'nz-icon nz-icon-role profile-role'
        }, {
          id: 2,
          label: this.$t('config.system.email.email'),
          prop: '',
          icon: 'nz-icon nz-icon-email profile-email'
        }, {
          id: 3,
          label: this.$t('profile.mobile'),
          prop: '',
          icon: 'nz-icon nz-icon-mobile profile-mobile'
        }, {
          id: 4,
          label: this.$t('config.user.language'),
          prop: '',
          icon: 'nz-icon nz-icon-language-change profile-lang'
        }, {
          id: 5,
          label: this.$t('profile.source'),
          prop: '',
          icon: 'nz-icon nz-icon-laiyuan profile-laiyuan'
        }
      ],
      // 后台数据
      userList: {},
      // 头像 name
      profileName: '',
      rules: {
        oldPassword: [
          { required: true, message: this.$t('validate.required') }
        ],
        // newPassword: [
        //   { required: true, message: this.$t('validate.required'), trigger: 'change' }
        // ],
        confirmPassword: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      }
    }
  },
  mounted () {
    this.personalCenter()
    bus.$on('addApiKeyBox', (e) => {
      this.apiRightBox = e
    })
  },
  computed: {
    langList () {
      return this.$store.getters.getLangList
    }
  },
  methods: {
    // 请求后端数据
    personalCenter () {
      return new Promise(resolve => {
        this.$get('/sys/user/profile').then(response => {
          if (response.code === 200) {
            this.userList = response.user
            this.mfaLevel = response.user.mfaLevel
            if (response.user.roles[0].i18n) {
              this.tableProfile[0].prop = this.userList.roles[0].i18n
            } else {
              this.tableProfile[0].prop = this.userList.roles[0].name
            }
            this.tableProfile[1].prop = this.userList.email
            this.tableProfile[2].prop = this.userList.mobile
            const findLang = this.langList.find(lang => this.userList.lang === lang.value)
            if (findLang) {
              this.tableProfile[3].prop = findLang.name
            }
            this.tableProfile[4].prop = this.userList.source
            const name = this.userList.name.substr(0, 1)
            this.profileName = name
          }
          resolve()
        })
      })
    },
    profileMfaLevel () {
      this.dialogLoading = true
      this.authBindShow = true
      const params = {}
      this.$post('/mfa/genkey', params).then(res => {
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
    },
    profileEnable () {
      this.dialogLoading = true
      this.authBindShow = true
      const params = {
        mfaLevel: 1
      }
      this.$post('/mfa/genkey', params).then(res => {
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
    },
    profileDisable () {
      MessageBox.confirm(i18n.t('tip.resetMfa'), {
        confirmButtonText: i18n.t('tip.yes'),
        cancelButtonText: i18n.t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('/sys/user/disableMfa').then(res => {
          if (res.code == 200) {
            this.personalCenter()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    profileBox () {
      this.$get(this.url).then(res => {
        this.object = res.user
        this.rightBox.show = true
      })
    },
    closeRightBox () {
      this.rightBox.show = false
      this.apiRightBox = false
    },
    clickProfile (refresh) {
      this.personalCenter()
      if (refresh) {
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    },
    closeDialog () {
      this.authBindShow = false
      this.bindAuthCode = ''
    },
    jumpDlw () {
      window.open('https://google-authenticator.en.softonic.com/android')
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
    bindQRCode: function (text) {
      text = text || 'https://www.baidu.com'
      if (!this.QRCode) {
        this.QRCode = new QRCode(this.$refs.qrCodeDiv, {
          text: text,
          width: 124,
          height: 124,
          colorDark: '#333333', // 二维码颜色
          colorLight: 'white', // 二维码背景色
          correctLevel: QRCode.CorrectLevel.L// 容错率，L/M/H
        })
      } else {
        this.QRCode.makeCode(text)
      }
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
    fileClosed () {
      this.personalCenter()
    }
  }
}
</script>
