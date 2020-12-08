<template>
  <div class="right-box right-box-account" v-clickoutside="clickOutside">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button @click="del" type="button" v-has="'account_delete'" v-if="editUser.userId"
              class="nz-btn nz-btn-size-normal nz-btn-size-alien"
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
      <el-form class="right-box-form right-box-form-left" :model="editUser" :rules="rules" ref="accountForm" label-position="right" label-width="120px">
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

        <div class="right-box-sub-title">{{$t('config.account.notification')}}
          <button @click="addNotification" id="add-notification" type="button" class="float-right" :disabled="addDisabled">
            <span><i class="nz-icon nz-icon-create-square"></i></span>
          </button>
        </div>

        <div class="right-box-line"></div>

        <el-form-item v-for="(notification, index) in editUser.notifications" :key="index" class="notification-item">
          <el-select v-model="notification.scriptId" slot="label" placeholder="" popper-class="no-style-class" size="small">
            <el-option v-for="(item, i) in selectableScripts" :label="item.name" :key="i" :value="item.id" :disabled="item.disabled"></el-option>
          </el-select>
          <el-input placeholder="" v-model="notification.account" size="small" style="width: calc(100% - 37px);"></el-input>
          <span @click="removeNotification(index)" style="padding-left: 5px;"><i class="nz-icon nz-icon-shanchu1"></i></span>
        </el-form-item>
      </el-form>
    </el-scrollbar>
    <!-- end--表单-->
    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button @click="esc" id="account-esc"
              class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" id="account-save" v-has="'account_save'"
              class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new">
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
      },
      addDisabled() {
        let enabled = this.selectableScripts.filter(item => {
          return !item.disabled
        });
        return enabled.length === 0;
      }
    },
    data() {
      return {
        scriptIds: [],
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
        editUser: {},
        scripts: [],
        selectableScripts: []
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

      getScripts() {
        this.$get("/alert/script?pageNo=1&pageSize=-1").then(response => {
          this.scripts = response.data.list;
          this.getSelectableScripts();
        });
        /*this.scripts = [
          {id: 1, name: "DOLBY"},
          {id: 2, name: "IMAX"},
          {id: 3, name: "CGS"},
          {id: 4, name: "LUXE"},
          {id: 5, name: "DST:X"},
        ];
        this.getSelectableScripts();*/
      },

      getSelectableScripts() {
        let userNotifications = this.editUser.notifications;
        if (userNotifications) {
          this.selectableScripts = this.scripts.map(item => {
            let exist = this.editUser.notifications.some(n => {
              return item.id === n.scriptId;
            });
            if (exist) {
              this.$set(item, "disabled", true);
            } else {
              this.$set(item, "disabled", false);
            }
            return item;
          });
        } else {
          this.selectableScripts = this.scripts.map(item => {
            this.$set(item, "disabled", false);
            return item;
          });
        }
      },

      addNotification() {
        let scripts = this.selectableScripts.find(item => {
          return item.disabled === false;
        });
        if (scripts) {
          if (!this.editUser.notifications) {
            this.editUser.notifications = [];
          }
          this.editUser.notifications.push({scriptId: scripts.id, account: ""});
        }
      },

      removeNotification(index) {
        this.editUser.notifications.splice(index, 1);
      }
    },
    mounted() {
      this.getScripts();
    },
    watch: {
      //将prop里的user转为组件内部对象
      user: {
        immediate: true,
        deep: true,
        handler(n) {
          this.editUser = JSON.parse(JSON.stringify(n));
        }
      },
      "editUser.notifications": {
        deep: true,
        immediate: true,
        handler(n) {
          this.getSelectableScripts();
        }
      }
    },
  }
</script>
<style lang="scss">
  .right-box-account {
    .right-box-sub-title {
      #add-notification {
        border: none;
        outline: none;
        cursor: pointer;

        i {
          font-size: 17px;
          background-color: #f6f6f6;
        }
      }
    }
  }

  .notification-item {
    .el-select {
      width: 100px;

    }
  }
</style>
