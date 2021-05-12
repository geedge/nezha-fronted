<template>
  <div v-clickoutside="{obj:editPanel,func:clickOutside}" class="right-box right-box-panel">
    <!-- begin--标题-->
    <div class="right-box__header">
      <div class="header__title">{{editPanel.id ? ($t("config.dc.editPanel")) : $t("config.dc.createDc")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editPanel, func: esc}"><i class="nz-icon nz-icon-close"></i></span>
      </div>
    </div>
    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="form" :model="editPanel" :rules="rules" label-position = "top" label-width="120px" size="small">
          <el-form-item :label='$t("overall.name")' prop="name">
            <el-input id="dc-box-input-name" v-model="editPanel.name" maxlength="64" placeholder="" show-word-limit size="small"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <!--底部按钮-->
    <div class="right-box__footer">
      <button id="dc-box-esc" v-cancel="{obj:editPanel, func:esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="dc-box-save" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>

  </div>
</template>

<script>
export default {
  name: 'panelBox',
  props: {
    obj: {
      type: Object
    }
  },
  data () {
    return {
      url: '/panel',
      editPanel: {},
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      }
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
      }
      this.prevent_opt.save = true
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.editPanel.id) {
            this.$put(this.url, this.editPanel).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          } else {
            this.$post(this.url, this.editPanel).then(response => {
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
        this.$delete(`${this.url}?ids=${this.editPanel.id}`).then(response => {
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
    }
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n, o) {
        this.editPanel = JSON.parse(JSON.stringify(n))
      }
    }
  }
}
</script>
