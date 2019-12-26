<template>
  <transition name="right-box">
    <div class="right-box right-box-project" v-if="rightBox.show">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <div class="right-box-top-btn right-box-top-btn-full" @click="esc">
          <div class="right-box-btn-icon">
            <i class="el-icon-close"></i>
          </div>
          <span>{{$t('overall.esc')}}</span>
        </div>
        <div class="right-box-top-btn right-box-top-btn-full" @click="save">
          <div class="right-box-btn-icon">
            <i class="el-icon-edit-outline"></i>
          </div>
          <span>{{$t('overall.save')}}</span>
        </div>
        <div class="right-box-top-btn" v-if="project.id != ''" @click="del">
          <div class="right-box-btn-icon">
            <i class="el-icon-delete"></i>
          </div>
          <span>{{$t('overall.delete')}}</span>
        </div>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{rightBox.title}}</div>
      <!-- end--标题-->

      <el-form :model="project" label-position="top" class="right-box-form">
        <el-form-item :label='$t("project.project.projectName")' prop="name">
          <el-input maxlength="64" show-word-limit v-model="project.name"></el-input>
        </el-form-item>
        <el-form-item :label='$t("project.project.description")' prop="remark">
          <el-input type="textarea" maxlength="1024" show-word-limit v-model="project.remark"></el-input>
        </el-form-item>
      </el-form>

      <!--&lt;!&ndash; begin&#45;&#45;表单&ndash;&gt;
      <div class="right-box-form">
        &lt;!&ndash;name&ndash;&gt;
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.project.projectName")}}</div>
          <div class="right-box-form-content">
            <el-input placeholder="" maxlength="64" show-word-limit v-model="project.name" size="small"></el-input>
          </div>
        </div>
        &lt;!&ndash;description&ndash;&gt;
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.project.description")}}</div>
          <div class="right-box-form-content">
            <el-input type="textarea" placeholder="" maxlength="1024" show-word-limit v-model="project.remark" size="small"></el-input>
          </div>
        </div>
      </div>-->

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
        if (this.project.id) {
          this.$put('project', this.project).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
              this.$emit("reload");
              this.rightBox.show = false;
            } else {
              this.$message.error(response.msg);
            }
          });
        } else {
          this.$post('project', this.project).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
              this.$emit("reload");
              this.rightBox.show = false;
            } else {
              this.$message.error(response.msg);
            }
          });
        }
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
              this.$emit("reload");
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
