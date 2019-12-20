<template>
  <transition name="right-box">
    <div class="right-box right-box-add-endpoint" v-if="rightBox.show">
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
            <el-select @change="((val) => {})" value-key="id" popper-class="config-dropdown" v-model="currentProject" placeholder="" size="small">
              <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
          </div>
        </div>
        <!--module-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.module.module")}}</div>
          <div class="right-box-form-content">
            <el-select @change="((val) => {})" value-key="id" popper-class="config-dropdown" v-model="currentModule" placeholder="" size="small">
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
                <div @click="selectAsset(item, index)" :data="item.id" v-for="item,index in assetList" class="endpoint-sub-table-row">
                  <div class="endpoint-sub-table-col">{{item.host}}</div>
                  <div class="endpoint-sub-table-col">{{item.sn}}</div>
                </div>
              </div>
            </div>
            <!-- end--table-->
          </div>
          <div class="right-child-box endpoints-box">
            <div class="endpoints-box-module-info">
              <div class="title">{{$t('project.endpoint.moduleParameter')}}:</div>
              <el-input class="module-info module-info-port" size="mini" v-model="currentModule.port"></el-input>
              <el-popover
                placement="top"
                width="200"
                trigger="hover"
              >
                <div class="endpoint-param-pop">
                  <div v-for="item,index in currentModule.paramObj">{{item.key}}={{item.value}}</div>
                </div>
                <el-input slot="reference" disabled class="module-info module-info-param" size="mini" v-model="currentModule.param"></el-input>
              </el-popover>
              <el-input class="module-info module-info-path" size="mini" v-model="currentModule.path"></el-input>
              <el-button class="module-info module-info-cover" size="mini">{{$t('overall.cover')}}</el-button>
            </div>
            <div class="endpoints-box-endpoints">
              <el-table
                :data="endpointList"
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
                  v-for="(item, index) in endpointTableTitle"
                  v-if="item.show"
                  :width="item.width"
                  :key="`col-${index}`"
                  :label="item.label"
                >
                  <template slot-scope="scope" :column="item">
                    <span v-if="item.prop == 'asset' && scope.row[item.prop]">{{scope.row[item.prop].host}}</span>
                    <span v-else-if="item.prop == 'param'">
                      <el-popover
                        placement="top"
                        width="200"
                        trigger="hover"
                      >
                        <div class="endpoint-param-pop">
                          <div v-for="p in scope.row.paramObj">{{p.key}}={{p.value}}</div>
                        </div>
                        <span slot="reference">{{scope.row.param.length > 8 ? scope.row.param.substring(0, 8) + '...' : scope.row.param}}</span>
                      </el-popover>
                    </span>
                    <span v-else-if="item.prop == 'path'">
                      <el-popover
                        placement="top"
                        width="100"
                        trigger="hover"
                        :content="scope.row[item.prop]"
                      >
                        <span slot="reference">{{scope.row.path.length > 5 ? scope.row.path.substring(0, 5) + '...' : scope.row.path}}</span>
                      </el-popover>
                    </span>
                    <span v-else>{{scope.row[item.prop]}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="" width="56">
                  <template slot-scope="scope" :column="item">
                    <div>
                      <span class="param-box-row-symbol"><i class="el-icon-edit-outline"></i></span>
                      <span class="param-box-row-symbol"><i class="el-icon-minus"></i></span>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <div><el-button class="endpoints-clear-btn" size="mini">{{$t('overall.clear')}}</el-button></div>
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
        rightBox: {show: false, title: this.$t('project.endpoint.createEndpoint'),isEdit: false},
        editParamBox: {show: false}, //param编辑弹框
        viewParamBox: {show: false}, //param查看弹框
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

      //子弹框控制
      showEditParamBox(show) {
        this.editParamBox.show = show;
      },
      showViewParamBox(show) {
        this.viewParamBox.show = show;
      },

      /*关闭弹框*/
      esc() {
        this.rightBox.show = false;
        this.editParamBox.show = false;
        this.viewParamBox.show = false;
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
        if (!param) {
          param = [];
        }
        for (let i = 0; i < param.length; i++) {
          eval('tempParam.' + param[i].key + '="' + param[i].value + '"');
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
          }
        });
      },

      // 获取endpoint弹框中的asset子弹框里asset列表数据
      getAssetList() {
        this.$get('asset', this.assetPageObj).then(response => {
          if (response.code === 200) {
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

      // endpoint弹框中的asset子弹框里asset选择事件
      selectAsset(obj, index) {
        this.endpointList.push({
          assetId: obj.id,
          asset: obj,
          host: obj.host,
          param: this.currentModule.param,
          paramObj: this.currentModule.paramObj,
          port: this.currentModule.port,
          path: this.currentModule.path,
          moduleId: this.currentModule.id
        });
        this.assetList.splice(index, 1);
      },

      //将param转为json字符串格式
      paramToJson(param) {
        let tempParam = {};
        for (let i = 0; i < param.length; i++) {
          eval('tempParam.' + param[i].key + '="' + param[i].value + '"');
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
        this.endpoint.moduleId = this.currentModule.id;
        this.endpoint.projectId = this.currentProject.id;
        this.endpoint.param = this.paramToJson(this.endpoint.paramObj);
        this.$put('endpoint', this.endpoint).then(response => {
          if (response.code === 200) {
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
            this.esc();
            this.$emit("reload");
          } else {
            this.$message.error(response.msg);
          }
        });
      },

      //param展示悬浮框
      viewParam(item, flag, event) {
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
      this.getModuleList(this.currentProject.id);
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
  .param-box-row-symbol:first-of-type {
    font-size: 18px;
    color: #bbbbbb;
    text-align: center;
    display: inline-block;
    position: absolute;
    top: 6px;
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
    top: 9px;
    right: 14px;
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
    height: 33px;
    vertical-align: middle;
    position: absolute;
    top: 2px;
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
  .right-child-box .module-info-cover {
    right: 4px;
    height: 28px;
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
  .endpoint-sub-table-row {
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
    overflow: auto;
    height: calc(100% - 95px);
  }
  .endpoints-clear-btn {
    margin: 6px 0 0 10px;
  }
  /* end--table*/

  /* end--子弹框*/
</style>
<style>
  .module-info.el-input input {
    padding: 0 5px;
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
  .module-info-param.el-input.is-disabled .el-input__inner {
    cursor: pointer;
    background-color: white;
    border-color: #DCDFE6;
    color: #606266;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  }
  .module-info-param.el-input.is-disabled .el-input__inner:hover {
    border-color: #c0c4cc;
  }
</style>
