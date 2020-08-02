<template>
  <div class="content">
    <div class="content-left left-slot" :class="{'left-slot-shrink': isShrink}">
      <div class="sidebar-title too-long-split">{{menus[parentMenu].title}}</div>
      <div class="sidebar-info">
        <template v-if="parentMenu == 'projects'">
          <el-collapse v-model="currentProjectTitle" class="left-menu-bg" accordion style="padding-top: 0px;" ref="projectLeft">
            <el-collapse-item v-for="(item,index) in projectList" :key="item.name+item.id+index" :name="item.name+'-'+item.id">
              <template slot="title">
                <div class="sidebar-info-item" :class="{'sidebar-info-item-active': item.id == currentProject.id}" @click="detailProject($event, item)" :id="'project-module-'+item.id">
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
        <template v-else-if="parentMenu == 'assets'">

        </template>
        <template v-else>
          <div v-for="menu in menus[parentMenu].menu" class="sidebar-info-item" :class="{'sidebar-info-item-active': menu.route == active}" @click="jumpTo(menu.route)">
            {{menu.name}}
          </div>
        </template>
      </div>
      <div @click="toggleStat" class="bottom-icon">
        <div class="bottom-divider"></div>
        <div style="display: inline-block;float: right;margin-right:15px;"><i style="font-size: 24px;" :class="{'nz-icon nz-icon-push-pin-line': isShrink, 'nz-icon nz-icon-push-pin-fill': !isShrink}" :style="{color : !isShrink ? '#EE9D3F' : ''}"></i></div>
      </div>
    </div><div class="content-right right-slot" :class="{'right-slot-open': isShrink}">
      <router-view/>
    </div>
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
          active: "overview",

          projectList: [],
          moduleList: [],
          currentProjectTitle: '',
          currentProject: {id: '', name: '', remark: ''}, //endpoint弹框、module列表用来回显project
          module: {}, //编辑的module
          blankModule: {id: '', type: '', name: '', project: {}, port: '', path: '', param: '', paramObj: [], snmpParam: ''}, //空白module
          currentModule: {id: '', type: '', name: '', project: {}, port: '', path: '', param: '', paramObj: [], snmpParam: ''}, //用来回显的module

          menus: {
            settings: {
              title: this.$t('overall.config'),
              menu: [
                {route: '/account', name: this.$t('config.account.account')},
                {route: '/promServer', name: this.$t('config.promServer.promServerList')},
                {route: '/dc', name: this.$t('config.dc.dc')},
                {route: '/model', name: this.$t('config.model.model')},
                {route: '/mib', name: this.$t('config.mib.mib')},
                {route: '/system', name: this.$t('config.system.system')},
                {route: '/terminallog', name: this.$t('config.terminallog.terminallog')},
                {route: '/operationlog', name: this.$t('config.operationlog.operationlog')},
              ],
            },
            alerts: {
              title: this.$t('alert.alert'),
              menu: [
                {route: '/alertList', name: this.$t('alert.alertList')},
                {route: '/alertConfig', name: this.$t('alert.alertConfig')},
              ],
            },
            dashboards: {
              title: this.$t('dashboard.title'),
              menu: [
                {route: '/overview', name: this.$t('dashboard.overview.title')},
                {route: '/panel', name: this.$t('dashboard.panel.title')},
                {route: '/explore', name: this.$t('dashboard.metricPreview.title')},
              ],
            },
          }
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
        projectListChange() {
          return this.$store.state.projectListChange;
        },
        moduleListChange() {
          return this.$store.state.moduleListChange;
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
            this.active = n;
          }
        },
        projectListChange(n) {
          this.getProjectList();
        },
        moduleListChange(n) {
          this.getModuleList();
        },
        endpointListChange(n) {
          this.getEndpointTableData();
        },
        currentProjectChange: {
          immediate: true,
          handler(n, o) {
            if (n && n.id != this.currentProject.id) {
              this.currentProject = this.projectList.find(p => {
                return p.id == n.id;
              });
              if (this.currentProject && this.currentProject.id) {
                this.detailProject(null, this.currentProject);
              }
            }
          },
        },
        currentProject(n, o) {
          bus.$emit("current-project-change", n);
        },
        currentModule(n, o) {
          bus.$emit("current-module-change", n);
        },
      },
      mounted() {
        Promise.all([this.getProjectList(), this.getModuleList()]).then(response => {
          let cacheParentMenu = localStorage.getItem('nz-parent-menu');
          let cacheMenu = localStorage.getItem('nz-menu');
          if (cacheParentMenu) {
            this.parentMenu = cacheParentMenu;
          } else {
            this.parentMenu = "dashboards";
          }
          if (cacheMenu) {
            this.active = cacheMenu;
          } else {
            if (this.parentMenu == 'projects') {
              this.projectList.length > 0 && (this.active = this.projectList[0].name)
            } else if (this.parentMenu == 'assets') {

            } else {
              this.active = this.menus[this.parentMenu].menu[0].route;
            }
          }
          bus.$on("parent-menu-change", parentMenu => {
            this.parentMenu = parentMenu;
          });
          bus.$on("menu-change", menu => {
            this.active = menu;
          });
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
        //左侧module列表选中切换
        changeModule(project, module) {
          this.currentModule = module;
          this.currentProject = project;
        },
        detailProject(event, project) {
          bus.$emit("project-pageType", "project");
          if(event) {
            if(project) {
              this.currentProject = project;
            }
          } else {
            this.currentProjectTitle = project.id + "";
          }
          this.currentModule = {};
        },


        jumpTo(route) {
          bus.$emit("menu-change", route);
          localStorage.setItem('nz-parent-menu', this.parentMenu);
          localStorage.setItem('menu-change', route);
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
    transition: transform 200ms;
    transform: scaleX(1);
    transform-origin: left;
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
    /*width: 25px;*/
    transform: scaleX(0.12);
    .bottom-icon .bottom-divider{
      width: 0px;
    }
    .slot-content{
      /*visibility: hidden;*/
      opacity: 0;
    }
  }
  .slot-content {
    transition: opacity 200ms;
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
    i{
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
    /*width: 200px;*/
    transform: scaleX(1);
    /*padding: 0px 0px 0px 15px;
    position: absolute;*/
    z-index: 100;
    .slot-content{
      /*visibility: visible;*/
      opacity: 1;
    }
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
