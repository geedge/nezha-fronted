<template>
  <transition name="right-box">
    <div class="right-box right-box-edit-endpoint" v-if="rightBox.show">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <button type="button" v-if="rightBox.isEdit && endpoint.id != ''" @click="del" class="nz-btn nz-btn-size-normal nz-btn-style-light">
          <span class="top-tool-btn-txt">{{$t('overall.delete')}}</span>
        </button>
        <button v-if="!rightBox.isEdit" type="button" @click="toEdit(true)" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
          <span class="top-tool-btn-txt">{{$t('overall.edit')}}</span>
        </button>
        <button v-if="rightBox.isEdit" type="button" @click="save" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
          <span class="top-tool-btn-txt">{{$t('overall.save')}}</span>
        </button>
        <button type="button" @click="esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-style-square">
          <span class="top-tool-btn-txt"><i class="el-icon-close"></i></span>
        </button>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{rightBox.title}}</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <el-scrollbar class="right-box-form-box">
        <el-form class="right-box-form" :model="endpoint" label-position="top" :rules="rules" ref="endPointForm">
          <!--project-->
          <el-form-item :label="$t('project.project.project')" prop="project.id">
            <el-select @change="((val) => {changeProject(val);})" value-key="id" popper-class="config-dropdown" v-model="currentProject" placeholder="" v-if="rightBox.isEdit" size="small">
              <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.project.name}}</div>
          </el-form-item>
          <!--module-->
          <el-form-item :label="$t('project.module.module')" prop="module.id">
            <el-select @change="((val) => {changeModule(val);})" value-key="id" popper-class="config-dropdown" v-model="currentModule" placeholder="" v-if="rightBox.isEdit" size="small">
              <el-option v-for="item in moduleList" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.module.name}}</div>
          </el-form-item>
          <!--host-->
          <el-form-item :label="$t('project.endpoint.host')" prop="host">
            <div class="right-box-form-content">
              <el-input class="right-box-row-with-btn" v-if="rightBox.isEdit" placeholder="" v-model="endpoint.host" size="small"></el-input>
              <el-popover placement="left"width="400" v-model="subBox.show">
                <div class="pop-window-assetType-content">
                  <!-- begin--顶部按钮-->
                  <div class="pop-top-btns">
                    <button type="button" @click="subEsc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-style-square">
                      <span class="top-tool-btn-txt"><i class="el-icon-close"></i></span>
                    </button>
                  </div>
                  <!-- end--顶部按钮-->
                  <!--begin--标题-->
                  <div class="pop-title">{{subBox.title}}</div>
                  <!--end--标题-->
                  <!---->
                  <div class="pop-item-wider " >
                    <!-- begin--搜索框-->
                    <div class="endpoint-asset-search">
                      <button type="button" class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square nz-input-group-prepend" @click="assetSearch.dropdownShow = !assetSearch.dropdownShow">
                        <span class="endpoint-asset-label-txt">{{assetSearch.label}}</span>
                        <span>
                          <i v-if="assetSearch.dropdownShow" class="el-icon-caret-top"></i>
                          <i v-if="!assetSearch.dropdownShow" class="el-icon-caret-bottom"></i>
                        </span>
                      </button>
                      <div class="endpoint-asset-search-input">
                        <el-input class="input-x-mini nz-input-group-middle" placeholder="" v-model="assetSearch.text"></el-input>
                      </div>
                      <button type="button" class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square nz-input-group-append">
                        <i @click="searchAsset" class="el-icon-search"></i>
                      </button>

                      <div class="endpoint-asset-search-dropdown" v-if="assetSearch.dropdownShow">
                        <div @click="dropdownSelect('IP')" class="endpoint-asset-search-dropdown-item">IP</div>
                        <div @click="dropdownSelect('SN')" class="endpoint-asset-search-dropdown-item">SN</div>
                      </div>
                    </div>
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
                        <el-pagination background :pager-count="5" layout="prev, pager, next" @current-change="(currentPage) => {getAssetList(currentPage)}" :total="assetPageObj.total"></el-pagination>
                      </div>
                    </div>
                    <!-- end--table-->
                  </div>
                </div>
                <div slot="reference" @click.prevent="" class="right-box-row-btn" v-if="rightBox.isEdit">
                  <span class="el-icon-more"></span>
                </div>
              </el-popover>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.host}}</div>
            </div>
          </el-form-item>
          <!--port-->
          <el-form-item :label="$t('project.endpoint.port')" prop="port">
            <el-input v-if="rightBox.isEdit" placeholder="" v-model="endpoint.port" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.port}}</div>
          </el-form-item>
          <!--path-->
          <el-form-item :label="$t('project.endpoint.port')" prop="path">
            <el-input v-if="rightBox.isEdit" placeholder="" v-model="endpoint.path" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.path}}</div>
          </el-form-item>
          <!--param-->
          <el-form-item class="right-box-form-param">
            <template slot="label">
              <span>{{$t('project.endpoint.param')}}</span>
              <div class="right-box-form-btns" v-if="rightBox.isEdit">
                <button style="display: none;">第一个button会出现意料之外的hover样式，找不到原因，只好加个不可见的button规避问题</button>
                <button type="button" @click="clearAllParam" class="nz-btn nz-btn-size-small nz-btn-style-light">
                  <span class="top-tool-btn-txt">{{$t('overall.clearAll')}}</span>
                </button>
                <button type="button" @click="addParam" class="nz-btn nz-btn-size-small nz-btn-style-normal">
                  <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
                </button>
              </div>
            </template>
            <div class="param-box param-box-module">
              <div class="param-box-row" v-for="(item, index) in endpoint.paramObj" v-if="rightBox.isEdit">
                <el-form-item class="param-box-row-key" :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}" :prop="'paramObj.' + index + '.key'">
                  <el-input placeholder="key" size="mini" v-model="item.key"></el-input>
                </el-form-item>
                <span class="param-box-row-eq">=</span>
                <el-form-item class="param-box-row-value" :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}" :prop="'paramObj.' + index + '.value'">
                  <el-input placeholder="value" size="mini" v-model="item.value"></el-input>
                </el-form-item>
                <span class="endpoint-box-row-symbol" @click="removeParam(index)"><i class="nz-icon nz-icon-minus-square"></i></span>
              </div>
              <div class="param-box-row" v-for="(item, index) in endpoint.paramObj" v-if="!rightBox.isEdit">
                <div  class="right-box-form-content-txt">{{item.key}}={{item.value}}</div>
              </div>
            </div>

          </el-form-item>
        </el-form>
      </el-scrollbar>
      <!-- end--表单-->

      <!-- begin--子弹框-->
      <!--<transition name="right-sub-box">
        <div class="right-sub-box" @click.stop v-if="subBox.show">
          &lt;!&ndash; begin&#45;&#45;标题&ndash;&gt;
          <div class="right-box-title">{{subBox.title}}</div>
          &lt;!&ndash; end&#45;&#45;标题&ndash;&gt;
          <div class="right-box-top-btn right-box-top-btn-full" @click="subEsc">
            <div class="right-box-btn-icon">
              <i class="el-icon-close"></i>
            </div>
            <span>{{$t('overall.esc')}}</span>
          </div>
          &lt;!&ndash; begin&#45;&#45;搜索框&ndash;&gt;
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
          &lt;!&ndash; end&#45;&#45;搜索框&ndash;&gt;

          &lt;!&ndash; begin&#45;&#45;table&ndash;&gt;
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
              <el-pagination background :pager-count="5" layout="prev, pager, next" @current-change="(currentPage) => {getAssetList(currentPage)}" :total="assetPageObj.total"></el-pagination>
            </div>
          </div>
          &lt;!&ndash; end&#45;&#45;table&ndash;&gt;
        </div>
      </transition>-->
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
        assetList: [],
        rules:{
          'project.id':[
            {required:true,message:this.$t('validate.required'),trigger:'change'}
          ],
          'module.id':[
            {required:true,message:this.$t('validate.required'),trigger:'change'}
          ],
          port:[
            {required:true,message:this.$t('validate.required'),trigger:'blur'}
          ],
          path:[
            {required:true,message:this.$t('validate.required'),trigger:'blur'}
          ]
        }
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
        this.$refs.endPointForm.validate((valide=>{
          if(valide){
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
          }else{
            return false;
          }
        }))

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
    computed: {
      projectListReloadWatch() {
        return this.$store.state.projectListChange;
      },
      moduleListReloadWatch() {
        return this.$store.state.moduleListChange;
      },
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
      },
      projectListReloadWatch(n, o) {
        this.getProjectList();
      },
      moduleListReloadWatch(n, o) {
        this.getModuleList(this.currentProject.id);
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
  .pop-item-wider{
    padding-top:5px;
    height: 400px;
  }
  /* begin--搜索框*/
  .endpoint-asset-search {
    display: inline-block;
    float: left;
    padding: 7px 8px 0 0;
    position: relative;
  }
  .endpoint-asset-search-dropdown {
    position: absolute;
    top: 34px;
    background-color: #444;
    border-radius: 4px;
    width: 44px;
    left: 0;
    z-index: 1;
  }
  .endpoint-asset-search-dropdown-item {
    text-align: center;
    line-height: 22px;
    height: 22px;
    cursor: default;
    color: white;
    font-size: 12px;
  }
  .endpoint-asset-label-txt {
    display: inline-block;
    width: 19px;
    text-align: center;
  }
  .endpoint-asset-search-dropdown-item:first-of-type {
    border-radius: 4px 4px 0 0;
  }
  .endpoint-asset-search-dropdown-item:last-of-type {
    border-radius: 0 0 4px 4px;
  }
  .endpoint-asset-search-dropdown-item:hover {
    background-color: #222;
    color: #ff9900;
  }
  .endpoint-asset-search-input {
    display: inline-block;
    width: 100px;
    vertical-align: middle;
  }
  /* end--搜索框*/
  /* begin--table*/
  .endpoint-sub-table {
    margin-top:20px;
    padding-top: 15px;
    height: calc(100% - 45px);
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
    margin-bottom: 5px;
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
    height: calc(100% - 54px);
  }
  .endpoint-sub-table-body-dialog {
    width: 100%;
    height: 100%;
    background-color: #e9ebec;
    position: absolute;
    opacity: 0.2;
  }
  .endpoints-clear-btn {
    margin: 6px 0 0 7px;
  }
  /* end--table*/

  /* end--子弹框*/
</style>
