<template>
  <div v-clickoutside="{obj: editUser, func: esc}" class="right-box right-box-user">
    <div class="right-box__header">
      <div class="header__title">{{editUser.id ? $t('config.user.editUser') : $t('overall.createUser')}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editUser, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="userForm" :model="editUser" :rules="editUser.id ? rules2 : rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label="$t('config.user.name')" prop="name">
            <el-input id="account-input-name" v-model="editUser.name" :disabled="editUser.username==='admin' && editUser.id==1"
                      maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--username-->
          <el-form-item :label="$t('login.username')" prop="username">
            <el-input id="account-input-username" v-model="editUser.username" :disabled="(editUser.username==='admin' && editUser.id==1) || !!editUser.id"
                      maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--password-->
          <el-form-item :label="$t('login.pin')" prop="pin">
            <el-input id="account-input-password" v-model="editUser.pin"  maxlength="64" placeholder=""
                      show-word-limit size="small" type="password" auto-complete="new-password"  @blur="pinBlur" autocomplete="new-password"></el-input>
          </el-form-item>
          <!--pinChange-->
          <el-form-item :label="$t('profile.confirmPassword')" label-width="200px" prop="pinChange">
            <el-input id="account-input-pinChange" v-model="editUser.pinChange"  maxlength="64" placeholder=""
                      show-word-limit size="small" type="password" auto-complete="new-password" ></el-input>
          </el-form-item>
          <!--mfaLevel-->
          <el-form-item :label="$t('profile.twoFactorAuthentication')" label-width="200px" prop="mfaTitle">
            <el-select id="account-input-mfaLevel"
                       v-model="editUser.mfaLevel"
                       class="right-box__select"
                       clearable
                       collapse-tags
                       placeholder=""
                       popper-class="right-box-select-top  prevent-clickoutside"
                       size="small">
              <template v-for="item in mfaLevelList">
                <el-option :key="item.value" :label="item.label" :value="item.value"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <!--email-->
          <el-form-item :label="$t('config.system.email.email')" prop="email">
            <el-input id="account-input-email" v-model="editUser.email" maxlength="64" show-word-limit placeholder="" size="small" type="text"></el-input>
          </el-form-item>
          <!--mobile-->
          <el-form-item :label="$t('profile.mobile')" prop="mobile">
            <el-input id="account-input-mobile" v-model="editUser.mobile" maxlength="64" show-word-limit placeholder="" size="small" type="text"></el-input>
          </el-form-item>
          <!--language-->
          <el-form-item :label="$t('config.user.language')" prop="lang">
            <el-select id="account-input-language"
                       class="right-box__select"
                       v-model="editUser.lang"
                       clearable
                       collapse-tags
                       placeholder=""
                       popper-class="right-box-select-top right-public-box-dropdown-top prevent-clickoutside"
                       size="small">
              <template v-for="item in languageList">
                <el-option :key="item.value" :label="item.label" :value="item.value"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <!--roles-->
          <el-form-item :label="$t('profile.role')" prop="roleIds">
            <el-select id="account-input-roleIds"
                       v-model="editUser.roleIds"
                       :disabled="(editUser.username==='admin') && editUser.id==1"
                       class="right-box__select"
                       clearable
                       collapse-tags
                       placeholder=""
                       popper-class="right-box-select-top  prevent-clickoutside"
                       size="small"
                       @change="()=>{this.$forceUpdate()}">
              <template v-for="role in roles">
<!--                <el-option :key="role.id" :label="role.i18n?$t(role.i18n+''):role.name" :value="role.id"></el-option>-->
                <el-option :key="role.id" :label="role.name" :value="role.id"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <!--enable-->
          <el-form-item :label="$t('overall.state')">
            <el-switch id="account-input-status" v-model="editUser.status" :disabled="isCurrentUser(editUser.username) || (editUser.username==='admin' && editUser.id==1) " active-value="1"
                       inactive-value="0">
            </el-switch>
          </el-form-item>

          <el-form-item v-if="editUser.id" :label="$t('config.system.apiKey.creatAt')">
            <div class="right-box-form-content-txt">{{utcTimeToTimezoneStr(editUser.createAt)}}</div>
          </el-form-item>

        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{obj: editUser, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="asset-edit-save" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { userName } from '@/components/common/js/validate'
import editRigthBox from '../../mixin/editRigthBox'
import bus from '@/libs/bus'
export default {
  name: 'userBox',
  components: {
  },
  props: {
    obj: {
      type: Object
    }
  },
  mixins: [editRigthBox],
  computed: {
    isCurrentUser () {
      return function (username) {
        return localStorage.getItem('nz-username') == username
      }
    }
  },
  data () {
    const vm = this
    const validatePin = (rule, value, callback) => { // 确认密码的二次校验
      if (value === '' && this.editUser.pin) {
        callback(new Error(this.$t('config.user.reinputPin')))
      } else if (value !== this.editUser.pin) {
        callback(new Error(this.$t('profile.confirmPasswordError')))
      } else {
        callback()
      }
    }
    return {
      editUser: {},
      url: 'sys/user',
      rightBox: { model: { show: false } },
      rules: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        username: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: userName, trigger: 'blur' }
        ],
        pin: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        pinChange: [
          { validator: validatePin, trigger: 'blur' },
          { required: true, message: '', trigger: 'blur' }
        ],
        roleIds: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        email: [
          { type: 'email', message: this.$t('validate.email') }
        ]
      },
      rules2: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        username: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: userName, trigger: 'blur' }
        ],
        pinChange: [
          { validator: validatePin, trigger: 'blur' }
        ],
        roleIds: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        email: [
          { type: 'email', message: this.$t('validate.email') }
        ]
      },
      roles: [],
      mfaLevelList: [
        { value: 0, label: this.$t('profile.close') },
        { value: 1, label: this.$t('overall.enabled') },
        { value: 2, label: this.$t('config.user.forceEnable') }
      ],
      languageList: [
        { value: 'en', label: 'English' },
        { value: 'zh', label: '简体中文' }
      ]
    }
  },
  watch: {
    obj: {
      deep: true,
      immediate: true,
      handler (n) {
        this.isEdit = true
        this.editUser = JSON.parse(JSON.stringify(n))
        // if (this.editUser.roles && this.editUser.roles.length > 0) {
        //   this.editUser.roleIds = this.editUser.roles.map(t => t.id)
        // }
      }
    }
  },
  mounted () {
    this.getRoles()
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    /* 密码失去焦点 检验确认密码 */
    pinBlur () {
      if (this.editUser.pin && this.editUser.pinChange) {
        this.$refs.userForm.validateField('pinChange')
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
    save () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true

      this.$refs.userForm.validate((valid) => {
        if (valid) {
          if (this.editUser.id) {
            this.$put(this.url, this.editUser).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
                const userInfo = localStorage.getItem('nz-userInfo') ? JSON.parse(localStorage.getItem('nz-userInfo')) : ''
                if (userInfo.id == this.editUser.id) {
                  const obj = this.$lodash.cloneDeep(this.editUser)
                  delete obj.roles
                  delete obj.pin
                  delete obj.pinChange
                  localStorage.setItem('nz-userInfo', JSON.stringify(obj))
                  bus.$emit('login')
                }
              } else {
                this.$message.error(res.msg)
              }
            })
          } else {
            this.$post(this.url, this.editUser).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          }
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    }
  }
}
</script>
