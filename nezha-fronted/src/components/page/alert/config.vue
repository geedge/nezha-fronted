<style scoped>
  .account {
    height: 100%;
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
</style>
<template>
    <div class="account">
        <div class="content-left">
            <div class="sidebar-title">{{$t('alert.alert')}}</div>
            <div class="sidebar-info">
                <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('alertList')">{{$t('alert.alertList')}}</div>
                <div class="sidebar-info-item sidebar-info-item-active">{{$t('alert.alertConfig')}}</div>
            </div>
        </div>
        <div class="content-right">
            <div class="top-tools">
              <el-button @click="toAdd" class="top-tool-btn top-tool-btn-active top-tool top-tool-right margin-l-10" size="mini">
                <span><i class="el-icon-plus"></i></span>
                <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
              </el-button>
              <el-input
                  class="top-tool-search top-tool top-tool-right"
                  type="text"
                  :placeholder="$t('overall.search')"
                  size="mini"
                ></el-input>
            </div>
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
                        <span v-else>{{scope.row[item.prop]}}</span>
                    </template>
                </el-table-column>
            </el-table>
            <Pagination :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
        </div>

        <transition name="right-box">
            <div class="right-box right-box-alert-config" v-if="rightBox.show">
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
                        <div class="right-box-form-label">{{$t('alert.config.name')}}</div>
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
                        <div class="right-box-form-label">{{$t('alert.config.expr')}}</div>
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
                        <div class="right-box-form-label">{{$t('alert.config.for')}}</div>
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
                        <div class="right-box-form-label">{{$t('alert.severity')}}</div>
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
                        <div class="right-box-form-label">{{$t('alert.summary')}}</div>
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
                        <div class="right-box-form-label">{{$t('alert.description')}}</div>
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
                            <el-select class="right-box-row-with-btn" value-key="id" popper-class="config-dropdown" v-model="alertRule.receiver" placeholder="" v-if="rightBox.isEdit" size="small">
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
                            <div class="right-box-row-btn" v-if="rightBox.isEdit">
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
        total:0
      },
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t("alert.alertName"),
          prop: 'alertName',
          show: true,
        }, {
          label: this.$t("alert.config.expr"),
          prop: 'expr',
          show: true,
        }, {
          label: this.$t("alert.config.for"),
          prop: 'last',
          show: true,
        }, {
          label: this.$t('alert.severity'),
          prop: 'severity',
          show: true,
        }, {
          label: this.$t('alert.description'),
          prop: 'description',
          show: true,
        }, {
          label: this.$t('alert.config.receiver'),
          prop: 'receiver',
          show: true,
        }, {
          label: this.$t('alert.config.option'),
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
      this.rightBox.title = this.$t("alert.config.editalertConfig") + "  ID：" + u.id;
      this.rightBox.show = true;
    },
    del: function(u) {
    },
    toAdd: function() {
      this.cleanAlertRule();
      this.rightBox.isEdit = true;
      this.rightBox.title = this.$t("alert.config.createalertConfig");
      this.rightBox.show = true;
    },
    detail: function(u) {
      this.alertRule = Object.assign({}, u);
      this.rightBox.isEdit = false;
      this.rightBox.title = this.$t("alert.config.alertConfig") + "  ID：" + u.id;
      this.rightBox.show = true;
    },
    saveOrToEdit: function() {
      if (!this.rightBox.isEdit) {
        this.rightBox.isEdit = true;
        this.rightBox.title = this.$t("alert.config.editalertConfig") + "  ID：" + this.alertRule.id;
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
          this.tableData = response.data.list;
          this.pageObj.total = response.data.total;
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
    jumpTo(data,id) {
      this.$store.state.assetData.moduleData = data
      this.$store.state.assetData.selectedData = id
      this.$router.push({
        path: "/" + data,
        query: {
          t: +new Date()
        }
      });
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
