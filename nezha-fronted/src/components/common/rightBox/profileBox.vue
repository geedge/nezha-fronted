<template>
  <div v-clickoutside="{obj: editProfile, func: esc}" class="right-box right-box-profile">
    <div class="right-box__header">
      <div class="header__title">{{$t('profile.editProfile')}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editProfile, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="profileForm" :model="editProfile" :rules="rules" label-position="top" label-width="120px">
          <el-form-item :label="$t('overall.name')" prop="name">
            <el-input maxlength="64" show-word-limit v-model="editProfile.name" size="small" type="text"></el-input>
          </el-form-item>
          <el-form-item :label="$t('profile.username')" prop="username">
            <el-input maxlength="64" show-word-limit v-model="editProfile.username" disabled size="small" type="text"></el-input>
          </el-form-item>
          <el-form-item :label="$t('config.system.email.email')" prop="email">
            <el-input maxlength="64" show-word-limit v-model="editProfile.email" size="small" type="text"></el-input>
          </el-form-item>
          <el-form-item :label="$t('profile.mobile')" prop="mobile">
            <el-input maxlength="64" show-word-limit v-model="editProfile.mobile" size="small" type="text"></el-input>
          </el-form-item>
          <el-form-item :label="$t('profile.role')" v-if="editProfile.roles[0].i18n !== ''" prop="roles">
            <el-input maxlength="64" show-word-limit v-model="editProfile.roles[0].i18n" disabled size="small" type="text"></el-input>
          </el-form-item>
          <el-form-item :label="$t('profile.role')" v-else prop="roles">
            <el-input maxlength="64" show-word-limit v-model="editProfile.roles[0].name" disabled size="small" type="text"></el-input>
          </el-form-item>
          <!--language-->
          <el-form-item :label="$t('config.user.language')" prop="lang">
            <el-select id="account-input-language"
                       class="right-box__select"
                       v-model="editProfile.lang"
                       popper-class="right-box-select-top prevent-clickoutside"
                       size="small">
              <el-option v-for="item in langList" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('config.user.Theme')" prop="theme">
            <el-select id="account-input-language"
                       class="right-box__select"
                       v-model="editProfile.theme"
                       popper-class="right-box-select-top prevent-clickoutside"
                       size="small">
                <el-option v-for="item in theme" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('profile.source')" prop="source">
            <el-input maxlength="64" show-word-limit v-model="editProfile.source" disabled size="small" type="text"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{obj: editProfile, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="asset-edit-save" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import editRigthBox from '@/components/common/mixin/editRigthBox'
import { theme } from '@/components/common/js/constants'

export default {
  name: 'profilebox',
  components: {
  },
  props: {
    obj: {
      type: Object
    }
  },
  computed: {
    langList () {
      return this.$store.getters.getLangList
    }
  },
  mixins: [editRigthBox],
  data () {
    return {
      theme: theme,
      url: 'sys/user/profile',
      rightBox: { profile: { show: false } },
      editProfile: {},
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        lang: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    obj: {
      deep: true,
      immediate: true,
      handler (n) {
        this.isEdit = true
        this.editProfile = JSON.parse(JSON.stringify(n))
      }
    }
  },
  created () {},
  methods: {
    clickoutside () {
      this.esc(false)
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    save () {
      this.$refs.profileForm.validate((valid) => {
        if (valid) {
          if (this.editProfile.id) {
            this.editProfile.roleIds = this.editProfile.roles[0].id
            this.$put(this.url, this.editProfile).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                // 若主题变更，则更改主题
                const currentTheme = theme.find(t => t.value === this.editProfile.theme).label || 'light'
                const oldTheme = localStorage.getItem(`nz-user-${localStorage.getItem('nz-user-id')}-theme`)
                if (currentTheme !== oldTheme) {
                  localStorage.setItem(`nz-user-${localStorage.getItem('nz-user-id')}-theme`, currentTheme)
                  const body = document.getElementsByTagName('body')[0]
                  body.setAttribute('class', `theme-${currentTheme}`)
                }
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
                if (this.editProfile.lang !== localStorage.getItem('nz-language')) {
                  localStorage.setItem('nz-language', this.editProfile.lang)
                  this.$store.commit('setLanguage', this.editProfile.lang)
                  this.$i18n.locale = this.editProfile.lang
                  this.$emit('clickProfile', true)
                } else {
                  this.$emit('clickProfile', false)
                }
              } else {
                this.$message.error(res.msg)
              }
            })
          }
        }
      })
    }
  }
}
</script>
