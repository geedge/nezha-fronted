<style scoped>
  .prom {
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
  .prom-list {
    height: calc(100% - 131px);
    margin-left: 370px;
    padding: 0 15px 0 0;
  }
  .prom-list-option {
    cursor: pointer;
    display: inline-block;
    margin-right: 6px;
  }
  .prom-list-option .el-icon-delete {
    color: #F98D9A;
  }
  .prom-list-option .el-icon-delete:hover {
    color: #D96D7A;
  }
  .prom-list-option .el-icon-view {
    color: #60BEFF;
  }
  .prom-list-option .el-icon-view:hover {
    color: #409EFF;
  }
  .prom-list-search {
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
  .right-box-prom {
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
    <div class="prom">
        <div class="content-left">
            <div class="sidebar-title">
                <div>Config</div>
                <div class="sidebar-info">
                    <div class="sidebar-info-footer" v-if="sidebarState">
                    </div>
                </div>
            </div>
        </div>
        <div class="prom-list">
            <el-input
              class="prom-list-search"
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
                >
                    <template slot-scope="scope" :column="item">
                        <span v-if="item.prop == 'idc'">{{scope.row[item.prop].name}}</span>
                        <span v-else>{{scope.row[item.prop]}}</span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('config.account.option')" width="100">
                  <template slot-scope="scope" :column="item">
                    <div class="prom-list-options">
                        <span @click="del(scope.row)" class="prom-list-option"><i class="el-icon-delete"></i></span>
                        <span @click="detail(scope.row)" class="prom-list-option"><i class="el-icon-view"></i></span>
                        <span @click="edit(scope.row)" class="prom-list-option"><i class="el-icon-edit-outline"></i></span>
                    </div>
                  </template>
                </el-table-column>
            </el-table>
            <Pagination :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
        </div>

        <transition name="right-box">
            <div class="right-box right-box-prom" v-if="rightBox.show">
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
                    <div class="right-box-top-btn" v-if="rightBox.isEdit && promServer.id != ''">
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
                        <div class="right-box-form-label">IDC</div>
                        <div class="right-box-form-content">
                            <el-select value-key="id" popper-class="config-dropdown" v-model="promServer.idc" placeholder="" v-if="rightBox.isEdit" size="small">
                                <el-option
                                  @click.native="blurEditIdc()"
                                  v-for="item in idcData"
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
                                    <span class="config-dropdown-btn" @click.stop="toEditIdc(item)">
                                        <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                        <i class="el-icon-check" v-if="item.isEdit"></i>
                                    </span>
                                    <span class="config-dropdown-btn config-dropdown-btn-delete" @click.stop="toDelIdc(item)"><i class="el-icon-delete"></i></span>
                                </el-option>
                            </el-select>
                            <div class="el-select-add-btn" v-if="rightBox.isEdit">
                                <span class="el-icon-plus"></span>
                            </div>
                            <div class="right-box-form-content-txt" v-if="!rightBox.isEdit">{{promServer.idc.name}}</div>
                        </div>
                    </div>
                    <div class="right-box-form-row">
                        <div class="right-box-form-label">Host</div>
                        <div class="right-box-form-content">
                            <el-input
                              type="text"
                              v-if="rightBox.isEdit"
                              placeholder=""
                              v-model="promServer.host"
                              size="small"
                            ></el-input>
                            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{promServer.host}}</div>
                        </div>
                    </div>
                </div>
                <!-- end--表单-->

                <!-- begin--底部按钮-->
                <div class="right-box-bottom-btns">
                    <div @click="esc()" :class="{'right-box-bottom-btn-50': rightBox.isEdit}" class="right-box-bottom-btn right-box-bottom-btn-cancel">{{$t('overall.cancel')}}</div><div v-if="rightBox.isEdit" class="right-box-bottom-btn right-box-bottom-btn-50">{{promServer.id == '' ? $t('overall.create') : $t('overall.save')}}</div>
                </div>
                <!-- end--底部按钮-->

            </div>
        </transition>
    </div>

</template>
<script>
export default {
  name: "prom",
  data() {
    return {
      rightBox: { //弹出框相关
        show: false,
        isEdit: false, //false查看，true编辑
        title: ''
      },
      promServer: {
        id: '',
        host: '',
        idc: {id: '', name: '', location: ''}
      },
      pageObj: {
        pageNo: 1,
        pageSize: 20,
        total:6
      },
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: 'IDC',
          prop: 'idc',
          show: true,
        }, {
          label: 'Host',
          prop: 'host',
          show: true,
        }
      ],
      tableData: [
        {
          id: '1',
          host: '192.168.40.241',
          idc: {id: '3', name: 'aerareqarew', location: 'zhaertaewr'}
        },
        {
          id: '2',
          host: '192.168.40.242',
          idc: {id: '5', name: 'idc151654', location: 'bj'}
        },
        {
          id: '3',
          host: '192.168.40.243',
          idc: {id: '6', name: 'idc151655', location: 'sh'}
        },
        {
          id: '4',
          host: '192.168.40.244',
          idc: {id: '6', name: 'idc151655', location: 'sh'}
        },
        {
          id: '5',
          host: '192.168.40.245',
          idc: {id: '7', name: 'idc151656', location: 'gd'}
        },
        {
          id: '6',
          host: '192.168.40.246',
          idc: {id: '9', name: 'idc151657', location: 'fj'}
        },
      ],
      idcData: [
        {id: '1', name: 'idc151656', location: 'gd'},
        {id: '2', name: 'idc151656', location: 'gd'},
        {id: '3', name: 'aerareqarew', location: 'zhaertaewr'},
        {id: '4', name: 'idc151656', location: 'gd'},
        {id: '5', name: 'idc151654', location: 'bj'},
        {id: '6', name: 'idc151655', location: 'sh'},
        {id: '7', name: 'idc151656', location: 'gd'},
        {id: '8', name: 'idc151656', location: 'gd'},
        {id: '9', name: 'idc151657', location: 'fj'},
      ]
    }
  },
  methods: {
    edit: function(u) {
      this.promServer = Object.assign({}, u);
      this.rightBox.isEdit = true;
      this.rightBox.title = this.$t("config.promServer.editProm") + "  ID：" + u.id;
      this.rightBox.show = true;
    },
    del: function(u) {
    },
    detail: function(u) {
      this.promServer = Object.assign({}, u);
      this.rightBox.isEdit = false;
      this.rightBox.title = "Prometheus Server ID：" + u.id;
      this.rightBox.show = true;
    },
    add: function() {
      this.cleanPromServer();
      this.rightBox.isEdit = true;
      this.rightBox.title = this.$t("config.promServer.createProm");
      this.rightBox.show = true;
    },
    saveOrToEdit: function() {
      if (!this.rightBox.isEdit) {
        this.rightBox.isEdit = true;
        this.rightBox.title = this.$t("config.promServer.editProm") + "  ID：" + this.promServer.id;
      }
    },
    toEditIdc: function(item) {
      if (!item.isEdit) {
        //如果不在编辑状态，那么其他项如果有改动，则还原改动，最后开始编辑
        this.blurEditIdc();
        item.isEdit = true;
      } else {
        //如果已在编辑状态，判断name是否有变更，有变更则发请求
        if (item.name != item.oldName) {
          if (this.updateIdcName(item) == 200) {
            item.isEdit = false;
          }
        } else {
          item.errorMessage = '';
          item.isEdit = false;
        }
      }
    },
    blurEditIdc: function() {
      for (var i = 0; i < this.idcData.length; i++) {
        if (this.idcData[i].isEdit) {
          this.idcData[i].name = this.idcData[i].oldName;
          this.idcData[i].isEdit = false;
          this.idcData[i].errorMessage = '';
          break;
        }
      }
    },
    toDelIdc: function(item) {
      this.blurEditIdc();
      //TODO 请求后台，删除
    },
    initIdcData: function() {
      for (var i = 0; i < this.idcData.length; i++) {
        this.$set(this.idcData[i], 'oldName', this.idcData[i].name);
        this.$set(this.idcData[i], 'isEdit', false);
      }
    },
    esc: function() {
      this.rightBox.show = false;
    },
    stopFun: function() {

    },
    updateIdcName: function(item) {
      //TODO 请求接口改名
      var code = 200;
      //this.$set(item, 'errorMessage', 'err');
      item.errorMessage = '';
      item.oldName = item.name;
      return code;
    },
    cleanPromServer: function() {
      this.promServer = {
        id: '',
        host: '',
        idc: {id: '', name: '', location: ''}
      }
    }
  },
  mounted() {
    this.initIdcData();
  }
}
</script>
