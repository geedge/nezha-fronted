<template>
  <transition name="right-box">
    <div class="right-box right-box-project" v-if="rightBox.show">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <button type="button" v-if="project.id != ''" @click="del" class="nz-btn nz-btn-size-normal nz-btn-style-light">
          <span class="top-tool-btn-txt">{{$t('overall.delete')}}</span>
        </button>
        <button type="button" @click="save" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
          <span class="top-tool-btn-txt">{{$t('overall.save')}}</span>
        </button>
        <button type="button" @click="esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-style-square">
          <span class="top-tool-btn-txt"><i class="el-icon-close"></i></span>
        </button>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{rightBox.title}}</div>
      <!-- end--标题-->
      <el-scrollbar class="right-box-form-box">
        <el-form class="right-box-form" :model="project" label-position="top" :rules="rules" ref="projectForm">
          <el-form-item :label='$t("project.project.projectName")' prop="name">
            <el-input size="mini" maxlength="64" show-word-limit v-model="project.name"></el-input>
          </el-form-item>
          <el-form-item :label='$t("project.project.description")'>
            <el-input size="mini" type="textarea" maxlength="1024" show-word-limit v-model="project.remark"></el-input>
          </el-form-item>
        </el-form>
      </el-scrollbar>

      <!-- begin--底部按钮-->
      <!--<div class="right-box-bottom-btns">
        <div @click="esc" class="right-box-bottom-btn right-box-bottom-btn-cancel right-box-bottom-btn-50">{{$t('overall.cancel')}}</div><div @click="save" class="right-box-bottom-btn right-box-bottom-btn-50">{{project.id == '' ? $t('overall.create') : $t('overall.save')}}</div>
      </div>-->
      <!-- end--底部按钮-->
    </div>
  </transition>
</template>
<script>
  export default {
    name: "projectBox",
    props: {
      project: Object
    },
    data() {
      return {
        rightBox: {
          show: false,
          title: '',
          isCreate: false
        },
        rules: {
          name: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      show(show) {
        this.rightBox.show = show;
      },

      /*关闭弹框*/
      esc() {
        this.rightBox.show = false;
      },

      /*保存*/
      save() {
        this.$refs['projectForm'].validate((valid) => {
          if (valid) {
            if (this.project.id) {
              this.$put('project', this.project).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.rightBox.show = false;
                  this.$store.commit('projectListChange');
                  this.$store.commit('setProject', this.project);
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {
              this.$post('project', this.project).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.$store.commit('projectListChange');
                  this.rightBox.show = false;
                } else {
                  this.$message.error(response.msg);
                }
              });
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },

      /*删除*/
      del() {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("project?ids=" + this.project.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.rightBox.show = false;
              this.$store.commit('projectListChange');
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      }
    },
    watch: {
      project: {
        immediate: true,
        handler(n, o) {
          if (n && n.id) {
            this.rightBox.title = this.$t("project.project.editProject") + "  ID：" + n.id;
          } else {
            this.rightBox.title = this.$t("project.project.createProject");
          }
        }
      }
    }
  }
</script>


<style scoped>

</style>
