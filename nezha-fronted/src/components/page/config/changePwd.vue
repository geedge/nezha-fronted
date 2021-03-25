<template>
  <div>
    <el-dialog class="nz-dialog" :title="$t('overall.changePwd')" :visible.sync="visible"  @open="dialogOpened"  :modal-append-to-body='false' @closed="dialogClosed" width="600px" :show-close="false" >
      <el-form :model="user" label-position = "top" label-width="150px" :rules="rules" ref="changePwdForm" size="mini">
        <el-form-item :label="$t('config.account.account')" prop="username" v-show="curUser != sysUser">
          <el-input type="text" autocomplete="false" v-model="user.username" disabled id="change-pwd-username"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.account.oldPwd')" prop="pwd">
          <el-input type="password" autocomplete="false" :show-password="true" v-model="user.pwd" maxlength="20" :placeholder="$t('config.account.inputOldPwd')" id="change-pwd-pwd"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.account.newPwd')" prop="newPwd">
          <el-input type="password" autocomplete="false" :show-password="true" v-model="user.newPwd" maxlength="20" :placeholder="$t('config.account.inputNewPwd')" id="change-pwd-newPwd"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.account.confirmPwd')" prop="confirmPwd">
          <el-input type="password" autocomplete="false"  :show-password="true" v-model="user.confirmPwd" maxlength="20" :placeholder="$t('config.account.inputConfirmPwd')" id="change-pwd-confirmPwd"></el-input>
        </el-form-item>
      </el-form>
      <!--底部按钮-->
      <template slot="footer">
        <div class="right-box-bottom-btns" >
          <button @click="close" id="change-pwd-esc"
                  class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
            <span>{{$t('overall.cancel')}}</span>
          </button>
          <button  @click="changePwd" id="change-pwd-save"
                   class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new">
            <span>{{$t('overall.save')}}</span>
          </button>
        </div>
      </template>

    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'changePwd',
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
        callback(new Error(temp.$t('config.account.invalidPwd')))
      }
    }
    const validateConfirmPass = (rule, value, callback) => {
      if (value && value != '' && value == temp.user.newPwd) {
        callback()
      } else {
        callback(new Error(temp.$t('config.account.confirmPwdErr')))
      }
    }
    return {
      user: {
        username: '',
        pwd: '',
        newPwd: '',
        confirmPwd: ''
      },
      sysUser: sessionStorage.getItem('nz-username'),
      rules: {
        pwd: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        newPwd: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: validatePass, trigger: 'blur' }],
        confirmPwd: [{ required: true, message: this.$t('config.account.reinputPwd'), trigger: 'blur' }, { validator: validateConfirmPass, trigger: 'blur' }]
      },
      visible: false
    }
  },
  created () {
    this.user.username = this.curUser && this.curUser != '' ? this.curUser : sessionStorage.getItem('nz-username')
  },
  methods: {
    dialogOpened: function () {
      if (this.$refs.changePwdForm) {
        this.$refs.changePwdForm.resetFields()
      }
    },
    dialogClosed: function () {
      this.$emit('dialogClosed')
    },
    close: function () {
      this.visible = false
    },
    changePwd: function () {
      this.$refs.changePwdForm.validate((valid) => {
        if (valid) {
          const paramObj = {
            pin: this.user.pwd,
            newPin: this.user.newPwd
          }
          this.$get('/sys/user/password?pin=' + paramObj.pin + '&newPin=' + paramObj.newPin).then(response => {
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
