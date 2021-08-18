<template>
  <div class="profile-change__Pin">
    <div class="profile-change__Pin-from">
      <el-form :model="user" label-position = "top" label-width="150px" :rules="rules" ref="changePinForm">
        <!--      <el-form-item :label="$t('config.user.account')" prop="username" v-show="curUser != sysUser">-->
        <!--        <el-input type="text" autocomplete="false" v-model="user.username" disabled id="change-pin-username"></el-input>-->
        <!--      </el-form-item>-->
        <!--      <el-form-item :label="$t('config.user.oldPin')" prop="pin">-->
        <!--        <el-input type="password" autocomplete="false" :show-password="true" v-model="user.pin" maxlength="20" :placeholder="$t('config.user.inputOldPin')" id="change-pin-pin"></el-input>-->
        <!--      </el-form-item>-->
        <!--      <el-form-item :label="$t('config.user.newPin')" prop="newPin">-->
        <!--        <el-input type="password" autocomplete="false" :show-password="true" v-model="user.newPin" maxlength="20" :placeholder="$t('config.user.inputNewPin')" id="change-pin-newPin"></el-input>-->
        <!--      </el-form-item>-->
        <!--      <el-form-item :label="$t('config.user.confirmPin')" prop="confirmPin">-->
        <!--        <el-input type="password" autocomplete="false"  :show-password="true" v-model="user.confirmPin" maxlength="20" :placeholder="$t('config.user.inputConfirmPin')" id="change-pin-confirmPin"></el-input>-->
        <!--      </el-form-item>-->
          <el-form-item class="profile-change__Pin-input" :label="$t('profile.oldPassword')" prop="pin">
            <el-input v-model="user.pin" type="password" size="small"/>
          </el-form-item>
          <el-form-item class="profile-change__Pin-input" :label="$t('profile.newPassword')" prop="newPin">
            <el-input v-model="user.newPin" type="password" size="small"/>
          </el-form-item>
          <el-form-item class="profile-change__Pin-input" :label="$t('profile.confirmPassword')" prop="confirmPin">
            <el-input v-model="user.confirmPin" type="password" size="small"/>
          </el-form-item>
      </el-form>
    </div>
    <!-- 底部按钮 -->
    <template>
      <div class="profile-change__Pin-button">
        <button @click="close" id="profile-close" class="footer__btn footer__btn--light">
          <span>{{$t('profile.close')}}</span>
        </button>
        <button @click="changePin" id="profile-update" class="footer__btn">
          <span>{{$t('profile.update')}}</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'changePin',
  props: {
    curUser: { type: String },
    showDialog: { type: Boolean, default: false }
  },
  data () {
    const temp = this
    const validatePass = (rule, value, callback) => {
      if (value && value != '') {
        callback()
      } else {
        callback(new Error(temp.$t('config.user.invalidPin')))
      }
    }
    const validateConfirmPass = (rule, value, callback) => {
      if (value && value != '' && value == temp.user.newPin) {
        callback()
      } else {
        callback(new Error(temp.$t('config.user.confirmPinErr')))
      }
    }
    return {
      user: {
        username: '',
        pin: '',
        newPin: '',
        confirmPin: ''
      },
      sysUser: sessionStorage.getItem('nz-username'),
      rules: {
        pin: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        newPin: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: validatePass, trigger: 'blur' }],
        confirmPin: [{ required: true, message: this.$t('config.user.reinputPin'), trigger: 'blur' }, { validator: validateConfirmPass, trigger: 'blur' }]
      },
      visible: false
    }
  },
  created () {
    this.user.username = this.curUser && this.curUser != '' ? this.curUser : sessionStorage.getItem('nz-username')
  },
  methods: {
    dialogOpened: function () {
      if (this.$refs.changePinForm) {
        this.$refs.changePinForm.resetFields()
      }
    },
    dialogClosed: function () {
      this.$emit('dialogClosed')
    },
    close: function () {
      this.visible = false
    },
    changePin: function () {
      this.$refs.changePinForm.validate((valid) => {
        if (valid) {
          const paramObj = {
            pin: this.user.pin,
            newPin: this.user.newPin
          }
          this.$get('/sys/user/pin?oldPin=' + paramObj.pin + '&newPin=' + paramObj.newPin).then(response => {
            if (response && response.code == 200) {
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
              this.close()
            } else {
              this.$message.error(response.msg)
            }
          })
        }
      })
    }
  },
  watch: {
    showDialog: function (n, o) {
      this.visible = n
    }
  }
}
</script>

<style >
  .el-dialog__footer {
    margin-top: 30px;
    padding: 10px 20px 20px;
    text-align: right;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
</style>
<style lang="scss" scoped>
.profile-change__Pin {
  .profile-change__Pin-from {
    .profile-change__Pin-input >>> .el-form-item__label{
      padding: 0 !important;
      line-height: 32px;
      height: 32px;
    }
    .el-form-item {
      margin-bottom: 15px;
    }
  }
  .profile-change__Pin-button {
    text-align: center;
    margin-top: 40px;
    padding:  0 30px 0 15px;
    .footer__btn {
      margin: 0 10px;
      height: 30px;
      min-width: 74px;
      padding: 0 10px;
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
}
</style>
