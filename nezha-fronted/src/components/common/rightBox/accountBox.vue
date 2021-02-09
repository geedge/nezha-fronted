<template>
  <div class="right-box right-box-account" v-clickoutside="{obj:editUser,func:clickOutside}">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button @click="del" type="button" v-has="'account_delete'" v-if="editUser.userId&&editUser.userId!==1"
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
    <div class="right-box-form-box">
      <el-form :model="editUser" :rules="editUser.userId ? rules2 : rules" class="right-box-form right-box-form-left" label-position = "top" label-width="120px" ref="accountForm">
        <!--username-->
        <el-form-item :label="$t('config.account.account')" prop="username">
          <el-input autocomplete="new-password" type="text" placeholder="" id="account-input-username"
                    v-model="editUser.username" maxlength="64" show-word-limit size="small" :disabled="editUser.username==='admin' && editUser.userId==1"></el-input>
        </el-form-item>
        <!--password-->
        <el-form-item :label="$t('config.account.password')" prop="password">
          <el-input autocomplete="new-password" type="password" placeholder="" v-model="editUser.password" id="account-input-password"
                    maxlength="16" show-word-limit size="small" @blur="passwordBlur"></el-input>
        </el-form-item>
        <!--passwordChange-->
        <el-form-item :label="$t('config.account.confirmPwd')" label-width="200px" prop="passwordChange">
          <el-input autocomplete="new-password" type="password" placeholder="" v-model="editUser.passwordChange" id="account-input-passwordChange"
                    maxlength="16" show-word-limit size="small"></el-input>
        </el-form-item>
        <!--email-->
        <el-form-item label="E-mail" prop="email">
          <el-input type="text" placeholder="" v-model="editUser.email" size="small" id="account-input-email"></el-input>
        </el-form-item>
        <!--enable-->
        <el-form-item :label="$t('config.account.enable')">
          <el-switch v-model="editUser.status" active-color="#ee9d3f" :disabled="isCurrentUser(editUser.username) || (editUser.username==='admin' && editUser.userId==1) " active-value="1" id="account-input-status"
                     inactive-value="0">
          </el-switch>
        </el-form-item>
        <!--roles-->
        <el-form-item :label="$t('config.account.roles')" prop="roleIds">
          <el-select @change="()=>{this.$forceUpdate()}" clearable collapse-tags placeholder="" popper-class="config-dropdown" size="small" v-model="editUser.roleIds" :disabled="(editUser.username==='admin') && editUser.userId==1" id="account-input-roleIds">
            <template v-for="role in roles">
              <el-option :label="role.i18n?$t(role.i18n):role.name" :value="role.id"></el-option>
            </template>
          </el-select>
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
        <div id="account-input-box">
          <el-form-item v-for="(notification, index) in editUser.notifications" :key="index" class="notification-item">
            <el-select placeholder="" popper-class="no-style-class" size="small" v-model="notification.scriptId" style="display: inline-block;width: 100px;margin-left: 15px">
              <el-option v-for="(item, i) in selectableScripts" :label="item.name" :key="i" :value="item.id" :disabled="item.disabled"></el-option>
            </el-select>
            <el-input placeholder="" v-model="notification.account" size="small" style="width: calc(100% - 157px);"></el-input>
            <span @click="removeNotification(index)" style="padding-left: 5px;"><i class="nz-icon nz-icon-shanchu1"></i></span>
          </el-form-item>
        </div>
      </el-form>
    </div>
    <!-- end--表单-->
    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button id="account-esc" v-cancel="{obj:editUser,func:esc}"
              class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" id="account-save"
              class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new"
              :disabled="prevent_opt.save" :class="{'nz-btn-disabled':prevent_opt.save}"
      >
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>
<script>
  export default {
    name: "accountBox",
    props: {
      user: Object,
      roles:Array
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
    created() {
      this.getRoles();
    },
    data() {
      let validatePassword = (rule, value, callback) => { // 确认密码的二次校验
        if(value === '' && this.editUser.password){
          callback(new Error(this.$t('config.account.inputConfirmPwd')));
        }else if (value !== this.editUser.password) {
          callback(new Error(this.$t('config.account.confirmPwdErr')));
        } else {
          callback();
        }
      };
      return {
        scriptIds: [],
        rules: { //表单校验规则
          username: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          password: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          passwordChange: [
            { validator: validatePassword, trigger: 'blur' },
            {required: true, message: '', trigger: 'blur'},
          ],
          roleIds: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          email: [
            {type: 'email', message: this.$t('validate.email')}
          ]
        },
        rules2: { //表单校验规则
          username: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          passwordChange: [
            { validator: validatePassword, trigger: 'blur' },
          ],
          roleIds: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          email: [
            {type: 'email', message: this.$t('validate.email')}
          ]
        },
        editUser: {},
        scripts: [],
        selectableScripts: [],
        roles:[],
        passwordChange:'',
      }
    },
    methods: {
      /*关闭弹框*/
      esc(refresh) {
        this.prevent_opt.save=false;
        console.log('cancel function ')
        this.$emit("close", refresh);
      },
      clickOutside() {
        this.esc(false);
      },
      /*保存*/
      save() {
        if(this.prevent_opt.save){ return } ;
        this.prevent_opt.save=true;
        this.$refs.accountForm.validate(valid => {
          if (valid) {
            let editUser = JSON.parse(JSON.stringify(this.editUser))
            editUser.roleIds = [editUser.roleIds]
            if (this.editUser.userId) {
              this.$put('sys/user/update',editUser).then(response => {
                this.prevent_opt.save=false;
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {
              this.$post('sys/user/save', editUser).then(response => {
                this.prevent_opt.save=false;
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
              });
            }
          } else {
            this.prevent_opt.save=false;
            return false;
          }
        })
      },
      /*删除*/
      del() {
        if(this.prevent_opt.save){ return }
        this.prevent_opt.save=true;
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
          this.prevent_opt.save=false;
        }).catch(()=>{
          this.prevent_opt.save=false;
        });
      },
      /*密码失去焦点 检验确认密码*/
      passwordBlur(){
        if(this.editUser.password&&this.editUser.passwordChange){
          this.$refs.accountForm.validateField('passwordChange')
        }
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
          this.editUser.roleIds=n.roles&&n.roles.map(t=>t.id)[0]
        }
      },
      "editUser.notifications": {
        deep: true,
        immediate: true,
        handler(n) {
          this.getSelectableScripts();
        }
      },
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
<style scoped>
  .form-item-title{
    position: absolute;
    left: -120px;
  }
</style>
