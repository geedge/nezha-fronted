<template>
  <div class="content">
    <div class="content-left left-slot" :class="{'left-slot-shrink': isShrink}">
      <div class="sidebar-title too-long-split">
        <template v-if="parentMenu == '/project'">{{$t("overall.project")}}</template>
        <template v-else-if="parentMenu == '/asset'">{{$t("overall.asset")}}</template>
        <template v-else>{{$CONSTANTS.staticMenus[parentMenu].title}}</template>
      </div>
      <div class="sidebar-info" style="height: 90%">
        <el-scrollbar style="height: 100%;">
          <template v-if="parentMenu == '/project'">
            <el-collapse class="left-menu-bg" accordion style="padding-top: 0;" ref="projectLeft">
              <el-collapse-item v-for="(item, index) in projectList" :key="item.id" :name="item.id + ''">
                <template slot="title">
                  <div class="sidebar-info-item-project sidebar-info-item" :class="{'sidebar-info-item-active': item.id == currentProject.id}" @click="detailProject(item)" :id="'project-module-'+item.id">
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
          </template>
          <template v-else-if="parentMenu == '/asset'">
            <el-collapse v-model="activeType" class="left-menu-bg">
              <el-collapse-item name="dataCenter" :title="$t('asset.left.dataCenter')">
                <el-checkbox-group v-model="dcCheckList" size="small">
                  <el-checkbox class="sidebar-info-item sidebar-info-item-asset" :class="{'sidebar-info-item-active': indOf(dcCheckList, item.id)}"
                               v-for="(item,key) in dcData" :key="key" :label=item.id>
                    <div class="sidebar-info-item-txt">
                      <el-popover v-if="item.name.length > 14" trigger="hover" placement="top-start" :content="item.name" >
                        <span slot="reference">{{item.name}}</span>
                      </el-popover>
                      <span v-else>{{item.name}}</span>
                    </div>
                    <el-tooltip :content="''+item.total" placement="top" effect="light" :disabled="item.total<99">
                      <el-badge class="mark" :value="item.total" :max="99"/>
                    </el-tooltip>
                  </el-checkbox>
                </el-checkbox-group>
              </el-collapse-item>
              <el-collapse-item name="assetType" :title="$t('asset.assetType')">
                <el-checkbox-group v-model="assetTypeCheckList" size="small" @change="changeAssetTypeCheckBox">
                  <el-checkbox class="sidebar-info-item" :class="{'sidebar-info-item-active': indOf(assetTypeCheckList, item.id)}" v-for="(item, key) in assetTypeData" :key="key" :label=item.id>
                    <div class="sidebar-info-item-txt">
                      <el-popover v-if="item.name.length > 14" trigger="hover" placement="top-start" :content="item.name" >
                        <span slot="reference">{{item.name}}</span>
                      </el-popover>
                      <span v-else>{{item.name}}</span>
                    </div>
                    <el-tooltip :content="''+item.total" placement="top" effect="light" :disabled="item.total<99">
                      <el-badge class="mark" :value="item.total" :max="99"/>
                    </el-tooltip>
                  </el-checkbox>
                </el-checkbox-group>
              </el-collapse-item>
              <el-collapse-item name="vendor" :title="$t('asset.left.vendor')">
                <el-checkbox-group v-model="vendorCheckList" size="small" @change="changeVendorCheckBox">
                  <el-checkbox class="sidebar-info-item" :class="{'sidebar-info-item-active': indOf(vendorCheckList, item.id)}" v-for="(item, key) in vendorData" :key="key" :label=item.id>
                    <div class="sidebar-info-item-txt">
                      <el-popover v-if="item.name.length > 14" trigger="hover" placement="top-start" :content="item.name" >
                        <span slot="reference">{{item.name}}</span>
                      </el-popover>
                      <span v-else>{{item.name}}</span>
                    </div>
                    <el-tooltip :content="''+item.total" placement="top" effect="light" :disabled="item.total<99">
                      <el-badge class="mark" :value="item.total" :max="99"/>
                    </el-tooltip>
                  </el-checkbox>
                </el-checkbox-group>
              </el-collapse-item>
              <el-collapse-item name="ping" :title="$t('asset.left.ping')">
                <el-checkbox-group v-model="pingCheckList" size="small" @change="changePingCheckBox">
                  <el-checkbox class="sidebar-info-item" :class="{'sidebar-info-item-active': indOf(pingCheckList, item.key)}" v-for="(item, index) in pingData" :key="index" :label="item.label">
                    <div class="sidebar-info-item-txt">
                      <span>{{item.label}}</span>
                    </div>
                    <el-tooltip :content="''+item.total" placement="top" effect="light" :disabled="item.total < 99">
                      <el-badge class="mark" :value="item.total" :max="99"/>
                    </el-tooltip>
                  </el-checkbox>
                </el-checkbox-group>
              </el-collapse-item>
            </el-collapse>
          </template>
          <template v-else>
            <div v-for="menu in $CONSTANTS.staticMenus[parentMenu].menu" class="sidebar-info-item" :class="{'sidebar-info-item-active': menu.route == route}" @click="jumpTo(menu.route)">
              {{menu.name}}
            </div>
          </template>
        </el-scrollbar>
      </div>
      <div @click="toggleStat" class="bottom-icon">
        <div class="bottom-divider"></div>
        <div style="display: inline-block;float: right;margin-right:15px;"><i style="font-size: 24px;" :class="{'nz-icon nz-icon-push-pin-line': isShrink, 'nz-icon nz-icon-push-pin-fill': !isShrink}" :style="{color : !isShrink ? '#EE9D3F' : ''}"></i></div>
      </div>
    </div><div class="content-right right-slot" :class="{'right-slot-open': isShrink}">
      <router-view/>
    </div>

    <transition name="right-box">
      <module-box v-if="rightBox.module.show" :current-project="currentProject" :module="module" @close="closeModuleRightBox" ref="moduleBox"></module-box>
    </transition>
  </div>
</template>

<script>
    import bus from "../../libs/bus";

    export default {
      name: "leftMenu",
      props: {
        resizeFunc: Function,
      },
      data() {
        return{
          isShrink: localStorage.getItem('nz-left-menu-shrink') == 'true',
          parentMenu: "dashboards",
          //active: "/overview",

          //project相关
          projectList: [],
          moduleList: [],
          showProjectPanel: true,
          currentProjectTitle: '',
          currentProject: {id: '', name: '', remark: ''}, //endpoint弹框、module列表用来回显project
          module: {}, //编辑的module
          blankModule: {id: '', type: '', name: '', project: {}, port: '', path: '', param: '', paramObj: [], snmpParam: ''}, //空白module
          currentModule: {id: '', type: '', name: '', project: {}, port: '', path: '', param: '', paramObj: [], snmpParam: ''}, //用来回显的module
          ready: false,
          rightBox: {module: {show: false}},

          //asset相关
          activeType: 'dataCenter',
          dcData: [],
          dcCheckList: [],
          assetTypeData: [],
          assetTypeCheckList: [],
          vendorData: [],
          vendorCheckList: [],
          pingData: [],
          pingCheckList: [],
        }
      },
      computed: {
        route() {
          return this.$route.path;
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
        currentProjectChange() {
          return this.$store.state.currentProject;
        },
      },
      watch: {
        route: {
          deep: true,
          immediate: true,
          handler(n) {
            this.parentMenu = this.getParentMenu(n);
          }
        },
        currentProjectChange: {
          immediate: true,
          handler(n, o) {
            if (n && n.id != this.currentProject.id) {
              this.currentProject = n;
              if (this.currentProject && this.currentProject.id && this.showProjectPanel) {
                this.detailProject(this.currentProject);
              }
            }
          },
        },
        currentProject(n, o) {
          bus.$emit("current-project-change", n); //告知project.vue
        },
        dcCheckList: {
          deep: true,
          immediate: true,
          handler(n) {
            bus.$emit("asset-filter-change", "idcIds", n.join(","));
          }
        }
      },
      mounted() {
        Promise.all([this.getProjectList(), this.getModuleList(), this.getLeftMenuList()]).then(response => {
          this.initEvent(); //注册监听事件
          setTimeout(() => {
            this.ready = true;
          }, 300);
        });
      },
      methods: {
        toggleStat() {
          this.isShrink = !this.isShrink;
          localStorage.setItem('nz-left-menu-shrink', this.isShrink);
          if (this.resizeFunc) {
            this.resizeFunc();
          }
        },
        //根据route获取父菜单，
        getParentMenu(route) {
          let parentMenu = "";
          let end = false;
          if (route != '/project' && route != '/asset') {
            for (let r in this.$CONSTANTS.staticMenus) {
              if (!end) {
                this.$CONSTANTS.staticMenus[r].menu.forEach(menu => {
                  if (route == menu.route) {
                    parentMenu = r
                    end = true;
                  }
                });
              }
            }
          } else {
            parentMenu = route;
          }
          return parentMenu;
        },
        getProjectList() {
          return new Promise(resolve => {
            this.$get('project', {pageSize: -1}).then(response=>{
              if(response.code == 200){
                this.projectList = response.data.list;
              }
              resolve(this.projectList);
            });
          });
        },
        getProjectModule(projectId) {
          let moduleList = JSON.parse(JSON.stringify(this.moduleList));
          return moduleList.filter((item,index) => {
            return item.project.id == projectId;
          })
        },
        getModuleList() {
          return new Promise(resolve => {
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
                  } catch (err) {}
                }
              }
              resolve(this.moduleList);
            });
          });
        },
        //左侧module列表选中切换，与project.vue同步
        changeModule(project, module) {
          this.showProjectPanel = false;
          this.changeCurrentProject(project);
          this.changeCurrentModule(module);
          bus.$emit("project-page-type", "endpoint");  //告知project.vue
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
        //弹出module编辑页
        editModule(module) {
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
        closeModuleRightBox(refresh) {
          this.rightBox.module.show = false;
          if (refresh) {
            this.getModuleList();
          }
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
        changeCurrentProject(project) {
          /*localStorage.setItem("nz-current-project", project.id);
          this.$store.commit("currentProjectChange", project);*/
          this.currentProject = project;
        },
        changeCurrentModule(module) {
          bus.$emit("current-module-change", module);  //告知project.vue
          this.currentModule = module;
        },
        //与header.vue同步
        detailProject(project) {
          this.showProjectPanel = true;
          this.changeCurrentProject(project);
          bus.$emit("project-page-type", "project");  //告知project.vue
          this.changeCurrentModule({id: ""});
        },

        initEvent() {
          /*bus.$on("parent-menu-change", parentMenu => {
            this.parentMenu = parentMenu;
          });
          bus.$on("menu-change", menu => {
            this.active = menu;
          });*/
          bus.$on("header-dc-change", dcId => {
            this.dcCheckList = [dcId];
            bus.$emit("asset-filter-change", "idcIds", dcId);
          });
          bus.$on("clear-asset-filter", dcId => {
            this.dcCheckList = [];
            this.assetTypeCheckList = [];
            this.vendorCheckList = [];
            this.pingCheckList = [];
          });
          bus.$on("project-list-change", () => {
            this.getProjectList();
          });
          bus.$on("module-list-change", menu => {
            this.getModuleList();
          });
          bus.$on('asset-list-change',()=>{
            this.getLeftMenuList();
          })
        },
        // 获取asset左侧菜单数据
        getLeftMenuList(){
          return new Promise(resolve => {
            this.$get('asset/filter').then(response => {
              if (response.code === 200) {
                //dc
                this.dcData = response.data.dc;
                // AssetType
                this.assetTypeData = response.data.assetType;
                // vendor
                this.vendorData = response.data.vendor;
                // ping
                this.pingData = response.data.ping.map(item => {
                  item.label = item.name;
                  item.value = item.status;
                  return item;
                });
              }
              resolve();
            });
          });
        },

        //asset左侧菜单4个事件
        changeCheckBox() {
          this.assetClick = true;
        },
        changeAssetTypeCheckBox() {
          if(this.assetTypeCheckList && this.assetTypeCheckList.length > 0){
            let assetTypeIds = this.assetTypeCheckList.join(',');
            bus.$emit("asset-filter-change", "typeIds", assetTypeIds);
          }else{
            bus.$emit("asset-filter-change", "typeIds", "");
          }
        },
        changeVendorCheckBox() {
          if(this.vendorCheckList && this.vendorCheckList.length > 0){
            let vendorIds = this.vendorCheckList.join(',');
            bus.$emit("asset-filter-change", "vendorIds", vendorIds);
          }else{
            bus.$emit("asset-filter-change", "vendorIds", "");
          }
        },
        changePingCheckBox() {
          if(this.pingCheckList && this.pingCheckList.length > 0){
            let pingStates = this.pingCheckList.join(',');
            bus.$emit("asset-filter-change", "pingStates", pingStates);
          }else{
            bus.$emit("asset-filter-change", "pingStates", "");
          }
        },

        indOf(a, b) {
          let c = [];
          for (let i = 0; i < a.length; i++) {
            c.push(a[i]);
          }
          if (c.indexOf(b) > -1) {
            return true;
          } else {
            return false;
          }
        },
        jumpTo(route) {
          /*bus.$emit("menu-change", route);
          localStorage.setItem('nz-parent-menu', this.parentMenu);
          localStorage.setItem('nz-menu-change', route);*/
          this.$router.push({
            path: route,
            query: {
              t: +new Date()
            }
          });
        }
      },
    }
</script>

<style scoped lang="scss">
  .content{
    position: relative;
    height: calc(100% - 50px);
  }
  .slot-content{
    height: 100%;
  }
  .content .left-slot{
    position: relative;
    background-color: $left-menu-bgcolor;
    transition: transform 200ms, opacity 200ms;
    transform: scaleX(1);
    transform-origin: left;
    opacity: 1;
    /*border-bottom: 1px solid #eeeeee;*/
    /*transition: all 100ms;*/
  }
  .content .right-slot{
    width: calc(100% - 200px);
  }
  .content .right-slot-open{
    width: calc(100% - 23px);
    margin-left: -177px;
  }
  .content .left-slot-shrink{
    transform: scaleX(0.12);
    opacity: 0;
    .bottom-icon .bottom-divider{
      width: 0px;
    }
  }
  .slot-content {
    transition: opacity 200ms;
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
  .hid-div{
    visibility: hidden;
  }
  .sidebar-info-sub-item:hover .hid-div{
    visibility: visible;
  }

  .sub-sidebar-info{
    padding-top: 10px !important;
    padding-left: 10px;
    box-sizing: border-box;
  }
  .sub-side-bar-menu-edit{
    margin-right: 18px;
  }

  .sidebar-info-item-project.sidebar-info-item{
    margin:0 !important;
  }
  .sidebar-info-item-asset .sidebar-info-item-txt{
    vertical-align: text-top;
  }
  /deep/ .el-badge__content{
    min-width: 15px;
  }
  .left-slot .bottom-icon{
    position:absolute;
    width: 36px;
    height: 36px;
    right: 0;
    bottom: 30px;
  }
  .left-slot .bottom-icon i{
    visibility: hidden;
  }
  .left-slot:hover{
    .bottom-icon i{
      visibility: visible;
    }
  }
  .left-slot .bottom-icon i:hover{
    cursor: pointer;
  }

  .bottom-icon .bottom-divider{
    display: inline-block;
    height: 1px;
    width: 175px;
    border-top: 1px solid lightgrey;
    vertical-align: middle;
    visibility: hidden;
  }
  .content .left-slot-shrink:hover{
    transform: scaleX(1);
    z-index: 100;
    opacity: 1;
    .bottom-icon{
      z-index: 101;
    }
    .bottom-icon .bottom-divider{
      width: 175px;
    }
  }
</style>
<style lang="scss">

</style>
