<template>
  <div class="right-box right-box-add-endpoint" :class="{'right-box-add-endpoint-snmp': currentModuleCopy.type && currentModuleCopy.type.toLowerCase() == 'snmp'}" @mousedown="showEditParamBox(false)" v-clickoutside="clickOutside">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns"></div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{$t("overall.createEndpoint")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <el-scrollbar class="right-box-form-box">
      <el-form class="right-box-form right-box-form-left" label-position="right" ref="addEndpoint" :model="endpoint" :rules="rules">
        <!--project-->
        <el-form-item :label='$t("project.project.project")' prop="projectId" class="select-warp">
          <el-select @change="((val) => {changeProject(val)})" value-key="id" popper-class="config-dropdown" v-model="currentProjectCopy" placeholder="" size="small">
            <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item" :id="'project-'+item.id"></el-option>
          </el-select>
        </el-form-item>
        <!--module-->
        <el-form-item :label='$t("project.module.module")' prop="moduleId" class="select-warp">
          <el-select @change="((val) => {changeModule(val)})" value-key="id" popper-class="config-dropdown" v-model="currentModuleCopy" placeholder="" size="small">
            <el-option v-for="item in moduleList" :key="item.id" :label="item.name" :value="item" :id="'module-'+item.id"></el-option>
          </el-select>
        </el-form-item>
        <!--asset和endpoint-->
        <div class="right-box-form-row right-child-boxes">
          <div class="right-child-box assets-box">
            <!--begin--标题-->
            <div class="right-child-box-title">{{$t('asset.asset')}}</div>
            <!--end--标题-->
            <!--begin--搜索框-->
            <div style="float: right;padding: 9px 9px 0px 0px;">
              <div class="nz-btn-group nz-btn-group-size-small nz-btn-group-light endpoint-asset-search" style="margin: 0">
                <button id="search-asset-drop" type="button" class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square nz-input-group-prepend" @click="assetSearch.dropdownShow = !assetSearch.dropdownShow">
                  <span class="endpoint-asset-label-txt">{{assetSearch.label}}</span>
                  <span>
                    <i v-if="assetSearch.dropdownShow" class="nz-icon nz-icon-caret-up"></i>
                    <i v-if="!assetSearch.dropdownShow" class="nz-icon nz-icon-caret-bottom"></i>
                  </span>
                </button><el-input style="width: 100px;" @keydown.enter.native="searchAssetKeydown" class="input-x-mini-24 nz-input-group-middle" placeholder="" v-model="assetSearch.text"></el-input><button
                type="button" class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square nz-input-group-append" id="search-asset"><i @click="searchAsset" class="nz-icon nz-icon-search"></i></button>

                <div class="endpoint-asset-search-dropdown" v-if="assetSearch.dropdownShow">
                  <div @click="dropdownSelect('IP')" class="endpoint-asset-search-dropdown-item" id="search-asset-ip">IP</div>
                  <div @click="dropdownSelect('SN')" class="endpoint-asset-search-dropdown-item" id="search-asset-sn">SN</div>
                </div>
              </div>
            </div>
            <!--end--搜索框-->

            <!-- begin--table-->
            <div class="endpoint-sub-table">
              <div class="endpoint-sub-table-head">
                <div class="endpoint-sub-table-col" style="width: 15px;">
                <el-checkbox v-model="assetListAll" :indeterminate="assetListHalf"
                             @change="assetListSelAll"></el-checkbox>
              </div>
                <div class="endpoint-sub-table-col">IP</div>
                <div class="endpoint-sub-table-col"  style="width: calc(50% - 55px)">SN</div>
              </div>
              <div class="line-100"></div>
              <div class="endpoint-sub-table-body">
                <el-scrollbar style="height: 100%" ref="assetScrollbar">
                  <div :data="item.id" v-for="item,index in assetList" class="endpoint-sub-table-row" :id="'select-asset-'+item.id">
                    <div class="endpoint-sub-table-col" style="width: 15px;">
                      <el-checkbox v-model="item.sel" @change="selectAsset"></el-checkbox>
                    </div>
                    <div :id="index" @click.stop v-if="!currentModuleCopy.id" class="endpoint-sub-table-body-dialog"></div>
                    <div class="endpoint-sub-table-col">{{item.host}}</div>
                    <el-popover trigger="hover" placement="right-start" :content="item.sn" >
                      <div slot="reference" class="endpoint-sub-table-col"  style="width: calc(50% - 55px)">{{item.sn}}</div>
                    </el-popover>
                  </div>
                </el-scrollbar>
              </div>
            </div>
            <div class="line-100" style="border-color:#dcdfe6"></div>
            <div>
              <button type="button" @click="addToEndpointList"
                      class="nz-btn nz-btn-size-small-new nz-btn-style-light-new endpoints-clear-btn" style="margin-top: 3px;">
                {{$t('overall.addAssetList')}}
              </button>
              <span style="display: inline-block; font-size: 14px; float: right;line-height: 35px;padding-right: 15px;margin-top: 3px;">All: {{this.assetList.length}}</span>
            </div>
            <!--end--table-->
          </div>
          <!--右侧endpoint列表-->
          <div class="right-child-box endpoints-box" :class="{'endpoints-box-snmp': currentModuleCopy.type && currentModuleCopy.type.toLowerCase() == 'snmp'}">
            <!--module-->
            <div class="endpoints-box-module-info">
              <div class="title">{{$t('project.endpoint.moduleParameter')}}:</div>
              <el-input class="module-info module-info-port input-x-mini-22" :class="{'module-info-port-snmp': currentModuleCopy.type && currentModuleCopy.type.toLowerCase() == 'snmp'}" v-model="currentModuleCopy.port"></el-input>
              <el-popover
                placement="bottom"
                width="200"
                trigger="hover"
                v-if="currentModuleCopy.type && currentModuleCopy.type.toLowerCase() == 'http'"
              >
                <div class="endpoint-param-pop">
                  <div v-for="item,index in currentModuleCopy.paramObj">{{item.key}}={{item.value}}</div>
                </div>
                <el-input id="edit-param" @click.native.stop="showEditParamBox(true, currentModuleCopy, 1, $event)" slot="reference" disabled class="module-info module-info-param input-x-mini-22" v-model="currentModuleCopy.param"></el-input>
              </el-popover>
              <el-input v-if="currentModuleCopy.type && currentModuleCopy.type.toLowerCase() == 'http'" class="module-info module-info-path input-x-mini-22" v-model="currentModuleCopy.path"></el-input>
              <button type="button" id="cover-param" @click="coverEndpoint" class="nz-btn nz-btn-size-small nz-btn-style-light module-info module-info-cover"><i class="nz-icon nz-icon-override"></i></button>
            </div>
            <!--endpoints-->
            <div class="endpoints-box-endpoints" :style="{borderColor: endpointTouch ? paramBorderColor : '#dcdfe6'}">
              <el-table
                :data="endpointList"
                ref="endpointTable"
                style="width: 100%;border-radius: 4px;"
                v-scrollBar:el-table
                height="calc(100% - 36px)"
                :row-class-name="setRowIndex"
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
                        v-if="!scope.row.isEdit"
                        placement="bottom"
                        width="200"
                        trigger="hover"
                      >
                        <div class="endpoint-param-pop">
                          <div v-for="p in scope.row.paramObj">{{p.key}}={{p.value}}</div>
                        </div>
                        <span slot="reference">
                          <span @mousedown.stop>{{scope.row.param.length > 8 ? scope.row.param.substring(0, 8) + '...' : scope.row.param}}</span>
                        </span>
                      </el-popover>
                      <span @mousedown.stop v-else @click.stop="showEditParamBox(true, scope.row, 2, $event)">
                        <el-form-item :prop="'endpointList[' + scope.row.index + '].param'" :rules="{required: false, message: $t('validate.required'), trigger: 'blur'}">
                          <el-input readonly class="endpoint-info endpoint-info-param input-x-mini-22" v-model="scope.row.param"></el-input>
                        </el-form-item>
                      </span>
                    </span>
                    <span v-else-if="title.prop == 'path'">
                      <el-popover
                        placement="bottom"
                        width="100"
                        trigger="hover"
                        :content="scope.row[title.prop]"
                        v-if="!scope.row.isEdit"
                      >
                        <span slot="reference" >
                          <span>{{scope.row.path.length > 5 ? scope.row.path.substring(0, 5) + '...' : scope.row.path}}</span>
                        </span>
                      </el-popover>
                      <span @mousedown.stop v-else>
                        <el-form-item :prop="'endpointList[' + scope.row.index + '].path'" :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}">
                          <el-input class="endpoint-info input-x-mini-22" v-model="scope.row.path"></el-input>
                        </el-form-item>
                      </span>
                    </span>
                    <span v-else-if="title.prop == 'port'">
                      <span v-if="!scope.row.isEdit">{{scope.row.port}}</span>
                      <span @mousedown.stop v-else>
                        <el-form-item :prop="'endpointList[' + scope.row.index + '].port'" :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}">
                          <el-input class="endpoint-info input-x-mini-22" v-model="scope.row.port"></el-input>
                        </el-form-item>
                      </span>
                    </span>
                    <span v-else-if="title.prop == 'host'">
                      <span v-if="!scope.row.isEdit">{{scope.row.host}}</span>
                      <span @mousedown.stop v-else>
                        <el-form-item :prop="'endpointList[' + scope.row.index + '].host'" :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}">
                          <el-input class="endpoint-info input-x-mini-22" v-model="scope.row.host"></el-input>
                        </el-form-item>
                      </span>
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="" width="56">
                  <template slot-scope="scope" :column="title">
                    <div>
                      <span :id="'ep-asset-toedit-'+scope.row.assetId" v-if="!scope.row.isEdit" class="endpoint-box-row-symbol" @mousedown.stop @click="toEditEndpoint(scope.row)"><i class="el-icon-edit-outline"></i></span>
                      <span :id="'ep-asset-edit-'+scope.row.assetId" v-else class="endpoint-box-row-symbol" @mousedown.stop @click="editEndpoint(scope.row)"><i class="nz-icon nz-icon-check"></i></span>
                      <!--<span :id="'ep-asset-remove-'+scope.row.assetId" class="endpoint-box-row-symbol" @click="removeEndpoint(scope.row)"><i class="nz-icon nz-icon-shanchu1"></i></span>-->
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <div class="el-form-item__error" :style="{opacity: endpointTouch && this.endpointList.length == 0 ? '1' : '0'}" style="left: unset; transition: all .2s">{{$t('validate.required')}}</div>
              <div>
                <button id="clear-select-asset" type="button" @click="clearSelection" class="nz-btn nz-btn-size-small-new nz-btn-style-light-new endpoints-clear-btn">{{$t('overall.clear')}}</button>
                <span style="display: inline-block; font-size: 14px; float: right;line-height: 35px;padding-right: 15px;">All: {{this.endpointList.length}}</span>
              </div>
            </div>
          </div>
        </div>
      </el-form>

    </el-scrollbar>

    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button @click="esc" id="ep-esc" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" id="ep-add" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>

    <!--start--param编辑框-->
    <transition name="right-sub-box">
      <div @mousedown.stop class="right-sub-box" v-if="editParamBox.show" :style="'top: ' + editParamBox.top + 'px; left: ' + editParamBox.left + 'px;'">
        <div class="param-box">
          <div class="param-box-row" v-for="(item, index) in tempParamObj">
            <el-input placeholder="key" class="param-box-row-key input-x-mini-22" v-model="item.key"></el-input>
            <span class="param-box-row-eq">=</span>
            <el-input placeholder="value" class="param-box-row-value input-x-mini-22" v-model="item.value"></el-input>
            <span class="param-box-row-symbol" :id="'remove-param-'+index" @click="removeParam(index)"><i class="nz-icon nz-icon-shanchu1"></i></span>
          </div>
        </div>
        <div style="width: 100%; text-align: center; height: 25px;">
          <el-button @click="addParam" id="add-param" style="height: 18px; line-height: 18px; padding-top: 0; padding-bottom: 0;" size="mini"><i class="nz-icon nz-icon-plus"></i></el-button>
        </div>
      </div>
    </transition>
    <!--end--param编辑框-->
  </div>
</template>

<script>
  export default {
    name: "endpointBox",
    props: {
      currentProject: Object,
      currentModule: Object,
    },
    data() {
      return {
        rules: {
          projectId: [
            {required: true, message: this.$t('validate.required'), trigger: 'change'}
          ],
          moduleId: [
            {required: true, message: this.$t('validate.required'), trigger: 'change'}
          ],
        },
        paramBorderColor: '#dcdfe6',
        endpointTouch: false,
        endpoint: {projectId: '', moduleId: '', endpointList: []},
        currentModuleCopy: {},
        currentProjectCopy: {id: ''},
        tempParamObj: [],
        tempEndpoint: {},
        tempEndpoint2: {},
        rightBox: {show: false, title: this.$t('project.endpoint.createEndpoint'),isEdit: false},
        editParamBox: {show: false, top: 0, left: 0, type: 0}, //param编辑弹框
        moduleParamShow: false, //module默认参数param悬浮窗
        assetSearch: {host: '', sn: '', text: '', label: 'IP', dropdownShow: false}, //侧滑框中asset的搜索相关
        assetPageObj: {pageNo: 1, pageSize: -1},
        selectedAssets: [], //侧滑框中选中的asset
        projectList: [],
        moduleList: [],
        assetList: [],
        endpointList: [],
        endpointTableTitle: [
          {
            label: this.$t("project.endpoint.asset"),
            prop: 'asset',
            width: 121,
            show: true,
          },{
            label: this.$t("project.endpoint.host"),
            prop: 'host',
            width: 121,
            show: true,
          },{
            label: this.$t("project.endpoint.port"),
            prop: 'port',
            width: 54,
            show: true,
          },{
            label: this.$t("project.endpoint.param"),
            prop: 'param',
            width: 90,
            show: true,
          },{
            label: this.$t("project.endpoint.path"),
            prop: 'path',
            width: 66,
            show: true,
          }
        ],
        assetListAll:false,
        assetListHalf:false,
      }
    },
    methods: {
      //子弹框控制  obj: module或endpoint对象  type:1module2endpoint
      showEditParamBox(show, obj, type, e) {
        if (show) {
          let position = e.target.getBoundingClientRect();
          this.editParamBox.type = type;
          if (this.editParamBox.type == 2) {
            this.tempEndpoint = obj;
          }
          this.editParamBox.top = position.top - 227;
          this.editParamBox.left = position.left - 48;
          if (!obj.param) {
            this.$set(obj, 'paramObj', []);
            this.tempParamObj = [];
          } else {
            this.tempParamObj = JSON.parse(JSON.stringify(obj.paramObj));
          }
        } else {
          if (!this.editParamBox.show) {
            return;
          }
          for (let i = 0; i < this.tempParamObj.length; i++) {
            if (!this.tempParamObj[i].key || !this.tempParamObj[i].value) {
              this.tempParamObj.splice(i, 1);
              i--;
            }
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

      clickOutside() {
        this.esc(false);
      },

      /*关闭弹框*/
      esc(refresh) {
        this.$emit("close", refresh);
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
        for (let i = 0; i < this.endpointList.length; i++) {
          if (this.endpointList[i].isEdit) {
            this.endpointList.splice(i, 1, JSON.parse(JSON.stringify(this.tempEndpoint2)));
            this.endpointList[i].isEdit = false;
            break;
          }
        }
        endpoint.isEdit = true;
        this.tempEndpoint2 = JSON.parse(JSON.stringify(endpoint));
      },
      editEndpoint(endpoint) {
        this.$refs.addEndpoint.validate((valid) => {
          if (valid) {
            endpoint.isEdit = false;
            this.tempEndpoint2 = {};
          } else {
            return false;
          }
        });

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
        this.$refs.assetScrollbar.update();
      },

      /*获取project列表*/
      getProjectList() {
        this.$get('project', {pageSize: -1, pageNo: 1}).then(response => {
          if (response.code === 200) {
            this.projectList = response.data.list;
            this.getModuleList(this.currentProjectCopy.id);
          }
        });
      },

      // 获取endpoint弹框中的asset子弹框里asset列表数据
      getAssetList() {
        this.$get('asset', this.assetPageObj).then(response => {
          if (response.code === 200) {
            let respData = response.data.list;
            for (let i = 0; i < respData.length; i++) {
              respData[i].sel=false;
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
      //回车搜索searchAsset
      searchAssetKeydown(e){
        e=e?e:window.event;
        let keyCode = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
        if(keyCode=== 13){
          this.searchAsset()
        }
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
        this.endpoint.moduleId = '';
        this.endpoint.projectId = project.id;
        this.editParamBox.show = false;
        this.tempParamObj = [];
        this.endpointList = [];
        this.getAssetList();
        this.getModuleList(project.id);
      },

      changeModule(module) {
        this.endpoint.moduleId = module.id;
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
      selectAsset() {
        this.$nextTick(()=>{
          let index=0;
          this.assetList.forEach(item=>{
            if(item.sel){
              index++;
            }
          });
          if(index==0){
            this.assetListAll=false;
            this.assetListHalf=false;
          }else if(index<this.assetList.length){
            this.assetListAll=true;
            this.assetListHalf=true;
          }else{
            this.assetListAll=true;
            this.assetListHalf=false;
          }
        })
      },
      //批量添加到endpoint
      addToEndpointList(){
        let arr=[];
        this.assetListAll=false;
        this.assetListHalf=false;
        this.endpointTouch=true;
        this.endpointTouch = true;
        this.endpoint.projectId = this.currentProjectCopy.id;
        this.endpoint.moduleId = this.currentModuleCopy.id;
        this.assetList=this.assetList.filter(item=>{
          let flag=item.sel;
          if(flag){
            item.sel=false;
            let obj={
              isEdit: false,
              assetId: item.id,
              asset: item,
              host: item.host,
              param: this.currentModuleCopy.param ? this.currentModuleCopy.param : "",
              paramObj: this.currentModuleCopy.paramObj ? this.currentModuleCopy.paramObj : {},
              port: this.currentModuleCopy.port,
              path: this.currentModuleCopy.path,
              moduleId: this.currentModuleCopy.id
            };
            arr.push(obj);
          }
          return !flag
        });
        this.endpointList=this.endpointList.concat(arr);
        this.$refs.assetScrollbar.update();
      },
      //全选的checkbox的事件
      assetListSelAll(flag){
        if(flag){
          this.assetListHalf=false;
          this.assetList.forEach(item=>{
            item.sel=flag;
          });
        }else if(!flag&& !this.assetListHalf){
          this.assetList.forEach(item=>{
            item.sel=flag;
          });
        }else if(!flag&&this.assetListHalf){
          this.assetListHalf=false;
          this.assetListAll=true;
          this.assetList.forEach(item=>{
            item.sel= !flag;
          });
        }
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
        this.$get('module', {projectId: projectId,pageSize:-1}).then(response => {
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
        this.endpoint.projectId = this.currentProjectCopy.id;
        this.endpoint.moduleId = this.currentModuleCopy.id;
        if (this.endpointList.length == 0) {
          this.endpointTouch = true;
          this.$refs.addEndpoint.validate();
          return false;
        }
        //对endpointList进行处理，避免携带过多无用数据
        let endpointList = [];
        this.endpointList.forEach((item, index) => {
          let endpoint = {moduleId: item.moduleId, assetId: item.assetId, port: item.port, param: item.param, path: item.path, host: item.host};
          endpointList.push(endpoint);
        });
        this.$refs.addEndpoint.validate((valid) => {
          if (valid) {
            this.$post('endpoint', endpointList).then(response => {
              if (response.code === 200) {
                this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                this.esc(true);
              } else {
                this.$message.error(response.msg);
              }
            });
          } else {
            return false;
          }
        })
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

      clearEndpoints() {
        this.getAssetList();
        this.endpointList = [];
        this.assetSearch= {host: '', sn: '', text: '', label: 'IP', dropdownShow: false}
      },

      setRowIndex({row, rowIndex}) {
        row.index = rowIndex;
      }
    },
    created() {
      this.getProjectList();
      this.getAssetList();
    },
    watch: {
      endpointList(n, o) {
        this.endpoint.endpointList = n;
        if (n.length > 0) {
          this.paramBorderColor = '#dcdfe6';
        } else {
          this.paramBorderColor = '#F56C6C';
        }

      },
      currentProject: {
        immediate: true,
        handler(n, o) {
          this.currentProjectCopy = Object.assign({}, n);
          this.endpoint.projectId = n.id;
          this.getModuleList(n.id);
        }
      },
      currentModule: {
        immediate: true,
        handler(n, o) {
          if(n) {
            this.endpoint.moduleId = n.id;
            this.currentModuleCopy = JSON.parse(JSON.stringify(n));

          }
        }
      },
      currentModuleCopy: {
        immediate: true,
        handler(n, o) {
          if (n.type && n.type.toLowerCase() == 'snmp') {
            this.endpointTableTitle[3].show = false;
            this.endpointTableTitle[4].show = false;
          } else {
            this.endpointTableTitle[3].show = true;
            this.endpointTableTitle[4].show = true;
          }
        }
      },
    }
  }
</script>

<style scoped>
  .nz-icon.nz-icon-shanchu1 {
    font-size: 14px;
  }
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
    border: none;
  }
  .param-box-row {
    padding: 7px 10px 0 10px;
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
    width: 14px;
    text-align: center;
    height: 22px;
    line-height: 22px;
    color: #c4c7cF;
  }
  /* end--param*/

  /* begin--小盒子*/
  .right-child-boxes {
    height: calc(100% - 120px);
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
  .endpoints-box.endpoints-box-snmp {
    width: 380px;
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
    height: 22px;
    vertical-align: middle;
    position: absolute;
    top: 5px;
  }
  .right-child-box-title {
    padding: 9px 0 0 9px;
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
    width: 53px;
    right: 209px;
  }
  .module-info-port-snmp {
    right: 50px;
  }
  .module-info-param {
    width: 89px;
    right: 116px;
  }
  .module-info-path {
    width: 70px;
    right: 42px;
  }
  .endpoint-info-param {
    width: 80px;
  }
  .right-child-box .module-info-cover {
    right: 4px;
    padding: 0px 6px;
    margin-right: 5px;
  }
  .endpoints-box-endpoints {
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    height: calc(100% - 39px);
    margin-top: 6px;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
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
    padding: 0;
  }
  /* begin--搜索框*/
  .endpoint-asset-search {
    position: relative;
    margin-left: 44px;
  }
  .endpoint-asset-search button {
    height: 24px !important;
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
    width: 100px;
    vertical-align: top;
  }
  /* end--搜索框*/

  /* begin--table*/
  .endpoint-sub-table {
    padding-top: 15px;
    height: calc(100% - 83px);
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
    position: relative;
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
    height: calc(100% - 37px);
  }
  .endpoint-sub-table-body-dialog {
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.7);
    position: absolute;
    z-index: 10;
    top: 0;
  }
  .endpoints-clear-btn {
    margin: 6px 0 0 7px;
  }
  /* end--table*/

  /* end--子弹框*/
</style>
<style>
  .endpoints-box-endpoints-title {
    color: black;
    font-weight: 400;
  }
  .endpoints-box-endpoints .el-table td, .endpoints-box-endpoints .el-table th {
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

  .endpoints-box-endpoints .el-form-item {
    margin-bottom: 0;
  }
  .endpoints-box-endpoints .el-form-item.is-error {
    margin-bottom: 22px;
  }
</style>
