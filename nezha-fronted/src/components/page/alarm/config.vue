<style scoped>
  .account {
    height: 100%;
  }
  .content-left {
    float: left;
    width: 370px;
    height: 100%;
  }
  .sidebar-title {
    padding-left: 30px;
    padding-top: 20px;
  }

  .sidebar-info {
    margin-top: 20px;
    border: 1px solid #acacac;
    border-radius: 8px;
    height: calc(90vh - 55px);
    width: calc(100% - 30px);
  }

  .sidebar-info-header {
    background: #acacac;
    text-align: center;
    line-height: 50px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    height: 60px;
    width: 100%;
  }

  .sidebar-info-footer {
    padding-top: 15px;
    padding-left: 15px;
  }
  .account-list {
    height: calc(100% - 131px);
    margin-left: 370px;
    padding: 0 15px 0 0;
  }
  .account-list-option {
    cursor: pointer;
    display: inline-block;
    margin-right: 6px;
  }
  .account-list-option .el-icon-delete {
    color: #F98D9A;
  }
  .account-list-option .el-icon-delete:hover {
    color: #D96D7A;
  }
  .account-list-option .el-icon-view {
    color: #60BEFF;
  }
  .account-list-option .el-icon-view:hover {
    color: #409EFF;
  }
  .account-list-search {
    float: right;
    width: 220px;
    margin: 15px 0;
  }
  /* begin--右侧弹框*/
  .right-box {
    position: fixed;
    top: 80px;
    right: 15px;
    z-index: 1;
    border-radius: 8px;
    box-shadow: 0 0 15px #ccc;
    background-color: white;
    padding: 0 20px;
  }
  .right-box-account {
    width: 550px;
    height: calc(100% - 100px);
  }
  /* begin--右侧弹框--顶部按钮*/
  .right-box-top-btns {
    text-align: center;
  }
  .right-box-top-btn {
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
  .right-box-top-btn-full {
    background-color: #656565;
    border: 1px solid #656565;
    border-top: none;
    color: white;
   }
  /* end--右侧弹框--顶部按钮*/

  /* begin--右侧弹框--内容*/
  .right-box-title {
    height: 30px;
    line-height: 40px;
    text-align: left;
  }
  .right-box-form {
    margin-top: 35px;
  }
  .right-box-form-row {
    margin-top: 25px;
  }
  .right-box-form-label {
    margin-bottom: 8px;
    text-align: left;
  }
  .right-box-form-content {
    line-height: 32px;
    text-align: left;
    width: 100%;
  }
  .right-box-form-content-txt {
    padding-left: 11px;
  }
  .right-box-form-content .el-select {
    width: calc(100% - 38px);
    vertical-align: top;
  }
  .el-select-add-btn {
    width: 33px;
    height: 33px;
    display: inline-block;
    text-align: center;
    border-radius: 5px;
    border: 1px solid #DCDFE6;
    box-sizing: border-box;
    color: #C7C9CE;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  }
  .el-select-add-btn:hover {
    border: 1px solid #C0C4CC;
    cursor: pointer;
  }
  /* end--右侧弹框--内容*/

  /* begin--右侧弹框--底部按钮*/
  .right-box-bottom-btns {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 40px;
    left: 0;
    text-align: center;
  }
  .right-box-bottom-btn:first-of-type {
    border-bottom-left-radius: 8px;
  }
  .right-box-bottom-btn:last-of-type{
    border-bottom-right-radius: 8px;
  }
  .right-box-bottom-btn {
    display: inline-block;
    background-color: #656565;
    color: white;
    height: 100%;
    line-height: 40px;
    cursor: pointer;
    width: 100%;
  }
  .config-dropdown-label-input {
    width: 50%;
    display: inline-block;
  }
  .right-box-bottom-btn-cancel {
    background-color: #DADADA;
    color: #656565;
  }
  .right-box-bottom-btn-50 {
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
      <div class="content-left">
        <div class="sidebar-title">
          <div>Config</div>
          <div class="sidebar-info">
            <div class="sidebar-info-footer" v-if="sidebarState">
            </div>
          </div>
        </div>
      </div>
        <div class="account-list">
            <el-input
              class="account-list-search"
              type="text"
              :placeholder="$t('overall.search')"
              size="small"
            ></el-input>
            <el-table
                  :data="tableData"
                  border
                  height="calc(100% - 65px)"
                  style="width: 100%;">
                <el-table-column
                  v-for="(item, index) in tableTitle"
                  v-if="item.show"
                  :width="item.width"
                  :key="`col-${index}`"
                  :label="item.label"
                  show-overflow-tooltip
                >
                    <template slot-scope="scope" :column="item">
                        <div v-if="item.prop == 'option'" class="account-list-options">
                            <span @click="del(scope.row)" class="account-list-option"><i class="el-icon-delete"></i></span>
                            <span @click="detail(scope.row)" class="account-list-option"><i class="el-icon-view"></i></span>
                            <span @click="edit(scope.row)" class="account-list-option"><i class="el-icon-edit-outline"></i></span>
                        </div>
                      <!--<span v-else-if="item.prop == 'lang'">
                          {{scope.row[item.prop] == 'en' ? 'English' : ''}}
                          {{scope.row[item.prop] == 'zh' ? '中文' : ''}}
                          {{scope.row[item.prop] == 'ru' ? 'русский' : ''}}
                      </span>
                      <span v-else-if="item.prop == 'receiver'">
                          <template v-for="rec in scope.row[item.prop]">{{rec.name}}&nbsp;&nbsp;</template>
                      </span>
                      <span v-else-if="item.prop == 'status'">
                          <el-switch
                            v-model="scope.row[item.prop]"
                            active-value="1"
                            inactive-value="0">
                          </el-switch>
                      </span>-->
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
                    <div class="right-box-top-btn" v-if="rightBox.isEdit && alertRule.id != ''">
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
                        <div class="right-box-form-label">{{$t('alarm.config.name')}}</div>
                        <div class="right-box-form-content">
                            <el-input
                              v-if="rightBox.isEdit"
                              type="text"
                              placeholder=""
                              v-model="alertRule.alertName"
                              maxlength="64"
                              show-word-limit
                              size="small"
                            ></el-input>
                            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.alertName}}</div>
                        </div>
                    </div>
                    <div class="right-box-form-row">
                        <div class="right-box-form-label">{{$t('alarm.config.expr')}}</div>
                        <div class="right-box-form-content">
                            <el-input
                              type="textarea"
                              v-if="rightBox.isEdit"
                              placeholder=""
                              v-model="alertRule.expr"
                              size="small"
                            ></el-input>
                          <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.expr}}</div>
                        </div>
                    </div>
                    <div class="right-box-form-row">
                        <div class="right-box-form-label">{{$t('alarm.config.for')}}</div>
                        <div class="right-box-form-content">
                            <el-input
                              type="text"
                              v-if="rightBox.isEdit"
                              placeholder=""
                              v-model="alertRule.last"
                              size="small"
                            ></el-input>
                          <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.last}}s</div>
                        </div>
                    </div>
                    <div class="right-box-form-row">
                        <div class="right-box-form-label">{{$t('alarm.severity')}}</div>
                        <div class="right-box-form-content">
                            <el-input
                              type="text"
                              v-if="rightBox.isEdit"
                              placeholder=""
                              v-model="alertRule.severity"
                              size="small"
                            ></el-input>
                          <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.severity}}</div>
                        </div>
                    </div>
                    <div class="right-box-form-row">
                        <div class="right-box-form-label">{{$t('alarm.summary')}}</div>
                        <div class="right-box-form-content">
                            <el-input
                              type="text"
                              v-if="rightBox.isEdit"
                              placeholder=""
                              v-model="alertRule.summary"
                              size="small"
                            ></el-input>
                          <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.summary}}</div>
                        </div>
                    </div>
                    <div class="right-box-form-row">
                        <div class="right-box-form-label">{{$t('alarm.description')}}</div>
                        <div class="right-box-form-content">
                            <el-input
                              type="textarea"
                              v-if="rightBox.isEdit"
                              placeholder=""
                              v-model="alertRule.description"
                              size="small"
                            ></el-input>
                            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.description}}</div>
                        </div>
                    </div>
                    <div class="right-box-form-row">
                        <div class="right-box-form-label">{{$t('config.account.receiver')}}</div>
                        <div class="right-box-form-content">
                            <el-select value-key="id" popper-class="config-dropdown" v-model="alertRule.receiver" placeholder="" v-if="rightBox.isEdit" size="small">
                                <el-option
                                  @click.native="blurEditReceiver()"
                                  v-for="item in receiverData"
                                  :key="item.id"
                                  :label="item.name"
                                  :value="item">
                                    <span class="config-dropdown-label-txt" v-if="!item.isEdit">{{item.name}}</span>
                                    <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop="stopFun">
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
                            <div class="el-select-add-btn" v-if="rightBox.isEdit">
                                <span class="el-icon-plus"></span>
                            </div>
                            <div class="right-box-form-content-txt" v-if="!rightBox.isEdit">{{alertRule.receiver}}</div>
                        </div>
                    </div>
                </div>
                <!-- end--表单-->

                <!-- begin--底部按钮-->
                <div class="right-box-bottom-btns">
                    <div @click="esc()" :class="{'right-box-bottom-btn-50': rightBox.isEdit}" class="right-box-bottom-btn right-box-bottom-btn-cancel">{{$t('overall.cancel')}}</div><div v-if="rightBox.isEdit" class="right-box-bottom-btn right-box-bottom-btn-50">{{alertRule.id == '' ? $t('overall.create') : $t('overall.save')}}</div>
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
      alertRule: {
        id: '',
        alertName: '',
        type: '',
        linkId: '',
        expr: '',
        last: '',
        severity: '',
        summary: '',
        description: '',
        receiver: '',
      },
      pageObj: {
        pageNo: 1,
        pageSize: 20,
        total:9
      },
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t("alarm.alarmName"),
          prop: 'alertName',
          show: true,
        }, {
          label: this.$t("alarm.config.expr"),
          prop: 'expr',
          show: true,
        }, {
          label: this.$t("alarm.config.for"),
          prop: 'last',
          show: true,
        }, {
          label: this.$t('alarm.severity'),
          prop: 'severity',
          show: true,
        }, {
          label: this.$t('alarm.description'),
          prop: 'description',
          show: true,
        }, {
          label: this.$t('alarm.config.receiver'),
          prop: 'receiver',
          show: true,
        }, {
          label: this.$t('alarm.config.option'),
          prop: 'option',
          show: true,
        }
      ],
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
      tableData: []
    }
  },
  methods: {
    edit: function(u) {
      this.alertRule = Object.assign({}, u);
      this.rightBox.isEdit = true;
      this.rightBox.title = this.$t("alarm.config.editAlarmConfig") + "  ID：" + u.id;
      this.rightBox.show = true;
    },
    del: function(u) {
    },
    detail: function(u) {
      this.alertRule = Object.assign({}, u);
      this.rightBox.isEdit = false;
      this.rightBox.title = this.$t("alarm.config.alarmConfig") + "  ID：" + u.id;
      this.rightBox.show = true;
    },
    add: function() {
      this.cleanAlertRule();
      this.rightBox.isEdit = true;
      this.rightBox.title = this.$t("alarm.config.createAlarmConfig");
      this.rightBox.show = true;
    },
    saveOrToEdit: function() {
      if (!this.rightBox.isEdit) {
        this.rightBox.isEdit = true;
        this.rightBox.title = this.$t("alarm.config.editAlarmConfig") + "  ID：" + this.alertRule.id;
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
    initReceiverData: function() {
      for (var i = 0; i < this.receiverData.length; i++) {
        this.$set(this.receiverData[i], 'oldName', this.receiverData[i].name);
        this.$set(this.receiverData[i], 'isEdit', false);
      }
    },
    getTableData: function() {
      this.$get('alert/rule', this.pageObj).then(response => {
        if (response.code == 200) {
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
        }
      })
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
    cleanAlertRule: function() {
      this.alertRule = {
        id: '',
        alertName: '',
        type: '',
        linkId: '',
        expr: '',
        last: '',
        severity: '',
        summary: '',
        description: '',
        receiver: '',
      }
    },
    pageNo(val) {
      this.pageObj.pageNo = val;
      this.getTableData()
    },
    pageSize(val) {
      this.pageObj.pageSize = val;
      this.getTableData()
    }
  },
  mounted() {
    this.getTableData();
    this.initReceiverData();
  }
}
</script>
