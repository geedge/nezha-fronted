<template>
  <transition name="right-box-580">
    <div class="right-box right-box-asset-meta" v-clickoutside="{obj:editMetaGroup,func:clickOutside}">
      <!-- begin--标题-->
      <div class="right-box__header">
        <div class="header__title">{{editMetaGroup.id ? $t("config.assetMeta.editGroup") : $t("config.assetMeta.addGroup")}}
        </div>
        <div class="header__operation">
          <span v-cancel="{obj: editMetaGroup, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
        </div>
      </div>
      <!-- begin--表单-->
      <div class="right-box__container">
        <div class="container__form">
          <el-form label-width="120px"  :model="editMetaGroup" label-position = "top" ref="editMetaGroupForm">
            <el-form-item :label='$t("overall.name")' prop="name" :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}">
              <el-input placeholder="" maxlength="64" show-word-limit v-model="editMetaGroup.name" size="small" id="editMetaGroup-box-input-name"></el-input>
            </el-form-item>
            <el-form-item :label='$t("overall.remark")' prop="remark">
              <el-input placeholder="" maxlength="256" type="textarea" show-word-limit v-model="editMetaGroup.remark" size="small" :rows="2" id="editMetaGroup-box-input-remark"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- end--表单-->

      <!-- begin--底部按钮-->
      <div class="right-box__footer">
        <button v-cancel="{obj:editMetaGroup,func:esc}" id="editMetaGroup-box-esc" class="footer__btn footer__btn--light">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save" class="footer__btn" id="editMetaGroup-box-save">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>
      <!-- end--底部按钮-->

    </div>
  </transition>
</template>

<script>
import editRigthBox from '../mixin/editRigthBox'
export default {
  name: 'assetMetaGroup',
  props: {
    metaGroup: {}
  },
  components: {},
  mixins: [editRigthBox],
  data () {
    return {
      editMetaGroup: {
        id: '',
        name: '',
        remark: ''
      },
      rightBox: { // 面板弹出框相关
        show: false
      }
    }
  },
  watch: {
    metaGroup: {
      immediate: true,
      handler (n) {
        this.isEdit = true
        this.editMetaGroup = { ...n }
      }
    }
  },
  mounted () {
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    save () {
      if (this.prevent_opt.save) {
        return
      }
      ;
      this.prevent_opt.save = true
      this.$refs.editMetaGroupForm.validate((valid) => {
        if (valid) {
          const params = { ...this.editMetaGroup }
          if (this.editMetaGroup.id) {
            this.$put('asset/field/group', params).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          } else {
            this.$post('asset/field/group', params).then(response => {
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
    del () {
      if (this.prevent_opt.save) {
        return
      }
      ;
      this.prevent_opt.save = true
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('/alert/silence?ids=' + this.editMetaGroup.id).then(response => {
          this.prevent_opt.save = false
          if (response.code === 200) {
            this.$message({ type: 'success', message: this.$t('tip.deleteSuccess') })
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {
        this.prevent_opt.save = false
      })
    }
  }
}
</script>
