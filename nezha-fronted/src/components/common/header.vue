<template>
  <div class="header">
    <div class="submenu">
      <el-menu
        class="nz-menu"
        mode="horizontal"
        background-color="#232f3e"
        text-color="#ffffff"
        unique-opened
      >
        <el-submenu index="0" popper-class="nz-submenu">
          <template slot="title">
            <div class="menu-create">
              &nbsp;&nbsp;<i class="el-icon-plus"></i>
              <div>{{$t('overall.create')}}</div>
            </div>
          </template>
          <template v-for="(item, index) in createMenu">
            <el-menu-item :index="'0-' + index">
              <div @click="createBox(item)">
                <span>{{item.label}}</span>
              </div>
            </el-menu-item>
          </template>
        </el-submenu>
        <el-submenu index="1"  popper-class="nz-submenu">
          <template slot="title">
            <div @click="jumpTo('dashboard')">{{$t('overall.dashboard')}}</div>
          </template>
          <el-menu-item index="1-0">
            <div @click="jumpTo('panel')">{{$t('dashboard.panel.title')}}</div>
          </el-menu-item>
          <el-menu-item index="1-1">
            <div @click="jumpTo('metricPreview')">{{$t('dashboard.metricPreview.title')}}</div>
          </el-menu-item>
        </el-submenu>

        <el-submenu index="2" popper-class="nz-submenu">
          <template slot="title">
            <div @click="jumpToProject(projectData[0])">{{$t('overall.project')}}</div>
          </template>
          <template v-for="(item, index) in projectData">
            <el-menu-item :index="'2-' + index">
              <div @click="jumpToProject(item)">
                <span>{{item.name}}</span>
                <div @click.stop="toEditProject(item)" class="menu-edit"><i style="color: inherit" class="el-icon-edit-outline"></i></div>
              </div>
            </el-menu-item>
          </template>
        </el-submenu>
        <el-submenu index="3" popper-class="nz-submenu">
          <template slot="title">
            <div @click="jumpToAsset('asset')">{{$t('overall.asset')}}</div>
          </template>
          <template v-for="(item, index) in assetData">
            <el-menu-item :index="'3-' + index">
              <div @click="jumpToAsset('asset',item.id)">{{item.name}}</div>
            </el-menu-item>
          </template>
        </el-submenu>
        <el-submenu index="4-0" popper-class="nz-submenu">
          <template slot="title">
            <div @click="jumpTo('alertList')">{{$t('overall.alert')}}</div>
          </template>
          <el-menu-item index="4-1">
            <div @click="jumpTo('alertList')">{{$t('alert.alertList')}}</div>
          </el-menu-item>
          <el-menu-item index="4-2">
            <div @click="jumpTo('alertConfig')">{{$t('alert.alertConfig')}}</div>
          </el-menu-item>
        </el-submenu>
        <el-submenu index="5" popper-class="nz-submenu">
          <template slot="title">
            <div @click="jumpTo('account')">{{$t('overall.config')}}</div>
          </template>
          <el-menu-item index="5-0">
            <div @click="jumpTo('account')">{{$t('config.account.account')}}</div>
          </el-menu-item>
          <el-menu-item index="5-1">
            <div @click="jumpTo('promServer')">{{$t('config.promServer.promServerList')}}</div>
          </el-menu-item>
        </el-submenu>
      </el-menu>

    </div>
    <div class="header-right">
      <el-menu
        class=""
        mode="horizontal"
        background-color="#232f3e"
        text-color="#ffffff"
        unique-opened
      >
        <el-submenu index="6" popper-class="nz-submenu">
          <template slot="title">
            <div>{{username}}</div>
          </template>
          <el-menu-item index="6-0">
            <div :style="language=='en'?'color:#f90':''" @click="changeLocal('en')">English</div>
          </el-menu-item>
          <el-menu-item index="6-1">
            <div :style="language=='cn'?'color:#f90':''" @click="changeLocal('cn')">中文</div>
          </el-menu-item>
          <el-menu-item class="nz-menu-line" @click.stop index="6-2">
            <div style="height: 1px; width: 100%; background-color: #cccccc;"></div>
          </el-menu-item>
          <el-menu-item index="6-3">
            <div @click="logout">{{$t('overall.signOut')}}</div>
          </el-menu-item>
        </el-submenu>
      </el-menu>
      <!--<div class="header-user-con">
          <div class="flagselect">
          </div>
          <el-popover
                  placement="bottom"
                  title=""
                  width="200"
                  trigger="hover"
          >
              <div class="userout">
                  <div :style="language!='en'?'color:#a6a6a6':''" @click="changeLocal('en')">
                      <p>English</p>
                  </div>
                  <div :style="language=='cn'?'':'color:#a6a6a6'" @click="changeLocal('cn')">
                      <p>简体</p>
                  </div>
                  <div style="cursor:no-drop;color:#a6a6a6">
                      <p>русский</p>
                  </div>
              </div>
              <div class="sign-out" @click="jumpTo('')">
                  退出登录
              </div>
              <div slot="reference" class="user-avator">
                  <span>用户名</span>
                  <i class="el-submenu__icon-arrow el-icon-arrow-down header-name-jiantou"></i>
              </div>
          </el-popover>
      </div>-->
    </div>

    <project-box :project="editProject" @reload="projectReload" ref="projectBox"></project-box>
    <module-box :currentProject="currentProject" :module="editModule" @reload="" ref="moduleBox"></module-box>
    <add-endpoint-box :currentProject="currentProject" :currentModule="currentModule" @reload="" ref="addEndpointBox"></add-endpoint-box>
    <alert-config-box :parentAlertRule="alertRule" @reload="" ref="alertConfigBox"></alert-config-box>
  </div>
</template>

<script>
  export default {
    name: "Header",
    data() {
      return {
        username: sessionStorage.getItem("nz-username"),
        language: localStorage.getItem("nz-language"),
        assetData: [],
        projectData: [], //顶部菜单project列表中的数据
        editProject: {id: '', name: '', remark: ''}, //新增/编辑的project
        currentProject: {id: '', name: '', remark: ''}, //module/endpoint弹框用来回显project
        editModule: {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []}, //新增/编辑的module
        currentModule: {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []}, //endpoint弹框用来回显module，此处固定为空对象
        editEndpoint: { //新增/编辑的endpoint
          id: '',
          host: '',
          port: '',
          param: '',
          path: '',
          asset: {id: '', name: '', host: ''},
          project: {id: '', name: ''},
          module: {id: '', name: '', param: '', paramObj: {}, projectId: ''},
          moduleId: '',
          assetId: ''
        },
        alertRule: {
          id: '',
          alertName: '',
          type: '',
          linkObject: {id: '', name: ''},
          linkId: '',
          expr: '',
          last: '',
          severity: '',
          summary: '',
          description: '',
          receiver: '',
        },
        createMenu: [ //新增按钮内容
          {
            label: this.$t('project.project.createProject'),
            url: 'project',
            type: 1
          },
          {
            label: this.$t('project.module.createModule'),
            url: 'project',
            type: 2
          },
          {
            label: this.$t('project.endpoint.createEndpoint'),
            url: 'project',
            type: 3
          },
          {
            label: this.$t('asset.createAsset'),
            url: 'asset',
            type: 4
          },
          {
            label: this.$t('alert.config.createAlertConfig'),
            url: 'alertConfig',
            type: 5
          }
        ]
      }
    },
    methods: {
      jumpTo(data) {
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
      createBox(item) {
        if (item.type == 1) {
          this.$refs.projectBox.show(true);
          this.editProject = {id: '', name: '', remark: ''};
        } else if (item.type == 2) {
          this.$refs.moduleBox.show(true);
          this.editModule = {id: '', name: '', project: this.$store.state.currentProject, port: '', path: '', param: '', paramObj: []};
        } else if (item.type == 3) {
          this.$refs.addEndpointBox.show(true);
          this.$refs.addEndpointBox.clearEndpoints();
        } else if (item.type == 5) {
          this.$refs.alertConfigBox.show(true, true);
        }
      },
      jumpToAsset(data, id) {
        this.$store.state.assetData.moduleData = data;
        this.$store.state.assetData.selectedData = id;
        this.jumpTo(data);
      },
      jumpToProject(p) {
        this.currentProject = p;
        this.$store.commit('setProject', p);
        this.jumpTo('project');
      },
      changeLocal(lang) {
        if (lang != localStorage.getItem("nz-language")) {
          localStorage.setItem("nz-language", lang);
          window.location.reload();
        }
      },
      getAssetData() {
        this.$get('idc', this.pageObj).then(response => {
          if (response.code == 200) {
            this.assetData = response.data.list
          }
        })
      },
      getProjectList() {
        this.$get('project', {}).then(response => {
          if (response.code == 200) {
            this.projectData = response.data.list;
            let flag = false;
            //如果currentProject不在新取到的数据里，说明它被删了
            for (let i = 0; i < this.projectData.length; i++) {
              if (this.projectData[i].id == this.currentProject.id) {
                flag = true;
                break;
              }
            }
            if (!flag && this.projectData.length > 0) {
              this.currentProject = this.projectData[0];
              this.$store.commit('setProject', this.currentProject);
            }
          }
        })
      },
      toEditProject(p) {
        this.$refs.projectBox.show(true);
        this.editProject = Object.assign({}, p);
      },
      projectReload() {
        this.getProjectList();
      },
      logout() {
        this.$get('logout');
        this.jumpTo('login');
      }
    },
    created() {
      if (!localStorage.getItem("nz-language")) {
        localStorage.setItem("nz-language", "en");
      }
      this.language = localStorage.getItem("nz-language");
    },
    mounted() {
      this.getAssetData();
      this.getProjectList();
    },
    computed: {
      projectListReloadWatch() {
        return this.$store.state.projectListReload;
      }
    },
    watch: {
      projectListReloadWatch(n, o) {
        if (n) {
          this.getProjectList();
          this.$store.commit('projectListChange', false);
        }
      }
    }
  }
</script>

<style>
  .el-menu.el-menu--horizontal{
    border-bottom: 0px;
  }
  .el-submenu__title .el-submenu__icon-arrow {
    display: none;
  }
  .el-menu--horizontal>.el-menu-item.is-active{
    border-bottom: 0px;
  }
  .el-menu--horizontal>.el-submenu.is-active .el-submenu__title,
  .el-menu--horizontal>.el-menu-item.is-active,
  .el-menu--horizontal .el-menu-item:not(.is-disabled):focus, .el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
    border-bottom: 0px;
    color: white;
  }
  .el-menu--horizontal.nz-submenu {
    border: 1px solid #bbbbbb;
    border-top: none;
  }
  .nz-submenu .el-menu--popup {
    background-color: white !important;
  }
  .nz-submenu .el-menu--popup .el-menu-item {
    background-color: white !important;
  }
  .nz-submenu .el-menu--popup-bottom-start {
    margin-top: 0;
  }
  .nz-submenu.el-menu--horizontal .el-menu .el-menu-item {
    padding: 0 20px;
    color: #444444 !important;
    transition: none;
  }
  .nz-submenu.el-menu--horizontal .el-menu .el-menu-item:hover {
    color: #ff9900 !important;
  }
  .el-submenu__title .el-icon-plus {
    color: white;
  }
  .el-menu-item>div, .el-menu-item>div>div {
    font-size: 15px;
  }
  .nz-menu-line {
    cursor: default;
    display: flex;
    align-items: center;
    height: 18px !important;
  }
</style>

<style scoped>
  .submenu {
    padding-left: 50%;
    width: 500px;
    float: left;
  }

  .header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 60px;
    background-color: #232f3e;
    z-index: 510;
  }

  .header-right {
    float: right;
    padding-right: 5px;
  }

  .header-user-con {
    display: flex;
    height: 50px;
    align-items: center;
  }

  .user-avator {
    padding: 0 5px 3px 0;
    margin-left: 20px;
    line-height: 30px;
    cursor: pointer;
  }

  .user-avator:hover {
    border-radius: 2px;
    background: rgba(255, 255, 255, .3);
  }

  .user-avator span {
    font-size: 16px;
    margin: 0 5px;
    color: white;
  }

  .user-avator i.iconfont {
    color: #fff;
    font-size: 25px;
    transform: translateY(2.5px);
    display: inline-block;
    line-height: 30px;
  }

  .userout {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .userout > div {
    width: 33.3%;
    color: rgba(51, 137, 185, 1);
    cursor: pointer;
    text-align: center;
  }

  .sign-out {
    width: 100%;
    height: 30px;
    color: #fff;
    text-align: center;
    line-height: 30px;
    background: rgba(51, 137, 185, 1);
    margin-top: 20px;
    cursor: pointer;
  }

  .sign-out:hover {
    opacity: .8;
  }

  .nz-menu>li:first-of-type {
    position: fixed;
    left: 40%;
    top: 0;
  }
  .menu-create {
    line-height: 15px;
    text-align: center;
    padding-top: 15px;
  }
  .menu-create .el-icon-plus {
    font-size: 12px;
    line-height: 12px;
  }
  .menu-edit {
    line-height: 36px;
    float: right;
  }
</style>
