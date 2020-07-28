<style lang="scss">
  @import '../../charts/chart';
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
        <div class="sidebar-info">
          <el-collapse v-model="currentProjectTitle" class="left-menu-bg" accordion style="padding-top: 0px;" ref="projectLeft">
            <el-collapse-item v-for="(item,index) in projectList" :key="item.name+item.id+index" :name="item.name+'-'+item.id">
              <template slot="title">
                <div class="sidebar-info-item" :class="{'sidebar-info-item-active': item.id == currentProject.id}" @click="detailProject($event,item)" :id="'project-module-'+item.id">
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
                <div v-if="getProjectModule(item.id).length == 0" class="sidebar-info-item sidebar-info-item-add" @click="addModule">
                  <i class="nz-icon nz-icon-create-square"></i>
                </div>
                <template v-else>
                  <div v-for="module in getProjectModule(item.id)" class="sidebar-info-sub-item" :class="{'sidebar-info-item-active': module.id == currentModule.id}" @click="changeModule(item, module)" :id="'project-module-'+module.id">
                    <div :id="`module-${module.id}`" class="item-tip">
                      <div class="item-tip-hide item-tip-key el-popover" :class="itemTip(module.id, module.name, ready)">{{module.name}}</div>
                      <span class="too-long-split" style="width: 120px;">{{module.name}}</span>
                      <div v-show="module.buildIn != 1" class="hid-div side-bar-menu-edit sub-side-bar-menu-edit" @click.stop="editModule(module)" :id="'project-module-edit-'+module.id" ><i class="nz-icon nz-icon-edit"></i></div>
                    </div>
                  </div>
                </template>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-scrollbar>
    </div>

    <!--endpoint-->
    <div slot="content-right" class="slot-content" v-show="pageType ==  'endpoint'">
      <!-- 主列表 -->
      <div class="main-list" :class="{'main-list-with-sub': bottomBox.showSubList}">
        <div class="main-modal"></div>
        <div class="top-tools" v-show="bottomBox.mainResizeShow">
          <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': bottomBox.showSubList}">
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
                <button @click.stop="addEndpoint" :title="$t('overall.createEndpoint')" class="nz-btn nz-btn-size-normal nz-btn-style-light" id="project-create-project">
                  <i class="nz-icon nz-icon-create-square"></i>
                </button>
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
          v-show="bottomBox.mainResizeShow"
          ref="endpointTable"
          v-loading="tools.loading"
          style="width: 100%;"
          @sort-change="tableDataSort"
        >
          <el-table-column
            :resizable="false"
            v-for="(item, index) in tools.tablelable"
            v-if="item.show"
            :width="item.width"
            :key="`col-${index}`"
            :label="item.label"
            min-width="110px"
            :sortable="sortableShow(item.prop)"
            :prop="propTitle(item.prop)"
          >
            <template slot-scope="scope" :column="item" >
              <span v-if="item.prop == 'asset' && scope.row[item.prop]" class="link" @click="detailEndpoint(scope.row)">{{scope.row[item.prop].host}}</span>
              <span v-else-if="item.prop == 'param'">
                <template v-if="scope.row.paramObj">
                  <span v-for="(p,i) in scope.row.paramObj">{{p.key}}={{p.value}}<span v-if="i < scope.row.paramObj.length-1">，</span></span>
                </template>
                <template v-else>-</template>
              </span>
              <template v-else-if="item.prop == 'type'">{{currentModule.type}}</template>
              <div v-else-if="item.prop == 'option'" class="content-right-options">
                <span :title="$t('overall.view')" @click="detailEndpoint(scope.row)" class="content-right-option" :id="'edp-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>
                &nbsp;
                <span :title="$t('overall.query')" @click="query(scope.row)" class="content-right-option" :id="'edp-query-'+scope.row.id"><i class="el-icon-search"></i></span>
                &nbsp;
                <span :title="$t('overall.edit')" @click="editEndpoint(scope.row)" class="content-right-option" :id="'edp-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
              </div>
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
              <button v-if="scope.$index == 0" class="to-top" :style="{top: tools.toTopBtnTop}" :class="{'to-top-is-hover': tools.tableHover}" v-show="tools.showTopBtn && bottomBox.mainResizeShow" @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-bottom" v-show="!bottomBox.showSubList">
          <Pagination :tableId="tableId" v-cloak :pageObj="endpointPageObj" @pageNo='endpointPageNo' @pageSize='endpointPageSize' ref="endpointPagination"></Pagination>
        </div>
      </div>
      <transition name="el-zoom-in-bottom">
        <bottom-box v-if="bottomBox.showSubList" :sub-resize-show="bottomBox.subResizeShow" :is-full-screen="bottomBox.isFullScreen"
                    :from="'endpoint'" :target-tab.sync="bottomBox.targetTab" :detail="bottomBox.endpointDetail" :obj="endpoint" :asset-detail="bottomBox.assetDetail"
                    @closeSubList="bottomBox.showSubList = false" @fullScreen="fullScreen" @exitFullScreen="exitFullScreen" @listResize="listResize" ></bottom-box>
      </transition>
    </div>
    <div slot="content-right" class="slot-content" v-show="pageType == 'project'">
      <panel-tab from="project" :obj="currentProject" targetTab.sync="panel"></panel-tab>
    </div>
    </left-menu>
    <element-set
      v-if="tools.showElementSet"
      v-clickoutside="elementsetHide"
      :table-title="endpointTableTitle"
      :drop-col="tools.dropCol"
      @tablelable="tablelabelEmit"
      ref="elementset"
    ></element-set>
    <transition name="right-box">
      <module-box v-if="rightBox.module.show" :current-project="currentProject" :module="module" @close="closeModuleRightBox" ref="moduleBox"></module-box>
    </transition>
    <transition name="right-box">
      <add-endpoint-box v-if="rightBox.addEndpoint.show" :current-project="currentProject" :current-module="currentModule" @close="closeAddEndpointRightBox" ref="addEndpointBox"></add-endpoint-box>
    </transition>
    <transition name="right-box">
      <edit-endpoint-box v-if="rightBox.editEndpoint.show" :project="currentProject" :module="currentModule" :endpoint="endpoint" @close="closeEditEndpointRightBox" ref="editEndpointBox"></edit-endpoint-box>
    </transition>
  </div>
</template>

<script>
  import exportXLSX from "../../common/exportXLSX";
  import loading from "../../common/loading";
  import panelTab from '../../common/bottomBox/tabs/panelTab'

  export default {
    name: "project2",
    components: {
      'export-excel':exportXLSX,
      'loading': loading,
      'panel-tab': panelTab
    },
    data() {
      return {
        rightBox: {
          module: {show: false},
          addEndpoint: {show: false},
          editEndpoint: {show: false},
        },
        /*二级页面相关*/
        bottomBox: {
          endpoint: {}, //asset详情
          endpointDetail: [],
          mainResizeShow: true, //dom高度改变时部分内容是否展示
          subResizeShow: true,
          isFullScreen: false, //是否是全屏，用来控制拖动条是否展示,
          showSubList: false,
          targetTab: '',
        },

        mainTableHeight: this.$tableHeight.normal, //主列表table高度
        ready: false,

        /*工具参数*/
        tools: {
          loading: false, //是否显示table加载动画
          toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
          tableHover: false, //控制滚动条和top按钮同时出现
          showElementSet: false, //自定义列弹框是否显示
          showTopBtn: false, //显示To top按钮
          tablelable: [], //从缓存中加载的table header
          dropCol: [], //自定义列工具的数据
        },


        tableId: 'projectTable', //需要分页的table的id，用于记录每页数量

        endpoint:{
          project:null,
          module:null,
        },
        userData: [],

        endpoint: {id: '', host: '', port: '', param: '', path: '', asset: {}, project: {}, module: {}, moduleId: '', assetId: '', paramObj: []},
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
          pageSize: 50,
          total:0
        },
        endpoint: {},

        currentProjectTitle:'',
        moduleList: [],
        projectList: [],
        pageType:'',//project endpoint
        currentProject: {id: '', name: '', remark: ''}, //endpoint弹框、module列表用来回显project
        module: {}, //编辑的module
        blankModule: {id: '', type: '', name: '', project: {}, port: '', path: '', param: '', paramObj: [], snmpParam: ''}, //空白module
        currentModule: {id: '', type: '', name: '', project: {}, port: '', path: '', param: '', paramObj: [], snmpParam: ''}, //用来回显的module
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
      }
    },
    methods: {
      // 全屏
      fullScreen() {
        let vm = this;
        this.$bottomBoxWindow.fullScreen(vm);
      },
      // 退出全屏
      exitFullScreen() {
        let vm = this;
        this.$bottomBoxWindow.exitFullScreen(vm);
      },
      // 鼠标拖动二级列表
      listResize(e) {
        let vm = this;
        this.$bottomBoxWindow.listResize(vm, e);
      },
      elementsetShow(s, e) {
        var eventfixed = {
          shezhi: 0,
          screen: 0
        };
        eventfixed[s] = 1;
        e.preventDefault();
        this.$store.commit('setHeaderTable', this.tools.tablelable);
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
        this.tools.showElementSet = false;
      },
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        this.tools.tablelable = data;
      },
      getEndpointTableData() {
        if(this.currentModule&&this.currentModule.id){
          this.pageType='endpoint'
          this.endpointSearchLabel.moduleId = this.currentModule.id;
          this.$set(this.endpointSearchLabel, 'pageNo', this.endpointPageObj.pageNo);
          this.$set(this.endpointSearchLabel, 'pageSize', this.endpointPageObj.pageSize);
          this.tools.loading = true;
          this.$get('endpoint', this.endpointSearchLabel).then(response => {
            this.tools.loading = false;
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
      getProjectList(reload) {
        this.$get('project',{pageSize:-1}).then(response=>{
          if(response.code == 200){
            this.projectList = response.data.list;
            if (reload) {
              if (this.projectList.length > 0) {
                this.currentProject = this.projectList[0];
              } else {
                this.currentProject = {};
              }
            }
          }
        })
      },
      getProjectModule(projectId) {
        let moduleList = JSON.parse(JSON.stringify(this.moduleList));
        return moduleList.filter((item,index) => {
          return item.project.id == projectId;
        })
      },
      detailProject(event, project) {
        this.pageType = 'project';
        if(event) {
          if(project) {
            this.currentProject = project;
          }
        } else {
          this.currentProjectTitle = this.currentProject.name + "-" + this.currentProject.id;
        }
        this.currentModule = {};
      },
      closeModuleRightBox(refresh) {
        this.rightBox.module.show = false;
        if (refresh) {
          this.getAllModuleList();
        }
      },
      closeAddEndpointRightBox(refresh) {
        this.rightBox.addEndpoint.show = false;
        if (refresh) {
          this.getEndpointTableData();
        }
      },
      closeEditEndpointRightBox(refresh) {
        this.rightBox.editEndpoint.show = false;
        if (refresh) {
          this.getEndpointTableData();
        }
      },
      getAllModuleList() {
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
          }
        });
      },
      //左侧module列表选中切换
      changeModule(project, module) {
        this.currentModule = module;
        this.endpointSearchLabel = {moduleId: ''};
        this.$refs.projectSearch.clearSearch();
        this.bottomBox.showSubList = false;
        this.currentProject = project;
      },

      //弹出endpoint编辑页
      editEndpoint(endpoint) {
        this.endpoint = JSON.parse(JSON.stringify(endpoint));
        this.$set(this.endpoint,'projectId',this.currentModule.project.id)
        this.$set(this.endpoint,'moduleId',this.currentModule.id)

        this.rightBox.editEndpoint.show = true;
        if (!this.endpoint.paramObj) {
          this.$set(this.endpoint, 'paramObj', []);
        }
      },

      addEndpoint() {
        this.endpoint.project = Object.assign({},this.currentModule.project);
        this.endpoint.module = Object.assign({},this.currentModule);
        this.rightBox.addEndpoint.show = true;
      },

      //查看endpoint详情
      detailEndpoint(endpoint) {
        this.endpoint = Object.assign({}, endpoint);
        this.bottomBox.targetTab = "panel";
        this.bottomBox.showSubList = true;
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
      editModule(module) {
        this.currentModule = JSON.parse(JSON.stringify(module));
        if (!this.currentModule.paramObj) {
          this.$set(this.currentModule, 'paramObj', []);
        }
        this.module = JSON.parse(JSON.stringify(module));
        if (!this.module.paramObj) {
          this.$set(this.module, 'paramObj', []);
        }
        if (this.module.snmpParam) {
          this.initSnmpParam(this.module);
        }
        this.rightBox.module.show = true;
        this.$nextTick(() => {
          this.$refs.moduleBox.initWalk();
        });
      },
      addModule() {
        this.module = this.newModule();
        this.rightBox.module.show = true;
        this.$nextTick(() => {
          this.$refs.moduleBox.initWalk();
        });
      },
      newModule() {
        return JSON.parse(JSON.stringify(this.blankModule));
      },

      //搜索
      endpointSearch(searchObj) {
        let orderBy='';
        if(this.endpointSearchLabel.orderBy){
          orderBy=this.endpointSearchLabel.orderBy
        }
        this.endpointSearchLabel = {};
        this.endpointPageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.endpointSearchLabel, item, searchObj[item]);
          }
        }
        if(orderBy){
          this.$set(this.endpointSearchLabel, 'orderBy', orderBy);
        }
        this.getEndpointTableData();
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
        this.endpoint = Object.assign({}, endpoint);
        this.bottomBox.targetTab = 'assetDetail';
        this.bottomBox.showSubList = true;
        /*this.viewAssetState=true;
        this.$refs.assetEditUnit.getAssetData(id);
        this.$refs.assetEditUnit.tabView=true;*/
      },
      query(endpoint) {
        this.endpoint = Object.assign({}, endpoint);
        this.bottomBox.targetTab = 'endpointQuery';
        this.bottomBox.showSubList = true;
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
        let detail = {
          project: obj.project.name,
          module: obj.module.name,
          asset: obj.asset.host,
          host: obj.host,
          port: obj.port,
          path: obj.path,
          param: obj.param
        };
        /*detail.push({label: this.$t('project.project.project'), value: obj.project.name});
        detail.push({label: this.$t("project.module.module"), value: obj.module.name});
        detail.push({label: this.$t("asset.asset"), value: obj.asset.host});
        detail.push({label: this.$t("project.endpoint.host"), value: obj.host});
        detail.push({label: this.$t("project.endpoint.port"), value: obj.port});
        detail.push({label: this.$t("project.endpoint.path"), value: obj.path});
        detail.push({label: this.$t("project.endpoint.param"), value: obj.param});*/
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
        let detail = JSON.parse(JSON.stringify(obj));
        detail.state = obj.state == 1 ? this.$t('asset.inStock'): this.$t('asset.notInStock');
        detail.assetType = obj.model.type.value;
        detail.vendorModel = obj.model.vendor.value + " " + obj.model.name;
        detail.dataCenter = obj.idc ? obj.idc.name : "";
        detail.location = obj.idc ? obj.idc.location : "";
        detail.principal = obj.idc ? this.getPrincipalName(obj.idc.principal) : "";
        detail.tel = obj.idc ? obj.idc.tel : "";
        detail.cabinet = obj.cabinet ? obj.cabinet.name : "";
        detail.uSize = obj.cabinet ? obj.cabinet.uSize : "";
        detail.remark = obj.idc ? obj.idc.remark : "";
        if (obj.accounts.length > 0) {
          let account = obj.accounts[0];
          detail.protocol = account.protocol;
          detail.account = account.user;
          let loginType = "";
          if (account.authType == 1) {
            loginType = this.$t('asset.password');
          } else if (account.authType == 2) {
            loginType = this.$t('asset.ssh');
          }
          detail.loginType = loginType;
          detail.port = account.port;
        }
        /*detail.push({label: this.$t("asset.sn"), value: obj.sn});
        detail.push({label: this.$t("asset.host"), value: obj.host});
        detail.push({label: this.$t("asset.state"), value: obj.state == 1 ? this.$t('asset.inStock'): this.$t('asset.notInStock')});
        detail.push({label: this.$t("asset.tableTitle.modules"), value: obj.endpointNum});
        detail.push({label: this.$t("asset.tableTitle.alerts"), value: obj.alertNum});
        detail.push({label: this.$t("asset.assetType"), value: obj.model.type.value});
        detail.push({label: this.$t("asset.vendorModel"), value: obj.model.vendor.value + " " + obj.model.name});
        detail.push({label: this.$t("asset.assetType"), value: obj.model.type.value});
        detail.push({label: this.$t("asset.purchaseDate"), value: obj.purchaseDate});
        detail.push({label: this.$t("asset.dcName"), value: obj.idc ? obj.idc.name : ""});
        detail.push({label: this.$t("asset.location"), value: obj.idc ? obj.idc.location : ""});
        detail.push({label: this.$t("asset.principal"), value: obj.idc ? this.getPrincipalName(obj.idc.principal) : ""});
        detail.push({label: this.$t("asset.location"), value: obj.idc ? obj.idc.location : ""});
        detail.push({label: this.$t("asset.tel"), value: obj.idc ? obj.idc.tel : ""});
        detail.push({label: this.$t("asset.cabinet"), value: obj.cabinet ? obj.cabinet.name : ""});
        detail.push({label: this.$t("asset.editAssetTab.uSize"), value: obj.cabinet ? obj.cabinet.uSize : ""});
        detail.push({label: this.$t("asset.editAssetTab.remark"), value: obj.idc ? obj.idc.remark : ""});
        if (obj.accounts.length > 0) {
          let account = obj.accounts[0];
          if (account.protocol == 'SSH') {
            detail.push({label: this.$t("asset.protocol"), value: 'SSH'});
            detail.push({label: this.$t("asset.account"), value: account.user});
            let loginType = "";
            if (account.authType == 1) {
              loginType = this.$t('asset.password');
            } else if (account.authType == 2) {
              loginType = this.$t('asset.ssh');
            }
            detail.push({label: this.$t("asset.loginType"), value: loginType});
          } else if (account.protocol == 'TELNET') {
            detail.push({label: this.$t("asset.protocol"), value: 'TELNET'});
            detail.push({label: this.$t("asset.account"), value: account.user});
          }
          detail.push({label: this.$t("asset.port"), value: account.port});
        }*/
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
      },
      //是否需要排序
      sortableShow(prop){
        switch(prop){
          case 'id':
          case 'asset':
          case 'port':
          // case 'path':
            return'custom';
          default : return false;
        }
      },
      // prop字段
      propTitle(prop){
        switch(prop){
          case 'id': return'e.id';
          case 'asset': return'a.host';
          case 'port': return'e.port';
          // case 'path': return'e.path';
          default : return prop;
        }
      },
      // 数据排序
      tableDataSort(item){
        let orderBy='';
        if(item.order==='ascending'){
          orderBy=item.prop;
        }
        if(item.order==='descending'){
          orderBy='-'+item.prop;
        }
        this.$set(this.endpointSearchLabel, "orderBy", orderBy);
        this.getEndpointTableData();
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
      setTimeout(() => {
        this.ready = true;
      }, 300);
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.endpointTable.$el.querySelector(".el-table__body-wrapper");
        if (el._ps_) {
          el.addEventListener("ps-scroll-y", () => {
            if (el._ps_.scrollbarYTop > 50) {
              this.tools.showTopBtn = true;
            } else {
              this.tools.showTopBtn = false;
            }
          });

          el.addEventListener("mouseenter", () => {
            this.tools.tableHover = true;
          });
          el.addEventListener("mouseleave", () => {
            this.tools.tableHover = false;
          });
        }
      });
      //resize时刷新左侧列表滚动条
      let _this = this;
      window.onresize = function() {
        _this.$refs.leftScrollbar.update();
      }

      this.tools.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.endpointTableTitle;
      this.tools.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
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
      itemTip() {
        return function(id, content, ready) {
          let className = "item-tip-show";
          this.$nextTick(() => {
            if (ready) {
              let cellDom = document.querySelector(`#module-${id}`);
              let spanDom = document.querySelector(`#module-${id}>span`);
              if (cellDom.offsetWidth - 16 <= spanDom.offsetWidth) {
                document.querySelector(`#module-${id}>.el-popover`).classList.add(className);
              } else {
                document.querySelector(`#module-${id}>.el-popover`).classList.remove(className);
              }
            }
          });
          return "";
        }
      },
    },
    watch: {
      currentProjectChange:{
        immediate:true,
        handler(n, o) {
          this.currentProject = Object.assign({}, n);
          this.detailProject();
        }
      },
      projectListChange:function(n,o){
        this.getProjectList(true);
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
      "bottomBox.showSubList": function(n) {
        let vm = this;
        this.$bottomBoxWindow.showSubListWatch(vm, n);
      },
      endpoint: {
        deep: true,
        handler(n) {
          this.bottomBox.endpointDetail = this.convertToDetail(n);
          this.$get('asset', {id: n.assetId}).then(response => {
            if (response.code === 200) {
              this.bottomBox.assetDetail = this.assetConvertToDetail(response.data.list[0]);
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
    padding-left: 10px;
    box-sizing: border-box;
  }
  .sub-side-bar-menu-edit{
    margin-right: 18px;
  }

  .item-tip-hide {
    display: none;
    position: absolute;
    bottom: 34px;
    min-width: 50px;
    white-space: normal;
  }
  .item-tip:hover>.item-tip-show {
    display: block;
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
  .sidebar-info-sub-item:hover .hid-div{
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
