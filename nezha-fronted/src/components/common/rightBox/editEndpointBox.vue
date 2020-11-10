<template>
  <div class="right-box right-box-edit-endpoint" v-clickoutside="clickOutside">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button id="edit-ep-del" type="button" v-if="editEndpoint.id" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{$t("project.endpoint.editEndpoint") + "  ID：" + editEndpoint.id}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <el-scrollbar class="right-box-form-box">
      <el-form class="right-box-form  right-box-form-left" :model="editEndpoint" label-position="right" label-width="120px" :rules="rules" ref="endpointForm">
        <!--project-->
        <el-form-item :label="$t('project.project.project')" prop="project.id">
          <el-select @change="((val) => {changeProject(val);})" value-key="id" popper-class="config-dropdown" v-model="editEndpoint.projectId" placeholder="" size="small">
            <el-option :id="'edit-project-'+item.id" v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <!--module-->
        <el-form-item :label="$t('project.module.module')" prop="module.id">
          <el-select @change="((val) => {changeModule(val);})" value-key="id" popper-class="config-dropdown" v-model="editEndpoint.moduleId" placeholder="" size="small">
            <el-option :id="'edit-module-'+item.id" v-for="item in moduleList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <!--asset-->
        <el-form-item :label="$t('asset.asset')" prop="assetId">
          <el-autocomplete
            :fetch-suggestions="assetSuggestion"
            v-model.trim="editEndpoint.asset.host"
            placeholder=""
            @select="selectAsset"
            @change.native="inputAsset"
            size="small"
            value-key="host"
            popper-class="no-style-class"
            style="width: 100%;"
          >
          </el-autocomplete>
        </el-form-item>
        <!--host-->
        <el-form-item :label="$t('project.endpoint.host')" prop="host">
          <el-input placeholder="" v-model="editEndpoint.host" size="small"></el-input>
        </el-form-item>
        <!--port-->
        <el-form-item :label="$t('project.endpoint.port')" prop="port">
          <el-input placeholder="" v-model="editEndpoint.port" size="small"></el-input>
        </el-form-item>
        <!--path-->
        <el-form-item :label="$t('project.endpoint.path')" prop="path" v-if="editEndpoint.module.type.toLowerCase() == 'http'">
          <el-input placeholder="" v-model="editEndpoint.path" size="small"></el-input>
        </el-form-item>
        <!--param-->
        <el-form-item class="right-box-form-param" v-if="editEndpoint.module.type.toLowerCase() == 'http'">
          <template slot="label">
            <span>{{$t('project.endpoint.param')}}</span>
          </template>
          <div style="text-align: right">
            <button style="display: none;">第一个button会出现意料之外的hover样式，找不到原因，只好加个不可见的button规避问题</button>
            <!--<button type="button" id="edit-clear-all" @click="clearAllParam" class="nz-btn nz-btn-size-normal nz-btn-style-light">-->
              <!--<span><i class="nz-icon nz-icon-delete"></i></span>-->
            <!--</button>-->
            <span id="edit-add-param" @click="addParam" class="right-box-form-add">
              <i style="" class="nz-icon nz-icon-create-square"></i>
            </span>
          </div>
          <div class="param-box param-box-module">
            <el-scrollbar ref="paramBoxScrollbar" style="height: 100%">
              <div class="param-box-row" v-for="(item, index) in editEndpoint.paramObj">
                <el-form-item class="param-box-row-key" :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}" :prop="'paramObj.' + index + '.key'">
                  <el-input placeholder="key" size="mini" v-model="item.key"></el-input>
                </el-form-item>
                <span class="param-box-row-eq">=</span>
                <el-form-item class="param-box-row-value" :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}" :prop="'paramObj.' + index + '.value'">
                  <el-input placeholder="value" size="mini" v-model="item.value"></el-input>
                </el-form-item>
                <span class="param-box-row-symbol" @click="removeParam(index)"><i class="nz-icon nz-icon-shanchu1" style="color: #666666"></i></span>
              </div>
            </el-scrollbar>
          </div>
        </el-form-item>
        <!--label-->
        <el-form-item :label="$t('project.endpoint.labels')" class="right-box-form-param">

          <div style="text-align: right;margin-bottom: 5px">
            <button style="display: none;">第一个button会出现意料之外的hover样式，找不到原因，只好加个不可见的button规避问题</button>
            <!--<button id="module-clear-all" type="button" @click="clearAllParam" class="nz-btn nz-btn-size-normal nz-btn-style-light">-->
            <!--<span><i class="nz-icon nz-icon-delete"></i></span>-->
            <!--</button>-->
            <span id="module-add-label" type="button" @click="addLabel" class="right-box-form-add">
              <span><i style="font-size: 16px;" class="nz-icon nz-icon-create-square"></i></span>
            </span>
          </div>

          <div class="param-box param-box-module">
            <el-scrollbar ref="labelBoxScrollbar" style="height: 100%">
              <div class="param-box-row" v-for="(item, index) in endpoint.labelModule">
                <el-form-item class="param-box-row-key" :rules="[{required: true, message: $t('validate.required'), trigger: 'blur'},{ pattern: /[a-zA-Z_:][a-zA-Z0-9_:]*/, message: $t('validate.key') ,trigger: 'blur'}]" :prop="'labelModule.' + index + '.key'">
                  <el-input placeholder="key" size="mini" v-model="item.key"></el-input>
                </el-form-item>
                <span class="param-box-row-eq">=</span>
                <el-form-item class="param-box-row-value" :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}" :prop="'labelModule.' + index + '.value'">
                  <el-input placeholder="value" size="mini" v-model="item.value"></el-input>
                </el-form-item>
                <span class="param-box-row-symbol" :id="'moduel-remove-label-'+index" @click="removeLabel(index)"><i class="nz-icon nz-icon-shanchu1" style="color:#666;"></i></span>
              </div>
            </el-scrollbar>
          </div>
        </el-form-item>
      </el-form>
    </el-scrollbar>

    <!-- end--表单-->

    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button @click="esc" id="ep-edit-esc" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" id="ep-edit-save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
  export default {
    name: "endpointBox",
    props: {
      endpoint: Object,
    },
    data() {
      return {
        editEndpoint: {},
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
      //endpoint弹框中asset子弹框控制
      showSubBox(show) {
        this.subBox.show = show;
      },

      /*关闭弹框*/
      esc(refresh) {
        this.$emit("close", refresh);
      },

      /*关闭子弹框*/
      subEsc() {
        this.subBox.show = false;
      },

      clickOutside() {
        this.esc(false);
      },

      // 清除param
      clearAllParam() {
        this.endpoint.paramObj = [];
        this.$nextTick(() => {
          this.$refs.paramBoxScrollbar.update();
        });
      },

      // 新增param
      addParam() {
        this.endpoint.paramObj.push({key: '', value: ''});
        this.$nextTick(() => {
          this.$refs.paramBoxScrollbar.update();
        });
      },

      // 移除单个param
      removeParam(index) {
        this.endpoint.paramObj.splice(index, 1);
        this.$nextTick(() => {
          this.$refs.paramBoxScrollbar.update();
        });
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

      // 新增label
      addLabel() {
        console.log(123123);
        this.endpoint.labelModule.push({key: '', value: ''});
        this.$nextTick(() => {
          this.$refs.labelBoxScrollbar.update();
        });
      },
      // 移除单个Label
      removeLabel(index) {
        this.endpoint.labelModule.splice(index, 1);
        this.$nextTick(() => {
          this.$refs.labelBoxScrollbar.update();
        });
      },

      //将labels转为json字符串格式
      labelsToJson(param) {
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
        return new Promise(resolve => {
          this.$get('project', {pageSize: -1, pageNo: 1}).then(response => {
            if (response.code === 200) {
              this.projectList = response.data.list;
              if (!this.editEndpoint.projectId && this.projectList.length > 0) {
                this.editEndpoint.projectId = this.projectList[0].id;
              }
            }
            resolve();
          });
        });
      },

      //project下拉框点击事件
      changeProject(projectId) {
        this.getModuleList(projectId);
        this.editEndpoint.projectId = projectId;
        this.editEndpoint.moduleId = '';
      },

      //project下拉框点击事件
      changeModule(moduleId) {
        let newModule = this.moduleList.find(item => {return item.id == this.endpoint.moduleId});
        this.editEndpoint.moduleId = moduleId;
        this.editEndpoint.port = newModule.port;
        this.editEndpoint.path = newModule.path;
        this.editEndpoint.paramObj = newModule.paramObj;
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
        this.editEndpoint.host = obj.host;
        this.editEndpoint.assetId = obj.id;
        this.$refs.endpointForm.validate();
      },
      inputAsset(e) {
        this.editEndpoint.assetId = "";
        let host = e.target.value;
        if (host) {
          for (let i = 0; i < this.assetList.length; i++) {
            if (host == this.assetList[i].host) {
              this.editEndpoint.assetId = this.assetList[i].id;
              this.selectedAsset = this.assetList[i];
              this.editEndpoint.host = host;
              break;
            }
          }
        }
      },
      // 获取endpoint弹框中module下拉框数据
      getModuleList(projectId, setCurModule = false) {
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
            if(setCurModule){
              this.editEndpoint.moduleId = this.moduleList.find(item => {return item.id == this.editEndpoint.moduleId}).id;
            }
          }
        });
      },
      //保存endpoint
      save() {
        this.$refs.endpointForm.validate((valide=>{
          if(valide){
            this.editEndpoint.param = this.paramToJson(this.editEndpoint.paramObj);
            this.editEndpoint.labels = this.labelsToJson(this.editEndpoint.labelModule);
            let requestData = [];
            requestData.push(this.editEndpoint);
            this.$put('endpoint', requestData).then(response => {
              if (response.code === 200) {
                this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                this.esc(true);
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
          this.$delete("endpoint?ids=" + this.editEndpoint.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.esc(true);
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
      /*asset搜索建议*/
      assetSuggestion(queryString, callback) {
        let data = [];
        if (!queryString) {
          data = this.assetList;
        } else {
          for (let i = 0; i < this.assetList.length; i++) {
            if (this.assetList[i].host.indexOf(queryString.toLowerCase()) != -1) {
              data.push(this.assetList[i]);
            }
          }
        }
        callback(data);
      },
    },
    mounted() {
      this.getProjectList().then(response => {
        this.getModuleList(this.editEndpoint.projectId);
      });
      this.getAssetList();
    },
    watch: {
      endpoint:{
        immediate: true,
        deep: true,
        handler(n, o) {
          this.editEndpoint = JSON.parse(JSON.stringify(n));
        },
      },
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
