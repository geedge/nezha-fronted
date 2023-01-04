<template>
  <div class="profile-change">
    <div class="profile-change__Pin">
      <div class="profile-change__Pin-from">
        <el-form :model="user" label-position = "top" label-width="150px" :rules="rules" ref="changePinForm">
          <el-form-item class="profile-change__Pin-input" :label="$t('profile.oldPassword')" prop="pin">
            <el-input v-model="user.oldPin" type="password" auto-complete="new-password"  size="small"/>
          </el-form-item>
          <el-form-item class="profile-change__Pin-input" :label="$t('profile.newPassword')" prop="newPin">
            <el-input v-model="user.newPin" type="password" auto-complete="new-password"  size="small"/>
          </el-form-item>
          <el-form-item class="profile-change__Pin-input" :label="$t('profile.confirmPassword')" prop="confirmPin">
            <el-input v-model="user.confirmPin" type="password" auto-complete="new-password"  size="small"/>
          </el-form-item>
        </el-form>
      </div>
      <!-- 底部按钮 -->
      <template>
        <div class="profile-change__Pin-button">
          <button @click="clear" id="profile-close" class="footer__btn footer__btn--light">
            <span>{{$t('profile.clear')}}</span>
          </button>
          <button @click="changePin" id="profile-update" class="footer__btn">
            <span>{{$t('profile.update')}}</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'changePin',
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
        callback(new Error(temp.$t('profile.confirmPasswordError')))
      }
    }
    return {
      user: {
        oldPin: '',
        newPin: '',
        confirmPin: ''
      },
      rules: {
        oldPin: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        newPin: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: validatePass, trigger: 'blur' }],
        confirmPin: [{ required: true, message: this.$t('config.user.reinputPin'), trigger: 'blur' }, { validator: validateConfirmPass, trigger: 'blur' }]
      },
      visible: false
    }
  },
  created () {},
  methods: {
    dialogOpened: function () {
      if (this.$refs.changePinForm) {
        this.$refs.changePinForm.resetFields()
      }
    },
    dialogClosed: function () {
      this.$emit('dialogClosed')
    },
    clear: function () {
      this.user = {}
    },
    changePin: function () {
      this.$refs.changePinForm.validate((valid) => {
        if (valid) {
          const paramObj = {
            oldPin: this.user.oldPin,
            newPin: this.user.newPin
          }
          this.$put('/sys/user/pin', paramObj).then(response => {
            if (response && response.code == 200) {
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
              this.user.oldPin = ''
              this.user.newPin = ''
              this.user.confirmPin = ''
            } else {
              this.$message.error(response.msg)
            }
          })
        }
      })
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
