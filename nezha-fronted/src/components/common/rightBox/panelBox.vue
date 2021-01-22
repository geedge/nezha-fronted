<template key="panelBox">
  <transition name="right-box-580">
    <div class="right-box right-box-panel z-top" v-if="rightBox.show" v-clickoutside="{obj:panel,func:clickos}">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns right-box-form-delete">
        <button @click="del(panel)" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-min-width-82" type="button" v-has="'panel_delete'" v-if="panel.id != ''">
          <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
        </button>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{rightBox.title}}</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <div class="right-box-form-box">
        <el-form class="right-box-form right-box-form-left" label-width="120px"  :model="panel" label-position="right" ref="panelForm">
          <el-form-item :label='$t("overall.name")' prop="name" :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}">
            <el-input placeholder="" maxlength="64" show-word-limit v-model="panel.name" size="small" ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <!-- end--表单-->

      <!-- begin--底部按钮-->
      <div class="right-box-bottom-btns">
        <button v-cancel="{obj:panel,func:esc}" id="module-box-esc" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" id="module-box-save">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>
      <!-- end--底部按钮-->

    </div>
  </transition>
</template>
<script>
  export default {
    name: "panelBox",
    props: {
      panel: Object
    },
    data() {
      return {
        rightBox: { //面板弹出框相关
          show: false,
          title: this.$t('dashboard.panel.createPanelTitle')
        },
      }
    },
    methods: {
      show(show) {
        this.rightBox.show = show;
      },
      setTitle(title) {
        this.rightBox.title = title;
      },
      clickos() {
        this.esc();
      },
      //面板相关方法
      del: function(u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("panel?ids=" + u.id).then(response => {
            if (response.code === 200) {
              this.esc();
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.$emit("reloadForDel");
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      save: function() {
        this.$refs.panelForm.validate((valid) => {
          if (valid) {
            this.prevent_opt.save=true;
            if (this.panel.id) {
              this.$put('panel', this.panel).then(response => {
                if (response.code === 200) {
                  this.esc();
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.$emit("reload");
                } else {
                  this.$message.error(response.msg);
                }
                this.prevent_opt.save=false;
              });
            } else {
              this.$post('panel', this.panel).then(response => {
                if (response.code === 200) {
                  this.esc();
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.$emit("reload", this.panel.name);
                } else {
                  this.$message.error(response.msg);
                }
                this.prevent_opt.save=false;
              });
            }
          } else {
            return false;
          }
        });
      },
      esc: function() {
        this.rightBox.show = false;
      },
    },
    created() {

    },
    mounted: function() {

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
