<template>
  <div class="right-box right-box-account" v-clickoutside="clickOutside">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns">
      <button type="button" v-if="editUser.userId" @click="del"
              class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light"
              id="account-edit-del">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editUser.userId ? ($t("config.account.editAccount") + "  ID：" + editUser.userId) : $t("config.account.createAccount")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <el-scrollbar class="right-box-form-box">
      <el-form class="right-box-form" :model="editUser" label-position="top" :rules="rules" ref="accountForm">
        <!--username-->
        <el-form-item :label="$t('config.account.account')" prop="username">
          <el-input autocomplete="new-password" type="text" placeholder=""
                    v-model="editUser.username" maxlength="64" show-word-limit size="small"></el-input>
        </el-form-item>
        <!--password-->
        <el-form-item :label="$t('config.account.password')" prop="password" v-if="!editUser.userId">
          <el-input autocomplete="new-password" type="password" placeholder="" v-model="editUser.password"
                    maxlength="16" show-word-limit size="small"></el-input>
        </el-form-item>
        <!--email-->
        <el-form-item label="E-mail" prop="email">
          <el-input type="text" placeholder="" v-model="editUser.email" size="small"></el-input>
        </el-form-item>
        <!--enable-->
        <el-form-item :label="$t('config.account.enable')">
          <el-switch v-model="editUser.status" active-color="#ee9d3f" :disabled="isCurrentUser(editUser.username)" active-value="1"
                     inactive-value="0">
          </el-switch>
        </el-form-item>
        <el-form-item :label="$t('config.account.createTime')" v-if="editUser.userId">
          <div class="right-box-form-content-txt">{{editUser.createTime}}</div>
        </el-form-item>
      </el-form>
    </el-scrollbar>
    <!-- end--表单-->
    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button @click="esc" id="account-esc"
              class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" id="account-save"
              class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>
<script>
  export default {
    name: "accountBox",
    props: {
      user: Object
    },
    computed: {
      isCurrentUser() {
        return function(username) {
          return localStorage.getItem('nz-username') == username;
        }
      }
    },
    data() {
      return {
        rules: { //表单校验规则
          username: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          password: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          email: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'},
            {type: 'email', message: this.$t('validate.email')}
          ]
        },
        editUser: {}
      }
    },
    methods: {
      /*关闭弹框*/
      esc(refresh) {
        this.$emit("close", refresh);
      },
      clickOutside() {
        this.esc(false);
      },
      /*保存*/
      save() {
        this.$refs.accountForm.validate(valid => {
          if (valid) {
            if (this.editUser.userId) {
              this.$put('sys/user/update', this.editUser).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {
              this.$post('sys/user/save', this.editUser).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
              });
            }
          } else {
            return false;
          }
        })
      },
      /*删除*/
      del() {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("sys/user/delete?userIds=" + this.editUser.userId).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.esc(true);
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },
    },
    watch: {
      //将prop里的user转为组件内部对象
      user: {
        immediate: true,
        deep: true,
        handler(n) {
          this.editUser = JSON.parse(JSON.stringify(n));
        }
      }
    },
  }
</script>
