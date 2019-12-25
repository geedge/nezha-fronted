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
  .pop-window {
    height: 370px;
    width: 400px;
  }

  .pop-window-assetType {
    height: 550px;
    width: 400px;
  }

  .pop-window-assetType-content {
    padding: 1px 15px 15px 20px;
  }
  .sidebar-pop-input {
    position: absolute;
    right: 50px;
    width: 200px;
    height: 26px;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    color: #606266;
    display: inline-block;
    padding: 0px 15px;
  }

  .sidebar-pop-input-select {
    position: absolute;
    right: 83px;
    width: 200px;
    height: 26px;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    color: #606266;
    display: inline-block;
    padding: 0px 15px;
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
              <button @click="toAdd" class="nz-btn nz-btn-size-normal nz-btn-style-normal float-right">
                <span><i class="el-icon-plus"></i></span>
                <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
              </button>
              <!--<el-button @click="toAdd" class="top-tool-btn top-tool-btn-active margin-l-10 top-tool top-tool-right" size="mini">
                <span><i class="el-icon-plus"></i></span>
                <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
              </el-button>-->
              <div class="top-tool-search top-tool top-tool-right"><search-input :searchMsg="searchMsg" @search="search"></search-input></div>
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
                    <div @click="del(promServer)" class="right-box-top-btn" v-if="rightBox.isEdit && promServer.id != ''">
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
                        <div class="right-box-form-label">DC</div>
                        <div class="right-box-form-content">
                            <el-select class="right-box-row-with-btn" value-key="id" popper-class="config-dropdown" v-model="promServer.idc" placeholder="" v-if="rightBox.isEdit" size="small">
                                <el-option
                                  @click.native="blurEditIdc()"
                                  v-for="item in idcData"
                                  :key="item.id"
                                  :label="item.name"
                                  :value="item">
                                    <span class="config-dropdown-label-txt">{{item.name}}</span>
                                  <el-popover
                                    placement="left"
                                    v-model="item[item.name]"
                                  >
                                    <div class="pop-window-assetType-content">
                                      <div class="right-box-top-btns">
                                        <div class="right-box-top-btn right-box-top-btn-full"
                                             @click="item[item.name] = false">
                                          <div class="right-box-btn-icon">
                                            <i class="el-icon-close"></i>
                                          </div>
                                          <span>{{$t('overall.esc')}}</span>
                                        </div>
                                      </div>
                                      <div class="pop-window">
                                        <span style="display: block;padding-bottom: 20px">标题</span>
                                          <el-input v-model="popIdcData.name"/>
                                          <el-input v-model="popIdcData.location"/>
                                          <el-select v-model="popIdcData.principal" clearable>
                                            <el-option
                                              v-for="item in idcUserData"
                                              :key="item.key"
                                              :label="item.username"
                                              :value="item.userId"
                                            >
                                            </el-option>
                                          </el-select>
                                          <el-input v-model="popIdcData.tel"/>
                                      </div>
                                    </div>
                                    <div class="right-box-bottom-btns">
                                      <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                                           @click.stop="item[item.name]= false">
                                        {{$t('overall.cancel')}}
                                      </div>
                                      <div class="right-box-bottom-btn right-box-bottom-btn-50"
                                           @click="editData('idc', item.id, popIdcData)">
                                        {{$t('overall.save')}}
                                      </div>
                                    </div>
                                    <span class="config-dropdown-btn" slot="reference"
                                          @click.stop="getSingleIDCData(item.id,'edit')"><i
                                      class="el-icon-edit-outline"></i></span>
                                  </el-popover>
                                    <span class="config-dropdown-btn config-dropdown-btn-delete" @click.stop="toDelIdc(item)"><i class="el-icon-delete"></i></span>
                                </el-option>
                            </el-select>
                            <div class="right-box-row-btn" v-if="rightBox.isEdit">
                              <el-popover
                                placement="left"
                                v-model="visible"
                              >
                                <div class="pop-window-assetType-content">
                                  <div class="right-box-top-btns">
                                    <div class="right-box-top-btn right-box-top-btn-full"
                                         @click="visible = false">
                                      <div class="right-box-btn-icon">
                                        <i class="el-icon-close"></i>
                                      </div>
                                      <span>{{$t('overall.esc')}}</span>
                                    </div>
                                  </div>
                                  <div class="pop-window">
                                    <span style="display: block;padding-bottom: 20px">标题</span>
                                    <div style="padding-top: 10px;padding-left: 20px">
                                      <div>
                                        <label style="font-size: 12px">DN name</label>
                                        <input class='sidebar-pop-input' v-model="addIdcData.name"/>
                                      </div>
                                      <div style="padding-top: 40px">
                                        <label style="font-size: 12px">Loaction</label>
                                        <input class='sidebar-pop-input' v-model="addIdcData.location"/>
                                      </div>
                                      <div style="padding-top: 40px">
                                        <label style="font-size: 12px;padding-right: 20px">负责人</label>
                                        <select class='sidebar-pop-input-select'
                                                style="margin-left:-40px "
                                                v-model="addIdcData.principal"
                                                clearable>
                                          <option
                                            v-for="item in idcUserData"
                                            :key="item.key"
                                            :label="item.username"
                                            :value="item.userId"
                                          >
                                          </option>
                                        </select>
                                      </div>
                                      <div style="padding-top: 40px">
                                        <label style="font-size: 12px">Tel</label>
                                        <input class='sidebar-pop-input' v-model="addIdcData.tel"/>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="right-box-bottom-btns">
                                  <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                                       @click.stop="visible= false">
                                    {{$t('overall.cancel')}}
                                  </div>
                                  <div class="right-box-bottom-btn right-box-bottom-btn-50"
                                       @click="addNewData('IDC')">
                                    {{$t('overall.save')}}
                                  </div>
                                </div>
                                <span slot="reference"
                                      @click.prevent=''><i
                                  class="el-icon-plus"></i></span>
                              </el-popover>
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
      visible:false,
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
          label: 'DC',
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
      ],
      searchMsg: { //给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 1,
          name: 'ID',
          type: 'input',
          label: 'id',
          disabled: false
        },{
          id: 5,
          name: 'DC',
          type: 'dc',
          label: 'dc',
          disabled: false
        },{
          id: 6,
          name: this.$t('config.promServer.type'),
          type: 'select',
          label: 'promType',
          disabled: false
        },{
          id: 8,
          name: this.$t('project.endpoint.host'),
          type: 'input',
          label: 'host',
          disabled: false
        },{
          id: 9,
          name: this.$t('project.endpoint.port'),
          type: 'input',
          label: 'port',
          disabled: false
        }],
      },
      searchLabel: {}, //搜索参数
      idcSelectedData: {
        id: '',
        name: '',
        location: '',
        principal: '',
        tel: ''
      },
      addIdcData: {
        id: '',
        name: '',
        location: '',
        principal: '',
        tel: ''
      },
      popIdcData: {
        id: '',
        name: '',
        location: '',
        principal: '',
        tel: ''
      },
      idcUserData: '',
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
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
            this.getTableData();
            this.rightBox.show = false;
          } else {
            this.$message.error(response.msg);
          }
        })
      });
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
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
            this.getTableData();
            this.rightBox.isEdit = false;
            this.esc();
          } else {
            this.$message.error(response.msg);
          }
        });
      } else {
        this.$post('promServer', this.promServer).then(response => {
          if (response.code === 200) {
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
            this.getTableData();
            this.rightBox.isEdit = false;
            this.esc();
          } else {
            this.$message.error(response.msg);
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
      this.$confirm(this.$t("tip.confirmDelete"), {
        confirmButtonText: this.$t("tip.yes"),
        cancelButtonText: this.$t("tip.no"),
        type: 'warning'
      }).then(() => {
        this.$delete("idc?ids=" + item.id).then(response => {
          if (response.code === 200) {
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
            this.getTableData();
            this.getIdcData();
          } else {
            this.$message.error(response.msg);
          }
        });
      });
    },
    getIdcData: function() {
      this.$get('idc', this.pageObj).then(response => {
        if (response.code === 200) {
          this.idcData = response.data.list;
          for (var i = 0; i < this.idcData.length; i++) {
            this.$set(this.idcData[i], 'oldName', this.idcData[i].name);
            this.$set(this.idcData[i], 'isEdit', false);
            this.$set(this.idcData[i], this.idcData[i].name, false)
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
      this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
      this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
      this.$get('promServer', this.searchLabel).then(response => {
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
    },
    search: function(searchObj) {
      this.searchLabel = {};
      for (let item in searchObj) {
        if (searchObj[item]) {
          this.$set(this.searchLabel, item, searchObj[item]);
        }
      }
      this.getTableData();
    },
    addNewData(type) {
      if (type === 'IDC') {
        this.$post('idc', this.addIdcData).then(res => {
          if (res.code === 200) {
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, '添加成功'),
              duration: 2000
            });
            this.getIdcData()
          }else{
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, res.msg),
              duration: 2000
            });
          }
        })
      }
    },
    getSingleIDCData(data, item) {
      if (item !== 'edit') {
        this.idcSelectedData = '';
        this.idcData.forEach(item => {
          if (item.id === data) {
            this.idcSelectedData = item
          }
        });
      } else {
        this.idcData.forEach(item => {
          if (item.id === data) {
            console.log(item)
            this.popIdcData.name = item.name
            this.popIdcData.location = item.location
            this.popIdcData.principal = item.principal
            this.popIdcData.tel = item.tel
          }
        });
      }
    },
    getUserData() {
      this.$get('sys/user/list').then(response => {

        if (response.code === 200) {
          this.idcUserData = response.data.list
        }
      })
    },
    editData(data, id, item) {
        item.id = id;
        this.$put(data, item).then(res => {
          if (res.code === 200) {
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, '修改成功'),
              duration: 2000
            })
          }else{
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, res.msg),
              duration: 2000
            })
          }
        })
    },
  },
  mounted: function() {
    this.getIdcData();
    this.getUserData();
  },
  watch: {
    'promServer.idc': function(n, o) {
      this.promServer.idcId = n.id;
    }
  }
}
</script>
