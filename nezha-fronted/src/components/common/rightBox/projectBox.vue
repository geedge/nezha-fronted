<template>
  <div class="right-box right-box-project" v-clickoutside="{obj:editProject,func:clickOutside}">
    <div class="right-box__header">
      <!-- begin--标题-->
      <div class="header__title">{{editProject.id ? $t("project.project.editProject") : $t("overall.createProject")}}</div>
      <!-- end--标题-->

      <div class="header__operation">
        <span v-cancel="{obj: editProject, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <div class="right-box__container right-box-container__left">
      <div class="container__form">
        <el-form ref="projectForm" :model="editProject" :rules="rules" label-position = "top" label-width="120px">
          <el-form-item :label='$t("overall.name")' prop="name">
            <el-input id="project-box-input-name" v-model.trim="editProject.name" maxlength="64" show-word-limit size="small"></el-input>
          </el-form-item>
          <el-form-item :label='$t("overall.remark")'>
            <el-input id="project-box-input-remark" v-model="editProject.remark" maxlength="256" show-word-limit type="textarea" size="small" :rows="2"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!--底部按钮-->
    <div class="right-box__footer">
      <button v-cancel="{obj:editProject,func:esc}" id="project-esc" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button :class="{'nz-btn-disabled':prevent_opt.save}" v-has="'project_add'" :disabled="prevent_opt.save" @click="save" class="footer__btn" id="project-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>
<script>
import editRigthBox from '../mixin/editRigthBox'
import { noSpecialChar } from '../../common/js/validate'
export default {
  name: 'projectBox',
  props: {
    project: Object
  },
  mixins: [editRigthBox],
  data () {
    return {
      editProject: {},
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: noSpecialChar, trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },

    /* 关闭弹框 */
    esc (refresh) {
      this.$emit('close', refresh)
    },

    /* 保存 */
    save () {
      this.$refs.projectForm.validate((valid) => {
        if (valid) {
          this.prevent_opt.save = true
          if (this.editProject.id) {
            this.$put('monitor/project', this.editProject).then(response => {
              if (response.code === 200) {
                // this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.messageShow(this.$t('tip.saveSuccess'), '/module', { projectId: response.data.id }, false, 'tip.module')
                this.$store.commit('projectListChange')
                this.$store.commit('setProject', this.project)
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          } else {
            this.$post('monitor/project', this.editProject).then(response => {
              if (response.code === 200) {
                this.messageShow(this.$t('tip.saveSuccess'), '/module', { projectId: response.data.id }, true, 'tip.module')
                this.$store.commit('projectListChange')
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    /* 删除 */
    del () {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('monitor/project?ids=' + this.editProject.id).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.$store.commit('projectListChange')
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    }
  },
  watch: {
    project: {
      immediate: true,
      handler (n, o) {
        this.isEdit = true
        this.editProject = JSON.parse(JSON.stringify(n))
      }
    }
  }
}
</script>
