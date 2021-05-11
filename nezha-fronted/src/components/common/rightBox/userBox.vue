<template>
  <div v-clickoutside="{obj:editUser,func:clickOutside}" class="right-box right-box-account">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button v-if="editUser.id&&editUser.id!==1" id="account-edit-del" v-has="'account_delete'" class="nz-btn nz-btn-size-normal nz-btn-size-alien"
              type="button"
              @click="del">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editUser.id ? ($t("config.account.editAccount")) : $t("config.account.createAccount")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box-form-box">
      <el-form ref="accountForm" :model="editUser" :rules="editUser.id ? rules2 : rules" class="right-box-form right-box-form-left" label-position = "top" label-width="120px">
        <!--username-->
        <el-form-item :label="$t('config.account.account')" prop="username">
          <el-input id="account-input-username" v-model="editUser.username" :disabled="editUser.username==='admin' && editUser.id==1" autocomplete="new-password"
                    maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
        </el-form-item>
        <!--password-->
        <el-form-item :label="$t('config.account.pin')" prop="pin">
          <el-input id="account-input-password" v-model="editUser.pin" autocomplete="new-password" maxlength="16" placeholder=""
                    show-word-limit size="small" type="password" @blur="pinBlur"></el-input>
        </el-form-item>
        <!--pinChange-->
        <el-form-item :label="$t('config.account.confirmPin')" label-width="200px" prop="pinChange">
          <el-input id="account-input-pinChange" v-model="editUser.pinChange" autocomplete="new-password" maxlength="16" placeholder=""
                    show-word-limit size="small" type="password"></el-input>
        </el-form-item>
        <!--email-->
        <el-form-item label="E-mail" prop="email">
          <el-input id="account-input-email" v-model="editUser.email" placeholder="" size="small" type="text"></el-input>
        </el-form-item>
        <!--enable-->
        <el-form-item :label="$t('config.account.enable')">
          <el-switch id="account-input-status" v-model="editUser.status" :disabled="isCurrentUser(editUser.username) || (editUser.username==='admin' && editUser.id==1) " active-color="#ee9d3f" active-value="1"
                     inactive-value="0">
          </el-switch>
        </el-form-item>
        <!--roles-->
        <el-form-item :label="$t('config.account.roles')" prop="roleIds">
          <el-select id="account-input-roleIds" v-model="editUser.roleIds" :disabled="(editUser.username==='admin') && editUser.id==1" clearable collapse-tags placeholder="" popper-class="config-dropdown" size="small" @change="()=>{this.$forceUpdate()}">
            <template v-for="role in roles">
              <el-option :key="role.id" :label="role.i18n?$t(role.i18n):role.name" :value="role.id"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item v-if="editUser.id" :label="$t('config.account.createTime')">
          <div class="right-box-form-content-txt">{{editUser.createTime}}</div>
        </el-form-item>

        <div class="right-box-sub-title">{{$t('config.account.notification')}}
          <button id="add-notification" :disabled="addDisabled" class="float-right" type="button" @click="addNotification">
            <span><i class="nz-icon nz-icon-create-square"></i></span>
          </button>
        </div>

        <div class="right-box-line"></div>
        <div id="account-input-box">
          <el-form-item v-for="(notification, index) in editUser.notifications" :key="index" class="notification-item">
            <el-select v-model="notification.scriptId" placeholder="" popper-class="no-style-class" size="small" style="display: inline-block;width: 100px;margin-left: 15px">
              <el-option v-for="(item, i) in selectableScripts" :key="i" :disabled="item.disabled" :label="item.name" :value="item.id"></el-option>
            </el-select>
            <el-input v-model="notification.account" placeholder="" size="small" style="width: calc(100% - 157px);"></el-input>
            <span style="padding-left: 5px;" @click="removeNotification(index)"><i class="nz-icon nz-icon-shanchu1"></i></span>
          </el-form-item>
        </div>
      </el-form>
    </div>
    <!-- end--表单-->
    <!--底部按钮-->
    <div class="right-box__footer">
      <button id="account-esc" v-cancel="{obj:editUser,func:esc}"
              class="footer__btn">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="account-save" :class="{'nz-btn-disabled':prevent_opt.save}"
              :disabled="prevent_opt.save"
              class="footer__btn" @click="save"
      >
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'accountBox',
  props: {
    obj: Object
  },
  computed: {
    isCurrentUser () {
      return function (username) {
        return localStorage.getItem('nz-username') == username
      }
    },
    addDisabled () {
      const enabled = this.selectableScripts.filter(item => {
        return !item.disabled
      })
      return enabled.length === 0
    }
  },
  data () {
    const validatepin = (rule, value, callback) => { // 确认密码的二次校验
      if (value === '' && this.editUser.pin) {
        callback(new Error(this.$t('config.account.inputConfirmPin')))
      } else if (value !== this.editUser.pin) {
        callback(new Error(this.$t('config.account.confirmPinErr')))
      } else {
        callback()
      }
    }
    return {
      scriptIds: [],
      rules: { // 表单校验规则
        username: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        pin: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        pinChange: [
          { validator: validatepin, trigger: 'blur' },
          { required: true, message: '', trigger: 'blur' }
        ],
        roleIds: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: this.$t('validate.email') }
        ]
      },
      rules2: { // 表单校验规则
        username: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        pinChange: [
          { validator: validatepin, trigger: 'blur' }
        ],
        roleIds: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: this.$t('validate.email') }
        ]
      },
      editUser: {},
      scripts: [],
      selectableScripts: [],
      pinChange: '',
      roles: []
    }
  },
  methods: {
    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      console.log('cancel function ')
      this.$emit('close', refresh)
    },
    clickOutside () {
      this.esc(false)
    },
    /* 保存 */
    save () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.$refs.accountForm.validate(valid => {
        if (valid) {
          const editUser = JSON.parse(JSON.stringify(this.editUser))
          editUser.roleIds = [editUser.roleIds]
          if (this.editUser.id) {
            this.$put('sys/user', editUser).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          } else {
            editUser.roleIds = this.roles.find(t => t.name == 'common').id
            this.$post('sys/user', editUser).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          }
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    },
    /* 删除 */
    del () {
      if (this.prevent_opt.save) { return }
      this.prevent_opt.save = true
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('sys/user?ids=' + this.editUser.id).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
        this.prevent_opt.save = false
      }).catch(() => {
        this.prevent_opt.save = false
      })
    },
    /* 密码失去焦点 检验确认密码 */
    pinBlur () {
      if (this.editUser.pin && this.editUser.pinChange) {
        this.$refs.accountForm.validateField('pinChange')
      }
    },
    getScripts () {
      this.$get('/alert/script?pageNo=1&pageSize=-1').then(response => {
        this.scripts = response.data.list
        this.getSelectableScripts()
      })
    },

    getSelectableScripts () {
      const userNotifications = this.editUser.notifications
      if (userNotifications) {
        this.selectableScripts = this.scripts.map(item => {
          const exist = this.editUser.notifications.some(n => {
            return item.id === n.scriptId
          })
          if (exist) {
            this.$set(item, 'disabled', true)
          } else {
            this.$set(item, 'disabled', false)
          }
          return item
        })
      } else {
        this.selectableScripts = this.scripts.map(item => {
          this.$set(item, 'disabled', false)
          return item
        })
      }
    },
    addNotification () {
      const scripts = this.selectableScripts.find(item => {
        return item.disabled === false
      })
      if (scripts) {
        if (!this.editUser.notifications) {
          this.editUser.notifications = []
        }
        this.editUser.notifications.push({ scriptId: scripts.id, account: '' })
      }
    },
    getRoles () {
      this.roles = []
      this.$get('sys/role?pageSize=-1').then(response => {
        if (response.code === 200) {
          this.roles = response.data.list
        } else {
          this.$message.error('load roles faild')
        }
      })
    },
    removeNotification (index) {
      this.editUser.notifications.splice(index, 1)
    }
  },
  mounted () {
    this.getScripts()
    this.getRoles()
  },
  watch: {
    // 将prop里的user转为组件内部对象
    obj: {
      immediate: true,
      deep: true,
      handler (n) {
        this.editUser = JSON.parse(JSON.stringify(n))
        this.editUser.roleIds = n.roles && n.roles.map(t => t.id)[0]
      }
    },
    'editUser.notifications': {
      deep: true,
      immediate: true,
      handler (n) {
        this.getSelectableScripts()
      }
    }
  }
}
</script>
<style lang="scss">
@import '@/assets/css/common/rightBoxCommon.scss';
  .right-box-account {
    .right-box-sub-title {
      #add-notification {
        border: none;
        outline: none;
        cursor: pointer;

        i {
          font-size: 17px;
          background-color: #f6f6f6;
        }
      }
    }
  }

  .notification-item {
    .el-select {
      width: 100px;

    }
  }
</style>
<style scoped>
  .form-item-title{
    position: absolute;
    left: -120px;
  }
</style>
