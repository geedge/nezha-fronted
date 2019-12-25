<template>
  <transition name="right-box">
    <div class="right-box right-box-add-endpoint" v-if="rightBox.show" @mousedown="showEditParamBox(false)">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <div class="right-box-top-btn right-box-top-btn-full" @click="esc">
          <div class="right-box-btn-icon">
            <i class="el-icon-close"></i>
          </div>
          <span>{{$t('overall.esc')}}</span>
        </div>
        <div class="right-box-top-btn right-box-top-btn-full" @click="save">
          <div class="right-box-btn-icon">
            <i class="el-icon-edit-outline"></i>
          </div>
          <span>{{$t('overall.save')}}</span>
        </div>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{rightBox.title}}</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <div class="right-box-form">
        <!--project-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.project.project")}}</div>
          <div class="right-box-form-content">
            <el-select @change="((val) => {changeProject(val)})" value-key="id" popper-class="config-dropdown" v-model="currentProject" placeholder="" size="small">
              <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
          </div>
        </div>
        <!--module-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.module.module")}}</div>
          <div class="right-box-form-content">
            <el-select @change="((val) => {changeModule(val)})" value-key="id" popper-class="config-dropdown" v-model="currentModuleCopy" placeholder="" size="small">
              <el-option v-for="item in moduleList" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
          </div>
        </div>
        <!--asset和endpoint-->
        <div class="right-box-form-row right-child-boxes">
          <div class="right-child-box assets-box">
            <!-- begin--标题-->
            <div class="right-child-box-title">{{$t('asset.asset')}}</div>
            <!-- end--标题-->
            <!-- begin--搜索框-->
            <el-input placeholder="" v-model="assetSearch.text">
              <template slot="prepend">
                <div class="endpoint-asset-prepend">
                  <div class="endpoint-asset-label">
                    <span class="endpoint-asset-label-txt">{{assetSearch.label}}</span>
                    <span @click="assetSearch.dropdownShow = !assetSearch.dropdownShow">
                      <i v-if="assetSearch.dropdownShow" class="el-icon-arrow-up"></i>
                      <i v-if="!assetSearch.dropdownShow" class="el-icon-arrow-down"></i>
                    </span>
                  </div>
                  <div class="endpoint-asset-dropdown" v-if="assetSearch.dropdownShow">
                    <div @click="dropdownSelect('IP')" class="endpoint-asset-dropdown-item">IP</div>
                    <div @click="dropdownSelect('SN')" class="endpoint-asset-dropdown-item">SN</div>
                  </div>
                </div>
              </template>
              <template slot="append"><i @click="searchAsset" class="el-icon-search"></i></template>
            </el-input>
            <!--end--搜索框-->
            <!-- begin--table-->
            <div class="endpoint-sub-table">
              <div class="endpoint-sub-table-head">
                <div class="endpoint-sub-table-col">IP</div>
                <div class="endpoint-sub-table-col">SN</div>
              </div>
              <div class="line-100"></div>
              <div class="endpoint-sub-table-body">
                <div v-if="!currentModuleCopy.id" class="endpoint-sub-table-body-dialog"></div>
                <div @click="selectAsset(item, index)" :data="item.id" v-for="item,index in assetList" class="endpoint-sub-table-row">
                  <div class="endpoint-sub-table-col">{{item.host}}</div>
                  <div class="endpoint-sub-table-col">{{item.sn}}</div>
                </div>
              </div>
            </div>
            <!-- end--table-->
          </div>
          <!--右侧endpoint列表-->
          <div class="right-child-box endpoints-box">
            <!--module-->
            <div class="endpoints-box-module-info">
              <div class="title">{{$t('project.endpoint.moduleParameter')}}:</div>
              <el-input class="module-info module-info-port" size="mini" v-model="currentModuleCopy.port"></el-input>
              <el-popover
                placement="bottom"
                width="200"
                trigger="hover"
              >
                <div class="endpoint-param-pop">
                  <div v-for="item,index in currentModuleCopy.paramObj">{{item.key}}={{item.value}}</div>
                </div>
                <el-input @click.native.stop="showEditParamBox(true, currentModuleCopy, 1, $event)" slot="reference" disabled class="module-info module-info-param" size="mini" v-model="currentModuleCopy.param"></el-input>
              </el-popover>
              <el-input class="module-info module-info-path" size="mini" v-model="currentModuleCopy.path"></el-input>
              <el-button class="module-info module-info-cover" size="mini" @click="coverEndpoint">{{$t('overall.cover')}}</el-button>
            </div>
            <!--endpoints-->
            <div class="endpoints-box-endpoints">
              <el-table
                :data="endpointList"
                ref="endpointTable"
                style="width: 100%;border-radius: 4px;"
                height="calc(100% - 40px)"
                empty-text=" ">
                <el-table-column
                  type="selection"
                  width="25"
                style="padding: 0 1px;">
                </el-table-column>
                <el-table-column
                  label-class-name="endpoints-box-endpoints-title"
                  v-for="(title, index) in endpointTableTitle"
                  v-if="title.show"
                  :width="title.width"
                  :key="`col-${index}`"
                  :label="title.label"
                >
                  <template slot-scope="scope" :column="title">
                    <span v-if="title.prop == 'asset' && scope.row[title.prop]">{{scope.row[title.prop].host}}</span>
                    <span v-else-if="title.prop == 'param'">
                      <el-popover
                        placement="bottom"
                        width="200"
                        trigger="hover"
                      >
                        <div class="endpoint-param-pop">
                          <div v-for="p in scope.row.paramObj">{{p.key}}={{p.value}}</div>
                        </div>
                        <span slot="reference">
                          <span @mousedown.stop v-if="!scope.row.isEdit">{{scope.row.param.length > 8 ? scope.row.param.substring(0, 8) + '...' : scope.row.param}}</span>
                          <span @mousedown.stop v-else @click.stop="showEditParamBox(true, scope.row, 2, $event)"><el-input disabled class="endpoint-info endpoint-info-param" size="mini" v-model="scope.row.param"></el-input></span>
                        </span>
                      </el-popover>
                    </span>
                    <span v-else-if="title.prop == 'path'">
                      <el-popover
                        placement="bottom"
                        width="100"
                        trigger="hover"
                        :content="scope.row[title.prop]"
                      >
                        <span slot="reference">
                          <span v-if="!scope.row.isEdit">{{scope.row.path.length > 5 ? scope.row.path.substring(0, 5) + '...' : scope.row.path}}</span>
                          <span @mousedown.stop v-else><el-input size="mini" class="endpoint-info" v-model="scope.row.path"></el-input></span>
                        </span>
                      </el-popover>
                    </span>
                    <span v-else-if="title.prop == 'port'">
                      <span v-if="!scope.row.isEdit">{{scope.row.port}}</span>
                      <span @mousedown.stop v-else><el-input size="mini" class="endpoint-info" v-model="scope.row.port"></el-input></span>
                    </span>
                    <span v-else-if="title.prop == 'host'">
                      <span v-if="!scope.row.isEdit">{{scope.row.host}}</span>
                      <span @mousedown.stop v-else><el-input size="mini" class="endpoint-info" v-model="scope.row.host"></el-input></span>
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="" width="56">
                  <template slot-scope="scope" :column="title">
                    <div>
                      <span v-if="!scope.row.isEdit" class="endpoint-box-row-symbol" @click="toEditEndpoint(scope.row)"><i class="el-icon-edit-outline"></i></span>
                      <span v-else class="endpoint-box-row-symbol" @click="editEndpoint(scope.row)"><i class="el-icon-check"></i></span>
                      <span class="endpoint-box-row-symbol" @click="removeEndpoint(scope.row)"><i class="el-icon-minus"></i></span>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <div>
                <el-button class="endpoints-clear-btn" size="mini" @click="clearSelection">{{$t('overall.clear')}}</el-button>
                <span style="display: inline-block; float: right;line-height: 39px;padding-right: 15px;">All: {{this.endpointList.length}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- end--表单-->

      <!-- begin--底部按钮-->
      <div class="right-box-bottom-btns">
        <div @click="esc" class="right-box-bottom-btn right-box-bottom-btn-cancel right-box-bottom-btn-50">{{$t('overall.cancel')}}</div><div @click="save" class="right-box-bottom-btn right-box-bottom-btn-50">{{$t('overall.create')}}</div>
      </div>
      <!-- end--底部按钮-->

      <!--start--param编辑框-->
      <transition name="right-sub-box">
        <div @mousedown.stop class="right-sub-box" v-if="editParamBox.show" :style="'top: ' + editParamBox.top + 'px; left: ' + editParamBox.left + 'px;'">
          <div class="param-box">
            <div class="param-box-row" v-for="(item, index) in tempParamObj">
              <el-input placeholder="key" class="param-box-row-key" size="mini" v-model="item.key"></el-input>
              <span class="param-box-row-eq">=</span>
              <el-input placeholder="value" class="param-box-row-value" size="mini" v-model="item.value"></el-input>
              <span class="param-box-row-symbol" @click="removeParam(index)"><i class="el-icon-minus"></i></span>
            </div>
          </div>
          <div style="width: 100%; text-align: center; height: 25px;">
            <el-button @click="addParam" style="height: 18px; line-height: 18px; padding-top: 0; padding-bottom: 0;" size="mini"><i class="el-icon-plus"></i></el-button>
          </div>
        </div>
      </transition>
      <!--end--param编辑框-->
    </div>
  </transition>
</template>

<script>
  export default {
    name: "endpointBox",
    props: {
      currentProject: Object,
      currentModule: Object
    },
    data() {
      return {
        currentModuleCopy: {},
        tempParamObj: [],
        tempEndpoint: {},
        rightBox: {show: false, title: this.$t('project.endpoint.createEndpoint'),isEdit: false},
        editParamBox: {show: false, top: 0, left: 0, type: 0}, //param编辑弹框
        moduleParamShow: false, //module默认参数param悬浮窗
        assetSearch: {host: '', sn: '', text: '', label: 'IP', dropdownShow: false}, //侧滑框中asset的搜索相关
        assetPageObj: {pageNo: 1, pageSize: 9999},
        selectedAssets: [], //侧滑框中选中的asset
        projectList: [],
        moduleList: [],
        assetList: [],
        endpointList: [],
        endpointTableTitle: [
          {
            label: this.$t("project.endpoint.asset"),
            prop: 'asset',
            width: 123,
            show: true,
          },{
            label: this.$t("project.endpoint.host"),
            prop: 'host',
            width: 123,
            show: true,
          },{
            label: this.$t("project.endpoint.port"),
            prop: 'port',
            width: 55,
            show: true,
          },{
            label: this.$t("project.endpoint.param"),
            prop: 'param',
            width: 93,
            show: true,
          },{
            label: this.$t("project.endpoint.path"),
            prop: 'path',
            width: 63,
            show: true,
          }
        ],
      }
    },
    methods: {
      show(show) {
        this.rightBox.show = show;
      },

      //子弹框控制  obj: module或endpoint对象  type:1module2endpoint
      showEditParamBox(show, obj, type, e) {
        if (show) {
          let position = e.target.getBoundingClientRect();
          this.editParamBox.type = type;
          if (this.editParamBox.type == 2) {
            this.tempEndpoint = obj;
          }
          this.editParamBox.top = position.top - 234;
          this.editParamBox.left = position.left - 48;
          if (!obj.param) {
            this.$set(obj, 'paramObj', []);
            this.tempParamObj = [];
          } else {
            this.tempParamObj = JSON.parse(JSON.stringify(obj.paramObj));
          }
        } else {
          if (this.endpointList.length > 0) {
            for (let i = 0; i < this.endpointList.length; i++) {
              this.endpointList[i].isEdit = false;
            }
          }
          if (!this.editParamBox.show) {
            return;
          }
          if (this.editParamBox.type == 1) {
            this.currentModuleCopy.paramObj = this.tempParamObj;
            this.currentModuleCopy.param = this.paramToJson(this.tempParamObj);
          } else if (this.editParamBox.type == 2) {
            for (let i = 0; i < this.endpointList.length; i++) {
              if (this.endpointList[i].asset.id == this.tempEndpoint.asset.id) {
                this.endpointList[i].param = this.paramToJson(this.tempParamObj);
                this.endpointList[i].paramObj = this.tempParamObj;
                break;
              }
            }
          }
          this.tempParamObj = [];
        }
        this.editParamBox.show = show;
      },

      /*关闭弹框*/
      esc() {
        this.rightBox.show = false;
        this.editParamBox.show = false;
      },

      // 新增param
      addParam() {
        this.tempParamObj.push({key: '', value: ''});
      },

      // 移除单个param
      removeParam(index) {
        this.tempParamObj.splice(index, 1);
      },

      //编辑endpoint
      toEditEndpoint(endpoint) {
        endpoint.isEdit = true;
      },
      editEndpoint(endpoint) {
        endpoint.isEdit = false;
      },

      //移除endpoint
      removeEndpoint(endpoint) {
        endpoint.isEdit = false;
        for (let i = 0; i < this.endpointList.length; i++) {
          if (this.endpointList[i].assetId == endpoint.assetId) {
            this.endpointList.splice(i, 1);
            this.assetList.unshift(endpoint.asset);
            i--;
            break;
          }
        }
      },

      /*获取project列表*/
      getProjectList() {
        this.$get('project', {pageSize: 999, pageNo: 1}).then(response => {
          if (response.code === 200) {
            this.projectList = response.data.list;
            if (this.moduleList.length == 0) {
              this.getModuleList(this.currentProject.id);
            }
          }

        });
      },

      // 获取endpoint弹框中的asset子弹框里asset列表数据
      getAssetList() {
        this.$get('asset', this.assetPageObj).then(response => {
          if (response.code === 200) {
            let respData = response.data.list;
            for (let i = 0; i < respData.length; i++) {
              for (let j = 0; j < this.endpointList.length; j++) {
                if (respData[i].id == this.endpointList[j].assetId) {
                  respData.splice(i, 1);
                  i--;
                  break;
                }
              }
            }
            this.assetList = response.data.list;
          }
        });
      },

      //endpoint弹框中的asset子弹框搜索
      searchAsset() {
        if (this.assetSearch.label == 'IP') {
          this.assetSearch.host = this.assetSearch.text;
          this.assetSearch.sn = '';
        } else if (this.assetSearch.label == 'SN') {
          this.assetSearch.sn = this.assetSearch.text;
          this.assetSearch.host = '';
        }
        this.assetPageObj = Object.assign({}, this.assetPageObj, this.assetSearch);
        this.getAssetList();
      },

      changeProject(project) {
        this.currentModuleCopy = {};
        this.editParamBox.show = false;
        this.tempParamObj = [];
        this.endpointList = [];
        this.getAssetList();
      },

      changeModule(module) {
        this.editParamBox.show = false;
        this.tempParamObj = [];
      },

      //清空勾选的endpoint
      clearSelection() {
        let selections = this.$refs.endpointTable.selection;
        if (selections && selections.length > 0) {
          for (let i = 0; i < selections.length; i++) {
            this.removeEndpoint(selections[i])
          }
        }
      },

      // endpoint弹框中的asset子弹框里asset选择事件
      selectAsset(obj, index) {
        this.endpointList.push({
          isEdit: false,
          assetId: obj.id,
          asset: obj,
          host: obj.host,
          param: this.currentModuleCopy.param,
          paramObj: this.currentModuleCopy.paramObj,
          port: this.currentModuleCopy.port,
          path: this.currentModuleCopy.path,
          moduleId: this.currentModuleCopy.id
        });
        this.assetList.splice(index, 1);
      },

      //将param转为json字符串格式
      paramToJson(param) {
        let tempParam = {};
        for (let i = 0; i < param.length; i++) {
          eval('tempParam["' + param[i].key + '"]="' + param[i].value + '"');
        }
        let jsonString = JSON.stringify(tempParam);
        if (jsonString == '{}') {
          return "";
        } else {
          return jsonString;
        }
      },

      // 获取endpoint弹框中module下拉框数据
      getModuleList(projectId) {
        this.$get('module', {projectId: projectId}).then(response => {
          if (response.code === 200) {
            for (let i = 0; i < response.data.list.length; i++) {
              try {
                let tempObj = JSON.parse(response.data.list[i].param);
                response.data.list[i].paramObj = [];
                for (let k in tempObj) {
                  response.data.list[i].paramObj.push({key: k, value: tempObj[k]})
                }
              } catch(err) {
                console.info(response.data.list[i], err);
              }
            }
            this.moduleList = response.data.list;
          }
        });
      },

      //保存endpoint
      save() {
        this.$post('endpoint', this.endpointList).then(response => {
          if (response.code === 200) {
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
            this.esc();
            this.$emit("reload");
          } else {
            this.$message.error(response.msg);
          }
        });
      },

      //覆盖endpoint的port/path/param
      coverEndpoint() {
        if (this.endpointList.length > 0) {
          for (let i = 0; i < this.endpointList.length; i++) {
            this.endpointList[i].port = this.currentModuleCopy.port;
            this.endpointList[i].param = this.currentModuleCopy.param;
            this.endpointList[i].paramObj = this.currentModuleCopy.paramObj;
            this.endpointList[i].path = this.currentModuleCopy.path;
          }
          this.$message({duration: 1000, type: 'success', message: this.$t("tip.coverSuccess")});
        }
      },

      //删除endpoint
      del() {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("endpoint?ids=" + this.endpoint.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.$emit('reload');
              this.rightBox.show = false;
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },
      // endpoint弹框的asset子弹框顶部搜索条件选中事件
      dropdownSelect(label) {
        this.assetSearch.label = label;
        this.assetSearch.dropdownShow = false;
      },

      clearEndpoints() {
        this.getAssetList();
        this.endpointList = [];
      }
    },
    created() {
      this.getProjectList();
      this.getAssetList();
    },
    watch: {
      currentProject(n, o) {
        this.getModuleList(n.id);
      },
      currentModule(n, o) {
        this.currentModuleCopy = JSON.parse(JSON.stringify(n));
      }
    }
  }
</script>

<style scoped>
  /* start--param*/
  .param-btn {
    float: right;
    height: 27px;
    margin-top: -3px;
  }
  .param-btn-active {
    background-color: #656565;
    color: white;
    border: 1px solid #656565;
  }
  .param-btn-active:hover, .param-btn-active:focus {
    background-color: #656565;
    color: white;
  }
  .param-btn-clear {
    background-color: #D4D4D4;
    border: 1px solid #D4D4D4;
    color: white;
  }
  .param-btn-clear:hover, .param-btn-clear:focus {
    background-color: #D4D4D4;
    color: white;
  }

  .param-box {
    height: 200px;
    overflow: auto;
  }
  .param-box-row {
    padding: 7px 0 0 0;
    position: relative;
  }
  .param-box-row:last-of-type {
    padding-bottom: 7px;
  }
  .param-box-row-key, .param-box-row-value {
    display: inline-block;
    width: 50px;
  }
  .param-box-row-eq {
    display: inline-block;
    width: 18px;
    text-align: center;
    height: 22px;
    line-height: 22px;
    color: #c4c7cF;
  }
  .param-box-row-symbol:first-of-type {
    font-size: 18px;
    color: #bbbbbb;
    text-align: center;
    display: inline-block;
    position: absolute;
    top: 7px;
    right: 34px;
    cursor: pointer;
  }
  .param-box-row-symbol:last-of-type {
    font-size: 12px;
    color: #bbbbbb;
    border: 1px solid #bbbbbb;
    text-align: center;
    height: 12px;
    width: 14px;
    display: inline-block;
    position: absolute;
    top: 12px;
    left: 135px;
    cursor: pointer;
  }
  .param-box-row-symbol>i {
    position: absolute;
    top: 1px;
    right: 1px;
  }
  /* end--param*/

  /* begin--小盒子*/
  .right-child-boxes {
    height: calc(100% - 279px);
    position: relative;
  }
  .endpoint-to-right-symbol {
    position: absolute;
    top: calc(50% - 28px);
    left: 274px;
    cursor: pointer;
    font-size: 18px;
  }
  .right-child-box {
    height: 100%;
  }
  .assets-box {
    float: left;
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    width: 260px;
  }
  .endpoints-box {
    margin: 0 0 0 280px;
    width: 540px;
  }
  .right-child-box .el-input-group {
    width: 187px;
    float: right;
    margin: 7px 5px 0 0;
  }
  .right-child-box .module-info .el-input {
    display: inline-block;
  }

  .right-child-box .module-info {
    display: inline-block;
    height: 24px;
    vertical-align: middle;
    position: absolute;
    top: 5px;
  }
  .right-child-box-title {
    padding: 9px 0 0 4px;
    display: inline-block;
  }
  .endpoints-box-module-info {
    background: #eeeeee;
    width: 100%;
    height: 33px;
    position: relative;
  }
  .endpoints-box-module-info .title {
    line-height: 33px;
    color: #5e5e5e;
    padding-left: 5px;
    display: inline-block;
  }
  .module-info-port {
    width: 55px;
    right: 210px;
  }
  .module-info-param {
    width: 88px;
    right: 118px;
  }
  .module-info-path {
    width: 60px;
    right: 52px;
  }
  .endpoint-info-param {
    width: 80px;
  }
  .right-child-box .module-info-cover {
    right: 4px;
    height: 24px;
    padding: 5px 5px;
    background: #656565;
    color: white;
    border-radius: 4px;
  }
  .endpoints-box-endpoints {
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    height: calc(100% - 39px);
    margin-top: 6px;
  }
  .endpoint-param-pop{
    max-height: 200px;
    overflow: auto;
  }
  /* end--小盒子*/

  /* begin--子弹框*/
  .right-sub-box {
    width: 170px;
    height: 225px;
    position: fixed;
    z-index: 2;
    padding: 0 0 0 10px;
  }
  /* begin--搜索框*/
  .endpoint-asset-prepend {
    border-radius: 4px 0 0 4px;
  }
  .endpoint-asset-label {
    line-height: 26px;
    height: 26px;
  }
  .endpoint-asset-dropdown {
    position: absolute;
    top: 27px;
    background-color: #656565;
    border-radius: 4px;
    width: 52px;
    left: 0;
  }
  .endpoint-asset-dropdown-item {
    text-align: center;
    line-height: 22px;
    height: 22px;
    cursor: default;
  }
  .endpoint-asset-label-txt {
    display: inline-block;
    width: 19px;
    text-align: center;
  }
  .endpoint-asset-dropdown-item:first-of-type {
    border-radius: 4px 4px 0 0;
  }
  .endpoint-asset-dropdown-item:last-of-type {
    border-radius: 0 0 4px 4px;
  }
  .endpoint-asset-dropdown-item:hover {
    background-color: #3a8ee6;
  }
  /* end--搜索框*/
  /* begin--table*/
  .endpoint-sub-table {
    padding-top: 15px;
    height: 100%;
  }
  .line-100 {
    margin-bottom: 3px;
  }
  .endpoint-sub-table-head {
    line-height: 28px;
    height: 30px;
  }
  .endpoint-sub-table-row, .endpoint-sub-table-row-disabled {
    line-height: 28px;
    height: 30px;
    color: #656565;
  }
  .endpoint-sub-table-row:hover {
    background-color: #dadada;
    cursor: default;
  }
  .endpoint-sub-table-row-active {
    background-color: #dadada;
  }
  .endpoint-sub-table-row-selected {
    background-color: #656565;
    color: white;
  }
  .endpoint-sub-table-col {
    display: inline-block;
    width: calc(50% - 15px);
    padding-left: 10px;
  }
  .endpoint-sub-table-paginate-all {
    position: absolute;
    left: 10px;
    bottom: 17px;
    color: #5a5a5a;
  }
  .endpoint-sub-table-body {
    font-size: 15px;
    position: relative;
    overflow: auto;
    height: calc(100% - 95px);
  }
  .endpoint-sub-table-body-dialog {
    width: 100%;
    height: 100%;
    background-color: #e9ebec;
    position: absolute;
    opacity: 0.2;
  }
  .endpoints-clear-btn {
    margin: 6px 0 0 10px;
  }
  /* end--table*/

  /* end--子弹框*/
</style>
<style>
  .endpoints-box-module-info .el-input input,
  .endpoints-box-endpoints .el-input input,
  .right-sub-box .el-input input{
    padding: 0 5px;
    height: 24px;
    line-height: 24px;
  }
  .endpoints-box-endpoints-title {
    color: black;
    font-weight: 400;
  }
  .endpoints-box-endpoints .el-table td, .el-table th {
    padding: 5px 0 !important;
  }
  .endpoints-box-endpoints .cell {
    padding: 0 2px 0 10px;
  }
  .endpoints-box-endpoints .el-table .el-table__row td{
    padding: 5px 0;
  }
  .module-info-param.el-input.is-disabled .el-input__inner, .endpoint-info-param.el-input.is-disabled .el-input__inner,
  .endpoint-info-param.el-input.is-disabled .el-input__inner, .endpoint-info-param.el-input.is-disabled .el-input__inner {
    cursor: pointer;
    background-color: white;
    border-color: #DCDFE6;
    color: #606266;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  }
  .module-info-param.el-input.is-disabled .el-input__inner:hover, .endpoint-info-param.el-input.is-disabled .el-input__inner:hover,
  .endpoint-info-param.el-input.is-disabled .el-input__inner:hover, .endpoint-info-param.el-input.is-disabled .el-input__inner:hover {
    border-color: #c0c4cc;
  }
</style>
