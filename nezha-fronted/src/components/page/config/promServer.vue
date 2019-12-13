<style scoped>
  .prom {
    height: 100%;
  }
  .prom .el-table {
    border-radius: 5px;
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
</style>
<template>
    <div class="prom">
        <div class="content-left">
            <div class="sidebar-title">{{$t('config.config')}}</div>
            <div class="sidebar-info">
                <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('account')">{{$t('config.account.accountList')}}</div>
                <div class="sidebar-info-item sidebar-info-item-active">{{$t('config.promServer.promServerList')}}</div>
            </div>
        </div>
        <div class="content-right">
            <div class="top-tools">
              <el-button @click="toAdd" class="top-tool-btn top-tool-btn-active margin-l-10 top-tool top-tool-right" size="mini">
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
                >
                    <template slot-scope="scope" :column="item">
                        <span v-if="item.prop == 'idc'">{{scope.row[item.prop].name}}</span>
                        <span v-else-if="item.prop == 'type'">
                            {{scope.row[item.prop] == '1' ? 'Global' : ''}}
                            {{scope.row[item.prop] == '2' ? 'Per-Datacenter' : ''}}
                        </span>
                        <span v-else>{{scope.row[item.prop]}}</span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('config.account.option')" width="100">
                  <template slot-scope="scope" :column="item">
                    <div class="content-right-options">
                        <span @click="del(scope.row)" class="content-right-option"><i class="el-icon-delete"></i></span>
                        <span @click="detail(scope.row)" class="content-right-option"><i class="el-icon-view"></i></span>
                        <span @click="toEdit(scope.row)" class="content-right-option"><i class="el-icon-edit-outline"></i></span>
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
                    <div @click="del" class="right-box-top-btn" v-if="rightBox.isEdit && promServer.id != ''">
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
                            <el-select class="right-box-row-with-btn" value-key="id" popper-class="config-dropdown" v-model="promServer.idc" placeholder="" v-if="rightBox.isEdit" size="small">
                                <el-option
                                  @click.native="blurEditIdc()"
                                  v-for="item in idcData"
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
                                    <span class="config-dropdown-btn" @click.stop="toEditIdc(item)">
                                        <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                        <i class="el-icon-check" v-if="item.isEdit"></i>
                                    </span>
                                    <span class="config-dropdown-btn config-dropdown-btn-delete" @click.stop="toDelIdc(item)"><i class="el-icon-delete"></i></span>
                                </el-option>
                            </el-select>
                            <div class="right-box-row-btn" v-if="rightBox.isEdit">
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
                    <div class="right-box-form-row">
                        <div class="right-box-form-label">Port</div>
                        <div class="right-box-form-content">
                            <el-input
                              type="text"
                              v-if="rightBox.isEdit"
                              placeholder=""
                              v-model="promServer.port"
                              size="small"
                            ></el-input>
                            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{promServer.port}}</div>
                        </div>
                    </div>
                    <div class="right-box-form-row">
                        <div class="right-box-form-label">{{$t('config.promServer.type')}}</div>
                        <div class="right-box-form-content">
                            <el-select popper-class="config-dropdown" v-model="promServer.type" placeholder="" v-if="rightBox.isEdit" size="small">
                                <el-option
                                  v-for="item in typeData"
                                  :key="item.key"
                                  :label="item.value"
                                  :value="item.key">
                                </el-option>
                            </el-select>
                            <div v-for="item in typeData" v-if="!rightBox.isEdit && item.key == promServer.type" class="right-box-form-content-txt">{{item.value}}</div>
                        </div>
                    </div>
                </div>
                <!-- end--表单-->

                <!-- begin--底部按钮-->
                <div class="right-box-bottom-btns">
                    <div @click="esc()" :class="{'right-box-bottom-btn-50': rightBox.isEdit}" class="right-box-bottom-btn right-box-bottom-btn-cancel">{{$t('overall.cancel')}}</div><div @click="save()" v-if="rightBox.isEdit" class="right-box-bottom-btn right-box-bottom-btn-50">{{promServer.id == '' ? $t('overall.create') : $t('overall.save')}}</div>
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
        total:0
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
        }, {
          label: 'Port',
          prop: 'port',
          show: true,
        }, {
          label: this.$t("config.promServer.type"),
          prop: 'type',
          show: true,
        }
      ],
      tableData: [],
      idcData: [],
      typeData: [
        {
          key: 1,
          value: 'Global'
        }, {
          key: 2,
          value: 'Per-Datacenter'
        }
      ]
    }
  },
  methods: {
    toEdit: function(u) {
      this.promServer = Object.assign({}, u);
      this.rightBox.isEdit = true;
      this.rightBox.title = this.$t("config.promServer.editProm") + "  ID：" + u.id;
      this.rightBox.show = true;
    },
    del: function(u) {
      this.$confirm(this.$t("tip.confirmDelete"), {
        confirmButtonText: this.$t("tip.yes"),
        cancelButtonText: this.$t("tip.no"),
        type: 'warning'
      }).then(() => {
        this.$delete("promServer?ids=" + u.id).then(response => {
          if (response.code === 200) {
            this.$message({type: 'success', message: this.$t("tip.deleteSuccess")});
            this.getTableData();
          } else {
            this.$message.error(response.msg);
          }
        })
      });
    },
    getTableData: function() {
      this.$get('promServer', this.pageObj).then(response => {
        if (response.code === 200) {
          this.tableData = response.data.list;
          this.pageObj.total = response.data.total
        }
      })
    },
    detail: function(u) {
      this.promServer = Object.assign({}, u);
      this.rightBox.isEdit = false;
      this.rightBox.title = "Prometheus Server ID：" + u.id;
      this.rightBox.show = true;
    },
    toAdd: function() {
      this.cleanPromServer();
      this.rightBox.isEdit = true;
      this.rightBox.title = this.$t("config.promServer.createProm");
      this.rightBox.show = true;
    },
    save: function() {
      if (this.promServer.id) {
        this.$put('promServer', this.promServer).then(response => {
          if (response.code === 200) {
            this.getTableData();
            this.rightBox.isEdit = false;
            this.esc();
          }
        });
      } else {
        this.$post('promServer', this.promServer).then(response => {
          if (response.code === 200) {
            this.getTableData();
            this.rightBox.isEdit = false;
            this.esc();
          }
        });
      }
    },
    saveOrToEdit: function() {
      if (!this.rightBox.isEdit) {
        this.toEdit(this.promServer);
      } else {
        this.save();
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
          this.$put('idc', item).then(response => {
            if (response.code === 200) {
              item.errorMessage = '';
              item.oldName = item.name;
              item.isEdit = false;
              this.getIdcData();
            } else {
              this.$set(item, 'errorMessage', response.msg);
            }
          })
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
    getIdcData: function() {
      this.$get('idc', this.pageObj).then(response => {
        if (response.code === 200) {
          this.idcData = response.data.list;
          for (var i = 0; i < this.idcData.length; i++) {
            this.$set(this.idcData[i], 'oldName', this.idcData[i].name);
            this.$set(this.idcData[i], 'isEdit', false);
          }
          this.getTableData();
        }
      })

    },
    esc: function() {
      this.rightBox.show = false;
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
    getTableData: function() {
      this.$get('promServer', this.pageObj).then(response => {
        if (response.code === 200) {
          for (var i = 0; i < response.data.list.length; i++) {
            for (var j = 0; j < this.idcData.length; j++) {
              if (response.data.list[i].idcId == this.idcData[j].id) {
                response.data.list[i].idc = Object.assign({}, this.idcData[j]);
                break;
              }
            }
          }
          this.tableData = response.data.list;
          this.pageObj.total = response.data.total
        }
      })
    },
    cleanPromServer: function() {
      this.promServer = {
        id: '',
        host: '',
        idcId: '',
        idc: {id: '', name: '', location: ''}
      }
    },
    pageNo(val) {
      this.pageObj.pageNo = val;
      this.getTableData();
    },
    pageSize(val) {
      this.pageObj.pageSize = val;
      this.getTableData();
    }
  },
  mounted: function() {
    this.getIdcData();
  },
  watch: {
    'promServer.idc': function(n, o) {
      this.promServer.idcId = n.id;
    }
  }
}
</script>
