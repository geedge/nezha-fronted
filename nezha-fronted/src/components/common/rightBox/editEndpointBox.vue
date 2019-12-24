<template>
  <transition name="right-box">
    <div class="right-box right-box-edit-endpoint" v-if="rightBox.show">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <div class="right-box-top-btn right-box-top-btn-full" @click="esc">
          <div class="right-box-btn-icon">
            <i class="el-icon-close"></i>
          </div>
          <span>{{$t('overall.esc')}}</span>
        </div>
        <div v-if="!rightBox.isEdit" class="right-box-top-btn right-box-top-btn-full" @click="toEdit(true)">
          <div class="right-box-btn-icon">
            <i class="el-icon-edit-outline"></i>
          </div>
          <span>{{$t('overall.edit')}}</span>
        </div>
        <div v-if="rightBox.isEdit" class="right-box-top-btn right-box-top-btn-full" @click="save">
          <div class="right-box-btn-icon">
            <i class="el-icon-edit-outline"></i>
          </div>
          <span v-if="rightBox.isEdit">{{$t('overall.save')}}</span>
          <span v-else>{{$t('overall.edit')}}</span>
        </div>
        <div class="right-box-top-btn" v-if="rightBox.isEdit && endpoint.id != ''" @click="del">
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
        <!--project-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.project.project")}}</div>
          <div class="right-box-form-content">
            <el-select @change="((val) => {changeProject(val);})" value-key="id" popper-class="config-dropdown" v-model="currentProject" placeholder="" v-if="rightBox.isEdit" size="small">
              <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.project.name}}</div>
          </div>
        </div>
        <!--module-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.module.module")}}</div>
          <div class="right-box-form-content">
            <el-select @change="((val) => {changeModule(val);})" value-key="id" popper-class="config-dropdown" v-model="currentModule" placeholder="" v-if="rightBox.isEdit" size="small">
              <el-option v-for="item in moduleList" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.module.name}}</div>
          </div>
        </div>
        <!--host-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.endpoint.host")}}</div>
          <div class="right-box-form-content">
            <el-input
              class="right-box-row-with-btn"
              v-if="rightBox.isEdit"
              placeholder=""
              v-model="endpoint.host"
              size="small"
            ></el-input>
            <div @click="showSubBox(true)" class="right-box-row-btn right-box-row-btn-active" v-if="rightBox.isEdit">
              <span class="el-icon-more"></span>
            </div>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.host}}</div>
          </div>
        </div>
        <!--port-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.endpoint.port")}}</div>
          <div class="right-box-form-content">
            <el-input
              v-if="rightBox.isEdit"
              placeholder=""
              v-model="endpoint.port"
              size="small"
            ></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.port}}</div>
          </div>
        </div>
        <!--path-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.endpoint.path")}}</div>
          <div class="right-box-form-content">
            <el-input
              v-if="rightBox.isEdit"
              placeholder=""
              v-model="endpoint.path"
              size="small"
            ></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.path}}</div>
          </div>
        </div>
        <!--param-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">
            {{$t("project.endpoint.param")}}
            <el-button v-if="rightBox.isEdit" class="param-btn param-btn-active margin-l-10" size="mini" @click="addParam"><i class="el-icon-plus"></i>{{$t('overall.add')}}</el-button>
            <el-button v-if="rightBox.isEdit" class="param-btn param-btn-clear" size="mini" @click="clearAllParam">{{$t('overall.clearAll')}}</el-button>
          </div>
          <div class="right-box-form-content">
            <div class="param-box param-box-endpoint" v-if="rightBox.isEdit">
              <div class="param-box-row" v-for="(item, index) in endpoint.paramObj">
                <el-input :disabled="!rightBox.isEdit" placeholder="key" class="param-box-row-key" size="mini" v-model="item.key"></el-input>
                <span class="param-box-row-eq">=</span>
                <el-input :disabled="!rightBox.isEdit" placeholder="value" class="param-box-row-value" size="mini" v-model="item.value"></el-input>
                <span v-if="rightBox.isEdit" class="param-box-row-symbol" @click="removeParam(index)"><i class="el-icon-minus"></i></span>
              </div>
            </div>
            <div v-else class="right-box-form-content-txt">
              <div v-for="(item, index) in endpoint.paramObj">{{item.key}}={{item.value}}</div>
            </div>
          </div>
        </div>
      </div>
      <!-- end--表单-->

      <!-- begin--底部按钮-->
      <div class="right-box-bottom-btns">
        <div @click="esc" :class="{'right-box-bottom-btn-50': rightBox.isEdit}" class="right-box-bottom-btn right-box-bottom-btn-cancel">{{$t('overall.cancel')}}</div><div @click="save" v-if="rightBox.isEdit" class="right-box-bottom-btn right-box-bottom-btn-50">{{$t('overall.save')}}</div>
      </div>
      <!-- end--底部按钮-->

      <!-- begin--子弹框-->
      <transition name="right-sub-box">
        <div class="right-sub-box" @click.stop v-if="subBox.show">
          <!-- begin--标题-->
          <div class="right-box-title">{{subBox.title}}</div>
          <!-- end--标题-->
          <div class="right-box-top-btn right-box-top-btn-full" @click="subEsc">
            <div class="right-box-btn-icon">
              <i class="el-icon-close"></i>
            </div>
            <span>{{$t('overall.esc')}}</span>
          </div>
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
          <!-- end--搜索框-->

          <!-- begin--table-->
          <div class="endpoint-sub-table">
            <div class="endpoint-sub-table-head">
              <div class="endpoint-sub-table-col">IP</div>
              <div class="endpoint-sub-table-col">SN</div>
            </div>
            <div class="line-100"></div>
            <div class="endpoint-sub-table-body">
              <div v-if="selectedAsset.id != ''" :data="selectedAsset.id" class="endpoint-sub-table-row endpoint-sub-table-row-selected">
                <div class="endpoint-sub-table-col">{{selectedAsset.host}}</div>
                <div class="endpoint-sub-table-col">{{selectedAsset.sn}}</div>
              </div>
              <div v-else class="endpoint-sub-table-row"></div>
              <div @click="selectAsset(item)" :data="item.id" v-for="item in assetList" class="endpoint-sub-table-row" :class="{'endpoint-sub-table-row-active': item.id == selectedAsset.id}">
                <div class="endpoint-sub-table-col">{{item.host}}</div>
                <div class="endpoint-sub-table-col">{{item.sn}}</div>
              </div>
            </div>
            <div class="endpoint-sub-table-paginate">
              <div class="endpoint-sub-table-paginate-all">All:&nbsp;{{assetPageObj.total}}</div>
              <el-pagination
                background
                :pager-count="5"
                layout="prev, pager, next"
                @current-change="(currentPage) => {getAssetList(currentPage)}"
                :total="assetPageObj.total">
              </el-pagination>
            </div>
          </div>
          <!-- end--table-->
        </div>
      </transition>
      <!-- end--子弹框-->
    </div>
  </transition>
</template>

<script>
  export default {
    name: "endpointBox",
    props: {
      endpoint: Object,
      currentProject: Object,
      currentModule: Object
    },
    data() {
      return {
        rightBox: {show: false, title: '',isEdit: false},
        subBox: {show: false, title: this.$t("overall.asset")}, //asset子弹框
        assetSearch: {host: '', sn: '', text: '', label: 'IP', dropdownShow: false}, //侧滑框中asset的搜索相关
        assetPageObj: {pageNo: 1, pageSize: 11, total: 0},
        selectedAsset: {id: '', host: '', sn: ''}, //endpoint侧滑框中选中的asset
        projectList: [],
        moduleList: [],
        assetList: []
      }
    },
    methods: {
      show(show) {
        this.rightBox.show = show;
      },

      toEdit(show) {
        this.rightBox.isEdit = show;
      },

      //endpoint弹框中asset子弹框控制
      showSubBox(show) {
        this.subBox.show = show;
      },

      /*关闭弹框*/
      esc() {
        this.rightBox.show = false;
        this.subBox.show = false;
      },

      /*关闭子弹框*/
      subEsc() {
        this.subBox.show = false;
      },

      // 清除param
      clearAllParam() {
        this.endpoint.paramObj = [];
      },

      // 新增param
      addParam() {
        this.endpoint.paramObj.push({key: '', value: ''});
      },

      // 移除单个param
      removeParam(index) {
        this.endpoint.paramObj.splice(index, 1);
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

      /*获取project列表*/
      getProjectList() {
        this.$get('project', {pageSize: 999, pageNo: 1}).then(response => {
          if (response.code === 200) {
            this.projectList = response.data.list;
            if ((!this.currentProject || !this.currentProject.id) && this.projectList.length > 0) {
              this.currentProject = this.projectList[0];
            }
          }
        });
      },

      //project下拉框点击事件
      changeProject(project) {
        this.currentModule = {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []};
        this.getModuleList(project.id);
      },

      //project下拉框点击事件
      changeModule(module) {
        this.currentModule = module;
        this.endpoint.port = module.port;
        this.endpoint.path = module.path;
        this.endpoint.paramObj = module.paramObj;
      },

      // 获取endpoint弹框中的asset子弹框里asset列表数据
      getAssetList(currentPage) {
        if (currentPage) {
          this.assetPageObj.pageNo = currentPage;
        } else {
          this.assetPageObj.pageNo = 1;
        }
        this.$get('asset', this.assetPageObj).then(response => {
          if (response.code === 200) {
            this.assetList = response.data.list;
            this.assetPageObj.total = response.data.total;
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
        this.getAssetList(false);
      },

      // endpoint弹框中的asset子弹框里asset选择事件
      selectAsset(obj) {
        this.selectedAsset = obj;
        this.endpoint.host = obj.host;
        this.endpoint.assetId = obj.id;
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
        this.endpoint.moduleId = this.currentModule.id;
        this.endpoint.projectId = this.currentProject.id;
        this.endpoint.param = this.paramToJson(this.endpoint.paramObj);
        let requestData = [];
        requestData.push(this.endpoint);
        this.$put('endpoint', requestData).then(response => {
          if (response.code === 200) {
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
            this.esc();
            this.$emit("reload");
          } else {
            this.$message.error(response.msg);
          }
        });
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
    },
    created() {
      this.getProjectList();
      this.getAssetList();
    },
    mounted() {
      setTimeout(()=>{this.getModuleList(this.currentProject.id);}, 100);
    },
    watch: {
      endpoint(n, o) {
        if (n && n.id) {
          this.rightBox.title = this.$t("project.endpoint.editEndpoint") + "  ID：" + n.id;
        } else {
          this.rightBox.title = this.$t("project.endpoint.createEndpoint");
        }
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
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    padding: 0 10px;
  }
  .param-box-endpoint {
    height: 325px;
  }
  .param-box-module {
    height: 227px;
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
    width: 41.5%;
  }
  .param-box-row-eq {
    display: inline-block;
    width: 22px;
    text-align: center;
    height: 32px;
    line-height: 32px;
    color: #c4c7cF;
  }
  .param-box-row-symbol {
    font-size: 12px;
    color: #c4c7cF;
    border: 1px solid #c4c7cF;
    text-align: center;
    height: 12px;
    width: 14px;
    display: inline-block;
    position: absolute;
    top: 17px;
    right: 25px;
    cursor: pointer;
  }
  .param-box-row-symbol>i {
    position: absolute;
    top: 1px;
    right: 1px;
  }
  /* end--param*/
  /* begin--子弹框*/
  .right-sub-box {
    width: 380px;
    height: 520px;
    position: absolute;
    right: 80px;
    z-index: 2;
    padding: 0 10px;
  }
  .right-sub-box .el-input-group {
    width: 227px;
    float: right;
    margin: 7px 0 0 0;
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
    padding-top: 25px;
  }
  .line-100 {
    margin-bottom: 3px;
  }
  .endpoint-sub-table-head {
    line-height: 28px;
    height: 30px;
  }
  .endpoint-sub-table-row {
    line-height: 28px;
    height: 30px;
    color: #656565;
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
    width: 45%;
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
  }
  /* end--table*/

  /* end--子弹框*/
</style>
