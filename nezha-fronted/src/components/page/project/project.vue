<style lang="scss">
  @import '../../charts/line-chart-block';
  .project-calendar .el-input__inner {
     height: 24px;
  }
  .change-time-height {
    height: 23px;
  }
  .date-pick-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .date-pick-group button:first-of-type {
    margin-right: 4px;
  }
  .date-pick-group button:last-of-type {
    margin-left: 4px;
  }
</style>
<template>
  <div class="project">

    <left-menu >
      <div slot="content-left" class="slot-content">
      <el-scrollbar ref="leftScrollbar" style="height: 100%">
        <div class="sidebar-title too-long-split">{{$t('project.project.project')}}</div>
        <!--<div class="sidebar-info">
          <div
            v-for="item in moduleList"
            class="sidebar-info-item"
            :class="{'sidebar-info-item-active': item.id == currentModule.id}"
            @click="changeModule(item)"
            :id="'project-module-'+item.id"
          >
            <div class="sidebar-info-item-txt">
              <el-popover v-if="item.name.length > 16" trigger="hover" placement="top-start" :content="item.name" >
                <span slot="reference">{{item.name}}</span>
              </el-popover>
              <span v-else>{{item.name}}</span>
            </div>
            <div v-show="item.buildIn != 1" class="hid-div side-bar-menu-edit" @click.stop="toEditModule(item)" :id="'project-module-edit-'+item.id" ><i class="nz-icon nz-icon-edit"></i></div>
          </div>
        </div>-->
        <div class="sidebar-info">
        <el-collapse v-model="currentProjectTitle" class="left-menu-bg" accordion style="padding-top:0px;" @change="projectChange" ref="projectLeft">
          <el-collapse-item v-for="(item,index) in projectList" :key="item.name+item.id+index" :name="item.name+'-'+item.id">
            <template slot="title">
              <div class="sidebar-info-item" :class="{'sidebar-info-item-active': item.id==currentProject.id}" @click="detailProjectInfo($event,item)" :id="'project-module-'+item.id">
                <div class="sidebar-info-item-txt">
                  <el-popover v-if="item.name.length > 14" trigger="hover" placement="top-start" :content="item.name" popper-class="transparent-pop">
                    <span slot="reference" class="">
                      {{item.name}}
                    </span>
                  </el-popover>
                  <span v-else>{{item.name}}</span>
                </div>
              </div>
            </template>
            <div class="sidebar-info sub-sidebar-info" >
              <div v-for="module in getProjectModule(item.id)" class="sidebar-info-item" :class="{'sidebar-info-item-active': module.id == currentModule.id}" @click="changeModule(module)" :id="'project-module-'+module.id">
                <div class="sidebar-info-item-txt">
                  <el-popover v-if="module.name.length > 16" trigger="hover" placement="top-start" :content="module.name" >
                    <span slot="reference">{{module.name}}</span>
                  </el-popover>
                  <span v-else>{{module.name}}</span>
                </div>
                <div v-show="module.buildIn != 1" class="hid-div side-bar-menu-edit sub-side-bar-menu-edit" @click.stop="toEditModule(module)" :id="'project-module-edit-'+module.id" ><i class="nz-icon nz-icon-edit"></i></div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
        </div>
      </el-scrollbar>
    </div>

    <!--endpoint-->
    <div slot="content-right" class="slot-content" v-show="pageType ==  'endpoint'">
      <!-- 主列表 -->
      <div class="main-list main-and-sub-transition" :class="{'main-list-with-sub': showSubList}">
        <div class="top-tools" v-show="mainResizeShow">
          <!--<div class="pagination-top"></div>-->
          <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': showSubList}">
            <div class="top-tool-search"><search-input :searchMsg="endpointSearchMsg" @search="endpointSearch" ref="projectSearch"></search-input></div>
            <export-excel
              export-file-name="endpoint"
              export-url="/endpoint/export"
              import-url="/endpoint/import"
              :params="endpointSearchLabel"
              @afterImport="getEndpointTableData"
              class="margin-l-20"
            >
              <template slot="optionZone">
                <button @click.stop="toCreateEndpoint" :title="$t('overall.createEndpoint')" class="nz-btn nz-btn-size-normal nz-btn-style-light" id="project-create-project">
                  <i class="nz-icon nz-icon-create-square"></i></button>
                <!--<div class="export-left-btn" @click.stop="toCreateEndpoint">
                  <i class="nz-icon nz-icon-create-square" :title="$t('overall.createProject')" ></i>
                </div>-->
              </template>
            </export-excel>
          </div>
          <div class="pagination-top pagination-top-hide display-none"></div>
        </div>
        <el-table
          :data="endpointTableData"
          border
          class="nz-table endpoint-table"
          :height="mainTableHeight"
          v-scrollBar:el-table="'large'"
          v-show="mainResizeShow"
          ref="endpointTable"
          v-loading="loading"
          style="width: 100%;">
          <el-table-column
            :resizable="false"
            v-for="(item, index) in tablelable"
            v-if="item.show"
            :width="item.width"
            :key="`col-${index}`"
            :label="item.label"
            min-width="110px"
          >
            <template slot-scope="scope" :column="item" >
              <span v-if="item.prop == 'asset' && scope.row[item.prop]" class="link" @click="viewAsset(scope.row)">{{scope.row[item.prop].host}}</span>
              <span v-else-if="item.prop == 'param'">
                <template v-if="scope.row.paramObj">
                  <span v-for="(p,i) in scope.row.paramObj">{{p.key}}={{p.value}}<span v-if="i < scope.row.paramObj.length-1">，</span></span>
                </template>
                <template v-else>-</template>
              </span>
              <template v-else-if="item.prop == 'type'">{{currentModule.type}}</template>
              <div v-else-if="item.prop == 'option'" class="content-right-options">
                <span :title="$t('overall.query')" @click="showEndpoint(scope.row)" class="content-right-option" :id="'edp-query-'+scope.row.id"><i class="el-icon-search"></i></span>
                &nbsp;
                <span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'edp-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>
                &nbsp;
                <span :title="$t('overall.edit')" @click="toEditEndpoint(scope.row)" class="content-right-option" :id="'edp-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
              </div>
<!--              <span v-else-if="item.prop == 'lastUpdate'">{{dateFormat(scope.row.lastUpdate)}}</span>-->
              <span v-else-if="item.prop == 'state'" >
                <el-popover placement="right" width="50" trigger="hover" :popper-class="scope.row.state == '1'?'small-pop':''">
                  <div slot="reference" style="width: 20px">
                    <div :class="{'active-icon green':scope.row.state == '1','active-icon red':scope.row.state == '0'}"></div>
                  </div>
                  <div >
                    <div v-if="scope.row.state == '1'">up</div>
                    <div v-else>down:<br/>{{getStateErrorMsg(scope.row)}}</div>
                  </div>
                </el-popover>
              </span>
              <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
              <template v-else>-</template>
            </template>
          </el-table-column>
          <el-table-column width="28" :resizable="false">
            <template slot="header" slot-scope="scope">
              <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">
                <i class="nz-icon nz-icon-gear"></i>
              </span>
            </template>
            <template v-slot="scope">
              <button v-if="scope.$index == 0" class="to-top" :style="{top: toTopBtnTop}" :class="{'to-top-is-hover': tableHover}" v-show="showTopBtn && mainResizeShow" @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-bottom" v-show="!showSubList">
          <Pagination :tableId="tableId" v-cloak :pageObj="endpointPageObj" @pageNo='endpointPageNo' @pageSize='endpointPageSize' ref="endpointPagination"></Pagination>
        </div>
      </div>
      <bottom-box v-if="showSubList" :show-sub-list="showSubList" :subResizeShow="subResizeShow" :isFullScreen="isFullScreen"
                  :from="'endpoint'" :targetTab.sync="targetTab" :detail="endpointDetail" :obj="curEndpoint" :assetDetail="assetDetail"
                  @closeSubList="showSubList = false" @fullScreen="fullScreen" @exitFullScreen="exitFullScreen" @listResize="listResize" ></bottom-box>
    </div>
      <div slot="content-right" class="slot-content" v-show="pageType == 'project'">
        <div style="height: 100%;width:100%;position: relative;">
          <div style="position: absolute;top: 50%;left: 50%;">come soon</div>
        </div>
      </div>
    </left-menu>

    <element-set
      v-clickoutside="elementsetHide"
      :table-title="endpointTableTitle"
      :dropCol="dropCol"
      @tablelable="tablelabelEmit"
      ref="elementset"
    ></element-set>

    <module-box :currentProject="currentProject" :module="editModule" @reload="getAllModuleList" ref="moduleBox"></module-box>
    <edit-endpoint-box :project="currentProject" :module="currentModule" :post-endpoint="editEndpoint" @reload="getEndpointTableData" ref="editEndpointBox"></edit-endpoint-box>
    <add-endpoint-box :currentProject="endpointEditInfos.project" :currentModule="endpointEditInfos.module" @reload="getEndpointTableData" ref="addEndpointBox"></add-endpoint-box>
    <!--<asset-box :edit-unit-show='viewAssetState' @refreshData="getEndpointTableData" @sendStateData="tabControl"
               ref="assetEditUnit"></asset-box>-->
  </div>
</template>

<script>
  import exportXLSX from "../../common/exportXLSX";
  import loading from "../../common/loading";
  import chartDataFormat from "../../charts/chartDataFormat";
  import bus from '../../../libs/bus'

  var vm;
  export default {
    name: "project2",
    components: {
      'export-excel':exportXLSX,
      'loading': loading,
    },
    data() {
      vm = this;
      let temp = this;
      return {
        loading: false,

        assetDetail: [], //asset详情
        endpointDetail: [],
        targetTab: '',
        mainTableHeight: this.$tableHeight.normal, //主列表table高度
        toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
        isFullScreen: false, //是否是全屏，用来控制拖动条是否展示
        tableId: 'projectTable', //需要分页的table的id，用于记录每页数量
        mainResizeShow: true, //dom高度改变时部分内容是否展示
        subResizeShow: true,
        mainListHeight: '', //主列表dom的高度
        showSubList: false,
        endpointEditInfos:{
          project:null,
          module:null,
        },
        userData: [],
        showTopBtn: false, //主列表top按钮
        tableHover: false, //控制滚动条和top按钮同时出现
        editEndpoint: {id: '', host: '', port: '', param: '', path: '', asset: {}, project: {}, module: {}, moduleId: '', assetId: '', paramObj: []},
        endpointTableTitle: [
          {
            label: this.$t("project.endpoint.endpointId"),
            prop: 'id',
            show: true,
            width: 150
          },{
            label: this.$t("project.endpoint.asset"),
            prop: 'asset',
            show: true,
          },{
            label: this.$t("project.endpoint.host"),
            prop: 'host',
            show: true,
          },{
            label: this.$t("project.endpoint.port"),
            prop: 'port',
            show: true,
          },{
            label: this.$t("overall.type"),
            prop: 'type',
            show: false,
          },{
            label: this.$t("project.endpoint.param"),
            prop: 'param',
            show: true,
          },{
            label: this.$t("project.endpoint.path"),
            prop: 'path',
            show: true,
          },{
            label: this.$t("alert.list.state"),
            prop: 'state',
            show: true,
          },
          // {
          //   label: this.$t("project.endpoint.lastUpdate"),
          //   prop: 'lastUpdate',
          //   show: true,
          // },
          {
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true,
            width: 120
          }
        ],
        endpointTableData: [],
        endpointPageObj: {
          pageNo: 1,
          pageSize: 20,
          total:0
        },
        curEndpoint: {},
        tablelable: [],
        dropCol: [],
        currentProjectTitle:'',
        moduleList: [],
        projectList: [],
        pageType:'',//project endpoint
        currentProject: {id: '', name: '', remark: ''}, //endpoint弹框、module列表用来回显project
        editModule: {id: '', type: '', name: '', project: {}, port: '', path: '', param: '', paramObj: [], snmpParam: ''}, //编辑的module
        currentModule: {id: '', type: '', name: '', project: {}, port: '', path: '', param: '', paramObj: [], snmpParam: ''}, //endpoint弹框用来回显module
        endpointSearchLabel: {moduleId: ''}, //endpoint搜索参数
        endpointSearchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 1,
            name: "ID",
            type: 'input',
            label: 'id',
            disabled: false
          }, {
            id: 11,
            name: this.$t('asset.asset'),
            type: 'asset',
            label: 'asset',
            disabled: false
          }],
        },
        /*viewAssetState:false,*/
        selectedEndpoints:[],//选中的metric{label='value'}
      }
    },
    methods: {
      // 全屏
      fullScreen() {
        this.$bottomBoxWindow.fullScreen(vm);
      },
      // 退出全屏
      exitFullScreen() {
        this.$bottomBoxWindow.exitFullScreen(vm);
      },
      // 鼠标拖动二级列表
      listResize(e) {
        this.$bottomBoxWindow.listResize(vm, e);
      },
      elementsetShow(s, e) {
        var eventfixed = {
          shezhi: 0,
          screen: 0
        };
        eventfixed[s] = 1;
        e.preventDefault();
        this.$store.commit('setHeaderTable', this.tablelable);
        this.$store.commit('setEventfixed', eventfixed);
        const h = document.documentElement.clientHeight;
        const w = document.documentElement.clientWidth;
        const dw = this.$refs.elementset.$el.offsetWidth;
        const dh = this.$refs.elementset.$el.offsetHeight;
        let positionx =
          e.clientX + dw <= w - 10 ? e.clientX + 14 : e.clientX + 14 - dw;
        let positiony =
          e.clientY + dh <= h - 10
            ? e.clientY + 20
            : e.clientY + 20 - (e.clientY + dh - h);
        this.$store.commit('setPosition', { positionx, positiony });
      },
      elementsetHide() {
        //悬浮点击空白隐藏
        this.$refs.elementset.elementsetHide();
      },
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        this.tablelable = data;
      },
      getEndpointTableData() {
        if(this.currentModule&&this.currentModule.id){
          this.pageType='endpoint'
          this.endpointSearchLabel.moduleId = this.currentModule.id;
          this.$set(this.endpointSearchLabel, 'pageNo', this.endpointPageObj.pageNo);
          this.$set(this.endpointSearchLabel, 'pageSize', this.endpointPageObj.pageSize);
          this.loading = true;
          this.$get('endpoint', this.endpointSearchLabel).then(response => {
            this.loading = false;
            if (response.code === 200) {
              for (let i = 0; i < response.data.list.length; i++) {
                try {
                  let tempObj = JSON.parse(response.data.list[i].param);
                  response.data.list[i].paramObj = [];
                  for (let k in tempObj) {
                    response.data.list[i].paramObj.push({key: k, value: tempObj[k]})
                  }
                } catch (err) {
                  //console.error(response.data.list[i], err);
                }
              }
              this.endpointTableData = response.data.list;
              this.endpointPageObj.total = response.data.total;
            }
          });
        }
      },
      endpointPageNo(val) {
        this.endpointPageObj.pageNo = val;
        this.getEndpointTableData();
      },
      endpointPageSize(val) {
        this.endpointPageObj.pageSize = val;
        localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val);
        this.getEndpointTableData();
      },

      // 获取左侧module列表数据
      getModuleList() {
        //若currentProject不存在（如页面刷新了），默认取project列表的第一个
        if (this.currentProject && this.currentProject.id) {
          this.$get('module', {projectId: this.currentProject.id, pageSize: -1, pageNo: 1}).then(response => {
            if (response.code === 200) {
              this.moduleList = response.data.list;
              for (let i = 0; i < this.moduleList.length; i++) {
                try {
                  let tempObj = JSON.parse(this.moduleList[i].param);
                  this.$set(this.moduleList[i], 'paramObj', []);
                  for (let k in tempObj) {
                    this.moduleList[i].paramObj.push({key: k, value: tempObj[k]});
                  }
                } catch (err) {
                  //console.error(response.data.list[i], err);
                }
              }
              if (this.moduleList.length > 0) {
                this.currentModule = this.moduleList[0];
              } else {
                this.currentModule = {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []};
              }
            }
          });
        } else {
          if (this.projectList && this.projectList.length > 0) {
            this.$store.commit('setProject', this.projectList[0]);
          } else {
            this.$get('project', {pageSize: -1, pageNo: 1}).then(response => {
              if (response.code == 200) {
                this.projectList = response.data.list;
                if (this.projectList.length > 0) {
                  this.getModuleList();
                } else {
                  return;
                }
              }
            });
          }
        }
      },
      getProjectList:function(){
        this.$get('project',{pageSize:-1}).then(response=>{
          if(response.code == 200){
            this.projectList=response.data.list;
          }
        })
      },
      getProjectModule:function(projectId){
        let moduleList=Object.assign([],this.moduleList);
        return moduleList.filter((item,index)=>{
          return item.project.id==projectId;
        })
      },
      projectChange:function(){
        //展开后为避免左侧无数据，显示对应project的第一个module下的endpoint
        // let currentProjectId=this.currentProjectTitle&&this.cuurentProjectTitle != ""?this.currentProjectTitle.split('-')[this.currentProjectTitle.split('-').length -1]:"";
        // if(currentProjectId != ''){
        //   currentProjectId=Number.parseInt(currentProjectId);
        //   let moduleList=this.getProjectModule(currentProjectId);
        //   this.currentModule=moduleList[0];
        //   this.currentProject=this.projectList.find((item)=>{
        //     return item.id == currentProjectId
        //   })
        //   this.getEndpointTableData();
        //   // this.$store.commit('setProject',null)
        // }
      },
      detailProjectInfo:function(event,project){
        this.pageType='project'
        if(event){
          if(project){
            this.currentProject=project;
            // this.$store.commit('setProject',this.currentProject)
          }
          // this.$refs.projectLeft.setActiveNames([]);
        }else{
          this.currentProjectTitle=this.currentProject.name+"-"+this.currentProject.id
        }
        this.currentModule={};
      },
      getAllModuleList:function(){
        this.$get('module', { pageSize: -1, pageNo: 1}).then(response => {
          if (response.code === 200) {
            this.moduleList = response.data.list;
            for (let i = 0; i < this.moduleList.length; i++) {
              try {
                let tempObj = JSON.parse(this.moduleList[i].param);
                this.$set(this.moduleList[i], 'paramObj', []);
                for (let k in tempObj) {
                  this.moduleList[i].paramObj.push({key: k, value: tempObj[k]});
                }
              } catch (err) {
                //console.error(response.data.list[i], err);
              }
            }
            // if (this.moduleList.length > 0) {
            //   this.currentModule = this.moduleList[0];
            // } else {
            //   this.currentModule = {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []};
            // }
          }
        });
      },
      //左侧module列表选中切换
      changeModule(module) {
        this.currentModule = module;
        this.endpointSearchLabel = {moduleId: ''};
        this.$refs.projectSearch.clearSearch();
        this.showSubList = false;
        this.selectedEndpoints=[];
        this.currentProject={};
      },

      //弹出endpoint编辑页
      toEditEndpoint(endpoint) {
        this.editEndpoint = JSON.parse(JSON.stringify(endpoint));
        this.$set(this.editEndpoint,'projectId',this.currentModule.project.id)
        this.$set(this.editEndpoint,'moduleId',this.currentModule.id)

        this.rightBoxHandler(3);
        this.$refs.editEndpointBox.toEdit(true, this.editEndpoint.id);
        if (!this.editEndpoint.paramObj) {
          this.$set(this.editEndpoint, 'paramObj', []);
        }
      },

      toCreateEndpoint() {
        this.endpointEditInfos.project=Object.assign({},this.currentModule.project);
        this.endpointEditInfos.module=Object.assign({},this.currentModule)
        this.$refs.addEndpointBox.show(true);
        this.$refs.addEndpointBox.clearEndpoints();
      },

      //查看endpoint详情
      detail(endpoint) {
        this.curEndpoint = Object.assign({}, endpoint);
        this.targetTab = "detail";
        this.showSubList = true;
      },
      initSnmpParam(module) {
        this.$set(module, 'walk', []);
        this.$set(module, 'version', '');
        this.$set(module, 'max_repetitions', '');
        this.$set(module, 'retries', '');
        this.$set(module, 'timeout', '');
        this.$set(module, 'community', '');
        this.$set(module, 'username', '');
        this.$set(module, 'security_level', '');
        this.$set(module, 'password', '');
        this.$set(module, 'auth_protocol', '');
        this.$set(module, 'priv_protocol', '');
        this.$set(module, 'priv_password', '');
        this.$set(module, 'context_name', '');
      },
      //弹出module编辑页
      toEditModule(module) {
        this.currentModule = JSON.parse(JSON.stringify(module));
        if (!this.currentModule.paramObj) {
          this.$set(this.currentModule, 'paramObj', []);
        }
        this.editModule = JSON.parse(JSON.stringify(module));
        if (!this.editModule.paramObj) {
          this.$set(this.editModule, 'paramObj', []);
        }
        if (this.editModule.snmpParam) {
          this.initSnmpParam(this.editModule);
        }
        this.rightBoxHandler(2);
        this.$nextTick(() => {
          this.$refs.moduleBox.initWalk();
        });
      },

      //asset弹框控制
      /*tabControl(data) {
        if (data === 'close') {
          this.viewAssetState = false
          this.$refs['assetEditUnit'].tabView = false
        }
      },*/
      //搜索
      endpointSearch: function(searchObj) {
        this.endpointSearchLabel = {};
        this.endpointPageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.endpointSearchLabel, item, searchObj[item]);
          }
        }
        this.getEndpointTableData();
      },

      //控制弹框状态 type  1:project; 2:module; 3:editEndponit; 4:addEndpoint;
      rightBoxHandler(type) {
        if (type == 1) {
          this.$refs.projectBox.show(true);

          if (this.$refs.moduleBox) {
            this.$refs.moduleBox.show(false);
          }
          if (this.$refs.editEndpointBox) {
            this.$refs.editEndpointBox.show(false);
          }
          //this.$refs.addEndpointBox.show(false);
        } else if (type == 2) {
          this.$refs.moduleBox.show(true,true);

          if (this.$refs.projectBox) {
            this.$refs.projectBox.show(false);
          }
          if (this.$refs.editEndpointBox) {
            this.$refs.editEndpointBox.show(false);
          }
          //this.$refs.addEndpointBox.show(false);
        } else if (type == 3) {
          this.$refs.editEndpointBox.show(true);
          if (this.$refs.projectBox) {
            this.$refs.projectBox.show(false);
          }
          if (this.$refs.moduleBox) {
            this.$refs.moduleBox.show(false);
          }
          //this.$refs.addEndpointBox.show(false);
        } else if (type == 4) {
        }
      },

      dateFormat(time) {
        if (!time) {
          return '-';
        }
        let date = new Date(time * 1000);
        let year = date.getFullYear();
        let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        let seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
      },
      viewAsset(endpoint) {
        this.curEndpoint = Object.assign({}, endpoint);
        this.targetTab = 'assetDetail';
        this.showSubList = true;
        /*this.viewAssetState=true;
        this.$refs.assetEditUnit.getAssetData(id);
        this.$refs.assetEditUnit.tabView=true;*/
      },
      showEndpoint(endpoint) {
        this.curEndpoint = Object.assign({}, endpoint);
        this.targetTab = 'endpointQuery';
        this.showSubList = true;
      },
      getStateContent:function(row){
        if(row){
          if(row.state == 1){
            return 'up';
          }else{
            // return 'down'+'['+this.getStateErrorMsg(row)+']';
            return `down:${this.getStateErrorMsg(row)}`
          }
        }
      },
      convertToDetail(obj) {
        let detail = [];
        detail.push({label: this.$t('project.project.project'), value: obj.project.name});
        detail.push({label: this.$t("project.module.module"), value: obj.module.name});
        detail.push({label: this.$t("asset.asset"), value: obj.asset.host});
        detail.push({label: this.$t("project.endpoint.host"), value: obj.host});
        detail.push({label: this.$t("project.endpoint.port"), value: obj.port});
        detail.push({label: this.$t("project.endpoint.path"), value: obj.path});
        detail.push({label: this.$t("project.endpoint.param"), value: obj.param});
        return detail;
      },
      formatUpdateTime:function(date){
        let time=new Date(date);
        let hours=time.getHours()>9?time.getHours():'0'+time.getHours();
        let minutes=time.getMinutes()>9?time.getMinutes():'0'+time.getMinutes();

        return hours+':'+minutes;
      },
      getStateErrorMsg:function(row){
        let errCodes=[230009,230010,230011];
        if(row){
          if(row.state == 0){
            if(errCodes.find((item)=>{return row.stateInfo.code == item})){
              return this.$t('project.endpoint.stateInfo_'+row.stateInfo.code)
            }else{
              return row.stateInfo.msg;
              this.$message.error('state code error');
            }
          }
        }
      },
      assetConvertToDetail(obj) {
        let detail = [];
        detail.push({label: this.$t("asset.createAssetTab.sn"), value: obj.sn});
        detail.push({label: this.$t("asset.createAssetTab.host"), value: obj.host});
        detail.push({label: this.$t("asset.createAssetTab.state"), value: obj.state == 1 ? this.$t('asset.createAssetTab.inStock'): this.$t('asset.createAssetTab.notInStock')});
        detail.push({label: this.$t("asset.tableTitle.modules"), value: obj.endpointNum});
        detail.push({label: this.$t("asset.tableTitle.alerts"), value: obj.alertNum});
        detail.push({label: this.$t("asset.createAssetTab.assetType"), value: obj.model.type.value});
        detail.push({label: this.$t("asset.createAssetTab.vendorModel"), value: obj.model.vendor.value + " " + obj.model.name});
        detail.push({label: this.$t("asset.createAssetTab.assetType"), value: obj.model.type.value});
        detail.push({label: this.$t("asset.createAssetTab.purchaseDate"), value: obj.purchaseDate});
        detail.push({label: this.$t("asset.createAssetTab.dcName"), value: obj.idc ? obj.idc.name : ""});
        detail.push({label: this.$t("asset.createAssetTab.location"), value: obj.idc ? obj.idc.location : ""});
        detail.push({label: this.$t("asset.createAssetTab.principal"), value: obj.idc ? this.getPrincipalName(obj.idc.principal) : ""});
        detail.push({label: this.$t("asset.createAssetTab.location"), value: obj.idc ? obj.idc.location : ""});
        detail.push({label: this.$t("asset.createAssetTab.tel"), value: obj.idc ? obj.idc.tel : ""});
        detail.push({label: this.$t("asset.createAssetTab.cabinet"), value: obj.cabinet ? obj.cabinet.name : ""});
        detail.push({label: this.$t("asset.editAssetTab.uSize"), value: obj.cabinet ? obj.cabinet.uSize : ""});
        detail.push({label: this.$t("asset.editAssetTab.remark"), value: obj.idc ? obj.idc.remark : ""});
        if (obj.accounts.length > 0) {
          let account = obj.accounts[0];
          if (account.protocol == 'SSH') {
            detail.push({label: this.$t("asset.createAssetTab.protocol"), value: 'SSH'});
            detail.push({label: this.$t("asset.createAssetTab.account"), value: account.user});
            let loginType = "";
            if (account.authType == 1) {
              loginType = this.$t('asset.createAssetTab.password');
            } else if (account.authType == 2) {
              loginType = this.$t('asset.createAssetTab.ssh');
            }
            detail.push({label: this.$t("asset.createAssetTab.loginType"), value: loginType});
          } else if (account.protocol == 'TELNET') {
            detail.push({label: this.$t("asset.createAssetTab.protocol"), value: 'TELNET'});
            detail.push({label: this.$t("asset.createAssetTab.account"), value: account.user});
          }
          detail.push({label: this.$t("asset.createAssetTab.port"), value: account.port});
        }
        return detail;
      },
      getPrincipalName(data) {
        for (let item in this.userData) {
          if (this.userData[item].userId === data) {
            return this.userData[item].username
          }
        }
      },
      getUserData() {
        this.$get('sys/user/list').then(response => {
          if (response.code === 200) {
            this.userData = response.data.list
          }
        })
      }
    },
    created() {
      this.currentProject = this.$store.state.currentProject;
      // this.getModuleList();
      this.getAllModuleList();
      this.getUserData();
      this.getProjectList();
    },
    mounted() {
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize) {
        this.endpointPageObj.pageSize = pageSize
      }
      //this.detailProjectInfo();
      // setTimeout(()=>{
      //   this.getEndpointTableData();
      // }, 200);
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.endpointTable.$el.querySelector(".el-table__body-wrapper");
        if (el._ps_) {
          el.addEventListener("ps-scroll-y", () => {
            if (el._ps_.scrollbarYTop > 50) {
              this.showTopBtn = true;
            } else {
              this.showTopBtn = false;
            }
          });

          el.addEventListener("mouseenter", () => {
            this.tableHover = true;
          });
          el.addEventListener("mouseleave", () => {
            this.tableHover = false;
          });
        }
      });
      //resize时刷新左侧列表滚动条
      let _this = this;
      window.onresize = function() {
        _this.$refs.leftScrollbar.update();
      }

      this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.endpointTableTitle;
      this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.endpointTableTitle;

    },
    computed: {
      currentProjectChange() {
        return this.$store.state.currentProject;
      },
      projectListChange(){
        return this.$store.state.projectListChange;
      },
      moduleListReloadWatch() {
        return this.$store.state.moduleListChange;
      },
    },
    watch: {
      currentProjectChange:{
        handler(n, o) {
          this.currentProject = Object.assign({}, n);
          this.detailProjectInfo();
        }
      },
      projectListChange:function(n,o){
        this.getProjectList();
      },
      currentProject(n, o) {
        // this.getModuleList();
        // this.$store.commit('setProject',n)
      },
      currentModule(n, o) {
        this.endpointPageObj.pageNo = 1;
        if (n && n.id) {
          this.getEndpointTableData();
        } else {
          this.endpointTableData = [];
        }
      },
      moduleListReloadWatch(n, o) {
        // this.getModuleList(this.currentProject.id);
        this.getAllModuleList();
      },
      showSubList(n) {
        this.$bottomBoxWindow.showSubListWatch(vm, n);
      },
      curEndpoint: {
        deep: true,
        handler(n) {
          this.endpointDetail = this.convertToDetail(n);
          this.$get('asset', {id: n.assetId}).then(response => {
            if (response.code === 200) {
              this.assetDetail = this.assetConvertToDetail(response.data.list[0]);
            }
          });
        }
      },
    },
    destroyed() {
      window.onresize = null;
    }
  }
</script>

<style scoped  lang="scss">
  .project {
    height: 100%;
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
    top: 380px;
    right: 100px;
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
    margin-top: 25px;
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
  .sub-sidebar-info{
    padding-top: 0px !important;
    margin-left: 10px;
  }
  .sub-side-bar-menu-edit{
    margin-right: 18px;
  }
</style>
<style>
  /* begin--覆盖分页组件样式*/
  .right-sub-box .el-pagination.is-background .btn-next, .right-sub-box .el-pagination.is-background .btn-prev, .right-sub-box .el-pagination.is-background .el-pager li {
    margin: 0 3px;
    min-width: 25px;
  }
  .right-sub-box .el-pagination button, .right-sub-box .el-pagination span:not([class*=suffix]) {
    margin: 0 3px;
    height: 25px;
    line-height: 25px;
  }
  .right-sub-box .el-pager li {
    height: 25px;
    line-height: 25px;
  }
  .right-sub-box .el-pagination.is-background .el-pager li:not(.disabled).active {
    background-color: #656565;
    border: 1px solid #656565;
  }
  .right-sub-box .el-pagination.is-background .btn-next, .right-sub-box .el-pagination.is-background .btn-prev, .right-sub-box .el-pagination.is-background .el-pager li {
    background-color: white;
  }
  .right-sub-box .el-pagination button, .right-sub-box .el-pager li {
    border: 1px solid #DADADA;
  }
  .right-sub-box .el-pager li.active+li {
    border: 1px solid #DADADA;
  }
  .right-sub-box .el-pagination.is-background .el-pager li:not(.disabled):hover {
    color: black;
  }
  .right-sub-box .el-pagination.is-background .el-pager li.active:hover {
    color: white;
  }
  .endpoint-sub-table-paginate .el-pagination {
    position: absolute;
    right: 10px;
    bottom: 13px;
  }
  .el-input-group__append>i {
    cursor: pointer;
  }
  .el-table .disabledCheck .cell .el-checkbox__inner{
    display: none !important;
  }
  .el-table .disabledCheck .cell::before{
    /*content: '\e627';*/
    /*font-family: 'nz-icon';*/
    text-align: center;
    line-height: 37px;
  }
  /* end--覆盖分页组件样式*/

  /* 列表搜索框 样式重写*/
  .relative-position{
    position: relative;
  }
  .query-input-inactive{
    left:213px;
    width: 18%;
  }
  .query-input-inactive .el-input__inner{
    height: 26px;
    line-height: 26px;
  }
/* 左侧列表dc 编辑按钮影藏样式*/
  .hid-div{
    visibility: hidden;
  }
  .sidebar-info-item:hover .hid-div{
    visibility: visible;
  }
  .metric-tip-icon{
    vertical-align: middle;
    /*color: #3971BA;*/
    transform: scale(0.6);
    /*-webkit-transform-origin: left top;*/
    display:inline-block;
  }
  .metirc-tip-list{
    line-height: 26px;
    font-weight: bold;
  }
  .table-header-inner{
    position: absolute;
    z-index: 1;
    top: 38px;
    left: 11px;
    cursor: pointer;
  }
  .control-icon-unchecked{
    color: #d1d1d1;
  }
  .control-icon-checked{
    color:#666;
  }
  .project .sidebar-info-item{
    margin:0px !important;
  }
</style>
