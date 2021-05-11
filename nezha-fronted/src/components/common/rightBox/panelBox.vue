<template>
  <transition name="right-box-580">
    <div class="right-box right-box-panel z-top" v-if="rightBox.show" v-clickoutside="{obj:panel,func:clickos}">
      <!-- begin--标题-->
      <div class="right-box-title right-box__header">{{rightBox.title}}</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <div class="right-box-form-box right-box__container">
        <el-form class="right-box-form right-box-form-left" label-width="120px"  :model="panel" label-position = "top" ref="panelForm">
          <el-form-item :label='$t("overall.name")' prop="name" :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}">
            <el-input placeholder="" maxlength="64" show-word-limit v-model="panel.name" size="small" id="panel-box-input-name"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <!-- end--表单-->

      <!-- begin--底部按钮-->
      <div class="right-box__footer">
        <button v-cancel="{obj:panel,func:esc}" id="panel-box-esc" class="footer__btn footer__btn--light">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save" class="footer__btn" id="panel-box-save">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>
      <!-- end--底部按钮-->

    </div>
  </transition>
</template>
<script>
export default {
  name: 'panelBox',
  props: {
    panel: Object
  },
  data () {
    return {
      rightBox: { // 面板弹出框相关
        show: false,
        title: this.$t('dashboard.panel.createPanelTitle')
      }
    }
  },
  methods: {
    show (show) {
      this.rightBox.show = show
    },
    setTitle (title) {
      this.rightBox.title = title
    },
    clickos () {
      this.esc()
    },
    // 面板相关方法
    del: function (u) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('visual/panel?ids=' + u.id).then(response => {
          if (response.code === 200) {
            this.esc()
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.$emit('reloadForDel')
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    save: function () {
      this.$refs.panelForm.validate((valid) => {
        if (valid) {
          this.prevent_opt.save = true
          if (this.panel.id) {
            this.$put('visual/panel', this.panel).then(response => {
              if (response.code === 200) {
                this.esc()
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.$emit('reload')
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          } else {
            this.$post('visual/panel', this.panel).then(response => {
              if (response.code === 200) {
                this.esc()
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.$emit('reload', this.panel.name)
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          }
        } else {
          return false
        }
      })
    },
    esc: function () {
      this.rightBox.show = false
    }
  },
  created () {

  },
  mounted: function () {

  },
  watch: {

  }
}
</script>

<style scoped>
  .z-top{
    z-index: 3000 !important;
  }
</style>
