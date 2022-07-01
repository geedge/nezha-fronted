<template>
  <div class="right-box right-box-dc" v-clickoutside="{obj:editGlobalization,func:clickOutside}">
    <!-- begin--标题-->
    <div class="right-box__header">
      <div class="header__title">{{editGlobalization.id ? ($t("config.menus.editI18n")) : $t("config.menus.createI18n")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editGlobalization, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form label-width="120px" size="small" :model="editGlobalization" label-position = "top" ref="globalizationForm">
          <el-form-item :label='$t("overall.name")' prop="name">
            <el-input placeholder="" maxlength="64" show-word-limit v-model="editGlobalization.name" size="small" id="dc-box-input-name"></el-input>
          </el-form-item>
          <el-form-item :label='$t("config.menus.code")' prop="code">
            <el-input placeholder="" maxlength="64" show-word-limit v-model="editGlobalization.code" size="small" id="dc-box-input-code"></el-input>
          </el-form-item>
          <el-form-item :label="$t('config.user.language')" prop="lang">
            <el-select id="account-input-language"
                       class="right-box__select"
                       v-model="editGlobalization.lang"
                       placeholder=""
                       popper-class="right-box-select-top right-public-box-dropdown-top prevent-clickoutside"
                       size="small">
              <template v-for="item in languageList">
                <el-option :key="item.id" :label="item.name" :value="item.value"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <el-form-item :label='$t("overall.value")' prop="value">
            <el-input placeholder="" maxlength="128" show-word-limit v-model="editGlobalization.value" size="small" id="dc-box-input-value"></el-input>
          </el-form-item>
         <el-form-item :label='$t("overall.remark")' prop="remark">
          <el-input placeholder="" maxlength="256" type="textarea" show-word-limit v-model="editGlobalization.remark" size="small" :rows="2" id="dc-box-input-value"></el-input>
         </el-form-item>
        </el-form>
      </div>
    </div>
    <!--底部按钮-->
    <div class="right-box__footer">
      <button v-cancel="{obj:editGlobalization,func:esc}" id="dc-box-esc" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save" class="footer__btn" id="dc-box-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>

  </div>
</template>

<script>
import editRigthBox from '@/components/common/mixin/editRigthBox'
export default {
  name: 'globalizationBox',
  props: {
    obj: {
      type: Object
    },
    globalizationData: Array
  },
  mixins: [editRigthBox],
  data () {
    return {
      editGlobalization: {},
      areaData: [],
      coordinateFlag: false,
      languageList: []
    }
  },
  methods: {
    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    clickOutside () {
      this.esc(false)
    },
    /* 保存 */
    save () {
      if (this.prevent_opt.save) {
        return
      };
      this.prevent_opt.save = true
      this.$refs.globalizationForm.validate((valid) => {
        if (valid) {
          if (this.editGlobalization.id) {
            const param = { ...this.editGlobalization }
            this.$put('/sys/i18n', param).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          } else {
            const param = { ...this.editGlobalization }
            this.$post('/sys/i18n', param).then(response => {
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
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('/sys/i18n' + this.editGlobalization.id).then(response => {
          this.prevent_opt.save = false
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {
        this.prevent_opt.save = false
      })
    },
    langDataList () {
      this.$get('/sys/dict/all', { type: 'lang' }).then(response => {
        if (response.code === 200) {
          this.languageList = response.data
        } else {
          this.$message.error(response.msg)
        }
      })
    }
  },
  mounted () {
    this.langDataList()
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n, o) {
        this.isEdit = true
        this.editGlobalization = JSON.parse(JSON.stringify(n))
      }
    }
  }
}
</script>
