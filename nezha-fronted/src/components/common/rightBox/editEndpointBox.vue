<template>
  <transition name="right-box">
    <div class="right-box right-box-edit-endpoint" v-if="rightBox.show" v-clickoutside="clickos">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <button id="edit-ep-del" type="button" v-if="rightBox.isEdit && endpoint.id != ''" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
          <span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
        </button>
        <button id="edit-ep-edit" v-if="!rightBox.isEdit" type="button" @click="toEdit(true)" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
          <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-edit"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.edit')}}</span>
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
              <el-option :id="'edit-project-'+item.id" v-for="item in projectList" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.project.name}}</div>
          </el-form-item>
          <!--module-->
          <el-form-item :label="$t('project.module.module')" prop="module.id">
            <el-select @change="((val) => {changeModule(val);})" value-key="id" popper-class="config-dropdown" v-model="currentModule" placeholder="" v-if="rightBox.isEdit" size="small">
              <el-option :id="'edit-module-'+item.id" v-for="item in moduleList" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.module.name}}</div>
          </el-form-item>
          <!--asset-->
          <el-form-item :label="$t('asset.asset')" prop="assetId">
            <div class="right-box-form-content">
              <el-input class="right-box-row-with-btn" readonly v-if="rightBox.isEdit && endpoint.asset" placeholder="" :value="endpoint.asset.host" size="small"></el-input>
              <el-input class="right-box-row-with-btn" readonly v-if="rightBox.isEdit && !endpoint.asset" placeholder="" value="" size="small"></el-input>
              <el-popover placement="left" width="400" v-model="subBox.show" popper-class="nz-pop">
                <div class="pop-window-assetType-content">
                  <!-- begin--顶部按钮-->
                  <div class="pop-top-btns">
                    <button type="button" @click="subEsc" class="nz-btn nz-btn-size-alien nz-btn-size-small nz-btn-style-light nz-btn-min-width-35" id="edit-ep-subesc">
                      <span class="pop-top-btn-icon"><i class="el-icon-close"></i></span>
                      <span class="pop-top-btn-txt">{{$t('overall.esc')}}</span>
                    </button>
                  </div>
                  <!-- end--顶部按钮-->
                  <!--begin--标题-->
                  <div class="pop-title">{{subBox.title}}</div>
                  <!--end--标题-->
                  <!---->
                  <div class="pop-item-wider " >
                    <!-- begin--搜索框-->
                    <div class="nz-btn-group nz-btn-group-size-normal nz-btn-group-light endpoint-asset-search">
                      <button type="button" class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square nz-input-group-prepend" @click="assetSearch.dropdownShow = !assetSearch.dropdownShow">
                        <span class="endpoint-asset-label-txt">{{assetSearch.label}}</span>
                        <span>
                          <i v-if="assetSearch.dropdownShow" class="el-icon-caret-top"></i>
                          <i v-if="!assetSearch.dropdownShow" class="el-icon-caret-bottom"></i>
                        </span>
                      </button><div class="endpoint-asset-search-input">
                        <el-input class="input-x-mini-22 nz-input-group-middle" placeholder="" v-model="assetSearch.text"></el-input>
                      </div><button type="button" class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square nz-input-group-append" >
                        <i @click="searchAsset" class="el-icon-search" id="edit-ep-search-asset"></i>
                      </button>

                      <div class="endpoint-asset-search-dropdown" v-if="assetSearch.dropdownShow">
                        <div @click="dropdownSelect('IP')" class="endpoint-asset-search-dropdown-item" id="edit-ep-search-ip">IP</div>
                        <div @click="dropdownSelect('SN')" class="endpoint-asset-search-dropdown-item" id="edit-ep-search-sn">SN</div>
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
                        <div id="edit-select-asset" @click="selectAsset(item)" :data="item.id" v-for="item in assetList" class="endpoint-sub-table-row" :class="{'endpoint-sub-table-row-active': item.id == selectedAsset.id}">
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
          <!--host-->
          <el-form-item :label="$t('project.endpoint.host')" prop="host">
            <el-input v-if="rightBox.isEdit" placeholder="" v-model="endpoint.host" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.host}}</div>
          </el-form-item>
          <!--port-->
          <el-form-item :label="$t('project.endpoint.port')" prop="port">
            <el-input v-if="rightBox.isEdit" placeholder="" v-model="endpoint.port" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.port}}</div>
          </el-form-item>
          <!--path-->
          <el-form-item :label="$t('project.endpoint.path')" prop="path" v-if="currentModule.type.toLowerCase() == 'http'">
            <el-input v-if="rightBox.isEdit" placeholder="" v-model="endpoint.path" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.path}}</div>
          </el-form-item>
          <!--param-->
          <el-form-item class="right-box-form-param" v-if="currentModule.type.toLowerCase() == 'http'">
            <template slot="label">
              <span>{{$t('project.endpoint.param')}}</span>
              <div class="right-box-form-btns" v-if="rightBox.isEdit">
                <button style="display: none;">第一个button会出现意料之外的hover样式，找不到原因，只好加个不可见的button规避问题</button>
                <button type="button" id="edit-clear-all" @click="clearAllParam" class="nz-btn nz-btn-size-normal nz-btn-style-light">
                  <span class="top-tool-btn-txt">{{$t('overall.clear')}}</span>
                </button>
                <button type="button" id="edit-add-param" @click="addParam" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
                  <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
                </button>
              </div>
            </template>
            <div v-if="rightBox.isEdit" class="param-box param-box-module">
              <div class="param-box-row" v-for="(item, index) in endpoint.paramObj">
                <el-form-item class="param-box-row-key" :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}" :prop="'paramObj.' + index + '.key'">
                  <el-input placeholder="key" size="mini" v-model="item.key"></el-input>
                </el-form-item>
                <span class="param-box-row-eq">=</span>
                <el-form-item class="param-box-row-value" :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}" :prop="'paramObj.' + index + '.value'">
                  <el-input placeholder="value" size="mini" v-model="item.value"></el-input>
                </el-form-item>
                <span class="param-box-row-symbol" @click="removeParam(index)"><i class="nz-icon nz-icon-minus-square"></i></span>
              </div>
            </div>
            <div v-else v-for="(item, index) in endpoint.paramObj" v-if="!rightBox.isEdit">
              <div  class="right-box-form-content-txt">{{item.key}}={{item.value}}</div>
            </div>

          </el-form-item>
        </el-form>
      </el-scrollbar>
       
      <!-- end--表单-->

      <!--底部按钮-->
      <div class="right-box-bottom-btns">
        <button @click="esc" id="ep-edit-esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button v-if="rightBox.isEdit" @click="save" id="ep-edit-save" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>

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
          assetId: [
            {required:true,message:this.$t('validate.required'),trigger:'blur'}
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

      toEdit(show, id) {
        this.rightBox.isEdit = show;
        this.rightBox.show = true;
        if (show) {
          this.rightBox.title = this.$t("project.endpoint.editEndpoint") + "  ID：" + id;
        } else {
          this.rightBox.title = this.$t("project.endpoint.endpoint") + "  ID：" + id;
        }
      },

      //endpoint弹框中asset子弹框控制
      showSubBox(show) {
        this.subBox.show = show;
      },

      /*关闭弹框*/
      esc() {
        this.rightBox.show = false;
        this.subBox.show = false;
        this.$emit("close");
      },

      /*关闭子弹框*/
      subEsc() {
        this.subBox.show = false;
      },

      clickos() {
        this.esc();
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
        this.endpoint.asset = obj;
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
                //console.info(response.data.list[i], err);
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
.nz-btn-edit-ok{
  position: absolute;
  bottom: 0;
  right:0;
}
.nz-btn-edit-esc{
  position: absolute;
  bottom: 0;
  left:0;
}

/* begin--搜索框*/
.endpoint-asset-search {
  display: inline-block;
  position: relative;
  margin-top: -16px;
}
.endpoint-asset-search button {
  height: 22px !important;
}
.endpoint-asset-search-dropdown {
  position: absolute;
  top: 25px;
  background-color: #444;
  border-radius: 4px;
  width: 44px;
  left: 0;
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
  width: 150px;
  vertical-align: top;
}
/* end--搜索框*/

/* begin--table*/
.endpoint-sub-table {
  padding-top: 30px;
  height: 440px;
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
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
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
  height: calc(100% - 34px);
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
</style>

<style lang="scss">
  .right-box-edit-endpoint .el-pagination__total {
    float: left;
  }
  right-box-edit-endpoint .pagination {
    padding-top: 12px;
    text-align: center;
  }

  .endpoint-sub-table-paginate .el-pager li, .endpoint-sub-table-paginate .el-pagination .btn-next, .endpoint-sub-table-paginate .el-pagination .btn-prev {
    font-size: 13px;
    min-width: 20px !important;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    text-align: center;
    border: 1px solid rgba(154,154,154,0.20);
    border-radius: 2px;
    border-radius: 2px;
  }
  .endpoint-sub-table-paginate  .el-pagination.is-background .el-pager li:not(.disabled).active {
    color: white !important;
  }
  .endpoint-sub-table-paginate .el-pagination.is-background .el-pager li:not(.disabled):hover {
    color: #666;
  }
  .right-box-edit-endpoint .el-pagination .el-pager li.btn-quicknext, .right-box-edit-endpoint .el-pager li.btn-quickprev {
    line-height: 20px;
  }
  .right-box-edit-endpoint .el-pagination .el-pager .more::before {
    line-height: 20px;
  }
  .right-box-edit-endpoint .el-pager li.number{
    font-family: NotoSansSC-Regular;
    color: #666666;
    letter-spacing: 0;
    font-weight:normal;
  }
  .right-box-edit-endpoint .el-pager li.number.active{
    font-family: NotoSansSC-Regular;
    color: #FFFFFF;
    letter-spacing: 0;
  }

  .endpoint-sub-table-paginate .el-pagination.is-background .el-pager li:not(.disabled).active {
    background-color: $global-text-color-active;
    border-radius: 2px;
    border-radius: 2px;
  }
  .right-box-edit-endpoint .el-pager li:hover, .right-box-edit-endpoint .el-pagination .btn-next:hover, .right-box-edit-endpoint .el-pagination .btn-prev:hover {
    font-family: NotoSansSC-Regular;
    color: #666666;
    letter-spacing: 0;
    font-weight:normal;
  }
  .right-box-edit-endpoint .el-pagination__sizes .el-input .el-input__inner, .right-box-edit-endpoint .el-pagination__editor.el-input .el-input__inner{
    height: 20px;
    border-color: rgba(154,154,154,0.20);
  }
  .right-box-edit-endpoint .el-pagination__sizes .el-input .el-input__inner:hover{
    border-color: rgba(154,154,154,0.20);
  }
</style>
