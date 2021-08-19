<template>
  <div class="profile">
    <div class="profile-left">
      <div class="profile-left__header">
        <div class="profile-left__header-img">
          <span>{{username.substr(0, 1)}}</span>
        </div>
        <div class="profile-left__header-username">
<<<<<<< HEAD
          <el-popover
            placement="right-start"
            width="200"
            trigger="hover"
            :content="userList.username">
            <div slot="reference">{{userList.username}}<span class="profile-left__header-username__span">2FA</span></div>
          </el-popover>

=======
          <div>{{userList.username}}<span class="profile-left__header-username__span" v-show="mfaEnable == '1' || mfaLevel > 0">2FA</span></div>
>>>>>>> 2bac1c8f40b21f17cd768b58eab5398a425b6e34
          <div>@{{userList.name}}</div>
        </div>
      </div>
      <div v-for="item in tableProfile" :key="item.id" class="profile-left__center">
        <span style="margin:0 18px 0 0"><i :class="item.icon"></i></span>
        <div class="profile-left__center-title">
          <div>{{item.label}}</div>
          <div v-if="item.prop">{{item.prop}}</div>
          <div v-if="item.prop === null || ''">-</div>
        </div>
      </div>
     <div class="profile-left__center">
       <span style="margin:0 10px 10px 0"><i class="nz-icon nz-icon-zhongzhi2FA" style="color: orange"></i></span>
       <div class="profile-left__center-title">
         <div>{{$t('profile.twoFactorAuthentication')}}</div>
       </div>
     </div>
      <div class="profile-left__button table-operation-items">
<!--        <el-button v-show="this.userList.mfaLevel == 0 && this.userList.mfaAuthEnable == 0 ? true : false" size="small" class="profile-left__button-footer__btn footer__btns">-->
<!--          <span>{{$t('profile.enable')}}</span>-->
<!--        </el-button>-->
<!--        <el-button @click="profileDisable" size="small" v-show="this.userList.mfaLevel == 0 && this.userList.mfaAuthEnable == 0 ? false : true" :class="{'table-operation-item&#45;&#45;disable': this.userList.mfaLevel == 2 || this.userList.mfaAuthEnable ==1}" :disabled="this.userList.mfaLevel == 2 || this.userList.mfaAuthEnable == 1" class="profile-left__button-footer__btn footer__btns table-operation-item">-->
<!--          <span>{{$t('profile.close')}}</span>-->
<!--        </el-button>-->
<!--        <el-button @click="profileMfaLevel" size="small" v-show="this.userList.mfaLevel == 0 && this.userList.mfaAuthEnable == 0 ? false : true" :class="{'table-operation-item&#45;&#45;disable': this.userList.mfaLevel == 2 || this.userList.mfaAuthEnable ==1}" class="profile-left__button-footer__btn footer__btn table-operation-item">-->
<!--          <span>{{$t('profile.update')}}</span>-->
<!--        </el-button>-->
        <el-button @click="profileEnable" size="small" class="profile-left__button-footer__btn footer__btn table-operation-item"  v-if="mfaEnable != '1' && mfaLevel == 0">
          <span>{{$t('profile.enable')}}</span>
        </el-button>
        <el-button @click="profileDisable" size="small" class="profile-left__button-footer__btn footer__btns table-operation-item"  :class="{'footer__btn--disabled': mfaEnable == 1 ||  mfaLevel == 2}" v-if="mfaEnable == '1' || mfaLevel > 0" :disabled="mfaEnable == 1 ||  mfaLevel == 2 ">
          <span>{{$t('profile.close')}}</span>
        </el-button>
        <el-button @click="profileMfaLevel" size="small" class="profile-left__button-footer__btn footer__btn table-operation-item" v-if="mfaEnable == '1' || mfaLevel > 0" >
          <span>{{$t('profile.update')}}</span>
        </el-button>
      </div>
      <div class="profile-hr" style="height: 1px;background-color: #E7EAED;width: 320px; margin: 40px auto"></div>
      <div class="profile-left__bottom">
        <div class="profile-left__bottom-title">
          <div>{{$t('profile.lastLoginIp')}}</div>
          <div>{{userList.lastLoginIp}}</div>
        </div>
        <div class="profile-left__bottom-title">
          <div>{{$t('profile.lastLoginTime')}}</div>
          <div>{{userList.lastLoginTime}}</div>
        </div>
      </div>
    </div>
    <operation-record />
    <el-dialog :visible.sync="authBindShow" :title="$t('login.verifyDialogTitle')" :modal-append-to-body='false'
               :show-close="true" width="620px" class="nz-dialog" @closed="closeDialog">

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
               :show-close="true" width="620px" class="nz-dialog" @closed="fileClosed">

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
import operationRecord from './operationRecord'
import bus from '@/libs/bus.js'
import QRCode from "qrcodejs2";
import MessageBox from "element-ui/packages/message-box/src/main";
import i18n from "@/components/common/i18n";

export default {
  name: 'profile',
  components: {
    operationRecord
  },
  data () {
    return {
      username: sessionStorage.getItem('nz-username'),
      mfaEnable: localStorage.getItem('nz-mfa-enable'),
      authBindShow: false,
      fileShow: false,
      dialogLoading: false,
      recoveryCode: '',
      bindAuthCode: '',
      mfaLevel: 0,
      authKey: '',
      authToken: '',
      // 右侧列表
      tableProfile: [
        {
          id: 1,
          label: this.$t('profile.role'),
          prop: '',
          icon: 'nz-icon nz-icon-role profile-role'
        },
        {
          id: 2,
          label: this.$t('profile.email'),
          prop: '',
          icon: 'nz-icon nz-icon-email profile-email'
        },
        {
          id: 3,
          label: this.$t('profile.mobile'),
          prop: '',
          icon: 'nz-icon nz-icon-mobile profile-mobile'
        },
        {
          id: 4,
          label: this.$t('profile.source'),
          prop: '',
          icon: 'nz-icon nz-icon-laiyuan profile-laiyuan'
        }
      ],
      // 后台数据
      userList: {},
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
  },
  methods: {
    // 请求后端数据
    personalCenter () {
      return new Promise(resolve => {
        this.$get('/sys/user/profile').then(response => {
          if (response.code === 200) {
            this.userList = response.user
            this.mfaLevel = response.user.mfaLevel
            this.tableProfile[0].prop = this.userList.roles[0].i18n
            this.tableProfile[1].prop = this.userList.email
            this.tableProfile[2].prop = this.userList.mobile
            this.tableProfile[3].prop = this.userList.source
            localStorage.setItem('nz-user-id', this.userList.id)
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
          colorLight: '#ffffff', // 二维码背景色
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
    fileClosed () {
      this.personalCenter()
    }
  }
}
</script>

<style lang="scss" scoped>
.profile {
  display: flex;
  height: 100%;
  height: calc(100% - 20px);
  .profile-left {
    margin: 10px 0 10px 10px;
    background: #FFFFFF;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.06);
    border-radius: 2px;
    height: 100%;
    width: 360px;
    .profile-left__header {
      height: 200px;
      width: 100%;
      margin: 10px 0;
      text-align: center;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .profile-left__header-img {
        height: 80px;
        width: 80px;
        line-height: 80px;
        margin-left: 20px;
        span {
          display: inline-block;
          background: rgba(60,146,241,0.10);
          font-family: PingFangSC-Medium;
          text-transform: capitalize;
          width: 100%;
          height: 100%;
          font-size: 30px;
          color: #3C92F1;
          letter-spacing: 0;
          font-weight: 500;
          border-radius: 100%;
        }
      }
      .profile-left__header-username {
        height: 80px;
        padding-left: 15px;
        text-align: left;
        div:nth-of-type(1) {
          font-family: Roboto-Medium;
          width: 200px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          font-size: 18px;
          color: #333333;
          letter-spacing: 0;
          line-height: 22px;
          font-weight: 500;
          padding: 10px 0 8px 0;
        }
        div:nth-of-type(2) {
          font-family: Roboto-Regular;
          font-size: 18px;
          color: #666666;
          letter-spacing: 0;
          line-height: 22px;
          font-weight: 400;
        }
        .profile-left__header-username__span {
          display: inline-block;
          text-align: center;
          width: 42px;
          height: 24px;
          line-height: 25px;
          margin-left: 10px;
          background-color: #ecf5ff;
          border-color: #d9ecff;
          border-radius: 10px;
          font-family: Roboto-Regular;
          font-size: 14px;
          color: #409EFF;
          letter-spacing: 0;
          font-weight: 400;
        }
      }
    }
    .profile-left__center:nth-of-type(6) {
      margin-bottom: 0;
    }
    .profile-left__center {
      margin: 0 0 20px 26px;
      /*border: 1px solid red;*/
      display: flex;
      justify-content: flex-start;
      .profile-role {
        color: #00C398;
      }
      .profile-email {
        color: #0093F8;
      }
      .profile-mobile {
        color: #EC7F66;
      }
      .profile-laiyuan {
        color: #8871DB;
      }
      .profile-left__center-title {
        margin-left: 8px;
        margin-top: 1px;
        div:nth-of-type(1) {
          padding-bottom: 5px;
          ont-family: Roboto-Regular;
          font-size: 14px;
          color: #666666;
          letter-spacing: 0;
          font-weight: 400;
        }
        div:nth-of-type(2) {
          ont-family: Roboto-Regular;
          font-size: 14px;
          color: #333333;
          letter-spacing: 0;
          font-weight: 400;
        }
      }
    }
    .profile-left__button {
      margin-left: 45px;
      .profile-left__button-footer__btn {
        margin: 0 10px;
        height: 30px;
        min-width: 74px;
        padding: 0 15px;
        border-radius: 4px;
      }
      .footer__btn {
        background-color: #FA901C;
        color: white;
        border: 1px solid #fff;
      }
      .footer__btns {
        background-color: #fff;
        color: #333;
        border: 1px solid #ccc;
      }
      .footer__btns:hover {
        opacity: .6;
        color: #FA901C;
        border: 1px solid #FA901C;
      }
      .footer__btn:hover {
        opacity: .6;
      }
      .is-disabled,.is-disabled:hover{
        color: #C0C4CC;
        cursor: not-allowed;
        background-image: none;
        background-color: #FFF;
        border-color: #EBEEF5;
      }
    }
    .profile-left__bottom {
      width: 320px;
      margin: 0 10px 15px;
      .profile-left__bottom-title {
        width: 275px;
        margin: auto;
        padding: 0 0 30px 0;
        div:nth-of-type(1) {
          ont-family: Roboto-Regular;
          font-size: 14px;
          color: #666666;
          letter-spacing: 0;
          line-height: 25px;
          font-weight: 400;
        }
        div:nth-of-type(2) {
          ont-family: Roboto-Regular;
          font-size: 14px;
          color: #333333;
          letter-spacing: 0;
          line-height: 25px;
          font-weight: 400;
        }
      }
    }
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
</style>
