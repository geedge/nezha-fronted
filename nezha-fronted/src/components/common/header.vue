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
        <el-submenu index="1" popper-class="nz-submenu">
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
                <div @click.stop="toEditProject(item)" class="menu-edit"><i style="color: inherit"
                                                                            class="el-icon-edit-outline"></i></div>
              </div>
            </el-menu-item>
          </template>
        </el-submenu>
        <el-submenu index="3" popper-class="nz-submenu">
          <template slot="title">
            <div @click="jumpTo('asset')">{{$t('overall.asset')}}</div>
          </template>
          <template v-for="(item, index) in assetData">
            <el-menu-item :index="'3-' + index">
              <div @click="jumpToAsset('asset',item.id)">
                <span>{{item.name}}</span>
                <idc-config-box :post-idc="item" placement="left" @after="getIDCOptionData" :button-class="'menu-edit'">
                  <template v-slot:optionZone>
                    <i class="el-icon-edit-outline" @click="getIDCOptionData(item.id)" style="color: inherit"></i>
                  </template>
                </idc-config-box>
                <!--<el-popover
                  placement="bottom"
                  v-model="item[item.name]"
                  trigger="click"
                >
                  <div class="pop-window-assetType-content">
                    <div class="right-box-top-btns">
                      <div class="right-box-top-btn right-box-top-btn-full"
                           @click="item[item.name] = false">
                        <div class="right-box-btn-icon">
                          <i class="el-icon-close"></i>
                        </div>
                        <span>{{$t('overall.esc')}}</span>
                      </div>
                    </div>
                    <div class="pop-window">
                      <span style="display: block;padding-bottom: 20px">标题</span>
                      <div style="padding-top: 10px;padding-left: 20px">
                        <div>
                          <label style="font-size: 12px">DN name</label>
                          <input class='sidebar-pop-input' v-model="addIdcData.name"/>
                        </div>
                        <div style="padding-top: 40px">
                          <label style="font-size: 12px">Loaction</label>
                          <input class='sidebar-pop-input' v-model="addIdcData.location"/>
                        </div>
                        <div style="padding-top: 40px">
                          <label style="font-size: 12px;padding-right: 20px">负责人</label>
                          <select class='sidebar-pop-input-select'
                                  style="margin-left:-40px "
                                  v-model="addIdcData.principal"
                                  clearable>
                            <option
                              v-for="item in idcUserData"
                              :key="item.key"
                              :label="item.username"
                              :value="item.userId"
                            >
                            </option>
                          </select>
                        </div>
                        <div style="padding-top: 40px">
                          <label style="font-size: 12px">Tel</label>
                          <input class='sidebar-pop-input' v-model="addIdcData.tel"/>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="right-box-bottom-btns">
                    <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                         @click.stop="item[item.name]= false">
                      {{$t('overall.cancel')}}
                    </div>
                    <div class="right-box-bottom-btn right-box-bottom-btn-50"
                         @click="editData('idc',item.id)">
                      {{$t('overall.save')}}
                    </div>
                  </div>
                  <div @click.stop="getIDCOptionData(item.id)" slot="reference" class="menu-edit">
                    <i style="color: inherit" class="el-icon-edit-outline"></i>
                  </div>
                </el-popover>-->
              </div>
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
    <panel-box :panel="editPanel" @reload="panelListReload" @reloadForDel="" ref="panelBox"></panel-box>
    <project-box :project="editProject" ref="projectBox"></project-box>
    <module-box :currentProject="currentProject" :module="editModule" @reload="" ref="moduleBox"></module-box>
    <add-endpoint-box :currentProject="currentProject" :currentModule="currentModule" @reload=""
                      ref="addEndpointBox"></add-endpoint-box>
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
        editPanel:{//新增or编辑的panel
          id:'',
          name: ''
        },
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
            label: this.$t('dashboard.panel.createPanelTitle'),
            url: 'panel',
            type: 0
          },
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
        ],
        addIdcData: {
          id: '',
          name: '',
          location: '',
          principal: '',
          tel: ''
        },
        idcUserData: '',
        IDCOptionData: [],
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
        if (item.type == 0) {
          this.$refs.panelBox.show(true);
          this.editPanel = {id: '', name: ''};
        }else  if (item.type == 1) {
          this.$refs.projectBox.show(true,true);
          this.editProject = {id: '', name: '', remark: ''};
        } else if (item.type == 2) {
          this.$refs.moduleBox.show(true,true);
          this.editModule = {
            id: '',
            name: '',
            project: this.$store.state.currentProject,
            port: '',
            path: '',
            param: '',
            paramObj: []
          };
        } else if (item.type == 3) {
          this.$refs.addEndpointBox.show(true);
          this.$refs.addEndpointBox.clearEndpoints();
        } else if (item.type == 5) {
          this.$refs.alertConfigBox.show(true, true);
        }
      },
      jumpToAsset(data, id) {
        if (id != this.$store.state.assetData.selectedData) {
          this.$store.state.assetData = {selectedData: id, step: this.$store.state.assetData.step+1};
        } else {
          this.$store.state.assetData.step = this.$store.state.assetData.step+1;
        }
        this.jumpTo(data);
      },
      jumpToProject(p) {
        this.currentProject = p;
        this.$store.commit('setProject', p);
        this.jumpTo('project');
      },
      getUserData() {
        this.$get('sys/user/list').then(response => {
          if (response.code === 200) {
            this.idcUserData = response.data.list
          }
        })
      },
      getIDCOptionData(data) {
        this.$get('idc?id=' + data).then(response => {
          if (response.code === 200) {
            this.addIdcData = response.data.list[0];
            this.clickFlush(this.addIdcData)
          }
        })
      },
      editData(data, Id) {
        let idcData = {
          id: '',
          name: '',
          location: '',
          principal: '',
          tel: ''
        }
        if (data === 'idc') {
          idcData.id = Id
          idcData.name = this.addIdcData.name
          idcData.location = this.addIdcData.location
          idcData.principal = this.addIdcData.principal
          idcData.tel = this.addIdcData.tel
        }
        this.$put(data, idcData).then(res => {
          const h = this.$createElement;
          if (res.code === 200) {
            this.$notify({
              message: h('i', {style: 'color: teal'}, '修改成功'),
              duration: 2000
            })
            this.$store.state.flushDataSign = true
          } else {
            this.$notify({
              message: h('i', {style: 'color: teal'}, res.msg),
              duration: 2000
            })
          }
        })
      },
      clickFlush(itemData) {
        for (let i = 0; i < this.assetData.length; i++) {
          const element = this.assetData[i];
          if (element.id === itemData.id) {
            setTimeout(() => {
              element[element.name] = true;
            }, 100)
          } else {
            element[element.name] = false
          }
        }
      },
      getAssetData() {
        this.$get('idc', this.pageObj).then(response => {
          if (response.code == 200) {
            this.assetData = response.data.list
            this.assetData.forEach(item => {
              this.$set(item, item.name, false)
            })
          }
        })
      },
      changeLocal(lang) {
        if (lang != localStorage.getItem("nz-language")) {
          localStorage.setItem("nz-language", lang);
          window.location.reload();
        }
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
        this.$refs.projectBox.show(true,true);
        this.editProject = Object.assign({}, p);
      },
      panelListReload(){
        if(this.$route.path==='/panel'){
          this.$store.commit('panelListChange',true);//新增panel之后,且当前页面为panel页面，则更新panel列表
        }
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
      this.getUserData();
      this.getAssetData();
      this.getProjectList();
    },
    computed: {
      projectListReloadWatch() {
        return this.$store.state.projectListChange;
      },
      getIdcData() {
        return this.$store.state.assetDcList;
      }
    },
    watch: {
      getIdcData: {
        handler(newVal, oldVal) {
          this.getAssetData()
        },
        deep: true,
      },
      projectListReloadWatch(n, o) {
        this.getProjectList();
      }
    }
  }
</script>

<style>
  .el-menu.el-menu--horizontal {
    border-bottom: 0px;
  }

  .el-submenu__title .el-submenu__icon-arrow {
    display: none;
  }

  .el-menu--horizontal > .el-menu-item.is-active {
    border-bottom: 0px;
  }

  .el-menu--horizontal > .el-submenu.is-active .el-submenu__title,
  .el-menu--horizontal > .el-menu-item.is-active,
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
    box-shadow: 0 2px 2px 0 rgba(0,0,0,.2);
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

  .el-menu-item > div, .el-menu-item > div > div {
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

  .nz-menu > li:first-of-type {
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

  .pop-window-assetType-content {
    padding: 1px 15px 15px 20px;
  }

  .pop-window {
    height: 370px;
    width: 400px;
  }

  .sidebar-pop-input {
    position: absolute;
    right: 50px;
    width: 200px;
    height: 26px;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    color: #606266;
    display: inline-block;
    padding: 0px 15px;
  }

  .sidebar-pop-input-select {
    position: absolute;
    right: 83px;
    width: 200px;
    height: 26px;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    color: #606266;
    display: inline-block;
    padding: 0px 15px;
  }

  .right-box-top-btn {
    border-radius: 0 0 9px 9px;
    float: right;
    color: #656565;
    height: 30px;
    font-size: 12px;
    padding: 3px 8px 1px 8px;
    border: 1px solid #aaaaaa;
    border-top: none;
    cursor: pointer;
    margin-left: 20px;
  }

  .right-box-bottom-btns {
    position: absolute;
    bottom: 0px;
    width: 100%;
    text-align: center;
  }

  .right-box-bottom-btn-cancel {
    background-color: #DADADA;
    color: #656565;
    width: 50%;
    border-bottom-left-radius: 8px;
  }

  .right-box-top-btn-full {
    background-color: #656565;
    border: 1px solid #656565;
    border-top: none;
    color: white;
  }

  .right-box-bottom-btn-50 {
    width: 50%;
    float: right;
    border-bottom-right-radius: 8px;
  }
</style>
<style>
  .menu-edit {
    line-height: 36px;
    float: right;
  }
</style>
