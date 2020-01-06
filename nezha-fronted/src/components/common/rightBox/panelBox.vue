<template key="panelBox">
  <transition name="right-box">
    <div class="right-box right-box-panel z-top" v-if="rightBox.show">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <button type="button" v-if="panel.id != ''" @click="del(panel)" class="nz-btn nz-btn-size-normal nz-btn-style-light">
          <span class="top-tool-btn-txt">{{$t('overall.delete')}}</span>
        </button>
        <button type="button" @click="save" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
          <span class="top-tool-btn-txt">{{$t('overall.save')}}</span>
        </button>
        <button type="button" @click="esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-style-square">
          <span class="top-tool-btn-txt"><i class="el-icon-close"></i></span>
        </button>
        <!--
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
          <span >{{$t('overall.save')}}</span>
        </div>
        <div @click="del(panel)" class="right-box-top-btn" v-if="panel.id != ''">
          <div class="right-box-btn-icon">
            <i class="el-icon-delete"></i>
          </div>
          <span>{{$t('overall.delete')}}</span>
        </div>
        -->
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{rightBox.title}}</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <div class="right-box-form">
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t('dashboard.panel.panelForm.panelName')}}</div>
          <div class="right-box-form-content">
            <el-input placeholder="" maxlength="64" show-word-limit v-model="panel.name" size="small"></el-input>
          </div>
        </div>
      </div>
      <!-- end--表单-->

      <!-- begin--底部按钮-->
      <!--
      <div class="right-box-bottom-btns">
        <div @click="esc()" :class="{'right-box-bottom-btn-50': true}" class="right-box-bottom-btn right-box-bottom-btn-cancel">{{$t('overall.cancel')}}</div><div @click="save()"  class="right-box-bottom-btn right-box-bottom-btn-50">{{panel.id == '' ? $t('overall.create') : $t('overall.save')}}</div>
      </div>
      -->
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
        if (this.panel.id) {
          this.$put('panel', this.panel).then(response => {
            if (response.code === 200) {
              this.esc();
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
              this.$emit("reload");
            } else {
              this.$message.error(response.msg);
            }
          });
        } else {
          this.$post('panel', this.panel).then(response => {
            if (response.code === 200) {
              this.esc();
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
              this.$emit("reload");
            } else {
              this.$message.error(response.msg);
            }
          });
        }
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
    z-index: 50;
  }
</style>
