<template>
  <div class="header">
    <el-menu
      class="nz-menu float-right"
      mode="horizontal"
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
          <div @click="jumpTo('dashboard')" :class ="(activeIndex == 'dashboard' || activeIndex == 'panel' || activeIndex == 'metricPreview') ? 'menu-active' :'' " >
            {{$t('overall.dashboard')}} 
          </div>
        </template>
        <el-menu-item index="1-0">
          <div @click="jumpTo('panel')" :class="{'menu-item-active' :activeIndex == 'panel'}" >{{$t('dashboard.panel.title')}}</div>
        </el-menu-item>
        <el-menu-item index="1-1">
          <div @click="jumpTo('metricPreview')" :class="{'menu-item-active' :activeIndex == 'metricPreview'}">{{$t('dashboard.metricPreview.title')}}</div>
        </el-menu-item>
      </el-submenu>

      <el-submenu index="2" popper-class="nz-submenu">
        <template slot="title">
          <div @click="jumpToProject(projectData[0])" :class ="activeIndex == 'project' ? 'menu-active' :''" >{{$t('overall.project')}}</div>
        </template>
        <template v-for="(item, index) in projectData">
          <el-menu-item :index="'2-' + index">
            <div @click="jumpToProject(item)" :class="{'menu-item-active' :(activeIndex == 'project' && activeItemIndex == item )}">
              <span>{{item.name}}</span>
              <div @click.stop="toEditProject(item)" class="menu-edit"><i style="color: inherit"
                                                                          class="el-icon-edit-outline"></i></div>
            </div>
          </el-menu-item>
        </template>
      </el-submenu>
      <el-submenu index="3" popper-class="nz-submenu">
        <template slot="title">
          <div @click="jumpTo('asset')" :class="{'menu-active' : activeIndex == 'asset'}">{{$t('overall.asset')}}</div>
        </template>
        <template v-for="(item, index) in assetData">
          <el-menu-item :index="'3-' + index">
            <div @click="jumpToAsset('asset',item.id)" :class="{'menu-item-active' : (activeIndex == 'asset' && activeItemIndex == item.id ) }">
              <span>{{item.name}}</span>
              <idc-config-box :post-idc="item" ref="idcConfigBox" placement="left" @after="getIDCOptionData" :button-class="'menu-edit'">
                <template v-slot:optionZone>
                  <div @click="closeAllPop">
                    <i class="el-icon-edit-outline" @click="getIDCOptionData(item.id)" style="color: inherit"></i>
                  </div>
                </template>
              </idc-config-box>
            </div>
          </el-menu-item>
        </template>
      </el-submenu>
      <el-submenu index="4-0" popper-class="nz-submenu">
        <template slot="title">
          <div @click="jumpTo('alertList')" :class ="activeIndex == 'alertList' ? 'menu-active' :''">{{$t('overall.alert')}}</div>
        </template>
        <el-menu-item index="4-1">
          <div @click="jumpTo('alertList')" :class ="activeIndex == 'alertList' ? 'menu-item-active' :''">{{$t('alert.alertList')}}</div>
        </el-menu-item>
        <el-menu-item index="4-2">
          <div @click="jumpTo('alertConfig')" :class ="activeIndex == 'alertConfig' ? 'menu-item-active' :''">{{$t('alert.alertConfig')}}</div>
        </el-menu-item>
      </el-submenu>
      <el-submenu index="5" popper-class="nz-submenu">
        <template slot="title">
          <div @click="jumpTo('account')" :class ="activeIndex == 'account' ? 'menu-active' :''">{{$t('overall.config')}}</div>
        </template>
        <el-menu-item index="5-0">
          <div @click="jumpTo('account')" :class="{'menu-item-active' :(activeIndex == 'account' )}">{{$t('config.account.account')}}</div>
        </el-menu-item>
        <el-menu-item index="5-1">
          <div @click="jumpTo('promServer')" :class="{'menu-item-active' :(activeIndex == 'promServer' )}">{{$t('config.promServer.promServerList')}}</div>
        </el-menu-item>
      </el-submenu>
      <el-submenu index="6" popper-class="nz-submenu">
        <template slot="title">
          <div>{{username}}<i class="el-icon-arrow-down"></i></div>
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
        activeIndex:'',
        activeItemIndex:'',
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
        this.activeIndex = data
        
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
        this.activeItemIndex = id
        this.jumpTo(data);
      },
      jumpToProject(p) {
        this.currentProject = p;
        this.$store.commit('setProject', p);
        this.activeItemIndex = p
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
      closeAllPop:function(){
        this.$refs.idcConfigBox.forEach((item)=>{
          item.show(false)
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

<style lang="scss">
  .header {
    background-image: linear-gradient(180deg, #565656 0%, #3C3C3C 100%);
    box-shadow: 0 2px 4px 0
  }
  .header .el-menu {
    background-color: transparent;
  }
  .header .el-menu--horizontal>.el-submenu .el-submenu__title .menu-active{
    border-bottom:$global-text-color-active solid 2px;
    border-radius: 2px;
    height: 22px;
    line-height: 16px;
    display: inline-block;
    font-size: 16px;
    margin: 0 auto ;
  }
  .header .el-menu--horizontal>.el-submenu .el-submenu__title i {
    color: inherit;
  }
  .el-submenu__title .el-icon-arrow-down {
    font-size: 14px;
  }
  .nz-submenu .el-menu--popup {
    border-radius: 0 0 2px 2px;
  }
  .header .el-menu--horizontal>.el-submenu .el-submenu__title {
    min-width: 120px;
    text-align: center; 
    color: $header-text-color;
    padding: 0;
  }
  .header .el-menu--horizontal>.el-submenu .el-submenu__title:hover {
    color: #444;
  }

  .el-menu.el-menu--horizontal {
    border-bottom: 0px;
  }

  .el-submenu__title .el-submenu__icon-arrow {
    display: none;
  }

  .el-menu--horizontal > .el-menu-item.is-active {
    border-bottom: 0px;
  }

/*  .el-menu--horizontal > .el-submenu.is-active .el-submenu__title,
  .el-menu--horizontal > .el-menu-item.is-active,
  .el-menu--horizontal .el-menu-item:not(.is-disabled):focus, .el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
    border-bottom: 0px;
    color: white;
  }*/
  .el-submenu.is-active .el-submenu__title{
    border-bottom-color: transparent !important;
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

  .nz-submenu.el-menu--horizontal .el-menu .el-menu-item:hover,.nz-submenu.el-menu--horizontal   {
    color: $global-text-color-active !important;
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
  .header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 60px;
    background-color: #232f3e;
    z-index: 510;
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
