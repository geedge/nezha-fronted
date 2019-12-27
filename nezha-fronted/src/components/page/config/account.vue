<style scoped>
  .account {
    height: 100%;
  }

  .content-right-option {
    cursor: pointer;
    display: inline-block;
    margin-right: 6px;
  }
  .content-right-option .el-icon-delete {
    color: #F98D9A;
  }
  .content-right-option .el-icon-delete:hover {
    color: #D96D7A;
  }
  .content-right-option .el-icon-view {
    color: #60BEFF;
  }
  .content-right-option .el-icon-view:hover {
    color: #409EFF;
  }

  /* begin--右弹框滑入滑出动画*/
  @keyframes slide-in-from-right {
    from {right: -800px}
    to {right: 0}
  }
  @keyframes slide-out-to-right {
    from {right: 0}
    to {right: -800px}
  }
  .right-box-enter-active {
    animation: slide-in-from-right 0.4s;
  }
  .right-box-leave-active {
    animation: slide-out-to-right 0.4s;
  }
  /* end--右弹框滑入滑出动画*/
</style>
<template>
    <div class="account">
        <div class="content-left">
            <div class="sidebar-title">Config</div>
            <div class="sidebar-info">
                <div class="sidebar-info-item sidebar-info-top sidebar-info-item-active">{{$t('config.account.account')}}</div>
                <div class="sidebar-info-item" @click="jumpTo('promServer')">{{$t('config.promServer.promServerList')}}</div>
            </div>
        </div>
        <div class="content-right">
            <div class="top-tools">
              <button type="button" @click="toAdd" class="nz-btn nz-btn-size-normal nz-btn-style-normal float-right">
                <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
              </button>
              <div class="top-tool-search float-right"><search-input :searchMsg="searchMsg" @search="search"></search-input></div>
            </div>
            <el-table
                  :data="tableData"
                  border
                  height="calc(100% - 65px)"
                  style="width: 100%;">
                <el-table-column
                  :resizable="false"
                  v-for="(item, index) in tableTitle"
                  v-if="item.show"
                  :width="item.width"
                  :key="`col-${index}`"
                  :label="item.label"
                >
                    <template slot-scope="scope" :column="item">
                        <div v-if="item.prop == 'option'" class="content-right-options">
                            <span @click="del(scope.row)" class="content-right-option"><i class="el-icon-delete"></i></span>
                            <span @click="detail(scope.row)" class="content-right-option"><i class="el-icon-view"></i></span>
                            <span @click="edit(scope.row)" class="content-right-option"><i class="el-icon-edit-outline"></i></span>
                        </div>
                        <span v-else-if="item.prop == 'lang'">
                            {{scope.row[item.prop] == 'en' ? 'English' : ''}}
                            {{scope.row[item.prop] == 'zh' ? '中文' : ''}}
                            {{scope.row[item.prop] == 'ru' ? 'русский' : ''}}
                        </span>
                        <span v-else-if="item.prop == 'receiver'">
                            <template v-for="rec in scope.row[item.prop]">{{rec.name}}&nbsp;&nbsp;</template>
                        </span>
                        <span v-else-if="item.prop == 'status'">
                            <el-switch
                              v-model="scope.row.status"
                              active-value="1"
                              inactive-value="0"
                              @change="(val)=>{statusChange(scope.row)}">
                            </el-switch>
                        </span>
                        <span v-else>{{scope.row[item.prop]}}</span>
                    </template>
                </el-table-column>
            </el-table>
            <Pagination :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
        </div>

        <transition name="right-box">
            <div class="right-box right-box-account" v-if="rightBox.show">
                <!-- begin--顶部按钮-->
                <div class="right-box-top-btns">
                    <div class="right-box-top-btn right-box-top-btn-full" @click="esc()">
                        <div class="right-box-btn-icon">
                            <i class="el-icon-close"></i>
                        </div>
                        <span>{{$t('overall.esc')}}</span>
                    </div>
                    <div class="right-box-top-btn right-box-top-btn-full" @click="saveOrToEdit">
                        <div class="right-box-btn-icon">
                            <i class="el-icon-edit-outline"></i>
                        </div>
                        <span v-if="rightBox.isEdit">{{$t('overall.save')}}</span>
                        <span v-else>{{$t('overall.edit')}}</span>
                    </div>
                    <div class="right-box-top-btn" v-if="rightBox.isEdit && user.userId != ''" @click="del(user)">
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

                <!-- begin--表单-->
                <div class="right-box-form">
                    <div class="right-box-form-row">
                        <div class="right-box-form-label">{{$t('config.account.account')}}</div>
                        <div class="right-box-form-content">
                            <el-input
                              v-if="rightBox.isEdit"
                              type="text"
                              placeholder=""
                              v-model="user.username"
                              maxlength="64"
                              show-word-limit
                              size="small"
                            ></el-input>
                            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{user.username}}</div>
                        </div>
                    </div>
                    <div class="right-box-form-row" v-if="rightBox.isEdit && !user.userId">
                        <div class="right-box-form-label">{{$t('config.account.password')}}</div>
                        <div class="right-box-form-content">
                            <el-input
                              type="text"
                              placeholder=""
                              v-model="user.password"
                              maxlength="16"
                              show-word-limit
                              size="small"
                            ></el-input>
                        </div>
                    </div>
                    <div class="right-box-form-row">
                        <div class="right-box-form-label">E-mail</div>
                        <div class="right-box-form-content">
                            <el-input
                              type="text"
                              v-if="rightBox.isEdit"
                              placeholder=""
                              v-model="user.email"
                              size="small"
                            ></el-input>
                          <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{user.email}}</div>
                        </div>
                    </div>
                    <!--<div class="right-box-form-row">
                        <div class="right-box-form-label">{{$t('config.account.receiver')}}</div>
                        <div class="right-box-form-content">
                            <el-select class="right-box-row-with-btn" value-key="id" popper-class="config-dropdown" multiple v-model="user.receiver" placeholder="" v-if="rightBox.isEdit" size="small">
                                <el-option
                                  @click.native="blurEditReceiver()"
                                  v-for="item in receiverData"
                                  :key="item.id"
                                  :label="item.name"
                                  :value="item">
                                    <span class="config-dropdown-label-txt" v-if="!item.isEdit">{{item.name}}</span>
                                    <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop>
                                        <el-input
                                          type="text"
                                          v-model="item.name"
                                          size="mini"
                                        ></el-input>
                                    </span>
                                    <span class="config-dropdown-error-message">{{item.errorMessage}}</span>
                                    <span class="config-dropdown-btn" @click.stop="toEditReceiver(item)">
                                        <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                        <i class="el-icon-check" v-if="item.isEdit"></i>
                                    </span>
                                    <span class="config-dropdown-btn config-dropdown-btn-delete" @click.stop="toDelReceiver(item)"><i class="el-icon-delete"></i></span>
                                </el-option>
                            </el-select>
                            <div class="right-box-row-btn" v-if="rightBox.isEdit">
                                <span class="el-icon-plus"></span>
                            </div>
                            <div class="right-box-form-content-txt" v-if="!rightBox.isEdit">
                                <template v-for="rec in user.receiver">{{rec.name}}</template>
                            </div>
                        </div>
                    </div>-->
                  <!--<div class="right-box-form-row">
                      <div class="right-box-form-label">{{$t('config.account.language')}}</div>
                      <div class="right-box-form-content">
                          <el-radio v-model="user.lang" label="en" :disabled="!rightBox.isEdit && user.lang != 'en'">English</el-radio>
                          <el-radio v-model="user.lang" label="zh" :disabled="!rightBox.isEdit && user.lang != 'zh'">中文</el-radio>
                          <el-radio v-model="user.lang" label="ru" disabled>русский（{{$t('config.account.notCurrentlySupport')}}）</el-radio>
                        </div>
                    </div>-->
                    <div class="right-box-form-row">
                        <div class="right-box-form-label">{{$t('config.account.enable')}}</div>
                        <div class="right-box-form-content">
                            <el-switch
                              v-model="user.status"
                              :disabled="!rightBox.isEdit"
                              active-value="1"
                              inactive-value="0">
                            </el-switch>
                        </div>
                    </div>
                    <div class="right-box-form-row" v-if="!rightBox.isEdit">
                        <div class="right-box-form-label">{{$t('config.account.createTime')}}</div>
                        <div class="right-box-form-content">
                            <div class="right-box-form-content-txt">{{user.createTime}}</div>
                        </div>
                    </div>
                </div>
                <!-- end--表单-->

                <!-- begin--底部按钮-->
                <div class="right-box-bottom-btns">
                    <div @click="esc()" :class="{'right-box-bottom-btn-50': rightBox.isEdit}" class="right-box-bottom-btn right-box-bottom-btn-cancel">{{$t('overall.cancel')}}</div><div @click="save" v-if="rightBox.isEdit" class="right-box-bottom-btn right-box-bottom-btn-50">{{user.userId == '' ? $t('overall.create') : $t('overall.save')}}</div>
                </div>
                <!-- end--底部按钮-->

            </div>
        </transition>
    </div>

</template>
<script>
export default {
  name: "account",
  data() {
    return {
      rightBox: { //弹出框相关
        show: false,
        isEdit: false, //false查看，true编辑
        title: ''
      },
      user: {
        userId: '',
        username: '',
        email: '',
        status: '1',
        createTime: '',
        receiver: [],
        lang: ''
      },
      pageObj: {
        pageNo: 1,
        pageSize: 20,
        total:0
      },
      tableTitle: [
        {
          label: 'ID',
          prop: 'userId',
          show: true,
          width: 80
        }, {
          label: this.$t("config.account.account"),
          prop: 'username',
          show: true,
        }, {
          label: 'E-mail',
          prop: 'email',
          show: true,
        }, /*{
          label: this.$t("config.account.language"),
          prop: 'lang',
          show: true,
          width: 200
        },*/ {
          label: this.$t('config.account.receiver'),
          prop: 'receiver',
          show: false,
        }, {
          label: this.$t('config.account.createTime'),
          prop: 'createTime',
          show: true,
        }, {
          label: this.$t('config.account.enable'),
          prop: 'status',
          show: true,
          width: 100
        }, {
          label: this.$t('config.account.option'),
          prop: 'option',
          show: true,
          width: 100
        }
      ],
      tableData: [],
      receiverData: [{
        id: '1',
        name: 'group1',
        description: '小组1desc'
      }, {
        id: '2',
        name: 'group2',
        description: '小组2desc'
      }, {
        id: '3',
        name: '小组3',
        description: '小组3desc'
      }, {
        id: '4',
        name: '小组4',
        description: '小组4desc'
      }, {
        id: '5',
        name: '小组啊小组5',
        description: '小组5desc'
      }, {
        id: '6',
        name: '小组6',
        description: '小组6desc'
      }],
      searchMsg: { //给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 10,
          name: this.$t('config.account.account'),
          type: 'input',
          label: 'username',
          disabled: false
        }],
      },
      searchLabel: {}, //搜索参数
    }
  },
  methods: {
    edit: function(u) {
      this.user = Object.assign({}, u);
      this.rightBox.isEdit = true;
      this.rightBox.title = this.$t("config.account.editAccount") + "  ID：" + u.userId;
      this.rightBox.show = true;
    },
    del: function(u) {
      this.$confirm(this.$t("tip.confirmDelete"), {
        confirmButtonText: this.$t("tip.yes"),
        cancelButtonText: this.$t("tip.no"),
        type: 'warning'
      }).then(() => {
        this.$delete("sys/user/delete?userIds=" + u.userId).then(response => {
          if (response.code === 200) {
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
            this.rightBox.show = false;
            this.getTableData();
          } else {
            this.$message.error(response.msg);
          }
        });
      });

    },
    detail: function(u) {
      this.user = Object.assign({}, u);
      this.rightBox.isEdit = false;
      this.rightBox.title = this.$t("config.account.account") + "  ID：" + u.userId;
      this.rightBox.show = true;
    },
    getTableData: function() {
      this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
      this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
      this.$get('sys/user/list', this.searchLabel).then(response => {
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + "";
          }
          this.tableData = response.data.list;
          this.pageObj.total = response.data.total
        }
      })
    },
    toAdd: function() {
      this.cleanUser();
      this.rightBox.isEdit = true;
      this.rightBox.title = this.$t("config.account.createAccount");
      this.rightBox.show = true;
    },
    save: function() {
      if (this.user.userId) {
        this.$put('sys/user/update', this.user).then(response => {
          if (response.code === 200) {
            this.rightBox.show = false;
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
          } else {
            this.$message.error(response.msg);
          }
          this.getTableData();
        });
      } else {
        this.$post('sys/user/save', this.user).then(response => {
          if (response.code === 200) {
            this.rightBox.show = false;
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
            this.getTableData();
          } else {
            this.$message.error(response.msg);
          }
        });
      }
    },
    saveOrToEdit: function() {
      if (!this.rightBox.isEdit) {
        this.rightBox.isEdit = true;
        this.rightBox.title = this.$t("config.account.editAccount") + "  ID：" + this.user.userId;
      } else {
        this.save();
      }
    },
    statusChange: function(user) {
      this.user = user;
      this.save();
    },
    jumpTo(data,id) {
      this.$store.state.assetData.moduleData = data;
      this.$store.state.assetData.selectedData = id;
      this.$router.push({
        path: "/" + data,
        query: {
          t: +new Date()
        }
      });
    },
    toEditReceiver: function(item) {
      if (!item.isEdit) {
        //如果不在编辑状态，那么其他项如果有改动，则还原改动，最后开始编辑
        this.blurEditReceiver();
        item.isEdit = true;
      } else {
        //如果已在编辑状态，判断name是否有变更，有变更则发请求
        if (item.name != item.oldName) {
          if (this.updateReceiverName(item) == 200) {
            item.isEdit = false;
          }
        } else {
          item.errorMessage = '';
          item.isEdit = false;
        }
      }
    },
    blurEditReceiver: function() {
      for (let i = 0; i < this.receiverData.length; i++) {
        if (this.receiverData[i].isEdit) {
          this.receiverData[i].name = this.receiverData[i].oldName;
          this.receiverData[i].isEdit = false;
          this.receiverData[i].errorMessage = '';
          break;
        }
      }
    },
    toDelReceiver: function(item) {
      this.blurEditReceiver();
      //TODO 请求后台，删除用户组
    },
    initReceiverData: function() {
      for (let i = 0; i < this.receiverData.length; i++) {
        this.$set(this.receiverData[i], 'oldName', this.receiverData[i].name);
        this.$set(this.receiverData[i], 'isEdit', false);
      }
    },
    esc: function() {
      this.rightBox.show = false;
    },
    updateReceiverName: function(item) {
      //TODO 请求接口改名
      let code = 200;
      //this.$set(item, 'errorMessage', 'err');
      item.errorMessage = '';
      item.oldName = item.name;
      return code;
    },
    cleanUser: function() {
      this.user = {
        userId: '',
        username: '',
        email: '',
        status: '1',
        createTime: '',
        receiver: [],
        lang: 'en'
      }
    },
    pageNo(val) {
      this.pageObj.pageNo = val;
      this.getTableData();
    },
    pageSize(val) {
      this.pageObj.pageSize = val;
      this.getTableData();
    },
    search: function(searchObj) {
      this.searchLabel = {};
      for (let item in searchObj) {
        if (searchObj[item]) {
          this.$set(this.searchLabel, item, searchObj[item]);
        }
      }
      this.getTableData();
    }
  },
  mounted() {
    this.getTableData();
    this.initReceiverData();
  }
}
</script>
