<template>
  <div class="right-box right-box-project" v-clickoutside="clickOutside">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns">
      <button id="project-del" type="button" v-if="project.id" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light">
        <span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editProject.id ? $t("project.project.editProject") + "  ID：" + editProject.id : $t("overall.createProject")}}</div>
    <!-- end--标题-->
    <el-scrollbar class="right-box-form-box">
      <el-form class="right-box-form right-box-form-left" :model="editProject" label-position="right" label-width="120px" :rules="rules" ref="projectForm">
        <el-form-item :label='$t("project.project.projectName")' prop="name">
          <el-input size="mini" maxlength="64" show-word-limit v-model="editProject.name"></el-input>
        </el-form-item>
        <el-form-item :label='$t("project.project.description")'>
          <el-input size="mini" type="textarea" maxlength="1024" show-word-limit v-model="editProject.remark"></el-input>
        </el-form-item>
      </el-form>
    </el-scrollbar>

    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button @click="esc" id="project-esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" id="project-save" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>
<script>
  import {noSpecialChar} from '../../common/js/validate';
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
          isCreate: false,
          isEdit:false
        },
        editProject: {},
        rules: {
          name: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'},
            {validator:noSpecialChar,trigger: "change"}
          ]
        }
      }
    },
    methods: {
      clickOutside() {
        this.esc(false);
      },

      /*关闭弹框*/
      esc(refresh) {
        this.$emit("close", refresh);
      },

      /*保存*/
      save() {
        this.$refs['projectForm'].validate((valid) => {
          if (valid) {
            if (this.editProject.id) {
              this.$put('project', this.editProject).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.$store.commit('projectListChange');
                  this.$store.commit('setProject', this.project);
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {
              this.$post('project', this.editProject).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.$store.commit('projectListChange');
                  this.esc(true);
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
          this.$delete("project?ids=" + this.editProject.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.$store.commit('projectListChange');
              this.esc(true);
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
          this.editProject = JSON.parse(JSON.stringify(n));
        }
      }
    }
  }
</script>


<style scoped>

</style>
