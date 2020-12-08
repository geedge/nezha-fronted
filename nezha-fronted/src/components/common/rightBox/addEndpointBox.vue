<template>
  <div class="right-box right-box-add-endpoint" :class="{'right-box-add-endpoint-snmp': currentModuleCopy.type && currentModuleCopy.type.toLowerCase() == 'snmp'}" @mousedown="()=>{showEditParamBox(false);showEditLabelsBox(false)}" v-clickoutside="clickOutside">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns"></div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{$t("overall.createEndpoint")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <el-scrollbar class="right-box-form-box" style="overflow: hidden">
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
        <div class="right-box-form-row right-child-boxes" style="height: calc(100% - 135px);">
          <div class="right-child-box assets-box">
            <!--begin--标题-->
            <div class="right-child-box-title">{{$t('asset.asset')}}</div>
            <!--end--标题-->
            <!--begin--搜索框-->
            <div style="padding-left: 15px; display: inline-block;">
              <div class="nz-btn-group nz-btn-group-size-small nz-btn-group-light endpoint-asset-search">
                <button id="search-asset-drop" style="width: 62px;" type="button" class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square nz-input-group-prepend" @click="assetSearch.dropdownShow = !assetSearch.dropdownShow">
                  <span class="endpoint-asset-label-txt">{{assetSearch.label}}</span>
                  <span>
                    <i v-if="assetSearch.dropdownShow" class="nz-icon nz-icon-caret-up"></i>
                    <i v-if="!assetSearch.dropdownShow" class="nz-icon nz-icon-caret-bottom"></i>
                  </span>
                </button><el-input style="width: 100px;" v-if="assetSearch.label === 'Host' || assetSearch.label === 'SN'" @keydown.enter.native="searchAssetKeydown" class="input-x-mini-24 nz-input-group-middle" placeholder="" v-model="assetSearch.text">
                </el-input><el-select placeholder="" v-else-if="assetSearch.label === 'DC'" v-model="assetSearch.idcId" class="input-x-mini-24 nz-input-group-middle" popper-class="no-style-class">
                  <el-option v-for="item in dcList" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select><el-cascader
                  v-else-if="assetSearch.label === 'Model'"
                  :options="vendorAndModelOptionData"
                  :props="{emitPath: false}"
                  style="width: 100px;"
                  v-model="assetSearch.text"
                  size="mini"
                  clearable
                  placeholder=""
                  class="nz-input-group-middle"
                  @change="selectModel"
                >
                </el-cascader><el-select placeholder="" v-else-if="assetSearch.label === 'Type'" v-model="assetSearch.typeIds" class="input-x-mini-24 nz-input-group-middle" popper-class="no-style-class">
                  <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select><!--<el-autocomplete style="width: 100px;" v-else-if="assetSearch.label === 'DC'" @keydown.enter.native="searchAssetKeydown" :fetch-suggestions="filterDCValue" @select="selectDC" class="input-x-mini-24 nz-input-group-middle" placeholder="" v-model="assetSearch.text" value-key="name">
                </el-autocomplete><el-autocomplete style="width: 100px;" v-else-if="assetSearch.label === 'Type'" @keydown.enter.native="searchAssetKeydown" :fetch-suggestions="filterTypeValue" @select="selectType" class="input-x-mini-24 nz-input-group-middle" placeholder="" v-model="assetSearch.text" value-key="name">
                </el-autocomplete>--><button type="button" class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square nz-input-group-append" id="search-asset"><i @click="searchAsset" class="nz-icon nz-icon-search"></i></button>
                <div class="endpoint-asset-search-dropdown" v-if="assetSearch.dropdownShow">
                  <div @click="dropdownSelect('Host')" class="endpoint-asset-search-dropdown-item" id="search-asset-ip">Host</div>
                  <div @click="dropdownSelect('SN')" class="endpoint-asset-search-dropdown-item" id="search-asset-sn">SN</div>
                  <div @click="dropdownSelect('DC')" class="endpoint-asset-search-dropdown-item" id="search-asset-dc">DC</div>
                  <div @click="dropdownSelect('Model')" class="endpoint-asset-search-dropdown-item" id="search-asset-model">Model</div>
                  <div @click="dropdownSelect('Type')" class="endpoint-asset-search-dropdown-item" id="search-asset-type">Type</div>
                </div>
              </div>
            </div>
            <!--end--搜索框-->

            <!-- begin--table-->
            <div class="endpoint-sub-table" v-loading="assetLoading">
              <el-scrollbar style="height: 100%; width: 100%;" ref="assetScrollbar">
                <div class="endpoint-sub-table-head">
                  <div @click.stop v-if="!currentModuleCopy.id" class="endpoint-sub-table-body-dialog"></div>
                  <div class="endpoint-sub-table-col" style="width: 15px;position: relative">
                    <el-checkbox v-model="assetListAll" :indeterminate="assetListHalf"
                               @change="assetListSelAll"></el-checkbox>
                  </div>
                  <div class="endpoint-sub-table-col">Host</div>
                  <div class="endpoint-sub-table-col">SN</div>
                  <div class="endpoint-sub-table-col">Model</div>
                  <div class="endpoint-sub-table-col">DC</div>
                  <div class="endpoint-sub-table-col">Type</div>
                </div>
                <div class="line-100"></div>
                <div class="endpoint-sub-table-body">
                  <div :data="item.id" v-for="item,index in assetList" class="endpoint-sub-table-row" :id="'select-asset-'+item.id">
                    <el-popover trigger="hover" placement="left-start">
                      <div class="asset-tip" style="display: table">
                        <div class="tip-row">
                          <span class="tip-cell">Host</span>
                          <span class="tip-cell">{{item.host}}</span>
                        </div>
                        <div class="tip-row">
                          <span class="tip-cell">SN</span>
                          <span class="tip-cell">{{item.sn}}</span>
                        </div>
                        <div class="tip-row">
                          <span class="tip-cell">Model</span>
                          <span class="tip-cell">{{item.model.name}}</span>
                        </div>
                        <div class="tip-row">
                          <span class="tip-cell">DC</span>
                          <span class="tip-cell">{{item.idc.name}}</span>
                        </div>
                        <div class="tip-row">
                          <span class="tip-cell">Type</span>
                          <span class="tip-cell">{{item.model.type.value}}</span>
                        </div>
                      </div>
                      <span slot="reference">
                      <div class="endpoint-sub-table-col" style="width: 15px;">
                        <el-checkbox v-model="item.sel" @change="selectAsset"></el-checkbox>
                      </div>
                      <div class="endpoint-sub-table-col">{{item.host}}</div>
                      <div class="endpoint-sub-table-col">{{item.sn}}</div>
                      <div class="endpoint-sub-table-col">{{item.model.name}}</div>
                      <div class="endpoint-sub-table-col">{{item.idc.name}}</div>
                      <div class="endpoint-sub-table-col">{{item.model.type.value}}</div>
                    </span>
                    </el-popover>
                  </div>
                </div>
              </el-scrollbar>
            </div>
            <div class="line-100" style="border-color:#dcdfe6"></div>
            <div>
              <button type="button" @click="addToEndpointList"
                      class="nz-btn nz-btn-size-small-new nz-btn-style-light-new endpoints-clear-btn" style="margin-top: 3px;">
                {{$t('overall.addAssetList')}}
              </button>
              <span style="display: inline-block; font-size: 14px; float: right;padding-right: 15px;margin-top: 3px;">All: {{this.assetList.length}}</span>
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
                width="100"
                trigger="hover"
                v-if="currentModuleCopy.type && currentModuleCopy.type.toLowerCase() == 'http'"
              >
                <div class="endpoint-param-pop">
                  <div v-for="item,index in currentModuleCopy.paramObj">{{item.key}}={{item.value}}</div>
                </div>
                <el-input id="edit-param" @click.native.stop="showEditParamBox(true, currentModuleCopy, 1, $event)" slot="reference" disabled class="module-info module-info-param  input-x-mini-22" v-model="currentModuleCopy.param"></el-input>
              </el-popover>

              <el-popover
                placement="bottom"
                width="100"
                trigger="hover"
              >
                <div class="endpoint-param-pop">
                  <div v-for="item,index in currentModuleCopy.labelModule">{{item.key}}={{item.value}}</div>
                </div>
                <el-input id="edit-labels" @click.native.stop="showEditLabelsBox(true, currentModuleCopy, 1, $event)" slot="reference" disabled class="module-info module-info-param module-info-labels input-x-mini-22" :class="{'module-info-labels-snmp': currentModuleCopy.type && currentModuleCopy.type.toLowerCase() == 'snmp'}" v-model="currentModuleCopy.labels"></el-input>
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
                    <span v-else-if="title.prop == 'labels'">
                      <el-popover
                        v-if="!scope.row.isEdit"
                        placement="bottom"
                        width="200"
                        trigger="hover"
                      >
                        <div class="endpoint-param-pop">
                          <div v-for="p in scope.row.labelModule">{{p.key}}={{p.value}}</div>
                        </div>
                        <span slot="reference">
                          <span @mousedown.stop>{{scope.row.labels.length > 8 ? scope.row.labels.substring(0, 8) + '...' : scope.row.labels}}</span>
                        </span>
                      </el-popover>
                      <span @mousedown.stop v-else @click.stop="showEditLabelsBox(true, scope.row, 2, $event)">
                        <el-form-item :prop="'endpointList[' + scope.row.index + '].param'" :rules="{required: false, message: $t('validate.required'), trigger: 'blur'}">
                          <el-input readonly class="endpoint-info endpoint-info-param input-x-mini-22" v-model="scope.row.labels"></el-input>
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
      <button @click="save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" id="ep-add" v-has="['asset_endpoint_save', 'project_endpoint_save']">
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
    <!--start--labels编辑框-->
    <transition name="right-sub-box">
      <div @mousedown.stop class="right-sub-box" v-if="editLabelsBox.show" :style="'top: ' + editLabelsBox.top + 'px; left: ' + editLabelsBox.left + 'px;'">
        <div class="param-box">
          <div class="param-box-row" v-for="(item, index) in tempLabelModule" style="position: relative">
            <el-input placeholder="key" class="param-box-row-key input-x-mini-22" :class="{'input-error':inputKeyErr[index]}" v-model="item.key"  @input="validateInput(item.key,index)"></el-input>
            <span style="color: #F56C6C;font-size: 12px;position: absolute;top:25px;left: 10px" v-if="inputKeyErr[index]">{{$t('validate.key')}}</span>
            <span class="param-box-row-eq">=</span>
            <el-input placeholder="value" class="param-box-row-value input-x-mini-22" v-model="item.value"></el-input>
            <span class="param-box-row-symbol" :id="'remove-param-'+index" @click="removeLabels(index)"><i class="nz-icon nz-icon-shanchu1"></i></span>
          </div>
        </div>
        <div style="width: 100%; text-align: center; height: 25px;">
          <el-button @click="addLabels" id="add-labels" style="height: 18px; line-height: 18px; padding-top: 0; padding-bottom: 0;" size="mini"><i class="nz-icon nz-icon-plus"></i></el-button>
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
        vendorAndModelOptionData: [],
        paramBorderColor: '#dcdfe6',
        endpointTouch: false,
        endpoint: {projectId: '', moduleId: '', endpointList: []},
        currentModuleCopy: {},
        currentProjectCopy: {id: ''},
        tempParamObj: [],
        tempLabelModule: [],
        inputKeyErr:[],
        tempEndpoint: {},
        tempEndpoint2: {},
        assetLoading: true,
        rightBox: {show: false, title: this.$t('project.endpoint.createEndpoint'),isEdit: false},
        editParamBox: {show: false, top: 0, left: 0, type: 0}, //param编辑弹框
        editLabelsBox: {show: false, top: 0, left: 0, type: 0}, //param编辑弹框
        moduleParamShow: false, //module默认参数param悬浮窗
        assetSearch: {host: '', sn: '', text: '', label: 'Host', typeIds: "", modelId: "", idcId: "", dropdownShow: false}, //侧滑框中asset的搜索相关
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
            width: 76,
            show: true,
          },{
            label: this.$t("project.endpoint.host"),
            prop: 'host',
            width: 76,
            show: true,
          },{
            label: this.$t("project.endpoint.port"),
            prop: 'port',
            width: 54,
            show: true,
          },{
            label: this.$t("project.endpoint.labels"),
            prop: 'labels',
            width: 90,
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
        typeList: [],
        dcList: [],
        modelList: []
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

      //子弹框控制  obj: module或endpoint对象  type:1module2endpoint
      showEditLabelsBox(show, obj, type, e) {
        //editLabelsBox tempLabelModule labelModule
        if (show) {
          this.inputKeyErr=[];
          let position = e.target.getBoundingClientRect();
          this.editLabelsBox.type = type;
          if (this.editLabelsBox.type == 2) {
            this.tempEndpoint = obj;
          }
          this.editLabelsBox.top = position.top - 227;
          this.editLabelsBox.left = position.left - 48;
          if (!obj.labels) {
            this.$set(obj, 'labelModule', []);
            this.tempLabelModule = [];
          } else {
            this.tempLabelModule = JSON.parse(JSON.stringify(obj.labelModule));
          }
          this.tempLabelModule.forEach((item,index)=>{
            this.inputKeyErr.push(false);
          })
        } else {
          if (!this.editLabelsBox.show) {
            return;
          }
          for (let i = 0; i < this.tempLabelModule.length; i++) {
            if (!this.tempLabelModule[i].key || !this.tempLabelModule[i].value || this.inputKeyErr[i]) {
              this.tempLabelModule.splice(i, 1);
              i--;
            }
          }
          if (this.editLabelsBox.type == 1) {
            this.currentModuleCopy.labelModule = this.tempLabelModule;
            this.currentModuleCopy.labels = this.paramToJson(this.tempLabelModule);
          } else if (this.editLabelsBox.type == 2) {
            for (let i = 0; i < this.endpointList.length; i++) {
              if (this.endpointList[i].asset.id == this.tempEndpoint.asset.id) {
                this.endpointList[i].labels = this.paramToJson(this.tempLabelModule);
                this.endpointList[i].labelModule = this.tempLabelModule;
                break;
              }
            }
          }
          this.tempLabelModule = [];
        }
        this.editLabelsBox.show = show;
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
      // 新增labels
      addLabels() {
        this.tempLabelModule.push({key: '', value: ''});
        this.inputKeyErr.push(false);
      },

      // 移除单个param
      removeLabels(index) {
        this.tempLabelModule.splice(index, 1);
        this.inputKeyErr.splice(index, 1);
      },
      validateInput:function(value,index){
        if(!/[a-zA-Z_:][a-zA-Z0-9_:]*/.test(value)){
          this.inputKeyErr.splice(index,1,true)
        }else{
          this.inputKeyErr.splice(index,1,false)
        }
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

      /*获取型号列表*/
      getModelList() {
        this.$get('model', {pageSize: -1, pageNo: 1}).then(response => {
          if (response.code === 200) {
            let resultData = [];
            let modelData = response.data.list;
            for (let i = 0; i < modelData.length; i++) {
              if (!modelData[i].vendor) {
                continue;
              }
              let obj = {};
              obj.id = modelData[i].vendor.id;
              obj.code = modelData[i].vendor.code;
              obj.value ='vendor-'+ modelData[i].vendor.code;
              obj.label = modelData[i].vendor.value;
              obj.children = [];
              resultData.push(obj);
            }
            let result = [];
            let obj1 = {};
            for (let i = 0; i < resultData.length; i++) {
              if (!obj1[resultData[i].id]) {
                result.push(resultData[i]);
                obj1[resultData[i].id] = true;
              }
            }
            for (let x = 0; x < result.length; x++) {
              for (let y = 0; y < modelData.length; y++) {
                if (!modelData[y].vendor) {
                  continue;
                }
                if (result[x].code === modelData[y].vendor.code) {
                  let obj2 = {};
                  obj2.value = modelData[y].id;
                  obj2.label = modelData[y].name;
                  result[x].children.push(obj2);
                }
              }
            }
            this.vendorAndModelOptionData = result;
          }
        });
      },

      /*获取类型列表*/
      getTypeList() {
        this.$get('sys/dict/all', {pageSize: -1, pageNo: 1, type: "assetType"}).then(response => {
          if (response.code === 200) {
            this.typeList = response.data;
          }
        });
      },

      /*获取DC列表*/
      getDCList() {
        this.$get('idc', {pageSize: -1, pageNo: 1}).then(response => {
          if (response.code === 200) {
            this.dcList = response.data.list;
          }
        });
      },

      // 获取endpoint弹框中的asset子弹框里asset列表数据
      getAssetList() {
        this.assetLoading = true;
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
            this.$nextTick(() => {
              this.$refs.assetScrollbar.update();
            });
          }
        }).finally(() => {
          setTimeout(() => {
            this.assetLoading = false;
          }, 200);
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
        this.assetSearch.host = "";
        this.assetSearch.sn = "";
        if (this.assetSearch.label == 'Host') {
          this.assetSearch.host = this.assetSearch.text;
          this.assetSearch.modelId = "";
          this.assetSearch.typeIds = "";
          this.assetSearch.idcId = "";
        } else if (this.assetSearch.label == 'SN') {
          this.assetSearch.sn = this.assetSearch.text;
          this.assetSearch.modelId = "";
          this.assetSearch.typeIds = "";
          this.assetSearch.idcId = "";
        }
        this.assetPageObj = Object.assign({}, this.assetPageObj, this.assetSearch);
        this.getAssetList();
      },

      changeProject(project) {
        this.currentModuleCopy = {};
        this.endpoint.moduleId = '';
        this.endpoint.projectId = project.id;
        this.editParamBox.show = false;
        this.editLabelsBox.show = false;
        this.tempParamObj = [];
        this.endpointList = [];
        this.getAssetList();
        this.getModuleList(project.id);
      },

      changeModule(module) {
        this.endpoint.moduleId = module.id;
        this.editParamBox.show = false;
        this.editLabelsBox.show = false;
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
              labels: this.currentModuleCopy.labels ? this.currentModuleCopy.labels : "",
              labelModule: this.currentModuleCopy.labelModule ? this.currentModuleCopy.labelModule : {},
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
                let param=response.data.list[i].param|| '{}';
                let tempObj = JSON.parse(param);
                let labels=response.data.list[i].labels|| '{}';
                let tempObj1=JSON.parse(labels);
                response.data.list[i].paramObj = [];
                response.data.list[i].labelsModule = [];
                for (let k in tempObj) {
                  response.data.list[i].paramObj.push({key: k, value: tempObj[k]})
                }
                for (let k in tempObj1) {
                  response.data.list[i].labelsModule.push({key: k, value: tempObj1[k]})
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
          let endpoint = {moduleId: item.moduleId, assetId: item.assetId, port: item.port, param: item.param, path: item.path, host: item.host,labels:item.labels};
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
            this.endpointList[i].labels = this.currentModuleCopy.labels;
            this.endpointList[i].labelModule = this.currentModuleCopy.labelModule;
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
        this.assetSearch.text = "";
        if(this.assetSearch.label!==label){
          this.assetSearch.host = '';
          this.assetSearch.sn = '';
          this.assetSearch.modelId = "";
          this.assetSearch.typeIds = "";
          this.assetSearch.idcId = "";
        }
        this.assetSearch.label = label;
        this.assetSearch.dropdownShow = false;
      },

      clearEndpoints() {
        this.getAssetList();
        this.endpointList = [];
        this.assetSearch= {host: '', sn: '', text: '', label: 'Host', dropdownShow: false}
      },

      setRowIndex({row, rowIndex}) {
        row.index = rowIndex;
      },

      filterDCValue(input, callback) {
        let result = this.dcList.filter(item => {
          return item.name.toLowerCase().indexOf(input.toLowerCase()) != -1
        });
        console.info(input, result)
        callback(result);
      },
      filterModelValue(input, callback) {
        let result = this.modelList.filter(item => {
          return item.name.toLowerCase().indexOf(input.toLowerCase()) != -1
        });
        callback(result);
      },
      filterTypeValue(input, callback) {
        let result = this.typeList.filter(item => {
          return item.name.toLowerCase().indexOf(input.toLowerCase()) != -1
        });
        callback(result);
      },
      selectDC(select) {
        this.assetSearch.idcId = select.id;
        this.assetSearch.modelId = "";
        this.assetSearch.typeIds = "";
      },
      selectModel(select) {
        this.assetSearch.modelId = select;
        this.assetSearch.idcId = "";
        this.assetSearch.typeIds = "";
      },
      selectType(select) {
        this.assetSearch.typeIds = select.id;
        this.assetSearch.idcId = "";
        this.assetSearch.modelId = "";
      }
    },
    created() {
      this.getProjectList();
      this.getAssetList();
      this.getDCList();
      this.getModelList();
      this.getTypeList();
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
            this.endpointTableTitle[4].show = false;
            this.endpointTableTitle[5].show = false;
          } else {
            this.endpointTableTitle[4].show = true;
            this.endpointTableTitle[5].show = true;
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
    right: 309px;
  }
  .module-info-port-snmp {
    right: 142px;
  }
  .module-info-param {
    width: 89px;
    right: 116px;
  }
  .module-info-labels {
    width: 89px;
    right: 216px;
  }
  .module-info-labels-snmp {
    right: 50px;
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
    margin: 0;
    z-index: 11;
  }
  .endpoint-asset-search button {
    height: 24px !important;
  }
  .endpoint-asset-search-dropdown {
    position: absolute;
    top: 25px;
    background-color: #444;
    border-radius: 2px;
    width: 58px;
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
    min-width: 19px;
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
  .checkbox-mc{
    position: absolute;
    top: 0;
    left: 0;
    width: 14px;
    height: 14px;
    z-index:1;
  }
  /* end--搜索框*/

  /* begin--table*/
  .endpoint-sub-table {
    padding-top: 13px;
    height: calc(100% - 83px);
    width: 260px;
  }
  .line-100 {
    margin-bottom: 3px;
    width: 600px;
  }
  .endpoint-sub-table-head {
    line-height: 28px;
    height: 30px;
    width: 600px;
  }
  .endpoint-sub-table-row, .endpoint-sub-table-row-disabled {
    line-height: 28px;
    height: 30px;
    color: #656565;
    position: relative;
    width: 600px;
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
    padding-left: 10px;
    width: 100px;
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
<style lang="scss">

  .right-box-add-endpoint {
    .right-box-form>.el-form-item {
      margin-left: 0;
    }
    .right-box-form-left.right-box-form .el-form-item .el-form-item__label {
      width: 100px;
    }
  }

  .endpoint-asset-search .el-autocomplete>.el-input {
     position: absolute;
   }
  .endpoint-asset-search .el-select {
    width: 100px;
  }
  .endpoint-asset-search .el-cascader .el-input {
    position: absolute;
    height: 24px;
    line-height: 24px;

    input {
      height: 24px;
      line-height: 24px;
    }
  }
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
  .input-error .el-input__inner,.input-error .el-input__inner:hover,.input-error .el-input__inner:focus,
  .input-error .input__inner,.input-error .input__inner:hover,.input-error .input__inner:focus {
    border-color: #F56C6C !important;
  }

  .asset-tip {
    display: table;

    .tip-row {
      display: table-row;

      .tip-cell {
        display: table-cell;
        padding: 2px 4px;
      }
    }
  }
</style>
