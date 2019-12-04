<style scoped>
  .account {
    height: 100%;
  }
  .account-list {

  }

  /* begin--右侧弹框*/
  .right-box {
    position: fixed;
    top: 20px;
    right: 0;
    z-index: 1;
    border-radius: 8px;
    box-shadow: 0 0 15px #ccc;
    background-color: white;
    padding: 0 20px;
  }
  .right-box_account {
    width: 550px;
    height: calc(100% - 60px);
  }
  /* begin--右侧弹框--顶部按钮*/
  .right-box__top-btns {
    text-align: center;
  }
  .right-box__top-btn {
    border-radius: 0 0 9px 9px;
    float: right;
    color: #656565;
    height: 30px;
    font-size: 12px;
    padding: 3px 8px 1px 8px;
    border: 1px solid #aaaaaa;
    border-top: none;
    cursor: pointer;
    margin-left: 20px;
  }
  .right-box__top-btn_full {
    background-color: #656565;
    border: 1px solid #656565;
    border-top: none;
    color: white;
   }
  /* end--右侧弹框--顶部按钮*/

  /* begin--右侧弹框--内容*/
  .right-box__title {
    height: 30px;
    line-height: 40px;
    text-align: left;
  }
  .right-box__form {
    margin-top: 35px;
  }
  .right-box__form-row {
    margin-top: 25px;
  }
  .right-box__form-label {
    margin-bottom: 8px;
    text-align: left;
  }
  .right-box__form-content {
    height: 32px;
    line-height: 32px;
    text-align: left;
    width: 100%;
  }
  .right-box__form-content-txt {
    padding-left: 11px;
  }
  .right-box__form-content .el-select {
    width: calc(100% - 37px);
    vertical-align: top;
  }
  .el-select__add-btn {
    width: 32px;
    height: 32px;
    display: inline-block;
    text-align: center;
    border-radius: 5px;
    border: 1px solid #DCDFE6;
    box-sizing: border-box;
    color: #C7C9CE;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  }
  .el-select__add-btn:hover {
    border: 1px solid #C0C4CC;
    cursor: pointer;
  }
  /* end--右侧弹框--内容*/

  /* begin--右侧弹框--底部按钮*/
  .right-box__bottom-btns {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 40px;
    left: 0;
    text-align: center;
  }
  .right-box__bottom-btn:first-of-type {
    border-bottom-left-radius: 8px;
  }
  .right-box__bottom-btn:last-of-type{
    border-bottom-right-radius: 8px;
  }
  .right-box__bottom-btn {
    display: inline-block;
    background-color: #656565;
    color: white;
    height: 100%;
    line-height: 40px;
    cursor: pointer;
    width: 100%;
  }
  .config-receiver-dropdown__label_input {
    width: 50%;
    display: inline-block;
  }
  .right-box__bottom-btn_cancel {
    background-color: #DADADA;
    color: #656565;
  }
  .right-box__bottom-btn_50 {
    width: 50%;
  }
  /* end--右侧弹框--底部按钮*/
  /* end--右侧弹框*/

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
        <div class="account-list">
          <button @click="add">add button</button>
            <el-table
                  :data="tableData"
                  border
                  style="width: 100%">
                <el-table-column
                  v-for="(item, index) in tableTitle"
                  v-if="item.show"
                  :width="item.width"
                  :key="`col_${index}`"
                  :label="item.label"
                >
                    <template slot-scope="scope" :column="item">
                        <div v-if="item.prop == 'option'">
                            <a @click="del(scope.row)">Delete</a>
                            <a @click="detail(scope.row)">Detail</a>
                            <a @click="edit(scope.row)">Edit</a>
                        </div>
                        <span v-if="item.prop == 'lang'">
                            {{scope.row[item.prop] == 'en' ? 'English' : ''}}
                            {{scope.row[item.prop] == 'zh' ? '中文' : ''}}
                            {{scope.row[item.prop] == 'ru' ? 'русский' : ''}}
                        </span>
                        <span v-else>{{scope.row[item.prop]}}</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <transition name="right-box">
            <div class="right-box right-box_account" v-if="rightBox.show">
                <!-- begin--顶部按钮-->
                <div class="right-box__top-btns">
                    <div class="right-box__top-btn right-box__top-btn_full" @click="esc">
                        <div class="right-box__btn-icon">
                            <i class="el-icon-close"></i>
                        </div>
                        <span>Esc</span>
                    </div>
                    <div class="right-box__top-btn right-box__top-btn_full" @click="saveOrToEdit">
                        <div class="right-box__btn-icon">
                            <i class="el-icon-edit-outline"></i>
                        </div>
                        <span v-if="rightBox.isEdit">Save</span>
                        <span v-else>Edit</span>
                    </div>
                    <div class="right-box__top-btn" v-if="rightBox.isEdit && user.userId != ''">
                        <div class="right-box__btn-icon">
                            <i class="el-icon-delete"></i>
                        </div>
                        <span>Delete</span>
                    </div>
                </div>
                <!-- end--顶部按钮-->

                <!-- begin--标题-->
                <div class="right-box__title">{{rightBox.title}}</div>
                <!-- end--标题-->

                <!-- begin--表单-->
                <div class="right-box__form">
                    <div class="right-box__form-row">
                        <div class="right-box__form-label">Account</div>
                        <div class="right-box__form-content">
                            <el-input
                              v-if="rightBox.isEdit"
                              type="text"
                              placeholder=""
                              v-model="user.username"
                              maxlength="64"
                              show-word-limit
                              size="small"
                            ></el-input>
                            <div v-if="!rightBox.isEdit" class="right-box__form-content-txt">{{user.username}}</div>
                        </div>
                    </div>
                    <div class="right-box__form-row">
                        <div class="right-box__form-label">E-mail</div>
                        <div class="right-box__form-content">
                            <el-input
                              type="text"
                              v-if="rightBox.isEdit"
                              placeholder=""
                              v-model="user.email"
                              size="small"
                            ></el-input>
                          <div v-if="!rightBox.isEdit" class="right-box__form-content-txt">{{user.email}}</div>
                        </div>
                    </div>
                    <div class="right-box__form-row">
                        <div class="right-box__form-label">Receiver</div>
                        <div class="right-box__form-content">
                            <el-select popper-class="config-receiver-dropdown" multiple v-model="user.receiver" placeholder="" v-if="rightBox.isEdit" size="small">
                                <el-option
                                  @click.native="blurEditReceiver()"
                                  v-for="item in receiverData"
                                  :key="item.id"
                                  :label="item.name"
                                  :value="item.id">
                                    <span class="config-receiver-dropdown__label_txt" v-if="!item.isEdit">{{item.name}}</span>
                                    <span class="config-receiver-dropdown__label_input" v-if="item.isEdit" @click.stop="stopFun">
                                        <el-input
                                          type="text"
                                          v-model="item.name"
                                          size="mini"
                                        ></el-input>
                                    </span>
                                    <span class="config-receiver-dropdown__error-message">{{item.errorMessage}}</span>
                                    <span class="config-receiver-dropdown__btn" @click.stop="toEditReceiver(item)">
                                        <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                        <i class="el-icon-check" v-if="item.isEdit"></i>
                                    </span>
                                    <span class="config-receiver-dropdown__btn config-receiver-dropdown__btn_delete" @click.stop="toDelReceiver(item)"><i class="el-icon-delete"></i></span>
                                </el-option>
                            </el-select>
                            <div class="el-select__add-btn" v-if="rightBox.isEdit">
                                <span class="el-icon-plus"></span>
                            </div>
                        </div>
                    </div>
                    <div class="right-box__form-row">
                        <div class="right-box__form-label">Language</div>
                        <div class="right-box__form-content">
                            <el-radio v-model="user.lang" label="en" :disabled="!rightBox.isEdit && user.lang != 'en'">English</el-radio>
                            <el-radio v-model="user.lang" label="zh" :disabled="!rightBox.isEdit && user.lang != 'zh'">中文</el-radio>
                            <el-radio v-model="user.lang" label="ru" disabled>русский（暂不支持）</el-radio>
                        </div>
                    </div>
                    <div class="right-box__form-row">
                        <div class="right-box__form-label">Enable</div>
                        <div class="right-box__form-content">
                            <el-switch
                              v-model="user.status"
                              :disabled="!rightBox.isEdit"
                              active-value="1"
                              inactive-value="0">
                            </el-switch>
                        </div>
                    </div>
                    <div class="right-box__form-row" v-if="!rightBox.isEdit">
                        <div class="right-box__form-label">Create Time</div>
                        <div class="right-box__form-content">
                            <div class="right-box__form-content-txt">{{user.createTime}}</div>
                        </div>
                    </div>
                </div>
                <!-- end--表单-->

                <!-- begin--底部按钮-->
                <div class="right-box__bottom-btns">
                    <div @click="esc" :class="{'right-box__bottom-btn_50': rightBox.isEdit}" class="right-box__bottom-btn right-box__bottom-btn_cancel">Cancel</div><div v-if="rightBox.isEdit" class="right-box__bottom-btn right-box__bottom-btn_50">{{user.userId == '' ? 'Create' : 'Save'}}</div>
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
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: 'Account',
          prop: 'username',
          show: true,
          width: 250
        }, {
          label: 'E-mail',
          prop: 'email',
          show: true,
          width: 250
        }, {
          label: 'Language',
          prop: 'lang',
          show: true,
          width: 200
        }, {
          label: 'Receiver',
          prop: 'receiver',
          show: true,
          width: 250
        }, {
          label: 'Create Time',
          prop: 'createTime',
          show: true,
          width: 250
        }, {
          label: 'Enable',
          prop: 'status',
          show: true,
          width: 100
        }, {
          label: 'Option',
          prop: 'option',
          show: true,
        }
      ],
      tableData: [{
        id: '1',
        username: '王小虎1',
        email: 'c92c@qq.com',
        lang: 'en',
        receiver: 'A01',
        createTime: '2019-11-28  21:39:05',
        status: '1'
      }, {
        id: '2',
        username: '王小虎2',
        email: 'c92c@qq.com',
        lang: 'en',
        receiver: 'A02',
        createTime: '2019-11-28  21:39:05',
        status: '0'
      }, {
        id: '3',
        username: '王小虎3',
        email: 'c92c@qq.com',
        lang: 'en',
        receiver: 'A03',
        createTime: '2019-11-28  21:39:05',
        status: '1'
      }, {
        id: '4',
        username: '王小虎4',
        email: 'c92c@qq.com',
        lang: 'zh',
        receiver: 'A04',
        createTime: '2019-11-28  21:39:05',
        status: '1'
      }, {
        id: '5',
        username: '王小虎5',
        email: 'c92c@qq.com',
        lang: 'en',
        receiver: 'A05',
        createTime: '2019-11-28  21:39:05',
        status: '1'
      }, {
        id: '6',
        username: '王小虎6',
        email: 'c92c@qq.com',
        lang: 'en',
        receiver: 'A06',
        createTime: '2019-11-28  21:39:05',
        status: '1'
      }, {
        id: '7',
        username: '王小虎7',
        email: 'c92c@qq.com',
        lang: 'en',
        receiver: 'A07',
        createTime: '2019-11-28  21:39:05',
        status: '1'
      }, {
        id: '8',
        username: '王小虎8',
        email: 'c92c@qq.com',
        lang: 'en',
        receiver: 'A08',
        createTime: '2019-11-28  21:39:05',
        status: '1'
      }, {
        id: '9',
        username: '王小虎9',
        email: 'c92c@qq.com',
        lang: 'en',
        receiver: 'A09',
        createTime: '2019-11-28  21:39:05',
        status: '1'
      }, {
        id: '10',
        username: '王小虎',
        email: 'c92c@qq.com',
        lang: 'en',
        receiver: 'A01',
        createTime: '2019-11-28  21:39:05',
        status: '1'
      }, {
        id: '222',
        username: '王小虎',
        email: 'c92c@qq.com',
        lang: 'en',
        receiver: 'A01',
        createTime: '2019-11-28  21:39:05',
        status: '1'
      }, {
        id: '2',
        username: '王小虎',
        email: 'c92c@qq.com',
        lang: 'en',
        receiver: 'A01',
        createTime: '2019-11-28  21:39:05',
        status: '1'
      }, {
        id: '2',
        username: '王小虎',
        email: 'c92c@qq.com',
        lang: 'en',
        receiver: 'A01',
        createTime: '2019-11-28  21:39:05',
        status: '1'
      }],
      receiverData: [{
        id: '1',
        isEdit: false,
        name: '小组1',
        description: '小组1desc'
      }, {
        id: '2',
        isEdit: false,
        name: '小组啊小组的小组2',
        description: '小组2desc'
      }, {
        id: '3',
        isEdit: false,
        name: '小组3',
        description: '小组3desc'
      }, {
        id: '4',
        isEdit: false,
        name: '小组4',
        description: '小组4desc'
      }, {
        id: '5',
        isEdit: false,
        name: '小组啊小组5',
        description: '小组5desc'
      }, {
        id: '6',
        isEdit: false,
        name: '小组6',
        description: '小组6desc'
      }]
    }
  },
  methods: {
    edit: function(u) {
      this.user = u;
      this.rightBox.isEdit = true;
      this.rightBox.title = "Edit  Account  ID：" + u.id;
      this.rightBox.show = true;
    },
    del: function(u) {
    },
    detail: function(u) {
      this.user = u;
      this.rightBox.isEdit = false;
      this.rightBox.title = "Account  ID：" + u.id;
      this.rightBox.show = true;
    },
    add: function() {
      this.cleanUser();
      this.rightBox.isEdit = true;
      this.rightBox.title = "Create  Account";
      this.rightBox.show = true;
    },
    saveOrToEdit: function() {
      if (!this.rightBox.isEdit) {
        this.rightBox.isEdit = true;
        this.rightBox.title = "Edit  Account  ID：" + this.user.id;
      }
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
      for (var i = 0; i < this.receiverData.length; i++) {
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
      //TODO 请求后台，删除组
    },
    setOldNameForReceiver: function() {
      for (var i = 0; i < this.receiverData.length; i++) {
        this.$set(this.receiverData[i], 'oldName', this.receiverData[i].name);
      }
    },
    esc: function() {
      this.rightBox.show = false;
    },
    stopFun: function() {

    },
    updateReceiverName: function(item) {
      //TODO 请求接口改名
      var code = 200;
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
        lang: 'en'
      }
    }
  },
  mounted() {
    this.setOldNameForReceiver();
  }
}
</script>
